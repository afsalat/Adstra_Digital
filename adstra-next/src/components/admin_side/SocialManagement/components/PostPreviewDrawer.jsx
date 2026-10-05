"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  ChevronUp,
  ChevronDown,
  Clock,
  AlertTriangle,
  Ban,
  FileText,
  Hash,
  Paperclip,
  Play,
  StickyNote,
  ListChecks,
  CheckCircle2,
  Circle,
  Link2,
  MessageSquare,
  History,
  RotateCcw,
} from "lucide-react";
import { renderPlatformIcon } from "./PlatformIcons";
import { STAGE_LABELS } from "./WorkflowDecisionModals";
import CommentThread from "./CommentThread";
import {
  FORMAT_META,
  PLATFORM_NAMES,
  STAGE_COLORS,
  relativeTime,
  shortDate,
  plural,
} from "./workflowUtils";

const isVideoUrl = (url, post) =>
  post.post_type === "reel" ||
  post.post_type === "video" ||
  (typeof url === "string" && /\.(mp4|webm|mov)(\?|$)/i.test(url));

const humanizeAction = (action = "") => {
  const a = action.trim();
  if (!a) return "Workflow update";
  if (a.toLowerCase() === "created") return "Post & script drafted";
  const text = a.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

function Section({ icon: Icon, title, children, extra }) {
  return (
    <section className="ppd-section">
      <div className="ppd-section-head">
        <span>
          <Icon size={14} /> {title}
        </span>
        {extra}
      </div>
      {children}
    </section>
  );
}

export default function PostPreviewDrawer({
  post,
  stageId,
  list = [],
  onSelect,
  onClose,
  onRefresh,
  onOpenTimeline,
  onPreviewMedia,
  renderActions,
  keyboardEnabled = true,
  tabRequest = null,
}) {
  const [tab, setTab] = useState("overview");
  const [commentCount, setCommentCount] = useState(post?.comment_count || 0);
  const bodyRef = useRef(null);

  useEffect(() => {
    setCommentCount(post?.comment_count || 0);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [post?.id]); // only when switching posts, not on every refresh

  // Callers can open the drawer on a given tab (e.g. Comments from a mention)
  useEffect(() => {
    if (tabRequest?.tab) setTab(tabRequest.tab);
  }, [tabRequest]);

  const index = post ? list.findIndex((p) => p.id === post.id) : -1;
  const prevPost = index > 0 ? list[index - 1] : null;
  const nextPost = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

  // Esc closes; ↑/↓ (or K/J) step through the list
  useEffect(() => {
    if (!post || !keyboardEnabled) return;
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || e.target?.isContentEditable) {
        if (e.key === "Escape") e.target.blur();
        return;
      }
      if (e.key === "Escape") onClose();
      else if ((e.key === "ArrowDown" || e.key === "j") && nextPost) {
        e.preventDefault();
        onSelect(nextPost.id);
      } else if ((e.key === "ArrowUp" || e.key === "k") && prevPost) {
        e.preventDefault();
        onSelect(prevPost.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [post, keyboardEnabled, nextPost, prevPost, onClose, onSelect]);

  const history = useMemo(() => {
    if (!post) return [];
    const source = Array.isArray(post.approval_history) ? post.approval_history : [];
    return [...source].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }, [post]);

  if (!post) return null;

  const stageTone = STAGE_COLORS[stageId] || STAGE_COLORS.scripts;
  const fmt = FORMAT_META[post.post_type];
  const FmtIcon = fmt?.icon || FileText;
  const media = (post.media_urls || []).filter(Boolean);
  const hashtags = (post.hashtags || "").split(/[\s,]+/).filter(Boolean);
  const platformCaptions = Object.entries(post.platform_captions || {}).filter(([, v]) => v && String(v).trim());
  const liveUrls = Object.entries(post.live_urls || {}).filter(([, v]) => v);
  const checklist = Array.isArray(post.checklist) ? post.checklist : [];

  const when = post.scheduled_at ? new Date(post.scheduled_at) : null;
  const isLive = ["published", "archived"].includes(post.status);
  const hoursLeft = when ? (when.getTime() - Date.now()) / 3600000 : null;
  const dateTone = !when || isLive ? "#475569" : hoursLeft < 0 ? "#dc2626" : hoursLeft <= 24 ? "#d97706" : "#0284c7";

  return (
    <aside className="ppd-drawer no-print" role="dialog" aria-label={`Preview: ${post.title || "Untitled Post"}`}>
      {/* Header */}
      <header className="ppd-header">
        <div className="ppd-header-top">
          <span className="ppd-stage-chip" style={{ color: stageTone.color, background: stageTone.bg }}>
            ● {STAGE_LABELS[post.status] || post.status}
          </span>
          <div className="ppd-header-nav">
            {list.length > 1 && index >= 0 && (
              <>
                <button type="button" className="ppd-icon-btn" disabled={!prevPost} onClick={() => prevPost && onSelect(prevPost.id)} title="Previous (↑ or K)">
                  <ChevronUp size={16} />
                </button>
                <span className="ppd-counter">
                  {index + 1} / {list.length}
                </span>
                <button type="button" className="ppd-icon-btn" disabled={!nextPost} onClick={() => nextPost && onSelect(nextPost.id)} title="Next (↓ or J)">
                  <ChevronDown size={16} />
                </button>
              </>
            )}
            <button type="button" className="ppd-icon-btn" onClick={onClose} title="Close (Esc)">
              <X size={17} />
            </button>
          </div>
        </div>

        <h3 className="ppd-title">{post.title || "Untitled Post"}</h3>

        <div className="ppd-meta">
          <span className="ppd-client" style={{ color: post.client_primary_color || "#4338ca" }}>
            {post.client_name || "Adstra Client"}
          </span>
          <span className="ppd-format" style={{ color: fmt?.color || "#475569", background: fmt?.bg || "#f1f5f9" }}>
            <FmtIcon size={12} /> {fmt?.label || post.post_type || "Post"}
          </span>
          <span className="ppd-platforms">
            {(post.platforms || []).map((plat) => (
              <span key={plat} title={PLATFORM_NAMES[plat] || plat}>
                {renderPlatformIcon(plat, { size: 14 })}
              </span>
            ))}
          </span>
        </div>

        <div className="ppd-facts">
          <div>
            <span className="ppd-fact-label">{isLive ? "Published" : "Post date"}</span>
            {isLive && post.published_at ? (
              <span className="ppd-fact-value" style={{ color: "#047857" }}>
                <CheckCircle2 size={13} /> {shortDate(new Date(post.published_at), true)}
              </span>
            ) : when ? (
              <span className="ppd-fact-value" style={{ color: dateTone }} title={when.toLocaleString()}>
                <Clock size={13} /> {shortDate(when, true)} · {hoursLeft < 0 ? `overdue ${relativeTime(when).replace(" ago", "")}` : relativeTime(when)}
              </span>
            ) : (
              <span className="ppd-fact-value" style={{ color: "#94a3b8" }}>Not set</span>
            )}
          </div>
          <div>
            <span className="ppd-fact-label">Created</span>
            <span className="ppd-fact-value">{post.created_at ? shortDate(new Date(post.created_at)) : "—"}</span>
          </div>
          <div>
            <span className="ppd-fact-label">Revisions</span>
            <span className="ppd-fact-value" style={{ color: (post.revision_count || 0) >= 3 ? "#b91c1c" : undefined }}>
              {post.revision_count ? (
                <>
                  <RotateCcw size={12} /> {plural(post.revision_count, "round")}
                </>
              ) : (
                "None"
              )}
            </span>
          </div>
        </div>

        <nav className="ppd-tabs">
          {[
            { id: "overview", label: "Overview", icon: FileText },
            { id: "timeline", label: "Timeline", icon: History, count: history.length },
            { id: "comments", label: "Comments", icon: MessageSquare, count: commentCount },
          ].map((t) => {
            const TabIcon = t.icon;
            return (
              <button key={t.id} type="button" className={`ppd-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                <TabIcon size={14} /> {t.label}
                {t.count > 0 && <span className="ppd-tab-count">{t.count}</span>}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Body */}
      <div className="ppd-body" ref={bodyRef}>
        {tab === "overview" && (
          <>
            {post.status === "content_rejected" && (
              <div className="ppd-alert ppd-alert-red">
                <Ban size={15} />
                <div>
                  <strong>
                    Rejected by {post.rejected_by === "internal" ? "internal team" : "client"}
                    {post.rejected_from_stage ? ` at ${STAGE_LABELS[post.rejected_from_stage] || post.rejected_from_stage}` : ""}
                  </strong>
                  <p>{post.rejection_reason || "No reason recorded."}</p>
                </div>
              </div>
            )}

            {post.client_feedback && post.status !== "content_rejected" && (
              <div className="ppd-alert ppd-alert-amber">
                <AlertTriangle size={15} />
                <div>
                  <strong>
                    {(post.last_revision_categories || []).length ? post.last_revision_categories.join(", ") : "Feedback to address"}
                  </strong>
                  <p>{post.client_feedback}</p>
                </div>
              </div>
            )}

            <Section icon={Paperclip} title={`Assets${media.length ? ` (${media.length})` : ""}`}>
              {media.length ? (
                <div className="ppd-media-grid">
                  {media.map((url, i) => (
                    <button key={`${url}-${i}`} type="button" className="ppd-media" onClick={() => onPreviewMedia && onPreviewMedia(post)} title="Open full preview">
                      {isVideoUrl(url, post) ? (
                        <>
                          <video src={url} muted preload="metadata" />
                          <span className="ppd-media-play">
                            <Play size={16} fill="#ffffff" color="#ffffff" />
                          </span>
                        </>
                      ) : (
                        <img src={url} alt="" loading="lazy" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="ppd-empty">No assets uploaded yet.</p>
              )}
            </Section>

            <Section icon={FileText} title="Script">
              {post.script_notes ? <div className="ppd-text">{post.script_notes}</div> : <p className="ppd-empty">No script written yet.</p>}
            </Section>

            <Section icon={MessageSquare} title="Caption">
              {post.primary_caption ? <div className="ppd-text">{post.primary_caption}</div> : <p className="ppd-empty">No caption yet.</p>}
              {hashtags.length > 0 && (
                <div className="ppd-hashtags">
                  <Hash size={13} />
                  {hashtags.map((h) => (
                    <span key={h}>{h.startsWith("#") ? h : `#${h}`}</span>
                  ))}
                </div>
              )}
              {platformCaptions.map(([plat, text]) => (
                <div key={plat} className="ppd-platform-caption">
                  <span className="ppd-platform-caption-head">
                    {renderPlatformIcon(plat, { size: 13 })} {PLATFORM_NAMES[plat] || plat}
                  </span>
                  <div className="ppd-text">{text}</div>
                </div>
              ))}
              {post.first_comment && (
                <div className="ppd-platform-caption">
                  <span className="ppd-platform-caption-head">First comment</span>
                  <div className="ppd-text">{post.first_comment}</div>
                </div>
              )}
            </Section>

            {post.designer_notes && (
              <Section icon={StickyNote} title="Designer notes">
                <div className="ppd-text">{post.designer_notes}</div>
              </Section>
            )}

            {checklist.length > 0 && (
              <Section icon={ListChecks} title={`Checklist (${checklist.filter((c) => c.done).length}/${checklist.length})`}>
                <ul className="ppd-checklist">
                  {checklist.map((c, i) => (
                    <li key={`${c.task}-${i}`} className={c.done ? "done" : ""}>
                      {c.done ? <CheckCircle2 size={14} color="#059669" /> : <Circle size={14} color="#94a3b8" />}
                      {c.task}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {liveUrls.length > 0 && (
              <Section icon={Link2} title="Live links">
                <ul className="ppd-links">
                  {liveUrls.map(([plat, url]) => (
                    <li key={plat}>
                      {renderPlatformIcon(plat, { size: 13 })}
                      <a href={url} target="_blank" rel="noreferrer">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </>
        )}

        {tab === "timeline" && (
          <>
            <div className="ppd-timeline-head">
              <span>{plural(history.length, "event")}, newest first</span>
              {onOpenTimeline && (
                <button type="button" className="ppd-link-btn" onClick={() => onOpenTimeline(post)}>
                  <History size={13} /> Open full timeline
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="ppd-empty">No activity recorded yet.</p>
            ) : (
              <ol className="ppd-timeline">
                {history.map((h, i) => (
                  <li key={h.id || `${h.timestamp}-${i}`}>
                    <span className="ppd-tl-dot" />
                    <div>
                      <div className="ppd-tl-title">{humanizeAction(h.action)}</div>
                      <div className="ppd-tl-meta">
                        {h.actor_name || "Team"}
                        {h.actor_role ? ` · ${h.actor_role}` : ""}
                        {h.timestamp ? ` · ${relativeTime(new Date(h.timestamp))}` : ""}
                      </div>
                      {h.notes && <div className="ppd-tl-notes">{h.notes}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        {tab === "comments" && <CommentThread post={post} onCountChange={setCommentCount} onRefresh={onRefresh} />}
      </div>

      {/* Stage actions */}
      {renderActions && <footer className="ppd-footer">{renderActions(post, stageId)}</footer>}
    </aside>
  );
}
