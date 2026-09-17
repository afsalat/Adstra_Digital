"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Flame,
  Check,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ClipboardList,
  MapPin,
  Briefcase,
  FileText,
} from "lucide-react";
import { XIcon, GoogleIcon, TikTokIcon, renderPlatformIcon } from "./PlatformIcons";

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

  // Client Profile Edit State
  const [editingClient, setEditingClient] = useState(null);
  const [brandSettingsTab, setBrandSettingsTab] = useState("general"); // 'general' | 'company' | 'strategy' | 'social'
  const [clientSaving, setClientSaving] = useState(false);
  const [creatingClientModal, setCreatingClientModal] = useState(false);
  const [clientStatusFilter, setClientStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [clientSearchQuery, setClientSearchQuery] = useState("");
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
      alert("Error reconnecting account. Please verify credentials.");
    } finally {
      setActionLoading(null);
    }
  };

  // Disconnect Social Channel
  const handleDisconnectAccount = async (accId) => {
    if (!confirm("Are you sure you want to disconnect this social channel?")) return;
    setActionLoading(accId);
    try {
      await axios.post(`${API_BASE_URL}/social/accounts/${accId}/disconnect/`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error disconnecting account.");
    } finally {
      setActionLoading(null);
    }
  };

  // Add New Social Channel
  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) {
      alert("Please enter an account or page name.");
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
      alert("Error adding social account.");
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
      alert("Error updating client visibility status.");
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
      alert("Error updating client configuration.");
    } finally {
      setClientSaving(false);
    }
  };

  // Create New Client Brand
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientData.name.trim()) {
      alert("Please enter a client brand name.");
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
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error creating client brand profile.");
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
              Marketing Suite Settings & Integrations
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

          {/* Accounts Listing Table */}
          {filteredAccounts.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
              <Share2 size={36} color="#cbd5e1" style={{ marginBottom: 12 }} />
              <h4 style={{ margin: 0, color: "#0f172a" }}>No Social Channels Connected Yet</h4>
              <p style={{ margin: "6px 0 16px", fontSize: "0.85rem" }}>
                Connect your client's Instagram, Facebook, LinkedIn, YouTube, or X profiles to enable one-click publishing.
              </p>
              <button
                onClick={() => setConnectingModal(true)}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} style={{ marginRight: 4 }} /> Connect First Channel
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
                          {(acc.followers_count || 0).toLocaleString()}
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
                                Renews: {new Date(acc.token_expiry).toLocaleDateString()}
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
      {/* 2. CLIENT BRAND PROFILES & RETAINERS (Listing Table) */}
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
                onClick={() => setCreatingClientModal(true)}
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
        <div className="social-modal-overlay" onClick={() => setCreatingClientModal(false)}>
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
                onClick={() => setCreatingClientModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
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
                  onClick={() => setCreatingClientModal(false)}
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
    </div>
  );
}
