"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Building2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, X, Check } from "lucide-react";

const RECENT_KEY = "sm_rail_recent_clients";
const COLLAPSED_KEY = "sm_rail_collapsed";
const RECENT_MAX = 5;

// Same order + colours as the workflow pipeline stepper
const STAGES = [
  { id: "script", label: "Script", color: "#4f46e5" },
  { id: "approval", label: "Approval", color: "#8b5cf6" },
  { id: "design", label: "Design", color: "#ec4899" },
  { id: "team_review", label: "Team review", color: "#f59e0b" },
  { id: "client_review", label: "Client review", color: "#ea580c" },
  { id: "scheduled", label: "Scheduled", color: "#0ea5e9" },
  { id: "rejected", label: "Rejected", color: "#dc2626" },
];

const readLS = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
};
const writeLS = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const workOf = (c) => c?.active_work?.total || 0;
const stagesOf = (c) => STAGES.filter((s) => c?.active_work?.stages?.[s.id]).map((s) => ({ ...s, n: c.active_work.stages[s.id] }));
const workSummary = (c) => stagesOf(c).map((s) => `${s.label} ${s.n}`).join(" · ");

// Circular brand mark: logo image, falling back to the first letter in brand colour
function ClientMark({ client, size = 16 }) {
  const [broken, setBroken] = useState(false);
  if (client.isAll) return <Building2 size={size} />;
  if (client.logo_url && !broken) {
    return <img src={client.logo_url} alt="" onError={() => setBroken(true)} draggable={false} />;
  }
  return <span>{client.name?.charAt(0).toUpperCase() || "C"}</span>;
}

// Thin segmented bar showing how a client's in-progress posts are spread across stages
function StageBar({ client }) {
  const total = workOf(client);
  if (!total) return null;
  return (
    <span className="cqr-stagebar" aria-hidden="true">
      {stagesOf(client).map((s) => (
        <span key={s.id} style={{ flexGrow: s.n, background: s.color }} />
      ))}
    </span>
  );
}

const ALL_ITEM = { id: "all", name: "All Client Companies", isAll: true, primary_color: "#4f46e5" };

const isTyping = (el) =>
  el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);

