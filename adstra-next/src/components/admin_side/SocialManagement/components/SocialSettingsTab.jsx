"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  Settings,
  Share2,
  Building2,
  Sliders,
  Sparkles,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  Plus,
  Power,
  ExternalLink,
  ShieldCheck,
  Clock,
  Users,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Target,
  Palette,
  MessageSquare,
  Smartphone,
  Globe,
  Lock,
  Key,
  Flame,
  Check,
  Copy,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ClipboardList,
  MapPin,
  Briefcase,
  FileText,
  ArrowRight,
  Layers,
  Info,
} from "lucide-react";
import { XIcon, GoogleIcon, TikTokIcon, renderPlatformIcon, MetaLogoIcon } from "./PlatformIcons";
import { notify, askConfirm } from "./SocialFeedback";

const PLATFORM_CONFIG = {
  instagram: { label: "Instagram Business", color: "#e1306c", icon: <Instagram size={18} /> },
  facebook: { label: "Facebook Page", color: "#1877f2", icon: <Facebook size={18} /> },
  linkedin: { label: "LinkedIn Company", color: "#0a66c2", icon: <Linkedin size={18} /> },
  youtube: { label: "YouTube Channel", color: "#ff0000", icon: <Youtube size={18} /> },
  x: { label: "X / Twitter", color: "#000000", icon: <XIcon size={16} /> },
  google_business: { label: "Google Business", color: "#0f9d58", icon: <GoogleIcon size={18} /> },
  tiktok: { label: "TikTok", color: "#000000", icon: <TikTokIcon size={18} /> },
};

