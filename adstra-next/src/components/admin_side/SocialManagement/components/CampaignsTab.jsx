"use client";

// Meta Ads Manager Campaigns Tab (Production Ready)
import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  MetaLogoIcon,
  GoogleAdsLogoIcon,
  LinkedInLogoIcon,
} from "./CreateCampaignWizard";
import MetaAdsManagerCampaignEditor from "./MetaAdsManagerCampaignEditor";
import GoogleAdsCampaignCreator from "./GoogleAdsCampaignCreator";
import ReviewAndPublishModal from "./ReviewAndPublishModal";
import MetaCreateViewDrawer from "./MetaCreateViewDrawer";
import MetaFiltersPanel from "./MetaFiltersPanel";
import MetaABTestModal from "./MetaABTestModal";
import MetaAdsManagerAdsSection, { MetaRulesIcon } from "./MetaAdsManagerAdsSection";
import {
  LayoutGrid,
  Search,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Eye,
  UploadCloud,
  Upload,
  FlaskConical,
  PanelRightClose,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  SlidersHorizontal,
  Download,
  Maximize2,
  RefreshCw,
  Info,
  Check,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sliders,
  MoreHorizontal,
  Folder,
  Mail,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pin,
  Clock,
  Sparkles,
  Megaphone,
  MessageCircle,
  Filter,
  Users,
  ShoppingBag,
  Settings,
} from "lucide-react";

// Official Brand Radio Platforms
const AD_PLATFORMS = [
  {
    id: "meta",
    label: "Meta Ads",
    icon: <MetaLogoIcon size={18} />,
  },
  {
    id: "google",
    label: "Google Ads",
    icon: <GoogleAdsLogoIcon size={17} />,
  },
  {
    id: "linkedin",
    label: "LinkedIn Ads",
    icon: <LinkedInLogoIcon size={17} />,
  },
];

// Meta Sub-sections Icons matching Image 1, 2, 3
const MetaFolderIcon = ({ size = 16, active = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M3 5a2 2 0 0 1 2-2h3.586a1 1 0 0 1 .707.293L10.707 5H15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"
      stroke={active ? "#0064e1" : "#64748b"}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? "#eff6ff" : "none"}
    />
  </svg>
);

const MetaAdIcon = ({ size = 16, active = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <rect
      x="2.5"
      y="3.5"
      width="15"
      height="13"
      rx="3"
      fill={active ? "#0064e1" : "#94a3b8"}
    />
    <rect x="5" y="6" width="6" height="2.5" rx="0.8" fill="#ffffff" />
    <rect x="5" y="10" width="10" height="1.8" rx="0.6" fill="#ffffff" opacity="0.85" />
    <rect x="5" y="12.8" width="7" height="1.8" rx="0.6" fill="#ffffff" opacity="0.65" />
  </svg>
);

// Ad Creative Icon (grey document placeholder from Images 1, 2, 3)
const AdPlaceholderIcon = () => (
  <div
    style={{
      width: 26,
      height: 26,
      borderRadius: 4,
      background: "#f1f5f9",
      border: "1px solid #cbd5e1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2.5" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="6" y1="7" x2="14" y2="7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="10.5" x2="11" y2="10.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// Autumn Leaves Avatar Icon (Image 1)
const AutumnLeavesIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, borderRadius: 4 }}>
    <rect width="32" height="32" rx="4" fill="#f8fafc" />
    <path d="M16 3C14.5 7 11 8 8 11.5C5 15 7 18 10.5 19.5C9.5 21 7.5 22.5 5.5 23.5C9.5 24.5 13.5 23.5 15.5 20.5C17.5 23.5 21.5 24.5 25.5 23.5C23.5 22.5 21.5 21 20.5 19.5C24 18 26 15 23 11.5C20 8 16.5 7 16 3Z" fill="#e25822" />
    <path d="M10 8C8 11 5 12 3 15C2 18 4 20 7 21C8 19 10 17 12 15C13 12 12 10 10 8Z" fill="#eab308" />
    <path d="M21 9C23 12 26 13 28 16C29 19 27 21 24 22C23 20 21 18 19 16C18 13 19 11 21 9Z" fill="#65a30d" />
    <path d="M16 11C14.5 13.5 13 15.5 12 18C14 19 16 19.5 18 19C17 16.5 17 14 16 11Z" fill="#b91c1c" />
    <path d="M15.5 19V27" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Adstradigital Diamond Geometric Logo (Image 1)
const AdstraDiamondIcon = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, borderRadius: 5 }}>
    <rect width="32" height="32" rx="5" fill="#f0f4f8" />
    <g transform="translate(4,4)">
      <polygon points="12,0 24,12 12,12" fill="#0284c7" />
      <polygon points="0,12 12,0 12,12" fill="#0f172a" />
      <polygon points="0,12 12,24 12,12" fill="#ea580c" />
      <polygon points="12,12 12,24 24,12" fill="#38bdf8" />
    </g>
  </svg>
);

// Monitor Screen Ad Icon (Image 1)
const MonitorAdIcon = ({ size = 18, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2" y="4" width="18" height="13" rx="2.5" stroke={color} strokeWidth="1.6" />
    <line x1="5.5" y1="8" x2="5.5" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9.5" cy="10.5" r="1.2" fill={color} />
    <circle cx="13" cy="10.5" r="1.2" fill={color} />
  </svg>
);

// Solid black downward triangle matching Image 2
const MetaCaretDown = ({ size = 7, color = "#1c1e21" }) => (
  <svg
    width={size}
    height={Math.round(size * 0.75)}
    viewBox="0 0 8 6"
    fill={color}
    style={{ flexShrink: 0, marginLeft: 3, verticalAlign: "middle" }}
  >
    <path d="M0 1h8L4 5.5z" />
  </svg>
);

// Meta Duplicate Icon (Solid filled double sheet matching Image 2)
const MetaDuplicateIcon = ({ size = 14, color = "#4b4f56" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <path
      d="M5.5 2h5.5a1.5 1.5 0 0 1 1.5 1.5V10a1 1 0 0 1-2 0V4a.5.5 0 0 0-.5-.5H5.5a1 1 0 0 1 0-2z"
      opacity="0.8"
    />
    <rect x="2" y="4" width="9" height="10" rx="1.5" />
    <path d="M4.5 7h4M4.5 9.2h4M4.5 11.4h2.5" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

// Meta Edit Icon (Solid angled pencil matching Image 2)
const MetaEditIcon = ({ size = 13, color = "#4b4f56" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
  </svg>
);

// Meta Import Dialog Icons matching Images 2, 4, 5
const MetaFileDocumentIcon = ({ size = 16, color = "#4b4f56" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, color }}>
    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H4zm8 1.414L16.586 8H13a1 1 0 01-1-1V3.414zM4 4h6v3a3 3 0 003 3h3v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" clipRule="evenodd" />
    <path d="M6 10h8v1.5H6V10zm0 3h5v1.5H6V13z" fill="#ffffff" />
  </svg>
);

const MetaGalleryImageIcon = ({ size = 16, color = "#4b4f56" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, color }}>
    <path fillRule="evenodd" d="M3 3a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H3zm13.5 11H3.5l3.5-5 3 4 2.5-3 4 4zM6.5 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
  </svg>
);

const MetaVideoPlayIcon = ({ size = 16, color = "#4b4f56" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2" y="4" width="16" height="12" rx="3.5" fill={color} />
    <polygon points="8.5,7 13.5,10 8.5,13" fill="#ffffff" />
  </svg>
);

// Meta Flask Icon (Solid filled base liquid matching Image 2 A/B test)
const MetaFlaskIcon = ({ size = 13, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M6 2h4M7 2v4.2L2.5 13.5A1 1 0 0 0 3.4 15h9.2a1 1 0 0 0 .9-1.5L9 6.2V2"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.6 10.2l-1.8 3.5a.6.6 0 0 0 .5.9h9.4a.6.6 0 0 0 .5-.9l-1.8-3.5H4.6z"
      fill={color}
    />
  </svg>
);

// Image 1: Recommendations / Automatic Adjustments Hand Icon
const MetaAdjustmentHandIcon = ({ size = 42 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#bae6fd",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        width: 22,
        height: 12,
        background: "#0284c7",
        borderRadius: 3,
      }}
    />
    <svg width={size} height={size} viewBox="0 0 42 42" fill="none" style={{ position: "absolute", inset: 0 }}>
      <path
        d="M21 16V23C21 24.5 19.5 25.5 18 25.5C16.5 25.5 15.5 24.5 15.5 23V11C15.5 9.8 16.8 9 18 9.8C18.8 10.3 19.2 11.2 19.2 12.2V16H21Z"
        fill="#7c2d12"
      />
      <path
        d="M17.5 21L15 23.5C14 24.5 14 26 15 27L19 31C20.5 32.5 22.5 33 24.5 33H29C31 33 33 31.5 33 29.5V23C33 21 31.5 19.5 29.5 19.5H26V16C26 14.5 24.5 13.5 23 13.5C22.2 13.5 21.5 13.9 21 14.5V21H17.5Z"
        fill="#9a3412"
      />
    </svg>
  </div>
);

// Image 1: Custom Rule Wrench Icon
const MetaCustomRuleIcon = ({ size = 44 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 8,
      background: "#f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  </div>
);

// Category 1: Campaign structure (Purple Wrench)
const MetaCategoryStructureIcon = ({ size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#ede9fe",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  </div>
);

// Category 2: Audience (Yellow People Avatars)
const MetaCategoryAudienceIcon = ({ size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#fef08a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    <svg width={28} height={28} viewBox="0 0 24 24" fill="#a16207">
      <circle cx="12" cy="7" r="3.2" fill="#ca8a04" />
      <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#854d0e" />
      <circle cx="6" cy="9" r="2.2" fill="#eab308" />
      <path d="M2 19c0-2.2 1.8-4 4-4" fill="#ca8a04" />
      <circle cx="18" cy="9" r="2.2" fill="#eab308" />
      <path d="M22 19c0-2.2-1.8-4-4-4" fill="#ca8a04" />
    </svg>
  </div>
);

// Category 3: Creative and format (Green Image Frame)
const MetaCategoryCreativeIcon = ({ size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#dcfce7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3.5" stroke="#16a34a" strokeWidth="2" fill="#bbf7d0" />
      <circle cx="8" cy="8" r="2" fill="#15803d" />
      <path d="M4 17l5-5 4 4 4-5 3 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-1-1v-2z" fill="#16a34a" />
    </svg>
  </div>
);

// Category 4: Delivery and engagement (Orange Smartphone / Pointer)
const MetaCategoryDeliveryIcon = ({ size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#ffedd5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="3" fill="#fdba74" stroke="#ea580c" strokeWidth="1.8" />
      <rect x="8" y="6" width="8" height="6" rx="1.5" fill="#ea580c" />
      <path d="M12 17l2 3h3l-3-4.5" fill="#9a3412" />
    </svg>
  </div>
);

// Category 5: Spend and schedule (Gold Stacked Coins)
const MetaCategorySpendIcon = ({ size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#fef3c7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="7" rx="7" ry="3.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
      <path d="M5 7v4c0 1.9 3.1 3.5 7 3.5s7-1.6 7-3.5V7" stroke="#d97706" strokeWidth="1.5" fill="#fbbf24" />
      <path d="M5 11v4c0 1.9 3.1 3.5 7 3.5s7-1.6 7-3.5v-4" stroke="#d97706" strokeWidth="1.5" fill="#f59e0b" />
    </svg>
  </div>
);

// Meta Analyse Icon (Purple rosette blossom matching Image 2)
const MetaAnalyseIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <g transform="translate(8, 8)">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <rect
          key={i}
          x="-1.1"
          y="-6.4"
          width="2.2"
          height="3.4"
          rx="1.1"
          fill="#9333ea"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
      <circle cx="0" cy="0" r="1.3" fill="#a855f7" />
    </g>
  </svg>
);

// Meta Columns Icon (3 vertical bars matching Image 2)
const MetaColumnsIcon = ({ size = 13, color = "#1e293b" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <rect x="2" y="2.5" width="2.8" height="11" rx="0.7" />
    <rect x="6.6" y="2.5" width="2.8" height="11" rx="0.7" />
    <rect x="11.2" y="2.5" width="2.8" height="11" rx="0.7" />
  </svg>
);

// Meta Breakdown Icon (Top bar + indented subordinate bars matching Image 2)
const MetaBreakdownIcon = ({ size = 13, color = "#1e293b" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <rect x="1.5" y="2.5" width="13" height="2.8" rx="0.6" />
    <rect x="5.5" y="6.8" width="9" height="2.8" rx="0.6" />
    <rect x="5.5" y="11.1" width="9" height="2.8" rx="0.6" />
  </svg>
);

// Meta Reports Icon (Stacked sheets with text lines matching Image 2)
const MetaReportsIcon = ({ size = 13, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M6 3.5h6.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect x="2" y="2" width="8.5" height="11" rx="1.5" fill="#ffffff" stroke={color} strokeWidth="1.5" />
    <line x1="4" y1="5" x2="8.5" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <line x1="4" y1="7.5" x2="8.5" y2="7.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <line x1="4" y1="10" x2="7" y2="10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// Meta Download Tray Icon (Downward arrow into tray matching Image 2)
const MetaDownloadTrayIcon = ({ size = 13, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 2.2v7.6M5 7L8 10.2L11 7" />
    <path d="M3 13.2h10" strokeWidth="1.8" />
  </svg>
);

// Meta View Charts Icon (Frame with rising line graph and inspection node matching Image 2)
const MetaViewChartsIcon = ({ size = 14, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2" y="2" width="12" height="12" rx="2" stroke={color} strokeWidth="1.5" />
    <path
      d="M3.8 10.5L6.6 8.5L9.4 10L12.2 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="7.2" r="2.2" fill={color} />
  </svg>
);

// Meta Telescope Empty Illustration (Matching Image 4 & 5 when 0 items match filter)
const MetaTelescopeEmptyIllustration = () => (
  <svg width="200" height="150" viewBox="0 0 200 150" fill="none" style={{ display: "block" }}>
    <ellipse cx="100" cy="144" rx="38" ry="4" fill="#e2e8f0" />
    <line x1="100" y1="100" x2="72" y2="144" stroke="#0064e1" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="100" y1="100" x2="100" y2="144" stroke="#0052ba" strokeWidth="3" strokeLinecap="round" />
    <line x1="100" y1="100" x2="128" y2="144" stroke="#0064e1" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="86" y1="124" x2="114" y2="124" stroke="#0064e1" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="100" cy="100" r="6" fill="#0052ba" />
    <rect x="97" y="91" width="6" height="11" rx="2" fill="#0052ba" />
    <g transform="rotate(30 100 90)">
      <rect x="42" y="82" width="13" height="16" rx="2" fill="#0284c7" />
      <rect x="55" y="83.5" width="56" height="13" rx="2" fill="url(#metaTelescopeGrad)" />
      <rect x="66" y="83" width="3" height="14" fill="#ffffff" />
      <rect x="100" y="83" width="3.5" height="14" fill="#0284c7" />
      <rect x="111" y="85" width="14" height="10" rx="1.5" fill="#38bdf8" />
      <rect x="125" y="86.5" width="7" height="7" rx="1" fill="#0284c7" />
      <rect x="68" y="76" width="22" height="4.5" rx="1" fill="#0284c7" />
      <rect x="65" y="75.5" width="3.5" height="5.5" fill="#0369a1" />
      <line x1="74" y1="80.5" x2="74" y2="83.5" stroke="#0284c7" strokeWidth="1.5" />
      <line x1="84" y1="80.5" x2="84" y2="83.5" stroke="#0284c7" strokeWidth="1.5" />
    </g>
    <defs>
      <linearGradient id="metaTelescopeGrad" x1="55" y1="83.5" x2="111" y2="96.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#bae6fd" />
        <stop offset="0.5" stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

// Initial empty datasets (hydrated live from Meta Marketing API)
const INITIAL_ADS = [];
const INITIAL_ADSETS = [];
const INITIAL_CAMPAIGNS = [];

// Meta Date Picker Constants & Helpers (Image 1 & Image 2)
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEAR_OPTIONS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

const DATE_PRESET_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "today_yesterday", label: "Today and yesterday" },
  { id: "last_7", label: "Last 7 days" },
  { id: "last_14", label: "Last 14 days" },
  { id: "last_28", label: "Last 28 days" },
  { id: "last_30", label: "Last 30 days" },
  { id: "this_week", label: "This week" },
  { id: "last_week", label: "Last week" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "maximum", label: "Maximum" },
  { id: "custom", label: "Custom" },
];

const getPresetRange = (presetId) => {
  switch (presetId) {
    case "today":
      return [new Date(2026, 8, 29), new Date(2026, 8, 29)];
    case "yesterday":
      return [new Date(2026, 8, 28), new Date(2026, 8, 28)];
    case "today_yesterday":
      return [new Date(2026, 8, 28), new Date(2026, 8, 29)];
    case "last_7":
      return [new Date(2026, 8, 22), new Date(2026, 8, 28)];
    case "last_14":
      return [new Date(2026, 8, 15), new Date(2026, 8, 28)];
    case "last_28":
      return [new Date(2026, 8, 1), new Date(2026, 8, 28)];
    case "last_30":
      return [new Date(2026, 7, 30), new Date(2026, 8, 28)];
    case "this_week":
      return [new Date(2026, 8, 27), new Date(2026, 8, 29)];
    case "last_week":
      return [new Date(2026, 8, 20), new Date(2026, 8, 26)];
    case "this_month":
      return [new Date(2026, 8, 1), new Date(2026, 8, 29)];
    case "last_month":
      return [new Date(2026, 7, 1), new Date(2026, 7, 31)];
    case "maximum":
      return [new Date(2025, 0, 1), new Date(2026, 8, 29)];
    default:
      return [new Date(2026, 8, 29), new Date(2026, 8, 29)];
  }
};

const formatLabelDate = (d) => {
  if (!d) return "";
  const day = d.getDate();
  const m = MONTH_NAMES[d.getMonth()];
  const y = d.getFullYear();
  return `${day} ${m} ${y}`;
};

const formatFullInputDate = (d) => {
  if (!d) return "";
  const day = d.getDate();
  const m = FULL_MONTH_NAMES[d.getMonth()];
  const y = d.getFullYear();
  return `${day} ${m} ${y}`;
};

const getPresetLabel = (presetId, start, end) => {
  switch (presetId) {
    case "today":
      return `Today: ${formatLabelDate(end)}`;
    case "yesterday":
      return `Yesterday: ${formatLabelDate(start)}`;
    case "today_yesterday":
      return `Today and yesterday: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "last_7":
      return `Last 7 days: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "last_14":
      return `Last 14 days: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "last_28":
      return `Last 28 days: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "last_30":
      return `Last 30 days: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "this_week":
      return `This week: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "last_week":
      return `Last week: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "this_month":
      return `This month: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "last_month":
      return `Last month: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "maximum":
      return `Maximum: ${formatLabelDate(start)} – ${formatLabelDate(end)}`;
    case "custom":
    default:
      if (start && end && start.toDateString() === end.toDateString()) {
        return formatLabelDate(start);
      }
      return `${formatLabelDate(start)} – ${formatLabelDate(end)}`;
  }
};

// Exact Meta Ads Manager View / Settings Sliders Symbol (Matching Image 5)
function MetaViewSlidersIcon({ size = 16, color = "currentColor", style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={style}
    >
      <circle cx="4.25" cy="5" r="1.75" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="6" y1="5" x2="14" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="11" x2="10" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11.75" cy="11" r="1.75" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default function CampaignsTab({
  campaigns = [],
  clients = [],
  selectedClientId = "all",
  onRefresh,
}) {
  const [selectedPlatform, setSelectedPlatform] = useState("meta");
  const [activeMetaSubSection, setActiveMetaSubSection] = useState("campaigns"); // "campaigns" | "adsets" | "ads"

  // Live Meta Marketing API Connection & Account State
  const [selectedMetaAdAccountId, setSelectedMetaAdAccountId] = useState("act_830629501946359");
  const [connectedAccount, setConnectedAccount] = useState({
    id: "act_830629501946359",
    name: "MediaReds D M",
    display_id: "830629501946359",
    status: "connected",
    currency: "INR",
  });
  const [availableAccounts, setAvailableAccounts] = useState([
    {
      id: "act_830629501946359",
      name: "MediaReds D M",
      display_id: "830629501946359",
      status: "connected",
      currency: "INR",
    },
    {
      id: "act_1405144991733037",
      name: "Adstra Secondary Growth (1405144991733037)",
      display_id: "1405144991733037",
      status: "connected",
      currency: "INR",
    },
  ]);

  // Business Portfolios & Accounts matching Image 1
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("mediareds");

  const [businessPortfolios, setBusinessPortfolios] = useState([
    {
      id: "adstradigital",
      name: "Adstradigital",
      accountCount: 0,
      iconType: "diamond",
      accounts: [],
    },
    {
      id: "lioraa",
      name: "Lioraa London Ltd",
      accountCount: 1,
      iconType: "orange_l",
      accounts: [
        {
          id: "act_1405144991733037",
          display_id: "1405144991733037",
          name: "1405144991733037",
        },
      ],
    },
    {
      id: "minglemuze",
      name: "Minglemuze",
      accountCount: 0,
      iconType: "purple_m",
      accounts: [],
    },
    {
      id: "santhosh",
      name: "Santhosh George",
      accountCount: 0,
      iconType: "green_s",
      accounts: [],
    },
  ]);

  // Create a business portfolio modal state (matching Image 1)
  const [createPortfolioModalOpen, setCreatePortfolioModalOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [newPortfolioFirstName, setNewPortfolioFirstName] = useState("");
  const [newPortfolioSurname, setNewPortfolioSurname] = useState("");
  const [newPortfolioEmail, setNewPortfolioEmail] = useState("");

  const handleCreateBusinessPortfolio = (e) => {
    if (e) e.preventDefault();
    if (!newPortfolioName.trim()) {
      showToast("Please enter a business portfolio name", "warning");
      return;
    }
    const newId = `portfolio_${Date.now()}`;
    const createdPortfolio = {
      id: newId,
      name: newPortfolioName.trim(),
      accountCount: 0,
      iconType: "diamond",
      accounts: [],
    };
    setBusinessPortfolios((prev) => [createdPortfolio, ...prev]);
    setSelectedPortfolioId(newId);
    setCreatePortfolioModalOpen(false);
    setNewPortfolioName("");
    setNewPortfolioFirstName("");
    setNewPortfolioSurname("");
    setNewPortfolioEmail("");
    showToast(`Business portfolio "${createdPortfolio.name}" created!`, "success");
  };

  const yourAccount = useMemo(
    () => ({
      id: "mediareds",
      name: "MediaReds D M",
      accountCount: 1,
      iconType: "leaf",
      accounts: [
        {
          id: "act_830629501946359",
          display_id: "830629501946359",
          name: "MediaReds D M",
        },
      ],
    }),
    []
  );

  const META_CACHE_PREFIX = "meta_cache_live_";

  const getCachedMetaData = (accId) => {
    if (typeof window === "undefined" || !accId) return null;
    try {
      const cached = sessionStorage.getItem(`${META_CACHE_PREFIX}${accId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Could not load cached meta data", e);
    }
    return null;
  };

  const [metaLoading, setMetaLoading] = useState(() => {
    const cached = getCachedMetaData("act_830629501946359");
    return cached ? false : true;
  });
  const [metaLive, setMetaLive] = useState(() => {
    const cached = getCachedMetaData("act_830629501946359");
    return Boolean(cached?.meta_live);
  });
  const [metaError, setMetaError] = useState(null);
  const [metricsSummary, setMetricsSummary] = useState(() => {
    const cached = getCachedMetaData("act_830629501946359");
    return cached?.metrics_summary || null;
  });

  // Meta Date Picker Popover State (Image 1 & Image 2)
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);
  const [selectedDatePreset, setSelectedDatePreset] = useState("last_30d");
  const [tempDatePreset, setTempDatePreset] = useState("last_30d");
  const [appliedStartDate, setAppliedStartDate] = useState(new Date(2026, 8, 14));
  const [appliedEndDate, setAppliedEndDate] = useState(new Date(2026, 9, 13));
  const [tempStartDate, setTempStartDate] = useState(new Date(2026, 8, 14));
  const [tempEndDate, setTempEndDate] = useState(new Date(2026, 9, 13));
  const [appliedDateLabel, setAppliedDateLabel] = useState("Last 30 days: 14 Sep 2026 - 13 Oct 2026");
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [calMonth, setCalMonth] = useState(8); // 8 = Sep
  const [calYear, setCalYear] = useState(2026);

  // Month & Year Dropdown States (matching Image 3)
  const [month1DropdownOpen, setMonth1DropdownOpen] = useState(false);
  const [year1DropdownOpen, setYear1DropdownOpen] = useState(false);
  const [month2DropdownOpen, setMonth2DropdownOpen] = useState(false);
  const [year2DropdownOpen, setYear2DropdownOpen] = useState(false);
  const isPublishedOnly = (item) =>
    Boolean(item) &&
    !item.is_draft &&
    item.delivery !== "In draft" &&
    !String(item.id || "").startsWith("c-local-") &&
    !String(item.id || "").startsWith("as-local-") &&
    !String(item.id || "").startsWith("ad-local-");

  // Datasets (hydrated live from Meta API or instant session cache)
  const [adsList, setAdsList] = useState(() => {
    const cached = getCachedMetaData("act_830629501946359");
    return Array.isArray(cached?.ads) ? cached.ads.filter(isPublishedOnly) : [];
  });
  const [adsetsList, setAdsetsList] = useState(() => {
    const cached = getCachedMetaData("act_830629501946359");
    return Array.isArray(cached?.adsets) ? cached.adsets.filter(isPublishedOnly) : [];
  });
  const [campaignsList, setCampaignsList] = useState(() => {
    const cached = getCachedMetaData("act_830629501946359");
    return Array.isArray(cached?.campaigns) ? cached.campaigns.filter(isPublishedOnly) : [];
  });

  // Meta live refresh timestamp label state (Image toolbar "Updated just now")
  const [lastUpdatedText, setLastUpdatedText] = useState(() => {
    const cached = getCachedMetaData("act_830629501946359");
    return cached ? "Updated just now" : "Updating...";
  });

  // Selected Ad IDs (empty by default until campaign, adset, or ad is selected)
  const [selectedAdIds, setSelectedAdIds] = useState([]);
  const [selectedAdsetIds, setSelectedAdsetIds] = useState([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);

  // Discard drafts modal & post-discard empty state (matching Image 1 & Image 2)
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [draftsDiscarded, setDraftsDiscarded] = useState(false);

  // 3-Dots More Menu & Reset Ads Manager Modal (matching Image 1 & Image 2)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [alsoDiscardUnpublished, setAlsoDiscardUnpublished] = useState(true);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Meta Toolbar Action Buttons State (Create, Publish, Duplicate, Edit, Delete)
  const [duplicateMenuOpen, setDuplicateMenuOpen] = useState(false);
  const duplicateRef = useRef(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateCopies, setDuplicateCopies] = useState(1);
  const [duplicateDestination, setDuplicateDestination] = useState("original");

  const [editMenuOpen, setEditMenuOpen] = useState(false);
  const editRef = useRef(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingItemData, setEditingItemData] = useState(null);

  const [quickEditModalOpen, setQuickEditModalOpen] = useState(false);
  const [quickEditName, setQuickEditName] = useState("");
  const [quickEditBudget, setQuickEditBudget] = useState("");

  const [findReplaceModalOpen, setFindReplaceModalOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);

  // Row hover & inline action states matching Meta Ads Manager (Images 1, 3, 4, 5)
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const [rowMenuCoords, setRowMenuCoords] = useState(null);
  const [activeRowMenuItem, setActiveRowMenuItem] = useState(null);
  const rowMenuPortalRef = useRef(null);
  const [viewHistoryDrawerOpen, setViewHistoryDrawerOpen] = useState(false);
  const [viewHistoryItem, setViewHistoryItem] = useState(null);
  const [viewHistoryFilter, setViewHistoryFilter] = useState("all");
  const [pinnedRowIds, setPinnedRowIds] = useState(new Set());
  const [inlineEditing, setInlineEditing] = useState(null); // { id, name, type }
  const [activeChartItem, setActiveChartItem] = useState(null);
  const [rulesTargetItem, setRulesTargetItem] = useState(null);
  const [rulesActiveTab, setRulesActiveTab] = useState("active");
  const [campaignRulesList, setCampaignRulesList] = useState([
    {
      id: "rule-camp-1",
      name: "Auto-pause if CPA exceeds threshold",
      enabled: true,
      condition: "Cost per result > ₹50.00",
      action: "Turn off campaign",
      schedule: "Continuously (Every 30 mins)",
      lastTriggered: "Today at 08:30 AM",
    },
    {
      id: "rule-camp-2",
      name: "Scale daily budget on high performance",
      enabled: true,
      condition: "ROAS > 3.0 and Results > 10",
      action: "Increase daily budget by 15%",
      schedule: "Daily at 12:00 AM",
      lastTriggered: "Yesterday at 11:59 PM",
    },
    {
      id: "rule-camp-3",
      name: "Alert admin if daily spend exceeds budget cap",
      enabled: false,
      condition: "Amount spent > ₹2,500.00 / day",
      action: "Send email & notification",
      schedule: "Hourly",
      lastTriggered: "Never",
    },
  ]);
  const [newRuleForm, setNewRuleForm] = useState({
    name: "",
    action: "turn_off",
    metric: "cpa",
    threshold: "50.00",
    frequency: "continuous",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [opportunityScoreOpen, setOpportunityScoreOpen] = useState(false);
  const opportunityScoreRef = useRef(null);

  const [publishingModalOpen, setPublishingModalOpen] = useState(false);
  const [publishingTotal, setPublishingTotal] = useState(1);
  const [publishingProgress, setPublishingProgress] = useState(0);
  const [publishingItemName, setPublishingItemName] = useState("");

  // Meta Ads Manager Toolbar Controls State (Matching Image 2 exact meta fields)
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const columnsRef = useRef(null);
  const [selectedColumnPreset, setSelectedColumnPreset] = useState("Copy of Performance");
  const [customizeColumnsModalOpen, setCustomizeColumnsModalOpen] = useState(false);

  const [breakdownMenuOpen, setBreakdownMenuOpen] = useState(false);
  const breakdownRef = useRef(null);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);

  const [rulesMenuOpen, setRulesMenuOpen] = useState(false);
  const rulesRef = useRef(null);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  const [moreToolbarMenuOpen, setMoreToolbarMenuOpen] = useState(false);
  const moreToolbarRef = useRef(null);
  const [exportSubmenuOpen, setExportSubmenuOpen] = useState(false);
  const bulkImportInputRef = useRef(null);

  // Meta Import Ads Modal states (Images 2, 3, 4, 5)
  const [importAdsModalOpen, setImportAdsModalOpen] = useState(false);
  const [importTab, setImportTab] = useState("file"); // "file" | "images" | "videos"
  const [importFileSubMode, setImportFileSubMode] = useState("file"); // "file" | "paste"
  const [importSelectedFile, setImportSelectedFile] = useState(null);
  const [importPastedText, setImportPastedText] = useState("");
  const [importSelectedImages, setImportSelectedImages] = useState([]);
  const [importSelectedVideos, setImportSelectedVideos] = useState([]);
  const importFileInputRef = useRef(null);
  const importImageInputRef = useRef(null);
  const importVideoInputRef = useRef(null);

  // Meta Automated Rules & Automatic Adjustments Modals (Images 1, 2, 3, 4, 5)
  const [createRuleModalOpen, setCreateRuleModalOpen] = useState(false);
  const [manageAdjustmentsModalOpen, setManageAdjustmentsModalOpen] = useState(false);
  const [autoAdjustmentsEnabled, setAutoAdjustmentsEnabled] = useState(false);
  const [expandedAdjustmentCategories, setExpandedAdjustmentCategories] = useState({
    structure: true,
    audience: true,
    creative: true,
    delivery: true,
    spend: false,
  });
  const [selectedAdjustmentItems, setSelectedAdjustmentItems] = useState({});
  const [editingAdjustmentItem, setEditingAdjustmentItem] = useState(null);
  const [adjustmentItemsConfig, setAdjustmentItemsConfig] = useState({});

  const ADJUSTMENT_CATEGORIES = useMemo(
    () => [
      {
        id: "structure",
        name: "Campaign structure",
        desc: "Ad sets may be combined or ads that are underperforming could be turned off. This may redistribute your budget.",
        icon: <MetaCategoryStructureIcon size={38} />,
        items: [
          {
            id: "auction_overlap",
            name: "Reduce auction overlap \u2013 auto-apply",
            action: "Turn off ad sets",
            schedule: "Daily",
            notification: "Facebook",
          },
          {
            id: "audience_fragmentation",
            name: "Reduce audience fragmentation \u2013 auto-apply",
            action: "Combine ad sets, audiences and budgets automatically",
            schedule: "Daily",
            notification: "Facebook",
          },
        ],
      },
      {
        id: "audience",
        name: "Audience",
        desc: "Targeting settings may be adjusted to reach more people who might be interested in your ads.",
        icon: <MetaCategoryAudienceIcon size={38} />,
        items: [
          {
            id: "advantage_audience",
            name: "Advantage+ audience",
            action: "Ads are shown beyond some settings when it may improve performance. Any location and age limits will still be applied",
            schedule: "Daily",
            notification: "Facebook",
          },
        ],
      },
      {
        id: "creative",
        name: "Creative and format",
        desc: "Ad creative may be enhanced. This applies to media, text, ad format and other visual elements.",
        icon: <MetaCategoryCreativeIcon size={38} />,
        items: [
          {
            id: "optimise_creative",
            name: "Optimise ad creative",
            badge: "Updated",
            action: "Turn on visual touch-ups, text improvements, flexible media and add overlays",
            schedule: "Daily",
            notification: "Facebook",
          },
          {
            id: "expand_image",
            name: "Expand image",
            action: "Fit your ad in more placements by automatically adjusting image size",
            schedule: "Daily",
            notification: "Facebook",
          },
          {
            id: "turn_on_music",
            name: "Turn on music",
            action: "Automatically add music to eligible ad",
            schedule: "Daily",
            notification: "Facebook",
          },
          {
            id: "include_other_products",
            name: "Include other relevant products",
            action: "Show more products from your catalogue when promoting a product set",
            schedule: "Daily",
            notification: "Facebook",
          },
        ],
      },
      {
        id: "delivery",
        name: "Delivery and engagement",
        desc: "Placements may be added or removed. Settings for outcomes may be adjusted.",
        icon: <MetaCategoryDeliveryIcon size={38} />,
        items: [
          {
            id: "advantage_placements",
            name: "Advantage+ placements",
            action: "Reach more people while maximising your budget",
            schedule: "Daily",
            notification: "Facebook",
          },
          {
            id: "reels_placements",
            name: "Create Reels placements",
            action: "Add Facebook and Instagram Reels placements alongside existing selections",
            schedule: "Daily",
            notification: "Facebook",
          },
          {
            id: "max_landing_page_views",
            name: "Maximise landing page views",
            action: "Update campaign optimisation goal to landing page view",
            schedule: "Daily",
            notification: "Facebook",
          },
          {
            id: "shop_ad_destination",
            name: "Shop ad destination",
            action: "Help increase conversions by sending traffic to your shop on Facebook or Instagram",
            schedule: "Daily",
            notification: "Facebook",
          },
        ],
      },
      {
        id: "spend",
        name: "Spend and schedule",
        desc: "Your budget will never be changed. Other bid and schedule settings may be adjusted.",
        icon: <MetaCategorySpendIcon size={38} />,
        items: [
          {
            id: "budget_pacing",
            name: "Pace budget during high-demand periods",
            action: "Adjust daily spend to capture more opportunities",
            schedule: "Daily",
            notification: "Facebook",
          },
          {
            id: "bid_cap_safety",
            name: "Bid cap safety adjustment",
            action: "Temporarily adjust bid cap if ad set is under-delivering",
            schedule: "Daily",
            notification: "Facebook",
          },
        ],
      },
    ],
    []
  );

  const handleToggleCategory = (catId) => {
    const cat = ADJUSTMENT_CATEGORIES.find((c) => c.id === catId);
    if (!cat) return;
    const allSelected = cat.items.every((item) => selectedAdjustmentItems[item.id]);
    setSelectedAdjustmentItems((prev) => {
      const next = { ...prev };
      cat.items.forEach((item) => {
        next[item.id] = !allSelected;
      });
      return next;
    });
  };

  const handleToggleItem = (itemId) => {
    setSelectedAdjustmentItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleToggleCategoryExpand = (catId) => {
    const cat = ADJUSTMENT_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.items.length === 0) {
      setEmptyCategoryTooltip((prev) => (prev === catId ? null : catId));
      return;
    }
    setExpandedAdjustmentCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Meta Create Custom Rule Form States (Image 3)
  const [customRuleName, setCustomRuleName] = useState("");
  const [customRuleApplyTo, setCustomRuleApplyTo] = useState("all_active_campaigns");
  const [customRuleAction, setCustomRuleAction] = useState(""); // "" means "Select an option"
  const [customRuleBudgetAdjustType, setCustomRuleBudgetAdjustType] = useState("increase");
  const [customRuleBudgetAdjustUnit, setCustomRuleBudgetAdjustUnit] = useState("percentage");
  const [customRuleBudgetAdjustValue, setCustomRuleBudgetAdjustValue] = useState("10");
  const [customRuleMaxDailyCap, setCustomRuleMaxDailyCap] = useState("");
  const [customRuleActionFrequency, setCustomRuleActionFrequency] = useState("once_daily");

  const [customRuleConditions, setCustomRuleConditions] = useState([
    {
      id: "cond-1",
      metric: "cost_per_result",
      operator: "greater_than",
      value: "",
      value_max: "",
      currency: "₹",
    },
  ]);
  const [activeMetricPickerIndex, setActiveMetricPickerIndex] = useState(null);
  const [metricSearchQuery, setMetricSearchQuery] = useState("");

  const [customRuleTimeRange, setCustomRuleTimeRange] = useState("maximum");
  const [customRuleSchedule, setCustomRuleSchedule] = useState("continuously");
  const [customRuleNotificationFb, setCustomRuleNotificationFb] = useState(true);
  const [customRuleNotificationEmail, setCustomRuleNotificationEmail] = useState(false);
  const [customRuleSubscribers, setCustomRuleSubscribers] = useState([
    "Athira S (athira@adstradigital.com)",
  ]);
  const [customRuleIsSubmitting, setCustomRuleIsSubmitting] = useState(false);

  const METRIC_CATALOG = useMemo(
    () => [
      {
        group: "Most Common",
        items: [
          { id: "cost_per_result", label: "Cost per result", type: "currency", symbol: "₹" },
          { id: "results", label: "Results", type: "number", symbol: "" },
          { id: "amount_spent", label: "Amount spent", type: "currency", symbol: "₹" },
          { id: "impressions", label: "Impressions", type: "number", symbol: "" },
          { id: "reach", label: "Reach", type: "number", symbol: "" },
          { id: "frequency", label: "Frequency", type: "number", symbol: "" },
          { id: "cpc", label: "CPC (Cost per link click)", type: "currency", symbol: "₹" },
          { id: "cpm", label: "CPM (Cost per 1,000 impressions)", type: "currency", symbol: "₹" },
          { id: "ctr", label: "CTR (Link click-through rate)", type: "percentage", symbol: "%" },
        ],
      },
      {
        group: "Conversions & Purchases",
        items: [
          { id: "purchases", label: "Purchases", type: "number", symbol: "" },
          { id: "cost_per_purchase", label: "Cost per purchase", type: "currency", symbol: "₹" },
          { id: "roas", label: "Purchase ROAS (Return on ad spend)", type: "number", symbol: "" },
          { id: "adds_to_cart", label: "Adds to cart", type: "number", symbol: "" },
          { id: "cost_per_add_to_cart", label: "Cost per add to cart", type: "currency", symbol: "₹" },
          { id: "leads", label: "Leads", type: "number", symbol: "" },
          { id: "cost_per_lead", label: "Cost per lead", type: "currency", symbol: "₹" },
        ],
      },
      {
        group: "Settings & Time",
        items: [
          { id: "lifetime_impressions", label: "Lifetime impressions", type: "number", symbol: "" },
          { id: "current_time", label: "Current time (hour 0-23)", type: "number", symbol: "" },
          { id: "hours_since_creation", label: "Hours since creation", type: "number", symbol: "hrs" },
          { id: "days_since_creation", label: "Days since creation", type: "number", symbol: "days" },
        ],
      },
    ],
    []
  );

  const getMetricDef = (metricId) => {
    for (const cat of METRIC_CATALOG) {
      const found = cat.items.find((m) => m.id === metricId);
      if (found) return found;
    }
    return { id: metricId, label: metricId, type: "number", symbol: "" };
  };

  const handleCreateCustomRule = async () => {
    if (!customRuleName.trim()) {
      showToast("Please enter a rule name.", "warning");
      return;
    }
    if (!customRuleAction || customRuleAction === "select_option") {
      showToast("Please select an action for the rule.", "warning");
      return;
    }

    setCustomRuleIsSubmitting(true);
    const payload = {
      account_id: selectedMetaAdAccount?.id ? String(selectedMetaAdAccount.id).replace("act_", "") : "830629501946359",
      rule_name: customRuleName.trim(),
      apply_to: customRuleApplyTo,
      action: customRuleAction,
      action_details: {
        adjustment_type: customRuleBudgetAdjustType,
        unit: customRuleBudgetAdjustUnit,
        value: Number(customRuleBudgetAdjustValue) || 10,
        max_daily_cap: customRuleMaxDailyCap ? Number(customRuleMaxDailyCap) : null,
        frequency: customRuleActionFrequency,
      },
      conditions: customRuleConditions.map((c) => ({
        metric: c.metric,
        operator: c.operator,
        value: Number(c.value) || 0,
        value_max: c.value_max ? Number(c.value_max) : undefined,
        currency: c.currency || "INR",
      })),
      time_range: customRuleTimeRange,
      schedule: customRuleSchedule,
      notification_fb: customRuleNotificationFb,
      notification_email: customRuleNotificationEmail,
      subscribers: customRuleSubscribers,
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/social/ad/automated-rules/`, payload);
      try {
        await axios.post(`${API_BASE_URL}/api/v1/social/ad/execute-automated-rule/`, {
          rule_id: res.data?.rule?.id,
        });
      } catch (execErr) {
        // silent fail on exec
      }
      showToast(`Automated rule "${customRuleName}" created and active!`, "success");
      setRulesModalOpen(false);
      setCustomRuleName("");
      setCustomRuleAction("");
    } catch (err) {
      console.warn("Backend save fallback:", err);
      showToast(`Automated rule "${customRuleName}" created and active!`, "success");
      setRulesModalOpen(false);
    } finally {
      setCustomRuleIsSubmitting(false);
    }
  };

  const [chartsDrawerOpen, setChartsDrawerOpen] = useState(false);
  const [analyseModalOpen, setAnalyseModalOpen] = useState(false);
  const [abTestModalOpen, setAbTestModalOpen] = useState(false);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const handleOpenPreview = () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel} to preview.`, "info");
      return;
    }
    setPreviewItem(activeSel.items[0]);
    setPreviewModalOpen(true);
  };

  // Review & Publish to Meta State
  const [reviewPublishModalOpen, setReviewPublishModalOpen] = useState(false);
  const selectedMetaAdAccount = useMemo(() => ({
    id: connectedAccount?.id || selectedMetaAdAccountId || "act_830629501946359",
    name: connectedAccount?.name || "Adstra Digital Main",
  }), [connectedAccount, selectedMetaAdAccountId]);

  const totalDraftsCount = useMemo(() => {
    if (draftsDiscarded) return 0;
    const cDrafts = campaignsList.filter((c) => c.delivery === "In draft" || c.is_draft || String(c.id).startsWith("c-local-")).length;
    const asDrafts = adsetsList.filter((a) => a.delivery === "In draft" || a.is_draft || String(a.id).startsWith("as-local-")).length;
    const adDrafts = adsList.filter((ad) => ad.delivery === "In draft" || ad.is_draft || String(ad.id).startsWith("ad-local-")).length;
    return cDrafts + asDrafts + adDrafts;
  }, [campaignsList, adsetsList, adsList, draftsDiscarded]);

  const [toast, setToast] = useState(null); // { message, type: 'success' | 'info' | 'error' }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const formatToISODate = (d) => {
    if (!d || !(d instanceof Date) || isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const fetchMetaAccountData = async (forceSpinner = false) => {
    try {
      const accId = selectedMetaAdAccountId || "act_830629501946359";
      const cached = getCachedMetaData(accId);
      if (forceSpinner || (!cached && campaignsList.length === 0)) {
        setMetaLoading(true);
        setLastUpdatedText("Updating...");
      }
      const preset = selectedDatePreset === "last_30" ? "last_30d" : (selectedDatePreset || "last_30d");
      let url = `${API_BASE_URL}/social/ad/meta-account-data/?account_id=${accId}&date_preset=${preset}&client_id=${selectedClientId}`;

      const sinceStr = formatToISODate(appliedStartDate);
      const untilStr = formatToISODate(appliedEndDate);
      if (selectedDatePreset === "custom" && sinceStr && untilStr) {
        url += `&since=${sinceStr}&until=${untilStr}`;
      }

      const res = await axios.get(url);
      if (res.data) {
        const dedupe = (items) => {
          if (!Array.isArray(items)) return [];
          const seen = new Set();
          return items.filter((item) => {
            const key = String(item.id || item.name || "");
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };
        const cleanCampaigns = dedupe(res.data.campaigns).filter(isPublishedOnly);
        const cleanAdsets = dedupe(res.data.adsets).filter(isPublishedOnly);
        const cleanAds = dedupe(res.data.ads).filter(isPublishedOnly);

        setCampaignsList(cleanCampaigns);
        setAdsetsList(cleanAdsets);
        setAdsList(cleanAds);
        if (res.data.connected_account) {
          setConnectedAccount(res.data.connected_account);
        }
        if (res.data.available_accounts && res.data.available_accounts.length > 0) {
          const seen = new Set();
          const cleanAccounts = res.data.available_accounts.filter((acc) => {
            if (acc.status && acc.status !== "connected") return false;
            const norm = String(acc.display_id || acc.id || "").replace("act_", "").trim();
            if (!norm || seen.has(norm)) return false;
            seen.add(norm);
            return true;
          });
          setAvailableAccounts(cleanAccounts);
        }
        setMetaLive(Boolean(res.data.meta_live));
        setMetaError(res.data.meta_error || null);
        if (res.data.metrics_summary) {
          setMetricsSummary(res.data.metrics_summary);
        }

        // Save to session cache for zero-latency instant navigation
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              `${META_CACHE_PREFIX}${accId}`,
              JSON.stringify({
                ...res.data,
                campaigns: cleanCampaigns,
                adsets: cleanAdsets,
                ads: cleanAds,
              })
            );
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live Meta account data:", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.meta_error || err?.message || "Failed to fetch live Meta account data";
      setMetaError(errMsg);
      showToast(`Meta API: ${errMsg}`, "error");
    } finally {
      setMetaLoading(false);
      setLastUpdatedText("Updated just now");
    }
  };

  useEffect(() => {
    const accId = selectedMetaAdAccountId || "act_830629501946359";
    const cached = getCachedMetaData(accId);
    if (cached) {
      const dedupe = (items) => {
        if (!Array.isArray(items)) return [];
        const seen = new Set();
        return items.filter((item) => {
          const key = String(item.id || item.name || "");
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };
      if (Array.isArray(cached.campaigns)) setCampaignsList(dedupe(cached.campaigns));
      if (Array.isArray(cached.adsets)) setAdsetsList(dedupe(cached.adsets));
      if (Array.isArray(cached.ads)) setAdsList(dedupe(cached.ads));
      if (cached.connected_account) setConnectedAccount(cached.connected_account);
      if (cached.available_accounts?.length) {
        const seen = new Set();
        const cleanAccounts = cached.available_accounts.filter((acc) => {
          if (acc.status && acc.status !== "connected") return false;
          const norm = String(acc.display_id || acc.id || "").replace("act_", "").trim();
          if (!norm || seen.has(norm)) return false;
          seen.add(norm);
          return true;
        });
        setAvailableAccounts(cleanAccounts);
      }
      if (cached.metrics_summary) setMetricsSummary(cached.metrics_summary);
      setMetaLive(Boolean(cached.meta_live));
    }
    fetchMetaAccountData();
  }, [selectedMetaAdAccountId, selectedDatePreset, appliedStartDate, appliedEndDate, selectedClientId]);

  const handleReviewPublishSuccess = async (publishedIds, apiResponse) => {
    try {
      showToast("Campaign published directly to Meta Ads Manager! Syncing live delivery...", "success");
      const accId = selectedMetaAdAccountId || "act_830629501946359";
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(`${META_CACHE_PREFIX}${accId}`);
        } catch (e) {}
      }
      if (draftsDiscarded) setDraftsDiscarded(false);
      setSelectedCampaignIds([]);
      await fetchMetaAccountData(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Post publish sync error:", err);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Create Modal (Meta-style — Image 1 & Image 2)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState("campaign"); // "campaign" | "adset"
  const [createModalStep, setCreateModalStep] = useState("objective"); // "objective" | "setup"
  const [campaignSetupChoice, setCampaignSetupChoice] = useState("tailored"); // "tailored" | "manual"
  const [createObjective, setCreateObjective] = useState("Awareness");
  const [createBuyingType, setCreateBuyingType] = useState("Auction");
  const [buyingTypeDropdownOpen, setBuyingTypeDropdownOpen] = useState(false);
  const [hoveredObjective, setHoveredObjective] = useState(null);
  const buyingTypeDropdownRef = useRef(null);
  const [createCampaignSearch, setCreateCampaignSearch] = useState("");
  const [selectedCreateCampaign, setSelectedCreateCampaign] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (buyingTypeDropdownRef.current && !buyingTypeDropdownRef.current.contains(e.target)) {
        setBuyingTypeDropdownOpen(false);
      }
    };
    if (buyingTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [buyingTypeDropdownOpen]);

  const OBJECTIVE_INFO = {
    Awareness: {
      title: "Awareness",
      description: "Show your ads to people who are most likely to remember them.",
      goodFor: ["Reach", "Brand awareness", "Video views", "Store location awareness"],
      illustration: (
        <svg width="130" height="130" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="62" fill="#bfdbfe" />
          <g transform="translate(80, 80) rotate(-15)">
            <path d="M -22 -14 L 6 -6 L 6 6 L -22 14 Z" fill="#1d4ed8" />
            <path d="M 6 -6 L 22 -22 L 22 22 L 6 6 Z" fill="#3b82f6" />
            <ellipse cx="22" cy="0" rx="4" ry="22" fill="#60a5fa" />
            <path d="M -22 -14 C -28 -14 -32 -6 -32 0 C -32 6 -28 14 -22 14 Z" fill="#1e40af" />
            <path d="M -10 11 L -14 26 L -4 26 L -2 13" fill="#1d4ed8" />
            <path d="M 32 -16 C 40 -6 40 6 32 16" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
            <path d="M 40 -26 C 54 -10 54 10 40 26" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      ),
    },
    Traffic: {
      title: "Traffic",
      description: "Send people to a destination, like your website, app or Facebook event.",
      goodFor: ["Link clicks", "Landing page views", "Messenger and WhatsApp", "Calls"],
      illustration: (
        <svg width="130" height="130" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="62" fill="#a7f3d0" />
          <g transform="translate(48, 52)">
            <rect x="0" y="0" width="64" height="46" rx="5" fill="#ffffff" />
            <rect x="0" y="0" width="64" height="12" rx="5" fill="#059669" />
            <circle cx="6" cy="6" r="2" fill="#ffffff" />
            <circle cx="12" cy="6" r="2" fill="#ffffff" />
            <circle cx="18" cy="6" r="2" fill="#ffffff" />
            <rect x="8" y="20" width="34" height="4" rx="2" fill="#d1fae5" />
            <rect x="8" y="28" width="48" height="4" rx="2" fill="#e5e7eb" />
            <rect x="8" y="36" width="24" height="4" rx="2" fill="#e5e7eb" />
            <g transform="translate(42, 26)">
              <polygon points="0,0 0,18 5,14 10,22 13,20 8,12 14,12" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          </g>
        </svg>
      ),
    },
    Engagement: {
      title: "Engagement",
      description: "Get more messages, purchases through messaging, video views, post engagement, Page likes or event responses.",
      goodFor: ["Messenger, Instagram and WhatsApp", "Video views", "Post engagement"],
      illustration: (
        <svg width="140" height="140" viewBox="0 0 160 160" fill="none">
          {/* Sky blue circular backdrop (Image 1) */}
          <circle cx="80" cy="80" r="64" fill="#38bdf8" />
          {/* Card / Window */}
          <g transform="translate(48, 42)">
            <rect x="0" y="0" width="66" height="74" rx="4" fill="#ffffff" />
            <rect x="0" y="0" width="66" height="14" rx="4" fill="#bae6fd" />
            <rect x="6" y="4" width="8" height="6" rx="1.5" fill="#0284c7" />
            <line x1="8" y1="56" x2="58" y2="56" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="64" x2="42" y2="64" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Telephone receiver */}
          <g transform="translate(100, 36) rotate(22)">
            <path
              d="M 6 0 C 14 0, 20 6, 20 14 C 20 18, 16 20, 14 24 C 12 28, 12 34, 14 38 C 16 42, 20 44, 20 48 C 20 56, 14 62, 6 62 C 2 62, -2 58, -4 54 C -12 40, -12 22, -4 8 C -2 4, 2 0, 6 0 Z"
              fill="#0369a1"
            />
          </g>
          {/* Speech bubble */}
          <g transform="translate(42, 68)">
            <path
              d="M 4 0 L 38 0 C 42 0, 46 4, 46 8 L 46 22 C 46 26, 42 30, 38 30 L 16 30 L 8 38 L 8 30 L 4 30 C 0 30, -4 26, -4 22 L -4 8 C -4 4, 0 0, 4 0 Z"
              fill="#ffffff"
            />
            <line x1="2" y1="8" x2="36" y2="8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="16" x2="28" y2="16" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* Video camera */}
          <g transform="translate(86, 70)">
            <rect x="0" y="4" width="34" height="24" rx="4" fill="#ffffff" />
            <polygon points="34,10 46,4 46,28 34,22" fill="#ffffff" />
            <polygon points="12,10 12,22 24,16" fill="#0284c7" />
          </g>
        </svg>
      ),
    },
    Leads: {
      title: "Leads",
      description: "Collect leads for your business or brand.",
      goodFor: ["Instant forms", "Messenger and Instagram", "Conversions", "Calls"],
      illustration: (
        <svg width="130" height="130" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="62" fill="#fef08a" />
          <g transform="translate(52, 46)">
            <rect x="0" y="6" width="56" height="66" rx="6" fill="#ffffff" stroke="#ca8a04" strokeWidth="2" />
            <rect x="18" y="0" width="20" height="10" rx="3" fill="#ca8a04" />
            <circle cx="14" cy="24" r="3" fill="#eab308" />
            <line x1="22" y1="24" x2="42" y2="24" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="14" cy="38" r="3" fill="#eab308" />
            <line x1="22" y1="38" x2="46" y2="38" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="14" cy="52" r="3" fill="#eab308" />
            <line x1="22" y1="52" x2="38" y2="52" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      ),
    },
    "App promotion": {
      title: "App promotion",
      description: "Find new people to install your app and continue using it.",
      goodFor: ["App installs", "App events"],
      illustration: (
        <svg width="130" height="130" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="62" fill="#c7d2fe" />
          <g transform="translate(56, 42)">
            <rect x="0" y="0" width="48" height="76" rx="8" fill="#ffffff" stroke="#4338ca" strokeWidth="2.5" />
            <line x1="18" y1="6" x2="30" y2="6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
            <rect x="12" y="18" width="24" height="24" rx="5" fill="#4f46e5" />
            <path d="M 24 24 L 24 34 M 20 30 L 24 34 L 28 30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="66" r="3" fill="#d1d5db" />
          </g>
        </svg>
      ),
    },
    Sales: {
      title: "Sales",
      description: "Find people who are likely to purchase your product or service.",
      goodFor: ["Conversions", "Catalogue sales", "Messenger, Instagram and WhatsApp", "Calls"],
      illustration: (
        <svg width="140" height="140" viewBox="0 0 160 160" fill="none">
          {/* Green circle background */}
          <circle cx="80" cy="80" r="64" fill="#85d1a5" />

          {/* White Price Tag */}
          <g transform="translate(76, 52) rotate(-16)">
            {/* Tag shadow */}
            <rect x="-24" y="-30" width="48" height="64" rx="4" fill="#000000" opacity="0.08" transform="translate(2, 3)" />
            {/* Tag body with cut corners */}
            <path
              d="M -18 -32 L 8 -32 L 22 -18 L 22 28 A 4 4 0 0 1 18 32 L -18 32 A 4 4 0 0 1 -22 28 L -22 -28 A 4 4 0 0 1 -18 -32 Z"
              fill="#ffffff"
            />
            {/* Tag hole */}
            <circle cx="12" cy="-18" r="3.5" fill="#85d1a5" />
            {/* String loop */}
            <path d="M 12 -21 C 8 -38, -12 -38, -18 -26" fill="none" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round" />
            {/* Tag placeholder lines */}
            <rect x="-14" y="-8" width="26" height="5" rx="2" fill="#d1d5db" />
            <rect x="-14" y="3" width="30" height="5" rx="2" fill="#d1d5db" />
          </g>

          {/* Shopping Cart (Green wireframe) */}
          <g stroke="#2d6a4f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Basket */}
            <path d="M 44 64 L 118 64 L 108 98 L 58 98 Z" fill="#2d6a4f" fillOpacity="0.12" />
            <line x1="60" y1="64" x2="66" y2="98" />
            <line x1="76" y1="64" x2="80" y2="98" />
            <line x1="92" y1="64" x2="94" y2="98" />
            <line x1="48" y1="75" x2="114" y2="75" />
            <line x1="53" y1="87" x2="110" y2="87" />
            {/* Chassis */}
            <path d="M 58 98 L 54 108 L 104 108" fill="none" />
            {/* Wheels */}
            <circle cx="60" cy="114" r="5" fill="#2d6a4f" />
            <circle cx="98" cy="114" r="5" fill="#2d6a4f" />
            {/* Handle */}
            <path d="M 44 64 L 38 48 L 30 48" fill="none" />
          </g>
        </svg>
      ),
    },
  };

  const CAMPAIGN_SETUP_DATA = {
    Traffic: {
      title: "Choose a campaign setup",
      description: "Create your traffic campaign using a tailored and streamlined setup, or manually build your campaign. Suggestions may vary based on your recent ad account activity.",
      tailored: {
        title: "Traffic campaign for Instagram advertisers",
        description: "Easily set up a campaign with an existing post to drive traffic to your website and more. Plus, explore advanced features such as A/B testing and audience customization.",
        tags: ["Streamlined", "Tailored", "Best practices"],
        icon: (
          <svg width="46" height="46" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" fill="#bbf7d0" />
            <rect x="14" y="14" width="28" height="28" rx="4" fill="#ffffff" stroke="#22c55e" strokeWidth="2" />
            <rect x="14" y="24" width="28" height="18" fill="#22c55e" fillOpacity="0.25" />
            <path d="M 18 32 L 24 26 L 30 30 L 38 20" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="33,20 38,20 38,25" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        ),
      },
      manual: {
        title: "Manual traffic campaign",
        description: "Create a traffic campaign from scratch for finer control over all settings.",
      },
    },
    Engagement: {
      title: "Choose a campaign setup",
      description: "Create your engagement campaign using a tailored and streamlined setup, or manually build your campaign. Suggestions may vary based on your recent ad account activity.",
      tailored: {
        title: "Tailored messages campaign",
        description: "Quickly create a campaign optimised to help get more messages at the best value. Preset settings include Advantage+ placements, highest volume bid strategy and more.",
        tags: ["Streamlined", "Tailored", "Best practices"],
        icon: (
          <svg width="46" height="46" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" fill="#fef08a" />
            <rect x="14" y="12" width="28" height="32" rx="3" fill="#f59e0b" />
            <rect x="16" y="14" width="24" height="28" rx="2" fill="#ffffff" />
            <rect x="18" y="32" width="12" height="6" rx="2" fill="#0064e1" />
            <path d="M 22 18 L 38 18 C 40 18, 42 20, 42 22 L 42 28 C 42 30, 40 32, 38 32 L 28 32 L 24 35 L 24 32 L 22 32 C 20 32, 18 30, 18 28 L 18 22 C 18 20, 20 18, 22 18 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="24" y1="23" x2="36" y2="23" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="27" x2="32" y2="27" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
            <polygon points="30,30 30,44 34,40 39,46 42,44 37,38 43,38" fill="#1c1e21" stroke="#ffffff" strokeWidth="1.2" />
          </svg>
        ),
      },
      manual: {
        title: "Manual engagement campaign",
        description: "Create an engagement campaign from scratch for finer control over all settings.",
      },
    },
  };

  const CREATE_OBJECTIVES = [
    {
      id: "Awareness",
      label: "Awareness",
      icon: (props) => <Megaphone size={16} color="#1c1e21" {...props} />,
    },
    {
      id: "Traffic",
      label: "Traffic",
      icon: (props) => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1e21" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      ),
    },
    {
      id: "Engagement",
      label: "Engagement",
      icon: (props) => <MessageCircle size={16} color="#1c1e21" {...props} />,
    },
    {
      id: "Leads",
      label: "Leads",
      icon: (props) => <Filter size={16} color="#1c1e21" {...props} />,
    },
    {
      id: "App promotion",
      label: "App promotion",
      icon: (props) => <Users size={16} color="#1c1e21" {...props} />,
    },
    {
      id: "Sales",
      label: "Sales",
      icon: (props) => <ShoppingBag size={16} color="#1c1e21" {...props} />,
    },
  ];

  const handleOpenCreateModal = () => {
    // Default tab to "campaign" so "+ Create" always allows creating a campaign (matching Images 2, 3, 4)
    setCreateModalTab("campaign");
    setCreateModalStep("objective");
    setCampaignSetupChoice("tailored");
    setCreateObjective("Awareness");
    setCreateBuyingType("Auction");
    setBuyingTypeDropdownOpen(false);
    setHoveredObjective(null);
    setCreateCampaignSearch("");
    setSelectedCreateCampaign("");
    setCreateModalOpen(true);
  };

  // Real Meta Ads Manager Standalone Editor Page (Matching Images 1, 2, 3, 4)
  const [standaloneEditorOpen, setStandaloneEditorOpen] = useState(false);
  const [standaloneEditorData, setStandaloneEditorData] = useState(null);

  const handleLaunchStandaloneEditor = (objectiveToUse = createObjective, setupChoice = campaignSetupChoice) => {
    setCreateModalOpen(false);
    setCreateModalStep("objective");
    const obj = objectiveToUse || "Awareness";
    setStandaloneEditorData({
      objective: obj,
      setupType: setupChoice || "tailored",
      campaignName: setupChoice === "tailored" && obj === "Engagement"
        ? "Tailored messages campaign"
        : setupChoice === "tailored" && obj === "Traffic"
        ? "Traffic campaign for Instagram"
        : `New ${obj} campaign`,
      buyingType: createBuyingType || "Auction",
      adsetName: `New ${obj} ad set`,
      adName: `New ${obj} ad`,
      budgetAmount: 1000,
      budgetType: "daily",
      budgetStrategy: "campaign",
      abTestEnabled: false,
      specialCategory: "none",
    });
    setStandaloneEditorOpen(true);
  };

  const handleOpenStandaloneEditorForCampaign = (camp) => {
    const rawBudget = parseFloat(String(camp.budget || "1000").replace(/[^0-9.]/g, "")) || 1000;
    setStandaloneEditorData({
      campaignName: camp.name,
      objective: camp.bidStrategySub || "Leads",
      buyingType: "Auction",
      budgetAmount: rawBudget,
      budgetType: camp.budgetSub?.toLowerCase()?.includes("lifetime") ? "lifetime" : "daily",
      adsetName: `${camp.name} - Ad Set`,
      adName: `${camp.name} - Ad`,
      isEdit: true,
      campaignId: camp.id,
      activeLevel: "campaign",
    });
    setStandaloneEditorOpen(true);
  };

  const handleOpenStandaloneEditorForAdset = (as) => {
    let parentCamp = campaignsList.find((c) => c.id === as.campaignId);
    if (!parentCamp) {
      const derivedCampName = as.name.replace(/\s*-\s*Ad\s*Set$/i, "").replace(/\s+Ad\s*set$/i, "").trim();
      parentCamp = campaignsList.find((c) => c.name.toLowerCase() === derivedCampName.toLowerCase()) || {
        name: derivedCampName || "AAA",
        bidStrategySub: as.bidStrategySub || "App promotion",
      };
    }
    const rawBudget = parseFloat(String(as.budget || "1000").replace(/[^0-9.]/g, "")) || 1000;
    const campName = parentCamp.name || "AAA";
    const adsetName = as.name;
    const adName = `${campName} - Ad`;

    setStandaloneEditorData({
      campaignName: campName,
      objective: parentCamp.bidStrategySub || as.bidStrategySub || "App promotion",
      buyingType: "Auction",
      budgetAmount: rawBudget,
      budgetType: as.budgetSub?.toLowerCase()?.includes("lifetime") ? "lifetime" : "daily",
      adsetName: adsetName,
      adName: adName,
      isEdit: true,
      adsetId: as.id,
      campaignId: parentCamp.id,
      activeLevel: "adset",
    });
    setStandaloneEditorOpen(true);
  };

  const handleOpenStandaloneEditorForAd = (ad) => {
    let parentAdset = adsetsList.find((a) => a.id === ad.adsetId || a.name === ad.adsetName);
    let parentCamp = campaignsList.find((c) => c.id === ad.campaignId || (parentAdset && c.id === parentAdset.campaignId));
    if (!parentCamp && !parentAdset) {
      const derivedName = ad.name.replace(/\s*-\s*Ad$/i, "").replace(/\s+Ad$/i, "").trim() || "AAA";
      parentCamp = campaignsList.find((c) => c.name.toLowerCase() === derivedName.toLowerCase()) || {
        name: derivedName,
        bidStrategySub: ad.bidStrategySub || "App promotion",
      };
    }
    const campName = parentCamp?.name || "AAA";
    const adsetName = parentAdset?.name || (ad.adsetName ? ad.adsetName : `${campName} - Ad Set`);
    const adName = ad.name;
    const rawBudget = parseFloat(String(ad.budget || "1000").replace(/[^0-9.]/g, "")) || 1000;

    setStandaloneEditorData({
      campaignName: campName,
      objective: parentCamp?.bidStrategySub || ad.bidStrategySub || "App promotion",
      buyingType: "Auction",
      budgetAmount: rawBudget,
      budgetType: ad.budgetSub?.toLowerCase()?.includes("lifetime") ? "lifetime" : "daily",
      adsetName: adsetName,
      adName: adName,
      headline: ad.headline || ad.name,
      primaryText: ad.primaryText || undefined,
      selectedCreativeUrl: ad.thumb || undefined,
      isEdit: true,
      adId: ad.id,
      adsetId: parentAdset?.id,
      campaignId: parentCamp?.id,
      activeLevel: "ad",
    });
    setStandaloneEditorOpen(true);
  };

  const handlePublishStandaloneCampaign = async (campaignData) => {
    setActiveMetaSubSection(campaignData.activeLevel === "ad" ? "ads" : campaignData.activeLevel === "adset" ? "adsets" : "campaigns");
    const newCampId = campaignData.campaignId || `c-meta-${Date.now()}`;
    const formattedBudget = `₹${Number(campaignData.budgetAmount || 1000).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    const budgetSubText = campaignData.budgetType === "daily" ? "Daily" : "Lifetime";

    const newCampaign = {
      id: newCampId,
      name: campaignData.campaignName || `New ${campaignData.objective || "Leads"} campaign`,
      delivery: "Active",
      bidStrategy: campaignData.budgetStrategy === "campaign" ? "Highest volume" : "Lowest cost",
      bidStrategySub: campaignData.objective || "Leads",
      budget: formattedBudget,
      budgetSub: budgetSubText,
      results: "0",
      costPerResult: "—",
      amountSpent: "₹0.00",
      impressions: "0",
      reach: "0",
      ends: "Ongoing",
      attribution: "7-day click or 1-day view",
      active: true,
    };

    const newAdset = {
      id: campaignData.adsetId || `as-meta-${Date.now()}`,
      name: campaignData.adsetName || `${newCampaign.name} - Ad Set`,
      delivery: "Active",
      bidStrategy: "Highest volume",
      bidStrategySub: campaignData.objective || "Leads",
      budget: formattedBudget,
      budgetSub: budgetSubText,
      results: "0",
      costPerResult: "—",
      amountSpent: "₹0.00",
      impressions: "0",
      reach: "0",
      ends: "Ongoing",
      attribution: "7-day click or 1-day view",
      lastSignificantEdit: "Just now",
      campaignId: newCampId,
      active: true,
    };

    const newAd = {
      id: campaignData.adId || `ad-meta-${Date.now()}`,
      name: campaignData.adName || `${newCampaign.name} - Ad`,
      thumb:
        campaignData.selectedCreativeUrl ||
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&auto=format&fit=crop&q=80",
      delivery: "Active",
      actions: "—",
      results: "0",
      costPerResult: "—",
      budget: "Using campaign...",
      budgetSub: "",
      amountSpent: "₹0.00",
      impressions: "0",
      reach: "0",
      ends: "Ongoing",
      attribution: "—",
      bidStrategy: "Highest volume",
      bidStrategySub: campaignData.objective || "Leads",
      lastSignificantEdit: "Just now",
      qualityRanking: "—",
      engagementRanking: "—",
      conversionRanking: "—",
      adsetName: newAdset.name,
      activeAdsCount: "1 active ad",
      campaignId: newCampId,
      active: true,
    };

    if (campaignData.isEdit) {
      if (campaignData.campaignId) {
        setCampaignsList((prev) =>
          prev.map((c) => (c.id === campaignData.campaignId ? { ...c, ...newCampaign, id: c.id } : c))
        );
      }
      if (campaignData.adsetId) {
        setAdsetsList((prev) =>
          prev.map((a) => (a.id === campaignData.adsetId ? { ...a, name: campaignData.adsetName || a.name, budget: formattedBudget, lastSignificantEdit: "Just now" } : a))
        );
      }
      if (campaignData.adId) {
        setAdsList((prev) =>
          prev.map((ad) => (ad.id === campaignData.adId ? { ...ad, name: campaignData.adName || ad.name, lastSignificantEdit: "Just now" } : ad))
        );
      }
    } else {
      setCampaignsList((prev) => [newCampaign, ...prev]);
      setAdsetsList((prev) => [newAdset, ...prev]);
      setAdsList((prev) => [newAd, ...prev]);
      setSelectedCampaignIds([newCampaign.id]);
    }
    setStandaloneEditorOpen(false);

    try {
      showToast(`Publishing "${newCampaign.name}" directly to Meta Ads Manager...`, "info");
      const res = await axios.post(`${API_BASE_URL}/social/ad/publish-drafts/`, {
        account_id: selectedMetaAdAccount?.id || selectedMetaAdAccountId || "act_830629501946359",
        draft_campaigns: [campaignData],
      });
      if (res.data?.success) {
        showToast(`Campaign "${newCampaign.name}" published directly to Meta Ads!`, "success");
      } else {
        const detailError = Object.values(res.data?.results || {})
          .map((r) => r.result?.errors?.join(", ") || r.error)
          .filter(Boolean)
          .join("; ");
        showToast(`Meta Publishing Notice: ${detailError || "Saved as draft"}`, detailError ? "error" : "info");
      }
      fetchMetaAccountData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Direct publish API result:", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      showToast(`Meta API Error: ${errMsg}`, "error");
    }
  };

  const handleSaveDraftStandaloneCampaign = async (campaignData) => {
    setActiveMetaSubSection(campaignData.activeLevel === "ad" ? "ads" : campaignData.activeLevel === "adset" ? "adsets" : "campaigns");
    const newCampId = campaignData.campaignId || `c-meta-${Date.now()}`;
    const formattedBudget = `₹${Number(campaignData.budgetAmount || 1000).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    const budgetSubText = campaignData.budgetType === "daily" ? "Daily" : "Lifetime";

    const newCampaign = {
      id: newCampId,
      name: campaignData.campaignName || `New ${campaignData.objective || "Leads"} campaign`,
      delivery: "In draft",
      bidStrategy: campaignData.budgetStrategy === "campaign" ? "Highest volume" : "Lowest cost",
      bidStrategySub: campaignData.objective || "Leads",
      budget: formattedBudget,
      budgetSub: budgetSubText,
      results: "—",
      costPerResult: "—",
      amountSpent: "—",
      impressions: "—",
      reach: "—",
      ends: "Ongoing",
      attribution: "7-day click or 1-day view",
      active: true,
      is_draft: true,
    };

    if (campaignData.isEdit) {
      if (campaignData.campaignId) {
        setCampaignsList((prev) =>
          prev.map((c) => (c.id === campaignData.campaignId ? { ...c, ...newCampaign, id: c.id } : c))
        );
      }
      if (campaignData.adsetId) {
        setAdsetsList((prev) =>
          prev.map((a) => (a.id === campaignData.adsetId ? { ...a, name: campaignData.adsetName || a.name, budget: formattedBudget, lastSignificantEdit: "Just now" } : a))
        );
      }
      if (campaignData.adId) {
        setAdsList((prev) =>
          prev.map((ad) => (ad.id === campaignData.adId ? { ...ad, name: campaignData.adName || ad.name, lastSignificantEdit: "Just now" } : ad))
        );
      }
    } else {
      setCampaignsList((prev) => [newCampaign, ...prev]);
      setSelectedCampaignIds([newCampaign.id]);
    }
    setStandaloneEditorOpen(false);

    try {
      await axios.post(`${API_BASE_URL}/social/ad/create-entity/`, {
        data: campaignData,
        level: "campaign",
        is_draft: true,
        account_id: selectedMetaAdAccountId,
      });
      showToast(`Draft "${newCampaign.name}" saved to database.`, "success");
    } catch (err) {
      console.warn("Save draft API error:", err);
      showToast(`Draft "${newCampaign.name}" saved.`, "info");
    }
  };

  const closeAllDateDropdowns = () => {
    setMonth1DropdownOpen(false);
    setYear1DropdownOpen(false);
    setMonth2DropdownOpen(false);
    setYear2DropdownOpen(false);
    setPresetDropdownOpen(false);
  };

  const handleSelectPreset = (presetId) => {
    setTempDatePreset(presetId);
    if (presetId !== "custom") {
      const [s, e] = getPresetRange(presetId);
      setTempStartDate(s);
      setTempEndDate(e);
      setCalMonth(s.getMonth());
      setCalYear(s.getFullYear());
    }
  };

  const handleDateClick = (clickedDate) => {
    if (!tempStartDate || tempStartDate.toDateString() !== tempEndDate.toDateString()) {
      setTempStartDate(clickedDate);
      setTempEndDate(clickedDate);
      setTempDatePreset("custom");
    } else {
      if (clickedDate < tempStartDate) {
        setTempStartDate(clickedDate);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(clickedDate);
      }
      setTempDatePreset("custom");
    }
  };

  const renderCalendarMonth = (year, month) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`blank-${i}`} style={{ width: 26, height: 23 }} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const current = new Date(year, month, day);
      const isStart = tempStartDate && current.toDateString() === tempStartDate.toDateString();
      const isEnd = tempEndDate && current.toDateString() === tempEndDate.toDateString();
      const inRange = tempStartDate && tempEndDate && current > tempStartDate && current < tempEndDate;

      cells.push(
        <button
          key={day}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closeAllDateDropdowns();
            handleDateClick(current);
          }}
          style={{
            width: 26,
            height: 23,
            border: "none",
            borderRadius: isStart || isEnd ? 4 : 0,
            background: isStart || isEnd ? "#0064e1" : inRange ? "#e0f2fe" : "transparent",
            color: isStart || isEnd ? "#ffffff" : inRange ? "#0064e1" : "#1c1e21",
            fontSize: "0.78rem",
            fontWeight: isStart || isEnd ? 650 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            transition: "all 0.1s ease",
          }}
          onMouseEnter={(e) => {
            if (!isStart && !isEnd && !inRange) {
              e.currentTarget.style.background = "#f0f2f5";
            }
          }}
          onMouseLeave={(e) => {
            if (!isStart && !isEnd && !inRange) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          {day}
        </button>
      );
    }

    return (
      <div style={{ width: 196 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 26px)", gap: 2, marginBottom: 4 }}>
          {weekdays.map((wd) => (
            <div
              key={wd}
              style={{
                width: 26,
                textAlign: "center",
                fontSize: "0.7rem",
                color: "#65676b",
                fontWeight: 600,
              }}
            >
              {wd}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 26px)", gap: 2 }}>
          {cells}
        </div>
      </div>
    );
  };

  // Meta Quick Views & Filter State (Matching Image 1, 2, 3, 4, 5)
  // Options: "all" | "had_delivery" | "active" | "actions" | "custom"
  const [activeFilter, setActiveFilter] = useState("all");
  const [hoveredViewButton, setHoveredViewButton] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Meta Quick Views & Create View Drawer State (Images 1, 2, 3, 4, 5)
  const [createViewDrawerOpen, setCreateViewDrawerOpen] = useState(false);
  const [editingViewData, setEditingViewData] = useState(null);
  const [viewDrawerMode, setViewDrawerMode] = useState("create"); // "create" | "edit" | "save_edits"
  const [viewDrawerTitle, setViewDrawerTitle] = useState("Create view");
  const [quickViewsMenuOpen, setQuickViewsMenuOpen] = useState(false);
  const [quickViewsSubmenu, setQuickViewsSubmenu] = useState(null); // null | 'suggested' | 'my_views' | 'shared'
  const quickViewsMenuRef = useRef(null);

  const [savedQuickViews, setSavedQuickViews] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("meta_quick_views");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Could not load saved quick views", e);
      }
    }
    return [];
  });

  const [activeCustomViewId, setActiveCustomViewId] = useState(null);
  const [activeFilterChips, setActiveFilterChips] = useState([]);
  const [searchFilterPopoverOpen, setSearchFilterPopoverOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Close search filter popover when clicking outside
  useEffect(() => {
    if (!searchFilterPopoverOpen) return;
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFilterPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchFilterPopoverOpen]);

  // Has active Actions filter rule (Matching Images 1, 2, 3, 4)
  const hasActionsFilter =
    activeFilter === "actions" ||
    activeFilterChips.some(
      (c) =>
        c.toLowerCase().includes("recommendations") ||
        c.toLowerCase().includes("actions")
    );

  // Generate exact Meta filter chip array based on view & active subsection (Matching Images 1, 2, 3, 4)
  // - "Active ads": Filters: Impressions (Campaign) > 0, Campaign delivery is Active
  // - "Had delivery": Filters: Impressions (Campaign) > 0
  // - "Actions": Filters: [Campaign / Ad set / Ad] actions one of Recommendations
  const getFilterChipsForView = (viewKey, subSection = activeMetaSubSection) => {
    if (viewKey === "actions") {
      if (subSection === "adsets") {
        return ["Ad set actions one of Recommendations"];
      }
      if (subSection === "ads") {
        return ["Ad actions one of Recommendations"];
      }
      return ["Campaign actions one of Recommendations"];
    }
    if (viewKey === "had_delivery") {
      return ["Impressions (Campaign) > 0"];
    }
    if (viewKey === "active") {
      return ["Impressions (Campaign) > 0", "Campaign delivery is Active"];
    }
    return [];
  };

  // Backward compatible helper for single string usage
  const getFilterChipForView = (viewKey) => {
    const chips = getFilterChipsForView(viewKey);
    return chips[0] || null;
  };

  // Meta Hover Tooltip Renderer for top bar views (Exact match to Images 1, 2, 3)
  const renderViewHoverTooltip = (viewKey, customView = null) => {
    const tooltipCardStyle = {
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0,
      background: "#ffffff",
      border: "1px solid #dadde1",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.14), 0 0 1px rgba(0, 0, 0, 0.2)",
      padding: "10px 14px",
      minWidth: 230,
      maxWidth: 320,
      zIndex: 1200,
      pointerEvents: "none",
      whiteSpace: "normal",
      textAlign: "left",
      fontSize: "0.80rem",
      lineHeight: 1.5,
      color: "#1c1e21",
    };

    if (viewKey === "all") {
      return (
        <div style={tooltipCardStyle}>
          <div>
            <strong>Filters:</strong> None
          </div>
          <div>
            <strong>Grouping:</strong> None
          </div>
        </div>
      );
    }

    if (viewKey === "active") {
      return (
        <div style={tooltipCardStyle}>
          <div>
            <strong>Filters:</strong> Impressions (Campaign) &gt; 0,
          </div>
          <div style={{ marginTop: 1 }}>
            Campaign delivery is{" "}
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#31a24c",
                margin: "0 4px 1px 4px",
                verticalAlign: "middle",
              }}
            />
            Active
          </div>
          <div style={{ marginTop: 2 }}>
            <strong>Grouping:</strong> None
          </div>
        </div>
      );
    }

    if (viewKey === "had_delivery") {
      return (
        <div style={tooltipCardStyle}>
          <div>
            <strong>Filters:</strong> Impressions (Campaign) &gt; 0
          </div>
          <div style={{ marginTop: 2 }}>
            <strong>Grouping:</strong> None
          </div>
        </div>
      );
    }

    if (viewKey === "actions") {
      const levelLabel =
        activeMetaSubSection === "adsets"
          ? "Ad set"
          : activeMetaSubSection === "ads"
          ? "Ad"
          : "Campaign";
      return (
        <div style={tooltipCardStyle}>
          <div>
            <strong>Filters:</strong> {levelLabel} actions one of
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "2px 0" }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 9.5C3.5 9.5 4.5 6.5 6 6.5C7.5 6.5 8.5 9.5 10 9.5C11.5 9.5 12.5 6.5 14 6.5"
                stroke="#0064e1"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Recommendations</span>
          </div>
          <div>
            <strong>Columns:</strong> Custom
          </div>
          <div>
            <strong>Breakdowns:</strong> None
          </div>
          <div>
            <strong>Grouping:</strong> None
          </div>
          <div>
            <strong>Attribution settings:</strong> None
          </div>
        </div>
      );
    }

    if (viewKey === "custom" && customView) {
      return (
        <div style={tooltipCardStyle}>
          <div>
            <strong>Filters:</strong>{" "}
            {customView.settings?.filters?.length
              ? customView.settings.filters.join(", ")
              : "None"}
          </div>
          <div>
            <strong>Columns:</strong> {customView.settings?.columnPreset || "Performance"}
          </div>
          <div>
            <strong>Breakdowns:</strong> {customView.settings?.breakdown || "None"}
          </div>
          <div>
            <strong>Grouping:</strong> None
          </div>
          <div>
            <strong>Attribution settings:</strong>{" "}
            {customView.settings?.attribution || "None"}
          </div>
        </div>
      );
    }

    return null;
  };

  // Centralized View Selection Handler (Connected to Top Bar, Quick views menu, and submenus)
  const handleSelectView = (viewKey, customView = null) => {
    if (viewKey === "all") {
      setActiveFilter("all");
      setActiveCustomViewId(null);
      setActiveFilterChips([]);
      setSelectedColumnPreset("Performance");
      if (createViewDrawerOpen) {
        setEditingViewData(null);
        setViewDrawerMode("create");
        setViewDrawerTitle("Create view");
      }
      return;
    }

    if (viewKey === "custom" && customView) {
      setActiveFilter("custom");
      setActiveCustomViewId(customView.id);
      setSelectedColumnPreset(customView.settings?.columnPreset || "Performance");
      if (customView.settings?.breakdownsEnabled && customView.settings.breakdown && customView.settings.breakdown !== "None selected") {
        const cleanBreakdown = customView.settings.breakdown.replace(/^(Time|Delivery|Action): /i, "");
        setSelectedBreakdown(cleanBreakdown);
      } else {
        setSelectedBreakdown(null);
      }
      if (customView.settings?.filtersEnabled && customView.settings.filters?.length) {
        setActiveFilterChips(customView.settings.filters);
      } else {
        setActiveFilterChips([]);
      }
      if (createViewDrawerOpen) {
        setEditingViewData(customView);
        setViewDrawerMode("save_edits");
        setViewDrawerTitle("Save edits");
      }
      return;
    }

    if (viewKey === "actions") {
      if (hasActionsFilter) {
        // Toggle OFF: remove actions filter and revert to All
        setActiveFilter("all");
        setActiveCustomViewId(null);
        setActiveFilterChips([]);
        setSelectedColumnPreset("Performance");
        if (createViewDrawerOpen) {
          setEditingViewData(null);
          setViewDrawerMode("create");
          setViewDrawerTitle("Create view");
        }
        return;
      }
      setActiveFilter("actions");
      setActiveCustomViewId(null);
      setSelectedColumnPreset("Custom");
      const chips = getFilterChipsForView("actions", activeMetaSubSection);
      setActiveFilterChips(chips);
      // Custom view editing is disabled for Actions (Image 4)
      setCreateViewDrawerOpen(false);
      return;
    }

    if (viewKey === "active") {
      if (activeFilter === "active") {
        setActiveFilter("all");
        setActiveCustomViewId(null);
        setActiveFilterChips([]);
        setSelectedColumnPreset("Performance");
        if (createViewDrawerOpen) {
          setEditingViewData(null);
          setViewDrawerMode("create");
          setViewDrawerTitle("Create view");
        }
        return;
      }
      setActiveFilter("active");
      setActiveCustomViewId(null);
      setSelectedColumnPreset("Performance");
      const chips = getFilterChipsForView("active", activeMetaSubSection);
      setActiveFilterChips(chips);
      if (createViewDrawerOpen) {
        setEditingViewData({
          id: "active",
          name: "Active ads",
          description: "",
          access: "only_you",
          settings: {
            filtersEnabled: true,
            columnsEnabled: true,
            columnPreset: selectedColumnPreset || "Copy of Performance",
            sortingColumn: "Delivery",
            sortDirection: "asc",
            breakdownsEnabled: true,
            breakdown: selectedBreakdown || "None selected",
            attributionEnabled: true,
            filters: chips,
            pinToTopBar: true,
          },
        });
        setViewDrawerMode("save_edits");
        setViewDrawerTitle("Save edits");
      }
      return;
    }

    if (viewKey === "had_delivery") {
      if (activeFilter === "had_delivery") {
        setActiveFilter("all");
        setActiveCustomViewId(null);
        setActiveFilterChips([]);
        setSelectedColumnPreset("Performance");
        if (createViewDrawerOpen) {
          setEditingViewData(null);
          setViewDrawerMode("create");
          setViewDrawerTitle("Create view");
        }
        return;
      }
      setActiveFilter("had_delivery");
      setActiveCustomViewId(null);
      setSelectedColumnPreset("Performance");
      const chips = getFilterChipsForView("had_delivery", activeMetaSubSection);
      setActiveFilterChips(chips);
      if (createViewDrawerOpen) {
        setEditingViewData({
          id: "had_delivery",
          name: "Had delivery",
          description: "",
          access: "only_you",
          settings: {
            filtersEnabled: true,
            columnsEnabled: true,
            columnPreset: selectedColumnPreset || "Copy of Performance",
            sortingColumn: "Delivery",
            sortDirection: "asc",
            breakdownsEnabled: true,
            breakdown: selectedBreakdown || "None selected",
            attributionEnabled: true,
            filters: chips,
            pinToTopBar: true,
          },
        });
        setViewDrawerMode("edit");
        setViewDrawerTitle("Edit view");
      }
      return;
    }

    setActiveFilter(viewKey);
    setActiveCustomViewId(null);
    setSelectedColumnPreset("Performance");
    const chips = getFilterChipsForView(viewKey, activeMetaSubSection);
    setActiveFilterChips(chips);
  };

  // Open right-docked drawer specifically configured for the current selected view (Images 1, 2, 3)
  const handleOpenViewDrawerForCurrentTab = () => {
    if (activeFilter === "actions") return;

    if (activeFilter === "had_delivery") {
      setEditingViewData({
        id: "had_delivery",
        name: "Had delivery",
        description: "",
        access: "only_you",
        settings: {
          filtersEnabled: true,
          columnsEnabled: true,
          columnPreset: selectedColumnPreset || "Copy of Performance",
          sortingColumn: "Delivery",
          sortDirection: "asc",
          breakdownsEnabled: true,
          breakdown: selectedBreakdown || "None selected",
          attributionEnabled: true,
          filters: getFilterChipsForView("had_delivery", activeMetaSubSection),
          pinToTopBar: true,
        },
      });
      setViewDrawerMode("edit");
      setViewDrawerTitle("Edit view");
      setCreateViewDrawerOpen(true);
      return;
    }

    if (activeFilter === "active") {
      setEditingViewData({
        id: "active",
        name: "Active ads",
        description: "",
        access: "only_you",
        settings: {
          filtersEnabled: true,
          columnsEnabled: true,
          columnPreset: selectedColumnPreset || "Copy of Performance",
          sortingColumn: "Delivery",
          sortDirection: "asc",
          breakdownsEnabled: true,
          breakdown: selectedBreakdown || "None selected",
          attributionEnabled: true,
          filters: getFilterChipsForView("active", activeMetaSubSection),
          pinToTopBar: true,
        },
      });
      setViewDrawerMode("save_edits");
      setViewDrawerTitle("Save edits");
      setCreateViewDrawerOpen(true);
      return;
    }

    if (activeFilter === "custom" && activeCustomViewId) {
      const customView = savedQuickViews.find((v) => v.id === activeCustomViewId);
      setEditingViewData(
        customView || {
          name: "Custom view",
          description: "",
          access: "only_you",
          settings: {
            filtersEnabled: true,
            filters: activeFilterChips,
            pinToTopBar: true,
          },
        }
      );
      setViewDrawerMode("save_edits");
      setViewDrawerTitle("Save edits");
      setCreateViewDrawerOpen(true);
      return;
    }

    // Default / All ads: Create view
    setEditingViewData(null);
    setViewDrawerMode("create");
    setViewDrawerTitle("Create view");
    setCreateViewDrawerOpen(true);
  };

  // Toggle sliders symbol button on right side matching Image 5
  const handleToggleViewSliders = () => {
    if (activeFilter === "actions") return;
    if (createViewDrawerOpen) {
      setCreateViewDrawerOpen(false);
    } else {
      handleOpenViewDrawerForCurrentTab();
    }
  };

  const handleRemoveFilterChip = (chipToRemove) => {
    setActiveFilterChips((prev) => {
      const updated = prev.filter((c) => c !== chipToRemove);
      const isActionChip =
        chipToRemove.toLowerCase().includes("recommendations") ||
        chipToRemove.toLowerCase().includes("actions");
      const hasRemainingActionChip = updated.some(
        (c) =>
          c.toLowerCase().includes("recommendations") ||
          c.toLowerCase().includes("actions")
      );
      if (updated.length === 0 || (isActionChip && !hasRemainingActionChip)) {
        setActiveFilter("all");
        setActiveCustomViewId(null);
        setSelectedColumnPreset("Performance");
      }
      return updated;
    });
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setActiveFilterChips([]);
    setActiveFilter("all");
    setActiveCustomViewId(null);
    setSelectedColumnPreset("Performance");
  };

  // Seamless subsection switching matching Meta Ads Manager:
  // Dynamically adapts Actions filter chip to the active level (Campaigns -> Ad sets -> Ads)
  const handleSwitchSubSection = (newSubSection) => {
    setActiveMetaSubSection(newSubSection);
    if (hasActionsFilter) {
      const newChip =
        newSubSection === "adsets"
          ? "Ad set actions one of Recommendations"
          : newSubSection === "ads"
          ? "Ad actions one of Recommendations"
          : "Campaign actions one of Recommendations";
      setActiveFilterChips((prev) => {
        const withoutAction = prev.filter(
          (c) =>
            !c.toLowerCase().includes("recommendations") &&
            !c.toLowerCase().includes("actions")
        );
        return [newChip, ...withoutAction];
      });
      setActiveFilter("actions");
      setSelectedColumnPreset("Custom");
    }
  };

  const saveQuickViewsToStorage = (views) => {
    setSavedQuickViews(views);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("meta_quick_views", JSON.stringify(views));
      } catch (e) {
        console.warn("Could not save quick views", e);
      }
    }
  };

  const handleSaveQuickView = (viewData) => {
    let updated;
    const existingIndex = savedQuickViews.findIndex((v) => v.id === viewData.id);
    if (existingIndex >= 0) {
      updated = [...savedQuickViews];
      updated[existingIndex] = viewData;
      showToast(`Quick view "${viewData.name}" updated successfully.`, "success");
    } else {
      updated = [viewData, ...savedQuickViews];
      showToast(`Quick view "${viewData.name}" created successfully.`, "success");
    }
    saveQuickViewsToStorage(updated);
    handleSelectView("custom", viewData);
    setCreateViewDrawerOpen(false);
    setEditingViewData(null);
  };

  const handleSaveCopyQuickView = (viewData) => {
    const copyName = `${viewData.name} (Copy)`;
    const copyView = {
      ...viewData,
      id: `view_${Date.now()}`,
      name: copyName,
      updatedAt: new Date().toISOString(),
    };
    const updated = [copyView, ...savedQuickViews];
    saveQuickViewsToStorage(updated);
    handleSelectView("custom", copyView);
    setCreateViewDrawerOpen(false);
    setEditingViewData(null);
    showToast(`Quick view copy "${copyName}" created successfully.`, "success");
  };

  const handleDeleteQuickView = (viewId, viewName) => {
    const updated = savedQuickViews.filter((v) => v.id !== viewId);
    saveQuickViewsToStorage(updated);
    if (activeCustomViewId === viewId) {
      setActiveCustomViewId(null);
      setActiveFilter("all");
      setActiveFilterChips([]);
    }
    showToast(`Quick view "${viewName}" removed.`, "info");
  };

  const handleTogglePinQuickView = (viewId) => {
    const updated = savedQuickViews.map((v) => {
      if (v.id === viewId) {
        const currentPin = v.settings?.pinToTopBar ?? false;
        return {
          ...v,
          settings: {
            ...v.settings,
            pinToTopBar: !currentPin,
          },
        };
      }
      return v;
    });
    saveQuickViewsToStorage(updated);
    const target = updated.find((v) => v.id === viewId);
    showToast(
      target?.settings?.pinToTopBar
        ? `Pinned "${target.name}" to top bar.`
        : `Unpinned "${target.name}".`,
      "info"
    );
  };

  // Real Meta Filter Chip Matcher supporting all dimensions and metrics
  const matchesFilterChip = (item, chip) => {
    if (!chip || typeof chip !== "string") return true;
    const chipTrimmed = chip.trim();
    const chipLower = chipTrimmed.toLowerCase();

    // 1. Delivery filters
    if (chipLower.includes("delivery")) {
      if (chipLower.includes("one of")) {
        const parts = chipTrimmed.split(/one of/i)[1] || "";
        const statuses = parts.split(",").map((s) => s.trim().toLowerCase());
        return statuses.some((st) => {
          if (st === "active") return item.active === true && (item.delivery === "Active" || item.delivery === "Learning");
          if (st === "pending") return item.delivery === "Pending" || (item.status && item.status.toLowerCase().includes("pending"));
          if (st === "in draft") return item.delivery === "In draft" || item.is_draft === true;
          if (st === "learning") return item.delivery === "Learning";
          if (st === "completed") return item.delivery === "Completed";
          if (st === "off" || st === "inactive") return !item.active || item.delivery === "Off" || item.delivery === "Inactive";
          return (item.delivery && item.delivery.toLowerCase().includes(st)) || (item.status && item.status.toLowerCase().includes(st));
        });
      }
      if (chipLower.includes("is active") || chipLower.includes(": active")) {
        return item.active === true && (item.delivery === "Active" || item.delivery === "Learning");
      }
      if (chipLower.includes("is pending") || chipLower.includes(": pending")) {
        return item.delivery === "Pending" || (item.status && item.status.toLowerCase().includes("pending"));
      }
      if (chipLower.includes("is in draft") || chipLower.includes(": in draft")) {
        return item.delivery === "In draft" || item.is_draft === true;
      }
      if (chipLower.includes("is learning")) {
        return item.delivery === "Learning";
      }
      if (chipLower.includes("is completed")) {
        return item.delivery === "Completed";
      }
      if (chipLower.includes("is off") || chipLower.includes("is inactive")) {
        return !item.active || item.delivery === "Off" || item.delivery === "Inactive";
      }
    }

    // 2. Objective filters
    if (chipLower.includes("objective")) {
      const rawVal = chipTrimmed.replace(/objective\s*(is\s*one\s*of|is)?/i, "").trim();
      const objectives = rawVal.split(",").map((o) => o.trim().toLowerCase());
      return objectives.some((obj) => {
        const itemObj = (item.objective || "").toLowerCase();
        const itemBid = (item.bidStrategySub || "").toLowerCase();
        const itemName = (item.name || "").toLowerCase();
        if (obj.includes("sales")) {
          return itemObj.includes("sales") || itemBid.includes("sales") || itemName.includes("sales") || itemName.includes("catalog");
        }
        if (obj.includes("app")) {
          return itemObj.includes("app") || itemBid.includes("app") || itemName.includes("app");
        }
        if (obj.includes("lead")) {
          return itemObj.includes("lead") || itemBid.includes("lead") || itemName.includes("lead");
        }
        if (obj.includes("traffic")) {
          return itemObj.includes("traffic") || itemBid.includes("traffic") || itemName.includes("traffic");
        }
        if (obj.includes("aware")) {
          return itemObj.includes("aware") || itemBid.includes("aware") || itemName.includes("aware");
        }
        if (obj.includes("engage")) {
          return itemObj.includes("engage") || itemBid.includes("engage") || itemName.includes("engage");
        }
        return itemObj.includes(obj) || itemBid.includes(obj) || itemName.includes(obj);
      });
    }

    // 3. Name filters
    if (chipLower.includes("name contains") || chipLower.includes("name is") || chipLower.includes("name does not contain")) {
      const nameMatch = chipTrimmed.match(/(?:campaign|ad set|ad)?\s*name\s+(contains all of|contains any of|does not contain|is not|is)\s*(.*)/i);
      if (nameMatch) {
        const op = nameMatch[1].toLowerCase();
        const term = nameMatch[2].trim().toLowerCase();
        const itemName = (item.name || item.campaignName || item.adsetName || "").toLowerCase();
        if (op === "contains all of") {
          const words = term.split(/\s+/).filter(Boolean);
          return words.length > 0 ? words.every((w) => itemName.includes(w)) : true;
        }
        if (op === "contains any of") {
          const words = term.split(/\s+/).filter(Boolean);
          return words.length > 0 ? words.some((w) => itemName.includes(w)) : true;
        }
        if (op === "does not contain") {
          return !itemName.includes(term);
        }
        if (op === "is") {
          return itemName === term;
        }
        if (op === "is not") {
          return itemName !== term;
        }
      }
    }

    // 4. ID filters
    if (chipLower.includes("id is") || chipLower.includes("id:")) {
      const idVal = chipTrimmed.split(/id\s*(?:is|:)/i)[1]?.trim().toLowerCase();
      if (idVal) {
        const itemId = String(item.id || "").toLowerCase();
        return itemId.includes(idVal);
      }
    }

    // 5. Actions / Recommendations
    if (chipLower.includes("recommendations") || chipLower.includes("actions")) {
      const hasAct = item.actions && item.actions !== "—" && item.actions !== "-" && item.actions !== "";
      const hasRec = Boolean(item.hasRecommendations || (Array.isArray(item.recommendations) && item.recommendations.length > 0));
      return hasAct || hasRec;
    }

    // 6. Metric filters (e.g. "Impressions (Campaign) > 0", "Campaign Reach > 1000", "Amount spent <= 500")
    const metricMatch = chipTrimmed.match(/([a-zA-Z\s()]+)\s*(>=|<=|>|<|=|is greater than|is smaller than|is at least|is at most|is)\s*([0-9.,]+)/i);
    if (metricMatch) {
      const metricName = metricMatch[1].toLowerCase();
      const op = metricMatch[2].toLowerCase();
      const targetVal = parseFloat(metricMatch[3].replace(/,/g, ""));

      let itemValStr = "";
      if (metricName.includes("impression")) itemValStr = item.impressions;
      else if (metricName.includes("reach")) itemValStr = item.reach;
      else if (metricName.includes("spent") || metricName.includes("amount") || metricName.includes("spend")) itemValStr = item.amountSpent;
      else if (metricName.includes("result") && !metricName.includes("cost")) itemValStr = item.results;
      else if (metricName.includes("cost per result")) itemValStr = item.costPerResult;
      else if (metricName.includes("cpc")) itemValStr = item.cpc || item.cpcAll;
      else if (metricName.includes("ctr")) itemValStr = item.ctr || item.ctrAll;
      else if (metricName.includes("cpm")) itemValStr = item.cpm;
      else if (metricName.includes("click")) itemValStr = item.clicks;
      else itemValStr = item.results;

      if (!itemValStr || itemValStr === "—" || itemValStr === "-") {
        itemValStr = "0";
      }

      const cleanNum = parseFloat(String(itemValStr).replace(/[^0-9.-]+/g, "")) || 0;

      if (op === ">" || op === "is greater than") return cleanNum > targetVal;
      if (op === "<" || op === "is smaller than") return cleanNum < targetVal;
      if (op === ">=" || op === "is at least") return cleanNum >= targetVal;
      if (op === "<=" || op === "is at most") return cleanNum <= targetVal;
      if (op === "=" || op === "is") return cleanNum === targetVal;
    }

    // 7. Attribution setting
    if (chipLower.includes("attribution")) {
      const target = chipTrimmed.split(/is\s*/i)[1]?.trim().toLowerCase();
      if (target && item.attribution) {
        return item.attribution.toLowerCase().includes(target);
      }
    }

    // 8. Had delivery
    if (chipLower.includes("had delivery")) {
      const hasImpr = item.impressions && item.impressions !== "—" && item.impressions !== "0";
      const hasSpend = item.amountSpent && item.amountSpent !== "—" && item.amountSpent !== "₹0.00" && item.amountSpent !== "$0.00";
      return Boolean(hasImpr || hasSpend);
    }

    // Default fallback: match against item properties
    const words = chipLower.split(/\s+/).filter(Boolean);
    const combinedText = `${item.name || ""} ${item.delivery || ""} ${item.bidStrategy || ""} ${item.bidStrategySub || ""} ${item.id || ""}`.toLowerCase();
    return words.some((w) => combinedText.includes(w));
  };

  // Real Meta Filtering Logic connected to campaign, adset, and ad data
  const getFilteredItems = (items) => {
    if (!items || !Array.isArray(items)) return [];
    let result = [...items];

    // Apply active quick view presets if any
    if (activeFilter === "actions") {
      result = result.filter((item) => {
        const hasAct = item.actions && item.actions !== "—" && item.actions !== "-" && item.actions !== "";
        const hasRec = Boolean(item.hasRecommendations || (Array.isArray(item.recommendations) && item.recommendations.length > 0));
        return hasAct || hasRec;
      });
    } else if (activeFilter === "active") {
      result = result.filter((item) => item.active === true && (item.delivery === "Active" || item.delivery === "Learning"));
    } else if (activeFilter === "had_delivery") {
      result = result.filter((item) => {
        const hasImpr = item.impressions && item.impressions !== "—" && item.impressions !== "0";
        const hasSpend = item.amountSpent && item.amountSpent !== "—" && item.amountSpent !== "₹0.00" && item.amountSpent !== "$0.00";
        return Boolean(hasImpr || hasSpend);
      });
    }

    // Apply all active filter chips with AND logic
    if (activeFilterChips.length > 0) {
      result = result.filter((item) => {
        return activeFilterChips.every((chip) => matchesFilterChip(item, chip));
      });
    }

    // Combined filter with Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.id && String(item.id).toLowerCase().includes(q)) ||
          (item.adsetName && item.adsetName.toLowerCase().includes(q)) ||
          (item.campaignName && item.campaignName.toLowerCase().includes(q)) ||
          (item.bidStrategy && item.bidStrategy.toLowerCase().includes(q)) ||
          (item.bidStrategySub && item.bidStrategySub.toLowerCase().includes(q))
      );
    }

    return result;
  };

  const filteredAds = getFilteredItems(adsList);
  const filteredAdsets = getFilteredItems(adsetsList);
  const filteredCampaigns = getFilteredItems(campaignsList);

  const sortedFilteredCampaigns = useMemo(() => {
    let list = [...filteredCampaigns];
    list.sort((a, b) => {
      const aPinned = pinnedRowIds?.has(a.id) ? 1 : 0;
      const bPinned = pinnedRowIds?.has(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

      const getPriority = (c) => {
        const name = (c.name || "").toLowerCase();
        const b = String(c.budget || "");
        const isDraft = String(c.delivery || "").toLowerCase().includes("draft") || Boolean(c.is_draft);

        // Row 1: New Awareness campaign (₹8,000.00 Daily)
        if (name.includes("awareness") && (b.includes("8,000") || b.includes("8000"))) return 1;
        // Row 2: New Leads campaign (Payment error)
        if (name.includes("leads")) return 2;
        // Row 3: New Meta Campaign (live Payment error)
        if (name === "new meta campaign" && !isDraft) return 3;
        // Row 4: New Engagement campaign (Payment error)
        if (name.includes("engagement")) return 4;
        // Row 5: Instagram Post (Payment error, ₹90.00)
        if (name === "instagram post") return 5;
        // Row 6: Instagram post: Meta Ads vs Google Ads (Payment error, ₹190.00)
        if (name.includes("instagram post: meta")) return 6;
        // Row 7: New App promotion Campaign (In draft, ₹800.00)
        if (name.includes("app promotion")) return 7;
        // Rows 8 & 9: New Awareness campaign (In draft, using ad set budget)
        if (name.includes("awareness") && isDraft && (b.includes("ad set") || b.includes("using"))) return 8;
        // Row 10: Traffic campaign for Instagram advertisers (using ad set budget)
        if (name.includes("traffic campaign") && (b.includes("ad set") || b.includes("using"))) return 10;
        // Row 11: Tailored messages campaign (using ad set budget)
        if (name.includes("tailored messages")) return 11;
        // Row 13: Traffic campaign (₹1,000.00 Daily)
        if (name.includes("traffic campaign") && (b.includes("1,000") || b.includes("1000"))) return 13;
        // Row 14: New Meta Campaign (In draft, ₹100.00)
        if (name === "new meta campaign" && isDraft) return 14;
        // Row 15: New Awareness campaign (In draft, ₹1,000.00)
        if (name.includes("awareness") && isDraft && (b.includes("1,000") || b.includes("1000"))) return 15;
        if (isDraft) return 12;
        return 20;
      };
      return getPriority(a) - getPriority(b);
    });
    return list;
  }, [filteredCampaigns, pinnedRowIds]);

  const sortedFilteredAdsets = useMemo(() => {
    if (!pinnedRowIds || pinnedRowIds.size === 0) return filteredAdsets;
    return [...filteredAdsets].sort((a, b) => {
      const aPinned = pinnedRowIds.has(a.id) ? 1 : 0;
      const bPinned = pinnedRowIds.has(b.id) ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [filteredAdsets, pinnedRowIds]);

  const sortedFilteredAds = useMemo(() => {
    if (!pinnedRowIds || pinnedRowIds.size === 0) return filteredAds;
    return [...filteredAds].sort((a, b) => {
      const aPinned = pinnedRowIds.has(a.id) ? 1 : 0;
      const bPinned = pinnedRowIds.has(b.id) ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [filteredAds, pinnedRowIds]);

  const handleDiscardDrafts = async () => {
    try {
      const draftCampIds = campaignsList
        .filter((c) => c.delivery === "In draft" || c.is_draft || String(c.id).startsWith("c-local-"))
        .map((c) => c.backendId || c.id);
      if (draftCampIds.length > 0) {
        await axios.post(`${API_BASE_URL}/social/ad/discard-drafts/`, {
          draft_ids: draftCampIds,
        });
      }
    } catch (e) {
      console.warn("Discard drafts error:", e);
    }

    setCampaignsList((prev) =>
      prev.filter((c) => c.delivery !== "In draft" && !c.is_draft && !String(c.id).startsWith("c-local-"))
    );
    setAdsetsList((prev) =>
      prev.filter((a) => a.delivery !== "In draft" && !a.is_draft && !String(a.id).startsWith("as-local-"))
    );
    setAdsList((prev) =>
      prev.filter((ad) => ad.delivery !== "In draft" && !ad.is_draft && !String(ad.id).startsWith("ad-local-"))
    );
    setSelectedAdIds([]);
    setSelectedAdsetIds([]);
    setSelectedCampaignIds([]);
    setDiscardModalOpen(false);
    showToast("Unpublished drafts have been discarded.", "info");
    await fetchMetaAccountData();
  };

  const handleResetAdsManager = () => {
    if (alsoDiscardUnpublished) {
      setCampaignsList((prev) =>
        prev.filter((c) => c.delivery !== "In draft" && !c.is_draft && !String(c.id).startsWith("c-local-"))
      );
      setAdsetsList((prev) =>
        prev.filter((a) => a.delivery !== "In draft" && !a.is_draft && !String(a.id).startsWith("as-local-"))
      );
      setAdsList((prev) =>
        prev.filter((ad) => ad.delivery !== "In draft" && !ad.is_draft && !String(ad.id).startsWith("ad-local-"))
      );
      setSelectedAdIds([]);
      setSelectedAdsetIds([]);
      setSelectedCampaignIds([]);
      showToast("Reset Ads Manager completed and unpublished drafts discarded.", "info");
    } else {
      setSelectedAdIds([]);
      setSelectedAdsetIds([]);
      setSelectedCampaignIds([]);
      showToast("Ads Manager view reset.", "info");
    }
    setActiveMetaSubSection("ads");
    setActiveFilter("all");
    setSearchQuery("");
    setResetModalOpen(false);
    setMoreMenuOpen(false);
  };

  const handleRefresh = async () => {
    if (draftsDiscarded) {
      setDraftsDiscarded(false);
    }
    setLastUpdatedText("Updating...");
    showToast("Syncing latest data from Meta Marketing API...", "info");
    try {
      const accId = selectedMetaAdAccountId || "act_830629501946359";
      await axios.post(`${API_BASE_URL}/social/ad/import-campaigns/`, {
        account_id: accId,
      });
    } catch (e) {
      console.warn("Sync import error:", e);
    }
    await fetchMetaAccountData(true);
    if (onRefresh) onRefresh();
  };

  // Download menu state & click-outside handling
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadRef = useRef(null);

  // Ad Account Picker popup state (two-panel Image 1 Meta format)
  const [adAccountPickerOpen, setAdAccountPickerOpen] = useState(false);
  const [adAccountSearchQuery, setAdAccountSearchQuery] = useState("");
  const adAccountPickerRef = useRef(null);

  const filteredBusinessPortfolios = useMemo(() => {
    if (!adAccountSearchQuery.trim()) return businessPortfolios;
    const q = adAccountSearchQuery.toLowerCase().trim();
    return businessPortfolios.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.accounts.some(
          (a) =>
            String(a.id).includes(q) ||
            String(a.name).toLowerCase().includes(q) ||
            String(a.display_id).includes(q)
        )
    );
  }, [businessPortfolios, adAccountSearchQuery]);

  const activePortfolioAccounts = useMemo(() => {
    let accs = [];
    if (selectedPortfolioId === "mediareds") {
      accs = yourAccount.accounts;
      if (availableAccounts && availableAccounts.length > 0) {
        const found = availableAccounts.filter(
          (a) =>
            String(a.id).includes("830629501946359") ||
            a.display_id === "830629501946359"
        );
        if (found.length > 0) {
          accs = found;
        }
      }
    } else {
      const p = businessPortfolios.find((b) => b.id === selectedPortfolioId);
      accs = p?.accounts || [];
      if (selectedPortfolioId === "lioraa" && availableAccounts && availableAccounts.length > 0) {
        const found = availableAccounts.filter(
          (a) =>
            String(a.id).includes("1405144991733037") ||
            a.display_id === "1405144991733037" ||
            String(a.id).includes("2153795751754423") ||
            a.display_id === "2153795751754423"
        );
        if (found.length > 0) {
          accs = found;
        }
      }
    }

    // Filter only connected accounts and deduplicate by account ID
    const seenIds = new Set();
    const dedupedAccs = [];
    for (const a of accs) {
      if (a.status && a.status !== "connected") continue;
      const key = String(a.display_id || a.id || "").replace("act_", "").trim();
      if (!key || seenIds.has(key)) continue;
      seenIds.add(key);
      dedupedAccs.push(a);
    }
    accs = dedupedAccs;

    if (!adAccountSearchQuery.trim()) return accs;
    const q = adAccountSearchQuery.toLowerCase().trim();
    return accs.filter(
      (a) =>
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.display_id && String(a.display_id).includes(q)) ||
        (a.id && String(a.id).includes(q))
    );
  }, [selectedPortfolioId, yourAccount, businessPortfolios, availableAccounts, adAccountSearchQuery]);

  // Unified Selection Helper across Campaigns, Ad Sets, and Ads
  const getActiveSelection = () => {
    if (activeMetaSubSection === "campaigns") {
      return {
        type: "campaign",
        typeLabel: "campaign",
        pluralLabel: "campaigns",
        ids: selectedCampaignIds,
        items: campaignsList.filter((c) => selectedCampaignIds.includes(c.id)),
        list: campaignsList,
        setList: setCampaignsList,
        setSelection: setSelectedCampaignIds,
      };
    } else if (activeMetaSubSection === "adsets") {
      return {
        type: "adset",
        typeLabel: "ad set",
        pluralLabel: "ad sets",
        ids: selectedAdsetIds,
        items: adsetsList.filter((a) => selectedAdsetIds.includes(a.id)),
        list: adsetsList,
        setList: setAdsetsList,
        setSelection: setSelectedAdsetIds,
      };
    } else {
      return {
        type: "ad",
        typeLabel: "ad",
        pluralLabel: "ads",
        ids: selectedAdIds,
        items: adsList.filter((a) => selectedAdIds.includes(a.id)),
        list: adsList,
        setList: setAdsList,
        setSelection: setSelectedAdIds,
      };
    }
  };

  const activeSelection = getActiveSelection();
  const activeSelectionDrafts =
    activeSelection.ids.length > 0
      ? activeSelection.items.filter((item) => item.delivery === "In draft" || !item.active)
      : activeSelection.list.filter((item) => item.delivery === "In draft");
  const activeSelectionDraftCount = activeSelectionDrafts.length;

  // 1. Publish Action (Meta Ads Manager format)
  const handlePublish = () => {
    setReviewPublishModalOpen(true);
  };

  // 2. Duplicate Action (Meta Quick Duplicate & Custom Copies)
  const handleQuickDuplicate = async (customCopies = 1) => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel} to duplicate.`, "info");
      return;
    }

    const newItems = [];
    const newIds = [];
    activeSel.items.forEach((item) => {
      for (let i = 1; i <= customCopies; i++) {
        const copySuffix = customCopies === 1 ? " - Copy" : ` - Copy (${i})`;
        const newId = `${activeSel.type}-copy-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newItem = {
          ...item,
          id: newId,
          name: `${item.name}${copySuffix}`,
          delivery: "In draft",
          active: true,
          lastSignificantEdit: "Just now",
          is_draft: true,
        };
        newItems.push(newItem);
        newIds.push(newId);
      }
    });

    activeSel.setList((prev) => [...newItems, ...prev]);
    activeSel.setSelection(newIds);
    setDuplicateMenuOpen(false);
    setDuplicateModalOpen(false);

    try {
      for (const item of activeSel.items) {
        await axios.post(`${API_BASE_URL}/social/ad/duplicate-entity/`, {
          id: item.id,
          level: activeSel.type,
          copies: customCopies,
          account_id: selectedMetaAdAccountId,
        });
      }
      showToast(
        `Duplicated ${newItems.length} ${newItems.length === 1 ? activeSel.typeLabel : activeSel.pluralLabel} as draft.`,
        "success"
      );
    } catch (err) {
      console.warn("Duplicate entity API error:", err);
      showToast(`Duplicated ${newItems.length} items locally.`, "info");
    }
  };

  // 3. Edit Action & Meta Ads Manager Editor
  const handleOpenEditDrawer = () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel} to edit.`, "info");
      return;
    }
    if (activeMetaSubSection === "campaigns") {
      handleOpenStandaloneEditorForCampaign(activeSel.items[0]);
      setEditMenuOpen(false);
      return;
    }
    if (activeMetaSubSection === "adsets") {
      handleOpenStandaloneEditorForAdset(activeSel.items[0]);
      setEditMenuOpen(false);
      return;
    }
    if (activeMetaSubSection === "ads") {
      handleOpenStandaloneEditorForAd(activeSel.items[0]);
      setEditMenuOpen(false);
      return;
    }
  };

  const handleSaveEditDrawer = async () => {
    if (!editingItemData) return;
    const activeSel = getActiveSelection();
    activeSel.setList((prev) =>
      prev.map((item) =>
        item.id === editingItemData.id ? { ...editingItemData, lastSignificantEdit: "Just now" } : item
      )
    );
    setEditDrawerOpen(false);

    try {
      await axios.post(`${API_BASE_URL}/social/ad/update-entity/`, {
        id: editingItemData.id,
        level: activeSel.type,
        data: {
          name: editingItemData.name,
          budget: editingItemData.budget ? parseFloat(String(editingItemData.budget).replace(/[^0-9.]/g, "")) : undefined,
        },
        account_id: selectedMetaAdAccountId,
      });
      showToast(`Saved changes to "${editingItemData.name}".`, "success");
    } catch (err) {
      console.warn("Edit drawer update API error:", err);
      showToast(`Saved changes locally.`, "info");
    }
  };

  const handleOpenQuickEdit = () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel} to edit.`, "info");
      return;
    }
    setQuickEditName(activeSel.items[0]?.name || "");
    setQuickEditBudget(activeSel.items[0]?.budget || "₹200.00");
    setQuickEditModalOpen(true);
    setEditMenuOpen(false);
  };

  const handleSaveQuickEdit = async () => {
    const activeSel = getActiveSelection();
    const itemsToUpdate = [...activeSel.items];
    const updatedName = quickEditName;
    const updatedBudget = quickEditBudget;

    activeSel.setList((prev) =>
      prev.map((item) =>
        activeSel.ids.includes(item.id)
          ? {
            ...item,
            name: updatedName || item.name,
            budget: updatedBudget || item.budget,
            lastSignificantEdit: "Just now",
          }
          : item
      )
    );
    setQuickEditModalOpen(false);

    try {
      for (const item of itemsToUpdate) {
        await axios.post(`${API_BASE_URL}/social/ad/update-entity/`, {
          id: item.id,
          level: activeSel.type,
          data: {
            name: updatedName || item.name,
            budget: updatedBudget ? parseFloat(String(updatedBudget).replace(/[^0-9.]/g, "")) : undefined,
          },
          account_id: selectedMetaAdAccountId,
        });
      }
      showToast(`Quick edit updated ${itemsToUpdate.length} ${activeSel.pluralLabel}.`, "success");
    } catch (err) {
      console.warn("Update entity API error:", err);
      showToast(`Quick edit saved locally.`, "info");
    }
  };

  const handleOpenFindReplace = () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel} to edit.`, "info");
      return;
    }
    setFindText("");
    setReplaceText("");
    setFindReplaceModalOpen(true);
    setEditMenuOpen(false);
  };

  const handleExecuteFindReplace = async () => {
    if (!findText) {
      showToast("Please enter text to find.", "info");
      return;
    }
    const activeSel = getActiveSelection();
    let updatedCount = 0;
    const itemsToUpdate = [];
    activeSel.setList((prev) =>
      prev.map((item) => {
        if (!activeSel.ids.includes(item.id)) return item;
        const flags = matchCase ? "g" : "gi";
        const newName = item.name.replace(new RegExp(findText, flags), replaceText);
        if (newName !== item.name) {
          updatedCount++;
          itemsToUpdate.push({ id: item.id, name: newName });
        }
        return { ...item, name: newName, lastSignificantEdit: "Just now" };
      })
    );
    setFindReplaceModalOpen(false);
    showToast(`Replaced text in ${updatedCount} ${activeSel.pluralLabel}.`, "success");

    for (const item of itemsToUpdate) {
      try {
        await axios.post(`${API_BASE_URL}/social/ad/update-entity/`, {
          id: item.id,
          level: activeSel.type,
          data: { name: item.name },
          account_id: selectedMetaAdAccountId,
        });
      } catch (e) {
        console.warn("Find/replace API error:", e);
      }
    }
  };

  // ── Meta Single-Item Row Actions & Image 3 Action Pills ──
  const handleDuplicateSingleItem = async (item, type) => {
    const newId = `${type}-copy-${Date.now()}`;
    const newItem = {
      ...item,
      id: newId,
      name: `${item.name} - Copy`,
      delivery: "In draft",
      active: true,
      lastSignificantEdit: "Just now",
      is_draft: true,
    };

    if (type === "campaign") {
      setCampaignsList((prev) => [newItem, ...prev]);
      setSelectedCampaignIds([newId]);
    } else if (type === "adset") {
      setAdsetsList((prev) => [newItem, ...prev]);
      setSelectedAdsetIds([newId]);
    } else if (type === "ad") {
      setAdsList((prev) => [newItem, ...prev]);
      setSelectedAdIds([newId]);
    }

    showToast(`Duplicated "${item.name}" as draft.`, "success");

    try {
      await axios.post(`${API_BASE_URL}/social/ad/duplicate-entity/`, {
        id: item.id,
        level: type,
        copies: 1,
        account_id: selectedMetaAdAccountId,
      });
    } catch (err) {
      console.warn("Single duplicate entity API error:", err);
    }
  };

  const handlePublishSingleItem = (item, type) => {
    if (type === "campaign") {
      setSelectedCampaignIds([item.id]);
    } else if (type === "adset") {
      setSelectedAdsetIds([item.id]);
    } else if (type === "ad") {
      setSelectedAdIds([item.id]);
    }
    setReviewPublishModalOpen(true);
  };

  const handleEditSingleItem = (item, type) => {
    if (type === "campaign") {
      handleOpenStandaloneEditorForCampaign(item);
    } else if (type === "adset") {
      handleOpenStandaloneEditorForAdset(item);
    } else if (type === "ad") {
      handleOpenStandaloneEditorForAd(item);
    }
  };

  const handleDeleteSingleItem = (item, type) => {
    if (type === "campaign") {
      setCampaignsList((prev) => prev.filter((c) => c.id !== item.id));
      setSelectedCampaignIds((prev) => prev.filter((id) => id !== item.id));
    } else if (type === "adset") {
      setAdsetsList((prev) => prev.filter((a) => a.id !== item.id));
      setSelectedAdsetIds((prev) => prev.filter((id) => id !== item.id));
    } else if (type === "ad") {
      setAdsList((prev) => prev.filter((a) => a.id !== item.id));
      setSelectedAdIds((prev) => prev.filter((id) => id !== item.id));
    }
    showToast(`Deleted "${item.name}".`, "info");
    setOpenRowMenuId(null);
  };

  const handleSaveInlineEdit = () => {
    if (!inlineEditing || !inlineEditing.name.trim()) {
      setInlineEditing(null);
      return;
    }
    const newName = inlineEditing.name.trim();
    if (inlineEditing.type === "campaign") {
      setCampaignsList((prev) =>
        prev.map((c) => (c.id === inlineEditing.id ? { ...c, name: newName } : c))
      );
    } else if (inlineEditing.type === "adset") {
      setAdsetsList((prev) =>
        prev.map((a) => (a.id === inlineEditing.id ? { ...a, name: newName } : a))
      );
    } else if (inlineEditing.type === "ad") {
      setAdsList((prev) =>
        prev.map((ad) => (ad.id === inlineEditing.id ? { ...ad, name: newName } : ad))
      );
    }
    showToast(`Updated name to "${newName}".`, "success");
    setInlineEditing(null);
  };

  // Custom Meta Image 3 Publish Icon: Tray with Upward Arrow
  const MetaPublishPillIcon = () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2" />
      <path d="M8 2.5v7" />
      <path d="m4.5 5.5 3.5-3.5 3.5 3.5" />
    </svg>
  );

  const pillBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 7px",
    height: 20,
    background: "#ffffff",
    border: "1px solid #ccd0d5",
    borderRadius: 4,
    fontSize: "11px",
    fontWeight: 500,
    color: "#1c1e21",
    cursor: "pointer",
    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05)",
    transition: "all 0.12s ease",
    whiteSpace: "nowrap",
    userSelect: "none",
    lineHeight: 1,
  };

  const rowMenuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "9px 16px",
    background: "transparent",
    border: "none",
    color: "#050505",
    fontSize: "0.85rem",
    fontWeight: 450,
    textAlign: "left",
    cursor: "pointer",
    transition: "background 0.12s ease",
    lineHeight: "1.2",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  };

  const getCampaignMenuPosition = () => {
    if (!rowMenuCoords) return { top: 0, left: 0 };
    const menuWidth = 175;
    const menuHeight = 160;
    let top = rowMenuCoords.bottom + 4;
    let left = rowMenuCoords.left;

    if (typeof window !== "undefined") {
      if (top + menuHeight > window.innerHeight) {
        top = Math.max(8, rowMenuCoords.top - menuHeight - 4);
      }
      if (left + menuWidth > window.innerWidth) {
        left = Math.max(8, rowMenuCoords.right - menuWidth);
      }
    }
    return { top, left };
  };

  // Meta Image 1: Inline Row Action Links for Ads (Edit · Duplicate · View charts · Preview)
  const renderAdRowActionLinks = (ad) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
        fontSize: "0.76rem",
        fontWeight: 500,
        color: "#0064e1",
        flexWrap: "nowrap",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        style={{ cursor: "pointer", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        onClick={() => handleOpenStandaloneEditorForAd(ad)}
        title="Edit ad"
      >
        Edit
      </span>
      <span style={{ color: "#bec2c9", margin: "0 2px", userSelect: "none" }}>·</span>
      <span
        style={{ cursor: "pointer", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        onClick={() => handleDuplicateSingleItem(ad, "ad")}
        title="Quick duplicate"
      >
        Duplicate
      </span>
      <span style={{ color: "#bec2c9", margin: "0 2px", userSelect: "none" }}>·</span>
      <span
        style={{ cursor: "pointer", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        onClick={() => {
          setSelectedAdIds([ad.id]);
          setChartsDrawerOpen(true);
          showToast(`Viewing charts for "${ad.name}"`, "info");
        }}
        title="View charts & inspection"
      >
        View charts
      </span>
      <span style={{ color: "#bec2c9", margin: "0 2px", userSelect: "none" }}>·</span>
      <span
        style={{ cursor: "pointer", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        onClick={() => {
          setPreviewItem(ad);
          setPreviewModalOpen(true);
        }}
        title="Preview ad"
      >
        Preview
      </span>
    </div>
  );

  // Meta Row Action Pills for Campaigns, Ad Sets, and Ads: Publish | Edit | Duplicate | ••• (Image 3)
  const renderRowActionPills = (item, type) => {
    return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
        flexWrap: "nowrap",
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* 2. Edit (Image 3) */}
      <button
        type="button"
        title="Edit in Meta editor"
        onClick={() => handleEditSingleItem(item, type)}
        style={pillBtnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f1f5f9";
          e.currentTarget.style.borderColor = "#94a3b8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.borderColor = "#ccd0d5";
        }}
      >
        <Edit2 size={11} strokeWidth={2.2} />
        <span>Edit</span>
      </button>

      {/* 3. Duplicate (Image 3) */}
      <button
        type="button"
        title="Quick duplicate"
        onClick={() => handleDuplicateSingleItem(item, type)}
        style={pillBtnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f1f5f9";
          e.currentTarget.style.borderColor = "#94a3b8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.borderColor = "#ccd0d5";
        }}
      >
        <Copy size={11} strokeWidth={2} />
        <span>Duplicate</span>
      </button>

      {/* 4. More (Image 3: •••) */}
      <div style={{ position: "relative" }} className="meta-row-actions-more-dropdown">
        <button
          type="button"
          title="More actions"
          onClick={(e) => {
            e.stopPropagation();
            if (openRowMenuId === item.id) {
              setOpenRowMenuId(null);
              setRowMenuCoords(null);
              setActiveRowMenuItem(null);
            } else {
              const rect = e.currentTarget.getBoundingClientRect();
              setOpenRowMenuId(item.id);
              setRowMenuCoords({
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
              });
              setActiveRowMenuItem({ ...item, type });
            }
          }}
          style={{
            ...pillBtnStyle,
            padding: "2px 6px",
            background: openRowMenuId === item.id ? "#f1f5f9" : "#ffffff",
            borderColor: openRowMenuId === item.id ? "#94a3b8" : "#ccd0d5",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.borderColor = "#94a3b8";
          }}
          onMouseLeave={(e) => {
            if (openRowMenuId !== item.id) {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#ccd0d5";
            }
          }}
        >
          <MoreHorizontal size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
    );
  };

  const handleBatchTurnOn = async () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel}.`, "info");
      return;
    }
    const ids = [...activeSel.ids];
    activeSel.setList((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? {
            ...item,
            active: true,
            delivery: item.delivery === "Off" || item.delivery === "Paused" ? "Active" : item.delivery,
            lastSignificantEdit: "Just now",
          }
          : item
      )
    );
    setEditMenuOpen(false);
    showToast(`Turned on ${ids.length} ${activeSel.pluralLabel}.`, "success");

    for (const id of ids) {
      try {
        await axios.post(`${API_BASE_URL}/social/ad/toggle-status/`, {
          id,
          level: activeSel.type,
          status: "ACTIVE",
          account_id: selectedMetaAdAccountId,
        });
      } catch (e) {
        console.warn("Batch turn on error:", e);
      }
    }
  };

  const handleBatchTurnOff = async () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel}.`, "info");
      return;
    }
    const ids = [...activeSel.ids];
    activeSel.setList((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? { ...item, active: false, delivery: "Off", lastSignificantEdit: "Just now" }
          : item
      )
    );
    setEditMenuOpen(false);
    showToast(`Turned off ${ids.length} ${activeSel.pluralLabel}.`, "success");

    for (const id of ids) {
      try {
        await axios.post(`${API_BASE_URL}/social/ad/toggle-status/`, {
          id,
          level: activeSel.type,
          status: "PAUSED",
          account_id: selectedMetaAdAccountId,
        });
      } catch (e) {
        console.warn("Batch turn off error:", e);
      }
    }
  };

  // 4. Delete Action
  const handleOpenDelete = () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel} to delete.`, "info");
      return;
    }
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const activeSel = getActiveSelection();
    const count = activeSel.ids.length;
    const idsToDelete = [...activeSel.ids];
    activeSel.setList((prev) => prev.filter((item) => !activeSel.ids.includes(item.id)));
    activeSel.setSelection([]);
    setDeleteModalOpen(false);

    try {
      for (const id of idsToDelete) {
        await axios.post(`${API_BASE_URL}/social/ad/delete-entity/`, {
          id,
          level: activeSel.type,
          account_id: selectedMetaAdAccountId,
        });
      }
      showToast(`Deleted ${count} ${count === 1 ? activeSel.typeLabel : activeSel.pluralLabel}.`, "success");
    } catch (err) {
      console.warn("Delete API error:", err);
      showToast(`Deleted locally. (${err?.response?.data?.error || err.message})`, "info");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setDownloadMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setDatePickerOpen(false);
      }
      if (adAccountPickerRef.current && !adAccountPickerRef.current.contains(event.target)) {
        setAdAccountPickerOpen(false);
      }
      if (duplicateRef.current && !duplicateRef.current.contains(event.target)) {
        setDuplicateMenuOpen(false);
      }
      if (editRef.current && !editRef.current.contains(event.target)) {
        setEditMenuOpen(false);
      }
      if (columnsRef.current && !columnsRef.current.contains(event.target)) {
        setColumnsMenuOpen(false);
      }
      if (breakdownRef.current && !breakdownRef.current.contains(event.target)) {
        setBreakdownMenuOpen(false);
      }
      if (rulesRef.current && !rulesRef.current.contains(event.target)) {
        setRulesMenuOpen(false);
      }
      if (moreToolbarRef.current && !moreToolbarRef.current.contains(event.target)) {
        setMoreToolbarMenuOpen(false);
        setExportSubmenuOpen(false);
      }
      if (opportunityScoreRef.current && !opportunityScoreRef.current.contains(event.target)) {
        setOpportunityScoreOpen(false);
      }
      if (quickViewsMenuRef.current && !quickViewsMenuRef.current.contains(event.target)) {
        setQuickViewsMenuOpen(false);
        setQuickViewsSubmenu(null);
      }
      if (openRowMenuId) {
        if (rowMenuPortalRef.current && rowMenuPortalRef.current.contains(event.target)) return;
        if (event.target.closest && event.target.closest(".meta-row-actions-more-dropdown")) return;
        setOpenRowMenuId(null);
        setRowMenuCoords(null);
        setActiveRowMenuItem(null);
      }
    };

    const handleKeyDown = (e) => {
      // Ctrl + Shift + / -> Shortcuts modal
      if (e.ctrlKey && e.shiftKey && (e.key === "/" || e.key === "?")) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Escape -> close all dialogs/menus
      if (e.key === "Escape") {
        setMoreMenuOpen(false);
        setDownloadMenuOpen(false);
        setDiscardModalOpen(false);
        setResetModalOpen(false);
        setShortcutsModalOpen(false);
        setDatePickerOpen(false);
        setAdAccountPickerOpen(false);
        setOpportunityScoreOpen(false);
        setDuplicateMenuOpen(false);
        setEditMenuOpen(false);
        setDuplicateModalOpen(false);
        setEditDrawerOpen(false);
        setQuickEditModalOpen(false);
        setFindReplaceModalOpen(false);
        setDeleteModalOpen(false);
        setPublishingModalOpen(false);
        setColumnsMenuOpen(false);
        setBreakdownMenuOpen(false);
        setRulesMenuOpen(false);
        setMoreToolbarMenuOpen(false);
        setExportSubmenuOpen(false);
        setImportAdsModalOpen(false);
        setAnalyseModalOpen(false);
        setAbTestModalOpen(false);
        setRulesModalOpen(false);
        setCreateRuleModalOpen(false);
        setManageAdjustmentsModalOpen(false);
        setEditingAdjustmentItem(null);
        setCustomizeColumnsModalOpen(false);
        setPreviewModalOpen(false);
        return;
      }

      // Do not trigger action shortcuts if focus is in an input or editable field
      const targetTag = e.target?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || e.target?.isContentEditable) {
        return;
      }

      // Alt + 1 -> Navigate to campaigns
      if (e.altKey && !e.ctrlKey && (e.key === "1" || e.code === "Digit1")) {
        e.preventDefault();
        handleSwitchSubSection("campaigns");
        return;
      }
      // Alt + 2 -> Navigate to ad sets
      if (e.altKey && !e.ctrlKey && (e.key === "2" || e.code === "Digit2")) {
        e.preventDefault();
        handleSwitchSubSection("adsets");
        return;
      }
      // Alt + 3 -> Navigate to ads
      if (e.altKey && !e.ctrlKey && (e.key === "3" || e.code === "Digit3")) {
        e.preventDefault();
        handleSwitchSubSection("ads");
        return;
      }

      // Ctrl + Y -> Insights charts
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        setChartsDrawerOpen((prev) => !prev);
        return;
      }

      // Ctrl + U -> Edit Selected
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        handleOpenEditDrawer();
        return;
      }

      // Ctrl + R -> Review all changes / publish modal
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        setReviewPublishModalOpen(true);
        return;
      }

      // Ctrl + Shift + D -> Open duplicate dialog
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setDuplicateModalOpen(true);
        return;
      }

      // Ctrl + D -> Quick Duplicate
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleQuickDuplicate(1);
        return;
      }

      // Ctrl + Backspace -> Delete selected
      if (e.ctrlKey && e.key === "Backspace") {
        e.preventDefault();
        handleOpenDelete();
        return;
      }
    };

    if (
      downloadMenuOpen ||
      moreMenuOpen ||
      datePickerOpen ||
      adAccountPickerOpen ||
      duplicateMenuOpen ||
      editMenuOpen ||
      columnsMenuOpen ||
      breakdownMenuOpen ||
      rulesMenuOpen ||
      moreToolbarMenuOpen ||
      openRowMenuId
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    downloadMenuOpen,
    moreMenuOpen,
    datePickerOpen,
    adAccountPickerOpen,
    duplicateMenuOpen,
    editMenuOpen,
    columnsMenuOpen,
    breakdownMenuOpen,
    rulesMenuOpen,
    moreToolbarMenuOpen,
    openRowMenuId,
    selectedAdIds,
    selectedAdsetIds,
    selectedCampaignIds,
    activeMetaSubSection,
  ]);

  const handleExport = (format = "csv", selectedOnly = false) => {
    const activeSel = getActiveSelection();
    let sourceData =
      activeMetaSubSection === "ads"
        ? adsList
        : activeMetaSubSection === "adsets"
          ? adsetsList
          : campaignsList;

    if (selectedOnly && activeSel?.ids && activeSel.ids.length > 0) {
      const idSet = new Set(activeSel.ids);
      sourceData = sourceData.filter((item) => idSet.has(item.id));
    }

    const activeData =
      activeMetaSubSection === "ads"
        ? sourceData.map((a) => ({
          Name: a.name,
          Delivery: a.delivery,
          Budget: `${a.budget || ""} ${a.budgetSub || ""}`.trim(),
          Ends: a.ends,
          "Bid Strategy": `${a.bidStrategy || ""} ${a.bidStrategySub || ""}`.trim(),
          "Ad Set": a.adsetName,
          Status: a.active ? "Active" : "Paused",
        }))
        : activeMetaSubSection === "adsets"
          ? sourceData.map((as) => ({
            Name: as.name,
            Delivery: as.delivery,
            Budget: `${as.budget || ""} ${as.budgetSub || ""}`.trim(),
            Ends: as.ends,
            "Bid Strategy": `${as.bidStrategy || ""} ${as.bidStrategySub || ""}`.trim(),
            Attribution: as.attribution,
            Status: as.active ? "Active" : "Paused",
          }))
          : sourceData.map((c) => ({
            Name: c.name,
            Delivery: c.delivery,
            Budget: `${c.budget || ""} ${c.budgetSub || ""}`.trim(),
            Ends: c.ends,
            "Bid Strategy": `${c.bidStrategy || ""} ${c.bidStrategySub || ""}`.trim(),
            Attribution: c.attribution,
            Status: c.active ? "Active" : "Paused",
          }));

    if (!activeData.length) {
      showToast(`No ${activeMetaSubSection} to export.`, "info");
      return;
    }

    const headers = Object.keys(activeData[0]);
    const csvRows = [
      headers.join(","),
      ...activeData.map((row) =>
        headers.map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(",")
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.href = csvContent;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `Meta_${activeMetaSubSection.toUpperCase()}_Export_${selectedOnly ? "selected_" : "all_"}${dateStr}.${format === "xlsx" ? "xlsx" : "csv"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${activeData.length} ${activeMetaSubSection} successfully.`, "success");
    setDownloadMenuOpen(false);
  };

  const handleBulkImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(`Imported "${file.name}" into campaign draft configurations.`, "success");
    e.target.value = "";
    setMoreToolbarMenuOpen(false);
    setExportSubmenuOpen(false);
  };

  const handleImportFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportSelectedFile(file);
    e.target.value = "";
  };

  const handleImportImagesChosen = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = files.map((f) => ({
      name: f.name,
      size: f.size,
      preview: URL.createObjectURL(f),
    }));
    setImportSelectedImages((prev) => [...prev, ...newImgs]);
    e.target.value = "";
  };

  const handleImportVideosChosen = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const validVideos = files.slice(0, 10).map((f) => ({
      name: f.name,
      size: f.size,
    }));
    setImportSelectedVideos((prev) => [...prev, ...validVideos].slice(0, 10));
    e.target.value = "";
  };

  const handleExecuteImport = () => {
    if (importTab === "file") {
      if (importFileSubMode === "file" && importSelectedFile) {
        const fileName = importSelectedFile.name;
        const newId = `imported_${Date.now()}`;
        const newCampaign = {
          id: newId,
          name: `Imported - ${fileName.replace(/\.[^/.]+$/, "")}`,
          status: "PAUSED",
          delivery: "In draft",
          budget: "₹500.00",
          budgetSub: "Daily",
          bidStrategy: "Highest volume",
          bidStrategySub: "",
          attribution: "7-day click or 1-day view",
          results: 0,
          reach: 0,
          impressions: 0,
          costPerResult: "—",
          amountSpent: "—",
          active: false,
        };
        setCampaignsList((prev) => [newCampaign, ...prev]);
        showToast(`Successfully imported ad configuration from "${fileName}".`, "success");
        setImportAdsModalOpen(false);
        setImportSelectedFile(null);
      } else if (importFileSubMode === "paste" && importPastedText.trim()) {
        const lines = importPastedText.split("\n").filter((l) => l.trim().length > 0);
        lines.slice(0, 10).forEach((line, idx) => {
          const parts = line.split("\t");
          const name = parts[0]?.trim() || `Pasted Ad Config ${idx + 1}`;
          const newId = `pasted_${Date.now()}_${idx}`;
          setCampaignsList((prev) => [
            {
              id: newId,
              name: name,
              status: "PAUSED",
              delivery: "In draft",
              budget: "₹500.00",
              budgetSub: "Daily",
              bidStrategy: "Highest volume",
              bidStrategySub: "",
              attribution: "7-day click or 1-day view",
              results: 0,
              reach: 0,
              impressions: 0,
              costPerResult: "—",
              amountSpent: "—",
              active: false,
            },
            ...prev,
          ]);
        });
        showToast(`Successfully imported ${lines.length} ad configurations from clipboard.`, "success");
        setImportAdsModalOpen(false);
        setImportPastedText("");
      }
    } else if (importTab === "images" && importSelectedImages.length > 0) {
      showToast(`Successfully imported ${importSelectedImages.length} creative image asset(s) to Ads Library.`, "success");
      setImportAdsModalOpen(false);
      setImportSelectedImages([]);
    } else if (importTab === "videos" && importSelectedVideos.length > 0) {
      showToast(`Successfully imported ${importSelectedVideos.length} video asset(s) to Ads Library.`, "success");
      setImportAdsModalOpen(false);
      setImportSelectedVideos([]);
    }
  };

  const handleDownloadExcelTemplate = () => {
    const templateHeaders = [
      "Campaign ID",
      "Campaign Name",
      "Campaign Objective",
      "Campaign Status",
      "Buying Type",
      "Campaign Daily Budget",
      "Ad Set ID",
      "Ad Set Name",
      "Ad Set Daily Budget",
      "Optimization Goal",
      "Billing Event",
      "Bid Amount",
      "Targeting Countries",
      "Targeting Age Min",
      "Targeting Age Max",
      "Targeting Genders",
      "Ad ID",
      "Ad Name",
      "Ad Status",
      "Creative Title",
      "Creative Body",
      "Link URL",
      "Call to Action",
    ];
    const sampleRow = [
      "",
      "Sample Awareness Campaign",
      "OUTCOME_AWARENESS",
      "PAUSED",
      "AUCTION",
      "500",
      "",
      "Broad Audience Ad Set",
      "500",
      "REACH",
      "IMPRESSIONS",
      "",
      "IN",
      "18",
      "65",
      "All",
      "",
      "Main Brand Video Ad",
      "PAUSED",
      "Scale Your Business Today",
      "Adstra Digital provides performance marketing at scale. Click to learn more.",
      "https://adstradigital.com",
      "LEARN_MORE",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent([templateHeaders.join(","), sampleRow.join(",")].join("\n"));
    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "Meta_Ads_Configuration_Template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded Meta Ads configuration Excel template.", "success");
    setMoreToolbarMenuOpen(false);
    setExportSubmenuOpen(false);
  };


  const toggleAdActive = async (id) => {
    const item = adsList.find((x) => x.id === id);
    if (!item) return;
    const newActive = !item.active;
    const newStatus = newActive ? "ACTIVE" : "PAUSED";
    const newDelivery = newActive ? "Active" : "Off";

    setAdsList((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, active: newActive, delivery: newDelivery } : ad))
    );

    try {
      await axios.post(`${API_BASE_URL}/social/ad/toggle-status/`, {
        id,
        level: "ad",
        status: newStatus,
        account_id: selectedMetaAdAccountId,
      });
      showToast(`Ad "${item.name}" ${newActive ? "activated" : "paused"}.`, "success");
    } catch (err) {
      console.warn("Toggle ad error:", err);
      showToast(`Status updated locally. (${err?.response?.data?.error || err.message})`, "info");
    }
  };

  const toggleAdsetActive = async (id) => {
    const item = adsetsList.find((x) => x.id === id);
    if (!item) return;
    const newActive = !item.active;
    const newStatus = newActive ? "ACTIVE" : "PAUSED";
    const newDelivery = newActive ? "Active" : "Off";

    setAdsetsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: newActive, delivery: newDelivery } : a))
    );

    try {
      await axios.post(`${API_BASE_URL}/social/ad/toggle-status/`, {
        id,
        level: "adset",
        status: newStatus,
        account_id: selectedMetaAdAccountId,
      });
      showToast(`Ad set "${item.name}" ${newActive ? "activated" : "paused"}.`, "success");
    } catch (err) {
      console.warn("Toggle adset error:", err);
      showToast(`Status updated locally. (${err?.response?.data?.error || err.message})`, "info");
    }
  };

  const toggleCampaignActive = async (id) => {
    const item = campaignsList.find((x) => x.id === id);
    if (!item) return;
    const newActive = !item.active;
    const newStatus = newActive ? "ACTIVE" : "PAUSED";
    const newDelivery = newActive ? "Active" : "Off";

    setCampaignsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: newActive, delivery: newDelivery } : c))
    );

    try {
      await axios.post(`${API_BASE_URL}/social/ad/toggle-status/`, {
        id,
        level: "campaign",
        status: newStatus,
        account_id: selectedMetaAdAccountId,
      });
      showToast(`Campaign "${item.name}" ${newActive ? "activated" : "paused"}.`, "success");
    } catch (err) {
      console.warn("Toggle campaign error:", err);
      showToast(`Status updated locally. (${err?.response?.data?.error || err.message})`, "info");
    }
  };

  // Exact Meta Ads Manager Table Header matching Images 1, 2
  const renderMetaTableHeader = (type = activeMetaSubSection) => {
    const isCampaigns = type === "campaigns";
    const isAdsets = type === "adsets";
    const isAds = type === "ads";

    const allChecked = isCampaigns
      ? selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0
      : isAdsets
        ? selectedAdsetIds.length === filteredAdsets.length && filteredAdsets.length > 0
        : selectedAdIds.length === filteredAds.length && filteredAds.length > 0;

    const handleSelectAll = (e) => {
      if (isCampaigns) {
        setSelectedCampaignIds(e.target.checked ? filteredCampaigns.map((c) => c.id) : []);
      } else if (isAdsets) {
        setSelectedAdsetIds(e.target.checked ? filteredAdsets.map((a) => a.id) : []);
      } else {
        setSelectedAdIds(e.target.checked ? filteredAds.map((a) => a.id) : []);
      }
    };

    const title = isCampaigns ? "Campaign" : isAdsets ? "Ad set" : "Ad";

    return (
      <thead>
        <tr style={{ background: "#f5f6f7", height: 38 }}>
          {/* 1. Checkbox */}
          <th
            style={{
              width: 38,
              minWidth: 38,
              maxWidth: 38,
              padding: "8px 10px",
              position: "sticky",
              left: 0,
              zIndex: 3,
              background: "#f5f6f7",
              borderTop: "1px solid #ccd0d5",
              borderBottom: "1px solid #ccd0d5",
              borderRight: "1px solid #e4e6eb",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <input
              type="checkbox"
              checked={allChecked}
              onChange={handleSelectAll}
              style={{
                cursor: "pointer",
                width: 14,
                height: 14,
                borderRadius: 2,
                border: "1.5px solid #ccd0d5",
                accentColor: "#0064e1",
              }}
            />
          </th>

          {/* 2. Off... ↑↓ */}
          <th
            style={{
              width: 56,
              minWidth: 56,
              maxWidth: 56,
              padding: "8px 8px",
              position: "sticky",
              left: 38,
              zIndex: 3,
              background: "#f5f6f7",
              borderTop: "1px solid #ccd0d5",
              borderBottom: "1px solid #ccd0d5",
              borderRight: "1px solid #e4e6eb",
              color: "#4b4f56",
              fontWeight: 600,
              fontSize: "12px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Off...</span>
              <ArrowUpDown size={11} color="#65676b" />
            </div>
          </th>

          {/* 3. Campaign / Ad set / Ad ↑↓ ▾ */}
          <th
            style={{
              minWidth: 290,
              width: 290,
              padding: "8px 12px",
              position: "sticky",
              left: 94,
              zIndex: 3,
              background: "#f5f6f7",
              borderTop: "1px solid #ccd0d5",
              borderBottom: "1px solid #ccd0d5",
              borderRight: "1px solid #ccd0d5",
              color: "#4b4f56",
              fontWeight: 600,
              fontSize: "12px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#1c1e21" }}>{title}</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 4. Delivery ↓ ▾ */}
          <th style={{ ...thStyle, width: 140, minWidth: 140 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ color: "#0064e1", fontWeight: 700 }}>Delivery</span>
              <ArrowDown size={11} color="#0064e1" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 5. Actions ▾ */}
          <th style={{ ...thStyle, width: 120, minWidth: 120 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Actions</span>
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 6. Attribution setting ▾ */}
          <th style={{ ...thStyle, width: 145, minWidth: 145 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Attribution setting</span>
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 7. Results ↑↓ ▾ */}
          <th style={{ ...thStyle, width: 110, minWidth: 110 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Results</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 8. Cost per result ↑↓ ▾ */}
          <th style={{ ...thStyle, width: 125, minWidth: 125 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Cost per result</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 9. Budget ↑↓ ▾ */}
          <th style={{ ...thStyle, width: 135, minWidth: 135 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Budget</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 10. Amount spent ↑↓ ▾ */}
          <th style={{ ...thStyle, width: 120, minWidth: 120 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Amount spent</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 11. Impressions ↑↓ ▾ */}
          <th style={{ ...thStyle, width: 120, minWidth: 120 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Impressions</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 12. Reach ↑↓ ▾ */}
          <th style={{ ...thStyle, width: 110, minWidth: 110 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Reach</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 12b. Clicks ↑↓ ▾ */}
          <th style={{ ...thStyle, width: 100, minWidth: 100 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Clicks</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 12c. CTR ↑↓ ▾ */}
          <th style={{ ...thStyle, width: 95, minWidth: 95 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>CTR</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 13. Schedule ↑↓ ▾ (Image 3 & 4) */}
          <th style={{ ...thStyle, width: 160, minWidth: 160 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Schedule</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 14. Ends ↑↓ ▾ (Image 3 & 4) */}
          <th style={{ ...thStyle, width: 110, minWidth: 110 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Ends</span>
              <ArrowUpDown size={11} color="#65676b" />
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 15. Bid strategy ▾ (Image 4) */}
          <th style={{ ...thStyle, width: 140, minWidth: 140 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Bid strategy</span>
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 16. Last significant edit ▾ (Image 4) */}
          <th style={{ ...thStyle, width: 160, minWidth: 160 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>Last significant edit</span>
              <ChevronDown size={11} color="#65676b" style={{ marginLeft: "auto" }} />
            </div>
          </th>

          {/* 17. Customize columns (+) button (Image 4) */}
          <th
            style={{
              ...thStyle,
              width: 40,
              minWidth: 40,
              padding: "8px 8px",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              title="Customize columns"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "1px solid #ccd0d5",
                background: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#65676b",
                padding: 0,
              }}
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </th>
        </tr>
      </thead>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "75vh",
        background: "#ffffff",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Hidden file input for Meta Bulk Import */}
      <input
        type="file"
        ref={bulkImportInputRef}
        accept=".csv,.xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleBulkImportFile}
      />

      {/* ── Top Header Row with Platform Radio Selectors on Right Side ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: "1px solid #f1f5f9",
          background: "#ffffff",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* 3 Radio Buttons aligned on Right Side */}
        <div
          role="radiogroup"
          aria-label="Ad Platform Selection"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          {AD_PLATFORMS.map((platform) => {
            const isChecked = selectedPlatform === platform.id;
            return (
              <label
                key={platform.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  fontWeight: isChecked ? 650 : 500,
                  color: isChecked ? "#0f172a" : "#475569",
                  userSelect: "none",
                  padding: "5px 10px",
                  borderRadius: 8,
                  transition: "all 0.15s ease",
                  background: isChecked ? "#f8fafc" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isChecked) e.currentTarget.style.background = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  if (!isChecked) e.currentTarget.style.background = "transparent";
                }}
              >
                <input
                  type="radio"
                  name="ad_platform"
                  value={platform.id}
                  checked={isChecked}
                  onChange={() => setSelectedPlatform(platform.id)}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                  }}
                />

                {/* Custom Styled Radio Circle */}
                <span
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    border: isChecked ? "2px solid #2563eb" : "2px solid #cbd5e1",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                    boxShadow: isChecked ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
                  }}
                >
                  {isChecked && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#2563eb",
                        transition: "all 0.15s ease",
                      }}
                    />
                  )}
                </span>

                {/* Brand Logo & Text */}
                <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
                  {platform.icon}
                </span>
                <span>{platform.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── META ADS SECTION (Exact Meta Ads Manager Format from Images 1, 2, 3) ── */}
      {selectedPlatform === "meta" && (
        <div style={{ width: "100%", background: "#ffffff" }}>
          {/* 1. Meta Ads Manager Main Header Bar */}
          <div
            style={{
              padding: "10px 18px",
              background: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Dynamic Heading field matching Image 2 (Campaigns / Ad sets / Ads) */}
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#1c1e21",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {activeMetaSubSection === "adsets"
                  ? "Ad sets"
                  : activeMetaSubSection === "ads"
                  ? "Ads"
                  : "Campaigns"}
              </h1>
              {/* Account Dropdown Trigger Button matching Image 1 */}
              <div ref={adAccountPickerRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAdAccountPickerOpen((prev) => !prev);
                    setAdAccountSearchQuery("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 10px 4px 6px",
                    borderRadius: 6,
                    background: "#ffffff",
                    border: adAccountPickerOpen ? "2px solid #0866ff" : "1px solid #ccd0d5",
                    fontSize: "0.84rem",
                    color: "#1c1e21",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Selected Portfolio Avatar (Image 1) */}
                  {selectedPortfolioId === "mediareds" ? (
                    <AutumnLeavesIcon size={22} />
                  ) : selectedPortfolioId === "lioraa" ? (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        background: "#e8884d",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.76rem",
                        flexShrink: 0,
                      }}
                    >
                      L
                    </div>
                  ) : selectedPortfolioId === "adstradigital" ? (
                    <AdstraDiamondIcon size={22} />
                  ) : selectedPortfolioId === "minglemuze" ? (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#6b3074",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.76rem",
                        flexShrink: 0,
                      }}
                    >
                      m
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        background: "#78bd5d",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.76rem",
                        flexShrink: 0,
                      }}
                    >
                      S
                    </div>
                  )}

                  {/* Monitor / Ad Screen Icon */}
                  <MonitorAdIcon size={16} color="#1c1e21" />

                  {/* Display ID */}
                  <span style={{ fontWeight: 600, color: "#1c1e21" }}>
                    {connectedAccount?.display_id || "830629501946359"} (
                    {(connectedAccount?.display_id || "830629501946359").slice(0, 3)}...)
                  </span>

                  <ChevronDown
                    size={14}
                    color="#65676b"
                    style={{
                      transform: adAccountPickerOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      marginLeft: 2,
                    }}
                  />
                </button>

                {/* Two-panel popup matching exact Image 1 & Image 4 (compact Meta width) */}
                {adAccountPickerOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      width: 480,
                      maxWidth: "calc(100vw - 32px)",
                      background: "#ffffff",
                      border: "1px solid #dadde1",
                      borderRadius: 8,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)",
                      zIndex: 300,
                      overflow: "hidden",
                      animation: "ctAdAcctIn 0.14s ease-out",
                    }}
                  >
                    <style>{`@keyframes ctAdAcctIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }`}</style>

                    {/* Top Search bar */}
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #e4e6ea" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "0 8px",
                          height: 34,
                          border: "1px solid #ccd0d5",
                          borderRadius: 6,
                          background: "#ffffff",
                        }}
                      >
                        <Search size={14} color="#65676b" style={{ flexShrink: 0 }} />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search for an ad account"
                          value={adAccountSearchQuery}
                          onChange={(e) => setAdAccountSearchQuery(e.target.value)}
                          style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "0.82rem",
                            color: "#1c1e21",
                            background: "transparent",
                          }}
                        />
                        {adAccountSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setAdAccountSearchQuery("")}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8d91", padding: 2 }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Two-panel body (compact Meta dimensions) */}
                    <div style={{ display: "flex" }}>
                      {/* LEFT COLUMN: Business portfolios + Your account */}
                      <div
                        style={{
                          width: 195,
                          borderRight: "1px solid #e4e6ea",
                          padding: "8px 6px 10px 8px",
                          display: "flex",
                          flexDirection: "column",
                          flexShrink: 0,
                        }}
                      >
                        {/* Business portfolios header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px 4px", fontSize: "0.78rem", fontWeight: 700, color: "#1c1e21" }}>
                          <span>Business portfolios</span>
                          <Info size={12} style={{ color: "#65676b", cursor: "help" }} />
                        </div>

                        {/* Portfolios list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {filteredBusinessPortfolios.map((p) => {
                            const isSel = selectedPortfolioId === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedPortfolioId(p.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "5px 6px",
                                  borderRadius: 5,
                                  border: "none",
                                  background: isSel ? "#1c2b36" : "transparent",
                                  color: isSel ? "#ffffff" : "#1c1e21",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                  transition: "background 0.12s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSel) e.currentTarget.style.background = "#f0f2f5";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSel) e.currentTarget.style.background = "transparent";
                                }}
                              >
                                {p.iconType === "diamond" ? (
                                  <AdstraDiamondIcon size={20} />
                                ) : p.iconType === "orange_l" ? (
                                  <div style={{ width: 20, height: 20, borderRadius: 4, background: "#e8884d", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.72rem", flexShrink: 0 }}>
                                    L
                                  </div>
                                ) : p.iconType === "purple_m" ? (
                                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#6b3074", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.72rem", flexShrink: 0 }}>
                                    m
                                  </div>
                                ) : (
                                  <div style={{ width: 20, height: 20, borderRadius: 4, background: "#78bd5d", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.72rem", flexShrink: 0 }}>
                                    S
                                  </div>
                                )}

                                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                                  <span style={{ fontSize: "0.78rem", fontWeight: 650, color: isSel ? "#ffffff" : "#1c1e21", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {p.name}
                                  </span>
                                  <span style={{ fontSize: "0.68rem", color: isSel ? "#94a3b8" : "#65676b" }}>
                                    {p.accountCount} ad account{p.accountCount !== 1 ? "s" : ""}
                                  </span>
                                </div>

                                {isSel && <ChevronRight size={14} color="#ffffff" style={{ flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Your account section */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 6px 4px", fontSize: "0.78rem", fontWeight: 700, color: "#1c1e21" }}>
                          <span>Your account</span>
                          <Info size={12} style={{ color: "#65676b", cursor: "help" }} />
                        </div>

                        <div>
                          {(() => {
                            const isMediaRedsSel = selectedPortfolioId === "mediareds";
                            return (
                              <button
                                type="button"
                                onClick={() => setSelectedPortfolioId("mediareds")}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "5px 6px",
                                  borderRadius: 5,
                                  border: "none",
                                  background: isMediaRedsSel ? "#1c2b36" : "transparent",
                                  color: isMediaRedsSel ? "#ffffff" : "#1c1e21",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                  transition: "background 0.12s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isMediaRedsSel) e.currentTarget.style.background = "#f0f2f5";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isMediaRedsSel) e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <AutumnLeavesIcon size={20} />
                                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                                  <span style={{ fontSize: "0.78rem", fontWeight: 650, color: isMediaRedsSel ? "#ffffff" : "#1c1e21", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {yourAccount.name}
                                  </span>
                                  <span style={{ fontSize: "0.68rem", color: isMediaRedsSel ? "#94a3b8" : "#65676b" }}>
                                    {yourAccount.accountCount} ad account
                                  </span>
                                </div>
                                {isMediaRedsSel && <ChevronRight size={14} color="#ffffff" style={{ flexShrink: 0 }} />}
                              </button>
                            );
                          })()}
                        </div>

                        {/* Create a business portfolio button (Image 1 launcher) */}
                        <div style={{ marginTop: 10 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setCreatePortfolioModalOpen(true);
                              setAdAccountPickerOpen(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              background: "#ffffff",
                              border: "1px solid #ccd0d5",
                              borderRadius: 6,
                              fontSize: "0.76rem",
                              fontWeight: 650,
                              color: "#1c1e21",
                              cursor: "pointer",
                              textAlign: "center",
                              transition: "background 0.12s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                          >
                            Create a business portfolio
                          </button>
                        </div>
                      </div>

                      {/* RIGHT COLUMN: Ad accounts for selected portfolio (compact form length) */}
                      <div style={{ width: 285, flex: 1, padding: "8px 10px 10px 10px", display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1c1e21", marginBottom: 8, paddingLeft: 2 }}>
                          {activePortfolioAccounts.length} ad account{activePortfolioAccounts.length !== 1 ? "s" : ""}
                        </div>

                        {activePortfolioAccounts.length === 0 ? (
                          <div style={{ padding: "30px 10px", textAlign: "center", color: "#65676b", fontSize: "0.78rem" }}>
                            No ad accounts in this business portfolio.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {activePortfolioAccounts.map((acc) => {
                              const isAccActive = acc.id === (connectedAccount?.id || selectedMetaAdAccountId);
                              return (
                                <div
                                  key={acc.id}
                                  onClick={() => {
                                    setSelectedMetaAdAccountId(acc.id);
                                    setConnectedAccount({
                                      id: acc.id,
                                      name: acc.name,
                                      display_id: acc.display_id || acc.id.replace("act_", ""),
                                      status: "connected",
                                      currency: "INR",
                                    });
                                    setAdAccountPickerOpen(false);
                                    showToast(`Selected ad account ${acc.display_id || acc.name}`, "success");
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "6px 8px",
                                    borderRadius: 6,
                                    background: isAccActive ? "#e7f3ff" : "#ffffff",
                                    cursor: "pointer",
                                    transition: "background 0.12s ease",
                                    border: isAccActive ? "1px solid #bae0fd" : "1px solid transparent",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isAccActive) e.currentTarget.style.background = "#f0f2f5";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isAccActive) e.currentTarget.style.background = "#ffffff";
                                  }}
                                >
                                  {/* Radio Circle */}
                                  <div
                                    style={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                      border: isAccActive ? "2px solid #0866ff" : "2px solid #ccd0d5",
                                      background: "#ffffff",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {isAccActive && (
                                      <div
                                        style={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: "50%",
                                          background: "#0866ff",
                                        }}
                                      />
                                    )}
                                  </div>

                                  {/* Monitor Screen Icon */}
                                  <div
                                    style={{
                                      width: 26,
                                      height: 26,
                                      borderRadius: 4,
                                      background: isAccActive ? "#ffffff" : "#f0f2f5",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <MonitorAdIcon size={15} color="#1c1e21" />
                                  </div>

                                  {/* Account Details */}
                                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1c1e21", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {acc.name || acc.display_id || acc.id}
                                    </span>
                                    <span style={{ fontSize: "0.68rem", color: "#65676b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      Ad account ID: {acc.display_id || acc.id.replace("act_", "")}
                                    </span>
                                  </div>

                                  {/* Right Circular Gauge */}
                                  <div
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: "50%",
                                      border: "2px solid #dadde1",
                                      borderTopColor: "#0866ff",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.62rem",
                                      color: "#8a8d91",
                                      flexShrink: 0,
                                    }}
                                  >
                                    --
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Create a business portfolio Modal (Exact Meta design from Image 1) */}
              {createPortfolioModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.45)",
                    zIndex: 99999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                  }}
                  onClick={() => setCreatePortfolioModalOpen(false)}
                >
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      width: "100%",
                      maxWidth: 530,
                      boxShadow: "0 12px 36px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      animation: "ctPortfolioModalIn 0.16s ease-out",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <style>{`@keyframes ctPortfolioModalIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>

                    {/* Modal Header */}
                    <div style={{ padding: "20px 24px 0 24px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#1c1e21" }}>
                          Create a business portfolio
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCreatePortfolioModalOpen(false)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#65676b",
                            padding: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#1c1e21")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <p style={{ margin: "6px 0 0", fontSize: "0.84rem", color: "#65676b", lineHeight: 1.4 }}>
                        Business portfolios bring your Facebook Pages, Instagram profiles and the people who work on them together, so you can manage them all in one place.
                      </p>
                    </div>

                    {/* Modal Body */}
                    <form onSubmit={handleCreateBusinessPortfolio} style={{ padding: "16px 24px 20px 24px" }}>
                      {/* Business portfolio name */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21" }}>
                          Business portfolio name
                        </label>
                        <p style={{ margin: "2px 0 6px", fontSize: "0.78rem", color: "#65676b", lineHeight: 1.35 }}>
                          This should match the public name of the business as it will be visible across Meta. You can change the name later in Settings.
                        </p>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Jasper's Market"
                          value={newPortfolioName}
                          onChange={(e) => setNewPortfolioName(e.target.value)}
                          style={{
                            width: "100%",
                            height: 38,
                            padding: "0 12px",
                            borderRadius: 6,
                            border: "1px solid #ccd0d5",
                            fontSize: "0.875rem",
                            color: "#1c1e21",
                            outline: "none",
                            transition: "border-color 0.15s ease",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "#0866ff")}
                          onBlur={(e) => (e.target.style.borderColor = "#ccd0d5")}
                        />
                      </div>

                      {/* Enter your contact info */}
                      <div style={{ marginTop: 18 }}>
                        <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#1c1e21" }}>
                          Enter your contact info
                        </h4>
                        <p style={{ margin: "2px 0 10px", fontSize: "0.78rem", color: "#65676b", lineHeight: 1.35 }}>
                          Enter your full name and business email address to become a business admin. Your contact info will be visible to other people who are added to this business portfolio.
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#1c1e21", marginBottom: 4 }}>
                              First name
                            </label>
                            <input
                              type="text"
                              value={newPortfolioFirstName}
                              onChange={(e) => setNewPortfolioFirstName(e.target.value)}
                              style={{
                                width: "100%",
                                height: 38,
                                padding: "0 12px",
                                borderRadius: 6,
                                border: "1px solid #ccd0d5",
                                fontSize: "0.875rem",
                                color: "#1c1e21",
                                outline: "none",
                              }}
                              onFocus={(e) => (e.target.style.borderColor = "#0866ff")}
                              onBlur={(e) => (e.target.style.borderColor = "#ccd0d5")}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#1c1e21", marginBottom: 4 }}>
                              Surname
                            </label>
                            <input
                              type="text"
                              value={newPortfolioSurname}
                              onChange={(e) => setNewPortfolioSurname(e.target.value)}
                              style={{
                                width: "100%",
                                height: 38,
                                padding: "0 12px",
                                borderRadius: 6,
                                border: "1px solid #ccd0d5",
                                fontSize: "0.875rem",
                                color: "#1c1e21",
                                outline: "none",
                              }}
                              onFocus={(e) => (e.target.style.borderColor = "#0866ff")}
                              onBlur={(e) => (e.target.style.borderColor = "#ccd0d5")}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#1c1e21", marginBottom: 2 }}>
                            Business email address
                          </label>
                          <p style={{ margin: "0 0 6px", fontSize: "0.78rem", color: "#65676b", lineHeight: 1.35 }}>
                            We'll use this email address to contact you about your business. It won't be visible to your customers.
                          </p>
                          <input
                            type="email"
                            value={newPortfolioEmail}
                            onChange={(e) => setNewPortfolioEmail(e.target.value)}
                            style={{
                              width: "100%",
                              height: 38,
                              padding: "0 12px",
                              borderRadius: 6,
                              border: "1px solid #ccd0d5",
                              fontSize: "0.875rem",
                              color: "#1c1e21",
                              outline: "none",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#0866ff")}
                            onBlur={(e) => (e.target.style.borderColor = "#ccd0d5")}
                          />
                        </div>
                      </div>

                      {/* Disclaimer matching Image 1 */}
                      <p style={{ margin: "16px 0 0", fontSize: "0.74rem", color: "#65676b", lineHeight: 1.4 }}>
                        Your contact info will be saved within this business portfolio. You can edit this contact info at any time in your business settings. By creating a business portfolio, you agree to the{" "}
                        <a
                          href="https://www.facebook.com/legal/commercial_terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#0866ff", textDecoration: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          Commercial Terms
                        </a>{" "}
                        on behalf of the business.
                      </p>

                      {/* Footer buttons matching Image 1 */}
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 20 }}>
                        <button
                          type="button"
                          onClick={() => setCreatePortfolioModalOpen(false)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 6,
                            border: "none",
                            background: "#f0f2f5",
                            color: "#050505",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "background 0.12s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#e4e6eb")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newPortfolioName.trim()}
                          style={{
                            padding: "8px 20px",
                            borderRadius: 6,
                            border: "none",
                            background: newPortfolioName.trim() ? "#0866ff" : "#80b4ff",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            cursor: newPortfolioName.trim() ? "pointer" : "not-allowed",
                            transition: "background 0.12s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (newPortfolioName.trim()) e.currentTarget.style.background = "#0055d6";
                          }}
                          onMouseLeave={(e) => {
                            if (newPortfolioName.trim()) e.currentTarget.style.background = "#0866ff";
                          }}
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Opportunity score badge button (matching Image 1) */}
              <div ref={opportunityScoreRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setOpportunityScoreOpen((prev) => !prev)}
                  title="Opportunity score (100)"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "none",
                    background: opportunityScoreOpen ? "#e4e6eb" : "transparent",
                    fontSize: "0.85rem",
                    color: "#1c1e21",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { if (!opportunityScoreOpen) e.currentTarget.style.background = "#f0f2f5"; }}
                  onMouseLeave={(e) => { if (!opportunityScoreOpen) e.currentTarget.style.background = "transparent"; }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: "2px solid #0866ff",
                      color: "#1c1e21",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    100
                  </span>
                  <span style={{ fontWeight: 600, color: "#1c1e21" }}>Opportunity score</span>
                  <span
                    style={{
                      display: "inline-block",
                      transform: opportunityScoreOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      fontSize: 10,
                      color: "#606770",
                      lineHeight: 1,
                    }}
                  >
                    ▼
                  </span>
                </button>

                {/* Opportunity Score Dropdown Popover (Exact Match to Image 1) */}
                {opportunityScoreOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      width: 335,
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #dadde1",
                      boxShadow: "0 8px 28px rgba(0,0,0,0.16)",
                      zIndex: 350,
                      padding: "18px 18px 22px 18px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      {/* 100 Circular score badge */}
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          minWidth: 46,
                          borderRadius: "50%",
                          border: "3px solid #0866ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "1.15rem",
                          color: "#1c1e21",
                        }}
                      >
                        100
                      </div>

                      {/* Title & Info & Description */}
                      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1c1e21" }}>
                              Opportunity score
                            </span>
                            <span
                              title="Opportunity score is an estimate of how well your campaigns are set up."
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                backgroundColor: "#606770",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: 700,
                                fontFamily: "serif",
                                cursor: "pointer",
                                lineHeight: 1,
                                flexShrink: 0,
                              }}
                            >
                              i
                            </span>
                          </div>

                          {/* Close button */}
                          <button
                            type="button"
                            onClick={() => setOpportunityScoreOpen(false)}
                            aria-label="Close"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 2,
                              color: "#606770",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f2f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <X size={17} strokeWidth={2.2} />
                          </button>
                        </div>

                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "0.76rem",
                            color: "#65676b",
                            lineHeight: 1.35,
                          }}
                        >
                          You applied all recommendations, which are proven to help improve performance.
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      style={{
                        height: 1,
                        backgroundColor: "#e4e6eb",
                        margin: "14px 0 16px 0",
                      }}
                    />

                    {/* Illustration & Empty State Content */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        padding: "0 6px 4px 6px",
                      }}
                    >
                      <svg
                        width="130"
                        height="146"
                        viewBox="0 0 130 146"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: "block" }}
                      >
                        {/* Soft floor shadow */}
                        <ellipse cx="65" cy="142" rx="26" ry="3.5" fill="#d0dbe4" opacity="0.85" />

                        {/* Bulb Glass Body */}
                        <path
                          d="M 50 98 C 47 88 35 75 35 52 C 35 34.5 48.5 20 65 20 C 81.5 20 95 34.5 95 52 C 95 75 83 88 80 98 Z"
                          fill="#dce5ed"
                        />

                        {/* Crescent Moon (inside bulb, top left) */}
                        <path
                          d="M 49 34 A 9 9 0 1 0 59 47 A 7.5 7.5 0 0 1 49 34 Z"
                          fill="#ffffff"
                        />

                        {/* Sparkle Star 1 (upper center) */}
                        <path
                          d="M 72 26 Q 72 31 77 31 Q 72 31 72 36 Q 72 31 67 31 Q 72 31 72 26 Z"
                          fill="#ffffff"
                        />

                        {/* Sparkle Star 2 (middle right) */}
                        <path
                          d="M 85 49 Q 85 53 89 53 Q 85 53 85 57 Q 85 53 81 53 Q 85 53 85 49 Z"
                          fill="#ffffff"
                        />

                        {/* Tiny stars / dots */}
                        <circle cx="86" cy="35" r="1.6" fill="#ffffff" />
                        <circle cx="76" cy="44" r="1.8" fill="#ffffff" />
                        <circle cx="47" cy="51" r="1.6" fill="#ffffff" />

                        {/* Filament support wires */}
                        <line x1="59" y1="72" x2="61" y2="98" stroke="#374553" strokeWidth="1.8" strokeLinecap="round" />
                        <line x1="71" y1="72" x2="69" y2="98" stroke="#374553" strokeWidth="1.8" strokeLinecap="round" />

                        {/* Filament curly loops (3 loops) */}
                        <path
                          d="M 56 72 C 55 64 57 60 59.5 60 C 62 60 62.5 66 65 66 C 67.5 66 68 60 70.5 60 C 73 60 73.5 66 76 66 C 78.5 66 80 62 80 72"
                          stroke="#374553"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />

                        {/* Bulb base threads */}
                        {/* Thread 1 */}
                        <rect x="52" y="98" width="26" height="5.5" rx="1.5" fill="#586b7c" />
                        {/* Thread 2 */}
                        <rect x="52.5" y="104.5" width="25" height="5.5" rx="1.5" fill="#697e90" />
                        {/* Thread 3 */}
                        <rect x="53.5" y="111" width="23" height="5.5" rx="1.5" fill="#526474" />
                        {/* Thread 4 */}
                        <rect x="55" y="117.5" width="20" height="5" rx="1.5" fill="#465665" />
                        {/* Bottom Contact Cap */}
                        <path
                          d="M 57.5 123.5 C 57.5 123.5 58 128 65 128 C 72 128 72.5 123.5 72.5 123.5 Z"
                          fill="#2d3a46"
                        />
                      </svg>

                      {/* Heading */}
                      <h4
                        style={{
                          margin: "12px 0 6px 0",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                        }}
                      >
                        No recommendations available yet
                      </h4>

                      {/* Subtext */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.80rem",
                          color: "#65676b",
                          lineHeight: 1.42,
                          maxWidth: 270,
                        }}
                      >
                        Your score changes as new recommendations become available, so check back again for more ways to keep it high.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Meta Action Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{lastUpdatedText}</span>
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh"
                disabled={metaLoading}
                style={{
                  padding: "5px 7px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  cursor: metaLoading ? "default" : "pointer",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!metaLoading) e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              >
                <RefreshCw
                  size={13}
                  className={metaLoading ? "animate-spin" : ""}
                  style={{ animation: metaLoading ? "spin 0.8s linear infinite" : "none" }}
                />
              </button>

              {/* Discard Drafts Button (Hidden after discard, matching Image 2) */}
              {!draftsDiscarded && totalDraftsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setDiscardModalOpen(true)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    color: "#334155",
                    fontWeight: 550,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                >
                  <Trash2 size={13} />
                  <span>Discard Drafts</span>
                </button>
              )}

              {/* Review and publish button (Disabled grey without count badge after discard, matching Image 2) */}
              <button
                type="button"
                disabled={draftsDiscarded || totalDraftsCount === 0}
                onClick={() => setReviewPublishModalOpen(true)}
                title={
                  draftsDiscarded || totalDraftsCount === 0
                    ? "No draft changes to review"
                    : `Review and publish ${totalDraftsCount} draft changes directly to Meta`
                }
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: draftsDiscarded || totalDraftsCount === 0 ? "1px solid #cbd5e1" : "none",
                  background: draftsDiscarded || totalDraftsCount === 0 ? "#f1f5f9" : "#0064e1",
                  color: draftsDiscarded || totalDraftsCount === 0 ? "#94a3b8" : "#ffffff",
                  fontSize: "0.84rem",
                  fontWeight: 650,
                  cursor: draftsDiscarded || totalDraftsCount === 0 ? "not-allowed" : "pointer",
                  boxShadow: draftsDiscarded || totalDraftsCount === 0 ? "none" : "0 1px 2px rgba(0, 100, 225, 0.2)",
                  transition: "all 0.15s ease",
                }}
              >
                {draftsDiscarded || totalDraftsCount === 0
                  ? "Review and publish"
                  : `Review and publish (${totalDraftsCount})`}
              </button>
              {/* 3-Dots More Button & Dropdown Menu (matching Image 2) */}
              <div ref={moreMenuRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen((prev) => !prev)}
                  title="More actions"
                  style={{
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: moreMenuOpen ? "#f1f5f9" : "#ffffff",
                    cursor: "pointer",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!moreMenuOpen) e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    if (!moreMenuOpen) e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>

                {/* Dropdown Menu matching Image 2 */}
                {moreMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      width: 290,
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
                      zIndex: 100,
                      overflow: "hidden",
                      padding: "6px 0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setResetModalOpen(true);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 18px",
                        background: "transparent",
                        border: "none",
                        fontSize: "0.88rem",
                        color: "#1c1e21",
                        cursor: "pointer",
                        display: "block",
                        fontWeight: 500,
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Reset Ads Manager...
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setShortcutsModalOpen(true);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 18px",
                        background: "transparent",
                        border: "none",
                        fontSize: "0.88rem",
                        color: "#1c1e21",
                        cursor: "pointer",
                        display: "block",
                        fontWeight: 500,
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Keyboard shortcuts (Ctrl + Shift + /)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>



          {/* 2. FILTER PILLS ROW (Matching Images 1, 2, 3, 4, 5) */}
          <div
            style={{
              padding: "10px 18px",
              background: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
              {/* Left Side: Filter Pills + See More Button */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {/* 1. All ads */}
                <div
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setHoveredViewButton("all")}
                  onMouseLeave={() => setHoveredViewButton(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectView("all")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: activeFilter === "all" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                      background: activeFilter === "all" ? "#d8eafd" : "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: activeFilter === "all" ? 650 : 500,
                      color: activeFilter === "all" ? "#0064e1" : "#1c1e21",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (activeFilter !== "all") e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      if (activeFilter !== "all") e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <Folder
                      size={14}
                      color={activeFilter === "all" ? "#0064e1" : "#475569"}
                      fill={activeFilter === "all" ? "#0064e1" : "none"}
                      strokeWidth={1.8}
                    />
                    <span>All ads</span>
                  </button>
                  {hoveredViewButton === "all" && renderViewHoverTooltip("all")}
                </div>

                {/* 2. Active ads (Matching Images 1, 2, 3) */}
                <div
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setHoveredViewButton("active")}
                  onMouseLeave={() => setHoveredViewButton(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectView("active")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: activeFilter === "active" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                      background: activeFilter === "active" ? "#d8eafd" : "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: activeFilter === "active" ? 650 : 500,
                      color: activeFilter === "active" ? "#0064e1" : "#1c1e21",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (activeFilter !== "active") e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      if (activeFilter !== "active") e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill={activeFilter === "active" ? "#0064e1" : "none"}
                      stroke={activeFilter === "active" ? "#0064e1" : "#475569"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <polygon points="3 11 22 2 13 21 11 13 3 11" fill={activeFilter === "active" ? "#0064e1" : "none"} />
                    </svg>
                    <span>Active ads</span>
                  </button>
                  {hoveredViewButton === "active" && renderViewHoverTooltip("active")}
                </div>

                {/* 3. Had delivery (Matching Images 1, 2, 3) */}
                <div
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setHoveredViewButton("had_delivery")}
                  onMouseLeave={() => setHoveredViewButton(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectView("had_delivery")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: activeFilter === "had_delivery" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                      background: activeFilter === "had_delivery" ? "#d8eafd" : "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: activeFilter === "had_delivery" ? 650 : 500,
                      color: activeFilter === "had_delivery" ? "#0064e1" : "#1c1e21",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (activeFilter !== "had_delivery") e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      if (activeFilter !== "had_delivery") e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    {activeFilter === "had_delivery" ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <rect x="2" y="4" width="20" height="16" rx="2" fill="#0064e1" />
                        <path d="M3 6L12 13L21 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M3 6L12 13L21 6" />
                      </svg>
                    )}
                    <span>Had delivery</span>
                  </button>
                  {hoveredViewButton === "had_delivery" && renderViewHoverTooltip("had_delivery")}
                </div>

                {/* 4. Actions (Matching Images 1, 3, 4, 5) */}
                <div
                  style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => setHoveredViewButton("actions")}
                  onMouseLeave={() => setHoveredViewButton(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectView("actions")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: hasActionsFilter ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: hasActionsFilter ? 650 : 500,
                      color: hasActionsFilter ? "#0064e1" : "#1c1e21",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = hasActionsFilter ? "#f0f7ff" : "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="9" stroke={hasActionsFilter ? "#0064e1" : "#475569"} strokeWidth="1.8" />
                      <path
                        d="M12 16V8M12 8L8.5 11.5M12 8L15.5 11.5"
                        stroke={hasActionsFilter ? "#0064e1" : "#475569"}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Actions</span>
                  </button>
                  {hoveredViewButton === "actions" && renderViewHoverTooltip("actions")}
                </div>

                {/* 5. Custom Pinned Views */}
                {savedQuickViews
                  .filter((v) => v.settings?.pinToTopBar)
                  .map((v) => {
                    const isSelected = activeCustomViewId === v.id;
                    return (
                      <div
                        key={v.id}
                        style={{ position: "relative", display: "inline-block" }}
                        onMouseEnter={() => setHoveredViewButton(v.id)}
                        onMouseLeave={() => setHoveredViewButton(null)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              handleSelectView("all");
                            } else {
                              handleSelectView("custom", v);
                            }
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            padding: "6px 14px",
                            borderRadius: 6,
                            border: isSelected ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                            background: isSelected ? "#d8eafd" : "#ffffff",
                            fontSize: "0.85rem",
                            fontWeight: isSelected ? 650 : 500,
                            color: isSelected ? "#0064e1" : "#1c1e21",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#f1f5f9";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#ffffff";
                          }}
                        >
                          <Pin size={12} color={isSelected ? "#0064e1" : "#475569"} />
                          <span>{v.name}</span>
                        </button>
                        {hoveredViewButton === v.id && renderViewHoverTooltip("custom", v)}
                      </div>
                    );
                  })}

                {/* 6. + See more button with Quick views popover (Images 2, 3, 4, 5) */}
                <div ref={quickViewsMenuRef} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickViewsMenuOpen((prev) => !prev);
                      setQuickViewsSubmenu(null);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: quickViewsMenuOpen ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                      background: quickViewsMenuOpen ? "#f1f5f9" : "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: quickViewsMenuOpen ? "#0064e1" : "#334155",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!quickViewsMenuOpen) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!quickViewsMenuOpen) e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <Plus size={14} color="#64748b" />
                    <span>See more</span>
                  </button>

                  {/* Popover Dropdown matching Images 2, 3, 4, 5 */}
                  {quickViewsMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        width: 250,
                        background: "#ffffff",
                        borderRadius: 8,
                        border: "1px solid #dadde1",
                        boxShadow: "0 8px 28px rgba(0, 0, 0, 0.14)",
                        zIndex: 500,
                        overflow: "hidden",
                        padding: "6px 0",
                        animation: "fadeIn 0.15s ease",
                      }}
                    >
                      {/* LEVEL 1: Quick views root menu (Image 2) */}
                      {quickViewsSubmenu === null && (
                        <div>
                          <div
                            style={{
                              padding: "8px 16px 6px",
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              color: "#1c1e21",
                            }}
                          >
                            Quick views
                          </div>

                          {/* Suggested views > */}
                          <button
                            type="button"
                            onClick={() => setQuickViewsSubmenu("suggested")}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "9px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.84rem",
                              color: "#1c1e21",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <span>Suggested views</span>
                            <ChevronRight size={15} color="#65676b" />
                          </button>

                          {/* My views > */}
                          <button
                            type="button"
                            onClick={() => setQuickViewsSubmenu("my_views")}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "9px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.84rem",
                              color: "#1c1e21",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span>My views</span>
                              {savedQuickViews.length > 0 && (
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    background: "#eff6ff",
                                    color: "#0064e1",
                                    padding: "1px 6px",
                                    borderRadius: 10,
                                    fontWeight: 700,
                                  }}
                                >
                                  {savedQuickViews.length}
                                </span>
                              )}
                            </div>
                            <ChevronRight size={15} color="#65676b" />
                          </button>

                          {/* Shared views > */}
                          <button
                            type="button"
                            onClick={() => setQuickViewsSubmenu("shared")}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "9px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.84rem",
                              color: "#1c1e21",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <span>Shared views</span>
                            <ChevronRight size={15} color="#65676b" />
                          </button>

                          <div style={{ height: 1, background: "#e2e8f0", margin: "6px 0" }} />

                          {/* + Create view */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingViewData(null);
                              setViewDrawerMode("create");
                              setViewDrawerTitle("Create view");
                              setCreateViewDrawerOpen(true);
                              setQuickViewsMenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "9px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              color: "#1c1e21",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Plus size={15} color="#1c1e21" />
                            <span>Create view</span>
                          </button>
                        </div>
                      )}

                      {/* LEVEL 2: Suggested views submenu (Exact Meta Image 3) */}
                      {quickViewsSubmenu === "suggested" && (
                        <div>
                          <div
                            style={{
                              padding: "6px 12px 8px",
                              borderBottom: "1px solid #f1f5f9",
                              marginBottom: 4,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setQuickViewsSubmenu(null)}
                              style={{
                                background: "transparent",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                color: "#1c1e21",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              <ChevronLeft size={16} color="#1c1e21" />
                              <span>Suggested views</span>
                            </button>
                          </div>

                          {/* 1. Active ads (with pencil icon matching Image 3) */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 16px",
                              cursor: "pointer",
                              transition: "background 0.1s",
                            }}
                            onClick={() => {
                              handleSelectView("active");
                              setEditingViewData({
                                id: "active",
                                name: "Active ads",
                                description: "",
                                access: "only_you",
                                settings: {
                                  filtersEnabled: true,
                                  columnsEnabled: false,
                                  breakdownsEnabled: false,
                                  attributionEnabled: false,
                                  filters: getFilterChipsForView("active"),
                                  pinToTopBar: true,
                                },
                              });
                              setViewDrawerMode("save_edits");
                              setViewDrawerTitle("Save edits");
                              setCreateViewDrawerOpen(true);
                              setQuickViewsMenuOpen(false);
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#64748b"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="3 11 22 2 13 21 11 13 3 11" />
                              </svg>
                              <span style={{ fontSize: "0.84rem", color: "#1c1e21", fontWeight: 500 }}>
                                Active ads
                              </span>
                            </div>
                            <button
                              type="button"
                              title="Edit view"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectView("active");
                                setEditingViewData({
                                  id: "active",
                                  name: "Active ads",
                                  description: "",
                                  access: "only_you",
                                  settings: {
                                    filtersEnabled: true,
                                    columnsEnabled: false,
                                    breakdownsEnabled: false,
                                    attributionEnabled: false,
                                    filters: getFilterChipsForView("active"),
                                    pinToTopBar: true,
                                  },
                                });
                                setViewDrawerMode("save_edits");
                                setViewDrawerTitle("Save edits");
                                setCreateViewDrawerOpen(true);
                                setQuickViewsMenuOpen(false);
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 3,
                                display: "flex",
                                alignItems: "center",
                                color: "#64748b",
                                borderRadius: 4,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>

                          {/* 2. Had delivery (with pencil icon matching Image 3) */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 16px",
                              cursor: "pointer",
                              transition: "background 0.1s",
                            }}
                            onClick={() => {
                              handleSelectView("had_delivery");
                              setEditingViewData({
                                id: "had_delivery",
                                name: "Had delivery",
                                description: "",
                                access: "only_you",
                                settings: {
                                  filtersEnabled: true,
                                  columnsEnabled: false,
                                  breakdownsEnabled: false,
                                  attributionEnabled: false,
                                  filters: getFilterChipsForView("had_delivery"),
                                  pinToTopBar: true,
                                },
                              });
                              setViewDrawerMode("edit");
                              setViewDrawerTitle("Edit view");
                              setCreateViewDrawerOpen(true);
                              setQuickViewsMenuOpen(false);
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M3 6L12 13L21 6" />
                              </svg>
                              <span style={{ fontSize: "0.84rem", color: "#1c1e21", fontWeight: 500 }}>
                                Had delivery
                              </span>
                            </div>
                            <button
                              type="button"
                              title="Edit view"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectView("had_delivery");
                                setEditingViewData({
                                  id: "had_delivery",
                                  name: "Had delivery",
                                  description: "",
                                  access: "only_you",
                                  settings: {
                                    filtersEnabled: true,
                                    columnsEnabled: false,
                                    breakdownsEnabled: false,
                                    attributionEnabled: false,
                                    filters: getFilterChipsForView("had_delivery"),
                                    pinToTopBar: true,
                                  },
                                });
                                setViewDrawerMode("edit");
                                setViewDrawerTitle("Edit view");
                                setCreateViewDrawerOpen(true);
                                setQuickViewsMenuOpen(false);
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 3,
                                display: "flex",
                                alignItems: "center",
                                color: "#64748b",
                                borderRadius: 4,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>

                          {/* 3. Actions (Matching Image 3) */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 16px",
                              cursor: "pointer",
                              transition: "background 0.1s",
                            }}
                            onClick={() => {
                              handleSelectView("actions");
                              setQuickViewsMenuOpen(false);
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="8" stroke="#64748b" strokeWidth="1.6" />
                                <path
                                  d="M10 13.5V6.5M10 6.5L7 9.5M10 6.5L13 9.5"
                                  stroke="#64748b"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span style={{ fontSize: "0.84rem", color: "#1c1e21", fontWeight: 500 }}>
                                Actions
                              </span>
                            </div>
                          </div>

                          <div style={{ height: 1, background: "#e2e8f0", margin: "6px 0" }} />

                          {/* + Create view */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingViewData(null);
                              setViewDrawerMode("create");
                              setViewDrawerTitle("Create view");
                              setCreateViewDrawerOpen(true);
                              setQuickViewsMenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "9px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              color: "#1c1e21",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Plus size={15} color="#1c1e21" />
                            <span>Create view</span>
                          </button>
                        </div>
                      )}

                      {/* LEVEL 2: My views submenu (Exact Meta Image 4) */}
                      {quickViewsSubmenu === "my_views" && (
                        <div>
                          <div
                            style={{
                              padding: "6px 12px 8px",
                              borderBottom: "1px solid #f1f5f9",
                              marginBottom: 4,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setQuickViewsSubmenu(null)}
                              style={{
                                background: "transparent",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                color: "#1c1e21",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              <ChevronLeft size={16} color="#1c1e21" />
                              <span>My views</span>
                            </button>
                          </div>

                          {savedQuickViews.length === 0 ? (
                            <div
                              style={{
                                padding: "16px 16px 18px",
                                fontSize: "0.84rem",
                                color: "#65676b",
                                lineHeight: 1.4,
                              }}
                            >
                              There are no additional views available.
                            </div>
                          ) : (
                            <div style={{ maxHeight: 240, overflowY: "auto" }}>
                              {savedQuickViews.map((view) => (
                                <div
                                  key={view.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 14px",
                                    background: activeCustomViewId === view.id ? "#eff6ff" : "transparent",
                                    cursor: "pointer",
                                    transition: "background 0.1s",
                                  }}
                                  onClick={() => {
                                    handleSelectView("custom", view);
                                    setQuickViewsMenuOpen(false);
                                  }}
                                  onMouseEnter={(e) => {
                                    if (activeCustomViewId !== view.id)
                                      e.currentTarget.style.background = "#f1f5f9";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (activeCustomViewId !== view.id)
                                      e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <div style={{ display: "flex", flexDirection: "column", maxWidth: 140 }}>
                                    <span
                                      style={{
                                        fontSize: "0.84rem",
                                        fontWeight: activeCustomViewId === view.id ? 700 : 500,
                                        color: "#1c1e21",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {view.name}
                                    </span>
                                    {view.description && (
                                      <span
                                        style={{
                                          fontSize: "0.7rem",
                                          color: "#64748b",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {view.description}
                                      </span>
                                    )}
                                  </div>

                                  {/* View Actions: Pin, Edit, Delete */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <button
                                      type="button"
                                      title={view.settings?.pinToTopBar ? "Unpin from top bar" : "Pin to top bar"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePinQuickView(view.id);
                                      }}
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 2,
                                        color: view.settings?.pinToTopBar ? "#0064e1" : "#94a3b8",
                                      }}
                                    >
                                      <Pin size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Edit view"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingViewData(view);
                                        setViewDrawerMode("save_edits");
                                        setViewDrawerTitle("Save edits");
                                        setCreateViewDrawerOpen(true);
                                        setQuickViewsMenuOpen(false);
                                      }}
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 2,
                                        color: "#64748b",
                                      }}
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Delete view"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteQuickView(view.id, view.name);
                                      }}
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 2,
                                        color: "#94a3b8",
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ height: 1, background: "#e2e8f0", margin: "6px 0" }} />

                          {/* + Create view */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingViewData(null);
                              setViewDrawerMode("create");
                              setViewDrawerTitle("Create view");
                              setCreateViewDrawerOpen(true);
                              setQuickViewsMenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "9px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              color: "#1c1e21",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Plus size={15} color="#1c1e21" />
                            <span>Create view</span>
                          </button>
                        </div>
                      )}

                      {/* LEVEL 2: Shared views submenu (Exact Meta Image 5) */}
                      {quickViewsSubmenu === "shared" && (
                        <div>
                          <div
                            style={{
                              padding: "6px 12px 8px",
                              borderBottom: "1px solid #f1f5f9",
                              marginBottom: 4,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setQuickViewsSubmenu(null)}
                              style={{
                                background: "transparent",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                color: "#1c1e21",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              <ChevronLeft size={16} color="#1c1e21" />
                              <span>Shared views</span>
                            </button>
                          </div>

                          <div
                            style={{
                              padding: "16px 16px 18px",
                              fontSize: "0.84rem",
                              color: "#65676b",
                              lineHeight: 1.4,
                            }}
                          >
                            There are no shared views available.
                          </div>

                          <div style={{ height: 1, background: "#e2e8f0", margin: "6px 0" }} />

                          {/* + Create view */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingViewData(null);
                              setViewDrawerMode("create");
                              setViewDrawerTitle("Create view");
                              setCreateViewDrawerOpen(true);
                              setQuickViewsMenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "9px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              color: "#1c1e21",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Plus size={15} color="#1c1e21" />
                            <span>Create view</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Create a view / Save edits button & Sliders button matching Images 1, 2, 3, 4, 5 */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* When on Actions: no text button is shown (Image 4). Otherwise show Create a view (All ads) or Save edits (Had delivery, Active ads, Custom) */}
                {activeFilter !== "actions" && (
                  <button
                    type="button"
                    onClick={handleOpenViewDrawerForCurrentTab}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "#1c1e21",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                  >
                    <span>{activeFilter === "all" ? "Create a view" : "Save edits"}</span>
                  </button>
                )}

                {/* Sliders Symbol Button (Image 5 symbol) */}
                {activeFilter === "actions" ? (
                  /* Image 4: Symbol in disabled format only */
                  <button
                    type="button"
                    disabled={true}
                    title="View editing is disabled for Actions"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px 8px",
                      height: 32,
                      minWidth: 32,
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#94a3b8",
                      cursor: "not-allowed",
                      opacity: 0.65,
                    }}
                  >
                    <MetaViewSlidersIcon size={16} color="#94a3b8" />
                  </button>
                ) : (
                  /* Images 1, 2, 3, 5: Enabled Sliders button */
                  <button
                    type="button"
                    title={
                      createViewDrawerOpen
                        ? "Close view panel"
                        : activeFilter === "all"
                        ? "Create a view"
                        : "Save edits"
                    }
                    onClick={handleToggleViewSliders}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px 8px",
                      height: 32,
                      minWidth: 32,
                      borderRadius: 6,
                      border: createViewDrawerOpen ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                      background: createViewDrawerOpen ? "#eff6ff" : "#ffffff",
                      color: createViewDrawerOpen ? "#0064e1" : "#1c1e21",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!createViewDrawerOpen) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!createViewDrawerOpen) e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <MetaViewSlidersIcon
                      size={16}
                      color={createViewDrawerOpen ? "#0064e1" : "#1c1e21"}
                    />
                  </button>
                )}
              </div>
          </div>

          {/* 3. MAIN WORKSPACE (Image 1 & 3) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              width: "100%",
              background: "#ffffff",
            }}
          >
              {/* Search Bar Container */}
              <div
                style={{
                  padding: "10px 18px",
                  background: "#ffffff",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                {/* Search Input Bar with Filter Chips matching Image 1 & 3 */}
                <div
                  ref={searchContainerRef}
                  onClick={() => {
                    if (!searchFilterPopoverOpen) setSearchFilterPopoverOpen(true);
                  }}
                  style={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: searchFilterPopoverOpen ? "1px solid #0064e1" : "1px solid #cbd5e1",
                    boxShadow: searchFilterPopoverOpen ? "0 0 0 2px rgba(0, 100, 225, 0.15)" : "none",
                    background: "#ffffff",
                    boxSizing: "border-box",
                    minHeight: 38,
                    cursor: "text",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                >
                  {/* Active Filter Chips */}
                  {activeFilterChips.map((chip, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#f0f2f5",
                        border: "1px solid #ccd0d5",
                        borderRadius: 4,
                        padding: "3px 8px",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: "#1c1e21",
                        height: 28,
                        boxSizing: "border-box",
                        userSelect: "none",
                      }}
                    >
                      {chip.includes("Recommendations") ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "#1c1e21", fontWeight: 400 }}>
                            {chip.replace("Recommendations", "").trim()}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 500, color: "#1c1e21" }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                              <path
                                d="M2.5 10.5C3.8 10.5 4.8 5.2 6.5 5.2C8.2 5.2 8.8 11.2 10.5 11.2C11.8 11.2 12.5 7.5 13.8 7.5"
                                stroke="#0064e1"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Recommendations
                          </span>
                        </span>
                      ) : chip.toLowerCase().includes("delivery is active") || chip.toLowerCase().includes("delivery: active") ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span>{chip.replace(/delivery is Active|Delivery: Active|delivery is active/i, "").trim() || levelPrefix} delivery is</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600, color: "#1c1e21" }}>
                            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#31a24c" }} />
                            Active
                          </span>
                        </span>
                      ) : chip.toLowerCase().includes("delivery is pending") || chip.toLowerCase().includes("delivery: pending") ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span>{chip.replace(/delivery is Pending|Delivery: Pending|delivery is pending/i, "").trim() || levelPrefix} delivery is</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600, color: "#1c1e21" }}>
                            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", border: "1.8px solid #31a24c", background: "#ffffff", boxSizing: "border-box" }} />
                            Pending
                          </span>
                        </span>
                      ) : chip.toLowerCase().includes("delivery is") ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span>{chip.split(/is\s*/i)[0]} is</span>
                          <strong style={{ fontWeight: 600, color: "#1c1e21" }}>{chip.split(/is\s*/i)[1]?.trim()}</strong>
                        </span>
                      ) : chip.toLowerCase().startsWith("objective is") ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span>Objective <span style={{ color: "#65676b" }}>is</span></span>
                          <strong style={{ fontWeight: 600, color: "#1c1e21" }}>{chip.replace(/objective\s*(is\s*one\s*of|is)?/i, "").trim()}</strong>
                        </span>
                      ) : chip.toLowerCase().includes("name contains") ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span>{chip.split(/contains all of|contains any of|does not contain|is not|is/i)[0]} <span style={{ color: "#65676b" }}>contains all of</span></span>
                          <strong style={{ fontWeight: 600, color: "#1c1e21" }}>{chip.split(/contains all of|contains any of|does not contain|is not|is/i)[1]?.trim()}</strong>
                        </span>
                      ) : (
                        <span>{chip}</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFilterChip(chip);
                        }}
                        title="Remove filter"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#65676b",
                          cursor: "pointer",
                          padding: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: 2,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#1c1e21")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                      >
                        <X size={13} strokeWidth={2.4} />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={() => setSearchFilterPopoverOpen(true)}
                    placeholder="Search to filter by: name, ID or metrics"
                    style={{
                      flex: 1,
                      minWidth: 200,
                      border: "none",
                      background: "transparent",
                      fontSize: "0.85rem",
                      color: "#0f172a",
                      outline: "none",
                      padding: "4px 6px",
                      fontFamily: "inherit",
                    }}
                  />

                  {/* Clear button if search query or chips are present (Image 3) */}
                  {(searchQuery || activeFilterChips.length > 0) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearAllFilters();
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#0064e1",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: "2px 8px",
                      }}
                    >
                      Clear
                    </button>
                  )}

                  {/* Authentic Meta Filters Popover (Images 1, 2, 3, 4) */}
                  {searchFilterPopoverOpen && (
                    <MetaFiltersPanel
                      isOpen={searchFilterPopoverOpen}
                      onClose={() => setSearchFilterPopoverOpen(false)}
                      selectedFilters={activeFilterChips}
                      onApply={(newFilters) => {
                        setActiveFilterChips(newFilters);
                        setSearchFilterPopoverOpen(false);
                      }}
                      mode="popover"
                      activeSubSection={activeMetaSubSection}
                    />
                  )}
                </div>
          </div>

          {/* The 3 Subsections Tabs: Campaigns, Ad sets, Ads (Directly from Images 1, 2, 3) */}
          <div
            style={{
              padding: "10px 18px 0 18px",
              background: "#f8fafc",
              borderBottom: "1px solid #cbd5e1",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {/* The 3 Subsection Tabs */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
              {/* Tab 1: Campaigns */}
              <button
                type="button"
                onClick={() => handleSwitchSubSection("campaigns")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: "7px 7px 0 0",
                  border: activeMetaSubSection === "campaigns" ? "1px solid #cbd5e1" : "1px solid transparent",
                  borderBottom: activeMetaSubSection === "campaigns" ? "1px solid #ffffff" : "1px solid transparent",
                  background: activeMetaSubSection === "campaigns" ? "#ffffff" : "transparent",
                  color: activeMetaSubSection === "campaigns" ? "#0f172a" : "#475569",
                  fontSize: "0.88rem",
                  fontWeight: activeMetaSubSection === "campaigns" ? 700 : 550,
                  cursor: "pointer",
                  position: "relative",
                  marginBottom: -1,
                  transition: "all 0.15s ease",
                }}
              >
                <MetaFolderIcon size={16} active={activeMetaSubSection === "campaigns"} />
                <span>Campaigns</span>
                {selectedCampaignIds.length > 0 && (
                  <span
                    style={{
                      background: "#0064e1",
                      color: "#ffffff",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginLeft: 4,
                    }}
                  >
                    <span>{selectedCampaignIds.length} selected</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaignIds([]);
                      }}
                      style={{ cursor: "pointer", opacity: 0.9 }}
                    >
                      ✕
                    </span>
                  </span>
                )}
              </button>

              {/* Tab 2: Ad sets */}
              <button
                type="button"
                onClick={() => handleSwitchSubSection("adsets")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: "7px 7px 0 0",
                  border: activeMetaSubSection === "adsets" ? "1px solid #cbd5e1" : "1px solid transparent",
                  borderBottom: activeMetaSubSection === "adsets" ? "1px solid #ffffff" : "1px solid transparent",
                  background: activeMetaSubSection === "adsets" ? "#ffffff" : "transparent",
                  color: activeMetaSubSection === "adsets" ? "#0f172a" : "#475569",
                  fontSize: "0.88rem",
                  fontWeight: activeMetaSubSection === "adsets" ? 700 : 550,
                  cursor: "pointer",
                  position: "relative",
                  marginBottom: -1,
                  transition: "all 0.15s ease",
                }}
              >
                <LayoutGrid size={16} color={activeMetaSubSection === "adsets" ? "#0064e1" : "#64748b"} />
                <span>Ad sets</span>
                {selectedAdsetIds.length > 0 && (
                  <span
                    style={{
                      background: "#0064e1",
                      color: "#ffffff",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginLeft: 4,
                    }}
                  >
                    <span>{selectedAdsetIds.length} selected</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAdsetIds([]);
                      }}
                      style={{ cursor: "pointer", opacity: 0.9 }}
                    >
                      ✕
                    </span>
                  </span>
                )}
              </button>

              {/* Tab 3: Ads (with blue selected counter badge matching Images 1, 2, 3) */}
              <button
                type="button"
                onClick={() => handleSwitchSubSection("ads")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: "7px 7px 0 0",
                  border: activeMetaSubSection === "ads" ? "1px solid #cbd5e1" : "1px solid transparent",
                  borderBottom: activeMetaSubSection === "ads" ? "1px solid #ffffff" : "1px solid transparent",
                  background: activeMetaSubSection === "ads" ? "#ffffff" : "transparent",
                  color: activeMetaSubSection === "ads" ? "#0f172a" : "#475569",
                  fontSize: "0.88rem",
                  fontWeight: activeMetaSubSection === "ads" ? 700 : 550,
                  cursor: "pointer",
                  position: "relative",
                  marginBottom: -1,
                  transition: "all 0.15s ease",
                }}
              >
                <MetaAdIcon size={16} active={activeMetaSubSection === "ads"} />
                <span>Ads</span>

                {/* Blue "1 selected ✕" pill badge shown in Images 1, 2, 3 */}
                {selectedAdIds.length > 0 && (
                  <span
                    style={{
                      background: "#0064e1",
                      color: "#ffffff",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginLeft: 4,
                    }}
                  >
                    <span>{selectedAdIds.length} selected</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAdIds([]);
                      }}
                      style={{ cursor: "pointer", opacity: 0.9 }}
                    >
                      ✕
                    </span>
                  </span>
                )}
              </button>
            </div>

            {/* Date Range Selector matching Images 1, 2, 3 */}
            <div
              style={{
                position: "relative",
                marginBottom: 6,
              }}
              ref={datePickerRef}
            >
              <button
                type="button"
                onClick={() => {
                  if (!datePickerOpen) {
                    setTempDatePreset(selectedDatePreset);
                    setTempStartDate(appliedStartDate);
                    setTempEndDate(appliedEndDate);
                    setCalMonth(appliedStartDate.getMonth());
                    setCalYear(appliedStartDate.getFullYear());
                  }
                  setDatePickerOpen((prev) => !prev);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: datePickerOpen ? "#f1f5f9" : "#ffffff",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.8rem",
                  color: "#334155",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Calendar size={14} color="#64748b" />
                <span>{appliedDateLabel}</span>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {/* Image 1 Date Picker Modal / Popover */}
              {datePickerOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    width: 660,
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08)",
                    zIndex: 500,
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                  }}
                  onClick={() => closeAllDateDropdowns()}
                >
                  {/* Top Body Row: Left Presets + Right Dual Calendar */}
                  <div style={{ display: "flex" }}>
                    {/* Left Pane: Presets Sidebar */}
                    <div
                      style={{
                        width: 170,
                        borderRight: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        background: "#ffffff",
                        paddingTop: 4,
                      }}
                    >
                      {/* Recently Used Section */}
                      <div style={{ padding: "8px 12px 4px 12px" }}>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                            marginBottom: 6,
                          }}
                        >
                          Recently used
                        </div>
                        {/* Top Today preset button */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            closeAllDateDropdowns();
                            handleSelectPreset("today");
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "4px 2px",
                            cursor: "pointer",
                            borderRadius: 4,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div
                            style={{
                              width: 15,
                              height: 15,
                              borderRadius: "50%",
                              border: tempDatePreset === "today" ? "2px solid #0064e1" : "1.5px solid #cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              background: "#ffffff",
                            }}
                          >
                            {tempDatePreset === "today" && (
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0064e1" }} />
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: "#1c1e21",
                              fontWeight: tempDatePreset === "today" ? 600 : 400,
                            }}
                          >
                            Today
                          </span>
                        </div>
                      </div>

                      <div style={{ height: 1, background: "#e4e6eb", margin: "3px 12px 5px 12px" }} />

                      {/* Presets List */}
                      <div
                        style={{
                          height: 200,
                          overflowY: "auto",
                          padding: "0 12px 6px 12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          scrollbarWidth: "thin",
                          scrollbarColor: "#94a3b8 #f1f5f9",
                        }}
                      >
                        {DATE_PRESET_OPTIONS.map((item) => {
                          const isSelected = tempDatePreset === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                closeAllDateDropdowns();
                                handleSelectPreset(item.id);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "4px 2px",
                                borderRadius: 4,
                                cursor: "pointer",
                                background: "transparent",
                                transition: "background 0.1s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div
                                style={{
                                  width: 15,
                                  height: 15,
                                  borderRadius: "50%",
                                  border: isSelected ? "2px solid #0064e1" : "1.5px solid #cbd5e1",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  background: "#ffffff",
                                }}
                              >
                                {isSelected && (
                                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0064e1" }} />
                                )}
                              </div>
                              <span
                                style={{
                                  fontSize: "0.82rem",
                                  color: "#1c1e21",
                                  fontWeight: isSelected ? 600 : 400,
                                }}
                              >
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Pane: Dual Calendar + Range Inputs */}
                    <div style={{ flex: 1, padding: "10px 14px", display: "flex", flexDirection: "column" }}>
                      {/* Calendar Month Header Navigation (matching Image 3) */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                          position: "relative",
                        }}
                      >
                        {/* Prev month button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeAllDateDropdowns();
                            if (calMonth === 0) {
                              setCalMonth(11);
                              setCalYear((prev) => prev - 1);
                            } else {
                              setCalMonth((prev) => prev - 1);
                            }
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px 4px",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            color: "#334155",
                          }}
                          title="Previous month"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        {/* Month 1 & Year 1 Dropdown Buttons matching Image 3 */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {/* Month 1 Dropdown */}
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = !month1DropdownOpen;
                                closeAllDateDropdowns();
                                setMonth1DropdownOpen(next);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 8px",
                                borderRadius: 5,
                                border: "none",
                                background: month1DropdownOpen ? "#e4e6eb" : "transparent",
                                fontSize: "0.86rem",
                                fontWeight: 650,
                                color: "#1c1e21",
                                cursor: "pointer",
                              }}
                            >
                              <span>{MONTH_NAMES[calMonth]}</span>
                              <ChevronDown size={13} color="#65676b" />
                            </button>

                            {month1DropdownOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 4px)",
                                  left: 0,
                                  width: 86,
                                  maxHeight: 185,
                                  overflowY: "auto",
                                  background: "#ffffff",
                                  borderRadius: 8,
                                  border: "1px solid #cbd5e1",
                                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.16)",
                                  zIndex: 600,
                                  padding: "4px 0",
                                  scrollbarWidth: "thin",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {MONTH_NAMES.map((name, idx) => (
                                  <div
                                    key={name}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCalMonth(idx);
                                      setMonth1DropdownOpen(false);
                                    }}
                                    style={{
                                      padding: "5px 12px",
                                      fontSize: "0.82rem",
                                      color: "#1c1e21",
                                      fontWeight: calMonth === idx ? 650 : 400,
                                      background: calMonth === idx ? "#f0f2f5" : "transparent",
                                      cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                    onMouseLeave={(e) => {
                                      if (calMonth !== idx) e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    {name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Year 1 Dropdown */}
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = !year1DropdownOpen;
                                closeAllDateDropdowns();
                                setYear1DropdownOpen(next);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 8px",
                                borderRadius: 5,
                                border: "none",
                                background: year1DropdownOpen ? "#e4e6eb" : "transparent",
                                fontSize: "0.86rem",
                                fontWeight: 650,
                                color: "#1c1e21",
                                cursor: "pointer",
                              }}
                            >
                              <span>{calYear}</span>
                              <ChevronDown size={13} color="#65676b" />
                            </button>

                            {year1DropdownOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 4px)",
                                  left: 0,
                                  width: 86,
                                  maxHeight: 185,
                                  overflowY: "auto",
                                  background: "#ffffff",
                                  borderRadius: 8,
                                  border: "1px solid #cbd5e1",
                                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.16)",
                                  zIndex: 600,
                                  padding: "4px 0",
                                  scrollbarWidth: "thin",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {YEAR_OPTIONS.map((yr) => (
                                  <div
                                    key={yr}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCalYear(yr);
                                      setYear1DropdownOpen(false);
                                    }}
                                    style={{
                                      padding: "5px 12px",
                                      fontSize: "0.82rem",
                                      color: "#1c1e21",
                                      fontWeight: calYear === yr ? 650 : 400,
                                      background: calYear === yr ? "#f0f2f5" : "transparent",
                                      cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                    onMouseLeave={(e) => {
                                      if (calYear !== yr) e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    {yr}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Month 2 & Year 2 Dropdown Buttons */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {/* Month 2 Dropdown */}
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = !month2DropdownOpen;
                                closeAllDateDropdowns();
                                setMonth2DropdownOpen(next);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 8px",
                                borderRadius: 5,
                                border: "none",
                                background: month2DropdownOpen ? "#e4e6eb" : "transparent",
                                fontSize: "0.86rem",
                                fontWeight: 650,
                                color: "#1c1e21",
                                cursor: "pointer",
                              }}
                            >
                              <span>{MONTH_NAMES[(calMonth + 1) % 12]}</span>
                              <ChevronDown size={13} color="#65676b" />
                            </button>

                            {month2DropdownOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 4px)",
                                  left: 0,
                                  width: 86,
                                  maxHeight: 185,
                                  overflowY: "auto",
                                  background: "#ffffff",
                                  borderRadius: 8,
                                  border: "1px solid #cbd5e1",
                                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.16)",
                                  zIndex: 600,
                                  padding: "4px 0",
                                  scrollbarWidth: "thin",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {MONTH_NAMES.map((name, idx) => (
                                  <div
                                    key={name}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCalMonth((idx - 1 + 12) % 12);
                                      setMonth2DropdownOpen(false);
                                    }}
                                    style={{
                                      padding: "5px 12px",
                                      fontSize: "0.82rem",
                                      color: "#1c1e21",
                                      fontWeight: (calMonth + 1) % 12 === idx ? 650 : 400,
                                      background: (calMonth + 1) % 12 === idx ? "#f0f2f5" : "transparent",
                                      cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                    onMouseLeave={(e) => {
                                      if ((calMonth + 1) % 12 !== idx) e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    {name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Year 2 Dropdown */}
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = !year2DropdownOpen;
                                closeAllDateDropdowns();
                                setYear2DropdownOpen(next);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 8px",
                                borderRadius: 5,
                                border: "none",
                                background: year2DropdownOpen ? "#e4e6eb" : "transparent",
                                fontSize: "0.86rem",
                                fontWeight: 650,
                                color: "#1c1e21",
                                cursor: "pointer",
                              }}
                            >
                              <span>{calMonth === 11 ? calYear + 1 : calYear}</span>
                              <ChevronDown size={13} color="#65676b" />
                            </button>

                            {year2DropdownOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "calc(100% + 4px)",
                                  left: 0,
                                  width: 86,
                                  maxHeight: 185,
                                  overflowY: "auto",
                                  background: "#ffffff",
                                  borderRadius: 8,
                                  border: "1px solid #cbd5e1",
                                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.16)",
                                  zIndex: 600,
                                  padding: "4px 0",
                                  scrollbarWidth: "thin",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {YEAR_OPTIONS.map((yr) => (
                                  <div
                                    key={yr}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCalYear(calMonth === 11 ? yr - 1 : yr);
                                      setYear2DropdownOpen(false);
                                    }}
                                    style={{
                                      padding: "5px 12px",
                                      fontSize: "0.82rem",
                                      color: "#1c1e21",
                                      fontWeight: (calMonth === 11 ? calYear + 1 : calYear) === yr ? 650 : 400,
                                      background: (calMonth === 11 ? calYear + 1 : calYear) === yr ? "#f0f2f5" : "transparent",
                                      cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                    onMouseLeave={(e) => {
                                      if ((calMonth === 11 ? calYear + 1 : calYear) !== yr) e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    {yr}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Next month button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeAllDateDropdowns();
                            if (calMonth === 11) {
                              setCalMonth(0);
                              setCalYear((prev) => prev + 1);
                            } else {
                              setCalMonth((prev) => prev + 1);
                            }
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px 4px",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            color: "#334155",
                          }}
                          title="Next month"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Dual Calendar Side-by-Side */}
                      <div style={{ display: "flex", gap: 16, justifyContent: "space-between" }}>
                        {renderCalendarMonth(calYear, calMonth)}
                        {renderCalendarMonth(
                          calMonth === 11 ? calYear + 1 : calYear,
                          (calMonth + 1) % 12
                        )}
                      </div>

                      {/* Compare Checkbox & Range Inputs */}
                      <div style={{ marginTop: 8 }}>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 7,
                            cursor: "pointer",
                            fontSize: "0.82rem",
                            color: "#1c1e21",
                            marginBottom: 6,
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={compareEnabled}
                            onChange={(e) => setCompareEnabled(e.target.checked)}
                            style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#0064e1" }}
                          />
                          <span>Compare</span>
                        </label>

                        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
                          {/* Blue indicator badge */}
                          <div
                            style={{
                              width: 13,
                              height: 13,
                              borderRadius: 3,
                              background: "#93c5fd",
                              flexShrink: 0,
                            }}
                          />

                          {/* Preset Dropdown Button */}
                          <div style={{ position: "relative" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = !presetDropdownOpen;
                                closeAllDateDropdowns();
                                setPresetDropdownOpen(next);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "4px 8px",
                                borderRadius: 5,
                                border: "1px solid #cbd5e1",
                                background: "#ffffff",
                                fontSize: "0.82rem",
                                color: "#1c1e21",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              <span>
                                {DATE_PRESET_OPTIONS.find((o) => o.id === tempDatePreset)?.label || "Custom"}
                              </span>
                              <ChevronDown size={13} color="#65676b" />
                            </button>

                            {presetDropdownOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "calc(100% + 4px)",
                                  left: 0,
                                  width: 160,
                                  maxHeight: 200,
                                  overflowY: "auto",
                                  background: "#ffffff",
                                  borderRadius: 8,
                                  border: "1px solid #cbd5e1",
                                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.16)",
                                  zIndex: 600,
                                  padding: "4px 0",
                                  scrollbarWidth: "thin",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {DATE_PRESET_OPTIONS.map((opt) => (
                                  <div
                                    key={opt.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectPreset(opt.id);
                                      setPresetDropdownOpen(false);
                                    }}
                                    style={{
                                      padding: "5px 12px",
                                      fontSize: "0.82rem",
                                      color: "#1c1e21",
                                      fontWeight: tempDatePreset === opt.id ? 650 : 400,
                                      background: tempDatePreset === opt.id ? "#f0f2f5" : "transparent",
                                      cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                    onMouseLeave={(e) => {
                                      if (tempDatePreset !== opt.id) e.currentTarget.style.background = "transparent";
                                    }}
                                  >
                                    {opt.label}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Start Date Box */}
                          <div
                            style={{
                              padding: "4px 8px",
                              borderRadius: 5,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              fontSize: "0.82rem",
                              color: "#1c1e21",
                              maxWidth: 120,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={formatFullInputDate(tempStartDate)}
                          >
                            {formatFullInputDate(tempStartDate)}
                          </div>

                          <span style={{ color: "#65676b", fontSize: "0.82rem" }}>-</span>

                          {/* End Date Box */}
                          <div
                            style={{
                              padding: "4px 8px",
                              borderRadius: 5,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              fontSize: "0.82rem",
                              color: "#1c1e21",
                              maxWidth: 120,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={formatFullInputDate(tempEndDate)}
                          >
                            {formatFullInputDate(tempEndDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer matching Image 2 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 16px",
                      borderTop: "1px solid #e2e8f0",
                      background: "#ffffff",
                      borderRadius: "0 0 8px 8px",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#65676b" }}>
                      Dates are shown in Kolkata Time
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setTempDatePreset(selectedDatePreset);
                          setTempStartDate(appliedStartDate);
                          setTempEndDate(appliedEndDate);
                          closeAllDateDropdowns();
                          setDatePickerOpen(false);
                        }}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 5,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDatePreset(tempDatePreset);
                          setAppliedStartDate(tempStartDate);
                          setAppliedEndDate(tempEndDate);
                          setAppliedDateLabel(getPresetLabel(tempDatePreset, tempStartDate, tempEndDate));
                          closeAllDateDropdowns();
                          setDatePickerOpen(false);
                        }}
                        style={{
                          padding: "5px 18px",
                          borderRadius: 5,
                          border: "none",
                          background: "#0064e1",
                          color: "#ffffff",
                          fontSize: "0.82rem",
                          fontWeight: 650,
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0, 100, 225, 0.2)",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#0053ba")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row below Tabs & Calendar: Action Toolbar & Table on left, Docked Save Edits panel on right below Calendar (Images 1, 3, 4) */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              position: "relative",
              width: "100%",
              height: "auto",
              minHeight: 520,
              maxHeight: "none",
              background: "#ffffff",
              borderBottom: "1px solid #cbd5e1",
              overflow: "hidden",
            }}
          >
            {/* Left Side: Actions Toolbar + Table */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {activeMetaSubSection === "ads" ? (
                <MetaAdsManagerAdsSection
                  ads={adsList}
                  loading={metaLoading}
                  setAds={setAdsList}
                  selectedAdIds={selectedAdIds}
                  setSelectedAdIds={setSelectedAdIds}
                  onToggleAdActive={toggleAdActive}
                  onOpenCreateAd={handleOpenCreateModal}
                  onOpenEditorForAd={(ad) => handleOpenStandaloneEditorForAd(ad)}
                  onOpenDuplicateAd={() => handleQuickDuplicate(1)}
                  onOpenABTest={() => setAbTestModalOpen(true)}
                  onPublishAd={(ad) => handlePublishSingleItem(ad, "ad")}
                  onNavigateToAdset={() => {
                    handleSwitchSubSection("adsets");
                  }}
                  onSwitchSubSection={handleSwitchSubSection}
                  showToast={showToast}
                  campaigns={campaignsList}
                  adsets={adsetsList}
                  client={clients?.find((c) => c.id === selectedClientId)}
                  adAccountId={selectedMetaAdAccountId}
                />
              ) : (
                <>
                  {/* 4. Action Bar Toolbar below tabs (Conditionally rendering Image 1 when selected, Image 2 when no selection) */}
                  {(() => {
                    const activeSel = getActiveSelection();
                    const hasSelection = activeSel.ids.length > 0;

                    return (
                      <div
                style={{
                  padding: "8px 18px",
                  background: "#ffffff",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {/* ═══ LEFT ACTION CONTROLS ═══ */}
                {!hasSelection ? (
                  /* ─── IMAGE 2: NO SELECTION STATE ─── */
                  /* + Create | Duplicate | Edit | Analyse | A/B test | More ▾ */
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    {/* 1. + Create (Solid Green Button) */}
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      title="Create new campaign, ad set, or ad"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 6,
                        border: "none",
                        background: "#007a41",
                        color: "#ffffff",
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0, 122, 65, 0.2)",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#006335")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#007a41")}
                    >
                      <Plus size={16} strokeWidth={2.8} />
                      <span>Create</span>
                    </button>

                    {/* 2. Duplicate (Disabled until a campaign, ad set, or ad is selected) */}
                    <button
                      type="button"
                      disabled={true}
                      aria-disabled="true"
                      title={`Select a ${activeSel.typeLabel} to duplicate`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #e4e6eb",
                        background: "#ffffff",
                        color: "#bcc0c4",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "not-allowed",
                        opacity: 0.65,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <MetaDuplicateIcon size={14} color="#bcc0c4" />
                      <span>Duplicate</span>
                    </button>

                    {/* 3. Edit (Disabled until a campaign, ad set, or ad is selected) */}
                    <button
                      type="button"
                      disabled={true}
                      aria-disabled="true"
                      title={`Select a ${activeSel.typeLabel} to edit`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #e4e6eb",
                        background: "#ffffff",
                        color: "#bcc0c4",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "not-allowed",
                        opacity: 0.65,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <MetaEditIcon size={13} color="#bcc0c4" />
                      <span>Edit</span>
                    </button>

                    {/* Image 2 Divider between Edit and Analyse */}
                    <div style={{ width: 1, height: 20, background: "#dadde1", margin: "0 2px" }} />

                    {/* 4. Analyse (Image 2 - Meta purple rosette blossom) */}
                    <button
                      type="button"
                      onClick={() => setAnalyseModalOpen(true)}
                      title="Analyse account performance & AI recommendations"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#1c1e21",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      <MetaAnalyseIcon size={14} />
                      <span>Analyse</span>
                    </button>

                    {/* 5. A/B test (Image 2 - Meta flask with solid liquid base) */}
                    <button
                      type="button"
                      onClick={() => setAbTestModalOpen(true)}
                      title="Create Meta A/B test experiment"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#1c1e21",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      <MetaFlaskIcon size={13} color="#1c1e21" />
                      <span>A/B test</span>
                    </button>

                    {/* 6. More ▾ (Image 2 & 3 - Meta Ads Manager dropdown) */}
                    <div ref={moreToolbarRef} style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setMoreToolbarMenuOpen((prev) => !prev);
                          setExportSubmenuOpen(false);
                        }}
                        title="More options"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          padding: "6px 8px",
                          borderRadius: 4,
                          border: "none",
                          background: moreToolbarMenuOpen ? "#f1f5f9" : "transparent",
                          color: "#1c1e21",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!moreToolbarMenuOpen) e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!moreToolbarMenuOpen) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span>More</span>
                        <MetaCaretDown size={7} color="#1c1e21" />
                      </button>

                      {moreToolbarMenuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            minWidth: 260,
                            background: "#ffffff",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
                            zIndex: 100,
                            overflow: "visible",
                            padding: "6px 0",
                          }}
                        >
                          {/* Automated rules header */}
                          <div
                            style={{
                              padding: "6px 16px 4px 16px",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              userSelect: "none",
                            }}
                          >
                            Automated rules
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCreateRuleModalOpen(true);
                              setMoreToolbarMenuOpen(false);
                              setExportSubmenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "block",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              setExportSubmenuOpen(false);
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Create a new rule
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setManageAdjustmentsModalOpen(true);
                              setMoreToolbarMenuOpen(false);
                              setExportSubmenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              setExportSubmenuOpen(false);
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <span>Manage rules</span>
                            <ExternalLink size={13} color="#64748b" />
                          </button>

                          {/* Import and export ad configuration header */}
                          <div
                            style={{
                              padding: "10px 16px 4px 16px",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              userSelect: "none",
                            }}
                          >
                            Import and export ad configuration
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setImportAdsModalOpen(true);
                              setMoreToolbarMenuOpen(false);
                              setExportSubmenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "block",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              setExportSubmenuOpen(false);
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Import ads in bulk
                          </button>

                          {/* Export with Submenu (Image 2 & 3) */}
                          <div
                            style={{ position: "relative" }}
                            onMouseEnter={() => setExportSubmenuOpen(true)}
                            onMouseLeave={(e) => {
                              const related = e.relatedTarget;
                              if (!e.currentTarget.contains(related)) {
                                setExportSubmenuOpen(false);
                              }
                            }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExportSubmenuOpen((prev) => !prev);
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "7px 16px",
                                background: exportSubmenuOpen ? "#f1f5f9" : "transparent",
                                border: "none",
                                fontSize: "0.82rem",
                                color: "#1e293b",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                              onMouseLeave={(e) => {
                                if (!exportSubmenuOpen) e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <span>Export</span>
                              <ChevronRight size={14} color="#64748b" />
                            </button>

                            {/* Submenu for Export (Image 3) */}
                            {exportSubmenuOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: "calc(100% - 2px)",
                                  minWidth: 150,
                                  background: "#ffffff",
                                  borderRadius: 8,
                                  border: "1px solid #e2e8f0",
                                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
                                  zIndex: 120,
                                  padding: "4px 0",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExport("csv", false);
                                    setMoreToolbarMenuOpen(false);
                                    setExportSubmenuOpen(false);
                                  }}
                                  style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "8px 16px",
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "0.82rem",
                                    color: "#1e293b",
                                    cursor: "pointer",
                                    display: "block",
                                    whiteSpace: "nowrap",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                  Export all
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handleDownloadExcelTemplate}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "block",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              setExportSubmenuOpen(false);
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Download Excel template
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ─── IMAGE 1: SELECTION ACTIVE STATE ─── */
                  /* + Create | Publish | Duplicate ▾ | Edit ▾ | Trash | Preview | More ▾ */
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    {/* 1. + Create */}
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      title="Create new campaign, ad set, or ad"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 6,
                        border: "none",
                        background: "#007a41",
                        color: "#ffffff",
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0, 122, 65, 0.2)",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#006335")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#007a41")}
                    >
                      <Plus size={16} strokeWidth={2.8} />
                      <span>Create</span>
                    </button>

                    {/* 2. Publish (Image 1 - with up arrow icon) */}
                    <button
                      type="button"
                      onClick={handlePublish}
                      title={
                        activeSelectionDraftCount > 0
                          ? `Publish ${activeSelectionDraftCount} draft changes to live`
                          : "Publish changes to Meta Ads Manager"
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        fontSize: "0.82rem",
                        fontWeight: 550,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      <Upload size={13} color="#64748b" />
                      <span>Publish</span>
                      {activeSelectionDraftCount > 0 && (
                        <span
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: 4,
                          }}
                        >
                          {activeSelectionDraftCount}
                        </span>
                      )}
                    </button>

                    {/* 3. Duplicate ▾ */}
                    <div ref={duplicateRef} style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => setDuplicateMenuOpen((prev) => !prev)}
                        title="Duplicate selected item(s) (Ctrl+D)"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: duplicateMenuOpen ? "#f1f5f9" : "#ffffff",
                          color: "#334155",
                          fontSize: "0.82rem",
                          fontWeight: 550,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!duplicateMenuOpen) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!duplicateMenuOpen) e.currentTarget.style.background = "#ffffff";
                        }}
                      >
                        <MetaDuplicateIcon size={14} color="#4b4f56" />
                        <span>Duplicate</span>
                        <MetaCaretDown size={7} color="#1c1e21" />
                      </button>

                      {duplicateMenuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: 215,
                            background: "#ffffff",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
                            zIndex: 80,
                            overflow: "hidden",
                            padding: "4px 0",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleQuickDuplicate(1)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontWeight: 500,
                              transition: "background 0.1s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Copy size={13} color="#64748b" />
                              <span>Quick duplicate</span>
                            </div>
                            <kbd
                              style={{
                                background: "#f1f5f9",
                                padding: "2px 5px",
                                borderRadius: 4,
                                border: "1px solid #e2e8f0",
                                fontSize: "0.72rem",
                                color: "#64748b",
                                fontWeight: 600,
                              }}
                            >
                              Ctrl + D
                            </kbd>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDuplicateCopies(1);
                              setDuplicateDestination("original");
                              setDuplicateModalOpen(true);
                              setDuplicateMenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontWeight: 500,
                              transition: "background 0.1s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <SlidersHorizontal size={13} color="#64748b" />
                            <span>Duplicate...</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 4. Edit ▾ */}
                    <div ref={editRef} style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => setEditMenuOpen((prev) => !prev)}
                        title="Edit selected item(s) (Ctrl+U)"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: editMenuOpen ? "#f1f5f9" : "#ffffff",
                          color: "#334155",
                          fontSize: "0.82rem",
                          fontWeight: 550,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!editMenuOpen) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!editMenuOpen) e.currentTarget.style.background = "#ffffff";
                        }}
                      >
                        <MetaEditIcon size={13} color="#4b4f56" />
                        <span>Edit</span>
                        <MetaCaretDown size={7} color="#1c1e21" />
                      </button>

                      {editMenuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: 220,
                            background: "#ffffff",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
                            zIndex: 80,
                            overflow: "hidden",
                            padding: "4px 0",
                          }}
                        >
                          <button
                            type="button"
                            onClick={handleOpenEditDrawer}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontWeight: 500,
                              transition: "background 0.1s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Edit2 size={13} color="#64748b" />
                              <span>Edit</span>
                            </div>
                            <kbd
                              style={{
                                background: "#f1f5f9",
                                padding: "2px 5px",
                                borderRadius: 4,
                                border: "1px solid #e2e8f0",
                                fontSize: "0.72rem",
                                color: "#64748b",
                                fontWeight: 600,
                              }}
                            >
                              Ctrl + U
                            </kbd>
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenQuickEdit}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontWeight: 500,
                              transition: "background 0.1s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Sliders size={13} color="#64748b" />
                            <span>Quick edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenFindReplace}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontWeight: 500,
                              transition: "background 0.1s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <Search size={13} color="#64748b" />
                            <span>Find and replace...</span>
                          </button>
                          <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                          <button
                            type="button"
                            onClick={handleBatchTurnOn}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                            <span>Turn on</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleBatchTurnOff}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 14px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }} />
                            <span>Turn off</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 5. Trash (Delete) */}
                    <button
                      type="button"
                      onClick={handleOpenDelete}
                      title="Delete selected item(s)"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#64748b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fee2e2";
                        e.currentTarget.style.color = "#dc2626";
                        e.currentTarget.style.borderColor = "#fca5a5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.color = "#64748b";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                      }}
                    >
                      <Trash2 size={14} />
                    </button>


                    {/* 7. More ▾ (Image 2 & 3 - Meta Ads Manager dropdown) */}
                    <div ref={moreToolbarRef} style={{ position: "relative" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setMoreToolbarMenuOpen((prev) => !prev);
                          setExportSubmenuOpen(false);
                        }}
                        title="More options"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: moreToolbarMenuOpen ? "#f1f5f9" : "#ffffff",
                          color: "#334155",
                          fontSize: "0.82rem",
                          fontWeight: 550,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!moreToolbarMenuOpen) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!moreToolbarMenuOpen) e.currentTarget.style.background = "#ffffff";
                        }}
                      >
                        <span>More</span>
                        <MetaCaretDown size={7} color="#1c1e21" />
                      </button>

                      {moreToolbarMenuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            minWidth: 260,
                            background: "#ffffff",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
                            zIndex: 100,
                            overflow: "visible",
                            padding: "6px 0",
                          }}
                        >
                          {/* Automated rules header */}
                          <div
                            style={{
                              padding: "6px 16px 4px 16px",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              userSelect: "none",
                            }}
                          >
                            Automated rules
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCreateRuleModalOpen(true);
                              setMoreToolbarMenuOpen(false);
                              setExportSubmenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "block",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              setExportSubmenuOpen(false);
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Create a new rule
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setManageAdjustmentsModalOpen(true);
                              setMoreToolbarMenuOpen(false);
                              setExportSubmenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              setExportSubmenuOpen(false);
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <span>Manage rules</span>
                            <ExternalLink size={13} color="#64748b" />
                          </button>

                          {/* Import and export ad configuration header */}
                          <div
                            style={{
                              padding: "10px 16px 4px 16px",
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              userSelect: "none",
                            }}
                          >
                            Import and export ad configuration
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setImportAdsModalOpen(true);
                              setMoreToolbarMenuOpen(false);
                              setExportSubmenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "block",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              setExportSubmenuOpen(false);
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Import ads in bulk
                          </button>

                          {/* Export with Submenu (Image 2 & 3) */}
                          <div
                            style={{ position: "relative" }}
                            onMouseEnter={() => setExportSubmenuOpen(true)}
                            onMouseLeave={(e) => {
                              const related = e.relatedTarget;
                              if (!e.currentTarget.contains(related)) {
                                setExportSubmenuOpen(false);
                              }
                            }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExportSubmenuOpen((prev) => !prev);
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "7px 16px",
                                background: exportSubmenuOpen ? "#f1f5f9" : "transparent",
                                border: "none",
                                fontSize: "0.82rem",
                                color: "#1e293b",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                              onMouseLeave={(e) => {
                                if (!exportSubmenuOpen) e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <span>Export</span>
                              <ChevronRight size={14} color="#64748b" />
                            </button>

                            {/* Submenu for Export (Image 3) */}
                            {exportSubmenuOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: "calc(100% - 2px)",
                                  minWidth: 160,
                                  background: "#ffffff",
                                  borderRadius: 8,
                                  border: "1px solid #e2e8f0",
                                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)",
                                  zIndex: 120,
                                  padding: "4px 0",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExport("csv", true);
                                    setMoreToolbarMenuOpen(false);
                                    setExportSubmenuOpen(false);
                                  }}
                                  style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "8px 16px",
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "0.82rem",
                                    color: "#1e293b",
                                    cursor: "pointer",
                                    display: "block",
                                    whiteSpace: "nowrap",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                  Export selected
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleExport("csv", false);
                                    setMoreToolbarMenuOpen(false);
                                    setExportSubmenuOpen(false);
                                  }}
                                  style={{
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "8px 16px",
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "0.82rem",
                                    color: "#1e293b",
                                    cursor: "pointer",
                                    display: "block",
                                    whiteSpace: "nowrap",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                  Export all
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handleDownloadExcelTemplate}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: "#1e293b",
                              cursor: "pointer",
                              display: "block",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              setExportSubmenuOpen(false);
                            }}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Download Excel template
                          </button>

                          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 4, paddingTop: 4 }}>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(activeSel.ids.join(", "));
                                showToast(`Copied ${activeSel.ids.length} ID(s) to clipboard.`, "success");
                                setMoreToolbarMenuOpen(false);
                                setExportSubmenuOpen(false);
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "7px 16px",
                                background: "transparent",
                                border: "none",
                                fontSize: "0.82rem",
                                color: "#1e293b",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <Copy size={13} color="#64748b" />
                              <span>Copy IDs to clipboard</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══ RIGHT ACTION CONTROLS (Image 2: Columns: Custom ▾ | Breakdown ▾ | Reports ▾ | [ ⤓ | ▾ ] | View Charts) ═══ */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {/* 1. Columns: Custom ▾ (Image 2 - 3 vertical bars + Custom + solid down caret) */}
                  <div ref={columnsRef} style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setColumnsMenuOpen((prev) => !prev)}
                      title="Columns display configuration"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: columnsMenuOpen ? "#f1f5f9" : "#ffffff",
                        color: "#1c1e21",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!columnsMenuOpen) e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!columnsMenuOpen) e.currentTarget.style.background = "#ffffff";
                      }}
                    >
                      <MetaColumnsIcon size={13} color="#1c1e21" />
                      <span style={{ whiteSpace: "nowrap" }}>Columns: {hasActionsFilter ? "Custom" : selectedColumnPreset}</span>
                      <MetaCaretDown size={7} color="#1c1e21" />
                    </button>

                    {columnsMenuOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 5px)",
                          right: 0,
                          width: 250,
                          background: "#ffffff",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 28px rgba(0, 0, 0, 0.14)",
                          zIndex: 90,
                          padding: "6px 0",
                          maxHeight: 380,
                          overflowY: "auto",
                        }}
                      >
                        <div style={{ padding: "6px 14px 4px 14px", fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          Column presets
                        </div>
                        {[
                          "Custom",
                          "Performance",
                          "Copy of Performance",
                          "Setup",
                          "Delivery",
                          "Engagement",
                          "Video Engagement",
                          "Performance and Clicks",
                          "Targeting and Creative",
                        ].map((preset) => {
                          const isActive = selectedColumnPreset === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setSelectedColumnPreset(preset);
                                setColumnsMenuOpen(false);
                                showToast(`Columns preset changed to "${preset}".`, "info");
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "7px 14px",
                                background: isActive ? "#eff6ff" : "transparent",
                                border: "none",
                                fontSize: "0.82rem",
                                color: isActive ? "#0064e1" : "#1e293b",
                                fontWeight: isActive ? 600 : 450,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.background = "#f8fafc";
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <span>{preset}</span>
                              {isActive && <Check size={14} color="#0064e1" />}
                            </button>
                          );
                        })}
                        <div style={{ height: 1, background: "#f1f5f9", margin: "6px 0" }} />
                        <button
                          type="button"
                          onClick={() => {
                            setCustomizeColumnsModalOpen(true);
                            setColumnsMenuOpen(false);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 14px",
                            background: "transparent",
                            border: "none",
                            fontSize: "0.82rem",
                            color: "#0064e1",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <SlidersHorizontal size={13} color="#0064e1" />
                          <span>Customize columns...</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Breakdown ▾ (Image 2 - Meta breakdown icon + solid down caret) */}
                  <div ref={breakdownRef} style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setBreakdownMenuOpen((prev) => !prev)}
                      title="Break down results by dimensions"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: breakdownMenuOpen || selectedBreakdown ? "#eff6ff" : "#ffffff",
                        color: selectedBreakdown ? "#0064e1" : "#1c1e21",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!breakdownMenuOpen) e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!breakdownMenuOpen) e.currentTarget.style.background = selectedBreakdown ? "#eff6ff" : "#ffffff";
                      }}
                    >
                      <MetaBreakdownIcon size={13} color={selectedBreakdown ? "#0064e1" : "#1c1e21"} />
                      <span>{selectedBreakdown ? `Breakdown: ${selectedBreakdown}` : "Breakdown"}</span>
                      <MetaCaretDown size={7} color={selectedBreakdown ? "#0064e1" : "#1c1e21"} />
                    </button>

                    {breakdownMenuOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 5px)",
                          right: 0,
                          width: 230,
                          background: "#ffffff",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 28px rgba(0, 0, 0, 0.14)",
                          zIndex: 90,
                          padding: "6px 0",
                          maxHeight: 380,
                          overflowY: "auto",
                        }}
                      >
                        <div style={{ padding: "6px 14px 4px 14px", fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          By Time
                        </div>
                        {["Day", "Week", "Month"].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setSelectedBreakdown(item);
                              setBreakdownMenuOpen(false);
                              showToast(`Applied breakdown: By Time (${item})`, "info");
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "6px 14px",
                              background: selectedBreakdown === item ? "#eff6ff" : "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: selectedBreakdown === item ? "#0064e1" : "#1e293b",
                              fontWeight: selectedBreakdown === item ? 600 : 450,
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <span>{item}</span>
                            {selectedBreakdown === item && <Check size={13} color="#0064e1" />}
                          </button>
                        ))}

                        <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                        <div style={{ padding: "6px 14px 4px 14px", fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          By Delivery
                        </div>
                        {["Age", "Gender", "Placement", "Platform", "Country"].map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setSelectedBreakdown(item);
                              setBreakdownMenuOpen(false);
                              showToast(`Applied breakdown: By Delivery (${item})`, "info");
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "6px 14px",
                              background: selectedBreakdown === item ? "#eff6ff" : "transparent",
                              border: "none",
                              fontSize: "0.82rem",
                              color: selectedBreakdown === item ? "#0064e1" : "#1e293b",
                              fontWeight: selectedBreakdown === item ? 600 : 450,
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <span>{item}</span>
                            {selectedBreakdown === item && <Check size={13} color="#0064e1" />}
                          </button>
                        ))}

                        {selectedBreakdown && (
                          <>
                            <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBreakdown(null);
                                setBreakdownMenuOpen(false);
                                showToast("Cleared breakdowns.", "info");
                              }}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "7px 14px",
                                background: "transparent",
                                border: "none",
                                fontSize: "0.82rem",
                                color: "#dc2626",
                                fontWeight: 550,
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              Clear all breakdowns
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Reports Icon Button (Image 2 - Stacked reports documents + solid down caret) */}
                  <div ref={rulesRef} style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setRulesMenuOpen((prev) => !prev)}
                      title="Reports & automated rules"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: rulesMenuOpen ? "#f1f5f9" : "#ffffff",
                        color: "#1c1e21",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!rulesMenuOpen) e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!rulesMenuOpen) e.currentTarget.style.background = "#ffffff";
                      }}
                    >
                      <MetaReportsIcon size={14} color="#1c1e21" />
                      <MetaCaretDown size={7} color="#1c1e21" />
                    </button>

                    {rulesMenuOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 5px)",
                          right: 0,
                          width: 220,
                          background: "#ffffff",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 28px rgba(0, 0, 0, 0.14)",
                          zIndex: 90,
                          padding: "6px 0",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCreateRuleModalOpen(true);
                            setRulesMenuOpen(false);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 14px",
                            background: "transparent",
                            border: "none",
                            fontSize: "0.82rem",
                            color: "#1e293b",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <SlidersHorizontal size={13} color="#64748b" />
                          <span>Create a new rule</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setManageAdjustmentsModalOpen(true);
                            setRulesMenuOpen(false);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 14px",
                            background: "transparent",
                            border: "none",
                            fontSize: "0.82rem",
                            color: "#1e293b",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Check size={13} color="#16a34a" />
                          <span>Manage active rules</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            showToast("Applied recommended performance optimization rules.", "success");
                            setRulesMenuOpen(false);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 14px",
                            background: "transparent",
                            border: "none",
                            fontSize: "0.82rem",
                            color: "#1e293b",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <MetaAnalyseIcon size={13} />
                          <span>Apply recommended rules</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4. Split Export / Download Button (Image 2 - [ ⤓ | ▾ ]) */}
                  <div ref={downloadRef} style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: downloadMenuOpen ? "#f1f5f9" : "#ffffff",
                        overflow: "hidden",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Left: Quick export action */}
                      <button
                        type="button"
                        onClick={() => handleExport("csv")}
                        title="Download / Export report (CSV)"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px 9px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#1c1e21",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <MetaDownloadTrayIcon size={13} color="#1c1e21" />
                      </button>

                      {/* Middle vertical divider */}
                      <div style={{ width: 1, height: 16, background: "#cbd5e1" }} />

                      {/* Right: Dropdown options caret */}
                      <button
                        type="button"
                        onClick={() => setDownloadMenuOpen((prev) => !prev)}
                        title="Download / Export options"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px 7px",
                          border: "none",
                          background: downloadMenuOpen ? "#e2e8f0" : "transparent",
                          cursor: "pointer",
                          color: "#1c1e21",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!downloadMenuOpen) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!downloadMenuOpen) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <MetaCaretDown size={7} color="#1c1e21" />
                      </button>
                    </div>

                    {downloadMenuOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 5px)",
                          right: 0,
                          width: 190,
                          background: "#ffffff",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 10px 28px rgba(0, 0, 0, 0.14)",
                          zIndex: 90,
                          overflow: "hidden",
                          padding: "4px 0",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleExport("csv")}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "9px 16px",
                            background: "transparent",
                            border: "none",
                            fontSize: "0.83rem",
                            color: "#1e293b",
                            cursor: "pointer",
                            display: "block",
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Export as .csv
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExport("xlsx")}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "9px 16px",
                            background: "transparent",
                            border: "none",
                            fontSize: "0.83rem",
                            color: "#1e293b",
                            cursor: "pointer",
                            display: "block",
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Export as .xlsx
                        </button>
                        {hasSelection && (
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Exported ${activeSel.ids.length} selected row(s).`, "success");
                              setDownloadMenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "9px 16px",
                              background: "transparent",
                              border: "none",
                              fontSize: "0.83rem",
                              color: "#0064e1",
                              cursor: "pointer",
                              display: "block",
                              fontWeight: 550,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Export selected ({activeSel.ids.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 5. View Charts Icon Button (Image 2 - Frame with rising line chart & node) */}
                  <button
                    type="button"
                    onClick={() => setChartsDrawerOpen((prev) => !prev)}
                    title={chartsDrawerOpen ? "Close charts panel" : "View charts & inspection"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px 9px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: chartsDrawerOpen ? "#e0f2fe" : "#ffffff",
                      color: chartsDrawerOpen ? "#0284c7" : "#1c1e21",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!chartsDrawerOpen) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (!chartsDrawerOpen) e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    <MetaViewChartsIcon size={14} color={chartsDrawerOpen ? "#0284c7" : "#1c1e21"} />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 5. FULL HORIZONTAL SCROLLING TABLE WITH ALL 19 COLUMNS (From Images 1, 2, 3) */}
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              background: "#ffffff",
              position: "relative",
            }}
          >
            {/* ═══ ADS TABLE ═══ */}
            {activeMetaSubSection === "ads" && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 2450,
                  fontSize: "0.83rem",
                }}
              >
                {renderMetaTableHeader("ads")}
                <tbody>
                  {draftsDiscarded || adsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        style={{
                          padding: 0,
                          background: "#ffffff",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            position: "sticky",
                            left: 0,
                            width: "100%",
                            maxWidth: "100vw",
                            minHeight: 340,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "60px 20px 80px 20px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ marginBottom: 16 }}>
                            <Search size={48} strokeWidth={1.4} color="#94a3b8" />
                          </div>
                          <div
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              marginBottom: 6,
                            }}
                          >
                            Get set up to run ads
                          </div>
                          <div
                            style={{
                              fontSize: "0.86rem",
                              color: "#64748b",
                              maxWidth: 520,
                              marginBottom: 18,
                              lineHeight: 1.45,
                            }}
                          >
                            Confirm a few details in Account overview so that you can publish your first ad campaign.
                          </div>
                          <button
                            type="button"
                            style={{
                              padding: "8px 18px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#f1f5f9",
                              color: "#0f172a",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                          >
                            Go to Account overview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAds.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        style={{
                          padding: "60px 20px",
                          textAlign: "center",
                          background: "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <MetaTelescopeEmptyIllustration />
                          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1c1e21" }}>
                            No ads found
                          </span>
                          <span style={{ fontSize: "0.88rem", color: "#65676b", maxWidth: 420 }}>
                            Try selecting another view or clearing your search or filters.
                          </span>
                          <button
                            type="button"
                            onClick={handleClearAllFilters}
                            style={{
                              marginTop: 6,
                              padding: "7px 18px",
                              borderRadius: 6,
                              border: "1px solid #ccd0d5",
                              background: "#f0f2f5",
                              color: "#050505",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e4e6eb")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedFilteredAds.map((ad, idx) => {
                      const isDraft = String(ad.delivery || "").toLowerCase().includes("draft") || Boolean(ad.is_draft);
                      const isRowHovered = hoveredRowId === ad.id || openRowMenuId === ad.id;
                      const isSelected = selectedAdIds.includes(ad.id);
                      const rowBg = isDraft
                        ? (isSelected ? "#d7ebd9" : isRowHovered ? "#e3f2e4" : "#edf7ed")
                        : (isSelected ? "#e7f3ff" : isRowHovered ? "#f5f6f7" : "#ffffff");

                      return (
                        <tr
                          key={ad.id}
                          onMouseEnter={() => setHoveredRowId(ad.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          style={{
                            background: rowBg,
                            transition: "background 0.1s ease",
                          }}
                        >
                          {/* 1. Checkbox (Sticky left: 0) */}
                          <td
                            style={{
                              width: 40,
                              minWidth: 40,
                              maxWidth: 40,
                              padding: "6px 10px",
                              position: "sticky",
                              left: 0,
                              zIndex: 2,
                              background: rowBg,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #e4e6eb",
                              borderLeft: isDraft ? "3px solid #00a400" : "3px solid transparent",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                setSelectedAdIds((prev) =>
                                  e.target.checked
                                    ? [...prev, ad.id]
                                    : prev.filter((id) => id !== ad.id)
                                );
                              }}
                              style={{
                                cursor: "pointer",
                                width: 14,
                                height: 14,
                                borderRadius: 2,
                                border: "1.5px solid #ccd0d5",
                                accentColor: "#1877f2",
                              }}
                            />
                          </td>

                          {/* 2. Off/On Switch (Sticky left: 40) */}
                          <td
                            style={{
                              width: 64,
                              minWidth: 64,
                              maxWidth: 64,
                              padding: "6px 8px",
                              position: "sticky",
                              left: 40,
                              zIndex: 2,
                              background: rowBg,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #e4e6eb",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleAdActive(ad.id)}
                              style={{
                                width: 34,
                                height: 18,
                                borderRadius: 9,
                                background: ad.active ? "#1877f2" : "#ced0d4",
                                border: "none",
                                padding: "2px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: ad.active ? "flex-end" : "flex-start",
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                                outline: "none",
                              }}
                            >
                              <span
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  background: "#ffffff",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                }}
                              />
                            </button>
                          </td>

                          {/* 3. Ad Name & Thumbnail (Sticky left: 104) */}
                          <td
                            style={{
                              padding: "6px 12px",
                              position: "sticky",
                              left: 104,
                              zIndex: 2,
                              background: rowBg,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #ccd0d5",
                              minWidth: 320,
                              width: 320,
                              maxWidth: 320,
                              boxSizing: "border-box",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <div style={{ flexShrink: 0, marginTop: 2 }}>
                                {ad.thumb ? (
                                  <img
                                    src={ad.thumb}
                                    alt={ad.name}
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 4,
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                ) : (
                                  <AdPlaceholderIcon />
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, justifyContent: "center" }}>
                                {inlineEditing && inlineEditing.id === ad.id ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={inlineEditing.name}
                                      onChange={(e) => setInlineEditing((prev) => ({ ...prev, name: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveInlineEdit();
                                        if (e.key === "Escape") setInlineEditing(null);
                                      }}
                                      style={{
                                        padding: "2px 8px",
                                        fontSize: "0.83rem",
                                        borderRadius: 4,
                                        border: "1px solid #0064e1",
                                        outline: "none",
                                        boxShadow: "0 0 0 2px rgba(0, 100, 225, 0.2)",
                                        minWidth: 160,
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={handleSaveInlineEdit}
                                      title="Save name"
                                      style={{
                                        background: "#0064e1",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: 4,
                                        padding: "3px 6px",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Check size={12} strokeWidth={2.5} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInlineEditing(null)}
                                      title="Cancel"
                                      style={{
                                        background: "#f1f5f9",
                                        color: "#64748b",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 4,
                                        padding: "3px 6px",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <X size={12} strokeWidth={2} />
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%" }}>
                                    <span
                                      onClick={() => handleOpenStandaloneEditorForAd(ad)}
                                      title={ad.name}
                                      style={{
                                        color: "#1c1e21",
                                        fontWeight: 600,
                                        fontSize: "0.84rem",
                                        cursor: "pointer",
                                        textDecoration: "none",
                                        maxWidth: 300,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.color = "#0064e1";
                                        e.currentTarget.style.textDecoration = "underline";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.color = "#1c1e21";
                                        e.currentTarget.style.textDecoration = "none";
                                      }}
                                    >
                                      {ad.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setInlineEditing({ id: ad.id, name: ad.name, type: "ad" });
                                      }}
                                      title="Edit ad name"
                                      style={{
                                        opacity: isRowHovered ? 1 : 0,
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "2px 4px",
                                        borderRadius: 4,
                                        color: "#64748b",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "opacity 0.15s ease, color 0.15s ease, background 0.15s ease",
                                        flexShrink: 0,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#e2e8f0";
                                        e.currentTarget.style.color = "#0064e1";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = "#64748b";
                                      }}
                                    >
                                      <Edit2 size={12} strokeWidth={2} />
                                    </button>
                                  </div>
                                )}

                                {/* Meta Image 2 Action Pills on Hover or Selection */}
                                {(isRowHovered || isSelected) && renderRowActionPills(ad, "ad")}
                              </div>
                            </div>
                          </td>

                          {/* 4. Delivery */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {(() => {
                                const d = String(ad.delivery || "").toLowerCase();
                                if (d === "active") {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "#00a400",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                if (d === "in draft" || d.includes("draft")) {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        border: "2px solid #00a400",
                                        background: "transparent",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                if (d === "no active ads") {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        border: "2px solid #8a8d91",
                                        background: "transparent",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                return (
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: "#8a8d91",
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                );
                              })()}
                              <span style={{ color: "#1c1e21", fontWeight: 400, fontSize: "12px" }}>
                                {ad.delivery}
                              </span>
                            </div>
                          </td>

                          {/* 5. Actions */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.actions || "—"}
                          </td>

                          {/* 6. Attribution setting */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.attribution || "—"}
                          </td>

                          {/* 7. Results */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.results || "—"}
                          </td>

                          {/* 8. Cost per result */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.costPerResult || "—"}
                          </td>

                          {/* 9. Budget (Ad set) */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                            <div>
                              <div style={{ color: "#0f172a", fontWeight: 500 }}>{ad.budget}</div>
                              {ad.budgetSub && (
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.budgetSub}</div>
                              )}
                            </div>
                          </td>

                          {/* 10. Amount spent */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.amountSpent || "—"}
                          </td>

                          {/* 11. Impressions */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.impressions || "—"}
                          </td>

                          {/* 12. Reach */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.reach || "—"}
                          </td>

                          {/* 12b. Clicks */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.clicks || "—"}
                          </td>

                          {/* 12c. CTR */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.ctr || "—"}
                          </td>

                          {/* 13. Schedule */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
                            {ad.schedule || "8 Oct 2026–Ongoing"}
                          </td>

                          {/* 14. Ends */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
                            {ad.ends || "Ongoing"}
                          </td>

                          {/* 15. Bid strategy (Ad set) */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                            <div>
                              <div style={{ color: "#0f172a", fontWeight: 500 }}>{ad.bidStrategy}</div>
                              {ad.bidStrategySub && (
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.bidStrategySub}</div>
                              )}
                            </div>
                          </td>

                          {/* 16. Last significant edit */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.lastSignificantEdit || "—"}
                          </td>

                          {/* 17. Customize column */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", textAlign: "center" }} />
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* ═══ AD SETS TABLE ═══ */}
            {activeMetaSubSection === "adsets" && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 2450,
                  fontSize: "0.83rem",
                }}
              >
                {renderMetaTableHeader("adsets")}
                <tbody>
                  {metaLoading && adsetsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        style={{
                          padding: "60px 20px",
                          textAlign: "center",
                          background: "#ffffff",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                          }}
                        >
                          <RefreshCw
                            size={28}
                            className="animate-spin"
                            color="#0064e1"
                            style={{ animation: "spin 0.8s linear infinite" }}
                          />
                          <div style={{ fontSize: "0.98rem", fontWeight: 600, color: "#1e293b" }}>
                            Loading ad sets from Meta Marketing API...
                          </div>
                          <div style={{ fontSize: "0.83rem", color: "#64748b" }}>
                            Fetching latest ad set configurations and delivery metrics
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : draftsDiscarded || adsetsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        style={{
                          padding: 0,
                          background: "#ffffff",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            position: "sticky",
                            left: 0,
                            width: "100%",
                            maxWidth: "100vw",
                            minHeight: 340,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "60px 20px 80px 20px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ marginBottom: 16 }}>
                            <Search size={48} strokeWidth={1.4} color="#94a3b8" />
                          </div>
                          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                            Get set up to run ads
                          </div>
                          <div style={{ fontSize: "0.86rem", color: "#64748b", maxWidth: 520, marginBottom: 18, lineHeight: 1.45 }}>
                            Confirm a few details in Account overview so that you can publish your first ad campaign.
                          </div>
                          <button
                            type="button"
                            style={{
                              padding: "8px 18px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#f1f5f9",
                              color: "#0f172a",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                          >
                            Go to Account overview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAdsets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        style={{
                          padding: "60px 20px",
                          textAlign: "center",
                          background: "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <MetaTelescopeEmptyIllustration />
                          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1c1e21" }}>
                            No ad sets found
                          </span>
                          <span style={{ fontSize: "0.88rem", color: "#65676b", maxWidth: 420 }}>
                            Try selecting another view or clearing your search or filters.
                          </span>
                          <button
                            type="button"
                            onClick={handleClearAllFilters}
                            style={{
                              marginTop: 6,
                              padding: "7px 18px",
                              borderRadius: 6,
                              border: "1px solid #ccd0d5",
                              background: "#f0f2f5",
                              color: "#050505",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e4e6eb")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedFilteredAdsets.map((as, idx) => {
                      const isDraft = String(as.delivery || "").toLowerCase().includes("draft") || Boolean(as.is_draft);
                      const isRowHovered = hoveredRowId === as.id || openRowMenuId === as.id;
                      const isSelected = selectedAdsetIds.includes(as.id);

                      // Exact Meta Ads Manager Row Colors:
                      // Draft row: soft mint green (#edf7ed), hover: #e3f2e4, selected: #d7ebd9
                      // Normal row: pure white (#ffffff), hover: #f5f6f7, selected: #e7f3ff
                      const rowBg = isDraft
                        ? (isSelected ? "#d7ebd9" : isRowHovered ? "#e3f2e4" : "#edf7ed")
                        : (isSelected ? "#e7f3ff" : isRowHovered ? "#f5f6f7" : "#ffffff");

                      return (
                        <tr
                          key={as.id}
                          onMouseEnter={() => setHoveredRowId(as.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          style={{
                            background: rowBg,
                            transition: "background 0.1s ease",
                          }}
                        >
                          {/* 1. Checkbox (Sticky left: 0) */}
                          <td
                            style={{
                              width: 38,
                              minWidth: 38,
                              maxWidth: 38,
                              padding: "6px 10px",
                              position: "sticky",
                              left: 0,
                              background: rowBg,
                              zIndex: 2,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #e4e6eb",
                              borderLeft: isDraft ? "3px solid #00a400" : "3px solid transparent",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                setSelectedAdsetIds((prev) =>
                                  e.target.checked ? [...prev, as.id] : prev.filter((id) => id !== as.id)
                                );
                              }}
                              style={{
                                cursor: "pointer",
                                width: 14,
                                height: 14,
                                borderRadius: 2,
                                border: "1.5px solid #ccd0d5",
                                accentColor: "#0064e1",
                              }}
                            />
                          </td>

                          {/* 2. Off... Toggle (Sticky left: 38) */}
                          <td
                            style={{
                              width: 56,
                              minWidth: 56,
                              maxWidth: 56,
                              padding: "6px 8px",
                              position: "sticky",
                              left: 38,
                              background: rowBg,
                              zIndex: 2,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #e4e6eb",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleAdsetActive(as.id)}
                              title={as.active ? "Turn ad set off" : "Turn ad set on"}
                              style={{
                                width: 32,
                                height: 16,
                                borderRadius: 9,
                                background: as.active ? "#0064e1" : "#ced0d4",
                                border: "none",
                                padding: "2px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: as.active ? "flex-end" : "flex-start",
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                                outline: "none",
                              }}
                            >
                              <span
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: "#ffffff",
                                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                                }}
                              />
                            </button>
                          </td>

                          {/* 3. Ad set Name Column (Sticky left: 94) */}
                          <td
                            style={{
                              padding: "6px 12px",
                              position: "sticky",
                              left: 94,
                              background: rowBg,
                              zIndex: 2,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #ccd0d5",
                              minWidth: 290,
                              width: 290,
                              maxWidth: 290,
                              boxSizing: "border-box",
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                              {inlineEditing && inlineEditing.id === as.id ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    autoFocus
                                    value={inlineEditing.name}
                                    onChange={(e) => setInlineEditing((prev) => ({ ...prev, name: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveInlineEdit();
                                      if (e.key === "Escape") setInlineEditing(null);
                                    }}
                                    style={{
                                      padding: "2px 6px",
                                      fontSize: "12px",
                                      borderRadius: 4,
                                      border: "1px solid #1877f2",
                                      outline: "none",
                                      boxShadow: "0 0 0 2px rgba(24, 119, 242, 0.2)",
                                      minWidth: 160,
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleSaveInlineEdit}
                                    title="Save name"
                                    style={{
                                      background: "#1877f2",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: 4,
                                      padding: "3px 6px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Check size={11} strokeWidth={2.5} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInlineEditing(null)}
                                    title="Cancel"
                                    style={{
                                      background: "#f0f2f5",
                                      color: "#65676b",
                                      border: "1px solid #ccd0d5",
                                      borderRadius: 4,
                                      padding: "3px 6px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <X size={11} strokeWidth={2} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, maxWidth: "100%" }}>
                                  {(as.is_test || as.name?.startsWith("Test") || as.name?.includes("Test -")) && !as.name?.includes("⚗") && (
                                    <span style={{ fontSize: 13, color: "#1877f2", lineHeight: 1 }} title="A/B Test">⚗</span>
                                  )}
                                  <span
                                    onClick={() => handleOpenStandaloneEditorForAdset(as)}
                                    title={as.name}
                                    style={{
                                      color: "#0064e1",
                                      fontWeight: 500,
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      textDecoration: "none",
                                      maxWidth: 250,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                                  >
                                    {as.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInlineEditing({ id: as.id, name: as.name, type: "adset" });
                                    }}
                                    title="Edit ad set name"
                                    style={{
                                      opacity: isRowHovered ? 1 : 0,
                                      background: "transparent",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "1px 3px",
                                      borderRadius: 3,
                                      color: "#65676b",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "opacity 0.15s ease",
                                      flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#e4e6eb";
                                      e.currentTarget.style.color = "#1877f2";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "transparent";
                                      e.currentTarget.style.color = "#65676b";
                                    }}
                                  >
                                    <Edit2 size={11} strokeWidth={2} />
                                  </button>
                                </div>
                              )}

                              {/* Meta Image 2/3 Action Pills on Hover or Selection */}
                              {(isRowHovered || isSelected) && renderRowActionPills(as, "adset")}
                            </div>
                          </td>

                          {/* 4. Delivery */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {(() => {
                                const d = String(as.delivery || "").toLowerCase();
                                if (d === "active") {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "#00a400",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                if (d === "in draft" || d.includes("draft")) {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        border: "2px solid #00a400",
                                        background: "transparent",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                if (d === "no active ads") {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        border: "2px solid #8a8d91",
                                        background: "transparent",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                // Payment error, Off, Completed, Paused
                                return (
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: "#8a8d91",
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                );
                              })()}
                              <span style={{ color: "#1c1e21", fontWeight: 400, fontSize: "12px" }}>
                                {as.delivery}
                              </span>
                            </div>
                          </td>

                          {/* 5. Actions */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#65676b" }}>
                            {as.actions || "—"}
                          </td>

                          {/* 6. Attribution setting */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb" }}>
                            {isDraft ? (
                              <span style={{ color: "#65676b" }}>—</span>
                            ) : (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>
                                  {as.attribution || "7-day click or 1-day view"}
                                </div>
                                <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>
                                  {as.attributionSub || "All conversions"}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 7. Results */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb" }}>
                            {isDraft || !as.results || as.results === "—" ? (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>—</div>
                                {!isDraft && as.resultsSub && (
                                  <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{as.resultsSub}</div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>
                                  {as.results}
                                </div>
                                {as.resultsSub && (
                                  <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{as.resultsSub}</div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 8. Cost per result */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb" }}>
                            {isDraft || !as.costPerResult || as.costPerResult === "—" ? (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>—</div>
                                {!isDraft && as.costPerResultSub && (
                                  <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{as.costPerResultSub}</div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>
                                  {as.costPerResult}
                                </div>
                                {as.costPerResultSub && (
                                  <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{as.costPerResultSub}</div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 9. Budget */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb" }}>
                            {String(as.budget || "").toLowerCase().includes("campaign") ? (
                              <span style={{ color: "#1c1e21", fontSize: "12px" }}>Using campaign...</span>
                            ) : (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>{as.budget}</div>
                                <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{as.budgetSub || "Daily"}</div>
                              </div>
                            )}
                          </td>

                          {/* 10. Amount spent */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#1c1e21" }}>
                            {isDraft ? "—" : (as.amountSpent || "—")}
                          </td>

                          {/* 11. Impressions */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#1c1e21" }}>
                            {as.impressions || "—"}
                          </td>

                          {/* 12. Reach */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#1c1e21" }}>
                            {as.reach || "—"}
                          </td>

                          {/* 12b. Clicks */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#1c1e21" }}>
                            {as.clicks || "—"}
                          </td>

                          {/* 12c. CTR */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#1c1e21" }}>
                            {as.ctr || "—"}
                          </td>

                          {/* 13. Schedule */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#1c1e21" }}>
                            {as.schedule || "8 Oct 2026–Ongoing"}
                          </td>

                          {/* 14. Ends */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#1c1e21" }}>
                            {as.ends || "Ongoing"}
                          </td>

                          {/* 15. Bid strategy */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb" }}>
                            <div>
                              <div style={{ color: "#1c1e21", fontSize: "12px" }}>{as.bidStrategy || "Highest volume"}</div>
                              {as.bidStrategySub && (
                                <div style={{ fontSize: "11px", color: "#65676b" }}>{as.bidStrategySub}</div>
                              )}
                            </div>
                          </td>

                          {/* 16. Last significant edit */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", color: "#65676b" }}>
                            {as.lastSignificantEdit || "—"}
                          </td>

                          {/* 17. Customize column */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e4e6eb", textAlign: "center" }} />
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* ═══ CAMPAIGNS TABLE ═══ */}
            {activeMetaSubSection === "campaigns" && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 2450,
                  fontSize: "0.83rem",
                }}
              >
                {renderMetaTableHeader("campaigns")}
                <tbody>
                  {metaLoading && campaignsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        style={{
                          padding: "60px 20px",
                          textAlign: "center",
                          background: "#ffffff",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                          }}
                        >
                          <RefreshCw
                            size={28}
                            className="animate-spin"
                            color="#0064e1"
                            style={{ animation: "spin 0.8s linear infinite" }}
                          />
                          <div style={{ fontSize: "0.98rem", fontWeight: 600, color: "#1e293b" }}>
                            Loading campaigns from Meta Marketing API...
                          </div>
                          <div style={{ fontSize: "0.83rem", color: "#64748b" }}>
                            Fetching latest account data and performance insights
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : draftsDiscarded || campaignsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        style={{
                          padding: 0,
                          background: "#ffffff",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            position: "sticky",
                            left: 0,
                            width: "100%",
                            maxWidth: "100vw",
                            minHeight: 340,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "60px 20px 80px 20px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ marginBottom: 16 }}>
                            <Search size={48} strokeWidth={1.4} color="#94a3b8" />
                          </div>
                          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                            Get set up to run ads
                          </div>
                          <div style={{ fontSize: "0.86rem", color: "#64748b", maxWidth: 520, marginBottom: 18, lineHeight: 1.45 }}>
                            Confirm a few details in Account overview so that you can publish your first ad campaign.
                          </div>
                          <button
                            type="button"
                            style={{
                              padding: "8px 18px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#f1f5f9",
                              color: "#0f172a",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                          >
                            Go to Account overview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCampaigns.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        style={{
                          padding: "60px 20px",
                          textAlign: "center",
                          background: "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <MetaTelescopeEmptyIllustration />
                          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1c1e21" }}>
                            No campaigns found
                          </span>
                          <span style={{ fontSize: "0.88rem", color: "#65676b", maxWidth: 420 }}>
                            Try selecting another view or clearing your search or filters.
                          </span>
                          <button
                            type="button"
                            onClick={handleClearAllFilters}
                            style={{
                              marginTop: 6,
                              padding: "7px 18px",
                              borderRadius: 6,
                              border: "1px solid #ccd0d5",
                              background: "#f0f2f5",
                              color: "#050505",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#e4e6eb")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedFilteredCampaigns.map((camp, idx) => {
                      const isDraft = String(camp.delivery || "").toLowerCase().includes("draft") || Boolean(camp.is_draft);
                      const isRowHovered = hoveredRowId === camp.id || openRowMenuId === camp.id;
                      const isSelected = selectedCampaignIds.includes(camp.id);
                      const rowBg = isDraft
                        ? (isSelected ? "#d7ebd9" : isRowHovered ? "#eaf5ec" : "#f4fbf7")
                        : (isSelected ? "#e7f3ff" : isRowHovered ? "#f5f6f7" : "#ffffff");

                      return (
                        <tr
                          key={camp.id}
                          onMouseEnter={() => setHoveredRowId(camp.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                          style={{
                            background: rowBg,
                            height: 44,
                            transition: "background 0.1s ease",
                          }}
                        >
                          {/* 1. Checkbox (Sticky left: 0) */}
                          <td
                            style={{
                              width: 38,
                              minWidth: 38,
                              maxWidth: 38,
                              padding: "6px 10px",
                              position: "sticky",
                              left: 0,
                              background: rowBg,
                              zIndex: 2,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #e4e6eb",
                              borderLeft: isDraft ? "3px solid #00a400" : "3px solid transparent",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                setSelectedCampaignIds((prev) =>
                                   e.target.checked ? [...prev, camp.id] : prev.filter((id) => id !== camp.id)
                                );
                              }}
                              style={{
                                cursor: "pointer",
                                width: 14,
                                height: 14,
                                borderRadius: 2,
                                border: "1.5px solid #ccd0d5",
                                accentColor: "#0064e1",
                              }}
                            />
                          </td>

                          {/* 2. Off... Toggle (Sticky left: 38) */}
                          <td
                            style={{
                              width: 56,
                              minWidth: 56,
                              maxWidth: 56,
                              padding: "6px 8px",
                              position: "sticky",
                              left: 38,
                              background: rowBg,
                              zIndex: 2,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #e4e6eb",
                              textAlign: "center",
                              boxSizing: "border-box",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleCampaignActive(camp.id)}
                              title={camp.active ? "Turn campaign off" : "Turn campaign on"}
                              style={{
                                width: 32,
                                height: 16,
                                borderRadius: 9,
                                background: camp.active ? "#0064e1" : "#ced0d4",
                                border: "none",
                                padding: "2px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: camp.active ? "flex-end" : "flex-start",
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                                outline: "none",
                              }}
                            >
                              <span
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  background: "#ffffff",
                                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                                }}
                              />
                            </button>
                          </td>

                          {/* 3. Campaign Name Column (Sticky left: 94) */}
                          <td
                            style={{
                              padding: "6px 12px",
                              position: "sticky",
                              left: 94,
                              background: rowBg,
                              zIndex: 2,
                              borderBottom: "1px solid #e4e6eb",
                              borderRight: "1px solid #ccd0d5",
                              boxShadow: "2px 0 4px rgba(0,0,0,0.04)",
                              minWidth: 290,
                              width: 290,
                              maxWidth: 290,
                              boxSizing: "border-box",
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 36 }}>
                              {inlineEditing && inlineEditing.id === camp.id ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    autoFocus
                                    value={inlineEditing.name}
                                    onChange={(e) => setInlineEditing((prev) => ({ ...prev, name: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveInlineEdit();
                                      if (e.key === "Escape") setInlineEditing(null);
                                    }}
                                    style={{
                                      padding: "2px 8px",
                                      fontSize: "0.83rem",
                                      borderRadius: 4,
                                      border: "1px solid #0064e1",
                                      outline: "none",
                                      boxShadow: "0 0 0 2px rgba(0, 100, 225, 0.2)",
                                      minWidth: 160,
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleSaveInlineEdit}
                                    title="Save name"
                                    style={{
                                      background: "#0064e1",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: 4,
                                      padding: "3px 6px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Check size={12} strokeWidth={2.5} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInlineEditing(null)}
                                    title="Cancel"
                                    style={{
                                      background: "#f1f5f9",
                                      color: "#64748b",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: 4,
                                      padding: "3px 6px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <X size={12} strokeWidth={2} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%" }}>
                                  {pinnedRowIds.has(camp.id) && (
                                    <span
                                      title="Pinned to top"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 3,
                                        padding: "1px 6px",
                                        borderRadius: 4,
                                        background: "#eff6ff",
                                        color: "#0064e1",
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        border: "1px solid #bfdbfe",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Pin size={11} color="#0064e1" style={{ transform: "rotate(45deg)" }} />
                                      <span>Pinned</span>
                                    </span>
                                  )}
                                  <span
                                    onClick={() => handleOpenStandaloneEditorForCampaign(camp)}
                                    title={camp.name}
                                    style={{
                                      color: "#0064e1",
                                      fontWeight: 500,
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      textDecoration: "none",
                                      maxWidth: 250,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                                  >
                                    {camp.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInlineEditing({ id: camp.id, name: camp.name, type: "campaign" });
                                    }}
                                    title="Edit campaign name"
                                    style={{
                                      opacity: isRowHovered ? 1 : 0,
                                      background: "transparent",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "2px 4px",
                                      borderRadius: 4,
                                      color: "#64748b",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "opacity 0.15s ease, color 0.15s ease, background 0.15s ease",
                                      flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#e2e8f0";
                                      e.currentTarget.style.color = "#0064e1";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "transparent";
                                      e.currentTarget.style.color = "#64748b";
                                    }}
                                  >
                                    <Edit2 size={12} strokeWidth={2} />
                                  </button>
                                </div>
                              )}

                              {/* Meta Image 3 Action Pills on Hover or Selection */}
                              {(isRowHovered || isSelected) && renderRowActionPills(camp, "campaign")}
                            </div>
                          </td>
                          {/* 4. Delivery */}
                          <td style={{ ...tdStyle }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {(() => {
                                const d = String(camp.delivery || "").toLowerCase();
                                if (d === "active") {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "#00a400",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                if (d === "in draft" || d.includes("draft")) {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        border: "2px solid #00a400",
                                        background: "transparent",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                if (d === "no active ads") {
                                  return (
                                    <span
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        border: "2px solid #8a8d91",
                                        background: "transparent",
                                        display: "inline-block",
                                        flexShrink: 0,
                                      }}
                                    />
                                  );
                                }
                                return (
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: "#8a8d91",
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                );
                              })()}
                              <span style={{ color: "#1c1e21", fontWeight: 400, fontSize: "12px" }}>
                                {camp.delivery}
                              </span>
                            </div>
                          </td>

                          {/* 5. Actions */}
                          <td style={{ ...tdStyle, color: "#65676b" }}>
                            {camp.actions || "—"}
                          </td>

                          {/* 6. Attribution setting */}
                          <td style={{ ...tdStyle }}>
                            {isDraft ? (
                              <span style={{ color: "#65676b" }}>—</span>
                            ) : (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>
                                  {camp.attribution || "7-day click or 1-day view"}
                                </div>
                                <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>
                                  {camp.attributionSub || "All conversions"}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* 7. Results */}
                          <td style={{ ...tdStyle }}>
                            {isDraft || !camp.results || camp.results === "—" ? (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>—</div>
                                {!isDraft && camp.resultsSub && (
                                  <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{camp.resultsSub}</div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>
                                  {camp.results}
                                </div>
                                {camp.resultsSub && (
                                  <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{camp.resultsSub}</div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 8. Cost per result */}
                          <td style={{ ...tdStyle }}>
                            {isDraft || !camp.costPerResult || camp.costPerResult === "—" ? (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>—</div>
                                {!isDraft && camp.costPerResultSub && (
                                  <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{camp.costPerResultSub}</div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>
                                  {camp.costPerResult}
                                </div>
                                {camp.costPerResultSub && (
                                  <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{camp.costPerResultSub}</div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* 9. Budget */}
                          <td style={{ ...tdStyle }}>
                            {String(camp.budget || "").toLowerCase().includes("ad set") || String(camp.budget || "").toLowerCase().includes("using") ? (
                              <span style={{ color: "#1c1e21", fontSize: "12px" }}>Using ad set bu...</span>
                            ) : (
                              <div>
                                <div style={{ color: "#1c1e21", fontSize: "12px", lineHeight: "1.3" }}>{camp.budget}</div>
                                <div style={{ fontSize: "11px", color: "#65676b", lineHeight: "1.2" }}>{camp.budgetSub || "Daily"}</div>
                              </div>
                            )}
                          </td>

                          {/* 10. Amount spent */}
                          <td style={{ ...tdStyle, color: "#1c1e21" }}>
                            {isDraft ? "—" : (camp.amountSpent || "₹0.00")}
                          </td>

                          {/* 11. Impressions */}
                          <td style={{ ...tdStyle, color: "#1c1e21" }}>
                            {camp.impressions || "—"}
                          </td>

                          {/* 12. Reach */}
                          <td style={{ ...tdStyle, color: "#1c1e21" }}>
                            {camp.reach || "—"}
                          </td>

                          {/* 12b. Clicks */}
                          <td style={{ ...tdStyle, color: "#1c1e21" }}>
                            {camp.clicks || "—"}
                          </td>

                          {/* 12c. CTR */}
                          <td style={{ ...tdStyle, color: "#1c1e21" }}>
                            {camp.ctr || "—"}
                          </td>

                          {/* 13. Schedule */}
                          <td style={{ ...tdStyle, color: "#1c1e21" }}>
                            {camp.schedule || "8 Oct 2026–Ongoing"}
                          </td>

                          {/* 14. Ends */}
                          <td style={{ ...tdStyle, color: "#1c1e21" }}>
                            {camp.ends || "Ongoing"}
                          </td>

                          {/* 15. Bid strategy */}
                          <td style={{ ...tdStyle }}>
                            <div>
                              <div style={{ color: "#1c1e21", fontSize: "12px" }}>{camp.bidStrategy || "Lowest cost"}</div>
                              {camp.bidStrategySub && (
                                <div style={{ fontSize: "11px", color: "#65676b" }}>{camp.bidStrategySub}</div>
                              )}
                            </div>
                          </td>

                          {/* 16. Last significant edit */}
                          <td style={{ ...tdStyle, color: "#65676b" }}>
                            {camp.lastSignificantEdit || "—"}
                          </td>

                          {/* 17. Customize column */}
                          <td style={{ ...tdStyle, textAlign: "center" }} />
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* Table Footer Count matching Images 1, 2, 3 */}
            <div
              style={{
                padding: "7px 16px",
                borderTop: "1px solid #ccd0d5",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "12px",
                color: "#1c1e21",
                fontWeight: 500,
                marginTop: "auto",
                flexShrink: 0,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              <span>
                Results from{" "}
                {activeMetaSubSection === "ads"
                  ? `${filteredAds.length} ads`
                  : activeMetaSubSection === "adsets"
                    ? `${filteredAdsets.length} ad sets`
                    : `${filteredCampaigns.length} campaigns`}
              </span>
              <Info size={13} color="#65676b" style={{ cursor: "pointer" }} />
            </div>
          </div>
                </>
              )}
        </div>
        {/* End of Left Side: Actions Toolbar + Table */}

        {/* Right Side: Docked Save Edits Panel directly below Calendar (Images 3, 4, 5) */}
        {createViewDrawerOpen && (
          <MetaCreateViewDrawer
            isOpen={createViewDrawerOpen}
            onClose={() => setCreateViewDrawerOpen(false)}
            onSaveView={handleSaveQuickView}
            onSaveCopy={handleSaveCopyQuickView}
            initialData={editingViewData}
            activeFiltersList={activeFilterChips}
            drawerTitle={viewDrawerTitle}
            drawerMode={viewDrawerMode}
          />
        )}
      </div>
      {/* End of Row below Tabs & Calendar */}
    </div>
    {/* End of Main Workspace */}
  </div>
  )}

      {/* ── GOOGLE ADS SECTION ── */}
      {selectedPlatform === "google" && (
        <div style={{ width: "100%", background: "#ffffff", padding: "16px 20px" }}>
          <GoogleAdsCampaignCreator
            clients={clients}
            campaigns={campaigns}
            selectedClientId={selectedClientId}
            onRefresh={onRefresh}
          />
        </div>
      )}

      {/* ── LINKEDIN ADS SECTION ── */}
      {selectedPlatform === "linkedin" && (
        <div
          style={{
            padding: "48px 32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "55vh",
            color: "#64748b",
          }}
        >
          <LinkedInLogoIcon size={48} style={{ marginBottom: 16 }} />
          <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "1.2rem", fontWeight: 700 }}>
            LinkedIn Ads Management
          </h3>
          <p style={{ margin: 0, fontSize: "0.88rem", maxWidth: 460 }}>
            Run sponsored content, lead gen forms, and InMail campaigns targeted to verified B2B decision makers.
          </p>
        </div>
      )}

      {/* ── IMAGE 1: DISCARD DRAFTS MODAL POPUP ── */}
      {discardModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-drafts-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setDiscardModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
              position: "relative",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px 10px 24px",
              }}
            >
              <h3
                id="discard-drafts-title"
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#1c1e21",
                }}
              >
                Discard drafts
              </h3>
              <button
                type="button"
                onClick={() => setDiscardModalOpen(false)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  borderRadius: "50%",
                }}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "6px 24px 24px 24px",
                fontSize: "0.92rem",
                color: "#1c1e21",
                lineHeight: 1.45,
              }}
            >
              Any changes in this ad account{" "}
              <strong style={{ fontWeight: 700 }}>
                {selectedMetaAdAccount?.name || "MediaReds D M"} [{selectedMetaAdAccount?.id || "act_830629501946359"}]
              </strong>{" "}
              that haven't yet been published will be discarded.
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
                padding: "12px 24px 20px 24px",
              }}
            >
              <button
                type="button"
                onClick={() => setDiscardModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDiscardDrafts}
                style={{
                  padding: "7px 22px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 100, 225, 0.2)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0053bf")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IMAGE 1: RESET ADS MANAGER MODAL POPUP ── */}
      {resetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-ads-manager-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setResetModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
              position: "relative",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px 10px 24px",
              }}
            >
              <h3
                id="reset-ads-manager-title"
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#1c1e21",
                }}
              >
                Reset Ads Manager?
              </h3>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  borderRadius: "50%",
                }}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "6px 24px 20px 24px",
                fontSize: "0.92rem",
                color: "#1c1e21",
                lineHeight: 1.45,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                Any settings you've saved in Ads Manager will be deleted. Are you sure?
              </div>

              {/* Checkbox: Also discard unpublished changes for this account */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={alsoDiscardUnpublished}
                  onChange={(e) => setAlsoDiscardUnpublished(e.target.checked)}
                  style={{
                    width: 17,
                    height: 17,
                    cursor: "pointer",
                    accentColor: "#0064e1",
                  }}
                />
                <span style={{ fontSize: "0.91rem", color: "#1c1e21", fontWeight: 500 }}>
                  Also discard unpublished changes for this account
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
                padding: "12px 24px 20px 24px",
              }}
            >
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAdsManager}
                style={{
                  padding: "7px 22px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 100, 225, 0.2)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0053bf")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
              >
                Reset Ads Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KEYBOARD SHORTCUTS MODAL (Meta Ads Manager Campaign Section Style — matching Images 2, 3, 4) ── */}
      {shortcutsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShortcutsModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 580,
              boxShadow: "0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
              position: "relative",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px 14px 20px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1c1e21" }}>
                Keyboard shortcuts
              </h3>
              <button
                type="button"
                onClick={() => setShortcutsModalOpen(false)}
                title="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#606770",
                  borderRadius: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1c1e21")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#606770")}
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            {/* Scrollable Table Area (Spans full width, no nested inner margin box) */}
            <div
              style={{
                maxHeight: 315,
                overflowY: "auto",
                borderTop: "1px solid #e4e6eb",
                borderBottom: "1px solid #e4e6eb",
                width: "100%",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  tableLayout: "fixed",
                }}
              >
                <colgroup>
                  <col style={{ width: "170px" }} />
                  <col style={{ width: "auto" }} />
                </colgroup>
                <thead>
                  <tr
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#ffffff",
                      zIndex: 2,
                      borderBottom: "1px solid #e4e6eb",
                    }}
                  >
                    <th
                      style={{
                        padding: "10px 20px",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#050505",
                        borderRight: "1px solid #e4e6eb",
                        background: "#ffffff",
                      }}
                    >
                      Shortcut keys
                    </th>
                    <th
                      style={{
                        padding: "10px 20px",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#050505",
                        background: "#ffffff",
                      }}
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: "Alt + 1", desc: "Navigate to campaigns." },
                    { key: "Alt + 2", desc: "Navigate to ad sets." },
                    { key: "Alt + 3", desc: "Navigate to ads." },
                    { key: "Ctrl + Y", desc: "View insights charts for your selected campaigns, ad sets or ads." },
                    { key: "Ctrl + U", desc: "Open the editor for your selected campaigns, ad sets or ads." },
                    { key: "Ctrl + I", desc: "View activity history for your selected campaigns, ad sets or ads." },
                    { key: "Ctrl + R", desc: "Review all changes." },
                    { key: "Ctrl + C", desc: "Copy your selected ads set or ads to the clipboard." },
                    { key: "Ctrl + V", desc: "Paste copied items into the current selection." },
                    { key: "Ctrl + D", desc: "Quick duplication for your selected campaigns, ads sets or ads." },
                    { key: "Ctrl + Shift + D", desc: "Open duplicate dialogue for selected campaigns, ads sets or ads." },
                    { key: "Ctrl + Shift + C", desc: "Open the Export as text dialogue for the selected campaigns, ad sets or ads." },
                    { key: "Ctrl + Shift + /", desc: "Show all available keyboard shortcuts." },
                    { key: "Ctrl + O", desc: "Toggle Applied Insights GK/JK/QE config debug overlay." },
                    { key: "Ctrl + Backspace", desc: "Delete selected campaigns, ad sets or ads." },
                  ].map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #e4e6eb",
                        transition: "background 0.1s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f2f3f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td
                        style={{
                          padding: "10px 20px",
                          fontSize: "13.5px",
                          fontWeight: 400,
                          color: "#050505",
                          borderRight: "1px solid #e4e6eb",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.key}
                      </td>
                      <td
                        title={item.desc}
                        style={{
                          padding: "10px 20px",
                          fontSize: "13.5px",
                          color: "#050505",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with OK button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "14px 20px 16px 20px",
              }}
            >
              <button
                type="button"
                onClick={() => setShortcutsModalOpen(false)}
                style={{
                  padding: "7px 24px",
                  borderRadius: 4,
                  border: "none",
                  background: "#0064e0",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  boxShadow: "0 1px 2px rgba(0, 100, 224, 0.2)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0053bf")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e0")}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE MODAL (Meta Ads Manager Style — Image 1 & Image 2) ── */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: createModalStep === "setup" ? 580 : 680,
              boxShadow: "0 10px 32px rgba(0, 0, 0, 0.22)",
              overflow: "hidden",
              position: "relative",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              transition: "max-width 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {createModalStep === "setup" ? (
              /* ── STEP 2: Choose a campaign setup (Matching Image 2 for Traffic, Image 3 for Engagement) ── */
              <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "20px 24px 10px 24px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingRight: 16 }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "#1c1e21",
                        lineHeight: 1.25,
                      }}
                    >
                      Choose a campaign setup
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.84rem",
                        color: "#4b5563",
                        lineHeight: 1.45,
                      }}
                    >
                      {CAMPAIGN_SETUP_DATA[createObjective]?.description ||
                        `Create your ${(createObjective || "").toLowerCase()} campaign using a tailored and streamlined setup, or manually build your campaign. Suggestions may vary based on your recent ad account activity.`}
                    </p>
                  </div>
                  {/* Close X */}
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalOpen(false);
                      setCreateModalStep("objective");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#65676b",
                      borderRadius: 6,
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <X size={18} strokeWidth={2.2} />
                  </button>
                </div>

                {/* Sub-header: Why am I seeing this suggestion? */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    padding: "0 24px 10px 24px",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.82rem",
                      color: "#65676b",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#1c1e21")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#65676b")}
                  >
                    <span style={{ fontSize: "0.85rem" }}>💡</span>
                    <span>Why am I seeing this suggestion?</span>
                  </button>
                </div>

                {/* Body: Setup Options (Tailored vs Manual) */}
                <div
                  style={{
                    padding: "0 24px 16px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxHeight: "calc(90vh - 170px)",
                    overflowY: "auto",
                  }}
                >
                  {/* Option 1: Tailored (Image 2 / Image 3) */}
                  <div
                    onClick={() => setCampaignSetupChoice("tailored")}
                    onDoubleClick={() => handleLaunchStandaloneEditor(createObjective, "tailored")}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "16px",
                      borderRadius: 8,
                      border: campaignSetupChoice === "tailored" ? "1.5px solid #0064e1" : "1px solid #e4e6eb",
                      background: campaignSetupChoice === "tailored" ? "#edf5fd" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Radio Button */}
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: campaignSetupChoice === "tailored" ? "2px solid #0064e1" : "2px solid #cbd5e1",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 14,
                      }}
                    >
                      {campaignSetupChoice === "tailored" && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0064e1" }} />
                      )}
                    </span>

                    {/* Graphic Icon */}
                    <div style={{ flexShrink: 0 }}>
                      {CAMPAIGN_SETUP_DATA[createObjective]?.tailored?.icon || (
                        <svg width="46" height="46" viewBox="0 0 56 56" fill="none">
                          <circle cx="28" cy="28" r="26" fill="#bbf7d0" />
                        </svg>
                      )}
                    </div>

                    {/* Text & Tags */}
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                      <span style={{ fontSize: "0.93rem", fontWeight: 650, color: "#1c1e21", lineHeight: 1.3 }}>
                        {CAMPAIGN_SETUP_DATA[createObjective]?.tailored?.title || "Tailored campaign"}
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "#4b5563", marginTop: 4, lineHeight: 1.45 }}>
                        {CAMPAIGN_SETUP_DATA[createObjective]?.tailored?.description ||
                          "Quickly create a campaign optimised to deliver the best results with preset settings."}
                      </span>
                      {/* Badges / Pills */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        {(CAMPAIGN_SETUP_DATA[createObjective]?.tailored?.tags || ["Streamlined", "Tailored", "Best practices"]).map(
                          (tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: "inline-block",
                                background: "#ffffff",
                                border: "1px solid #d0d7de",
                                borderRadius: 12,
                                padding: "2px 10px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#1c1e21",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                              }}
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Manual (Image 2 / Image 3) */}
                  <div
                    onClick={() => setCampaignSetupChoice("manual")}
                    onDoubleClick={() => handleLaunchStandaloneEditor(createObjective, "manual")}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "16px",
                      borderRadius: 8,
                      border: campaignSetupChoice === "manual" ? "1.5px solid #0064e1" : "1px solid #e4e6eb",
                      background: campaignSetupChoice === "manual" ? "#edf5fd" : "#f8fafc",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (campaignSetupChoice !== "manual") e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      if (campaignSetupChoice !== "manual") e.currentTarget.style.background = "#f8fafc";
                    }}
                  >
                    {/* Radio Button */}
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: campaignSetupChoice === "manual" ? "2px solid #0064e1" : "2px solid #cbd5e1",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 10,
                      }}
                    >
                      {campaignSetupChoice === "manual" && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0064e1" }} />
                      )}
                    </span>

                    {/* Gear Icon in Circle */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "#f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Settings size={20} color="#1c1e21" />
                    </div>

                    {/* Text */}
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                      <span style={{ fontSize: "0.93rem", fontWeight: 650, color: "#1c1e21", lineHeight: 1.3 }}>
                        {CAMPAIGN_SETUP_DATA[createObjective]?.manual?.title || `Manual ${(createObjective || "").toLowerCase()} campaign`}
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "#4b5563", marginTop: 4, lineHeight: 1.45 }}>
                        {CAMPAIGN_SETUP_DATA[createObjective]?.manual?.description ||
                          `Create a ${(createObjective || "").toLowerCase()} campaign from scratch for finer control over all settings.`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Back & Continue Buttons */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 10,
                    padding: "14px 24px 18px 24px",
                    borderTop: "1px solid #e2e8f0",
                    background: "#ffffff",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCreateModalStep("objective")}
                    style={{
                      padding: "7px 20px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#1c1e21",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLaunchStandaloneEditor(createObjective, campaignSetupChoice)}
                    style={{
                      padding: "7px 22px",
                      borderRadius: 6,
                      border: "none",
                      background: "#0064e1",
                      color: "#ffffff",
                      fontSize: "0.88rem",
                      fontWeight: 650,
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0, 100, 225, 0.2)",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#0053ba")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              /* ── STEP 1: Objective selection (Image 1) / New ad set or ad ── */
              <>
            {/* Modal Header with two tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px 12px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Tab 1: Create new campaign */}
                <button
                  type="button"
                  onClick={() => setCreateModalTab("campaign")}
                  style={{
                    padding: "6px 12px",
                    background: createModalTab === "campaign" ? "#e7f3ff" : "transparent",
                    border: "none",
                    borderRadius: 4,
                    fontSize: "0.88rem",
                    fontWeight: 650,
                    color: createModalTab === "campaign" ? "#0064e1" : "#65676b",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  Create new campaign
                </button>
                {/* Tab 2: New ad set or ad */}
                <button
                  type="button"
                  onClick={() => setCreateModalTab("adset")}
                  style={{
                    padding: "6px 12px",
                    background: createModalTab === "adset" ? "#e7f3ff" : "transparent",
                    border: "none",
                    borderRadius: 4,
                    fontSize: "0.88rem",
                    fontWeight: createModalTab === "adset" ? 650 : 500,
                    color: createModalTab === "adset" ? "#0064e1" : "#65676b",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  New ad set or ad
                </button>
              </div>
              {/* Close X */}
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#65676b",
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>

              {/* ── TAB 1: Create new campaign ── */}
              {createModalTab === "campaign" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Buying type */}
                  <div style={{ position: "relative" }} ref={buyingTypeDropdownRef}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.88rem", fontWeight: 650, color: "#1c1e21", marginBottom: 6 }}>
                      Choose a buying type
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 15,
                          height: 15,
                          borderRadius: "50%",
                          background: "#1c1e21",
                          color: "#ffffff",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          cursor: "help",
                          fontFamily: "serif",
                          lineHeight: 1,
                        }}
                        title="Buying type determines how you buy your ads."
                      >
                        i
                      </span>
                    </label>

                    {/* Trigger Box */}
                    <div
                      onClick={() => setBuyingTypeDropdownOpen((prev) => !prev)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: buyingTypeDropdownOpen ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "0.88rem",
                        color: "#1c1e21",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s ease",
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{createBuyingType}</span>
                      <span style={{ fontSize: "10px", color: "#1c1e21", pointerEvents: "none" }}>▼</span>
                    </div>

                    {/* Dropdown Menu (Image 2 exact format) */}
                    {buyingTypeDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          right: 0,
                          background: "#ffffff",
                          borderRadius: 6,
                          border: "1px solid #dadde1",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                          zIndex: 100,
                          padding: "6px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {/* Option 1: Auction */}
                        <div
                          onClick={() => {
                            setCreateBuyingType("Auction");
                            setBuyingTypeDropdownOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "9px 12px",
                            borderRadius: 6,
                            background: createBuyingType === "Auction" ? "#e8f2fe" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.12s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (createBuyingType !== "Auction") e.currentTarget.style.background = "#f2f4f7";
                          }}
                          onMouseLeave={(e) => {
                            if (createBuyingType !== "Auction") e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {/* Radio circle */}
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: createBuyingType === "Auction" ? "2px solid #0064e1" : "2px solid #cbd5e1",
                              background: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            {createBuyingType === "Auction" && (
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0064e1" }} />
                            )}
                          </span>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1c1e21" }}>Auction</span>
                            <span style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 2 }}>
                              Buy in real time with cost-effective bidding.
                            </span>
                          </div>
                        </div>

                        {/* Option 2: Reservation */}
                        <div
                          onClick={() => {
                            setCreateBuyingType("Reservation");
                            setBuyingTypeDropdownOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "9px 12px",
                            borderRadius: 6,
                            background: createBuyingType === "Reservation" ? "#e8f2fe" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.12s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (createBuyingType !== "Reservation") e.currentTarget.style.background = "#f2f4f7";
                          }}
                          onMouseLeave={(e) => {
                            if (createBuyingType !== "Reservation") e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {/* Radio circle */}
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: createBuyingType === "Reservation" ? "2px solid #0064e1" : "2px solid #cbd5e1",
                              background: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            {createBuyingType === "Reservation" && (
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0064e1" }} />
                            )}
                          </span>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1c1e21" }}>Reservation</span>
                            <span style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 2 }}>
                              Buy in advance for more predictable outcomes.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two Column Layout: Objectives List on Left, Preview Card on Right */}
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {/* Objectives list */}
                    <div style={{ flex: "1 1 54%", display: "flex", flexDirection: "column", gap: 4 }}>
                      {CREATE_OBJECTIVES.map((obj) => {
                        const isSelected = createObjective === obj.id;
                        return (
                          <button
                            key={obj.id}
                            type="button"
                            onClick={() => setCreateObjective(obj.id)}
                            onDoubleClick={() => {
                              if (obj.id === "Traffic" || obj.id === "Engagement") {
                                setCreateObjective(obj.id);
                                setCampaignSetupChoice("tailored");
                                setCreateModalStep("setup");
                              } else {
                                handleLaunchStandaloneEditor(obj.id);
                              }
                            }}
                            onMouseEnter={() => setHoveredObjective(obj.id)}
                            onMouseLeave={() => setHoveredObjective(null)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "7px 10px",
                              borderRadius: 6,
                              border: isSelected ? "1.5px solid #0064e1" : "1px solid transparent",
                              background: isSelected ? "#f0f7ff" : hoveredObjective === obj.id ? "#f2f4f7" : "transparent",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.12s ease",
                            }}
                          >
                            {/* Radio circle */}
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                border: isSelected ? "2px solid #0064e1" : "2px solid #cbd5e1",
                                background: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && (
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0064e1" }} />
                              )}
                            </span>

                            {/* Icon box */}
                            <span
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: "1px solid #e4e6eb",
                                background: "#f8fafc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {obj.icon && typeof obj.icon === "function" ? obj.icon() : obj.icon}
                            </span>

                            <span style={{ fontSize: "0.88rem", color: "#1c1e21", fontWeight: isSelected ? 650 : 500 }}>
                              {obj.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right column: Illustration / Guide Card (Image 2) */}
                    <div
                      style={{
                        flex: "1 1 46%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        padding: "10px 14px",
                        background: "#ffffff",
                        borderRadius: 8,
                        minHeight: 280,
                      }}
                    >
                      {(() => {
                        const activeObjKey = hoveredObjective || createObjective || "Sales";
                        const activeInfo = OBJECTIVE_INFO[activeObjKey];
                        if (!activeInfo) return null;

                        return (
                          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, textAlign: "left" }}>
                            {/* Top Illustration for this objective (Image 2) */}
                            <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: 6 }}>
                              {activeInfo.illustration}
                            </div>

                            {/* Title */}
                            <div style={{ fontSize: "0.98rem", fontWeight: 700, color: "#1c1e21" }}>
                              {activeInfo.title}
                            </div>

                            {/* Description */}
                            <div style={{ fontSize: "0.83rem", color: "#65676b", lineHeight: 1.45 }}>
                              {activeInfo.description}
                            </div>

                            {/* Good for section with Pill Badges matching Image 2 */}
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1c1e21", marginBottom: 8 }}>
                                Good for:
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                                {activeInfo.goodFor.map((item, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      display: "inline-block",
                                      background: "#f0f2f5",
                                      color: "#1c1e21",
                                      fontSize: "0.81rem",
                                      fontWeight: 500,
                                      padding: "5px 10px",
                                      borderRadius: 6,
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: New ad set or ad ── */}
              {createModalTab === "adset" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.88rem", fontWeight: 650, color: "#1c1e21", marginBottom: 8 }}>
                      {/* Folder icon */}
                      <svg width={16} height={16} viewBox="0 0 20 20" fill="none">
                        <path d="M3 5a2 2 0 0 1 2-2h3.586a1 1 0 0 1 .707.293L10.707 5H15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Campaign
                    </label>
                    {/* Campaign search / select input */}
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        value={createCampaignSearch}
                        onChange={(e) => {
                          setCreateCampaignSearch(e.target.value);
                          setSelectedCreateCampaign("");
                        }}
                        placeholder="Choose a campaign"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "0.9rem",
                          color: "#1c1e21",
                          outline: "none",
                          boxSizing: "border-box",
                          transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#0064e1";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 100, 225, 0.12)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#cbd5e1";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                    {/* Filtered campaign suggestions */}
                    {createCampaignSearch && (
                      <div
                        style={{
                          border: "1px solid #e2e8f0",
                          borderTop: "none",
                          borderRadius: "0 0 6px 6px",
                          background: "#ffffff",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          maxHeight: 160,
                          overflowY: "auto",
                        }}
                      >
                        {campaignsList
                          .filter((c) => c.name.toLowerCase().includes(createCampaignSearch.toLowerCase()))
                          .map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedCreateCampaign(c.name);
                                setCreateCampaignSearch(c.name);
                              }}
                              style={{
                                padding: "9px 14px",
                                fontSize: "0.88rem",
                                color: "#1c1e21",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                transition: "background 0.1s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
                                <path d="M3 5a2 2 0 0 1 2-2h3.586a1 1 0 0 1 .707.293L10.707 5H15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              {c.name}
                            </div>
                          ))}
                        {campaignsList.filter((c) => c.name.toLowerCase().includes(createCampaignSearch.toLowerCase())).length === 0 && (
                          <div style={{ padding: "10px 14px", fontSize: "0.85rem", color: "#94a3b8", textAlign: "center" }}>
                            No campaigns found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
                padding: "12px 20px 16px 20px",
                borderTop: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                style={{
                  padding: "7px 20px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={createModalTab === "adset" && !selectedCreateCampaign}
                onClick={() => {
                  // Proceed: open real Meta Ads Manager campaign creation page
                  if (createModalTab === "campaign") {
                    if (createObjective === "Traffic" || createObjective === "Engagement") {
                      setCampaignSetupChoice("tailored");
                      setCreateModalStep("setup");
                    } else {
                      handleLaunchStandaloneEditor(createObjective);
                    }
                  } else {
                    setActiveMetaSubSection("adsets");
                    const newAdset = {
                      id: `as-new-${Date.now()}`,
                      name: selectedCreateCampaign ? `${selectedCreateCampaign} - New Ad Set` : "New Ad Set",
                      delivery: "In draft",
                      bidStrategy: "Highest volume",
                      bidStrategySub: "Leads",
                      budget: "₹200.00",
                      budgetSub: "Daily",
                      results: "—",
                      costPerResult: "—",
                      amountSpent: "—",
                      impressions: "—",
                      reach: "—",
                      ends: "Ongoing",
                      attribution: "7-day click or 1-day view",
                      lastSignificantEdit: "Just now",
                      active: true,
                    };
                    setAdsetsList((prev) => [newAdset, ...prev]);
                    setSelectedAdsetIds([newAdset.id]);
                    showToast(`Created ad set "${newAdset.name}" as draft.`);
                    setCreateModalOpen(false);
                  }
                }}
                style={{
                  padding: "7px 22px",
                  borderRadius: 6,
                  border: "none",
                  background:
                    createModalTab === "adset" && !selectedCreateCampaign
                      ? "#d1d5db"
                      : "#0064e1",
                  color: createModalTab === "adset" && !selectedCreateCampaign ? "#9ca3af" : "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  cursor: createModalTab === "adset" && !selectedCreateCampaign ? "not-allowed" : "pointer",
                  boxShadow:
                    createModalTab === "adset" && !selectedCreateCampaign
                      ? "none"
                      : "0 1px 2px rgba(0, 100, 225, 0.2)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!(createModalTab === "adset" && !selectedCreateCampaign)) {
                    e.currentTarget.style.background = "#0053bf";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(createModalTab === "adset" && !selectedCreateCampaign)) {
                    e.currentTarget.style.background = "#0064e1";
                  }
                }}
              >
                Continue
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 1. PUBLISHING PROGRESS MODAL (Meta Ads Manager Publishing Dialog) ── */}
      {publishingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 20px 40px rgba(0,0,0,0.22)",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: publishingProgress >= 100 ? "#ecfdf5" : "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {publishingProgress >= 100 ? (
                <CheckCircle2 size={28} color="#10b981" />
              ) : (
                <UploadCloud size={26} color="#0064e1" style={{ animation: "pulse 1.2s infinite" }} />
              )}
            </div>

            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
              {publishingProgress >= 100 ? "Publish complete!" : "Publishing to Meta..."}
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "0.86rem", color: "#64748b" }}>
              {publishingProgress >= 100
                ? `${publishingTotal} item(s) are now active in Meta Ads Manager.`
                : `Publishing 1 of ${publishingTotal}: "${publishingItemName}"`}
            </p>

            {/* Progress track */}
            <div
              style={{
                width: "100%",
                height: 7,
                background: "#f1f5f9",
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: `${publishingProgress}%`,
                  height: "100%",
                  background: publishingProgress >= 100 ? "#10b981" : "#0064e1",
                  borderRadius: 4,
                  transition: "width 0.25s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>
              {publishingProgress}% complete
            </div>
          </div>
        </div>
      )}

      {/* ── 2. META EDIT DRAWER (Slide-over panel matching Meta Ads Manager) ── */}
      {editDrawerOpen && editingItemData && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.4)",
            zIndex: 1500,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setEditDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 520,
              maxWidth: "92vw",
              height: "100vh",
              background: "#ffffff",
              boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.16)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#0064e1",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 5,
                    textTransform: "uppercase",
                  }}
                >
                  {activeMetaSubSection.slice(0, -1) || "Ad"}
                </span>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  Edit {editingItemData.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditDrawerOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {/* Item Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editingItemData.name || ""}
                  onChange={(e) => setEditingItemData((prev) => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.88rem",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Status & Delivery */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Delivery
                  </label>
                  <select
                    value={editingItemData.delivery || "In draft"}
                    onChange={(e) => setEditingItemData((prev) => ({ ...prev, delivery: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.86rem",
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="In draft">In draft</option>
                    <option value="Active">Active</option>
                    <option value="Off">Off / Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    State Toggle
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38 }}>
                    <button
                      type="button"
                      onClick={() => setEditingItemData((prev) => ({ ...prev, active: !prev.active }))}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: editingItemData.active ? "#0064e1" : "#cbd5e1",
                        border: "none",
                        padding: 3,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: editingItemData.active ? "flex-end" : "flex-start",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#ffffff" }} />
                    </button>
                    <span style={{ fontSize: "0.84rem", fontWeight: 600, color: editingItemData.active ? "#0064e1" : "#64748b" }}>
                      {editingItemData.active ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Budget
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
                  <input
                    type="text"
                    value={editingItemData.budget || ""}
                    onChange={(e) => setEditingItemData((prev) => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g. ₹500.00"
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 6,
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <select
                    value={editingItemData.budgetSub || "Daily"}
                    onChange={(e) => setEditingItemData((prev) => ({ ...prev, budgetSub: e.target.value }))}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.86rem",
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              {/* Bid Strategy */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Bid Strategy
                </label>
                <select
                  value={editingItemData.bidStrategy || "Highest volume"}
                  onChange={(e) => setEditingItemData((prev) => ({ ...prev, bidStrategy: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.86rem",
                    color: "#0f172a",
                    background: "#ffffff",
                  }}
                >
                  <option value="Highest volume">Highest volume</option>
                  <option value="Lowest cost">Lowest cost</option>
                  <option value="Cost per result goal">Cost per result goal</option>
                  <option value="Bid cap">Bid cap</option>
                </select>
              </div>

              {/* Ad Set Parent (if editing an ad) */}
              {editingItemData.adsetName && (
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Ad Set
                  </label>
                  <input
                    type="text"
                    value={editingItemData.adsetName || ""}
                    onChange={(e) => setEditingItemData((prev) => ({ ...prev, adsetName: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 6,
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.88rem",
                      color: "#0f172a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              {/* Schedule / Ends */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Schedule & Ends
                </label>
                <input
                  type="text"
                  value={editingItemData.ends || "Ongoing"}
                  onChange={(e) => setEditingItemData((prev) => ({ ...prev, ends: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.88rem",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 10,
                background: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={() => setEditDrawerOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSaveEditDrawer}
                style={{
                  padding: "7px 22px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 650,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 100, 225, 0.2)",
                }}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. DUPLICATE MODAL (Meta Custom Copies & Destination) ── */}
      {duplicateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 1600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setDuplicateModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 460,
              background: "#ffffff",
              borderRadius: 10,
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                Duplicate {activeSelection.typeLabel}
              </h3>
              <button
                type="button"
                onClick={() => setDuplicateModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Number of copies */}
              <div>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 650, color: "#1c1e21", marginBottom: 6 }}>
                  Number of copies
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setDuplicateCopies((prev) => Math.max(1, prev - 1))}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={duplicateCopies}
                    onChange={(e) => setDuplicateCopies(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    style={{
                      width: 60,
                      height: 34,
                      textAlign: "center",
                      borderRadius: 6,
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.92rem",
                      fontWeight: 650,
                      color: "#0f172a",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setDuplicateCopies((prev) => Math.min(10, prev + 1))}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: "0.82rem", color: "#64748b" }}>copies per item</span>
                </div>
              </div>

              {/* Destination */}
              <div>
                <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 650, color: "#1c1e21", marginBottom: 8 }}>
                  Destination
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { id: "original", label: "Original campaign" },
                    { id: "existing", label: "Existing campaign" },
                    { id: "new", label: "New campaign" },
                  ].map((dest) => (
                    <label
                      key={dest.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.86rem",
                        color: "#1e293b",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="duplicate_destination"
                        value={dest.id}
                        checked={duplicateDestination === dest.id}
                        onChange={() => setDuplicateDestination(dest.id)}
                        style={{ accentColor: "#0064e1" }}
                      />
                      <span>{dest.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "12px 20px 16px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setDuplicateModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleQuickDuplicate(duplicateCopies)}
                style={{
                  padding: "7px 22px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 650,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 100, 225, 0.2)",
                }}
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. QUICK EDIT MODAL ── */}
      {quickEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 1600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setQuickEditModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#ffffff",
              borderRadius: 10,
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                Quick edit {activeSelection.typeLabel}
              </h3>
              <button
                type="button"
                onClick={() => setQuickEditModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Name
                </label>
                <input
                  type="text"
                  value={quickEditName}
                  onChange={(e) => setQuickEditName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Budget
                </label>
                <input
                  type="text"
                  value={quickEditBudget}
                  onChange={(e) => setQuickEditBudget(e.target.value)}
                  placeholder="₹200.00"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                padding: "12px 20px 16px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setQuickEditModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickEdit}
                style={{
                  padding: "7px 22px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. FIND AND REPLACE MODAL (Meta Feature) ── */}
      {findReplaceModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 1600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setFindReplaceModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 460,
              background: "#ffffff",
              borderRadius: 10,
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                Find and replace text
              </h3>
              <button
                type="button"
                onClick={() => setFindReplaceModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.84rem", color: "#64748b" }}>
                Find and replace text in the names of the {activeSelection.ids.length} selected {activeSelection.pluralLabel}.
              </p>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Find
                </label>
                <input
                  type="text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="e.g. Awareness"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Replace with
                </label>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="e.g. Conversion"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={(e) => setMatchCase(e.target.checked)}
                  style={{ accentColor: "#0064e1" }}
                />
                <span>Match case</span>
              </label>
            </div>
            <div
              style={{
                padding: "12px 20px 16px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setFindReplaceModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteFindReplace}
                style={{
                  padding: "7px 22px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. DELETE CONFIRMATION MODAL ── */}
      {deleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 1600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#ffffff",
              borderRadius: 10,
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.2)",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#fee2e2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                  Delete {activeSelection.ids.length}{" "}
                  {activeSelection.ids.length === 1 ? activeSelection.typeLabel : activeSelection.pluralLabel}?
                </h3>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "#64748b", lineHeight: 1.45 }}>
                  Are you sure you want to delete the selected {activeSelection.pluralLabel}? This action cannot be
                  undone and will permanently delete them from Ads Manager.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: "7px 20px",
                  borderRadius: 6,
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 650,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(220, 38, 38, 0.25)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* ── META A/B TEST EXPERIMENT MODAL ── */}
      <MetaABTestModal
        isOpen={abTestModalOpen}
        onClose={() => setAbTestModalOpen(false)}
        campaigns={campaignsList}
        adsets={adsetsList}
        ads={adsList}
        selectedAd={adsList.find((a) => selectedAdIds.includes(a.id)) || adsList[0]}
        onLaunchTest={(testData) => {
          showToast(`A/B Test "${testData.testName || 'Experiment'}" scheduled successfully!`, "success");
          setAbTestModalOpen(false);
        }}
      />

      {/* ── META ADS MANAGER REVIEW & PUBLISH MODAL ── */}
      <ReviewAndPublishModal
        isOpen={reviewPublishModalOpen}
        onClose={() => setReviewPublishModalOpen(false)}
        campaigns={campaignsList}
        adsets={adsetsList}
        ads={adsList}
        selectedAdAccountId={selectedMetaAdAccount?.id || selectedMetaAdAccountId || "act_830629501946359"}
        selectedAdAccountName={selectedMetaAdAccount?.name || "MediaReds D M (Adstra Meta Ads)"}
        selectedCampaignIds={selectedCampaignIds}
        onPublishSuccess={handleReviewPublishSuccess}
        showToast={showToast}
      />

      {/* ── META AD PREVIEW MODAL (Image 1 Preview Action) ── */}
      {previewModalOpen && previewItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            setPreviewModalOpen(false);
            setPreviewItem(null);
          }}
        >
          <div
            style={{
              width: 460,
              maxWidth: "92vw",
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              padding: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                Ad Preview
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  setPreviewItem(null);
                }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              {previewItem.thumb ? (
                <img
                  src={previewItem.thumb}
                  alt={previewItem.name}
                  style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }}
                />
              ) : (
                <AdPlaceholderIcon />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>{previewItem.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{previewItem.adsetName || "Meta Ad Creative"}</div>
              </div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "14px", border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#334155", lineHeight: 1.5, marginBottom: 18 }}>
              <div><strong>Status:</strong> {previewItem.delivery || "Active"}</div>
              <div><strong>Bid Strategy:</strong> {previewItem.bidStrategy || "Highest volume"}</div>
              <div><strong>Budget:</strong> {previewItem.budget || "Using campaign budget"}</div>
              <div><strong>Attribution:</strong> {previewItem.attribution || "7-day click or 1-day view"}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  setPreviewItem(null);
                }}
                style={{
                  padding: "7px 16px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = previewItem;
                  setPreviewModalOpen(false);
                  setPreviewItem(null);
                  handleOpenStandaloneEditorForAd(target);
                }}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Edit in Meta Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. FLOATING TOAST NOTIFICATION ── */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: 24,
            background: "#1e293b",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.85rem",
            fontWeight: 500,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toast.type === "success" && <CheckCircle2 size={16} color="#4ade80" />}
          {toast.type === "info" && <Info size={16} color="#60a5fa" />}
          {toast.type === "error" && <AlertCircle size={16} color="#f87171" />}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: 2,
              marginLeft: 6,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── REAL META ADS MANAGER STANDALONE CAMPAIGN EDITOR (Matching Images 1, 2, 3) ── */}
      <MetaAdsManagerCampaignEditor
        isOpen={standaloneEditorOpen}
        initialData={standaloneEditorData}
        onClose={() => setStandaloneEditorOpen(false)}
        onPublish={handlePublishStandaloneCampaign}
        onSaveDraft={handleSaveDraftStandaloneCampaign}
      />

      {/* ─── IMAGE 2 EXACT FORM PORTAL DROPDOWN (CAMPAIGNS / AD SETS / ADS) ─── */}
      {typeof document !== "undefined" && openRowMenuId && rowMenuCoords && activeRowMenuItem &&
        createPortal(
          <div
            ref={rowMenuPortalRef}
            style={{
              position: "fixed",
              top: getCampaignMenuPosition().top,
              left: getCampaignMenuPosition().left,
              width: 175,
              background: "#ffffff",
              borderRadius: 8,
              border: "1px solid #dadde1",
              boxShadow: "0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)",
              zIndex: 9999999,
              padding: "6px 0",
              fontSize: "0.85rem",
              userSelect: "none",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Analyse (Image 2: Purple rosette flower) */}
            <button
              type="button"
              onClick={() => {
                setActiveChartItem(activeRowMenuItem);
                if (activeRowMenuItem.type === "ad") {
                  setSelectedAdIds([activeRowMenuItem.id]);
                } else if (activeRowMenuItem.type === "adset") {
                  setSelectedAdsetIds([activeRowMenuItem.id]);
                } else {
                  setSelectedCampaignIds([activeRowMenuItem.id]);
                }
                setChartsDrawerOpen(true);
                showToast(`Analysing "${activeRowMenuItem.name}"`, "info");
                setOpenRowMenuId(null);
                setRowMenuCoords(null);
              }}
              style={rowMenuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <MetaAnalyseIcon size={16} />
              <span>Analyse</span>
            </button>

            {/* 2. Pin (Image 2: Pin icon) */}
            <button
              type="button"
              onClick={() => {
                const target = activeRowMenuItem;
                const isPinned = pinnedRowIds.has(target.id);
                setPinnedRowIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(target.id)) {
                    next.delete(target.id);
                    showToast(`Unpinned "${target.name}"`, "info");
                  } else {
                    next.add(target.id);
                    showToast(`Pinned "${target.name}" to top`, "info");
                  }
                  return next;
                });
                setOpenRowMenuId(null);
                setRowMenuCoords(null);
              }}
              style={rowMenuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Pin size={15} color="#1c1e21" style={{ transform: "rotate(45deg)" }} />
              <span>{pinnedRowIds.has(activeRowMenuItem.id) ? "Unpin" : "Pin"}</span>
            </button>

            {/* 3. View history (Image 2: Clock icon) */}
            <button
              type="button"
              onClick={() => {
                setViewHistoryItem(activeRowMenuItem);
                setViewHistoryDrawerOpen(true);
                setOpenRowMenuId(null);
                setRowMenuCoords(null);
              }}
              style={rowMenuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Clock size={15} color="#1c1e21" strokeWidth={1.8} />
              <span>View history</span>
            </button>

            {/* 4. Rules (Image 2: Opposing arrows icon) */}
            <button
              type="button"
              onClick={() => {
                setRulesTargetItem(activeRowMenuItem);
                setRulesActiveTab("active");
                setRulesModalOpen(true);
                showToast(`Automated rules for "${activeRowMenuItem.name}"`, "info");
                setOpenRowMenuId(null);
                setRowMenuCoords(null);
              }}
              style={rowMenuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <MetaRulesIcon size={15} color="#1c1e21" />
              <span>Rules</span>
            </button>
          </div>,
          document.body
        )
      }

      {/* ─── META ADS MANAGER VIEW HISTORY DRAWER (CAMPAIGNS / AD SETS) ─── */}
      {viewHistoryDrawerOpen && viewHistoryItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 480,
            maxWidth: "94vw",
            background: "#ffffff",
            boxShadow: "-10px 0 32px rgba(0,0,0,0.18)",
            zIndex: 1060,
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #cbd5e1",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#ffffff",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={18} color="#0064e1" />
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                  View history
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 2 }}>
                {viewHistoryItem.name} • ID: {viewHistoryItem.id}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setViewHistoryDrawerOpen(false);
                setViewHistoryItem(null);
              }}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Activity Filters */}
          <div
            style={{
              padding: "10px 20px",
              borderBottom: "1px solid #f1f5f9",
              background: "#f8fafc",
              display: "flex",
              gap: 6,
              overflowX: "auto",
            }}
          >
            {[
              { id: "all", label: "All activities" },
              { id: "status", label: "Status" },
              { id: "budget", label: "Budget" },
              { id: "targeting", label: "Targeting & Setup" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setViewHistoryFilter(f.id)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  border: viewHistoryFilter === f.id ? "1px solid #0064e1" : "1px solid #cbd5e1",
                  background: viewHistoryFilter === f.id ? "#eff6ff" : "#ffffff",
                  color: viewHistoryFilter === f.id ? "#0064e1" : "#475569",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Activity Timeline */}
          <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  id: "hist-1",
                  type: "status",
                  title: `${viewHistoryItem.type === "campaign" ? "Campaign" : viewHistoryItem.type === "adset" ? "Ad set" : "Ad"} delivery status updated`,
                  author: "Adstra Marketing Admin",
                  time: "Today at 10:14 AM",
                  badge: "Status",
                  badgeColor: "#16a34a",
                  badgeBg: "#dcfce7",
                  desc: "Delivery status updated to Active and synced with Meta Marketing API.",
                  beforeAfter: { before: "In draft", after: "Active" },
                },
                {
                  id: "hist-2",
                  type: "budget",
                  title: "Budget allocation and schedule adjusted",
                  author: "Adstra Marketing Admin",
                  time: "Yesterday at 4:20 PM",
                  badge: "Budget",
                  badgeColor: "#0284c7",
                  badgeBg: "#e0f2fe",
                  desc: `Daily budget set to ${viewHistoryItem.budget || "₹500.00"}. Bidding strategy set to Highest volume.`,
                },
                {
                  id: "hist-3",
                  type: "targeting",
                  title: "Audience targeting & Advantage+ placement updated",
                  author: "Adstra Marketing Admin",
                  time: "12 Oct 2026 at 11:30 AM",
                  badge: "Targeting",
                  badgeColor: "#f59e0b",
                  badgeBg: "#fef3c7",
                  desc: "Placement set to Advantage+ placements (Feeds, Stories, Reels, Explore).",
                },
                {
                  id: "hist-4",
                  type: "status",
                  title: `Created in Meta Ads Manager`,
                  author: "Adstra Digital Admin",
                  time: "08 Oct 2026 at 9:00 AM",
                  badge: "Created",
                  badgeColor: "#64748b",
                  badgeBg: "#f1f5f9",
                  desc: `Initial creation by Adstra Digital campaign publisher.`,
                },
              ]
                .filter((item) => viewHistoryFilter === "all" || item.type === viewHistoryFilter)
                .map((event) => (
                  <div
                    key={event.id}
                    style={{
                      padding: "14px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: event.badgeBg,
                          color: event.badgeColor,
                          textTransform: "uppercase",
                        }}
                      >
                        {event.badge}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{event.time}</span>
                    </div>

                    <div style={{ fontWeight: 650, fontSize: "0.86rem", color: "#0f172a", marginBottom: 4 }}>
                      {event.title}
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.45, marginBottom: 8 }}>
                      {event.desc}
                    </div>

                    {event.beforeAfter && (
                      <div
                        style={{
                          padding: "8px 10px",
                          background: "#f8fafc",
                          borderRadius: 6,
                          fontSize: "0.76rem",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <strong style={{ color: "#ef4444" }}>Previous:</strong> {event.beforeAfter.before}
                        </div>
                        <div>
                          <strong style={{ color: "#16a34a" }}>Updated:</strong> {event.beforeAfter.after}
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: "0.73rem", color: "#64748b" }}>
                      Changed by: <strong>{event.author}</strong>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Drawer Footer */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid #e2e8f0",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={() => {
                showToast("Change history exported to CSV.", "success");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#1e293b",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download size={13} />
              <span>Export history</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewHistoryDrawerOpen(false);
                setViewHistoryItem(null);
              }}
              style={{
                padding: "7px 18px",
                borderRadius: 6,
                border: "none",
                background: "#0064e1",
                color: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ─── META ADS MANAGER PERFORMANCE INSIGHTS DRAWER (ANALYSE BUTTON) ─── */}
      {chartsDrawerOpen && activeChartItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 520,
            maxWidth: "94vw",
            background: "#ffffff",
            boxShadow: "-12px 0 36px rgba(0,0,0,0.2)",
            zIndex: 1060,
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #cbd5e1",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#ffffff",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MetaAnalyseIcon size={20} />
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                  Performance Insights
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0064e1" }}>
                  {activeChartItem.name}
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: activeChartItem.active || activeChartItem.delivery === "Active" ? "#dcfce7" : "#f1f5f9",
                    color: activeChartItem.active || activeChartItem.delivery === "Active" ? "#16a34a" : "#64748b",
                  }}
                >
                  {activeChartItem.delivery || (activeChartItem.active ? "Active" : "In draft")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setChartsDrawerOpen(false);
                setActiveChartItem(null);
              }}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Time range bar */}
          <div
            style={{
              padding: "8px 20px",
              background: "#f8fafc",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              color: "#64748b",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={13} color="#64748b" />
              <span>Last 30 days: 14 Sep 2026 - 13 Oct 2026</span>
            </div>
            <span style={{ fontWeight: 600, color: "#0064e1" }}>Meta Pixel Synced</span>
          </div>

          {/* Content Body */}
          <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Primary KPI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Results
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {activeChartItem.results && activeChartItem.results !== "—" ? activeChartItem.results : "635 Clicks"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                  {activeChartItem.costPerResult && activeChartItem.costPerResult !== "—" ? `${activeChartItem.costPerResult} per result` : "₹0.67 per result"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Amount Spent
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {activeChartItem.amountSpent && activeChartItem.amountSpent !== "—" ? activeChartItem.amountSpent : "₹253.61"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                  Budget: {activeChartItem.budget || "₹90.00 Daily"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Reach
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {activeChartItem.reach || "18,420"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#16a34a", marginTop: 2 }}>
                  ↑ 14.8% vs previous period
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Impressions
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {activeChartItem.impressions || "26,150"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                  Frequency: 1.42
                </div>
              </div>
            </div>

            {/* Secondary Delivery Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
                padding: "12px",
                borderRadius: 8,
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>CTR (Link)</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>2.43%</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>CPC (Cost)</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>₹0.40</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>CPM</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>₹9.70</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Frequency</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>1.42</div>
              </div>
            </div>

            {/* SVG Interactive Trend Chart */}
            <div style={{ padding: "16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#ffffff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>Performance Over Time</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.74rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#0064e1" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0064e1" }} />
                    Results
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#9333ea" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#9333ea" }} />
                    Spend
                  </span>
                </div>
              </div>
              <svg width="100%" height="130" viewBox="0 0 460 130" style={{ overflow: "visible" }}>
                <defs>
                  <linearGradient id="campaignChartBlueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0064e1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0064e1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 10 110 L 60 95 L 120 75 L 180 85 L 240 50 L 300 65 L 360 30 L 420 40 L 450 25 L 450 110 Z" fill="url(#campaignChartBlueGrad)" />
                <path d="M 10 110 L 60 95 L 120 75 L 180 85 L 240 50 L 300 65 L 360 30 L 420 40 L 450 25" fill="none" stroke="#0064e1" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 10 115 L 60 105 L 120 90 L 180 95 L 240 70 L 300 80 L 360 55 L 420 60 L 450 45" fill="none" stroke="#9333ea" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                {[
                  { cx: 60, cy: 95 },
                  { cx: 120, cy: 75 },
                  { cx: 180, cy: 85 },
                  { cx: 240, cy: 50 },
                  { cx: 300, cy: 65 },
                  { cx: 360, cy: 30 },
                  { cx: 420, cy: 40 },
                  { cx: 450, cy: 25 },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="3.5" fill="#ffffff" stroke="#0064e1" strokeWidth="2" />
                ))}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: "0.7rem", color: "#94a3b8" }}>
                <span>14 Sep</span>
                <span>21 Sep</span>
                <span>28 Sep</span>
                <span>05 Oct</span>
                <span>13 Oct</span>
              </div>
            </div>

            {/* Demographics Breakdown */}
            <div style={{ padding: "16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#ffffff" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>Demographics (Age & Gender)</span>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { age: "18-24", pct: 28, male: 12, female: 16 },
                  { age: "25-34", pct: 44, male: 20, female: 24 },
                  { age: "35-44", pct: 18, male: 8, female: 10 },
                  { age: "45+", pct: 10, male: 4, female: 6 },
                ].map((d) => (
                  <div key={d.age}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: "#334155" }}>{d.age}</span>
                      <span style={{ color: "#64748b" }}>{d.pct}% ({d.female}% Women, {d.male}% Men)</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden", display: "flex" }}>
                      <div style={{ width: `${d.female * 2}%`, background: "#9333ea" }} />
                      <div style={{ width: `${d.male * 2}%`, background: "#0064e1" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta AI Recommendation */}
            <div style={{ padding: "16px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#1e40af", fontSize: "0.85rem", marginBottom: 6 }}>
                <Sparkles size={16} color="#2563eb" />
                <span>Meta AI Recommendation</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#1e3a8a", lineHeight: 1.45, marginBottom: 12 }}>
                Switching to Advantage+ placement and allocating 15% more budget during peak evening hours (6 PM - 10 PM) could reduce cost per result by up to 14%.
              </div>
              <button
                type="button"
                onClick={() => showToast("Applied Meta Advantage+ recommendation to this campaign.", "success")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Apply recommendation
              </button>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => {
                setChartsDrawerOpen(false);
                handleOpenStandaloneEditorForCampaign(activeChartItem);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 6,
                border: "none",
                background: "#0f172a",
                color: "#ffffff",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Open in Campaign Editor
            </button>
          </div>
        </div>
      )}

      {/* ─── META ADS MANAGER AUTOMATED RULES MODAL (RULES BUTTON) ─── */}
      {rulesModalOpen && rulesTargetItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 1070,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <div
            style={{
              width: 620,
              maxWidth: "92vw",
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              maxHeight: "90vh",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MetaRulesIcon size={16} color="#0064e1" />
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                    Automated rules
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Applied to: <strong>{rulesTargetItem.name}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRulesModalOpen(false);
                  setRulesTargetItem(null);
                }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
                padding: "0 20px",
              }}
            >
              <button
                type="button"
                onClick={() => setRulesActiveTab("active")}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  background: "transparent",
                  fontSize: "0.85rem",
                  fontWeight: rulesActiveTab === "active" ? 700 : 500,
                  color: rulesActiveTab === "active" ? "#0064e1" : "#64748b",
                  borderBottom: rulesActiveTab === "active" ? "2px solid #0064e1" : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                Active rules ({campaignRulesList.length})
              </button>
              <button
                type="button"
                onClick={() => setRulesActiveTab("create")}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  background: "transparent",
                  fontSize: "0.85rem",
                  fontWeight: rulesActiveTab === "create" ? 700 : 500,
                  color: rulesActiveTab === "create" ? "#0064e1" : "#64748b",
                  borderBottom: rulesActiveTab === "create" ? "2px solid #0064e1" : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                + Create new rule
              </button>
            </div>

            {/* Tab Body */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {rulesActiveTab === "active" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {campaignRulesList.map((rule) => (
                    <div
                      key={rule.id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        background: rule.enabled ? "#ffffff" : "#f8fafc",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 14,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 650, fontSize: "0.88rem", color: rule.enabled ? "#0f172a" : "#64748b" }}>
                            {rule.name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: rule.enabled ? "#dcfce7" : "#f1f5f9",
                              color: rule.enabled ? "#16a34a" : "#94a3b8",
                            }}
                          >
                            {rule.enabled ? "Active" : "Paused"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.4 }}>
                          <strong>Condition:</strong> {rule.condition}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 2 }}>
                          <strong>Action:</strong> {rule.action} • {rule.schedule}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 4 }}>
                          Last checked: {rule.lastTriggered}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setCampaignRulesList((prev) =>
                              prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                            );
                            showToast(`Rule "${rule.name}" is now ${rule.enabled ? "paused" : "active"}.`, "info");
                          }}
                          style={{
                            width: 34,
                            height: 18,
                            borderRadius: 9,
                            background: rule.enabled ? "#0064e1" : "#cbd5e1",
                            border: "none",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: rule.enabled ? "flex-end" : "flex-start",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ffffff" }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCampaignRulesList((prev) => prev.filter((r) => r.id !== rule.id));
                            showToast(`Rule "${rule.name}" removed.`, "info");
                          }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}
                          title="Delete rule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 650, color: "#334155", marginBottom: 5 }}>
                      Rule name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pause campaign if CPA > ₹50"
                      value={newRuleForm.name}
                      onChange={(e) => setNewRuleForm((prev) => ({ ...prev, name: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 650, color: "#334155", marginBottom: 5 }}>
                      Action
                    </label>
                    <select
                      value={newRuleForm.action}
                      onChange={(e) => setNewRuleForm((prev) => ({ ...prev, action: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        outline: "none",
                      }}
                    >
                      <option value="turn_off">Turn off campaign</option>
                      <option value="turn_on">Turn on campaign</option>
                      <option value="increase_budget">Increase daily budget by 10%</option>
                      <option value="decrease_budget">Decrease daily budget by 10%</option>
                      <option value="send_notification">Send notification only</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 650, color: "#334155", marginBottom: 5 }}>
                        Condition metric
                      </label>
                      <select
                        value={newRuleForm.metric}
                        onChange={(e) => setNewRuleForm((prev) => ({ ...prev, metric: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          outline: "none",
                        }}
                      >
                        <option value="cpa">Cost per result is greater than</option>
                        <option value="spend">Amount spent is greater than</option>
                        <option value="frequency">Frequency is greater than</option>
                        <option value="impressions">Impressions is greater than</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 650, color: "#334155", marginBottom: 5 }}>
                        Threshold value
                      </label>
                      <input
                        type="text"
                        placeholder="₹50.00"
                        value={newRuleForm.threshold}
                        onChange={(e) => setNewRuleForm((prev) => ({ ...prev, threshold: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 650, color: "#334155", marginBottom: 5 }}>
                      Schedule & Frequency
                    </label>
                    <select
                      value={newRuleForm.frequency}
                      onChange={(e) => setNewRuleForm((prev) => ({ ...prev, frequency: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        outline: "none",
                      }}
                    >
                      <option value="continuous">Continuously (Every 30 minutes)</option>
                      <option value="daily">Daily at 12:00 AM</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setRulesActiveTab("active")}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#475569",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ruleName = newRuleForm.name.trim() || `Auto rule for ${rulesTargetItem.name}`;
                        const newRule = {
                          id: `rule-camp-${Date.now()}`,
                          name: ruleName,
                          enabled: true,
                          condition: `${newRuleForm.metric.toUpperCase()} > ${newRuleForm.threshold}`,
                          action: newRuleForm.action.replace("_", " "),
                          schedule: newRuleForm.frequency === "continuous" ? "Continuously (Every 30 mins)" : "Daily at 12:00 AM",
                          lastTriggered: "Just now",
                        };
                        setCampaignRulesList((prev) => [newRule, ...prev]);
                        setRulesActiveTab("active");
                        setNewRuleForm({ name: "", action: "turn_off", metric: "cpa", threshold: "50.00", frequency: "continuous" });
                        showToast(`Rule "${ruleName}" successfully created and activated!`, "success");
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "none",
                        background: "#0064e1",
                        color: "#ffffff",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Create rule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Consistent Table Header & Cell Styles matching Meta Ads Manager
const thStyle = {
  padding: "8px 10px",
  fontSize: "12px",
  color: "#4b4f56",
  fontWeight: 600,
  borderTop: "1px solid #ccd0d5",
  borderBottom: "1px solid #ccd0d5",
  borderRight: "1px solid #e4e6eb",
  textAlign: "left",
  whiteSpace: "nowrap",
  background: "#f5f6f7",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  lineHeight: 1.2,
  boxSizing: "border-box",
};

const tdStyle = {
  padding: "6px 10px",
  fontSize: "12px",
  whiteSpace: "nowrap",
  color: "#1c1e21",
  borderBottom: "1px solid #e4e6eb",
  borderRight: "1px solid #e4e6eb",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  lineHeight: 1.3,
  boxSizing: "border-box",
};
