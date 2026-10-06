"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpRight, Ban, ListChecks, PlayCircle, Trash2, UserPlus } from "lucide-react";
import { EmptyState, MemberSelect } from "./PlanUi";
import {
  CONTENT_TYPES,
  ITEM_STAGE,
  METHOD_BY_ID,
  PILLARS,
  PILLAR_BY_ID,
  PRODUCTION_METHODS,
  SCHEDULE_STATUS,
  dueText,
  fmtDay,
  planApi,
  slotTitle,
  tzOffset,
  typeMeta,
  planError,
} from "./planningUtils";
import { confirmDialog, toast } from "../SocialFeedback";

const STAGE_FILTERS = [
  { id: "all", label: "All" },
  { id: "planned", label: "Not started" },
  { id: "working", label: "In production" },
  { id: "done", label: "Delivered" },
  { id: "overdue", label: "Overdue" },
  { id: "dropped", label: "Dropped / rejected" },
];

const matchesStage = (item, f) => {
  switch (f) {
    case "planned":
      return item.stage === "planned";
    case "working":
      return ["script", "script_approval", "designing", "team_review", "client_review"].includes(item.stage);
    case "done":
      return ["ready", "published"].includes(item.stage);
    case "overdue":
      return item.is_overdue;
    case "dropped":
      return ["dropped", "rejected"].includes(item.stage);
    default:
      return item.stage !== "dropped";
  }
};