export default function SocialSettingsTab({
  clients = [],
  accounts = [],
  selectedClientId = "all",
  onRefresh,
}) {
  const [activeSubTab, setActiveSubTab] = useState("accounts"); // 'accounts' | 'clients' | 'workflow' | 'ai' | 'notifications'
  
  // Account Modal & Actions State
  const [connectingModal, setConnectingModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [newAccClient, setNewAccClient] = useState(clients[0]?.id || 1);
  const [accountName, setAccountName] = useState("");
  const [username, setUsername] = useState("");
  const [followers, setFollowers] = useState(5000);
  const [actionLoading, setActionLoading] = useState(null);

  // Ad Platform Connections State
  const [platformConnections, setPlatformConnections] = useState([]);
  const [adLoading, setAdLoading] = useState(false);
  const [adActionLoading, setAdActionLoading] = useState(null);
  const [accountSelectModal, setAccountSelectModal] = useState(null);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [availablePages, setAvailablePages] = useState([]);
  const [selectedAdAccount, setSelectedAdAccount] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
  const [adNotification, setAdNotification] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Meta Configuration & Manual Connect Modals
  const [metaOptionsModal, setMetaOptionsModal] = useState(false);
  const [metaConfigModal, setMetaConfigModal] = useState(false);
  const [metaAppId, setMetaAppId] = useState("");
  const [metaAppSecret, setMetaAppSecret] = useState("");
  const [metaRedirectUri, setMetaRedirectUri] = useState("http://localhost:8000/api/social/platform-connections/meta/callback/");
  const [metaSaving, setMetaSaving] = useState(false);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);

  const [metaDirectTokenModal, setMetaDirectTokenModal] = useState(false);
  const [directAccountId, setDirectAccountId] = useState("");
  const [directAccountName, setDirectAccountName] = useState("");
  const [directAccessToken, setDirectAccessToken] = useState("");
  const [directPageId, setDirectPageId] = useState("");
  const [directPageName, setDirectPageName] = useState("");
  const [directSaving, setDirectSaving] = useState(false);

  // Client Profile Edit State
  const [editingClient, setEditingClient] = useState(null);
  const [brandSettingsTab, setBrandSettingsTab] = useState("general"); // 'general' | 'company' | 'strategy' | 'social'
  const [clientSaving, setClientSaving] = useState(false);
  const [creatingClientModal, setCreatingClientModal] = useState(false);
  const [clientStatusFilter, setClientStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const companyDropdownRef = useRef(null);
  const [newClientData, setNewClientData] = useState({
    name: "",
    slug: "",
    package_tier: "Growth Package",
    target_monthly_posts: 20,
    approval_policy: "client_required",
    primary_color: "#4f46e5",
    client_email: "",
    client_contact: "",
    brand_tagline: "",
    is_active: true,
  });

  const fetchCompanyOptions = useCallback(async () => {
    try {
      setLoadingCompanies(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let list = [];
      try {
        const res = await axios.get(`${API_BASE_URL}/social/clients/company-options/`, { headers });
        if (Array.isArray(res.data) && res.data.length > 0) {
          list = res.data;
        }
      } catch (e) {
        // fallback to proposal/clients
      }

      if (list.length === 0) {
        try {
          const res = await axios.get(`${API_BASE_URL}/proposal/clients/?t=${Date.now()}`, { headers });
          if (Array.isArray(res.data)) {
            list = res.data.map((c) => ({
              id: c.id,
              company_name: (c.company_name || c.name || `Client #${c.id}`).trim(),
              contact_name: (c.name || "").trim(),
              email: c.email || "",
              contact: c.contact || "",
              address: c.address || "",
            }));
          }
        } catch (e) {
          console.warn("Could not load proposal clients fallback", e);
        }
      }

      setCompanyOptions(list);
    } catch (err) {
      console.warn("Error fetching company options", err);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyOptions();
  }, [fetchCompanyOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    if (isCompanyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCompanyDropdownOpen]);

  const filteredCompanyOptions = useMemo(() => {
    if (!companySearch.trim()) return companyOptions;
    const q = companySearch.toLowerCase().trim();
    return companyOptions.filter((comp) => {
      const name = (comp.company_name || comp.name || "").toLowerCase();
      const contact = (comp.contact_name || "").toLowerCase();
      const phone = (comp.contact || "").toLowerCase();
      const email = (comp.email || "").toLowerCase();
      return name.includes(q) || contact.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [companyOptions, companySearch]);

  const activeCount = useMemo(() => clients.filter((c) => c.is_active !== false).length, [clients]);
  const inactiveCount = useMemo(() => clients.filter((c) => c.is_active === false).length, [clients]);

  const filteredClientProfiles = useMemo(() => {
    return clients.filter((c) => {
      if (clientStatusFilter === "active" && c.is_active === false) return false;
      if (clientStatusFilter === "inactive" && c.is_active !== false) return false;
      if (clientSearchQuery.trim()) {
        const q = clientSearchQuery.toLowerCase().trim();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesEmail = c.client_email?.toLowerCase().includes(q);
        const matchesContact = c.client_contact?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesContact;
      }
      return true;
    });
  }, [clients, clientStatusFilter, clientSearchQuery]);

  // Workflow Preferences State (stored in localStorage for persistence)
  const [workflowPrefs, setWorkflowPrefs] = useState({
    defaultPriority: "medium",
    timeSlots: ["09:30 AM", "01:30 PM", "06:00 PM", "08:30 PM"],
    enforceApproval: true,
    bypassForUrgent: false,
    reviewDeadlineHours: 24,
    autoMoveToDesigning: true,
  });
  const [workflowSaved, setWorkflowSaved] = useState(false);

  // AI Preferences State
  const [aiPrefs, setAiPrefs] = useState({
    defaultLanguage: "bilingual", // 'en' | 'ml' | 'bilingual'
    toneOfVoice: "authoritative",
    targetHashtags: 15,
    autoFestivals: true,
    model: "gpt-4o",
  });
  const [aiSaved, setAiSaved] = useState(false);

  // Notification Preferences State
  const [notifyPrefs, setNotifyPrefs] = useState({
    whatsappAlerts: true,
    whatsappWebhookUrl: "https://api.whatsapp.com/send",
    whatsappPhone: "+91 98470 12345",
    emailReviewAlerts: true,
    dailyDigest: true,
    clientFeedbackPush: true,
  });
  const [notifySaved, setNotifySaved] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedWf = localStorage.getItem("adstra_social_workflow_prefs");
      if (savedWf) setWorkflowPrefs(JSON.parse(savedWf));

      const savedAi = localStorage.getItem("adstra_social_ai_prefs");
      if (savedAi) setAiPrefs(JSON.parse(savedAi));

      const savedNotify = localStorage.getItem("adstra_social_notify_prefs");
      if (savedNotify) setNotifyPrefs(JSON.parse(savedNotify));
    } catch (e) {
      console.warn("Could not read local settings", e);
    }
  }, []);

  // Fetch Platform Connections
  const fetchPlatformConnections = async () => {
    try {
      setAdLoading(true);
      const url = selectedClientId && selectedClientId !== "all"
        ? `${API_BASE_URL}/social/platform-connections/?client_id=${selectedClientId}`
        : `${API_BASE_URL}/social/platform-connections/`;
      const res = await axios.get(url);
      setPlatformConnections(res.data || []);
    } catch (err) {
      console.warn("Could not fetch platform connections", err);
    } finally {
      setAdLoading(false);
    }
  };

  const showAdToast = (msg, type = "success") => {
    setAdNotification({ msg, type });
    setTimeout(() => setAdNotification(null), 4000);
  };

  useEffect(() => {
    fetchPlatformConnections();
  }, [selectedClientId]);

  // Handle OAuth callback parameters (oauth_success / oauth_error) and cross-window events
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get("oauth_success");
    const oauthError = urlParams.get("oauth_error");

    if (oauthSuccess) {
      const platLabel = oauthSuccess === "meta" ? "Meta Ads & Facebook Pages" : oauthSuccess.toUpperCase();
      showAdToast(`Connected ${platLabel} successfully!`, "success");
      fetchPlatformConnections();
      urlParams.delete("oauth_success");
      const newQuery = urlParams.toString();
      const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "");
      window.history.replaceState(null, "", newUrl);
    } else if (oauthError) {
      showAdToast(`OAuth authorization notice: ${decodeURIComponent(oauthError)}`, "warning");
      urlParams.delete("oauth_error");
      const newQuery = urlParams.toString();
      const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "");
      window.history.replaceState(null, "", newUrl);
    }

    const handleMessage = (e) => {
      if (e.data?.type === "ADSTRA_OAUTH_SUCCESS") {
        const platLabel = e.data.platform === "meta" ? "Meta Ads & Facebook Pages" : (e.data.platform?.toUpperCase() || "account");
        showAdToast(`Connected ${platLabel} successfully!`, "success");
        fetchPlatformConnections();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnectOAuth = async (platform) => {
    let popup = null;
    try {
      setAdActionLoading(platform);
      setAdNotification(null);
      const clientId = selectedClientId === "all" ? (clients[0]?.id || "") : selectedClientId;

      // Pre-open window synchronously to prevent popup blocker in modern browsers
      try {
        const width = 640;
        const height = 750;
        const left = typeof window !== "undefined" ? window.screenX + (window.outerWidth - width) / 2 : 100;
        const top = typeof window !== "undefined" ? window.screenY + (window.outerHeight - height) / 2 : 100;
        popup = window.open(
          "about:blank",
          `AdstraOAuth_${platform}`,
          `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes,resizable=yes`
        );
      } catch (e) {
        console.warn("Popup blocked or not allowed", e);
      }

      const res = await axios.get(`${API_BASE_URL}/social/platform-connections/${platform}/oauth-url/?client_id=${clientId}`);
      let targetUrl = res.data?.oauth_url;

      if (!targetUrl) {
        if (popup && !popup.closed) popup.close();
        showAdToast(`Could not generate ${platform} OAuth URL. Please check backend settings.`, "error");
        return;
      }

      if (res.data?.warning) {
        showAdToast(res.data.warning, "warning");
      }

      if (popup && !popup.closed) {
        popup.location.href = targetUrl;
        popup.focus();
      } else {
        window.open(targetUrl, "_blank") || (window.location.href = targetUrl);
      }

      // Check popup closure to refresh platform connections
      if (popup && !popup.closed) {
        const checkPopupInterval = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkPopupInterval);
            setAdActionLoading(null);
            fetchPlatformConnections();
          }
        }, 1000);
      }

    } catch (err) {
      if (popup && !popup.closed) {
        try { popup.close(); } catch (_) {}
      }
      const errData = err?.response?.data;
      const errMsg = errData?.error || `OAuth error: ${err.message}`;
      showAdToast(errMsg, "error");
      if (typeof errMsg === "string" && (errMsg.includes("META_APP_ID") || errMsg.includes("Meta App ID"))) {
        setMetaOptionsModal(true);
      }
    } finally {
      setTimeout(() => setAdActionLoading(null), 1500);
    }
  };

  const handleRefreshAdToken = async (connId) => {
    try {
      setAdActionLoading(`refresh_${connId}`);
      const res = await axios.post(`${API_BASE_URL}/social/platform-connections/${connId}/refresh-token/`);
      if (res.data?.success) {
        showAdToast("Access token refreshed successfully!");
        await fetchPlatformConnections();
      } else {
        showAdToast("Token refresh failed. Please reconnect the account.", "error");
      }
    } catch (err) {
      showAdToast(`Refresh failed: ${err?.response?.data?.error || err.message}`, "error");
    } finally {
      setAdActionLoading(null);
    }
  };

  const handleReauthorizeAdPlatform = async (connId) => {
    try {
      setAdActionLoading(`reauth_${connId}`);
      const res = await axios.post(`${API_BASE_URL}/social/platform-connections/${connId}/reconnect/`);
      if (res.data?.success) {
        showAdToast(res.data?.message || "Meta Ad Account reauthorized successfully!");
        await fetchPlatformConnections();
      } else {
        const refRes = await axios.post(`${API_BASE_URL}/social/platform-connections/${connId}/refresh-token/`);
        if (refRes.data?.success) {
          showAdToast("Access token reauthorized and refreshed successfully!");
          await fetchPlatformConnections();
        } else {
          showAdToast("Reauthorization failed. Please reconnect with Meta.", "warning");
        }
      }
    } catch (err) {
      try {
        const refRes = await axios.post(`${API_BASE_URL}/social/platform-connections/${connId}/refresh-token/`);
        if (refRes.data?.success) {
          showAdToast("Access token reauthorized and refreshed successfully!");
          await fetchPlatformConnections();
          return;
        }
      } catch (e) {
        // fallback ignored
      }
      showAdToast(err?.response?.data?.error || `Reauthorization failed: ${err.message}`, "error");
    } finally {
      setAdActionLoading(null);
    }
  };

  const handleCopyAccountId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleConnectSandbox = async () => {
    try {
      setAdActionLoading("sandbox");
      const res = await axios.post(`${API_BASE_URL}/social/platform-connections/sandbox-connect/`, {
        platform: "meta",
        client_id: selectedClientId === "all" ? (clients[0]?.id || null) : selectedClientId,
      });
      showAdToast(res.data?.message || "Connected Meta in sandbox mode!", "success");
      setAdNotification(null);
      await fetchPlatformConnections();
    } catch (err) {
      showAdToast(`Sandbox connection failed: ${err.message}`, "error");
    } finally {
      setAdActionLoading(null);
    }
  };

  const handleSaveMetaCredentials = async (e) => {
    e.preventDefault();
    if (!metaAppId.trim()) {
      showAdToast("Please enter Meta App ID.", "error");
      return;
    }
    try {
      setMetaSaving(true);
      const res = await axios.post(`${API_BASE_URL}/social/platform-connections/meta/configure-credentials/`, {
        app_id: metaAppId.trim(),
        app_secret: metaAppSecret.trim(),
        redirect_uri: metaRedirectUri.trim(),
      });
      if (res.data?.success) {
        showAdToast("Meta App ID & Secret saved to backend/.env!", "success");
        setMetaConfigModal(false);
        setAdNotification(null);
      } else {
        showAdToast("Failed to save credentials.", "error");
      }
    } catch (err) {
      showAdToast(err?.response?.data?.error || `Error saving credentials: ${err.message}`, "error");
    } finally {
      setMetaSaving(false);
    }
  };

  const handleSaveDirectToken = async (e) => {
    e.preventDefault();
    if (!directAccountId.trim() || !directAccessToken.trim()) {
      showAdToast("Please provide Meta Ad Account ID and Access Token.", "error");
      return;
    }
    try {
      setDirectSaving(true);
      await axios.post(`${API_BASE_URL}/social/platform-connections/`, {
        platform: "meta",
        account_name: directAccountName.trim() || `Meta Ad Account (${directAccountId.trim()})`,
        account_id: directAccountId.trim(),
        access_token: directAccessToken.trim(),
        client_profile: selectedClientId === "all" ? (clients[0]?.id || null) : selectedClientId,
        currency: "INR",
        metadata: {
          page_id: directPageId.trim() || undefined,
          page_name: directPageName.trim() || undefined,
        },
      });
      showAdToast("Meta account connected successfully via direct token!", "success");
      setMetaDirectTokenModal(false);
      setDirectAccountId("");
      setDirectAccessToken("");
      setDirectAccountName("");
      setAdNotification(null);
      await fetchPlatformConnections();
    } catch (err) {
      showAdToast(err?.response?.data?.error || `Direct connect error: ${err.message}`, "error");
    } finally {
      setDirectSaving(false);
    }
  };

  const handleDisconnectAdPlatform = async (connId, platformLabel) => {
    if (!await askConfirm(`Are you sure you want to disconnect ${platformLabel}? Active campaigns will not be able to sync metrics until reconnected.`)) {
      return;
    }
    try {
      setAdActionLoading(`disconnect_${connId}`);
      await axios.post(`${API_BASE_URL}/social/platform-connections/${connId}/disconnect/`);
      showAdToast(`${platformLabel} disconnected.`);
      await fetchPlatformConnections();
    } catch (err) {
      showAdToast(`Disconnect error: ${err.message}`, "error");
    } finally {
      setAdActionLoading(null);
    }
  };

  const handleOpenAccountSelector = async (conn) => {
    try {
      setAdActionLoading(`select_${conn.id}`);
      const res = await axios.get(`${API_BASE_URL}/social/platform-connections/${conn.id}/ad-accounts/`);
      setAccountSelectModal(conn);
      if (conn.platform === "meta") {
        setAvailableAccounts(res.data?.ad_accounts || []);
        setAvailablePages(res.data?.pages || []);
        setSelectedAdAccount(conn.account_id || res.data?.ad_accounts?.[0]?.id || "");
        setSelectedPage(conn.metadata?.page_id || res.data?.pages?.[0]?.id || "");
      } else {
        setAvailableAccounts(res.data?.customers || []);
        setSelectedAdAccount(conn.account_id || res.data?.customers?.[0]?.id || "");
      }
    } catch (err) {
      showAdToast(`Could not load accessible accounts: ${err.message}`, "error");
    } finally {
      setAdActionLoading(null);
    }
  };

  const handleSaveSelectedAccount = async () => {
    if (!accountSelectModal || !selectedAdAccount) return;
    try {
      setAdActionLoading("saving_account");
      const chosenAcc = availableAccounts.find((a) => (a.id || a.customer_id) === selectedAdAccount);
      const accName = chosenAcc ? (chosenAcc.name || chosenAcc.descriptive_name || selectedAdAccount) : selectedAdAccount;
      const chosenPage = availablePages.find((p) => p.id === selectedPage);

      const metadata = { ...accountSelectModal.metadata };
      if (chosenPage) {
        metadata.page_id = chosenPage.id;
        metadata.page_name = chosenPage.name;
      }

      await axios.post(`${API_BASE_URL}/social/platform-connections/${accountSelectModal.id}/set-account/`, {
        account_id: selectedAdAccount,
        account_name: accName,
        metadata,
      });

      showAdToast("Ad account selection updated successfully!");
      setAccountSelectModal(null);
      await fetchPlatformConnections();
    } catch (err) {
      showAdToast(`Error setting account: ${err.message}`, "error");
    } finally {
      setAdActionLoading(null);
    }
  };

  // Save Workflow Preferences
  const handleSaveWorkflowPrefs = (e) => {
    e.preventDefault();
    localStorage.setItem("adstra_social_workflow_prefs", JSON.stringify(workflowPrefs));
    setWorkflowSaved(true);
    setTimeout(() => setWorkflowSaved(false), 2500);
  };

  // Save AI Preferences
  const handleSaveAiPrefs = (e) => {
    e.preventDefault();
    localStorage.setItem("adstra_social_ai_prefs", JSON.stringify(aiPrefs));
    setAiSaved(true);
    setTimeout(() => setAiSaved(false), 2500);
  };

  // Save Notification Preferences
  const handleSaveNotifyPrefs = (e) => {
    e.preventDefault();
    localStorage.setItem("adstra_social_notify_prefs", JSON.stringify(notifyPrefs));
    setNotifySaved(true);
    setTimeout(() => setNotifySaved(false), 2500);
  };

  // Reconnect Social Channel
  const handleReconnectAccount = async (accId) => {
    setActionLoading(accId);
    try {
      await axios.post(`${API_BASE_URL}/social/accounts/${accId}/reconnect/`);
      if (onRefresh) onRefresh();
    } catch (err) {
      notify("Error reconnecting account. Please verify credentials.");
    } finally {
      setActionLoading(null);
    }
  };

  // Disconnect Social Channel
  const handleDisconnectAccount = async (accId) => {
    if (!await askConfirm("Are you sure you want to disconnect this social channel?")) return;
    setActionLoading(accId);
    try {
      await axios.post(`${API_BASE_URL}/social/accounts/${accId}/disconnect/`);
      if (onRefresh) onRefresh();
    } catch (err) {
      notify("Error disconnecting account.");
    } finally {
      setActionLoading(null);
    }
  };

  // Add New Social Channel
  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) {
      notify("Please enter an account or page name.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/social/accounts/`, {
        client_profile: newAccClient,
        platform: selectedPlatform,
        account_name: accountName,
        account_id: `${selectedPlatform}_${Date.now()}`,
        username: username.startsWith("@") ? username : `@${username}`,
        status: "connected",
        followers_count: parseInt(followers, 10) || 0,
        token_expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setConnectingModal(false);
      setAccountName("");
      setUsername("");
      if (onRefresh) onRefresh();
    } catch (err) {
      notify("Error adding social account.");
    }
  };

  // Toggle Client Active / Inactive (Instant Visibility Switch)
  const handleToggleClientActive = async (client) => {
    setActionLoading(`toggle-${client.id}`);
    try {
      const nextActive = client.is_active === false;
      await axios.patch(`${API_BASE_URL}/social/clients/${client.id}/`, {
        is_active: nextActive,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error updating client status:", err);
      notify("Error updating client visibility status.");
    } finally {
      setActionLoading(null);
    }
  };

  // Save Existing Client Profile
  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!editingClient) return;

    setClientSaving(true);
    try {
      await axios.patch(`${API_BASE_URL}/social/clients/${editingClient.id}/`, {
        target_monthly_posts:
          editingClient.target_monthly_posts === ""
            ? 0
            : Math.max(0, parseInt(editingClient.target_monthly_posts, 10) || 0),
        package_tier: editingClient.package_tier || "Growth Package",
        approval_policy: editingClient.approval_policy || "client_required",
        primary_color: editingClient.primary_color || "#4f46e5",
        secondary_color: editingClient.secondary_color || "#06b6d4",
        logo_url: editingClient.logo_url || "",
        brand_tagline: editingClient.brand_tagline || "",
        client_email: editingClient.client_email || "",
        client_contact: editingClient.client_contact || "",
        contact_person: editingClient.contact_person || "",
        industry: editingClient.industry || "",
        website_url: editingClient.website_url || "",
        address: editingClient.address || "",
        target_audience: editingClient.target_audience || "",
        brand_tone: editingClient.brand_tone || "",
        key_usps: editingClient.key_usps || "",
        brand_guidelines: editingClient.brand_guidelines || "",
        social_handles: editingClient.social_handles || {},
        notes: editingClient.notes || "",
        is_active: editingClient.is_active !== false,
      });
      setEditingClient(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      notify("Error updating client configuration.");
    } finally {
      setClientSaving(false);
    }
  };

  // Create New Client Brand
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientData.name.trim()) {
      notify("Please select a company or enter a client brand name.");
      return;
    }

    const generatedSlug = newClientData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setClientSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/social/clients/`, {
        ...newClientData,
        target_monthly_posts:
          newClientData.target_monthly_posts === ""
            ? 20
            : Math.max(0, parseInt(newClientData.target_monthly_posts, 10) || 0),
        slug: generatedSlug,
      });
      setCreatingClientModal(false);
      setSelectedCompanyId("");
      setIsCompanyDropdownOpen(false);
      setCompanySearch("");
      setNewClientData({
        name: "",
        slug: "",
        package_tier: "Growth Package",
        target_monthly_posts: 20,
        approval_policy: "client_required",
        primary_color: "#4f46e5",
        client_email: "",
        client_contact: "",
        brand_tagline: "",
        is_active: true,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      notify("Error creating client brand profile.");
    } finally {
      setClientSaving(false);
    }
  };

  const filteredAccounts = selectedClientId === "all"
    ? accounts
    : accounts.filter((a) => String(a.client_profile) === String(selectedClientId));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Settings Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff",
          padding: "18px 24px",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#f1f5f9",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e2e8f0",
            }}
          >
            <Settings size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
              Marketing Suite Settings
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              Configure social API tokens, client brand retainer rules, workflow pipelines, and AI automation.
            </p>
          </div>
        </div>

        {/* Sub-tab Pill Navigation */}
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "#f8fafc",
            padding: 5,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            overflowX: "auto",
          }}
        >
          {[
            { id: "accounts", label: "Connected Channels", icon: Share2, count: filteredAccounts.length },
            { id: "integrations", label: "Integrations", icon: Target, count: new Set(platformConnections.filter((c) => c.platform === "meta" && c.status === "connected").map((c) => c.platform)).size },
            { id: "clients", label: "Client Brands & Retainers", icon: Building2, count: clients.length },
            { id: "workflow", label: "Workflow & Priority Rules", icon: Sliders },
            { id: "ai", label: "AI Content Engine", icon: Sparkles },
            { id: "notifications", label: "Notifications & Alerts", icon: Bell },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 9,
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: isActive ? "#0f172a" : "transparent",
                  color: isActive ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                <TabIcon size={15} />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    style={{
                      background: isActive ? "rgba(255, 255, 255, 0.2)" : "#e2e8f0",
                      color: isActive ? "#ffffff" : "#475569",
                      fontSize: "0.7rem",
                      padding: "1px 6px",
                      borderRadius: 8,
                      fontWeight: 800,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. CONNECTED SOCIAL CHANNELS & APIS (Strict Listing Table) */}
      {/* ======================================================== */}
      {activeSubTab === "accounts" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
            overflow: "hidden",
          }}
        >
          {/* Section Sub-header */}
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                Connected Social Media Channels
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Active API authentication tokens, page permissions, and refresh states for client publishing.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {/* CONNECT WITH META BUTTON */}
              {(() => {
                const metaConn = platformConnections.find((c) => c.platform === "meta");
                const isMetaConnected = metaConn?.status === "connected";
                return (
                  <button
                    id="connect-with-meta-btn"
                    type="button"
                    onClick={() => {
                      if (isMetaConnected) {
                        setActiveSubTab("integrations");
                      } else {
                        setMetaOptionsModal(true);
                      }
                    }}
                    disabled={adActionLoading === "meta"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: isMetaConnected
                        ? "#f0fdf4"
                        : "linear-gradient(135deg, #0064e0 0%, #0081fb 50%, #0064e0 100%)",
                      color: isMetaConnected ? "#15803d" : "#ffffff",
                      border: isMetaConnected ? "1px solid #bbf7d0" : "none",
                      padding: "9px 18px",
                      borderRadius: 9,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: isMetaConnected ? "none" : "0 3px 10px rgba(0, 100, 224, 0.25)",
                      transition: "all 0.15s ease",
                    }}
                    title={isMetaConnected ? "Meta Connected - View Settings & Ad Accounts" : "Connect with Meta"}
                  >
                    <MetaLogoIcon size={16} />
                    {adActionLoading === "meta" ? (
                      <span>Connecting to Meta…</span>
                    ) : isMetaConnected ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        Meta Connected <CheckCircle2 size={13} color="#16a34a" />
                      </span>
                    ) : (
                      <span>Connect with Meta</span>
                    )}
                  </button>
                );
              })()}

              <button
                onClick={() => setConnectingModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "9px 16px",
                  borderRadius: 9,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.2)",
                }}
              >
                <Plus size={16} /> + Connect Social Channel
              </button>
            </div>
          </div>

          {/* Accounts Listing Table */}
          {filteredAccounts.length === 0 ? (
            <div
              style={{
                padding: "60px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Share2 size={28} color="#94a3b8" />
              </div>
              <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 700 }}>
                No Social Channels Connected Yet
              </h4>
              <p
                style={{
                  margin: "8px 0 20px",
                  fontSize: "0.86rem",
                  color: "#64748b",
                  maxWidth: 480,
                  lineHeight: 1.5,
                }}
              >
                Connect your client&apos;s Instagram, Facebook, LinkedIn, YouTube, or X profiles to enable one-click publishing.
              </p>
              <button
                type="button"
                onClick={() => setConnectingModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: 9,
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                  transition: "all 0.15s ease",
                }}
              >
                <Plus size={16} />
                <span>Connect First Channel</span>
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.84rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "14px 20px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Channel / Platform
                    </th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Account Name & Handle
                    </th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Client Brand
                    </th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Followers
                    </th>
                    <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Token & Status
                    </th>
                    <th style={{ padding: "14px 20px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((acc) => {
                    const platConfig = PLATFORM_CONFIG[acc.platform] || { label: acc.platform, color: "#64748b", icon: renderPlatformIcon(acc.platform, { size: 18 }) };
                    const isExpiring = acc.status === "token_expiring";
                    const isDisconnected = acc.status === "disconnected" || !acc.is_active;
                    const clientObj = clients.find((c) => c.id === acc.client_profile);

                    return (
                      <tr
                        key={acc.id}
                        style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.12s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {/* Platform */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{platConfig.icon}</span>
                            <div>
                              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                                {platConfig.label}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                Channel ID: {acc.account_id ? acc.account_id.slice(-10) : acc.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Account Name & Handle */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{acc.account_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }}>
                            {acc.username || `@${acc.account_name.toLowerCase().replace(/\s+/g, "")}`}
                          </div>
                        </td>

                        {/* Client Brand */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              background: "#f1f5f9",
                              color: "#334155",
                              padding: "4px 9px",
                              borderRadius: 6,
                              fontSize: "0.76rem",
                              fontWeight: 700,
                              display: "inline-block",
                            }}
                          >
                            {clientObj?.name || `Client #${acc.client_profile}`}
                          </span>
                        </td>

                        {/* Followers */}
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>
                          {(acc.followers_count || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Token & Status */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 8px",
                                borderRadius: 6,
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                width: "fit-content",
                                background: isDisconnected ? "#fee2e2" : isExpiring ? "#fef3c7" : "#dcfce7",
                                color: isDisconnected ? "#dc2626" : isExpiring ? "#d97706" : "#16a34a",
                              }}
                            >
                              {isDisconnected ? "Disconnected" : isExpiring ? "Token Expiring" : "Connected & Active"}
                            </span>

                            {acc.token_expiry && (
                              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                                Renews: {new Date(acc.token_expiry).toLocaleDateString("en-IN")}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            {isDisconnected ? (
                              <button
                                onClick={() => handleReconnectAccount(acc.id)}
                                disabled={actionLoading === acc.id}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "#2563eb",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: 7,
                                  fontSize: "0.76rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                <RefreshCw size={13} className={actionLoading === acc.id ? "spin" : ""} /> Reconnect
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDisconnectAccount(acc.id)}
                                disabled={actionLoading === acc.id}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca",
                                  padding: "6px 12px",
                                  borderRadius: 7,
                                  fontSize: "0.76rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                <Power size={13} /> Disconnect
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MARKETING SUITE INTEGRATIONS & META AD ACCOUNTS */}
      {/* ======================================================== */}
      {activeSubTab === "integrations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Notification / Error Toast Alert */}
          {adNotification && (
            <div
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                fontSize: "0.85rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                background:
                  adNotification.type === "error"
                    ? "#fef2f2"
                    : adNotification.type === "warning"
                    ? "#fffbeb"
                    : "#f0fdf4",
                color:
                  adNotification.type === "error"
                    ? "#b91c1c"
                    : adNotification.type === "warning"
                    ? "#b45309"
                    : "#15803d",
                border: `1px solid ${
                  adNotification.type === "error"
                    ? "#fecaca"
                    : adNotification.type === "warning"
                    ? "#fde68a"
                    : "#bbf7d0"
                }`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {adNotification.type === "error" ? (
                  <AlertTriangle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                <span>{adNotification.msg}</span>
                {typeof adNotification.msg === "string" && (adNotification.msg.includes("META_APP_ID") || adNotification.msg.includes("Meta App ID")) && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={handleConnectSandbox}
                      disabled={adActionLoading === "sandbox"}
                      style={{
                        background: "#15803d",
                        color: "#ffffff",
                        border: "none",
                        padding: "5px 12px",
                        borderRadius: 6,
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Sparkles size={13} /> 1-Click Sandbox Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetaOptionsModal(true)}
                      style={{
                        background: "#b91c1c",
                        color: "#ffffff",
                        border: "none",
                        padding: "5px 12px",
                        borderRadius: 6,
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Layers size={13} /> View Connection Options
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAdNotification(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 2 }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Meta Business & Ad Accounts Integration Card */}
          {(() => {
            const metaConn = platformConnections.find((c) => c.platform === "meta");
            const isConnected = metaConn?.status === "connected";
            const matchedClient = clients.find(
              (c) =>
                c.id ===
                (metaConn?.client_profile ||
                  (selectedClientId === "all" ? clients[0]?.id : selectedClientId))
            );

            return (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: isConnected ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                  padding: "26px 30px",
                  boxShadow: isConnected
                    ? "0 4px 16px rgba(37, 99, 235, 0.05)"
                    : "0 2px 10px rgba(15, 23, 42, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                {/* Integration Header Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: isConnected
                          ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                          : "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <MetaLogoIcon size={26} />
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1.12rem",
                            fontWeight: 800,
                            color: "#0f172a",
                          }}
                        >
                          Meta Business & Advertising Accounts
                        </h3>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            background: isConnected ? "#dcfce7" : "#f1f5f9",
                            color: isConnected ? "#15803d" : "#64748b",
                            border: isConnected ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: isConnected ? "#22c55e" : "#94a3b8",
                            }}
                          />
                          {isConnected ? "Connected & Active" : "Not Connected"}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "0.82rem",
                          color: "#64748b",
                          maxWidth: 760,
                          lineHeight: 1.5,
                        }}
                      >
                        Authorize via official Meta OAuth 2.0 (Facebook Login for Business). Connects your Meta Ad Accounts, Facebook Pages, and Instagram Business assets for live ad campaign sync and scheduled publishing.
                      </p>
                    </div>
                  </div>

                  {isConnected && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleRefreshAdToken(metaConn.id)}
                        disabled={adActionLoading === `refresh_${metaConn.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#334155",
                          cursor: "pointer",
                        }}
                        title="Renew 60-day access token"
                      >
                        <RefreshCw
                          size={13}
                          className={adActionLoading === `refresh_${metaConn.id}` ? "spin" : ""}
                        />
                        Refresh Token
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDisconnectAdPlatform(metaConn.id, "Meta")}
                        disabled={adActionLoading === `disconnect_${metaConn.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#b91c1c",
                          cursor: "pointer",
                        }}
                      >
                        <Power size={13} />
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {/* Body: Connected State Details */}
                {isConnected ? (
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      padding: "20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 16,
                      }}
                    >
                      {/* Account Name */}
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                          Connected Account
                        </div>
                        <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", marginTop: 4 }}>
                          {metaConn.account_name || "Adstra Digital Main"}
                        </div>
                      </div>

                      {/* Ad Account ID with Copy button */}
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                          Meta Ad Account ID
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <code
                            style={{
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {metaConn.account_id || "Not Configured"}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyAccountId(metaConn.account_id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: copiedId ? "#16a34a" : "#64748b",
                              padding: 2,
                            }}
                            title="Copy Account ID"
                          >
                            {copiedId ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Client Brand Profile */}
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                          Linked Client Brand
                        </div>
                        <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#334155", marginTop: 4 }}>
                          {matchedClient?.name || metaConn.client_name || "Adstra Digital"}
                        </div>
                      </div>

                      {/* Token Expiry */}
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                          Token Expiration
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#16a34a", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                          <Clock size={14} />
                          {metaConn.token_expires_at
                            ? `Renews: ${new Date(metaConn.token_expires_at).toLocaleDateString("en-IN")}`
                            : "Valid for ~60 days (Auto-refreshed)"}
                        </div>
                      </div>
                    </div>

                    {/* Secondary Actions */}
                    <div
                      style={{
                        paddingTop: 14,
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenAccountSelector(metaConn)}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          padding: "7px 14px",
                          borderRadius: 8,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#1e293b",
                          cursor: "pointer",
                        }}
                      >
                        Change Selected Ad Account…
                      </button>

                      <a
                        href="https://adsmanager.facebook.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#2563eb",
                          textDecoration: "none",
                        }}
                      >
                        Open Meta Ads Manager <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Body: Not Connected State */
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Guidance / Options Notice Banner */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                        border: "1px solid #bbf7d0",
                        borderRadius: 12,
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 14,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, maxWidth: 660 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: "#dcfce7",
                            border: "1px solid #86efac",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          <Sparkles size={18} color="#16a34a" />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#166534" }}>
                            Don&apos;t have a Meta Developer App ID? Choose an option:
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#15803d", marginTop: 4, lineHeight: 1.5 }}>
                            You can connect immediately using <strong>1-Click Sandbox Mode</strong> with simulated live ad accounts &amp; analytics, configure your Meta App credentials, or connect via a direct Graph API token.
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={handleConnectSandbox}
                          disabled={adActionLoading === "sandbox"}
                          style={{
                            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                            color: "#ffffff",
                            border: "none",
                            padding: "9px 18px",
                            borderRadius: 9,
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            cursor: adActionLoading === "sandbox" ? "wait" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            boxShadow: "0 3px 10px rgba(22, 163, 74, 0.25)",
                          }}
                        >
                          <Sparkles size={14} />
                          <span>{adActionLoading === "sandbox" ? "Connecting Sandbox…" : "1-Click Sandbox Mode"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMetaOptionsModal(true)}
                          style={{
                            background: "#ffffff",
                            color: "#166534",
                            border: "1px solid #86efac",
                            padding: "9px 16px",
                            borderRadius: 9,
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          View All Options
                        </button>
                      </div>
                    </div>

                    {/* Primary Connect Button Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
                        borderRadius: 12,
                        border: "1px solid #dbeafe",
                        flexWrap: "wrap",
                        gap: 14,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          id="meta-oauth-connect-btn"
                          onClick={() => handleConnectOAuth("meta")}
                          disabled={adActionLoading === "meta"}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "11px 22px",
                            borderRadius: 10,
                            border: "none",
                            background: "linear-gradient(135deg, #0064e0 0%, #0081fb 50%, #0064e0 100%)",
                            color: "#ffffff",
                            fontSize: "0.92rem",
                            fontWeight: 800,
                            cursor: adActionLoading === "meta" ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 14px rgba(0, 100, 224, 0.3)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <MetaLogoIcon size={20} />
                          <span>{adActionLoading === "meta" ? "Connecting to Meta…" : "Connect with Meta"}</span>
                          <ArrowRight size={17} strokeWidth={2.4} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setMetaConfigModal(true)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 15px",
                            borderRadius: 10,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#334155",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <Key size={15} color="#4f46e5" />
                          <span>Configure App ID & Secret</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMetaDirectTokenModal(true)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 15px",
                            borderRadius: 10,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#334155",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <ShieldCheck size={15} color="#059669" />
                          <span>Direct Token Connect</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleConnectSandbox}
                          disabled={adActionLoading === "sandbox"}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 15px",
                            borderRadius: 10,
                            border: "1px dashed #93c5fd",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            cursor: adActionLoading === "sandbox" ? "wait" : "pointer",
                          }}
                        >
                          <Sparkles size={15} />
                          <span>{adActionLoading === "sandbox" ? "Connecting Sandbox…" : "Sandbox / Test Mode"}</span>
                        </button>
                      </div>

                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.78rem",
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        <Lock size={13} color="#64748b" />
                        <span>You&apos;ll be redirected to Meta to authorize. We never see your password.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CLIENT BRAND PROFILES & RETAINERS (Listing Table) */}
      {/* ======================================================== */}
      {activeSubTab === "clients" && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
            overflow: "hidden",
          }}
        >
          {/* Section Sub-header */}
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                Client Brand Configurations & Retainers
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Configure visibility status, monthly post quotas, package tiers, approval policies, and brand design guidelines.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {/* Search input */}
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  style={{
                    padding: "7px 12px 7px 30px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.8rem",
                    width: 170,
                    outline: "none",
                  }}
                />
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 8 }}>
                {[
                  { id: "all", label: `All (${clients.length})` },
                  { id: "active", label: `Active (${activeCount})` },
                  { id: "inactive", label: `Inactive (${inactiveCount})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setClientStatusFilter(st.id)}
                    style={{
                      border: "none",
                      background: clientStatusFilter === st.id ? "#ffffff" : "transparent",
                      color: clientStatusFilter === st.id ? "#0f172a" : "#64748b",
                      padding: "5px 10px",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: clientStatusFilter === st.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.12s ease",
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedCompanyId("");
                  setIsCompanyDropdownOpen(false);
                  setCompanySearch("");
                  fetchCompanyOptions();
                  setCreatingClientModal(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#4f46e5",
                  color: "#ffffff",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(79, 70, 229, 0.2)",
                }}
              >
                <Plus size={16} /> + Add Client Brand
              </button>
            </div>
          </div>

          {/* Client Brands Listing Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.84rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "14px 20px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Brand Name & Color
                  </th>
                  <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Monthly Quota
                  </th>
                  <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Package Tier
                  </th>
                  <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Approval Policy
                  </th>
                  <th style={{ padding: "14px 16px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Client Contact
                  </th>
                  <th style={{ padding: "14px 20px", fontWeight: 800, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
                    Settings & Visibility
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClientProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                      No client brands found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredClientProfiles.map((c) => {
                    const isActive = c.is_active !== false;
                    const isToggling = actionLoading === `toggle-${c.id}`;

                    return (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: isActive ? "transparent" : "#fcfcfd",
                          transition: "background 0.12s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isActive ? "#f8fafc" : "#f1f5f9")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = isActive ? "transparent" : "#fcfcfd")}
                      >
                        {/* Brand Name */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: c.primary_color || "#4f46e5",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "1rem",
                                flexShrink: 0,
                                opacity: isActive ? 1 : 0.65,
                              }}
                            >
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 800, color: isActive ? "#0f172a" : "#64748b", fontSize: "0.9rem" }}>
                                  {c.name}
                                </span>
                                {isActive ? (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      background: "#ecfdf5",
                                      color: "#047857",
                                      border: "1px solid #a7f3d0",
                                      padding: "1px 6px",
                                      borderRadius: 5,
                                      fontSize: "0.68rem",
                                      fontWeight: 800,
                                    }}
                                  >
                                    <CheckCircle2 size={10} /> Active
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      background: "#fef2f2",
                                      color: "#b91c1c",
                                      border: "1px solid #fecaca",
                                      padding: "1px 6px",
                                      borderRadius: 5,
                                      fontSize: "0.68rem",
                                      fontWeight: 800,
                                    }}
                                  >
                                    <EyeOff size={10} /> Inactive
                                  </span>
                                )}
                              </div>
                              {c.brand_tagline && (
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                  {c.brand_tagline}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Monthly Quota */}
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontWeight: 800, color: isActive ? "#0f172a" : "#64748b", fontSize: "0.95rem" }}>
                            {c.target_monthly_posts ?? 20}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#64748b", marginLeft: 4 }}>
                            posts/mo
                          </span>
                        </td>

                        {/* Package Tier */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              background: isActive ? "#eff6ff" : "#f1f5f9",
                              color: isActive ? "#1d4ed8" : "#64748b",
                              border: `1px solid ${isActive ? "#bfdbfe" : "#cbd5e1"}`,
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontSize: "0.76rem",
                              fontWeight: 700,
                            }}
                          >
                            {c.package_tier || "Growth Package"}
                          </span>
                        </td>

                        {/* Approval Policy */}
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              background: c.approval_policy === "auto_approved"
                                ? "#ecfdf5"
                                : c.approval_policy === "internal_only"
                                ? "#fef3c7"
                                : "#fff7ed",
                              color: c.approval_policy === "auto_approved"
                                ? "#047857"
                                : c.approval_policy === "internal_only"
                                ? "#b45309"
                                : "#c2410c",
                              padding: "4px 9px",
                              borderRadius: 6,
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              opacity: isActive ? 1 : 0.7,
                            }}
                          >
                            {c.approval_policy === "auto_approved"
                              ? "Direct Publish"
                              : c.approval_policy === "internal_only"
                              ? "Internal Review Only"
                              : "Client Review Required"}
                          </span>
                        </td>

                        {/* Contact info */}
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: "0.78rem", color: isActive ? "#334155" : "#64748b" }}>
                            {c.client_email || "No email on file"}
                          </div>
                          {c.client_contact && (
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              {c.client_contact}
                            </div>
                          )}
                        </td>

                        {/* Action */}
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                            {/* Activate / Deactivate Toggle Button */}
                            {isActive ? (
                              <button
                                onClick={() => handleToggleClientActive(c)}
                                disabled={isToggling}
                                title="Deactivate and hide this client from Social Media module"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  background: "#fff1f2",
                                  border: "1px solid #fecdd3",
                                  color: "#e11d48",
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  cursor: isToggling ? "wait" : "pointer",
                                  transition: "all 0.12s ease",
                                }}
                              >
                                <EyeOff size={13} /> {isToggling ? "Updating..." : "Deactivate"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleClientActive(c)}
                                disabled={isToggling}
                                title="Activate and show this client in Social Media module"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  background: "#f0fdf4",
                                  border: "1px solid #86efac",
                                  color: "#15803d",
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  cursor: isToggling ? "wait" : "pointer",
                                  transition: "all 0.12s ease",
                                }}
                              >
                                <CheckCircle2 size={13} /> {isToggling ? "Updating..." : "Activate"}
                              </button>
                            )}

                            {/* Edit Config */}
                            <button
                              onClick={() => setEditingClient({ ...c })}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                                color: "#334155",
                                padding: "6px 12px",
                                borderRadius: 8,
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              <Edit2 size={13} /> Edit Config
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
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. WORKFLOW & PRIORITY PREFERENCES (Listing Style Rows) */}
      {/* ======================================================== */}
      {activeSubTab === "workflow" && (
        <form
          onSubmit={handleSaveWorkflowPrefs}
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                Workflow Pipeline & Priority Automation Rules
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Set agency-wide standard publishing times, default priority assignment, and stage routing.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {workflowSaved && (
                <span style={{ color: "#16a34a", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <Check size={16} /> Preferences Saved!
                </span>
              )}
              <button
                type="submit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: 9,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Save size={15} /> Save Workflow Rules
              </button>
            </div>
          </div>

          {/* Rule Rows (Listing format - no cards) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Setting 1: Default Post Priority */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                  Default Priority for New Posts
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Priority assigned when posts are drafted from scripts or quick schedule
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "urgent", label: "Urgent", color: "#dc2626" },
                  { id: "high", label: "High", color: "#ea580c" },
                  { id: "medium", label: "Medium", color: "#0284c7" },
                  { id: "low", label: "Low", color: "#16a34a" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setWorkflowPrefs({ ...workflowPrefs, defaultPriority: p.id })}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: `1.5px solid ${workflowPrefs.defaultPriority === p.id ? p.color : "#cbd5e1"}`,
                      background: workflowPrefs.defaultPriority === p.id ? "#ffffff" : "transparent",
                      color: workflowPrefs.defaultPriority === p.id ? p.color : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: p.color,
                        flexShrink: 0,
                      }}
                    />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Setting 2: Standard Daily Posting Slots */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                  Peak Engagement Scheduling Time Slots
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Pre-configured time slots offered in calendar and post scheduling
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {workflowPrefs.timeSlots.map((slot, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Clock size={13} color="#2563eb" /> {slot}
                  </span>
                ))}
              </div>
            </div>

            {/* Setting 3: Client Review Deadline */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                  Client Review Turnaround Reminder
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Trigger reminder alerts to clients if pending approval exceeds this threshold
                </div>
              </div>
              <select
                value={workflowPrefs.reviewDeadlineHours}
                onChange={(e) => setWorkflowPrefs({ ...workflowPrefs, reviewDeadlineHours: Number(e.target.value) })}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  background: "#fff",
                }}
              >
                <option value={12}>12 Hours (Fast-track campaigns)</option>
                <option value={24}>24 Hours (Standard agency SLA)</option>
                <option value={48}>48 Hours (Relaxed turnaround)</option>
              </select>
            </div>

            {/* Setting 4: Urgent Post Pipeline Bypass */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                  Urgent Post Fast-Track Workflow
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Allow posts marked Urgent to skip script review directly to Designing & Scheduling
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={workflowPrefs.bypassForUrgent}
                  onChange={(e) => setWorkflowPrefs({ ...workflowPrefs, bypassForUrgent: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#2563eb" }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                  {workflowPrefs.bypassForUrgent ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 4. AI CONTENT ENGINE PREFERENCES (Listing Style Rows) */}
      {/* ======================================================== */}
      {activeSubTab === "ai" && (
        <form
          onSubmit={handleSaveAiPrefs}
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                AI Content Studio & Generation Engine Settings
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Configure bilingual generation (English + Malayalam), model routing, and brand voice guidelines.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {aiSaved && (
                <span style={{ color: "#16a34a", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <Check size={16} /> AI Settings Saved!
                </span>
              )}
              <button
                type="submit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  color: "#fff",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: 9,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Save size={15} /> Save AI Settings
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Setting 1: Language preference */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                  Default AI Output Language
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Preferred language for captions, hooks, and script ideation
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "bilingual", label: "Bilingual (EN + Malayalam)" },
                  { id: "en", label: "English Only" },
                  { id: "ml", label: "Malayalam Script" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setAiPrefs({ ...aiPrefs, defaultLanguage: l.id })}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: `1.5px solid ${aiPrefs.defaultLanguage === l.id ? "#8b5cf6" : "#cbd5e1"}`,
                      background: aiPrefs.defaultLanguage === l.id ? "#f5f3ff" : "#fff",
                      color: aiPrefs.defaultLanguage === l.id ? "#7c3aed" : "#475569",
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting 2: Brand Voice */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                  Primary Tone of Voice
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Directs the writing style, emotional appeal, and vocabulary
                </div>
              </div>
              <select
                value={aiPrefs.toneOfVoice}
                onChange={(e) => setAiPrefs({ ...aiPrefs, toneOfVoice: e.target.value })}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  background: "#fff",
                }}
              >
                <option value="authoritative">Authoritative & Industry Leadership</option>
                <option value="viral">High-Energy & Viral Hook Driven</option>
                <option value="festive">Festive & Celebratory (Kerala/India)</option>
                <option value="storytelling">Emotional Storytelling & Case Studies</option>
              </select>
            </div>

            {/* Setting 3: Hashtag Limits */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem" }}>
                  Auto-Generated Hashtag Count
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Target number of niche and trending hashtags appended to captions
                </div>
              </div>
              <select
                value={aiPrefs.targetHashtags}
                onChange={(e) => setAiPrefs({ ...aiPrefs, targetHashtags: Number(e.target.value) })}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  background: "#fff",
                }}
              >
                <option value={8}>8 Hashtags (Minimalist)</option>
                <option value={15}>15 Hashtags (Balanced SEO)</option>
                <option value={25}>25 Hashtags (High Discoverability)</option>
              </select>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 5. NOTIFICATIONS & ALERTS (Listing Style Rows) */}
      {/* ======================================================== */}
      {activeSubTab === "notifications" && (
        <form
          onSubmit={handleSaveNotifyPrefs}
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                Omnichannel Client & Team Notification Hooks
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                WhatsApp approval link webhooks, email review alerts, and publication notifications.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {notifySaved && (
                <span style={{ color: "#16a34a", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <Check size={16} /> Notification Settings Saved!
                </span>
              )}
              <button
                type="submit"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  padding: "9px 18px",
                  borderRadius: 9,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Save size={15} /> Save Notification Hooks
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Setting 1: WhatsApp Approval Link Alerts */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageSquare size={16} color="#16a34a" />
                  <span>WhatsApp Instant Client Approval Alerts</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Sends client a WhatsApp notification containing their secure one-click approval link
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifyPrefs.whatsappAlerts}
                  onChange={(e) => setNotifyPrefs({ ...notifyPrefs, whatsappAlerts: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#16a34a" }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                  {notifyPrefs.whatsappAlerts ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            {/* Setting 2: Team Email Alerts */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={16} color="#2563eb" />
                  <span>Internal Email Review Notifications</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Notify copywriters when scripts are approved; notify designers when drafts are assigned
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifyPrefs.emailReviewAlerts}
                  onChange={(e) => setNotifyPrefs({ ...notifyPrefs, emailReviewAlerts: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#2563eb" }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                  {notifyPrefs.emailReviewAlerts ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            {/* Setting 3: Daily Digest */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <ClipboardList size={16} color="#4f46e5" />
                  <span>Morning Social Media Digest</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Sends a daily summary at 08:30 AM with all content scheduled for today across clients
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={notifyPrefs.dailyDigest}
                  onChange={(e) => setNotifyPrefs({ ...notifyPrefs, dailyDigest: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#2563eb" }}
                />
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                  {notifyPrefs.dailyDigest ? "Active" : "Disabled"}
                </span>
              </label>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* CONNECT SOCIAL CHANNEL MODAL */}
      {/* ======================================================== */}
      {connectingModal && (
        <div className="social-modal-overlay" onClick={() => setConnectingModal(false)}>
          <div
            className="social-modal-content"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="social-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Share2 size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Connect Social Media Channel</h3>
              </div>
              <button
                onClick={() => setConnectingModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Select Platform:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPlatform(key)}
                      style={{
                        padding: "8px 6px",
                        borderRadius: 8,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        border: `1.5px solid ${selectedPlatform === key ? config.color : "#cbd5e1"}`,
                        background: selectedPlatform === key ? "#eff6ff" : "#fff",
                        color: selectedPlatform === key ? config.color : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        {config.icon}
                        <span>{config.label.split(" ")[0]}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Client Brand Profile *
                </label>
                <select
                  value={newAccClient}
                  onChange={(e) => setNewAccClient(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600 }}
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Account / Page Display Name *
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Adstra Digital Global Official"
                  required
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@adstradigital"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Followers Count
                  </label>
                  <input
                    type="number"
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setConnectingModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 18px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT CLIENT BRAND CONFIG MODAL */}
      {/* ======================================================== */}
      {editingClient && (
        <div className="social-modal-overlay" onClick={() => setEditingClient(null)}>
          <div
            className="social-modal-content"
            style={{ maxWidth: 700, width: "95vw", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="social-modal-header" style={{ padding: "16px 22px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: editingClient.primary_color ? `${editingClient.primary_color}18` : "#e0e7ff",
                    color: editingClient.primary_color || "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.12rem", fontWeight: 800, color: "#0f172a" }}>
                    Edit Brand Settings: {editingClient.name}
                  </h3>
                  <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 2 }}>
                    Manage company identity, creative strategy, target audience, and social plan
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-Tab Navigation Bar */}
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "10px 22px",
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
                overflowX: "auto",
              }}
            >
              {[
                { id: "general", label: "Plan & Brand Identity", icon: <Sliders size={14} /> },
                { id: "company", label: "Company & Contact", icon: <Building2 size={14} /> },
                { id: "strategy", label: "Creative Strategy & Guidelines", icon: <Target size={14} /> },
                { id: "social", label: "Social Handles & Notes", icon: <Share2 size={14} /> },
              ].map((tab) => {
                const isSelected = brandSettingsTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBrandSettingsTab(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: isSelected ? "1.5px solid #4f46e5" : "1px solid #e2e8f0",
                      background: isSelected ? "#eef2ff" : "#f8fafc",
                      color: isSelected ? "#4f46e5" : "#64748b",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveClient} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
              <div className="social-modal-body" style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* ======================================================== */}
                {/* TAB 1: PLAN & BRAND IDENTITY                             */}
                {/* ======================================================== */}
                {brandSettingsTab === "general" && (
                  <>
                    {/* Visibility & Active Status Card */}
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: 10,
                        background: editingClient.is_active !== false ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${editingClient.is_active !== false ? "#bbf7d0" : "#fecaca"}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.85rem", color: editingClient.is_active !== false ? "#166534" : "#991b1b", display: "flex", alignItems: "center", gap: 6 }}>
                          {editingClient.is_active !== false ? <CheckCircle2 size={15} /> : <EyeOff size={15} />}
                          <span>Status: {editingClient.is_active !== false ? "Active & Visible" : "Deactivated (Hidden)"}</span>
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: 2 }}>
                          {editingClient.is_active !== false
                            ? "Client is selectable in header switcher, calendars, scripts, and post creation."
                            : "Client is hidden from all Social Media module selectors and calendar views."}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingClient({
                            ...editingClient,
                            is_active: editingClient.is_active === false,
                          })
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 14px",
                          borderRadius: 8,
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          background: editingClient.is_active !== false ? "#e11d48" : "#16a34a",
                          color: "#ffffff",
                          flexShrink: 0,
                        }}
                      >
                        {editingClient.is_active !== false ? (
                          <>
                            <EyeOff size={13} /> Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} /> Activate
                          </>
                        )}
                      </button>
                    </div>

                    {/* Monthly Quota & Package Tier */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Monthly Target Posts Quota
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editingClient.target_monthly_posts ?? ""}
                          onChange={(e) => setEditingClient({ ...editingClient, target_monthly_posts: e.target.value })}
                          placeholder="e.g. 20"
                          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Package Tier
                        </label>
                        <input
                          type="text"
                          value={editingClient.package_tier || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, package_tier: e.target.value })}
                          placeholder="e.g. Growth Package / Enterprise Tier"
                          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>

                    {/* Approval Policy */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Approval Policy Requirement
                      </label>
                      <select
                        value={editingClient.approval_policy || "client_required"}
                        onChange={(e) => setEditingClient({ ...editingClient, approval_policy: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600 }}
                      >
                        <option value="client_required">Client Review Required (Standard)</option>
                        <option value="internal_only">Internal Team Review Only</option>
                        <option value="auto_approved">Direct Auto-Publish</option>
                      </select>
                    </div>

                    {/* Brand Tagline */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Brand Tagline / Slogan
                      </label>
                      <input
                        type="text"
                        value={editingClient.brand_tagline || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, brand_tagline: e.target.value })}
                        placeholder="e.g. Elevating Daily Fashion for Modern Youth"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      />
                    </div>

                    {/* Brand Color Palettes */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Primary Brand Hex Color
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="color"
                            value={editingClient.primary_color || "#4f46e5"}
                            onChange={(e) => setEditingClient({ ...editingClient, primary_color: e.target.value })}
                            style={{ width: 42, height: 38, border: "none", borderRadius: 6, cursor: "pointer" }}
                          />
                          <input
                            type="text"
                            value={editingClient.primary_color || "#4f46e5"}
                            onChange={(e) => setEditingClient({ ...editingClient, primary_color: e.target.value })}
                            style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Secondary / Accent Brand Color
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="color"
                            value={editingClient.secondary_color || "#06b6d4"}
                            onChange={(e) => setEditingClient({ ...editingClient, secondary_color: e.target.value })}
                            style={{ width: 42, height: 38, border: "none", borderRadius: 6, cursor: "pointer" }}
                          />
                          <input
                            type="text"
                            value={editingClient.secondary_color || "#06b6d4"}
                            onChange={(e) => setEditingClient({ ...editingClient, secondary_color: e.target.value })}
                            style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brand Logo URL */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Brand Logo URL / Image Link
                      </label>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input
                          type="text"
                          value={editingClient.logo_url || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, logo_url: e.target.value })}
                          placeholder="https://... or link from Client Assets storage"
                          style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        />
                        {editingClient.logo_url && (
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={editingClient.logo_url}
                              alt="Logo"
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ======================================================== */}
                {/* TAB 2: COMPANY & CONTACT DETAILS                         */}
                {/* ======================================================== */}
                {brandSettingsTab === "company" && (
                  <>
                    {/* Industry & Website */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Industry / Business Category
                        </label>
                        <input
                          type="text"
                          list="industry-options"
                          value={editingClient.industry || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, industry: e.target.value })}
                          placeholder="e.g. Fashion & Retail / Healthcare"
                          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        />
                        <datalist id="industry-options">
                          <option value="Fashion & Apparel Retail" />
                          <option value="Food & Beverage / Restaurant" />
                          <option value="Healthcare & Ayurvedic Medicine" />
                          <option value="Hospitality, Hotels & Tourism" />
                          <option value="Technology, AI & SaaS" />
                          <option value="Education & Coaching Academy" />
                          <option value="E-commerce & D2C Brands" />
                          <option value="Real Estate & Architecture" />
                          <option value="Finance & Professional Services" />
                        </datalist>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Official Website URL
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="url"
                            value={editingClient.website_url || ""}
                            onChange={(e) => setEditingClient({ ...editingClient, website_url: e.target.value })}
                            placeholder="https://www.clientwebsite.com"
                            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                          <Globe size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        </div>
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Contact Person & Role
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={editingClient.contact_person || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, contact_person: e.target.value })}
                          placeholder="e.g. Rahul Sharma (Managing Director / Marketing Lead)"
                          style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        />
                        <Users size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Client Email (for approvals & reports)
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="email"
                            value={editingClient.client_email || ""}
                            onChange={(e) => setEditingClient({ ...editingClient, client_email: e.target.value })}
                            placeholder="e.g. approvals@company.com"
                            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                          <Mail size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          WhatsApp / Phone Contact
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={editingClient.client_contact || ""}
                            onChange={(e) => setEditingClient({ ...editingClient, client_contact: e.target.value })}
                            placeholder="e.g. +91 98765 43210"
                            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                          <Phone size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        </div>
                      </div>
                    </div>

                    {/* Business Address */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Registered / Business Address
                      </label>
                      <div style={{ position: "relative" }}>
                        <textarea
                          rows={2}
                          value={editingClient.address || ""}
                          onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                          placeholder="e.g. 2nd Floor, Corporate Tower, Infopark Kochi, Kerala - 682042"
                          style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", resize: "vertical" }}
                        />
                        <MapPin size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: 12 }} />
                      </div>
                    </div>
                  </>
                )}

                {/* ======================================================== */}
                {/* TAB 3: CREATIVE STRATEGY & GUIDELINES                    */}
                {/* ======================================================== */}
                {brandSettingsTab === "strategy" && (
                  <>
                    <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "10px 14px", fontSize: "0.76rem", color: "#5b21b6" }}>
                      💡 <strong>Team Creative Briefing</strong>: Information entered here is directly referenced by scriptwriters and graphic designers when creating social content.
                    </div>

                    {/* Brand Tone of Voice */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Brand Tone of Voice & Personality
                      </label>
                      <input
                        type="text"
                        value={editingClient.brand_tone || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, brand_tone: e.target.value })}
                        placeholder="e.g. Youthful, High-Energy, Trendy, Conversational Malayalam + English mix, Empathetic & Inspiring"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      />
                    </div>

                    {/* Target Audience & Demographics */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Target Audience & Demographics
                      </label>
                      <textarea
                        rows={3}
                        value={editingClient.target_audience || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, target_audience: e.target.value })}
                        placeholder="e.g. Men & Women aged 18–35 in Kerala. Fashion-conscious college students and working professionals seeking affordable, premium daily ethnic and western wear."
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", resize: "vertical" }}
                      />
                    </div>

                    {/* Key USPs & Core Value Propositions */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Core USPs & Key Selling Points (To feature in hooks & CTAs)
                      </label>
                      <textarea
                        rows={3}
                        value={editingClient.key_usps || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, key_usps: e.target.value })}
                        placeholder="e.g. • 100% Genuine, authentic fabrics sourced directly&#10;• 48-Hour express delivery across South India&#10;• Easy 7-day hassle-free replacement&#10;• Transparent pricing with zero hidden charges"
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", resize: "vertical" }}
                      />
                    </div>

                    {/* Brand Guidelines & Dos / Don'ts */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Brand Guidelines & Content Dos / Don'ts (Rules for designers & copywriters)
                      </label>
                      <textarea
                        rows={3}
                        value={editingClient.brand_guidelines || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, brand_guidelines: e.target.value })}
                        placeholder="e.g. DO: Use natural daylight photography, bold sans-serif headlines, high-contrast cyan brand accents.&#10;DON'T: Avoid overly saturated stock photos, never use comic fonts, no misleading price claims."
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", resize: "vertical" }}
                      />
                    </div>
                  </>
                )}

                {/* ======================================================== */}
                {/* TAB 4: SOCIAL PROFILES & NOTES                           */}
                {/* ======================================================== */}
                {brandSettingsTab === "social" && (
                  <>
                    <div style={{ fontSize: "0.76rem", color: "#64748b", marginBottom: 2 }}>
                      Add public social profile handles and URLs for quick cross-referencing and live tagging:
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {/* Instagram */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Instagram Handle
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={editingClient.social_handles?.instagram || ""}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                social_handles: {
                                  ...(editingClient.social_handles || {}),
                                  instagram: e.target.value,
                                },
                              })
                            }
                            placeholder="@brandhandle"
                            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                          <Instagram size={14} color="#e1306c" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        </div>
                      </div>

                      {/* Facebook */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          Facebook Page URL / Handle
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={editingClient.social_handles?.facebook || ""}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                social_handles: {
                                  ...(editingClient.social_handles || {}),
                                  facebook: e.target.value,
                                },
                              })
                            }
                            placeholder="facebook.com/brandpage"
                            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                          <Facebook size={14} color="#1877f2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          LinkedIn Company URL
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={editingClient.social_handles?.linkedin || ""}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                social_handles: {
                                  ...(editingClient.social_handles || {}),
                                  linkedin: e.target.value,
                                },
                              })
                            }
                            placeholder="linkedin.com/company/brand"
                            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                          <Linkedin size={14} color="#0a66c2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        </div>
                      </div>

                      {/* YouTube */}
                      <div>
                        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                          YouTube Channel
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={editingClient.social_handles?.youtube || ""}
                            onChange={(e) =>
                              setEditingClient({
                                ...editingClient,
                                social_handles: {
                                  ...(editingClient.social_handles || {}),
                                  youtube: e.target.value,
                                },
                              })
                            }
                            placeholder="youtube.com/@brandchannel"
                            style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                          <Youtube size={14} color="#ff0000" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        </div>
                      </div>
                    </div>

                    {/* Internal Account Notes */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        Internal Agency Notes & Strategic Directives
                      </label>
                      <textarea
                        rows={3}
                        value={editingClient.notes || ""}
                        onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                        placeholder="e.g. Client focusing on Onam festive reels campaign. Target 10 reels + 10 single posters per month. Main contact WhatsApp for quick approvals."
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.84rem", resize: "vertical" }}
                      />
                    </div>
                  </>
                )}

              </div>

              {/* Modal Footer with Actions */}
              <div
                style={{
                  padding: "14px 22px",
                  borderTop: "1px solid #e2e8f0",
                  background: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                  Active section: <strong style={{ color: "#334155" }}>{brandSettingsTab === "general" ? "Plan & Brand Identity" : brandSettingsTab === "company" ? "Company & Contact" : brandSettingsTab === "strategy" ? "Creative Strategy" : "Social Profiles & Notes"}</strong>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={clientSaving}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontSize: "0.84rem",
                      boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Save size={14} />
                    {clientSaving ? "Saving Settings..." : "Save Brand Settings"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE NEW CLIENT BRAND MODAL */}
      {/* ======================================================== */}
      {creatingClientModal && (
        <div
          className="social-modal-overlay"
          onClick={() => {
            setCreatingClientModal(false);
            setSelectedCompanyId("");
            setIsCompanyDropdownOpen(false);
            setCompanySearch("");
          }}
        >
          <div
            className="social-modal-content"
            style={{ maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="social-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Building2 size={20} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Add New Client Brand Profile</h3>
              </div>
              <button
                onClick={() => {
                  setCreatingClientModal(false);
                  setSelectedCompanyId("");
                  setIsCompanyDropdownOpen(false);
                  setCompanySearch("");
                }}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Searchable Client Company Selector */}
              <div ref={companyDropdownRef} style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>
                    Select Client Company *
                  </label>
                  {selectedCompanyId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCompanyId("");
                        setCompanySearch("");
                        setIsCompanyDropdownOpen(false);
                        setNewClientData({
                          ...newClientData,
                          name: "",
                          client_email: "",
                          client_contact: "",
                          client: null,
                        });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {/* Dropdown Trigger Box */}
                <div
                  onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: isCompanyDropdownOpen ? "1.5px solid #4f46e5" : "1px solid #cbd5e1",
                    background: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    boxShadow: isCompanyDropdownOpen ? "0 0 0 3px rgba(79, 70, 229, 0.1)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                    <Building2 size={16} color={selectedCompanyId ? "#4f46e5" : "#94a3b8"} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        color: selectedCompanyId ? "#0f172a" : "#64748b",
                        fontWeight: selectedCompanyId && selectedCompanyId !== "__custom__" ? 600 : 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {selectedCompanyId === "__custom__"
                        ? "+ Custom / Manual Entry"
                        : selectedCompanyId
                        ? (() => {
                            const found = companyOptions.find((c) => String(c.id) === String(selectedCompanyId));
                            return found ? (found.company_name || found.name) : "Select from Client Companies";
                          })()
                        : loadingCompanies
                        ? "Loading client companies..."
                        : "-- Search & Select from Client Companies --"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {selectedCompanyId && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompanyId("");
                          setCompanySearch("");
                          setNewClientData({
                            ...newClientData,
                            name: "",
                            client_email: "",
                            client_contact: "",
                            client: null,
                          });
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          background: "#f1f5f9",
                          color: "#64748b",
                        }}
                        title="Clear selection"
                      >
                        <X size={12} />
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      color="#64748b"
                      style={{
                        transform: isCompanyDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.15s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Dropdown Menu Popover with Search Filter */}
                {isCompanyDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      background: "#ffffff",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    {/* Search Input Box */}
                    <div style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                      <div style={{ position: "relative" }}>
                        <Search
                          size={14}
                          color="#94a3b8"
                          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
                        />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search company by name, contact or phone..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "7px 10px 7px 30px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.82rem",
                            outline: "none",
                            background: "#ffffff",
                          }}
                        />
                        {companySearch && (
                          <button
                            type="button"
                            onClick={() => setCompanySearch("")}
                            style={{
                              position: "absolute",
                              right: 8,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              padding: 2,
                            }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scrollable List of Companies */}
                    <div style={{ maxHeight: 210, overflowY: "auto", padding: "4px 0" }}>
                      {/* Manual / Custom option */}
                      <div
                        onClick={() => {
                          setSelectedCompanyId("__custom__");
                          setIsCompanyDropdownOpen(false);
                          setCompanySearch("");
                          setNewClientData({
                            ...newClientData,
                            client: null,
                            name: "",
                            client_email: "",
                            client_contact: "",
                          });
                        }}
                        style={{
                          padding: "8px 14px",
                          fontSize: "0.82rem",
                          color: "#4f46e5",
                          fontWeight: 700,
                          cursor: "pointer",
                          borderBottom: "1px solid #f1f5f9",
                          background: selectedCompanyId === "__custom__" ? "#eff6ff" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = selectedCompanyId === "__custom__" ? "#eff6ff" : "transparent")}
                      >
                        <Plus size={14} /> + Enter Custom Brand / New Name
                      </div>

                      {filteredCompanyOptions.length === 0 ? (
                        <div style={{ padding: "16px 14px", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
                          No companies found matching "{companySearch}"
                        </div>
                      ) : (
                        filteredCompanyOptions.map((comp) => {
                          const isSelected = String(selectedCompanyId) === String(comp.id);
                          const displayName = comp.company_name || comp.name;

                          return (
                            <div
                              key={comp.id}
                              onClick={() => {
                                setSelectedCompanyId(comp.id);
                                setIsCompanyDropdownOpen(false);
                                setCompanySearch("");
                                const compName = (comp.company_name || comp.name || "").trim();
                                setNewClientData({
                                  ...newClientData,
                                  client: comp.id,
                                  name: compName,
                                  client_email: comp.email || "",
                                  client_contact: comp.contact || "",
                                });
                              }}
                              style={{
                                padding: "8px 14px",
                                cursor: "pointer",
                                borderBottom: "1px solid #f8fafc",
                                background: isSelected ? "#f0f4ff" : "transparent",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                transition: "background 0.12s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = isSelected ? "#e0e7ff" : "#f8fafc")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? "#f0f4ff" : "transparent")}
                            >
                              <div>
                                <div style={{ fontSize: "0.84rem", fontWeight: isSelected ? 700 : 600, color: isSelected ? "#4f46e5" : "#0f172a" }}>
                                  {displayName}
                                </div>
                                {(comp.contact_name || comp.contact || comp.address) && (
                                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                                    {[comp.contact_name, comp.contact, comp.address].filter(Boolean).join(" • ")}
                                  </div>
                                )}
                              </div>
                              {isSelected && <Check size={16} color="#4f46e5" style={{ flexShrink: 0, marginLeft: 8 }} />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
                  Search and select from your registered client companies to auto-fill brand details.
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Client Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Solutions"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                    backgroundColor: selectedCompanyId && selectedCompanyId !== "__custom__" ? "#f8fafc" : "#ffffff",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Monthly Target Posts
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newClientData.target_monthly_posts ?? ""}
                    onChange={(e) => setNewClientData({ ...newClientData, target_monthly_posts: e.target.value })}
                    placeholder="e.g. 20"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Package Tier
                  </label>
                  <input
                    type="text"
                    value={newClientData.package_tier}
                    onChange={(e) => setNewClientData({ ...newClientData, package_tier: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={newClientData.client_email}
                    onChange={(e) => setNewClientData({ ...newClientData, client_email: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Client Contact / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newClientData.client_contact}
                    onChange={(e) => setNewClientData({ ...newClientData, client_contact: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingClientModal(false);
                    setSelectedCompanyId("");
                    setIsCompanyDropdownOpen(false);
                    setCompanySearch("");
                  }}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clientSaving}
                  style={{ padding: "8px 18px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
                >
                  {clientSaving ? "Creating..." : "Create Client Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* ACCOUNT SELECTION MODAL (META AD ACCOUNT & PAGE IDENTITY)*/}
      {/* ======================================================== */}
      {accountSelectModal && (
        <div className="social-modal-overlay" onClick={() => setAccountSelectModal(null)}>
          <div
            className="social-modal-content"
            style={{ maxWidth: 540, borderRadius: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="social-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#eff6ff",
                    color: "#1877f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Facebook size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                  Configure Meta Ad Account & Linked Page
                </h3>
              </div>
              <button
                onClick={() => setAccountSelectModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 16 }}>
              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Select which Meta Advertising Account and Facebook Page / Instagram Identity to use when deploying campaigns for this client.
              </p>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Accessible Meta Ad Accounts
                </label>
                {availableAccounts.length > 0 ? (
                  <select
                    value={selectedAdAccount}
                    onChange={(e) => setSelectedAdAccount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                      background: "#ffffff",
                    }}
                  >
                    {availableAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name || acc.descriptive_name || acc.id} ({acc.id}) {acc.currency || acc.currency_code ? `[${acc.currency || acc.currency_code}]` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="act_123456789"
                      value={selectedAdAccount}
                      onChange={(e) => setSelectedAdAccount(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Linked Facebook Page / Instagram Identity
                </label>
                {availablePages.length > 0 ? (
                  <select
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                      background: "#ffffff",
                    }}
                  >
                    {availablePages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name} ({page.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Page ID (e.g. 1029384756)"
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                    }}
                  />
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setAccountSelectModal(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    fontWeight: 600,
                    fontSize: "0.84rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSelectedAccount}
                  disabled={adActionLoading === "saving_account"}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    background: "#1877f2",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(24, 119, 242, 0.3)",
                  }}
                >
                  {adActionLoading === "saving_account" ? "Saving..." : "Save Meta Account Selection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIGURE META APP CREDENTIALS MODAL                     */}
      {/* ======================================================== */}
      {metaConfigModal && (
        <div className="social-modal-overlay" onClick={() => setMetaConfigModal(false)}>
          <div
            className="social-modal-content"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="social-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Key size={20} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Configure Meta App Credentials</h3>
              </div>
              <button
                onClick={() => setMetaConfigModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMetaCredentials} className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5, background: "#f8fafc", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                Obtain your <strong>App ID</strong> and <strong>App Secret</strong> from the{" "}
                <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline" }}>
                  Meta for Developers Portal <ExternalLink size={12} style={{ display: "inline" }} />
                </a>.
                Saving will configure them directly into your <code>backend/.env</code>.
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Meta App ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1029384756281920"
                  value={metaAppId}
                  onChange={(e) => setMetaAppId(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Meta App Secret *
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. 9f8e7d6c5b4a3120..."
                  value={metaAppSecret}
                  onChange={(e) => setMetaAppSecret(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155" }}>
                    Valid OAuth Redirect URI
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(metaRedirectUri);
                      setCopiedRedirectUri(true);
                      setTimeout(() => setCopiedRedirectUri(false), 2000);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: copiedRedirectUri ? "#16a34a" : "#2563eb",
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Copy size={12} /> {copiedRedirectUri ? "Copied!" : "Copy URI"}
                  </button>
                </div>
                <input
                  type="text"
                  value={metaRedirectUri}
                  onChange={(e) => setMetaRedirectUri(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.8rem", background: "#f8fafc", color: "#475569" }}
                />
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
                  Paste this exact URI under: <em>Meta App → Facebook Login for Business → Settings → Valid OAuth Redirect URIs</em>.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setMetaConfigModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={metaSaving}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: "#0064e0",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: metaSaving ? "wait" : "pointer",
                    fontSize: "0.84rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Save size={14} /> {metaSaving ? "Saving..." : "Save Meta Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIRECT META TOKEN / SYSTEM USER CONNECTION MODAL        */}
      {/* ======================================================== */}
      {metaDirectTokenModal && (
        <div className="social-modal-overlay" onClick={() => setMetaDirectTokenModal(false)}>
          <div
            className="social-modal-content"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="social-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldCheck size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Direct Meta Token Connection</h3>
              </div>
              <button
                onClick={() => setMetaDirectTokenModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDirectToken} className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5, background: "#f0fdf4", padding: "10px 14px", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                Connect directly using a <strong>Meta System User Token</strong> or <strong>Permanent Graph API Token</strong> from Meta Business Manager. No App Login dialog required.
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Meta Ad Account ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. act_1234567890"
                  value={directAccountId}
                  onChange={(e) => setDirectAccountId(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Ad Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adstra Digital Main Ads"
                  value={directAccountName}
                  onChange={(e) => setDirectAccountName(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  System User / Access Token *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. EAAB..."
                  value={directAccessToken}
                  onChange={(e) => setDirectAccessToken(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                    Linked Page ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1029384756"
                    value={directPageId}
                    onChange={(e) => setDirectPageId(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                    Linked Page Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adstra Digital"
                    value={directPageName}
                    onChange={(e) => setDirectPageName(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setMetaDirectTokenModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: "0.82rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={directSaving}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    background: "#059669",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: directSaving ? "wait" : "pointer",
                    fontSize: "0.84rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Check size={14} /> {directSaving ? "Connecting..." : "Connect Ad Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* META CONNECTION OPTIONS MODAL (When App ID not ready)    */}
      {/* ======================================================== */}
      {metaOptionsModal && (
        <div className="social-modal-overlay" onClick={() => setMetaOptionsModal(false)}>
          <div
            className="social-modal-content"
            style={{ maxWidth: 660, padding: 0, overflow: "hidden", borderRadius: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #0064e0 0%, #0081fb 100%)",
                padding: "22px 26px",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MetaLogoIcon size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>
                    Connect Meta Advertising &amp; Pages
                  </h3>
                  <p style={{ margin: "3px 0 0", fontSize: "0.82rem", opacity: 0.9 }}>
                    Choose the best connection option for your current setup:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMetaOptionsModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: 16, background: "#f8fafc" }}>
              {/* Option 1: 1-Click Sandbox Mode (Highlighted) */}
              <div
                style={{
                  background: "#ffffff",
                  border: "2px solid #22c55e",
                  borderRadius: 14,
                  padding: "18px 20px",
                  boxShadow: "0 4px 14px rgba(34, 197, 94, 0.12)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -11,
                    right: 18,
                    background: "#16a34a",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "2px 10px",
                    borderRadius: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Recommended · Instant (No Setup)
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#dcfce7",
                      border: "1px solid #86efac",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={22} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", color: "#0f172a", fontWeight: 800 }}>
                      1-Click Sandbox / Test Mode
                    </h4>
                    <p style={{ margin: "5px 0 14px", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                      No Meta Developer account, App ID, or Meta business verification required! Immediately activates a simulated live Meta Ad Account (<code>act_SANDBOX_123</code> - Sandbox Meta Account) and Facebook Page. All ad campaigns, metrics, lead sync, and retainer features work right away.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMetaOptionsModal(false);
                        handleConnectSandbox();
                      }}
                      disabled={adActionLoading === "sandbox"}
                      style={{
                        background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                        color: "#ffffff",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: 9,
                        fontSize: "0.86rem",
                        fontWeight: 800,
                        cursor: adActionLoading === "sandbox" ? "wait" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 3px 10px rgba(22, 163, 74, 0.3)",
                      }}
                    >
                      <Sparkles size={16} />
                      <span>{adActionLoading === "sandbox" ? "Activating Sandbox…" : "Connect in Sandbox Mode Now"}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 2: Configure Meta App ID & Secret */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "18px 20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Key size={22} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#0f172a", fontWeight: 800 }}>
                        Configure Meta App ID &amp; App Secret
                      </h4>
                      <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, color: "#475569", fontWeight: 700 }}>
                        For Production OAuth
                      </span>
                    </div>
                    <p style={{ margin: "5px 0 14px", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                      If you have created a Meta App on <strong>developers.facebook.com</strong>, enter your App ID and Secret here. This writes directly to <code>backend/.env</code> and configures live OAuth login.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMetaOptionsModal(false);
                        setMetaConfigModal(true);
                      }}
                      style={{
                        background: "#ffffff",
                        color: "#1e293b",
                        border: "1px solid #cbd5e1",
                        padding: "9px 18px",
                        borderRadius: 8,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Key size={14} color="#4f46e5" />
                      <span>Configure App ID &amp; Secret Dialog</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 3: Direct Token Connect */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: "18px 20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={22} color="#059669" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#0f172a", fontWeight: 800 }}>
                        Connect via Direct Access Token
                      </h4>
                      <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, color: "#475569", fontWeight: 700 }}>
                        Meta Business Manager
                      </span>
                    </div>
                    <p style={{ margin: "5px 0 14px", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5 }}>
                      Connect directly using a Meta System User Token or Graph API Explorer Token. Useful for media buyers and agencies who manage ad accounts directly without creating an OAuth app.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMetaOptionsModal(false);
                        setMetaDirectTokenModal(true);
                      }}
                      style={{
                        background: "#ffffff",
                        color: "#1e293b",
                        border: "1px solid #cbd5e1",
                        padding: "9px 18px",
                        borderRadius: 8,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ShieldCheck size={14} color="#059669" />
                      <span>Enter Direct Token &amp; Account ID</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-step developer guide hint */}
              <div
                style={{
                  background: "#eff6ff",
                  borderRadius: 10,
                  border: "1px solid #bfdbfe",
                  padding: "12px 16px",
                  fontSize: "0.78rem",
                  color: "#1e40af",
                  lineHeight: 1.5,
                }}
              >
                <strong>💡 How to create a free Meta Developer App in 2 minutes:</strong>
                <ol style={{ margin: "6px 0 0", paddingLeft: 18, color: "#1e3a8a" }}>
                  <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 700 }}>developers.facebook.com/apps</a> and click <strong>Create App</strong>.</li>
                  <li>Select <strong>Other</strong> &rarr; <strong>Business</strong>, give it an app name.</li>
                  <li>In <em>App Settings &rarr; Basic</em>, copy your <strong>App ID</strong> and <strong>App Secret</strong>.</li>
                  <li>Add <em>Facebook Login for Business</em> product and set redirect URI to <code>http://localhost:8000/api/social/platform-connections/meta/callback/</code>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
