"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { AlertCircle, ArrowLeft, Check, CheckCheck, Clock, CornerUpLeft, Edit2, Info, Loader2, MessageSquare, Plus, Search, Send, ShieldCheck, Trash2, UserPlus, Users, X } from "lucide-react";
import API_BASE_URL from "@/utils/apiBase";

const headers = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const request = (method, path, data, extra = {}) => axios({ method, url: `${API_BASE_URL}${path}`, data, headers: headers(), ...extra });
const initials = name => String(name || "?").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
const sameDay = (a, b) => a && b && new Date(a).toDateString() === new Date(b).toDateString();
const merge = (previous, incoming) => {
  const indexed = new Map(previous.map(item => [item.id, item]));
  incoming.forEach(item => indexed.set(item.id, item));
  return [...indexed.values()].sort((a, b) => Number(a.id) - Number(b.id));
};

function Avatar({ name, online, size = 38 }) {
  return <span className="lm-chat-avatar" style={{ width: size, height: size }}>{initials(name)}{online && <i />}</span>;
}

function Details({ active, currentUser, onClose, onAdd, onRemove, open }) {
  const admin = active?.members.find(member => member.id === currentUser?.id)?.is_admin;
  return <aside className={`lm-chat-details ${open ? "is-open" : ""}`} aria-label="Conversation details">
    <button className="lm-chat-details-close" aria-label="Close details" onClick={onClose}><X size={17}/></button>
    {active && <><Avatar name={active.name} size={56}/><h3>{active.name}</h3><p>{active.kind === "GROUP" ? `${active.members.length} team members` : "Personal conversation"}</p><hr/><span>MEMBERS</span>{active.kind === "GROUP" && admin && <button className="lm-chat-add-member" onClick={onAdd}><Plus size={13}/> Add members</button>}{active.members.map(member => <div key={member.id}><Avatar name={member.name} online={member.online} size={30}/><p><strong>{member.name}</strong><small>{member.is_admin ? "Group admin" : member.designation}</small></p>{active.kind === "GROUP" && admin && member.id !== currentUser?.id && <button className="lm-chat-remove-member" aria-label={`Remove ${member.name}`} onClick={() => onRemove(member)}><X size={12}/></button>}</div>)}</>}
  </aside>;
}

