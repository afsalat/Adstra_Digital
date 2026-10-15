"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, History, LayoutGrid, List, LogIn, Package, Plus, Search, Settings2 } from "lucide-react";
import { loadTeamMembers } from "../workflowUtils";
import { EmptyState, Pill } from "./PlanUi";
import PlanWizard from "./PlanWizard";
import PlanScheduleCalendar from "./PlanScheduleCalendar";
import { ClientPlanSettingsModal, PackagesModal } from "./PlanModals";
import { PLAN_STATUS, POLICY_META, SESSION_EXPIRED_EVENT, hasValidSession, monthKeyOf, monthLabel, planApi, planError, shiftMonth, typeMeta } from "./planningUtils";
import "./Planning.css";

/**
 * Plan stage: every company for the chosen month in one list.
 * Clicking a company (or "Create plan") opens one big popup where the deliverables, slots, dates,
 * festivals, scripts and client sign-off are all handled, the same way the Script stage works.
 */
export default function PlanningTab(props) {
  const [session, setSession] = useState("checking"); // checking | ok | expired

  useEffect(() => {
    setSession(hasValidSession() ? "ok" : "expired");
    const onExpired = () => setSession("expired");
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  if (session === "checking") return null;
  if (session === "expired") {
    return (
      <div className="pl-root">
        <div className="pl-card pl-session">
          <EmptyState icon={LogIn} title="Please sign in again">
            <p>Your login session has expired. Content planning needs you to be signed in so changes are saved under your name.</p>
          </EmptyState>
          <button type="button" className="pl-btn pl-btn-primary" onClick={() => (window.location.href = "/userlogin")}>
            <LogIn size={15} /> Go to login
          </button>
        </div>
      </div>
    );
  }
  return <PlanningWorkspace {...props} />;
}

function PlanningWorkspace({ clients = [], posts = [], selectedClientId = "all", onRefresh, onOpenPost }) {
  const [monthKey, setMonthKey] = useState(() => monthKeyOf());
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState([]);
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem("pl-view-mode");
      return ["grid", "calendar"].includes(saved) ? saved : "list";
    } catch {
      return "list";
    }
  });
  const [scope, setScope] = useState("month"); // month | history
  const [history, setHistory] = useState(null); // [{ month, clients }]
  const [calendarNonce, setCalendarNonce] = useState(0); // reloads the calendar after the plan popup saves
  const [modal, setModal] = useState(null); // { type: 'plan', planId?, clientId? } | { type: 'packages' } | { type: 'settings', clientId }

  const loadPackages = useCallback(() => planApi.get("plan-packages/").then(setPackages).catch(() => {}), []);
  useEffect(() => {
    loadPackages();
    loadTeamMembers(); // warm the cache used by the script stage
  }, [loadPackages]);

  const loadOverview = useCallback(
    () =>
      planApi
        .get("plans/overview/", { month: monthKey, client_id: selectedClientId })
        .then(setData)
        .catch((err) => planError(err, "Could not load plans.")),
    [monthKey, selectedClientId]
  );
  useEffect(() => {
    setData(null);
    loadOverview();
  }, [loadOverview]);

  const changeView = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem("pl-view-mode", mode);
    } catch {}
  };

  // Past plans: the last 12 months (current included) that actually have plans
  useEffect(() => {
    if (scope !== "history") return;
    let cancelled = false;
    setHistory(null);
    const months = Array.from({ length: 12 }, (_, i) => shiftMonth(monthKeyOf(), -i));
    Promise.all(
      months.map((m) =>
        planApi
          .get("plans/overview/", { month: m, client_id: selectedClientId })
          .then((d) => ({ month: m, clients: (d?.clients || []).filter((c) => c.plan) }))
          .catch(() => ({ month: m, clients: [] }))
      )
    ).then((list) => !cancelled && setHistory(list.filter((h) => h.clients.length)));
    return () => {
      cancelled = true;
    };
  }, [scope, selectedClientId]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.clients || []).filter((c) => !q || c.client_name.toLowerCase().includes(q));
  }, [data, search]);
  const planned = (data?.clients || []).filter((c) => c.plan).length;

  const renderItem = (c, plan, month) => {
    const st = plan ? PLAN_STATUS[plan.status] : null;
    const pol = POLICY_META[plan?.effective_policy || c.carry_over_policy];
    const t = plan?.totals;
    const open = () => setModal({ type: "plan", planId: plan?.id, clientId: c.client_id });
    return (
      <div key={`${month || monthKey}-${c.client_id}`} className={`pl-plan-row ${plan ? "" : "is-empty"}`}>
        <button type="button" className="pl-plan-row-main" onClick={open}>
          <span className="pl-client-avatar" style={{ background: c.primary_color || "#4f46e5" }}>
            {c.logo_url ? <img src={c.logo_url} alt="" /> : c.client_name.slice(0, 1)}
          </span>
          <strong className="pl-plan-row-name">{c.client_name}</strong>
          {plan ? (
            <>
              <span className="pl-client-types">
                {plan.types.map((ty) => {
                  const meta = typeMeta(ty.post_type);
                  return (
                    <span key={ty.post_type} style={{ color: meta.color }} title={`${meta.label}: ${ty.delivered} delivered of ${ty.target}`}>
                      <meta.icon size={13} /> {ty.delivered}/{ty.target}
                    </span>
                  );
                })}
              </span>
              <span className="pl-bar pl-plan-row-bar">
                <span className="pl-bar-done" style={{ width: `${t.target ? (t.delivered / t.target) * 100 : 0}%` }} />
                <span className="pl-bar-prog" style={{ width: `${t.target ? (t.in_progress / t.target) * 100 : 0}%` }} />
                <span className="pl-bar-plan" style={{ width: `${t.target ? (t.not_started / t.target) * 100 : 0}%` }} />
              </span>
              <span className="pl-plan-row-pills">
                <Pill color={st.color} bg={st.bg}>
                  {st.label}
                </Pill>
                {pol && (
                  <Pill color={pol.color} bg={pol.bg}>
                    {pol.label}
                  </Pill>
                )}
                {(plan.overdue > 0 || plan.warnings > 0) && (
                  <span className="pl-client-warn">
                    {plan.overdue > 0 && `${plan.overdue} overdue`}
                    {plan.overdue > 0 && plan.warnings > 0 && " · "}
                    {plan.warnings > 0 && `${plan.warnings} warning(s)`}
                  </span>
                )}
              </span>
            </>
          ) : (
            <span className="pl-muted pl-small pl-plan-row-none">No plan for this month</span>
          )}
        </button>
        <button type="button" className="pl-icon-btn" title="Carry-over rule and default package" onClick={() => setModal({ type: "settings", clientId: c.client_id })}>
          <Settings2 size={15} />
        </button>
        <button type="button" className={`pl-btn pl-btn-sm ${plan ? "pl-btn-ghost-strong" : "pl-btn-primary"}`} onClick={open}>
          {plan ? "Open" : "Create plan"}
        </button>
      </div>
    );
  };

  const settingsClient = modal?.type === "settings" ? clients.find((c) => String(c.id) === String(modal.clientId)) : null;

  return (
    <div className="pl-root">
      <div className="pl-toolbar">
        <div className="pl-month-nav">
          <button type="button" className="pl-icon-btn" onClick={() => setMonthKey((m) => shiftMonth(m, -1))} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <strong>{monthLabel(monthKey)}</strong>
          <button type="button" className="pl-icon-btn" onClick={() => setMonthKey((m) => shiftMonth(m, 1))} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
          {monthKey !== monthKeyOf() && (
            <button type="button" className="pl-link-btn" onClick={() => setMonthKey(monthKeyOf())}>
              This month
            </button>
          )}
        </div>
        <label className="pl-search">
          <Search size={14} />
          <input placeholder="Search company" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <input
          type="month"
          className="pl-month-input"
          value={monthKey}
          onChange={(e) => {
            if (!e.target.value) return;
            setMonthKey(e.target.value);
            setScope("month");
          }}
          aria-label="Jump to month"
        />
        <span style={{ flex: 1 }} />
        <div className="pl-seg">
          <button type="button" className={scope === "month" ? "is-on" : ""} onClick={() => setScope("month")}>
            Month
          </button>
          <button type="button" className={scope === "history" ? "is-on" : ""} onClick={() => setScope("history")}>
            <History size={13} /> Past plans
          </button>
        </div>
        <div className="pl-seg">
          <button type="button" className={viewMode === "list" ? "is-on" : ""} onClick={() => changeView("list")} title="List view" aria-label="List view">
            <List size={14} />
          </button>
          <button type="button" className={viewMode === "grid" ? "is-on" : ""} onClick={() => changeView("grid")} title="Grid view" aria-label="Grid view">
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            className={viewMode === "calendar" ? "is-on" : ""}
            onClick={() => {
              changeView("calendar");
              setScope("month");
            }}
            title="Calendar view — drag Planned posts to reschedule"
            aria-label="Calendar view"
          >
            <CalendarDays size={14} /> Calendar
          </button>
        </div>
        <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" onClick={() => setModal({ type: "packages" })}>
          <Package size={14} /> Packages
        </button>
        <button
          type="button"
          className="pl-btn pl-btn-primary"
          onClick={() => setModal({ type: "plan", clientId: selectedClientId !== "all" ? selectedClientId : "" })}
        >
          <Plus size={15} /> Create plan
        </button>
      </div>

      {scope === "history" ? (
        !history ? (
          <div className="pl-card pl-muted">Loading past plans…</div>
        ) : (
          <div className="pl-card pl-plan-table">
            <div className="pl-card-head">
              <h4 className="pl-card-title">
                <History size={16} /> Past plans · last 12 months
              </h4>
            </div>
            {history.length === 0 && <p className="pl-muted">No plans found in the last 12 months.</p>}
            {history.map((h) => {
              const q = search.trim().toLowerCase();
              const list = h.clients.filter((c) => !q || c.client_name.toLowerCase().includes(q));
              if (!list.length) return null;
              return (
                <div key={h.month} className="pl-history-month">
                  <h5>{monthLabel(h.month)}</h5>
                  <div className={viewMode === "grid" ? "pl-plan-grid" : "pl-plan-list"}>{list.map((c) => renderItem(c, c.plan, h.month))}</div>
                </div>
              );
            })}
          </div>
        )
      ) : !data ? (
        <div className="pl-card pl-muted">Loading plans…</div>
      ) : viewMode === "calendar" ? (
        <PlanScheduleCalendar
          key={calendarNonce}
          monthKey={monthKey}
          companies={data.clients}
          posts={posts}
          onOpenPost={onOpenPost}
          selectedClientId={selectedClientId}
          search={search}
          onOpenPlan={(planId, clientId) => setModal({ type: "plan", planId, clientId })}
        />
      ) : (
        <div className="pl-card pl-plan-table">
          <div className="pl-card-head">
            <h4 className="pl-card-title">
              <ClipboardList size={16} /> Content plans · {monthLabel(monthKey)}
            </h4>
            <span className="pl-muted pl-small">
              {planned}/{data.clients.length} companies planned
            </span>
          </div>
          {rows.length === 0 && <p className="pl-muted">No companies match.</p>}
          <div className={viewMode === "grid" ? "pl-plan-grid" : "pl-plan-list"}>{rows.map((c) => renderItem(c, c.plan))}</div>
        </div>
      )}

      {modal?.type === "plan" && (
        <PlanWizard
          key={modal.planId || `new-${modal.clientId}`}
          clients={clients}
          packages={packages}
          planId={modal.planId || null}
          initialClientId={modal.clientId || ""}
          initialMonth={monthKey}
          onClose={() => setModal(null)}
          onCreated={(clientId, month) => {
            // Close once created; the plan is reopened from its row to start scripts
            setMonthKey(month);
            setModal(null);
          }}
          onChanged={(postsChanged) => {
            loadOverview();
            setCalendarNonce((n) => n + 1);
            if (postsChanged) onRefresh?.();
          }}
          onOpenPost={onOpenPost}
        />
      )}
      {modal?.type === "packages" && <PackagesModal packages={packages} onClose={() => setModal(null)} onChanged={loadPackages} />}
      {settingsClient && <ClientPlanSettingsModal client={settingsClient} packages={packages} onClose={() => setModal(null)} onSaved={() => { onRefresh?.(); loadOverview(); }} />}
    </div>
  );
}
