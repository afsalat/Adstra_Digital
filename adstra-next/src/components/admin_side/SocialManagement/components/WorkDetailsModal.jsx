"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  History,
  Check,
  Copy,
  Save,
  Edit3,
  Upload,
  Trash2,
  RotateCcw,
  Download,
  ExternalLink,
  Folder,
  Maximize2,
  CornerDownRight,
  Film,
  Layers,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import { askConfirm, toast, apiErrorMessage } from "./SocialFeedback";
import { getFeedbackEvents, STAGE_LABELS } from "./WorkflowDecisionModals";

/* ───────────── helpers ───────────── */

const FORMAT_META = {
  video: { label: "Reel / Video", icon: Film },
  carousel: { label: "Carousel", icon: Layers },
  poster: { label: "Graphic / Poster", icon: ImageIcon },
};

const RATIOS = [
  { name: "9:16", value: 9 / 16 },
  { name: "4:5", value: 4 / 5 },
  { name: "1:1", value: 1 },
  { name: "16:9", value: 16 / 9 },
  { name: "1.91:1", value: 1.91 },
];
const EXPECTED_RATIOS = { video: ["9:16"], carousel: ["4:5", "1:1"], poster: ["1:1", "4:5"] };

const closestRatio = (w, h) => {
  if (!w || !h) return null;
  const r = w / h;
  const best = RATIOS.reduce((a, b) => (Math.abs(b.value - r) < Math.abs(a.value - r) ? b : a));
  return Math.abs(best.value - r) / best.value < 0.03 ? best.name : `${r.toFixed(2)}:1`;
};

const isVideoAsset = (url, postType) => {
  if (!url) return false;
  const lower = url.toLowerCase().split("?")[0];
  if (/\.(png|jpe?g|webp|gif)$/.test(lower)) return false;
  return /\.(mp4|webm|mov|m4v)$/.test(lower) || lower.includes("video") || lower.startsWith("blob:") || ["reel", "video"].includes(postType);
};

const isImageAsset = (url) => !!url && (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || /image/i.test(url));

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

const relativeDue = (iso) => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  const h = Math.round(Math.abs(diff) / 3600000);
  const span = h >= 24 ? `${Math.round(h / 24)}d` : `${h}h`;
  if (diff < 0) return { text: `overdue ${span}`, late: true };
  return { text: `in ${span}`, late: false };
};

function CopyText({ text, label }) {
  const [done, setDone] = useState(false);
  if (!text) return null;
  return (
    <button
      type="button"
      className="wd-btn ghost sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />} {done ? "Copied" : label}
    </button>
  );
}

