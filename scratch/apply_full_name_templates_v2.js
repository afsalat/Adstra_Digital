const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../adstra-next/src/components/admin_side/SocialManagement/components/MetaAdsManagerCampaignEditor.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Ensure FIELD_SEPARATOR_OPTIONS includes \/
if (!content.includes('{ value: "\\/", label: "\\/" }')) {
  content = content.replace(
    'const FIELD_SEPARATOR_OPTIONS = [',
    'const FIELD_SEPARATOR_OPTIONS = [\n  { value: "\\\\/", label: "\\\\/" },'
  );
}

// 2. Ensure default separators and hoveredEditId are set
if (!content.includes('const [hoveredEditId, setHoveredEditId]')) {
  content = content.replace(
    'const [editingCompValue, setEditingCompValue] = useState("");',
    'const [editingCompValue, setEditingCompValue] = useState("");\n  const [hoveredEditId, setHoveredEditId] = useState(null);'
  );
}

content = content.replace(
  'const [fieldSeparator, setFieldSeparator] = useState("—");',
  'const [fieldSeparator, setFieldSeparator] = useState("\\\\/");'
);

content = content.replace(
  'const [itemSeparator, setItemSeparator] = useState(":");',
  'const [itemSeparator, setItemSeparator] = useState("::");'
);

// 3. Ensure computeTemplatePreview handles \/
if (!content.includes('separator === "\\\\/"')) {
  content = content.replace(
    'if (separator === "\\\\") sep = "\\\\";',
    'if (separator === "\\\\/" || separator === "\\\\") sep = "\\\\";'
  );
}

// 4. Locate the Name Templates modal marker
const modalStartMarker = `{/* ── META ADS MANAGER NAME TEMPLATES`;
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

