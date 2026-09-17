"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Palette,
  Users,
  Eye,
  Calendar as CalendarIcon,
  Send,
} from "lucide-react";

import WorkflowStageSection from "./WorkflowStageSection";

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
  const [socialSubTab, setSocialSubTab] = useState("scripts");

  // Stage counts for badges
  const counts = {
    scripts: posts.filter((p) =>
      ["script", "draft", "script_approval"].includes(p.status) ||
      (p.status === "rejected" && p.client_feedback?.toLowerCase().includes("script"))
    ).length,
    script_approval: posts.filter((p) => p.status === "script_approval").length,
    designing: posts.filter((p) => p.status === "designing").length,
    team_review: posts.filter((p) => ["team_review", "internal_review"].includes(p.status)).length,
    client_review: posts.filter((p) => p.status === "client_review").length,
    post_schedule: posts.filter((p) => ["approved", "scheduled"].includes(p.status)).length,
    published: posts.filter((p) => p.status === "published").length,
  };

  const navItems = [
    {
      id: "scripts",
      label: "Scripts",
      icon: FileText,
      count: counts.scripts,
      color: "#4f46e5",
    },
    {
      id: "script_approval",
      label: "Approval",
      icon: CheckCircle2,
      count: counts.script_approval,
      color: "#8b5cf6",
    },
    {
      id: "designing",
      label: "Scheduled / Designing",
      icon: Palette,
      count: counts.designing,
      color: "#ec4899",
    },
    {
      id: "team_review",
      label: "Team Review / Ready",
      icon: Users,
      count: counts.team_review,
      color: "#f59e0b",
    },
    {
      id: "client_review",
      label: "Client Review",
      icon: Eye,
      count: counts.client_review,
      color: "#ea580c",
    },
    {
      id: "post_schedule",
      label: "Approved / Post Schedule",
      icon: CalendarIcon,
      count: counts.post_schedule,
      color: "#0ea5e9",
    },
    {
      id: "published",
      label: "Published / Posted",
      icon: Send,
      count: counts.published,
      color: "#10b981",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Sub-navigation pills: The 7 Workflow Sections */}
      <div
        style={{
          display: "flex",
          gap: 8,
          background: "#ffffff",
          padding: 6,
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          overflowX: "auto",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
        }}
      >
        {navItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = socialSubTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setSocialSubTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 10,
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                background: isActive ? item.color : "transparent",
                color: isActive ? "#ffffff" : "#475569",
                transition: "all 0.15s ease",
              }}
            >
              <ItemIcon size={15} />
              {item.label}
              {item.count > 0 && (
                <span
                  style={{
                    background: isActive ? "rgba(255, 255, 255, 0.25)" : "#f1f5f9",
                    color: isActive ? "#ffffff" : item.color,
                    fontSize: "0.7rem",
                    padding: "2px 7px",
                    borderRadius: 10,
                    fontWeight: 800,
                  }}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-tab view: Active Workflow Section */}
      <div>
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
      </div>

    </div>
  );
}
