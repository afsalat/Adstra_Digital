const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const modalStartMarker = `{/* ── META ADS MANAGER NAME TEMPLATES FULL PAGE OVERLAY ── */}`;
const modalStartIndex = content.indexOf(modalStartMarker);

if (modalStartIndex === -1) {
  console.error("Could not find modalStartMarker");
  process.exit(1);
}

const lastClosingTag = `    </div>\n  );\n}`;
const lastClosingIndex = content.lastIndexOf(lastClosingTag);

if (lastClosingIndex === -1) {
  console.error("Could not find lastClosingTag");
  process.exit(1);
}

const popupModalJSX = `{/* ── META ADS MANAGER NAME TEMPLATES POPUP MODAL DIALOG ── */}
      {templateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Name templates"
          onClick={handleCloseTemplateModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200000,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: "#1c1e21",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* Modal Container Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 620,
              maxWidth: "100%",
              maxHeight: "90vh",
              background: "#f0f2f5",
              borderRadius: 12,
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* ── MODAL HEADER ── */}
            <div
              style={{
                height: 56,
                background: "#ffffff",
                borderBottom: "1px solid #e4e6eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.18rem",
                  fontWeight: 700,
                  color: "#1c1e21",
                  letterSpacing: "-0.01em",
                }}
              >
                Name templates
              </h2>

              <button
                type="button"
                onClick={handleCloseTemplateModal}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#65676b",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* ── MODAL SCROLLABLE BODY (3 Cards: Campaign name, Ad set name, Ad name) ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* ── CARD 1: CAMPAIGN NAME ── */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #ced0d4",
                  padding: "18px 20px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                  position: "relative",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 14px 0",
                    fontSize: "1.02rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                  }}
                >
                  Campaign name
                </h3>

                {campaignEditingMode ? (
                  /* Expanded Template Builder */
                  <div>
                    <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                      Template
                    </div>

                    {/* Components box */}
                    <div
                      style={{
                        border: "1px solid #ced0d4",
                        borderRadius: 6,
                        padding: 12,
                        background: "#ffffff",
                        minHeight: 80,
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 8,
                        position: "relative",
                      }}
                    >
                      {templateComponents.length === 0 ? (
                        <span style={{ fontSize: "0.86rem", color: "#8d949e" }}>
                          Click &quot;+ Add components&quot; below to build your naming template
                        </span>
                      ) : (
                        templateComponents.map((comp) => {
                          const isEditing = editingCompId === comp.id;
                          const canEdit = comp.fieldId === "open_text" || comp.fieldId === "custom_field";
                          return (
                            <div
                              key={comp.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#ffffff",
                                border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                borderRadius: 6,
                                padding: "6px 10px",
                                fontSize: "0.84rem",
                                color: "#1c1e21",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                              }}
                            >
                              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ cursor: "grab", flexShrink: 0 }}>
                                <circle cx="2" cy="2" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="2" r="1.2" fill="#8d949e" />
                                <circle cx="2" cy="6" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="6" r="1.2" fill="#8d949e" />
                                <circle cx="2" cy="10" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="10" r="1.2" fill="#8d949e" />
                              </svg>

                              {canEdit ? (
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="4" y1="8" x2="12" y2="8" stroke="#65676b" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="2" y1="8" x2="14" y2="8" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="8" y1="2" x2="8" y2="14" stroke="#65676b" strokeWidth="1.4" />
                                </svg>
                              )}

                              {isEditing ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingCompValue}
                                  onChange={(e) => setEditingCompValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveEditing("campaign", comp.id);
                                    if (e.key === "Escape") setEditingCompId(null);
                                  }}
                                  onBlur={() => handleSaveEditing("campaign", comp.id)}
                                  style={{
                                    border: "1px solid #0064e1",
                                    borderRadius: 4,
                                    padding: "2px 6px",
                                    fontSize: "0.84rem",
                                    outline: "none",
                                    width: 110,
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: "0.85rem", color: "#1c1e21", fontWeight: 500 }}>
                                  {comp.label}
                                </span>
                              )}

                              {canEdit && !isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditing(comp)}
                                  title="Edit"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    color: "#65676b",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0064e1")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveComponent("campaign", comp.id)}
                                title="Remove"
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  color: "#65676b",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#e11d48")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })
                      )}

                      {templateComponents.length > 0 && templateComponents.length < 10 && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdownSection((prev) => (prev === "campaign" ? null : "campaign"));
                            setOpenSubmenu(null);
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1c1e21",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                          title="Add component"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>

                    {templateComponents.length === 0 && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdownSection((prev) => (prev === "campaign" ? null : "campaign"));
                            setOpenSubmenu(null);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#0064e1",
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          <Plus size={14} color="#0064e1" strokeWidth={2.5} />
                          <span>Add components</span>
                        </button>
                      </div>
                    )}

                    {openDropdownSection === "campaign" && (
                      <div
                        style={{
                          position: "absolute",
                          top: 130,
                          left: 20,
                          zIndex: 300,
                          background: "#ffffff",
                          border: "1px solid #ced0d4",
                          borderRadius: 8,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          width: 230,
                          padding: "4px 0",
                        }}
                      >
                        <div
                          onClick={() => setOpenSubmenu((prev) => (prev === "fields" ? null : "fields"))}
                          style={{
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            color: "#1c1e21",
                            cursor: "pointer",
                            background: openSubmenu === "fields" ? "#f0f2f5" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => {
                            if (openSubmenu !== "fields") e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span>Campaign fields</span>
                          <ChevronRight size={14} color="#65676b" />
                        </div>
                        <div
                          onClick={() => handleAddComponent("campaign", "open_text", "Open text field", "Open text field")}
                          style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Open text field
                        </div>
                        <div
                          onClick={() => handleAddComponent("campaign", "custom_field", "Custom field", "Custom field")}
                          style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Custom field
                        </div>
                        <div style={{ borderTop: "1px solid #e4e6eb", margin: "4px 0" }} />
                        <div
                          onClick={() => setOpenSubmenu((prev) => (prev === "existing" ? null : "existing"))}
                          style={{
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            color: "#1c1e21",
                            cursor: "pointer",
                            background: openSubmenu === "existing" ? "#f0f2f5" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => {
                            if (openSubmenu !== "existing") e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span>Use existing template</span>
                          <ChevronRight size={14} color="#65676b" />
                        </div>

                        {openSubmenu === "fields" && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 234,
                              zIndex: 301,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 8,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              width: 230,
                              padding: "4px 0",
                            }}
                          >
                            {[
                              { id: "cbo", label: "Advantage+ campaign budget", defaultVal: "CBO on" },
                              { id: "objective", label: "Objective", defaultVal: "Reach" },
                              { id: "campaign_id", label: "Campaign ID", defaultVal: "campaign_group_id" },
                            ].map((f) => (
                              <div
                                key={f.id}
                                onClick={() => handleAddComponent("campaign", f.id, f.label, f.defaultVal)}
                                style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                {f.label}
                              </div>
                            ))}
                          </div>
                        )}

                        {openSubmenu === "existing" && (
                          <div
                            style={{
                              position: "absolute",
                              top: 40,
                              left: 234,
                              zIndex: 301,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 8,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              width: 220,
                              padding: "4px 0",
                            }}
                          >
                            <div
                              onClick={() => handleApplyPresetTemplate("campaign", 1)}
                              style={{ padding: "8px 14px", fontSize: "0.84rem", color: "#1c1e21", cursor: "pointer" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div style={{ fontWeight: 600 }}>Custom template 1</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Objective</div>
                            </div>
                            <div
                              onClick={() => handleApplyPresetTemplate("campaign", 2)}
                              style={{ padding: "8px 14px", fontSize: "0.84rem", color: "#1c1e21", cursor: "pointer" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div style={{ fontWeight: 600 }}>Custom template 2</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Campaign ID</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Field separator */}
                    <div style={{ marginTop: 16 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                        Field separator
                      </label>
                      <select
                        value={fieldSeparator}
                        onChange={(e) => setFieldSeparator(e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          fontSize: "0.88rem",
                          background: "#ffffff",
                          color: "#1c1e21",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {FIELD_SEPARATOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Item separator */}
                    <div style={{ marginTop: 14 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                        Item separator
                      </label>
                      <select
                        value={itemSeparator}
                        onChange={(e) => setItemSeparator(e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          fontSize: "0.88rem",
                          background: "#ffffff",
                          color: "#1c1e21",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {ITEM_SEPARATOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preview */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#65676b", marginBottom: 4 }}>
                        Preview
                      </div>
                      <div style={{ fontSize: "0.92rem", color: "#1c1e21", minHeight: 22, wordBreak: "break-all" }}>
                        {previewTemplateName}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setCampaignEditingMode(false);
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={templateComponents.length === 0}
                        onClick={handleSaveCampaignTemplate}
                        style={{
                          padding: "8px 20px",
                          borderRadius: 6,
                          border: "none",
                          background: templateComponents.length === 0 ? "#b9d5fb" : "#0064e1",
                          color: "#ffffff",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: templateComponents.length === 0 ? "not-allowed" : "pointer",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Collapsed View (Image 1 style) */
                  <div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 20 }}>
                      {templateComponents.length === 0 ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#ffffff",
                            border: "1px solid #ced0d4",
                            borderRadius: 6,
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            color: "#1c1e21",
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <rect x="1" y="3" width="14" height="10" rx="2" stroke="#65676b" strokeWidth="1.4" />
                            <line x1="4" y1="8" x2="12" y2="8" stroke="#65676b" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          <span>Open text field</span>
                        </div>
                      ) : (
                        templateComponents.map((comp) => {
                          const isText = comp.fieldId === "open_text" || comp.fieldId === "custom_field";
                          return (
                            <div
                              key={comp.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#ffffff",
                                border: "1px solid #ced0d4",
                                borderRadius: 6,
                                padding: "6px 12px",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                color: "#1c1e21",
                              }}
                            >
                              {isText ? (
                                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="4" y1="8" x2="12" y2="8" stroke="#65676b" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                              ) : (
                                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="2" y1="8" x2="14" y2="8" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="8" y1="2" x2="8" y2="14" stroke="#65676b" strokeWidth="1.4" />
                                </svg>
                              )}
                              <span>{comp.label}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setCampaignEditingMode(true)}
                        style={{
                          padding: "6px 18px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CARD 2: AD SET NAME ── */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #ced0d4",
                  padding: "18px 20px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                  position: "relative",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 14px 0",
                    fontSize: "1.02rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                  }}
                >
                  Ad set name
                </h3>

                {!adsetEditingMode && !isAdsetTemplateActive ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "12px 0 4px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAdsetEditingMode(true);
                        if (adsetTemplateComponents.length === 0) {
                          handleAddComponent("adset", "open_text", "Open text field", adsetName || "New Engagement Ad set");
                        }
                      }}
                      style={{
                        padding: "6px 24px",
                        borderRadius: 6,
                        border: "1px solid #ced0d4",
                        background: "#ffffff",
                        color: "#1c1e21",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      Create
                    </button>
                  </div>
                ) : adsetEditingMode ? (
                  <div>
                    <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                      Template
                    </div>

                    <div
                      style={{
                        border: "1px solid #ced0d4",
                        borderRadius: 6,
                        padding: 12,
                        background: "#ffffff",
                        minHeight: 80,
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 8,
                        position: "relative",
                      }}
                    >
                      {adsetTemplateComponents.length === 0 ? (
                        <span style={{ fontSize: "0.86rem", color: "#8d949e" }}>
                          Click &quot;+ Add components&quot; below to build your naming template
                        </span>
                      ) : (
                        adsetTemplateComponents.map((comp) => {
                          const isEditing = editingCompId === comp.id;
                          const canEdit = comp.fieldId === "open_text" || comp.fieldId === "custom_field";
                          return (
                            <div
                              key={comp.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#ffffff",
                                border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                borderRadius: 6,
                                padding: "6px 10px",
                                fontSize: "0.84rem",
                                color: "#1c1e21",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                              }}
                            >
                              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ cursor: "grab", flexShrink: 0 }}>
                                <circle cx="2" cy="2" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="2" r="1.2" fill="#8d949e" />
                                <circle cx="2" cy="6" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="6" r="1.2" fill="#8d949e" />
                                <circle cx="2" cy="10" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="10" r="1.2" fill="#8d949e" />
                              </svg>

                              {canEdit ? (
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="4" y1="8" x2="12" y2="8" stroke="#65676b" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="2" y1="8" x2="14" y2="8" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="8" y1="2" x2="8" y2="14" stroke="#65676b" strokeWidth="1.4" />
                                </svg>
                              )}

                              {isEditing ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingCompValue}
                                  onChange={(e) => setEditingCompValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveEditing("adset", comp.id);
                                    if (e.key === "Escape") setEditingCompId(null);
                                  }}
                                  onBlur={() => handleSaveEditing("adset", comp.id)}
                                  style={{
                                    border: "1px solid #0064e1",
                                    borderRadius: 4,
                                    padding: "2px 6px",
                                    fontSize: "0.84rem",
                                    outline: "none",
                                    width: 110,
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: "0.85rem", color: "#1c1e21", fontWeight: 500 }}>
                                  {comp.label}
                                </span>
                              )}

                              {canEdit && !isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditing(comp)}
                                  title="Edit"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    color: "#65676b",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0064e1")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveComponent("adset", comp.id)}
                                title="Remove"
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  color: "#65676b",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#e11d48")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })
                      )}

                      {adsetTemplateComponents.length > 0 && adsetTemplateComponents.length < 10 && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdownSection((prev) => (prev === "adset" ? null : "adset"));
                            setOpenSubmenu(null);
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1c1e21",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                          title="Add component"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>

                    {adsetTemplateComponents.length === 0 && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdownSection((prev) => (prev === "adset" ? null : "adset"));
                            setOpenSubmenu(null);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#0064e1",
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          <Plus size={14} color="#0064e1" strokeWidth={2.5} />
                          <span>Add components</span>
                        </button>
                      </div>
                    )}

                    {openDropdownSection === "adset" && (
                      <div
                        style={{
                          position: "absolute",
                          top: 130,
                          left: 20,
                          zIndex: 300,
                          background: "#ffffff",
                          border: "1px solid #ced0d4",
                          borderRadius: 8,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          width: 230,
                          padding: "4px 0",
                        }}
                      >
                        <div
                          onClick={() => setOpenSubmenu((prev) => (prev === "adset_fields" ? null : "adset_fields"))}
                          style={{
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            color: "#1c1e21",
                            cursor: "pointer",
                            background: openSubmenu === "adset_fields" ? "#f0f2f5" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => {
                            if (openSubmenu !== "adset_fields") e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span>Ad set fields</span>
                          <ChevronRight size={14} color="#65676b" />
                        </div>
                        <div
                          onClick={() => handleAddComponent("adset", "open_text", "Open text field", "Open text field")}
                          style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Open text field
                        </div>
                        <div
                          onClick={() => handleAddComponent("adset", "custom_field", "Custom field", "Custom field")}
                          style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Custom field
                        </div>
                        <div style={{ borderTop: "1px solid #e4e6eb", margin: "4px 0" }} />
                        <div
                          onClick={() => setOpenSubmenu((prev) => (prev === "adset_existing" ? null : "adset_existing"))}
                          style={{
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            color: "#1c1e21",
                            cursor: "pointer",
                            background: openSubmenu === "adset_existing" ? "#f0f2f5" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => {
                            if (openSubmenu !== "adset_existing") e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span>Use existing template</span>
                          <ChevronRight size={14} color="#65676b" />
                        </div>

                        {openSubmenu === "adset_fields" && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 234,
                              zIndex: 301,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 8,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              width: 230,
                              padding: "4px 0",
                            }}
                          >
                            {[
                              { id: "audience", label: "Audience", defaultVal: "Broad (18-65)" },
                              { id: "placement", label: "Placement", defaultVal: "Advantage+ placements" },
                              { id: "optimization", label: "Optimization goal", defaultVal: "Maximise reach" },
                              { id: "budget", label: "Budget", defaultVal: "Daily $20" },
                              { id: "adset_id", label: "Ad set ID", defaultVal: "adset_id" },
                              { id: "gender", label: "Gender", defaultVal: "All genders" },
                              { id: "age", label: "Age", defaultVal: "18-65+" },
                            ].map((f) => (
                              <div
                                key={f.id}
                                onClick={() => handleAddComponent("adset", f.id, f.label, f.defaultVal)}
                                style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                {f.label}
                              </div>
                            ))}
                          </div>
                        )}

                        {openSubmenu === "adset_existing" && (
                          <div
                            style={{
                              position: "absolute",
                              top: 40,
                              left: 234,
                              zIndex: 301,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 8,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              width: 220,
                              padding: "4px 0",
                            }}
                          >
                            <div
                              onClick={() => handleApplyPresetTemplate("adset", 1)}
                              style={{ padding: "8px 14px", fontSize: "0.84rem", color: "#1c1e21", cursor: "pointer" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div style={{ fontWeight: 600 }}>Custom template 1</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Audience & Placement</div>
                            </div>
                            <div
                              onClick={() => handleApplyPresetTemplate("adset", 2)}
                              style={{ padding: "8px 14px", fontSize: "0.84rem", color: "#1c1e21", cursor: "pointer" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div style={{ fontWeight: 600 }}>Custom template 2</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Ad set ID</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                        Field separator
                      </label>
                      <select
                        value={adsetFieldSeparator}
                        onChange={(e) => setAdsetFieldSeparator(e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          fontSize: "0.88rem",
                          background: "#ffffff",
                          color: "#1c1e21",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {FIELD_SEPARATOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                        Item separator
                      </label>
                      <select
                        value={adsetItemSeparator}
                        onChange={(e) => setAdsetItemSeparator(e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          fontSize: "0.88rem",
                          background: "#ffffff",
                          color: "#1c1e21",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {ITEM_SEPARATOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#65676b", marginBottom: 4 }}>
                        Preview
                      </div>
                      <div style={{ fontSize: "0.92rem", color: "#1c1e21", minHeight: 22, wordBreak: "break-all" }}>
                        {previewAdsetName}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                      <button
                        type="button"
                        onClick={() => setAdsetEditingMode(false)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={adsetTemplateComponents.length === 0}
                        onClick={handleSaveAdsetTemplate}
                        style={{
                          padding: "8px 20px",
                          borderRadius: 6,
                          border: "none",
                          background: adsetTemplateComponents.length === 0 ? "#b9d5fb" : "#0064e1",
                          color: "#ffffff",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: adsetTemplateComponents.length === 0 ? "not-allowed" : "pointer",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 20 }}>
                      {adsetTemplateComponents.map((comp) => {
                        const isText = comp.fieldId === "open_text" || comp.fieldId === "custom_field";
                        return (
                          <div
                            key={comp.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 6,
                              padding: "6px 12px",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              color: "#1c1e21",
                            }}
                          >
                            {isText ? (
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                <rect x="1" y="3" width="14" height="10" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                <line x1="4" y1="8" x2="12" y2="8" stroke="#65676b" strokeWidth="1.4" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="12" height="12" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                <line x1="2" y1="8" x2="14" y2="8" stroke="#65676b" strokeWidth="1.4" />
                                <line x1="8" y1="2" x2="8" y2="14" stroke="#65676b" strokeWidth="1.4" />
                              </svg>
                            )}
                            <span>{comp.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setAdsetEditingMode(true)}
                        style={{
                          padding: "6px 18px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CARD 3: AD NAME ── */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #ced0d4",
                  padding: "18px 20px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                  position: "relative",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 14px 0",
                    fontSize: "1.02rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                  }}
                >
                  Ad name
                </h3>

                {!adEditingMode && !isAdTemplateActive ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "12px 0 4px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAdEditingMode(true);
                        if (adTemplateComponents.length === 0) {
                          handleAddComponent("ad", "open_text", "Open text field", adName || "New Engagement Ad");
                        }
                      }}
                      style={{
                        padding: "6px 24px",
                        borderRadius: 6,
                        border: "1px solid #ced0d4",
                        background: "#ffffff",
                        color: "#1c1e21",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      Create
                    </button>
                  </div>
                ) : adEditingMode ? (
                  <div>
                    <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                      Template
                    </div>

                    <div
                      style={{
                        border: "1px solid #ced0d4",
                        borderRadius: 6,
                        padding: 12,
                        background: "#ffffff",
                        minHeight: 80,
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 8,
                        position: "relative",
                      }}
                    >
                      {adTemplateComponents.length === 0 ? (
                        <span style={{ fontSize: "0.86rem", color: "#8d949e" }}>
                          Click &quot;+ Add components&quot; below to build your naming template
                        </span>
                      ) : (
                        adTemplateComponents.map((comp) => {
                          const isEditing = editingCompId === comp.id;
                          const canEdit = comp.fieldId === "open_text" || comp.fieldId === "custom_field";
                          return (
                            <div
                              key={comp.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#ffffff",
                                border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                borderRadius: 6,
                                padding: "6px 10px",
                                fontSize: "0.84rem",
                                color: "#1c1e21",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                              }}
                            >
                              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ cursor: "grab", flexShrink: 0 }}>
                                <circle cx="2" cy="2" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="2" r="1.2" fill="#8d949e" />
                                <circle cx="2" cy="6" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="6" r="1.2" fill="#8d949e" />
                                <circle cx="2" cy="10" r="1.2" fill="#8d949e" />
                                <circle cx="6" cy="10" r="1.2" fill="#8d949e" />
                              </svg>

                              {canEdit ? (
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="4" y1="8" x2="12" y2="8" stroke="#65676b" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="2" y1="8" x2="14" y2="8" stroke="#65676b" strokeWidth="1.4" />
                                  <line x1="8" y1="2" x2="8" y2="14" stroke="#65676b" strokeWidth="1.4" />
                                </svg>
                              )}

                              {isEditing ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingCompValue}
                                  onChange={(e) => setEditingCompValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveEditing("ad", comp.id);
                                    if (e.key === "Escape") setEditingCompId(null);
                                  }}
                                  onBlur={() => handleSaveEditing("ad", comp.id)}
                                  style={{
                                    border: "1px solid #0064e1",
                                    borderRadius: 4,
                                    padding: "2px 6px",
                                    fontSize: "0.84rem",
                                    outline: "none",
                                    width: 110,
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: "0.85rem", color: "#1c1e21", fontWeight: 500 }}>
                                  {comp.label}
                                </span>
                              )}

                              {canEdit && !isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditing(comp)}
                                  title="Edit"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    color: "#65676b",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0064e1")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveComponent("ad", comp.id)}
                                title="Remove"
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: 0,
                                  color: "#65676b",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#e11d48")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          );
                        })
                      )}

                      {adTemplateComponents.length > 0 && adTemplateComponents.length < 10 && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdownSection((prev) => (prev === "ad" ? null : "ad"));
                            setOpenSubmenu(null);
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1c1e21",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                          title="Add component"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </div>

                    {adTemplateComponents.length === 0 && (
                      <div style={{ marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdownSection((prev) => (prev === "ad" ? null : "ad"));
                            setOpenSubmenu(null);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#0064e1",
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          <Plus size={14} color="#0064e1" strokeWidth={2.5} />
                          <span>Add components</span>
                        </button>
                      </div>
                    )}

                    {openDropdownSection === "ad" && (
                      <div
                        style={{
                          position: "absolute",
                          top: 130,
                          left: 20,
                          zIndex: 300,
                          background: "#ffffff",
                          border: "1px solid #ced0d4",
                          borderRadius: 8,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          width: 230,
                          padding: "4px 0",
                        }}
                      >
                        <div
                          onClick={() => setOpenSubmenu((prev) => (prev === "ad_fields" ? null : "ad_fields"))}
                          style={{
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            color: "#1c1e21",
                            cursor: "pointer",
                            background: openSubmenu === "ad_fields" ? "#f0f2f5" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => {
                            if (openSubmenu !== "ad_fields") e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span>Ad fields</span>
                          <ChevronRight size={14} color="#65676b" />
                        </div>
                        <div
                          onClick={() => handleAddComponent("ad", "open_text", "Open text field", "Open text field")}
                          style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Open text field
                        </div>
                        <div
                          onClick={() => handleAddComponent("ad", "custom_field", "Custom field", "Custom field")}
                          style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Custom field
                        </div>
                        <div style={{ borderTop: "1px solid #e4e6eb", margin: "4px 0" }} />
                        <div
                          onClick={() => setOpenSubmenu((prev) => (prev === "ad_existing" ? null : "ad_existing"))}
                          style={{
                            padding: "8px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "0.85rem",
                            color: "#1c1e21",
                            cursor: "pointer",
                            background: openSubmenu === "ad_existing" ? "#f0f2f5" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => {
                            if (openSubmenu !== "ad_existing") e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span>Use existing template</span>
                          <ChevronRight size={14} color="#65676b" />
                        </div>

                        {openSubmenu === "ad_fields" && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 234,
                              zIndex: 301,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 8,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              width: 230,
                              padding: "4px 0",
                            }}
                          >
                            {[
                              { id: "ad_format", label: "Ad format", defaultVal: "Single image or video" },
                              { id: "creative_name", label: "Creative name", defaultVal: "Creative 1" },
                              { id: "ad_id", label: "Ad ID", defaultVal: "ad_id" },
                              { id: "cta", label: "Call to action", defaultVal: "Learn more" },
                              { id: "placement", label: "Placement", defaultVal: "Feed" },
                            ].map((f) => (
                              <div
                                key={f.id}
                                onClick={() => handleAddComponent("ad", f.id, f.label, f.defaultVal)}
                                style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                {f.label}
                              </div>
                            ))}
                          </div>
                        )}

                        {openSubmenu === "ad_existing" && (
                          <div
                            style={{
                              position: "absolute",
                              top: 40,
                              left: 234,
                              zIndex: 301,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 8,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                              width: 220,
                              padding: "4px 0",
                            }}
                          >
                            <div
                              onClick={() => handleApplyPresetTemplate("ad", 1)}
                              style={{ padding: "8px 14px", fontSize: "0.84rem", color: "#1c1e21", cursor: "pointer" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div style={{ fontWeight: 600 }}>Custom template 1</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Creative & Format</div>
                            </div>
                            <div
                              onClick={() => handleApplyPresetTemplate("ad", 2)}
                              style={{ padding: "8px 14px", fontSize: "0.84rem", color: "#1c1e21", cursor: "pointer" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div style={{ fontWeight: 600 }}>Custom template 2</div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Ad ID</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                        Field separator
                      </label>
                      <select
                        value={adFieldSeparator}
                        onChange={(e) => setAdFieldSeparator(e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          fontSize: "0.88rem",
                          background: "#ffffff",
                          color: "#1c1e21",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {FIELD_SEPARATOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                        Item separator
                      </label>
                      <select
                        value={adItemSeparator}
                        onChange={(e) => setAdItemSeparator(e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          fontSize: "0.88rem",
                          background: "#ffffff",
                          color: "#1c1e21",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {ITEM_SEPARATOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#65676b", marginBottom: 4 }}>
                        Preview
                      </div>
                      <div style={{ fontSize: "0.92rem", color: "#1c1e21", minHeight: 22, wordBreak: "break-all" }}>
                        {previewAdName}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                      <button
                        type="button"
                        onClick={() => setAdEditingMode(false)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={adTemplateComponents.length === 0}
                        onClick={handleSaveAdTemplate}
                        style={{
                          padding: "8px 20px",
                          borderRadius: 6,
                          border: "none",
                          background: adTemplateComponents.length === 0 ? "#b9d5fb" : "#0064e1",
                          color: "#ffffff",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: adTemplateComponents.length === 0 ? "not-allowed" : "pointer",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 20 }}>
                      {adTemplateComponents.map((comp) => {
                        const isText = comp.fieldId === "open_text" || comp.fieldId === "custom_field";
                        return (
                          <div
                            key={comp.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 6,
                              padding: "6px 12px",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              color: "#1c1e21",
                            }}
                          >
                            {isText ? (
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                <rect x="1" y="3" width="14" height="10" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                <line x1="4" y1="8" x2="12" y2="8" stroke="#65676b" strokeWidth="1.4" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                <rect x="2" y="2" width="12" height="12" rx="2" stroke="#65676b" strokeWidth="1.4" />
                                <line x1="2" y1="8" x2="14" y2="8" stroke="#65676b" strokeWidth="1.4" />
                                <line x1="8" y1="2" x2="8" y2="14" stroke="#65676b" strokeWidth="1.4" />
                              </svg>
                            )}
                            <span>{comp.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => setAdEditingMode(true)}
                        style={{
                          padding: "6px 18px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.slice(0, modalStartIndex) + popupModalJSX + content.slice(lastClosingIndex);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully converted Name Templates to popup modal without image1 (About panel)!");
