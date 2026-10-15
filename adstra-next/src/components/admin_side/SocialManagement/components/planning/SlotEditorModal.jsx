"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Ban, PlayCircle, RotateCcw, Trash2 } from "lucide-react";
import { Field, MemberSelect, Modal } from "./PlanUi";
import {
  CONTENT_TYPES,
  DEADLINE_LABELS,
  DURATION_SOURCE,
  ITEM_STAGE,
  PILLARS,
  PLATFORM_OPTIONS,
  PRODUCTION_METHODS,
  dueText,
  fmtDay,
  parseISODate,
  planApi,
  SCHEDULE_STATUS,
  toISODate,
  planError,
} from "./planningUtils";
import { confirmDialog, toast } from "../SocialFeedback";

const weekStartOf = (iso) => {
  const d = parseISODate(iso);
  if (!d) return null;
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toISODate(d);
};

/** Load of one person in the week a task is due, from the workload report. */
function loadHint(workload, role, userId, dueIso) {
  if (!workload || !userId || !dueIso) return null;
  const person = workload.people.find((p) => p.role === role && p.id === userId);
  const week = weekStartOf(dueIso);
  const cell = person?.weeks?.[week];
  const capacity = person?.capacity ?? workload.capacity?.[role];
  const units = cell?.units || 0;
  return { units, capacity, count: cell?.count || 0, over: units >= capacity };
}

