"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Palette,
  Film,
  Layers,
  Image as ImageIcon,
  Clock,
  Music2,
  Video,
  Hash,
  MapPin,
  Sparkles,
  ExternalLink,
  History,
  Folder,
  Check,
  Copy,
  AlertTriangle,
  Send,
  Save,
  CheckCircle2,
  Calendar,
  Link2,
  Edit3,
  FileText,
  Upload,
  Play,
  Trash2,
  RotateCcw,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";

export default function WorkDetailsModal({
  isOpen,
  onClose,
  post,
  onReadyForQA,
  onSaveMedia,
  onOpenTimeline,
  onOpenEditModal,
}) {
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [designerNotes, setDesignerNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingQA, setIsSubmittingQA] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (post) {
      setMediaUrl(post.media_urls?.[0] || "");
      setDesignerNotes(post.designer_notes || "");
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const scriptData = post.script_data || {};
  const forDesigners = scriptData.for_designers || {};
  const forPosting = scriptData.for_posting || {};

  // Detect format: 'video' | 'carousel' | 'poster'
  const format =
    scriptData.format ||
    (post.post_type === "carousel"
      ? "carousel"
      : post.post_type === "reel" || post.post_type === "video"
      ? "video"
      : "poster");

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
  const clipTexts = forDesigners.texts || "";
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

  // Recommended Aspect Ratio
  const recommendedAspect =
    format === "video"
      ? "9:16 Vertical (1080x1920) - Reel / Short / TikTok"
      : format === "carousel"
      ? "4:5 Portrait (1080x1350) or 1:1 Square (1080x1080)"
      : "1:1 Square (1080x1080) or 4:5 Portrait (1080x1350)";

  // Format Copy Brief text for 1-click export
  const handleCopyWorkBrief = () => {
    let brief = `=====================================================\n`;
    brief += `🎨 DESIGNER WORK BRIEF & CREATIVE SPECIFICATIONS\n`;
    brief += `=====================================================\n\n`;
    brief += `Project Title: ${postTitle}\n`;
    brief += `Client: ${post.client_name || "Client"}\n`;
    brief += `Format: ${format.toUpperCase()} ${format === "video" ? `(${duration})` : ""}\n`;
    brief += `Recommended Ratio: ${recommendedAspect}\n`;
    if (post.scheduled_at) {
      brief += `Target Schedule Date: ${new Date(post.scheduled_at).toLocaleString()}\n`;
    }
    brief += `Platforms: ${(post.platforms || []).join(", ") || "Instagram, Facebook"}\n\n`;

    if (post.client_feedback) {
      brief += `⚠️ REVISION / CRITIQUE NOTES TO ADDRESS:\n${post.client_feedback}\n\n`;
    }

    if (headline) brief += `Headline / Hook: ${headline}\n`;
    if (sub) brief += `Sub-headline: ${sub}\n`;
    if (cta) brief += `Call-To-Action (CTA): ${cta}\n`;
    if (logoAssets) brief += `Logo / Watermark Direction: ${logoAssets}\n`;
    if (contactDetails) brief += `Contact / Handle Placement: ${contactDetails}\n`;
    if (designerNotes || post.designer_notes) {
      brief += `Designer Notes: ${designerNotes || post.designer_notes}\n`;
    }
    brief += `\n`;

    if (format === "video") {
      brief += `--- VIDEO STORYBOARD & AUDIO ---\n`;
      brief += `Audio Reference: ${musicReference || "Standard trending audio reference"}\n`;
      brief += `Execution Style: ${
        videoType === "ai"
          ? "AI Video Generation"
          : videoType === "motion"
          ? "Motion Graphics & Kinetic Typography"
          : "Client Footage & On-Camera Anchoring"
      }\n`;
      if (clips) brief += `Footage Notes: ${clips}\n`;
      brief += `\n`;

      if (scenes.length > 0) {
        scenes.forEach((s, idx) => {
          brief += `[Scene ${idx + 1} (${s.duration || "0-5s"})]\n`;
          brief += `Visual: ${s.visual_text || "—"}\n`;
          brief += `Script / On-Screen Text: "${s.content_text || "—"}"\n\n`;
        });
      } else if (post.script_notes) {
        brief += `Script Outline:\n${post.script_notes}\n\n`;
      }
    } else if (format === "carousel") {
      brief += `--- CAROUSEL SLIDE DECK ---\n`;
      if (slides.length > 0) {
        slides.forEach((s, idx) => {
          brief += `[Slide ${idx + 1}: ${s.headline || `Card ${idx + 1}`}]\n`;
          brief += `Visual Layout: ${s.visual_text || "—"}\n`;
          brief += `Slide Copy: "${s.content_text || "—"}"\n\n`;
        });
      } else if (post.script_notes) {
        brief += `Deck Notes:\n${post.script_notes}\n\n`;
      }
    } else {
      brief += `--- POSTER / GRAPHIC DIRECTION ---\n`;
      if (visualContentText) brief += `Visual Artwork Direction:\n${visualContentText}\n\n`;
      if (post.script_notes) brief += `Script Notes:\n${post.script_notes}\n\n`;
    }

    if (postCaption) {
      brief += `--- SOCIAL CAPTION & HASHTAGS ---\n`;
      brief += `${postCaption}\n`;
      if (postHashtags) brief += `\nHashtags: ${postHashtags}\n`;
    }

    navigator.clipboard.writeText(brief);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("replace", "true");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/social/posts/${post.id}/upload_media/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.file_url) {
        setMediaUrl(res.data.file_url);
        if (post) {
          post.media_urls = [res.data.file_url];
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.response?.data?.error || "Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachedMedia = () => {
    if (!confirm("Remove this media asset?")) return;
    setMediaUrl("");
    if (post) {
      post.media_urls = [];
    }
  };

  const handleReadyQA = async () => {
    if (!onReadyForQA) return;
    setIsSubmittingQA(true);
    try {
      await onReadyForQA(post, mediaUrl.trim(), designerNotes.trim());
      onClose();
    } finally {
      setIsSubmittingQA(false);
    }
  };

  const isVideoAsset = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".mov") ||
      lower.includes("video") ||
      lower.includes("blob:")
    );
  };

  const isImageAsset = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".gif") ||
      lower.includes("image")
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
      />
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 880,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.3)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(to right, #faf5ff, #f8fafc, #ffffff)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: post.client_primary_color || "#7c3aed",
                  background: "#f3e8ff",
                  padding: "3px 10px",
                  borderRadius: 6,
                  letterSpacing: "0.02em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Palette size={13} />
                {post.client_name || "Client"}
              </span>

              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color:
                    format === "video"
                      ? "#b91c1c"
                      : format === "carousel"
                      ? "#0369a1"
                      : "#4338ca",
                  background:
                    format === "video"
                      ? "#fef2f2"
                      : format === "carousel"
                      ? "#f0f9ff"
                      : "#eef2ff",
                  padding: "3px 9px",
                  borderRadius: 6,
                  border: `1px solid ${
                    format === "video"
                      ? "#fecaca"
                      : format === "carousel"
                      ? "#bae6fd"
                      : "#c7d2fe"
                  }`,
                  textTransform: "uppercase",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {format === "video" ? (
                  <Film size={12} />
                ) : format === "carousel" ? (
                  <Layers size={12} />
                ) : (
                  <ImageIcon size={12} />
                )}
                {format === "video"
                  ? `Reel / Video (${duration})`
                  : format === "carousel"
                  ? `Carousel (${slides.length || "Deck"} Slides)`
                  : "Graphic / Poster"}
              </span>

              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "#9333ea",
                  background: "#faf5ff",
                  padding: "3px 9px",
                  borderRadius: 6,
                  border: "1px solid #f3e8ff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#9333ea",
                  }}
                />
                Stage: {(post.status || "designing").replace("_", " ").toUpperCase()}
              </span>

              {post.scheduled_at && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#0f766e",
                    background: "#f0fdfa",
                    padding: "3px 9px",
                    borderRadius: 6,
                    border: "1px solid #ccfbf1",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Calendar size={12} />
                  Target: {new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.3,
              }}
            >
              {postTitle}
            </h3>
            {headline && headline !== postTitle && (
              <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#64748b", marginTop: 2 }}>
                Hook / Headline: {headline}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleCopyWorkBrief}
              title="Copy formatted work brief to clipboard"
              style={{
                background: copiedBrief ? "#ecfdf5" : "#f1f5f9",
                border: copiedBrief ? "1px solid #a7f3d0" : "1px solid #e2e8f0",
                color: copiedBrief ? "#047857" : "#475569",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s ease",
              }}
            >
              {copiedBrief ? <Check size={14} color="#047857" /> : <Copy size={14} />}
              {copiedBrief ? "Brief Copied!" : "Copy Brief"}
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e2e8f0";
                e.currentTarget.style.color = "#0f172a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* 1. REVISION CRITIQUE ALERT BANNER (If post was returned/reworked) */}
          {post.client_feedback && (
            <div
              style={{
                background: "#fffbeb",
                border: "1.5px solid #fde68a",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <AlertTriangle size={18} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#92400e", fontSize: "0.82rem", display: "block", marginBottom: 2 }}>
                  ⚠️ Rework & Revision Notes to Address:
                </strong>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#78350f", lineHeight: 1.45 }}>
                  {post.client_feedback}
                </p>
              </div>
            </div>
          )}

          {/* 2. DESIGNER CREATIVE SPECS & INSTRUCTIONS CARD */}
          <div
            style={{
              background: "#faf5ff",
              border: "1px solid #e9d5ff",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#7e22ce", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <Palette size={14} style={{ color: "#9333ea" }} />
                Creative Production Brief & Specs
              </div>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#6b21a8", background: "#f3e8ff", padding: "3px 8px", borderRadius: 6 }}>
                Ratio: {recommendedAspect}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                background: "#ffffff",
                padding: 14,
                borderRadius: 10,
                border: "1px solid #f3e8ff",
              }}
            >
              {cta && (
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#16a34a", textTransform: "uppercase" }}>
                    Call To Action (CTA)
                  </div>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#15803d", marginTop: 2 }}>
                    {cta}
                  </div>
                </div>
              )}

              {logoAssets && (
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                    Logo & Watermark
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#1e293b", marginTop: 2 }}>
                    {logoAssets}
                  </div>
                </div>
              )}

              {contactDetails && (
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                    Contact / Handle Watermark
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#1e293b", marginTop: 2 }}>
                    {contactDetails}
                  </div>
                </div>
              )}
            </div>

            {(designerNotes || post.designer_notes) && (
              <div style={{ background: "#ffffff", padding: 12, borderRadius: 10, border: "1px solid #f3e8ff" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#6b21a8", textTransform: "uppercase", marginBottom: 3 }}>
                  Designer Notes & Video Cut Directions:
                </div>
                <div style={{ fontSize: "0.84rem", color: "#1e293b", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                  {designerNotes || post.designer_notes}
                </div>
              </div>
            )}
          </div>

          {/* 3. FORMAT-SPECIFIC STORYBOARD / SCENE BREAKDOWN */}

          {/* 3A. REELS / VIDEO STORYBOARD */}
          {format === "video" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Audio & Style Row */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                    <Music2 size={13} style={{ color: "#e11d48" }} />
                    Music & Audio Style
                  </div>
                  <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#1e293b", marginTop: 2 }}>
                    {musicReference || "Standard trending audio reference"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                    <Video size={13} style={{ color: "#2563eb" }} />
                    Video Execution Style
                  </div>
                  <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#1e293b", marginTop: 2 }}>
                    {videoType === "ai"
                      ? "AI Video Generation"
                      : videoType === "motion"
                      ? "Motion Graphics & Kinetic Typography"
                      : "Clips from Client / On-Camera Anchoring"}
                  </div>
                </div>

                {clips && (
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                      Footage / Clips Note
                    </div>
                    <div style={{ fontSize: "0.84rem", color: "#1e293b", marginTop: 2 }}>
                      {clips}
                    </div>
                  </div>
                )}
              </div>

              {/* Storyboard Scenes */}
              <div>
                <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Film size={15} style={{ color: "#e11d48" }} />
                  <span>Scene Breakdown & On-Screen Script ({scenes.length || 0} Scenes)</span>
                </div>

                {scenes.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {scenes.map((scene, idx) => (
                      <div
                        key={`scene-${idx}`}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          padding: 14,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              background: "#fee2e2",
                              color: "#991b1b",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            Scene {idx + 1}
                          </span>
                          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} /> {scene.duration || "0-5s"}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {/* Visual Prompt / Concept */}
                          <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #3b82f6" }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", marginBottom: 2 }}>
                              🎬 Visual Concept & Art Direction:
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#1e293b", lineHeight: 1.4 }}>
                              {scene.visual_text || "No visual direction specified"}
                            </div>
                          </div>

                          {/* Dialogue / Script / Voiceover */}
                          <div style={{ background: "#fdf4ff", padding: "8px 12px", borderRadius: 8, borderLeft: "3px solid #c026d3" }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#a21caf", textTransform: "uppercase", marginBottom: 2 }}>
                              🎙️ Voiceover / Script / On-Screen Text:
                            </div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#4a044e", lineHeight: 1.45 }}>
                              "{scene.content_text || "—"}"
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 18, color: "#334155", fontSize: "0.84rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {post.script_notes || "No detailed scene breakdown recorded. Refer to caption and draft notes."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3B. CAROUSEL SLIDE DECK */}
          {format === "carousel" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Cover slide preview */}
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", marginBottom: 2 }}>
                  Cover Slide (Hook)
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                  {headline || postTitle}
                </div>
                {sub && <div style={{ fontSize: "0.84rem", color: "#475569", marginTop: 2 }}>{sub}</div>}
              </div>

              {/* Slide Deck */}
              <div>
                <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Layers size={15} style={{ color: "#0284c7" }} />
                  <span>Carousel Deck ({slides.length} Slides)</span>
                </div>

                {slides.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                    {slides.map((slide, idx) => (
                      <div
                        key={`slide-${idx}`}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          padding: 14,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: 6 }}>
                            Slide {idx + 1}: {slide.headline || `Card ${idx + 1}`}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#1e293b", background: "#f8fafc", padding: "6px 10px", borderRadius: 6 }}>
                          <strong style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>Visual Design:</strong>
                          {slide.visual_text || "—"}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#0f172a", background: "#f1f5f9", padding: "6px 10px", borderRadius: 6 }}>
                          <strong style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>Slide Copy:</strong>
                          {slide.content_text || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 18, color: "#334155", fontSize: "0.84rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {post.script_notes || "No slide breakdown recorded."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3C. POSTER / SINGLE GRAPHIC */}
          {format === "poster" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#6366f1", textTransform: "uppercase", marginBottom: 4 }}>
                  Poster Headline & Visual Direction
                </div>
                <h4 style={{ margin: "0 0 6px", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                  {headline || postTitle}
                </h4>
                {sub && <p style={{ margin: "0 0 10px", fontSize: "0.86rem", color: "#475569" }}>{sub}</p>}

                {visualContentText && (
                  <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 14px", marginTop: 8 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", marginBottom: 3 }}>
                      Creative Visual Concept
                    </div>
                    <div style={{ fontSize: "0.84rem", color: "#1e293b", lineHeight: 1.45 }}>
                      {visualContentText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. ATTACHED BRAND ASSETS & REFERENCE FILES */}
          {attachedAssets.length > 0 && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                <Sparkles size={14} style={{ color: "#7c3aed" }} />
                Attached Brand Media & References ({attachedAssets.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {attachedAssets.map((asset, idx) => {
                  const title = asset.title || (typeof asset === "string" ? asset : `Asset #${idx + 1}`);
                  const url = asset.url || asset.file_url || asset.file || "";
                  return (
                    <a
                      key={`asset-${idx}`}
                      href={url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        padding: "7px 12px",
                        fontSize: "0.78rem",
                        textDecoration: "none",
                        color: "#1e293b",
                        maxWidth: 320,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                      }}
                    >
                      {url && (isImageAsset(url) || url.startsWith("http")) ? (
                        <img
                          src={url}
                          alt={title}
                          style={{ width: 26, height: 26, borderRadius: 4, objectFit: "cover" }}
                        />
                      ) : (
                        <Folder size={18} color="#64748b" />
                      )}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                        {title}
                      </span>
                      <ExternalLink size={12} style={{ color: "#64748b", marginLeft: "auto", flexShrink: 0 }} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. POSTING CAPTION & METADATA */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <FileText size={13} style={{ color: "#4f46e5" }} />
              Primary Caption / Copy for Posting
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {postCaption || "No social copy written yet."}
            </p>

            {(postHashtags || postLocation) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, paddingTop: 10, borderTop: "1px dashed #e2e8f0" }}>
                {postHashtags && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.76rem", color: "#4338ca", fontWeight: 600 }}>
                    <Hash size={13} /> {postHashtags}
                  </div>
                )}
                {postLocation && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>
                    <MapPin size={13} /> {postLocation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 6. DESIGNER OUTPUT & MEDIA ATTACHMENT SECTION */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#15803d", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <Link2 size={15} />
                Creative Deliverable: Upload, Replace & Play
              </div>
              <span style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 700 }}>
                {mediaUrl ? "Deliverable Attached" : "Awaiting Final Media"}
              </span>
            </div>

            {uploadError && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "8px 12px", borderRadius: 8, fontSize: "0.78rem" }}>
                {uploadError}
              </div>
            )}

            {/* Direct Upload Box or Attached Preview Card */}
            {!mediaUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #86efac",
                  borderRadius: 12,
                  padding: "26px 20px",
                  textAlign: "center",
                  background: "#ffffff",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#dcfce7",
                    color: "#15803d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Upload size={22} />
                </div>
                <div>
                  <strong style={{ fontSize: "0.88rem", color: "#166534", display: "block" }}>
                    {isUploading ? "Uploading deliverable..." : "Click or Drag & Drop to Upload Deliverable"}
                  </strong>
                  <span style={{ fontSize: "0.74rem", color: "#475569" }}>
                    Supports Reel / Video (.mp4, .mov, .webm) or Graphic (.png, .jpg, .webp)
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #bbf7d0",
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Media Player / Image Display */}
                <div style={{ background: "#0f172a", borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180, maxHeight: 320 }}>
                  {isVideoAsset(mediaUrl) ? (
                    <video
                      src={mediaUrl}
                      controls
                      playsInline
                      style={{ maxHeight: 320, maxWidth: "100%", borderRadius: 8 }}
                    />
                  ) : isImageAsset(mediaUrl) ? (
                    <img
                      src={mediaUrl}
                      alt="Deliverable preview"
                      style={{ maxHeight: 320, maxWidth: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ padding: "20px", color: "#fff", display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                      <ExternalLink size={16} />
                      <span>{mediaUrl}</span>
                    </div>
                  )}
                </div>

                {/* SHOW OPTIONS & ACTION BUTTONS */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, paddingTop: 6, borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      title="Replace current file with an updated version"
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #86efac",
                        color: "#15803d",
                        padding: "6px 12px",
                        borderRadius: 7,
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        cursor: isUploading ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <RotateCcw size={13} />
                      {isUploading ? "Uploading..." : "Replace Media File"}
                    </button>

                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        color: "#334155",
                        padding: "6px 10px",
                        borderRadius: 7,
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <ExternalLink size={12} /> Open File
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(mediaUrl);
                        alert("Media link copied to clipboard!");
                      }}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        color: "#334155",
                        padding: "6px 10px",
                        borderRadius: 7,
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Copy size={12} /> Copy Link
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveAttachedMedia}
                    title="Remove attached deliverable"
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fca5a5",
                      color: "#dc2626",
                      padding: "6px 10px",
                      borderRadius: 7,
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            )}

            {/* Optional External Link Fallback */}
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#166534", marginBottom: 3 }}>
                Or Paste Cloud URL (Google Drive, Canva, Figma):
              </label>
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://www.figma.com/..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #86efac",
                  background: "#ffffff",
                  fontSize: "0.82rem",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#166534", marginBottom: 4 }}>
                Designer Production Notes / Notes for QA:
              </label>
              <textarea
                rows={2}
                value={designerNotes}
                onChange={(e) => setDesignerNotes(e.target.value)}
                placeholder="e.g. 1080x1920 60s Reel rendered with captions and sound design. Ready for review."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #86efac",
                  background: "#ffffff",
                  fontSize: "0.82rem",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            background: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {/* Left Actions: Timeline & Raw Edit */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onOpenTimeline && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTimeline(post);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <History size={14} style={{ color: "#6366f1" }} />
                Timeline
              </button>
            )}

            {onOpenEditModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEditModal(post);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Edit3 size={14} />
                Edit Notes
              </button>
            )}
          </div>

          {/* Right Actions: Save Media & Ready for QA */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close
            </button>

            {onSaveMedia && (
              <button
                type="button"
                disabled={isSaving || isSubmittingQA}
                onClick={handleSaveOnly}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                <Save size={14} />
                {isSaving ? "Saving..." : "Save Media Link"}
              </button>
            )}

            {onReadyForQA && (
              <button
                type="button"
                disabled={isSubmittingQA || isSaving}
                onClick={handleReadyQA}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ec4899",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: isSubmittingQA ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 10px rgba(236, 72, 153, 0.35)",
                }}
              >
                <CheckCircle2 size={15} />
                {isSubmittingQA ? "Submitting..." : "Ready for QA Review →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
