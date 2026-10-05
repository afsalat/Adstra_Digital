"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import "./CampaignManagementSection.css";
import CreateCampaignWizard from "./CreateCampaignWizard";
import MetaAudienceSection from "./MetaAudienceSection";

import {
  Search,
  Plus,
  RotateCcw,
  Calendar,
  Layers,
  Link2,
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  MoreVertical,
  Edit2,
  Pause,
  Play,
  Copy,
  Trash2,
  X,
  Volume2,
  Eye,
  Users,
  ShoppingCart,
  MousePointer,
  MessageSquare,
  CheckCircle,
  CheckCircle2,
  Archive,
  AlertTriangle,
} from "lucide-react";

// Curated thumbnail presets matching Image 3 design
export const PRESET_THUMBNAILS = [
  { id: "sneaker", label: "Sneaker", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&auto=format&fit=crop&q=80" },
  { id: "team", label: "Team", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&auto=format&fit=crop&q=80" },
  { id: "realestate", label: "Real Estate", url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=800&auto=format&fit=crop&q=80" },
  { id: "cosmetics", label: "Cosmetics", url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=800&auto=format&fit=crop&q=80" },
  { id: "tech", label: "Tech", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=800&auto=format&fit=crop&q=80" },
  { id: "headphones", label: "Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&auto=format&fit=crop&q=80" },
  { id: "pink_headphones", label: "Pink Audio", url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&auto=format&fit=crop&q=80" },
  { id: "food", label: "Restaurant", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&auto=format&fit=crop&q=80" },
];

// No hardcoded dummy campaigns — table starts empty until backend data loads
const INITIAL_IMAGE3_CAMPAIGNS = [];

// Helper: map backend campaign object to Image 3 table format
function mapBackendCampaign(c, index) {
  const codeNum = String(index + 1).padStart(3, "0");
  const d = c.created_at ? new Date(c.created_at) : new Date();
  const dateFormatted = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const timeFormatted = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  let objectiveLabel = "Awareness";
  const obj = (c.objective || "").toLowerCase();
  if (obj.includes("brand") || obj === "brand_awareness") objectiveLabel = "Brand Awareness";
  else if (obj.includes("traffic")) objectiveLabel = "Traffic";
  else if (obj.includes("engage")) objectiveLabel = "Engagement";
  else if (obj.includes("lead")) objectiveLabel = "Leads";
  else if (obj.includes("conversion") || obj.includes("sale")) objectiveLabel = "Conversions";

  let statusLabel = "Draft";
  const st = (c.status || "").toLowerCase();
  if (st === "active") statusLabel = "Active";
  else if (st === "paused") statusLabel = "Paused";
  else if (st === "completed") statusLabel = "Completed";
  else if (st === "archived") statusLabel = "Archived";

  const platforms = Array.isArray(c.platforms) ? c.platforms : [];
  const isInsta = platforms.some((p) => String(p).toLowerCase().includes("instagram"));
  const platform = isInsta ? "Instagram" : "Facebook";

  return {
    id: c.id ? `backend-${c.id}` : `local-${index}`,
    backendId: c.id || null,
    camCode: `CAM-${codeNum}`,
    name: c.name || "Untitled Campaign",
    thumbnail: PRESET_THUMBNAILS[index % PRESET_THUMBNAILS.length].url,
    objective: objectiveLabel,
    status: statusLabel,
    platform: platform,
    adAccount: c.client_name || c.client_profile_name || "Adstra Digital",
    dateCreated: dateFormatted,
    timeCreated: timeFormatted,
    rawDate: c.created_at || new Date().toISOString(),
    budget: Number(c.budget || 50000),
    spent: Number(c.spent || 0),
  };
}

export default function CampaignManagementSection({
  campaigns = [],
  clients = [],
  selectedClientId = "all",
  activeSubsection = "management",
  onSelectSubsection,
  onRefresh,
}) {
  const [currentSub, setCurrentSub] = useState(activeSubsection || "management");

  useEffect(() => {
    if (activeSubsection) setCurrentSub(activeSubsection);
  }, [activeSubsection]);

  // Campaign state: start with Image 3 campaigns or merge with backend campaigns
  const [campaignList, setCampaignList] = useState(() => {
    if (campaigns && campaigns.length > 0) {
      return campaigns.map((c, i) => mapBackendCampaign(c, i));
    }
    return INITIAL_IMAGE3_CAMPAIGNS;
  });

  // Sync if backend campaigns arrive
  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      const mapped = campaigns.map((c, i) => mapBackendCampaign(c, i));
      setCampaignList(mapped);
    }
  }, [campaigns]);

  // Filters state (Image 3 format)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [objectiveFilter, setObjectiveFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Sorting state
  const [sortField, setSortField] = useState("rawDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // Active Dropdown Menu row ID
  const [activeMenuId, setActiveMenuId] = useState(null);

  // View mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState("list");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetCampaign, setTargetCampaign] = useState(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Close menus on outside click
  const tableRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activeMenuId && !e.target.closest(".cm-actions-cell")) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [activeMenuId]);

  // Sorting handler
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter & Search Logic
  const filteredCampaigns = useMemo(() => {
    return campaignList.filter((c) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesCode = c.camCode?.toLowerCase().includes(q);
        const matchesAccount = c.adAccount?.toLowerCase().includes(q);
        const matchesObjective = c.objective?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesAccount && !matchesObjective) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== "all") {
        if (c.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Objective Filter
      if (objectiveFilter !== "all") {
        const obj = c.objective.toLowerCase();
        const target = objectiveFilter.toLowerCase();
        if (target === "conversions" && !obj.includes("conversion") && !obj.includes("sale")) return false;
        if (target === "awareness" && obj !== "awareness") return false;
        if (target === "brand awareness" && obj !== "brand awareness") return false;
        if (target === "leads" && !obj.includes("lead")) return false;
        if (target === "traffic" && !obj.includes("traffic")) return false;
        if (target === "engagement" && !obj.includes("engage")) return false;
      }

      // 4. Platform / Ad Account Filter
      if (platformFilter !== "all") {
        const p = platformFilter.toLowerCase();
        const cp = (c.platform || "").toLowerCase();
        if (p === "facebook" && !cp.includes("facebook")) return false;
        if (p === "instagram" && !cp.includes("instagram")) return false;
        if (p === "meta" && !cp.includes("meta") && !cp.includes("facebook") && !cp.includes("instagram")) return false;
        if (p === "google" && !cp.includes("google")) return false;
        if (p !== "facebook" && p !== "instagram" && p !== "meta" && p !== "google") {
          // Specific account filter
          if (!c.adAccount.toLowerCase().includes(p)) return false;
        }
      }

      // 5. Date Filter
      if (dateFilter !== "all") {
        const dateObj = new Date(c.rawDate);
        const now = new Date();
        const diffDays = (now - dateObj) / (1000 * 60 * 60 * 24);

        if (dateFilter === "today" && diffDays > 1) return false;
        if (dateFilter === "7d" && diffDays > 7) return false;
        if (dateFilter === "30d" && diffDays > 30) return false;
        if (dateFilter === "this_month") {
          if (dateObj.getMonth() !== now.getMonth() || dateObj.getFullYear() !== now.getFullYear()) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "rawDate") {
        valA = new Date(a.rawDate).getTime();
        valB = new Date(b.rawDate).getTime();
      } else if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [campaignList, searchQuery, statusFilter, objectiveFilter, platformFilter, dateFilter, sortField, sortOrder]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setObjectiveFilter("all");
    setDateFilter("all");
    setPlatformFilter("all");
    showToast("Filters reset to default");
  };

  // Quick Action: Pause / Resume Campaign
  const handleTogglePauseResume = (camp) => {
    setActiveMenuId(null);
    const newStatus = camp.status === "Active" ? "Paused" : "Active";
    setCampaignList((prev) =>
      prev.map((item) => (item.id === camp.id ? { ...item, status: newStatus } : item))
    );

    // If campaign has backend ID, try updating backend
    if (camp.backendId) {
      axios
        .patch(`${API_BASE_URL}/social/campaigns/${camp.backendId}/`, {
          status: newStatus.toLowerCase(),
        })
        .catch(() => { });
    }

    showToast(`Campaign "${camp.name}" is now ${newStatus}`);
  };

  // Quick Action: Duplicate Campaign
  const handleDuplicateCampaign = (camp) => {
    setActiveMenuId(null);
    const nextNum = campaignList.length + 1;
    const newCode = `CAM-${String(nextNum).padStart(3, "0")}`;
    const now = new Date();

    const duplicated = {
      ...camp,
      id: `dup-${Date.now()}`,
      backendId: null,
      camCode: newCode,
      name: `${camp.name} (Copy)`,
      status: "Draft",
      dateCreated: now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      timeCreated: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      rawDate: now.toISOString(),
      spent: 0,
    };

    setCampaignList((prev) => [duplicated, ...prev]);
    showToast(`Duplicated "${camp.name}" as ${newCode}`);
  };

  // Quick Action: Open Edit Wizard
  const handleOpenEdit = (camp) => {
    setActiveMenuId(null);
    setTargetCampaign(camp);
    setViewMode("edit");
  };

  // Quick Action: Open Delete/Archive Dialog
  const handleOpenDeleteArchive = (camp) => {
    setActiveMenuId(null);
    setTargetCampaign(camp);
    setDeleteModalOpen(true);
  };

  // Execute Archive
  const handleConfirmArchive = () => {
    if (!targetCampaign) return;
    setCampaignList((prev) =>
      prev.map((item) => (item.id === targetCampaign.id ? { ...item, status: "Archived" } : item))
    );
    if (targetCampaign.backendId) {
      axios
        .patch(`${API_BASE_URL}/social/campaigns/${targetCampaign.backendId}/`, {
          status: "archived",
        })
        .catch(() => { });
    }
    setDeleteModalOpen(false);
    showToast(`Archived "${targetCampaign.name}"`);
  };

  // Execute Delete
  const handleConfirmDelete = () => {
    if (!targetCampaign) return;
    setCampaignList((prev) => prev.filter((item) => item.id !== targetCampaign.id));
    if (targetCampaign.backendId) {
      axios.delete(`${API_BASE_URL}/social/campaigns/${targetCampaign.backendId}/`).catch(() => { });
    }
    setDeleteModalOpen(false);
    showToast(`Deleted "${targetCampaign.name}"`);
  };

  // Helper to render Objective Icon + Text
  const renderObjectiveBadge = (objective) => {
    const objLower = (objective || "").toLowerCase();
    let Icon = Volume2;
    if (objLower.includes("brand") || objLower === "brand awareness") Icon = Eye;
    else if (objLower.includes("lead")) Icon = Users;
    else if (objLower.includes("conversion") || objLower.includes("sale")) Icon = ShoppingCart;
    else if (objLower.includes("traffic")) Icon = MousePointer;
    else if (objLower.includes("engage") || objLower.includes("event")) Icon = Calendar;

    return (
      <div className="cm-objective-badge">
        <Icon size={16} className="cm-objective-icon" />
        <span>{objective}</span>
      </div>
    );
  };

  // Helper to render Status Pill Badge (Matching Image 3)
  const renderStatusBadge = (status) => {
    const s = (status || "Draft").toLowerCase();
    let statusClass = "cm-status-draft";
    let label = "Draft";

    if (s === "active") {
      statusClass = "cm-status-active";
      label = "Active";
    } else if (s === "paused") {
      statusClass = "cm-status-paused";
      label = "Paused";
    } else if (s === "completed") {
      statusClass = "cm-status-completed";
      label = "Completed";
    } else if (s === "archived") {
      statusClass = "cm-status-archived";
      label = "Archived";
    }

    return (
      <span className={`cm-status-pill ${statusClass}`}>
        <span className="cm-status-dot" />
        <span>{label}</span>
      </span>
    );
  };

  // Helper to render Platform Avatar + Info (Matching Image 3)
  const renderPlatformInfo = (platform, adAccount) => {
    const p = (platform || "").toLowerCase();
    const isInsta = p === "instagram" || (p.includes("instagram") && !p.includes("facebook") && !p.includes("meta"));
    const isGoogle = p.includes("google");
    const isLinkedIn = p.includes("linkedin");
    const isMeta = p.includes("meta");
    const isMulti = p.includes(",") || (platform && platform.includes(","));

    let avatarClass = "cm-platform-facebook";
    let icon = null;
    let label = "Facebook";

    if (isMulti) {
      avatarClass = "cm-platform-meta";
      label = "Multi-Platform";
      icon = (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      );
    } else if (isGoogle) {
      avatarClass = "cm-platform-google";
      label = "Google Ads";
      icon = (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path fill="#4285F4" d="M3.77 15.37a5.52 5.52 0 0 0 7.56 2.03l6.5-3.76-7.56-13.1-6.5 3.75a5.52 5.52 0 0 0 0 11.08z" />
          <path fill="#FBBC04" d="M20.23 8.63a5.52 5.52 0 0 0-7.56-2.03l-6.5 3.76 7.56 13.1 6.5-3.75a5.52 5.52 0 0 0 0-11.08z" />
          <circle cx="5.52" cy="18.48" r="3.5" fill="#34A853" />
        </svg>
      );
    } else if (isLinkedIn) {
      avatarClass = "cm-platform-linkedin";
      label = "LinkedIn Ads";
      icon = (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    } else if (isInsta) {
      avatarClass = "cm-platform-instagram";
      label = "Instagram";
      icon = (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    } else if (isMeta) {
      avatarClass = "cm-platform-meta";
      label = "Meta Ads";
      icon = (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    } else {
      avatarClass = "cm-platform-facebook";
      label = "Facebook";
      icon = (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    }

    return (
      <div className="cm-platform-cell">
        <div className={`cm-platform-avatar ${avatarClass}`}>
          {icon}
        </div>
        <div className="cm-platform-info">
          <span className="cm-platform-name">{label}</span>
          <span className="cm-platform-account">{adAccount || "ABC Media"}</span>
        </div>
      </div>
    );
  };

  if (viewMode === "create") {
    return (
      <div className="cm-container">
        <CreateCampaignWizard
          clients={clients}
          onCancel={() => setViewMode("list")}
          onComplete={(newCamp, targetStatus) => {
            setCampaignList((prev) => [newCamp, ...prev]);
            setViewMode("list");
            showToast(`Campaign "${newCamp.name}" ${targetStatus === "Active" ? "published" : "saved as draft"} successfully`);
            if (onRefresh) onRefresh();
          }}
        />
        {toastMessage && (
          <div className="cm-toast">
            <CheckCircle2 size={17} color="#22c55e" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === "edit" && targetCampaign) {
    return (
      <div className="cm-container">
        <CreateCampaignWizard
          initialData={targetCampaign}
          clients={clients}
          onCancel={() => {
            setTargetCampaign(null);
            setViewMode("list");
          }}
          onComplete={(updatedCamp, targetStatus) => {
            setCampaignList((prev) =>
              prev.map((item) => (item.id === targetCampaign.id ? { ...item, ...updatedCamp } : item))
            );
            setTargetCampaign(null);
            setViewMode("list");
            showToast(`Campaign "${updatedCamp.name}" updated successfully`);
            if (onRefresh) onRefresh();
          }}
        />
        {toastMessage && (
          <div className="cm-toast">
            <CheckCircle2 size={17} color="#22c55e" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cm-container">
      {/* --------------------------------------------------------------------
          Subsections Bar (Campaign Management vs Audience)
          -------------------------------------------------------------------- */}
      <div className="cm-subsections-bar">
        <button
          type="button"
          className={`cm-subsection-btn ${currentSub === "management" ? "active" : ""}`}
          onClick={() => {
            setCurrentSub("management");
            if (onSelectSubsection) onSelectSubsection("management");
          }}
        >
          <Layers size={15} />
          <span>Campaign Management</span>
          <span className="cm-subsection-count">{campaignList.length}</span>
        </button>
        <button
          type="button"
          className={`cm-subsection-btn ${currentSub === "audience" ? "active" : ""}`}
          onClick={() => {
            setCurrentSub("audience");
            if (onSelectSubsection) onSelectSubsection("audience");
          }}
        >
          <Users size={15} />
          <span>Audience</span>
        </button>
      </div>

      {currentSub === "audience" ? (
        <MetaAudienceSection
          clients={clients}
          selectedClientId={selectedClientId}
          campaigns={campaigns}
        />
      ) : (
        <>
          {/* --------------------------------------------------------------------
              Header Row (Title + Subtitle + Create Campaign Button)
              -------------------------------------------------------------------- */}
          <div className="cm-header-row">
            <div className="cm-header-text">
              <p className="cm-subtitle">
                Create, manage and control your advertising campaigns in one place.
              </p>
            </div>
            <button
              type="button"
              className="cm-btn-create"
              onClick={() => setViewMode("create")}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Create Campaign</span>
            </button>
          </div>

      {/* --------------------------------------------------------------------
          Filter & Search Bar (Image 3 Design)
          -------------------------------------------------------------------- */}
      <div className="cm-filters-bar">
        {/* 1. Search Box */}
        <div className="cm-search-wrapper">
          <Search size={16} className="cm-search-icon" />
          <input
            type="text"
            className="cm-search-input"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="cm-search-clear"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 2. Status Dropdown */}
        <div className="cm-filter-box">
          <div className="cm-filter-content">
            <span className="cm-filter-label">Status</span>
            <select
              className="cm-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <ChevronDown size={14} className="cm-filter-chevron" />
        </div>

        {/* 3. Objective Dropdown */}
        <div className="cm-filter-box">
          <div className="cm-filter-content">
            <span className="cm-filter-label">Objective</span>
            <select
              className="cm-filter-select"
              value={objectiveFilter}
              onChange={(e) => setObjectiveFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="awareness">Awareness</option>
              <option value="brand awareness">Brand Awareness</option>
              <option value="traffic">Traffic</option>
              <option value="engagement">Engagement</option>
              <option value="leads">Leads</option>
              <option value="conversions">Sales / Conversions</option>
            </select>
          </div>
          <ChevronDown size={14} className="cm-filter-chevron" />
        </div>

        {/* 4. Date Created Dropdown */}
        <div className="cm-filter-box">
          <Calendar size={15} className="cm-filter-icon" />
          <div className="cm-filter-content">
            <span className="cm-filter-label">Date Created</span>
            <select
              className="cm-filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
          <ChevronDown size={14} className="cm-filter-chevron" />
        </div>

        {/* 5. Platform / Ad Account Dropdown */}
        <div className="cm-filter-box">
          <Layers size={15} className="cm-filter-icon" />
          <div className="cm-filter-content">
            <span className="cm-filter-label">Platform / Ad Account</span>
            <select
              className="cm-filter-select"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="meta">Meta Ads</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google Ads</option>
              <option value="abc media">ABC Media</option>
              <option value="design studio">Design Studio</option>
              <option value="real estate pro">Real Estate Pro</option>
              <option value="beauty & co.">Beauty & Co.</option>
              <option value="techworld">TechWorld</option>
              <option value="event hub">Event Hub</option>
              <option value="lifestyle brand">Lifestyle Brand</option>
              <option value="foodie place">Foodie Place</option>
            </select>
          </div>
          <ChevronDown size={14} className="cm-filter-chevron" />
        </div>

        {/* 6. Clear Filters Button */}
        <button
          type="button"
          className="cm-btn-clear"
          onClick={handleClearFilters}
        >
          <RotateCcw size={14} />
          <span>Clear Filters</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
          Table Card Layout (Image 3)
          -------------------------------------------------------------------- */}
      <div className="cm-table-card" ref={tableRef}>
        <div className="cm-table-wrapper">
          <table className="cm-table">
            <thead className="cm-thead">
              <tr>
                <th
                  className="cm-th-sortable"
                  onClick={() => handleSortToggle("name")}
                >
                  <span className="cm-th-flex">
                    Campaign Name
                    {sortField === "name" ? (
                      sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={13} color="#94a3b8" />
                    )}
                  </span>
                </th>

                <th
                  className="cm-th-sortable"
                  onClick={() => handleSortToggle("objective")}
                >
                  <span className="cm-th-flex">
                    Objective
                    {sortField === "objective" ? (
                      sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={13} color="#94a3b8" />
                    )}
                  </span>
                </th>

                <th
                  className="cm-th-sortable"
                  onClick={() => handleSortToggle("status")}
                >
                  <span className="cm-th-flex">
                    Status
                    {sortField === "status" ? (
                      sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={13} color="#94a3b8" />
                    )}
                  </span>
                </th>

                <th
                  className="cm-th-sortable"
                  onClick={() => handleSortToggle("platform")}
                >
                  <span className="cm-th-flex">
                    Platform / Ad Account
                    {sortField === "platform" ? (
                      sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={13} color="#94a3b8" />
                    )}
                  </span>
                </th>

                <th
                  className="cm-th-sortable"
                  onClick={() => handleSortToggle("rawDate")}
                >
                  <span className="cm-th-flex">
                    Date Created
                    {sortField === "rawDate" ? (
                      sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    ) : (
                      <ChevronsUpDown size={13} color="#94a3b8" />
                    )}
                  </span>
                </th>

                <th className="cm-th-actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="cm-empty-state">
                      <Layers size={36} className="cm-empty-icon" />
                      <div className="cm-empty-title">No campaigns match your filters</div>
                      <div className="cm-empty-subtitle">
                        Try clearing or adjusting your search filters above to see more campaigns.
                      </div>
                      <button
                        type="button"
                        className="cm-btn-clear"
                        onClick={handleClearFilters}
                      >
                        <RotateCcw size={14} /> Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="cm-row">
                    {/* 1. Campaign Name */}
                    <td className="cm-td">
                      <div className="cm-name-cell">
                        <div className="cm-name-info">
                          <span className="cm-campaign-name" title={camp.name}>
                            {camp.name}
                          </span>
                          <span className="cm-campaign-id">{camp.camCode}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Objective */}
                    <td className="cm-td">
                      {renderObjectiveBadge(camp.objective)}
                    </td>

                    {/* 3. Status */}
                    <td className="cm-td">
                      {renderStatusBadge(camp.status)}
                    </td>

                    {/* 4. Platform / Ad Account */}
                    <td className="cm-td">
                      {renderPlatformInfo(camp.platform, camp.adAccount)}
                    </td>

                    {/* 5. Date Created */}
                    <td className="cm-td">
                      <div className="cm-date-info">
                        <span className="cm-date-main">{camp.dateCreated}</span>
                        <span className="cm-date-time">{camp.timeCreated}</span>
                      </div>
                    </td>

                    {/* 6. Actions */}
                    <td className="cm-td cm-actions-cell">
                      <button
                        type="button"
                        className={`cm-actions-trigger ${activeMenuId === camp.id ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === camp.id ? null : camp.id);
                        }}
                        title="Campaign actions"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu (Image 3) */}
                      {activeMenuId === camp.id && (
                        <div
                          className="cm-menu-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="cm-menu-item"
                            onClick={() => handleOpenEdit(camp)}
                          >
                            <Edit2 size={15} className="cm-menu-icon" />
                            <span>Edit Campaign</span>
                          </button>

                          <button
                            type="button"
                            className="cm-menu-item"
                            onClick={() => handleTogglePauseResume(camp)}
                          >
                            {camp.status === "Active" ? (
                              <>
                                <Pause size={15} className="cm-menu-icon" />
                                <span>Pause Campaign</span>
                              </>
                            ) : (
                              <>
                                <Play size={15} className="cm-menu-icon" />
                                <span>Resume Campaign</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className="cm-menu-item"
                            onClick={() => handleDuplicateCampaign(camp)}
                          >
                            <Copy size={15} className="cm-menu-icon" />
                            <span>Duplicate Campaign</span>
                          </button>

                          <button
                            type="button"
                            className="cm-menu-item danger"
                            onClick={() => handleOpenDeleteArchive(camp)}
                          >
                            <Trash2 size={15} className="cm-menu-icon" />
                            <span>Delete / Archive Campaign</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination (Image 3) */}
        <div className="cm-footer">
          <span className="cm-footer-count">
            Showing 1-{filteredCampaigns.length} of {filteredCampaigns.length} campaigns
          </span>
          <div className="cm-pagination">
            <button type="button" className="cm-page-btn" disabled title="Previous page">
              &lt;
            </button>
            <button type="button" className="cm-page-btn active">
              1
            </button>
            <button type="button" className="cm-page-btn" disabled title="Next page">
              &gt;
            </button>
          </div>
        </div>
      </div>



      {/* --------------------------------------------------------------------
          Delete / Archive Confirmation Modal
          -------------------------------------------------------------------- */}
      {deleteModalOpen && targetCampaign && (
        <div className="cm-modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div className="cm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cm-modal-header">
              <div>
                <h2 className="cm-modal-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={20} color="#ef4444" /> Manage Campaign Removal
                </h2>
                <p className="cm-modal-subtitle">
                  Choose how to handle &quot;{targetCampaign.name}&quot; ({targetCampaign.camCode})
                </p>
              </div>
              <button
                type="button"
                className="cm-modal-close"
                onClick={() => setDeleteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="cm-modal-body">
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>
                You can either <strong>Archive</strong> this campaign to retain historical performance and tracking records, or <strong>Delete</strong> it permanently from your workspace.
              </p>
            </div>

            <div className="cm-modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className="cm-btn-secondary"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="cm-btn-secondary"
                  onClick={handleConfirmArchive}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Archive size={15} /> Archive Campaign
                </button>
                <button
                  type="button"
                  className="cm-btn-danger"
                  onClick={handleConfirmDelete}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Trash2 size={15} /> Delete Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* --------------------------------------------------------------------
          Toast Feedback Notification
          -------------------------------------------------------------------- */}
      {toastMessage && (
        <div className="cm-toast">
          <CheckCircle size={17} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
