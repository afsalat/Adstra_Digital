"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  X,
  Plus,
  RotateCw,
  Maximize2,
  Calendar,
  Building2,
  Tag,
  Edit3,
  Eye,
  Trash2,
  Loader2,
  FileText,
  FilePlus2,
} from "lucide-react";
import API_BASE_URL from "@/utils/apiBase";
import { useModal } from "@/Context/ModalContext";
import styles from "./RecentProposalsPanel.module.css";

export default function RecentProposalsPanel({
  currentProposalId,
  onLoadProposal,
  onNewProposal,
  onOpenModal,
  isViewMode = false,
  isSaved = false,
}) {
  const { showAlert, showConfirm } = useModal();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'with-lead' | 'active'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'amount-high' | 'amount-low'

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/proposal/list/?t=${Date.now()}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch proposals.");
      }
      const data = await res.json();
      setProposals(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || "An error occurred while loading proposals.");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals, isSaved]);

  const handleDelete = (e, proposal) => {
    e.stopPropagation();
    const pNo = proposal.proposal_no || "this proposal";
    showConfirm(
      "Delete Proposal",
      `Are you sure you want to permanently delete proposal "${pNo}"? This action cannot be undone.`,
      async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/proposal/delete/${proposal.id}/`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            setProposals((prev) => prev.filter((p) => String(p.id) !== String(proposal.id)));
            showAlert("Deleted", `Proposal "${pNo}" has been removed.`, "success");
            if (String(currentProposalId) === String(proposal.id)) {
              if (onNewProposal) onNewProposal();
            }
          } else {
            showAlert("Error", "Failed to delete proposal. Please try again.", "error");
          }
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Delete error:", err);
          }
          showAlert("Error", "A network error occurred while deleting.", "error");
        }
      },
      "danger"
    );
  };

  const handleSelect = (proposal, action = "edit") => {
    if (onLoadProposal) {
      onLoadProposal(proposal, action);
    }
  };

  const filteredProposals = useMemo(() => {
    let result = [...proposals];

    // Filter by search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => {
        const pNo = (p.proposal_no || "").toLowerCase();
        const clientName = (p.client?.name || "").toLowerCase();
        const compName = (p.client?.company_name || p.company_name || "").toLowerCase();
        const leadNo = (p.source_lead?.lead_number || "").toLowerCase();
        const purpose = (p.purpose || "").toLowerCase();
        return (
          pNo.includes(q) ||
          clientName.includes(q) ||
          compName.includes(q) ||
          leadNo.includes(q) ||
          purpose.includes(q)
        );
      });
    }

    // Filter by tab
    if (filterTab === "active" && currentProposalId) {
      result = result.filter((p) => String(p.id) === String(currentProposalId));
    } else if (filterTab === "with-lead") {
      result = result.filter((p) => Boolean(p.source_lead?.lead_number));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return (a.id || 0) - (b.id || 0);
      }
      if (sortBy === "amount-high") {
        return (Number(b.total_amount) || 0) - (Number(a.total_amount) || 0);
      }
      if (sortBy === "amount-low") {
        return (Number(a.total_amount) || 0) - (Number(b.total_amount) || 0);
      }
      // default: newest
      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }, [proposals, search, filterTab, currentProposalId, sortBy]);

  const formatCurrency = (amt) => {
    if (amt === undefined || amt === null || isNaN(Number(amt))) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amt));
  };

  return (
    <div className={styles.container}>
      {/* Top Bar with count and quick actions */}
      <div className={styles.topBar}>
        <span className={styles.counter}>
          {loading
            ? "Loading proposals..."
            : `${filteredProposals.length} proposal${filteredProposals.length === 1 ? "" : "s"}`}
        </span>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.newBtn}
            onClick={onNewProposal}
            title="Create new proposal"
          >
            <Plus size={14} />
            <span>New</span>
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={fetchProposals}
            disabled={loading}
            title="Refresh proposal list"
            aria-label="Refresh proposals"
          >
            <RotateCw size={14} className={loading ? styles.spin : ""} />
          </button>
          {onOpenModal && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={onOpenModal}
              title="Expand to full table modal"
              aria-label="Expand table"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className={styles.searchWrapper}>
        <Search size={15} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search proposal, client, lead..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearch("")}
            title="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Filter Tabs & Sort */}
      <div className={styles.filtersRow}>
        <div className={styles.pillsGroup}>
          <button
            type="button"
            className={`${styles.pillBtn} ${filterTab === "all" ? styles.pillBtnActive : ""}`}
            onClick={() => setFilterTab("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`${styles.pillBtn} ${filterTab === "with-lead" ? styles.pillBtnActive : ""}`}
            onClick={() => setFilterTab("with-lead")}
          >
            With Lead
          </button>
          {currentProposalId && (
            <button
              type="button"
              className={`${styles.pillBtn} ${filterTab === "active" ? styles.pillBtnActive : ""}`}
              onClick={() => setFilterTab("active")}
            >
              Current
            </button>
          )}
        </div>

        <select
          className={styles.sortSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort proposals"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="amount-high">Highest ₹</option>
          <option value="amount-low">Lowest ₹</option>
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className={styles.errorWrapper}>
          <span>{error}</span>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={fetchProposals}
            style={{ alignSelf: "flex-start" }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && proposals.length === 0 && (
        <div className={styles.loadingWrapper}>
          <Loader2 size={24} className={styles.spin} style={{ color: "#4f46e5" }} />
          <span>Fetching proposals...</span>
        </div>
      )}

      {/* Proposals list */}
      {!loading && filteredProposals.length === 0 && !error && (
        <div className={styles.emptyState}>
          <FileText size={28} style={{ opacity: 0.4 }} />
          {search ? (
            <>
              <strong>No matches found</strong>
              <p>No proposals matching &quot;{search}&quot;</p>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setSearch("")}
                style={{ marginTop: "6px" }}
              >
                Clear filter
              </button>
            </>
          ) : (
            <>
              <strong>No proposals yet</strong>
              <p>Create your first proposal to see it listed here.</p>
              <button
                type="button"
                className={styles.newBtn}
                onClick={onNewProposal}
                style={{ marginTop: "8px" }}
              >
                <Plus size={14} /> New Proposal
              </button>
            </>
          )}
        </div>
      )}

      {filteredProposals.length > 0 && (
        <div className={styles.list}>
          {filteredProposals.map((p) => {
            const isActive = String(p.id) === String(currentProposalId);
            const clientDisplay =
              p.client?.company_name || p.company_name || p.client?.name || "Client";
            const formattedTotal = formatCurrency(p.total_amount);

            return (
              <div
                key={p.id}
                className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
                onClick={() => handleSelect(p, isViewMode ? "view" : "edit")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(p, isViewMode ? "view" : "edit");
                  }
                }}
              >
                {/* Header: Proposal No & Status or Date */}
                <div className={styles.cardHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className={styles.proposalNoBadge}>
                      {p.proposal_no || "Draft"}
                    </span>
                    {isActive && (
                      <span className={styles.activeIndicator}>
                        <span className={styles.activeDot} />
                        Active
                      </span>
                    )}
                  </div>
                  {p.date && (
                    <span className={styles.dateText}>
                      <Calendar size={12} />
                      {p.date}
                    </span>
                  )}
                </div>

                {/* Body: Client Name, Lead badge, Amount */}
                <div className={styles.cardBody}>
                  <div className={styles.clientName} title={clientDisplay}>
                    {clientDisplay}
                  </div>

                  <div className={styles.subDetails}>
                    {p.source_lead?.lead_number && (
                      <span className={styles.leadPill}>
                        <Tag size={11} />
                        Lead #{p.source_lead.lead_number}
                      </span>
                    )}
                    {formattedTotal && (
                      <span className={styles.amount}>{formattedTotal}</span>
                    )}
                  </div>

                  {p.purpose && p.purpose !== "Quotation for N/A" && (
                    <div className={styles.purpose} title={p.purpose}>
                      {p.purpose}
                    </div>
                  )}
                </div>

                {/* Footer: Quick Actions */}
                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(p, "edit");
                    }}
                    title="Edit Proposal"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(p, "view");
                    }}
                    title="View Proposal"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={(e) => handleDelete(e, p)}
                    title="Delete Proposal"
                    aria-label={`Delete proposal ${p.proposal_no || p.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
