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
} from "lucide-react";
import ContentCalendarTab from "./ContentCalendarTab";
import ScriptCreationModal from "./ScriptCreationModal";

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
  const [viewMode, setViewMode] = useState("listing"); // 'listing' | 'calendar'
  const [copiedToken, setCopiedToken] = useState(null);

  // Script Creation Modal State (Stage 1: Scripts)
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [activeScriptPost, setActiveScriptPost] = useState(null);

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
  }, [posts, stageMeta, stageId, selectedClientId, formatFilter, searchQuery]);

  // Transition Handler
  const handleTransition = async (post, targetStage, actionType, notes = "", extraData = {}) => {
    setSubmittingAction(true);
    try {
      await axios.post(`${API_BASE_URL}/social/posts/${post.id}/transition_stage/`, {
        target_stage: targetStage,
        action_type: actionType,
        notes: notes || actionNotes,
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

          <button
            onClick={() => {
              if (stageId === "scripts") {
                setActiveScriptPost(null);
                setScriptModalOpen(true);
              } else {
                onOpenCreatePost();
              }
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
            {stageId === "scripts" ? "+ New Script" : "+ Create Post"}
          </button>
        </div>
      </div>

      {/* If Calendar Mode: Show Full Calendar Grid */}
      {viewMode === "calendar" ? (
        <ContentCalendarTab
          posts={posts}
          clients={clients}
          selectedClientId={selectedClientId}
          onRefresh={onRefresh}
          onOpenCreatePost={onOpenCreatePost}
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
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    {modalAction.type === "reject_script" && "Reject Script (Loopback to Stage 1: Scripts)"}
                    {modalAction.type === "approve_script" && "Approve Script → Move to Scheduled / Designing"}
                    {modalAction.type === "design_ready" && "Design Complete → Move to Team QA Review"}
                    {modalAction.type === "send_client" && "Team QA Passed → Move to Client Review"}
                    {modalAction.type === "client_changes" && "Client Revisions (Loopback to Stage 3: Designing)"}
                    {modalAction.type === "client_approve" && "Client Approved → Move to Approved / Post Schedule"}
                    {modalAction.type === "edit_notes" && "Edit Post Details & Workflow Notes"}
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
          onSuccess={onRefresh}
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
  onOpenScriptModal,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.84rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 280 }}>
                Post & Content
              </th>
              <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 140 }}>
                Client
              </th>
              <th style={{ padding: "14px 12px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 90 }}>
                Format
              </th>
              <th style={{ padding: "14px 14px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 130 }}>
                Platforms
              </th>
              <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 160 }}>
                {stageId === "published" ? "Published At" : stageId === "post_schedule" ? "Scheduled At" : "Timing"}
              </th>
              <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 170 }}>
                Workflow Notes
              </th>
              <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 220, textAlign: "right" }}>
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
                  <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Thumbnail or Stage Icon */}
                      {post.media_urls?.[0] ? (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={post.media_urls[0]}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
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
                            if ((stageId === "scripts" || stageId === "script_approval") && onOpenScriptModal) {
                              onOpenScriptModal(post);
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
                          }}
                        >
                          {post.title || "Untitled Post"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "#64748b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 320,
                          }}
                        >
                          {post.primary_caption || post.script_notes || "No draft caption"}
                        </div>

                        {/* Revision feedback tag if looped back */}
                        {isRejected && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: "#fef2f2",
                              color: "#b91c1c",
                              padding: "2px 7px",
                              borderRadius: 4,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              marginTop: 4,
                              maxWidth: 320,
                            }}
                          >
                            <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {post.client_feedback}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Client */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
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
                  <td style={{ padding: "14px 12px", verticalAlign: "middle" }}>
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
                  <td style={{ padding: "14px 14px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(post.platforms || ["instagram"]).map((plat) => (
                        <span
                          key={plat}
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#334155",
                            background: "#f1f5f9",
                            padding: "2px 6px",
                            borderRadius: 4,
                            textTransform: "capitalize",
                          }}
                        >
                          {plat}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* 5. Timing / Schedule */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
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

                  {/* 6. Workflow Notes */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                    {post.script_notes ? (
                      <div style={{ fontSize: "0.76rem", color: "#334155", lineHeight: 1.4 }}>
                        <strong style={{ color: "#4f46e5" }}>Hook:</strong> {post.script_notes}
                      </div>
                    ) : post.designer_notes ? (
                      <div style={{ fontSize: "0.76rem", color: "#db2777", lineHeight: 1.4 }}>
                        <strong style={{ color: "#ec4899" }}>Design:</strong> {post.designer_notes}
                      </div>
                    ) : (
                      <span style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>—</span>
                    )}
                  </td>

                  {/* 7. Actions */}
                  <td style={{ padding: "14px 18px", verticalAlign: "middle", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                      {/* Stage 1: Scripts */}
                      {stageId === "scripts" && (
                        <>
                          <button
                            onClick={() => (onOpenScriptModal ? onOpenScriptModal(post) : onOpenModal(post, "edit_notes"))}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Edit Script
                          </button>
                          <button
                            onClick={() => onTransition(post, "script_approval", "advance", "Submitted script for internal review")}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Submit →
                          </button>
                        </>
                      )}

                      {/* Stage 2: Script Approval */}
                      {stageId === "script_approval" && (
                        <>
                          <button
                            onClick={() => (onOpenScriptModal ? onOpenScriptModal(post) : onOpenModal(post, "edit_notes"))}
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
                            onClick={() => onOpenModal(post, "approve_script")}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#8b5cf6", color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Approve → Design
                          </button>
                        </>
                      )}

                      {/* Stage 3: Designing */}
                      {stageId === "designing" && (
                        <>
                          <button
                            onClick={() => onOpenModal(post, "edit_notes")}
                            style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            + Media / Brief
                          </button>
                          <button
                            onClick={() => onOpenModal(post, "design_ready")}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#ec4899", color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Ready for QA →
                          </button>
                        </>
                      )}

                      {/* Stage 4: Team Review */}
                      {stageId === "team_review" && (
                        <>
                          <button
                            onClick={() => onTransition(post, "designing", "reject", "Team QA requested design adjustments")}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #f97316", background: "#fff", color: "#ea580c", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            ↺ Back
                          </button>
                          <button
                            onClick={() => onOpenModal(post, "send_client")}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
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
                            onClick={() => onOpenModal(post, "client_approve")}
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
