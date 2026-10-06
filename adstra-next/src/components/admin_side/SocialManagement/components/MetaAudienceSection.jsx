"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import "./MetaAudienceSection.css";
import {
  MetaLogoIcon,
  GoogleAdsLogoIcon,
  LinkedInLogoIcon,
} from "./PlatformIcons";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Filter,
  Sliders,
  Info,
  ArrowUpDown,
  ArrowDown,
  Folder,
  Tag,
  AlertTriangle,
  Rocket,
  Check,
  CheckCircle2,
  Copy,
  X,
  ExternalLink,
  Users,
  Target,
  Bookmark,
  Sparkles,
  Globe,
  RefreshCw,
  MoreHorizontal,
  Layers,
  HelpCircle,
  Building2,
} from "lucide-react";

// Exact Meta Ads Manager Customer Sub-Labels / Fields (Images 1, 2, 3)
export const CUSTOMER_SUB_LABELS = [
  {
    id: "high_value",
    label: "High value",
    desc: "Customers that you consider valuable to your business.",
  },
  {
    id: "low_value",
    label: "Low value",
    desc: "Customers who are of low or negative value to your business.",
  },
  {
    id: "at_risk",
    label: "At risk",
    desc: "Customers who are showing signs of disengaging or churning.",
  },
  {
    id: "disengaged",
    label: "Disengaged",
    desc: "Customers who have not made a purchase recently or stopped subscribing.",
  },
  {
    id: "general_customers",
    label: "General customers",
    desc: "Your existing customers.",
  },
];

// Exact Meta Ads Manager Filter Dropdown Hierarchy (Images 1, 2, 3)
const FILTER_HIERARCHY = {
  root: {
    title: "",
    items: [
      { id: "labels", label: "Labels", hasChildren: true },
      { id: "type", label: "Type", hasChildren: true },
      { id: "source", label: "Source", hasChildren: true },
      { id: "status", label: "Status", hasChildren: true },
    ],
  },
  labels: {
    title: "Labels",
    parent: "root",
    items: [
      {
        id: "customers",
        label: "Customers",
        desc: "Audiences that have made a purchase from your business.",
        hasChildren: true,
        filterCategory: "labels",
        filterValue: "group-customers",
      },
      {
        id: "engaged",
        label: "Engaged audiences",
        desc: "Audiences that have expressed interest in your business.",
        hasChildren: true,
        filterCategory: "labels",
        filterValue: "group-engaged",
      },
      {
        id: "other",
        label: "Other audiences",
        desc: "Audiences that don't fit into the other label groups.",
        hasChildren: true,
        filterCategory: "labels",
        filterValue: "group-other",
      },
    ],
  },
  customers: {
    title: "Customers",
    parent: "labels",
    items: CUSTOMER_SUB_LABELS.map((item) => ({
      id: item.id,
      label: item.label,
      desc: item.desc,
      filterCategory: "subLabels",
      filterValue: item.id,
    })),
  },
  engaged: {
    title: "Engaged audiences",
    parent: "labels",
    items: [
      {
        id: "qualified_leads",
        label: "Qualified leads",
        desc: "Leads that meet your qualification criteria.",
        filterCategory: "subLabels",
        filterValue: "qualified_leads",
      },
      {
        id: "disqualified_leads",
        label: "Disqualified leads",
        desc: "Leads that don't meet your qualification criteria.",
        filterCategory: "subLabels",
        filterValue: "disqualified_leads",
      },
      {
        id: "app_users",
        label: "App users",
        desc: "People that are currently using your app.",
        filterCategory: "subLabels",
        filterValue: "app_users",
      },
      {
        id: "trial_users",
        label: "Trial users",
        desc: "People who started a trial of your product.",
        filterCategory: "subLabels",
        filterValue: "trial_users",
      },
      {
        id: "other_engaged_users",
        label: "Other engaged users",
        desc: "People that showed interest, but are not customers.",
        filterCategory: "subLabels",
        filterValue: "other_engaged_users",
      },
    ],
  },
  other: {
    title: "Other audiences",
    parent: "labels",
    items: [
      {
        id: "other_1",
        label: "Other 1",
        desc: "Audiences that don't fit into the other labels.",
        filterCategory: "subLabels",
        filterValue: "other_1",
      },
      {
        id: "other_2",
        label: "Other 2",
        desc: "Audiences that don't fit into the other labels.",
        filterCategory: "subLabels",
        filterValue: "other_2",
      },
      {
        id: "other_3",
        label: "Other 3",
        desc: "Audiences that don't fit into the other labels.",
        filterCategory: "subLabels",
        filterValue: "other_3",
      },
    ],
  },
  type: {
    title: "Type",
    parent: "root",
    items: [
      {
        id: "custom",
        label: "Custom audience",
        desc: "",
        filterCategory: "types",
        filterValue: "Custom Audience",
      },
      {
        id: "lookalike",
        label: "Lookalike",
        desc: "",
        filterCategory: "types",
        filterValue: "Lookalike Audience",
      },
      {
        id: "saved",
        label: "Saved audience",
        desc: "",
        filterCategory: "types",
        filterValue: "Saved Audience",
      },
    ],
  },
  source: {
    title: "Source",
    parent: "root",
    items: [
      {
        id: "website",
        label: "Website",
        desc: "Meta Pixel and Conversions API events on your site.",
        filterCategory: "sources",
        filterValue: "website",
      },
      {
        id: "customer_list",
        label: "Customer list",
        desc: "Uploaded customer information like email addresses or phone numbers.",
        filterCategory: "sources",
        filterValue: "customer_list",
      },
      {
        id: "video",
        label: "Video",
        desc: "People who watched your video content on Facebook or Instagram.",
        filterCategory: "sources",
        filterValue: "video",
      },
      {
        id: "page",
        label: "Page",
        desc: "People who engaged with your Facebook Page.",
        filterCategory: "sources",
        filterValue: "page",
      },
      {
        id: "lead_ad",
        label: "Lead ad",
        desc: "People who opened or submitted an instant lead form.",
        filterCategory: "sources",
        filterValue: "lead_ad",
      },
      {
        id: "instagram_business_profile",
        label: "Instagram business profile",
        desc: "People who engaged with your Instagram business profile.",
        filterCategory: "sources",
        filterValue: "instagram_business_profile",
      },
      {
        id: "offline_events",
        label: "Offline events",
        desc: "In-store purchases and offline interactions.",
        filterCategory: "sources",
        filterValue: "offline_events",
      },
      {
        id: "facebook_event",
        label: "Facebook event",
        desc: "People who responded to or interacted with your Facebook event.",
        filterCategory: "sources",
        filterValue: "facebook_event",
      },
      {
        id: "mobile_app",
        label: "Mobile app",
        desc: "Actions taken in your mobile app.",
        filterCategory: "sources",
        filterValue: "mobile_app",
      },
      {
        id: "shopping",
        label: "Shopping",
        desc: "People who interacted with your Facebook or Instagram shop.",
        filterCategory: "sources",
        filterValue: "shopping",
      },
      {
        id: "catalogue",
        label: "Catalogue",
        desc: "People who viewed or interacted with your product catalogue.",
        filterCategory: "sources",
        filterValue: "catalogue",
      },
      {
        id: "augmented_reality",
        label: "Augmented reality",
        desc: "People who used your augmented reality experience.",
        filterCategory: "sources",
        filterValue: "augmented_reality",
      },
    ],
  },
  status: {
    title: "Status",
    parent: "root",
    items: [
      {
        id: "ready",
        label: "Ready",
        filterCategory: "statuses",
        filterValue: "ready",
      },
      {
        id: "populating",
        label: "Populating",
        filterCategory: "statuses",
        filterValue: "populating",
      },
      {
        id: "outdated",
        label: "Outdated",
        filterCategory: "statuses",
        filterValue: "outdated",
      },
      {
        id: "expiring",
        label: "Expiring",
        filterCategory: "statuses",
        filterValue: "expiring",
      },
    ],
  },
};

// Default Initial Audience Groups and Data strictly matching Meta Ads Manager format
const INITIAL_AUDIENCES_DATA = [
  // Customers group items
  {
    id: "aud-cust-1",
    name: "Past Customers CSV (High LTV > ₹5000)",
    groupId: "group-customers",
    type: "Custom Audience",
    typeLabel: "Customer list",
    subLabel: "high_value",
    subLabelTitle: "High value",
    sourceType: "customer_list",
    estimatedSize: "24,000 - 28,000",
    matchScore: "High",
    matchScoreLevel: "high",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 22, 2026",
    rawDate: "2026-09-22",
    sharing: "Not shared",
    audienceId: "1405144991823901",
    source: "Customer list upload",
    activeInAds: true,
    actionNeeded: false,
  },
  {
    id: "aud-cust-2",
    name: "CRM Leads Verified (Last 180 Days)",
    groupId: "group-customers",
    type: "Custom Audience",
    typeLabel: "Customer list",
    subLabel: "general_customers",
    subLabelTitle: "General customers",
    sourceType: "customer_list",
    estimatedSize: "18,500 - 21,000",
    matchScore: "High",
    matchScoreLevel: "high",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 14, 2026",
    rawDate: "2026-09-14",
    sharing: "Shared with 1 account",
    audienceId: "1405144991823902",
    source: "CRM API sync",
    activeInAds: true,
    actionNeeded: false,
  },

  // Engaged audiences group items
  {
    id: "aud-eng-1",
    name: "Instagram Account Engagers (90 Days)",
    groupId: "group-engaged",
    type: "Custom Audience",
    typeLabel: "Instagram account",
    subLabel: "qualified_leads",
    sourceType: "instagram",
    estimatedSize: "142,000 - 158,000",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 27, 2026",
    rawDate: "2026-09-27",
    sharing: "Not shared",
    audienceId: "1405144991823903",
    source: "Instagram Professional Profile",
    activeInAds: true,
    actionNeeded: false,
  },
  {
    id: "aud-eng-2",
    name: "Video Viewers 75%+ (All Promo Reels)",
    groupId: "group-engaged",
    type: "Custom Audience",
    typeLabel: "Video",
    subLabel: "app_users",
    sourceType: "video",
    estimatedSize: "88,000 - 98,000",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 18, 2026",
    rawDate: "2026-09-18",
    sharing: "Not shared",
    audienceId: "1405144991823904",
    source: "Facebook & Instagram Reels",
    activeInAds: false,
    actionNeeded: false,
  },
  {
    id: "aud-eng-3",
    name: "Facebook Page Post Engagers (30 Days)",
    groupId: "group-engaged",
    type: "Custom Audience",
    typeLabel: "Facebook Page",
    subLabel: "other_engaged_users",
    sourceType: "facebook",
    estimatedSize: "< 1,000",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Audience too small",
    statusType: "warning",
    dateCreated: "Sep 05, 2026",
    rawDate: "2026-09-05",
    sharing: "Not shared",
    audienceId: "1405144991823905",
    source: "Facebook Page",
    activeInAds: false,
    actionNeeded: true,
  },

  // Other audiences group items
  {
    id: "aud-oth-1",
    name: "Website Visitors - All Pages (30 Days)",
    groupId: "group-other",
    type: "Custom Audience",
    typeLabel: "Website",
    subLabel: "other_1",
    sourceType: "website",
    estimatedSize: "320,000 - 360,000",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 28, 2026",
    rawDate: "2026-09-28",
    sharing: "Shared with 2 accounts",
    audienceId: "1405144991823906",
    source: "Meta Pixel: 4892019482",
    activeInAds: true,
    actionNeeded: false,
  },
  {
    id: "aud-oth-2",
    name: "Cart Abandoners (14 Days, No Purchase)",
    groupId: "group-other",
    type: "Custom Audience",
    typeLabel: "Website",
    subLabel: "other_2",
    sourceType: "website",
    estimatedSize: "14,500 - 16,800",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Updating",
    statusType: "updating",
    dateCreated: "Sep 25, 2026",
    rawDate: "2026-09-25",
    sharing: "Not shared",
    audienceId: "1405144991823907",
    source: "Meta Pixel: 4892019482",
    activeInAds: true,
    actionNeeded: false,
  },

  // Unlabelled audiences group items
  // Intentionally starts empty to match the user's screenshot ("No audiences in this group")!

  // Lookalikes group items
  {
    id: "aud-lal-1",
    name: "Lookalike (IN, 1%) - Past Customers CSV",
    groupId: "group-lookalikes",
    type: "Lookalike Audience",
    typeLabel: "Lookalikes",
    subLabel: "high_value",
    sourceType: "customer_list",
    estimatedSize: "3,200,000 - 3,800,000",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 26, 2026",
    rawDate: "2026-09-26",
    sharing: "Not shared",
    audienceId: "1405144991823908",
    source: "Source: Past Customers CSV",
    activeInAds: true,
    actionNeeded: false,
  },
  {
    id: "aud-lal-2",
    name: "Lookalike (IN, 2%) - Instagram Engagers",
    groupId: "group-lookalikes",
    type: "Lookalike Audience",
    typeLabel: "Lookalikes",
    subLabel: "qualified_leads",
    sourceType: "instagram",
    estimatedSize: "6,400,000 - 7,200,000",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 20, 2026",
    rawDate: "2026-09-20",
    sharing: "Not shared",
    audienceId: "1405144991823909",
    source: "Source: Instagram Account Engagers",
    activeInAds: false,
    actionNeeded: false,
  },

  // Saved audiences group items
  {
    id: "aud-sav-1",
    name: "Kerala & Bangalore - B2B Business Decision Makers 25-50",
    groupId: "group-saved",
    type: "Saved Audience",
    typeLabel: "Saved audiences",
    subLabel: "other_1",
    sourceType: "saved",
    estimatedSize: "1,200,000 - 1,400,000",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 24, 2026",
    rawDate: "2026-09-24",
    sharing: "Not shared",
    audienceId: "1405144991823910",
    source: "Demographics & Interests targeting",
    activeInAds: true,
    actionNeeded: false,
  },
  {
    id: "aud-sav-2",
    name: "Pan-India Online Shoppers & Fashion Enthusiasts 20-35",
    groupId: "group-saved",
    type: "Saved Audience",
    typeLabel: "Saved audiences",
    subLabel: "other_2",
    sourceType: "saved",
    estimatedSize: "12,800,000 - 14,200,000",
    matchScore: "—",
    matchScoreLevel: "none",
    status: "Ready",
    statusType: "ready",
    dateCreated: "Sep 10, 2026",
    rawDate: "2026-09-10",
    sharing: "Not shared",
    audienceId: "1405144991823911",
    source: "Interest targeting (E-commerce)",
    activeInAds: false,
    actionNeeded: false,
  },
];

