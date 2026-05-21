"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import API_BASE_URL from "@/utils/apiBase";
import SettingsPanel from "@/components/common/SettingsPanel";
import "../InvoiceList.css";

import { useAuth } from "@/Context/AuthContext";

export default function ProformaInvoiceList() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [showTrash, setShowTrash] = useState(false);
  const [trashInvoices, setTrashInvoices] = useState([]);
  const [trashSearchTerm, setTrashSearchTerm] = useState("");
  const [trashStartDate, setTrashStartDate] = useState("");
  const [trashEndDate, setTrashEndDate] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  const API_BASE = API_BASE_URL;

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, startDate, endDate, invoices]);

  const fetchInvoices = () => {
    setIsLoading(true);
    axios
      .get(`${API_BASE}/invoice/?is_proforma=true`)
      .then((res) => {
        setInvoices(res.data);
        setFilteredInvoices(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to fetch proforma invoices:", err);
        }
        setIsLoading(false);
      });
  };

  const handleStatusChange = (invoiceId, newStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [invoiceId]: true }));
    axios
      .patch(`${API_BASE}/invoice/status/${invoiceId}/`, { status: newStatus })
      .then(() => {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: newStatus } : inv
          )
        );
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to update status:", err);
        }
        alert("Could not update status. Please try again.");
      })
      .finally(() => {
        setUpdatingStatus((prev) => ({ ...prev, [invoiceId]: false }));
      });
  };

  const handleDeleteInvoice = (invoiceId, invoiceNo) => {
    if (!window.confirm(`Move proforma ${invoiceNo} to trash?`)) return;
    axios
      .delete(`${API_BASE}/invoice/delete/${invoiceId}/`)
      .then(() => {
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to delete proforma:", err);
        }
        alert("Could not move to trash. Please try again.");
      });
  };

  const fetchTrashInvoices = () => {
    axios
      .get(`${API_BASE}/invoice/trash/?_=${Date.now()}`)
      .then((res) => {
        // Filter trash locally for proforma
        const proformaTrash = res.data.filter(inv => inv.is_proforma);
        setTrashInvoices(proformaTrash);
        setTrashSearchTerm("");
        setTrashStartDate("");
        setTrashEndDate("");
        setShowTrash(true);
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to fetch trash:", err);
        }
        alert("Could not load trash.");
      });
  };

  const handleRestoreInvoice = (invoiceId) => {
    axios
      .patch(`${API_BASE}/invoice/restore/${invoiceId}/`)
      .then(() => {
        setTrashInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
        fetchInvoices();
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to restore proforma:", err);
        }
        alert("Could not restore.");
      });
  };

  const handleHardDeleteInvoice = (invoiceId, invoiceNo) => {
    if (!window.confirm(`Are you sure you want to permanently delete proforma ${invoiceNo}? This action cannot be undone.`)) return;
    axios
      .delete(`${API_BASE}/invoice/hard-delete/${invoiceId}/`)
      .then(() => {
        setTrashInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to permanently delete invoice:", err);
        }
        alert("Could not delete invoice permanently.");
      });
  };

  const filterInvoices = () => {
    let result = invoices;

    if (searchTerm) {
      result = result.filter(
        (inv) =>
          (inv.invoice_no || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inv.client?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (inv.proposal?.purpose || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (inv) => inv.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (startDate) {
      result = result.filter(inv => {
        if (!inv.date) return false;
        return new Date(inv.date) >= new Date(startDate);
      });
    }

    if (endDate) {
      result = result.filter(inv => {
        if (!inv.date) return false;
        return new Date(inv.date) <= new Date(endDate);
      });
    }

    setFilteredInvoices(result);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Adstra Digital - Proforma Invoice List", 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [
        [
          "#",
          "Proforma No",
          "Proposal No",
          "Purpose",
          "Client",
          "Amount",
          "Status",
        ],
      ],
      body: filteredInvoices.map((inv, index) => [
        index + 1,
        inv.invoice_no,
        inv.proposal?.proposal_no || "N/A",
        inv.proposal?.purpose || "N/A",
        inv.client?.name || "N/A",
        `${Number(inv.total_amount).toLocaleString("en-IN")}`,
        inv.status,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    doc.save("proforma_invoices.pdf");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredTrashInvoices = trashInvoices.filter((inv) => {
    const matchesSearch =
      !trashSearchTerm ||
      inv.invoice_no?.toLowerCase().includes(trashSearchTerm.toLowerCase()) ||
      (inv.client?.company_name || inv.client?.name || "")
        .toLowerCase()
        .includes(trashSearchTerm.toLowerCase());

    let matchesDate = true;
    if (trashStartDate) {
      matchesDate = matchesDate && inv.date >= trashStartDate;
    }
    if (trashEndDate) {
      matchesDate = matchesDate && inv.date <= trashEndDate;
    }
    return matchesSearch && matchesDate;
  });

  return (
    <div className="layout-container">
      <aside className="layout-sidebar">
        <div className="sidebar-header">
          <button
            onClick={() => router.push("/admindashboard/")}
            className="btn-back"
          >
            ← Back
          </button>
          <h2 className="sidebar-title">Proforma</h2>
        </div>

        <div className="sidebar-controls" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Link href="/invoices/proforma/create/" className="btn-create full-width">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Proforma
          </Link>

          <button className="btn-download full-width" onClick={downloadPDF}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export PDF
          </button>

          <div className="control-group">
            <label>Search</label>
            <div className="search-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Number, Client, Purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="control-group">
            <label>Filter Status</label>
            <div className="filter-wrapper">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="control-group">
            <label>Date Range</label>
            <div className="date-inputs">
              <input type="date" className="date-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" className="date-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="divider" style={{ marginTop: "auto" }}></div>
          {(user?.username?.toLowerCase() === "wilson" || user?.fullname?.toLowerCase() === "wilson" || user?.is_staff || user?.is_superuser) && (
            <button className="btn-settings full-width" onClick={() => setShowSettings(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Settings
            </button>
          )}
          <button className="btn-trash full-width" onClick={fetchTrashInvoices}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4h6v2"></path>
            </svg>
            Trash / Bin
          </button>
        </div>
      </aside>

      <main className="layout-content">
        <div className="content-header mobile-only">
          <h2>Proforma Invoices</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon icon-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Proformas</p>
              <h3 className="stat-value">{invoices.length}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Amount</p>
              <h3 className="stat-value">₹{invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0).toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Proforma Details</th>
                  <th>Client</th>
                  <th>Proposal</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="loading-spinner"></div> Loading...</td></tr>
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv, index) => (
                    <motion.tr key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="invoice-id">{inv.invoice_no}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : "Date N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="client-info">
                          <div className="client-avatar">{getInitials(inv.client?.company_name || inv.client?.name)}</div>
                          <div><span className="d-block font-weight-bold">{inv.client?.company_name || inv.client?.name || "Unknown Client"}</span></div>
                        </div>
                      </td>
                      <td>{inv.proposal ? <><span className="purpose-text">{inv.proposal.purpose}</span><br/><small className="text-muted">{inv.proposal.proposal_no}</small></> : <span className="text-muted">Direct</span>}</td>
                      <td><span className="amount">₹{Number(inv.total_amount).toLocaleString("en-IN")}</span></td>
                      <td>
                        <select value={inv.status} disabled={updatingStatus[inv.id]} onChange={(e) => handleStatusChange(inv.id, e.target.value)} className={`status-select status-select--${inv.status?.replace('_', '-')}`}>
                          <option value="unpaid">Unpaid</option>
                          <option value="partially_paid">Partially Paid</option>
                          <option value="paid">Paid</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ display: "flex", gap: "6px" }}>
                        <button className="btn-action" onClick={() => router.push(`/invoices/result/?invoiceID=${inv.invoice_no}`)} title="View"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                        {(user?.username?.toLowerCase() === "wilson" || user?.fullname?.toLowerCase() === "wilson" || user?.is_staff || user?.is_superuser) && (
                          <button className="btn-action btn-action--edit" onClick={() => router.push(`/invoices/edit/?id=${inv.id}`)} title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                        )}
                        <button className="btn-action btn-action--danger" onClick={() => handleDeleteInvoice(inv.id, inv.invoice_no)} title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg></button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr><td colSpan="6"><div className="empty-state"><h3>No proforma invoices found</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {showTrash && (
        <div className="status-modal-overlay" onClick={() => setShowTrash(false)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header"><h3>Trash (Proforma)</h3><button className="close-btn" onClick={() => setShowTrash(false)}>✕</button></div>
            <div className="status-modal-body">
              {trashInvoices.length === 0 ? <p className="text-center text-muted">Trash is empty.</p> : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead><tr><th>No</th><th>Client</th><th>Action</th></tr></thead>
                    <tbody>
                      {trashInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td>{inv.invoice_no}</td>
                          <td>{inv.client?.name}</td>
                          <td style={{ display: "flex", gap: "8px" }}>
                            <button className="btn btn-sm btn-success" onClick={() => handleRestoreInvoice(inv.id)}>Restore</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleHardDeleteInvoice(inv.id, inv.invoice_no)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSettings && (user?.username?.toLowerCase() === "wilson" || user?.fullname?.toLowerCase() === "wilson" || user?.is_staff || user?.is_superuser) && (
        <div className="status-modal-overlay" onClick={() => setShowSettings(false)} style={{ zIndex: 2000 }}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%' }}>
            <div className="status-modal-header">
              <h3>Invoice Settings</h3>
              <button className="close-btn" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="status-modal-body" style={{ padding: '0', backgroundColor: '#f8fafc' }}>
              <SettingsPanel API_BASE={API_BASE} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
