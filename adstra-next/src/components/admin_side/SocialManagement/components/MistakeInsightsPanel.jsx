"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import { Lightbulb, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Sparkles, CheckCircle2, RotateCcw, AlertTriangle, Clock, Repeat } from "lucide-react";
import { toast, confirmDialog, apiErrorMessage } from "./SocialFeedback";
import { STAGE_LABELS } from "./WorkflowDecisionModals";

const COLLAPSE_KEY = "adstra.socialMistakeInsights.collapsed";

const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 };
const labelStyle = { fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" };

const TREND = {
  rising: { icon: TrendingUp, color: "#dc2626", text: "Rising" },
  falling: { icon: TrendingDown, color: "#16a34a", text: "Falling" },
  flat: { icon: Minus, color: "#64748b", text: "Flat" },
  new: { icon: Sparkles, color: "#7c3aed", text: "New" },
};

const LESSON_STATUS = {
  working: { color: "#16a34a", bg: "#f0fdf4", text: "Working — mistakes dropped" },
  not_working: { color: "#dc2626", bg: "#fef2f2", text: "Not working yet" },
  too_early: { color: "#64748b", bg: "#f1f5f9", text: "Too early to tell" },
};

function StatCard({ label, value, hint, color = "#0f172a" }) {
  return (
    <div style={{ ...card, padding: 14 }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: "1.35rem", fontWeight: 800, color, marginTop: 4, lineHeight: 1.2 }}>{value}</div>
      {hint && <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

export default function MistakeInsightsPanel({ selectedClientId = "all", onApplied, onHints }) {
  const [days, setDays] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Read after mount so server and client render the same markup first.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* storage unavailable: stay expanded */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/social/insights/mistakes/`, {
        params: { client_id: selectedClientId, days },
      });
      setData(res.data);
      if (onHints) onHints(res.data.post_hints || {});
    } catch (err) {
      setData(null);
      toast.error?.(apiErrorMessage(err, "Could not load mistake insights"));
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, days]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  const applyFix = async (s) => {
    if (selectedClientId === "all") {
      const names = s.clients || [];
      const ok = await confirmDialog({
        title: `Apply "${s.title}"?`,
        message: names.length
          ? `The checklist will be added to open posts for the ${names.length} client(s) that had "${s.category}" recently: ${names.join(", ")}.`
          : `No client had "${s.category}" in this period, so no posts will be changed. The fix will still be tracked.`,
        confirmLabel: "Apply fix",
      });
      if (!ok) return;
    }
    setApplying(s.category);
    try {
      const res = await axios.post(`${API_BASE_URL}/social/insights/apply-fix/`, {
        category: s.category,
        client_id: selectedClientId,
        title: s.title,
        checklist: s.checklist,
        days,
      });
      const verb = res.data.created ? "Fix applied" : "Checklist re-pushed";
      toast.success?.(`${verb} — added to ${res.data.posts_updated} open post(s)`);
      await load();
      if (onApplied) onApplied();
    } catch (err) {
      toast.error?.(apiErrorMessage(err, "Could not apply fix"));
    } finally {
      setApplying(null);
    }
  };

  if (loading && !data) {
    return <div style={{ ...card, color: "#64748b", fontSize: "0.85rem" }}>Analysing rejection & revision history…</div>;
  }
  if (!data) return null;

  const { summary, categories, suggestions, cross_cutting: cross, co_occurrence: pairs, heatmap, lessons } = data;
  const maxScore = Math.max(...categories.map((c) => c.score), 1);
  const maxCell = Math.max(...heatmap.rows.flatMap((r) => r.cells), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>
          <Lightbulb size={18} color="#d97706" /> Mistake Insights
          <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>from rejection & revision reasons</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!collapsed && (
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.78rem", fontWeight: 700 }}
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 180 days</option>
            </select>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {collapsed ? "Show insights" : "Hide insights"}
          </button>
        </div>
      </div>

      {collapsed ? (
        summary.total_feedback_events > 0 && (
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: -6 }}>
            {summary.total_feedback_events} feedback event(s) · top reason <b style={{ color: "#b91c1c" }}>{summary.top_reason}</b>
            {suggestions.length > 0 && <> · {suggestions.length} fix suggestion(s)</>}
          </div>
        )
      ) : (
      <>
      {summary.total_feedback_events === 0 ? (
        <div style={{ ...card, color: "#64748b", fontSize: "0.85rem" }}>
          No revision or rejection reasons recorded in this period yet. Insights appear as soon as feedback is logged with reasons.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
            <StatCard label="Feedback events" value={summary.total_feedback_events} hint={`${summary.total_rejected} full rejection(s)`} />
            <StatCard label="Top reason" value={summary.top_reason || "—"} color="#b91c1c" />
            <StatCard label="Repeat-mistake rate" value={`${summary.repeat_mistake_rate}%`} hint="reasons repeating for the same client" color={summary.repeat_mistake_rate >= 50 ? "#dc2626" : "#0f172a"} />
            <StatCard label="Avg rework time" value={`${summary.avg_rework_days}d`} hint="per revision round" />
            <StatCard label="Caught late" value={`${summary.late_catch_pct}%`} hint="at client review or later" color={summary.late_catch_pct >= 40 ? "#dc2626" : "#0f172a"} />
          </div>

          {/* Suggestions */}
          <div style={card}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>Fix suggestions (ranked by impact)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {suggestions.map((s) => (
                <div key={s.category} style={{ border: "1px solid #fde68a", background: "#fffbeb", borderRadius: 12, padding: 12, display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: "#92400e", fontSize: "0.88rem" }}>{s.title}</div>
                    <div style={{ fontSize: "0.72rem", color: "#b45309", fontWeight: 700, marginTop: 2 }}>
                      {s.category} · {s.why}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#334155", marginTop: 6, lineHeight: 1.4 }}>{s.detail}</div>
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: "0.76rem", color: "#475569" }}>
                      {s.checklist.map((i) => <li key={i}>{i}</li>)}
                    </ul>
                    {(s.repeat_clients.length > 0 || s.repeat_assignees.length > 0) && (
                      <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.7rem", fontWeight: 700 }}>
                        {s.repeat_clients.map((c) => (
                          <span key={c.name} style={{ padding: "2px 8px", borderRadius: 999, background: "#fee2e2", color: "#b91c1c" }}>
                            <Repeat size={10} style={{ verticalAlign: -1 }} /> {c.name} ×{c.count}
                          </span>
                        ))}
                        {s.repeat_assignees.map((a) => (
                          <span key={a.name} style={{ padding: "2px 8px", borderRadius: 999, background: "#e0e7ff", color: "#4338ca" }}>
                            {a.name} ×{a.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ alignSelf: "center" }}>
                    {s.applied ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#16a34a", fontWeight: 800, fontSize: "0.78rem" }}>
                        <CheckCircle2 size={14} /> Applied
                      </span>
                    ) : null}
                    <button
                      onClick={() => applyFix(s)}
                      disabled={applying === s.category}
                      style={{ marginLeft: 8, padding: "7px 14px", borderRadius: 8, border: "none", background: "#d97706", color: "#fff", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", opacity: applying === s.category ? 0.6 : 1 }}
                    >
                      {applying === s.category ? "Applying…" : s.applied ? "Re-push checklist" : "Apply to open posts"}
                    </button>
                  </div>
                </div>
              ))}
              {cross.map((c) => (
                <div key={c.title} style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 800, color: "#991b1b", fontSize: "0.85rem", display: "flex", gap: 6, alignItems: "center" }}>
                    <AlertTriangle size={14} /> {c.title}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#334155", marginTop: 4 }}>{c.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason breakdown */}
          <div style={card}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>Reason breakdown (weighted by severity, recency and stage cost)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.slice(0, 10).map((c) => {
                const t = TREND[c.trend] || TREND.flat;
                const TIcon = t.icon;
                return (
                  <div key={c.category} style={{ display: "grid", gridTemplateColumns: "minmax(130px, 200px) 1fr auto", gap: 10, alignItems: "center" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>{c.category}</div>
                    <div style={{ background: "#f1f5f9", borderRadius: 999, height: 10, overflow: "hidden" }}>
                      <div style={{ width: `${(c.score / maxScore) * 100}%`, height: "100%", background: "#ef4444", borderRadius: 999 }} />
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, whiteSpace: "nowrap" }}>
                      <span>{c.count}× ({c.revisions} rev / {c.rejections} rej)</span>
                      {c.rework_days > 0 && <span title="Rework time"><Clock size={11} style={{ verticalAlign: -1 }} /> {c.rework_days}d</span>}
                      <span style={{ color: t.color, display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <TIcon size={12} /> {t.text}{c.trend !== "new" && c.trend !== "flat" ? ` (was ${c.previous_count})` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {pairs.length > 0 && (
              <div style={{ marginTop: 12, fontSize: "0.74rem", color: "#475569" }}>
                <b>Often together:</b>{" "}
                {pairs.map((p) => `${p.a} + ${p.b} (${p.count}×)`).join("  ·  ")}
              </div>
            )}
          </div>

          {/* Heatmap */}
          {heatmap.stages.length > 0 && (
            <div style={{ ...card, overflowX: "auto" }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Where mistakes are caught (reason × stage)</div>
              <table style={{ borderCollapse: "separate", borderSpacing: 3, fontSize: "0.74rem" }}>
                <thead>
                  <tr>
                    <th />
                    {heatmap.stages.map((s) => (
                      <th key={s} style={{ padding: "2px 8px", color: "#64748b", fontWeight: 700 }}>{STAGE_LABELS[s] || s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.rows.map((r) => (
                    <tr key={r.category}>
                      <td style={{ padding: "2px 8px 2px 0", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>{r.category}</td>
                      {r.cells.map((n, i) => (
                        <td key={i} style={{ textAlign: "center", minWidth: 56, padding: "6px 4px", borderRadius: 6, fontWeight: 800, color: n ? "#7f1d1d" : "#cbd5e1", background: n ? `rgba(239,68,68,${0.12 + 0.6 * (n / maxCell)})` : "#f8fafc" }}>
                          {n || "·"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Lessons learned / closed loop */}
      {lessons.length > 0 && (
        <div style={card}>
          <div style={{ ...labelStyle, marginBottom: 10 }}>Lessons learned — did the fix work?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lessons.map((l) => {
              const st = LESSON_STATUS[l.status] || LESSON_STATUS.too_early;
              return (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "8px 10px", borderRadius: 10, background: st.bg }}>
                  <div style={{ fontSize: "0.8rem", color: "#0f172a" }}>
                    <b>{l.title}</b> <span style={{ color: "#64748b" }}>· {l.category} · {l.client} · applied {new Date(l.applied_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  <div style={{ fontSize: "0.74rem", fontWeight: 800, color: st.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <RotateCcw size={12} /> {l.baseline_per_30d} → {l.current_per_30d} per 30d · {st.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
