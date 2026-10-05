"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
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

const SOCIAL_STAGE_IDS = [
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
  onRefresh,
  onOpenCreatePost,
  onOpenCreateWithAsset,
  onOpenAiStudio,
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

  // Main pipeline, left to right
  const pipelineSteps = [
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
      {/* Workflow pipeline stepper + side sections (Rejected, Analytics) */}
      <div className="sm-pipeline no-print">
        <ol className="sm-pipeline-steps">
          {pipelineSteps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = socialSubTab === step.id;
            const count = counts[step.id] || 0;
            return (
              <li key={step.id} className="sm-step-wrap">
                <button
                  type="button"
                  className={`sm-step ${isActive ? "active" : ""} ${count > 0 ? "has-items" : ""}`}
                  style={{ "--step-color": step.color }}
                  onClick={() => setSocialSubTab(step.id)}
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
            className={`sm-side-btn sm-side-rejected ${socialSubTab === "rejected" ? "active" : ""}`}
            onClick={() => setSocialSubTab("rejected")}
            title="Content rejected outright by the client or team"
          >
            <Ban size={15} />
            <span>Rejected</span>
            {counts.rejected > 0 && <span className="sm-side-badge">{counts.rejected}</span>}
          </button>
          <button
            type="button"
            className={`sm-side-btn sm-side-reports ${socialSubTab === "reporting" ? "active" : ""}`}
            onClick={() => setSocialSubTab("reporting")}
            title="Analytics & Reports"
          >
            <BarChart2 size={15} />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Sub-tab view: Active Workflow Section */}
      <div>
        {socialSubTab === "reporting" ? (
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
            onNavigateStage={setSocialSubTab}
          />
        )}
      </div>

    </div>
  );
}
