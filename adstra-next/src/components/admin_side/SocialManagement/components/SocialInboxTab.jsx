"use client";

import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  MessageSquare,
  Send,
  UserCheck,
  UserPlus,
  CheckCircle2,
  Clock,
  Star,
  ExternalLink,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X,
} from "lucide-react";

export default function SocialInboxTab({
  inboxMessages = [],
  clients = [],
  onRefresh,
}) {
  const [selectedMsg, setSelectedMsg] = useState(inboxMessages[0] || null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [convertModal, setConvertModal] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    product: "",
  });
  const [converting, setConverting] = useState(false);
  const [convertedSuccess, setConvertedSuccess] = useState(null);

  const filteredMessages = inboxMessages.filter((m) => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (platformFilter !== "all" && m.platform !== platformFilter) return false;
    return true;
  });

  const activeMsg = selectedMsg || filteredMessages[0] || null;

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeMsg) return;
    setSubmittingReply(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/social/inbox/${activeMsg.id}/reply/`, {
        reply_text: replyText,
      });
      setSelectedMsg(res.data);
      setReplyText("");
      onRefresh();
    } catch (err) {
      alert("Error sending reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleOpenConvert = () => {
    if (!activeMsg) return;
    setLeadFormData({
      customer_name: activeMsg.sender_name || "",
      phone: activeMsg.sender_phone || "",
      email: "",
      product: `Enquiry from ${activeMsg.platform.toUpperCase()} (${activeMsg.post_context || "Social Campaign"})`,
    });
    setConvertModal(true);
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    if (!activeMsg) return;

    setConverting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/social/inbox/${activeMsg.id}/convert_to_lead/`, leadFormData);
      setConvertedSuccess(res.data.lead);
      setConvertModal(false);
      setSelectedMsg(res.data.inbox_message);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || "Error converting conversation into CRM lead.");
    } finally {
      setConverting(false);
    }
  };

  // Canned quick replies
  const cannedReplies = [
    "Hello! Thank you for reaching out to Adstra Digital. We will share full package details shortly.",
    "Hi there! Can you share your preferred phone/WhatsApp number so our growth team can connect?",
    "Thanks for the kind words! Let us know if you would like a custom marketing strategy blueprint.",
  ];

  return (
    <div>
      {/* Top Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
            Unified Social Inbox & Engagement Hub
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Direct messages, post comments, WhatsApp enquiries, and 1-click CRM Lead generation.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", background: "#fff" }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Reply</option>
            <option value="important">Important</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", background: "#fff" }}
          >
            <option value="all">All Channels</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Success banner if converted */}
      {convertedSuccess && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#065f46" }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>
              Lead created successfully: #{convertedSuccess.lead_number} ({convertedSuccess.customer_name})
            </span>
          </div>
          <a
            href="/leadmanagement/"
            style={{ fontSize: "0.82rem", fontWeight: 700, color: "#059669", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
          >
            Open in CRM Lead Management <ArrowRight size={14} />
          </a>
        </div>
      )}

      {/* Main Two-Column Inbox Workspace */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          background: "#ffffff",
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
          minHeight: 600,
          overflow: "hidden",
        }}
      >
        {/* Left: Messages List */}
        <div style={{ borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", fontWeight: 700, fontSize: "0.82rem", color: "#64748b" }}>
            INBOX CONVERSATIONS ({filteredMessages.length})
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredMessages.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                No enquiries matching filter.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = activeMsg && activeMsg.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMsg(msg)}
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      background: isSelected ? "#eff6ff" : msg.status === "pending" ? "#ffffff" : "#fbfcfd",
                      borderLeft: isSelected ? "4px solid #4f46e5" : "4px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span className={`platform-pill ${msg.platform}`}>
                        {msg.platform}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        {new Date(msg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a", marginBottom: 4 }}>
                      {msg.sender_name}
                    </div>

                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                      {msg.message_text}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        {msg.client_name}
                      </span>
                      {msg.is_lead && (
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, background: "#ecfdf5", color: "#065f46", padding: "2px 6px", borderRadius: 4 }}>
                          CRM Lead
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Detail & Response Composer */}
        {activeMsg ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            
            {/* Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#0f172a", overflow: "hidden", flexShrink: 0 }}>
                  {activeMsg.sender_avatar ? (
                    <img src={activeMsg.sender_avatar} alt={activeMsg.sender_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
                      {activeMsg.sender_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                    {activeMsg.sender_name}
                  </h4>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    {activeMsg.sender_handle ? `@${activeMsg.sender_handle}` : ""} • Channel: <strong style={{ textTransform: "capitalize" }}>{activeMsg.platform}</strong> ({activeMsg.client_name})
                  </div>
                </div>
              </div>

              {/* Conversion and Status actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {activeMsg.is_lead ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "6px 12px", borderRadius: 8, color: "#065f46", fontSize: "0.8rem", fontWeight: 700 }}>
                    <CheckCircle2 size={16} color="#10b981" /> CRM Lead Linked #{activeMsg.converted_lead_number || ""}
                  </div>
                ) : (
                  <button
                    onClick={handleOpenConvert}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    <UserPlus size={16} /> Convert to CRM Lead
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Flow */}
            <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
              
              {/* Context bar */}
              {activeMsg.post_context && (
                <div style={{ background: "#f1f5f9", padding: "8px 14px", borderRadius: 8, fontSize: "0.78rem", color: "#475569" }}>
                  <strong>Context:</strong> User engaged on <em>{activeMsg.post_context}</em>
                </div>
              )}

              {/* Inbound Customer Message Bubble */}
              <div style={{ display: "flex", gap: 12, maxWidth: "80%" }}>
                <div style={{ background: "#f1f5f9", padding: "14px 18px", borderRadius: 16, borderTopLeftRadius: 4, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4f46e5", marginBottom: 4 }}>
                    {activeMsg.sender_name} ({activeMsg.platform})
                  </div>
                  <p style={{ margin: 0, fontSize: "0.92rem", color: "#0f172a", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {activeMsg.message_text}
                  </p>
                  {activeMsg.sender_phone && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", color: "#16a34a", fontWeight: 700 }}>
                      <Phone size={13} /> {activeMsg.sender_phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Replies Thread */}
              {(activeMsg.replies || []).map((rep, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ background: "#4f46e5", color: "#ffffff", padding: "14px 18px", borderRadius: 16, borderTopRightRadius: 4, maxWidth: "75%" }}>
                    <div style={{ fontSize: "0.72rem", opacity: 0.85, marginBottom: 4, fontWeight: 700 }}>
                      {rep.sender || "Adstra Team"} • {new Date(rep.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
                      {rep.text}
                    </p>
                  </div>
                </div>
              ))}

            </div>

            {/* Quick canned replies */}
            <div style={{ padding: "8px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8, overflowX: "auto" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", alignSelf: "center", whiteSpace: "nowrap" }}>
                ⚡ Quick Replies:
              </span>
              {cannedReplies.map((canned, i) => (
                <button
                  key={i}
                  onClick={() => setReplyText(canned)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    color: "#334155",
                  }}
                >
                  {canned.slice(0, 32)}...
                </button>
              ))}
            </div>

            {/* Reply Composer */}
            <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", background: "#ffffff", display: "flex", gap: 12 }}>
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to publish back to social channel..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none", resize: "none" }}
              />
              <button
                onClick={handleSendReply}
                disabled={submittingReply || !replyText.trim()}
                style={{ padding: "0 22px", borderRadius: 10, background: "#4f46e5", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Send size={16} /> Send
              </button>
            </div>

          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
            Select a conversation from the left to engage.
          </div>
        )}
      </div>

      {/* Convert to Lead Modal */}
      {convertModal && activeMsg && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 520 }}>
            <div className="social-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus size={20} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Convert to CRM Lead</h3>
              </div>
              <button onClick={() => setConvertModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConvertLead}>
              <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                  This will automatically generate a new Lead inside the Adstra Digital CRM pipeline with stage <strong>NEW</strong> and priority <strong>HIGH</strong>.
                </p>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Customer / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadFormData.customer_name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, customer_name: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={leadFormData.phone}
                      onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                      placeholder="+91 98471..."
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={leadFormData.email}
                      onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                      placeholder="client@gmail.com"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Service / Product of Interest
                  </label>
                  <input
                    type="text"
                    value={leadFormData.product}
                    onChange={(e) => setLeadFormData({ ...leadFormData, product: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div className="social-modal-footer">
                <button
                  type="button"
                  onClick={() => setConvertModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={converting}
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  {converting ? "Creating Lead..." : "Confirm & Create CRM Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
