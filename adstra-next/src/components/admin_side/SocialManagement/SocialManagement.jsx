"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import API_BASE_URL from "@/utils/apiBase";
import "./SocialManagement.css";

import {
  Share2,
  ArrowLeft,
  Sparkles,
  Plus,
  LayoutDashboard,
  Layers,
  BarChart2,
  Building2,
  Users,
  Network,
  RefreshCw,
  Settings,
  FolderArchive,
} from "lucide-react";

import FullOverviewDashboardTab from "./components/FullOverviewDashboardTab";
import DedicatedSocialSection from "./components/DedicatedSocialSection";
import MediaLibraryTab from "./components/MediaLibraryTab";
import CampaignsTab from "./components/CampaignsTab";
import AnalyticsReportsTab from "./components/AnalyticsReportsTab";
import TeamDesignationTreeTab from "./components/TeamDesignationTreeTab";
import SocialSettingsTab from "./components/SocialSettingsTab";
import CreatePostModal from "./components/CreatePostModal";
import AIAssistantModal from "./components/AIAssistantModal";
import ClientCompanySearchSelect from "./components/ClientCompanySearchSelect";

function SocialManagementInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const [activeMainModule, setActiveMainModule] = useState(initialTab);
  const [selectedClientId, setSelectedClientId] = useState("all");

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [prefilledPostData, setPrefilledPostData] = useState(null);

  // Sync tab from URL if it changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "social", "assets", "campaigns", "reports", "team_tree", "settings"].includes(tabParam)) {
      setActiveMainModule(tabParam);
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        dashRes,
        clientsRes,
        accountsRes,
        postsRes,
        mediaRes,
        campaignsRes,
        inboxRes,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/social/dashboard/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/clients/`),
        axios.get(`${API_BASE_URL}/social/accounts/`),
        axios.get(`${API_BASE_URL}/social/posts/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/media/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/campaigns/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/inbox/?client_id=${selectedClientId}`),
      ]);

      setDashboardData(dashRes.data);
      setClients(clientsRes.data);
      setAccounts(accountsRes.data);
      setPosts(postsRes.data);
      setMediaAssets(mediaRes.data);
      setCampaigns(campaignsRes.data);
      setInboxMessages(inboxRes.data);
    } catch (err) {
      console.error("Error loading social media suite data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Active client companies only (exclude deactivated ones)
  const activeClients = useMemo(() => {
    return clients.filter((c) => c.is_active !== false);
  }, [clients]);

  // If currently selected client gets deactivated, fall back to "all"
  useEffect(() => {
    if (selectedClientId !== "all" && activeClients.length > 0) {
      const isSelectedActive = activeClients.some((c) => String(c.id) === String(selectedClientId));
      if (!isSelectedActive) {
        setSelectedClientId("all");
      }
    }
  }, [activeClients, selectedClientId]);

  const handleOpenCreateWithAsset = (mediaUrl) => {
    setPrefilledPostData({
      media_urls: [mediaUrl],
    });
    setCreateModalOpen(true);
  };

  const handleApplyAiContent = ({ caption, hashtags }) => {
    setPrefilledPostData({
      primary_caption: caption,
      hashtags,
    });
    setCreateModalOpen(true);
  };

  return (
    <div className="social-mgmt-container">

      {/* Top Header Bar */}
      <header className="social-header-bar">
        <div className="social-header-left">
          <button
            onClick={() => router.push("/admindashboard/")}
            className="social-back-btn"
          >
            <ArrowLeft size={16} /> Back to CRM
          </button>

          <div className="social-brand-info">
            <h2>
              <Share2 size={24} color="#4f46e5" /> Adstra Digital Marketing Hub
            </h2>
            <p>
              Dedicated modules for microsoft & Adstra Digital marketing operations
            </p>
          </div>
        </div>

        <div className="social-header-right">
          {/* Searchable Client Company Switcher - Active Clients */}
          <ClientCompanySearchSelect
            clients={activeClients}
            value={selectedClientId}
            onChange={(newId) => setSelectedClientId(newId)}
            allowAll={true}
            allLabel="All Client Companies"
            variant="header"
          />

          {/* AI Content Studio button */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="social-ai-btn"
          >
            <Sparkles size={16} /> AI Studio (ML/EN)
          </button>

          {/* Quick Create Post */}
          <button
            onClick={() => {
              setPrefilledPostData(null);
              setCreateModalOpen(true);
            }}
            className="social-create-btn"
          >
            <Plus size={18} /> + Create Post
          </button>
        </div>
      </header>

      {/* 5 Main Separate Modules Navigation */}
      <nav
        style={{
          display: "flex",
          background: "#ffffff",
          padding: 8,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          marginBottom: 24,
          gap: 8,
          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)",
          overflowX: "auto",
        }}
      >
        {/* 1. Full Overview Dashboard */}
        <button
          className={`social-nav-tab-item ${activeMainModule === "overview" ? "active" : ""}`}
          onClick={() => setActiveMainModule("overview")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeMainModule === "overview" ? "#0f172a" : "transparent",
            color: activeMainModule === "overview" ? "#ffffff" : "#475569",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          <LayoutDashboard size={18} /> Full Overview Dashboard
        </button>

        {/* 2. Social Media Management */}
        <button
          className={`social-nav-tab-item ${activeMainModule === "social" ? "active" : ""}`}
          onClick={() => setActiveMainModule("social")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeMainModule === "social" ? "#0f172a" : "transparent",
            color: activeMainModule === "social" ? "#ffffff" : "#475569",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          <Share2 size={18} /> Social Media Management
        </button>

        {/* 3. Client Assets */}
        <button
          className={`social-nav-tab-item ${activeMainModule === "assets" ? "active" : ""}`}
          onClick={() => setActiveMainModule("assets")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeMainModule === "assets" ? "#0f172a" : "transparent",
            color: activeMainModule === "assets" ? "#ffffff" : "#475569",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          <FolderArchive size={18} /> Client Assets
        </button>

        {/* 4. Campaigns */}
        <button
          className={`social-nav-tab-item ${activeMainModule === "campaigns" ? "active" : ""}`}
          onClick={() => setActiveMainModule("campaigns")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeMainModule === "campaigns" ? "#0f172a" : "transparent",
            color: activeMainModule === "campaigns" ? "#ffffff" : "#475569",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          <Layers size={18} /> Campaigns
        </button>

        {/* 4. Reports */}
        <button
          className={`social-nav-tab-item ${activeMainModule === "reports" ? "active" : ""}`}
          onClick={() => setActiveMainModule("reports")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeMainModule === "reports" ? "#0f172a" : "transparent",
            color: activeMainModule === "reports" ? "#ffffff" : "#475569",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          <BarChart2 size={18} /> Reports & Analytics
        </button>

        {/* 5. Team Designation Chart Tree */}
        <button
          className={`social-nav-tab-item ${activeMainModule === "team_tree" ? "active" : ""}`}
          onClick={() => setActiveMainModule("team_tree")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeMainModule === "team_tree" ? "#0f172a" : "transparent",
            color: activeMainModule === "team_tree" ? "#ffffff" : "#475569",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          <Network size={18} /> Team Designation Chart Tree
        </button>

        {/* 6. Settings */}
        <button
          className={`social-nav-tab-item ${activeMainModule === "settings" ? "active" : ""}`}
          onClick={() => setActiveMainModule("settings")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 800,
            cursor: "pointer",
            border: "none",
            background: activeMainModule === "settings" ? "#0f172a" : "transparent",
            color: activeMainModule === "settings" ? "#ffffff" : "#475569",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
        >
          <Settings size={18} /> Settings
        </button>
      </nav>

      {/* Main Module Content Panels */}
      <main>
        {activeMainModule === "overview" && (
          <FullOverviewDashboardTab
            dashboardData={dashboardData}
            clients={activeClients}
            onNavigateTab={setActiveMainModule}
          />
        )}

        {activeMainModule === "social" && (
          <DedicatedSocialSection
            posts={posts}
            clients={activeClients}
            accounts={accounts}
            mediaAssets={mediaAssets}
            inboxMessages={inboxMessages}
            selectedClientId={selectedClientId}
            onRefresh={fetchData}
            onOpenCreatePost={(data = null) => {
              setPrefilledPostData(data || null);
              setCreateModalOpen(true);
            }}
            onOpenCreateWithAsset={handleOpenCreateWithAsset}
            onOpenAiStudio={() => setAiModalOpen(true)}
          />
        )}

        {activeMainModule === "assets" && (
          <MediaLibraryTab
            mediaAssets={mediaAssets}
            clients={activeClients}
            selectedClientId={selectedClientId}
            onRefresh={fetchData}
            onOpenCreateWithAsset={handleOpenCreateWithAsset}
          />
        )}

        {activeMainModule === "campaigns" && (
          <CampaignsTab
            campaigns={campaigns}
            clients={activeClients}
            onRefresh={fetchData}
          />
        )}

        {activeMainModule === "reports" && (
          <AnalyticsReportsTab
            selectedClientId={selectedClientId}
            clients={activeClients}
            posts={posts}
          />
        )}

        {activeMainModule === "team_tree" && (
          <TeamDesignationTreeTab />
        )}

        {activeMainModule === "settings" && (
          <SocialSettingsTab
            clients={clients}
            accounts={accounts}
            selectedClientId={selectedClientId}
            onRefresh={fetchData}
          />
        )}
      </main>

      {/* Post Creator Modal */}
      {createModalOpen && (
        <CreatePostModal
          isOpen={createModalOpen}
          onClose={() => {
            setCreateModalOpen(false);
            setPrefilledPostData(null);
          }}
          clients={activeClients}
          accounts={accounts}
          selectedClientId={selectedClientId}
          initialData={prefilledPostData}
          onSuccess={fetchData}
          onOpenAiStudio={() => setAiModalOpen(true)}
        />
      )}

      {/* AI Studio Modal */}
      {aiModalOpen && (
        <AIAssistantModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          onApplyContent={handleApplyAiContent}
        />
      )}

    </div>
  );
}

export default function SocialManagement() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading Marketing & CRM Suite...</div>}>
      <SocialManagementInner />
    </Suspense>
  );
}
