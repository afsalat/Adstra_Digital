"use client";

import { toWords } from "number-to-words";
import { useState, useCallback } from "react";
import SectionEditor from "../SectionEditor/SectionEditor";
import ProposalPreview from "../ProposalPreview/ProposalPreview";
import ExportButton from "../ExportButton/ExportButton";
import ProformaHeader from "../ProformaHeader/ProformaHeader";
import HeaderEditor from "../HeaderEditor/HeaderEditor";
import ServiceTable from "../ServiceTable/ServiceTable";
import RecentProposalsModal from "./RecentProposalsModal"; // Import Modal
import { serviceExtraDetails } from "../../data/clientData";
import API_BASE_URL from "@/utils/apiBase";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ProposalBuilder() {
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const [service, setService] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false); // True when opened via View
  const [currentProposalId, setCurrentProposalId] = useState(null); // Track ID for updates
  const [showRecentModal, setShowRecentModal] = useState(false); // Modal state
  const [modal, setModal] = useState({ show: false, type: "success", title: "", message: "" });
  const showModal = (type, title, message) => setModal({ show: true, type, title, message });
  const closeModal = () => setModal((m) => ({ ...m, show: false }));
  
  const [sections, setSections] = useState([
    {
      id: newId(),
      title: "Proposal by ADSTRA DIGITAL",
      type: "textarea",
      alignment: "left",
      content: "",
    },
  ]);

  const [headerData, setHeaderData] = useState({
    tagline: "The Soul of a Premium Digital Brand",
    mainBranch: "Husna Complex, near English Church, West Nadakkave, west, Nadakkave, Kozhikode, Kerala 673011",
    otherBranches: "Anganvadi Road, Thiruvelli, Sulthan Bathery, Wayanad 673592",
    billTo: {
      name: "Client Name",
      address: "City | State | Pin: 673011",
      gstin: "N/A",
    },
    quotationNo: "",
    quotationDate: "",
    reference: "",
    purpose: "Quotation for N/A",
  });

  const updateSection = (id, updated) => {
    setSections((prev) => prev.map((sec) => (sec.id === id ? updated : sec)));
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  const addExtraSectionFromService = (serviceName) => {
    const detail = serviceExtraDetails[serviceName];
    if (!detail) return;

    setSections((prev) => {
      const exists = prev.some((s) => s.title === serviceName && s.type === "textarea");
      if (exists) {
        return prev.map((s) =>
          s.title === serviceName && s.type === "textarea" ? { ...s, content: detail } : s
        );
      }
      return [
        ...prev,
        {
          id: newId(),
          title: serviceName,
          type: "textarea",
          alignment: "left",
          content: detail,
        },
      ];
    });
  };

  const removeExtraSectionFromService = (serviceName) => {
    setSections((prev) => prev.filter((s) => !(s.title === serviceName && s.type === "textarea")));
  };

  const handleSaveProposal = async () => {
    const validationErrors = [];
    if (!headerData.billTo?.id) {
      validationErrors.push("• Please select a client from the search list.");
    }
    if (!service || service.length === 0) {
      validationErrors.push("• Please add at least one service item.");
    }
    if (validationErrors.length > 0) {
      showModal("error", "Missing Information", validationErrors.join("\n"));
      return;
    }

    try {
      const headers = getAuthHeaders();
      const total = service.reduce((acc, item) => {
        const qty = item.quantity || 1;
        const rate = item.rate || 0;
        const gstRate = parseFloat(item.gst || "18");
        const base = qty * rate;
        const gst = (base * gstRate) / 100;
        return acc + base + gst;
      }, 0);

      const numberToWords = (n) =>
        toWords(n).replace(/\b\w/g, (c) => c.toUpperCase()) + " Only";

      const payload = {
        proposal_no: headerData.quotationNo,
        reference: headerData.reference,
        purpose: headerData.purpose,
        total_amount: total,
        total_in_words: numberToWords(total),
        client_id: headerData.billTo?.id,
        services: service.map((item) => ({
          ...item,
          gst: parseFloat(item.gst) || 0,
        })),
        sections,
      };

      let response;
      if (currentProposalId) {
        response = await fetch(`${API_BASE_URL}/proposal/update/${currentProposalId}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/proposal/create/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (response.ok) {
        showModal("success", "Proposal Saved", "✅ Proposal saved successfully!");
        setIsSaved(true);
        if (!currentProposalId && data.id) {
          setCurrentProposalId(data.id);
        }
      } else {
        const parseErrors = (errData) => {
          if (!errData || typeof errData !== "object") return "Failed to save proposal.";
          const src = errData.errors || errData;
          const messages = [];
          for (const [field, val] of Object.entries(src)) {
            const label = field.replace(/_/g, " ");
            const msg = Array.isArray(val) ? val.join(", ") : String(val);
            messages.push(`${label.charAt(0).toUpperCase() + label.slice(1)}: ${msg}`);
          }
          return messages.length ? messages.join("\n") : "Failed to save proposal.";
        };
        showModal("error", "Save Failed", `❌ ${parseErrors(data)}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error saving proposal:", error);
      }
      showModal("error", "Error", "❌ An unexpected error occurred while saving.");
    }
  };

  const DEFAULT_HEADER = useCallback(() => ({
    tagline: "The Soul of a Premium Digital Brand",
    mainBranch: "Husna Complex, near English Church, West Nadakkave, west, Nadakkave, Kozhikode, Kerala 673011",
    otherBranches: "Anganvadi Road, Thiruvelli, Sulthan Bathery, Wayanad 673592",
    billTo: { name: "Client Name", address: "City | State | Pin: 673011", gstin: "N/A" },
    quotationNo: "",
    quotationDate: new Date().toISOString().slice(0, 10),
    reference: "",
    purpose: "Quotation for N/A",
  }), []);

  const DEFAULT_SECTIONS = useCallback(() => [
    { id: newId(), title: "Proposal by ADSTRA DIGITAL", type: "textarea", alignment: "left", content: "" },
  ], []);

  const handleNewProposal = async () => {
    setService([]);
    setSections(DEFAULT_SECTIONS());
    setIsSaved(false);
    setCurrentProposalId(null);
    const freshHeader = DEFAULT_HEADER();
    try {
      const res = await fetch(`${API_BASE_URL}/proposal/next-number/?t=${Date.now()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      freshHeader.quotationNo = json.proposal_no || "";
    } catch {
      const year = new Date().getFullYear();
      freshHeader.quotationNo = `AD/${year}/1001`;
    }
    setHeaderData(freshHeader);
  };

  const handleLoadProposal = (proposal, action = 'edit') => {
    setCurrentProposalId(proposal.id);
    setIsViewMode(action === 'view');
    setHeaderData({
      tagline: "The Soul of a Premium Digital Brand",
      mainBranch: "Husna Complex, near English Church, West Nadakkave, west, Nadakkave, Kozhikode, Kerala 673011",
      otherBranches: "Anganvadi Road, Thiruvelli, Sulthan Bathery, Wayanad 673592",
      billTo: {
        id: proposal.client?.id,
        name: proposal.client?.name || "",
        address: proposal.client?.address || "",
        gstin: proposal.client?.gstin || "N/A",
      },
      quotationNo: proposal.proposal_no,
      quotationDate: proposal.date,
      reference: proposal.reference || "",
      purpose: proposal.purpose || "",
    });

    if (proposal.services && proposal.services.length > 0) {
      setService(proposal.services.map(s => ({ ...s, gst: s.gst || 18 })));
    } else {
      setService([]);
    }

    if (proposal.sections && proposal.sections.length > 0) {
      setSections(proposal.sections.map(s => ({
        id: s.id || newId(),
        title: s.title,
        type: s.type,
        alignment: s.alignment,
        content: s.content
      })));
    } else {
      setSections(DEFAULT_SECTIONS());
    }
    setIsSaved(false);
    setShowRecentModal(false);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`
        @media print {
          @page { margin: 15mm; size: A4; }
          body, html { background: white; height: auto; }
          .d-print-none { display: none !important; }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            flex: 0 0 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            padding-top: 20px !important;
          }
          #proposal-content {
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            height: auto !important;
          }
          .container {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="d-print-none" style={{ position: "sticky", top: 0, zIndex: 1040, background: "#f0f2f5", borderBottom: "1px solid #d1d5db", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "8px 24px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => window.history.back()} style={{ background: "#fff", border: "1px solid #d1d5db", color: "#374151", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            Back
          </button>
          <button onClick={handleNewProposal} style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            New Proposal
          </button>
          <ExportButton />
          <button onClick={() => window.print()} style={{ background: "#fff", border: "1px solid #d1d5db", color: "#374151", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            Print
          </button>
          <button onClick={() => setShowRecentModal(true)} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            Recent Proposals
          </button>
        </div>

        <RecentProposalsModal
          show={showRecentModal}
          onClose={() => setShowRecentModal(false)}
          onAction={(action, proposal) => {
            if (action === 'edit' || action === 'view') {
              handleLoadProposal(proposal, action);
            }
          }}
        />

        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {isSaved && (
            <span style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Saved ✓
            </span>
          )}
          {!isViewMode && (
            <button
              onClick={handleSaveProposal}
              style={{ background: "linear-gradient(135deg,#16a34a,#059669)", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 20px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 6px rgba(22,163,74,0.35)" }}
            >
              {currentProposalId ? "Update Proposal" : "Save Proposal"}
            </button>
          )}
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-md-6 d-print-none">
            <div className="bg-white p-4 shadow-sm rounded-3 h-100 d-flex flex-column overflow-auto border">
              <h2 className="h4 fw-semibold text-primary mb-3">Proposal Editor</h2>
              <hr className="text-muted" />
              <HeaderEditor data={headerData} onChange={setHeaderData} />
              <div className="mb-3">
                <ServiceTable
                  services={service}
                  onChange={setService}
                  onServiceSelect={addExtraSectionFromService}
                  onServiceUnselect={removeExtraSectionFromService}
                />
                {sections.map((sec) => (
                  <SectionEditor
                    key={sec.id}
                    section={sec}
                    onChange={(s) => updateSection(sec.id, s)}
                    onRemove={() => removeSection(sec.id)}
                  />
                ))}
              </div>
              <div className="sticky-bottom bg-white pt-2 pb-3 mt-auto d-flex justify-content-between align-items-center border-top">
                <button
                  className="btn btn-outline-primary"
                  onClick={() =>
                    setSections((prev) => [
                      ...prev,
                      { id: newId(), title: "", type: "textarea", alignment: "left", content: "" },
                    ])
                  }
                >
                  ➕ Add Section
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6 print-full-width">
            <div id="proposal-content" className="bg-white p-3 shadow-sm rounded-3 h-100 overflow-auto border">
              <ProformaHeader {...headerData} />
              <ProposalPreview sections={sections} services={service} />
            </div>
          </div>
        </div>
        {modal.show && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeModal}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className={`modal-header ${modal.type === "success" ? "bg-success text-white" : "bg-danger text-white"}`}>
                  <h5 className="modal-title">{modal.title}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal} />
                </div>
                <div className="modal-body"><p className="mb-0">{modal.message}</p></div>
                <div className="modal-footer">
                  <button className={`btn ${modal.type === "success" ? "btn-success" : "btn-danger"}`} onClick={closeModal}>OK</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
