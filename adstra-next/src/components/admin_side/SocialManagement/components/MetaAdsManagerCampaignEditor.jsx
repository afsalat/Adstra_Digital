"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
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
  if (!isOpen) return null;

  // Active level: "campaign" | "adset" | "ad"
  const [activeLevel, setActiveLevel] = useState("campaign");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // â”€â”€ Campaign Level State (Screenshot 1 & 3) â”€â”€
  const defaultObj = initialData?.objective || "Awareness";
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
  const [budgetStrategy, setBudgetStrategy] = useState("adset"); // "campaign" | "adset" (Defaulting to "adset" as in Image 1)
  const [shareBudgetEnabled, setShareBudgetEnabled] = useState(false);
  const [campaignFrequencyControlEnabled, setCampaignFrequencyControlEnabled] = useState(false);
  const [budgetType, setBudgetType] = useState("daily"); // "daily" | "lifetime"
  const [budgetAmount, setBudgetAmount] = useState(1000);
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

  // â”€â”€ Ad Set Level State (Screenshot 2) â”€â”€
  const [adsetName, setAdsetName] = useState(
    initialData?.adsetName || `New ${defaultObj} Ad set`
  );
  const [mobileAppStore, setMobileAppStore] = useState("Google Play Store");
  const [appNameQuery, setAppNameQuery] = useState("");
  const [countryAvailabilityChecked, setCountryAvailabilityChecked] = useState(false);
  const [performanceGoal, setPerformanceGoal] = useState("Maximise number of app installs");
  const [showEstimatedAudienceSize, setShowEstimatedAudienceSize] = useState(false);
  const [startDate, setStartDate] = useState("2026-09-30");
  const [startTime, setStartTime] = useState("10:45");
  const [endDateEnabled, setEndDateEnabled] = useState(false);
  const [endDate, setEndDate] = useState("2026-10-30");
  const [targetLocation, setTargetLocation] = useState("India");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState("65+");
  const [targetGender, setTargetGender] = useState("All");
  const [placementsType, setPlacementsType] = useState("advantage"); // "advantage" | "manual"

  // â”€â”€ Ad Level State (Screenshot 3) â”€â”€
  const [adName, setAdName] = useState(
    initialData?.adName || `New ${defaultObj} Ad`
  );
  const [partnershipAdEnabled, setPartnershipAdEnabled] = useState(false);
  const [facebookPageConnected, setFacebookPageConnected] = useState(false);
  const [facebookPage, setFacebookPage] = useState("Adstra Digital");
  const [instagramAccount, setInstagramAccount] = useState("@adstradigital");
  const [facebookPageModalOpen, setFacebookPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("Adstra Digital");
  const [newPageCategory, setNewPageCategory] = useState("Marketing Agency");

  const [adFormat, setAdFormat] = useState("single");
  const [primaryText, setPrimaryText] = useState(
    "Grow your mobile presence with high-performing Meta app install campaigns managed by industry specialists. Reach engaged users and boost daily retention."
  );
  const [headline, setHeadline] = useState("Download & Experience the Future");
  const [descriptionText, setDescriptionText] = useState("Free install available on Google Play.");
  const [callToAction, setCallToAction] = useState("See details");
  const [websiteUrl, setWebsiteUrl] = useState("https://play.google.com/store/apps");
  const [selectedCreativeUrl, setSelectedCreativeUrl] = useState(PRESET_CREATIVES[0].url);
  const [adPreviewEnabled, setAdPreviewEnabled] = useState(true);
  const [adPreviewMode, setAdPreviewMode] = useState("empty"); // "empty" (screenshot 3) | "feed"

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
      if (!initialData.campaignName) {
        setCampaignName(`New ${initialData.objective} Campaign`);
        setAdsetName(`New ${initialData.objective} Ad set`);
        setAdName(`New ${initialData.objective} Ad`);
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
      {/* â”€â”€ TOP NAV BAR (Exact match to Screenshots 1, 2, 3) â”€â”€ */}
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
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
                {campaignName || "New App promotion Campaign"}
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
                maxWidth: 220,
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
              <span>
                {activeLevel === "campaign" ? "1 Ad set" : adsetName || "New App promotion Ad set"}
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
                maxWidth: 220,
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
              <span>
                {activeLevel === "ad" ? adName || "New App promotion Ad" : "1 Ad"}
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

      {/* â”€â”€ WORKSPACE BODY: Sidebar + Main Content â”€â”€ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* â”€â”€ LEFT TREE NAVIGATION RAIL (Screenshots 1, 2, 3) â”€â”€ */}
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
                    {campaignName || "New App promotion Campaign"}
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
                    {adsetName || "New App promotion Ad set"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MoreHorizontal size={14} color="#8a8d91" />
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
                    {adName || "New App promotion Ad"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MoreHorizontal size={14} color="#8a8d91" />
                  <MetaStatusHalfCircleIcon size={14} />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* â”€â”€ MAIN CONTENT AREA â”€â”€ */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 28px 80px 28px",
            background: "#f0f2f5",
          }}
        >
          <div style={{ maxWidth: 1120, margin: "0 auto" }}>
            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                1. CAMPAIGN LEVEL VIEW (Matches Screenshot 1 exactly)
               â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            {activeLevel === "campaign" && (
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Left Column: Form Cards */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* â”€â”€ CARD 1: Campaign name (Screenshot 1) â”€â”€ */}
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
                        <button
                          type="button"
                          onClick={() => {
                            setCampaignEditingMode(false);
                            setTemplateModalOpen(true);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#0064e1",
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                        >
                          Edit template
                        </button>
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

                  {/* â”€â”€ CARD 2: Campaign details (Screenshot 1) â”€â”€ */}
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

                    {/* Campaign objective â€” Meta style: label only + info alert (matching Image 1) */}
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

                      {/* Radio list â€” full objectives */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                        {OBJECTIVES_LIST.map((item) => {
                          const IconComp = item.icon;
                          const isSelected = objective === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setObjective(item.id);
                                if (campaignName.startsWith("New ")) {
                                  setCampaignName(`New ${item.id} campaign`);
                                  setAdsetName(`New ${item.id} ad set`);
                                  setAdName(`New ${item.id} ad`);
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
                              placeholder="e.g. â‚¹50,000"
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

                  {/* â”€â”€ CARD 3: Budget (Advantage+ on) (Matching Image 1) â”€â”€ */}
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
                            <span style={{ padding: "8px 10px", color: "#475569", fontSize: "0.9rem", fontWeight: 600, background: "#f8fafc", borderRight: "1px solid #e2e8f0" }}>â‚¹</span>
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
                          We'll spend around â‚¹{formattedBudget} per day. Your maximum daily spend is â‚¹{maxDailySpend} and your maximum weekly spend is â‚¹{maxWeeklySpend}.{" "}
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

                  {/* â”€â”€ CARD 4: Campaign frequency control (Matching Image 1) â”€â”€ */}
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

                  {/* â”€â”€ CARD 5: A/B test (Matching Image 1 & Image 2) â”€â”€ */}
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

                  {/* â”€â”€ CARD 6: Special Ad Categories (Matching Image 1 & Image 2) â”€â”€ */}
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
                          <span>âœ¦ Advantage+ app campaign</span>
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

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                2. AD SET LEVEL VIEW (Matches Screenshot 2 exactly)
               â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            {activeLevel === "adset" && (
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Left Column: Form Cards */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Card 1: Ad set name */}
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
                        placeholder="Enter ad set name"
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
                      >
                        Create template
                      </button>
                    </div>
                  </div>

                  {/* Card 2: App promotion (Screenshot 2) */}
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
                        App promotion
                      </h2>
                    </div>

                    {/* Mobile app store */}
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

                    {/* App name search */}
                    <div style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 4,
                        }}
                      >
                        App name
                      </label>
                      <div style={{ position: "relative" }}>
                        <Search
                          size={16}
                          color="#65676b"
                          style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        />
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
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        marginBottom: 16,
                      }}
                    >
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
                      <div
                        style={{
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 4,
                        }}
                      >
                        Performance goal
                      </div>
                      <div style={{ fontSize: "0.86rem", color: "#1c1e21" }}>
                        Maximise number of app installs
                      </div>
                    </div>

                    {/* Callout box (Screenshot 2) */}
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
                          To reach people who may drive higher in-app ad value, choose Maximise value
                          of conversions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Budget & schedule */}
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            marginBottom: 4,
                          }}
                        >
                          Start date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            marginBottom: 4,
                          }}
                        >
                          Start time
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.88rem",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Audience controls */}
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

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <label
                          style={{
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          Locations
                        </label>
                        <input
                          type="text"
                          value={targetLocation}
                          onChange={(e) => setTargetLocation(e.target.value)}
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label
                            style={{
                              fontSize: "0.84rem",
                              fontWeight: 700,
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            Age range
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              value={ageMin}
                              onChange={(e) => setAgeMin(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: "0.88rem",
                              }}
                            />
                            <span>to</span>
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
                            }}
                          >
                            Gender
                          </label>
                          <select
                            value={targetGender}
                            onChange={(e) => setTargetGender(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.88rem",
                              background: "#ffffff",
                            }}
                          >
                            <option value="All">All genders</option>
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Placements */}
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
                        Placements
                      </h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <label
                        style={{
                          padding: "10px 14px",
                          borderRadius: 6,
                          border:
                            placementsType === "advantage"
                              ? "1.5px solid #0064e1"
                              : "1px solid #cbd5e1",
                          background: placementsType === "advantage" ? "#f0f7ff" : "#ffffff",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="placements"
                          checked={placementsType === "advantage"}
                          onChange={() => setPlacementsType("advantage")}
                          style={{ marginTop: 2, accentColor: "#0064e1" }}
                        />
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                            Advantage+ placements (recommended)
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            Maximize budget and help show your ads to more people across Facebook,
                            Instagram, Audience Network and Messenger.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Campaign score + Audience definition (Screenshot 2) */}
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
                  {/* Campaign score card */}
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
                          <span>âœ¦ Advantage+ app campaign</span>
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

                  {/* Audience definition card (Screenshot 2) */}
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

                    <div style={{ fontSize: "0.84rem", color: "#1c1e21", fontWeight: 550, marginBottom: 6 }}>
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
                          marginTop: 10,
                          padding: "10px 12px",
                          borderRadius: 6,
                          background: "#f8fafc",
                          fontSize: "0.8rem",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div>
                          <strong>Estimated audience size:</strong> 28,500,000 â€“ 33,500,000
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <strong>Estimated daily results:</strong> Reach 14K â€“ 41K â€¢ Installs 180 â€“
                          520
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                3. AD LEVEL VIEW (Matches Screenshot 3 exactly)
               â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            {activeLevel === "ad" && (
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Left Column: Form Cards */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Card 1: Ad name */}
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
                        Ad name
                      </h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="text"
                        value={adName}
                        onChange={(e) => setAdName(e.target.value)}
                        placeholder="Enter ad name"
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
                      >
                        Create template
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Partnership ad (Screenshot 3) */}
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
                      Run ads with creators, brands and other businesses. These ads leverage signals
                      from both profiles to improve campaign performance.{" "}
                      <a
                        href="#about-partnership"
                        onClick={(e) => e.preventDefault()}
                        style={{ color: "#0064e1", textDecoration: "none", fontWeight: 500 }}
                      >
                        About partnership ads
                      </a>
                    </div>
                  </div>

                  {/* Card 3: Identity (Screenshot 3) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "18px 22px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <MetaIdentityIcon size={18} />
                      <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1c1e21" }}>
                        Identity
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.84rem", color: "#475569", marginBottom: 16 }}>
                      The profiles and app that will be used in your ad.
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: "0.86rem",
                          fontWeight: 700,
                          color: "#1c1e21",
                          marginBottom: 8,
                        }}
                      >
                        <span>* Facebook Page</span>
                        <Info size={13} color="#65676b" />
                      </div>

                      {/* Callout box (Screenshot 3) */}
                      <div
                        style={{
                          background: "#f0f7ff",
                          border: "1px solid #cce3fd",
                          borderRadius: 6,
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          marginBottom: 14,
                        }}
                      >
                        <Info size={16} color="#0064e1" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div style={{ fontSize: "0.82rem", color: "#1c1e21", lineHeight: 1.45 }}>
                          A Facebook Page is required to run ads. If no Page is available, create one
                          below. If your Page is not loading, wait a moment and refresh.
                        </div>
                      </div>

                      {/* If Facebook Page is connected */}
                      {facebookPageConnected ? (
                        <div
                          style={{
                            padding: "10px 14px",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            background: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "#0064e1",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                              }}
                            >
                              {facebookPage.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1c1e21" }}>
                                {facebookPage}
                              </div>
                              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                Connected Facebook Page
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFacebookPageModalOpen(true)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#0064e1",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Switch Page
                          </button>
                        </div>
                      ) : (
                        /* Button: Create Page (Screenshot 3) */
                        <button
                          type="button"
                          onClick={() => setFacebookPageModalOpen(true)}
                          style={{
                            padding: "8px 18px",
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
                          Create Page
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Ad Setup & Creative */}
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
                        Ad creative
                      </h2>
                    </div>

                    {/* Media selector */}
                    <div style={{ marginBottom: 14 }}>
                      <label
                        style={{
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Select Media
                      </label>
                      <div style={{ display: "flex", gap: 10 }}>
                        {PRESET_CREATIVES.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedCreativeUrl(c.url);
                              setAdPreviewMode("feed");
                            }}
                            style={{
                              width: 72,
                              height: 72,
                              borderRadius: 6,
                              overflow: "hidden",
                              cursor: "pointer",
                              border:
                                selectedCreativeUrl === c.url
                                  ? "2.5px solid #0064e1"
                                  : "1px solid #cbd5e1",
                              position: "relative",
                            }}
                          >
                            <img
                              src={c.url}
                              alt={c.label}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            {selectedCreativeUrl === c.url && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 3,
                                  right: 3,
                                  background: "#0064e1",
                                  color: "#fff",
                                  borderRadius: "50%",
                                  width: 16,
                                  height: 16,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Primary text */}
                    <div style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Primary text
                      </label>
                      <textarea
                        rows={3}
                        value={primaryText}
                        onChange={(e) => setPrimaryText(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.86rem",
                          boxSizing: "border-box",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* Headline */}
                    <div style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Headline
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.86rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Call to action (Defaults to "See details" matching Screenshot 1 note!) */}
                    <div style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Call to action
                      </label>
                      <select
                        value={callToAction}
                        onChange={(e) => setCallToAction(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: "0.86rem",
                          background: "#ffffff",
                        }}
                      >
                        <option value="See details">See details (Recommended)</option>
                        <option value="Install now">Install now</option>
                        <option value="Download">Download</option>
                        <option value="Learn more">Learn more</option>
                        <option value="Play game">Play game</option>
                        <option value="Use app">Use app</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Campaign score + Ad preview (Screenshot 3) */}
                <div
                  style={{
                    width: 330,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    position: "sticky",
                    top: 16,
                  }}
                >
                  {/* Campaign score card with dropdown arrow (Screenshot 3) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      padding: "16px 20px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
                          <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: 2 }}>
                            You're using our recommended setup.
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={18} color="#65676b" style={{ cursor: "pointer" }} />
                    </div>
                  </div>

                  {/* Ad preview card (Screenshot 3) */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e4e6eb",
                      overflow: "hidden",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    {/* Header Row (Screenshot 3) */}
                    <div
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid #f0f2f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Left: Ad preview toggle switch */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          role="switch"
                          aria-checked={adPreviewEnabled}
                          onClick={() => setAdPreviewEnabled((prev) => !prev)}
                          style={{
                            width: 32,
                            height: 18,
                            borderRadius: 9,
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
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: "#ffffff",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 650, color: "#1c1e21" }}>
                          Ad preview
                        </span>
                      </div>

                      {/* Right icons: Review defaults, Expand, Share (Screenshot 3) */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() =>
                            setAdPreviewMode((prev) => (prev === "empty" ? "feed" : "empty"))
                          }
                          title="Toggle between Empty illustration and Live preview"
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#1c1e21",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {adPreviewMode === "empty" ? "View live" : "Review defaults"}
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: 5,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "#65676b",
                          }}
                        >
                          <Maximize2 size={14} />
                        </button>
                        <button
                          type="button"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 2,
                            padding: 5,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "#65676b",
                          }}
                        >
                          <Share2 size={14} />
                          <ChevronDown size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Preview Body */}
                    {adPreviewEnabled ? (
                      adPreviewMode === "empty" ? (
                        /* Exact Meta Graphic Placeholder matching Screenshot 3 */
                        <MetaEmptyPreviewIllustration />
                      ) : (
                        /* Live Feed Post Preview */
                        <div style={{ padding: "14px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 10,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background: "#0064e1",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {facebookPage.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#050505" }}>
                                  {facebookPage}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.74rem",
                                    color: "#65676b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <span>Sponsored</span> â€¢ <Globe size={11} />
                                </div>
                              </div>
                            </div>
                            <MoreHorizontal size={16} color="#65676b" />
                          </div>

                          <div
                            style={{
                              fontSize: "0.84rem",
                              color: "#050505",
                              lineHeight: 1.4,
                              marginBottom: 10,
                            }}
                          >
                            {primaryText}
                          </div>

                          <div
                            style={{
                              width: "100%",
                              height: 180,
                              borderRadius: 6,
                              overflow: "hidden",
                              background: "#f0f2f5",
                              marginBottom: 10,
                            }}
                          >
                            <img
                              src={selectedCreativeUrl}
                              alt="Creative"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>

                          <div
                            style={{
                              background: "#f0f2f5",
                              padding: "8px 12px",
                              borderRadius: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <div style={{ overflow: "hidden" }}>
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#65676b",
                                  textTransform: "uppercase",
                                }}
                              >
                                PLAY.GOOGLE.COM
                              </div>
                              <div
                                style={{
                                  fontSize: "0.86rem",
                                  fontWeight: 700,
                                  color: "#050505",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {headline}
                              </div>
                            </div>

                            <button
                              type="button"
                              style={{
                                padding: "6px 14px",
                                borderRadius: 6,
                                background: "#0064e1",
                                color: "#ffffff",
                                border: "none",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {callToAction}
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div style={{ padding: 40, textAlign: "center", color: "#65676b", fontSize: "0.85rem" }}>
                        Preview is turned off
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* â”€â”€ BOTTOM STICKY ACTION BAR (Screenshots 1, 2, 3) â”€â”€ */}
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

      {/* â”€â”€ CREATE FACEBOOK PAGE MODAL â”€â”€ */}
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
