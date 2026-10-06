"use client";

import React, { useState } from "react";
import { Archive, ExternalLink, GripVertical, Lightbulb, Plus, Trash2 } from "lucide-react";
import {
  CONTENT_TYPES,
  PILLARS,
  PILLAR_BY_ID,
  planApi,
  typeMeta,
  planError,
} from "./planningUtils";
import { confirmDialog, toast } from "../SocialFeedback";

const EMPTY = { title: "", description: "", post_type: "", pillar: "", reference_url: "", clientOnly: true };

/** Ideas waiting for a slot. Drag one onto a calendar day (new slot) or onto an existing slot (fills it). */
export default function IdeaBankPanel({ ideas, clientId, readOnly, dndType, onChange, onAddToPlan }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) return toast.warning("Give the idea a short title.");
    setSaving(true);
    try {
      await planApi.post("ideas/", {
        title: form.title.trim(),
        description: form.description,
        post_type: form.post_type,
        pillar: form.pillar,
        reference_url: form.reference_url,
        client_profile: form.clientOnly ? clientId : null,
      });
      setForm(EMPTY);
      setAdding(false);
      onChange();
    } catch (err) {
      planError(err, "Could not save the idea.");
    } finally {
      setSaving(false);
    }
  };

  const archive = async (idea) => {
    try {
      await planApi.patch(`ideas/${idea.id}/`, { status: "archived" });
      onChange();
    } catch (err) {
      planError(err);
    }
  };

  const remove = async (idea) => {
    const ok = await confirmDialog({ title: "Delete idea?", message: `"${idea.title}" will be removed from the idea bank.`, confirmLabel: "Delete", tone: "danger" });
    if (!ok) return;
    try {
      await planApi.del(`ideas/${idea.id}/`);
      onChange();
    } catch (err) {
      planError(err);
    }
  };

  return (
    <aside className="pl-ideas">
      <div className="pl-ideas-head">
        <h4>
          <Lightbulb size={15} /> Idea bank <span className="pl-count">{ideas.length}</span>
        </h4>
        <button type="button" className="pl-icon-btn" onClick={() => setAdding((v) => !v)} title="Add an idea">
          <Plus size={16} />
        </button>
      </div>

      {adding && (
        <div className="pl-idea-form">
          <input className="pl-input" placeholder="Idea title" value={form.title} autoFocus onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea
            className="pl-input"
            rows={2}
            placeholder="Details, hook, angle…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="pl-grid-2 tight">
            <select className="pl-input" value={form.post_type} onChange={(e) => setForm({ ...form, post_type: e.target.value })}>
              <option value="">Any format</option>
              {CONTENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <select className="pl-input" value={form.pillar} onChange={(e) => setForm({ ...form, pillar: e.target.value })}>
              <option value="">Any pillar</option>
              {PILLARS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <input
            className="pl-input"
            placeholder="Reference link (optional)"
            value={form.reference_url}
            onChange={(e) => setForm({ ...form, reference_url: e.target.value })}
          />
          <label className="pl-check">
            <input type="checkbox" checked={form.clientOnly} onChange={(e) => setForm({ ...form, clientOnly: e.target.checked })} /> Only for this client
          </label>
          <div className="pl-row-end">
            <button type="button" className="pl-btn pl-btn-ghost pl-btn-sm" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="button" className="pl-btn pl-btn-primary pl-btn-sm" onClick={save} disabled={saving}>
              Save idea
            </button>
          </div>
        </div>
      )}

      {ideas.length === 0 && !adding && <p className="pl-muted pl-small">No ideas yet. Anyone on the team can drop ideas here and pull them into the plan later.</p>}

      <div className="pl-idea-list">
        {ideas.map((idea) => {
          const meta = idea.post_type ? typeMeta(idea.post_type) : null;
          const pillar = PILLAR_BY_ID[idea.pillar];
          return (
            <div
              key={idea.id}
              className="pl-idea"
              draggable={!readOnly}
              onDragStart={(e) => {
                e.dataTransfer.setData(dndType, JSON.stringify({ kind: "idea", id: idea.id }));
                e.dataTransfer.effectAllowed = "copy";
              }}
              title={readOnly ? idea.title : "Drag onto a day or a slot"}
            >
              {!readOnly && <GripVertical size={14} className="pl-idea-grip" />}
              <div className="pl-idea-body">
                <strong>{idea.title}</strong>
                {idea.description && <p>{idea.description}</p>}
                <div className="pl-idea-meta">
                  {meta && (
                    <span style={{ color: meta.color }}>
                      <meta.icon size={11} /> {meta.label}
                    </span>
                  )}
                  {pillar && <span style={{ color: pillar.color }}>{pillar.label}</span>}
                  {!idea.client_profile && <span>All clients</span>}
                  {idea.submitted_by_name && <span>by {idea.submitted_by_name}</span>}
                  {idea.reference_url && (
                    <a href={idea.reference_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={11} /> ref
                    </a>
                  )}
                </div>
              </div>
              {!readOnly && (
                <div className="pl-idea-actions">
                  <button type="button" className="pl-icon-btn" onClick={() => onAddToPlan(idea)} title="Add to plan (no date yet)">
                    <Plus size={14} />
                  </button>
                  <button type="button" className="pl-icon-btn" onClick={() => archive(idea)} title="Archive">
                    <Archive size={14} />
                  </button>
                  <button type="button" className="pl-icon-btn" onClick={() => remove(idea)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
