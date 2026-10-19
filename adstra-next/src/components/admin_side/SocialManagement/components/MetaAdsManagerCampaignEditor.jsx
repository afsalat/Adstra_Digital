"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Calendar,
  Folder,
  LayoutGrid,
  FileText,
  Edit2,
  Eye,
  Sliders,
  Sparkles,
  X,
  Plus,
  Trash2,
  UploadCloud,
  Check,
  Globe,
  Share2,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  SlidersHorizontal,
  Search,
  Megaphone,
  MousePointer,
  Filter,
  Smartphone,
  ShoppingBag,
  Clock,
  BarChart2,
  Coins,
  Briefcase,
  Home,
  Flag,
} from "lucide-react";

const Tv = ({ size = 14, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
    <polyline points="17 2 12 7 7 2"/>
  </svg>
);

// Prohibited/Warning circle with slash icon (matching Image 2)
const MetaProhibitedIcon = ({ size = 16, color = "#dc2626" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.8" />
    <line x1="4.5" y1="4.5" x2="15.5" y2="15.5" stroke={color} strokeWidth="1.8" />
  </svg>
);

// Folder & Ad icons
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

const MetaGridIcon = ({ size = 16, active = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <rect
      x="3"
      y="3"
      width="5.5"
      height="5.5"
      rx="1.2"
      fill={active ? "#0064e1" : "none"}
      stroke={active ? "#0064e1" : "#64748b"}
      strokeWidth="1.5"
    />
    <rect
      x="11.5"
      y="3"
      width="5.5"
      height="5.5"
      rx="1.2"
      fill={active ? "#0064e1" : "none"}
      stroke={active ? "#0064e1" : "#64748b"}
      strokeWidth="1.5"
    />
    <rect
      x="3"
      y="11.5"
      width="5.5"
      height="5.5"
      rx="1.2"
      fill={active ? "#0064e1" : "none"}
      stroke={active ? "#0064e1" : "#64748b"}
      strokeWidth="1.5"
    />
    <rect
      x="11.5"
      y="11.5"
      width="5.5"
      height="5.5"
      rx="1.2"
      fill={active ? "#0064e1" : "none"}
      stroke={active ? "#0064e1" : "#64748b"}
      strokeWidth="1.5"
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

// Blue sliced circle icon for Identity (matching Screenshot 3)
const MetaIdentityIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="10" cy="10" r="8" stroke="#0064e1" strokeWidth="2" />
    <path d="M10 2 A8 8 0 0 1 18 10 L10 10 Z" fill="#0064e1" />
  </svg>
);

// Half-filled status indicator circle (matching Screenshot 1, 2, 3 tree)
const MetaStatusHalfCircleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6.5" stroke="#4880c8" strokeWidth="1.5" />
    <path d="M8 1.5 A6.5 6.5 0 0 1 8 14.5 Z" fill="#4880c8" />
  </svg>
);

// Meta Empty Preview Isometric Card Illustration (matching Screenshot 3)
const MetaEmptyPreviewIllustration = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 20px 36px 20px",
    }}
  >
    <svg
      width="210"
      height="160"
      viewBox="0 0 210 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background card left (tilted) */}
      <rect
        x="32"
        y="44"
        width="90"
        height="105"
        rx="8"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        transform="rotate(-9 32 44)"
      />
      {/* Background card right (tilted) */}
      <rect
        x="100"
        y="30"
        width="90"
        height="105"
        rx="8"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        transform="rotate(7 100 30)"
      />

      {/* Foreground Center Card */}
      <g filter="drop-shadow(0 8px 16px rgba(0,0,0,0.06))">
        <rect
          x="52"
          y="30"
          width="106"
          height="116"
          rx="8"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        {/* Soft blue banner gradient */}
        <path
          d="M52 38a8 8 0 0 1 8-8h90a8 8 0 0 1 8 8v42H52V38z"
          fill="url(#metaCardBlueGrad)"
        />
        {/* Blue Circle Badge */}
        <circle cx="70" cy="50" r="7.5" fill="#0064e1" />
        {/* White header line */}
        <rect x="83" y="47" width="46" height="5" rx="2.5" fill="#ffffff" opacity="0.9" />
        {/* Content placeholder lines */}
        <rect x="66" y="86" width="78" height="4" rx="2" fill="#e2e8f0" />
        <rect x="66" y="96" width="56" height="4" rx="2" fill="#e2e8f0" />
        {/* Blue Action Button at bottom */}
        <rect x="66" y="118" width="78" height="15" rx="4" fill="#0064e1" />
      </g>
      <defs>
        <linearGradient
          id="metaCardBlueGrad"
          x1="52"
          y1="30"
          x2="158"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#bfdbfe" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
    </svg>
    <div
      style={{
        marginTop: 18,
        fontSize: "0.88rem",
        color: "#65676b",
        fontWeight: 500,
        textAlign: "center",
      }}
    >
      Add media to see ad examples.
    </div>
  </div>
);

const PRESET_CREATIVES = [
  {
    id: "img-1",
    label: "Creative Showcase 1",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "img-2",
    label: "Digital Innovation",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "img-3",
    label: "Strategic Growth",
    url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
  },
];

// Meta Ads Manager Separator Options
const FIELD_SEPARATOR_OPTIONS = [
  { value: "\\/", label: "\\/" },
  { value: "—", label: "—" },
  { value: "::", label: "::" },
  { value: ":", label: ":" },
  { value: "--", label: "--" },
  { value: "..", label: ".." },
  { value: "||", label: "||" },
  { value: "|", label: "|" },
  { value: "+", label: "+" },
  { value: "_", label: "_" },
  { value: "-", label: "-" },
  { value: ".", label: "." },
  { value: "/", label: "/" },
  { value: "//", label: "//" },
  { value: "None", label: "None" },
];

const ITEM_SEPARATOR_OPTIONS = [
  { value: "::", label: "::" },
  { value: ":", label: ":" },
  { value: "—", label: "—" },
  { value: "--", label: "--" },
  { value: "-", label: "-" },
  { value: "_", label: "_" },
  { value: "..", label: ".." },
  { value: ".", label: "." },
  { value: "||", label: "||" },
  { value: "|", label: "|" },
  { value: ",", label: "," },
  { value: "+", label: "+" },
  { value: "/", label: "/" },
  { value: "//", label: "//" },
  { value: "None", label: "None" },
];

const OBJECTIVES_LIST = [
  { id: "Awareness", label: "Awareness", icon: Megaphone },
  { id: "Traffic", label: "Traffic", icon: MousePointer },
  { id: "Engagement", label: "Engagement", icon: MessageCircle },
  { id: "Leads", label: "Leads", icon: Filter },
  { id: "App promotion", label: "App promotion", icon: Smartphone },
  { id: "Sales", label: "Sales", icon: ShoppingBag },
];

const SPECIAL_AD_CATEGORIES = [
  {
    id: "financial",
    title: "Financial products and services",
    description:
      "Ads for credit cards, long-term financing, current and savings accounts, investment services, insurance services or other related financial opportunities.",
    icon: Coins,
  },
  {
    id: "employment",
    title: "Employment",
    description:
      "Ads for job offers, internships, professional certification programmes or other related opportunities.",
    icon: Briefcase,
  },
  {
    id: "housing",
    title: "Housing",
    description:
      "Ads for property listings, home insurance, mortgages or other related opportunities.",
    icon: Home,
  },
  {
    id: "social_issues",
    title: "Social issues, elections or politics",
    description:
      "Ads about social issues (such as health, civil and social rights), elections or candidates for political office.",
    icon: Flag,
  },
];