// Definition of the 6 authentic label groups from user's screenshot
const AUDIENCE_GROUPS = [
  {
    id: "group-customers",
    title: "Customers",
    type: "Label group",
    estimated: "—",
    defaultExpanded: false,
  },
  {
    id: "group-engaged",
    title: "Engaged audiences",
    type: "Label group",
    estimated: "—",
    defaultExpanded: false,
  },
  {
    id: "group-other",
    title: "Other audiences",
    type: "Label group",
    estimated: "—",
    defaultExpanded: false,
  },
  {
    id: "group-unlabelled",
    title: "Unlabelled audiences",
    type: "Custom audiences",
    estimated: "",
    defaultExpanded: true, // Expanded by default in the user's screenshot!
  },
  {
    id: "group-lookalikes",
    title: "Lookalikes",
    type: "Lookalikes",
    estimated: "",
    defaultExpanded: false,
  },
  {
    id: "group-saved",
    title: "Saved audiences",
    type: "Saved audiences",
    estimated: "",
    defaultExpanded: false,
  },
];

// Official Ad Platform Radios (Image 2)
export const AD_PLATFORMS = [
  {
    id: "meta",
    label: "Meta Ads",
    Icon: MetaLogoIcon,
  },
  {
    id: "google",
    label: "Google Ads",
    Icon: GoogleAdsLogoIcon,
  },
  {
    id: "linkedin",
    label: "LinkedIn Ads",
    Icon: LinkedInLogoIcon,
  },
];

// Initial Google Ads Audience Segments
export const INITIAL_GOOGLE_AUDIENCES = [
  {
    id: "g-aud-1",
    name: "High-Value Purchasers (LTV > $500)",
    type: "Customer Match",
    status: "Eligible",
    searchSize: "24,000",
    youtubeSize: "21,000",
    displaySize: "18,500",
    gmailSize: "22,000",
    dateCreated: "Oct 01, 2026",
    audienceId: "8491029381",
    category: "customer_match",
  },
  {
    id: "g-aud-2",
    name: "Website Converters - Past 90 Days",
    type: "Website visitors",
    status: "Eligible",
    searchSize: "42,000",
    youtubeSize: "36,000",
    displaySize: "31,000",
    gmailSize: "38,000",
    dateCreated: "Sep 15, 2026",
    audienceId: "8491029382",
    category: "website",
  },
  {
    id: "g-aud-3",
    name: "All Website Visitors (Past 30 Days)",
    type: "Website visitors",
    status: "Eligible",
    searchSize: "142,000",
    youtubeSize: "98,000",
    displaySize: "125,000",
    gmailSize: "115,000",
    dateCreated: "Sep 01, 2026",
    audienceId: "8491029383",
    category: "website",
  },
  {
    id: "g-aud-4",
    name: "Cart Abandoners (14 Days)",
    type: "Website visitors",
    status: "Eligible",
    searchSize: "12,400",
    youtubeSize: "9,200",
    displaySize: "10,800",
    gmailSize: "11,100",
    dateCreated: "Sep 20, 2026",
    audienceId: "8491029384",
    category: "website",
  },
  {
    id: "g-aud-5",
    name: "Similar to High-Value Purchasers",
    type: "Similar segment",
    status: "Eligible",
    searchSize: "450,000",
    youtubeSize: "310,000",
    displaySize: "380,000",
    gmailSize: "390,000",
    dateCreated: "Sep 28, 2026",
    audienceId: "8491029385",
    category: "similar",
  },
  {
    id: "g-aud-6",
    name: "Newsletter Subscribers & Leads",
    type: "Customer Match",
    status: "Populating",
    searchSize: "8,900",
    youtubeSize: "6,800",
    displaySize: "7,200",
    gmailSize: "8,100",
    dateCreated: "Oct 04, 2026",
    audienceId: "8491029386",
    category: "customer_match",
  },
];

// Initial LinkedIn Matched Audiences
export const INITIAL_LINKEDIN_AUDIENCES = [
  {
    id: "li-aud-1",
    name: "Fortune 500 Enterprise Target Accounts",
    type: "Company list",
    source: "CSV Upload",
    status: "Ready",
    size: "14,200",
    matchRate: "84%",
    dateCreated: "Oct 02, 2026",
    audienceId: "918273645",
    category: "company",
  },
  {
    id: "li-aud-2",
    name: "VP & C-Suite Tech Executives",
    type: "Contact list",
    source: "HubSpot CRM Sync",
    status: "Ready",
    size: "8,700",
    matchRate: "78%",
    dateCreated: "Sep 28, 2026",
    audienceId: "918273646",
    category: "contact",
  },
  {
    id: "li-aud-3",
    name: "All Website Visitors - 90 Days",
    type: "Website retargeting",
    source: "LinkedIn Insight Tag",
    status: "Ready",
    size: "56,000",
    matchRate: "96%",
    dateCreated: "Sep 10, 2026",
    audienceId: "918273647",
    category: "website",
  },
  {
    id: "li-aud-4",
    name: "Product Pricing Page Drop-offs",
    type: "Website retargeting",
    source: "LinkedIn Insight Tag",
    status: "Ready",
    size: "4,300",
    matchRate: "92%",
    dateCreated: "Oct 03, 2026",
    audienceId: "918273648",
    category: "website",
  },
  {
    id: "li-aud-5",
    name: "Lookalike - High Intent Decision Makers",
    type: "Lookalike audience",
    source: "Algorithm",
    status: "Building",
    size: "~35,000",
    matchRate: "—",
    dateCreated: "Oct 05, 2026",
    audienceId: "918273649",
    category: "lookalike",
  },
];

