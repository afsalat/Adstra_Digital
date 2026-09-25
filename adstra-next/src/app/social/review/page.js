"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import API_BASE_URL, { BASE_URL } from "@/utils/apiBase";
import { CheckCircle2, AlertCircle, Sparkles, Send, Clock, Calendar, Check, X, Film, ImageIcon, ExternalLink, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";

const resolveMediaUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanBase = (BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
};

const isVideoMedia = (url, postType) => {
  if (postType === "reel" || postType === "video") return true;
  if (!url || typeof url !== "string") return false;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".m4v") ||
    clean.endsWith(".avi") ||
    clean.endsWith(".mkv")
  );
};

function ReviewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState(null); // 'approved' | 'changes_requested'
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("No review token was provided in the URL.");
      return;
    }
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/social/review/${token}/`)
      .then((res) => {
        setPost(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Unable to load review post. The link may be invalid or expired.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (actionType) => {
    if (!reviewerName.trim()) {
      alert("Please enter your name or company designation.");
      return;
    }
    if (actionType === "request_changes" && !feedback.trim()) {
      alert("Please enter revision details or requested changes.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/social/review/${token}/`, {
        action: actionType,
        reviewer_name: reviewerName,
        notes: feedback,
      });
      setActionDone(res.data.status);
    } catch (err) {
      alert(err.response?.data?.error || "Error processing your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }}></div>
          <p style={{ color: "#64748b", fontSize: "1rem" }}>Loading post for review...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "sans-serif", padding: 20 }}>
        <div style={{ background: "#ffffff", maxWidth: 480, width: "100%", borderRadius: 16, padding: 32, textAlign: "center", border: "1px solid #fee2e2", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <div style={{ width: 56, height: 56, background: "#fee2e2", color: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: "1.25rem", color: "#0f172a", marginBottom: 8, fontWeight: 700 }}>Review Link Expired or Not Found</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.5 }}>{error || "We could not find the post associated with this link. Please check with your Adstra Digital account manager."}</p>
        </div>
      </div>
    );
  }

  const mediaList = post.media_urls && Array.isArray(post.media_urls) ? post.media_urls : [];
  const currentRawMedia = mediaList[activeMediaIdx] || mediaList[0] || "";
  const currentMediaUrl = resolveMediaUrl(currentRawMedia);
  const isVideo = isVideoMedia(currentMediaUrl, post.post_type);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Brand Banner */}
        <div style={{ background: "#ffffff", borderRadius: 20, padding: "24px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #4f46e5, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}>
              {post.client_name ? post.client_name.charAt(0) : "A"}
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {post.client_name || "Client"} Review Portal
              </h1>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "2px 0 0" }}>
                Powered by Adstra Digital Marketing Command
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", padding: "6px 14px", borderRadius: 20, fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>
            <Calendar size={14} />
            {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Scheduled for publishing"}
          </div>
        </div>

        {/* Success Banner */}
        {actionDone && (
          <div style={{ background: actionDone === "approved" ? "#ecfdf5" : "#fffbeb", border: `1px solid ${actionDone === "approved" ? "#a7f3d0" : "#fde68a"}`, borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <CheckCircle2 size={28} color={actionDone === "approved" ? "#10b981" : "#f59e0b"} />
            <div>
              <h4 style={{ margin: 0, color: actionDone === "approved" ? "#065f46" : "#92400e", fontSize: "1.05rem", fontWeight: 700 }}>
                {actionDone === "approved" ? "Post Approved Successfully!" : "Revision Feedback Submitted!"}
              </h4>
              <p style={{ margin: "4px 0 0", color: actionDone === "approved" ? "#047857" : "#b45309", fontSize: "0.875rem" }}>
                {actionDone === "approved"
                  ? "Thank you! Your content is now scheduled and locked for publishing across your social platforms."
                  : "Thank you for the notes. The Adstra Digital creative team has been notified and will make the requested adjustments."}
              </p>
            </div>
          </div>
        )}

        {/* Content Card */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: "#ffffff", borderRadius: 20, padding: 32, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>

          {/* Media Preview */}
          <div>
            <div style={{ borderRadius: 14, overflow: "hidden", background: "#0f172a", border: "1px solid #e2e8f0", minHeight: 340, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {currentMediaUrl ? (
                mediaError ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                    <AlertCircle size={36} color="#f59e0b" style={{ marginBottom: 10, margin: "0 auto" }} />
                    <p style={{ margin: "10px 0 4px", fontSize: "0.9rem", color: "#e2e8f0", fontWeight: 700 }}>
                      Media Preview Unavailable
                    </p>
                    <p style={{ margin: "0 0 14px", fontSize: "0.8rem", color: "#94a3b8" }}>
                      Unable to render inline player/image.
                    </p>
                    <a
                      href={currentMediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#334155",
                        color: "#38bdf8",
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={14} /> Open Original Deliverable
                    </a>
                  </div>
                ) : isVideo ? (
                  <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 340, background: "#020617", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <video
                      key={currentMediaUrl}
                      src={currentMediaUrl}
                      controls
                      playsInline
                      preload="metadata"
                      style={{
                        width: "100%",
                        maxHeight: 440,
                        objectFit: "contain",
                        borderRadius: 14,
                        outline: "none",
                        background: "#000",
                      }}
                      onError={() => setMediaError(true)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "rgba(15, 23, 42, 0.82)",
                        backdropFilter: "blur(6px)",
                        color: "#ffffff",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        pointerEvents: "none",
                      }}
                    >
                      <Film size={12} color="#ec4899" /> Video Reel
                    </div>
                  </div>
                ) : (
                  <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 340, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img
                      key={currentMediaUrl}
                      src={currentMediaUrl}
                      alt={post.title || "Post Preview"}
                      style={{ width: "100%", maxHeight: 440, objectFit: "contain" }}
                      onError={() => setMediaError(true)}
                    />
                  </div>
                )
              ) : (
                <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                  <Sparkles size={40} style={{ marginBottom: 12, opacity: 0.6 }} />
                  <p style={{ fontSize: "0.9rem" }}>Text Announcement / Direct Post</p>
                </div>
              )}
            </div>

            {/* Carousel navigation if multiple media */}
            {mediaList.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaIdx((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
                    setMediaError(false);
                  }}
                  style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                  {activeMediaIdx + 1} of {mediaList.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaIdx((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
                    setMediaError(false);
                  }}
                  style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Media Details & Open Action */}
            {currentMediaUrl && !mediaError && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <a
                  href={currentMediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.76rem", color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}
                >
                  <ExternalLink size={13} /> Open full resolution file
                </a>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: 800 }}>
                  {isVideo ? "MP4 / VIDEO" : "IMAGE ASSET"}
                </span>
              </div>
            )}

            {/* Target Platforms */}
            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(post.platforms || []).map((p) => (
                <span key={p} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>
                  {p}
                </span>
              ))}
              <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={14} /> Status: <strong style={{ color: "#0f172a" }}>{(post.status || "").replace("_", " ").toUpperCase()}</strong>
              </span>
            </div>
          </div>

          {/* Copy and Actions */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
              {post.title || "Social Media Post"}
            </h3>

            {/* Caption */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16, flex: 1, maxHeight: 220, overflowY: "auto" }}>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#334155", fontSize: "0.92rem", lineHeight: 1.6 }}>
                {post.primary_caption}
              </p>
              {post.hashtags && (
                <p style={{ marginTop: 12, color: "#4f46e5", fontSize: "0.85rem", fontWeight: 600 }}>
                  {post.hashtags}
                </p>
              )}
            </div>

            {/* First Comment / Extra Notes */}
            {post.first_comment && (
              <div style={{ background: "#f1f5f9", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.82rem", color: "#475569" }}>
                <strong>First Comment:</strong> {post.first_comment}
              </div>
            )}

            {/* Client Action Box */}
            {!actionDone && (
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Your Name / Title *
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Alex (microsoft Marketing)"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none" }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Comments / Feedback (Optional for approval, required for revisions)
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add any copy tweaks, mentions, or changes needed..."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none", resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={submitting}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#10b981", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(16,185,129,0.2)" }}
                  >
                    <Check size={18} /> Approve Post
                  </button>
                  <button
                    onClick={() => handleAction("request_changes")}
                    disabled={submitting}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <X size={18} /> Request Changes
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default function ClientReviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading review portal...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
