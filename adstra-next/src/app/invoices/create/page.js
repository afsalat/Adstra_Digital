"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToWords } from "to-words";
import { useRouter } from "next/navigation";

export default function CreateInvoice() {
  const [invoice, setInvoice] = useState({
    invoice_no: "",
    client: "",
    total_amount: "",
    total_in_words: "",
    status: "unpaid",
    items: [],
    proposal: "", // NEW
  });

  const [clients, setClients] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState("");

  const router = useRouter();
  const API_BASE = "http://localhost:8000";

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
    },
  });

  // Set initial invoice number
  useEffect(() => {
    const generatedInvoiceNo = `INV-AD-2025-3480-${Date.now()}`;
    setInvoice((prev) => ({ ...prev, invoice_no: generatedInvoiceNo }));
  }, []);

  // Fetch clients
  useEffect(() => {
    axios
      .get(`${API_BASE}/proposal/clients/`)
      .then((res) => setClients(res.data))
      .catch((err) => console.error("Client Fetch Error:", err));
  }, [API_BASE]);

  useEffect(() => {
    const total = invoice.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity || 0);
      const rate = parseFloat(item.rate || 0);
      const gst = parseFloat(item.gst || 0);
      const base = quantity * rate;
      const gstAmount = base * (gst / 100);
      return sum + base + gstAmount;
    }, 0);

    setInvoice((prev) => ({
      ...prev,
      total_amount: total.toFixed(2),
      total_in_words: toWords.convert(total),
    }));
  }, [invoice.items]);

  // Add new item row
  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { description: "", quantity: 1, rate: 0, gst: 0, isNew: true }, // Mark as new
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
    e.preventDefault();

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
      await axios.post(`${API_BASE}/invoice/create/`, formattedInvoice);
      const encoded = encodeURIComponent(invoice.invoice_no);
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

  return (
    <div className="container py-5 bg-white border rounded shadow">
      <button
        onClick={() => router.push("/invoices/")}
        className="btn btn-secondary"
      >
        Back
      </button>
      <br />
      <br />
      {/* Header */}
      <div className="mb-4 text-center">
        <h2 className="fw-bold text-primary">Adstra Digital</h2>
        <p className="text-muted">
          The Sole of premium Digital Marketing Brand
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Invoice & Client Info */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-bold">Invoice No</label>
            <input
              className="form-control"
              value={invoice.invoice_no}
              onChange={(e) =>
                setInvoice({ ...invoice, invoice_no: e.target.value })
              }
              required
              readOnly
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-bold">Client</label>
            <select
              className="form-select"
              value={invoice.client}
              onChange={handleClientChange}
              required
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {proposals.length > 0 && (
            <div className="col-md-4">
              <label className="form-label fw-bold">Proposal</label>
              <select
                className="form-select"
                value={selectedProposalId}
                onChange={handleProposalChange}
              >
                <option value="">Select Proposal</option>
                {proposals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.purpose || `Proposal #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Extra Details */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold">Total in Words</label>
            <input
              className="form-control"
              value={invoice.total_in_words}
              onChange={(e) =>
                setInvoice({ ...invoice, total_in_words: e.target.value })
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Status</label>
            <select
              className="form-select"
              value={invoice.status}
              onChange={(e) =>
                setInvoice({ ...invoice, status: e.target.value })
              }
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Services Table */}
        <h5 className="fw-bold border-bottom pb-2 mt-4">Services</h5>
        <table className="table table-bordered table-striped mt-2 align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>Description</th>
              <th style={{ width: "10%" }}>Qty</th>
              <th style={{ width: "15%" }}>Rate</th>
              <th style={{ width: "10%" }}>GST %</th>
              <th style={{ width: "10%" }}>Amount</th>
              <th style={{ width: "10%" }}>Remove</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => {
              const rate = Number(item.rate) || 0;
              const quantity = Number(item.quantity) || 0;
              const gst = Number(item.gst) || 0;
              const base = rate * quantity;
              const gstAmount = (base * gst) / 100;
              const total = base + gstAmount;

              return (
                <tr key={i}>
                  <td>
                    <input
                      className="form-control"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(i, "description", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control text-end"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(i, "quantity", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control text-end"
                      value={item.rate}
                      onChange={(e) => updateItem(i, "rate", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control text-end"
                      value={item.gst}
                      readOnly={!item.isNew}
                      onChange={(e) => {
                        if (item.isNew) updateItem(i, "gst", e.target.value);
                      }}
                    />
                  </td>
                  <td className="text-end">₹{total.toFixed(2)}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="btn btn-sm btn-danger"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          type="button"
          onClick={addItem}
          className="btn btn-sm btn-outline-primary mb-3"
        >
          + Add Item
        </button>

        {/* Invoice Total */}
        <div className="text-end mb-3">
          <h5>
            <strong>
              Invoice Total: ₹{" "}
              {Number(invoice.total_amount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </h5>
        </div>

        {/* Submit */}
        <div className="d-flex justify-content-end mt-4 no-print">
          <button type="submit" className="btn btn-warning btn-sm">
            ✅ Create & View Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
