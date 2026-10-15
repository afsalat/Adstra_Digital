"use client";

import React, { useMemo, useState } from "react";
import { AlertCircle, CalendarPlus, Inbox, Plus, Star } from "lucide-react";
import IdeaBankPanel from "./IdeaBankPanel";
import { ITEM_STAGE, KEY_DATE_BY_ID, METHOD_BY_ID, PILLAR_BY_ID, WEEKDAYS, monthGrid, slotTitle, todayISO, typeMeta } from "./planningUtils";

const DND_TYPE = "application/x-adstra-plan";

function SlotChip({ item, onClick, draggable, onDropOnto }) {
  const meta = typeMeta(item.post_type);
  const stage = ITEM_STAGE[item.stage] || ITEM_STAGE.planned;
  const method = METHOD_BY_ID[item.production_method];
  const pillar = PILLAR_BY_ID[item.pillar];
  return (
    <button
      type="button"
      className={`pl-chip ${item.is_overdue ? "is-overdue" : ""} ${item.schedule && !["ready", "published"].includes(item.stage) ? `risk-${item.schedule.status}` : ""} ${item.stage === "dropped" ? "is-dropped" : ""} ${!item.title ? "is-untitled" : ""}`}
      style={{ "--chip-color": meta.color, "--chip-bg": meta.bg }}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData(DND_TYPE, JSON.stringify({ kind: "item", id: item.id }));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onClick(item)}
      onDragOver={onDropOnto && !item.post ? (e) => e.preventDefault() : undefined}
      onDrop={
        onDropOnto && !item.post
          ? (e) => {
              e.stopPropagation();
              onDropOnto(e, item);
            }
          : undefined
      }
      title={[
        slotTitle(item),
        `${meta.label} · ${stage.label}`,
        pillar && `Pillar: ${pillar.label}`,
        method && `Production: ${method.label}${item.vendor_name ? ` (${item.vendor_name})` : ""}`,
        item.writer_name && `Writer: ${item.writer_name}`,
        item.designer_name && `Designer: ${item.designer_name}`,
        item.is_overdue && "Behind its stage deadline",
        item.schedule?.status === "tight" && "Tight schedule (planned late)",
        item.schedule?.status === "at_risk" && "At risk of missing the publish date",
        item.stage === "planned" && item.schedule?.start_by && `Start script by ${item.schedule.start_by}`,
        !item.post && "Drop an idea here to use it for this slot",
      ]
        .filter(Boolean)
        .join("\n")}
    >
      <meta.icon size={12} className="pl-chip-icon" />
      <span className="pl-chip-title">{slotTitle(item)}</span>
      {item.is_carry_over && <span className="pl-chip-tag">↪</span>}
      <span className="pl-chip-stage" style={{ background: stage.color }} />
    </button>
  );
}

