"use client";

import React, { useState, useMemo } from "react";
import "./CampaignDashboardTab.css";
import {
  Coins,
  Users,
  Eye,
  MousePointer2,
  Percent,
  Target,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MetaLogoIcon,
  GoogleAdsLogoIcon,
  LinkedInLogoIcon,
} from "./PlatformIcons";

// ─── Default Benchmark Data (Exact 1:1 match to Image 1) ───────────────────────
const BENCHMARK_KPIS = [
  {
    id: "spend",
    label: "Total Spend",
    value: "$3,248.75",
    numeric: 3248.75,
    trend: "12.4%",
    isPositive: true,
    compare: "vs. previous 30 days",
    icon: Coins,
  },
  {
    id: "reach",
    label: "Reach",
    value: "254,892",
    numeric: 254892,
    trend: "18.7%",
    isPositive: true,
    compare: "vs. previous 30 days",
    icon: Users,
  },
  {
    id: "impressions",
    label: "Impressions",
    value: "702,441",
    numeric: 702441,
    trend: "16.3%",
    isPositive: true,
    compare: "vs. previous 30 days",
    icon: Eye,
  },
  {
    id: "clicks",
    label: "Clicks",
    value: "12,842",
    numeric: 12842,
    trend: "21.5%",
    isPositive: true,
    compare: "vs. previous 30 days",
    icon: MousePointer2,
  },
  {
    id: "ctr",
    label: "CTR",
    value: "1.83%",
    numeric: 1.83,
    trend: "6.2%",
    isPositive: true,
    compare: "vs. previous 30 days",
    icon: Percent,
  },
  {
    id: "conversions",
    label: "Conversions",
    value: "523",
    numeric: 523,
    trend: "19.8%",
    isPositive: true,
    compare: "vs. previous 30 days",
    icon: Target,
  },
];

// Grouped bar chart data across 5 intervals (matching Image 1 bars)
const PERFORMANCE_TREND_DATA = {
  spend: [
    { period: "May 1 – May 7", Meta: 11400, Google: 7300, LinkedIn: 4400 },
    { period: "May 8 – May 14", Meta: 12100, Google: 8100, LinkedIn: 4900 },
    { period: "May 15 – May 21", Meta: 12400, Google: 8600, LinkedIn: 5200 },
    { period: "May 22 – May 28", Meta: 12550, Google: 9000, LinkedIn: 5900 },
    { period: "May 29 – May 31", Meta: 14800, Google: 9350, LinkedIn: 6100 },
  ],
  reach: [
    { period: "May 1 – May 7", Meta: 42000, Google: 28000, LinkedIn: 12000 },
    { period: "May 8 – May 14", Meta: 48000, Google: 31000, LinkedIn: 14500 },
    { period: "May 15 – May 21", Meta: 51000, Google: 34000, LinkedIn: 16000 },
    { period: "May 22 – May 28", Meta: 54000, Google: 36500, LinkedIn: 18000 },
    { period: "May 29 – May 31", Meta: 63000, Google: 39000, LinkedIn: 20500 },
  ],
  impressions: [
    { period: "May 1 – May 7", Meta: 115000, Google: 82000, LinkedIn: 34000 },
    { period: "May 8 – May 14", Meta: 132000, Google: 91000, LinkedIn: 41000 },
    { period: "May 15 – May 21", Meta: 140000, Google: 96000, LinkedIn: 46000 },
    { period: "May 22 – May 28", Meta: 148000, Google: 104000, LinkedIn: 52000 },
    { period: "May 29 – May 31", Meta: 168000, Google: 112000, LinkedIn: 58000 },
  ],
  clicks: [
    { period: "May 1 – May 7", Meta: 2100, Google: 1450, LinkedIn: 620 },
    { period: "May 8 – May 14", Meta: 2380, Google: 1620, LinkedIn: 710 },
    { period: "May 15 – May 21", Meta: 2550, Google: 1780, LinkedIn: 790 },
    { period: "May 22 – May 28", Meta: 2710, Google: 1910, LinkedIn: 880 },
    { period: "May 29 – May 31", Meta: 3200, Google: 2040, LinkedIn: 980 },
  ],
  conversions: [
    { period: "May 1 – May 7", Meta: 84, Google: 58, LinkedIn: 24 },
    { period: "May 8 – May 14", Meta: 96, Google: 66, LinkedIn: 30 },
    { period: "May 15 – May 21", Meta: 104, Google: 72, LinkedIn: 34 },
    { period: "May 22 – May 28", Meta: 112, Google: 80, LinkedIn: 38 },
    { period: "May 29 – May 31", Meta: 138, Google: 88, LinkedIn: 44 },
  ],
};

