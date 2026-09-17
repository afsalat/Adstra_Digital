"use client";

import React, { useState, useEffect } from "react";
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
  const [clientSaving, setClientSaving] = useState(false);
  const [creatingClientModal, setCreatingClientModal] = useState(false);
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
  });

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
        package_tier: editingClient.package_tier,
        approval_policy: editingClient.approval_policy,
        primary_color: editingClient.primary_color,
        brand_tagline: editingClient.brand_tagline,
        client_email: editingClient.client_email,
        client_contact: editingClient.client_contact,
        notes: editingClient.notes,
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
                Configure monthly post quotas, package tiers, approval policies, and brand design guidelines.
              </p>
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
                padding: "9px 16px",
                borderRadius: 9,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(79, 70, 229, 0.2)",
              }}
            >
              <Plus size={16} /> + Add Client Brand
            </button>
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
                    Settings
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.12s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                          }}
                        >
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9rem" }}>
                            {c.name}
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
                      <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>
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
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
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
                      <div style={{ fontSize: "0.78rem", color: "#334155" }}>
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
                    </td>
                  </tr>
                ))}
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
            style={{ maxWidth: 580 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="social-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Building2 size={20} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                  Edit Brand Settings: {editingClient.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                    placeholder="e.g. Growth Package"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Client Email (for approvals)
                  </label>
                  <input
                    type="email"
                    value={editingClient.client_email || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, client_email: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    WhatsApp / Phone Contact
                  </label>
                  <input
                    type="text"
                    value={editingClient.client_contact || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, client_contact: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Primary Brand Hex Color
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={editingClient.brand_tagline || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, brand_tagline: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clientSaving}
                  style={{ padding: "8px 18px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
                >
                  {clientSaving ? "Saving..." : "Save Brand Settings"}
                </button>
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
