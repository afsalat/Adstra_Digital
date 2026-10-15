"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Plus, ChevronDown, Check, ArrowUp, ArrowDown } from "lucide-react";
import MetaFiltersPanel from "./MetaFiltersPanel";

/**
 * Authentic Meta Icons matching Image 1
 */
// 1. Columns Icon (3 vertical bars)
const MetaColumnsIcon = ({ size = 14, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <rect x="2" y="2" width="3" height="12" rx="0.8" />
    <rect x="6.5" y="2" width="3" height="12" rx="0.8" />
    <rect x="11" y="2" width="3" height="12" rx="0.8" />
  </svg>
);

// 2. Customize Columns Icon (horizontal lines with gear teeth on bottom right)
const MetaCustomizeColumnsIcon = ({ size = 15, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <line x1="2" y1="4.5" x2="14" y2="4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2" y1="8" x2="9.5" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2" y1="11.5" x2="7.5" y2="11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="11.5" cy="11.5" r="2.2" stroke={color} strokeWidth="1.4" />
    <path d="M11.5 8.5v1M11.5 13.5v1M8.5 11.5h1M13.5 11.5h1" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// 3. Sorting Arrows Icon (up and down vertical arrows)
const MetaSortArrowsIcon = ({ size = 14, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M4.5 12V4M4.5 4L2 6.5M4.5 4L7 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.5 4V12M11.5 12L9 9.5M11.5 12L14 9.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 4. Sort Rules / Priority Icon (3 horizontal lines with indented cascade)
const MetaSortRulesIcon = ({ size = 14, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <line x1="2.5" y1="4.5" x2="13.5" y2="4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2.5" y1="8" x2="10.5" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2.5" y1="11.5" x2="6.5" y2="11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 5. Breakdowns Icon (top wide bar + two subordinate indented bars)
const MetaBreakdownIcon = ({ size = 14, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <rect x="1.5" y="2.5" width="13" height="2.8" rx="0.6" />
    <rect x="5.5" y="6.8" width="9" height="2.8" rx="0.6" />
    <rect x="5.5" y="11.1" width="9" height="2.8" rx="0.6" />
  </svg>
);

/**
 * MetaCreateViewDrawer
 * Matches Meta Ads Manager Create View / Save Edits panel (Image 1 & Image 2)
 */
export default function MetaCreateViewDrawer({
  isOpen,
  onClose,
  onSaveView,
  onSaveCopy,
  initialData = null,
  activeFiltersList = ["Impressions (Campaign) > 0"],
  drawerTitle = null,
  drawerMode = "create", // "create" | "edit" | "save_edits"
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState("only_you");

  // Settings Toggles & Subfields
  const [filtersEnabled, setFiltersEnabled] = useState(true);
  const [filterChips, setFilterChips] = useState(["Impressions (Campaign) > 0"]);
  const [newFilterSelectOpen, setNewFilterSelectOpen] = useState(false);

  // Columns & Sorting (Image 1)
  const [columnsEnabled, setColumnsEnabled] = useState(true);
  const [columnPreset, setColumnPreset] = useState("Copy of Performance");
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [sortingColumn, setSortingColumn] = useState("Delivery");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" | "desc"
  const [sortOrderMenuOpen, setSortOrderMenuOpen] = useState(false);
  const [customizeColumnsNotice, setCustomizeColumnsNotice] = useState(false);

  // Breakdowns (Image 1)
  const [breakdownsEnabled, setBreakdownsEnabled] = useState(true);
  const [breakdown, setBreakdown] = useState("None selected");
  const [breakdownDropdownOpen, setBreakdownDropdownOpen] = useState(false);

  // Attribution Settings (Image 1)
  const [attributionEnabled, setAttributionEnabled] = useState(true);
  const [attribution, setAttribution] = useState("7-day click or 1-day view");
  const [attributionComparisons, setAttributionComparisons] = useState([]);
  const [comparisonDropdownOpen, setComparisonDropdownOpen] = useState(false);

  const [pinToTopBar, setPinToTopBar] = useState(true);
  const [validationError, setValidationError] = useState("");

  // Refs for clicking outside dropdown menus
  const columnDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const sortOrderRef = useRef(null);
  const breakdownDropdownRef = useRef(null);
  const comparisonDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(e.target)) {
        setColumnDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
      if (sortOrderRef.current && !sortOrderRef.current.contains(e.target)) {
        setSortOrderMenuOpen(false);
      }
      if (breakdownDropdownRef.current && !breakdownDropdownRef.current.contains(e.target)) {
        setBreakdownDropdownOpen(false);
      }
      if (comparisonDropdownRef.current && !comparisonDropdownRef.current.contains(e.target)) {
        setComparisonDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Preload initial data based on mode & initialData
  useEffect(() => {
    if (drawerMode === "edit" || drawerMode === "save_edits" || (initialData && drawerMode !== "create")) {
      const defaultName = drawerMode === "edit" ? "Had delivery" : "Active ads";
      setName(initialData?.name || defaultName);
      setDescription(initialData?.description || "");
      setAccess(initialData?.access || "only_you");
      setFiltersEnabled(initialData?.settings?.filtersEnabled ?? true);
      setFilterChips(
        initialData?.settings?.filters && initialData.settings.filters.length > 0
          ? initialData.settings.filters
          : activeFiltersList && activeFiltersList.length > 0
          ? activeFiltersList
          : ["Impressions (Campaign) > 0"]
      );
      setColumnsEnabled(initialData?.settings?.columnsEnabled ?? true);
      setColumnPreset(initialData?.settings?.columnPreset || "Copy of Performance");
      setSortingColumn(initialData?.settings?.sortingColumn || "Delivery");
      setSortDirection(initialData?.settings?.sortDirection || "asc");
      setBreakdownsEnabled(initialData?.settings?.breakdownsEnabled ?? true);
      setBreakdown(initialData?.settings?.breakdown || "None selected");
      setAttributionEnabled(initialData?.settings?.attributionEnabled ?? true);
      setAttribution(initialData?.settings?.attribution || "7-day click or 1-day view");
      setAttributionComparisons(initialData?.settings?.attributionComparisons || []);
      setPinToTopBar(initialData?.settings?.pinToTopBar ?? true);
    } else {
      // Create view mode matching Image 1
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setAccess("only_you");
      setFiltersEnabled(true);
      setFilterChips(
        activeFiltersList && activeFiltersList.length > 0
          ? activeFiltersList
          : ["Impressions (Campaign) > 0"]
      );
      setColumnsEnabled(true);
      setColumnPreset("Copy of Performance");
      setSortingColumn("Delivery");
      setSortDirection("asc");
      setBreakdownsEnabled(true);
      setBreakdown("None selected");
      setAttributionEnabled(true);
      setAttribution("7-day click or 1-day view");
      setAttributionComparisons([]);
      setPinToTopBar(true);
    }
    setValidationError("");
  }, [initialData, isOpen, activeFiltersList, drawerMode]);

  if (!isOpen) return null;

  const buildPayload = (overrideName) => {
    const fallbackName =
      drawerMode === "edit"
        ? "Had delivery"
        : drawerMode === "save_edits"
        ? "Active ads"
        : columnPreset || "New view";
    const finalName = (overrideName !== undefined ? overrideName : name).trim() || fallbackName;
    return {
      id: initialData?.id || `view_${Date.now()}`,
      name: finalName,
      description: description.trim(),
      access,
      settings: {
        filtersEnabled,
        filters: filtersEnabled ? filterChips : [],
        columnsEnabled,
        columnPreset,
        sortingColumn,
        sortDirection,
        breakdownsEnabled,
        breakdown,
        attributionEnabled,
        attribution,
        attributionComparisons,
        pinToTopBar,
      },
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = () => {
    const finalName = name.trim() || columnPreset || "Custom view";
    onSaveView(buildPayload(finalName));
  };

  const handleSaveCopy = () => {
    const finalName = name.trim() || columnPreset || "Custom view";
    if (onSaveCopy) {
      onSaveCopy(buildPayload(finalName));
    } else {
      handleSave();
    }
  };

  const isEditing = drawerMode === "edit" || drawerMode === "save_edits" || Boolean(initialData);
  const titleText =
    drawerTitle ||
    (drawerMode === "edit"
      ? "Edit view"
      : drawerMode === "save_edits"
      ? "Save edits"
      : drawerMode === "create"
      ? "Create view"
      : isEditing
      ? "Save edits"
      : "Create view");

  return (
    <div
      role="region"
      aria-label={titleText}
      style={{
        width: 320,
        minWidth: 320,
        maxWidth: 340,
        height: "100%",
        maxHeight: "100%",
        background: "#ffffff",
        borderLeft: "1px solid #cbd5e1",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        animation: "fadeIn 0.15s ease",
      }}
    >
      {/* Header matching Image 1 & Image 2 */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#ffffff",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: "0.94rem",
            fontWeight: 700,
            color: "#1c1e21",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {titleText}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            padding: 3,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Body matching Image 1 & Image 2 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "12px 14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          scrollbarWidth: "thin",
          scrollbarColor: "#94a3b8 #f1f5f9",
        }}
      >
        {/* View Name (if needed) */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 4,
            }}
          >
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1c1e21",
              }}
            >
              Name
            </label>
            <div
              title="Name of this quick view"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: "#1c1e21",
                color: "#ffffff",
                fontSize: "0.58rem",
                fontWeight: 700,
                cursor: "help",
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              i
            </div>
          </div>
          <input
            type="text"
            maxLength={100}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationError) setValidationError("");
            }}
            placeholder={
              drawerMode === "edit"
                ? "Had delivery"
                : drawerMode === "save_edits"
                ? "Active ads"
                : "Name your view"
            }
            style={{
              width: "100%",
              height: 32,
              padding: "5px 10px",
              borderRadius: 5,
              border: validationError ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: "0.82rem",
              color: "#1c1e21",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => {
              if (!validationError) e.currentTarget.style.borderColor = "#0064e1";
            }}
            onBlur={(e) => {
              if (!validationError) e.currentTarget.style.borderColor = "#cbd5e1";
            }}
          />
          {validationError && (
            <p style={{ margin: "3px 0 0", fontSize: "0.7rem", color: "#ef4444" }}>
              {validationError}
            </p>
          )}
        </div>

        {/* Description Field (Image 2) */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#1c1e21",
              marginBottom: 4,
            }}
          >
            Description
          </label>
          <textarea
            rows={2}
            maxLength={350}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this view is about. 0/350"
            style={{
              width: "100%",
              height: 48,
              padding: "5px 10px",
              borderRadius: 5,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              fontSize: "0.82rem",
              color: "#1c1e21",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.3,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#0064e1")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
          />
        </div>

        {/* Access Field (Image 2) */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#1c1e21",
              marginBottom: 4,
            }}
          >
            Access
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={access}
              onChange={(e) => setAccess(e.target.value)}
              style={{
                width: "100%",
                height: 32,
                padding: "5px 28px 5px 10px",
                borderRadius: 5,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "0.82rem",
                color: "#1c1e21",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="only_you">Only you</option>
              <option value="shared">Anyone with access to this ad account</option>
            </select>
            <ChevronDown
              size={14}
              color="#1c1e21"
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#e2e8f0", margin: "1px 0" }} />

        {/* Settings Section matching Image 1 & Image 2 */}
        <div>
          <h3
            style={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#1c1e21",
              margin: "0 0 2px",
            }}
          >
            Settings
          </h3>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#65676b",
              margin: "0 0 10px",
              lineHeight: 1.3,
            }}
          >
            Turn on the settings to apply them when you open this quick view.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* 1. FILTERS ROW (Matching Image 1) */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21" }}>
                  Filters
                </span>
                <ToggleSwitch
                  checked={filtersEnabled}
                  onChange={() => setFiltersEnabled((prev) => !prev)}
                />
              </div>

              {filtersEnabled && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {/* Selected Filter Chips matching Image 1 */}
                  {filterChips.map((chip, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#f0f2f5",
                        borderRadius: 4,
                        padding: "6px 10px",
                        fontSize: "0.8rem",
                        color: "#1c1e21",
                        border: "none",
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 400,
                        }}
                      >
                        {chip}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFilterChips((prev) => prev.filter((_, i) => i !== idx))
                        }
                        title="Remove filter"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#65676b",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          marginLeft: 8,
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#1c1e21")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {/* + Add button matching Image 1 */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setNewFilterSelectOpen(true)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: "transparent",
                        border: "none",
                        padding: "2px 0",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#0064e1",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} color="#0064e1" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. COLUMNS ROW (Matching Image 1) */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21" }}>
                  Columns
                </span>
                <ToggleSwitch
                  checked={columnsEnabled}
                  onChange={() => setColumnsEnabled((prev) => !prev)}
                />
              </div>

              {columnsEnabled && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 7 }}>
                  {/* Row 1: Columns Dropdown + Customize Button */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
                    {/* Left: Columns Selector Button */}
                    <div ref={columnDropdownRef} style={{ flex: 1, position: "relative", minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => setColumnDropdownOpen((prev) => !prev)}
                        style={{
                          width: "100%",
                          height: 34,
                          padding: "0 10px",
                          borderRadius: 4,
                          border: "1px solid #ccd0d5",
                          background: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "border-color 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8a8d91")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccd0d5")}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, overflow: "hidden" }}>
                          <MetaColumnsIcon size={14} color="#1c1e21" />
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              color: "#1c1e21",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Columns: {columnPreset}
                          </span>
                        </div>
                        <ChevronDown size={14} color="#1c1e21" style={{ flexShrink: 0, marginLeft: 4 }} />
                      </button>

                      {/* Columns Dropdown Menu */}
                      {columnDropdownOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            width: 250,
                            background: "#ffffff",
                            border: "1px solid #ccd0d5",
                            borderRadius: 6,
                            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                            zIndex: 9999,
                            maxHeight: 280,
                            overflowY: "auto",
                            padding: "4px 0",
                          }}
                        >
                          {[
                            "Performance (default)",
                            "Copy of Performance",
                            "Setup",
                            "Engagement",
                            "Leads",
                            "Video engagement",
                            "App engagement",
                            "Carousel engagement",
                            "Performance and clicks",
                            "Offline conversions",
                            "Targeting and creative",
                            "Bidding and optimization",
                            "Custom",
                          ].map((presetName) => {
                            const isSelected =
                              columnPreset === presetName ||
                              (presetName === "Copy of Performance" && columnPreset === "Copy of Performance") ||
                              (presetName.startsWith("Performance") && columnPreset === "Performance");
                            return (
                              <button
                                key={presetName}
                                type="button"
                                onClick={() => {
                                  setColumnPreset(presetName);
                                  setColumnDropdownOpen(false);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "7px 12px",
                                  border: "none",
                                  background: isSelected ? "#eff6ff" : "transparent",
                                  color: isSelected ? "#0064e1" : "#1c1e21",
                                  fontSize: "0.8rem",
                                  fontWeight: isSelected ? 600 : 400,
                                  textAlign: "left",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = "#f0f2f5";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <span>{presetName}</span>
                                {isSelected && <Check size={14} color="#0064e1" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right: Customize Columns Button matching Image 1 */}
                    <button
                      type="button"
                      onClick={() => setCustomizeColumnsNotice((prev) => !prev)}
                      title="Customize columns"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 4,
                        border: "1px solid #ccd0d5",
                        background: customizeColumnsNotice ? "#eff6ff" : "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8a8d91")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccd0d5")}
                    >
                      <MetaCustomizeColumnsIcon size={15} color={customizeColumnsNotice ? "#0064e1" : "#1c1e21"} />
                    </button>
                  </div>

                  {/* Row 2: Sorting Dropdown + Direction Button + Rules Button matching Image 1 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
                    {/* Left: Sorting Dropdown */}
                    <div ref={sortDropdownRef} style={{ flex: 1, position: "relative", minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => setSortDropdownOpen((prev) => !prev)}
                        style={{
                          width: "100%",
                          height: 34,
                          padding: "0 10px",
                          borderRadius: 4,
                          border: "1px solid #ccd0d5",
                          background: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "border-color 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8a8d91")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccd0d5")}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, overflow: "hidden" }}>
                          <MetaSortArrowsIcon size={14} color="#1c1e21" />
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              color: "#1c1e21",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Sorting: {sortingColumn}
                          </span>
                        </div>
                        <ChevronDown size={14} color="#1c1e21" style={{ flexShrink: 0, marginLeft: 4 }} />
                      </button>

                      {/* Sort Dropdown Menu */}
                      {sortDropdownOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            width: 200,
                            background: "#ffffff",
                            border: "1px solid #ccd0d5",
                            borderRadius: 6,
                            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                            zIndex: 9999,
                            maxHeight: 250,
                            overflowY: "auto",
                            padding: "4px 0",
                          }}
                        >
                          {[
                            "Delivery",
                            "Campaign name",
                            "Bid strategy",
                            "Budget",
                            "Attribution setting",
                            "Results",
                            "Reach",
                            "Impressions",
                            "Cost per result",
                            "Amount spent",
                            "Ends",
                          ].map((field) => {
                            const isSelected = sortingColumn === field;
                            return (
                              <button
                                key={field}
                                type="button"
                                onClick={() => {
                                  setSortingColumn(field);
                                  setSortDropdownOpen(false);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "6px 12px",
                                  border: "none",
                                  background: isSelected ? "#eff6ff" : "transparent",
                                  color: isSelected ? "#0064e1" : "#1c1e21",
                                  fontSize: "0.8rem",
                                  fontWeight: isSelected ? 600 : 400,
                                  textAlign: "left",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = "#f0f2f5";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <span>{field}</span>
                                {isSelected && <Check size={14} color="#0064e1" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Middle: Sort Direction Button (↑ / ↓) matching Image 1 */}
                    <button
                      type="button"
                      onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                      title={sortDirection === "asc" ? "Sort ascending (click to change)" : "Sort descending (click to change)"}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 4,
                        border: "1px solid #ccd0d5",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                        fontSize: "0.95rem",
                        color: "#1c1e21",
                        fontWeight: 700,
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8a8d91")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccd0d5")}
                    >
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </button>

                    {/* Right: Sort Rules Button matching Image 1 */}
                    <div ref={sortOrderRef} style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => setSortOrderMenuOpen((prev) => !prev)}
                        title="Sort rules & options"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 4,
                          border: "1px solid #ccd0d5",
                          background: sortOrderMenuOpen ? "#eff6ff" : "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "all 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8a8d91")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccd0d5")}
                      >
                        <MetaSortRulesIcon size={14} color="#1c1e21" />
                      </button>

                      {/* Sort Rules Popover */}
                      {sortOrderMenuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            right: 0,
                            width: 220,
                            background: "#ffffff",
                            border: "1px solid #ccd0d5",
                            borderRadius: 6,
                            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                            zIndex: 9999,
                            padding: "10px",
                          }}
                        >
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                            Sort options
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#65676b", marginBottom: 8, lineHeight: 1.3 }}>
                            Primary: <strong style={{ color: "#1c1e21" }}>{sortingColumn}</strong> ({sortDirection === "asc" ? "Ascending" : "Descending"})
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#65676b", marginBottom: 8, lineHeight: 1.3 }}>
                            Secondary: <strong style={{ color: "#1c1e21" }}>Campaign name</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSortOrderMenuOpen(false)}
                            style={{
                              width: "100%",
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: "none",
                              background: "#0064e1",
                              color: "#ffffff",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. BREAKDOWNS ROW (Matching Image 1) */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21" }}>
                  Breakdowns
                </span>
                <ToggleSwitch
                  checked={breakdownsEnabled}
                  onChange={() => setBreakdownsEnabled((prev) => !prev)}
                />
              </div>

              {breakdownsEnabled && (
                <div ref={breakdownDropdownRef} style={{ marginTop: 8, position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setBreakdownDropdownOpen((prev) => !prev)}
                    style={{
                      width: "100%",
                      height: 34,
                      padding: "0 10px",
                      borderRadius: 4,
                      border: "1px solid #ccd0d5",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      transition: "border-color 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8a8d91")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ccd0d5")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
                      <MetaBreakdownIcon size={14} color="#1c1e21" />
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          color: "#1c1e21",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Breakdowns: {breakdown}
                      </span>
                    </div>
                    <ChevronDown size={14} color="#1c1e21" style={{ flexShrink: 0, marginLeft: 4 }} />
                  </button>

                  {/* Breakdowns Dropdown Menu */}
                  {breakdownDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        width: "100%",
                        background: "#ffffff",
                        border: "1px solid #ccd0d5",
                        borderRadius: 6,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                        zIndex: 9999,
                        maxHeight: 280,
                        overflowY: "auto",
                        padding: "4px 0",
                      }}
                    >
                      {/* None selected */}
                      <button
                        type="button"
                        onClick={() => {
                          setBreakdown("None selected");
                          setBreakdownDropdownOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "7px 12px",
                          border: "none",
                          background: breakdown === "None selected" ? "#eff6ff" : "transparent",
                          color: breakdown === "None selected" ? "#0064e1" : "#1c1e21",
                          fontSize: "0.8rem",
                          fontWeight: breakdown === "None selected" ? 600 : 400,
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (breakdown !== "None selected") e.currentTarget.style.background = "#f0f2f5";
                        }}
                        onMouseLeave={(e) => {
                          if (breakdown !== "None selected") e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span>None selected</span>
                        {breakdown === "None selected" && <Check size={14} color="#0064e1" />}
                      </button>

                      {/* Group 1: By Time */}
                      <div
                        style={{
                          padding: "6px 12px 2px",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#65676b",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        By Time
                      </div>
                      {["Time: Day", "Time: Week", "Time: 2 weeks", "Time: Month"].map((item) => {
                        const isSelected = breakdown === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setBreakdown(item);
                              setBreakdownDropdownOpen(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "6px 12px 6px 20px",
                              border: "none",
                              background: isSelected ? "#eff6ff" : "transparent",
                              color: isSelected ? "#0064e1" : "#1c1e21",
                              fontSize: "0.78rem",
                              fontWeight: isSelected ? 600 : 400,
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "#f0f2f5";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <span>{item.replace("Time: ", "")}</span>
                            {isSelected && <Check size={14} color="#0064e1" />}
                          </button>
                        );
                      })}

                      {/* Group 2: By Delivery */}
                      <div
                        style={{
                          padding: "6px 12px 2px",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#65676b",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        By Delivery
                      </div>
                      {[
                        "Delivery: Age",
                        "Delivery: Gender",
                        "Delivery: Age and gender",
                        "Delivery: Country",
                        "Delivery: Region",
                        "Delivery: Impression device",
                        "Delivery: Platform & placement",
                      ].map((item) => {
                        const isSelected = breakdown === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setBreakdown(item);
                              setBreakdownDropdownOpen(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "6px 12px 6px 20px",
                              border: "none",
                              background: isSelected ? "#eff6ff" : "transparent",
                              color: isSelected ? "#0064e1" : "#1c1e21",
                              fontSize: "0.78rem",
                              fontWeight: isSelected ? 600 : 400,
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "#f0f2f5";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <span>{item.replace("Delivery: ", "")}</span>
                            {isSelected && <Check size={14} color="#0064e1" />}
                          </button>
                        );
                      })}

                      {/* Group 3: By Action */}
                      <div
                        style={{
                          padding: "6px 12px 2px",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#65676b",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        By Action
                      </div>
                      {[
                        "Action: Conversion device",
                        "Action: Destination",
                        "Action: Video view type",
                      ].map((item) => {
                        const isSelected = breakdown === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setBreakdown(item);
                              setBreakdownDropdownOpen(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "6px 12px 6px 20px",
                              border: "none",
                              background: isSelected ? "#eff6ff" : "transparent",
                              color: isSelected ? "#0064e1" : "#1c1e21",
                              fontSize: "0.78rem",
                              fontWeight: isSelected ? 600 : 400,
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "#f0f2f5";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <span>{item.replace("Action: ", "")}</span>
                            {isSelected && <Check size={14} color="#0064e1" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. ATTRIBUTION SETTINGS ROW (Matching Image 1) */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21" }}>
                  Attribution settings
                </span>
                <ToggleSwitch
                  checked={attributionEnabled}
                  onChange={() => setAttributionEnabled((prev) => !prev)}
                />
              </div>

              {attributionEnabled && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {/* Selected comparison models if any */}
                  {attributionComparisons.map((model, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#f0f2f5",
                        borderRadius: 4,
                        padding: "6px 10px",
                        fontSize: "0.8rem",
                        color: "#1c1e21",
                      }}
                    >
                      <span>Comparison: {model}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttributionComparisons((prev) => prev.filter((_, i) => i !== idx))
                        }
                        title="Remove comparison"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#65676b",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {/* + Add comparison button matching Image 1 */}
                  <div ref={comparisonDropdownRef} style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setComparisonDropdownOpen((prev) => !prev)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "transparent",
                        border: "none",
                        padding: "2px 0",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: "#1c1e21",
                        cursor: "pointer",
                        transition: "color 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#0064e1")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#1c1e21")}
                    >
                      <Plus size={15} color="currentColor" />
                      <span>Add comparison</span>
                    </button>

                    {/* Comparison Model Selector Dropdown */}
                    {comparisonDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          width: 220,
                          background: "#ffffff",
                          border: "1px solid #ccd0d5",
                          borderRadius: 6,
                          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                          zIndex: 9999,
                          padding: "4px 0",
                        }}
                      >
                        <div
                          style={{
                            padding: "6px 12px 4px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#65676b",
                          }}
                        >
                          Select comparison model
                        </div>
                        {[
                          "1-day click",
                          "7-day click",
                          "28-day click",
                          "1-day view",
                          "1-day click or 1-day view",
                        ].map((model) => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => {
                              if (!attributionComparisons.includes(model)) {
                                setAttributionComparisons((prev) => [...prev, model]);
                              }
                              setComparisonDropdownOpen(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "6px 12px",
                              border: "none",
                              background: "transparent",
                              color: "#1c1e21",
                              fontSize: "0.78rem",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Footer matching Image 1 & Image 2 */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {drawerMode === "create" ? (
          <>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "6px 14px",
                borderRadius: 4,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#1c1e21",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: "6px 18px",
                borderRadius: 4,
                border: "none",
                background: "#0064e1",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0, 100, 225, 0.2)",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0053ba")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSaveCopy}
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#1c1e21",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
            >
              Save copy
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: "6px 16px",
                borderRadius: 4,
                border: "none",
                background: "#0064e1",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0, 100, 225, 0.2)",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0053ba")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
            >
              Save edits
            </button>
          </>
        )}
      </div>

      {/* Meta Filters Panel Modal */}
      {newFilterSelectOpen && (
        <MetaFiltersPanel
          isOpen={newFilterSelectOpen}
          onClose={() => setNewFilterSelectOpen(false)}
          selectedFilters={filterChips}
          onApply={(updatedFilters) => {
            setFilterChips(updatedFilters);
            setNewFilterSelectOpen(false);
          }}
          mode="docked"
        />
      )}
    </div>
  );
}

// Meta-styled toggle switch matching Image 1
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 34,
        height: 20,
        borderRadius: 10,
        background: checked ? "#0064e1" : "#ced0d4",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.15s ease",
        padding: 0,
        outline: "none",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 16 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
          transition: "left 0.15s cubic-bezier(0.16, 1, 0.3, 1), background 0.15s ease",
        }}
      />
    </button>
  );
}
