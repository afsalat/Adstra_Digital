import os
import re

filepath = r"c:\Projects\Adstra_Digital\adstra-next\src\components\admin_side\SocialManagement\components\WorkflowStageSection.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state variable
state_target = "const [editAnalytics, setEditAnalytics] = useState({});"
if "const [activeModalTab, setActiveModalTab]" not in content:
    content = content.replace(state_target, state_target + "\n  const [activeModalTab, setActiveModalTab] = useState('copy');")

# 2. Add a reset for activeModalTab in the effect where modal is opened
effect_target = """  useEffect(() => {
    if (modalAction?.post) {"""
effect_replacement = """  useEffect(() => {
    if (modalAction?.post) {
      setActiveModalTab('copy');"""
if "setActiveModalTab('copy');" not in content and effect_target in content:
    content = content.replace(effect_target, effect_replacement)

# 3. Replace the Modal Body section
# We'll use regex to find the section between {/* Modal Body */} and {/* Modal Buttons */}
pattern = re.compile(r'\{\/\*\s*Modal Body\s*\*\/\}.*?\{\/\*\s*Modal Buttons\s*\*\/\}', re.DOTALL)

new_modal_body = """{/* Modal Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              
              {/* Show tabs only for complex modals */}
              {["edit_notes", "design_ready", "client_approve"].includes(modalAction.type) && (
                <div style={{ display: "flex", gap: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                  <button
                    onClick={() => setActiveModalTab('copy')}
                    style={{
                      background: activeModalTab === 'copy' ? '#eff6ff' : 'transparent',
                      color: activeModalTab === 'copy' ? '#2563eb' : '#64748b',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: activeModalTab === 'copy' ? 800 : 600,
                      cursor: 'pointer'
                    }}
                  >
                    Copy & Concept
                  </button>
                  <button
                    onClick={() => setActiveModalTab('creative')}
                    style={{
                      background: activeModalTab === 'creative' ? '#fdf2f8' : 'transparent',
                      color: activeModalTab === 'creative' ? '#db2777' : '#64748b',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: activeModalTab === 'creative' ? 800 : 600,
                      cursor: 'pointer'
                    }}
                  >
                    Creative & Design
                  </button>
                  <button
                    onClick={() => setActiveModalTab('publishing')}
                    style={{
                      background: activeModalTab === 'publishing' ? '#ecfdf5' : 'transparent',
                      color: activeModalTab === 'publishing' ? '#059669' : '#64748b',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: activeModalTab === 'publishing' ? 800 : 600,
                      cursor: 'pointer'
                    }}
                  >
                    Publishing & Schedule
                  </button>
                </div>
              )}

              {/* TAB: COPY & CONCEPT */}
              {(!["edit_notes", "design_ready", "client_approve"].includes(modalAction.type) || activeModalTab === 'copy') && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Context Summary */}
                  <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>
                      Current Concept / Copy:
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.4, maxHeight: 90, overflowY: "auto" }}>
                      {modalAction.post.primary_caption || modalAction.post.script_notes || "No draft caption available"}
                    </div>
                  </div>

                  {/* Script Notes Input */}
                  {(modalAction.type === "edit_notes" || modalAction.type === "reject_script" || modalAction.type === "client_changes" || modalAction.type === "reject_design") && (
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        {modalAction.type === "reject_design" || modalAction.type === "client_changes" ? "Feedback / Revision Notes" : "Script Hook, Outline & Copy Notes"}
                      </label>
                      <textarea
                        rows={4}
                        value={editScriptNotes}
                        onChange={(e) => setEditScriptNotes(e.target.value)}
                        placeholder="Write or refine the hook, angle, or script bullets..."
                        style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", outline: "none" }}
                      />
                    </div>
                  )}

                  {/* Archive Post Warning */}
                  {modalAction.type === "archive_post" && (
                    <div style={{ padding: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#991b1b" }}>
                        Are you sure you want to archive this post? It will be removed from the active dashboard view but its data will be retained in the database.
                      </p>
                    </div>
                  )}
                  
                  {/* Feedback / Reason Box (For loopbacks or approvals) */}
                  {!["edit_notes", "live_urls", "analytics", "archive_post", "design_ready", "client_approve"].includes(modalAction.type) && (
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        {modalAction.type === "reject_script" && "Reason for Rejecting Script (Sent back to Copywriter) *"}
                        {modalAction.type === "reject_design" && "Reason for Rejecting Deliverable (Added to Timeline & Sent to Designer) *"}
                        {modalAction.type === "client_changes" && "Client Requested Changes / Revision Feedback *"}
                        {modalAction.type === "approve_script" && "Approval Remarks (Optional)"}
                        {modalAction.type === "send_client" && "Instructions for Client"}
                      </label>
                      <textarea
                        rows={3}
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder={
                          modalAction.type === "reject_script"
                            ? "Explain why the script is not better and what hook/CTA needs improvement..."
                            : modalAction.type === "reject_design"
                            ? "Explain required design changes (e.g. typography issues, color grading, audio sync, brand guidelines)..."
                            : modalAction.type === "client_changes"
                            ? "Specify graphic/copy changes requested by client..."
                            : "Add any internal remarks or notes..."
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.84rem",
                          outline: "none",
                        }}
                      />
                      {modalAction.type === "reject_design" && (
                        <div style={{ marginTop: 6, fontSize: "0.73rem", color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={12} style={{ color: "#6366f1" }} />
                          <span>This reason will be recorded on the post timeline audit trail and displayed as critique notes in Stage 3.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CREATIVE & DESIGN */}
              {(!["edit_notes", "design_ready", "client_approve"].includes(modalAction.type) || activeModalTab === 'creative') && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {(modalAction.type === "design_ready" || modalAction.type === "edit_notes" || modalAction.type === "client_approve" || modalAction.type === "approve_script") && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                      
                      {/* Column 1: Media Preview / Upload */}
                      <div style={{ flex: "1 1 300px", background: "#fdf2f8", border: "1px solid #fbcfe8", borderRadius: 12, padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#9d174d", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                            <Sparkles size={14} /> Creative Deliverable
                          </span>
                          {editMediaUrl && (
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: 6 }}>
                              ✓ Attached
                            </span>
                          )}
                        </div>

                        {editMediaUrl ? (
                          <div style={{ background: "#0f172a", borderRadius: 10, overflow: "hidden", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ maxHeight: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
                              {(editMediaUrl.toLowerCase().endsWith(".mp4") || editMediaUrl.toLowerCase().endsWith(".mov") || editMediaUrl.toLowerCase().endsWith(".webm") || modalAction.post.post_type === "reel" || modalAction.post.post_type === "video") ? (
                                <video src={editMediaUrl} controls playsInline style={{ maxHeight: 190, maxWidth: "100%", borderRadius: 6 }} />
                              ) : (
                                <img src={editMediaUrl} alt="" style={{ maxHeight: 190, maxWidth: "100%", objectFit: "contain", borderRadius: 6 }} />
                              )}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.createElement("input");
                                    input.type = "file";
                                    input.accept = "video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif";
                                    input.onchange = async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const res = await handleUploadMedia(modalAction.post, file, true);
                                        if (res?.file_url) setEditMediaUrl(res.file_url);
                                      }
                                    };
                                    input.click();
                                  }}
                                  style={{ padding: "4px 8px", borderRadius: 6, background: "#334155", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <RotateCcw size={10} /> Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPreviewingMediaPost({ ...modalAction.post, media_urls: [editMediaUrl] })}
                                  style={{ padding: "4px 8px", borderRadius: 6, background: "#ec4899", border: "none", color: "#fff", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <Play size={10} fill="#fff" /> Player
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { navigator.clipboard.writeText(editMediaUrl); alert("Asset link copied!"); }}
                                  style={{ padding: "4px 8px", borderRadius: 6, background: "#334155", border: "none", color: "#cbd5e1", fontSize: "0.7rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}
                                >
                                  <Copy size={10} /> Link
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditMediaUrl("")}
                                style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(239, 68, 68, 0.2)", border: "none", color: "#f87171", fontSize: "0.7rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif";
                                input.onchange = async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const res = await handleUploadMedia(modalAction.post, file, true);
                                    if (res?.file_url) setEditMediaUrl(res.file_url);
                                  }
                                };
                                input.click();
                              }}
                              style={{ border: "2px dashed #f472b6", borderRadius: 10, background: "#fff", padding: "18px 14px", textAlign: "center", cursor: "pointer", marginBottom: 8 }}
                            >
                              <Upload size={22} style={{ color: "#db2777", margin: "0 auto 4px" }} />
                              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#be185d" }}>
                                Browse or Drag & Drop
                              </div>
                            </div>
                            <input
                              type="text"
                              value={editMediaUrl}
                              onChange={(e) => setEditMediaUrl(e.target.value)}
                              placeholder="Or paste cloud asset link..."
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Column 2: Brief / Notes */}
                      <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#475569", marginBottom: 3 }}>
                            Designer / Editor Brief & Notes
                          </label>
                          <textarea
                            rows={4}
                            value={editDesignerNotes}
                            onChange={(e) => setEditDesignerNotes(e.target.value)}
                            placeholder="e.g. 1080x1920 60s Reel rendered with captions and sound design..."
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", outline: "none" }}
                          />
                        </div>
                        {modalAction.type === "client_approve" && (
                          <div>
                            <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#475569", marginBottom: 3 }}>
                              Final Sign-off Notes (Optional)
                            </label>
                            <textarea
                              rows={2}
                              value={actionNotes}
                              onChange={(e) => setActionNotes(e.target.value)}
                              placeholder="Any final notes from the client..."
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", outline: "none" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PUBLISHING & SCHEDULE */}
              {(!["edit_notes", "design_ready", "client_approve"].includes(modalAction.type) || activeModalTab === 'publishing') && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  
                  {/* Schedule Box */}
                  {(modalAction.type === "edit_notes" || modalAction.type === "client_approve") && (
                    <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 14 }}>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>
                        Publish Schedule Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={editScheduledAt}
                        onChange={(e) => setEditScheduledAt(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #7dd3fc", fontSize: "0.84rem", outline: "none" }}
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                    {/* Live URLs */}
                    {(modalAction.type === "live_urls" || modalAction.type === "edit_notes") && (
                      <div style={{ flex: "1 1 300px" }}>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Platform Live URLs
                        </label>
                        {(modalAction.post.platforms && modalAction.post.platforms.length > 0 ? modalAction.post.platforms : ['instagram', 'facebook', 'linkedin']).map((platform) => (
                          <div key={platform} style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155", display: "inline-block", width: 80, textTransform: "capitalize" }}>{platform}</span>
                            <input
                              type="text"
                              value={editLiveUrls[platform] || ""}
                              onChange={(e) => setEditLiveUrls({ ...editLiveUrls, [platform]: e.target.value })}
                              placeholder={`Paste live ${platform} URL here...`}
                              style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Analytics */}
                    {(modalAction.type === "analytics" || modalAction.type === "edit_notes") && (
                      <div style={{ flex: "1 1 300px" }}>
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
                  </div>
                </div>
              )}

            </div>
            {/* Modal Buttons */}"""

if re.search(pattern, content):
    content = re.sub(pattern, new_modal_body, content)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Modal overhaul completed successfully.")
else:
    print("Could not find the target Modal Body section.")
