import React, { useState } from "react";
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
} from "lucide-react";
import API_BASE_URL from "@/utils/apiBase";

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

function getEventStyle(action = "", notes = "") {
  const act = (action || "").toLowerCase();
  const not = (notes || "").toLowerCase();

  // Rejections / Rework requested
  if (act.includes("reject") || act.includes("change") || not.includes("reject") || act.includes("loopback")) {
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

  // Reworked / Updated
  if (act.includes("rework") || act.includes("update") || act.includes("revise") || not.includes("rework") || not.includes("revise")) {
    return {
      type: "rework",
      color: "#d97706", // Amber 600
      bgColor: "#fffbeb",
      borderColor: "#fde68a",
      badgeColor: "#92400e",
      badgeBg: "#fef3c7",
      badgeLabel: "Reworked & Resubmitted",
      icon: FileEdit,
    };
  }

  // Approved
  if (act.includes("approv") || act.includes("pass") || act.includes("scheduled")) {
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

  // Published
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

  // Created / Draft
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

  // Submitted for Review
  if (act.includes("submit")) {
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

  // Default Advanced / Transferred
  return {
    type: "transition",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    badgeColor: "#166534",
    badgeBg: "#dcfce7",
    badgeLabel: "Stage Advanced",
    icon: CheckCircle2,
  };
}

export default function PostTimelineModal({ post, isOpen, onClose, onRefresh }) {
  const [addingNote, setAddingNote] = useState(false);
  const [newNoteAction, setNewNoteAction] = useState("Milestone Note");
  const [newNoteText, setNewNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  if (!isOpen || !post) return null;

  // Process and sort approval history chronologically (earliest to latest)
  const rawHistory = Array.isArray(post.approval_history) ? [...post.approval_history] : [];
  rawHistory.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  // If no history exists, provide an initial synthesized creation entry
  const historyEvents =
    rawHistory.length > 0
      ? rawHistory
      : [
          {
            id: "fallback-created",
            action: "created",
            actor_name: post.created_by_details?.fullname || post.created_by_details?.username || "Creative Team",
            actor_role: "Content Creator",
            notes: "Post drafted in workspace",
            timestamp: post.created_at || new Date().toISOString(),
          },
        ];

  // Determine current workflow stage
  const currentStatus = post.status || "script";
  const stageMap = {
    draft: 0,
    script: 0,
    script_approval: 1,
    designing: 2,
    team_review: 3,
    internal_review: 3,
    client_review: 4,
    approved: 5,
    post_schedule: 5,
    scheduled: 5,
    published: 6,
  };
  const currentStageIndex = stageMap[currentStatus] ?? 0;

  // Determine future pending stages (unreached milestones)
  const isFullyPublished = currentStatus === "published";
  const pendingStages = isFullyPublished
    ? []
    : WORKFLOW_PIPELINE_ORDER.slice(currentStageIndex + 1);

  // Quick submission for an ad-hoc milestone note / audit entry
  const handleAddTimelineNote = async (e) => {
    e.preventDefault();
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

      await axios.post(`${API_BASE_URL}/social/posts/${post.id}/add_timeline_note/`, {
        action: newNoteAction,
        actor_name: actorName,
        actor_role: actorRole,
        notes: newNoteText.trim(),
      });

      setNewNoteText("");
      setAddingNote(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding milestone note.");
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 640,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(to right, #f8fafc, #ffffff)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: post.client_primary_color || "#4338ca",
                  background: "#f1f5f9",
                  padding: "3px 9px",
                  borderRadius: 6,
                  letterSpacing: "0.02em",
                }}
              >
                {post.client_name || "Adstra Client"}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#64748b",
                  background: "#f8fafc",
                  padding: "2px 7px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  textTransform: "uppercase",
                }}
              >
                {post.post_type || "Post"}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: isFullyPublished ? "#166534" : "#1e40af",
                  background: isFullyPublished ? "#dcfce7" : "#dbeafe",
                  padding: "2px 8px",
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isFullyPublished ? "#16a34a" : "#2563eb",
                  }}
                />
                Status: {(post.status || "script").replace("_", " ").toUpperCase()}
              </span>
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.3,
              }}
            >
              {post.title || "Social Post Timeline & History"}
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.8rem",
                color: "#64748b",
              }}
            >
              Comprehensive lifecycle tracking: creation, rejections, rework cycles, and approvals.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e2e8f0";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY: VERTICAL TIMELINE GRAPH */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* Quick Info bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#475569" }}>
              <Layers size={15} style={{ color: "#6366f1" }} />
              <span>
                Total Events Logged: <strong>{historyEvents.length}</strong>
              </span>
            </div>

            <button
              onClick={() => setAddingNote(!addingNote)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: addingNote ? "#f1f5f9" : "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: "0.74rem",
                fontWeight: 700,
                color: "#1e293b",
                cursor: "pointer",
              }}
            >
              <Plus size={13} style={{ color: "#4f46e5" }} />
              {addingNote ? "Cancel Note" : "Add Milestone Note"}
            </button>
          </div>

          {/* Collapsible Add Note Form */}
          {addingNote && (
            <form
              onSubmit={handleAddTimelineNote}
              style={{
                background: "#f8fafc",
                border: "1px solid #c7d2fe",
                borderRadius: 12,
                padding: 14,
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#3730a3" }}>
                  Record Manual Checkpoint / Note
                </span>
                <select
                  value={newNoteAction}
                  onChange={(e) => setNewNoteAction(e.target.value)}
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    outline: "none",
                  }}
                >
                  <option value="Milestone Note">Milestone Note</option>
                  <option value="Script Reworked">Script Reworked</option>
                  <option value="Design Revision">Design Revision</option>
                  <option value="Review Feedback">Review Feedback</option>
                  <option value="QA Checkpoint">QA Checkpoint</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type explanation, revision reason, or checkpoint update..."
                required
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setAddingNote(false)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNote || !newNoteText.trim()}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "#4f46e5",
                    color: "#ffffff",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {submittingNote ? "Saving..." : "Save to Timeline"}
                </button>
              </div>
            </form>
          )}

          {/* VERTICAL TIMELINE LIST */}
          <div style={{ position: "relative" }}>
            {historyEvents.map((item, index) => {
              const isLastEvent = index === historyEvents.length - 1;
              const hasPendingAfter = pendingStages.length > 0;
              const showConnectingLine = !isLastEvent || hasPendingAfter;

              const styleMeta = getEventStyle(item.action, item.notes);
              const EventIcon = styleMeta.icon;

              return (
                <div
                  key={item.id || `evt-${index}`}
                  style={{
                    display: "flex",
                    gap: 18,
                    position: "relative",
                    paddingBottom: isLastEvent && !hasPendingAfter ? 0 : 28,
                  }}
                >
                  {/* LEFT: NODE CIRCLE & VERTICAL LINE */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 32,
                      flexShrink: 0,
                    }}
                  >
                    {/* Node Checkpoint Circle */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: styleMeta.bgColor,
                        border: `2.5px solid ${styleMeta.color}`,
                        color: styleMeta.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                        boxShadow: isLastEvent && !hasPendingAfter ? `0 0 0 4px ${styleMeta.borderColor}` : "none",
                      }}
                    >
                      <EventIcon size={14} strokeWidth={2.5} />
                    </div>

                    {/* Continuous Vertical Connecting Line */}
                    {showConnectingLine && (
                      <div
                        style={{
                          width: 3,
                          flex: 1,
                          background: "#16a34a", // Solid green connecting line for completed journey
                          minHeight: 36,
                          margin: "4px 0",
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </div>

                  {/* RIGHT: EVENT DETAILS (Title, Date, Who, Reason) */}
                  <div style={{ flex: 1, paddingTop: 1 }}>
                    {/* Milestone Header & Badge */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            fontWeight: 800,
                            color: "#0f172a",
                          }}
                        >
                          {item.action || "Milestone"}
                        </h4>

                        {/* Action Badge */}
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            color: styleMeta.badgeColor,
                            background: styleMeta.badgeBg,
                            padding: "2px 7px",
                            borderRadius: 6,
                            textTransform: "capitalize",
                          }}
                        >
                          {styleMeta.badgeLabel}
                        </span>
                      </div>

                      {/* Exact Date & Time */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.74rem",
                          fontWeight: 600,
                          color: "#64748b",
                        }}
                      >
                        <Clock size={12} style={{ color: "#94a3b8" }} />
                        <span>{formatEventDate(item.timestamp)}</span>
                      </div>
                    </div>

                    {/* "WHO" - Actor Pill */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: "0.75rem",
                        color: "#334155",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "3px 8px",
                        borderRadius: 6,
                        marginBottom: 8,
                      }}
                    >
                      <User size={12} style={{ color: "#6366f1" }} />
                      <strong style={{ color: "#0f172a" }}>
                        {item.actor_name || "Team Member"}
                      </strong>
                      {item.actor_role && (
                        <>
                          <span style={{ color: "#cbd5e1" }}>•</span>
                          <span style={{ color: "#64748b" }}>{item.actor_role}</span>
                        </>
                      )}
                    </div>

                    {/* "REASON" / FEEDBACK CALLOUT */}
                    {item.notes && item.notes.trim() && (
                      <div
                        style={{
                          background: styleMeta.bgColor,
                          border: `1px solid ${styleMeta.borderColor}`,
                          borderRadius: 10,
                          padding: "8px 12px",
                          marginTop: 2,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            color: styleMeta.color,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginBottom: 3,
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                          }}
                        >
                          <MessageSquare size={12} />
                          {styleMeta.type === "rejection"
                            ? "Critique / Rejection Reason:"
                            : styleMeta.type === "rework"
                            ? "Rework & Revision Details:"
                            : styleMeta.type === "approved"
                            ? "Approval Notes:"
                            : "Reason / Details:"}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.82rem",
                            color: "#1e293b",
                            lineHeight: 1.45,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* REMAINING / FUTURE STAGES (RENDERED IN MUTED GRAY MATCHING TRACKING GRAPH) */}
            {pendingStages.map((pStage, pIndex) => {
              const isLastPending = pIndex === pendingStages.length - 1;

              return (
                <div
                  key={`pending-${pStage.id}`}
                  style={{
                    display: "flex",
                    gap: 18,
                    position: "relative",
                    paddingBottom: isLastPending ? 0 : 26,
                    opacity: 0.55,
                  }}
                >
                  {/* Left: Gray Node & Gray Connecting Line */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: 32,
                      flexShrink: 0,
                    }}
                  >
                    {/* Inactive Gray Checkpoint Node */}
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#f1f5f9",
                        border: "2px dashed #cbd5e1",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#cbd5e1",
                        }}
                      />
                    </div>

                    {/* Gray vertical line */}
                    {!isLastPending && (
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          background: "#e2e8f0",
                          minHeight: 32,
                          margin: "4px 0",
                        }}
                      />
                    )}
                  </div>

                  {/* Right: Inactive Milestone Label & Pending Indicator */}
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        {pStage.label}
                      </h4>

                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          background: "#f8fafc",
                          padding: "2px 7px",
                          borderRadius: 6,
                          border: "1px dashed #cbd5e1",
                        }}
                      >
                        Pending Milestone
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.74rem",
                        color: "#94a3b8",
                        marginTop: 2,
                      }}
                    >
                      Awaiting stage completion
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
            Post ID: #{post.id} • Created: {formatEventDate(post.created_at)}
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1e293b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0f172a";
            }}
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
}
