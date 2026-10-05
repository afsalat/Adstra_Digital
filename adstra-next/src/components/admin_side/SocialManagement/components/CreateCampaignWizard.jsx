"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import "./CreateCampaignWizard.css";
import { PRESET_THUMBNAILS } from "./CampaignManagementSection";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Layers,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Eye,
  CheckCircle2,
  FileCheck,
  Sparkles,
  Bookmark,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Play,
  Info,
  Building2,
  CreditCard,
  Target,
  Megaphone,
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  X,
  Heart,
  Send,
  Globe,
} from "lucide-react";
import { notify } from "./SocialFeedback";

export const normalizeGender = (val) => {
  if (!val) return "All";
  if (Array.isArray(val)) {
    if (val.length === 0 || val.length >= 3) return "All";
    val = val[0];
  }
  const s = String(val).trim().toLowerCase();
  if (s === "male" || s === "men" || s === "m") return "Male";
  if (s === "female" || s === "women" || s === "w") return "Female";
  return "All";
};

export const parseGenders = (val) => {
  const norm = normalizeGender(val);
  if (norm === "All") return ["Men", "Women", "Others"];
  return [norm === "Male" ? "Men" : "Women"];
};

export const PRESET_VIDEOS = [
  {
    id: "vid-1",
    label: "Product Promo",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=140&auto=format&fit=crop&q=80",
  },
  {
    id: "vid-2",
    label: "Tech Showcase",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=140&auto=format&fit=crop&q=80",
  },
  {
    id: "vid-3",
    label: "Brand Story",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    poster: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80",
  },
];

export const SAVED_AUDIENCE_PRESETS = [
  {
    id: "aud-1",
    name: "Young Shoppers & Trendsetters",
    location: "India (Metros: Mumbai, Delhi, Bengaluru)",
    ageRange: "18 - 24",
    gender: "Male",
    interests: "Online Shopping, Streetwear, Consumer Tech, Sneakerhead",
    languages: "English",
    estimatedSize: "3.2M - 4.1M",
  },
  {
    id: "aud-2",
    name: "Tech Professionals & Founders",
    location: "India, United States, UAE",
    ageRange: "25 - 34",
    gender: "All",
    interests: "Software, Startups, Digital Marketing, SaaS, Cloud",
    languages: "English",
    estimatedSize: "1.8M - 2.4M",
  },
  {
    id: "aud-3",
    name: "Real Estate & High Net-Worth Investors",
    location: "India (Kerala, Bengaluru, Mumbai)",
    ageRange: "35 - 44",
    gender: "All",
    interests: "Luxury Real Estate, Property Investment, Wealth Management",
    languages: "English",
    estimatedSize: "850K - 1.2M",
  },
  {
    id: "aud-4",
    name: "Beauty, Wellness & Lifestyle",
    location: "India (Pan-India)",
    ageRange: "18 - 24",
    gender: "Female",
    interests: "Skincare, Cosmetics, Personal Care, Wellness",
    languages: "All Languages",
    estimatedSize: "5.4M - 6.8M",
  },
  {
    id: "aud-5",
    name: "Retail & E-commerce Mass Audience",
    location: "India",
    ageRange: "25 - 34",
    gender: "All",
    interests: "Discounts, Seasonal Sales, Apparel & Fashion, Home Decor",
    languages: "All Languages",
    estimatedSize: "7.1M - 9.0M",
  },
];

export const LINKEDIN_SAVED_AUDIENCE_PRESETS = SAVED_AUDIENCE_PRESETS;

export const PLATFORM_PLACEMENT_CONFIG = {
  meta: {
    key: "meta",
    label: "Meta Ads (Facebook & Instagram)",
    autoTitle: "Automatic Placements (Advantage+)",
    autoDesc: "Let Meta decide the best placements across Facebook, Instagram, Audience Network & Messenger for optimal performance.",
    platformsLabel: "Platforms:",
    platforms: ["Facebook", "Instagram", "Audience Network", "Messenger"],
    defaultPlatforms: ["Facebook", "Instagram"],
    positionsLabel: "Placements:",
    positions: [
      { id: "feeds", label: "Feeds (Facebook Feed, Instagram Feed)" },
      { id: "stories_reels", label: "Stories & Reels (Instagram Stories, Facebook Reels)" },
      { id: "search_instream", label: "In-Stream, Search & Messages" },
    ],
    defaultPositions: ["feeds", "stories_reels"],
  },
  google: {
    key: "google",
    label: "Google Ads",
    autoTitle: "Smart Multi-Channel Delivery (Recommended)",
    autoDesc: "Let Google AI optimize delivery across Google Search, Display Network, YouTube, and Discover for maximum ROI.",
    platformsLabel: "Networks:",
    platforms: ["Google Search", "Google Display Network", "YouTube", "Discover & Gmail"],
    defaultPlatforms: ["Google Search", "Google Display Network"],
    positionsLabel: "Placements:",
    positions: [
      { id: "serp", label: "Search Results (Top / Bottom of Google SERP)" },
      { id: "display_network", label: "Display Network & Partner Websites" },
      { id: "youtube_video", label: "YouTube In-Feed & Skippable Video" },
      { id: "discover_gmail", label: "Discover Feed & Gmail Promotions" },
    ],
    defaultPositions: ["serp", "display_network"],
  },
  linkedin: {
    key: "linkedin",
    label: "LinkedIn Ads",
    autoTitle: "Audience Network Optimization (Recommended)",
    autoDesc: "Let LinkedIn maximize your professional reach across feed, messaging, and partner business platforms.",
    platformsLabel: "Channels:",
    platforms: ["LinkedIn Feed", "LinkedIn Messaging (InMail)", "LinkedIn Audience Network"],
    defaultPlatforms: ["LinkedIn Feed", "LinkedIn Messaging (InMail)"],
    positionsLabel: "Placements:",
    positions: [
      { id: "feed", label: "Desktop & Mobile Sponsored Content Feed" },
      { id: "inmail", label: "Sponsored Messaging / InMail" },
      { id: "right_rail", label: "Right Rail & Spotlight Ads (Desktop)" },
    ],
    defaultPositions: ["feed", "inmail"],
  },
  youtube: {
    key: "youtube",
    label: "YouTube Ads",
    autoTitle: "Maximized Video Reach (Recommended)",
    autoDesc: "Let Google optimize video delivery across YouTube watch pages, Shorts, and video partners.",
    platformsLabel: "Surfaces:",
    platforms: ["YouTube Watch Pages", "YouTube Shorts", "YouTube Search", "Google Video Partners"],
    defaultPlatforms: ["YouTube Watch Pages", "YouTube Shorts"],
    positionsLabel: "Placements:",
    positions: [
      { id: "instream", label: "Skippable & Non-Skippable In-Stream Video" },
      { id: "shorts", label: "YouTube Shorts Feed Ads" },
      { id: "bumper", label: "6-Second Bumper Ads" },
      { id: "infeed", label: "In-Feed Video Search Results" },
    ],
    defaultPositions: ["instream", "shorts"],
  },
};

export const getPlatformKey = (platformStr) => {
  const s = (platformStr || "").toLowerCase();
  if (s.includes("google")) return "google";
  if (s.includes("linkedin")) return "linkedin";
  if (s.includes("youtube")) return "youtube";
  return "meta";
};

