"use client";

import React from "react";
import {
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
  MapPin,
} from "lucide-react";

export const XIcon = ({ size = 14, color = "currentColor", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const GoogleIcon = ({ size = 14, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
  >
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

export const TikTokIcon = ({ size = 14, color = "currentColor", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.41 0 .8.08 1.15.24V9.45a6.37 6.37 0 0 0-1.15-.1 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.3 8.3 0 0 0 5-1.63z"/>
  </svg>
);

export const WhatsAppIcon = ({ size = 14, color = "#25D366", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.13c-.24.67-1.39 1.28-1.92 1.34-.5.06-1.13.08-3.64-.96-3.21-1.33-5.27-4.57-5.43-4.78-.16-.21-1.3-1.73-1.3-3.3 0-1.57.82-2.34 1.11-2.66.29-.32.64-.4.85-.4.21 0 .43.01.62.02.2.01.47-.08.73.55.27.64.92 2.25 1 2.41.08.16.13.35.03.56-.11.21-.16.35-.32.53-.16.19-.34.42-.49.56-.16.16-.33.33-.14.65.19.32.84 1.38 1.8 2.24 1.24 1.1 2.29 1.44 2.61 1.6.32.16.51.13.7-.08.19-.21.82-.95 1.04-1.28.22-.32.43-.27.73-.16.29.11 1.87.88 2.19 1.04.32.16.53.24.61.37.08.14.08.8-.16 1.47z"/>
  </svg>
);

export const GoogleAdsIcon = ({ size = 14, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
  >
    <path fill="#4285F4" d="M3.77 15.37a5.52 5.52 0 0 0 7.56 2.03l6.5-3.76-7.56-13.1-6.5 3.75a5.52 5.52 0 0 0 0 11.08z"/>
    <path fill="#FBBC04" d="M20.23 8.63a5.52 5.52 0 0 0-7.56-2.03l-6.5 3.76 7.56 13.1 6.5-3.75a5.52 5.52 0 0 0 0-11.08z"/>
    <circle cx="5.52" cy="18.48" r="3.5" fill="#34A853"/>
  </svg>
);

export function renderPlatformIcon(platformId, { size = 14, color, style } = {}) {
  const norm = (platformId || "").toLowerCase().replace(/[\s_-]+/g, "");
  switch (norm) {
    case "instagram":
    case "insta":
      return <Instagram size={size} color={color || "#E1306C"} style={{ flexShrink: 0, ...style }} />;
    case "facebook":
    case "fb":
      return <Facebook size={size} color={color || "#1877F2"} style={{ flexShrink: 0, ...style }} />;
    case "linkedin":
      return <Linkedin size={size} color={color || "#0A66C2"} style={{ flexShrink: 0, ...style }} />;
    case "youtube":
    case "yt":
      return <Youtube size={size} color={color || "#FF0000"} style={{ flexShrink: 0, ...style }} />;
    case "x":
    case "twitter":
      return <XIcon size={size} color={color || "currentColor"} style={style} />;
    case "googlebusiness":
    case "google":
      return <GoogleIcon size={size} style={style} />;
    case "googleads":
    case "ads":
      return <GoogleAdsIcon size={size} style={style} />;
    case "whatsapp":
    case "wa":
      return <WhatsAppIcon size={size} color={color || "#25D366"} style={style} />;
    case "tiktok":
      return <TikTokIcon size={size} color={color || "currentColor"} style={style} />;
    default:
      return <Globe size={size} color={color || "#64748b"} style={{ flexShrink: 0, ...style }} />;
  }
}