export default function MetaAdsManagerCampaignEditor({
  isOpen,
  initialData,
  onClose,
  onPublish,
  onSaveDraft,
}) {
  // Active level: "campaign" | "adset" | "ad"
  const [activeLevel, setActiveLevel] = useState(
    initialData?.activeLevel || initialData?.level || "campaign"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Campaign Level State (Screenshot 1 & 3) ──
  const defaultObj = initialData?.objective || "Leads";
  const [objective, setObjective] = useState(defaultObj);
  const [campaignName, setCampaignName] = useState(
    initialData?.campaignName || `New ${defaultObj} campaign`
  );
  const [buyingType, setBuyingType] = useState(initialData?.buyingType || "Auction");
  const [templateToggleOn, setTemplateToggleOn] = useState(true);
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [campaignSpendingLimit, setCampaignSpendingLimit] = useState("");

  // Budget & A/B testing & Frequency (Image 1 & 2)
  const [budgetStrategyOpen, setBudgetStrategyOpen] = useState(true);
  const [budgetStrategy, setBudgetStrategy] = useState("adset");
  const [shareBudgetEnabled, setShareBudgetEnabled] = useState(false);
  const [campaignFrequencyControlEnabled, setCampaignFrequencyControlEnabled] = useState(false);
  const [budgetType, setBudgetType] = useState(initialData?.budgetType || "daily");
  const [budgetAmount, setBudgetAmount] = useState(initialData?.budgetAmount || 1000);
  const [bidStrategy, setBidStrategy] = useState("Highest volume");
  const [showMoreBudgetSettings, setShowMoreBudgetSettings] = useState(false);
  const [budgetScheduling, setBudgetScheduling] = useState("None selected");
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [specialCategory, setSpecialCategory] = useState(
    initialData?.specialCategory || "none"
  );
  const [selectedSpecialCategories, setSelectedSpecialCategories] = useState(
    initialData?.specialCategories ||
    (initialData?.specialCategory && initialData.specialCategory !== "none"
      ? [initialData.specialCategory]
      : [])
  );
  const [specialDropdownOpen, setSpecialDropdownOpen] = useState(false);
  const specialDropdownRef = useRef(null);

  // ── Ad Set Level State (Meta Ads Manager Exact Replication) ──
  const [adsetName, setAdsetName] = useState(
    initialData?.adsetName || `New ${defaultObj} ad set`
  );
  const [securitiesDisclaimerChecked, setSecuritiesDisclaimerChecked] = useState(false);
  const [conversionLocation, setConversionLocation] = useState(
    defaultObj === "App promotion" ? "app" : "instant_forms"
  );
  const [mobileAppStore, setMobileAppStore] = useState("Google Play Store");
  const [appNameQuery, setAppNameQuery] = useState("");
  const [countryAvailabilityChecked, setCountryAvailabilityChecked] = useState(false);
  const [performanceGoal, setPerformanceGoal] = useState("Maximise number of app installs");
  const [leadPerformanceGoal, setLeadPerformanceGoal] = useState("Maximise number of leads");
  const [awarenessGoal, setAwarenessGoal] = useState("Maximise reach of ads");
  const [frequencyCapNumber, setFrequencyCapNumber] = useState(1);
  const [frequencyCapDays, setFrequencyCapDays] = useState(7);
  const [trafficLocation, setTrafficLocation] = useState("website");
  const [trafficGoal, setTrafficGoal] = useState("Maximise number of link clicks");
  const [engagementLocation, setEngagementLocation] = useState("on_ad");
  const [engagementType, setEngagementType] = useState("video_views");
  const [engagementGoal, setEngagementGoal] = useState("Maximise ThruPlay views");
  const [salesLocation, setSalesLocation] = useState("website");
  const [salesGoal, setSalesGoal] = useState("Maximise number of conversions");
  const [leadTermsAccepted, setLeadTermsAccepted] = useState(false);
  const [verifyingCardOpen, setVerifyingCardOpen] = useState(true);
  const [showPlacementChangesNotice, setShowPlacementChangesNotice] = useState(true);
  const [placementValueRulesOpen, setPlacementValueRulesOpen] = useState(true);
  const [placementShowMoreOpen, setPlacementShowMoreOpen] = useState(false);
  const [adSchedulingOpen, setAdSchedulingOpen] = useState(false);
  const [showEstimatedAudienceSize, setShowEstimatedAudienceSize] = useState(false);
  const [startDate, setStartDate] = useState("15-10-2026");
  const [startTime, setStartTime] = useState("14:30");
  const [endDateEnabled, setEndDateEnabled] = useState(false);
  const [endDate, setEndDate] = useState("30-11-2026");
  const [endTime, setEndTime] = useState("23:59");
  const [targetLocation, setTargetLocation] = useState("India");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState("65+");
  const [targetGender, setTargetGender] = useState("All");
  const [placementsType, setPlacementsType] = useState("advantage");
  const [manualPlatforms, setManualPlatforms] = useState({
    facebook: true,
    instagram: true,
    audienceNetwork: true,
    messenger: true,
  });
  const [manualPlacementsList, setManualPlacementsList] = useState({
    feeds: true,
    storiesReels: true,
    inStream: true,
    search: true,
    messages: true,
    appsSites: true,
  });

  // ── Ad Level State (Native Meta Ads Manager matching Images 2, 3, 4, 5) ──
  const [adName, setAdName] = useState(
    initialData?.adName || `New ${defaultObj} campaign - Ad`
  );
  const [partnershipAdEnabled, setPartnershipAdEnabled] = useState(false);
  const [facebookPageConnected, setFacebookPageConnected] = useState(true);
  const [facebookPage, setFacebookPage] = useState(initialData?.facebookPage || initialData?.account_name || "Adstra Business");
  const [instagramAccount, setInstagramAccount] = useState(initialData?.instagramAccount || "adstradigital");
  const [threadsProfile, setThreadsProfile] = useState(initialData?.threadsProfile || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialData?.whatsappNumber || "");
  const [facebookPageModalOpen, setFacebookPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState(initialData?.account_name || "Adstra Business");
  const [newPageCategory, setNewPageCategory] = useState("Agency (Brand)");
  const [leadInstantForm, setLeadInstantForm] = useState("Lead Generation Form - High Intent (Recommended)");
  const [previewPlacement, setPreviewPlacement] = useState("fb_feed");
  const [createFormModalOpen, setCreateFormModalOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("Lead Generation Form - High Intent");

  // Meta Ad Setup & Creative States (Images 3 & 4)
  const [adSetupOption, setAdSetupOption] = useState("Use existing post");
  const [multiAdvertiserAds, setMultiAdvertiserAds] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState("122207744828933412");
  const [selectedPostDate, setSelectedPostDate] = useState("11 Oct 2026");
  const [selectedPostTitle, setSelectedPostTitle] = useState("Scale your brand with performance marketing...");
  const [aiTransparency, setAiTransparency] = useState(false);
  const [addDestination, setAddDestination] = useState(false);
  const [previewPlacementFilter, setPreviewPlacementFilter] = useState("all");

  const [adFormat, setAdFormat] = useState("single");
  const [primaryText, setPrimaryText] = useState(
    initialData?.primaryText ||
      `Scale your brand with high-performing Meta Ad campaigns.\n\nBoost conversions, acquire high-intent leads, and engage target audiences with ROI-driven ad creative.\n\nLearn more: https://adstradigital.com`
  );
  const [headline, setHeadline] = useState(initialData?.headline || "Scale Your Business with Meta Ads");
  const [descriptionText, setDescriptionText] = useState("Official Meta Marketing Solutions.");
  const [callToAction, setCallToAction] = useState(initialData?.callToAction || "Learn more");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || "https://adstradigital.com");
  const [selectedCreativeUrl, setSelectedCreativeUrl] = useState(
    initialData?.selectedCreativeUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80"
  );
  const [adPreviewEnabled, setAdPreviewEnabled] = useState(true);
  const [adPreviewMode, setAdPreviewMode] = useState("live");

  // Sync state whenever initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.activeLevel) {
        setActiveLevel(initialData.activeLevel);
      } else {
        setActiveLevel("campaign");
      }
      if (initialData.objective) setObjective(initialData.objective);
      if (initialData.campaignName) setCampaignName(initialData.campaignName);
      if (initialData.buyingType) setBuyingType(initialData.buyingType);
      if (initialData.budgetAmount) setBudgetAmount(initialData.budgetAmount);
      if (initialData.budgetType) setBudgetType(initialData.budgetType);
      if (initialData.adsetName) setAdsetName(initialData.adsetName);
      if (initialData.adName) setAdName(initialData.adName);
      if (initialData.headline) setHeadline(initialData.headline);
      if (initialData.primaryText) setPrimaryText(initialData.primaryText);
      if (initialData.callToAction) setCallToAction(initialData.callToAction);
      if (initialData.selectedCreativeUrl) setSelectedCreativeUrl(initialData.selectedCreativeUrl);
      if (initialData.specialCategory) setSpecialCategory(initialData.specialCategory);
      if (initialData.specialCategories) setSelectedSpecialCategories(initialData.specialCategories);
    }
  }, [initialData]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        specialDropdownRef.current &&
        !specialDropdownRef.current.contains(e.target)
      ) {
        setSpecialDropdownOpen(false);
      }
    }
    if (specialDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [specialDropdownOpen]);



  const toggleSpecialCategory = (catId) => {
    setSelectedSpecialCategories((prev) => {
      const next = prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId];
      setSpecialCategory(next.length > 0 ? next[0] : "none");
      return next;
    });
  };

  const getCategoryDisplayText = () => {
    if (selectedSpecialCategories.length === 0) {
      return "Declare category if applicable";
    }
    const titles = selectedSpecialCategories
      .map((id) => SPECIAL_AD_CATEGORIES.find((c) => c.id === id)?.title)
      .filter(Boolean);
    return titles.join(", ");
  };




  // Template modal & name templates page states
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [campaignEditingMode, setCampaignEditingMode] = useState(false);
  const [templateComponents, setTemplateComponents] = useState([
    {
      id: "comp-c-1",
      type: "open_text",
      fieldId: "open_text",
      label: "Open text field",
      customValue: "Open text field",
    },
  ]);
  const [fieldSeparator, setFieldSeparator] = useState("\\/");
  const [itemSeparator, setItemSeparator] = useState("::");
  const [isTemplateConventionActive, setIsTemplateConventionActive] = useState(false);

  // Ad set template state
  const [adsetEditingMode, setAdsetEditingMode] = useState(false);
  const [adsetTemplateComponents, setAdsetTemplateComponents] = useState([]);
  const [adsetFieldSeparator, setAdsetFieldSeparator] = useState("—");
  const [adsetItemSeparator, setAdsetItemSeparator] = useState(":");
  const [isAdsetTemplateActive, setIsAdsetTemplateActive] = useState(false);

  // Ad template state
  const [adEditingMode, setAdEditingMode] = useState(false);
  const [adTemplateComponents, setAdTemplateComponents] = useState([]);
  const [adFieldSeparator, setAdFieldSeparator] = useState("—");
  const [adItemSeparator, setAdItemSeparator] = useState(":");
  const [isAdTemplateActive, setIsAdTemplateActive] = useState(false);

  // Dropdown states for components across sections
  const [openDropdownSection, setOpenDropdownSection] = useState(null); // "campaign" | "adset" | "ad" | null
  const [openSubmenu, setOpenSubmenu] = useState(null); // "fields" | "existing" | null
  const [editingCompId, setEditingCompId] = useState(null);
  const [editingCompValue, setEditingCompValue] = useState("");
  const [hoveredEditId, setHoveredEditId] = useState(null);

  // Helper to compute live preview of templates
  const computeTemplatePreview = (components, separator, fallback, mapFn) => {
    if (!components || components.length === 0) return fallback;
    const parts = components.map(mapFn);
    if (parts.length === 0) return fallback;
    if (parts.length === 1) return parts[0];

    let sep = " — ";
    if (separator === "\\/" || separator === "\\") sep = "\\";
    else if (separator === "—") sep = " — ";
    else if (separator === "::") sep = "::";
    else if (separator === ":") sep = ":";
    else if (separator === "--") sep = "--";
    else if (separator === "..") sep = "..";
    else if (separator === "||") sep = "||";
    else if (separator === "|") sep = "|";
    else if (separator === "+") sep = "+";
    else if (separator === "_") sep = "_";
    else if (separator === "-") sep = "-";
    else if (separator === ".") sep = ".";
    else if (separator === "/") sep = "/";
    else if (separator === "//") sep = "//";
    else if (separator === "None") sep = " ";
    else sep = separator;

    return parts.join(sep);
  };

  const previewTemplateName = useMemo(() => {
    return computeTemplatePreview(
      templateComponents,
      fieldSeparator,
      campaignName || "New Engagement Campaign",
      (comp) => {
        if (comp.fieldId === "cbo") return "CBO on";
        if (comp.fieldId === "objective") return objective || "Reach";
        if (comp.fieldId === "campaign_id") return "campaign_group_id";
        if (comp.fieldId === "open_text") return comp.customValue || "Open text field";
        if (comp.fieldId === "custom_field") return comp.customValue || "Custom field";
        return comp.customValue || comp.label || "";
      }
    );
  }, [templateComponents, fieldSeparator, objective, campaignName]);

  const previewAdsetName = useMemo(() => {
    return computeTemplatePreview(
      adsetTemplateComponents,
      adsetFieldSeparator,
      adsetName || "New Engagement Ad set",
      (comp) => {
        if (comp.fieldId === "audience") return "Broad Audience";
        if (comp.fieldId === "placement") return "Advantage+ placements";
        if (comp.fieldId === "optimization_goal") return performanceGoal || "Engagement";
        if (comp.fieldId === "budget") return `₹${budgetAmount || 1000}`;
        if (comp.fieldId === "adset_id") return "adset_group_id";
        if (comp.fieldId === "gender") return "All genders";
        if (comp.fieldId === "age") return "18-65+";
        if (comp.fieldId === "open_text") return comp.customValue || "Open text field";
        if (comp.fieldId === "custom_field") return comp.customValue || "Custom field";
        return comp.customValue || comp.label || "";
      }
    );
  }, [adsetTemplateComponents, adsetFieldSeparator, performanceGoal, budgetAmount, adsetName]);

  const previewAdName = useMemo(() => {
    return computeTemplatePreview(
      adTemplateComponents,
      adFieldSeparator,
      adName || "New Engagement Ad",
      (comp) => {
        if (comp.fieldId === "ad_format") return adFormat === "single" ? "Single image or video" : "Carousel";
        if (comp.fieldId === "creative_name") return "Creative 1";
        if (comp.fieldId === "ad_id") return "ad_creative_id";
        if (comp.fieldId === "call_to_action") return callToAction || "Learn more";
        if (comp.fieldId === "placement") return "Instagram feed";
        if (comp.fieldId === "open_text") return comp.customValue || "Open text field";
        if (comp.fieldId === "custom_field") return comp.customValue || "Custom field";
        return comp.customValue || comp.label || "";
      }
    );
  }, [adTemplateComponents, adFieldSeparator, adFormat, callToAction, adName]);

  // Keep names synchronized if active
  useEffect(() => {
    if (isTemplateConventionActive && templateComponents.length > 0 && previewTemplateName) {
      setCampaignName(previewTemplateName);
    }
  }, [objective, previewTemplateName, isTemplateConventionActive, templateComponents.length]);

  useEffect(() => {
    if (isAdsetTemplateActive && adsetTemplateComponents.length > 0 && previewAdsetName) {
      setAdsetName(previewAdsetName);
    }
  }, [isAdsetTemplateActive, previewAdsetName, adsetTemplateComponents.length]);

  useEffect(() => {
    if (isAdTemplateActive && adTemplateComponents.length > 0 && previewAdName) {
      setAdName(previewAdName);
    }
  }, [isAdTemplateActive, previewAdName, adTemplateComponents.length]);

  // Handlers for adding/removing components
  const handleAddComponent = (section, fieldId, label, defaultVal) => {
    const newComp = {
      id: `comp-${section}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: fieldId === "open_text" || fieldId === "custom_field" ? fieldId : `${section}_field`,
      fieldId,
      label,
      customValue: defaultVal || label,
    };
    if (section === "campaign") setTemplateComponents((prev) => [...prev, newComp]);
    else if (section === "adset") setAdsetTemplateComponents((prev) => [...prev, newComp]);
    else if (section === "ad") setAdTemplateComponents((prev) => [...prev, newComp]);
    setOpenDropdownSection(null);
    setOpenSubmenu(null);
  };

  const handleRemoveComponent = (section, id) => {
    if (section === "campaign") setTemplateComponents((prev) => prev.filter((c) => c.id !== id));
    else if (section === "adset") setAdsetTemplateComponents((prev) => prev.filter((c) => c.id !== id));
    else if (section === "ad") setAdTemplateComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleStartEditing = (comp) => {
    setEditingCompId(comp.id);
    setEditingCompValue(comp.customValue || comp.label);
  };

  const handleSaveEditing = (section, id) => {
    const updater = (prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              customValue: editingCompValue,
              label:
                c.fieldId === "open_text" || c.fieldId === "custom_field"
                  ? editingCompValue
                  : c.label,
            }
          : c
      );
    if (section === "campaign") setTemplateComponents(updater);
    else if (section === "adset") setAdsetTemplateComponents(updater);
    else if (section === "ad") setAdTemplateComponents(updater);
    setEditingCompId(null);
  };

  const handleApplyPresetTemplate = (section, presetIndex) => {
    if (section === "campaign") {
      if (presetIndex === 1) {
        setTemplateComponents([
          { id: `c-obj-${Date.now()}`, type: "campaign_field", fieldId: "objective", label: "Objective", customValue: "Reach" },
        ]);
      } else {
        setTemplateComponents([
          { id: `c-id-${Date.now()}`, type: "campaign_field", fieldId: "campaign_id", label: "Campaign ID", customValue: "campaign_group_id" },
        ]);
      }
      setFieldSeparator("\\");
    } else if (section === "adset") {
      setAdsetTemplateComponents([
        { id: `as-aud-${Date.now()}`, type: "adset_field", fieldId: "audience", label: "Audience", customValue: "Broad Audience" },
        { id: `as-opt-${Date.now()}`, type: "adset_field", fieldId: "optimization_goal", label: "Optimization goal", customValue: "Engagement" },
      ]);
      setAdsetFieldSeparator("\\");
    } else if (section === "ad") {
      setAdTemplateComponents([
        { id: `ad-cr-${Date.now()}`, type: "ad_field", fieldId: "creative_name", label: "Creative name", customValue: "Creative 1" },
        { id: `ad-fmt-${Date.now()}`, type: "ad_field", fieldId: "ad_format", label: "Ad format", customValue: "Single image or video" },
      ]);
      setAdFieldSeparator("\\");
    }
    setOpenDropdownSection(null);
    setOpenSubmenu(null);
  };

  const handleSaveCampaignTemplate = () => {
    if (previewTemplateName) {
      setCampaignName(previewTemplateName);
      setIsTemplateConventionActive(true);
      setTemplateToggleOn(true);
    }
    setCampaignEditingMode(false);
  };

  const handleSaveAdsetTemplate = () => {
    if (previewAdsetName) {
      setAdsetName(previewAdsetName);
      setIsAdsetTemplateActive(true);
    }
    setAdsetEditingMode(false);
  };

  const handleSaveAdTemplate = () => {
    if (previewAdName) {
      setAdName(previewAdName);
      setIsAdTemplateActive(true);
    }
    setAdEditingMode(false);
  };

  const handleCloseTemplateModal = () => {
    setTemplateModalOpen(false);
    setOpenDropdownSection(null);
    setOpenSubmenu(null);
    setEditingCompId(null);
  };

  // Sync with initialData
  useEffect(() => {
    if (initialData?.objective) {
      setObjective(initialData.objective);
      if (!initialData.campaignName && !initialData.adsetName && !initialData.adName) {
        setCampaignName(`New ${initialData.objective} campaign`);
        setAdsetName(`New ${initialData.objective} ad set`);
        setAdName(`New ${initialData.objective} ad`);
      }
    }
  }, [initialData]);

  const numericBudget = Number(budgetAmount) || 1000;
  const maxDailySpend = (numericBudget * 1.75).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const maxWeeklySpend = (numericBudget * 7).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const formattedBudget = numericBudget.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const handleClose = () => {
    if (onSaveDraft) {
      onSaveDraft({
        ...(initialData || {}),
        campaignName,
        buyingType,
        objective,
        budgetStrategy,
        budgetType,
        budgetAmount: numericBudget,
        abTestEnabled,
        specialCategory,
        specialCategories: selectedSpecialCategories,
        adsetName,
        mobileAppStore,
        appNameQuery,
        performanceGoal,
        startDate,
        adName,
        callToAction,
        headline,
        primaryText,
        selectedCreativeUrl,
      });
    }
    onClose();
  };

  const handlePublishClick = () => {
    if (onPublish) {
      onPublish({
        ...(initialData || {}),
        campaignName,
        buyingType,
        objective,
        budgetStrategy,
        budgetType,
        budgetAmount: numericBudget,
        abTestEnabled,
        specialCategory,
        specialCategories: selectedSpecialCategories,
        adsetName,
        mobileAppStore,
        appNameQuery,
        performanceGoal,
        startDate,
        adName,
        callToAction,
        headline,
        primaryText,
        selectedCreativeUrl,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#1c1e21",
        overflow: "hidden",
      }}
    >
      {/* ── TOP NAV BAR (Exact match to Screenshots 1, 2, 3) ── */}
      <header
        style={{
          height: 48,
          background: "#ffffff",
          borderBottom: "1px solid #e4e6eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Left: Sidebar toggle + Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Toggle sidebar button */}
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            title="Toggle sidebar"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1c1e21",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f2f4f7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke="#1c1e21" strokeWidth="1.6" />
              <line x1="7.5" y1="2.5" x2="7.5" y2="17.5" stroke="#1c1e21" strokeWidth="1.6" />
            </svg>
          </button>

          {/* Breadcrumbs hierarchy (Matching Screenshots 1, 2, 3) */}
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
            {/* 1. Campaign Breadcrumb */}
            <button
              type="button"
              onClick={() => setActiveLevel("campaign")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 4,
                border: "none",
                background: activeLevel === "campaign" ? "#e7f3ff" : "transparent",
                color: activeLevel === "campaign" ? "#0064e1" : "#1c1e21",
                fontWeight: activeLevel === "campaign" ? 650 : 500,
                fontSize: "0.86rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                maxWidth: 240,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={(e) => {
                if (activeLevel !== "campaign") e.currentTarget.style.background = "#f0f2f5";
              }}
              onMouseLeave={(e) => {
                if (activeLevel !== "campaign") e.currentTarget.style.background = "transparent";
              }}
            >
              <MetaFolderIcon size={15} active={activeLevel === "campaign"} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {campaignName || `New ${objective} campaign`}
              </span>
            </button>

            <ChevronRight size={13} color="#8a8d91" />

            {/* 2. Ad Set Breadcrumb */}
            <button
              type="button"
              onClick={() => setActiveLevel("adset")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 4,
                border: "none",
                background: activeLevel === "adset" ? "#e7f3ff" : "transparent",
                color: activeLevel === "adset" ? "#0064e1" : activeLevel === "ad" ? "#1c1e21" : "#65676b",
                fontWeight: activeLevel === "adset" ? 650 : 500,
                fontSize: "0.86rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                maxWidth: 240,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={(e) => {
                if (activeLevel !== "adset") e.currentTarget.style.background = "#f0f2f5";
              }}
              onMouseLeave={(e) => {
                if (activeLevel !== "adset") e.currentTarget.style.background = "transparent";
              }}
            >
              <MetaGridIcon size={15} active={activeLevel === "adset"} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeLevel === "campaign" ? "1 Ad set" : adsetName || `New ${objective} ad set`}
              </span>
            </button>

            <ChevronRight size={13} color="#8a8d91" />

            {/* 3. Ad Breadcrumb */}
            <button
              type="button"
              onClick={() => setActiveLevel("ad")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 4,
                border: "none",
                background: activeLevel === "ad" ? "#e7f3ff" : "transparent",
                color: activeLevel === "ad" ? "#0064e1" : "#65676b",
                fontWeight: activeLevel === "ad" ? 650 : 500,
                fontSize: "0.86rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
                maxWidth: 240,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={(e) => {
                if (activeLevel !== "ad") e.currentTarget.style.background = "#f0f2f5";
              }}
              onMouseLeave={(e) => {
                if (activeLevel !== "ad") e.currentTarget.style.background = "transparent";
              }}
            >
              <MetaAdIcon size={15} active={activeLevel === "ad"} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {activeLevel === "ad" ? adName || `New ${objective} ad` : "1 Ad"}
              </span>
            </button>

            {/* Edit & Review Action Buttons (Right beside breadcrumbs) */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
              <button
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "none",
                  background: "#e7f3ff",
                  color: "#0064e1",
                  fontSize: "0.84rem",
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                <Edit2 size={13} color="#0064e1" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 4,
                  border: "none",
                  background: "transparent",
                  color: "#1c1e21",
                  fontSize: "0.84rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f2f4f7")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Eye size={14} color="#65676b" />
                <span>Review</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Right Actions: In draft status, Active Toggle, More */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* In draft status with green hollow circle (Screenshots 1, 2, 3) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.84rem",
              color: "#1c1e21",
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "2px solid #008000",
                display: "inline-block",
                boxSizing: "border-box",
              }}
            />
            <span>In draft</span>
          </div>

          {/* Active campaign toggle switch (Screenshots 1, 2, 3) */}
          <div
            role="switch"
            aria-checked="true"
            style={{
              width: 34,
              height: 20,
              borderRadius: 10,
              background: "#0064e1",
              padding: 2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
              }}
            />
          </div>

          {/* More options button */}
          <button
            type="button"
            title="More actions"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: 6,
              color: "#65676b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f2f4f7")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* ── WORKSPACE BODY: Sidebar + Main Content ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ── LEFT TREE NAVIGATION RAIL (Screenshots 1, 2, 3) ── */}
        {sidebarOpen && (
          <aside
            style={{
              width: 250,
              background: "#ffffff",
              borderRight: "1px solid #e4e6eb",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            {/* Top row with dots */}
            <div
              style={{
                padding: "8px 14px",
                display: "flex",
                justifyContent: "flex-end",
                borderBottom: "1px solid #f0f2f5",
              }}
            >
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#65676b",
                  padding: 3,
                }}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Tree items */}
            <div style={{ padding: "6px 0", flex: 1, overflowY: "auto" }}>
              {/* Campaign node */}
              <div
                onClick={() => setActiveLevel("campaign")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 14px",
                  cursor: "pointer",
                  background: activeLevel === "campaign" ? "#e7f3ff" : "transparent",
                  borderLeft:
                    activeLevel === "campaign" ? "3px solid #0064e1" : "3px solid transparent",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeLevel !== "campaign") e.currentTarget.style.background = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  if (activeLevel !== "campaign") e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <MetaFolderIcon size={16} active={activeLevel === "campaign"} />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: activeLevel === "campaign" ? 650 : 500,
                      color: activeLevel === "campaign" ? "#0064e1" : "#1c1e21",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 155,
                    }}
                  >
                    {campaignName || `New ${objective} campaign`}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MoreHorizontal size={14} color="#8a8d91" />
                </div>
              </div>

              {/* Ad set node (indented) */}
              <div
                onClick={() => setActiveLevel("adset")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 14px 9px 26px",
                  cursor: "pointer",
                  background: activeLevel === "adset" ? "#e7f3ff" : "transparent",
                  borderLeft:
                    activeLevel === "adset" ? "3px solid #0064e1" : "3px solid transparent",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeLevel !== "adset") e.currentTarget.style.background = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  if (activeLevel !== "adset") e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <MetaGridIcon size={16} active={activeLevel === "adset"} />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: activeLevel === "adset" ? 650 : 500,
                      color: activeLevel === "adset" ? "#0064e1" : "#1c1e21",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 145,
                    }}
                  >
                    {adsetName || `New ${objective} ad set`}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MoreHorizontal size={14} color="#8a8d91" />
                  {objective === "Leads" && !leadTermsAccepted && (
                    <MetaProhibitedIcon size={14} />
                  )}
                </div>
              </div>

              {/* Ad node (indented) */}
              <div
                onClick={() => setActiveLevel("ad")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 14px 9px 36px",
                  cursor: "pointer",
                  background: activeLevel === "ad" ? "#e7f3ff" : "transparent",
                  borderLeft:
                    activeLevel === "ad" ? "3px solid #0064e1" : "3px solid transparent",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (activeLevel !== "ad") e.currentTarget.style.background = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  if (activeLevel !== "ad") e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <MetaAdIcon size={16} active={activeLevel === "ad"} />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: activeLevel === "ad" ? 650 : 500,
                      color: activeLevel === "ad" ? "#0064e1" : "#1c1e21",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 130,
                    }}
                  >
                    {adName || `New ${objective} ad`}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MoreHorizontal size={14} color="#8a8d91" />
                  {objective === "Leads" && !leadTermsAccepted ? (
                    <MetaProhibitedIcon size={14} />
                  ) : (
                    <div
                      style={{
                        width: 20,
                        height: 12,
                        borderRadius: 6,
                        background: "#0064e1",
                        padding: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ffffff" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ── MAIN CONTENT AREA ── */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 28px 80px 28px",
            background: "#f0f2f5",
          }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            {/* ════════════════════════════════════════════════════════
                1. CAMPAIGN LEVEL VIEW (Matches Screenshot 1 exactly)
               ════════════════════════════════════════════════════════ */}
            {activeLevel === "campaign" && (
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Left Column: Form Cards */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* ── CARD 1: Campaign name (Screenshot 1) ── */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                        }}
                      >
                        Campaign name
                      </h2>
                    </div>

                    {/* Subrow with Campaign Name on left and Template switch on right */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: "0.88rem", color: "#1c1e21", fontWeight: 500 }}>
                        {campaignName}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.85rem", color: "#1c1e21", fontWeight: 500 }}>
                          Template
                        </span>
                        <div
                          role="switch"
                          aria-checked={templateToggleOn}
                          onClick={() => setTemplateToggleOn((prev) => !prev)}
                          style={{
                            width: 32,
                            height: 18,
                            borderRadius: 9,
                            background: templateToggleOn ? "#0064e1" : "#cbd5e1",
                            padding: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: templateToggleOn ? "flex-end" : "flex-start",
                            boxSizing: "border-box",
                            transition: "background 0.15s ease",
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
                        </div>
                      </div>
                    </div>

                    {/* Open text field box (Screenshot 1) */}
                    {templateToggleOn ? (
                      <div>
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #ced0d4",
                            borderRadius: 6,
                            padding: "10px 14px",
                            marginBottom: 10,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#65676b",
                              fontWeight: 500,
                              marginBottom: 4,
                            }}
                          >
                            Open text field
                          </div>
                          <input
                            type="text"
                            value={campaignName}
                            onChange={(e) => {
                              setCampaignName(e.target.value);
                              setIsTemplateConventionActive(false);
                            }}
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              fontSize: "0.92rem",
                              color: "#1c1e21",
                              fontWeight: 500,
                              padding: 0,
                              background: "transparent",
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <input
                          type="text"
                          value={campaignName}
                          onChange={(e) => {
                            setCampaignName(e.target.value);
                            setIsTemplateConventionActive(false);
                          }}
                          placeholder="Enter campaign name"
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            fontSize: "0.9rem",
                            color: "#1c1e21",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTemplateToggleOn(true);
                            setCampaignEditingMode(false);
                            setTemplateModalOpen(true);
                          }}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          Create template
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── CARD 2: Campaign details (Screenshot 1) ── */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                        }}
                      >
                        Campaign details
                      </h2>
                    </div>

                    {/* Buying type (Styled dropdown as in Image 3) */}
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 4,
                        }}
                      >
                        Buying type
                      </div>
                      <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
                        <select
                          value={buyingType}
                          onChange={(e) => setBuyingType(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 34px 9px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 500,
                            color: "#1c1e21",
                            cursor: "pointer",
                            appearance: "none",
                            outline: "none",
                          }}
                        >
                          <option value="Auction">Auction</option>
                          <option value="Reservation">Reservation</option>
                        </select>
                        <ChevronDown
                          size={15}
                          color="#65676b"
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Campaign objective — Meta style: label only + info alert (matching Image 1) */}
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 4,
                        }}
                      >
                        <span>Campaign objective</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      {/* Selected objective shown as plain text label (like Meta image 1) */}
                      <div
                        style={{
                          fontSize: "0.88rem",
                          color: "#1c1e21",
                          fontWeight: 400,
                          marginBottom: 12,
                        }}
                      >
                        {objective}
                      </div>

                      {/* Radio list — full objectives */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                        {OBJECTIVES_LIST.map((item) => {
                          const IconComp = item.icon;
                          const isSelected = objective === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setObjective(item.id);
                                if (campaignName.startsWith("New ") || campaignName.endsWith("campaign")) {
                                  setCampaignName(`New ${item.id} campaign`);
                                  setAdsetName(`New ${item.id} campaign - Ad Set`);
                                  setAdName(`New ${item.id} campaign - Ad`);
                                }
                                if (item.id === "App promotion") {
                                  setConversionLocation("app");
                                } else if (item.id === "Leads") {
                                  setConversionLocation("instant_forms");
                                } else if (item.id === "Traffic") {
                                  setConversionLocation("website");
                                } else if (item.id === "Engagement") {
                                  setConversionLocation("messenger");
                                }
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "8px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                                border: isSelected ? "2px solid #0064e1" : "1px solid #e4e6eb",
                                background: isSelected ? "#eef5ff" : "#ffffff",
                                transition: "background 0.12s ease, border 0.12s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "#f8f9fa";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = "#ffffff";
                              }}
                            >
                              {/* Radio indicator */}
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  border: isSelected ? "5px solid #0064e1" : "2px solid #bcc0c4",
                                  boxSizing: "border-box",
                                  background: "#ffffff",
                                  flexShrink: 0,
                                }}
                              />

                              {/* Square icon box */}
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 6,
                                  background: isSelected ? "#0064e1" : "#f1f5f9",
                                  color: isSelected ? "#ffffff" : "#64748b",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <IconComp size={16} strokeWidth={2.2} />
                              </div>

                              {/* Objective label */}
                              <span
                                style={{
                                  fontSize: "0.88rem",
                                  fontWeight: isSelected ? 650 : 500,
                                  color: isSelected ? "#0f172a" : "#334155",
                                }}
                              >
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Info alert: "See details" CTA tip (matching Meta image 1) */}
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          background: "#f0f2f5",
                          border: "1px solid #e4e6eb",
                          borderRadius: 6,
                          padding: "10px 14px",
                        }}
                      >
                        <Info size={15} color="#65676b" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            "See details" is the default call-to-action text
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#1c1e21", lineHeight: 1.45 }}>
                            "See details" drives up to 2.3% higher CVR compared to "Learn more". You can still choose "Learn more" or{" "}
                            <button
                              type="button"
                              onClick={() => setActiveLevel("ad")}
                              style={{ background: "none", border: "none", color: "#0064e1", cursor: "pointer", padding: 0, fontSize: "0.82rem", fontWeight: 500 }}
                            >
                              another option
                            </button>
                            .
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Show more options link (matching Meta image 1) */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowMoreSettings((prev) => !prev)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#0064e1",
                          fontSize: "0.86rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: 0,
                        }}
                      >
                        <span>Show more options</span>
                        <ChevronDown
                          size={15}
                          style={{
                            transform: showMoreSettings ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.15s ease",
                          }}
                        />
                      </button>

                      {showMoreSettings && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: "14px",
                            borderRadius: 6,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21" }}>
                            Campaign spending limit
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#64748b",
                              marginTop: 2,
                              marginBottom: 8,
                            }}
                          >
                            An optional limit on how much this campaign can spend in its lifetime.
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input
                              type="text"
                              placeholder="e.g. ₹50,000"
                              value={campaignSpendingLimit}
                              onChange={(e) => setCampaignSpendingLimit(e.target.value)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.85rem",
                                width: 180,
                              }}
                            />
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              Leave empty for no limit
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── CARD 3: Budget (Advantage+ on) (Matching Image 1) ── */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    {/* Header with Advantage+ on badge */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                          Budget
                        </h2>
                      </div>

                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          background: "#dcfce7",
                          color: "#15803d",
                          border: "1px solid #bbf7d0",
                          borderRadius: 14,
                          padding: "3px 10px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        <Sparkles size={12} color="#15803d" />
                        <span>Advantage+ on</span>
                      </div>
                    </div>

                    {/* Budget strategy Accordion Header */}
                    <div
                      onClick={() => setBudgetStrategyOpen((prev) => !prev)}
                      style={{
                        background: "#f0f2f5",
                        padding: "10px 14px",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                          Budget strategy
                        </span>
                        <span title="Choose how you want to manage budget across your campaign." style={{ display: "inline-flex", cursor: "help" }}>
                          <Info size={14} color="#65676b" />
                        </span>
                      </div>
                      {budgetStrategyOpen ? <ChevronUp size={16} color="#65676b" /> : <ChevronDown size={16} color="#65676b" />}
                    </div>

                    {/* Accordion Content: Budget strategy Radios (Image 1) */}
                    {budgetStrategyOpen && (
                      <div
                        style={{
                          border: "1px solid #e4e6eb",
                          borderRadius: 6,
                          padding: "14px 16px",
                          marginBottom: 16,
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                        }}
                      >
                        {/* Radio 1: Campaign budget */}
                        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                          <input
                            type="radio"
                            name="budget_strategy"
                            checked={budgetStrategy === "campaign"}
                            onChange={() => setBudgetStrategy("campaign")}
                            style={{ marginTop: 3, accentColor: "#0064e1" }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                              Campaign budget
                            </span>
                            <span style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.4 }}>
                              Automatically distribute your budget to the best opportunities across your campaign. Also known as Advantage+ campaign budget.{" "}
                              <a href="#about-campaign-budget" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                                About campaign budget
                              </a>
                            </span>
                          </div>
                        </label>

                        {/* Radio 2: Ad set budget (Image 1 default) */}
                        <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                          <input
                            type="radio"
                            name="budget_strategy"
                            checked={budgetStrategy === "adset"}
                            onChange={() => setBudgetStrategy("adset")}
                            style={{ marginTop: 3, accentColor: "#0064e1" }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                              Ad set budget
                            </span>
                            <span style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.4 }}>
                              Set different bid strategies or budget schedules for each ad set.
                            </span>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Campaign Budget Inputs if campaign budget is selected */}
                    {budgetStrategy === "campaign" && (
                      <div style={{ marginBottom: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                          <div style={{ position: "relative", width: 160 }}>
                            <select
                              value={budgetType}
                              onChange={(e) => setBudgetType(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 28px 8px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                background: "#ffffff",
                                fontSize: "0.88rem",
                                color: "#1c1e21",
                                appearance: "none",
                              }}
                            >
                              <option value="daily">Daily budget</option>
                              <option value="lifetime">Lifetime budget</option>
                            </select>
                            <ChevronDown size={14} color="#65676b" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                          </div>

                          <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: 6, overflow: "hidden", background: "#ffffff", width: 190 }}>
                            <span style={{ padding: "8px 10px", color: "#475569", fontSize: "0.9rem", fontWeight: 600, background: "#f8fafc", borderRight: "1px solid #e2e8f0" }}>₹</span>
                            <input
                              type="number"
                              value={budgetAmount}
                              onChange={(e) => setBudgetAmount(e.target.value)}
                              style={{ flex: 1, padding: "8px 10px", border: "none", outline: "none", fontSize: "0.9rem", fontWeight: 600 }}
                            />
                            <span style={{ padding: "8px 10px", color: "#64748b", fontSize: "0.8rem", fontWeight: 700 }}>INR</span>
                          </div>
                        </div>

                        <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                          We'll spend around ₹{formattedBudget} per day. Your maximum daily spend is ₹{maxDailySpend} and your maximum weekly spend is ₹{maxWeeklySpend}.{" "}
                          <a href="#about-daily" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>About daily budget</a>
                        </div>
                      </div>
                    )}

                    {/* Checkbox: Share some of your budget with other ad sets (Image 1) */}
                    <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 14 }}>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={shareBudgetEnabled}
                          onChange={(e) => setShareBudgetEnabled(e.target.checked)}
                          style={{ width: 16, height: 16, marginTop: 2, accentColor: "#0064e1" }}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                            <span>Share some of your budget with other ad sets</span>
                            <Info size={13} color="#65676b" />
                          </div>
                          <span style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.4 }}>
                            We'll share up to 20% of your ad set budget with other ad sets within this campaign when it's likely to improve performance.{" "}
                            <a href="#about-sharing" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                              About ad set budget sharing
                            </a>
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ── CARD 4: Campaign frequency control (Matching Image 1) ── */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Campaign frequency control
                      </h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.85rem", color: "#1c1e21", fontWeight: 500 }}>
                          {campaignFrequencyControlEnabled ? "On" : "Off"}
                        </span>
                        <div
                          role="switch"
                          aria-checked={campaignFrequencyControlEnabled}
                          onClick={() => setCampaignFrequencyControlEnabled((prev) => !prev)}
                          style={{
                            width: 32,
                            height: 18,
                            borderRadius: 9,
                            background: campaignFrequencyControlEnabled ? "#0064e1" : "#cbd5e1",
                            padding: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: campaignFrequencyControlEnabled ? "flex-end" : "flex-start",
                            boxSizing: "border-box",
                            transition: "background 0.15s ease",
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
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.45 }}>
                      Set a frequency if you have a specific number of times that you want people to see your ads throughout your campaign.{" "}
                      <a href="#learn-frequency" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                        Learn more
                      </a>
                    </div>
                  </div>

                  {/* ── CARD 5: A/B test (Matching Image 1 & Image 2) ── */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        A/B test
                      </h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.85rem", color: "#1c1e21", fontWeight: 500 }}>
                          {abTestEnabled ? "On" : "Off"}
                        </span>
                        <div
                          role="switch"
                          aria-checked={abTestEnabled}
                          onClick={() => setAbTestEnabled((prev) => !prev)}
                          style={{
                            width: 32,
                            height: 18,
                            borderRadius: 9,
                            background: abTestEnabled ? "#0064e1" : "#cbd5e1",
                            padding: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: abTestEnabled ? "flex-end" : "flex-start",
                            boxSizing: "border-box",
                            transition: "background 0.15s ease",
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
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.45 }}>
                      Help improve ad performance by comparing versions to see what works best. For accuracy, each one will be shown to separate groups of your audience.{" "}
                      <a href="#about-ab" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                        About A/B tests
                      </a>
                    </div>
                  </div>

                  {/* ── CARD 6: Special Ad Categories (Matching Image 1 & Image 2) ── */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Special Ad Categories
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.45, marginBottom: 14 }}>
                      Declare if your ads are related to financial products and services, employment, housing, social issues, elections or politics to help prevent ad rejections. Requirements differ by country.{" "}
                      <a href="#about-special" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                        About Special Ad Categories
                      </a>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 2 }}>
                        Categories
                      </label>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: 8 }}>
                        Select the categories that best describe what this campaign will advertise.
                      </div>

                      <div ref={specialDropdownRef} style={{ position: "relative" }}>
                        {/* Trigger Input Box (Image 1 & 2) */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setSpecialDropdownOpen((prev) => !prev)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSpecialDropdownOpen((prev) => !prev);
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: specialDropdownOpen ? "8px 34px 8px 12px" : "9px 34px 9px 12px",
                            borderRadius: 6,
                            border: specialDropdownOpen ? "2px solid #0064e1" : "1px solid #cbd5e1",
                            boxShadow: specialDropdownOpen ? "0 0 0 1px #0064e1" : "none",
                            fontSize: "0.9rem",
                            color: selectedSpecialCategories.length === 0 ? "#64748b" : "#1c1e21",
                            fontWeight: selectedSpecialCategories.length === 0 ? 400 : 500,
                            background: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            boxSizing: "border-box",
                            userSelect: "none",
                            transition: "border-color 0.15s ease",
                            position: "relative",
                          }}
                        >
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 20 }}>
                            {getCategoryDisplayText()}
                          </span>
                          <svg
                            width="10"
                            height="6"
                            viewBox="0 0 10 6"
                            fill="#1c1e21"
                            style={{
                              position: "absolute",
                              right: 14,
                              top: "50%",
                              transform: specialDropdownOpen ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
                              transition: "transform 0.15s ease",
                              pointerEvents: "none",
                            }}
                          >
                            <path d="M0 0.5L5 5.5L10 0.5H0Z" />
                          </svg>
                        </div>

                        {/* Dropdown Popover (Exact Match to Image 1) */}
                        {specialDropdownOpen && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "calc(100% + 6px)",
                              left: 0,
                              right: 0,
                              background: "#ffffff",
                              borderRadius: 8,
                              border: "1px solid #ccd0d5",
                              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                              zIndex: 100,
                              overflow: "hidden",
                            }}
                          >
                            {/* Scrollable category list */}
                            <div
                              style={{
                                maxHeight: 240,
                                overflowY: "auto",
                              }}
                            >
                              {SPECIAL_AD_CATEGORIES.map((cat) => {
                                const isChecked = selectedSpecialCategories.includes(cat.id);
                                const CatIcon = cat.icon;
                                return (
                                  <div
                                    key={cat.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSpecialCategory(cat.id);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 14,
                                      padding: "12px 16px",
                                      cursor: "pointer",
                                      background: "#ffffff",
                                      borderBottom: "1px solid #f2f3f5",
                                      transition: "background 0.1s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "#f0f2f5";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "#ffffff";
                                    }}
                                  >
                                    {/* Checkbox (Square Meta Style) */}
                                    <div
                                      style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: 3,
                                        border: isChecked ? "1.5px solid #0064e1" : "1.5px solid #bcc0c4",
                                        background: isChecked ? "#0064e1" : "#ffffff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        marginTop: 2,
                                        transition: "all 0.12s ease",
                                      }}
                                    >
                                      {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                                    </div>

                                    {/* Category Icon */}
                                    <div
                                      style={{
                                        width: 22,
                                        height: 22,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        marginTop: 1,
                                      }}
                                    >
                                      <CatIcon size={18} color="#1c1e21" />
                                    </div>

                                    {/* Title & Description */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div
                                        style={{
                                          fontSize: "0.92rem",
                                          fontWeight: 600,
                                          color: "#1c1e21",
                                          lineHeight: 1.3,
                                          marginBottom: 3,
                                        }}
                                      >
                                        {cat.title}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "0.82rem",
                                          color: "#65676b",
                                          lineHeight: 1.38,
                                        }}
                                      >
                                        {cat.description}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Bottom Footer Section (Image 1) */}
                            <div
                              style={{
                                borderTop: "1px solid #e4e6eb",
                                padding: "14px 16px",
                                background: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 16,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.81rem",
                                  color: "#65676b",
                                  lineHeight: 1.4,
                                  flex: 1,
                                }}
                              >
                                If none of the categories apply to your ad, you may not need to select a special ad category. If you are unsure, you can also get help with declaring categories.
                              </div>
                              <a
                                href="#help-declaring"
                                onClick={(e) => e.preventDefault()}
                                style={{
                                  color: "#0064e1",
                                  fontSize: "0.84rem",
                                  fontWeight: 600,
                                  lineHeight: 1.3,
                                  textAlign: "right",
                                  textDecoration: "none",
                                  maxWidth: 130,
                                  flexShrink: 0,
                                  cursor: "pointer",
                                }}
                              >
                                Get help with declaring categories
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Campaign score widget (Screenshot 1) */}
                <div
                  style={{
                    width: 300,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    position: "sticky",
                    top: 16,
                  }}
                >
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 20px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          border: "3.5px solid #008000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#008000",
                          flexShrink: 0,
                        }}
                      >
                        100
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                          }}
                        >
                          Campaign score
                          <Info size={13} color="#65676b" />
                        </div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "#475569",
                            marginTop: 2,
                            lineHeight: 1.35,
                          }}
                        >
                          You're using our recommended setup.
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: "0.86rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                          }}
                        >
                          <span>✦ Advantage+ app campaign</span>
                          <Info size={13} color="#65676b" />
                        </div>
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          On <ChevronDown size={12} />
                        </span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        No additional recommendations available.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════
                2. AD SET LEVEL VIEW (Matches Screenshot 2 exactly)
               ════════════════════════════════════════════════════════ */}
            {activeLevel === "adset" && (
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Left Column: Form Cards */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Securities and investments disclaimer (matching Image 2) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "2px 4px 6px 4px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="securities-disclaimer"
                      checked={securitiesDisclaimerChecked}
                      onChange={(e) => setSecuritiesDisclaimerChecked(e.target.checked)}
                      style={{ marginTop: 2, width: 16, height: 16, accentColor: "#0064e1", cursor: "pointer" }}
                    />
                    <label
                      htmlFor="securities-disclaimer"
                      style={{ fontSize: "0.86rem", color: "#1c1e21", cursor: "pointer", lineHeight: 1.4 }}
                    >
                      This ad set includes ads related to securities and investments
                      <br />
                      <a
                        href="#verification-requirements"
                        onClick={(e) => e.preventDefault()}
                        style={{ color: "#0064e1", textDecoration: "none", fontSize: "0.82rem" }}
                      >
                        About verification requirements
                      </a>
                    </label>
                  </div>

                  {/* Card 1: Ad set name (matching Image 1) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Ad set name
                      </h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="text"
                        value={adsetName}
                        onChange={(e) => setAdsetName(e.target.value)}
                        placeholder={`New ${objective} ad set`}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                          color: "#1c1e21",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Create template
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Conversion / Performance goal (Dynamically rendered by objective) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        {objective === "App promotion"
                          ? "App promotion"
                          : objective === "Awareness"
                          ? "Performance goal"
                          : "Conversion"}
                      </h2>
                    </div>

                    {/* DYNAMIC BY OBJECTIVE */}
                    {objective === "Awareness" && (
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.86rem",
                              fontWeight: 700,
                              color: "#1c1e21",
                              marginBottom: 4,
                            }}
                          >
                            Performance goal
                          </label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={awarenessGoal}
                              onChange={(e) => setAwarenessGoal(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 34px 9px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                                appearance: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Maximise reach of ads">Maximise reach of ads (Recommended)</option>
                              <option value="Maximise number of impressions">Maximise number of impressions</option>
                              <option value="Maximise ad recall lift">Maximise ad recall lift</option>
                              <option value="Maximise 2-second continuous video views">Maximise 2-second continuous video views</option>
                            </select>
                            <ChevronDown
                              size={15}
                              color="#65676b"
                              style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                              }}
                            />
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 4 }}>
                            {awarenessGoal === "Maximise reach of ads" &&
                              "We'll try to show your ads to the maximum number of people."}
                            {awarenessGoal === "Maximise number of impressions" &&
                              "We'll try to show your ads to people as many times as possible."}
                            {awarenessGoal === "Maximise ad recall lift" &&
                              "We'll try to show your ads to people who are likely to remember seeing them."}
                            {awarenessGoal === "Maximise 2-second continuous video views" &&
                              "We'll try to show your video ads to people who will watch at least 2 continuous seconds."}
                          </div>
                        </div>

                        {/* Frequency Cap */}
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f0f2f5" }}>
                          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Frequency cap
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#65676b", marginBottom: 8 }}>
                            A frequency cap lets you limit how often people see your ads.
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              value={frequencyCapNumber}
                              onChange={(e) => setFrequencyCapNumber(Number(e.target.value))}
                              style={{ width: 64, padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                            />
                            <span style={{ fontSize: "0.86rem", color: "#1c1e21" }}>impression every</span>
                            <input
                              type="number"
                              value={frequencyCapDays}
                              onChange={(e) => setFrequencyCapDays(Number(e.target.value))}
                              style={{ width: 64, padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                            />
                            <span style={{ fontSize: "0.86rem", color: "#1c1e21" }}>days</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {objective === "Traffic" && (
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Conversion location
                          </label>
                          <div style={{ fontSize: "0.82rem", color: "#65676b", marginBottom: 10 }}>
                            Choose where you want to send traffic.
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                            {[
                              { id: "website", label: "Website (Recommended)", desc: "Send traffic to your website.", icon: Globe },
                              { id: "app", label: "App", desc: "Send traffic to your mobile app.", icon: Smartphone },
                              { id: "messenger", label: "Messenger", desc: "Send people to Messenger chats.", icon: MessageSquare },
                              { id: "calls", label: "Calls", desc: "Get people to call your business.", icon: PhoneCall },
                            ].map((loc) => {
                              const IconComponent = loc.icon;
                              const isSelected = trafficLocation === loc.id;
                              return (
                                <div
                                  key={loc.id}
                                  onClick={() => setTrafficLocation(loc.id)}
                                  style={{
                                    border: isSelected ? "2px solid #0064e1" : "1px solid #cbd5e1",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    background: isSelected ? "#f0f7ff" : "#ffffff",
                                    cursor: "pointer",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <IconComponent size={16} color={isSelected ? "#0064e1" : "#1c1e21"} />
                                    <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>{loc.label}</span>
                                  </div>
                                  <div style={{ fontSize: "0.78rem", color: "#65676b" }}>{loc.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Performance goal
                          </label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={trafficGoal}
                              onChange={(e) => setTrafficGoal(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 34px 9px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                                appearance: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Maximise number of link clicks">Maximise number of link clicks (Recommended)</option>
                              <option value="Maximise number of landing page views">Maximise number of landing page views</option>
                              <option value="Maximise reach of ads">Maximise reach of ads</option>
                              <option value="Maximise number of impressions">Maximise number of impressions</option>
                            </select>
                            <ChevronDown size={15} color="#65676b" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 4 }}>
                            We'll try to show your ads to the people most likely to click on them.
                          </div>
                        </div>
                      </div>
                    )}

                    {objective === "Engagement" && (
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Conversion location
                          </label>
                          <div style={{ fontSize: "0.82rem", color: "#65676b", marginBottom: 10 }}>
                            Choose where you want to drive engagement.
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                            {[
                              { id: "on_ad", label: "On your ad (Recommended)", desc: "Get video views or post interactions.", icon: Megaphone },
                              { id: "messaging", label: "Messaging apps", desc: "Start conversations on Messenger/WhatsApp.", icon: MessageSquare },
                              { id: "page", label: "Facebook Page", desc: "Get people to like your Page.", icon: Flag },
                            ].map((loc) => {
                              const IconComponent = loc.icon;
                              const isSelected = engagementLocation === loc.id;
                              return (
                                <div
                                  key={loc.id}
                                  onClick={() => setEngagementLocation(loc.id)}
                                  style={{
                                    border: isSelected ? "2px solid #0064e1" : "1px solid #cbd5e1",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    background: isSelected ? "#f0f7ff" : "#ffffff",
                                    cursor: "pointer",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <IconComponent size={16} color={isSelected ? "#0064e1" : "#1c1e21"} />
                                    <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>{loc.label}</span>
                                  </div>
                                  <div style={{ fontSize: "0.78rem", color: "#65676b" }}>{loc.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {engagementLocation === "on_ad" && (
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                              Engagement type
                            </label>
                            <div style={{ position: "relative" }}>
                              <select
                                value={engagementType}
                                onChange={(e) => setEngagementType(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "9px 34px 9px 12px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.88rem",
                                  background: "#ffffff",
                                  color: "#1c1e21",
                                  appearance: "none",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="video_views">Video views (Recommended)</option>
                                <option value="post_engagement">Post engagement</option>
                                <option value="event_responses">Event responses</option>
                              </select>
                              <ChevronDown size={15} color="#65676b" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                            </div>
                          </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Performance goal
                          </label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={engagementGoal}
                              onChange={(e) => setEngagementGoal(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 34px 9px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                                appearance: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Maximise ThruPlay views">Maximise ThruPlay views (Recommended)</option>
                              <option value="Maximise 2-second continuous video views">Maximise 2-second continuous video views</option>
                              <option value="Maximise post engagement">Maximise engagement with a post</option>
                              <option value="Maximise Page likes">Maximise Page likes</option>
                            </select>
                            <ChevronDown size={15} color="#65676b" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {objective === "Leads" && (
                      <div>
                        {/* Conversion location selector */}
                        <div style={{ marginBottom: 18 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Conversion location
                          </label>
                          <div style={{ fontSize: "0.82rem", color: "#65676b", marginBottom: 10 }}>
                            Choose where you want to generate leads.
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
                            {[
                              { id: "instant_forms", label: "Instant forms", desc: "Generate leads by asking people to fill out a form.", icon: FileText },
                              { id: "messenger", label: "Messenger", desc: "Generate leads by starting chats in Messenger.", icon: MessageSquare },
                              { id: "website", label: "Website", desc: "Generate leads through your website.", icon: Globe },
                              { id: "app", label: "App", desc: "Generate leads through your mobile app.", icon: Smartphone },
                            ].map((loc) => {
                              const IconComponent = loc.icon;
                              const isSelected = conversionLocation === loc.id;
                              return (
                                <div
                                  key={loc.id}
                                  onClick={() => setConversionLocation(loc.id)}
                                  style={{
                                    border: isSelected ? "2px solid #0064e1" : "1px solid #cbd5e1",
                                    borderRadius: 8,
                                    padding: "12px 14px",
                                    background: isSelected ? "#f0f7ff" : "#ffffff",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div
                                      style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        border: isSelected ? "5px solid #0064e1" : "1.5px solid #65676b",
                                        background: "#ffffff",
                                        boxSizing: "border-box",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <IconComponent size={16} color={isSelected ? "#0064e1" : "#1c1e21"} />
                                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>{loc.label}</span>
                                  </div>
                                  <div style={{ fontSize: "0.78rem", color: "#65676b", paddingLeft: 24, lineHeight: 1.35 }}>
                                    {loc.desc}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Performance goal (Exact Match to Image 1) */}
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Performance goal
                          </label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={leadPerformanceGoal}
                              onChange={(e) => setLeadPerformanceGoal(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 34px 9px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                                appearance: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Maximise number of leads">Maximise number of leads (Recommended)</option>
                              <option value="Maximise number of conversion leads">Maximise number of conversion leads</option>
                            </select>
                            <ChevronDown size={15} color="#65676b" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 4 }}>
                            We'll try to show your ads to the people most likely to submit your form.
                          </div>
                        </div>

                        {/* Blue Info Callout Box (Exact match to Image 1) */}
                        <div
                          style={{
                            border: "1px solid #cbe4ff",
                            borderRadius: 8,
                            background: "#f0f7ff",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <Info size={18} color="#0064e1" style={{ flexShrink: 0, marginTop: 1 }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                              Instant forms load instantly on mobile
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.45 }}>
                              People can view and submit your form without leaving facebook or Instagram, leading to higher completion rates.
                            </div>
                          </div>
                        </div>

                        {/* Facebook Page & Lead Generation Terms */}
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f0f2f5" }}>
                          <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                            Facebook Page
                          </label>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              border: "1px solid #cbd5e1",
                              borderRadius: 6,
                              padding: "8px 12px",
                              background: "#ffffff",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: "#0064e1",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "0.78rem",
                                }}
                              >
                                {facebookPage?.charAt(0) || "A"}
                              </div>
                              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1c1e21" }}>
                                {facebookPage || "Adstra Digital"}
                              </span>
                            </div>

                            {!leadTermsAccepted ? (
                              <button
                                type="button"
                                onClick={() => setLeadTermsAccepted(true)}
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#0064e1",
                                  background: "none",
                                  border: "none",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Accept Terms
                              </button>
                            ) : (
                              <span style={{ fontSize: "0.78rem", color: "#15803d", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                                <Check size={12} /> Terms accepted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {objective === "App promotion" && (
                      <div>
                        {/* Mobile app store */}
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Mobile app store
                          </label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={mobileAppStore}
                              onChange={(e) => setMobileAppStore(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 34px 9px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.9rem",
                                color: "#1c1e21",
                                background: "#ffffff",
                                cursor: "pointer",
                                appearance: "none",
                                outline: "none",
                              }}
                            >
                              <option value="Google Play Store">Google Play Store</option>
                              <option value="Apple App Store">Apple App Store</option>
                              <option value="Amazon Appstore">Amazon Appstore</option>
                              <option value="Windows Store">Windows Store</option>
                            </select>
                            <ChevronDown size={15} color="#65676b" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                          </div>
                        </div>

                        {/* App name search */}
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            App name
                          </label>
                          <div style={{ position: "relative" }}>
                            <Search size={16} color="#65676b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                              type="text"
                              placeholder="Enter app name, app ID or exact app store URL"
                              value={appNameQuery}
                              onChange={(e) => setAppNameQuery(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 12px 9px 36px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                color: "#1c1e21",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        </div>

                        {/* Checkbox: Find your app */}
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 16 }}>
                          <input
                            type="checkbox"
                            checked={countryAvailabilityChecked}
                            onChange={(e) => setCountryAvailabilityChecked(e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: "#0064e1" }}
                          />
                          <span style={{ fontSize: "0.86rem", color: "#1c1e21" }}>
                            Find your app by selecting a country where it's available.
                          </span>
                        </label>

                        {/* Performance goal */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Performance goal
                          </div>
                          <div style={{ fontSize: "0.86rem", color: "#1c1e21", fontWeight: 500 }}>
                            Maximise number of app installs
                          </div>
                        </div>

                        {/* Callout box */}
                        <div
                          style={{
                            border: "1px solid #e4e6eb",
                            borderRadius: 8,
                            background: "#ffffff",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <Info size={18} color="#1c1e21" style={{ flexShrink: 0, marginTop: 1 }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                              In-app ad impression and in-app purchase now available
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.45 }}>
                              To reach people who may drive higher in-app ad value, choose Maximise value of conversions
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {objective === "Sales" && (
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Conversion location
                          </label>
                          <div style={{ fontSize: "0.82rem", color: "#65676b", marginBottom: 10 }}>
                            Choose where you want to drive sales.
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                            {[
                              { id: "website", label: "Website (Recommended)", desc: "Drive sales on your website.", icon: Globe },
                              { id: "app", label: "App", desc: "Drive sales in your mobile app.", icon: Smartphone },
                              { id: "website_app", label: "Website and app", desc: "Drive sales across both.", icon: LayoutGrid },
                              { id: "messaging", label: "Messaging apps", desc: "Drive sales in Messenger/WhatsApp.", icon: MessageSquare },
                            ].map((loc) => {
                              const IconComponent = loc.icon;
                              const isSelected = salesLocation === loc.id;
                              return (
                                <div
                                  key={loc.id}
                                  onClick={() => setSalesLocation(loc.id)}
                                  style={{
                                    border: isSelected ? "2px solid #0064e1" : "1px solid #cbd5e1",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    background: isSelected ? "#f0f7ff" : "#ffffff",
                                    cursor: "pointer",
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <IconComponent size={16} color={isSelected ? "#0064e1" : "#1c1e21"} />
                                    <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>{loc.label}</span>
                                  </div>
                                  <div style={{ fontSize: "0.78rem", color: "#65676b" }}>{loc.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Performance goal
                          </label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={salesGoal}
                              onChange={(e) => setSalesGoal(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "9px 34px 9px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                                appearance: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Maximise number of conversions">Maximise number of conversions (Recommended)</option>
                              <option value="Maximise value of conversions">Maximise value of conversions</option>
                              <option value="Maximise number of landing page views">Maximise number of landing page views</option>
                            </select>
                            <ChevronDown size={15} color="#65676b" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Budget & schedule (Exact match to Image 1) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Budget & schedule
                      </h2>
                    </div>

                    {/* Budget row if Advantage campaign budget is off */}
                    {!shareBudgetEnabled && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14 }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                              Budget
                            </label>
                            <div style={{ position: "relative" }}>
                              <select
                                value={budgetType}
                                onChange={(e) => setBudgetType(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px 30px 8px 12px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.88rem",
                                  background: "#ffffff",
                                  color: "#1c1e21",
                                  appearance: "none",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="daily">Daily budget</option>
                                <option value="lifetime">Lifetime budget</option>
                              </select>
                              <ChevronDown size={14} color="#65676b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                              Amount
                            </label>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#65676b", fontSize: "0.88rem", fontWeight: 600 }}>
                                ₹
                              </span>
                              <input
                                type="number"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                                style={{
                                  width: "100%",
                                  padding: "8px 12px 8px 28px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  fontSize: "0.88rem",
                                  color: "#1c1e21",
                                  boxSizing: "border-box",
                                  outline: "none",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Start date & time pickers (matching Image 1) */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                            marginBottom: 4,
                          }}
                        >
                          Start date
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="15-10-2026"
                            style={{
                              width: "100%",
                              padding: "8px 36px 8px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              color: "#1c1e21",
                              boxSizing: "border-box",
                              outline: "none",
                            }}
                          />
                          <Calendar
                            size={16}
                            color="#65676b"
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                            marginBottom: 4,
                          }}
                        >
                          Start time
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            placeholder="14:30"
                            style={{
                              width: "100%",
                              padding: "8px 36px 8px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              color: "#1c1e21",
                              boxSizing: "border-box",
                              outline: "none",
                            }}
                          />
                          <Clock
                            size={16}
                            color="#65676b"
                            style={{
                              position: "absolute",
                              right: 12,
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Set an end date checkbox */}
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: endDateEnabled ? 10 : 0 }}>
                        <input
                          type="checkbox"
                          checked={endDateEnabled}
                          onChange={(e) => setEndDateEnabled(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: "#0064e1" }}
                        />
                        <span style={{ fontSize: "0.86rem", color: "#1c1e21" }}>
                          Set an end date
                        </span>
                      </label>

                      {endDateEnabled && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10 }}>
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              placeholder="30-11-2026"
                              style={{
                                width: "100%",
                                padding: "8px 36px 8px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                boxSizing: "border-box",
                                outline: "none",
                              }}
                            />
                            <Calendar size={16} color="#65676b" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
                          </div>
                          <div style={{ position: "relative" }}>
                            <input
                              type="text"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              placeholder="23:59"
                              style={{
                                width: "100%",
                                padding: "8px 36px 8px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                boxSizing: "border-box",
                                outline: "none",
                              }}
                            />
                            <Clock size={16} color="#65676b" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Audience controls (Exact match to Image 1) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Audience controls
                      </h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label
                          style={{
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 4,
                            color: "#1c1e21",
                          }}
                        >
                          Locations
                        </label>
                        <div
                          style={{
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            padding: "8px 12px",
                            background: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: "0.88rem", color: "#1c1e21", fontWeight: 500 }}>{targetLocation}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = prompt("Enter target location(s):", targetLocation);
                              if (next) setTargetLocation(next);
                            }}
                            style={{ background: "none", border: "none", color: "#0064e1", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>

                      {/* Age range & Gender (Image 1 layout) */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                          <label
                            style={{
                              fontSize: "0.84rem",
                              fontWeight: 700,
                              display: "block",
                              marginBottom: 4,
                              color: "#1c1e21",
                            }}
                          >
                            Age range
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              value={ageMin}
                              onChange={(e) => setAgeMin(Number(e.target.value))}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                color: "#1c1e21",
                                outline: "none",
                              }}
                            />
                            <span style={{ fontSize: "0.84rem", color: "#65676b" }}>to</span>
                            <input
                              type="text"
                              value={ageMax}
                              onChange={(e) => setAgeMax(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                color: "#1c1e21",
                                outline: "none",
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            style={{
                              fontSize: "0.84rem",
                              fontWeight: 700,
                              display: "block",
                              marginBottom: 4,
                              color: "#1c1e21",
                            }}
                          >
                            Gender
                          </label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={targetGender}
                              onChange={(e) => setTargetGender(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 30px 8px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                                appearance: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="All">All genders</option>
                              <option value="Men">Men</option>
                              <option value="Women">Women</option>
                            </select>
                            <ChevronDown size={14} color="#65676b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Placements (Exact match to Image 2 & Meta) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                          Placements
                        </h2>
                      </div>

                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        ✦ Advantage+ on
                      </span>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#475569", lineHeight: 1.45, marginBottom: 14 }}>
                      We'll automatically show ads in the places where people are likely to respond.{" "}
                      <a
                        href="#about-placements"
                        onClick={(e) => e.preventDefault()}
                        style={{ color: "#0064e1", textDecoration: "none" }}
                      >
                        About placements
                      </a>
                    </div>

                    {/* Info Notice: Changes to placement settings are coming soon (Image 2) */}
                    {showPlacementChangesNotice && (
                      <div
                        style={{
                          border: "1px solid #e4e6eb",
                          borderRadius: 8,
                          background: "#ffffff",
                          padding: "16px 18px",
                          marginBottom: 16,
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <Info size={18} color="#1c1e21" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                                Changes to placement settings are coming soon
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPlacementChangesNotice(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#65676b" }}
                              >
                                <X size={15} />
                              </button>
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.45, marginBottom: 8 }}>
                              Excluding placements or platforms will no longer be available for your ad sets.
                              You'll still have options to manage how and where your ads appear:
                            </div>
                            <ul style={{ margin: "0 0 10px 0", paddingLeft: 18, fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                              <li>Increase or decrease your bid for placements in <strong>Placement value rules</strong></li>
                              <li>Customise your creative for each placement in <strong>Ad creative</strong></li>
                              <li>Manage account-level placement exclusions in <strong>Account controls</strong></li>
                            </ul>
                            <a
                              href="#about-advantage-placements"
                              onClick={(e) => e.preventDefault()}
                              style={{ color: "#0064e1", textDecoration: "none", fontSize: "0.82rem", fontWeight: 500 }}
                            >
                              About Advantage+ placements
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Placements Choices */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                      <label
                        style={{
                          padding: "12px 14px",
                          borderRadius: 6,
                          border: placementsType === "advantage" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                          background: placementsType === "advantage" ? "#f0f7ff" : "#ffffff",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="placementsType"
                          checked={placementsType === "advantage"}
                          onChange={() => setPlacementsType("advantage")}
                          style={{ marginTop: 2, accentColor: "#0064e1" }}
                        />
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                            Advantage+ placements (recommended)
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                            Maximize budget and help show your ads to more people across Facebook, Instagram, Audience Network and Messenger.
                          </div>
                        </div>
                      </label>

                      <label
                        style={{
                          padding: "12px 14px",
                          borderRadius: 6,
                          border: placementsType === "manual" ? "1.5px solid #0064e1" : "1px solid #cbd5e1",
                          background: placementsType === "manual" ? "#f0f7ff" : "#ffffff",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="placementsType"
                          checked={placementsType === "manual"}
                          onChange={() => setPlacementsType("manual")}
                          style={{ marginTop: 2, accentColor: "#0064e1" }}
                        />
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                            Manual placements
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                            Manually choose the places to show your ad.
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Accordion: Placement value rules (Image 2) */}
                    <div
                      style={{
                        border: "1px solid #e4e6eb",
                        borderRadius: 8,
                        background: "#ffffff",
                        padding: "14px 16px",
                        marginBottom: 16,
                      }}
                    >
                      <div
                        onClick={() => setPlacementValueRulesOpen((prev) => !prev)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          marginBottom: placementValueRulesOpen ? 10 : 0,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                          <span>Placement value rules</span>
                          <Info size={13} color="#65676b" />
                        </div>
                        <ChevronDown
                          size={16}
                          color="#65676b"
                          style={{
                            transform: placementValueRulesOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.15s ease",
                          }}
                        />
                      </div>

                      {placementValueRulesOpen && (
                        <div>
                          <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.45, marginBottom: 12 }}>
                            Prioritise the placements that matter most to your business by adjusting bids for them.{" "}
                            <a href="#about-value-rules" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                              About value rules
                            </a>
                          </div>
                          <button
                            type="button"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 14px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#1c1e21",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                          >
                            <Plus size={14} />
                            <span>Create a rule set</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Account controls (Image 2) */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                        <span>Account controls</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        Excluded placements: None
                      </div>
                    </div>

                    {/* Show more settings link (Image 2) */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setPlacementShowMoreOpen((prev) => !prev)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0064e1",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: 0,
                        }}
                      >
                        <span>{placementShowMoreOpen ? "Show fewer settings" : "Show more settings"}</span>
                        <ChevronDown
                          size={14}
                          style={{
                            transform: placementShowMoreOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.15s ease",
                          }}
                        />
                      </button>
                      {placementShowMoreOpen && (
                        <div style={{ marginTop: 10, padding: 12, background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#475569" }}>
                          <div><strong>Inventory filter:</strong> Standard inventory (recommended)</div>
                          <div style={{ marginTop: 6 }}><strong>Block lists:</strong> None</div>
                          <div style={{ marginTop: 6 }}><strong>Content type exclusions:</strong> None</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Campaign score + Validation Warning + Audience definition */}
                <div
                  style={{
                    width: 300,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    position: "sticky",
                    top: 16,
                  }}
                >
                  {/* Campaign score card (Image 1 & Image 2) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 20px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          border: "3.5px solid #008000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#008000",
                          flexShrink: 0,
                        }}
                      >
                        100
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                          }}
                        >
                          Campaign score
                          <Info size={13} color="#65676b" />
                        </div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "#475569",
                            marginTop: 2,
                            lineHeight: 1.35,
                          }}
                        >
                          You're using our recommended setup.
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: "0.86rem",
                            fontWeight: 700,
                            color: "#1c1e21",
                          }}
                        >
                          <span>✦ Advantage+ {objective === "App promotion" ? "app" : objective === "Leads" ? "leads" : objective.toLowerCase()} campaign</span>
                          <Info size={13} color="#65676b" />
                        </div>
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#15803d",
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          On <ChevronDown size={12} />
                        </span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        No additional recommendations available.
                      </div>
                    </div>
                  </div>

                  {/* Verifying your changes Alert Card (Image 2) */}
                  {objective === "Leads" && !leadTermsAccepted && (
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: 8,
                        border: "1px solid #fca5a5",
                        borderLeft: "4px solid #dc2626",
                        padding: "16px 18px",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: verifyingCardOpen ? 10 : 0,
                          cursor: "pointer",
                        }}
                        onClick={() => setVerifyingCardOpen((prev) => !prev)}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <MetaProhibitedIcon size={16} color="#dc2626" />
                          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                            Verifying your changes
                          </span>
                        </div>
                        <ChevronUp
                          size={16}
                          color="#65676b"
                          style={{
                            transform: verifyingCardOpen ? "rotate(0deg)" : "rotate(180deg)",
                            transition: "transform 0.15s ease",
                          }}
                        />
                      </div>

                      {verifyingCardOpen && (
                        <div>
                          <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.45, marginBottom: 12 }}>
                            Terms of service not accepted: You can't run lead ads until your Facebook Page accepts Facebook's Lead Generation Terms of Service. (#1815089)
                          </div>
                          <button
                            type="button"
                            onClick={() => setLeadTermsAccepted(true)}
                            style={{
                              padding: "6px 16px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#1c1e21",
                              fontSize: "0.84rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audience definition card (Image 1 & Image 2) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 20px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "#1c1e21",
                        marginBottom: 10,
                      }}
                    >
                      Audience definition
                      <Info size={13} color="#65676b" />
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#1c1e21", fontWeight: 600, marginBottom: 6 }}>
                      Your audience is broad.
                    </div>

                    <div style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.4, marginBottom: 14 }}>
                      Broad audiences can improve performance and reach more people likely to respond.
                    </div>

                    {/* Segmented meter bar (Narrow to Broad with green fill) */}
                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          height: 7,
                          borderRadius: 4,
                          overflow: "hidden",
                          gap: 2,
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ flex: 1, background: "#fee2e2" }} />
                        <div style={{ flex: 1, background: "#fef3c7" }} />
                        <div style={{ flex: 1.5, background: "#008000" }} />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.78rem",
                          color: "#65676b",
                        }}
                      >
                        <span>Narrow</span>
                        <span>Broad</span>
                      </div>
                    </div>

                    {/* Show estimated audience size dropdown link */}
                    <div
                      onClick={() => setShowEstimatedAudienceSize((prev) => !prev)}
                      style={{
                        color: "#0064e1",
                        fontSize: "0.84rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>Show estimated audience size</span>
                      <ChevronDown
                        size={14}
                        style={{
                          transform: showEstimatedAudienceSize ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.15s ease",
                        }}
                      />
                    </div>

                    {showEstimatedAudienceSize && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "12px 14px",
                          borderRadius: 6,
                          background: "#f8fafc",
                          fontSize: "0.82rem",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: "#1c1e21", display: "flex", alignItems: "center", gap: 4 }}>
                            <span>Estimated audience size:</span>
                            <span style={{ fontWeight: 700 }}>598,500,000 – 704,100,000</span>
                            <Info size={12} color="#65676b" />
                          </div>
                          <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 2 }}>
                            Estimates don't include Advantage+ audience
                          </div>
                        </div>
                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                          <div style={{ fontWeight: 600, color: "#1c1e21", marginBottom: 2 }}>Estimated daily results</div>
                          <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                            Reach <strong>14K – 41K</strong> • Conversions <strong>180 – 520</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeLevel === "ad" && (
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", position: "relative" }}>
                {/* ── LEFT COLUMN: FORM CARDS (Images 2, 3, 4, 5) ── */}
                <div style={{ flex: "1 1 500px", minWidth: 440, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Card 1: Ad name (Image 2) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Ad name
                      </h2>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <input
                        type="text"
                        value={adName}
                        onChange={(e) => setAdName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.9rem",
                          color: "#1c1e21",
                          outline: "none",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setTemplateModalOpen(true)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Create template
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Partnership ad (Image 2) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Partnership ad
                      </h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.85rem", color: "#1c1e21", fontWeight: 500 }}>
                          {partnershipAdEnabled ? "On" : "Off"}
                        </span>
                        <div
                          role="switch"
                          aria-checked={partnershipAdEnabled}
                          onClick={() => setPartnershipAdEnabled((prev) => !prev)}
                          style={{
                            width: 32,
                            height: 18,
                            borderRadius: 9,
                            background: partnershipAdEnabled ? "#0064e1" : "#cbd5e1",
                            padding: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: partnershipAdEnabled ? "flex-end" : "flex-start",
                            boxSizing: "border-box",
                            transition: "background 0.15s ease",
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
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#334155", lineHeight: 1.45 }}>
                      Run ads with creators, brands and other businesses to improve campaign performance.{" "}
                      <a
                        href="#creator-hub"
                        onClick={(e) => e.preventDefault()}
                        style={{ color: "#0064e1", textDecoration: "none", fontWeight: 500 }}
                      >
                        Go to Creator Marketing Hub to view creator content
                      </a>
                    </div>
                  </div>

                  {/* Card 3: Identity (Image 2) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Identity
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#475569", marginBottom: 16 }}>
                      The profiles that will be used in your ad.
                    </div>

                    {/* Field 1: Facebook Page (Image 2) */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 6,
                        }}
                      >
                        <span>* Facebook Page</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      <div
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          background: "#ffffff",
                          padding: "6px 12px",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#050505",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            marginRight: 10,
                            flexShrink: 0,
                          }}
                        >
                          {facebookPage ? facebookPage.charAt(0) : "L"}
                        </div>
                        <input
                          type="text"
                          value={facebookPage}
                          onChange={(e) => setFacebookPage(e.target.value)}
                          style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            color: "#1c1e21",
                            background: "transparent",
                          }}
                        />
                        <ChevronDown size={16} color="#65676b" style={{ marginLeft: 8 }} />
                      </div>
                    </div>

                    {/* Field 2: Instagram profile (Image 2) */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 6,
                        }}
                      >
                        <span>Instagram profile</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      <div
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          background: "#ffffff",
                          padding: "6px 12px",
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#050505",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            marginRight: 10,
                            flexShrink: 0,
                          }}
                        >
                          {instagramAccount ? instagramAccount.charAt(0) : "l"}
                        </div>
                        <input
                          type="text"
                          value={instagramAccount}
                          onChange={(e) => setInstagramAccount(e.target.value)}
                          style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            color: "#1c1e21",
                            background: "transparent",
                          }}
                        />
                        <ChevronDown size={16} color="#65676b" style={{ marginLeft: 8 }} />
                      </div>
                    </div>

                    {/* Field 3: Threads profile (Image 2) */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 6,
                        }}
                      >
                        <span>Threads profile</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, position: "relative" }}>
                          <select
                            value={threadsProfile}
                            onChange={(e) => setThreadsProfile(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 30px 8px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              background: "#ffffff",
                              color: threadsProfile ? "#1c1e21" : "#65676b",
                              appearance: "none",
                              cursor: "pointer",
                            }}
                          >
                            <option value="">Select a Threads profile</option>
                            <option value="@adstradigital">@adstradigital</option>
                          </select>
                          <ChevronDown
                            size={14}
                            color="#65676b"
                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                          />
                        </div>
                        <span style={{ fontSize: "0.84rem", color: "#65676b" }}>or</span>
                        <button
                          type="button"
                          style={{
                            padding: "8px 14px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.84rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Create profile
                        </button>
                      </div>
                    </div>

                    {/* Field 4: WhatsApp phone number (Image 2) */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 6,
                        }}
                      >
                        <span>WhatsApp phone number</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      <div style={{ position: "relative" }}>
                        <select
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 30px 8px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            background: "#ffffff",
                            color: whatsappNumber ? "#1c1e21" : "#65676b",
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="">Select a WhatsApp number</option>
                          <option value="+91 98765 43210">+91 98765 43210 (Adstra Business)</option>
                        </select>
                        <ChevronDown
                          size={14}
                          color="#65676b"
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Ad setup (Image 3) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Ad setup
                      </h2>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ position: "relative" }}>
                        <select
                          value={adSetupOption}
                          onChange={(e) => setAdSetupOption(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 34px 9px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.9rem",
                            background: "#ffffff",
                            color: "#1c1e21",
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Use existing post">Use existing post</option>
                          <option value="Create ad">Create ad</option>
                          <option value="Use Creative Hub mockup">Use Creative Hub mockup</option>
                        </select>
                        <ChevronDown
                          size={16}
                          color="#65676b"
                          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        />
                      </div>
                    </div>

                    {/* Multi-advertiser ads checkbox (Image 3) */}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={multiAdvertiserAds}
                        onChange={(e) => setMultiAdvertiserAds(e.target.checked)}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: "#0064e1" }}
                      />
                      <div>
                        <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                          Multi-advertiser ads
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#65676b", lineHeight: 1.45, marginTop: 2 }}>
                          Your ad can appear with others in the same ad unit to help promote discoverability. Your ad creative may be resized or cropped.{" "}
                          <a href="#about-multi" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                            About multi-advertiser ads
                          </a>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Card 5: Ad creative (Images 3 & 4) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Ad creative
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#475569", marginBottom: 14 }}>
                      Select and optimise your ad text, media and enhancements.
                    </div>

                    {/* Notice Callout (Image 3) */}
                    <div
                      style={{
                        background: "#f0f7ff",
                        border: "1px solid #cce3fd",
                        borderRadius: 6,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      <Info size={16} color="#0064e1" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: "0.82rem", color: "#1c1e21" }}>
                        Your Instagram ad will render Facebook mentions as regular text.
                      </div>
                    </div>

                    {/* Selected Facebook Post Snippet (Image 3) */}
                    <div
                      style={{
                        border: "1px solid #e4e6eb",
                        borderRadius: 8,
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 14,
                        background: "#fafbfd",
                      }}
                    >
                      <img
                        src={selectedCreativeUrl}
                        alt="Selected post"
                        style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", border: "1px solid #cbd5e1" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "#65676b" }}>
                          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#0064e1", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700 }}>f</span>
                          <span>Facebook post</span>
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                          {selectedPostTitle}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 2 }}>
                          {selectedPostId} • {selectedPostDate}
                        </div>
                      </div>
                    </div>

                    {/* Change post / Create post buttons (Image 3) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIdx = (PRESET_CREATIVES.findIndex(c => c.url === selectedCreativeUrl) + 1) % PRESET_CREATIVES.length;
                          setSelectedCreativeUrl(PRESET_CREATIVES[nextIdx].url);
                        }}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "8px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <FileText size={15} color="#1c1e21" />
                        <span>Change post</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const promptText = window.prompt("Enter new primary text for post:", primaryText);
                          if (promptText) setPrimaryText(promptText);
                        }}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "8px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={16} color="#1c1e21" />
                        <span>Create post</span>
                      </button>
                    </div>

                    {/* Enter post ID link (Image 3) */}
                    <div style={{ marginBottom: 14 }}>
                      <span
                        onClick={() => {
                          const id = window.prompt("Enter Facebook post ID:", selectedPostId);
                          if (id) setSelectedPostId(id);
                        }}
                        style={{ color: "#0064e1", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        Enter post ID
                      </span>
                    </div>

                    {/* AI Info Checkbox (Image 3 & 4) */}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 16 }}>
                      <input
                        type="checkbox"
                        checked={aiTransparency}
                        onChange={(e) => setAiTransparency(e.target.checked)}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: "#0064e1" }}
                      />
                      <div>
                        <div style={{ fontSize: "0.86rem", color: "#1c1e21" }}>
                          Ad includes media created or edited with AI
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 2 }}>
                          Ticking this box may add an AI info label to your ad.{" "}
                          <a href="#ai-info" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                            About AI transparency
                          </a>
                        </div>
                      </div>
                    </label>

                    {/* Primary Text (Image 4) */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                        Primary text
                      </label>
                      <textarea
                        rows={7}
                        value={primaryText}
                        onChange={(e) => setPrimaryText(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.86rem",
                          color: "#1c1e21",
                          lineHeight: 1.5,
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* Add a destination checkbox (Image 4) */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={addDestination}
                          onChange={(e) => setAddDestination(e.target.checked)}
                          style={{ width: 16, height: 16, marginTop: 2, accentColor: "#0064e1" }}
                        />
                        <div>
                          <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                            Add a destination
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#65676b", lineHeight: 1.4, marginTop: 2 }}>
                            If you add a destination, you can send people immediately after they've tapped or clicked your ad to a website, a full-screen experience or a call. If you don't, they'll be sent to your Facebook Page or Instagram profile.
                          </div>
                        </div>
                      </label>

                      {addDestination && (
                        <div style={{ marginTop: 12, paddingLeft: 26 }}>
                          <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                            Website URL
                          </label>
                          <input
                            type="text"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Call to action (Image 4) */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                        <span>Call to action</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <div style={{ position: "relative" }}>
                        <select
                          value={callToAction}
                          onChange={(e) => setCallToAction(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 30px 8px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            background: "#ffffff",
                            color: "#1c1e21",
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="Learn more">Learn more</option>
                          <option value="Shop now">Shop now</option>
                          <option value="See details">See details</option>
                          <option value="Sign up">Sign up</option>
                          <option value="Send WhatsApp message">Send WhatsApp message</option>
                          <option value="Contact us">Contact us</option>
                        </select>
                        <ChevronDown size={14} color="#65676b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </div>

                    {/* Edit placement dropdown (Image 4) */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                        Edit placement
                      </div>
                      <div style={{ position: "relative" }}>
                        <select
                          value={previewPlacementFilter}
                          onChange={(e) => setPreviewPlacementFilter(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 34px 8px 34px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            background: "#ffffff",
                            color: "#1c1e21",
                            appearance: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="all">Select a placement to edit</option>
                          <option value="feeds">Feeds (Facebook & Instagram)</option>
                          <option value="stories">Stories & Reels</option>
                          <option value="marketplace">Marketplace</option>
                        </select>
                        <LayoutGrid size={15} color="#65676b" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <ChevronDown size={14} color="#65676b" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    </div>

                    {/* Advantage+ creative enhancements (0/3) (Image 4 & 5) */}
                    <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                          <span>Advantage+ creative enhancements (0/3)</span>
                          <Info size={13} color="#65676b" />
                        </div>
                        <button
                          type="button"
                          style={{
                            padding: "4px 12px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Try it out
                        </button>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {["Visual touch-ups", "Add animation", "Show spotlights"].map((item) => (
                          <div
                            key={item}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 14,
                              background: "#f0f2f5",
                              fontSize: "0.78rem",
                              color: "#65676b",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span>{item}</span>
                            <span style={{ fontWeight: 700, color: "#475569" }}>Off</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Creative testing (Image 5) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "1rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                      <span>Creative testing</span>
                      <Info size={13} color="#65676b" />
                    </div>
                    <div style={{ fontSize: "0.84rem", color: "#475569", lineHeight: 1.45, marginBottom: 12 }}>
                      Compare up to 7 different versions of your creative in a test that helps ensure delivery to new test ads.{" "}
                      <a href="#about-test" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                        About creative testing
                      </a>
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: "7px 16px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#1c1e21",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Set up test
                    </button>
                  </div>

                  {/* Card 7: Tracking (Image 5) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <CheckCircle2 size={18} color="#008000" strokeWidth={2.5} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Tracking
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#475569", marginBottom: 16 }}>
                      Choose conversion events to track. This ad account's selected conversion dataset will be tracked by default.
                    </div>

                    {/* Website events */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                        <span>Website events</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: "5px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Set up
                      </button>
                    </div>

                    {/* App events checkbox */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" style={{ width: 16, height: 16, accentColor: "#0064e1" }} />
                        <span style={{ fontSize: "0.86rem", color: "#1c1e21" }}>App events</span>
                      </label>
                    </div>

                    {/* Offline events */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                        <span>Offline events</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: "5px 14px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Set up
                      </button>
                    </div>

                    {/* URL parameters */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                        <span>URL parameters</span>
                        <Info size={13} color="#65676b" />
                      </div>
                      <input
                        type="text"
                        placeholder="key1=value1&key2=value2"
                        defaultValue="utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.86rem",
                          boxSizing: "border-box",
                          color: "#475569",
                          marginBottom: 6,
                        }}
                      />
                      <span style={{ color: "#0064e1", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}>
                        Build a URL parameter
                      </span>
                    </div>

                    {/* Third-party reporting */}
                    <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 14 }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                        Third-party reporting
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", lineHeight: 1.4, marginBottom: 10 }}>
                        Meta purchases may not be included in your Google reporting. Connect your account to measure actions on ads that send people to your website or shop.{" "}
                        <a href="#about-reporting" onClick={(e) => e.preventDefault()} style={{ color: "#0064e1", textDecoration: "none" }}>
                          Learn more
                        </a>
                      </div>
                      <button
                        type="button"
                        style={{
                          padding: "6px 16px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT COLUMN: NATIVE META MULTI-PLACEMENT AD PREVIEW PANEL (Images 2, 3, 4, 5) ── */}
                <div
                  style={{
                    flex: "1 1 540px",
                    minWidth: 480,
                    maxWidth: 620,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    position: "sticky",
                    top: 16,
                    maxHeight: "calc(100vh - 120px)",
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  {/* Card 1: Campaign recommendations (Image 2, 3, 4, 5) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "14px 18px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#ecfdf5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                        Campaign recommendations
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: 1 }}>
                        All recommended settings applied.
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Ad preview container (Images 2, 3, 4, 5) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header bar (Image 2) */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Left: Ad preview toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          role="switch"
                          aria-checked={adPreviewEnabled}
                          onClick={() => setAdPreviewEnabled((prev) => !prev)}
                          style={{
                            width: 36,
                            height: 20,
                            borderRadius: 10,
                            background: adPreviewEnabled ? "#0064e1" : "#cbd5e1",
                            padding: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: adPreviewEnabled ? "flex-end" : "flex-start",
                            boxSizing: "border-box",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: "#ffffff",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                          Ad preview
                        </span>
                      </div>

                      {/* Right icons: Review defaults, Expand, Share (Image 2) */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          style={{
                            padding: "4px 12px",
                            borderRadius: 4,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Review defaults
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: "5px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 4,
                            background: "#ffffff",
                            cursor: "pointer",
                            color: "#65676b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Maximize2 size={13} />
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: "5px 8px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 4,
                            background: "#ffffff",
                            cursor: "pointer",
                            color: "#65676b",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Share2 size={13} />
                          <ChevronDown size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Sub-bar: 4 Device Placement View Icons (Image 2) */}
                    <div
                      style={{
                        padding: "8px 16px",
                        borderBottom: "1px solid #f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fafbfd",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {[
                          { id: "all", label: "Feeds", icon: LayoutGrid },
                          { id: "stories", label: "Stories", icon: Smartphone },
                          { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
                          { id: "video", label: "In-stream", icon: Tv },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPreviewPlacementFilter(m.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: previewPlacementFilter === m.id ? "1.5px solid #0064e1" : "1px solid transparent",
                              background: previewPlacementFilter === m.id ? "#e7f3ff" : "transparent",
                              color: previewPlacementFilter === m.id ? "#0064e1" : "#65676b",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <m.icon size={14} />
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#008000" }}>
                        <CheckCircle2 size={15} color="#008000" />
                      </div>
                    </div>

                    {/* Preview Body with Multi-Placement Grid (Images 2, 3, 4, 5) */}
                    {adPreviewEnabled ? (
                      <div style={{ padding: "16px", background: "#f0f2f5", display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* ── ROW 1: FACEBOOK FEED & INSTAGRAM FEED (Image 2) ── */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          {/* Placement 1: Facebook Feed Preview */}
                          <div
                            style={{
                              background: "#ffffff",
                              borderRadius: 8,
                              border: "1px solid #e4e6eb",
                              overflow: "hidden",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* FB Header */}
                            <div style={{ padding: "10px 12px 6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: "#050505",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {facebookPage ? facebookPage.charAt(0) : "L"}
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#050505", lineHeight: 1.2 }}>
                                    {facebookPage}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "#65676b", display: "flex", alignItems: "center", gap: 3 }}>
                                    <span>Sponsored</span> • <Globe size={10} />
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#65676b" }}>
                                <MoreHorizontal size={14} />
                                <X size={14} />
                              </div>
                            </div>

                            {/* FB Primary Text */}
                            <div style={{ padding: "0 12px 8px 12px", fontSize: "0.78rem", color: "#050505", lineHeight: 1.35, maxHeight: 54, overflow: "hidden" }}>
                              {primaryText.split("\n").slice(0, 2).join(" ")} ...see more
                            </div>

                            {/* FB Media Image */}
                            <div style={{ width: "100%", height: 210, background: "#000", overflow: "hidden" }}>
                              <img
                                src={selectedCreativeUrl}
                                alt="Feed ad creative"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>

                            {/* FB Social Footer */}
                            <div style={{ padding: "6px 12px", borderBottom: "1px solid #f0f2f5", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem", color: "#65676b" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#0064e1", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>👍</span>
                                <span>1</span>
                              </div>
                              <div>1 share</div>
                            </div>

                            <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-around", fontSize: "0.74rem", fontWeight: 600, color: "#65676b" }}>
                              <span>Like</span>
                              <span>Comment</span>
                              <span>Share</span>
                            </div>
                          </div>

                          {/* Placement 2: Instagram Feed Preview */}
                          <div
                            style={{
                              background: "#ffffff",
                              borderRadius: 8,
                              border: "1px solid #e4e6eb",
                              overflow: "hidden",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* IG Header */}
                            <div style={{ padding: "10px 12px 6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: "#050505",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                    fontSize: "0.8rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {instagramAccount ? instagramAccount.charAt(0) : "l"}
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#050505", lineHeight: 1.2 }}>
                                    {instagramAccount}
                                  </div>
                                  <div style={{ fontSize: "0.7rem", color: "#65676b" }}>
                                    Sponsored
                                  </div>
                                </div>
                              </div>
                              <MoreHorizontal size={14} color="#65676b" />
                            </div>

                            {/* IG Media */}
                            <div style={{ width: "100%", height: 210, background: "#000", overflow: "hidden" }}>
                              <img
                                src={selectedCreativeUrl}
                                alt="IG ad creative"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>

                            {/* IG CTA strip */}
                            <div
                              style={{
                                padding: "6px 12px",
                                background: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: "0.76rem",
                                fontWeight: 600,
                                color: "#0064e1",
                              }}
                            >
                              <span>{callToAction}</span>
                              <ChevronRight size={14} />
                            </div>

                            {/* IG Icons bar */}
                            <div style={{ padding: "6px 12px 4px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#262626" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ cursor: "pointer" }}>♡</span>
                                <span style={{ cursor: "pointer" }}>💬</span>
                                <span style={{ cursor: "pointer" }}>✈</span>
                              </div>
                              <span style={{ cursor: "pointer" }}>🔖</span>
                            </div>

                            {/* IG Caption */}
                            <div style={{ padding: "0 12px 10px 12px", fontSize: "0.75rem", color: "#050505", lineHeight: 1.35, maxHeight: 38, overflow: "hidden" }}>
                              <strong>{instagramAccount}</strong> {primaryText.split("\n")[0]} ... more
                            </div>
                          </div>
                        </div>

                        {/* ── ROW 2: INSTAGRAM STORIES & FACEBOOK STORIES (Images 3 & 4) ── */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1c1e21", display: "flex", alignItems: "center", gap: 6 }}>
                              <Smartphone size={14} color="#0064e1" />
                              <span>Instagram Stories & Facebook Stories</span>
                            </div>
                            <MoreHorizontal size={14} color="#65676b" />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {/* Instagram Story 9:16 Card */}
                            <div
                              style={{
                                width: "100%",
                                height: 290,
                                borderRadius: 10,
                                overflow: "hidden",
                                position: "relative",
                                background: "#050505",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              }}
                            >
                              <img
                                src={selectedCreativeUrl}
                                alt="Story Creative"
                                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)",
                                }}
                              />

                              {/* Story Progress Bar */}
                              <div style={{ position: "absolute", top: 8, left: 8, right: 8, height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 1 }}>
                                <div style={{ width: "65%", height: "100%", background: "#fff", borderRadius: 1 }} />
                              </div>

                              {/* Story Top Profile */}
                              <div style={{ position: "absolute", top: 16, left: 10, right: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
                                  L
                                </div>
                                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#ffffff" }}>
                                  {instagramAccount}
                                </span>
                                <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)" }}>Sponsored</span>
                              </div>

                              {/* Story Bottom Swipe-up CTA */}
                              <div style={{ position: "absolute", bottom: 12, left: 10, right: 10, textAlign: "center" }}>
                                <div style={{ fontSize: "0.75rem", color: "#ffffff", marginBottom: 4, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                                  {callToAction}
                                </div>
                                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.3)" }}>
                                  <ChevronUp size={12} color="#fff" />
                                </div>
                              </div>
                            </div>

                            {/* Reels 9:16 Card (Image 5) */}
                            <div
                              style={{
                                width: "100%",
                                height: 290,
                                borderRadius: 10,
                                overflow: "hidden",
                                position: "relative",
                                background: "#050505",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              }}
                            >
                              <img
                                src={selectedCreativeUrl}
                                alt="Reels Creative"
                                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.95 }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)",
                                }}
                              />

                              <div style={{ position: "absolute", top: 10, left: 10, fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>
                                Reels
                              </div>

                              {/* Vertical Right Actions (Image 5) */}
                              <div style={{ position: "absolute", right: 8, bottom: 40, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", color: "#fff", fontSize: "0.68rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <span>♡</span>
                                  <span>1</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <span>💬</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <span>✈</span>
                                </div>
                              </div>

                              {/* Reels Bottom Caption & CTA (Image 5) */}
                              <div style={{ position: "absolute", bottom: 10, left: 10, right: 38 }}>
                                <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#fff" }}>{facebookPage}</div>
                                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                                  {headline}
                                </div>
                                <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, background: "#0064e1", color: "#fff", padding: "3px 10px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600 }}>
                                  <span>{callToAction}</span>
                                  <ChevronRight size={10} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer disclaimer (Image 5) */}
                        <div style={{ fontSize: "0.74rem", color: "#65676b", textAlign: "center", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <span>Ad rendering and interaction may vary based on device, format and other factors.</span>
                          <Info size={12} color="#65676b" />
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 40, textAlign: "center", color: "#65676b", fontSize: "0.85rem" }}>
                        Preview is turned off
                      </div>
                    )}
                  </div>

                  {/* Floating Meta AI gradient sparkle button (Images 2, 3, 4, 5) */}
                  <div
                    title="Meta AI Assistant"
                    style={{
                      position: "fixed",
                      bottom: 74,
                      right: 32,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #3b82f6 100%)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 14px rgba(168, 85, 247, 0.4)",
                      cursor: "pointer",
                      zIndex: 20,
                    }}
                  >
                    <Sparkles size={20} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── BOTTOM STICKY ACTION BAR (Screenshots 1, 2, 3) ── */}
      <footer
        style={{
          background: "#ffffff",
          borderTop: "1px solid #e4e6eb",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          zIndex: 10,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.03)",
        }}
      >
        {/* Terms disclaimer on Ad Level (Screenshot 3) */}
        {activeLevel === "ad" && (
          <div
            style={{
              padding: "10px 24px 0 24px",
              fontSize: "0.78rem",
              color: "#334155",
            }}
          >
            By clicking Publish, you acknowledge that your use of Meta's ad tools is subject to our{" "}
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              style={{ color: "#0064e1", textDecoration: "none", fontWeight: 500 }}
            >
              Terms and Conditions
            </a>
            .
          </div>
        )}

        <div
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          {/* Left: Close button */}
          <button
            type="button"
            onClick={handleClose}
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
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            Close
          </button>

          {/* Right: Back / Next / Publish */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Back button (Ad set and Ad level) */}
            {(activeLevel === "adset" || activeLevel === "ad") && (
              <button
                type="button"
                onClick={() => {
                  if (activeLevel === "ad") setActiveLevel("adset");
                  else if (activeLevel === "adset") setActiveLevel("campaign");
                }}
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
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
              >
                Back
              </button>
            )}

            {/* Next button (Campaign level) */}
            {activeLevel === "campaign" && (
              <button
                type="button"
                onClick={() => setActiveLevel("adset")}
                style={{
                  padding: "8px 24px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 100, 225, 0.3)",
                }}
              >
                Next
              </button>
            )}

            {/* Next button (Ad set level) */}
            {activeLevel === "adset" && (
              <button
                type="button"
                onClick={() => setActiveLevel("ad")}
                style={{
                  padding: "8px 24px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 100, 225, 0.3)",
                }}
              >
                Next
              </button>
            )}

            {/* Publish Button (Ad level) */}
            {activeLevel === "ad" && (
              <button
                type="button"
                onClick={handlePublishClick}
                style={{
                  padding: "8px 24px",
                  borderRadius: 6,
                  border: "none",
                  background: "#008060",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0, 128, 96, 0.3)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#006b50")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#008060")}
              >
                Publish
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ── CREATE FACEBOOK PAGE MODAL ── */}
      {/* ── CREATE INSTANT FORM MODAL ── */}
      {createFormModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setCreateFormModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 10,
              width: "100%",
              maxWidth: 540,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              overflow: "hidden",
              border: "1px solid #e4e6eb",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e4e6eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1c1e21" }}>
                Create instant form
              </h3>
              <button
                type="button"
                onClick={() => setCreateFormModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#65676b",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                  Form name
                </label>
                <input
                  type="text"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                  Form type
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      cursor: "pointer",
                      background: "#f0f7ff",
                    }}
                  >
                    <input type="radio" name="formType" defaultChecked style={{ marginTop: 2, accentColor: "#0064e1" }} />
                    <div>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                        Higher intent (Recommended)
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#65676b" }}>
                        Add a review step that gives people a chance to confirm their info before submitting.
                      </div>
                    </div>
                  </label>
                  <label
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input type="radio" name="formType" style={{ marginTop: 2, accentColor: "#0064e1" }} />
                    <div>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1e21" }}>
                        More volume
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#65676b" }}>
                        Use a form that is quick to complete and submit on a mobile device.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21", marginBottom: 6 }}>
                  User questions (Prefilled automatically)
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f8fafc", padding: "12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#1c1e21" }}>
                    <input type="checkbox" defaultChecked disabled style={{ accentColor: "#0064e1" }} />
                    <span>Full name (Required)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#1c1e21" }}>
                    <input type="checkbox" defaultChecked disabled style={{ accentColor: "#0064e1" }} />
                    <span>Email address (Required)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#1c1e21" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "#0064e1" }} />
                    <span>Phone number</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: "#1c1e21" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "#0064e1" }} />
                    <span>City</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#1c1e21", marginBottom: 4 }}>
                  Privacy policy link
                </label>
                <input
                  type="text"
                  defaultValue="https://adstradigital.com/privacy-policy"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e4e6eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => setCreateFormModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLeadInstantForm(newFormName || "Lead Generation Form - High Intent");
                  setCreateFormModalOpen(false);
                }}
                style={{
                  padding: "7px 20px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Create form
              </button>
            </div>
          </div>
        </div>
      )}

      {facebookPageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setFacebookPageModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.22)",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#1c1e21" }}>
                Create Facebook Page
              </h3>
              <button
                type="button"
                onClick={() => setFacebookPageModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#65676b",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1c1e21",
                  marginBottom: 4,
                }}
              >
                Page name
              </label>
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Enter Page name"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1c1e21",
                  marginBottom: 4,
                }}
              >
                Category
              </label>
              <input
                type="text"
                value={newPageCategory}
                onChange={(e) => setNewPageCategory(e.target.value)}
                placeholder="e.g. Marketing Agency, Software"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setFacebookPageModalOpen(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1c1e21",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setFacebookPage(newPageName || "Adstra Digital");
                  setFacebookPageConnected(true);
                  setFacebookPageModalOpen(false);
                }}
                style={{
                  padding: "7px 20px",
                  borderRadius: 6,
                  border: "none",
                  background: "#0064e1",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── META ADS MANAGER NAME TEMPLATES FULL PAGE OVERLAY ── */}
      {templateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Name templates"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200000,
            background: "linear-gradient(135deg, #fcfdfe 0%, #f4f7fc 35%, #edf4fa 70%, #e6f1f8 100%)",
            display: "flex",
            flexDirection: "row",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: "#1c1e21",
            overflow: "hidden",
          }}
        >
          {/* ── LEFT RAIL: META NAVIGATION ICONS (Exact match to Image 1 & Meta Ads Manager) ── */}
          <div
            style={{
              width: 52,
              background: "#ffffff",
              borderRight: "1px solid #e4e6eb",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 0",
              flexShrink: 0,
              zIndex: 20,
              justifyContent: "space-between",
              boxShadow: "1px 0 3px rgba(0,0,0,0.02)",
            }}
          >
            {/* Top Icons */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              {/* Meta Logo */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#0064e1",
                  marginBottom: 4,
                }}
                title="Meta"
              >
                <svg width="24" height="24" viewBox="0 0 36 36" fill="currentColor">
                  <path d="M20.3 11.2c-1.8-3.1-4.7-5.2-8.3-5.2C5.4 6 0 11.4 0 18s5.4 12 12 12c3.6 0 6.5-2.1 8.3-5.2 1.8 3.1 4.7 5.2 8.3 5.2 6.6 0 12-5.4 12-12s-5.4-12-12-12c-3.6 0-6.5 2.1-8.3 5.2zm-8.3 14.3c-4.1 0-7.5-3.4-7.5-7.5s3.4-7.5 7.5-7.5c2.9 0 5.4 1.7 6.6 4.2-1.2 2.5-3.7 4.2-6.6 4.2zm16 0c-2.9 0-5.4-1.7-6.6-4.2 1.2-2.5 3.7-4.2 6.6-4.2 4.1 0 7.5 3.4 7.5 7.5s-3.4 7.5-7.5 7.5z" />
                </svg>
              </div>

              {/* Notification Bell with '9' badge */}
              <div style={{ position: "relative", cursor: "pointer" }} title="Notifications">
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1c1e21",
                  }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    background: "#e41e3f",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: "bold",
                    width: 17,
                    height: 17,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
                  }}
                >
                  9
                </div>
              </div>

              {/* Speedometer (Campaigns) */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Campaigns"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>

              {/* Table / Grid */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Ads Reporting"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
              </div>

              {/* Document / Reports */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Reports"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>

              {/* Users / Audience */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Audiences"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>

              {/* Business Settings / Wrench */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0064e1",
                  cursor: "pointer",
                  background: "#edf4fe",
                }}
                title="Business Settings"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>

              {/* Branch / Events */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="Events Manager"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </div>

              {/* Hamburger All Tools */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1c1e21",
                  cursor: "pointer",
                }}
                title="All Tools"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </div>
            </div>

            {/* Bottom Icons */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              {/* Purple Sparkle / Advantage+ */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8a3ab9",
                  cursor: "pointer",
                }}
                title="Advantage+ Creative"
              >
                <Sparkles size={18} />
              </div>

              {/* Question Help */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#65676b",
                  cursor: "pointer",
                }}
                title="Help"
              >
                <span style={{ fontSize: "16px", fontWeight: 700 }}>?</span>
              </div>

              {/* Gear Settings */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#65676b",
                  cursor: "pointer",
                }}
                title="Settings"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>

              {/* Search */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#65676b",
                  cursor: "pointer",
                }}
                title="Search"
              >
                <Search size={18} />
              </div>
            </div>
          </div>

          {/* ── MAIN WORKSPACE (Top Bar + 2-Column Content) ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── TOP BAR (Matches Image 1, 2, 3) ── */}
            <div
              style={{
                height: 58,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 28px 0 24px",
                flexShrink: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                  type="button"
                  onClick={handleCloseTemplateModal}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 6,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1c1e21",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  title="Back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.28rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Name templates
                </h1>
              </div>

              {/* Top Right: Account Dropdown & Profile */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#ffffff",
                    border: "1px solid #ced0d4",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: "0.82rem",
                    color: "#1c1e21",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" color="#65676b">
                    <rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="5" cy="6" r="1.5" />
                    <line x1="8" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontWeight: 500 }}>1405144991733037 (14051449...)</span>
                  <ChevronDown size={14} color="#65676b" />
                </div>

                <div style={{ position: "relative", width: 32, height: 32 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#e4e6eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#65676b">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#1877f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #ffffff",
                    }}
                  >
                    <span style={{ color: "#ffffff", fontSize: "9px", fontWeight: "bold", lineHeight: 1 }}>f</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MAIN SCROLLABLE BODY (2 Columns: Left 3 Cards + Right About panel) ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 32px 80px 24px",
                display: "flex",
                gap: 40,
                alignItems: "flex-start",
              }}
            >
              {/* LEFT COLUMN: 3 SECTIONS */}
              <div
                style={{
                  width: 580,
                  maxWidth: "100%",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {/* ── SECTION 1: CAMPAIGN NAME ── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #ced0d4",
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    position: "relative",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                    }}
                  >
                    Campaign name
                  </h3>

                  {campaignEditingMode ? (
                    /* ── EXPANDED BUILDER: Image 1, Image 3, Image 4, Image 5 ── */
                    <div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                        Template
                      </div>

                      {/* Components box */}
                      <div
                        style={{
                          border: "1px solid #ced0d4",
                          borderRadius: 6,
                          padding: "12px 14px",
                          background: "#ffffff",
                          minHeight: 76,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 10,
                          position: "relative",
                        }}
                      >
                        {/* Image 3: When empty, show '+ Add component' and 'Choose existing template' buttons */}
                        {templateComponents.length === 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownSection((prev) => (prev === "campaign" ? null : "campaign"));
                                setOpenSubmenu(null);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 6,
                                border: "1px solid #ced0d4",
                                background: "#ffffff",
                                color: "#1c1e21",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                            >
                              <Plus size={15} color="#1c1e21" strokeWidth={2} />
                              <span>Add component</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownSection("campaign");
                                setOpenSubmenu("existing");
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 6,
                                border: "none",
                                background: "#edf2f7",
                                color: "#0064e1",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#edf2f7")}
                            >
                              Choose existing template
                            </button>
                          </div>
                        ) : (
                          /* Image 1, 4, 5: Render components tags */
                          templateComponents.map((comp) => {
                            const isEditing = editingCompId === comp.id;
                            return (
                              <div
                                key={comp.id}
                                style={{
                                  position: "relative",
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                {/* Tag Container */}
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "#ffffff",
                                    border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                    borderRadius: 6,
                                    padding: isEditing ? "0 0 0 10px" : "0 6px 0 10px",
                                    height: 34,
                                    fontSize: "0.85rem",
                                    color: "#1c1e21",
                                    boxShadow: isEditing ? "0 0 0 1px #0064e1" : "0 1px 2px rgba(0,0,0,0.04)",
                                    overflow: "hidden",
                                  }}
                                >
                                  {/* 6 Drag Dots */}
                                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ cursor: "grab", flexShrink: 0 }}>
                                    <circle cx="2" cy="2" r="1.2" fill="#8d949e" />
                                    <circle cx="6" cy="2" r="1.2" fill="#8d949e" />
                                    <circle cx="2" cy="6" r="1.2" fill="#8d949e" />
                                    <circle cx="6" cy="6" r="1.2" fill="#8d949e" />
                                    <circle cx="2" cy="10" r="1.2" fill="#8d949e" />
                                    <circle cx="6" cy="10" r="1.2" fill="#8d949e" />
                                  </svg>

                                  {/* Dark [Aa] Icon */}
                                  <div
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 3,
                                      background: "#1c1e21",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#ffffff",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      lineHeight: 1,
                                      letterSpacing: "-0.5px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    Aa
                                  </div>

                                  {/* Label text */}
                                  <span style={{ fontSize: "0.86rem", color: "#1c1e21", fontWeight: 500, marginRight: 2 }}>
                                    {comp.label}
                                  </span>

                                  {/* When NOT editing (Image 1 & Image 4): Pencil + Trash */}
                                  {!isEditing ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
                                      {/* Pencil button with Tooltip "Edit" (Image 4) */}
                                      <div style={{ position: "relative" }}>
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditing(comp)}
                                          onMouseEnter={() => setHoveredEditId(comp.id)}
                                          onMouseLeave={() => setHoveredEditId(null)}
                                          style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "4px 6px",
                                            borderRadius: 4,
                                            color: "#1c1e21",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            transition: "background 0.15s ease",
                                          }}
                                          title=""
                                        >
                                          <Edit2 size={13} strokeWidth={2} />
                                        </button>

                                        {/* Image 4 Tooltip */}
                                        {hoveredEditId === comp.id && (
                                          <div
                                            style={{
                                              position: "absolute",
                                              bottom: "calc(100% + 8px)",
                                              left: "50%",
                                              transform: "translateX(-50%)",
                                              background: "#ffffff",
                                              color: "#1c1e21",
                                              fontSize: "0.78rem",
                                              fontWeight: 600,
                                              padding: "4px 8px",
                                              borderRadius: 4,
                                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.16)",
                                              border: "1px solid #e4e6eb",
                                              whiteSpace: "nowrap",
                                              pointerEvents: "none",
                                              zIndex: 100,
                                            }}
                                          >
                                            Edit
                                          </div>
                                        )}
                                      </div>

                                      {/* Trash delete button */}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveComponent("campaign", comp.id)}
                                        style={{
                                          background: "transparent",
                                          border: "none",
                                          cursor: "pointer",
                                          padding: "4px 6px",
                                          borderRadius: 4,
                                          color: "#1c1e21",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          transition: "background 0.15s ease",
                                        }}
                                        title="Delete"
                                      >
                                        <Trash2 size={13} strokeWidth={2} />
                                      </button>
                                    </div>
                                  ) : (
                                    /* When EDITING (Image 5): Solid blue check and X buttons inside the tag */
                                    <div style={{ display: "flex", alignItems: "center", height: "100%", marginLeft: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditing("campaign", comp.id)}
                                        style={{
                                          background: "#0064e1",
                                          border: "none",
                                          cursor: "pointer",
                                          width: 32,
                                          height: 34,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "#ffffff",
                                          transition: "background 0.15s ease",
                                        }}
                                        title="Save"
                                      >
                                        <Check size={16} strokeWidth={2.5} color="#ffffff" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCompId(null)}
                                        style={{
                                          background: "#ffffff",
                                          border: "none",
                                          cursor: "pointer",
                                          width: 30,
                                          height: 34,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "#1c1e21",
                                          transition: "background 0.15s ease",
                                        }}
                                        title="Cancel"
                                      >
                                        <X size={16} strokeWidth={2} color="#1c1e21" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Image 5: Floating Popover Dropdown under the tag */}
                                {isEditing && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute",
                                      top: "calc(100% + 8px)",
                                      left: 0,
                                      zIndex: 500,
                                      background: "#ffffff",
                                      border: "1px solid #ced0d4",
                                      borderRadius: 8,
                                      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.16)",
                                      width: 330,
                                      padding: "16px 18px",
                                      animation: "fadeIn 0.15s ease-out",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.95rem",
                                        fontWeight: 700,
                                        color: "#1c1e21",
                                        marginBottom: 10,
                                      }}
                                    >
                                      {comp.fieldId === "open_text" ? "Open text field" : comp.label}
                                    </div>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCompValue}
                                      onChange={(e) => setEditingCompValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEditing("campaign", comp.id);
                                        if (e.key === "Escape") setEditingCompId(null);
                                      }}
                                      style={{
                                        width: "100%",
                                        height: 38,
                                        padding: "0 12px",
                                        borderRadius: 6,
                                        border: "1.5px solid #0064e1",
                                        fontSize: "0.9rem",
                                        color: "#1c1e21",
                                        outline: "none",
                                        boxSizing: "border-box",
                                        boxShadow: "0 0 0 2px rgba(0, 100, 225, 0.15)",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {/* [+] button next to component tags (Image 1, Image 5) */}
                        {templateComponents.length > 0 && templateComponents.length < 10 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdownSection((prev) => (prev === "campaign" ? null : "campaign"));
                              setOpenSubmenu(null);
                            }}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              border: "1px solid #ced0d4",
                              background: "#ffffff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#1c1e21",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                            title="Add component"
                          >
                            <Plus size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Menu when clicking [+] or '+ Add component' */}
                      {openDropdownSection === "campaign" && (
                        <div
                          style={{
                            position: "absolute",
                            top: 130,
                            left: 20,
                            zIndex: 600,
                            background: "#ffffff",
                            border: "1px solid #ced0d4",
                            borderRadius: 8,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                            width: 230,
                            padding: "4px 0",
                          }}
                        >
                          <div
                            onClick={() => setOpenSubmenu((prev) => (prev === "fields" ? null : "fields"))}
                            style={{
                              padding: "8px 14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "0.85rem",
                              color: "#1c1e21",
                              cursor: "pointer",
                              background: openSubmenu === "fields" ? "#f0f2f5" : "transparent",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                            onMouseLeave={(e) => {
                              if (openSubmenu !== "fields") e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <span>Campaign fields</span>
                            <ChevronRight size={14} color="#65676b" />
                          </div>

                          <div
                            onClick={() => handleAddComponent("campaign", "open_text", "Open text field", "Open text field")}
                            style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Open text field
                          </div>

                          <div
                            onClick={() => handleAddComponent("campaign", "custom_field", "Custom field", "Custom field")}
                            style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Custom field
                          </div>

                          <div style={{ borderTop: "1px solid #e4e6eb", margin: "4px 0" }} />

                          <div
                            onClick={() => setOpenSubmenu((prev) => (prev === "existing" ? null : "existing"))}
                            style={{
                              padding: "8px 14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "0.85rem",
                              color: "#1c1e21",
                              cursor: "pointer",
                              background: openSubmenu === "existing" ? "#f0f2f5" : "transparent",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                            onMouseLeave={(e) => {
                              if (openSubmenu !== "existing") e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <span>Use existing template</span>
                            <ChevronRight size={14} color="#65676b" />
                          </div>

                          {/* Submenu: Campaign fields */}
                          {openSubmenu === "fields" && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 234,
                                zIndex: 601,
                                background: "#ffffff",
                                border: "1px solid #ced0d4",
                                borderRadius: 8,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                width: 230,
                                padding: "4px 0",
                              }}
                            >
                              {[
                                { id: "cbo", label: "Advantage+ campaign budget", defaultVal: "CBO on" },
                                { id: "objective", label: "Objective", defaultVal: "Reach" },
                                { id: "campaign_id", label: "Campaign ID", defaultVal: "campaign_group_id" },
                              ].map((f) => (
                                <div
                                  key={f.id}
                                  onClick={() => handleAddComponent("campaign", f.id, f.label, f.defaultVal)}
                                  style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#1c1e21", cursor: "pointer" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                  {f.label}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Submenu: Existing template presets */}
                          {openSubmenu === "existing" && (
                            <div
                              style={{
                                position: "absolute",
                                top: 40,
                                left: 234,
                                zIndex: 601,
                                background: "#ffffff",
                                border: "1px solid #ced0d4",
                                borderRadius: 8,
                                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                width: 220,
                                padding: "4px 0",
                              }}
                            >
                              <div
                                onClick={() => handleApplyPresetTemplate("campaign", 1)}
                                style={{ padding: "8px 14px", fontSize: "0.84rem", color: "#1c1e21", cursor: "pointer" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                <div style={{ fontWeight: 600 }}>Custom template 1</div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Objective</div>
                              </div>
                              <div
                                onClick={() => handleApplyPresetTemplate("campaign", 2)}
                                style={{ padding: "8px 14px", fontSize: "0.84rem", color: "#1c1e21", cursor: "pointer" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                <div style={{ fontWeight: 600 }}>Custom template 2</div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Campaign ID</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Field separator, Item separator & Preview ONLY when components exist (Image 1 vs Image 3) */}
                      {templateComponents.length > 0 && (
                        <>
                          {/* Field separator */}
                          <div style={{ marginTop: 16 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                              Field separator
                            </label>
                            <select
                              value={fieldSeparator}
                              onChange={(e) => setFieldSeparator(e.target.value)}
                              style={{
                                width: "100%",
                                height: 38,
                                padding: "0 12px",
                                borderRadius: 6,
                                border: "1px solid #ced0d4",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                                outline: "none",
                                cursor: "pointer",
                              }}
                            >
                              {FIELD_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Item separator */}
                          <div style={{ marginTop: 14 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                              Item separator
                            </label>
                            <select
                              value={itemSeparator}
                              onChange={(e) => setItemSeparator(e.target.value)}
                              style={{
                                width: "100%",
                                height: 38,
                                padding: "0 12px",
                                borderRadius: 6,
                                border: "1px solid #ced0d4",
                                fontSize: "0.88rem",
                                background: "#ffffff",
                                color: "#1c1e21",
                                outline: "none",
                                cursor: "pointer",
                              }}
                            >
                              {ITEM_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Preview */}
                          <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#65676b", marginBottom: 4 }}>
                              Preview
                            </div>
                            <div style={{ fontSize: "0.92rem", color: "#1c1e21", minHeight: 22, wordBreak: "break-all" }}>
                              {previewTemplateName}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Action buttons (Image 1, Image 3): Cancel & Save */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setCampaignEditingMode(false);
                            setEditingCompId(null);
                          }}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCampaignTemplate}
                          style={{
                            padding: "8px 22px",
                            borderRadius: 6,
                            border: "none",
                            background: "#0064e1",
                            color: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#0056c7")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── COLLAPSED VIEW: Image 2 ── */
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 28 }}>
                        {templateComponents.length === 0 ? (
                          <span style={{ fontSize: "0.86rem", color: "#8d949e" }}>No template configured</span>
                        ) : (
                          templateComponents.map((comp) => (
                            <div
                              key={comp.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#ffffff",
                                border: "1px solid #ced0d4",
                                borderRadius: 6,
                                padding: "6px 14px",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                color: "#1c1e21",
                              }}
                            >
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: 3,
                                  background: "#1c1e21",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#ffffff",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  lineHeight: 1,
                                  letterSpacing: "-0.5px",
                                  flexShrink: 0,
                                }}
                              >
                                Aa
                              </div>
                              <span>{comp.label}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Edit Button on bottom-right (Image 2) */}
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setCampaignEditingMode(true)}
                          style={{
                            padding: "6px 20px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── SECTION 2: AD SET NAME ── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #ced0d4",
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    position: "relative",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                    }}
                  >
                    Ad set name
                  </h3>

                  {!adsetEditingMode && !isAdsetTemplateActive ? (
                    /* Initial centered Create button (Image 1, Image 2) */
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px 0 6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setAdsetEditingMode(true);
                          if (adsetTemplateComponents.length === 0) {
                            handleAddComponent("adset", "open_text", "Open text field", adsetName || "New Engagement Ad set");
                          }
                        }}
                        style={{
                          padding: "6px 24px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Create
                      </button>
                    </div>
                  ) : adsetEditingMode ? (
                    /* Ad set template builder */
                    <div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                        Template
                      </div>

                      <div
                        style={{
                          border: "1px solid #ced0d4",
                          borderRadius: 6,
                          padding: "12px 14px",
                          background: "#ffffff",
                          minHeight: 76,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 10,
                          position: "relative",
                        }}
                      >
                        {adsetTemplateComponents.length === 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => setOpenDropdownSection((prev) => (prev === "adset" ? null : "adset"))}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 6,
                                border: "1px solid #ced0d4",
                                background: "#ffffff",
                                color: "#1c1e21",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Plus size={15} color="#1c1e21" strokeWidth={2} />
                              <span>Add component</span>
                            </button>
                          </div>
                        ) : (
                          adsetTemplateComponents.map((comp) => {
                            const isEditing = editingCompId === comp.id;
                            return (
                              <div key={comp.id} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "#ffffff",
                                    border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                    borderRadius: 6,
                                    padding: isEditing ? "0 0 0 10px" : "0 6px 0 10px",
                                    height: 34,
                                    fontSize: "0.85rem",
                                    color: "#1c1e21",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 3,
                                      background: "#1c1e21",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#ffffff",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Aa
                                  </div>
                                  <span>{comp.label}</span>
                                  {!isEditing ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditing(comp)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
                                        title="Edit"
                                      >
                                        <Edit2 size={13} strokeWidth={2} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveComponent("adset", comp.id)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
                                        title="Delete"
                                      >
                                        <Trash2 size={13} strokeWidth={2} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", height: "100%", marginLeft: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditing("adset", comp.id)}
                                        style={{ background: "#0064e1", border: "none", cursor: "pointer", width: 32, height: 34, color: "#ffffff" }}
                                        title="Save"
                                      >
                                        <Check size={16} strokeWidth={2.5} color="#ffffff" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCompId(null)}
                                        style={{ background: "#ffffff", border: "none", cursor: "pointer", width: 30, height: 34 }}
                                        title="Cancel"
                                      >
                                        <X size={16} strokeWidth={2} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isEditing && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute",
                                      top: "calc(100% + 8px)",
                                      left: 0,
                                      zIndex: 500,
                                      background: "#ffffff",
                                      border: "1px solid #ced0d4",
                                      borderRadius: 8,
                                      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.16)",
                                      width: 320,
                                      padding: "16px",
                                    }}
                                  >
                                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1c1e21", marginBottom: 10 }}>
                                      {comp.label}
                                    </div>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCompValue}
                                      onChange={(e) => setEditingCompValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEditing("adset", comp.id);
                                        if (e.key === "Escape") setEditingCompId(null);
                                      }}
                                      style={{
                                        width: "100%",
                                        height: 38,
                                        padding: "0 12px",
                                        borderRadius: 6,
                                        border: "1.5px solid #0064e1",
                                        fontSize: "0.9rem",
                                        outline: "none",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {adsetTemplateComponents.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setOpenDropdownSection((prev) => (prev === "adset" ? null : "adset"))}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              border: "1px solid #ced0d4",
                              background: "#ffffff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Add component"
                          >
                            <Plus size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {adsetTemplateComponents.length > 0 && (
                        <>
                          <div style={{ marginTop: 16 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                              Field separator
                            </label>
                            <select
                              value={adsetFieldSeparator}
                              onChange={(e) => setAdsetFieldSeparator(e.target.value)}
                              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #ced0d4" }}
                            >
                              {FIELD_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginTop: 14 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                              Item separator
                            </label>
                            <select
                              value={adsetItemSeparator}
                              onChange={(e) => setAdsetItemSeparator(e.target.value)}
                              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #ced0d4" }}
                            >
                              {ITEM_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#65676b", marginBottom: 4 }}>
                              Preview
                            </div>
                            <div style={{ fontSize: "0.92rem", color: "#1c1e21", minHeight: 22 }}>
                              {previewAdsetName}
                            </div>
                          </div>
                        </>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                        <button
                          type="button"
                          onClick={() => setAdsetEditingMode(false)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAdsetTemplate}
                          style={{
                            padding: "8px 22px",
                            borderRadius: 6,
                            border: "none",
                            background: "#0064e1",
                            color: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Collapsed view */
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 28 }}>
                        {adsetTemplateComponents.map((comp) => (
                          <div
                            key={comp.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 6,
                              padding: "6px 14px",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                            }}
                          >
                            <span>{comp.label}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setAdsetEditingMode(true)}
                          style={{
                            padding: "6px 20px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── SECTION 3: AD NAME ── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #ced0d4",
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    position: "relative",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "#1c1e21",
                    }}
                  >
                    Ad name
                  </h3>

                  {!adEditingMode && !isAdTemplateActive ? (
                    /* Initial centered Create button (Image 1, Image 2) */
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px 0 6px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setAdEditingMode(true);
                          if (adTemplateComponents.length === 0) {
                            handleAddComponent("ad", "open_text", "Open text field", adName || "New Engagement Ad");
                          }
                        }}
                        style={{
                          padding: "6px 24px",
                          borderRadius: 6,
                          border: "1px solid #ced0d4",
                          background: "#ffffff",
                          color: "#1c1e21",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        Create
                      </button>
                    </div>
                  ) : adEditingMode ? (
                    /* Ad template builder */
                    <div>
                      <div style={{ fontSize: "0.82rem", color: "#65676b", fontWeight: 500, marginBottom: 8 }}>
                        Template
                      </div>

                      <div
                        style={{
                          border: "1px solid #ced0d4",
                          borderRadius: 6,
                          padding: "12px 14px",
                          background: "#ffffff",
                          minHeight: 76,
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 10,
                          position: "relative",
                        }}
                      >
                        {adTemplateComponents.length === 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => setOpenDropdownSection((prev) => (prev === "ad" ? null : "ad"))}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 6,
                                border: "1px solid #ced0d4",
                                background: "#ffffff",
                                color: "#1c1e21",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Plus size={15} color="#1c1e21" strokeWidth={2} />
                              <span>Add component</span>
                            </button>
                          </div>
                        ) : (
                          adTemplateComponents.map((comp) => {
                            const isEditing = editingCompId === comp.id;
                            return (
                              <div key={comp.id} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "#ffffff",
                                    border: isEditing ? "1px solid #0064e1" : "1px solid #ced0d4",
                                    borderRadius: 6,
                                    padding: isEditing ? "0 0 0 10px" : "0 6px 0 10px",
                                    height: 34,
                                    fontSize: "0.85rem",
                                    color: "#1c1e21",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 18,
                                      height: 18,
                                      borderRadius: 3,
                                      background: "#1c1e21",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#ffffff",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Aa
                                  </div>
                                  <span>{comp.label}</span>
                                  {!isEditing ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 2 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditing(comp)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
                                        title="Edit"
                                      >
                                        <Edit2 size={13} strokeWidth={2} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveComponent("ad", comp.id)}
                                        style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px" }}
                                        title="Delete"
                                      >
                                        <Trash2 size={13} strokeWidth={2} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", height: "100%", marginLeft: 6 }}>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditing("ad", comp.id)}
                                        style={{ background: "#0064e1", border: "none", cursor: "pointer", width: 32, height: 34, color: "#ffffff" }}
                                        title="Save"
                                      >
                                        <Check size={16} strokeWidth={2.5} color="#ffffff" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCompId(null)}
                                        style={{ background: "#ffffff", border: "none", cursor: "pointer", width: 30, height: 34 }}
                                        title="Cancel"
                                      >
                                        <X size={16} strokeWidth={2} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isEditing && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: "absolute",
                                      top: "calc(100% + 8px)",
                                      left: 0,
                                      zIndex: 500,
                                      background: "#ffffff",
                                      border: "1px solid #ced0d4",
                                      borderRadius: 8,
                                      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.16)",
                                      width: 320,
                                      padding: "16px",
                                    }}
                                  >
                                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1c1e21", marginBottom: 10 }}>
                                      {comp.label}
                                    </div>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCompValue}
                                      onChange={(e) => setEditingCompValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEditing("ad", comp.id);
                                        if (e.key === "Escape") setEditingCompId(null);
                                      }}
                                      style={{
                                        width: "100%",
                                        height: 38,
                                        padding: "0 12px",
                                        borderRadius: 6,
                                        border: "1.5px solid #0064e1",
                                        fontSize: "0.9rem",
                                        outline: "none",
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {adTemplateComponents.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setOpenDropdownSection((prev) => (prev === "ad" ? null : "ad"))}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              border: "1px solid #ced0d4",
                              background: "#ffffff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Add component"
                          >
                            <Plus size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {adTemplateComponents.length > 0 && (
                        <>
                          <div style={{ marginTop: 16 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                              Field separator
                            </label>
                            <select
                              value={adFieldSeparator}
                              onChange={(e) => setAdFieldSeparator(e.target.value)}
                              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #ced0d4" }}
                            >
                              {FIELD_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginTop: 14 }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "#1c1e21", marginBottom: 6 }}>
                              Item separator
                            </label>
                            <select
                              value={adItemSeparator}
                              onChange={(e) => setAdItemSeparator(e.target.value)}
                              style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 6, border: "1px solid #ced0d4" }}
                            >
                              {ITEM_SEPARATOR_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#65676b", marginBottom: 4 }}>
                              Preview
                            </div>
                            <div style={{ fontSize: "0.92rem", color: "#1c1e21", minHeight: 22 }}>
                              {previewAdName}
                            </div>
                          </div>
                        </>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
                        <button
                          type="button"
                          onClick={() => setAdEditingMode(false)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAdTemplate}
                          style={{
                            padding: "8px 22px",
                            borderRadius: 6,
                            border: "none",
                            background: "#0064e1",
                            color: "#ffffff",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Collapsed view */
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 28 }}>
                        {adTemplateComponents.map((comp) => (
                          <div
                            key={comp.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              background: "#ffffff",
                              border: "1px solid #ced0d4",
                              borderRadius: 6,
                              padding: "6px 14px",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                            }}
                          >
                            <span>{comp.label}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setAdEditingMode(true)}
                          style={{
                            padding: "6px 20px",
                            borderRadius: 6,
                            border: "1px solid #ced0d4",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.88rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT COLUMN: ABOUT PANEL (Image 1) ── */}
              <div
                style={{
                  flex: 1,
                  maxWidth: 400,
                  position: "sticky",
                  top: 0,
                  paddingTop: 4,
                }}
              >
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#1c1e21",
                    marginBottom: 8,
                  }}
                >
                  About name templates
                </div>
                <div
                  style={{
                    fontSize: "0.86rem",
                    color: "#4b5563",
                    lineHeight: 1.55,
                  }}
                >
                  Name your campaigns, ad sets and ads consistently by creating templates based on your naming conventions. These names will update automatically to match your current campaign, ad set and ad settings.{" "}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    style={{ color: "#0064e1", textDecoration: "none", fontWeight: 600 }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
