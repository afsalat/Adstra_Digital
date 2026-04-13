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
    mainBranch:
      "Husna Complex, near English Church, West Nadakkave, west, Nadakkave, Kozhikode, Kerala 673011",
    otherBranches:
      "Anganvadi Road, Thiruvelli, Sulthan Bathery, Wayanad 673592",
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

  // Add a manual section associated to a selected service (textarea)
  const addExtraSectionFromService = (serviceName) => {
    const detail = serviceExtraDetails[serviceName];
    if (!detail) return;

    setSections((prev) => {
      const exists = prev.some(
        (s) => s.title === serviceName && s.type === "textarea"
      );
      if (exists) {
        return prev.map((s) =>
          s.title === serviceName && s.type === "textarea"
            ? { ...s, content: detail }
            : s
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

  // Remove the manual section when that service is unchecked
  const removeExtraSectionFromService = (serviceName) => {
    setSections((prev) =>
      prev.filter((s) => !(s.title === serviceName && s.type === "textarea"))
    );
  };

  const handleSaveProposal = async () => {
    // --- Validation ---
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
      const token = localStorage.getItem("auth_token")?.replace(/"/g, "");
      // Calculate total same way as ProposalPreview
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
        client_id: headerData.billTo?.id, // Send ID to write-only field
        services: service.map((item) => ({
          ...item,
          gst: parseFloat(item.gst) || 0,
        })),
        sections,
      };

      let response;
      if (currentProposalId) {
        // UPDATE existing proposal
        response = await fetch(`${API_BASE_URL}/proposal/update/${currentProposalId}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE new proposal
        response = await fetch(`${API_BASE_URL}/proposal/create/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.ok) {
        showModal("success", "Proposal Saved", "✅ Proposal saved successfully!");
        setIsSaved(true);
        if (!currentProposalId && data.id) {
          setCurrentProposalId(data.id); // Set ID after first save
        }

        // Only advance number if it was a NEW proposal
        if (!currentProposalId) {
          try {
            const nextRes = await fetch(`${API_BASE_URL}/proposal/next-number/`);
            const nextJson = await nextRes.json();
            // We should keep the current ID and Number.
          } catch { }
        }
      } else {
        console.error("Save failed:", data);
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
      console.error("Error saving proposal:", error);
      showModal("error", "Error", "❌ An unexpected error occurred while saving.");
    }
  };

  const DEFAULT_HEADER = useCallback(() => ({
    tagline: "The Soul of a Premium Digital Brand",
    mainBranch:
      "Husna Complex, near English Church, West Nadakkave, west, Nadakkave, Kozhikode, Kerala 673011",
    otherBranches:
      "Anganvadi Road, Thiruvelli, Sulthan Bathery, Wayanad 673592",
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
    // Reset all form state
    setService([]);
    setSections(DEFAULT_SECTIONS());
    setIsSaved(false);
    setCurrentProposalId(null); // Clear ID for new proposal
    const freshHeader = DEFAULT_HEADER();
    // Fetch next proposal number
    try {
      const res = await fetch(`${API_BASE_URL}/proposal/next-number/?t=${Date.now()}`);
      const json = await res.json();
      freshHeader.quotationNo = json.proposal_no || "";
    } catch {
      const year = new Date().getFullYear();
      freshHeader.quotationNo = `AD/${year}/1001`;
    }
    setHeaderData(freshHeader);
  };

  const handleLoadProposal = (proposal, action = 'edit') => {
    // Map backend proposal data to component state
    setCurrentProposalId(proposal.id);
    setIsViewMode(action === 'view'); // Lock editing if opened via View

    // Header Data
    setHeaderData({
      tagline: "The Soul of a Premium Digital Brand", // Keep default or fetch if saved? Backend doesn't seem to save tagline
      mainBranch: "Husna Complex, near English Church, West Nadakkave, west, Nadakkave, Kozhikode, Kerala 673011",
      otherBranches: "Anganvadi Road, Thiruvelli, Sulthan Bathery, Wayanad 673592",
      billTo: {
        id: proposal.client?.id, // Important for valid saving
        name: proposal.client?.name || "",
        address: proposal.client?.address || "",
        gstin: proposal.client?.gstin || "N/A",
      },
      quotationNo: proposal.proposal_no,
      quotationDate: proposal.date,
      reference: proposal.reference || "",
      purpose: proposal.purpose || "",
    });

    // Services
    if (proposal.services && proposal.services.length > 0) {
      setService(proposal.services.map(s => ({
        ...s,
        gst: s.gst || 18 // Default or saved GST? Backend saves amount/rate/qty. Need GST? 
        // Backend serializer has fields = '__all__'. PService model has nothing about GST.
        // Wait, ProposalService model: description, quantity, rate, amount. NO GST field.
        // So GST defaults to 18 on load?
      })));
    } else {
      setService([]);
    }

    // Sections
    if (proposal.sections && proposal.sections.length > 0) {
      setSections(proposal.sections.map(s => ({
        id: s.id || newId(), // Use existing ID or new
        title: s.title,
        type: s.type,
        alignment: s.alignment,
        content: s.content
      })));
    } else {
      setSections(DEFAULT_SECTIONS());
    }

    setIsSaved(false); // Allow updating
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
            padding-top: 20px !important; /* Added top padding */
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
           /* Ensure background colors print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Sticky Toolbar */}
      <div
        className="d-print-none"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1040,
          background: "#f0f2f5",
          borderBottom: "1px solid #d1d5db",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {/* Left group */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>

          {/* Back */}
          <button onClick={() => window.history.back()} style={{ background: "#fff", border: "1px solid #d1d5db", color: "#374151", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>

          {/* New Proposal */}
          <button onClick={handleNewProposal} style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Proposal
          </button>

          {/* Download PDF */}
          <ExportButton />

          {/* Print */}
          <button onClick={() => window.print()} style={{ background: "#fff", border: "1px solid #d1d5db", color: "#374151", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            Print
          </button>

          {/* Recent Proposals */}
          <button onClick={() => setShowRecentModal(true)} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            Recent Proposals
          </button>
        </div>

        {/* Recent Proposals Modal */}
        <RecentProposalsModal
          show={showRecentModal}
          onClose={() => setShowRecentModal(false)}
          onAction={(action, proposal) => {
            if (action === 'edit' || action === 'view') {
              handleLoadProposal(proposal, action);
            }
          }}
        />

        {/* Right group — Save / Update */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          {/* Show "Saved ✓" indicator only when saved */}
          {isSaved && (
            <span style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Saved ✓
            </span>
          )}
          {/* Save / Update button — hidden in view mode */}
          {!isViewMode && (
            <button
              onClick={handleSaveProposal}
              style={{ background: "linear-gradient(135deg,#16a34a,#059669)", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 20px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 6px rgba(22,163,74,0.35)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
              {currentProposalId ? "Update Proposal" : "Save Proposal"}
            </button>
          )}
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          {/* Left Editor */}
          <div className="col-md-6 d-print-none">
            <div className="bg-white p-4 shadow-sm rounded-3 h-100 d-flex flex-column overflow-auto border">
              <h2 className="h4 fw-semibold text-primary mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px", verticalAlign: "middle" }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Proposal Editor
              </h2>
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
                      {
                        id: newId(),
                        title: "",
                        type: "textarea",
                        alignment: "left",
                        content: "",
                      },
                    ])
                  }
                >
                  ➕ Add Section
                </button>
              </div>


            </div>
          </div>

          {/* Right Preview */}
          <div className="col-md-6 print-full-width">
            <div
              id="proposal-content"
              className="bg-white p-3 shadow-sm rounded-3 h-100 overflow-auto border"
            >
              <ProformaHeader {...headerData} />
              <ProposalPreview sections={sections} services={service} />
            </div>
          </div>
        </div>
        {/* Save Result Modal */}
        {modal.show && (
          <div
            className="modal d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={closeModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className={`modal-header ${modal.type === "success" ? "bg-success text-white" : "bg-danger text-white"}`}>
                  <h5 className="modal-title">{modal.title}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  <p className="mb-0">{modal.message}</p>
                </div>
                <div className="modal-footer">
                  <button className={`btn ${modal.type === "success" ? "btn-success" : "btn-danger"}`} onClick={closeModal}>
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div> {/* end container py-4 */}
    </div>
  );
}