// Real Official Platform Logos matching authentic brand identities
export const MetaLogoIcon = ({ size = 22, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 270 191"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    aria-label="Meta Ads"
  >
    <defs>
      <linearGradient id="metaOfficialGrad1" x1="61" y1="117" x2="259" y2="127" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0064e1" offset="0" />
        <stop stopColor="#0064e1" offset="0.4" />
        <stop stopColor="#0073ee" offset="0.83" />
        <stop stopColor="#0082fb" offset="1" />
      </linearGradient>
      <linearGradient id="metaOfficialGrad2" x1="45" y1="139" x2="45" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0082fb" offset="0" />
        <stop stopColor="#0064e0" offset="1" />
      </linearGradient>
    </defs>
    <path
      fill="#0081fb"
      d="m31.06,125.96c0,10.98 2.41,19.41 5.56,24.51 4.13,6.68 10.29,9.51 16.57,9.51 8.1,0 15.51-2.01 29.79-21.76 11.44-15.83 24.92-38.05 33.99-51.98l15.36-23.6c10.67-16.39 23.02-34.61 37.18-46.96 11.56-10.08 24.03-15.68 36.58-15.68 21.07,0 41.14,12.21 56.5,35.11 16.81,25.08 24.97,56.67 24.97,89.27 0,19.38-3.82,33.62-10.32,44.87-6.28,10.88-18.52,21.75-39.11,21.75l0-31.02c17.63,0 22.03-16.2 22.03-34.74 0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75-15.95,21.24-29.57,29.29-47.5,29.29-21.27,0-34.72-9.21-43.05-23.09-6.8-11.31-10.14-26.15-10.14-43.06z"
    />
    <path
      fill="url(#metaOfficialGrad1)"
      d="m24.49,37.3c14.24-21.95 34.79-37.3 58.36-37.3 13.65,0 27.22,4.04 41.39,15.61 15.5,12.65 32.02,33.48 52.63,67.81l7.39,12.32c17.84,29.72 27.99,45.01 33.93,52.22 7.64,9.26 12.99,12.02 19.94,12.02 17.63,0 22.03-16.2 22.03-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87-6.28,10.88-18.52,21.75-39.11,21.75-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71l-25.79-43.08c-12.94-21.62-24.81-37.74-31.68-45.04-7.39-7.85-16.89-17.33-32.05-17.33-12.27,0-22.69,8.61-31.41,21.78z"
    />
    <path
      fill="url(#metaOfficialGrad2)"
      d="m82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78-12.33,18.61-19.88,46.33-19.88,72.95 0,10.98 2.41,19.41 5.56,24.51l-26.48,17.44c-6.8-11.31-10.14-26.15-10.14-43.06 0-30.75 8.44-62.8 24.49-87.55 14.24-21.95 34.79-37.3 58.36-37.3z"
    />
  </svg>
);

export const GoogleAdsLogoIcon = ({ size = 22, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 251 226"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    aria-label="Google Ads"
  >
    <path
      fill="#4285F4"
      d="M85.9,28.6c2.4-6.3,5.7-12.1,10.6-16.8c19.6-19.1,52-14.3,65.3,9.7c10,18.2,20.6,36,30.9,54 c17.2,29.9,34.6,59.8,51.6,89.8c14.3,25.1-1.2,56.8-29.6,61.1c-17.4,2.6-33.7-5.4-42.7-21c-15.1-26.3-30.3-52.6-45.4-78.8 c-0.3-0.6-0.7-1.1-1.1-1.6c-1.6-1.3-2.3-3.2-3.3-4.9c-6.7-11.8-13.6-23.5-20.3-35.2c-4.3-7.6-8.8-15.1-13.1-22.7 c-3.9-6.8-5.7-14.2-5.5-22C83.6,36.2,84.1,32.2,85.9,28.6"
    />
    <path
      fill="#FBBC04"
      d="M85.9,28.6c-0.9,3.6-1.7,7.2-1.9,11c-0.3,8.4,1.8,16.2,6,23.5C101,82,112,101,122.9,120c1,1.7,1.8,3.4,2.8,5 c-6,10.4-12,20.7-18.1,31.1c-8.4,14.5-16.8,29.1-25.3,43.6c-0.4,0-0.5-0.2-0.6-0.5c-0.1-0.8,0.2-1.5,0.4-2.3 c4.1-15,0.7-28.3-9.6-39.7c-6.3-6.9-14.3-10.8-23.5-12.1c-12-1.7-22.6,1.4-32.1,8.9c-1.7,1.3-2.8,3.2-4.8,4.2 c-0.4,0-0.6-0.2-0.7-0.5c4.8-8.3,9.5-16.6,14.3-24.9C45.5,98.4,65.3,64,85.2,29.7C85.4,29.3,85.7,29,85.9,28.6"
    />
    <path
      fill="#34A853"
      d="M11.8,158c1.9-1.7,3.7-3.5,5.7-5.1c24.3-19.2,60.8-5.3,66.1,25.1c1.3,7.3,0.6,14.3-1.6,21.3 c-0.1,0.6-0.2,1.1-0.4,1.7c-0.9,1.6-1.7,3.3-2.7,4.9c-8.9,14.7-22,22-39.2,20.9C20,225.4,4.5,210.6,1.8,191 c-1.3-9.5,0.6-18.4,5.5-26.6c1-1.8,2.2-3.4,3.3-5.2C11.1,158.8,10.9,158,11.8,158"
    />
    <path fill="#FBBC04" d="M11.8,158c-0.4,0.4-0.4,1.1-1.1,1.2c-0.1-0.7,0.3-1.1,0.7-1.6L11.8,158" />
    <path fill="#E1C025" d="M81.6,201c-0.4-0.7,0-1.2,0.4-1.7c0.1,0.1,0.3,0.3,0.4,0.4L81.6,201" />
  </svg>
);

export const LinkedInLogoIcon = ({ size = 22, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 72 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    aria-label="LinkedIn Ads"
  >
    <path
      d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,0 64,0 L8,0 C3.581722,0 0,3.581722 0,8 L0,64 C0,68.418278 3.581722,72 8,72 Z"
      fill="#0A66C2"
    />
    <path
      d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const PLATFORM_OPTIONS = [
  {
    id: "meta",
    name: "Meta Ads",
    subtitle: "Facebook & Instagram",
    icon: <MetaLogoIcon size={24} />,
  },
  {
    id: "google",
    name: "Google Ads",
    subtitle: "Search, Display, YouTube",
    icon: <GoogleAdsLogoIcon size={24} />,
  },
  {
    id: "linkedin",
    name: "LinkedIn Ads",
    subtitle: "Professional Network",
    icon: <LinkedInLogoIcon size={24} />,
  },
];

export const PRESET_CLIENTS = [
  { id: "c-abc", name: "ABC Technologies" },
  { id: "c-media", name: "ABC Media" },
  { id: "c-design", name: "Design Studio" },
  { id: "c-realestate", name: "Real Estate Pro" },
  { id: "c-beauty", name: "Beauty & Co." },
  { id: "c-tech", name: "TechWorld" },
];

export default function CreateCampaignWizard({
  initialData = null,
  clients = [],
  onCancel,
  onComplete,
}) {
  // Active step (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Campaign Details
    client: initialData?.client || initialData?.client_name || clients[0]?.name || "ABC Technologies",
    name: initialData?.name || "Summer Sale Campaign",
    objective: initialData?.objective || "Sales / Conversions",
    platforms:
      initialData?.platforms && initialData.platforms.length > 0
        ? initialData.platforms
        : initialData?.platform
          ? [
            initialData.platform.toLowerCase().includes("google") ? "Google Ads"
              : initialData.platform.toLowerCase().includes("linkedin") ? "LinkedIn Ads"
                : "Meta Ads"
          ]
          : ["Meta Ads", "Google Ads", "LinkedIn Ads"],
    platform: initialData?.platform || "Meta Ads, Google Ads, LinkedIn Ads",
    adAccount:
      initialData?.adAccount && !initialData.adAccount.includes("(ID:")
        ? initialData.adAccount
        : (() => {
          const clientName = initialData?.client || initialData?.client_name || clients[0]?.name || "ABC Technologies";
          const initPlats =
            initialData?.platforms && initialData.platforms.length > 0
              ? initialData.platforms
              : initialData?.platform
                ? [initialData.platform]
                : ["Meta Ads", "Google Ads", "LinkedIn Ads"];
          if (initPlats.some((p) => p.toLowerCase().includes("meta"))) return `${clientName} - Meta`;
          if (initPlats.some((p) => p.toLowerCase().includes("google"))) return `${clientName} - Google Ads`;
          if (initPlats.some((p) => p.toLowerCase().includes("linkedin"))) return `${clientName} - LinkedIn Ads`;
          return `${clientName} - Meta`;
        })(),
    status: initialData?.status || "Draft",
    startDate: initialData?.startDate || "2025-04-25",
    endDate: initialData?.endDate || "2025-05-25",
    description: initialData?.description || "",

    // Budget
    budget: initialData?.budget !== undefined ? initialData.budget : 500,
    budgetType: initialData?.budgetType || "Daily Budget",
    budgetCurrency: initialData?.budgetCurrency || "INR",

    // Step 2: Ad Set Details
    audienceType: "new", // 'new' | 'saved'
    savedAudienceId: SAVED_AUDIENCE_PRESETS[0].id,
    location: "India",
    ageRange:
      initialData?.audience?.ageRange ||
      (initialData?.ageRange && initialData.ageRange !== "18 - 65+" ? initialData.ageRange : "18 - 24"),
    gender: normalizeGender(initialData?.audience?.gender || initialData?.gender || "Male"),
    interests: "",
    languages: "All Languages",
    placement: initialData?.audience?.placement || initialData?.placement || "automatic", // 'automatic' | 'manual'
    manualPlatforms: initialData?.audience?.manualPlatforms || initialData?.manualPlatforms || ["Facebook", "Instagram"],
    manualPositions: initialData?.audience?.manualPositions || initialData?.manualPositions || ["feeds", "stories_reels"],
    optimizationFor: initialData?.audience?.optimizationFor || initialData?.optimizationFor || "Conversions",
    conversionEvent:
      (initialData?.audience?.optimizationFor || initialData?.optimizationFor) === "Leads"
        ? "Lead"
        : (initialData?.audience?.optimizationFor || initialData?.optimizationFor) &&
          !["Conversions", "Leads"].includes(initialData?.audience?.optimizationFor || initialData?.optimizationFor)
          ? "None"
          : initialData?.audience?.conversionEvent || initialData?.conversionEvent || "Lead",
    metaBiddingStrategy: initialData?.metaBiddingStrategy || "Maximize Conversions",

    // Step 3: Ad Details
    adName: initialData?.adDetails?.adName || initialData?.name || "Summer Sale Ad - Image",
    adFormat: initialData?.adDetails?.adFormat || initialData?.ad_format || "image", // 'image' | 'video' | 'carousel'
    mediaUrl: initialData?.thumbnail || PRESET_THUMBNAILS[0].url,
    videoUrl: initialData?.adDetails?.videoUrl || initialData?.creative_video_url || "",
    videoFileName: "",
    carouselCards: initialData?.adDetails?.carouselCards || [
      {
        id: "c-1",
        imageUrl: PRESET_THUMBNAILS[0].url,
        headline: "Summer Sale - Nike Air Max",
        description: "Get up to 50% off on fresh kicks",
        destinationUrl: "https://adstradigital.com/summer-sale",
      },
      {
        id: "c-2",
        imageUrl: PRESET_THUMBNAILS[3].url,
        headline: "Beauty & Wellness Picks",
        description: "Hydrating creams & skincare",
        destinationUrl: "https://adstradigital.com/beauty",
      },
      {
        id: "c-3",
        imageUrl: PRESET_THUMBNAILS[5].url,
        headline: "High-Fi Sound & Headphones",
        description: "Immersive wireless audio",
        destinationUrl: "https://adstradigital.com/audio",
      },
    ],
    primaryText: "Get up to 50% off on premium footwear and summer essentials. Limited period offer!",
    headline: "Summer Sale - Up to 50% Off",
    adDescription: "Free shipping and easy 30-day returns on all domestic orders.",
    cta: "Learn More",
    destinationUrl: "https://adstradigital.com/summer-sale",

    // Google Ads specific
    googleCampaignType: "Search",
    googleTargetLocations: initialData?.location || "India, United States, UAE",
    googleAudienceType: "google", // 'google' | 'own'
    googleAgeRange: "18 - 65+",
    googleGender: "All",
    googleKeywords: "",
    googleBudget: 500,
    googleBudgetType: "Daily Budget",
    googleBiddingStrategy: "Maximize Conversions",

    // LinkedIn Ads specific
    linkedinCampaignObjective: "Leads",
    linkedinAudienceType: initialData?.linkedinAudienceType || "new", // 'new' | 'saved'
    linkedinSavedAudienceId: initialData?.linkedinSavedAudienceId || SAVED_AUDIENCE_PRESETS[0].id,
    linkedinLocation: "India, United States, UAE",
    linkedinJobFunction: "",
    linkedinCompany: "",
    linkedinAgeRange: "25 - 54",
    linkedinGender: "All",
    linkedinBudget: 500,
    linkedinBudgetType: "Daily Budget",
    linkedinBiddingStrategy: "Maximize Clicks",

    // Active platform tab in step 2
    step2ActiveTab: getPlatformKey(
      initialData?.platform
        ? (initialData.platform.toLowerCase().includes("google") ? "Google Ads"
          : initialData.platform.toLowerCase().includes("linkedin") ? "LinkedIn Ads"
            : initialData.platform.toLowerCase().includes("youtube") ? "YouTube Ads"
              : "Meta Ads (Facebook & Instagram)")
        : "Meta Ads (Facebook & Instagram)"
    ),
  });

  const [saving, setSaving] = useState(false);
  const [audienceDropdownOpen, setAudienceDropdownOpen] = useState(false);
  const [audienceSearchQuery, setAudienceSearchQuery] = useState("");
  const savedAudienceDropdownRef = useRef(null);

  const [linkedinAudienceDropdownOpen, setLinkedinAudienceDropdownOpen] = useState(false);
  const [linkedinAudienceSearchQuery, setLinkedinAudienceSearchQuery] = useState("");
  const linkedinSavedAudienceDropdownRef = useRef(null);

  // Ad Account Picker (two-panel popup matching image2 format)
  const [adAccountPickerOpen, setAdAccountPickerOpen] = useState(false);
  const [adAccountSearchQuery, setAdAccountSearchQuery] = useState("");
  const adAccountPickerRef = useRef(null);

  // Merged client list matching Image 1
  const clientOptions = useMemo(() => {
    const list = [...PRESET_CLIENTS];
    if (Array.isArray(clients) && clients.length > 0) {
      clients.forEach((c) => {
        const cName = c.name || c.company_name || c.client_name;
        if (cName && !list.some((item) => item.name.toLowerCase() === cName.toLowerCase())) {
          list.push({ id: c.id, name: cName });
        }
      });
    }
    return list;
  }, [clients]);

  // Dynamic ad accounts based on selected client & platforms:
  // Shows ONLY Meta, Google & LinkedIn ad accounts strictly based on which platforms are selected
  const adAccountOptions = useMemo(() => {
    const currentClient = formData.client || "ABC Technologies";
    const selectedPlats = formData.platforms || [];
    const accounts = [];

    // Strictly show only the ad accounts for selected platforms
    if (selectedPlats.some((p) => p.toLowerCase().includes("meta"))) {
      accounts.push(`${currentClient} - Meta`);
    }
    if (selectedPlats.some((p) => p.toLowerCase().includes("google"))) {
      accounts.push(`${currentClient} - Google Ads`);
    }
    if (selectedPlats.some((p) => p.toLowerCase().includes("linkedin"))) {
      accounts.push(`${currentClient} - LinkedIn Ads`);
    }

    // Fallback if no platform is selected yet
    if (accounts.length === 0) {
      accounts.push(`${currentClient} - Meta`);
    }

    return accounts;
  }, [formData.client, formData.platforms]);

  // Keep selected adAccount synchronized with currently available platform ad accounts
  useEffect(() => {
    if (adAccountOptions.length > 0 && !adAccountOptions.includes(formData.adAccount)) {
      setFormData((prev) => ({
        ...prev,
        adAccount: adAccountOptions[0],
      }));
    }
  }, [adAccountOptions, formData.adAccount]);

  // Handle client selection change
  const handleClientChange = (newClientName) => {
    setFormData((prev) => {
      const selectedPlats = prev.platforms || [];
      let matchedAccount = `${newClientName} - Meta`;
      if (selectedPlats.some((p) => p.toLowerCase().includes("meta"))) {
        matchedAccount = `${newClientName} - Meta`;
      } else if (selectedPlats.some((p) => p.toLowerCase().includes("google"))) {
        matchedAccount = `${newClientName} - Google Ads`;
      } else if (selectedPlats.some((p) => p.toLowerCase().includes("linkedin"))) {
        matchedAccount = `${newClientName} - LinkedIn Ads`;
      }

      return {
        ...prev,
        client: newClientName,
        adAccount: matchedAccount,
      };
    });
  };


  // Selected platform keys strictly derived from formData.platforms
  const selectedPlatformKeys = useMemo(() => {
    const list = formData.platforms || [];
    const keys = [];
    if (list.some((p) => p.toLowerCase().includes("meta"))) keys.push("meta");
    if (list.some((p) => p.toLowerCase().includes("google"))) keys.push("google");
    if (list.some((p) => p.toLowerCase().includes("linkedin"))) keys.push("linkedin");
    return keys.length > 0 ? keys : ["meta"];
  }, [formData.platforms]);

  const isMetaSelected = selectedPlatformKeys.includes("meta");
  const isGoogleSelected = selectedPlatformKeys.includes("google");
  const isLinkedInSelected = selectedPlatformKeys.includes("linkedin");

  // Keep step2ActiveTab synchronized with selected platforms
  useEffect(() => {
    if (!selectedPlatformKeys.includes(formData.step2ActiveTab)) {
      setFormData((prev) => ({
        ...prev,
        step2ActiveTab: selectedPlatformKeys[0] || "meta",
      }));
    }
  }, [selectedPlatformKeys, formData.step2ActiveTab]);

  // Dynamic preview tabs based on platforms selected in Step 1
  const availablePreviewTabs = useMemo(() => {
    const tabs = [];
    if (isMetaSelected) {
      tabs.push({ id: "facebook", label: "Facebook Feed", platform: "meta" });
      tabs.push({ id: "instagram", label: "Instagram Feed", platform: "meta" });
    }
    if (isGoogleSelected) {
      tabs.push({ id: "google_search", label: "Google Search", platform: "google" });
      tabs.push({ id: "google_display", label: "Google Display", platform: "google" });
    }
    if (isLinkedInSelected) {
      tabs.push({ id: "linkedin", label: "LinkedIn Feed", platform: "linkedin" });
    }
    if (tabs.length === 0) {
      tabs.push({ id: "facebook", label: "Facebook Feed", platform: "meta" });
      tabs.push({ id: "instagram", label: "Instagram Feed", platform: "meta" });
    }
    return tabs;
  }, [isMetaSelected, isGoogleSelected, isLinkedInSelected]);

  // Carousel active preview slide
  const [activeCarouselSlide, setActiveCarouselSlide] = useState(0);

  // Live Feed Ad Mock Preview Platform & Fit State
  const [previewPlatform, setPreviewPlatform] = useState(() => {
    return isMetaSelected ? "facebook" : isGoogleSelected ? "google_search" : "linkedin";
  });
  const [previewFitMode, setPreviewFitMode] = useState("contain"); // "contain" (Show Full) | "cover" (Fill Square)

  // Keep previewPlatform in sync with available preview options
  useEffect(() => {
    if (!availablePreviewTabs.some((t) => t.id === previewPlatform)) {
      if (availablePreviewTabs.length > 0) {
        setPreviewPlatform(availablePreviewTabs[0].id);
      }
    }
  }, [availablePreviewTabs, previewPlatform]);

  // Format tab change handler
  const handleFormatChange = (newFormat) => {
    let newAdName = formData.adName;
    if (newFormat === "image") {
      newAdName = newAdName.replace(/Video|Carousel/gi, "Image");
    } else if (newFormat === "video") {
      newAdName = newAdName.replace(/Image|Carousel/gi, "Video");
    } else if (newFormat === "carousel") {
      newAdName = newAdName.replace(/Image|Video/gi, "Carousel");
    }

    setFormData((prev) => ({
      ...prev,
      adFormat: newFormat,
      adName: newAdName,
      videoUrl: newFormat === "video" && !prev.videoUrl ? PRESET_VIDEOS[0].url : prev.videoUrl,
      mediaUrl:
        newFormat === "video"
          ? prev.videoUrl || PRESET_VIDEOS[0].url
          : newFormat === "carousel"
            ? prev.carouselCards?.[0]?.imageUrl || PRESET_THUMBNAILS[0].url
            : prev.mediaUrl || PRESET_THUMBNAILS[0].url,
    }));
  };

  // Carousel card management helpers
  const handleAddCarouselCard = () => {
    if (formData.carouselCards.length >= 10) return;
    const nextIdx = formData.carouselCards.length + 1;
    const nextThumb = PRESET_THUMBNAILS[(nextIdx - 1) % PRESET_THUMBNAILS.length].url;
    const newCard = {
      id: `card-${Date.now()}`,
      imageUrl: nextThumb,
      headline: `Featured Product #${nextIdx}`,
      description: "Explore fresh arrivals and deals",
      destinationUrl: formData.destinationUrl || "https://adstradigital.com",
    };
    const updatedCards = [...formData.carouselCards, newCard];
    setFormData((prev) => ({ ...prev, carouselCards: updatedCards }));
    setActiveCarouselSlide(updatedCards.length - 1);
  };

  const handleRemoveCarouselCard = (cardIndex) => {
    if (formData.carouselCards.length <= 2) {
      notify("A carousel ad requires at least 2 cards.");
      return;
    }
    const updatedCards = formData.carouselCards.filter((_, idx) => idx !== cardIndex);
    setFormData((prev) => ({ ...prev, carouselCards: updatedCards }));
    setActiveCarouselSlide((prev) => (prev >= updatedCards.length ? updatedCards.length - 1 : prev));
  };

  const handleUpdateCarouselCard = (cardIndex, field, value) => {
    const updatedCards = formData.carouselCards.map((c, idx) =>
      idx === cardIndex ? { ...c, [field]: value } : c
    );
    setFormData((prev) => ({ ...prev, carouselCards: updatedCards }));
  };

  const handlePrevCarouselSlide = () => {
    setActiveCarouselSlide((prev) => (prev > 0 ? prev - 1 : formData.carouselCards.length - 1));
  };

  const handleNextCarouselSlide = () => {
    setActiveCarouselSlide((prev) => (prev < formData.carouselCards.length - 1 ? prev + 1 : 0));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        savedAudienceDropdownRef.current &&
        !savedAudienceDropdownRef.current.contains(event.target)
      ) {
        setAudienceDropdownOpen(false);
      }
      if (
        linkedinSavedAudienceDropdownRef.current &&
        !linkedinSavedAudienceDropdownRef.current.contains(event.target)
      ) {
        setLinkedinAudienceDropdownOpen(false);
      }
      if (
        adAccountPickerRef.current &&
        !adAccountPickerRef.current.contains(event.target)
      ) {
        setAdAccountPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update helper
  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Platform change handler: dynamically resets placements to match selected ad platform
  const handlePlatformChange = (newPlatform) => {
    const key = getPlatformKey(newPlatform);
    const cfg = PLATFORM_PLACEMENT_CONFIG[key] || PLATFORM_PLACEMENT_CONFIG.meta;
    setFormData((prev) => ({
      ...prev,
      platform: newPlatform,
      manualPlatforms: cfg.defaultPlatforms,
      manualPositions: cfg.defaultPositions,
    }));
  };

  // Multi-platform selection toggle handler (Image 2)
  const togglePlatform = (platformName) => {
    setFormData((prev) => {
      const current = prev.platforms || [];
      let updated;
      if (current.includes(platformName)) {
        if (current.length === 1) {
          // Keep at least one platform selected
          return prev;
        }
        updated = current.filter((p) => p !== platformName);
      } else {
        updated = [...current, platformName];
      }

      const selectedKeys = updated.map((p) => {
        const s = p.toLowerCase();
        if (s.includes("google")) return "google";
        if (s.includes("linkedin")) return "linkedin";
        return "meta";
      });

      const nextActiveTab = selectedKeys.includes(prev.step2ActiveTab)
        ? prev.step2ActiveTab
        : selectedKeys[0] || "meta";

      const key = getPlatformKey(updated[0] || "Meta Ads");
      const cfg = PLATFORM_PLACEMENT_CONFIG[key] || PLATFORM_PLACEMENT_CONFIG.meta;

      // Determine valid ad accounts strictly based on updated platforms
      const client = prev.client || "ABC Technologies";
      const validAccounts = [];
      if (updated.some((p) => p.toLowerCase().includes("meta"))) {
        validAccounts.push(`${client} - Meta`);
      }
      if (updated.some((p) => p.toLowerCase().includes("google"))) {
        validAccounts.push(`${client} - Google Ads`);
      }
      if (updated.some((p) => p.toLowerCase().includes("linkedin"))) {
        validAccounts.push(`${client} - LinkedIn Ads`);
      }
      if (validAccounts.length === 0) {
        validAccounts.push(`${client} - Meta`);
      }

      const nextAdAccount = validAccounts.includes(prev.adAccount)
        ? prev.adAccount
        : validAccounts[0];

      return {
        ...prev,
        platforms: updated,
        platform: updated.join(", "),
        adAccount: nextAdAccount,
        step2ActiveTab: nextActiveTab,
        manualPlatforms: cfg.defaultPlatforms,
        manualPositions: cfg.defaultPositions,
      };
    });
  };

  // Saved audience selection handler: auto-populates targeting criteria
  const handleSelectSavedAudience = (presetId) => {
    const preset = SAVED_AUDIENCE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      savedAudienceId: preset.id,
      location: preset.location,
      ageRange: preset.ageRange,
      gender: normalizeGender(preset.gender),
      interests: preset.interests,
      languages: preset.languages,
    }));
  };

  // Audience type toggle handler (Create New vs Use Saved)
  const handleAudienceTypeChange = (type) => {
    if (type === "saved") {
      setAudienceDropdownOpen(true);
      setAudienceSearchQuery("");
      const activeId = formData.savedAudienceId || SAVED_AUDIENCE_PRESETS[0].id;
      const preset = SAVED_AUDIENCE_PRESETS.find((p) => p.id === activeId) || SAVED_AUDIENCE_PRESETS[0];
      setFormData((prev) => ({
        ...prev,
        audienceType: "saved",
        savedAudienceId: preset.id,
        location: preset.location,
        ageRange: preset.ageRange,
        gender: normalizeGender(preset.gender),
        interests: preset.interests,
        languages: preset.languages,
      }));
    } else {
      setAudienceDropdownOpen(false);
      setFormData((prev) => ({
        ...prev,
        audienceType: "new",
      }));
    }
  };

  // LinkedIn Saved audience selection handler
  const handleSelectLinkedinSavedAudience = (presetId) => {
    const preset = SAVED_AUDIENCE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      linkedinSavedAudienceId: preset.id,
      linkedinLocation: preset.location,
      linkedinAgeRange: preset.ageRange,
      linkedinGender: normalizeGender(preset.gender),
    }));
  };

  // LinkedIn Audience type toggle handler (Create New vs Use Saved)
  const handleLinkedinAudienceTypeChange = (type) => {
    if (type === "saved") {
      setLinkedinAudienceDropdownOpen(true);
      setLinkedinAudienceSearchQuery("");
      const activeId = formData.linkedinSavedAudienceId || SAVED_AUDIENCE_PRESETS[0].id;
      const preset = SAVED_AUDIENCE_PRESETS.find((p) => p.id === activeId) || SAVED_AUDIENCE_PRESETS[0];
      setFormData((prev) => ({
        ...prev,
        linkedinAudienceType: "saved",
        linkedinSavedAudienceId: preset.id,
        linkedinLocation: preset.location,
        linkedinAgeRange: preset.ageRange,
        linkedinGender: normalizeGender(preset.gender),
      }));
    } else {
      setLinkedinAudienceDropdownOpen(false);
      setFormData((prev) => ({
        ...prev,
        linkedinAudienceType: "new",
      }));
    }
  };

  // Filtered saved audiences based on search query
  const filteredAudiences = SAVED_AUDIENCE_PRESETS.filter((p) => {
    if (!audienceSearchQuery.trim()) return true;
    const q = audienceSearchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.interests.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q) ||
      p.ageRange.toLowerCase().includes(q)
    );
  });

  // Filtered LinkedIn saved audiences based on search query
  const filteredLinkedinAudiences = SAVED_AUDIENCE_PRESETS.filter((p) => {
    if (!linkedinAudienceSearchQuery.trim()) return true;
    const q = linkedinAudienceSearchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.interests.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q) ||
      p.ageRange.toLowerCase().includes(q)
    );
  });

  // Optimization change handler
  const handleOptimizationChange = (val) => {
    let nextConversionEvent = formData.conversionEvent;
    if (val === "Conversions") {
      const validConversionEvents = ["Lead", "Purchase", "Add to Cart", "Contact", "View Content"];
      if (!validConversionEvents.includes(nextConversionEvent) || nextConversionEvent === "None") {
        nextConversionEvent = "Lead";
      }
    } else if (val === "Leads") {
      nextConversionEvent = "Lead";
    } else {
      // Impressions, Link Clicks, Daily Unique Reach
      nextConversionEvent = "None";
    }

    setFormData((prev) => ({
      ...prev,
      optimizationFor: val,
      conversionEvent: nextConversionEvent,
    }));
  };

  // Step labels
  const steps = [
    { num: 1, label: "Campaign Details" },
    { num: 2, label: "Targeting & Campaign Settings" },
    { num: 3, label: "Ad Details" },
    { num: 4, label: "Review & Publish" },
  ];

  // Step 1 validation
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      notify("Please enter a campaign name.");
      return false;
    }
    if (!formData.platforms || formData.platforms.length === 0) {
      notify("Please select at least one advertising platform.");
      return false;
    }
    if (!formData.budget || Number(formData.budget) <= 0) {
      notify("Please enter a valid budget amount.");
      return false;
    }
    return true;
  };

  // Step 3 validation
  const validateStep3 = () => {
    return Boolean(formData.adName.trim() && formData.headline.trim());
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 3 && !validateStep3()) {
      notify("Please enter an ad name and headline.");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Submit Handler: Saves as Draft or Publishes
  const handleSubmit = async (targetStatus = "Draft") => {
    setSaving(true);
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const timeFormatted = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // Determine platform label
    let platLabel = "Meta";
    const pLow = formData.platform.toLowerCase();
    if (pLow.includes("google")) {
      platLabel = "Google Ads";
    } else if (pLow.includes("linkedin")) {
      platLabel = "LinkedIn Ads";
    } else if (pLow.includes("youtube")) {
      platLabel = "YouTube Ads";
    } else {
      if (formData.placement === "manual" && formData.manualPlatforms) {
        if (formData.manualPlatforms.includes("Instagram") && !formData.manualPlatforms.includes("Facebook")) {
          platLabel = "Instagram";
        } else if (formData.manualPlatforms.includes("Facebook") && !formData.manualPlatforms.includes("Instagram")) {
          platLabel = "Facebook";
        } else {
          platLabel = "Meta";
        }
      } else {
        platLabel = "Meta";
      }
    }

    const genderStr = Array.isArray(formData.gender)
      ? (formData.gender.length === 3 ? "All" : formData.gender.join(", "))
      : formData.gender;

    const activeThumb =
      formData.adFormat === "video"
        ? (formData.videoUrl || formData.mediaUrl)
        : formData.adFormat === "carousel"
          ? (formData.carouselCards?.[0]?.imageUrl || PRESET_THUMBNAILS[0].url)
          : (formData.mediaUrl || PRESET_THUMBNAILS[0].url);

    const campaignPayload = {
      id: initialData?.id || `cam-${Date.now()}`,
      backendId: initialData?.backendId || null,
      camCode: initialData?.camCode || `CAM-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      client: formData.client || "ABC Technologies",
      thumbnail: activeThumb,
      creative_video_url: formData.adFormat === "video" ? (formData.videoUrl || formData.mediaUrl) : "",
      creative_image_url:
        formData.adFormat === "carousel"
          ? (formData.carouselCards?.[0]?.imageUrl || PRESET_THUMBNAILS[0].url)
          : formData.adFormat === "image"
            ? (formData.mediaUrl || PRESET_THUMBNAILS[0].url)
            : "",
      ad_format: formData.adFormat,
      objective: formData.objective.includes("Sales") ? "Conversions" : formData.objective,
      status: targetStatus,
      platform: platLabel,
      adAccount: formData.adAccount.replace(/\s*\(ID:.*\)/, ""),
      dateCreated: dateFormatted,
      timeCreated: timeFormatted,
      rawDate: now.toISOString(),
      budget: Number(formData.budget || 50000),
      spent: 0,
      description: formData.description,
      adDetails: {
        adName: formData.adName,
        headline: formData.headline,
        primaryText: formData.primaryText,
        cta: formData.cta,
        destinationUrl: formData.destinationUrl,
        adFormat: formData.adFormat,
        videoUrl: formData.videoUrl || formData.mediaUrl,
        carouselCards: formData.carouselCards,
      },
      audience: {
        location: formData.location,
        ageRange: formData.ageRange,
        gender: genderStr,
        placement: formData.placement,
        optimizationFor: formData.optimizationFor,
        conversionEvent: formData.conversionEvent,
      },
    };

    // Try posting to backend API
    try {
      const clientId = clients[0]?.id;
      const apiPayload = {
        client_profile: clientId,
        name: formData.name.trim(),
        objective: formData.objective.toLowerCase().replace(/[\s/]/g, "_").slice(0, 50),
        status: targetStatus.toLowerCase(),
        budget: formData.budget,
        platforms: [platLabel.toLowerCase()],
        target_audience: `${formData.location}, ${formData.ageRange}, ${genderStr}`,
      };

      if (initialData?.backendId) {
        await axios.patch(`${API_BASE_URL}/social/campaigns/${initialData.backendId}/`, apiPayload);
      } else if (clientId) {
        const res = await axios.post(`${API_BASE_URL}/social/campaigns/`, apiPayload);
        if (res.data?.id) {
          campaignPayload.backendId = res.data.id;
        }
      }
    } catch {
      // Gracefully continue with local state
    }

    setSaving(false);
    if (onComplete) {
      onComplete(campaignPayload, targetStatus);
    }
  };

  return (
    <div className="ccw-container">
      {/* --------------------------------------------------------------------
          Top Breadcrumb & User Info
          -------------------------------------------------------------------- */}
      <div className="ccw-top-bar">
        <div className="ccw-breadcrumb">
          <button type="button" className="ccw-breadcrumb-link" onClick={onCancel}>
            Campaign Management
          </button>
          <span className="ccw-breadcrumb-sep">&gt;</span>
          <span className="ccw-breadcrumb-current">
            {initialData ? "Edit Campaign" : "Create Campaign"}
          </span>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          Page Header
          -------------------------------------------------------------------- */}
      <div className="ccw-page-header">
        <h1 className="ccw-title">{initialData ? "Edit Campaign" : "Create Campaign"}</h1>
        <p className="ccw-subtitle">
          Set up your campaign details and configure your ad settings to reach the right audience.
        </p>
      </div>

      {/* --------------------------------------------------------------------
          4-Step Stepper Progress Bar (Image 2)
          -------------------------------------------------------------------- */}
      <div className="ccw-stepper-bar">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;

          return (
            <React.Fragment key={step.num}>
              <button
                type="button"
                className={`ccw-step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                onClick={() => setCurrentStep(step.num)}
              >
                <div className="ccw-step-circle">
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : step.num}
                </div>
                <span className="ccw-step-label">{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <div className={`ccw-step-divider ${currentStep > step.num ? "active" : ""}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------
          STEP 1: Campaign Details (Image 1 Layout)
          -------------------------------------------------------------------- */}
      {currentStep === 1 && (
        <div className="ccw-content-card">
          <div className="ccw-card-header ccw-card-header-with-icon">
            <div className="ccw-card-header-icon-box">
              <Megaphone size={20} className="ccw-card-header-icon" />
            </div>
            <div className="ccw-card-header-text">
              <h2 className="ccw-card-title">Campaign Details</h2>
              <p className="ccw-card-subtitle">
                Set up your campaign's basic information. You can publish it directly to Meta, Google and LinkedIn from here.
              </p>
            </div>
          </div>

          {/* Form Grid for Campaign Details */}
          <div className="ccw-step1-grid">
            {/* Row 1: Select Client & Campaign Name side-by-side */}
            <div className="ccw-field-group">
              <label className="ccw-label">
                Select Client <span className="ccw-label-required">*</span>
              </label>
              <div className="ccw-input-icon-wrap ccw-select-wrap">
                <Building2 size={16} className="ccw-input-icon ccw-field-icon-blue" />
                <select
                  className="ccw-select ccw-select-with-icon"
                  value={formData.client}
                  onChange={(e) => handleClientChange(e.target.value)}
                >
                  {clientOptions.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="ccw-select-chevron" />
              </div>
            </div>

            <div className="ccw-field-group">
              <div className="ccw-field-header">
                <label className="ccw-label">
                  Campaign Name <span className="ccw-label-required">*</span>
                </label>
                <span className="ccw-char-counter">{formData.name.length}/100</span>
              </div>
              <input
                type="text"
                className="ccw-input"
                placeholder="e.g. Summer Sale Campaign"
                value={formData.name}
                maxLength={100}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            {/* Row 2: Platforms (Full Width spanning both columns) */}
            <div className="ccw-field-group ccw-grid-col-full">
              <label className="ccw-label">
                Platforms <span className="ccw-label-required">*</span>
              </label>
              <div className="ccw-platform-chips-row">
                {PLATFORM_OPTIONS.map((plat) => {
                  const isSelected = (formData.platforms || []).includes(plat.name);
                  return (
                    <div
                      key={plat.id}
                      className={`ccw-platform-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => togglePlatform(plat.name)}
                      role="button"
                      tabIndex={0}
                      title={`Click to ${isSelected ? "deselect" : "select"} ${plat.name}`}
                    >
                      <div className={`ccw-platform-chip-check ${isSelected ? "checked" : ""}`}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                      <div className="ccw-platform-chip-icon">{plat.icon}</div>
                      <span className="ccw-platform-chip-label">{plat.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Ad Account & Campaign Objective side-by-side */}
            <div className="ccw-field-group">
              <label className="ccw-label">
                Ad Account <span className="ccw-label-required">*</span>
              </label>
              {/* Two-panel Ad Account Picker (image2 format) */}
              <div className="ccw-adacct-picker-wrap" ref={adAccountPickerRef}>
                {/* Trigger button */}
                <button
                  type="button"
                  className="ccw-adacct-trigger"
                  onClick={() => {
                    setAdAccountPickerOpen((prev) => !prev);
                    setAdAccountSearchQuery("");
                  }}
                >
                  <div className="ccw-adacct-trigger-icon">
                    {formData.adAccount?.toLowerCase().includes("google") ? (
                      <GoogleAdsLogoIcon size={14} />
                    ) : formData.adAccount?.toLowerCase().includes("linkedin") ? (
                      <LinkedInLogoIcon size={14} />
                    ) : (
                      <MetaLogoIcon size={14} />
                    )}
                  </div>
                  <span className="ccw-adacct-trigger-label">
                    {formData.adAccount || "Select Ad Account"}
                  </span>
                  <ChevronDown size={14} className={`ccw-adacct-trigger-caret ${adAccountPickerOpen ? "open" : ""}`} />
                </button>

                {/* Two-Panel Picker Popup */}
                {adAccountPickerOpen && (() => {
                  const filteredAccts = adAccountOptions.filter((acc) =>
                    !adAccountSearchQuery.trim() ||
                    acc.toLowerCase().includes(adAccountSearchQuery.toLowerCase())
                  );
                  const selectedAcct = formData.adAccount;

                  return (
                    <div className="ccw-adacct-popup">
                      {/* Search row */}
                      <div className="ccw-adacct-search-row">
                        <Search size={14} className="ccw-adacct-search-icon" />
                        <input
                          type="text"
                          className="ccw-adacct-search-input"
                          placeholder="Search for an ad account"
                          value={adAccountSearchQuery}
                          onChange={(e) => setAdAccountSearchQuery(e.target.value)}
                          autoFocus
                        />
                        {adAccountSearchQuery && (
                          <button
                            type="button"
                            className="ccw-adacct-search-clear"
                            onClick={() => setAdAccountSearchQuery("")}
                          ><X size={13} /></button>
                        )}
                      </div>

                      {/* Two-panel body */}
                      <div className="ccw-adacct-popup-body">
                        {/* LEFT panel */}
                        <div className="ccw-adacct-left-panel">
                          {/* Client Email section */}
                          <div className="ccw-adacct-client-email-section">
                            <label className="ccw-adacct-client-email-label">Client Email</label>
                            <div className="ccw-adacct-client-email-input-wrap">
                              <Send size={14} className="ccw-adacct-client-email-icon" />
                              <input
                                type="email"
                                className="ccw-adacct-client-email-input"
                                placeholder="client@email.com"
                              />
                            </div>
                            <button type="button" className="ccw-adacct-send-connection-btn">
                              <Send size={14} style={{ marginRight: 6 }} />
                              Send Connection Request
                            </button>
                          </div>

                          {/* Other assets section */}
                          <div className="ccw-adacct-section-header ccw-adacct-section-header--mt">
                            <span>Other assets</span>
                            <Info size={13} className="ccw-adacct-info-icon" />
                          </div>
                          <div className="ccw-adacct-assets-list">
                            {filteredAccts.map((acc) => {
                              const isSelected = acc === selectedAcct;
                              return (
                                <button
                                  key={acc}
                                  type="button"
                                  className={`ccw-adacct-asset-row ${isSelected ? "selected" : ""}`}
                                  onClick={() => {
                                    updateField("adAccount", acc);
                                    setAdAccountPickerOpen(false);
                                  }}
                                >
                                  <div className="ccw-adacct-asset-icon">
                                    {acc.toLowerCase().includes("google") ? (
                                      <GoogleAdsLogoIcon size={16} />
                                    ) : acc.toLowerCase().includes("linkedin") ? (
                                      <LinkedInLogoIcon size={16} />
                                    ) : (
                                      <MetaLogoIcon size={16} />
                                    )}
                                  </div>
                                  <span className="ccw-adacct-asset-label">{acc}</span>
                                  <ChevronRight size={14} className="ccw-adacct-asset-arrow" />
                                </button>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            className="ccw-adacct-footer-btn-primary"
                            onClick={() => setAdAccountPickerOpen(false)}
                          >
                            Create ad using {selectedAcct ? selectedAcct.split(" - ").slice(-1)[0] : "this account"}
                          </button>
                        </div>

                        {/* RIGHT panel */}
                        <div className="ccw-adacct-right-panel">
                          <div className="ccw-adacct-right-header">
                            {filteredAccts.length} ad account{filteredAccts.length !== 1 ? "s" : ""}
                          </div>
                          <div className="ccw-adacct-right-list">
                            {filteredAccts.length === 0 ? (
                              <div className="ccw-adacct-no-results">No accounts found</div>
                            ) : (
                              filteredAccts.map((acc) => {
                                const isSelected = acc === selectedAcct;
                                // Generate a mock account ID from the account name
                                const mockId = acc.split("").reduce((s, c) => s + c.charCodeAt(0), 0) * 1000007 % 9999999999;
                                return (
                                  <button
                                    key={acc}
                                    type="button"
                                    className={`ccw-adacct-right-row ${isSelected ? "selected" : ""}`}
                                    onClick={() => {
                                      updateField("adAccount", acc);
                                      setAdAccountPickerOpen(false);
                                    }}
                                  >
                                    <span className={`ccw-adacct-right-dot ${isSelected ? "active" : ""}`} />
                                    <div className="ccw-adacct-right-icon">
                                      {acc.toLowerCase().includes("google") ? (
                                        <GoogleAdsLogoIcon size={15} />
                                      ) : acc.toLowerCase().includes("linkedin") ? (
                                        <LinkedInLogoIcon size={15} />
                                      ) : (
                                        <MetaLogoIcon size={15} />
                                      )}
                                    </div>
                                    <div className="ccw-adacct-right-info">
                                      <span className="ccw-adacct-right-name">{acc}</span>
                                      <span className="ccw-adacct-right-id">Ad account ID: {mockId}</span>
                                    </div>
                                    <MoreHorizontal size={16} className="ccw-adacct-right-more" />
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <p className="ccw-field-helper">
                Ad accounts are fetched based on the selected client and platforms.
              </p>
            </div>


            <div className="ccw-field-group">
              <label className="ccw-label">
                Campaign Objective <span className="ccw-label-required">*</span>
              </label>
              <div className="ccw-input-icon-wrap ccw-select-wrap">
                <Target size={16} className="ccw-input-icon ccw-field-icon-blue" />
                <select
                  className="ccw-select ccw-select-with-icon"
                  value={formData.objective}
                  onChange={(e) => updateField("objective", e.target.value)}
                >
                  <option value="Sales / Conversions">Sales / Conversions</option>
                  <option value="Awareness">Awareness</option>
                  <option value="Brand Awareness">Brand Awareness</option>
                  <option value="Traffic">Traffic</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Leads">Leads</option>
                </select>
                <ChevronDown size={15} className="ccw-select-chevron" />
              </div>
            </div>

            {/* Row 4: Budget & Dates side-by-side */}
            <div className="ccw-field-group">
              <label className="ccw-label">
                Budget <span className="ccw-label-required">*</span>
              </label>
              <div className="ccw-budget-segmented-toggle">
                <button
                  type="button"
                  className={`ccw-budget-toggle-pill ${
                    formData.budgetType?.toLowerCase().includes("daily") ? "active" : ""
                  }`}
                  onClick={() => updateField("budgetType", "Daily Budget")}
                >
                  Daily Budget
                </button>
                <button
                  type="button"
                  className={`ccw-budget-toggle-pill ${
                    formData.budgetType?.toLowerCase().includes("total") ? "active" : ""
                  }`}
                  onClick={() => updateField("budgetType", "Total Budget")}
                >
                  Total Budget
                </button>
              </div>
              <div className="ccw-budget-input-group">
                <span className="ccw-budget-symbol">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="ccw-budget-num-input"
                  value={formData.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                />
                <div className="ccw-budget-curr-picker">
                  <select
                    className="ccw-budget-curr-select"
                    value={formData.budgetCurrency || "INR"}
                    onChange={(e) => updateField("budgetCurrency", e.target.value)}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <ChevronDown size={13} className="ccw-budget-curr-arrow" />
                </div>
              </div>
            </div>

            <div className="ccw-field-group">
              <div className="ccw-dates-two-col">
                <div className="ccw-field-group">
                  <label className="ccw-label">
                    Start Date <span className="ccw-label-required">*</span>
                  </label>
                  <div className="ccw-input-icon-wrap">
                    <Calendar size={15} className="ccw-input-icon" />
                    <input
                      type="date"
                      className="ccw-input ccw-input-with-icon"
                      value={formData.startDate}
                      onChange={(e) => updateField("startDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="ccw-field-group">
                  <label className="ccw-label">
                    End Date <span className="ccw-label-optional">(Optional)</span>
                  </label>
                  <div className="ccw-input-icon-wrap">
                    <Calendar size={15} className="ccw-input-icon" />
                    <input
                      type="date"
                      className="ccw-input ccw-input-with-icon"
                      value={formData.endDate}
                      onChange={(e) => updateField("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5: Description (Full Width spanning both columns) */}
            <div className="ccw-field-group ccw-grid-col-full ccw-description-group">
              <div className="ccw-field-header">
                <label className="ccw-label">Description (Optional)</label>
                <span className="ccw-char-counter">{formData.description.length}/200</span>
              </div>
              <textarea
                className="ccw-textarea"
                placeholder="Add a brief description about your campaign..."
                value={formData.description}
                maxLength={200}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          STEP 2: Targeting & Campaign Settings
          -------------------------------------------------------------------- */}
      {currentStep === 2 && (() => {
        const platCfg = PLATFORM_PLACEMENT_CONFIG[getPlatformKey(formData.platform)] || PLATFORM_PLACEMENT_CONFIG.meta;

        const MetaRealLogo = () => <MetaLogoIcon size={18} />;
        const GoogleRealLogo = () => <GoogleAdsLogoIcon size={18} />;
        const LinkedInRealLogo = () => <LinkedInLogoIcon size={18} />;

        return (
          <div className="ccw-content-card">
            <div className="ccw-card-header">
              <h2 className="ccw-card-title">Targeting & Campaign Settings</h2>
              <p className="ccw-card-subtitle">
                Define your audience, placements and optimization settings. These options may vary based on the platforms you selected.
              </p>
            </div>

            {/* Platform Tabs — only show for selected platforms */}
            <div className="tcs-platform-tabs">
              {[
                { key: "meta", label: "Meta Ads", logo: <MetaRealLogo /> },
                { key: "google", label: "Google Ads", logo: <GoogleRealLogo /> },
                { key: "linkedin", label: "LinkedIn Ads", logo: <LinkedInRealLogo /> },
              ]
                .filter((tab) => selectedPlatformKeys.includes(tab.key))
                .map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`tcs-platform-tab ${(formData.step2ActiveTab || selectedPlatformKeys[0]) === tab.key ? "active" : ""}`}
                    onClick={() => {
                      updateField("step2ActiveTab", tab.key);
                      const el = document.getElementById(`tcs-panel-${tab.key}`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      }
                    }}
                  >
                    {tab.logo}
                    <span>{tab.label}</span>
                  </button>
                ))}
            </div>

            {/* Panels Grid: only renders forms for platforms selected in Step 1 */}
            <div
              className={`tcs-panels-grid count-${selectedPlatformKeys.length}`}
              style={{
                gridTemplateColumns:
                  selectedPlatformKeys.length === 1
                    ? "1fr"
                    : selectedPlatformKeys.length === 2
                      ? "1fr 1fr"
                      : "1fr 1fr 1fr",
                maxWidth: selectedPlatformKeys.length === 1 ? "750px" : "100%",
                margin: selectedPlatformKeys.length === 1 ? "0 auto" : "0",
              }}
            >
              {/* --- META ADS PANEL --- */}
              {isMetaSelected && (
                <div id="tcs-panel-meta" className={`tcs-panel ${formData.step2ActiveTab === "meta" ? "highlight-active" : ""}`}>
                  <div className="tcs-panel-header">
                    <MetaLogoIcon size={20} />
                    <span>Meta Ads (Facebook &amp; Instagram)</span>
                  </div>

                {/* Audience toggle */}
                <div className="tcs-field-group">
                  <div className="tcs-label-row">
                    <label className="tcs-label">Audience</label>
                  </div>
                  <div className="tcs-radio-inline">
                    <label
                      className={`tcs-radio-pill ${formData.audienceType === "new" ? "active" : ""}`}
                      onClick={() => handleAudienceTypeChange("new")}
                    >
                      <input type="radio" name="meta-audience" checked={formData.audienceType === "new"} onChange={() => { }} />
                      Create New Audience
                    </label>
                    <label
                      className={`tcs-radio-pill ${formData.audienceType === "saved" ? "active" : ""}`}
                      onClick={() => handleAudienceTypeChange("saved")}
                    >
                      <input type="radio" name="meta-audience" checked={formData.audienceType === "saved"} onChange={() => { }} />
                      Use Saved Audience
                    </label>
                  </div>

                  {formData.audienceType === "saved" && (
                    <div className="ccw-meta-saved-audience-wrapper" ref={savedAudienceDropdownRef} style={{ marginTop: 8 }}>
                      <div className="ccw-meta-saved-audience-trigger-row">
                        <button
                          type="button"
                          className="ccw-meta-saved-audience-trigger"
                          onClick={() => setAudienceDropdownOpen((prev) => !prev)}
                        >
                          <span>Use a saved audience</span>
                          <ChevronDown size={14} className={`ccw-meta-trigger-caret ${audienceDropdownOpen ? "open" : ""}`} />
                        </button>
                        {(() => {
                          const activePreset =
                            SAVED_AUDIENCE_PRESETS.find((p) => p.id === formData.savedAudienceId) ||
                            SAVED_AUDIENCE_PRESETS[0];
                          return activePreset ? (
                            <span className="ccw-meta-selected-badge">
                              Selected: <strong>{activePreset.name}</strong>
                            </span>
                          ) : null;
                        })()}
                      </div>
                      {audienceDropdownOpen && (
                        <div className="ccw-meta-audience-popover">
                          <div className="ccw-meta-search-container">
                            <Search size={16} className="ccw-meta-search-icon" />
                            <input
                              type="text"
                              className="ccw-meta-search-input"
                              placeholder="Search"
                              value={audienceSearchQuery}
                              onChange={(e) => setAudienceSearchQuery(e.target.value)}
                              autoFocus
                            />
                            {audienceSearchQuery && (
                              <button type="button" className="ccw-meta-search-clear" onClick={() => setAudienceSearchQuery("")}>✕</button>
                            )}
                          </div>
                          <div className="ccw-meta-audience-list">
                            {filteredAudiences.length > 0 ? (
                              filteredAudiences.map((p) => {
                                const isSelected = p.id === (formData.savedAudienceId || SAVED_AUDIENCE_PRESETS[0].id);
                                return (
                                  <div
                                    key={p.id}
                                    className={`ccw-meta-audience-item ${isSelected ? "selected" : ""}`}
                                    onClick={() => { handleSelectSavedAudience(p.id); setAudienceDropdownOpen(false); }}
                                  >
                                    <div className="ccw-meta-item-content">
                                      <span className="ccw-meta-item-name">{p.name}</span>
                                      <span className="ccw-meta-item-sub">{p.location} • {p.ageRange} • {p.gender}</span>
                                    </div>
                                    {isSelected && <Check size={16} className="ccw-meta-item-check" />}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="ccw-meta-no-results">
                                <p className="ccw-meta-no-results-title">No results found</p>
                                <p className="ccw-meta-no-results-hint">Try searching by location, age, or interest.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Locations */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Locations</label>
                  <input
                    type="text"
                    className="ccw-input"
                    placeholder="e.g. India, United States, UAE"
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>

                {/* Age Range + Gender */}
                <div className="tcs-grid-2">
                  <div className="tcs-field-group">
                    <label className="tcs-label">Age Range</label>
                    <select className="ccw-select" value={formData.ageRange} onChange={(e) => updateField("ageRange", e.target.value)}>
                      <option value="18 - 65+">18 - 65+</option>
                      <option value="18 - 24">18 - 24</option>
                      <option value="25 - 34">25 - 34</option>
                      <option value="35 - 44">35 - 44</option>
                      <option value="45 - 54">45 - 54</option>
                      <option value="55 - 64">55 - 64</option>
                      <option value="65+">65+</option>
                    </select>
                  </div>
                  <div className="tcs-field-group">
                    <label className="tcs-label">Gender</label>
                    <select className="ccw-select" value={normalizeGender(formData.gender)} onChange={(e) => updateField("gender", e.target.value)}>
                      <option value="All">All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Interests / Keywords */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Interests / Keywords (Optional)</label>
                  <input
                    type="text"
                    className="ccw-input"
                    placeholder="e.g. Digital Marketing, SaaS, Cloud"
                    value={formData.interests}
                    onChange={(e) => updateField("interests", e.target.value)}
                  />
                </div>

                {/* Placements */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Placements</label>
                  <select className="ccw-select" value={formData.placement} onChange={(e) => updateField("placement", e.target.value)}>
                    <option value="automatic">Automatic Placements (Advantage+)</option>
                    <option value="manual">Manual Placements</option>
                  </select>
                </div>

                {formData.placement === "manual" && (
                  <div className="ccw-manual-placements-panel" style={{ marginBottom: 12 }}>
                    <span className="ccw-manual-section-label">{platCfg.platformsLabel}</span>
                    <div className="ccw-manual-checkbox-grid">
                      {platCfg.platforms.map((p) => (
                        <label key={p} className="ccw-checkbox-label">
                          <input
                            type="checkbox"
                            checked={(formData.manualPlatforms || platCfg.defaultPlatforms).includes(p)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(formData.manualPlatforms || platCfg.defaultPlatforms), p]
                                : (formData.manualPlatforms || platCfg.defaultPlatforms).filter((item) => item !== p);
                              updateField("manualPlatforms", updated.length > 0 ? updated : [p]);
                            }}
                          />
                          <span>{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimization + Conversion Event */}
                <div className="tcs-grid-2">
                  <div className="tcs-field-group">
                    <label className="tcs-label">Optimization</label>
                    <select className="ccw-select" value={formData.optimizationFor} onChange={(e) => handleOptimizationChange(e.target.value)}>
                      <option value="Conversions">Conversions</option>
                      <option value="Leads">Leads</option>
                      <option value="Impressions">Impressions</option>
                      <option value="Link Clicks">Link Clicks</option>
                      <option value="Daily Unique Reach">Daily Unique Reach</option>
                    </select>
                  </div>
                  <div className="tcs-field-group">
                    <label className="tcs-label">Conversion Event</label>
                    {formData.optimizationFor === "Leads" ? (
                      <div className="ccw-input" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8fafc", color: "#334155", cursor: "not-allowed" }}>
                        <span style={{ fontWeight: 500 }}>Lead</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>Automatic</span>
                      </div>
                    ) : (
                      <select className="ccw-select" value={formData.conversionEvent} onChange={(e) => updateField("conversionEvent", e.target.value)}>
                        <option value="Lead">Lead</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Add to Cart">Add to Cart</option>
                        <option value="Contact">Contact</option>
                        <option value="View Content">View Content</option>
                        <option value="None">None</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Budget</label>
                  <div className="tcs-budget-row">
                    <select
                      className="ccw-select"
                      value={formData.budgetType || "Daily Budget"}
                      onChange={(e) => updateField("budgetType", e.target.value)}
                      style={{ flex: "0 0 160px" }}
                    >
                      <option value="Daily Budget">Daily Budget</option>
                      <option value="Lifetime Budget">Lifetime Budget</option>
                    </select>
                    <div className="tcs-budget-amount">
                      <span className="tcs-currency-symbol">₹</span>
                      <input
                        type="number"
                        className="ccw-input"
                        value={formData.budget}
                        onChange={(e) => updateField("budget", Number(e.target.value))}
                        min={1}
                        style={{ paddingLeft: 28 }}
                      />
                      <span className="tcs-currency-label">INR</span>
                    </div>
                  </div>
                </div>

                {/* Bidding Strategy */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Bidding Strategy</label>
                  <select
                    className="ccw-select"
                    value={formData.metaBiddingStrategy || "Maximize Conversions"}
                    onChange={(e) => updateField("metaBiddingStrategy", e.target.value)}
                  >
                    <option value="Maximize Conversions">Highest Volume (Maximize Conversions)</option>
                    <option value="Cost per Result Goal">Cost per Result Goal</option>
                    <option value="Bid Cap">Bid Cap</option>
                    <option value="Target ROAS">Target ROAS</option>
                  </select>
                </div>
              </div>
            )}

            {/* --- GOOGLE ADS PANEL --- */}
            {isGoogleSelected && (
              <div id="tcs-panel-google" className={`tcs-panel ${formData.step2ActiveTab === "google" ? "highlight-active" : ""}`}>
                <div className="tcs-panel-header">
                  <GoogleAdsLogoIcon size={20} />
                  <span>Google Ads</span>
                </div>

                {/* Campaign Type */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Campaign Type</label>
                  <select className="ccw-select" value={formData.googleCampaignType} onChange={(e) => updateField("googleCampaignType", e.target.value)}>
                    <option value="Search">Search</option>
                    <option value="Display">Display</option>
                    <option value="Video">Video</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Performance Max">Performance Max</option>
                  </select>
                  <span className="tcs-hint">Choose the campaign type based on your goal.</span>
                </div>

                {/* Target Locations */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Target Locations</label>
                  <input
                    type="text"
                    className="ccw-input"
                    placeholder="e.g. India, United States, UAE"
                    value={formData.googleTargetLocations}
                    onChange={(e) => updateField("googleTargetLocations", e.target.value)}
                  />
                </div>

                {/* Audience Toggle */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Audience</label>
                  <div className="tcs-radio-inline">
                    <label className={`tcs-radio-pill ${formData.googleAudienceType === "google" ? "active" : ""}`} onClick={() => updateField("googleAudienceType", "google")}>
                      <input type="radio" name="google-audience" checked={formData.googleAudienceType === "google"} onChange={() => { }} />
                      Use Google's targeting
                    </label>
                    <label className={`tcs-radio-pill ${formData.googleAudienceType === "own" ? "active" : ""}`} onClick={() => updateField("googleAudienceType", "own")}>
                      <input type="radio" name="google-audience" checked={formData.googleAudienceType === "own"} onChange={() => { }} />
                      Use my own audience
                    </label>
                  </div>
                </div>

                {/* Age Range + Gender */}
                <div className="tcs-grid-2">
                  <div className="tcs-field-group">
                    <label className="tcs-label">Age Range</label>
                    <select className="ccw-select" value={formData.googleAgeRange} onChange={(e) => updateField("googleAgeRange", e.target.value)}>
                      <option value="18 - 65+">18 - 65+</option>
                      <option value="18 - 24">18 - 24</option>
                      <option value="25 - 34">25 - 34</option>
                      <option value="35 - 44">35 - 44</option>
                      <option value="45 - 54">45 - 54</option>
                      <option value="55 - 64">55 - 64</option>
                      <option value="65+">65+</option>
                    </select>
                  </div>
                  <div className="tcs-field-group">
                    <label className="tcs-label">Gender</label>
                    <select className="ccw-select" value={formData.googleGender} onChange={(e) => updateField("googleGender", e.target.value)}>
                      <option value="All">All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Keywords */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Keywords (Optional)</label>
                  <input
                    type="text"
                    className="ccw-input"
                    placeholder="e.g. summer sale, buy now, best deals"
                    value={formData.googleKeywords}
                    onChange={(e) => updateField("googleKeywords", e.target.value)}
                  />
                </div>

                {/* Budget */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Budget</label>
                  <div className="tcs-budget-row">
                    <select className="ccw-select" value={formData.googleBudgetType} onChange={(e) => updateField("googleBudgetType", e.target.value)} style={{ flex: "0 0 160px" }}>
                      <option value="Daily Budget">Daily Budget</option>
                      <option value="Lifetime Budget">Lifetime Budget</option>
                    </select>
                    <div className="tcs-budget-amount">
                      <span className="tcs-currency-symbol">₹</span>
                      <input
                        type="number"
                        className="ccw-input"
                        value={formData.googleBudget}
                        onChange={(e) => updateField("googleBudget", Number(e.target.value))}
                        min={1}
                        style={{ paddingLeft: 28 }}
                      />
                      <span className="tcs-currency-label">INR</span>
                    </div>
                  </div>
                </div>

                {/* Bidding Strategy */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Bidding Strategy</label>
                  <select className="ccw-select" value={formData.googleBiddingStrategy} onChange={(e) => updateField("googleBiddingStrategy", e.target.value)}>
                    <option value="Maximize Conversions">Maximize Conversions</option>
                    <option value="Maximize Clicks">Maximize Clicks</option>
                    <option value="Target CPA">Target CPA</option>
                    <option value="Target ROAS">Target ROAS</option>
                    <option value="Manual CPC">Manual CPC</option>
                  </select>
                </div>
              </div>
            )}

            {/* --- LINKEDIN ADS PANEL --- */}
            {isLinkedInSelected && (
              <div id="tcs-panel-linkedin" className={`tcs-panel ${formData.step2ActiveTab === "linkedin" ? "highlight-active" : ""}`}>
                <div className="tcs-panel-header">
                  <LinkedInLogoIcon size={20} />
                  <span>LinkedIn Ads</span>
                </div>

                {/* Campaign Objective */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Campaign Objective</label>
                  <select className="ccw-select" value={formData.linkedinCampaignObjective} onChange={(e) => updateField("linkedinCampaignObjective", e.target.value)}>
                    <option value="Leads">Leads</option>
                    <option value="Brand Awareness">Brand Awareness</option>
                    <option value="Website Conversions">Website Conversions</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Job Applicants">Job Applicants</option>
                  </select>
                  <span className="tcs-hint">Choose the objective that matches your business goal.</span>
                </div>

                {/* Audience Toggle */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Audience</label>
                  <div className="tcs-radio-inline">
                    <label
                      className={`tcs-radio-pill ${formData.linkedinAudienceType === "new" ? "active" : ""}`}
                      onClick={() => handleLinkedinAudienceTypeChange("new")}
                    >
                      <input type="radio" name="li-audience" checked={formData.linkedinAudienceType === "new"} onChange={() => { }} />
                      Create New Audience
                    </label>
                    <label
                      className={`tcs-radio-pill ${formData.linkedinAudienceType === "saved" ? "active" : ""}`}
                      onClick={() => handleLinkedinAudienceTypeChange("saved")}
                    >
                      <input type="radio" name="li-audience" checked={formData.linkedinAudienceType === "saved"} onChange={() => { }} />
                      Use Saved Audience
                    </label>
                  </div>

                  {formData.linkedinAudienceType === "saved" && (
                    <div className="ccw-meta-saved-audience-wrapper" ref={linkedinSavedAudienceDropdownRef} style={{ marginTop: 8 }}>
                      <div className="ccw-meta-saved-audience-trigger-row">
                        <button
                          type="button"
                          className="ccw-meta-saved-audience-trigger"
                          onClick={() => setLinkedinAudienceDropdownOpen((prev) => !prev)}
                        >
                          <span>Use a saved audience</span>
                          <ChevronDown size={14} className={`ccw-meta-trigger-caret ${linkedinAudienceDropdownOpen ? "open" : ""}`} />
                        </button>
                        {(() => {
                          const activePreset =
                            SAVED_AUDIENCE_PRESETS.find((p) => p.id === formData.linkedinSavedAudienceId) ||
                            SAVED_AUDIENCE_PRESETS[0];
                          return activePreset ? (
                            <span className="ccw-meta-selected-badge">
                              Selected: <strong>{activePreset.name}</strong>
                            </span>
                          ) : null;
                        })()}
                      </div>
                      {linkedinAudienceDropdownOpen && (
                        <div className="ccw-meta-audience-popover">
                          <div className="ccw-meta-search-container">
                            <Search size={16} className="ccw-meta-search-icon" />
                            <input
                              type="text"
                              className="ccw-meta-search-input"
                              placeholder="Search"
                              value={linkedinAudienceSearchQuery}
                              onChange={(e) => setLinkedinAudienceSearchQuery(e.target.value)}
                              autoFocus
                            />
                            {linkedinAudienceSearchQuery && (
                              <button type="button" className="ccw-meta-search-clear" onClick={() => setLinkedinAudienceSearchQuery("")}>✕</button>
                            )}
                          </div>
                          <div className="ccw-meta-audience-list">
                            {filteredLinkedinAudiences.length > 0 ? (
                              filteredLinkedinAudiences.map((p) => {
                                const isSelected = p.id === (formData.linkedinSavedAudienceId || SAVED_AUDIENCE_PRESETS[0].id);
                                return (
                                  <div
                                    key={p.id}
                                    className={`ccw-meta-audience-item ${isSelected ? "selected" : ""}`}
                                    onClick={() => { handleSelectLinkedinSavedAudience(p.id); setLinkedinAudienceDropdownOpen(false); }}
                                  >
                                    <div className="ccw-meta-item-content">
                                      <span className="ccw-meta-item-name">{p.name}</span>
                                      <span className="ccw-meta-item-sub">{p.location} • {p.ageRange} • {p.gender}</span>
                                    </div>
                                    {isSelected && <Check size={16} className="ccw-meta-item-check" />}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="ccw-meta-no-results">
                                <p className="ccw-meta-no-results-title">No results found</p>
                                <p className="ccw-meta-no-results-hint">Try searching by location, age, or interest.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Location</label>
                  <input
                    type="text"
                    className="ccw-input"
                    placeholder="e.g. India, United States, UAE"
                    value={formData.linkedinLocation}
                    onChange={(e) => updateField("linkedinLocation", e.target.value)}
                  />
                </div>

                {/* Job Function + Company */}
                <div className="tcs-grid-2">
                  <div className="tcs-field-group">
                    <label className="tcs-label">Job Function (Optional)</label>
                    <input
                      type="text"
                      className="ccw-input"
                      placeholder="e.g. Marketing, IT, Sales"
                      value={formData.linkedinJobFunction}
                      onChange={(e) => updateField("linkedinJobFunction", e.target.value)}
                    />
                  </div>
                  <div className="tcs-field-group">
                    <label className="tcs-label">Company (Optional)</label>
                    <input
                      type="text"
                      className="ccw-input"
                      placeholder="e.g. Google, Microsoft"
                      value={formData.linkedinCompany}
                      onChange={(e) => updateField("linkedinCompany", e.target.value)}
                    />
                  </div>
                </div>

                {/* Age Range + Gender */}
                <div className="tcs-grid-2">
                  <div className="tcs-field-group">
                    <label className="tcs-label">Age Range</label>
                    <select className="ccw-select" value={formData.linkedinAgeRange} onChange={(e) => updateField("linkedinAgeRange", e.target.value)}>
                      <option value="18 - 65+">18 - 65+</option>
                      <option value="18 - 24">18 - 24</option>
                      <option value="25 - 34">25 - 34</option>
                      <option value="35 - 44">35 - 44</option>
                      <option value="45 - 54">45 - 54</option>
                      <option value="55 - 64">55 - 64</option>
                      <option value="65+">65+</option>
                    </select>
                  </div>
                  <div className="tcs-field-group">
                    <label className="tcs-label">Gender</label>
                    <select className="ccw-select" value={normalizeGender(formData.linkedinGender)} onChange={(e) => updateField("linkedinGender", e.target.value)}>
                      <option value="All">All</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Budget</label>
                  <div className="tcs-budget-row">
                    <select className="ccw-select" value={formData.linkedinBudgetType} onChange={(e) => updateField("linkedinBudgetType", e.target.value)} style={{ flex: "0 0 160px" }}>
                      <option value="Daily Budget">Daily Budget</option>
                      <option value="Lifetime Budget">Lifetime Budget</option>
                    </select>
                    <div className="tcs-budget-amount">
                      <span className="tcs-currency-symbol">₹</span>
                      <input
                        type="number"
                        className="ccw-input"
                        value={formData.linkedinBudget}
                        onChange={(e) => updateField("linkedinBudget", Number(e.target.value))}
                        min={1}
                        style={{ paddingLeft: 28 }}
                      />
                      <span className="tcs-currency-label">INR</span>
                    </div>
                  </div>
                </div>

                {/* Bidding Strategy */}
                <div className="tcs-field-group">
                  <label className="tcs-label">Bidding Strategy</label>
                  <select className="ccw-select" value={formData.linkedinBiddingStrategy} onChange={(e) => updateField("linkedinBiddingStrategy", e.target.value)}>
                    <option value="Maximize Clicks">Maximize Clicks</option>
                    <option value="Maximize Conversions">Maximize Conversions</option>
                    <option value="Target Cost Per Click">Target Cost Per Click</option>
                    <option value="Target Cost Per Lead">Target Cost Per Lead</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          </div>
        );
      })()}

      {/* --------------------------------------------------------------------
          STEP 3: Ad Details & Live Preview (Image 2 - Bottom Left Card)
          -------------------------------------------------------------------- */}

      {/* --------------------------------------------------------------------
          STEP 3: Ad Details & Live Preview (Image 2 - Bottom Left Card)
          -------------------------------------------------------------------- */}

      {currentStep === 3 && (
        <div className="ccw-content-card">
          <div className="ccw-card-header">
            <h2 className="ccw-card-title">Ad Details</h2>
            <p className="ccw-card-subtitle">Create your ad creative and content.</p>
          </div>

          <div className="ccw-ad-layout">
            {/* Left Column: Creative Form Inputs */}
            <div>
              {/* Ad Name */}
              <div className="ccw-field-group">
                <div className="ccw-field-header">
                  <label className="ccw-label">
                    Ad Name <span className="ccw-label-required">*</span>
                  </label>
                  <span className="ccw-char-counter">{formData.adName.length}/100</span>
                </div>
                <input
                  type="text"
                  className="ccw-input"
                  placeholder="e.g. Summer Sale Ad - Image"
                  value={formData.adName}
                  maxLength={100}
                  onChange={(e) => updateField("adName", e.target.value)}
                />
              </div>

              {/* Ad Creative Format Tabs */}
              <div className="ccw-field-group">
                <label className="ccw-label">
                  Ad Creative <span className="ccw-label-required">*</span>
                </label>
                <div className="ccw-format-tabs">
                  <button
                    type="button"
                    className={`ccw-format-btn ${formData.adFormat === "image" ? "active" : ""}`}
                    onClick={() => handleFormatChange("image")}
                  >
                    <ImageIcon size={15} />
                    <span>Image</span>
                  </button>
                  <button
                    type="button"
                    className={`ccw-format-btn ${formData.adFormat === "video" ? "active" : ""}`}
                    onClick={() => handleFormatChange("video")}
                  >
                    <Video size={15} />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    className={`ccw-format-btn ${formData.adFormat === "carousel" ? "active" : ""}`}
                    onClick={() => handleFormatChange("carousel")}
                  >
                    <Layers size={15} />
                    <span>Carousel</span>
                  </button>
                </div>
              </div>

              {/* FORMAT 1: Single Image Mode */}
              {formData.adFormat === "image" && (
                <>
                  <div className="ccw-upload-zone">
                    <Upload size={32} className="ccw-upload-icon" />
                    <div className="ccw-upload-title">Upload Image</div>
                    <div className="ccw-upload-subtitle">Recommended size: 1200 x 628 (JPG, PNG)</div>
                    <label className="ccw-btn-choose">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            updateField("mediaUrl", url);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="ccw-field-group">
                    <label className="ccw-label" style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      Or select from design presets:
                    </label>
                    <div className="ccw-presets-grid">
                      {PRESET_THUMBNAILS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={`ccw-preset-thumb ${formData.mediaUrl === p.url ? "selected" : ""}`}
                          onClick={() => updateField("mediaUrl", p.url)}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* FORMAT 2: Video Mode */}
              {formData.adFormat === "video" && (
                <>
                  <div className="ccw-upload-zone">
                    <Video size={32} className="ccw-upload-icon" />
                    <div className="ccw-upload-title">Upload Video</div>
                    <div className="ccw-upload-subtitle">Recommended: MP4, MOV, WebM (max 100MB, 1080p, 16:9, 1:1 or 9:16)</div>
                    <label className="ccw-btn-choose">
                      Choose Video File
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,video/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setFormData((prev) => ({
                              ...prev,
                              videoUrl: url,
                              mediaUrl: url,
                              videoFileName: file.name,
                            }));
                          }
                        }}
                      />
                    </label>
                    {formData.videoFileName && (
                      <div className="ccw-video-badge">
                        <Check size={14} />
                        <span>Loaded: {formData.videoFileName}</span>
                      </div>
                    )}
                  </div>

                  <div className="ccw-field-group">
                    <label className="ccw-label" style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      Or select from sample video presets:
                    </label>
                    <div className="ccw-video-presets-grid">
                      {PRESET_VIDEOS.map((v) => {
                        const isSelected = formData.videoUrl === v.url;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            className={`ccw-video-preset-card ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                videoUrl: v.url,
                                mediaUrl: v.url,
                                videoFileName: v.label,
                              }));
                            }}
                          >
                            <div className="ccw-video-preset-thumb-wrap">
                              <img src={v.poster} alt={v.label} />
                              <div className="ccw-video-preset-play">
                                <Play size={10} fill="#ffffff" />
                              </div>
                            </div>
                            <span className="ccw-video-preset-label">{v.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* FORMAT 3: Carousel Mode */}
              {formData.adFormat === "carousel" && (
                <div className="ccw-carousel-builder">
                  <div className="ccw-carousel-header">
                    <div>
                      <div className="ccw-carousel-title">
                        Carousel Cards ({formData.carouselCards.length}/10)
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                        Add images and details for each carousel card
                      </div>
                    </div>
                    {formData.carouselCards.length < 10 && (
                      <button
                        type="button"
                        className="ccw-btn-add-card"
                        onClick={handleAddCarouselCard}
                      >
                        <Plus size={14} /> Add Card
                      </button>
                    )}
                  </div>

                  {/* Card navigation tabs */}
                  <div className="ccw-carousel-nav-tabs">
                    {formData.carouselCards.map((card, idx) => (
                      <button
                        key={card.id || idx}
                        type="button"
                        className={`ccw-carousel-nav-tab ${activeCarouselSlide === idx ? "active" : ""}`}
                        onClick={() => setActiveCarouselSlide(idx)}
                      >
                        <span>Card {idx + 1}</span>
                        {formData.carouselCards.length > 2 && (
                          <span
                            className="ccw-carousel-remove-tab-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCarouselCard(idx);
                            }}
                            title="Remove this card"
                          >
                            ✕
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Active card editor */}
                  {(() => {
                    const activeCard =
                      formData.carouselCards[activeCarouselSlide] || formData.carouselCards[0];
                    return (
                      <div className="ccw-carousel-card-editor">
                        <div className="ccw-carousel-editor-top">
                          <div className="ccw-carousel-card-thumb-wrap">
                            <img src={activeCard.imageUrl} alt="Slide preview" />
                          </div>
                          <div className="ccw-carousel-card-actions">
                            <label className="ccw-btn-choose" style={{ alignSelf: "flex-start" }}>
                              <Upload size={14} /> Upload Card Image
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    handleUpdateCarouselCard(activeCarouselSlide, "imageUrl", url);
                                  }
                                }}
                              />
                            </label>
                            <div className="ccw-presets-grid" style={{ marginBottom: 0 }}>
                              {PRESET_THUMBNAILS.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  className={`ccw-preset-thumb ${activeCard.imageUrl === p.url ? "selected" : ""}`}
                                  onClick={() => handleUpdateCarouselCard(activeCarouselSlide, "imageUrl", p.url)}
                                  title={p.label}
                                >
                                  <img src={p.url} alt={p.label} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="ccw-field-group" style={{ marginBottom: 8 }}>
                          <label className="ccw-label" style={{ fontSize: "0.78rem" }}>Card Headline *</label>
                          <input
                            type="text"
                            className="ccw-input"
                            placeholder="e.g. Card Headline"
                            value={activeCard.headline}
                            maxLength={50}
                            onChange={(e) => handleUpdateCarouselCard(activeCarouselSlide, "headline", e.target.value)}
                          />
                        </div>

                        <div className="ccw-field-group" style={{ marginBottom: 8 }}>
                          <label className="ccw-label" style={{ fontSize: "0.78rem" }}>Card Description (Optional)</label>
                          <input
                            type="text"
                            className="ccw-input"
                            placeholder="e.g. Card short description"
                            value={activeCard.description || ""}
                            maxLength={100}
                            onChange={(e) => handleUpdateCarouselCard(activeCarouselSlide, "description", e.target.value)}
                          />
                        </div>

                        <div className="ccw-field-group" style={{ marginBottom: 0 }}>
                          <label className="ccw-label" style={{ fontSize: "0.78rem" }}>Card Destination URL</label>
                          <input
                            type="url"
                            className="ccw-input"
                            placeholder="https://example.com/product"
                            value={activeCard.destinationUrl || ""}
                            onChange={(e) => handleUpdateCarouselCard(activeCarouselSlide, "destinationUrl", e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Primary Text */}
              <div className="ccw-field-group">
                <div className="ccw-field-header">
                  <label className="ccw-label">
                    Primary Text <span className="ccw-label-required">*</span>
                  </label>
                  <span className="ccw-char-counter">{formData.primaryText.length}/250</span>
                </div>
                <textarea
                  className="ccw-textarea"
                  placeholder="Write something about your product or service..."
                  value={formData.primaryText}
                  maxLength={250}
                  onChange={(e) => updateField("primaryText", e.target.value)}
                />
              </div>

              {/* Headline */}
              <div className="ccw-field-group">
                <div className="ccw-field-header">
                  <label className="ccw-label">
                    Headline <span className="ccw-label-required">*</span>
                  </label>
                  <span className="ccw-char-counter">{formData.headline.length}/50</span>
                </div>
                <input
                  type="text"
                  className="ccw-input"
                  placeholder="Enter headline..."
                  value={formData.headline}
                  maxLength={50}
                  onChange={(e) => updateField("headline", e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="ccw-field-group">
                <div className="ccw-field-header">
                  <label className="ccw-label">Description (Optional)</label>
                  <span className="ccw-char-counter">{formData.adDescription.length}/100</span>
                </div>
                <input
                  type="text"
                  className="ccw-input"
                  placeholder="Add a short description..."
                  value={formData.adDescription}
                  maxLength={100}
                  onChange={(e) => updateField("adDescription", e.target.value)}
                />
              </div>

              {/* Call to Action */}
              <div className="ccw-field-group">
                <label className="ccw-label">
                  Call to Action <span className="ccw-label-required">*</span>
                </label>
                <select
                  className="ccw-select"
                  value={formData.cta}
                  onChange={(e) => updateField("cta", e.target.value)}
                >
                  <option value="Learn More">Learn More</option>
                  <option value="Shop Now">Shop Now</option>
                  <option value="Sign Up">Sign Up</option>
                  <option value="Contact Us">Contact Us</option>
                  <option value="Book Now">Book Now</option>
                  <option value="Apply Now">Apply Now</option>
                  <option value="Get Quote">Get Quote</option>
                  <option value="Download">Download</option>
                </select>
              </div>

              {/* Destination URL */}
              <div className="ccw-field-group">
                <label className="ccw-label">Destination URL</label>
                <input
                  type="url"
                  className="ccw-input"
                  placeholder="https://example.com"
                  value={formData.destinationUrl}
                  onChange={(e) => updateField("destinationUrl", e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Live Ad Preview (matching Image 5) */}
            <div>
              <div className="ccw-preview-box">
                {/* Preview Header Bar with Platform Selector matching Image 5 */}
                <div className="ccw-preview-header-bar">
                  <div className="ccw-preview-heading-row">
                    <div className="ccw-preview-heading">Preview</div>
                    <div className="ccw-preview-platform-tabs">
                      {availablePreviewTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          className={`ccw-preview-plat-btn ${previewPlatform === tab.id ? "active" : ""}`}
                          onClick={() => setPreviewPlatform(tab.id)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {previewPlatform !== "google_search" && (
                    <div className="ccw-preview-fit-bar">
                      <span className="ccw-preview-fit-label">Display Mode:</span>
                      <div className="ccw-preview-fit-btns">
                        <button
                          type="button"
                          className={`ccw-fit-btn ${previewFitMode === "contain" ? "active" : ""}`}
                          onClick={() => setPreviewFitMode("contain")}
                          title="Show full image/video/carousel without cropping"
                        >
                          Show Full (Fit)
                        </button>
                        <button
                          type="button"
                          className={`ccw-fit-btn ${previewFitMode === "cover" ? "active" : ""}`}
                          onClick={() => setPreviewFitMode("cover")}
                          title="Fill square frame"
                        >
                          Fill (Square)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* AD MOCK: Facebook Feed Mode */}
                {previewPlatform === "facebook" && (
                  <div className="ccw-ad-mock ccw-ad-mock-fb">
                    {/* Mock Header */}
                    <div className="ccw-ad-mock-header">
                      <div className="ccw-ad-mock-header-left">
                        <div className="ccw-mock-avatar">
                          {formData.adAccount.charAt(0) || "A"}
                        </div>
                        <div className="ccw-mock-author">
                          <span className="ccw-mock-name">
                            {formData.adAccount.replace(/\s*\(ID:.*\)/, "") || "ABC Media"}
                          </span>
                          <span className="ccw-mock-sponsored">
                            {getPlatformKey(formData.platform) === "google"
                              ? "Sponsored · Google"
                              : getPlatformKey(formData.platform) === "linkedin"
                                ? "Promoted"
                                : getPlatformKey(formData.platform) === "youtube"
                                  ? "Ad · YouTube"
                                  : "Sponsored · 🌐"}
                          </span>
                        </div>
                      </div>
                      <div className="ccw-ad-mock-header-right">
                        <button type="button" className="ccw-mock-icon-btn" title="Options">
                          <MoreHorizontal size={18} />
                        </button>
                        <button type="button" className="ccw-mock-icon-btn" title="Close">
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Mock Primary Text */}
                    <div className="ccw-mock-caption">
                      {formData.primaryText || "Write something about your product or service..."}
                    </div>

                    {/* Mock Media: Image, Video, or Carousel */}
                    {formData.adFormat === "video" ? (
                      <div className={`ccw-mock-media ccw-mock-media-video ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                        {(formData.videoUrl || formData.mediaUrl) ? (
                          <video
                            key={formData.videoUrl || formData.mediaUrl}
                            src={formData.videoUrl || formData.mediaUrl}
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="ccw-preview-video"
                          />
                        ) : (
                          <div className="ccw-mock-media-empty">
                            <Video size={36} />
                            <span>No video selected</span>
                          </div>
                        )}
                      </div>
                    ) : formData.adFormat === "carousel" ? (
                      <div className="ccw-carousel-preview-wrap">
                        {(() => {
                          const currentCard =
                            formData.carouselCards[activeCarouselSlide] ||
                            formData.carouselCards[0];
                          return (
                            <div className={`ccw-carousel-slide ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                              {currentCard.imageUrl && previewFitMode === "contain" && (
                                <div
                                  className="ccw-carousel-slide-blur-bg"
                                  style={{ backgroundImage: `url(${currentCard.imageUrl})` }}
                                />
                              )}
                              <img
                                src={currentCard.imageUrl}
                                alt={currentCard.headline}
                                className="ccw-carousel-slide-img"
                              />
                              <div className="ccw-carousel-badge-counter">
                                {activeCarouselSlide + 1} / {formData.carouselCards.length}
                              </div>

                              {/* Carousel Navigation Arrows */}
                              <button
                                type="button"
                                className="ccw-carousel-nav-btn prev"
                                onClick={handlePrevCarouselSlide}
                                title="Previous slide"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button
                                type="button"
                                className="ccw-carousel-nav-btn next"
                                onClick={handleNextCarouselSlide}
                                title="Next slide"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          );
                        })()}

                        {/* Dots indicator */}
                        <div className="ccw-carousel-dots">
                          {formData.carouselCards.map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`ccw-carousel-dot ${activeCarouselSlide === dotIdx ? "active" : ""}`}
                              onClick={() => setActiveCarouselSlide(dotIdx)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`ccw-mock-media ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                        {formData.mediaUrl ? (
                          <>
                            {previewFitMode === "contain" && (
                              <div
                                className="ccw-mock-media-blur-bg"
                                style={{ backgroundImage: `url(${formData.mediaUrl})` }}
                              />
                            )}
                            <img
                              src={formData.mediaUrl}
                              alt={formData.headline || "Ad Creative Preview"}
                              className="ccw-mock-media-main-img"
                            />
                          </>
                        ) : (
                          <div className="ccw-mock-media-empty">
                            <ImageIcon size={32} />
                            <span>No image selected</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mock Footer Bar */}
                    <div className="ccw-mock-footer">
                      <div className="ccw-mock-info">
                        <span className="ccw-mock-domain">
                          {formData.adFormat === "carousel"
                            ? (formData.carouselCards[activeCarouselSlide]?.destinationUrl || formData.destinationUrl || "EXAMPLE.COM")
                              .replace(/^https?:\/\//, "")
                              .split("/")[0]
                            : formData.destinationUrl
                              ? formData.destinationUrl.replace(/^https?:\/\//, "").split("/")[0]
                              : "EXAMPLE.COM"}
                        </span>
                        <span className="ccw-mock-headline">
                          {formData.adFormat === "carousel"
                            ? (formData.carouselCards[activeCarouselSlide]?.headline || formData.headline || "Headline")
                            : (formData.headline || "Headline")}
                        </span>
                        {formData.adFormat === "carousel" && formData.carouselCards[activeCarouselSlide]?.description && (
                          <span className="ccw-mock-subdesc">
                            {formData.carouselCards[activeCarouselSlide].description}
                          </span>
                        )}
                      </div>
                      <button type="button" className="ccw-mock-cta-btn">
                        {formData.cta || "Learn More"}
                      </button>
                    </div>

                    {/* Social Action Bar matching Image 5 */}
                    <div className="ccw-mock-social-bar">
                      <button type="button" className="ccw-social-action-btn">
                        <ThumbsUp size={16} />
                        <span>Like</span>
                      </button>
                      <button type="button" className="ccw-social-action-btn">
                        <MessageCircle size={16} />
                        <span>Comment</span>
                      </button>
                      <button type="button" className="ccw-social-action-btn">
                        <Share2 size={16} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* AD MOCK: Instagram Feed Mode (matching Image 5 Right Card) */}
                {previewPlatform === "instagram" && (
                  <div className="ccw-ad-mock ccw-ad-mock-ig">
                    {/* Instagram Brand / Profile Header */}
                    <div className="ccw-ig-brand-row">
                      <span style={{ fontFamily: "serif", fontStyle: "italic", fontSize: "1.1rem", fontWeight: 700 }}>Instagram</span>
                      <MoreHorizontal size={18} color="#64748b" />
                    </div>

                    <div className="ccw-ig-header">
                      <div className="ccw-ig-profile-info">
                        <div className="ccw-ig-avatar">
                          <div className="ccw-ig-avatar-inner">
                            {formData.adAccount.charAt(0) || "A"}
                          </div>
                        </div>
                        <div className="ccw-ig-meta">
                          <span className="ccw-ig-meta-name">
                            {formData.adAccount
                              .replace(/\s*\(ID:.*\)/, "")
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, "") || "adstradigital"}
                          </span>
                          <span className="ccw-ig-meta-sponsored">Sponsored</span>
                        </div>
                      </div>
                      <button type="button" className="ccw-mock-icon-btn">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    {/* Media Area */}
                    {formData.adFormat === "video" ? (
                      <div className={`ccw-mock-media ccw-mock-media-video ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                        {(formData.videoUrl || formData.mediaUrl) ? (
                          <video
                            key={formData.videoUrl || formData.mediaUrl}
                            src={formData.videoUrl || formData.mediaUrl}
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="ccw-preview-video"
                          />
                        ) : (
                          <div className="ccw-mock-media-empty">
                            <Video size={36} />
                            <span>No video selected</span>
                          </div>
                        )}
                      </div>
                    ) : formData.adFormat === "carousel" ? (
                      <div className="ccw-carousel-preview-wrap">
                        {(() => {
                          const currentCard =
                            formData.carouselCards[activeCarouselSlide] ||
                            formData.carouselCards[0];
                          return (
                            <div className={`ccw-carousel-slide ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                              {currentCard.imageUrl && previewFitMode === "contain" && (
                                <div
                                  className="ccw-carousel-slide-blur-bg"
                                  style={{ backgroundImage: `url(${currentCard.imageUrl})` }}
                                />
                              )}
                              <img
                                src={currentCard.imageUrl}
                                alt={currentCard.headline}
                                className="ccw-carousel-slide-img"
                              />
                              <div className="ccw-carousel-badge-counter">
                                {activeCarouselSlide + 1} / {formData.carouselCards.length}
                              </div>

                              <button
                                type="button"
                                className="ccw-carousel-nav-btn prev"
                                onClick={handlePrevCarouselSlide}
                                title="Previous slide"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button
                                type="button"
                                className="ccw-carousel-nav-btn next"
                                onClick={handleNextCarouselSlide}
                                title="Next slide"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          );
                        })()}

                        <div className="ccw-carousel-dots">
                          {formData.carouselCards.map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`ccw-carousel-dot ${activeCarouselSlide === dotIdx ? "active" : ""}`}
                              onClick={() => setActiveCarouselSlide(dotIdx)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`ccw-mock-media ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                        {formData.mediaUrl ? (
                          <>
                            {previewFitMode === "contain" && (
                              <div
                                className="ccw-mock-media-blur-bg"
                                style={{ backgroundImage: `url(${formData.mediaUrl})` }}
                              />
                            )}
                            <img
                              src={formData.mediaUrl}
                              alt={formData.headline || "Ad Creative Preview"}
                              className="ccw-mock-media-main-img"
                            />
                          </>
                        ) : (
                          <div className="ccw-mock-media-empty">
                            <ImageIcon size={32} />
                            <span>No image selected</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Instagram Engagement Action Icons Bar */}
                    <div className="ccw-ig-actions">
                      <div className="ccw-ig-actions-left">
                        <button type="button" className="ccw-ig-action-btn" title="Like">
                          <Heart size={22} />
                        </button>
                        <button type="button" className="ccw-ig-action-btn" title="Comment">
                          <MessageCircle size={22} />
                        </button>
                        <button type="button" className="ccw-ig-action-btn" title="Share">
                          <Send size={20} />
                        </button>
                      </div>
                      <button type="button" className="ccw-ig-action-btn" title="Save">
                        <Bookmark size={22} />
                      </button>
                    </div>

                    {/* Instagram CTA Strip */}
                    <div className="ccw-ig-cta-strip">
                      <span className="ccw-ig-cta-headline">
                        {formData.headline || "Special Offer"}
                      </span>
                      <span className="ccw-ig-cta-action">
                        {formData.cta || "Learn More"} &gt;
                      </span>
                    </div>

                    {/* Instagram Caption Block */}
                    <div className="ccw-ig-caption-block">
                      <span className="ccw-ig-caption-author">
                        {formData.adAccount
                          .replace(/\s*\(ID:.*\)/, "")
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, "") || "adstradigital"}
                      </span>
                      <span>
                        {formData.primaryText || "Write something about your product or service..."}
                      </span>
                    </div>
                  </div>
                )}

                {/* AD MOCK: Google Search Ad Mode */}
                {previewPlatform === "google_search" && (
                  <div className="ccw-ad-mock ccw-ad-mock-google-search">
                    {/* Simulated Google Search Chrome */}
                    <div className="ccw-google-chrome-bar">
                      <div className="ccw-google-chrome-dots">
                        <span className="dot red" />
                        <span className="dot yellow" />
                        <span className="dot green" />
                      </div>
                      <div className="ccw-google-search-input-mock">
                        <Search size={14} color="#5f6368" />
                        <span className="ccw-google-query-text">
                          {formData.googleKeywords ? formData.googleKeywords.split(",")[0].trim() : formData.name || "summer sale online"}
                        </span>
                      </div>
                    </div>

                    <div className="ccw-google-search-body">
                      {/* Sponsored Tag & URL */}
                      <div className="ccw-google-url-row">
                        <div className="ccw-google-favicon">
                          <Globe size={13} color="#5f6368" />
                        </div>
                        <div className="ccw-google-url-meta">
                          <div className="ccw-google-domain-line">
                            <span className="ccw-google-sponsor-tag">Sponsored</span>
                            <span className="ccw-google-dot">•</span>
                            <span className="ccw-google-client-name">{formData.client || "ABC Media"}</span>
                          </div>
                          <div className="ccw-google-display-url">
                            https://{(formData.destinationUrl || "example.com").replace(/^https?:\/\//, "").split("/")[0]}
                            <span className="ccw-google-path"> &gt; deals</span>
                          </div>
                        </div>
                        <button type="button" className="ccw-mock-icon-btn" title="Ad options">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>

                      {/* Search Ad Headline */}
                      <a
                        href={formData.destinationUrl || "#"}
                        onClick={(e) => e.preventDefault()}
                        className="ccw-google-headline-link"
                      >
                        {formData.headline || "Summer Sale - Up to 50% Off"} | {(formData.adAccount || "").replace(/\s*\(ID:.*\)/, "") || formData.client || "Official Store"}
                      </a>

                      {/* Search Ad Description */}
                      <p className="ccw-google-snippet">
                        {formData.primaryText || "Get up to 50% off on premium footwear and summer essentials. Limited period offer!"}{" "}
                        {formData.adDescription || "Free shipping and easy 30-day returns on all domestic orders."}
                      </p>

                      {/* Callout Badges */}
                      <div className="ccw-google-callouts-row">
                        <span className="ccw-google-callout-pill">✓ Free Shipping Over ₹999</span>
                        <span className="ccw-google-callout-pill">✓ 30-Day Easy Returns</span>
                        <span className="ccw-google-callout-pill">✓ 100% Genuine Products</span>
                      </div>

                      {/* Google Sitelinks Grid */}
                      <div className="ccw-google-sitelinks-grid">
                        <div className="ccw-google-sitelink-item">
                          <span className="ccw-google-sitelink-title">New Arrivals</span>
                          <span className="ccw-google-sitelink-desc">Browse freshest drops with instant seasonal discounts.</span>
                        </div>
                        <div className="ccw-google-sitelink-item">
                          <span className="ccw-google-sitelink-title">Best Sellers</span>
                          <span className="ccw-google-sitelink-desc">Top-rated footwear and apparel up to 50% off.</span>
                        </div>
                        <div className="ccw-google-sitelink-item">
                          <span className="ccw-google-sitelink-title">Customer Reviews (4.9★)</span>
                          <span className="ccw-google-sitelink-desc">Read feedback from over 10,000+ satisfied shoppers.</span>
                        </div>
                        <div className="ccw-google-sitelink-item">
                          <span className="ccw-google-sitelink-title">24/7 Dedicated Support</span>
                          <span className="ccw-google-sitelink-desc">Fast order tracking, customer help and inquiries.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AD MOCK: Google Display Network Mode */}
                {previewPlatform === "google_display" && (
                  <div className="ccw-ad-mock ccw-ad-mock-google-display">
                    <div className="ccw-gd-top-bar">
                      <div className="ccw-gd-advertiser-info">
                        <span className="ccw-gd-badge">Ad</span>
                        <span className="ccw-gd-brand-name">{formData.client || "ABC Media"}</span>
                      </div>
                      <div className="ccw-gd-adchoices" title="AdChoices by Google">
                        <span className="ccw-gd-choices-text">AdChoices</span>
                        <Info size={13} color="#5f6368" />
                      </div>
                    </div>

                    {formData.adFormat === "video" ? (
                      <div className={`ccw-mock-media ccw-mock-media-video ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                        {(formData.videoUrl || formData.mediaUrl) ? (
                          <video
                            key={formData.videoUrl || formData.mediaUrl}
                            src={formData.videoUrl || formData.mediaUrl}
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="ccw-preview-video"
                          />
                        ) : (
                          <div className="ccw-mock-media-empty">
                            <Video size={36} />
                            <span>No video selected</span>
                          </div>
                        )}
                      </div>
                    ) : formData.adFormat === "carousel" ? (
                      <div className="ccw-carousel-preview-wrap">
                        {(() => {
                          const currentCard = formData.carouselCards[activeCarouselSlide] || formData.carouselCards[0];
                          return (
                            <div className={`ccw-carousel-slide ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                              {currentCard.imageUrl && previewFitMode === "contain" && (
                                <div
                                  className="ccw-carousel-slide-blur-bg"
                                  style={{ backgroundImage: `url(${currentCard.imageUrl})` }}
                                />
                              )}
                              <img src={currentCard.imageUrl} alt={currentCard.headline} className="ccw-carousel-slide-img" />
                              <div className="ccw-carousel-badge-counter">
                                {activeCarouselSlide + 1} / {formData.carouselCards.length}
                              </div>
                              <button type="button" className="ccw-carousel-nav-btn prev" onClick={handlePrevCarouselSlide}>
                                <ChevronLeft size={16} />
                              </button>
                              <button type="button" className="ccw-carousel-nav-btn next" onClick={handleNextCarouselSlide}>
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          );
                        })()}
                        <div className="ccw-carousel-dots">
                          {formData.carouselCards.map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`ccw-carousel-dot ${activeCarouselSlide === dotIdx ? "active" : ""}`}
                              onClick={() => setActiveCarouselSlide(dotIdx)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`ccw-mock-media ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                        {formData.mediaUrl ? (
                          <>
                            {previewFitMode === "contain" && (
                              <div
                                className="ccw-mock-media-blur-bg"
                                style={{ backgroundImage: `url(${formData.mediaUrl})` }}
                              />
                            )}
                            <img
                              src={formData.mediaUrl}
                              alt={formData.headline || "Ad Creative"}
                              className="ccw-mock-media-main-img"
                            />
                          </>
                        ) : (
                          <div className="ccw-mock-media-empty">
                            <ImageIcon size={32} />
                            <span>No image selected</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="ccw-gd-footer">
                      <div className="ccw-gd-text-block">
                        <div className="ccw-gd-headline">{formData.headline || "Summer Sale - Up to 50% Off"}</div>
                        <div className="ccw-gd-desc">
                          {formData.primaryText || "Get up to 50% off on premium footwear and summer essentials."}
                        </div>
                        <div className="ccw-gd-domain">
                          {(formData.destinationUrl || "example.com").replace(/^https?:\/\//, "").split("/")[0]}
                        </div>
                      </div>
                      <button type="button" className="ccw-gd-cta-btn">
                        {formData.cta || "Visit Site"}
                      </button>
                    </div>
                  </div>
                )}

                {/* AD MOCK: LinkedIn Feed Mode */}
                {previewPlatform === "linkedin" && (
                  <div className="ccw-ad-mock ccw-ad-mock-li">
                    <div className="ccw-li-header">
                      <div className="ccw-li-header-left">
                        <div className="ccw-li-avatar">
                          {(formData.adAccount || "A").charAt(0) || "A"}
                        </div>
                        <div className="ccw-li-author-meta">
                          <div className="ccw-li-name-row">
                            <span className="ccw-li-author-name">
                              {(formData.adAccount || "").replace(/\s*\(ID:.*\)/, "") || formData.client || "ABC Media"}
                            </span>
                            <span className="ccw-li-degree">• 1st</span>
                          </div>
                          <span className="ccw-li-followers">18,420 followers</span>
                          <span className="ccw-li-promoted">
                            Promoted • <Globe size={11} className="ccw-li-globe-icon" />
                          </span>
                        </div>
                      </div>
                      <div className="ccw-li-header-right">
                        <button type="button" className="ccw-li-follow-btn">
                          <Plus size={12} strokeWidth={2.5} />
                          <span>Follow</span>
                        </button>
                        <button type="button" className="ccw-mock-icon-btn" title="More options">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="ccw-li-caption">
                      {formData.primaryText || "Write something about your product or service..."}
                    </div>

                    {formData.adFormat === "video" ? (
                      <div className={`ccw-mock-media ccw-mock-media-video ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                        {(formData.videoUrl || formData.mediaUrl) ? (
                          <video
                            key={formData.videoUrl || formData.mediaUrl}
                            src={formData.videoUrl || formData.mediaUrl}
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="ccw-preview-video"
                          />
                        ) : (
                          <div className="ccw-mock-media-empty">
                            <Video size={36} />
                            <span>No video selected</span>
                          </div>
                        )}
                      </div>
                    ) : formData.adFormat === "carousel" ? (
                      <div className="ccw-carousel-preview-wrap">
                        {(() => {
                          const currentCard = formData.carouselCards[activeCarouselSlide] || formData.carouselCards[0];
                          return (
                            <div className={`ccw-carousel-slide ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                              {currentCard.imageUrl && previewFitMode === "contain" && (
                                <div
                                  className="ccw-carousel-slide-blur-bg"
                                  style={{ backgroundImage: `url(${currentCard.imageUrl})` }}
                                />
                              )}
                              <img src={currentCard.imageUrl} alt={currentCard.headline} className="ccw-carousel-slide-img" />
                              <div className="ccw-carousel-badge-counter">
                                {activeCarouselSlide + 1} / {formData.carouselCards.length}
                              </div>
                              <button type="button" className="ccw-carousel-nav-btn prev" onClick={handlePrevCarouselSlide}>
                                <ChevronLeft size={16} />
                              </button>
                              <button type="button" className="ccw-carousel-nav-btn next" onClick={handleNextCarouselSlide}>
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          );
                        })()}
                        <div className="ccw-carousel-dots">
                          {formData.carouselCards.map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`ccw-carousel-dot ${activeCarouselSlide === dotIdx ? "active" : ""}`}
                              onClick={() => setActiveCarouselSlide(dotIdx)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`ccw-mock-media ${previewFitMode === "cover" ? "fit-cover" : "fit-contain"}`}>
                        {formData.mediaUrl ? (
                          <>
                            {previewFitMode === "contain" && (
                              <div
                                className="ccw-mock-media-blur-bg"
                                style={{ backgroundImage: `url(${formData.mediaUrl})` }}
                              />
                            )}
                            <img
                              src={formData.mediaUrl}
                              alt={formData.headline || "Ad Creative"}
                              className="ccw-mock-media-main-img"
                            />
                          </>
                        ) : (
                          <div className="ccw-mock-media-empty">
                            <ImageIcon size={32} />
                            <span>No image selected</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="ccw-li-footer">
                      <div className="ccw-li-footer-info">
                        <span className="ccw-li-domain">
                          {(formData.destinationUrl || "example.com")
                            .replace(/^https?:\/\//, "")
                            .split("/")[0]
                            .toLowerCase()}
                        </span>
                        <span className="ccw-li-headline">
                          {formData.headline || "Summer Sale - Up to 50% Off"}
                        </span>
                      </div>
                      <button type="button" className="ccw-li-cta-btn">
                        {formData.cta || "Apply Now"}
                      </button>
                    </div>

                    <div className="ccw-li-reactions-count">
                      <div className="ccw-li-reaction-icons">
                        <span className="ccw-li-reaction-icon like">👍</span>
                        <span className="ccw-li-reaction-icon celebrate">👏</span>
                        <span className="ccw-li-reaction-icon love">❤️</span>
                        <span className="ccw-li-reaction-num">342</span>
                      </div>
                      <div className="ccw-li-comments-count">38 comments • 14 reposts</div>
                    </div>

                    <div className="ccw-li-actions-bar">
                      <button type="button" className="ccw-li-action-btn">
                        <ThumbsUp size={16} />
                        <span>Like</span>
                      </button>
                      <button type="button" className="ccw-li-action-btn">
                        <MessageCircle size={16} />
                        <span>Comment</span>
                      </button>
                      <button type="button" className="ccw-li-action-btn">
                        <Share2 size={16} />
                        <span>Repost</span>
                      </button>
                      <button type="button" className="ccw-li-action-btn">
                        <Send size={15} />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          STEP 4: Review & Publish (Image 2 - Bottom Right Card)
          -------------------------------------------------------------------- */}
      {currentStep === 4 && (
        <div className="ccw-content-card">
          <div className="ccw-card-header">
            <h2 className="ccw-card-title">Review &amp; Publish</h2>
            <p className="ccw-card-subtitle">Please review your campaign details before publishing.</p>
          </div>

          <div className="ccw-review-grid">
            {/* 1. Campaign Details Review */}
            <div className="ccw-review-card">
              <div className="ccw-review-header">
                <Layers size={16} color="#2563eb" />
                <span>Campaign Details</span>
              </div>
              <div className="ccw-review-body">
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Client</span>
                  <span className="ccw-review-val">{formData.client}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Campaign Name</span>
                  <span className="ccw-review-val">{formData.name}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Start Date</span>
                  <span className="ccw-review-val">{formData.startDate}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Objective</span>
                  <span className="ccw-review-val">{formData.objective}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">End Date</span>
                  <span className="ccw-review-val">{formData.endDate || "-"}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Ad Account</span>
                  <span className="ccw-review-val">{formData.adAccount}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Description</span>
                  <span className="ccw-review-val">{formData.description || "-"}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Platforms</span>
                  <span className="ccw-review-val">
                    {Array.isArray(formData.platforms) && formData.platforms.length > 0
                      ? formData.platforms.join(", ")
                      : formData.platform}
                  </span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Budget</span>
                  <span className="ccw-review-val">
                    {formData.budgetType || "Daily Budget"}: {formData.budgetCurrency === "USD" ? "$" : formData.budgetCurrency === "EUR" ? "€" : formData.budgetCurrency === "GBP" ? "£" : "₹"} {formData.budget} ({formData.budgetCurrency || "INR"})
                  </span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Status</span>
                  <span className="ccw-review-val" style={{ color: "#2563eb" }}>
                    {formData.status}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Audience & Placements Review */}
            <div className="ccw-review-card">
              <div className="ccw-review-header">
                <Eye size={16} color="#059669" />
                <span>Audience &amp; Placements</span>
              </div>
              <div className="ccw-review-body">
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Locations</span>
                  <span className="ccw-review-val">{formData.location}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Placements</span>
                  <span className="ccw-review-val">
                    {formData.placement === "automatic"
                      ? "Automatic Placements"
                      : `Manual (${(formData.manualPlatforms || []).join(", ")})`}
                  </span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Age Range</span>
                  <span className="ccw-review-val">{formData.ageRange}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Optimization</span>
                  <span className="ccw-review-val">{formData.optimizationFor}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Gender</span>
                  <span className="ccw-review-val">
                    {normalizeGender(formData.gender)}
                  </span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Conversion Event</span>
                  <span className="ccw-review-val">{formData.conversionEvent || "None"}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Interests</span>
                  <span className="ccw-review-val">{formData.interests || "Not specified"}</span>
                </div>
              </div>
            </div>

            {/* 3. Ad Details Review */}
            <div className="ccw-review-card">
              <div className="ccw-review-header">
                <FileCheck size={16} color="#d97706" />
                <span>Ad Details</span>
              </div>
              <div className="ccw-review-body">
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Ad Name</span>
                  <span className="ccw-review-val">{formData.adName}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Primary Text</span>
                  <span className="ccw-review-val">{formData.primaryText}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Creative Format</span>
                  <span className="ccw-review-val">
                    {formData.adFormat === "carousel"
                      ? `Carousel (${formData.carouselCards?.length || 0} cards)`
                      : formData.adFormat === "video"
                        ? "Video Ad"
                        : "Single Image"}
                  </span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">CTA Button</span>
                  <span className="ccw-review-val">{formData.cta}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Headline</span>
                  <span className="ccw-review-val">{formData.headline}</span>
                </div>
                <div className="ccw-review-item">
                  <span className="ccw-review-label">Destination URL</span>
                  <span className="ccw-review-val">{formData.destinationUrl}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          Navigation Actions Bar
          -------------------------------------------------------------------- */}
      <div className="ccw-actions-bar">
        <button
          type="button"
          className="ccw-btn-back"
          onClick={currentStep === 1 ? onCancel : handleBack}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="ccw-actions-right">
          {currentStep === 1 && (
            <button type="button" className="ccw-btn-next" onClick={handleNext}>
              <span>Next: {steps[1]?.label || "Targeting & Campaign Settings"}</span>
              <ArrowRight size={16} />
            </button>
          )}

          {currentStep === 2 && (
            <button type="button" className="ccw-btn-next" onClick={handleNext}>
              <span>Next: Ad Details</span>
              <ArrowRight size={16} />
            </button>
          )}

          {currentStep === 3 && (
            <button type="button" className="ccw-btn-next" onClick={handleNext}>
              <span>Next: Review &amp; Publish</span>
              <ArrowRight size={16} />
            </button>
          )}

          {currentStep === 4 && (
            <>
              <button
                type="button"
                className="ccw-btn-draft"
                disabled={saving}
                onClick={() => handleSubmit("Draft")}
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="ccw-btn-publish"
                disabled={saving}
                onClick={() => handleSubmit("Active")}
              >
                <CheckCircle2 size={16} />
                <span>{saving ? "Publishing..." : "Publish Campaign"}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


