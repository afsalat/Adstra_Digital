"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import "./GoogleAdsCampaignCreator.css";
import { GoogleAdsIcon } from "./PlatformIcons";

import {
  Search,
  Globe,
  Phone,
  Tag,
  Users,
  MousePointer,
  Smartphone,
  Volume2,
  MapPin,
  Settings,
  Layers,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Check,
  Copy,
  Edit3,
  Sliders,
  Eye,
  Link2,
  Play,
  ShoppingBag,
  Tv,
  HelpCircle,
  X,
  AlertTriangle,
  Pause,
} from "lucide-react";

// ============================================================
// CONSTANTS & DEFINITIONS
// ============================================================

// Image 1: 7 Campaign Objectives
export const GOOGLE_OBJECTIVES = [
  {
    id: "sales",
    title: "Sales",
    description: "Drive sales online, in app, by phone, or in store",
    icon: Tag,
  },
  {
    id: "leads",
    title: "Leads",
    description: "Get leads and other conversions by encouraging customers to take action",
    icon: Users,
  },
  {
    id: "website_traffic",
    title: "Website traffic",
    description: "Get the right people to visit your website",
    icon: MousePointer,
  },
  {
    id: "app_promotion",
    title: "App promotion",
    description: "Get more installs, engagement and pre-registration for your app",
    icon: Smartphone,
  },
  {
    id: "awareness_consideration",
    title: "Awareness and consideration",
    description: "Reach a broad audience and build interest in your products or brand",
    icon: Volume2,
  },
  {
    id: "local_store_visits",
    title: "Local store visits and promotions",
    description: "Drive visits to local stores, including restaurants and dealerships.",
    icon: MapPin,
  },
  {
    id: "without_guidance",
    title: "Create a campaign without guidance",
    description: "You'll choose a campaign next",
    icon: Settings,
  },
];

// Image 2: 7 Campaign Types with miniature diagram illustrations
export const GOOGLE_CAMPAIGN_TYPES = [
  {
    id: "search",
    name: "Search",
    description: "Get in front of high-intent customers when they search on Google Search",
    badge: "Most Popular",
    mockupType: "search",
  },
  {
    id: "performance_max",
    name: "Performance Max",
    description: "Reach audiences across all of Google with a single campaign",
    badge: "AI Powered",
    mockupType: "pmax",
  },
  {
    id: "demand_gen",
    name: "Demand Gen",
    description: "Drive demand and conversions across YouTube, Gmail and Discover",
    mockupType: "demand",
  },
  {
    id: "display",
    name: "Display",
    description: "Reach customers across 3 million sites and apps with engaging creative",
    mockupType: "display",
  },
  {
    id: "shopping",
    name: "Shopping",
    description: "Promote your products to shoppers as they explore what to buy",
    mockupType: "shopping",
  },
  {
    id: "video",
    name: "Video",
    description: "Reach viewers on YouTube and get conversions",
    mockupType: "video",
  },
  {
    id: "app",
    name: "App",
    description: "Drive downloads and other engagement for your app",
    mockupType: "app",
  },
];

// Image 4: Bidding focus options
export const BIDDING_FOCUS_OPTIONS = [
  {
    group: "Recommended",
    items: [
      { id: "conversions", label: "Conversions", desc: "Maximize conversions within your budget" },
      { id: "conversion_value", label: "Conversion value", desc: "Maximize return on ad spend (ROAS)" },
    ],
  },
  {
    group: "Other optimization options",
    items: [
      { id: "clicks", label: "Clicks", desc: "Get as many clicks as possible within your budget" },
      { id: "impression_share", label: "Impression share", desc: "Show your ads on the top or anywhere on Google" },
    ],
  },
];

