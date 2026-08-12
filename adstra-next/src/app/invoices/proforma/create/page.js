"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToWords } from "to-words";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_BASE_URL from "@/utils/apiBase";
import SearchableClientSelect from "@/components/common/SearchableClientSelect";
import { useModal } from "@/Context/ModalContext";
import "../../create/CreateInvoice.css";

export default function CreateProforma() {
  const { showAlert } = useModal();
  const [invoice, setInvoice] = useState({
    invoice_no: "",
    client: "",
    total_amount: "",
    total_in_words: "",
    status: "unpaid",
    items: [],
    proposal: "",
    additional_fee: 0,
    additional_charges: [{ label: "", amount: 0, charge_type: "amount" }],
    tax_amount: 0,
    discount_amount: 0,
    discount_label: "Discount",
    advance_amount: 0,
    reference: "",
    is_proforma: true, // Hardcoded for this page
    date: new Date().toISOString().split('T')[0],
  });

  const [clients, setClients] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const router = useRouter();
  const API_BASE = API_BASE_URL;

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
    },
  });

  // Fetch clients
  useEffect(() => {
    axios
      .get(`${API_BASE}/proposal/clients/`)
      .then((res) => setClients(res.data))
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Client Fetch Error:", err);
        }
      });

    // Fetch company settings with cache-busting
    axios.get(`${API_BASE}/settings/?_=${Date.now()}`)
      .then((res) => { if (res.data) setSettings(res.data); })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Settings Fetch Error:", err);
        }
      });
  }, [API_BASE]);

  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.rate || 0);
      // For Proforma, we ensure GST is always 0 even if it somehow comes from a proposal
      const gst = 0;
      const base = quantity * rate;
      const gstAmount = base * (gst / 100);
      return sum + base + gstAmount;
    }, 0);

    const charges_total = (invoice.additional_charges || []).reduce((sum, c) => {
      const val = parseFloat(c.amount || 0);
      if (c.charge_type === 'percentage') {
        return sum + (subtotal * (val / 100));
      }
      return sum + val;
    }, 0);

    // For proforma, we don't show tax_amount (Other taxes) in total calculation to keep it simple as requested
    const tax = 0;
    const disc = parseFloat(invoice.discount_amount || 0);

    const total = subtotal + charges_total + tax - disc;

    setInvoice((prev) => ({
      ...prev,
      additional_fee: charges_total,
      total_amount: total.toFixed(2),
      total_in_words: toWords.convert(total > 0 ? total : 0),
    }));
  }, [invoice.items, invoice.additional_charges, invoice.discount_amount, invoice.advance_amount]);

  // Add new item row
  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { description: "", quantity: 1, rate: 0, gst: 0, isNew: true },
      ],
    });
  };

  // Update item
  const updateItem = (index, field, value) => {
    const items = [...invoice.items];
    items[index][field] = value;
    setInvoice({ ...invoice, items });
  };

  // Add additional charge
  const addAdditionalCharge = () => {
    setInvoice({
      ...invoice,
      additional_charges: [
        ...invoice.additional_charges,
        { label: "", amount: 0, charge_type: "amount" },
      ],
    });
  };

  // Update additional charge
  const updateAdditionalCharge = (index, field, value) => {
    const charges = [...invoice.additional_charges];
    charges[index][field] = value;
    setInvoice({ ...invoice, additional_charges: charges });
  };

  // Remove additional charge
  const removeAdditionalCharge = (index) => {
    const charges = invoice.additional_charges.filter((_, i) => i !== index);
    setInvoice({ ...invoice, additional_charges: charges });
  };

  // Remove item
  const removeItem = (index) => {
    const items = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items });
  };

  // Submit proforma
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (invoice.items.length === 0) {
      showAlert("Required Fields", "Please add at least one item before submitting.", "warning");
      return;
    }

    // Filter out empty/unused additional charges before submitting
    const validCharges = (invoice.additional_charges || []).filter(
      (c) => c.label && c.label.trim() !== "" && parseFloat(c.amount || 0) !== 0
    );

    const formattedInvoice = {
      ...invoice,
      additional_charges: validCharges,
      is_proforma: true,
      due_date: invoice.due_date
        ? new Date(invoice.due_date).toISOString().split("T")[0]
        : null,
    };

    try {
      const res = await axios.post(`${API_BASE}/invoice/create/`, formattedInvoice);
      const newInvoiceNo = res.data.invoice_no;
      const encoded = encodeURIComponent(newInvoiceNo);
      router.push(`/invoices/result/?invoiceID=${encoded}`);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Proforma Submit Error:", err);
      }
    }
  };

  // Handle client selection
  const handleClientChange = async (e) => {
    const clientId = e.target.value;
    setInvoice((prev) => ({ ...prev, client: clientId }));
    setSelectedProposalId("");
    setProposals([]);

    if (!clientId) return;

    try {
      const res = await axios.get(`${API_BASE}/invoice/latests/${clientId}/`);
      setProposals(res.data);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Proposals Fetch Error:", err);
      }
    }
  };

  // Derived value for preview modal
  const selectedClient = clients.find((c) => String(c.id) === String(invoice.client));

  // Handle proposal selection
  const handleProposalChange = (e) => {
    const proposalId = e.target.value;
    setSelectedProposalId(proposalId);

    const selectedProposal = proposals.find((p) => p.id == proposalId);
    if (!selectedProposal) return;

    setInvoice((prev) => ({
      ...prev,
      proposal: proposalId,
      items: (selectedProposal.services || []).map((item) => ({
        description: item.description || "",
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        gst: 0, // Reset GST for proforma
      })),
    }));
  };

  // Fetch Next Proforma Number with cache-busting
  useEffect(() => {
    const fetchNextInvoiceNumber = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/invoice/next-number/?is_proforma=true&_=${Date.now()}`);
        if (response.data && response.data.next_invoice_number) {
          setInvoice((prev) => ({ ...prev, invoice_no: response.data.next_invoice_number }));
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Error fetching next proforma number:", error);
        }
      }
    };
    fetchNextInvoiceNumber();
  }, []);

  return (
    <div className="invoice-create-wrapper min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-10 pt-28 px-4 sm:px-6 lg:px-8 font-sans">

      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center gap-4">
          <button
            onClick={() => router.push("/invoices/proforma/")}
            className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium px-4 py-2 hover:bg-slate-50/50 rounded-xl"
          >
            ← Back to Proforma Invoices
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="group relative px-6 py-2.5 rounded-xl bg-white text-indigo-600 font-semibold border border-indigo-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center overflow-hidden"
              onClick={() => setShowPreview(true)}
            >
              <span className="relative flex items-center z-10">
                <span className="mr-2 text-lg">&#128065;&#65039;</span> Preview
              </span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="group relative px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
            >
              Create Proforma
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{ marginTop: '100px' }}>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 text-white px-8 py-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 left-0 -ml-4 -mt-4 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {isEmergencyMode ? "Create Emergency Proforma" : "Create Proforma Invoice"}
                </h2>
                <p className="text-slate-400 mt-1 text-sm font-light">
                  Adstra Digital &bull; The Sole of premium Digital Marketing Brand
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-md shadow-inner transition-all duration-500">
                  <div className="flex flex-col items-end">
                    <span className={`text-xs font-extrabold uppercase tracking-widest transition-colors duration-300 ${isEmergencyMode ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-slate-400'}`}>
                      Emergency Mode
                    </span>
                    <span className={`text-[10px] font-medium transition-colors duration-300 ${isEmergencyMode ? 'text-red-300/80' : 'text-slate-500'}`}>
                      {isEmergencyMode ? 'Bypassing Proposal' : 'Standard Flow'}
                    </span>
                  </div>
                  <button
                    type="button"
                    style={{ borderRadius: '9999px' }}
                    onClick={() => {
                      const newMode = !isEmergencyMode;
                      setIsEmergencyMode(newMode);
                      if (newMode) {
                        setInvoice((prev) => ({ ...prev, proposal: "" }));
                        setSelectedProposalId("");
                      }
                    }}
                    className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer !rounded-full border-2 border-transparent transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                      isEmergencyMode 
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)]' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <span className="sr-only">Toggle Emergency Mode</span>
                    <span
                      style={{ borderRadius: '9999px' }}
                      className={`pointer-events-none relative inline-block h-7 w-7 transform !rounded-full bg-white shadow-md ring-0 transition-transform duration-500 ease-in-out ${
                        isEmergencyMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    >
                      <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isEmergencyMode ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="w-2.5 h-2.5 bg-red-500 !rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" style={{ borderRadius: '9999px' }}></span>
                      </span>
                    </span>
                  </button>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 min-w-[150px] text-center flex flex-col items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">Date</span>
                  <input 
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                    className="bg-transparent text-white border-none focus:ring-0 text-lg font-medium px-2 cursor-pointer w-full text-center outline-none appearance-none"
                    style={{ 
                      colorScheme: 'dark',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Proforma No</label>
                  <input className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-3 font-medium" value={invoice.invoice_no} readOnly />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Reference / PO No</label>
                  <input className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-3 shadow-sm hover:border-indigo-300 font-medium" value={invoice.reference} onChange={(e) => setInvoice({ ...invoice, reference: e.target.value })} placeholder="Optional Ref" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Client <span className="text-red-500">*</span></label>
                  <SearchableClientSelect
                    clients={clients}
                    value={invoice.client}
                    onChange={handleClientChange}
                    placeholder="Select a Client..."
                  />
                </div>
              </div>

              {!isEmergencyMode && invoice.client && (
                proposals.length > 0 ? (
                  <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="md:w-1/2">
                        <h4 className="text-sm font-semibold text-indigo-900">Import Proposal</h4>
                        <p className="text-xs text-indigo-700 mt-1">Select a proposal to auto-fill items.</p>
                      </div>
                      <div className="w-full md:w-1/2">
                        <select className="w-full bg-white border border-indigo-200 text-indigo-900 text-sm rounded-md p-2.5 shadow-sm transition-all" value={selectedProposalId} onChange={handleProposalChange}>
                          <option value="">-- Choose Proposal --</option>
                          {proposals.map((p) => (
                            <option key={p.id} value={p.id}>{p.proposal_no || p.id} - {p.purpose}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-sm">
                    No proposals found for this client. You can still create a direct proforma below.
                  </div>
                )
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Amount in Words</label>
                  <input className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-3 shadow-sm" value={invoice.total_in_words} readOnly />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
                  <div className="flex gap-3 mt-2">
                    {["unpaid", "partially_paid", "paid"].map(status => (
                      <label key={status} className={`flex-1 cursor-pointer p-2 rounded-lg border text-center transition-all ${invoice.status === status ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-white border-slate-200'}`}>
                        <input type="radio" value={status} checked={invoice.status === status} onChange={(e) => setInvoice({...invoice, status: e.target.value})} className="hidden" />
                        <span className="text-xs uppercase tracking-wide">{status.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Items (GST Removed for Proforma)</h3>
                  <button type="button" onClick={addItem} className="text-sm px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium transition-colors">+ Add Item</button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold border-b">
                      <tr>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-3 py-4 text-center w-32">Qty</th>
                        <th className="px-3 py-4 text-center w-40">Rate</th>
                        <th className="px-6 py-4 text-center w-40">Amount</th>
                        <th className="px-2 py-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y">
                      {invoice.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <textarea 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 transition-all font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none overflow-hidden min-h-[45px]" 
                              value={item.description} 
                              placeholder="Service description" 
                              rows={1}
                              onChange={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = (e.target.scrollHeight) + 'px';
                                updateItem(i, "description", e.target.value);
                              }} 
                            />
                          </td>
                          <td className="px-2 py-3"><input type="number" className="w-full bg-slate-50 border rounded text-center py-2" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} /></td>
                          <td className="px-2 py-3"><input type="number" className="w-full bg-slate-50 border rounded text-center py-2" value={item.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} /></td>
                          <td className="px-6 py-3 text-center font-medium">₹{(Number(item.rate || 0) * Number(item.quantity || 0)).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <button type="button" onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="md:col-span-1 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Additional Charges (+)</label>
                    <button
                      type="button"
                      onClick={addAdditionalCharge}
                      className="text-[10px] px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 font-bold transition-colors"
                    >
                      + ADD CHARGE
                    </button>
                  </div>
                  {invoice.additional_charges.map((charge, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center animate-fade-in mb-2">
                      <input
                        className="col-span-5 sm:col-span-5 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={charge.label}
                        onChange={(e) => updateAdditionalCharge(idx, "label", e.target.value)}
                        placeholder="Label"
                      />
                      <select
                        className="col-span-4 sm:col-span-3 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={charge.charge_type || 'amount'}
                        onChange={(e) => updateAdditionalCharge(idx, "charge_type", e.target.value)}
                      >
                        <option value="amount">₹ Amount</option>
                        <option value="percentage">% Percent</option>
                      </select>
                      <input
                        type="number"
                        className="col-span-3 sm:col-span-3 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 text-center focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={charge.amount}
                        onChange={(e) => updateAdditionalCharge(idx, "amount", e.target.value)}
                        placeholder={charge.charge_type === 'percentage' ? "0%" : "0"}
                      />
                      {invoice.additional_charges.length > 1 && (
                        <button type="button" onClick={() => removeAdditionalCharge(idx)} className="col-span-12 sm:col-span-1 flex justify-center text-slate-400 hover:text-red-500">
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Discount Amount (-)</label>
                  <div className="flex gap-2">
                    <input type="text" className="w-1/2 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-3" value={invoice.discount_label} onChange={(e) => setInvoice({ ...invoice, discount_label: e.target.value })} placeholder="Discount Label" />
                    <input type="number" className="w-1/2 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-3" value={invoice.discount_amount} onChange={(e) => setInvoice({ ...invoice, discount_amount: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Advance Payment (-)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={invoice.advance_amount || ""}
                    onChange={(e) => setInvoice({ ...invoice, advance_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex flex-col items-end pt-6 border-t">
                <div className="flex flex-col items-end gap-1 text-sm text-slate-500 mb-4">
                  <div className="flex justify-between w-64">
                    <span>Subtotal:</span>
                    <span>₹ {invoice.items.reduce((sum, item) => sum + (Number(item.rate || 0) * Number(item.quantity || 0)), 0).toFixed(2)}</span>
                  </div>
                  {invoice.additional_charges.map((charge, idx) => {
                    const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.rate || 0) * Number(item.quantity || 0)), 0);
                    const chargeAmt = charge.charge_type === 'percentage'
                      ? (subtotal * (parseFloat(charge.amount || 0) / 100))
                      : parseFloat(charge.amount || 0);
                    
                    return charge.amount > 0 && (
                      <div key={idx} className="flex justify-between w-64 text-indigo-600">
                        <span>{charge.label || 'Additional Charge'} {charge.charge_type === 'percentage' ? `(${charge.amount}%)` : ''}:</span>
                        <span>+ ₹ {chargeAmt.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Grand Total</div>
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">₹ {Number(invoice.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                {Number(invoice.advance_amount) > 0 && (
                  <div className="flex flex-col items-end mt-2 pt-2 border-t border-slate-100 w-64">
                    <div className="flex justify-between w-full text-sm text-slate-500">
                      <span>Advance Paid:</span>
                      <span>- ₹ {Number(invoice.advance_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-full text-lg font-bold text-indigo-600 mt-1">
                      <span>Balance Due:</span>
                      <span>₹ {(Number(invoice.total_amount) - Number(invoice.advance_amount)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPreview(false)}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg">Proforma Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-2xl">&times;</button>
            </div>

            {/* Boxed GST Style - Matching InvoicePreview */}
            <div style={{ border: '2px solid black', fontFamily: 'Arial, sans-serif', color: 'black', background: 'white' }}>
              {/* Top Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid black', fontSize: '10px', fontWeight: 'bold' }}>
                <span>Page No. 1 of 1</span>
                <span style={{ fontSize: '22px', letterSpacing: '4px', fontWeight: '900' }}>PROFORMA INVOICE</span>
                <span>Original Copy</span>
              </div>

              {/* Row 1: Logo and Invoice Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid black' }}>
                <div style={{ padding: '12px', borderRight: '1px solid black', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/logo_new-01.png" alt="Adstra Logo" style={{ maxWidth: '220px', height: 'auto' }} />
                </div>
                <div style={{ padding: '8px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px' }}>Proforma Details:</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 0', color: '#666' }}>Proforma No</td>
                        <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice.invoice_no}</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 0', color: '#666' }}>Date</td>
                        <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice?.date ? new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
                      </tr>
                      {invoice.reference && (
                        <tr>
                          <td style={{ padding: '2px 0', color: '#666' }}>Reference</td>
                          <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>{invoice.reference}</span></td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: '2px 0', color: '#666' }}>Place</td>
                        <td style={{ padding: '2px 0' }}>: <span style={{ fontWeight: 'bold' }}>Kerala</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 2: From & To */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid black' }}>
                <div style={{ padding: '8px', borderRight: '1px solid black', fontSize: '10px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>From:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{settings?.name || "Adstra Digital"}</div>
                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '8px' }}>ISO 9001:2015 & IAF Certified</div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {(settings?.address || "Husna Complex, 1st Floor, Nadakkavu, Kozhikode, Kerala - 673011").replace(', Kozhikode', ',\nKozhikode')}
                  </div>
                  <div style={{ marginTop: '2px', wordBreak: 'break-word' }}>GSTIN: {settings?.gstin || "32CMJPK3035L1Z2"}</div>
                  <div style={{ wordBreak: 'break-word' }}>Mobile: {settings?.mobile || "+91 974 477 9574 | 956 756 8185"}</div>
                  <div style={{ wordBreak: 'break-word' }}>Email: {settings?.email || "info.adstradigital@gmail.com"}</div>
                </div>
                <div style={{ padding: '8px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>To:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>{selectedClient?.company_name || selectedClient?.name || "N/A"}</div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4', wordBreak: 'break-word' }}>{selectedClient?.address || "N/A"}</div>
                  <div style={{ marginTop: '2px', wordBreak: 'break-word' }}>GSTIN: {selectedClient?.gstin || "-"} | Mobile: {selectedClient?.contact || "-"}</div>
                  <div style={{ wordBreak: 'break-word' }}>Email: {selectedClient?.email || "-"}</div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ minHeight: '200px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid black', backgroundColor: '#f9fafb' }}>
                      <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '40px' }}>Sr.</th>
                      <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'left' }}>Item Description</th>
                      <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center', width: '60px' }}>Qty</th>
                      <th style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', width: '100px' }}>Rate (Rs)</th>
                      <th style={{ padding: '6px', textAlign: 'right', width: '100px' }}>Amount (Rs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, i) => {
                      const rate = Number(item.rate) || 0;
                      const qty = Number(item.quantity) || 0;
                      const total = rate * qty;
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{i + 1}</td>
                          <td style={{ borderRight: '1px solid black', padding: '6px', whiteSpace: 'pre-wrap' }}>{item.description}</td>
                          <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'center' }}>{qty.toFixed(2)}</td>
                          <td style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>{rate.toFixed(2)}</td>
                          <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                      <td colSpan="4" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Sub Total</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>
                        {invoice.items.reduce((sum, item) => sum + (Number(item.rate || 0) * Number(item.quantity || 0)), 0).toFixed(2)}
                      </td>
                    </tr>
                    {invoice.additional_charges.map((charge, idx) => {
                      const subtotal = invoice.items.reduce((sum, item) => sum + (Number(item.rate || 0) * Number(item.quantity || 0)), 0);
                      const chargeAmt = charge.charge_type === 'percentage'
                        ? (subtotal * (parseFloat(charge.amount || 0) / 100))
                        : parseFloat(charge.amount || 0);
                      
                      return charge.amount > 0 && (
                        <tr key={`charge-${idx}`} style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                          <td colSpan="4" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>
                            {charge.label || 'Additional Fee'} {charge.charge_type === 'percentage' ? `(${charge.amount}%)` : ''} (+)
                          </td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>{chargeAmt.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    {Number(invoice.discount_amount || 0) > 0 && (
                      <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                        <td colSpan="4" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>{invoice.discount_label || 'Discount'} (-)</td>
                        <td style={{ padding: '6px', textAlign: 'right', color: 'red' }}>- {Number(invoice.discount_amount).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '1px solid black', fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                      <td colSpan="4" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', fontSize: '13px' }}>Grand Total (Rs)</td>
                      <td style={{ padding: '6px', textAlign: 'right', fontSize: '14px' }}>{Number(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {Number(invoice.advance_amount || 0) > 0 && (
                      <>
                        <tr style={{ borderTop: '1px solid black', fontWeight: 'bold' }}>
                          <td colSpan="4" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right' }}>Advance Paid (-)</td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>- {Number(invoice.advance_amount).toFixed(2)}</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid black', fontWeight: 'bold', backgroundColor: '#eef2ff' }}>
                          <td colSpan="4" style={{ borderRight: '1px solid black', padding: '6px', textAlign: 'right', fontSize: '13px', color: '#4f46e5' }}>Balance Due</td>
                          <td style={{ padding: '6px', textAlign: 'right', fontSize: '14px', color: '#4f46e5' }}>{(Number(invoice.total_amount) - Number(invoice.advance_amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </>
                    )}
                  </tfoot>
                </table>
              </div>

              {/* Amount in words */}
              <div style={{ padding: '8px', borderTop: '1px solid black', borderBottom: '1px solid black', fontSize: '11px' }}>
                <span style={{ fontWeight: 'bold' }}>Rs.</span> {invoice.total_in_words}
              </div>

              {/* Footer Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', fontSize: '10px' }}>
                <div style={{ padding: '8px', borderRight: '1px solid black' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>Terms and Conditions:</div>
                  <ul style={{ paddingLeft: '15px', margin: '0', listStyleType: 'disc', fontSize: '9px' }}>
                    {settings?.terms_conditions ? (
                      settings.terms_conditions.split('\n').filter(t => t.trim()).map((term, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>{term.trim()}</li>
                      ))
                    ) : (
                      <>
                        <li>Payment should be made within the due date mentioned</li>
                        <li>Please quote invoice number in all communications</li>
                        <li>Taxes and charges as per applicable govt laws</li>
                      </>
                    )}
                  </ul>
                </div>
                <div style={{ padding: '8px', borderRight: '1px solid black' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>Official Bank Details:</div>
                  <div style={{ fontSize: '9px', lineHeight: '1.4' }}>
                    Acc No: <span style={{ fontWeight: 'bold' }}>{settings?.account_no || "50200091927202"}</span><br />
                    Bank: <span style={{ fontWeight: 'bold' }}>{settings?.bank_name || "HDFC Bank"}</span><br />
                    IFSC: <span style={{ fontWeight: 'bold' }}>{settings?.ifsc || "HDFC0001595"}</span><br />
                    Branch: <span style={{ fontWeight: 'bold' }}>{settings?.branch || "Sulthan Bathery"}</span>
                  </div>
                </div>
                <div style={{ padding: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minHeight: '100px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>For {settings?.name || "Adstra Digital"}</div>
                  <img src="/assets/seal.png" alt="Company Seal" style={{ width: '80px', height: 'auto', marginBottom: '4px', opacity: 0.85 }} />
                  <div style={{ borderTop: '1px solid black', width: '80%', padding: '4px 0', fontWeight: 'bold' }}>Authorised Signatory</div>
                </div>
              </div>

              {invoice?.is_proforma && (
                <div style={{ padding: '4px 12px', borderTop: '1px solid black', textAlign: 'center', fontSize: '8px', color: '#666', fontStyle: 'italic' }}>
                  This is a proforma invoice issued for reference and documentation purposes only. It is not a demand for payment but a preliminary statement of charges.
                </div>
              )}

              <div style={{ padding: '4px', borderTop: '1px solid black', textAlign: 'center', fontSize: '9px', color: '#666' }}>
                This is a computer-generated {invoice?.is_proforma ? "proforma invoice" : "invoice"}. No signature is required.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
