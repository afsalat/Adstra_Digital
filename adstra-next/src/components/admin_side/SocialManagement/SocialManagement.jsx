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
  const [platformConnections, setPlatformConnections] = useState([]);
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
        connectionsRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/social/dashboard/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/clients/`),
        axios.get(`${API_BASE_URL}/social/accounts/`),
        axios.get(`${API_BASE_URL}/social/posts/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/media/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/campaigns/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/inbox/?client_id=${selectedClientId}`),
        axios.get(`${API_BASE_URL}/social/platform-connections/?platform=meta`),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value?.data) setDashboardData(dashRes.value.data);
      if (clientsRes.status === "fulfilled" && clientsRes.value?.data) setClients(clientsRes.value.data);
      if (accountsRes.status === "fulfilled" && accountsRes.value?.data) setAccounts(accountsRes.value.data);
      if (postsRes.status === "fulfilled" && postsRes.value?.data) setPosts(postsRes.value.data);
      if (mediaRes.status === "fulfilled" && mediaRes.value?.data) setMediaAssets(mediaRes.value.data);
      if (campaignsRes.status === "fulfilled" && campaignsRes.value?.data) setCampaigns(campaignsRes.value.data);
      if (inboxRes.status === "fulfilled" && inboxRes.value?.data) setInboxMessages(inboxRes.value.data);
      if (connectionsRes.status === "fulfilled" && connectionsRes.value?.data) {
        setPlatformConnections(Array.isArray(connectionsRes.value.data) ? connectionsRes.value.data : []);
      }
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
      <header className="social-header-bar no-print">
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

      {/* Main Separate Modules Navigation */}
      <nav
        className="social-nav-tabs no-print"
        style={{
          display: "flex",
          background: "#ffffff",
          padding: 6,
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          marginBottom: 24,
          gap: 6,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
          overflowX: "auto",
        }}
      >
        {[
          { id: "overview", label: "Full Overview Dashboard", icon: LayoutDashboard },
          { id: "social", label: "Social Media Management", icon: Share2 },
          { id: "assets", label: "Client Assets", icon: FolderArchive },
          { id: "campaigns", label: "Campaigns", icon: Layers },
          { id: "reports", label: "Reports & Analytics", icon: BarChart2 },
          { id: "team_tree", label: "Team Designation Chart Tree", icon: Network },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainModule === tab.id;
          return (
            <button
              key={tab.id}
              className={`social-nav-tab-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveMainModule(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                fontSize: "0.86rem",
                fontWeight: isActive ? 700 : 550,
                cursor: "pointer",
                border: "none",
                background: isActive ? "#0f172a" : "transparent",
                color: isActive ? "#ffffff" : "#64748b",
                boxShadow: isActive ? "0 2px 8px rgba(15, 23, 42, 0.12)" : "none",
                transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Module Content Panels */}
      <main>
        {activeMainModule === "overview" && (
          <FullOverviewDashboardTab
            dashboardData={dashboardData}
            clients={activeClients}
            posts={posts}
            campaigns={campaigns}
            inboxMessages={inboxMessages}
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
            platformConnections={platformConnections}
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
