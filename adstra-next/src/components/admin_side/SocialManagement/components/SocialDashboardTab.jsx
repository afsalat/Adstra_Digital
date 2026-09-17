"use client";

import React from "react";
import {
  Users,
  Eye,
  TrendingUp,
  Heart,
  Share2,
  Bookmark,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Award,
} from "lucide-react";

export default function SocialDashboardTab({
  dashboardData,
  onNavigateTab,
  onReconnectAccount,
  onOpenCreatePost,
}) {
  if (!dashboardData) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>
        <RefreshCw size={32} className="spin-animation" style={{ marginBottom: 12 }} />
        <p>Loading Social Media Dashboard...</p>
      </div>
    );
  }

  const overview = dashboardData.overview || {};
  const statusCounts = dashboardData.status_counts || {};
  const platforms = dashboardData.platforms || [];
  const expiringAccounts = dashboardData.expiring_accounts || [];
  const clientsSummary = dashboardData.clients_summary || [];
  const recentPosts = dashboardData.recent_posts || [];

  return (
    <div>
      {/* Expiry Warning Banner if any account has token issues */}
      {expiringAccounts.length > 0 && (
        <div className="social-alert-banner">
          <div className="social-alert-left">
            <AlertTriangle size={20} color="#d97706" />
            <span>
              <strong>Security & API Notice:</strong> {expiringAccounts.length} social account(s) have token expiration warnings. Re-authenticate to avoid scheduled post publishing failures.
            </span>
          </div>
          <button
            onClick={() => onNavigateTab("accounts")}
            style={{ background: "#d97706", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
          >
            Manage Accounts
          </button>
        </div>
      )}

      {/* Top 4 Primary KPI Cards */}
      <div className="dashboard-kpi-grid">
        {/* Total Followers */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Audience</span>
            <div className="kpi-icon-wrap" style={{ background: "#eef2ff", color: "#4f46e5" }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{overview.total_followers?.toLocaleString() || 0}</div>
          <div className="kpi-growth up">
            <ArrowUpRight size={16} /> +12.4% vs last 30 days
          </div>
        </div>

        {/* Reach */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Total Reach</span>
            <div className="kpi-icon-wrap" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <Eye size={20} />
            </div>
          </div>
          <div className="kpi-value">{overview.total_reach?.toLocaleString() || 0}</div>
          <div className="kpi-growth up">
            <ArrowUpRight size={16} /> +18.2% across campaigns
          </div>
        </div>

        {/* Impressions */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Impressions</span>
            <div className="kpi-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value">{overview.total_impressions?.toLocaleString() || 0}</div>
          <div className="kpi-growth up">
            <ArrowUpRight size={16} /> High organic distribution
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span>Avg Engagement Rate</span>
            <div className="kpi-icon-wrap" style={{ background: "#faf5ff", color: "#9333ea" }}>
              <Award size={20} />
            </div>
          </div>
          <div className="kpi-value">{overview.engagement_rate || 4.2}%</div>
          <div className="kpi-growth up">
            <ArrowUpRight size={16} /> 2.1x industry average
          </div>
        </div>
      </div>

      {/* Status Summary Strip */}
      <div className="status-counts-strip">
        <div className="status-box" onClick={() => onNavigateTab("calendar")} style={{ cursor: "pointer" }}>
          <div style={{ color: "#3b82f6" }}><Calendar size={22} /></div>
          <div>
            <div className="count">{statusCounts.scheduled || 0}</div>
            <div className="label">Scheduled Posts</div>
          </div>
        </div>

        <div className="status-box" onClick={() => onNavigateTab("calendar")} style={{ cursor: "pointer" }}>
          <div style={{ color: "#10b981" }}><CheckCircle size={22} /></div>
          <div>
            <div className="count">{statusCounts.published || 0}</div>
            <div className="label">Published</div>
          </div>
        </div>

        <div className="status-box" onClick={() => onNavigateTab("approval")} style={{ cursor: "pointer" }}>
          <div style={{ color: "#ea580c" }}><Clock size={22} /></div>
          <div>
            <div className="count">{(statusCounts.client_review || 0) + (statusCounts.internal_review || 0)}</div>
            <div className="label">Pending Reviews</div>
          </div>
        </div>

        <div className="status-box" onClick={() => onNavigateTab("calendar")} style={{ cursor: "pointer" }}>
          <div style={{ color: "#64748b" }}><Clock size={22} /></div>
          <div>
            <div className="count">{statusCounts.draft || 0}</div>
            <div className="label">Drafts</div>
          </div>
        </div>

        <div className="status-box" onClick={() => onNavigateTab("inbox")} style={{ cursor: "pointer" }}>
          <div style={{ color: "#8b5cf6" }}><Users size={22} /></div>
          <div>
            <div className="count">{dashboardData.inbox_pending_count || 0}</div>
            <div className="label">Inbox Enquiries</div>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="social-two-col">

        {/* Left: Platform Distribution & Performance */}
        <div className="social-panel">
          <div className="social-panel-header">
            <h3>Connected Platforms Performance</h3>
            <button
              onClick={() => onNavigateTab("accounts")}
              style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
            >
              View Accounts →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            {platforms.map((p) => (
              <div
                key={p.platform}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className={`platform-pill ${p.platform}`}>{p.name}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                    {p.accounts_count} active
                  </span>
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                  {p.followers?.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  followers • {p.posts_count} posts
                </div>
              </div>
            ))}
          </div>

          {/* Client-wise Monthly Goal Tracking */}
          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
              Client Monthly Target Progress
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {clientsSummary.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "14px 18px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>{c.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: 8 }}>
                        ({c.accounts_count} accounts • {c.pending_reviews} pending reviews)
                      </span>
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#4f46e5" }}>
                      {c.published_posts} / {c.target_posts} posts ({c.progress_percent}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${c.progress_percent}%`,
                        height: "100%",
                        background: c.progress_percent >= 80 ? "#10b981" : "#4f46e5",
                        borderRadius: 4,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & Recent Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Quick Creator Box */}
          <div
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
              borderRadius: 18,
              padding: 24,
              color: "#ffffff",
              boxShadow: "0 10px 25px rgba(79, 70, 229, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Sparkles size={22} />
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>Quick Content Action</h3>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem", opacity: 0.9, lineHeight: 1.4 }}>
              Schedule across microsoft & Adstra channels with AI captions and live previews.
            </p>
            <button
              onClick={onOpenCreatePost}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 10,
                background: "#ffffff",
                color: "#4f46e5",
                border: "none",
                fontWeight: 800,
                fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              + Create New Post
            </button>
          </div>

          {/* Recent Scheduled & Published Posts */}
          <div className="social-panel" style={{ flex: 1 }}>
            <div className="social-panel-header">
              <h3>Recent Content Activity</h3>
              <button
                onClick={() => onNavigateTab("calendar")}
                style={{ background: "none", border: "none", color: "#4f46e5", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Calendar →
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentPosts.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", padding: 20 }}>
                  No recent posts found.
                </p>
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      borderBottom: "1px solid #f1f5f9",
                      paddingBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#0f172a",
                        flexShrink: 0,
                      }}
                    >
                      {post.media_urls?.[0] ? (
                        <img
                          src={post.media_urls[0]}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.7rem" }}>
                          TEXT
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {post.title || post.primary_caption?.slice(0, 30)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <span className={`status-pill ${post.status}`}>
                          {post.status.replace("_", " ")}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          {post.client_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
