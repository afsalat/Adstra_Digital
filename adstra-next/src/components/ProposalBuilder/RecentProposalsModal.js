/* RecentProposalsModal.js */
import React, { useState, useEffect } from "react";
import API_BASE_URL from "@/utils/apiBase";
import { useModal } from "@/Context/ModalContext";
import { Search, Edit2, Eye, Trash2, X, FileText, Calendar, User, Hash, Loader2 } from "lucide-react";

export default function RecentProposalsModal({ show, onClose, onAction }) {
    const { showAlert, showConfirm } = useModal();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const getAuthHeaders = () => {
        const token = localStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchProposals = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/proposal/list/?t=${Date.now()}`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Failed to fetch proposals");
            const data = await res.json();
            setProposals(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchProposals();
        }
    }, [show]);

    const handleDelete = async (id) => {
        showConfirm(
            "Delete Proposal",
            "Are you sure you want to permanently delete this proposal? This action cannot be undone.",
            async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/proposal/delete/${id}/`, {
                        method: "DELETE",
                        headers: getAuthHeaders(),
                    });
                    if (res.ok) {
                        setProposals((prev) => prev.filter((p) => String(p.id) !== String(id)));
                        showAlert("Deleted", "Proposal has been removed successfully.", "success");
                    } else {
                        showAlert("Error", "Failed to delete proposal. Please try again.", "error");
                    }
                } catch (err) {
                    if (process.env.NODE_ENV !== "production") {
                      console.error(err);
                    }
                    showAlert("Error", "A network error occurred while deleting the proposal.", "error");
                }
            },
            "danger"
        );
    };

    const filteredProposals = proposals.filter((p) => {
        const q = search.toLowerCase();
        return (
            (p.client?.name || "").toLowerCase().includes(q) ||
            (p.proposal_no || "").toLowerCase().includes(q) ||
            (p.company_name || "").toLowerCase().includes(q) ||
            (p.source_lead?.lead_number || "").toLowerCase().includes(q)
        );
    });

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
                    maxWidth: "1000px",
                    maxHeight: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    overflow: "hidden",
                    animation: "modalFadeIn 0.2s ease-out"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ 
                    padding: "20px 24px", 
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    backgroundColor: "#f8fafc"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ padding: "8px", backgroundColor: "#e0e7ff", borderRadius: "10px", color: "#4f46e5" }}>
                            <FileText size={20} />
                        </div>
                        <h5 style={{ margin: 0, fontWeight: "700", color: "#0f172a", fontSize: "18px" }}>Recent Proposals</h5>
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

                <div style={{ padding: "24px", overflowY: "auto", flex: 1, backgroundColor: "#ffffff" }}>
                    
                    <div style={{ marginBottom: "20px", position: "relative" }}>
                        <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by client name, proposal ID, or lead number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%", padding: "12px 16px 12px 42px",
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
                            <span style={{ fontSize: "14px", fontWeight: "500", marginTop: "16px" }}>Loading proposals...</span>
                        </div>
                    ) : error ? (
                        <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <strong>Error:</strong> {error}
                        </div>
                    ) : (
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        <th style={{ padding: "16px", fontWeight: "600" }}><div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={14} /> Date</div></th>
                                        <th style={{ padding: "16px", fontWeight: "600" }}><div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Hash size={14} /> Proposal ID</div></th>
                                        <th style={{ padding: "16px", fontWeight: "600" }}>Lead</th>
                                        <th style={{ padding: "16px", fontWeight: "600" }}><div style={{ display: "flex", alignItems: "center", gap: "6px" }}><User size={14} /> Client</div></th>
                                        <th style={{ padding: "16px", fontWeight: "600", textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProposals.length > 0 ? (
                                        filteredProposals.map((p, idx) => (
                                            <tr key={p.id} style={{ 
                                                borderBottom: idx !== filteredProposals.length - 1 ? "1px solid #e2e8f0" : "none",
                                                transition: "background-color 0.15s",
                                                backgroundColor: "#ffffff"
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
                                            >
                                                <td style={{ padding: "16px", color: "#475569", fontWeight: "500" }}>{p.date}</td>
                                                <td style={{ padding: "16px" }}>
                                                    <span style={{ 
                                                        backgroundColor: "#eff6ff", color: "#2563eb", 
                                                        padding: "6px 10px", borderRadius: "6px", 
                                                        fontWeight: "600", fontSize: "13px"
                                                    }}>
                                                        {p.proposal_no}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "16px", color: "#64748b" }}>{p.source_lead?.lead_number || "—"}</td>
                                                <td style={{ padding: "16px", color: "#0f172a", fontWeight: "500" }}>{p.client?.name || p.company_name || "Unknown"}</td>
                                                <td style={{ padding: "16px", textAlign: "right" }}>
                                                    <div style={{ display: "inline-flex", gap: "6px" }}>
                                                        <button
                                                            onClick={() => onAction("edit", p)}
                                                            style={{
                                                                background: "#ffffff", border: "1px solid #e2e8f0", color: "#4f46e5",
                                                                padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
                                                                display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500",
                                                                transition: "all 0.2s"
                                                            }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                                                        >
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => onAction("view", p)}
                                                            style={{
                                                                background: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b",
                                                                padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
                                                                display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500",
                                                                transition: "all 0.2s"
                                                            }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#64748b"; }}
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.id)}
                                                            style={{
                                                                background: "#ffffff", border: "1px solid #e2e8f0", color: "#ef4444",
                                                                padding: "6px 8px", borderRadius: "6px", cursor: "pointer",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                transition: "all 0.2s"
                                                            }}
                                                            title="Delete Proposal"
                                                            onMouseOver={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                                    <Search size={32} style={{ opacity: 0.5 }} />
                                                    <span>No proposals found matching your search.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                `}</style>
            </div>
        </div>
    );
}
