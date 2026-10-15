"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  ClipboardList,
  FileText,
  CheckCircle2,
  Palette,
  Users,
  Eye,
  Calendar as CalendarIcon,
  Send,
  BarChart2,
  Ban,
} from "lucide-react";

import WorkflowStageSection from "./WorkflowStageSection";
import AnalyticsReportsTab from "./AnalyticsReportsTab";
import PlanningTab from "./planning/PlanningTab";
import { SOCIAL_KPIS, ownStageOf } from "./workflowUtils";

const SOCIAL_STAGE_IDS = [
  "planning",
  "scripts",
  "script_approval",
  "designing",
  "team_review",
  "client_review",
  "post_schedule",
  "published",
  "rejected",
  "reporting",
];

export default function DedicatedSocialSection({
  posts = [],
  clients = [],
  accounts = [],
  mediaAssets = [],
  inboxMessages = [],
  selectedClientId = "all",
  onSelectClient,
  onRefresh,
  onOpenCreatePost,
  onOpenCreateWithAsset,
  onOpenAiStudio,
  focusRequest = null,
}) {
  const searchParams = useSearchParams();
  const [socialSubTab, setSocialSubTab] = useState(
    () => (SOCIAL_STAGE_IDS.includes(searchParams.get("stage")) ? searchParams.get("stage") : "scripts")
  );

  // Persist active stage in the URL so a reload keeps the user on the same stage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("stage") === socialSubTab) return;
    params.set("stage", socialSubTab);
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}?${params.toString()}${window.location.hash}`
    );
  }, [socialSubTab]);

  // Stage counts for badges (1:1 with pipeline stages)
  const counts = {
    scripts: posts.filter((p) =>
      ["script", "draft"].includes(p.status) ||
      (p.status === "rejected" && (!p.client_feedback || p.client_feedback.toLowerCase().includes("script")))
    ).length,
    script_approval: posts.filter((p) => p.status === "script_approval").length,
    designing: posts.filter((p) => p.status === "designing").length,
    team_review: posts.filter((p) => ["team_review", "internal_review"].includes(p.status)).length,
    client_review: posts.filter((p) => p.status === "client_review").length,
    post_schedule: posts.filter((p) => ["approved", "scheduled"].includes(p.status)).length,
    published: posts.filter((p) => p.status === "published").length,
    rejected: posts.filter((p) => p.status === "content_rejected").length,
  };

  // Plan badge: planned slots whose script should start within a week
  const [planAttention, setPlanAttention] = useState(0);
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/social/plans/attention/`, { params: { client_id: selectedClientId } })
      .then((res) => setPlanAttention(res.data?.count || 0))
      .catch(() => {});
  }, [selectedClientId, posts, socialSubTab]);
  counts.planning = planAttention;

  // Jump from a plan slot to its post in the workflow (merged with mention jumps from the parent)
  const [localFocus, setLocalFocus] = useState(null);
  const effectiveFocus = useMemo(() => {
    if (!localFocus) return focusRequest;
    if (!focusRequest) return localFocus;
    return localFocus.nonce > focusRequest.nonce ? localFocus : focusRequest;
  }, [focusRequest, localFocus]);

  // Cross-stage quick filters (Overdue, Due this week, ...)
  const [kpiFilter, setKpiFilter] = useState(null);
  const kpiCounts = useMemo(() => {
    const now = new Date();
    const scoped = posts.filter((p) => selectedClientId === "all" || String(p.client_profile) === String(selectedClientId));
    return Object.fromEntries(SOCIAL_KPIS.map((k) => [k.id, scoped.filter((p) => k.match(p, now)).length]));
  }, [posts, selectedClientId]);

  const openStage = (id) => {
    setKpiFilter(null);
    setSocialSubTab(id);
  };

  // Jump to the stage that owns a requested post (the stage section then opens its drawer)
  const handledFocusRef = useRef(null);
  useEffect(() => {
    if (!effectiveFocus || handledFocusRef.current === effectiveFocus.nonce) return;
    const target = posts.find((p) => p.id === effectiveFocus.postId);
    if (!target) return; // posts may still be reloading after a client switch
    handledFocusRef.current = effectiveFocus.nonce;
    openStage(ownStageOf(target));
  }, [effectiveFocus, posts]);

  const toggleKpi = (id) => {
    if (kpiFilter === id) {
      setKpiFilter(null);
      return;
    }
    if (socialSubTab === "reporting" || socialSubTab === "planning") setSocialSubTab("scripts");
    setKpiFilter(id);
  };

  // Main pipeline, left to right
  const pipelineSteps = [
    { id: "planning", label: "Plan", fullLabel: "Monthly Content Plan (badge: scripts to start this week)", icon: ClipboardList, color: "#0f766e" },
    { id: "scripts", label: "Script", fullLabel: "Scripts & Content Ideation", icon: FileText, color: "#4f46e5" },
    { id: "script_approval", label: "Approval", fullLabel: "Script Approval", icon: CheckCircle2, color: "#8b5cf6" },
    { id: "designing", label: "Design", fullLabel: "Scheduled / Designing", icon: Palette, color: "#ec4899" },
    { id: "team_review", label: "Team Review", fullLabel: "Team Review / Ready", icon: Users, color: "#f59e0b" },
    { id: "client_review", label: "Client Review", fullLabel: "Client Review", icon: Eye, color: "#ea580c" },
    { id: "post_schedule", label: "Scheduled", fullLabel: "Approved / Post Schedule", icon: CalendarIcon, color: "#0ea5e9" },
    { id: "published", label: "Published", fullLabel: "Published / Posted", icon: Send, color: "#10b981" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPI strip: clickable quick filters across every stage */}
      <div className="sm-kpi-strip no-print">
        {SOCIAL_KPIS.map((kpi) => {
          const KpiIcon = kpi.icon;
          const isActive = kpiFilter === kpi.id;
          const count = kpiCounts[kpi.id] || 0;
          return (
            <button
              key={kpi.id}
              type="button"
              className={`sm-kpi ${isActive ? "active" : ""} ${count === 0 ? "is-zero" : ""}`}
              style={{ "--kpi-color": kpi.color, "--kpi-bg": kpi.bg }}
              onClick={() => toggleKpi(kpi.id)}
              aria-pressed={isActive}
              title={isActive ? "Click again to clear this filter" : kpi.desc}
            >
              <span className="sm-kpi-icon">
                <KpiIcon size={18} />
              </span>
              <span className="sm-kpi-text">
                <span className="sm-kpi-value">{count}</span>
                <span className="sm-kpi-label">{kpi.label}</span>
              </span>
              <span className="sm-kpi-cta">{isActive ? "Clear ✕" : "View →"}</span>
            </button>
          );
        })}
      </div>

      {/* Workflow pipeline stepper + side sections (Rejected, Analytics) */}
      <div className="sm-pipeline no-print">
        <ol className="sm-pipeline-steps">
          {pipelineSteps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = !kpiFilter && socialSubTab === step.id;
            const count = counts[step.id] || 0;
            return (
              <li key={step.id} className="sm-step-wrap">
                <button
                  type="button"
                  className={`sm-step ${isActive ? "active" : ""} ${count > 0 ? "has-items" : ""}`}
                  style={{ "--step-color": step.color }}
                  onClick={() => openStage(step.id)}
                  title={`${idx + 1}. ${step.fullLabel} · ${count} ${count === 1 ? "item" : "items"}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <StepIcon size={15} className="sm-step-icon" />
                  <span className="sm-step-label">{step.label}</span>
                  <span className="sm-step-count">{count}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="sm-pipeline-side">
          <button
            type="button"
            className={`sm-side-btn sm-side-rejected ${!kpiFilter && socialSubTab === "rejected" ? "active" : ""}`}
            onClick={() => openStage("rejected")}
            title="Content rejected outright by the client or team"
          >
            <Ban size={15} />
            <span>Rejected</span>
            {counts.rejected > 0 && <span className="sm-side-badge">{counts.rejected}</span>}
          </button>
          <button
            type="button"
            className={`sm-side-btn sm-side-reports ${!kpiFilter && socialSubTab === "reporting" ? "active" : ""}`}
            onClick={() => openStage("reporting")}
            title="Analytics & Reports"
          >
            <BarChart2 size={15} />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Sub-tab view: Active Workflow Section */}
      <div>
        {socialSubTab === "planning" && !kpiFilter ? (
          <PlanningTab
            clients={clients}
            posts={posts}
            selectedClientId={selectedClientId}
            onSelectClient={onSelectClient}
            onRefresh={onRefresh}
            onOpenPost={(info) => setLocalFocus({ postId: info.id, tab: "overview", nonce: Date.now() })}
          />
        ) : socialSubTab === "reporting" && !kpiFilter ? (
          <AnalyticsReportsTab selectedClientId={selectedClientId} clients={clients} posts={posts} />
        ) : (
          <WorkflowStageSection
            stageId={socialSubTab}
            posts={posts}
            clients={clients}
            mediaAssets={mediaAssets}
            selectedClientId={selectedClientId}
            onRefresh={onRefresh}
            onOpenCreatePost={onOpenCreatePost}
            onNavigateStage={openStage}
            kpiFilter={kpiFilter}
            onClearKpi={() => setKpiFilter(null)}
            focusRequest={effectiveFocus}
          />
        )}
      </div>

    </div>
  );
}
