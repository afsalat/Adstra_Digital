"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
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
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
  Download,
  BarChart2,
  Info,
  Check,
  ArrowUpDown,
  ArrowDown,
  Sliders,
  MoreHorizontal,
  Folder,
  X,
  Sparkles,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Share2,
  Clock,
  Pin,
  RefreshCw,
} from "lucide-react";

// ─── ICON HELPERS MATCHING IMAGES 1, 2, 3 ──────────────────────────────

// Meta Sub-sections Folder Icon
export const MetaFolderIcon = ({ size = 16, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
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

// Meta Sub-sections Blue Ad Icon (Image 1, 2, 3 Active Ads Tab)
export const MetaAdIcon = ({ size = 16, active = false }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2.5" y="3.5" width="15" height="13" rx="3" fill={active ? "#0064e1" : "#94a3b8"} />
    <rect x="5" y="6" width="6" height="2.5" rx="0.8" fill="#ffffff" />
    <rect x="5" y="10" width="10" height="1.8" rx="0.6" fill="#ffffff" opacity="0.85" />
    <rect x="5" y="12.8" width="7" height="1.8" rx="0.6" fill="#ffffff" opacity="0.65" />
  </svg>
);

// Adstra Diamond Geometric Logo (Rows 1 & 3 in Images 1, 2, 3)
export const AdstraDiamondIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, borderRadius: 5, display: "block" }}>
    <rect width="32" height="32" rx="5" fill="#f0f4f8" />
    <g transform="translate(4,4)">
      <polygon points="12,0 24,12 12,12" fill="#0284c7" />
      <polygon points="0,12 12,0 12,12" fill="#0f172a" />
      <polygon points="0,12 12,24 12,12" fill="#ea580c" />
      <polygon points="12,12 12,24 24,12" fill="#38bdf8" />
    </g>
  </svg>
);

// Flask / Test Tube Thumbnail (Row 2 in Images 1, 2, 3)
export const CMSFlaskThumbnail = ({ size = 28 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 5,
      background: "#f1f5f9",
      border: "1px solid #cbd5e1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontSize: "14px",
    }}
  >
    <span>🧪</span>
  </div>
);

