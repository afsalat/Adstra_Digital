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

export function renderPlatformIcon(platformId, { size = 14, color, style } = {}) {
  const norm = (platformId || "").toLowerCase();
  switch (norm) {
    case "instagram":
      return <Instagram size={size} color={color} style={{ flexShrink: 0, ...style }} />;
    case "facebook":
      return <Facebook size={size} color={color} style={{ flexShrink: 0, ...style }} />;
    case "linkedin":
      return <Linkedin size={size} color={color} style={{ flexShrink: 0, ...style }} />;
    case "youtube":
      return <Youtube size={size} color={color} style={{ flexShrink: 0, ...style }} />;
    case "x":
    case "twitter":
      return <XIcon size={size} color={color || "currentColor"} style={style} />;
    case "google_business":
    case "google":
      return <GoogleIcon size={size} style={style} />;
    case "tiktok":
      return <TikTokIcon size={size} color={color || "currentColor"} style={style} />;
    default:
      return <Globe size={size} color={color} style={{ flexShrink: 0, ...style }} />;
  }
}
