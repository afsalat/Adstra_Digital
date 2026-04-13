"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToWords } from "to-words";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_BASE_URL from "@/utils/apiBase";
import "./CreateInvoice.css";

export default function CreateInvoice() {
  const [invoice, setInvoice] = useState({
    invoice_no: "",
    client: "",
    total_amount: "",
    total_in_words: "",
    status: "unpaid",
    items: [],
    proposal: "",
    discount_amount: 0,
    additional_fee: 0,
    tax_amount: 0,
  });

  const [clients, setClients] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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
      .catch((err) => console.error("Client Fetch Error:", err));
  }, [API_BASE]);

  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.rate || 0);
      const gst = parseFloat(item.gst || 0);
      const base = quantity * rate;
      const gstAmount = base * (gst / 100);
      return sum + base + gstAmount;
    }, 0);

    const discount = parseFloat(invoice.discount_amount || 0);
    const fee = parseFloat(invoice.additional_fee || 0);
    const tax = parseFloat(invoice.tax_amount || 0);

    const total = subtotal - discount + fee + tax;

    setInvoice((prev) => ({
      ...prev,
      total_amount: total.toFixed(2),
      total_in_words: toWords.convert(total > 0 ? total : 0),
    }));
  }, [invoice.items, invoice.discount_amount, invoice.additional_fee, invoice.tax_amount]);

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

  // Remove item
  const removeItem = (index) => {
    const items = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items });
  };

  // Submit invoice
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (invoice.items.length === 0) {
      alert("Please add at least one item before submitting.");
      return;
    }

    const formattedInvoice = {
      ...invoice,
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
      console.error("Invoice Submit Error:", err);
      console.error("Response Data:", err?.response?.data);
    }
  };

  // Handle client selection
  const handleClientChange = async (e) => {
    const clientId = e.target.value;
    setInvoice((prev) => ({ ...prev, client: clientId }));
    setSelectedProposalId("");
    setProposals([]);

    try {
      const res = await axios.get(`${API_BASE}/invoice/latests/${clientId}/`);
      setProposals(res.data);
    } catch (err) {
      console.error("Proposals Fetch Error:", err);
    }
  };

  // Derived value for preview modal — must be outside JSX
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
      total_amount: selectedProposal.total_amount,
      total_in_words: toWords.convert(selectedProposal.total_amount),
      items: (selectedProposal.services || []).map((item) => ({
        description: item.description || "",
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        gst: item.gst || 0,
      })),
    }));
  };

  // Fetch Next Invoice Number
  useEffect(() => {
    const fetchNextInvoiceNumber = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/invoice/next-number/`);
        if (response.data && response.data.next_invoice_number) {
          setInvoice((prev) => ({ ...prev, invoice_no: response.data.next_invoice_number }));
        }
      } catch (error) {
        console.error("Error fetching next invoice number:", error);
      }
    };
    fetchNextInvoiceNumber();
  }, []);

  return (
    <div className="invoice-create-wrapper min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-10 pt-28 px-4 sm:px-6 lg:px-8 font-sans">

      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center gap-4">
          <button
            onClick={() => router.push("/invoices/")}
            className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-medium px-4 py-2 hover:bg-slate-50/50 rounded-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Invoices
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="group relative px-6 py-2.5 rounded-xl bg-white text-indigo-600 font-semibold border border-indigo-100 shadow-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center overflow-hidden"
              onClick={() => setShowPreview(true)}
            >
              <div className="absolute inset-0 w-full h-full bg-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center z-10">
                <span className="mr-2 text-lg">&#128065;&#65039;</span> Preview
              </span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="group relative px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-400/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
            >
              <span className="relative z-10 flex items-center">
                Create Invoice
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto" style={{ marginTop: '100px' }}>
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

          {/* Header Section */}
          <div className="bg-slate-900 text-white px-8 py-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 left-0 -ml-4 -mt-4 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
                <p className="text-slate-400 mt-1 text-sm font-light">
                  Adstra Digital &bull; The Sole of premium Digital Marketing Brand
                </p>
              </div>
              <div className="mt-4 md:mt-0 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">Date</span>
                <span className="text-lg font-medium">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Top Row: Invoice No & Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Invoice No */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Invoice No
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 pl-10 font-medium"
                      style={{ paddingLeft: '2.5rem' }}
                      value={invoice.invoice_no || ''}
                      placeholder="Loading..."
                      readOnly
                    />
                  </div>
                </div>

                {/* Client Select */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 pr-10 appearance-none shadow-sm transition-all hover:border-indigo-300"
                      value={invoice.client}
                      onChange={handleClientChange}
                      required
                    >
                      <option value="">Select a Client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company_name ? `${c.company_name} (${c.name})` : c.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Proposal Select */}
              {proposals.length > 0 && (
                <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100 animate-fade-in-down">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-900">Import from Proposal</h4>
                      <p className="text-xs text-indigo-700 mt-1">Select a proposal to auto-fill items.</p>
                    </div>
                    <div className="w-full md:w-1/2 relative">
                      <select
                        className="w-full bg-white border border-indigo-200 text-indigo-900 text-sm rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 shadow-sm"
                        value={selectedProposalId}
                        onChange={handleProposalChange}
                      >
                        <option value="">-- Choose Proposal --</option>
                        {proposals.map((p) => {
                          const company = p.company_name || (p.client && p.client.company_name) || "No Company";
                          const clientName = p.client ? p.client.name : "No Client";
                          const price = p.total_amount ? Number(p.total_amount).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "₹0.00";
                          return (
                            <option key={p.id} value={p.id}>
                              {`${company} - ${clientName} (#${p.id}) - ${price}`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Middle Row: Status & Words */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Total In Words */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Amount in Words
                  </label>
                  <input
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm transition-all"
                    value={invoice.total_in_words}
                    onChange={(e) =>
                      setInvoice({ ...invoice, total_in_words: e.target.value })
                    }
                    placeholder="Zero Rupees Only"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Status
                  </label>
                  <div className="flex gap-3 items-stretch mt-2">
                    <label className="relative flex-1 cursor-pointer flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all has-[:checked]:bg-red-50 has-[:checked]:border-red-200 has-[:checked]:shadow-sm text-center">
                      <input type="radio" name="status" value="unpaid"
                        checked={invoice.status === 'unpaid'}
                        onChange={(e) => setInvoice({ ...invoice, status: e.target.value })}
                        className="h-4 w-4 text-red-600 border-slate-300 focus:ring-0 focus:outline-none" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Unpaid</span>
                    </label>
                    <label className="relative flex-1 cursor-pointer flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all has-[:checked]:bg-yellow-50 has-[:checked]:border-yellow-200 has-[:checked]:shadow-sm text-center">
                      <input type="radio" name="status" value="partially_paid"
                        checked={invoice.status === 'partially_paid'}
                        onChange={(e) => setInvoice({ ...invoice, status: e.target.value })}
                        className="h-4 w-4 text-yellow-600 border-slate-300 focus:ring-0 focus:outline-none" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Partially Paid</span>
                    </label>
                    <label className="relative flex-1 cursor-pointer flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all has-[:checked]:bg-green-50 has-[:checked]:border-green-200 has-[:checked]:shadow-sm text-center">
                      <input type="radio" name="status" value="paid"
                        checked={invoice.status === 'paid'}
                        onChange={(e) => setInvoice({ ...invoice, status: e.target.value })}
                        className="h-4 w-4 text-green-600 border-slate-300 focus:ring-0 focus:outline-none" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Paid</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Services & Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Item
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Description</th>
                        <th className="px-3 py-4 font-semibold w-32 text-center">Qty</th>
                        <th className="px-3 py-4 font-semibold w-40 text-center">Rate</th>
                        <th className="px-3 py-4 font-semibold w-32 text-center">GST %</th>
                        <th className="px-6 py-4 font-semibold text-center w-40">Amount</th>
                        <th className="px-2 py-4 font-semibold w-16 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {invoice.items.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-slate-400 italic">
                            No items added yet. Click "Add Item" to start.
                          </td>
                        </tr>
                      ) : (
                        invoice.items.map((item, i) => {
                          const rate = Number(item.rate) || 0;
                          const quantity = Number(item.quantity) || 0;
                          const gst = Number(item.gst) || 0;
                          const base = rate * quantity;
                          const gstAmount = (base * gst) / 100;
                          const total = base + gstAmount;

                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-4 py-3">
                                <input
                                  className="w-full bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 text-slate-900 placeholder-slate-400 transition-all font-medium"
                                  value={item.description}
                                  placeholder="Item description"
                                  onChange={(e) => updateItem(i, "description", e.target.value)}
                                />
                              </td>
                              <td className="px-2 py-3">
                                <input
                                  type="number"
                                  className="w-full bg-slate-50 border border-slate-200 rounded text-center text-slate-700 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                                />
                              </td>
                              <td className="px-2 py-3">
                                <input
                                  type="number"
                                  className="w-full bg-slate-50 border border-slate-200 rounded text-center text-slate-700 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                  value={item.rate}
                                  onChange={(e) => updateItem(i, "rate", e.target.value)}
                                />
                              </td>
                              <td className="px-2 py-3">
                                <input
                                  type="number"
                                  className={`w-full bg-slate-50 border border-slate-200 rounded text-center text-slate-700 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${!item.isNew && 'bg-slate-100 cursor-not-allowed text-slate-400'}`}
                                  value={item.gst}
                                  readOnly={!item.isNew}
                                  onChange={(e) => {
                                    if (item.isNew) updateItem(i, "gst", e.target.value);
                                  }}
                                />
                              </td>
                              <td className="px-6 py-3 text-center font-medium text-slate-900">
                                &#8377;{total.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeItem(i)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                  title="Remove Item"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Adjustments Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Discount Amount (-)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm transition-all"
                    value={invoice.discount_amount}
                    onChange={(e) => setInvoice({ ...invoice, discount_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Additional Fee (+)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm transition-all"
                    value={invoice.additional_fee}
                    onChange={(e) => setInvoice({ ...invoice, additional_fee: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Other Taxes / Adjustments (+)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm transition-all"
                    value={invoice.tax_amount}
                    onChange={(e) => setInvoice({ ...invoice, tax_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Footer / Total */}
              <div className="flex flex-col items-end gap-2 border-t border-slate-100 pt-6">
                <div className="flex flex-col items-end gap-1 text-sm text-slate-500 mb-2">
                  <div className="flex justify-between w-48">
                    <span>Subtotal:</span>
                    <span>&#8377; {(invoice.items.reduce((sum, item) => {
                      const base = (item.rate || 0) * (item.quantity || 0);
                      return sum + base + (base * (item.gst || 0) / 100);
                    }, 0)).toFixed(2)}</span>
                  </div>
                  {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between w-48 text-red-500">
                      <span>Discount:</span>
                      <span>- &#8377; {Number(invoice.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(invoice.additional_fee) > 0 && (
                    <div className="flex justify-between w-48 text-indigo-600">
                      <span>Fee:</span>
                      <span>+ &#8377; {Number(invoice.additional_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(invoice.tax_amount) > 0 && (
                    <div className="flex justify-between w-48 text-indigo-600">
                      <span>Tax/Adj:</span>
                      <span>+ &#8377; {Number(invoice.tax_amount).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Grand Total</div>
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  &#8377; {Number(invoice.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 italic text-slate-400 text-xs text-center no-print">
                Confirm details before saving.
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ===== Modal Preview Popup ===== */}
      {showPreview && (
        <div className="invoice-preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="invoice-preview-modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header Bar */}
            <div className="preview-header">
              <h5 className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded text-xs font-bold uppercase tracking-wider">Preview</span>
                Invoice
              </h5>
              <button className="close-btn hover:rotate-90 transition-transform duration-300" onClick={() => setShowPreview(false)}>
                &#10005;
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="preview-body bg-slate-50/50">

              <div className="bg-white p-8 shadow-sm border border-slate-200 min-h-[800px] relative">
                {/* Company Banner with Logo — matches invoice view page */}
                <div style={{
                  backgroundColor: "#136270",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "20px",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: "relative",
                  marginBottom: "16px",
                }}>
                  <span>ADSTRA DIGITAL</span>
                  {/* Logo box — absolutely positioned so it overflows the banner */}
                  <div className="rounded shadow-md" style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "80px",
                    height: "80px",
                    backgroundColor: "white",
                    padding: "5px",
                    border: "1px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <img
                      src="/assets/logo_gellery.png"
                      alt="Adstra Logo"
                      style={{ height: "100%", width: "100%", objectFit: "contain" }}
                    />
                  </div>
                </div>

                {/* INVOICE Title */}
                <div style={{ textAlign: "right", fontSize: "2rem", fontWeight: "bold", marginBottom: "24px", color: "#cbd5e1", letterSpacing: "0.1em" }}>
                  INVOICE
                </div>

                {/* Client Info + Invoice Meta */}
                <div className="row px-1 mb-3">
                  <div className="col-md-5">
                    <h6 className="fw-bold text-uppercase text-xs text-slate-500 mb-2 tracking-wider">Bill To</h6>
                    <p style={{ fontSize: "14px", lineHeight: "1.8" }} className="text-slate-800">
                      {selectedClient?.name || <span className="text-slate-400 italic">Select a client</span>}<br />
                      {selectedClient?.company_name && <>{selectedClient.company_name}<br /></>}
                      {selectedClient?.address && <>{selectedClient.address}<br /></>}
                      {selectedClient?.contact && <>&#128222; {selectedClient.contact}<br /></>}
                      {selectedClient?.email && <>&#9993;&#65039; {selectedClient.email}<br /></>}
                      {selectedClient?.gstin && <>GSTIN: {selectedClient.gstin}<br /></>}
                      {selectedClient?.lut && <>LUT: {selectedClient.lut}<br /></>}
                    </p>
                  </div>
                  <div className="col-md-7">
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <th className="text-end text-slate-500 text-sm font-semibold pr-3">Invoice No:</th>
                          <td style={{ fontSize: "0.85rem" }} className="text-end font-semibold text-slate-800">
                            {invoice.invoice_no || <span className="text-slate-400 italic">Auto-Generated</span>}
                          </td>
                        </tr>
                        <tr>
                          <th className="text-end text-slate-500 text-sm font-semibold pr-3">Date:</th>
                          <td className="text-end font-semibold text-slate-800">
                            {new Date().toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                        <tr>
                          <th className="text-end text-slate-500 text-sm font-semibold pr-3">Due Date:</th>
                          <td className="text-end font-semibold text-slate-800">Upon Delivery</td>
                        </tr>
                        <tr>
                          <th className="text-end text-slate-500 text-sm font-semibold pr-3">Payment status:</th>
                          <td className="text-capitalize text-end font-semibold">
                            <span className={`px-2 py-0.5 rounded text-xs ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {invoice.status?.replace("_", " ") || "Unpaid"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mt-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-y border-slate-200">
                        <th className="py-2 px-3 text-left text-xs font-semibold text-slate-600 uppercase">Description</th>
                        <th className="py-2 px-3 text-center text-xs font-semibold text-slate-600 uppercase w-16">Qty</th>
                        <th className="py-2 px-3 text-end text-xs font-semibold text-slate-600 uppercase w-24">Rate</th>
                        <th className="py-2 px-3 text-end text-xs font-semibold text-slate-600 uppercase w-24">GST</th>
                        <th className="py-2 px-3 text-end text-xs font-semibold text-slate-600 uppercase w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-slate-400 italic text-sm">No items.</td></tr>
                      ) : (
                        invoice.items.map((item, i) => {
                          const rate = Number(item.rate) || 0;
                          const qty = Number(item.quantity) || 0;
                          const gst = Number(item.gst) || 0;
                          const base = rate * qty;
                          const gstAmt = (base * gst) / 100;
                          const total = base + gstAmt;
                          return (
                            <tr key={i} className="border-b border-slate-100">
                              <td className="py-3 px-3 text-sm text-slate-700">{item.description}</td>
                              <td className="py-3 px-3 text-sm text-slate-700 text-center">{qty}</td>
                              <td className="py-3 px-3 text-sm text-slate-700 text-end">&#8377;{rate.toFixed(2)}</td>
                              <td className="py-3 px-3 text-sm text-slate-700 text-end">
                                &#8377;{gstAmt.toFixed(2)}{" "}
                              </td>
                              <td className="py-3 px-3 text-sm text-slate-900 font-medium text-end">&#8377;{total.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      )}

                      {/* Subtotal Row */}
                      <tr>
                        <td colSpan="4" className="pt-4 text-end text-xs font-semibold text-slate-500 uppercase">Subtotal</td>
                        <td className="pt-4 text-end text-sm font-semibold text-slate-800 tracking-wide">
                          &#8377;{(invoice.items.reduce((sum, item) => {
                            const base = (item.rate || 0) * (item.quantity || 0);
                            return sum + base + (base * (item.gst || 0) / 100);
                          }, 0)).toFixed(2)}
                        </td>
                      </tr>

                      {/* Discount Row */}
                      {Number(invoice.discount_amount) > 0 && (
                        <tr>
                          <td colSpan="4" className="py-1 text-end text-xs font-semibold text-slate-500 uppercase">Discount (-)</td>
                          <td className="py-1 text-end text-sm font-semibold text-red-600 tracking-wide">
                            - &#8377;{Number(invoice.discount_amount).toFixed(2)}
                          </td>
                        </tr>
                      )}

                      {/* Fee Row */}
                      {Number(invoice.additional_fee) > 0 && (
                        <tr>
                          <td colSpan="4" className="py-1 text-end text-xs font-semibold text-slate-500 uppercase">Additional Fee (+)</td>
                          <td className="py-1 text-end text-sm font-semibold text-slate-800 tracking-wide">
                            + &#8377;{Number(invoice.additional_fee).toFixed(2)}
                          </td>
                        </tr>
                      )}

                      {/* Tax Row */}
                      {Number(invoice.tax_amount) > 0 && (
                        <tr>
                          <td colSpan="4" className="py-1 text-end text-xs font-semibold text-slate-500 uppercase">Tax / Adjustments (+)</td>
                          <td className="py-1 text-end text-sm font-semibold text-slate-800 tracking-wide">
                            + &#8377;{Number(invoice.tax_amount).toFixed(2)}
                          </td>
                        </tr>
                      )}

                      {/* Final Total Row */}
                      <tr>
                        <td colSpan="4" className="pt-2 text-end text-sm font-bold text-indigo-900 uppercase tracking-wider">Grand Total</td>
                        <td className="pt-2 text-end text-lg font-bold text-slate-900 border-t-2 border-slate-800">
                          &#8377;{Number(invoice.total_amount).toFixed(2)}
                        </td>
                      </tr>
                      {invoice.total_in_words && (
                        <tr>
                          <td colSpan="5" className="pt-1 text-end text-[10px] text-slate-500 italic font-medium">
                            (In Words): {invoice.total_in_words}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bank Details */}
                <div className="mt-8 bg-slate-50 p-4 rounded border border-slate-200 text-start">
                  <b className="fw-bold text-sm text-slate-800 block mb-1">Bank Details</b>
                  <p className="mb-0 text-xs text-slate-600">HDFC Bank, Sulthan Bathery Branch, Wayanad, Kerala</p>
                  <p className="mb-0 text-xs text-slate-600">Account Number: 50200091927202</p>
                  <p className="mb-0 text-xs text-slate-600">IFSC Code: HDFC0001595</p>
                </div>

                {/* Terms & Conditions */}
                <div
                  className="mt-3 p-3 border border-slate-300 rounded bg-white"
                  style={{ fontSize: "10px", lineHeight: "1.4", fontWeight: "500" }}
                >
                  <strong className="text-slate-800">Terms &amp; Conditions:</strong>
                  <ul className="mb-0 mt-1 pl-4 list-disc text-slate-600">
                    <li>Advance Payment: 40% of the total project value is payable in advance to initiate work.</li>
                    <li>Balance Payment: Remaining 60% is due upon final delivery of the agreed scope.</li>
                    <li>Taxes: Applicable taxes (GST or others) will be charged extra, as per prevailing rates.</li>
                    <li>Disclaimer: Errors and omissions may be expected; any discrepancies will be addressed promptly upon notification.</li>
                  </ul>
                </div>

                {/* Company Footer */}
                <div className="row mt-8 pt-4 border-t border-slate-100">
                  <div className="col-md-6 text-start">
                    <p className="fw-bold mb-1 text-sm text-slate-800">Adstra Digital</p>
                    <p className="text-slate-500" style={{ fontSize: "11px" }}>
                      Husna Complex, 1st Floor<br />Nadakkavu, Kozhikode 673011
                    </p>
                    <p className="text-slate-600 mt-2" style={{ fontSize: "11px", fontWeight: "bold" }}>
                      Elevating brands. Humanizing technology.
                    </p>
                  </div>
                  <div className="col-md-6 text-end">
                    <p className="fw-bold mb-1 text-xs text-slate-700">
                      <span className="text-slate-400 font-normal">GSTIN:</span> 32CMJPK3035L1Z2
                    </p>
                    <p className="fw-bold text-xs text-slate-700">
                      <span className="text-slate-400 font-normal">LUT No:</span> AD320625010204R
                    </p>
                  </div>
                </div>

                <div className="text-slate-300 text-center mt-6 uppercase tracking-widest" style={{ fontSize: "10px" }}>
                  Computer Generated Invoice
                </div>
              </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="preview-footer">
              <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 transition-colors text-sm font-medium" onClick={() => setShowPreview(false)}>
                Back to Edit
              </button>
              <button className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 transition-all text-sm font-bold flex items-center" onClick={handleSubmit}>
                <span className="mr-2">&#10003;</span> Confirm & Create
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