export default function PlanSlotList({ plan, items, members, readOnly, onEditSlot, onStartScript, onOpenPost, onChanged }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [pillarFilter, setPillarFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const rows = useMemo(
    () =>
      items.filter(
        (i) =>
          (typeFilter === "all" || i.post_type === typeFilter) &&
          (pillarFilter === "all" || i.pillar === pillarFilter) &&
          matchesStage(i, stageFilter)
      ),
    [items, typeFilter, stageFilter, pillarFilter]
  );
  const selectedRows = rows.filter((r) => selected.has(r.id));
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const bulk = async (action, extra = {}, confirm) => {
    if (!selectedRows.length) return;
    if (confirm) {
      const ok = await confirmDialog(confirm);
      if (!ok) return;
    }
    setBulkBusy(true);
    try {
      const res = await planApi.post("plan-items/bulk/", { ids: selectedRows.map((r) => r.id), action, tz_offset: tzOffset(), ...extra });
      const skippedNote = res.skipped ? ` (${res.skipped} skipped)` : "";
      toast.success(`${res.done} slot${res.done === 1 ? "" : "s"} updated${skippedNote}.`);
      setSelected(new Set());
      onChanged(action === "start_script");
    } catch (err) {
      planError(err);
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="pl-card pl-slots">
      <div className="pl-filters">
        <div className="pl-seg">
          {STAGE_FILTERS.map((f) => (
            <button type="button" key={f.id} className={stageFilter === f.id ? "on" : ""} onClick={() => setStageFilter(f.id)}>
              {f.label}
              <span className="pl-seg-count">{items.filter((i) => matchesStage(i, f.id)).length}</span>
            </button>
          ))}
        </div>
        <select className="pl-input pl-input-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All formats</option>
          {CONTENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select className="pl-input pl-input-sm" value={pillarFilter} onChange={(e) => setPillarFilter(e.target.value)}>
          <option value="all">All pillars</option>
          {PILLARS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {selectedRows.length > 0 && !readOnly && (
        <div className="pl-bulkbar">
          <strong>{selectedRows.length} selected</strong>
          <button type="button" className="pl-btn pl-btn-primary pl-btn-sm" disabled={bulkBusy} onClick={() => bulk("start_script")}>
            <PlayCircle size={14} /> Start scripts
          </button>
          <span className="pl-bulk-field">
            <UserPlus size={13} /> Writer
            <MemberSelect members={members} value={null} placeholder="Set…" onChange={(v) => v && bulk("update", { fields: { writer: v } })} />
          </span>
          <span className="pl-bulk-field">
            <UserPlus size={13} /> Designer
            <MemberSelect members={members} value={null} placeholder="Set…" onChange={(v) => v && bulk("update", { fields: { designer: v } })} />
          </span>
          <span className="pl-bulk-field">
            Production
            <select className="pl-input pl-input-sm" value="" onChange={(e) => e.target.value && bulk("update", { fields: { production_method: e.target.value } })}>
              <option value="">Set…</option>
              {PRODUCTION_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </span>
          <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" disabled={bulkBusy} onClick={() => bulk("drop")}>
            <Ban size={14} /> Drop
          </button>
          <button
            type="button"
            className="pl-btn pl-btn-ghost pl-btn-sm pl-danger-text"
            disabled={bulkBusy}
            onClick={() =>
              bulk("delete", {}, { title: "Delete slots?", message: "Slots with a script already started are kept.", confirmLabel: "Delete", tone: "danger" })
            }
          >
            <Trash2 size={14} /> Delete
          </button>
          <button type="button" className="pl-link-btn" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState icon={ListChecks} title="No slots here">
          <p>Generate slots from the deliverables, or add posts from the calendar.</p>
        </EmptyState>
      ) : (
        <div className="pl-table-scroll">
          <table className="pl-table pl-slot-table">
            <thead>
              <tr>
                {!readOnly && (
                  <th className="pl-col-check">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
                      aria-label="Select all"
                    />
                  </th>
                )}
                <th>Publish</th>
                <th>Post</th>
                <th>Pillar</th>
                <th>Production</th>
                <th>Team</th>
                <th>Next deadline</th>
                <th>Stage</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const meta = typeMeta(item.post_type);
                const stage = ITEM_STAGE[item.stage] || ITEM_STAGE.planned;
                const method = METHOD_BY_ID[item.production_method];
                const pillar = PILLAR_BY_ID[item.pillar];
                const canStart = !readOnly && plan.status !== "closed" && (item.stage === "planned" || item.stage === "rejected");
                return (
                  <tr key={item.id} className={item.stage === "dropped" ? "is-dropped" : ""}>
                    {!readOnly && (
                      <td className="pl-col-check">
                        <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} aria-label="Select slot" />
                      </td>
                    )}
                    <td className="pl-nowrap">
                      {item.planned_date ? (
                        <>
                          <b>{fmtDay(item.planned_date, { weekday: "short", day: "numeric", month: "short" })}</b>
                          <span className="pl-sub">{(item.planned_time || "").slice(0, 5)}</span>
                        </>
                      ) : (
                        <span className="pl-muted">No date</span>
                      )}
                    </td>
                    <td>
                      <button type="button" className="pl-row-title" onClick={() => onEditSlot(item)}>
                        <span className="pl-type-tag" style={{ color: meta.color, background: meta.bg }}>
                          <meta.icon size={12} /> {meta.label}
                        </span>
                        <span className={!item.title ? "pl-muted" : ""}>{slotTitle(item)}</span>
                      </button>
                      {(item.key_date_title || item.is_carry_over) && (
                        <span className="pl-sub">
                          {item.key_date_title && `★ ${item.key_date_title}`}
                          {item.is_carry_over && " ↪ carried over"}
                        </span>
                      )}
                    </td>
                    <td>{pillar ? <span style={{ color: pillar.color, fontWeight: 600 }}>{pillar.label}</span> : <span className="pl-muted">—</span>}</td>
                    <td className="pl-nowrap">
                      {method && (
                        <span className="pl-method" style={{ color: method.color }}>
                          <method.icon size={13} /> {method.short}
                        </span>
                      )}
                      {(item.vendor_name || item.shoot_label) && <span className="pl-sub">{item.vendor_name || item.shoot_label}</span>}
                    </td>
                    <td className="pl-team">
                      <span title="Writer">W: {item.writer_name || <em>—</em>}</span>
                      <span title="Designer">D: {item.designer_name || <em>—</em>}</span>
                    </td>
                    <td className="pl-nowrap">
                      {item.current_due ? (
                        <span className={item.is_overdue ? "pl-overdue" : ""}>
                          {fmtDay(item.current_due)} <span className="pl-sub-inline">{dueText(item.current_due)}</span>
                        </span>
                      ) : (
                        <span className="pl-muted">—</span>
                      )}
                      {item.stage === "planned" && item.schedule?.start_by && (
                        <span className="pl-sub">Start by {fmtDay(item.schedule.start_by)}</span>
                      )}
                      {item.schedule && item.schedule.status !== "ok" && !["ready", "published", "dropped"].includes(item.stage) && (
                        <span
                          className="pl-pill pl-risk"
                          style={{ color: SCHEDULE_STATUS[item.schedule.status].color, background: SCHEDULE_STATUS[item.schedule.status].bg }}
                          title={item.schedule.notes.join("\n")}
                        >
                          {SCHEDULE_STATUS[item.schedule.status].label}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="pl-pill" style={{ color: stage.color, background: stage.bg }}>
                        {stage.label}
                      </span>
                    </td>
                    <td className="pl-row-actions">
                      {canStart && (
                        <button type="button" className="pl-btn pl-btn-primary pl-btn-xs" onClick={() => onStartScript(item)}>
                          <PlayCircle size={13} /> {item.stage === "rejected" ? "Restart" : "Start script"}
                        </button>
                      )}
                      {item.post_info && item.stage !== "rejected" && (
                        <button type="button" className="pl-btn pl-btn-ghost pl-btn-xs" onClick={() => onOpenPost(item.post_info)}>
                          Open <ArrowUpRight size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
