import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  X,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileEdit,
  Send,
  CheckCheck,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Plus,
  Check,
} from "lucide-react";
import API_BASE_URL from "@/utils/apiBase";
import { notify, toast } from "./SocialFeedback";

// Standard sequential workflow milestones
const WORKFLOW_PIPELINE_ORDER = [
  { id: "script", label: "Script & Concept Draft", short: "Scripting" },
  { id: "script_approval", label: "Script Review & Approval", short: "Script Approval" },
  { id: "designing", label: "Visual Design & Creative Assets", short: "Designing" },
  { id: "team_review", label: "Internal Team QA Review", short: "Team QA" },
  { id: "client_review", label: "Client Review & Sign-Off", short: "Client Review" },
  { id: "scheduled", label: "Post Scheduling & Queue", short: "Scheduled" },
  { id: "published", label: "Published Across Channels", short: "Published Live" },
];

function formatEventDate(dateString) {
  if (!dateString) return "Date not recorded";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return String(dateString);
  }
}

function formatEventTitle(action = "") {
  if (!action) return "Workflow Milestone";
  const lower = action.toLowerCase().trim();
  if (lower === "created") return "Post & Script Drafted";
  if (lower === "submitted_review") return "Submitted for Script Approval";
  if (lower === "reworked") return "Script Reworked & Resubmitted";
  if (lower === "updated") return "Post Content Updated";
  if (lower === "changes_requested") return "Revisions Requested";
  if (lower === "approved") return "Post Approved";
  return action;
}

function getEventStyle(action = "", notes = "", eventType = "") {
  const act = (action || "").toLowerCase().trim();
  const not = (notes || "").toLowerCase().trim();

  // 0. Entire content rejected (dropped or restarted)
  if (eventType === "rejection") {
    return {
      type: "rejection",
      color: "#b91c1c",
      bgColor: "#fef2f2",
      borderColor: "#fca5a5",
      badgeColor: "#ffffff",
      badgeBg: "#dc2626",
      badgeLabel: "Content Rejected",
      icon: AlertTriangle,
    };
  }

  // 1. Rejections / Critique / Rework requested
  if (
    eventType === "revision" ||
    act.includes("reject") ||
    act.includes("requested changes") ||
    act.includes("changes_requested") ||
    act.includes("rework requested") ||
    act.includes("changes requested") ||
    act.includes("needs work") ||
    act.includes("needs revision") ||
    act.includes("loopback") ||
    not.includes("reject")
  ) {
    return {
      type: "rejection",
      color: "#dc2626", // Red 600
      bgColor: "#fef2f2",
      borderColor: "#fecaca",
      badgeColor: "#991b1b",
      badgeBg: "#fee2e2",
      badgeLabel: "Rework Requested",
      icon: AlertTriangle,
    };
  }

  // 2. Reworked / Revised / Resubmitted
  if (
    act.includes("rework") ||
    act.includes("revise") ||
    act.includes("resubmit")
  ) {
    return {
      type: "rework",
      color: "#d97706", // Amber 600
      bgColor: "#fffbeb",
      borderColor: "#fde68a",
      badgeColor: "#92400e",
      badgeBg: "#fef3c7",
      badgeLabel: "Reworked & Resubmitted",
      icon: RotateCcw,
    };
  }

  // 3. Submissions for Review / Hand-offs
  // Must be checked before 'approved', because 'Advanced to Script Approval' contains 'approv' and 'advance'
  if (
    act.includes("submit") ||
    act.includes("to script approval") ||
    act.includes("to team review") ||
    act.includes("to client review") ||
    act.includes("sent to") ||
    act.includes("ready for qa") ||
    act.includes("script approval")
  ) {
    return {
      type: "submitted",
      color: "#7c3aed", // Violet 600
      bgColor: "#f5f3ff",
      borderColor: "#ddd6fe",
      badgeColor: "#5b21b6",
      badgeBg: "#ede9fe",
      badgeLabel: "Submitted for Review",
      icon: Send,
    };
  }

  // 4. Approved
  if (
    act.includes("approved") ||
    act.includes("sign-off") ||
    act.includes("passed") ||
    act.includes("scheduled")
  ) {
    return {
      type: "approved",
      color: "#16a34a", // Green 600
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      badgeColor: "#166534",
      badgeBg: "#dcfce7",
      badgeLabel: act.includes("client") ? "Client Approved" : "Approved",
      icon: CheckCircle2,
    };
  }

  // 5. Published
  if (act.includes("publish")) {
    return {
      type: "published",
      color: "#15803d", // Emerald 700
      bgColor: "#ecfdf5",
      borderColor: "#a7f3d0",
      badgeColor: "#065f46",
      badgeBg: "#d1fae5",
      badgeLabel: "Published Live",
      icon: CheckCheck,
    };
  }

  // 6. Created / Draft
  if (act.includes("creat") || act.includes("draft")) {
    return {
      type: "created",
      color: "#4f46e5", // Indigo 600
      bgColor: "#eef2ff",
      borderColor: "#c7d2fe",
      badgeColor: "#3730a3",
      badgeBg: "#e0e7ff",
      badgeLabel: "Created / Drafted",
      icon: FileText,
    };
  }

  // 7. QA Checkpoint / Inspection
  if (act.includes("checkpoint") || act.includes("qa") || act.includes("verified")) {
    return {
      type: "checkpoint",
      color: "#2563eb", // Blue 600
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
      badgeColor: "#1e40af",
      badgeBg: "#dbeafe",
      badgeLabel: "QA Checkpoint",
      icon: ShieldAlert,
    };
  }

  // 8. Default Advanced / Transferred
  return {
    type: "transition",
    color: "#0284c7", // Sky 600
    bgColor: "#f0f9ff",
    borderColor: "#bae6fd",
    badgeColor: "#0369a1",
    badgeBg: "#e0f2fe",
    badgeLabel: "Stage Advanced",
    icon: ArrowRight,
  };
}

