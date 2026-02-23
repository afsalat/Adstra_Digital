"use client";

import { useState, useEffect } from "react";
import ClientFormModal from "../ClientFormModal/ClientFormModal";

export default function HeaderEditor({ data, onChange }) {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [referenceList, setReferenceList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://adstradigital.com/api";

  useEffect(() => {
    fetchClients();
    fetchReferences();

    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    const formattedDate = local.toISOString().slice(0, 10);

    if (!data.quotationDate) {
      onChange({ ...data, quotationDate: formattedDate });
    }

    // Fetch next proposal number from backend
    if (!data.quotationNo) {
      fetchNextProposalNo();
    }
  }, []);

  const fetchNextProposalNo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/proposal/next-number/?t=${Date.now()}`);
      const json = await res.json();
      if (json.proposal_no) {
        onChange((prev) => ({ ...prev, quotationNo: json.proposal_no }));
      }
    } catch (err) {
      // Fallback to year-based random if API fails
      const year = new Date().getFullYear();
      const seq = Math.floor(Math.random() * 9000) + 1000;
      onChange((prev) => ({ ...prev, quotationNo: `AD/${year}/${seq}` }));
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/proposal/clients/?t=${Date.now()}`);
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        console.log("✅ Clients Loaded:", json); // DEBUG
        setClients(json);
      } else {
        const text = await res.text();
        console.error("❌ Expected JSON but got:", text);
      }
    } catch (err) {
      console.error("❌ Network error fetching clients:", err);
    }
  };

  const fetchReferences = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/user-list/`);
      const json = await res.json();
      setReferenceList(Array.isArray(json.users) ? json.users : []);
    } catch (error) {
      console.error("❌ Failed to fetch references", error);
      setReferenceList([]);
    }
  };

  const handleSaveClient = async (newClient) => {
    try {
      const res = await fetch(`${API_BASE_URL}/proposal/clients/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

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

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleClientSelect = (client) => {
    const companyName = client.company_name || client.name || "";
    onChange({
      ...data,
      billTo: client,
      purpose: `Quotation for ${companyName}`,
    });
    setSearchTerm(companyName);
    setShowSuggestions(false);
  };

  const filteredClients = clients.filter((c) => {
    const match = (c.company_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return match;
  });

  console.log("🔍 Search:", searchTerm, "| Clients:", clients.length, "| Matches:", filteredClients.length); // DEBUG

  return (
    <div className="mb-4">
      <h5 className="fw-bold text-secondary mb-3" style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" /></svg>
        Company Details
      </h5>

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

      <div className="d-flex gap-2 mb-3">

        <div className="flex-grow-1 position-relative">
          <input
            className="form-control"
            placeholder="Search Client or Company..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && filteredClients.length > 0 && (
            <ul
              className="list-group position-absolute w-100 shadow"
              style={{ zIndex: 1050, maxHeight: "200px", overflowY: "auto", top: "100%" }}
            >
              {filteredClients.map((client) => (
                <li
                  key={client.id}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: "pointer" }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before selection
                    handleClientSelect(client);
                  }}
                >
                  <strong>{client.company_name || "—"}</strong> <small className="text-muted">({client.name})</small>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowModal(true)}
        >
          ➕ Add
        </button>
      </div>

      <div className="d-flex gap-2 mb-2">
        <input
          className="form-control"
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
          className="form-control"
          placeholder="Client Name"
          value={data.billTo?.name || ""}
          onChange={(e) =>
            onChange({
              ...data,
              billTo: { ...data.billTo, name: e.target.value },
            })
          }
        />
      </div>

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

      <div className="d-flex gap-2 mb-2">
        <input
          className="form-control"
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
          className="form-control"
          placeholder="LUT Number"
          value={data.billTo?.lut || ""}
          onChange={(e) =>
            onChange({ ...data, billTo: { ...data.billTo, lut: e.target.value } })
          }
        />
      </div>

      {showModal && (
        <ClientFormModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveClient}
        />
      )}
    </div>
  );
}
