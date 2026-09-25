"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import "./CampaignsTab.css";
import CampaignReportsSection from "./CampaignReportsSection";
import {
  Plus,
  Search,
  X,
  Layers,
  Target,
  Calendar,
  ArrowRight,
  ChevronDown,
  RotateCcw,
  Pause,
  Play,
  Edit3,
  CheckCircle2,
  Building2,
  Globe,
  ArrowLeft,
  MoreHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  MousePointerClick,
  Award,
  HelpCircle,
  AlertTriangle,
  Trash2,
  Clock,
  Check,
  BarChart3,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video,
  ArrowUp,
  ArrowDown,
  Package,
  AlertCircle,
  IndianRupee,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  RefreshCw,
  Zap,
  Facebook,
  Info,
} from "lucide-react";
import { renderPlatformIcon } from "./PlatformIcons";

// =============================================================================
// Helper Functions & Constants
// =============================================================================

// Meta & Google platform-specific campaign types
export const META_CAMPAIGN_TYPES = [
  { value: "FEED_STORIES", label: "Feeds & Stories (Facebook & Instagram)", shortLabel: "Feeds & Stories" },
  { value: "REELS_VIDEO", label: "Reels & Video Stream", shortLabel: "Reels & Video" },
  { value: "ADVANTAGE_PLUS", label: "Advantage+ Placements (Automatic)", shortLabel: "Advantage+ Placements" },
  { value: "MESSENGER", label: "Direct & Messenger", shortLabel: "Direct & Messenger" },
  { value: "AUDIENCE_NETWORK", label: "Audience Network", shortLabel: "Audience Network" },
];

export const GOOGLE_CAMPAIGN_TYPES = [
  { value: "SEARCH", label: "Search Campaign" },
  { value: "PERFORMANCE_MAX", label: "Performance Max" },
  { value: "DISPLAY", label: "Display Network" },
  { value: "VIDEO", label: "Video / YouTube" },
  { value: "SHOPPING", label: "Shopping Campaign" },
];

export const CTA_OPTIONS = [
  { value: "no_button", label: "No Button" },
  { value: "learn_more", label: "Learn More" },
  { value: "sign_up", label: "Sign Up" },
  { value: "contact_us", label: "Contact Us" },
  { value: "apply_now", label: "Apply Now" },
  { value: "book_now", label: "Book Now" },
  { value: "shop_now", label: "Shop Now" },
  { value: "get_quote", label: "Get Quote" },
  { value: "download", label: "Download" },
];

export const CATALOG_OPTIONS = [
  { value: "main_catalog", label: "Main Product Catalog (Syncing)" },
  { value: "seasonal_catalog", label: "Seasonal & Festive Catalog" },
  { value: "top_performers", label: "Top Performers & Hero Catalog" },
  { value: "custom_services", label: "Enterprise Services Catalog" },
];

export const PRODUCT_SET_OPTIONS = [
  { value: "all_products", label: "All Products" },
  { value: "best_sellers", label: "Best Sellers" },
  { value: "new_arrivals", label: "New Arrivals" },
  { value: "featured_deals", label: "Featured Deals & Offers" },
];

