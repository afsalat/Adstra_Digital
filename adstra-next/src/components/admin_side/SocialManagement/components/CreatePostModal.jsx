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
  EyeOff,
  Send,
  Save,
  CheckCircle2,
  Share2,
  AlertTriangle,
  Heart,
  MessageCircle,
  Bookmark,
  Repeat2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  ExternalLink,
  Globe,
  Play,
  Search,
  Music2,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Star,
  Lightbulb,
  Smile,
  Plus,
  Trash2,
  Link2,
  Info,
} from "lucide-react";
import { XIcon, GoogleIcon, TikTokIcon, renderPlatformIcon } from "./PlatformIcons";
import ClientCompanySearchSelect from "./ClientCompanySearchSelect";

const ALL_PLATFORMS = [
  { id: "instagram", label: "Instagram", color: "#e1306c", icon: <Instagram size={14} /> },
  { id: "facebook", label: "Facebook", color: "#1877f2", icon: <Facebook size={14} /> },
  { id: "linkedin", label: "LinkedIn", color: "#0a66c2", icon: <Linkedin size={14} /> },
  { id: "youtube", label: "YouTube", color: "#ff0000", icon: <Youtube size={14} /> },
  { id: "x", label: "X / Twitter", color: "#000000", icon: <XIcon size={13} /> },
  { id: "google_business", label: "Google Business", color: "#0f9d58", icon: <GoogleIcon size={14} /> },
  { id: "tiktok", label: "TikTok", color: "#000000", icon: <TikTokIcon size={14} /> },
];

const PLATFORM_MAP = ALL_PLATFORMS.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {});

