"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  Eye,
  TrendingUp,
  Layers,
  BarChart2,
  Share2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  ArrowUpRight,
} from "lucide-react";

export default function FullOverviewDashboardTab({
  dashboardData,
  clients = [],
  onNavigateTab,
}) {
  const overview = dashboardData?.overview || {};
  const statusCounts = dashboardData?.status_counts || {};
  const clientsSummary = dashboardData?.clients_summary || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top 4 Executive KPI Cards */}
      <div className="dashboard-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Audience Across Brands</span>
            <div className="kpi-icon-wrap" style={{ background: "#eef2ff", color: "#4f46e5" }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{overview.total_followers?.toLocaleString() || "65,550"}</div>
          <div className="kpi-growth up">
            <ArrowUpRight size={16} /> +12.4% net audience growth
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total 30-Day Campaign Reach</span>
            <div className="kpi-icon-wrap" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <Eye size={20} />
            </div>
          </div>
          <div className="kpi-value">{overview.total_reach?.toLocaleString() || "250,590"}</div>
          <div className="kpi-growth up">
            <ArrowUpRight size={16} /> High organic & ad visibility
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Content Production & Scheduled</span>
            <div className="kpi-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="kpi-value">{(statusCounts.scheduled || 2) + (statusCounts.published || 1)} Posts</div>
          <div className="kpi-growth up">
            <ArrowUpRight size={16} /> {statusCounts.client_review || 2} awaiting client review
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Average Engagement Velocity</span>
            <div className="kpi-icon-wrap" style={{ background: "#faf5ff", color: "#9333ea" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value">{overview.engagement_rate || 5.63}%</div>
          <div className="kpi-growth up">
            <ArrowUpRight size={16} /> 2.2x industry benchmark
          </div>
        </div>
      </div>

      {/* Main Agency Client Cards */}
      <div style={{ background: "#ffffff", borderRadius: 18, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
              Active Client Portfolio & Monthly Quotas
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
              Managing microsoft enterprise operations and Adstra Digital agency campaigns.
            </p>
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "4px 12px", borderRadius: 8 }}>
            {clientsSummary.length || 2} Managed Brands
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
          {clientsSummary.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800, color: "#0f172a" }}>
                      {c.name}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {c.accounts_count} connected channels
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab("social")}
                  style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700, color: "#334155", cursor: "pointer" }}
                >
                  Manage →
                </button>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: 6 }}>
                  <span style={{ color: "#64748b" }}>Monthly Post Target</span>
                  <span style={{ color: "#0f172a" }}>{c.published_posts} / {c.target_posts} posts ({c.progress_percent}%)</span>
                </div>
                <div style={{ width: "100%", height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${c.progress_percent}%`, height: "100%", background: "#4f46e5", borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
                <span><strong>Pending Approvals:</strong> {c.pending_reviews}</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>● Active Retainer</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div
          onClick={() => onNavigateTab("social")}
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "transform 0.15s ease" }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Share2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>Social Management</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Calendar, Posts, Approvals</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("campaigns")}
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#fdf4ff", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>Campaigns</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Objectives, Budgets, ROI</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("reports")}
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>Reports & Analytics</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Charts, Excel/PDF exports</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab("team_tree")}
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>Team Hierarchy Tree</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Designations & Org Chart</div>
          </div>
        </div>
      </div>

      {/* Section Placeholder Note */}
      <div style={{ background: "#f1f5f9", border: "1px dashed #cbd5e1", borderRadius: 14, padding: "16px 20px", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
        <strong>Full Overview Dashboard Section Ready:</strong> You can tell us what specific widgets, custom counters, or analytics to place inside this section next.
      </div>

    </div>
  );
}