const STAGE_INDEX = {
  draft: 0,
  script: 0,
  rejected: 0,
  script_approval: 1,
  designing: 2,
  team_review: 3,
  internal_review: 3,
  client_review: 4,
  approved: 5,
  post_schedule: 5,
  scheduled: 5,
  published: 6,
  archived: 6,
};

const STAGE_NAMES = {
  script: "Scripts",
  draft: "Scripts",
  script_approval: "Script Approval",
  designing: "Designing",
  team_review: "Team Review",
  internal_review: "Team Review",
  client_review: "Client Review",
  approved: "Post Schedule",
  scheduled: "Post Schedule",
  published: "Published",
  archived: "Archived",
  content_rejected: "Rejected",
};

const NOTE_TYPES = ["Milestone Note", "Design Revision", "Review Feedback", "QA Checkpoint", "Script Reworked"];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "feedback", label: "Feedback & Rejections" },
  { id: "approvals", label: "Approvals" },
  { id: "activity", label: "Work & Notes" },
];

function relativeTime(dateString) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function durationLabel(fromIso, toIso) {
  if (!fromIso) return "—";
  const ms = new Date(toIso || Date.now()).getTime() - new Date(fromIso).getTime();
  const h = Math.max(0, Math.round(ms / 3600000));
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  const rem = h % 24;
  return rem ? `${d}d ${rem}h` : `${d}d`;
}

function dayLabel(dateString) {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Undated";
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function initials(name = "") {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "?"
  );
}

function filterOf(type) {
  if (type === "rejection") return "feedback";
  if (["approved", "published", "submitted"].includes(type)) return "approvals";
  return "activity";
}

