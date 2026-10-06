"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import { AlertCircle, CalendarDays, CheckCircle2, ExternalLink, MessageSquare, Star } from "lucide-react";

const TYPE_COLORS = {
  reel: "#db2777",
  video: "#7c3aed",
  image: "#0284c7",
  carousel: "#ea580c",
  text: "#475569",
};

const card = { background: "#ffffff", borderRadius: 18, padding: "22px 26px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: 18 };

function PlanReviewContent() {
  const token = useSearchParams().get("token");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState(null); // null | 'changes'
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No plan token was provided in the link.");
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE_URL}/social/plan-review/${token}/`)
      .then((res) => setPlan(res.data))
      .catch((err) => setError(err.response?.data?.error || "This plan link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  const byWeek = useMemo(() => {
    if (!plan) return [];
    const groups = {};
    const sorted = [...plan.items].sort((a, b) => (a.planned_date || "9999").localeCompare(b.planned_date || "9999"));
    sorted.forEach((i) => {
      let key = "Date to be confirmed";
      if (i.planned_date) {
        const d = new Date(`${i.planned_date}T00:00:00`);
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        key = `Week of ${monday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
      }
      (groups[key] = groups[key] || []).push(i);
    });
    return Object.entries(groups);
  }, [plan]);

  const submit = async (action) => {
    setFormError("");
    if (action === "request_changes" && !notes.trim()) {
      setFormError("Please tell us what you'd like changed.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/social/plan-review/${token}/`, { action, notes, reviewer_name: name });
      setDone(res.data);
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: "36px 16px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>{children}</div>
    </div>
  );

  if (loading) return shell(<p style={{ textAlign: "center", color: "#64748b" }}>Loading your content plan…</p>);

  if (error || !plan) {
    return shell(
      <div style={{ ...card, textAlign: "center", maxWidth: 480, margin: "60px auto" }}>
        <AlertCircle size={34} color="#ef4444" />
        <h2 style={{ fontSize: "1.2rem", color: "#0f172a", margin: "12px 0 6px" }}>Plan link not found</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{error}</p>
      </div>
    );
  }

  const monthName = new Date(`${plan.month}T00:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const waiting = plan.status === "sent" && !done;
  const brief = [
    ["Goals", plan.brief_goals],
    ["Offers & promotions", plan.brief_offers],
    ["Focus", plan.brief_focus],
    ["Notes", plan.brief_notes],
  ].filter(([, v]) => v);

  return shell(
    <>
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, #0f766e, #4f46e5)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "1.2rem",
            overflow: "hidden",
          }}
        >
          {plan.client_logo ? <img src={plan.client_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : plan.client_name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{plan.client_name} · Content plan</h1>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "3px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarDays size={14} /> {monthName} · prepared by Adstra Digital
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {plan.quotas.map((q) => (
            <span
              key={q.post_type}
              style={{ padding: "6px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.82rem", fontWeight: 700, color: TYPE_COLORS[q.post_type] || "#334155" }}
            >
              {q.target} {q.label}
            </span>
          ))}
        </div>
      </div>

      {(done || plan.status === "approved") && (
        <div style={{ ...card, background: "#ecfdf5", borderColor: "#a7f3d0", display: "flex", gap: 12, alignItems: "center" }}>
          <CheckCircle2 size={26} color="#10b981" />
          <div>
            <strong style={{ color: "#065f46" }}>{done ? done.message : `Approved${plan.approved_by_name ? ` by ${plan.approved_by_name}` : ""}. Thank you!`}</strong>
          </div>
        </div>
      )}
      {!done && plan.status === "changes_requested" && (
        <div style={{ ...card, background: "#fffbeb", borderColor: "#fde68a", color: "#92400e" }}>
          Your change request has been received. The team will update the plan and share it again.
        </div>
      )}

      {brief.length > 0 && (
        <div style={card}>
          <h3 style={{ margin: "0 0 10px", fontSize: "1rem", color: "#0f172a" }}>This month's focus</h3>
          {brief.map(([label, value]) => (
            <p key={label} style={{ margin: "0 0 8px", fontSize: "0.88rem", color: "#334155", whiteSpace: "pre-wrap" }}>
              <b>{label}:</b> {value}
            </p>
          ))}
          {plan.brief_references?.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {plan.brief_references.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#4f46e5", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <ExternalLink size={12} /> Reference
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={card}>
        <h3 style={{ margin: "0 0 4px", fontSize: "1rem", color: "#0f172a" }}>Planned posts ({plan.items.length})</h3>
        <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "#64748b" }}>Topics and dates may be fine-tuned during production.</p>
        {byWeek.map(([week, list]) => (
          <div key={week} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{week}</div>
            {list.map((i) => (
              <div key={i.id} style={{ display: "flex", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1px solid #f1f5f9", marginBottom: 6, alignItems: "flex-start" }}>
                <div style={{ width: 54, flexShrink: 0, fontSize: "0.8rem", fontWeight: 700, color: "#334155" }}>
                  {i.planned_date ? new Date(`${i.planned_date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }) : "TBC"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: TYPE_COLORS[i.post_type] || "#334155" }}>{i.type_label}</span>
                    <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>{i.title || "Topic to be finalised"}</strong>
                    {i.occasion && (
                      <span style={{ fontSize: "0.72rem", color: "#ea580c", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <Star size={11} /> {i.occasion}
                      </span>
                    )}
                  </div>
                  {i.idea && <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "#64748b" }}>{i.idea}</p>}
                  <div style={{ marginTop: 4, fontSize: "0.72rem", color: "#94a3b8" }}>
                    {[i.pillar_label, (i.platforms || []).join(", ")].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {waiting && (
        <div style={card}>
          <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "#0f172a" }}>Your decision</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.9rem", marginBottom: 10, boxSizing: "border-box" }}
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={mode === "changes" ? "What would you like changed? (e.g. only 3 videos this month, move the offer post to the 10th…)" : "Any comments (optional)"}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.9rem", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {formError && <p style={{ color: "#dc2626", fontSize: "0.82rem", margin: "6px 0 0" }}>{formError}</p>}
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit("approve")}
              style={{ flex: 1, minWidth: 180, padding: "12px 16px", borderRadius: 12, border: "none", background: "#10b981", color: "#fff", fontWeight: 800, fontSize: "0.92rem", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <CheckCircle2 size={17} /> Approve plan
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => (mode === "changes" ? submit("request_changes") : setMode("changes"))}
              style={{ flex: 1, minWidth: 180, padding: "12px 16px", borderRadius: 12, border: "1px solid #fcd34d", background: "#fffbeb", color: "#92400e", fontWeight: 800, fontSize: "0.92rem", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <MessageSquare size={17} /> {mode === "changes" ? "Send change request" : "Request changes"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function PlanReviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading…</div>}>
      <PlanReviewContent />
    </Suspense>
  );
}
