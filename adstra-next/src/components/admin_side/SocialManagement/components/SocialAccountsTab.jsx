"use client";

import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Power,
  ExternalLink,
  ShieldCheck,
  Clock,
  Users,
  X,
} from "lucide-react";

export default function SocialAccountsTab({
  accounts = [],
  clients = [],
  onRefresh,
}) {
  const [connectingModal, setConnectingModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || 1);
  const [accountName, setAccountName] = useState("");
  const [username, setUsername] = useState("");
  const [followers, setFollowers] = useState(5000);
  const [actionLoading, setActionLoading] = useState(null);

  const handleReconnect = async (accId) => {
    setActionLoading(accId);
    try {
      await axios.post(`${API_BASE_URL}/social/accounts/${accId}/reconnect/`);
      onRefresh();
    } catch (err) {
      alert("Error reconnecting account. Please verify credentials.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (accId) => {
    if (!confirm("Are you sure you want to disconnect this social channel?")) return;
    setActionLoading(accId);
    try {
      await axios.post(`${API_BASE_URL}/social/accounts/${accId}/disconnect/`);
      onRefresh();
    } catch (err) {
      alert("Error disconnecting account.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) {
      alert("Please enter an account or page name.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/social/accounts/`, {
        client_profile: selectedClient,
        platform: selectedPlatform,
        account_name: accountName,
        account_id: `${selectedPlatform}_${Date.now()}`,
        username: username.startsWith("@") ? username : `@${username}`,
        status: "connected",
        followers_count: parseInt(followers, 10) || 0,
        token_expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setConnectingModal(false);
      setAccountName("");
      setUsername("");
      onRefresh();
    } catch (err) {
      alert("Error adding social account.");
    }
  };

  return (
    <div>
      {/* Top Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
            Connected Social Accounts & Channels
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Omnichannel API tokens, live status tracking, and page permissions for clients.
          </p>
        </div>

        <button
          onClick={() => setConnectingModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            padding: "9px 18px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
          }}
        >
          <Plus size={16} /> Connect Social Channel
        </button>
      </div>

      {/* Grid of Accounts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {accounts.map((acc) => {
          const isExpiring = acc.status === "token_expiring" || acc.status === "expired";
          const isDisconnected = acc.status === "disconnected";

          return (
            <div
              key={acc.id}
              style={{
                background: "#ffffff",
                borderRadius: 16,
                padding: 22,
                border: `1px solid ${isExpiring ? "#fde68a" : isDisconnected ? "#e2e8f0" : "#cbd5e1"}`,
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header: Platform & Client */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span className={`platform-pill ${acc.platform}`}>
                  {acc.platform.replace("_", " ")}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "3px 8px", borderRadius: 6 }}>
                  {acc.client_name}
                </span>
              </div>

              {/* Profile Details */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "#0f172a",
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "2px solid #e2e8f0",
                  }}
                >
                  {acc.profile_picture ? (
                    <img
                      src={acc.profile_picture}
                      alt={acc.account_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
                      {acc.account_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {acc.account_name}
                  </h4>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                    {acc.username || "Connected Channel"}
                  </div>
                </div>
              </div>

              {/* Stats & Token Expiry */}
              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Followers / Subs</span>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                    {acc.followers_count?.toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Token Health</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 700, color: isExpiring ? "#d97706" : isDisconnected ? "#64748b" : "#10b981", marginTop: 2 }}>
                    {isExpiring ? (
                      <>
                        <AlertTriangle size={14} /> Expiring Soon
                      </>
                    ) : isDisconnected ? (
                      <>
                        <Power size={14} /> Disconnected
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} /> Secure Token
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: "auto", display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                {isDisconnected ? (
                  <button
                    onClick={() => handleReconnect(acc.id)}
                    disabled={actionLoading === acc.id}
                    style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#4f46e5", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <RefreshCw size={14} /> Reconnect Channel
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleReconnect(acc.id)}
                      disabled={actionLoading === acc.id}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <RefreshCw size={14} /> Refresh Token
                    </button>
                    <button
                      onClick={() => handleDisconnect(acc.id)}
                      disabled={actionLoading === acc.id}
                      style={{ padding: "8px 12px", borderRadius: 8, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Connect Account Modal */}
      {connectingModal && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 520 }}>
            <div className="social-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Connect Social Media Account</h3>
              <button onClick={() => setConnectingModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAccount}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Client Profile
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Platform Channel
                  </label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                  >
                    <option value="facebook">Facebook Business Page</option>
                    <option value="instagram">Instagram Professional / Creator</option>
                    <option value="linkedin">LinkedIn Organization Page</option>
                    <option value="youtube">YouTube Channel</option>
                    <option value="google_business">Google Business Profile</option>
                    <option value="tiktok">TikTok Business Account</option>
                    <option value="x">X / Twitter Account</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Account / Page Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. microsoft Official Page"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@vorionnexus or vorion-nexus"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Current Followers / Subscribers
                  </label>
                  <input
                    type="number"
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                  />
                </div>
              </div>

              <div className="social-modal-footer">
                <button
                  type="button"
                  onClick={() => setConnectingModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Connect Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