function Row({ label, children }) {
  if (children === null || children === undefined || children === "" || children === false) return null;
  return (
    <div className="wd-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* ───────────── component ───────────── */

export default function WorkDetailsModal({
  isOpen,
  onClose,
  post,
  onReadyForQA,
  onSaveMedia,
  onOpenTimeline,
  onOpenEditModal,
  isReadOnly = false,
}) {
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [cloudUrl, setCloudUrl] = useState("");
  const [designerNotes, setDesignerNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingQA, setIsSubmittingQA] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("brief");
  const [lightbox, setLightbox] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (post) {
      setMediaUrl(post.media_urls?.[0] || "");
      setDesignerNotes(post.designer_notes || "");
      setCloudUrl("");
    }
  }, [post]);

  useEffect(() => setMediaInfo(null), [mediaUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (lightbox) setLightbox(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, lightbox]);

  const feedbackEvents = useMemo(() => getFeedbackEvents(post), [post]);

  if (!isOpen || !post) return null;

  const scriptData = post.script_data || {};
  const forDesigners = scriptData.for_designers || {};
  const forPosting = scriptData.for_posting || {};

  const format =
    scriptData.format ||
    (post.post_type === "carousel" ? "carousel" : post.post_type === "reel" || post.post_type === "video" ? "video" : "poster");
  const formatMeta = FORMAT_META[format] || FORMAT_META.poster;

  const videoType = scriptData.video_type || "clips";
  const headline = forDesigners.headline || post.title || "";
  const sub = forDesigners.sub || "";
  const visualContentText = forDesigners.visual_content_text || "";
  const cta = forDesigners.cta || "";
  const logoAssets = forDesigners.logo_assets || "";
  const contactDetails = forDesigners.contact_details || "";
  const duration = forDesigners.duration || "30s";
  const musicReference = forDesigners.music_reference || "";
  const clips = forDesigners.clips || "";
  const scenes = Array.isArray(forDesigners.scenes) ? forDesigners.scenes : [];
  const slides = Array.isArray(forDesigners.slides) ? forDesigners.slides : [];
  const attachedAssets = Array.isArray(forDesigners.selected_assets)
    ? forDesigners.selected_assets
    : Array.isArray(post.media_assets)
    ? post.media_assets
    : [];

  const postTitle = forPosting.title || post.title || "Untitled Project";
  const postCaption = forPosting.description || post.primary_caption || "";
  const postLocation = forPosting.location || post.location || "";
  const postHashtags = forPosting.hashtag || post.hashtags || "";
  const platforms = (post.platforms || []).length ? post.platforms : ["instagram"];

  const recommendedAspect =
    format === "video" ? "9:16 · 1080×1920" : format === "carousel" ? "4:5 · 1080×1350, or 1:1" : "1:1 · 1080×1080, or 4:5";
  const executionStyle =
    videoType === "ai" ? "AI video generation" : videoType === "motion" ? "Motion graphics" : "Client footage / on-camera";

  const due = relativeDue(post.scheduled_at);
  const actualRatio = mediaInfo ? closestRatio(mediaInfo.width, mediaInfo.height) : null;
  const ratioOk = actualRatio && (EXPECTED_RATIOS[format] || []).includes(actualRatio);
  const isSavedMedia = mediaUrl && mediaUrl === post.media_urls?.[0];
  const mediaIsVideo = isVideoAsset(mediaUrl, post.post_type);
  const canPreviewImage = mediaUrl && !mediaIsVideo && (isImageAsset(mediaUrl) || mediaUrl.startsWith("http"));
  const storyCount = format === "video" ? scenes.length : format === "carousel" ? slides.length : 0;

  /* ── actions ── */

  const handleCopyWorkBrief = () => {
    let brief = `DESIGNER WORK BRIEF\n\nProject: ${postTitle}\nClient: ${post.client_name || "Client"}\n`;
    brief += `Format: ${formatMeta.label}${format === "video" ? ` (${duration})` : ""}\nRatio: ${recommendedAspect}\n`;
    if (post.scheduled_at) brief += `Target: ${new Date(post.scheduled_at).toLocaleString()}\n`;
    brief += `Platforms: ${platforms.join(", ")}\n\n`;
    if (post.client_feedback) brief += `REVISION NOTES:\n${post.client_feedback}\n\n`;
    if (headline) brief += `Headline: ${headline}\n`;
    if (sub) brief += `Sub-headline: ${sub}\n`;
    if (cta) brief += `CTA: ${cta}\n`;
    if (logoAssets) brief += `Logo: ${logoAssets}\n`;
    if (contactDetails) brief += `Contact: ${contactDetails}\n`;
    if (designerNotes) brief += `Designer notes: ${designerNotes}\n`;
    brief += `\n`;
    if (format === "video") {
      brief += `Audio: ${musicReference || "Trending audio"}\nStyle: ${executionStyle}\n${clips ? `Footage: ${clips}\n` : ""}\n`;
      if (scenes.length) scenes.forEach((s, i) => (brief += `Scene ${i + 1} (${s.duration || "0-5s"})\n  Visual: ${s.visual_text || "—"}\n  Text: ${s.content_text || "—"}\n`));
      else if (post.script_notes) brief += `${post.script_notes}\n`;
    } else if (format === "carousel") {
      if (slides.length) slides.forEach((s, i) => (brief += `Slide ${i + 1}: ${s.headline || ""}\n  Visual: ${s.visual_text || "—"}\n  Copy: ${s.content_text || "—"}\n`));
      else if (post.script_notes) brief += `${post.script_notes}\n`;
    } else {
      if (visualContentText) brief += `Visual direction: ${visualContentText}\n`;
      if (post.script_notes) brief += `${post.script_notes}\n`;
    }
    if (postCaption) brief += `\nCAPTION\n${postCaption}\n${postHashtags}\n`;
    navigator.clipboard.writeText(brief);
    setCopiedBrief(true);
    toast.success("Work brief copied to clipboard.");
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const uploadFile = async (file) => {
    if (!file || isReadOnly) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadPct(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("replace", "true");
    try {
      const res = await axios.post(`${API_BASE_URL}/social/posts/${post.id}/upload_media/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) => ev.total && setUploadPct(Math.round((ev.loaded / ev.total) * 100)),
      });
      if (res.data?.file_url) {
        setCloudUrl("");
        setMediaUrl(res.data.file_url);
        post.media_urls = [res.data.file_url];
      }
      toast.success(`${file.name} · ${(file.size / 1048576).toFixed(1)} MB · original quality`, { title: "Uploaded" });
    } catch (err) {
      setUploadError(apiErrorMessage(err, "Failed to upload file."));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveOnly = async () => {
    if (!onSaveMedia) return;
    setIsSaving(true);
    try {
      await onSaveMedia(post, mediaUrl.trim(), designerNotes.trim());
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAttachedMedia = async () => {
    if (!(await askConfirm("Remove this media from the post? Save or submit to apply."))) return;
    setMediaUrl("");
    setCloudUrl("");
    post.media_urls = [];
  };

  const handleReadyQA = async () => {
    if (!onReadyForQA) return;
    if (!mediaUrl.trim()) {
      toast.warning("Attach the final creative before sending it to Team QA.");
      return;
    }
    setIsSubmittingQA(true);
    try {
      await onReadyForQA(post, mediaUrl.trim(), designerNotes.trim());
      onClose();
    } finally {
      setIsSubmittingQA(false);
    }
  };

  const handleDownload = () => {
    if (!mediaUrl) return;
    if (!isSavedMedia) return window.open(mediaUrl, "_blank", "noopener");
    const a = document.createElement("a");
    a.href = `${API_BASE_URL}/social/posts/${post.id}/download_media/?index=0`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const tabs = [
    { id: "brief", label: "Brief" },
    { id: "story", label: format === "video" ? "Storyboard" : format === "carousel" ? "Slides" : "Artwork", count: storyCount },
    { id: "caption", label: "Caption" },
    { id: "feedback", label: "Feedback", count: feedbackEvents.length },
  ];

  const onTabKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = tabs.findIndex((t) => t.id === activeTab);
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setActiveTab(tabs[next].id);
  };

  /* ── render ── */

  return (
    <div className="wd-overlay" onClick={onClose}>
      <style>{CSS}</style>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => uploadFile(e.target.files?.[0])}
        accept="video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
      />

      <div className="wd-dialog" role="dialog" aria-modal="true" aria-label={postTitle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="wd-header">
          <div style={{ minWidth: 0 }}>
            <div className="wd-crumbs">
              <span>{post.client_name || "Client"}</span>
              <span className="sep">/</span>
              <span>Post #{post.id}</span>
            </div>
            <h2 className="wd-title">{postTitle}</h2>
            {headline && headline !== postTitle && <p className="wd-hook">{headline}</p>}
            <div className="wd-meta">
              <span>
                <span className="wd-dot" /> {STAGE_LABELS[post.status] || post.status}
              </span>
              <span>
                {formatMeta.label}
                {format === "video" ? ` · ${duration}` : ""}
              </span>
              {post.scheduled_at && (
                <span title={new Date(post.scheduled_at).toLocaleString()}>
                  Due {fmtDate(post.scheduled_at)} <span className={due?.late ? "late" : "muted"}>({due?.text})</span>
                </span>
              )}
              {(post.revision_count || 0) > 0 && (
                <span>
                  Round {post.revision_count}
                  {post.client_revision_count ? <span className="muted"> · {post.client_revision_count} from client</span> : null}
                </span>
              )}
            </div>
          </div>
          <div className="wd-header-actions">
            <button type="button" className="wd-btn ghost" onClick={handleCopyWorkBrief}>
              {copiedBrief ? <Check size={15} /> : <Copy size={15} />}
              {copiedBrief ? "Copied" : "Copy brief"}
            </button>
            <button type="button" className="wd-icon" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="wd-layout">
          {/* LEFT — deliverable */}
          <aside className="wd-left">
            <div className="wd-section-head">
              <span>Deliverable</span>
              <span className="muted">{mediaUrl ? "Attached" : "Awaiting upload"}</span>
            </div>

            <section
              className={`wd-media ${dragOver ? "drag" : ""} ${mediaUrl ? "" : "empty"}`}
              onDragOver={(e) => {
                if (isReadOnly) return;
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                if (isReadOnly) return;
                e.preventDefault();
                setDragOver(false);
                uploadFile(e.dataTransfer.files?.[0]);
              }}
            >
              <div className="wd-media-frame" onClick={() => (mediaUrl ? canPreviewImage && setLightbox(true) : !isReadOnly && fileInputRef.current?.click())}>
                {mediaUrl ? (
                  mediaIsVideo ? (
                    <video key={mediaUrl} src={mediaUrl} controls playsInline onLoadedMetadata={(e) => setMediaInfo({ width: e.currentTarget.videoWidth, height: e.currentTarget.videoHeight })} />
                  ) : canPreviewImage ? (
                    <img key={mediaUrl} src={mediaUrl} alt="Deliverable" onLoad={(e) => setMediaInfo({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} />
                  ) : (
                    <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="wd-media-link" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={15} /> {mediaUrl}
                    </a>
                  )
                ) : (
                  <div className="wd-drop">
                    <Upload size={20} strokeWidth={1.6} />
                    <strong>{isReadOnly ? "No deliverable yet" : "Drop the final file here"}</strong>
                    {!isReadOnly && <span>or click to browse · MP4, MOV, PNG, JPG, WEBP · kept at original quality</span>}
                  </div>
                )}

                {canPreviewImage && (
                  <span className="wd-expand">
                    <Maximize2 size={14} />
                  </span>
                )}
                {dragOver && <div className="wd-drop-veil">Drop to {mediaUrl ? "replace" : "upload"}</div>}
                {isUploading && (
                  <div className="wd-progress-veil">
                    <div className="wd-progress">
                      <div style={{ width: `${uploadPct}%` }} />
                    </div>
                    <span>Uploading · {uploadPct}%</span>
                  </div>
                )}
              </div>

              {(mediaUrl || uploadError) && (
                <div className="wd-media-bar">
                  <div className="wd-media-meta">
                    {mediaInfo?.width > 0 && (
                      <>
                        <span>
                          {mediaInfo.width} × {mediaInfo.height}
                        </span>
                        <span className={ratioOk ? "ok" : "warn"}>
                          {actualRatio} {ratioOk ? "✓" : `· brief: ${EXPECTED_RATIOS[format].join(" or ")}`}
                        </span>
                      </>
                    )}
                    {uploadError && <span className="warn">{uploadError}</span>}
                  </div>
                  {mediaUrl && (
                    <div className="wd-media-actions">
                      {!isReadOnly && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} title="Replace file">
                          <RotateCcw size={14} />
                        </button>
                      )}
                      <button type="button" onClick={handleDownload} title="Download original — no quality loss">
                        <Download size={14} />
                      </button>
                      <a href={mediaUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab">
                        <ExternalLink size={14} />
                      </a>
                      <button type="button" onClick={() => { navigator.clipboard.writeText(mediaUrl); toast.success("Link copied."); }} title="Copy link">
                        <Copy size={14} />
                      </button>
                      {!isReadOnly && (
                        <button type="button" onClick={handleRemoveAttachedMedia} title="Remove" className="danger">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {!isReadOnly && (
              <label className="wd-field">
                <span>Or paste a cloud link</span>
                <input
                  value={cloudUrl}
                  onChange={(e) => {
                    setCloudUrl(e.target.value);
                    setMediaUrl(e.target.value.trim() || post.media_urls?.[0] || "");
                  }}
                  placeholder="Drive, Canva or Figma URL"
                />
              </label>
            )}

            <label className="wd-field">
              <span>Notes for QA</span>
              {isReadOnly ? (
                <p className="wd-prose">{designerNotes || <span className="muted">No notes.</span>}</p>
              ) : (
                <textarea rows={4} value={designerNotes} onChange={(e) => setDesignerNotes(e.target.value)} placeholder="Render settings, fonts used, anything QA should know…" />
              )}
            </label>
          </aside>

          {/* RIGHT — tabs */}
          <main className="wd-right">
            {post.client_feedback && (
              <div className="wd-callout">
                <div className="wd-callout-head">
                  <span className="wd-dot amber" />
                  Changes requested{post.revision_count ? ` · round ${post.revision_count}` : ""}
                  {(post.last_revision_categories || []).length > 0 && <span className="muted"> — {post.last_revision_categories.join(", ")}</span>}
                </div>
                <p>{post.client_feedback}</p>
                {feedbackEvents.length > 1 && (
                  <button type="button" className="wd-text-btn" onClick={() => setActiveTab("feedback")}>
                    View all {feedbackEvents.length} feedback notes
                  </button>
                )}
              </div>
            )}

            <nav className="wd-tabs" role="tablist" onKeyDown={onTabKey}>
              {tabs.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={activeTab === t.id} tabIndex={activeTab === t.id ? 0 : -1} className={activeTab === t.id ? "active" : ""} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                  {t.count > 0 && <span>{t.count}</span>}
                </button>
              ))}
            </nav>

            <div className="wd-panel" key={activeTab}>
              {activeTab === "brief" && (
                <>
                  <dl className="wd-list">
                    <Row label="Size">{recommendedAspect}</Row>
                    <Row label="Platforms">
                      <span style={{ textTransform: "capitalize" }}>{platforms.join(", ")}</span>
                    </Row>
                    {format === "video" && <Row label="Duration">{duration}</Row>}
                    <Row label="Headline">{headline}</Row>
                    <Row label="Sub-headline">{sub}</Row>
                    <Row label="Call to action">{cta}</Row>
                    <Row label="Logo / watermark">{logoAssets}</Row>
                    <Row label="Contact / handle">{contactDetails}</Row>
                    {format === "video" && <Row label="Audio">{musicReference || "Trending audio"}</Row>}
                    {format === "video" && <Row label="Execution">{executionStyle}</Row>}
                    {format === "video" && <Row label="Footage">{clips}</Row>}
                    {format === "poster" && <Row label="Visual direction">{visualContentText}</Row>}
                  </dl>
                  {attachedAssets.length > 0 && (
                    <div className="wd-block">
                      <h4>References · {attachedAssets.length}</h4>
                      <div className="wd-assets">
                        {attachedAssets.map((asset, idx) => {
                          const title = asset.title || (typeof asset === "string" ? asset : `Asset ${idx + 1}`);
                          const url = asset.url || asset.file_url || asset.file || "";
                          const thumb = url && !isVideoAsset(url) && (isImageAsset(url) || url.startsWith("http"));
                          return (
                            <a key={idx} href={url || "#"} target="_blank" rel="noopener noreferrer" title={title}>
                              <div>{thumb ? <img src={url} alt="" /> : <Folder size={18} strokeWidth={1.6} />}</div>
                              <span>{title}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {format === "poster" && post.script_notes && (
                    <div className="wd-block">
                      <h4>Script notes</h4>
                      <p className="wd-prose">{post.script_notes}</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "story" && format === "video" && (
                scenes.length ? (
                  <ol className="wd-steps">
                    {scenes.map((s, i) => (
                      <li key={i}>
                        <div className="wd-step-index">{String(i + 1).padStart(2, "0")}</div>
                        <div className="wd-step-body">
                          <div className="wd-step-head">
                            <strong>Scene {i + 1}</strong>
                            <span>{s.duration || "0-5s"}</span>
                          </div>
                          <p>{s.visual_text || "No visual direction"}</p>
                          {s.content_text && (
                            <p className="quote">
                              <CornerDownRight size={13} /> “{s.content_text}”
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="wd-prose">{post.script_notes || "No scene breakdown recorded."}</p>
                )
              )}

              {activeTab === "story" && format === "carousel" && (
                slides.length ? (
                  <ol className="wd-steps">
                    {slides.map((s, i) => (
                      <li key={i}>
                        <div className="wd-step-index">{String(i + 1).padStart(2, "0")}</div>
                        <div className="wd-step-body">
                          <div className="wd-step-head">
                            <strong>{s.headline || `Slide ${i + 1}`}</strong>
                          </div>
                          <p>{s.visual_text || "No visual direction"}</p>
                          {s.content_text && (
                            <p className="quote">
                              <CornerDownRight size={13} /> {s.content_text}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="wd-prose">{post.script_notes || "No slide breakdown recorded."}</p>
                )
              )}

              {activeTab === "story" && format === "poster" && (
                <div className="wd-artwork">
                  <span>Layout preview</span>
                  <h3>{headline || postTitle}</h3>
                  {sub && <p>{sub}</p>}
                  {cta && <em>{cta}</em>}
                </div>
              )}

              {activeTab === "caption" && (
                <div className="wd-caption">
                  <div className="wd-feed">
                    <div className="wd-feed-head">
                      <span className="wd-avatar">{(post.client_name || "C").charAt(0)}</span>
                      <div>
                        <strong>{(post.client_name || "client").toLowerCase().replace(/\s+/g, "")}</strong>
                        {postLocation && <small>{postLocation}</small>}
                      </div>
                    </div>
                    <div className="wd-feed-media">
                      {canPreviewImage ? <img src={mediaUrl} alt="" /> : mediaUrl && mediaIsVideo ? <video src={mediaUrl} muted playsInline /> : <ImageIcon size={26} strokeWidth={1.4} />}
                    </div>
                    <div className="wd-feed-icons">
                      <Heart size={18} strokeWidth={1.6} />
                      <MessageCircle size={18} strokeWidth={1.6} />
                      <Send size={18} strokeWidth={1.6} />
                      <Bookmark size={18} strokeWidth={1.6} style={{ marginLeft: "auto" }} />
                    </div>
                    <p className="wd-feed-caption">
                      <strong>{(post.client_name || "client").toLowerCase().replace(/\s+/g, "")}</strong> {postCaption || <span className="muted">No caption written yet.</span>}
                      {postHashtags && <span className="wd-feed-tags">{postHashtags}</span>}
                    </p>
                  </div>
                  <div className="wd-caption-actions">
                    <CopyText text={postCaption} label="Copy caption" />
                    <CopyText text={postHashtags} label="Copy hashtags" />
                    <span className={postCaption.length > 2200 ? "warn" : "muted"} style={{ marginLeft: "auto" }}>
                      {postCaption.length} / 2200
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "feedback" && (
                feedbackEvents.length === 0 ? (
                  <p className="wd-empty-text">No feedback yet — first round.</p>
                ) : (
                  <ul className="wd-comments">
                    {feedbackEvents.map((ev, i) => (
                      <li key={ev.id || i}>
                        <span className="wd-avatar">{(ev.actor_name || "?").charAt(0).toUpperCase()}</span>
                        <div>
                          <div className="wd-comment-head">
                            <strong>{ev.actor_name}</strong>
                            <span>{ev.action}</span>
                            <time>{fmtDate(ev.timestamp)}</time>
                          </div>
                          {((ev.reason_categories || []).length > 0 || ev.revision_round > 0) && (
                            <div className="wd-comment-tags">
                              {ev.revision_round > 0 && <span>Round {ev.revision_round}</span>}
                              {(ev.reason_categories || []).map((c) => (
                                <span key={c}>{c}</span>
                              ))}
                            </div>
                          )}
                          <p>{ev.notes}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="wd-footer">
          <div className="wd-footer-left">
            {onOpenTimeline && (
              <button type="button" className="wd-btn ghost" onClick={() => { onClose(); onOpenTimeline(post); }}>
                <History size={15} /> Timeline
              </button>
            )}
            {!isReadOnly && onOpenEditModal && (
              <button type="button" className="wd-btn ghost" onClick={() => { onClose(); onOpenEditModal(post); }}>
                <Edit3 size={15} /> Edit details
              </button>
            )}
          </div>
          <div className="wd-footer-right">
            <button type="button" className="wd-btn" onClick={onClose}>
              Close
            </button>
            {!isReadOnly && onSaveMedia && (
              <button type="button" className="wd-btn" disabled={isSaving || isSubmittingQA} onClick={handleSaveOnly}>
                <Save size={15} /> {isSaving ? "Saving…" : "Save"}
              </button>
            )}
            {!isReadOnly && onReadyForQA && (
              <button type="button" className="wd-btn primary" disabled={isSubmittingQA || isSaving || isUploading} onClick={handleReadyQA}>
                {isSubmittingQA ? "Submitting…" : "Ready for QA"}
              </button>
            )}
          </div>
        </footer>
      </div>

      {lightbox && canPreviewImage && (
        <div className="wd-lightbox" onClick={(e) => { e.stopPropagation(); setLightbox(false); }}>
          <img src={mediaUrl} alt="" />
          <span>Esc to close · shown at original resolution</span>
        </div>
      )}
    </div>
  );
}

/* ───────────── styles: neutral, single accent ───────────── */

const CSS = `
.wd-overlay { --ink: #111827; --ink-2: #4b5563; --ink-3: #9ca3af; --line: #e5e7eb; --line-2: #f3f4f6; --soft: #f9fafb; --accent: #4f46e5;
  position: fixed; inset: 0; z-index: 9999; background: rgba(17,24,39,0.45); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: wdF .12s ease; }
@keyframes wdF { from { opacity: 0 } to { opacity: 1 } }
@keyframes wdU { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
.wd-dialog { width: 100%; max-width: 1080px; height: min(860px, 92vh); background: #fff; border-radius: 14px; border: 1px solid var(--line); box-shadow: 0 24px 64px -16px rgba(17,24,39,0.35); display: flex; flex-direction: column; overflow: hidden; animation: wdU .18s cubic-bezier(.2,.8,.2,1); color: var(--ink); }
.wd-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 20px 24px 16px; border-bottom: 1px solid var(--line); }
.wd-crumbs { display: flex; gap: 6px; font-size: 12.5px; color: var(--ink-3); margin-bottom: 6px; }
.wd-crumbs .sep { color: #d1d5db; }
.wd-title { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; line-height: 1.3; }
.wd-hook { margin: 4px 0 0; font-size: 14px; color: var(--ink-2); }
.wd-header-actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }
.wd-btn { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--line); background: #fff; color: var(--ink); font-size: 13.5px; font-weight: 500; cursor: pointer; transition: background .12s, border-color .12s; white-space: nowrap; }
.wd-btn:hover:not(:disabled) { background: var(--soft); border-color: #d1d5db; }
.wd-btn:disabled { opacity: .5; cursor: not-allowed; }
.wd-btn.ghost { border-color: transparent; color: var(--ink-2); }
.wd-btn.ghost:hover:not(:disabled) { background: var(--line-2); color: var(--ink); }
.wd-btn.primary { background: var(--ink); border-color: var(--ink); color: #fff; padding: 0 18px; }
.wd-btn.primary:hover:not(:disabled) { background: #1f2937; }
.wd-icon { width: 34px; height: 34px; border-radius: 8px; border: none; background: transparent; color: var(--ink-3); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.wd-icon:hover { background: var(--line-2); color: var(--ink); }
.wd-layout { flex: 1; min-height: 0; display: grid; grid-template-columns: 400px minmax(0, 1fr); }
.wd-left { border-right: 1px solid var(--line); background: var(--soft); padding: 18px 20px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.wd-right { overflow-y: auto; padding: 18px 24px 28px; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.wd-section-head { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; }
.wd-meta { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 10px; font-size: 13px; color: var(--ink-2); }
.wd-meta > span { display: inline-flex; align-items: center; gap: 6px; }
.wd-media { background: #fff; }
.wd-btn.sm { height: 30px; padding: 0 10px; font-size: 13px; }
.wd-feed { max-width: 360px; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: #fff; }
.wd-feed-head { display: flex; gap: 10px; align-items: center; padding: 10px 12px; font-size: 13px; }
.wd-feed-head small { display: block; color: var(--ink-3); font-size: 12px; }
.wd-feed-media { aspect-ratio: 4 / 5; background: #f4f4f5; display: flex; align-items: center; justify-content: center; color: var(--ink-3); }
.wd-feed-media img, .wd-feed-media video { width: 100%; height: 100%; object-fit: cover; }
.wd-feed-icons { display: flex; gap: 14px; padding: 10px 12px 2px; color: var(--ink); }
.wd-feed-caption { margin: 0; padding: 6px 12px 14px; font-size: 13.5px; line-height: 1.55; white-space: pre-wrap; }
.wd-feed-caption strong { font-weight: 600; }
.wd-feed-tags { display: block; margin-top: 4px; color: var(--ink-2); }
.wd-caption-actions { display: flex; align-items: center; gap: 4px; font-size: 12.5px; }
.wd-caption-actions .warn { color: #dc2626; }
.wd-callout { border: 1px solid var(--line); border-left: 3px solid #f59e0b; border-radius: 8px; padding: 12px 14px; background: #fff; }
.wd-callout-head { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; flex-wrap: wrap; }
.wd-callout p { margin: 6px 0 0; font-size: 14px; color: var(--ink-2); line-height: 1.55; white-space: pre-wrap; }
.wd-text-btn { margin-top: 8px; padding: 0; border: none; background: none; font-size: 13px; font-weight: 500; color: var(--accent); cursor: pointer; }
.wd-text-btn:hover { text-decoration: underline; }
.muted { color: var(--ink-3); font-weight: 400; }
.late { color: #dc2626; }
.wd-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); display: inline-block; flex-shrink: 0; }
.wd-dot.amber { background: #f59e0b; }
.wd-media { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
.wd-media.drag { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,.12); }
.wd-media-frame { position: relative; background: #f4f4f5; min-height: 260px; max-height: 420px; display: flex; align-items: center; justify-content: center; cursor: zoom-in; }
.wd-media.empty .wd-media-frame { cursor: pointer; background: #fff; }
.wd-media.empty .wd-media-frame:hover { background: var(--soft); }
.wd-media-frame img, .wd-media-frame video { max-width: 100%; max-height: 420px; object-fit: contain; display: block; }
.wd-media-frame video { cursor: default; }
.wd-expand { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,.9); border: 1px solid var(--line); color: var(--ink-2); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .15s; }
.wd-media-frame:hover .wd-expand { opacity: 1; }
.wd-media-link { display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--ink-2); padding: 24px; word-break: break-all; }
.wd-drop { display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--ink-3); font-size: 12.5px; text-align: center; padding: 24px; }
.wd-drop strong { color: var(--ink); font-size: 14px; font-weight: 500; }
.wd-drop-veil, .wd-progress-veil { position: absolute; inset: 0; background: rgba(255,255,255,.92); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; font-size: 13px; font-weight: 500; color: var(--ink); }
.wd-progress { width: 220px; height: 4px; border-radius: 4px; background: var(--line); overflow: hidden; }
.wd-progress > div { height: 100%; background: var(--ink); transition: width .2s; }
.wd-media-bar { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 8px 10px 8px 14px; border-top: 1px solid var(--line); background: #fff; flex-wrap: wrap; }
.wd-media-meta { display: flex; gap: 12px; font-size: 12.5px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.wd-media-meta .ok { color: #047857; }
.wd-media-meta .warn { color: #b45309; }
.wd-media-actions { display: flex; gap: 2px; }
.wd-media-actions button, .wd-media-actions a { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 9px; border-radius: 6px; border: none; background: transparent; color: var(--ink-2); font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; transition: background .12s, color .12s; }
.wd-media-actions button:hover, .wd-media-actions a:hover { background: var(--line-2); color: var(--ink); }
.wd-media-actions .danger:hover { background: #fef2f2; color: #dc2626; }
.wd-tabs { display: flex; gap: 20px; border-bottom: 1px solid var(--line); }
.wd-tabs button { position: relative; padding: 10px 0; border: none; background: none; font-size: 13.5px; font-weight: 500; color: var(--ink-3); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: color .12s; }
.wd-tabs button:hover { color: var(--ink); }
.wd-tabs button.active { color: var(--ink); }
.wd-tabs button.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--ink); border-radius: 2px; }
.wd-tabs button span { font-size: 11.5px; color: var(--ink-3); background: var(--line-2); padding: 0 6px; border-radius: 4px; line-height: 18px; }
.wd-tabs button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
.wd-panel { animation: wdU .15s ease; }
.wd-list, .wd-props { margin: 0; }
.wd-row { display: grid; grid-template-columns: 150px 1fr; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--line-2); font-size: 14px; }
.wd-row:last-child { border-bottom: none; }
.wd-row dt { color: var(--ink-3); }
.wd-row dd { margin: 0; color: var(--ink); line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
.wd-status { display: inline-flex; align-items: center; gap: 7px; font-weight: 500; }
.wd-side-divider { height: 1px; background: var(--line); }
.wd-field { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; font-weight: 500; color: var(--ink-2); }
.wd-field textarea, .wd-field input { width: 100%; box-sizing: border-box; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font: inherit; font-size: 13.5px; font-weight: 400; color: var(--ink); background: #fff; outline: none; resize: vertical; transition: border-color .12s, box-shadow .12s; }
.wd-field textarea:focus, .wd-field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,.12); }
.wd-block h4 { margin: 18px 0 10px; font-size: 12.5px; font-weight: 500; color: var(--ink-3); }
.wd-prose { margin: 0; font-size: 14px; line-height: 1.65; color: var(--ink); white-space: pre-wrap; }
.wd-assets { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
.wd-assets a { text-decoration: none; color: var(--ink-2); font-size: 12px; display: flex; flex-direction: column; gap: 6px; }
.wd-assets a > div { aspect-ratio: 1; border-radius: 8px; border: 1px solid var(--line); background: var(--soft); overflow: hidden; display: flex; align-items: center; justify-content: center; color: var(--ink-3); transition: border-color .12s; }
.wd-assets a:hover > div { border-color: #9ca3af; }
.wd-assets img { width: 100%; height: 100%; object-fit: cover; }
.wd-assets span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wd-steps { list-style: none; margin: 0; padding: 0; }
.wd-steps li { display: flex; gap: 14px; padding: 12px 8px; border-radius: 8px; transition: background .12s; }
.wd-steps li:hover { background: var(--soft); }
.wd-steps li + li { border-top: 1px solid var(--line-2); }
.wd-step-index { font-size: 12.5px; color: var(--ink-3); font-variant-numeric: tabular-nums; padding-top: 2px; width: 20px; flex-shrink: 0; }
.wd-step-body { flex: 1; min-width: 0; }
.wd-step-head { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; }
.wd-step-head strong { font-weight: 600; }
.wd-step-head span { font-size: 12.5px; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.wd-step-body p { margin: 4px 0 0; font-size: 14px; color: var(--ink-2); line-height: 1.55; }
.wd-step-body p.quote { display: flex; gap: 6px; color: var(--ink); }
.wd-step-body p.quote svg { flex-shrink: 0; margin-top: 4px; color: var(--ink-3); }
.wd-artwork { border: 1px solid var(--line); border-radius: 10px; padding: 40px 32px; background: var(--soft); text-align: center; }
.wd-artwork span { font-size: 12px; color: var(--ink-3); }
.wd-artwork h3 { margin: 10px 0 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
.wd-artwork p { margin: 6px 0 0; font-size: 15px; color: var(--ink-2); }
.wd-artwork em { display: inline-block; margin-top: 16px; font-style: normal; font-size: 13px; font-weight: 500; border: 1px solid var(--ink); border-radius: 999px; padding: 5px 14px; }
.wd-caption { display: flex; flex-direction: column; gap: 12px; }
.wd-copyable { position: relative; border: 1px solid var(--line); border-radius: 10px; padding: 14px 44px 14px 16px; }
.wd-hover-copy { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--line); background: #fff; color: var(--ink-2); display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity .12s; }
.wd-copyable:hover .wd-hover-copy, .wd-hover-copy:focus-visible { opacity: 1; }
.wd-tags { margin: 0; font-size: 14px; color: var(--ink-2); line-height: 1.6; }
.wd-caption-meta { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--ink-3); }
.wd-caption-meta .warn { color: #dc2626; }
.wd-empty-text { margin: 24px 0; text-align: center; font-size: 14px; color: var(--ink-3); }
.wd-comments { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 18px; }
.wd-comments li { display: flex; gap: 12px; }
.wd-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--line-2); color: var(--ink-2); font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.wd-comments li > div { flex: 1; min-width: 0; }
.wd-comment-head { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; font-size: 13.5px; }
.wd-comment-head strong { font-weight: 600; }
.wd-comment-head span { color: var(--ink-2); }
.wd-comment-head time { color: var(--ink-3); font-size: 12.5px; margin-left: auto; }
.wd-comment-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.wd-comment-tags span { font-size: 12px; color: var(--ink-2); border: 1px solid var(--line); border-radius: 6px; padding: 1px 7px; }
.wd-comments p { margin: 6px 0 0; font-size: 14px; line-height: 1.6; color: var(--ink); white-space: pre-wrap; }
.wd-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 24px; border-top: 1px solid var(--line); background: #fff; flex-wrap: wrap; }
.wd-footer-left, .wd-footer-right { display: flex; gap: 6px; flex-wrap: wrap; }
.wd-lightbox { position: fixed; inset: 0; z-index: 10001; background: rgba(17,24,39,.92); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 24px; cursor: zoom-out; animation: wdF .12s ease; overflow: auto; }
.wd-lightbox img { max-width: none; max-height: none; width: auto; height: auto; }
.wd-lightbox span { color: #d1d5db; font-size: 12.5px; position: fixed; bottom: 16px; }
@media (max-width: 860px) {
  .wd-dialog { height: 94vh; }
  .wd-layout { grid-template-columns: 1fr; overflow-y: auto; }
  .wd-right, .wd-left { overflow: visible; }
  .wd-left { border-right: none; border-bottom: 1px solid var(--line); }
  .wd-row { grid-template-columns: 110px 1fr; }
}
`;
