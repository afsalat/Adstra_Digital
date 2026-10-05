"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MetaLogoIcon,
  GoogleAdsLogoIcon,
  LinkedInLogoIcon,
} from "./CreateCampaignWizard";
import MetaAdsManagerCampaignEditor from "./MetaAdsManagerCampaignEditor";
import {
  LayoutGrid,
  Search,
  Plus,
  Copy,
  Edit2,
  Trash2,
  Eye,
  UploadCloud,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  Sliders,
  MoreHorizontal,
  Folder,
  Mail,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
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

// Complete 19-Column Ads Dataset Matching Images 1, 2, 3
const INITIAL_ADS = [
  {
    id: "ad-1",
    name: "AAA",
    thumb: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&auto=format&fit=crop&q=80",
    delivery: "In draft",
    actions: "—",
    results: "—",
    costPerResult: "—",
    budget: "Using campaign...",
    budgetSub: "",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "—",
    bidStrategy: "Highest volume",
    bidStrategySub: "Leads",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "aaa",
    activeAdsCount: "0 active ads",
    active: true,
  },
  {
    id: "ad-2",
    name: "New Leads ad",
    thumb: null,
    delivery: "In draft",
    actions: "—",
    results: "—",
    costPerResult: "—",
    budget: "Using campaign...",
    budgetSub: "",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "—",
    bidStrategy: "Highest volume",
    bidStrategySub: "Leads",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "New Leads ad set",
    activeAdsCount: "0 active ads",
    active: true,
  },
  {
    id: "ad-3",
    name: "New Awareness ad",
    thumb: null,
    delivery: "In draft",
    actions: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹200.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "—",
    bidStrategy: "Highest volume",
    bidStrategySub: "Daily unique reach",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "New Awareness ad set",
    activeAdsCount: "0 active ads",
    active: true,
  },
  {
    id: "ad-4",
    name: "New App promotion Ad",
    thumb: null,
    delivery: "In draft",
    actions: "—",
    results: "—",
    costPerResult: "—",
    budget: "Using campaign...",
    budgetSub: "",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "—",
    bidStrategy: "Highest volume",
    bidStrategySub: "App installs",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "New App promotion Ad set",
    activeAdsCount: "0 active ads",
    active: true,
  },
  {
    id: "ad-5",
    name: "New Awareness ad",
    thumb: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&auto=format&fit=crop&q=80",
    delivery: "In draft",
    actions: "—",
    results: "—",
    costPerResult: "—",
    budget: "₹200.00",
    budgetSub: "Daily",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "—",
    bidStrategy: "Highest volume",
    bidStrategySub: "Daily unique reach",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "aaaa",
    activeAdsCount: "0 active ads",
    active: true,
  },
  {
    id: "ad-6",
    name: "New Engagement ad",
    thumb: null,
    delivery: "In draft",
    actions: "—",
    results: "—",
    costPerResult: "—",
    budget: "Using campaign...",
    budgetSub: "",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "—",
    bidStrategy: "Highest volume",
    bidStrategySub: "Conversations",
    lastSignificantEdit: "—",
    qualityRanking: "—",
    engagementRanking: "—",
    conversionRanking: "—",
    adsetName: "New Engagement ad set",
    activeAdsCount: "0 active ads",
    active: true,
  },
];

// Ad Sets Dataset Matching Structure
const INITIAL_ADSETS = [
  {
    id: "as-1",
    name: "aaa",
    delivery: "In draft",
    bidStrategy: "Highest volume",
    bidStrategySub: "Leads",
    budget: "Using campaign...",
    budgetSub: "",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "7-day click or 1-day view",
    lastSignificantEdit: "—",
    active: true,
  },
  {
    id: "as-2",
    name: "New Leads ad set",
    delivery: "In draft",
    bidStrategy: "Highest volume",
    bidStrategySub: "Leads",
    budget: "Using campaign...",
    budgetSub: "",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "7-day click",
    lastSignificantEdit: "—",
    active: true,
  },
  {
    id: "as-3",
    name: "New Awareness ad set",
    delivery: "In draft",
    bidStrategy: "Highest volume",
    bidStrategySub: "Daily unique reach",
    budget: "₹200.00",
    budgetSub: "Daily",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "1-day view",
    lastSignificantEdit: "—",
    active: true,
  },
  {
    id: "as-4",
    name: "New App promotion Ad set",
    delivery: "In draft",
    bidStrategy: "Highest volume",
    bidStrategySub: "App installs",
    budget: "Using campaign...",
    budgetSub: "",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "7-day click or 1-day view",
    lastSignificantEdit: "—",
    active: true,
  },
  {
    id: "as-5",
    name: "New Engagement ad set",
    delivery: "In draft",
    bidStrategy: "Highest volume",
    bidStrategySub: "Conversations",
    budget: "Using campaign...",
    budgetSub: "",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "7-day click",
    lastSignificantEdit: "—",
    active: true,
  },
];

// Campaigns Dataset Matching Structure
const INITIAL_CAMPAIGNS = [
  {
    id: "c-1",
    name: "AAA",
    delivery: "In draft",
    bidStrategy: "Using campaign budget",
    bidStrategySub: "",
    budget: "₹500.00",
    budgetSub: "Daily",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "7-day click or 1-day view",
    active: true,
  },
  {
    id: "c-2",
    name: "New Leads campaign",
    delivery: "In draft",
    bidStrategy: "Lowest cost",
    bidStrategySub: "",
    budget: "₹350.00",
    budgetSub: "Daily",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "7-day click",
    active: true,
  },
  {
    id: "c-3",
    name: "New Awareness campaign",
    delivery: "In draft",
    bidStrategy: "Lowest cost",
    bidStrategySub: "",
    budget: "₹200.00",
    budgetSub: "Daily",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "1-day view",
    active: true,
  },
  {
    id: "c-4",
    name: "New App promotion campaign",
    delivery: "In draft",
    bidStrategy: "Using campaign budget",
    bidStrategySub: "",
    budget: "₹400.00",
    budgetSub: "Daily",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "7-day click or 1-day view",
    active: true,
  },
  {
    id: "c-5",
    name: "New Engagement campaign",
    delivery: "In draft",
    bidStrategy: "Lowest cost",
    bidStrategySub: "",
    budget: "₹250.00",
    budgetSub: "Daily",
    results: "—",
    costPerResult: "—",
    amountSpent: "—",
    impressions: "—",
    reach: "—",
    ends: "Ongoing",
    attribution: "7-day click",
    active: true,
  },
];

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

export default function CampaignsTab({
  campaigns = [],
  clients = [],
  selectedClientId = "all",
  onRefresh,
}) {
  const [selectedPlatform, setSelectedPlatform] = useState("meta");
  const [activeMetaSubSection, setActiveMetaSubSection] = useState("ads"); // "campaigns" | "adsets" | "ads"

  // Datasets
  const [adsList, setAdsList] = useState(INITIAL_ADS);
  const [adsetsList, setAdsetsList] = useState(INITIAL_ADSETS);
  const [campaignsList, setCampaignsList] = useState(INITIAL_CAMPAIGNS);

  // Selected Ad IDs (default "ad-2" checked, matching Image 1, 2, 3 where Row 2 is selected)
  const [selectedAdIds, setSelectedAdIds] = useState(["ad-2"]);
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [publishingModalOpen, setPublishingModalOpen] = useState(false);
  const [publishingTotal, setPublishingTotal] = useState(1);
  const [publishingProgress, setPublishingProgress] = useState(0);
  const [publishingItemName, setPublishingItemName] = useState("");

  const [toast, setToast] = useState(null); // { message, type: 'success' | 'info' | 'error' }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Create Modal (Meta-style — Image 1 & Image 2)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState("campaign"); // "campaign" | "adset"
  const [createObjective, setCreateObjective] = useState("Awareness");
  const [createBuyingType, setCreateBuyingType] = useState("Auction");
  const [createCampaignSearch, setCreateCampaignSearch] = useState("");
  const [selectedCreateCampaign, setSelectedCreateCampaign] = useState("");

  const CREATE_OBJECTIVES = [
    { id: "Awareness", icon: "📢", label: "Awareness" },
    { id: "Traffic", icon: "🔗", label: "Traffic" },
    { id: "Engagement", icon: "💬", label: "Engagement" },
    { id: "Leads", icon: "⚡", label: "Leads" },
    { id: "App promotion", icon: "📱", label: "App promotion" },
    { id: "Sales", icon: "🛒", label: "Sales" },
  ];

  const handleOpenCreateModal = () => {
    // Default tab: if on campaigns section → "campaign", else → "adset"
    setCreateModalTab(activeMetaSubSection === "campaigns" ? "campaign" : "adset");
    setCreateObjective("Awareness");
    setCreateBuyingType("Auction");
    setCreateCampaignSearch("");
    setSelectedCreateCampaign("");
    setCreateModalOpen(true);
  };

  // Real Meta Ads Manager Standalone Editor Page (Matching Images 1, 2, 3)
  const [standaloneEditorOpen, setStandaloneEditorOpen] = useState(false);
  const [standaloneEditorData, setStandaloneEditorData] = useState(null);

  const handleLaunchStandaloneEditor = (objectiveToUse = createObjective) => {
    setCreateModalOpen(false);
    const obj = objectiveToUse || "App promotion";
    setStandaloneEditorData({
      objective: obj,
      campaignName: `New ${obj} Campaign`,
      buyingType: createBuyingType || "Auction",
      adsetName: `New ${obj} Ad set`,
      adName: `New ${obj} Ad`,
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
    });
    setStandaloneEditorOpen(true);
  };

  const handlePublishStandaloneCampaign = (campaignData) => {
    setActiveMetaSubSection("campaigns");
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
    };

    const newAdset = {
      id: `as-meta-${Date.now()}`,
      name: campaignData.adsetName || `${newCampaign.name} - Ad Set`,
      delivery: "In draft",
      bidStrategy: "Highest volume",
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
      lastSignificantEdit: "Just now",
      campaignId: newCampId,
      active: true,
    };

    const newAd = {
      id: `ad-meta-${Date.now()}`,
      name: campaignData.adName || `${newCampaign.name} - Ad`,
      thumb:
        campaignData.selectedCreativeUrl ||
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&auto=format&fit=crop&q=80",
      delivery: "In draft",
      actions: "—",
      results: "—",
      costPerResult: "—",
      budget: "Using campaign...",
      budgetSub: "",
      amountSpent: "—",
      impressions: "—",
      reach: "—",
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

    if (campaignData.isEdit && campaignData.campaignId) {
      setCampaignsList((prev) =>
        prev.map((c) => (c.id === campaignData.campaignId ? { ...c, ...newCampaign, id: c.id } : c))
      );
      showToast(`Updated campaign "${newCampaign.name}" successfully!`, "success");
    } else {
      setCampaignsList((prev) => [newCampaign, ...prev]);
      setAdsetsList((prev) => [newAdset, ...prev]);
      setAdsList((prev) => [newAd, ...prev]);
      setSelectedCampaignIds([newCampaign.id]);
      showToast(`Campaign "${newCampaign.name}" published with 1 ad set and 1 ad!`, "success");
    }
    setStandaloneEditorOpen(false);
  };

  const handleSaveDraftStandaloneCampaign = (campaignData) => {
    setActiveMetaSubSection("campaigns");
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
    };

    if (campaignData.isEdit && campaignData.campaignId) {
      setCampaignsList((prev) =>
        prev.map((c) => (c.id === campaignData.campaignId ? { ...c, ...newCampaign, id: c.id } : c))
      );
    } else {
      setCampaignsList((prev) => [newCampaign, ...prev]);
      setSelectedCampaignIds([newCampaign.id]);
    }
    setStandaloneEditorOpen(false);
    showToast(`Draft "${newCampaign.name}" saved.`, "info");
  };

  // Meta Date Picker Popover State (Image 1 & Image 2)
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);
  const [selectedDatePreset, setSelectedDatePreset] = useState("today");
  const [tempDatePreset, setTempDatePreset] = useState("today");
  const [appliedStartDate, setAppliedStartDate] = useState(new Date(2026, 8, 29));
  const [appliedEndDate, setAppliedEndDate] = useState(new Date(2026, 8, 29));
  const [tempStartDate, setTempStartDate] = useState(new Date(2026, 8, 29));
  const [tempEndDate, setTempEndDate] = useState(new Date(2026, 8, 29));
  const [appliedDateLabel, setAppliedDateLabel] = useState("Today: 29 Sep 2026");
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [calMonth, setCalMonth] = useState(8); // 8 = Sep
  const [calYear, setCalYear] = useState(2026);

  // Month & Year Dropdown States (matching Image 3)
  const [month1DropdownOpen, setMonth1DropdownOpen] = useState(false);
  const [year1DropdownOpen, setYear1DropdownOpen] = useState(false);
  const [month2DropdownOpen, setMonth2DropdownOpen] = useState(false);
  const [year2DropdownOpen, setYear2DropdownOpen] = useState(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

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

  // Meta Filter Pills (Image 1) & Search
  // Options: "all" | "had_delivery" | "actions" | "active"
  const [activeFilter, setActiveFilter] = useState("actions"); // matching Image 1 where "Actions" is selected
  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredItems = (items) => {
    let result = items;

    // Filter by pill / preset
    if (activeFilter === "active") {
      result = result.filter((item) => item.active === true);
    } else if (activeFilter === "inactive") {
      result = result.filter((item) => item.active === false);
    } else if (activeFilter === "had_delivery") {
      result = result.filter(
        (item) =>
          item.impressions !== "—" ||
          item.results !== "—" ||
          item.delivery === "Active" ||
          item.delivery === "Learning"
      );
    } else if (activeFilter === "actions" || activeFilter === "drafts") {
      result = result.filter(
        (item) =>
          item.delivery === "In draft" ||
          item.actions !== "—" ||
          (item.name && item.name.toLowerCase().includes("draft"))
      );
    } else if (activeFilter === "completed") {
      result = result.filter((item) => item.ends && item.ends !== "Ongoing");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.adsetName && item.adsetName.toLowerCase().includes(q)) ||
          (item.bidStrategy && item.bidStrategy.toLowerCase().includes(q))
      );
    }

    return result;
  };

  const filteredAds = getFilteredItems(adsList);
  const filteredAdsets = getFilteredItems(adsetsList);
  const filteredCampaigns = getFilteredItems(campaignsList);

  const handleDiscardDrafts = () => {
    setAdsList([]);
    setAdsetsList([]);
    setCampaignsList([]);
    setSelectedAdIds([]);
    setSelectedAdsetIds([]);
    setSelectedCampaignIds([]);
    setDraftsDiscarded(true);
    setDiscardModalOpen(false);
  };

  const handleResetAdsManager = () => {
    if (alsoDiscardUnpublished) {
      setAdsList([]);
      setAdsetsList([]);
      setCampaignsList([]);
      setSelectedAdIds([]);
      setSelectedAdsetIds([]);
      setSelectedCampaignIds([]);
      setDraftsDiscarded(true);
    } else {
      setSelectedAdIds([]);
      setSelectedAdsetIds([]);
      setSelectedCampaignIds([]);
    }
    setActiveMetaSubSection("ads");
    setActiveFilter("all");
    setSearchQuery("");
    setResetModalOpen(false);
    setMoreMenuOpen(false);
  };

  const handleRefresh = () => {
    if (draftsDiscarded) {
      setAdsList(INITIAL_ADS);
      setAdsetsList(INITIAL_ADSETS);
      setCampaignsList(INITIAL_CAMPAIGNS);
      setSelectedAdIds(["ad-2"]);
      setDraftsDiscarded(false);
    }
    if (onRefresh) onRefresh();
  };

  // Download menu state & click-outside handling
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadRef = useRef(null);

  // Ad Account Picker popup state (two-panel image2 format)
  const [adAccountPickerOpen, setAdAccountPickerOpen] = useState(false);
  const [adAccountSearchQuery, setAdAccountSearchQuery] = useState("");
  const adAccountPickerRef = useRef(null);

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
    const activeSel = getActiveSelection();
    let toPublish = [];
    if (activeSel.ids.length > 0) {
      toPublish = activeSel.items;
    } else {
      toPublish = activeSel.list.filter((item) => item.delivery === "In draft" || !item.active);
    }

    if (toPublish.length === 0) {
      showToast("Nothing to publish. All items are already active.", "info");
      return;
    }

    setPublishingTotal(toPublish.length);
    setPublishingProgress(20);
    setPublishingItemName(toPublish[0]?.name || "Item");
    setPublishingModalOpen(true);

    setTimeout(() => {
      setPublishingProgress(65);
    }, 250);

    setTimeout(() => {
      setPublishingProgress(100);
      const publishIds = toPublish.map((item) => item.id);
      activeSel.setList((prev) =>
        prev.map((item) =>
          publishIds.includes(item.id)
            ? { ...item, delivery: "Active", active: true, lastSignificantEdit: "Just now" }
            : item
        )
      );
      if (draftsDiscarded) setDraftsDiscarded(false);

      setTimeout(() => {
        setPublishingModalOpen(false);
        showToast(
          `Published ${toPublish.length} ${toPublish.length === 1 ? activeSel.typeLabel : activeSel.pluralLabel
          } successfully!`
        );
      }, 350);
    }, 600);
  };

  // 2. Duplicate Action (Meta Quick Duplicate & Custom Copies)
  const handleQuickDuplicate = (customCopies = 1) => {
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
        };
        newItems.push(newItem);
        newIds.push(newId);
      }
    });

    activeSel.setList((prev) => [...newItems, ...prev]);
    activeSel.setSelection(newIds);
    setDuplicateMenuOpen(false);
    setDuplicateModalOpen(false);
    showToast(
      `Duplicated ${newItems.length} ${newItems.length === 1 ? activeSel.typeLabel : activeSel.pluralLabel
      } as draft.`
    );
  };

  // 3. Edit Action & Slide-over Drawer
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
    setEditingItemData({ ...activeSel.items[0] });
    setEditDrawerOpen(true);
    setEditMenuOpen(false);
  };

  const handleSaveEditDrawer = () => {
    if (!editingItemData) return;
    const activeSel = getActiveSelection();
    activeSel.setList((prev) =>
      prev.map((item) =>
        item.id === editingItemData.id ? { ...editingItemData, lastSignificantEdit: "Just now" } : item
      )
    );
    setEditDrawerOpen(false);
    showToast(`Saved changes to "${editingItemData.name}".`);
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

  const handleSaveQuickEdit = () => {
    const activeSel = getActiveSelection();
    activeSel.setList((prev) =>
      prev.map((item) =>
        activeSel.ids.includes(item.id)
          ? {
            ...item,
            name: quickEditName || item.name,
            budget: quickEditBudget || item.budget,
            lastSignificantEdit: "Just now",
          }
          : item
      )
    );
    setQuickEditModalOpen(false);
    showToast(`Quick edit updated ${activeSel.ids.length} ${activeSel.pluralLabel}.`);
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

  const handleExecuteFindReplace = () => {
    if (!findText) {
      showToast("Please enter text to find.", "info");
      return;
    }
    const activeSel = getActiveSelection();
    let updatedCount = 0;
    activeSel.setList((prev) =>
      prev.map((item) => {
        if (!activeSel.ids.includes(item.id)) return item;
        const flags = matchCase ? "g" : "gi";
        const newName = item.name.replace(new RegExp(findText, flags), replaceText);
        if (newName !== item.name) updatedCount++;
        return { ...item, name: newName, lastSignificantEdit: "Just now" };
      })
    );
    setFindReplaceModalOpen(false);
    showToast(`Replaced text in ${updatedCount} ${activeSel.pluralLabel}.`);
  };

  const handleBatchTurnOn = () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel}.`, "info");
      return;
    }
    activeSel.setList((prev) =>
      prev.map((item) =>
        activeSel.ids.includes(item.id)
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
    showToast(`Turned on ${activeSel.ids.length} ${activeSel.pluralLabel}.`);
  };

  const handleBatchTurnOff = () => {
    const activeSel = getActiveSelection();
    if (activeSel.ids.length === 0) {
      showToast(`Please select at least one ${activeSel.typeLabel}.`, "info");
      return;
    }
    activeSel.setList((prev) =>
      prev.map((item) =>
        activeSel.ids.includes(item.id)
          ? { ...item, active: false, delivery: "Off", lastSignificantEdit: "Just now" }
          : item
      )
    );
    setEditMenuOpen(false);
    showToast(`Turned off ${activeSel.ids.length} ${activeSel.pluralLabel}.`);
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

  const handleConfirmDelete = () => {
    const activeSel = getActiveSelection();
    const count = activeSel.ids.length;
    activeSel.setList((prev) => prev.filter((item) => !activeSel.ids.includes(item.id)));
    activeSel.setSelection([]);
    setDeleteModalOpen(false);
    showToast(`Deleted ${count} ${count === 1 ? activeSel.typeLabel : activeSel.pluralLabel}.`);
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
    };

    const handleKeyDown = (e) => {
      // Ctrl + Shift + / -> Shortcuts
      if (e.ctrlKey && e.shiftKey && (e.key === "/" || e.key === "?")) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
      // Ctrl + D -> Quick Duplicate
      if (e.ctrlKey && e.key.toLowerCase() === "d" && !e.shiftKey) {
        e.preventDefault();
        handleQuickDuplicate(1);
      }
      // Ctrl + U -> Edit Selected
      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        handleOpenEditDrawer();
      }
      if (e.key === "Escape") {
        setMoreMenuOpen(false);
        setDownloadMenuOpen(false);
        setDiscardModalOpen(false);
        setResetModalOpen(false);
        setShortcutsModalOpen(false);
        setDatePickerOpen(false);
        setAdAccountPickerOpen(false);
        setDuplicateMenuOpen(false);
        setEditMenuOpen(false);
        setDuplicateModalOpen(false);
        setEditDrawerOpen(false);
        setQuickEditModalOpen(false);
        setFindReplaceModalOpen(false);
        setDeleteModalOpen(false);
        setPublishingModalOpen(false);
      }
    };

    if (
      downloadMenuOpen ||
      moreMenuOpen ||
      datePickerOpen ||
      adAccountPickerOpen ||
      duplicateMenuOpen ||
      editMenuOpen
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
    selectedAdIds,
    selectedAdsetIds,
    selectedCampaignIds,
    activeMetaSubSection,
  ]);

  const handleExport = (format) => {
    const activeData =
      activeMetaSubSection === "ads"
        ? adsList.map((a) => ({
          Name: a.name,
          Delivery: a.delivery,
          Budget: `${a.budget} ${a.budgetSub}`.trim(),
          Ends: a.ends,
          "Bid Strategy": `${a.bidStrategy} ${a.bidStrategySub}`.trim(),
          "Ad Set": a.adsetName,
          Status: a.active ? "Active" : "Paused",
        }))
        : activeMetaSubSection === "adsets"
          ? adsetsList.map((as) => ({
            Name: as.name,
            Delivery: as.delivery,
            Budget: `${as.budget} ${as.budgetSub}`.trim(),
            Ends: as.ends,
            "Bid Strategy": `${as.bidStrategy} ${as.bidStrategySub}`.trim(),
            Attribution: as.attribution,
            Status: as.active ? "Active" : "Paused",
          }))
          : campaignsList.map((c) => ({
            Name: c.name,
            Delivery: c.delivery,
            Budget: `${c.budget} ${c.budgetSub}`.trim(),
            Ends: c.ends,
            "Bid Strategy": `${c.bidStrategy} ${c.bidStrategySub}`.trim(),
            Attribution: c.attribution,
            Status: c.active ? "Active" : "Paused",
          }));

    if (!activeData.length) return;

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
    link.download = `Meta_${activeMetaSubSection.toUpperCase()}_Export_${dateStr}.${format === "xlsx" ? "xlsx" : "csv"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadMenuOpen(false);
  };


  const toggleAdActive = (id) => {
    setAdsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const toggleAdsetActive = (id) => {
    setAdsetsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const toggleCampaignActive = (id) => {
    setCampaignsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
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
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 750, color: "#0f172a" }}>Ads</span>
              </div>

              {/* Account Dropdown — two-panel picker (image2 format) */}
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
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 6,
                    background: adAccountPickerOpen ? "#f1f5f9" : "#ffffff",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.82rem",
                    color: "#1e293b",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "0.88rem" }}>🪪</span>
                  <span>1405144991733037 (14051449...</span>
                  <ChevronDown
                    size={14}
                    color="#64748b"
                    style={{
                      transform: adAccountPickerOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>

                {/* Two-panel popup */}
                {adAccountPickerOpen && (() => {
                  const ALL_ACCOUNTS = [
                    { id: "1405144991733037", name: "Athira S", platform: "meta" },
                  ];
                  const filtered = ALL_ACCOUNTS.filter((a) =>
                    !adAccountSearchQuery.trim() ||
                    a.name.toLowerCase().includes(adAccountSearchQuery.toLowerCase()) ||
                    a.id.includes(adAccountSearchQuery)
                  );
                  const selectedId = "1405144991733037";

                  return (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        width: 560,
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

                      {/* Search row */}
                      <div style={{ position: "relative", padding: "10px 12px", borderBottom: "1px solid #f0f2f5" }}>
                        <Search size={14} style={{ position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)", color: "#65676b", pointerEvents: "none" }} />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search for an ad account"
                          value={adAccountSearchQuery}
                          onChange={(e) => setAdAccountSearchQuery(e.target.value)}
                          style={{
                            width: "100%",
                            height: 38,
                            padding: "0 32px 0 36px",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: 6,
                            fontSize: "0.86rem",
                            color: "#1c1e21",
                            background: "#f0f2f5",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                          onFocus={(e) => { e.target.style.borderColor = "#1877f2"; e.target.style.background = "#fff"; }}
                          onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f0f2f5"; }}
                        />
                        {adAccountSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setAdAccountSearchQuery("")}
                            style={{ position: "absolute", right: 22, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8a8d91", display: "flex", alignItems: "center", padding: 2, borderRadius: "50%" }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Two-panel body */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 260 }}>
                        {/* LEFT panel */}
                        <div style={{ padding: "12px 12px 12px 14px", borderRight: "1px solid #f0f2f5", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>
                          {/* Client Email section */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 12, borderBottom: "1px solid #e4e6ea", marginBottom: 4 }}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21" }}>Client Email</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #ccd0d5", borderRadius: 8, padding: "7px 10px", background: "#fff" }}>
                              <Send size={14} style={{ color: "#606770", flexShrink: 0 }} />
                              <input
                                type="email"
                                placeholder="client@email.com"
                                style={{ flex: 1, border: "none", outline: "none", fontSize: "0.83rem", color: "#1c1e21", background: "transparent" }}
                              />
                            </div>
                            <button
                              type="button"
                              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "9px 12px", background: "#1877f2", color: "#ffffff", border: "none", borderRadius: 8, fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", gap: 6 }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#166fe5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#1877f2")}
                            >
                              <Send size={14} />
                              Send Connection Request
                            </button>
                          </div>

                          {/* Other assets */}
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.76rem", fontWeight: 700, color: "#606770", padding: "10px 0 4px 0", marginTop: 4 }}>
                            <span>Other assets</span>
                            <Info size={13} style={{ color: "#8a8d91", cursor: "help" }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
                            {filtered.map((acc) => (
                              <button
                                key={acc.id}
                                type="button"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "9px 8px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: acc.id === selectedId ? "#e7f3ff" : "#ffffff",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  width: "100%",
                                  transition: "background 0.12s ease",
                                }}
                                onMouseEnter={(e) => { if (acc.id !== selectedId) e.currentTarget.style.background = "#f0f2f5"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = acc.id === selectedId ? "#e7f3ff" : "#ffffff"; }}
                                onClick={() => setAdAccountPickerOpen(false)}
                              >
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <MetaLogoIcon size={16} />
                                </div>
                                <span style={{ flex: 1, fontSize: "0.84rem", fontWeight: 600, color: "#1c1e21", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {acc.name}
                                </span>
                                <ChevronRight size={14} style={{ flexShrink: 0, color: "#8a8d91" }} />
                              </button>
                            ))}
                          </div>

                          {/* Footer */}
                          <button
                            type="button"
                            onClick={() => setAdAccountPickerOpen(false)}
                            style={{ width: "100%", marginTop: 10, padding: "9px 12px", background: "#1877f2", color: "#ffffff", border: "none", borderRadius: 8, fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.15s ease" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#1565d8")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#1877f2")}
                          >
                            Create ad using Meta Ads
                          </button>
                        </div>

                        {/* RIGHT panel */}
                        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                          <div style={{ padding: "12px 16px 8px", fontSize: "0.8rem", fontWeight: 700, color: "#1c1e21", borderBottom: "1px solid #f0f2f5" }}>
                            {filtered.length} ad account{filtered.length !== 1 ? "s" : ""}
                          </div>
                          <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
                            {filtered.length === 0 ? (
                              <div style={{ padding: "20px 12px", fontSize: "0.84rem", color: "#65676b", textAlign: "center" }}>No accounts found</div>
                            ) : filtered.map((acc) => {
                              const isSel = acc.id === selectedId;
                              return (
                                <button
                                  key={acc.id}
                                  type="button"
                                  onClick={() => setAdAccountPickerOpen(false)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 8px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: isSel ? "#e7f3ff" : "#ffffff",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    width: "100%",
                                    transition: "background 0.12s ease",
                                  }}
                                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "#f0f2f5"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = isSel ? "#e7f3ff" : "#ffffff"; }}
                                >
                                  <span style={{
                                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                                    background: isSel ? "#1877f2" : "#dadde1",
                                    border: `2px solid ${isSel ? "#1877f2" : "#dadde1"}`,
                                    boxShadow: isSel ? "0 0 0 2px rgba(24,119,242,0.2)" : "none",
                                  }} />
                                  <div style={{ width: 26, height: 26, borderRadius: 5, background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <MetaLogoIcon size={15} />
                                  </div>
                                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                                    <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.name}</span>
                                    <span style={{ fontSize: "0.72rem", color: "#65676b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Ad account ID: {acc.id}</span>
                                  </div>
                                  <MoreHorizontal size={16} style={{ flexShrink: 0, color: "#8a8d91" }} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Meta Action Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Updated just now</span>
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh"
                style={{
                  padding: "5px 7px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  cursor: "pointer",
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              >
                <RefreshCw size={13} />
              </button>

              {/* Discard Drafts Button (Hidden after discard, matching Image 2) */}
              {!draftsDiscarded && (
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
                disabled={draftsDiscarded}
                style={{
                  padding: "6px 16px",
                  borderRadius: 6,
                  border: draftsDiscarded ? "1px solid #cbd5e1" : "none",
                  background: draftsDiscarded ? "#f1f5f9" : "#0064e1",
                  color: draftsDiscarded ? "#94a3b8" : "#ffffff",
                  fontSize: "0.84rem",
                  fontWeight: 650,
                  cursor: draftsDiscarded ? "not-allowed" : "pointer",
                  boxShadow: draftsDiscarded ? "none" : "0 1px 2px rgba(0, 100, 225, 0.2)",
                  transition: "all 0.15s ease",
                }}
              >
                {draftsDiscarded ? "Review and publish" : "Review and publish (22)"}
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



          {/* 2. FILTER PILLS & SEARCH BAR (From Image 1 & Image 2) */}
          <div
            style={{
              padding: "10px 18px 10px 18px",
              background: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Filter Pills Row matching Image 1 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* 1. All ads */}
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: activeFilter === "all" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: activeFilter === "all" ? 650 : 500,
                  color: activeFilter === "all" ? "#0064e1" : "#334155",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== "all") e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== "all") e.currentTarget.style.background = "#ffffff";
                }}
              >
                <Folder size={14} color={activeFilter === "all" ? "#0064e1" : "#64748b"} strokeWidth={1.8} />
                <span>All ads</span>
              </button>

              {/* 2. Had delivery */}
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === "had_delivery" ? "all" : "had_delivery")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: activeFilter === "had_delivery" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: activeFilter === "had_delivery" ? 650 : 500,
                  color: activeFilter === "had_delivery" ? "#0064e1" : "#334155",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== "had_delivery") e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== "had_delivery") e.currentTarget.style.background = "#ffffff";
                }}
              >
                <Mail size={14} color={activeFilter === "had_delivery" ? "#0064e1" : "#64748b"} strokeWidth={1.8} />
                <span>Had delivery</span>
              </button>

              {/* 3. Actions (Active by default, matching Image 1) */}
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === "actions" ? "all" : "actions")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: activeFilter === "actions" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: activeFilter === "actions" ? 650 : 500,
                  color: activeFilter === "actions" ? "#0064e1" : "#334155",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== "actions") e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== "actions") e.currentTarget.style.background = "#ffffff";
                }}
              >
                {/* (↑) Actions icon matching Image 1 */}
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="10" cy="10" r="8" stroke={activeFilter === "actions" ? "#0064e1" : "#64748b"} strokeWidth="1.6" />
                  <path
                    d="M10 13.5V6.5M10 6.5L7 9.5M10 6.5L13 9.5"
                    stroke={activeFilter === "actions" ? "#0064e1" : "#64748b"}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Actions</span>
              </button>

              {/* 4. Active ads */}
              <button
                type="button"
                onClick={() => setActiveFilter(activeFilter === "active" ? "all" : "active")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: activeFilter === "active" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: activeFilter === "active" ? 650 : 500,
                  color: activeFilter === "active" ? "#0064e1" : "#334155",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== "active") e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== "active") e.currentTarget.style.background = "#ffffff";
                }}
              >
                <Send size={13} color={activeFilter === "active" ? "#0064e1" : "#64748b"} style={{ transform: "rotate(-10deg)" }} />
                <span>Active ads</span>
              </button>
            </div>

            {/* Search Input Bar matching Image 2 */}
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe what you're looking for"
                style={{
                  width: "100%",
                  padding: "8px 36px 8px 14px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.85rem",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.15s ease",
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
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 3. The 3 Subsections Tabs: Campaigns, Ad sets, Ads (Directly from Images 1, 2, 3) */}
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
                onClick={() => setActiveMetaSubSection("campaigns")}
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
                onClick={() => setActiveMetaSubSection("adsets")}
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
                onClick={() => setActiveMetaSubSection("ads")}
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

          {/* 4. Action Bar Toolbar below tabs (Exact Buttons from Images 1, 2, 3) */}
          <div
            style={{
              padding: "9px 18px",
              background: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {/* Left Action Buttons (Meta Ads Manager Action Toolbar) */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              {/* 1. + Create (Green Button) */}
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
                  background: "#008000",
                  color: "#ffffff",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 128, 0, 0.2)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#006600")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#008000")}
              >
                <Plus size={16} strokeWidth={2.8} />
                <span>Create</span>
              </button>

              {/* 2. Publish button */}
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
                <UploadCloud size={14} color="#64748b" />
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
                  <Copy size={13} color="#64748b" />
                  <span>Duplicate</span>
                  <ChevronDown size={13} color="#64748b" />
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
                        const activeSel = getActiveSelection();
                        if (activeSel.ids.length === 0) {
                          showToast(`Please select at least one ${activeSel.typeLabel} to duplicate.`, "info");
                          return;
                        }
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
                  <Edit2 size={13} color="#64748b" />
                  <span>Edit</span>
                  <ChevronDown size={13} color="#64748b" />
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
                        transition: "background 0.1s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#16a34a",
                          display: "inline-block",
                        }}
                      />
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
                        transition: "background 0.1s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#94a3b8",
                          display: "inline-block",
                        }}
                      />
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
            </div>

            {/* Right Action: Download Button with 2 Options (Export as .csv, Export as .xlsx) matching Image 2 */}
            <div ref={downloadRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setDownloadMenuOpen((prev) => !prev)}
                title="Download / Export"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 9px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: downloadMenuOpen ? "#f1f5f9" : "#ffffff",
                  cursor: "pointer",
                  color: "#334155",
                  transition: "all 0.15s ease",
                }}
              >
                <Download size={14} color="#334155" />
                <ChevronDown size={13} color="#64748b" />
              </button>

              {downloadMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    width: 170,
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)",
                    zIndex: 50,
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
                      fontSize: "0.85rem",
                      color: "#1e293b",
                      cursor: "pointer",
                      display: "block",
                      fontWeight: 500,
                      transition: "background 0.12s",
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
                      fontSize: "0.85rem",
                      color: "#1e293b",
                      cursor: "pointer",
                      display: "block",
                      fontWeight: 500,
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Export as .xlsx
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 5. FULL HORIZONTAL SCROLLING TABLE WITH ALL 19 COLUMNS (From Images 1, 2, 3) */}
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              background: "#ffffff",
              position: "relative",
            }}
          >
            {/* ═══ ADS TABLE: ALL 19 COLUMNS COVERING IMAGES 1, 2, 3 ═══ */}
            {activeMetaSubSection === "ads" && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 2350,
                  fontSize: "0.83rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {/* 1. Checkbox (Sticky Left) */}
                    <th
                      style={{
                        width: 44,
                        minWidth: 44,
                        padding: "10px 14px",
                        position: "sticky",
                        left: 0,
                        zIndex: 3,
                        background: "#f8fafc",
                        borderBottom: "1px solid #cbd5e1",
                        borderRight: "1px solid #f1f5f9",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAdIds.length === filteredAds.length && filteredAds.length > 0}
                        onChange={(e) =>
                          setSelectedAdIds(e.target.checked ? filteredAds.map((a) => a.id) : [])
                        }
                        style={{ cursor: "pointer", width: 15, height: 15 }}
                      />
                    </th>

                    {/* 2. Off... ↑↓ (Sticky Left) */}
                    <th
                      style={{
                        width: 70,
                        minWidth: 70,
                        padding: "10px 10px",
                        position: "sticky",
                        left: 44,
                        zIndex: 3,
                        background: "#f8fafc",
                        borderBottom: "1px solid #cbd5e1",
                        borderRight: "1px solid #f1f5f9",
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Off...</span>
                        <ArrowUpDown size={11} color="#64748b" />
                      </div>
                    </th>

                    {/* 3. Ad ↑ (Sticky Left with Shadow separator) */}
                    <th
                      style={{
                        minWidth: 260,
                        width: 260,
                        padding: "10px 16px",
                        position: "sticky",
                        left: 114,
                        zIndex: 3,
                        background: "#f8fafc",
                        borderBottom: "1px solid #cbd5e1",
                        borderRight: "1px solid #cbd5e1",
                        boxShadow: "2px 0 5px rgba(0,0,0,0.04)",
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#0064e1" }}>Ad</span>
                        <ArrowUp size={12} color="#0064e1" />
                        <ChevronDown size={12} color="#64748b" style={{ marginLeft: "auto" }} />
                      </div>
                    </th>

                    {/* 4. Delivery ↑↓ (Image 1) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Delivery</span>
                        <ArrowUpDown size={11} />
                        <ChevronDown size={11} style={{ marginLeft: "auto" }} />
                      </div>
                    </th>

                    {/* 5. Actions ▾ (Image 1) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Actions</span>
                        <ChevronDown size={11} style={{ marginLeft: "auto" }} />
                      </div>
                    </th>

                    {/* 6. Results ↑↓ (Image 1) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Results</span>
                        <ArrowUpDown size={11} />
                        <ChevronDown size={11} style={{ marginLeft: "auto" }} />
                      </div>
                    </th>

                    {/* 7. Cost per result ↑↓ (Image 1) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Cost per result</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>

                    {/* 8. Budget (Ad set) ▾ (Image 1) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <div>
                          <div>Budget</div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>Ad set</div>
                        </div>
                        <ChevronDown size={11} style={{ marginLeft: "auto" }} />
                      </div>
                    </th>

                    {/* 9. Amount spent ↑↓ (Image 1 & 2) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Amount spent</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>

                    {/* 10. Impressions ↑↓ (Image 2) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Impressions</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>

                    {/* 11. Reach ↑↓ (Image 2) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Reach</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>

                    {/* 12. Ends ↑↓ (Image 2) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Ends</span>
                        <ArrowUpDown size={11} />
                      </div>
                    </th>

                    {/* 13. Attribution setting (Image 2) */}
                    <th style={thStyle}>
                      <span>Attribution setting</span>
                    </th>

                    {/* 14. Bid strategy (Ad set) ▾ (Image 2 & 3) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <div>
                          <div>Bid strategy</div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>Ad set</div>
                        </div>
                        <ChevronDown size={11} style={{ marginLeft: "auto" }} />
                      </div>
                    </th>

                    {/* 15. Last significant edit (Image 2 & 3) */}
                    <th style={thStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Last significant edit</span>
                        <ChevronDown size={11} style={{ marginLeft: "auto" }} />
                      </div>
                    </th>

                    {/* 16. Quality ranking (Ad relevance...) ↑↓ (Image 3) */}
                    <th style={thStyle}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span>Quality ranking</span>
                          <ArrowUpDown size={11} />
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>Ad relevance...</div>
                      </div>
                    </th>

                    {/* 17. Engagement rate ranking (Ad relevance...) ↑↓ (Image 3) */}
                    <th style={thStyle}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span>Engage...</span>
                          <ArrowUpDown size={11} />
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>Ad relevance...</div>
                      </div>
                    </th>

                    {/* 18. Conversion rate ranking (Ad relevance...) ↑↓ (Image 3) */}
                    <th style={thStyle}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span>Conver...</span>
                          <ArrowUpDown size={11} />
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>Ad relevance...</div>
                      </div>
                    </th>

                    {/* 19. Ad set name ↑↓ (Image 3) */}
                    <th style={{ ...thStyle, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span>Ad set name</span>
                        <ArrowUpDown size={11} />
                        <span style={{ marginLeft: "auto", color: "#94a3b8" }}>+</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {draftsDiscarded || adsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={19}
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
                        colSpan={19}
                        style={{
                          padding: "50px 20px",
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
                          <Search size={32} color="#94a3b8" />
                          <span style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>
                            No ads match your search or filter
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                            Try selecting another filter pill or clearing your search.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveFilter("all");
                              setSearchQuery("");
                            }}
                            style={{
                              marginTop: 4,
                              padding: "6px 16px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#0064e1",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAds.map((ad, idx) => {
                      const isSelected = selectedAdIds.includes(ad.id);
                      // Selected row background matching Meta teal/green highlight from Images 1, 2, 3
                      const rowBg = isSelected ? "#e2f3ec" : idx % 2 === 0 ? "#ffffff" : "#fbfcfd";

                      return (
                        <tr
                          key={ad.id}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                        >
                          {/* 1. Checkbox (Sticky) */}
                          <td
                            style={{
                              padding: "12px 14px",
                              position: "sticky",
                              left: 0,
                              zIndex: 2,
                              background: rowBg,
                              borderBottom: "1px solid #e2e8f0",
                              borderRight: "1px solid #f1f5f9",
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
                              style={{ cursor: "pointer", width: 15, height: 15 }}
                            />
                          </td>

                          {/* 2. Off/On Switch (Sticky) */}
                          <td
                            style={{
                              padding: "12px 10px",
                              position: "sticky",
                              left: 44,
                              zIndex: 2,
                              background: rowBg,
                              borderBottom: "1px solid #e2e8f0",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleAdActive(ad.id)}
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

                          {/* 3. Ad Name & Thumbnail (Sticky with Shadow) */}
                          <td
                            style={{
                              padding: "10px 16px",
                              position: "sticky",
                              left: 114,
                              zIndex: 2,
                              background: rowBg,
                              borderBottom: "1px solid #e2e8f0",
                              borderRight: "1px solid #cbd5e1",
                              boxShadow: "2px 0 5px rgba(0,0,0,0.04)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {ad.thumb ? (
                                <img
                                  src={ad.thumb}
                                  alt={ad.name}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 4,
                                    objectFit: "cover",
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <AdPlaceholderIcon />
                              )}
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 550,
                                  color: "#0f172a",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ad.name}
                              </span>
                            </div>
                          </td>

                          {/* 4. Delivery (In draft with green circle) */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  border: "2px solid #16a34a",
                                  background: "transparent",
                                  display: "inline-block",
                                }}
                              />
                              <span style={{ color: "#334155", fontWeight: 500 }}>{ad.delivery}</span>
                            </div>
                          </td>

                          {/* 5. Actions */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.actions}
                          </td>

                          {/* 6. Results */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.results}
                          </td>

                          {/* 7. Cost per result */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.costPerResult}
                          </td>

                          {/* 8. Budget (Ad set) */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                            <div>
                              <div style={{ color: "#0f172a", fontWeight: 500 }}>{ad.budget}</div>
                              {ad.budgetSub && (
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.budgetSub}</div>
                              )}
                            </div>
                          </td>

                          {/* 9. Amount spent */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.amountSpent}
                          </td>

                          {/* 10. Impressions */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.impressions}
                          </td>

                          {/* 11. Reach */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.reach}
                          </td>

                          {/* 12. Ends */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
                            {ad.ends}
                          </td>

                          {/* 13. Attribution setting */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.attribution}
                          </td>

                          {/* 14. Bid strategy (Ad set) */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                            <div>
                              <div style={{ color: "#0f172a", fontWeight: 500 }}>{ad.bidStrategy}</div>
                              {ad.bidStrategySub && (
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{ad.bidStrategySub}</div>
                              )}
                            </div>
                          </td>

                          {/* 15. Last significant edit */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.lastSignificantEdit}
                          </td>

                          {/* 16. Quality ranking */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.qualityRanking}
                          </td>

                          {/* 17. Engagement rate ranking */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.engagementRanking}
                          </td>

                          {/* 18. Conversion rate ranking */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                            {ad.conversionRanking}
                          </td>

                          {/* 19. Ad set name */}
                          <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                            <div>
                              <div style={{ color: "#0064e1", fontWeight: 500, cursor: "pointer" }}>
                                {ad.adsetName}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                {ad.activeAdsCount}
                              </div>
                            </div>
                          </td>
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
                  minWidth: 1600,
                  fontSize: "0.83rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ width: 44, padding: "10px 14px", position: "sticky", left: 0, background: "#f8fafc", zIndex: 3, borderBottom: "1px solid #cbd5e1" }}>
                      <input
                        type="checkbox"
                        checked={selectedAdsetIds.length === filteredAdsets.length && filteredAdsets.length > 0}
                        onChange={(e) =>
                          setSelectedAdsetIds(e.target.checked ? filteredAdsets.map((a) => a.id) : [])
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </th>
                    <th style={{ width: 70, padding: "10px 10px", position: "sticky", left: 44, background: "#f8fafc", zIndex: 3, borderBottom: "1px solid #cbd5e1", color: "#475569", fontWeight: 700 }}>
                      Off...
                    </th>
                    <th style={{ minWidth: 260, padding: "10px 16px", position: "sticky", left: 114, background: "#f8fafc", zIndex: 3, borderBottom: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1", color: "#475569", fontWeight: 700 }}>
                      Ad set
                    </th>
                    <th style={thStyle}>Delivery</th>
                    <th style={thStyle}>Bid strategy</th>
                    <th style={thStyle}>Budget</th>
                    <th style={thStyle}>Attribution setting</th>
                    <th style={thStyle}>Results</th>
                    <th style={thStyle}>Reach</th>
                    <th style={thStyle}>Impressions</th>
                    <th style={thStyle}>Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {draftsDiscarded || adsetsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
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
                      <td colSpan={12} style={{ padding: "50px 20px", textAlign: "center", background: "#ffffff" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <Search size={32} color="#94a3b8" />
                          <span style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>No ad sets match your search or filter</span>
                          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Try selecting another filter pill or clearing your search.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveFilter("all");
                              setSearchQuery("");
                            }}
                            style={{
                              marginTop: 4,
                              padding: "6px 16px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#0064e1",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAdsets.map((as, idx) => (
                      <tr key={as.id} style={{ background: idx % 2 === 0 ? "#ffffff" : "#fbfcfd" }}>
                        <td style={{ padding: "12px 14px", position: "sticky", left: 0, background: idx % 2 === 0 ? "#ffffff" : "#fbfcfd", zIndex: 2, borderBottom: "1px solid #e2e8f0" }}>
                          <input
                            type="checkbox"
                            checked={selectedAdsetIds.includes(as.id)}
                            onChange={(e) => {
                              setSelectedAdsetIds((prev) =>
                                e.target.checked ? [...prev, as.id] : prev.filter((id) => id !== as.id)
                              );
                            }}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ padding: "12px 10px", position: "sticky", left: 44, background: idx % 2 === 0 ? "#ffffff" : "#fbfcfd", zIndex: 2, borderBottom: "1px solid #e2e8f0" }}>
                          <button
                            type="button"
                            onClick={() => toggleAdsetActive(as.id)}
                            style={{
                              width: 32,
                              height: 18,
                              borderRadius: 9,
                              background: as.active ? "#0064e1" : "#cbd5e1",
                              border: "none",
                              padding: "2px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: as.active ? "flex-end" : "flex-start",
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ffffff" }} />
                          </button>
                        </td>
                        <td style={{ padding: "12px 16px", position: "sticky", left: 114, background: idx % 2 === 0 ? "#ffffff" : "#fbfcfd", zIndex: 2, borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #cbd5e1", color: "#0064e1", fontWeight: 600 }}>
                          {as.name}
                        </td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #16a34a" }} />
                            <span style={{ color: "#334155" }}>{as.delivery}</span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                          <div>
                            <div>{as.bidStrategy}</div>
                            {as.bidStrategySub && <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{as.bidStrategySub}</div>}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                          <div>
                            <div>{as.budget}</div>
                            {as.budgetSub && <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{as.budgetSub}</div>}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{as.attribution}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{as.results}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{as.reach}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{as.impressions}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#334155" }}>{as.ends}</td>
                      </tr>
                    ))
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
                  minWidth: 1600,
                  fontSize: "0.83rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ width: 44, padding: "10px 14px", position: "sticky", left: 0, background: "#f8fafc", zIndex: 3, borderBottom: "1px solid #cbd5e1" }}>
                      <input
                        type="checkbox"
                        checked={selectedCampaignIds.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                        onChange={(e) =>
                          setSelectedCampaignIds(e.target.checked ? filteredCampaigns.map((c) => c.id) : [])
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </th>
                    <th style={{ width: 70, padding: "10px 10px", position: "sticky", left: 44, background: "#f8fafc", zIndex: 3, borderBottom: "1px solid #cbd5e1", color: "#475569", fontWeight: 700 }}>
                      Off...
                    </th>
                    <th style={{ minWidth: 260, padding: "10px 16px", position: "sticky", left: 114, background: "#f8fafc", zIndex: 3, borderBottom: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1", color: "#475569", fontWeight: 700 }}>
                      Campaign
                    </th>
                    <th style={thStyle}>Delivery</th>
                    <th style={thStyle}>Bid strategy</th>
                    <th style={thStyle}>Budget</th>
                    <th style={thStyle}>Attribution setting</th>
                    <th style={thStyle}>Results</th>
                    <th style={thStyle}>Reach</th>
                    <th style={thStyle}>Impressions</th>
                    <th style={thStyle}>Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {draftsDiscarded || campaignsList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
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
                      <td colSpan={10} style={{ padding: "50px 20px", textAlign: "center", background: "#ffffff" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <Search size={32} color="#94a3b8" />
                          <span style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a" }}>No campaigns match your search or filter</span>
                          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Try selecting another filter pill or clearing your search.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveFilter("all");
                              setSearchQuery("");
                            }}
                            style={{
                              marginTop: 4,
                              padding: "6px 16px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#0064e1",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((camp, idx) => (
                      <tr key={camp.id} style={{ background: idx % 2 === 0 ? "#ffffff" : "#fbfcfd" }}>
                        <td style={{ padding: "12px 14px", position: "sticky", left: 0, background: idx % 2 === 0 ? "#ffffff" : "#fbfcfd", zIndex: 2, borderBottom: "1px solid #e2e8f0" }}>
                          <input
                            type="checkbox"
                            checked={selectedCampaignIds.includes(camp.id)}
                            onChange={(e) => {
                              setSelectedCampaignIds((prev) =>
                                e.target.checked ? [...prev, camp.id] : prev.filter((id) => id !== camp.id)
                              );
                            }}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ padding: "12px 10px", position: "sticky", left: 44, background: idx % 2 === 0 ? "#ffffff" : "#fbfcfd", zIndex: 2, borderBottom: "1px solid #e2e8f0" }}>
                          <button
                            type="button"
                            onClick={() => toggleCampaignActive(camp.id)}
                            style={{
                              width: 32,
                              height: 18,
                              borderRadius: 9,
                              background: camp.active ? "#0064e1" : "#cbd5e1",
                              border: "none",
                              padding: "2px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: camp.active ? "flex-end" : "flex-start",
                              cursor: "pointer",
                            }}
                          >
                            <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ffffff" }} />
                          </button>
                        </td>
                        <td style={{ padding: "12px 16px", position: "sticky", left: 114, background: idx % 2 === 0 ? "#ffffff" : "#fbfcfd", zIndex: 2, borderBottom: "1px solid #e2e8f0", borderRight: "1px solid #cbd5e1", color: "#0064e1", fontWeight: 600 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                            <span
                              onClick={() => handleOpenStandaloneEditorForCampaign(camp)}
                              title="Click to edit campaign in Meta Ads Manager"
                              style={{ cursor: "pointer", textDecoration: "none" }}
                              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                            >
                              {camp.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenStandaloneEditorForCampaign(camp)}
                              title="Edit campaign in Meta Ads Manager"
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 4,
                                borderRadius: 4,
                                color: "#64748b",
                                display: "inline-flex",
                                alignItems: "center",
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
                              <Edit2 size={12} />
                            </button>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #16a34a" }} />
                            <span style={{ color: "#334155" }}>{camp.delivery}</span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#475569" }}>{camp.bidStrategy}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0" }}>
                          <div>
                            <div>{camp.budget}</div>
                            {camp.budgetSub && <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{camp.budgetSub}</div>}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{camp.attribution}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{camp.results}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{camp.reach}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>{camp.impressions}</td>
                        <td style={{ ...tdStyle, borderBottom: "1px solid #e2e8f0", color: "#334155" }}>{camp.ends}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Table Footer Count matching Images 1, 2, 3 */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                fontSize: "0.82rem",
                color: "#64748b",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>
                  Results from{" "}
                  {activeMetaSubSection === "ads"
                    ? `${filteredAds.length} ads`
                    : activeMetaSubSection === "adsets"
                      ? `${filteredAdsets.length} ad sets`
                      : `${filteredCampaigns.length} campaigns`}
                </span>
                <Info size={13} color="#64748b" style={{ cursor: "pointer" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.76rem", color: "#0064e1", cursor: "pointer" }}>
                <span>👁️</span>
                <span>View results</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GOOGLE ADS SECTION ── */}
      {selectedPlatform === "google" && (
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
          <GoogleAdsLogoIcon size={48} style={{ marginBottom: 16 }} />
          <h3 style={{ margin: "0 0 8px 0", color: "#0f172a", fontSize: "1.2rem", fontWeight: 700 }}>
            Google Ads Management
          </h3>
          <p style={{ margin: 0, fontSize: "0.88rem", maxWidth: 460 }}>
            Connect and manage Google Search, Display, and Performance Max campaigns directly from this workspace.
          </p>
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
                Athira S [1405144991733037]
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

      {/* ── KEYBOARD SHORTCUTS MODAL ── */}
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
            backgroundColor: "rgba(0, 0, 0, 0.5)",
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
              maxWidth: 480,
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
              position: "relative",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px 12px 24px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#1c1e21" }}>
                Keyboard shortcuts
              </h3>
              <button
                type="button"
                onClick={() => setShortcutsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                }}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            <div style={{ padding: "16px 24px", fontSize: "0.88rem", color: "#334155" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                <span>Show keyboard shortcuts</span>
                <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: "0.8rem", fontWeight: 600 }}>Ctrl + Shift + /</kbd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                <span>Close dialogs / menus</span>
                <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: "0.8rem", fontWeight: 600 }}>Esc</kbd>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                <span>Duplicate selected item</span>
                <kbd style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: "0.8rem", fontWeight: 600 }}>Ctrl + D</kbd>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 24px 18px 24px" }}>
              <button
                type="button"
                onClick={() => setShortcutsModalOpen(false)}
                style={{
                  padding: "7px 20px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                Done
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
              maxWidth: 500,
              boxShadow: "0 10px 32px rgba(0, 0, 0, 0.22)",
              overflow: "hidden",
              position: "relative",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with two tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px 0 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
                {/* Tab 1: Create new campaign */}
                <button
                  type="button"
                  onClick={() => setCreateModalTab("campaign")}
                  style={{
                    padding: "8px 18px 12px 18px",
                    background: "transparent",
                    border: "none",
                    borderBottom: createModalTab === "campaign" ? "2.5px solid #0064e1" : "2.5px solid transparent",
                    fontSize: "0.9rem",
                    fontWeight: createModalTab === "campaign" ? 700 : 500,
                    color: createModalTab === "campaign" ? "#0f172a" : "#65676b",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    paddingBottom: 10,
                  }}
                >
                  Create new campaign
                </button>
                {/* Tab 2: New ad set or ad */}
                <button
                  type="button"
                  onClick={() => setCreateModalTab("adset")}
                  style={{
                    padding: "8px 18px 12px 18px",
                    background: createModalTab === "adset" ? "#e7f0fd" : "transparent",
                    border: "none",
                    borderBottom: createModalTab === "adset" ? "2.5px solid #0064e1" : "2.5px solid transparent",
                    borderRadius: createModalTab === "adset" ? "6px 6px 0 0" : 0,
                    fontSize: "0.9rem",
                    fontWeight: createModalTab === "adset" ? 700 : 500,
                    color: createModalTab === "adset" ? "#1877f2" : "#65676b",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    paddingBottom: 10,
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
                  marginBottom: 4,
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
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* Buying type */}
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.88rem", fontWeight: 650, color: "#1c1e21", marginBottom: 6 }}>
                      Choose a buying type
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: "50%", background: "#e4e6eb", fontSize: "0.7rem", color: "#65676b", fontWeight: 700, cursor: "help" }} title="Buying type determines how you buy your ads.">?</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={createBuyingType}
                        onChange={(e) => setCreateBuyingType(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 32px 8px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "0.9rem",
                          color: "#1c1e21",
                          cursor: "pointer",
                          appearance: "none",
                          outline: "none",
                        }}
                      >
                        <option value="Auction">Auction</option>
                        <option value="Reach and Frequency">Reach and Frequency</option>
                      </select>
                      <ChevronDown size={15} color="#65676b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  {/* Campaign objective */}
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 650, color: "#1c1e21", marginBottom: 10 }}>
                      Choose a campaign objective
                    </div>
                    {/* Objectives list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {CREATE_OBJECTIVES.map((obj) => {
                        const isSelected = createObjective === obj.id;
                        return (
                          <button
                            key={obj.id}
                            type="button"
                            onClick={() => setCreateObjective(obj.id)}
                            onDoubleClick={() => handleLaunchStandaloneEditor(obj.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "9px 12px",
                              borderRadius: 6,
                              border: isSelected ? "1.5px solid #0064e1" : "1px solid transparent",
                              background: isSelected ? "#f0f7ff" : "transparent",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.13s ease",
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f7f8fa"; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
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
                            <span style={{ fontSize: "0.88rem", color: "#1c1e21", fontWeight: isSelected ? 650 : 450 }}>
                              {obj.label}
                            </span>
                          </button>
                        );
                      })}
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
                    handleLaunchStandaloneEditor(createObjective);
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
    </div>
  );
}

// Consistent Table Header & Cell Styles
const thStyle = {
  padding: "10px 16px",
  fontSize: "0.78rem",
  color: "#475569",
  fontWeight: 700,
  borderBottom: "1px solid #cbd5e1",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 16px",
  whiteSpace: "nowrap",
  color: "#0f172a",
};