// Compact floating rail shown once the header scrolls away: the selected client with
// ▲/▼ to hop between clients that have work in progress, extra controls (mentions bell)
// below, and a searchable picker when the logo is clicked.
export default function ClientQuickRail({ clients = [], value, onChange, children }) {
  const [collapsed, setCollapsed] = useState(() => readLS(COLLAPSED_KEY, false));
  const [recent, setRecent] = useState(() => readLS(RECENT_KEY, []));
  const [tip, setTip] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [slideDir, setSlideDir] = useState(0);

  const pickerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => writeLS(COLLAPSED_KEY, collapsed), [collapsed]);

  const selected = clients.find((c) => String(c.id) === String(value)) || ALL_ITEM;
  const totalPending = clients.reduce((n, c) => n + (c.pending_approvals_count || 0), 0);
  const pendingOf = (c) => (c.isAll ? totalPending : c.pending_approvals_count || 0);

  // Clients with work in progress, most recently touched first: the quick-switch cycle
  const activeCycle = useMemo(
    () =>
      clients
        .filter((c) => workOf(c) > 0)
        .sort(
          (a, b) =>
            (b.active_work?.last_activity || "").localeCompare(a.active_work?.last_activity || "") ||
            (a.name || "").localeCompare(b.name || "")
        ),
    [clients]
  );
  const cycleIdx = activeCycle.findIndex((c) => String(c.id) === String(value));
  const neighbour = (dir) => {
    if (!activeCycle.length) return null;
    if (cycleIdx === -1) return dir > 0 ? activeCycle[0] : activeCycle[activeCycle.length - 1];
    if (activeCycle.length === 1) return null;
    return activeCycle[(cycleIdx + dir + activeCycle.length) % activeCycle.length];
  };
  const prevClient = neighbour(-1);
  const nextClient = neighbour(1);

  // Picker groups. No query: All, Active work, Recent, Other clients. With a query: A–Z matches.
  const { results, groups } = useMemo(() => {
    const term = query.trim().toLowerCase();
    const az = (list) => [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (term) {
      const hits = [ALL_ITEM, ...az(clients)].filter(
        (c) => c.name?.toLowerCase().includes(term) || c.industry?.toLowerCase().includes(term)
      );
      return { results: hits, groups: {} };
    }
    const activeIds = new Set(activeCycle.map((c) => String(c.id)));
    const recentIdle = recent
      .map((id) => clients.find((c) => String(c.id) === id))
      .filter((c) => c && !activeIds.has(String(c.id)));
    const used = new Set([...activeIds, ...recentIdle.map((c) => String(c.id))]);
    const rest = az(clients.filter((c) => !used.has(String(c.id))));
    const list = [ALL_ITEM, ...activeCycle, ...recentIdle, ...rest];
    const g = {};
    let i = 1;
    if (activeCycle.length) g[i] = `Active work · ${activeCycle.length}`;
    i += activeCycle.length;
    if (recentIdle.length) g[i] = "Recent";
    i += recentIdle.length;
    if (rest.length) g[i] = activeCycle.length || recentIdle.length ? "Other clients" : "All clients";
    return { results: list, groups: g };
  }, [clients, query, recent, activeCycle]);

  const select = (id, dir = 0) => {
    if (String(id) === String(value)) {
      setPickerOpen(false);
      return;
    }
    setSlideDir(dir);
    onChange(id);
    if (id !== "all") {
      const next = [String(id), ...recent.filter((r) => r !== String(id))].slice(0, RECENT_MAX);
      setRecent(next);
      writeLS(RECENT_KEY, next);
    }
    setPickerOpen(false);
    setQuery("");
  };

  const step = (dir) => {
    const target = dir > 0 ? nextClient : prevClient;
    if (target) select(target.id, dir);
  };

  // Alt+↑ / Alt+↓ anywhere (outside text fields) hops between active clients
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey || isTyping(document.activeElement)) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        stepRef.current(e.key === "ArrowDown" ? 1 : -1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Picker: focus search on open, start the cursor on the current client, close on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    setTip(null);
    const idx = results.findIndex((c) => String(c.id) === String(value));
    setCursor(idx < 0 ? 0 : idx);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const onDown = (e) => pickerRef.current && !pickerRef.current.contains(e.target) && setPickerOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  // Keep the keyboard cursor in view
  useEffect(() => {
    listRef.current?.querySelector(".cqr-pop-item.cursor")?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const onSearchKey = (e) => {
    if (e.key === "Escape") {
      setPickerOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      select(results[cursor].id);
    }
  };

  // The tip stores which control is hovered, not a client snapshot, so it stays in sync
  // when the selection changes under the cursor (click or Alt+↑/↓)
  const showTip = (e, kind) => {
    if (pickerOpen) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ kind, top: r.top + r.height / 2, left: r.right + 40 });
  };
  const tipClient = tip ? { prev: prevClient, next: nextClient, selected }[tip.kind] : null;
  const tipHint = tip
    ? { prev: "Previous active client · Alt+↑", next: "Next active client · Alt+↓", selected: "Click to change client" }[tip.kind]
    : null;
  const hideTip = () => setTip(null);

  const tipLines = (c) => {
    if (c.isAll) return `${clients.length} clients · ${activeCycle.length} with active work`;
    const work = workOf(c);
    return work ? `${work} in progress · ${workSummary(c)}` : [c.industry, "No work in progress"].filter(Boolean).join(" · ");
  };

  const selectedPending = pendingOf(selected);
  const counter = cycleIdx >= 0 ? `${cycleIdx + 1}/${activeCycle.length}` : activeCycle.length ? `${activeCycle.length} active` : null;

  return (
    <>
      <aside className={`cqr ${collapsed ? "is-collapsed" : ""}`} aria-label="Quick client switcher">
        <div className="cqr-body">
          <button
            type="button"
            className="cqr-step"
            onClick={() => step(-1)}
            disabled={!prevClient}
            onMouseEnter={(e) => showTip(e, "prev")}
            onMouseLeave={hideTip}
            aria-label={prevClient ? `Previous active client: ${prevClient.name}` : "No other active client"}
          >
            <ChevronUp size={16} strokeWidth={2.5} />
          </button>

          <div className="cqr-picker-wrap" ref={pickerRef}>
            <button
              type="button"
              className={`cqr-dot active ${pickerOpen ? "open" : ""}`}
              style={{ "--c": selected.primary_color || "#4f46e5" }}
              onClick={() => setPickerOpen((o) => !o)}
              onMouseEnter={(e) => showTip(e, "selected")}
              onMouseLeave={hideTip}
              aria-label={`Client: ${selected.name}. Change client`}
              aria-expanded={pickerOpen}
              aria-haspopup="dialog"
            >
              <span
                key={selected.id}
                className={`cqr-mark ${slideDir > 0 ? "slide-down" : slideDir < 0 ? "slide-up" : ""}`}
              >
                <ClientMark client={selected} />
              </span>
              {selectedPending > 0 && <span className="cqr-badge">{selectedPending > 9 ? "9+" : selectedPending}</span>}
              <span className="cqr-swap" aria-hidden="true">
                <ChevronRight size={10} strokeWidth={3} />
              </span>
            </button>

            {pickerOpen && (
              <div className="cqr-pop" role="dialog" aria-label="Choose a client">
                <div className="cqr-pop-input">
                  <Search size={15} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setCursor(0);
                    }}
                    onKeyDown={onSearchKey}
                    placeholder={`Search ${clients.length} clients…`}
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <ul className="cqr-pop-list" ref={listRef}>
                  {results.length === 0 && <li className="cqr-pop-empty">No client matches “{query}”</li>}
                  {results.map((c, i) => {
                    const active = String(value) === String(c.id);
                    const pending = pendingOf(c);
                    const work = c.isAll ? 0 : workOf(c);
                    return (
                      <React.Fragment key={c.id}>
                        {groups[i] && <li className="cqr-pop-group">{groups[i]}</li>}
                        <li>
                          <button
                            type="button"
                            className={`cqr-pop-item ${i === cursor ? "cursor" : ""} ${active ? "active" : ""}`}
                            style={{ "--c": c.primary_color || "#4f46e5" }}
                            onMouseEnter={() => setCursor(i)}
                            onClick={() => select(c.id)}
                          >
                            <span className="cqr-dot cqr-dot-sm">
                              <span className="cqr-mark">
                                <ClientMark client={c} size={14} />
                              </span>
                              {work > 0 && <span className="cqr-live" aria-hidden="true" />}
                            </span>
                            <span className="cqr-pop-text">
                              <strong>{c.name}</strong>
                              {work > 0 ? (
                                <>
                                  <small>{workSummary(c)}</small>
                                  <StageBar client={c} />
                                </>
                              ) : (
                                <small>
                                  {c.isAll
                                    ? `${clients.length} clients · ${activeCycle.length} with active work`
                                    : c.industry || `${c.posts_count || 0} posts`}
                                </small>
                              )}
                            </span>
                            {pending > 0 && <span className="cqr-pop-pending">{pending} pending</span>}
                            {active && <Check size={15} className="cqr-pop-check" />}
                          </button>
                        </li>
                      </React.Fragment>
                    );
                  })}
                </ul>
                <div className="cqr-pop-hint">↑ ↓ move · Enter select · Alt+↑/↓ switch active client anywhere</div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="cqr-step"
            onClick={() => step(1)}
            disabled={!nextClient}
            onMouseEnter={(e) => showTip(e, "next")}
            onMouseLeave={hideTip}
            aria-label={nextClient ? `Next active client: ${nextClient.name}` : "No other active client"}
          >
            <ChevronDown size={16} strokeWidth={2.5} />
          </button>

          {counter && <span className="cqr-counter">{counter}</span>}

          {children && <div className="cqr-extra">{children}</div>}
        </div>

        <button
          type="button"
          className="cqr-toggle"
          onClick={() => {
            setCollapsed((v) => !v);
            setPickerOpen(false);
            hideTip();
          }}
          title={collapsed ? "Show client & mentions" : "Hide"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {tip && tipClient && !collapsed && (
        <div
          key={`${tip.kind}-${tipClient.id}`}
          className="cqr-tip"
          style={{ top: tip.top, left: tip.left, "--c": tipClient.primary_color || "#4f46e5" }}
        >
          <strong>{tipClient.name}</strong>
          <span>{tipLines(tipClient)}</span>
          <StageBar client={tipClient} />
          <em>{tipHint}</em>
        </div>
      )}
    </>
  );
}
