"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Building2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Search, X } from "lucide-react";

const RECENT_KEY = "sm_rail_recent_clients";
const COLLAPSED_KEY = "sm_rail_collapsed";
const RECENT_MAX = 5;

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

// Circular brand mark: logo image, falling back to the first letter in brand colour
function ClientMark({ client, size = 16 }) {
  const [broken, setBroken] = useState(false);
  if (client.isAll) return <Building2 size={size} />;
  if (client.logo_url && !broken) {
    return <img src={client.logo_url} alt="" onError={() => setBroken(true)} draggable={false} />;
  }
  return <span>{client.name?.charAt(0).toUpperCase() || "C"}</span>;
}

// Floating vertical rail shown once the header scrolls away: one circle per client,
// name + workload on hover, search for long lists, and extra controls (mentions bell) as children
export default function ClientQuickRail({ clients = [], value, onChange, children }) {
  const [collapsed, setCollapsed] = useState(() => readLS(COLLAPSED_KEY, false));
  const [recent, setRecent] = useState(() => readLS(RECENT_KEY, []));
  const [tip, setTip] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [scrollState, setScrollState] = useState({ overflow: false, up: false, down: false });
  // Order snapshot: only re-sorts when the pointer leaves the rail, so circles don't jump under the cursor
  const [orderBasis, setOrderBasis] = useState(recent);

  const listRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => writeLS(COLLAPSED_KEY, collapsed), [collapsed]);

  // Recently used first, then most pending approvals, then A–Z
  const ordered = useMemo(() => {
    const rank = (c) => {
      const r = orderBasis.indexOf(String(c.id));
      return r === -1 ? RECENT_MAX : r;
    };
    return [...clients].sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (b.pending_approvals_count || 0) - (a.pending_approvals_count || 0) ||
        (a.name || "").localeCompare(b.name || "")
    );
  }, [clients, orderBasis]);

  const allItem = { id: "all", name: "All Client Companies", isAll: true, primary_color: "#4f46e5" };
  const totalPending = clients.reduce((n, c) => n + (c.pending_approvals_count || 0), 0);

  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base = [allItem, ...[...clients].sort((a, b) => (a.name || "").localeCompare(b.name || ""))];
    if (!term) return base;
    return base.filter(
      (c) => c.name?.toLowerCase().includes(term) || c.industry?.toLowerCase().includes(term)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, query]);

  const select = (id) => {
    onChange(id);
    if (id !== "all") {
      const next = [String(id), ...recent.filter((r) => r !== String(id))].slice(0, RECENT_MAX);
      setRecent(next);
      writeLS(RECENT_KEY, next);
    }
  };

  // Fade + arrow hints when the client list overflows
  const updateScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setScrollState({
      overflow: el.scrollHeight > el.clientHeight + 2,
      up: el.scrollTop > 2,
      down: el.scrollTop + el.clientHeight < el.scrollHeight - 2,
    });
  }, []);

  useEffect(() => {
    updateScroll();
    window.addEventListener("resize", updateScroll);
    return () => window.removeEventListener("resize", updateScroll);
  }, [updateScroll, ordered.length, collapsed]);

  // Keep the selected client visible inside the scrolling list
  useEffect(() => {
    const el = listRef.current?.querySelector(".cqr-dot.active");
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [value, collapsed]);

  const scrollBy = (dir) => listRef.current?.scrollBy({ top: dir * 132, behavior: "smooth" });

  // Search popover: focus on open, close on outside click / Esc
  useEffect(() => {
    if (!searchOpen) return;
    setCursor(0);
    setTip(null);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const onDown = (e) => searchRef.current && !searchRef.current.contains(e.target) && setSearchOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
    };
  }, [searchOpen]);

  const onSearchKey = (e) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && searchResults[cursor]) {
      select(searchResults[cursor].id);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const showTip = (e, client) => {
    if (searchOpen) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ client, top: r.top + r.height / 2, left: r.right + 14 });
  };
  const hideTip = () => setTip(null);

  const renderDot = (c, i) => {
    const active = String(value) === String(c.id);
    const pending = c.isAll ? totalPending : c.pending_approvals_count || 0;
    return (
      <button
        key={c.id}
        type="button"
        className={`cqr-dot ${active ? "active" : ""} ${c.logo_url ? "has-logo" : ""}`}
        style={{ "--c": c.primary_color || "#4f46e5", "--i": Math.min(i, 12) }}
        onClick={() => select(c.id)}
        onMouseEnter={(e) => showTip(e, c)}
        onMouseLeave={hideTip}
        onFocus={(e) => showTip(e, c)}
        onBlur={hideTip}
        aria-label={c.name}
        aria-pressed={active}
      >
        <span className="cqr-mark">
          <ClientMark client={c} />
        </span>
        {pending > 0 && <span className="cqr-badge">{pending > 9 ? "9+" : pending}</span>}
      </button>
    );
  };

  return (
    <>
      <aside
        className={`cqr ${collapsed ? "is-collapsed" : ""}`}
        aria-label="Quick client switcher"
        onMouseLeave={() => setOrderBasis(recent)}
      >
        <div className="cqr-body">
          <div className="cqr-search-wrap" ref={searchRef}>
            <button
              type="button"
              className={`cqr-icon-btn ${searchOpen ? "active" : ""}`}
              onClick={() => setSearchOpen((o) => !o)}
              title="Search clients"
              aria-label="Search clients"
              aria-expanded={searchOpen}
            >
              <Search size={16} />
            </button>

            {searchOpen && (
              <div className="cqr-pop" role="dialog" aria-label="Find a client">
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
                <ul className="cqr-pop-list">
                  {searchResults.length === 0 && <li className="cqr-pop-empty">No client matches “{query}”</li>}
                  {searchResults.map((c, i) => {
                    const active = String(value) === String(c.id);
                    const pending = c.isAll ? totalPending : c.pending_approvals_count || 0;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={`cqr-pop-item ${i === cursor ? "cursor" : ""} ${active ? "active" : ""}`}
                          style={{ "--c": c.primary_color || "#4f46e5" }}
                          onMouseEnter={() => setCursor(i)}
                          onClick={() => {
                            select(c.id);
                            setSearchOpen(false);
                            setQuery("");
                          }}
                        >
                          <span className="cqr-dot cqr-dot-sm">
                            <span className="cqr-mark">
                              <ClientMark client={c} size={14} />
                            </span>
                          </span>
                          <span className="cqr-pop-text">
                            <strong>{c.name}</strong>
                            <small>{c.isAll ? `${clients.length} active clients` : c.industry || `${c.posts_count || 0} posts`}</small>
                          </span>
                          {pending > 0 && <span className="cqr-pop-pending">{pending} pending</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="cqr-pop-hint">↑ ↓ to move · Enter to select · Esc to close</div>
              </div>
            )}
          </div>

          {renderDot(allItem, 0)}

          <div className={`cqr-list-wrap ${scrollState.up ? "can-up" : ""} ${scrollState.down ? "can-down" : ""}`}>
            {scrollState.overflow && (
              <button
                type="button"
                className="cqr-scroll"
                onClick={() => scrollBy(-1)}
                disabled={!scrollState.up}
                aria-label="Scroll up"
              >
                <ChevronUp size={14} />
              </button>
            )}
            <div className="cqr-list" ref={listRef} onScroll={updateScroll}>
              {ordered.map((c, i) => renderDot(c, i + 1))}
            </div>
            {scrollState.overflow && (
              <button
                type="button"
                className="cqr-scroll"
                onClick={() => scrollBy(1)}
                disabled={!scrollState.down}
                aria-label="Scroll down"
              >
                <ChevronDown size={14} />
              </button>
            )}
          </div>

          {children && <div className="cqr-extra">{children}</div>}
        </div>

        <button
          type="button"
          className="cqr-toggle"
          onClick={() => {
            setCollapsed((v) => !v);
            setSearchOpen(false);
            hideTip();
          }}
          title={collapsed ? "Show clients & mentions" : "Hide"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {tip && !collapsed && (
        <div className="cqr-tip" style={{ top: tip.top, left: tip.left, "--c": tip.client.primary_color || "#4f46e5" }}>
          <strong>{tip.client.name}</strong>
          <span>
            {tip.client.isAll
              ? `${clients.length} clients · ${totalPending} awaiting approval`
              : [
                  tip.client.industry,
                  `${tip.client.posts_count || 0} posts`,
                  tip.client.pending_approvals_count ? `${tip.client.pending_approvals_count} awaiting approval` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
          </span>
        </div>
      )}
    </>
  );
}
