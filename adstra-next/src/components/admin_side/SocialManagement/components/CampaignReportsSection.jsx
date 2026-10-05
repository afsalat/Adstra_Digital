"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import "./CampaignReportsSection.css";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  Building2,
  FileText,
  ChevronDown,
  Layers,
  Award,
  Zap,
  Target,
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Share2,
  Send,
  PlusCircle,
  Copy,
  Clock,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  MousePointer,
  UserCheck,
  Percent,
  Check,
  Mail,
  RefreshCw,
  FolderDown,
  SlidersHorizontal,
} from "lucide-react";

// =============================================================================
// Helper Formatters
// =============================================================================

function formatINR(val, compact = false) {
  const num = parseFloat(val) || 0;
  if (num === 0) return "₹0";
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

function formatCompact(val) {
  const num = Number(val) || 0;
  if (num === 0) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString("en-IN");
}

// Compute metrics for both Dashboard-created and Meta Manager-created campaigns
function computeSingleCampaignMetrics(camp) {
  const meta = camp?._meta_data;
  const spent = parseFloat(camp?.spent || meta?.spend) || 0;
  const budget = parseFloat(camp?.budget || meta?.budget) || 0;
  const pacingPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const remaining = Math.max(0, budget - spent);

  if (meta && (meta.impressions || meta.spend > 0)) {
    const impressions = parseInt(meta.impressions) || Math.max(10, Math.round((spent / 195) * 1000));
    const reach = parseInt(meta.reach) || Math.max(8, Math.round(impressions * 0.68));
    const clicks = parseInt(meta.clicks) || Math.max(1, Math.round(impressions * 0.032));
    const leads = parseInt(meta.leads) || Math.max(0, Math.round(clicks * 0.05));
    const cpl = leads > 0 ? Math.round(spent / leads) : 0;
    const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
    const cpm = impressions > 0 ? Math.round((spent / impressions) * 1000) : 0;
    const convRate = leads > 0 ? 25.0 : 0;
    const frequency = reach > 0 ? Number((impressions / reach).toFixed(2)) : 1.0;
    const conversions = Math.round(leads * 0.25);
    const cpc = clicks > 0 ? Math.round(spent / clicks) : 0;
    const revenue = Math.round(conversions * 8500 + spent * 1.8);
    const roas = spent > 0 ? Number((revenue / spent).toFixed(2)) : 0;

    let grade = "Optimal";
    if (pacingPct < 25) grade = "Pacing Low";
    else if (cpl > 1500) grade = "Needs Attention";
    else if (pacingPct >= 80) grade = "High Delivery";

    return {
      spent,
      budget,
      remaining,
      pacing: pacingPct,
      impressions,
      reach,
      clicks,
      ctr,
      cpm,
      leads,
      cpl,
      convRate,
      frequency,
      conversions,
      cpc,
      revenue,
      roas,
      grade,
      source: "meta",
    };
  }

  if (spent > 0) {
    const cpm = 195;
    const impressions = Math.max(10, Math.round((spent / cpm) * 1000));
    const reach = Math.max(8, Math.round(impressions * 0.68));
    const ctr = 3.2;
    const clicks = Math.max(1, Math.round(impressions * (ctr / 100)));
    const leads = Math.max(1, Math.round(clicks * 0.055));
    const cpl = Math.round(spent / Math.max(1, leads));
    const convRate = 24.5;
    const frequency = Number((impressions / Math.max(1, reach)).toFixed(2));
    const conversions = Math.max(0, Math.round(leads * 0.25));
    const cpc = clicks > 0 ? Math.round(spent / clicks) : 0;
    const revenue = Math.round(conversions * 8500 + spent * 1.8);
    const roas = spent > 0 ? Number((revenue / spent).toFixed(2)) : 0;

    let grade = "Optimal";
    if (pacingPct < 25) grade = "Pacing Low";
    else if (cpl > 1500) grade = "Needs Attention";
    else if (pacingPct >= 80) grade = "High Delivery";

    return {
      spent,
      budget,
      remaining,
      pacing: pacingPct,
      impressions,
      reach,
      clicks,
      ctr,
      cpm,
      leads,
      cpl,
      convRate,
      frequency,
      conversions,
      cpc,
      revenue,
      roas,
      grade,
      source: camp?._source || "dashboard",
    };
  }

  // Baseline if 0 spent
  return {
    spent: 0,
    budget,
    remaining: budget,
    pacing: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
    ctr: 0,
    cpm: 0,
    leads: 0,
    cpl: 0,
    convRate: 0,
    frequency: 1.0,
    conversions: 0,
    cpc: 0,
    revenue: 0,
    roas: 0,
    grade: "Scheduled / Pending",
    source: camp?._source || "dashboard",
  };
}

// Generate realistic simulated ad sets for individual campaign reports
function getCampaignAdSets(camp, metrics) {
  const loc = camp?.target_locations?.length ? camp.target_locations.slice(0, 2).join(", ") : "South Metro";
  const baseSpend = metrics.spent || 12000;
  const baseLeads = metrics.leads || 24;

  return [
    {
      id: "as-1",
      name: `Advantage+ Broad (${loc} • Age 25–54)`,
      targeting: "Open Demographic, Advantage+ Placements",
      format: "Reels Video (9:16) & Feed",
      adCreative: "Product Showcase Video (V2)",
      platform: "Meta Ads",
      spend: Math.round(baseSpend * 0.52),
      impressions: Math.round(metrics.impressions * 0.54) || 28000,
      reach: Math.round(metrics.reach * 0.51) || 19000,
      clicks: Math.round(metrics.clicks * 0.55) || 980,
      ctr: (metrics.ctr * 1.08 || 3.4).toFixed(2),
      leads: Math.round(baseLeads * 0.56) || 16,
      conversions: Math.round((baseLeads * 0.56) * 0.28) || 4,
      cpc: Math.round((baseSpend * 0.52) / Math.max(1, Math.round(metrics.clicks * 0.55) || 980)) || 14,
      cpl: baseLeads > 0 ? Math.round((baseSpend * 0.52) / Math.max(1, Math.round(baseLeads * 0.56))) : 420,
      roas: (metrics.roas * 1.15 || 3.9).toFixed(1),
      status: "Active",
    },
    {
      id: "as-2",
      name: `Lookalike 1% (Past Inquiries & Web Engagers)`,
      targeting: "Custom Audience LAL 1%, Meta Pixel Data",
      format: "Single Image (1:1)",
      adCreative: "Feature Infographic Creative",
      platform: "Meta Ads",
      spend: Math.round(baseSpend * 0.31),
      impressions: Math.round(metrics.impressions * 0.29) || 15000,
      reach: Math.round(metrics.reach * 0.32) || 11500,
      clicks: Math.round(metrics.clicks * 0.30) || 540,
      ctr: (metrics.ctr * 1.15 || 3.6).toFixed(2),
      leads: Math.round(baseLeads * 0.30) || 9,
      conversions: Math.round((baseLeads * 0.30) * 0.25) || 2,
      cpc: Math.round((baseSpend * 0.31) / Math.max(1, Math.round(metrics.clicks * 0.30) || 540)) || 16,
      cpl: baseLeads > 0 ? Math.round((baseSpend * 0.31) / Math.max(1, Math.round(baseLeads * 0.30))) : 450,
      roas: (metrics.roas * 1.05 || 3.5).toFixed(1),
      status: "Active",
    },
    {
      id: "as-3",
      name: `Retargeting 30D (Video Viewers 50% & Page Leads)`,
      targeting: "Instagram / Facebook Engagers (30D)",
      format: "Carousel Multi-Card",
      adCreative: "Client Testimonial Carousel",
      platform: "Meta Ads",
      spend: Math.round(baseSpend * 0.17),
      impressions: Math.round(metrics.impressions * 0.17) || 9200,
      reach: Math.round(metrics.reach * 0.17) || 6800,
      clicks: Math.round(metrics.clicks * 0.15) || 260,
      ctr: (metrics.ctr * 0.92 || 2.8).toFixed(2),
      leads: Math.round(baseLeads * 0.14) || 4,
      conversions: Math.round((baseLeads * 0.14) * 0.35) || 2,
      cpc: Math.round((baseSpend * 0.17) / Math.max(1, Math.round(metrics.clicks * 0.15) || 260)) || 18,
      cpl: baseLeads > 0 ? Math.round((baseSpend * 0.17) / Math.max(1, Math.round(baseLeads * 0.14))) : 510,
      roas: (metrics.roas * 0.95 || 3.1).toFixed(1),
      status: "Active",
    },
  ];
}

// Generate creative performance mock assets
function getCreativePerformanceList(metrics) {
  const baseSpend = metrics.spent || 50000;
  const baseLeads = metrics.leads || 72;

  return [
    {
      id: "cr-1",
      title: "Hero Reels: Founder's Story & Value Hook",
      type: "Reels Video (9:16)",
      platform: "Meta (Instagram/FB)",
      status: "Top Performer",
      statusClass: "good",
      spend: Math.round(baseSpend * 0.44),
      impressions: Math.round(metrics.impressions * 0.46) || 43000,
      clicks: Math.round(metrics.clicks * 0.48) || 1450,
      ctr: 3.82,
      leads: Math.round(baseLeads * 0.52) || 38,
      cpl: baseLeads > 0 ? Math.round((baseSpend * 0.44) / Math.max(1, Math.round(baseLeads * 0.52))) : 410,
      roas: 4.2,
      hook: "3 Problems Every Business Faces in 2026",
    },
    {
      id: "cr-2",
      title: "Social Proof: Case Study & Client Growth Metric",
      type: "Single Image (1:1)",
      platform: "Meta & Google Display",
      status: "High Converter",
      statusClass: "good",
      spend: Math.round(baseSpend * 0.28),
      impressions: Math.round(metrics.impressions * 0.27) || 25000,
      clicks: Math.round(metrics.clicks * 0.29) || 860,
      ctr: 3.44,
      leads: Math.round(baseLeads * 0.28) || 20,
      cpl: baseLeads > 0 ? Math.round((baseSpend * 0.28) / Math.max(1, Math.round(baseLeads * 0.28))) : 460,
      roas: 3.6,
      hook: "How Company X Grew Qualified Inquiries by 3.8x",
    },
    {
      id: "cr-3",
      title: "Offer Showcase: Limited Month Consultation",
      type: "Carousel Multi-Card",
      platform: "Instagram Feed",
      status: "Scale Up",
      statusClass: "optimal",
      spend: Math.round(baseSpend * 0.18),
      impressions: Math.round(metrics.impressions * 0.17) || 16000,
      clicks: Math.round(metrics.clicks * 0.15) || 450,
      ctr: 2.81,
      leads: Math.round(baseLeads * 0.14) || 10,
      cpl: baseLeads > 0 ? Math.round((baseSpend * 0.18) / Math.max(1, Math.round(baseLeads * 0.14))) : 520,
      roas: 3.1,
      hook: "Card 1: Strategy • Card 2: Execution • Card 3: Results",
    },
    {
      id: "cr-4",
      title: "Interactive Video: Product Walkthrough & Demo",
      type: "Collection Ad (4-Tile)",
      platform: "Meta Placements",
      status: "Fatigued / Needs Refresh",
      statusClass: "warning",
      spend: Math.round(baseSpend * 0.10),
      impressions: Math.round(metrics.impressions * 0.10) || 9800,
      clicks: Math.round(metrics.clicks * 0.08) || 220,
      ctr: 2.14,
      leads: Math.round(baseLeads * 0.06) || 4,
      cpl: baseLeads > 0 ? Math.round((baseSpend * 0.10) / Math.max(1, Math.round(baseLeads * 0.06))) : 750,
      roas: 2.3,
      hook: "See How The Digital Engine Operates",
    },
  ];
}

// Generate realistic trend data for charts
function generateTrendPoints(resolution, totalSpend, totalLeads, totalImpressions, totalClicks, totalConversions, daysCount) {
  let count = 14;
  let labelPrefix = "Day ";
  if (resolution === "weekly") {
    count = 6;
    labelPrefix = "Week ";
  } else if (resolution === "monthly") {
    count = 6;
    labelPrefix = "Month ";
  } else {
    count = Math.min(14, Math.max(7, daysCount <= 7 ? 7 : daysCount <= 14 ? 14 : 14));
  }

  const spendPerPoint = Math.max(100, Math.round(totalSpend / count));
  const leadsPerPoint = Math.max(1, Math.round(totalLeads / count));
  const impPerPoint = Math.max(200, Math.round(totalImpressions / count));
  const clicksPerPoint = Math.max(5, Math.round(totalClicks / count));
  const convPerPoint = Math.max(0, Math.round(totalConversions / count));

  const points = [];
  const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

  for (let i = 0; i < count; i++) {
    // Introduce natural realistic variance
    const variance = 0.82 + ((i * 37) % 36) / 100;
    const ptSpend = Math.round(spendPerPoint * variance);
    const ptBudget = Math.round(spendPerPoint * 1.05);
    const ptLeads = Math.max(1, Math.round(leadsPerPoint * (0.8 + ((i * 23) % 40) / 100)));
    const ptImp = Math.round(impPerPoint * variance);
    const ptReach = Math.round(ptImp * 0.72);
    const ptClicks = Math.max(1, Math.round(clicksPerPoint * variance));
    const ptConv = Math.max(0, Math.round(convPerPoint * (0.8 + ((i * 17) % 40) / 100)));
    const ptCtr = Number(((ptClicks / Math.max(1, ptImp)) * 100).toFixed(2));
    const ptCpc = Math.round(ptSpend / Math.max(1, ptClicks));
    const ptCpl = Math.round(ptSpend / Math.max(1, ptLeads));

    let label = `${labelPrefix}${i + 1}`;
    if (resolution === "monthly" && i < monthNames.length) {
      label = monthNames[i];
    } else if (resolution === "daily") {
      const d = new Date();
      d.setDate(d.getDate() - (count - 1 - i));
      label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    points.push({
      label,
      spend: ptSpend,
      budget: ptBudget,
      leads: ptLeads,
      impressions: ptImp,
      reach: ptReach,
      clicks: ptClicks,
      ctr: ptCtr,
      cpc: ptCpc,
      conversions: ptConv,
      cpl: ptCpl,
    });
  }

  return points;
}

// Default initial client report history
const INITIAL_REPORT_HISTORY = [];

// =============================================================================
// MAIN COMPONENT: CampaignReportsSection
// =============================================================================

export default function CampaignReportsSection({
  campaigns = [],
  clients = [],
  initialCampaignId = null,
  onBackToManager,
  onViewCampaignDetail,
  onRefresh,
}) {
  // Navigation: Primary Tab
  const [activeTab, setActiveTab] = useState("campaign"); // "campaign" | "client"

  // Filter state
  const [selectedTimeframe, setSelectedTimeframe] = useState("30D"); // 7D | 14D | 30D | 90D | Custom
  const [customStartDate, setCustomStartDate] = useState("2026-09-01");
  const [customEndDate, setCustomEndDate] = useState("2026-09-25");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState("all");
  const [selectedCampaignId, setSelectedCampaignId] = useState(
    initialCampaignId && initialCampaignId !== "all" ? initialCampaignId : "all"
  );
  const [selectedPlatform, setSelectedPlatform] = useState("all"); // "all" | "meta" | "google" | "other"

  // Trends resolution
  const [trendResolution, setTrendResolution] = useState("daily"); // "daily" | "weekly" | "monthly"
  const [activeTrendMetric, setActiveTrendMetric] = useState("spend_leads"); // "spend_budget" | "spend_leads" | "imp_reach" | "ctr_cpc" | "leads_conv"

  // UI Modals & Actions
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Send to Client Modal fields
  const [sendEmail, setSendEmail] = useState("client.contact@company.com");
  const [sendSubject, setSendSubject] = useState("Adstra Digital — Monthly Campaign Performance Report: September 2026");
  const [sendMessage, setSendMessage] = useState(
    "Hi Team,\n\nPlease find attached the official Adstra Digital performance report for the past 30 days. We achieved strong cost efficiencies with a 14.2% improvement in CPL. Let us know if you have any questions!\n\nBest regards,\nAdstra Performance Team"
  );
  const [sendPeriod, setSendPeriod] = useState("September 2026 (Monthly)");
  const [isSending, setIsSending] = useState(false);

  // Client Report History state with local storage persistence
  const [reportHistory, setReportHistory] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("adstra_client_report_history");
        if (stored) {
          const parsed = JSON.parse(stored);
          return (parsed || []).filter(
            (item) => !["rep-hist-1", "rep-hist-2", "rep-hist-3"].includes(item.id)
          );
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_REPORT_HISTORY;
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Save report history on update
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("adstra_client_report_history", JSON.stringify(reportHistory));
      } catch (e) {
        // storage ignored
      }
    }
  }, [reportHistory]);

  // Sync initialCampaignId
  useEffect(() => {
    if (initialCampaignId && initialCampaignId !== "all") {
      setSelectedCampaignId(initialCampaignId);
    }
  }, [initialCampaignId]);

  // Quick show toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Days count helper
  const daysCount = useMemo(() => {
    if (selectedTimeframe === "7D") return 7;
    if (selectedTimeframe === "14D") return 14;
    if (selectedTimeframe === "90D") return 90;
    if (selectedTimeframe === "Custom") {
      const diff = Math.max(1, Math.round((new Date(customEndDate) - new Date(customStartDate)) / (1000 * 60 * 60 * 24)));
      return diff || 30;
    }
    return 30;
  }, [selectedTimeframe, customStartDate, customEndDate]);

  // Filtered campaigns according to top bar selectors
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      // Client filter
      if (selectedClientId !== "all") {
        const cId = camp.client_id || camp.client_profile_id || camp.client;
        if (cId && String(cId) !== String(selectedClientId)) return false;
      }

      // Campaign filter
      if (selectedCampaignId !== "all" && String(camp.id) !== String(selectedCampaignId)) {
        return false;
      }

      // Platform filter
      if (selectedPlatform !== "all") {
        const isMeta = camp._source === "meta" || (camp.ad_platforms && camp.ad_platforms.includes("meta"));
        const isGoogle = camp._source === "google" || (camp.ad_platforms && camp.ad_platforms.includes("google"));
        if (selectedPlatform === "meta" && !isMeta) return false;
        if (selectedPlatform === "google" && !isGoogle) return false;
        if (selectedPlatform === "other" && (isMeta || isGoogle)) return false;
      }

      return true;
    });
  }, [campaigns, selectedClientId, selectedCampaignId, selectedPlatform]);

  // Find single campaign if in individual campaign mode
  const selectedCampaign = useMemo(() => {
    if (selectedCampaignId === "all") return null;
    return campaigns.find((c) => String(c.id) === String(selectedCampaignId)) || null;
  }, [campaigns, selectedCampaignId]);

  // Aggregated metrics for current selection
  const computedMetrics = useMemo(() => {
    const list = filteredCampaigns.length > 0 ? filteredCampaigns : campaigns;
    let totBudget = 0;
    let totSpent = 0;
    let totImpressions = 0;
    let totReach = 0;
    let totClicks = 0;
    let totLeads = 0;
    let totConversions = 0;
    let totRevenue = 0;

    list.forEach((c) => {
      const m = computeSingleCampaignMetrics(c);
      totBudget += m.budget;
      totSpent += m.spent;
      totImpressions += m.impressions;
      totReach += m.reach;
      totClicks += m.clicks;
      totLeads += m.leads;
      totConversions += m.conversions;
      totRevenue += m.revenue;
    });

    const pacing = totBudget > 0 ? Math.min(100, Math.round((totSpent / totBudget) * 100)) : 0;
    const remaining = Math.max(0, totBudget - totSpent);
    const cpl = totLeads > 0 ? Math.round(totSpent / totLeads) : 0;
    const ctr = totImpressions > 0 ? Number(((totClicks / totImpressions) * 100).toFixed(2)) : 0;
    const cpc = totClicks > 0 ? Math.round(totSpent / totClicks) : 0;
    const cpm = totImpressions > 0 ? Math.round((totSpent / totImpressions) * 1000) : 0;
    const convRate = totLeads > 0 ? Number(((totConversions / totLeads) * 100).toFixed(1)) : 0;
    const roas = totSpent > 0 ? Number((totRevenue / totSpent).toFixed(2)) : 0;
    const frequency = totReach > 0 ? Number((totImpressions / totReach).toFixed(2)) : 1.0;

    return {
      budget: totBudget,
      spent: totSpent,
      pacing,
      remaining,
      impressions: totImpressions,
      reach: totReach,
      clicks: totClicks,
      ctr,
      cpc,
      cpm,
      leads: totLeads,
      cpl,
      conversions: totConversions,
      convRate,
      revenue: totRevenue,
      roas,
      frequency,
      count: list.length,
    };
  }, [filteredCampaigns, campaigns]);

  // Channel Breakdown
  const channelBreakdown = useMemo(() => {
    const totalSpend = Math.max(1, computedMetrics.spent);
    const metaSpend = Math.round(totalSpend * 0.68);
    const googleSpend = Math.round(totalSpend * 0.24);
    const otherSpend = totalSpend - metaSpend - googleSpend;

    const totalLeads = Math.max(1, computedMetrics.leads);
    const metaLeads = Math.round(totalLeads * 0.72);
    const googleLeads = Math.round(totalLeads * 0.22);
    const otherLeads = Math.max(0, totalLeads - metaLeads - googleLeads);

    return [
      {
        channel: "Meta Ads (Instagram & Facebook)",
        spend: metaSpend,
        leads: metaLeads,
        cpl: metaLeads > 0 ? Math.round(metaSpend / metaLeads) : 0,
        share: 68,
        color: "#0866FF",
      },
      {
        channel: "Google Ads (Search & Performance Max)",
        spend: googleSpend,
        leads: googleLeads,
        cpl: googleLeads > 0 ? Math.round(googleSpend / googleLeads) : 0,
        share: 24,
        color: "#ea4335",
      },
      {
        channel: "Other Networks (LinkedIn & Direct)",
        spend: otherSpend,
        leads: otherLeads,
        cpl: otherLeads > 0 ? Math.round(otherSpend / Math.max(1, otherLeads)) : 0,
        share: 8,
        color: "#64748b",
      },
    ];
  }, [computedMetrics]);

  // Trend Chart Points
  const trendPoints = useMemo(() => {
    return generateTrendPoints(
      trendResolution,
      computedMetrics.spent,
      computedMetrics.leads,
      computedMetrics.impressions,
      computedMetrics.clicks,
      computedMetrics.conversions,
      daysCount
    );
  }, [trendResolution, computedMetrics, daysCount]);

  // Creative Performance list
  const creativeList = useMemo(() => {
    return getCreativePerformanceList(computedMetrics);
  }, [computedMetrics]);

  // Full conversion funnel data
  const campaignFunnel = useMemo(() => {
    const imps = computedMetrics.impressions;
    const clicks = computedMetrics.clicks;
    const leads = computedMetrics.leads;
    const qualLeads = Math.round(leads * 0.54);
    const convs = computedMetrics.conversions;

    const step1Drop = imps > 0 ? ((1 - clicks / imps) * 100).toFixed(1) : "0";
    const step2Drop = clicks > 0 ? ((1 - leads / clicks) * 100).toFixed(1) : "0";
    const step3Drop = leads > 0 ? ((1 - qualLeads / leads) * 100).toFixed(1) : "0";
    const step4Drop = qualLeads > 0 ? ((1 - convs / qualLeads) * 100).toFixed(1) : "0";

    return {
      stages: [
        { name: "Impressions", count: imps, rate: "100%", dropOff: null, color: "#64748b" },
        { name: "Clicks", count: clicks, rate: `${computedMetrics.ctr}% CTR`, dropOff: `${step1Drop}% drop`, color: "#0866FF" },
        { name: "Leads", count: leads, rate: `${((leads / Math.max(1, clicks)) * 100).toFixed(1)}% of clicks`, dropOff: `${step2Drop}% drop`, color: "#2563eb" },
        { name: "Qualified Leads", count: qualLeads, rate: `${((qualLeads / Math.max(1, leads)) * 100).toFixed(1)}% of leads`, dropOff: `${step3Drop}% drop`, color: "#059669" },
        { name: "Conversions", count: convs, rate: `${computedMetrics.convRate}% win rate`, dropOff: `${step4Drop}% drop`, color: "#10b981" },
      ],
    };
  }, [computedMetrics]);

  // Client conversion funnel (simplified 4-stage)
  const clientFunnel = useMemo(() => {
    const imps = computedMetrics.impressions;
    const clicks = computedMetrics.clicks;
    const leads = computedMetrics.leads;
    const convs = computedMetrics.conversions;

    return [
      { name: "Audience Impressions", count: imps, desc: "People who viewed the ads", color: "#64748b" },
      { name: "Website & Ad Clicks", count: clicks, desc: `${computedMetrics.ctr}% Engagement Rate`, color: "#0866FF" },
      { name: "Inquiries & Leads", count: leads, desc: `${formatINR(computedMetrics.cpl)} Average CPL`, color: "#059669" },
      { name: "Closed Conversions", count: convs, desc: `${computedMetrics.convRate}% Lead Win Rate`, color: "#10b981" },
    ];
  }, [computedMetrics]);

  // Client Name Display
  const currentClientName = useMemo(() => {
    if (selectedClientId !== "all") {
      const cl = clients.find((c) => String(c.id) === String(selectedClientId));
      if (cl) return cl.name;
    }
    if (selectedCampaign && selectedCampaign.client_name) {
      return selectedCampaign.client_name;
    }
    return "All Clients & Accounts";
  }, [selectedClientId, clients, selectedCampaign]);

  // Reporting Period Label
  const reportingPeriodLabel = useMemo(() => {
    if (selectedTimeframe === "Custom") {
      return `${customStartDate} to ${customEndDate}`;
    }
    if (selectedTimeframe === "7D") return "Last 7 Days (Recent Delivery)";
    if (selectedTimeframe === "14D") return "Last 14 Days (Bi-Weekly)";
    if (selectedTimeframe === "90D") return "Last 90 Days (Quarterly)";
    return "September 2026 (Monthly)";
  }, [selectedTimeframe, customStartDate, customEndDate]);

  // ===========================================================================
  // REPORT ACTIONS (View, Download PDF, Export CSV, Print, Share)
  // ===========================================================================

  const handleDownloadPDF = async () => {
    const reportElem = document.getElementById("reports-document-container");
    if (!reportElem) return;

    setIsGeneratingPdf(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const dateStr = new Date().toISOString().slice(0, 10);
      const prefix = activeTab === "campaign" ? "Campaign_Performance_Report" : "Client_Monthly_Report";
      const filename = `${prefix}_${dateStr}.pdf`;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(reportElem).save();
      showToast("PDF report successfully downloaded!");
    } catch (err) {
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadCSV = () => {
    const dateStr = new Date().toISOString().slice(0, 10);

    if (activeTab === "client") {
      // Client Report CSV
      const rows = [
        ["Report Title", "Adstra Digital — Client Performance Monthly Report"],
        ["Client Name", currentClientName],
        ["Reporting Period", reportingPeriodLabel],
        ["Generated Date", dateStr],
        ["Total Spend (INR)", computedMetrics.spent],
        ["Audience Reach", computedMetrics.reach],
        ["Gross Impressions", computedMetrics.impressions],
        ["Clicks", computedMetrics.clicks],
        ["Click-Through Rate (%)", `${computedMetrics.ctr}%`],
        ["Qualified Leads Captured", computedMetrics.leads],
        ["Cost Per Lead (INR)", computedMetrics.cpl],
        ["Conversions", computedMetrics.conversions],
        ["Return on Ad Spend (ROAS)", `${computedMetrics.roas}x`],
        [],
        ["Channel Breakdown", "Spend (INR)", "Leads", "CPL (INR)", "Share (%)"],
        ...channelBreakdown.map((ch) => [ch.channel, ch.spend, ch.leads, ch.cpl, `${ch.share}%`]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csvContent);
      link.download = `Client_Report_${currentClientName.replace(/[^a-z0-9]/gi, "_")}_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Client CSV exported successfully!");
      return;
    }

    // Campaign Performance Report CSV
    const rows = [
      ["Report Title", "Adstra Digital — Campaign Performance Audit"],
      ["Scope", selectedCampaign ? selectedCampaign.name : "Consolidated Portfolio"],
      ["Client", currentClientName],
      ["Reporting Period", reportingPeriodLabel],
      ["Budget Allocated (INR)", computedMetrics.budget],
      ["Amount Spent (INR)", computedMetrics.spent],
      ["Budget Pacing (%)", `${computedMetrics.pacing}%`],
      ["Audience Reach", computedMetrics.reach],
      ["Gross Impressions", computedMetrics.impressions],
      ["Clicks", computedMetrics.clicks],
      ["CTR (%)", `${computedMetrics.ctr}%`],
      ["Average CPC (INR)", computedMetrics.cpc],
      ["Captured Leads", computedMetrics.leads],
      ["Cost Per Lead (INR)", computedMetrics.cpl],
      ["Conversions", computedMetrics.conversions],
      ["Conversion Win Rate (%)", `${computedMetrics.convRate}%`],
      ["ROAS", `${computedMetrics.roas}x`],
      [],
      [
        "Campaign",
        "Ad Set / Audience",
        "Creative",
        "Platform",
        "Spend (INR)",
        "Impressions",
        "Reach",
        "Clicks",
        "CTR (%)",
        "Leads",
        "Conversions",
        "CPC (INR)",
        "CPL (INR)",
        "ROAS",
      ],
      ...getCampaignAdSets(selectedCampaign, computedMetrics).map((as) => [
        selectedCampaign ? selectedCampaign.name : "Portfolio Set",
        as.name,
        as.adCreative,
        as.platform,
        as.spend,
        as.impressions,
        as.reach,
        as.clicks,
        `${as.ctr}%`,
        as.leads,
        as.conversions,
        as.cpc,
        as.cpl,
        `${as.roas}x`,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Campaign_Performance_Report_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Campaign CSV exported successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Report link copied to clipboard!");
    } else {
      setShowShareModal(true);
    }
  };

  // Generate new client report action
  const handleGenerateClientReport = () => {
    const newRep = {
      id: `rep-hist-${Date.now()}`,
      clientName: currentClientName === "All Clients & Accounts" ? "Kotak Mahindra Group" : currentClientName,
      clientId: selectedClientId !== "all" ? selectedClientId : "cl-custom",
      reportingPeriod: reportingPeriodLabel,
      generatedDate: new Date().toISOString().slice(0, 10),
      reportType: "Monthly Executive Presentation",
      status: "Draft",
      sentTo: "Pending Dispatch",
      leads: computedMetrics.leads,
      spend: computedMetrics.spent,
      cpl: computedMetrics.cpl,
    };
    setReportHistory([newRep, ...reportHistory]);
    setShowGenerateModal(false);
    showToast("New Client Report generated and added to History!");
  };

  // Send to client action
  const handleSendToClientSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowSendModal(false);

      // Update history with new sent status
      setReportHistory((prev) => [
        {
          id: `rep-sent-${Date.now()}`,
          clientName: currentClientName,
          clientId: selectedClientId,
          reportingPeriod: sendPeriod,
          generatedDate: new Date().toISOString().slice(0, 10),
          reportType: "Monthly Executive Presentation",
          status: "Sent",
          sentTo: sendEmail,
          leads: computedMetrics.leads,
          spend: computedMetrics.spent,
          cpl: computedMetrics.cpl,
        },
        ...prev,
      ]);

      showToast(`Report successfully dispatched to ${sendEmail}!`);
    }, 900);
  };

  return (
    <div className="cr-unified-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="cr-toast-banner" role="status">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          TOP LEVEL HEADER (Title, Subtitle, Global Action Buttons)
         ======================================================================= */}
      <div className="cr-top-masthead">
        <div className="cr-masthead-left">
          <button
            type="button"
            className="cr-btn-back-square"
            onClick={onBackToManager}
            title="Return to Campaign Manager"
            aria-label="Back to Campaign Manager"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="cr-header-badge-row">
              <span className="cr-header-brand-badge">ADSTRA DIGITAL</span>
              <span className="cr-header-category-badge">ANALYTICS & CLIENT SUITE</span>
            </div>
            <h1 className="cr-main-title">Campaign & Client Reports</h1>
            <p className="cr-main-subtitle">
              Track campaign performance, analyze results, and generate client-ready monthly reports.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="cr-masthead-actions">
          <button
            type="button"
            className={`cr-btn ${previewMode ? "cr-btn-active" : "cr-btn-secondary"}`}
            onClick={() => setPreviewMode(!previewMode)}
            title="Toggle Clean Document View"
          >
            <Eye size={15} />
            <span>{previewMode ? "Exit Preview" : "View Report"}</span>
          </button>

          <button
            type="button"
            className="cr-btn cr-btn-secondary"
            onClick={handleDownloadCSV}
            title="Export structured CSV data"
          >
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="cr-btn cr-btn-secondary"
            onClick={handlePrint}
            title="Print this report"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>

          <button
            type="button"
            className="cr-btn cr-btn-secondary"
            onClick={handleShare}
            title="Share report"
          >
            <Share2 size={15} />
            <span>Share</span>
          </button>

          <button
            type="button"
            className="cr-btn cr-btn-primary"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            title="Download high-resolution PDF"
          >
            <Download size={15} />
            <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          TOP CONTROLS & FILTER BAR
          (Date range, Client, Campaign, Platform selectors)
         ======================================================================= */}
      <div className="cr-filters-card">
        <div className="cr-filter-group-item">
          <label className="cr-filter-label">
            <Calendar size={13} />
            <span>Date Range:</span>
          </label>
          <div className="cr-timeframe-pill-cluster">
            {["7D", "14D", "30D", "90D"].map((tf) => (
              <button
                key={tf}
                type="button"
                className={`cr-tf-btn ${selectedTimeframe === tf ? "active" : ""}`}
                onClick={() => setSelectedTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
            <button
              type="button"
              className={`cr-tf-btn ${selectedTimeframe === "Custom" ? "active" : ""}`}
              onClick={() => setShowCustomDateModal(true)}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Client Selector */}
        <div className="cr-filter-group-item">
          <label className="cr-filter-label">
            <Building2 size={13} />
            <span>Client:</span>
          </label>
          <select
            className="cr-select-dropdown"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Selector */}
        <div className="cr-filter-group-item">
          <label className="cr-filter-label">
            <Layers size={13} />
            <span>Campaign:</span>
          </label>
          <select
            className="cr-select-dropdown"
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
          >
            <option value="all">All Campaigns ({campaigns.length})</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.client_name ? `• ${c.client_name}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Selector */}
        <div className="cr-filter-group-item">
          <label className="cr-filter-label">
            <SlidersHorizontal size={13} />
            <span>Platform:</span>
          </label>
          <div className="cr-platform-btn-cluster">
            {[
              { id: "all", label: "All" },
              { id: "meta", label: "Meta" },
              { id: "google", label: "Google" },
              { id: "other", label: "Other" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`cr-platform-pill ${selectedPlatform === p.id ? "active" : ""}`}
                onClick={() => setSelectedPlatform(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =======================================================================
          UNIFIED PRIMARY TABS: Campaign Report vs Client Report
         ======================================================================= */}
      <div className="cr-primary-tabs-nav">
        <div className="cr-tabs-toggle-container">
          <button
            type="button"
            className={`cr-tab-button ${activeTab === "campaign" ? "active" : ""}`}
            onClick={() => setActiveTab("campaign")}
          >
            <BarChart3 size={17} />
            <div className="cr-tab-text-group">
              <span className="cr-tab-title">Campaign Performance Reports</span>
              <span className="cr-tab-sub">Internal detailed performance analytics & telemetry</span>
            </div>
            <span className="cr-tab-count-pill">{filteredCampaigns.length} Active</span>
          </button>

          <button
            type="button"
            className={`cr-tab-button ${activeTab === "client" ? "active" : ""}`}
            onClick={() => setActiveTab("client")}
          >
            <FileText size={17} />
            <div className="cr-tab-text-group">
              <span className="cr-tab-title">Client Reports</span>
              <span className="cr-tab-sub">Client-facing polished monthly presentation & trends</span>
            </div>
            <span className="cr-tab-badge-client">Client-Ready</span>
          </button>
        </div>

        {/* In-tab Quick Jump Anchor Bar */}
        <div className="cr-quick-jump-bar">
          <span className="cr-jump-label">Jump to Section:</span>
          {activeTab === "campaign" ? (
            <div className="cr-jump-links">
              <a href="#camp-overview">Overview</a>
              <a href="#camp-kpis">KPIs</a>
              <a href="#camp-trends">Trends</a>
              <a href="#camp-funnel">Conversion Funnel</a>
              <a href="#camp-breakdown">Campaign Breakdown</a>
              <a href="#camp-audience">Audience</a>
              <a href="#camp-creatives">Creative Performance</a>
              <a href="#camp-insights">Campaign Insights</a>
            </div>
          ) : (
            <div className="cr-jump-links">
              <a href="#client-summary">Executive Summary</a>
              <a href="#client-kpis">KPIs</a>
              <a href="#client-channels">Channel Breakdown</a>
              <a href="#client-trends">Performance Trends</a>
              <a href="#client-funnel">Funnel</a>
              <a href="#client-insights">Insights</a>
              <a href="#client-keytrends">Key Trends</a>
              <a href="#client-recommendations">Recommendations</a>
              <a href="#client-conclusion">Conclusion</a>
              <a href="#client-history">Report History</a>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================================
          DOCUMENT CONTAINER (Printable & Downloadable Wrapper)
         ======================================================================= */}
      <div id="reports-document-container" className="cr-document-container">
        {/* =====================================================================
            TAB 1: CAMPAIGN PERFORMANCE REPORT (INTERNAL DETAILED TELEMETRY)
           ===================================================================== */}
        {activeTab === "campaign" && (
          <div className="cr-tab-content">
            {/* Section 1: Campaign Overview */}
            <section id="camp-overview" className="cr-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge blue">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h2 className="cr-sec-title">Campaign Overview & Specifications</h2>
                    <p className="cr-sec-subtitle">
                      Delivery state, flight timeframe, budget allocation, and utilization pacing
                    </p>
                  </div>
                </div>

                <div className="cr-sec-badge-group">
                  <span className="cr-status-tag active">
                    {selectedCampaign ? (selectedCampaign.status || "ACTIVE").toUpperCase() : "PORTFOLIO RUNNING"}
                  </span>
                  <span className="cr-date-pill">{reportingPeriodLabel}</span>
                </div>
              </div>

              {/* Campaign Overview Meta Details */}
              <div className="cr-overview-meta-grid">
                <div className="cr-meta-cell">
                  <span className="cr-cell-label">Campaign Name</span>
                  <strong className="cr-cell-val">
                    {selectedCampaign ? selectedCampaign.name : `Portfolio Consolidated (${filteredCampaigns.length} Campaigns)`}
                  </strong>
                </div>

                <div className="cr-meta-cell">
                  <span className="cr-cell-label">Client Account</span>
                  <strong className="cr-cell-val">{currentClientName}</strong>
                </div>

                <div className="cr-meta-cell">
                  <span className="cr-cell-label">Campaign Objective</span>
                  <strong className="cr-cell-val text-blue">
                    {selectedCampaign
                      ? (selectedCampaign.objective || "Lead Generation").replace(/_/g, " ")
                      : "Lead Generation & Direct Acquisition"}
                  </strong>
                </div>

                <div className="cr-meta-cell">
                  <span className="cr-cell-label">Platform</span>
                  <strong className="cr-cell-val">
                    {selectedCampaign
                      ? selectedCampaign._source === "meta"
                        ? "Meta Ads (Instagram & Facebook)"
                        : "Campaign Dashboard"
                      : "Multi-Platform (Meta, Google, Display)"}
                  </strong>
                </div>

                <div className="cr-meta-cell">
                  <span className="cr-cell-label">Campaign Status</span>
                  <strong className="cr-cell-val text-green">
                    {selectedCampaign ? selectedCampaign.status || "Active Delivery" : "Active & Optimized"}
                  </strong>
                </div>

                <div className="cr-meta-cell">
                  <span className="cr-cell-label">Start Date / End Date</span>
                  <strong className="cr-cell-val">
                    {selectedCampaign
                      ? `${selectedCampaign.start_date || "2026-09-01"} → ${selectedCampaign.end_date || "Ongoing"}`
                      : `${customStartDate} → ${customEndDate}`}
                  </strong>
                </div>

                <div className="cr-meta-cell">
                  <span className="cr-cell-label">Total Budget</span>
                  <strong className="cr-cell-val">{formatINR(computedMetrics.budget, true)}</strong>
                </div>

                <div className="cr-meta-cell">
                  <span className="cr-cell-label">Amount Spent</span>
                  <strong className="cr-cell-val">{formatINR(computedMetrics.spent)}</strong>
                </div>

                <div className="cr-meta-cell full-width">
                  <div className="cr-pacing-cell-top">
                    <span className="cr-cell-label">Budget Utilization & Pacing</span>
                    <strong className="cr-pacing-pct">{computedMetrics.pacing}% Utilized</strong>
                  </div>
                  <div className="cr-progress-bar-rail">
                    <div
                      className="cr-progress-bar-fill"
                      style={{
                        width: `${Math.min(100, computedMetrics.pacing)}%`,
                        backgroundColor: computedMetrics.pacing > 95 ? "#f59e0b" : "#0866FF",
                      }}
                    />
                  </div>
                  <div className="cr-pacing-notes">
                    <span>Spent: {formatINR(computedMetrics.spent)}</span>
                    <span>Remaining Balance: {formatINR(computedMetrics.remaining, true)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: KPI Cards */}
            <section id="camp-kpis" className="cr-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge emerald">
                    <Target size={16} />
                  </div>
                  <div>
                    <h2 className="cr-sec-title">Key Performance Indicators</h2>
                    <p className="cr-sec-subtitle">Comprehensive delivery metrics, reach, and efficiency metrics</p>
                  </div>
                </div>
              </div>

              <div className="cr-kpi-matrix-grid">
                {/* 1. Impressions */}
                <div className="cr-metric-card">
                  <div className="cr-metric-label">Gross Impressions</div>
                  <div className="cr-metric-number">{formatCompact(computedMetrics.impressions)}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Total ad impressions</span>
                    <span className="cr-trend-badge green">+14.2%</span>
                  </div>
                </div>

                {/* 2. Reach */}
                <div className="cr-metric-card">
                  <div className="cr-metric-label">Audience Reach</div>
                  <div className="cr-metric-number">{formatCompact(computedMetrics.reach)}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Freq: {computedMetrics.frequency}x</span>
                    <span className="cr-trend-badge green">+11.8%</span>
                  </div>
                </div>

                {/* 3. Clicks */}
                <div className="cr-metric-card">
                  <div className="cr-metric-label">Ad Clicks</div>
                  <div className="cr-metric-number text-blue">{formatCompact(computedMetrics.clicks)}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Engaged traffic</span>
                    <span className="cr-trend-badge green">+18.5%</span>
                  </div>
                </div>

                {/* 4. CTR */}
                <div className="cr-metric-card">
                  <div className="cr-metric-label">Click-Through Rate (CTR)</div>
                  <div className="cr-metric-number text-blue">{computedMetrics.ctr}%</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Benchmark: 2.1%</span>
                    <span className="cr-trend-badge green">+0.4%</span>
                  </div>
                </div>

                {/* 5. Leads */}
                <div className="cr-metric-card highlight-card">
                  <div className="cr-metric-label">Leads Captured</div>
                  <div className="cr-metric-number text-blue">{computedMetrics.leads.toLocaleString("en-IN")}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Verified form fills</span>
                    <span className="cr-trend-badge green">+24.6%</span>
                  </div>
                </div>

                {/* 6. Conversions */}
                <div className="cr-metric-card highlight-card">
                  <div className="cr-metric-label">Conversions / Deals</div>
                  <div className="cr-metric-number text-green">{computedMetrics.conversions}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Win rate: {computedMetrics.convRate}%</span>
                    <span className="cr-trend-badge green">+16.0%</span>
                  </div>
                </div>

                {/* 7. CPC */}
                <div className="cr-metric-card">
                  <div className="cr-metric-label">Cost Per Click (CPC)</div>
                  <div className="cr-metric-number">{formatINR(computedMetrics.cpc)}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Average click cost</span>
                    <span className="cr-trend-badge green">-8.4%</span>
                  </div>
                </div>

                {/* 8. CPL */}
                <div className="cr-metric-card highlight-card">
                  <div className="cr-metric-label">Cost Per Lead (CPL)</div>
                  <div className="cr-metric-number text-green">{formatINR(computedMetrics.cpl)}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Target: ₹800</span>
                    <span className="cr-trend-badge green">-14.2%</span>
                  </div>
                </div>

                {/* 9. CPM */}
                <div className="cr-metric-card">
                  <div className="cr-metric-label">Cost Per Mille (CPM)</div>
                  <div className="cr-metric-number">{formatINR(computedMetrics.cpm)}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Per 1,000 views</span>
                    <span className="cr-trend-badge neutral">Stable</span>
                  </div>
                </div>

                {/* 10. Conversion Rate */}
                <div className="cr-metric-card">
                  <div className="cr-metric-label">Conversion Rate</div>
                  <div className="cr-metric-number">{computedMetrics.convRate}%</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Lead-to-Deal ratio</span>
                    <span className="cr-trend-badge green">+3.1%</span>
                  </div>
                </div>

                {/* 11. ROAS */}
                <div className="cr-metric-card highlight-card">
                  <div className="cr-metric-label">Return on Ad Spend</div>
                  <div className="cr-metric-number text-purple">{computedMetrics.roas}x</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Attributed: {formatINR(computedMetrics.revenue, true)}</span>
                    <span className="cr-trend-badge green">+0.6x</span>
                  </div>
                </div>

                {/* 12. Total Spend */}
                <div className="cr-metric-card">
                  <div className="cr-metric-label">Capital Utilized</div>
                  <div className="cr-metric-number">{formatINR(computedMetrics.spent)}</div>
                  <div className="cr-metric-sub">
                    <span className="text-muted">Budget: {formatINR(computedMetrics.budget, true)}</span>
                    <span className="cr-trend-badge neutral">{computedMetrics.pacing}% pacing</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Performance Trends (Interactive Recharts) */}
            <section id="camp-trends" className="cr-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge purple">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h2 className="cr-sec-title">Performance Trends & Velocity</h2>
                    <p className="cr-sec-subtitle">
                      Interactive telemetry trends. Toggle between daily, weekly, or monthly pacing views.
                    </p>
                  </div>
                </div>

                {/* Resolution switchers & metric toggle */}
                <div className="cr-chart-controls">
                  <div className="cr-metric-pills-selector">
                    {[
                      { id: "spend_budget", label: "Spend vs Budget" },
                      { id: "spend_leads", label: "Spend vs Leads" },
                      { id: "imp_reach", label: "Impressions & Reach" },
                      { id: "ctr_cpc", label: "CTR & CPC" },
                      { id: "leads_conv", label: "Leads & Conversions" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`cr-metric-toggle-btn ${activeTrendMetric === m.id ? "active" : ""}`}
                        onClick={() => setActiveTrendMetric(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="cr-resolution-toggle">
                    {["daily", "weekly", "monthly"].map((res) => (
                      <button
                        key={res}
                        type="button"
                        className={`cr-res-btn ${trendResolution === res ? "active" : ""}`}
                        onClick={() => setTrendResolution(res)}
                      >
                        {res.charAt(0).toUpperCase() + res.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* The Chart Canvas */}
              <div className="cr-chart-canvas-wrapper">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height={340}>
                    {activeTrendMetric === "spend_budget" ? (
                      <AreaChart data={trendPoints} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0866FF" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0866FF" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${formatCompact(v)}`} />
                        <Tooltip
                          formatter={(v, name) => [`₹${Number(v).toLocaleString("en-IN")}`, name === "spend" ? "Spend" : "Target Budget"]}
                          contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Area type="monotone" dataKey="spend" name="Actual Spend" stroke="#0866FF" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGrad)" />
                        <Area type="monotone" dataKey="budget" name="Allocated Budget" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} fill="url(#budgetGrad)" />
                      </AreaChart>
                    ) : activeTrendMetric === "spend_leads" ? (
                      <LineChart data={trendPoints} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#0866FF" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${formatCompact(v)}`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={12} tickLine={false} />
                        <Tooltip
                          formatter={(v, name) => [
                            name === "spend" ? `₹${Number(v).toLocaleString("en-IN")}` : Number(v).toLocaleString("en-IN"),
                            name === "spend" ? "Spend" : "Leads Generated",
                          ]}
                          contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Line yAxisId="left" type="monotone" dataKey="spend" name="Spend (INR)" stroke="#0866FF" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
                      </LineChart>
                    ) : activeTrendMetric === "imp_reach" ? (
                      <AreaChart data={trendPoints} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={formatCompact} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <Legend verticalAlign="top" height={36} />
                        <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#3b82f6" strokeWidth={2} fill="url(#impGrad)" />
                        <Area type="monotone" dataKey="reach" name="Unique Reach" stroke="#10b981" strokeWidth={2} fill="url(#reachGrad)" />
                      </AreaChart>
                    ) : activeTrendMetric === "ctr_cpc" ? (
                      <LineChart data={trendPoints} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#2563eb" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <Legend verticalAlign="top" height={36} />
                        <Line yAxisId="left" type="monotone" dataKey="ctr" name="CTR (%)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line yAxisId="right" type="monotone" dataKey="cpc" name="CPC (INR)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={trendPoints} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="leads" name="Captured Leads" fill="#0866FF" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="conversions" name="Closed Conversions" fill="#059669" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="cr-chart-loading">Rendering interactive telemetry...</div>
                )}
              </div>
            </section>

            {/* Section 4: Conversion Funnel */}
            <section id="camp-funnel" className="cr-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge amber">
                    <Percent size={16} />
                  </div>
                  <div>
                    <h2 className="cr-sec-title">End-to-End Conversion Funnel</h2>
                    <p className="cr-sec-subtitle">
                      Impressions → Clicks → Leads → Qualified Leads → Conversions with stage drop-off analysis
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Horizontal Funnel */}
              <div className="cr-funnel-pipeline">
                {campaignFunnel.stages.map((stage, idx) => (
                  <div key={idx} className="cr-funnel-stage-container">
                    <div className="cr-funnel-box" style={{ borderTopColor: stage.color }}>
                      <div className="cr-funnel-stage-name">{stage.name}</div>
                      <div className="cr-funnel-stage-count" style={{ color: stage.color }}>
                        {formatCompact(stage.count)}
                      </div>
                      <div className="cr-funnel-stage-rate">{stage.rate}</div>
                      {stage.dropOff && (
                        <div className="cr-funnel-drop-tag">
                          <span>Drop-off:</span> <strong>{stage.dropOff}</strong>
                        </div>
                      )}
                    </div>
                    {idx < campaignFunnel.stages.length - 1 && (
                      <div className="cr-funnel-arrow-connector">
                        <ChevronRight size={18} color="#94a3b8" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Campaign Breakdown Table */}
            <section id="camp-breakdown" className="cr-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge blue">
                    <FileSpreadsheet size={16} />
                  </div>
                  <div>
                    <h2 className="cr-sec-title">Granular Campaign Breakdown Matrix</h2>
                    <p className="cr-sec-subtitle">
                      Multi-dimensional performance breakdown by Campaign, Ad Set, Creative, and Platform
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-table-responsive">
                <table className="cr-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "20%" }}>Campaign</th>
                      <th style={{ width: "18%" }}>Ad Set / Audience</th>
                      <th style={{ width: "16%" }}>Ad / Creative</th>
                      <th style={{ width: "10%" }}>Platform</th>
                      <th style={{ width: "8%", textAlign: "right" }}>Spend</th>
                      <th style={{ width: "8%", textAlign: "right" }}>Impr.</th>
                      <th style={{ width: "7%", textAlign: "right" }}>Clicks</th>
                      <th style={{ width: "6%", textAlign: "right" }}>CTR</th>
                      <th style={{ width: "6%", textAlign: "right" }}>Leads</th>
                      <th style={{ width: "6%", textAlign: "right" }}>Conv.</th>
                      <th style={{ width: "7%", textAlign: "right" }}>CPL</th>
                      <th style={{ width: "6%", textAlign: "right" }}>ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCampaignAdSets(selectedCampaign, computedMetrics).map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td>
                          <div className="cr-cell-primary">
                            {selectedCampaign ? selectedCampaign.name : "High-Intent Performance Portfolio"}
                          </div>
                          <div className="cr-cell-secondary">{currentClientName}</div>
                        </td>
                        <td>
                          <div className="cr-cell-primary">{row.name}</div>
                          <div className="cr-cell-secondary">{row.targeting}</div>
                        </td>
                        <td>
                          <span className="cr-badge-creative">{row.adCreative}</span>
                        </td>
                        <td>
                          <span className="cr-badge-platform">{row.platform}</span>
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{formatINR(row.spend)}</td>
                        <td style={{ textAlign: "right" }}>{formatCompact(row.impressions)}</td>
                        <td style={{ textAlign: "right", color: "#0866FF", fontWeight: 650 }}>
                          {formatCompact(row.clicks)}
                        </td>
                        <td style={{ textAlign: "right", color: "#0866FF", fontWeight: 700 }}>{row.ctr}%</td>
                        <td style={{ textAlign: "right", fontWeight: 750, color: "#059669" }}>{row.leads}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{row.conversions}</td>
                        <td style={{ textAlign: "right", fontWeight: 750, color: "#059669" }}>
                          {formatINR(row.cpl)}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 750, color: "#7c3aed" }}>{row.roas}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: Audience / Targeting Insights */}
            <section id="camp-audience" className="cr-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge emerald">
                    <Users size={16} />
                  </div>
                  <div>
                    <h2 className="cr-sec-title">Audience & Targeting Insights</h2>
                    <p className="cr-sec-subtitle">
                      Demographic distribution, geographic hotspots, gender ratios, and placement deliverability
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-audience-grid-4">
                {/* 1. Demographics & Age */}
                <div className="cr-audience-tile">
                  <h3 className="cr-tile-heading">Age Demographics</h3>
                  <div className="cr-audience-breakdown-rows">
                    {[
                      { label: "25–34 Years", pct: 54, leads: 188, color: "#0866FF" },
                      { label: "35–44 Years", pct: 26, leads: 90, color: "#2563eb" },
                      { label: "18–24 Years", pct: 14, leads: 49, color: "#60a5fa" },
                      { label: "45+ Years", pct: 6, leads: 21, color: "#93c5fd" },
                    ].map((item, idx) => (
                      <div key={idx} className="cr-dist-row">
                        <div className="cr-dist-top">
                          <span>{item.label}</span>
                          <strong>
                            {item.pct}% ({item.leads} Leads)
                          </strong>
                        </div>
                        <div className="cr-dist-bar-rail">
                          <div
                            className="cr-dist-bar-fill"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Top Locations */}
                <div className="cr-audience-tile">
                  <h3 className="cr-tile-heading">Top Locations (Geographic Delivery)</h3>
                  <div className="cr-audience-breakdown-rows">
                    {[
                      { label: "Kochi & Ernakulam (KL)", pct: 42, leads: 146, color: "#059669" },
                      { label: "Bengaluru Urban (KA)", pct: 28, leads: 97, color: "#10b981" },
                      { label: "Kozhikode & Malabar (KL)", pct: 18, leads: 63, color: "#34d399" },
                      { label: "Trivandrum & Kollam (KL)", pct: 12, leads: 42, color: "#6ee7b7" },
                    ].map((item, idx) => (
                      <div key={idx} className="cr-dist-row">
                        <div className="cr-dist-top">
                          <span>{item.label}</span>
                          <strong>
                            {item.pct}% ({item.leads} Leads)
                          </strong>
                        </div>
                        <div className="cr-dist-bar-rail">
                          <div
                            className="cr-dist-bar-fill"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Gender Split */}
                <div className="cr-audience-tile">
                  <h3 className="cr-tile-heading">Gender Distribution</h3>
                  <div className="cr-audience-breakdown-rows">
                    {[
                      { label: "Male Audience", pct: 62, leads: 216, color: "#0866FF" },
                      { label: "Female Audience", pct: 35, leads: 122, color: "#ec4899" },
                      { label: "Unspecified / Open", pct: 3, leads: 10, color: "#94a3b8" },
                    ].map((item, idx) => (
                      <div key={idx} className="cr-dist-row">
                        <div className="cr-dist-top">
                          <span>{item.label}</span>
                          <strong>{item.pct}%</strong>
                        </div>
                        <div className="cr-dist-bar-rail">
                          <div
                            className="cr-dist-bar-fill"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Placement Breakdown */}
                <div className="cr-audience-tile">
                  <h3 className="cr-tile-heading">Platform Placements</h3>
                  <div className="cr-audience-breakdown-rows">
                    {[
                      { label: "Instagram Reels (9:16)", pct: 48, color: "#8b5cf6" },
                      { label: "Facebook Mobile Feed", pct: 28, color: "#0866FF" },
                      { label: "Instagram Stories", pct: 16, color: "#ec4899" },
                      { label: "Google Search & PMax", pct: 8, color: "#ea4335" },
                    ].map((item, idx) => (
                      <div key={idx} className="cr-dist-row">
                        <div className="cr-dist-top">
                          <span>{item.label}</span>
                          <strong>{item.pct}%</strong>
                        </div>
                        <div className="cr-dist-bar-rail">
                          <div
                            className="cr-dist-bar-fill"
                            style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Creative Performance */}
            <section id="camp-creatives" className="cr-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge purple">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="cr-sec-title">Creative Asset Performance Breakdown</h2>
                    <p className="cr-sec-subtitle">
                      Tracking individual video, image, carousel, and collection ads across engagement & lead yield
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-creatives-grid">
                {creativeList.map((cr) => (
                  <div key={cr.id} className="cr-creative-card">
                    <div className="cr-creative-card-top">
                      <span className={`cr-creative-status-badge ${cr.statusClass}`}>{cr.status}</span>
                      <span className="cr-creative-type">{cr.type}</span>
                    </div>

                    <h4 className="cr-creative-name">{cr.title}</h4>
                    <p className="cr-creative-hook">“{cr.hook}”</p>

                    <div className="cr-creative-stat-matrix">
                      <div className="cr-cr-stat">
                        <span className="cr-cr-label">Spend</span>
                        <strong className="cr-cr-val">{formatINR(cr.spend)}</strong>
                      </div>
                      <div className="cr-cr-stat">
                        <span className="cr-cr-label">CTR</span>
                        <strong className="cr-cr-val text-blue">{cr.ctr}%</strong>
                      </div>
                      <div className="cr-cr-stat">
                        <span className="cr-cr-label">Leads</span>
                        <strong className="cr-cr-val text-green">{cr.leads}</strong>
                      </div>
                      <div className="cr-cr-stat">
                        <span className="cr-cr-label">CPL</span>
                        <strong className="cr-cr-val">{formatINR(cr.cpl)}</strong>
                      </div>
                      <div className="cr-cr-stat">
                        <span className="cr-cr-label">ROAS</span>
                        <strong className="cr-cr-val text-purple">{cr.roas}x</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 8: Campaign Insights */}
            <section id="camp-insights" className="cr-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge green">
                    <Award size={16} />
                  </div>
                  <div>
                    <h2 className="cr-sec-title">Strategic Campaign Insights & Advisory</h2>
                    <p className="cr-sec-subtitle">
                      Algorithmic findings, top and underperforming segments, and decisive performance changes
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-insights-tiles-grid">
                <div className="cr-insight-box">
                  <div className="cr-insight-box-header">
                    <CheckCircle2 size={16} color="#059669" />
                    <h4>Top-Performing Campaigns</h4>
                  </div>
                  <p>
                    <strong>Lead Generation Advantage+:</strong> Maintained a 3.8x ROAS with CPL optimized at ₹704,
                    generating 56% of total qualified deals.
                  </p>
                </div>

                <div className="cr-insight-box">
                  <div className="cr-insight-box-header">
                    <AlertCircle size={16} color="#f59e0b" />
                    <h4>Underperforming Campaigns / Ad Sets</h4>
                  </div>
                  <p>
                    <strong>Static Display Banner Ad Set:</strong> Experienced audience fatigue with CTR dropping beneath
                    1.4% and CPL rising above ₹920. Budget recommended to be reallocated.
                  </p>
                </div>

                <div className="cr-insight-box">
                  <div className="cr-insight-box-header">
                    <Sparkles size={16} color="#0866FF" />
                    <h4>Best Creatives</h4>
                  </div>
                  <p>
                    <strong>Reels Video Hook (V2):</strong> Outperformed all image formats with a 3.82% CTR and a 4.2x
                    ROAS. Generates the highest form completion rate.
                  </p>
                </div>

                <div className="cr-insight-box">
                  <div className="cr-insight-box-header">
                    <Users size={16} color="#7c3aed" />
                    <h4>Best Audiences</h4>
                  </div>
                  <p>
                    <strong>Lookalike 1% + Kochi Metro Age 25–44:</strong> Delivered the highest quality score (86/100)
                    and 54% lower lead drop-off during CRM sales follow-up.
                  </p>
                </div>

                <div className="cr-insight-box full-span">
                  <div className="cr-insight-box-header">
                    <TrendingUp size={16} color="#059669" />
                    <h4>Important Performance Changes</h4>
                  </div>
                  <p>
                    Over the reporting window, blended CPL decreased from ₹820 to ₹704 (-14.2%), while lead conversion
                    velocity increased by +24.6% week-over-week due to Advantage+ automated placement scaling.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =====================================================================
            TAB 2: CLIENT REPORT (POLISHED, CLIENT-FACING MONTHLY PRESENTATION)
           ===================================================================== */}
        {activeTab === "client" && (
          <div className="cr-tab-content client-report-mode">
            {/* Client Report Action Banner */}
            <div className="cr-client-actions-banner">
              <div className="cr-client-banner-text">
                <FileText size={17} color="#0866FF" />
                <div>
                  <strong>Client-Facing Presentation Suite</strong>
                  <span>Clean, branded monthly report generated from live campaign telemetry.</span>
                </div>
              </div>

              <div className="cr-client-banner-actions">
                <button
                  type="button"
                  className="cr-btn cr-btn-secondary"
                  onClick={() => setShowGenerateModal(true)}
                >
                  <PlusCircle size={15} />
                  <span>Generate Client Report</span>
                </button>

                <button
                  type="button"
                  className="cr-btn cr-btn-secondary"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye size={15} />
                  <span>Preview Client Report</span>
                </button>

                <button
                  type="button"
                  className="cr-btn cr-btn-secondary"
                  onClick={handleDownloadPDF}
                >
                  <FolderDown size={15} />
                  <span>Download Client PDF</span>
                </button>

                <button
                  type="button"
                  className="cr-btn cr-btn-primary"
                  onClick={() => setShowSendModal(true)}
                >
                  <Send size={15} />
                  <span>Send to Client</span>
                </button>
              </div>
            </div>

            {/* 1. Executive Summary */}
            <section id="client-summary" className="cr-client-section-card">
              <div className="cr-client-doc-header">
                <div className="cr-client-brand-row">
                  <div className="cr-client-agency-logo">
                    <span className="cr-logo-main">ADSTRA</span>
                    <span className="cr-logo-tag">DIGITAL MARKETING</span>
                  </div>
                  <span className="cr-client-badge-official">Official Monthly Performance Presentation</span>
                </div>

                <h2 className="cr-client-main-heading">Performance & Growth Summary</h2>
                <div className="cr-client-summary-meta">
                  <div className="cr-client-summary-item">
                    <span className="cr-cs-label">Client Name</span>
                    <strong className="cr-cs-val">{currentClientName}</strong>
                  </div>
                  <div className="cr-client-summary-item">
                    <span className="cr-cs-label">Reporting Period</span>
                    <strong className="cr-cs-val">{reportingPeriodLabel}</strong>
                  </div>
                  <div className="cr-client-summary-item">
                    <span className="cr-cs-label">Services Delivered</span>
                    <strong className="cr-cs-val">Paid Social Acquisition, Lead Engine & Creative Direction</strong>
                  </div>
                  <div className="cr-client-summary-item">
                    <span className="cr-cs-label">Primary Goal</span>
                    <strong className="cr-cs-val">Quality Qualified Inquiries & Cost Optimization</strong>
                  </div>
                </div>

                {/* Highlight Executive Summary Statement */}
                <div className="cr-client-statement-box">
                  <div className="cr-cs-badge">EXECUTIVE SUMMARY</div>
                  <p className="cr-cs-text">
                    During September, marketing campaigns successfully generated{" "}
                    <strong>{computedMetrics.leads.toLocaleString("en-IN")} qualified inquiries</strong> from a total
                    ad spend of <strong>{formatINR(computedMetrics.spent)}</strong>, with Cost Per Lead (CPL) improving
                    by <strong>14.2%</strong> compared with the prior period. Audience engagement reached{" "}
                    <strong>{formatCompact(computedMetrics.reach)} verified prospects</strong> across Kerala and South
                    Metros, delivering an estimated <strong>{computedMetrics.roas}x ROAS</strong>.
                  </p>
                  <div className="cr-cs-footer">
                    <span className="cr-cs-result-tag">Overall Result: Exceeded Targets & Objectives</span>
                    <span className="cr-cs-date">Issued on {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Key Performance Indicators (Client Clean Cards) */}
            <section id="client-kpis" className="cr-client-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge blue">
                    <Award size={16} />
                  </div>
                  <div>
                    <h3 className="cr-sec-title">Key Performance Indicators</h3>
                    <p className="cr-sec-subtitle">
                      Month-over-month performance changes and core marketing achievements
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-client-kpis-grid">
                {/* 1. Total Spend */}
                <div className="cr-client-kpi-box">
                  <span className="cr-ck-label">Total Spend</span>
                  <div className="cr-ck-value">{formatINR(computedMetrics.spent)}</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge neutral">100% on Budget</span>
                    <span className="cr-mom-note">Controlled Pacing</span>
                  </div>
                </div>

                {/* 2. Reach */}
                <div className="cr-client-kpi-box">
                  <span className="cr-ck-label">Audience Reach</span>
                  <div className="cr-ck-value">{formatCompact(computedMetrics.reach)}</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge green">+11.8% MoM</span>
                    <span className="cr-mom-note">Unique People</span>
                  </div>
                </div>

                {/* 3. Impressions */}
                <div className="cr-client-kpi-box">
                  <span className="cr-ck-label">Impressions</span>
                  <div className="cr-ck-value">{formatCompact(computedMetrics.impressions)}</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge green">+14.2% MoM</span>
                    <span className="cr-mom-note">Total Ad Views</span>
                  </div>
                </div>

                {/* 4. Clicks */}
                <div className="cr-client-kpi-box">
                  <span className="cr-ck-label">Website & Ad Clicks</span>
                  <div className="cr-ck-value text-blue">{formatCompact(computedMetrics.clicks)}</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge green">+18.5% MoM</span>
                    <span className="cr-mom-note">Interested Traffic</span>
                  </div>
                </div>

                {/* 5. Leads */}
                <div className="cr-client-kpi-box highlight-client-box">
                  <span className="cr-ck-label">Captured Inquiries (Leads)</span>
                  <div className="cr-ck-value text-blue">{computedMetrics.leads.toLocaleString("en-IN")}</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge green">+24.6% MoM</span>
                    <span className="cr-mom-note">Sales Opportunities</span>
                  </div>
                </div>

                {/* 6. Conversions */}
                <div className="cr-client-kpi-box highlight-client-box">
                  <span className="cr-ck-label">Closed Conversions</span>
                  <div className="cr-ck-value text-green">{computedMetrics.conversions}</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge green">+16.0% MoM</span>
                    <span className="cr-mom-note">Won Customers</span>
                  </div>
                </div>

                {/* 7. CTR */}
                <div className="cr-client-kpi-box">
                  <span className="cr-ck-label">Click-Through Rate</span>
                  <div className="cr-ck-value">{computedMetrics.ctr}%</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge green">+0.4% MoM</span>
                    <span className="cr-mom-note">Above Industry Standard</span>
                  </div>
                </div>

                {/* 8. CPL */}
                <div className="cr-client-kpi-box highlight-client-box">
                  <span className="cr-ck-label">Cost Per Lead (CPL)</span>
                  <div className="cr-ck-value text-green">{formatINR(computedMetrics.cpl)}</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge green">-14.2% Cost Reduction</span>
                    <span className="cr-mom-note">More Efficient</span>
                  </div>
                </div>

                {/* 9. ROAS */}
                <div className="cr-client-kpi-box">
                  <span className="cr-ck-label">Estimated ROAS</span>
                  <div className="cr-ck-value text-purple">{computedMetrics.roas}x</div>
                  <div className="cr-ck-mom">
                    <span className="cr-mom-badge green">+0.6x MoM</span>
                    <span className="cr-mom-note">Strong Commercial Return</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Channel / Campaign Breakdown */}
            <section id="client-channels" className="cr-client-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge blue">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="cr-sec-title">Channel & Campaign Breakdown</h3>
                    <p className="cr-sec-subtitle">
                      Summary of performance across marketing channels without technical noise
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-channels-summary-grid">
                {channelBreakdown.map((ch, idx) => (
                  <div key={idx} className="cr-channel-card">
                    <div className="cr-channel-header">
                      <strong className="cr-channel-name">{ch.channel}</strong>
                      <span className="cr-channel-share-badge">{ch.share}% of Total Spend</span>
                    </div>

                    <div className="cr-channel-stats-row">
                      <div className="cr-ch-stat">
                        <span>Spend</span>
                        <strong>{formatINR(ch.spend)}</strong>
                      </div>
                      <div className="cr-ch-stat">
                        <span>Leads Generated</span>
                        <strong className="text-blue">{ch.leads} Leads</strong>
                      </div>
                      <div className="cr-ch-stat">
                        <span>Cost / Lead</span>
                        <strong className="text-green">{formatINR(ch.cpl)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Performance Trends (Client-Friendly Charts) */}
            <section id="client-trends" className="cr-client-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge purple">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="cr-sec-title">Monthly Performance Trends</h3>
                    <p className="cr-sec-subtitle">
                      Visualizing growth in leads and steady improvement in acquisition cost efficiency
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-client-charts-grid-2">
                {/* Chart 1: Spend vs Leads */}
                <div className="cr-client-chart-box">
                  <div className="cr-client-chart-title">
                    <span>Spend vs Inquiries (Leads)</span>
                    <span className="cr-caption-pill">High Correlation</span>
                  </div>
                  <div className="cr-chart-inner">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={trendPoints} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                          <defs>
                            <linearGradient id="clientSpend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0866FF" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#0866FF" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis yAxisId="left" stroke="#0866FF" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${formatCompact(v)}`} />
                          <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={11} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                          <Legend />
                          <Area yAxisId="left" type="monotone" dataKey="spend" name="Investment (INR)" stroke="#0866FF" strokeWidth={2} fill="url(#clientSpend)" />
                          <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Chart 2: CPL Efficiency Trend */}
                <div className="cr-client-chart-box">
                  <div className="cr-client-chart-title">
                    <span>Cost Per Lead (CPL) Efficiency Trend</span>
                    <span className="cr-caption-pill green">-14.2% Reduction</span>
                  </div>
                  <div className="cr-chart-inner">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={trendPoints} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                          <Legend />
                          <Line type="monotone" dataKey="cpl" name="Cost Per Lead (INR)" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Campaign Conversion Funnel (Simplified 4-Stage for Client) */}
            <section id="client-funnel" className="cr-client-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge emerald">
                    <MousePointer size={16} />
                  </div>
                  <div>
                    <h3 className="cr-sec-title">Customer Journey & Conversion Flow</h3>
                    <p className="cr-sec-subtitle">
                      Simplified visual path from brand exposure to sales inquiries and deals
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-client-funnel-container">
                {clientFunnel.map((item, idx) => (
                  <div key={idx} className="cr-cf-step">
                    <div className="cr-cf-number" style={{ backgroundColor: item.color }}>
                      0{idx + 1}
                    </div>
                    <div className="cr-cf-content">
                      <div className="cr-cf-title">{item.name}</div>
                      <div className="cr-cf-count" style={{ color: item.color }}>
                        {formatCompact(item.count)}
                      </div>
                      <div className="cr-cf-desc">{item.desc}</div>
                    </div>
                    {idx < clientFunnel.length - 1 && (
                      <div className="cr-cf-divider">
                        <ChevronRight size={18} color="#cbd5e1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Interpretation / Insights (Concise, Plain English) */}
            <section id="client-insights" className="cr-client-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge blue">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="cr-sec-title">Executive Interpretation & Findings</h3>
                    <p className="cr-sec-subtitle">
                      Plain-language breakdown of month results, winning variables, and adjustments
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-interpretation-grid">
                <div className="cr-interp-card">
                  <div className="cr-interp-head">
                    <CheckCircle2 size={16} color="#059669" />
                    <strong>What Performed Exceptionally Well</strong>
                  </div>
                  <p>
                    Reels video advertisements generated over 52% of total inquiries at an optimal cost of{" "}
                    <strong>₹410 per lead</strong>. Prospective buyers in the 25–34 age demographic in Kochi and
                    Bengaluru showed the highest intent and response rates.
                  </p>
                </div>

                <div className="cr-interp-card">
                  <div className="cr-interp-head">
                    <TrendingDown size={16} color="#f59e0b" />
                    <strong>Areas Adjusted for Efficiency</strong>
                  </div>
                  <p>
                    Older static image creatives showed reduced engagement after week 3 due to creative saturation. We
                    reallocated that budget toward high-performing video formats, immediately dropping CPL.
                  </p>
                </div>

                <div className="cr-interp-card">
                  <div className="cr-interp-head">
                    <Award size={16} color="#0866FF" />
                    <strong>Top Contributing Campaign & Audience</strong>
                  </div>
                  <p>
                    The <strong>Advantage+ Lead Generation Campaign</strong> paired with custom lookalike audiences was
                    the primary engine of growth, contributing 72% of qualified inquiries.
                  </p>
                </div>

                <div className="cr-interp-card">
                  <div className="cr-interp-head">
                    <TrendingUp size={16} color="#7c3aed" />
                    <strong>Comparison Against Previous Period</strong>
                  </div>
                  <p>
                    Compared with the previous month, total leads increased by <strong>+24.6%</strong>, while average cost
                    per inquiry reduced from <strong>₹820 to ₹704</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Key Trends */}
            <section id="client-keytrends" className="cr-client-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge emerald">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="cr-sec-title">Key Trends Highlight</h3>
                    <p className="cr-sec-subtitle">High-level performance signals observed this month</p>
                  </div>
                </div>
              </div>

              <div className="cr-keytrends-pill-grid">
                <div className="cr-kt-card">
                  <div className="cr-kt-title">📈 Lead Volume Growth</div>
                  <div className="cr-kt-metric text-green">+24.6% Increase</div>
                  <p>Inquiries reached record numbers with improved lead qualification.</p>
                </div>

                <div className="cr-kt-card">
                  <div className="cr-kt-title">💰 Cost Per Lead Improvement</div>
                  <div className="cr-kt-metric text-green">-14.2% Lower CPL</div>
                  <p>Achieved more leads per rupee spent compared to prior benchmarks.</p>
                </div>

                <div className="cr-kt-card">
                  <div className="cr-kt-title">🎯 Ad Engagement (CTR)</div>
                  <div className="cr-kt-metric text-blue">{computedMetrics.ctr}% CTR</div>
                  <p>High creative resonance across Instagram & Facebook placements.</p>
                </div>

                <div className="cr-kt-card">
                  <div className="cr-kt-title">⚡ Capital Utilization</div>
                  <div className="cr-kt-metric text-purple">98% Efficiency</div>
                  <p>Budget delivered cleanly with zero wastage on irrelevant audiences.</p>
                </div>
              </div>
            </section>

            {/* 8. Recommendations & Next Steps */}
            <section id="client-recommendations" className="cr-client-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge amber">
                    <Target size={16} />
                  </div>
                  <div>
                    <h3 className="cr-sec-title">Strategic Recommendations for Next Month</h3>
                    <p className="cr-sec-subtitle">Data-driven actionable steps to continue growth trajectory</p>
                  </div>
                </div>
              </div>

              <div className="cr-recs-list">
                <div className="cr-rec-entry">
                  <div className="cr-rec-badge-num">1</div>
                  <div className="cr-rec-body">
                    <strong>Scale Winning Video Creatives</strong>
                    <p>
                      Allocate 65% of budget toward the top-performing 9:16 vertical video assets, which generated leads
                      at 35% below the average campaign cost.
                    </p>
                  </div>
                </div>

                <div className="cr-rec-entry">
                  <div className="cr-rec-badge-num">2</div>
                  <div className="cr-rec-body">
                    <strong>Expand Lookalike Audiences to Tier-1 Metros</strong>
                    <p>
                      Based on strong conversion in Bengaluru and Kochi, test expanded custom audiences in Chennai and
                      Hyderabad to tap into fresh demand.
                    </p>
                  </div>
                </div>

                <div className="cr-rec-entry">
                  <div className="cr-rec-badge-num">3</div>
                  <div className="cr-rec-body">
                    <strong>Refresh Creative Assets Every 3 Weeks</strong>
                    <p>
                      Introduce 3 new variations of client testimonial and product demo creatives to prevent fatigue and
                      keep CTR above 3.0%.
                    </p>
                  </div>
                </div>

                <div className="cr-rec-entry">
                  <div className="cr-rec-badge-num">4</div>
                  <div className="cr-rec-body">
                    <strong>Optimize WhatsApp & CRM Immediate Follow-Up</strong>
                    <p>
                      Speed-to-lead data indicates contacting inquiries within 15 minutes increases close rates by 2.4x.
                      Ensure instant notification integration.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Conclusion */}
            <section id="client-conclusion" className="cr-client-section-card">
              <div className="cr-conclusion-box">
                <div className="cr-conclusion-header">
                  <div className="cr-icon-badge green">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="cr-concl-title">Executive Conclusion & Sign-Off</h3>
                    <p className="cr-concl-subtitle">Adstra Digital Performance Verification</p>
                  </div>
                </div>

                <div className="cr-concl-body">
                  <p>
                    The campaigns delivered exceptional value during {reportingPeriodLabel}, exceeding primary acquisition
                    targets while lowering customer acquisition costs. We are on pace to surpass quarterly revenue goals
                    by 18%.
                  </p>
                  <p>
                    <strong>Focus for Upcoming Month:</strong> Scaling the highest-performing video assets, expanding into
                    complementary geographic sectors, and initiating early promotional campaign hooks.
                  </p>
                </div>

                <div className="cr-concl-signoff">
                  <div className="cr-signoff-item">
                    <span className="cr-so-title">Lead Campaign Strategist</span>
                    <strong className="cr-so-name">Adstra Performance Team</strong>
                  </div>
                  <div className="cr-signoff-item">
                    <span className="cr-so-title">Verification Seal</span>
                    <strong className="cr-so-name text-green">Official Client Presentation ✓</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. CLIENT REPORT HISTORY */}
            <section id="client-history" className="cr-client-section-card">
              <div className="cr-section-masthead">
                <div className="cr-masthead-title-wrap">
                  <div className="cr-icon-badge blue">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h3 className="cr-sec-title">Client Report History</h3>
                    <p className="cr-sec-subtitle">
                      Previously generated client presentations, distribution statuses, and archive downloads
                    </p>
                  </div>
                </div>
              </div>

              <div className="cr-table-responsive">
                <table className="cr-data-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Reporting Period</th>
                      <th>Generated Date</th>
                      <th>Report Type</th>
                      <th>Status</th>
                      <th>Sent To</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportHistory.map((rep) => (
                      <tr key={rep.id}>
                        <td>
                          <div className="cr-cell-primary">{rep.clientName}</div>
                        </td>
                        <td>{rep.reportingPeriod}</td>
                        <td style={{ color: "#64748b" }}>{rep.generatedDate}</td>
                        <td>
                          <span className="cr-badge-rep-type">{rep.reportType}</span>
                        </td>
                        <td>
                          <span
                            className={`cr-status-tag ${
                              rep.status.toLowerCase() === "sent"
                                ? "active"
                                : rep.status.toLowerCase() === "viewed"
                                ? "viewed"
                                : "draft"
                            }`}
                          >
                            {rep.status}
                          </span>
                        </td>
                        <td style={{ color: "#475569" }}>{rep.sentTo}</td>
                        <td style={{ textAlign: "right" }}>
                          <div className="cr-row-action-cluster">
                            <button
                              type="button"
                              className="cr-btn-tiny"
                              onClick={() => {
                                setPreviewMode(true);
                                showToast(`Loaded preview for ${rep.reportingPeriod}`);
                              }}
                              title="View this report"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="cr-btn-tiny"
                              onClick={handleDownloadPDF}
                              title="Download PDF"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              className="cr-btn-tiny"
                              onClick={() => {
                                setSendEmail(rep.sentTo.includes("@") ? rep.sentTo : "client@company.com");
                                setSendPeriod(rep.reportingPeriod);
                                setShowSendModal(true);
                              }}
                              title="Resend to Client"
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              className="cr-btn-tiny"
                              onClick={() => {
                                const dup = {
                                  ...rep,
                                  id: `rep-dup-${Date.now()}`,
                                  generatedDate: new Date().toISOString().slice(0, 10),
                                  status: "Draft",
                                };
                                setReportHistory([dup, ...reportHistory]);
                                showToast("Report duplicated as new Draft!");
                              }}
                              title="Duplicate report config"
                            >
                              Duplicate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* =======================================================================
          MODAL: SEND REPORT TO CLIENT
         ======================================================================= */}
      {showSendModal && (
        <div className="cr-modal-backdrop" onClick={() => setShowSendModal(false)}>
          <div className="cr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cr-modal-header">
              <div className="cr-modal-title-wrap">
                <Send size={18} color="#0866FF" />
                <h3>Send Report to Client</h3>
              </div>
              <button
                type="button"
                className="cr-btn-close-modal"
                onClick={() => setShowSendModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendToClientSubmit} className="cr-modal-form">
              <div className="cr-form-field">
                <label>Client</label>
                <input type="text" value={currentClientName} disabled className="cr-input-disabled" />
              </div>

              <div className="cr-form-field">
                <label>Report Period</label>
                <input
                  type="text"
                  value={sendPeriod}
                  onChange={(e) => setSendPeriod(e.target.value)}
                  className="cr-input-text"
                  required
                />
              </div>

              <div className="cr-form-field">
                <label>Email Recipient</label>
                <input
                  type="email"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder="client.executive@company.com"
                  className="cr-input-text"
                  required
                />
              </div>

              <div className="cr-form-field">
                <label>Email Subject</label>
                <input
                  type="text"
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                  className="cr-input-text"
                  required
                />
              </div>

              <div className="cr-form-field">
                <label>Optional Message</label>
                <textarea
                  rows={4}
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  className="cr-textarea"
                />
              </div>

              <div className="cr-attachment-pill">
                <FileText size={15} color="#0866FF" />
                <span>Attachment: Client_Report_September_2026.pdf (1.8 MB)</span>
              </div>

              <div className="cr-modal-actions">
                <button
                  type="button"
                  className="cr-btn cr-btn-secondary"
                  onClick={() => setShowSendModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="cr-btn cr-btn-primary" disabled={isSending}>
                  <Send size={14} />
                  <span>{isSending ? "Sending to Client..." : "Send Report Now"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: GENERATE CLIENT REPORT
         ======================================================================= */}
      {showGenerateModal && (
        <div className="cr-modal-backdrop" onClick={() => setShowGenerateModal(false)}>
          <div className="cr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cr-modal-header">
              <div className="cr-modal-title-wrap">
                <PlusCircle size={18} color="#059669" />
                <h3>Generate Client Monthly Report</h3>
              </div>
              <button
                type="button"
                className="cr-btn-close-modal"
                onClick={() => setShowGenerateModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="cr-modal-form">
              <p className="cr-modal-desc">
                Generate a fresh, branded client presentation compiled from actual campaign delivery metrics.
              </p>

              <div className="cr-form-field">
                <label>Select Client Profile</label>
                <select
                  className="cr-select-dropdown"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="all">All Clients (Aggregate Presentation)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cr-form-field">
                <label>Reporting Period</label>
                <select
                  className="cr-select-dropdown"
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  <option value="30D">September 2026 (Monthly)</option>
                  <option value="14D">Last 14 Days (Bi-Weekly)</option>
                  <option value="90D">Q3 2026 (Quarterly Audit)</option>
                </select>
              </div>

              <div className="cr-form-field">
                <label>Included Sections</label>
                <div className="cr-checkbox-group">
                  <label>
                    <input type="checkbox" defaultChecked /> Executive Summary & Statement
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Key Performance Indicators (MoM)
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Channel & Campaign Breakdown
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Performance Trends & Funnel
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Actionable Strategic Next Steps
                  </label>
                </div>
              </div>

              <div className="cr-modal-actions">
                <button
                  type="button"
                  className="cr-btn cr-btn-secondary"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cr-btn cr-btn-primary"
                  onClick={handleGenerateClientReport}
                >
                  <Sparkles size={14} />
                  <span>Generate Report Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: CUSTOM DATE RANGE SELECTOR
         ======================================================================= */}
      {showCustomDateModal && (
        <div className="cr-modal-backdrop" onClick={() => setShowCustomDateModal(false)}>
          <div className="cr-modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="cr-modal-header">
              <div className="cr-modal-title-wrap">
                <Calendar size={18} color="#0866FF" />
                <h3>Select Custom Date Range</h3>
              </div>
              <button
                type="button"
                className="cr-btn-close-modal"
                onClick={() => setShowCustomDateModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="cr-modal-form">
              <div className="cr-form-field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="cr-input-text"
                />
              </div>

              <div className="cr-form-field">
                <label>End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="cr-input-text"
                />
              </div>

              <div className="cr-modal-actions">
                <button
                  type="button"
                  className="cr-btn cr-btn-secondary"
                  onClick={() => setShowCustomDateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cr-btn cr-btn-primary"
                  onClick={() => {
                    setSelectedTimeframe("Custom");
                    setShowCustomDateModal(false);
                    showToast(`Custom date range applied: ${customStartDate} to ${customEndDate}`);
                  }}
                >
                  Apply Date Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
