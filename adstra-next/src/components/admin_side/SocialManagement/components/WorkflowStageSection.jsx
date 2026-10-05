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
  Share2,
  Link,
  BarChart2,
  Archive,
  Ban,
  Undo2,
} from "lucide-react";
import ContentCalendarTab from "./ContentCalendarTab";
import ScriptCreationModal from "./ScriptCreationModal";
import ScriptViewModal from "./ScriptViewModal";
import PostTimelineModal from "./PostTimelineModal";
import MistakeInsightsPanel from "./MistakeInsightsPanel";
import WorkDetailsModal from "./WorkDetailsModal";
import MediaPreviewModal from "./MediaPreviewModal";
import { toast, confirmDialog, apiErrorMessage } from "./SocialFeedback";
import {
  RevisionRequestModal,
  RejectContentModal,
  ApproveScheduleModal,
  STAGE_LABELS,
} from "./WorkflowDecisionModals";

/* ─── New vs Redo work highlighting (production & review stages) ─── */
const WORK_KIND_STAGES = ["designing", "team_review", "client_review"];

const WORK_KIND_STYLE = {
  redo: { color: "#c2410c", bg: "#fff7ed", border: "#fdba74", rowBg: "#fffaf5", bar: "#f97316" },
  revised: { color: "#6d28d9", bg: "#f5f3ff", border: "#c4b5fd", rowBg: "#fdfcff", bar: "#8b5cf6" },
  new: { color: "#047857", bg: "#ecfdf5", border: "#a7f3d0", rowBg: null, bar: null },
};

const WORK_FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "redo", label: "Redo" },
  { id: "revised", label: "Revised" },
];

const mediaNoun = (post) =>
  post.post_type === "reel" || post.post_type === "video"
    ? "Video"
    : post.post_type === "carousel"
    ? "Carousel"
    : post.post_type === "text"
    ? "Post"
    : "Design";

/* ─── Scripts library: every post's script, bucketed by where it is now ─── */
const SCRIPT_FILTERS = [
  { id: "active", label: "Active", color: "#4f46e5" },
  { id: "draft", label: "Drafts", color: "#4f46e5" },
  { id: "under_review", label: "Under Approval", color: "#7c3aed" },
  { id: "revision", label: "Needs Revision", color: "#dc2626" },
  { id: "production", label: "Approved / In Production", color: "#0284c7" },
  { id: "published", label: "Published", color: "#059669" },
  { id: "rejected", label: "Rejected", color: "#991b1b" },
  { id: "all", label: "All Scripts", color: "#0f172a" },
];

