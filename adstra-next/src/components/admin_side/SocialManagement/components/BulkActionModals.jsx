"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Search, UserX, CalendarClock } from "lucide-react";
import { ASSIGNEE_ROLES, initials, loadTeamMembers, plural } from "./workflowUtils";

function ModalShell({ title, subtitle, icon: Icon, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="social-modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div className="social-modal-content bulk-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="bulk-modal-head">
          <span className="bulk-modal-icon">
            <Icon size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="ppd-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="bulk-modal-body">{children}</div>
        <div className="bulk-modal-foot">{footer}</div>
      </div>
    </div>
  );
}

export function BulkAssignModal({ count, onClose, onConfirm }) {
  const [role, setRole] = useState("designer");
  const [team, setTeam] = useState(null);
  const [query, setQuery] = useState("");
  const [choice, setChoice] = useState(undefined); // user id, null = unassign, undefined = nothing picked

  useEffect(() => {
    loadTeamMembers().then(setTeam);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (team || []).filter(
      (m) => !q || m.name.toLowerCase().includes(q) || m.username.toLowerCase().includes(q) || (m.designation || "").toLowerCase().includes(q)
    );
  }, [team, query]);

  const roleLabel = ASSIGNEE_ROLES.find((r) => r.id === role)?.label;
  const picked = choice === null ? "nobody" : (team || []).find((m) => m.id === choice)?.name;

  return (
    <ModalShell
      title="Assign selected posts"
      subtitle={`Applies to ${plural(count, "post")}.`}
      icon={Search}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="bulk-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="bulk-btn-primary" disabled={choice === undefined} onClick={() => onConfirm(role, choice)}>
            {choice === undefined ? "Pick a team member" : choice === null ? `Unassign ${roleLabel}` : `Set ${roleLabel}: ${picked}`}
          </button>
        </>
      }
    >
      <div className="bulk-role-tabs" role="tablist">
        {ASSIGNEE_ROLES.map((r) => (
          <button key={r.id} type="button" role="tab" aria-selected={role === r.id} className={role === r.id ? "active" : ""} onClick={() => setRole(r.id)}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="bulk-search">
        <Search size={14} />
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team members…" />
      </div>

      <ul className="bulk-member-list">
        <li>
          <button type="button" className={choice === null ? "active" : ""} onClick={() => setChoice(null)}>
            <span className="ppd-avatar ppd-avatar-sm bulk-avatar-none">
              <UserX size={12} />
            </span>
            <span className="bulk-member-name">Unassigned</span>
            <span className="bulk-member-sub">Clear the {roleLabel?.toLowerCase()}</span>
          </button>
        </li>
        {team === null ? (
          <li className="bulk-member-empty">Loading team…</li>
        ) : filtered.length === 0 ? (
          <li className="bulk-member-empty">No team members match “{query}”.</li>
        ) : (
          filtered.map((m) => (
            <li key={m.id}>
              <button type="button" className={choice === m.id ? "active" : ""} onClick={() => setChoice(m.id)}>
                <span className="ppd-avatar ppd-avatar-sm">{initials(m.name)}</span>
                <span className="bulk-member-name">{m.name}</span>
                <span className="bulk-member-sub">{m.designation || m.role}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </ModalShell>
  );
}

const toLocalInput = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function BulkRescheduleModal({ posts, onClose, onConfirm }) {
  const [mode, setMode] = useState("set");
  const [when, setWhen] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    d.setHours(10, 0, 0, 0);
    return toLocalInput(d);
  });
  const [days, setDays] = useState(1);

  const dated = posts.filter((p) => p.scheduled_at).length;
  const valid = mode === "set" ? Boolean(when) : Number.isInteger(Number(days)) && Number(days) !== 0 && dated > 0;

  return (
    <ModalShell
      title="Reschedule selected posts"
      subtitle={`${plural(posts.length, "post")} selected.`}
      icon={CalendarClock}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="bulk-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="bulk-btn-primary"
            disabled={!valid}
            onClick={() => onConfirm(mode === "set" ? { mode, at: new Date(when) } : { mode, days: Number(days) })}
          >
            {mode === "set" ? `Set ${plural(posts.length, "post")}` : `Shift ${plural(dated, "post")}`}
          </button>
        </>
      }
    >
      <label className={`bulk-option ${mode === "set" ? "active" : ""}`}>
        <input type="radio" name="bulk-resched" checked={mode === "set"} onChange={() => setMode("set")} />
        <span>
          <strong>Same date & time for all</strong>
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} onFocus={() => setMode("set")} />
        </span>
      </label>

      <label className={`bulk-option ${mode === "shift" ? "active" : ""}`}>
        <input type="radio" name="bulk-resched" checked={mode === "shift"} onChange={() => setMode("shift")} />
        <span>
          <strong>Shift each post's current date</strong>
          <span className="bulk-shift">
            by
            <input type="number" value={days} step={1} onChange={(e) => setDays(e.target.value)} onFocus={() => setMode("shift")} />
            days <em>(negative moves earlier)</em>
          </span>
          {dated < posts.length && (
            <em className="bulk-note">
              {plural(posts.length - dated, "post")} without a post date will be skipped.
            </em>
          )}
        </span>
      </label>
    </ModalShell>
  );
}
