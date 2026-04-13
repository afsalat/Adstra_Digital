"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";

export default function CreateTransaction() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const [form, setForm] = useState({
    client: "",
    invoice: "",
    date: "",
    amount: "",
    purpose: "",
    payment_mode: "",
    reference_no: "",
    notes: "",
    balanceAmount: "",
  });

  const API_URL = API_BASE_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/proposal/clients/`)
      .then((res) => setClients(res.data))
      .catch(console.error);
  }, [API_URL]);

  useEffect(() => {
    if (form.client) {
      axios
        .get(`${API_URL}/invoice/invoice_list/${form.client}/`)
        .then((res) => setInvoices(res.data))
        .catch(console.error);
    } else {
      setInvoices([]);
      setForm((prev) => ({ ...prev, invoice: "", balanceAmount: "" }));
      setTotalAmount(0);
      setSelectedInvoice(null);
    }
  }, [form.client, API_URL]);

  useEffect(() => {
    if (form.invoice) {
      const invoice = invoices.find((inv) => inv.id === Number(form.invoice));
      if (invoice) {
        setSelectedInvoice(invoice);
        setTotalAmount(Number(invoice.total_amount));
        setForm((prev) => ({
          ...prev,
          amount: "",
          balanceAmount: Number(invoice.total_amount).toFixed(2),
        }));
      }
    } else {
      setSelectedInvoice(null);
      setTotalAmount(0);
      setForm((prev) => ({ ...prev, amount: "", balanceAmount: "" }));
    }
  }, [form.invoice, invoices]);

  useEffect(() => {
    const amountPaid = parseFloat(form.amount) || 0;
    const balance = totalAmount - amountPaid;
    setForm((prev) => ({
      ...prev,
      balanceAmount: balance >= 0 ? balance.toFixed(2) : "0.00",
    }));
  }, [form.amount, totalAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        if (parseFloat(value) > totalAmount) return;
      } else return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/transactions/list-create/`, form);
      router.push("/receipts/");
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Error saving transaction");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Create Transaction</h2>
      <div
        style={{
          display: "flex",
          gap: "40px",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT: Invoice Details */}
        <div
          style={{
            flex: "1 1 350px",
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h4>Invoice Details</h4>
          {!selectedInvoice ? (
            <p style={{ color: "#777" }}>Select an invoice to see details</p>
          ) : (
            <div>
              <p>
                <strong>Invoice No:</strong> {selectedInvoice.invoice_no}
              </p>
              <p>
                <strong>Date:</strong> {selectedInvoice.date}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹
                {Number(selectedInvoice.total_amount).toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Client:</strong>{" "}
                {clients.find((c) => c.id === selectedInvoice.client)?.name ||
                  "N/A"}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Transaction Form */}
        <form
          onSubmit={handleSubmit}
          style={{ flex: "1 1 450px", minWidth: 320 }}
        >
          {/* Client */}
          <div className="mb-3">
            <label>Client</label>
            <select
              name="client"
              className="form-control"
              value={form.client}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice */}
          <div className="mb-3">
            <label>Invoice (optional)</label>
            <select
              name="invoice"
              className="form-control"
              value={form.invoice}
              onChange={handleChange}
              disabled={!form.client}
            >
              <option value="">-- Select Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_no} - ₹{inv.total_amount}
                </option>
              ))}
            </select>
          </div>

          {/* Balance Amount */}
          <input
            type="number"
            className="form-control mb-2"
            placeholder="Balance Amount"
            name="balanceAmount"
            value={form.balanceAmount}
            readOnly
          />

          {/* Paying Amount */}
          <div className="mb-3">
            <label>Paying Amount</label>
            <input
              type="number"
              name="amount"
              className="form-control"
              value={form.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              max={totalAmount}
            />
          </div>

          {/* Purpose */}
          <div className="mb-3">
            <label>Purpose</label>
            <textarea
              name="purpose"
              className="form-control"
              value={form.purpose}
              onChange={handleChange}
            />
          </div>

          {/* Payment Mode */}
          <div className="mb-3">
            <label>Payment Mode</label>
            <select
              name="payment_mode"
              className="form-control"
              value={form.payment_mode}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Payment Mode --</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-3">
            <label>Notes</label>
            <textarea
              name="notes"
              className="form-control"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
