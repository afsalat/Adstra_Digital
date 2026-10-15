"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  RotateCcw,
  Ban,
  CheckCircle2,
  History,
  ArrowRight,
  AlertTriangle,
  Play,
  FileText,
  CalendarClock,
  Trash2,
  RefreshCw,
  MessageSquareWarning,
  Building2,
  Users,
} from "lucide-react";

/* ─────────────────────────── Shared vocabulary ─────────────────────────── */

export const STAGE_LABELS = {
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
  rejected: "Revisions",
};

const SCRIPT_REASONS = [
  "Weak hook",
  "Off-brand tone",
  "Unclear message / CTA",
  "Not aligned with brief",
  "Factual error",
  "Too long / too short",
  "Grammar / language",
  "Other",
];

const DESIGN_REASONS = [
  "Typography",
  "Colors / branding",
  "Layout / composition",
  "Image quality",
  "Video editing / pacing",
  "Audio / music",
  "Caption / copy",
  "Wrong size / format",
  "Logo / contact details",
  "Product / offer details",
  "Other",
];

export const REJECTION_REASONS = [
  "Concept not relevant",
  "Off-brand / wrong tone",
  "Client changed plans",
  "Inaccurate / misleading info",
  "Legal / compliance risk",
  "Poor creative quality",
  "Duplicate / similar content",
  "Timing missed / outdated",
  "Budget / scope change",
  "Other",
];

const REVISION_MODES = {
  script: {
    title: "Request Script Rework",
    subtitle: "Send the script back to the copywriter with clear critique.",
    from: "script_approval",
    to: "script",
    color: "#7c3aed",
    soft: "#f5f3ff",
    border: "#ddd6fe",
    reasons: SCRIPT_REASONS,
    submitLabel: "Send back to Scripts",
    placeholder: "What exactly needs to change? e.g. Hook is generic — open with the 21-day sun-drying fact. CTA should push the WhatsApp order link.",
  },
  qa: {
    title: "QA Failed — Send Back to Design",
    subtitle: "Internal quality check did not pass. The designer gets these notes on the post.",
    from: "team_review",
    to: "designing",
    color: "#d97706",
    soft: "#fffbeb",
    border: "#fde68a",
    reasons: DESIGN_REASONS,
    submitLabel: "Send back to Designing",
    placeholder: "Be specific: which slide / timestamp, what is wrong, and what it should look like.",
  },
  client: {
    title: "Client Requested Changes",
    subtitle: "Log the client's feedback. The post loops back to Designing, then Team Review, then the client again.",
    from: "client_review",
    to: "designing",
    color: "#ea580c",
    soft: "#fff7ed",
    border: "#fed7aa",
    reasons: DESIGN_REASONS,
    submitLabel: "Send back to Designing",
    placeholder: "Write the client's requested changes exactly. e.g. Slide 3: replace stock photo with clinic interior. Use the new phone number.",
  },
};

// QA / client revisions can target the creative only, or the script itself.
// A script rework goes Scripts → Approval → Designing → Team Review → Client.
const REVISION_SCOPES = [
  { id: "design", label: "Design only", desc: "Script is fine — fix the creative" },
  { id: "script", label: "Script / copy rework", desc: "Rewrite & re-approve script, then redesign" },
];

const SCRIPT_SCOPE_PLACEHOLDER =
  "What must change in the script? e.g. Hook should lead with the free-consult offer. Replace claim in line 2. The design will be redone after the new script is approved.";

/* ─────────────────────────── Helpers ─────────────────────────── */

const isVideo = (post, url) =>
  ["reel", "video"].includes(post?.post_type) || /\.(mp4|mov|webm)(\?|$)/i.test(url || "");

const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

/** Revision / rejection events from the audit trail, newest first. */
export function getFeedbackEvents(post) {
  return (post?.approval_history || []).filter((h) => {
    if (h.event_type === "revision" || h.event_type === "rejection") return true;
    const a = (h.action || "").toLowerCase();
    return a.includes("reject") || a.includes("changes") || a.includes("rework requested");
  });
}

