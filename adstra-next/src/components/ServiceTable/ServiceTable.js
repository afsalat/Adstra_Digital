"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  Search,
  PackagePlus,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { predefinedServices } from "../../data/clientData";
import styles from "./ServiceTable.module.css";

export default function ServiceTable({
  services = [],
  onChange,
  onServiceSelect,
  onServiceUnselect,
  packages = null,
  onOpenPackageManagement,
}) {
  const lastInputRef = useRef(null);
  const [selectedService, setSelectedService] = useState([]);
  const [packageSearch, setPackageSearch] = useState("");
  const [catalogueExpanded, setCatalogueExpanded] = useState(false);

  // Dynamic packages map
  const activePackagesMap = useMemo(() => {
    if (packages && packages.length > 0) {
      const map = {};
      packages.forEach((pkg) => {
        map[pkg.name] = (pkg.items || []).map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 1,
          rate: Number(it.rate) || 0,
          gst: `${it.gst || 18}%`,
        }));
      });
      return map;
    }
    return predefinedServices;
  }, [packages]);

  const activePackagesMeta = useMemo(() => {
    if (packages && packages.length > 0) {
      const meta = {};
      packages.forEach((pkg) => {
        meta[pkg.name] = pkg;
      });
      return meta;
    }
    return {};
  }, [packages]);

  // Sync selected categories from current services
  useEffect(() => {
    const categoriesInServices = new Set(
      services.map((s) => s.category).filter(Boolean)
    );
    setSelectedService(Array.from(categoriesInServices));
  }, [services]);

  const uniqBy = (arr, key) =>
    Array.from(new Map(arr.map((x) => [x[key], x])).values());

  const handleTogglePackage = (serviceName) => {
    const isCurrentlySelected = selectedService.includes(serviceName);

    if (!isCurrentlySelected) {
      // Add package
      const servicesWithoutCategory = services.filter(
        (s) => s.category !== serviceName
      );
      const subItems = activePackagesMap[serviceName] || predefinedServices[serviceName] || [];
      const formatted = subItems.map((item) => ({
        ...item,
        category: serviceName,
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        gst: parseFloat(item.gst) || 18,
        amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0),
      }));

      const merged = uniqBy(
        [...servicesWithoutCategory, ...formatted],
        "description"
      );
      onChange(merged);
      setSelectedService((prev) => [...prev, serviceName]);

      if (onServiceSelect) onServiceSelect(serviceName, activePackagesMeta[serviceName]);
    } else {
      // Remove package
      const updatedServices = services.filter(
        (s) => s.category !== serviceName
      );
      onChange(updatedServices);
      setSelectedService((prev) => prev.filter((cat) => cat !== serviceName));

      if (onServiceUnselect) onServiceUnselect(serviceName);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...services];
    let val = value;
    if (field === "quantity" || field === "rate" || field === "gst") {
      val = Number(value) || 0;
    }
    updated[index] = { ...updated[index], [field]: val };
    const qty = Number(updated[index].quantity) || 0;
    const rate = Number(updated[index].rate) || 0;
    updated[index].amount = qty * rate;
    onChange(updated);
  };

  const addItem = () => {
    onChange([
      ...services,
      {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
        gst: 18,
        category: "Custom",
      },
    ]);
  };

  const removeItem = (index) => {
    const removedItem = services[index];
    const updated = services.filter((_, i) => i !== index);
    onChange(updated);

    if (removedItem?.category) {
      const stillHasCategory = updated.some(
        (s) => s.category === removedItem.category
      );
      if (!stillHasCategory) {
        setSelectedService((prev) =>
          prev.filter((c) => c !== removedItem.category)
        );
        if (onServiceUnselect) onServiceUnselect(removedItem.category);
      }
    }
  };

  const subtotal = useMemo(() => {
    return services.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  }, [services]);

  const gst = useMemo(() => {
    return services.reduce((sum, item) => {
      const base =
        parseFloat(item.amount) ||
        (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      const rate = Number(item.gst) || 18;
      return sum + (base * rate) / 100;
    }, 0);
  }, [services]);

  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const getPackageTotal = (serviceName) => {
    if (activePackagesMeta[serviceName]?.total_amount) {
      return activePackagesMeta[serviceName].total_amount;
    }
    const items = activePackagesMap[serviceName] || predefinedServices[serviceName] || [];
    return items.reduce(
      (sum, it) => sum + (Number(it.rate) || 0) * (Number(it.quantity) || 1),
      0
    );
  };

  const formatCompactPrice = (val) => {
    if (!val || isNaN(val)) return null;
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

  const allCategories = Object.keys(activePackagesMap);
  const filteredCategories = packageSearch.trim()
    ? allCategories.filter((c) =>
        c.toLowerCase().includes(packageSearch.trim().toLowerCase())
      )
    : allCategories;

  return (
    <div className={styles.container}>
      {/* Catalogue / Packages Section */}
      <section className={styles.catalogueSection}>
        <div className={styles.catalogueHeader}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={14} style={{ color: "#4f46e5" }} />
            <span>Service Packages</span>
          </h2>
          <div className={styles.headerActions}>
            {onOpenPackageManagement && (
              <button
                type="button"
                className={styles.manageBtn}
                onClick={onOpenPackageManagement}
                title="Manage Service Packages & Addons"
              >
                <PackagePlus size={12} />
                <span>Manage</span>
              </button>
            )}
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setCatalogueExpanded((prev) => !prev)}
              aria-label={catalogueExpanded ? "Collapse catalogue" : "Expand catalogue"}
            >
              {catalogueExpanded ? (
                <span className={styles.toggleBtnContent}>
                  Hide <ChevronUp size={12} />
                </span>
              ) : (
                <span className={styles.toggleBtnContent}>
                  Show ({allCategories.length}) <ChevronDown size={12} />
                </span>
              )}
            </button>
          </div>
        </div>

        {catalogueExpanded && (
          <>
            <div className={styles.packageSearch}>
              <Search size={13} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search packages (e.g. SEO, Web Dev, Mobile)..."
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
              />
            </div>

            <div className={styles.packagesGrid}>
              {filteredCategories.map((cat) => {
                const isSelected = selectedService.includes(cat);
                const pkgTotal = getPackageTotal(cat);
                const priceBadge = formatCompactPrice(pkgTotal);

                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.packageChip} ${
                      isSelected ? styles.packageChipActive : ""
                    }`}
                    onClick={() => handleTogglePackage(cat)}
                    title={`Click to add/remove ${cat} (Market Value: ${formatCurrency(pkgTotal)})`}
                  >
                    {isSelected && (
                      <span className={styles.chipCheck}>
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                    <span className={styles.chipLabel}>{cat}</span>
                    {priceBadge && (
                      <span className={styles.chipPriceTag}>{priceBadge}</span>
                    )}
                  </button>
                );
              })}
              {filteredCategories.length === 0 && (
                <div style={{ fontSize: "11.5px", color: "#94a3b8", padding: "6px 0" }}>
                  No packages match &quot;{packageSearch}&quot;
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Line Items Section */}
      <section className={styles.itemsSection}>
        <div className={styles.itemsHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 className={styles.sectionTitle} style={{ textTransform: "none", fontSize: "13px" }}>
              Line Items
            </h2>
            <span className={styles.badge}>{services.length}</span>
          </div>
          <button type="button" className={styles.addItemBtn} onClick={addItem}>
            <Plus size={14} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Empty state */}
        {services.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <PackagePlus size={22} />
            </div>
            <p className={styles.emptyTitle}>No services added yet</p>
            <p className={styles.emptySubtitle}>
              Select service packages from above or add custom line items to build your quote.
            </p>
            <button
              type="button"
              className={styles.addItemBtn}
              onClick={addItem}
              style={{ marginTop: "6px" }}
            >
              <Plus size={14} /> Add First Item
            </button>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {services.map((item, idx) => {
              const lineTotal =
                (Number(item.quantity) || 0) * (Number(item.rate) || 0);

              return (
                <div key={idx} className={styles.itemCard}>
                  {/* Card Top: Index, Category tag, Delete */}
                  <div className={styles.itemCardHeader}>
                    <div className={styles.itemIndexPill}>
                      <span className={styles.indexNumber}>{idx + 1}</span>
                      {item.category && (
                        <span className={styles.categoryTag}>{item.category}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => removeItem(idx)}
                      title="Remove line item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Description input */}
                  <div>
                    <input
                      className={styles.descriptionInput}
                      placeholder="Service or item description..."
                      value={item.description || ""}
                      onChange={(e) =>
                        handleItemChange(idx, "description", e.target.value)
                      }
                      ref={idx === services.length - 1 ? lastInputRef : null}
                    />
                  </div>

                  {/* Pricing grid: Qty, Rate, GST, Line Total */}
                  <div className={styles.pricingGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Qty</label>
                      <input
                        type="number"
                        className={styles.numberInput}
                        value={item.quantity ?? 1}
                        min={1}
                        onFocus={(e) => e.target.select()}
                        onBlur={(e) => {
                          if (e.target.value === "" || Number(e.target.value) <= 0) {
                            handleItemChange(idx, "quantity", 1);
                          }
                        }}
                        onChange={(e) =>
                          handleItemChange(idx, "quantity", e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Rate (₹)</label>
                      <input
                        type="number"
                        className={styles.numberInput}
                        value={item.rate ?? 0}
                        min={0}
                        onFocus={(e) => e.target.select()}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            handleItemChange(idx, "rate", 0);
                          }
                        }}
                        onChange={(e) =>
                          handleItemChange(idx, "rate", e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>GST</label>
                      <select
                        className={styles.gstSelect}
                        value={Number(item.gst) || 18}
                        onChange={(e) =>
                          handleItemChange(idx, "gst", Number(e.target.value))
                        }
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>

                    <div className={styles.lineTotalBox}>
                      <label className={styles.fieldLabel}>Amount</label>
                      <div className={styles.lineTotalValue}>
                        {formatCurrency(lineTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Commercial Summary Card */}
      <section className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryTitle}>Commercial Summary</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span style={{ fontWeight: "600", color: "#1e293b" }}>
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span>Estimated GST</span>
          <span style={{ fontWeight: "600", color: "#1e293b" }}>
            {formatCurrency(gst)}
          </span>
        </div>
        <hr className={styles.summaryDivider} />
        <div className={styles.summaryTotalRow}>
          <span>Total Quotation</span>
          <span className={styles.totalAmount}>{formatCurrency(total)}</span>
        </div>
      </section>
    </div>
  );
}
