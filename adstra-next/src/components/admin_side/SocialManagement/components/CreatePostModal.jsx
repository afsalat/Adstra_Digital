"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Image as ImageIcon,
  Layers,
  Video,
  FileText,
  Smartphone,
  Eye,
  Send,
  Save,
  CheckCircle2,
  Share2,
  AlertTriangle,
} from "lucide-react";

const ALL_PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "#e1306c", icon: "📸" },
  { id: "facebook", label: "Facebook", color: "#1877f2", icon: "📘" },
  { id: "linkedin", label: "LinkedIn", color: "#0a66c2", icon: "💼" },
  { id: "youtube", label: "YouTube", color: "#ff0000", icon: "▶️" },
  { id: "x", label: "X / Twitter", color: "#000000", icon: "✖️" },
  { id: "google_business", label: "Google Business", color: "#0f9d58", icon: "📍" },
  { id: "tiktok", label: "TikTok", color: "#000000", icon: "🎵" },
];

const PLATFORM_MAP = ALL_PLATFORMS.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {});

export default function CreatePostModal({
  isOpen,
  onClose,
  clients = [],
  accounts = [],
  selectedClientId = "all",
  onSuccess,
  onOpenAiStudio,
  initialData = null,
}) {
  const [clientId, setClientId] = useState(
    initialData?.client_profile
      ? initialData.client_profile
      : selectedClientId !== "all"
      ? selectedClientId
      : clients[0]?.id || 1
  );
  const [clientAccounts, setClientAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [postType, setPostType] = useState(initialData?.post_type || "image");
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    initialData?.platforms || []
  );
  const [primaryCaption, setPrimaryCaption] = useState(initialData?.primary_caption || "");
  const [hashtags, setHashtags] = useState(initialData?.hashtags || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [firstComment, setFirstComment] = useState(initialData?.first_comment || "");
  const [scriptNotes, setScriptNotes] = useState(initialData?.script_notes || "");
  const [designerNotes, setDesignerNotes] = useState(initialData?.designer_notes || "");
  const [mediaUrl, setMediaUrl] = useState(
    initialData?.media_urls?.[0] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
  );
  const [priority, setPriority] = useState(initialData?.priority || "medium");
  const [publishMode, setPublishMode] = useState(
    initialData?.status
      ? (initialData.status === "published"
          ? "now"
          : initialData.status === "approved" || initialData.status === "scheduled"
          ? "schedule"
          : initialData.status === "client_review"
          ? "review"
          : initialData.status === "designing"
          ? "designing"
          : initialData.status === "script_approval"
          ? "script_approval"
          : "script")
      : initialData?.scheduled_at
      ? "schedule"
      : "script"
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduled_at
      ? initialData.scheduled_at.slice(0, 16)
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [isTemplate, setIsTemplate] = useState(false);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState("instagram");
  const [submitting, setSubmitting] = useState(false);

  // Sync client connected accounts dynamically
  useEffect(() => {
    if (!clientId) return;

    // Filter matching accounts from passed props
    const matched = (accounts || []).filter(
      (a) => String(a.client_profile) === String(clientId) && a.status !== "disconnected" && a.is_active !== false
    );
    if (matched.length > 0) {
      setClientAccounts(matched);
      if (!initialData?.platforms && selectedPlatforms.length === 0) {
        const activePlats = [...new Set(matched.map((a) => a.platform))];
        setSelectedPlatforms(activePlats);
        setActivePreviewPlatform(activePlats[0] || "instagram");
      }
    }

    // Also fetch fresh from API to ensure real-time accuracy
    setLoadingAccounts(true);
    axios
      .get(`${API_BASE_URL}/social/accounts/?client_id=${clientId}`)
      .then((res) => {
        const active = res.data.filter((a) => a.status !== "disconnected" && a.is_active !== false);
        setClientAccounts(active);
        if (!initialData?.platforms && selectedPlatforms.length === 0 && active.length > 0) {
          const activePlats = [...new Set(active.map((a) => a.platform))];
          setSelectedPlatforms(activePlats);
          setActivePreviewPlatform(activePlats[0] || "instagram");
        } else if (!initialData?.platforms && selectedPlatforms.length === 0 && active.length === 0) {
          setSelectedPlatforms(["instagram", "facebook"]);
        }
      })
      .catch((err) => console.error("Error fetching client accounts", err))
      .finally(() => setLoadingAccounts(false));
  }, [clientId, accounts]);

  if (!isOpen) return null;

  const handleClientChange = (newClientId) => {
    setClientId(newClientId);
    const matched = (accounts || []).filter(
      (a) => String(a.client_profile) === String(newClientId) && a.status !== "disconnected" && a.is_active !== false
    );
    if (matched.length > 0) {
      const activePlats = [...new Set(matched.map((a) => a.platform))];
      setSelectedPlatforms(activePlats);
      setActivePreviewPlatform(activePlats[0] || "instagram");
    } else {
      setSelectedPlatforms(["instagram", "facebook"]);
      setActivePreviewPlatform("instagram");
    }
  };

  const togglePlatform = (pId) => {
    if (selectedPlatforms.includes(pId)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== pId));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, pId]);
    }
  };

  const selectedClient = clients.find((c) => String(c.id) === String(clientId)) || clients[0] || {};

  const handleSubmit = async () => {
    if (!primaryCaption.trim() && !title.trim() && !scriptNotes.trim()) {
      alert("Please write a post caption, title, or script outline.");
      return;
    }

    setSubmitting(true);
    let targetStatus = "script";
    if (publishMode === "now") targetStatus = "published";
    else if (publishMode === "schedule") targetStatus = "approved";
    else if (publishMode === "review") targetStatus = "client_review";
    else if (publishMode === "designing") targetStatus = "designing";
    else if (publishMode === "script_approval") targetStatus = "script_approval";
    else if (publishMode === "script") targetStatus = "script";

    const payload = {
      client_profile: clientId,
      title: title || primaryCaption.slice(0, 40) || scriptNotes.slice(0, 40),
      post_type: postType,
      platforms: selectedPlatforms,
      priority,
      primary_caption: primaryCaption,
      script_notes: scriptNotes,
      designer_notes: designerNotes,
      hashtags,
      location,
      first_comment: firstComment,
      media_urls: mediaUrl ? [mediaUrl] : [],
      scheduled_at: (publishMode === "schedule" || publishMode === "now") ? new Date(scheduledAt).toISOString() : null,
      published_at: publishMode === "now" ? new Date().toISOString() : null,
      status: targetStatus,
      is_template: isTemplate,
    };

    try {
      if (initialData?.id) {
        await axios.put(`${API_BASE_URL}/social/posts/${initialData.id}/`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/social/posts/`, payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Error saving post. Please verify all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="social-modal-overlay">
      <div className="social-modal-content" style={{ maxWidth: 1040, maxHeight: "94vh" }}>
        
        {/* Header */}
        <div className="social-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Share2 size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                {initialData ? "Edit Social Post" : "Create & Schedule Social Post"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Publish across Instagram, LinkedIn, Facebook, YouTube, and X simultaneously
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={onOpenAiStudio}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #8b5cf6, #6366f1)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
            >
              <Sparkles size={15} /> AI Content Studio
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body: Two columns (Editor on left, Live Feed Preview on right) */}
        <div className="social-modal-body" style={{ display: "grid", gridTemplateColumns: "1.25fr 0.95fr", gap: 28 }}>
          
          {/* Left Column: Form Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* Client Picker & Post Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Client Profile *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", fontWeight: 600, background: "#fff" }}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Post Format
                </label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", fontWeight: 600, background: "#fff" }}
                >
                  <option value="image">Single Image Post</option>
                  <option value="carousel">Carousel Slides (Multi-image)</option>
                  <option value="reel">Reel / Short Video</option>
                  <option value="video">Long Video</option>
                  <option value="text">Text / Announcement</option>
                </select>
              </div>
            </div>

            {/* Dynamic Platform Selectors Based On Connected Channels */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                  Publish To Platforms:
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    {selectedPlatforms.length} platform{selectedPlatforms.length === 1 ? "" : "s"} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "0 4px",
                    }}
                  >
                    {showAllPlatforms ? "Show Connected Only" : "+ Other Platforms"}
                  </button>
                </div>
              </div>

              {/* Dynamic Connected Channels for this client */}
              {clientAccounts.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {clientAccounts.map((acc) => {
                    const platConfig = PLATFORM_MAP[acc.platform] || {
                      label: acc.platform,
                      color: "#64748b",
                      icon: "🌐",
                    };
                    const active = selectedPlatforms.includes(acc.platform);

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => togglePlatform(acc.platform)}
                        title={`Publish to ${platConfig.label} (${acc.account_name})`}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 9,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: `1.5px solid ${active ? platConfig.color : "#cbd5e1"}`,
                          background: active
                            ? acc.platform === "instagram"
                              ? "#fdf2f8"
                              : acc.platform === "facebook" || acc.platform === "linkedin"
                              ? "#eff6ff"
                              : "#f8fafc"
                            : "#ffffff",
                          color: active ? (platConfig.color === "#000000" ? "#0f172a" : platConfig.color) : "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span style={{ fontSize: "0.95rem" }}>{platConfig.icon}</span>
                        <div style={{ textAlign: "left", lineHeight: 1.15 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span>{platConfig.label}</span>
                            {active && <CheckCircle2 size={13} color={platConfig.color} />}
                          </div>
                          {acc.username && (
                            <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>
                              {acc.username}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* If no connected channels exist for this client */}
              {clientAccounts.length === 0 && !loadingAccounts && (
                <div style={{ padding: "10px 14px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fef3c7", marginBottom: 8 }}>
                  <div style={{ fontSize: "0.76rem", color: "#92400e", fontWeight: 600 }}>
                    ⚠️ No live social channels connected for {selectedClient?.name || "this client"}. Select draft targets below:
                  </div>
                </div>
              )}

              {/* Other/All platforms available if toggled OR if no connected channels */}
              {(showAllPlatforms || clientAccounts.length === 0) && (
                <div style={{ marginTop: clientAccounts.length > 0 ? 8 : 0 }}>
                  {clientAccounts.length > 0 && (
                    <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, marginBottom: 4 }}>
                      Other Draft Platforms:
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ALL_PLATFORMS.filter(
                      (p) => !clientAccounts.some((a) => a.platform === p.id)
                    ).map((p) => {
                      const active = selectedPlatforms.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePlatform(p.id)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 7,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: `1px solid ${active ? p.color : "#cbd5e1"}`,
                            background: active ? "#f1f5f9" : "#ffffff",
                            color: active ? p.color : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span>{p.icon}</span>
                          <span>{p.label}</span>
                          {active && <CheckCircle2 size={12} color={p.color} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Post Title */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                Internal Title / Campaign Identifier
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Cloud Scalability Carousel #2"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none" }}
              />
            </div>

            {/* Script Notes / Hook */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4f46e5" }}>
                  1. Script Hook & Content Ideation Notes (Copywriting Stage)
                </label>
                <span style={{ fontSize: "0.72rem", color: "#6366f1", fontWeight: 600 }}>
                  Stage 1: Script
                </span>
              </div>
              <textarea
                rows={2}
                value={scriptNotes}
                onChange={(e) => setScriptNotes(e.target.value)}
                placeholder="Hook angle, storyline, video scene outline, or copy notes..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", background: "#f8fafc" }}
              />
            </div>

            {/* Caption */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                  Primary Caption *
                </label>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {primaryCaption.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={primaryCaption}
                onChange={(e) => setPrimaryCaption(e.target.value)}
                placeholder="Write your engaging caption here (English or Malayalam)..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none", resize: "vertical", lineHeight: 1.5 }}
              />
            </div>

            {/* Hashtags & Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Hashtags
                </label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#AdstraDigital #VorionNexus #KeralaBusiness"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Location Tag
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Infopark Kochi"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
                />
              </div>
            </div>

            {/* Designer / Editor Notes & Media URL (Stage 3) */}
            <div style={{ background: "#fdf2f8", border: "1px solid #fce7f3", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#be185d" }}>
                  3. Creative Design Brief & Assets (Scheduled / Designing)
                </label>
                <span style={{ fontSize: "0.7rem", color: "#ec4899", fontWeight: 700 }}>
                  Video / Image / Carousel
                </span>
              </div>
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Media Creative URL (Image or Video URL)..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fbcfe8", fontSize: "0.84rem", outline: "none", background: "#fff" }}
              />
              <input
                type="text"
                value={designerNotes}
                onChange={(e) => setDesignerNotes(e.target.value)}
                placeholder="Designer instructions (e.g. 1080x1350 vertical, yellow accent, 15s reel cut)..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fbcfe8", fontSize: "0.84rem", outline: "none", background: "#fff" }}
              />
            </div>

            {/* First Comment */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                First Comment (Optional)
              </label>
              <input
                type="text"
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                placeholder="e.g. Link in bio to book your free consultation!"
                style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
              />
            </div>

            {/* Priority Level */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                Content Priority
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { id: "urgent", label: "🔴 Urgent", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
                  { id: "high", label: "🟠 High", color: "#ea580c", bg: "#fff7ed", border: "#fdba74" },
                  { id: "medium", label: "🔵 Medium", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
                  { id: "low", label: "🟢 Low", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
                ].map((pr) => {
                  const isSelected = priority === pr.id;
                  return (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => setPriority(pr.id)}
                      style={{
                        padding: "8px 6px",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1.5px solid ${isSelected ? pr.color : "#e2e8f0"}`,
                        background: isSelected ? pr.bg : "#ffffff",
                        color: isSelected ? pr.color : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {pr.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workflow Target Stage & Scheduling */}
            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                  Target Workflow Stage
                </label>
                <span style={{ fontSize: "0.72rem", color: "#6366f1", fontWeight: 700 }}>
                  7-Stage Pipeline
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
                {[
                  { id: "script", label: "1. Script (Draft)" },
                  { id: "script_approval", label: "2. Script Review" },
                  { id: "designing", label: "3. Designing" },
                  { id: "review", label: "5. Client Review" },
                  { id: "schedule", label: "6. Post Schedule" },
                  { id: "now", label: "7. Publish Now" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPublishMode(m.id)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      background: publishMode === m.id ? "#0f172a" : "#e2e8f0",
                      color: publishMode === m.id ? "#ffffff" : "#475569",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {(publishMode === "schedule" || publishMode === "now") && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Calendar size={16} color="#4f46e5" />
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600, outline: "none" }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Live Feed Preview */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                <Eye size={16} /> Live Device Feed Preview
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(selectedPlatforms.length > 0
                  ? selectedPlatforms
                  : clientAccounts.length > 0
                  ? [...new Set(clientAccounts.map((a) => a.platform))]
                  : ["instagram", "facebook", "linkedin"]
                ).map((plat) => {
                  const pConfig = PLATFORM_MAP[plat] || { label: plat, icon: "📱" };
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setActivePreviewPlatform(plat)}
                      style={{
                        padding: "4px 9px",
                        borderRadius: 6,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        border: "none",
                        cursor: "pointer",
                        background: activePreviewPlatform === plat ? "#0f172a" : "#f1f5f9",
                        color: activePreviewPlatform === plat ? "#ffffff" : "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>{pConfig.icon}</span>
                      <span>{pConfig.label || plat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mock Phone Frame */}
            <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              
              {/* Profile Header */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.9rem" }}>
                  {selectedClient.name ? selectedClient.name.charAt(0) : "A"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>
                    {selectedClient.name || "Adstra Digital"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    {location ? location : (activePreviewPlatform === "linkedin" ? "Sponsored • 1st" : "Sponsored")}
                  </div>
                </div>
              </div>

              {/* Media Container */}
              <div style={{ width: "100%", height: 260, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {mediaUrl ? (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>
                    <ImageIcon size={36} style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: "0.8rem", margin: 0 }}>No media attached</p>
                  </div>
                )}
              </div>

              {/* Feed Text and Action Strip */}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: 14, marginBottom: 10, color: "#334155" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>❤️ 1.2k</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>💬 148</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>🔁 84</span>
                </div>

                <div style={{ fontSize: "0.84rem", lineHeight: 1.5, color: "#1e293b", maxHeight: 110, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                  <strong style={{ marginRight: 6 }}>{selectedClient.name || "Brand"}</strong>
                  {primaryCaption || "Your engaging post caption will appear here in real-time..."}
                </div>

                {hashtags && (
                  <div style={{ marginTop: 8, fontSize: "0.78rem", color: "#4f46e5", fontWeight: 600 }}>
                    {hashtags}
                  </div>
                )}

                {firstComment && (
                  <div style={{ marginTop: 8, padding: "6px 10px", background: "#f8fafc", borderRadius: 6, fontSize: "0.75rem", color: "#475569" }}>
                    <strong>Pinned Comment:</strong> {firstComment}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="social-modal-footer">
          <button
            onClick={onClose}
            style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <Send size={16} />
            {submitting ? "Saving..." : publishMode === "schedule" ? "Schedule Post" : publishMode === "review" ? "Submit for Client Review" : publishMode === "now" ? "Publish Immediately" : "Save as Draft"}
          </button>
        </div>

      </div>
    </div>
  );
}
