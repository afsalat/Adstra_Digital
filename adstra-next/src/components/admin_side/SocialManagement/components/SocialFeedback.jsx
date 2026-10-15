"use client";

/**
 * In-app feedback for the Social Management module.
 *  - toast.success / toast.error / toast.info / toast.warning  → stacked toasts (bottom-right)
 *  - confirmDialog({ title, message, confirmLabel, tone })     → Promise<boolean>, replaces window.confirm
 * Mount <SocialFeedbackHost /> once (done in SocialManagement.jsx). Calls made while no host is
 * mounted fall back to the native dialogs (errors/warnings/confirms) or the console (info/success).
 */

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

let toastListener = null;
let confirmListener = null;
let idSeq = 0;

function push(type, message, opts = {}) {
  if (!message) return;
  const item = { id: ++idSeq, type, message: String(message), title: opts.title, duration: opts.duration ?? (type === "error" ? 6000 : 3800) };
  if (toastListener) toastListener(item);
  else if (typeof window !== "undefined" && (type === "error" || type === "warning")) window.alert(item.message);
  else console.log(`[social:${type}]`, message);
}

export const toast = {
  success: (msg, opts) => push("success", msg, opts),
  error: (msg, opts) => push("error", msg, opts),
  warning: (msg, opts) => push("warning", msg, opts),
  info: (msg, opts) => push("info", msg, opts),
};

export function confirmDialog({ title = "Are you sure?", message = "", confirmLabel = "Confirm", cancelLabel = "Cancel", tone = "primary" } = {}) {
  return new Promise((resolve) => {
    if (!confirmListener) {
      resolve(typeof window !== "undefined" ? window.confirm(message || title) : false);
      return;
    }
    confirmListener({ title, message, confirmLabel, cancelLabel, tone, resolve });
  });
}

/** Drop-in for window.alert: infers the toast tone from the wording. */
export function notify(message) {
  const m = String(message || "");
  if (/error|fail|could not|unable|invalid/i.test(m)) return toast.error(m);
  if (/^please|requires|cannot|must|select|enter /i.test(m)) return toast.warning(m);
  if (/copied|success|saved|done/i.test(m)) return toast.success(m);
  return toast.info(m);
}

/** Drop-in for window.confirm (await it): infers tone and button label from the wording. */
export function askConfirm(message, opts = {}) {
  const m = String(message || "");
  let tone = "primary";
  let confirmLabel = "Confirm";
  const destructive = m.match(/\b(delete|remove|disconnect|reset)\b/i);
  if (destructive) {
    tone = "danger";
    confirmLabel = destructive[1][0].toUpperCase() + destructive[1].slice(1).toLowerCase();
  } else if (/publish/i.test(m)) {
    tone = "sky";
    confirmLabel = "Publish Now";
  }
  return confirmDialog({ title: "Please confirm", message: m, confirmLabel, tone, ...opts });
}

/** Extracts a readable message from an axios error. */
export function apiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;
  if (data) {
    if (typeof data === "string") {
      const match = data.match(/<pre class="exception_value">([^<]+)<\/pre>/);
      return match ? match[1] : `Server error (${err.response.status})`;
    }
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (typeof data === "object") {
      return Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join(" | ");
    }
  }
  return err?.message || fallback;
}

const TONES = {
  success: { icon: CheckCircle2, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", title: "Done" },
  error: { icon: XCircle, color: "#dc2626", bg: "#fef2f2", border: "#fecaca", title: "Something went wrong" },
  warning: { icon: AlertTriangle, color: "#d97706", bg: "#fffbeb", border: "#fde68a", title: "Heads up" },
  info: { icon: Info, color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", title: "Info" },
};

const CONFIRM_TONES = {
  primary: { bg: "#4f46e5", icon: Info, iconBg: "#eef2ff" },
  danger: { bg: "#dc2626", icon: AlertTriangle, iconBg: "#fef2f2" },
  success: { bg: "#059669", icon: CheckCircle2, iconBg: "#ecfdf5" },
  sky: { bg: "#0284c7", icon: Info, iconBg: "#f0f9ff" },
};

function ToastItem({ item, onClose }) {
  const tone = TONES[item.type] || TONES.info;
  const Icon = tone.icon;
  useEffect(() => {
    const t = setTimeout(() => onClose(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item, onClose]);

  return (
    <div
      role="status"
      className="sf-toast"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: "#ffffff",
        border: `1px solid ${tone.border}`,
        borderLeft: `4px solid ${tone.color}`,
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 12px 32px -8px rgba(15, 23, 42, 0.25)",
        width: 360,
        maxWidth: "calc(100vw - 32px)",
        pointerEvents: "auto",
      }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 8, background: tone.bg, color: tone.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>{item.title || tone.title}</div>
        <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: 2, lineHeight: 1.45, wordBreak: "break-word" }}>{item.message}</div>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onClose(item.id)}
        style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2 }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function SocialFeedbackHost() {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  useEffect(() => {
    toastListener = (item) => setToasts((prev) => [...prev.slice(-3), item]);
    confirmListener = (cfg) => setConfirmState(cfg);
    return () => {
      toastListener = null;
      confirmListener = null;
    };
  }, []);

  const closeConfirm = (result) => {
    if (confirmState) confirmState.resolve(result);
    setConfirmState(null);
  };

  useEffect(() => {
    if (!confirmState) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeConfirm(false);
      if (e.key === "Enter") closeConfirm(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmState]);

  const cTone = CONFIRM_TONES[confirmState?.tone] || CONFIRM_TONES.primary;
  const CIcon = cTone.icon;

  return (
    <>
      <style>{`
        @keyframes sfToastIn { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes sfFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sfPopIn { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }
        .sf-toast { animation: sfToastIn 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      <div
        className="no-print"
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 200000, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onClose={remove} />
        ))}
      </div>

      {confirmState && (
        <div
          className="no-print"
          onClick={() => closeConfirm(false)}
          style={{ position: "fixed", inset: 0, zIndex: 200001, background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "sfFadeIn 0.15s ease" }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#ffffff", borderRadius: 18, width: 440, maxWidth: "100%", padding: 22, boxShadow: "0 24px 60px -12px rgba(15, 23, 42, 0.35)", animation: "sfPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: cTone.iconBg, color: cTone.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CIcon size={21} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>{confirmState.title}</h3>
                {confirmState.message && (
                  <p style={{ margin: "6px 0 0", fontSize: "0.86rem", color: "#475569", lineHeight: 1.5 }}>{confirmState.message}</p>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff", color: "#334155", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}
              >
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => closeConfirm(true)}
                style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: cTone.bg, color: "#ffffff", fontSize: "0.84rem", fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px -6px ${cTone.bg}` }}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
