'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ClientList.css";
import { Edit, Eye, Plus, ArrowLeft, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const ClientList = () => {
    const [clients, setClients] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [editClient, setEditClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const router = useRouter();

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/proposal/clients/?t=${Date.now()}`);
            setClients(response.data);
        } catch (err) {
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
        const confirm = window.confirm(`Are you sure you want to DELETE ${client.company_name}?`);
        if (!confirm) return;

        setDeletingId(client.id);
        try {
            await axios.delete(`${BASE_URL}/proposal/clients/delete/${client.id}/`);
            await fetchClients();
        } catch (error) {
            const errMsg = error.response?.data?.error || "Failed to delete client.";
            alert("Error: " + errMsg);
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };



    const handleBack = () => router.push("/admindashboard/");

    if (loading) return <p className="loader">Loading clients...</p>;
    if (error) return <p className="error">{error}</p>;

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
                            <td colSpan="7">No clients found.</td>
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
                                        const response = await axios.put(`${BASE_URL}/proposal/clients/update/${editClient.id}/`, formData);
                                        setClients(prev => prev.map(c => c.id === editClient.id ? response.data : c));
                                    } else {
                                        const response = await axios.post(`${BASE_URL}/proposal/clients/create/`, formData);
                                        setClients(prev => [...prev, response.data]);
                                    }
                                    // await fetchClients(); // Skipped to prevent stale cache overwrite
                                    setShowForm(false);
                                } catch (err) {
                                    alert("Failed to save client.");
                                    console.error(err);
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
