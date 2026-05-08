/* RecentProposalsModal.js */
import React, { useState, useEffect } from "react";
import API_BASE_URL from "@/utils/apiBase";
import { useModal } from "@/Context/ModalContext";

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
            (p.company_name || "").toLowerCase().includes(q)
        );
    });

    if (!show) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Recent Proposals</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        {/* Search Bar */}
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by Client Name or Proposal ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                                <table className="table table-hover align-middle">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th>Date</th>
                                            <th>Proposal ID</th>
                                            <th>Client</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProposals.length > 0 ? (
                                            filteredProposals.map((p) => (
                                                <tr key={p.id}>
                                                    <td>{p.date}</td>
                                                    <td className="fw-bold text-primary">{p.proposal_no}</td>
                                                    <td>{p.client?.name || p.company_name || "Unknown"}</td>
                                                    <td className="text-end">
                                                        <div className="btn-group" role="group">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => onAction("edit", p)}
                                                                title="Edit Proposal"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => onAction("view", p)}
                                                                title="View / Load"
                                                            >
                                                                👁️ View
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(p.id)}
                                                                title="Delete Proposal"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-3 text-muted">
                                                    No proposals found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
