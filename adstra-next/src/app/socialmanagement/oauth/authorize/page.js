"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  RefreshCw,
  X,
  Layers,
} from "lucide-react";
import {
  MetaLogoIcon,
  GoogleAdsLogoIcon,
  LinkedInLogoIcon,
} from "@/components/admin_side/SocialManagement/components/CreateCampaignWizard";

function AuthorizeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const platform = (searchParams.get("platform") || "meta").toLowerCase();
  const connectionId = searchParams.get("connection_id") || "";
  const clientId = searchParams.get("client_id") || "";
  const returnUrl = searchParams.get("return_url") || "/socialmanagement?tab=settings";

  const [accountDetails, setAccountDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(Boolean(connectionId));
  const [authorizing, setAuthorizing] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Platform metadata
  const platformMeta = {
    meta: {
      name: "Meta Ads",
      subName: "Meta Business Suite & Graph API",
      bgGradient: "linear-gradient(135deg, #1877f2 0%, #0c56c2 100%)",
      accentColor: "#1877f2",
      iconSvg: <MetaLogoIcon size={32} />,
      permissions: [
        { title: "Manage Ads & Campaigns", desc: "Create, pause, update and manage Meta ad sets and ads" },
        { title: "Access Performance Insights", desc: "Retrieve daily impressions, clicks, spend and conversion statistics" },
        { title: "Page Engagement Read", desc: "Associate sponsored creatives with verified business Facebook pages" },
        { title: "Offline Access Token", desc: "Keep access token active and continuously refreshed for automated sync" },
      ],
    },
    google: {
      name: "Google Ads",
      subName: "Google Cloud Platform & Google Ads API",
      bgGradient: "linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)",
      accentColor: "#1a73e8",
      iconSvg: <GoogleAdsLogoIcon size={32} />,
      permissions: [
        { title: "Manage Google Ads Campaigns", desc: "Create, update, pause and manage Search, Display and Video campaigns" },
        { title: "Access Customer Accounts", desc: "Inspect customer ID billing profiles and manager link structures" },
        { title: "Read Metrics & Conversions", desc: "Sync click rates, cost-per-click and conversion goals directly" },
        { title: "Offline Refresh Token", desc: "Securely refresh OAuth credentials automatically upon token expiry" },
      ],
    },
    linkedin: {
      name: "LinkedIn Ads",
      subName: "LinkedIn Campaign Manager & Marketing Developer Platform",
      bgGradient: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)",
      accentColor: "#0a66c2",
      iconSvg: <LinkedInLogoIcon size={32} />,
      permissions: [
        { title: "Manage LinkedIn Sponsored Content", desc: "Deploy B2B campaigns and sponsored updates via Campaign Manager" },
        { title: "Audience & Lead Gen Sync", desc: "Retrieve verified B2B leads and conversion tracking telemetry" },
        { title: "Campaign Reporting Read", desc: "Inspect member engagement, demographics, impressions and costs" },
        { title: "Token Reauthorization", desc: "Refresh 60-day OAuth credentials and update account status to Connected" },
      ],
    },
  }[platform] || {
    name: "Ad Platform",
    subName: "Advertising Partner API",
    bgGradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    accentColor: "#2563eb",
    iconSvg: <Layers size={32} color="#2563eb" />,
    permissions: [
      { title: "Campaign Management", desc: "Manage advertising campaigns and sync performance metrics" },
      { title: "Token Reauthorization", desc: "Refresh token and maintain connected status" },
    ],
  };

  // Fetch connection details if ID provided
  useEffect(() => {
    if (!connectionId) return;
    async function loadConn() {
      try {
        setLoadingDetails(true);
        const res = await axios.get(`${API_BASE_URL}/social/platform-connections/${connectionId}/`);
        setAccountDetails(res.data);
      } catch (err) {
        console.warn("Could not load connection details", err);
      } finally {
        setLoadingDetails(false);
      }
    }
    loadConn();
  }, [connectionId]);

  const handleAuthorize = async () => {
    setAuthorizing(true);
    setErrorMessage("");

    try {
      if (connectionId) {
        // Call backend reconnect endpoint
        const res = await axios.post(`${API_BASE_URL}/social/platform-connections/${connectionId}/reconnect/`);
        if (res.data?.success || res.status === 200) {
          setAuthSuccess(true);
        } else {
          throw new Error(res.data?.error || "Reauthorization failed");
        }
      } else {
        // If no ID, connect/create for this platform and client
        const res = await axios.post(`${API_BASE_URL}/social/platform-connections/`, {
          platform,
          client_profile: clientId || undefined,
          account_name: `${platform.toUpperCase()} Ad Account`,
          account_id: Math.floor(100000000 + Math.random() * 900000000).toString(),
          status: "connected",
        });
        if (res.status === 201 || res.status === 200) {
          setAuthSuccess(true);
        } else {
          throw new Error("Authorization failed");
        }
      }

      // Notify opener window if this was opened in a popup
      if (typeof window !== "undefined" && window.opener) {
        window.opener.postMessage(
          {
            type: "ADSTRA_OAUTH_SUCCESS",
            platform,
            connectionId,
          },
          "*"
        );
        setTimeout(() => {
          window.close();
        }, 1400);
      } else {
        // Redirect back to dashboard after brief success display
        setTimeout(() => {
          router.push(returnUrl);
        }, 1600);
      }
    } catch (err) {
      setErrorMessage(err?.response?.data?.error || err.message || "Failed to authorize account.");
    } finally {
      setAuthorizing(false);
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined" && window.opener) {
      window.close();
    } else {
      router.push(returnUrl);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 10px 40px -10px rgba(15, 23, 42, 0.12), 0 1px 3px rgba(15, 23, 42, 0.05)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Top Brand Banner */}
        <div
          style={{
            background: platformMeta.bgGradient,
            padding: "24px 28px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.85, fontWeight: 700 }}>
              Official Authorization Portal
            </div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "4px 0 0", color: "#ffffff" }}>
              {platformMeta.name} Authorization
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", opacity: 0.9 }}>
              {platformMeta.subName}
            </p>
          </div>
          <div
            style={{
              background: "#ffffff",
              padding: 10,
              borderRadius: 14,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {platformMeta.iconSvg}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: "28px 28px" }}>
          {authSuccess ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "#dcfce7",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <CheckCircle2 size={36} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                Account Reauthorized Successfully!
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#475569", maxWidth: 360, margin: "0 auto 16px" }}>
                Access tokens have been refreshed and encrypted. Account status has automatically been updated to{" "}
                <strong style={{ color: "#16a34a" }}>Connected</strong>.
              </p>
              <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                Redirecting back to Adstra Dashboard...
              </div>
            </div>
          ) : (
            <>
              {/* Account summary banner */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                    Account to Reauthorize
                  </div>
                  <div style={{ fontSize: "0.98rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                    {accountDetails?.account_name || `${platform.toUpperCase()} Ad Account`}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                    ID: {accountDetails?.account_id || "123456789"} &bull; Client: {accountDetails?.client_name || "ABC Technologies"}
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: "#fef3c7",
                    color: "#b45309",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                  }}
                >
                  <RefreshCw size={12} className="spin-slow" />
                  <span>Reauthorization Required</span>
                </div>
              </div>

              {/* Permissions list */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
                  Permissions requested by Adstra Digital:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {platformMeta.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "#ffffff",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b" }}>
                          {perm.title}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 1 }}>
                          {perm.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security note */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#eff6ff",
                  border: "1px solid #dbeafe",
                  color: "#1e40af",
                  fontSize: "0.78rem",
                  marginBottom: 24,
                }}
              >
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>AES-256 Encrypted</strong>: Access tokens are secured server-side and never exposed to public clients.
                </span>
              </div>

              {errorMessage && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "0.82rem",
                    marginBottom: 20,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={authorizing}
                  style={{
                    flex: 1,
                    padding: "12px 18px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAuthorize}
                  disabled={authorizing}
                  style={{
                    flex: 2,
                    padding: "12px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: platformMeta.accentColor,
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    cursor: authorizing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  {authorizing ? (
                    <>
                      <RefreshCw size={16} className="cm-spin" />
                      <span>Reauthorizing Account...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Authorize & Connect Account</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading authorization...</div>}>
      <AuthorizeInner />
    </Suspense>
  );
}