// Platform share and amounts (matching Image 1 donut chart & side list)
const PLATFORM_BREAKDOWN_CONFIG = {
  spend: {
    totalFormatted: "$3,248.75",
    totalLabel: "Total Spend",
    items: [
      {
        platform: "meta",
        name: "Meta",
        amount: "$1,642.30",
        share: "50.5%",
        percentNum: 50.5,
        color: "#0066fe",
      },
      {
        platform: "google",
        name: "Google",
        amount: "$1,102.15",
        share: "33.9%",
        percentNum: 33.9,
        color: "#10b981",
      },
      {
        platform: "linkedin",
        name: "LinkedIn",
        amount: "$504.30",
        share: "15.5%",
        percentNum: 15.5,
        color: "#6366f1",
      },
    ],
  },
  reach: {
    totalFormatted: "254,892",
    totalLabel: "Total Reach",
    items: [
      { platform: "meta", name: "Meta", amount: "135,092", share: "53.0%", percentNum: 53.0, color: "#0066fe" },
      { platform: "google", name: "Google", amount: "81,560", share: "32.0%", percentNum: 32.0, color: "#10b981" },
      { platform: "linkedin", name: "LinkedIn", amount: "38,240", share: "15.0%", percentNum: 15.0, color: "#6366f1" },
    ],
  },
  impressions: {
    totalFormatted: "702,441",
    totalLabel: "Total Impressions",
    items: [
      { platform: "meta", name: "Meta", amount: "365,269", share: "52.0%", percentNum: 52.0, color: "#0066fe" },
      { platform: "google", name: "Google", amount: "231,805", share: "33.0%", percentNum: 33.0, color: "#10b981" },
      { platform: "linkedin", name: "LinkedIn", amount: "105,367", share: "15.0%", percentNum: 15.0, color: "#6366f1" },
    ],
  },
  clicks: {
    totalFormatted: "12,842",
    totalLabel: "Total Clicks",
    items: [
      { platform: "meta", name: "Meta", amount: "6,678", share: "52.0%", percentNum: 52.0, color: "#0066fe" },
      { platform: "google", name: "Google", amount: "4,238", share: "33.0%", percentNum: 33.0, color: "#10b981" },
      { platform: "linkedin", name: "LinkedIn", amount: "1,926", share: "15.0%", percentNum: 15.0, color: "#6366f1" },
    ],
  },
  conversions: {
    totalFormatted: "523",
    totalLabel: "Total Conversions",
    items: [
      { platform: "meta", name: "Meta", amount: "272", share: "52.0%", percentNum: 52.0, color: "#0066fe" },
      { platform: "google", name: "Google", amount: "178", share: "34.0%", percentNum: 34.0, color: "#10b981" },
      { platform: "linkedin", name: "LinkedIn", amount: "73", share: "14.0%", percentNum: 14.0, color: "#6366f1" },
    ],
  },
};

// Top Performing Campaigns (Featured #1 matches Image 1)
const TOP_CAMPAIGNS = [
  {
    id: "c1",
    title: "Summer Sale - Meta",
    platform: "Meta",
    objective: "Awareness",
    image: "/assets/summer-sale-thumb.jpg",
    spend: "$812.45",
    clicks: "4,320",
    ctr: "2.8%",
    conversions: 184,
    status: "Active",
  },
  {
    id: "c2",
    title: "Brand Search & Intent - Google",
    platform: "Google",
    objective: "Traffic",
    image: null,
    spend: "$645.20",
    clicks: "3,110",
    ctr: "3.4%",
    conversions: 142,
    status: "Active",
  },
  {
    id: "c3",
    title: "B2B Decision Makers - LinkedIn",
    platform: "LinkedIn",
    objective: "Lead Generation",
    image: null,
    spend: "$490.80",
    clicks: "1,890",
    ctr: "2.1%",
    conversions: 86,
    status: "Active",
  },
];

