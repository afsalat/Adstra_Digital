"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Gauge, RefreshCw } from "lucide-react";
import { EmptyState } from "./PlanUi";
import {
  fmtDay,
  planApi,
  typeMeta,
  planError,
} from "./planningUtils";
import { toast } from "../SocialFeedback";

/** Scripts and designs due per person per week (across clients), against their weekly capacity. */
export default function PlanWorkloadPanel({ monthKey, clientId }) {
  const [scope, setScope] = useState("all");
  const [capacity, setCapacity] = useState({ writer: 10, designer: 8 });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openCell, setOpenCell] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await planApi.get("plan-workload/", {
        month: monthKey,
        client_id: scope === "client" ? clientId : "all",
        writer_capacity: capacity.writer,
        designer_capacity: capacity.designer,
      });
      setData(res);
    } catch (err) {
      planError(err, "Could not load the team workload.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, scope, clientId]);

  const level = (units, cap) => (units > cap ? "over" : units >= cap * 0.8 ? "high" : units > 0 ? "ok" : "none");

  return (
    <div className="pl-card pl-workload">
      <div className="pl-card-head">
        <h4 className="pl-card-title">
          <Gauge size={16} /> Team workload
        </h4>
        <div className="pl-workload-controls">
          <div className="pl-seg">
            <button type="button" className={scope === "all" ? "on" : ""} onClick={() => setScope("all")}>
              All clients
            </button>
            <button type="button" className={scope === "client" ? "on" : ""} onClick={() => setScope("client")} disabled={!clientId}>
              This client
            </button>
          </div>
          <label className="pl-inline-num">
            Writer cap/week
            <input className="pl-input pl-input-num" type="number" min={1} value={capacity.writer} onChange={(e) => setCapacity({ ...capacity, writer: e.target.value })} />
          </label>
          <label className="pl-inline-num">
            Designer cap/week
            <input className="pl-input pl-input-num" type="number" min={1} value={capacity.designer} onChange={(e) => setCapacity({ ...capacity, designer: e.target.value })} />
          </label>
          <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={13} className={loading ? "spin" : ""} /> Update
          </button>
        </div>
      </div>
      <p className="pl-muted pl-small">
        Counted in the week each task is due. Design units: reel/video = 2, carousel = 1.5, image = 1. Includes posts created outside the plan.
      </p>

      {!data ? (
        <p className="pl-muted">Loading…</p>
      ) : data.people.length === 0 && Object.keys(data.unassigned).length === 0 ? (
        <EmptyState icon={Gauge} title="Nothing due this month" />
      ) : (
        <div className="pl-table-scroll">
          <table className="pl-table pl-workload-table">
            <thead>
              <tr>
                <th>Person</th>
                {data.weeks.map((w) => (
                  <th key={w.start}>
                    {fmtDay(w.start)} – {fmtDay(w.end)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.people.map((p) => (
                <tr key={`${p.role}-${p.id}`}>
                  <td>
                    <b>{p.name}</b>
                    <span className="pl-sub">
                      {p.role === "writer" ? "Writer" : "Designer"}
                      {p.overloaded_weeks.length > 0 && (
                        <span className="pl-overdue">
                          {" "}
                          <AlertTriangle size={11} /> overloaded
                        </span>
                      )}
                    </span>
                  </td>
                  {data.weeks.map((w) => {
                    const cell = p.weeks[w.start];
                    const units = cell?.units || 0;
                    const key = `${p.role}-${p.id}-${w.start}`;
                    return (
                      <td key={w.start} className={`pl-load-cell lvl-${level(units, p.capacity)}`}>
                        {cell ? (
                          <button type="button" onClick={() => setOpenCell(openCell === key ? null : key)}>
                            <b>{units}</b>/{p.capacity}
                            <span>{cell.count} task(s)</span>
                          </button>
                        ) : (
                          <span className="pl-muted">—</span>
                        )}
                        {openCell === key && cell && (
                          <ul className="pl-load-tasks">
                            {cell.tasks.map((t, i) => {
                              const meta = typeMeta(t.post_type);
                              return (
                                <li key={i}>
                                  <span style={{ color: meta.color }}>{meta.label}</span> {t.title}
                                  <em>
                                    {t.client} · {t.task} due {fmtDay(t.due)}
                                  </em>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="pl-unassigned-row">
                <td>
                  <b>Unassigned</b>
                  <span className="pl-sub">No writer / designer yet</span>
                </td>
                {data.weeks.map((w) => {
                  const u = data.unassigned[w.start];
                  return (
                    <td key={w.start}>
                      {u && (u.writer || u.designer) ? (
                        <span className="pl-overdue">
                          {u.writer ? `${u.writer} scripts` : ""}
                          {u.writer && u.designer ? " · " : ""}
                          {u.designer ? `${u.designer} designs` : ""}
                        </span>
                      ) : (
                        <span className="pl-muted">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
