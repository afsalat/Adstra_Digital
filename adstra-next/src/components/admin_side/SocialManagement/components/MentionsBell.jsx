"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import { AtSign, CheckCheck } from "lucide-react";
import { relativeTime } from "./workflowUtils";

const POLL_MS = 60000;

// Header inbox for @mentions in post comments; clicking one opens that post's comments
export default function MentionsBell({ onOpenMention }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ unread_count: 0, results: [] });
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef(null);

  const fetchMentions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/social/mentions/`);
      setData({ unread_count: res.data?.unread_count || 0, results: res.data?.results || [] });
    } catch (err) {
      // Signed-out or offline: keep the bell quiet
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchMentions();
    const timer = setInterval(fetchMentions, POLL_MS);
    window.addEventListener("focus", fetchMentions);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", fetchMentions);
    };
  }, [fetchMentions]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = async (ids) => {
    try {
      await axios.post(`${API_BASE_URL}/social/mentions/`, ids ? { ids } : {});
    } catch (err) {}
    setData((d) => ({
      unread_count: ids ? Math.max(0, d.unread_count - d.results.filter((m) => ids.includes(m.id) && !m.is_read).length) : 0,
      results: d.results.map((m) => (!ids || ids.includes(m.id) ? { ...m, is_read: true } : m)),
    }));
  };

  const handleOpen = (mention) => {
    setOpen(false);
    if (!mention.is_read) markRead([mention.id]);
    onOpenMention && onOpenMention(mention);
  };

  const unread = data.unread_count;

  return (
    <div className="mb-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`mb-btn ${open ? "active" : ""}`}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) fetchMentions();
        }}
        title={unread ? `${unread} unread mention${unread === 1 ? "" : "s"}` : "Mentions"}
        aria-label="Mentions"
        aria-expanded={open}
      >
        <AtSign size={18} />
        {unread > 0 && <span className="mb-badge">{unread > 99 ? "99+" : unread}</span>}
      </button>

      {open && (
        <div className="mb-panel" role="dialog" aria-label="Mentions">
          <div className="mb-head">
            <strong>Mentions</strong>
            {unread > 0 && (
              <button type="button" className="mb-mark" onClick={() => markRead(null)}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          {!loaded ? (
            <p className="mb-empty">Loading…</p>
          ) : data.results.length === 0 ? (
            <p className="mb-empty">
              No mentions yet. When a teammate types @{"your name"} in a post comment, it shows up here.
            </p>
          ) : (
            <ul className="mb-list">
              {data.results.map((m) => (
                <li key={m.id}>
                  <button type="button" className={`mb-item ${m.is_read ? "" : "unread"}`} onClick={() => handleOpen(m)}>
                    <span className="mb-dot" />
                    <span className="mb-item-body">
                      <span className="mb-item-title">
                        <strong>{m.author_name}</strong> mentioned you on <strong>{m.post_title || "Untitled post"}</strong>
                      </span>
                      <span className="mb-item-snippet">{m.body}</span>
                      <span className="mb-item-meta">
                        {m.client_name} · {relativeTime(new Date(m.created_at))}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