export default function CampaignDashboardTab({
  campaigns = [],
  clients = [],
  selectedClientId = "all",
  onNavigateToCampaigns,
  onRefresh,
}) {
  // State
  const [activeMetric, setActiveMetric] = useState("spend"); // spend | reach | impressions | clicks | conversions
  const [selectedPlatform, setSelectedPlatform] = useState("all"); // all | meta | google | linkedin
  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState(0);

  // Filtered performance trend data based on selected platform
  const chartData = useMemo(() => {
    const raw = PERFORMANCE_TREND_DATA[activeMetric] || PERFORMANCE_TREND_DATA.spend;
    return raw.map((d) => {
      if (selectedPlatform === "all") return d;
      return {
        period: d.period,
        Meta: selectedPlatform === "meta" ? d.Meta : 0,
        Google: selectedPlatform === "google" ? d.Google : 0,
        LinkedIn: selectedPlatform === "linkedin" ? d.LinkedIn : 0,
      };
    });
  }, [activeMetric, selectedPlatform]);

  // Platform breakdown info for current active metric
  const breakdownConfig = useMemo(() => {
    return PLATFORM_BREAKDOWN_CONFIG[activeMetric] || PLATFORM_BREAKDOWN_CONFIG.spend;
  }, [activeMetric]);

  // Current featured campaign
  const featuredCampaign = TOP_CAMPAIGNS[selectedCampaignIndex] || TOP_CAMPAIGNS[0];

  // Helper to format chart Y-Axis
  const formatYAxis = (val) => {
    if (val >= 1000) return `${Math.round(val / 1000)}K`;
    return val;
  };

  return (
    <div className="cd-root">
      {/* ─── Top Header: Title ───────────── */}
      <div className="cd-header">
        <div className="cd-header-left">
          <h1 className="cd-title">Campaign Performance</h1>
          <p className="cd-subtitle">
            Track your Meta, Google and LinkedIn ad performance in one place.
          </p>
        </div>
      </div>

      {/* ─── 6 KPI Metric Cards Row ────────────────────────────────────────── */}
      <div className="cd-kpi-grid">
        {BENCHMARK_KPIS.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <div key={kpi.id} className="cd-kpi-card">
              <div className="cd-kpi-top">
                <div className="cd-kpi-icon-wrap">
                  <IconComponent size={18} />
                </div>
                <span className="cd-kpi-label">{kpi.label}</span>
              </div>

              <div className="cd-kpi-value">{kpi.value}</div>

              <div className="cd-kpi-bottom">
                <span className={`cd-kpi-trend ${kpi.isPositive ? "" : "down"}`}>
                  {kpi.isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  <span>{kpi.isPositive ? `↑ ${kpi.trend}` : `↓ ${kpi.trend}`}</span>
                </span>
                <span className="cd-kpi-compare">{kpi.compare}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Main Content Grid: Performance Trend + Platform Breakdown ──── */}
      <div className="cd-main-grid">
        {/* Left Column: Performance Trend Bar Chart */}
        <div className="cd-card cd-trend-card">
          <div className="cd-trend-header">
            <h2 className="cd-card-title">Performance Trend</h2>

            {/* Segmented Metric Pills */}
            <div className="cd-metric-pills">
              {[
                { id: "spend", label: "Spend" },
                { id: "reach", label: "Reach" },
                { id: "impressions", label: "Impressions" },
                { id: "clicks", label: "Clicks" },
                { id: "conversions", label: "Conversions" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  className={`cd-metric-pill ${activeMetric === pill.id ? "active" : ""}`}
                  onClick={() => setActiveMetric(pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div className="cd-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                barGap={5}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="period"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={formatYAxis}
                  dx={-5}
                />
                <Tooltip
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="cd-tooltip">
                        <div className="cd-tooltip-title">{label}</div>
                        {payload.map((item) => (
                          <div key={item.name} className="cd-tooltip-row">
                            <span className="cd-tooltip-platform">
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: item.color,
                                  display: "inline-block",
                                }}
                              />
                              {item.name}
                            </span>
                            <span className="cd-tooltip-val">
                              {activeMetric === "spend"
                                ? `$${item.value?.toLocaleString()}`
                                : item.value?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                {(selectedPlatform === "all" || selectedPlatform === "meta") && (
                  <Bar
                    dataKey="Meta"
                    fill="#0066fe"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={18}
                  />
                )}
                {(selectedPlatform === "all" || selectedPlatform === "google") && (
                  <Bar
                    dataKey="Google"
                    fill="#10b981"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={18}
                  />
                )}
                {(selectedPlatform === "all" || selectedPlatform === "linkedin") && (
                  <Bar
                    dataKey="LinkedIn"
                    fill="#6366f1"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={18}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend below */}
          <div className="cd-chart-legend">
            <div
              className="cd-legend-item"
              onClick={() => setSelectedPlatform(selectedPlatform === "meta" ? "all" : "meta")}
            >
              <div className="cd-legend-dot" style={{ background: "#0066fe" }} />
              <span>Meta</span>
            </div>
            <div
              className="cd-legend-item"
              onClick={() => setSelectedPlatform(selectedPlatform === "google" ? "all" : "google")}
            >
              <div className="cd-legend-dot" style={{ background: "#10b981" }} />
              <span>Google</span>
            </div>
            <div
              className="cd-legend-item"
              onClick={() => setSelectedPlatform(selectedPlatform === "linkedin" ? "all" : "linkedin")}
            >
              <div className="cd-legend-dot" style={{ background: "#6366f1" }} />
              <span>LinkedIn</span>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Performance & Top Performing Campaign */}
        <div className="cd-side-stack">
          {/* Platform Performance Card with Donut Chart */}
          <div className="cd-card cd-platform-card">
            <h2 className="cd-card-title">Platform Performance</h2>

            <div className="cd-platform-body">
              {/* Donut Chart with Centered Total */}
              <div className="cd-donut-wrap">
                <ResponsiveContainer width={170} height={170}>
                  <PieChart>
                    <Pie
                      data={breakdownConfig.items}
                      dataKey="percentNum"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={74}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {breakdownConfig.items.map((entry) => (
                        <Cell key={entry.platform} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="cd-donut-center">
                  <span className="cd-donut-center-val">
                    {breakdownConfig.totalFormatted}
                  </span>
                  <span className="cd-donut-center-lbl">
                    {breakdownConfig.totalLabel}
                  </span>
                </div>
              </div>

              {/* Platform Breakdown List */}
              <div className="cd-platform-list">
                {breakdownConfig.items.map((item) => (
                  <div key={item.platform} className="cd-platform-row">
                    <div className="cd-platform-info">
                      <div className="cd-platform-icon-pill">
                        {item.platform === "meta" && <MetaLogoIcon size={18} />}
                        {item.platform === "google" && <GoogleAdsLogoIcon size={18} />}
                        {item.platform === "linkedin" && <LinkedInLogoIcon size={18} />}
                      </div>
                      <span className="cd-platform-name">{item.name}</span>
                    </div>

                    <div className="cd-platform-stats">
                      <span className="cd-platform-amount">{item.amount}</span>
                      <span className="cd-platform-share">{item.share}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Campaign Card */}
          <div className="cd-card cd-top-campaign-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 className="cd-card-title">Top Performing Campaign</h2>
              {onNavigateToCampaigns && (
                <button
                  type="button"
                  onClick={onNavigateToCampaigns}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span>View all</span>
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>

            {/* Featured Campaign Row */}
            <div
              className="cd-top-campaign-item"
              onClick={() => {
                if (onNavigateToCampaigns) {
                  onNavigateToCampaigns();
                }
              }}
              title="Click to view campaign in Management"
            >
              <div className="cd-top-campaign-left">
                {featuredCampaign.image ? (
                  <img
                    src={featuredCampaign.image}
                    alt={featuredCampaign.title}
                    className="cd-top-campaign-thumb"
                  />
                ) : (
                  <div
                    className="cd-top-campaign-thumb"
                    style={{
                      background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}
                  >
                    <Sparkles size={20} />
                  </div>
                )}

                <div className="cd-top-campaign-meta">
                  <span className="cd-top-campaign-name">
                    {featuredCampaign.title}
                  </span>
                  <span className="cd-top-campaign-tag">
                    {featuredCampaign.platform} • {featuredCampaign.objective}
                  </span>
                </div>
              </div>

              <div className="cd-top-campaign-stats">
                <div className="cd-top-stat">
                  <span className="cd-top-stat-val">{featuredCampaign.spend}</span>
                  <span className="cd-top-stat-lbl">Spend</span>
                </div>
                <div className="cd-top-stat">
                  <span className="cd-top-stat-val">{featuredCampaign.clicks}</span>
                  <span className="cd-top-stat-lbl">Clicks</span>
                </div>
                <div className="cd-top-stat">
                  <span className="cd-top-stat-val">{featuredCampaign.ctr}</span>
                  <span className="cd-top-stat-lbl">CTR</span>
                </div>
                <ChevronRight size={17} className="cd-top-campaign-arrow" />
              </div>
            </div>

            {/* Mini Campaign Selector (lets user toggle top 3) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 6,
                paddingTop: 4,
              }}
            >
              {TOP_CAMPAIGNS.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCampaignIndex(idx)}
                  style={{
                    width: selectedCampaignIndex === idx ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    border: "none",
                    background: selectedCampaignIndex === idx ? "#2563eb" : "#cbd5e1",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.2s ease",
                  }}
                  title={c.title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
