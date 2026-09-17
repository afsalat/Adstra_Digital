"use client";

import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  Layers,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Share2,
  CheckCircle2,
  X,
} from "lucide-react";

export default function CampaignsTab({
  campaigns = [],
  clients = [],
  onRefresh,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id || 1);
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("lead_generation");
  const [budget, setBudget] = useState("50000");
  const [spent, setSpent] = useState("0");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [targetAudience, setTargetAudience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      alert("Please enter a campaign name.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/social/campaigns/`, {
        client_profile: clientId,
        name: campaignName,
        objective,
        budget: parseFloat(budget) || 0,
        spent: parseFloat(spent) || 0,
        start_date: startDate,
        end_date: endDate,
        target_audience: targetAudience,
        platforms: ["instagram", "facebook", "linkedin"],
        status: "active",
      });
      setModalOpen(false);
      setCampaignName("");
      setTargetAudience("");
      onRefresh();
    } catch (err) {
      alert("Error creating campaign.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
            Social Marketing Campaigns & ROI
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Align multi-platform posts, budget pacing, target audiences, and conversion returns.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
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
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {campaigns.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: 60, textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <Layers size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
            <h4 style={{ margin: 0, color: "#0f172a" }}>No Campaigns Setup Yet</h4>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
              Click "Create Campaign" to group your posts by business objectives and budgets.
            </p>
          </div>
        ) : (
          campaigns.map((camp) => {
            const budgetNum = parseFloat(camp.budget) || 1;
            const spentNum = parseFloat(camp.spent) || 0;
            const spentPercent = Math.min(100, Math.round((spentNum / budgetNum) * 100));

            return (
              <div
                key={camp.id}
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  padding: 22,
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, color: "#475569" }}>
                    {camp.objective.replace("_", " ")}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4f46e5" }}>
                    {camp.client_name}
                  </span>
                </div>

                <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                  {camp.name}
                </h4>

                {camp.target_audience && (
                  <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.4 }}>
                    <Target size={13} style={{ display: "inline", marginRight: 4 }} /> {camp.target_audience}
                  </p>
                )}

                {/* Budget progress */}
                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: "#64748b" }}>Budget Pacing</span>
                    <span style={{ color: "#0f172a" }}>
                      ₹{spentNum.toLocaleString()} / ₹{budgetNum.toLocaleString()} ({spentPercent}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${spentPercent}%`,
                        height: "100%",
                        background: spentPercent > 90 ? "#ef4444" : "#10b981",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>

                {/* Platforms & Dates */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#64748b", marginTop: "auto", paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                  <span>
                    <strong>Dates:</strong> {camp.start_date || "Open"} → {camp.end_date || "Ongoing"}
                  </span>
                  <span style={{ fontWeight: 700, color: "#10b981" }}>
                    Active
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Create Campaign Modal */}
      {modalOpen && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 520 }}>
            <div className="social-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Create Social Campaign</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Client Profile
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Vorion Enterprise AI Q4 Drive"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Objective
                    </label>
                    <select
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    >
                      <option value="lead_generation">Lead Generation</option>
                      <option value="conversions">Sales & Conversions</option>
                      <option value="brand_awareness">Brand Awareness</option>
                      <option value="engagement">Engagement</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Budget (INR ₹)
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Target Audience Description
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Founders, CTOs, Kerala Retail Business Owners"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div className="social-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