// Pre-seeded Google Ads campaigns for initial dashboard
const DEFAULT_GOOGLE_CAMPAIGNS = [
  {
    id: "gac-001",
    campaignCode: "G-SRCH-101",
    name: "Search - High Intent Q4",
    type: "search",
    objective: "Sales",
    status: "Active",
    biddingStrategy: "Conversions (Target CPA ₹450)",
    budget: 2500,
    currency: "INR",
    spent: 18450,
    clicks: 1420,
    impressions: 28900,
    ctr: "4.91%",
    avgCpc: "₹13.00",
    conversions: 84,
    createdDate: "Oct 01, 2026",
  },
  {
    id: "gac-002",
    campaignCode: "G-PMAX-204",
    name: "PMax - All Products Reach",
    type: "performance_max",
    objective: "Leads",
    status: "Active",
    biddingStrategy: "Conversion value (Target ROAS 320%)",
    budget: 4000,
    currency: "INR",
    spent: 31200,
    clicks: 2840,
    impressions: 74500,
    ctr: "3.81%",
    avgCpc: "₹10.98",
    conversions: 152,
    createdDate: "Sep 28, 2026",
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function GoogleAdsCampaignCreator({
  clients = [],
  campaigns = [],
  selectedClientId = "all",
  onRefresh,
}) {
  // View mode: 'dashboard' (campaign management list - Image 2) or 'creator' (creation wizard - Image 1)
  const [viewMode, setViewMode] = useState("dashboard");

  // Local Google campaigns list
  const [googleCampaigns, setGoogleCampaigns] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adstra_google_campaigns");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_GOOGLE_CAMPAIGNS;
  });

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adstra_google_campaigns", JSON.stringify(googleCampaigns));
    }
  }, [googleCampaigns]);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ------------------------------------------------------------
  // CREATOR STEP STATE
  // Flow: 'objective' (Image 1) -> 'campaign_type' (Image 2) -> 'goals_name' (Image 3) -> 'wizard' (Image 4)
  // ------------------------------------------------------------
  const [creatorStep, setCreatorStep] = useState("objective");

  // Wizard active section: 'bidding' | 'settings' | 'keywords_ads' | 'budget' | 'review'
  const [wizardSection, setWizardSection] = useState("bidding");
  // Sub-step inside Bidding: 'bidding' | 'customer_acquisition'
  const [biddingSubStep, setBiddingSubStep] = useState("bidding");

  // ------------------------------------------------------------
  // FORM DATA STATE
  // ------------------------------------------------------------
  const [formData, setFormData] = useState({
    // Step 1: Objective (Image 1)
    objective: "sales",

    // Step 2: Campaign Type (Image 2)
    campaignType: "search",

    // Step 3: Conversion goals & Campaign Name (Image 3)
    goalWebsiteVisits: true,
    websiteUrl: "https://www.ivanmana.com/marketing-blueprint",
    goalPhoneCalls: false,
    phoneNumber: "+91 98765 43210",
    campaignName: "Search-13",

    // Step 4: Bidding (Image 4)
    biddingFocus: "conversions", // conversions, conversion_value, clicks, impression_share
    setTargetCpa: false,
    targetCpaValue: "450",
    customerAcquisition: true, // Optimize campaign to gain new customers

    // Step 4: Settings
    networkSearch: true,
    networkSearchPartners: true,
    networkDisplay: false,
    locationOption: "india", // 'all', 'india', 'custom'
    customLocation: "Delhi, Mumbai, Bengaluru",
    languages: ["English"],

    // Step 4: Keywords & RSA Ads
    scanUrl: "https://www.adstradigital.com",
    keywords: [
      { id: "kw-1", text: "digital marketing services", matchType: "phrase" },
      { id: "kw-2", text: "google ads agency", matchType: "phrase" },
      { id: "kw-3", text: "search marketing expert", matchType: "broad" },
      { id: "kw-4", text: "best ppc campaign management", matchType: "exact" },
      { id: "kw-5", text: "conversion rate optimization", matchType: "phrase" },
    ],
    newKeywordText: "",
    newKeywordMatchType: "phrase",

    // Responsive Search Ad (RSA)
    finalUrl: "https://www.adstradigital.com/google-ads",
    displayPath1: "marketing",
    displayPath2: "growth",
    headlines: [
      "Top Google Ads Agency",
      "Grow Leads & Sales Fast",
      "Certified Google Partners",
      "High-ROI PPC Management",
      "Request Free Ad Audit",
    ],
    descriptions: [
      "Scale your revenue with high-intent Google Search campaigns managed by certified experts.",
      "Get transparent reporting, custom conversion tracking, and guaranteed growth. Start today!",
    ],

    // Step 4: Budget
    currency: "INR",
    dailyBudget: 2500,
    budgetType: "recommended", // 'recommended' | 'custom'

    // Status
    status: "Active",
  });

  // Bidding dropdown open state (Image 4 dropdown)
  const [biddingDropdownOpen, setBiddingDropdownOpen] = useState(false);
  const biddingDropdownRef = useRef(null);

  // Close bidding dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (biddingDropdownRef.current && !biddingDropdownRef.current.contains(e.target)) {
        setBiddingDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update campaign name when campaign type changes (if untouched)
  const handleSelectType = (typeId) => {
    setFormData((prev) => {
      const typeObj = GOOGLE_CAMPAIGN_TYPES.find((t) => t.id === typeId);
      const typeName = typeObj ? typeObj.name : "Campaign";
      return {
        ...prev,
        campaignType: typeId,
        campaignName: `${typeName}-${Math.floor(10 + Math.random() * 90)}`,
      };
    });
  };

  // Add keyword handler
  const handleAddKeyword = () => {
    if (!formData.newKeywordText.trim()) return;
    const cleanText = formData.newKeywordText.trim();
    const newKw = {
      id: `kw-${Date.now()}`,
      text: cleanText,
      matchType: formData.newKeywordMatchType,
    };
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, newKw],
      newKeywordText: "",
    }));
  };

  // Remove keyword handler
  const handleRemoveKeyword = (kwId) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k.id !== kwId),
    }));
  };

  // Scan website mock AI suggestions
  const [isScanning, setIsScanning] = useState(false);
  const handleScanWebsite = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const suggestions = [
        { id: `kw-${Date.now()}-1`, text: "growth marketing strategy", matchType: "phrase" },
        { id: `kw-${Date.now()}-2`, text: "performance advertising agency", matchType: "exact" },
        { id: `kw-${Date.now()}-3`, text: "b2b lead generation ads", matchType: "phrase" },
      ];
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, ...suggestions],
      }));
      showToast("Found 3 high-intent keyword suggestions from website!");
    }, 1200);
  };

  // RSA Headlines & Descriptions management
  const handleUpdateHeadline = (index, value) => {
    const updated = [...formData.headlines];
    updated[index] = value.slice(0, 30);
    setFormData((prev) => ({ ...prev, headlines: updated }));
  };

  const handleAddHeadline = () => {
    if (formData.headlines.length >= 15) return;
    setFormData((prev) => ({
      ...prev,
      headlines: [...prev.headlines, ""],
    }));
  };

  const handleRemoveHeadline = (index) => {
    if (formData.headlines.length <= 3) return;
    setFormData((prev) => ({
      ...prev,
      headlines: prev.headlines.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateDescription = (index, value) => {
    const updated = [...formData.descriptions];
    updated[index] = value.slice(0, 90);
    setFormData((prev) => ({ ...prev, descriptions: updated }));
  };

  const handleAddDescription = () => {
    if (formData.descriptions.length >= 4) return;
    setFormData((prev) => ({
      ...prev,
      descriptions: [...prev.descriptions, ""],
    }));
  };

  const handleRemoveDescription = (index) => {
    if (formData.descriptions.length <= 2) return;
    setFormData((prev) => ({
      ...prev,
      descriptions: prev.descriptions.filter((_, i) => i !== index),
    }));
  };

  // Calculate Ad Strength
  const adStrengthScore = useMemo(() => {
    let score = 0;
    if (formData.headlines.filter((h) => h.trim().length > 3).length >= 3) score += 25;
    if (formData.headlines.filter((h) => h.trim().length > 3).length >= 5) score += 25;
    if (formData.descriptions.filter((d) => d.trim().length > 10).length >= 2) score += 25;
    if (formData.keywords.length >= 4) score += 25;
    return score;
  }, [formData.headlines, formData.descriptions, formData.keywords]);

  const adStrengthLabel = useMemo(() => {
    if (adStrengthScore >= 100) return { label: "Excellent", color: "#16a34a" };
    if (adStrengthScore >= 75) return { label: "Great", color: "#22c55e" };
    if (adStrengthScore >= 50) return { label: "Good", color: "#eab308" };
    if (adStrengthScore >= 25) return { label: "Fair", color: "#f97316" };
    return { label: "Poor", color: "#ef4444" };
  }, [adStrengthScore]);

  // Traffic / Budget estimation
  const budgetEstimates = useMemo(() => {
    const budgetVal = Number(formData.dailyBudget) || 1000;
    const weeklyBudget = budgetVal * 7;
    const isINR = formData.currency === "INR";
    const avgCpcVal = isINR ? 12.5 : 1.25;
    const weeklyClicks = Math.round(weeklyBudget / avgCpcVal);
    const weeklyConversions = Math.round(weeklyClicks * 0.052);

    return {
      weeklySpend: isINR ? `₹${weeklyBudget.toLocaleString("en-IN")}` : `$${weeklyBudget.toFixed(2)}`,
      weeklyClicks: weeklyClicks.toLocaleString(),
      avgCpc: isINR ? `₹${avgCpcVal.toFixed(2)}` : `$${avgCpcVal.toFixed(2)}`,
      conversions: `${Math.round(weeklyConversions * 0.8)} - ${Math.round(weeklyConversions * 1.2)}`,
    };
  }, [formData.dailyBudget, formData.currency]);

  // Publish / Save Campaign
  const [isPublishing, setIsPublishing] = useState(false);
  const [createdCampaignCode, setCreatedCampaignCode] = useState(null);

  const handlePublishCampaign = async (statusOverride = "Active") => {
    setIsPublishing(true);
    const nextCodeNum = googleCampaigns.length + 1;
    const newCampCode = `G-${(formData.campaignType || "SRCH").toUpperCase().slice(0, 4)}-${String(nextCodeNum).padStart(3, "0")}`;

    const newCampaign = {
      id: `gac-${Date.now()}`,
      campaignCode: newCampCode,
      name: formData.campaignName.trim() || `Search Campaign ${nextCodeNum}`,
      type: formData.campaignType,
      objective: GOOGLE_OBJECTIVES.find((o) => o.id === formData.objective)?.title || "Sales",
      status: statusOverride,
      biddingStrategy: `${formData.biddingFocus.replace("_", " ")} ${
        formData.setTargetCpa ? `(CPA ₹${formData.targetCpaValue})` : ""
      }`,
      budget: Number(formData.dailyBudget) || 2000,
      currency: formData.currency,
      spent: 0,
      clicks: 0,
      impressions: 0,
      ctr: "0.00%",
      avgCpc: "₹0.00",
      conversions: 0,
      createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };

    // Attempt backend save
    try {
      const clientId = clients[0]?.id;
      const apiPayload = {
        client_profile: clientId,
        name: newCampaign.name,
        objective: formData.objective,
        status: statusOverride.toLowerCase(),
        budget: newCampaign.budget,
        platforms: ["google"],
        target_audience: `${formData.locationOption === "all" ? "Worldwide" : "India"}, ${formData.languages.join(", ")}`,
      };
      await axios.post(`${API_BASE_URL}/social/campaigns/`, apiPayload);
    } catch {
      // Continue gracefully with local state
    }

    setGoogleCampaigns((prev) => [newCampaign, ...prev]);
    setCreatedCampaignCode(newCampCode);
    setIsPublishing(false);
    setCreatorStep("publish_success");
    if (onRefresh) onRefresh();
    showToast(`Google Ads Campaign "${newCampaign.name}" ${statusOverride === "Active" ? "published" : "saved as draft"}!`);
  };

  // Reset creator to create another campaign
  const handleResetForNew = () => {
    setCreatorStep("objective");
    setWizardSection("bidding");
    setBiddingSubStep("bidding");
    setCreatedCampaignCode(null);
    setFormData((prev) => ({
      ...prev,
      campaignName: `Search-${Math.floor(10 + Math.random() * 90)}`,
    }));
  };

  // Helper: render mockup diagram for campaign type in Image 2
  const renderCampaignTypeMockup = (type) => {
    switch (type) {
      case "search":
        return (
          <div className="gac-type-mockup">
            <svg width="44" height="34" viewBox="0 0 54 40" fill="none">
              <rect x="2" y="2" width="50" height="36" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="6" y="6" width="30" height="4" rx="2" fill="#e2e8f0" />
              <rect x="6" y="14" width="38" height="3" rx="1.5" fill="#2563eb" />
              <rect x="6" y="20" width="42" height="2.5" rx="1" fill="#94a3b8" />
              <rect x="6" y="25" width="28" height="2.5" rx="1" fill="#94a3b8" />
              <circle cx="44" cy="8" r="3" fill="#cbd5e1" />
            </svg>
          </div>
        );
      case "pmax":
        return (
          <div className="gac-type-mockup">
            <svg width="44" height="34" viewBox="0 0 54 40" fill="none">
              <rect x="4" y="8" width="22" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="18" y="2" width="32" height="22" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="22" y="6" width="24" height="3" rx="1" fill="#ea580c" />
              <rect x="8" y="12" width="14" height="3" rx="1" fill="#2563eb" />
              <circle cx="38" cy="16" r="4" fill="#3b82f6" opacity="0.3" />
            </svg>
          </div>
        );
      case "demand":
        return (
          <div className="gac-type-mockup">
            <svg width="44" height="34" viewBox="0 0 54 40" fill="none">
              <rect x="2" y="2" width="50" height="36" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="6" y="6" width="26" height="18" rx="3" fill="#e2e8f0" />
              <polygon points="17,12 17,18 22,15" fill="#ea580c" />
              <rect x="36" y="8" width="12" height="3" rx="1" fill="#64748b" />
              <rect x="36" y="14" width="10" height="3" rx="1" fill="#94a3b8" />
              <rect x="6" y="28" width="42" height="3" rx="1.5" fill="#cbd5e1" />
            </svg>
          </div>
        );
      case "display":
        return (
          <div className="gac-type-mockup">
            <svg width="44" height="34" viewBox="0 0 54 40" fill="none">
              <rect x="2" y="2" width="50" height="36" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="6" y="6" width="42" height="10" rx="2" fill="#dbeafe" stroke="#93c5fd" />
              <rect x="6" y="20" width="22" height="14" rx="2" fill="#e2e8f0" />
              <rect x="32" y="20" width="16" height="14" rx="2" fill="#dbeafe" stroke="#93c5fd" />
            </svg>
          </div>
        );
      case "shopping":
        return (
          <div className="gac-type-mockup">
            <svg width="44" height="34" viewBox="0 0 54 40" fill="none">
              <rect x="4" y="6" width="13" height="26" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="20" y="6" width="13" height="26" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="36" y="6" width="13" height="26" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="6" y="8" width="9" height="10" rx="1" fill="#e2e8f0" />
              <rect x="22" y="8" width="9" height="10" rx="1" fill="#dbeafe" />
              <rect x="38" y="8" width="9" height="10" rx="1" fill="#e2e8f0" />
              <rect x="6" y="22" width="9" height="2.5" rx="1" fill="#16a34a" />
              <rect x="22" y="22" width="9" height="2.5" rx="1" fill="#16a34a" />
            </svg>
          </div>
        );
      case "video":
        return (
          <div className="gac-type-mockup">
            <svg width="44" height="34" viewBox="0 0 54 40" fill="none">
              <rect x="2" y="2" width="50" height="36" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="8" y="7" width="38" height="22" rx="3" fill="#0f172a" />
              <polygon points="24,14 24,22 31,18" fill="#ffffff" />
              <rect x="8" y="32" width="24" height="2" rx="1" fill="#ef4444" />
            </svg>
          </div>
        );
      case "app":
        return (
          <div className="gac-type-mockup">
            <svg width="44" height="34" viewBox="0 0 54 40" fill="none">
              <rect x="17" y="2" width="20" height="36" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
              <rect x="21" y="8" width="12" height="12" rx="2.5" fill="#3b82f6" />
              <circle cx="27" cy="33" r="1.5" fill="#cbd5e1" />
              <path d="M25 13 L27 15 L29 13 M27 10 L27 15" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // ============================================================
  // RENDER: DASHBOARD VIEW
  // ============================================================
  if (viewMode === "dashboard") {
    const totalSpent = googleCampaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
    const totalClicks = googleCampaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
    const totalImpressions = googleCampaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
    const totalConversions = googleCampaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);

    return (
      <div className="gac-wrapper gac-dash-container">
        {/* Top Header Bar */}
        <div className="gac-dash-topbar">
          <div className="gac-dash-title-group">
            <GoogleAdsIcon size={28} />
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>
                Google Ads Campaigns
              </h2>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Manage Search, Display & Performance Max campaigns across Google
              </span>
            </div>
          </div>

          <button
            type="button"
            className="gac-btn-continue"
            onClick={() => {
              handleResetForNew();
              setViewMode("creator");
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} /> New Campaign
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="gac-dash-kpi-grid">
          <div className="gac-dash-kpi-card">
            <span className="gac-dash-kpi-label">Active Campaigns</span>
            <span className="gac-dash-kpi-value">
              {googleCampaigns.filter((c) => c.status === "Active").length}
            </span>
          </div>
          <div className="gac-dash-kpi-card">
            <span className="gac-dash-kpi-label">Total Impressions</span>
            <span className="gac-dash-kpi-value">{totalImpressions.toLocaleString()}</span>
          </div>
          <div className="gac-dash-kpi-card">
            <span className="gac-dash-kpi-label">Total Clicks</span>
            <span className="gac-dash-kpi-value">{totalClicks.toLocaleString()}</span>
          </div>
          <div className="gac-dash-kpi-card">
            <span className="gac-dash-kpi-label">Conversions</span>
            <span className="gac-dash-kpi-value">{totalConversions}</span>
          </div>
          <div className="gac-dash-kpi-card">
            <span className="gac-dash-kpi-label">Total Spend</span>
            <span className="gac-dash-kpi-value">₹{totalSpent.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="gac-table-wrapper">
          <table className="gac-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Type</th>
                <th>Objective</th>
                <th>Status</th>
                <th>Bidding Strategy</th>
                <th>Daily Budget</th>
                <th>Clicks</th>
                <th>Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {googleCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                    <p style={{ color: "#64748b", margin: "0 0 12px 0" }}>No Google Ads campaigns found.</p>
                    <button
                      type="button"
                      className="gac-btn-continue"
                      onClick={() => {
                        handleResetForNew();
                        setViewMode("creator");
                      }}
                    >
                      Create First Campaign
                    </button>
                  </td>
                </tr>
              ) : (
                googleCampaigns.map((camp) => (
                  <tr key={camp.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 650, color: "#0f172a" }}>{camp.name}</span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{camp.campaignCode}</span>
                      </div>
                    </td>
                    <td>
                      <span className="gac-badge gac-badge-blue" style={{ textTransform: "capitalize" }}>
                        {camp.type.replace("_", " ")}
                      </span>
                    </td>
                    <td>{camp.objective}</td>
                    <td>
                      <span
                        className={`gac-status-pill ${
                          camp.status === "Active"
                            ? "gac-status-active"
                            : camp.status === "Paused"
                            ? "gac-status-paused"
                            : "gac-status-draft"
                        }`}
                      >
                        ● {camp.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#475569" }}>{camp.biddingStrategy}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{Number(camp.budget).toLocaleString("en-IN")}/day
                    </td>
                    <td>{camp.clicks ? camp.clicks.toLocaleString() : 0}</td>
                    <td>₹{Number(camp.spent || 0).toLocaleString("en-IN")}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="gac-btn-ghost gac-btn-sm"
                          title="Toggle Pause/Resume"
                          onClick={() => {
                            const newStatus = camp.status === "Active" ? "Paused" : "Active";
                            setGoogleCampaigns((prev) =>
                              prev.map((c) => (c.id === camp.id ? { ...c, status: newStatus } : c))
                            );
                            showToast(`Campaign is now ${newStatus}`);
                          }}
                        >
                          {camp.status === "Active" ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          type="button"
                          className="gac-btn-ghost gac-btn-sm"
                          title="Duplicate"
                          onClick={() => {
                            const copy = {
                              ...camp,
                              id: `gac-${Date.now()}`,
                              campaignCode: `${camp.campaignCode}-COPY`,
                              name: `${camp.name} (Copy)`,
                              status: "Draft",
                            };
                            setGoogleCampaigns((prev) => [copy, ...prev]);
                            showToast(`Duplicated campaign`);
                          }}
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          className="gac-btn-ghost gac-btn-sm"
                          title="Delete"
                          onClick={() => {
                            setGoogleCampaigns((prev) => prev.filter((c) => c.id !== camp.id));
                            showToast(`Deleted campaign`);
                          }}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {toastMessage && (
          <div className="cm-toast" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
            <CheckCircle2 size={17} color="#22c55e" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDER: PUBLISH SUCCESS SCREEN
  // ============================================================
  if (creatorStep === "publish_success") {
    return (
      <div className="gac-wrapper">
        <div className="gac-screen-fade gac-publish-result">
          <div className="gac-publish-success-icon">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="gac-publish-title">Google Ads Campaign Published!</h2>
          <p className="gac-publish-subtitle">
            Your campaign <strong>&quot;{formData.campaignName}&quot;</strong> has been created and submitted to Google Ads network.
          </p>

          {createdCampaignCode && (
            <div className="gac-campaign-id-badge">
              <GoogleAdsIcon size={16} />
              <span>Campaign Code: {createdCampaignCode}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="gac-btn-continue"
              onClick={() => setViewMode("dashboard")}
            >
              View Google Campaigns
            </button>
            <button
              type="button"
              className="gac-btn-back"
              onClick={handleResetForNew}
            >
              Create Another Campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: STEP 4 - FULL WIZARD LAYOUT (Image 4)
  // ============================================================
  if (creatorStep === "wizard") {
    const selectedTypeObj = GOOGLE_CAMPAIGN_TYPES.find((t) => t.id === formData.campaignType) || GOOGLE_CAMPAIGN_TYPES[0];

    return (
      <div className="gac-wrapper">
        {/* Top bar with back to initial steps and dashboard switcher */}
        <div className="gac-top-bar">
          <div className="gac-breadcrumb">
            <button
              type="button"
              className="gac-breadcrumb-link"
              onClick={() => setViewMode("dashboard")}
            >
              Google Ads
            </button>
            <span className="gac-breadcrumb-sep">/</span>
            <button
              type="button"
              className="gac-breadcrumb-link"
              onClick={() => setCreatorStep("goals_name")}
            >
              Campaign Setup
            </button>
            <span className="gac-breadcrumb-sep">/</span>
            <span style={{ color: "#0f172a", fontWeight: 600 }}>{formData.campaignName}</span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="gac-btn-draft"
              onClick={() => handlePublishCampaign("Draft")}
            >
              Save as Draft
            </button>
            <button
              type="button"
              className="gac-btn-back"
              onClick={() => setViewMode("dashboard")}
            >
              Exit to Dashboard
            </button>
          </div>
        </div>

        {/* Wizard Layout: Sidebar + Main Content (Image 4) */}
        <div className="gac-wizard-layout">
          {/* ── SIDEBAR (Image 4) ── */}
          <div className="gac-sidebar">
            <div style={{ padding: "0 20px 16px 20px", borderBottom: "1px solid #e2e8f0", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                <Search size={16} color="#2563eb" />
                <span>{formData.campaignName}</span>
              </div>
              <span className="gac-badge gac-badge-blue" style={{ marginTop: 6, fontSize: "0.7rem" }}>
                {selectedTypeObj.name}
              </span>
            </div>

            <div className="gac-sidebar-title">Campaign Steps</div>

            {/* 1. Bidding (Image 4: Active circle with sub-items) */}
            <div
              className={`gac-nav-item ${wizardSection === "bidding" ? "active" : ""}`}
              onClick={() => {
                setWizardSection("bidding");
                setBiddingSubStep("bidding");
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: wizardSection === "bidding" ? "#2563eb" : "#cbd5e1" }} />
              <span>Bidding</span>
            </div>

            {/* Bidding Sub-items */}
            {wizardSection === "bidding" && (
              <>
                <div
                  className={`gac-nav-item gac-nav-sub ${biddingSubStep === "bidding" ? "active" : ""}`}
                  onClick={() => setBiddingSubStep("bidding")}
                  style={{ color: biddingSubStep === "bidding" ? "#2563eb" : "#64748b" }}
                >
                  <span>Bidding</span>
                </div>
                <div
                  className={`gac-nav-item gac-nav-sub ${biddingSubStep === "customer_acquisition" ? "active" : ""}`}
                  onClick={() => setBiddingSubStep("customer_acquisition")}
                  style={{ color: biddingSubStep === "customer_acquisition" ? "#2563eb" : "#64748b" }}
                >
                  <span>Customer acquisition</span>
                </div>
              </>
            )}

            {/* 2. Campaign Settings */}
            <div
              className={`gac-nav-item ${wizardSection === "settings" ? "active" : ""}`}
              onClick={() => setWizardSection("settings")}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: wizardSection === "settings" ? "#2563eb" : "#cbd5e1" }} />
              <span>Campaign settings</span>
            </div>

            {/* 3. Keywords and Ads */}
            <div
              className={`gac-nav-item ${wizardSection === "keywords_ads" ? "active" : ""}`}
              onClick={() => setWizardSection("keywords_ads")}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: wizardSection === "keywords_ads" ? "#2563eb" : "#cbd5e1" }} />
              <span>Keywords and ads</span>
            </div>

            {/* 4. Budget */}
            <div
              className={`gac-nav-item ${wizardSection === "budget" ? "active" : ""}`}
              onClick={() => setWizardSection("budget")}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: wizardSection === "budget" ? "#2563eb" : "#cbd5e1" }} />
              <span>Budget</span>
            </div>

            {/* 5. Review */}
            <div
              className={`gac-nav-item ${wizardSection === "review" ? "active" : ""}`}
              onClick={() => setWizardSection("review")}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: wizardSection === "review" ? "#2563eb" : "#cbd5e1" }} />
              <span>Review</span>
            </div>
          </div>

          {/* ── MAIN CONTENT (Image 4) ── */}
          <div className="gac-content">
            {/* SUB-SECTION 1: BIDDING (Image 4) */}
            {wizardSection === "bidding" && (
              <div className="gac-screen-fade">
                <h1 className="gac-step-title">Bidding</h1>
                <p className="gac-step-subtitle">
                  Configure bidding strategies to maximize conversions or revenue on Google Search.
                </p>

                {/* Card 1: Bidding Dropdown Card (Image 4) */}
                <div className="gac-section-card">
                  <div className="gac-section-header">
                    <span className="gac-section-label">Bidding</span>
                  </div>

                  <div className="gac-form-group">
                    <label className="gac-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>What do you want to focus on?</span>
                      <HelpCircle size={14} color="#94a3b8" />
                    </label>

                    {/* Custom Dropdown Trigger & Menu (Image 4) */}
                    <div className="gac-bidding-dropdown" ref={biddingDropdownRef} style={{ maxWidth: 360 }}>
                      <div
                        className="gac-bidding-selected"
                        onClick={() => setBiddingDropdownOpen(!biddingDropdownOpen)}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {formData.biddingFocus === "conversions"
                            ? "Conversions"
                            : formData.biddingFocus === "conversion_value"
                            ? "Conversion value"
                            : formData.biddingFocus === "clicks"
                            ? "Clicks"
                            : "Impression share"}
                        </span>
                        <ChevronDown size={16} color="#64748b" />
                      </div>

                      {/* Dropdown Menu Popup (Image 4) */}
                      {biddingDropdownOpen && (
                        <div className="gac-bidding-menu">
                          {BIDDING_FOCUS_OPTIONS.map((group, gIdx) => (
                            <div key={gIdx}>
                              <div
                                className={`gac-bidding-menu-section-title ${
                                  group.group === "Recommended" ? "recommended" : "other"
                                }`}
                                style={{
                                  color: group.group === "Recommended" ? "#2563eb" : "#64748b",
                                  fontWeight: 700,
                                  fontSize: "0.76rem",
                                  padding: "10px 14px 4px",
                                }}
                              >
                                {group.group}
                              </div>

                              {group.items.map((opt) => (
                                <div
                                  key={opt.id}
                                  className={`gac-bidding-menu-item ${
                                    formData.biddingFocus === opt.id ? "active" : ""
                                  }`}
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, biddingFocus: opt.id }));
                                    setBiddingDropdownOpen(false);
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>{opt.label}</span>
                                  <span className="gac-bidding-menu-item-desc">{opt.desc}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="gac-hint">
                      Conversions optimization automatically adjusts bids to get the most results within your budget.
                    </p>
                  </div>

                  {/* Target CPA checkbox (optional) */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <label className="gac-checkbox-option" style={{ border: "none", padding: 0 }}>
                      <input
                        type="checkbox"
                        className="gac-checkbox-input"
                        checked={formData.setTargetCpa}
                        onChange={(e) => setFormData((prev) => ({ ...prev, setTargetCpa: e.target.checked }))}
                      />
                      <div>
                        <span className="gac-radio-label">Set a target cost per action (CPA)</span>
                        <span className="gac-radio-desc">Optional: Keep cost per acquisition around a specific target</span>
                      </div>
                    </label>

                    {formData.setTargetCpa && (
                      <div style={{ marginTop: 12, marginLeft: 26, maxWidth: 220 }}>
                        <div className="gac-input-prefix">
                          <span className="gac-input-prefix-icon">₹</span>
                          <input
                            type="number"
                            className="gac-input has-prefix"
                            value={formData.targetCpaValue}
                            onChange={(e) => setFormData((prev) => ({ ...prev, targetCpaValue: e.target.value }))}
                            placeholder="450"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 2: Customer Acquisition (Image 4) */}
                <div className="gac-section-card">
                  <div className="gac-section-header">
                    <span className="gac-section-label">Customer acquisition</span>
                  </div>

                  <div className="gac-acquisition-grid">
                    <div>
                      <label className="gac-checkbox-option" style={{ border: "none", padding: 0 }}>
                        <input
                          type="checkbox"
                          className="gac-checkbox-input"
                          checked={formData.customerAcquisition}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, customerAcquisition: e.target.checked }))
                          }
                        />
                        <div>
                          <span className="gac-radio-label">Optimize campaign to gain new customers</span>
                          <span className="gac-radio-desc">Bid more aggressively for users who haven&apos;t bought before</span>
                        </div>
                      </label>
                    </div>

                    {/* Right column explanation box (Image 4) */}
                    <div className="gac-acquisition-info">
                      By default, your campaign bids equally for new and existing customers. However, you can configure your customer acquisition settings to optimize for acquiring new customers.{" "}
                      <a href="#learn" onClick={(e) => e.preventDefault()}>
                        Learn more about customer acquisition
                      </a>
                    </div>
                  </div>
                </div>

                {/* Next button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                  <button
                    type="button"
                    className="gac-btn-continue"
                    onClick={() => setWizardSection("settings")}
                  >
                    Next: Campaign Settings <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SUB-SECTION 2: CAMPAIGN SETTINGS */}
            {wizardSection === "settings" && (
              <div className="gac-screen-fade">
                <h1 className="gac-step-title">Campaign Settings</h1>
                <p className="gac-step-subtitle">
                  Choose where and to whom your ads will be served across Google&apos;s network.
                </p>

                {/* Networks Card */}
                <div className="gac-section-card">
                  <div className="gac-section-header">
                    <span className="gac-section-label">Networks</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <label className="gac-checkbox-option">
                      <input
                        type="checkbox"
                        className="gac-checkbox-input"
                        checked={formData.networkSearch}
                        onChange={(e) => setFormData((prev) => ({ ...prev, networkSearch: e.target.checked }))}
                      />
                      <div>
                        <span className="gac-radio-label">Search Network (Recommended)</span>
                        <span className="gac-radio-desc">
                          Ads appear near Google Search results and Google search partners.
                        </span>
                      </div>
                    </label>

                    <label className="gac-checkbox-option">
                      <input
                        type="checkbox"
                        className="gac-checkbox-input"
                        checked={formData.networkDisplay}
                        onChange={(e) => setFormData((prev) => ({ ...prev, networkDisplay: e.target.checked }))}
                      />
                      <div>
                        <span className="gac-radio-label">Include Google Display Network</span>
                        <span className="gac-radio-desc">
                          Expand reach across 3M+ partner websites and apps with unused search budget.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Locations Card */}
                <div className="gac-section-card">
                  <div className="gac-section-header">
                    <span className="gac-section-label">Target Locations</span>
                  </div>

                  <div className="gac-radio-group">
                    <label
                      className={`gac-radio-option ${formData.locationOption === "all" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="locationOption"
                        className="gac-radio-input"
                        checked={formData.locationOption === "all"}
                        onChange={() => setFormData((prev) => ({ ...prev, locationOption: "all" }))}
                      />
                      <div>
                        <span className="gac-radio-label">All countries and territories</span>
                      </div>
                    </label>

                    <label
                      className={`gac-radio-option ${formData.locationOption === "india" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="locationOption"
                        className="gac-radio-input"
                        checked={formData.locationOption === "india"}
                        onChange={() => setFormData((prev) => ({ ...prev, locationOption: "india" }))}
                      />
                      <div>
                        <span className="gac-radio-label">India</span>
                      </div>
                    </label>

                    <label
                      className={`gac-radio-option ${formData.locationOption === "custom" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="locationOption"
                        className="gac-radio-input"
                        checked={formData.locationOption === "custom"}
                        onChange={() => setFormData((prev) => ({ ...prev, locationOption: "custom" }))}
                      />
                      <div style={{ flex: 1 }}>
                        <span className="gac-radio-label">Enter another location</span>
                        {formData.locationOption === "custom" && (
                          <input
                            type="text"
                            className="gac-input"
                            style={{ marginTop: 8 }}
                            value={formData.customLocation}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, customLocation: e.target.value }))
                            }
                            placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Languages Card */}
                <div className="gac-section-card">
                  <div className="gac-section-header">
                    <span className="gac-section-label">Languages</span>
                  </div>
                  <p className="gac-section-desc">Select the languages your customers speak:</p>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    {["English", "Hindi", "Spanish", "Arabic"].map((lang) => {
                      const isSelected = formData.languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          className={`gac-btn-ghost ${isSelected ? "gac-badge-blue" : ""}`}
                          style={{
                            border: isSelected ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                            background: isSelected ? "#eff6ff" : "#ffffff",
                            padding: "6px 14px",
                            borderRadius: 20,
                            fontSize: "0.82rem",
                          }}
                          onClick={() => {
                            if (isSelected) {
                              if (formData.languages.length > 1) {
                                setFormData((prev) => ({
                                  ...prev,
                                  languages: prev.languages.filter((l) => l !== lang),
                                }));
                              }
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                languages: [...prev.languages, lang],
                              }));
                            }
                          }}
                        >
                          {isSelected && <Check size={13} style={{ marginRight: 4 }} />}
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                  <button
                    type="button"
                    className="gac-btn-back"
                    onClick={() => setWizardSection("bidding")}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    className="gac-btn-continue"
                    onClick={() => setWizardSection("keywords_ads")}
                  >
                    Next: Keywords & Ads <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: KEYWORDS AND ADS */}
            {wizardSection === "keywords_ads" && (
              <div className="gac-screen-fade">
                <h1 className="gac-step-title">Keywords & Responsive Search Ads</h1>
                <p className="gac-step-subtitle">
                  Define high-intent keywords and craft engaging headlines & descriptions for Google Search.
                </p>

                {/* 1. Keywords Card */}
                <div className="gac-section-card">
                  <div className="gac-section-header">
                    <div>
                      <span className="gac-section-label">Target Keywords</span>
                      <p className="gac-section-desc">Keywords match your ads to relevant Google search queries.</p>
                    </div>
                    <span className="gac-badge gac-badge-blue">{formData.keywords.length} Keywords</span>
                  </div>

                  {/* Scan Website for ideas */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                    <div className="gac-input-prefix" style={{ flex: 1 }}>
                      <Globe size={16} className="gac-input-prefix-icon" />
                      <input
                        type="url"
                        className="gac-input has-prefix"
                        value={formData.scanUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, scanUrl: e.target.value }))}
                        placeholder="https://example.com"
                      />
                    </div>
                    <button
                      type="button"
                      className="gac-btn-continue"
                      style={{ whiteSpace: "nowrap" }}
                      onClick={handleScanWebsite}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <span className="gac-spinner" style={{ width: 14, height: 14 }} /> Scanning...
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} /> Scan for Ideas
                        </>
                      )}
                    </button>
                  </div>

                  {/* Add Keyword Input Row */}
                  <div className="gac-keyword-input-row">
                    <input
                      type="text"
                      className="gac-input"
                      value={formData.newKeywordText}
                      onChange={(e) => setFormData((prev) => ({ ...prev, newKeywordText: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      placeholder="Add keyword (e.g. digital marketing agency)..."
                    />

                    <select
                      className="gac-select"
                      style={{ width: 160 }}
                      value={formData.newKeywordMatchType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, newKeywordMatchType: e.target.value }))}
                    >
                      <option value="broad">Broad match</option>
                      <option value="phrase">&quot;Phrase match&quot;</option>
                      <option value="exact">[Exact match]</option>
                    </select>

                    <button
                      type="button"
                      className="gac-btn-continue"
                      onClick={handleAddKeyword}
                      style={{ padding: "0 18px", height: 40 }}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {/* Keyword Chips List */}
                  <div className="gac-keyword-list">
                    {formData.keywords.map((kw) => (
                      <span key={kw.id} className="gac-keyword-chip">
                        <span>
                          {kw.matchType === "exact"
                            ? `[${kw.text}]`
                            : kw.matchType === "phrase"
                            ? `"${kw.text}"`
                            : kw.text}
                        </span>
                        <span className="gac-match-type-badge">{kw.matchType}</span>
                        <button
                          type="button"
                          className="gac-keyword-chip-remove"
                          onClick={() => handleRemoveKeyword(kw.id)}
                          title="Remove keyword"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Responsive Search Ad (RSA) Card */}
                <div className="gac-section-card">
                  <div className="gac-section-header">
                    <div>
                      <span className="gac-section-label">Responsive Search Ad (RSA)</span>
                      <p className="gac-section-desc">Google dynamically tests combinations of headlines and descriptions.</p>
                    </div>

                    {/* Live Ad Strength Badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Ad strength:</span>
                      <span
                        className="gac-badge"
                        style={{
                          background: `${adStrengthLabel.color}15`,
                          color: adStrengthLabel.color,
                          fontWeight: 700,
                        }}
                      >
                        {adStrengthLabel.label}
                      </span>
                    </div>
                  </div>

                  {/* Ad Strength Progress Bar */}
                  <div className="gac-strength-meter" style={{ marginBottom: 20 }}>
                    <div className="gac-strength-bars">
                      <div
                        className={`gac-strength-bar ${
                          adStrengthScore >= 20 ? "filled-poor" : ""
                        }`}
                      />
                      <div
                        className={`gac-strength-bar ${
                          adStrengthScore >= 40 ? "filled-fair" : ""
                        }`}
                      />
                      <div
                        className={`gac-strength-bar ${
                          adStrengthScore >= 60 ? "filled-good" : ""
                        }`}
                      />
                      <div
                        className={`gac-strength-bar ${
                          adStrengthScore >= 80 ? "filled-great" : ""
                        }`}
                      />
                      <div
                        className={`gac-strength-bar ${
                          adStrengthScore >= 100 ? "filled-excellent" : ""
                        }`}
                      />
                    </div>
                    <span className="gac-strength-label" style={{ color: adStrengthLabel.color }}>
                      {adStrengthScore}%
                    </span>
                  </div>

                  {/* RSA Form Grid: Inputs on Left, Live SERP Preview on Right */}
                  <div className="gac-rsa-grid">
                    <div>
                      {/* Final URL */}
                      <div className="gac-form-group">
                        <label className="gac-label">Final URL</label>
                        <input
                          type="url"
                          className="gac-input"
                          value={formData.finalUrl}
                          onChange={(e) => setFormData((prev) => ({ ...prev, finalUrl: e.target.value }))}
                        />
                      </div>

                      {/* Display Path */}
                      <div className="gac-form-group">
                        <label className="gac-label">Display Path</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: "0.82rem", color: "#64748b" }}>example.com /</span>
                          <input
                            type="text"
                            className="gac-input"
                            style={{ flex: 1 }}
                            value={formData.displayPath1}
                            onChange={(e) => setFormData((prev) => ({ ...prev, displayPath1: e.target.value.slice(0, 15) }))}
                            placeholder="path1"
                          />
                          <span style={{ fontSize: "0.82rem", color: "#64748b" }}>/</span>
                          <input
                            type="text"
                            className="gac-input"
                            style={{ flex: 1 }}
                            value={formData.displayPath2}
                            onChange={(e) => setFormData((prev) => ({ ...prev, displayPath2: e.target.value.slice(0, 15) }))}
                            placeholder="path2"
                          />
                        </div>
                      </div>

                      {/* Headlines (up to 15) */}
                      <div className="gac-form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <label className="gac-label" style={{ margin: 0 }}>
                            Headlines ({formData.headlines.length}/15)
                          </label>
                          <button
                            type="button"
                            className="gac-add-field-btn"
                            onClick={handleAddHeadline}
                            disabled={formData.headlines.length >= 15}
                          >
                            <Plus size={14} /> Add Headline
                          </button>
                        </div>

                        <div className="gac-rsa-field-list">
                          {formData.headlines.map((headline, idx) => (
                            <div key={idx} className="gac-rsa-field-row">
                              <input
                                type="text"
                                className="gac-input"
                                value={headline}
                                onChange={(e) => handleUpdateHeadline(idx, e.target.value)}
                                placeholder={`Headline ${idx + 1}`}
                              />
                              <span className={`gac-rsa-counter ${headline.length > 30 ? "over-limit" : ""}`}>
                                {headline.length}/30
                              </span>
                              {formData.headlines.length > 3 && (
                                <button
                                  type="button"
                                  className="gac-keyword-chip-remove"
                                  onClick={() => handleRemoveHeadline(idx)}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Descriptions (up to 4) */}
                      <div className="gac-form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <label className="gac-label" style={{ margin: 0 }}>
                            Descriptions ({formData.descriptions.length}/4)
                          </label>
                          <button
                            type="button"
                            className="gac-add-field-btn"
                            onClick={handleAddDescription}
                            disabled={formData.descriptions.length >= 4}
                          >
                            <Plus size={14} /> Add Description
                          </button>
                        </div>

                        <div className="gac-rsa-field-list">
                          {formData.descriptions.map((desc, idx) => (
                            <div key={idx} className="gac-rsa-field-row" style={{ alignItems: "flex-start" }}>
                              <textarea
                                className="gac-textarea"
                                style={{ minHeight: 60 }}
                                value={desc}
                                onChange={(e) => handleUpdateDescription(idx, e.target.value)}
                                placeholder={`Description ${idx + 1}`}
                              />
                              <span className={`gac-rsa-counter ${desc.length > 90 ? "over-limit" : ""}`} style={{ marginTop: 8 }}>
                                {desc.length}/90
                              </span>
                              {formData.descriptions.length > 2 && (
                                <button
                                  type="button"
                                  className="gac-keyword-chip-remove"
                                  style={{ marginTop: 8 }}
                                  onClick={() => handleRemoveDescription(idx)}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Google SERP Live Search Preview */}
                    <div>
                      <div className="gac-rsa-preview-label">Google Search Ad Preview</div>
                      <div className="gac-rsa-preview" style={{ background: "#ffffff", padding: "18px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1e293b" }}>Sponsored</span>
                          <span style={{ fontSize: "0.74rem", color: "#64748b" }}>•</span>
                          <span className="gac-rsa-preview-url">
                            {formData.finalUrl.replace(/https?:\/\//, "")}
                            {formData.displayPath1 ? `/${formData.displayPath1}` : ""}
                            {formData.displayPath2 ? `/${formData.displayPath2}` : ""}
                          </span>
                        </div>

                        <div className="gac-rsa-preview-title" style={{ fontSize: "1.05rem", color: "#1a0dab", cursor: "pointer" }}>
                          {formData.headlines[0] || "Your Headline 1"} | {formData.headlines[1] || "Headline 2"} | {formData.headlines[2] || "Headline 3"}
                        </div>

                        <div className="gac-rsa-preview-desc" style={{ fontSize: "0.82rem", color: "#4d5156" }}>
                          {formData.descriptions[0] || "Your compelling description will appear here on Google search."}
                        </div>
                      </div>

                      <div className="gac-info-box" style={{ marginTop: 16 }}>
                        <Info size={16} className="gac-info-box-icon" />
                        <div>
                          <strong>Google Optimization Tip:</strong> Add at least 5 unique headlines and 2 descriptions to increase Ad Strength to &quot;Great&quot; or &quot;Excellent&quot;.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                  <button
                    type="button"
                    className="gac-btn-back"
                    onClick={() => setWizardSection("settings")}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    className="gac-btn-continue"
                    onClick={() => setWizardSection("budget")}
                  >
                    Next: Budget <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SUB-SECTION 4: BUDGET */}
            {wizardSection === "budget" && (
              <div className="gac-screen-fade">
                <h1 className="gac-step-title">Budget</h1>
                <p className="gac-step-subtitle">
                  Set the average amount you want to spend each day on this campaign.
                </p>

                {/* Budget Setting Card */}
                <div className="gac-section-card">
                  <div className="gac-section-header">
                    <span className="gac-section-label">Set your average daily budget</span>
                  </div>

                  <div className="gac-budget-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <select
                        className="gac-select"
                        style={{ width: 100 }}
                        value={formData.currency}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="INR">₹ INR</option>
                        <option value="USD">$ USD</option>
                      </select>

                      <input
                        type="number"
                        className="gac-budget-input"
                        value={formData.dailyBudget}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dailyBudget: e.target.value }))}
                      />
                      <span className="gac-budget-period">/ day</span>
                    </div>

                    {/* Quick Presets */}
                    <div style={{ display: "flex", gap: 8 }}>
                      {(formData.currency === "INR" ? [1000, 2500, 5000, 10000] : [20, 50, 100, 250]).map((val) => (
                        <button
                          key={val}
                          type="button"
                          className="gac-btn-ghost gac-btn-sm"
                          style={{
                            border: Number(formData.dailyBudget) === val ? "1px solid #2563eb" : "1px solid #e2e8f0",
                            background: Number(formData.dailyBudget) === val ? "#eff6ff" : "#ffffff",
                            color: Number(formData.dailyBudget) === val ? "#2563eb" : "#475569",
                          }}
                          onClick={() => setFormData((prev) => ({ ...prev, dailyBudget: val }))}
                        >
                          {formData.currency === "INR" ? `₹${val.toLocaleString()}` : `$${val}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimation Estimates Card */}
                  <div className="gac-budget-estimate" style={{ marginTop: 24 }}>
                    <div className="gac-budget-estimate-item">
                      <span className="gac-budget-estimate-label">Weekly Est. Spend</span>
                      <span className="gac-budget-estimate-value">{budgetEstimates.weeklySpend}</span>
                    </div>
                    <div className="gac-budget-estimate-item">
                      <span className="gac-budget-estimate-label">Weekly Est. Clicks</span>
                      <span className="gac-budget-estimate-value">{budgetEstimates.weeklyClicks}</span>
                    </div>
                    <div className="gac-budget-estimate-item">
                      <span className="gac-budget-estimate-label">Average CPC</span>
                      <span className="gac-budget-estimate-value">{budgetEstimates.avgCpc}</span>
                    </div>
                    <div className="gac-budget-estimate-item">
                      <span className="gac-budget-estimate-label">Est. Conversions</span>
                      <span className="gac-budget-estimate-value">{budgetEstimates.conversions}</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                  <button
                    type="button"
                    className="gac-btn-back"
                    onClick={() => setWizardSection("keywords_ads")}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    className="gac-btn-continue"
                    onClick={() => setWizardSection("review")}
                  >
                    Next: Review Campaign <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* SUB-SECTION 5: REVIEW */}
            {wizardSection === "review" && (
              <div className="gac-screen-fade">
                <h1 className="gac-step-title">Review Campaign</h1>
                <p className="gac-step-subtitle">
                  Verify your settings before launching your Google Ads campaign.
                </p>

                {/* Validation Passed Banner */}
                <div className="gac-validation-bar" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#15803d", fontWeight: 600 }}>
                    <CheckCircle2 size={18} />
                    <span>Your campaign is ready to publish. No issues found.</span>
                  </div>
                </div>

                {/* Review Cards Grid */}
                <div className="gac-review-grid">
                  {/* Card 1: Overview */}
                  <div className="gac-review-card">
                    <div className="gac-review-card-header">
                      <span className="gac-review-card-title">Campaign Overview</span>
                      <button
                        type="button"
                        className="gac-review-edit-btn"
                        onClick={() => setCreatorStep("goals_name")}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="gac-review-card-body">
                      <div className="gac-review-row">
                        <span className="gac-review-key">Campaign Name</span>
                        <span className="gac-review-val">{formData.campaignName}</span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Campaign Type</span>
                        <span className="gac-review-val" style={{ textTransform: "capitalize" }}>
                          {selectedTypeObj.name}
                        </span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Goal / Objective</span>
                        <span className="gac-review-val">
                          {GOOGLE_OBJECTIVES.find((o) => o.id === formData.objective)?.title || "Sales"}
                        </span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Target Website</span>
                        <span className="gac-review-val">{formData.websiteUrl}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Bidding */}
                  <div className="gac-review-card">
                    <div className="gac-review-card-header">
                      <span className="gac-review-card-title">Bidding & Targeting</span>
                      <button
                        type="button"
                        className="gac-review-edit-btn"
                        onClick={() => setWizardSection("bidding")}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="gac-review-card-body">
                      <div className="gac-review-row">
                        <span className="gac-review-key">Bidding Focus</span>
                        <span className="gac-review-val" style={{ textTransform: "capitalize" }}>
                          {formData.biddingFocus.replace("_", " ")}
                        </span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Target CPA</span>
                        <span className="gac-review-val">
                          {formData.setTargetCpa ? `₹${formData.targetCpaValue}` : "None (Auto)"}
                        </span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Customer Acquisition</span>
                        <span className="gac-review-val">
                          {formData.customerAcquisition ? "Optimized for new customers" : "Standard"}
                        </span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Locations</span>
                        <span className="gac-review-val">
                          {formData.locationOption === "all"
                            ? "All countries and territories"
                            : formData.locationOption === "india"
                            ? "India"
                            : formData.customLocation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Keywords & Ad Strength */}
                  <div className="gac-review-card">
                    <div className="gac-review-card-header">
                      <span className="gac-review-card-title">Keywords & Creatives</span>
                      <button
                        type="button"
                        className="gac-review-edit-btn"
                        onClick={() => setWizardSection("keywords_ads")}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="gac-review-card-body">
                      <div className="gac-review-row">
                        <span className="gac-review-key">Keywords Count</span>
                        <span className="gac-review-val">{formData.keywords.length} active keywords</span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Headlines</span>
                        <span className="gac-review-val">{formData.headlines.length} configured</span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Descriptions</span>
                        <span className="gac-review-val">{formData.descriptions.length} configured</span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Ad Strength</span>
                        <span className="gac-review-val" style={{ color: adStrengthLabel.color, fontWeight: 700 }}>
                          {adStrengthLabel.label} ({adStrengthScore}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Budget */}
                  <div className="gac-review-card">
                    <div className="gac-review-card-header">
                      <span className="gac-review-card-title">Budget</span>
                      <button
                        type="button"
                        className="gac-review-edit-btn"
                        onClick={() => setWizardSection("budget")}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="gac-review-card-body">
                      <div className="gac-review-row">
                        <span className="gac-review-key">Average Daily Budget</span>
                        <span className="gac-review-val" style={{ fontWeight: 700 }}>
                          {formData.currency === "INR" ? `₹${formData.dailyBudget}` : `$${formData.dailyBudget}`} / day
                        </span>
                      </div>
                      <div className="gac-review-row">
                        <span className="gac-review-key">Est. Weekly Spend</span>
                        <span className="gac-review-val">{budgetEstimates.weeklySpend}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                  <button
                    type="button"
                    className="gac-btn-back"
                    onClick={() => setWizardSection("budget")}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      type="button"
                      className="gac-btn-draft"
                      onClick={() => handlePublishCampaign("Draft")}
                      disabled={isPublishing}
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      className="gac-btn-publish"
                      onClick={() => handlePublishCampaign("Active")}
                      disabled={isPublishing}
                    >
                      {isPublishing ? (
                        <>
                          <span className="gac-spinner" style={{ width: 14, height: 14 }} /> Publishing...
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Publish Campaign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: INITIAL CREATION SCREENS (Images 1, 2, 3)
  // ============================================================
  return (
    <div className="gac-wrapper">
      {/* Top Bar with Breadcrumb and Exit */}
      <div className="gac-top-bar">
        <div className="gac-breadcrumb">
          <button
            type="button"
            className="gac-breadcrumb-link"
            onClick={() => setViewMode("dashboard")}
          >
            Google Ads Management
          </button>
          <span className="gac-breadcrumb-sep">/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>New Campaign</span>
        </div>

        {googleCampaigns.length > 0 && (
          <button
            type="button"
            className="gac-btn-ghost gac-btn-sm"
            onClick={() => setViewMode("dashboard")}
          >
            View Existing Campaigns ({googleCampaigns.length})
          </button>
        )}
      </div>

      <div className="gac-objective-screen gac-screen-fade">
        {/* ============================================================
            STEP 1: CHOOSE YOUR OBJECTIVE (Image 1)
            ============================================================ */}
        <h1 className="gac-screen-title">Choose your objective</h1>
        <p className="gac-screen-subtitle">
          Select an objective to tailor your experience to the goals and settings that will work best for your campaign
        </p>

        {/* 7 Objectives Grid (Image 1) */}
        <div className="gac-objective-grid">
          {GOOGLE_OBJECTIVES.map((obj) => {
            const Icon = obj.icon;
            const isSelected = formData.objective === obj.id;
            return (
              <div
                key={obj.id}
                className={`gac-objective-card ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, objective: obj.id }));
                  if (creatorStep === "objective") {
                    setCreatorStep("campaign_type");
                  }
                }}
              >
                <div className="gac-obj-icon">
                  <Icon size={20} />
                </div>
                <div className="gac-obj-name">{obj.title}</div>
                <p className="gac-obj-desc">{obj.description}</p>
              </div>
            );
          })}
        </div>

        {/* ============================================================
            STEP 2: SELECT A CAMPAIGN TYPE (Image 2)
            Appears once an objective is selected or always available below
            ============================================================ */}
        {(creatorStep === "campaign_type" || creatorStep === "goals_name") && (
          <div className="gac-amber-accent-card gac-screen-fade">
            <h2 className="gac-amber-accent-title">Select a campaign type</h2>

            <div className="gac-type-grid">
              {GOOGLE_CAMPAIGN_TYPES.map((type) => {
                const isSelected = formData.campaignType === type.id;
                return (
                  <div
                    key={type.id}
                    className={`gac-type-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      handleSelectType(type.id);
                      setCreatorStep("goals_name");
                    }}
                  >
                    {renderCampaignTypeMockup(type.mockupType)}
                    <div className="gac-type-name">{type.name}</div>
                    <p className="gac-type-desc">{type.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            STEP 3: CONVERSION GOALS & CAMPAIGN NAME (Image 3)
            ============================================================ */}
        {creatorStep === "goals_name" && (
          <div className="gac-screen-fade" style={{ marginTop: 20 }}>
            {/* Results selection card (Image 3) */}
            <div className="gac-results-card">
              <div className="gac-results-header">
                <span>Select the results you want to get from this campaign</span>
                <HelpCircle size={15} color="#94a3b8" />
              </div>

              {/* Website visits checkbox + input with link icon */}
              <div className="gac-results-item">
                <label className="gac-results-check-label">
                  <input
                    type="checkbox"
                    className="gac-checkbox-input"
                    checked={formData.goalWebsiteVisits}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, goalWebsiteVisits: e.target.checked }))
                    }
                  />
                  <span>Website visits</span>
                </label>

                {formData.goalWebsiteVisits && (
                  <div className="gac-results-input-wrap">
                    <span className="gac-input-prefix-icon">
                      <Link2 size={16} />
                    </span>
                    <input
                      type="url"
                      className="gac-input"
                      value={formData.websiteUrl}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))
                      }
                      placeholder="https://www.example.com"
                    />
                  </div>
                )}
              </div>

              {/* Phone calls checkbox + input */}
              <div className="gac-results-item">
                <label className="gac-results-check-label">
                  <input
                    type="checkbox"
                    className="gac-checkbox-input"
                    checked={formData.goalPhoneCalls}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, goalPhoneCalls: e.target.checked }))
                    }
                  />
                  <span>Phone calls</span>
                </label>

                {formData.goalPhoneCalls && (
                  <div className="gac-results-input-wrap">
                    <span className="gac-input-prefix-icon">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      className="gac-input"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Campaign name card (Image 3) */}
            <div className="gac-results-card">
              <div className="gac-results-header">
                <span>Campaign name</span>
              </div>

              <div style={{ maxWidth: 360 }}>
                <input
                  type="text"
                  className="gac-input"
                  value={formData.campaignName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, campaignName: e.target.value }))
                  }
                  placeholder="e.g. Search-13"
                />
              </div>
            </div>

            {/* Bottom action buttons: Cancel, Continue (Image 3) */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 14,
                marginTop: 24,
                marginBottom: 48,
              }}
            >
              <button
                type="button"
                className="gac-btn-back"
                onClick={() => setCreatorStep("campaign_type")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gac-btn-continue"
                onClick={() => {
                  setCreatorStep("wizard");
                  setWizardSection("bidding");
                  setBiddingSubStep("bidding");
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="cm-toast" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
          <CheckCircle2 size={17} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
