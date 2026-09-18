"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Palette,
  Clock,
  Sparkles,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";

export default function MediaPreviewModal({
  isOpen,
  onClose,
  post,
  onRefresh,
  onReadyForQA,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  if (!isOpen || !post) return null;

  const mediaUrl = post.media_urls?.[0] || "";
  const isVideo =
    mediaUrl &&
    (mediaUrl.toLowerCase().endsWith(".mp4") ||
      mediaUrl.toLowerCase().endsWith(".webm") ||
      mediaUrl.toLowerCase().endsWith(".mov") ||
      mediaUrl.toLowerCase().includes("video") ||
      post.post_type === "reel" ||
      post.post_type === "video");

  const handlePlayToggle = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  const handleCopyLink = () => {
    if (!mediaUrl) return;
    navigator.clipboard.writeText(mediaUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleFileSelect = async (e) => {
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
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.response?.data?.error || "Failed to upload media file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveMedia = async () => {
    if (!confirm("Are you sure you want to remove this media asset?")) return;
    setIsUploading(true);
    try {
      await axios.post(`${API_BASE_URL}/social/posts/${post.id}/transition_stage/`, {
        target_stage: post.status,
        action_type: "advance",
        notes: "Designer removed attached creative media asset",
        media_urls: [],
      });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      alert("Failed to remove media.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 15, 30, 0.82)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      {/* Hidden File Input for Replace */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp,image/gif"
        style={{ display: "none" }}
      />

      <div
        style={{
          background: "#0f172a",
          borderRadius: 20,
          width: "100%",
          maxWidth: 960,
          maxHeight: "94vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          color: "#ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#1e293b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isVideo ? "#ec4899" : "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isVideo ? <Film size={17} color="#fff" /> : <ImageIcon size={17} color="#fff" />}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "0.98rem",
                    fontWeight: 800,
                    color: "#ffffff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 420,
                  }}
                >
                  {post.title || "Creative Asset"}
                </h4>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#cbd5e1",
                    padding: "2px 7px",
                    borderRadius: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {post.post_type}
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "#94a3b8" }}>
                Client: <strong>{post.client_name || "Adstra Client"}</strong> • Stage:{" "}
                <span style={{ color: "#f472b6", fontWeight: 700 }}>
                  {(post.status || "designing").replace("_", " ").toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Replace Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Replace this media file with an updated version"
              style={{
                background: "#334155",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "#ffffff",
                cursor: isUploading ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Upload size={13} />
              {isUploading ? "Uploading..." : "Replace File"}
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#cbd5e1",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL MAIN CONTENT */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "#020617",
            minHeight: 380,
            maxHeight: "68vh",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {isUploading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(2, 6, 23, 0.75)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "4px solid rgba(255, 255, 255, 0.2)",
                  borderTopColor: "#ec4899",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                Uploading & Replacing Deliverable...
              </span>
            </div>
          )}

          {uploadError && (
            <div
              style={{
                position: "absolute",
                top: 16,
                background: "rgba(239, 68, 68, 0.9)",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: "0.8rem",
                zIndex: 25,
              }}
            >
              {uploadError}
            </div>
          )}

          {mediaUrl ? (
            isVideo ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  maxHeight: "64vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  controls
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{
                    maxHeight: "60vh",
                    maxWidth: "100%",
                    borderRadius: 12,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7)",
                    outline: "none",
                  }}
                />
              </div>
            ) : (
              <img
                src={mediaUrl}
                alt={post.title || "Deliverable preview"}
                style={{
                  maxHeight: "60vh",
                  maxWidth: "100%",
                  borderRadius: 12,
                  objectFit: "contain",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7)",
                }}
              />
            )
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                }}
              >
                <Upload size={28} />
              </div>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                No Media Deliverable Attached Yet
              </h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", maxWidth: 360 }}>
                Upload the final Reel, Video, or Graphic creative asset directly to preview, replace, or submit for QA.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  background: "#ec4899",
                  color: "#ffffff",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Upload size={15} /> Upload Final Creative Asset
              </button>
            </div>
          )}
        </div>

        {/* MODAL FOOTER & ACTION TOOLBAR */}
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "#1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {/* Left: Playback & Link controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isVideo && mediaUrl && (
              <>
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  style={{
                    background: isPlaying ? "#ec4899" : "#334155",
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 12px",
                    color: "#fff",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  {isPlaying ? "Pause" : "Play"}
                </button>

                <button
                  type="button"
                  onClick={handleMuteToggle}
                  style={{
                    background: "#334155",
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 10px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  style={{
                    background: "#334155",
                    border: "none",
                    borderRadius: 7,
                    padding: "6px 10px",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                  title="Fullscreen"
                >
                  <Maximize2 size={14} />
                </button>
              </>
            )}

            {mediaUrl && (
              <>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    background: copiedLink ? "rgba(16, 185, 129, 0.2)" : "#334155",
                    border: copiedLink ? "1px solid #10b981" : "none",
                    borderRadius: 7,
                    padding: "6px 12px",
                    color: copiedLink ? "#34d399" : "#cbd5e1",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                  {copiedLink ? "Link Copied!" : "Copy Link"}
                </button>

                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  style={{
                    background: "#334155",
                    borderRadius: 7,
                    padding: "6px 12px",
                    color: "#cbd5e1",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <ExternalLink size={13} /> Open Original
                </a>

                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  title="Delete/Remove this attached file"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: 7,
                    padding: "6px 10px",
                    color: "#f87171",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>

          {/* Right: Submit / Ready for QA & Close */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 8,
                padding: "7px 14px",
                color: "#94a3b8",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close
            </button>

            {onReadyForQA && post.status === "designing" && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReadyForQA(post);
                }}
                style={{
                  background: "#ec4899",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 18px",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 10px rgba(236, 72, 153, 0.4)",
                }}
              >
                <CheckCircle2 size={15} />
                Confirm & Ready for QA →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