function EventNotes({ text, color }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const long = text.length > 220;
  return (
    <div>
      <p className="tl-notes">
        {long && !open ? `${text.slice(0, 220).trim()}…` : text}
      </p>
      {long && (
        <button type="button" className="tl-more" onClick={() => setOpen((v) => !v)}>
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default function PostTimelineModal({ post, isOpen, onClose, onRefresh }) {
  const [addingNote, setAddingNote] = useState(false);
  const [newNoteAction, setNewNoteAction] = useState("Milestone Note");
  const [newNoteText, setNewNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newestFirst, setNewestFirst] = useState(true);
  const [localHistory, setLocalHistory] = useState(null);

  useEffect(() => {
    setLocalHistory(null);
  }, [post?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const historyEvents = useMemo(() => {
    if (!post) return [];
    const source = localHistory || (Array.isArray(post.approval_history) ? post.approval_history : []);
    const raw = [...source].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
    if (raw.length) return raw;
    return [
      {
        id: "fallback-created",
        action: "created",
        actor_name: post.created_by_details?.fullname || post.created_by_details?.username || "Creative Team",
        actor_role: "Content Creator",
        notes: "Post drafted in workspace",
        timestamp: post.created_at || new Date().toISOString(),
      },
    ];
  }, [post, localHistory]);

  const decorated = useMemo(
    () =>
      historyEvents.map((item) => {
        const style = getEventStyle(item.action, item.notes, item.event_type);
        return { item, style, group: filterOf(style.type) };
      }),
    [historyEvents]
  );

  const counts = useMemo(() => {
    const c = { all: decorated.length, feedback: 0, approvals: 0, activity: 0 };
    decorated.forEach((d) => (c[d.group] += 1));
    return c;
  }, [decorated]);

  if (!isOpen || !post) return null;

  const currentStatus = post.status || "script";
  const isRejected = currentStatus === "content_rejected";
  const isFullyPublished = ["published", "archived"].includes(currentStatus);
  const currentStageIndex = isRejected ? STAGE_INDEX[post.rejected_from_stage] ?? 0 : STAGE_INDEX[currentStatus] ?? 0;
  const pendingStages = isFullyPublished || isRejected ? [] : WORKFLOW_PIPELINE_ORDER.slice(currentStageIndex + 1);

  const visible = decorated.filter((d) => filter === "all" || d.group === filter);
  const ordered = newestFirst ? [...visible].reverse() : visible;

  // Group by calendar day
  const groups = [];
  ordered.forEach((d) => {
    const label = dayLabel(d.item.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(d);
    else groups.push({ label, items: [d] });
  });

  const lastEvent = historyEvents[historyEvents.length - 1];
  const endIso = isFullyPublished ? post.published_at || lastEvent?.timestamp : isRejected ? post.rejected_at : null;
  const revisionRounds = post.revision_count || counts.feedback;

  const handleAddTimelineNote = async (e) => {
    e?.preventDefault();
    if (!newNoteText.trim()) return;
    setSubmittingNote(true);
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
      const res = await axios.post(`${API_BASE_URL}/social/posts/${post.id}/add_timeline_note/`, {
        action: newNoteAction,
        actor_name: actorName,
        actor_role: actorRole,
        notes: newNoteText.trim(),
      });
      if (Array.isArray(res.data?.approval_history)) setLocalHistory(res.data.approval_history);
      setNewNoteText("");
      setAddingNote(false);
      setFilter("all");
      setNewestFirst(true);
      toast.success("Note added to the timeline.");
      if (onRefresh) onRefresh();
    } catch (err) {
      notify(err.response?.data?.error || "Error adding milestone note.");
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div className="tl-overlay" onClick={onClose}>
      <style>{TL_CSS}</style>
      <div className="tl-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* HERO HEADER */}
        <header className="tl-hero">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div style={{ minWidth: 0 }}>
              <div className="tl-chips">
                <span className="tl-chip">
                  <span className="tl-dot" style={{ background: post.client_primary_color || "#a5b4fc" }} />
                  {post.client_name || "Adstra Client"}
                </span>
                <span className="tl-chip">{(post.post_type || "post").toUpperCase()}</span>
                <span className={`tl-chip ${isRejected ? "danger" : isFullyPublished ? "success" : "live"}`}>
                  <span className="tl-dot pulse" /> {STAGE_NAMES[currentStatus] || currentStatus}
                </span>
              </div>
              <h3 className="tl-title">{post.title || "Social Post Timeline"}</h3>
              <p className="tl-sub">Every hand-off, revision and approval for this post.</p>
            </div>
            <button type="button" className="tl-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* Stage stepper */}
          <div className="tl-stepper">
            {WORKFLOW_PIPELINE_ORDER.map((stage, idx) => {
              const done = idx < currentStageIndex || (isFullyPublished && idx <= currentStageIndex);
              const current = idx === currentStageIndex && !isFullyPublished;
              const failed = current && isRejected;
              return (
                <div key={stage.id} className={`tl-step ${done ? "done" : ""} ${current ? "current" : ""} ${failed ? "failed" : ""}`} title={stage.label}>
                  <div className="tl-step-node">{failed ? <X size={12} /> : done ? <Check size={12} /> : idx + 1}</div>
                  <span>{stage.short}</span>
                  {stage.id === "designing" && revisionRounds > 0 && (
                    <em className="tl-loop">
                      <RotateCcw size={9} /> {revisionRounds}
                    </em>
                  )}
                </div>
              );
            })}
          </div>
        </header>

        {/* BODY */}
        <div className="tl-body">
          {isRejected && (
            <div className="tl-rejected">
              <AlertTriangle size={17} />
              <div>
                <strong>
                  Rejected by {post.rejected_by === "internal" ? "internal team" : "client"}
                  {post.rejected_from_stage ? ` at ${STAGE_NAMES[post.rejected_from_stage] || post.rejected_from_stage}` : ""}
                </strong>
                {(post.rejection_categories || []).length > 0 && <span> • {post.rejection_categories.join(", ")}</span>}
                <p>{post.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="tl-stats">
            <div className="tl-stat">
              <Layers size={16} color="#6366f1" />
              <div>
                <strong>{historyEvents.length}</strong>
                <span>Events</span>
              </div>
            </div>
            <div className="tl-stat">
              <RotateCcw size={16} color={revisionRounds ? "#d97706" : "#94a3b8"} />
              <div>
                <strong>{revisionRounds}</strong>
                <span>Revision rounds{post.client_revision_count ? ` • ${post.client_revision_count} client` : ""}</span>
              </div>
            </div>
            <div className="tl-stat">
              <Clock size={16} color="#0284c7" />
              <div>
                <strong>{durationLabel(post.created_at || historyEvents[0]?.timestamp, endIso)}</strong>
                <span>{isFullyPublished ? "Idea → live" : isRejected ? "Before rejection" : "In pipeline"}</span>
              </div>
            </div>
            <div className="tl-stat">
              <Sparkles size={16} color="#16a34a" />
              <div>
                <strong>{relativeTime(lastEvent?.timestamp) || "—"}</strong>
                <span>Last activity</span>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="tl-toolbar">
            <div className="tl-filters" role="tablist">
              {FILTERS.map((f) => (
                <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={`tl-filter ${filter === f.id ? "active" : ""} ${f.id}`} onClick={() => setFilter(f.id)}>
                  {f.label}
                  <span>{counts[f.id]}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="tl-tool" onClick={() => setNewestFirst((v) => !v)} title="Toggle sort order">
                <ArrowRight size={13} style={{ transform: newestFirst ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .2s" }} />
                {newestFirst ? "Newest" : "Oldest"}
              </button>
              <button type="button" className={`tl-tool primary ${addingNote ? "on" : ""}`} onClick={() => setAddingNote((v) => !v)}>
                <Plus size={13} style={{ transform: addingNote ? "rotate(45deg)" : "none", transition: "transform .2s" }} />
                {addingNote ? "Cancel" : "Add note"}
              </button>
            </div>
          </div>

          {/* Composer */}
          {addingNote && (
            <form className="tl-composer" onSubmit={handleAddTimelineNote}>
              <div className="tl-note-types">
                {NOTE_TYPES.map((t) => (
                  <button key={t} type="button" className={newNoteAction === t ? "active" : ""} onClick={() => setNewNoteAction(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                autoFocus
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddTimelineNote(e);
                }}
                placeholder="What happened? e.g. Client approved on call, waiting for final logo file…"
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Ctrl + Enter to save</span>
                <button type="submit" className="tl-save" disabled={submittingNote || !newNoteText.trim()}>
                  {submittingNote ? "Saving…" : "Save to timeline"}
                </button>
              </div>
            </form>
          )}

          {/* Pending stages first when newest-first */}
          {newestFirst && filter === "all" && pendingStages.length > 0 && <UpNext stages={pendingStages} />}

          {/* Events grouped by day */}
          {groups.length === 0 ? (
            <div className="tl-empty">No events in this filter yet.</div>
          ) : (
            groups.map((g) => (
              <section key={g.label} className="tl-day">
                <div className="tl-day-label">
                  <Calendar size={12} /> {g.label}
                </div>
                <div className="tl-list">
                  {g.items.map(({ item, style }, idx) => {
                    const Icon = style.icon;
                    const showRoute = item.from_stage && item.to_stage && item.from_stage !== item.to_stage;
                    return (
                      <article key={item.id || `${g.label}-${idx}`} className={`tl-event ${style.type}`} style={{ "--c": style.color }}>
                        <div className="tl-node">
                          <Icon size={14} />
                        </div>
                        <div className="tl-card">
                          <div className="tl-card-head">
                            <div style={{ minWidth: 0 }}>
                              <h4>{formatEventTitle(item.action)}</h4>
                              <div className="tl-meta">
                                <span className="tl-badge">
                                  <i style={{ background: style.color }} />
                                  {style.badgeLabel}
                                </span>
                                {showRoute && (
                                  <span className="tl-route">
                                    {STAGE_NAMES[item.from_stage] || item.from_stage} <ChevronRight size={11} /> {STAGE_NAMES[item.to_stage] || item.to_stage}
                                  </span>
                                )}
                              </div>
                            </div>
                            <time title={formatEventDate(item.timestamp)}>{relativeTime(item.timestamp)}</time>
                          </div>

                          <div className="tl-actor">
                            <span className="tl-avatar">
                              {initials(item.actor_name)}
                            </span>
                            <strong>{item.actor_name || "Team Member"}</strong>
                            {item.actor_role && <span>• {item.actor_role}</span>}
                            <span className="tl-time-full">• {formatEventDate(item.timestamp)}</span>
                          </div>

                          <EventNotes text={item.notes} color={style.color} />

                          {((item.reason_categories || []).length > 0 || item.revision_round > 0 || item.severity) && (
                            <div className="tl-tags">
                              {item.revision_round > 0 && <span className="dark">Round {item.revision_round}</span>}
                              {item.severity && <span className={item.severity === "major" ? "major" : ""}>{item.severity}</span>}
                              {(item.reason_categories || []).map((c) => (
                                <span key={c}>{c}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}

          {!newestFirst && filter === "all" && pendingStages.length > 0 && <UpNext stages={pendingStages} />}
        </div>

        <footer className="tl-footer">
          <span>
            Post #{post.id} • Created {formatEventDate(post.created_at)}
          </span>
          <button type="button" className="tl-done" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

function UpNext({ stages }) {
  return (
    <div className="tl-upnext">
      <div className="tl-day-label">
        <ChevronRight size={12} /> Up next
      </div>
      <div className="tl-upnext-row">
        {stages.map((s, i) => (
          <div key={s.id} className="tl-upnext-item">
            <span>{i + 1}</span>
            {s.short}
          </div>
        ))}
      </div>
    </div>
  );
}

const TL_CSS = `
.tl-overlay { --ink: #111827; --ink-2: #4b5563; --ink-3: #9ca3af; --line: #e5e7eb; --line-2: #f3f4f6; --soft: #f9fafb; --accent: #4f46e5;
  position: fixed; inset: 0; z-index: 10050; background: rgba(17,24,39,0.45); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: tlF .12s ease; }
@keyframes tlF { from { opacity: 0 } to { opacity: 1 } }
@keyframes tlU { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes tlIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
@keyframes tlRing { 0% { box-shadow: 0 0 0 0 rgba(79,70,229,.35) } 70% { box-shadow: 0 0 0 6px rgba(79,70,229,0) } 100% { box-shadow: 0 0 0 0 rgba(79,70,229,0) } }
.tl-dialog { width: 100%; max-width: 760px; max-height: 92vh; background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 24px 64px -16px rgba(17,24,39,.35); animation: tlU .18s cubic-bezier(.2,.8,.2,1); color: var(--ink); }
.tl-hero { padding: 20px 24px 18px; border-bottom: 1px solid var(--line); background: #fff; }
.tl-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.tl-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; padding: 2px 9px; border-radius: 6px; background: var(--line-2); color: var(--ink-2); }
.tl-chip.live { background: #eef2ff; color: #4338ca; }
.tl-chip.success { background: #ecfdf5; color: #047857; }
.tl-chip.danger { background: #fef2f2; color: #b91c1c; }
.tl-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.tl-title { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; line-height: 1.3; }
.tl-sub { margin: 4px 0 0; font-size: 13.5px; color: var(--ink-3); }
.tl-close { width: 34px; height: 34px; border-radius: 8px; border: none; background: transparent; color: var(--ink-3); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background .12s, color .12s; }
.tl-close:hover { background: var(--line-2); color: var(--ink); }
.tl-stepper { display: flex; margin-top: 20px; }
.tl-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; position: relative; min-width: 0; }
.tl-step:not(:first-child)::before { content: ""; position: absolute; top: 11px; right: calc(50% + 14px); width: calc(100% - 28px); height: 1.5px; background: var(--line); }
.tl-step.done:not(:first-child)::before, .tl-step.current:not(:first-child)::before { background: var(--ink); }
.tl-step-node { width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 1.5px solid #d1d5db; color: var(--ink-3); font-size: 11px; font-weight: 500; display: flex; align-items: center; justify-content: center; font-variant-numeric: tabular-nums; transition: all .2s; }
.tl-step.done .tl-step-node { background: var(--ink); border-color: var(--ink); color: #fff; }
.tl-step.current .tl-step-node { border-color: var(--accent); color: var(--accent); font-weight: 600; animation: tlRing 2s infinite; }
.tl-step.failed .tl-step-node { border-color: #dc2626; background: #dc2626; color: #fff; animation: none; }
.tl-step span { font-size: 12px; color: var(--ink-3); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.tl-step.done span { color: var(--ink-2); }
.tl-step.current span { color: var(--ink); font-weight: 600; }
.tl-loop { position: absolute; top: -6px; left: calc(50% + 8px); font-style: normal; font-size: 10.5px; font-weight: 600; background: #fff; color: #b45309; border: 1px solid #fde68a; border-radius: 999px; padding: 0 5px; display: inline-flex; align-items: center; gap: 2px; line-height: 15px; }
.tl-body { padding: 16px 24px 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; background: #fff; }
.tl-rejected { display: flex; gap: 10px; padding: 12px 14px; border-radius: 8px; border: 1px solid var(--line); border-left: 3px solid #dc2626; font-size: 13.5px; color: var(--ink); }
.tl-rejected svg { color: #dc2626; flex-shrink: 0; }
.tl-rejected strong { font-weight: 600; }
.tl-rejected span { color: var(--ink-2); }
.tl-rejected p { margin: 4px 0 0; color: var(--ink-2); line-height: 1.55; }
.tl-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border: 1px solid var(--line); border-radius: 10px; }
.tl-stat { display: flex; gap: 10px; align-items: center; padding: 11px 14px; }
.tl-stat + .tl-stat { border-left: 1px solid var(--line); }
.tl-stat svg { stroke: var(--ink-3); flex-shrink: 0; }
.tl-stat strong { display: block; font-size: 15px; font-weight: 600; color: var(--ink); line-height: 1.2; font-variant-numeric: tabular-nums; }
.tl-stat span { display: block; font-size: 12px; color: var(--ink-3); margin-top: 1px; }
.tl-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.tl-filters { display: flex; gap: 2px; background: var(--line-2); padding: 3px; border-radius: 8px; flex-wrap: wrap; }
.tl-filter { display: inline-flex; align-items: center; gap: 6px; border: none; background: transparent; padding: 5px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; color: var(--ink-2); cursor: pointer; transition: background .12s, color .12s; }
.tl-filter span { font-size: 11.5px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.tl-filter:hover { color: var(--ink); }
.tl-filter.active { background: #fff; color: var(--ink); box-shadow: 0 1px 2px rgba(17,24,39,.08), 0 0 0 1px rgba(17,24,39,.04); }
.tl-tool { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--line); background: #fff; font-size: 13px; font-weight: 500; color: var(--ink); cursor: pointer; transition: background .12s, border-color .12s; }
.tl-tool:hover { background: var(--soft); border-color: #d1d5db; }
.tl-tool.primary { background: var(--ink); border-color: var(--ink); color: #fff; }
.tl-tool.primary:hover { background: #1f2937; }
.tl-tool.primary.on { background: #fff; color: var(--ink); border-color: var(--line); }
.tl-composer { border: 1px solid var(--line); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px; animation: tlIn .15s ease; }
.tl-composer:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.tl-note-types { display: flex; gap: 6px; flex-wrap: wrap; }
.tl-note-types button { border: 1px solid var(--line); background: #fff; border-radius: 6px; padding: 3px 9px; font-size: 12.5px; color: var(--ink-2); cursor: pointer; transition: all .12s; }
.tl-note-types button:hover { border-color: #d1d5db; color: var(--ink); }
.tl-note-types button.active { background: var(--ink); border-color: var(--ink); color: #fff; }
.tl-composer textarea { width: 100%; box-sizing: border-box; border: none; padding: 2px 0; font: inherit; font-size: 14px; color: var(--ink); outline: none; resize: vertical; background: transparent; }
.tl-save { border: none; background: var(--ink); color: #fff; height: 30px; padding: 0 14px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; }
.tl-save:disabled { opacity: .4; cursor: not-allowed; }
.tl-day { display: flex; flex-direction: column; }
.tl-day-label { position: sticky; top: -16px; z-index: 2; display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; color: var(--ink-3); background: #fff; padding: 6px 0 10px; }
.tl-day-label svg { color: var(--ink-3); }
.tl-list { display: flex; flex-direction: column; }
.tl-event { display: flex; gap: 14px; position: relative; padding-bottom: 14px; animation: tlIn .18s ease both; }
.tl-event:not(:last-child)::before { content: ""; position: absolute; left: 13px; top: 30px; bottom: 2px; width: 1.5px; background: var(--line); }
.tl-node { width: 28px; height: 28px; border-radius: 50%; background: #fff; border: 1.5px solid var(--line); color: var(--ink-2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; z-index: 1; transition: border-color .15s; }
.tl-node svg { width: 13px; height: 13px; }
.tl-event.rejection .tl-node { border-color: #fecaca; color: #dc2626; }
.tl-event.approved .tl-node, .tl-event.published .tl-node { border-color: #a7f3d0; color: #059669; }
.tl-event:hover .tl-node { border-color: #9ca3af; }
.tl-card { flex: 1; min-width: 0; border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; background: #fff; transition: border-color .15s, box-shadow .15s; }
.tl-card:hover { border-color: #d1d5db; box-shadow: 0 4px 14px -8px rgba(17,24,39,.18); }
.tl-card-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.tl-card-head h4 { margin: 0; font-size: 14.5px; font-weight: 600; color: var(--ink); line-height: 1.35; }
.tl-card-head time { font-size: 12.5px; color: var(--ink-3); white-space: nowrap; cursor: help; font-variant-numeric: tabular-nums; }
.tl-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; align-items: center; }
.tl-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--ink-2); border: 1px solid var(--line); padding: 1px 8px; border-radius: 6px; }
.tl-badge i { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.tl-route { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; color: var(--ink-2); background: var(--line-2); padding: 1px 8px; border-radius: 6px; }
.tl-route svg { color: var(--ink-3); }
.tl-actor { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; font-size: 13px; color: var(--ink-3); }
.tl-actor strong { color: var(--ink); font-weight: 500; }
.tl-avatar { width: 20px; height: 20px; border-radius: 50%; background: var(--line-2); color: var(--ink-2); font-size: 10px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }
.tl-notes { margin: 10px 0 0; padding: 9px 12px; border-radius: 8px; background: var(--soft); border: 1px solid var(--line-2); font-size: 13.5px; color: var(--ink); line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.tl-event.rejection .tl-notes { border-left: 2px solid #dc2626; }
.tl-more { background: none; border: none; color: var(--accent); font-size: 12.5px; font-weight: 500; cursor: pointer; padding: 6px 0 0; }
.tl-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px; }
.tl-tags span { font-size: 12px; padding: 1px 8px; border-radius: 6px; border: 1px solid var(--line); color: var(--ink-2); text-transform: capitalize; }
.tl-tags span.dark { background: var(--ink); border-color: var(--ink); color: #fff; }
.tl-tags span.major { color: #b91c1c; border-color: #fecaca; }
.tl-upnext { display: flex; flex-direction: column; }
.tl-upnext-row { display: flex; gap: 6px; flex-wrap: wrap; }
.tl-upnext-item { display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 11px; border-radius: 8px; border: 1px dashed #d1d5db; color: var(--ink-2); font-size: 13px; background: #fff; }
.tl-upnext-item span { font-size: 11.5px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.tl-empty { text-align: center; padding: 28px; color: var(--ink-3); font-size: 13.5px; border: 1px dashed var(--line); border-radius: 10px; }
.tl-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 24px; border-top: 1px solid var(--line); background: #fff; font-size: 13px; color: var(--ink-3); }
.tl-done { border: 1px solid var(--line); background: #fff; color: var(--ink); height: 34px; padding: 0 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; transition: background .12s; }
.tl-done:hover { background: var(--soft); }
@media (max-width: 640px) {
  .tl-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tl-stat:nth-child(3) { border-left: none; }
  .tl-stat:nth-child(n+3) { border-top: 1px solid var(--line); }
  .tl-step span { display: none; }
  .tl-time-full { display: none; }
}
`;
