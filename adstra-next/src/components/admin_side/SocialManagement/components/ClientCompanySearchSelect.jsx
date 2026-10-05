"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, Building2 } from "lucide-react";

export default function ClientCompanySearchSelect({
  clients = [],
  value,
  onChange,
  allowAll = false,
  allLabel = "All Client Companies",
  placeholder = "Search & select client company...",
  variant = "form", // 'form' | 'header'
  disabled = false,
  showInactive = false,
  allowClear = false,
  clearLabel = "None (No Client Company)",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Active clients filter
  const availableClients = useMemo(() => {
    if (showInactive) return clients;
    return clients.filter((c) => c.is_active !== false);
  }, [clients, showInactive]);

  // Find currently selected client object
  const selectedItem = useMemo(() => {
    if (allowAll && (value === "all" || value === "" || value === null || value === undefined)) {
      return { id: "all", name: allLabel, primary_color: "#4f46e5" };
    }
    if (!value || value === "none" || value === "") return null;
    return availableClients.find((c) => String(c.id) === String(value)) || null;
  }, [availableClients, value, allowAll, allLabel]);

  // Filter list based on search term (suggestions)
  const filteredClients = useMemo(() => {
    let list = [...availableClients];
    if (allowAll) {
      list = [{ id: "all", name: allLabel, primary_color: "#4f46e5", isAll: true }, ...list];
    } else if (allowClear) {
      list = [{ id: "", name: clearLabel, isClear: true }, ...list];
    }
    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase().trim();
    return list.filter((c) => {
      if (c.isClear) return clearLabel.toLowerCase().includes(term);
      const nameMatch = c.name?.toLowerCase().includes(term);
      const emailMatch = c.client_email?.toLowerCase().includes(term);
      const contactMatch = c.client_contact?.toLowerCase().includes(term);
      return nameMatch || emailMatch || contactMatch;
    });
  }, [availableClients, searchTerm, allowAll, allLabel, allowClear, clearLabel]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    onChange(item.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredClients.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredClients.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredClients[highlightedIndex]) {
        handleSelect(filteredClients[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const isHeader = variant === "header";

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: isHeader ? "auto" : "100%",
        minWidth: isHeader ? 220 : "100%",
        userSelect: "none",
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: isHeader ? "7px 12px" : "9px 12px",
          background: "#ffffff",
          borderRadius: isHeader ? 10 : 8,
          minHeight: isHeader ? "auto" : 40,
          border: isOpen
            ? isHeader
              ? "1.5px solid #4f46e5"
              : "1.5px solid #2563eb"
            : "1px solid #cbd5e1",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: isOpen
            ? isHeader
              ? "0 0 0 3px rgba(79, 70, 229, 0.15)"
              : "0 0 0 3px rgba(37, 99, 235, 0.12)"
            : "none",
          transition: "all 0.15s ease",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: selectedItem?.primary_color
                ? `${selectedItem.primary_color}20`
                : "#e0e7ff",
              color: selectedItem?.primary_color || "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.72rem",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {selectedItem?.isAll ? (
              <Building2 size={13} />
            ) : selectedItem?.name ? (
              selectedItem.name.charAt(0).toUpperCase()
            ) : (
              <Building2 size={13} />
            )}
          </div>
          <span
            style={{
              fontSize: isHeader ? "0.82rem" : "0.86rem",
              fontWeight: 600,
              color: selectedItem ? "#0f172a" : "#94a3b8",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedItem ? selectedItem.name : placeholder}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {allowClear && selectedItem && !selectedItem.isAll && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              style={{
                background: "transparent",
                border: "none",
                padding: "2px",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                borderRadius: 4,
              }}
              title="Clear client selection"
            >
              <X size={15} />
            </button>
          )}
          <ChevronDown
            size={16}
            color="#64748b"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* Floating Suggestions & Search Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 99999,
            background: "#ffffff",
            borderRadius: 12,
            border: "1.5px solid #cbd5e1",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minWidth: isHeader ? 260 : "100%",
          }}
        >
          {/* Live Search Input */}
          <div
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #f1f5f9",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Search size={14} color="#64748b" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to filter companies..."
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#0f172a",
                outline: "none",
                padding: "4px 0",
              }}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 2,
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Suggestions List */}
          <div
            ref={listRef}
            style={{
              maxHeight: 260,
              overflowY: "auto",
              padding: "4px 0",
            }}
          >
            {filteredClients.length === 0 ? (
              <div
                style={{
                  padding: "16px 14px",
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                No client company found matching "{searchTerm}"
              </div>
            ) : (
              filteredClients.map((client, idx) => {
                const isSelected =
                  allowAll && client.id === "all"
                    ? value === "all" || !value
                    : client.isClear
                    ? !value || value === ""
                    : String(client.id) === String(value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={client.id || "clear-opt"}
                    onClick={() => handleSelect(client)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: isSelected
                        ? "#eef2ff"
                        : isHighlighted
                        ? "#f8fafc"
                        : "transparent",
                      transition: "background 0.1s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          background: client.isClear
                            ? "#f1f5f9"
                            : client.primary_color
                            ? `${client.primary_color}18`
                            : "#f1f5f9",
                          color: client.isClear
                            ? "#64748b"
                            : client.primary_color || "#4f46e5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          flexShrink: 0,
                          border: client.isClear
                            ? "1px dashed #cbd5e1"
                            : `1px solid ${client.primary_color || "#4f46e5"}30`,
                        }}
                      >
                        {client.isClear ? (
                          <X size={13} />
                        ) : client.isAll ? (
                          <Building2 size={14} />
                        ) : (
                          client.name?.charAt(0).toUpperCase() || "C"
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.84rem",
                            fontWeight: isSelected ? 800 : 700,
                            color: isSelected
                              ? "#4f46e5"
                              : client.isClear
                              ? "#64748b"
                              : "#0f172a",
                            fontStyle: client.isClear ? "italic" : "normal",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {client.name}
                        </div>
                        {client.client_email && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "#94a3b8",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {client.client_email}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={16} color="#4f46e5" style={{ flexShrink: 0, marginLeft: 8 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count indicator */}
          <div
            style={{
              padding: "6px 12px",
              background: "#f8fafc",
              borderTop: "1px solid #f1f5f9",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#94a3b8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{filteredClients.length} companies available</span>
            <span style={{ fontSize: "0.68rem" }}>↑↓ keys to navigate</span>
          </div>
        </div>
      )}
    </div>
  );
}
