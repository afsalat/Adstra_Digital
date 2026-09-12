"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import SearchableClientSelect from "@/components/common/SearchableClientSelect";
import ReceiptTemplate from "@/components/ReceiptDetail/ReceiptTemplate";
import { useModal } from "@/Context/ModalContext";
import { useAuth } from "@/Context/AuthContext";
import "./create.css";

export default function CreateTransaction() {
  const { showAlert } = useModal();
  const { loading: authLoading, hasPermission } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);

  const [form, setForm] = useState({
    client: "",
    invoice: "",
    amount: "",
    purpose: "",
    payment_mode: "",
    reference_no: "",
    notes: "",
    balanceAmount: "",
  });

  const API_URL = API_BASE_URL;
  const canCreate = hasPermission("receipts.create");

  /* fetch clients and settings */
  useEffect(() => {
    if (authLoading || !canCreate) return;
    axios.get(`${API_URL}/proposal/clients/`)
      .then((res) => setClients(res.data))
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Client Fetch Error:", err);
        }
      });
    
    // Fetch company settings with cache-busting
    axios.get(`${API_URL}/settings/?_=${Date.now()}`)
      .then((res) => setSettings(res.data))
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Settings Fetch Error:", err);
        }
      });
  }, [API_URL, authLoading, canCreate]);

  /* fetch invoices when client changes */
  useEffect(() => {
    if (authLoading || !canCreate) return;
    if (form.client) {
      // Fetch invoices with cache-busting
      axios.get(`${API_URL}/invoice/invoice_list/${form.client}/?_=${Date.now()}`)
        .then((res) => setInvoices(res.data))
        .catch((err) => {
          if (process.env.NODE_ENV !== "production") {
            console.error("Invoice Fetch Error:", err);
          }
        });
    } else {
      setInvoices([]);
      setForm((prev) => ({ ...prev, invoice: "", balanceAmount: "" }));
      setTotalAmount(0);
      setSelectedInvoice(null);
    }
  }, [form.client, API_URL, authLoading, canCreate]);

  /* update balance when invoice changes */
  useEffect(() => {
    if (form.invoice) {
      const inv = invoices.find((i) => i.id === Number(form.invoice));
      if (inv) {
        setSelectedInvoice(inv);
        // Use balance_due if available, else fallback to total_amount
        const initialRem = inv.balance_due !== undefined ? Number(inv.balance_due) : Number(inv.total_amount);
        setTotalAmount(initialRem);
        setForm((prev) => ({ ...prev, amount: "", balanceAmount: initialRem.toFixed(2) }));
      }
    } else {
      setSelectedInvoice(null);
      setTotalAmount(0);
      setForm((prev) => ({ ...prev, amount: "", balanceAmount: "" }));
    }
  }, [form.invoice, invoices]);

  /* update balance when amount changes */
  useEffect(() => {
    const paid = parseFloat(form.amount) || 0;
    const balance = totalAmount - paid;
    setForm((prev) => ({ ...prev, balanceAmount: balance >= 0 ? balance.toFixed(2) : "0.00" }));
  }, [form.amount, totalAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        if (parseFloat(value) > totalAmount && totalAmount > 0) return;
      } else return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate) {
      showAlert("Permission Denied", "You do not have permission to create receipts.", "error");
      return;
    }
    setSubmitting(true);
    
    // Prepare payload with correct types
    const payload = {
      ...form,
      amount: parseFloat(form.amount) || 0,
      balanceAmount: parseFloat(form.balanceAmount) || 0,
      invoice: form.invoice ? Number(form.invoice) : null,
      client: Number(form.client)
    };

    try {
      await axios.post(`${API_URL}/transactions/list-create/`, payload);
      showAlert("Receipt Saved", "The transaction has been recorded successfully.", "success");
      router.push("/receipts/");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to save transaction:", err);
      }
      showAlert("Save Failed", "There was an error saving the transaction. Please check all required fields and your connection.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* derive client name for preview */
  const selectedClientObj = useMemo(() => {
    if (!form.client) return null;
    return clients.find((c) => c.id === Number(form.client)) || null;
  }, [form.client, clients]);

  const clientName = selectedClientObj?.name || "";

  /* today's date for preview */
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  /* ─── render ─── */
  if (!authLoading && !canCreate) {
    return (
      <div className="ct-page">
        <div className="ct-inner">
          <button className="ct-back-btn" onClick={() => router.push("/receipts/")}>Back</button>
          <div className="ct-form" style={{ textAlign: "center" }}>
            <h2 className="ct-title">Access denied</h2>
            <p>You do not have permission to create receipts.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ct-page">
      <div className="ct-inner">
        <button className="ct-back-btn" onClick={() => router.push("/admindashboard/")}>← Back</button>
        <h2 className="ct-title">Create Transaction</h2>

        <div className="ct-layout">
          {/* ── LEFT: Form ── */}
          <form className="ct-form" onSubmit={handleSubmit}>

            {/* Client */}
            <div className="ct-field">
              <label className="ct-label" htmlFor="ct-client">Client <span className="ct-required">*</span></label>
              <SearchableClientSelect
                clients={clients}
                value={form.client}
                onChange={(e) => handleChange({ target: { name: "client", value: e.target.value } })}
                placeholder="Select a Client..."
              />
            </div>

            {/* Invoice */}
            <div className="ct-field">
              <label className="ct-label" htmlFor="ct-invoice">Invoice <span className="ct-optional">(optional)</span></label>
              <select id="ct-invoice" name="invoice" className="ct-select" value={form.invoice} onChange={handleChange} disabled={!form.client}>
                <option value="">— Select Invoice —</option>
                {invoices.map((inv) => {
                  const balance = inv.balance_due !== undefined ? inv.balance_due : inv.total_amount;
                  const isClosed = Number(balance) <= 0;
                  return (
                    <option key={inv.id} value={inv.id} disabled={isClosed}>
                      {inv.invoice_no} — {isClosed ? "[FULLY PAID]" : `Remaining: ₹${Number(balance).toLocaleString("en-IN")}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Balance Amount (read-only) */}
            {form.balanceAmount !== "" && (
              <div className="ct-field">
                <label className="ct-label">Balance Amount</label>
                {Number(form.balanceAmount) <= 0 ? (
                  <div className="ct-closed-badge">CLOSED / FULLY PAID</div>
                ) : (
                  <div className="ct-readonly-amount">
                    <span className="ct-rupee">₹</span>
                    {Number(form.balanceAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            )}

            {/* Paying Amount */}
            <div className="ct-field">
              <label className="ct-label" htmlFor="ct-amount">Paying Amount <span className="ct-required">*</span></label>
              <div className="ct-input-prefix-wrapper">
                <span className="ct-prefix">₹</span>
                <input
                  id="ct-amount"
                  type="text"
                  inputMode="decimal"
                  name="amount"
                  className="ct-input ct-input-has-prefix"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Purpose */}
            <div className="ct-field">
              <label className="ct-label" htmlFor="ct-purpose">Purpose</label>
              <textarea id="ct-purpose" name="purpose" className="ct-textarea" rows={3} placeholder="Describe the purpose of payment…" value={form.purpose} onChange={handleChange} />
            </div>

            {/* Payment Mode */}
            <div className="ct-field">
              <label className="ct-label" htmlFor="ct-mode">Payment Mode <span className="ct-required">*</span></label>
              <select id="ct-mode" name="payment_mode" className="ct-select" value={form.payment_mode} onChange={handleChange} required>
                <option value="">— Select Payment Mode —</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Reference No */}
            <div className="ct-field">
              <label className="ct-label" htmlFor="ct-ref">Reference No <span className="ct-optional">(optional)</span></label>
              <input id="ct-ref" type="text" name="reference_no" className="ct-input" placeholder="UTR / Cheque No / Transaction ID…" value={form.reference_no} onChange={handleChange} />
            </div>

            {/* Notes */}
            <div className="ct-field">
              <label className="ct-label" htmlFor="ct-notes">Notes <span className="ct-optional">(optional)</span></label>
              <textarea id="ct-notes" name="notes" className="ct-textarea" rows={3} placeholder="Additional notes…" value={form.notes} onChange={handleChange} />
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="ct-submit-btn" 
              disabled={submitting || !form.amount || parseFloat(form.amount) <= 0}
            >
              {submitting ? (
                <><span className="ct-btn-spinner" /> Saving…</>
              ) : (
                "Save Transaction"
              )}
            </button>
          </form>

          {/* ── RIGHT: Live Receipt Preview ── */}
          <div className="ct-preview-panel">
            <div className="ct-preview-label">
              <span className="ct-preview-dot" />
              Live Receipt Preview
            </div>
            <div className="ct-preview-scroll">
              <div className="ct-preview-scaler">
                <ReceiptTemplate
                  clientName={clientName}
                  clientAddress={selectedClientObj?.address}
                  clientEmail={selectedClientObj?.email}
                  clientPhone={selectedClientObj?.phone}
                  invoiceNo={selectedInvoice?.invoice_no || ""}
                  date={todayISO}
                  purpose={form.purpose}
                  amount={parseFloat(form.amount) || 0}
                  paymentMode={form.payment_mode}
                  referenceNo={form.reference_no}
                  notes={form.notes}
                  invoiceTotal={selectedInvoice?.total_amount || 0}
                  discountAmount={selectedInvoice?.discount_amount || 0}
                  taxAmount={selectedInvoice?.tax_amount || 0}
                  additionalFee={selectedInvoice?.additional_fee || 0}
                  balanceDue={form.balanceAmount}
                  isPreview={true}
                  companySettings={settings}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
