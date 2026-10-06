"use client";

import React, { useState } from "react";
import { AlertTriangle, Info, Pencil, Plus, Trash2, Wallet, XCircle } from "lucide-react";
import { Modal } from "./PlanUi";
import {
  CONTENT_TYPES,
  PLATFORM_OPTIONS,
  POLICY_META,
  fmtMoney,
  planApi,
  typeMeta,
  planError,
} from "./planningUtils";
import { toast } from "../SocialFeedback";

const WARN_ICON = { danger: XCircle, warning: AlertTriangle, info: Info };

/** Deliverables for the month: target vs planned vs delivered per content type, warnings and billing preview. */
export default function PlanQuotaStrip({ plan, onPlanChange, readOnly }) {
  const [editing, setEditing] = useState(false);
  const [showAllWarnings, setShowAllWarnings] = useState(false);
  const { progress } = plan;
  const billing = progress.billing;
  const policy = POLICY_META[billing.policy];
  const warnings = progress.warnings || [];
  const shownWarnings = showAllWarnings ? warnings : warnings.slice(0, 3);

  return (
    <div className="pl-quota-wrap">
      <div className="pl-quota-strip">
        {progress.types.length === 0 && (
          <div className="pl-quota-empty">
            No deliverables set for this month yet.
            {!readOnly && (
              <button type="button" className="pl-btn pl-btn-primary pl-btn-sm" onClick={() => setEditing(true)}>
                <Plus size={14} /> Set deliverables
              </button>
            )}
          </div>
        )}
        {progress.types.map((t) => {
          const meta = typeMeta(t.post_type);
          const Icon = meta.icon;
          const denom = Math.max(t.target, t.planned, 1);
          const seg = (n) => `${(n / denom) * 100}%`;
          return (
            <div key={t.post_type} className={`pl-quota-card ${t.outside_package ? "is-outside" : ""}`} style={{ "--q-color": meta.color }}>
              <div className="pl-quota-top">
                <span className="pl-quota-icon" style={{ background: meta.bg, color: meta.color }}>
                  <Icon size={16} />
                </span>
                <div className="pl-quota-title">
                  <strong>{meta.label}</strong>
                  <span>
                    {t.outside_package ? "Not in package" : `${t.quantity} in package`}
                    {t.carried_in > 0 && <em className="pl-carried"> +{t.carried_in} carried</em>}
                  </span>
                </div>
                <div className="pl-quota-count" title="Planned / target">
                  <b>{t.planned}</b>/{t.target}
                </div>
              </div>
              <div className="pl-bar" title={`${t.delivered} delivered · ${t.in_progress} in production · ${t.not_started} not started`}>
                <span className="pl-bar-done" style={{ width: seg(t.delivered) }} />
                <span className="pl-bar-prog" style={{ width: seg(t.in_progress) }} />
                <span className="pl-bar-plan" style={{ width: seg(t.not_started) }} />
              </div>
              <div className="pl-quota-foot">
                <span>
                  <i className="dot done" /> {t.delivered} done
                </span>
                <span>
                  <i className="dot prog" /> {t.in_progress} in work
                </span>
                {t.to_plan > 0 ? (
                  <span className="pl-quota-gap">{t.to_plan} to plan</span>
                ) : t.over_planned > 0 ? (
                  <span className="pl-quota-over">+{t.over_planned} extra</span>
                ) : (
                  <span className="pl-quota-ok">fully planned</span>
                )}
              </div>
            </div>
          );
        })}
        {progress.types.length > 0 && !readOnly && (
          <button type="button" className="pl-quota-edit" onClick={() => setEditing(true)} title="Change this month's deliverables">
            <Pencil size={15} />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="pl-quota-side">
        <div className="pl-billing" title={policy?.long}>
          <div className="pl-billing-head">
            <Wallet size={15} />
            <span>Billing</span>
            {policy && (
              <span className="pl-pill" style={{ color: policy.color, background: policy.bg }}>
                {policy.label}
              </span>
            )}
          </div>
          <div className="pl-billing-rows">
            {Number(billing.monthly_fee) > 0 && (
              <div>
                <span>Monthly fee</span>
                <b>{fmtMoney(billing.monthly_fee)}</b>
              </div>
            )}
            {billing.policy === "adjust_billing" ? (
              <div className={Number(billing.deduction) > 0 ? "neg" : ""}>
                <span>Deduction if not delivered</span>
                <b>-{fmtMoney(billing.deduction)}</b>
              </div>
            ) : (
              <div>
                <span>Pending (carries over)</span>
                <b>{progress.totals.shortfall} items</b>
              </div>
            )}
            {Number(billing.extra_value) > 0 && (
              <div className="pos">
                <span>Extra delivered</span>
                <b>+{fmtMoney(billing.extra_value)}</b>
              </div>
            )}
            {billing.estimated_bill !== null && billing.estimated_bill !== undefined && (
              <div className="total">
                <span>Estimated bill</span>
                <b>{fmtMoney(billing.estimated_bill)}</b>
              </div>
            )}
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="pl-warnings">
          {shownWarnings.map((w, i) => {
            const WIcon = WARN_ICON[w.level] || Info;
            return (
              <div key={i} className={`pl-warning lvl-${w.level}`}>
                <WIcon size={14} />
                <span>{w.message}</span>
              </div>
            );
          })}
          {warnings.length > 3 && (
            <button type="button" className="pl-link-btn" onClick={() => setShowAllWarnings((v) => !v)}>
              {showAllWarnings ? "Show less" : `+${warnings.length - 3} more`}
            </button>
          )}
        </div>
      )}

      {editing && <QuotaEditorModal plan={plan} onClose={() => setEditing(false)} onSaved={onPlanChange} />}
    </div>
  );
}

