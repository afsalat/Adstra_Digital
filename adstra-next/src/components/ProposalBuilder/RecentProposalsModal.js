/* RecentProposalsModal.js */
import React, { useState, useEffect } from "react";

export default function RecentProposalsModal({ show, onClose, onAction }) {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://adstradigital.com/api";

    const fetchProposals = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/proposal/list/?t=${Date.now()}`);
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
        if (!window.confirm("Are you sure you want to delete this proposal?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/proposal/delete/${id}/`, {
                method: "DELETE",
            });
            if (res.ok) {
                setProposals((prev) => prev.filter((p) => String(p.id) !== String(id)));
            } else {
                alert("Failed to delete proposal");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting proposal");
        }
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
