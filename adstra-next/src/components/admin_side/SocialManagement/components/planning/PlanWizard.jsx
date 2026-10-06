"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./PlanWizard.css";
import { CalendarDays, Check, ChevronDown, ExternalLink, Lock, Minus, Play, Plus, Send, Sparkles, Trash2, X } from "lucide-react";
import ClientCompanySearchSelect from "../ClientCompanySearchSelect";
import ScriptCreationModal from "../ScriptCreationModal";
import { confirmDialog, toast } from "../SocialFeedback";
import { CloseMonthModal, SharePlanModal } from "./PlanModals";
import { ITEM_STAGE, KEY_DATE_BY_ID, PLAN_STATUS, fmtDay, monthKeyOf, monthLabel, parseISODate, planApi, planError, toISODate, todayISO, tzOffset, typeMeta } from "./planningUtils";

const MAIN_TYPES = ["video", "image", "carousel"];
const MORE_TYPES = ["reel", "text"];
const ALL_TYPES = [...MAIN_TYPES, ...MORE_TYPES];
const FESTIVE_OFFSETS = [0, 2, 4, 6, 8]; // 2nd, 3rd... post for the same festival go out earlier

let uidSeq = 0;
const newRow = (type, extra = {}) => ({ uid: `r${++uidSeq}`, type, date: "", manual: false, keyDate: null, title: "", ...extra });

/* ─── Date helpers ─── */

function monthDays(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  const today = todayISO();
  const days = [];
  for (let d = 1; d <= last; d++) {
    const iso = toISODate(new Date(y, m - 1, d));
    if (iso <= today && monthKey === monthKeyOf()) continue; // nothing in the past for the current month
    days.push(iso);
  }
  const working = days.filter((iso) => parseISODate(iso).getDay() !== 0); // skip Sundays
  return working.length ? working : days;
}

/** n dates spread evenly across the month, avoiding days already taken. */
function spreadDates(monthKey, n, taken) {
  const days = monthDays(monthKey);
  if (!days.length || n <= 0) return Array(n).fill("");
  const free = days.filter((d) => !taken.has(d));
  const pool = free.length >= n ? free : days;
  const picked = [];
  const left = [...pool];
  for (let i = 0; i < n && left.length; i++) {
    const ideal = ((i + 0.5) / n) * pool.length - 0.5;
    let bestIdx = 0;
    left.forEach((d, idx) => {
      if (Math.abs(pool.indexOf(d) - ideal) < Math.abs(pool.indexOf(left[bestIdx]) - ideal)) bestIdx = idx;
    });
    picked.push(left.splice(bestIdx, 1)[0]);
  }
  while (picked.length < n) picked.push(pool[picked.length % pool.length]);
  return picked.sort();
}

/** Re-spread the dates of every row the user has not touched by hand. */
function arrange(rows, monthKey) {
  const next = rows.map((r) => ({ ...r }));
  for (const type of ALL_TYPES) {
    const auto = next.filter((r) => r.type === type && !r.manual && !r.keyDate);
    if (!auto.length) continue;
    const taken = new Set(next.filter((r) => r.type === type && (r.manual || r.keyDate) && r.date).map((r) => r.date));
    spreadDates(monthKey, auto.length, taken).forEach((d, i) => (auto[i].date = d));
  }
  return next;
}

function withQty(rows, type, qty, monthKey) {
  const current = rows.filter((r) => r.type === type);
  let next = rows;
  if (qty > current.length) {
    next = [...rows, ...Array.from({ length: qty - current.length }, () => newRow(type))];
  } else if (qty < current.length) {
    // drop the plain rows first, festival-linked ones last
    const order = current.filter((r) => !r.locked).sort((a, b) => Number(!!a.keyDate) - Number(!!b.keyDate) || Number(a.manual) - Number(b.manual) || (a.date < b.date ? 1 : -1));
    const drop = new Set(order.slice(0, current.length - qty).map((r) => r.uid));
    next = rows.filter((r) => !drop.has(r.uid));
  }
  return arrange(next, monthKey);
}

const weekday = (iso) => (iso ? parseISODate(iso).toLocaleDateString("en-GB", { weekday: "short" }) : "");

/* ─── Component ─── */

