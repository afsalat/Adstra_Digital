"use client";

import React, { useState, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  FileText,
  CheckCircle2,
  Palette,
  Users,
  Eye,
  Calendar,
  Send,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Plus,
  Filter,
  Search,
  LayoutGrid,
  List,
  Link as LinkIcon,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  Layers,
  Smartphone,
  ExternalLink,
  MessageSquare,
  X,
  ChevronRight,
  History,
} from "lucide-react";
import PostTimelineModal from "./PostTimelineModal";
import ScriptViewModal from "./ScriptViewModal";

// The 7 Stages defined in the operational workflow diagram
const WORKFLOW_STAGES = [
  {
    id: "script",
    label: "1. Script",
    shortName: "Script",
    desc: "Hook, copy & visual concept ideation",
    color: "#6366f1",
    bgLight: "#eef2ff",
    badgeBg: "#e0e7ff",
    icon: FileText,
    statuses: ["script", "draft"],
  },
  {
    id: "script_approval",
    label: "2. Script Approval",
    shortName: "Script Approval",
    desc: "Internal review of script & concept",
    color: "#8b5cf6",
    bgLight: "#f5f3ff",
    badgeBg: "#ede9fe",
    icon: CheckCircle2,
    statuses: ["script_approval"],
    hasLoopback: true,
    loopbackLabel: "If not better → Rejected back to Script",
  },
  {
    id: "designing",
    label: "3. Scheduled / Designing",
    shortName: "Designing",
    desc: "Graphic design, video editing & creatives",
    color: "#ec4899",
    bgLight: "#fdf2f8",
    badgeBg: "#fce7f3",
    icon: Palette,
    statuses: ["designing"],
  },
  {
    id: "team_review",
    label: "4. Team Review / Ready",
    shortName: "Team Review",
    desc: "Internal QA on design + caption before client",
    color: "#f59e0b",
    bgLight: "#fffbeb",
    badgeBg: "#fef3c7",
    icon: Users,
    statuses: ["team_review", "internal_review"],
  },
  {
    id: "client_review",
    label: "5. Client Review",
    shortName: "Client Review",
    desc: "Client portal review link & approval",
    color: "#ea580c",
    bgLight: "#fff7ed",
    badgeBg: "#ffedd5",
    icon: Eye,
    statuses: ["client_review"],
    hasLoopback: true,
    loopbackLabel: "If rejected → Loops back to Designing",
  },
  {
    id: "approved",
    label: "6. Approved / Post Schedule",
    shortName: "Post Schedule",
    desc: "Approved creatives scheduled for publishing",
    color: "#0ea5e9",
    bgLight: "#f0f9ff",
    badgeBg: "#e0f2fe",
    icon: Calendar,
    statuses: ["approved", "scheduled"],
  },
  {
    id: "published",
    label: "7. Published / Posted",
    shortName: "Published",
    desc: "Live across social media channels",
    color: "#10b981",
    bgLight: "#ecfdf5",
    badgeBg: "#d1fae5",
    icon: Send,
    statuses: ["published"],
  },
];

