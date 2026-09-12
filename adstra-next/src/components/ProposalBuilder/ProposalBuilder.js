"use client";

import { toWords } from "number-to-words";
import { useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import ProposalWorkspace from "../ProposalWorkspace/ProposalWorkspace";
import RecentProposalsModal from "./RecentProposalsModal"; // Import Modal
import LeadSelector from "./LeadSelector";
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
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const initializedFromUrl = useRef(false);
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

  // Undo / Redo state management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  useEffect(() => {
    // Only capture history when not in view mode
    if (isViewMode) return;
    
    // If this state change was caused by an undo/redo action, don't capture it again
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const currentState = { headerData, service, sections };
    
    // Debounce pushing to history by 800ms
    const timer = setTimeout(() => {
      setHistory((prev) => {
        // Prevent storing duplicate states if nothing actually changed
        if (prev.length > 0 && historyIndex >= 0) {
          const lastState = prev[historyIndex];
          if (JSON.stringify(lastState) === JSON.stringify(currentState)) {
            return prev;
          }
        }
        
        const past = prev.slice(0, historyIndex + 1);
        const newHistory = [...past, JSON.parse(JSON.stringify(currentState))].slice(-50); // Keep last 50 states
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [headerData, service, sections, historyIndex, isViewMode]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prev = history[historyIndex - 1];
      setHeaderData(prev.headerData);
      setService(prev.service);
      setSections(prev.sections);
      setHistoryIndex(historyIndex - 1);
      setIsSaved(false);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const next = history[historyIndex + 1];
      setHeaderData(next.headerData);
      setService(next.service);
      setSections(next.sections);
      setHistoryIndex(historyIndex + 1);
      setIsSaved(false);
    }
  }, [history, historyIndex]);

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
    if (!headerData.billTo?.id && !selectedLead?.id) {
      validationErrors.push("â€¢ Please select a client from the search list.");
    }
    if (!service || service.length === 0) {
      validationErrors.push("â€¢ Please add at least one service item.");
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
        client_id: headerData.billTo?.id || null,
        company_name: headerData.billTo?.company_name || headerData.billTo?.name || "",
        gstin: headerData.billTo?.gstin && headerData.billTo.gstin !== "N/A" ? headerData.billTo.gstin : "",
        lut: headerData.billTo?.lut || "",
        lead_id: currentProposalId ? undefined : selectedLead?.id,
        services: service.map((item) => ({
          ...item,
          gst: parseFloat(item.gst) || 0,
        })),
        sections,
      };

      // If we are editing an existing client, update their details
      if (headerData.billTo?.id) {
        try {
          await fetch(`${API_BASE_URL}/proposal/clients/update/${headerData.billTo.id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(headerData.billTo),
          });
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Failed to update client details", err);
          }
        }
      }

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
        showModal("success", "Proposal Saved", "Proposal saved successfully!");
        setIsSaved(true);
        if (!currentProposalId && data.id) {
          setCurrentProposalId(data.id);
          setSelectedLead(data.source_lead || selectedLead);
          const url = new URL(window.location.href);
          url.searchParams.delete("lead");
          url.searchParams.set("proposal", String(data.id));
          window.history.replaceState({}, "", url);
        }
      } else {
        if (response.status === 409 && data.existing_proposal) {
          handleLoadProposal(data.existing_proposal, "edit");
          showModal("error", "Existing Proposal Opened", "This lead already had a proposal, so the existing proposal was opened.");
          return;
        }
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
        showModal("error", "Save Failed", parseErrors(data));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error saving proposal:", error);
      }
      showModal("error", "Error", "âŒ An unexpected error occurred while saving.");
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
    setSelectedLead(null);
    setIsViewMode(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("lead");
    url.searchParams.delete("proposal");
    window.history.replaceState({}, "", url);
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
    setSelectedLead(proposal.source_lead || null);
    const url = new URL(window.location.href);
    url.searchParams.delete("lead");
    url.searchParams.set("proposal", String(proposal.id));
    window.history.replaceState({}, "", url);
    setHeaderData({
      tagline: "The Soul of a Premium Digital Brand",
      mainBranch: "Husna Complex, near English Church, West Nadakkave, west, Nadakkave, Kozhikode, Kerala 673011",
      otherBranches: "Anganvadi Road, Thiruvelli, Sulthan Bathery, Wayanad 673592",
      billTo: {
        id: proposal.client?.id,
        company_name: proposal.client?.company_name || "",
        name: proposal.client?.name || "",
        address: proposal.client?.address || "",
        email: proposal.client?.email || "",
        contact: proposal.client?.contact || "",
        gstin: proposal.client?.gstin || "N/A",
        lut: proposal.client?.lut || "",
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

  const applyLead = useCallback(async (lead) => {
    if (lead.existing_proposal?.id) {
      try {
        const response = await fetch(`${API_BASE_URL}/proposal/detail/${lead.existing_proposal.id}/`, {
          headers: getAuthHeaders(),
        });
        const proposal = await response.json();
        if (!response.ok) throw new Error(proposal.error || "Could not open the proposal.");
        handleLoadProposal(proposal, "edit");
      } catch (error) {
        showModal("error", "Open Failed", error.message || "Could not open the proposal.");
      }
      setShowLeadSelector(false);
      return;
    }

    let clientRecord;
    try {
      const response = await fetch(`${API_BASE_URL}/proposal/clients/from-lead/${lead.id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create the client from this lead.");
      clientRecord = data.client;
    } catch (error) {
      showModal("error", "Client Creation Failed", error.message || "Could not create the client from this lead.");
      return;
    }

    const resolvedLead = { ...lead, customer_record: clientRecord };
    setSelectedLead(resolvedLead);
    setIsViewMode(false);
    setCurrentProposalId(null);
    setSections(DEFAULT_SECTIONS());
    const url = new URL(window.location.href);
    url.searchParams.delete("proposal");
    url.searchParams.set("lead", String(lead.id));
    window.history.replaceState({}, "", url);
    const leadClientDefaults = {
      name: lead.customer_name || lead.contact_person || lead.company_name || "Lead customer",
      company_name: lead.company_name || "",
      address: lead.address || "",
      email: lead.email || "",
      contact: lead.phone || "",
      gstin: "N/A",
    };
    const client = {
      ...leadClientDefaults,
      ...(clientRecord || {}),
      company_name: clientRecord?.company_name || leadClientDefaults.company_name,
      name: clientRecord?.name || leadClientDefaults.name,
      address: clientRecord?.address || leadClientDefaults.address,
      email: clientRecord?.email || leadClientDefaults.email,
      contact: clientRecord?.contact || leadClientDefaults.contact,
      gstin: clientRecord?.gstin || "N/A",
    };
    setHeaderData((current) => ({
      ...current,
      billTo: client,
      reference: lead.lead_number || current.reference,
      purpose: lead.purpose || lead.requirement_summary || lead.service || lead.product || `Proposal for ${lead.company_name || lead.customer_name || "client"}`,
    }));
    if (!headerData.quotationNo) {
      try {
        const response = await fetch(`${API_BASE_URL}/proposal/next-number/?t=${Date.now()}`, { headers: getAuthHeaders() });
        const data = await response.json();
        if (response.ok && data.proposal_no) {
          setHeaderData((current) => ({ ...current, quotationNo: data.proposal_no }));
        }
      } catch {
        // The save endpoint will return a clear validation error if numbering is unavailable.
      }
    }
    const proposalServices = (lead.proposal_services || []).map((item) => ({
      ...item,
      quantity: Number(item.quantity || 1),
      rate: Number(item.rate || 0),
      amount: Number(item.amount ?? item.rate ?? 0),
      gst: Number(item.gst ?? 18),
      category: item.category || "Lead",
    }));
    setService(proposalServices.length ? proposalServices : [{
      description: lead.service || lead.product || lead.purpose || `Services for ${lead.company_name || lead.customer_name || "client"}`,
      quantity: 1,
      rate: Number(lead.estimated_value || 0),
      amount: Number(lead.estimated_value || 0),
      gst: 18,
      category: "Lead",
    }]);
    setShowLeadSelector(false);
  }, [DEFAULT_SECTIONS, headerData.quotationNo]);

  useEffect(() => {
    if (initializedFromUrl.current) return;
    initializedFromUrl.current = true;
    const params = new URLSearchParams(window.location.search);
    const proposalId = params.get("proposal");
    const leadId = params.get("lead");
    if (proposalId) {
      fetch(`${API_BASE_URL}/proposal/detail/${proposalId}/`, { headers: getAuthHeaders() })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Could not open the proposal.");
          handleLoadProposal(data, "edit");
        })
        .catch((error) => showModal("error", "Open Failed", error.message));
    } else if (leadId) {
      fetch(`${API_BASE_URL}/proposal/eligible-leads/?lead_id=${encodeURIComponent(leadId)}`, { headers: getAuthHeaders() })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Could not open the lead.");
          if (!data.results?.[0]) throw new Error("This lead is not available to you.");
          return applyLead(data.results[0]);
        })
        .catch((error) => showModal("error", "Lead Not Available", error.message));
    }
  }, [applyLead]);

  const workspace = (
    <>
      <ProposalWorkspace
        headerData={headerData}
        onHeaderChange={(next) => {
          setHeaderData((current) => typeof next === "function" ? next(current) : next);
          setIsSaved(false);
        }}
        services={service}
        onServicesChange={(next) => {
          setService((current) => typeof next === "function" ? next(current) : next);
          setIsSaved(false);
        }}
        sections={sections}
        onSectionChange={(id, next) => {
          updateSection(id, next);
          setIsSaved(false);
        }}
        onSectionRemove={(id) => {
          removeSection(id);
          setIsSaved(false);
        }}
        onAddSection={() => {
          setSections((prev) => [
            ...prev,
            { id: newId(), title: "", type: "textarea", alignment: "left", content: "" },
          ]);
          setIsSaved(false);
        }}
        onServiceSelect={addExtraSectionFromService}
        onServiceUnselect={removeExtraSectionFromService}
        selectedLead={selectedLead}
        currentProposalId={currentProposalId}
        isSaved={isSaved}
        isViewMode={isViewMode}
        onBack={() => window.history.back()}
        onNew={handleNewProposal}
        onSelectLead={() => setShowLeadSelector(true)}
        onOpenProposals={() => setShowRecentModal(true)}
        onSave={handleSaveProposal}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      <RecentProposalsModal
        show={showRecentModal}
        onClose={() => setShowRecentModal(false)}
        onAction={(action, proposal) => {
          if (action === "edit" || action === "view") handleLoadProposal(proposal, action);
        }}
      />
      <LeadSelector
        show={showLeadSelector}
        onClose={() => setShowLeadSelector(false)}
        onSelect={applyLead}
        initialLeadId={selectedLead?.id}
      />
      {modal.show && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
          style={{ 
            backgroundColor: "rgba(15, 23, 42, 0.4)", 
            backdropFilter: "blur(8px)", 
            zIndex: 99999,
            padding: "20px"
          }} 
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded shadow-lg" 
            style={{ 
              width: "100%", 
              maxWidth: "400px", 
              overflow: "hidden", 
              transform: "translateY(0)",
              transition: "transform 0.2s ease-out"
            }} 
            onClick={(event) => event.stopPropagation()}
          >
            <div className="d-flex align-items-start p-4">
              <div className="me-3 mt-1">
                {modal.type === "success" ? (
                  <CheckCircle size={32} color="#10b981" strokeWidth={2} />
                ) : (
                  <AlertCircle size={32} color="#ef4444" strokeWidth={2} />
                )}
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-2 fw-bold" style={{ color: "#0f172a", fontSize: "1.15rem" }}>
                  {modal.title}
                </h5>
                <p className="mb-0" style={{ color: "#475569", fontSize: "0.95rem", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                  {modal.message}
                </p>
              </div>
              <button 
                className="btn btn-link p-0 border-0 ms-2"
                style={{ color: "#94a3b8" }}
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="px-4 py-3 text-end border-top" style={{ backgroundColor: "#f8fafc" }}>
              <button 
                className="btn px-4 text-white" 
                style={{ 
                  backgroundColor: modal.type === "success" ? "#10b981" : "#ef4444", 
                  borderRadius: "8px",
                  fontWeight: "600",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onClick={closeModal}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return workspace;
}
