const fs = require('fs');
const file = 'c:\\Projects\\Adstra_Digital\\adstra-next\\src\\components\\admin_side\\SocialManagement\\components\\WorkflowStageSection.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Icons
if (!content.includes('Link,')) {
    content = content.replace(/AlertCircle,/, 'AlertCircle, Link, BarChart2, Archive,');
}

// 2. Add State
if (!content.includes('const [editLiveUrls')) {
    const stateMarker = 'const [editScheduledAt, setEditScheduledAt] = useState("");';
    content = content.replace(stateMarker, `${stateMarker}\n  const [editLiveUrls, setEditLiveUrls] = useState({});\n  const [editAnalytics, setEditAnalytics] = useState({});`);
}

// 3. Update openActionModal
if (!content.includes('setEditLiveUrls(post.live_urls')) {
    const openMarker = 'setEditScheduledAt(post.scheduled_at ? post.scheduled_at.slice(0, 16) : "");';
    content = content.replace(openMarker, `${openMarker}\n    setEditLiveUrls(post.live_urls || {});\n    setEditAnalytics(post.analytics || {});`);
}

// 4. Modal Titles
if (!content.includes('Update Live Post URLs')) {
    const titleMarker = '{modalAction.type === "edit_notes" && (';
    const newTitles = `
                    {modalAction.type === "live_urls" && "Update Live Post URLs"}
                    {modalAction.type === "analytics" && "Track Post Performance / Analytics"}
                    {modalAction.type === "archive_post" && "Archive Post (Remove from Dashboard)"}
                    ${titleMarker}`;
    content = content.replace(titleMarker, newTitles);
}

// 5. Modal Body
if (!content.includes('modalAction.type === "live_urls"')) {
    const bodyMarker = '{/* Script Approval stage brief */}';
    const newBody = `
              {modalAction.type === "live_urls" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Platform Live URLs
                  </label>
                  {modalAction.post.platforms.map((platform) => (
                    <div key={platform} style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155", display: "inline-block", width: 80, textTransform: "capitalize" }}>{platform}</span>
                      <input
                        type="text"
                        value={editLiveUrls[platform] || ""}
                        onChange={(e) => setEditLiveUrls({ ...editLiveUrls, [platform]: e.target.value })}
                        placeholder={\`Paste live \${platform} URL here...\`}
                        style={{ width: "calc(100% - 90px)", padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {modalAction.type === "analytics" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Basic Post Analytics
                  </label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {['likes', 'comments', 'shares', 'reach'].map(metric => (
                      <div key={metric} style={{ flex: "1 1 45%" }}>
                         <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "capitalize" }}>{metric}</span>
                         <input
                           type="number"
                           value={editAnalytics[metric] || ""}
                           onChange={(e) => setEditAnalytics({ ...editAnalytics, [metric]: parseInt(e.target.value) || 0 })}
                           placeholder={\`Total \${metric}\`}
                           style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none", marginTop: 2 }}
                         />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalAction.type === "archive_post" && (
                <div style={{ padding: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#991b1b" }}>
                    Are you sure you want to archive this post? It will be removed from the active dashboard view but its data will be retained in the database.
                  </p>
                </div>
              )}

              ${bodyMarker}`;
    content = content.replace(bodyMarker, newBody);
}

// 6. Modal Footer Buttons
if (!content.includes('Save Live URLs')) {
    const footerMarker = '{modalAction.type === "approve_script" && (';
    const newFooter = `
                {modalAction.type === "archive_post" && (
                  <button
                    disabled={submittingAction}
                    onClick={() => handleTransition(modalAction.post, "archived", "advance", "Post archived by user.")}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Archive size={14} /> Confirm Archive
                  </button>
                )}

                {modalAction.type === "live_urls" && (
                  <button
                    disabled={submittingAction}
                    onClick={async () => {
                      try {
                        setSubmittingAction(true);
                        await axios.patch(\`\${API_BASE_URL}/social/posts/\${modalAction.post.id}/\`, { live_urls: editLiveUrls });
                        onRefresh();
                        setModalAction(null);
                      } catch(e) { alert("Failed to update URLs"); } finally { setSubmittingAction(false); }
                    }}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Link size={14} /> Save Live URLs
                  </button>
                )}

                {modalAction.type === "analytics" && (
                  <button
                    disabled={submittingAction}
                    onClick={async () => {
                      try {
                        setSubmittingAction(true);
                        await axios.patch(\`\${API_BASE_URL}/social/posts/\${modalAction.post.id}/\`, { analytics: editAnalytics });
                        onRefresh();
                        setModalAction(null);
                      } catch(e) { alert("Failed to update analytics"); } finally { setSubmittingAction(false); }
                    }}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <BarChart2 size={14} /> Save Analytics
                  </button>
                )}

                ${footerMarker}`;
    content = content.replace(footerMarker, newFooter);
}

// 7. Stage 7 buttons
if (!content.includes('Live URLs')) {
    const stage7Marker = '<button\n                            onClick={() => onOpenModal(post, "edit_notes")}\n                            style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}\n                          >\n                            Details\n                          </button>';
    const newButtons = `
                          <button
                            onClick={() => onOpenModal(post, "live_urls")}
                            style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #bfdbfe", background: "#eff6ff", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", color: "#1d4ed8" }}
                          >
                            Live URLs
                          </button>
                          <button
                            onClick={() => onOpenModal(post, "analytics")}
                            style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #a7f3d0", background: "#ecfdf5", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", color: "#047857" }}
                          >
                            Analytics
                          </button>
                          <button
                            onClick={() => onOpenModal(post, "archive_post")}
                            style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", color: "#b91c1c" }}
                          >
                            Archive
                          </button>
                          ${stage7Marker}`;
    content = content.replace(stage7Marker, newButtons);
}

fs.writeFileSync(file, content);
console.log('Patch complete.');