function PlatformFeedPreview({
  platform,
  client,
  account,
  primaryCaption,
  hashtags,
  location,
  firstComment,
  mediaUrl,
  postType,
  title,
  carouselCount = 3,
}) {
  const clientName = client?.name || "Adstra Digital";
  const clientInitial = clientName ? clientName.charAt(0).toUpperCase() : "A";
  const accountHandle = account?.username
    ? (account.username.startsWith("@") ? account.username : `@${account.username}`)
    : `@${clientName.toLowerCase().replace(/[^a-z0-9_]/g, "")}`;
  const accountDisplayName = account?.account_name || clientName;

  const renderMedia = (customHeight = 240, rounded = false, aspect = "cover") => {
    if (postType === "text") return null;
    return (
      <div
        style={{
          width: "100%",
          height: customHeight,
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          borderRadius: rounded ? 10 : 0,
        }}
      >
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt="Post Preview"
            style={{ width: "100%", height: "100%", objectFit: aspect }}
          />
        ) : (
          <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>
            <ImageIcon size={34} style={{ marginBottom: 6 }} />
            <p style={{ fontSize: "0.78rem", margin: 0 }}>No media attached</p>
          </div>
        )}

        {postType === "carousel" && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(4px)",
              color: "#ffffff",
              padding: "3px 8px",
              borderRadius: 12,
              fontSize: "0.68rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Layers size={11} /> 1/{carouselCount || 3}
          </div>
        )}

        {(postType === "reel" || postType === "video") && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Play size={20} fill="#ffffff" style={{ marginLeft: 2 }} />
        </div>
      )}
    </div>
  );
};

  // 1. GOOGLE BUSINESS PREVIEW
  if (platform === "google_business") {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #dadce0",
          boxShadow: "0 4px 16px rgba(60,64,67,0.12)",
          overflow: "hidden",
          fontFamily: "'Roboto', system-ui, sans-serif",
        }}
      >
        {/* Google Maps Search Bar Badge */}
        <div
          style={{
            background: "#f8f9fa",
            borderBottom: "1px solid #ebebeb",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.74rem", fontWeight: 700, color: "#1a73e8" }}>
            <GoogleIcon size={16} />
            <span>Google Business Profile</span>
          </div>
          <span
            style={{
              background: "#e8f0fe",
              color: "#1a73e8",
              fontSize: "0.68rem",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 6,
              letterSpacing: 0.4,
            }}
          >
            UPDATE
          </span>
        </div>

        {/* Business Profile Header */}
        <div style={{ padding: "12px 14px 10px", display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#1a73e8",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.95rem",
              boxShadow: "0 2px 6px rgba(26,115,232,0.3)",
            }}
          >
            {clientInitial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#202124", display: "flex", alignItems: "center", gap: 4 }}>
              <span>{accountDisplayName}</span>
              <CheckCircle2 size={13} color="#1a73e8" fill="#1a73e8" />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#5f6368", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
              <span style={{ color: "#e37400", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                <span>4.9</span>
                <span style={{ display: "inline-flex", gap: 1 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="#e37400" color="#e37400" />
                  ))}
                </span>
              </span>
              <span>(128)</span>
              <span>•</span>
              <span>{location || "Digital marketing agency"}</span>
            </div>
            <div style={{ fontSize: "0.68rem", color: "#70757a", marginTop: 1 }}>
              Posted on Google • Just now
            </div>
          </div>
        </div>

        {/* 16:9 Banner Media */}
        <div style={{ padding: "0 14px" }}>
          {renderMedia(190, true, "cover")}
        </div>

        {/* Post Content */}
        <div style={{ padding: "12px 14px 14px" }}>
          {title && (
            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#202124", marginBottom: 6, lineHeight: 1.3 }}>
              {title}
            </div>
          )}

          <div style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "#3c4043", maxHeight: 110, overflowY: "auto", whiteSpace: "pre-wrap" }}>
            {primaryCaption || "Share important updates, new services, product launches, or seasonal promotions directly with customers searching on Google Maps and Google Search..."}
          </div>

          {location && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: "0.74rem", color: "#1a73e8", fontWeight: 600 }}>
              <MapPin size={12} /> {location}
            </div>
          )}

          {/* Google CTA Button */}
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              style={{
                width: "100%",
                background: "#1a73e8",
                color: "#ffffff",
                border: "none",
                borderRadius: 22,
                padding: "9px 16px",
                fontSize: "0.82rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(26,115,232,0.3)",
              }}
            >
              <span>Learn More</span>
              <ExternalLink size={14} />
            </button>
          </div>

          {/* Footer view on Google Search */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f1f3f4", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "#70757a" }}>
            <span>View on Google Maps</span>
            <span style={{ color: "#1a73e8", fontWeight: 600, cursor: "pointer" }}>Share Update</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. FACEBOOK PREVIEW
  if (platform === "facebook") {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #ced0d4",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
          fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#1877f2",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.95rem",
            }}
          >
            {clientInitial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#050505" }}>{accountDisplayName}</span>
              <CheckCircle2 size={13} color="#1877f2" fill="#1877f2" />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#65676b", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
              <span>Sponsored</span>
              <span>·</span>
              <Globe size={11} />
            </div>
          </div>
          <div style={{ color: "#65676b", cursor: "pointer" }}>
            <MoreHorizontal size={18} />
          </div>
        </div>

        {/* Facebook Caption is ABOVE the media */}
        <div style={{ padding: "4px 16px 10px" }}>
          <div style={{ fontSize: "0.85rem", lineHeight: 1.45, color: "#050505", maxHeight: 90, overflowY: "auto", whiteSpace: "pre-wrap" }}>
            {primaryCaption || "Your engaging post caption will appear here in real-time..."}
          </div>
          {hashtags && (
            <div style={{ marginTop: 6, fontSize: "0.78rem", color: "#1877f2", fontWeight: 600 }}>
              {hashtags}
            </div>
          )}
        </div>

        {/* Media Container */}
        {renderMedia(220, false, "cover")}

        {/* Facebook Link Strip */}
        <div
          style={{
            background: "#f0f2f5",
            padding: "10px 14px",
            borderTop: "1px solid #e4e6eb",
            borderBottom: "1px solid #e4e6eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, paddingRight: 10 }}>
            <div style={{ fontSize: "0.68rem", color: "#65676b", textTransform: "uppercase", fontWeight: 600 }}>
              ADSTRADIGITAL.COM
            </div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#050505", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title || clientName}
            </div>
          </div>
          <button
            type="button"
            style={{
              background: "#e4e6eb",
              color: "#050505",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: "0.76rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Learn More
          </button>
        </div>

        {/* Reactions Counter */}
        <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#65676b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#1877f2",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  border: "1.5px solid #ffffff",
                  zIndex: 3,
                }}
              >
                <ThumbsUp size={10} fill="#ffffff" />
              </span>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#e11d48",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  border: "1.5px solid #ffffff",
                  marginLeft: -5,
                  zIndex: 2,
                }}
              >
                <Heart size={10} fill="#ffffff" />
              </span>
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  border: "1.5px solid #ffffff",
                  marginLeft: -5,
                  zIndex: 1,
                }}
              >
                <Smile size={10} fill="#ffffff" />
              </span>
            </div>
            <span>384</span>
          </div>
          <div>48 comments · 16 shares</div>
        </div>

        {/* Actions Strip */}
        <div style={{ borderTop: "1px solid #ced0d4", margin: "0 12px", padding: "6px 0", display: "flex", justifyContent: "space-around" }}>
          <button type="button" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "#65676b", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", padding: "6px 12px", borderRadius: 6 }}>
            <ThumbsUp size={15} /> Like
          </button>
          <button type="button" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "#65676b", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", padding: "6px 12px", borderRadius: 6 }}>
            <MessageCircle size={15} /> Comment
          </button>
          <button type="button" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "#65676b", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", padding: "6px 12px", borderRadius: 6 }}>
            <Share2 size={15} /> Share
          </button>
        </div>
      </div>
    );
  }

  // 3. X / TWITTER PREVIEW
  if (platform === "x" || platform === "twitter") {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #eff3f4",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          padding: "16px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#0f1419",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.95rem",
              flexShrink: 0,
            }}
          >
            {clientInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap", overflow: "hidden" }}>
                <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f1419", whiteSpace: "nowrap" }}>
                  {clientName}
                </span>
                <CheckCircle2 size={13} color="#1d9bf0" fill="#1d9bf0" />
                <span style={{ fontSize: "0.78rem", color: "#536471", whiteSpace: "nowrap" }}>
                  {accountHandle} · Just now
                </span>
              </div>
              <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#0f1419" }}>𝕏</span>
            </div>

            {/* Tweet Text (FIRST!) */}
            <div style={{ marginTop: 8, fontSize: "0.88rem", lineHeight: 1.45, color: "#0f1419", whiteSpace: "pre-wrap" }}>
              {primaryCaption || "What's happening? Share instant company updates, thought leadership, or industry takes with the world..."}
            </div>

            {hashtags && (
              <div style={{ marginTop: 6, fontSize: "0.82rem", color: "#1d9bf0", fontWeight: 500 }}>
                {hashtags}
              </div>
            )}

            {/* Rounded Media Card */}
            <div style={{ marginTop: 12, borderRadius: 14, overflow: "hidden", border: "1px solid #cfd9de" }}>
              {renderMedia(200, false, "cover")}
            </div>

            {/* Views Line */}
            <div style={{ marginTop: 12, fontSize: "0.74rem", color: "#536471" }}>
              11:42 AM · Sep 17, 2026 · <strong style={{ color: "#0f1419" }}>14.8K</strong> Views
            </div>

            <div style={{ height: 1, background: "#eff3f4", margin: "10px 0 8px" }} />

            {/* X Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", color: "#536471", fontSize: "0.74rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <MessageCircle size={15} /> <span>42</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Repeat2 size={15} /> <span>118</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Heart size={15} /> <span>894</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Bookmark size={15} /> <span>76</span>
              </div>
              <div>
                <Share2 size={15} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. LINKEDIN PREVIEW
  if (platform === "linkedin") {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
          fontFamily: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 6,
              background: "#0a66c2",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1rem",
            }}
          >
            {clientInitial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#000000e6" }}>{clientName}</span>
              <span style={{ fontSize: "0.72rem", color: "#00000099" }}>• 1st</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#00000099" }}>14,850 followers</div>
            <div style={{ fontSize: "0.68rem", color: "#00000099", display: "flex", alignItems: "center", gap: 3 }}>
              <span>Promoted</span>
              <span>•</span>
              <Globe size={10} />
            </div>
          </div>
          <button
            type="button"
            style={{
              background: "none",
              border: "1px solid #0a66c2",
              color: "#0a66c2",
              borderRadius: 16,
              padding: "3px 12px",
              fontSize: "0.74rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            + Follow
          </button>
        </div>

        {/* Text is ABOVE Media */}
        <div style={{ padding: "4px 16px 10px" }}>
          <div style={{ fontSize: "0.84rem", lineHeight: 1.5, color: "#000000e6", maxHeight: 95, overflowY: "auto", whiteSpace: "pre-wrap" }}>
            {primaryCaption || "Drive B2B growth, share leadership insights, and connect with key decision-makers across industries..."}
          </div>
          {hashtags && (
            <div style={{ marginTop: 6, fontSize: "0.78rem", color: "#0a66c2", fontWeight: 600 }}>
              {hashtags}
            </div>
          )}
        </div>

        {/* Media */}
        {renderMedia(210, false, "cover")}

        {/* Article/Link Banner */}
        <div style={{ background: "#f3f2ef", padding: "10px 16px", borderBottom: "1px solid #e0e0e0" }}>
          <div style={{ fontSize: "0.68rem", color: "#00000099", textTransform: "uppercase" }}>
            adstradigital.com • 3 min read
          </div>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#000000e6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title || `${clientName} | Strategic Growth Solutions`}
          </div>
        </div>

        {/* LinkedIn Reactions Counter */}
        <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#00000099" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  background: "#0a66c2",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  border: "1.5px solid #ffffff",
                  zIndex: 3,
                }}
              >
                <ThumbsUp size={9} fill="#ffffff" />
              </span>
              <span
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  border: "1.5px solid #ffffff",
                  marginLeft: -4,
                  zIndex: 2,
                }}
              >
                <Lightbulb size={9} fill="#ffffff" />
              </span>
              <span
                style={{
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  background: "#dc2626",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  border: "1.5px solid #ffffff",
                  marginLeft: -4,
                  zIndex: 1,
                }}
              >
                <Heart size={9} fill="#ffffff" />
              </span>
            </div>
            <span>462</span>
          </div>
          <div>38 comments · 14 reposts</div>
        </div>

        {/* Action Buttons */}
        <div style={{ borderTop: "1px solid #e0e0e0", margin: "0 12px", padding: "6px 0", display: "flex", justifyContent: "space-around" }}>
          <button type="button" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "#00000099", fontWeight: 600, fontSize: "0.76rem", cursor: "pointer", padding: "6px 10px", borderRadius: 4 }}>
            <ThumbsUp size={14} /> Like
          </button>
          <button type="button" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "#00000099", fontWeight: 600, fontSize: "0.76rem", cursor: "pointer", padding: "6px 10px", borderRadius: 4 }}>
            <MessageCircle size={14} /> Comment
          </button>
          <button type="button" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "#00000099", fontWeight: 600, fontSize: "0.76rem", cursor: "pointer", padding: "6px 10px", borderRadius: 4 }}>
            <Repeat2 size={14} /> Repost
          </button>
          <button type="button" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: "#00000099", fontWeight: 600, fontSize: "0.76rem", cursor: "pointer", padding: "6px 10px", borderRadius: 4 }}>
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    );
  }

  // 5. YOUTUBE PREVIEW
  if (platform === "youtube") {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e5e5e5",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          padding: "16px",
          fontFamily: "'Roboto', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ff0000",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.95rem",
            }}
          >
            {clientInitial}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f0f0f", display: "flex", alignItems: "center", gap: 4 }}>
              <span>{clientName}</span>
              <CheckCircle2 size={12} color="#606060" fill="#606060" />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#606060" }}>Community post • 2 hours ago</div>
          </div>
          <div style={{ color: "#606060" }}>
            <MoreHorizontal size={18} />
          </div>
        </div>

        {/* Text is ABOVE media */}
        <div style={{ margin: "12px 0 10px", fontSize: "0.85rem", lineHeight: 1.45, color: "#0f0f0f", whiteSpace: "pre-wrap" }}>
          {primaryCaption || "Stay connected with your YouTube subscribers and audience through community updates, polls, and video releases..."}
        </div>
        {hashtags && (
          <div style={{ marginBottom: 10, fontSize: "0.78rem", color: "#065fd4", fontWeight: 500 }}>
            {hashtags}
          </div>
        )}

        {/* 16:9 Thumbnail Media */}
        <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e5e5" }}>
          {renderMedia(200, false, "cover")}
        </div>

        {/* YouTube Community Action Bar */}
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 20, color: "#606060", fontSize: "0.78rem", fontWeight: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ThumbsUp size={16} /> <span>2.4K</span>
          </div>
          <div>
            <ThumbsDown size={16} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MessageCircle size={16} /> <span>168</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <Share2 size={16} /> <span>Share</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. TIKTOK PREVIEW
  if (platform === "tiktok") {
    return (
      <div
        style={{
          background: "#000000",
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          overflow: "hidden",
          position: "relative",
          minHeight: 440,
          color: "#ffffff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Full-height Media */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
          {renderMedia(440, false, "cover")}
        </div>

        {/* Top Header */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
          }}
        >
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ff0050", background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 4 }}>
            LIVE
          </span>
          <div style={{ display: "flex", gap: 14, fontSize: "0.85rem", fontWeight: 700 }}>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Following</span>
            <span style={{ color: "#ffffff", borderBottom: "2px solid #ffffff", paddingBottom: 2 }}>For You</span>
          </div>
          <Search size={16} color="#ffffff" />
        </div>

        {/* Right Floating Stack */}
        <div
          style={{
            position: "absolute",
            right: 12,
            bottom: 70,
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Avatar with plus badge */}
          <div style={{ position: "relative" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", border: "2px solid #ffffff", background: "#ff0050", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem" }}>
              {clientInitial}
            </div>
            <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "#fe2c55", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 900 }}>
              +
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <Heart size={24} fill="#ffffff" color="#ffffff" />
            <div style={{ fontSize: "0.68rem", fontWeight: 700, marginTop: 2 }}>24.8K</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <MessageCircle size={24} fill="#ffffff" color="#ffffff" />
            <div style={{ fontSize: "0.68rem", fontWeight: 700, marginTop: 2 }}>1,420</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <Bookmark size={24} fill="#ffffff" color="#ffffff" />
            <div style={{ fontSize: "0.68rem", fontWeight: 700, marginTop: 2 }}>950</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <Share2 size={24} color="#ffffff" />
            <div style={{ fontSize: "0.68rem", fontWeight: 700, marginTop: 2 }}>Share</div>
          </div>

          {/* Vinyl record spinning */}
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#222", border: "4px solid #111", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Music2 size={14} color="#ffffff" />
          </div>
        </div>

        {/* Bottom Content Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            padding: "24px 70px 14px 14px",
            background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#ffffff" }}>
            {accountHandle}
          </div>
          <div style={{ fontSize: "0.78rem", lineHeight: 1.35, color: "#ffffff", marginTop: 4, maxHeight: 60, overflowY: "auto" }}>
            {primaryCaption || "Create viral short-form video hooks that capture attention instantly..."}
          </div>
          <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#ffffff", marginTop: 4 }}>
            #fyp #viral {hashtags}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
            <Music2 size={12} />
            <span>Original Sound - {clientName}</span>
          </div>
        </div>
      </div>
    );
  }

  // 7. DEFAULT / INSTAGRAM PREVIEW
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Profile Header with Gradient Ring */}
      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f1f5f9" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
            padding: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#ffffff",
              padding: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.85rem",
              }}
            >
              {clientInitial}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#262626", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {accountHandle.replace(/^@/, "")}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#8e8e8e" }}>
            {location || "Sponsored"}
          </div>
        </div>

        <div style={{ color: "#262626", cursor: "pointer" }}>
          <MoreHorizontal size={16} />
        </div>
      </div>

      {/* Media */}
      {renderMedia(260, false, "cover")}

      {/* Instagram Actions Strip */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 14, color: "#262626" }}>
            <Heart size={22} style={{ cursor: "pointer" }} />
            <MessageCircle size={22} style={{ cursor: "pointer" }} />
            <Send size={20} style={{ cursor: "pointer" }} />
          </div>
          <Bookmark size={22} color="#262626" style={{ cursor: "pointer" }} />
        </div>

        {/* Likes */}
        <div style={{ fontSize: "0.78rem", color: "#262626", marginBottom: 6 }}>
          Liked by <strong>tech_trends</strong> and <strong>1,248 others</strong>
        </div>

        {/* Caption */}
        <div style={{ fontSize: "0.82rem", lineHeight: 1.45, color: "#262626", maxHeight: 95, overflowY: "auto", whiteSpace: "pre-wrap" }}>
          <strong style={{ marginRight: 6 }}>{accountHandle.replace(/^@/, "")}</strong>
          {primaryCaption || "Your engaging post caption will appear here in real-time..."}
        </div>

        {hashtags && (
          <div style={{ marginTop: 6, fontSize: "0.78rem", color: "#00376b", fontWeight: 600 }}>
            {hashtags}
          </div>
        )}

        <div style={{ marginTop: 6, fontSize: "0.74rem", color: "#8e8e8e", cursor: "pointer" }}>
          View all 24 comments
        </div>

        {firstComment && (
          <div style={{ marginTop: 6, padding: "6px 10px", background: "#f8fafc", borderRadius: 6, fontSize: "0.74rem", color: "#475569" }}>
            <strong>Pinned:</strong> {firstComment}
          </div>
        )}

        <div style={{ marginTop: 6, fontSize: "0.65rem", color: "#8e8e8e", textTransform: "uppercase", letterSpacing: 0.4 }}>
          2 HOURS AGO
        </div>
      </div>
    </div>
  );
}

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
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Format-specific dynamic states
  const initialMediaUrls = Array.isArray(initialData?.media_urls) ? initialData.media_urls : [];
  const [imageAspect, setImageAspect] = useState("1:1");
  const [carouselAspect, setCarouselAspect] = useState("4:5");
  const [carouselSlides, setCarouselSlides] = useState(() => {
    if (initialData?.post_type === "carousel" && initialMediaUrls.length > 0) {
      return initialMediaUrls.map((u, idx) => ({
        url: u || "",
        note: `Slide ${idx + 1}`
      }));
    }
    return [
      { url: initialMediaUrls[0] || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80", note: "Cover Slide: High Impact Hook" },
      { url: initialMediaUrls[1] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80", note: "Slide 2: Core Insight / Data" },
      { url: initialMediaUrls[2] || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80", note: "Slide 3: Actionable Call to Action" },
    ];
  });
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Reel / Short Video states
  const [reelDuration, setReelDuration] = useState("30s");
  const [reelAudioTrack, setReelAudioTrack] = useState("");
  const [reelCoverUrl, setReelCoverUrl] = useState(
    initialData?.post_type === "reel" && initialMediaUrls[1] ? initialMediaUrls[1] : ""
  );

  // Long Video states
  const [videoHeadline, setVideoHeadline] = useState(initialData?.title || "");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState(
    initialData?.post_type === "video" && initialMediaUrls[1] ? initialMediaUrls[1] : ""
  );
  const [videoResolution, setVideoResolution] = useState("1080p");

  // Text post states
  const [linkUrl, setLinkUrl] = useState("");

  // Intelligent format change handler
  const handleFormatChange = (newFormat) => {
    setPostType(newFormat);
    if (newFormat === "text") {
      // Filter out platforms that do not support text-only posts without media
      const textSupported = selectedPlatforms.filter((p) => p !== "instagram" && p !== "tiktok" && p !== "youtube");
      if (textSupported.length === 0) {
        setSelectedPlatforms(["facebook", "linkedin", "x"]);
        setActivePreviewPlatform("facebook");
      } else {
        setSelectedPlatforms(textSupported);
        if (!textSupported.includes(activePreviewPlatform)) {
          setActivePreviewPlatform(textSupported[0] || "facebook");
        }
      }
    } else if (newFormat === "reel") {
      const shortVideoSupported = ["instagram", "facebook", "tiktok", "youtube"];
      const hasShortVideoPlat = selectedPlatforms.some((p) => shortVideoSupported.includes(p));
      if (!hasShortVideoPlat) {
        setSelectedPlatforms(["instagram", "facebook", "tiktok"]);
        setActivePreviewPlatform("instagram");
      } else if (!shortVideoSupported.includes(activePreviewPlatform)) {
        setActivePreviewPlatform("instagram");
      }
    } else if (newFormat === "video") {
      const longVideoSupported = ["youtube", "facebook", "linkedin"];
      const hasLongVideoPlat = selectedPlatforms.some((p) => longVideoSupported.includes(p));
      if (!hasLongVideoPlat) {
        setSelectedPlatforms(["youtube", "facebook", "linkedin"]);
        setActivePreviewPlatform("youtube");
      } else if (!longVideoSupported.includes(activePreviewPlatform)) {
        setActivePreviewPlatform("youtube");
      }
    } else {
      if (selectedPlatforms.length === 0) {
        setSelectedPlatforms(["instagram", "facebook", "linkedin"]);
        setActivePreviewPlatform("instagram");
      }
    }
  };

  // Carousel slide helpers
  const handleAddSlide = () => {
    if (carouselSlides.length >= 10) return;
    const newIdx = carouselSlides.length + 1;
    setCarouselSlides([
      ...carouselSlides,
      { url: "", note: `Slide ${newIdx}: Key Takeaway` }
    ]);
    setActiveSlideIndex(carouselSlides.length);
  };

  const handleRemoveSlide = (idxToRemove) => {
    if (carouselSlides.length <= 2) return;
    const updated = carouselSlides.filter((_, i) => i !== idxToRemove);
    setCarouselSlides(updated);
    if (activeSlideIndex >= updated.length) {
      setActiveSlideIndex(updated.length - 1);
    }
  };

  const handleUpdateSlideUrl = (index, newUrl) => {
    setCarouselSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], url: newUrl };
      return copy;
    });
  };

  const handleUpdateSlideNote = (index, newNote) => {
    setCarouselSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], note: newNote };
      return copy;
    });
  };

  // Effective preview media URL and carousel count for live preview
  const previewMediaUrl = useMemo(() => {
    if (postType === "text") return "";
    if (postType === "carousel") {
      return carouselSlides[activeSlideIndex]?.url || carouselSlides[0]?.url || mediaUrl;
    }
    if (postType === "reel") {
      return reelCoverUrl || mediaUrl;
    }
    if (postType === "video") {
      return videoThumbnailUrl || mediaUrl;
    }
    return mediaUrl;
  }, [postType, carouselSlides, activeSlideIndex, mediaUrl, reelCoverUrl, videoThumbnailUrl]);

  const previewCarouselCount = useMemo(() => {
    if (postType !== "carousel") return 1;
    return Math.max(2, carouselSlides.filter((s) => s.url && s.url.trim()).length || carouselSlides.length);
  }, [postType, carouselSlides]);

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
        const next = selectedPlatforms.filter((p) => p !== pId);
        setSelectedPlatforms(next);
        if (activePreviewPlatform === pId) {
          setActivePreviewPlatform(next[0] || "instagram");
        }
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, pId]);
      setActivePreviewPlatform(pId);
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

    let finalMediaUrls = [];
    if (postType === "text") {
      finalMediaUrls = [];
    } else if (postType === "carousel") {
      finalMediaUrls = carouselSlides.map((s) => s.url.trim()).filter(Boolean);
      if (finalMediaUrls.length === 0 && mediaUrl.trim()) {
        finalMediaUrls = [mediaUrl.trim()];
      }
    } else if (postType === "reel") {
      finalMediaUrls = [mediaUrl.trim(), reelCoverUrl.trim()].filter(Boolean);
    } else if (postType === "video") {
      finalMediaUrls = [mediaUrl.trim(), videoThumbnailUrl.trim()].filter(Boolean);
    } else {
      finalMediaUrls = mediaUrl.trim() ? [mediaUrl.trim()] : [];
    }

    const finalTitle = (postType === "video" && videoHeadline.trim())
      ? videoHeadline.trim()
      : title.trim() || primaryCaption.slice(0, 40) || scriptNotes.slice(0, 40) || `${selectedClient?.name || 'Client'} Post`;

    let finalDesignerNotes = designerNotes.trim();
    if (postType === "image" && imageAspect) {
      if (!finalDesignerNotes.includes("Aspect:")) {
        finalDesignerNotes = `[Aspect: ${imageAspect}] ${finalDesignerNotes}`.trim();
      }
    } else if (postType === "carousel") {
      if (!finalDesignerNotes.includes("Carousel:")) {
        finalDesignerNotes = `[Carousel: ${carouselSlides.length} slides, ${carouselAspect}] ${finalDesignerNotes}`.trim();
      }
    } else if (postType === "reel") {
      if (!finalDesignerNotes.includes("Reel:")) {
        finalDesignerNotes = `[Reel: ${reelDuration}${reelAudioTrack ? `, Audio: ${reelAudioTrack}` : ""}] ${finalDesignerNotes}`.trim();
      }
    } else if (postType === "video") {
      if (!finalDesignerNotes.includes("Video:")) {
        finalDesignerNotes = `[Video: ${videoResolution}] ${finalDesignerNotes}`.trim();
      }
    } else if (postType === "text" && linkUrl.trim()) {
      if (!finalDesignerNotes.includes("Link:")) {
        finalDesignerNotes = `[Link: ${linkUrl.trim()}] ${finalDesignerNotes}`.trim();
      }
    }

    const payload = {
      client_profile: clientId,
      title: finalTitle,
      post_type: postType,
      platforms: selectedPlatforms,
      priority,
      primary_caption: primaryCaption,
      script_notes: scriptNotes,
      designer_notes: finalDesignerNotes,
      hashtags,
      location,
      first_comment: firstComment,
      media_urls: finalMediaUrls,
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
      <div
        className="social-modal-content"
        style={{
          maxWidth: showPreview ? 1080 : 760,
          maxHeight: "94vh",
          transition: "max-width 0.2s ease",
        }}
      >
        
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
            {/* Live Feed Preview Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 10,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                border: showPreview ? "1.5px solid #4f46e5" : "1.5px solid #cbd5e1",
                background: showPreview ? "#eef2ff" : "#ffffff",
                color: showPreview ? "#4f46e5" : "#475569",
                boxShadow: showPreview ? "0 2px 8px rgba(79, 70, 229, 0.15)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
              <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
            </button>

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

        {/* Body: Two columns if showPreview is true, single column if false */}
        <div
          className="social-modal-body"
          style={{
            display: "grid",
            gridTemplateColumns: showPreview ? "1.25fr 0.95fr" : "1fr",
            gap: 28,
          }}
        >
          
          {/* Left Column: Form Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* Client Picker & Post Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Client Company *
                </label>
                <ClientCompanySearchSelect
                  clients={clients}
                  value={clientId}
                  onChange={(val) => handleClientChange(val)}
                  allowAll={false}
                  placeholder="Search & select client company..."
                  variant="form"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Post Format
                </label>
                <select
                  value={postType}
                  onChange={(e) => handleFormatChange(e.target.value)}
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

            {/* Visual Format Quick Switcher Tabs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 5,
                padding: "3px",
                background: "#f1f5f9",
                borderRadius: 10,
              }}
            >
              {[
                { id: "image", label: "Image", icon: <ImageIcon size={13} />, desc: "1:1 or 4:5 Graphic Post" },
                { id: "carousel", label: "Carousel", icon: <Layers size={13} />, desc: "Multi-slide Swipe Deck" },
                { id: "reel", label: "Reel / Short", icon: <Smartphone size={13} />, desc: "9:16 Vertical Video" },
                { id: "video", label: "Video", icon: <Video size={13} />, desc: "16:9 Landscape Video" },
                { id: "text", label: "Text Only", icon: <FileText size={13} />, desc: "Feed Status & Notice" },
              ].map((fmt) => {
                const isSelected = postType === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handleFormatChange(fmt.id)}
                    title={fmt.desc}
                    style={{
                      padding: "6px 4px",
                      borderRadius: 8,
                      border: isSelected ? "1.5px solid #4f46e5" : "1.5px solid transparent",
                      background: isSelected ? "#ffffff" : "transparent",
                      color: isSelected ? "#4f46e5" : "#64748b",
                      boxShadow: isSelected ? "0 2px 6px rgba(79, 70, 229, 0.12)" : "none",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{fmt.icon}</span>
                    <span>{fmt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Platform Selector in Exactly 2 Clean Lines */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                    Publish To Platforms:
                  </label>
                  {postType === "text" ? (
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#0284c7", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "1px 6px", borderRadius: 6 }}>
                      Text-ready channels
                    </span>
                  ) : postType === "reel" ? (
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#db2777", background: "#fdf2f8", border: "1px solid #fbcfe8", padding: "1px 6px", borderRadius: 6 }}>
                      9:16 Short-form channels
                    </span>
                  ) : postType === "carousel" ? (
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "1px 6px", borderRadius: 6 }}>
                      Swipeable deck channels
                    </span>
                  ) : null}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    {selectedPlatforms.length} of {ALL_PLATFORMS.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPlatforms.length === ALL_PLATFORMS.length) {
                        setSelectedPlatforms(["instagram"]);
                        setActivePreviewPlatform("instagram");
                      } else {
                        setSelectedPlatforms(ALL_PLATFORMS.map((p) => p.id));
                      }
                    }}
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
                    {selectedPlatforms.length === ALL_PLATFORMS.length ? "Reset" : "Select All"}
                  </button>
                </div>
              </div>

              {/* Line 1: 4 platforms */}
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                {[
                  ALL_PLATFORMS.find((p) => p.id === "google_business") || ALL_PLATFORMS[5],
                  ALL_PLATFORMS.find((p) => p.id === "instagram") || ALL_PLATFORMS[0],
                  ALL_PLATFORMS.find((p) => p.id === "x") || ALL_PLATFORMS[4],
                  ALL_PLATFORMS.find((p) => p.id === "youtube") || ALL_PLATFORMS[3],
                ].map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  const matchingAcc = clientAccounts.find((a) => a.platform === p.id);
                  const isTextModeMediaDisabled = postType === "text" && (p.id === "instagram" || p.id === "youtube");
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (isTextModeMediaDisabled && !active) {
                          alert(`${p.label} requires an image or video to publish. Switch Post Format to Single Image or Reel to publish to ${p.label}.`);
                        }
                        togglePlatform(p.id);
                      }}
                      title={
                        isTextModeMediaDisabled
                          ? `${p.label} requires media. Not recommended for text-only posts.`
                          : matchingAcc
                          ? `Connected: ${matchingAcc.username || matchingAcc.account_name}`
                          : `${p.label} (Draft channel)`
                      }
                      style={{
                        flex: "1 1 0",
                        minWidth: 0,
                        padding: "6px 8px",
                        borderRadius: 8,
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1.5px solid ${active ? p.color : "#cbd5e1"}`,
                        background: active
                          ? p.id === "instagram"
                            ? "#fdf2f8"
                            : p.id === "google_business"
                            ? "#f0fdf4"
                            : p.id === "youtube"
                            ? "#fef2f2"
                            : "#f8fafc"
                          : "#ffffff",
                        color: active
                          ? p.color === "#000000"
                            ? "#0f172a"
                            : p.color
                          : "#64748b",
                        opacity: isTextModeMediaDisabled && !active ? 0.65 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden" }}>
                        <span style={{ fontSize: "0.92rem", flexShrink: 0 }}>{p.icon}</span>
                        <div style={{ textAlign: "left", minWidth: 0, overflow: "hidden" }}>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.74rem", fontWeight: 700 }}>
                            {p.label}
                          </div>
                          {isTextModeMediaDisabled ? (
                            <div style={{ fontSize: "0.6rem", color: "#e11d48", fontWeight: 600, lineHeight: 1 }}>
                              Req. media
                            </div>
                          ) : matchingAcc?.username ? (
                            <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1 }}>
                              {matchingAcc.username}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {active && (
                        <CheckCircle2
                          size={12}
                          color={p.color === "#000000" ? "#0f172a" : p.color}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Line 2: 3 platforms */}
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  ALL_PLATFORMS.find((p) => p.id === "facebook") || ALL_PLATFORMS[1],
                  ALL_PLATFORMS.find((p) => p.id === "linkedin") || ALL_PLATFORMS[2],
                  ALL_PLATFORMS.find((p) => p.id === "tiktok") || ALL_PLATFORMS[6],
                ].map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  const matchingAcc = clientAccounts.find((a) => a.platform === p.id);
                  const isTextModeMediaDisabled = postType === "text" && p.id === "tiktok";
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (isTextModeMediaDisabled && !active) {
                          alert(`TikTok requires a video to publish. Switch Post Format to Reel / Short Video to publish to TikTok.`);
                        }
                        togglePlatform(p.id);
                      }}
                      title={
                        isTextModeMediaDisabled
                          ? `TikTok requires video media. Not recommended for text posts.`
                          : matchingAcc
                          ? `Connected: ${matchingAcc.username || matchingAcc.account_name}`
                          : `${p.label} (Draft channel)`
                      }
                      style={{
                        flex: "1 1 0",
                        minWidth: 0,
                        padding: "6px 8px",
                        borderRadius: 8,
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1.5px solid ${active ? p.color : "#cbd5e1"}`,
                        background: active
                          ? p.id === "facebook" || p.id === "linkedin"
                            ? "#eff6ff"
                            : "#f8fafc"
                          : "#ffffff",
                        color: active
                          ? p.color === "#000000"
                            ? "#0f172a"
                            : p.color
                          : "#64748b",
                        opacity: isTextModeMediaDisabled && !active ? 0.65 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 5,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden" }}>
                        <span style={{ fontSize: "0.92rem", flexShrink: 0 }}>{p.icon}</span>
                        <div style={{ textAlign: "left", minWidth: 0, overflow: "hidden" }}>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.74rem", fontWeight: 700 }}>
                            {p.label}
                          </div>
                          {isTextModeMediaDisabled ? (
                            <div style={{ fontSize: "0.6rem", color: "#e11d48", fontWeight: 600, lineHeight: 1 }}>
                              Req. video
                            </div>
                          ) : matchingAcc?.username ? (
                            <div style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1 }}>
                              {matchingAcc.username}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {active && (
                        <CheckCircle2
                          size={12}
                          color={p.color === "#000000" ? "#0f172a" : p.color}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Title / Campaign Identifier */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                  {postType === "video"
                    ? "Public Video Headline / Title (YouTube & Facebook CTR Title) *"
                    : postType === "reel"
                    ? "Reel Hook Title / Concept Identifier"
                    : postType === "carousel"
                    ? "Carousel Title / Deck Topic"
                    : postType === "text"
                    ? "Announcement Subject / Topic"
                    : "Internal Title / Campaign Identifier"}
                </label>
                {postType === "video" && (
                  <span style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 700 }}>
                    Public Headline
                  </span>
                )}
              </div>
              <input
                type="text"
                value={postType === "video" ? videoHeadline : title}
                onChange={(e) => {
                  if (postType === "video") setVideoHeadline(e.target.value);
                  else setTitle(e.target.value);
                }}
                placeholder={
                  postType === "video"
                    ? "e.g. Complete Guide to B2B SaaS Growth in 2026 (Full Masterclass)"
                    : postType === "reel"
                    ? "e.g. 30s Viral Reel: 3 Marketing Myths Debunked"
                    : postType === "carousel"
                    ? "e.g. 7 Slide Growth Blueprint for Service Businesses"
                    : postType === "text"
                    ? "e.g. Office Holiday Schedule & Client Support Hours"
                    : "e.g. Q3 Cloud Scalability Banner #2"
                }
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none" }}
              />
            </div>

            {/* Script Notes / Hook (Stage 1) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4f46e5" }}>
                  {postType === "reel"
                    ? "1. 3-Second Hook & Reel Scene Breakdown (Stage 1: Script)"
                    : postType === "video"
                    ? "1. Video Script, Outline & Chapter Timestamps (Stage 1: Script)"
                    : postType === "carousel"
                    ? "1. Carousel Slide-by-Slide Outline & Narrative (Stage 1: Script)"
                    : postType === "text"
                    ? "1. Key Talking Points & Announcement Notes (Stage 1: Script)"
                    : "1. Visual Concept, Headline & Copy Notes (Stage 1: Script)"}
                </label>
                <span style={{ fontSize: "0.72rem", color: "#6366f1", fontWeight: 600 }}>
                  Stage 1: Script
                </span>
              </div>
              <textarea
                rows={postType === "video" || postType === "carousel" ? 3 : 2}
                value={scriptNotes}
                onChange={(e) => setScriptNotes(e.target.value)}
                placeholder={
                  postType === "reel"
                    ? "[0:00-0:03 Hook] Grab attention with bold question | [0:04-0:20] Demonstrate solution | [0:20-0:30 CTA] Comment 'GUIDE' below..."
                    : postType === "video"
                    ? "00:00 Intro & Problem Hook | 03:15 Step 1 Strategy | 09:30 Live Walkthrough | 18:00 Key Takeaways & CTA..."
                    : postType === "carousel"
                    ? "Slide 1: Hook cover question | Slide 2-4: Core value points | Slide 5: Summary checklist | Slide 6: Follow & Save CTA..."
                    : postType === "text"
                    ? "Core message points, bullet points, official company statement, or policy announcement..."
                    : "Visual theme, headline text to render on image, primary value prop, and call-to-action angle..."
                }
                style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", background: "#f8fafc" }}
              />
            </div>

            {/* Primary Caption */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                  {postType === "text"
                    ? "Post Text & Announcement Content *"
                    : postType === "reel"
                    ? "Reel Caption & Engagement Hook *"
                    : postType === "carousel"
                    ? "Carousel Companion Caption *"
                    : postType === "video"
                    ? "Video Description & Caption *"
                    : "Primary Caption *"}
                </label>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {primaryCaption.length} chars
                </span>
              </div>
              <textarea
                rows={postType === "text" ? 5 : postType === "video" ? 4 : 3}
                value={primaryCaption}
                onChange={(e) => setPrimaryCaption(e.target.value)}
                placeholder={
                  postType === "text"
                    ? "Write your complete post announcement here... (Supports paragraphs, bullet points, and links)"
                    : postType === "reel"
                    ? "Engaging caption with curiosity gap. Ask a question to trigger comments (English or Malayalam)..."
                    : postType === "carousel"
                    ? "Write the caption that accompanies the carousel. Encourage users to swipe through all slides and bookmark for later..."
                    : postType === "video"
                    ? "Full video description, links mentioned in video, timestamps, and call to action..."
                    : "Write your engaging caption here (English or Malayalam)..."
                }
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none", resize: "vertical", lineHeight: 1.5 }}
              />
            </div>

            {/* Hashtags & Location Tag */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Hashtags
                </label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder={
                    postType === "text"
                      ? "#CompanyUpdate #AdstraDigital #BusinessNews"
                      : postType === "reel"
                      ? "#ReelsInstagram #GrowthHacks #ViralMarketing"
                      : "#AdstraDigital #VorionNexus #KeralaBusiness"
                  }
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

            {/* DYNAMIC STAGE 3: Creative Design Brief & Assets (Format Tailored) */}
            {postType === "text" ? (
              /* Text Post: Clean Mode Panel with No Image/Video clutter */
              <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FileText size={16} color="#475569" />
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b" }}>
                      3. Text Post Configuration (No Media File Required)
                    </label>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700, background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "2px 8px", borderRadius: 6 }}>
                    Direct Status
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#f1f5f9", padding: "10px 12px", borderRadius: 8, fontSize: "0.78rem", color: "#475569", lineHeight: 1.45 }}>
                  <Info size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Text Mode Active:</strong> No graphic banner or video upload required. Your text content will publish directly as a clean feed status on Facebook, LinkedIn, X, and Google Business.
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Destination Link / Article URL (Optional)
                  </label>
                  <div style={{ position: "relative" }}>
                    <Link2 size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://adstradigital.com/announcements/q3-update"
                      style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                    />
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 3, display: "block" }}>
                    Platforms like LinkedIn and Facebook will automatically generate a link preview card with rich metadata from this URL.
                  </span>
                </div>
              </div>
            ) : postType === "image" ? (
              /* Single Image Post: Image Studio with Aspect Ratio & Designer Brief */
              <div style={{ background: "#fdf4ff", border: "1.5px solid #f5d0fe", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ImageIcon size={16} color="#a855f7" />
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#86198f" }}>
                      3. Single Image Creative & Graphic Brief
                    </label>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#a855f7", fontWeight: 700, background: "#fae8ff", border: "1px solid #f0abfc", padding: "2px 8px", borderRadius: 6 }}>
                    Stage 3: Designing
                  </span>
                </div>

                {/* Aspect Ratio Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#701a75", marginBottom: 4 }}>
                    Target Graphic Aspect Ratio:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {[
                      { id: "1:1", label: "1:1 Square", dims: "1080 × 1080 (Feed Standard)" },
                      { id: "4:5", label: "4:5 Portrait", dims: "1080 × 1350 (Max Mobile)" },
                      { id: "16:9", label: "16:9 Banner", dims: "1200 × 628 (LinkedIn/X)" },
                    ].map((asp) => (
                      <button
                        key={asp.id}
                        type="button"
                        onClick={() => setImageAspect(asp.id)}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 8,
                          border: imageAspect === asp.id ? "1.5px solid #a855f7" : "1px solid #e9d5ff",
                          background: imageAspect === asp.id ? "#86198f" : "#ffffff",
                          color: imageAspect === asp.id ? "#ffffff" : "#701a75",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>{asp.label}</span>
                        <span style={{ fontSize: "0.64rem", opacity: 0.85 }}>{asp.dims}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL with thumbnail preview */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#701a75", marginBottom: 4 }}>
                    Image Creative URL (CDN / Media Library / Storage):
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or client asset link"
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e9d5ff", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                    />
                    {mediaUrl && (
                      <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", border: "1px solid #d8b4fe", flexShrink: 0 }}>
                        <img src={mediaUrl} alt="Thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Graphic Designer Brief */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#701a75", marginBottom: 4 }}>
                    Graphic Designer Brief & Style Instructions:
                  </label>
                  <input
                    type="text"
                    value={designerNotes}
                    onChange={(e) => setDesignerNotes(e.target.value)}
                    placeholder="e.g. Bold headline top left, cyan gradient accents, client logo top-right, CTA button bottom..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e9d5ff", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                  />
                </div>
              </div>
            ) : postType === "carousel" ? (
              /* Carousel Slides: Dedicated Multi-Slide Deck Manager */
              <div style={{ background: "#f5f3ff", border: "1.5px solid #ddd6fe", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Layers size={16} color="#6366f1" />
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4338ca" }}>
                      3. Carousel Slide Deck Manager ({carouselSlides.length} Slides)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSlide}
                    disabled={carouselSlides.length >= 10}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      padding: "4px 9px",
                      borderRadius: 6,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={12} /> Add Slide
                  </button>
                </div>

                {/* Slide Navigation Pills */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {carouselSlides.map((slide, idx) => {
                    const isActive = activeSlideIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlideIndex(idx)}
                        style={{
                          padding: "5px 9px",
                          borderRadius: 6,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: isActive ? "1.5px solid #4f46e5" : "1px solid #cbd5e1",
                          background: isActive ? "#4f46e5" : "#ffffff",
                          color: isActive ? "#ffffff" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>Slide {idx + 1}</span>
                        {idx === 0 ? (
                          <span style={{ opacity: 0.85, fontSize: "0.62rem" }}>(Cover)</span>
                        ) : idx === carouselSlides.length - 1 ? (
                          <span style={{ opacity: 0.85, fontSize: "0.62rem" }}>(CTA)</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Active Slide Editor Box */}
                <div style={{ background: "#ffffff", border: "1px solid #c7d2fe", borderRadius: 8, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#3730a3" }}>
                      Editing Slide {activeSlideIndex + 1} of {carouselSlides.length}: {activeSlideIndex === 0 ? "Hook Cover Slide" : activeSlideIndex === carouselSlides.length - 1 ? "CTA / Follow Slide" : "Value Slide"}
                    </span>
                    {carouselSlides.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(activeSlideIndex)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={12} /> Remove Slide
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      value={carouselSlides[activeSlideIndex]?.url || ""}
                      onChange={(e) => handleUpdateSlideUrl(activeSlideIndex, e.target.value)}
                      placeholder={`Slide ${activeSlideIndex + 1} Image URL...`}
                      style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: "1px solid #c7d2fe", fontSize: "0.82rem", outline: "none" }}
                    />
                    {carouselSlides[activeSlideIndex]?.url && (
                      <div style={{ width: 32, height: 32, borderRadius: 4, overflow: "hidden", border: "1px solid #818cf8", flexShrink: 0 }}>
                        <img src={carouselSlides[activeSlideIndex].url} alt="Slide preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={carouselSlides[activeSlideIndex]?.note || ""}
                    onChange={(e) => handleUpdateSlideNote(activeSlideIndex, e.target.value)}
                    placeholder={`Slide ${activeSlideIndex + 1} On-Slide Headline / Visual Content Note...`}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #c7d2fe", fontSize: "0.82rem", outline: "none" }}
                  />
                </div>

                {/* Carousel Designer Instructions */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#3730a3", marginBottom: 4 }}>
                    Carousel Deck Continuity & Designer Instructions:
                  </label>
                  <input
                    type="text"
                    value={designerNotes}
                    onChange={(e) => setDesignerNotes(e.target.value)}
                    placeholder="e.g. 4:5 vertical cards, swipe arrow on right edge, page numbering (1/5), cohesive color palette..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #c7d2fe", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                  />
                </div>
              </div>
            ) : postType === "reel" ? (
              /* Reel / Short Video: 9:16 Vertical Video Studio */
              <div style={{ background: "#fff1f2", border: "1.5px solid #fecdd3", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Smartphone size={16} color="#e11d48" />
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9f1239" }}>
                      3. Reel / Short Video Asset & Motion Brief (9:16 Vertical)
                    </label>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#e11d48", fontWeight: 700, background: "#ffe4e6", border: "1px solid #fda4af", padding: "2px 8px", borderRadius: 6 }}>
                    Reels & Shorts
                  </span>
                </div>

                {/* Target Duration Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                    Target Duration:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {[
                      { id: "15s", label: "15s Quick Hook" },
                      { id: "30s", label: "30s Recommended" },
                      { id: "60s", label: "60s In-depth" },
                      { id: "90s", label: "90s Max Reel" },
                    ].map((dur) => (
                      <button
                        key={dur.id}
                        type="button"
                        onClick={() => setReelDuration(dur.id)}
                        style={{
                          padding: "6px 4px",
                          borderRadius: 8,
                          border: reelDuration === dur.id ? "1.5px solid #e11d48" : "1px solid #fecdd3",
                          background: reelDuration === dur.id ? "#e11d48" : "#ffffff",
                          color: reelDuration === dur.id ? "#ffffff" : "#9f1239",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                    Reel Video Stream / File URL (.mp4 or cloud drive link):
                  </label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/.../reel.mp4"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fda4af", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                  />
                </div>

                {/* Custom Cover / Profile Grid Thumbnail */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#9f1239" }}>
                      Custom Reel Cover / Feed Thumbnail URL (1080 × 1920 with 1:1 safe center):
                    </label>
                    <span style={{ fontSize: "0.68rem", color: "#e11d48", fontWeight: 600 }}>
                      Grid Alignment
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      value={reelCoverUrl}
                      onChange={(e) => setReelCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... custom cover image"
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #fda4af", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                    />
                    {reelCoverUrl && (
                      <div style={{ width: 26, height: 38, borderRadius: 4, overflow: "hidden", border: "1px solid #f43f5e", flexShrink: 0 }}>
                        <img src={reelCoverUrl} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Audio / Music Track */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                    Trending Audio / Music Track:
                  </label>
                  <div style={{ position: "relative" }}>
                    <Music2 size={14} color="#e11d48" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      value={reelAudioTrack}
                      onChange={(e) => setReelAudioTrack(e.target.value)}
                      placeholder="e.g. Original Audio - Vorion Nexus or Trending Sound Name"
                      style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8, border: "1px solid #fda4af", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                    />
                  </div>
                </div>

                {/* Video Editor Motion Brief */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#9f1239", marginBottom: 4 }}>
                    Video Editor Motion Brief & Pacing Instructions:
                  </label>
                  <input
                    type="text"
                    value={designerNotes}
                    onChange={(e) => setDesignerNotes(e.target.value)}
                    placeholder="e.g. Fast jump cuts, animated dynamic captions, pop sound effects on key words, zoom punch-ins..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fda4af", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                  />
                </div>
              </div>
            ) : (
              /* Long-Form Video: 16:9 Landscape Video Master & Thumbnail */
              <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Video size={16} color="#c2410c" />
                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9a3412" }}>
                      3. Long-Form Video Assets & Production Brief (16:9 Landscape)
                    </label>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#c2410c", fontWeight: 700, background: "#ffedd5", border: "1px solid #fdba74", padding: "2px 8px", borderRadius: 6 }}>
                    YouTube / FB Video
                  </span>
                </div>

                {/* Resolution Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#9a3412", marginBottom: 4 }}>
                    Master Video Resolution:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {[
                      { id: "1080p", label: "1080p Full HD", desc: "Recommended Standard" },
                      { id: "4K", label: "4K UHD", desc: "Highest Visual Fidelity" },
                      { id: "720p", label: "720p HD", desc: "Compact File Size" },
                    ].map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setVideoResolution(res.id)}
                        style={{
                          padding: "6px 6px",
                          borderRadius: 8,
                          border: videoResolution === res.id ? "1.5px solid #c2410c" : "1px solid #fed7aa",
                          background: videoResolution === res.id ? "#c2410c" : "#ffffff",
                          color: videoResolution === res.id ? "#ffffff" : "#9a3412",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span>{res.label}</span>
                        <span style={{ fontSize: "0.62rem", opacity: 0.85 }}>{res.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Master Video URL */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#9a3412", marginBottom: 4 }}>
                    Master Video Deliverable URL (.mp4, Vimeo, or cloud drive):
                  </label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/.../master-1080p.mp4"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fdba74", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                  />
                </div>

                {/* Custom 1280x720 Thumbnail URL */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label style={{ fontSize: "0.74rem", fontWeight: 700, color: "#9a3412" }}>
                      High-CTR Custom Thumbnail URL (1280 × 720 / 16:9):
                    </label>
                    <span style={{ fontSize: "0.68rem", color: "#ea580c", fontWeight: 700 }}>
                      Crucial for CTR
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      value={videoThumbnailUrl}
                      onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... 1280x720 thumbnail banner"
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #fdba74", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                    />
                    {videoThumbnailUrl && (
                      <div style={{ width: 48, height: 27, borderRadius: 4, overflow: "hidden", border: "1px solid #ea580c", flexShrink: 0 }}>
                        <img src={videoThumbnailUrl} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Editor Production Brief */}
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#9a3412", marginBottom: 4 }}>
                    Video Editor Production Brief:
                  </label>
                  <input
                    type="text"
                    value={designerNotes}
                    onChange={(e) => setDesignerNotes(e.target.value)}
                    placeholder="e.g. Intro animated bumper (3s), lower-third speaker title cards, chapter markers, end-screen cards..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #fdba74", fontSize: "0.84rem", outline: "none", background: "#fff" }}
                  />
                </div>
              </div>
            )}

            {/* First Comment */}
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                First Comment (Optional)
              </label>
              <input
                type="text"
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                placeholder={
                  postType === "text"
                    ? "e.g. Read the complete announcement and details on our portal!"
                    : postType === "carousel"
                    ? "e.g. Comment 'SLIDES' and we will DM you the complete PDF deck!"
                    : postType === "reel"
                    ? "e.g. Link in bio to book your free discovery consultation call!"
                    : postType === "video"
                    ? "e.g. Complete chapter timestamps and resource links pinned here!"
                    : "e.g. Link in bio to book your free consultation!"
                }
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
                  { id: "urgent", label: "Urgent", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
                  { id: "high", label: "High", color: "#ea580c", bg: "#fff7ed", border: "#fdba74" },
                  { id: "medium", label: "Medium", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
                  { id: "low", label: "Low", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
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
                        gap: 6,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: pr.color,
                          flexShrink: 0,
                        }}
                      />
                      <span>{pr.label}</span>
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

          {/* Right Column: Live Feed Preview (Toggled by Top Button) */}
          {showPreview && (
            <div>
              {/* Header Title Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.84rem", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                  <Eye size={16} color="#4f46e5" /> Live Device Feed Preview
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    <span>Previewing:</span>
                    <span style={{ fontWeight: 700, color: PLATFORM_MAP[activePreviewPlatform]?.color === "#000000" ? "#0f172a" : PLATFORM_MAP[activePreviewPlatform]?.color || "#4f46e5" }}>
                      {PLATFORM_MAP[activePreviewPlatform]?.label || activePreviewPlatform}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "3px 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <EyeOff size={12} /> Hide
                  </button>
                </div>
              </div>

              {/* Platform Switcher Tabs Bar (Full Width) */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 12,
                  padding: "2px 0",
                }}
              >
                {(selectedPlatforms.length > 0
                  ? selectedPlatforms
                  : clientAccounts.length > 0
                  ? [...new Set(clientAccounts.map((a) => a.platform))]
                  : ["instagram", "facebook", "linkedin"]
                ).map((plat) => {
                  const pConfig = PLATFORM_MAP[plat] || { label: plat, icon: renderPlatformIcon(plat, { size: 14 }), color: "#0f172a" };
                  const isActive = activePreviewPlatform === plat;
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setActivePreviewPlatform(plat)}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 8,
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        border: isActive ? `1.5px solid ${pConfig.color}` : "1.5px solid #e2e8f0",
                        cursor: "pointer",
                        background: isActive ? (pConfig.color === "#000000" ? "#0f172a" : pConfig.color) : "#ffffff",
                        color: isActive ? "#ffffff" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        boxShadow: isActive ? `0 2px 8px ${pConfig.color}40` : "none",
                        transition: "all 0.15s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>{pConfig.icon}</span>
                      <span>{pConfig.label || plat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Native Platform Feed Preview */}
              <PlatformFeedPreview
                platform={activePreviewPlatform}
                client={selectedClient}
                account={clientAccounts.find((a) => a.platform === activePreviewPlatform)}
                primaryCaption={primaryCaption}
                hashtags={hashtags}
                location={location}
                firstComment={firstComment}
                mediaUrl={previewMediaUrl}
                postType={postType}
                title={postType === "video" && videoHeadline ? videoHeadline : title}
                carouselCount={previewCarouselCount}
              />

            </div>
          )}

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
