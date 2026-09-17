"use client";

import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Link as LinkIcon,
  Copy,
  Check,
  Send,
  UserCheck,
  History,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
} from "lucide-react";

export default function ApprovalCenterTab({
  posts = [],
  clients = [],
  onRefresh,
}) {
  const [activeStageFilter, setActiveStageFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  const pendingPosts = posts.filter((p) => {
    if (activeStageFilter === "all") {
      return ["script_approval", "team_review", "internal_review", "client_review", "approved", "designing"].includes(p.status);
    }
    if (activeStageFilter === "team_review") {
      return ["team_review", "internal_review"].includes(p.status);
    }
    if (activeStageFilter === "approved") {
      return ["approved", "scheduled"].includes(p.status);
    }
    return p.status === activeStageFilter;
  });

  const handleApprove = async (postId) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/social/posts/${postId}/approve/`, {
        notes: reviewNotes || "Approved for publishing",
      });
      setSelectedPost(null);
      setReviewNotes("");
      onRefresh();
    } catch (err) {
      alert("Error approving post.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (postId) => {
    if (!reviewNotes.trim()) {
      alert("Please provide change request notes or revision feedback.");
      return;
    }
    setActionLoading(true);
    try {
      // Loopback to designing per workflow diagram
      await axios.post(`${API_BASE_URL}/social/posts/${postId}/transition_stage/`, {
        target_stage: "designing",
        action_type: "reject",
        notes: reviewNotes,
      });
      setSelectedPost(null);
      setReviewNotes("");
      onRefresh();
    } catch (err) {
      alert("Error sending change request.");
    } finally {
      setActionLoading(false);
    }
  };

  const copyPublicLink = (token) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/social/review?token=${token}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
            Content Approval Workflow & Client Portals
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Review creative drafts, generate client approval links, and track revision timestamps.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 8, background: "#ffffff", padding: 4, borderRadius: 10, border: "1px solid #e2e8f0" }}>
          {[
            { id: "all", label: "All Active Reviews" },
            { id: "script_approval", label: "Script Approval" },
            { id: "team_review", label: "Team QA" },
            { id: "client_review", label: "Client Review" },
            { id: "approved", label: "Approved" },
          ].map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStageFilter(stage.id)}
              style={{
                border: "none",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                background: activeStageFilter === stage.id ? "#0f172a" : "transparent",
                color: activeStageFilter === stage.id ? "#ffffff" : "#64748b",
              }}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stage Tracker Pipeline Visual (7 Stages from diagram) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
          background: "#ffffff",
          padding: "14px 16px",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          marginBottom: 24,
          textAlign: "center",
          fontSize: "0.75rem",
          fontWeight: 700,
        }}
      >
        <div style={{ color: "#6366f1" }}>1. Script</div>
        <div style={{ color: "#8b5cf6" }}>2. Script Approval →</div>
        <div style={{ color: "#ec4899" }}>3. Designing →</div>
        <div style={{ color: "#f59e0b" }}>4. Team QA →</div>
        <div style={{ color: "#ea580c" }}>5. Client Review →</div>
        <div style={{ color: "#0ea5e9" }}>6. Post Schedule →</div>
        <div style={{ color: "#10b981" }}>7. Published</div>
      </div>

      {/* Posts Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {pendingPosts.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: 60, textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: 8 }} />
            <h4 style={{ margin: 0, color: "#0f172a" }}>All Clear! No Pending Approvals</h4>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              All posts for the selected filter have been processed and approved.
            </p>
          </div>
        ) : (
          pendingPosts.map((post) => {
            const isClientReview = post.status === "client_review";
            const isApproved = post.status === "approved" || post.status === "scheduled";

            return (
              <div
                key={post.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: `1px solid ${isClientReview ? "#fdba74" : "#e2e8f0"}`,
                  padding: 20,
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span className={`status-pill ${post.status}`}>
                    {post.status.replace("_", " ")}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4f46e5" }}>
                    {post.client_name}
                  </span>
                </div>

                {/* Media Thumbnail & Title */}
                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "#0f172a",
                      flexShrink: 0,
                    }}
                  >
                    {post.media_urls?.[0] ? (
                      <img
                        src={post.media_urls[0]}
                        alt={post.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.7rem" }}>
                        TEXT
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                      {post.title || "Untitled Post"}
                    </h4>
                    <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#475569", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                      {post.primary_caption}
                    </p>
                  </div>
                </div>

                {/* Target Platforms & Schedule */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#64748b", marginBottom: 14, background: "#f8fafc", padding: "8px 12px", borderRadius: 8 }}>
                  <div>
                    <strong>Platforms:</strong> {(post.platforms || []).join(", ")}
                  </div>
                  <div>
                    {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Unscheduled"}
                  </div>
                </div>

                {/* Public Link Generator Button */}
                <div style={{ marginBottom: 14 }}>
                  <button
                    onClick={() => copyPublicLink(post.client_approval_token)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: 8,
                      background: copiedToken === post.client_approval_token ? "#ecfdf5" : "#f1f5f9",
                      border: `1px solid ${copiedToken === post.client_approval_token ? "#a7f3d0" : "#e2e8f0"}`,
                      color: copiedToken === post.client_approval_token ? "#065f46" : "#334155",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    {copiedToken === post.client_approval_token ? (
                      <>
                        <Check size={14} color="#10b981" /> Public Client Review Link Copied!
                      </>
                    ) : (
                      <>
                        <LinkIcon size={14} /> Copy Client Approval Link
                      </>
                    )}
                  </button>
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setSelectedPost(post)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: 8,
                      background: "#0f172a",
                      color: "#fff",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Review & Audit Trail
                  </button>
                  <button
                    onClick={() => handleApprove(post.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Check size={14} /> Approve
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Review & Audit Modal */}
      {selectedPost && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 680 }}>
            <div className="social-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                Approval Review: {selectedPost.title}
              </h3>
              <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Caption */}
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.9rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {selectedPost.primary_caption}
                {selectedPost.hashtags && (
                  <div style={{ marginTop: 8, color: "#4f46e5", fontWeight: 600, fontSize: "0.85rem" }}>
                    {selectedPost.hashtags}
                  </div>
                )}
              </div>

              {/* Feedback Note Input */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Approval or Revision Notes (Recorded in Audit Trail)
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Approved. Please ensure Instagram carousel has high-contrast subtitle font."
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none", resize: "none" }}
                />
              </div>

              {/* History & Timestamps */}
              <div>
                <h5 style={{ margin: "0 0 8px", fontSize: "0.82rem", fontWeight: 800, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
                  <History size={15} /> Approval Audit History & Timestamps
                </h5>
                <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {(selectedPost.approval_history || []).length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No prior actions logged yet.</span>
                  ) : (
                    selectedPost.approval_history.map((hist) => (
                      <div key={hist.id} style={{ fontSize: "0.78rem", borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#0f172a", fontWeight: 700 }}>
                          <span>{hist.action.replace("_", " ").toUpperCase()} by {hist.actor_name} ({hist.actor_role})</span>
                          <span style={{ color: "#64748b", fontWeight: 500 }}>
                            {new Date(hist.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {hist.notes && <div style={{ color: "#475569", marginTop: 2 }}>{hist.notes}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="social-modal-footer">
              <button
                onClick={() => handleRequestChanges(selectedPost.id)}
                disabled={actionLoading}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
              >
                Request Revisions
              </button>
              <button
                onClick={() => handleApprove(selectedPost.id)}
                disabled={actionLoading}
                style={{ padding: "8px 20px", borderRadius: 8, background: "#10b981", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
              >
                Approve & Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