const rowFromItem = (i) => ({
  uid: `r${++uidSeq}`,
  id: i.id,
  type: i.post_type,
  date: i.planned_date || "",
  manual: true,
  keyDate: i.key_date || null,
  title: i.title || "",
  locked: !!i.post,
  stage: i.stage,
  postInfo: i.post_info,
});

/** Create a month's plan, or (with planId) view and edit it: deliverables, dates, festivals, scripts and sign-off in one popup. */
export default function PlanWizard({ clients = [], packages = [], planId = null, initialClientId = "", initialMonth, onClose, onCreated, onChanged, onOpenPost }) {
  const [clientId, setClientId] = useState(initialClientId ? String(initialClientId) : "");
  const [monthKey, setMonthKey] = useState(initialMonth || monthKeyOf());
  const [rows, setRows] = useState([]);
  const [keyDates, setKeyDates] = useState([]);
  const [clientPlans, setClientPlans] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newFestival, setNewFestival] = useState(null);
  const [festType, setFestType] = useState("image");
  const [festOpen, setFestOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(!!planId);
  const [sub, setSub] = useState(null); // share | close
  const [scriptPost, setScriptPost] = useState(null); // post whose script editor is open
  const editing = !!planId;
  const readOnly = plan?.status === "closed";
  const monthRef = useRef(monthKey);

  const client = clients.find((c) => String(c.id) === clientId);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // A different month: festival links no longer apply, dates are re-spread inside the new month
  useEffect(() => {
    if (monthRef.current === monthKey) return;
    monthRef.current = monthKey;
    setRows((rs) => arrange(rs.map((r) => ({ ...r, keyDate: null, manual: false })), monthKey));
  }, [monthKey]);

  const loadKeyDates = () =>
    planApi.get("key-dates/", { month: monthKey, client_id: clientId || "all" }).then((list) => setKeyDates([...list].sort((a, b) => (a.occurs_on < b.occurs_on ? -1 : 1)))).catch(() => {});
  useEffect(() => {
    loadKeyDates();
  }, [monthKey, clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPlan = (data) => {
    setPlan(data);
    const items = (data.items || []).filter((i) => i.stage !== "dropped");
    if (items.some((i) => i.key_date)) setFestOpen(true);
    setRows(items.map(rowFromItem));
  };
  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    planApi
      .get(`plans/${planId}/`)
      .then(applyPlan)
      .catch((err) => planError(err, "Could not load the plan."))
      .finally(() => setLoading(false));
  }, [planId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editing) return;
    if (!clientId) return setClientPlans([]);
    planApi.get("plans/", { client_id: clientId }).then(setClientPlans).catch(() => setClientPlans([]));
  }, [clientId, editing]);

  const existing = editing ? null : clientPlans.find((p) => p.month.slice(0, 7) === monthKey);
  const previous = useMemo(() => clientPlans.filter((p) => p.month.slice(0, 7) < monthKey).sort((a, b) => (a.month < b.month ? 1 : -1))[0], [clientPlans, monthKey]);

  const qty = (type) => rows.filter((r) => r.type === type).length;
  const setQty = (type, n) => setRows((rs) => withQty(rs, type, Math.max(0, Math.min(60, n || 0)), monthKey));

  const fillFrom = (quotas) => {
    setRows((rs) => {
      let next = rs;
      const wanted = Object.fromEntries((quotas || []).map((q) => [q.post_type, Number(q.quantity) || 0]));
      for (const type of ALL_TYPES) next = withQty(next, type, wanted[type] || 0, monthKey);
      return next;
    });
    if ((quotas || []).some((q) => MORE_TYPES.includes(q.post_type) && q.quantity)) setShowMore(true);
  };

  const updateRow = (uid, patch) => setRows((rs) => rs.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));
  const removeRow = (uid) => setRows((rs) => arrange(rs.filter((r) => r.uid !== uid || r.locked), monthKey));
  const changeType = (uid, type) => setRows((rs) => arrange(rs.map((r) => (r.uid === uid && !r.locked ? { ...r, type } : r)), monthKey));

  const linkRow = (uid, kd) =>
    setRows((rs) => {
      const nth = rs.filter((r) => r.keyDate === kd.id && r.uid !== uid).length;
      const date = kd.occurs_on ? toISODate(new Date(parseISODate(kd.occurs_on).getTime() - (FESTIVE_OFFSETS[nth] || 0) * 86400000)) : "";
      return arrange(rs.map((r) => (r.uid === uid ? { ...r, keyDate: kd.id, date: date || r.date, manual: true } : r)), monthKey);
    });
  const unlinkRow = (uid) => setRows((rs) => arrange(rs.map((r) => (r.uid === uid ? { ...r, keyDate: null, manual: false } : r)), monthKey));

  const addFestivalPost = (kd, type = "image") =>
    setRows((rs) => {
      const free = rs.find((r) => !r.keyDate && !r.manual && r.type === type);
      const target = free || newRow(type);
      const base = free ? rs : [...rs, target];
      const nth = rs.filter((r) => r.keyDate === kd.id).length;
      const date = toISODate(new Date(parseISODate(kd.occurs_on).getTime() - (FESTIVE_OFFSETS[nth] || 0) * 86400000));
      return arrange(base.map((r) => (r.uid === target.uid ? { ...r, keyDate: kd.id, date, manual: true } : r)), monthKey);
    });
  const removeFestivalPost = (kd) =>
    setRows((rs) => {
      const last = [...rs].reverse().find((r) => r.keyDate === kd.id);
      return last ? arrange(rs.map((r) => (r.uid === last.uid ? { ...r, keyDate: null, manual: false } : r)), monthKey) : rs;
    });

  const saveFestival = async () => {
    if (!newFestival?.title?.trim() || !newFestival?.date) return toast.error("Give the festival a name and a date.");
    try {
      await planApi.post("key-dates/", { title: newFestival.title.trim(), date: newFestival.date, category: "festival", recurring_yearly: false });
      setNewFestival(null);
      loadKeyDates();
    } catch (err) {
      planError(err, "Could not add the festival.");
    }
  };

  const slotsPayload = () =>
    [...rows]
      .sort((x, y) => (x.date || "9").localeCompare(y.date || "9"))
      .map((r) => ({ id: r.id, post_type: r.type, planned_date: r.date || null, title: r.title, key_date: r.keyDate }));

  /** Saves the schedule. Returns the saved plan, or null on failure. */
  const save = async () => {
    try {
      const data = editing
        ? await planApi.post(`plans/${planId}/sync_slots/`, { slots: slotsPayload() })
        : await planApi.post("plans/wizard/", { client_profile: clientId, month: monthKey, slots: slotsPayload() });
      applyPlan(data);
      onChanged?.();
      return data;
    } catch (err) {
      planError(err, "Could not save the plan.");
      return null;
    }
  };

  const submit = async () => {
    setBusy(true);
    const data = await save();
    setBusy(false);
    if (!data) return;
    toast.success(editing ? "Plan saved." : `Plan created for ${client?.name || "client"} · ${monthLabel(monthKey)}.`);
    if (editing) onClose?.();
    else onCreated?.(clientId, monthKey, data.id);
  };

  const planAction = async (path, success) => {
    setBusy(true);
    try {
      if (!(await save())) return null;
      const data = await planApi.post(`plans/${planId}/${path}/`, {});
      setPlan(data);
      if (success) toast.success(success);
      onChanged?.();
      return data;
    } catch (err) {
      planError(err);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const sendToClient = async () => {
    if (await planAction("send_to_client", "Marked as sent. Share the link with the client.")) setSub("share");
  };
  const markApproved = async () => {
    const ok = await confirmDialog({ title: "Mark as approved?", message: "Use this when the client approved on a call, WhatsApp or in a meeting.", confirmLabel: "Mark approved" });
    if (ok) planAction("mark_approved", "Plan marked as approved.");
  };
  const closeMonth = async () => {
    if (await planAction("close_month", "Month closed.")) setSub(null);
  };

  // Start (if needed) and open one slot's script; whoever saves it becomes the post's owner
  const openScript = async (row) => {
    setBusy(true);
    try {
      let postId = row.postInfo?.id;
      if (!postId) {
        if (!(await save())) return;
        const res = await planApi.post(`plan-items/${row.id}/start_script/`, { tz_offset: tzOffset() });
        postId = res.created_post_id;
        applyPlan(await planApi.get(`plans/${planId}/`));
        onChanged?.(true);
      }
      setScriptPost(await planApi.get(`posts/${postId}/`));
    } catch (err) {
      planError(err, "Could not open the script.");
    } finally {
      setBusy(false);
    }
  };

  const startScripts = async (ids) => {
    setBusy(true);
    try {
      if (!(await save())) return;
      const fresh = await planApi.get(`plans/${planId}/`);
      const wanted = ids || fresh.items.filter((i) => !i.post && i.stage !== "dropped").map((i) => i.id);
      if (!wanted.length) return toast.info("Every post already has a script started.");
      await planApi.post("plan-items/bulk/", { ids: wanted, action: "start_script", tz_offset: tzOffset() });
      applyPlan(await planApi.get(`plans/${planId}/`));
      toast.success(`${wanted.length} script${wanted.length > 1 ? "s" : ""} started. Whoever fills one in becomes its owner.`);
      onChanged?.(true);
    } catch (err) {
      planError(err, "Could not start the scripts.");
    } finally {
      setBusy(false);
    }
  };

  const sorted = useMemo(() => [...rows].sort((a, b) => (a.date || "9").localeCompare(b.date || "9")), [rows]);
  const festivalPosts = rows.filter((r) => r.keyDate).length;
  const summary = ALL_TYPES.filter((t) => qty(t)).map((t) => `${qty(t)} ${typeMeta(t).label.toLowerCase()}${qty(t) > 1 ? "s" : ""}`).join(" · ");
  const keyDateById = Object.fromEntries(keyDates.map((k) => [k.id, k]));
  const dateFestival = (iso) => keyDates.find((k) => k.occurs_on === iso);
  const canSave = clientId && rows.length > 0 && !existing && !busy && !readOnly;
  const status = plan ? PLAN_STATUS[plan.status] : null;
  const unstarted = rows.filter((r) => r.id && !r.locked).length;
  const visibleTypes = showMore || MORE_TYPES.some(qty) ? ALL_TYPES : MAIN_TYPES;
  const [y, m] = monthKey.split("-");

  const lastDay = new Date(Number(y), Number(m), 0).getDate();

  const renderRow = (r, idx) => {
    const meta = typeMeta(r.type);
    const linked = r.keyDate ? keyDateById[r.keyDate] : null;
    const sameDay = !linked && r.date ? dateFestival(r.date) : null;
    return (
      <div key={r.uid} className={`pw-post ${linked ? "festive" : ""}`}>
        <div className="pw-post-top">
          <span className="pw-post-n">{idx + 1}</span>
          <input
            type="date"
            className="pl-input pw-post-date"
            value={r.date}
            min={`${monthKey}-01`}
            max={`${monthKey}-${lastDay}`}
            disabled={readOnly}
            onChange={(e) => updateRow(r.uid, { date: e.target.value, manual: true })}
            aria-label="Publish date"
          />
          <span className="pw-post-day">{weekday(r.date)}</span>
          <select
          className={`pl-input pw-post-fest ${linked ? "on" : ""}`}
          value={r.keyDate || ""}
          disabled={readOnly}
          onChange={(e) => (e.target.value ? linkRow(r.uid, keyDates.find((k) => String(k.id) === e.target.value)) : unlinkRow(r.uid))}
          aria-label="Festival"
        >
          <option value="">No festival</option>
          {keyDates.map((k) => (
            <option key={k.id} value={k.id}>
              {k.title} · {fmtDay(k.occurs_on)}
            </option>
          ))}
        </select>
          {editing && (
            <span className="pw-post-state">
              {r.locked ? (
                <>
                  {r.stage === "script" && r.postInfo && !readOnly && (
                    <button type="button" className="pw-mini primary" disabled={busy} onClick={() => openScript(r)} title="Fill in the script">
                      <Play size={12} /> Write
                    </button>
                  )}
                  <span className="pw-stage" style={{ color: (ITEM_STAGE[r.stage] || ITEM_STAGE.script).color, background: (ITEM_STAGE[r.stage] || ITEM_STAGE.script).bg }}>
                    {(ITEM_STAGE[r.stage] || ITEM_STAGE.script).label}
                  </span>
                  {r.postInfo && onOpenPost && (
                    <button type="button" className="pw-mini" onClick={() => onOpenPost(r.postInfo)} title="Open the post">
                      <ExternalLink size={12} />
                    </button>
                  )}
                </>
              ) : r.id && !readOnly ? (
                <button type="button" className="pw-mini primary" disabled={busy} onClick={() => openScript(r)} title="Start and fill in the script">
                  <Play size={12} /> Script
                </button>
              ) : null}
            </span>
          )}
          <button type="button" className="pl-icon-btn pw-post-del" disabled={r.locked || readOnly} onClick={() => removeRow(r.uid)} aria-label="Remove post" title={r.locked ? "A script is already started" : "Remove"}>
            <Trash2 size={14} />
          </button>
        </div>
        <input
          className="pl-input pw-post-title"
          placeholder={linked ? `${linked.title} post, add a topic if you like` : "Topic (optional)"}
          value={r.title}
          disabled={readOnly}
          onChange={(e) => updateRow(r.uid, { title: e.target.value })}
        />
        {sameDay && !readOnly && (
          <button type="button" className="pw-hint" onClick={() => linkRow(r.uid, sameDay)}>
            Falls on {sameDay.title}. Link it
          </button>
        )}
      </div>
    );
  };

  return (
    <>
    <div className="pw-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="pw" role="dialog" aria-modal="true" aria-label="Create plan">
        <header className="pw-head">
          <div>
            <h2>
              {editing ? "Content plan" : "Create content plan"}
              {status && (
                <span className="pw-status" style={{ color: status.color, background: status.bg }}>
                  {readOnly && <Lock size={11} />} {status.label}
                </span>
              )}
            </h2>
            <p>{editing ? "Change the numbers and dates, start scripts and send it to the client, all here." : "Company and month, how many of each, then the dates."}</p>
          </div>
          <button type="button" className="pl-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="pw-body">
          {/* Row 1: company + month, side by side */}
          <div className="pw-who">
            <div className="pw-who-field">
              <span className="pw-label">Company</span>
              {editing ? (
                <div className="pw-fixed">{client?.name || plan?.client_name}</div>
              ) : (
                <ClientCompanySearchSelect clients={clients} value={clientId} onChange={(id) => setClientId(id && id !== "all" ? String(id) : "")} />
              )}
            </div>
            <div className="pw-who-field">
              <span className="pw-label">Month</span>
              {editing ? (
                <div className="pw-fixed">{monthLabel(monthKey)}</div>
              ) : (
                <input type="month" className="pl-input" value={monthKey} onChange={(e) => e.target.value && setMonthKey(e.target.value)} aria-label="Plan month" />
              )}
            </div>
            {!editing && (previous || packages.length > 0) && (
              <div className="pw-who-field pw-quick">
                <span className="pw-label">Quick fill</span>
                <div className="pw-quick-chips">
                  {previous && (
                    <button type="button" className="pw-chip" onClick={() => fillFrom(previous.quotas)}>
                      Same as {monthLabel(previous.month.slice(0, 7), { month: "short", year: "numeric" })}
                    </button>
                  )}
                  {packages.slice(0, 3).map((p) => (
                    <button type="button" key={p.id} className="pw-chip" onClick={() => fillFrom(p.quotas)}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="pw-empty">Loading plan…</div>
          ) : existing ? (
            <div className="pw-exists">
              <CalendarDays size={30} />
              <h4>
                {client?.name} already has a plan for {monthLabel(monthKey)}
              </h4>
              <p>Open it to change the deliverables or dates, or pick another month.</p>
              <button type="button" className="pl-btn pl-btn-primary" onClick={() => onCreated?.(clientId, monthKey, existing.id)}>
                Open existing plan
              </button>
            </div>
          ) : (
            <>
              {plan?.status === "changes_requested" && plan.client_feedback && (
                <div className="pw-banner danger">
                  <strong>Client asked for changes:</strong> {plan.client_feedback}
                </div>
              )}
              {plan?.status === "approved" && (
                <div className="pw-banner ok">
                  <strong>Approved{plan.approved_by_name ? ` by ${plan.approved_by_name}` : ""}.</strong> {plan.client_feedback}
                </div>
              )}
              {readOnly && <div className="pw-banner">This month is closed, so the plan is read-only.</div>}

              {/* Row 2: festivals */}
              <div className={`pw-fest-bar ${festOpen ? "open" : ""}`}>
                <div className="pw-fest-head">
                  <button type="button" className="pw-toggle" role="switch" aria-checked={festOpen} onClick={() => setFestOpen((v) => !v)}>
                    <span className="pw-switch" />
                    <span>Festival posts</span>
                    <small>
                      {festOpen ? `${monthLabel(monthKey, { month: "long" })} · ${keyDates.length} special days` : rows.some((r) => r.keyDate) ? `${rows.filter((r) => r.keyDate).length} planned` : "Off"}
                    </small>
                  </button>
                  {festOpen && !readOnly && (
                    <div className="pw-seg" title="Format used when you tap + on a festival">
                      <span>Add as</span>
                      {MAIN_TYPES.map((t) => (
                        <button type="button" key={t} className={festType === t ? "on" : ""} onClick={() => setFestType(t)}>
                          {typeMeta(t).label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {festOpen && (
                <div className="pw-fests">
                  {keyDates.length === 0 && <span className="pl-muted pl-small">No festivals listed for this month.</span>}
                  {keyDates.map((k) => {
                    const cat = KEY_DATE_BY_ID[k.category] || KEY_DATE_BY_ID.other;
                    const n = rows.filter((r) => r.keyDate === k.id).length;
                    return (
                      <div key={k.id} className={`pw-fest ${n ? "on" : ""}`} style={{ "--fc": cat.color }}>
                        <div className="pw-fest-text">
                          <strong>{k.title}</strong>
                          <span>
                            {fmtDay(k.occurs_on)}
                            {k.notes && ["Kerala", "India", "World"].includes(k.notes) ? ` · ${k.notes}` : ""}
                          </span>
                        </div>
                        {!readOnly && (
                          <div className="pw-fest-ctl">
                            {n > 0 && (
                              <>
                                <button type="button" onClick={() => removeFestivalPost(k)} aria-label={`Remove a ${k.title} post`}>
                                  <Minus size={13} />
                                </button>
                                <b>{n}</b>
                              </>
                            )}
                            <button type="button" onClick={() => addFestivalPost(k, festType)} aria-label={`Add a ${k.title} post`}>
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {!readOnly &&
                    (newFestival ? (
                      <div className="pw-fest-new">
                        <input className="pl-input" placeholder="Festival / event name" value={newFestival.title} onChange={(e) => setNewFestival({ ...newFestival, title: e.target.value })} />
                        <input type="date" className="pl-input" value={newFestival.date} min={`${monthKey}-01`} onChange={(e) => setNewFestival({ ...newFestival, date: e.target.value })} />
                        <button type="button" className="pl-btn pl-btn-primary pl-btn-sm" onClick={saveFestival}>
                          <Check size={13} /> Save
                        </button>
                        <button type="button" className="pl-icon-btn" onClick={() => setNewFestival(null)} aria-label="Cancel">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="pw-fest-add" onClick={() => setNewFestival({ title: "", date: `${monthKey}-01` })}>
                        <Plus size={13} /> Add festival / event
                      </button>
                    ))}
                </div>
                )}
              </div>

              {/* Row 3: one column per format: box + quantity on top, its schedule underneath */}
              <div className={`pw-cols cols-${visibleTypes.length}`}>
                {visibleTypes.map((type) => {
                  const meta = typeMeta(type);
                  const n = qty(type);
                  const list = sorted.filter((r) => r.type === type);
                  return (
                    <div key={type} className="pw-col" style={{ "--tc": meta.color, "--tb": meta.bg }}>
                      <div className={`pw-type ${n ? "on" : ""}`}>
                        <div className="pw-type-top">
                          <span className="pw-type-icon">
                            <meta.icon size={22} />
                          </span>
                          <strong>{meta.label}</strong>
                        </div>
                        <div className={`pw-stepper ${readOnly ? "is-locked" : ""}`}>
                          <button type="button" onClick={() => setQty(type, n - 1)} disabled={!n || readOnly} aria-label={`Fewer ${meta.label}`}>
                            <Minus size={16} />
                          </button>
                          <input type="number" min={0} max={60} value={n} disabled={readOnly} onChange={(e) => setQty(type, parseInt(e.target.value, 10))} aria-label={`${meta.label} quantity`} />
                          <button type="button" onClick={() => setQty(type, n + 1)} disabled={readOnly} aria-label={`More ${meta.label}`}>
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="pw-col-list">
                        {list.length === 0 ? (
                          <div className="pw-col-empty">Set a quantity to schedule {meta.label.toLowerCase()}s</div>
                        ) : (
                          <>
                            <div className="pw-col-title">{meta.label} schedule</div>
                            {list.map((r, i) => renderRow(r, i))}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!showMore && !MORE_TYPES.some(qty) && !readOnly && (
                <button type="button" className="pl-link-btn pw-more" onClick={() => setShowMore(true)}>
                  <ChevronDown size={13} /> Add reels &amp; text posts
                </button>
              )}
              {rows.length > 0 && !readOnly && (
                <button type="button" className="pl-link-btn pw-auto" onClick={() => setRows((rs) => arrange(rs.map((r) => (r.keyDate ? r : { ...r, manual: false })), monthKey))}>
                  <Sparkles size={13} /> Auto-arrange dates
                </button>
              )}
            </>
          )}
        </div>

        <footer className="pw-foot">
          <div className="pw-summary">
            {rows.length ? (
              <>
                <strong>{rows.length} posts</strong> · {summary}
                {festivalPosts > 0 && <> · {festivalPosts} festival</>}
              </>
            ) : (
              <span className="pl-muted">Nothing selected yet</span>
            )}
          </div>
          {editing && plan && !readOnly && (
            <div className="pw-actions">
              {unstarted > 0 && (
                <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" disabled={busy} onClick={() => startScripts()}>
                  <Play size={13} /> Start all scripts
                </button>
              )}
              {["draft", "changes_requested"].includes(plan.status) && (
                <button type="button" className="pl-btn pl-btn-ghost-strong pl-btn-sm" disabled={busy} onClick={sendToClient}>
                  <Send size={13} /> Send to client
                </button>
              )}
              {plan.status === "sent" && (
                <>
                  <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" onClick={() => setSub("share")}>
                    Review link
                  </button>
                  <button type="button" className="pl-btn pl-btn-ghost-strong pl-btn-sm" disabled={busy} onClick={markApproved}>
                    <Check size={13} /> Mark approved
                  </button>
                </>
              )}
              {["sent", "approved"].includes(plan.status) && (
                <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" disabled={busy} onClick={() => planAction("back_to_draft", "Plan moved back to draft.")}>
                  Back to draft
                </button>
              )}
              <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" disabled={busy} onClick={() => setSub("close")} title="Settle the month: carry over or reduce the bill">
                <Lock size={13} /> Close month
              </button>
            </div>
          )}
          <button type="button" className="pl-btn pl-btn-ghost" onClick={onClose}>
            {readOnly ? "Close" : "Cancel"}
          </button>
          {!readOnly && (
            <button type="button" className="pl-btn pl-btn-primary" disabled={!canSave} onClick={submit} title={!clientId ? "Choose a company first" : undefined}>
              {busy ? "Saving…" : editing ? "Save changes" : `Create ${monthLabel(monthKey, { month: "long" })} plan`}
            </button>
          )}
        </footer>
      </div>
    </div>
    {sub === "share" && plan && <SharePlanModal plan={plan} onClose={() => setSub(null)} />}
    {sub === "close" && plan && <CloseMonthModal plan={plan} onClose={() => setSub(null)} onConfirm={closeMonth} />}
    {scriptPost && (
      // Own stacking layer: the script editor's overlay sits below this popup's z-index otherwise
      <div style={{ position: "relative", zIndex: 1400 }}>
        <ScriptCreationModal
          isOpen
          onClose={() => setScriptPost(null)}
          clients={clients}
          selectedClientId={String(scriptPost.client_profile)}
          initialData={scriptPost}
          onSuccess={async () => {
            toast.success(scriptPost.writer ? "Script saved." : "Script saved. You're now in charge of this post.");
            onChanged?.(true);
            try {
              applyPlan(await planApi.get(`plans/${planId}/`));
            } catch {
              /* the plan list refreshes on the next open */
            }
          }}
        />
      </div>
    )}
    </>
  );
}