// 5. Build the complete, interactive Name Templates overlay
const fullOverlayJSX = `{/* ── META ADS MANAGER NAME TEMPLATES FULL PAGE OVERLAY ── */}
      {templateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Name templates"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200000,
            background: "linear-gradient(135deg, #fcfdfe 0%, #f4f7fc 35%, #edf4fa 70%, #e6f1f8 100%)",
            display: "flex",
            flexDirection: "row",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: "#1c1e21",
            overflow: "hidden",
          }}
        >
          {/* ── LEFT RAIL: META NAVIGATION ICONS (Exact match to Image 1 & Meta Ads Manager) ── */}
          <div
            style={{
              width: 52,
              background: "#ffffff",
              borderRight: "1px solid #e4e6eb",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 0",
              flexShrink: 0,
              zIndex: 20,
              justifyContent: "space-between",
              boxShadow: "1px 0 3px rgba(0,0,0,0.02)",
            }}
          >
            {/* Top Icons */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              {/* Meta Logo */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#0064e1",
                  marginBottom: 4,
                }}
                title="Meta"
              >
                <svg width="24" height="24" viewBox="0 0 36 36" fill="currentColor">
                  <path d="M20.3 11.2c-1.8-3.1-4.7-5.2-8.3-5.2C5.4 6 0 11.4 0 18s5.4 12 12 12c3.6 0 6.5-2.1 8.3-5.2 1.8 3.1 4.7 5.2 8.3 5.2 6.6 0 12-5.4 12-12s-5.4-12-12-12c-3.6 0-6.5 2.1-8.3 5.2zm-8.3 14.3c-4.1 0-7.5-3.4-7.5-7.5s3.4-7.5 7.5-7.5c2.9 0 5.4 1.7 6.6 4.2-1.2 2.5-3.7 4.2-6.6 4.2zm16 0c-2.9 0-5.4-1.7-6.6-4.2 1.2-2.5 3.7-4.2 6.6-4.2 4.1 0 7.5 3.4 7.5 7.5s-3.4 7.5-7.5 7.5z" />
                </svg>
              </div>

              {/* Notification Bell with '9' badge */}
              <div style={{ position: "relative", cursor: "pointer" }} title="Notifications">
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1c1e21",
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    background: "#e41e3f",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: "bold",
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
                  }}
                >
                  9
                </div>
              </div>

              {/* Speedometer (Campaigns) */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Campaigns"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>

              {/* Table / Grid */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Ads Reporting"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
              </div>

              {/* Document / Reports */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Reports"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>

              {/* Users / Audience */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Audiences"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              {/* Business Settings / Wrench */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0064e1",
                  cursor: "pointer",
                  background: "#edf4fe",
                }}
                title="Business Settings"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>

              {/* Branch / Events */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Events Manager"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </div>

              {/* Hamburger All Tools */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="All Tools"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </div>
            </div>

            {/* Bottom Icons */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              {/* Purple Sparkle / Advantage+ */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8a3ab9",
                  cursor: "pointer",
                }}
                title="Advantage+ Creative"
              >
                <Sparkles size={18} />
              </div>

              {/* Question Help */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#65676b",
                  cursor: "pointer",
                }}
                title="Help"
              >
                <span style={{ fontSize: "16px", fontWeight: 700 }}>?</span>
              </div>

              {/* Gear Settings */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#65676b",
                  cursor: "pointer",
                }}
                title="Settings"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>

              {/* Search */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#65676b",
                  cursor: "pointer",
                }}
                title="Search"
              >
                <Search size={18} />
              </div>
            </div>
          </div>

          {/* ── MAIN WORKSPACE (Top Bar + 2-Column Content) ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── TOP BAR (Matches Image 1, 2, 3) ── */}
            <div
              style={{
                height: 58,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 28px 0 24px",
                flexShrink: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
                    color: "#1c1e21",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  title="Back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.28rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Name templates
                </h1>
              </div>

              {/* Top Right: Account Dropdown & Profile */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#ffffff",
                    border: "1px solid #ced0d4",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: "0.82rem",
                    color: "#1c1e21",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" color="#65676b">
                    <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="5" cy="6" r="1.5" />
                    <line x1="8" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontWeight: 500 }}>1405144991733037 (14051449...)</span>
                  <ChevronDown size={14} color="#65676b" />
                </div>

                <div style={{ position: "relative", width: 32, height: 32 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#e4e6eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#65676b">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#1877f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #ffffff",
                    }}
                  >
                    <span style={{ color: "#ffffff", fontSize: "9px", fontWeight: "bold", lineHeight: 1 }}>f</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MAIN SCROLLABLE BODY (2 Columns: Left 3 Cards + Right About panel) ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 32px 80px 24px",
                display: "flex",
                gap: 40,
                alignItems: "flex-start",
              }}
            >
              {/* LEFT COLUMN: 3 SECTIONS */}
              <div
                style={{
                  width: 580,
                  maxWidth: "100%",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {/* ── SECTION 1: CAMPAIGN NAME ── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #ced0d4",
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    position: "relative",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                    }}
                  >
                    Campaign name
                  </h3>

                  {campaignEditingMode ? (
                    /* ── EXPANDED BUILDER: Image 1, Image 3, Image 4, Image 5 ── */
                    <div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                        Template
                      </div>

                      {/* Components box */}
                      <div
                        style={{
                          border: "1px solid #ced0d4",
                          borderRadius: 6,
                          padding: "12px 14px",
                          background: "#ffffff",
                          minHeight: 76,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 10,
                          position: "relative",
                        }}
                      >
                        {/* Image 3: When empty, show '+ Add component' and 'Choose existing template' buttons */}
                        {templateComponents.length === 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                                height: 36,
                                padding: "0 14px",
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
                              <Plus size={15} color="#1c1e21" strokeWidth={2} />
                              <span>Add component</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownSection("campaign");
                                setOpenSubmenu("existing");
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 6,
                                border: "none",
                                background: "#edf2f7",
                                color: "#0064e1",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#edf2f7")}
                            >
                              Choose existing template
                            </button>
                          </div>
                        ) : (
                          /* Image 1, 4, 5: Render components tags */
                          templateComponents.map((comp) => {
                            const isEditing = editingCompId === comp.id;
                            return (
                              <div
                                key={comp.id}
                                style={{
                                  position: "relative",
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                {/* Tag Container */}
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "#ffffff",
                                    border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                    borderRadius: 6,
                                    padding: isEditing ? "0 0 0 10px" : "0 6px 0 10px",
                                    height: 34,
                                    fontSize: "0.85rem",
                                    color: "#1c1e21",
                                    boxShadow: isEditing ? "0 0 0 1px #0064e1" : "0 1px 2px rgba(0,0,0,0.04)",
                                    overflow: "hidden",
                                  }}
                                >
                                  {/* 6 Drag Dots */}
                                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ cursor: "grab", flexShrink: 0 }}>
                                    <circle cx="2" cy="2" r="1.2" fill="#8d949e" />
                                    <circle cx="6" cy="2" r="1.2" fill="#8d949e" />
                                    <circle cx="2" cy="6" r="1.2" fill="#8d949e" />
                                    <circle cx="6" cy="6" r="1.2" fill="#8d949e" />
                                    <circle cx="2" cy="10" r="1.2" fill="#8d949e" />
                                    <circle cx="6" cy="10" r="1.2" fill="#8d949e" />
                                  </svg>

                                  {/* Dark [Aa] Icon */}
                                  <div
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 3,
                                      background: "#1c1e21",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#ffffff",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      lineHeight: 1,
                                      letterSpacing: "-0.5px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    Aa
                                  </div>

                                  {/* Label text */}
                                  <span style={{ fontSize: "0.86rem", color: "#1c1e21", fontWeight: 500, marginRight: 2 }}>
                                    {comp.label}
                                  </span>

                                  {/* When NOT editing (Image 1 & Image 4): Pencil + Trash */}
                                  {!isEditing ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
                                      {/* Pencil button with Tooltip "Edit" (Image 4) */}
                                      <div style={{ position: "relative" }}>
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditing(comp)}
                                          onMouseEnter={() => setHoveredEditId(comp.id)}
                                          onMouseLeave={() => setHoveredEditId(null)}
                                          style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "4px 6px",
                                            borderRadius: 4,
                                            color: "#1c1e21",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "background 0.15s ease",
                                          }}
                                          title=""
                                        >
                                          <Edit2 size={13} strokeWidth={2} />
                                        </button>

                                        {/* Image 4 Tooltip */}
                                        {hoveredEditId === comp.id && (
                                          <div
                                            style={{
                                              position: "absolute",
                                              bottom: "calc(100% + 8px)",
                                              left: "50%",
                                              transform: "translateX(-50%)",
                                              background: "#ffffff",
                                              color: "#1c1e21",
                                              fontSize: "0.78rem",
                                              fontWeight: 600,
                                              padding: "4px 8px",
                                              borderRadius: 4,
                                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.16)",
                                              border: "1px solid #e4e6eb",
                                              whiteSpace: "nowrap",
                                              pointerEvents: "none",
                                              zIndex: 100,
                                            }}
                                          >
                                            Edit
                                          </div>
                                        )}
                                      </div>

                                      {/* Trash delete button */}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveComponent("campaign", comp.id)}
                                        style={{
                                          background: "transparent",
                                          border: "none",
                                          cursor: "pointer",
                                          padding: "4px 6px",
                                          borderRadius: 4,
                                          color: "#1c1e21",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          transition: "background 0.15s ease",
                                        }}
                                        title="Delete"
                                      >
                                        <Trash2 size={13} strokeWidth={2} />
                                      </button>
                                    </div>
                                  ) : (
                                    /* When EDITING (Image 5): Solid blue check and X buttons inside the tag */
                                    <div style={{ display: "flex", alignItems: "center", height: "100%", marginLeft: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditing("campaign", comp.id)}
                                        style={{
                                          background: "#0064e1",
                                          border: "none",
                                          cursor: "pointer",
                                          width: 32,
                                          height: 34,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "#ffffff",
                                          transition: "background 0.15s ease",
                                        }}
                                        title="Save"
                                      >
                                        <Check size={16} strokeWidth={2.5} color="#ffffff" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCompId(null)}
                                        style={{
                                          background: "#ffffff",
                                          border: "none",
                                          cursor: "pointer",
                                          width: 30,
                                          height: 34,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "#1c1e21",
                                          transition: "background 0.15s ease",
                                        }}
                                        title="Cancel"
                                      >
                                        <X size={16} strokeWidth={2} color="#1c1e21" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Image 5: Floating Popover Dropdown under the tag */}
                                {isEditing && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute",
                                      top: "calc(100% + 8px)",
                                      left: 0,
                                      zIndex: 500,
                                      background: "#ffffff",
                                      border: "1px solid #ced0d4",
                                      borderRadius: 8,
                                      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.16)",
                                      width: 330,
                                      padding: "16px 18px",
                                      animation: "fadeIn 0.15s ease-out",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.95rem",
                                        fontWeight: 700,
                                        color: "#1c1e21",
                                        marginBottom: 10,
                                      }}
                                    >
                                      {comp.fieldId === "open_text" ? "Open text field" : comp.label}
                                    </div>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCompValue}
                                      onChange={(e) => setEditingCompValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEditing("campaign", comp.id);
                                        if (e.key === "Escape") setEditingCompId(null);
                                      }}
                                      style={{
                                        width: "100%",
                                        height: 38,
                                        padding: "0 12px",
                                        borderRadius: 6,
                                        border: "1.5px solid #0064e1",
                                        fontSize: "0.9rem",
                                        color: "#1c1e21",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        boxShadow: "0 0 0 2px rgba(0, 100, 225, 0.15)",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {/* [+] button next to component tags (Image 1, Image 5) */}
                        {templateComponents.length > 0 && templateComponents.length < 10 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdownSection((prev) => (prev === "campaign" ? null : "campaign"));
                              setOpenSubmenu(null);
                            }}
                            style={{
                              width: 34,
                              height: 34,
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
                            <Plus size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Menu when clicking [+] or '+ Add component' */}
                      {openDropdownSection === "campaign" && (
                        <div
                          style={{
                            position: "absolute",
                            top: 130,
                            left: 20,
                            zIndex: 600,
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

                          {/* Submenu: Campaign fields */}
                          {openSubmenu === "fields" && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 234,
                                zIndex: 601,
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

                          {/* Submenu: Existing template presets */}
                          {openSubmenu === "existing" && (
                            <div
                              style={{
                                position: "absolute",
                                top: 40,
                                left: 234,
                                zIndex: 601,
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

                      {/* Field separator, Item separator & Preview ONLY when components exist (Image 1 vs Image 3) */}
                      {templateComponents.length > 0 && (
                        <>
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
                        </>
                      )}

                      {/* Action buttons (Image 1, Image 3): Cancel & Save */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setCampaignEditingMode(false);
                            setEditingCompId(null);
                          }}
                          style={{
                            padding: "8px 18px",
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
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCampaignTemplate}
                          style={{
                            padding: "8px 22px",
                            borderRadius: 6,
                            border: "none",
                            background: "#0064e1",
                            color: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#0056c7")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── COLLAPSED VIEW: Image 2 ── */
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 28 }}>
                        {templateComponents.length === 0 ? (
                          <span style={{ fontSize: "0.86rem", color: "#8d949e" }}>No template configured</span>
                        ) : (
                          templateComponents.map((comp) => (
                            <div
                              key={comp.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#ffffff",
                                border: "1px solid #ced0d4",
                                borderRadius: 6,
                                padding: "6px 14px",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                color: "#1c1e21",
                              }}
                            >
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 3,
                                  background: "#1c1e21",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  lineHeight: 1,
                                  letterSpacing: "-0.5px",
                                  flexShrink: 0,
                                }}
                              >
                                Aa
                              </div>
                              <span>{comp.label}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Edit Button on bottom-right (Image 2) */}
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setCampaignEditingMode(true)}
                          style={{
                            padding: "6px 20px",
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

                {/* ── SECTION 2: AD SET NAME ── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #ced0d4",
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    position: "relative",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                    }}
                  >
                    Ad set name
                  </h3>

                  {!adsetEditingMode && !isAdsetTemplateActive ? (
                    /* Initial centered Create button (Image 1, Image 2) */
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px 0 6px" }}>
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
                    /* Ad set template builder */
                    <div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                        Template
                      </div>

                      <div
                        style={{
                          border: "1px solid #ced0d4",
                          borderRadius: 6,
                          padding: "12px 14px",
                          background: "#ffffff",
                          minHeight: 76,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 10,
                          position: "relative",
                        }}
                      >
                        {adsetTemplateComponents.length === 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => setOpenDropdownSection((prev) => (prev === "adset" ? null : "adset"))}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 6,
                                border: "1px solid #ced0d4",
                                background: "#ffffff",
                                color: "#1c1e21",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Plus size={15} color="#1c1e21" strokeWidth={2} />
                              <span>Add component</span>
                            </button>
                          </div>
                        ) : (
                          adsetTemplateComponents.map((comp) => {
                            const isEditing = editingCompId === comp.id;
                            return (
                              <div key={comp.id} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "#ffffff",
                                    border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                    borderRadius: 6,
                                    padding: isEditing ? "0 0 0 10px" : "0 6px 0 10px",
                                    height: 34,
                                    fontSize: "0.85rem",
                                    color: "#1c1e21",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 3,
                                      background: "#1c1e21",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#ffffff",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Aa
                                  </div>
                                  <span>{comp.label}</span>
                                  {!isEditing ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditing(comp)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
                                        title="Edit"
                                      >
                                        <Edit2 size={13} strokeWidth={2} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveComponent("adset", comp.id)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
                                        title="Delete"
                                      >
                                        <Trash2 size={13} strokeWidth={2} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", height: "100%", marginLeft: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditing("adset", comp.id)}
                                        style={{ background: "#0064e1", border: "none", cursor: "pointer", width: 32, height: 34, color: "#ffffff" }}
                                        title="Save"
                                      >
                                        <Check size={16} strokeWidth={2.5} color="#ffffff" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCompId(null)}
                                        style={{ background: "#ffffff", border: "none", cursor: "pointer", width: 30, height: 34 }}
                                        title="Cancel"
                                      >
                                        <X size={16} strokeWidth={2} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isEditing && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute",
                                      top: "calc(100% + 8px)",
                                      left: 0,
                                      zIndex: 500,
                                      background: "#ffffff",
                                      border: "1px solid #ced0d4",
                                      borderRadius: 8,
                                      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.16)",
                                      width: 320,
                                      padding: "16px",
                                    }}
                                  >
                                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1c1e21", marginBottom: 10 }}>
                                      {comp.label}
                                    </div>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCompValue}
                                      onChange={(e) => setEditingCompValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEditing("adset", comp.id);
                                        if (e.key === "Escape") setEditingCompId(null);
                                      }}
                                      style={{
                                        width: "100%",
                                        height: 38,
                                        padding: "0 12px",
                                        borderRadius: 6,
                                        border: "1.5px solid #0064e1",
                                        fontSize: "0.9rem",
                                        outline: "none",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {adsetTemplateComponents.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setOpenDropdownSection((prev) => (prev === "adset" ? null : "adset"))}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              border: "1px solid #ced0d4",
                              background: "#ffffff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Add component"
                          >
                            <Plus size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {adsetTemplateComponents.length > 0 && (
                        <>
                          <div style={{ marginTop: 16 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                              Field separator
                            </label>
                            <select
                              value={adsetFieldSeparator}
                              onChange={(e) => setAdsetFieldSeparator(e.target.value)}
                              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #ced0d4" }}
                            >
                              {FIELD_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #ced0d4" }}
                            >
                              {ITEM_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#65676b", marginBottom: 4 }}>
                              Preview
                            </div>
                            <div style={{ fontSize: "0.92rem", color: "#1c1e21", minHeight: 22 }}>
                              {previewAdsetName}
                            </div>
                          </div>
                        </>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                        <button
                          type="button"
                          onClick={() => setAdsetEditingMode(false)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAdsetTemplate}
                          style={{
                            padding: "8px 22px",
                            borderRadius: 6,
                            border: "none",
                            background: "#0064e1",
                            color: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Collapsed view */
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 28 }}>
                        {adsetTemplateComponents.map((comp) => (
                          <div
                            key={comp.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 6,
                              padding: "6px 14px",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                            }}
                          >
                            <span>{comp.label}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setAdsetEditingMode(true)}
                          style={{
                            padding: "6px 20px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── SECTION 3: AD NAME ── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #ced0d4",
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    position: "relative",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                    }}
                  >
                    Ad name
                  </h3>

                  {!adEditingMode && !isAdTemplateActive ? (
                    /* Initial centered Create button (Image 1, Image 2) */
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px 0 6px" }}>
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
                    /* Ad template builder */
                    <div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                        Template
                      </div>

                      <div
                        style={{
                          border: "1px solid #ced0d4",
                          borderRadius: 6,
                          padding: "12px 14px",
                          background: "#ffffff",
                          minHeight: 76,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 10,
                          position: "relative",
                        }}
                      >
                        {adTemplateComponents.length === 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => setOpenDropdownSection((prev) => (prev === "ad" ? null : "ad"))}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 6,
                                border: "1px solid #ced0d4",
                                background: "#ffffff",
                                color: "#1c1e21",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Plus size={15} color="#1c1e21" strokeWidth={2} />
                              <span>Add component</span>
                            </button>
                          </div>
                        ) : (
                          adTemplateComponents.map((comp) => {
                            const isEditing = editingCompId === comp.id;
                            return (
                              <div key={comp.id} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "#ffffff",
                                    border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                    borderRadius: 6,
                                    padding: isEditing ? "0 0 0 10px" : "0 6px 0 10px",
                                    height: 34,
                                    fontSize: "0.85rem",
                                    color: "#1c1e21",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 3,
                                      background: "#1c1e21",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#ffffff",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Aa
                                  </div>
                                  <span>{comp.label}</span>
                                  {!isEditing ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditing(comp)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
                                        title="Edit"
                                      >
                                        <Edit2 size={13} strokeWidth={2} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveComponent("ad", comp.id)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
                                        title="Delete"
                                      >
                                        <Trash2 size={13} strokeWidth={2} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", height: "100%", marginLeft: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditing("ad", comp.id)}
                                        style={{ background: "#0064e1", border: "none", cursor: "pointer", width: 32, height: 34, color: "#ffffff" }}
                                        title="Save"
                                      >
                                        <Check size={16} strokeWidth={2.5} color="#ffffff" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCompId(null)}
                                        style={{ background: "#ffffff", border: "none", cursor: "pointer", width: 30, height: 34 }}
                                        title="Cancel"
                                      >
                                        <X size={16} strokeWidth={2} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isEditing && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute",
                                      top: "calc(100% + 8px)",
                                      left: 0,
                                      zIndex: 500,
                                      background: "#ffffff",
                                      border: "1px solid #ced0d4",
                                      borderRadius: 8,
                                      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.16)",
                                      width: 320,
                                      padding: "16px",
                                    }}
                                  >
                                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1c1e21", marginBottom: 10 }}>
                                      {comp.label}
                                    </div>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCompValue}
                                      onChange={(e) => setEditingCompValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEditing("ad", comp.id);
                                        if (e.key === "Escape") setEditingCompId(null);
                                      }}
                                      style={{
                                        width: "100%",
                                        height: 38,
                                        padding: "0 12px",
                                        borderRadius: 6,
                                        border: "1.5px solid #0064e1",
                                        fontSize: "0.9rem",
                                        outline: "none",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {adTemplateComponents.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setOpenDropdownSection((prev) => (prev === "ad" ? null : "ad"))}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              border: "1px solid #ced0d4",
                              background: "#ffffff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Add component"
                          >
                            <Plus size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {adTemplateComponents.length > 0 && (
                        <>
                          <div style={{ marginTop: 16 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                              Field separator
                            </label>
                            <select
                              value={adFieldSeparator}
                              onChange={(e) => setAdFieldSeparator(e.target.value)}
                              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #ced0d4" }}
                            >
                              {FIELD_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #ced0d4" }}
                            >
                              {ITEM_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#65676b", marginBottom: 4 }}>
                              Preview
                            </div>
                            <div style={{ fontSize: "0.92rem", color: "#1c1e21", minHeight: 22 }}>
                              {previewAdName}
                            </div>
                          </div>
                        </>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                        <button
                          type="button"
                          onClick={() => setAdEditingMode(false)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAdTemplate}
                          style={{
                            padding: "8px 22px",
                            borderRadius: 6,
                            border: "none",
                            background: "#0064e1",
                            color: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Collapsed view */
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 28 }}>
                        {adTemplateComponents.map((comp) => (
                          <div
                            key={comp.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 6,
                              padding: "6px 14px",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                            }}
                          >
                            <span>{comp.label}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setAdEditingMode(true)}
                          style={{
                            padding: "6px 20px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT COLUMN: ABOUT PANEL (Image 1) ── */}
              <div
                style={{
                  flex: 1,
                  maxWidth: 400,
                  position: "sticky",
                  top: 0,
                  paddingTop: 4,
                }}
              >
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                    marginBottom: 8,
                  }}
                >
                  About name templates
                </div>
                <div
                  style={{
                    fontSize: "0.86rem",
                    color: "#4b5563",
                    lineHeight: 1.55,
                  }}
                >
                  Name your campaigns, ad sets and ads consistently by creating templates based on your naming conventions. These names will update automatically to match your current campaign, ad set and ad settings.{" "}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "#0064e1", textDecoration: "none", fontWeight: 600 }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.slice(0, modalStartIndex) + fullOverlayJSX + content.slice(lastClosingIndex);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully applied all requested Name Templates states and interactions!");
