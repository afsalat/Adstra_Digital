"use client";

import { useEffect, useState } from "react";
import API_BASE_URL from "@/utils/apiBase";
import { Search, X, Users, ChevronRight, Loader2 } from "lucide-react";

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function LeadSelector({ show, onClose, onSelect, initialLeadId, mode = "create" }) {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ page_size: "40" });
        if (search.trim()) params.set("search", search.trim());
        if (initialLeadId) params.set("lead_id", String(initialLeadId));
        const response = await fetch(`${API_BASE_URL}/proposal/eligible-leads/?${params}`, {
          headers: authHeaders(),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load leads.");
        setLeads(data.results || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Could not load leads.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search ? 250 : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [show, search, initialLeadId]);

  if (!show) return null;

  return (
    <div 
        style={{ 
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: "rgba(15, 23, 42, 0.6)", 
            backdropFilter: "blur(6px)",
            zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px"
        }}
        onClick={onClose}
    >
      <div 
          style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              animation: "modalFadeIn 0.2s ease-out"
          }}
          onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
            padding: "20px 24px", 
            borderBottom: "1px solid #f1f5f9",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            backgroundColor: "#f8fafc"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ padding: "10px", backgroundColor: "#e0e7ff", borderRadius: "12px", color: "#4f46e5" }}>
                <Users size={24} />
            </div>
            <div>
              <h5 style={{ margin: "0 0 4px 0", fontWeight: "700", color: "#0f172a", fontSize: "18px" }}>
                {mode === "request" ? "Request a proposal" : "Create proposal from a lead"}
              </h5>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                {mode === "request" ? "Select the lead that needs a proposal." : "Select one of the leads available to you."}
              </span>
            </div>
          </div>
          <button 
              onClick={onClose}
              style={{ 
                  background: "transparent", border: "none", color: "#64748b", 
                  cursor: "pointer", padding: "8px", borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
              <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1, backgroundColor: "#ffffff" }}>
          
          {/* Search Bar */}
          <div style={{ marginBottom: "20px", position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                  <Search size={18} />
              </div>
              <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search lead number, company, contact, product or service..."
                  autoFocus
                  style={{
                      width: "100%", padding: "14px 16px 14px 42px",
                      borderRadius: "10px", border: "1px solid #e2e8f0",
                      fontSize: "14px", color: "#334155", outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      backgroundColor: "#f8fafc"
                  }}
                  onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#4f46e5";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
              />
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", color: "#64748b" }}>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "14px", fontWeight: "500", marginTop: "16px" }}>Loading leads...</span>
            </div>
          ) : error ? (
            <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <strong>Error:</strong> {error}
            </div>
          ) : leads.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Search size={32} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: "15px" }}>No matching leads found.</span>
                </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "460px", overflowY: "auto", paddingRight: "4px" }}>
              {leads.map((lead) => {
                const disabled = mode === "request" && Boolean(lead.existing_proposal || ["pending", "in_progress"].includes(lead.proposal_request?.status));
                
                return (
                  <button
                    key={lead.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && onSelect(lead)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "16px 20px", borderRadius: "12px",
                      background: lead.existing_proposal ? "#f8fafc" : "#ffffff",
                      border: lead.existing_proposal ? "1px solid #e2e8f0" : "1px solid #e2e8f0",
                      cursor: disabled ? "not-allowed" : "pointer",
                      textAlign: "left", transition: "all 0.2s",
                      opacity: disabled ? 0.6 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!disabled && !lead.existing_proposal) {
                        e.currentTarget.style.borderColor = "#c7d2fe";
                        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!disabled && !lead.existing_proposal) {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "70%" }}>
                      <strong style={{ fontSize: "15px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lead.company_name || lead.customer_name || lead.contact_person || lead.lead_number}
                      </strong>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        {lead.lead_number} • {lead.service || lead.product || "No product/service"} • {String(lead.current_stage || "").replaceAll("_", " ")}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {lead.existing_proposal ? (
                        <span style={{ 
                          backgroundColor: "#fef3c7", color: "#d97706", 
                          padding: "6px 12px", borderRadius: "20px", 
                          fontSize: "12px", fontWeight: "600" 
                        }}>
                          {mode === "request" ? "Proposal created" : `Open ${lead.existing_proposal.proposal_no}`}
                        </span>
                      ) : (
                        <span style={{ 
                          backgroundColor: disabled ? "#f1f5f9" : "#e0e7ff", 
                          color: disabled ? "#64748b" : "#4f46e5", 
                          padding: "6px 16px", borderRadius: "20px", 
                          fontSize: "13px", fontWeight: "600" 
                        }}>
                          {lead.proposal_request && mode === "request"
                            ? String(lead.proposal_request.status).replaceAll("_", " ")
                            : "Select"}
                        </span>
                      )}
                      
                      {!disabled && !lead.existing_proposal && (
                        <ChevronRight size={18} color="#94a3b8" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <style>{`
            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(10px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            /* Custom scrollbar for webkit */
            div::-webkit-scrollbar {
                width: 6px;
            }
            div::-webkit-scrollbar-track {
                background: transparent;
            }
            div::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
            }
            div::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
        `}</style>
      </div>
    </div>
  );
}
