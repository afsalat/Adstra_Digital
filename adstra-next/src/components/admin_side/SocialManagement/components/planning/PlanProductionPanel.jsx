"use client";

import React, { useMemo, useState } from "react";
import { Camera, MapPin, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";
import { EmptyState, Field, Modal, Pill } from "./PlanUi";
import {
  PRODUCTION_METHODS,
  VENDOR_TYPES,
  fmtDay,
  planApi,
  slotTitle,
  typeMeta,
  planError,
} from "./planningUtils";
import { confirmDialog, toast } from "../SocialFeedback";

const SHOOT_STATUS = {
  planned: { label: "Planned", color: "#475569", bg: "#f1f5f9" },
  confirmed: { label: "Confirmed", color: "#0369a1", bg: "#f0f9ff" },
  done: { label: "Done", color: "#047857", bg: "#ecfdf5" },
  cancelled: { label: "Cancelled", color: "#b91c1c", bg: "#fef2f2" },
};

/** How this month's content gets made: AI / in-house / shoot days / outsourced teams. */
export default function PlanProductionPanel({ plan, items, shoots, vendors, readOnly, onChanged, onVendorsChange, onShootsChange }) {
  const [shootForm, setShootForm] = useState(null);
  const [vendorForm, setVendorForm] = useState(null);
  const active = items.filter((i) => i.stage !== "dropped");

  const methodCounts = useMemo(() => {
    const counts = {};
    active.forEach((i) => (counts[i.production_method] = (counts[i.production_method] || 0) + 1));
    return counts;
  }, [active]);

  const outsourcedByVendor = useMemo(() => {
    const groups = {};
    active
      .filter((i) => i.production_method === "outsourced")
      .forEach((i) => {
        const key = i.vendor_name || "No team chosen";
        (groups[key] = groups[key] || []).push(i);
      });
    return Object.entries(groups);
  }, [active]);

  const unassignedShootItems = active.filter((i) => i.production_method === "shoot" && !i.shoot);

  const deleteShoot = async (s) => {
    const ok = await confirmDialog({ title: "Delete shoot day?", message: "Slots in it stay in the plan without a shoot day.", confirmLabel: "Delete", tone: "danger" });
    if (!ok) return;
    try {
      await planApi.del(`shoots/${s.id}/`);
      onShootsChange();
      onChanged();
    } catch (err) {
      planError(err);
    }
  };

  return (
    <div className="pl-production">
      <div className="pl-method-strip">
        {PRODUCTION_METHODS.map((m) => (
          <div key={m.id} className="pl-method-card" style={{ "--m-color": m.color }}>
            <m.icon size={18} />
            <div>
              <b>{methodCounts[m.id] || 0}</b>
              <span>{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      <section className="pl-card">
        <div className="pl-card-head">
          <h4 className="pl-card-title">
            <Camera size={16} /> Shoot days
          </h4>
          {!readOnly && (
            <button type="button" className="pl-btn pl-btn-primary pl-btn-sm" onClick={() => setShootForm({})}>
              <Plus size={14} /> Plan a shoot
            </button>
          )}
        </div>
        <p className="pl-muted pl-small">Most videos are AI-generated. When a shoot is needed, batch several videos into one day to save time.</p>
        {unassignedShootItems.length > 0 && (
          <div className="pl-warning lvl-warning" style={{ marginBottom: 10 }}>
            {unassignedShootItems.length} slot(s) need a shoot but aren't on a shoot day yet.
          </div>
        )}
        {shoots.length === 0 ? (
          <EmptyState icon={Camera} title="No shoots this month" />
        ) : (
          <div className="pl-shoot-list">
            {shoots.map((s) => {
              const st = SHOOT_STATUS[s.status] || SHOOT_STATUS.planned;
              const shootItems = items.filter((i) => i.shoot === s.id);
              return (
                <div key={s.id} className="pl-shoot">
                  <div className="pl-shoot-date">
                    <b>{fmtDay(s.date, { day: "numeric" })}</b>
                    <span>{fmtDay(s.date, { month: "short", weekday: "short" })}</span>
                  </div>
                  <div className="pl-shoot-body">
                    <div className="pl-shoot-title">
                      <strong>{s.title || "Shoot"}</strong>
                      <Pill color={st.color} bg={st.bg}>
                        {st.label}
                      </Pill>
                    </div>
                    <div className="pl-shoot-meta">
                      {s.start_time && <span>{s.start_time.slice(0, 5)}</span>}
                      {s.location && (
                        <span>
                          <MapPin size={12} /> {s.location}
                        </span>
                      )}
                      {s.vendor_name && (
                        <span>
                          <Users size={12} /> {s.vendor_name}
                        </span>
                      )}
                      {s.crew && <span>Crew: {s.crew}</span>}
                    </div>
                    {s.props && <p className="pl-small">Props: {s.props}</p>}
                    <div className="pl-shoot-items">
                      {shootItems.length === 0 ? (
                        <span className="pl-muted pl-small">No videos assigned</span>
                      ) : (
                        shootItems.map((i) => {
                          const meta = typeMeta(i.post_type);
                          return (
                            <span key={i.id} className="pl-type-tag" style={{ color: meta.color, background: meta.bg }}>
                              <meta.icon size={11} /> {slotTitle(i)}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <div className="pl-shoot-actions">
                      <button type="button" className="pl-icon-btn" onClick={() => setShootForm(s)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="pl-icon-btn" onClick={() => deleteShoot(s)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="pl-card">
        <h4 className="pl-card-title">
          <Users size={16} /> Outsourced this month
        </h4>
        {outsourcedByVendor.length === 0 ? (
          <p className="pl-muted pl-small">Nothing outsourced. Set a slot's production to “Outsourced Team” to send it to a partner (e.g. anchoring).</p>
        ) : (
          outsourcedByVendor.map(([vendor, list]) => (
            <div key={vendor} className="pl-vendor-group">
              <strong>{vendor}</strong> <span className="pl-muted">· {list.length} item(s)</span>
              <ul>
                {list.map((i) => (
                  <li key={i.id}>
                    {fmtDay(i.planned_date)} — {slotTitle(i)} {i.current_due && <span className="pl-muted">(script due {fmtDay(i.deadlines?.script)})</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="pl-card">
        <div className="pl-card-head">
          <h4 className="pl-card-title">Partner teams (vendors)</h4>
          {!readOnly && (
            <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" onClick={() => setVendorForm({})}>
              <Plus size={14} /> Add team
            </button>
          )}
        </div>
        {vendors.length === 0 ? (
          <p className="pl-muted pl-small">Add the anchoring / production teams you work with so you can assign work to them.</p>
        ) : (
          <table className="pl-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Rate</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className={v.is_active ? "" : "is-dropped"}>
                  <td>
                    <b>{v.name}</b>
                    {v.notes && <span className="pl-sub">{v.notes}</span>}
                  </td>
                  <td>{v.vendor_type_display}</td>
                  <td>
                    {v.contact_person}
                    {v.phone && (
                      <span className="pl-sub">
                        <Phone size={11} /> <a href={`tel:${v.phone}`}>{v.phone}</a>
                      </span>
                    )}
                  </td>
                  <td>
                    {v.rate_note || <span className="pl-muted">—</span>}
                    {v.turnaround_days > 0 && <span className="pl-sub">{v.turnaround_days} working days turnaround</span>}
                  </td>
                  <td>
                    {!readOnly && (
                      <button type="button" className="pl-icon-btn" onClick={() => setVendorForm(v)}>
                        <Pencil size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {shootForm && (
        <ShootModal
          shoot={shootForm}
          plan={plan}
          items={active}
          vendors={vendors}
          onClose={() => setShootForm(null)}
          onSaved={() => {
            onShootsChange();
            onChanged();
          }}
        />
      )}
      {vendorForm && <VendorModal vendor={vendorForm} onClose={() => setVendorForm(null)} onSaved={onVendorsChange} />}
    </div>
  );
}

function ShootModal({ shoot, plan, items, vendors, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: shoot.title || "",
    date: shoot.date || "",
    start_time: (shoot.start_time || "").slice(0, 5),
    location: shoot.location || "",
    crew: shoot.crew || "",
    props: shoot.props || "",
    vendor: shoot.vendor || null,
    status: shoot.status || "planned",
    notes: shoot.notes || "",
  });
  const candidates = items.filter((i) => ["reel", "video"].includes(i.post_type) || i.production_method === "shoot");
  const [picked, setPicked] = useState(() => new Set(items.filter((i) => shoot.id && i.shoot === shoot.id).map((i) => i.id)));
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.date) return toast.warning("Pick the shoot date.");
    setSaving(true);
    try {
      const body = { ...form, start_time: form.start_time || null, client_profile: plan.client_profile, plan: plan.id };
      const saved = shoot.id ? await planApi.patch(`shoots/${shoot.id}/`, body) : await planApi.post("shoots/", body);
      const before = new Set(items.filter((i) => i.shoot === saved.id).map((i) => i.id));
      const add = [...picked].filter((id) => !before.has(id));
      const remove = [...before].filter((id) => !picked.has(id));
      if (add.length) await planApi.post("plan-items/bulk/", { ids: add, action: "update", fields: { shoot: saved.id, production_method: "shoot" } });
      if (remove.length) await planApi.post("plan-items/bulk/", { ids: remove, action: "update", fields: { shoot: null } });
      toast.success("Shoot day saved.");
      onSaved();
      onClose();
    } catch (err) {
      planError(err, "Could not save the shoot.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={shoot.id ? "Edit shoot day" : "Plan a shoot day"}
      onClose={onClose}
      width={720}
      footer={
        <>
          <button type="button" className="pl-btn pl-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="pl-btn pl-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save shoot"}
          </button>
        </>
      }
    >
      <div className="pl-grid-2">
        <Field label="Title">
          <input className="pl-input" value={form.title} placeholder="Showroom shoot" onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Status">
          <select className="pl-input" value={form.status} onChange={(e) => set({ status: e.target.value })}>
            {Object.entries(SHOOT_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input className="pl-input" type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} />
        </Field>
        <Field label="Start time">
          <input className="pl-input" type="time" value={form.start_time} onChange={(e) => set({ start_time: e.target.value })} />
        </Field>
        <Field label="Location">
          <input className="pl-input" value={form.location} onChange={(e) => set({ location: e.target.value })} />
        </Field>
        <Field label="Partner team (optional)">
          <select className="pl-input" value={form.vendor || ""} onChange={(e) => set({ vendor: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Our own team</option>
            {vendors.filter((v) => v.is_active).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Crew / talent">
          <textarea className="pl-input" rows={2} value={form.crew} onChange={(e) => set({ crew: e.target.value })} />
        </Field>
        <Field label="Props / things to bring">
          <textarea className="pl-input" rows={2} value={form.props} onChange={(e) => set({ props: e.target.value })} />
        </Field>
        <Field label="Videos to shoot this day" span={2}>
          {candidates.length === 0 ? (
            <span className="pl-muted pl-small">No reels or videos in this plan yet.</span>
          ) : (
            <div className="pl-pick-list">
              {candidates.map((i) => {
                const meta = typeMeta(i.post_type);
                return (
                  <label key={i.id} className="pl-check">
                    <input
                      type="checkbox"
                      checked={picked.has(i.id)}
                      onChange={() =>
                        setPicked((prev) => {
                          const next = new Set(prev);
                          next.has(i.id) ? next.delete(i.id) : next.add(i.id);
                          return next;
                        })
                      }
                    />
                    <span style={{ color: meta.color }}>{meta.label}</span> {slotTitle(i)}
                    <span className="pl-muted">· {fmtDay(i.planned_date)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </Field>
        <Field label="Notes" span={2}>
          <textarea className="pl-input" rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}

function VendorModal({ vendor, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: vendor.name || "",
    vendor_type: vendor.vendor_type || "anchoring",
    contact_person: vendor.contact_person || "",
    phone: vendor.phone || "",
    email: vendor.email || "",
    rate_note: vendor.rate_note || "",
    turnaround_days: vendor.turnaround_days || 0,
    notes: vendor.notes || "",
    is_active: vendor.is_active ?? true,
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.name.trim()) return toast.warning("Enter the team's name.");
    try {
      vendor.id ? await planApi.patch(`vendors/${vendor.id}/`, form) : await planApi.post("vendors/", form);
      toast.success("Partner team saved.");
      onSaved();
      onClose();
    } catch (err) {
      planError(err);
    }
  };

  return (
    <Modal
      title={vendor.id ? "Edit partner team" : "Add partner team"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="pl-btn pl-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="pl-btn pl-btn-primary" onClick={save}>
            Save
          </button>
        </>
      }
    >
      <div className="pl-grid-2">
        <Field label="Name">
          <input className="pl-input" value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Type">
          <select className="pl-input" value={form.vendor_type} onChange={(e) => set({ vendor_type: e.target.value })}>
            {VENDOR_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Contact person">
          <input className="pl-input" value={form.contact_person} onChange={(e) => set({ contact_person: e.target.value })} />
        </Field>
        <Field label="Phone">
          <input className="pl-input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Email">
          <input className="pl-input" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Rate">
          <input className="pl-input" value={form.rate_note} placeholder="₹3,000 per video" onChange={(e) => set({ rate_note: e.target.value })} />
        </Field>
        <Field label="Turnaround (working days)" hint="How long they need to deliver. Used for deadlines of work sent to them; 0 = use defaults.">
          <input
            className="pl-input pl-input-num"
            type="number"
            min={0}
            value={form.turnaround_days}
            onChange={(e) => set({ turnaround_days: Math.max(0, Number(e.target.value)) })}
          />
        </Field>
        <Field label="Notes" span={2}>
          <textarea className="pl-input" rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
        </Field>
        <label className="pl-check">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set({ is_active: e.target.checked })} /> Active
        </label>
      </div>
    </Modal>
  );
}
