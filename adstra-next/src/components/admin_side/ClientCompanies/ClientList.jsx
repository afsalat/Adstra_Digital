'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ClientList.css";
import { Edit, Eye, Plus, ArrowLeft, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/utils/apiBase";
import { useModal } from "@/Context/ModalContext";

const BASE_URL = API_BASE_URL;

const ClientList = () => {
    const { showAlert, showConfirm } = useModal();
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [editClient, setEditClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const router = useRouter();

    const getAuthHeaders = () => {
        const token = localStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/proposal/clients/?t=${Date.now()}`, {
                headers: getAuthHeaders(),
            });
            setClients(response.data);
            setError("");
        } catch (err) {
            if (process.env.NODE_ENV !== "production") {
                console.error("Fetch clients error:", err);
            }
            setError("Failed to load clients.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleAddClient = () => {
        setEditClient(null);
        setShowForm(true);
    };

    const handleEdit = (client) => {
        setEditClient(client);
        setShowForm(true);
    };

    const handleView = (client) => {
        setSelectedClient(client);
        setShowDetails(true);
    };

    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (client) => {
        showConfirm(
            "Delete Client",
            `Are you sure you want to permanently delete ${client.company_name || client.name}? This action cannot be undone.`,
            async () => {
                setDeletingId(client.id);
                try {
                    await axios.delete(`${BASE_URL}/proposal/clients/delete/${client.id}/`, {
                        headers: getAuthHeaders(),
                    });
                    showAlert("Deleted", "Client has been removed successfully.", "success");
                    await fetchClients();
                } catch (error) {
                    const errMsg = error.response?.data?.error || "Failed to delete client.";
                    showAlert("Error", errMsg, "error");
                    if (process.env.NODE_ENV !== "production") {
                        console.error(error);
                    }
                } finally {
                    setDeletingId(null);
                }
            },
            "danger"
        );
    };

    const handleBack = () => router.push("/admindashboard/");

    if (loading) return <p className="loader">Loading clients...</p>;
    if (error) return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <p className="error">{error}</p>
            <button onClick={fetchClients} className="add-btn" style={{ margin: '0 auto' }}>Retry</button>
        </div>
    );

    return (
        <div className="client-list-container">
            <div className="header-actions">
                <h2>🏢 Client Companies</h2>
                <div className="button-group">
                    <button className="back-btn" onClick={handleBack}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <button className="add-btn" onClick={handleAddClient}>
                        <Plus size={16} /> Add New Client
                    </button>
                </div>
            </div>

            <div className="table-responsive">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Company Name</th>
                            <th>Contact Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No clients found.</td>
                            </tr>
                        ) : (
                            clients.map((client, index) => (
                                <tr key={client.id}>
                                    <td>{index + 1}</td>
                                    <td>{client.company_name || "—"}</td>
                                    <td>{client.name}</td>
                                    <td>{client.email || "—"}</td>
                                    <td>{client.contact || "—"}</td>
                                    <td>{client.address || "—"}</td>
                                    <td className="actions">
                                        <button onClick={() => handleView(client)} title="View">
                                            <Eye size={16} />
                                        </button>
                                        <button onClick={() => handleEdit(client)} title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client)}
                                            title="Delete"
                                            disabled={deletingId === client.id}
                                            style={{ opacity: deletingId === client.id ? 0.5 : 1, cursor: deletingId === client.id ? 'not-allowed' : 'pointer' }}
                                        >
                                            <Trash2 size={16} color={deletingId === client.id ? "gray" : "crimson"} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="popup-overlay" onClick={() => setShowForm(false)}>
                    <div className="popup user-form-popup" onClick={(e) => e.stopPropagation()}>
                        <button className="close-popup" onClick={() => setShowForm(false)}>
                            <X size={18} />
                        </button>
                        <h3>{editClient ? "Edit Client" : "Add New Client"}</h3>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target;
                                const formData = {
                                    company_name: form.company_name.value,
                                    name: form.name.value,
                                    email: form.email.value,
                                    contact: form.contact.value,
                                    address: form.address.value,
                                    gstin: form.gstin.value,
                                    lut: form.lut.value,
                                };

                                try {
                                    if (editClient) {
                                        const response = await axios.put(`${BASE_URL}/proposal/clients/update/${editClient.id}/`, formData, {
                                            headers: getAuthHeaders(),
                                        });
                                        setClients(prev => prev.map(c => c.id === editClient.id ? response.data : c));
                                        showAlert("Success", "Client updated successfully.", "success");
                                    } else {
                                        const response = await axios.post(`${BASE_URL}/proposal/clients/create/`, formData, {
                                            headers: getAuthHeaders(),
                                        });
                                        setClients(prev => [...prev, response.data]);
                                        showAlert("Success", "New client added successfully.", "success");
                                    }
                                    setShowForm(false);
                                } catch (err) {
                                    showAlert("Error", "Failed to save client. Please check the details and try again.", "error");
                                    if (process.env.NODE_ENV !== "production") {
                                        console.error(err);
                                    }
                                }
                            }}
                        >
                            <input name="company_name" placeholder="Company Name" defaultValue={editClient?.company_name || ""} />
                            <input name="name" placeholder="Contact Person Name" defaultValue={editClient?.name || ""} required />
                            <input name="email" type="email" placeholder="Email" defaultValue={editClient?.email || ""} />
                            <input name="contact" placeholder="Phone" defaultValue={editClient?.contact || ""} />
                            <input name="address" placeholder="Address" defaultValue={editClient?.address || ""} />
                            <input name="gstin" placeholder="GSTIN" defaultValue={editClient?.gstin || ""} />
                            <input name="lut" placeholder="LUT Code" defaultValue={editClient?.lut || ""} />
                            <button type="submit" className="submit-btn">
                                {editClient ? "Update Client" : "Create Client"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showDetails && selectedClient && (
                <div className="popup-overlay" onClick={() => setShowDetails(false)}>
                    <div className="popup user-details-popup" onClick={(e) => e.stopPropagation()}>
                        <button className="close-popup" onClick={() => setShowDetails(false)}>
                            <X size={18} />
                        </button>
                        <h3>🏢 Client Details</h3>
                        <div className="details-content">
                            <p><strong>Company Name:</strong> {selectedClient.company_name || "—"}</p>
                            <p><strong>Contact Person:</strong> {selectedClient.name}</p>
                            <p><strong>Email:</strong> {selectedClient.email || "—"}</p>
                            <p><strong>Phone:</strong> {selectedClient.contact || "—"}</p>
                            <p><strong>Address:</strong> {selectedClient.address || "—"}</p>
                            <p><strong>GSTIN:</strong> {selectedClient.gstin || "—"}</p>
                            <p><strong>LUT Code:</strong> {selectedClient.lut || "—"}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientList;