export default function ChatWorkspace({ currentUser, onUnreadChange }) {
  const [conversations, setConversations] = useState([]), [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]), [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState(""), [employeeSearch, setEmployeeSearch] = useState(""), [filter, setFilter] = useState("ALL");
  const [draft, setDraft] = useState(""), [reply, setReply] = useState(null), [typing, setTyping] = useState([]);
  const [loading, setLoading] = useState(true), [historyLoading, setHistoryLoading] = useState(false), [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(""), [forbidden, setForbidden] = useState(false), [employeeError, setEmployeeError] = useState("");
  const [removalNotice, setRemovalNotice] = useState("");
  const [showCreate, setShowCreate] = useState(null), [selectedPeople, setSelectedPeople] = useState([]), [groupName, setGroupName] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false), [editing, setEditing] = useState(null), [editBody, setEditBody] = useState("");
  const listRef = useRef(null), bottomRef = useRef(null), maxId = useRef(0), changedAt = useRef(null), readId = useRef(0), typingTimer = useRef(null), typingSent = useRef(false), shouldAutoScroll = useRef(true);
  const active = conversations.find(conversation => conversation.id === activeId);

  const loadConversations = useCallback(async (silent = false) => {
    try {
      const { data } = await request("get", "/chat/conversations/");
      setConversations(data.results || []); onUnreadChange?.(data.unread_count || 0);
      setActiveId(value => value || data.results?.[0]?.id || null); setForbidden(false); setError("");
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) setForbidden(true);
      if (!silent) setError(err.response?.status === 403 ? "Your account does not have access to employee chat." : "Chat is temporarily disconnected.");
    } finally { if (!silent) setLoading(false); }
  }, [onUnreadChange]);

  const loadEmployees = useCallback(async query => {
    try { const { data } = await request("get", "/chat/employees/", undefined, { params: query ? { search: query } : {} }); setEmployees(data || []); setEmployeeError(""); }
    catch (err) { setEmployeeError(err.response?.status === 403 ? "Employee directory access is restricted." : "Employee directory unavailable."); }
  }, []);

  const loadMessages = useCallback(async incremental => {
    if (!activeId) return;
    try {
      const params = incremental && maxId.current ? { after_id: maxId.current, ...(changedAt.current ? { changed_after: changedAt.current } : {}) } : {};
      const { data } = await request("get", `/chat/conversations/${activeId}/messages/`, undefined, { params });
      const incoming = data.results || [];
      setMessages(previous => incremental ? merge(previous, incoming) : incoming); setTyping(data.typing || []); setHasMore(data.has_more); changedAt.current = data.cursor;
      maxId.current = incoming.reduce((value, message) => Math.max(value, Number(message.id) || 0), maxId.current);
      const needsRead = incoming.some(message => !message.is_system && message.sender?.id !== currentUser?.id && Number(message.id) > readId.current);
      if (needsRead && !document.hidden) { await request("post", `/chat/conversations/${activeId}/read/`, {}); readId.current = maxId.current; }
      setForbidden(false); setError("");
    } catch (err) {
      if ([403, 404].includes(err.response?.status)) { setForbidden(true); setRemovalNotice("You no longer have access to that conversation. It may have been removed or an administrator changed its membership."); setError(""); setActiveId(null); await loadConversations(true); }
      else setError("Live updates paused. Existing messages remain available while we reconnect.");
    }
  }, [activeId, currentUser?.id, loadConversations]);

  useEffect(() => { loadConversations(); loadEmployees(""); request("post", "/chat/presence/", {}).catch(() => {}); return () => clearTimeout(typingTimer.current); }, [loadConversations, loadEmployees]);
  useEffect(() => { setMessages([]); maxId.current = 0; changedAt.current = null; readId.current = 0; setDetailsOpen(false); if (activeId) loadMessages(false); }, [activeId, loadMessages]);
  useEffect(() => { const timer = setInterval(() => { if (!document.hidden) { loadConversations(true); loadMessages(true); request("post", "/chat/presence/", {}).catch(() => {}); } }, 10000); return () => clearInterval(timer); }, [loadConversations, loadMessages]);
  useEffect(() => { if (!historyLoading && shouldAutoScroll.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, typing.length, historyLoading]);
  useEffect(() => { const timer = setTimeout(() => loadEmployees(employeeSearch.trim()), 250); return () => clearTimeout(timer); }, [employeeSearch, loadEmployees]);
  useEffect(() => { const close = event => { if (event.key === "Escape") { setShowCreate(null); setDetailsOpen(false); } }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, []);

  const loadOlder = async () => {
    if (!messages.length || historyLoading) return;
    const pane = listRef.current, oldHeight = pane?.scrollHeight || 0; shouldAutoScroll.current = false; setHistoryLoading(true);
    try { const { data } = await request("get", `/chat/conversations/${activeId}/messages/`, undefined, { params: { before_id: messages[0].id } }); setMessages(previous => [...(data.results || []), ...previous]); setHasMore(data.has_more); requestAnimationFrame(() => { if (pane) pane.scrollTop = pane.scrollHeight - oldHeight; }); }
    catch { setError("Earlier messages could not be loaded. Please retry."); } finally { setHistoryLoading(false); }
  };
  const draftChanged = value => {
    setDraft(value); if (!activeId) return;
    if (value && !typingSent.current) { typingSent.current = true; request("post", `/chat/conversations/${activeId}/typing/`, { typing: true }).catch(() => {}); }
    clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => { typingSent.current = false; request("post", `/chat/conversations/${activeId}/typing/`, { typing: false }).catch(() => {}); }, 3000);
  };
  const send = async () => {
    const body = draft.trim(); if (!body || !activeId) return;
    const pending = { id: `pending-${Date.now()}`, body, sender: { id: currentUser?.id, name: currentUser?.fullname || currentUser?.username }, created_at: new Date().toISOString(), pending: true, reply_to: reply };
    shouldAutoScroll.current = true; setMessages(items => [...items, pending]); setDraft(""); setReply(null);
    try { const { data } = await request("post", `/chat/conversations/${activeId}/messages/`, { body, reply_to: reply?.id }); setMessages(items => items.map(item => item.id === pending.id ? data : item)); maxId.current = Math.max(maxId.current, data.id); loadConversations(true); }
    catch { setMessages(items => items.map(item => item.id === pending.id ? { ...item, pending: false, failed: true } : item)); }
  };
  const create = async () => {
    try {
      if (showCreate === "ADD") { for (const user_id of selectedPeople) await request("post", `/chat/conversations/${activeId}/members/`, { user_id }); await loadMessages(true); }
      else { const payload = showCreate === "GROUP" ? { kind: "GROUP", name: groupName.trim(), member_ids: selectedPeople } : { kind: "DIRECT", member_ids: selectedPeople.slice(0, 1) }; const { data } = await request("post", "/chat/conversations/", payload); setActiveId(data.id); }
      setShowCreate(null); setSelectedPeople([]); setGroupName(""); await loadConversations();
    } catch (err) { setError(err.response?.data?.detail || "Conversation could not be created."); }
  };
  const removeMember = async member => { if (!window.confirm(`Remove ${member.name} from this group?`)) return; try { await request("delete", `/chat/conversations/${activeId}/members/`, { user_id: member.id }); await loadConversations(); await loadMessages(true); } catch (err) { setError(err.response?.data?.detail || "Member could not be removed. Your admin access may have changed."); } };
  const removeMessage = async message => { if (!window.confirm("Delete this message?")) return; try { const { data } = await request("delete", `/chat/conversations/${activeId}/messages/${message.id}/`); setMessages(items => items.map(item => item.id === data.id ? data : item)); } catch (err) { setError(err.response?.data?.detail || "Message could not be deleted."); } };
  const saveEdit = async () => { const body = editBody.trim(); if (!body || !editing) return; try { const { data } = await request("patch", `/chat/conversations/${activeId}/messages/${editing.id}/`, { body }); setMessages(items => items.map(item => item.id === data.id ? data : item)); setEditing(null); setEditBody(""); } catch (err) { setError(err.response?.data?.detail || "Message could not be edited."); } };
  const visible = useMemo(() => conversations.filter(item => (filter === "ALL" || item.kind === filter) && item.name.toLowerCase().includes(search.toLowerCase())), [conversations, filter, search]);

  if (loading) return <div className="lm-chat-state"><Loader2 className="spin"/><strong>Opening conversations…</strong></div>;
  if (forbidden && !conversations.length) return <div className="lm-chat-state lm-chat-state--error"><ShieldCheck/><strong>Chat access unavailable</strong><p>{error}</p><button className="lm-btn lm-btn--primary" onClick={() => loadConversations()}>Retry</button></div>;
  if (error && !conversations.length) return <div className="lm-chat-state lm-chat-state--error"><AlertCircle/><strong>Could not connect to chat</strong><p>{error}</p><button className="lm-btn lm-btn--primary" onClick={() => loadConversations()}>Retry</button></div>;
  if (removalNotice && !activeId) return <div className="lm-chat-state lm-chat-state--error"><UserPlus/><strong>Conversation access changed</strong><p>{removalNotice}</p><button className="lm-btn lm-btn--primary" onClick={() => { setRemovalNotice(""); setForbidden(false); setActiveId(conversations[0]?.id || null); }}>Return to conversations</button></div>;

  return <section className={`lm-chat ${activeId ? "has-active" : ""}`}>
    <aside className="lm-chat-list"><header><div><span>TEAM MESSENGER</span><h2>Conversations</h2></div><div><button aria-label="New personal message" onClick={() => setShowCreate("DIRECT")}><Edit2 size={16}/></button><button aria-label="New group" onClick={() => setShowCreate("GROUP")}><Users size={16}/></button></div></header><label className="lm-chat-search"><Search size={15}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search conversations"/></label><nav className="lm-chat-filters" aria-label="Conversation type">{[["ALL","All"],["DIRECT","Personal"],["GROUP","Groups"]].map(([id,label]) => <button aria-pressed={filter === id} className={filter === id ? "active" : ""} key={id} onClick={() => setFilter(id)}>{label}</button>)}</nav><div className="lm-chat-conversations">{visible.length ? visible.map(item => <button key={item.id} className={activeId === item.id ? "active" : ""} onClick={() => setActiveId(item.id)}><Avatar name={item.name} online={item.kind === "DIRECT" && item.members.some(member => member.id !== currentUser?.id && member.online)}/><span><strong>{item.name}</strong><small>{item.last_message?.deleted_at ? "Message deleted" : item.last_message?.body || (item.kind === "GROUP" ? `${item.members.length} members` : "Start a conversation")}</small></span><time>{item.last_message ? new Date(item.last_message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</time>{item.unread_count > 0 && <b>{item.unread_count}</b>}</button>) : <div className="lm-chat-empty"><MessageSquare/><strong>No conversations</strong><p>Start a personal chat or bring your team together.</p></div>}</div></aside>
    <main className="lm-chat-thread">{active ? <><header><button className="lm-chat-back" aria-label="Back to conversations" onClick={() => setActiveId(null)}><ArrowLeft size={18}/></button><Avatar name={active.name} online={active.kind === "DIRECT" && active.members.some(member => member.id !== currentUser?.id && member.online)} size={36}/><div><strong>{active.name}</strong><small>{active.kind === "GROUP" ? `${active.members.length} members` : (active.members.some(member => member.id !== currentUser?.id && member.online) ? "Online now" : "Offline")}</small></div><button aria-label="Conversation details" aria-expanded={detailsOpen} onClick={() => setDetailsOpen(true)}><Info size={18}/></button></header>{error && <div className="lm-chat-alert"><AlertCircle size={14}/>{error}<button onClick={() => { loadConversations(); loadMessages(true); }}>Retry</button></div>}<div className="lm-chat-messages" ref={listRef}>{hasMore && <button className="lm-chat-load-older" onClick={loadOlder} disabled={historyLoading}>{historyLoading ? <Loader2 size={13} className="spin"/> : <Clock size={13}/>} Load earlier messages</button>}{messages.length === 0 && <div className="lm-chat-empty"><MessageSquare/><strong>No messages yet</strong><p>Say hello and start collaborating.</p></div>}{messages.map((message,index) => {
      const own = message.sender?.id === currentUser?.id, grouped = index > 0 && messages[index - 1].sender?.id === message.sender?.id && sameDay(messages[index - 1].created_at, message.created_at), showDate = !index || !sameDay(messages[index - 1].created_at, message.created_at);
      return <React.Fragment key={message.id}>{showDate && <div className="lm-chat-date"><span>{new Date(message.created_at).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span></div>}{message.is_system ? <div className="lm-chat-system"><Users size={12}/>{message.body}<time>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div> : <div className={`lm-chat-message ${own ? "own" : ""} ${grouped ? "grouped" : ""}`}><div className="lm-chat-bubble">{message.reply_to && <button className="lm-chat-reply-quote">{message.reply_to.sender_name}<span>{message.reply_to.body}</span></button>}{editing?.id === message.id ? <div className="lm-chat-edit"><textarea value={editBody} onChange={event => setEditBody(event.target.value)} autoFocus/><footer><button onClick={() => setEditing(null)}>Cancel</button><button onClick={saveEdit} disabled={!editBody.trim()}>Save</button></footer></div> : message.deleted_at ? <em>Message deleted</em> : <p>{message.body}</p>}<footer>{!own && !grouped && <strong>{message.sender?.name}</strong>}<time>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>{message.edited_at && <span>edited</span>}{message.pending && <Clock size={11}/>} {message.failed && <span className="failed">Not sent</span>}{own && !message.pending && !message.failed && message.receipt && <span className="lm-chat-receipt" aria-label={message.receipt.state}>{message.receipt.state === "read" ? <CheckCheck size={12}/> : <Check size={12}/>} {message.receipt.state === "read" ? (message.receipt.recipient_count > 1 ? `Read ${message.receipt.read_count}/${message.receipt.recipient_count}` : "Read") : "Delivered"}</span>}</footer></div>{!message.pending && !message.deleted_at && editing?.id !== message.id && <div className="lm-chat-message-actions"><button aria-label="Reply" onClick={() => setReply(message)}><CornerUpLeft size={13}/></button>{own && <><button aria-label="Edit message" onClick={() => { setEditing(message); setEditBody(message.body); }}><Edit2 size={13}/></button><button aria-label="Delete message" onClick={() => removeMessage(message)}><Trash2 size={13}/></button></>}</div>}</div>}</React.Fragment>;
    })}{typing.length > 0 && <div className="lm-chat-typing"><i/><i/><i/> {typing.map(user => user.name).join(", ")} typing</div>}<div ref={bottomRef}/></div><footer className="lm-chat-composer">{reply && <div className="lm-chat-reply-preview"><CornerUpLeft size={14}/><span>Replying to <strong>{reply.sender?.name}</strong><small>{reply.body}</small></span><button aria-label="Cancel reply" onClick={() => setReply(null)}><X size={15}/></button></div>}<div><textarea value={draft} onChange={event => draftChanged(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={`Message ${active.name}`} rows={1}/><button aria-label="Send message" onClick={send} disabled={!draft.trim()}><Send size={17}/></button></div><small>Enter to send · Shift + Enter for a new line</small></footer></> : <div className="lm-chat-empty lm-chat-welcome"><MessageSquare/><strong>Your team, in one place</strong><p>Select a conversation or start a new one.</p></div>}</main>
    <Details active={active} currentUser={currentUser} open={detailsOpen} onClose={() => setDetailsOpen(false)} onAdd={() => { setSelectedPeople([]); setShowCreate("ADD"); }} onRemove={removeMember}/>{detailsOpen && <button className="lm-chat-details-scrim" aria-label="Close details" onClick={() => setDetailsOpen(false)}/>} 
    {showCreate && <div className="lm-overlay" role="dialog" aria-modal="true" aria-labelledby="chat-dialog-title"><div className="lm-chat-modal"><header><div><span>{showCreate === "GROUP" ? "NEW GROUP" : showCreate === "ADD" ? "GROUP MEMBERS" : "PERSONAL CHAT"}</span><h3 id="chat-dialog-title">{showCreate === "GROUP" ? "Create a group" : showCreate === "ADD" ? "Add team members" : "Start a conversation"}</h3></div><button aria-label="Close dialog" onClick={() => setShowCreate(null)}><X/></button></header>{showCreate === "GROUP" && <label>Group name<input value={groupName} onChange={event => setGroupName(event.target.value)} maxLength={120} placeholder="e.g. Sales launch team"/></label>}<label>Find employees<div className="lm-chat-search lm-chat-employee-search"><Search size={14}/><input value={employeeSearch} onChange={event => setEmployeeSearch(event.target.value)} placeholder="Search name, team or role"/></div>{employeeError ? <div className="lm-chat-picker-error"><AlertCircle size={14}/>{employeeError}<button onClick={() => loadEmployees(employeeSearch)}>Retry</button></div> : <div className="lm-chat-people">{employees.filter(person => showCreate !== "ADD" || !active?.members.some(member => member.id === person.id)).map(person => <button key={person.id} className={selectedPeople.includes(person.id) ? "selected" : ""} onClick={() => setSelectedPeople(ids => showCreate === "DIRECT" ? [person.id] : ids.includes(person.id) ? ids.filter(id => id !== person.id) : [...ids, person.id])}><Avatar name={person.name} online={person.online} size={34}/><span><strong>{person.name}</strong><small>{person.designation}{person.department ? ` · ${person.department}` : ""}</small></span>{selectedPeople.includes(person.id) && <Check size={16}/>}</button>)}</div>}</label><footer><button className="lm-btn" onClick={() => setShowCreate(null)}>Cancel</button><button className="lm-btn lm-btn--primary" disabled={!selectedPeople.length || (showCreate === "GROUP" && !groupName.trim())} onClick={create}>{showCreate === "GROUP" ? "Create group" : showCreate === "ADD" ? "Add members" : "Open chat"}</button></footer></div></div>}
  </section>;
}