export default function MetaAudienceSection({
  clients = [],
  selectedClientId = "all",
  campaigns = [],
}) {
  // Platform selection state: 'meta' | 'google' | 'linkedin' (defaults to 'meta')
  const [selectedPlatform, setSelectedPlatform] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("audience_selected_platform");
        if (saved && ["meta", "google", "linkedin"].includes(saved)) return saved;
      } catch (e) {
        // ignore
      }
    }
    return "meta";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("audience_selected_platform", selectedPlatform);
      } catch (e) {
        // ignore
      }
    }
  }, [selectedPlatform]);

  // Google Ads Audiences state
  const [googleAudiences, setGoogleAudiences] = useState(INITIAL_GOOGLE_AUDIENCES);
  const [googleTab, setGoogleTab] = useState("all");
  const [googleSearch, setGoogleSearch] = useState("");
  const [selectedGoogleIds, setSelectedGoogleIds] = useState([]);
  const [googleAcctOpen, setGoogleAcctOpen] = useState(false);

  // LinkedIn Matched Audiences state
  const [linkedinAudiences, setLinkedinAudiences] = useState(INITIAL_LINKEDIN_AUDIENCES);
  const [linkedinTab, setLinkedinTab] = useState("all");
  const [linkedinSearch, setLinkedinSearch] = useState("");
  const [selectedLinkedinIds, setSelectedLinkedinIds] = useState([]);
  const [linkedinAcctOpen, setLinkedinAcctOpen] = useState(false);

  const filteredGoogleAudiences = useMemo(() => {
    return googleAudiences.filter((item) => {
      if (googleTab !== "all" && item.category !== googleTab) return false;
      if (googleSearch.trim()) {
        const q = googleSearch.toLowerCase();
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.type.toLowerCase().includes(q) &&
          !item.audienceId.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [googleAudiences, googleTab, googleSearch]);

  const filteredLinkedinAudiences = useMemo(() => {
    return linkedinAudiences.filter((item) => {
      if (linkedinTab !== "all" && item.category !== linkedinTab) return false;
      if (linkedinSearch.trim()) {
        const q = linkedinSearch.toLowerCase();
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.type.toLowerCase().includes(q) &&
          !item.audienceId.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [linkedinAudiences, linkedinTab, linkedinSearch]);

  // Audiences state (with local storage persistence)
  const storageKey = `meta_audiences_list_v3_${selectedClientId}`;
  const [audiences, setAudiences] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn("Could not parse saved audiences", err);
      }
    }
    return INITIAL_AUDIENCES_DATA;
  });

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(audiences));
      } catch (e) {
        // ignore
      }
    }
  }, [audiences, storageKey]);

  // View state: 'grouped' (as in screenshot) or 'standard' (flat table)
  const [viewMode, setViewMode] = useState("grouped"); // 'grouped' | 'standard'

  // Expanded state for accordion groups
  const [expandedGroups, setExpandedGroups] = useState({
    "group-customers": false,
    "group-engaged": false,
    "group-other": false,
    "group-unlabelled": true, // Open by default as in screenshot!
    "group-lookalikes": false,
    "group-saved": false,
  });

  // Active Category Filter Tab
  const [activeTab, setActiveTab] = useState("all"); // "all" | "active_ads" | "action_needed" | "unlabelled"

  // Search input
  const [searchQuery, setSearchQuery] = useState("");

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);

  // Dropdown states
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);

  // Multi-level Meta Filter state (Images 1, 2, 3)
  const [appliedFilters, setAppliedFilters] = useState({
    labels: [],
    subLabels: [],
    types: [],
    sources: [],
    statuses: [],
  });

  const [filterView, setFilterView] = useState("root"); // "root" | "labels" | "customers" | "engaged" | "other" | "type" | "source" | "status"
  const [filterSearchText, setFilterSearchText] = useState("");

  const handleFilterBack = () => {
    const parent = FILTER_HIERARCHY[filterView]?.parent || "root";
    setFilterView(parent);
    setFilterSearchText("");
  };

  const toggleFilterItem = (category, value) => {
    if (!category || !value) return;
    setAppliedFilters((prev) => {
      const currentList = prev[category] || [];
      const updated = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];
      return {
        ...prev,
        [category]: updated,
      };
    });
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({
      labels: [],
      subLabels: [],
      types: [],
      sources: [],
      statuses: [],
    });
    setFilterSearchText("");
    showToast("All filters cleared");
  };

  const activeFilterCount = useMemo(() => {
    return (
      (appliedFilters.labels?.length || 0) +
      (appliedFilters.subLabels?.length || 0) +
      (appliedFilters.types?.length || 0) +
      (appliedFilters.sources?.length || 0) +
      (appliedFilters.statuses?.length || 0)
    );
  }, [appliedFilters]);

  // Current items in filter dropdown filtered by filterSearchText
  const displayedFilterItems = useMemo(() => {
    const currentConfig = FILTER_HIERARCHY[filterView];
    if (!currentConfig || !currentConfig.items) return [];
    if (!filterSearchText.trim()) return currentConfig.items;
    const q = filterSearchText.toLowerCase().trim();
    return currentConfig.items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q))
    );
  }, [filterView, filterSearchText]);

  // Columns visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    matchScore: true,
    estimatedAudienceSize: true,
    status: true,
    dateCreated: true,
    sharing: true,
    audienceId: true,
  });

  // Modals state
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [lookalikeModalOpen, setLookalikeModalOpen] = useState(false);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [singleDeleteAudience, setSingleDeleteAudience] = useState(null);
  const [deleteSelectionModalList, setDeleteSelectionModalList] = useState([]);
  const [drawerAudience, setDrawerAudience] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Click outside listener for dropdowns
  const createDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const columnsDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (createDropdownRef.current && !createDropdownRef.current.contains(e.target)) {
        setCreateDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
        setFilterView("root");
        setFilterSearchText("");
      }
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(e.target)) {
        setColumnsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Selected client company representation for Meta account header
  const currentClientName = useMemo(() => {
    if (selectedClientId === "all") return "Adstra Digital Agency";
    const found = clients.find((c) => String(c.id) === String(selectedClientId));
    return found ? found.name : "Adstra Digital";
  }, [clients, selectedClientId]);

  const activeAccountId = "1405144991733037";

  // Filtered audiences based on active tab, search, and multi-level Meta filters
  const filteredAudiences = useMemo(() => {
    return audiences.filter((aud) => {
      // 1. Tab filter
      if (activeTab === "active_ads" && !aud.activeInAds) return false;
      if (activeTab === "action_needed" && !aud.actionNeeded) return false;
      if (activeTab === "unlabelled" && aud.groupId !== "group-unlabelled") return false;

      // 2. Labels filter (Customers, Engaged, Other)
      if (appliedFilters.labels.length > 0 && !appliedFilters.labels.includes(aud.groupId)) {
        return false;
      }

      // 3. Sub-labels filter (High value, Low value, At risk, Disengaged, etc.)
      if (appliedFilters.subLabels.length > 0 && !appliedFilters.subLabels.includes(aud.subLabel)) {
        return false;
      }

      // 4. Type filter (Custom, Lookalike, Saved, Special)
      if (
        appliedFilters.types.length > 0 &&
        !appliedFilters.types.some((t) => aud.type.toLowerCase().includes(t.toLowerCase()))
      ) {
        return false;
      }

      // 5. Source filter (website, customer_list, instagram, video, etc.)
      if (appliedFilters.sources.length > 0 && !appliedFilters.sources.includes(aud.sourceType)) {
        return false;
      }

      // 6. Status filter (ready, updating, populating, warning)
      if (appliedFilters.statuses.length > 0 && !appliedFilters.statuses.includes(aud.statusType)) {
        return false;
      }

      // 7. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = aud.name.toLowerCase().includes(q);
        const matchType = aud.type.toLowerCase().includes(q);
        const matchId = aud.audienceId.includes(q);
        const matchEst = (aud.estimatedSize || "").toLowerCase().includes(q);
        if (!matchName && !matchType && !matchId && !matchEst) return false;
      }

      return true;
    });
  }, [audiences, activeTab, appliedFilters, searchQuery]);

  // Grouped Audiences Map
  const audiencesByGroup = useMemo(() => {
    const map = {};
    AUDIENCE_GROUPS.forEach((g) => {
      map[g.id] = [];
    });
    filteredAudiences.forEach((aud) => {
      if (map[aud.groupId]) {
        map[aud.groupId].push(aud);
      } else {
        // Fallback to unlabelled
        if (!map["group-unlabelled"]) map["group-unlabelled"] = [];
        map["group-unlabelled"].push(aud);
      }
    });
    return map;
  }, [filteredAudiences]);

  // Toggle group accordion
  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Master Select All / Deselect All
  const allFilteredIds = useMemo(() => {
    return filteredAudiences.map((a) => a.id);
  }, [filteredAudiences]);

  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));
  const isPartiallySelected = allFilteredIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all items in a group
  const handleToggleSelectGroup = (groupId) => {
    const groupItems = audiencesByGroup[groupId] || [];
    const itemIds = groupItems.map((i) => i.id);
    const areAllInGroupSelected = itemIds.length > 0 && itemIds.every((id) => selectedIds.includes(id));

    if (areAllInGroupSelected) {
      setSelectedIds((prev) => prev.filter((id) => !itemIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  // Delete action: works whether 1, multiple, or 0 are selected
  const handleDeleteSelected = () => {
    if (audiences.length === 0) {
      showToast("No audiences available to delete.");
      return;
    }
    setSingleDeleteAudience(null);
    if (selectedIds.length === 0) {
      // Default to the first visible audience if none checked
      const firstId = filteredAudiences[0]?.id || audiences[0]?.id;
      setDeleteSelectionModalList(firstId ? [firstId] : []);
    } else {
      setDeleteSelectionModalList([...selectedIds]);
    }
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = (customIdsToDelete = null) => {
    if (singleDeleteAudience) {
      setAudiences((prev) => prev.filter((aud) => aud.id !== singleDeleteAudience.id));
      setSelectedIds((prev) => prev.filter((id) => id !== singleDeleteAudience.id));
      showToast(`Deleted audience "${singleDeleteAudience.name}"`);
      setSingleDeleteAudience(null);
      setDeleteConfirmOpen(false);
      return;
    }

    const toDelete = customIdsToDelete || (selectedIds.length > 0 ? selectedIds : deleteSelectionModalList);
    if (!toDelete || toDelete.length === 0) {
      showToast("Please select at least one audience to delete.");
      return;
    }

    setAudiences((prev) => prev.filter((aud) => !toDelete.includes(aud.id)));
    const count = toDelete.length;
    setSelectedIds((prev) => prev.filter((id) => !toDelete.includes(id)));
    setDeleteSelectionModalList([]);
    setDeleteConfirmOpen(false);
    showToast(`Deleted ${count} audience${count > 1 ? "s" : ""}`);
  };

  // Copy Audience ID to clipboard
  const handleCopyId = (idStr, e) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(idStr);
      showToast(`Copied Audience ID: ${idStr}`);
    }
  };

  // Handle Edit: works whether 1, multiple, or 0 are selected
  const handleEditSelected = () => {
    if (audiences.length === 0) {
      showToast("No audiences available to edit. Please create one first.");
      return;
    }
    let target = null;
    if (selectedIds.length >= 1) {
      target = audiences.find((a) => a.id === selectedIds[0]);
    }
    if (!target) {
      target = filteredAudiences[0] || audiences[0];
    }
    if (target) {
      setEditModalData({ ...target });
    }
  };

  // Add new audience
  const handleAddAudience = (newAud) => {
    const genId = `aud-${Date.now()}`;
    const genAudienceId = String(Math.floor(1000000000000000 + Math.random() * 9000000000000000));
    const now = new Date();
    const dateCreated = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const rawDate = now.toISOString().split("T")[0];

    const completeAud = {
      id: genId,
      audienceId: genAudienceId,
      dateCreated,
      rawDate,
      sharing: "Not shared",
      status: "Ready",
      statusType: "ready",
      matchScore: newAud.type.includes("Customer") ? "High" : "—",
      matchScoreLevel: newAud.type.includes("Customer") ? "high" : "none",
      activeInAds: false,
      actionNeeded: false,
      ...newAud,
    };

    setAudiences((prev) => [completeAud, ...prev]);

    // Ensure the group is expanded so the user sees their new audience!
    if (completeAud.groupId) {
      setExpandedGroups((prev) => ({
        ...prev,
        [completeAud.groupId]: true,
      }));
    }

    showToast(`Audience "${completeAud.name}" created successfully`);
  };

  // Save edited audience
  const handleSaveEditedAudience = (updated) => {
    setAudiences((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
    setEditModalData(null);
    showToast(`Audience "${updated.name}" updated`);
  };

  return (
    <div className="meta-aud-root">
      {/* --------------------------------------------------------------------
          0. Brand Platform Selector Bar (Image 2: Meta Ads, Google Ads, LinkedIn Ads)
          -------------------------------------------------------------------- */}
      <div className="audience-platform-selector-bar">
        <div
          role="radiogroup"
          aria-label="Ad Platform Selection"
          className="audience-platform-radiogroup"
        >
          {AD_PLATFORMS.map((platform) => {
            const isChecked = selectedPlatform === platform.id;
            return (
              <label
                key={platform.id}
                className={`audience-platform-radio-item ${isChecked ? "active" : ""}`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <input
                  type="radio"
                  name="audience_ad_platform"
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
                <span className="audience-platform-radio-circle">
                  {isChecked && <span className="audience-platform-radio-dot" />}
                </span>
                <span className="audience-platform-radio-icon">
                  {platform.Icon && (
                    <platform.Icon size={platform.id === "meta" ? 18 : 17} />
                  )}
                </span>
                <span className="audience-platform-radio-label">
                  {platform.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------
          META ADS AUDIENCE VIEW (Image 1 Content)
          -------------------------------------------------------------------- */}
      {selectedPlatform === "meta" && (
        <>
          {/* --------------------------------------------------------------------
              1. Top Header Bar (Meta Logo, Title, Account Selector, View Switcher)
              -------------------------------------------------------------------- */}
          <div className="meta-aud-top-header">
        <div className="meta-aud-header-left">
          <div className="meta-aud-logo-wrap" title="Meta Ads Manager">
            <MetaLogoIcon size={26} />
          </div>
          <h2 className="meta-aud-title">Audience</h2>

          {/* Account Selector Dropdown */}
          <div className="meta-aud-acct-pill-wrapper" ref={accountDropdownRef}>
            <button
              type="button"
              className="meta-aud-acct-pill"
              onClick={() => setAccountDropdownOpen((prev) => !prev)}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#65676b" strokeWidth={2}>
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span className="meta-aud-acct-pill-id">
                {activeAccountId} ({activeAccountId.slice(0, 10)}... - {currentClientName})
              </span>
              <ChevronDown size={14} color="#65676b" />
            </button>

            {accountDropdownOpen && (
              <div className="meta-aud-acct-dropdown">
                <div className="meta-aud-acct-dropdown-header">Select Ad Account</div>
                <div
                  className="meta-aud-acct-item active"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{currentClientName}</div>
                    <div style={{ fontSize: "0.74rem", color: "#65676b" }}>ID: {activeAccountId}</div>
                  </div>
                  <Check size={16} color="#0064e1" />
                </div>
                {clients.slice(0, 5).map((cl) => (
                  <div
                    key={cl.id}
                    className="meta-aud-acct-item"
                    onClick={() => {
                      setAccountDropdownOpen(false);
                      showToast(`Switched account context to ${cl.name}`);
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{cl.name}</div>
                      <div style={{ fontSize: "0.74rem", color: "#65676b" }}>
                        ID: {cl.id ? `140514499182${cl.id}` : "1405144991823901"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="meta-aud-header-right">
          <button
            type="button"
            className="meta-aud-switch-view-btn"
            onClick={() => {
              const nextMode = viewMode === "grouped" ? "standard" : "grouped";
              setViewMode(nextMode);
              showToast(
                nextMode === "grouped"
                  ? "Switched to grouped audience view"
                  : "Switched to standard audience view"
              );
            }}
          >
            {viewMode === "grouped" ? "Switch to standard audience view" : "Switch to grouped audience view"}
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          2. Category Filter Pills Bar (All audiences, Active ads, Action needed, Unlabelled)
          -------------------------------------------------------------------- */}
      <div className="meta-aud-tabs-bar">
        <button
          type="button"
          className={`meta-aud-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <Folder size={15} />
          <span>All audiences</span>
          <span className="meta-aud-tab-badge">{audiences.length}</span>
        </button>

        <button
          type="button"
          className={`meta-aud-tab-btn ${activeTab === "active_ads" ? "active" : ""}`}
          onClick={() => setActiveTab("active_ads")}
        >
          <Rocket size={15} />
          <span>Active ads</span>
          <span className="meta-aud-tab-badge">
            {audiences.filter((a) => a.activeInAds).length}
          </span>
        </button>

        <button
          type="button"
          className={`meta-aud-tab-btn ${activeTab === "action_needed" ? "active" : ""}`}
          onClick={() => setActiveTab("action_needed")}
        >
          <AlertTriangle size={15} />
          <span>Action needed</span>
          {audiences.some((a) => a.actionNeeded) && (
            <span
              className="meta-aud-tab-badge"
              style={{ background: "#ef4444", color: "#ffffff" }}
            >
              {audiences.filter((a) => a.actionNeeded).length}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`meta-aud-tab-btn ${activeTab === "unlabelled" ? "active" : ""}`}
          onClick={() => setActiveTab("unlabelled")}
        >
          <Tag size={15} />
          <span>Unlabelled audiences</span>
          <span className="meta-aud-tab-badge">
            {audiences.filter((a) => a.groupId === "group-unlabelled").length}
          </span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
          3. Full-width Search Bar
          -------------------------------------------------------------------- */}
      <div className="meta-aud-search-row">
        <div className="meta-aud-search-box">
          <Search size={16} className="meta-aud-search-icon" />
          <input
            type="text"
            className="meta-aud-search-input"
            placeholder="Search for name or metrics"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="meta-aud-search-clear"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------
          4. Action / Control Bar (Create Audience, Edit, Delete, Filter, Columns)
          -------------------------------------------------------------------- */}
      <div className="meta-aud-actions-bar">
        <div className="meta-aud-actions-left">
          {/* Create Audience Dropdown */}
          <div className="meta-aud-create-dropdown-wrap" ref={createDropdownRef}>
            <button
              type="button"
              className="meta-aud-btn-create-primary"
              onClick={() => setCreateDropdownOpen((prev) => !prev)}
            >
              <span>Create Audience</span>
              <ChevronDown size={15} />
            </button>

            {createDropdownOpen && (
              <div className="meta-aud-create-menu">
                <button
                  type="button"
                  className="meta-aud-create-menu-item"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    setCustomModalOpen(true);
                  }}
                >
                  <div className="meta-aud-create-item-icon">
                    <Target size={18} />
                  </div>
                  <div className="meta-aud-create-item-info">
                    <span className="meta-aud-create-item-title">Custom Audience</span>
                    <span className="meta-aud-create-item-desc">
                      Connect with people who have already shown an interest in your business or product.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="meta-aud-create-menu-item"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    setLookalikeModalOpen(true);
                  }}
                >
                  <div className="meta-aud-create-item-icon">
                    <Sparkles size={18} />
                  </div>
                  <div className="meta-aud-create-item-info">
                    <span className="meta-aud-create-item-title">Lookalike Audience</span>
                    <span className="meta-aud-create-item-desc">
                      Reach new people who are similar to audiences you already care about.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="meta-aud-create-menu-item"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    setSavedModalOpen(true);
                  }}
                >
                  <div className="meta-aud-create-item-icon">
                    <Bookmark size={18} />
                  </div>
                  <div className="meta-aud-create-item-info">
                    <span className="meta-aud-create-item-title">Saved Audience</span>
                    <span className="meta-aud-create-item-desc">
                      Save your commonly used targeting options for easy reuse across campaigns.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="meta-aud-create-menu-item"
                  onClick={() => {
                    setCreateDropdownOpen(false);
                    showToast("Special Ad Audience targeting loaded");
                    setLookalikeModalOpen(true);
                  }}
                >
                  <div className="meta-aud-create-item-icon">
                    <Users size={18} />
                  </div>
                  <div className="meta-aud-create-item-info">
                    <span className="meta-aud-create-item-title">Special Ad Audience</span>
                    <span className="meta-aud-create-item-desc">
                      Reach new people for regulated ad categories (housing, employment, credit).
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            type="button"
            className={`meta-aud-btn-icon-sec ${selectedIds.length === 1 ? "active-selection" : ""}`}
            onClick={handleEditSelected}
            title={
              selectedIds.length === 1
                ? `Edit selected audience "${audiences.find((a) => a.id === selectedIds[0])?.name || ""}"`
                : selectedIds.length > 1
                  ? `Edit audience (1 of ${selectedIds.length} selected)`
                  : "Edit audience"
            }
          >
            <Edit2 size={15} />
            <span>Edit</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            className={`meta-aud-btn-icon-sec ${selectedIds.length > 0 ? "active-danger" : ""}`}
            onClick={handleDeleteSelected}
            title={
              selectedIds.length > 0
                ? `Delete ${selectedIds.length} selected audience${selectedIds.length > 1 ? "s" : ""}`
                : "Delete audience"
            }
          >
            <Trash2 size={15} />
          </button>

          {/* Selection counter badge */}
          {selectedIds.length > 0 && (
            <div className="meta-aud-selection-pill">
              <span>{selectedIds.length} selected</span>
              <button
                type="button"
                className="meta-aud-clear-sel-btn"
                onClick={() => setSelectedIds([])}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Right side tools: Filter and Columns */}
        <div className="meta-aud-actions-right">
          {/* Filter Dropdown (Multi-level matching Meta Ads Manager Images 1, 2, 3) */}
          <div style={{ position: "relative" }} ref={filterDropdownRef}>
            <button
              type="button"
              className={`meta-aud-btn-tool ${activeFilterCount > 0 ? "meta-aud-btn-tool-active" : ""}`}
              onClick={() => {
                setFilterDropdownOpen((p) => !p);
                if (filterDropdownOpen) {
                  setFilterView("root");
                  setFilterSearchText("");
                }
              }}
            >
              <Filter size={14} />
              <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
              <ChevronDown size={13} />
            </button>

            {filterDropdownOpen && (
              <div className="meta-aud-filter-popover">
                {/* Search Input on top (Images 1, 2, 3) */}
                <div className="meta-aud-filter-search-box">
                  <Search size={15} className="meta-aud-filter-search-icon" />
                  <input
                    type="text"
                    className="meta-aud-filter-search-input"
                    placeholder="Search"
                    value={filterSearchText}
                    onChange={(e) => setFilterSearchText(e.target.value)}
                    autoFocus
                  />
                  {filterSearchText && (
                    <button
                      type="button"
                      className="meta-aud-search-clear"
                      style={{ right: 20 }}
                      onClick={() => setFilterSearchText("")}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Back navigation header (Images 2, 3) */}
                {filterView !== "root" && (
                  <button
                    type="button"
                    className="meta-aud-filter-back-row"
                    onClick={handleFilterBack}
                  >
                    <ChevronLeft size={18} strokeWidth={2.4} />
                    <span>{FILTER_HIERARCHY[filterView]?.title || "Back"}</span>
                  </button>
                )}

                {/* Menu List */}
                <div className="meta-aud-filter-menu-body">
                  {filterView === "root" ? (
                    /* Root Menu (Image 1: Labels, Type, Source, Status) */
                    displayedFilterItems.map((item) => (
                      <div
                        key={item.id}
                        className="meta-aud-filter-nav-row"
                        onClick={() => {
                          setFilterView(item.id);
                          setFilterSearchText("");
                        }}
                      >
                        <span>{item.label}</span>
                        <ChevronRight size={16} />
                      </div>
                    ))
                  ) : (
                    /* Submenu Items with Checkboxes and Descriptions (Images 2, 3) */
                    displayedFilterItems.map((item) => {
                      const isChecked = item.filterCategory
                        ? (appliedFilters[item.filterCategory] || []).includes(item.filterValue)
                        : false;

                      return (
                        <div
                          key={item.id}
                          className={`meta-aud-filter-item-row ${isChecked ? "selected" : ""}`}
                          onClick={(e) => {
                            if (item.hasChildren && !e.target.closest("input[type='checkbox']")) {
                              setFilterView(item.id);
                              setFilterSearchText("");
                            } else {
                              toggleFilterItem(item.filterCategory, item.filterValue);
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            className="meta-aud-filter-cb"
                            checked={isChecked}
                            onChange={() => toggleFilterItem(item.filterCategory, item.filterValue)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="meta-aud-filter-item-text">
                            <span className="meta-aud-filter-item-label">{item.label}</span>
                            {item.desc && item.filterCategory !== "sources" && (
                              <span className="meta-aud-filter-item-desc">{item.desc}</span>
                            )}
                          </div>
                          {item.hasChildren && (
                            <div
                              className="meta-aud-filter-item-chevron"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilterView(item.id);
                                setFilterSearchText("");
                              }}
                            >
                              <ChevronRight size={16} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {displayedFilterItems.length === 0 && (
                    <div className="meta-aud-filter-empty-search">
                      No filters match &quot;{filterSearchText}&quot;
                    </div>
                  )}
                </div>

                {/* Clear filters Footer (Images 1, 2, 3) */}
                <div className="meta-aud-filter-footer">
                  <button
                    type="button"
                    className={`meta-aud-filter-clear-btn ${activeFilterCount > 0 ? "active" : ""}`}
                    disabled={activeFilterCount === 0}
                    onClick={handleClearAllFilters}
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columns Dropdown */}
          <div style={{ position: "relative" }} ref={columnsDropdownRef}>
            <button
              type="button"
              className="meta-aud-btn-tool"
              onClick={() => setColumnsDropdownOpen((p) => !p)}
            >
              <Sliders size={14} />
              <span>Columns</span>
              <ChevronDown size={13} />
            </button>

            {columnsDropdownOpen && (
              <div className="meta-aud-tools-popover">
                <div className="meta-aud-popover-title">Toggle Columns</div>
                {(() => {
                  const COLUMN_LABELS = {
                    type: "Type",
                    matchScore: "Match score",
                    estimatedAudienceSize: "Estimated audience size",
                    status: "Status",
                    dateCreated: "Date created",
                    sharing: "Sharing",
                    audienceId: "Audience ID",
                  };
                  return Object.keys(visibleColumns).map((colKey) => (
                    <label key={colKey} className="meta-aud-popover-item">
                      <input
                        type="checkbox"
                        checked={visibleColumns[colKey]}
                        onChange={() =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [colKey]: !prev[colKey],
                          }))
                        }
                      />
                      <span>{COLUMN_LABELS[colKey] || colKey}</span>
                    </label>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          5. Audience Table (Matching the exact screenshot layout)
          -------------------------------------------------------------------- */}
      <div className="meta-aud-table-wrap">
        <table className="meta-aud-table">
          <thead>
            <tr>
              {/* Checkbox column */}
              <th className="meta-aud-th meta-aud-cb-cell">
                <input
                  type="checkbox"
                  className="meta-aud-cb-input"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={handleSelectAll}
                  title="Select all audiences"
                />
              </th>

              {/* Audiences column */}
              <th className="meta-aud-th sortable" style={{ minWidth: 260 }}>
                <span className="meta-aud-th-inner">
                  Audiences
                  <ArrowUpDown size={13} className="meta-aud-sort-icon" />
                </span>
              </th>

              {/* Type column */}
              {visibleColumns.type && (
                <th className="meta-aud-th sortable" style={{ minWidth: 140 }}>
                  <span className="meta-aud-th-inner">
                    Type
                    <ArrowUpDown size={13} className="meta-aud-sort-icon" />
                  </span>
                </th>
              )}

              {/* Estimated size column */}
              {visibleColumns.estimatedAudienceSize && (
                <th className="meta-aud-th sortable" style={{ minWidth: 150 }}>
                  <span className="meta-aud-th-inner">
                    Estimated...
                    <span
                      className="meta-aud-info-icon"
                      title="Estimated audience size: An estimate of how many people are in this audience."
                    >
                      <Info size={13} />
                    </span>
                    <ArrowUpDown size={13} className="meta-aud-sort-icon" />
                  </span>
                </th>
              )}

              {/* Match score column */}
              {visibleColumns.matchScore && (
                <th className="meta-aud-th" style={{ minWidth: 120 }}>
                  <span className="meta-aud-th-inner">
                    Match sc...
                    <span
                      className="meta-aud-info-icon"
                      title="Match score: Indicates the quality and match rate of customer identifiers."
                    >
                      <Info size={13} />
                    </span>
                  </span>
                </th>
              )}

              {/* Status column */}
              {visibleColumns.status && (
                <th className="meta-aud-th" style={{ minWidth: 110 }}>
                  <span className="meta-aud-th-inner">
                    Status
                    <span
                      className="meta-aud-info-icon"
                      title="Status: Whether the audience is ready for active targeting."
                    >
                      <Info size={13} />
                    </span>
                  </span>
                </th>
              )}

              {/* Date created column */}
              {visibleColumns.dateCreated && (
                <th className="meta-aud-th sortable" style={{ minWidth: 130 }}>
                  <span className="meta-aud-th-inner">
                    Date created
                    <ArrowDown size={13} className="meta-aud-sort-icon" style={{ color: "#0064e1" }} />
                  </span>
                </th>
              )}

              {/* Sharing column */}
              {visibleColumns.sharing && (
                <th className="meta-aud-th" style={{ minWidth: 120 }}>
                  <span>Sharing</span>
                </th>
              )}

              {/* Audience ID column */}
              {visibleColumns.audienceId && (
                <th className="meta-aud-th sortable" style={{ minWidth: 160 }}>
                  <span className="meta-aud-th-inner">
                    Audience ID
                    <ArrowUpDown size={13} className="meta-aud-sort-icon" />
                  </span>
                </th>
              )}

              {/* Actions column */}
              <th className="meta-aud-th" style={{ minWidth: 90, textAlign: "center" }}>
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {/* View Mode: Grouped (Matching the screenshot with 6 label groups) */}
            {viewMode === "grouped" ? (
              AUDIENCE_GROUPS.map((group) => {
                const groupAudiences = audiencesByGroup[group.id] || [];
                const isExpanded = !!expandedGroups[group.id];
                const groupItemIds = groupAudiences.map((a) => a.id);
                const isGroupAllSelected =
                  groupItemIds.length > 0 && groupItemIds.every((id) => selectedIds.includes(id));
                const isGroupPartiallySelected =
                  groupItemIds.some((id) => selectedIds.includes(id)) && !isGroupAllSelected;

                return (
                  <React.Fragment key={group.id}>
                    {/* Parent Label Group Accordion Row */}
                    <tr className="meta-aud-group-row">
                      {/* Checkbox */}
                      <td className="meta-aud-cb-cell">
                        <input
                          type="checkbox"
                          className="meta-aud-cb-input"
                          checked={isGroupAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isGroupPartiallySelected;
                          }}
                          onChange={() => handleToggleSelectGroup(group.id)}
                          title={`Select ${group.title}`}
                        />
                      </td>

                      {/* Group Name with chevron */}
                      <td className="meta-aud-group-cell-name">
                        <div
                          className="meta-aud-group-toggle-wrap"
                          onClick={() => toggleGroup(group.id)}
                        >
                          <button type="button" className="meta-aud-chevron-btn">
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                          <span className="meta-aud-group-title">{group.title}</span>
                          {groupAudiences.length > 0 && (
                            <span className="meta-aud-group-count-badge">
                              ({groupAudiences.length})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Group Type */}
                      {visibleColumns.type && (
                        <td className="meta-aud-td meta-aud-group-type-label">
                          {group.type}
                        </td>
                      )}

                      {/* Estimated size */}
                      {visibleColumns.estimatedAudienceSize && (
                        <td className="meta-aud-td meta-aud-group-dash">
                          {group.estimated || "—"}
                        </td>
                      )}

                      {/* Match score */}
                      {visibleColumns.matchScore && <td className="meta-aud-td" />}

                      {/* Status */}
                      {visibleColumns.status && <td className="meta-aud-td" />}

                      {/* Date created */}
                      {visibleColumns.dateCreated && <td className="meta-aud-td" />}

                      {/* Sharing */}
                      {visibleColumns.sharing && <td className="meta-aud-td" />}

                      {/* Audience ID */}
                      {visibleColumns.audienceId && <td className="meta-aud-td" />}

                      {/* Actions */}
                      <td className="meta-aud-td" />
                    </tr>

                    {/* Sub-Rows when Expanded */}
                    {isExpanded && (
                      <>
                        {groupAudiences.length === 0 ? (
                          /* Empty Group Row (matches screenshot: "No audiences in this group") */
                          <tr className="meta-aud-empty-subrow">
                            <td
                              colSpan={10}
                              className="meta-aud-empty-subcell"
                            >
                              No audiences in this group
                            </td>
                          </tr>
                        ) : (
                          /* Real Audience Item Rows */
                          groupAudiences.map((aud) => {
                            const isSelected = selectedIds.includes(aud.id);
                            return (
                              <tr
                                key={aud.id}
                                className={`meta-aud-item-row ${isSelected ? "selected" : ""}`}
                              >
                                {/* Checkbox */}
                                <td className="meta-aud-cb-cell">
                                  <input
                                    type="checkbox"
                                    className="meta-aud-cb-input"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectRow(aud.id)}
                                  />
                                </td>

                                {/* Name & details */}
                                <td className="meta-aud-td meta-aud-item-name-cell">
                                  <div className="meta-aud-item-name-wrap">
                                    <div className="meta-aud-item-title-row">
                                      <span
                                        className="meta-aud-item-name-link"
                                        onClick={() => setDrawerAudience(aud)}
                                        title="Click to view audience details"
                                      >
                                        {aud.name}
                                      </span>
                                      {aud.subLabelTitle && (
                                        <span
                                          className="meta-aud-customer-tag"
                                          title={`Customer value: ${aud.subLabelTitle}`}
                                        >
                                          {aud.subLabelTitle}
                                        </span>
                                      )}
                                    </div>
                                    {aud.source && (
                                      <span className="meta-aud-item-desc">{aud.source}</span>
                                    )}
                                  </div>
                                </td>

                                {/* Type */}
                                {visibleColumns.type && (
                                  <td className="meta-aud-td">
                                    <span className="meta-aud-type-badge">
                                      {aud.type}
                                    </span>
                                  </td>
                                )}

                                {/* Estimated Size */}
                                {visibleColumns.estimatedAudienceSize && (
                                  <td className="meta-aud-td">
                                    <span className="meta-aud-est-size">
                                      {aud.estimatedSize}
                                    </span>
                                  </td>
                                )}

                                {/* Match Score */}
                                {visibleColumns.matchScore && (
                                  <td className="meta-aud-td">
                                    {aud.matchScoreLevel === "high" ? (
                                      <span className="meta-aud-match-score">
                                        <span className="meta-aud-match-dot" />
                                        <span>{aud.matchScore}</span>
                                      </span>
                                    ) : (
                                      <span style={{ color: "#8a8d91" }}>—</span>
                                    )}
                                  </td>
                                )}

                                {/* Status */}
                                {visibleColumns.status && (
                                  <td className="meta-aud-td">
                                    <span className="meta-aud-status-pill">
                                      <span
                                        className={`meta-aud-status-dot ${aud.statusType === "updating"
                                          ? "updating"
                                          : aud.statusType === "warning"
                                            ? "warning"
                                            : ""
                                          }`}
                                      />
                                      <span>{aud.status}</span>
                                    </span>
                                  </td>
                                )}

                                {/* Date Created */}
                                {visibleColumns.dateCreated && (
                                  <td className="meta-aud-td" style={{ color: "#65676b" }}>
                                    {aud.dateCreated}
                                  </td>
                                )}

                                {/* Sharing */}
                                {visibleColumns.sharing && (
                                  <td className="meta-aud-td" style={{ color: "#65676b" }}>
                                    {aud.sharing}
                                  </td>
                                )}

                                {/* Audience ID */}
                                {visibleColumns.audienceId && (
                                  <td className="meta-aud-td">
                                    <div className="meta-aud-id-copy-cell">
                                      <span>{aud.audienceId}</span>
                                      <button
                                        type="button"
                                        className="meta-aud-copy-btn"
                                        onClick={(e) => handleCopyId(aud.audienceId, e)}
                                        title="Copy Audience ID"
                                      >
                                        <Copy size={13} />
                                      </button>
                                    </div>
                                  </td>
                                )}

                                {/* Row Actions (Edit & Delete) */}
                                <td className="meta-aud-td meta-aud-row-actions-cell">
                                  <div className="meta-aud-row-actions">
                                    <button
                                      type="button"
                                      className="meta-aud-row-action-btn edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditModalData({ ...aud });
                                      }}
                                      title="Edit this audience"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      className="meta-aud-row-action-btn delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSingleDeleteAudience(aud);
                                        setDeleteConfirmOpen(true);
                                      }}
                                      title="Delete this audience"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              /* View Mode: Standard (Flat list of audiences) */
              filteredAudiences.map((aud) => {
                const isSelected = selectedIds.includes(aud.id);
                return (
                  <tr
                    key={aud.id}
                    className={`meta-aud-item-row ${isSelected ? "selected" : ""}`}
                  >
                    <td className="meta-aud-cb-cell">
                      <input
                        type="checkbox"
                        className="meta-aud-cb-input"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(aud.id)}
                      />
                    </td>
                    <td className="meta-aud-td" style={{ paddingLeft: 14 }}>
                      <div className="meta-aud-item-name-wrap">
                        <div className="meta-aud-item-title-row">
                          <span
                            className="meta-aud-item-name-link"
                            onClick={() => setDrawerAudience(aud)}
                          >
                            {aud.name}
                          </span>
                          {aud.subLabelTitle && (
                            <span
                              className="meta-aud-customer-tag"
                              title={`Customer value: ${aud.subLabelTitle}`}
                            >
                              {aud.subLabelTitle}
                            </span>
                          )}
                        </div>
                        {aud.source && <span className="meta-aud-item-desc">{aud.source}</span>}
                      </div>
                    </td>
                    {visibleColumns.type && (
                      <td className="meta-aud-td">
                        <span className="meta-aud-type-badge">{aud.type}</span>
                      </td>
                    )}
                    {visibleColumns.estimatedAudienceSize && (
                      <td className="meta-aud-td">
                        <span className="meta-aud-est-size">{aud.estimatedSize}</span>
                      </td>
                    )}
                    {visibleColumns.matchScore && (
                      <td className="meta-aud-td">
                        {aud.matchScoreLevel === "high" ? (
                          <span className="meta-aud-match-score">
                            <span className="meta-aud-match-dot" />
                            <span>{aud.matchScore}</span>
                          </span>
                        ) : (
                          <span style={{ color: "#8a8d91" }}>—</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="meta-aud-td">
                        <span className="meta-aud-status-pill">
                          <span
                            className={`meta-aud-status-dot ${aud.statusType === "updating"
                              ? "updating"
                              : aud.statusType === "warning"
                                ? "warning"
                                : ""
                              }`}
                          />
                          <span>{aud.status}</span>
                        </span>
                      </td>
                    )}
                    {visibleColumns.dateCreated && (
                      <td className="meta-aud-td" style={{ color: "#65676b" }}>
                        {aud.dateCreated}
                      </td>
                    )}
                    {visibleColumns.sharing && (
                      <td className="meta-aud-td" style={{ color: "#65676b" }}>
                        {aud.sharing}
                      </td>
                    )}
                    {visibleColumns.audienceId && (
                      <td className="meta-aud-td">
                        <div className="meta-aud-id-copy-cell">
                          <span>{aud.audienceId}</span>
                          <button
                            type="button"
                            className="meta-aud-copy-btn"
                            onClick={(e) => handleCopyId(aud.audienceId, e)}
                            title="Copy Audience ID"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Row Actions (Edit & Delete) */}
                    <td className="meta-aud-td meta-aud-row-actions-cell">
                      <div className="meta-aud-row-actions">
                        <button
                          type="button"
                          className="meta-aud-row-action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditModalData({ ...aud });
                          }}
                          title="Edit this audience"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="meta-aud-row-action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSingleDeleteAudience(aud);
                            setDeleteConfirmOpen(true);
                          }}
                          title="Delete this audience"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --------------------------------------------------------------------
          6. Table Footer Summary
          -------------------------------------------------------------------- */}
      <div className="meta-aud-table-footer">
        <div className="meta-aud-footer-left">
          <span>
            Total audiences: <strong>{audiences.length}</strong>
          </span>
          <span>•</span>
          <span>
            Showing: <strong>{filteredAudiences.length}</strong>
          </span>
          {selectedIds.length > 0 && (
            <>
              <span>•</span>
              <span style={{ color: "#0064e1", fontWeight: 600 }}>
                {selectedIds.length} selected
              </span>
            </>
          )}
        </div>
        <div>
          <span>Account time zone: Asia/Kolkata (IST)</span>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          7. Create Custom Audience Modal
          -------------------------------------------------------------------- */}
      {customModalOpen && (
        <CreateCustomAudienceModal
          onClose={() => setCustomModalOpen(false)}
          onCreate={(aud) => {
            handleAddAudience(aud);
            setCustomModalOpen(false);
          }}
        />
      )}

      {/* --------------------------------------------------------------------
          8. Create Lookalike Audience Modal
          -------------------------------------------------------------------- */}
      {lookalikeModalOpen && (
        <CreateLookalikeAudienceModal
          existingAudiences={audiences}
          onClose={() => setLookalikeModalOpen(false)}
          onCreate={(aud) => {
            handleAddAudience(aud);
            setLookalikeModalOpen(false);
          }}
        />
      )}

      {/* --------------------------------------------------------------------
          9. Create Saved Audience Modal
          -------------------------------------------------------------------- */}
      {savedModalOpen && (
        <CreateSavedAudienceModal
          onClose={() => setSavedModalOpen(false)}
          onCreate={(aud) => {
            handleAddAudience(aud);
            setSavedModalOpen(false);
          }}
        />
      )}

      {/* --------------------------------------------------------------------
          10. Edit Audience Modal
          -------------------------------------------------------------------- */}
      {editModalData && (
        <EditAudienceModal
          audience={editModalData}
          audiences={audiences}
          onClose={() => setEditModalData(null)}
          onSave={handleSaveEditedAudience}
          onDelete={(audToDelete) => {
            setEditModalData(null);
            setSingleDeleteAudience(audToDelete);
            setDeleteConfirmOpen(true);
          }}
        />
      )}

      {/* --------------------------------------------------------------------
          11. Delete Confirmation Modal
          -------------------------------------------------------------------- */}
      {deleteConfirmOpen && (
        <div className="meta-aud-modal-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="meta-aud-modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="meta-aud-modal-header">
              <h3 className="meta-aud-modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Trash2 size={18} color="#dc2626" />
                <span>Delete Audience</span>
              </h3>
              <button
                type="button"
                className="meta-aud-modal-close-btn"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="meta-aud-modal-body">
              {singleDeleteAudience ? (
                <div>
                  <p style={{ fontSize: "0.88rem", color: "#1c1e21", lineHeight: 1.5, margin: 0 }}>
                    Are you sure you want to delete audience <strong>&quot;{singleDeleteAudience.name}&quot;</strong>?
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#65676b", marginTop: 6, margin: "6px 0 0 0" }}>
                    Audience ID: {singleDeleteAudience.audienceId} • Type: {singleDeleteAudience.type}
                  </p>
                  <p style={{ fontSize: "0.80rem", color: "#dc2626", marginTop: 8, margin: "8px 0 0 0" }}>
                    This action cannot be undone. Active ad sets using this audience may stop delivering.
                  </p>
                </div>
              ) : selectedIds.length > 0 ? (
                <div>
                  <p style={{ fontSize: "0.88rem", color: "#1c1e21", lineHeight: 1.5, margin: 0 }}>
                    Are you sure you want to delete <strong>{selectedIds.length} audience{selectedIds.length > 1 ? "s" : ""}</strong>?
                  </p>
                  <div className="meta-aud-delete-badges-list">
                    {audiences
                      .filter((a) => selectedIds.includes(a.id))
                      .map((a) => (
                        <span key={a.id} className="meta-aud-delete-pill">
                          {a.name}
                        </span>
                      ))}
                  </div>
                  <p style={{ fontSize: "0.80rem", color: "#dc2626", marginTop: 10, margin: "10px 0 0 0" }}>
                    This action cannot be undone. Active ad sets using these audiences may stop delivering.
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "0.88rem", color: "#1c1e21", lineHeight: 1.5, margin: 0 }}>
                    Select the audience(s) you would like to delete:
                  </p>
                  <div className="meta-aud-delete-list">
                    {audiences.map((aud) => {
                      const isChecked = deleteSelectionModalList.includes(aud.id);
                      return (
                        <div
                          key={aud.id}
                          className={`meta-aud-delete-item ${isChecked ? "checked" : ""}`}
                          onClick={() => {
                            setDeleteSelectionModalList((prev) =>
                              prev.includes(aud.id)
                                ? prev.filter((id) => id !== aud.id)
                                : [...prev, aud.id]
                            );
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => { }}
                            style={{ accentColor: "#dc2626", cursor: "pointer" }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: "#1c1e21", fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {aud.name}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#65676b" }}>
                              {aud.type} • ID: {aud.audienceId}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "#0064e1", fontSize: "0.78rem", cursor: "pointer", padding: 0 }}
                      onClick={() => {
                        if (deleteSelectionModalList.length === audiences.length) {
                          setDeleteSelectionModalList([]);
                        } else {
                          setDeleteSelectionModalList(audiences.map((a) => a.id));
                        }
                      }}
                    >
                      {deleteSelectionModalList.length === audiences.length ? "Deselect All" : "Select All"}
                    </button>
                    <span style={{ fontSize: "0.76rem", color: "#65676b" }}>
                      {deleteSelectionModalList.length} selected
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="meta-aud-modal-footer">
              <button
                type="button"
                className="meta-aud-btn-modal-cancel"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="meta-aud-btn-modal-submit"
                style={{ background: "#dc2626", borderColor: "#dc2626" }}
                onClick={() => confirmDelete()}
                disabled={!singleDeleteAudience && selectedIds.length === 0 && deleteSelectionModalList.length === 0}
              >
                Delete {singleDeleteAudience ? "Audience" : selectedIds.length > 0 ? `(${selectedIds.length})` : deleteSelectionModalList.length > 0 ? `(${deleteSelectionModalList.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          12. Audience Details Side Drawer
          -------------------------------------------------------------------- */}
      {drawerAudience && (
        <div className="meta-aud-drawer-overlay" onClick={() => setDrawerAudience(null)}>
          <div className="meta-aud-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="meta-aud-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MetaLogoIcon size={20} />
                <h3 style={{ fontSize: "1.02rem", fontWeight: 700, margin: 0, color: "#1c1e21" }}>
                  Audience Details
                </h3>
              </div>
              <button
                type="button"
                className="meta-aud-modal-close-btn"
                onClick={() => setDrawerAudience(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="meta-aud-drawer-body">
              <div className="meta-aud-detail-card">
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1c1e21" }}>
                  {drawerAudience.name}
                </div>
                <div style={{ fontSize: "0.80rem", color: "#65676b" }}>
                  Audience ID: {drawerAudience.audienceId}
                </div>
              </div>

              <div className="meta-aud-detail-card">
                <div className="meta-aud-detail-row">
                  <span className="meta-aud-detail-lbl">Type</span>
                  <span className="meta-aud-detail-val">{drawerAudience.type}</span>
                </div>
                <div className="meta-aud-detail-row">
                  <span className="meta-aud-detail-lbl">Estimated Size</span>
                  <span className="meta-aud-detail-val">{drawerAudience.estimatedSize}</span>
                </div>
                <div className="meta-aud-detail-row">
                  <span className="meta-aud-detail-lbl">Status</span>
                  <span className="meta-aud-detail-val" style={{ color: "#22c55e" }}>
                    {drawerAudience.status}
                  </span>
                </div>
                <div className="meta-aud-detail-row">
                  <span className="meta-aud-detail-lbl">Date Created</span>
                  <span className="meta-aud-detail-val">{drawerAudience.dateCreated}</span>
                </div>
                <div className="meta-aud-detail-row">
                  <span className="meta-aud-detail-lbl">Sharing</span>
                  <span className="meta-aud-detail-val">{drawerAudience.sharing}</span>
                </div>
                <div className="meta-aud-detail-row">
                  <span className="meta-aud-detail-lbl">Source</span>
                  <span className="meta-aud-detail-val">{drawerAudience.source || "—"}</span>
                </div>
                {drawerAudience.groupId === "group-customers" && (
                  <div className="meta-aud-detail-row">
                    <span className="meta-aud-detail-lbl">Customer Field</span>
                    <span className="meta-aud-detail-val">
                      <strong style={{ color: "#1c1e21" }}>
                        {drawerAudience.subLabelTitle ||
                          CUSTOMER_SUB_LABELS.find((s) => s.id === drawerAudience.subLabel)?.label ||
                          "General customers"}
                      </strong>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#65676b", marginTop: 2 }}>
                        {CUSTOMER_SUB_LABELS.find((s) => s.id === drawerAudience.subLabel)?.desc ||
                          "Your existing customers."}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="meta-aud-btn-modal-cancel"
                  style={{ flex: 1, textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => {
                    const toEdit = drawerAudience;
                    setDrawerAudience(null);
                    setEditModalData({ ...toEdit });
                  }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  type="button"
                  className="meta-aud-btn-modal-cancel"
                  style={{ color: "#dc2626", borderColor: "#fca5a5", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => {
                    const toDelete = drawerAudience;
                    setDrawerAudience(null);
                    setSingleDeleteAudience(toDelete);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
                <button
                  type="button"
                  className="meta-aud-btn-modal-submit"
                  style={{ flex: 1, textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => {
                    handleCopyId(drawerAudience.audienceId, { stopPropagation: () => { } });
                  }}
                >
                  <Copy size={14} /> Copy ID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* --------------------------------------------------------------------
          GOOGLE ADS AUDIENCE VIEW
          -------------------------------------------------------------------- */}
      {selectedPlatform === "google" && (
        <div className="google-aud-wrapper" style={{ width: "100%", background: "#ffffff" }}>
          {/* 1. Header Bar */}
          <div className="meta-aud-top-header">
            <div className="meta-aud-header-left">
              <div className="meta-aud-logo-wrap" title="Google Ads Manager">
                <GoogleAdsLogoIcon size={24} />
              </div>
              <h2 className="meta-aud-title">Audience Segments</h2>

              {/* Account Selector Dropdown */}
              <div className="meta-aud-acct-pill-wrapper">
                <button
                  type="button"
                  className="meta-aud-acct-pill"
                  onClick={() => setGoogleAcctOpen((prev) => !prev)}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#65676b" strokeWidth={2}>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span className="meta-aud-acct-pill-id">
                    849-231-9012 (849-231-90... - {currentClientName})
                  </span>
                  <ChevronDown size={14} color="#65676b" />
                </button>

                {googleAcctOpen && (
                  <div className="meta-aud-acct-dropdown">
                    <div className="meta-aud-acct-dropdown-header">Select Google Ads Account</div>
                    <div
                      className="meta-aud-acct-item active"
                      onClick={() => setGoogleAcctOpen(false)}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{currentClientName}</div>
                        <div style={{ fontSize: "0.74rem", color: "#65676b" }}>ID: 849-231-9012</div>
                      </div>
                      <Check size={16} color="#0064e1" />
                    </div>
                    {clients.slice(0, 4).map((cl) => (
                      <div
                        key={cl.id}
                        className="meta-aud-acct-item"
                        onClick={() => {
                          setGoogleAcctOpen(false);
                          showToast(`Switched Google Ads account to ${cl.name}`);
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>{cl.name}</div>
                          <div style={{ fontSize: "0.74rem", color: "#65676b" }}>
                            ID: 849-231-{String(cl.id).padStart(4, "0")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="meta-aud-header-right">
              <button
                type="button"
                className="meta-aud-btn-secondary"
                onClick={() => showToast("Google Ads standard view active")}
              >
                Switch to standard audience view
              </button>
            </div>
          </div>

          {/* 2. Category Filter Tabs */}
          <div className="meta-aud-tabs-bar">
            {[
              { id: "all", label: "All audience segments", count: googleAudiences.length, icon: Folder },
              { id: "customer_match", label: "Customer Match", count: googleAudiences.filter((a) => a.category === "customer_match").length, icon: Users },
              { id: "website", label: "Website Visitors", count: googleAudiences.filter((a) => a.category === "website").length, icon: Globe },
              { id: "similar", label: "Similar Segments", count: googleAudiences.filter((a) => a.category === "similar").length, icon: Sparkles },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = googleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`meta-aud-tab ${isActive ? "active" : ""}`}
                  onClick={() => setGoogleTab(tab.id)}
                >
                  <TabIcon size={14} className="meta-aud-tab-icon" />
                  <span>{tab.label}</span>
                  <span className={`meta-aud-tab-count ${isActive ? "active" : ""}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Search Box */}
          <div className="meta-aud-search-bar">
            <div className="meta-aud-search-input-wrap">
              <Search size={15} className="meta-aud-search-icon" />
              <input
                type="text"
                placeholder="Search for name or metrics"
                value={googleSearch}
                onChange={(e) => setGoogleSearch(e.target.value)}
                className="meta-aud-search-input"
              />
              {googleSearch && (
                <button
                  type="button"
                  className="meta-aud-search-clear"
                  onClick={() => setGoogleSearch("")}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* 4. Action Row */}
          <div className="meta-aud-action-row">
            <div className="meta-aud-action-left">
              <button
                type="button"
                className="meta-aud-btn-primary"
                onClick={() => showToast("Google Ads Segment builder")}
              >
                <Plus size={15} />
                <span>New Audience Segment</span>
                <ChevronDown size={14} />
              </button>

              <button
                type="button"
                className="meta-aud-btn-secondary"
                disabled={selectedGoogleIds.length !== 1}
                onClick={() => showToast("Edit segment")}
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                className="meta-aud-btn-secondary"
                disabled={selectedGoogleIds.length === 0}
                onClick={() => {
                  setGoogleAudiences((prev) => prev.filter((a) => !selectedGoogleIds.includes(a.id)));
                  setSelectedGoogleIds([]);
                  showToast("Selected segment(s) deleted");
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="meta-aud-action-right">
              <button
                type="button"
                className="meta-aud-btn-secondary"
                onClick={() => showToast("Filter segments")}
              >
                <Filter size={13} />
                <span>Filter</span>
              </button>
              <button
                type="button"
                className="meta-aud-btn-secondary"
                onClick={() => showToast("Column customization")}
              >
                <Sliders size={13} />
                <span>Columns</span>
              </button>
            </div>
          </div>

          {/* 5. Google Ads Table */}
          <div className="meta-aud-table-container">
            <table className="meta-aud-table">
              <thead>
                <tr>
                  <th style={{ width: 44, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={filteredGoogleAudiences.length > 0 && selectedGoogleIds.length === filteredGoogleAudiences.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGoogleIds(filteredGoogleAudiences.map((a) => a.id));
                        } else {
                          setSelectedGoogleIds([]);
                        }
                      }}
                      className="meta-aud-checkbox"
                    />
                  </th>
                  <th>Segment Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Search Network Size</th>
                  <th>YouTube Size</th>
                  <th>Display Size</th>
                  <th>Date Created</th>
                  <th>Segment ID</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGoogleAudiences.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
                      No Google Ads audience segments match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredGoogleAudiences.map((item) => {
                    const isSelected = selectedGoogleIds.includes(item.id);
                    return (
                      <tr key={item.id} className={isSelected ? "meta-aud-row-selected" : ""}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedGoogleIds((prev) =>
                                prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                              );
                            }}
                            className="meta-aud-checkbox"
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.name}</div>
                        </td>
                        <td>
                          <span className="meta-aud-badge-type">{item.type}</span>
                        </td>
                        <td>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: item.status === "Eligible" ? "#16a34a" : "#d97706",
                          }}>
                            <span style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: item.status === "Eligible" ? "#16a34a" : "#f59e0b",
                            }} />
                            {item.status}
                          </span>
                        </td>
                        <td>{item.searchSize}</td>
                        <td>{item.youtubeSize}</td>
                        <td>{item.displaySize}</td>
                        <td style={{ color: "#64748b", fontSize: "0.82rem" }}>{item.dateCreated}</td>
                        <td style={{ color: "#64748b", fontSize: "0.82rem", fontFamily: "monospace" }}>{item.audienceId}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="meta-aud-row-action-btn"
                            onClick={() => showToast(`Options for ${item.name}`)}
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          LINKEDIN ADS AUDIENCE VIEW
          -------------------------------------------------------------------- */}
      {selectedPlatform === "linkedin" && (
        <div className="linkedin-aud-wrapper" style={{ width: "100%", background: "#ffffff" }}>
          {/* 1. Header Bar */}
          <div className="meta-aud-top-header">
            <div className="meta-aud-header-left">
              <div className="meta-aud-logo-wrap" title="LinkedIn Campaign Manager">
                <LinkedInLogoIcon size={24} />
              </div>
              <h2 className="meta-aud-title">Matched Audiences</h2>

              {/* Account Selector Dropdown */}
              <div className="meta-aud-acct-pill-wrapper">
                <button
                  type="button"
                  className="meta-aud-acct-pill"
                  onClick={() => setLinkedinAcctOpen((prev) => !prev)}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#65676b" strokeWidth={2}>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <span className="meta-aud-acct-pill-id">
                    50918231 (509182... - {currentClientName})
                  </span>
                  <ChevronDown size={14} color="#65676b" />
                </button>

                {linkedinAcctOpen && (
                  <div className="meta-aud-acct-dropdown">
                    <div className="meta-aud-acct-dropdown-header">Select LinkedIn Ad Account</div>
                    <div
                      className="meta-aud-acct-item active"
                      onClick={() => setLinkedinAcctOpen(false)}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{currentClientName}</div>
                        <div style={{ fontSize: "0.74rem", color: "#65676b" }}>ID: 50918231</div>
                      </div>
                      <Check size={16} color="#0064e1" />
                    </div>
                    {clients.slice(0, 4).map((cl) => (
                      <div
                        key={cl.id}
                        className="meta-aud-acct-item"
                        onClick={() => {
                          setLinkedinAcctOpen(false);
                          showToast(`Switched LinkedIn account to ${cl.name}`);
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>{cl.name}</div>
                          <div style={{ fontSize: "0.74rem", color: "#65676b" }}>
                            ID: 50918{String(cl.id).padStart(3, "0")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="meta-aud-header-right">
              <button
                type="button"
                className="meta-aud-btn-secondary"
                onClick={() => showToast("LinkedIn Campaign Manager view active")}
              >
                Switch to standard audience view
              </button>
            </div>
          </div>

          {/* 2. Category Filter Tabs */}
          <div className="meta-aud-tabs-bar">
            {[
              { id: "all", label: "All audiences", count: linkedinAudiences.length, icon: Folder },
              { id: "company", label: "Company Lists", count: linkedinAudiences.filter((a) => a.category === "company").length, icon: Building2 },
              { id: "contact", label: "Contact Lists", count: linkedinAudiences.filter((a) => a.category === "contact").length, icon: Users },
              { id: "website", label: "Website Retargeting", count: linkedinAudiences.filter((a) => a.category === "website").length, icon: Globe },
              { id: "lookalike", label: "Lookalike", count: linkedinAudiences.filter((a) => a.category === "lookalike").length, icon: Sparkles },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = linkedinTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`meta-aud-tab ${isActive ? "active" : ""}`}
                  onClick={() => setLinkedinTab(tab.id)}
                >
                  <TabIcon size={14} className="meta-aud-tab-icon" />
                  <span>{tab.label}</span>
                  <span className={`meta-aud-tab-count ${isActive ? "active" : ""}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Search Box */}
          <div className="meta-aud-search-bar">
            <div className="meta-aud-search-input-wrap">
              <Search size={15} className="meta-aud-search-icon" />
              <input
                type="text"
                placeholder="Search for name or metrics"
                value={linkedinSearch}
                onChange={(e) => setLinkedinSearch(e.target.value)}
                className="meta-aud-search-input"
              />
              {linkedinSearch && (
                <button
                  type="button"
                  className="meta-aud-search-clear"
                  onClick={() => setLinkedinSearch("")}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* 4. Action Row */}
          <div className="meta-aud-action-row">
            <div className="meta-aud-action-left">
              <button
                type="button"
                className="meta-aud-btn-primary"
                style={{ background: "#0a66c2", borderColor: "#0a66c2" }}
                onClick={() => showToast("Create Matched Audience")}
              >
                <Plus size={15} />
                <span>Create Audience</span>
                <ChevronDown size={14} />
              </button>

              <button
                type="button"
                className="meta-aud-btn-secondary"
                disabled={selectedLinkedinIds.length !== 1}
                onClick={() => showToast("Edit audience")}
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                className="meta-aud-btn-secondary"
                disabled={selectedLinkedinIds.length === 0}
                onClick={() => {
                  setLinkedinAudiences((prev) => prev.filter((a) => !selectedLinkedinIds.includes(a.id)));
                  setSelectedLinkedinIds([]);
                  showToast("Selected audience(s) deleted");
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="meta-aud-action-right">
              <button
                type="button"
                className="meta-aud-btn-secondary"
                onClick={() => showToast("Filter audiences")}
              >
                <Filter size={13} />
                <span>Filter</span>
              </button>
              <button
                type="button"
                className="meta-aud-btn-secondary"
                onClick={() => showToast("Column customization")}
              >
                <Sliders size={13} />
                <span>Columns</span>
              </button>
            </div>
          </div>

          {/* 5. LinkedIn Table */}
          <div className="meta-aud-table-container">
            <table className="meta-aud-table">
              <thead>
                <tr>
                  <th style={{ width: 44, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={filteredLinkedinAudiences.length > 0 && selectedLinkedinIds.length === filteredLinkedinAudiences.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLinkedinIds(filteredLinkedinAudiences.map((a) => a.id));
                        } else {
                          setSelectedLinkedinIds([]);
                        }
                      }}
                      className="meta-aud-checkbox"
                    />
                  </th>
                  <th>Audience Name</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>30-Day Matched Size</th>
                  <th>Match Rate</th>
                  <th>Date Created</th>
                  <th>Audience ID</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinkedinAudiences.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
                      No LinkedIn matched audiences match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredLinkedinAudiences.map((item) => {
                    const isSelected = selectedLinkedinIds.includes(item.id);
                    return (
                      <tr key={item.id} className={isSelected ? "meta-aud-row-selected" : ""}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedLinkedinIds((prev) =>
                                prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                              );
                            }}
                            className="meta-aud-checkbox"
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.name}</div>
                        </td>
                        <td>
                          <span className="meta-aud-badge-type">{item.type}</span>
                        </td>
                        <td style={{ fontSize: "0.84rem", color: "#475569" }}>{item.source}</td>
                        <td>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: item.status === "Ready" ? "#16a34a" : "#d97706",
                          }}>
                            <span style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: item.status === "Ready" ? "#16a34a" : "#f59e0b",
                            }} />
                            {item.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.size}</td>
                        <td style={{ color: "#2563eb", fontWeight: 600 }}>{item.matchRate}</td>
                        <td style={{ color: "#64748b", fontSize: "0.82rem" }}>{item.dateCreated}</td>
                        <td style={{ color: "#64748b", fontSize: "0.82rem", fontFamily: "monospace" }}>{item.audienceId}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="meta-aud-row-action-btn"
                            onClick={() => showToast(`Options for ${item.name}`)}
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          13. Floating Toast Feedback
          -------------------------------------------------------------------- */}
      {toastMessage && (
        <div className="meta-aud-toast">
          <CheckCircle2 size={16} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Modal 1: Create Custom Audience
// ============================================================================
function CreateCustomAudienceModal({ onClose, onCreate }) {
  const [step, setStep] = useState(1); // 1 = select source, 2 = configure details
  const [selectedSource, setSelectedSource] = useState("website");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [retentionDays, setRetentionDays] = useState("30");
  const [targetGroup, setTargetGroup] = useState("group-other");
  const [customerSubLabel, setCustomerSubLabel] = useState("high_value");

  const sourcesList = [
    {
      id: "website",
      category: "Your Sources",
      name: "Website",
      desc: "Reach people who visited your website or took specific actions with Meta Pixel.",
      icon: <Globe size={18} />,
    },
    {
      id: "customer_list",
      category: "Your Sources",
      name: "Customer List",
      desc: "Upload a hashed CSV list of emails, phone numbers, or CRM contacts.",
      icon: <Users size={18} />,
    },
    {
      id: "app_activity",
      category: "Your Sources",
      name: "App Activity",
      desc: "Reach people who launched your app or took specific in-app actions.",
      icon: <Target size={18} />,
    },
    {
      id: "video",
      category: "Meta Sources",
      name: "Video",
      desc: "People who watched 3s, 10s, 15s, 50%, or 75% of your videos on Facebook or Instagram.",
      icon: <Sparkles size={18} />,
    },
    {
      id: "instagram",
      category: "Meta Sources",
      name: "Instagram Account",
      desc: "People who engaged with your posts, stories, reels, or profile.",
      icon: <MetaLogoIcon size={18} />,
    },
    {
      id: "lead_form",
      category: "Meta Sources",
      name: "Lead Form",
      desc: "People who opened or submitted a lead form in your ads.",
      icon: <Bookmark size={18} />,
    },
  ];

  const handleNext = () => {
    if (!name) {
      const srcObj = sourcesList.find((s) => s.id === selectedSource);
      setName(`${srcObj?.name || "Custom"} Visitors - ${retentionDays} Days`);
    }
    if (selectedSource === "customer_list") {
      setTargetGroup("group-customers");
    } else if (selectedSource === "instagram" || selectedSource === "video") {
      setTargetGroup("group-engaged");
    } else {
      setTargetGroup("group-other");
    }
    setStep(2);
  };

  const handleFinish = () => {
    const srcObj = sourcesList.find((s) => s.id === selectedSource);
    const subObj = CUSTOMER_SUB_LABELS.find((s) => s.id === customerSubLabel);
    onCreate({
      name: name || "Custom Audience",
      groupId: targetGroup,
      subLabel: targetGroup === "group-customers" ? customerSubLabel : undefined,
      subLabelTitle: targetGroup === "group-customers" ? (subObj?.label || "General customers") : undefined,
      type: "Custom Audience",
      typeLabel: srcObj?.name || "Custom",
      source: `${srcObj?.name} (${retentionDays}d retention)`,
      estimatedSize: "85,000 - 110,000",
    });
  };

  return (
    <div className="meta-aud-modal-overlay">
      <div className="meta-aud-modal-card">
        <div className="meta-aud-modal-header">
          <div className="meta-aud-modal-title-wrap">
            <div className="meta-aud-modal-icon-badge">
              <Target size={18} />
            </div>
            <h3 className="meta-aud-modal-title">
              {step === 1 ? "Choose a Custom Audience Source" : "Create a Custom Audience"}
            </h3>
          </div>
          <button type="button" className="meta-aud-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="meta-aud-modal-body">
          {step === 1 ? (
            <>
              <div>
                <div className="meta-aud-source-category-title">Your Sources</div>
                <div className="meta-aud-sources-grid">
                  {sourcesList
                    .filter((s) => s.category === "Your Sources")
                    .map((src) => (
                      <div
                        key={src.id}
                        className={`meta-aud-source-card ${selectedSource === src.id ? "selected" : ""}`}
                        onClick={() => setSelectedSource(src.id)}
                      >
                        <div className="meta-aud-source-card-icon">{src.icon}</div>
                        <div>
                          <div className="meta-aud-source-name">{src.name}</div>
                          <div className="meta-aud-source-desc">{src.desc}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <div className="meta-aud-source-category-title">Meta Sources</div>
                <div className="meta-aud-sources-grid">
                  {sourcesList
                    .filter((s) => s.category === "Meta Sources")
                    .map((src) => (
                      <div
                        key={src.id}
                        className={`meta-aud-source-card ${selectedSource === src.id ? "selected" : ""}`}
                        onClick={() => setSelectedSource(src.id)}
                      >
                        <div className="meta-aud-source-card-icon">{src.icon}</div>
                        <div>
                          <div className="meta-aud-source-name">{src.name}</div>
                          <div className="meta-aud-source-desc">{src.desc}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="meta-aud-form-group">
                <label className="meta-aud-form-label">Audience Name *</label>
                <input
                  type="text"
                  className="meta-aud-form-input"
                  placeholder="e.g. Website Visitors (30 Days)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="meta-aud-form-group">
                <label className="meta-aud-form-label">Description (Optional)</label>
                <textarea
                  className="meta-aud-form-textarea"
                  placeholder="Add a description so you can easily identify this audience later..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="meta-aud-form-group">
                <label className="meta-aud-form-label">Retention (Days)</label>
                <span className="meta-aud-form-sublabel">
                  The number of days people will remain in your audience after they match the rules.
                </span>
                <select
                  className="meta-aud-form-select"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                >
                  <option value="14">14 days</option>
                  <option value="30">30 days (Recommended)</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days (Maximum)</option>
                </select>
              </div>

              <div className="meta-aud-form-group">
                <label className="meta-aud-form-label">Audience Label Group</label>
                <select
                  className="meta-aud-form-select"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                >
                  <option value="group-customers">Customers</option>
                  <option value="group-engaged">Engaged audiences</option>
                  <option value="group-other">Other audiences</option>
                  <option value="group-unlabelled">Unlabelled audiences</option>
                </select>
              </div>

              {targetGroup === "group-customers" && (
                <div className="meta-aud-form-group">
                  <label className="meta-aud-form-label">Customer Field / Segment</label>
                  <span className="meta-aud-form-sublabel">
                    Categorize your customer audience using real Meta customer value segments.
                  </span>
                  <select
                    className="meta-aud-form-select"
                    value={customerSubLabel}
                    onChange={(e) => setCustomerSubLabel(e.target.value)}
                  >
                    {CUSTOMER_SUB_LABELS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} — {item.desc}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        <div className="meta-aud-modal-footer">
          {step === 1 ? (
            <>
              <button type="button" className="meta-aud-btn-modal-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="meta-aud-btn-modal-submit" onClick={handleNext}>
                Next
              </button>
            </>
          ) : (
            <>
              <button type="button" className="meta-aud-btn-modal-cancel" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="meta-aud-btn-modal-submit"
                onClick={handleFinish}
                disabled={!name.trim()}
              >
                Create Audience
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Modal 2: Create Lookalike Audience
// ============================================================================
function CreateLookalikeAudienceModal({ existingAudiences = [], onClose, onCreate }) {
  const [sourceId, setSourceId] = useState(existingAudiences[0]?.id || "");
  const [country, setCountry] = useState("India");
  const [percent, setPercent] = useState(1);

  // Dynamic calculated reach
  const estimatedReach = useMemo(() => {
    const baseIndiaReach = 3.2; // 3.2 Million per 1% in India
    const totalMillions = (baseIndiaReach * percent).toFixed(1);
    return `${totalMillions}M people`;
  }, [percent]);

  const handleCreate = () => {
    const src = existingAudiences.find((a) => a.id === sourceId);
    const srcName = src ? src.name : "Custom Audience";
    onCreate({
      name: `Lookalike (${country.slice(0, 2).toUpperCase()}, ${percent}%) - ${srcName}`,
      groupId: "group-lookalikes",
      type: "Lookalike Audience",
      typeLabel: "Lookalikes",
      source: `Source: ${srcName}`,
      estimatedSize: `${(percent * 3.1).toFixed(1)}M - ${(percent * 3.7).toFixed(1)}M`,
    });
  };

  return (
    <div className="meta-aud-modal-overlay">
      <div className="meta-aud-modal-card">
        <div className="meta-aud-modal-header">
          <div className="meta-aud-modal-title-wrap">
            <div className="meta-aud-modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <h3 className="meta-aud-modal-title">Create a Lookalike Audience</h3>
          </div>
          <button type="button" className="meta-aud-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="meta-aud-modal-body">
          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">1. Select Your Lookalike Source</label>
            <span className="meta-aud-form-sublabel">
              Choose an existing custom audience or pixel with at least 100 people from the same country.
            </span>
            <select
              className="meta-aud-form-select"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
            >
              {existingAudiences.map((aud) => (
                <option key={aud.id} value={aud.id}>
                  {aud.name} ({aud.type})
                </option>
              ))}
            </select>
          </div>

          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">2. Select Audience Location</label>
            <select
              className="meta-aud-form-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
            </select>
          </div>

          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">3. Select Audience Size</label>
            <span className="meta-aud-form-sublabel">
              A 1% lookalike consists of the people most similar to your lookalike source. Increasing
              percentage creates a larger, broader audience.
            </span>

            <div className="meta-aud-lookalike-slider-wrap">
              <div className="meta-aud-slider-val-box">
                <span className="meta-aud-slider-val">{percent}%</span>
                <span className="meta-aud-slider-reach">
                  Estimated reach: <strong>{estimatedReach}</strong>
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                className="meta-aud-range-input"
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
              />
              <div className="meta-aud-slider-ticks">
                <span>1%</span>
                <span>2%</span>
                <span>3%</span>
                <span>4%</span>
                <span>5%</span>
                <span>6%</span>
                <span>7%</span>
                <span>8%</span>
                <span>9%</span>
                <span>10%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="meta-aud-modal-footer">
          <button type="button" className="meta-aud-btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="meta-aud-btn-modal-submit" onClick={handleCreate}>
            Create Audience
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Modal 3: Create Saved Audience
// ============================================================================
function CreateSavedAudienceModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("India");
  const [minAge, setMinAge] = useState("20");
  const [maxAge, setMaxAge] = useState("45");
  const [gender, setGender] = useState("all");
  const [targeting, setTargeting] = useState("Digital Marketing, Entrepreneurship, E-commerce");

  const handleCreate = () => {
    onCreate({
      name: name || `Saved Audience - ${location} (${minAge}-${maxAge})`,
      groupId: "group-saved",
      type: "Saved Audience",
      typeLabel: "Saved audiences",
      source: `${location} • Age ${minAge}-${maxAge} • ${gender === "all" ? "All genders" : gender}`,
      estimatedSize: "2,400,000 - 2,800,000",
    });
  };

  return (
    <div className="meta-aud-modal-overlay">
      <div className="meta-aud-modal-card">
        <div className="meta-aud-modal-header">
          <div className="meta-aud-modal-title-wrap">
            <div className="meta-aud-modal-icon-badge">
              <Bookmark size={18} />
            </div>
            <h3 className="meta-aud-modal-title">Create a Saved Audience</h3>
          </div>
          <button type="button" className="meta-aud-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="meta-aud-modal-body">
          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">Audience Name *</label>
            <input
              type="text"
              className="meta-aud-form-input"
              placeholder="e.g. Kerala & Bangalore Entrepreneurs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">Locations</label>
            <input
              type="text"
              className="meta-aud-form-input"
              placeholder="e.g. India, Kerala, Bangalore"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="meta-aud-form-group">
              <label className="meta-aud-form-label">Age (Min)</label>
              <select
                className="meta-aud-form-select"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              >
                {Array.from({ length: 50 }, (_, i) => i + 18).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="meta-aud-form-group">
              <label className="meta-aud-form-label">Age (Max)</label>
              <select
                className="meta-aud-form-select"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              >
                {Array.from({ length: 48 }, (_, i) => i + 18).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
                <option value="65+">65+</option>
              </select>
            </div>
          </div>

          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">Gender</label>
            <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.84rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="savGender"
                  checked={gender === "all"}
                  onChange={() => setGender("all")}
                />
                All
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.84rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="savGender"
                  checked={gender === "men"}
                  onChange={() => setGender("men")}
                />
                Men
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.84rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="savGender"
                  checked={gender === "women"}
                  onChange={() => setGender("women")}
                />
                Women
              </label>
            </div>
          </div>

          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">Detailed Targeting</label>
            <span className="meta-aud-form-sublabel">
              Include people who match demographics, interests or behaviors.
            </span>
            <input
              type="text"
              className="meta-aud-form-input"
              placeholder="e.g. Digital Marketing, Small Business Owners, E-commerce"
              value={targeting}
              onChange={(e) => setTargeting(e.target.value)}
            />
          </div>
        </div>

        <div className="meta-aud-modal-footer">
          <button type="button" className="meta-aud-btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="meta-aud-btn-modal-submit"
            onClick={handleCreate}
          >
            Create Saved Audience
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Modal 4: Edit Audience Modal
// ============================================================================
function EditAudienceModal({ audience, audiences = [], onClose, onSave, onDelete }) {
  const [selectedAudience, setSelectedAudience] = useState(audience);
  const [name, setName] = useState(audience?.name || "");
  const [groupId, setGroupId] = useState(audience?.groupId || "group-other");
  const [subLabel, setSubLabel] = useState(audience?.subLabel || "general_customers");
  const [status, setStatus] = useState(audience?.status || "Ready");
  const [estimatedSize, setEstimatedSize] = useState(audience?.estimatedSize || "");
  const [source, setSource] = useState(audience?.source || "");

  // Update form if user switches audience from the dropdown
  const handleSelectAudience = (audId) => {
    const found = audiences.find((a) => a.id === audId);
    if (found) {
      setSelectedAudience(found);
      setName(found.name || "");
      setGroupId(found.groupId || "group-other");
      setSubLabel(found.subLabel || "general_customers");
      setStatus(found.status || "Ready");
      setEstimatedSize(found.estimatedSize || "");
      setSource(found.source || "");
    }
  };

  const handleSave = () => {
    const subObj = CUSTOMER_SUB_LABELS.find((s) => s.id === subLabel);
    onSave({
      ...selectedAudience,
      name,
      groupId,
      subLabel: groupId === "group-customers" ? subLabel : selectedAudience.subLabel,
      subLabelTitle: groupId === "group-customers" ? (subObj?.label || "General customers") : selectedAudience.subLabelTitle,
      status,
      statusType: status === "Ready" ? "ready" : status === "Updating" ? "updating" : "warning",
      estimatedSize,
      source,
    });
  };

  return (
    <div className="meta-aud-modal-overlay" onClick={onClose}>
      <div className="meta-aud-modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div className="meta-aud-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Edit2 size={18} color="#0064e1" />
            <h3 className="meta-aud-modal-title">Edit Audience</h3>
          </div>
          <button type="button" className="meta-aud-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="meta-aud-modal-body">
          {audiences && audiences.length > 1 && (
            <div className="meta-aud-form-group">
              <label className="meta-aud-form-label">Audience to Edit</label>
              <select
                className="meta-aud-form-select"
                value={selectedAudience.id}
                onChange={(e) => handleSelectAudience(e.target.value)}
                style={{ fontWeight: 600, color: "#0064e1", borderColor: "#93c5fd" }}
              >
                {audiences.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.audienceId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">Audience Name</label>
            <input
              type="text"
              className="meta-aud-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Past Customers CSV"
            />
          </div>

          <div className="meta-aud-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="meta-aud-form-group">
              <label className="meta-aud-form-label">Audience ID</label>
              <input
                type="text"
                className="meta-aud-form-input"
                value={selectedAudience.audienceId}
                disabled
                style={{ background: "#f0f2f5", color: "#65676b" }}
              />
            </div>
            <div className="meta-aud-form-group">
              <label className="meta-aud-form-label">Audience Type</label>
              <input
                type="text"
                className="meta-aud-form-input"
                value={selectedAudience.type}
                disabled
                style={{ background: "#f0f2f5", color: "#65676b" }}
              />
            </div>
          </div>

          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">Label Group</label>
            <select
              className="meta-aud-form-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="group-customers">Customers</option>
              <option value="group-engaged">Engaged audiences</option>
              <option value="group-other">Other audiences</option>
              <option value="group-unlabelled">Unlabelled audiences</option>
              <option value="group-lookalikes">Lookalikes</option>
              <option value="group-saved">Saved audiences</option>
            </select>
          </div>

          {groupId === "group-customers" && (
            <div className="meta-aud-form-group">
              <label className="meta-aud-form-label">Customer Field / Segment</label>
              <select
                className="meta-aud-form-select"
                value={subLabel}
                onChange={(e) => setSubLabel(e.target.value)}
              >
                {CUSTOMER_SUB_LABELS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} — {item.desc}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="meta-aud-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="meta-aud-form-group">
              <label className="meta-aud-form-label">Status</label>
              <select
                className="meta-aud-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Ready">Ready</option>
                <option value="Updating">Updating</option>
                <option value="Audience too small">Audience too small</option>
              </select>
            </div>
            <div className="meta-aud-form-group">
              <label className="meta-aud-form-label">Estimated Size</label>
              <input
                type="text"
                className="meta-aud-form-input"
                value={estimatedSize}
                onChange={(e) => setEstimatedSize(e.target.value)}
                placeholder="e.g. 24,000 - 28,000"
              />
            </div>
          </div>

          <div className="meta-aud-form-group">
            <label className="meta-aud-form-label">Data Source / Description</label>
            <input
              type="text"
              className="meta-aud-form-input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Customer list upload, Meta Pixel"
            />
          </div>
        </div>

        <div className="meta-aud-modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {onDelete ? (
            <button
              type="button"
              className="meta-aud-btn-modal-cancel"
              style={{ color: "#dc2626", borderColor: "#fca5a5", display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={() => onDelete(selectedAudience)}
            >
              <Trash2 size={14} /> Delete Audience
            </button>
          ) : <div />}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="meta-aud-btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="meta-aud-btn-modal-submit"
              onClick={handleSave}
              disabled={!name.trim()}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
