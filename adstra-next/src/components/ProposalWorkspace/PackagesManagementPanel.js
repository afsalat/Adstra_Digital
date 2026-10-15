"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCw,
  Layers,
  ChevronDown,
  ChevronUp,
  Package,
  Sparkles,
  AlertCircle,
  X,
  FileText,
  DollarSign,
  Tag,
  Loader2,
} from "lucide-react";
import API_BASE_URL from "@/utils/apiBase";
import { useModal } from "@/Context/ModalContext";
import styles from "./PackagesManagementPanel.module.css";

const DEFAULT_CATEGORIES = [
  "Marketing",
  "Development",
  "Design & Creative",
  "Media Production",
  "Enterprise",
  "Content",
  "Consulting",
  "Maintenance",
];

export default function PackagesManagementPanel({
  selectedPackageNames = [],
  onTogglePackage,
  onPackagesUpdated,
}) {
  const { showAlert, showConfirm } = useModal();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedScopeId, setExpandedScopeId] = useState(null);
  const [expandedItemsId, setExpandedItemsId] = useState(null);

  // Edit / Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Marketing");
  const [formDescription, setFormDescription] = useState("");
  const [formScope, setFormScope] = useState("");
  const [formItems, setFormItems] = useState([
    { description: "", quantity: 1, rate: 0, gst: 18 },
  ]);

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/proposal/packages/?t=${Date.now()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("adstra_cached_packages", JSON.stringify(data));
        }
        if (onPackagesUpdated) onPackagesUpdated(data);
      } else {
        // Fallback to cache if available
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("adstra_cached_packages");
          if (cached) setPackages(JSON.parse(cached));
        }
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("adstra_cached_packages");
        if (cached) setPackages(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, onPackagesUpdated]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    packages.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [packages]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (pkg.category || "").toLowerCase() === selectedCategory.toLowerCase();

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (pkg.name || "").toLowerCase().includes(q) ||
        (pkg.category || "").toLowerCase().includes(q) ||
        (pkg.description || "").toLowerCase().includes(q) ||
        (pkg.items || []).some((it) => (it.description || "").toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [packages, selectedCategory, search]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const formatCompactPrice = (val) => {
    if (!val || isNaN(val)) return "₹0";
    if (val >= 100000) {
      const l = val / 100000;
      return `₹${l % 1 === 0 ? l : l.toFixed(1)}L`;
    }
    if (val >= 1000) {
      const k = val / 1000;
      return `₹${k % 1 === 0 ? k : k.toFixed(0)}k`;
    }
    return `₹${val}`;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormName("");
    setFormCategory("Marketing");
    setFormDescription("");
    setFormScope("");
    setFormItems([{ description: "", quantity: 1, rate: 0, gst: 18 }]);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormName(pkg.name || "");
    setFormCategory(pkg.category || "Marketing");
    setFormDescription(pkg.description || "");
    setFormScope(pkg.scope_details || "");
    setFormItems(
      (pkg.items && pkg.items.length > 0)
        ? pkg.items.map((it) => ({
            id: it.id,
            description: it.description || "",
            quantity: Number(it.quantity) || 1,
            rate: Number(it.rate) || 0,
            gst: Number(it.gst) || 18,
          }))
        : [{ description: "", quantity: 1, rate: 0, gst: 18 }]
    );
    setModalOpen(true);
  };

  // Line Item Row Changes
  const handleItemChange = (index, field, value) => {
    setFormItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddItemRow = () => {
    setFormItems((prev) => [
      ...prev,
      { description: "", quantity: 1, rate: 0, gst: 18 },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (formItems.length <= 1) {
      setFormItems([{ description: "", quantity: 1, rate: 0, gst: 18 }]);
      return;
    }
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Modal Totals Calculation
  const modalCalculations = useMemo(() => {
    let subtotal = 0;
    let gstTotal = 0;
    formItems.forEach((it) => {
      const q = Number(it.quantity) || 1;
      const r = Number(it.rate) || 0;
      const g = Number(it.gst) || 18;
      const base = q * r;
      subtotal += base;
      gstTotal += (base * g) / 100;
    });
    return {
      subtotal,
      gstTotal,
      grossTotal: subtotal + gstTotal,
    };
  }, [formItems]);

  // Save (Create or Update)
  const handleSavePackage = async (e) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      showAlert("Validation Error", "Please provide a name for the package.");
      return;
    }

    const validItems = formItems.filter((it) => it.description.trim() !== "");
    if (validItems.length === 0) {
      showAlert("Validation Error", "Please add at least one line item with a description.");
      return;
    }

    setSaving(true);
    const payload = {
      name,
      category: formCategory.trim() || "General",
      description: formDescription.trim(),
      scope_details: formScope.trim(),
      items: validItems.map((it, idx) => ({
        description: it.description.trim(),
        quantity: Number(it.quantity) || 1,
        rate: Number(it.rate) || 0,
        gst: Number(it.gst) || 18,
        order: idx,
      })),
    };

    try {
      const url = editingPackage
        ? `${API_BASE_URL}/proposal/packages/update/${editingPackage.id}/`
        : `${API_BASE_URL}/proposal/packages/create/`;
      const method = editingPackage ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchPackages();
        showAlert(
          "Success",
          editingPackage
            ? `Package "${name}" has been updated.`
            : `Package "${name}" created successfully.`,
          "success"
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        showAlert(
          "Save Failed",
          errorData.error || errorData.detail || "Unable to save package.",
          "error"
        );
      }
    } catch (err) {
      console.error("Save error:", err);
      showAlert("Network Error", "Could not reach the server.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Package
  const handleDeletePackage = (pkg) => {
    showConfirm(
      "Delete Package",
      `Are you sure you want to delete "${pkg.name}"? This action cannot be undone.`,
      async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/proposal/packages/delete/${pkg.id}/`, {
            method: "DELETE",
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            await fetchPackages();
            showAlert("Deleted", `Package "${pkg.name}" was removed.`, "info");
          } else {
            showAlert("Error", "Could not delete package.", "error");
          }
        } catch (err) {
          showAlert("Network Error", "Could not reach the server.", "error");
        }
      },
      "danger"
    );
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    showConfirm(
      "Reset All Packages",
      "This will reset all packages to the official 18 Adstra Digital standard services. Custom packages will be replaced. Continue?",
      async () => {
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE_URL}/proposal/packages/reset/`, {
            method: "POST",
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            setPackages(data);
            if (typeof window !== "undefined") {
              localStorage.setItem("adstra_cached_packages", JSON.stringify(data));
            }
            if (onPackagesUpdated) onPackagesUpdated(data);
            showAlert("Reset Complete", "Service packages reset to default catalog.", "success");
          } else {
            showAlert("Error", "Could not reset packages.", "error");
          }
        } catch (err) {
          showAlert("Network Error", "Could not reach the server.", "error");
        } finally {
          setLoading(false);
        }
      },
      "warning"
    );
  };

  return (
    <div className={styles.panelContainer}>
      {/* Top action toolbar */}
      <div className={styles.topActions}>
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleOpenCreate}
            id="btn-create-package"
          >
            <Plus size={15} /> Add New Package
          </button>

          <div className={styles.actionRightGroup}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleResetDefaults}
              title="Reset to default 18 Adstra Digital services"
            >
              Reset Defaults
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={fetchPackages}
              title="Refresh package list"
              disabled={loading}
            >
              <RotateCw size={14} className={loading ? styles.spinning : ""} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search packages by title, service or deliverables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className={styles.categoryPills}>
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                className={`${styles.categoryPill} ${isActive ? styles.categoryPillActive : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Package Cards List */}
      <div className={styles.packageList}>
        {loading && packages.length === 0 ? (
          <div className={styles.emptyState}>
            <Loader2 size={24} className="animate-spin text-primary" />
            <p>Loading package catalog...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={32} />
            <strong className={styles.emptyStateTitle}>No packages found</strong>
            <p>No services match your search or selected category.</p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleOpenCreate}
              style={{ marginTop: "10px" }}
            >
              <Plus size={14} /> Create a new package
            </button>
          </div>
        ) : (
          filteredPackages.map((pkg) => {
            const isSelected = selectedPackageNames.includes(pkg.name);
            const isScopeExpanded = expandedScopeId === pkg.id;
            const isItemsExpanded = expandedItemsId === pkg.id;
            const marketPrice = pkg.total_amount || 0;

            return (
              <div
                key={pkg.id || pkg.name}
                className={`${styles.packageCard} ${isSelected ? styles.packageCardSelected : ""}`}
              >
                {/* Top Row: Category, Title & Price */}
                <div className={styles.cardTop}>
                  <div className={styles.cardHeadInfo}>
                    <span className={styles.cardCategory}>{pkg.category || "General"}</span>
                    <h3 className={styles.cardTitle}>{pkg.name}</h3>
                  </div>
                  <div className={styles.cardPriceGroup}>
                    <span className={styles.cardPriceBadge}>
                      {formatCompactPrice(marketPrice)}
                    </span>
                    <span className={styles.cardItemsCount}>
                      {pkg.items?.length || 0} line items
                    </span>
                  </div>
                </div>

                {/* Description */}
                {pkg.description && (
                  <p className={styles.cardDesc}>{pkg.description}</p>
                )}

                {/* Scope & Deliverables preview toggle */}
                {pkg.scope_details && (
                  <div>
                    <button
                      type="button"
                      className={styles.expandToggle}
                      onClick={() => setExpandedScopeId(isScopeExpanded ? null : pkg.id)}
                    >
                      <FileText size={12} />
                      {isScopeExpanded ? "Hide Proposal Deliverables" : "View Proposal Deliverables"}
                      {isScopeExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {isScopeExpanded && (
                      <div className={styles.scopeBox}>
                        <div className={styles.scopeTitle}>
                          <Sparkles size={12} style={{ color: "#4f46e5" }} />
                          Auto-generated Proposal Scope:
                        </div>
                        <div style={{ whiteSpace: "pre-line" }}>{pkg.scope_details}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Items Breakdown toggle */}
                <div>
                  <button
                    type="button"
                    className={styles.expandToggle}
                    onClick={() => setExpandedItemsId(isItemsExpanded ? null : pkg.id)}
                  >
                    <Layers size={12} />
                    {isItemsExpanded ? "Hide Line Items Breakdown" : "View Line Items Breakdown"}
                    {isItemsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {isItemsExpanded && pkg.items && pkg.items.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      <table className={styles.itemsTable}>
                        <thead>
                          <tr>
                            <th>Deliverable Description</th>
                            <th style={{ width: "40px", textAlign: "center" }}>Qty</th>
                            <th style={{ width: "80px", textAlign: "right" }}>Rate</th>
                            <th style={{ width: "50px", textAlign: "center" }}>GST</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pkg.items.map((it, idx) => (
                            <tr key={it.id || idx}>
                              <td>{it.description}</td>
                              <td style={{ textAlign: "center" }}>{it.quantity || 1}</td>
                              <td style={{ textAlign: "right", fontWeight: "600" }}>
                                {formatCurrency(it.rate || 0)}
                              </td>
                              <td style={{ textAlign: "center", color: "#64748b" }}>
                                {it.gst || 18}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className={styles.cardActions}>
                  {onTogglePackage && (
                    <button
                      type="button"
                      className={`${styles.addProposalBtn} ${isSelected ? styles.addProposalBtnAdded : ""}`}
                      onClick={() => onTogglePackage(pkg)}
                    >
                      {isSelected ? (
                        <>
                          <Check size={13} /> In Proposal (Remove)
                        </>
                      ) : (
                        <>
                          <Plus size={13} /> Add to Proposal
                        </>
                      )}
                    </button>
                  )}

                  <div className={styles.cardRightBtns}>
                    <button
                      type="button"
                      className={styles.cardActionBtn}
                      onClick={() => handleOpenEdit(pkg)}
                      title="Edit package & line items"
                      aria-label="Edit package"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.cardActionBtn} ${styles.cardDeleteBtn}`}
                      onClick={() => handleDeletePackage(pkg)}
                      title="Delete package"
                      aria-label="Delete package"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <Sparkles size={18} style={{ color: "#4f46e5" }} />
                {editingPackage ? `Edit Package: ${editingPackage.name}` : "Create New Service Package"}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Package Name *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="e.g. Next.js Web Application"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <input
                    type="text"
                    className={styles.input}
                    list="category-suggestions"
                    placeholder="e.g. Development, Marketing..."
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  />
                  <datalist id="category-suggestions">
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Summary Description</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  placeholder="Short client-facing overview of this package..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Proposal Scope & Deliverables (Included in Proposal Content)
                </label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Detailed bullets or scope text that automatically gets written to the proposal when selected..."
                  value={formScope}
                  onChange={(e) => setFormScope(e.target.value)}
                />
              </div>

              {/* Line items section */}
              <div className={styles.itemsSection}>
                <div className={styles.itemsSectionHead}>
                  <span className={styles.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Layers size={14} style={{ color: "#4f46e5" }} />
                    Deliverable Line Items ({formItems.length})
                  </span>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleAddItemRow}
                    style={{ padding: "4px 10px", fontSize: "11.5px" }}
                  >
                    <Plus size={13} /> Add Row
                  </button>
                </div>

                <div className={styles.itemRowHeader}>
                  <div className={styles.itemRow}>
                    <span>Description</span>
                    <span style={{ textAlign: "center" }}>Qty</span>
                    <span style={{ textAlign: "right" }}>Rate (₹)</span>
                    <span style={{ textAlign: "center" }}>GST %</span>
                    <span style={{ textAlign: "right" }}>Amount</span>
                    <span />
                  </div>
                </div>

                {formItems.map((item, idx) => {
                  const qty = Number(item.quantity) || 1;
                  const rate = Number(item.rate) || 0;
                  const lineTotal = qty * rate;

                  return (
                    <div key={idx} className={styles.itemRow}>
                      <input
                        type="text"
                        required
                        className={styles.input}
                        placeholder="Deliverable item..."
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      />
                      <input
                        type="number"
                        min="1"
                        className={styles.input}
                        style={{ textAlign: "center" }}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        className={styles.input}
                        style={{ textAlign: "right" }}
                        placeholder="0"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className={styles.input}
                        style={{ textAlign: "center" }}
                        value={item.gst}
                        onChange={(e) => handleItemChange(idx, "gst", e.target.value)}
                      />
                      <span style={{ textAlign: "right", fontWeight: "600", fontSize: "12px", color: "#1e293b" }}>
                        {formatCurrency(lineTotal)}
                      </span>
                      <button
                        type="button"
                        className={styles.cardActionBtn}
                        onClick={() => handleRemoveItemRow(idx)}
                        title="Remove row"
                        style={{ width: "26px", height: "26px", padding: 0 }}
                      >
                        <Trash2 size={12} color="#dc2626" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Modal footer with summary */}
              <div className={styles.modalFooter}>
                <div className={styles.summaryTotalBox}>
                  <span className={styles.summaryTotalLabel}>
                    Base: {formatCurrency(modalCalculations.subtotal)} + GST (18%): {formatCurrency(modalCalculations.gstTotal)}
                  </span>
                  <span className={styles.summaryTotalVal}>
                    Total Market Rate: {formatCurrency(modalCalculations.grossTotal)}
                  </span>
                </div>

                <div className={styles.modalBtns}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setModalOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={saving}
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {editingPackage ? "Save Changes" : "Create Package"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
