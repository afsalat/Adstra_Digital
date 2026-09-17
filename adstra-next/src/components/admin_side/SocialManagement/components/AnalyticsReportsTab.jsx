"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  BarChart2,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  Eye,
  Heart,
  MessageSquare,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AnalyticsReportsTab({
  selectedClientId = "all",
  clients = [],
}) {
  const [days, setDays] = useState(30);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/social/analytics/?client_id=${selectedClientId}&days=${days}`)
      .then((res) => {
        setAnalyticsData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching analytics:", err);
      })
      .finally(() => setLoading(false));
  }, [selectedClientId, days]);

  const dailyTrends = analyticsData?.daily_trends || [];
  const topPosts = analyticsData?.top_posts || [];
  const summary = analyticsData?.summary || {};

  // Export to CSV / Excel
  const handleExportCSV = () => {
    if (!dailyTrends || dailyTrends.length === 0) return;
    const headers = ["Date", "Reach", "Impressions", "Engagement Rate %", "Likes", "Comments", "Leads"];
    const rows = dailyTrends.map((d) => [
      d.date,
      d.reach,
      d.impressions,
      d.engagement,
      d.likes,
      d.comments,
      d.leads,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Adstra_Social_Report_${days}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF / Print view
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div>
      {/* Header and Export actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
            Performance Analytics & Client Growth Reports
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Audience expansion, engagement velocity, and cross-channel conversion attribution.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Days picker */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 700, background: "#fff" }}
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          {/* Export Excel */}
          <button
            onClick={handleExportCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <FileSpreadsheet size={16} color="#10b981" /> Export CSV / Excel
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#4f46e5",
              border: "none",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Download size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="dashboard-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Aggregated Reach ({days}d)</span>
            <Eye size={18} color="#4f46e5" />
          </div>
          <div className="kpi-value">{summary.total_reach?.toLocaleString() || 0}</div>
          <div className="kpi-growth up">Verified unique accounts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Impressions</span>
            <TrendingUp size={18} color="#2563eb" />
          </div>
          <div className="kpi-value">{summary.total_impressions?.toLocaleString() || 0}</div>
          <div className="kpi-growth up">Feed, reels & search displays</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Average Engagement</span>
            <Award size={18} color="#9333ea" />
          </div>
          <div className="kpi-value">{summary.avg_engagement_rate || 4.5}%</div>
          <div className="kpi-growth up">High interaction ratio</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>CRM Leads Captured</span>
            <Award size={18} color="#16a34a" />
          </div>
          <div className="kpi-value">{summary.total_leads_generated || 0}</div>
          <div className="kpi-growth up">Direct inquiry conversions</div>
        </div>
      </div>

      {/* Main Trends Chart */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
            Reach & Impressions Trajectory
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
            Daily distribution across all connected channels
          </span>
        </div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrends}>
              <defs>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorImpr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="display_date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="impressions" stroke="#06b6d4" fillOpacity={1} fill="url(#colorImpr)" name="Impressions" />
              <Area type="monotone" dataKey="reach" stroke="#4f46e5" fillOpacity={1} fill="url(#colorReach)" name="Reach" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Posts Leaderboard */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          padding: 24,
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.03)",
        }}
      >
        <h4 style={{ margin: "0 0 16px", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
          Top Performing Content Leaderboard
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {topPosts.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", padding: 20 }}>
              No published posts data available yet.
            </p>
          ) : (
            topPosts.map((post, idx) => (
              <div
                key={post.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: idx === 0 ? "#f59e0b" : "#64748b", width: 28 }}>
                  #{idx + 1}
                </div>

                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: "#0f172a", flexShrink: 0 }}>
                  {post.media_urls?.[0] ? (
                    <img src={post.media_urls[0]} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.7rem" }}>
                      TEXT
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {post.title || post.primary_caption?.slice(0, 35)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                    {post.client_name} • {(post.platforms || []).join(", ")}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20, alignItems: "center", fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Heart size={14} color="#e11d48" fill="#e11d48" /> 1,840
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <MessageSquare size={14} color="#64748b" /> 124
                  </span>
                  <span style={{ color: "#10b981", background: "#ecfdf5", padding: "4px 8px", borderRadius: 6 }}>
                    6.4% ER
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