function QuotaEditorModal({ plan, onClose, onSaved }) {
  const [rows, setRows] = useState(() =>
    plan.quotas.map((q) => ({
      post_type: q.post_type,
      quantity: q.quantity,
      carried_in: q.carried_in,
      unit_price: q.unit_price,
      platforms: q.platforms || [],
      notes: q.notes || "",
    }))
  );
  const [fee, setFee] = useState(plan.monthly_fee || 0);
  const [saving, setSaving] = useState(false);
  const unused = CONTENT_TYPES.filter((t) => !rows.some((r) => r.post_type === t.id));

  const update = (i, patch) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const togglePlatform = (i, id) =>
    update(i, { platforms: rows[i].platforms.includes(id) ? rows[i].platforms.filter((p) => p !== id) : [...rows[i].platforms, id] });

  const save = async () => {
    setSaving(true);
    try {
      await planApi.patch(`plans/${plan.id}/`, { monthly_fee: fee || 0 });
      const data = await planApi.post(`plans/${plan.id}/set_quotas/`, { quotas: rows });
      onSaved(data);
      toast.success("Deliverables updated for this month.");
      onClose();
    } catch (err) {
      planError(err, "Could not save deliverables.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="This month's deliverables"
      subtitle="Change counts for this month only — e.g. 3 videos instead of the usual 4. Next month starts from these numbers."
      onClose={onClose}
      width={760}
      footer={
        <>
          <button type="button" className="pl-btn pl-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="pl-btn pl-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save deliverables"}
          </button>
        </>
      }
    >
      <table className="pl-table pl-quota-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>This month</th>
            <th title="Added from last month's shortfall (carry-over clients)">Carried in</th>
            <th>Price / item</th>
            <th>Platforms</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const meta = typeMeta(r.post_type);
            return (
              <tr key={r.post_type}>
                <td>
                  <span className="pl-type-tag" style={{ color: meta.color, background: meta.bg }}>
                    <meta.icon size={13} /> {meta.label}
                  </span>
                </td>
                <td>
                  <input className="pl-input pl-input-num" type="number" min={0} value={r.quantity} onChange={(e) => update(i, { quantity: e.target.value })} />
                </td>
                <td>
                  <input className="pl-input pl-input-num" type="number" min={0} value={r.carried_in} onChange={(e) => update(i, { carried_in: e.target.value })} />
                </td>
                <td>
                  <input className="pl-input pl-input-num" type="number" min={0} value={r.unit_price} onChange={(e) => update(i, { unit_price: e.target.value })} />
                </td>
                <td>
                  <div className="pl-chip-select">
                    {PLATFORM_OPTIONS.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={r.platforms.includes(p.id) ? "on" : ""}
                        onClick={() => togglePlatform(i, p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </td>
                <td>
                  <button type="button" className="pl-icon-btn" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {unused.length > 0 && (
        <div className="pl-add-row">
          <span>Add:</span>
          {unused.map((t) => (
            <button
              type="button"
              key={t.id}
              className="pl-btn pl-btn-ghost pl-btn-sm"
              onClick={() => setRows((prev) => [...prev, { post_type: t.id, quantity: 1, carried_in: 0, unit_price: 0, platforms: [], notes: "" }])}
            >
              <Plus size={13} /> {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="pl-grid-2" style={{ marginTop: 14 }}>
        <label className="pl-field">
          <span className="pl-field-label">Monthly fee (₹)</span>
          <input className="pl-input" type="number" min={0} value={fee} onChange={(e) => setFee(e.target.value)} />
          <span className="pl-field-hint">Used for the estimated bill. Per-item prices drive deductions and extras.</span>
        </label>
      </div>
    </Modal>
  );
}
