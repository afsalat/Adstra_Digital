"use client";

import React, { useEffect, useState } from "react";
import { Brain, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { Field } from "./PlanUi";
import {
  CONTENT_TYPES,
  DEFAULT_SCHEDULE,
  DURATION_SOURCE,
  PILLARS,
  POLICY_META,
  WEEKDAYS,
  fmtDay,
  planApi,
  typeMeta,
  planError,
} from "./planningUtils";
import { toast } from "../SocialFeedback";

const STAGE_FIELDS = [
  { id: "script", label: "Script" },
  { id: "script_approval", label: "Script approval" },
  { id: "designing", label: "Design / edit" },
  { id: "team_review", label: "Team review" },
  { id: "client_review", label: "Client review" },
];

const scheduleOf = (raw) => {
  const known = Object.fromEntries(Object.entries(raw || {}).filter(([k]) => k in DEFAULT_SCHEDULE));
  return { ...DEFAULT_SCHEDULE, ...known, overrides: { ...(known.overrides || {}) } };
};

/** Monthly brief, content pillar mix and the scheduling rules used for slots and deadlines. */
export default function PlanBriefPanel({ plan, packages, readOnly, onPlanChange }) {
  const [form, setForm] = useState(() => ({
    brief_goals: plan.brief_goals,
    brief_offers: plan.brief_offers,
    brief_focus: plan.brief_focus,
    brief_avoid: plan.brief_avoid,
    brief_notes: plan.brief_notes,
    brief_references: plan.brief_references || [],
    pillar_mix: { ...(plan.pillar_mix || {}) },
    posting_days: { ...(plan.posting_days || {}) },
    posting_time: (plan.posting_time || "19:00").slice(0, 5),
    lead_days: scheduleOf(plan.lead_days),
    carry_over_policy: plan.carry_over_policy,
    package: plan.package,
  }));
  const [newRef, setNewRef] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const mixTotal = Object.values(form.pillar_mix).reduce((a, b) => a + Number(b || 0), 0);
  const actual = Object.fromEntries((plan.progress.pillars || []).map((p) => [p.pillar, p]));

  const toggleDay = (type, day) => {
    const cur = form.posting_days[type] || [];
    set({ posting_days: { ...form.posting_days, [type]: cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day].sort() } });
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = await planApi.patch(`plans/${plan.id}/`, form);
      onPlanChange(data);
      toast.success("Brief and planning rules saved.");
    } catch (err) {
      planError(err, "Could not save the brief.");
    } finally {
      setSaving(false);
    }
  };

  const clientPolicy = POLICY_META[plan.client_policy];

  return (
    <div className="pl-brief">
      <section className="pl-card">
        <h4 className="pl-card-title">Monthly brief</h4>
        <p className="pl-muted pl-small">Goes into every script's notes when you start it, so writers have the context.</p>
        <div className="pl-grid-2">
          <Field label="Goals this month">
            <textarea className="pl-input" rows={3} disabled={readOnly} value={form.brief_goals} placeholder="More enquiries for the new branch…" onChange={(e) => set({ brief_goals: e.target.value })} />
          </Field>
          <Field label="Offers / promotions">
            <textarea className="pl-input" rows={3} disabled={readOnly} value={form.brief_offers} placeholder="Festive 20% off till 15th…" onChange={(e) => set({ brief_offers: e.target.value })} />
          </Field>
          <Field label="Products / services to push">
            <textarea className="pl-input" rows={3} disabled={readOnly} value={form.brief_focus} onChange={(e) => set({ brief_focus: e.target.value })} />
          </Field>
          <Field label="Avoid">
            <textarea className="pl-input" rows={3} disabled={readOnly} value={form.brief_avoid} placeholder="No competitor names, no price mentions…" onChange={(e) => set({ brief_avoid: e.target.value })} />
          </Field>
          <Field label="Other notes" span={2}>
            <textarea className="pl-input" rows={2} disabled={readOnly} value={form.brief_notes} onChange={(e) => set({ brief_notes: e.target.value })} />
          </Field>
          <Field label="Reference links" span={2}>
            <div className="pl-refs">
              {form.brief_references.map((url, i) => (
                <div key={i} className="pl-ref">
                  <a href={url} target="_blank" rel="noreferrer">
                    <ExternalLink size={12} /> {url}
                  </a>
                  {!readOnly && (
                    <button type="button" className="pl-icon-btn" onClick={() => set({ brief_references: form.brief_references.filter((_, idx) => idx !== i) })}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <div className="pl-ref-add">
                  <input
                    className="pl-input"
                    placeholder="https://…"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newRef.trim()) {
                        e.preventDefault();
                        set({ brief_references: [...form.brief_references, newRef.trim()] });
                        setNewRef("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="pl-btn pl-btn-ghost pl-btn-sm"
                    onClick={() => {
                      if (!newRef.trim()) return;
                      set({ brief_references: [...form.brief_references, newRef.trim()] });
                      setNewRef("");
                    }}
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              )}
            </div>
          </Field>
        </div>
      </section>

      <section className="pl-card">
        <h4 className="pl-card-title">Content pillar mix</h4>
        <p className="pl-muted pl-small">
          Target share of each pillar. New slots are tagged to keep the mix balanced.{" "}
          <span className={mixTotal === 100 ? "" : "pl-overdue"}>Total {mixTotal}%</span>
        </p>
        <div className="pl-mix">
          {PILLARS.map((p) => {
            const target = Number(form.pillar_mix[p.id] || 0);
            const act = actual[p.id];
            return (
              <div key={p.id} className="pl-mix-row">
                <span className="pl-mix-label" style={{ color: p.color }}>
                  {p.label}
                </span>
                <input
                  className="pl-input pl-input-num"
                  type="number"
                  min={0}
                  max={100}
                  disabled={readOnly}
                  value={target}
                  onChange={(e) => set({ pillar_mix: { ...form.pillar_mix, [p.id]: Number(e.target.value) } })}
                />
                <div className="pl-mix-bars" title={`Target ${target}% · Planned ${act?.actual_pct || 0}% (${act?.count || 0} posts)`}>
                  <span className="pl-mix-target" style={{ width: `${target}%`, background: `${p.color}33` }} />
                  <span className="pl-mix-actual" style={{ width: `${act?.actual_pct || 0}%`, background: p.color }} />
                </div>
                <span className="pl-mix-actual-label">
                  {act?.actual_pct || 0}% <em>({act?.count || 0})</em>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pl-card">
        <h4 className="pl-card-title">Scheduling rules</h4>
        <div className="pl-grid-2">
          <Field label="Posting days per format" span={2} hint="Used by “Generate slots” to spread posts across the month.">
            <div className="pl-days-table">
              {CONTENT_TYPES.map((t) => (
                <div key={t.id} className="pl-days-row">
                  <span className="pl-type-tag" style={{ color: t.color, background: t.bg }}>
                    <t.icon size={12} /> {t.label}
                  </span>
                  <div className="pl-days">
                    {WEEKDAYS.map((d, idx) => (
                      <button
                        type="button"
                        key={d}
                        disabled={readOnly}
                        className={(form.posting_days[t.id] || []).includes(idx) ? "on" : ""}
                        onClick={() => toggleDay(t.id, idx)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Field>
          <Field label="Default posting time">
            <input className="pl-input" type="time" disabled={readOnly} value={form.posting_time} onChange={(e) => set({ posting_time: e.target.value })} />
          </Field>
          <Field label="Package">
            <select className="pl-input" disabled={readOnly} value={form.package || ""} onChange={(e) => set({ package: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Custom</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Undelivered items this month"
            span={2}
            hint={clientPolicy ? `Client default: ${clientPolicy.label} — ${clientPolicy.long.toLowerCase()}.` : null}
          >
            <div className="pl-seg">
              {[
                { id: "inherit", label: "Use client default" },
                { id: "carry_over", label: "Carry over to next month" },
                { id: "adjust_billing", label: "Reduce the bill" },
              ].map((o) => (
                <button type="button" key={o.id} disabled={readOnly} className={form.carry_over_policy === o.id ? "on" : ""} onClick={() => set({ carry_over_policy: o.id })}>
                  {o.label}
                </button>
              ))}
            </div>
          </Field>

        </div>
      </section>

      <DeadlineRules plan={plan} value={form.lead_days} readOnly={readOnly} onChange={(lead_days) => set({ lead_days })} />

      {!readOnly && (
        <div className="pl-sticky-save">
          <button type="button" className="pl-btn pl-btn-primary" onClick={save} disabled={saving}>
            <Save size={15} /> {saving ? "Saving…" : "Save brief & rules"}
          </button>
        </div>
      )}
    </div>
  );
}

/** How deadlines are worked out: working days, buffer, learning on/off, fixed durations, and what was learned. */
function DeadlineRules({ plan, value, readOnly, onChange }) {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    planApi.get(`plans/${plan.id}/schedule_insights/`).then(setInsights).catch(() => setInsights(null));
  }, [plan.id, plan.updated_at]);

  const toggleWorkday = (d) => {
    const days = value.workdays.includes(d) ? value.workdays.filter((x) => x !== d) : [...value.workdays, d].sort();
    if (days.length) onChange({ ...value, workdays: days });
  };
  const setOverride = (stage, raw) => {
    const overrides = { ...value.overrides };
    if (raw === "" || Number(raw) <= 0) delete overrides[stage];
    else overrides[stage] = Number(raw);
    onChange({ ...value, overrides });
  };

  return (
    <section className="pl-card">
      <h4 className="pl-card-title">Deadline rules</h4>
      <p className="pl-muted pl-small">
        Deadlines are worked back from each publish date in <b>working days</b>. Each stage takes a number of days, learned from how long your team
        actually took on past posts once there is enough history, otherwise sensible defaults. Slots planned too late get a compressed schedule and are
        flagged “Tight” or “At risk”.
      </p>
      <div className="pl-grid-2">
        <Field label="Working days" hint="Office holidays come from Key dates marked “Office closed”.">
          <div className="pl-days">
            {WEEKDAYS.map((d, idx) => (
              <button type="button" key={d} disabled={readOnly} className={value.workdays.includes(idx) ? "on" : ""} onClick={() => toggleWorkday(idx)}>
                {d}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Buffer before publishing" hint="Working days between the client's OK and the post going live.">
          <input
            className="pl-input pl-input-num"
            type="number"
            min={0}
            max={5}
            disabled={readOnly}
            value={value.buffer}
            onChange={(e) => onChange({ ...value, buffer: Math.max(0, Number(e.target.value)) })}
          />
        </Field>
        <Field label="Learn from past work" span={2}>
          <label className="pl-check">
            <input type="checkbox" disabled={readOnly} checked={value.learn} onChange={(e) => onChange({ ...value, learn: e.target.checked })} />
            Use how long each stage really took (per client and format, including revision rounds)
            {insights && <span className="pl-muted"> · {insights.learned_samples} stage timings recorded so far</span>}
          </label>
        </Field>
        <Field label="Fix a stage's duration (optional)" span={2} hint="Leave empty to let the system decide. A fixed value applies to every format in this plan.">
          <div className="pl-lead-grid">
            {STAGE_FIELDS.map((f) => (
              <label key={f.id} className="pl-lead">
                <span>{f.label}</span>
                <input
                  className="pl-input pl-input-num"
                  type="number"
                  min={1}
                  placeholder="auto"
                  disabled={readOnly}
                  value={value.overrides[f.id] ?? ""}
                  onChange={(e) => setOverride(f.id, e.target.value)}
                />
              </label>
            ))}
          </div>
        </Field>
      </div>

      {insights && (
        <div className="pl-insights">
          <h5>
            <Brain size={14} /> Working days per stage for {plan.client_name}
            {insights.revision_rate != null && <span className="pl-muted"> · avg {insights.revision_rate.toFixed(1)} revision round(s) per post</span>}
          </h5>
          <div className="pl-table-scroll">
            <table className="pl-table pl-insight-table">
              <thead>
                <tr>
                  <th>Format</th>
                  {STAGE_FIELDS.map((f) => (
                    <th key={f.id}>{f.label}</th>
                  ))}
                  <th>Total*</th>
                </tr>
              </thead>
              <tbody>
                {insights.formats.map((row) => {
                  const meta = typeMeta(row.post_type);
                  return (
                    <tr key={row.post_type}>
                      <td>
                        <span className="pl-type-tag" style={{ color: meta.color, background: meta.bg }}>
                          <meta.icon size={12} /> {meta.label}
                        </span>
                      </td>
                      {row.stages.map((st) => {
                        const src = DURATION_SOURCE[st.source] || DURATION_SOURCE.default;
                        return (
                          <td key={st.stage} title={st.detail}>
                            <b>{st.days}d</b>{" "}
                            <span className="pl-src" style={{ color: src.color }}>
                              {src.label}
                            </span>
                          </td>
                        );
                      })}
                      <td>
                        <b>{row.total_days}d</b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="pl-muted pl-small">
            *Including the publishing buffer. Reels and videos are shown as AI-generated, others as in-house; shoots and partner teams use their own
            timing. Save to refresh this table. {insights.working_days_in_month} working days this month
            {insights.office_closed_days.length > 0 && ` (office closed: ${insights.office_closed_days.map((d) => fmtDay(d)).join(", ")})`}.
          </p>
        </div>
      )}
    </section>
  );
}