const SCRIPT_BUCKET_BADGE = {
  draft: { label: "Draft", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
  under_review: { label: "Under Approval", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  revision: { label: "Needs Revision", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  production: { label: "Approved · In Production", color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  published: { label: "Published", color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
  rejected: { label: "Rejected", color: "#991b1b", bg: "#fef2f2", border: "#fca5a5" },
};

// Where a post's script currently sits
export function getScriptBucket(post) {
  switch (post.status) {
    case "script":
    case "draft":
      return post.client_feedback ? "revision" : "draft";
    case "script_approval":
      return "under_review";
    case "rejected":
      return post.client_feedback?.toLowerCase().includes("script") ? "revision" : "production";
    case "published":
    case "archived":
      return "published";
    case "content_rejected":
      return "rejected";
    default:
      return "production";
  }
}

const scriptMatchesFilter = (bucket, filter) =>
  filter === "all" || (filter === "active" ? bucket === "draft" || bucket === "revision" : bucket === filter);

const SCRIPT_EDITABLE_BUCKETS = ["draft", "revision", "under_review"];

// Workflow tab that currently owns a post (for "Open in …" jumps)
const STATUS_TO_STAGE = {
  script: "scripts",
  draft: "scripts",
  script_approval: "script_approval",
  designing: "designing",
  rejected: "designing",
  team_review: "team_review",
  internal_review: "team_review",
  client_review: "client_review",
  approved: "post_schedule",
  scheduled: "post_schedule",
  published: "published",
  archived: "published",
  content_rejected: "rejected",
};

// redo    = sent back with feedback and not yet resubmitted
// revised = reworked and resubmitted at least once
// new     = first version, never sent back
export function getWorkKind(post) {
  const rounds = post.revision_count || 0;
  if (post.client_feedback || post.status === "rejected") return { kind: "redo", rounds };
  if (rounds > 0) return { kind: "revised", rounds };
  return { kind: "new", rounds: 0 };
}

function WorkKindBadge({ post }) {
  const wk = getWorkKind(post);
  const s = WORK_KIND_STYLE[wk.kind];
  const noun = mediaNoun(post);
  const label =
    wk.kind === "redo"
      ? `Redo ${noun}${wk.rounds ? ` · Round ${wk.rounds}` : ""}`
      : wk.kind === "revised"
      ? `Revised ${noun} · Round ${wk.rounds}`
      : `New ${noun}`;
  const Icon = wk.kind === "new" ? Sparkles : RotateCcw;
  return (
    <span
      title={wk.rounds ? `${wk.rounds} revision round(s), ${post.client_revision_count || 0} requested by client` : "First version — never sent back"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: "0.68rem",
        padding: "2px 8px",
        borderRadius: 8,
        fontWeight: 800,
        textTransform: wk.kind === "redo" ? "uppercase" : "none",
        letterSpacing: wk.kind === "redo" ? "0.03em" : 0,
      }}
    >
      <Icon size={11} /> {label}
    </span>
  );
}

export default function WorkflowStageSection({
  stageId,
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
  const [scriptSubFilter, setScriptSubFilter] = useState("active");
  const [viewMode, setViewMode] = useState("listing");
  const [copiedToken, setCopiedToken] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [mistakeHints, setMistakeHints] = useState({});
  const [workFilter, setWorkFilter] = useState("all");
  const showWorkKind = WORK_KIND_STAGES.includes(stageId);

  useEffect(() => {
    setWorkFilter("all");
  }, [stageId]);

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
  const [editLiveUrls, setEditLiveUrls] = useState({});
  const [editAnalytics, setEditAnalytics] = useState({});
  const [activeModalTab, setActiveModalTab] = useState('copy');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Row-level upload progress: { postId, pct }
  const [uploadState, setUploadState] = useState(null);

  // Decision modals: { kind: 'revision' | 'reject' | 'approve' | 'reschedule', post, mode }
  const [decision, setDecision] = useState(null);

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
      case "rejected":
        return {
          title: "Rejected / Dropped Content",
          shortTitle: "Rejected",
          desc: "Scripts, designs or videos turned down entirely by the client or internal team, with the reason for each.",
          color: "#dc2626",
          bgLight: "#fef2f2",
          icon: Ban,
          statuses: ["content_rejected"],
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

  // Client / format / search filters shared by the list and the script pill counts
  const commonFilteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((p) => {
      if (selectedClientId !== "all" && String(p.client_profile) !== String(selectedClientId)) return false;
      if (formatFilter !== "all" && p.post_type !== formatFilter) return false;
      if (q) {
        const titleMatch = (p.title || "").toLowerCase().includes(q);
        const captionMatch = (p.primary_caption || "").toLowerCase().includes(q);
        const hookMatch = (p.script_notes || "").toLowerCase().includes(q);
        const clientMatch = (p.client_name || "").toLowerCase().includes(q);
        if (!titleMatch && !captionMatch && !hookMatch && !clientMatch) return false;
      }
      return true;
    });
  }, [posts, selectedClientId, formatFilter, searchQuery]);

  // Sub-counts for Stage 1 Scripts filter pills
  const scriptSubCounts = useMemo(() => {
    const counts = Object.fromEntries(SCRIPT_FILTERS.map((f) => [f.id, 0]));
    if (stageId !== "scripts") return counts;
    commonFilteredPosts.forEach((p) => {
      const bucket = getScriptBucket(p);
      SCRIPT_FILTERS.forEach((f) => {
        if (scriptMatchesFilter(bucket, f.id)) counts[f.id]++;
      });
    });
    return counts;
  }, [commonFilteredPosts, stageId]);

  // Filter posts belonging to this stage (before the New/Redo/Revised filter)
  const stageBasePosts = useMemo(() => {
    if (stageId === "scripts") {
      return commonFilteredPosts.filter((p) => scriptMatchesFilter(getScriptBucket(p), scriptSubFilter));
    }
    return commonFilteredPosts.filter((p) => {
      const isStatusMatch = stageId === "published" && showArchived ? p.status === "archived" : stageMeta.statuses.includes(p.status);
      const isFallbackRejected =
        p.status === "rejected" && stageId === "designing" && !p.client_feedback?.toLowerCase().includes("script");
      return isStatusMatch || isFallbackRejected;
    });
  }, [commonFilteredPosts, stageMeta, stageId, scriptSubFilter, showArchived]);

  const workKindCounts = useMemo(() => {
    const counts = { all: stageBasePosts.length, new: 0, redo: 0, revised: 0 };
    if (showWorkKind) stageBasePosts.forEach((p) => counts[getWorkKind(p).kind]++);
    return counts;
  }, [stageBasePosts, showWorkKind]);

  const stagePosts = useMemo(() => {
    if (!showWorkKind || workFilter === "all") return stageBasePosts;
    return stageBasePosts.filter((p) => getWorkKind(p).kind === workFilter);
  }, [stageBasePosts, showWorkKind, workFilter]);

  const getActor = () => {
    let actorName = "Creative Team";
    let actorRole = "Team Member";
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        actorName = parsed.fullname || parsed.name || parsed.username || actorName;
        actorRole = parsed.role || actorRole;
      } catch (err) {}
    }
    return { actorName, actorRole };
  };

  // Transition Handler — returns true on success
  const handleTransition = async (post, targetStage, actionType, notes = "", extraData = {}, successMsg) => {
    setSubmittingAction(true);
    try {
      const { actorName, actorRole } = getActor();
      await axios.post(`${API_BASE_URL}/social/posts/${post.id}/transition_stage/`, {
        target_stage: targetStage,
        action_type: actionType,
        notes: notes || actionNotes,
        actor_name: actorName,
        actor_role: actorRole,
        ...extraData,
      });
      setModalAction(null);
      setDecision(null);
      setActionNotes("");
      const title = post.title || "Post";
      toast.success(
        successMsg ||
          (actionType === "update" || targetStage === post.status
            ? `"${title}" updated.`
            : `"${title}" moved to ${STAGE_LABELS[targetStage] || targetStage}.`)
      );
      onRefresh();
      return true;
    } catch (err) {
      console.error("Workflow transition error:", err);
      toast.error(apiErrorMessage(err, "Error updating post workflow stage."), { title: "Could not update post" });
      return false;
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUploadMedia = async (post, file, isReplace = true) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("replace", isReplace ? "true" : "false");
    setUploadState({ postId: post.id, pct: 0 });
    try {
      const res = await axios.post(`${API_BASE_URL}/social/posts/${post.id}/upload_media/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => e.total && setUploadState({ postId: post.id, pct: Math.round((e.loaded / e.total) * 100) }),
      });
      toast.success(`"${file.name}" (${(file.size / 1048576).toFixed(1)} MB) uploaded in original quality.`, { title: "Deliverable uploaded" });
      onRefresh();
      return res.data;
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(apiErrorMessage(err, "Failed to upload media deliverable."), { title: "Upload failed" });
      return null;
    } finally {
      setUploadState(null);
    }
  };

  const handlePublishNow = async (post) => {
    const ok = await confirmDialog({
      title: "Publish now?",
      message: `"${post.title || "This post"}" will be marked as published immediately on ${(post.platforms || []).join(", ") || "its platforms"}.`,
      confirmLabel: "Publish Now",
      tone: "sky",
    });
    if (!ok) return;
    try {
      await axios.post(`${API_BASE_URL}/social/posts/${post.id}/publish_now/`);
      toast.success(`"${post.title || "Post"}" is now live.`, { title: "Published" });
      onRefresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Error publishing post."), { title: "Publish failed" });
    }
  };

  const handleRestore = async (post) => {
    const fix = mistakeHints[String(post.id)]?.fix;
    const ok = await confirmDialog({
      title: "Restore to Scripts?",
      message: `"${post.title || "This post"}" goes back to Stage 1 with the rejection reason attached, so the team can write a new version.${fix ? ` A fix checklist ("${fix.title}") will be added to the post.` : ""}`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    if (fix) {
      try {
        const existing = new Set((post.checklist || []).map((c) => c.task));
        const added = fix.checklist.filter((t) => !existing.has(t)).map((task) => ({ task, done: false, source: "mistake_fix" }));
        if (added.length) {
          await axios.patch(`${API_BASE_URL}/social/posts/${post.id}/`, { checklist: [...(post.checklist || []), ...added] });
        }
      } catch (err) {
        console.error("Could not attach fix checklist", err);
      }
    }
    handleTransition(post, "script", "restore", "Restored from Rejected list for a fresh script", {}, `"${post.title || "Post"}" restored to Scripts.`);
  };

  // Decision modal submit handlers
  const submitRevision = ({ notes, categories, severity, requestedBy, scope }) => {
    const { post, mode } = decision;
    const extra = { reason_categories: categories, severity, revision_scope: scope };
    if (mode === "client" && requestedBy) {
      extra.actor_name = requestedBy;
      extra.actor_role = "Client";
    }
    const target = mode === "script" || scope === "script" ? "script" : "designing";
    handleTransition(
      post,
      target,
      "reject",
      notes,
      extra,
      `Sent "${post.title || "post"}" back to ${STAGE_LABELS[target]} (revision round #${(post.revision_count || 0) + 1}).`
    );
  };

  const submitRejection = ({ notes, categories, rejectedBy, outcome }) => {
    const { post } = decision;
    const target = outcome === "drop" ? "content_rejected" : "script";
    handleTransition(
      post,
      target,
      "reject_final",
      notes,
      { reason_categories: categories, rejected_by: rejectedBy },
      outcome === "drop"
        ? `"${post.title || "Post"}" rejected and moved to the Rejected list.`
        : `"${post.title || "Post"}" rejected — restarting from Scripts.`
    );
  };

  const submitApproval = async ({ scheduledAt, notes, approvedBy }) => {
    const { post, kind } = decision;
    if (kind === "reschedule") {
      setSubmittingAction(true);
      try {
        await axios.post(`${API_BASE_URL}/social/posts/${post.id}/reschedule/`, { scheduled_at: scheduledAt });
        toast.success(`"${post.title || "Post"}" rescheduled.`);
        setDecision(null);
        onRefresh();
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not reschedule post."));
      } finally {
        setSubmittingAction(false);
      }
      return;
    }
    handleTransition(
      post,
      "approved",
      "advance",
      notes || "Client approved design & copy",
      { scheduled_at: scheduledAt, ...(approvedBy ? { actor_name: approvedBy, actor_role: "Client" } : {}) },
      scheduledAt
        ? `"${post.title || "Post"}" approved and scheduled.`
        : `"${post.title || "Post"}" approved — set a schedule in Post Schedule.`
    );
  };

  const openDecision = (kind, post, mode) => setDecision({ kind, post, mode });

  const copyPublicLink = (token) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/social/review?token=${token}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Client review link copied to clipboard.");
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
    setEditLiveUrls(post.live_urls || {});
    setEditAnalytics(post.analytics || {});
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

              {/* Stage 1: Script library sub-filters (active work + every past script) */}
              {stageId === "scripts" && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#f8fafc", padding: 3, borderRadius: 10, border: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  {SCRIPT_FILTERS.map((f) => {
                    const active = scriptSubFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setScriptSubFilter(f.id)}
                        style={{
                          padding: "5px 11px",
                          borderRadius: 7,
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: active ? f.color : "transparent",
                          color: active ? "#ffffff" : "#64748b",
                          transition: "all 0.15s ease",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {f.label} ({scriptSubCounts[f.id]})
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Production & review stages: New vs Redo vs Revised */}
              {showWorkKind && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#f8fafc", padding: 3, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  {WORK_FILTERS.map((f) => {
                    const active = workFilter === f.id;
                    const tone = f.id === "all" ? { color: "#4f46e5" } : WORK_KIND_STYLE[f.id];
                    const activeBg = f.id === "all" ? "#4f46e5" : f.id === "new" ? "#059669" : tone.bar;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setWorkFilter(f.id)}
                        style={{
                          padding: "5px 11px",
                          borderRadius: 7,
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: active ? activeBg : "transparent",
                          color: active ? "#ffffff" : f.id === "all" ? "#64748b" : tone.color,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {f.label} ({workKindCounts[f.id]})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
              Showing {stagePosts.length} {stageMeta.shortTitle.toLowerCase()} items
            </div>
          </div>

          {stageId === "rejected" && (
            <MistakeInsightsPanel
              selectedClientId={selectedClientId}
              onHints={setMistakeHints}
              onApplied={onRefresh}
            />
          )}

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
                {showWorkKind && workFilter !== "all" && stageBasePosts.length > 0
                  ? `No ${workFilter} work in ${stageMeta.shortTitle}`
                  : stageId === "scripts" && scriptSubFilter !== "active"
                  ? `No scripts under "${SCRIPT_FILTERS.find((f) => f.id === scriptSubFilter)?.label}"`
                  : `No items currently in ${stageMeta.shortTitle}`}
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", maxWidth: 460 }}>
                {stageId === "scripts" && scriptSubFilter !== "active"
                  ? "Try another filter, or clear the search / format filter."
                  : stageId === "scripts"
                  ? "Click '+ New Script' to draft your next viral hook and content angle."
                  : stageId === "rejected"
                  ? "Nothing has been rejected outright. Content turned down by the client or team will be listed here with its reason."
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
              onOpenDecision={openDecision}
              onRestore={handleRestore}
              mistakeHints={mistakeHints}
              showWorkKind={showWorkKind}
              uploadState={uploadState}
              onOpenScriptModal={(post) => {
                setActiveScriptPost(post);
                setScriptModalOpen(true);
              }}
              onReuseScript={(post) => {
                // Prefill a brand-new script from an old one (no id → creates a new post)
                const { id, client_feedback, last_revision_categories, ...rest } = post;
                setActiveScriptPost({ ...rest, title: `${post.title || "Untitled"} (Copy)`, status: "script" });
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
                    
                    {modalAction.type === "live_urls" && "Update Live Post URLs"}
                    {modalAction.type === "analytics" && "Track Post Performance / Analytics"}
                    {modalAction.type === "archive_post" && "Archive Post (Remove from Dashboard)"}
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
                                  onClick={() => { navigator.clipboard.writeText(editMediaUrl); toast.success("Asset link copied."); }}
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
            {/* Modal Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
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
                      toast.success("Live URLs saved."); } catch(e) { toast.error(apiErrorMessage(e, "Failed to update URLs")); } finally { setSubmittingAction(false); }
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
                      toast.success("Post analytics saved."); } catch(e) { toast.error(apiErrorMessage(e, "Failed to update analytics")); } finally { setSubmittingAction(false); }
                    }}
                    style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <BarChart2 size={14} /> Save Analytics
                  </button>
                )}

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
      )}

      {/* 4b. DECISION MODALS: revisions, full rejection, approval & schedule */}
      {decision?.kind === "revision" && (
        <RevisionRequestModal
          key={`rev-${decision.post.id}`}
          post={decision.post}
          mode={decision.mode}
          submitting={submittingAction}
          onClose={() => setDecision(null)}
          onSubmit={submitRevision}
          onOpenTimeline={(p) => setTimelinePost(p)}
          onSwitchToReject={() =>
            setDecision({ kind: "reject", post: decision.post, mode: decision.mode === "client" ? "client" : "internal" })
          }
        />
      )}
      {decision?.kind === "reject" && (
        <RejectContentModal
          key={`rej-${decision.post.id}`}
          post={decision.post}
          defaultRejectedBy={decision.mode === "client" ? "client" : "internal"}
          submitting={submittingAction}
          onClose={() => setDecision(null)}
          onSubmit={submitRejection}
          onOpenTimeline={(p) => setTimelinePost(p)}
        />
      )}
      {(decision?.kind === "approve" || decision?.kind === "reschedule") && (
        <ApproveScheduleModal
          key={`appr-${decision.post.id}`}
          post={decision.post}
          mode={decision.kind}
          submitting={submittingAction}
          onClose={() => setDecision(null)}
          onSubmit={submitApproval}
          onOpenTimeline={(p) => setTimelinePost(p)}
        />
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
          onApprove={
            viewingScriptPost.status === "script_approval"
              ? (p) => handleTransition(p, "designing", "advance", "Script approved, ready for visual design")
              : null
          }
          onReject={
            viewingScriptPost.status === "script_approval"
              ? (p, reason) => handleTransition(p, "script", "reject", reason, { script_notes: p.script_notes })
              : null
          }
          onEdit={
            stageId === "scripts" && SCRIPT_EDITABLE_BUCKETS.includes(getScriptBucket(viewingScriptPost))
              ? (p) => {
                  setActiveScriptPost(p);
                  setScriptModalOpen(true);
                }
              : null
          }
          onOpenTimeline={(p) => setTimelinePost(p)}
        />
      )}

      {/* 8. DESIGNER WORK DETAILS MODAL */}
      {viewingWorkDetailsPost && (
        <WorkDetailsModal
          isOpen={Boolean(viewingWorkDetailsPost)}
          onClose={() => setViewingWorkDetailsPost(null)}
          post={viewingWorkDetailsPost}
          isReadOnly={["script_approval", "team_review", "internal_review", "client_review"].includes(stageId)}
          onSaveMedia={
            ["script_approval", "team_review", "internal_review", "client_review"].includes(stageId)
              ? undefined
              : async (p, mediaUrl, notes) => {
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
                }
          }
          onReadyForQA={
            ["script_approval", "team_review", "internal_review", "client_review"].includes(stageId)
              ? undefined
              : async (p, mediaUrl, notes) => {
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
                }
          }
          onOpenTimeline={(p) => setTimelinePost(p)}
          onOpenEditModal={
            ["script_approval", "team_review", "internal_review", "client_review"].includes(stageId)
              ? undefined
              : (p) => openActionModal(p, "edit_notes")
          }
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
  onReuseScript,
  onOpenTimeline,
  onViewScript,
  onViewWorkDetails,
  onPreviewMedia,
  onUploadMedia,
  onOpenDecision,
  onRestore,
  mistakeHints = {},
  showWorkKind = false,
  uploadState,
}) {
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
                {stageId === "published" ? "Published At" : stageId === "post_schedule" ? "Scheduled At" : stageId === "rejected" ? "Rejected On" : "Timing"}
              </th>
              <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", width: 360, textAlign: "right", whiteSpace: "nowrap" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {stagePosts.map((post) => {
              const isRejected = Boolean(post.client_feedback);
              const scriptBucket = stageId === "scripts" ? getScriptBucket(post) : null;
              const scriptEditable = scriptBucket ? SCRIPT_EDITABLE_BUCKETS.includes(scriptBucket) : false;
              const StageIcon = stageMeta.icon;
              const kindStyle = showWorkKind ? WORK_KIND_STYLE[getWorkKind(post).kind] : null;
              const rowBg = kindStyle?.rowBg || "transparent";

              return (
                <tr
                  key={post.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background 0.12s ease",
                    background: rowBg,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                >
                  {/* 1. Post & Content */}
                  <td style={{ padding: "14px 20px", verticalAlign: "middle", boxShadow: kindStyle?.bar ? `inset 4px 0 0 ${kindStyle.bar}` : "none" }}>
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
                            } else if (stageId === "scripts" && !scriptEditable && onViewScript) {
                              onViewScript(post);
                            } else if (stageId === "scripts" && onOpenScriptModal) {
                              onOpenScriptModal(post);
                            } else if (onViewWorkDetails) {
                              onViewWorkDetails(post);
                            } else if (!["script_approval", "team_review", "internal_review", "client_review"].includes(stageId)) {
                              onOpenModal(post, "edit_notes");
                            } else if (onOpenTimeline) {
                              onOpenTimeline(post);
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
                            <span
                              title={scriptBucket === "rejected" && post.rejected_from_stage ? `Rejected at ${STAGE_LABELS[post.rejected_from_stage] || post.rejected_from_stage}` : `Currently in ${STAGE_LABELS[post.status] || post.status}`}
                              style={{
                                background: SCRIPT_BUCKET_BADGE[scriptBucket].bg,
                                color: SCRIPT_BUCKET_BADGE[scriptBucket].color,
                                border: `1px solid ${SCRIPT_BUCKET_BADGE[scriptBucket].border}`,
                                fontSize: "0.68rem",
                                padding: "2px 7px",
                                borderRadius: 8,
                                fontWeight: scriptBucket === "draft" ? 700 : 800,
                              }}
                            >
                              ● {SCRIPT_BUCKET_BADGE[scriptBucket].label}
                              {scriptBucket === "production" && STAGE_LABELS[post.status] ? ` · ${STAGE_LABELS[post.status]}` : ""}
                              {post.status === "archived" ? " · Archived" : ""}
                            </span>
                          ) : showWorkKind ? (
                            <WorkKindBadge post={post} />
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

                        {/* Revision round badge */}
                        {(post.revision_count || 0) > 0 && stageId !== "rejected" && !showWorkKind && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4, marginRight: 6, fontSize: "0.68rem", fontWeight: 800, color: post.revision_count >= 3 ? "#b91c1c" : "#92400e", background: post.revision_count >= 3 ? "#fef2f2" : "#fffbeb", border: `1px solid ${post.revision_count >= 3 ? "#fecaca" : "#fde68a"}`, padding: "2px 7px", borderRadius: 6 }} title={`${post.revision_count} revision round(s), ${post.client_revision_count || 0} requested by client`}>
                            <RotateCcw size={11} /> Round {post.revision_count}
                            {(post.client_revision_count || 0) > 0 && <span style={{ fontWeight: 700 }}>• {post.client_revision_count} client</span>}
                          </div>
                        )}

                        {/* Rejected tab: full rejection summary */}
                        {stageId === "rejected" && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenTimeline) onOpenTimeline(post);
                            }}
                            style={{ marginTop: 6, padding: "8px 10px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", maxWidth: 560, cursor: "pointer" }}
                          >
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontSize: "0.7rem", fontWeight: 800, color: "#991b1b" }}>
                              <Ban size={12} />
                              Rejected by {post.rejected_by === "internal" ? "internal team" : "client"}
                              {post.rejected_from_stage && <span style={{ fontWeight: 600, color: "#b91c1c" }}>at {STAGE_LABELS[post.rejected_from_stage] || post.rejected_from_stage}</span>}
                              {(post.rejection_categories || []).map((c) => (
                                <span key={c} style={{ padding: "1px 7px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c", fontWeight: 700 }}>{c}</span>
                              ))}
                            </div>
                            <div style={{ fontSize: "0.76rem", color: "#334155", marginTop: 4, whiteSpace: "normal", lineHeight: 1.4 }}>
                              {post.rejection_reason || "No reason recorded."}
                            </div>
                            {mistakeHints[String(post.id)]?.similar_count > 0 && (
                              <div style={{ marginTop: 6, fontSize: "0.7rem", fontWeight: 800, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", padding: "3px 8px", borderRadius: 6, display: "inline-block" }}>
                                Seen {mistakeHints[String(post.id)].similar_count}× before · Fix: {mistakeHints[String(post.id)].fix?.title}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Revision feedback tag if looped back */}
                        {isRejected && stageId !== "rejected" && (stageId !== "scripts" || scriptEditable) && (
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
                              <strong>{(post.last_revision_categories || []).length ? post.last_revision_categories.join(", ") + ": " : "Feedback: "}</strong>
                              {post.client_feedback}
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
                    {stageId === "rejected" ? (
                      <span style={{ fontSize: "0.76rem", color: "#b91c1c", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {post.rejected_at ? new Date(post.rejected_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </span>
                    ) : post.scheduled_at ? (() => {
                      const isOverdue = new Date(post.scheduled_at) < new Date() && stageId !== "published";
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", fontWeight: 700, color: isOverdue ? "#dc2626" : "#0284c7", whiteSpace: "nowrap" }}>
                            <Clock size={13} />
                            {new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {isOverdue && (
                            <div style={{ fontSize: "0.7rem", color: "#ef4444", fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }} title="Scheduled time has passed">
                              <AlertTriangle size={12} /> Is this posted or not?
                            </div>
                          )}
                        </div>
                      );
                    })() : post.published_at ? (
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

                      {/* Stage 1: Scripts — past scripts (approved / published / rejected) */}
                      {stageId === "scripts" && !scriptEditable && (
                        <>
                          <button
                            onClick={() => onViewScript && onViewScript(post)}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <Eye size={12} /> View Script
                          </button>
                          <button
                            onClick={() => onReuseScript && onReuseScript(post)}
                            title="Start a new script pre-filled from this one"
                            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #c7d2fe", background: "#eef2ff", color: "#4338ca", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <Copy size={12} /> Reuse
                          </button>
                          {onNavigateStage && STATUS_TO_STAGE[post.status] && (
                            <button
                              onClick={() => onNavigateStage(STATUS_TO_STAGE[post.status])}
                              style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: SCRIPT_BUCKET_BADGE[scriptBucket].color, color: "#fff", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              Open in {STAGE_LABELS[post.status] || "Stage"} →
                            </button>
                          )}
                        </>
                      )}

                      {/* Stage 1: Scripts */}
                      {stageId === "scripts" && scriptEditable && (
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
                            onClick={() => onOpenDecision("revision", post, "script")}
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
                                <RotateCcw size={11} /> {uploadState?.postId === post.id ? `${uploadState.pct}%` : "Replace"}
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
                              <Upload size={12} /> {uploadState?.postId === post.id ? `Uploading ${uploadState.pct}%` : "Upload Work"}
                            </button>
                          )}

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

                          <button
                            onClick={() => (onViewWorkDetails ? onViewWorkDetails(post) : onOpenTimeline ? onOpenTimeline(post) : null)}
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
                            onClick={() => onOpenDecision("revision", post, "qa")}
                            title="QA failed — send back to Designing with revision notes"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: "1px solid #f59e0b",
                              background: "#fff",
                              color: "#b45309",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <RotateCcw size={11} /> Revisions
                          </button>
                          <button
                            onClick={() => onOpenDecision("reject", post, "internal")}
                            title="Reject the entire content (drop it or restart from a new script)"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#b91c1c",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Ban size={11} /> Reject
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
                            onClick={async () => {
                              const mediaUrl = post.media_urls?.[0];
                              if (!mediaUrl) {
                                toast.warning("Upload a deliverable before sharing on WhatsApp.", { title: "No media yet" });
                                return;
                              }
                              try {
                                const res = await fetch(mediaUrl);
                                const blob = await res.blob();
                                const fileName = mediaUrl.split("/").pop() || "media.mp4";
                                const file = new File([blob], fileName, { type: blob.type });

                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                  try {
                                    await navigator.share({
                                      files: [file],
                                      title: post.title || 'Review Media',
                                    });
                                    return;
                                  } catch (err) {
                                    console.log("Share cancelled or failed", err);
                                  }
                                }
                                
                                const blobUrl = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.style.display = "none";
                                a.href = blobUrl;
                                a.download = fileName;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(blobUrl);
                                a.remove();
                                
                                setTimeout(() => {
                                  const text = `Please review this for ${post.client_name || 'our brand'}:\n${window.location.origin}/social/review/?token=${post.client_approval_token}`;
                                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                                }, 600);
                              } catch (e) {
                                console.error("Download failed, opening in new tab", e);
                                window.open(mediaUrl, "_blank");
                              }
                            }}
                            title="Download Media and Share via WhatsApp"
                            style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
                          >
                            <Share2 size={13} /> WhatsApp
                          </button>
                          <button
                            onClick={() => onOpenDecision("revision", post, "client")}
                            title="Client asked for changes — loop back to Designing"
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ea580c", background: "#fff", color: "#ea580c", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <RotateCcw size={12} /> Revisions
                          </button>
                          <button
                            onClick={() => onOpenDecision("reject", post, "client")}
                            title="Client rejected the content entirely"
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <Ban size={12} /> Reject
                          </button>
                          <button
                            onClick={() => onOpenDecision("approve", post)}
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
                            onClick={() => onOpenDecision("reschedule", post)}
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
                          <button
                            onClick={() => onOpenModal(post, "edit_notes")}
                            style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Details
                          </button>
                        </>
                      )}

                      {/* Rejected / Dropped */}
                      {stageId === "rejected" && (
                        <button
                          onClick={() => onRestore && onRestore(post)}
                          title="Bring this content back to Scripts for a fresh attempt"
                          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #c7d2fe", background: "#eef2ff", color: "#4338ca", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <Undo2 size={12} /> Restore to Scripts
                        </button>
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