export default function PlanCalendar({
  plan,
  items,
  keyDates,
  ideas,
  clientId,
  readOnly,
  onEditSlot,
  onNewSlot,
  onMoveSlot,
  onUseIdea,
  onPlanKeyDate,
  onIdeasChange,
  onManageKeyDates,
}) {
  const monthKey = plan.month.slice(0, 7);
  const weeks = useMemo(() => monthGrid(monthKey), [monthKey]);
  const [showDropped, setShowDropped] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const today = todayISO();

  const visible = items.filter((i) => showDropped || i.stage !== "dropped");
  const byDay = useMemo(() => {
    const map = {};
    visible.forEach((i) => {
      if (i.planned_date) (map[i.planned_date] = map[i.planned_date] || []).push(i);
    });
    return map;
  }, [visible]);
  const unscheduled = visible.filter((i) => !i.planned_date);
  const keyByDay = useMemo(() => {
    const map = {};
    keyDates.forEach((k) => (map[k.occurs_on] = map[k.occurs_on] || []).push(k));
    return map;
  }, [keyDates]);

  const handleDrop = (e, target) => {
    e.preventDefault();
    setDragOver(null);
    if (readOnly) return;
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData(DND_TYPE));
    } catch {
      return;
    }
    if (data.kind === "item") {
      const item = items.find((i) => i.id === data.id);
      if (item && item.planned_date !== target.date) onMoveSlot(item, target.date);
    } else if (data.kind === "idea") {
      const idea = ideas.find((i) => i.id === data.id);
      if (idea) onUseIdea(idea, target.itemId ? { item_id: target.itemId } : { planned_date: target.date });
    }
  };

  const dropOnChip = (e, item) => handleDrop(e, { date: item.planned_date, itemId: item.id });

  const dropProps = (key, target) =>
    readOnly
      ? {}
      : {
          onDragOver: (e) => {
            e.preventDefault();
            if (dragOver !== key) setDragOver(key);
          },
          onDragLeave: () => setDragOver((k) => (k === key ? null : k)),
          onDrop: (e) => handleDrop(e, target),
        };

  return (
    <div className="pl-cal-layout">
      <div className="pl-cal-main">
        <div className="pl-cal-toolbar">
          <div className="pl-legend">
            {Object.entries(ITEM_STAGE)
              .filter(([k]) => ["planned", "script", "designing", "client_review", "ready", "published"].includes(k))
              .map(([k, s]) => (
                <span key={k}>
                  <i style={{ background: s.color }} /> {s.label}
                </span>
              ))}
          </div>
          <label className="pl-check">
            <input type="checkbox" checked={showDropped} onChange={(e) => setShowDropped(e.target.checked)} /> Show dropped
          </label>
          <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" onClick={onManageKeyDates}>
            <Star size={13} /> Key dates
          </button>
        </div>

        {unscheduled.length > 0 && (
          <div className={`pl-tray ${dragOver === "tray" ? "drag-over" : ""}`} {...dropProps("tray", { date: null })}>
            <span className="pl-tray-label">
              <Inbox size={14} /> No date yet ({unscheduled.length}) — drag onto a day
            </span>
            <div className="pl-tray-items">
              {unscheduled.map((i) => (
                <SlotChip key={i.id} item={i} onClick={onEditSlot} draggable={!readOnly} onDropOnto={readOnly ? null : dropOnChip} />
              ))}
            </div>
          </div>
        )}

        <div className="pl-cal">
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
                return (
                  <div
                    key={day.iso}
                    className={`pl-cal-day ${day.inMonth ? "" : "is-out"} ${day.iso === today ? "is-today" : ""} ${
                      day.iso < today ? "is-past" : ""
                    } ${dragOver === day.iso ? "drag-over" : ""}`}
                    {...(day.inMonth ? dropProps(day.iso, { date: day.iso }) : {})}
                  >
                    <div className="pl-cal-day-head">
                      <span className="pl-cal-num">{day.day}</span>
                      {day.inMonth && !readOnly && (
                        <button type="button" className="pl-cal-add" onClick={() => onNewSlot({ planned_date: day.iso })} title="Plan a post on this day">
                          <Plus size={13} />
                        </button>
                      )}
                    </div>
                    {dayKeys.map((k) => {
                      const cat = KEY_DATE_BY_ID[k.category] || KEY_DATE_BY_ID.other;
                      const planned = items.some((i) => i.key_date === k.id && i.stage !== "dropped");
                      return (
                        <button
                          type="button"
                          key={k.id}
                          className="pl-keydate"
                          style={{ "--kd-color": cat.color }}
                          title={`${k.title} · ${cat.label}${k.notes ? `\n${k.notes}` : ""}${planned ? "\nAlready has a planned post" : "\nClick to plan a post for it"}`}
                          onClick={() => !readOnly && onPlanKeyDate(k)}
                        >
                          {planned ? <Star size={10} fill="currentColor" /> : <CalendarPlus size={10} />}
                          <span>{k.title}</span>
                        </button>
                      );
                    })}
                    <div className="pl-cal-items">
                      {dayItems.map((i) => (
                        <SlotChip key={i.id} item={i} onClick={onEditSlot} draggable={!readOnly} onDropOnto={readOnly ? null : dropOnChip} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {items.some((i) => i.is_overdue) && (
          <p className="pl-muted pl-small" style={{ marginTop: 8 }}>
            <AlertCircle size={12} /> Red outline = behind its stage deadline. Dashed amber/red = tight / at-risk schedule.
          </p>
        )}
      </div>

      <IdeaBankPanel
        ideas={ideas}
        clientId={clientId}
        readOnly={readOnly}
        dndType={DND_TYPE}
        onChange={onIdeasChange}
        onAddToPlan={(idea) => onUseIdea(idea, {})}
      />
    </div>
  );
}
