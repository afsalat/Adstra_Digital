"use client";

import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  Building2,
  CheckCircle2,
  Mail,
  Phone,
  Target,
  Shield,
  Palette,
  Edit2,
  Plus,
  Save,
  X,
} from "lucide-react";

export default function ClientAccountsTab({
  clients = [],
  onRefresh,
}) {
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!editingClient) return;

    setSaving(true);
    try {
      await axios.patch(`${API_BASE_URL}/social/clients/${editingClient.id}/`, {
        target_monthly_posts: editingClient.target_monthly_posts,
        package_tier: editingClient.package_tier,
        approval_policy: editingClient.approval_policy,
        primary_color: editingClient.primary_color,
        brand_tagline: editingClient.brand_tagline,
        client_email: editingClient.client_email,
        client_contact: editingClient.client_contact,
        notes: editingClient.notes,
      });
      setEditingClient(null);
      onRefresh();
    } catch (err) {
      alert("Error saving client profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
            Client Brand Profiles & Retainer Configurations
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Brand colors, approval policy, target monthly quota, and agency package limits.
          </p>
        </div>
      </div>

      {/* Clients Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {clients.map((c) => (
          <div
            key={c.id}
            style={{
              background: "#ffffff",
              borderRadius: 18,
              border: "1px solid #e2e8f0",
              padding: 24,
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header: Logo & Name */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: c.primary_color || "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                  }}
                >
                  {c.name.charAt(0)}
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                    {c.name}
                  </h4>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 8px", borderRadius: 6, display: "inline-block", marginTop: 2 }}>
                    {c.package_tier}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setEditingClient({ ...c })}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Edit2 size={13} /> Edit Brand
              </button>
            </div>

            {/* Tagline */}
            {c.brand_tagline && (
              <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#475569", fontStyle: "italic", borderLeft: "3px solid #cbd5e1", paddingLeft: 10 }}>
                "{c.brand_tagline}"
              </p>
            )}

            {/* Details Strip */}
            <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 12, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.82rem" }}>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.72rem", fontWeight: 700 }}>MONTHLY POST QUOTA</span>
                <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{c.target_monthly_posts} posts</strong>
              </div>

              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.72rem", fontWeight: 700 }}>APPROVAL POLICY</span>
                <strong style={{ color: "#0f172a", textTransform: "capitalize" }}>
                  {c.approval_policy?.replace("_", " ")}
                </strong>
              </div>

              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.72rem", fontWeight: 700 }}>PRIMARY COLOR</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: c.primary_color || "#4f46e5" }} />
                  <strong>{c.primary_color || "#4f46e5"}</strong>
                </div>
              </div>

              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "0.72rem", fontWeight: 700 }}>CONNECTED CHANNELS</span>
                <strong style={{ color: "#0f172a" }}>{c.accounts_count || 0} Accounts</strong>
              </div>
            </div>

            {/* Contact details */}
            <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", flexDirection: "column", gap: 6, marginTop: "auto", paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
              {c.client_email && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={13} /> {c.client_email}
                </div>
              )}
              {c.client_contact && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={13} /> {c.client_contact}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 540 }}>
            <div className="social-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Configure {editingClient.name}</h3>
              <button onClick={() => setEditingClient(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClient}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={editingClient.brand_tagline || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, brand_tagline: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Monthly Post Target
                    </label>
                    <input
                      type="number"
                      value={editingClient.target_monthly_posts}
                      onChange={(e) => setEditingClient({ ...editingClient, target_monthly_posts: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Package Tier
                    </label>
                    <input
                      type="text"
                      value={editingClient.package_tier}
                      onChange={(e) => setEditingClient({ ...editingClient, package_tier: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Approval Policy
                    </label>
                    <select
                      value={editingClient.approval_policy}
                      onChange={(e) => setEditingClient({ ...editingClient, approval_policy: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    >
                      <option value="client_required">Client Review Required</option>
                      <option value="internal_only">Internal Review Only</option>
                      <option value="auto_approved">Direct Publish</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Primary Brand Color (Hex)
                    </label>
                    <input
                      type="text"
                      value={editingClient.primary_color}
                      onChange={(e) => setEditingClient({ ...editingClient, primary_color: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={editingClient.client_email || ""}
                    onChange={(e) => setEditingClient({ ...editingClient, client_email: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div className="social-modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
