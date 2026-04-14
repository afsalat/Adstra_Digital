"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API_BASE_URL from "@/utils/apiBase";
import "./ReceiptList.css";

/* ─────────────────── helpers ─────────────────── */
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatINR(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

const PAYMENT_MODE_LABELS = {
  upi: "UPI",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  other: "Other",
};

function PaymentModeBadge({ mode }) {
  const key = (mode || "other").toLowerCase().replace(/\s+/g, "_");
  const label = PAYMENT_MODE_LABELS[key] || mode || "—";
  return (
    <span className={`receipt-mode-badge mode-${key}`}>
      {label}
    </span>
  );
}

/* ─────────────────── icons (inline svg) ─────── */
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconPlus = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconDownload = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconSearch = () => (
  <svg className="receipt-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconView = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconReceipt = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="14" y2="14" />
  </svg>
);
const IconCurrency = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconTrending = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconFileX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="10" y1="13" x2="14" y2="17" />
    <line x1="14" y1="13" x2="10" y2="17" />
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);

/* ─────────────────── component ──────────────── */
export default function ReceiptManager() {
  const router = useRouter();
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first
  const [showInvoiceCol, setShowInvoiceCol] = useState(true);
  const [showModeCol, setShowModeCol] = useState(true);
  const [receiptNoMin, setReceiptNoMin] = useState("");
  const [receiptNoMax, setReceiptNoMax] = useState("");

  // Trash
  const [showTrash, setShowTrash] = useState(false);
  const [trashReceipts, setTrashReceipts] = useState([]);
  const [trashSearchTerm, setTrashSearchTerm] = useState("");
  const [trashStartDate, setTrashStartDate] = useState("");
  const [trashEndDate, setTrashEndDate] = useState("");

  /* fetch */
  const fetchReceipts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/transactions/list-create/`);
      setReceipts(res.data);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  /* fetch trash */
  const fetchTrashReceipts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/transactions/trash/?_=${Date.now()}`);
      setTrashReceipts(res.data);
      setTrashSearchTerm("");
      setTrashStartDate("");
      setTrashEndDate("");
      setShowTrash(true);
    } catch (err) {
      console.error("Error fetching trash:", err);
      alert("Could not load trash.");
    }
  }, []);

  const handleRestoreReceipt = async (receiptId) => {
    try {
      await axios.patch(`${API_BASE_URL}/transactions/restore/${receiptId}/`);
      setTrashReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      fetchReceipts();
    } catch (err) {
      console.error("Error restoring receipt:", err);
      alert("Could not restore receipt.");
    }
  };

  const handleDeleteReceipt = async (receiptId, receiptNo) => {
    if (!window.confirm(`Move receipt ${receiptNo || ""} to trash?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/transactions/delete/${receiptId}/`);
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    } catch (err) {
      console.error("Error deleting receipt:", err);
      alert("Could not move receipt to trash.");
    }
  };

  /* filtered list — sorted newest first */
  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (r.client_name || "").toLowerCase().includes(q) ||
        (r.invoice?.invoice_no || "").toLowerCase().includes(q);

      const matchesMode =
        modeFilter === "all" ||
        (r.payment_mode || "").toLowerCase().replace(/\s+/g, "_") === modeFilter;

      const rDate = r.date ? new Date(r.date) : null;
      const matchesStart = !startDate || (rDate && rDate >= new Date(startDate));
      const matchesEnd = !endDate || (rDate && rDate <= new Date(endDate));

      return matchesSearch && matchesMode && matchesStart && matchesEnd;
    }).sort((a, b) => {
      const da = a.date ? new Date(a.date) : new Date(0);
      const db = b.date ? new Date(b.date) : new Date(0);
      return sortOrder === "desc" ? db - da : da - db;
    }).filter((_, idx) => {
      const serial = idx + 1;
      const min = parseInt(receiptNoMin, 10);
      const max = parseInt(receiptNoMax, 10);
      if (!isNaN(min) && serial < min) return false;
      if (!isNaN(max) && serial > max) return false;
      return true;
    });
  }, [receipts, search, modeFilter, startDate, endDate, sortOrder, receiptNoMin, receiptNoMax]);

  /* stats */
  const stats = useMemo(() => {
    const total = receipts.length;
    const totalAmt = receipts.reduce((s, r) => s + Number(r.amount || 0), 0);

    const now = new Date();
    const monthAmt = receipts
      .filter((r) => {
        if (!r.date) return false;
        const d = new Date(r.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, r) => s + Number(r.amount || 0), 0);

    const avg = total > 0 ? Math.round(totalAmt / total) : 0;

    return { total, totalAmt, monthAmt, avg };
  }, [receipts]);

  /* filtered trash */
  const filteredTrashReceipts = useMemo(() => {
    return trashReceipts.filter((r) => {
      const q = trashSearchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (r.client_name || "").toLowerCase().includes(q) ||
        (r.receipt_no || "").toLowerCase().includes(q);

      const rDate = r.date ? new Date(r.date) : null;
      let matchesDate = true;
      if (trashStartDate) matchesDate = matchesDate && rDate && rDate >= new Date(trashStartDate);
      if (trashEndDate) matchesDate = matchesDate && rDate && rDate <= new Date(trashEndDate);

      return matchesSearch && matchesDate;
    });
  }, [trashReceipts, trashSearchTerm, trashStartDate, trashEndDate]);

  /* export PDF */
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Adstra Digital — Receipt List", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Invoice No", "Client", "Amount", "Date", "Payment Mode"]],
      body: filtered.map((r, i) => [
        i + 1,
        r.invoice?.invoice_no || "—",
        r.client_name || "—",
        formatINR(r.amount),
        formatDate(r.date),
        PAYMENT_MODE_LABELS[(r.payment_mode || "").toLowerCase().replace(/\s+/g, "_")] || r.payment_mode || "—",
      ]),
      styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 253, 250] },
    });

    doc.save("receipts.pdf");
  };

  /* ───── render ───── */
  return (
    <div className="receipt-layout">
      {/* ── Sidebar ── */}
      <aside className="receipt-sidebar">
        <div className="receipt-sidebar-header">
          <button
            className="receipt-btn-back"
            onClick={() => router.push("/admindashboard/")}
            aria-label="Go back to dashboard"
          >
            <IconBack /> Back
          </button>
          <h2 className="receipt-sidebar-title">Receipts</h2>
        </div>

        <div className="receipt-controls">
          <Link href="/receipts/create/" className="receipt-btn-create">
            <IconPlus /> Add Receipt
          </Link>

          <button className="receipt-btn-export" onClick={exportPDF}>
            <IconDownload /> Export PDF
          </button>

          {/* Search */}
          <div className="receipt-control-group">
            <label htmlFor="receipt-search">Search</label>
            <div className="receipt-search-wrapper">
              <IconSearch />
              <input
                id="receipt-search"
                type="text"
                className="receipt-search-input"
                placeholder="Client or Invoice No…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div className="receipt-control-group">
            <label htmlFor="receipt-mode">Payment Mode</label>
            <select
              id="receipt-mode"
              className="receipt-select"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
            >
              <option value="all">All Modes</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="receipt-control-group">
            <label>Date Range</label>
            <div className="receipt-date-inputs">
              <input
                type="date"
                className="receipt-date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Start date"
              />
              <input
                type="date"
                className="receipt-date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="End date"
              />
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Settings */}
          <div className="receipt-settings">
            <button
              className="receipt-settings-toggle"
              onClick={() => setSettingsOpen((o) => !o)}
              aria-expanded={settingsOpen}
            >
              <span className="receipt-settings-toggle-left">
                <IconSettings />
                Settings
              </span>
              <IconChevron open={settingsOpen} />
            </button>

            {settingsOpen && (
              <div className="receipt-settings-body">
                {/* Sort Order */}
                <div className="receipt-settings-row">
                  <span className="receipt-settings-label">Sort Order</span>
                  <div className="receipt-sort-pills">
                    <button
                      className={`receipt-sort-pill${sortOrder === "desc" ? " active" : ""}`}
                      onClick={() => setSortOrder("desc")}
                    >
                      Newest First
                    </button>
                    <button
                      className={`receipt-sort-pill${sortOrder === "asc" ? " active" : ""}`}
                      onClick={() => setSortOrder("asc")}
                    >
                      Oldest First
                    </button>
                  </div>
                </div>

                {/* Receipt Number Range */}
                <div className="receipt-settings-row">
                  <span className="receipt-settings-label">Receipt # Range</span>
                  <div className="receipt-no-range">
                    <input
                      type="number"
                      className="receipt-no-input"
                      placeholder="From"
                      min="1"
                      value={receiptNoMin}
                      onChange={(e) => setReceiptNoMin(e.target.value)}
                      aria-label="Receipt number from"
                    />
                    <span className="receipt-no-sep">—</span>
                    <input
                      type="number"
                      className="receipt-no-input"
                      placeholder="To"
                      min="1"
                      value={receiptNoMax}
                      onChange={(e) => setReceiptNoMax(e.target.value)}
                      aria-label="Receipt number to"
                    />
                  </div>
                  {(receiptNoMin || receiptNoMax) && (
                    <button
                      className="receipt-no-clear"
                      onClick={() => { setReceiptNoMin(""); setReceiptNoMax(""); }}
                    >
                      Clear range
                    </button>
                  )}
                </div>

                {/* Columns */}
                <div className="receipt-settings-group-label">Visible Columns</div>
                <label className="receipt-settings-check">
                  <input
                    type="checkbox"
                    checked={showInvoiceCol}
                    onChange={(e) => setShowInvoiceCol(e.target.checked)}
                  />
                  <span>Invoice</span>
                </label>
                <label className="receipt-settings-check">
                  <input
                    type="checkbox"
                    checked={showModeCol}
                    onChange={(e) => setShowModeCol(e.target.checked)}
                  />
                  <span>Payment Mode</span>
                </label>
              </div>
            )}
          </div>

          <button className="receipt-btn-trash" onClick={fetchTrashReceipts}>
            <IconFileX /> Trash / Bin
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="receipt-content">
        <div className="receipt-mobile-header">
          <h2>Receipt Management</h2>
        </div>

        {/* Stats */}
        <div className="receipt-stats-grid">
          <motion.div
            className="receipt-stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <div className="receipt-stat-icon receipt-icon-teal">
              <IconReceipt />
            </div>
            <div className="receipt-stat-info">
              <p className="receipt-stat-label">Total Receipts</p>
              <h3 className="receipt-stat-value">{stats.total}</h3>
            </div>
          </motion.div>

          <motion.div
            className="receipt-stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="receipt-stat-icon receipt-icon-blue">
              <IconCurrency />
            </div>
            <div className="receipt-stat-info">
              <p className="receipt-stat-label">Total Amount</p>
              <h3 className="receipt-stat-value">{formatINR(stats.totalAmt)}</h3>
            </div>
          </motion.div>

          <motion.div
            className="receipt-stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="receipt-stat-icon receipt-icon-green">
              <IconCalendar />
            </div>
            <div className="receipt-stat-info">
              <p className="receipt-stat-label">This Month</p>
              <h3 className="receipt-stat-value">{formatINR(stats.monthAmt)}</h3>
            </div>
          </motion.div>

          <motion.div
            className="receipt-stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="receipt-stat-icon receipt-icon-purple">
              <IconTrending />
            </div>
            <div className="receipt-stat-info">
              <p className="receipt-stat-label">Avg per Receipt</p>
              <h3 className="receipt-stat-value">{formatINR(stats.avg)}</h3>
            </div>
          </motion.div>
        </div>

        {/* Table */}
        <motion.div
          className="receipt-table-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="receipt-table-header">
            <p className="receipt-table-title">All Receipts</p>
            <span className="receipt-count-badge">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="receipt-table-responsive">
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>#</th>
                  {showInvoiceCol && <th>Invoice</th>}
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Date</th>
                  {showModeCol && <th>Payment Mode</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5 + (showInvoiceCol ? 1 : 0) + (showModeCol ? 1 : 0)}>
                      <div className="receipt-loading">
                        <div className="receipt-spinner" />
                        Loading receipts…
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5 + (showInvoiceCol ? 1 : 0) + (showModeCol ? 1 : 0)}>
                      <div className="receipt-empty-state">
                        <div className="receipt-empty-icon">
                          <IconFileX />
                        </div>
                        <h3>No receipts found</h3>
                        <p>Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filtered.map((receipt, index) => (
                      <motion.tr
                        key={receipt.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.25 }}
                      >
                        <td>
                          <span className="receipt-serial">{index + 1}</span>
                        </td>
                        {showInvoiceCol && (
                          <td>
                            {receipt.invoice?.invoice_no ? (
                              <span className="receipt-invoice-no">{receipt.invoice.invoice_no}</span>
                            ) : (
                              <span className="receipt-no-invoice">—</span>
                            )}
                          </td>
                        )}
                        <td>
                          <div className="receipt-client-info">
                            <div className="receipt-client-avatar" aria-hidden="true">
                              {getInitials(receipt.client_name)}
                            </div>
                            <span className="receipt-client-name">{receipt.client_name || "—"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="receipt-amount">{formatINR(receipt.amount)}</span>
                        </td>
                        <td>
                          <span className="receipt-date">{formatDate(receipt.date)}</span>
                        </td>
                        {showModeCol && (
                          <td>
                            <PaymentModeBadge mode={receipt.payment_mode} />
                          </td>
                        )}
                        <td>
                          <div className="receipt-actions">
                            <button
                              className="receipt-btn-action"
                              onClick={() => router.push(`/receipts/result?id=${receipt.id}`)}
                              title="View receipt"
                              aria-label={`View receipt ${receipt.id}`}
                            >
                              <IconView />
                            </button>
                            <button
                              className="receipt-btn-action receipt-btn-action--danger"
                              onClick={() => handleDeleteReceipt(receipt.id, receipt.receipt_no)}
                              title="Move to trash"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {showTrash && (
        <div className="receipt-trash-overlay" onClick={() => setShowTrash(false)}>
          <div className="receipt-trash-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-trash-header">
              <h3>Trash (Deleted Receipts)</h3>
              <button className="receipt-trash-close" onClick={() => setShowTrash(false)}>✕</button>
            </div>
            <div className="receipt-trash-body">
              <div className="receipt-trash-filters">
                <input
                  type="text"
                  placeholder="Search..."
                  value={trashSearchTerm}
                  onChange={(e) => setTrashSearchTerm(e.target.value)}
                  className="receipt-trash-search"
                />
                <input
                  type="date"
                  value={trashStartDate}
                  onChange={(e) => setTrashStartDate(e.target.value)}
                  placeholder="Start date"
                  className="receipt-trash-date"
                />
                <input
                  type="date"
                  value={trashEndDate}
                  onChange={(e) => setTrashEndDate(e.target.value)}
                  placeholder="End date"
                  className="receipt-trash-date"
                />
              </div>
              {filteredTrashReceipts.length === 0 ? (
                <p className="receipt-trash-empty">Trash is empty.</p>
              ) : (
                <div className="receipt-table-responsive">
                  <table className="receipt-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Receipt No</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrashReceipts.map((receipt, index) => (
                        <tr key={receipt.id}>
                          <td>{index + 1}</td>
                          <td>{receipt.receipt_no || "—"}</td>
                          <td>{receipt.client_name || "—"}</td>
                          <td>{formatINR(receipt.amount)}</td>
                          <td>
                            <button
                              className="receipt-btn-restore"
                              onClick={() => handleRestoreReceipt(receipt.id)}
                            >
                              Restore
                            </button>
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
    </div>
  );
}
