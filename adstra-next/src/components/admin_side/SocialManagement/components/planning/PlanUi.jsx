"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ title, subtitle, onClose, children, footer, width = 560 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="pl-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="pl-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="pl-modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="pl-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="pl-modal-body">{children}</div>
        {footer && <div className="pl-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, hint, children, span = 1 }) {
  return (
    <label className="pl-field" style={span === 2 ? { gridColumn: "1 / -1" } : undefined}>
      <span className="pl-field-label">{label}</span>
      {children}
      {hint && <span className="pl-field-hint">{hint}</span>}
    </label>
  );
}

export function Pill({ color = "#475569", bg = "#f1f5f9", children, title, icon: Icon }) {
  return (
    <span className="pl-pill" style={{ color, background: bg }} title={title}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="pl-empty">
      {Icon && <Icon size={34} strokeWidth={1.5} />}
      <h4>{title}</h4>
      {children}
    </div>
  );
}

export function MemberSelect({ members, value, onChange, placeholder = "Unassigned" }) {
  return (
    <select className="pl-input" value={value || ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
      <option value="">{placeholder}</option>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
          {m.designation ? ` · ${m.designation}` : ""}
        </option>
      ))}
    </select>
  );
}
