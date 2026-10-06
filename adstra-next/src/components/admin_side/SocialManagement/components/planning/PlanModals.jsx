"use client";

import React, { useEffect, useState } from "react";
import { Copy, MessageCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { Field, Modal } from "./PlanUi";
import {
  CONTENT_TYPES,
  KEY_DATE_BY_ID,
  KEY_DATE_CATEGORIES,
  PILLARS,
  POLICY_META,
  fmtDay,
  fmtMoney,
  monthLabel,
  planApi,
  shiftMonth,
  typeMeta,
  planError,
} from "./planningUtils";
import { confirmDialog, toast } from "../SocialFeedback";

/* ─── Packages (templates for monthly deliverables) ─── */

export function PackagesModal({ packages, onClose, onChanged }) {
  const [editing, setEditing] = useState(null);

  const remove = async (p) => {
    const ok = await confirmDialog({ title: "Delete package?", message: `"${p.name}" will be removed. Existing plans keep their numbers.`, confirmLabel: "Delete", tone: "danger" });
    if (!ok) return;
    try {
      await planApi.del(`plan-packages/${p.id}/`);
      onChanged();
    } catch (err) {
      planError(err);
    }
  };

  if (editing) {
    return <PackageEditor pkg={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />;
  }

  return (
    <Modal
      title="Packages"
      subtitle="Templates for monthly deliverables. A plan copies the numbers, then you can change them for that month only."
      onClose={onClose}
      width={680}
      footer={
        <button type="button" className="pl-btn pl-btn-primary" onClick={() => setEditing({})}>
          <Plus size={14} /> New package
        </button>
      }
    >
      {packages.length === 0 ? (
        <p className="pl-muted">No packages yet.</p>
      ) : (
        <div className="pl-pkg-list">
          {packages.map((p) => (
            <div key={p.id} className="pl-pkg">
              <div>
                <strong>{p.name}</strong>
                {Number(p.monthly_fee) > 0 && <span className="pl-muted"> · {fmtMoney(p.monthly_fee)}/month</span>}
                <div className="pl-pkg-quotas">
                  {(p.quotas || []).map((q) => {
                    const meta = typeMeta(q.post_type);
                    return (
                      <span key={q.post_type} className="pl-type-tag" style={{ color: meta.color, background: meta.bg }}>
                        {q.quantity} {meta.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="pl-row-end">
                <button type="button" className="pl-icon-btn" onClick={() => setEditing(p)}>
                  <Pencil size={14} />
                </button>
                <button type="button" className="pl-icon-btn" onClick={() => remove(p)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function PackageEditor({ pkg, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: pkg.name || "",
    description: pkg.description || "",
    monthly_fee: pkg.monthly_fee || 0,
    quotas: pkg.quotas?.length ? pkg.quotas : [{ post_type: "reel", quantity: 4, unit_price: 0 }, { post_type: "image", quantity: 10, unit_price: 0 }],
    pillar_mix: pkg.pillar_mix || {},
  });
  const unused = CONTENT_TYPES.filter((t) => !form.quotas.some((q) => q.post_type === t.id));
  const setQuota = (i, patch) => setForm((f) => ({ ...f, quotas: f.quotas.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));

  const save = async () => {
    if (!form.name.trim()) return toast.warning("Name the package.");
    const body = { ...form, quotas: form.quotas.map((q) => ({ ...q, quantity: Number(q.quantity || 0), unit_price: Number(q.unit_price || 0) })) };
    try {
      pkg.id ? await planApi.patch(`plan-packages/${pkg.id}/`, body) : await planApi.post("plan-packages/", body);
      toast.success("Package saved.");
      onSaved();
    } catch (err) {
      planError(err);
    }
  };

  return (
    <Modal
      title={pkg.id ? "Edit package" : "New package"}
      onClose={onClose}
      width={640}
      footer={
        <>
          <button type="button" className="pl-btn pl-btn-ghost" onClick={onClose}>
            Back
          </button>
          <button type="button" className="pl-btn pl-btn-primary" onClick={save}>
            Save package
          </button>
        </>
      }
    >
      <div className="pl-grid-2">
        <Field label="Name">
          <input className="pl-input" value={form.name} placeholder="Growth package" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Monthly fee (₹)">
          <input className="pl-input" type="number" min={0} value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} />
        </Field>
        <Field label="Deliverables" span={2}>
          <table className="pl-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Per month</th>
                <th>Price / item (₹)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {form.quotas.map((q, i) => (
                <tr key={q.post_type}>
                  <td>{typeMeta(q.post_type).label}</td>
                  <td>
                    <input className="pl-input pl-input-num" type="number" min={0} value={q.quantity} onChange={(e) => setQuota(i, { quantity: e.target.value })} />
                  </td>
                  <td>
                    <input className="pl-input pl-input-num" type="number" min={0} value={q.unit_price} onChange={(e) => setQuota(i, { unit_price: e.target.value })} />
                  </td>
                  <td>
                    <button type="button" className="pl-icon-btn" onClick={() => setForm((f) => ({ ...f, quotas: f.quotas.filter((_, idx) => idx !== i) }))}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {unused.length > 0 && (
            <div className="pl-add-row">
              {unused.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className="pl-btn pl-btn-ghost pl-btn-sm"
                  onClick={() => setForm((f) => ({ ...f, quotas: [...f.quotas, { post_type: t.id, quantity: 1, unit_price: 0 }] }))}
                >
                  <Plus size={13} /> {t.label}
                </button>
              ))}
            </div>
          )}
        </Field>
        <Field label="Pillar mix (%)" span={2}>
          <div className="pl-mix-inline">
            {PILLARS.filter((p) => p.id !== "other").map((p) => (
              <label key={p.id}>
                <span style={{ color: p.color }}>{p.label}</span>
                <input
                  className="pl-input pl-input-num"
                  type="number"
                  min={0}
                  max={100}
                  value={form.pillar_mix[p.id] || 0}
                  onChange={(e) => setForm({ ...form, pillar_mix: { ...form.pillar_mix, [p.id]: Number(e.target.value) } })}
                />
              </label>
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

/* ─── Client planning defaults ─── */

export function ClientPlanSettingsModal({ client, packages, onClose, onSaved }) {
  const [policy, setPolicy] = useState(client.carry_over_policy || "adjust_billing");
  const [pkg, setPkg] = useState(client.default_package || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await planApi.patch(`clients/${client.id}/`, { carry_over_policy: policy, default_package: pkg || null });
      toast.success(`Planning defaults saved for ${client.name}.`);
      onSaved();
      onClose();
    } catch (err) {
      planError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`${client.name} · planning defaults`}
      subtitle="Applies to every month unless a month overrides it in Brief & Rules."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pl-btn pl-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="pl-btn pl-btn-primary" onClick={save} disabled={saving}>
            Save
          </button>
        </>
      }
    >
      <Field label="When something isn't delivered in a month">
        <div className="pl-policy-options">
          {Object.entries(POLICY_META).map(([id, meta]) => (
            <label key={id} className={`pl-policy-option ${policy === id ? "on" : ""}`}>
              <input type="radio" name="policy" checked={policy === id} onChange={() => setPolicy(id)} />
              <div>
                <strong>{id === "carry_over" ? "Carry over to next month" : "Reduce the bill"}</strong>
                <span>
                  {id === "carry_over"
                    ? "4 videos planned, 3 delivered → next month has 1 extra video to make."
                    : "4 videos planned, 3 delivered → next month stays normal; 1 video is deducted from this month's bill."}
                </span>
              </div>
            </label>
          ))}
        </div>
      </Field>
      <div style={{ height: 12 }} />
      <Field label="Default package" hint="Used when the client's very first plan is created.">
        <select className="pl-input" value={pkg || ""} onChange={(e) => setPkg(e.target.value ? Number(e.target.value) : "")}>
          <option value="">None</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
    </Modal>
  );
}

/* ─── Key dates ─── */

export function KeyDatesModal({ monthKey, clientId, clientName, keyDates, onClose, onChanged }) {
  const [form, setForm] = useState({ title: "", date: `${monthKey}-01`, category: "festival", recurring_yearly: false, forClient: false, office_closed: false, notes: "" });

  const save = async () => {
    if (!form.title.trim() || !form.date) return toast.warning("Enter a title and date.");
    try {
      await planApi.post("key-dates/", {
        title: form.title.trim(),
        date: form.date,
        category: form.category,
        recurring_yearly: form.recurring_yearly,
        office_closed: form.office_closed,
        notes: form.notes,
        client_profile: form.forClient ? clientId : null,
      });
      setForm({ ...form, title: "", notes: "" });
      onChanged();
    } catch (err) {
      planError(err);
    }
  };

  const toggleClosed = async (k) => {
    try {
      await planApi.patch(`key-dates/${k.id}/`, { office_closed: !k.office_closed });
      onChanged();
    } catch (err) {
      planError(err);
    }
  };

  const remove = async (k) => {
    const ok = await confirmDialog({ title: "Delete key date?", message: `"${k.title}" will be removed${k.recurring_yearly ? " for every year" : ""}.`, confirmLabel: "Delete", tone: "danger" });
    if (!ok) return;
    try {
      await planApi.del(`key-dates/${k.id}/`);
      onChanged();
    } catch (err) {
      planError(err);
    }
  };

  return (
    <Modal title={`Key dates · ${monthLabel(monthKey)}`} subtitle="Festivals, national days and client events shown on the calendar." onClose={onClose} width={640}>
      <div className="pl-kd-list">
        {keyDates.length === 0 && <p className="pl-muted">No key dates this month.</p>}
        {keyDates.map((k) => {
          const cat = KEY_DATE_BY_ID[k.category] || KEY_DATE_BY_ID.other;
          return (
            <div key={k.id} className="pl-kd">
              <span className="pl-kd-date">{fmtDay(k.occurs_on)}</span>
              <span className="pl-kd-dot" style={{ background: cat.color }} />
              <div className="pl-kd-body">
                <strong>{k.title}</strong>
                <span className="pl-muted pl-small">
                  {cat.label}
                  {k.recurring_yearly && " · every year"}
                  {k.office_closed && " · office closed"}
                  {k.client_profile ? ` · ${clientName} only` : " · all clients"}
                </span>
              </div>
              <label className="pl-check pl-small" title="Deadlines skip days when the office is closed">
                <input type="checkbox" checked={k.office_closed} onChange={() => toggleClosed(k)} /> Closed
              </label>
              <button type="button" className="pl-icon-btn" onClick={() => remove(k)}>
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="pl-kd-form">
        <h5>Add a key date</h5>
        <p className="pl-muted pl-small">Festivals like Onam, Diwali or Eid change date every year — add them for this year.</p>
        <div className="pl-grid-2">
          <Field label="Title">
            <input className="pl-input" value={form.title} placeholder="Onam / Store anniversary" onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Date">
            <input className="pl-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Category">
            <select className="pl-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {KEY_DATE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="pl-field">
            <label className="pl-check">
              <input type="checkbox" checked={form.recurring_yearly} onChange={(e) => setForm({ ...form, recurring_yearly: e.target.checked })} /> Same date every year
            </label>
            <label className="pl-check">
              <input type="checkbox" checked={form.office_closed} onChange={(e) => setForm({ ...form, office_closed: e.target.checked })} /> Office closed (no work
              that day)
            </label>
            {clientId && (
              <label className="pl-check">
                <input type="checkbox" checked={form.forClient} onChange={(e) => setForm({ ...form, forClient: e.target.checked })} /> Only for {clientName}
              </label>
            )}
          </div>
        </div>
        <div className="pl-row-end">
          <button type="button" className="pl-btn pl-btn-primary pl-btn-sm" onClick={save}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Share plan with client ─── */

export function SharePlanModal({ plan, onClose }) {
  const link = typeof window !== "undefined" ? `${window.location.origin}/social/plan-review?token=${plan.client_approval_token}` : "";
  const message = `Hi! Here is the content plan for ${monthLabel(plan.month.slice(0, 7))} for ${plan.client_name}. Please review and approve: ${link}`;

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied.`);
    } catch {
      toast.error("Could not copy — select and copy it manually.");
    }
  };

  return (
    <Modal title="Send plan to client" subtitle="The client can review every planned post and approve or ask for changes — no login needed." onClose={onClose}>
      <Field label="Review link">
        <div className="pl-copy-row">
          <input className="pl-input" readOnly value={link} onFocus={(e) => e.target.select()} />
          <button type="button" className="pl-btn pl-btn-ghost-strong pl-btn-sm" onClick={() => copy(link, "Link")}>
            <Copy size={13} /> Copy
          </button>
        </div>
      </Field>
      <div className="pl-row-end" style={{ marginTop: 14 }}>
        <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" onClick={() => copy(message, "Message")}>
          <Copy size={13} /> Copy message
        </button>
        <a className="pl-btn pl-btn-whatsapp pl-btn-sm" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
          <MessageCircle size={13} /> Share on WhatsApp
        </a>
      </div>
    </Modal>
  );
}

/* ─── Close the month ─── */

export function CloseMonthModal({ plan, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const { progress } = plan;
  const policy = progress.billing.policy;
  const nextLabel = monthLabel(shiftMonth(plan.month.slice(0, 7), 1));
  const unfinished = progress.totals.not_started + progress.totals.in_progress;
  const short = progress.types.filter((t) => t.shortfall > 0);
  const extra = progress.types.filter((t) => t.extra > 0);

  useEffect(() => setBusy(false), [plan.id]);

  return (
    <Modal
      title={`Close ${monthLabel(plan.month.slice(0, 7))}`}
      subtitle="Locks the month and settles what wasn't delivered. This can't be undone."
      onClose={onClose}
      width={600}
      footer={
        <>
          <button type="button" className="pl-btn pl-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="pl-btn pl-btn-primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              setBusy(false);
            }}
          >
            {busy ? "Closing…" : "Close month"}
          </button>
        </>
      }
    >
      <table className="pl-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Target</th>
            <th>Delivered</th>
            <th>Short</th>
            <th>Extra</th>
          </tr>
        </thead>
        <tbody>
          {progress.types.map((t) => (
            <tr key={t.post_type}>
              <td>{typeMeta(t.post_type).label}</td>
              <td>{t.target}</td>
              <td>{t.delivered}</td>
              <td className={t.shortfall ? "pl-overdue" : ""}>{t.shortfall || "—"}</td>
              <td>{t.extra || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`pl-close-outcome ${policy}`}>
        <strong>{POLICY_META[policy]?.label}</strong>
        {policy === "carry_over" ? (
          <ul>
            {short.length ? (
              short.map((t) => (
                <li key={t.post_type}>
                  +{t.shortfall} {typeMeta(t.post_type).label} added to {nextLabel}
                </li>
              ))
            ) : (
              <li>Everything delivered — nothing to carry over.</li>
            )}
            {unfinished > 0 && <li>{unfinished} unfinished slot(s) move to {nextLabel} (unstarted ones need a new date).</li>}
          </ul>
        ) : (
          <ul>
            {short.length ? (
              <li>
                Deduct <b>{fmtMoney(progress.billing.deduction)}</b> from this month's bill ({short.map((t) => `${t.shortfall} ${typeMeta(t.post_type).label}`).join(", ")}).
              </li>
            ) : (
              <li>Everything delivered — no deduction.</li>
            )}
            {progress.totals.not_started > 0 && <li>{progress.totals.not_started} slot(s) never started will be dropped.</li>}
            <li>{nextLabel} stays at the normal package.</li>
          </ul>
        )}
        {extra.length > 0 && (
          <p className="pl-small">
            Extra delivered: {extra.map((t) => `${t.extra} ${typeMeta(t.post_type).label}`).join(", ")} ({fmtMoney(progress.billing.extra_value)}) — add to the bill if agreed.
          </p>
        )}
      </div>
    </Modal>
  );
}
