"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarOff, GripVertical, Inbox, Lock, Sparkles } from "lucide-react";
import { ITEM_STAGE, KEY_DATE_BY_ID, WEEKDAYS, monthGrid, monthLabel, planApi, planError, slotTitle, toISODate, todayISO, typeMeta } from "./planningUtils";
import { toast } from "../SocialFeedback";

const DND_TYPE = "application/x-adstra-plan-schedule";
const MAX_PER_DAY = 4;
const LEGEND_STAGES = ["planned", "script", "script_approval", "designing", "team_review", "client_review", "ready", "published"];

// Workflow post status -> calendar stage (mirrors the backend POST_STAGE map)
const POST_STAGE = {
  draft: "script",
  script: "script",
  script_approval: "script_approval",
  designing: "designing",
  team_review: "team_review",
  internal_review: "team_review",
  client_review: "client_review",
  approved: "ready",
  scheduled: "ready",
  published: "published",
  rejected: "rejected",
  content_rejected: "rejected",
};

const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

/**
 * Month calendar across companies: plan slots, workflow posts already in production, and key dates / festivals.
 * Only slots still in the Plan stage (no script started, plan not closed) can be dragged to another day;
 * everything else is shown read-only and is rescheduled from its own workflow stage.
 */
export default function PlanScheduleCalendar({ monthKey, companies = [], posts = [], selectedClientId = "all", search = "", onOpenPlan, onOpenPost }) {
  const [items, setItems] = useState(null);
  const [keyDates, setKeyDates] = useState([]);
  const [showKeyDates, setShowKeyDates] = useState(true);
  const [company, setCompany] = useState("all");
  const [stage, setStage] = useState("all");
  const [showDropped, setShowDropped] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [expanded, setExpanded] = useState({});
  const today = todayISO();
  const weeks = useMemo(() => monthGrid(monthKey), [monthKey]);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setExpanded({});
    planApi
      .get("plan-items/", { month: monthKey, client_id: selectedClientId })
      .then((list) => !cancelled && setItems(list || []))
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        planError(err, "Could not load the plan calendar.");
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey, selectedClientId]);

  useEffect(() => {
    let cancelled = false;
    planApi
      .get("key-dates/", { month: monthKey, client_id: selectedClientId })
      .then((list) => !cancelled && setKeyDates(list || []))
      .catch(() => !cancelled && setKeyDates([]));
    return () => {
      cancelled = true;
    };
  }, [monthKey, selectedClientId]);

  // Header company switch overrides the local filter
  useEffect(() => setCompany("all"), [selectedClientId]);

  const companyById = useMemo(() => Object.fromEntries(companies.map((c) => [String(c.client_id), c])), [companies]);
  const planStatus = useMemo(() => Object.fromEntries(companies.filter((c) => c.plan).map((c) => [c.plan.id, c.plan.status])), [companies]);

  // Plan slots + workflow posts of this month that are not already a slot
  const entries = useMemo(() => {
    // Slots only carry a date (their time is the plan's hidden default), so no time is shown for them
    const slots = (items || []).map((i) => ({ ...i, kind: "slot", key: `s-${i.id}`, date: i.planned_date, time: null }));
    const linked = new Set((items || []).filter((i) => i.post).map((i) => i.post));
    const loose = posts
      .filter((p) => !linked.has(p.id) && (selectedClientId === "all" || String(p.client_profile) === String(selectedClientId)))
      .map((p) => {
        const at = p.scheduled_at || p.published_at;
        if (!at) return null;
        const d = new Date(at);
        const date = toISODate(d);
        if (date.slice(0, 7) !== monthKey) return null;
        return {
          kind: "post",
          key: `p-${p.id}`,
          id: p.id,
          client_profile: p.client_profile,
          post_type: p.post_type,
          title: p.title || p.primary_caption?.slice(0, 40) || "",
          stage: POST_STAGE[p.status] || "script",
          date,
          time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        };
      })
      .filter(Boolean);
    return [...slots, ...loose].sort((a, b) => ((a.time || "99") < (b.time || "99") ? -1 : 1));
  }, [items, posts, selectedClientId, monthKey]);

  const q = search.trim().toLowerCase();
  const scoped = useMemo(
    () =>
      entries.filter((i) => {
        const c = companyById[String(i.client_profile)];
        if (q && !(c?.client_name || "").toLowerCase().includes(q)) return false;
        return showDropped || i.stage !== "dropped";
      }),
    [entries, companyById, q, showDropped]
  );

  const companyCounts = useMemo(() => {
    const map = {};
    scoped.forEach((i) => (map[i.client_profile] = (map[i.client_profile] || 0) + 1));
    return map;
  }, [scoped]);
  const stageCounts = useMemo(() => {
    const map = {};
    scoped.filter((i) => company === "all" || String(i.client_profile) === company).forEach((i) => (map[i.stage] = (map[i.stage] || 0) + 1));
    return map;
  }, [scoped, company]);

  const visible = scoped.filter((i) => (company === "all" || String(i.client_profile) === company) && (stage === "all" || i.stage === stage));
  const byDay = useMemo(() => {
    const map = {};
    visible.forEach((i) => i.date && (map[i.date] = map[i.date] || []).push(i));
    return map;
  }, [visible]);
  const unscheduled = visible.filter((i) => !i.date);
  const keyByDay = useMemo(() => {
    const map = {};
    if (!showKeyDates) return map;
    keyDates
      .filter((k) => !k.client_profile || company === "all" || String(k.client_profile) === company)
      .forEach((k) => (map[k.occurs_on] = map[k.occurs_on] || []).push(k));
    return map;
  }, [keyDates, showKeyDates, company]);
  const keyDateCount = Object.values(keyByDay).reduce((n, list) => n + list.length, 0);
  const movableCount = visible.filter((i) => canMove(i)).length;

  const filterCompanies = companies.filter((c) => companyCounts[c.client_id] && (!q || c.client_name.toLowerCase().includes(q)));

  function canMove(item) {
    return item.kind === "slot" && item.stage === "planned" && !item.post && planStatus[item.plan] !== "closed";
  }

  const moveItem = async (item, date) => {
    if (!canMove(item) || item.planned_date === date) return;
    const before = item.planned_date;
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, planned_date: date } : i)));
    try {
      const fresh = await planApi.patch(`plan-items/${item.id}/`, { planned_date: date });
      setItems((list) => list.map((i) => (i.id === item.id ? fresh : i)));
      toast.success(date ? `Moved to ${new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.` : "Date cleared.");
    } catch (err) {
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, planned_date: before } : i)));
      planError(err, "Could not move this post.");
    }
  };

  const dropProps = (key, date) => ({
    onDragOver: (e) => {
      if (!e.dataTransfer.types.includes(DND_TYPE)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOver !== key) setDragOver(key);
    },
    onDragLeave: (e) => {
      if (e.currentTarget.contains(e.relatedTarget)) return;
      setDragOver((k) => (k === key ? null : k));
    },
    onDrop: (e) => {
      e.preventDefault();
      setDragOver(null);
      const id = Number(e.dataTransfer.getData(DND_TYPE));
      const item = entries.find((i) => i.kind === "slot" && i.id === id);
      if (item) moveItem(item, date);
    },
  });

  const renderChip = (item) => {
    const c = companyById[String(item.client_profile)];
    const color = c?.primary_color || "#4f46e5";
    const meta = typeMeta(item.post_type);
    const st = ITEM_STAGE[item.stage] || ITEM_STAGE.planned;
    const movable = canMove(item);
    return (
      <button
        type="button"
        key={item.key}
        className={`pl-chip psc-chip ${movable ? "is-movable" : "is-locked"} ${item.is_overdue ? "is-overdue" : ""} ${item.stage === "dropped" ? "is-dropped" : ""} ${!item.title ? "is-untitled" : ""}`}
        style={{ "--chip-color": color, "--chip-bg": `color-mix(in srgb, ${color} 9%, white)` }}
        draggable={movable}
        onDragStart={(e) => {
          e.dataTransfer.setData(DND_TYPE, String(item.id));
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => (item.kind === "post" ? onOpenPost?.({ id: item.id }) : onOpenPlan?.(item.plan, item.client_profile))}
        title={[
          `${c?.client_name || "Company"} · ${slotTitle(item)}`,
          `${meta.label} · ${st.label}${item.time ? ` · ${fmtTime(item.time)}` : ""}${item.kind === "post" ? " · workflow post" : ""}`,
          item.writer_name && `Writer: ${item.writer_name}`,
          item.designer_name && `Designer: ${item.designer_name}`,
          item.is_overdue && "Behind its stage deadline",
          movable
            ? "Drag to another day to reschedule · click to open the plan"
            : item.kind === "slot" && item.stage === "planned"
            ? "Plan is closed — dates are locked"
            : "Already in production — reschedule it from its workflow stage · click to open",
        ]
          .filter(Boolean)
          .join("\n")}
      >
        {movable ? <GripVertical size={11} className="psc-grip" /> : <Lock size={10} className="psc-grip" />}
        <span className="psc-avatar" style={{ background: color }}>
          {c?.logo_url ? <img src={c.logo_url} alt="" /> : (c?.client_name || "?").slice(0, 1)}
        </span>
        <meta.icon size={12} className="pl-chip-icon" style={{ color: meta.color }} />
        <span className="pl-chip-title">{slotTitle(item)}</span>
        {item.time && <span className="psc-time">{fmtTime(item.time)}</span>}
        <span className="pl-chip-stage" style={{ background: st.color }} title={st.label} />
      </button>
    );
  };

  if (!items) return <div className="pl-card pl-muted">Loading calendar…</div>;

  return (
    <div className="pl-card psc-root">
      <div className="pl-card-head">
        <h4 className="pl-card-title">
          <CalendarDays size={16} /> Schedule · {monthLabel(monthKey)}
        </h4>
        <span className="pl-muted pl-small">
          {visible.length} post{visible.length === 1 ? "" : "s"} · {movableCount} can be moved
        </span>
      </div>

      {/* Company filter */}
      <div className="psc-companies">
        <button type="button" className={company === "all" ? "is-on" : ""} onClick={() => setCompany("all")}>
          All companies <b>{scoped.length}</b>
        </button>
        {filterCompanies.map((c) => (
          <button
            type="button"
            key={c.client_id}
            className={company === String(c.client_id) ? "is-on" : ""}
            style={{ "--co-color": c.primary_color || "#4f46e5" }}
            onClick={() => setCompany(company === String(c.client_id) ? "all" : String(c.client_id))}
          >
            <span className="psc-avatar" style={{ background: c.primary_color || "#4f46e5" }}>
              {c.logo_url ? <img src={c.logo_url} alt="" /> : c.client_name.slice(0, 1)}
            </span>
            {c.client_name} <b>{companyCounts[c.client_id]}</b>
          </button>
        ))}
      </div>

      {/* Stage legend = stage filter */}
      <div className="pl-cal-toolbar">
        <div className="psc-stages">
          {LEGEND_STAGES.map((k) => {
            const s = ITEM_STAGE[k];
            const on = stage === k;
            return (
              <button
                type="button"
                key={k}
                className={on ? "is-on" : ""}
                style={{ "--st-color": s.color, "--st-bg": s.bg }}
                onClick={() => setStage(on ? "all" : k)}
                title={on ? "Show every stage" : `Show only ${s.label}`}
              >
                <i style={{ background: s.color }} /> {s.label} <b>{stageCounts[k] || 0}</b>
              </button>
            );
          })}
        </div>
        <label className="pl-check">
          <input type="checkbox" checked={showKeyDates} onChange={(e) => setShowKeyDates(e.target.checked)} /> Festivals & key dates
          {showKeyDates ? ` (${keyDateCount})` : ""}
        </label>
        <label className="pl-check">
          <input type="checkbox" checked={showDropped} onChange={(e) => setShowDropped(e.target.checked)} /> Show dropped
        </label>
      </div>

      <p className="psc-hint">
        <GripVertical size={12} /> Drag <strong>Planned</strong> posts to change their date. <Lock size={11} /> Posts already in Script, Design, Review or later stages are locked here.
      </p>

      {unscheduled.length > 0 && (
        <div className={`pl-tray ${dragOver === "tray" ? "drag-over" : ""}`} {...dropProps("tray", null)}>
          <span className="pl-tray-label">
            <Inbox size={14} /> No date yet ({unscheduled.length}) — drag onto a day
          </span>
          <div className="pl-tray-items">{unscheduled.map(renderChip)}</div>
        </div>
      )}

      {visible.length === 0 && unscheduled.length === 0 && (
        <p className="pl-muted pl-small" style={{ margin: "0 0 10px" }}>
          No posts scheduled for {monthLabel(monthKey)}
          {company !== "all" || stage !== "all" ? " with these filters" : ""}. Create a plan to add posts to this calendar.
        </p>
      )}

      <div className="pl-cal psc-cal">
        <div className="pl-cal-head">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        {weeks.map((week) => (
          <div className="pl-cal-week" key={week[0].iso}>
            {week.map((day) => {
              const dayItems = byDay[day.iso] || [];
              const dayKeys = day.inMonth ? keyByDay[day.iso] || [] : [];
              const open = expanded[day.iso];
              const shown = open ? dayItems : dayItems.slice(0, MAX_PER_DAY);
              return (
                <div
                  key={day.iso}
                  className={`pl-cal-day ${day.inMonth ? "" : "is-out"} ${day.iso === today ? "is-today" : ""} ${day.iso < today ? "is-past" : ""} ${
                    dragOver === day.iso ? "drag-over" : ""
                  }`}
                  {...(day.inMonth ? dropProps(day.iso, day.iso) : {})}
                >
                  <div className="pl-cal-day-head">
                    <span className="pl-cal-num">{day.day}</span>
                    {dayItems.length > 0 && <span className="psc-day-count">{dayItems.length}</span>}
                  </div>
                  {dayKeys.map((k) => {
                    const cat = KEY_DATE_BY_ID[k.category] || KEY_DATE_BY_ID.other;
                    const owner = k.client_profile ? companyById[String(k.client_profile)]?.client_name : "";
                    return (
                      <span
                        key={k.id}
                        className={`pl-keydate psc-keydate ${k.office_closed ? "is-closed" : ""}`}
                        style={{ "--kd-color": cat.color }}
                        title={[k.title, cat.label, owner && `Only for ${owner}`, k.office_closed && "Office closed", k.notes].filter(Boolean).join("\n")}
                      >
                        {k.office_closed ? <CalendarOff size={10} /> : <Sparkles size={10} />}
                        <span>{k.title}</span>
                      </span>
                    );
                  })}
                  <div className="pl-cal-items">{shown.map(renderChip)}</div>
                  {dayItems.length > MAX_PER_DAY && (
                    <button type="button" className="psc-more" onClick={() => setExpanded((m) => ({ ...m, [day.iso]: !open }))}>
                      {open ? "Show less" : `+${dayItems.length - MAX_PER_DAY} more`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