function Chip({ active, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: "6px 11px",
        borderRadius: 999,
        border: `1px solid ${active ? color : "#e2e8f0"}`,
        background: active ? color : "#ffffff",
        color: active ? "#ffffff" : "#334155",
        fontSize: "0.76rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.12s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {active && <CheckCircle2 size={12} />}
      {label}
    </button>
  );
}

function FieldLabel({ children, required, hint }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 8 }}>
      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#334155" }}>
        {children}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </span>
      {hint && <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{hint}</span>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  fontSize: "0.85rem",
  outline: "none",
  fontFamily: "inherit",
  color: "#0f172a",
  background: "#ffffff",
  boxSizing: "border-box",
};

/* ─────────────────────────── Shell ─────────────────────────── */

function ModalShell({ icon: Icon, color, soft, title, subtitle, onClose, children, footer, width = 640 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="social-modal-overlay"
      onClick={onClose}
      style={{ zIndex: 1200, animation: "wdmFade 0.15s ease" }}
    >
      <style>{`
        @keyframes wdmFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes wdmPop { from { opacity: 0; transform: translateY(12px) scale(0.98) } to { opacity: 1; transform: none } }
        .wdm-textarea:focus, .wdm-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width,
          maxWidth: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 70px -15px rgba(15, 23, 42, 0.4)",
          overflow: "hidden",
          animation: "wdmPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 12, alignItems: "flex-start", background: `linear-gradient(180deg, ${soft} 0%, #ffffff 100%)` }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#ffffff", border: `1px solid ${color}33`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 800, color: "#0f172a" }}>{title}</h3>
            {subtitle && <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#64748b", lineHeight: 1.45 }}>{subtitle}</p>}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "18px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {footer}
        </div>
      </div>
    </div>
  );
}

function PostSummary({ post, onOpenTimeline }) {
  const url = post?.media_urls?.[0];
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, border: "1px solid #e2e8f0", borderRadius: 14, background: "#f8fafc" }}>
      <div style={{ width: 58, height: 58, borderRadius: 10, overflow: "hidden", background: "#0f172a", flexShrink: 0, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url ? (
          isVideo(post, url) ? (
            <>
              <video src={url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <Play size={16} fill="#fff" color="#fff" style={{ position: "absolute" }} />
            </>
          ) : (
            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )
        ) : (
          <FileText size={22} color="#94a3b8" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {post?.title || "Untitled Post"}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: post?.client_primary_color || "#4338ca" }}>{post?.client_name || "Client"}</span>
          <span>•</span>
          <span style={{ textTransform: "uppercase", fontWeight: 700 }}>{post?.post_type}</span>
          {(post?.platforms || []).length > 0 && (
            <>
              <span>•</span>
              <span style={{ textTransform: "capitalize" }}>{post.platforms.join(", ")}</span>
            </>
          )}
        </div>
        {(post?.primary_caption || post?.script_notes) && (
          <div style={{ fontSize: "0.76rem", color: "#475569", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {post.primary_caption || post.script_notes}
          </div>
        )}
      </div>
      {onOpenTimeline && (
        <button
          type="button"
          onClick={() => onOpenTimeline(post)}
          style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 9px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff", color: "#334155", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          <History size={12} color="#16a34a" /> Timeline
        </button>
      )}
    </div>
  );
}

function RouteStrip({ from, to, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.76rem", fontWeight: 700, color: "#475569", flexWrap: "wrap" }}>
      <span style={{ padding: "4px 10px", borderRadius: 8, background: "#f1f5f9" }}>{STAGE_LABELS[from] || from}</span>
      <ArrowRight size={14} color={color} />
      <span style={{ padding: "4px 10px", borderRadius: 8, background: `${color}14`, color }}>{STAGE_LABELS[to] || to}</span>
    </div>
  );
}

function PreviousFeedback({ post }) {
  const events = getFeedbackEvents(post).slice(0, 3);
  if (!events.length) return null;
  return (
    <div>
      <FieldLabel hint={`${getFeedbackEvents(post).length} total`}>Previous feedback on this post</FieldLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {events.map((ev) => (
          <div key={ev.id} style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #fee2e2", background: "#fffafa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "0.72rem", color: "#991b1b", fontWeight: 800 }}>
              <span>
                {ev.revision_round ? `Round ${ev.revision_round} • ` : ""}
                {ev.action}
              </span>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>{fmtDate(ev.timestamp)}</span>
            </div>
            {(ev.reason_categories || []).length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                {ev.reason_categories.map((c) => (
                  <span key={c} style={{ fontSize: "0.66rem", fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c" }}>
                    {c}
                  </span>
                ))}
              </div>
            )}
            <div style={{ fontSize: "0.78rem", color: "#334155", marginTop: 4, lineHeight: 1.45 }}>{ev.notes}</div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 3 }}>— {ev.actor_name}{ev.actor_role ? `, ${ev.actor_role}` : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btn = (bg, color = "#ffffff", border = "none") => ({
  padding: "9px 18px",
  borderRadius: 10,
  border,
  background: bg,
  color,
  fontSize: "0.84rem",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  whiteSpace: "nowrap",
});

/* ─────────────────────────── Revision request ─────────────────────────── */

export function RevisionRequestModal({ post, mode = "client", submitting, onClose, onSubmit, onOpenTimeline, onSwitchToReject }) {
  const baseCfg = REVISION_MODES[mode] || REVISION_MODES.client;
  const canPickScope = mode === "qa" || mode === "client";
  const [scope, setScope] = useState("design");
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [requestedBy, setRequestedBy] = useState(mode === "client" ? `${post?.client_name || "Client"}` : "");
  const [touched, setTouched] = useState(false);

  const scriptScope = canPickScope && scope === "script";
  const cfg = scriptScope
    ? {
        ...baseCfg,
        to: "script",
        reasons: SCRIPT_REASONS,
        submitLabel: "Send back to Scripts",
        placeholder: SCRIPT_SCOPE_PLACEHOLDER,
        subtitle: "The script is rewritten and re-approved, then the design is redone, checked by the team and sent to the client again.",
      }
    : baseCfg;

  const changeScope = (next) => {
    if (next === scope) return;
    setScope(next);
    setCategories([]); // reason lists differ per scope
  };

  const round = (post?.revision_count || 0) + 1;
  const clientRound = (post?.client_revision_count || 0) + (mode === "client" ? 1 : 0);
  const valid = notes.trim().length > 0 && categories.length > 0;

  const toggle = (c) => setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = () => {
    setTouched(true);
    if (!valid || submitting) return;
    onSubmit({ notes: notes.trim(), categories, severity, requestedBy: requestedBy.trim(), scope: canPickScope ? scope : mode === "script" ? "script" : "design" });
  };

  return (
    <ModalShell
      icon={RotateCcw}
      color={cfg.color}
      soft={cfg.soft}
      title={cfg.title}
      subtitle={cfg.subtitle}
      onClose={onClose}
      footer={
        <>
          {onSwitchToReject && (
            <button
              type="button"
              onClick={onSwitchToReject}
              style={{ background: "transparent", border: "none", color: "#b91c1c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, padding: 0 }}
            >
              <Ban size={13} /> Rejecting the whole post instead?
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} style={btn("#ffffff", "#334155", "1px solid #cbd5e1")}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            style={{ ...btn(cfg.color), opacity: valid && !submitting ? 1 : 0.55, cursor: submitting ? "wait" : "pointer" }}
          >
            <RotateCcw size={14} /> {submitting ? "Sending..." : cfg.submitLabel}
          </button>
        </>
      }
    >
      <PostSummary post={post} onOpenTimeline={onOpenTimeline} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <RouteStrip from={cfg.from} to={cfg.to} color={cfg.color} />
        <span style={{ fontSize: "0.74rem", fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: round >= 3 ? "#fef2f2" : "#f1f5f9", color: round >= 3 ? "#b91c1c" : "#475569" }}>
          Revision round #{round}
          {mode === "client" && clientRound > 1 ? ` • client round #${clientRound}` : ""}
        </span>
      </div>

      {round >= 3 && (
        <div style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: "0.78rem", lineHeight: 1.45 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            This post has already gone back {round - 1} time{round - 1 > 1 ? "s" : ""}. A short call with {mode === "client" ? "the client" : "the team"} to agree the direction may be faster than another round.
          </span>
        </div>
      )}

      {mode === "client" && (
        <div>
          <FieldLabel hint="Shown on the timeline as the requester">Requested by</FieldLabel>
          <input className="wdm-input" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="Client contact name" style={inputStyle} />
        </div>
      )}

      {canPickScope && (
        <div>
          <FieldLabel hint="Decides which stage the post returns to">What needs revising?</FieldLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {REVISION_SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => changeScope(s.id)}
                aria-pressed={scope === s.id}
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1.5px solid ${scope === s.id ? cfg.color : "#e2e8f0"}`,
                  background: scope === s.id ? cfg.soft : "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  gap: 9,
                }}
              >
                {s.id === "script" ? (
                  <FileText size={16} color={scope === s.id ? cfg.color : "#64748b"} style={{ flexShrink: 0, marginTop: 1 }} />
                ) : (
                  <RotateCcw size={16} color={scope === s.id ? cfg.color : "#64748b"} style={{ flexShrink: 0, marginTop: 1 }} />
                )}
                <span>
                  <span style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>{s.label}</span>
                  <span style={{ display: "block", fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{s.desc}</span>
                </span>
              </button>
            ))}
          </div>
          {scriptScope && (
            <div style={{ marginTop: 8, fontSize: "0.74rem", color: "#475569", lineHeight: 1.45 }}>
              Path: Scripts → Approval → Designing → Team Review → Client Review. Counted as a revision, not a rejection.
            </div>
          )}
        </div>
      )}

      <div>
        <FieldLabel required hint="Pick all that apply — used in reports">What needs to change?</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {cfg.reasons.map((r) => (
            <Chip key={r} label={r} active={categories.includes(r)} color={cfg.color} onClick={() => toggle(r)} />
          ))}
        </div>
        {touched && categories.length === 0 && <div style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 6 }}>Select at least one area.</div>}
      </div>

      <div>
        <FieldLabel>How big is the change?</FieldLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "minor", label: "Minor tweaks", desc: "Small fixes, same concept" },
            { id: "major", label: "Major rework", desc: scriptScope ? "Significant rewrite" : "Significant redesign / re-edit" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSeverity(s.id)}
              aria-pressed={severity === s.id}
              style={{
                flex: 1,
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1.5px solid ${severity === s.id ? cfg.color : "#e2e8f0"}`,
                background: severity === s.id ? cfg.soft : "#ffffff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>{s.label}</div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel required hint={`${notes.length}/1000`}>Detailed feedback</FieldLabel>
        <textarea
          className="wdm-textarea"
          rows={4}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={cfg.placeholder}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, borderColor: touched && !notes.trim() ? "#fca5a5" : "#cbd5e1" }}
          autoFocus
        />
        {touched && !notes.trim() && <div style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 6 }}>Feedback is required so the team knows what to fix.</div>}
      </div>

      <PreviousFeedback post={post} />
    </ModalShell>
  );
}

/* ─────────────────────────── Full rejection ─────────────────────────── */

export function RejectContentModal({ post, defaultRejectedBy = "client", submitting, onClose, onSubmit, onOpenTimeline }) {
  const [rejectedBy, setRejectedBy] = useState(defaultRejectedBy);
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState("drop");
  const [touched, setTouched] = useState(false);

  const valid = notes.trim().length > 0 && categories.length > 0;
  const toggle = (c) => setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = () => {
    setTouched(true);
    if (!valid || submitting) return;
    onSubmit({ notes: notes.trim(), categories, rejectedBy, outcome });
  };

  return (
    <ModalShell
      icon={Ban}
      color="#dc2626"
      soft="#fef2f2"
      title="Reject Entire Content"
      subtitle="Use this when the concept, script or creative is turned down completely — not for small changes."
      onClose={onClose}
      footer={
        <>
          <div style={{ flex: 1, fontSize: "0.72rem", color: "#64748b" }}>Recorded on the timeline and counted in reports.</div>
          <button type="button" onClick={onClose} style={btn("#ffffff", "#334155", "1px solid #cbd5e1")}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            style={{ ...btn("#dc2626"), opacity: valid && !submitting ? 1 : 0.55, cursor: submitting ? "wait" : "pointer" }}
          >
            <Ban size={14} /> {submitting ? "Rejecting..." : outcome === "drop" ? "Reject & Drop" : "Reject & Restart Script"}
          </button>
        </>
      }
    >
      <PostSummary post={post} onOpenTimeline={onOpenTimeline} />

      <div>
        <FieldLabel>Rejected by</FieldLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "client", label: "Client", icon: Building2 },
            { id: "internal", label: "Internal team", icon: Users },
          ].map((o) => {
            const Icon = o.icon;
            const active = rejectedBy === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setRejectedBy(o.id)}
                aria-pressed={active}
                style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${active ? "#dc2626" : "#e2e8f0"}`, background: active ? "#fef2f2" : "#ffffff", color: active ? "#b91c1c" : "#334155", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Icon size={15} /> {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel required hint="Pick all that apply — used in reports">Reason for rejection</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {REJECTION_REASONS.map((r) => (
            <Chip key={r} label={r} active={categories.includes(r)} color="#dc2626" onClick={() => toggle(r)} />
          ))}
        </div>
        {touched && categories.length === 0 && <div style={{ fontSize: "0.72rem", color: "#dc2626", marginTop: 6 }}>Select at least one reason.</div>}
      </div>

      <div>
        <FieldLabel required hint={`${notes.length}/1000`}>Explain the rejection</FieldLabel>
        <textarea
          className="wdm-textarea"
          rows={4}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did the client / reviewer say? What should the next concept do differently?"
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5, borderColor: touched && !notes.trim() ? "#fca5a5" : "#cbd5e1" }}
          autoFocus
        />
      </div>

      <div>
        <FieldLabel>What happens next?</FieldLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { id: "drop", icon: Trash2, label: "Drop this content", desc: "Moves to the Rejected list. Can be restored later." },
            { id: "restart", icon: RefreshCw, label: "Restart from a new script", desc: "Goes back to Scripts with this reason attached." },
          ].map((o) => {
            const Icon = o.icon;
            const active = outcome === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setOutcome(o.id)}
                aria-pressed={active}
                style={{ flex: "1 1 220px", textAlign: "left", padding: "11px 12px", borderRadius: 12, border: `1.5px solid ${active ? "#dc2626" : "#e2e8f0"}`, background: active ? "#fef2f2" : "#ffffff", cursor: "pointer", display: "flex", gap: 10 }}
              >
                <Icon size={17} color={active ? "#dc2626" : "#64748b"} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <span style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>{o.label}</span>
                  <span style={{ display: "block", fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{o.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <PreviousFeedback post={post} />
    </ModalShell>
  );
}

/* ─────────────────────────── Approve & schedule / reschedule ─────────────────────────── */

const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function ApproveScheduleModal({ post, mode = "approve", submitting, onClose, onSubmit, onOpenTimeline }) {
  const isReschedule = mode === "reschedule";
  const [scheduledAt, setScheduledAt] = useState(toLocalInput(post?.scheduled_at));
  const [approvedBy, setApprovedBy] = useState(post?.client_name || "Client");
  const [notes, setNotes] = useState("");

  const isPast = useMemo(() => scheduledAt && new Date(scheduledAt) < new Date(), [scheduledAt]);
  const revisions = post?.revision_count || 0;

  const quick = (days, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    setScheduledAt(toLocalInput(d.toISOString()));
  };

  const submit = () => {
    if (submitting) return;
    if (isReschedule && !scheduledAt) return;
    const iso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    onSubmit({ scheduledAt: iso, notes: notes.trim(), approvedBy: approvedBy.trim() });
  };

  return (
    <ModalShell
      icon={isReschedule ? CalendarClock : CheckCircle2}
      color={isReschedule ? "#0284c7" : "#059669"}
      soft={isReschedule ? "#f0f9ff" : "#ecfdf5"}
      title={isReschedule ? "Reschedule Post" : "Client Approved — Schedule Post"}
      subtitle={isReschedule ? "Pick a new publish date & time." : "Confirm the go-live slot. The post moves to Approved / Post Schedule."}
      onClose={onClose}
      width={560}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} style={btn("#ffffff", "#334155", "1px solid #cbd5e1")}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || (isReschedule && !scheduledAt)}
            style={{ ...btn(isReschedule ? "#0284c7" : "#059669"), opacity: submitting || (isReschedule && !scheduledAt) ? 0.55 : 1 }}
          >
            {isReschedule ? <CalendarClock size={14} /> : <CheckCircle2 size={14} />}
            {submitting ? "Saving..." : isReschedule ? "Save new time" : scheduledAt ? "Approve & Schedule" : "Approve (schedule later)"}
          </button>
        </>
      }
    >
      <PostSummary post={post} onOpenTimeline={onOpenTimeline} />

      {!isReschedule && (
        <div style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, background: revisions ? "#fffbeb" : "#ecfdf5", border: `1px solid ${revisions ? "#fde68a" : "#a7f3d0"}`, fontSize: "0.78rem", color: revisions ? "#92400e" : "#065f46" }}>
          <MessageSquareWarning size={16} style={{ flexShrink: 0 }} />
          <span>
            {revisions
              ? `Approved after ${revisions} revision round${revisions > 1 ? "s" : ""} (${post?.client_revision_count || 0} from client).`
              : "First-time approval — no revision rounds."}
          </span>
        </div>
      )}

      {!isReschedule && (
        <div>
          <FieldLabel>Approved by</FieldLabel>
          <input className="wdm-input" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} style={inputStyle} />
        </div>
      )}

      <div>
        <FieldLabel required={isReschedule} hint="Your local time">Publish date & time</FieldLabel>
        <input className="wdm-input" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} style={inputStyle} />
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {[
            { label: "Today 6 PM", d: 0, h: 18 },
            { label: "Tomorrow 10 AM", d: 1, h: 10 },
            { label: "Tomorrow 6 PM", d: 1, h: 18 },
            { label: "In 3 days 10 AM", d: 3, h: 10 },
          ].map((q) => (
            <button key={q.label} type="button" onClick={() => quick(q.d, q.h)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "0.72rem", fontWeight: 700, color: "#334155", cursor: "pointer" }}>
              {q.label}
            </button>
          ))}
        </div>
        {isPast && (
          <div style={{ marginTop: 8, fontSize: "0.74rem", color: "#b45309", display: "flex", alignItems: "center", gap: 5 }}>
            <AlertTriangle size={13} /> This time is in the past — the post will show as overdue.
          </div>
        )}
      </div>

      {!isReschedule && (
        <div>
          <FieldLabel hint="Optional">Sign-off notes</FieldLabel>
          <textarea className="wdm-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Approved on WhatsApp by Dr. Meera" style={{ ...inputStyle, resize: "vertical" }} />
        </div>
      )}
    </ModalShell>
  );
}
