"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  FileText,
  CheckCircle2,
  Palette,
  Users,
  Eye,
  Calendar as CalendarIcon,
  Send,
  RotateCcw,
  Plus,
  Search,
  Filter,
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
  X,
  Sparkles,
  List,
  Calendar,
  History,
  Play,
  Upload,
  ChevronDown,
  Download,
  Trash2,
  Maximize2,
} from "lucide-react";
import ContentCalendarTab from "./ContentCalendarTab";
import ScriptCreationModal from "./ScriptCreationModal";
import ScriptViewModal from "./ScriptViewModal";
import PostTimelineModal from "./PostTimelineModal";
import WorkDetailsModal from "./WorkDetailsModal";
import MediaPreviewModal from "./MediaPreviewModal";

export default function WorkflowStageSection({
  stageId, // 'scripts' | 'script_approval' | 'designing' | 'team_review' | 'client_review' | 'post_schedule' | 'published'
  posts = [],
  clients = [],
  mediaAssets = [],
  selectedClientId = "all",
  onRefresh,
  onOpenCreatePost,
  onNavigateStage,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [scriptSubFilter, setScriptSubFilter] = useState("all"); // 'all' | 'draft' | 'under_review' | 'revision'
  const [viewMode, setViewMode] = useState("listing"); // 'listing' | 'calendar'
  const [copiedToken, setCopiedToken] = useState(null);

  // Script Creation Modal State (Stage 1: Scripts)
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [activeScriptPost, setActiveScriptPost] = useState(null);

  // Script Read-Only View & Review Modal State (Stage 2: Script Approval)
  const [viewingScriptPost, setViewingScriptPost] = useState(null);

  // Designer Work Details Modal State (Stage 3: Designing & Production)
  const [viewingWorkDetailsPost, setViewingWorkDetailsPost] = useState(null);

  // Deliverable Media Player & Preview Modal State
  const [previewingMediaPost, setPreviewingMediaPost] = useState(null);

  // Timeline Stepper Modal State
  const [timelinePost, setTimelinePost] = useState(null);

  // Modal State for Action / Feedback / Loopback
  const [modalAction, setModalAction] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [editScriptNotes, setEditScriptNotes] = useState("");
  const [editDesignerNotes, setEditDesignerNotes] = useState("");
  const [editMediaUrl, setEditMediaUrl] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Stage configuration details
  const stageMeta = useMemo(() => {
    switch (stageId) {
      case "scripts":
        return {
          title: "1. Scripts & Content Ideation",
          shortTitle: "Scripts",
          desc: "Write catchy hooks, storyline angles, copy bullet points, and draft captions.",
          color: "#4f46e5",
          bgLight: "#eef2ff",
          icon: FileText,
          statuses: ["script", "draft"],
          ctaLabel: "+ New Script / Idea",
        };
      case "script_approval":
        return {
          title: "2. Script Approval & Review",
          shortTitle: "Script Approval",
          desc: "Review submitted scripts. If script is not better, reject it back to Scripts with critique notes.",
          color: "#8b5cf6",
          bgLight: "#f5f3ff",
          icon: CheckCircle2,
          statuses: ["script_approval"],
          loopbackNote: "↺ Rejections return to Stage 1 (Scripts)",
        };
      case "designing":
        return {
          title: "3. Scheduled / Designing",
          shortTitle: "Designing",
          desc: "Graphic designers and video editors create visuals, reels, and carousels. (Also receives revision loops!)",
          color: "#ec4899",
          bgLight: "#fdf2f8",
          icon: Palette,
          statuses: ["designing"],
          loopbackNote: "↺ Receives revision requests from Client Review & Team QA",
        };
      case "team_review":
        return {
          title: "4. Team Review / Ready (Agency QA)",
          shortTitle: "Team Review",
          desc: "Internal agency quality assurance on typography, aesthetics, brand guidelines, and caption before client review.",
          color: "#f59e0b",
          bgLight: "#fffbeb",
          icon: Users,
          statuses: ["team_review", "internal_review"],
        };
      case "client_review":
        return {
          title: "5. Client Review & Feedback",
          shortTitle: "Client Review",
          desc: "Share client review links for approval. If client requests changes, post loops back to Scheduled / Designing.",
          color: "#ea580c",
          bgLight: "#fff7ed",
          icon: Eye,
          statuses: ["client_review"],
          loopbackNote: "↺ Client changes loop back to Stage 3 (Scheduled / Designing)",
        };
      case "post_schedule":
        return {
          title: "6. Approved / Post Schedule",
          shortTitle: "Post Schedule",
          desc: "Client-approved posts queued in the omnichannel scheduler with confirmed date & time.",
          color: "#0ea5e9",
          bgLight: "#f0f9ff",
          icon: CalendarIcon,
          statuses: ["approved", "scheduled"],
        };
      case "published":
        return {
          title: "7. Published / Posted",
          shortTitle: "Published",
          desc: "Successfully published live content across Instagram, Facebook, LinkedIn, YouTube, X, etc.",
          color: "#10b981",
          bgLight: "#ecfdf5",
          icon: Send,
          statuses: ["published"],
        };
      default:
        return {
          title: "Workflow Section",
          shortTitle: "Section",
          desc: "Content workflow management",
          color: "#4f46e5",
          bgLight: "#eef2ff",
          icon: FileText,
          statuses: ["script"],
        };
    }
  }, [stageId]);

  // Sub-counts for Stage 1 Scripts filter pills
  const scriptSubCounts = useMemo(() => {
    if (stageId !== "scripts") return { all: 0, drafts: 0, underReview: 0, revision: 0 };
    const clientFiltered = posts.filter(
      (p) => selectedClientId === "all" || String(p.client_profile) === String(selectedClientId)
    );
    return {
      all: clientFiltered.filter(
        (p) =>
          ["script", "draft", "script_approval"].includes(p.status) ||
          p.status === "rejected" ||
          Boolean(p.client_feedback)
      ).length,
      drafts: clientFiltered.filter(
        (p) => ["script", "draft"].includes(p.status) && !p.client_feedback
      ).length,
      underReview: clientFiltered.filter((p) => p.status === "script_approval").length,
      revision: clientFiltered.filter(
        (p) => p.status === "rejected" || Boolean(p.client_feedback)
      ).length,
    };
  }, [posts, selectedClientId, stageId]);

  // Filter posts belonging to this stage
  const stagePosts = useMemo(() => {
    return posts.filter((p) => {
      // Client filter
      if (selectedClientId !== "all" && String(p.client_profile) !== String(selectedClientId)) {
        return false;
      }
      // Stage status filter
      const isStatusMatch = stageMeta.statuses.includes(p.status);
      const isFallbackRejected =
        p.status === "rejected" &&
        ((stageId === "scripts" && p.client_feedback?.toLowerCase().includes("script")) ||
          (stageId === "designing" && !p.client_feedback?.toLowerCase().includes("script")));

      if (!isStatusMatch && !isFallbackRejected) {
        return false;
      }

      // Script Sub-Filter in Stage 1
      if (stageId === "scripts" && scriptSubFilter !== "all") {
        if (scriptSubFilter === "draft" && (!["script", "draft"].includes(p.status) || Boolean(p.client_feedback))) return false;
        if (scriptSubFilter === "under_review" && p.status !== "script_approval") return false;
        if (scriptSubFilter === "revision" && !(p.status === "rejected" || Boolean(p.client_feedback))) return false;
      }

      // Format filter
      if (formatFilter !== "all" && p.post_type !== formatFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (p.title || "").toLowerCase().includes(q);
        const captionMatch = (p.primary_caption || "").toLowerCase().includes(q);
        const hookMatch = (p.script_notes || "").toLowerCase().includes(q);
        const clientMatch = (p.client_name || "").toLowerCase().includes(q);
        if (!titleMatch && !captionMatch && !hookMatch && !clientMatch) return false;
      }
      return true;
    });
  }, [posts, stageMeta, stageId, selectedClientId, scriptSubFilter, formatFilter, searchQuery]);

  // Transition Handler
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
      console.error("Workflow transition error:", err);
      let errorMsg = "Error updating post workflow stage.";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          const match = err.response.data.match(/<pre class="exception_value">([^<]+)<\/pre>/);
          errorMsg = match ? match[1] : `Server error (${err.response.status})`;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (typeof err.response.data === "object") {
          errorMsg = Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" | ");
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      alert(errorMsg);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUploadMedia = async (post, file, isReplace = true) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("replace", isReplace ? "true" : "false");
    try {
      const res = await axios.post(`${API_BASE_URL}/social/posts/${post.id}/upload_media/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onRefresh();
      return res.data;
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.error || "Failed to upload media deliverable.");
      return null;
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

  const StageIcon = stageMeta.icon;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      
      {/* 1. Section Header Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          padding: "4px 0",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: stageMeta.bgLight,
                color: stageMeta.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StageIcon size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
              {stageMeta.title}
            </h2>
            <span
              style={{
                background: stageMeta.bgLight,
                color: stageMeta.color,
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: "0.78rem",
                fontWeight: 800,
              }}
            >
              {stagePosts.length} items
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "#64748b" }}>
            {stageMeta.desc}
          </p>
        </div>

        {/* Section Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* View Toggle: Listing & Calendar Only */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <button
              onClick={() => setViewMode("listing")}
              style={{
                border: "none",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: viewMode === "listing" ? "#0f172a" : "transparent",
                color: viewMode === "listing" ? "#ffffff" : "#64748b",
                transition: "all 0.15s ease",
              }}
            >
              <List size={14} /> Listing
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              style={{
                border: "none",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: viewMode === "calendar" ? "#0f172a" : "transparent",
                color: viewMode === "calendar" ? "#ffffff" : "#64748b",
                transition: "all 0.15s ease",
              }}
            >
              <Calendar size={14} /> Calendar
            </button>
          </div>

          {stageId === "scripts" && (
            <button
              onClick={() => {
                setActiveScriptPost(null);
                setScriptModalOpen(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: stageMeta.color,
                color: "#ffffff",
                border: "none",
                padding: "9px 18px",
                borderRadius: 10,
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 4px 12px ${stageMeta.color}40`,
              }}
            >
              + New Script
            </button>
          )}
        </div>
      </div>

      {/* If Calendar Mode: Show Full Calendar Grid */}
      {viewMode === "calendar" ? (
        <ContentCalendarTab
          posts={posts}
          clients={clients}
          selectedClientId={selectedClientId}
          onRefresh={onRefresh}
          onOpenCreatePost={
            stageId === "scripts"
              ? () => {
                  setActiveScriptPost(null);
                  setScriptModalOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <>
          {/* 2. FILTER & SEARCH BAR */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ position: "relative", minWidth: 260 }}>
                <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder={`Search ${stageMeta.shortTitle.toLowerCase()}...`}
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

              {/* Stage 1: Quick Sub-Filters for Drafts vs Under Approval */}
              {stageId === "scripts" && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#f8fafc", padding: 3, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <button
                    type="button"
                    onClick={() => setScriptSubFilter("all")}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 7,
                      border: "none",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: scriptSubFilter === "all" ? "#4f46e5" : "transparent",
                      color: scriptSubFilter === "all" ? "#ffffff" : "#64748b",
                      transition: "all 0.15s ease",
                    }}
                  >
                    All Scripts ({scriptSubCounts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptSubFilter("draft")}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 7,
                      border: "none",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: scriptSubFilter === "draft" ? "#4f46e5" : "transparent",
                      color: scriptSubFilter === "draft" ? "#ffffff" : "#64748b",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Drafts ({scriptSubCounts.drafts})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptSubFilter("under_review")}
                    style={{
                      padding: "5px 11px",
                      borderRadius: 7,
                      border: "none",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: scriptSubFilter === "under_review" ? "#7c3aed" : "transparent",
                      color: scriptSubFilter === "under_review" ? "#ffffff" : "#64748b",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Under Approval ({scriptSubCounts.underReview})
                  </button>
                  {scriptSubCounts.revision > 0 && (
                    <button
                      type="button"
                      onClick={() => setScriptSubFilter("revision")}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 7,
                        border: "none",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        background: scriptSubFilter === "revision" ? "#dc2626" : "transparent",
                        color: scriptSubFilter === "revision" ? "#ffffff" : "#64748b",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Needs Revision ({scriptSubCounts.revision})
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
              Showing {stagePosts.length} {stageMeta.shortTitle.toLowerCase()} items
            </div>
          </div>

          {/* 3. SECTION CARDS GRID */}
          {stagePosts.length === 0 ? (
            <div
              style={{
                padding: "80px 20px",
                textAlign: "center",
                background: "#ffffff",
                borderRadius: 18,
                border: "1px dashed #cbd5e1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: stageMeta.bgLight,
                  color: stageMeta.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StageIcon size={28} />
              </div>
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.15rem" }}>
                No items currently in {stageMeta.shortTitle}
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", maxWidth: 460 }}>
                {stageId === "scripts"
                  ? "Click '+ New Script' to draft your next viral hook and content angle."
                  : `Posts will appear here as they advance from previous stages.`}
              </p>
            </div>
          ) : (
            <StageListingTable
              stagePosts={stagePosts}
              stageId={stageId}
              stageMeta={stageMeta}
              onTransition={handleTransition}
              onPublishNow={handlePublishNow}
              onCopyLink={copyPublicLink}
              copiedToken={copiedToken}
              onOpenModal={openActionModal}
              onNavigateStage={onNavigateStage}
              onOpenTimeline={(post) => setTimelinePost(post)}
              onViewScript={(post) => setViewingScriptPost(post)}
              onViewWorkDetails={(post) => setViewingWorkDetailsPost(post)}
              onPreviewMedia={(post) => setPreviewingMediaPost(post)}
              onUploadMedia={handleUploadMedia}
              onOpenScriptModal={(post) => {
                setActiveScriptPost(post);
                setScriptModalOpen(true);
              }}
            />
          )}
        </>
      )}

      {/* 4. ACTION & REVISION NOTES MODAL */}
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
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: modalAction.type === "reject_design" || modalAction.type === "reject_script" ? "#fef2f2" : "#eef2ff",
                    color: modalAction.type === "reject_design" || modalAction.type === "reject_script" ? "#dc2626" : "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {modalAction.type === "reject_design" || modalAction.type === "reject_script" ? (
                    <RotateCcw size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    {modalAction.type === "reject_script" && "Reject Script (Loopback to Stage 1: Scripts)"}
                    {modalAction.type === "reject_design" && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        Reject Deliverable (Loopback to Stage 3: Designing)
                        <button
                          type="button"
                          onClick={() => {
                            const p = modalAction.post;
                            setTimelinePost(p);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 9px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            background: "#f8fafc",
                            color: "#334155",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <History size={12} style={{ color: "#16a34a" }} /> View Timeline
                        </button>
                      </span>
                    )}
                    {modalAction.type === "approve_script" && "Approve Script → Move to Scheduled / Designing"}
                    {modalAction.type === "design_ready" && "Design Complete → Move to Team QA Review"}
                    {modalAction.type === "send_client" && "Team QA Passed → Move to Client Review"}
                    {modalAction.type === "client_changes" && "Client Revisions (Loopback to Stage 3: Designing)"}
                    {modalAction.type === "client_approve" && "Client Approved → Move to Approved / Post Schedule"}
                    {modalAction.type === "edit_notes" && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        Edit Post Details & Workflow Notes
                        <button
                          type="button"
                          onClick={() => {
                            const p = modalAction.post;
                            setModalAction(null);
                            setViewingWorkDetailsPost(p);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 10px",
                            borderRadius: 6,
                            border: "1px solid #c084fc",
                            background: "#faf5ff",
                            color: "#7e22ce",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <Palette size={12} /> View Work Details
                        </button>
                      </span>
                    )}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                    {modalAction.post.title || "Concept"} • {modalAction.post.client_name || "Adstra Client"}
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
                  {modalAction.post.primary_caption || modalAction.post.script_notes || "No draft caption available"}
                </div>
              </div>

              {/* Script Notes Input */}
              {(modalAction.type === "edit_notes" || modalAction.type === "reject_script") && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Script Hook, Outline & Copy Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editScriptNotes}
                    onChange={(e) => setEditScriptNotes(e.target.value)}
                    placeholder="Write or refine the hook, angle, or script bullets..."
                    style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", outline: "none" }}
                  />
                </div>
              )}

              {/* Designer Deliverable Upload, Replace & Play (For design_ready and edit_notes) */}
              {(modalAction.type === "design_ready" || modalAction.type === "edit_notes") && (
                <div style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#9d174d", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles size={14} /> Creative Deliverable (Reel / Video / Graphic)
                    </span>
                    {editMediaUrl && (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "2px 8px", borderRadius: 6 }}>
                        ✓ Deliverable Attached
                      </span>
                    )}
                  </div>

                  {editMediaUrl ? (
                    <div style={{ background: "#0f172a", borderRadius: 10, overflow: "hidden", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ maxHeight: 240, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {(editMediaUrl.toLowerCase().endsWith(".mp4") || editMediaUrl.toLowerCase().endsWith(".mov") || editMediaUrl.toLowerCase().endsWith(".webm") || modalAction.post.post_type === "reel" || modalAction.post.post_type === "video") ? (
                          <video src={editMediaUrl} controls playsInline style={{ maxHeight: 230, maxWidth: "100%", borderRadius: 6 }} />
                        ) : (
                          <img src={editMediaUrl} alt="" style={{ maxHeight: 230, maxWidth: "100%", objectFit: "contain", borderRadius: 6 }} />
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
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
                            style={{
                              padding: "5px 11px",
                              borderRadius: 6,
                              background: "#334155",
                              border: "1px solid rgba(255,255,255,0.2)",
                              color: "#fff",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <RotateCcw size={12} /> Replace File
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPreviewingMediaPost({ ...modalAction.post, media_urls: [editMediaUrl] });
                            }}
                            style={{
                              padding: "5px 11px",
                              borderRadius: 6,
                              background: "#ec4899",
                              border: "none",
                              color: "#fff",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Play size={11} fill="#fff" /> Full Player
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(editMediaUrl);
                              alert("Asset link copied to clipboard!");
                            }}
                            style={{
                              padding: "5px 9px",
                              borderRadius: 6,
                              background: "#334155",
                              border: "none",
                              color: "#cbd5e1",
                              fontSize: "0.74rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <Copy size={11} /> Copy Link
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditMediaUrl("")}
                          style={{
                            padding: "5px 9px",
                            borderRadius: 6,
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "none",
                            color: "#f87171",
                            fontSize: "0.72rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Trash2 size={11} /> Remove
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
                        style={{
                          border: "2px dashed #f472b6",
                          borderRadius: 10,
                          background: "#fff",
                          padding: "18px 14px",
                          textAlign: "center",
                          cursor: "pointer",
                          marginBottom: 8,
                        }}
                      >
                        <Upload size={22} style={{ color: "#db2777", margin: "0 auto 4px" }} />
                        <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#be185d" }}>
                          Click to Browse or Drag & Drop Finished Deliverable
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                          Supports Reel / Video (.mp4, .mov, .webm) or Graphic (.png, .jpg, .webp)
                        </div>
                      </div>

                      <input
                        type="text"
                        value={editMediaUrl}
                        onChange={(e) => setEditMediaUrl(e.target.value)}
                        placeholder="Or paste cloud asset link (Drive, Canva, Figma)..."
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.8rem", outline: "none" }}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#475569", marginBottom: 3 }}>
                      Designer / Editor Brief & Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editDesignerNotes}
                      onChange={(e) => setEditDesignerNotes(e.target.value)}
                      placeholder="e.g. 1080x1920 60s Reel rendered with captions and sound design. Ready for review."
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", outline: "none" }}
                    />
                  </div>
                </div>
              )}

              {/* Script Approval stage brief */}
              {modalAction.type === "approve_script" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Visual Creative URL (Image / Video URL)
                  </label>
                  <input
                    type="text"
                    value={editMediaUrl}
                    onChange={(e) => setEditMediaUrl(e.target.value)}
                    placeholder="https://... or media asset link"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", outline: "none", marginBottom: 10 }}
                  />

                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Designer / Editor Brief (Aspect ratio, branding notes, video cut directions)
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
                    {modalAction.type === "reject_script" && "Reason for Rejecting Script (Sent back to Copywriter) *"}
                    {modalAction.type === "reject_design" && "Reason for Rejecting Deliverable (Added to Timeline & Sent to Designer) *"}
                    {modalAction.type === "client_changes" && "Client Requested Changes / Revision Feedback *"}
                    {modalAction.type === "approve_script" && "Approval Remarks (Optional)"}
                    {modalAction.type === "design_ready" && "Design QA Hand-off Notes"}
                    {modalAction.type === "send_client" && "Instructions for Client"}
                    {modalAction.type === "client_approve" && "Final Sign-off Notes"}
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
                    <RotateCcw size={14} /> Loopback to Scripts
                  </button>
                )}

                {modalAction.type === "reject_design" && (
                  <button
                    disabled={submittingAction || !actionNotes.trim()}
                    onClick={() =>
                      handleTransition(
                        modalAction.post,
                        "designing",
                        "reject",
                        actionNotes,
                        { designer_notes: modalAction.post.designer_notes }
                      )
                    }
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
                    <RotateCcw size={14} /> Reject & Add to Timeline
                  </button>
                )}

                {modalAction.type === "approve_script" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={submittingAction}
                      onClick={() => handleTransition(modalAction.post, "script", "reject", actionNotes || "Script not better, rework hook", { script_notes: editScriptNotes })}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ef4444", color: "#dc2626", background: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Reject (↺ Scripts)
                    </button>
                    <button
                      disabled={submittingAction}
                      onClick={() => handleTransition(modalAction.post, "designing", "advance", actionNotes || "Script approved, ready for design", { designer_notes: editDesignerNotes, media_urls: editMediaUrl ? [editMediaUrl] : modalAction.post.media_urls })}
                      style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
                    >
                      Approve → Move to Designing
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
                    onClick={() => {
                      let formattedScheduledAt = null;
                      if (editScheduledAt && editScheduledAt.trim()) {
                        const d = new Date(editScheduledAt);
                        if (!isNaN(d.getTime())) {
                          formattedScheduledAt = d.toISOString();
                        }
                      }
                      handleTransition(
                        modalAction.post,
                        "approved",
                        "advance",
                        actionNotes || "Client approved design & copy",
                        { scheduled_at: formattedScheduledAt }
                      );
                    }}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#0ea5e9", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
                  >
                    {submittingAction ? "Approving..." : "Approve → Schedule Post"}
                  </button>
                )}

                {modalAction.type === "edit_notes" && (
                  <button
                    disabled={submittingAction}
                    onClick={() => {
                      let formattedScheduledAt = null;
                      if (editScheduledAt && editScheduledAt.trim()) {
                        const d = new Date(editScheduledAt);
                        if (!isNaN(d.getTime())) {
                          formattedScheduledAt = d.toISOString();
                        }
                      }
                      handleTransition(
                        modalAction.post,
                        modalAction.post.status,
                        "update",
                        "Updated workflow notes",
                        {
                          script_notes: editScriptNotes || "",
                          designer_notes: editDesignerNotes || "",
                          media_urls: editMediaUrl && editMediaUrl.trim() ? [editMediaUrl.trim()] : [],
                          scheduled_at: formattedScheduledAt,
                        }
                      );
                    }}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer" }}
                  >
                    {submittingAction ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SCRIPT CREATION / EDIT MODAL */}
      {scriptModalOpen && (
        <ScriptCreationModal
          isOpen={scriptModalOpen}
          onClose={() => {
            setScriptModalOpen(false);
            setActiveScriptPost(null);
          }}
          clients={clients}
          mediaAssets={mediaAssets}
          selectedClientId={selectedClientId}
          initialData={activeScriptPost}
          onSuccess={(savedStatus) => {
            if (onRefresh) onRefresh();
            if (savedStatus === "script_approval" && onNavigateStage) {
              onNavigateStage("script_approval");
            }
          }}
        />
      )}

      {/* 6. POST TIMELINE & LIFECYCLE STEPPER GRAPH MODAL */}
      {timelinePost && (
        <PostTimelineModal
          post={timelinePost}
          isOpen={Boolean(timelinePost)}
          onClose={() => setTimelinePost(null)}
          onRefresh={onRefresh}
        />
      )}

      {/* 7. SCRIPT READ-ONLY VIEW & REVIEW MODAL */}
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
            setActiveScriptPost(p);
            setScriptModalOpen(true);
          }}
          onOpenTimeline={(p) => setTimelinePost(p)}
        />
      )}

      {/* 8. DESIGNER WORK DETAILS MODAL */}
      {viewingWorkDetailsPost && (
        <WorkDetailsModal
          isOpen={Boolean(viewingWorkDetailsPost)}
          onClose={() => setViewingWorkDetailsPost(null)}
          post={viewingWorkDetailsPost}
          onSaveMedia={async (p, mediaUrl, notes) => {
            await handleTransition(
              p,
              p.status,
              "advance",
              "Designer updated creative media asset URL & production notes",
              {
                media_urls: mediaUrl ? [mediaUrl] : p.media_urls,
                designer_notes: notes !== undefined ? notes : p.designer_notes,
              }
            );
            setViewingWorkDetailsPost((prev) => ({
              ...prev,
              media_urls: mediaUrl ? [mediaUrl] : prev.media_urls,
              designer_notes: notes !== undefined ? notes : prev.designer_notes,
            }));
          }}
          onReadyForQA={async (p, mediaUrl, notes) => {
            await handleTransition(
              p,
              "team_review",
              "advance",
              "Design assets completed, submitted for QA review",
              {
                media_urls: mediaUrl ? [mediaUrl] : p.media_urls,
                designer_notes: notes !== undefined ? notes : p.designer_notes,
              }
            );
          }}
          onOpenTimeline={(p) => setTimelinePost(p)}
          onOpenEditModal={(p) => openActionModal(p, "edit_notes")}
        />
      )}

      {/* 9. MEDIA PLAY & PREVIEW MODAL */}
      {previewingMediaPost && (
        <MediaPreviewModal
          isOpen={Boolean(previewingMediaPost)}
          onClose={() => setPreviewingMediaPost(null)}
          post={previewingMediaPost}
          onRefresh={() => {
            onRefresh();
            const updated = posts.find((p) => p.id === previewingMediaPost.id);
            if (updated) setPreviewingMediaPost(updated);
          }}
          onReadyForQA={(p) => {
            handleTransition(p, "team_review", "advance", "Deliverable inspected and submitted for Team QA review");
          }}
        />
      )}

    </div>
  );
}

// Sub-Component: Stage Listing Table (Table / Listing Mode)
function StageListingTable({
  stagePosts = [],
  stageId,
  stageMeta,
  onTransition,
  onPublishNow,
  onCopyLink,
  copiedToken,
  onOpenModal,
  onNavigateStage,
  onOpenScriptModal,
  onOpenTimeline,
  onViewScript,
  onViewWorkDetails,
  onPreviewMedia,
  onUploadMedia,
}) {
  const [openOptionsPostId, setOpenOptionsPostId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);

  useEffect(() => {
    if (!openOptionsPostId) return;
    const handleClose = () => {
      setOpenOptionsPostId(null);
      setDropdownPos(null);
    };
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [openOptionsPostId]);

  const toggleOptions = (e, postId) => {
    e.stopPropagation();
    if (openOptionsPostId === postId) {
      setOpenOptionsPostId(null);
      setDropdownPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < menuHeight && rect.top > menuHeight;
      setDropdownPos({
        top: openUp ? undefined : rect.bottom + 5,
        bottom: openUp ? window.innerHeight - rect.top + 5 : undefined,
        right: Math.max(16, window.innerWidth - rect.right),
      });
      setOpenOptionsPostId(postId);
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 880, borderCollapse: "collapse", textAlign: "left", fontSize: "0.84rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 230 }}>
                Post & Content
              </th>
              <th style={{ padding: "14px 12px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 140, whiteSpace: "nowrap" }}>
                Client
              </th>
              <th style={{ padding: "14px 12px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 80, whiteSpace: "nowrap" }}>
                Format
              </th>
              <th style={{ padding: "14px 12px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 160, whiteSpace: "nowrap" }}>
                Platforms
              </th>
              <th style={{ padding: "14px 12px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 120, whiteSpace: "nowrap" }}>
                {stageId === "published" ? "Published At" : stageId === "post_schedule" ? "Scheduled At" : "Timing"}
              </th>
              <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 360, textAlign: "right", whiteSpace: "nowrap" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {stagePosts.map((post) => {
              const isRejected = Boolean(post.client_feedback);
              const StageIcon = stageMeta.icon;

              return (
                <tr
                  key={post.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* 1. Post & Content */}
                  <td style={{ padding: "14px 20px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Thumbnail or Stage Icon */}
                      {post.media_urls?.[0] ? (
                        <div
                          onClick={() => onPreviewMedia && onPreviewMedia(post)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            overflow: "hidden",
                            border: "1px solid #cbd5e1",
                            flexShrink: 0,
                            position: "relative",
                            cursor: "pointer",
                            background: "#0f172a",
                          }}
                          title="Click to play / view deliverable"
                        >
                          {post.post_type === "reel" ||
                          post.post_type === "video" ||
                          (typeof post.media_urls[0] === "string" &&
                            (post.media_urls[0].toLowerCase().endsWith(".mp4") ||
                              post.media_urls[0].toLowerCase().endsWith(".webm") ||
                              post.media_urls[0].toLowerCase().endsWith(".mov"))) ? (
                            <>
                              <video
                                src={post.media_urls[0]}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "rgba(0, 0, 0, 0.4)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Play size={15} fill="#ffffff" color="#ffffff" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={post.media_urls[0]}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            background: stageMeta.bgLight,
                            color: stageMeta.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <StageIcon size={20} />
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          onClick={() => {
                            if (stageId === "script_approval" && onViewScript) {
                              onViewScript(post);
                            } else if (stageId === "scripts" && onOpenScriptModal) {
                              onOpenScriptModal(post);
                            } else if (onViewWorkDetails) {
                              onViewWorkDetails(post);
                            } else {
                              onOpenModal(post, "edit_notes");
                            }
                          }}
                          style={{
                            fontWeight: 800,
                            fontSize: "0.88rem",
                            color: "#0f172a",
                            cursor: "pointer",
                            marginBottom: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span>{post.title || "Untitled Post"}</span>
                          {stageId === "scripts" ? (
                            post.status === "script_approval" ? (
                              <span
                                style={{
                                  background: "#f5f3ff",
                                  color: "#7c3aed",
                                  border: "1px solid #ddd6fe",
                                  fontSize: "0.68rem",
                                  padding: "2px 7px",
                                  borderRadius: 8,
                                  fontWeight: 800,
                                }}
                              >
                                ● Under Approval
                              </span>
                            ) : isRejected ? (
                              <span
                                style={{
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  fontSize: "0.68rem",
                                  padding: "2px 7px",
                                  borderRadius: 8,
                                  fontWeight: 800,
                                }}
                              >
                                ● Needs Revision
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.68rem",
                                  padding: "2px 7px",
                                  borderRadius: 8,
                                  fontWeight: 700,
                                }}
                              >
                                ● Draft
                              </span>
                            )
                          ) : isRejected ? (
                            <span
                              style={{
                                background: "#fef2f2",
                                color: "#dc2626",
                                border: "1px solid #fecaca",
                                fontSize: "0.68rem",
                                padding: "2px 7px",
                                borderRadius: 8,
                                fontWeight: 800,
                              }}
                            >
                              ● Needs Revision (↺ Rejected)
                            </span>
                          ) : null}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "#64748b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 480,
                          }}
                        >
                          {post.primary_caption || post.script_notes || "No draft caption"}
                        </div>

                        {/* Revision feedback tag if looped back */}
                        {isRejected && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenTimeline) onOpenTimeline(post);
                            }}
                            title="Click to view full revision history & audit timeline"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              background: "#fef2f2",
                              color: "#991b1b",
                              border: "1px solid #fecaca",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              marginTop: 4,
                              maxWidth: 520,
                              cursor: "pointer",
                            }}
                          >
                            <AlertTriangle size={13} style={{ flexShrink: 0, color: "#dc2626" }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              <strong>Rejection Reason:</strong> {post.client_feedback}
                            </span>
                            <span style={{ fontSize: "0.68rem", color: "#dc2626", marginLeft: 4, textDecoration: "underline" }}>
                              (View Timeline)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Client */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        color: post.client_primary_color || "#4338ca",
                        background: "#f1f5f9",
                        padding: "4px 9px",
                        borderRadius: 6,
                        display: "inline-block",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {post.client_name || "Adstra Client"}
                    </span>
                  </td>

                  {/* 3. Format */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#475569",
                        background: "#f8fafc",
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {post.post_type}
                    </span>
                  </td>

                  {/* 4. Platforms */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "nowrap" }}>
                      {(post.platforms || ["instagram"]).map((plat) => (
                        <span
                          key={plat}
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#334155",
                            background: "#f1f5f9",
                            padding: "2px 7px",
                            borderRadius: 4,
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {plat}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* 5. Timing / Schedule */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    {post.scheduled_at ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", fontWeight: 700, color: "#0284c7", whiteSpace: "nowrap" }}>
                        <Clock size={13} />
                        {new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    ) : post.published_at ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", fontWeight: 700, color: "#10b981", whiteSpace: "nowrap" }}>
                        <CheckCircle2 size={13} />
                        {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.76rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {new Date(post.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </td>

                  {/* 6. Actions */}
                  <td style={{ padding: "12px 16px", verticalAlign: "middle", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 5, flexWrap: "nowrap" }}>
                      {/* Timeline Graph Button for Every Post */}
                      <button
                        onClick={() => onOpenTimeline && onOpenTimeline(post)}
                        title="View post lifecycle timeline & audit history"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 9px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          background: "#f8fafc",
                          color: "#334155",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <History size={12} style={{ color: "#16a34a" }} />
                        Timeline
                      </button>

                      {/* Stage 1: Scripts */}
                      {stageId === "scripts" && (
                        <>
                          <button
                            onClick={() => (onOpenScriptModal ? onOpenScriptModal(post) : onOpenModal(post, "edit_notes"))}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Edit Script
                          </button>
                          {post.status === "script_approval" ? (
                            <button
                              onClick={() => (onNavigateStage ? onNavigateStage("script_approval") : null)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "1px solid #c4b5fd",
                                background: "#f5f3ff",
                                color: "#7c3aed",
                                fontSize: "0.76rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              View in Approval →
                            </button>
                          ) : isRejected ? (
                            <button
                              onClick={() => (onOpenScriptModal ? onOpenScriptModal(post) : onOpenModal(post, "edit_notes"))}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                border: "none",
                                background: "#ea580c",
                                color: "#fff",
                                fontSize: "0.76rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <RotateCcw size={12} /> Rework Script →
                            </button>
                          ) : (
                            <button
                              onClick={() => onTransition(post, "script_approval", "advance", "Submitted script for internal review")}
                              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              Submit →
                            </button>
                          )}
                        </>
                      )}

                      {/* Stage 2: Script Approval */}
                      {stageId === "script_approval" && (
                        <>
                          <button
                            onClick={() => (onViewScript ? onViewScript(post) : onOpenScriptModal ? onOpenScriptModal(post) : onOpenModal(post, "edit_notes"))}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            View Script
                          </button>
                          <button
                            onClick={() => onOpenModal(post, "reject_script")}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ef4444", background: "#fff", color: "#dc2626", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Reject (↺)
                          </button>
                          <button
                            onClick={() => onTransition(post, "designing", "advance", "Script approved, ready for design")}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Approve → Design
                          </button>
                        </>
                      )}

                      {/* Stage 3: Designing */}
                      {stageId === "designing" && (
                        <>
                          {/* Play / View Deliverable Option */}
                          {post.media_urls?.[0] ? (
                            <>
                              <button
                                onClick={() => onPreviewMedia && onPreviewMedia(post)}
                                title="Play video reel or view full creative deliverable"
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: "#ec4899",
                                  color: "#fff",
                                  fontSize: "0.74rem",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  boxShadow: "0 2px 6px rgba(236, 72, 153, 0.25)",
                                }}
                              >
                                <Play size={11} fill="#ffffff" />
                                {post.post_type === "reel" || post.post_type === "video" ? "Play Reel" : "View Media"}
                              </button>

                              <button
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif";
                                  input.onchange = (e) => {
                                    const file = e.target.files?.[0];
                                    if (file && onUploadMedia) onUploadMedia(post, file, true);
                                  };
                                  input.click();
                                }}
                                title="Replace current deliverable with a revised version"
                                style={{
                                  padding: "5px 9px",
                                  borderRadius: 8,
                                  border: "1px solid #cbd5e1",
                                  background: "#ffffff",
                                  color: "#475569",
                                  fontSize: "0.74rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <RotateCcw size={11} /> Replace
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif";
                                input.onchange = (e) => {
                                  const file = e.target.files?.[0];
                                  if (file && onUploadMedia) onUploadMedia(post, file, true);
                                };
                                input.click();
                              }}
                              title="Upload completed creative deliverable (Video/Reel or Graphic)"
                              style={{
                                padding: "5px 11px",
                                borderRadius: 8,
                                border: "1px dashed #16a34a",
                                background: "#f0fdf4",
                                color: "#15803d",
                                fontSize: "0.74rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Upload size={12} /> Upload Work
                            </button>
                          )}

                          {/* Options Dropdown for Stage 3 */}
                          <div style={{ display: "inline-block" }}>
                            <button
                              type="button"
                              onClick={(e) => toggleOptions(e, post.id)}
                              title="Show options"
                              style={{
                                padding: "5px 8px",
                                borderRadius: 8,
                                border: "1px solid #cbd5e1",
                                background: openOptionsPostId === post.id ? "#f1f5f9" : "#ffffff",
                                color: "#475569",
                                fontSize: "0.74rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <span>Options</span>
                              <ChevronDown size={11} />
                            </button>

                            {openOptionsPostId === post.id && dropdownPos && (
                              <>
                                <div
                                  style={{ position: "fixed", inset: 0, zIndex: 99998 }}
                                  onClick={() => {
                                    setOpenOptionsPostId(null);
                                    setDropdownPos(null);
                                  }}
                                />
                                <div
                                  style={{
                                    position: "fixed",
                                    top: dropdownPos.top,
                                    bottom: dropdownPos.bottom,
                                    right: dropdownPos.right,
                                    zIndex: 99999,
                                    background: "#ffffff",
                                    borderRadius: 10,
                                    border: "1px solid #cbd5e1",
                                    boxShadow: "0 12px 30px -4px rgba(15, 23, 42, 0.22), 0 6px 14px -4px rgba(15, 23, 42, 0.12)",
                                    padding: "6px",
                                    minWidth: 195,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    textAlign: "left",
                                  }}
                                >
                                  {post.media_urls?.[0] && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenOptionsPostId(null);
                                        setDropdownPos(null);
                                        onPreviewMedia && onPreviewMedia(post);
                                      }}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "7px 10px",
                                        borderRadius: 6,
                                        border: "none",
                                        background: "transparent",
                                        color: "#0f172a",
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        width: "100%",
                                        textAlign: "left",
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                      <Play size={13} style={{ color: "#ec4899" }} fill="#ec4899" />
                                      <span>Play in Full Player</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenOptionsPostId(null);
                                      setDropdownPos(null);
                                      const input = document.createElement("input");
                                      input.type = "file";
                                      input.accept = "video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif";
                                      input.onchange = (e) => {
                                        const file = e.target.files?.[0];
                                        if (file && onUploadMedia) onUploadMedia(post, file, true);
                                      };
                                      input.click();
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "7px 10px",
                                      borderRadius: 6,
                                      border: "none",
                                      background: "transparent",
                                      color: "#0f172a",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      width: "100%",
                                      textAlign: "left",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <RotateCcw size={13} style={{ color: "#2563eb" }} />
                                    <span>{post.media_urls?.[0] ? "Replace Deliverable" : "Upload Deliverable"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenOptionsPostId(null);
                                      setDropdownPos(null);
                                      if (onViewWorkDetails) onViewWorkDetails(post);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "7px 10px",
                                      borderRadius: 6,
                                      border: "none",
                                      background: "transparent",
                                      color: "#0f172a",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      width: "100%",
                                      textAlign: "left",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <Palette size={13} style={{ color: "#9333ea" }} />
                                    <span>Work Details & Brief</span>
                                  </button>

                                  {post.media_urls?.[0] && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenOptionsPostId(null);
                                          setDropdownPos(null);
                                          navigator.clipboard.writeText(post.media_urls[0]);
                                          alert("Media link copied to clipboard!");
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                          padding: "7px 10px",
                                          borderRadius: 6,
                                          border: "none",
                                          background: "transparent",
                                          color: "#0f172a",
                                          fontSize: "0.78rem",
                                          fontWeight: 600,
                                          cursor: "pointer",
                                          width: "100%",
                                          textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                      >
                                        <Copy size={13} style={{ color: "#059669" }} />
                                        <span>Copy Asset Link</span>
                                      </button>

                                      <a
                                        href={post.media_urls[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        onClick={() => {
                                          setOpenOptionsPostId(null);
                                          setDropdownPos(null);
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                          padding: "7px 10px",
                                          borderRadius: 6,
                                          color: "#0f172a",
                                          fontSize: "0.78rem",
                                          fontWeight: 600,
                                          textDecoration: "none",
                                          cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                      >
                                        <Download size={13} style={{ color: "#475569" }} />
                                        <span>Download Deliverable</span>
                                      </a>

                                      <div style={{ height: 1, background: "#f1f5f9", margin: "3px 0" }} />

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenOptionsPostId(null);
                                          setDropdownPos(null);
                                          if (confirm("Remove deliverable media from this post?")) {
                                            onTransition(post, post.status, "advance", "Removed media deliverable", { media_urls: [] });
                                          }
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                          padding: "7px 10px",
                                          borderRadius: 6,
                                          border: "none",
                                          background: "transparent",
                                          color: "#dc2626",
                                          fontSize: "0.78rem",
                                          fontWeight: 600,
                                          cursor: "pointer",
                                          width: "100%",
                                          textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                      >
                                        <Trash2 size={13} style={{ color: "#dc2626" }} />
                                        <span>Remove Deliverable</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() => (onViewWorkDetails ? onViewWorkDetails(post) : onOpenModal(post, "edit_notes"))}
                            title="View creative brief, storyboard, brand assets & work instructions in popup"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: "1px solid #c084fc",
                              background: "#faf5ff",
                              color: "#7e22ce",
                              fontSize: "0.74rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Palette size={12} style={{ color: "#9333ea" }} />
                            Work Details
                          </button>

                          <button
                            onClick={() => onOpenModal(post, "design_ready")}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 8,
                              border: "none",
                              background: "#ec4899",
                              color: "#fff",
                              fontSize: "0.74rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Ready for QA →
                          </button>
                        </>
                      )}

                      {/* Stage 4: Team Review */}
                      {stageId === "team_review" && (
                        <>
                          {post.media_urls?.[0] && (
                            <button
                              onClick={() => onPreviewMedia && onPreviewMedia(post)}
                              title="Play video reel or view creative deliverable"
                              style={{
                                padding: "5px 10px",
                                borderRadius: 8,
                                border: "none",
                                background: "#ec4899",
                                color: "#fff",
                                fontSize: "0.74rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Play size={11} fill="#ffffff" />
                              {post.post_type === "reel" || post.post_type === "video" ? "Play" : "View"}
                            </button>
                          )}

                          {/* Options Dropdown for Stage 4 */}
                          <div style={{ display: "inline-block" }}>
                            <button
                              type="button"
                              onClick={(e) => toggleOptions(e, post.id)}
                              title="Show options"
                              style={{
                                padding: "5px 8px",
                                borderRadius: 8,
                                border: "1px solid #cbd5e1",
                                background: openOptionsPostId === post.id ? "#f1f5f9" : "#ffffff",
                                color: "#475569",
                                fontSize: "0.74rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <span>Options</span>
                              <ChevronDown size={11} />
                            </button>

                            {openOptionsPostId === post.id && dropdownPos && (
                              <>
                                <div
                                  style={{ position: "fixed", inset: 0, zIndex: 99998 }}
                                  onClick={() => {
                                    setOpenOptionsPostId(null);
                                    setDropdownPos(null);
                                  }}
                                />
                                <div
                                  style={{
                                    position: "fixed",
                                    top: dropdownPos.top,
                                    bottom: dropdownPos.bottom,
                                    right: dropdownPos.right,
                                    zIndex: 99999,
                                    background: "#ffffff",
                                    borderRadius: 10,
                                    border: "1px solid #cbd5e1",
                                    boxShadow: "0 12px 30px -4px rgba(15, 23, 42, 0.22), 0 6px 14px -4px rgba(15, 23, 42, 0.12)",
                                    padding: "6px",
                                    minWidth: 195,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    textAlign: "left",
                                  }}
                                >
                                  {post.media_urls?.[0] && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenOptionsPostId(null);
                                        setDropdownPos(null);
                                        onPreviewMedia && onPreviewMedia(post);
                                      }}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "7px 10px",
                                        borderRadius: 6,
                                        border: "none",
                                        background: "transparent",
                                        color: "#0f172a",
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        width: "100%",
                                        textAlign: "left",
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                      <Play size={13} style={{ color: "#ec4899" }} fill="#ec4899" />
                                      <span>Play / Full Preview</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenOptionsPostId(null);
                                      setDropdownPos(null);
                                      const input = document.createElement("input");
                                      input.type = "file";
                                      input.accept = "video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif";
                                      input.onchange = (e) => {
                                        const file = e.target.files?.[0];
                                        if (file && onUploadMedia) onUploadMedia(post, file, true);
                                      };
                                      input.click();
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "7px 10px",
                                      borderRadius: 6,
                                      border: "none",
                                      background: "transparent",
                                      color: "#0f172a",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      width: "100%",
                                      textAlign: "left",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <RotateCcw size={13} style={{ color: "#2563eb" }} />
                                    <span>Replace Deliverable</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenOptionsPostId(null);
                                      setDropdownPos(null);
                                      if (onViewWorkDetails) onViewWorkDetails(post);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "7px 10px",
                                      borderRadius: 6,
                                      border: "none",
                                      background: "transparent",
                                      color: "#0f172a",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      width: "100%",
                                      textAlign: "left",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <Palette size={13} style={{ color: "#9333ea" }} />
                                    <span>Work Details & Brief</span>
                                  </button>

                                  {post.media_urls?.[0] && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenOptionsPostId(null);
                                          setDropdownPos(null);
                                          navigator.clipboard.writeText(post.media_urls[0]);
                                          alert("Media link copied to clipboard!");
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                          padding: "7px 10px",
                                          borderRadius: 6,
                                          border: "none",
                                          background: "transparent",
                                          color: "#0f172a",
                                          fontSize: "0.78rem",
                                          fontWeight: 600,
                                          cursor: "pointer",
                                          width: "100%",
                                          textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                      >
                                        <Copy size={13} style={{ color: "#059669" }} />
                                        <span>Copy Asset Link</span>
                                      </button>

                                      <a
                                        href={post.media_urls[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        onClick={() => {
                                          setOpenOptionsPostId(null);
                                          setDropdownPos(null);
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                          padding: "7px 10px",
                                          borderRadius: 6,
                                          color: "#0f172a",
                                          fontSize: "0.78rem",
                                          fontWeight: 600,
                                          textDecoration: "none",
                                          cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                      >
                                        <Download size={13} style={{ color: "#475569" }} />
                                        <span>Download Deliverable</span>
                                      </a>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() => (onViewWorkDetails ? onViewWorkDetails(post) : onOpenModal(post, "edit_notes"))}
                            title="View designer work details & brief"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: "1px solid #cbd5e1",
                              background: "#fff",
                              color: "#475569",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Palette size={12} style={{ color: "#7c3aed" }} />
                            Work Details
                          </button>
                          <button
                            onClick={() => onOpenModal(post, "reject_design")}
                            title="Reject deliverable and send back to Designing with revision notes"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: "1px solid #ef4444",
                              background: "#fff",
                              color: "#dc2626",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <RotateCcw size={11} /> Reject
                          </button>
                          <button
                            onClick={() => onTransition(post, "client_review", "advance", "Team QA passed, sent to client review")}
                            style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontSize: "0.74rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            QA Pass → Client
                          </button>
                        </>
                      )}

                      {/* Stage 5: Client Review */}
                      {stageId === "client_review" && (
                        <>
                          <button
                            onClick={() => onCopyLink(post.client_approval_token)}
                            title="Copy Client Review Link"
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
                          >
                            {copiedToken === post.client_approval_token ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                            Link
                          </button>
                          <button
                            onClick={() => onOpenModal(post, "client_changes")}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ea580c", background: "#fff", color: "#ea580c", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            ↺ Revisions
                          </button>
                          <button
                            onClick={() => onTransition(post, "approved", "advance", "Client approved design & copy")}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#ea580c", color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Approved →
                          </button>
                        </>
                      )}

                      {/* Stage 6: Post Schedule */}
                      {stageId === "post_schedule" && (
                        <>
                          <button
                            onClick={() => onOpenModal(post, "edit_notes")}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => onPublishNow(post)}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#0ea5e9", color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <Send size={12} /> Publish Now
                          </button>
                        </>
                      )}

                      {/* Stage 7: Published */}
                      {stageId === "published" && (
                        <>
                          <span style={{ color: "#10b981", fontWeight: 800, fontSize: "0.76rem", display: "inline-flex", alignItems: "center", gap: 4, marginRight: 4 }}>
                            <CheckCircle2 size={14} /> Live
                          </span>
                          <button
                            onClick={() => onOpenModal(post, "edit_notes")}
                            style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Details
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