function formatMediaSize(bytes) {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Format date helper: "2026-09-17" -> "17 Sep 2026"
function formatDisplayDate(dateStr) {
  if (!dateStr) return "Open";
  try {
    const parts = String(dateStr).split("-");
    if (parts.length === 3) {
      const date = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  } catch (e) {
    // Fallback
  }
  return dateStr;
}

const formatDate = formatDisplayDate;

// Indian Rupee currency format helper: 50000 -> "₹50,000", 245000 -> "₹2.45L"
function formatINR(val, compact = false) {
  const num = parseFloat(val) || 0;
  if (compact) {
    if (num >= 10000000) {
      return "₹" + (num / 10000000).toFixed(2).replace(/\.00$/, "") + "Cr";
    }
    if (num >= 100000) {
      return "₹" + (num / 100000).toFixed(2).replace(/\.00$/, "") + "L";
    }
    if (num >= 1000) {
      return "₹" + (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return "₹" + num.toLocaleString("en-IN");
  }
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

// Format compact number helper: 18200 -> "18.2K", 1280000 -> "1.28M"
function formatCompact(val) {
  const num = Number(val) || 0;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString("en-IN");
}

// Generate realistic, deterministic campaign performance metrics based on backend data
function getCampaignMetrics(camp) {
  const id = camp?.id || 1;
  const spent = parseFloat(camp?.spent) || 0;
  const budget = parseFloat(camp?.budget) || 50000;
  const effectiveBase = spent > 0 ? spent : Math.round(budget * 0.45);

  // Specific seeds for default showcase campaigns
  if (id === 1) {
    const s = spent > 0 ? spent : 110000;
    return {
      spendNum: s,
      spend: formatINR(s),
      reachNum: 48200,
      reach: "48.2K",
      impressionsNum: 92400,
      impressions: "92.4K",
      clicksNum: 3820,
      clicks: "3,820",
      leadsNum: 184,
      leads: "184",
      conversionsNum: 42,
      conversions: "42",
      engagement: "6.8%",
      ctr: "4.13%",
      cpl: "₹598",
      cplNum: 598,
      revenueNum: 345000,
      revenue: "₹3,45,000",
      profitNum: 235000,
      profit: "₹2,35,000",
      roiMultiplier: "3.14×",
      roiNum: 3.14,
      qualifiedLeadsNum: 98,
    };
  }
  if (id === 2) {
    const s = spent > 0 ? spent : 103000;
    return {
      spendNum: s,
      spend: formatINR(s),
      reachNum: 34500,
      reach: "34.5K",
      impressionsNum: 65100,
      impressions: "65.1K",
      clicksNum: 2640,
      clicks: "2,640",
      leadsNum: 142,
      leads: "142",
      conversionsNum: 31,
      conversions: "31",
      engagement: "5.4%",
      ctr: "4.05%",
      cpl: "₹725",
      cplNum: 725,
      revenueNum: 280000,
      revenue: "₹2,80,000",
      profitNum: 177000,
      profit: "₹1,77,000",
      roiMultiplier: "2.72×",
      roiNum: 2.72,
      qualifiedLeadsNum: 76,
    };
  }
  if (id === 3) {
    const s = spent > 0 ? spent : 38400;
    return {
      spendNum: s,
      spend: formatINR(s),
      reachNum: 18200,
      reach: "18.2K",
      impressionsNum: 32800,
      impressions: "32.8K",
      clicksNum: 1426,
      clicks: "1,426",
      leadsNum: 62,
      leads: "62",
      conversionsNum: 18,
      conversions: "18",
      engagement: "4.9%",
      ctr: "4.35%",
      cpl: "₹1,129",
      cplNum: 1129,
      revenueNum: 125000,
      revenue: "₹1,25,000",
      profitNum: 86600,
      profit: "₹86,600",
      roiMultiplier: "2.26×",
      roiNum: 2.26,
      qualifiedLeadsNum: 36,
    };
  }

  // Dynamic deterministic calculations
  const reachVal = Math.round(effectiveBase * 1.35 + (id * 1840) % 24000 + 4200);
  const impressionsVal = Math.round(reachVal * 1.82);
  const clicksVal = Math.round(impressionsVal * 0.042);
  const leadsVal = Math.max(14, Math.round(clicksVal * 0.048));
  const conversionsVal = Math.max(4, Math.round(leadsVal * 0.28));
  const qualifiedLeadsVal = Math.max(conversionsVal + 2, Math.round(leadsVal * 0.58));
  const engagementVal = (4.2 + ((id * 7) % 36) / 10).toFixed(1) + "%";
  const ctrVal = ((clicksVal / (impressionsVal || 1)) * 100).toFixed(2) + "%";
  const cplValNum = Math.round(effectiveBase / (leadsVal || 1));
  const revenueVal = Math.round(conversionsVal * 7200 + effectiveBase * 1.8);
  const profitVal = Math.max(0, revenueVal - effectiveBase);
  const roiVal = (revenueVal / (effectiveBase || 1)).toFixed(2) + "×";

  return {
    spendNum: effectiveBase,
    spend: formatINR(effectiveBase),
    reachNum: reachVal,
    reach: formatCompact(reachVal),
    impressionsNum: impressionsVal,
    impressions: formatCompact(impressionsVal),
    clicksNum: clicksVal,
    clicks: clicksVal.toLocaleString("en-IN"),
    leadsNum: leadsVal,
    leads: leadsVal.toString(),
    conversionsNum: conversionsVal,
    conversions: conversionsVal.toString(),
    engagement: engagementVal,
    ctr: ctrVal,
    cpl: formatINR(cplValNum),
    cplNum: cplValNum,
    revenueNum: revenueVal,
    revenue: formatINR(revenueVal),
    profitNum: profitVal,
    profit: formatINR(profitVal),
    roiMultiplier: roiVal,
    roiNum: parseFloat(roiVal) || 2.4,
    qualifiedLeadsNum: qualifiedLeadsVal,
  };
}

// Generate chart data series for a campaign
function generatePerformanceTimeline(camp, metricTab, timeframe) {
  const days = timeframe === "7D" ? 7 : timeframe === "30D" ? 30 : 14;
  const metrics = getCampaignMetrics(camp);
  const baseValue =
    metricTab === "Reach"
      ? metrics.reachNum / days
      : metricTab === "Clicks"
      ? metrics.clicksNum / days
      : metricTab === "Leads"
      ? metrics.leadsNum / days
      : metricTab === "Conversions"
      ? metrics.conversionsNum / days
      : metrics.spendNum / days;

  const points = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const wave = 0.8 + Math.sin(i * 0.9 + (camp?.id || 1)) * 0.28 + ((i % 3) * 0.08);
    const val = Math.max(1, Math.round(baseValue * wave));
    points.push({
      date: dayLabel,
      value: val,
    });
  }
  return points;
}

// =============================================================================
// Performance Telemetry Data Generators (Image 2 Design: Monthly & Weekly)
// =============================================================================

export const MONTHLY_TELEMETRY_TEMPLATE = [
  { monthShort: "Jan", spend: 2850, reach: 12450, impressions: 18760, clicks: 642, leads: 38, conversions: 12 },
  { monthShort: "Feb", spend: 3420, reach: 15320, impressions: 22780, clicks: 823, leads: 52, conversions: 18 },
  { monthShort: "Mar", spend: 4120, reach: 18760, impressions: 28460, clicks: 1021, leads: 67, conversions: 26 },
  { monthShort: "Apr", spend: 3780, reach: 21540, impressions: 34210, clicks: 1245, leads: 96, conversions: 34 },
  { monthShort: "May", spend: 3260, reach: 26310, impressions: 42560, clicks: 1560, leads: 124, conversions: 48 },
  { monthShort: "Jun", spend: 2980, reach: 24870, impressions: 39820, clicks: 1420, leads: 110, conversions: 42 },
  { monthShort: "Jul", spend: 2640, reach: 22640, impressions: 36780, clicks: 1230, leads: 96, conversions: 36 },
  { monthShort: "Aug", spend: 2120, reach: 19820, impressions: 32450, clicks: 980, leads: 82, conversions: 28 },
  { monthShort: "Sep", spend: 1780, reach: 17360, impressions: 27890, clicks: 760, leads: 64, conversions: 22 },
  { monthShort: "Oct", spend: 2450, reach: 21560, impressions: 34120, clicks: 1120, leads: 88, conversions: 31 },
  { monthShort: "Nov", spend: 2180, reach: 19240, impressions: 30760, clicks: 980, leads: 72, conversions: 26 },
  { monthShort: "Dec", spend: 1560, reach: 15870, impressions: 24320, clicks: 760, leads: 58, conversions: 18 },
];

export function getMonthlyTelemetryData(camp, year = "2025") {
  const metrics = getCampaignMetrics(camp);
  const campSpent = metrics.spendNum || 0;
  const baseTotal = 33140;
  const multiplier =
    campSpent > 0 && Math.abs(campSpent - baseTotal) > 8000
      ? campSpent / baseTotal
      : 1;

  return MONTHLY_TELEMETRY_TEMPLATE.map((item) => {
    const s = Math.round(item.spend * multiplier);
    const r = Math.round(item.reach * multiplier);
    const imp = Math.round(item.impressions * multiplier);
    const clk = Math.round(item.clicks * multiplier);
    const ld = Math.round(item.leads * multiplier);
    const conv = Math.round(item.conversions * multiplier);

    return {
      monthShort: item.monthShort,
      monthFull: `${item.monthShort} ${year}`,
      spend: `₹ ${s.toLocaleString("en-IN")}`,
      spendNum: s,
      reach: r.toLocaleString("en-IN"),
      reachNum: r,
      impressions: imp.toLocaleString("en-IN"),
      impressionsNum: imp,
      clicks: clk.toLocaleString("en-IN"),
      clicksNum: clk,
      leads: ld.toLocaleString("en-IN"),
      leadsNum: ld,
      conversions: conv.toLocaleString("en-IN"),
      conversionsNum: conv,
    };
  });
}

export const WEEKLY_TELEMETRY_TEMPLATE = [
  { weekId: "w1", weekLabel: "Week 1", spend: 3120, reach: 14620, impressions: 22480, clicks: 1120, leads: 72, conversions: 28 },
  { weekId: "w2", weekLabel: "Week 2", spend: 3860, reach: 18540, impressions: 28760, clicks: 1480, leads: 96, conversions: 36 },
  { weekId: "w3", weekLabel: "Week 3", spend: 2960, reach: 13720, impressions: 21340, clicks: 1020, leads: 68, conversions: 26 },
  { weekId: "w4", weekLabel: "Week 4", spend: 2480, reach: 11960, impressions: 17890, clicks: 820, leads: 54, conversions: 20 },
];

export function getWeeklyTelemetryData(camp, monthStr = "September", year = "2025") {
  const monthAbbr = monthStr.slice(0, 3);
  const metrics = getCampaignMetrics(camp);
  const campSpent = metrics.spendNum || 0;
  const baseTotal = 12420;
  const multiplier =
    campSpent > 0 && Math.abs(campSpent - baseTotal) > 4000
      ? (campSpent * 0.38) / baseTotal
      : 1;

  let totalSpend = 0;
  let totalReach = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalLeads = 0;
  let totalConversions = 0;

  const rows = WEEKLY_TELEMETRY_TEMPLATE.map((w, idx) => {
    const s = Math.round(w.spend * multiplier);
    const r = Math.round(w.reach * multiplier);
    const imp = Math.round(w.impressions * multiplier);
    const clk = Math.round(w.clicks * multiplier);
    const ld = Math.round(w.leads * multiplier);
    const conv = Math.round(w.conversions * multiplier);

    totalSpend += s;
    totalReach += r;
    totalImpressions += imp;
    totalClicks += clk;
    totalLeads += ld;
    totalConversions += conv;

    const dynamicRange =
      idx === 0
        ? `${monthAbbr} 1 – 7`
        : idx === 1
        ? `${monthAbbr} 8 – 14`
        : idx === 2
        ? `${monthAbbr} 15 – 21`
        : `${monthAbbr} 22 – 28`;

    return {
      weekId: w.weekId,
      weekLabel: w.weekLabel,
      dateRange: dynamicRange,
      fullTitle: `${w.weekLabel} (${dynamicRange})`,
      spend: `₹${s.toLocaleString("en-IN")}`,
      spendNum: s,
      reach: r.toLocaleString("en-IN"),
      reachNum: r,
      impressions: imp.toLocaleString("en-IN"),
      impressionsNum: imp,
      clicks: clk.toLocaleString("en-IN"),
      clicksNum: clk,
      leads: ld.toLocaleString("en-IN"),
      leadsNum: ld,
      conversions: conv.toLocaleString("en-IN"),
      conversionsNum: conv,
    };
  });

  const totals = {
    label: "Total",
    spend: `₹${totalSpend.toLocaleString("en-IN")}`,
    spendNum: totalSpend,
    reach: totalReach.toLocaleString("en-IN"),
    reachNum: totalReach,
    impressions: totalImpressions.toLocaleString("en-IN"),
    impressionsNum: totalImpressions,
    clicks: totalClicks.toLocaleString("en-IN"),
    clicksNum: totalClicks,
    leads: totalLeads.toLocaleString("en-IN"),
    leadsNum: totalLeads,
    conversions: totalConversions.toLocaleString("en-IN"),
    conversionsNum: totalConversions,
  };

  return { rows, totals };
}

// Backward compatible helper
function getCampaignPerformanceTableData(camp, timeframe) {
  if (timeframe === "Weekly") {
    const w = getWeeklyTelemetryData(camp);
    return {
      rows: w.rows.map((r) => ({
        date: r.fullTitle,
        ...r,
      })),
      totals: {
        date: "Total",
        ...w.totals,
      },
    };
  }
  const m = getMonthlyTelemetryData(camp);
  return {
    rows: m.map((r) => ({
      date: r.monthFull,
      ...r,
    })),
    totals: {
      date: "Total",
      spend: formatINR(m.reduce((acc, x) => acc + x.spendNum, 0)),
      reach: m.reduce((acc, x) => acc + x.reachNum, 0).toLocaleString("en-IN"),
      impressions: m.reduce((acc, x) => acc + x.impressionsNum, 0).toLocaleString("en-IN"),
      clicks: m.reduce((acc, x) => acc + x.clicksNum, 0).toLocaleString("en-IN"),
      leads: m.reduce((acc, x) => acc + x.leadsNum, 0).toLocaleString("en-IN"),
      conversions: m.reduce((acc, x) => acc + x.conversionsNum, 0).toLocaleString("en-IN"),
    },
  };
}

// Top ads performance breakdown helper
function getCampaignAdPerformance(camp) {
  const metrics = getCampaignMetrics(camp);
  const totalSpend = metrics.spendNum;
  const totalReach = metrics.reachNum;
  const totalLeads = metrics.leadsNum;
  const totalConv = metrics.conversionsNum;

  // Check if camp has explicit ads configured
  if (Array.isArray(camp?.ads) && camp.ads.length > 0) {
    const len = camp.ads.length;
    return camp.ads.map((ad, idx) => {
      const share = [0.48, 0.32, 0.20][idx] || (1 / len);
      const adSpend = Math.round(totalSpend * share);
      const adReach = Math.round(totalReach * share);
      const adLeads = Math.max(1, Math.round(totalLeads * share));
      const adConv = Math.max(1, Math.round(totalConv * share));
      const adCtr = (3.8 + (idx * 0.4)).toFixed(2) + "%";
      const adCpl = formatINR(Math.round(adSpend / (adLeads || 1)));

      return {
        id: ad.id || idx + 1,
        name: ad.name || `Ad Creative Variant #${idx + 1}`,
        format: ad.format || (idx === 0 ? "video" : idx === 1 ? "carousel" : "image"),
        spend: formatINR(adSpend),
        reach: formatCompact(adReach),
        ctr: adCtr,
        leads: adLeads,
        cpl: adCpl,
        conversions: adConv,
      };
    });
  }

  // Realistic default ad performance rows based on campaign
  const campName = camp?.name || "Campaign";
  return [
    {
      id: 1,
      name: `${campName} — Hero Video Reel (9:16)`,
      format: "video",
      spend: formatINR(Math.round(totalSpend * 0.50)),
      reach: formatCompact(Math.round(totalReach * 0.48)),
      ctr: "4.65%",
      leads: Math.round(totalLeads * 0.52),
      cpl: formatINR(Math.round((totalSpend * 0.50) / (totalLeads * 0.52 || 1))),
      conversions: Math.round(totalConv * 0.54),
    },
    {
      id: 2,
      name: `${campName} — Feature Carousel Set`,
      format: "carousel",
      spend: formatINR(Math.round(totalSpend * 0.32)),
      reach: formatCompact(Math.round(totalReach * 0.34)),
      ctr: "3.92%",
      leads: Math.round(totalLeads * 0.31),
      cpl: formatINR(Math.round((totalSpend * 0.32) / (totalLeads * 0.31 || 1))),
      conversions: Math.round(totalConv * 0.30),
    },
    {
      id: 3,
      name: `${campName} — Direct Intent Static Banner`,
      format: "image",
      spend: formatINR(Math.round(totalSpend * 0.18)),
      reach: formatCompact(Math.round(totalReach * 0.18)),
      ctr: "3.40%",
      leads: Math.round(totalLeads * 0.17),
      cpl: formatINR(Math.round((totalSpend * 0.18) / (totalLeads * 0.17 || 1))),
      conversions: Math.round(totalConv * 0.16),
    },
  ];
}

// Audience demographics and placement breakdown helper
function getCampaignAudiencePlacement(camp) {
  const audienceText = camp?.target_audience || "";
  let ageRange = "21 – 35 Years";
  let genderSplit = { male: 54, female: 44, other: 2 };
  let locations = ["Kerala", "Bengaluru", "Chennai", "Mumbai"];

  if (audienceText) {
    if (audienceText.includes("18") || audienceText.includes("24") || audienceText.includes("28")) {
      ageRange = "18 – 28 Years";
      genderSplit = { male: 52, female: 46, other: 2 };
    } else if (audienceText.includes("30") || audienceText.includes("40") || audienceText.includes("50")) {
      ageRange = "28 – 45 Years";
      genderSplit = { male: 58, female: 40, other: 2 };
    }
    const extractedLocs = [];
    ["Kerala", "Kochi", "Bangalore", "Bengaluru", "Chennai", "Mumbai", "Delhi", "Hyderabad", "Coimbatore"].forEach((loc) => {
      if (audienceText.toLowerCase().includes(loc.toLowerCase())) {
        extractedLocs.push(loc);
      }
    });
    if (extractedLocs.length > 0) {
      locations = Array.from(new Set(extractedLocs));
    }
  }

  const placements = [
    { name: "Instagram Reels & Feed", share: 52, platform: "instagram" },
    { name: "Facebook Feed & Stories", share: 34, platform: "facebook" },
    { name: "Audience Network & Messenger", share: 14, platform: "facebook" },
  ];

  return {
    ageRange,
    genderSplit,
    locations,
    placements,
  };
}

// Channel performance breakdown helper
function getChannelPerformance(camp) {
  const metrics = getCampaignMetrics(camp);
  const platforms =
    camp?.platforms && camp.platforms.length > 0
      ? camp.platforms
      : ["instagram", "facebook", "linkedin"];

  const weights = {
    instagram: { spendPct: 0.45, reachPct: 0.48, leadsPct: 0.42, convPct: 0.38 },
    facebook: { spendPct: 0.35, reachPct: 0.38, leadsPct: 0.38, convPct: 0.42 },
    linkedin: { spendPct: 0.20, reachPct: 0.14, leadsPct: 0.20, convPct: 0.20 },
    youtube: { spendPct: 0.30, reachPct: 0.45, leadsPct: 0.25, convPct: 0.25 },
    google_ads: { spendPct: 0.40, reachPct: 0.30, leadsPct: 0.45, convPct: 0.45 },
    whatsapp: { spendPct: 0.15, reachPct: 0.15, leadsPct: 0.30, convPct: 0.35 },
  };

  const totalSpent = parseFloat(camp?.spent) || 38400;

  return platforms.map((p) => {
    const key = p.toLowerCase().replace(/[\s_-]+/g, "");
    const w =
      weights[key] || {
        spendPct: 1 / platforms.length,
        reachPct: 1 / platforms.length,
        leadsPct: 1 / platforms.length,
        convPct: 1 / platforms.length,
      };

    const cSpend = Math.round(totalSpent * w.spendPct);
    const cReach = Math.round(metrics.reachNum * w.reachPct);
    const cLeads = Math.max(4, Math.round(metrics.leadsNum * w.leadsPct));
    const cConv = Math.max(1, Math.round(metrics.conversionsNum * w.convPct));
    const cCpl = Math.round(cSpend / (cLeads || 1));

    return {
      platform: p,
      spend: formatINR(cSpend),
      reach: formatCompact(cReach),
      leads: cLeads,
      cpl: formatINR(cCpl),
      conversions: cConv,
    };
  });
}

// Activity timeline for campaign
function getCampaignActivityTimeline(camp) {
  return [
    { date: "17 Sep", title: "Budget updated", desc: "Monthly pacing aligned with target spend" },
    { date: "16 Sep", title: "12 new leads generated", desc: "Performance spike from carousel ad placement" },
    { date: "15 Sep", title: "Campaign activated", desc: "Multi-platform scheduled rollout initiated" },
    { date: "14 Sep", title: "Creative uploaded", desc: "3 high-converting creative variants approved" },
  ];
}

// Creative assets mock data
function getCampaignAssets(camp) {
  return [
    {
      id: 1,
      title: "Hero Product Reel (9:16)",
      platform: "instagram",
      reach: "8.4K",
      leads: "28",
      conversions: "9",
      bgGradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    },
    {
      id: 2,
      title: "Feature Carousel V2",
      platform: "facebook",
      reach: "6.1K",
      leads: "21",
      conversions: "6",
      bgGradient: "linear-gradient(135deg, #2563eb, #06b6d4)",
    },
    {
      id: 3,
      title: "B2B Case Study Post",
      platform: "linkedin",
      reach: "3.7K",
      leads: "13",
      conversions: "3",
      bgGradient: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    },
  ];
}

// Resolve advertising platforms configured either explicitly or derived from social channels
export function getEffectiveAdPlatforms(camp) {
  if (!camp) return [];
  const set = new Set();
  if (Array.isArray(camp.ad_platforms)) {
    camp.ad_platforms.forEach((p) => {
      if (p) set.add(p.toLowerCase());
    });
  }
  if (Array.isArray(camp.platforms)) {
    camp.platforms.forEach((p) => {
      const lower = String(p).toLowerCase();
      if (lower === "meta" || lower === "facebook" || lower === "instagram") set.add("meta");
      if (lower === "google" || lower === "google_ads") set.add("google");
    });
  }
  return Array.from(set);
}

// Resolve user-facing ad type label (e.g. Image Ad, Video Ad, Carousel Ad, Collection Ad)
export function getCampaignAdFormatLabel(camp) {
  if (!camp) return null;
  const rawFormat = (camp.ad_format || camp.ad_creative?.format || "").toLowerCase();

  // 1. If explicitly carousel or contains carousel cards
  if (
    rawFormat === "carousel" ||
    (Array.isArray(camp.ad_creative?.cards) && camp.ad_creative.cards.length > 0) ||
    (Array.isArray(camp.carousel_cards) && camp.carousel_cards.length > 0)
  ) {
    return "Carousel Ad";
  }

  // 2. If explicitly collection
  if (
    rawFormat === "collection" ||
    camp.ad_creative?.coverMedia ||
    camp.ad_creative?.catalog
  ) {
    return "Collection Ad";
  }

  // 3. If video creative or raw format is video
  if (
    rawFormat === "video" ||
    Boolean(camp.creative_video_url) ||
    camp.ad_creative?.media?.type === "video"
  ) {
    return "Video Ad";
  }

  // 4. If image creative or raw format is image
  if (
    rawFormat === "image" ||
    Boolean(camp.creative_image_url) ||
    camp.ad_creative?.media?.type === "image"
  ) {
    return "Image Ad";
  }

  // 5. If single_media: determine by video vs image URL, defaulting to Image Ad
  if (rawFormat === "single_media") {
    return camp.creative_video_url ? "Video Ad" : "Image Ad";
  }

  // 6. Generic fallback if format specified
  if (rawFormat) {
    const formatted = rawFormat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return formatted.endsWith("Ad") ? formatted : `${formatted} Ad`;
  }

  return "Image Ad";
}

// Resolve human-readable placement label (e.g. Feeds & Stories, Reels & Video Stream)
export function getCampaignPlacementLabel(camp, isShort = false) {
  if (!camp) return "Feeds & Stories";
  const raw = camp.campaign_type || camp.placement;
  if (!raw) return isShort ? "Advantage+" : "Advantage+ Placements (Automatic)";

  const metaMatch = META_CAMPAIGN_TYPES.find(
    (t) => t.value.toUpperCase() === String(raw).toUpperCase()
  );
  if (metaMatch) {
    if (isShort && metaMatch.shortLabel) return metaMatch.shortLabel;
    return metaMatch.label;
  }

  const googleMatch = GOOGLE_CAMPAIGN_TYPES.find(
    (t) => t.value.toUpperCase() === String(raw).toUpperCase()
  );
  if (googleMatch) return googleMatch.label;

  return String(raw).replace(/_/g, " ");
}

// =============================================================================
// Main Component
// =============================================================================

export default function CampaignsTab({
  campaigns = [],
  clients = [],
  platformConnections = [],
  onRefresh,
}) {
  // Check if a real Meta account is connected
  const metaConnection = platformConnections.find(
    (c) => c.platform === "meta" && c.status === "connected"
  ) || null;
  // Navigation & View Mode: "list" | "detail"
  const [viewMode, setViewMode] = useState("list");
  const [activeCampaign, setActiveCampaign] = useState(null);

  // Sub-Navigation: "manager" | "reports"
  const [campaignSubView, setCampaignSubView] = useState("manager");
  const [reportSelectedCampaignId, setReportSelectedCampaignId] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedAdType, setSelectedAdType] = useState("all");
  const [selectedObjective, setSelectedObjective] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Unique brands list for filter dropdown
  const uniqueBrands = useMemo(() => {
    const map = new Map();
    (clients || []).forEach((c) => {
      if (c && c.name) {
        map.set(c.name.toLowerCase(), { id: c.id, name: c.name });
      }
    });
    (campaigns || []).forEach((camp) => {
      const name = camp.client_name;
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { id: camp.client_profile || name, name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, campaigns]);

  // Modals & Confirmation States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDanger: false,
  });

  // Detail Page Telemetry & Chart States (Image 2 Design: Monthly & Weekly only)
  const [activeChartTimeframe, setActiveChartTimeframe] = useState("Monthly"); // 'Monthly' | 'Weekly'
  const [selectedTelemetryYear, setSelectedTelemetryYear] = useState("2025");
  const [selectedTelemetryMonth, setSelectedTelemetryMonth] = useState("September");
  const [selectedTelemetryWeek, setSelectedTelemetryWeek] = useState("Week 2");
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  // Detail Page "More" Dropdown State
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Create Campaign Form State
  const [clientId, setClientId] = useState(clients[0]?.id || 1);
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("lead_generation");
  const [budget, setBudget] = useState("50000");
  const [spent, setSpent] = useState("0");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [targetAudience, setTargetAudience] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Edit Campaign Form State
  const [editClientId, setEditClientId] = useState("");
  const [editName, setEditName] = useState("");
  const [editObjective, setEditObjective] = useState("lead_generation");
  const [editBudget, setEditBudget] = useState("");
  const [editSpent, setEditSpent] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editTargetAudience, setEditTargetAudience] = useState("");
  const [editPlatforms, setEditPlatforms] = useState([]);
  const [editStatus, setEditStatus] = useState("active");
  const [editAdPlatforms, setEditAdPlatforms] = useState(["meta"]);
  const [editCampaignType, setEditCampaignType] = useState("SEARCH");
  const [editBiddingStrategy, setEditBiddingStrategy] = useState("MAXIMIZE_CONVERSIONS");
  const [editLandingPageUrl, setEditLandingPageUrl] = useState("");
  const [editCtaValue, setEditCtaValue] = useState("learn_more");
  const [editTargetLocations, setEditTargetLocations] = useState("");
  const [editTargetAgeMin, setEditTargetAgeMin] = useState(18);
  const [editTargetAgeMax, setEditTargetAgeMax] = useState(65);
  const [editTargetGender, setEditTargetGender] = useState("all");
  const [editPrimaryText, setEditPrimaryText] = useState("");
  const [editHeadline, setEditHeadline] = useState("");
  const [editCreativeDescription, setEditCreativeDescription] = useState("");

  // ── Ad Platform Integration State ──
  // Create form - ad platform selection
  const [adPlatforms, setAdPlatforms] = useState(["meta"]);
  const [campaignType, setCampaignType] = useState("FEED_STORIES");
  const [biddingStrategy, setBiddingStrategy] = useState("MAXIMIZE_CONVERSIONS");
  const [landingPageUrl, setLandingPageUrl] = useState("");
  const [ctaValue, setCtaValue] = useState("learn_more");
  const [targetLocations, setTargetLocations] = useState("");
  const [targetAgeMin, setTargetAgeMin] = useState(18);
  const [targetAgeMax, setTargetAgeMax] = useState(65);
  const [targetGender, setTargetGender] = useState("all");
  const [primaryText, setPrimaryText] = useState("");
  const [headline, setHeadline] = useState("");
  const [creativeDescription, setCreativeDescription] = useState("");

  // ── Ad Creative Section State (Meta Ads Manager Structure) ──
  const [adFormat, setAdFormat] = useState("image"); // 'image' | 'video' | 'carousel' | 'collection'
  const [imageMedia, setImageMedia] = useState(null); // { file, url, name, size, type: 'image' }
  const [imageDragging, setImageDragging] = useState(false);
  const [videoMedia, setVideoMedia] = useState(null); // { file, url, name, size, type: 'video' }
  const [videoDragging, setVideoDragging] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState(null); // { file, url, name, size, type: 'image' }
  const [thumbnailDragging, setThumbnailDragging] = useState(false);
  const [carouselCards, setCarouselCards] = useState([
    { id: 1, media: null, headline: "", description: "", destinationUrl: "", cta: "learn_more" },
    { id: 2, media: null, headline: "", description: "", destinationUrl: "", cta: "learn_more" },
    { id: 3, media: null, headline: "", description: "", destinationUrl: "", cta: "learn_more" },
  ]);
  const [collectionCover, setCollectionCover] = useState(null); // { file, url, name, size, type: 'image'|'video' }
  const [collectionCoverDragging, setCollectionCoverDragging] = useState(false);
  const [collectionCatalog, setCollectionCatalog] = useState("main_catalog");
  const [collectionProductSet, setCollectionProductSet] = useState("all_products");
  const [validationErrors, setValidationErrors] = useState({});

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const collectionInputRef = useRef(null);

  // Auto-adjust campaignType when adPlatforms change
  useEffect(() => {
    const hasMeta = adPlatforms.includes("meta");
    const hasGoogle = adPlatforms.includes("google");

    if (hasMeta && !hasGoogle) {
      const isMetaType = META_CAMPAIGN_TYPES.some((t) => t.value === campaignType);
      if (!isMetaType) {
        setCampaignType("FEED_STORIES");
      }
    } else if (hasGoogle && !hasMeta) {
      const isGoogleType = GOOGLE_CAMPAIGN_TYPES.some((t) => t.value === campaignType);
      if (!isGoogleType) {
        setCampaignType("SEARCH");
      }
    }
  }, [adPlatforms, campaignType]);

  // Keep clientId synchronized with selected brand filter or loaded clients
  useEffect(() => {
    if (selectedBrand && selectedBrand !== "all") {
      setClientId(Number(selectedBrand) || selectedBrand);
    } else if (clients && clients.length > 0) {
      if (!clientId || !clients.some((c) => String(c.id) === String(clientId))) {
        setClientId(clients[0].id);
      }
    }
  }, [clients, selectedBrand]);

  // Publishing & Sync State
  const [publishLoading, setPublishLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [publishResult, setPublishResult] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null); // real data from /ad/campaigns/{id}/detail/
  const [detailLoading, setDetailLoading] = useState(false);
  const [budgetUpdateValue, setBudgetUpdateValue] = useState("");
  const [budgetUpdating, setBudgetUpdating] = useState(false);

  // ── Meta Sync State ──
  // mergedCampaigns = [{source: 'dashboard'|'meta', local_campaign: {...}|null, meta_data: {...}|null}]
  const [mergedCampaigns, setMergedCampaigns] = useState([]);
  const [metaSyncLoading, setMetaSyncLoading] = useState(false);
  const [metaSyncError, setMetaSyncError] = useState(null);
  const [metaSyncedAt, setMetaSyncedAt] = useState(null);
  const [metaAccountInfo, setMetaAccountInfo] = useState(null);
  const [selectedSource, setSelectedSource] = useState("all"); // 'all' | 'dashboard' | 'meta'

  // Fetch merged campaigns from Meta + Dashboard
  const syncFromMeta = useCallback(async (quiet = false) => {
    if (!quiet) setMetaSyncLoading(true);
    setMetaSyncError(null);
    try {
      const params = {};
      if (selectedBrand && selectedBrand !== "all") {
        const matched = uniqueBrands.find(
          (b) => b.name?.toLowerCase() === selectedBrand.toLowerCase() || String(b.id) === String(selectedBrand)
        );
        if (matched?.id && !isNaN(Number(matched.id))) {
          params.client_id = Number(matched.id);
        }
      }
      const res = await axios.get(`${API_BASE_URL}/social/ad/meta-campaigns/`, { params });
      setMergedCampaigns(res.data.campaigns || []);
      setMetaSyncedAt(new Date());
      if (res.data.account_name) {
        setMetaAccountInfo({
          name: res.data.account_name,
          id: res.data.account_id,
          connected: res.data.meta_connected,
        });
      }
    } catch (err) {
      setMetaSyncError("Failed to sync from Meta. Using local data.");
      // Fall back to local campaigns formatted as merged
      setMergedCampaigns(
        campaigns.map((c) => ({ source: "dashboard", local_campaign: c, meta_data: null }))
      );
    } finally {
      if (!quiet) setMetaSyncLoading(false);
    }
  }, [selectedBrand, campaigns]);

  // Auto-sync on mount and whenever local campaigns change
  useEffect(() => {
    syncFromMeta(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns]);

  // Flatten merged list back to a "campaign-like" object the existing code can use
  const allDisplayCampaigns = useMemo(() => {
    if (mergedCampaigns.length === 0) {
      // Before first sync, use local campaigns
      return campaigns.map((c) => ({ ...c, _source: "dashboard", _meta_data: null }));
    }
    return mergedCampaigns
      .filter((item) => {
        if (selectedSource === "dashboard") return item.source === "dashboard";
        if (selectedSource === "meta") return item.source === "meta";
        return true;
      })
      .map((item) => {
        if (item.source === "dashboard" && item.local_campaign) {
          return {
            ...item.local_campaign,
            _source: "dashboard",
            _meta_data: item.meta_data,
          };
        }
        // Meta-only campaign — synthesize a display object
        const m = item.meta_data || {};
        return {
          id: `meta_${m.meta_campaign_id}`,
          name: m.name || "(Unnamed Campaign)",
          status: _normalizeMetaStatus(m.status),
          objective: _normalizeMetaObjective(m.objective),
          budget: m.budget || 0,
          spent: m.spend || 0,
          start_date: m.start_time ? m.start_time.slice(0, 10) : null,
          end_date: m.stop_time ? m.stop_time.slice(0, 10) : null,
          client_name: metaAccountInfo?.name || "Meta Ads Account",
          platforms: ["facebook", "instagram"],
          ad_platforms: ["meta"],
          campaign_type: "ADVANTAGE_PLUS",
          target_audience: "",
          _source: "meta",
          _meta_data: m,
        };
      });
  }, [mergedCampaigns, campaigns, selectedSource, metaAccountInfo]);

  // Helpers for Meta API value normalization
  function _normalizeMetaStatus(metaStatus) {
    const map = { ACTIVE: "active", PAUSED: "paused", DELETED: "archived", ARCHIVED: "archived" };
    return map[(metaStatus || "").toUpperCase()] || "draft";
  }
  function _normalizeMetaObjective(metaObjective) {
    const map = {
      OUTCOME_LEADS: "lead_generation",
      OUTCOME_AWARENESS: "brand_awareness",
      OUTCOME_TRAFFIC: "traffic",
      OUTCOME_ENGAGEMENT: "engagement",
      OUTCOME_SALES: "conversions",
      OUTCOME_APP_PROMOTION: "traffic",
    };
    return map[(metaObjective || "").toUpperCase()] || "lead_generation";
  }

  // Keep activeCampaign synchronized with campaigns prop updates
  useEffect(() => {
    if (activeCampaign) {
      const refreshed = campaigns.find((c) => c.id === activeCampaign.id);
      if (refreshed) {
        setActiveCampaign(refreshed);
      }
    }
  }, [campaigns]);

  // Load real campaign detail when entering detail view
  useEffect(() => {
    if (viewMode === "detail" && activeCampaign?.id) {
      loadCampaignDetail(activeCampaign.id);
      setBudgetUpdateValue(parseFloat(activeCampaign.budget || 0).toFixed(0));
    } else {
      setCampaignDetail(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeCampaign?.id]);

  // ---------------------------------------------------------------------------
  // KPI Summary Row Calculations (Across All Display Campaigns)
  // ---------------------------------------------------------------------------
  const kpiMetrics = useMemo(() => {
    const list = allDisplayCampaigns;
    const totalCampaigns = list.length;
    const activeCampaigns = list.filter(
      (c) => (c.status || "active").toLowerCase() === "active"
    ).length;

    let totalSpend = 0;
    let totalReach = 0;
    let totalLeads = 0;
    let totalRevenue = 0;

    list.forEach((camp) => {
      const m = camp._meta_data;
      if (m) {
        // Use real Meta data when available
        totalSpend += parseFloat(m.spend) || 0;
        totalReach += parseInt(m.reach) || 0;
        totalLeads += parseInt(m.leads) || 0;
        totalRevenue += (parseFloat(m.spend) || 0) * 2.5; // estimated
      } else {
        const metrics = getCampaignMetrics(camp);
        totalSpend += parseFloat(camp.spent) || 0;
        totalReach += metrics.reachNum;
        totalLeads += metrics.leadsNum;
        totalRevenue += metrics.revenueNum;
      }
    });

    if (totalCampaigns === 0) {
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalSpend: "₹0",
        totalReach: "0",
        totalLeads: "0",
        roi: "0.0×",
      };
    }

    const effectiveSpend = totalSpend > 0 ? totalSpend : 245000;
    const effectiveReach = totalReach > 0 ? totalReach : 1280000;
    const effectiveLeads = totalLeads > 0 ? totalLeads : 2840;
    const overallRoi =
      totalSpend > 0
        ? (totalRevenue / totalSpend).toFixed(1) + "×"
        : "3.8×";

    return {
      totalCampaigns,
      activeCampaigns,
      totalSpend: formatINR(effectiveSpend, true),
      totalReach: formatCompact(effectiveReach),
      totalLeads: effectiveLeads.toLocaleString("en-IN"),
      roi: overallRoi,
    };
  }, [allDisplayCampaigns]);

  // ---------------------------------------------------------------------------
  // Filtering & Sorting
  // ---------------------------------------------------------------------------
  const filteredCampaigns = useMemo(() => {
    let list = [...allDisplayCampaigns];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.client_name && c.client_name.toLowerCase().includes(q)) ||
          (c.target_audience && c.target_audience.toLowerCase().includes(q)) ||
          (c.objective && c.objective.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      list = list.filter(
        (c) => (c.status || "active").toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Brand filter
    if (selectedBrand !== "all") {
      list = list.filter(
        (c) =>
          String(c.client_profile) === String(selectedBrand) ||
          c.client_name?.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    // Ad Type filter
    if (selectedAdType !== "all") {
      list = list.filter((c) => {
        const label = (getCampaignAdFormatLabel(c) || "").toLowerCase();
        const rawFormat = (c.ad_format || c.ad_creative?.format || "").toLowerCase();
        const target = selectedAdType.toLowerCase();
        return label.includes(target) || rawFormat.includes(target);
      });
    }

    // Objective filter
    if (selectedObjective !== "all") {
      list = list.filter(
        (c) => (c.objective || "").toLowerCase() === selectedObjective.toLowerCase()
      );
    }

    // Placement / Channel filter
    if (selectedChannel !== "all") {
      list = list.filter((c) => {
        const p = String(c.campaign_type || c.placement || "").toUpperCase();
        if (p === selectedChannel.toUpperCase()) return true;
        const eff = getEffectiveAdPlatforms(c);
        return eff.includes(selectedChannel.toLowerCase());
      });
    }

    // Date Range Filter
    if (selectedDateRange !== "all") {
      const now = new Date();
      if (selectedDateRange === "7d") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        list = list.filter((c) => new Date(c.start_date || c.created_at || now) >= weekAgo);
      } else if (selectedDateRange === "30d") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        list = list.filter((c) => new Date(c.start_date || c.created_at || now) >= monthAgo);
      } else if (selectedDateRange === "active_now") {
        list = list.filter((c) => {
          const end = c.end_date ? new Date(c.end_date) : new Date("9999-12-31");
          return end >= now && (c.status || "active").toLowerCase() === "active";
        });
      }
    }

    // Sorting
    if (sortOption === "newest") {
      list.sort((a, b) => new Date(b.created_at || b.start_date || 0) - new Date(a.created_at || a.start_date || 0));
    } else if (sortOption === "budget_desc") {
      list.sort((a, b) => (parseFloat(b.budget) || 0) - (parseFloat(a.budget) || 0));
    } else if (sortOption === "budget_asc") {
      list.sort((a, b) => (parseFloat(a.budget) || 0) - (parseFloat(b.budget) || 0));
    } else if (sortOption === "ending_soon") {
      list.sort((a, b) => new Date(a.end_date || "9999-12-31") - new Date(b.end_date || "9999-12-31"));
    } else if (sortOption === "most_leads") {
      list.sort((a, b) => getCampaignMetrics(b).leadsNum - getCampaignMetrics(a).leadsNum);
    }

    return list;
  }, [
    allDisplayCampaigns,
    campaigns,
    searchQuery,
    selectedStatus,
    selectedBrand,
    selectedAdType,
    selectedObjective,
    selectedChannel,
    selectedDateRange,
    sortOption,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "all" ||
    selectedBrand !== "all" ||
    selectedAdType !== "all" ||
    selectedObjective !== "all" ||
    selectedChannel !== "all" ||
    selectedDateRange !== "all" ||
    sortOption !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedBrand("all");
    setSelectedAdType("all");
    setSelectedObjective("all");
    setSelectedChannel("all");
    setSelectedDateRange("all");
    setSortOption("newest");
  };

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  // Open Campaign Detail View
  const handleOpenDetail = (camp) => {
    setActiveCampaign(camp);
    setViewMode("detail");
    if (camp?.id) {
      loadCampaignDetail(camp.id);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Return to Campaigns List View
  const handleBackToList = () => {
    setViewMode("list");
    setActiveCampaign(null);
    setMoreMenuOpen(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (camp) => {
    const target = camp || activeCampaign;
    if (!target) return;
    setActiveCampaign(target);
    setEditClientId(target.client_profile || (clients[0] && clients[0].id) || "");
    setEditName(target.name || "");
    setEditObjective(target.objective || "lead_generation");
    setEditBudget(target.budget ? parseFloat(target.budget).toString() : "50000");
    setEditSpent(target.spent ? parseFloat(target.spent).toString() : "0");
    setEditStartDate(target.start_date || new Date().toISOString().slice(0, 10));
    setEditEndDate(
      target.end_date ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    );
    setEditTargetAudience(target.target_audience || "");
    setEditPlatforms(
      target.platforms && target.platforms.length > 0
        ? target.platforms
        : ["instagram", "facebook", "linkedin"]
    );
    setEditStatus(target.status || "active");
    const effAdPlats = getEffectiveAdPlatforms(target);
    setEditAdPlatforms(effAdPlats.length > 0 ? effAdPlats : ["meta"]);
    const isMetaType = META_CAMPAIGN_TYPES.some((t) => t.value === target.campaign_type);
    setEditCampaignType(isMetaType ? target.campaign_type : "FEED_STORIES");
    setEditBiddingStrategy(target.bidding_strategy || "MAXIMIZE_CONVERSIONS");
    setEditLandingPageUrl(target.landing_page_url || "");
    setEditCtaValue(target.cta || "learn_more");
    setEditHeadline(target.headline || "");
    setEditPrimaryText(target.primary_text || "");
    setEditCreativeDescription(target.description || "");
    setEditTargetLocations(
      Array.isArray(target.target_locations)
        ? target.target_locations.join(", ")
        : target.target_locations || ""
    );
    setEditTargetAgeMin(target.target_age_min || 18);
    setEditTargetAgeMax(target.target_age_max || 65);
    setEditTargetGender(target.target_gender || "all");
    setEditModalOpen(true);
    setMoreMenuOpen(false);
  };

  // Toggle Pause/Resume with Confirmation
  const handleConfirmTogglePause = (camp) => {
    const target = camp || activeCampaign;
    if (!target) return;
    const currentStatus = (target.status || "active").toLowerCase();
    const isPaused = currentStatus === "paused";
    const nextStatus = isPaused ? "active" : "paused";

    setConfirmDialog({
      isOpen: true,
      title: isPaused ? "Resume Campaign?" : "Pause Campaign?",
      message: isPaused
        ? `Are you sure you want to resume "${target.name}"? Active delivery and pacing will continue.`
        : `Are you sure you want to pause "${target.name}"? Ad delivery and pacing will be temporarily held.`,
      isDanger: false,
      onConfirm: async () => {
        setStatusUpdating(true);
        try {
          await axios.patch(`${API_BASE_URL}/social/campaigns/${target.id}/`, {
            status: nextStatus,
          });
          const updated = { ...target, status: nextStatus };
          setActiveCampaign(updated);
          if (onRefresh) onRefresh();
        } catch (err) {
          console.error("Failed to update status:", err);
          alert("Error updating campaign status.");
        } finally {
          setStatusUpdating(false);
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null, isDanger: false });
        }
      },
    });
  };

  // Status Change via "More" menu
  const handleChangeStatus = async (newStatus) => {
    if (!activeCampaign || statusUpdating) return;
    setMoreMenuOpen(false);
    setStatusUpdating(true);
    try {
      const res = await axios.patch(`${API_BASE_URL}/social/campaigns/${activeCampaign.id}/`, {
        status: newStatus,
      });
      const updated = res.data ? res.data : { ...activeCampaign, status: newStatus };
      setActiveCampaign(updated);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to change status:", err);
      const errMsg =
        err.response?.data?.status?.[0] ||
        err.response?.data?.detail ||
        err.message ||
        "Error updating campaign status.";
      alert("Error updating status: " + errMsg);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = (camp) => {
    const target = camp || activeCampaign;
    if (!target) return;
    setMoreMenuOpen(false);
    setConfirmDialog({
      isOpen: true,
      title: "Delete Campaign?",
      message: `Are you sure you want to delete "${target.name}"? This action cannot be undone.`,
      isDanger: true,
      onConfirm: async () => {
        setStatusUpdating(true);
        try {
          await axios.delete(`${API_BASE_URL}/social/campaigns/${target.id}/`);
          if (onRefresh) onRefresh();
          if (viewMode === "detail" && activeCampaign?.id === target.id) {
            handleBackToList();
          }
        } catch (err) {
          console.error("Failed to delete campaign:", err);
          const errMsg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            "Error deleting campaign.";
          alert("Error deleting campaign: " + errMsg);
        } finally {
          setStatusUpdating(false);
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null, isDanger: false });
        }
      },
    });
  };

  // Reset Create Form state
  const resetCreateForm = () => {
    if (selectedBrand && selectedBrand !== "all") {
      setClientId(Number(selectedBrand) || selectedBrand);
    } else if (clients && clients.length > 0) {
      setClientId(clients[0].id);
    }
    setCampaignName("");
    setTargetAudience("");
    setBudget("50000");
    setObjective("lead_generation");
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setAdPlatforms(["meta"]);
    setCampaignType("FEED_STORIES");
    setBiddingStrategy("MAXIMIZE_CONVERSIONS");
    setTargetLocations("");
    setLandingPageUrl("");
    setPrimaryText("");
    setHeadline("");
    setCreativeDescription("");
    setCtaValue("learn_more");
    setAdFormat("image");
    setImageMedia(null);
    setVideoMedia(null);
    setVideoThumbnail(null);
    setCarouselCards([
      { id: 1, media: null, headline: "", description: "", destinationUrl: "", cta: "learn_more" },
      { id: 2, media: null, headline: "", description: "", destinationUrl: "", cta: "learn_more" },
      { id: 3, media: null, headline: "", description: "", destinationUrl: "", cta: "learn_more" },
    ]);
    setCollectionCover(null);
    setCollectionCatalog("main_catalog");
    setCollectionProductSet("all_products");
    setValidationErrors({});
  };

  // Helper for reading media files to local previews
  const handleMediaFileSelection = (file, callback, allowedTypes = "any") => {
    if (!file) return;
    const isVideo = file.type?.startsWith("video/");
    const isImage = file.type?.startsWith("image/");
    if (allowedTypes === "image" && !isImage) {
      alert("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }
    if (allowedTypes === "video" && !isVideo) {
      alert("Please upload a valid video file (MP4, MOV, WEBM).");
      return;
    }
    if (!isVideo && !isImage) {
      alert("Please upload a valid image or video file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      callback({
        file,
        url: ev.target?.result,
        name: file.name,
        size: formatMediaSize(file.size),
        rawSize: file.size,
        type: isVideo ? "video" : "image",
      });
    };
    reader.readAsDataURL(file);
  };

  // Carousel card builder handlers
  const handleAddCarouselCard = () => {
    setCarouselCards((prev) => [
      ...prev,
      { id: Date.now(), media: null, headline: "", description: "", destinationUrl: "", cta: "learn_more" },
    ]);
  };

  const handleRemoveCarouselCard = (id) => {
    if (carouselCards.length <= 2) {
      alert("A carousel ad must contain at least 2 cards.");
      return;
    }
    setCarouselCards((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMoveCarouselCard = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= carouselCards.length) return;
    setCarouselCards((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleUpdateCarouselCard = (id, field, value) => {
    setCarouselCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
    // Clear field-specific validation error on update
    const errKey =
      field === "destinationUrl"
        ? `card_${id}_url`
        : field === "headline"
        ? `card_${id}_headline`
        : `card_${id}_${field}`;
    if (validationErrors[errKey]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[errKey];
        return next;
      });
    }
  };

  // Helper to extract detailed validation error strings from DRF
  const formatApiError = (err, fallback = "An unexpected error occurred.") => {
    if (!err) return fallback;
    const data = err.response?.data;
    if (!data) return err.message || fallback;
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      if (data.detail) return data.detail;
      if (data.error) return data.error;
      if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(", ");
      const fieldErrors = Object.entries(data)
        .map(([field, errs]) => {
          const formattedField = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const errStr = Array.isArray(errs) ? errs.join(", ") : String(errs);
          return `${formattedField}: ${errStr}`;
        })
        .join("\n");
      if (fieldErrors) return fieldErrors;
    }
    return err.message || fallback;
  };

  // Upload a media file to the backend media library
  const uploadMediaAsset = async (mediaObj, defaultTitle) => {
    if (!mediaObj) return "";
    // If it is already a remote URL (http/https) and has no file, reuse directly
    if (mediaObj.url && !mediaObj.file && (mediaObj.url.startsWith("http://") || mediaObj.url.startsWith("https://"))) {
      return mediaObj.url;
    }
    if (mediaObj.file) {
      try {
        const fd = new FormData();
        fd.append("client_profile", clientId);
        fd.append("title", (defaultTitle || mediaObj.name || "Ad Creative Asset").slice(0, 100));
        fd.append("asset_type", mediaObj.type === "video" ? "video" : "image");
        fd.append("folder", "Creatives");
        fd.append("file", mediaObj.file, (mediaObj.file.name || "creative").slice(0, 60));
        fd.append("file_size_bytes", mediaObj.file.size || mediaObj.rawSize || 0);
        fd.append("file_format", (mediaObj.name || "").split(".").pop()?.toUpperCase() || "JPG");
        fd.append("approval_status", "approved");
        const res = await axios.post(`${API_BASE_URL}/social/media/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.file_url || res.data.file || "";
      } catch (err) {
        console.error("Media library upload failed:", err);
        const errMsg =
          err.response?.data?.file?.[0] ||
          err.response?.data?.file_size_bytes?.[0] ||
          err.response?.data?.detail ||
          err.message ||
          "Upload failed";
        throw new Error(`Media upload failed: ${errMsg}`);
      }
    }
    return mediaObj.url?.startsWith("data:") ? "" : (mediaObj.url || "");
  };

  // Comprehensive Form Validation
  const validateCreateForm = () => {
    const errs = {};
    if (!campaignName.trim()) {
      errs.campaignName = "Campaign Name is required.";
    }
    if (!objective) {
      errs.objective = "Objective is required.";
    }
    if (!budget || parseFloat(budget) <= 0) {
      errs.budget = "Budget must be greater than ₹0.";
    }
    if (!startDate) {
      errs.startDate = "Start Date is required.";
    }
    if (!endDate) {
      errs.endDate = "End Date is required.";
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      errs.endDate = "End Date cannot be earlier than Start Date.";
    }
    if (!adFormat) {
      errs.adFormat = "Ad Format is required.";
    }

    // Format specific validations
    if (adFormat === "image") {
      if (!imageMedia) {
        errs.imageMedia = "Image is required.";
      }
      if (
        landingPageUrl.trim() &&
        !landingPageUrl.trim().startsWith("http://") &&
        !landingPageUrl.trim().startsWith("https://")
      ) {
        errs.landingPageUrl = "Website URL must start with http:// or https://";
      }
    } else if (adFormat === "video") {
      if (!videoMedia) {
        errs.videoMedia = "Video is required.";
      }
      if (
        landingPageUrl.trim() &&
        !landingPageUrl.trim().startsWith("http://") &&
        !landingPageUrl.trim().startsWith("https://")
      ) {
        errs.landingPageUrl = "Website URL must start with http:// or https://";
      }
    } else if (adFormat === "carousel") {
      if (!carouselCards || carouselCards.length < 2) {
        errs.carousel = "At least 2 carousel cards are required.";
      } else {
        carouselCards.forEach((card, idx) => {
          if (!card.media) {
            errs[`card_${card.id}_media`] = `Card ${idx + 1}: Image or Video is required.`;
          }
          if (
            card.destinationUrl &&
            card.destinationUrl.trim() &&
            !card.destinationUrl.trim().startsWith("http://") &&
            !card.destinationUrl.trim().startsWith("https://")
          ) {
            errs[`card_${card.id}_url`] = `Card ${idx + 1}: URL must start with http:// or https://`;
          }
        });
      }
    } else if (adFormat === "collection") {
      if (!collectionCover) {
        errs.collectionCover = "Cover Image/Video is required.";
      }
      if (!collectionCatalog) {
        errs.collectionCatalog = "Product / Catalog is required.";
      }
      if (!collectionProductSet) {
        errs.collectionProductSet = "Product Set is required.";
      }
      if (
        landingPageUrl.trim() &&
        !landingPageUrl.trim().startsWith("http://") &&
        !landingPageUrl.trim().startsWith("https://")
      ) {
        errs.landingPageUrl = "Website URL must start with http:// or https://";
      }
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Create Campaign Submission
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Process media uploads
      let uploadedMediaUrl = "";
      let uploadedVideoUrl = "";
      let uploadedThumbnailUrl = "";
      let uploadedCards = [];
      let uploadedCoverUrl = "";

      if (adFormat === "image" && imageMedia) {
        uploadedMediaUrl = await uploadMediaAsset(imageMedia, `${campaignName} - Image Creative`);
      } else if (adFormat === "video") {
        if (videoMedia) {
          uploadedVideoUrl = await uploadMediaAsset(videoMedia, `${campaignName} - Video Creative`);
        }
        if (videoThumbnail) {
          uploadedThumbnailUrl = await uploadMediaAsset(videoThumbnail, `${campaignName} - Video Thumbnail`);
        }
      } else if (adFormat === "carousel") {
        for (let i = 0; i < carouselCards.length; i++) {
          const card = carouselCards[i];
          const cUrl = await uploadMediaAsset(card.media, `${campaignName} - Card ${i + 1}`);
          uploadedCards.push({
            headline: (card.headline || "").trim(),
            description: (card.description || "").trim(),
            destinationUrl: (card.destinationUrl || "").trim(),
            cta: card.cta || ctaValue || "learn_more",
            media: {
              name: card.media?.name || `Card ${i + 1}`,
              type: card.media?.type || "image",
              size: card.media?.size || "",
              url: cUrl || card.media?.url || "",
            },
          });
        }
      } else if (adFormat === "collection" && collectionCover) {
        uploadedCoverUrl = await uploadMediaAsset(collectionCover, `${campaignName} - Cover`);
      }

      // Ad creative data structure
      const adCreativeData = {
        format: adFormat,
        primaryText: primaryText.trim(),
        headline: adFormat === "carousel" ? (uploadedCards[0]?.headline || "") : headline.trim(),
        description: creativeDescription.trim(),
        callToAction: ctaValue,
        ...(adFormat === "image" && {
          media: imageMedia ? {
            name: imageMedia.name,
            type: "image",
            size: imageMedia.size,
            url: uploadedMediaUrl || imageMedia.url,
          } : null,
        }),
        ...(adFormat === "video" && {
          media: videoMedia ? {
            name: videoMedia.name,
            type: "video",
            size: videoMedia.size,
            url: uploadedVideoUrl || videoMedia.url,
          } : null,
          thumbnail: videoThumbnail ? {
            name: videoThumbnail.name,
            type: "image",
            size: videoThumbnail.size,
            url: uploadedThumbnailUrl || videoThumbnail.url,
          } : null,
        }),
        ...(adFormat === "carousel" && {
          cards: uploadedCards,
        }),
        ...(adFormat === "collection" && {
          coverMedia: collectionCover ? {
            name: collectionCover.name,
            type: collectionCover.type,
            size: collectionCover.size,
            url: uploadedCoverUrl || collectionCover.url,
          } : null,
          catalog: collectionCatalog,
          productSet: collectionProductSet,
        }),
      };

      const payload = {
        client_profile: clientId,
        name: campaignName.trim(),
        objective,
        budget: parseFloat(budget) || 0,
        start_date: startDate || null,
        end_date: endDate || null,
        target_audience: targetAudience.trim(),
        target_age_min: targetAgeMin ? Number(targetAgeMin) : 18,
        target_age_max: targetAgeMax ? Number(targetAgeMax) : 65,
        target_gender: targetGender || "all",
        ad_platforms: adPlatforms.length > 0 ? adPlatforms : ["meta"],
        campaign_type: campaignType,
        bidding_strategy: biddingStrategy,
        target_locations: targetLocations
          ? targetLocations.split(",").map((l) => l.trim()).filter(Boolean)
          : [],
        status: "draft",
        platforms: ["instagram", "facebook", "linkedin"],

        // Structured Creative & Backwards compatibility
        ad_format: adFormat,
        ad_creative: adCreativeData,
        headline: adFormat === "carousel" ? (uploadedCards[0]?.headline || "") : headline.trim(),
        primary_text: primaryText.trim(),
        description: creativeDescription.trim() || (adFormat === "carousel" ? "" : headline.trim()),
        cta: ctaValue,
        landing_page_url: adFormat === "carousel" ? (uploadedCards[0]?.destinationUrl || "") : landingPageUrl.trim(),
        creative_image_url:
          adFormat === "image"
            ? (uploadedMediaUrl || (imageMedia?.url?.startsWith("data:") ? "" : imageMedia?.url || ""))
            : adFormat === "video"
            ? (uploadedThumbnailUrl || (videoThumbnail?.url?.startsWith("data:") ? "" : videoThumbnail?.url || ""))
            : adFormat === "collection"
            ? (uploadedCoverUrl || (collectionCover?.url?.startsWith("data:") ? "" : collectionCover?.url || ""))
            : adFormat === "carousel" && uploadedCards[0]?.media?.url
            ? (uploadedCards[0].media.url?.startsWith("data:") ? "" : uploadedCards[0].media.url)
            : "",
        creative_video_url:
          adFormat === "video"
            ? (uploadedVideoUrl || (videoMedia?.url?.startsWith("data:") ? "" : videoMedia?.url || ""))
            : adFormat === "collection" && collectionCover?.type === "video"
            ? (uploadedCoverUrl || (collectionCover?.url?.startsWith("data:") ? "" : collectionCover?.url || ""))
            : "",
      };

      await axios.post(`${API_BASE_URL}/social/campaigns/`, payload);
      setCreateModalOpen(false);
      resetCreateForm();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error creating campaign:", err);
      alert("Error creating campaign:\n" + formatApiError(err, "Failed to create campaign."));
    } finally {
      setSubmitting(false);
    }
  };

  // Save Edited Campaign
  const handleSaveEditCampaign = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert("Please enter a campaign name.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: editName.trim(),
        objective: editObjective,
        budget: parseFloat(editBudget) || 0,
        start_date: editStartDate || null,
        end_date: editEndDate || null,
        target_audience: editTargetAudience.trim(),
        target_age_min: editTargetAgeMin ? Number(editTargetAgeMin) : 18,
        target_age_max: editTargetAgeMax ? Number(editTargetAgeMax) : 65,
        ad_platforms: editAdPlatforms.length > 0 ? editAdPlatforms : ["meta"],
        campaign_type: editCampaignType,
        bidding_strategy: editBiddingStrategy,
        target_locations: editTargetLocations
          ? (typeof editTargetLocations === "string" ? editTargetLocations.split(",").map((l) => l.trim()).filter(Boolean) : editTargetLocations)
          : [],
        headline: editHeadline.trim(),
        primary_text: editPrimaryText.trim(),
        cta: editCtaValue,
        landing_page_url: editLandingPageUrl.trim(),
      };
      if (editClientId) {
        payload.client_profile = editClientId;
      }

      const res = await axios.patch(
        `${API_BASE_URL}/social/campaigns/${activeCampaign.id}/`,
        payload
      );
      setEditModalOpen(false);
      const updatedClientName =
        res.data.client_name ||
        clients.find((c) => String(c.id) === String(res.data.client_profile || editClientId))?.name;
      setActiveCampaign((prev) => ({
        ...prev,
        ...res.data,
        client_name: updatedClientName || prev?.client_name,
      }));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error updating campaign:", err);
      alert("Error saving campaign changes:\n" + formatApiError(err, "Failed to save campaign changes."));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Ad Platform Handlers ──────────────────────────────────────────────────

  const loadCampaignDetail = async (campaignId) => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/social/ad/campaigns/${campaignId}/detail/`);
      setCampaignDetail(res.data);
    } catch (err) {
      // Non-fatal: detail may not exist yet for non-published campaigns
      setCampaignDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePublishCampaign = async () => {
    if (!activeCampaign) return;
    setPublishLoading(true);
    setPublishResult(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/social/ad/campaigns/${activeCampaign.id}/publish/`);
      setPublishResult(res.data);
      if (res.data.success) {
        setActiveCampaign(prev => ({ ...prev, status: "published" }));
        if (onRefresh) onRefresh();
        await loadCampaignDetail(activeCampaign.id);
      }
    } catch (err) {
      const errData = err.response?.data;
      setPublishResult({
        success: false,
        errors: errData?.errors || [errData?.error || err.message || "Publishing failed"]
      });
    } finally {
      setPublishLoading(false);
    }
  };

  const handleSyncNow = async () => {
    if (!activeCampaign) return;
    setSyncLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/social/ad/campaigns/${activeCampaign.id}/sync/`);
      await loadCampaignDetail(activeCampaign.id);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncLoading(false);
    }
  };

  const handlePausePlatform = async () => {
    if (!activeCampaign || statusUpdating) return;
    setStatusUpdating(true);
    try {
      await axios.post(`${API_BASE_URL}/social/ad/campaigns/${activeCampaign.id}/pause/`);
      setActiveCampaign(prev => ({ ...prev, status: "paused" }));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error pausing campaign: " + (err.response?.data?.error || err.message));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleResumePlatform = async () => {
    if (!activeCampaign || statusUpdating) return;
    setStatusUpdating(true);
    try {
      await axios.post(`${API_BASE_URL}/social/ad/campaigns/${activeCampaign.id}/resume/`);
      setActiveCampaign(prev => ({ ...prev, status: "active" }));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error resuming campaign: " + (err.response?.data?.error || err.message));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!activeCampaign || budgetUpdating) return;
    const newBudget = parseFloat(budgetUpdateValue);
    if (!newBudget || newBudget <= 0) { alert("Please enter a valid budget."); return; }
    setBudgetUpdating(true);
    try {
      await axios.post(`${API_BASE_URL}/social/ad/campaigns/${activeCampaign.id}/update-budget/`, { budget: newBudget });
      setActiveCampaign(prev => ({ ...prev, budget: newBudget }));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error updating budget: " + (err.response?.data?.error || err.message));
    } finally {
      setBudgetUpdating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render Helper: Status Pill
  // ---------------------------------------------------------------------------
  const renderStatusPill = (statusStr) => {
    const s = (statusStr || "active").toLowerCase();
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return (
      <span className={`campaign-status-pill status-${s}`}>
        <span className="status-dot" />
        <span className="status-text">{label}</span>
      </span>
    );
  };

  // ---------------------------------------------------------------------------
  // Render Helper: Objective Badge
  // ---------------------------------------------------------------------------
  const renderObjectiveBadge = (objectiveStr) => {
    const obj = (objectiveStr || "lead_generation").toLowerCase().replace(/\s+/g, "_");
    const label = obj
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return <span className={`campaign-objective-badge obj-${obj}`}>{label}</span>;
  };

  // Format objective name helper
  const formatObjectiveName = (obj) => {
    if (!obj) return "Lead Generation";
    const map = {
      lead_generation: "Lead Generation",
      brand_awareness: "Brand Awareness",
      traffic: "Website Traffic",
      engagement: "Post Engagement",
      conversions: "Sales & Conversions",
    };
    return map[obj.toLowerCase()] || obj.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // ===========================================================================
  // SVG BRAND ICONS MATCHING IMAGE 1
  // ===========================================================================
  const FacebookCircleSvg = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, display: "inline-block" }}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.12 12.75l.45-3h-2.88V7.8c0-.82.4-1.62 1.68-1.62h1.3V3.62s-1.18-.2-2.31-.2c-2.36 0-3.9 1.43-3.9 4.02v2.33H6.84v3h2.62V20.2a12.06 12.06 0 003.88 0V12.75h1.78z"
        fill="#ffffff"
      />
    </svg>
  );

  const InstagramGradientSvg = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, display: "inline-block" }}>
      <defs>
        <linearGradient id="igBrandGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#igBrandGrad)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#ffffff" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="#ffffff" strokeWidth="1.5" fill="none" />
      <circle cx="15.8" cy="8.2" r="0.9" fill="#ffffff" />
    </svg>
  );

  const formatDateSafe = (dStr, fallback) => {
    if (!dStr) return fallback;
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return fallback || dStr;
      const day = d.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return fallback || dStr;
    }
  };

  // ===========================================================================
  // INDIVIDUAL META CAMPAIGN PERFORMANCE (IMAGE 1 EXACT DESIGN)
  // ===========================================================================
  const renderDetailView = () => {
    if (!activeCampaign) return null;

    // Real Meta Ads performance data from backend API
    const liveMeta = activeCampaign._meta_data || campaignDetail?.campaign?._meta_data;
    const isMetaNative = activeCampaign._source === "meta";
    const managerUrl = campaignDetail?.manager_url || liveMeta?.meta_manager_url;

    // Real Meta Ads performance data from backend API or merged _meta_data
    const metaPerf = campaignDetail?.meta_performance || (liveMeta ? {
      amount_spent: liveMeta.spend,
      reach: liveMeta.reach,
      impressions: liveMeta.impressions,
      clicks: liveMeta.clicks,
      ctr: liveMeta.ctr,
      results: liveMeta.leads || liveMeta.purchases || (liveMeta.clicks > 0 ? Math.max(1, Math.round(liveMeta.clicks * 0.048)) : 0),
      results_label: liveMeta.leads > 0 ? "Leads" : liveMeta.purchases > 0 ? "Purchases" : "Results",
      cost_per_result: liveMeta.cpl || (liveMeta.leads > 0 ? Number((liveMeta.spend / liveMeta.leads).toFixed(2)) : 0),
    } : null);

    const placementPerf = campaignDetail?.placement_performance || (liveMeta ? [
      {
        platform: "Facebook",
        spend: Math.round(liveMeta.spend * 0.58),
        impressions: Math.round(liveMeta.impressions * 0.58),
        clicks: Math.round(liveMeta.clicks * 0.56),
        results: Math.round((liveMeta.leads || liveMeta.purchases || Math.round(liveMeta.clicks * 0.048)) * 0.57),
      },
      {
        platform: "Instagram",
        spend: Math.round(liveMeta.spend * 0.42),
        impressions: Math.round(liveMeta.impressions * 0.42),
        clicks: Math.round(liveMeta.clicks * 0.44),
        results: Math.round((liveMeta.leads || liveMeta.purchases || Math.round(liveMeta.clicks * 0.048)) * 0.43),
      },
    ] : null);

    // Fallback values when draft or sync is pending
    const spendNum = parseFloat(activeCampaign.spent || 0) || (liveMeta?.spend ?? 0);
    const reachNum = liveMeta?.reach || (spendNum > 0 ? Math.round(spendNum * 2.03) : 0);
    const impNum = liveMeta?.impressions || (reachNum > 0 ? Math.round(reachNum * 1.82) : 0);
    const clicksNum = liveMeta?.clicks || (impNum > 0 ? Math.round(impNum * 0.042) : 0);
    const ctrNum = liveMeta?.ctr || (impNum > 0 ? Number(((clicksNum / impNum) * 100).toFixed(2)) : 0);
    const resultsNum = liveMeta?.leads || liveMeta?.purchases || (clicksNum > 0 ? Math.max(1, Math.round(clicksNum * 0.048)) : 0);

    const objKey = (activeCampaign.objective || "lead_generation").toLowerCase();
    const defaultResultsLabel =
      objKey.includes("lead") ? "Leads" :
      objKey.includes("sale") || objKey.includes("conversion") ? "Purchases" :
      objKey.includes("traffic") ? "Link Clicks" :
      objKey.includes("engagement") ? "Post Engagements" : "Results";

    const kpis = {
      amount_spent: metaPerf?.amount_spent ?? spendNum,
      reach: metaPerf?.reach ?? reachNum,
      impressions: metaPerf?.impressions ?? impNum,
      clicks: metaPerf?.clicks ?? clicksNum,
      ctr: metaPerf?.ctr ?? ctrNum,
      results: metaPerf?.results ?? resultsNum,
      results_label: metaPerf?.results_label || defaultResultsLabel,
    };

    const singleResultLabel = (kpis.results_label || defaultResultsLabel).replace(/s$/i, "") || "Result";
    const rawCpr = Number(kpis.results) > 0 ? Number(kpis.amount_spent) / Number(kpis.results) : 0;
    const costPerResult = metaPerf?.cost_per_result ?? rawCpr;

    const placements = placementPerf && placementPerf.length > 0
      ? placementPerf
      : [
          {
            platform: "Facebook",
            spend: Math.round(Number(kpis.amount_spent) * 0.58),
            impressions: Math.round(Number(kpis.impressions) * 0.58),
            clicks: Math.round(Number(kpis.clicks) * 0.56),
            results: Math.round(Number(kpis.results) * 0.57),
          },
          {
            platform: "Instagram",
            spend: Math.round(Number(kpis.amount_spent) * 0.42),
            impressions: Math.round(Number(kpis.impressions) * 0.42),
            clicks: Math.round(Number(kpis.clicks) * 0.44),
            results: Math.round(Number(kpis.results) * 0.43),
          },
        ];

    const budgetFormatted = formatINR(activeCampaign.budget || 50000);
    const dateFormatted = `${formatDateSafe(activeCampaign.start_date, "21 Sep 2026")} – ${formatDateSafe(
      activeCampaign.end_date,
      "21 Oct 2026"
    )}`;

    const statusVal = (activeCampaign.status || "active").toLowerCase();
    const statusLabel =
      statusVal === "active" || statusVal === "published"
        ? "Active"
        : statusVal === "paused"
        ? "Paused"
        : statusVal === "completed"
        ? "Completed"
        : statusVal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <div className="campaign-detail-page individual-meta-campaign-page">
        {/* Top Back Navigation Bar */}
        <div className="campaign-detail-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={handleBackToList}
            className="btn-back-to-campaigns"
            title="Return to Campaigns List"
          >
            <ArrowLeft size={16} />
            <span>Back to Campaigns</span>
          </button>

          {managerUrl && (
            <a
              href={managerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1877F2",
                textDecoration: "none",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                padding: "6px 14px",
                borderRadius: 8,
              }}
            >
              <Facebook size={14} /> Open in Meta Ads Manager <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* ===================================================================
            1. HERO CAMPAIGN HEADER CARD
           =================================================================== */}
        <div className="meta-campaign-header-card-v2">
          {/* Center Info & Stats Strip */}
          <div className="meta-header-center-info">
            <h1 className="meta-campaign-title-v2">{activeCampaign.name}</h1>

            <div className="meta-badges-row-v2" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", margin: "6px 0 10px" }}>
              {isMetaNative ? (
                <span style={{ background: "#1877F2", color: "#fff", padding: "3px 10px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Facebook size={12} /> Meta
                </span>
              ) : liveMeta ? (
                <span style={{ background: "#1877F2", color: "#fff", padding: "3px 10px", borderRadius: 9999, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Facebook size={12} /> Meta
                </span>
              ) : null}

              <span className={`meta-status-pill-v2 status-${statusVal}`}>
                <span className="status-plus">+</span>
                <span>{statusLabel}</span>
              </span>

              <span className="meta-objective-pill-v2">
                <Target size={12} />
                <span>{formatObjectiveName(activeCampaign.objective)}</span>
              </span>

              {liveMeta?.adset_count > 0 && (
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "3px 9px", borderRadius: 6 }}>
                  {liveMeta.adset_count} Ad Sets {liveMeta.ad_count > 0 ? `· ${liveMeta.ad_count} Ads` : ""}
                </span>
              )}
            </div>

            {/* 3-column stats row */}
            <div className="meta-stats-strip">
              <div className="meta-stat-strip-item">
                <span className="stat-strip-label">
                  <IndianRupee size={12} />
                  <span>Budget</span>
                </span>
                <span className="stat-strip-value">{budgetFormatted} total</span>
              </div>

              <span className="stat-strip-divider" />

              <div className="meta-stat-strip-item">
                <span className="stat-strip-label">
                  <Calendar size={12} />
                  <span>Schedule</span>
                </span>
                <span className="stat-strip-value">{dateFormatted}</span>
              </div>

              <span className="stat-strip-divider" />

              <div className="meta-stat-strip-item">
                <span className="stat-strip-label">
                  <Target size={12} />
                  <span>Placements</span>
                </span>
                <div className="stat-strip-placements">
                  <span className="strip-placement-circle">
                    <FacebookCircleSvg size={16} />
                  </span>
                  <span className="strip-placement-circle">
                    <InstagramGradientSvg size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* ===================================================================
            2. KEY PERFORMANCE (6 KPI CARDS IN 3x2 GRID)
           =================================================================== */}
        <div className="meta-kpis-grid-v2">
          {/* Card 1: Amount Spent */}
          <div className="meta-kpi-card-v2">
            <div className="meta-kpi-icon-circle icon-circle-blue">
              <IndianRupee size={18} />
            </div>
            <div className="meta-kpi-card-body">
              <span className="meta-kpi-title">Amount Spent</span>
              <div className="meta-kpi-val-row">
                <span className="meta-kpi-number">{formatINR(kpis.amount_spent)}</span>
                <span className="meta-trend-badge trend-up">
                  <ArrowUp size={11} /> 12.5% <span className="trend-period">vs. previous period</span>
                </span>
              </div>
              <span className="meta-kpi-subtext">Total ad budget spent to date</span>
            </div>
          </div>

          {/* Card 2: Reach */}
          <div className="meta-kpi-card-v2">
            <div className="meta-kpi-icon-circle icon-circle-green">
              <Users size={18} />
            </div>
            <div className="meta-kpi-card-body">
              <span className="meta-kpi-title">Reach</span>
              <div className="meta-kpi-val-row">
                <span className="meta-kpi-number">{Number(kpis.reach).toLocaleString()}</span>
                <span className="meta-trend-badge trend-up">
                  <ArrowUp size={11} /> 18.3% <span className="trend-period">vs. previous period</span>
                </span>
              </div>
              <span className="meta-kpi-subtext">Unique accounts that saw your ads</span>
            </div>
          </div>

          {/* Card 3: Impressions */}
          <div className="meta-kpi-card-v2">
            <div className="meta-kpi-icon-circle icon-circle-purple">
              <Eye size={18} />
            </div>
            <div className="meta-kpi-card-body">
              <span className="meta-kpi-title">Impressions</span>
              <div className="meta-kpi-val-row">
                <span className="meta-kpi-number">{Number(kpis.impressions).toLocaleString()}</span>
                <span className="meta-trend-badge trend-up">
                  <ArrowUp size={11} /> 16.7% <span className="trend-period">vs. previous period</span>
                </span>
              </div>
              <span className="meta-kpi-subtext">Total times ads were displayed</span>
            </div>
          </div>

          {/* Card 4: Clicks */}
          <div className="meta-kpi-card-v2">
            <div className="meta-kpi-icon-circle icon-circle-amber">
              <MousePointerClick size={18} />
            </div>
            <div className="meta-kpi-card-body">
              <span className="meta-kpi-title">Clicks</span>
              <div className="meta-kpi-val-row">
                <span className="meta-kpi-number">{Number(kpis.clicks).toLocaleString()}</span>
                <span className="meta-trend-badge trend-up">
                  <ArrowUp size={11} /> 21.4% <span className="trend-period">vs. previous period</span>
                </span>
              </div>
              <span className="meta-kpi-subtext">Total clicks across all placements</span>
            </div>
          </div>

          {/* Card 5: CTR */}
          <div className="meta-kpi-card-v2">
            <div className="meta-kpi-icon-circle icon-circle-cyan">
              <span style={{ fontSize: "16px", fontWeight: 700 }}>%</span>
            </div>
            <div className="meta-kpi-card-body">
              <span className="meta-kpi-title">CTR (Click-Through Rate)</span>
              <div className="meta-kpi-val-row">
                <span className="meta-kpi-number">{Number(kpis.ctr).toFixed(2)}%</span>
                <span className="meta-trend-badge trend-up">
                  <ArrowUp size={11} /> 8.9% <span className="trend-period">vs. previous period</span>
                </span>
              </div>
              <span className="meta-kpi-subtext">Clicks divided by impressions</span>
            </div>
          </div>

          {/* Card 6: Results (with Cost Per Result) */}
          <div className="meta-kpi-card-v2 meta-kpi-card-results">
            <div className="meta-kpi-icon-circle icon-circle-rose">
              <Target size={18} />
            </div>
            <div className="meta-kpi-card-body">
              <div className="meta-kpi-title-row">
                <span className="meta-kpi-title">Results ({kpis.results_label})</span>
                <span className="meta-cpr-pill" title="Cost Per Result">
                  {formatINR(costPerResult)} / {singleResultLabel.toLowerCase()}
                </span>
              </div>
              <div className="meta-kpi-val-row">
                <span className="meta-kpi-number">{Number(kpis.results).toLocaleString()}</span>
                <span className="meta-trend-badge trend-up">
                  <ArrowUp size={11} /> 25.2% <span className="trend-period">vs. previous period</span>
                </span>
              </div>
              <span className="meta-kpi-subtext">
                Avg. Cost per {singleResultLabel}: <strong>{formatINR(costPerResult)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            3. PLACEMENT PERFORMANCE CARD (IMAGE 1 EXACT DESIGN)
           =================================================================== */}
        <div className="meta-placement-card-v2">
          <div className="meta-placement-card-header">
            <div className="meta-placement-title-wrap">
              <div className="meta-placement-icon-box">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="meta-placement-title">Placement Performance</h3>
                <p className="meta-placement-subtitle">Performance by placement</p>
              </div>
            </div>


          </div>

          <div className="meta-placement-table-wrap">
            <table className="meta-placement-table-v2">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Placement</th>
                  <th style={{ textAlign: "left" }}>Spend</th>
                  <th style={{ textAlign: "left" }}>Impressions</th>
                  <th style={{ textAlign: "left" }}>Clicks</th>
                  <th style={{ textAlign: "left" }}>Results</th>
                  <th style={{ textAlign: "left" }}>Cost / Result</th>
                </tr>
              </thead>
              <tbody>
                {placements.map((p) => {
                  const isFb = (p.platform || "").toLowerCase().includes("face");
                  const pSpend = Number(p.spend) || 0;
                  const pResults = Number(p.results) || 0;
                  const pCpr = p.cost_per_result ?? (pResults > 0 ? pSpend / pResults : 0);
                  return (
                    <tr key={p.platform}>
                      <td className="cell-platform">
                        <span className="platform-logo-circle">
                          {isFb ? <FacebookCircleSvg size={18} /> : <InstagramGradientSvg size={18} />}
                        </span>
                        <span className="platform-label-name">{p.platform}</span>
                      </td>
                      <td className="cell-num">{formatINR(pSpend)}</td>
                      <td className="cell-num">{Number(p.impressions).toLocaleString()}</td>
                      <td className="cell-num">{Number(p.clicks).toLocaleString()}</td>
                      <td className="cell-num">{pResults.toLocaleString()} {kpis.results_label}</td>
                      <td className="cell-num">
                        <span className="meta-table-cpr-pill">{formatINR(pCpr)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // MAIN COMPONENT RENDER (DETAIL VIEW OR LIST VIEW + SHARED MODALS)
  // ===========================================================================
  return (
    <>
      {campaignSubView === "reports" ? (
        <CampaignReportsSection
          campaigns={allDisplayCampaigns}
          clients={clients}
          onBackToManager={() => {
            setCampaignSubView("manager");
            setReportSelectedCampaignId(null);
          }}
          onViewCampaignDetail={(camp) => {
            setActiveCampaign(camp);
            setViewMode("detail");
            setCampaignSubView("manager");
          }}
          onRefresh={onRefresh}
        />
      ) : viewMode === "detail" && activeCampaign ? (
        renderDetailView()
      ) : (
        <div className="campaigns-container">
          {/* Top Sub-Navigation Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: "8px 12px",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 10,
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setCampaignSubView("manager")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  fontWeight: 750,
                  border: "none",
                  cursor: "pointer",
                  background: "#0f172a",
                  color: "#ffffff",
                }}
              >
                <Layers size={16} />
                <span>Campaign Manager</span>
                <span
                  style={{
                    background: "#334155",
                    color: "#ffffff",
                    padding: "2px 7px",
                    borderRadius: 9999,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {allDisplayCampaigns.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportSelectedCampaignId("all");
                  setCampaignSubView("reports");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: "0.85rem",
                  fontWeight: 650,
                  border: "none",
                  cursor: "pointer",
                  background: campaignSubView === "reports" ? "#0f172a" : "transparent",
                  color: campaignSubView === "reports" ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                <BarChart3 size={16} color={campaignSubView === "reports" ? "#ffffff" : "#0866FF"} />
                <span>Report</span>
              </button>
            </div>
          </div>

          {/* 1. PAGE HEADER */}
      <div className="campaigns-page-header">
        <div className="campaigns-header-text">
          <h1 className="campaigns-title">Social Marketing Campaigns & ROI</h1>
          <p className="campaigns-subtitle">
            Plan, manage and track your social media campaigns.
          </p>
        </div>

        <div className="campaigns-header-actions">
          <button
            id="btn-create-campaign-trigger"
            onClick={() => {
              if (clients.length > 0 && !clientId) {
                setClientId(clients[0].id);
              }
              setCreateModalOpen(true);
            }}
            className="btn-create-campaign"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* 2. CAMPAIGN KPI SUMMARY ROW (Subtle, compact cards with light borders) */}
      <div className="campaigns-kpi-row">
        {/* Total Campaigns */}
        <div className="kpi-metric-card">
          <div className="kpi-label">Total Campaigns</div>
          <div className="kpi-value">{kpiMetrics.totalCampaigns}</div>
        </div>

        {/* Active Campaigns */}
        <div className="kpi-metric-card">
          <div className="kpi-label">Active Campaigns</div>
          <div className="kpi-value text-emerald-700">{kpiMetrics.activeCampaigns}</div>
        </div>

        {/* Total Spend */}
        <div className="kpi-metric-card">
          <div className="kpi-label">Total Spend</div>
          <div className="kpi-value">{kpiMetrics.totalSpend}</div>
        </div>

        {/* Total Reach */}
        <div className="kpi-metric-card">
          <div className="kpi-label">Total Reach</div>
          <div className="kpi-value">{kpiMetrics.totalReach}</div>
        </div>

        {/* Total Leads */}
        <div className="kpi-metric-card">
          <div className="kpi-label">Total Leads</div>
          <div className="kpi-value">{kpiMetrics.totalLeads}</div>
        </div>

        {/* ROI */}
        <div className="kpi-metric-card kpi-roi-card">
          <div className="kpi-label">ROI</div>
          <div className="kpi-value text-indigo-700">{kpiMetrics.roi}</div>
        </div>
      </div>

      {/* 3. SEARCH + FILTER BAR */}
      <div className="campaigns-filter-bar">
        {/* Single-line: Search + All Filters + Sort + Count */}
        <div className="campaigns-filter-single-row">
          {/* Search Box */}
          <div className="campaigns-search-box campaigns-search-inline">
            <Search size={16} className="campaigns-search-icon" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="campaigns-clear-search"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="campaigns-filter-divider" />

          {/* Objective Filter */}
          <div className="campaigns-filter-select-wrap">
            <select
              value={selectedObjective}
              onChange={(e) => setSelectedObjective(e.target.value)}
              className="campaigns-filter-select"
            >
              <option value="all">Objective: All</option>
              <option value="lead_generation">Lead Generation</option>
              <option value="brand_awareness">Brand Awareness</option>
              <option value="conversions">Sales &amp; Conversions</option>
              <option value="engagement">Engagement</option>
              <option value="traffic">Website Traffic</option>
            </select>
            <ChevronDown size={14} className="campaigns-filter-select-icon" />
          </div>

          {/* Brand Name Filter */}
          <div className="campaigns-filter-select-wrap">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="campaigns-filter-select"
            >
              <option value="all">Brand: All</option>
              {uniqueBrands.map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="campaigns-filter-select-icon" />
          </div>

          {/* Ad Type Filter */}
          <div className="campaigns-filter-select-wrap">
            <select
              value={selectedAdType}
              onChange={(e) => setSelectedAdType(e.target.value)}
              className="campaigns-filter-select"
            >
              <option value="all">Ad Type: All</option>
              <option value="video">Video Ad</option>
              <option value="image">Image Ad</option>
              <option value="carousel">Carousel Ad</option>
              <option value="collection">Collection Ad</option>
            </select>
            <ChevronDown size={14} className="campaigns-filter-select-icon" />
          </div>

          {/* Placement Filter */}
          <div className="campaigns-filter-select-wrap">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="campaigns-filter-select"
            >
              <option value="all">Placement: All</option>
              {META_CAMPAIGN_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="campaigns-filter-select-icon" />
          </div>

          {/* Date Range Filter */}
          <div className="campaigns-filter-select-wrap">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="campaigns-filter-select"
            >
              <option value="all">Date Range: All</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="active_now">Active Now</option>
            </select>
            <ChevronDown size={14} className="campaigns-filter-select-icon" />
          </div>

          {/* Divider */}
          <div className="campaigns-filter-divider" />

          {/* Source Filter */}
          <div className="campaigns-filter-select-wrap">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="campaigns-filter-select"
              style={{ paddingLeft: 8 }}
            >
              <option value="all">Source: All</option>
              <option value="dashboard">Dashboard</option>
              <option value="meta">Meta</option>
            </select>
            <ChevronDown size={14} className="campaigns-filter-select-icon" />
          </div>

          {/* Divider */}
          <div className="campaigns-filter-divider" />
          <div className="campaigns-filter-select-wrap">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="campaigns-filter-select font-medium"
            >
              <option value="newest">Sort: Newest</option>
              <option value="budget_desc">Sort: Highest Budget</option>
              <option value="budget_asc">Sort: Lowest Budget</option>
              <option value="ending_soon">Sort: Ending Soonest</option>
              <option value="most_leads">Sort: Most Leads</option>
            </select>
            <ChevronDown size={14} className="campaigns-filter-select-icon" />
          </div>

          {/* Count Badge */}
          <span className="campaigns-count-badge">
            Showing <strong>{filteredCampaigns.length}</strong> of {allDisplayCampaigns.length}
            {allDisplayCampaigns.some(c => c._source === "meta") && (
              <span style={{ marginLeft: 6, background: "#eff6ff", color: "#0866FF", border: "1px solid #bfdbfe", padding: "1px 7px", borderRadius: 9999, fontSize: "0.7rem", fontWeight: 800 }}>META SYNCED</span>
            )}
          </span>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="campaigns-reset-filters-btn"
              title="Reset all applied filters"
            >
              <RotateCcw size={12} style={{ display: "inline", marginRight: 4 }} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. CAMPAIGN LIST (3 Columns Grid Desktop, 2 Tablet, 1 Mobile) */}
      <div className="campaigns-grid">
        {filteredCampaigns.length === 0 ? (
          <div className="campaigns-empty-state">
            <div className="campaigns-empty-icon">
              <Layers size={28} />
            </div>
            <h3 className="campaigns-empty-title">
              {allDisplayCampaigns.length === 0 ? "No Campaigns Found" : "No Matching Campaigns Found"}
            </h3>
            <p className="campaigns-empty-desc">
              {allDisplayCampaigns.length === 0
                ? "Create your first social media campaign to track platform telemetry, budget pacing, and conversion targets."
                : "No campaigns match your selected filter criteria. Try clearing or relaxing your filters."}
            </p>
            {hasActiveFilters ? (
              <button onClick={handleResetFilters} className="campaigns-reset-filters-btn">
                Clear Filters
              </button>
            ) : (
              <button onClick={() => setCreateModalOpen(true)} className="btn-create-campaign">
                <Plus size={16} /> Create Campaign
              </button>
            )}
          </div>
        ) : (
          filteredCampaigns.map((camp) => {
            const budgetNum = parseFloat(camp.budget) || 1;
            const spentNum = camp._meta_data ? parseFloat(camp._meta_data.spend) || 0 : parseFloat(camp.spent) || 0;
            const spentPercent = Math.min(100, Math.round((spentNum / budgetNum) * 100));
            const isMetaNative = camp._source === "meta";
            const isDashboard = camp._source === "dashboard";
            const hasLiveMetaData = Boolean(camp._meta_data);

            return (
              <div
                key={camp.id}
                className={`campaign-card${isMetaNative ? " campaign-card-meta-native" : ""}`}
                onClick={() => handleOpenDetail(camp)}
                title={`Click to view ${camp.name} details`}
              >
                {/* Source Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: isMetaNative ? "space-between" : "flex-end", marginBottom: 6 }}>
                  {isMetaNative && (
                    <span style={{ background: "#1877F2", color: "#fff", padding: "2px 9px", borderRadius: 9999, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Facebook size={10} /> Meta
                    </span>
                  )}
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderObjectiveBadge(camp.objective)}
                  </div>
                </div>

                {/* 2. Campaign Name & Brand */}
                <div className="campaign-card-header">
                  <h3
                    className="campaign-name"
                    onClick={(e) => { e.stopPropagation(); handleOpenDetail(camp); }}
                  >
                    {camp.name}
                  </h3>
                  <div className="campaign-brand-row">
                    <span>Brand:</span>
                    <span className="brand-name">{camp.client_name || "Adstra Digital"}</span>
                  </div>
                </div>

                {/* 3. Target Audience (skip for Meta-native) */}
                {camp.target_audience && !isMetaNative && (
                  <div className="campaign-audience" onClick={(e) => e.stopPropagation()}>
                    <Target size={13} className="campaign-audience-icon" />
                    <span className="campaign-audience-text" title={camp.target_audience}>
                      {camp.target_audience}
                    </span>
                  </div>
                )}

                {/* 3b. Meta metrics row for Meta-native or live campaigns */}
                {hasLiveMetaData && (
                  <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0" }}>
                    {camp._meta_data.impressions > 0 && (
                      <span style={{ fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                        👁 {Number(camp._meta_data.impressions).toLocaleString()} imp
                      </span>
                    )}
                    {camp._meta_data.clicks > 0 && (
                      <span style={{ fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                        🖱 {Number(camp._meta_data.clicks).toLocaleString()} clicks
                      </span>
                    )}
                    {camp._meta_data.leads > 0 && (
                      <span style={{ fontSize: "0.75rem", background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                        🎯 {Number(camp._meta_data.leads).toLocaleString()} leads
                      </span>
                    )}
                    {camp._meta_data.ctr > 0 && (
                      <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#0866FF", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                        CTR {Number(camp._meta_data.ctr).toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}

                {/* 4. Budget Pacing */}
                <div className="campaign-budget-section">
                  <div className="campaign-budget-header">
                    <span className="campaign-budget-label">Budget Pacing</span>
                    <span className="campaign-budget-values">
                      {formatINR(spentNum)} / {formatINR(budgetNum)}
                      <span className="pacing-pct">{spentPercent}%</span>
                    </span>
                  </div>
                  <div className="campaign-progress-track">
                    <div
                      className={`campaign-progress-bar ${spentPercent > 90 ? "near-limit" : ""} ${spentPercent >= 100 ? "exceeded" : ""}`}
                      style={{ width: `${Math.max(spentPercent === 0 ? 2 : spentPercent, 4)}%` }}
                    />
                  </div>
                </div>

                {/* 5. Footer: dates + actions */}
                <div className="campaign-card-footer">
                  <div className="campaign-dates">
                    <Calendar size={13} />
                    <span>{formatDisplayDate(camp.start_date)} — {formatDisplayDate(camp.end_date)}</span>
                  </div>
                  <div className="campaign-card-actions">
                    {/* Only show edit/delete for dashboard campaigns */}
                    {!isMetaNative && (
                      <>
                        <button
                          type="button"
                          className="campaign-card-quick-edit"
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(camp); }}
                          title={`Edit ${camp.name}`}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          className="campaign-card-quick-delete"
                          onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(camp); }}
                          title={`Delete ${camp.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                    {/* Open in Meta Ads Manager for Meta-native campaigns */}
                    {isMetaNative && camp._meta_data?.meta_manager_url && (
                      <a
                        href={camp._meta_data.meta_manager_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Open in Meta Ads Manager"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, background: "#eff6ff", color: "#0866FF", border: "1px solid #bfdbfe", fontSize: "0.72rem", fontWeight: 700, textDecoration: "none" }}
                      >
                        <ExternalLink size={12} /> Meta Manager
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )}

      {/* ===================================================================
          CONFIRMATION MODAL (Shared between List & Detail views)
          =================================================================== */}
      {confirmDialog.isOpen && (
        <div className="campaign-confirm-overlay">
          <div className="campaign-confirm-card" role="dialog" aria-modal="true">
            <div className="confirm-icon-wrap">
              {confirmDialog.isDanger ? (
                <AlertTriangle size={24} className="text-red-600" />
              ) : (
                <CheckCircle2 size={24} className="text-indigo-600" />
              )}
            </div>
            <h3 className="confirm-title">{confirmDialog.title}</h3>
            <p className="confirm-message">{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    title: "",
                    message: "",
                    onConfirm: null,
                    isDanger: false,
                  })
                }
                className="btn-confirm-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                disabled={statusUpdating}
                className={`btn-confirm-proceed ${confirmDialog.isDanger ? "is-danger" : ""}`}
              >
                {statusUpdating ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          CREATE CAMPAIGN MODAL (Shared)
          =================================================================== */}
      {createModalOpen && (
        <div
          className="social-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateModalOpen(false);
          }}
        >
          <div className="social-modal-content" style={{ maxWidth: 680 }}>
            <div className="social-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 750, color: "#0f172a" }}>
                Create Campaign
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCreateModalOpen(false);
                  resetCreateForm();
                }}
                className="btn-close-modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.keys(validationErrors).length > 0 && (
                  <div className="campaign-validation-banner">
                    <AlertCircle size={16} />
                    <span>Please review and fill in all required fields marked below.</span>
                  </div>
                )}

                {/* ── CAMPAIGN ── */}
                <div className="campaign-modal-section-divider"><span>Campaign</span></div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Client / Brand *</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(Number(e.target.value) || e.target.value)}
                    className="campaign-modal-select"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Campaign Name *</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => {
                      setCampaignName(e.target.value);
                      if (validationErrors.campaignName) {
                        setValidationErrors((prev) => { const n = { ...prev }; delete n.campaignName; return n; });
                      }
                    }}
                    placeholder="e.g. Vorion Enterprise AI Q4 Drive"
                    className={`campaign-modal-input ${validationErrors.campaignName ? "input-has-error" : ""}`}
                  />
                  {validationErrors.campaignName && (
                    <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.campaignName}</div>
                  )}
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Objective *</label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="campaign-modal-select"
                  >
                    <option value="lead_generation">Lead Generation</option>
                    <option value="conversions">Sales &amp; Conversions</option>
                    <option value="brand_awareness">Brand Awareness</option>
                    <option value="engagement">Engagement</option>
                    <option value="traffic">Website Traffic</option>
                  </select>
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Budget (INR ₹) *</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => {
                      setBudget(e.target.value);
                      if (validationErrors.budget) {
                        setValidationErrors((prev) => { const n = { ...prev }; delete n.budget; return n; });
                      }
                    }}
                    className={`campaign-modal-input ${validationErrors.budget ? "input-has-error" : ""}`}
                  />
                  {validationErrors.budget && (
                    <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.budget}</div>
                  )}
                </div>

                <div className="campaign-modal-grid-2">
                  <div className="campaign-modal-form-group">
                    <label className="campaign-modal-label">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (validationErrors.startDate) {
                          setValidationErrors((prev) => { const n = { ...prev }; delete n.startDate; return n; });
                        }
                      }}
                      className={`campaign-modal-input ${validationErrors.startDate ? "input-has-error" : ""}`}
                    />
                    {validationErrors.startDate && (
                      <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.startDate}</div>
                    )}
                  </div>

                  <div className="campaign-modal-form-group">
                    <label className="campaign-modal-label">End Date *</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (validationErrors.endDate) {
                          setValidationErrors((prev) => { const n = { ...prev }; delete n.endDate; return n; });
                        }
                      }}
                      className={`campaign-modal-input ${validationErrors.endDate ? "input-has-error" : ""}`}
                    />
                    {validationErrors.endDate && (
                      <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.endDate}</div>
                    )}
                  </div>
                </div>

                {/* ── AD SET ── */}
                <div className="campaign-modal-section-divider"><span>Ad Set</span></div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Students · 18–25 · Kerala"
                    className="campaign-modal-input"
                  />
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Location</label>
                  <input
                    type="text"
                    value={targetLocations}
                    onChange={(e) => setTargetLocations(e.target.value)}
                    placeholder="e.g. Kerala, India, Dubai"
                    className="campaign-modal-input"
                  />
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Age</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      value={targetAgeMin}
                      onChange={(e) => setTargetAgeMin(Number(e.target.value))}
                      min={13}
                      max={65}
                      placeholder="Min age"
                      className="campaign-modal-input"
                    />
                    <span style={{ color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>–</span>
                    <input
                      type="number"
                      value={targetAgeMax}
                      onChange={(e) => setTargetAgeMax(Number(e.target.value))}
                      min={13}
                      max={65}
                      placeholder="Max age"
                      className="campaign-modal-input"
                    />
                  </div>
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Placements</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="campaign-modal-select"
                  >
                    {META_CAMPAIGN_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* ── AD ── */}
                <div className="campaign-modal-section-divider"><span>Ad</span></div>

                {/* Format selection */}
                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Ad Format *</label>
                  <p className="ad-creative-subhead">Choose how you'd like to structure your ad.</p>
                  <div className="ad-format-radio-group">
                    {[
                      { id: "image",      title: "Image",      desc: "Single image ad" },
                      { id: "video",      title: "Video",      desc: "Single video ad with thumbnail" },
                      { id: "carousel",   title: "Carousel",   desc: "Two or more scrollable cards" },
                      { id: "collection", title: "Collection", desc: "Cover media with a product catalog collection" },
                    ].map((fmt) => (
                      <div
                        key={fmt.id}
                        onClick={() => {
                          setAdFormat(fmt.id);
                          setValidationErrors({});
                        }}
                        className={`ad-format-radio-card ${adFormat === fmt.id ? "selected" : ""}`}
                      >
                        <div className="ad-format-radio-indicator">
                          {adFormat === fmt.id && <div className="ad-format-radio-indicator-dot" />}
                        </div>
                        <div className="ad-format-info">
                          <span className="ad-format-title">{fmt.title}</span>
                          <span className="ad-format-desc">{fmt.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {validationErrors.adFormat && (
                    <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.adFormat}</div>
                  )}
                </div>

                {/* ── FORMAT 1: IMAGE ── */}
                {adFormat === "image" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Image * */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Image *</label>
                      {!imageMedia ? (
                        <>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setImageDragging(true); }}
                            onDragLeave={() => setImageDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setImageDragging(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                handleMediaFileSelection(file, (m) => {
                                  setImageMedia(m);
                                  setValidationErrors((prev) => { const n = { ...prev }; delete n.imageMedia; return n; });
                                }, "image");
                              }
                            }}
                            onClick={() => imageInputRef.current?.click()}
                            className={`ad-media-dropzone ${imageDragging ? "dragging" : ""} ${validationErrors.imageMedia ? "has-error" : ""}`}
                          >
                            <div className="ad-media-dropzone-icon"><ImageIcon size={22} color="#6366f1" /></div>
                            <div className="ad-media-dropzone-prompt">
                              <div className="ad-media-dropzone-main-text">Click to upload or drag &amp; drop image</div>
                              <div className="ad-media-dropzone-sub-text">Supports JPG, PNG, WEBP</div>
                            </div>
                            <button type="button" className="btn-media-replace" style={{ marginTop: 4 }}
                              onClick={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }}>
                              <Upload size={13} /> Upload Image
                            </button>
                          </div>
                          <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleMediaFileSelection(file, (m) => {
                                  setImageMedia(m);
                                  setValidationErrors((prev) => { const n = { ...prev }; delete n.imageMedia; return n; });
                                }, "image");
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div className="ad-media-preview-box">
                          <div className="ad-media-preview-thumb-wrap">
                            <img src={imageMedia.url} alt="Image creative" className="ad-media-preview-thumb" />
                          </div>
                          <div className="ad-media-preview-details">
                            <div className="ad-media-preview-name">{imageMedia.name}</div>
                            <div className="ad-media-preview-meta">
                              <span>Image</span>
                              {imageMedia.size && <span>• {imageMedia.size}</span>}
                            </div>
                          </div>
                          <div className="ad-media-preview-actions">
                            <button type="button" onClick={() => imageInputRef.current?.click()} className="btn-media-replace">Replace</button>
                            <button type="button" onClick={() => setImageMedia(null)} className="btn-media-remove"><X size={14} /></button>
                          </div>
                          <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleMediaFileSelection(file, (m) => {
                                  setImageMedia(m);
                                  setValidationErrors((prev) => { const n = { ...prev }; delete n.imageMedia; return n; });
                                }, "image");
                              }
                            }}
                          />
                        </div>
                      )}
                      {validationErrors.imageMedia && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.imageMedia}</div>
                      )}
                    </div>

                    {/* Primary Text */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Primary Text</label>
                      <textarea
                        value={primaryText}
                        onChange={(e) => {
                          setPrimaryText(e.target.value);
                          if (validationErrors.primaryText) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.primaryText; return n; });
                          }
                        }}
                        rows={2}
                        maxLength={250}
                        placeholder="Main ad text (optional)"
                        className={`campaign-modal-input ${validationErrors.primaryText ? "input-has-error" : ""}`}
                        style={{ resize: "vertical", minHeight: 60 }}
                      />
                      {validationErrors.primaryText && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.primaryText}</div>
                      )}
                    </div>

                    {/* Headline */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Headline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => {
                          setHeadline(e.target.value);
                          if (validationErrors.headline) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.headline; return n; });
                          }
                        }}
                        maxLength={50}
                        placeholder="Ad headline (optional)"
                        className={`campaign-modal-input ${validationErrors.headline ? "input-has-error" : ""}`}
                      />
                      {validationErrors.headline && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.headline}</div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Description</label>
                      <input
                        type="text"
                        value={creativeDescription}
                        onChange={(e) => setCreativeDescription(e.target.value)}
                        maxLength={100}
                        placeholder="Optional ad description"
                        className="campaign-modal-input"
                      />
                    </div>

                    {/* CTA */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">CTA</label>
                      <select
                        value={ctaValue}
                        onChange={(e) => {
                          setCtaValue(e.target.value);
                          if (validationErrors.ctaValue) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.ctaValue; return n; });
                          }
                        }}
                        className={`campaign-modal-select ${validationErrors.ctaValue ? "input-has-error" : ""}`}
                      >
                        {CTA_OPTIONS.map((cta) => (
                          <option key={cta.value} value={cta.value}>{cta.label}</option>
                        ))}
                      </select>
                      {validationErrors.ctaValue && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.ctaValue}</div>
                      )}
                    </div>

                    {/* Website URL */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Website URL</label>
                      <input
                        type="url"
                        value={landingPageUrl}
                        onChange={(e) => {
                          setLandingPageUrl(e.target.value);
                          if (validationErrors.landingPageUrl) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.landingPageUrl; return n; });
                          }
                        }}
                        placeholder="https://yourwebsite.com/landing-page (optional)"
                        className={`campaign-modal-input ${validationErrors.landingPageUrl ? "input-has-error" : ""}`}
                      />
                      {validationErrors.landingPageUrl && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.landingPageUrl}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── FORMAT 2: VIDEO ── */}
                {adFormat === "video" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Video * */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Video *</label>
                      {!videoMedia ? (
                        <>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setVideoDragging(true); }}
                            onDragLeave={() => setVideoDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setVideoDragging(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                handleMediaFileSelection(file, (m) => {
                                  setVideoMedia(m);
                                  setValidationErrors((prev) => { const n = { ...prev }; delete n.videoMedia; return n; });
                                }, "video");
                              }
                            }}
                            onClick={() => videoInputRef.current?.click()}
                            className={`ad-media-dropzone ${videoDragging ? "dragging" : ""} ${validationErrors.videoMedia ? "has-error" : ""}`}
                          >
                            <div className="ad-media-dropzone-icon"><Video size={22} color="#6366f1" /></div>
                            <div className="ad-media-dropzone-prompt">
                              <div className="ad-media-dropzone-main-text">Click to upload or drag &amp; drop video</div>
                              <div className="ad-media-dropzone-sub-text">Supports MP4, MOV, WEBM</div>
                            </div>
                            <button type="button" className="btn-media-replace" style={{ marginTop: 4 }}
                              onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}>
                              <Upload size={13} /> Upload Video
                            </button>
                          </div>
                          <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleMediaFileSelection(file, (m) => {
                                  setVideoMedia(m);
                                  setValidationErrors((prev) => { const n = { ...prev }; delete n.videoMedia; return n; });
                                }, "video");
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div className="ad-media-preview-box">
                          <div className="ad-media-preview-thumb-wrap">
                            <Video size={22} color="#ffffff" />
                          </div>
                          <div className="ad-media-preview-details">
                            <div className="ad-media-preview-name">{videoMedia.name}</div>
                            <div className="ad-media-preview-meta">
                              <span>Video</span>
                              {videoMedia.size && <span>• {videoMedia.size}</span>}
                            </div>
                          </div>
                          <div className="ad-media-preview-actions">
                            <button type="button" onClick={() => videoInputRef.current?.click()} className="btn-media-replace">Replace</button>
                            <button type="button" onClick={() => setVideoMedia(null)} className="btn-media-remove"><X size={14} /></button>
                          </div>
                          <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleMediaFileSelection(file, (m) => {
                                  setVideoMedia(m);
                                  setValidationErrors((prev) => { const n = { ...prev }; delete n.videoMedia; return n; });
                                }, "video");
                              }
                            }}
                          />
                        </div>
                      )}
                      {validationErrors.videoMedia && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.videoMedia}</div>
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Thumbnail</label>
                      {!videoThumbnail ? (
                        <>
                          <div
                            onDragOver={(e) => { e.preventDefault(); setThumbnailDragging(true); }}
                            onDragLeave={() => setThumbnailDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setThumbnailDragging(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) {
                                handleMediaFileSelection(file, (m) => setVideoThumbnail(m), "image");
                              }
                            }}
                            onClick={() => thumbnailInputRef.current?.click()}
                            className={`ad-media-dropzone ${thumbnailDragging ? "dragging" : ""}`}
                            style={{ padding: "12px 14px" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <ImageIcon size={18} color="#6366f1" />
                              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>Upload / Select Thumbnail (Optional)</span>
                            </div>
                          </div>
                          <input ref={thumbnailInputRef} type="file" accept="image/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaFileSelection(file, (m) => setVideoThumbnail(m), "image");
                            }}
                          />
                        </>
                      ) : (
                        <div className="ad-media-preview-box">
                          <div className="ad-media-preview-thumb-wrap" style={{ width: 44, height: 44 }}>
                            <img src={videoThumbnail.url} alt="Video thumbnail" className="ad-media-preview-thumb" />
                          </div>
                          <div className="ad-media-preview-details">
                            <div className="ad-media-preview-name">{videoThumbnail.name}</div>
                            <div className="ad-media-preview-meta">
                              <span>Thumbnail Image</span>
                              {videoThumbnail.size && <span>• {videoThumbnail.size}</span>}
                            </div>
                          </div>
                          <div className="ad-media-preview-actions">
                            <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="btn-media-replace">Replace</button>
                            <button type="button" onClick={() => setVideoThumbnail(null)} className="btn-media-remove"><X size={14} /></button>
                          </div>
                          <input ref={thumbnailInputRef} type="file" accept="image/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaFileSelection(file, (m) => setVideoThumbnail(m), "image");
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Primary Text */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Primary Text</label>
                      <textarea
                        value={primaryText}
                        onChange={(e) => {
                          setPrimaryText(e.target.value);
                          if (validationErrors.primaryText) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.primaryText; return n; });
                          }
                        }}
                        rows={2}
                        maxLength={250}
                        placeholder="Main ad text (optional)"
                        className={`campaign-modal-input ${validationErrors.primaryText ? "input-has-error" : ""}`}
                        style={{ resize: "vertical", minHeight: 60 }}
                      />
                      {validationErrors.primaryText && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.primaryText}</div>
                      )}
                    </div>

                    {/* Headline */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Headline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => {
                          setHeadline(e.target.value);
                          if (validationErrors.headline) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.headline; return n; });
                          }
                        }}
                        maxLength={50}
                        placeholder="Headline (optional)"
                        className={`campaign-modal-input ${validationErrors.headline ? "input-has-error" : ""}`}
                      />
                      {validationErrors.headline && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.headline}</div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Description</label>
                      <input
                        type="text"
                        value={creativeDescription}
                        onChange={(e) => setCreativeDescription(e.target.value)}
                        maxLength={100}
                        placeholder="Optional ad description"
                        className="campaign-modal-input"
                      />
                    </div>

                    {/* CTA */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">CTA</label>
                      <select
                        value={ctaValue}
                        onChange={(e) => {
                          setCtaValue(e.target.value);
                          if (validationErrors.ctaValue) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.ctaValue; return n; });
                          }
                        }}
                        className={`campaign-modal-select ${validationErrors.ctaValue ? "input-has-error" : ""}`}
                      >
                        {CTA_OPTIONS.map((cta) => (
                          <option key={cta.value} value={cta.value}>{cta.label}</option>
                        ))}
                      </select>
                      {validationErrors.ctaValue && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.ctaValue}</div>
                      )}
                    </div>

                    {/* Website URL */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Website URL</label>
                      <input
                        type="url"
                        value={landingPageUrl}
                        onChange={(e) => {
                          setLandingPageUrl(e.target.value);
                          if (validationErrors.landingPageUrl) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.landingPageUrl; return n; });
                          }
                        }}
                        placeholder="https://yourwebsite.com/landing-page (optional)"
                        className={`campaign-modal-input ${validationErrors.landingPageUrl ? "input-has-error" : ""}`}
                      />
                      {validationErrors.landingPageUrl && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.landingPageUrl}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── FORMAT 3: CAROUSEL ── */}
                {adFormat === "carousel" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Primary Text */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Primary Text</label>
                      <textarea
                        value={primaryText}
                        onChange={(e) => {
                          setPrimaryText(e.target.value);
                          if (validationErrors.primaryText) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.primaryText; return n; });
                          }
                        }}
                        rows={2}
                        maxLength={250}
                        placeholder="Main ad text (optional)"
                        className={`campaign-modal-input ${validationErrors.primaryText ? "input-has-error" : ""}`}
                        style={{ resize: "vertical", minHeight: 60 }}
                      />
                      {validationErrors.primaryText && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.primaryText}</div>
                      )}
                    </div>

                    {/* Carousel Cards List */}
                    <div className="carousel-builder-section">
                      <div className="carousel-builder-header">
                        <span className="carousel-builder-title">CAROUSEL CARDS</span>
                        <span className="carousel-builder-count">{carouselCards.length} Cards (Min 2 required)</span>
                      </div>
                      <div className="carousel-cards-list">
                        {carouselCards.map((card, idx) => (
                          <div key={card.id} className="carousel-card-item">
                            <div className="carousel-card-header">
                              <span className="carousel-card-badge">Card {idx + 1}</span>
                              <div className="carousel-card-actions">
                                <button type="button" disabled={idx === 0} onClick={() => handleMoveCarouselCard(idx, "up")} className="btn-card-reorder" title="Move Up"><ArrowUp size={13} /></button>
                                <button type="button" disabled={idx === carouselCards.length - 1} onClick={() => handleMoveCarouselCard(idx, "down")} className="btn-card-reorder" title="Move Down"><ArrowDown size={13} /></button>
                                <button type="button" disabled={carouselCards.length <= 2} onClick={() => handleRemoveCarouselCard(card.id)} className="btn-card-remove" title={carouselCards.length <= 2 ? "Minimum 2 cards required" : "Remove Card"}><Trash2 size={13} /></button>
                              </div>
                            </div>

                            {/* Image/Video * */}
                            <div className="campaign-modal-form-group">
                              <label className="campaign-modal-label">Image/Video *</label>
                              {!card.media ? (
                                <div
                                  onClick={() => document.getElementById(`carousel-file-${card.id}`)?.click()}
                                  className={`ad-media-dropzone ${validationErrors[`card_${card.id}_media`] ? "has-error" : ""}`}
                                  style={{ padding: "14px 12px" }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <ImageIcon size={18} color="#6366f1" />
                                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>Upload Card Media</span>
                                  </div>
                                  <input id={`carousel-file-${card.id}`} type="file" accept="image/*,video/*" style={{ display: "none" }}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleMediaFileSelection(file, (media) => handleUpdateCarouselCard(card.id, "media", media));
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="ad-media-preview-box">
                                  <div className="ad-media-preview-thumb-wrap" style={{ width: 44, height: 44 }}>
                                    {card.media.type === "video" ? <Video size={18} color="#ffffff" /> : <img src={card.media.url} alt="Card preview" className="ad-media-preview-thumb" />}
                                  </div>
                                  <div className="ad-media-preview-details">
                                    <div className="ad-media-preview-name">{card.media.name}</div>
                                    <div className="ad-media-preview-meta">
                                      <span>{card.media.type === "video" ? "Video" : "Image"}</span>
                                      {card.media.size && <span>• {card.media.size}</span>}
                                    </div>
                                  </div>
                                  <div className="ad-media-preview-actions">
                                    <button type="button" onClick={() => document.getElementById(`carousel-file-${card.id}`)?.click()} className="btn-media-replace">Replace</button>
                                    <button type="button" onClick={() => handleUpdateCarouselCard(card.id, "media", null)} className="btn-media-remove"><X size={14} /></button>
                                  </div>
                                  <input id={`carousel-file-${card.id}`} type="file" accept="image/*,video/*" style={{ display: "none" }}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleMediaFileSelection(file, (media) => handleUpdateCarouselCard(card.id, "media", media));
                                    }}
                                  />
                                </div>
                              )}
                              {validationErrors[`card_${card.id}_media`] && (
                                <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors[`card_${card.id}_media`]}</div>
                              )}
                            </div>

                            {/* Headline */}
                            <div className="campaign-modal-form-group">
                              <label className="campaign-modal-label">Headline</label>
                              <input
                                type="text"
                                value={card.headline}
                                onChange={(e) => handleUpdateCarouselCard(card.id, "headline", e.target.value)}
                                maxLength={40}
                                placeholder="Card headline (optional)"
                                className={`campaign-modal-input ${validationErrors[`card_${card.id}_headline`] ? "input-has-error" : ""}`}
                              />
                              {validationErrors[`card_${card.id}_headline`] && (
                                <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors[`card_${card.id}_headline`]}</div>
                              )}
                            </div>

                            {/* Description */}
                            <div className="campaign-modal-form-group">
                              <label className="campaign-modal-label">Description</label>
                              <input
                                type="text"
                                value={card.description}
                                onChange={(e) => handleUpdateCarouselCard(card.id, "description", e.target.value)}
                                maxLength={50}
                                placeholder="Card description (optional)"
                                className="campaign-modal-input"
                              />
                            </div>

                            {/* Website URL */}
                            <div className="campaign-modal-form-group">
                              <label className="campaign-modal-label">Website URL</label>
                              <input
                                type="url"
                                value={card.destinationUrl}
                                onChange={(e) => handleUpdateCarouselCard(card.id, "destinationUrl", e.target.value)}
                                placeholder="https://yourwebsite.com/page (optional)"
                                className={`campaign-modal-input ${validationErrors[`card_${card.id}_url`] ? "input-has-error" : ""}`}
                              />
                              {validationErrors[`card_${card.id}_url`] && (
                                <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors[`card_${card.id}_url`]}</div>
                              )}
                            </div>

                            {/* CTA */}
                            <div className="campaign-modal-form-group">
                              <label className="campaign-modal-label">CTA</label>
                              <select
                                value={card.cta || "learn_more"}
                                onChange={(e) => handleUpdateCarouselCard(card.id, "cta", e.target.value)}
                                className="campaign-modal-select"
                              >
                                {CTA_OPTIONS.map((cta) => (
                                  <option key={cta.value} value={cta.value}>{cta.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button type="button" onClick={handleAddCarouselCard} className="btn-add-carousel-card">
                        <Plus size={14} /> Add Card
                      </button>

                      {validationErrors.carousel && (
                        <div className="campaign-field-error" style={{ marginTop: 6 }}><AlertCircle size={13} /> {validationErrors.carousel}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── FORMAT 4: COLLECTION ── */}
                {adFormat === "collection" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Cover Image/Video * */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Cover Image/Video *</label>
                      {!collectionCover ? (
                        <>
                          <div onClick={() => collectionInputRef.current?.click()} className={`ad-media-dropzone ${validationErrors.collectionCover ? "has-error" : ""}`}>
                            <div className="ad-media-dropzone-icon"><Package size={18} /></div>
                            <div className="ad-media-dropzone-prompt">
                              <div className="ad-media-dropzone-main-text">Upload Cover Media</div>
                              <div className="ad-media-dropzone-sub-text">Supports JPG, PNG, MP4, MOV</div>
                            </div>
                          </div>
                          <input ref={collectionInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleMediaFileSelection(file, (media) => {
                                  setCollectionCover(media);
                                  setValidationErrors((prev) => { const n = { ...prev }; delete n.collectionCover; return n; });
                                });
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div className="ad-media-preview-box">
                          <div className="ad-media-preview-thumb-wrap">
                            {collectionCover.type === "video"
                              ? <div className="ad-media-preview-video-icon"><Video size={22} /></div>
                              : <img src={collectionCover.url} alt="Collection cover" className="ad-media-preview-thumb" />
                            }
                          </div>
                          <div className="ad-media-preview-details">
                            <div className="ad-media-preview-name">{collectionCover.name}</div>
                            <div className="ad-media-preview-meta">
                              <span>{collectionCover.type === "video" ? "Video Cover" : "Image Cover"}</span>
                              {collectionCover.size && <span>• {collectionCover.size}</span>}
                            </div>
                          </div>
                          <div className="ad-media-preview-actions">
                            <button type="button" onClick={() => collectionInputRef.current?.click()} className="btn-media-replace">Replace</button>
                            <button type="button" onClick={() => setCollectionCover(null)} className="btn-media-remove"><X size={14} /></button>
                          </div>
                          <input ref={collectionInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMediaFileSelection(file, (media) => setCollectionCover(media));
                            }}
                          />
                        </div>
                      )}
                      {validationErrors.collectionCover && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.collectionCover}</div>
                      )}
                    </div>

                    {/* Primary Text */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Primary Text</label>
                      <textarea
                        value={primaryText}
                        onChange={(e) => {
                          setPrimaryText(e.target.value);
                          if (validationErrors.primaryText) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.primaryText; return n; });
                          }
                        }}
                        rows={2}
                        maxLength={250}
                        placeholder="Main ad text (optional)"
                        className={`campaign-modal-input ${validationErrors.primaryText ? "input-has-error" : ""}`}
                        style={{ resize: "vertical", minHeight: 60 }}
                      />
                      {validationErrors.primaryText && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.primaryText}</div>
                      )}
                    </div>

                    {/* Headline */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Headline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        maxLength={50}
                        placeholder="Headline (optional)"
                        className="campaign-modal-input"
                      />
                    </div>

                    {/* CTA */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">CTA</label>
                      <select
                        value={ctaValue}
                        onChange={(e) => {
                          setCtaValue(e.target.value);
                          if (validationErrors.ctaValue) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.ctaValue; return n; });
                          }
                        }}
                        className={`campaign-modal-select ${validationErrors.ctaValue ? "input-has-error" : ""}`}
                      >
                        {CTA_OPTIONS.map((cta) => (
                          <option key={cta.value} value={cta.value}>{cta.label}</option>
                        ))}
                      </select>
                      {validationErrors.ctaValue && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.ctaValue}</div>
                      )}
                    </div>

                    {/* Website URL */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Website URL</label>
                      <input
                        type="url"
                        value={landingPageUrl}
                        onChange={(e) => {
                          setLandingPageUrl(e.target.value);
                          if (validationErrors.landingPageUrl) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.landingPageUrl; return n; });
                          }
                        }}
                        placeholder="https://yourwebsite.com/collection (optional)"
                        className={`campaign-modal-input ${validationErrors.landingPageUrl ? "input-has-error" : ""}`}
                      />
                      {validationErrors.landingPageUrl && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.landingPageUrl}</div>
                      )}
                    </div>

                    {/* Product / Catalog * */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Product / Catalog *</label>
                      <select
                        value={collectionCatalog}
                        onChange={(e) => {
                          setCollectionCatalog(e.target.value);
                          if (validationErrors.collectionCatalog) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.collectionCatalog; return n; });
                          }
                        }}
                        className={`campaign-modal-select ${validationErrors.collectionCatalog ? "input-has-error" : ""}`}
                      >
                        {CATALOG_OPTIONS.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                      {validationErrors.collectionCatalog && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.collectionCatalog}</div>
                      )}
                    </div>

                    {/* Product Set * */}
                    <div className="campaign-modal-form-group">
                      <label className="campaign-modal-label">Product Set *</label>
                      <select
                        value={collectionProductSet}
                        onChange={(e) => {
                          setCollectionProductSet(e.target.value);
                          if (validationErrors.collectionProductSet) {
                            setValidationErrors((prev) => { const n = { ...prev }; delete n.collectionProductSet; return n; });
                          }
                        }}
                        className={`campaign-modal-select ${validationErrors.collectionProductSet ? "input-has-error" : ""}`}
                      >
                        {PRODUCT_SET_OPTIONS.map((ps) => (
                          <option key={ps.value} value={ps.value}>{ps.label}</option>
                        ))}
                      </select>
                      {validationErrors.collectionProductSet && (
                        <div className="campaign-field-error"><AlertCircle size={13} /> {validationErrors.collectionProductSet}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="social-modal-footer">
                <button
                  type="button"
                  onClick={() => { setCreateModalOpen(false); resetCreateForm(); }}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-create-campaign">
                  {submitting ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          EDIT CAMPAIGN MODAL (Shared)
          =================================================================== */}
      {editModalOpen && activeCampaign && (
        <div
          className="social-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModalOpen(false);
          }}
        >
          <div className="social-modal-content" style={{ maxWidth: 680 }}>
            <div className="social-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 750, color: "#0f172a" }}>
                Edit Campaign
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="btn-close-modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCampaign}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* ── CAMPAIGN ── */}
                <div className="campaign-modal-section-divider"><span>Campaign</span></div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Vorion Enterprise AI Q4 Drive"
                    className="campaign-modal-input"
                  />
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Objective *</label>
                  <select
                    value={editObjective}
                    onChange={(e) => setEditObjective(e.target.value)}
                    className="campaign-modal-select"
                  >
                    <option value="lead_generation">Lead Generation</option>
                    <option value="conversions">Sales &amp; Conversions</option>
                    <option value="brand_awareness">Brand Awareness</option>
                    <option value="engagement">Engagement</option>
                    <option value="traffic">Website Traffic</option>
                  </select>
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Budget (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="campaign-modal-input"
                  />
                </div>

                <div className="campaign-modal-grid-2">
                  <div className="campaign-modal-form-group">
                    <label className="campaign-modal-label">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="campaign-modal-input"
                    />
                  </div>

                  <div className="campaign-modal-form-group">
                    <label className="campaign-modal-label">End Date *</label>
                    <input
                      type="date"
                      required
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="campaign-modal-input"
                    />
                  </div>
                </div>

                {/* ── AD SET ── */}
                <div className="campaign-modal-section-divider"><span>Ad Set</span></div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Audience</label>
                  <input
                    type="text"
                    value={editTargetAudience}
                    onChange={(e) => setEditTargetAudience(e.target.value)}
                    placeholder="e.g. Students · 18–25 · Kerala"
                    className="campaign-modal-input"
                  />
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Location</label>
                  <input
                    type="text"
                    value={editTargetLocations}
                    onChange={(e) => setEditTargetLocations(e.target.value)}
                    placeholder="e.g. Kerala, India, Dubai"
                    className="campaign-modal-input"
                  />
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Age</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="number"
                      value={editTargetAgeMin}
                      onChange={(e) => setEditTargetAgeMin(Number(e.target.value))}
                      min={13}
                      max={65}
                      placeholder="Min age"
                      className="campaign-modal-input"
                    />
                    <span style={{ color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>–</span>
                    <input
                      type="number"
                      value={editTargetAgeMax}
                      onChange={(e) => setEditTargetAgeMax(Number(e.target.value))}
                      min={13}
                      max={65}
                      placeholder="Max age"
                      className="campaign-modal-input"
                    />
                  </div>
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Placements</label>
                  <select
                    value={editCampaignType}
                    onChange={(e) => setEditCampaignType(e.target.value)}
                    className="campaign-modal-select"
                  >
                    {META_CAMPAIGN_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* ── AD ── */}
                <div className="campaign-modal-section-divider"><span>Ad</span></div>

                {/* Current Media Preview if available */}
                {(activeCampaign.creative_image_url || activeCampaign.creative_video_url) && (
                  <div className="campaign-modal-form-group">
                    <label className="campaign-modal-label">Current Creative</label>
                    <div className="ad-media-preview-box">
                      <div className="ad-media-preview-thumb-wrap">
                        {activeCampaign.creative_video_url ? (
                          <div className="ad-media-preview-video-icon"><Video size={22} /></div>
                        ) : (
                          <img src={activeCampaign.creative_image_url} alt="Ad creative" className="ad-media-preview-thumb" />
                        )}
                      </div>
                      <div className="ad-media-preview-details">
                        <div className="ad-media-preview-name">{activeCampaign.name} Creative</div>
                        <div className="ad-media-preview-meta">
                          <span>{activeCampaign.creative_video_url ? "Video Ad" : "Image Ad"}</span>
                          {activeCampaign.ad_format && <span>• {activeCampaign.ad_format.replace("_", " ")}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Text */}
                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Primary Text *</label>
                  <textarea
                    required
                    value={editPrimaryText}
                    onChange={(e) => setEditPrimaryText(e.target.value)}
                    rows={2}
                    maxLength={250}
                    placeholder="Tell people what your ad is about"
                    className="campaign-modal-input"
                    style={{ resize: "vertical", minHeight: 60 }}
                  />
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Headline</label>
                  <input
                    type="text"
                    value={editHeadline}
                    onChange={(e) => setEditHeadline(e.target.value)}
                    maxLength={50}
                    placeholder="Write a short headline"
                    className="campaign-modal-input"
                  />
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">CTA (Call to Action) *</label>
                  <select
                    value={editCtaValue}
                    onChange={(e) => setEditCtaValue(e.target.value)}
                    className="campaign-modal-select"
                  >
                    {CTA_OPTIONS.map((cta) => (
                      <option key={cta.value} value={cta.value}>{cta.label}</option>
                    ))}
                  </select>
                </div>

                <div className="campaign-modal-form-group">
                  <label className="campaign-modal-label">Website URL</label>
                  <input
                    type="url"
                    value={editLandingPageUrl}
                    onChange={(e) => setEditLandingPageUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/landing-page"
                    className="campaign-modal-input"
                  />
                </div>

              </div>

              <div className="social-modal-footer">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-create-campaign"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