// Ad Creative Placeholder Icon (Rows 4, 5, 6 in Images 1, 2, 3)
export const AdPlaceholderIcon = ({ size = 28 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 5,
      background: "#f8fafc",
      border: "1px solid #cbd5e1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width={14} height={14} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2.5" stroke="#94a3b8" strokeWidth="1.6" />
      <line x1="6" y1="7" x2="14" y2="7" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="6" y1="10.5" x2="11" y2="10.5" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  </div>
);

// Solid black downward triangle caret
export const MetaCaretDown = ({ size = 7, color = "#1c1e21" }) => (
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

// Meta Duplicate Icon (Images 1, 2, 3)
export const MetaDuplicateIcon = ({ size = 14, color = "#4b4f56" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <path
      d="M5.5 2h5.5a1.5 1.5 0 0 1 1.5 1.5V10a1 1 0 0 1-2 0V4a.5.5 0 0 0-.5-.5H5.5a1 1 0 0 1 0-2z"
      opacity="0.8"
    />
    <rect x="2" y="4" width="9" height="10" rx="1.5" />
    <path d="M4.5 7h4M4.5 9.2h4M4.5 11.4h2.5" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

// Meta Edit Icon (Pencil)
export const MetaEditIcon = ({ size = 13, color = "#4b4f56" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
  </svg>
);

// Meta Analyse Icon (Purple rosette blossom from Images 1, 2, 3)
export const MetaAnalyseIcon = ({ size = 15 }) => (
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

// Meta Columns Icon (3 vertical bars)
export const MetaColumnsIcon = ({ size = 13, color = "#1e293b" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <rect x="2" y="2.5" width="2.8" height="11" rx="0.7" />
    <rect x="6.6" y="2.5" width="2.8" height="11" rx="0.7" />
    <rect x="11.2" y="2.5" width="2.8" height="11" rx="0.7" />
  </svg>
);

// Meta Breakdown Icon (Top bar + indented horizontal bars)
export const MetaBreakdownIcon = ({ size = 13, color = "#1e293b" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={color} style={{ flexShrink: 0 }}>
    <rect x="1.5" y="2.5" width="13" height="2.8" rx="0.6" />
    <rect x="5.5" y="6.8" width="9" height="2.8" rx="0.6" />
    <rect x="5.5" y="11.1" width="9" height="2.8" rx="0.6" />
  </svg>
);

// Meta Reports Icon
export const MetaReportsIcon = ({ size = 13, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M6 3.5h6.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <rect x="2" y="2" width="8.5" height="11" rx="1.5" fill="#ffffff" stroke={color} strokeWidth="1.5" />
    <line x1="4" y1="5" x2="8.5" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <line x1="4" y1="7.5" x2="8.5" y2="7.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <line x1="4" y1="10" x2="7" y2="10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// Meta Download Tray Icon
export const MetaDownloadTrayIcon = ({ size = 13, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M8 2.2v7.6M5 7L8 10.2L11 7" />
    <path d="M3 13.2h10" strokeWidth="1.8" />
  </svg>
);

// Meta View Charts Icon
export const MetaViewChartsIcon = ({ size = 14, color = "#1c1e21" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2" y="2" width="12" height="12" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M3.8 10.5L6.6 8.5L9.4 10L12.2 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="7.2" r="2.2" fill={color} />
  </svg>
);

// Meta Publish Pill Icon (Upload tray icon matching Image 2)
export const MetaPublishPillIcon = () => (
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

// Meta Rules Icon (Opposing arrows matching Image 2)
export const MetaRulesIcon = ({ size = 13, color = "#1c1e21" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke={color}
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M3 4.5h10M10 2l3 2.5-3 2.5" />
    <path d="M13 11.5H3M6 9l-3 2.5 3 2.5" />
  </svg>
);

// ─── EXACT 13 ADS DATASET (MATCHING IMAGES 1, 2, 3) ───────────────────
export const EXACT_META_13_ADS = [
  {
    id: "ad-meta-1",
    name: "New Awareness ad",
    iconType: "diamond",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹200.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Daily unique reach",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "New Awareness ad set",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-2",
    name: "CMS 9/7/2026",
    iconType: "flask",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "Using campaign...",
    budgetSub: "",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Profile visit",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Test - CMS 9/7/2026",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-3",
    name: "New Awareness ad",
    iconType: "diamond",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹1,000.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Daily unique reach",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "New Awareness ad set",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-4",
    name: "Traffic campaign for Instagram advertisers ...",
    iconType: "card",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹1,000.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Link clicks",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Traffic campaign for Instagram...",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-5",
    name: "Tailored messages campaign 08/10/2026 ...",
    iconType: "card",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹800.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Conversations",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Tailored messages campaign...",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-6",
    name: "Traffic campaign for Instagram advertisers ...",
    iconType: "card",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹1,000.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Link clicks",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Traffic campaign for Instagram...",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-7",
    name: "Traffic campaign for Instagram advertisers 2",
    iconType: "card",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹1,000.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Link clicks",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Traffic campaign for Instagram...",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-8",
    name: "Lead Generation Instant Form Ad",
    iconType: "diamond",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹500.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Leads",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "New Leads ad set",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-9",
    name: "Catalogue Carousel Collection",
    iconType: "card",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "Using campaign...",
    budgetSub: "",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Sales",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Catalog Sales ad set",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-10",
    name: "Video Reel Retargeting Ad",
    iconType: "card",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹600.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Video views",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Retargeting Video ad set",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-11",
    name: "WhatsApp Message Starter",
    iconType: "card",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹800.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Conversations",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Tailored messages campaign...",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-12",
    name: "Brand Recall Boost Ad",
    iconType: "diamond",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹200.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Daily unique reach",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "New Awareness ad set",
    adsetSubtitle: "0 active ads",
    active: true,
  },
  {
    id: "ad-meta-13",
    name: "Website Traffic Direct Ad",
    iconType: "card",
    delivery: "In draft",
    actions: "—",
    attribution: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹1,000.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    bidStrategy: "Highest volume",
    bidStrategySub: "Link clicks",
    lastEdit: "—",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "Traffic campaign for Instagram...",
    adsetSubtitle: "0 active ads",
    active: true,
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────
export default function MetaAdsManagerAdsSection({
  ads = [],
  loading = false,
  setAds = () => { },
  selectedAdIds = [],
  setSelectedAdIds = () => { },
  onToggleAdActive = () => { },
  onOpenCreateAd = () => { },
  onOpenEditorForAd = () => { },
  onOpenDuplicateAd = () => { },
  onNavigateToAdset = () => { },
  onSwitchSubSection = () => { },
  showToast = () => { },
  campaigns = [],
  adsets = [],
  client = null,
  adAccountId = null,
  showSearch = false,
  showTabs = false,
  onPublishAd = null,
}) {
  // Normalize ads list: return real ads or empty array (no mock fallback)
  const effectiveAds = useMemo(() => {
    if (ads && ads.length > 0) {
      // merge missing visual fields if needed
      return ads.map((ad, idx) => ({
        ...ad,
        iconType: ad.iconType || (idx % 3 === 0 ? "diamond" : idx % 3 === 1 ? "flask" : "card"),
        bidStrategy: ad.bidStrategy || "Highest volume",
        bidStrategySub: ad.bidStrategySub || "Link clicks",
        adsetName: ad.adsetName || "New Awareness ad set",
        adsetSubtitle: ad.adsetSubtitle || "0 active ads",
        ends: ad.ends || "Ongoing",
        delivery: ad.delivery || "In draft",
        budget: ad.budget || "₹1,000.00",
        budgetSub: ad.budgetSub !== undefined ? ad.budgetSub : "Daily",
        actions: ad.actions || "—",
        attribution: ad.attribution || "—",
        results: ad.results || "—",
        costPerResult: ad.costPerResult || "—",
        amountSpent: ad.amountSpent || "—",
        impressions: ad.impressions || "—",
        reach: ad.reach || "—",
        lastEdit: ad.lastEdit || "—",
        lastSignificantEdit: ad.lastSignificantEdit || "—",
        qualityRanking: ad.qualityRanking || "—",
        engagementRanking: ad.engagementRanking || "—",
        conversionRanking: ad.conversionRanking || "—",
        active: ad.active !== undefined ? ad.active : true,
      }));
    }
    return [];
  }, [ads]);

  // Search input state
  const [searchTerm, setSearchTerm] = useState("");

  // Date range selector state (Image 1, 2, 3: "Last 30 days: 13 Sep 2026 - 12 Oct 2026")
  const [dateRangeLabel, setDateRangeLabel] = useState("Last 30 days: 13 Sep 2026 - 12 Oct 2026");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Column Presets State (Image 1, 2, 3: "Columns: Copy of Performance")
  const [selectedColumnPreset, setSelectedColumnPreset] = useState("Copy of Performance");
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const columnsRef = useRef(null);

  // Breakdown Menu State
  const [breakdownMenuOpen, setBreakdownMenuOpen] = useState(false);
  const breakdownRef = useRef(null);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);

  // More Toolbar Menu State
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef(null);

  // Reports & Export Menus
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const reportsRef = useRef(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef(null);

  // Row Hover, Inline Rename, & Menu (Image 2 Pill Actions)
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const [pinnedAdIds, setPinnedAdIds] = useState(new Set());
  const [inlineEditing, setInlineEditing] = useState(null); // { id, name }

  // Floating Portal Menu State (Image 2: ••• Row Actions Menu)
  const [rowMenuCoords, setRowMenuCoords] = useState(null);
  const [activeRowMenuAd, setActiveRowMenuAd] = useState(null);
  const rowMenuPortalRef = useRef(null);

  // Meta Ads Manager View History Drawer State
  const [viewHistoryDrawerOpen, setViewHistoryDrawerOpen] = useState(false);
  const [viewHistoryAd, setViewHistoryAd] = useState(null);
  const [viewHistoryFilter, setViewHistoryFilter] = useState("all");


  const pillBtnStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    height: 22,
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 9999,
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#334155",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
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

  // Close row dropdown on outside click, window scroll or resize
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (openRowMenuId) {
        if (rowMenuPortalRef.current && rowMenuPortalRef.current.contains(e.target)) return;
        if (e.target.closest && e.target.closest(".meta-row-actions-more-dropdown")) return;
        setOpenRowMenuId(null);
        setRowMenuCoords(null);
        setActiveRowMenuAd(null);
      }
    };
    const handleScrollOrResize = () => {
      if (openRowMenuId) {
        setOpenRowMenuId(null);
        setRowMenuCoords(null);
        setActiveRowMenuAd(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [openRowMenuId]);

  const getMenuPosition = () => {
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

  const handleTriggerAnalyse = (ad) => {
    setActiveChartAd(ad);
    setChartsDrawerOpen(true);
    if (showToast) showToast(`Analysing "${ad.name}"`, "info");
    setOpenRowMenuId(null);
    setRowMenuCoords(null);
    setActiveRowMenuAd(null);
  };

  const handleTriggerPin = (ad) => {
    const isPinned = pinnedAdIds.has(ad.id);
    setPinnedAdIds((prev) => {
      const next = new Set(prev);
      if (next.has(ad.id)) {
        next.delete(ad.id);
        if (showToast) showToast(`Unpinned "${ad.name}"`, "info");
      } else {
        next.add(ad.id);
        if (showToast) showToast(`Pinned "${ad.name}" to top`, "info");
      }
      return next;
    });
    setOpenRowMenuId(null);
    setRowMenuCoords(null);
    setActiveRowMenuAd(null);
  };

  const handleTriggerViewHistory = (ad) => {
    setViewHistoryAd(ad);
    setViewHistoryDrawerOpen(true);
    setOpenRowMenuId(null);
    setRowMenuCoords(null);
    setActiveRowMenuAd(null);
  };


  // Modals & Panels
  const [columnCustomizerModalOpen, setColumnCustomizerModalOpen] = useState(false);
  const [chartsDrawerOpen, setChartsDrawerOpen] = useState(false);
  const [activeChartAd, setActiveChartAd] = useState(null);
  const [opportunityScoreOpen, setOpportunityScoreOpen] = useState(false);
  const [infoTooltipOpen, setInfoTooltipOpen] = useState(false);
  const infoTooltipRef = useRef(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateCopies, setDuplicateCopies] = useState(1);
  const [previewAdModal, setPreviewAdModal] = useState(null);

  // Column visibility configuration
  const [visibleColumns, setVisibleColumns] = useState({
    checkbox: true,
    off: true,
    ad: true,
    delivery: true,
    actions: true,
    attribution: true,
    results: true,
    costPerResult: true,
    budget: true,
    amountSpent: true,
    impressions: true,
    reach: true,
    ends: true,
    bidStrategy: true,
    lastEdit: true,
    lastSignificantEdit: true,
    qualityRanking: true,
    engagementRanking: true,
    conversionRanking: true,
    adsetName: true,
  });

  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) setDatePickerOpen(false);
      if (columnsRef.current && !columnsRef.current.contains(e.target)) setColumnsMenuOpen(false);
      if (breakdownRef.current && !breakdownRef.current.contains(e.target)) setBreakdownMenuOpen(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setMoreMenuOpen(false);
      if (reportsRef.current && !reportsRef.current.contains(e.target)) setReportsMenuOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportMenuOpen(false);
      if (infoTooltipRef.current && !infoTooltipRef.current.contains(e.target)) setInfoTooltipOpen(false);
      if (e.target && !e.target.closest(".meta-row-actions-more-dropdown")) {
        setOpenRowMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered & Sorted Ads
  const displayedAds = useMemo(() => {
    let result = [...effectiveAds];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (ad) =>
          ad.name.toLowerCase().includes(q) ||
          ad.adsetName?.toLowerCase().includes(q) ||
          ad.delivery?.toLowerCase().includes(q) ||
          ad.bidStrategySub?.toLowerCase().includes(q)
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key] || "";
        let valB = b[sortConfig.key] || "";
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    if (pinnedAdIds.size > 0) {
      result.sort((a, b) => {
        const aPinned = pinnedAdIds.has(a.id) ? 1 : 0;
        const bPinned = pinnedAdIds.has(b.id) ? 1 : 0;
        return bPinned - aPinned;
      });
    }
    return result;
  }, [effectiveAds, searchTerm, sortConfig, pinnedAdIds]);

  // Master Selection
  const allSelected = displayedAds.length > 0 && selectedAdIds.length === displayedAds.length;
  const isIndeterminate = selectedAdIds.length > 0 && selectedAdIds.length < displayedAds.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAdIds(displayedAds.map((ad) => ad.id));
    } else {
      setSelectedAdIds([]);
    }
  };

  const handleToggleSelectAd = (id) => {
    setSelectedAdIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sort Handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Toggle delivery switch
  const handleToggleDelivery = async (ad) => {
    const newActive = !ad.active;
    const newDelivery = newActive ? "In draft" : "Off";
    if (setAds) {
      setAds((prev) =>
        prev.map((item) =>
          item.id === ad.id ? { ...item, active: newActive, delivery: newDelivery } : item
        )
      );
    }
    if (onToggleAdActive) {
      onToggleAdActive(ad.id);
    }
    showToast(`Ad "${ad.name}" turned ${newActive ? "on" : "off"}.`, "success");
  };

  // Save inline rename
  const handleSaveInlineRename = (adId) => {
    if (!inlineEditing || !inlineEditing.name.trim()) {
      setInlineEditing(null);
      return;
    }
    const newName = inlineEditing.name.trim();
    if (setAds) {
      setAds((prev) =>
        prev.map((ad) => (ad.id === adId ? { ...ad, name: newName } : ad))
      );
    }
    showToast(`Ad name updated to "${newName}".`, "success");
    setInlineEditing(null);
  };

  // Quick Duplicate
  const handleExecuteDuplicate = (copies = 1) => {
    const targetAd = displayedAds.find((a) => selectedAdIds.includes(a.id)) || displayedAds[0];
    if (!targetAd) return;
    const newAds = [];
    for (let i = 1; i <= copies; i++) {
      newAds.push({
        ...targetAd,
        id: `ad-copy-${Date.now()}-${i}`,
        name: `${targetAd.name} (Copy ${i})`,
        delivery: "In draft",
        active: true,
      });
    }
    if (setAds) {
      setAds((prev) => [...newAds, ...prev]);
    }
    setSelectedAdIds(newAds.map((a) => a.id));
    setDuplicateModalOpen(false);
    showToast(`Duplicated ${copies} copy of "${targetAd.name}".`, "success");
  };

  // Batch Turn On / Off
  const handleBatchTurn = (activate = true) => {
    if (selectedAdIds.length === 0) return;
    if (setAds) {
      setAds((prev) =>
        prev.map((ad) =>
          selectedAdIds.includes(ad.id)
            ? { ...ad, active: activate, delivery: activate ? "In draft" : "Off" }
            : ad
        )
      );
    }
    showToast(
      `${selectedAdIds.length} ad${selectedAdIds.length > 1 ? "s" : ""} turned ${activate ? "on" : "off"
      }.`,
      "success"
    );
    setMoreMenuOpen(false);
  };

  // Batch Delete
  const handleBatchDelete = () => {
    if (selectedAdIds.length === 0) return;
    const count = selectedAdIds.length;
    if (setAds) {
      setAds((prev) => prev.filter((ad) => !selectedAdIds.includes(ad.id)));
    }
    setSelectedAdIds([]);
    showToast(`Deleted ${count} ad${count > 1 ? "s" : ""}.`, "info");
    setMoreMenuOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Ad Name",
      "Delivery",
      "Budget",
      "Bid Strategy",
      "Ad Set",
      "Results",
      "Cost per result",
      "Amount spent",
      "Impressions",
      "Reach",
    ];
    const rows = displayedAds.map((ad) => [
      `"${ad.name.replace(/"/g, '""')}"`,
      `"${ad.delivery}"`,
      `"${ad.budget} ${ad.budgetSub || ''}"`,
      `"${ad.bidStrategy} ${ad.bidStrategySub || ''}"`,
      `"${ad.adsetName}"`,
      `"${ad.results}"`,
      `"${ad.costPerResult}"`,
      `"${ad.amountSpent}"`,
      `"${ad.impressions}"`,
      `"${ad.reach}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meta_ads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported ads table to CSV.", "success");
    setExportMenuOpen(false);
  };

  // Render thumbnail helper
  const renderThumbnail = (ad) => {
    if (ad.thumb) {
      return (
        <img
          src={ad.thumb}
          alt={ad.name}
          style={{
            width: 28,
            height: 28,
            borderRadius: 5,
            objectFit: "cover",
            display: "block",
            flexShrink: 0,
          }}
        />
      );
    }
    if (ad.iconType === "diamond") {
      return <AdstraDiamondIcon size={28} />;
    }
    if (ad.iconType === "flask") {
      return <CMSFlaskThumbnail size={28} />;
    }
    return <AdPlaceholderIcon size={28} />;
  };

  // Common styles
  const thStyle = {
    padding: "8px 12px",
    background: "#f8fafc",
    borderBottom: "1px solid #cbd5e1",
    borderRight: "1px solid #e2e8f0",
    color: "#475569",
    fontWeight: 700,
    fontSize: "0.78rem",
    textAlign: "left",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "9px 12px",
    borderBottom: "1px solid #e2e8f0",
    borderRight: "1px solid #f1f5f9",
    fontSize: "0.82rem",
    color: "#334155",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  };

  return (
    <div
      style={{
        width: "100%",
        background: "#ffffff",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* ─── 1. TOP SEARCH & FILTER BAR (Image 1, 2, 3) ─── */}
      {showSearch && (
        <div
          style={{
            padding: "10px 18px",
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              padding: "5px 12px",
              width: 380,
              maxWidth: "100%",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <Search size={14} color="#64748b" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search to filter by: name, ID or metrics"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                width: "100%",
                fontSize: "0.82rem",
                color: "#0f172a",
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. TABS ROW & DATE RANGE SELECTOR (Images 1, 2, 3) ─── */}
      {showTabs && (
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
          {/* Left Tabs: Campaigns | Ad sets | Ads */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
            {/* Tab 1: Campaigns */}
            <button
              type="button"
              onClick={() => onSwitchSubSection("campaigns")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: "7px 7px 0 0",
                border: "1px solid transparent",
                background: "transparent",
                color: "#475569",
                fontSize: "0.88rem",
                fontWeight: 550,
                cursor: "pointer",
                marginBottom: -1,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
            >
              <MetaFolderIcon size={16} active={false} />
              <span>Campaigns</span>
            </button>

            {/* Tab 2: Ad sets */}
            <button
              type="button"
              onClick={() => onSwitchSubSection("adsets")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: "7px 7px 0 0",
                border: "1px solid transparent",
                background: "transparent",
                color: "#475569",
                fontSize: "0.88rem",
                fontWeight: 550,
                cursor: "pointer",
                marginBottom: -1,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
            >
              <LayoutGrid size={16} color="#64748b" />
              <span>Ad sets</span>
            </button>

            {/* Tab 3: Ads (Active Tab with Blue Icon & White Box) */}
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: "7px 7px 0 0",
                border: "1px solid #cbd5e1",
                borderBottom: "1px solid #ffffff",
                background: "#ffffff",
                color: "#0064e1",
                fontSize: "0.88rem",
                fontWeight: 700,
                cursor: "pointer",
                position: "relative",
                marginBottom: -1,
                transition: "all 0.15s ease",
              }}
            >
              <MetaAdIcon size={16} active={true} />
              <span>Ads</span>

              {/* Blue "X selected ✕" badge from Images 1, 2, 3 */}
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

          {/* Right: Date Range Selector Button (Images 1, 2, 3) */}
          <div style={{ position: "relative", marginBottom: 6 }} ref={datePickerRef}>
            <button
              type="button"
              onClick={() => setDatePickerOpen((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 12px",
                borderRadius: 6,
                background: datePickerOpen ? "#f1f5f9" : "#ffffff",
                border: "1px solid #cbd5e1",
                fontSize: "0.8rem",
                color: "#1e293b",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!datePickerOpen) e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (!datePickerOpen) e.currentTarget.style.background = "#ffffff";
              }}
            >
              <Calendar size={14} color="#64748b" />
              <span>{dateRangeLabel}</span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {/* Date Picker Popover */}
            {datePickerOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 5px)",
                  right: 0,
                  width: 280,
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.16)",
                  zIndex: 200,
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    padding: "6px 14px 4px 14px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  Preset date ranges
                </div>
                {[
                  "Today: 13 Oct 2026",
                  "Yesterday: 12 Oct 2026",
                  "Last 7 days: 06 Oct 2026 - 12 Oct 2026",
                  "Last 14 days: 29 Sep 2026 - 12 Oct 2026",
                  "Last 30 days: 13 Sep 2026 - 12 Oct 2026",
                  "This month: 01 Oct 2026 - 13 Oct 2026",
                  "Last month: 01 Sep 2026 - 30 Sep 2026",
                  "Maximum / Lifetime",
                ].map((range) => {
                  const isSelected = dateRangeLabel === range;
                  return (
                    <button
                      key={range}
                      type="button"
                      onClick={() => {
                        setDateRangeLabel(range);
                        setDatePickerOpen(false);
                        showToast(`Date range set to "${range}".`, "info");
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 14px",
                        background: isSelected ? "#eff6ff" : "transparent",
                        border: "none",
                        fontSize: "0.82rem",
                        color: isSelected ? "#0064e1" : "#1e293b",
                        fontWeight: isSelected ? 600 : 450,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span>{range}</span>
                      {isSelected && <Check size={14} color="#0064e1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 3. ACTION TOOLBAR (Matching Images 1, 2, 3) ─── */}
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
        {/* Left Action Buttons: + Create | Duplicate | Edit | Analyse | A/B test | More ▾ */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          {/* + Create (Solid Dark Green Button) */}
          <button
            type="button"
            onClick={onOpenCreateAd}
            title="Create a new ad"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              background: "#008060",
              color: "#ffffff",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0, 128, 96, 0.25)",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#006e52")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#008060")}
          >
            <Plus size={16} strokeWidth={2.8} />
            <span>Create</span>
          </button>

          {/* Duplicate Button */}
          <button
            type="button"
            onClick={() => setDuplicateModalOpen(true)}
            title="Duplicate selected ad(s)"
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
            <MetaDuplicateIcon size={14} color="#4b4f56" />
            <span>Duplicate</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => {
              const target = displayedAds.find((a) => selectedAdIds.includes(a.id)) || displayedAds[0];
              if (target && onOpenEditorForAd) onOpenEditorForAd(target);
            }}
            title="Edit selected ad"
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
            <MetaEditIcon size={13} color="#4b4f56" />
            <span>Edit</span>
          </button>

          {/* More ▾ Button */}
          <div style={{ position: "relative" }} ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setMoreMenuOpen((prev) => !prev)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: moreMenuOpen ? "#f1f5f9" : "#ffffff",
                color: "#334155",
                fontSize: "0.82rem",
                fontWeight: 550,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!moreMenuOpen) e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (!moreMenuOpen) e.currentTarget.style.background = "#ffffff";
              }}
            >
              <span>More</span>
              <MetaCaretDown size={7} color="#1c1e21" />
            </button>

            {moreMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 5px)",
                  left: 0,
                  width: 220,
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 200,
                  padding: "6px 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleBatchTurn(true)}
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
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
                  <span>Turn on selected ads</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchTurn(false)}
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
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8" }} />
                  <span>Turn off selected ads</span>
                </button>
                <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    background: "transparent",
                    border: "none",
                    fontSize: "0.82rem",
                    color: "#dc2626",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Trash2 size={13} color="#dc2626" />
                  <span>Delete selected ads</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Controls: Columns ▾ | Breakdown ▾ | Reports ▾ | Export ▾ | Chart 🔲 */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          {/* Columns: Copy of Performance ▾ */}
          <div style={{ position: "relative" }} ref={columnsRef}>
            <button
              type="button"
              onClick={() => setColumnsMenuOpen((prev) => !prev)}
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
              <span>Columns: {selectedColumnPreset}</span>
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
                  boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
                  zIndex: 200,
                  padding: "6px 0",
                  maxHeight: 380,
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    padding: "6px 14px 4px 14px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  Column presets
                </div>
                {[
                  "Copy of Performance",
                  "Performance",
                  "Setup",
                  "Delivery",
                  "Engagement",
                  "Video Engagement",
                  "Performance and Clicks",
                  "Targeting and Creative",
                  "Custom",
                ].map((preset) => {
                  const isActive = selectedColumnPreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSelectedColumnPreset(preset);
                        setColumnsMenuOpen(false);
                        showToast(`Columns set to "${preset}".`, "info");
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
                <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                <button
                  type="button"
                  onClick={() => {
                    setColumnsMenuOpen(false);
                    setColumnCustomizerModalOpen(true);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 14px",
                    background: "transparent",
                    border: "none",
                    fontSize: "0.82rem",
                    color: "#0064e1",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Sliders size={13} color="#0064e1" />
                  <span>Customize columns...</span>
                </button>
              </div>
            )}
          </div>

          {/* Breakdown ▾ */}
          <div style={{ position: "relative" }} ref={breakdownRef}>
            <button
              type="button"
              onClick={() => setBreakdownMenuOpen((prev) => !prev)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: breakdownMenuOpen ? "#f1f5f9" : "#ffffff",
                color: "#1c1e21",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!breakdownMenuOpen) e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (!breakdownMenuOpen) e.currentTarget.style.background = "#ffffff";
              }}
            >
              <MetaBreakdownIcon size={13} color="#1c1e21" />
              <span>Breakdown{selectedBreakdown ? `: ${selectedBreakdown}` : ""}</span>
              <MetaCaretDown size={7} color="#1c1e21" />
            </button>

            {breakdownMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 5px)",
                  right: 0,
                  width: 240,
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
                  zIndex: 200,
                  padding: "6px 0",
                  maxHeight: 360,
                  overflowY: "auto",
                }}
              >
                <div style={{ padding: "6px 14px 2px 14px", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  By Time
                </div>
                {["Day", "Week", "2 Weeks", "Month"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSelectedBreakdown(item);
                      setBreakdownMenuOpen(false);
                      showToast(`Breakdown applied: ${item}`, "info");
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 14px",
                      background: selectedBreakdown === item ? "#eff6ff" : "transparent",
                      border: "none",
                      fontSize: "0.82rem",
                      color: selectedBreakdown === item ? "#0064e1" : "#1e293b",
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                ))}
                <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                <div style={{ padding: "6px 14px 2px 14px", fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  By Delivery
                </div>
                {["Age", "Gender", "Country", "Region", "Placement", "Impression Device"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSelectedBreakdown(item);
                      setBreakdownMenuOpen(false);
                      showToast(`Breakdown applied: ${item}`, "info");
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 14px",
                      background: selectedBreakdown === item ? "#eff6ff" : "transparent",
                      border: "none",
                      fontSize: "0.82rem",
                      color: selectedBreakdown === item ? "#0064e1" : "#1e293b",
                      cursor: "pointer",
                    }}
                  >
                    {item}
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
                        showToast("Breakdown cleared.", "info");
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "6px 14px",
                        background: "transparent",
                        border: "none",
                        fontSize: "0.82rem",
                        color: "#dc2626",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Clear breakdown
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reports ▾ */}
          <div style={{ position: "relative" }} ref={reportsRef}>
            <button
              type="button"
              onClick={() => setReportsMenuOpen((prev) => !prev)}
              title="Reports & layouts"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: reportsMenuOpen ? "#f1f5f9" : "#ffffff",
                color: "#1c1e21",
                cursor: "pointer",
              }}
            >
              <MetaReportsIcon size={14} color="#1c1e21" />
              <MetaCaretDown size={7} color="#1c1e21" />
            </button>
            {reportsMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 5px)",
                  right: 0,
                  width: 200,
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 200,
                  padding: "6px 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setReportsMenuOpen(false);
                    showToast("Exporting comprehensive campaign report...", "info");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 14px",
                    background: "transparent",
                    border: "none",
                    fontSize: "0.82rem",
                    color: "#1e293b",
                    cursor: "pointer",
                  }}
                >
                  Create custom report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportsMenuOpen(false);
                    showToast("Automated daily summary report scheduled.", "success");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 14px",
                    background: "transparent",
                    border: "none",
                    fontSize: "0.82rem",
                    color: "#1e293b",
                    cursor: "pointer",
                  }}
                >
                  Schedule report emails
                </button>
              </div>
            )}
          </div>

          {/* Export ▾ */}
          <div style={{ position: "relative" }} ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportMenuOpen((prev) => !prev)}
              title="Export data"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: exportMenuOpen ? "#f1f5f9" : "#ffffff",
                color: "#1c1e21",
                cursor: "pointer",
              }}
            >
              <MetaDownloadTrayIcon size={14} color="#1c1e21" />
              <MetaCaretDown size={7} color="#1c1e21" />
            </button>
            {exportMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 5px)",
                  right: 0,
                  width: 180,
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 200,
                  padding: "6px 0",
                }}
              >
                <button
                  type="button"
                  onClick={handleExportCSV}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 14px",
                    background: "transparent",
                    border: "none",
                    fontSize: "0.82rem",
                    color: "#1e293b",
                    cursor: "pointer",
                  }}
                >
                  Export all to CSV
                </button>
              </div>
            )}
          </div>

          {/* Chart View Toggle 🔲 */}
          <button
            type="button"
            onClick={() => {
              setActiveChartAd(displayedAds[0]);
              setChartsDrawerOpen((prev) => !prev);
            }}
            title="Toggle insights chart drawer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              background: chartsDrawerOpen ? "#eff6ff" : "#ffffff",
              color: chartsDrawerOpen ? "#0064e1" : "#1c1e21",
              cursor: "pointer",
            }}
          >
            <MetaViewChartsIcon size={14} color={chartsDrawerOpen ? "#0064e1" : "#1c1e21"} />
          </button>
        </div>
      </div>

      {/* ─── 4. FULL 20-COLUMN META ADS TABLE (Matching Images 1, 2, 3) ─── */}
      <div
        style={{
          width: "100%",
          overflowX: "auto",
          background: "#ffffff",
          position: "relative",
          maxHeight: "calc(100vh - 280px)",
          overflowY: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            minWidth: 2600,
            fontSize: "0.82rem",
          }}
        >
          {/* ─── TABLE HEADER ─── */}
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {/* 1. Master Checkbox (Sticky Left: 0) */}
              <th
                style={{
                  ...thStyle,
                  width: 44,
                  minWidth: 44,
                  position: "sticky",
                  left: 0,
                  zIndex: 4,
                  borderRight: "1px solid #e2e8f0",
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  style={{ cursor: "pointer", width: 15, height: 15 }}
                />
              </th>

              {/* 2. Off... ↑↓ (Sticky Left: 44px) */}
              <th
                style={{
                  ...thStyle,
                  width: 70,
                  minWidth: 70,
                  position: "sticky",
                  left: 44,
                  zIndex: 4,
                  borderRight: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("active")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Off...</span>
                  <ArrowUpDown size={11} color="#64748b" />
                </div>
              </th>

              {/* 3. Ad ↑↓ ▾ (Sticky Left: 114px, Right Divider with Shadow) */}
              <th
                style={{
                  ...thStyle,
                  width: 320,
                  minWidth: 320,
                  position: "sticky",
                  left: 114,
                  zIndex: 4,
                  borderRight: "1px solid #cbd5e1",
                  boxShadow: "3px 0 6px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#1c1e21", cursor: "pointer" }} onClick={() => handleSort("name")}>
                    Ad
                  </span>
                  <ArrowUpDown size={11} color="#64748b" onClick={() => handleSort("name")} style={{ cursor: "pointer" }} />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 4. Delivery ↓ ▾ (Blue Text with Down Arrow, matching Image 1) */}
              <th
                style={{
                  ...thStyle,
                  minWidth: 130,
                  cursor: "pointer",
                }}
                onClick={() => handleSort("delivery")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ color: "#0064e1", fontWeight: 700 }}>Delivery</span>
                  <ArrowDown size={11} color="#0064e1" />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 5. Actions ▾ */}
              <th style={{ ...thStyle, minWidth: 120 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Actions</span>
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 6. Attribution setting ▾ */}
              <th style={{ ...thStyle, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Attribution setting</span>
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 7. Results ↑↓ ▾ */}
              <th style={{ ...thStyle, minWidth: 120, cursor: "pointer" }} onClick={() => handleSort("results")}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Results</span>
                  <ArrowUpDown size={11} color="#64748b" />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 8. Cost per result ↑↓ ▾ */}
              <th style={{ ...thStyle, minWidth: 140, cursor: "pointer" }} onClick={() => handleSort("costPerResult")}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Cost per result</span>
                  <ArrowUpDown size={11} color="#64748b" />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 9. Budget (Ad set) ▾ (Image 1 & 2) */}
              <th style={{ ...thStyle, minWidth: 160, cursor: "pointer" }} onClick={() => handleSort("budget")}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div>Budget</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>Ad set</div>
                  </div>
                  <ChevronDown size={11} color="#64748b" style={{ marginTop: 2 }} />
                </div>
              </th>

              {/* 10. Amount spent ↑↓ ▾ */}
              <th style={{ ...thStyle, minWidth: 140, cursor: "pointer" }} onClick={() => handleSort("amountSpent")}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Amount spent</span>
                  <ArrowUpDown size={11} color="#64748b" />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 11. Impressions ↑↓ ▾ */}
              <th style={{ ...thStyle, minWidth: 130, cursor: "pointer" }} onClick={() => handleSort("impressions")}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Impressions</span>
                  <ArrowUpDown size={11} color="#64748b" />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 12. Reach ↑↓ ▾ */}
              <th style={{ ...thStyle, minWidth: 120, cursor: "pointer" }} onClick={() => handleSort("reach")}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Reach</span>
                  <ArrowUpDown size={11} color="#64748b" />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 13. Ends ↑↓ ▾ */}
              <th style={{ ...thStyle, minWidth: 120, cursor: "pointer" }} onClick={() => handleSort("ends")}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Ends</span>
                  <ArrowUpDown size={11} color="#64748b" />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 14. Bid strategy (Ad set) ▾ (Image 2 & 3) */}
              <th style={{ ...thStyle, minWidth: 170 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div>Bid strategy</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>Ad set</div>
                  </div>
                  <ChevronDown size={11} color="#64748b" style={{ marginTop: 2 }} />
                </div>
              </th>

              {/* 15. Last edit */}
              <th style={{ ...thStyle, minWidth: 110 }}>
                <span>Last edit</span>
              </th>

              {/* 16. Last significant edit ▾ */}
              <th style={{ ...thStyle, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Last significant edit</span>
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 17. Quality ranking (Ad relevance...) (Image 3) */}
              <th style={{ ...thStyle, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div>Quality ranking</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>Ad relevance...</div>
                  </div>
                  <ArrowUpDown size={11} color="#64748b" style={{ marginTop: 2 }} />
                </div>
              </th>

              {/* 18. Engage... rate... (Ad relevance...) (Image 3) */}
              <th style={{ ...thStyle, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div>Engage... rate...</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>Ad relevance...</div>
                  </div>
                  <ArrowUpDown size={11} color="#64748b" style={{ marginTop: 2 }} />
                </div>
              </th>

              {/* 19. Conver... rate... (Ad relevance...) (Image 3) */}
              <th style={{ ...thStyle, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div>Conver... rate...</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>Ad relevance...</div>
                  </div>
                  <ArrowUpDown size={11} color="#64748b" style={{ marginTop: 2 }} />
                </div>
              </th>

              {/* 20. Ad set name ↑↓ ▾ (Image 3) */}
              <th style={{ ...thStyle, minWidth: 230, cursor: "pointer" }} onClick={() => handleSort("adsetName")}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span>Ad set name</span>
                  <ArrowUpDown size={11} color="#64748b" />
                  <ChevronDown size={11} color="#64748b" style={{ marginLeft: "auto" }} />
                </div>
              </th>

              {/* 21. Customize columns (+) Button */}
              <th
                style={{
                  ...thStyle,
                  width: 44,
                  minWidth: 44,
                  textAlign: "center",
                  padding: "6px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setColumnCustomizerModalOpen(true)}
                  title="Customize columns"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: 0,
                  }}
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </th>
            </tr>
          </thead>

          {/* ─── TABLE BODY ROWS ─── */}
          <tbody>
            {loading && effectiveAds.length === 0 ? (
              <tr>
                <td colSpan={21} style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <RefreshCw size={26} className="animate-spin" color="#0064e1" style={{ animation: "spin 0.8s linear infinite" }} />
                    <div style={{ fontSize: "0.98rem", fontWeight: 600, color: "#1e293b" }}>Loading ads from Meta Marketing API...</div>
                    <div style={{ fontSize: "0.83rem", color: "#64748b" }}>Fetching live creatives and ad metrics</div>
                  </div>
                </td>
              </tr>
            ) : displayedAds.length === 0 ? (
              <tr>
                <td colSpan={21} style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <Search size={40} color="#94a3b8" />
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1e293b" }}>No ads found</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Try clearing your search query.</div>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#f1f5f9",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              displayedAds.map((ad, idx) => {
                const isSelected = selectedAdIds.includes(ad.id);
                const isHovered = hoveredRowId === ad.id || openRowMenuId === ad.id;

                // Subtle mint/green tint from Images 1, 2, 3
                const rowBg = isSelected
                  ? (isHovered ? "#d4ede0" : "#dcf1e6")
                  : (isHovered ? "#e2f2ea" : "#edf7f2");

                return (
                  <tr
                    key={ad.id}
                    onMouseEnter={() => setHoveredRowId(ad.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    style={{
                      background: rowBg,
                      transition: "background 0.12s ease",
                    }}
                  >
                    {/* 1. Checkbox (Sticky Left: 0) */}
                    <td
                      style={{
                        ...tdStyle,
                        width: 44,
                        minWidth: 44,
                        position: "sticky",
                        left: 0,
                        zIndex: 3,
                        background: rowBg,
                        borderRight: "1px solid #e2e8f0",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectAd(ad.id)}
                        style={{ cursor: "pointer", width: 15, height: 15 }}
                      />
                    </td>

                    {/* 2. Off... Toggle (Sticky Left: 44px) */}
                    <td
                      style={{
                        ...tdStyle,
                        width: 70,
                        minWidth: 70,
                        position: "sticky",
                        left: 44,
                        zIndex: 3,
                        background: rowBg,
                        borderRight: "1px solid #e2e8f0",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleDelivery(ad)}
                        title={ad.active ? "Turn ad off" : "Turn ad on"}
                        style={{
                          width: 32,
                          height: 18,
                          borderRadius: 9,
                          background: ad.active ? "#0064e1" : "#cbd5e1",
                          border: "none",
                          padding: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: ad.active ? "flex-end" : "flex-start",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          outline: "none",
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "#ffffff",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                          }}
                        />
                      </button>
                    </td>

                    {/* 3. Ad Thumbnail & Name (Sticky Left: 114px, Divider with Shadow) */}
                    <td
                      style={{
                        ...tdStyle,
                        width: 320,
                        minWidth: 320,
                        position: "sticky",
                        left: 114,
                        zIndex: 3,
                        background: rowBg,
                        borderRight: "1px solid #cbd5e1",
                        boxShadow: "3px 0 6px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        {renderThumbnail(ad)}

                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                          {inlineEditing && inlineEditing.id === ad.id ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                autoFocus
                                value={inlineEditing.name}
                                onChange={(e) => setInlineEditing((prev) => ({ ...prev, name: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveInlineRename(ad.id);
                                  if (e.key === "Escape") setInlineEditing(null);
                                }}
                                style={{
                                  padding: "2px 6px",
                                  fontSize: "0.82rem",
                                  borderRadius: 4,
                                  border: "1px solid #0064e1",
                                  outline: "none",
                                  minWidth: 160,
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveInlineRename(ad.id)}
                                style={{
                                  background: "#0064e1",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: 4,
                                  padding: "3px 6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Check size={11} strokeWidth={2.5} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setInlineEditing(null)}
                                style={{
                                  background: "#f1f5f9",
                                  color: "#64748b",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: 4,
                                  padding: "3px 6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <X size={11} strokeWidth={2} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, maxWidth: "100%" }}>
                              <span
                                onClick={() => onOpenEditorForAd && onOpenEditorForAd(ad)}
                                title={ad.name}
                                style={{
                                  color: "#1c1e21",
                                  fontWeight: 600,
                                  fontSize: "0.83rem",
                                  cursor: "pointer",
                                  maxWidth: 240,
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
                              {pinnedAdIds.has(ad.id) && (
                                <span title="Pinned ad" style={{ display: "inline-flex", alignItems: "center" }}>
                                  <Pin size={11} color="#0064e1" style={{ transform: "rotate(45deg)", flexShrink: 0 }} />
                                </span>
                              )}

                              {/* Inline rename pencil */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInlineEditing({ id: ad.id, name: ad.name });
                                }}
                                title="Edit ad name"
                                style={{
                                  opacity: isHovered ? 1 : 0,
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "2px 4px",
                                  borderRadius: 4,
                                  color: "#64748b",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "opacity 0.15s ease",
                                }}
                              >
                                <Edit2 size={11} strokeWidth={2} />
                              </button>
                            </div>
                          )}

                          {/* Image 2 Real Meta Ads Manager Row Action Pills: Publish | Edit | Duplicate | ••• */}
                          {(isHovered || isSelected) && !inlineEditing && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                marginTop: 4,
                                flexWrap: "nowrap",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >

                              {/* 2. Edit (Image 2) */}
                              <button
                                type="button"
                                title="Edit in Meta editor"
                                onClick={() => onOpenEditorForAd && onOpenEditorForAd(ad)}
                                style={pillBtnStyle}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#f1f5f9";
                                  e.currentTarget.style.borderColor = "#94a3b8";
                                  e.currentTarget.style.color = "#0f172a";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "#ffffff";
                                  e.currentTarget.style.borderColor = "#cbd5e1";
                                  e.currentTarget.style.color = "#334155";
                                }}
                              >
                                <Edit2 size={11} strokeWidth={2.2} />
                                <span>Edit</span>
                              </button>

                              {/* 3. Duplicate (Image 2) */}
                              <button
                                type="button"
                                title="Quick duplicate"
                                onClick={() => {
                                  setSelectedAdIds([ad.id]);
                                  handleExecuteDuplicate(1);
                                }}
                                style={pillBtnStyle}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#f1f5f9";
                                  e.currentTarget.style.borderColor = "#94a3b8";
                                  e.currentTarget.style.color = "#0f172a";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "#ffffff";
                                  e.currentTarget.style.borderColor = "#cbd5e1";
                                  e.currentTarget.style.color = "#334155";
                                }}
                              >
                                <Copy size={11} strokeWidth={2} />
                                <span>Duplicate</span>
                              </button>

                              {/* 4. More (Image 2: •••) */}
                              <div style={{ position: "relative" }} className="meta-row-actions-more-dropdown">
                                <button
                                  type="button"
                                  title="More actions"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (openRowMenuId === ad.id) {
                                      setOpenRowMenuId(null);
                                      setRowMenuCoords(null);
                                      setActiveRowMenuAd(null);
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setOpenRowMenuId(ad.id);
                                      setRowMenuCoords({
                                        top: rect.top,
                                        bottom: rect.bottom,
                                        left: rect.left,
                                        right: rect.right,
                                      });
                                      setActiveRowMenuAd(ad);
                                    }
                                  }}
                                  style={{
                                    ...pillBtnStyle,
                                    padding: "2px 6px",
                                    background: openRowMenuId === ad.id ? "#f1f5f9" : "#ffffff",
                                    borderColor: openRowMenuId === ad.id ? "#94a3b8" : "#cbd5e1",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#f1f5f9";
                                    e.currentTarget.style.borderColor = "#94a3b8";
                                    e.currentTarget.style.color = "#0f172a";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (openRowMenuId !== ad.id) {
                                      e.currentTarget.style.background = "#ffffff";
                                      e.currentTarget.style.borderColor = "#cbd5e1";
                                      e.currentTarget.style.color = "#334155";
                                    }
                                  }}
                                >
                                  <MoreHorizontal size={13} strokeWidth={2.4} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 4. Delivery (Real Meta status indicator) */}
                    <td style={tdStyle}>
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
                                  background: "#16a34a",
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
                                  border: "2px solid #16a34a",
                                  background: "transparent",
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                            );
                          }
                          if (d.includes("error") || d.includes("off") || d.includes("completed") || d.includes("paused")) {
                            return (
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: "#94a3b8",
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
                                border: "2px solid #cbd5e1",
                                background: "transparent",
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            />
                          );
                        })()}
                        <span style={{ color: "#334155", fontWeight: 500 }}>{ad.delivery}</span>
                      </div>
                    </td>

                    {/* 5. Actions */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>{ad.actions || "—"}</td>

                    {/* 6. Attribution setting */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>
                      <div>
                        <div style={{ color: "#334155" }}>{ad.attribution || "7-day click or 1-day view"}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.attributionSub || "All conversions"}</div>
                      </div>
                    </td>

                    {/* 7. Results */}
                    <td style={tdStyle}>
                      <div>
                        <div style={{ color: ad.results !== "—" ? "#0f172a" : "#64748b", fontWeight: ad.results !== "—" ? 600 : 400 }}>
                          {ad.results || "—"}
                        </div>
                        {ad.resultsSub && (
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.resultsSub}</div>
                        )}
                      </div>
                    </td>

                    {/* 8. Cost per result */}
                    <td style={tdStyle}>
                      <div>
                        <div style={{ color: ad.costPerResult !== "—" ? "#0f172a" : "#64748b", fontWeight: ad.costPerResult !== "—" ? 600 : 400 }}>
                          {ad.costPerResult || "—"}
                        </div>
                        {ad.costPerResultSub && (
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.costPerResultSub}</div>
                        )}
                      </div>
                    </td>

                    {/* 9. Budget (Ad set) */}
                    <td style={tdStyle}>
                      <div>
                        <div style={{ color: "#0f172a", fontWeight: 500 }}>{ad.budget}</div>
                        {ad.budgetSub && (
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.budgetSub}</div>
                        )}
                      </div>
                    </td>

                    {/* 10. Amount spent */}
                    <td style={{ ...tdStyle, color: ad.amountSpent !== "—" ? "#0f172a" : "#64748b", fontWeight: ad.amountSpent !== "—" && ad.amountSpent !== "₹0.00" ? 600 : 400 }}>
                      {ad.amountSpent || "—"}
                    </td>

                    {/* 11. Impressions */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>{ad.impressions || "—"}</td>

                    {/* 12. Reach */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>{ad.reach || "—"}</td>

                    {/* 13. Ends */}
                    <td style={{ ...tdStyle, color: "#334155" }}>{ad.ends || "Ongoing"}</td>

                    {/* 14. Bid strategy (Ad set) */}
                    <td style={tdStyle}>
                      <div>
                        <div style={{ color: "#0f172a", fontWeight: 500 }}>{ad.bidStrategy || "Highest volume"}</div>
                        {ad.bidStrategySub && (
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.bidStrategySub}</div>
                        )}
                      </div>
                    </td>

                    {/* 15. Last edit */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>{ad.lastEdit || "—"}</td>

                    {/* 16. Last significant edit */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>{ad.lastSignificantEdit || "—"}</td>

                    {/* 17. Quality ranking */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>{ad.qualityRanking || "—"}</td>

                    {/* 18. Engagement rate ranking */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>{ad.engagementRanking || "—"}</td>

                    {/* 19. Conversion rate ranking */}
                    <td style={{ ...tdStyle, color: "#64748b" }}>{ad.conversionRanking || "—"}</td>

                    {/* 20. Ad set name (Blue clickable link to jump to Ad sets tab!) */}
                    <td style={tdStyle}>
                      <div>
                        <div
                          onClick={() => onNavigateToAdset && onNavigateToAdset(ad.adsetName)}
                          title={`Go to ${ad.adsetName} in Ad sets`}
                          style={{
                            color: "#0064e1",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          {ad.adsetName}
                        </div>
                        {(ad.adsetSubtitle || ad.activeAdsCount) && (
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.adsetSubtitle || ad.activeAdsCount}</div>
                        )}
                      </div>
                    </td>

                    {/* 21. Spacer */}
                    <td style={tdStyle} />
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── 5. TABLE FOOTER (Results from 13 ads ℹ️) ─── */}
      <div
        style={{
          padding: "10px 18px",
          background: "#ffffff",
          borderTop: "1px solid #cbd5e1",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.82rem",
          color: "#475569",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }} ref={infoTooltipRef}>
          <span style={{ fontWeight: 550, color: "#1e293b" }}>
            Results from {displayedAds.length} {displayedAds.length === 1 ? "ad" : "ads"}
          </span>
          <button
            type="button"
            onClick={() => setInfoTooltipOpen((prev) => !prev)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Info size={14} color="#64748b" />
          </button>

          {infoTooltipOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: 0,
                width: 320,
                background: "#0f172a",
                color: "#ffffff",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: "0.78rem",
                lineHeight: 1.45,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                zIndex: 300,
              }}
            >
              Metrics reflect reporting data for the selected date range: <strong>{dateRangeLabel}</strong>. Attribution model: 7-day click or 1-day view.
            </div>
          )}
        </div>

        <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
          Showing all 20 columns matching Meta Ads Manager
        </div>
      </div>

      {/* ─── 6. FLOATING ADVANTAGE+ / OPPORTUNITY SCORE PURPLE BUTTON (Images 1, 2, 3) ─── */}
      <button
        type="button"
        onClick={() => setOpportunityScoreOpen(true)}
        title="Meta Advantage+ and Opportunity Recommendations"
        style={{
          position: "fixed",
          bottom: 24,
          right: 28,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #c084fc 100%)",
          border: "none",
          boxShadow: "0 4px 16px rgba(147, 51, 234, 0.4), 0 2px 6px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(147, 51, 234, 0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(147, 51, 234, 0.4)";
        }}
      >
        <Sparkles size={22} color="#ffffff" />
      </button>

      {/* ─── 7. MODALS & DRAWERS ─── */}

      {/* Column Customizer Modal */}
      {columnCustomizerModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 580,
              maxWidth: "92vw",
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
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
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                Customize columns
              </div>
              <button
                type="button"
                onClick={() => setColumnCustomizerModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "16px 20px", maxHeight: 380, overflowY: "auto" }}>
              <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 12 }}>
                Select the metrics and columns to display in your Ads table.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.keys(visibleColumns).map((colKey) => (
                  <label
                    key={colKey}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "0.84rem",
                      color: "#1e293b",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[colKey]}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, [colKey]: e.target.checked }))
                      }
                    />
                    <span style={{ textTransform: "capitalize" }}>
                      {colKey.replace(/([A-Z])/g, " $1")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => setColumnCustomizerModalOpen(false)}
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
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setColumnCustomizerModalOpen(false);
                  showToast("Column preferences saved.", "success");
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
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {duplicateModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 440,
              maxWidth: "92vw",
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
              Duplicate ad
            </div>
            <div style={{ fontSize: "0.84rem", color: "#64748b", marginBottom: 16 }}>
              Choose how many copies of the selected ad you want to create.
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Number of copies:
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={duplicateCopies}
                onChange={(e) => setDuplicateCopies(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: "100%",
                  padding: "7px 12px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.86rem",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setDuplicateModalOpen(false)}
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
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDuplicate(duplicateCopies)}
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
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Performance Insights Drawer (Analyse Button) */}
      {chartsDrawerOpen && activeChartAd && (
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
                  {activeChartAd.name}
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: activeChartAd.active || activeChartAd.delivery === "Active" ? "#dcfce7" : "#f1f5f9",
                    color: activeChartAd.active || activeChartAd.delivery === "Active" ? "#16a34a" : "#64748b",
                  }}
                >
                  {activeChartAd.delivery || (activeChartAd.active ? "Active" : "In draft")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChartsDrawerOpen(false)}
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

          <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Primary KPI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Results
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {activeChartAd.results && activeChartAd.results !== "—" ? activeChartAd.results : "377 Clicks"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                  {activeChartAd.costPerResult && activeChartAd.costPerResult !== "—" ? `${activeChartAd.costPerResult} per result` : "₹0.67 per result"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Amount Spent
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {activeChartAd.amountSpent && activeChartAd.amountSpent !== "—" ? activeChartAd.amountSpent : "₹253.61"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                  Budget: {activeChartAd.budget || "₹200.00 Daily"}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Reach
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {activeChartAd.reach && activeChartAd.reach !== "—" ? activeChartAd.reach : "19,250"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#16a34a", marginTop: 2 }}>
                  ↑ 12.4% vs previous period
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>
                  Impressions
                </div>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                  {activeChartAd.impressions && activeChartAd.impressions !== "—" ? activeChartAd.impressions : "24,800"}
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                  Frequency: 1.29
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
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>2.14%</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>CPC (Cost)</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>₹0.67</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>CPM</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>₹10.22</div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Frequency</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>1.29</div>
              </div>
            </div>

            {/* SVG Interactive Trend Chart */}
            <div style={{ padding: "16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#ffffff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>Ad Performance Trend</span>
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
                  <linearGradient id="adChartBlueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0064e1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0064e1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 10 110 L 60 90 L 120 70 L 180 80 L 240 45 L 300 60 L 360 25 L 420 35 L 450 20 L 450 110 Z" fill="url(#adChartBlueGrad)" />
                <path d="M 10 110 L 60 90 L 120 70 L 180 80 L 240 45 L 300 60 L 360 25 L 420 35 L 450 20" fill="none" stroke="#0064e1" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 10 115 L 60 100 L 120 85 L 180 90 L 240 65 L 300 75 L 360 50 L 420 55 L 450 40" fill="none" stroke="#9333ea" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                {[
                  { cx: 60, cy: 90 },
                  { cx: 120, cy: 70 },
                  { cx: 180, cy: 80 },
                  { cx: 240, cy: 45 },
                  { cx: 300, cy: 60 },
                  { cx: 360, cy: 25 },
                  { cx: 420, cy: 35 },
                  { cx: 450, cy: 20 },
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
                  { age: "18-24", pct: 32, male: 14, female: 18 },
                  { age: "25-34", pct: 46, male: 22, female: 24 },
                  { age: "35-44", pct: 14, male: 6, female: 8 },
                  { age: "45+", pct: 8, male: 3, female: 5 },
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
                Switching to Advantage+ placement could reduce cost per result by up to 14% based on similar ad campaigns.
              </div>
              <button
                type="button"
                onClick={() => {
                  if (showToast) showToast("Applied Meta Advantage+ recommendation to this ad.", "success");
                }}
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

            <button
              type="button"
              onClick={() => {
                setChartsDrawerOpen(false);
                onOpenEditorForAd && onOpenEditorForAd(activeChartAd);
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
              Open Full Ad Editor
            </button>
          </div>
        </div>
      )}

      {/* Meta Advantage+ Opportunity Score Drawer */}
      {opportunityScoreOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 440,
            maxWidth: "92vw",
            background: "#ffffff",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.18)",
            zIndex: 1050,
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={20} color="#9333ea" />
              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#581c87" }}>
                  Advantage+ Recommendations
                </div>
                <div style={{ fontSize: "0.76rem", color: "#7e22ce" }}>Meta AI optimization score: 92/100</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpportunityScoreOpen(false)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
            {[
              {
                title: "Expand Instagram Reel Placements",
                desc: "Turn on Reels placement to capture higher engagement at lower CPMs across active ads.",
                impact: "+8 pts to score",
              },
              {
                title: "Enable Automatic Creative Enhancements",
                desc: "Let Meta AI adjust aspect ratios, lighting, and music dynamically per viewer.",
                impact: "+5 pts to score",
              },
              {
                title: "Redistribute Underperforming Budget",
                desc: "Automatically shift budget to top performing ads within your active ad sets.",
                impact: "+7 pts to score",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "14px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>{item.title}</div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 6px", borderRadius: 4 }}>
                    {item.impact}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.45, marginBottom: 10 }}>
                  {item.desc}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Applied recommendation: "${item.title}".`, "success");
                  }}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 5,
                    border: "none",
                    background: "#0064e1",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Apply recommendation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ad Quick Preview Modal */}
      {previewAdModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 440,
              maxWidth: "92vw",
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                Ad Preview
              </div>
              <button
                type="button"
                onClick={() => setPreviewAdModal(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              {renderThumbnail(previewAdModal)}
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{previewAdModal.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{previewAdModal.adsetName}</div>
              </div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "14px", border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#334155", lineHeight: 1.5, marginBottom: 18 }}>
              <div><strong>Status:</strong> {previewAdModal.delivery}</div>
              <div><strong>Bid Strategy:</strong> {previewAdModal.bidStrategy} ({previewAdModal.bidStrategySub})</div>
              <div><strong>Budget:</strong> {previewAdModal.budget} {previewAdModal.budgetSub}</div>
              <div><strong>Attribution:</strong> {previewAdModal.attribution}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setPreviewAdModal(null)}
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
                  const target = previewAdModal;
                  setPreviewAdModal(null);
                  onOpenEditorForAd && onOpenEditorForAd(target);
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

      {/* ─── IMAGE 2 EXACT FORM PORTAL DROPDOWN (ANALYSE | PIN | VIEW HISTORY | RULES) ─── */}
      {typeof document !== "undefined" && openRowMenuId && rowMenuCoords && activeRowMenuAd &&
        createPortal(
          <div
            ref={rowMenuPortalRef}
            style={{
              position: "fixed",
              top: getMenuPosition().top,
              left: getMenuPosition().left,
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
              onClick={() => handleTriggerAnalyse(activeRowMenuAd)}
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
              onClick={() => handleTriggerPin(activeRowMenuAd)}
              style={rowMenuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Pin size={15} color="#1c1e21" style={{ transform: "rotate(45deg)" }} />
              <span>{pinnedAdIds.has(activeRowMenuAd.id) ? "Unpin" : "Pin"}</span>
            </button>

            {/* 3. View history (Image 2: Clock icon) */}
            <button
              type="button"
              onClick={() => handleTriggerViewHistory(activeRowMenuAd)}
              style={rowMenuItemStyle}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Clock size={15} color="#1c1e21" strokeWidth={1.8} />
              <span>View history</span>
            </button>

          </div>,
          document.body
        )
      }

      {/* ─── META ADS MANAGER VIEW HISTORY DRAWER ─── */}
      {viewHistoryDrawerOpen && viewHistoryAd && (
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
                {viewHistoryAd.name} • ID: {viewHistoryAd.id}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setViewHistoryDrawerOpen(false);
                setViewHistoryAd(null);
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
              { id: "creative", label: "Creative" },
              { id: "targeting", label: "Targeting" },
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
                  title: "Ad delivery status updated",
                  author: "Adstra Marketing Admin",
                  time: "Today at 10:14 AM",
                  badge: "Status",
                  badgeColor: "#16a34a",
                  badgeBg: "#dcfce7",
                  desc: "Delivery changed from In draft to Active.",
                  beforeAfter: { before: "In draft", after: "Active" },
                },
                {
                  id: "hist-2",
                  type: "creative",
                  title: "Creative copy & text headline updated",
                  author: "Adstra Marketing Admin",
                  time: "Yesterday at 4:25 PM",
                  badge: "Creative",
                  badgeColor: "#8b5cf6",
                  badgeBg: "#f3e8ff",
                  desc: "Updated primary text to highlight ROI comparison between Meta and Google Ads.",
                  beforeAfter: { before: "Old test draft", after: viewHistoryAd.name },
                },
                {
                  id: "hist-3",
                  type: "budget",
                  title: "Daily budget & bid strategy adjusted",
                  author: "Adstra Marketing Admin",
                  time: "12 Oct 2026 at 2:10 PM",
                  badge: "Budget",
                  badgeColor: "#0284c7",
                  badgeBg: "#e0f2fe",
                  desc: `Daily budget set to ${viewHistoryAd.budget || "₹200.00"}. Bid strategy set to ${viewHistoryAd.bidStrategy || "Highest volume"}.`,
                },
                {
                  id: "hist-4",
                  type: "targeting",
                  title: "Attribution window & audience placement applied",
                  author: "System (Adstra Engine)",
                  time: "10 Oct 2026 at 9:00 AM",
                  badge: "Targeting",
                  badgeColor: "#f59e0b",
                  badgeBg: "#fef3c7",
                  desc: "Attribution set to 7-day click or 1-day view. Advantage+ placement expansion turned on.",
                },
                {
                  id: "hist-5",
                  type: "status",
                  title: "Ad creative uploaded and created",
                  author: "Adstra Marketing Admin",
                  time: "08 Oct 2026 at 8:45 AM",
                  badge: "Created",
                  badgeColor: "#64748b",
                  badgeBg: "#f1f5f9",
                  desc: `Created under Ad set: "${viewHistoryAd.adsetName || "Traffic Campaign"}"`,
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
                if (showToast) showToast("Change history exported to CSV.", "success");
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
                setViewHistoryAd(null);
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

    </div>
  );
}
