"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import { Send, Trash2, AtSign } from "lucide-react";
import { toast, confirmDialog, apiErrorMessage } from "./SocialFeedback";
import { relativeTime, initials, loadTeamMembers } from "./workflowUtils";

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Highlight "@Name" for every user the comment actually mentions
function CommentBody({ body, mentions = [] }) {
  if (!mentions.length) return body;
  const names = [...new Set(mentions.flatMap((m) => [m.name, m.username]).filter(Boolean))].sort((a, b) => b.length - a.length);
  const re = new RegExp(`(@(?:${names.map(escapeRegExp).join("|")}))`, "gi");
  return body.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="ppd-mention">
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export default function CommentThread({ post, onCountChange, onRefresh }) {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [team, setTeam] = useState([]);
  const [picked, setPicked] = useState({}); // id -> name chosen from the @ menu
  const [suggest, setSuggest] = useState(null); // { query, start, items, active }
  const inputRef = useRef(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/social/posts/${post.id}/comments/`);
      const list = Array.isArray(res.data) ? res.data : [];
      setComments(list);
      onCountChange && onCountChange(list.length);
    } catch (err) {
      setComments([]);
      toast.error(apiErrorMessage(err, "Could not load comments."));
    }
  }, [post.id, onCountChange]);

  useEffect(() => {
    setComments(null);
    setText("");
    setPicked({});
    setSuggest(null);
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    loadTeamMembers().then(setTeam);
  }, []);

  // Open the @ menu when the word before the caret starts with "@"
  const updateSuggestions = (value, caret) => {
    const match = /(^|\s)@([^\s@]{0,30})$/.exec(value.slice(0, caret));
    if (!match) {
      setSuggest(null);
      return;
    }
    const query = match[2].toLowerCase();
    const items = team
      .filter((m) => !query || m.name.toLowerCase().includes(query) || m.username.toLowerCase().includes(query))
      .slice(0, 6);
    setSuggest(items.length ? { start: caret - match[2].length - 1, caret, items, active: 0 } : null);
  };

  const pickMember = (member) => {
    if (!suggest) return;
    const before = text.slice(0, suggest.start);
    const after = text.slice(suggest.caret);
    const insert = `@${member.name} `;
    const next = before + insert + after;
    setText(next);
    setPicked((prev) => ({ ...prev, [member.id]: member.name }));
    setSuggest(null);
    const caret = before.length + insert.length;
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(caret, caret);
      }
    });
  };

  const submit = async (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || posting) return;
    const mentionIds = Object.entries(picked)
      .filter(([, name]) => body.includes(`@${name}`))
      .map(([id]) => Number(id));
    setPosting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/social/posts/${post.id}/comments/`, { body, mention_ids: mentionIds });
      const next = [...(comments || []), res.data];
      setComments(next);
      onCountChange && onCountChange(next.length);
      setText("");
      setPicked({});
      if (res.data.mentions?.length) {
        toast.success(`Notified ${res.data.mentions.map((m) => m.name).join(", ")}.`, { title: "Comment posted" });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not add comment."));
    } finally {
      setPosting(false);
    }
  };

  const remove = async (comment) => {
    const ok = await confirmDialog({
      title: "Delete comment?",
      message: "This removes the comment for everyone. It can't be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await axios.delete(`${API_BASE_URL}/social/posts/${post.id}/comments/${comment.id}/`);
      const next = (comments || []).filter((c) => c.id !== comment.id);
      setComments(next);
      onCountChange && onCountChange(next.length);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete comment."));
    }
  };

  const onKeyDown = (e) => {
    if (suggest) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        setSuggest((s) => ({ ...s, active: (s.active + delta + s.items.length) % s.items.length }));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickMember(suggest.items[suggest.active]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSuggest(null);
        return;
      }
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit(e);
  };

  return (
    <>
      <form className="ppd-composer" onSubmit={submit}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            updateSuggestions(e.target.value, e.target.selectionStart);
          }}
          onKeyDown={onKeyDown}
          onClick={(e) => updateSuggestions(e.target.value, e.target.selectionStart)}
          onBlur={() => setTimeout(() => setSuggest(null), 150)}
          placeholder="Leave a comment… type @ to mention a teammate"
          rows={3}
        />
        {suggest && (
          <ul className="ppd-suggest" role="listbox">
            {suggest.items.map((m, i) => (
              <li
                key={m.id}
                role="option"
                aria-selected={i === suggest.active}
                className={i === suggest.active ? "active" : ""}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickMember(m);
                }}
                onMouseEnter={() => setSuggest((s) => ({ ...s, active: i }))}
              >
                <span className="ppd-avatar ppd-avatar-sm">{initials(m.name)}</span>
                <span className="ppd-suggest-name">{m.name}</span>
                <span className="ppd-suggest-sub">{m.designation || m.role}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="ppd-composer-foot">
          <span>
            <AtSign size={11} /> mention · Ctrl + Enter to send
          </span>
          <button type="submit" disabled={posting || !text.trim()}>
            <Send size={13} /> {posting ? "Sending…" : "Comment"}
          </button>
        </div>
      </form>

      {comments === null ? (
        <p className="ppd-empty" style={{ textAlign: "center", marginTop: 24 }}>
          Loading comments…
        </p>
      ) : comments.length === 0 ? (
        <p className="ppd-empty" style={{ textAlign: "center", marginTop: 24 }}>
          No comments yet. Start the conversation above.
        </p>
      ) : (
        <ul className="ppd-comments">
          {[...comments].reverse().map((c) => (
            <li key={c.id}>
              <span className="ppd-avatar">{initials(c.author_name)}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="ppd-comment-meta">
                  <strong>{c.author_name}</strong>
                  {c.author_role && <span className="ppd-comment-kind">{c.author_role}</span>}
                  <span title={new Date(c.created_at).toLocaleString()}>{relativeTime(new Date(c.created_at))}</span>
                  {c.can_delete && (
                    <button type="button" className="ppd-comment-delete" onClick={() => remove(c)} title="Delete comment">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="ppd-comment-text">
                  <CommentBody body={c.body} mentions={c.mentions} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
