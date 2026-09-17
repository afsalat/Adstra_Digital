"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Film,
  Layers,
  Image as ImageIcon,
  Clock,
  Music2,
  Video,
  Hash,
  MapPin,
  Sparkles,
  ChevronRight,
  ExternalLink,
  History,
  Folder,
  Check,
} from "lucide-react";

export default function ScriptViewModal({
  isOpen,
  onClose,
  post,
  onApprove,
  onReject,
  onEdit,
  onOpenTimeline,
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

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

  const postTitle = forPosting.title || post.title || "Untitled Script";
  const postCaption = forPosting.description || post.primary_caption || "";
  const postLocation = forPosting.location || post.location || "";
  const postHashtags = forPosting.hashtag || post.hashtags || "";

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setSubmittingAction(true);
    try {
      if (onReject) {
        await onReject(post, rejectionReason.trim());
      }
      onClose();
    } catch (err) {
      alert("Failed to submit rejection.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmApprove = async () => {
    setSubmittingAction(true);
    try {
      if (onApprove) {
        await onApprove(post);
      }
      onClose();
    } catch (err) {
      alert("Failed to approve script.");
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 780,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "linear-gradient(to right, #f8fafc, #ffffff)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: post.client_primary_color || "#4338ca",
                  background: "#f1f5f9",
                  padding: "3px 9px",
                  borderRadius: 6,
                  letterSpacing: "0.02em",
                }}
              >
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
                  padding: "2px 8px",
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
                  : "Poster / Single Graphic"}
              </span>

              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "#7c3aed",
                  background: "#f5f3ff",
                  padding: "2px 8px",
                  borderRadius: 10,
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
                    background: "#7c3aed",
                  }}
                />
                Status: {(post.status || "script_approval").replace("_", " ").toUpperCase()}
              </span>
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
              <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#475569", marginTop: 2 }}>
                {headline}
              </div>
            )}
          </div>

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
          {/* Loopback Critique Banner if present */}
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
                  Previous Rejection Critique / Rework Notes:
                </strong>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#78350f", lineHeight: 1.4 }}>
                  {post.client_feedback}
                </p>
              </div>
            </div>
          )}

          {/* Quick Rejection Box if rejecting mode active */}
          {rejecting && (
            <form
              onSubmit={handleConfirmReject}
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                borderRadius: 14,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                animation: "modalFadeIn 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#991b1b", fontSize: "0.86rem", fontWeight: 800 }}>
                <RotateCcw size={16} />
                <span>Reject Script & Return to Stage 1 (Scripts)</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#b91c1c" }}>
                Provide constructive feedback explaining why the script is not approved and what the writer needs to revise.
              </p>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify hook improvements, tone adjustment, CTA changes, or concept fixes..."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #f87171",
                  fontSize: "0.82rem",
                  color: "#1e293b",
                  outline: "none",
                  background: "#ffffff",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction || !rejectionReason.trim()}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 7,
                    border: "none",
                    background: "#dc2626",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {submittingAction ? "Returning..." : "Confirm Rejection (↺ Scripts)"}
                </button>
              </div>
            </form>
          )}

          {/* SCRIPT CONTENT SECTION */}

          {/* 1. VIDEO / REEL STORYBOARD BREAKDOWN */}
          {format === "video" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Audio & Footage info */}
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
                  <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 20, textAlign: "center", color: "#64748b", fontSize: "0.84rem" }}>
                    {post.script_notes || "No detailed scene breakdown recorded. Refer to post caption and draft notes."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. CAROUSEL SLIDE DECK BREAKDOWN */}
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
                  <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 20, textAlign: "center", color: "#64748b", fontSize: "0.84rem" }}>
                    {post.script_notes || "No slide breakdown recorded."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. POSTER / SINGLE IMAGE BREAKDOWN */}
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

                {cta && (
                  <div style={{ marginTop: 10, fontSize: "0.82rem", fontWeight: 700, color: "#15803d" }}>
                    CTA: {cta}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. POSTING CAPTION & METADATA */}
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

          {/* 5. ATTACHED ASSETS */}
          {attachedAssets.length > 0 && (
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                <Sparkles size={13} style={{ color: "#7c3aed" }} />
                Attached Brand Media & References ({attachedAssets.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {attachedAssets.map((asset, idx) => {
                  const title = asset.title || (typeof asset === "string" ? asset : `Asset #${idx + 1}`);
                  const url = asset.url || asset.file_url || asset.file || "";
                  return (
                    <div
                      key={`asset-${idx}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: "0.76rem",
                        maxWidth: 320,
                      }}
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={title}
                          style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }}
                        />
                      ) : (
                        <Folder size={16} color="#64748b" />
                      )}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, color: "#1e293b" }}>
                        {title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER - REVIEWER ACTIONS */}
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
          {/* Left Actions: Timeline & Edit option */}
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

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(post);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid #c7d2fe",
                  background: "#eef2ff",
                  color: "#4338ca",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Edit3 size={14} />
                Edit Script
              </button>
            )}
          </div>

          {/* Right Actions: Reject & Approve */}
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

            {onReject && !rejecting && (
              <button
                type="button"
                onClick={() => setRejecting(true)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #ef4444",
                  background: "#ffffff",
                  color: "#dc2626",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <RotateCcw size={14} /> Reject (↺)
              </button>
            )}

            {onApprove && !rejecting && (
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleConfirmApprove}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#8b5cf6",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(139, 92, 246, 0.35)",
                }}
              >
                <CheckCircle2 size={15} />
                {submittingAction ? "Approving..." : "Approve → Move to Design"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
