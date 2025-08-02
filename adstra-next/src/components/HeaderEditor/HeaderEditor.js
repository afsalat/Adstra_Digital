"use client";

import { useState, useEffect } from "react";
import ClientFormModal from "../ClientFormModal/ClientFormModal";

export default function HeaderEditor({ data, onChange }) {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [referenceList, setReferenceList] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchReferences();

    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    const formattedDate = local.toISOString().slice(0, 10); // "YYYY-MM-DD"

    if (!data.quotationDate) {
      onChange({ ...data, quotationDate: formattedDate });
    }

    // Auto-set quotation date
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    onChange((prev) => ({ ...prev, quotationDate: today }));

    // Auto-generate quotation number if not already set
    if (!data.quotationNo) {
      const currentYear = new Date().getFullYear(); // 2025
      const uniqueId = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0"); // 0001, etc.
      const generatedQuotationNo = `AD/${currentYear}/${uniqueId}`;
      onChange((prev) => ({ ...prev, quotationNo: generatedQuotationNo }));
    }
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("http://localhost:8000/proposal/clients/");
      const json = await res.json();
      setClients(json);
    } catch (error) {
      console.error("❌ Failed to fetch clients", error);
    }
  };

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleClientSelect = (e) => {
    const selectedId = parseInt(e.target.value);
    const selected = clients.find((c) => c.id === selectedId);
    if (selected) {
      onChange({ ...data, billTo: selected });
    }
  };

  const fetchReferences = async () => {
    try {
      const res = await fetch("http://localhost:8000/user/user-list/");
      const json = await res.json();
      console.log("📦 Reference API raw:", json);

      // Safely extract the array from 'users'
      setReferenceList(Array.isArray(json.users) ? json.users : []);
    } catch (error) {
      console.error("❌ Failed to fetch references", error);
      setReferenceList([]); // fallback to empty array
    }
  };

  const handleSaveClient = async (newClient) => {
    try {
      const res = await fetch(
        "http://localhost:8000/proposal/clients/create/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newClient),
        }
      );

      const created = await res.json();
      if (res.ok) {
        setClients((prev) => [...prev, created]);
        onChange({ ...data, billTo: created });
        setShowModal(false);
      } else {
        alert("❌ Failed to save client");
        console.error(created);
      }
    } catch (error) {
      alert("❌ Network error while saving client");
      console.error(error);
    }
  };

  return (
    <div className="mb-4">
      <h5 className="fw-bold text-secondary mb-3">📋 Company Details</h5>

      <input
        className="form-control mb-2"
        placeholder="Quotation No."
        value={data.quotationNo}
        onChange={(e) => handleChange("quotationNo", e.target.value)}
      />

      <input
        type="date"
        className="form-control mb-2"
        value={data.quotationDate || ""}
        onChange={(e) => handleChange("quotationDate", e.target.value)}
      />

      <div className="mb-3">
        <label className="form-label">Reference</label>
        <input
          type="text"
          className="form-control"
          list="reference-options"
          placeholder="Start typing or select a reference"
          value={data.reference || ""}
          onChange={(e) => handleChange("reference", e.target.value)}
        />
        <datalist id="reference-options">
          {referenceList.map((ref) => (
            <option key={ref.id} value={ref.fullname || ref.username} />
          ))}
        </datalist>
        <div className="form-text">
          You can select a reference from the list or type a new name.
        </div>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Purpose"
        value={data.purpose}
        onChange={(e) => handleChange("purpose", e.target.value)}
      />

      {/* Client Dropdown and Add Button */}
      <div className="d-flex gap-2 mb-3">
        <select
          className="form-select"
          onChange={handleClientSelect}
          value={data.billTo?.id || ""}
        >
          <option value="" disabled>
            Select Existing Client
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowModal(true)}
        >
          ➕ Add
        </button>
      </div>

      {/* Bill To Fields */}

      <input
        className="form-control mb-2"
        placeholder="Company Name"
        value={data.billTo?.company_name || ""}
        onChange={(e) =>
          onChange({
            ...data,
            billTo: { ...data.billTo, company_name: e.target.value },
          })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Bill To Name"
        value={data.billTo?.name || ""}
        onChange={(e) =>
          onChange({
            ...data,
            billTo: { ...data.billTo, name: e.target.value },
          })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="Bill To Address"
        value={data.billTo?.address || ""}
        onChange={(e) =>
          onChange({
            ...data,
            billTo: { ...data.billTo, address: e.target.value },
          })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="GSTIN"
        value={data.billTo?.gstin || ""}
        onChange={(e) =>
          onChange({
            ...data,
            billTo: { ...data.billTo, gstin: e.target.value },
          })
        }
      />

      <input
        className="form-control mb-2"
        placeholder="LUT Number"
        value={data.billTo?.lut || ""}
        onChange={(e) =>
          onChange({ ...data, billTo: { ...data.billTo, lut: e.target.value } })
        }
      />

      {/* Modal for new client */}
      {showModal && (
        <ClientFormModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveClient}
        />
      )}
    </div>
  );
}