export default function SlotEditorModal({ slot, plan, vendors, shoots, members, workload, onClose, onSaved, onStartScript }) {
  const isNew = !slot.id;
  const started = Boolean(slot.post) && slot.stage !== "rejected";
  const [form, setForm] = useState(() => ({
    post_type: slot.post_type || "image",
    title: slot.title || "",
    idea: slot.idea || "",
    pillar: slot.pillar || "",
    platforms: slot.platforms?.length ? slot.platforms : plan.quotas.find((q) => q.post_type === (slot.post_type || "image"))?.platforms || [],
    planned_date: slot.planned_date || "",
    planned_time: (slot.planned_time || plan.posting_time || "19:00").slice(0, 5),
    production_method: slot.production_method || (["reel", "video"].includes(slot.post_type) ? "ai_generated" : "in_house"),
    vendor: slot.vendor || null,
    shoot: slot.shoot || null,
    key_date: slot.key_date || null,
    writer: slot.writer || null,
    designer: slot.designer || null,
    notes: slot.notes || "",
  }));
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Live deadlines from the backend engine (working days, learned durations, shoot / partner timing)
  const [preview, setPreview] = useState({ deadlines: slot.deadlines || {}, schedule: slot.schedule || null });
  useEffect(() => {
    if (!form.planned_date) {
      setPreview({ deadlines: {}, schedule: null });
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      planApi
        .post("plan-items/preview_schedule/", {
          plan: plan.id,
          id: slot.id,
          post_type: form.post_type,
          production_method: form.production_method,
          planned_date: form.planned_date,
          vendor: form.production_method === "outsourced" ? form.vendor : null,
          shoot: form.production_method === "shoot" ? form.shoot : null,
        })
        .then((res) => !cancelled && setPreview(res))
        .catch(() => {});
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [plan.id, slot.id, form.post_type, form.production_method, form.planned_date, form.vendor, form.shoot]);
  const deadlines = preview.deadlines || {};
  const schedule = preview.schedule;
  const scheduleMeta = schedule ? SCHEDULE_STATUS[schedule.status] : null;
  const writerLoad = loadHint(workload, "writer", form.writer, deadlines.script);
  const designerLoad = loadHint(workload, "designer", form.designer, deadlines.designing);
  const stageMeta = ITEM_STAGE[slot.stage || "planned"];
  const planShoots = shoots.filter((s) => s.status !== "cancelled");

  const payload = () => ({
    ...form,
    plan: plan.id,
    planned_date: form.planned_date || null,
    planned_time: form.planned_time || null,
    vendor: form.production_method === "outsourced" ? form.vendor : null,
    shoot: form.production_method === "shoot" ? form.shoot : null,
  });

  const save = async (andStart = false) => {
    setSaving(true);
    try {
      const saved = isNew ? await planApi.post("plan-items/", payload()) : await planApi.patch(`plan-items/${slot.id}/`, payload());
      if (andStart) {
        await onStartScript(saved).catch(() => {}); // the start error is already reported
      } else {
        toast.success(isNew ? "Slot added to the plan." : "Slot updated.");
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      planError(err, "Could not save this slot.");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (path, message) => {
    try {
      const saved = await planApi.post(`plan-items/${slot.id}/${path}/`);
      toast.success(message);
      onSaved(saved);
      onClose();
    } catch (err) {
      planError(err);
    }
  };

  const remove = async () => {
    const ok = await confirmDialog({ title: "Delete slot?", message: "This removes the slot from the plan.", confirmLabel: "Delete", tone: "danger" });
    if (!ok) return;
    try {
      await planApi.del(`plan-items/${slot.id}/`);
      toast.success("Slot deleted.");
      onSaved(null);
      onClose();
    } catch (err) {
      planError(err);
    }
  };

  return (
    <Modal
      title={isNew ? "Plan a post" : "Edit planned post"}
      subtitle={
        isNew ? "Add a slot to this month's plan. Start its script when the team is ready." : `Status: ${stageMeta?.label || slot.stage}`
      }
      onClose={onClose}
      width={820}
      footer={
        <>
          {!isNew && !slot.post && slot.stage !== "dropped" && (
            <button type="button" className="pl-btn pl-btn-ghost pl-danger-text" onClick={remove}>
              <Trash2 size={14} /> Delete
            </button>
          )}
          {!isNew && slot.stage !== "dropped" && (
            <button type="button" className="pl-btn pl-btn-ghost" onClick={() => runAction("drop", "Slot dropped from this month.")}>
              <Ban size={14} /> Drop
            </button>
          )}
          {slot.stage === "dropped" && (
            <button type="button" className="pl-btn pl-btn-ghost" onClick={() => runAction("restore", "Slot restored.")}>
              <RotateCcw size={14} /> Restore
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button type="button" className="pl-btn pl-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="pl-btn pl-btn-ghost-strong" onClick={() => save(false)} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          {!started && slot.stage !== "dropped" && plan.status !== "closed" && (
            <button type="button" className="pl-btn pl-btn-primary" onClick={() => save(true)} disabled={saving}>
              <PlayCircle size={15} /> {slot.stage === "rejected" ? "Save & restart script" : "Save & start script"}
            </button>
          )}
        </>
      }
    >
      <div className="pl-slot-editor">
        <div className="pl-grid-2">
          <Field label="Content type">
            <div className="pl-seg">
              {CONTENT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  disabled={started}
                  className={form.post_type === t.id ? "on" : ""}
                  style={form.post_type === t.id ? { background: t.bg, color: t.color, borderColor: t.color } : undefined}
                  onClick={() => set({ post_type: t.id })}
                >
                  <t.icon size={13} /> {t.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Content pillar">
            <div className="pl-seg pl-seg-wrap">
              {PILLARS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={form.pillar === p.id ? "on" : ""}
                  style={form.pillar === p.id ? { background: `${p.color}18`, color: p.color, borderColor: p.color } : undefined}
                  onClick={() => set({ pillar: form.pillar === p.id ? "" : p.id })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Title / topic" span={2}>
            <input className="pl-input" value={form.title} placeholder="e.g. 3 myths about home loans" onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Idea / angle" span={2}>
            <textarea className="pl-input" rows={2} value={form.idea} placeholder="Hook, format, what we want to show…" onChange={(e) => set({ idea: e.target.value })} />
          </Field>
          <Field label="Publish date">
            <input className="pl-input" type="date" value={form.planned_date || ""} onChange={(e) => set({ planned_date: e.target.value })} />
          </Field>
          <Field label="Time">
            <input className="pl-input" type="time" value={form.planned_time || ""} onChange={(e) => set({ planned_time: e.target.value })} />
          </Field>
          <Field label="Platforms" span={2}>
            <div className="pl-chip-select">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={form.platforms.includes(p.id) ? "on" : ""}
                  onClick={() =>
                    set({ platforms: form.platforms.includes(p.id) ? form.platforms.filter((x) => x !== p.id) : [...form.platforms, p.id] })
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="How it's produced" span={2}>
            <div className="pl-seg">
              {PRODUCTION_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className={form.production_method === m.id ? "on" : ""}
                  style={form.production_method === m.id ? { background: `${m.color}14`, color: m.color, borderColor: m.color } : undefined}
                  onClick={() => set({ production_method: m.id })}
                >
                  <m.icon size={13} /> {m.label}
                </button>
              ))}
            </div>
          </Field>
          {form.production_method === "outsourced" && (
            <Field label="Outsourced team" hint={vendors.length ? null : "Add your partner teams under Production → Vendors."}>
              <select className="pl-input" value={form.vendor || ""} onChange={(e) => set({ vendor: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Choose team…</option>
                {vendors.filter((v) => v.is_active).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.vendor_type_display}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {form.production_method === "shoot" && (
            <Field label="Shoot day" hint={planShoots.length ? "Batch videos into one shoot." : "Create a shoot day under Production."}>
              <select className="pl-input" value={form.shoot || ""} onChange={(e) => set({ shoot: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Not scheduled yet</option>
                {planShoots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {fmtDay(s.date)} · {s.title || s.location || "Shoot"}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Writer">
            <MemberSelect members={members} value={form.writer} onChange={(v) => set({ writer: v })} />
            {writerLoad && (
              <span className={`pl-load-hint ${writerLoad.over ? "over" : ""}`}>
                {writerLoad.over && <AlertTriangle size={12} />} {writerLoad.count} scripts due that week ({writerLoad.units}/{writerLoad.capacity})
              </span>
            )}
          </Field>
          <Field label="Designer / editor">
            <MemberSelect members={members} value={form.designer} onChange={(v) => set({ designer: v })} />
            {designerLoad && (
              <span className={`pl-load-hint ${designerLoad.over ? "over" : ""}`}>
                {designerLoad.over && <AlertTriangle size={12} />} {designerLoad.count} designs due that week ({designerLoad.units}/
                {designerLoad.capacity} units)
              </span>
            )}
          </Field>
          <Field label="Notes" span={2}>
            <textarea className="pl-input" rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>
        </div>

        <aside className="pl-deadline-box">
          <div className="pl-deadline-head">
            <h5>Deadlines</h5>
            {scheduleMeta && (
              <span className="pl-pill" style={{ color: scheduleMeta.color, background: scheduleMeta.bg }}>
                {scheduleMeta.label}
              </span>
            )}
          </div>
          {!form.planned_date ? (
            <p className="pl-muted">Pick a publish date to see when each stage is due.</p>
          ) : (
            <>
              {schedule?.start_by && !started && (
                <p className="pl-start-by">
                  Start script by <b>{fmtDay(schedule.start_by, { weekday: "short", day: "numeric", month: "short" })}</b>{" "}
                  <em>{dueText(schedule.start_by)}</em>
                </p>
              )}
              <ul>
                {Object.entries(DEADLINE_LABELS).map(([key, label]) => {
                  const iso = deadlines[key];
                  if (!iso) return null;
                  const late = key !== "publish" && iso < toISODate(new Date()) && !started;
                  const part = schedule?.breakdown?.find((b) => b.stage === key);
                  const src = part ? DURATION_SOURCE[part.source] : null;
                  return (
                    <li key={key} className={late ? "late" : ""}>
                      <span>{label}</span>
                      <b>{fmtDay(iso, { weekday: "short", day: "numeric", month: "short" })}</b>
                      <em>
                        {part && (
                          <span className="pl-src" style={{ color: src?.color }} title={part.detail}>
                            {part.days}d · {src?.label}
                          </span>
                        )}
                        {dueText(iso)}
                      </em>
                    </li>
                  );
                })}
              </ul>
              {schedule?.notes?.map((n, i) => (
                <p key={i} className={`pl-schedule-note ${schedule.status}`}>
                  <AlertTriangle size={12} /> {n}
                </p>
              ))}
            </>
          )}
          <p className="pl-muted pl-small">
            Working days only (Sundays and office holidays skipped). Hover a duration to see where it comes from.
          </p>
        </aside>
      </div>
    </Modal>
  );
}