export default function WorkflowPipelineTab({
  posts = [],
  clients = [],
  selectedClientId = "all",
  onRefresh,
  onOpenCreatePost,
}) {
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [activeStageFilter, setActiveStageFilter] = useState("all");
  const [copiedToken, setCopiedToken] = useState(null);
  const [timelinePost, setTimelinePost] = useState(null);
  const [viewingScriptPost, setViewingScriptPost] = useState(null);

  // Action / Feedback Modal State
  const [modalAction, setModalAction] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [editScriptNotes, setEditScriptNotes] = useState("");
  const [editDesignerNotes, setEditDesignerNotes] = useState("");
  const [editMediaUrl, setEditMediaUrl] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Helper to find which stage a post belongs to
  const getPostStage = (post) => {
    for (const stage of WORKFLOW_STAGES) {
      if (stage.statuses.includes(post.status)) {
        return stage.id;
      }
    }
    // Fallback for rejected status: if it was in script approval, return script, else designing
    if (post.status === "rejected") {
      return post.client_feedback?.toLowerCase().includes("script") ? "script" : "designing";
    }
    return "script";
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedClientId !== "all" && String(p.client_profile) !== String(selectedClientId)) {
        return false;
      }
      if (formatFilter !== "all" && p.post_type !== formatFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (p.title || "").toLowerCase().includes(q);
        const captionMatch = (p.primary_caption || "").toLowerCase().includes(q);
        const clientMatch = (p.client_name || "").toLowerCase().includes(q);
        if (!titleMatch && !captionMatch && !clientMatch) return false;
      }
      if (activeStageFilter !== "all") {
        const stage = getPostStage(p);
        if (stage !== activeStageFilter) return false;
      }
      return true;
    });
  }, [posts, selectedClientId, formatFilter, searchQuery, activeStageFilter]);

  // Count per stage
  const stageCounts = useMemo(() => {
    const counts = {};
    WORKFLOW_STAGES.forEach((s) => {
      counts[s.id] = 0;
    });
    posts.forEach((p) => {
      if (selectedClientId !== "all" && String(p.client_profile) !== String(selectedClientId)) {
        return;
      }
      const stageId = getPostStage(p);
      if (counts[stageId] !== undefined) {
        counts[stageId]++;
      }
    });
    return counts;
  }, [posts, selectedClientId]);

  // Quick Action Handler
  const handleTransition = async (post, targetStage, actionType, notes = "", extraData = {}) => {
    setSubmittingAction(true);
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      let actorName = "Creative Team";
      let actorRole = "Team Member";
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          actorName = parsed.fullname || parsed.name || parsed.username || actorName;
          actorRole = parsed.role || actorRole;
        } catch (err) {}
      }

      await axios.post(`${API_BASE_URL}/social/posts/${post.id}/transition_stage/`, {
        target_stage: targetStage,
        action_type: actionType,
        notes: notes || actionNotes,
        actor_name: actorName,
        actor_role: actorRole,
        ...extraData,
      });
      setModalAction(null);
      setActionNotes("");
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || "Error updating post workflow stage.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handlePublishNow = async (post) => {
    if (!confirm(`Are you sure you want to publish "${post.title || 'this post'}" immediately across platforms?`)) {
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/social/posts/${post.id}/publish_now/`);
      onRefresh();
    } catch (err) {
      alert("Error publishing post.");
    }
  };

  const copyPublicLink = (token) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/social/review?token=${token}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const openActionModal = (post, type) => {
    setModalAction({ post, type });
    setActionNotes("");
    setEditScriptNotes(post.script_notes || "");
    setEditDesignerNotes(post.designer_notes || "");
    setEditMediaUrl(post.media_urls?.[0] || "");
    setEditScheduledAt(post.scheduled_at ? post.scheduled_at.slice(0, 16) : "");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* FILTER & VIEW CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        {/* Left: Search & Format Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search concepts, scripts, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                fontSize: "0.82rem",
                background: "#ffffff",
                outline: "none",
              }}
            />
          </div>

          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: "0.82rem",
              fontWeight: 600,
              background: "#ffffff",
              color: "#334155",
            }}
          >
            <option value="all">All Formats (Image, Video, Reel)</option>
            <option value="image">Single Image</option>
            <option value="video">Long Video</option>
            <option value="reel">Reel / Short</option>
            <option value="carousel">Carousel</option>
            <option value="text">Text</option>
          </select>
        </div>

        {/* Right: View Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ffffff", padding: 4, borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <button
            onClick={() => setViewMode("kanban")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "none",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              background: viewMode === "kanban" ? "#0f172a" : "transparent",
              color: viewMode === "kanban" ? "#ffffff" : "#64748b",
            }}
          >
            <LayoutGrid size={15} /> 7-Stage Board
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "none",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              background: viewMode === "list" ? "#0f172a" : "transparent",
              color: viewMode === "list" ? "#ffffff" : "#64748b",
            }}
          >
            <List size={15} /> Pipeline List
          </button>
        </div>
      </div>

      {/* 3. KANBAN BOARD VIEW (7 COLUMNS) */}
      {viewMode === "kanban" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(290px, 1fr))",
            gap: 16,
            overflowX: "auto",
            paddingBottom: 20,
            alignItems: "flex-start",
          }}
        >
          {WORKFLOW_STAGES.map((stage) => {
            const stagePosts = filteredPosts.filter((p) => getPostStage(p) === stage.id);
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.id}
                style={{
                  background: "#f8fafc",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 520,
                  maxHeight: "82vh",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #e2e8f0",
                    background: "#ffffff",
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: stage.color }} />
                    <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a" }}>
                      {stage.shortName}
                    </span>
                  </div>
                  <span
                    style={{
                      background: stage.badgeBg,
                      color: stage.color,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    {stagePosts.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div
                  style={{
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    overflowY: "auto",
                    flex: 1,
                  }}
                >
                  {stagePosts.length === 0 ? (
                    <div
                      style={{
                        padding: "32px 16px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "0.78rem",
                        border: "1px dashed #cbd5e1",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.6)",
                      }}
                    >
                      No items in {stage.shortName}
                    </div>
                  ) : (
                    stagePosts.map((post) => (
                      <PostPipelineCard
                        key={post.id}
                        post={post}
                        stage={stage}
                        onTransition={handleTransition}
                        onPublishNow={handlePublishNow}
                        onCopyLink={copyPublicLink}
                        copiedToken={copiedToken}
                        onOpenModal={openActionModal}
                        onOpenTimeline={(post) => setTimelinePost(post)}
                        onViewScript={(post) => setViewingScriptPost(post)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. LIST / TABLE VIEW */}
      {viewMode === "list" && (
        <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr 1fr 1.2fr",
              padding: "14px 20px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontWeight: 800,
              fontSize: "0.78rem",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            <div>Client & Format</div>
            <div>Title / Script Hook</div>
            <div>Current Stage</div>
            <div>Creative Media</div>
            <div>Schedule Date</div>
            <div style={{ textAlign: "right" }}>Workflow Actions</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredPosts.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>
                No posts found matching the selected filters.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const stageId = getPostStage(post);
                const stage = WORKFLOW_STAGES.find((s) => s.id === stageId) || WORKFLOW_STAGES[0];

                return (
                  <div
                    key={post.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr 1fr 1.2fr",
                      padding: "14px 20px",
                      borderBottom: "1px solid #f1f5f9",
                      alignItems: "center",
                      fontSize: "0.82rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{post.client_name || "Adstra Brand"}</div>
                      <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "capitalize" }}>
                        {post.post_type} • {post.platforms?.join(", ") || "Instagram"}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>
                        {post.title || "Untitled Concept"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>
                        {post.primary_caption || post.script_notes || "No caption added yet"}
                      </div>
                    </div>

                    <div>
                      <span
                        style={{
                          background: stage.badgeBg,
                          color: stage.color,
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {stage.shortName}
                      </span>
                      {post.client_feedback && (
                        <div style={{ fontSize: "0.68rem", color: "#ef4444", marginTop: 2, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                          <AlertTriangle size={11} color="#ef4444" /> Has Revision Notes
                        </div>
                      )}
                    </div>

                    <div>
                      {post.media_urls?.[0] ? (
                        <img
                          src={post.media_urls[0]}
                          alt=""
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }}
                        />
                      ) : (
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontStyle: "italic" }}>
                          Needs Design
                        </span>
                      )}
                    </div>

                    <div>
                      {post.scheduled_at ? (
                        <div style={{ fontSize: "0.76rem", color: "#334155", fontWeight: 600 }}>
                          {new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {new Date(post.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Unscheduled</span>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button
                        onClick={() => setTimelinePost(post)}
                        title="View post lifecycle timeline graph"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          padding: "5px 10px",
                          borderRadius: 6,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "#334155",
                        }}
                      >
                        <History size={12} style={{ color: "#16a34a" }} />
                        Timeline
                      </button>

                      <button
                        onClick={() => openActionModal(post, "edit_notes")}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          padding: "5px 10px",
                          borderRadius: 6,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Details / Edit
                      </button>

                      {stageId === "script" && (
                        <button
                          onClick={() => handleTransition(post, "script_approval", "advance", "Submitted script for review")}
                          style={{
                            background: "#4f46e5",
                            color: "#fff",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Submit Approval →
                        </button>
                      )}

                      {stageId === "script_approval" && (
                        <button
                          onClick={() => setViewingScriptPost(post)}
                          style={{
                            background: "#8b5cf6",
                            color: "#fff",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          View Script
                        </button>
                      )}

                      {stageId === "client_review" && (
                        <button
                          onClick={() => copyPublicLink(post.client_approval_token)}
                          style={{
                            background: "#ea580c",
                            color: "#fff",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {copiedToken === post.client_approval_token ? <Check size={12} /> : <Copy size={12} />}
                          Client Link
                        </button>
                      )}

                      {stageId === "approved" && (
                        <button
                          onClick={() => handlePublishNow(post)}
                          style={{
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                          }}
                        >
                          <Send size={12} /> Publish Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. ACTION / FEEDBACK / EDIT MODAL */}
      {modalAction && (
        <div className="social-modal-overlay" onClick={() => setModalAction(null)}>
          <div
            className="social-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 620, padding: 24, borderRadius: 20 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#eef2ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    {modalAction.type === "reject_script" && "Reject Script (Send Back to Stage 1)"}
                    {modalAction.type === "approve_script" && "Approve Script → Move to Designing"}
                    {modalAction.type === "design_ready" && "Design Complete → Move to Team QA Review"}
                    {modalAction.type === "send_client" && "Team QA Approved → Move to Client Review"}
                    {modalAction.type === "client_changes" && "Client Revisions (Send Back to Designing)"}
                    {modalAction.type === "client_approve" && "Client Approved → Move to Schedule"}
                    {modalAction.type === "edit_notes" && "Workflow Post Details & Assets"}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
                    {modalAction.post.title || "Social Media Concept"} • {modalAction.post.client_name || "Adstra Client"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAction(null)}
                style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              
              {/* Context Summary */}
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>
                  Current Concept / Copy:
                </div>
                <div style={{ fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.4, maxHeight: 90, overflowY: "auto" }}>
                  {modalAction.post.primary_caption || modalAction.post.script_notes || "No caption available"}
                </div>
              </div>

              {/* Script Notes Input */}
              {(modalAction.type === "edit_notes" || modalAction.type === "reject_script") && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Script Hook, Copy & Copywriting Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editScriptNotes}
                    onChange={(e) => setEditScriptNotes(e.target.value)}
                    placeholder="Hook, angle, copy bullets, or script outline..."
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", outline: "none" }}
                  />
                </div>
              )}

              {/* Designer Notes & Media URL */}
              {(modalAction.type === "edit_notes" || modalAction.type === "design_ready" || modalAction.type === "approve_script") && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Visual Creative URL (Image / Video URL)
                  </label>
                  <input
                    type="text"
                    value={editMediaUrl}
                    onChange={(e) => setEditMediaUrl(e.target.value)}
                    placeholder="https://... or media asset URL"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", outline: "none", marginBottom: 10 }}
                  />

                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Designer / Editor Instructions (Dimensions, Colors, Video Cuts)
                  </label>
                  <textarea
                    rows={2}
                    value={editDesignerNotes}
                    onChange={(e) => setEditDesignerNotes(e.target.value)}
                    placeholder="e.g. 1080x1350 vertical carousel, bold yellow highlights, add Adstra logo watermark..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", outline: "none" }}
                  />
                </div>
              )}

              {/* Scheduled Date */}
              {(modalAction.type === "edit_notes" || modalAction.type === "client_approve") && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Publish Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editScheduledAt}
                    onChange={(e) => setEditScheduledAt(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", outline: "none" }}
                  />
                </div>
              )}

              {/* Feedback / Reason Box (For loopbacks or approvals) */}
              {modalAction.type !== "edit_notes" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    {modalAction.type === "reject_script" && "Reason for Rejecting Script (Sent to Copywriter) *"}
                    {modalAction.type === "client_changes" && "Client Requested Changes / Revision Feedback *"}
                    {modalAction.type === "approve_script" && "Approval Notes (Optional)"}
                    {modalAction.type === "design_ready" && "Design QA Hand-off Notes"}
                    {modalAction.type === "send_client" && "Review Instructions for Client"}
                    {modalAction.type === "client_approve" && "Final Sign-off Notes"}
                  </label>
                  <textarea
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder={
                      modalAction.type === "reject_script"
                        ? "Explain why script is not better and what hook/CTA needs improvement..."
                        : modalAction.type === "client_changes"
                        ? "Specify graphic/copy changes requested by the client..."
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
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalAction(null)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>

                {modalAction.type === "reject_script" && (
                  <button
                    disabled={submittingAction || !actionNotes.trim()}
                    onClick={() => handleTransition(modalAction.post, "script", "reject", actionNotes, { script_notes: editScriptNotes })}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: "#dc2626",
                      color: "#fff",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <RotateCcw size={14} /> Loopback to Script
                  </button>
                )}

                {modalAction.type === "approve_script" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={submittingAction}
                      onClick={() => handleTransition(modalAction.post, "script", "reject", actionNotes || "Script not better, rework hook", { script_notes: editScriptNotes })}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ef4444", color: "#dc2626", background: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Reject (Needs Work)
                    </button>
                    <button
                      disabled={submittingAction}
                      onClick={() => handleTransition(modalAction.post, "designing", "advance", actionNotes || "Script approved, ready for design", { designer_notes: editDesignerNotes, media_urls: editMediaUrl ? [editMediaUrl] : modalAction.post.media_urls })}
                      style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
                    >
                      Approve → Designing
                    </button>
                  </div>
                )}

                {modalAction.type === "design_ready" && (
                  <button
                    disabled={submittingAction}
                    onClick={() => handleTransition(modalAction.post, "team_review", "advance", actionNotes || "Creative design attached, ready for QA", { designer_notes: editDesignerNotes, media_urls: editMediaUrl ? [editMediaUrl] : modalAction.post.media_urls })}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#ec4899", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
                  >
                    Mark Ready for Team QA →
                  </button>
                )}

                {modalAction.type === "send_client" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={submittingAction}
                      onClick={() => handleTransition(modalAction.post, "designing", "reject", actionNotes || "QA failed, design adjustments required")}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #f97316", color: "#ea580c", background: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      ↺ Back to Design
                    </button>
                    <button
                      disabled={submittingAction}
                      onClick={() => handleTransition(modalAction.post, "client_review", "advance", actionNotes || "Team QA passed, sent to client review")}
                      style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#ea580c", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
                    >
                      Send to Client Review →
                    </button>
                  </div>
                )}

                {modalAction.type === "client_changes" && (
                  <button
                    disabled={submittingAction || !actionNotes.trim()}
                    onClick={() => handleTransition(modalAction.post, "designing", "reject", actionNotes)}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: "#ea580c",
                      color: "#fff",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <RotateCcw size={14} /> Loopback to Designing
                  </button>
                )}

                {modalAction.type === "client_approve" && (
                  <button
                    disabled={submittingAction}
                    onClick={() => handleTransition(modalAction.post, "approved", "advance", actionNotes || "Client approved design & copy", { scheduled_at: editScheduledAt ? new Date(editScheduledAt).toISOString() : modalAction.post.scheduled_at })}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#0ea5e9", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
                  >
                    Approve → Schedule Post
                  </button>
                )}

                {modalAction.type === "edit_notes" && (
                  <button
                    disabled={submittingAction}
                    onClick={() => handleTransition(modalAction.post, modalAction.post.status, "update", "Updated workflow notes", { script_notes: editScriptNotes, designer_notes: editDesignerNotes, media_urls: editMediaUrl ? [editMediaUrl] : modalAction.post.media_urls, scheduled_at: editScheduledAt ? new Date(editScheduledAt).toISOString() : modalAction.post.scheduled_at })}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Timeline Stepper Graph Modal */}
      {timelinePost && (
        <PostTimelineModal
          post={timelinePost}
          isOpen={Boolean(timelinePost)}
          onClose={() => setTimelinePost(null)}
          onRefresh={onRefresh}
        />
      )}

      {/* Script Read-Only View & Review Modal */}
      {viewingScriptPost && (
        <ScriptViewModal
          isOpen={Boolean(viewingScriptPost)}
          onClose={() => setViewingScriptPost(null)}
          post={viewingScriptPost}
          onApprove={(p) =>
            handleTransition(p, "designing", "advance", "Script approved, ready for visual design")
          }
          onReject={(p, reason) =>
            handleTransition(p, "script", "reject", reason, { script_notes: p.script_notes })
          }
          onEdit={(p) => {
            if (onOpenCreatePost) onOpenCreatePost(p);
          }}
          onOpenTimeline={(p) => setTimelinePost(p)}
        />
      )}

    </div>
  );
}

// Sub-Component: Kanban Card for a Post in Pipeline
function PostPipelineCard({
  post,
  stage,
  onTransition,
  onPublishNow,
  onCopyLink,
  copiedToken,
  onOpenModal,
  onOpenTimeline,
  onViewScript,
}) {
  const isRejectedLoopback = Boolean(post.client_feedback);

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 12,
        padding: "12px 14px",
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${stage.color}`,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
      }}
    >
      {/* Top badges: Client & Format */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            color: post.client_primary_color || "#4338ca",
            background: "#f1f5f9",
            padding: "2px 8px",
            borderRadius: 6,
            maxWidth: 130,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {post.client_name || "Adstra Client"}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTimeline && onOpenTimeline(post);
            }}
            title="View post lifecycle timeline & history"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              padding: "2px 6px",
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            <History size={11} style={{ color: "#16a34a" }} />
            Timeline
          </button>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#64748b",
              background: "#f8fafc",
              padding: "2px 6px",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              textTransform: "uppercase",
            }}
          >
            {post.post_type}
          </span>
        </div>
      </div>

      {/* Post Title */}
      <div>
        <h5
          onClick={() => onOpenTimeline && onOpenTimeline(post)}
          title="Click to view lifecycle timeline graph"
          style={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.3,
            cursor: "pointer",
          }}
        >
          {post.title || "Untitled Concept"}
        </h5>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.75rem",
            color: "#64748b",
            lineHeight: 1.4,
            maxHeight: 48,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {post.primary_caption || post.script_notes || "No draft copy provided yet..."}
        </p>
      </div>

      {/* Media Creative Preview (if present) or Prompt to Add */}
      {post.media_urls?.[0] ? (
        <div style={{ position: "relative", width: "100%", height: 110, borderRadius: 8, overflow: "hidden" }}>
          <img
            src={post.media_urls[0]}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        stage.id === "designing" && (
          <div
            onClick={() => onOpenModal(post, "edit_notes")}
            style={{
              padding: "10px",
              border: "1.5px dashed #f472b6",
              borderRadius: 8,
              background: "#fdf2f8",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <Palette size={14} color="#db2777" style={{ marginBottom: 2 }} />
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#db2777" }}>
              + Attach Visual Creative URL
            </div>
          </div>
        )
      )}

      {/* Rejection / Revision Alert Banner */}
      {isRejectedLoopback && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "6px 8px",
            fontSize: "0.7rem",
            color: "#b91c1c",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={12} /> Revision Feedback:
          </div>
          <div style={{ lineHeight: 1.3 }}>{post.client_feedback}</div>
        </div>
      )}

      {/* Platforms & Schedule info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", color: "#64748b" }}>
        <span>{post.platforms?.join(" • ") || "Instagram"}</span>
        {post.scheduled_at && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontWeight: 700, color: "#334155" }}>
            <Clock size={11} />
            {new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {/* Quick Stage Transition Actions */}
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
        
        {/* Stage 1: Script */}
        {stage.id === "script" && (
          <>
            <button
              onClick={() => onOpenModal(post, "edit_notes")}
              style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              Edit Script
            </button>
            <button
              onClick={() => onTransition(post, "script_approval", "advance", "Submitted script for internal review")}
              style={{ flex: 1.3, padding: "5px 8px", borderRadius: 6, border: "none", background: "#4f46e5", color: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              Submit →
            </button>
          </>
        )}

        {/* Stage 2: Script Approval */}
        {stage.id === "script_approval" && (
          <>
            <button
              onClick={() => (onViewScript ? onViewScript(post) : onOpenModal(post, "approve_script"))}
              style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              View Script
            </button>
            <button
              onClick={() => onOpenModal(post, "reject_script")}
              style={{ flex: 0.9, padding: "5px 8px", borderRadius: 6, border: "1px solid #ef4444", background: "#fff", color: "#dc2626", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              Reject (↺)
            </button>
            <button
              onClick={() => onTransition(post, "designing", "advance", "Script approved, ready for design")}
              style={{ flex: 1.1, padding: "5px 8px", borderRadius: 6, border: "none", background: "#8b5cf6", color: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              Approve →
            </button>
          </>
        )}

        {/* Stage 3: Designing */}
        {stage.id === "designing" && (
          <>
            <button
              onClick={() => onOpenModal(post, "edit_notes")}
              style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              Edit Assets
            </button>
            <button
              onClick={() => onOpenModal(post, "design_ready")}
              style={{ flex: 1.4, padding: "5px 8px", borderRadius: 6, border: "none", background: "#ec4899", color: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              Design Ready → QA
            </button>
          </>
        )}

        {/* Stage 4: Team Review */}
        {stage.id === "team_review" && (
          <>
            <button
              onClick={() => onTransition(post, "designing", "reject", "Team QA requested design adjustments")}
              style={{ flex: 1, padding: "5px 6px", borderRadius: 6, border: "1px solid #f97316", background: "#fff", color: "#ea580c", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              ↺ Design
            </button>
            <button
              onClick={() => onTransition(post, "client_review", "advance", "Team QA passed, sent to client review")}
              style={{ flex: 1.4, padding: "5px 8px", borderRadius: 6, border: "none", background: "#f59e0b", color: "#fff", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer" }}
            >
              QA Pass → Client
            </button>
          </>
        )}

        {/* Stage 5: Client Review */}
        {stage.id === "client_review" && (
          <>
            <button
              onClick={() => onCopyLink(post.client_approval_token)}
              title="Copy Client Portal Link"
              style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              {copiedToken === post.client_approval_token ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            </button>
            <button
              onClick={() => onOpenModal(post, "client_changes")}
              style={{ flex: 1, padding: "5px 6px", borderRadius: 6, border: "1px solid #ea580c", background: "#fff", color: "#ea580c", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              ↺ Client Notes
            </button>
            <button
              onClick={() => onTransition(post, "approved", "advance", "Client approved design & copy")}
              style={{ flex: 1.2, padding: "5px 8px", borderRadius: 6, border: "none", background: "#ea580c", color: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              Approve →
            </button>
          </>
        )}

        {/* Stage 6: Approved / Post Schedule */}
        {stage.id === "approved" && (
          <>
            <button
              onClick={() => onOpenModal(post, "edit_notes")}
              style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
            >
              Reschedule
            </button>
            <button
              onClick={() => onPublishNow(post)}
              style={{ flex: 1.3, padding: "5px 8px", borderRadius: 6, border: "none", background: "#0ea5e9", color: "#fff", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <Send size={12} /> Publish Now
            </button>
          </>
        )}

        {/* Stage 7: Published */}
        {stage.id === "published" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#10b981", fontWeight: 800, fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={13} /> Live Published
            </span>
            <button
              onClick={() => onOpenModal(post, "edit_notes")}
              style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
            >
              Details
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
