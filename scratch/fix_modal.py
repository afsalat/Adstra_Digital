import os

filepath = r"c:\Projects\Adstra_Digital\adstra-next\src\components\admin_side\SocialManagement\components\WorkflowStageSection.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the incorrectly placed buttons from the body (around line 1002-1045)
incorrect_buttons = """                {modalAction.type === "archive_post" && (
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
                        await axios.patch(`${API_BASE_URL}/social/posts/${modalAction.post.id}/`, { live_urls: editLiveUrls });
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
                        await axios.patch(`${API_BASE_URL}/social/posts/${modalAction.post.id}/`, { analytics: editAnalytics });
                        onRefresh();
                        setModalAction(null);
                      } catch(e) { alert("Failed to update analytics"); } finally { setSubmittingAction(false); }
                    }}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <BarChart2 size={14} /> Save Analytics
                  </button>
                )}"""

content = content.replace(incorrect_buttons, "")


# 2. Add the correct Inputs to the Modal Body just before {/* Script Approval stage brief */}
body_target = "{/* Script Approval stage brief */}"
body_replacement = """              {modalAction.type === "live_urls" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Platform Live URLs
                  </label>
                  {modalAction.post.platforms && modalAction.post.platforms.map((platform) => (
                    <div key={platform} style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155", display: "inline-block", width: 80, textTransform: "capitalize" }}>{platform}</span>
                      <input
                        type="text"
                        value={editLiveUrls[platform] || ""}
                        onChange={(e) => setEditLiveUrls({ ...editLiveUrls, [platform]: e.target.value })}
                        placeholder={`Paste live ${platform} URL here...`}
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
                           placeholder={`Total ${metric}`}
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

              {/* Script Approval stage brief */}"""

if 'Platform Live URLs' not in content:
    content = content.replace(body_target, body_replacement)


# 3. Add the correctly placed buttons to the Modal Footer
footer_target = """                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>"""

footer_replacement = """                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>

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
                        await axios.patch(`${API_BASE_URL}/social/posts/${modalAction.post.id}/`, { live_urls: editLiveUrls });
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
                        await axios.patch(`${API_BASE_URL}/social/posts/${modalAction.post.id}/`, { analytics: editAnalytics });
                        onRefresh();
                        setModalAction(null);
                      } catch(e) { alert("Failed to update analytics"); } finally { setSubmittingAction(false); }
                    }}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <BarChart2 size={14} /> Save Analytics
                  </button>
                )}"""

if 'Confirm Archive' not in content:
    content = content.replace(footer_target, footer_replacement)


# 4. Hide the feedback textarea for the new actions
feedback_target = '{modalAction.type !== "edit_notes" && ('
feedback_replacement = '{!["edit_notes", "live_urls", "analytics", "archive_post"].includes(modalAction.type) && ('

content = content.replace(feedback_target, feedback_replacement)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Modal patched successfully!")
