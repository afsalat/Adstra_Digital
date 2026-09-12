"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BadgePercent,
  BarChart2,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CornerUpLeft,
  Download,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Inbox,
  Info,
  Kanban,
  Key,
  LayoutList,
  Loader2,
  Mail,
  Maximize2,
  MessageSquare,
  Minimize2,
  MoreVertical,
  Paperclip,
  Phone,
  PhoneCall,
  PhoneMissed,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  Users2,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useModal } from "@/Context/ModalContext";
import { useAuth } from "@/Context/AuthContext";
import API_BASE_URL from "@/utils/apiBase";
import "./LeadManagement.css";
import LiveChatWorkspace from "./ChatWorkspace";
import LeadSelector from "@/components/ProposalBuilder/LeadSelector";

// ─── Constants ──────────────────────────────────────────────────────────────

export const STAGE_META = {
  NEW:                          { label: "New",                   color: "#6366f1", group: "intake" },
  ASSIGNED:                     { label: "Assigned",              color: "#8b5cf6", group: "intake" },
  CONTACT_ATTEMPTED:            { label: "Contacted",             color: "#f59e0b", group: "contact" },
  CONNECTED:                    { label: "Connected",             color: "#3b82f6", group: "contact" },
  FOLLOW_UP_REQUIRED:           { label: "Follow Up",             color: "#f97316", group: "contact" },
  QUALIFIED:                    { label: "Qualified",             color: "#10b981", group: "qualify" },
  DEMO_SCHEDULED:               { label: "Demo Scheduled",        color: "#06b6d4", group: "qualify" },
  DEMO_COMPLETED:               { label: "Demo Done",             color: "#0891b2", group: "qualify" },
  REQUIREMENT_MEETING_SCHEDULED:{ label: "Req. Meeting",          color: "#7c3aed", group: "technical" },
  REQUIREMENT_COLLECTED:        { label: "Req. Collected",        color: "#5b21b6", group: "technical" },
  FEASIBILITY_REVIEW:           { label: "Feasibility",           color: "#d97706", group: "technical" },
  CUSTOMIZATION_REQUIRED:       { label: "Customisation",         color: "#ea580c", group: "technical" },
  COST_ESTIMATION:              { label: "Cost Est.",             color: "#b45309", group: "commercial" },
  PROPOSAL_PREPARATION:         { label: "Proposal Prep",         color: "#0d9488", group: "commercial" },
  PROPOSAL_SENT:                { label: "Proposal Sent",         color: "#0f766e", group: "commercial" },
  QUOTATION_SENT:               { label: "Quotation Sent",        color: "#047857", group: "commercial" },
  NEGOTIATION:                  { label: "Negotiation",           color: "#1d4ed8", group: "commercial" },
  DECISION_PENDING:             { label: "Decision Pending",      color: "#7c3aed", group: "commercial" },
  CONVERTED:                    { label: "Converted",             color: "#16a34a", group: "closed" },
  REJECTED:                     { label: "Rejected",              color: "#dc2626", group: "closed" },
  LOST:                         { label: "Lost",                  color: "#64748b", group: "closed" },
  ON_HOLD:                      { label: "On Hold",               color: "#9ca3af", group: "closed" },
};

export const PRIORITY_META = {
  CRITICAL: { label: "Critical", color: "#dc2626", order: 1 },
  HIGH:     { label: "High",     color: "#f97316", order: 2 },
  MEDIUM:   { label: "Medium",   color: "#eab308", order: 3 },
  LOW:      { label: "Low",      color: "#22c55e", order: 4 },
};

const SOURCE_LABELS = {
  WEBSITE: "Website", SOCIAL_MEDIA: "Social Media", REFERRAL: "Referral",
  COLD_CALL: "Cold Call", EMAIL_CAMPAIGN: "Email Campaign", EXHIBITION: "Exhibition",
  PARTNER: "Partner", DIRECT: "Direct", WALK_IN: "Walk In", PHONE: "Phone", OTHER: "Other",
};

const LEAD_TYPES = { SERVICE: "Service", PRODUCT: "Product", BOTH: "Both" };

const CALL_OUTCOMES = [
  "CONNECTED", "NO_ANSWER", "BUSY", "SWITCHED_OFF", "INVALID_NUMBER",
  "CALLBACK_REQUESTED", "INTERESTED", "NOT_INTERESTED", "DEMO_REQUESTED",
  "MEETING_REQUESTED", "FOLLOW_UP_REQUIRED",
];

const FOLLOW_UP_TYPES = [
  "PHONE", "WHATSAPP", "EMAIL", "MEETING", "DEMO",
  "REQUIREMENT_DISCUSSION", "SITE_VISIT", "PROPOSAL", "QUOTATION", "PAYMENT",
];

const FOLLOW_UP_TYPES_ROUTED_TO_MEETINGS = new Set([
  "MEETING",
  "DEMO",
  "REQUIREMENT_DISCUSSION",
  "SITE_VISIT",
]);

const FOLLOW_UP_TO_MEETING_TYPE = {
  MEETING: "FOLLOW_UP",
  DEMO: "PRODUCT_DEMO",
  REQUIREMENT_DISCUSSION: "TECHNICAL_DISCUSSION",
  SITE_VISIT: "SITE_VISIT",
};

const FOLLOW_UP_TO_MEETING_MODE = {
  MEETING: "ONLINE",
  DEMO: "ONLINE",
  REQUIREMENT_DISCUSSION: "ONLINE",
  SITE_VISIT: "CUSTOMER_LOCATION",
};

const MEETING_TYPES = {
  PRODUCT_DEMO: "Product Demo",
  PRODUCT_DISCUSSION: "Product Discussion",
  CUSTOMIZATION_REQUIREMENT: "Customization Requirement",
  SERVICE_REQUIREMENT: "Service Requirement",
  TECHNICAL_DISCUSSION: "Technical Discussion",
  SITE_VISIT: "Site Visit",
  PROPOSAL_DISCUSSION: "Proposal Discussion",
  NEGOTIATION: "Negotiation",
  FOLLOW_UP: "Follow-up",
};

const MEETING_MODES = {
  ONLINE: "Online",
  OFFICE: "Office",
  CUSTOMER_LOCATION: "Customer Location",
  PHONE: "Phone",
};

const MEETING_STATUSES = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  RESCHEDULED: "Rescheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  CUSTOMER_NO_SHOW: "Customer No-show",
  TEAM_NO_SHOW: "Team No-show",
};

const EMPTY_FORM = {
  customer_name: "", contact_person: "", company_name: "", email: "",
  phone: "", source: "WEBSITE", lead_type: "SERVICE", service: "",
  product: "", priority: "MEDIUM", estimated_value: "", requirement_summary: "",
  contact_numbers: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ax = (method, url, data, extra = {}) =>
  axios({ method, url: `${API_BASE_URL}${url}`, data, headers: getAuthHeaders(), ...extra });

const fmt = (v) =>
  v ? Number(v).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }) : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const isOverdue = (d) => d && new Date(d) < new Date();

const compactLabel = (value) =>
  value ? String(value).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "";

const getWhatsAppNumber = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
};

const getWhatsAppUrl = (phone) => {
  const number = getWhatsAppNumber(phone);
  return number ? `https://wa.me/${number}` : "";
};

const getLastFollowUpDetails = (lead = {}) => {
  const candidates = [
    lead.last_follow_up,
    lead.latest_follow_up,
    lead.last_followup,
    Array.isArray(lead.follow_ups) ? lead.follow_ups[0] : null,
  ].filter(Boolean);
  const last = candidates[0] || {};
  const date = last.completed_at || last.updated_at || last.scheduled_at || last.created_at || lead.last_follow_up_at || lead.last_call_at;
  const type = compactLabel(last.follow_up_type || last.type || lead.last_follow_up_type || (lead.last_call_at ? "Call" : ""));
  const status = compactLabel(last.status || last.outcome || lead.last_follow_up_status || lead.last_call_outcome || "");
  const note = last.result || last.purpose || last.notes || last.description || lead.last_follow_up_notes || lead.last_call_notes || "";
  const nextDate = last.next_follow_up_at || lead.next_follow_up_at;

  return { date, type, status, note, nextDate };
};

const localDateInputValue = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const localDateTimeInputValue = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[char]));

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

export const StagePill = ({ stage, small }) => {
  const m = STAGE_META[stage] || { label: stage, color: "#64748b" };
  return (
    <span className={`lm-pill${small ? " lm-pill--sm" : ""}`} style={{ "--pill-color": m.color }}>
      {m.label}
    </span>
  );
};

export const PriorityDot = ({ priority }) => {
  const m = PRIORITY_META[priority] || { label: priority, color: "#94a3b8" };
  return (
    <span className="lm-priority" style={{ "--dot-color": m.color }}>
      <i />{m.label}
    </span>
  );
};

export function PrioritySelector({ priority, onChange, disabled, small }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const m = PRIORITY_META[priority] || { label: priority || "Medium", color: "#94a3b8" };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const priorities = [
    { key: "CRITICAL", label: "Critical", color: "#dc2626" },
    { key: "HIGH",     label: "High",     color: "#f97316" },
    { key: "MEDIUM",   label: "Medium",   color: "#eab308" },
    { key: "LOW",      label: "Low",      color: "#22c55e" },
  ];

  const handleSelect = async (key) => {
    if (key === priority || disabled || loading) {
      setOpen(false);
      return;
    }
    setOpen(false);
    if (onChange) {
      try {
        setLoading(true);
        await onChange(key);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="lm-priority-selector-wrapper">
      <button
        type="button"
        className={`lm-priority-badge-btn ${small ? "lm-priority-badge-btn--sm" : ""}`}
        style={{ "--dot-color": m.color }}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled && !loading) setOpen(prev => !prev);
        }}
        disabled={disabled || loading}
        title="Click to change priority"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {loading ? (
          <Loader2 size={11} className="spin" />
        ) : (
          <span className="lm-priority-dot-indicator" style={{ background: m.color }} />
        )}
        <span className="lm-priority-label">{m.label}</span>
        <ChevronDown size={12} className={`lm-priority-chevron ${open ? "open" : ""}`} />
      </button>

      {open && (
        <div className="lm-priority-dropdown-menu" role="listbox">
          <div className="lm-priority-dropdown-header">Change Priority</div>
          {priorities.map((item) => {
            const isSelected = (priority || "MEDIUM").toUpperCase() === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`lm-priority-dropdown-item ${isSelected ? "selected" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(item.key);
                }}
              >
                <span className="lm-priority-dropdown-dot" style={{ background: item.color }} />
                <span className="lm-priority-dropdown-text">{item.label}</span>
                {isSelected && <Check size={14} className="lm-priority-dropdown-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="lm-stat" style={{ "--stat-color": color }}>
      <div className="lm-stat__icon"><Icon size={22} /></div>
      <div>
        <p className="lm-stat__val">{value ?? "—"}</p>
        <p className="lm-stat__lbl">{label}</p>
        {sub && <p className="lm-stat__sub">{sub}</p>}
      </div>
    </div>
  );
}

// ─── API layer ────────────────────────────────────────────────────────────────

const api = {
  list:       (p={}) => ax("get",  "/leads/",             null, { params: p }),
  get:        (id)   => ax("get",  `/leads/${id}/`),
  create:     (d)    => ax("post", "/leads/",             d),
  update:     (id,d) => ax("patch",`/leads/${id}/`,       d),
  remove:     (id)   => ax("delete",`/leads/${id}/`),
  dashboard:  (p={}) => ax("get",  "/lead-dashboard/",    null, { params: p }),
  reports:    (p={}) => ax("get",  "/lead-reports/",      null, { params: p }),
  myProfile:  (p={}) => ax("get",  "/lead-my-profile/",   null, { params: p }),
  myProposals:(p={}) => ax("get",  "/proposal/mine/",    null, { params: p }),
  proposalRequests:() => ax("get", "/proposal/requests/"),
  timeline:   (id)   => ax("get",  `/leads/${id}/timeline/`),
  calls:      (id)   => ax("get",  `/leads/${id}/calls/`),
  addCall:    (id,d) => ax("post", `/leads/${id}/calls/`, d),
  followUps:  (id)   => ax("get",  `/leads/${id}/follow-ups/`),
  addFollowUp:(id,d) => ax("post", `/leads/${id}/follow-ups/`, d),
  meetings:   (id)   => ax("get",  `/leads/${id}/meetings/`),
  addMeeting: (id,d) => ax("post", `/leads/${id}/meetings/`, d),
  allMeetings:(p={}) => ax("get",  "/leads/meetings/", null, { params: p }),
  transition: (id,stage,reason="") => ax("post",`/leads/${id}/transition/`, { target_stage: stage, reason }),
  qualify:    (id,reason="") => ax("post",`/leads/${id}/qualify/`, { reason }),
  reject:     (id,d) => ax("post", `/leads/${id}/reject/`, d),
  reopen:     (id,reason) => ax("post",`/leads/${id}/reopen/`, { reason }),
  sendEmail:  (id,d) => ax("post", `/leads/${id}/send-email/`, d),
  exportCsv:  (p={}) => ax("get",  "/lead-export/",       null, { params: p, responseType: "blob" }),
  importCsv:  (file, dryRun = false) => {
    const fd = new FormData(); fd.append("file", file); fd.append("mode", "leads");
    if (dryRun) fd.append("dry_run", "true");
    return ax("post", "/lead-import/", fd, { headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" } });
  },
  getTemplates:   ()      => ax("get",    "/leads/email-templates/"),
  createTemplate: (d)     => ax("post",   "/leads/email-templates/", d),
  updateTemplate: (id, d) => ax("put",    `/leads/email-templates/${id}/`, d),
  deleteTemplate: (id)    => ax("delete", `/leads/email-templates/${id}/`),
  getSmtp:        ()      => ax("get",    "/leads/email-smtp/"),
  saveSmtp:       (d)     => ax("post",   "/leads/email-smtp/", d),
  getAdvanced:    ()      => ax("get",    "/leads/email-advanced/"),
  saveAdvanced:   (d)     => ax("post",   "/leads/email-advanced/", d),
};

// ─── Lead Form ────────────────────────────────────────────────────────────────

function ContactNumbersInput({ value = [], onChange, label = "Contact Numbers" }) {
  const addNumber = () => onChange([...value, { number: "", contact_name: "", number_type: "PHONE", label: "COMPANY", is_primary: value.length === 0 }]);
  const removeNumber = (i) => onChange(value.filter((_, idx) => idx !== i));
  const updateNumber = (i, field, val) => {
    const updated = [...value];
    updated[i][field] = val;
    if (field === "is_primary" && val) {
      updated.forEach((n, idx) => { if (idx !== i) n.is_primary = false; });
    }
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, gridColumn: "1 / -1", border: "1px solid #e2e8f0", padding: 12, borderRadius: 8, background: "#f8fafc" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{label}</span>
        <button type="button" onClick={addNumber} className="lm-btn lm-btn--ghost lm-btn--sm" style={{ padding: "4px 8px" }}>
          <Plus size={14} /> Add Number
        </button>
      </div>
      {value.map((num, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={num.number_type} onChange={e => updateNumber(i, "number_type", e.target.value)} style={{ padding: "6px", border: "1px solid #cbd5e1", borderRadius: 4, width: 100, fontSize: 12 }}>
            <option value="PHONE">Phone</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
          <select value={num.label} onChange={e => updateNumber(i, "label", e.target.value)} style={{ padding: "6px", border: "1px solid #cbd5e1", borderRadius: 4, width: 110, fontSize: 12 }}>
            <option value="COMPANY">Company No.</option>
            <option value="PERSON">Person Name No.</option>
            <option value="OTHER">Other</option>
          </select>
          <input 
            type="text" 
            value={num.number} 
            onChange={e => updateNumber(i, "number", e.target.value)} 
            placeholder="+91 98765 43210" 
            style={{ flex: 1, minWidth: 140, padding: "6px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }} 
          />
          <input 
            type="text" 
            value={num.contact_name || ""} 
            onChange={e => updateNumber(i, "contact_name", e.target.value)} 
            placeholder="Contact Name (optional)" 
            style={{ flex: 1, minWidth: 140, padding: "6px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }} 
          />
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer", color: "#64748b" }}>
            <input type="radio" checked={num.is_primary} onChange={e => updateNumber(i, "is_primary", e.target.checked)} />
            Primary
          </label>
          <button type="button" onClick={() => removeNumber(i)} className="lm-icon-btn" style={{ color: "#ef4444" }} title="Remove number">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      {value.length === 0 && <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>No numbers added.</p>}
    </div>
  );
}

function LeadForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => Object.fromEntries(
    Object.entries(EMPTY_FORM).map(([field, fallback]) => [field, initial?.[field] ?? fallback])
  ));
  const [saving, setSaving] = useState(false);
  const { showAlert } = useModal();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, estimated_value: form.estimated_value === "" ? null : form.estimated_value };
    try {
      const res = initial?.id ? await api.update(initial.id, payload) : await api.create(payload);
      onSaved(res.data, !!initial?.id);
    } catch (err) {
      const d = err.response?.data;
      showAlert("Error", typeof d === "string" ? d : d?.detail || d?.non_field_errors?.[0] || "Failed to save.", "error");
    } finally { setSaving(false); }
  };

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-dialog" onClick={e => e.stopPropagation()}>
        <div className="lm-dialog__head">
          <h3>{initial?.id ? "Edit Lead" : "New Lead"}</h3>
          <button className="lm-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="lm-form" onSubmit={handleSubmit}>
          <div className="lm-form__grid">
            <label><span>Customer Name *</span>
              <input required value={form.customer_name} onChange={e => set("customer_name", e.target.value)} placeholder="Full name" /></label>
            <label><span>Contact Person</span>
              <input value={form.contact_person} onChange={e => set("contact_person", e.target.value)} /></label>
            <label><span>Company</span>
              <input value={form.company_name} onChange={e => set("company_name", e.target.value)} /></label>
            <label><span>Email</span>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} /></label>
            <ContactNumbersInput value={form.contact_numbers || []} onChange={val => set("contact_numbers", val)} />
            <label><span>Source</span>
              <select value={form.source} onChange={e => set("source", e.target.value)}>
                {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></label>
            <label><span>Lead Type</span>
              <select value={form.lead_type} onChange={e => set("lead_type", e.target.value)}>
                {Object.entries(LEAD_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></label>
            <label><span>Priority</span>
              <select value={form.priority} onChange={e => set("priority", e.target.value)}>
                {Object.entries(PRIORITY_META).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select></label>
            <label><span>Service / Product Interest</span>
              <input value={form.service} onChange={e => set("service", e.target.value)} placeholder="e.g. Ayurvedic ERP" /></label>
            <label><span>Estimated Value (₹)</span>
              <input type="number" min="0" step="0.01" value={form.estimated_value} onChange={e => set("estimated_value", e.target.value)} /></label>
            <label className="lm-form__span"><span>Requirement Summary</span>
              <textarea rows={3} value={form.requirement_summary} onChange={e => set("requirement_summary", e.target.value)} /></label>
          </div>
          <div className="lm-form__actions">
            <button type="button" className="lm-btn lm-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="lm-btn lm-btn--primary" disabled={saving}>
              {saving && <Loader2 size={15} className="spin" />}
              {saving ? "Saving…" : initial?.id ? "Update" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Log Call Modal ───────────────────────────────────────────────────────────

function LogCallModal({ lead, onClose, onLogged }) {
  const defaultFollowUp = new Date();
  defaultFollowUp.setDate(defaultFollowUp.getDate() + 1);
  defaultFollowUp.setMinutes(0, 0, 0);
  const formattedDefault = defaultFollowUp.toISOString().slice(0, 16);

  const [form, setForm] = useState({
    outcome: "CONNECTED",
    duration_seconds: "",
    discussion_summary: "",
    follow_up_required: false,
    next_follow_up_at: formattedDefault,
  });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const startedAt = new Date();
      const hasDuration = form.duration_seconds !== "";
      const durationSeconds = hasDuration ? Math.max(0, Number(form.duration_seconds)) * 60 : null;
      const payload = {
        outcome: form.outcome,
        started_at: startedAt.toISOString(),
        ended_at: durationSeconds !== null ? new Date(startedAt.getTime() + durationSeconds * 1000).toISOString() : null,
        discussion_summary: form.discussion_summary || "",
        follow_up_required: form.follow_up_required,
        follow_up_at: form.follow_up_required && form.next_follow_up_at ? new Date(form.next_follow_up_at).toISOString() : null,
      };
      const res = await api.addCall(lead.id, payload);
      onClose();
      showAlert("Call Logged", "Call activity recorded successfully!", "success", () => {
        onLogged(res.data);
      });
    } catch (err) {
      const data = err.response?.data;
      const message = data?.detail || data?.non_field_errors?.[0]
        || Object.values(data || {}).flat()?.[0] || "Failed to save the call. Nothing was recorded.";
      showAlert("Call Not Saved", String(message), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-dialog lm-dialog--sm" onClick={e => e.stopPropagation()}>
        <div className="lm-dialog__head">
          <h3>Log Call — {lead.customer_name}</h3>
          <button className="lm-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="lm-form" onSubmit={handleSubmit}>
          <div className="lm-form__grid">
            <label className="lm-form__span"><span>Outcome *</span>
              <select value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}>
                {CALL_OUTCOMES.map(o => <option key={o} value={o}>{o.replace(/_/g," ")}</option>)}
              </select>
            </label>
            <label><span>Duration (minutes)</span>
              <input
                type="text"
                inputMode="decimal"
                value={form.duration_seconds}
                onChange={e => {
                  const [first, ...rest] = e.target.value.replace(/[^\d.]/g, "").split(".");
                  const value = rest.length ? `${first}.${rest.join("")}` : first;
                  setForm(f => ({ ...f, duration_seconds: value }));
                }}
                onBlur={() => setForm(f => ({
                  ...f,
                  duration_seconds: f.duration_seconds === "" ? "" : String(Math.max(0, Number(f.duration_seconds) || 0)),
                }))}
              />
            </label>
            <label className="lm-form__span"><span>Discussion Notes</span>
              <textarea rows={3} value={form.discussion_summary} onChange={e => setForm(f => ({ ...f, discussion_summary: e.target.value }))} />
            </label>
            <label className="lm-form__span lm-form__check">
              <input type="checkbox" checked={form.follow_up_required} onChange={e => setForm(f => ({ ...f, follow_up_required: e.target.checked }))} />
              <span>Follow-up required</span>
            </label>
            {form.follow_up_required && (
              <label className="lm-form__span">
                <span>Next Scheduled Date & Time *</span>
                <input
                  type="datetime-local"
                  required
                  value={form.next_follow_up_at}
                  onChange={e => setForm(f => ({ ...f, next_follow_up_at: e.target.value }))}
                />
              </label>
            )}
          </div>
          <div className="lm-form__actions">
            <button type="button" className="lm-btn lm-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="lm-btn lm-btn--primary" disabled={saving}>
              {saving && <Loader2 size={15} className="spin" />} Log Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Schedule Follow-up Modal ─────────────────────────────────────────────────

function ScheduleFollowUpModal({ lead, onClose, onScheduled, initialDateTime, callMode = false, existingFollowUp = null }) {
  const today = new Date(); today.setDate(today.getDate() + 1); today.setHours(10, 0, 0, 0);
  const existingScheduledAt = existingFollowUp?.scheduled_at ? new Date(existingFollowUp.scheduled_at) : null;
  const safeExistingDateTime = existingScheduledAt && existingScheduledAt > new Date()
    ? localDateTimeInputValue(existingScheduledAt)
    : null;
  const [form, setForm] = useState({
    follow_up_type: "PHONE",
    scheduled_at: safeExistingDateTime || initialDateTime || localDateTimeInputValue(today),
    purpose: existingFollowUp?.purpose || (callMode ? "Scheduled telecalling call" : "Follow up with lead"),
    notes: existingFollowUp?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const scheduledAt = form.scheduled_at ? new Date(form.scheduled_at) : new Date();
      const scheduledAtIso = scheduledAt.toISOString();
      if (FOLLOW_UP_TYPES_ROUTED_TO_MEETINGS.has(form.follow_up_type)) {
        const scheduledEnd = new Date(scheduledAt.getTime() + 60 * 60 * 1000);
        const meetingType = form.follow_up_type === "DEMO" && lead.lead_type !== "PRODUCT"
          ? "PRODUCT_DISCUSSION"
          : FOLLOW_UP_TO_MEETING_TYPE[form.follow_up_type];
        const res = await api.addMeeting(lead.id, {
          title: form.purpose || `${compactLabel(form.follow_up_type)} meeting`,
          meeting_type: meetingType,
          meeting_mode: FOLLOW_UP_TO_MEETING_MODE[form.follow_up_type] || "ONLINE",
          scheduled_start: scheduledAtIso,
          scheduled_end: scheduledEnd.toISOString(),
          agenda: form.purpose || "",
          notes: form.notes || "",
          status: "SCHEDULED",
        });
        if (existingFollowUp?.id) {
          await api.addFollowUp(lead.id, {
            id: existingFollowUp.id,
            status: "CANCELLED",
            result: "Moved to meetings",
          });
        }
        onScheduled(res.data);
        if (res.data?.booking_warning?.message) {
          showAlert("Time Already Booked", res.data.booking_warning.message, "warning");
        } else {
          showAlert("Meeting Scheduled", "This item was moved to the Meetings section.", "success");
        }
      } else {
        const res = await api.addFollowUp(lead.id, {
          ...form,
          ...(existingFollowUp?.id ? { id: existingFollowUp.id, status: "SCHEDULED" } : {}),
          scheduled_at: scheduledAtIso
        });
        onScheduled(res.data);
        showAlert("Follow-Up Scheduled", "Follow-up reminder set successfully!", "success");
      }
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const message = data?.detail || data?.non_field_errors?.[0]
        || Object.values(data || {}).flat()?.[0] || "Failed to save the schedule. Nothing was scheduled.";
      showAlert("Schedule Not Saved", String(message), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-dialog lm-dialog--sm" onClick={e => e.stopPropagation()}>
        <div className="lm-dialog__head">
          <h3>{existingFollowUp ? "Reschedule Call" : callMode ? "Schedule Call" : "Schedule Follow-Up"}</h3>
          <button type="button" className="lm-icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="lm-form" onSubmit={handleSubmit}>
          <div className="lm-form__grid">
            <label><span>Type</span>
              <select value={form.follow_up_type} onChange={e => setForm(f => ({ ...f, follow_up_type: e.target.value }))}>
                {FOLLOW_UP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select></label>
            <label><span>Scheduled At *</span>
              <input type="datetime-local" min={callMode ? localDateTimeInputValue(new Date()) : undefined} required value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} /></label>
            <label className="lm-form__span"><span>Purpose *</span>
              <input required value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} /></label>
            <label className="lm-form__span"><span>Notes</span>
              <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></label>
          </div>
          <div className="lm-form__actions">
            <button type="button" className="lm-btn lm-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="lm-btn lm-btn--primary" disabled={saving}>
              {saving && <Loader2 size={15} className="spin" />} Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Lead Detail Panel ────────────────────────────────────────────────────────

function MeetingFormModal({ leadOptions = [], initialMeeting = null, initialLeadId = "", onClose, onSaved }) {
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1);
  defaultStart.setHours(10, 0, 0, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 30 * 60 * 1000);
  const [form, setForm] = useState(() => ({
    lead_id: initialMeeting?.lead_id || initialLeadId || leadOptions[0]?.id || "",
    title: initialMeeting?.title || "",
    meeting_type: initialMeeting?.meeting_type || "FOLLOW_UP",
    meeting_mode: initialMeeting?.meeting_mode || "ONLINE",
    scheduled_start: initialMeeting?.scheduled_start ? localDateTimeInputValue(new Date(initialMeeting.scheduled_start)) : localDateTimeInputValue(defaultStart),
    scheduled_end: initialMeeting?.scheduled_end ? localDateTimeInputValue(new Date(initialMeeting.scheduled_end)) : localDateTimeInputValue(defaultEnd),
    location: initialMeeting?.location || "",
    map_link: initialMeeting?.map_link || "",
    meeting_link: initialMeeting?.meeting_link || "",
    attendees: Array.isArray(initialMeeting?.attendees) ? initialMeeting.attendees.join(", ") : "",
    agenda: initialMeeting?.agenda || "",
    notes: initialMeeting?.notes || "",
    status: initialMeeting?.status || "SCHEDULED",
    outcome: initialMeeting?.outcome || "",
  }));
  const [saving, setSaving] = useState(false);
  const { showAlert } = useModal();
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const selectedLead = useMemo(
    () => leadOptions.find(lead => String(lead.id) === String(form.lead_id)) || null,
    [leadOptions, form.lead_id]
  );
  const mapQuery = [
    form.location,
    selectedLead?.address,
    selectedLead?.company_name || selectedLead?.customer_name || selectedLead?.contact_person,
  ].filter(Boolean).join(", ");
  const mapPreviewTarget = form.map_link.trim() || mapQuery || "Kerala";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapPreviewTarget)}&output=embed`;
  const mapOpenUrl = form.map_link.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || "Kerala")}`;
  const openDirectionsFromCurrentLocation = () => {
    if (!navigator?.geolocation) {
      showAlert("Location Not Available", "Your browser does not support current location.", "warning");
      return;
    }
    if (!mapQuery && !form.map_link.trim()) {
      showAlert("Location Required", "Enter a location or paste a map link first.", "warning");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const destination = form.map_link.trim() || mapQuery;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${coords.latitude},${coords.longitude}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      () => showAlert("Location Blocked", "Allow location access to get directions from your current place.", "warning"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.lead_id) {
      showAlert("Required", "Choose a lead for this meeting.", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(initialMeeting?.id ? { id: initialMeeting.id } : {}),
        title: form.title.trim(),
        meeting_type: form.meeting_type,
        meeting_mode: form.meeting_mode,
        scheduled_start: new Date(form.scheduled_start).toISOString(),
        scheduled_end: new Date(form.scheduled_end).toISOString(),
        location: form.location.trim(),
        map_link: form.map_link.trim(),
        meeting_link: form.meeting_link.trim(),
        attendees: form.attendees.split(",").map(item => item.trim()).filter(Boolean),
        agenda: form.agenda.trim(),
        notes: form.notes.trim(),
        status: form.status,
        outcome: form.outcome.trim(),
      };
      const res = await api.addMeeting(form.lead_id, payload);
      onSaved?.(res.data);
    } catch (err) {
      const data = err.response?.data;
      const message = data?.detail || data?.non_field_errors?.[0] || Object.values(data || {}).flat()?.[0] || "Failed to save meeting.";
      showAlert("Meeting Not Saved", String(message), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-dialog lm-dialog--meeting" onClick={event => event.stopPropagation()}>
        <div className="lm-dialog__head">
          <h3>{initialMeeting?.id ? "Edit Meeting" : "Schedule Meeting"}</h3>
          <button type="button" className="lm-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="lm-form lm-meeting-form" onSubmit={handleSubmit}>
          <div className="lm-meeting-form__body">
            <div className="lm-form__grid lm-meeting-form__fields">
              <label className="lm-form__span"><span>Lead *</span>
                <select required value={form.lead_id} onChange={event => set("lead_id", event.target.value)} disabled={Boolean(initialMeeting?.id)}>
                  <option value="">Choose lead</option>
                  {leadOptions.map(lead => <option key={lead.id} value={lead.id}>{lead.company_name || lead.customer_name || lead.contact_person || lead.lead_number}</option>)}
                </select>
              </label>
              <label className="lm-form__span"><span>Meeting Title *</span>
                <input required value={form.title} onChange={event => set("title", event.target.value)} placeholder="e.g. Requirement discussion" />
              </label>
              <label><span>Type</span><select value={form.meeting_type} onChange={event => set("meeting_type", event.target.value)}>{Object.entries(MEETING_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label><span>Mode</span><select value={form.meeting_mode} onChange={event => set("meeting_mode", event.target.value)}>{Object.entries(MEETING_MODES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label><span>Start *</span><input type="datetime-local" required value={form.scheduled_start} onChange={event => set("scheduled_start", event.target.value)} /></label>
              <label><span>End *</span><input type="datetime-local" required value={form.scheduled_end} onChange={event => set("scheduled_end", event.target.value)} /></label>
              <label><span>Status</span><select value={form.status} onChange={event => set("status", event.target.value)}>{Object.entries(MEETING_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label><span>Location</span><input value={form.location} onChange={event => set("location", event.target.value)} placeholder="Office, customer site, etc." /></label>
              <label className="lm-form__span"><span>Meeting Link</span><input type="url" value={form.meeting_link} onChange={event => set("meeting_link", event.target.value)} placeholder="https://meet.google.com/..." /></label>
              <label className="lm-form__span"><span>Attendees</span><input value={form.attendees} onChange={event => set("attendees", event.target.value)} placeholder="Comma separated names or emails" /></label>
              <label className="lm-form__span"><span>Agenda</span><textarea rows={3} value={form.agenda} onChange={event => set("agenda", event.target.value)} /></label>
              <label className="lm-form__span"><span>Notes</span><textarea rows={3} value={form.notes} onChange={event => set("notes", event.target.value)} /></label>
              <label className="lm-form__span"><span>Outcome</span><textarea rows={2} value={form.outcome} onChange={event => set("outcome", event.target.value)} /></label>
            </div>
            <aside className="lm-meeting-form__map">
              <div className="lm-meeting-form__map-head">
                <span>Location Map</span>
                <a href={mapOpenUrl} target="_blank" rel="noreferrer">Open map</a>
              </div>
              <label className="lm-meeting-form__map-link">
                <span>Map Link</span>
                <input type="url" value={form.map_link} onChange={event => set("map_link", event.target.value)} placeholder="Paste Google Maps link" />
              </label>
              <button type="button" className="lm-meeting-form__directions" onClick={openDirectionsFromCurrentLocation}>
                <Maximize2 size={14} /> From current location
              </button>
              <iframe
                title="Meeting location map"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <p>{form.map_link.trim() || mapQuery || "Enter a location or paste a map link to preview the meeting place."}</p>
            </aside>
          </div>
          <div className="lm-form__actions">
            <button type="button" className="lm-btn lm-btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="lm-btn lm-btn--primary" disabled={saving}>{saving && <Loader2 size={15} className="spin" />} Save Meeting</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LeadDetailPanel({ lead: initialLead, onClose, onEdit, onRefresh }) {
  const [lead, setLead] = useState(initialLead);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeline, setTimeline] = useState([]);
  const [calls, setCalls] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const { showAlert } = useModal();
  const { hasPermission } = useAuth();
  const leadMapQuery = [
    lead.address,
    lead.company_name || lead.customer_name || lead.contact_person,
  ].filter(Boolean).join(", ");

  const loadTabData = useCallback(async (tab) => {
    setLoadingData(true);
    try {
      if (tab === "timeline") {
        const r = await api.timeline(lead.id);
        setTimeline(r.data.results || r.data);
      } else if (tab === "calls") {
        const r = await api.calls(lead.id);
        setCalls(r.data.results || r.data);
      } else if (tab === "followups") {
        const r = await api.followUps(lead.id);
        setFollowUps(r.data.results || r.data);
      } else if (tab === "meetings") {
        const r = await api.meetings(lead.id);
        setMeetings(r.data.results || r.data);
      }
    } catch { /* silent */ }
    finally { setLoadingData(false); }
  }, [lead.id]);

  useEffect(() => { loadTabData(activeTab); }, [activeTab, loadTabData]);

  const handleTransition = async (stage) => {
    setTransitioning(true);
    try {
      const res = await api.transition(lead.id, stage);
      setLead(res.data);
      onRefresh?.();
      showAlert("Stage Updated", `Lead moved to ${STAGE_META[stage]?.label || stage}`, "success");
    } catch (err) {
      showAlert("Error", err.response?.data?.errors?.[0] || err.response?.data?.error || "Transition failed.", "error");
    } finally { setTransitioning(false); }
  };

  const nextStages = (lead.allowed_transitions || []).filter(
    stage => !["REJECTED", "CONVERTED"].includes(stage)
  );
  const holdActionStage = lead.current_stage === "ON_HOLD"
    ? nextStages[0]
    : (nextStages.includes("ON_HOLD") ? "ON_HOLD" : "");
  const holdActionLabel = lead.current_stage === "ON_HOLD" ? "Unhold" : "Hold";

  const TABS = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "meetings", label: "Meetings", icon: Users },
    { id: "calls", label: "Calls", icon: PhoneCall },
    { id: "followups", label: "Follow-ups", icon: Clock },
    { id: "timeline", label: "Timeline", icon: BarChart2 },
  ];

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-dialog lm-dialog--wide" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="lm-dialog__head lm-detail__head">
          <div>
            <h3>{lead.customer_name || lead.company_name}</h3>
            <div className="lm-detail__meta">
              <code className="lm-lead-no">{lead.lead_number}</code>
              <StagePill stage={lead.current_stage} />
              <PrioritySelector
                priority={lead.priority}
                onChange={async (newPriority) => {
                  try {
                    await api.update(lead.id, { priority: newPriority });
                    setLead(prev => ({ ...prev, priority: newPriority }));
                    onRefresh?.();
                  } catch (err) {
                    const d = err.response?.data;
                    showAlert("Error", typeof d === "string" ? d : d?.detail || "Failed to update priority.", "error");
                  }
                }}
              />
            </div>
          </div>
          <div className="lm-detail__headbtn">
            {hasPermission("lead.edit") && <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => { onClose(); onEdit(lead); }}>
              <Edit2 size={14} /> Edit
            </button>}
            {hasPermission("lead.call") && <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => setShowCallModal(true)}>
              <PhoneCall size={14} /> Log Call
            </button>}
            {hasPermission("lead.follow_up") && <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => setShowFollowUpModal(true)}>
              <Clock size={14} /> Follow-Up
            </button>}
            <button className="lm-icon-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {/* Workflow Actions */}
        {holdActionStage && (
          <div className="lm-workflow-bar">
            <span>Status action:</span>
            <button
              className="lm-btn lm-btn--stage"
              style={{ "--stage-c": STAGE_META.ON_HOLD.color }}
              disabled={transitioning}
              onClick={() => handleTransition(holdActionStage)}
            >
              {transitioning ? <Loader2 size={13} className="spin" /> : null}
              {holdActionLabel}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="lm-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`lm-tab ${activeTab === id ? "lm-tab--active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="lm-tab-body">
          {loadingData && activeTab !== "overview" ? (
            <div className="lm-center-state"><Loader2 size={24} className="spin" /></div>
          ) : null}

          {activeTab === "overview" && (
            <div className="lm-detail-grid">
              <section className="lm-detail-section">
                <h4>Contact</h4>
                <dl>
                  <dt>Contact Person</dt><dd>{lead.contact_person || "—"}</dd>
                  <dt>Company</dt><dd>{lead.company_name || "—"}</dd>
                  <dt>Email</dt><dd>{lead.email || "—"}</dd>
                  <dt>Phone</dt><dd>{lead.phone || "—"}</dd>
                </dl>
              </section>
              <section className="lm-detail-section">
                <h4>Opportunity</h4>
                <dl>
                  <dt>Type</dt><dd>{LEAD_TYPES[lead.lead_type] || lead.lead_type}</dd>
                  <dt>Source</dt><dd>{SOURCE_LABELS[lead.source] || lead.source}</dd>
                  <dt>Service</dt><dd>{lead.service || lead.product || "—"}</dd>
                  <dt>Est. Value</dt><dd>{fmt(lead.estimated_value)}</dd>
                  <dt>Next Follow-Up</dt>
                  <dd className={isOverdue(lead.next_follow_up_at) ? "lm-overdue" : ""}>
                    {fmtDateTime(lead.next_follow_up_at)}
                  </dd>
                  <dt>Created</dt><dd>{fmtDate(lead.created_at)}</dd>
                </dl>
              </section>
              {lead.requirement_summary && (
                <section className="lm-detail-section lm-detail-section--full">
                  <h4>Requirement Summary</h4>
                  <p className="lm-detail-summary">{lead.requirement_summary}</p>
                </section>
              )}
            </div>
          )}

          {activeTab === "meetings" && !loadingData && (
            <div className="lm-activity-list">
              {meetings.length === 0 ? <p className="lm-muted">No meetings scheduled yet.</p> : meetings.map(meeting => {
                const meetingMapUrl = meeting.map_link || (meeting.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting.location)}` : "");
                const meetingMapTarget = meeting.map_link || meeting.location || leadMapQuery || "Kerala";
                const meetingMapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(meetingMapTarget)}&output=embed`;
                return (
                  <div key={meeting.id} className={`lm-activity-item ${meeting.is_overdue ? "lm-activity-item--overdue" : ""}`}>
                    <div className={`lm-activity-icon ${meeting.status === "COMPLETED" ? "lm-activity-icon--green" : "lm-activity-icon--blue"}`}>
                      {meeting.status === "COMPLETED" ? <CheckCircle2 size={15} /> : <Users size={15} />}
                    </div>
                    <div className="lm-activity-item__content">
                      <div className="lm-activity-item__head">
                        <strong>{meeting.title || compactLabel(meeting.meeting_type) || "Meeting"}</strong>
                        <span className="lm-pill lm-pill--sm" style={{ "--pill-color": meeting.status === "COMPLETED" ? "#16a34a" : "#6366f1" }}>
                          {MEETING_STATUSES[meeting.status] || compactLabel(meeting.status)}
                        </span>
                      </div>
                      <p className="lm-activity-item__note">
                        {[MEETING_TYPES[meeting.meeting_type] || compactLabel(meeting.meeting_type), MEETING_MODES[meeting.meeting_mode] || compactLabel(meeting.meeting_mode), meeting.location].filter(Boolean).join(" · ")}
                      </p>
                      {(meeting.agenda || meeting.notes || meeting.outcome) && <p className="lm-activity-item__note">{meeting.agenda || meeting.notes || meeting.outcome}</p>}
                      <time className="lm-activity-item__time">Scheduled: {fmtDateTime(meeting.scheduled_start)} - {fmtDateTime(meeting.scheduled_end)}</time>
                      {(meeting.meeting_link || meetingMapUrl) && (
                        <div className="lm-activity-item__actions">
                          {meeting.meeting_link && <a className="lm-btn lm-btn--primary lm-btn--sm" href={meeting.meeting_link} target="_blank" rel="noreferrer"><Maximize2 size={14} /> Join</a>}
                          {meetingMapUrl && <a className="lm-btn lm-btn--ghost lm-btn--sm" href={meetingMapUrl} target="_blank" rel="noreferrer"><Maximize2 size={14} /> Map</a>}
                        </div>
                      )}
                      <div className="lm-meeting-inline-map">
                        <iframe
                          title={`Meeting map for ${meeting.title || "lead meeting"}`}
                          src={meetingMapSrc}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                        <p>{meeting.location || leadMapQuery || "No meeting location available."}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "calls" && !loadingData && (
            <div className="lm-activity-list">
              {calls.length === 0 ? <p className="lm-muted">No calls recorded yet.</p> : calls.map(c => (
                <div key={c.id} className="lm-activity-item">
                  <div className={`lm-activity-icon ${c.outcome === "CONNECTED" || c.outcome === "INTERESTED" ? "lm-activity-icon--green" : "lm-activity-icon--red"}`}>
                    {c.outcome === "NO_ANSWER" ? <PhoneMissed size={15} /> : <Phone size={15} />}
                  </div>
                  <div className="lm-activity-item__content">
                    <div className="lm-activity-item__head">
                      <strong>{compactLabel(c.outcome) || c.outcome?.replace(/_/g, " ")}</strong>
                      {c.duration_seconds ? <span className="lm-muted"> · {Math.round(c.duration_seconds / 60)}m</span> : null}
                    </div>
                    {c.discussion_summary && <p className="lm-activity-item__note">{c.discussion_summary}</p>}
                    <time className="lm-activity-item__time">{fmtDateTime(c.created_at)}</time>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "followups" && !loadingData && (
            <div className="lm-activity-list">
              {followUps.length === 0 ? <p className="lm-muted">No follow-ups yet.</p> : followUps.map(f => (
                <div key={f.id} className={`lm-activity-item ${isOverdue(f.scheduled_at) && f.status !== "COMPLETED" ? "lm-activity-item--overdue" : ""}`}>
                  <div className={`lm-activity-icon ${f.status === "COMPLETED" ? "lm-activity-icon--green" : "lm-activity-icon--blue"}`}>
                    {f.status === "COMPLETED" ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  </div>
                  <div className="lm-activity-item__content">
                    <div className="lm-activity-item__head">
                      <strong>{compactLabel(f.follow_up_type) || f.follow_up_type} Follow-Up</strong>
                      <span className="lm-pill lm-pill--sm" style={{ "--pill-color": f.status === "COMPLETED" ? "#16a34a" : "#f59e0b" }}>
                        {compactLabel(f.status) || f.status}
                      </span>
                    </div>
                    {f.notes && <p className="lm-activity-item__note">{f.notes}</p>}
                    <time className="lm-activity-item__time">Scheduled: {fmtDateTime(f.scheduled_at)}</time>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "timeline" && !loadingData && (
            <ul className="lm-tl-list">
              {timeline.length === 0 ? <p className="lm-muted">No activity yet.</p> : timeline.map(a => (
                <li key={a.id} className="lm-tl-item">
                  <span className="lm-tl-dot" />
                  <div>
                    <strong>{a.title}</strong>
                    {a.description && <p className="lm-muted">{a.description}</p>}
                    <time className="lm-muted">{fmtDateTime(a.created_at)}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showCallModal && <LogCallModal lead={lead} onClose={() => setShowCallModal(false)} onLogged={(newCall) => { setCalls(prev => [newCall, ...prev]); loadTabData("calls"); }} />}
      {showFollowUpModal && <ScheduleFollowUpModal lead={lead} onClose={() => setShowFollowUpModal(false)} onScheduled={(newFup) => { setFollowUps(prev => [newFup, ...prev]); loadTabData("followups"); }} />}
    </div>
  );
}

const reportLabel = value => String(value || "Unspecified").toLowerCase().replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());

const activityPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "end-gap", totalPages];
  if (currentPage >= totalPages - 3) return [1, "start-gap", ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)];
  return [1, "start-gap", currentPage - 1, currentPage, currentPage + 1, "end-gap", totalPages];
};

function EmployeePerformanceReport({ report: initialReport, person, recentActivity, openLead }) {
  const [report, setReport] = useState(initialReport || {});
  const initialFilters = initialReport?.applied_filters || {};
  const [filters, setFilters] = useState({
    start: initialFilters.start || localDateInputValue(new Date(Date.now() - 29 * 86400000)),
    end: initialFilters.end || localDateInputValue(),
    company: initialFilters.company || "",
    stage: initialFilters.stage || "",
    activityType: initialFilters.activity_type || "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [reportLoading, setReportLoading] = useState(false);
  const [exporting, setExporting] = useState("");
  const [reportError, setReportError] = useState("");
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);

  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
      setActivityPage(1);
    }
  }, [initialReport]);

  const loadReport = async (nextFilters) => {
    setReportLoading(true);
    setReportError("");
    try {
      const response = await api.myProfile({
        page: 1, page_size: 1,
        report_start: nextFilters.start,
        report_end: nextFilters.end,
        report_company: nextFilters.company || undefined,
        report_stage: nextFilters.stage || undefined,
        report_activity_type: nextFilters.activityType || undefined,
      });
      setReport(response.data.performance_report || {});
      setAppliedFilters(nextFilters);
      setActivityPage(1);
    } catch (error) {
      setReportError(error.response?.data?.error || "The report could not be filtered. Please review the selected values.");
    } finally {
      setReportLoading(false);
    }
  };
  const applyFilters = (event) => { event.preventDefault(); loadReport({ ...filters }); };
  const resetFilters = () => {
    const reset = { start: localDateInputValue(new Date(Date.now() - 29 * 86400000)), end: localDateInputValue(), company: "", stage: "", activityType: "" };
    setFilters(reset);
    loadReport(reset);
  };
  const filterOptions = report?.filter_options || initialReport?.filter_options || {};
  const exportRows = report?.activities || recentActivity || [];
  const activityTotalPages = Math.max(1, Math.ceil(exportRows.length / activityPageSize));
  const activityStartIndex = (activityPage - 1) * activityPageSize;
  const visibleActivityRows = exportRows.slice(activityStartIndex, activityStartIndex + activityPageSize);
  const visibleActivityStart = exportRows.length ? activityStartIndex + 1 : 0;
  const visibleActivityEnd = Math.min(activityStartIndex + activityPageSize, exportRows.length);
  const activityPaginationItems = activityPageItems(activityPage, activityTotalPages);

  useEffect(() => {
    setActivityPage(current => Math.min(Math.max(current, 1), activityTotalPages));
  }, [activityTotalPages]);

  const changeActivityPageSize = (event) => {
    setActivityPageSize(Number(event.target.value));
    setActivityPage(1);
  };
  const activeFilterLabels = [
    appliedFilters.company,
    appliedFilters.stage && (STAGE_META[appliedFilters.stage]?.label || reportLabel(appliedFilters.stage)),
    appliedFilters.activityType && reportLabel(appliedFilters.activityType),
  ].filter(Boolean);
  const fullFilterText = `${fmtDate(appliedFilters.start)} to ${fmtDate(appliedFilters.end)} · ${activeFilterLabels.join(" · ") || "All companies, stages and activity types"}`;
  const hasReportData = (report?.leads?.length || 0) > 0 || exportRows.length > 0;
  const safeFilename = `${person.fullname || person.username || "employee"}-${appliedFilters.start}-${appliedFilters.end}`
    .toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");

  const exportPdf = async () => {
    setExporting("pdf"); setReportError("");
    try {
      const [pdfModule, tableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
      const JsPDF = pdfModule.jsPDF || pdfModule.default;
      const autoTable = tableModule.default || tableModule.autoTable;
      const doc = new JsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      doc.setTextColor(15, 23, 42); doc.setFontSize(18); doc.text("Employee Performance Report", 36, 38);
      doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      doc.text(`${person.fullname || person.username || "Employee"}  |  ${fmtDate(report.period?.start)} - ${fmtDate(report.period?.end)}`, 36, 56);
      doc.text(`Filters: ${activeFilterLabels.join(" | ") || "All companies, stages and activity types"}`, 36, 72);
      autoTable(doc, { startY: 88, theme: "grid", head: [["Total leads", "Converted", "Conversion rate", "Calls", "Emails", "Meetings", "Pending workload"]], body: [[summary.total_leads || 0, summary.converted_leads || 0, `${summary.conversion_rate || 0}%`, engagement.calls || 0, engagement.emails || 0, engagement.meetings || 0, pendingTotal]], headStyles: { fillColor: [79, 70, 229] }, styles: { fontSize: 9 } });
      autoTable(doc, { startY: doc.lastAutoTable.finalY + 16, head: [["Stage", "Leads"]], body: stageData.map(row => [row.name, row.value]), headStyles: { fillColor: [51, 65, 85] }, styles: { fontSize: 8 }, tableWidth: 230 });
      autoTable(doc, { startY: doc.lastAutoTable.finalY + 12, head: [["Activity type", "Activities"]], body: (report.activity_breakdown || []).map(row => [reportLabel(row.activity_type), row.count]), headStyles: { fillColor: [79, 70, 229] }, styles: { fontSize: 8 }, tableWidth: 230 });
      autoTable(doc, { startY: doc.lastAutoTable.finalY + 16, head: [["Timestamp", "Lead", "Type", "Activity", "Details"]], body: exportRows.map(row => [fmtDateTime(row.created_at), row.lead_name || "-", reportLabel(row.type), row.title || "-", row.description || "-"]), headStyles: { fillColor: [79, 70, 229] }, styles: { fontSize: 7, cellPadding: 3 }, columnStyles: { 4: { cellWidth: 260 } } });
      doc.save(`${safeFilename || "employee-report"}.pdf`);
    } catch (error) { setReportError("PDF download failed. Please try again."); }
    finally { setExporting(""); }
  };

  const exportExcel = async () => {
    setExporting("excel"); setReportError("");
    try {
      const [excelModule, saverModule] = await Promise.all([import("exceljs"), import("file-saver")]);
      const ExcelJS = excelModule.default || excelModule;
      const saveAs = saverModule.saveAs || saverModule.default?.saveAs || saverModule.default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Adstra Digital"; workbook.created = new Date();
      const styleSheet = (sheet) => {
        sheet.views = [{ state: "frozen", ySplit: 1 }];
        sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
        sheet.getRow(1).height = 24; sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + Math.min(sheet.columnCount, 26))}1` };
      };
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.columns = [{ header: "Metric", key: "metric", width: 28 }, { header: "Value", key: "value", width: 36 }];
      [
        ["Employee", person.fullname || person.username || "Employee"], ["Period", `${report.period?.start} to ${report.period?.end}`],
        ["Company / lead", appliedFilters.company || "All"], ["Lead stage", appliedFilters.stage ? reportLabel(appliedFilters.stage) : "All"],
        ["Activity type", appliedFilters.activityType ? reportLabel(appliedFilters.activityType) : "All"], ["Total leads", summary.total_leads || 0],
        ["Converted leads", summary.converted_leads || 0], ["Conversion rate", `${summary.conversion_rate || 0}%`], ["Calls", engagement.calls || 0],
        ["Emails", engagement.emails || 0], ["Meetings", engagement.meetings || 0], ["Pending workload", pendingTotal],
      ].forEach(([metric, value]) => summarySheet.addRow({ metric, value })); 
      
      const addSection = (title, items) => {
        if (!items || !items.length) return;
        summarySheet.addRow({ metric: "", value: "" });
        const header = summarySheet.addRow({ metric: `--- ${title} ---`, value: "" });
        header.font = { bold: true, color: { argb: "FF4F46E5" } };
        items.forEach(item => summarySheet.addRow({ metric: item.label || item.name, value: item.count !== undefined ? item.count : item.value }));
      };
      addSection("Pipeline Stages", stageData);
      breakdowns.forEach(b => addSection(b.title, b.rows));
      styleSheet(summarySheet);

      const leadsSheet = workbook.addWorksheet("Leads");
      leadsSheet.columns = [
        { header: "Lead #", key: "lead_number", width: 20 }, { header: "Company", key: "company_name", width: 28 }, { header: "Customer", key: "customer_name", width: 28 },
        { header: "Stage", key: "stage", width: 24 }, { header: "Priority", key: "priority", width: 14 }, { header: "Source", key: "source", width: 18 },
        { header: "Service", key: "service", width: 22 }, { header: "Product", key: "product", width: 22 }, { header: "Estimated value", key: "estimated_value", width: 18 }, { header: "Created", key: "created_at", width: 22 },
      ]; (report.leads || []).forEach(row => leadsSheet.addRow(row)); styleSheet(leadsSheet);
      const activitySheet = workbook.addWorksheet("Activity");
      activitySheet.columns = [{ header: "Timestamp", key: "created_at", width: 22 }, { header: "Lead", key: "lead_name", width: 32 }, { header: "Type", key: "type", width: 18 }, { header: "Activity", key: "title", width: 30 }, { header: "Details", key: "description", width: 48 }];
      exportRows.forEach(row => activitySheet.addRow(row)); styleSheet(activitySheet);
      const dailySheet = workbook.addWorksheet("Daily Activity");
      dailySheet.columns = ["date", "calls", "emails", "meetings", "tasks", "other", "total"].map(key => ({ header: reportLabel(key), key, width: key === "date" ? 16 : 13 }));
      (report.daily_activity || []).forEach(row => dailySheet.addRow(row)); styleSheet(dailySheet);
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${safeFilename || "employee-report"}.xlsx`);
    } catch (error) { setReportError("Excel download failed. Please try again."); }
    finally { setExporting(""); }
  };

  const summary = report?.summary || {};
  const engagement = report?.engagement || {};
  const workload = report?.workload || {};
  const targets = report?.targets || {};
  const stageData = (report?.stage_distribution || []).map(item => ({ name: STAGE_META[item.current_stage]?.label || reportLabel(item.current_stage), value: Number(item.count) || 0, color: STAGE_META[item.current_stage]?.color || "#64748b" }));
  const trendData = (report?.daily_activity || []).map(item => ({ ...item, label: String(item.date || "").slice(5) }));
  const breakdowns = [
    { title: "Activity by type", rows: (report?.activity_breakdown || []).map(item => ({ key: item.activity_type, label: reportLabel(item.activity_type), count: item.count })), color: "#4f46e5", empty: "No employee activity has been recorded." },
    { title: "Lead priority", rows: (report?.priority_distribution || []).map(item => ({ key: item.priority, label: PRIORITY_META[item.priority]?.label || reportLabel(item.priority), count: item.count, color: PRIORITY_META[item.priority]?.color })), color: "#f59e0b", empty: "No lead priorities to report." },
    { title: "Lead sources", rows: (report?.source_distribution || []).map(item => ({ key: item.source || "unspecified", label: SOURCE_LABELS[item.source] || reportLabel(item.source), count: item.count })), color: "#0891b2", empty: "No lead sources to report." },
    { title: "Call outcomes", rows: (report?.call_outcomes || []).map(item => ({ key: item.outcome, label: reportLabel(item.outcome), count: item.count })), color: "#16a34a", empty: "No calls logged yet. Outcomes will appear after the first call." },
  ];
  const trendTotal = trendData.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const pendingTotal = (Number(workload.pending_follow_ups) || 0) + (Number(workload.open_tasks) || 0);
  const periodText = report?.period ? `${fmtDate(report.period.start)} – ${fmtDate(report.period.end)}` : "Last 30 days";

  return <div className="lm-employee-report">
    <header className="lm-employee-report-head">
      <div><span>Personal scorecard</span><h2>Employee performance report</h2><p><strong>{person.fullname || person.username || "Employee"}</strong>{(person.designation || person.department) && ` · ${[person.designation, person.department].filter(Boolean).join(" / ")}`}<br />Management-ready performance and activity detail</p></div>
      <div><small>Activity period</small><strong>{periodText}</strong></div>
    </header>

    <form className="lm-employee-report-toolbar" onSubmit={applyFilters} aria-label="Performance report filters">
      <div className="lm-employee-report-filters">
        <label><span>From date</span><input type="date" value={filters.start} max={filters.end || undefined} onChange={event => setFilters(current => ({ ...current, start: event.target.value }))} required /></label>
        <label><span>To date</span><input type="date" value={filters.end} min={filters.start || undefined} onChange={event => setFilters(current => ({ ...current, end: event.target.value }))} required /></label>
        <label><span>Company / lead</span><select value={filters.company} onChange={event => setFilters(current => ({ ...current, company: event.target.value }))}><option value="">All companies</option>{(filterOptions.companies || []).map((company, idx) => <option key={`${company}_${idx}`} value={company}>{company}</option>)}</select></label>
        <label><span>Lead stage</span><select value={filters.stage} onChange={event => setFilters(current => ({ ...current, stage: event.target.value }))}><option value="">All stages</option>{(filterOptions.stages || []).map((option, idx) => <option key={`${option.value}_${idx}`} value={option.value}>{option.label}</option>)}</select></label>
        <label><span>Activity type</span><select value={filters.activityType} onChange={event => setFilters(current => ({ ...current, activityType: event.target.value }))}><option value="">All activities</option>{(filterOptions.activity_types || []).map((option, idx) => <option key={`${option.value}_${idx}`} value={option.value}>{option.label}</option>)}</select></label>
      </div>
      <div className="lm-employee-report-actions">
        <div className="lm-employee-report-filter-summary" title={fullFilterText}><Filter size={14} /><span><strong>{summary.total_leads || 0} leads</strong> · {exportRows.length} activities · {fullFilterText}</span></div>
        <div className="lm-employee-report-action-buttons">
          <button type="button" className="lm-report-button lm-report-button--quiet" onClick={resetFilters} disabled={reportLoading || !!exporting}><RotateCcw size={15} /> Reset</button>
          <button type="submit" className="lm-report-button lm-report-button--primary" disabled={reportLoading || !!exporting}>{reportLoading ? <Loader2 className="spin" size={15} /> : <Filter size={15} />} Apply filters</button>
          <span className="lm-report-button-divider" aria-hidden="true" />
          <button type="button" className="lm-report-button" onClick={exportPdf} disabled={reportLoading || !!exporting || !hasReportData} title={!hasReportData ? "No filtered report data to download" : "Download filtered report as PDF"}>{exporting === "pdf" ? <Loader2 className="spin" size={15} /> : <FileText size={15} />} Download PDF</button>
          <button type="button" className="lm-report-button" onClick={exportExcel} disabled={reportLoading || !!exporting || !hasReportData} title={!hasReportData ? "No filtered report data to download" : "Download filtered report as Excel"}>{exporting === "excel" ? <Loader2 className="spin" size={15} /> : <Download size={15} />} Download Excel</button>
        </div>
      </div>
      {!hasReportData && !reportLoading && !reportError && <div className="lm-employee-report-export-note"><Inbox size={14} /> No report data matches this slice. Change the filters to enable downloads.</div>}
      {reportError && <div className="lm-employee-report-error" role="alert"><AlertCircle size={15} /> {reportError}</div>}
    </form>

    <section className={`lm-employee-report-kpis${reportLoading ? " is-loading" : ""}`} aria-label="Employee performance summary" aria-busy={reportLoading}>
      <article><LayoutList size={18} /><div><small>Total leads</small><strong>{summary.total_leads || 0}</strong><p>{summary.assigned_leads || 0} assigned · {summary.created_leads || 0} created</p></div></article>
      <article><Award size={18} /><div><small>Converted leads</small><strong>{summary.converted_leads || 0}</strong><p>{summary.conversion_rate || 0}% conversion rate</p></div></article>
      <article><PhoneCall size={18} /><div><small>Calls logged</small><strong>{engagement.calls || 0}</strong><p>{engagement.emails || 0} email activities · {engagement.meetings || 0} meetings</p></div></article>
      <article className={(workload.overdue_follow_ups || 0) > 0 ? "alert" : ""}><Clock size={18} /><div><small>Pending workload</small><strong>{pendingTotal}</strong><p>{workload.pending_follow_ups || 0} follow-ups · {workload.open_tasks || 0} tasks{workload.overdue_follow_ups ? ` · ${workload.overdue_follow_ups} overdue` : ""}</p></div></article>
    </section>

    <div className="lm-employee-report-primary">
      <section className="lm-employee-report-card"><header><div><span>Pipeline health</span><h3>Lead stage distribution</h3></div><small>{summary.total_leads || 0} total</small></header>
        <div className="lm-employee-report-stage-chart" role="img" aria-label={`Pipeline stages: ${stageData.map(item => `${item.name} ${item.value}`).join(", ") || "no leads"}`}>
          {stageData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={stageData} layout="vertical" margin={{ top: 2, right: 20, bottom: 2, left: 8 }}><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} /><YAxis type="category" dataKey="name" width={112} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#475569" }} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={value => [value, "Leads"]} /><Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={15}>{stageData.map(item => <Cell key={item.name} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer> : <div className="lm-employee-report-empty"><Inbox size={24} /><strong>No pipeline data</strong><span>Lead stages will appear here when leads are added.</span></div>}
        </div>
      </section>
      <section className="lm-employee-report-card"><header><div><span>Effort trajectory</span><h3>{report?.period?.days || 30}-day employee activity</h3></div><small>{trendTotal} recorded</small></header>
        <div className="lm-employee-report-trend" role="img" aria-label={`${report?.period?.days || 30}-day employee activity with ${trendTotal} total activities from ${periodText}.`}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={trendData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}><CartesianGrid stroke="#eef2f7" vertical={false} /><XAxis dataKey="label" axisLine={false} tickLine={false} interval={6} tick={{ fontSize: 10, fill: "#94a3b8" }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} /><Tooltip /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="emails" stroke="#7c3aed" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="meetings" stroke="#0891b2" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="tasks" stroke="#d97706" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="other" stroke="#94a3b8" strokeWidth={1.5} dot={false} /></LineChart></ResponsiveContainer>
          {!trendTotal && <div className="lm-employee-report-trend-note">No activities recorded in this period</div>}
        </div>
      </section>
    </div>

    <div className="lm-employee-report-analytics">
      {breakdowns.map(group => { const max = Math.max(1, ...group.rows.map(row => Number(row.count) || 0)); return <section className="lm-employee-report-mini" key={group.title}><h3>{group.title}</h3>{group.rows.length ? <div>{group.rows.map(row => <div className="lm-employee-report-bar" key={row.key}><span>{row.label}</span><div><i style={{ width: `${((Number(row.count) || 0) / max) * 100}%`, background: row.color || group.color }} /></div><strong>{row.count}</strong></div>)}</div> : <p><Inbox size={17} /> {group.empty}</p>}</section>; })}
    </div>

    <section className="lm-employee-report-card lm-employee-report-coverage"><header><div><span>Work & coverage</span><h3>Ownership and attention signals</h3></div></header><div>
      <dl><dt>Pending follow-ups</dt><dd>{workload.pending_follow_ups || 0}</dd><dt>Overdue follow-ups</dt><dd className={(workload.overdue_follow_ups || 0) ? "danger" : ""}>{workload.overdue_follow_ups || 0}</dd><dt>Open tasks</dt><dd>{workload.open_tasks || 0}</dd><dt>Upcoming meetings</dt><dd>{engagement.upcoming_meetings || 0}</dd></dl>
      <dl><dt>Target lists</dt><dd>{targets.total_lists || 0}</dd><dt>Target contacts</dt><dd>{targets.total_contacts || 0}</dd><dt>Do-not-call contacts</dt><dd>{targets.do_not_call || 0}</dd><dt>High-priority leads</dt><dd>{summary.high_priority || 0}</dd></dl>
      <dl><dt>Assigned ownership</dt><dd>{summary.assigned_leads || 0}</dd><dt>Created ownership</dt><dd>{summary.created_leads || 0}</dd><dt>Meetings logged</dt><dd>{engagement.meetings || 0}</dd><dt>Conversions logged</dt><dd>{engagement.conversions || 0}</dd></dl>
    </div></section>

    <section className="lm-employee-report-card lm-employee-report-recent"><header><div><span>Audit trail</span><h3>Filtered employee activity</h3></div><small>{exportRows.length} records</small></header>
      {exportRows.length ? <>
        <div className="lm-employee-report-table"><table><thead><tr><th>Activity</th><th>Lead</th><th>Type</th><th>Timestamp</th><th aria-label="Open" /></tr></thead><tbody>{visibleActivityRows.map(item => <tr key={item.id}><td><strong>{item.title || reportLabel(item.type)}</strong></td><td>{item.lead_name || "—"}</td><td><span>{reportLabel(item.type)}</span></td><td>{fmtDateTime(item.created_at)}</td><td><button type="button" aria-label={`Open ${item.lead_name || "activity"}`} onClick={() => openLead(item.lead_id)}><ChevronRight size={15} /></button></td></tr>)}</tbody></table></div>
        <footer className="lm-employee-report-pagination">
          <p>Showing <strong>{visibleActivityStart}–{visibleActivityEnd}</strong> of <strong>{exportRows.length}</strong> activities</p>
          <div className="lm-employee-report-pagination-controls">
            <label><span>Rows</span><select value={activityPageSize} onChange={changeActivityPageSize} aria-label="Activities per page"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label>
            <nav aria-label="Employee activity pagination">
              <button type="button" onClick={() => setActivityPage(page => Math.max(1, page - 1))} disabled={activityPage === 1}><ChevronLeft size={14} /> Previous</button>
              <div className="lm-employee-report-page-numbers">
                {activityPaginationItems.map(item => typeof item === "number" ? <button type="button" key={item} className={item === activityPage ? "is-active" : ""} aria-current={item === activityPage ? "page" : undefined} aria-label={`Page ${item}`} onClick={() => setActivityPage(item)}>{item}</button> : <span key={item} aria-hidden="true">…</span>)}
              </div>
              <button type="button" onClick={() => setActivityPage(page => Math.min(activityTotalPages, page + 1))} disabled={activityPage === activityTotalPages}>Next <ChevronRight size={14} /></button>
            </nav>
          </div>
        </footer>
      </> : <div className="lm-employee-report-empty"><Zap size={24} /><strong>No activity matches these filters</strong><span>Try a wider date range or reset one of the selected categories.</span></div>}
    </section>
  </div>;
}

function MonthlyIncentiveCard({ monthlyIncentive, monthlyConversionValue, detailed = false }) {
  const fmtIncentiveCurrency = value => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const fmtDetailedCurrency = value => Number(value || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const records = Array.isArray(monthlyIncentive.records) ? monthlyIncentive.records : [];
  const calculationMode = monthlyIncentive.calculation_mode || monthlyIncentive.mode || "PERCENTAGE";
  const isFixedMode = calculationMode === "FIXED_PER_SALE";
  const configuredRate = Number(monthlyIncentive.rate ?? monthlyIncentive.fixed_rate);
  const hasConfiguredRate = Number.isFinite(configuredRate);
  const totals = {
    gross: Number(monthlyIncentive.gross_value ?? monthlyIncentive.conversion_value) || 0,
    discount: Number(monthlyIncentive.discount_total) || 0,
    net: Number(monthlyIncentive.net_value) || 0,
    incentive: records.length && hasConfiguredRate
      ? records.reduce((sum, record) => sum + (isFixedMode ? configuredRate : ((Number(record.net_value) || 0) * configuredRate) / 100), 0)
      : Number(monthlyIncentive.incentive_amount) || 0,
  };
  const chartData = useMemo(() => {
    const byDay = {};
    const byType = {};
    records.forEach(record => {
      const value = Number(record.final_value ?? record.net_value) || 0;
      const recordRate = Number(record.incentive_rate ?? configuredRate);
      const incentive = Number.isFinite(recordRate)
        ? (isFixedMode ? recordRate : ((Number(record.net_value) || 0) * recordRate) / 100)
        : Number(record.incentive_amount) || 0;
      const date = record.converted_at ? new Date(record.converted_at) : null;
      const day = date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "unknown";
      const type = record.conversion_type || "Other";
      if (!byDay[day]) byDay[day] = { date: day, conversionValue: 0, incentive: 0 };
      byDay[day].conversionValue += value;
      byDay[day].incentive += incentive;
      if (!byType[type]) byType[type] = { type, deals: 0, incentive: 0 };
      byType[type].deals += 1;
      byType[type].incentive += incentive;
    });
    return {
      daily: Object.values(byDay).filter(item => item.date !== "unknown").sort((a, b) => a.date.localeCompare(b.date)),
      types: Object.values(byType).sort((a, b) => b.deals - a.deals),
    };
  }, [records, configuredRate, hasConfiguredRate, isFixedMode]);
  const chartDate = value => value === "unknown" ? "Unknown" : new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  const chartTooltip = ({ active, payload, label }) => active && payload?.length ? <div className="lm-profile-chart-tooltip"><strong>{chartDate(label)}</strong>{payload.map(item => <span key={item.dataKey}>{item.name}: {fmtDetailedCurrency(item.value)}</span>)}</div> : null;
  const zeroKpis = { incentive: totals.incentive, gross: totals.gross, discount: totals.discount, net: totals.net, deals: Number(monthlyIncentive.deal_count) || records.length };
  const rateLabel = hasConfiguredRate ? (isFixedMode ? `${fmtIncentiveCurrency(configuredRate)} / sale` : `${configuredRate}% rate`) : "Rate unavailable";
  return <section className="lm-profile-overview-card lm-profile-monthly-incentive" aria-label="Monthly incentive">
    <div className="lm-profile-overview-card-head"><div><span>Monthly incentive</span><h3>{monthlyIncentive.month ? `Your conversion earnings for ${monthlyIncentive.month}` : "Your conversion earnings"}</h3></div><span className="lm-profile-monthly-incentive-rate">{rateLabel}</span></div>
    {zeroKpis.deals > 0 ? <div className="lm-profile-monthly-incentive-body"><div className="lm-profile-monthly-incentive-highlight"><small>Incentive earned</small><strong>{fmtIncentiveCurrency(totals.incentive)}</strong><span>From {zeroKpis.deals} converted {zeroKpis.deals === 1 ? "deal" : "deals"} this month</span></div><div className="lm-profile-monthly-incentive-metrics"><div><small>Converted deals</small><strong>{zeroKpis.deals}</strong></div><div><small>Net conversion value</small><strong>{fmtIncentiveCurrency(totals.net || monthlyConversionValue)}</strong></div></div></div> : <div className="lm-profile-monthly-incentive-empty"><BadgePercent size={22} /><div><strong>No conversions yet this month</strong><span>Complete a conversion to start earning your monthly incentive.</span></div></div>}
    {detailed && <div className="lm-profile-incentive-details">
      <div className="lm-profile-incentive-kpis"><div><small>Incentive earned</small><strong>{fmtDetailedCurrency(zeroKpis.incentive)}</strong></div><div><small>Gross value</small><strong>{fmtDetailedCurrency(zeroKpis.gross)}</strong></div><div><small>Total discounts</small><strong>{fmtDetailedCurrency(zeroKpis.discount)}</strong></div><div><small>Net value</small><strong>{fmtDetailedCurrency(zeroKpis.net)}</strong></div><div><small>Converted deals</small><strong>{zeroKpis.deals}</strong></div></div>
      <div className="lm-profile-incentive-chart-grid">
        <section className="lm-profile-incentive-chart-card"><header><div><span>Daily trend</span><h4>Conversion value & incentive</h4></div><small>{monthlyIncentive.month || "Current month"}</small></header>{chartData.daily.length ? <ResponsiveContainer width="100%" height={230}><LineChart data={chartData.daily} margin={{ top: 8, right: 10, left: 0, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" /><XAxis dataKey="date" tickFormatter={chartDate} tick={{ fontSize: 10 }} /><YAxis tickFormatter={value => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} tick={{ fontSize: 10 }} width={58} /><Tooltip content={chartTooltip} /><Legend wrapperStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey="conversionValue" name="Conversion value" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 2 }} /><Line type="monotone" dataKey="incentive" name="Incentive" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2 }} /></LineChart></ResponsiveContainer> : <div className="lm-profile-incentive-chart-empty"><BarChart2 size={22} /><span>No conversion data this month</span></div>}</section>
        <section className="lm-profile-incentive-chart-card"><header><div><span>Conversion mix</span><h4>Deals by conversion type</h4></div><small>{chartData.types.length} types</small></header>{chartData.types.length ? <ResponsiveContainer width="100%" height={230}><BarChart data={chartData.types} margin={{ top: 8, right: 10, left: 0, bottom: 18 }}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" /><XAxis dataKey="type" tick={{ fontSize: 10 }} interval={0} angle={-12} textAnchor="end" height={42} /><YAxis yAxisId="deals" allowDecimals={false} tick={{ fontSize: 10 }} width={28} /><YAxis yAxisId="money" orientation="right" tickFormatter={value => `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} tick={{ fontSize: 10 }} width={54} /><Tooltip formatter={(value, name) => name === "Incentive" ? fmtDetailedCurrency(value) : value} /><Legend wrapperStyle={{ fontSize: 10 }} /><Bar yAxisId="deals" dataKey="deals" name="Deals" fill="#818cf8" radius={[4, 4, 0, 0]} /><Bar yAxisId="money" dataKey="incentive" name="Incentive" fill="#34d399" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="lm-profile-incentive-chart-empty"><BarChart2 size={22} /><span>No conversion data this month</span></div>}</section>
      </div>
      <div className="lm-profile-incentive-explainer"><Info size={17} /><div><strong>How your monthly incentive is calculated</strong><span>{isFixedMode ? `${rateLabel} for each converted sale.` : `${hasConfiguredRate ? configuredRate : "—"}% of net conversion value, after discounts.`} This period: {monthlyIncentive.month || "current month"}. {zeroKpis.deals} converted {zeroKpis.deals === 1 ? "deal" : "deals"} · {fmtDetailedCurrency(zeroKpis.gross)} gross · {fmtDetailedCurrency(zeroKpis.discount)} discounts · {fmtDetailedCurrency(zeroKpis.incentive)} earned.</span></div></div>
      {records.length > 0 && <>
      <div className="lm-profile-incentive-records" role="region" aria-label="Monthly conversion details" tabIndex="0"><table><thead><tr><th>Lead / customer</th><th>Type & converted</th><th>Gross</th><th>Discount</th><th>Net value</th><th>Rate</th><th>Incentive</th><th>References & terms</th></tr></thead><tbody>{records.map(record => { const recordRate = Number(record.incentive_rate ?? configuredRate); const recordIncentive = Number.isFinite(recordRate) ? (isFixedMode ? recordRate : ((Number(record.net_value) || 0) * recordRate) / 100) : Number(record.incentive_amount) || 0; return <tr key={record.id}><td><strong>{record.customer_name || "Unnamed customer"}</strong><small>{[record.lead_number || (record.lead_id ? `Lead #${record.lead_id}` : ""), record.id ? `Conversion #${record.id}` : ""].filter(Boolean).join(" · ") || "—"}</small></td><td><strong>{record.conversion_type || "Conversion"}</strong><small>{record.converted_at ? fmtDateTime(record.converted_at) : "—"}</small></td><td>{fmtDetailedCurrency(record.final_value)}</td><td>{fmtDetailedCurrency(record.discount)}</td><td>{fmtDetailedCurrency(record.net_value)}</td><td>{Number.isFinite(recordRate) ? (isFixedMode ? `${fmtDetailedCurrency(recordRate)} / sale` : `${recordRate}%`) : "—"}</td><td><strong className="lm-profile-incentive-record-amount">{fmtDetailedCurrency(recordIncentive)}</strong></td><td><small>{[record.quotation_reference && `Quotation: ${record.quotation_reference}`, record.invoice_reference && `Invoice: ${record.invoice_reference}`, record.project_reference && `Project: ${record.project_reference}`, record.sales_order_reference && `Sales order: ${record.sales_order_reference}`, record.payment_terms && `Terms: ${record.payment_terms}`].filter(Boolean).join(" · ") || "No references provided"}</small></td></tr>; })}</tbody></table></div>
      </>}
    </div>}
  </section>;
}

const BATCH_PALETTES = [
  { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" }, // Indigo
  { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" }, // Emerald / Green
  { bg: "#fff7ed", text: "#c2410c", border: "#ffedd5" }, // Amber / Orange
  { bg: "#fdf2f8", text: "#be185d", border: "#fbcfe8" }, // Pink / Rose
  { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" }, // Sky Blue
  { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" }, // Purple / Violet
  { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4" }, // Teal
  { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" }, // Crimson
];

function getBatchStyle(batchName) {
  if (!batchName) return { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" };
  let hash = 0;
  for (let i = 0; i < batchName.length; i++) {
    hash = batchName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BATCH_PALETTES.length;
  return BATCH_PALETTES[index];
}

function SearchableBatchSelect({ options, value, onChange, totalCount }) {
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!filterText.trim()) return options;
    const q = filterText.toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(q));
  }, [options, filterText]);

  const selectedLabel = value === "ALL" 
    ? `All Batches & Direct Leads (${totalCount})` 
    : value === "DIRECT" 
    ? "Direct Leads (No Batch)" 
    : `Batch: ${value}`;

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: 8,
          border: "1px solid #cbd5e1",
          background: "#fff",
          fontSize: 12,
          fontWeight: 600,
          color: "#0f172a",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
        }}
      >
        <span style={{ maxWidth: 210, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel}
        </span>
        <ChevronDown size={14} color="#64748b" />
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 4,
          width: 280,
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
          zIndex: 100,
          padding: 8
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#f8fafc", borderRadius: 6, marginBottom: 6, border: "1px solid #cbd5e1" }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search batches..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              autoFocus
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, width: "100%", color: "#0f172a" }}
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText("")}
                style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#94a3b8", fontSize: 14, fontWeight: 700 }}
              >
                ×
              </button>
            )}
          </div>

          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            <div
              onClick={() => { onChange("ALL"); setOpen(false); }}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: value === "ALL" ? 700 : 500,
                background: value === "ALL" ? "#eef2ff" : "transparent",
                color: value === "ALL" ? "#4f46e5" : "#334155",
                marginBottom: 2
              }}
            >
              All Batches & Direct Leads ({totalCount})
            </div>
            <div
              onClick={() => { onChange("DIRECT"); setOpen(false); }}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                fontWeight: value === "DIRECT" ? 700 : 500,
                background: value === "DIRECT" ? "#eef2ff" : "transparent",
                color: value === "DIRECT" ? "#4f46e5" : "#334155",
                marginBottom: 2
              }}
            >
              Direct Leads (No Batch)
            </div>
            {filteredOptions.map(bName => {
              const bStyle = getBatchStyle(bName);
              return (
                <div
                  key={bName}
                  onClick={() => { onChange(bName); setOpen(false); }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: value === bName ? 700 : 500,
                    background: value === bName ? "#eef2ff" : "transparent",
                    color: value === bName ? "#4f46e5" : "#334155",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: bStyle.text, display: "inline-block", flexShrink: 0 }} />
                  <span>Batch: {bName}</span>
                </div>
              );
            })}
            {filteredOptions.length === 0 && filterText && (
              <div style={{ padding: "10px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                No batch matches "{filterText}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MyProfileMeetingsView({ meetings = [], leads = [], onViewLead, onChanged }) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const { showAlert } = useModal();
  const now = new Date();
  const activeStatuses = new Set(["SCHEDULED", "CONFIRMED", "RESCHEDULED"]);

  const filteredMeetings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (meetings || []).filter(meeting => {
      if (statusFilter === "ACTIVE" && !activeStatuses.has(meeting.status)) return false;
      if (statusFilter === "OVERDUE" && !meeting.is_overdue) return false;
      if (statusFilter !== "ALL" && statusFilter !== "ACTIVE" && statusFilter !== "OVERDUE" && meeting.status !== statusFilter) return false;
      if (modeFilter !== "ALL" && meeting.meeting_mode !== modeFilter) return false;
      if (!q) return true;
      return [meeting.title, meeting.lead_name, meeting.lead_number, meeting.location, meeting.agenda, meeting.notes]
        .some(value => String(value || "").toLowerCase().includes(q));
    });
  }, [meetings, statusFilter, modeFilter, search]);

  const summary = useMemo(() => ({
    active: meetings.filter(item => activeStatuses.has(item.status)).length,
    overdue: meetings.filter(item => item.is_overdue).length,
    completed: meetings.filter(item => item.status === "COMPLETED").length,
    online: meetings.filter(item => item.meeting_mode === "ONLINE").length,
  }), [meetings]);

  const updateMeetingStatus = async (meeting, status) => {
    setSavingStatusId(meeting.id);
    try {
      await api.addMeeting(meeting.lead_id, { id: meeting.id, status, outcome: meeting.outcome || "", title: meeting.title });
      showAlert("Saved", `Meeting marked ${MEETING_STATUSES[status] || status}.`, "success");
      onChanged?.();
    } catch (err) {
      const data = err.response?.data;
      showAlert("Error", String(data?.detail || data?.non_field_errors?.[0] || Object.values(data || {}).flat()?.[0] || "Failed to update meeting."), "error");
    } finally {
      setSavingStatusId(null);
    }
  };

  const closeForm = () => {
    setShowMeetingForm(false);
    setEditingMeeting(null);
  };

  const handleSaved = (savedMeeting) => {
    closeForm();
    if (savedMeeting?.booking_warning?.message) {
      showAlert("Time Already Booked", savedMeeting.booking_warning.message, "warning");
    } else {
      showAlert("Saved", "Meeting saved successfully.", "success");
    }
    onChanged?.();
  };

  return (
    <div className="lm-profile-panel lm-meetings">
      <div className="lm-meetings__head">
        <div>
          <h3>Meetings</h3>
          <p className="lm-muted">Plan, track, and close lead meetings from your profile.</p>
        </div>
        <button type="button" className="lm-btn lm-btn--primary lm-btn--sm" onClick={() => setShowMeetingForm(true)}>
          <Plus size={14} /> Schedule Meeting
        </button>
      </div>

      <div className="lm-profile-stat-grid">
        <StatCard label="Active Meetings" value={summary.active} icon={Users} color="#6366f1" />
        <StatCard label="Overdue Meetings" value={summary.overdue} icon={AlertCircle} color="#ef4444" />
        <StatCard label="Completed" value={summary.completed} icon={CheckCircle2} color="#16a34a" />
        <StatCard label="Online Meetings" value={summary.online} icon={MessageSquare} color="#0891b2" />
      </div>

      <div className="lm-meetings__filters">
        <div className="lm-search lm-meetings__search"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search meetings, leads, agenda..." /></div>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="ACTIVE">Active</option>
          <option value="OVERDUE">Overdue</option>
          {Object.entries(MEETING_STATUSES)
            .filter(([value]) => value !== "COMPLETED")
            .map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={modeFilter} onChange={event => setModeFilter(event.target.value)}>
          <option value="ALL">All Modes</option>
          {Object.entries(MEETING_MODES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="lm-meetings__list">
        {filteredMeetings.length === 0 ? (
          <div className="lm-center-state"><Users size={34} /><p>No meetings match this view.</p></div>
        ) : filteredMeetings.map(meeting => (
          <article key={meeting.id} className={`lm-meeting-card ${meeting.is_overdue ? "is-overdue" : ""}`}>
            <div className="lm-meeting-card__main">
              <div className="lm-meeting-card__top">
                <span>{MEETING_TYPES[meeting.meeting_type] || compactLabel(meeting.meeting_type)}</span>
                <b className={`lm-meeting-status lm-meeting-status--${String(meeting.status).toLowerCase()}`}>{MEETING_STATUSES[meeting.status] || compactLabel(meeting.status)}</b>
              </div>
              <h4>{meeting.title}</h4>
              <p><strong>{meeting.lead_name}</strong>{meeting.lead_number ? ` · ${meeting.lead_number}` : ""}</p>
              <dl>
                <div><dt>Start</dt><dd className={meeting.is_overdue ? "lm-overdue" : ""}>{fmtDateTime(meeting.scheduled_start)}</dd></div>
                <div><dt>End</dt><dd>{fmtDateTime(meeting.scheduled_end)}</dd></div>
                <div><dt>Mode</dt><dd>{MEETING_MODES[meeting.meeting_mode] || compactLabel(meeting.meeting_mode)}</dd></div>
                <div><dt>Assigned</dt><dd>{meeting.assigned_to_name || "Unassigned"}</dd></div>
              </dl>
              {(meeting.agenda || meeting.notes || meeting.outcome) && <div className="lm-meeting-card__notes">{meeting.agenda || meeting.notes || meeting.outcome}</div>}
            </div>
            <div className="lm-meeting-card__actions">
              {meeting.meeting_link && <a className="lm-btn lm-btn--primary lm-btn--sm" href={meeting.meeting_link} target="_blank" rel="noreferrer"><Maximize2 size={14} /> Join</a>}
              {(meeting.map_link || meeting.location) && <a className="lm-btn lm-btn--ghost lm-btn--sm" href={meeting.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting.location)}`} target="_blank" rel="noreferrer"><Maximize2 size={14} /> Map</a>}
              <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => onViewLead?.({ id: meeting.lead_id })}><Eye size={14} /> Lead</button>
              <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => { setEditingMeeting(meeting); setShowMeetingForm(true); }}><Edit2 size={14} /> Edit</button>
              {activeStatuses.has(meeting.status) && <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" disabled={savingStatusId === meeting.id} onClick={() => updateMeetingStatus(meeting, "COMPLETED")}><Check size={14} /> Complete</button>}
              {activeStatuses.has(meeting.status) && <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" disabled={savingStatusId === meeting.id} onClick={() => updateMeetingStatus(meeting, "CANCELLED")}><X size={14} /> Cancel</button>}
            </div>
          </article>
        ))}
      </div>

      {showMeetingForm && (
        <MeetingFormModal
          leadOptions={leads}
          initialMeeting={editingMeeting}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function AllMeetingsView({ onViewLead }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const { showAlert } = useModal();
  const activeStatuses = new Set(["SCHEDULED", "CONFIRMED", "RESCHEDULED"]);

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.allMeetings({ page_size: 100 });
      setMeetings(res.data.results || res.data || []);
    } catch (err) {
      const data = err.response?.data;
      showAlert("Meetings Not Loaded", String(data?.detail || data?.error || "Could not load all meetings."), "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => { loadMeetings(); }, [loadMeetings]);

  const filteredMeetings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return meetings.filter(meeting => {
      if (statusFilter === "ACTIVE" && !activeStatuses.has(meeting.status)) return false;
      if (statusFilter !== "ALL" && statusFilter !== "ACTIVE" && meeting.status !== statusFilter) return false;
      if (modeFilter !== "ALL" && meeting.meeting_mode !== modeFilter) return false;
      if (!q) return true;
      return [
        meeting.title,
        meeting.lead_name,
        meeting.lead_number,
        meeting.location,
        meeting.created_by_name,
        meeting.assigned_to_name,
        meeting.agenda,
        meeting.notes,
      ].some(value => String(value || "").toLowerCase().includes(q));
    });
  }, [meetings, search, statusFilter, modeFilter]);

  const summary = useMemo(() => ({
    total: meetings.length,
    active: meetings.filter(item => activeStatuses.has(item.status)).length,
    completed: meetings.filter(item => item.status === "COMPLETED").length,
    today: meetings.filter(item => item.scheduled_start && new Date(item.scheduled_start).toDateString() === new Date().toDateString()).length,
  }), [meetings]);

  return (
    <section className="lm-profile-panel lm-meetings lm-all-meetings">
      <div className="lm-meetings__head">
        <div>
          <h3>All Meetings</h3>
          <p className="lm-muted">All users' created and assigned lead meetings.</p>
        </div>
        <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" onClick={loadMeetings} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="lm-profile-stat-grid">
        <StatCard label="Total Meetings" value={summary.total} icon={Users} color="#6366f1" />
        <StatCard label="Active" value={summary.active} icon={Clock} color="#2563eb" />
        <StatCard label="Completed" value={summary.completed} icon={CheckCircle2} color="#16a34a" />
        <StatCard label="Today" value={summary.today} icon={AlertCircle} color="#f59e0b" />
      </div>

      <div className="lm-meetings__filters">
        <div className="lm-search lm-meetings__search"><Search size={15} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search meetings, users, leads, location..." /></div>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          {Object.entries(MEETING_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={modeFilter} onChange={event => setModeFilter(event.target.value)}>
          <option value="ALL">All Modes</option>
          {Object.entries(MEETING_MODES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="lm-center-state"><Loader2 size={28} className="spin" /><p>Loading meetings...</p></div>
      ) : (
        <div className="lm-meetings__list">
          {filteredMeetings.length === 0 ? (
            <div className="lm-center-state"><Users size={34} /><p>No meetings match this view.</p></div>
          ) : filteredMeetings.map(meeting => {
            const meetingMapUrl = meeting.map_link || (meeting.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting.location)}` : "");
            return (
              <article key={meeting.id} className={`lm-meeting-card ${meeting.is_overdue ? "is-overdue" : ""}`}>
                <div className="lm-meeting-card__main">
                  <div className="lm-meeting-card__top">
                    <span>{MEETING_TYPES[meeting.meeting_type] || compactLabel(meeting.meeting_type)}</span>
                    <b className={`lm-meeting-status lm-meeting-status--${String(meeting.status).toLowerCase()}`}>{MEETING_STATUSES[meeting.status] || compactLabel(meeting.status)}</b>
                  </div>
                  <h4>{meeting.title || "Untitled meeting"}</h4>
                  <p><strong>{meeting.lead_name || "Unnamed lead"}</strong>{meeting.lead_number ? ` · ${meeting.lead_number}` : ""}</p>
                  <dl>
                    <div><dt>Start</dt><dd>{fmtDateTime(meeting.scheduled_start)}</dd></div>
                    <div><dt>End</dt><dd>{fmtDateTime(meeting.scheduled_end)}</dd></div>
                    <div><dt>Created by</dt><dd>{meeting.created_by_name || "Unknown"}</dd></div>
                    <div><dt>Assigned</dt><dd>{meeting.assigned_to_name || "Unassigned"}</dd></div>
                  </dl>
                  {(meeting.location || meeting.agenda || meeting.notes || meeting.outcome) && <div className="lm-meeting-card__notes">{meeting.location || meeting.agenda || meeting.notes || meeting.outcome}</div>}
                </div>
                <div className="lm-meeting-card__actions">
                  {meeting.meeting_link && <a className="lm-btn lm-btn--primary lm-btn--sm" href={meeting.meeting_link} target="_blank" rel="noreferrer"><Maximize2 size={14} /> Join</a>}
                  {meetingMapUrl && <a className="lm-btn lm-btn--ghost lm-btn--sm" href={meetingMapUrl} target="_blank" rel="noreferrer"><Maximize2 size={14} /> Map</a>}
                  {meeting.lead && <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => onViewLead?.({ id: meeting.lead })}><Eye size={14} /> Lead</button>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MyProposalsPanel({ onViewLead }) {
  const router = useRouter();
  const { showAlert } = useModal();
  const [showRequestSelector, setShowRequestSelector] = useState(false);
  const [data, setData] = useState({ results: [], counts: {}, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      api.myProposals({ page, page_size: 20, search: search.trim(), status: statusFilter })
        .then((response) => { if (!cancelled) setData(response.data); })
        .catch((err) => { if (!cancelled) setError(err.response?.data?.error || "Could not load your proposals."); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, search ? 250 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [page, search, statusFilter, refreshKey]);

  const totalPages = Math.max(1, Math.ceil((data.count || 0) / 20));
  const counts = data.counts || {};
  const openProposal = (proposal) => router.push(`/proposal?proposal=${proposal.id}`);
  const requestProposal = async (lead) => {
    try {
      const response = await ax("post", "/proposal/requests/", { lead_id: lead.id });
      setShowRequestSelector(false);
      setRefreshKey(value => value + 1);
      showAlert("Proposal Requested", `Your request for ${lead.lead_number} was sent successfully.`, "success");
      return response;
    } catch (err) {
      showAlert("Request Failed", err.response?.data?.error || "Could not submit the proposal request.", "error");
    }
  };

  return (
    <div className="lm-profile-panel lm-my-proposals">
      <div className="lm-my-proposals__head">
        <div><h3>My Proposals</h3><p>Request proposals for your leads and track their progress.</p></div>
        <div className="lm-my-proposals__actions">
          <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => setRefreshKey(value => value + 1)}><RefreshCw size={14} /> Refresh</button>
          <button type="button" className="lm-btn lm-btn--primary lm-btn--sm" onClick={() => setShowRequestSelector(true)}><Send size={14} /> Request Proposal</button>
        </div>
      </div>

      <LeadSelector show={showRequestSelector} onClose={() => setShowRequestSelector(false)} onSelect={requestProposal} mode="request" />

      {(data.requests || []).length > 0 && <section className="lm-proposal-requests">
        <div className="lm-proposal-requests__head"><h4>Proposal Requests</h4><span>{data.request_counts?.all || 0}</span></div>
        <div className="lm-table-wrap"><table className="lm-table"><thead><tr><th>Lead</th><th>Customer</th><th>Requested</th><th>Status</th><th>Proposal</th></tr></thead><tbody>
          {data.requests.map((request) => <tr key={request.id}>
            <td><button type="button" className="lm-link" onClick={() => onViewLead?.({ id: request.lead })}>{request.lead_number}</button></td>
            <td>{request.lead_name}</td><td>{fmtDate(request.created_at)}</td>
            <td><span className={`lm-proposal-status lm-proposal-status--${request.status}`}>{compactLabel(request.status)}</span></td>
            <td>{request.proposal ? <button type="button" className="lm-link" onClick={() => router.push(`/proposal?proposal=${request.proposal.id}`)}>{request.proposal.proposal_no}</button> : <span className="lm-muted">Waiting</span>}</td>
          </tr>)}
        </tbody></table></div>
      </section>}

      <div className="lm-my-proposals__stats">
        <StatCard label="All Proposals" value={counts.all || 0} icon={FileText} color="#4f46e5" />
        <StatCard label="Draft" value={counts.draft || 0} icon={Edit2} color="#f59e0b" />
        <StatCard label="Sent" value={counts.sent || 0} icon={Send} color="#0284c7" />
        <StatCard label="Approved" value={counts.approved || 0} icon={CheckCircle2} color="#16a34a" />
      </div>

      <div className="lm-my-proposals__toolbar">
        <div className="lm-search"><Search size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search proposal, lead or client..." /></div>
        <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
          <option value="">All statuses</option><option value="draft">Draft</option><option value="sent">Sent</option><option value="approved">Approved</option>
        </select>
      </div>

      {loading ? <div className="lm-center-state"><Loader2 size={28} className="spin" /><p>Loading proposals...</p></div>
        : error ? <div className="lm-center-state"><AlertCircle size={30} /><p>{error}</p><button className="lm-btn lm-btn--primary lm-btn--sm" onClick={() => setRefreshKey(value => value + 1)}>Try again</button></div>
        : data.results?.length === 0 ? <div className="lm-center-state"><Inbox size={32} /><p>No completed proposals yet.</p><button className="lm-btn lm-btn--primary lm-btn--sm" onClick={() => setShowRequestSelector(true)}>Request a proposal</button></div>
        : <div className="lm-table-wrap"><table className="lm-table"><thead><tr><th>Proposal</th><th>Lead</th><th>Client</th><th>Purpose</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>
          {data.results.map((proposal) => <tr key={proposal.id}>
            <td><button type="button" className="lm-link" onClick={() => openProposal(proposal)}>{proposal.proposal_no}</button></td>
            <td>{proposal.source_lead ? <button type="button" className="lm-link" onClick={() => onViewLead?.({ id: proposal.source_lead.id })}>{proposal.source_lead.lead_number}</button> : <span className="lm-muted">Manual</span>}</td>
            <td>{proposal.client?.company_name || proposal.client?.name || proposal.company_name || "—"}</td>
            <td>{proposal.purpose || "—"}</td><td>{fmt(proposal.total_amount)}</td>
            <td><span className={`lm-proposal-status lm-proposal-status--${proposal.status || "draft"}`}>{compactLabel(proposal.status || "draft")}</span></td>
            <td>{fmtDate(proposal.date)}</td>
            <td><button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => openProposal(proposal)}><Eye size={14} /> Open</button></td>
          </tr>)}
        </tbody></table></div>}

      {totalPages > 1 && <div className="lm-pagination"><button className="lm-btn lm-btn--ghost lm-btn--sm" disabled={page <= 1} onClick={() => setPage(value => value - 1)}><ChevronLeft size={14} /></button><span>Page {page} of {totalPages}</span><button className="lm-btn lm-btn--ghost lm-btn--sm" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}><ChevronRight size={14} /></button></div>}
    </div>
  );
}

function AllProposalRequestsView({ onViewLead }) {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api.proposalRequests()
      .then((response) => { if (!cancelled) setRequests(response.data || []); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.error || "Could not load proposal requests."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter && request.status !== statusFilter) return false;
      if (!query) return true;
      return [request.lead_number, request.lead_name, request.requested_by_name, request.notes]
        .some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [requests, search, statusFilter]);

  const counts = useMemo(() => requests.reduce((summary, request) => {
    summary.all += 1;
    summary[request.status] = (summary[request.status] || 0) + 1;
    return summary;
  }, { all: 0, pending: 0, in_progress: 0, completed: 0, rejected: 0 }), [requests]);
  const openLead = (leadId) => {
    api.get(leadId)
      .then((response) => onViewLead?.(response.data))
      .catch(() => setError("This lead could not be opened."));
  };

  return (
    <section className="lm-profile-panel lm-my-proposals lm-all-proposal-requests">
      <div className="lm-my-proposals__head">
        <div><h3>All Proposal Requests</h3><p>Review requests submitted from sales users and create proposals for their leads.</p></div>
        <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => setRefreshKey(value => value + 1)}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className="lm-my-proposals__stats">
        <StatCard label="All Requests" value={counts.all} icon={FileText} color="#4f46e5" />
        <StatCard label="Pending" value={counts.pending} icon={Clock} color="#f59e0b" />
        <StatCard label="In Progress" value={counts.in_progress} icon={Loader2} color="#0284c7" />
        <StatCard label="Completed" value={counts.completed} icon={CheckCircle2} color="#16a34a" />
      </div>
      <div className="lm-my-proposals__toolbar">
        <div className="lm-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search lead, customer or requester..." /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">All statuses</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? <div className="lm-center-state"><Loader2 size={30} className="spin" /><p>Loading proposal requests...</p></div>
        : error ? <div className="lm-center-state"><AlertCircle size={30} /><p>{error}</p><button className="lm-btn lm-btn--primary lm-btn--sm" onClick={() => setRefreshKey(value => value + 1)}>Try again</button></div>
        : filteredRequests.length === 0 ? <div className="lm-center-state"><Inbox size={32} /><p>No proposal requests found.</p></div>
        : <div className="lm-table-wrap"><table className="lm-table"><thead><tr><th>Lead</th><th>Customer</th><th>Requested By</th><th>Requested</th><th>Notes</th><th>Status</th><th>Proposal</th><th /></tr></thead><tbody>
          {filteredRequests.map((request) => <tr key={request.id}>
            <td><button type="button" className="lm-link" onClick={() => openLead(request.lead)}>{request.lead_number}</button></td>
            <td>{request.lead_name}</td><td>{request.requested_by_name || "—"}</td><td>{fmtDate(request.created_at)}</td><td>{request.notes || "—"}</td>
            <td><span className={`lm-proposal-status lm-proposal-status--${request.status}`}>{compactLabel(request.status)}</span></td>
            <td>{request.proposal ? <button type="button" className="lm-link" onClick={() => router.push(`/proposal?proposal=${request.proposal.id}`)}>{request.proposal.proposal_no}</button> : <span className="lm-muted">Not created</span>}</td>
            <td>{request.proposal
              ? <button type="button" className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => router.push(`/proposal?proposal=${request.proposal.id}`)}><Eye size={14} /> Open</button>
              : <button type="button" className="lm-btn lm-btn--primary lm-btn--sm" onClick={() => router.push(`/proposal?lead=${request.lead}`)}><Plus size={14} /> Create Proposal</button>}
            </td>
          </tr>)}
        </tbody></table></div>}
    </section>
  );
}

function MyProfileView({ onViewLead, canTelecall, onCallLogged, onTargetUploaded }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingLead, setEditingLead] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTargetList, setSelectedTargetList] = useState(null);
  const [editingTargetList, setEditingTargetList] = useState(null);
  const [targetListForm, setTargetListForm] = useState({ name: "", scope_date: "", campaign: "", source: "", description: "", status: "ACTIVE" });
  const [savingTargetList, setSavingTargetList] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showScopeUploadModal, setShowScopeUploadModal] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingCustomerListId, setPendingCustomerListId] = useState(null);
  const [pendingListName, setPendingListName] = useState("");
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => localDateInputValue());
  const [leadOwnershipFilter, setLeadOwnershipFilter] = useState("ASSIGNED");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetSearchQuery, setTargetSearchQuery] = useState("");
  const { showAlert } = useModal();
  const pageSize = 25;

  const ownLeads = useMemo(() => profile?.leads?.results || [], [profile]);
  const person = profile?.user || {};
  const personId = person?.id != null ? String(person.id) : "";

  const getLeadUserId = (value) => {
    if (value && typeof value === "object") return value.id != null ? String(value.id) : "";
    return value != null ? String(value) : "";
  };

  const assignedLeadCount = useMemo(
    () => ownLeads.filter(lead => getLeadUserId(lead.assigned_to) === personId).length,
    [ownLeads, personId]
  );
  const selfCreatedLeadCount = useMemo(
    () => ownLeads.filter(lead => getLeadUserId(lead.created_by) === personId && getLeadUserId(lead.assigned_to) !== personId).length,
    [ownLeads, personId]
  );

  const targetBatchOptions = useMemo(() => {
    const listNames = new Set((profile?.target_lists || []).map(l => l.name));
    (ownLeads || []).forEach(l => {
      if (l.target_list_name) listNames.add(l.target_list_name);
    });
    return Array.from(listNames);
  }, [profile, ownLeads]);

  const filteredLeads = useMemo(() => {
    let result = ownLeads.filter(lead => {
      const assignedToId = getLeadUserId(lead.assigned_to);
      const createdById = getLeadUserId(lead.created_by);
      if (leadOwnershipFilter === "SELF_CREATED") {
        return createdById === personId && assignedToId !== personId;
      }
      return assignedToId === personId;
    });
    if (batchFilter === "DIRECT") {
      result = result.filter(l => !l.target_list_name);
    } else if (batchFilter !== "ALL") {
      result = result.filter(l => l.target_list_name === batchFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(l => {
        const company = (l.company_name || "").toLowerCase();
        const customer = (l.customer_name || "").toLowerCase();
        const contact = (l.contact_person || "").toLowerCase();
        const phone = (l.phone || "").toLowerCase();
        const email = (l.email || "").toLowerCase();
        const leadNo = (l.lead_number || "").toLowerCase();
        const service = (l.service || "").toLowerCase();
        const product = (l.product || "").toLowerCase();
        const batch = (l.target_list_name || "").toLowerCase();
        return company.includes(q) || customer.includes(q) || contact.includes(q) ||
               phone.includes(q) || email.includes(q) || leadNo.includes(q) ||
               service.includes(q) || product.includes(q) || batch.includes(q);
      });
    }

    return result;
  }, [ownLeads, leadOwnershipFilter, personId, batchFilter, searchQuery]);

  const filteredTargetLists = useMemo(() => {
    const lists = profile?.target_lists || [];
    if (!targetSearchQuery.trim()) return lists;
    const q = targetSearchQuery.toLowerCase().trim();
    return lists.filter(l => {
      const name = (l.name || "").toLowerCase();
      const campaign = (l.campaign_name || "").toLowerCase();
      const desc = (l.description || "").toLowerCase();
      const uploader = (l.uploaded_by_name || "").toLowerCase();
      const scopeDate = (l.scope_date || "").toLowerCase();
      return name.includes(q) || campaign.includes(q) || desc.includes(q) || uploader.includes(q) || scopeDate.includes(q);
    });
  }, [profile?.target_lists, targetSearchQuery]);

  const downloadTemplate = async () => {
    try {
      const [excel, saver] = await Promise.all([
        import('exceljs'),
        import('file-saver')
      ]);
      const ExcelJS = excel.default || excel;
      const saveAs = saver.default?.saveAs || saver.saveAs || saver.default || saver;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Target Customers Template');

      worksheet.columns = [
        { header: 'company_name', key: 'company_name', width: 25 },
        { header: 'customer_name', key: 'customer_name', width: 25 },
        { header: 'contact_person', key: 'contact_person', width: 25 },
        { header: 'phone', key: 'phone', width: 20 },
        { header: 'whatsapp_number', key: 'whatsapp_number', width: 20 },
        { header: 'email', key: 'email', width: 25 },
        { header: 'website', key: 'website', width: 25 },
        { header: 'address', key: 'address', width: 30 },
        { header: 'city', key: 'city', width: 15 },
        { header: 'state', key: 'state', width: 15 },
        { header: 'industry', key: 'industry', width: 20 },
        { header: 'business_category', key: 'business_category', width: 25 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
      headerRow.height = 28;

      const sampleRow = worksheet.addRow({
        company_name: 'Adstra Digital',
        customer_name: 'John Doe',
        contact_person: 'John Doe',
        phone: '+919876543210',
        whatsapp_number: '+919876543210',
        email: 'john@adstradigital.com',
        website: 'https://adstradigital.com',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        industry: 'IT',
        business_category: 'Software Development',
      });

      worksheet.columns.forEach(col => {
        const cell = sampleRow.getCell(col.key);
        cell.numFmt = '@';
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Target_Customers_Template_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error("Failed to generate template excel", err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!profile) setLoading(true);
    setError("");
    api.myProfile({ page, page_size: pageSize, schedule_date: scheduleDate })
      .then((response) => {
        if (!cancelled) {
          setProfile(response.data);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.detail || err.response?.data?.error || "Failed to load your profile data.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, refreshKey, scheduleDate]);

  if (loading && !profile) {
    return <div className="lm-center-state"><Loader2 size={32} className="spin" /><p>Loading your profile...</p></div>;
  }
  if (error && !profile) {
    return <div className="lm-center-state"><AlertCircle size={34} /><p>{error}</p><button className="lm-btn lm-btn--primary lm-btn--sm" onClick={() => setRefreshKey(value => value + 1)}>Try Again</button></div>;
  }

  const overview = profile?.overview || {};
  const totalLeads = Number(overview.total_leads) || 0;
  const convertedLeads = Number(overview.converted_leads) || 0;
  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const pendingFollowUps = Number(overview.pending_follow_ups) || 0;
  const openTasks = Number(overview.open_tasks) || 0;
  const pendingWork = pendingFollowUps + openTasks;
  const monthlyIncentive = profile?.monthly_incentive || {};
  const monthlyConversionValue = Number(monthlyIncentive.conversion_value) || 0;
  const stageChartData = (profile?.stage_summary || []).map(item => ({
    key: item.current_stage,
    name: STAGE_META[item.current_stage]?.label || item.current_stage,
    value: Number(item.count) || 0,
    color: STAGE_META[item.current_stage]?.color || "#64748b",
  })).filter(item => item.value > 0);
  const activityChartData = [
    { name: "Calls", value: Number(overview.calls_made) || 0, color: "#3b82f6" },
    { name: "Emails", value: Number(overview.emails_sent) || 0, color: "#8b5cf6" },
    { name: "Meetings", value: Number(overview.meetings) || 0, color: "#06b6d4" },
    { name: "Conversions", value: Number(overview.conversions) || 0, color: "#16a34a" },
  ];
  const hasActivity = activityChartData.some(item => item.value > 0);
  const recentActivity = (profile?.recent_activity || []).slice(0, 3);
  const totalPages = Math.max(1, Math.ceil((profile?.leads?.count || 0) / pageSize));
  const openLead = (lead) => {
    if (lead?.current_stage) {
      onViewLead(lead);
      return;
    }
    api.get(lead?.id || lead)
      .then(response => onViewLead(response.data))
      .catch(() => setError("This lead could not be opened."));
  };

  const openLeadEdit = (lead) => {
    api.get(lead?.id || lead)
      .then(response => setEditingLead(response.data))
      .catch(() => setError("This lead could not be edited."));
  };

  const handleProfileLeadSaved = () => {
    setEditingLead(null);
    setRefreshKey(value => value + 1);
    showAlert("Saved", "Lead updated.", "success");
  };

  const handleCancelImport = () => {
    setImportResult(null);
    setPendingFile(null);
    setPendingCustomerListId(null);
    setPendingListName("");
  };

  const handleCommitImport = async () => {
    if (!pendingFile || !pendingCustomerListId) return;

    setIsSavingImport(true);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      fd.append("mode", "targets");
      fd.append("customer_list", pendingCustomerListId);

      const res = await ax("post", "/lead-import/", fd, {
        headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
      });

      setImportResult(null);
      setPendingFile(null);
      setPendingCustomerListId(null);
      setPendingListName("");
      setRefreshKey(v => v + 1);
      showAlert("Import Complete", `Successfully imported ${res.data.created_count} record(s).`, "success");
    } catch (err) {
      showAlert(
        "Import Error",
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.errors?.[0] ||
          err.response?.data?.error ||
          "Save failed.",
        "error"
      );
    } finally {
      setIsSavingImport(false);
    }
  };

  const openTargetListEdit = (list) => {
    setEditingTargetList(list);
    setTargetListForm({
      name: list.name || "",
      scope_date: list.scope_date || "",
      campaign: list.campaign || "",
      source: list.source || "",
      description: list.description || "",
      status: list.status || "ACTIVE",
    });
  };

  const closeTargetListEdit = () => {
    setEditingTargetList(null);
    setTargetListForm({ name: "", scope_date: "", campaign: "", source: "", description: "", status: "ACTIVE" });
  };

  const saveTargetListEdit = async (event) => {
    event.preventDefault();
    if (!editingTargetList?.id) return;
    if (!targetListForm.name.trim()) {
      showAlert("Required", "Target scope name is required.", "warning");
      return;
    }

    setSavingTargetList(true);
    try {
      const payload = {
        ...targetListForm,
        name: targetListForm.name.trim(),
        scope_date: targetListForm.scope_date || null,
      };
      const res = await ax("patch", `/lead-lists/${editingTargetList.id}/`, payload);
      setSelectedTargetList(prev => prev?.id === editingTargetList.id ? { ...prev, ...res.data } : prev);
      closeTargetListEdit();
      setRefreshKey(v => v + 1);
      showAlert("Saved", "Target scope updated successfully.", "success");
    } catch (err) {
      showAlert(
        "Save Error",
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.error ||
          "Failed to update target scope.",
        "error"
      );
    } finally {
      setSavingTargetList(false);
    }
  };
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "leads", label: "Leads", icon: LayoutList, count: profile?.leads?.count || 0 },
    { id: "targets", label: "Target Lists", icon: Building2, count: profile?.target_lists?.length || 0 },
    ...(canTelecall ? [{ id: "telecalling", label: "Telecalling", icon: PhoneCall, count: profile?.telecalling_leads?.length || 0 }] : []),
    { id: "meetings", label: "Meetings", icon: Users, count: profile?.meetings?.length || 0 },
    { id: "proposals", label: "My Proposals", icon: FileText },
    { id: "performance", label: "Performance Report", icon: BarChart2 },
    { id: "incentive", label: "My Incentive", icon: BadgePercent },
  ];

  return (
    <section className="lm-my-profile">
      {error && <div className="lm-profile-warning"><AlertCircle size={16} /> {error}</div>}

      <div className="lm-profile-tabs" role="tablist" aria-label="My profile sections">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} role="tab" aria-selected={activeTab === id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>
            <Icon size={16} /> {label}{count !== undefined && <span>{count}</span>}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <div className="lm-profile-panel lm-profile-overview">
        <header className="lm-profile-overview-intro">
          <div><span className="lm-profile-overview-eyebrow">Personal workspace</span><h2>Good to see you, {(person.fullname || person.username || "there").split(" ")[0]}.</h2><p>You currently have <strong>{totalLeads} {totalLeads === 1 ? "lead" : "leads"}</strong> and <strong>{pendingWork} pending work {pendingWork === 1 ? "item" : "items"}</strong> in your pipeline.</p></div>
          <span className="lm-profile-overview-status"><span /> Current snapshot</span>
        </header>

        <div className="lm-profile-overview-kpis" aria-label="Personal sales summary">
          <article><span className="lm-profile-overview-kpi-icon indigo"><LayoutList size={18} /></span><div><small>Total leads</small><strong>{totalLeads}</strong><p>{Number(overview.assigned_leads) || 0} assigned · {Number(overview.created_leads) || 0} created</p></div></article>
          <article><span className="lm-profile-overview-kpi-icon green"><TrendingUp size={18} /></span><div><small>Converted</small><strong>{convertedLeads}</strong><p>{conversionRate}% conversion rate</p></div></article>
          <article><span className="lm-profile-overview-kpi-icon blue"><PhoneCall size={18} /></span><div><small>Calls made</small><strong>{Number(overview.calls_made) || 0}</strong><p>Cumulative activity</p></div></article>
          <article><span className="lm-profile-overview-kpi-icon amber"><Clock size={18} /></span><div><small>Pending work</small><strong>{pendingWork}</strong><p>{pendingFollowUps} follow-ups · {openTasks} tasks</p></div></article>
        </div>

        <MonthlyIncentiveCard monthlyIncentive={monthlyIncentive} monthlyConversionValue={monthlyConversionValue} />

        <div className="lm-profile-overview-charts">
          <section className="lm-profile-overview-card">
            <div className="lm-profile-overview-card-head"><div><span>Pipeline</span><h3>Lead stage distribution</h3></div><small>{stageChartData.length} active {stageChartData.length === 1 ? "stage" : "stages"}</small></div>
            <div className="lm-profile-overview-stage-layout">
              <div className="lm-profile-overview-donut" role="img" aria-label={`Lead stage distribution. ${stageChartData.map(item => `${item.name}: ${item.value}`).join(", ") || "No leads"}.`}>
                {stageChartData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stageChartData} dataKey="value" nameKey="name" innerRadius="69%" outerRadius="92%" paddingAngle={stageChartData.length > 1 ? 2 : 0} stroke="#fff" strokeWidth={3}>{stageChartData.map(item => <Cell key={item.key} fill={item.color} />)}</Pie><Tooltip formatter={(value, name) => [`${value} leads`, name]} /></PieChart></ResponsiveContainer> : <div className="lm-profile-overview-donut-empty" />}
                <div className="lm-profile-overview-donut-total"><strong>{totalLeads}</strong><span>Total leads</span></div>
              </div>
              <div className="lm-profile-overview-stage-legend">
                {stageChartData.map(item => <div key={item.key}><span className="lm-profile-overview-stage-dot" style={{ background: item.color }} /><span><strong>{item.name}</strong><small>{totalLeads ? Math.round((item.value / totalLeads) * 100) : 0}% of leads</small></span><b>{item.value}</b></div>)}
                {!stageChartData.length && <div className="lm-profile-overview-inline-empty"><Inbox size={20} /><span><strong>No lead stages yet</strong><small>Stage distribution will appear as leads are added.</small></span></div>}
              </div>
            </div>
          </section>

          <section className="lm-profile-overview-card">
            <div className="lm-profile-overview-card-head"><div><span>Current activity</span><h3>Personal activity mix</h3></div><small>Cumulative totals</small></div>
            <div className="lm-profile-overview-activity-chart" role="img" aria-label={`Cumulative activity. ${activityChartData.map(item => `${item.name}: ${item.value}`).join(", ")}.`}>
              {hasActivity ? <ResponsiveContainer width="100%" height="100%"><BarChart data={activityChartData} margin={{ top: 12, right: 4, left: -24, bottom: 0 }} barCategoryGap="28%"><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={value => [value, "Count"]} /><Bar dataKey="value" radius={[6, 6, 2, 2]}>{activityChartData.map(item => <Cell key={item.name} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer> : <div className="lm-profile-overview-chart-empty"><BarChart2 size={28} /><strong>No activity recorded yet</strong><span>Calls, emails, meetings and conversions will appear here.</span></div>}
            </div>
          </section>
        </div>

        <div className="lm-profile-overview-lower">
          <section className="lm-profile-overview-card">
            <div className="lm-profile-overview-card-head"><div><span>Attention</span><h3>Work snapshot</h3></div></div>
            <div className="lm-profile-overview-work-list">
              <div><span className="amber"><Clock size={17} /></span><p><strong>{pendingFollowUps}</strong><small>Pending follow-ups</small></p></div>
              <div className={(Number(overview.overdue_follow_ups) || 0) > 0 ? "is-alert" : ""}><span className="red"><AlertCircle size={17} /></span><p><strong>{Number(overview.overdue_follow_ups) || 0}</strong><small>Overdue follow-ups</small></p></div>
              <div><span className="blue"><CheckCircle2 size={17} /></span><p><strong>{openTasks}</strong><small>Open tasks</small></p></div>
              <div><span className="violet"><Users size={17} /></span><p><strong>{Number(overview.upcoming_meetings) || 0}</strong><small>Upcoming meetings</small></p></div>
            </div>
          </section>

          <section className="lm-profile-overview-card">
            <div className="lm-profile-overview-card-head"><div><span>Latest updates</span><h3>Recent activity</h3></div><small>{profile?.recent_activity?.length || 0} total</small></div>
            <div className="lm-profile-overview-recent">
              {recentActivity.map(item => { const ActivityIcon = item.type === "EMAIL" ? Mail : item.type === "CALL" ? PhoneCall : item.type === "MEETING" ? Users : Zap; return <button key={item.id} type="button" onClick={() => openLead(item.lead_id)}><span><ActivityIcon size={15} /></span><p><strong>{item.title || item.type}</strong><small>{item.lead_name} · {fmtDateTime(item.created_at)}</small></p><em>{item.type}</em><ChevronRight size={15} /></button>; })}
              {!recentActivity.length && <div className="lm-profile-overview-recent-empty"><Zap size={21} /><div><strong>Your activity feed is ready</strong><p>Recent lead interactions will be shown here.</p></div></div>}
            </div>
          </section>
        </div>
      </div>}

      {activeTab === "leads" && <div className="lm-profile-panel">
        <div className="lm-profile-leads-toolbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {leadOwnershipFilter === "SELF_CREATED" ? "Self Created Leads" : "Assigned Leads"} <span style={{ color: "#64748b", fontWeight: 400 }}>({filteredLeads.length})</span>
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: 4, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 8 }}>
              <button
                type="button"
                className={`lm-btn lm-btn--sm ${leadOwnershipFilter === "ASSIGNED" ? "lm-btn--primary" : "lm-btn--ghost"}`}
                onClick={() => setLeadOwnershipFilter("ASSIGNED")}
              >
                Assigned <span className="lm-badge">{assignedLeadCount}</span>
              </button>
              <button
                type="button"
                className={`lm-btn lm-btn--sm ${leadOwnershipFilter === "SELF_CREATED" ? "lm-btn--primary" : "lm-btn--ghost"}`}
                onClick={() => setLeadOwnershipFilter("SELF_CREATED")}
              >
                Self Created <span className="lm-badge">{selfCreatedLeadCount}</span>
              </button>
            </div>
            {/* Global Search Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search leads, contacts, phone, batch..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, width: 220, color: "#0f172a" }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#94a3b8", fontSize: 14, fontWeight: 700 }}>
                  ×
                </button>
              )}
            </div>

            {/* Searchable Batch Filter Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={14} color="#64748b" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Filter Batch:</span>
              <SearchableBatchSelect
                options={targetBatchOptions}
                value={batchFilter}
                onChange={setBatchFilter}
                totalCount={ownLeads.length}
              />
            </div>
          </div>
        </div>

        <div className="lm-table-wrap">
          {filteredLeads.length === 0 ? <div className="lm-center-state"><p>No leads match the selected target batch filter.</p></div> : <table className="lm-table">
            <thead>
              <tr>
                <th style={{ width: 65, textAlign: "center" }}>#</th>
                <th>LEAD & CONTACT</th>
                <th>TARGET SCOPE / BATCH</th>
                <th>SERVICE / PRODUCT</th>
                <th>CREATED AT</th>
                <th>LAST FOLLOW-UP</th>
                <th>NEXT FOLLOW-UP</th>
                <th style={{ textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, idx) => {
                const priorityLetter = lead.priority === "HIGH" ? "H" : lead.priority === "LOW" ? "L" : "M";
                const priorityColor = lead.priority === "HIGH" ? "#dc2626" : lead.priority === "LOW" ? "#16a34a" : "#d97706";
                const priorityBg = lead.priority === "HIGH" ? "#fef2f2" : lead.priority === "LOW" ? "#f0fdf4" : "#fffbeb";
                const priorityBorder = lead.priority === "HIGH" ? "#fca5a5" : lead.priority === "LOW" ? "#86efac" : "#fcd34d";
                const priorityAccent = lead.priority === "HIGH" ? "#ef4444" : lead.priority === "LOW" ? "#10b981" : "#f59e0b";

                const lastFollowDate = lead.last_follow_up?.completed_at || lead.last_follow_up?.scheduled_at || lead.next_follow_up_at || lead.updated_at;
                const lastFollowNote = lead.last_follow_up?.notes || lead.last_follow_up?.purpose || lead.last_follow_up?.result || lead.requirement_summary || "—";

                return (
                  <tr key={lead.id} style={{ borderLeft: `4px solid ${priorityAccent}` }}>
                    <td style={{ color: "#475569", paddingLeft: 12 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: priorityBg,
                            color: priorityColor,
                            border: `1.5px solid ${priorityBorder}`,
                            display: "inline-grid",
                            placeItems: "center",
                            fontSize: 10.5,
                            fontWeight: 700,
                            lineHeight: 1,
                            flexShrink: 0,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
                          }}
                          title={`Priority: ${lead.priority || "Medium"}`}
                        >
                          {priorityLetter}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{(page - 1) * pageSize + idx + 1}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                        {lead.company_name || lead.customer_name || "—"}
                      </div>
                      {lead.contact_person && (
                        <div style={{ fontSize: 12, color: "#334155", fontWeight: 600, marginTop: 1 }}>
                          Contact: {lead.contact_person}
                        </div>
                      )}
                      <small className="lm-table-sub" style={{ color: "#64748b", fontSize: 11 }}>
                        {lead.lead_number ? `${lead.lead_number} · ` : ""}{lead.email || lead.phone || "—"}
                      </small>
                    </td>
                    <td>
                      {lead.target_list_name ? (() => {
                        const bStyle = getBatchStyle(lead.target_list_name);
                        return (
                          <span
                            style={{
                              padding: "3px 9px",
                              background: bStyle.bg,
                              color: bStyle.text,
                              border: `1px solid ${bStyle.border}`,
                              borderRadius: 6,
                              fontWeight: 600,
                              fontSize: 11,
                              display: "inline-block"
                            }}
                          >
                            {lead.target_list_name}
                          </span>
                        );
                      })() : (
                        <span style={{ padding: "3px 8px", background: "#f1f5f9", color: "#64748b", borderRadius: 4, fontSize: 11, display: "inline-block" }}>
                          Direct Lead
                        </span>
                      )}
                    </td>
                    <td>{lead.service || lead.product || "—"}</td>
                    <td style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>
                      {lead.created_at ? fmtDateTime(lead.created_at) : "—"}
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                        {lastFollowDate ? fmtDateTime(lastFollowDate) : "—"}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#64748b", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        title={typeof lastFollowNote === "string" ? lastFollowNote : ""}
                      >
                        {lastFollowNote}
                      </div>
                    </td>
                    <td>
                      {lead.next_follow_up_at ? (
                        <div className={isOverdue(lead.next_follow_up_at) ? "lm-overdue" : ""} style={{ fontSize: 12, fontWeight: 600 }}>
                          {fmtDateTime(lead.next_follow_up_at)}
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <button className="lm-icon-btn" title="View lead" onClick={() => openLead(lead)}>
                          <Eye size={16} />
                        </button>
                        <button className="lm-icon-btn" title="Edit lead" onClick={() => openLeadEdit(lead)}>
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>}
        </div>
        {totalPages > 1 && <div className="lm-pagination"><button disabled={page === 1 || loading} onClick={() => setPage(value => value - 1)}><ChevronLeft size={15} /> Previous</button><span>Page {page} of {totalPages}</span><button disabled={page === totalPages || loading} onClick={() => setPage(value => value + 1)}>Next <ChevronRight size={15} /></button></div>}
      </div>}

      {activeTab === "targets" && <div className="lm-profile-panel">
        <>
          <div className="lm-profile-target-header">
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Target Lists Scope</h3>
              <p className="lm-muted" style={{ margin: "4px 0 0", fontSize: 12 }}>Define a dated scope, then add contacts inside it.</p>
            </div>
            <div className="lm-profile-target-actions">
              <button className="lm-btn lm-btn--primary lm-btn--sm" onClick={() => setShowUploadModal(true)} type="button"><Plus size={14} /> Create Target Scope</button>
              <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={downloadTemplate} type="button"><Download size={14} /> Download Template</button>
            </div>
          </div>
          <div className="lm-profile-stat-grid">
            <StatCard label="My Target Lists" value={profile?.target_summary?.total_lists || 0} icon={Building2} color="#6366f1" />
            <StatCard label="Target Contacts" value={profile?.target_summary?.total_customers || 0} icon={Users} color="#0891b2" />
            <StatCard label="Do Not Call" value={profile?.target_summary?.do_not_call || 0} icon={PhoneMissed} color="#ef4444" />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 12px", flexWrap: "wrap", gap: 10 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Target Scopes / Batches <span style={{ color: "#64748b", fontWeight: 400 }}>({filteredTargetLists.length})</span>
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search target scope or batch..."
                value={targetSearchQuery}
                onChange={e => setTargetSearchQuery(e.target.value)}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, width: 220, color: "#0f172a" }}
              />
              {targetSearchQuery && (
                <button type="button" onClick={() => setTargetSearchQuery("")} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#94a3b8", fontSize: 14, fontWeight: 700 }}>
                  ×
                </button>
              )}
            </div>
          </div>

          {filteredTargetLists.length === 0 ? (
            <div className="lm-center-state"><Building2 size={34} /><p>{targetSearchQuery ? `No target scopes match "${targetSearchQuery}"` : "No target lists are assigned to or created by you."}</p></div>
          ) : (
            <div className="lm-table-wrap" style={{ marginTop: 8 }}>
              <table className="lm-table" style={{ fontSize: 12.5, width: "100%", whiteSpace: "nowrap" }}>
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: "center" }}>#</th>
                    <th style={{ minWidth: 220 }}>Target Scope / Batch Name</th>
                    <th style={{ minWidth: 140 }}>Campaign</th>
                    <th style={{ width: 100, textAlign: "center" }}>Status</th>
                    <th style={{ width: 120, textAlign: "center" }}>Total Contacts</th>
                    <th style={{ minWidth: 130 }}>Scope Date</th>
                    <th style={{ width: 140, textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTargetLists.map((list, idx) => (
                    <tr key={list.id} style={{ cursor: "pointer" }} onClick={() => setSelectedTargetList(list)}>
                      <td style={{ textAlign: "center", color: "#64748b" }}>{idx + 1}</td>
                      <td>
                        <strong style={{ color: "#0f172a" }}>{list.name}</strong>
                        {list.description && <div style={{ fontSize: 11, color: "#64748b" }}>{list.description}</div>}
                      </td>
                      <td>{list.campaign || "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`lm-badge lm-badge--${list.status === "ACTIVE" ? "green" : "gray"}`}>{list.status}</span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600, color: "#4f46e5" }}>
                        {list.customer_count || 0} contacts
                      </td>
                      <td style={{ color: "#475569" }}>
                        {fmtDate(list.scope_date || list.updated_at || list.created_at)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <button
                            type="button"
                            className="lm-btn lm-btn--ghost lm-btn--sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTargetListEdit(list);
                            }}
                            style={{ fontSize: 11, padding: "4px 10px" }}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        <button
                          type="button"
                          className="lm-btn lm-btn--primary lm-btn--sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTargetList(list);
                          }}
                          style={{ fontSize: 11, padding: "4px 10px" }}
                        >
                          View Batch Contacts
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      </div>}

      {editingLead && (
        <LeadForm
          initial={editingLead}
          onClose={() => setEditingLead(null)}
          onSaved={handleProfileLeadSaved}
        />
      )}

      {selectedTargetList && activeTab === "targets" && (
        <TargetListDetailModal
          targetList={selectedTargetList}
          refreshToken={refreshKey}
          selectedUser={person}
          onClose={() => setSelectedTargetList(null)}
          onBulkUpload={() => setShowScopeUploadModal(true)}
          onContactsChanged={() => setRefreshKey(v => v + 1)}
          onConfirmLeads={async (listId) => {
            try {
              const res = await ax("post", `/lead-lists/${listId}/convert-to-leads/`, { assigned_to: person.id });
              setSelectedTargetList(null);
              showAlert("Success", res.data.message || "Target contacts processed to Leads.", "success");
              setRefreshKey(v => v + 1);
            } catch (err) {
              showAlert("Error", err.response?.data?.error || "Failed to process target list contacts to leads.", "error");
            }
          }}
        />
      )}

      {editingTargetList && activeTab === "targets" && (
        <div className="lm-overlay" onClick={closeTargetListEdit}>
          <div className="lm-dialog" onClick={e => e.stopPropagation()} style={{ width: "90vw", maxWidth: 560 }}>
            <div className="lm-dialog__head">
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>Edit Target Scope</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>Update batch name, date, campaign and status.</p>
              </div>
              <button className="lm-icon-btn" onClick={closeTargetListEdit}><X size={18} /></button>
            </div>
            <form className="lm-form" onSubmit={saveTargetListEdit}>
              <div className="lm-form__grid">
                <label>
                  <span>Scope / Batch Name</span>
                  <input
                    value={targetListForm.name}
                    onChange={e => setTargetListForm(form => ({ ...form, name: e.target.value }))}
                    placeholder="e.g. Aug 2026"
                    required
                    autoFocus
                  />
                </label>
                <label>
                  <span>Scope Date</span>
                  <input
                    type="date"
                    value={targetListForm.scope_date || ""}
                    onChange={e => setTargetListForm(form => ({ ...form, scope_date: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Campaign</span>
                  <input
                    value={targetListForm.campaign}
                    onChange={e => setTargetListForm(form => ({ ...form, campaign: e.target.value }))}
                    placeholder="Campaign name"
                  />
                </label>
                <label>
                  <span>Source</span>
                  <input
                    value={targetListForm.source}
                    onChange={e => setTargetListForm(form => ({ ...form, source: e.target.value }))}
                    placeholder="e.g. WEBSITE"
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={targetListForm.status}
                    onChange={e => setTargetListForm(form => ({ ...form, status: e.target.value }))}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </label>
                <label className="lm-form__span">
                  <span>Description</span>
                  <textarea
                    value={targetListForm.description}
                    onChange={e => setTargetListForm(form => ({ ...form, description: e.target.value }))}
                    rows={3}
                    placeholder="Scope notes"
                  />
                </label>
              </div>
              <div className="lm-form__actions">
                <button type="button" className="lm-btn lm-btn--ghost" onClick={closeTargetListEdit} disabled={savingTargetList}>Cancel</button>
                <button type="submit" className="lm-btn lm-btn--primary" disabled={savingTargetList}>
                  {savingTargetList && <Loader2 size={15} className="spin" />}
                  {savingTargetList ? "Saving..." : "Save Scope"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <ScopeDefinitionModal
          selectedUser={person}
          onClose={() => setShowUploadModal(false)}
          onSuccess={(createdList) => {
            setShowUploadModal(false);
            setRefreshKey(v => v + 1);
            if (onTargetUploaded) onTargetUploaded({ customerListId: createdList.id, listName: createdList.name });
          }}
        />
      )}

      {showScopeUploadModal && selectedTargetList && (
        <UploadTargetModal
          selectedUser={person}
          targetListId={selectedTargetList.id}
          targetListName={selectedTargetList.name}
          onClose={() => setShowScopeUploadModal(false)}
          downloadTemplate={downloadTemplate}
          onUploadSuccess={({ importResult: result, file, customerListId, listName }) => {
            setShowScopeUploadModal(false);
            setImportResult(result);
            setPendingFile(file);
            setPendingCustomerListId(customerListId);
            setPendingListName(listName || selectedTargetList.name);
          }}
        />
      )}

      {importResult && (
        <ImportResultModal
          result={{ ...importResult, listName: importResult.listName || pendingListName }}
          onClose={handleCancelImport}
          onCancel={handleCancelImport}
          onSave={handleCommitImport}
          isSaving={isSavingImport}
        />
      )}

      {activeTab === "telecalling" && <div className="lm-profile-panel">
        <DailyTelecallingView
          leads={profile?.telecalling_leads || []}
          schedule={profile?.telecalling_schedule || {}}
          selectedDate={scheduleDate}
          onDateChange={setScheduleDate}
          onViewLead={openLead}
          onScheduleChanged={() => setRefreshKey(value => value + 1)}
          onLeadUpdated={() => setRefreshKey(value => value + 1)}
          onCallLogged={(call) => {
            onCallLogged?.(call);
            setRefreshKey(value => value + 1);
          }}
        />
      </div>}

      {activeTab === "meetings" && (
        <MyProfileMeetingsView
          meetings={profile?.meetings || []}
          leads={ownLeads}
          onViewLead={openLead}
          onChanged={() => setRefreshKey(value => value + 1)}
        />
      )}

      {activeTab === "proposals" && <MyProposalsPanel onViewLead={openLead} />}

      {activeTab === "performance" && <EmployeePerformanceReport report={profile?.performance_report} person={person} recentActivity={profile?.recent_activity || []} openLead={openLead} />}
      {activeTab === "incentive" && <div className="lm-profile-panel lm-profile-incentive-panel"><MonthlyIncentiveCard detailed monthlyIncentive={monthlyIncentive} monthlyConversionValue={monthlyConversionValue} /></div>}
      {false && <div className="lm-profile-panel">
        <div className="lm-profile-stat-grid">
          <StatCard label="Calls Made" value={overview.calls_made || 0} icon={PhoneCall} color="#3b82f6" /><StatCard label="Emails Sent" value={overview.emails_sent || 0} icon={Mail} color="#8b5cf6" />
          <StatCard label="Meetings" value={overview.meetings || 0} icon={Users} color="#06b6d4" sub={`${overview.upcoming_meetings || 0} upcoming`} /><StatCard label="Conversions" value={overview.conversions || 0} icon={Award} color="#16a34a" />
        </div>
        <div className="lm-profile-card"><div className="lm-profile-card__head"><h3>My recent activity</h3><span>{profile?.recent_activity?.length || 0}</span></div>
          <div className="lm-profile-list">{(profile?.recent_activity || []).map(item => <button key={item.id} onClick={() => openLead(item.lead_id)}>
            <span className="lm-profile-list__icon"><Zap size={15} /></span><span><strong>{item.title}</strong><small>{item.lead_name} · {fmtDateTime(item.created_at)}</small></span><em>{item.type}</em>
          </button>)}{(profile?.recent_activity || []).length === 0 && <p className="lm-muted">No activity recorded yet.</p>}</div>
        </div>
      </div>}
    </section>
  );
}

// ─── Telecalling Workspace ────────────────────────────────────────────────────

// ─── Email Templates ─────────────────────────────────────────────────────────

function DailyTelecallingView({ leads, schedule, selectedDate, onDateChange, onViewLead, onCallLogged, onScheduleChanged, onLeadUpdated }) {
  const [queueType, setQueueType] = useState("scheduled");
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [whatsappLead, setWhatsappLead] = useState(null);
  const [overridePriorities, setOverridePriorities] = useState({});
  const [savingPriorityId, setSavingPriorityId] = useState(null);
  const { showAlert } = useModal();
  const queueChoiceRef = useRef({ date: null, manual: false });
  const scheduledIds = schedule?.scheduled_lead_ids || [];
  const overdueIds = schedule?.overdue_lead_ids || [];
  const unscheduledIds = schedule?.unscheduled_lead_ids || [];
  const completedIds = schedule?.completed_lead_ids || [];
  const scheduledItems = schedule?.scheduled_items || [];
  const activePhoneItems = schedule?.active_phone_items || scheduledItems;
  const ids = useMemo(() => ({ scheduled: new Set(scheduledIds), overdue: new Set(overdueIds), unscheduled: new Set(unscheduledIds) }), [scheduledIds, overdueIds, unscheduledIds]);
  const scheduleByLead = useMemo(() => new Map(activePhoneItems.map(item => [item.lead_id, item])), [activePhoneItems]);

  const effectiveLeads = useMemo(() => {
    return (leads || []).map(l => overridePriorities[l.id] ? { ...l, priority: overridePriorities[l.id] } : l);
  }, [leads, overridePriorities]);

  const sortedLeads = useMemo(() => [...effectiveLeads].sort((a, b) => {
    const aTime = scheduleByLead.get(a.id)?.scheduled_at;
    const bTime = scheduleByLead.get(b.id)?.scheduled_at;
    if (aTime || bTime) return new Date(aTime || "2999-01-01") - new Date(bTime || "2999-01-01");
    return (PRIORITY_META[a.priority]?.order ?? 99) - (PRIORITY_META[b.priority]?.order ?? 99);
  }), [effectiveLeads, scheduleByLead]);
  const queue = useMemo(() => queueType === "all" ? sortedLeads : sortedLeads.filter(lead => ids[queueType]?.has(lead.id)), [queueType, sortedLeads, ids]);

  const handlePriorityChange = async (leadId, newPriority) => {
    try {
      setSavingPriorityId(leadId);
      setOverridePriorities(prev => ({ ...prev, [leadId]: newPriority }));
      await api.update(leadId, { priority: newPriority });
      onLeadUpdated?.(leadId, newPriority);
      onScheduleChanged?.();
    } catch (err) {
      setOverridePriorities(prev => {
        const next = { ...prev };
        delete next[leadId];
        return next;
      });
      const d = err.response?.data;
      showAlert("Error", typeof d === "string" ? d : d?.detail || "Failed to update priority.", "error");
    } finally {
      setSavingPriorityId(null);
    }
  };

  useEffect(() => {
    if (String(schedule?.date || "") !== selectedDate) return;
    if (queueChoiceRef.current.date !== selectedDate) {
      queueChoiceRef.current = { date: selectedDate, manual: false };
    }
    if (queueChoiceRef.current.manual) return;

    setQueueType(scheduledIds.length
      ? "scheduled"
      : overdueIds.length
        ? "overdue"
        : unscheduledIds.length
          ? "unscheduled"
          : "all");
  }, [schedule?.date, selectedDate, scheduledIds.length, overdueIds.length, unscheduledIds.length]);

  useEffect(() => {
    if (!queue.some(item => item.id === selectedLeadId)) setSelectedLeadId(queue[0]?.id || null);
  }, [queue, selectedLeadId]);

  const lead = queue.find(item => item.id === selectedLeadId) || queue[0];
  const current = Math.max(0, queue.findIndex(item => item.id === lead?.id));
  const scheduledItem = scheduleByLead.get(lead?.id);
  const isLogged = !!lead && completedIds.includes(lead.id);
  const completedScheduled = scheduledIds.filter(id => completedIds.includes(id)).length;
  const todayValue = localDateInputValue();
  const isToday = selectedDate === todayValue;
  const isPastDate = selectedDate < todayValue;
  const day = new Date(`${selectedDate}T12:00:00`);
  const dateLabel = day.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const desiredTime = new Date(`${selectedDate}T10:00:00`);
  if (isToday && desiredTime <= new Date()) desiredTime.setTime(Date.now() + 60 * 60 * 1000);
  const canScheduleSelectedDate = !isPastDate && localDateInputValue(desiredTime) === selectedDate;
  const tabs = [
    { id: "scheduled", label: "Scheduled", count: scheduledIds.length, tone: "amber" },
    { id: "overdue", label: "Overdue", count: overdueIds.length, tone: "red" },
    { id: "unscheduled", label: "Unscheduled", count: unscheduledIds.length, tone: "slate" },
    { id: "all", label: "All leads", count: leads.length, tone: "indigo" },
  ];
  const move = delta => queue[current + delta] && setSelectedLeadId(queue[current + delta].id);
  const selectQueue = nextQueue => {
    queueChoiceRef.current = { date: selectedDate, manual: true };
    setSelectedLeadId(null);
    setQueueType(nextQueue);
  };
  const changeDate = nextDate => {
    if (!nextDate) return;
    queueChoiceRef.current = { date: nextDate, manual: false };
    setSelectedLeadId(null);
    onDateChange(nextDate);
  };
  const hasScheduledProgress = scheduledIds.length > 0;
  const queueLabel = tabs.find(tab => tab.id === queueType)?.label || "Calls";
  const progressPercent = hasScheduledProgress ? Math.round(completedScheduled / scheduledIds.length * 100) : 0;
  const slideStart = Math.max(0, Math.min(current - 2, Math.max(0, queue.length - 5)));
  const visibleSlides = queue.slice(slideStart, slideStart + 5);
  const whatsappPhone = lead ? (lead.whatsapp_number || lead.phone) : "";

  return <section className="lm-dtc">
    <header className="lm-dtc__planner">
      <div className="lm-dtc__title"><span className="lm-dtc__title-icon"><PhoneCall size={18} /></span><div><h2>Daily telecalling</h2><p>Choose a lead, make the call, and record the outcome.</p></div></div>
      <span className="lm-dtc__queue-summary">{queue.length} {queue.length === 1 ? "lead" : "leads"} in {queueLabel.toLowerCase()}</span>
    </header>

    <div className="lm-dtc__workspace lm-dtc__workspace--split">
      <aside className="lm-dtc__control-tower" aria-label="Telecalling controls and information">
        <div className="lm-dtc__side-scroll">
          <section className="lm-dtc__side-section lm-dtc__side-date">
            <div className="lm-dtc__side-heading"><div><span>Work date</span><strong>{dateLabel}</strong></div>{!isToday && <button type="button" className="lm-dtc__today" onClick={() => changeDate(todayValue)}>Today</button>}</div>
            <input aria-label="Telecalling work date" type="date" value={selectedDate || ""} onChange={event => changeDate(event.target.value)} />
          </section>
          <section className="lm-dtc__side-section">
            <div className="lm-dtc__side-heading"><div><span>Queue filters</span><strong>Focus list</strong></div><Filter size={16} /></div>
            <nav className="lm-dtc__side-filters" aria-label="Telecalling queues">{tabs.map(tab => <button key={tab.id} type="button" className={queueType === tab.id ? "active" : ""} aria-pressed={queueType === tab.id} onClick={() => selectQueue(tab.id)}><i className={tab.tone} /><span>{tab.label}</span><b>{tab.count}</b></button>)}</nav>
          </section>
          <section className="lm-dtc__side-section">
            <div className="lm-dtc__side-heading"><div><span>Daily statistics</span><strong>Workload snapshot</strong></div></div>
            <div className="lm-dtc__side-stats" aria-label="Daily telecalling status"><article className="amber"><Clock size={16} /><div><strong>{schedule?.summary?.scheduled || 0}</strong><span>{isToday ? "Scheduled today" : "Scheduled"}</span></div></article><article className="green"><CheckCircle2 size={16} /><div><strong>{schedule?.summary?.completed || 0}</strong><span>Calls logged</span></div></article><article className="red"><AlertCircle size={16} /><div><strong>{schedule?.summary?.overdue || 0}</strong><span>Overdue</span></div></article><article className="slate"><Inbox size={16} /><div><strong>{schedule?.summary?.unscheduled || 0}</strong><span>Unscheduled</span></div></article></div>
          </section>
          <section className="lm-dtc__side-section">
            <div className="lm-dtc__side-heading"><div><span>Scheduled progress</span><strong>{hasScheduledProgress ? `${completedScheduled} of ${scheduledIds.length} completed` : "No scheduled calls"}</strong></div><b>{progressPercent}%</b></div>
            <div className="lm-dtc__progress-track" role="progressbar" aria-label="Scheduled call progress" aria-valuemin={0} aria-valuemax={scheduledIds.length || 1} aria-valuenow={completedScheduled}><span style={{ width: `${Math.min(100, progressPercent)}%` }} /></div>
            {!hasScheduledProgress && <p className="lm-dtc__side-empty"><Inbox size={15} /> Build the run sheet from unscheduled leads.</p>}
          </section>
          <section className="lm-dtc__side-section lm-dtc__lead-info">
            <div className="lm-dtc__side-heading"><div><span>Selected lead</span><strong>{lead ? (lead.company_name || lead.customer_name || lead.contact_person || "Unnamed lead") : "No lead selected"}</strong></div><Info size={16} /></div>
            {lead ? <dl><div><dt>Source</dt><dd>{SOURCE_LABELS[lead.source] || lead.source || "-"}</dd></div><div><dt>Service / product</dt><dd>{lead.service || lead.product || "-"}</dd></div><div><dt>Assigned to</dt><dd>{lead.assigned_to_name || "Unassigned"}</dd></div><div><dt>Schedule status</dt><dd className={scheduledItem ? "lm-dtc__due" : ""}>{scheduledItem ? fmtDateTime(scheduledItem.scheduled_at) : queueType === "overdue" ? "Overdue" : "Not scheduled"}</dd></div><div><dt>Next follow-up</dt><dd className={isOverdue(lead.next_follow_up_at) ? "lm-overdue" : ""}>{fmtDateTime(lead.next_follow_up_at)}</dd></div></dl> : <p className="lm-dtc__side-empty">Choose a queue with leads to see details.</p>}
          </section>
        </div>
      </aside>
      <main className="lm-dtc__main lm-dtc__deck">
        {!!queue.length && <div className="lm-dtc__slide-rail" aria-label="Visible lead previews">{visibleSlides.map((item, index) => { const itemSchedule = scheduleByLead.get(item.id); const done = completedIds.includes(item.id); return <button key={item.id} type="button" className={item.id === lead?.id ? "selected" : ""} aria-current={item.id === lead?.id ? "true" : undefined} onClick={() => setSelectedLeadId(item.id)}><span className="lm-dtc__slide-index">{done ? <Check size={13} /> : String(slideStart + index + 1).padStart(2, "0")}</span><span><strong>{item.company_name || item.customer_name || item.contact_person || "Unnamed lead"}</strong><small>{itemSchedule ? fmtDateTime(itemSchedule.scheduled_at) : item.phone || "No phone"}</small></span><i style={{ background: PRIORITY_META[item.priority]?.color || "#94a3b8" }} /></button>; })}</div>}
        {lead ? <article className="lm-dtc__lead-card">
          <header className="lm-dtc__lead-head">
            <div>
              <span className="lm-dtc__position">{tabs.find(tab => tab.id === queueType)?.label} queue · {current + 1} of {queue.length}</span>
              <h3>{lead.company_name || lead.customer_name || lead.contact_person || "Unnamed lead"}</h3>
              <p>{lead.contact_person || lead.customer_name || "No contact person provided"} · {lead.lead_number}</p>
            </div>
            <div className="lm-dtc__badges">
              {isLogged && <span className="completed"><CheckCircle2 size={14} /> Completed</span>}
              <StagePill stage={lead.current_stage} />
              <PrioritySelector
                priority={lead.priority}
                disabled={savingPriorityId === lead.id}
                onChange={(newPriority) => handlePriorityChange(lead.id, newPriority)}
              />
            </div>
          </header>
          <div className="lm-dtc__call-bar"><div><small>Phone number</small><strong>{lead.phone || "No phone number"}</strong></div>{lead.phone && <a href={`tel:${lead.phone}`} className="lm-dtc__call"><PhoneCall size={18} /> Call now</a>}{whatsappPhone && <button type="button" className="lm-dtc__contact-action lm-dtc__whatsapp-action" onClick={() => setWhatsappLead(lead)}><MessageSquare size={18} /> WhatsApp</button>}{lead.email && <a href={`mailto:${lead.email}`} className="lm-dtc__contact-action"><Mail size={18} /> Email</a>}</div>
          <div className="lm-dtc__detail-grid">
            <section><h4>Lead context</h4><dl><div><dt>Service / product</dt><dd>{lead.service || lead.product || "—"}</dd></div><div><dt>Source</dt><dd>{SOURCE_LABELS[lead.source] || lead.source || "—"}</dd></div><div><dt>Campaign</dt><dd>{lead.campaign || "—"}</dd></div><div><dt>Estimated value</dt><dd>{fmt(lead.estimated_value)}</dd></div></dl></section>
            <section><h4>Ownership & timing</h4><dl><div><dt>Assigned to</dt><dd>{lead.assigned_to_name || "Unassigned"}</dd></div><div><dt>Schedule status</dt><dd className={scheduledItem ? "lm-dtc__due" : ""}>{scheduledItem ? fmtDateTime(scheduledItem.scheduled_at) : queueType === "overdue" ? "Overdue" : "Not scheduled"}</dd></div><div><dt>Next follow-up</dt><dd className={isOverdue(lead.next_follow_up_at) ? "lm-overdue" : ""}>{fmtDateTime(lead.next_follow_up_at)}</dd></div><div><dt>Purpose</dt><dd>{scheduledItem?.purpose || "—"}</dd></div></dl></section>
          </div>
          <section className="lm-dtc__notes"><h4>Requirement & call notes</h4><p>{lead.requirement_summary || scheduledItem?.notes || "No requirement notes have been added for this lead."}</p></section>
          <footer className="lm-dtc__footer"><div className="lm-dtc__primary-actions">{!scheduledItem && canScheduleSelectedDate && <button type="button" className="lm-btn lm-btn--primary" onClick={() => setShowScheduleModal(true)}><Clock size={17} /> Schedule call</button>}<button type="button" className={scheduledItem ? "lm-btn lm-btn--primary" : "lm-btn lm-btn--ghost"} onClick={() => setShowCallModal(true)}><PhoneCall size={17} /> {isLogged ? "Log another outcome" : "Log outcome"}</button>{scheduledItem && <button type="button" className="lm-btn lm-btn--ghost" disabled={!canScheduleSelectedDate} title={!canScheduleSelectedDate ? "Choose today or a future work date to reschedule." : undefined} onClick={() => canScheduleSelectedDate && setShowScheduleModal(true)}><Clock size={17} /> Reschedule</button>}<button type="button" className="lm-btn lm-btn--ghost" onClick={() => onViewLead(lead)}><Eye size={17} /> Full details</button>{!canScheduleSelectedDate && <small className="lm-dtc__schedule-help">Past dates are read-only. Choose today or a future date to schedule.</small>}</div><div className="lm-dtc__nav" aria-label="Lead navigation"><button type="button" disabled={current === 0} onClick={() => move(-1)}><ChevronLeft size={17} /> Previous</button><button type="button" disabled={current >= queue.length - 1} onClick={() => move(1)}>Next <ChevronRight size={17} /></button></div></footer>
        </article> : <div className="lm-dtc__empty"><CheckCircle2 size={38} /><h3>{queueType === "scheduled" ? "Your run sheet is clear" : `No ${queueType} leads`}</h3><p>{queueType === "scheduled" ? `There are no calls scheduled for ${dateLabel}. Choose Unscheduled to build the day’s run sheet.` : "There are no leads in this queue right now."}</p>{queueType === "scheduled" && unscheduledIds.length > 0 && <button type="button" className="lm-btn lm-btn--primary" onClick={() => selectQueue("unscheduled")}>View unscheduled leads</button>}</div>}
      </main>
      <aside className="lm-dtc__runsheet"><header><div><span>Daily run sheet</span><h3>{tabs.find(tab => tab.id === queueType)?.label}</h3></div><b>{queue.length}</b></header><div className="lm-dtc__run-list">{queue.map((item, index) => { const itemSchedule = scheduleByLead.get(item.id); const done = completedIds.includes(item.id); const priority = PRIORITY_META[item.priority]?.label || item.priority || "Unknown"; return <button key={item.id} type="button" className={item.id === lead?.id ? "selected" : ""} aria-current={item.id === lead?.id} aria-label={`${item.company_name || item.customer_name || item.contact_person}, ${priority} priority${itemSchedule ? `, scheduled ${fmtDateTime(itemSchedule.scheduled_at)}` : ""}`} onClick={() => setSelectedLeadId(item.id)}><span className={`lm-dtc__run-time ${done ? "done" : itemSchedule ? (queueType === "overdue" ? "late" : "due") : ""}`}>{done ? <Check size={15} /> : itemSchedule ? (queueType === "overdue" ? fmtDate(itemSchedule.scheduled_at) : new Date(itemSchedule.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })) : String(index + 1).padStart(2, "0")}</span><span className="lm-dtc__run-name"><strong>{item.company_name || item.customer_name || item.contact_person}</strong><small>{itemSchedule?.purpose || item.contact_person || item.phone || "No contact"}</small></span><span className="lm-dtc__run-priority" style={{ background: PRIORITY_META[item.priority]?.color || "#94a3b8" }} aria-hidden="true" /></button>; })}{!queue.length && <div className="lm-dtc__run-empty"><Inbox size={24} /><span>No leads in this queue</span></div>}</div></aside>
    </div>
    {showCallModal && lead && <LogCallModal lead={lead} onClose={() => setShowCallModal(false)} onLogged={call => { setShowCallModal(false); onCallLogged?.(call); }} />}
    {showScheduleModal && lead && <ScheduleFollowUpModal lead={lead} callMode existingFollowUp={scheduledItem} initialDateTime={localDateTimeInputValue(desiredTime)} onClose={() => setShowScheduleModal(false)} onScheduled={() => { setShowScheduleModal(false); onScheduleChanged?.(); }} />}
    {whatsappLead && (() => {
      const phone = whatsappLead.whatsapp_number || whatsappLead.phone;
      const whatsappUrl = getWhatsAppUrl(phone);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(whatsappUrl)}`;
      return (
        <div className="lm-overlay" onClick={() => setWhatsappLead(null)}>
          <div className="lm-dialog lm-dialog--sm lm-whatsapp-qr" onClick={e => e.stopPropagation()}>
            <div className="lm-dialog__head">
              <div>
                <span className="lm-whatsapp-qr__kicker">WhatsApp Chat</span>
                <h3>{whatsappLead.company_name || whatsappLead.customer_name || whatsappLead.contact_person || "Lead contact"}</h3>
              </div>
              <button className="lm-icon-btn" onClick={() => setWhatsappLead(null)}><X size={18} /></button>
            </div>
            <div className="lm-whatsapp-qr__body">
              <span className="lm-whatsapp-qr__icon"><QrCode size={22} /></span>
              <img src={qrUrl} alt={`WhatsApp QR for ${whatsappLead.company_name || whatsappLead.customer_name || "lead"}`} />
              <p>Scan this QR code to open the WhatsApp chat.</p>
              <strong>+{getWhatsAppNumber(phone)}</strong>
            </div>
            <div className="lm-form__actions lm-whatsapp-qr__actions">
              <button type="button" className="lm-btn lm-btn--ghost" onClick={() => setWhatsappLead(null)}>Close</button>
              <a className="lm-btn lm-btn--primary lm-whatsapp-qr__open" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageSquare size={16} /> Open Chat</a>
            </div>
          </div>
        </div>
      );
    })()}
  </section>;
}

export const EMAIL_TEMPLATES = [
  {
    id: "intro_ayurvedic_erp",
    name: "🌿 Ayurvedic ERP & Digital Solutions Overview",
    subject: "Transforming {{company_name}} with Adstra Ayurvedic ERP & Hospital Management",
    body: `Dear {{contact_person}},\n\nGreetings from Adstra Digital!\n\nWe specialize in enterprise Ayurvedic ERP solutions tailored for manufacturing, clinics, pharmacies, and hospital networks. Our system streamlines batch manufacturing, herb inventory, patient EMR, billing, and regulatory compliance.\n\nKey Highlights of Adstra Ayurvedic ERP:\n• Automated Batch Manufacturing & QC Workflow\n• Ayurvedic Pharmacy POS & Formula Management\n• Patient EMR & Therapy Appointment Scheduling\n• Integrated Financial Accounting & GST Billing\n\nWe would love to schedule a brief 15-minute demo for {{company_name}} at your convenience.\n\nBest regards,\nAdstra Digital Team`,
  },
  {
    id: "demo_invitation",
    name: "🏥 Live Product Demo & Walkthrough Invitation",
    subject: "Exclusive Live Demo Invitation for {{company_name}} — Adstra ERP Portal",
    body: `Dear {{contact_person}},\n\nThank you for connecting with us regarding {{service}} for {{company_name}}.\n\nWe would like to invite you and your team to a live demonstration of our platform. During this session, we will walk through tailored modules matching your workflow requirements.\n\nPlease let us know your preferred date and time for the session.\n\nWarm regards,\nAdstra Digital Enterprise Solutions`,
  },
  {
    id: "proposal_followup",
    name: "📄 Custom ERP Proposal & Quotation Follow-up",
    subject: "Follow-up: Custom ERP Proposal for {{company_name}}",
    body: `Dear {{contact_person}},\n\nI hope this email finds you well.\n\nFollowing up on our recent discussion, I have shared our detailed technical proposal and cost estimate for {{company_name}}'s {{service}} implementation.\n\nPlease feel free to reach out if you have any questions or require modifications to the scope of work.\n\nBest regards,\nAdstra Digital Team`,
  },
  {
    id: "requirement_meeting",
    name: "📅 Technical Requirement Gathering Session",
    subject: "Meeting Confirmation: Requirement Gathering Session for {{company_name}}",
    body: `Dear {{contact_person}},\n\nThank you for taking the time to speak with us.\n\nThis email confirms our upcoming requirement gathering session for {{company_name}}. We will be analyzing your core operational bottlenecks, software integrations, and workflow preferences.\n\nLooking forward to our discussion!\n\nSincerely,\nAdstra Digital Solutions`,
  },
];

// ─── Gmail Compose Modal (Floating Docked Window) ─────────────────────────────

function GmailComposeModal({ lead, allLeads = [], initialSubject, initialBody, initialRecipient, onClose, onSent }) {
  const [templates, setTemplates] = useState(EMAIL_TEMPLATES);
  const [templateId, setTemplateId] = useState(EMAIL_TEMPLATES[0].id);
  const [selectedLeadId, setSelectedLeadId] = useState(lead?.id || "");
  const [recipient, setRecipient] = useState(initialRecipient !== undefined ? initialRecipient : (lead?.email || ""));
  const [subject, setSubject] = useState(initialSubject !== undefined ? initialSubject : "");
  const [body, setBody] = useState(initialBody !== undefined ? initialBody : "");
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const { showAlert } = useModal();

  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const searchableLeads = useMemo(() => {
    return allLeads.length > 0 ? allLeads : (lead ? [lead] : []);
  }, [allLeads, lead]);

  const selectedLead = useMemo(() => {
    return searchableLeads.find(l => String(l.id) === String(selectedLeadId));
  }, [searchableLeads, selectedLeadId]);

  const filteredSearchLeads = useMemo(() => {
    if (!leadSearchQuery.trim()) return searchableLeads;
    const q = leadSearchQuery.toLowerCase();
    return searchableLeads.filter(l => 
      (l.customer_name || "").toLowerCase().includes(q) ||
      (l.company_name || "").toLowerCase().includes(q) ||
      (l.contact_person || "").toLowerCase().includes(q) ||
      (l.email || "").toLowerCase().includes(q)
    );
  }, [searchableLeads, leadSearchQuery]);

  const displayValue = isDropdownOpen
    ? leadSearchQuery
    : (selectedLead
        ? `${selectedLead.customer_name || selectedLead.company_name} (${selectedLead.email || "No email"})`
        : "-- Select Lead (Optional) --");

  useEffect(() => {
    const clickOutsideHandler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutsideHandler);
    return () => document.removeEventListener("mousedown", clickOutsideHandler);
  }, []);

  const activeTargetLead = useMemo(() => {
    if (selectedLeadId) {
      const match = (allLeads || []).find(l => l.id === parseInt(selectedLeadId));
      if (match) return match;
    }
    if (lead?.id) return lead;
    if (recipient?.trim()) {
      const match = (allLeads || []).find(l => (l.email || "").toLowerCase() === recipient.trim().toLowerCase());
      if (match) return match;
    }
    return (allLeads || [])[0] || null;
  }, [selectedLeadId, lead, recipient, allLeads]);

  const applyTemplateContent = useCallback((tpl, targetLead) => {
    if (!tpl) return;
    const target = targetLead || activeTargetLead || lead;
    const cName = target?.company_name || target?.customer_name || "Valued Partner";
    const pName = target?.contact_person || target?.customer_name || "Sir/Madam";
    const sName = target?.service || target?.product || "Ayurvedic ERP System";

    const sub = (tpl.subject || "")
      .replace(/{{company_name}}/g, cName)
      .replace(/{{contact_person}}/g, pName)
      .replace(/{{service}}/g, sName);

    const b = (tpl.body || "")
      .replace(/{{company_name}}/g, cName)
      .replace(/{{contact_person}}/g, pName)
      .replace(/{{service}}/g, sName);

    setSubject(sub);
    setBody(b);
  }, [activeTargetLead, lead]);

  const handleTemplateChange = (newTplId) => {
    setTemplateId(newTplId);
    const tpl = (templates || EMAIL_TEMPLATES).find(t => String(t.id) === String(newTplId));
    if (tpl) {
      applyTemplateContent(tpl, activeTargetLead);
    }
  };

  const handleSelectLead = (idStr) => {
    if (!idStr) {
      setSelectedLeadId("");
      return;
    }
    const id = parseInt(idStr);
    setSelectedLeadId(id);
    const chosen = (allLeads || []).find(l => l.id === id);
    if (chosen) {
      if (chosen.email) setRecipient(chosen.email);
      const tpl = (templates || EMAIL_TEMPLATES).find(t => String(t.id) === String(templateId)) || (templates || EMAIL_TEMPLATES)[0];
      applyTemplateContent(tpl, chosen);
    }
  };

  useEffect(() => {
    api.getTemplates()
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTemplates(res.data);
          setTemplateId(res.data[0].id);
          if (!initialSubject && !initialBody) {
            applyTemplateContent(res.data[0], activeTargetLead);
          }
        } else if (!initialSubject && !initialBody) {
          applyTemplateContent(EMAIL_TEMPLATES[0], activeTargetLead);
        }
      })
      .catch(() => {
        if (!initialSubject && !initialBody) {
          applyTemplateContent(EMAIL_TEMPLATES[0], activeTargetLead);
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient.trim()) {
      showAlert("Error", "Recipient email is required.", "error");
      return;
    }
    const leadIdToSend = selectedLeadId || activeTargetLead?.id || lead?.id || null;
    setSending(true);
    try {
      let res;
      if (leadIdToSend) {
        res = await api.sendEmail(leadIdToSend, { recipient_email: recipient.trim(), subject: subject.trim(), body: body.trim() });
      } else {
        // Send without a lead association via a general endpoint
        res = await api.sendEmail(0, { recipient_email: recipient.trim(), subject: subject.trim(), body: body.trim(), no_lead: true });
      }
      // Clear any saved draft for this recipient
      try { sessionStorage.removeItem(`email_draft_${recipient.trim()}`); } catch (_) {}
      showAlert("Email Sent", res.data?.message || `Email dispatched to ${recipient}`, "success");
      onSent?.(res.data);
      onClose();
    } catch (err) {
      showAlert("Error", err.response?.data?.error || "Failed to dispatch email.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = () => {
    try {
      const draft = {
        recipient: recipient.trim(),
        subject: subject.trim(),
        body: body.trim(),
        selectedLeadId,
        templateId,
        savedAt: new Date().toISOString(),
      };
      const draftKey = `email_draft_${recipient.trim() || "no_recipient"}`;
      sessionStorage.setItem(draftKey, JSON.stringify(draft));
      showAlert("Draft Saved", "Your draft is stored only for this browser session.", "success");
    } catch (_) {
      showAlert("Error", "Could not save draft.", "error");
    }
  };


  if (isMinimized) {
    return (
      <div className="gmail-compose-minimized" onClick={() => setIsMinimized(false)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Edit2 size={13} />
          <span>New Message — {activeTargetLead?.customer_name || lead?.customer_name || "Compose"}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="gmail-compose-icon-btn" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}><Maximize2 size={12} /></button>
          <button className="gmail-compose-icon-btn" onClick={(e) => { e.stopPropagation(); onClose(); }}><X size={13} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`gmail-compose-box ${isMaximized ? "gmail-compose-box--maximized" : ""}`}>
      {/* Gmail Dark Header Bar */}
      <div className="gmail-compose-head">
        <span>New Message</span>
        <div className="gmail-compose-head-actions">
          <button type="button" onClick={() => setIsMinimized(true)} title="Minimize"><Minimize2 size={13} /></button>
          <button type="button" onClick={() => setIsMaximized(m => !m)} title={isMaximized ? "Restore" : "Pop-out"}><Maximize2 size={13} /></button>
          <button type="button" onClick={onClose} title="Close"><X size={14} /></button>
        </div>
      </div>

      <form className="gmail-compose-body" onSubmit={handleSubmit}>
        {/* Lead Selector Searchable Dropdown */}
        <div className="gmail-field-row" style={{ position: "relative" }} ref={dropdownRef}>
          <span className="gmail-field-label" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1px", lineHeight: 1.2 }}>
            <span>Select Lead</span>
            <span style={{ fontSize: "9px", fontWeight: 500, color: "#9ca3af", letterSpacing: "0.04em", textTransform: "uppercase" }}>optional</span>
          </span>
          <div className="gmail-searchable-select-container" style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              className="gmail-field-input gmail-searchable-select-input"
              style={{ width: "100%", paddingRight: "30px", cursor: isDropdownOpen ? "text" : "pointer" }}
              value={displayValue === "-- Select Lead (Optional) --" && !isDropdownOpen ? "" : displayValue}
              placeholder={isDropdownOpen ? "Search lead by name, company, or email..." : "-- Select Lead (Optional) --"}
              onFocus={() => {
                setIsDropdownOpen(true);
                setLeadSearchQuery("");
              }}
              onChange={(e) => {
                setLeadSearchQuery(e.target.value);
              }}
            />
            <div 
              style={{ 
                position: "absolute", 
                right: "10px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                pointerEvents: "none",
                opacity: 0.6
              }}
            >
              <ChevronDown size={14} />
            </div>

            {isDropdownOpen && (
              <div 
                className="gmail-searchable-dropdown-list" 
                style={{ 
                  position: "absolute", 
                  top: "100%", 
                  left: 0, 
                  right: 0, 
                  maxHeight: "220px", 
                  overflowY: "auto", 
                  backgroundColor: "#fff", 
                  border: "1px solid #ddd", 
                  borderRadius: "4px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)", 
                  zIndex: 9999,
                  marginTop: "4px"
                }}
              >
                <div 
                  className="gmail-searchable-dropdown-item" 
                  style={{ 
                    padding: "8px 12px", 
                    cursor: "pointer", 
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: !selectedLeadId ? "bold" : "normal",
                    backgroundColor: !selectedLeadId ? "#f5f5f5" : "transparent"
                  }}
                  onClick={() => {
                    handleSelectLead("");
                    setIsDropdownOpen(false);
                    setLeadSearchQuery("");
                  }}
                >
                  -- None (Clear Selection) --
                </div>
                {filteredSearchLeads.length > 0 ? (
                  filteredSearchLeads.map(l => (
                    <div 
                      key={l.id} 
                      className="gmail-searchable-dropdown-item" 
                      style={{ 
                        padding: "8px 12px", 
                        cursor: "pointer", 
                        borderBottom: "1px solid #f0f0f0",
                        backgroundColor: String(selectedLeadId) === String(l.id) ? "#eef2ff" : "transparent"
                      }}
                      onClick={() => {
                        handleSelectLead(String(l.id));
                        setIsDropdownOpen(false);
                        setLeadSearchQuery("");
                      }}
                    >
                      <div style={{ fontWeight: 500, color: "#111827" }}>{l.customer_name || l.company_name}</div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>
                        {l.company_name && l.customer_name ? `${l.company_name} • ` : ""}{l.email || "No email"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "8px 12px", color: "#9ca3af", fontStyle: "italic", textAlign: "center" }}>
                    No leads found matching "{leadSearchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recipients input */}
        <div className="gmail-field-row">
          <span className="gmail-field-label">To</span>
          <input
            type="email"
            required
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            placeholder="Recipients"
            className="gmail-field-input"
          />
        </div>

        {/* Template Selector */}
        <div className="gmail-field-row">
          <span className="gmail-field-label">Template</span>
          <select value={templateId} onChange={e => handleTemplateChange(e.target.value)} className="gmail-template-select">
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div className="gmail-field-row">
          <span className="gmail-field-label">Subject</span>
          <input
            type="text"
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="gmail-field-input gmail-subject-input"
          />
        </div>

        {/* Message Editor */}
        <div className="gmail-editor-wrap">
          <textarea
            required
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Compose email..."
            className="gmail-editor-textarea"
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="gmail-compose-footer">
          <div className="gmail-footer-left">
            <button type="submit" className="gmail-send-btn" disabled={sending}>
              {sending ? <Loader2 size={14} className="spin" /> : <>Send <Send size={13} style={{ marginLeft: 6 }} /></>}
            </button>
            <button
              type="button"
              className="gmail-send-btn"
              style={{ background: "#f1f3f4", color: "#444", border: "1px solid #dadce0", marginLeft: 4 }}
              onClick={handleSaveDraft}
              title="Save as draft"
            >
              <FileText size={13} style={{ marginRight: 5 }} />Draft
            </button>
            <div className="gmail-footer-tools">
              <button type="button" className="gmail-tool-btn" title="Attach files"><Paperclip size={16} /></button>
              <button type="button" className="gmail-tool-btn" title="Formatting options"><Sparkles size={16} /></button>
            </div>
          </div>
          <button type="button" className="gmail-tool-btn gmail-tool-btn--danger" onClick={onClose} title="Discard">
            <Trash2 size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Gmail Settings Pane Component ───────────────────────────────────────────

function EmailSettingsPane() {
  const [activeTab, setActiveTab] = useState("templates"); // templates | smtp | advanced
  const [templateList, setTemplateList] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [editingTpl, setEditingTpl] = useState(null);
  const [showAppPassword, setShowAppPassword] = useState(false);
  const { showAlert } = useModal();

  const [smtpConfig, setSmtpConfig] = useState({
    sender_name: "Adstra Digital Sales",
    sender_email: "alok.s@baidyanath.co.in",
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    app_password: "•••• •••• •••• ••••",
  });

  const [advConfig, setAdvConfig] = useState({
    daily_limit: 500,
    track_opens: true,
    track_clicks: true,
    signature: `Best regards,\nAdstra Digital Team\nWebsite: https://adstradigital.com | Phone: +91 98765 43210`
  });

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await api.getTemplates();
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTemplateList(res.data);
      } else {
        setTemplateList(EMAIL_TEMPLATES);
      }
    } catch {
      setTemplateList(EMAIL_TEMPLATES);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const fetchSmtp = useCallback(async () => {
    try {
      const res = await api.getSmtp();
      if (res.data) setSmtpConfig(res.data);
    } catch { /* fallback */ }
  }, []);

  const fetchAdvanced = useCallback(async () => {
    try {
      const res = await api.getAdvanced();
      if (res.data) setAdvConfig(res.data);
    } catch { /* fallback */ }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchSmtp();
    fetchAdvanced();
  }, [fetchTemplates, fetchSmtp, fetchAdvanced]);

  const handleSaveTemplate = async () => {
    if (!editingTpl) return;
    try {
      if (typeof editingTpl.id === "number" && editingTpl.id < 1000000) {
        await api.updateTemplate(editingTpl.id, editingTpl);
      } else {
        await api.createTemplate(editingTpl);
      }
      showAlert("Saved", "Email Template saved successfully!", "success");
      setEditingTpl(null);
      fetchTemplates();
    } catch {
      showAlert("Error", "Failed to save template.", "error");
    }
  };

  const handleDeleteTemplate = async (id, e) => {
    e.stopPropagation();
    try {
      if (typeof id === "number" && id < 1000000) {
        await api.deleteTemplate(id);
      }
      setTemplateList(list => list.filter(t => t.id !== id));
      showAlert("Deleted", "Template removed.", "success");
    } catch {
      showAlert("Error", "Failed to delete template.", "error");
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    try {
      await api.saveSmtp(smtpConfig);
      showAlert("Settings Saved", "SMTP Credentials & Google App Password saved to server!", "success");
    } catch {
      showAlert("Error", "Failed to save SMTP settings.", "error");
    }
  };

  const handleSaveAdv = async (e) => {
    e.preventDefault();
    try {
      await api.saveAdvanced(advConfig);
      showAlert("Preferences Saved", "Advanced rules & default signature saved to server!", "success");
    } catch {
      showAlert("Error", "Failed to save advanced settings.", "error");
    }
  };

  return (
    <div style={{ padding: 28, background: "#fff", height: "100%", overflowY: "auto", fontFamily: "inherit" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e0e3e7', paddingBottom: 16, marginBottom: 20 }}>
        <Settings size={22} color="#1a73e8" />
        <div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, color: '#1f1f1f' }}>Email Settings & Configurations</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#5f6368' }}>Manage email templates, Google App Passwords, SMTP servers, and advanced rules.</p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e0e3e7', marginBottom: 24 }}>
        <button
          className={`lm-btn ${activeTab === "templates" ? "lm-btn--primary" : "lm-btn--ghost"}`}
          onClick={() => setActiveTab("templates")}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}
        >
          📝 Templates Manager
        </button>
        <button
          className={`lm-btn ${activeTab === "smtp" ? "lm-btn--primary" : "lm-btn--ghost"}`}
          onClick={() => setActiveTab("smtp")}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}
        >
          🔑 SMTP & App Password
        </button>
        <button
          className={`lm-btn ${activeTab === "advanced" ? "lm-btn--primary" : "lm-btn--ghost"}`}
          onClick={() => setActiveTab("advanced")}
          style={{ borderRadius: '8px 8px 0 0', padding: '10px 20px', fontSize: 13, fontWeight: 600 }}
        >
          ⚡ Advanced Rules & Signature
        </button>
      </div>

      {/* ── TAB 1: Templates Manager ── */}
      {activeTab === "templates" && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: '#5f6368' }}>
              Placeholders available: <code>{`{{company_name}}`}</code>, <code>{`{{contact_person}}`}</code>, <code>{`{{service}}`}</code>
            </span>
            <button
              className="lm-btn lm-btn--primary lm-btn--sm"
              onClick={() => setEditingTpl({ id: Date.now(), name: "Custom Proposal Template", subject: "Proposal for {{company_name}}", body: "Dear {{contact_person}},\n\nGreetings from Adstra Digital!\n\nBest regards,\nAdstra Sales Team" })}
            >
              <Plus size={14} /> Create Template
            </button>
          </div>

          {loadingTemplates ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}><Loader2 size={24} className="spin" /> Loading templates…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {templateList.map(t => (
                <div key={t.id} style={{ border: '1px solid #e0e3e7', borderRadius: 12, padding: 18, background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>{t.name}</strong>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="lm-btn lm-btn--ghost lm-btn--xs" onClick={() => setEditingTpl(t)}><Edit2 size={13} /> Edit</button>
                        <button className="lm-btn lm-btn--ghost lm-btn--xs" style={{ color: '#dc2626' }} onClick={e => handleDeleteTemplate(t.id, e)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#475569', fontWeight: 600, marginBottom: 6 }}>Subject: {t.subject}</div>
                    <p style={{ fontSize: 12, color: '#64748b', whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden', margin: 0 }}>
                      {t.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Template Edit Dialog */}
          {editingTpl && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', width: 560, borderRadius: 12, padding: 24, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>{typeof editingTpl.id === "number" && editingTpl.id < 1000000 ? "Edit Email Template" : "Create New Template"}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>Template Name</label>
                    <input className="gmail-field-input" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 12px', width: '100%' }} value={editingTpl.name} onChange={e => setEditingTpl({ ...editingTpl, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>Subject Line</label>
                    <input className="gmail-field-input" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 12px', width: '100%' }} value={editingTpl.subject} onChange={e => setEditingTpl({ ...editingTpl, subject: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>Message Body</label>
                    <textarea rows={6} className="gmail-editor-textarea" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px', width: '100%' }} value={editingTpl.body} onChange={e => setEditingTpl({ ...editingTpl, body: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                  <button className="lm-btn lm-btn--ghost" onClick={() => setEditingTpl(null)}>Cancel</button>
                  <button className="lm-btn lm-btn--primary" onClick={handleSaveTemplate}>Save Template</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: SMTP & App Password ── */}
      {activeTab === "smtp" && (
        <form onSubmit={handleSaveSmtp} style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 16, fontSize: 13, color: '#1e40af' }}>
            🔒 <strong>Google App Password Configuration:</strong><br />
            To send emails securely via Gmail SMTP, generate a 16-character App Password from Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords.
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Sender Name</label>
            <input className="gmail-field-input" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '9px 12px', width: '100%' }} value={smtpConfig.sender_name} onChange={e => setSmtpConfig({ ...smtpConfig, sender_name: e.target.value })} placeholder="e.g. Adstra Digital Sales" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Sender Email Address</label>
            <input className="gmail-field-input" type="email" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '9px 12px', width: '100%' }} value={smtpConfig.sender_email} onChange={e => setSmtpConfig({ ...smtpConfig, sender_email: e.target.value })} placeholder="alok.s@baidyanath.co.in" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>SMTP Server Host</label>
              <input className="gmail-field-input" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '9px 12px', width: '100%' }} value={smtpConfig.smtp_host} onChange={e => setSmtpConfig({ ...smtpConfig, smtp_host: e.target.value })} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Port</label>
              <input className="gmail-field-input" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '9px 12px', width: '100%' }} value={smtpConfig.smtp_port} onChange={e => setSmtpConfig({ ...smtpConfig, smtp_port: e.target.value })} placeholder="587" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Google App Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showAppPassword ? "text" : "password"}
                className="gmail-field-input"
                style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '9px 40px 9px 12px', width: '100%' }}
                value={smtpConfig.app_password}
                onChange={e => setSmtpConfig({ ...smtpConfig, app_password: e.target.value })}
                placeholder="16-character App Password"
              />
              <button
                type="button"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setShowAppPassword(p => !p)}
              >
                {showAppPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button type="submit" className="lm-btn lm-btn--primary">
              <Save size={15} /> Save Credentials
            </button>
            <span className="lm-muted">Connection is verified when a real lead email is sent.</span>
          </div>
        </form>
      )}

      {/* ── TAB 3: Advanced Rules & Preferences ── */}
      {activeTab === "advanced" && (
        <form onSubmit={handleSaveAdv} style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Default Email Signature</h4>
            <textarea
              rows={4}
              className="gmail-editor-textarea"
              style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px', width: '100%' }}
              value={advConfig.signature}
              onChange={e => setAdvConfig({ ...advConfig, signature: e.target.value })}
            />
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, fontSize: 14 }}>Sending Limits & Tracking</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#334155' }}>
              <input type="checkbox" checked={advConfig.track_opens} onChange={e => setAdvConfig({ ...advConfig, track_opens: e.target.checked })} />
              Enable email open tracking pixels
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: '#334155' }}>
              <input type="checkbox" checked={advConfig.track_clicks} onChange={e => setAdvConfig({ ...advConfig, track_clicks: e.target.checked })} />
              Enable link click tracking in proposal PDFs
            </label>
            <div style={{ marginTop: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 4, color: '#334155' }}>Daily Sending Limit (Emails / Day)</label>
              <input type="number" className="gmail-field-input" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 12px', width: 160 }} value={advConfig.daily_limit} onChange={e => setAdvConfig({ ...advConfig, daily_limit: parseInt(e.target.value) || 100 })} />
            </div>
          </div>

          <button type="submit" className="lm-btn lm-btn--primary" style={{ width: 'fit-content' }}>
            <Save size={15} /> Save Advanced Rules
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Inbuilt Emailing Workspace View (Gmail Styled) ───────────────────────────

function EmailingView({ leads, onRefresh }) {
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeFolder, setActiveFolder] = useState("inbox"); // inbox | starred | sent | trash | settings
  const [starredIds, setStarredIds] = useState(() => {
    const s = new Set();
    (leads || []).forEach(l => {
      if (l.is_starred || ["HIGH", "CRITICAL"].includes(l.priority)) s.add(l.id);
    });
    return s;
  });
  const [trashedIds, setTrashedIds] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [composeConfig, setComposeConfig] = useState(null); // { lead, recipient, subject, body }
  const [activities, setActivities] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [msgBodyExpanded, setMsgBodyExpanded] = useState(true);
  const { showAlert, showConfirm } = useModal();
  const { hasPermission } = useAuth();

  const toggleStar = (id, e) => {
    e?.stopPropagation();
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const moveToTrash = (id, e) => {
    e?.stopPropagation();
    setTrashedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    showAlert("Moved to Trash", "Email conversation moved to Trash bin.", "info");
  };

  const restoreFromTrash = (id, e) => {
    e?.stopPropagation();
    setTrashedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showAlert("Restored", "Email conversation restored to Inbox.", "success");
  };

  const permanentlyDelete = (id, e) => {
    e?.stopPropagation();
    showAlert("Deletion Disabled", "Email messages are part of the lead audit history and cannot be deleted from this view.", "info");
  };

  const handleBulkPermanentDelete = () => {
    if (selectedIds.size === 0) return;
    showAlert("Deletion Disabled", "Email messages are part of the lead audit history and cannot be deleted from this view.", "info");
  };

  const handleEmptyTrash = () => {
    if (trashedIds.size === 0) return;
    showAlert("Deletion Disabled", "Email messages are part of the lead audit history and cannot be deleted from this view.", "info");
  };

  const isSentEmail = (l) => {
    return !!l.last_contacted_at || ["CONTACT_ATTEMPTED", "PROPOSAL_SENT", "QUOTATION_SENT", "NEGOTIATION", "CONVERTED"].includes(l.current_stage);
  };

  const isReceivedEmail = (l) => {
    return !l.last_contacted_at && ["NEW", "REQUIREMENT_ANALYSIS", "QUALIFIED"].includes(l.current_stage);
  };

  const activeLead = useMemo(() => selectedLeadId ? (leads.find(l => l.id === selectedLeadId) || null) : null, [leads, selectedLeadId]);

  const filteredLeads = useMemo(() => {
    let list = leads;
    if (activeFolder === "trash") {
      list = list.filter(l => trashedIds.has(l.id));
    } else {
      list = list.filter(l => !trashedIds.has(l.id));
      if (activeFolder === "inbox") {
        list = list.filter(l => isReceivedEmail(l));
      } else if (activeFolder === "starred") {
        list = list.filter(l => starredIds.has(l.id));
      } else if (activeFolder === "sent") {
        list = list.filter(l => isSentEmail(l));
      }
    }
    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter(l => l.created_at && new Date(l.created_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter(l => l.created_at && new Date(l.created_at) <= to);
    }
    // Search filter
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(l =>
      (l.customer_name || "").toLowerCase().includes(q) ||
      (l.company_name || "").toLowerCase().includes(q) ||
      (l.email || "").toLowerCase().includes(q) ||
      (l.service || "").toLowerCase().includes(q)
    );
  }, [leads, search, dateFrom, dateTo, activeFolder, starredIds, trashedIds]);

  const isAllSelected = useMemo(() => filteredLeads.length > 0 && filteredLeads.every(l => selectedIds.has(l.id)), [filteredLeads, selectedIds]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const toggleSelectOne = (id, e) => {
    e?.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkTrash = () => {
    if (selectedIds.size === 0) return;
    setTrashedIds(prev => {
      const next = new Set(prev);
      selectedIds.forEach(id => next.add(id));
      return next;
    });
    showAlert("Bulk Action", `${selectedIds.size} emails moved to Trash bin.`, "info");
    setSelectedIds(new Set());
  };

  const handleBulkRestore = () => {
    if (selectedIds.size === 0) return;
    setTrashedIds(prev => {
      const next = new Set(prev);
      selectedIds.forEach(id => next.delete(id));
      return next;
    });
    showAlert("Bulk Action", `${selectedIds.size} emails restored to Inbox.`, "success");
    setSelectedIds(new Set());
  };

  const handleBulkStar = () => {
    if (selectedIds.size === 0) return;
    setStarredIds(prev => {
      const next = new Set(prev);
      selectedIds.forEach(id => next.add(id));
      return next;
    });
    showAlert("Bulk Action", `${selectedIds.size} emails starred.`, "success");
    setSelectedIds(new Set());
  };

  useEffect(() => {
    if (activeLead) {
      setLoadingHistory(true);
      api.timeline(activeLead.id)
        .then(r => setActivities((r.data.results || r.data || []).filter(a => a.activity_type === "EMAIL")))
        .catch(() => setActivities([]))
        .finally(() => setLoadingHistory(false));
    }
  }, [activeLead]);

  const getAvatarInitials = (name) => {
    if (!name) return "GM";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (id) => {
    const colors = ["#1e88e5", "#43a047", "#e53935", "#8e24aa", "#fb8c00", "#00acc1", "#3949ab"];
    return colors[(id || 0) % colors.length];
  };

  const handleReply = (lead, message = null) => {
    if (!lead) return;
    const origSub = message?.title ? message.title.replace(/^Email sent:\s*/i, "") : (lead.service ? `Proposal & Quote: ${lead.service}` : `Lead Overview: ${lead.customer_name}`);
    const origBody = message?.description || lead.requirement_summary || "Ayurvedic ERP Implementation Enquiry";
    const sub = origSub.toLowerCase().startsWith("re:") ? origSub : `Re: ${origSub}`;
    const quoteHeader = `\n\n-----------------------------------\nOn ${new Date().toLocaleDateString()}, ${lead.customer_name} <${lead.email}> wrote:\n> `;
    const quoted = quoteHeader + origBody.replace(/\n/g, "\n> ");

    setComposeConfig({
      lead,
      recipient: lead.email || "",
      subject: sub,
      body: quoted,
    });
  };

  const handleForward = (lead, message = null) => {
    if (!lead) return;
    const origSub = message?.title ? message.title.replace(/^Email sent:\s*/i, "") : (lead.service ? `Proposal & Quote: ${lead.service}` : `Lead Overview: ${lead.customer_name}`);
    const origBody = message?.description || lead.requirement_summary || "Ayurvedic ERP Implementation Enquiry";
    const sub = origSub.toLowerCase().startsWith("fwd:") ? origSub : `Fwd: ${origSub}`;
    const fwdHeader = `\n\n---------- Forwarded message ---------\nFrom: ${lead.customer_name} <${lead.email}>\nSubject: ${origSub}\nTo: Adstra Digital Support <info@adstradigital.com>\n\n`;

    setComposeConfig({
      lead,
      recipient: "",
      subject: sub,
      body: fwdHeader + origBody,
    });
  };

  const handlePrintEmail = (lead, activitiesList = []) => {
    if (!lead) return;
    const printWin = window.open("", "_blank", "width=850,height=950");
    if (!printWin) return;

    const subject = lead.service ? `Proposal & Quote: ${lead.service}` : `Lead Overview: ${lead.customer_name}`;
    const sentHistoryHtml = activitiesList.map(a => `
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-top: 14px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <strong style="color: #0f172a;">${escapeHtml(a.title)}</strong>
          <span style="font-size: 12px; color: #64748b;">${fmtDateTime(a.created_at)}</span>
        </div>
        <p style="font-size: 13px; color: #334155; white-space: pre-wrap; margin: 0;">${escapeHtml(a.description)}</p>
      </div>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Email - ${escapeHtml(lead.customer_name)}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 30px; color: #1e293b; background: #fff; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .brand { font-size: 20px; font-weight: 800; color: #6366f1; }
            .tagline { font-size: 12px; color: #64748b; }
            .subject { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
            .meta-table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
            .gmail-field-label {
              font-size: 13px;
              color: #5f6368;
              width: 120px;
              flex-shrink: 0;
            }
            .content { font-size: 14px; line-height: 1.7; color: #0f172a; margin-bottom: 24px; }
            .quote-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 13.5px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">ADSTRA DIGITAL</div>
              <div class="tagline">Enterprise Ayurvedic ERP & Digital Solutions</div>
            </div>
            <div style="font-size: 12px; color: #64748b;">Printed on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>

          <div class="subject">${escapeHtml(subject)}</div>

          <table class="meta-table">
            <tr><td class="meta-label">From / Lead:</td><td><strong>${escapeHtml(lead.customer_name)}</strong> &lt;${escapeHtml(lead.email || "N/A")}&gt;</td></tr>
            <tr><td class="meta-label">Company:</td><td>${escapeHtml(lead.company_name || "N/A")}</td></tr>
            <tr><td class="meta-label">Contact / Phone:</td><td>${escapeHtml(lead.contact_person || "N/A")} (${escapeHtml(lead.phone || "N/A")})</td></tr>
            <tr><td class="meta-label">Service Interest:</td><td>${escapeHtml(lead.service || lead.product || "Ayurvedic ERP System")}</td></tr>
            <tr><td class="meta-label">Pipeline Stage:</td><td>${escapeHtml(lead.current_stage)}</td></tr>
          </table>

          <div class="content">
            <p>Dear Adstra Digital Team,</p>
            <p>We are looking for end-to-end ERP implementation for <strong>${escapeHtml(lead.company_name || lead.customer_name)}</strong>. Our primary focus is <strong>${escapeHtml(lead.service || lead.product || "Ayurvedic ERP & Clinic Management")}</strong>.</p>
            ${lead.requirement_summary ? `<div class="quote-box"><strong>Client Requirement Notes:</strong><br/>${escapeHtml(lead.requirement_summary)}</div>` : ""}
            <p>Please share the proposal, pricing breakdown, and schedule a live product walkthrough at your earliest convenience.</p>
            <br/>
            <p>Regards,<br/><strong>${escapeHtml(lead.contact_person || lead.customer_name)}</strong><br/>${escapeHtml(lead.company_name || "")}<br/>📞 ${escapeHtml(lead.phone || "")}</p>
          </div>

          ${sentHistoryHtml ? `
            <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
              <h3 style="font-size: 15px; color: #0f172a; margin-bottom: 12px;">Outbound Email Log (${activitiesList.length})</h3>
              ${sentHistoryHtml}
            </div>
          ` : ""}

          <div class="footer">
            Adstra Digital Lead Management System · Confidential & Proprietary Document
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const sentLeadsCount = useMemo(() => leads.filter(l => ["CONTACT_ATTEMPTED", "PROPOSAL_SENT", "QUOTATION_SENT", "NEGOTIATION", "CONVERTED"].includes(l.current_stage) || l.last_contacted_at).length, [leads]);

  return (
    <div
      className="gmail-layout"
      style={
        activeFolder === "settings"
          ? { gridTemplateColumns: "200px 1fr" }
          : activeLead
            ? {}
            : { gridTemplateColumns: "200px 1fr" }
      }
    >
      {/* ── Gmail Left Navigation Bar ── */}
      <div className="gmail-sidebar">
        <div className="gmail-compose-btn-wrap">
          <button className="gmail-compose-pill" onClick={() => setComposeConfig({ lead: activeLead || leads[0] })}>
            <Plus size={20} color="#1a73e8" />
            <span>Compose</span>
          </button>
        </div>

        <nav className="gmail-nav">
          <button
            className={`gmail-nav-item ${activeFolder === "inbox" ? "gmail-nav-item--active" : ""}`}
            onClick={() => { setActiveFolder("inbox"); setSelectedLeadId(null); setMsgBodyExpanded(true); }}
          >
            <Inbox size={18} />
            <span>Inbox</span>
            <span className="gmail-badge">{leads.filter(l => !trashedIds.has(l.id) && isReceivedEmail(l)).length}</span>
          </button>

          <button
            className={`gmail-nav-item ${activeFolder === "starred" ? "gmail-nav-item--active" : ""}`}
            onClick={() => { setActiveFolder("starred"); setSelectedLeadId(null); setMsgBodyExpanded(true); }}
          >
            <Star size={18} />
            <span>Starred</span>
            <span className="gmail-badge">{leads.filter(l => !trashedIds.has(l.id) && starredIds.has(l.id)).length}</span>
          </button>

          <button
            className={`gmail-nav-item ${activeFolder === "sent" ? "gmail-nav-item--active" : ""}`}
            onClick={() => { setActiveFolder("sent"); setSelectedLeadId(null); setMsgBodyExpanded(true); }}
          >
            <Send size={18} />
            <span>Sent Emails</span>
            <span className="gmail-badge">{leads.filter(l => !trashedIds.has(l.id) && isSentEmail(l)).length}</span>
          </button>

          <button
            className={`gmail-nav-item ${activeFolder === "trash" ? "gmail-nav-item--active" : ""}`}
            onClick={() => { setActiveFolder("trash"); setSelectedLeadId(null); setMsgBodyExpanded(true); }}
          >
            <Trash2 size={18} />
            <span>Trash</span>
            <span className="gmail-badge">{trashedIds.size}</span>
          </button>

          {hasPermission("lead.manage_settings") && <button
            className={`gmail-nav-item ${activeFolder === "settings" ? "gmail-nav-item--active" : ""}`}
            onClick={() => { setActiveFolder("settings"); setSelectedLeadId(null); setMsgBodyExpanded(true); }}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>}
        </nav>
      </div>

      {/* If Settings folder active, show full Settings Pane */}
      {activeFolder === "settings" ? (
        <EmailSettingsPane />
      ) : (
        <>
          {/* ── Gmail Middle Inbox / Email List ── */}
          <div className="gmail-inbox-pane">
            {/* Search + Date Filter — inline when full-screen, stacked when split */}
            <div className={`gmail-search-date-wrapper${!activeLead ? " gmail-search-date-wrapper--inline" : ""}`}>
              <div className="gmail-search-bar" style={{ flex: !activeLead ? 1 : undefined }}>
                <Search size={16} color="#5f6368" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search in leads & emails…"
                />
                {search && <button className="gmail-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
              </div>

              <div className={`gmail-date-filter-bar${!activeLead ? " gmail-date-filter-bar--inline" : ""}`}>
                <div className="gmail-date-filter-group">
                  <label className="gmail-date-label">From</label>
                  <input
                    type="date"
                    className="gmail-date-input"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    max={dateTo || undefined}
                  />
                </div>
                <div className="gmail-date-filter-group">
                  <label className="gmail-date-label">To</label>
                  <input
                    type="date"
                    className="gmail-date-input"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    min={dateFrom || undefined}
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    className="gmail-date-clear-btn"
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    title="Clear date filter"
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Select All & Bulk Actions Header Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #e0e3e7', background: '#f8fafc', fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#1a73e8' }}
                  title={isAllSelected ? "Deselect all" : "Select all"}
                />
                <span style={{ fontWeight: 600, color: '#334155' }}>
                  {selectedIds.size > 0 ? `${selectedIds.size} Selected` : `Select All (${filteredLeads.length})`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {activeFolder === "trash" && selectedIds.size === 0 && trashedIds.size > 0 && (
                  <button
                    className="lm-btn lm-btn--ghost lm-btn--xs"
                    style={{ color: '#dc2626', padding: '3px 8px', fontSize: 11.5 }}
                    onClick={handleEmptyTrash}
                    title="Empty Trash Bin"
                  >
                    <Trash2 size={13} /> Empty Trash
                  </button>
                )}

                {selectedIds.size > 0 && (
                  <>
                    {activeFolder === "trash" ? (
                      <>
                        <button
                          className="lm-btn lm-btn--ghost lm-btn--xs"
                          style={{ color: '#16a34a', padding: '3px 8px', fontSize: 11.5 }}
                          onClick={handleBulkRestore}
                          title="Restore selected"
                        >
                          <RotateCcw size={13} /> Restore
                        </button>
                        <button
                          className="lm-btn lm-btn--ghost lm-btn--xs"
                          style={{ color: '#dc2626', padding: '3px 8px', fontSize: 11.5, fontWeight: 700 }}
                          onClick={handleBulkPermanentDelete}
                          title="Delete selected permanently"
                        >
                          <Trash2 size={13} /> Delete Permanently
                        </button>
                      </>
                    ) : (
                      <button
                        className="lm-btn lm-btn--ghost lm-btn--xs"
                        style={{ color: '#dc2626', padding: '3px 8px', fontSize: 11.5 }}
                        onClick={handleBulkTrash}
                        title="Delete selected"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    )}
                    <button
                      className="lm-btn lm-btn--ghost lm-btn--xs"
                      style={{ padding: '3px 8px', fontSize: 11.5 }}
                      onClick={handleBulkStar}
                      title="Star selected"
                    >
                      <Star size={13} fill="#f4b400" color="#f4b400" /> Star
                    </button>
                    <button
                      className="lm-btn lm-btn--ghost lm-btn--xs"
                      style={{ padding: '3px 6px' }}
                      onClick={() => setSelectedIds(new Set())}
                      title="Clear"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="gmail-inbox-list">
              {filteredLeads.length === 0 ? (
                <div className="gmail-empty">No conversations found</div>
              ) : (
                filteredLeads.map(l => {
                  const isStarred = starredIds.has(l.id);
                  const isSelected = activeLead?.id === l.id;
                  const isChecked = selectedIds.has(l.id);
                  const snippet = l.requirement_summary
                    ? l.requirement_summary
                    : `We are looking for ${l.service || l.product || "ERP solutions"} — ${l.company_name || l.customer_name}`;
                  const timeLabel = l.created_at
                    ? new Date(l.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) === new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                      ? new Date(l.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
                      : new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    : "Aug 6";
                  return (
                    <div
                      key={l.id}
                      className={`gmail-inbox-row${isSelected ? " gmail-inbox-row--selected" : ""}`}
                      onClick={() => setSelectedLeadId(l.id)}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleSelectOne(l.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: 14, height: 14, cursor: "pointer", accentColor: "#1a73e8", flexShrink: 0, marginRight: 10 }}
                      />

                      {/* Star */}
                      <button
                        className={`gmail-star-btn${isStarred ? " gmail-star-btn--starred" : ""}`}
                        onClick={(e) => toggleStar(l.id, e)}
                        style={{ marginRight: 6, opacity: isStarred ? 1 : undefined }}
                      >
                        <Star size={16} fill={isStarred ? "#f4b400" : "none"} color={isStarred ? "#f4b400" : "#c5c7c8"} />
                      </button>

                      {/* Main content: sender | subject — snippet */}
                      <div className="gmail-inbox-content">
                        <span className="gmail-sender">
                          {l.customer_name || l.company_name}
                        </span>
                        <span className="gmail-subject-snippet">
                          <span className="gmail-subject">{l.service || l.product || "ERP Implementation Proposal"}</span>
                          <span className="gmail-snippet"> — {snippet}</span>
                        </span>
                      </div>

                      {/* Stable Time & Hover Actions Display */}
                      <div className="gmail-time-actions-wrapper" onClick={(e) => e.stopPropagation()}>
                        <span className="gmail-time-display">{timeLabel}</span>
                        <div className="gmail-actions-display">
                          {trashedIds.has(l.id) ? (
                            <>
                              <button title="Restore" className="gmail-star-btn" onClick={(e) => { e.stopPropagation(); restoreFromTrash(l.id, e); }}>
                                <RotateCcw size={14} color="#16a34a" />
                              </button>
                              <button title="Delete Permanently" className="gmail-star-btn" onClick={(e) => { e.stopPropagation(); permanentlyDelete(l.id, e); }}>
                                <Trash2 size={14} color="#dc2626" />
                              </button>
                            </>
                          ) : (
                            <button title="Delete" className="gmail-star-btn" onClick={(e) => { e.stopPropagation(); moveToTrash(l.id, e); }}>
                              <Trash2 size={14} color="#ea4335" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Gmail Right Thread Reading Pane ── */}
          {activeLead && (
            <div className="gmail-thread-pane">
              <div className="gmail-thread-scroll">
                {/* Subject Title Bar */}
                <div className="gmail-thread-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      title="Back to list"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedLeadId(null);
                        setMsgBodyExpanded(true);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        padding: "6px 8px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        color: "#5f6368",
                        transition: "background 0.15s"
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "#f1f3f4"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h2>{activeLead.service ? `Proposal & Quote: ${activeLead.service}` : `Lead Overview: ${activeLead.customer_name}`}</h2>
                  </div>
                  <div className="gmail-thread-actions">
                    <button title="Star" onClick={(e) => toggleStar(activeLead.id, e)}>
                      <Star size={18} fill={starredIds.has(activeLead.id) ? "#f4b400" : "none"} color={starredIds.has(activeLead.id) ? "#f4b400" : "#5f6368"} />
                    </button>
                    <button title="Print Email" onClick={() => handlePrintEmail(activeLead, activities)}><Printer size={18} color="#5f6368" /></button>
                    <button title="Reply" onClick={() => handleReply(activeLead)}><CornerUpLeft size={18} color="#5f6368" /></button>
                    {trashedIds.has(activeLead.id) ? (
                      <>
                        <button title="Restore to Inbox" onClick={(e) => restoreFromTrash(activeLead.id, e)}>
                          <RotateCcw size={18} color="#16a34a" />
                        </button>
                        <button title="Delete Permanently" onClick={(e) => permanentlyDelete(activeLead.id, e)}>
                          <Trash2 size={18} color="#dc2626" />
                        </button>
                      </>
                    ) : (
                      <button title="Delete Email (Move to Trash)" onClick={(e) => moveToTrash(activeLead.id, e)}>
                        <Trash2 size={18} color="#dc2626" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lead Primary Email Message Card */}
                <div className="gmail-msg-card">
                  <div
                    className="gmail-msg-head"
                    style={{ cursor: "pointer" }}
                    onClick={() => setMsgBodyExpanded(v => !v)}
                    title={msgBodyExpanded ? "Collapse email" : "Expand email"}
                  >
                    <div className="gmail-avatar" style={{ background: getAvatarBg(activeLead.id) }}>
                      {getAvatarInitials(activeLead.customer_name || activeLead.company_name)}
                    </div>
                    <div className="gmail-msg-meta">
                      <div className="gmail-msg-sender-line">
                        <strong>{activeLead.customer_name}</strong>
                        <span className="gmail-msg-email">&lt;{activeLead.email || "no-email@partner.com"}&gt;</span>
                      </div>
                      <div className="gmail-msg-to" style={{ userSelect: "none" }}>
                        to me
                        <ChevronDown
                          size={12}
                          style={{
                            display: "inline",
                            marginLeft: 4,
                            transition: "transform 0.2s",
                            transform: msgBodyExpanded ? "rotate(180deg)" : "rotate(0deg)"
                          }}
                        />
                      </div>
                      {!msgBodyExpanded && (
                        <div style={{ fontSize: 12, color: "#80868b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 340 }}>
                          Dear Adstra Digital Team, We are looking for end-to-end ERP implementation...
                        </div>
                      )}
                    </div>
                    <div className="gmail-msg-time">
                      {fmtDateTime(activeLead.created_at || activeLead.updated_at)}
                    </div>
                  </div>

                  {msgBodyExpanded && (
                    <>
                      <div className="gmail-msg-body">
                        <p>Dear Adstra Digital Team,</p>
                        <p>
                          We are looking for end-to-end ERP implementation for <strong>{activeLead.company_name || activeLead.customer_name}</strong>.
                          Our primary focus is <strong>{activeLead.service || activeLead.product || "Ayurvedic ERP & Clinic Management"}</strong>.
                        </p>
                        {activeLead.requirement_summary && (
                          <div className="gmail-quote-box">
                            <strong>Client Requirement Notes:</strong>
                            <p>{activeLead.requirement_summary}</p>
                          </div>
                        )}
                        <p>Please share the proposal, pricing breakdown, and schedule a live product walkthrough at your earliest convenience.</p>
                        <br />
                        <p className="gmail-signature">
                          Regards,<br />
                          <strong>{activeLead.contact_person || activeLead.customer_name}</strong><br />
                          {activeLead.company_name}<br />
                          📞 {activeLead.phone || "N/A"}
                        </p>
                      </div>

                      {/* Action Toolbar */}
                      <div className="gmail-msg-actions">
                        <button className="gmail-btn-reply" onClick={(e) => { e.stopPropagation(); handleReply(activeLead); }}>
                          <CornerUpLeft size={15} /> Reply
                        </button>
                        <button className="gmail-btn-forward" onClick={(e) => { e.stopPropagation(); handleForward(activeLead); }}>
                          Forward →
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Sent Email History Stack */}
                {activities.length > 0 && (
                  <div className="gmail-history-stack">
                    <h4 style={{ fontSize: 13, color: '#5f6368', margin: '20px 0 10px' }}>Previous Outbound Emails ({activities.length})</h4>
                    {activities.map(a => (
                      <div key={a.id} className="gmail-msg-card gmail-msg-card--sent">
                        <div className="gmail-msg-head">
                          <div className="gmail-avatar" style={{ background: '#1a73e8' }}>AD</div>
                          <div className="gmail-msg-meta">
                            <strong>Adstra Digital Support</strong>
                            <span className="gmail-msg-email">&lt;{a.metadata?.recipient_email || activeLead.email}&gt;</span>
                          </div>
                          <div className="gmail-msg-time">{fmtDateTime(a.created_at)}</div>
                        </div>
                        <div className="gmail-msg-body">
                          <strong>Subject: {a.title}</strong>
                          <p style={{ whiteSpace: 'pre-wrap', marginTop: 8, color: '#3c4043' }}>{a.description}</p>
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                          <button className="gmail-btn-reply" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => handleReply(activeLead, a)}>
                            <CornerUpLeft size={13} /> Reply
                          </button>
                          <button className="gmail-btn-forward" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => handleForward(activeLead, a)}>
                            Forward →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Docked Gmail Floating Compose Window ── */}
      {composeConfig && (
        <GmailComposeModal
          lead={composeConfig.lead || activeLead || leads[0]}
          allLeads={leads}
          initialRecipient={composeConfig.recipient}
          initialSubject={composeConfig.subject}
          initialBody={composeConfig.body}
          onClose={() => setComposeConfig(null)}
          onSent={() => {
            onRefresh?.();
            if (activeLead) {
              api.timeline(activeLead.id).then(r => setActivities((r.data.results || r.data || []).filter(a => a.activity_type === "EMAIL")));
            }
          }}
        />
      )}
    </div>
  );
}



// ─── Target Scope Definition Modal ────────────────────────────────────────────

function ScopeDefinitionModal({ selectedUser, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [scopeDate, setScopeDate] = useState(() => localDateInputValue());
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const { showAlert } = useModal();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !scopeDate) return;
    setSaving(true);
    try {
      const response = await ax("post", "/lead-lists/", {
        name: name.trim(),
        scope_date: scopeDate,
        description: description.trim(),
        assigned_team: selectedUser?.fullname || selectedUser?.username || "Sales Team",
        status: "ACTIVE",
      });
      showAlert("Target Scope Created", "Your target scope is ready. Add contacts with Bulk Upload or Add Lead.", "success");
      onSuccess?.(response.data);
    } catch (error) {
      showAlert("Creation Error", error.response?.data?.error || "Failed to create target scope.", "error");
    } finally {
      setSaving(false);
    }
  };

  return <div className="lm-overlay" onClick={onClose}>
    <div className="lm-dialog lm-dialog--sm" onClick={event => event.stopPropagation()}>
      <div className="lm-dialog__head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eef2ff", color: "#4f46e5", display: "grid", placeItems: "center" }}><Building2 size={20} /></div>
          <div><h3 style={{ margin: 0, fontSize: 16 }}>Create Target Scope</h3><p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Define the scope first, then add contacts inside it.</p></div>
        </div>
        <button className="lm-icon-btn" onClick={onClose} type="button"><X size={18} /></button>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: "22px 28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ display: "grid", gap: 6, color: "#334155", fontSize: 13, fontWeight: 600 }}>Target Scope Name <span><input required autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="e.g. August 2026 Auditions" style={{ width: "100%", marginTop: 6, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, fontWeight: 400, color: "#0f172a" }} /></span></label>
        <label style={{ display: "grid", gap: 6, color: "#334155", fontSize: 13, fontWeight: 600 }}>Scope Date <input required type="date" value={scopeDate} onChange={event => setScopeDate(event.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, fontWeight: 400, color: "#0f172a" }} /></label>
        <label style={{ display: "grid", gap: 6, color: "#334155", fontSize: 13, fontWeight: 600 }}>Description <textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="Optional scope notes" rows={3} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical", fontSize: 13, fontWeight: 400, color: "#0f172a" }} /></label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}><button type="button" className="lm-btn lm-btn--ghost" onClick={onClose}>Cancel</button><button type="submit" className="lm-btn lm-btn--primary" disabled={saving || !name.trim() || !scopeDate}>{saving ? <><Loader2 size={15} className="spin" /> Creating…</> : <><Plus size={15} /> Create Scope</>}</button></div>
      </form>
    </div>
  </div>;
}

// ─── Upload Target List Modal ──────────────────────────────────────────────────

function UploadTargetModal({ selectedUser, onClose, onUploadSuccess, downloadTemplate, targetListId = null, targetListName = "" }) {
  const [listName, setListName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showAlert } = useModal();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) setSelectedFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetListId && !listName.trim()) {
      showAlert("Required", "Please enter a target list name.", "warning");
      return;
    }
    if (!selectedFile) {
      showAlert("Required", "Please select or drag & drop a CSV/Excel file.", "warning");
      return;
    }

    setUploading(true);
    let newList = null;
    try {
      if (!targetListId) {
        const listRes = await ax("post", "/lead-lists/", {
          name: listName.trim(),
          assigned_team: selectedUser?.fullname || selectedUser?.username || "Sales Team",
          description: `Uploaded by admin for ${selectedUser?.fullname || selectedUser?.username || "Sales Team"}`,
          status: "ACTIVE",
        });
        newList = listRes.data;
      }

      // Validate first; the ImportResultModal commits the accepted rows.
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("mode", "targets");
      fd.append("customer_list", targetListId || newList.id);
      fd.append("dry_run", "true");

      const importRes = await ax("post", "/lead-import/", fd, {
        headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
      });

      onUploadSuccess({
        importResult: { ...importRes.data, listName: targetListName || newList.name },
        file: selectedFile,
        mode: "targets",
        customerListId: targetListId || newList.id,
        listName: targetListName || newList.name,
        createdList: !targetListId,
      });
      onClose();
    } catch (err) {
      if (newList) {
        try { await ax("delete", `/lead-lists/${newList.id}/`); } catch {}
      }
      showAlert(
        "Upload Error",
        err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.errors?.[0] ||
          err.response?.data?.error ||
          "Upload failed.",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="lm-overlay" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="lm-dialog" onClick={e => e.stopPropagation()} style={{ width: "90vw", maxWidth: 540, boxSizing: "border-box", overflow: "hidden", margin: "auto" }}>
        <div className="lm-dialog__head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#eef2ff", color: "#4f46e5", display: "grid", placeItems: "center" }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>{targetListId ? "Bulk Upload to Target Scope" : "Upload New Target List"}</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{targetListId ? targetListName : `For ${selectedUser?.fullname || "Sales Representative"}`}</p>
            </div>
          </div>
          <button className="lm-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box", width: "100%" }} onSubmit={handleSubmit}>
          {!targetListId && <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 4 }}>
              Target List Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Aug 2026 Pharma Leads"
              value={listName}
              onChange={e => setListName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                background: "#f8fafc",
                transition: "all 0.16s ease",
                boxSizing: "border-box"
              }}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "#cbd5e1"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
            />
          </div>}

          {/* File Picker Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 4 }}>
              Upload CSV or Excel File <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div
              className="lm-target-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: selectedFile ? "2px solid #22c55e" : "2px dashed #cbd5e1",
                borderRadius: 12,
                padding: "22px 16px",
                textAlign: "center",
                background: selectedFile ? "#f0fdf4" : "#f8fafc",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
                width: "100%"
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx"
                hidden
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                    <FileText size={28} color="#16a34a" />
                    <div>
                      <strong style={{ fontSize: 13, color: "#15803d", display: "block" }}>{selectedFile.name}</strong>
                      <span style={{ fontSize: 11, color: "#65a30d" }}>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="lm-icon-btn"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    title="Remove file"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", margin: 0, border: "none", background: "transparent" }}
                  >
                    <X size={16} color="#dc2626" />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={28} color="#6366f1" style={{ marginBottom: 6 }} />
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                    Click to choose file or drag & drop here
                  </p>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>CSV or Excel (.xlsx) files supported</span>
                </div>
              )}
            </div>
          </div>

          {/* Download Template Box */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, flexWrap: "wrap", gap: 8, boxSizing: "border-box", width: "100%" }}>
            <span style={{ fontSize: 12.5, color: "#475569", fontWeight: 500 }}>Need the proper column format?</span>
            <button
              type="button"
              className="lm-btn lm-btn--ghost lm-btn--xs"
              onClick={downloadTemplate}
              style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}
            >
              <Download size={13} /> Download Template
            </button>
          </div>

          {/* Modal Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <button type="button" className="lm-btn lm-btn--ghost" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="lm-btn lm-btn--primary"
              disabled={uploading || (!targetListId && !listName.trim()) || !selectedFile}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {uploading ? <><Loader2 size={15} className="spin" /> Processing…</> : <><Upload size={15} /> {targetListId ? "Upload to Scope" : "Upload & Process"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Target List Detail / Validation Window Modal ────────────────────────────

function TargetListDetailModal({ targetList, selectedUser, onClose, onConfirmLeads, onBulkUpload, onContactsChanged, refreshToken }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingRowId, setSavingRowId] = useState(null);

  // New Contact Addition State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({
    company_name: "",
    customer_name: "",
    contact_person: "",
    contact_numbers: [],
    email: "",
    city: "",
    industry: "",
  });
  const [savingNew, setSavingNew] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    if (!targetList?.id) return;
    setLoading(true);
    ax("get", `/target-customers/?customer_list=${targetList.id}&page_size=100`)
      .then(r => {
        setCustomers(r.data?.results || (Array.isArray(r.data) ? r.data : []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetList, refreshToken]);

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditForm({
      company_name: c.company_name || "",
      customer_name: c.customer_name || "",
      contact_person: c.contact_person || "",
      contact_numbers: c.contact_numbers || [],
      email: c.email || "",
      city: c.city || "",
      industry: c.industry || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    setSavingRowId(id);
    try {
      const res = await ax("patch", `/target-customers/${id}/`, editForm);
      setCustomers(prev => prev.map(item => item.id === id ? { ...item, ...res.data } : item));
      setEditingId(null);
      setEditForm({});
      onContactsChanged?.();
    } catch (err) {
      const d = err.response?.data;
      let msg = "Failed to update contact.";
      if (d) {
        if (typeof d.error === 'string') msg = d.error;
        else if (d.errors?.[0]?.message) msg = d.errors[0].message;
        else if (typeof d === 'object') msg = Object.values(d).flat()[0] || msg;
      }
      showAlert("Save Error", msg, "error");
    } finally {
      setSavingRowId(null);
    }
  };

  const startAddNew = () => {
    setIsAddingNew(true);
    setNewForm({
      company_name: "",
      customer_name: "",
      contact_person: "",
      contact_numbers: [],
      email: "",
      city: "",
      industry: "",
    });
  };

  const cancelAddNew = () => {
    setIsAddingNew(false);
    setNewForm({});
  };

  const saveNewContact = async () => {
    setSavingNew(true);
    try {
      const payload = {
        customer_list: targetList.id,
        ...newForm,
      };
      const res = await ax("post", "/target-customers/", payload);
      setCustomers(prev => [res.data, ...prev]);
      setIsAddingNew(false);
      setNewForm({});
      onContactsChanged?.();
      showAlert("Added", "New target contact added to list.", "success");
    } catch (err) {
      const d = err.response?.data;
      let msg = "Failed to add contact.";
      if (d) {
        if (typeof d.error === 'string') msg = d.error;
        else if (d.errors?.[0]?.message) msg = d.errors[0].message;
        else if (typeof d === 'object') msg = Object.values(d).flat()[0] || msg;
      }
      showAlert("Error", msg, "error");
    } finally {
      setSavingNew(false);
    }
  };

  const deleteContact = async (id) => {
    showConfirm("Delete Contact", "Are you sure you want to remove this contact from the target list?", async () => {
      setDeletingId(id);
      try {
        await ax("delete", `/target-customers/${id}/`);
        setCustomers(prev => prev.filter(c => c.id !== id));
        onContactsChanged?.();
        showAlert("Deleted", "Contact removed from target list.", "info");
      } catch (err) {
        showAlert("Error", err.response?.data?.error || "Failed to delete contact.", "error");
      } finally {
        setDeletingId(null);
      }
    }, "danger");
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await onConfirmLeads(targetList.id);
    } finally {
      setProcessing(false);
    }
  };

  const cellStyle = {
    whiteSpace: "nowrap",
  };

  const inputStyle = {
    width: "100%",
    minWidth: 120,
    padding: "5px 8px",
    fontSize: 12,
    border: "1px solid #6366f1",
    borderRadius: 6,
    outline: "none",
    background: "#fff",
    color: "#0f172a",
    whiteSpace: "nowrap",
  };

  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-dialog lm-dialog--wide" onClick={e => e.stopPropagation()} style={{ width: "95vw", maxWidth: 1180 }}>
        {/* Header */}
        <div className="lm-dialog__head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e0e7ff", color: "#4f46e5", display: "grid", placeItems: "center" }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Target List Validation & Preview</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                Target List: <strong>{targetList.name}</strong> ({customers.length} contacts) for <strong>{selectedUser?.fullname || selectedUser?.username}</strong>
              </p>
            </div>
          </div>
          <button className="lm-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "72vh", overflowY: "auto" }}>
          {loading ? (
            <div className="lm-center-state" style={{ padding: 40 }}>
              <Loader2 size={28} className="spin" />
              <p>Loading target contacts…</p>
            </div>
          ) : (
            <>
              <div className="lm-target-scope-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12.5, color: "#166534", display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>Validated <strong>{customers.length}</strong> target contact(s). You can edit, delete, or add new contacts below before processing.</span>
                </div>
                {onBulkUpload && <button
                  type="button"
                  onClick={onBulkUpload}
                  disabled={isAddingNew || editingId !== null}
                  className="lm-btn lm-btn--ghost lm-btn--sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                >
                  <Upload size={15} /> Bulk Upload
                </button>}
                <button
                  type="button"
                  onClick={startAddNew}
                  disabled={isAddingNew || editingId !== null}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#4f46e5",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  <Plus size={15} /> Add Lead
                </button>
              </div>

              <div className="lm-table-wrap" style={{ maxHeight: 380, overflowX: "auto", overflowY: "auto" }}>
                <table className="lm-table" style={{ fontSize: 12, whiteSpace: "nowrap", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: 40, whiteSpace: "nowrap", textAlign: "center" }}>#</th>
                      <th style={{ width: 100, textAlign: "center", whiteSpace: "nowrap" }}>Actions</th>
                      <th style={{ minWidth: 180, whiteSpace: "nowrap" }}>Target Scope / Batch</th>
                      <th style={{ minWidth: 200, whiteSpace: "nowrap" }}>Company</th>
                      <th style={{ minWidth: 140, whiteSpace: "nowrap" }}>Customer Name</th>
                      <th style={{ minWidth: 140, whiteSpace: "nowrap" }}>Contact Person</th>
                      <th style={{ minWidth: 130, whiteSpace: "nowrap" }}>Phone</th>
                      <th style={{ minWidth: 170, whiteSpace: "nowrap" }}>Email</th>
                      <th style={{ minWidth: 110, whiteSpace: "nowrap" }}>City</th>
                      <th style={{ minWidth: 130, whiteSpace: "nowrap" }}>Industry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                          No target contacts in this list. Click <strong>"Add Lead"</strong> above to add one.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c, idx) => (
                        <tr key={c.id || idx}>
                          <td className="lm-cell--num" style={cellStyle}>{idx + 1}</td>
                          <td style={{ ...cellStyle, textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                              <button
                                type="button"
                                title="Edit contact"
                                onClick={() => startEdit(c)}
                                style={{ border: "1px solid #e0e7ff", background: "#eef2ff", color: "#4f46e5", padding: "4px 7px", borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                title="Delete row contact"
                                onClick={() => deleteContact(c.id)}
                                disabled={deletingId === c.id}
                                style={{ border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", padding: "4px 7px", borderRadius: 6, cursor: "pointer", display: "grid", placeItems: "center" }}
                              >
                                {deletingId === c.id ? <Loader2 size={12} className="spin" /> : <Trash2 size={12} />}
                              </button>
                            </div>
                          </td>
                          <td style={cellStyle}>
                            <span style={{ padding: "3px 8px", background: "#eef2ff", color: "#4f46e5", borderRadius: 4, fontWeight: 600, fontSize: 11 }}>
                              {targetList.name}
                            </span>
                          </td>
                          <td style={cellStyle}><strong>{c.company_name || "—"}</strong></td>
                          <td style={cellStyle}>{c.customer_name || "—"}</td>
                          <td style={cellStyle}>{c.contact_person || "—"}</td>
                          <td style={cellStyle}>
                            {c.contact_numbers?.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {c.contact_numbers.map(n => (
                                  <span key={n.id || n.number} style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                                    <span style={{ fontWeight: 600, color: "#64748b" }}>{n.number_type === 'WHATSAPP' ? 'WA' : 'PH'} ({n.label}):</span> {n.number}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              c.phone || "—"
                            )}
                          </td>
                          <td style={cellStyle}>{c.email || "—"}</td>
                          <td style={cellStyle}>{c.city || "—"}</td>
                          <td style={cellStyle}>{c.industry || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="lm-form__actions" style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", margin: 0, justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="lm-btn lm-btn--ghost" onClick={onClose} disabled={processing}>
            Cancel
          </button>
          <button
            type="button"
            className="lm-btn lm-btn--primary"
            disabled={processing || loading || customers.length === 0}
            onClick={handleConfirm}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {processing ? (
              <><Loader2 size={15} className="spin" /> Processing to Leads…</>
            ) : (
              <><CheckCircle2 size={15} /> Okay / Show on Leads Section</>
            )}
          </button>
        </div>
      </div>

      {/* Popup Form Modal for Adding or Editing a Contact */}
      {(isAddingNew || editingId !== null) && (
        <div className="lm-overlay" style={{ zIndex: 1100 }} onClick={isAddingNew ? cancelAddNew : cancelEdit}>
          <div className="lm-dialog" style={{ width: "90vw", maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="lm-dialog__head">
              <h3>{isAddingNew ? "Add Target Lead" : "Edit Target Contact"}</h3>
              <button className="lm-icon-btn" onClick={isAddingNew ? cancelAddNew : cancelEdit}>
                <X size={18} />
              </button>
            </div>
            <form
              className="lm-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (isAddingNew) {
                  saveNewContact();
                } else {
                  saveEdit(editingId);
                }
              }}
            >
              <div className="lm-form__grid">
                <label>
                  <span>Company Name</span>
                  <input
                    value={isAddingNew ? (newForm.company_name || "") : (editForm.company_name || "")}
                    onChange={e => {
                      const val = e.target.value;
                      if (isAddingNew) setNewForm(f => ({ ...f, company_name: val }));
                      else setEditForm(f => ({ ...f, company_name: val }));
                    }}
                    placeholder="e.g. Acme Corp"
                    autoFocus
                  />
                </label>
                <label>
                  <span>Customer Name</span>
                  <input
                    value={isAddingNew ? (newForm.customer_name || "") : (editForm.customer_name || "")}
                    onChange={e => {
                      const val = e.target.value;
                      if (isAddingNew) setNewForm(f => ({ ...f, customer_name: val }));
                      else setEditForm(f => ({ ...f, customer_name: val }));
                    }}
                    placeholder="e.g. John Doe"
                  />
                </label>
                <label>
                  <span>Contact Person</span>
                  <input
                    value={isAddingNew ? (newForm.contact_person || "") : (editForm.contact_person || "")}
                    onChange={e => {
                      const val = e.target.value;
                      if (isAddingNew) setNewForm(f => ({ ...f, contact_person: val }));
                      else setEditForm(f => ({ ...f, contact_person: val }));
                    }}
                    placeholder="Contact Person"
                  />
                </label>
                <ContactNumbersInput 
                  value={isAddingNew ? (newForm.contact_numbers || []) : (editForm.contact_numbers || [])}
                  onChange={val => {
                    if (isAddingNew) setNewForm(f => ({ ...f, contact_numbers: val }));
                    else setEditForm(f => ({ ...f, contact_numbers: val }));
                  }}
                />
                <label>
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={isAddingNew ? (newForm.email || "") : (editForm.email || "")}
                    onChange={e => {
                      const val = e.target.value;
                      if (isAddingNew) setNewForm(f => ({ ...f, email: val }));
                      else setEditForm(f => ({ ...f, email: val }));
                    }}
                    placeholder="email@example.com"
                  />
                </label>
                <label>
                  <span>City</span>
                  <input
                    value={isAddingNew ? (newForm.city || "") : (editForm.city || "")}
                    onChange={e => {
                      const val = e.target.value;
                      if (isAddingNew) setNewForm(f => ({ ...f, city: val }));
                      else setEditForm(f => ({ ...f, city: val }));
                    }}
                    placeholder="e.g. Kozhikode"
                  />
                </label>
                <label className="lm-form__span">
                  <span>Industry</span>
                  <input
                    value={isAddingNew ? (newForm.industry || "") : (editForm.industry || "")}
                    onChange={e => {
                      const val = e.target.value;
                      if (isAddingNew) setNewForm(f => ({ ...f, industry: val }));
                      else setEditForm(f => ({ ...f, industry: val }));
                    }}
                    placeholder="e.g. Manufacturing"
                  />
                </label>
              </div>
              <div className="lm-form__actions">
                <button
                  type="button"
                  className="lm-btn lm-btn--ghost"
                  onClick={isAddingNew ? cancelAddNew : cancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lm-btn lm-btn--primary"
                  disabled={isAddingNew ? savingNew : (savingRowId !== null)}
                >
                  {(isAddingNew ? savingNew : (savingRowId !== null)) && <Loader2 size={15} className="spin" />}
                  {(isAddingNew ? savingNew : (savingRowId !== null)) ? "Saving…" : isAddingNew ? "Add Contact" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tele Calling Sales View ─────────────────────────────────────────────────

function TeleCallingSalesView({ onViewLead, onUsersUpdated, onOpenProfile }) {
  const { showAlert, showConfirm } = useModal();
  const [salesUsers, setSalesUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("leads");
  const [viewTargetList, setViewTargetList] = useState(null);

  const [availableDesignations, setAvailableDesignations] = useState([]);
  const [selectedDesignations, setSelectedDesignations] = useState([]);
  const [showDesigDropdown, setShowDesigDropdown] = useState(false);
  const [savingDesigConfig, setSavingDesigConfig] = useState(false);

  // User workspace data
  const [userLeads, setUserLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [targetLists, setTargetLists] = useState([]);
  const [teleBatchFilter, setTeleBatchFilter] = useState("ALL");
  const [teleSearchQuery, setTeleSearchQuery] = useState("");
  const [teleTargetSearchQuery, setTeleTargetSearchQuery] = useState("");

  const teleBatchOptions = useMemo(() => {
    const listNames = new Set((targetLists || []).map(l => l.name));
    (userLeads || []).forEach(l => {
      if (l.target_list_name) listNames.add(l.target_list_name);
    });
    return Array.from(listNames);
  }, [targetLists, userLeads]);

  const filteredUserLeads = useMemo(() => {
    let result = userLeads;
    if (teleBatchFilter === "DIRECT") {
      result = result.filter(l => !l.target_list_name);
    } else if (teleBatchFilter !== "ALL") {
      result = result.filter(l => l.target_list_name === teleBatchFilter);
    }

    if (teleSearchQuery.trim()) {
      const q = teleSearchQuery.toLowerCase().trim();
      result = result.filter(l => {
        const company = (l.company_name || "").toLowerCase();
        const customer = (l.customer_name || "").toLowerCase();
        const contact = (l.contact_person || "").toLowerCase();
        const phone = (l.phone || "").toLowerCase();
        const email = (l.email || "").toLowerCase();
        const leadNo = (l.lead_number || "").toLowerCase();
        const service = (l.service || "").toLowerCase();
        const product = (l.product || "").toLowerCase();
        const batch = (l.target_list_name || "").toLowerCase();
        return company.includes(q) || customer.includes(q) || contact.includes(q) ||
               phone.includes(q) || email.includes(q) || leadNo.includes(q) ||
               service.includes(q) || product.includes(q) || batch.includes(q);
      });
    }

    return result;
  }, [userLeads, teleBatchFilter, teleSearchQuery]);

  const filteredTeleTargetLists = useMemo(() => {
    const lists = targetLists || [];
    if (!teleTargetSearchQuery.trim()) return lists;
    const q = teleTargetSearchQuery.toLowerCase().trim();
    return lists.filter(l => {
      const name = (l.name || "").toLowerCase();
      const campaign = (l.campaign_name || "").toLowerCase();
      const desc = (l.description || "").toLowerCase();
      const uploader = (l.uploaded_by_name || "").toLowerCase();
      const scopeDate = (l.scope_date || "").toLowerCase();
      return name.includes(q) || campaign.includes(q) || desc.includes(q) || uploader.includes(q) || scopeDate.includes(q);
    });
  }, [targetLists, teleTargetSearchQuery]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [userReport, setUserReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [listName, setListName] = useState("");
  const uploadRef = useRef(null);
  const [importResult, setImportResult] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingCustomerListId, setPendingCustomerListId] = useState(null);
  const [pendingListName, setPendingListName] = useState("");
  const [pendingListCreated, setPendingListCreated] = useState(false);
  const [isSavingImport, setIsSavingImport] = useState(false);

  // ── Download Excel Template Helper ──────────────────────────────────
  const downloadTemplate = async () => {
    try {
      const [excel, saver] = await Promise.all([
        import('exceljs'),
        import('file-saver')
      ]);
      const ExcelJS = excel.default || excel;
      const saveAs = saver.default?.saveAs || saver.saveAs || saver.default || saver;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Target Customers Template');

      // Define columns with custom widths
      worksheet.columns = [
        { header: 'company_name', key: 'company_name', width: 25 },
        { header: 'customer_name', key: 'customer_name', width: 25 },
        { header: 'contact_person', key: 'contact_person', width: 25 },
        { header: 'phone', key: 'phone', width: 20 },
        { header: 'whatsapp_number', key: 'whatsapp_number', width: 20 },
        { header: 'email', key: 'email', width: 25 },
        { header: 'website', key: 'website', width: 25 },
        { header: 'address', key: 'address', width: 30 },
        { header: 'city', key: 'city', width: 15 },
        { header: 'state', key: 'state', width: 15 },
        { header: 'industry', key: 'industry', width: 20 },
        { header: 'business_category', key: 'business_category', width: 25 },
      ];

      // Format Header Row (Styled Indigo background)
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
      headerRow.height = 28;

      // Add sample row with realistic dummy values
      const sampleRow = worksheet.addRow({
        company_name: 'Adstra Digital',
        customer_name: 'John Doe',
        contact_person: 'John Doe',
        phone: '+919876543210',
        whatsapp_number: '+919876543210',
        email: 'john@adstradigital.com',
        website: 'https://adstradigital.com',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        industry: 'IT',
        business_category: 'Software Development',
      });

      // Format the sample cells as text format (@) to prevent scientific notation (e.g. 9.2E+11)
      worksheet.columns.forEach(col => {
        const cell = sampleRow.getCell(col.key);
        cell.numFmt = '@';
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });

      // Write buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'target_customer_template.xlsx');
    } catch (err) {
      console.error("Failed to generate Excel template:", err);
      showAlert("Error", "Failed to generate Excel template. Please try again.", "error");
    }
  };


  // ── Fetch sales team users on mount ──────────────────────────────────
  const fetchSalesUsers = useCallback(() => {
    setLoadingUsers(true);
    ax("get", "/tele-sales-users/")
      .then(r => {
        if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
          setSalesUsers(r.data.users || []);
          setSelectedDesignations(r.data.selected_designations || []);
          setAvailableDesignations(r.data.available_designations || []);
        } else {
          setSalesUsers(Array.isArray(r.data) ? r.data : []);
        }
      })
      .catch(() => showAlert("Error", "Failed to load sales team.", "error"))
      .finally(() => setLoadingUsers(false));
  }, [showAlert]);

  useEffect(() => {
    fetchSalesUsers();
  }, [fetchSalesUsers]);

  const displayUsers = useMemo(() => {
    if (selectedDesignations.length === 0) return [];
    return salesUsers.filter((u) => {
      const dept = u.department || "";
      const desig = u.designation || "";
      const role = u.role || "";
      const text = `${dept} ${desig} ${role}`.toLowerCase();
      return selectedDesignations.some(sel => {
        const s = sel.toLowerCase();
        return desig === sel || dept === sel || text.includes(s);
      });
    });
  }, [salesUsers, selectedDesignations]);

  const handleToggleDesignation = (desig) => {
    setSelectedDesignations(prev =>
      prev.includes(desig) ? prev.filter(d => d !== desig) : [...prev, desig]
    );
  };

  const handleSaveDesignations = async (newList) => {
    const listToSave = newList !== undefined ? newList : selectedDesignations;
    setSavingDesigConfig(true);
    try {
      await ax("post", "/tele-sales-users/", { selected_designations: listToSave });
      showAlert("Saved", "Designation preferences saved to DB successfully.", "success");
      setShowDesigDropdown(false);
      fetchSalesUsers();
      onUsersUpdated?.();
    } catch (e) {
      showAlert("Error", "Failed to save designation configuration.", "error");
    } finally {
      setSavingDesigConfig(false);
    }
  };

  // ── When a user is selected, fetch their data ──────────────────────
  useEffect(() => {
    if (!selectedUser) return;
    // Fetch leads
    setLoadingLeads(true);
    ax("get", `/leads/?assigned_to=${selectedUser.id}&page_size=100`)
      .then(r => setUserLeads(r.data?.results || (Array.isArray(r.data) ? r.data : [])))
      .catch(() => showAlert("Error", "Failed to load leads.", "error"))
      .finally(() => setLoadingLeads(false));

    // Fetch target lists
    setLoadingLists(true);
    ax("get", `/lead-lists/?page_size=100`)
      .then(r => {
        const all = r.data?.results || (Array.isArray(r.data) ? r.data : []);
        // Filter lists that were created for this user or assigned_team matches
        setTargetLists(all.filter(l =>
          l.created_by_id === selectedUser.id ||
          (l.assigned_team || "").toLowerCase().includes((selectedUser.fullname || "").toLowerCase()) ||
          (l.assigned_team || "").toLowerCase().includes((selectedUser.username || "").toLowerCase())
        ));
      })
      .catch(() => {})
      .finally(() => setLoadingLists(false));

    // Fetch report
    setLoadingReport(true);
    ax("get", `/tele-sales-report/${selectedUser.id}/`)
      .then(r => setUserReport(r.data))
      .catch(() => {})
      .finally(() => setLoadingReport(false));
  }, [selectedUser, showAlert]);

  const handleUploadSuccess = ({ importResult, file, mode, customerListId, listName, createdList }) => {
    setImportResult(importResult);
    setPendingFile(file);
    setPendingCustomerListId(customerListId);
    setPendingListName(listName);
    setPendingListCreated(Boolean(createdList));
  };

  const handleCancelImport = async () => {
    if (pendingCustomerListId && pendingListCreated) {
      try {
        await ax("delete", `/lead-lists/${pendingCustomerListId}/`);
        const listsFetch = await ax("get", `/lead-lists/?page_size=100`);
        const all = listsFetch.data?.results || (Array.isArray(listsFetch.data) ? listsFetch.data : []);
        setTargetLists(all.filter(l =>
          l.created_by_id === selectedUser.id ||
          (l.assigned_team || "").toLowerCase().includes((selectedUser.fullname || "").toLowerCase()) ||
          (l.assigned_team || "").toLowerCase().includes((selectedUser.username || "").toLowerCase())
        ));
      } catch (e) {
        console.error("Failed to delete cancelled list", e);
      }
    }
    setImportResult(null);
    setPendingFile(null);
    setPendingCustomerListId(null);
    setPendingListName("");
    setPendingListCreated(false);
    showAlert("Cancelled", "Target list import cancelled.", "info");
  };

  const handleCommitImport = async () => {
    if (!pendingFile) return;
    setIsSavingImport(true);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      fd.append("mode", "targets");
      if (pendingCustomerListId) {
        fd.append("customer_list", pendingCustomerListId);
      }
      const res = await ax("post", "/lead-import/", fd, {
        headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
      });
      setImportResult(null);
      setPendingFile(null);
      setPendingCustomerListId(null);
      setPendingListName("");
      setPendingListCreated(false);
      showAlert("Import Complete", `Successfully saved ${res.data.created_count ?? res.data.created?.length ?? 0} target customer record(s) to database.`, "success");

      // Re-fetch target lists & report
      const listsFetch = await ax("get", `/lead-lists/?page_size=100`);
      const all = listsFetch.data?.results || (Array.isArray(listsFetch.data) ? listsFetch.data : []);
      setTargetLists(all.filter(l =>
        l.created_by_id === selectedUser.id ||
        (l.assigned_team || "").toLowerCase().includes((selectedUser.fullname || "").toLowerCase()) ||
        (l.assigned_team || "").toLowerCase().includes((selectedUser.username || "").toLowerCase())
      ));
      if (selectedUser?.id) {
        ax("get", `/tele-sales-report/${selectedUser.id}/`).then(r => setUserReport(r.data)).catch(() => {});
      }
    } catch (err) {
      showAlert("Import Error", err.response?.data?.errors?.[0]?.message || err.response?.data?.errors?.[0] || err.response?.data?.error || "Save failed.", "error");
    } finally {
      setIsSavingImport(false);
    }
  };

  // ── Avatar initials helper ────────────────────────────────────────
  const getInitials = (name) => {
    const parts = (name || "?").trim().split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase();
  };

  const AVATAR_COLORS = [
    ["#6366f1","#8b5cf6"], ["#0891b2","#06b6d4"], ["#059669","#10b981"],
    ["#ea580c","#f97316"], ["#dc2626","#ef4444"], ["#7c3aed","#a855f7"],
    ["#0369a1","#0284c7"], ["#b45309","#d97706"],
  ];
  const avatarGradient = (id) => {
    const c = AVATAR_COLORS[id % AVATAR_COLORS.length];
    return `linear-gradient(135deg, ${c[0]}, ${c[1]})`;
  };

  // ─────────────────── RENDER ───────────────────────────────────────

  // ── Phase 2: User Workspace ────────────────────────────────────
  if (selectedUser) {
    const pipeline = userReport?.pipeline || [];
    const totalLeads = pipeline.reduce((a, p) => a + (p.count || 0), 0);
    const converted = pipeline.find(p => p.current_stage === "CONVERTED");
    const winRate = totalLeads > 0 ? ((converted?.count || 0) / totalLeads * 100).toFixed(1) : "0.0";
    const maxCount = Math.max(...pipeline.map(p => p.count), 1);

    const telecaller = userReport?.telecaller || [];
    const totalCalls = telecaller.reduce((a, t) => a + (t.total_calls || 0), 0);
    const connectedCalls = telecaller.reduce((a, t) => a + (t.connected_calls || 0), 0);
    const ts = userReport?.target_summary || {};

    return (
      <>
        <div className="lm-sales-workspace">
        {/* ── Breadcrumb ── */}
        <div className="lm-workspace-breadcrumb">
          <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => { setSelectedUser(null); setUserLeads([]); setUserReport(null); setTargetLists([]); setActiveTab("leads"); }}>
            <ChevronLeft size={16} /> Sales Team
          </button>
          <span className="lm-workspace-sep">/</span>
          <div className="lm-workspace-avatar-sm" style={{ background: avatarGradient(selectedUser.id), cursor: 'pointer' }} onClick={() => onOpenProfile?.(selectedUser)} title="Click to view Employee Profile">
            {getInitials(selectedUser.fullname)}
          </div>
          <strong onClick={() => onOpenProfile?.(selectedUser)} style={{ cursor: 'pointer', textDecoration: 'underline' }} title="Click to view Employee Profile">{selectedUser.fullname}</strong>
          {selectedUser.designation && <span className="lm-workspace-desg">{selectedUser.designation}</span>}
          <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => onOpenProfile?.(selectedUser)} style={{ marginLeft: 8 }} title="View Employee Profile">
            <User size={14} /> Profile
          </button>
        </div>

        {/* ── Quick Stats ── */}
        <div className="lm-sales-stat-row">
          <div className="lm-sales-mini-stat">
            <span className="lm-sales-mini-stat__val" style={{ color: "#6366f1" }}>{selectedUser.stats.total_leads}</span>
            <span className="lm-sales-mini-stat__lbl">Total Leads</span>
          </div>
          <div className="lm-sales-mini-stat">
            <span className="lm-sales-mini-stat__val" style={{ color: "#16a34a" }}>{selectedUser.stats.converted}</span>
            <span className="lm-sales-mini-stat__lbl">Converted</span>
          </div>
          <div className="lm-sales-mini-stat">
            <span className="lm-sales-mini-stat__val" style={{ color: "#f97316" }}>{selectedUser.stats.pending}</span>
            <span className="lm-sales-mini-stat__lbl">Pending</span>
          </div>
          <div className="lm-sales-mini-stat">
            <span className="lm-sales-mini-stat__val" style={{ color: "#0891b2" }}>{selectedUser.stats.calls_made}</span>
            <span className="lm-sales-mini-stat__lbl">Calls Made</span>
          </div>
          <div className="lm-sales-mini-stat">
            <span className="lm-sales-mini-stat__val" style={{ color: "#7c3aed" }}>{selectedUser.stats.target_customers}</span>
            <span className="lm-sales-mini-stat__lbl">Target Customers</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="lm-workspace-tabs">
          {[
            { id: "leads", icon: LayoutList, label: "Leads" },
            { id: "targets", icon: Upload, label: "Target Lists" },
            { id: "report", icon: BarChart2, label: "Performance Report" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`lm-workspace-tab ${activeTab === id ? "lm-workspace-tab--active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Leads ── */}
        {activeTab === "leads" && (
          <div className="lm-table-wrap">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "4px 0", flexWrap: "wrap", gap: 10 }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                Leads for {selectedUser?.fullname} <span style={{ color: "#64748b", fontWeight: 400 }}>({filteredUserLeads.length})</span>
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Global Search Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                  <Search size={14} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search leads, contacts, phone, batch..."
                    value={teleSearchQuery}
                    onChange={e => setTeleSearchQuery(e.target.value)}
                    style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, width: 220, color: "#0f172a" }}
                  />
                  {teleSearchQuery && (
                    <button type="button" onClick={() => setTeleSearchQuery("")} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#94a3b8", fontSize: 14, fontWeight: 700 }}>
                      ×
                    </button>
                  )}
                </div>

                {/* Searchable Batch Filter Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Filter size={14} color="#64748b" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Filter Batch:</span>
                  <SearchableBatchSelect
                    options={teleBatchOptions}
                    value={teleBatchFilter}
                    onChange={setTeleBatchFilter}
                    totalCount={userLeads.length}
                  />
                </div>
              </div>
            </div>

            {loadingLeads ? (
              <div className="lm-center-state"><Loader2 size={28} className="spin" /><p>Loading leads…</p></div>
            ) : filteredUserLeads.length === 0 ? (
              <div className="lm-center-state"><p>No leads match the selected target batch filter.</p></div>
            ) : (
              <table className="lm-table">
                <thead>
                  <tr>
                    <th style={{ width: 65, textAlign: "center" }}>#</th>
                    <th>LEAD & CONTACT</th>
                    <th>TARGET SCOPE / BATCH</th>
                    <th>SERVICE / PRODUCT</th>
                    <th>CREATED AT</th>
                    <th>LAST FOLLOW-UP</th>
                    <th>NEXT FOLLOW-UP</th>
                    <th style={{ textAlign: "center" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUserLeads.map((lead, idx) => {
                    const priorityLetter = lead.priority === "HIGH" ? "H" : lead.priority === "LOW" ? "L" : "M";
                    const priorityColor = lead.priority === "HIGH" ? "#dc2626" : lead.priority === "LOW" ? "#16a34a" : "#d97706";
                    const priorityBg = lead.priority === "HIGH" ? "#fef2f2" : lead.priority === "LOW" ? "#f0fdf4" : "#fffbeb";
                    const priorityBorder = lead.priority === "HIGH" ? "#fca5a5" : lead.priority === "LOW" ? "#86efac" : "#fcd34d";
                    const priorityAccent = lead.priority === "HIGH" ? "#ef4444" : lead.priority === "LOW" ? "#10b981" : "#f59e0b";

                    const lastFollowDate = lead.last_follow_up?.completed_at || lead.last_follow_up?.scheduled_at || lead.next_follow_up_at || lead.updated_at;
                    const lastFollowNote = lead.last_follow_up?.notes || lead.last_follow_up?.purpose || lead.last_follow_up?.result || lead.requirement_summary || "—";

                    return (
                      <tr key={lead.id} style={{ borderLeft: `4px solid ${priorityAccent}` }}>
                        <td style={{ color: "#475569", paddingLeft: 12 }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: priorityBg,
                                color: priorityColor,
                                border: `1.5px solid ${priorityBorder}`,
                                display: "inline-grid",
                                placeItems: "center",
                                fontSize: 10.5,
                                fontWeight: 700,
                                lineHeight: 1,
                                flexShrink: 0,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
                              }}
                              title={`Priority: ${lead.priority || "Medium"}`}
                            >
                              {priorityLetter}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{idx + 1}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                            {lead.company_name || lead.customer_name || "—"}
                          </div>
                          {lead.contact_person && (
                            <div style={{ fontSize: 12, color: "#334155", fontWeight: 600, marginTop: 1 }}>
                              Contact: {lead.contact_person}
                            </div>
                          )}
                          <small className="lm-table-sub" style={{ color: "#64748b", fontSize: 11 }}>
                            {lead.lead_number ? `${lead.lead_number} · ` : ""}{lead.email || lead.phone || "—"}
                          </small>
                        </td>
                        <td>
                          {lead.target_list_name ? (() => {
                            const bStyle = getBatchStyle(lead.target_list_name);
                            return (
                              <span
                                style={{
                                  padding: "3px 9px",
                                  background: bStyle.bg,
                                  color: bStyle.text,
                                  border: `1.5px solid ${bStyle.border}`,
                                  borderRadius: 6,
                                  fontWeight: 600,
                                  fontSize: 11,
                                  display: "inline-block"
                                }}
                              >
                                {lead.target_list_name}
                              </span>
                            );
                          })() : (
                            <span style={{ padding: "3px 8px", background: "#f1f5f9", color: "#64748b", borderRadius: 4, fontSize: 11, display: "inline-block" }}>
                              Direct Lead
                            </span>
                          )}
                        </td>
                        <td>{lead.service || lead.product || "—"}</td>
                        <td style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>
                          {lead.created_at ? fmtDateTime(lead.created_at) : "—"}
                        </td>
                        <td>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                            {lastFollowDate ? fmtDateTime(lastFollowDate) : "—"}
                          </div>
                          <div
                            style={{ fontSize: 11, color: "#64748b", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            title={typeof lastFollowNote === "string" ? lastFollowNote : ""}
                          >
                            {lastFollowNote}
                          </div>
                        </td>
                        <td>
                          {lead.next_follow_up_at ? (
                            <div className={isOverdue(lead.next_follow_up_at) ? "lm-overdue" : ""} style={{ fontSize: 12, fontWeight: 600 }}>
                              {fmtDateTime(lead.next_follow_up_at)}
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button className="lm-icon-btn" title="View lead" onClick={() => onViewLead?.(lead)}>
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab: Target Lists ── */}
        {activeTab === "targets" && (
          <div className="lm-target-workspace">
            {/* Upload card */}
            <div className="lm-target-upload-card">
              <div className="lm-target-upload-card__icon"><Upload size={28} color="#6366f1" /></div>
              <div className="lm-target-upload-card__body">
                <h4>Upload New Target List</h4>
                <p>Upload a CSV file with columns: company_name, customer_name, phone, email, city, industry, etc.</p>
                <div className="lm-target-upload-row">
                  <button
                    className="lm-btn lm-btn--primary"
                    onClick={() => setShowUploadModal(true)}
                    type="button"
                  >
                    <Upload size={15} /> Upload CSV List
                  </button>
                  <button
                    className="lm-btn lm-btn--ghost"
                    onClick={downloadTemplate}
                    type="button"
                  >
                    <Download size={15} /> Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* Existing lists */}
            <div className="lm-target-lists-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "24px 0 12px", flexWrap: "wrap", gap: 10 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  Existing Target Lists <span style={{ color: "#64748b", fontWeight: 400 }}>({filteredTeleTargetLists.length})</span>
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                    <Search size={14} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search target scope or batch..."
                      value={teleTargetSearchQuery}
                      onChange={e => setTeleTargetSearchQuery(e.target.value)}
                      style={{ border: "none", outline: "none", background: "transparent", fontSize: 12, width: 220, color: "#0f172a" }}
                    />
                    {teleTargetSearchQuery && (
                      <button type="button" onClick={() => setTeleTargetSearchQuery("")} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "#94a3b8", fontSize: 14, fontWeight: 700 }}>
                        ×
                      </button>
                    )}
                  </div>
                  <button
                    className="lm-btn lm-btn--primary lm-btn--sm"
                    onClick={() => setShowUploadModal(true)}
                    type="button"
                  >
                    <Upload size={14} /> Upload Target List
                  </button>
                  <button
                    className="lm-btn lm-btn--ghost lm-btn--sm"
                    onClick={downloadTemplate}
                    type="button"
                  >
                    <Download size={14} /> Download Template
                  </button>
                </div>
              </div>
              {loadingLists ? (
                <div className="lm-center-state"><Loader2 size={24} className="spin" /></div>
              ) : filteredTeleTargetLists.length === 0 ? (
                <div className="lm-target-empty">
                  <Building2 size={32} color="#cbd5e1" />
                  <p>{teleTargetSearchQuery ? `No target lists match "${teleTargetSearchQuery}"` : `No target lists uploaded yet for ${selectedUser.fullname}.`}</p>
                </div>
              ) : (
                <div className="lm-table-wrap" style={{ marginTop: 12 }}>
                  <table className="lm-table" style={{ fontSize: 12.5, width: "100%", whiteSpace: "nowrap" }}>
                    <thead>
                      <tr>
                        <th style={{ width: 40, textAlign: "center" }}>#</th>
                        <th style={{ minWidth: 220 }}>Target Scope / Batch Name</th>
                        <th style={{ minWidth: 140 }}>Campaign</th>
                        <th style={{ width: 100, textAlign: "center" }}>Status</th>
                        <th style={{ width: 120, textAlign: "center" }}>Total Contacts</th>
                        <th style={{ minWidth: 130 }}>Scope Date</th>
                        <th style={{ width: 140, textAlign: "center" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeleTargetLists.map((list, idx) => (
                        <tr key={list.id} style={{ cursor: "pointer" }} onClick={() => setViewTargetList(list)}>
                          <td style={{ textAlign: "center", color: "#64748b" }}>{idx + 1}</td>
                          <td>
                            <strong style={{ color: "#0f172a" }}>{list.name}</strong>
                            {list.description && <div style={{ fontSize: 11, color: "#64748b" }}>{list.description}</div>}
                          </td>
                          <td>{list.campaign || "—"}</td>
                          <td style={{ textAlign: "center" }}>
                            <span className={`lm-badge lm-badge--${list.status === "ACTIVE" ? "green" : "gray"}`}>{list.status}</span>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 600, color: "#4f46e5" }}>
                            {list.customer_count ?? (list.customers?.length ?? 0)} contacts
                          </td>
                          <td style={{ color: "#475569" }}>
                            {fmtDate(list.scope_date || list.updated_at || list.created_at)}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="lm-btn lm-btn--primary lm-btn--sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewTargetList(list);
                              }}
                              style={{ fontSize: 11, padding: "4px 10px" }}
                            >
                              View Batch Contacts
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Report ── */}
        {activeTab === "report" && (
          <div className="lm-sales-report">
            {loadingReport ? (
              <div className="lm-center-state"><Loader2 size={28} className="spin" /><p>Building report…</p></div>
            ) : !userReport ? (
              <div className="lm-center-state"><p>No report data available.</p></div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="lm-reports__grid">
                  <StatCard label="Total Leads" value={totalLeads} icon={BarChart2} color="#6366f1" />
                  <StatCard label="Conversion Rate" value={`${winRate}%`} icon={TrendingUp} color="#16a34a" />
                  <StatCard label="Total Calls" value={totalCalls} icon={PhoneCall} color="#0891b2" />
                  <StatCard label="Target Contacts" value={ts.total_customers ?? 0} icon={Building2} color="#7c3aed" />
                </div>

                {/* Pipeline Stage Breakdown */}
                {pipeline.length > 0 && (
                  <div className="lm-reports__section">
                    <div className="lm-reports__section-head">
                      <div>
                        <h4>Pipeline Stage Breakdown</h4>
                        <p>Lead distribution across all stages</p>
                      </div>
                    </div>
                    <div className="lm-sales-pipeline-bars">
                      {pipeline.map(p => (
                        <div key={p.current_stage} className="lm-sales-bar-row">
                          <div className="lm-sales-bar-label">
                            <StagePill stage={p.current_stage} small />
                            <span>{p.count}</span>
                          </div>
                          <div className="lm-sales-bar-track">
                            <div
                              className="lm-sales-bar-fill"
                              style={{
                                width: `${(p.count / maxCount) * 100}%`,
                                background: STAGE_META[p.current_stage]?.color || "#6366f1",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Telecalling Stats */}
                {telecaller.length > 0 && (
                  <div className="lm-reports__section">
                    <div className="lm-reports__section-head">
                      <div><h4>Calling Performance</h4><p>Total vs connected calls</p></div>
                    </div>
                    <div className="lm-sales-call-stats">
                      <div className="lm-sales-call-stat">
                        <PhoneCall size={22} color="#0891b2" />
                        <strong>{totalCalls}</strong>
                        <span>Total Calls</span>
                      </div>
                      <div className="lm-sales-call-stat">
                        <Check size={22} color="#16a34a" />
                        <strong>{connectedCalls}</strong>
                        <span>Connected</span>
                      </div>
                      <div className="lm-sales-call-stat">
                        <PhoneMissed size={22} color="#ef4444" />
                        <strong>{totalCalls - connectedCalls}</strong>
                        <span>Not Connected</span>
                      </div>
                      <div className="lm-sales-call-stat">
                        <Zap size={22} color="#f59e0b" />
                        <strong>{totalCalls > 0 ? `${((connectedCalls / totalCalls) * 100).toFixed(1)}%` : "—"}</strong>
                        <span>Connection Rate</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lead Source Breakdown */}
                {(userReport.lead_source || []).length > 0 && (
                  <div className="lm-reports__section">
                    <div className="lm-reports__section-head">
                      <div><h4>Lead Sources</h4><p>Where this user's leads come from</p></div>
                    </div>
                    <div className="lm-table-wrap">
                      <table className="lm-table">
                        <thead>
                          <tr><th>Source</th><th>Leads</th><th>Converted</th></tr>
                        </thead>
                        <tbody>
                          {(userReport.lead_source || []).map(s => (
                            <tr key={s.source || "unknown"}>
                              <td>{SOURCE_LABELS[s.source] || s.source || "Unknown"}</td>
                              <td><strong>{s.count}</strong></td>
                              <td><span style={{ color: "#16a34a", fontWeight: 700 }}>{s.converted || 0}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Target Summary */}
                {ts.total_customers > 0 && (
                  <div className="lm-reports__section">
                    <div className="lm-reports__section-head">
                      <div><h4>Target List Summary</h4><p>Target customers assigned to this user</p></div>
                    </div>
                    <div className="lm-sales-call-stats">
                      <div className="lm-sales-call-stat">
                        <Building2 size={22} color="#7c3aed" />
                        <strong>{ts.total_lists ?? 0}</strong>
                        <span>Lists</span>
                      </div>
                      <div className="lm-sales-call-stat">
                        <Users size={22} color="#0891b2" />
                        <strong>{ts.total_customers ?? 0}</strong>
                        <span>Contacts</span>
                      </div>
                      <div className="lm-sales-call-stat">
                        <PhoneMissed size={22} color="#ef4444" />
                        <strong>{ts.do_not_call ?? 0}</strong>
                        <span>Do Not Call</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {importResult && (
          <ImportResultModal
            result={importResult}
            onClose={handleCancelImport}
            onCancel={handleCancelImport}
            onSave={handleCommitImport}
            isSaving={isSavingImport}
          />
        )}
        {showUploadModal && (
          <UploadTargetModal
            selectedUser={selectedUser}
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={handleUploadSuccess}
            downloadTemplate={downloadTemplate}
          />
        )}
        {viewTargetList && (
          <TargetListDetailModal
            targetList={viewTargetList}
            selectedUser={selectedUser}
            onClose={() => setViewTargetList(null)}
            onConfirmLeads={async (listId) => {
              try {
                const res = await ax("post", `/lead-lists/${listId}/convert-to-leads/`, {
                  assigned_to: selectedUser.id,
                });
                showAlert("Success", res.data.message || "Target contacts processed to Leads.", "success");
                setViewTargetList(null);
                setLoadingLeads(true);
                ax("get", `/leads/?assigned_to=${selectedUser.id}&page_size=100`)
                  .then(r => setUserLeads(r.data?.results || (Array.isArray(r.data) ? r.data : [])))
                  .finally(() => setLoadingLeads(false));
                if (selectedUser?.id) {
                  ax("get", `/tele-sales-report/${selectedUser.id}/`).then(r => setUserReport(r.data)).catch(() => {});
                }
                setActiveTab("leads");
              } catch (err) {
                showAlert("Error", err.response?.data?.error || "Failed to process target list contacts to leads.", "error");
              }
            }}
          />
        )}
      </div>
    </>
  );
}

  // ── Phase 1: User Grid ─────────────────────────────────────────────
  return (
    <>
      <div className="lm-sales-view">
      <div className="lm-sales-header">
        <div>
          <h3>Sales & Marketing Team</h3>
          <p>Click a team member to view their leads, manage target lists, and see performance reports</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', position: 'relative' }}>
          {/* Multi-Select Designation Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="lm-btn lm-btn--secondary lm-btn--sm"
              onClick={() => setShowDesigDropdown(!showDesigDropdown)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <Filter size={14} color="#4f46e5" />
              <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                {selectedDesignations.length === 0
                  ? "All Sales/Marketing Designations"
                  : `Designations (${selectedDesignations.length} selected)`}
              </span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {showDesigDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 6,
                  width: 320,
                  maxHeight: 380,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                  <strong style={{ fontSize: 13, color: '#1e293b' }}>Filter Designations / Roles</strong>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      style={{ fontSize: 11, color: '#4f46e5', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setSelectedDesignations([...availableDesignations])}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      style={{ fontSize: 11, color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}
                      onClick={() => setSelectedDesignations([])}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4, maxHeight: 220 }}>
                  {availableDesignations.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#94a3b8', padding: 8 }}>No designations found</div>
                  ) : (
                    availableDesignations.map(desig => {
                      const isChecked = selectedDesignations.includes(desig);
                      return (
                        <label
                          key={desig}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12.5,
                            color: '#334155',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: isChecked ? '#eef2ff' : 'transparent',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleDesignation(desig)}
                            style={{ accentColor: '#4f46e5', width: 15, height: 15, cursor: 'pointer' }}
                          />
                          <span style={{ fontWeight: isChecked ? 600 : 400 }}>{desig}</span>
                        </label>
                      );
                    })
                  )}
                </div>

                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    className="lm-btn lm-btn--ghost lm-btn--xs"
                    onClick={() => setShowDesigDropdown(false)}
                    style={{ fontSize: 12 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="lm-btn lm-btn--primary lm-btn--xs"
                    disabled={savingDesigConfig}
                    onClick={() => handleSaveDesignations()}
                    style={{ background: '#4f46e5', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}
                  >
                    {savingDesigConfig ? "Saving..." : "Save to DB"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={fetchSalesUsers}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {loadingUsers ? (
        <div className="lm-center-state"><Loader2 size={32} className="spin" /><p>Loading sales team…</p></div>
      ) : displayUsers.length === 0 ? (
        <div className="lm-center-state">
          <Users size={48} color="#cbd5e1" />
          <p>No team members match the selected filter.</p>
          <small style={{ color: "#94a3b8" }}>Select one or more designations in the filter dropdown above to display team cards.</small>
        </div>
      ) : (
        <div className="lm-sales-grid">
          {displayUsers.map((user) => {
            const convRate = user.stats.total_leads > 0
              ? ((user.stats.converted / user.stats.total_leads) * 100).toFixed(1)
              : "0.0";
            return (
              <button
                key={user.id}
                className="lm-sales-card"
                onClick={() => { setSelectedUser(user); setActiveTab("leads"); }}
              >
                {/* Card top accent */}
                <div className="lm-sales-card__accent" style={{ background: avatarGradient(user.id) }} />

                {/* Avatar + Identity */}
                <div className="lm-sales-card__identity" onClick={(e) => { e.stopPropagation(); onOpenProfile?.(user); }} style={{ cursor: 'pointer' }} title="Click to view Employee Profile">
                  <div className="lm-sales-avatar" style={{ background: avatarGradient(user.id) }}>
                    {getInitials(user.fullname)}
                  </div>
                  <div className="lm-sales-card__info">
                    <strong>{user.fullname}</strong>
                    <span>{user.designation || user.role}</span>
                    {(user.department || user.is_team_lead) && (
                      <div className="lm-sales-card__badges">
                        {user.department && (
                          <span className="lm-sales-dept-badge">{user.department}</span>
                        )}
                        {user.is_team_lead && (
                          <span className="lm-sales-lead-badge">⭐ Team Lead</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="lm-sales-card__stats">
                  <div className="lm-sales-card__stat">
                    <strong style={{ color: "#6366f1" }}>{user.stats.total_leads}</strong>
                    <small>Leads</small>
                  </div>
                  <div className="lm-sales-card__stat">
                    <strong style={{ color: "#16a34a" }}>{user.stats.converted}</strong>
                    <small>Converted</small>
                  </div>
                  <div className="lm-sales-card__stat">
                    <strong style={{ color: "#0891b2" }}>{user.stats.calls_made}</strong>
                    <small>Calls</small>
                  </div>
                  <div className="lm-sales-card__stat">
                    <strong style={{ color: "#7c3aed" }}>{user.stats.target_customers}</strong>
                    <small>Targets</small>
                  </div>
                </div>

                {/* Conversion bar */}
                <div className="lm-sales-card__conv">
                  <div className="lm-sales-card__conv-label">
                    <span>Conversion Rate</span>
                    <strong style={{ color: parseFloat(convRate) > 15 ? "#16a34a" : "#f59e0b" }}>{convRate}%</strong>
                  </div>
                  <div className="lm-sales-card__conv-track">
                    <div
                      className="lm-sales-card__conv-fill"
                      style={{
                        width: `${Math.min(parseFloat(convRate), 100)}%`,
                        background: parseFloat(convRate) > 15
                          ? "linear-gradient(90deg, #16a34a, #4ade80)"
                          : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                      }}
                    />
                  </div>
                </div>

                <div className="lm-sales-card__cta">
                  View Workspace <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
        </div>
      )}
      </div>
      {importResult && <ImportResultModal result={importResult} onClose={() => setImportResult(null)} />}
    </>
  );
}

// ─── Incentives View ──────────────────────────────────────────────────────────
// ─── Reports View ─────────────────────────────────────────────────────────────

function ReportsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingType, setExportingType] = useState("");
  const { showAlert } = useModal();

  useEffect(() => {
    api.reports()
      .then(r => setData(r.data))
      .catch(() => showAlert("Error", "Failed to load reports.", "error"))
      .finally(() => setLoading(false));
  }, [showAlert]);

  const handleExportType = async (type, filename) => {
    setExportingType(type);
    try {
      const res = await api.exportCsv({ type, format: "excel" });
      if (res.data?.type === "application/json" || res.headers?.["content-type"]?.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        showAlert("Export Error", json.error || json.detail || "Export failed.", "error");
        return;
      }
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      let msg = "Export failed.";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          msg = json.error || json.detail || msg;
        } catch { /* fallback */ }
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      }
      showAlert("Error", msg, "error");
    } finally {
      setExportingType("");
    }
  };

  if (loading) return <div className="lm-center-state"><Loader2 size={32} className="spin" /><p>Generating Analytics…</p></div>;
  if (!data) return <div className="lm-center-state"><p>No report data available.</p></div>;

  const pipeline = data.pipeline || [];
  const sources = data.lead_source || [];
  const employees = data.employee || [];
  const services = data.service || [];
  const telecallers = data.telecaller || [];
  const ageing = data.lead_ageing || {};

  const totalLeads = pipeline.reduce((acc, p) => acc + (p.count || 0), 0);
  const totalVal = pipeline.reduce((acc, p) => acc + parseFloat(p.value || 0), 0);
  const convertedObj = pipeline.find(p => p.current_stage === "CONVERTED");
  const convertedCount = convertedObj?.count || 0;
  const winRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : "0.0";

  const maxStageCount = Math.max(...pipeline.map(p => p.count), 1);
  const maxEmpCount = Math.max(...employees.map(e => e.total), 1);

  return (
    <div className="lm-reports">
      {/* Export Toolbar */}
      <div className="lm-reports__toolbar">
        <div className="lm-reports__title-group">
          <h3>Executive Pipeline Analytics & Reports</h3>
          <p>Real-time conversion, employee performance, and channel intelligence</p>
        </div>
        <div className="lm-reports__export-btn-group">
          <button
            className="lm-btn lm-btn--primary lm-btn--sm"
            disabled={exportingType === "leads"}
            onClick={() => handleExportType("leads", "leads-full-report")}
          >
            {exportingType === "leads" ? <Loader2 size={14} className="spin" /> : <Download size={14} />} Export Leads (.xlsx)
          </button>
          <button
            className="lm-btn lm-btn--ghost lm-btn--sm"
            disabled={exportingType === "employee"}
            onClick={() => handleExportType("employee", "employee-performance-report")}
          >
            {exportingType === "employee" ? <Loader2 size={14} className="spin" /> : <Users size={14} />} Export Employee Wise (.xlsx)
          </button>
          <button
            className="lm-btn lm-btn--ghost lm-btn--sm"
            disabled={exportingType === "targets"}
            onClick={() => handleExportType("targets", "target-customers-report")}
          >
            {exportingType === "targets" ? <Loader2 size={14} className="spin" /> : <Building2 size={14} />} Export Target Customers (.xlsx)
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="lm-reports__grid">
        <StatCard label="Total Pipeline Volume" value={`${totalLeads} Leads`} icon={BarChart2} color="#6366f1" />
        <StatCard label="Total Pipeline Value" value={fmt(totalVal)} icon={TrendingUp} color="#16a34a" />
        <StatCard label="Overall Conversion Rate" value={`${winRate}%`} icon={ShieldCheck} color="#0891b2" />
        <StatCard label="Converted Deals Value" value={fmt(convertedObj?.value || 0)} icon={CheckCircle2} color="#8b5cf6" />
      </div>

      {/* Employee Performance Breakdown */}
      {employees.length > 0 && (
        <div className="lm-reports__section">
          <div className="lm-reports__section-head">
            <div>
              <h4>Employee Performance Breakdown</h4>
              <p>Workload distribution, conversions, and pipeline value per team member</p>
            </div>
            <button
              className="lm-btn lm-btn--ghost lm-btn--xs"
              onClick={() => handleExportType("employee", "employee-performance")}
            >
              <Download size={13} /> Export Table
            </button>
          </div>
          <div className="lm-table-wrap">
            <table className="lm-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Assigned Leads</th>
                  <th>Share %</th>
                  <th>Converted</th>
                  <th>Rejected</th>
                  <th>Pipeline Value</th>
                  <th>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {employees.filter(emp => emp.assigned_to_id && emp.total > 0).map(emp => {
                  const empName = emp.assigned_to__fullname || emp.assigned_to__username || "Unassigned";
                  const share = totalLeads > 0 ? ((emp.total / totalLeads) * 100).toFixed(1) : "0";
                  const empRate = emp.total > 0 ? ((emp.converted / emp.total) * 100).toFixed(1) : "0";
                  return (
                    <tr key={emp.assigned_to_id || "unassigned"}>
                      <td>
                        <strong>{empName}</strong>
                        {emp.assigned_to__username && <small style={{ display: 'block', color: '#64748b' }}>@{emp.assigned_to__username}</small>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{emp.total}</strong>
                          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(emp.total / maxEmpCount) * 100}%`, height: '100%', background: '#6366f1' }} />
                          </div>
                        </div>
                      </td>
                      <td>{share}%</td>
                      <td><span style={{ color: '#16a34a', fontWeight: 'bold' }}>{emp.converted}</span></td>
                      <td><span style={{ color: '#ef4444' }}>{emp.rejected}</span></td>
                      <td><strong>{fmt(emp.pipeline_value)}</strong></td>
                      <td><span className="lm-badge" style={{ background: parseFloat(empRate) > 15 ? '#dcfce7' : '#f1f5f9', color: parseFloat(empRate) > 15 ? '#166534' : '#475569' }}>{empRate}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stage Distribution Bar Chart */}
      {pipeline.length > 0 && (
        <div className="lm-reports__section">
          <h4>Pipeline Stage Breakdown</h4>
          <div className="lm-bar-chart">
            {pipeline.map(p => {
              const meta = STAGE_META[p.current_stage] || { label: p.current_stage, color: "#6366f1" };
              return (
                <div key={p.current_stage} className="lm-bar-chart__row">
                  <span className="lm-bar-chart__label">{meta.label}</span>
                  <div className="lm-bar-chart__track">
                    <div
                      className="lm-bar-chart__fill"
                      style={{ width: `${(p.count / maxStageCount) * 100}%`, background: meta.color }}
                    />
                  </div>
                  <span className="lm-bar-chart__val">
                    <strong>{p.count}</strong> <small style={{ color: '#64748b', marginLeft: '6px' }}>({fmt(p.value)})</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Source Distribution & Services */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {sources.length > 0 && (
          <div className="lm-reports__section">
            <h4>Leads by Source</h4>
            <div className="lm-source-grid">
              {sources.map(s => (
                <div key={s.source} className="lm-source-item">
                  <div>
                    <span>{SOURCE_LABELS[s.source] || s.source}</span>
                    <small style={{ display: 'block', color: '#64748b' }}>{fmt(s.pipeline_value)}</small>
                  </div>
                  <strong>{s.count}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div className="lm-reports__section">
            <h4>Service & Offering Demand</h4>
            <div className="lm-source-grid">
              {services.map(srv => (
                <div key={srv.service} className="lm-source-item">
                  <div>
                    <span>{srv.service}</span>
                    {srv.converted > 0 && <small style={{ display: 'block', color: '#16a34a' }}>{srv.converted} Converted</small>}
                  </div>
                  <strong>{srv.count}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Telecalling & Lead Aging */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {telecallers.length > 0 && (
          <div className="lm-reports__section">
            <h4>Telecalling Activity</h4>
            <div className="lm-source-grid">
              {telecallers.map(tc => (
                <div key={tc.caller_id} className="lm-source-item">
                  <div>
                    <span>{tc.caller__fullname || tc.caller__username}</span>
                    <small style={{ display: 'block', color: '#64748b' }}>{tc.connected_calls} connected calls</small>
                  </div>
                  <strong>{tc.total_calls} calls</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {ageing && (
          <div className="lm-reports__section">
            <h4>Lead Pipeline Ageing</h4>
            <div className="lm-source-grid">
              <div className="lm-source-item"><span>0 - 7 Days</span><strong>{ageing.days_0_7 || 0}</strong></div>
              <div className="lm-source-item"><span>8 - 30 Days</span><strong>{ageing.days_8_30 || 0}</strong></div>
              <div className="lm-source-item"><span>31 - 60 Days</span><strong>{ageing.days_31_60 || 0}</strong></div>
              <div className="lm-source-item"><span>61 - 90 Days</span><strong>{ageing.days_61_90 || 0}</strong></div>
              <div className="lm-source-item"><span>90+ Days</span><strong>{ageing.days_91_plus || 0}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Import Result Modal ─────────────────────────────────────────────────────

function ImportResultModal({ result, onClose, onSave, onCancel, isSaving }) {
  const [activeTab, setActiveTab] = useState(null);

  const created     = result.created_count   ?? 0;
  const errors      = result.error_count     ?? 0;
  const allDups     = result.duplicates      ?? [];
  const errorsList  = result.errors          ?? [];
  const updated     = result.do_not_call_preserved ?? 0;
  const dupExisting = allDups.filter(d => d.reason === "existing").length;
  const dupWithin   = allDups.filter(d => d.reason === "within_file").length;
  const listName    = result.listName || "";

  const canSave = created > 0 || updated > 0;

  useEffect(() => {
    if (!result) return;
    if (errors > 0) setActiveTab("error");
    else if (dupExisting > 0) setActiveTab("nochange");
    else if (dupWithin > 0) setActiveTab("skip");
    else if (updated > 0) setActiveTab("updated");
    else if (created > 0) setActiveTab("new");
  }, [result, errors, dupExisting, dupWithin, updated, created]);

  if (!result) return null;

  const total = created + dupExisting + dupWithin + errors + updated;

  const stats = [
    { key: "new",       label: "New",           count: created,    color: "#16a34a", bg: "#dcfce7", icon: "✅",
      desc: "Newly created records" },
    { key: "nochange",  label: "No Change",      count: dupExisting, color: "#2563eb", bg: "#dbeafe", icon: "🔵",
      desc: "Already exist in database" },
    { key: "skip",      label: "Skipped",        count: dupWithin,  color: "#d97706", bg: "#fef3c7", icon: "⏭️",
      desc: "Duplicate within uploaded file" },
    { key: "updated",   label: "Updated",        count: updated,    color: "#7c3aed", bg: "#ede9fe", icon: "🔄",
      desc: "Existing records updated (DNC flag)" },
    { key: "error",     label: "Errors",         count: errors,     color: "#dc2626", bg: "#fee2e2", icon: "❌",
      desc: "Validation failures" },
  ];

  const renderDetails = () => {
    if (!activeTab) return null;

    if (activeTab === "new") {
      const list = result.created_records || [];
      return (
        <div className="lm-import-detail-block">
          <div className="lm-import-detail-toggle lm-import-detail-toggle--active">
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a" }}>✅ Newly Created Records ({list.length})</span>
          </div>
          {list.length === 0 ? (
            <div className="lm-import-detail-empty" style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No new records were created.
            </div>
          ) : (
            <div className="lm-import-detail-list">
              {list.slice(0, 50).map((item, i) => (
                <div key={i} className="lm-import-detail-item lm-import-detail-item--new" style={{ borderLeft: "3px solid #16a34a" }}>
                  <span className="lm-import-detail-row">Row {item.row}</span>
                  <span className="lm-import-detail-name">{item.customer_name || "Unnamed"}</span>
                  <span className="lm-import-detail-msg" style={{ color: "#475569" }}>
                    {item.phone && `Phone: ${item.phone}`}
                    {item.phone && item.email && " · "}
                    {item.email && `Email: ${item.email}`}
                  </span>
                </div>
              ))}
              {list.length > 50 && <p className="lm-import-detail-more">… and {list.length - 50} more records</p>}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "nochange") {
      const list = allDups.filter(d => d.reason === "existing");
      return (
        <div className="lm-import-detail-block">
          <div className="lm-import-detail-toggle lm-import-detail-toggle--active">
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#2563eb" }}>🔵 Existing Records (Already in database) ({list.length})</span>
          </div>
          {list.length === 0 ? (
            <div className="lm-import-detail-empty" style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No database duplicates were found.
            </div>
          ) : (
            <div className="lm-import-detail-list">
              {list.slice(0, 50).map((dup, i) => {
                const firstMatch = dup.matches?.[0];
                const leadNum = firstMatch?.lead_number;
                const matchName = firstMatch?.customer_name;
                let detailText = "";
                if (leadNum) detailText = `Lead #${leadNum}${matchName ? ` · ${matchName}` : ""}`;
                else if (matchName) detailText = matchName;

                return (
                  <div key={i} className="lm-import-detail-item lm-import-detail-item--dup" style={{ borderLeft: "3px solid #2563eb" }}>
                    <span className="lm-import-detail-row">Row {dup.row}</span>
                    <span className="lm-import-detail-field" style={{ color: "#2563eb", background: "#dbeafe" }}>Already in database</span>
                    {dup.name && <span className="lm-import-detail-name">{dup.name}</span>}
                    {detailText && <span className="lm-import-detail-msg" style={{ color: "#475569" }}>{detailText}</span>}
                  </div>
                );
              })}
              {list.length > 50 && <p className="lm-import-detail-more">… and {list.length - 50} more duplicates</p>}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "skip") {
      const list = allDups.filter(d => d.reason === "within_file");
      return (
        <div className="lm-import-detail-block">
          <div className="lm-import-detail-toggle lm-import-detail-toggle--active">
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#d97706" }}>⏭️ Skipped Records (Duplicate within file) ({list.length})</span>
          </div>
          {list.length === 0 ? (
            <div className="lm-import-detail-empty" style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No internal duplicates were found in the uploaded file.
            </div>
          ) : (
            <div className="lm-import-detail-list">
              {list.slice(0, 50).map((dup, i) => {
                const firstMatch = dup.matches?.[0];
                const detailText = firstMatch?.row ? `Duplicate of Row ${firstMatch.row}` : "";

                return (
                  <div key={i} className="lm-import-detail-item lm-import-detail-item--skip" style={{ borderLeft: "3px solid #d97706" }}>
                    <span className="lm-import-detail-row">Row {dup.row}</span>
                    <span className="lm-import-detail-field" style={{ color: "#d97706", background: "#fef3c7" }}>Duplicate within file</span>
                    {dup.name && <span className="lm-import-detail-name">{dup.name}</span>}
                    {detailText && <span className="lm-import-detail-msg" style={{ color: "#475569" }}>{detailText}</span>}
                  </div>
                );
              })}
              {list.length > 50 && <p className="lm-import-detail-more">… and {list.length - 50} more duplicates</p>}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "updated") {
      const list = result.updated_records || [];
      return (
        <div className="lm-import-detail-block">
          <div className="lm-import-detail-toggle lm-import-detail-toggle--active">
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#7c3aed" }}>🔄 Updated Records (DNC flag preserved) ({list.length})</span>
          </div>
          {list.length === 0 ? (
            <div className="lm-import-detail-empty" style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No records DNC flags were updated.
            </div>
          ) : (
            <div className="lm-import-detail-list">
              {list.slice(0, 50).map((item, i) => (
                <div key={i} className="lm-import-detail-item lm-import-detail-item--updated" style={{ borderLeft: "3px solid #7c3aed" }}>
                  <span className="lm-import-detail-row">Row {item.row}</span>
                  <span className="lm-import-detail-name">{item.customer_name || "Unnamed"}</span>
                  <span className="lm-import-detail-msg" style={{ color: "#475569" }}>
                    DNC Flag Preserved
                    {(item.phone || item.email) && " · "}
                    {item.phone && `Phone: ${item.phone}`}
                    {item.phone && item.email && " · "}
                    {item.email && `Email: ${item.email}`}
                  </span>
                </div>
              ))}
              {list.length > 50 && <p className="lm-import-detail-more">… and {list.length - 50} more records</p>}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "error") {
      return (
        <div className="lm-import-detail-block">
          <div className="lm-import-detail-toggle lm-import-detail-toggle--active">
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>❌ Validation Failure Errors ({errorsList.length})</span>
          </div>
          {errorsList.length === 0 ? (
            <div className="lm-import-detail-empty" style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No validation errors occurred.
            </div>
          ) : (
            <div className="lm-import-detail-list">
              {errorsList.slice(0, 50).map((err, i) => (
                <div key={i} className="lm-import-detail-item lm-import-detail-item--error">
                  <span className="lm-import-detail-row">Row {err.row}</span>
                  {err.field && <span className="lm-import-detail-field">{err.field}</span>}
                  <span className="lm-import-detail-msg" style={{ color: "#dc2626" }}>{err.message}</span>
                </div>
              ))}
              {errorsList.length > 50 && <p className="lm-import-detail-more">… and {errorsList.length - 50} more errors</p>}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="lm-overlay" onClick={onCancel}>
      <div className="lm-import-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="lm-import-modal__head">
          <div className="lm-import-modal__title">
            <span className="lm-import-modal__check">✓</span>
            <div>
              <h2>Import Validation Summary</h2>
              {listName && <p className="lm-import-modal__list-name">List: <strong>{listName}</strong></p>}
            </div>
          </div>
          <button className="lm-icon-btn" onClick={onCancel}><X size={18} /></button>
        </div>

        {/* Total banner */}
        <div className="lm-import-modal__banner">
          <span>{total} total rows processed</span>
        </div>

        {/* Stat grid */}
        <div className="lm-import-stat-grid">
          {stats.map(s => {
            const isActive = activeTab === s.key;
            return (
              <div
                key={s.key}
                className={`lm-import-stat-card ${isActive ? "lm-import-stat-card--active" : ""}`}
                style={{ 
                  borderLeft: `4px solid ${s.color}`,
                  borderTop: isActive ? `1.5px solid ${s.color}` : "1.5px solid transparent",
                  borderRight: isActive ? `1.5px solid ${s.color}` : "1.5px solid transparent",
                  borderBottom: isActive ? `1.5px solid ${s.color}` : "1.5px solid transparent",
                  background: s.bg,
                  cursor: s.count > 0 ? "pointer" : "default",
                  opacity: s.count === 0 ? 0.5 : 1,
                  transform: isActive ? "translateY(-2px)" : "none",
                  boxShadow: isActive ? `0 6px 16px ${s.color}25` : "none",
                  transition: "all 0.2s ease",
                }}
                onClick={() => {
                  if (s.count > 0) {
                    setActiveTab(activeTab === s.key ? null : s.key);
                  }
                }}
              >
                <div className="lm-import-stat-card__icon">{s.icon}</div>
                <div className="lm-import-stat-card__body">
                  <span className="lm-import-stat-card__count" style={{ color: s.color }}>{s.count}</span>
                  <span className="lm-import-stat-card__label">{s.label}</span>
                  <span className="lm-import-stat-card__desc">{s.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Render selected details */}
        {renderDetails()}

        {/* Footer */}
        <div className="lm-import-modal__footer" style={{ gap: "12px" }}>
          <button className="lm-btn lm-btn--ghost" onClick={onCancel} disabled={isSaving}>Cancel</button>
          <button className="lm-btn lm-btn--primary" onClick={onSave} disabled={!canSave || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Employee Profile Modal ───────────────────────────────────────────────────
function EmployeeProfileModal({ user, onClose, onViewLead }) {
  const [activeTab, setActiveTab] = useState("info"); // info | leads | performance
  const [fullUser, setFullUser] = useState(user);
  const [extraData, setExtraData] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const [userLeads, setUserLeads] = useState([]);

  useEffect(() => {
    if (!user) return;
    setLoadingExtra(true);

    const loadDetailsForUser = (targetUser) => {
      setFullUser(targetUser);
      const userId = targetUser.id;
      if (!userId) {
        setLoadingExtra(false);
        return;
      }
      Promise.all([
        ax("get", `/tele-sales-report/${userId}/`).catch(() => null),
        ax("get", `/leads/?assigned_to=${userId}&page_size=100`).catch(() => null)
      ]).then(([repRes, leadsRes]) => {
        if (repRes?.data) setExtraData(repRes.data);
        if (leadsRes?.data) {
          setUserLeads(leadsRes.data?.results || (Array.isArray(leadsRes.data) ? leadsRes.data : []));
        }
      }).finally(() => setLoadingExtra(false));
    };

    if (user.id && (user.email || user.phone)) {
      loadDetailsForUser(user);
    } else {
      ax("get", "/tele-sales-users/").then(r => {
        const list = r.data?.users || (Array.isArray(r.data) ? r.data : []);
        const targetName = (user.fullname || user.name || user.salesman || "").toLowerCase();
        const matched = list.find(u =>
          (u.fullname || "").toLowerCase() === targetName ||
          (u.username || "").toLowerCase() === targetName ||
          u.id === user.id
        );
        if (matched) {
          loadDetailsForUser(matched);
        } else {
          setFullUser(user);
          setLoadingExtra(false);
        }
      }).catch(() => {
        setFullUser(user);
        setLoadingExtra(false);
      });
    }
  }, [user]);

  if (!user) return null;

  const u = fullUser || user;
  const displayName = u.fullname || u.name || u.username || u.salesman || "Employee";

  const getInitials = (name) => {
    const parts = (name || "?").trim().split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : parts[0].slice(0, 2).toUpperCase();
  };

  const fmtCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  };

function LeadStageBarChart({ stageCounts, totalLeads }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const data = stageCounts.map((s) => ({
    name: s.label,
    count: s.count,
    color: s.color,
    pct: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0
  }));

  return (
    <div className="lm-real-barchart" style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name, item) => [`${value} lead(s) (${item.payload.pct}%)`, item.payload.name]}
            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px' }}
            itemStyle={{ color: '#ffffff' }}
          />
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{
                  opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.6 : 1,
                  transition: 'opacity 0.2s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ServicePieChart({ entries, total }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!entries || entries.length === 0) {
    return <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No service data available</p>;
  }

  const data = entries.map(e => ({ name: e.name, value: e.count, color: e.color, percent: e.percent }));

  return (
    <div className="lm-real-piechart">
      <div className="lm-pie-graphic">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={65}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={(_, index) => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                  style={{
                    outline: 'none',
                    cursor: 'pointer',
                    opacity: hoveredIdx !== null && hoveredIdx !== index ? 0.55 : 1,
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, item) => [`${value} lead(s) (${item.payload.percent}%)`, name]}
              contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px' }}
              itemStyle={{ color: '#ffffff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="lm-pie-center-badge">
          <strong>{hoveredIdx !== null ? data[hoveredIdx].value : total}</strong>
          <small>{hoveredIdx !== null ? `${data[hoveredIdx].percent}%` : "Total"}</small>
        </div>
      </div>

      {/* Right Side Full Width Service Progress Breakdown */}
      <div className="lm-service-progress-list">
        {entries.map((item, idx) => (
          <div
            key={item.name}
            className={`lm-service-progress-item ${hoveredIdx === idx ? "active" : ""}`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="lm-service-progress-header">
              <div className="lm-service-title-wrap">
                <span className="lm-legend-dot" style={{ backgroundColor: item.color }} />
                <strong className="lm-service-name">{item.name}</strong>
              </div>
              <span className="lm-service-count">{item.count} leads ({item.percent}%)</span>
            </div>
            <div className="lm-service-bar-track">
              <div
                className="lm-service-bar-fill"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

  const totalLeads = u.stats?.total_leads ?? userLeads.length;
  const converted = u.stats?.converted ?? userLeads.filter(l => l.current_stage === "CONVERTED" || l.current_stage === "CLOSED_WON").length;
  const convRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : "0.0";
  const callsMade = u.stats?.calls_made ?? extraData?.telecaller?.reduce((a, t) => a + (t.total_calls || 0), 0) ?? 0;
  const targetCount = u.stats?.target_customers ?? extraData?.target_summary?.total_customers ?? 0;

  const empIncentive = useMemo(() => {
    let totalValue = 0;
    let totalIncentive = 0;
    const defaultRate = 10;
    const items = userLeads.map(lead => {
      const val = Number(lead.estimated_value) || 0;
      const rate = defaultRate;
      const incentive = (val * rate) / 100;
      const isWon = lead.current_stage === "CONVERTED" || lead.current_stage === "CLOSED_WON";
      totalValue += val;
      totalIncentive += incentive;
      return { ...lead, val, rate, incentive, isWon };
    });
    return { totalValue, totalIncentive, items };
  }, [userLeads]);

  const stageCounts = useMemo(() => {
    const map = {
      NEW_LEAD: { label: "New Lead", count: 0, color: "#6366f1" },
      CONTACTED: { label: "Contacted", count: 0, color: "#0ea5e9" },
      QUALIFIED: { label: "Qualified", count: 0, color: "#10b981" },
      PROPOSAL_SENT: { label: "Proposal", count: 0, color: "#f59e0b" },
      CONVERTED: { label: "Converted", count: 0, color: "#8b5cf6" },
      FOLLOW_UP_REQUIRED: { label: "Follow Up", count: 0, color: "#ec4899" },
      REQUIREMENT_MEETING_SCHEDULED: { label: "Meeting", count: 0, color: "#f97316" },
      CANCELLED: { label: "Cancelled", count: 0, color: "#f43f5e" },
      REJECTED: { label: "Rejected", count: 0, color: "#ef4444" },
    };
    userLeads.forEach(l => {
      const st = l.current_stage || "NEW_LEAD";
      if (map[st]) {
        map[st].count += 1;
      } else if (st === "CLOSED_LOST") {
        map.REJECTED.count += 1;
      } else {
        const key = st;
        if (!map[key]) {
          const formatted = st.replace(/_/g, " ");
          const shortLabel = formatted.length > 10 ? formatted.slice(0, 10) + "…" : formatted;
          map[key] = { label: shortLabel, count: 0, color: "#64748b" };
        }
        map[key].count += 1;
      }
    });
    return Object.values(map);
  }, [userLeads]);

  const serviceCounts = useMemo(() => {
    const counts = {};
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#06b6d4", "#ec4899", "#8b5cf6"];
    userLeads.forEach(l => {
      const s = l.service || l.product || "General";
      counts[s] = (counts[s] || 0) + 1;
    });
    const total = userLeads.length || 1;
    const entries = Object.entries(counts).map(([name, count], idx) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
      color: colors[idx % colors.length]
    }));
    return { entries, total: userLeads.length };
  }, [userLeads]);

  const ratingData = useMemo(() => {
    let score = 3.5;
    if (converted > 0) score += 1.0;
    else if (totalLeads > 0) score += 0.5;
    if (callsMade >= 4) score += 0.4;
    score = Math.min(5.0, Math.max(1.0, score));

    let statusLabel = "Good";
    let badgeBg = "#e0f2fe";
    let badgeColor = "#0369a1";

    if (score >= 4.5) {
      statusLabel = "Excellent";
      badgeBg = "#dcfce7";
      badgeColor = "#15803d";
    } else if (score >= 3.8) {
      statusLabel = "Good";
      badgeBg = "#e0f2fe";
      badgeColor = "#0369a1";
    } else if (score >= 2.5) {
      statusLabel = "Average";
      badgeBg = "#fef3c7";
      badgeColor = "#b45309";
    } else {
      statusLabel = "Needs Improvement";
      badgeBg = "#fee2e2";
      badgeColor = "#b91c1c";
    }

    return { score, statusLabel, badgeBg, badgeColor };
  }, [converted, totalLeads, callsMade]);

  return (
    <div className="lm-modal-backdrop" onClick={onClose}>
      <div className="lm-emp-modal" onClick={e => e.stopPropagation()}>
        {/* Header Hero Banner */}
        <div className="lm-emp-hero">
          <button className="lm-emp-close" onClick={onClose} title="Close Profile"><X size={18} /></button>
          <div className="lm-emp-hero__avatar">
            {getInitials(displayName)}
          </div>
          <div className="lm-emp-hero__info">
            <h2>{displayName}</h2>
            <p className="lm-emp-hero__desig">{u.designation || u.role || "Sales Representative"}</p>
            <div className="lm-emp-hero__tags">
              {u.department && <span className="lm-emp-tag">{u.department}</span>}
              {u.employee_code && <span className="lm-emp-tag lm-emp-tag--code">ID: {u.employee_code}</span>}
              <span className="lm-emp-tag lm-emp-tag--active">● Active Member</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="lm-emp-tabs">
          <button className={activeTab === "info" ? "active" : ""} onClick={() => setActiveTab("info")}>
            <User size={15} /> Employee Details
          </button>
          <button className={activeTab === "leads" ? "active" : ""} onClick={() => setActiveTab("leads")}>
            <Kanban size={15} /> Assigned Leads ({userLeads.length})
          </button>
          <button className={activeTab === "performance" ? "active" : ""} onClick={() => setActiveTab("performance")}>
            <TrendingUp size={15} /> Performance Summary
          </button>
          <button className={activeTab === "incentive" ? "active" : ""} onClick={() => setActiveTab("incentive")}>
            <BadgePercent size={15} /> Incentive
          </button>
        </div>

        {/* Body Content */}
        <div className="lm-emp-body">
          {activeTab === "info" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="lm-emp-info-grid">
                {/* Left Card: Merged Contact & Organization Details */}
                <div className="lm-emp-section">
                  <h4>Contact & Organization Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 4 }}>
                    <div className="lm-emp-detail-row">
                      <Mail size={16} color="#6366f1" />
                      <div>
                        <small>Email Address</small>
                        <strong>{u.email ? <a href={`mailto:${u.email}`} style={{ color: '#4f46e5', textDecoration: 'none' }}>{u.email}</a> : "N/A"}</strong>
                      </div>
                    </div>
                    <div className="lm-emp-detail-row">
                      <Phone size={16} color="#16a34a" />
                      <div>
                        <small>Phone / Mobile</small>
                        <strong>{u.phone || u.contact ? <a href={`tel:${u.phone || u.contact}`} style={{ color: '#16a34a', textDecoration: 'none' }}>{u.phone || u.contact}</a> : "N/A"}</strong>
                      </div>
                    </div>
                    <div className="lm-emp-detail-row">
                      <ShieldCheck size={16} color="#7c3aed" />
                      <div>
                        <small>Designation / Role</small>
                        <strong>{u.designation || u.role || "Sales Representative"}</strong>
                      </div>
                    </div>
                    <div className="lm-emp-detail-row">
                      <Building2 size={16} color="#0891b2" />
                      <div>
                        <small>Department</small>
                        <strong>{u.department || "Sales & Marketing"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Performance Rating & Analysis */}
                <div className="lm-emp-section lm-emp-rating-section">
                  <div className="lm-rating-header">
                    <div>
                      <h4>Performance Analysis</h4>
                      <div className="lm-rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={18}
                            fill={star <= Math.floor(ratingData.score) ? "#f59e0b" : star - 0.5 <= ratingData.score ? "#fbbf24" : "none"}
                            color={star <= ratingData.score ? "#f59e0b" : "#cbd5e1"}
                          />
                        ))}
                        <strong className="lm-rating-num">{ratingData.score.toFixed(1)} / 5.0</strong>
                      </div>
                    </div>
                    <span className="lm-rating-badge" style={{ backgroundColor: ratingData.badgeBg, color: ratingData.badgeColor }}>
                      ● {ratingData.statusLabel}
                    </span>
                  </div>

                  <div className="lm-rating-details">
                    <div className="lm-rating-row">
                      <Zap size={15} color="#eab308" />
                      <div>
                        <small>Activity Status</small>
                        <strong>{callsMade >= 4 ? "High Activity" : callsMade > 0 ? "Moderate" : "Low Activity"}</strong>
                      </div>
                    </div>
                    <div className="lm-rating-row">
                      <TrendingUp size={15} color="#16a34a" />
                      <div>
                        <small>Conversion Rating</small>
                        <strong>{convRate}% Rate</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric Stat Cards Grid */}
              <div className="lm-pop-stat-grid">
                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                    <BarChart2 size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{totalLeads}</strong>
                    <span>Total Leads</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <TrendingUp size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{converted}</strong>
                    <span>Converted</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Award size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{convRate}%</strong>
                    <span>Conversion Rate</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <PhoneCall size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{callsMade}</strong>
                    <span>Calls Made</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                    <Building2 size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{targetCount}</strong>
                    <span>Target Contacts</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
                    <Clock size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{userLeads.filter(l => l.current_stage !== "CONVERTED" && l.current_stage !== "CLOSED_WON").length}</strong>
                    <span>Active Pipeline</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leads" && (
            <div className="lm-emp-leads-list">
              {loadingExtra ? (
                <div className="lm-center-state"><Loader2 size={24} className="spin" /><p>Loading leads...</p></div>
              ) : userLeads.length === 0 ? (
                <div className="lm-center-state"><p>No assigned leads found for this employee.</p></div>
              ) : (
                <div className="lm-emp-table-wrap">
                  <table className="lm-table">
                    <thead>
                      <tr>
                        <th>Lead Name</th>
                        <th>Service</th>
                        <th>Stage</th>
                        <th>Estimated Value</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userLeads.map(lead => (
                        <tr key={lead.id}>
                          <td>
                            <div className="lm-lead-cell">
                              <strong>{lead.customer_name || lead.company_name || "—"}</strong>
                              <small className="lm-lead-no">{lead.lead_number}</small>
                            </div>
                          </td>
                          <td>{lead.service || lead.product || "—"}</td>
                          <td><StagePill stage={lead.current_stage} /></td>
                          <td><strong>{fmtCurrency(lead.estimated_value)}</strong></td>
                          <td>
                            <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => { onClose(); onViewLead(lead); }}>
                              <Eye size={14} /> View Lead
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "performance" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Top 6 Stat Cards Grid */}
              <div className="lm-pop-stat-grid">
                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                    <BarChart2 size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{totalLeads}</strong>
                    <span>Total Leads</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <TrendingUp size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{converted}</strong>
                    <span>Converted Deals</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Award size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{convRate}%</strong>
                    <span>Conversion Rate</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <PhoneCall size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{callsMade}</strong>
                    <span>Calls Logged</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                    <Building2 size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{targetCount}</strong>
                    <span>Target Contacts</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                    <BadgePercent size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{fmtCurrency(empIncentive.totalValue)}</strong>
                    <span>Pipeline Value</span>
                  </div>
                </div>
              </div>

              {/* Performance Charts Row */}
              <div className="lm-perf-charts-grid">
                {/* Real Vertical Bar Chart */}
                <div className="lm-chart-card">
                  <div className="lm-chart-header">
                    <div>
                      <h3>Lead Stage Breakdown</h3>
                      <p>Distribution across pipeline stages</p>
                    </div>
                    <BarChart2 size={18} color="#6366f1" />
                  </div>
                  <LeadStageBarChart stageCounts={stageCounts} totalLeads={totalLeads} />
                </div>

                {/* Real SVG Pie/Donut Chart */}
                <div className="lm-chart-card">
                  <div className="lm-chart-header">
                    <div>
                      <h3>Services Split</h3>
                      <p>Leads grouped by requested service</p>
                    </div>
                    <Sparkles size={18} color="#8b5cf6" />
                  </div>
                  <ServicePieChart entries={serviceCounts.entries} total={serviceCounts.total} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "incentive" && (
            <div className="lm-emp-incentive-tab">
              <div className="lm-pop-stat-grid" style={{ marginBottom: 20 }}>
                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                    <BadgePercent size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{fmtCurrency(empIncentive.totalIncentive)}</strong>
                    <span>Total Earned Incentive</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <TrendingUp size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>{fmtCurrency(empIncentive.totalValue)}</strong>
                    <span>Total Pipeline Value</span>
                  </div>
                </div>

                <div className="lm-pop-stat-card">
                  <div className="lm-pop-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Award size={22} />
                  </div>
                  <div className="lm-pop-stat-content">
                    <strong>10%</strong>
                    <span>Default Rate</span>
                  </div>
                </div>
              </div>

              {empIncentive.items.length === 0 ? (
                <div className="lm-center-state"><p>No incentive records found for this employee.</p></div>
              ) : (
                <div className="lm-emp-table-wrap">
                  <table className="lm-table">
                    <thead>
                      <tr>
                        <th>Lead / Customer</th>
                        <th>Stage</th>
                        <th>Deal Value</th>
                        <th>Rate (%)</th>
                        <th>Earned Incentive</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empIncentive.items.map(d => (
                        <tr key={d.id} className={d.isWon ? "lm-row--won" : ""}>
                          <td>
                            <div className="lm-lead-cell">
                              <strong>{d.customer_name || d.company_name || "—"}</strong>
                              <small className="lm-lead-no">{d.lead_number}</small>
                            </div>
                          </td>
                          <td><StagePill stage={d.current_stage} /></td>
                          <td><strong>{fmtCurrency(d.val)}</strong></td>
                          <td>{d.rate}%</td>
                          <td><strong style={{ color: '#4f46e5' }}>{fmtCurrency(d.incentive)}</strong></td>
                          <td>
                            <span className={`lm-status-select lm-status-select--${d.isWon ? "approved" : "pending"}`}>
                              {d.isWon ? "Approved" : "Pending"}
                            </span>
                          </td>
                          <td>
                            <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => { onClose(); onViewLead(d); }}>
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="lm-emp-footer">
          <button className="lm-emp-btn-close" onClick={onClose}>Close Profile</button>
        </div>
      </div>
    </div>
  );
}

// ─── Incentive & Payouts View ────────────────────────────────────────────────
function IncentiveView({ leads, onViewLead, onOpenProfile }) {
  const { user, hasPermission } = useAuth();
  const { showAlert } = useModal();
  const isAdmin = hasPermission(["lead.manage_settings"]);

  const fmtCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num);
  };
  const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

  // ── State ─────────────────────────────────────────────────────────────────
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [activeTab, setActiveTab] = useState("leaderboard"); // leaderboard | records | ytd | config
  const [loading, setLoading] = useState(false);
  const [ytdLoading, setYtdLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null); // { month_label, users, totals }
  const [ytdData, setYtdData] = useState(null);         // { year, months[] }
  const [configData, setConfigData] = useState([]);     // per-user configs
  const [configEdits, setConfigEdits] = useState({});   // {uid: {rate, target}}
  const [savingConfig, setSavingConfig] = useState(false);
  const [updatingPayoutId, setUpdatingPayoutId] = useState(null);
  const [search, setSearch] = useState("");
  const [repFilter, setRepFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ── Data Fetching ─────────────────────────────────────────────────────────
  const fetchSummary = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await ax("get", "/incentive-summary/", null, { params: { month, mode: "month" } });
      setSummaryData(res.data);
    } catch (e) {
      if (!silent) showAlert("Error", "Could not load incentive data.", "error");
    } finally {
      setLoading(false);
    }
  }, [month, showAlert]);

  const fetchYTD = useCallback(async () => {
    setYtdLoading(true);
    try {
      const year = month.split("-")[0];
      const res = await ax("get", "/incentive-summary/", null, { params: { year, mode: "ytd" } });
      setYtdData(res.data);
    } catch {
      showAlert("Error", "Could not load YTD data.", "error");
    } finally {
      setYtdLoading(false);
    }
  }, [month, showAlert]);

  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await ax("get", "/incentive-config/");
      setConfigData(res.data || []);
    } catch {
      showAlert("Error", "Could not load incentive configuration.", "error");
    } finally {
      setConfigLoading(false);
    }
  }, [showAlert]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { if (activeTab === "ytd") fetchYTD(); }, [activeTab, fetchYTD]);
  useEffect(() => { if (activeTab === "config") fetchConfig(); }, [activeTab, fetchConfig]);

  // ── Payout approval ───────────────────────────────────────────────────────
  const handlePayoutStatusChange = async (userEntry, newStatus) => {
    const uid = userEntry.user_id;
    setUpdatingPayoutId(uid);
    try {
      // Upsert payout record first (sync live conversion data)
      const upsertRes = await ax("post", "/incentive-payouts/", {
        user_id: uid,
        month,
        gross_revenue: userEntry.gross_revenue,
        discount_total: userEntry.discount_total,
        net_revenue: userEntry.net_revenue,
        deal_count: userEntry.deal_count,
        incentive_rate: userEntry.incentive_rate,
        incentive_amount: userEntry.incentive_amount,
        target_amount: userEntry.target_amount,
      });
      const payoutId = upsertRes.data.id;
      // Now update the status
      await ax("patch", `/incentive-payouts/${payoutId}/`, { payout_status: newStatus });
      await fetchSummary(true);
    } catch (e) {
      showAlert("Error", e.response?.data?.error || "Could not update payout status.", "error");
    } finally {
      setUpdatingPayoutId(null);
    }
  };

  // ── Config save ───────────────────────────────────────────────────────────
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const updates = Object.entries(configEdits).map(([uid, vals]) => ({
        user_id: parseInt(uid),
        incentive_rate: vals.rate,
        monthly_target: vals.target,
      }));
      if (!updates.length) { showAlert("Info", "No changes to save.", "info"); return; }
      await ax("post", "/incentive-config/", updates);
      setConfigEdits({});
      await fetchConfig();
      await fetchSummary(true);
      showAlert("Saved", "Incentive configuration updated.", "success");
    } catch {
      showAlert("Error", "Could not save configuration.", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const setEdit = (uid, field, val) =>
    setConfigEdits(prev => ({
      ...prev,
      [uid]: { ...(prev[uid] || {}), [field]: val },
    }));

  // ── Filtered records ──────────────────────────────────────────────────────
  const allRecords = useMemo(() => {
    if (!summaryData?.users) return [];
    return summaryData.users.flatMap(u =>
      (u.records || []).map(r => ({ ...r, salesman: u.fullname, payout_status: u.payout_status }))
    );
  }, [summaryData]);

  const filteredRecords = useMemo(() => {
    let rows = allRecords;
    if (repFilter !== "ALL") rows = rows.filter(r => r.salesman === repFilter);
    if (statusFilter !== "ALL") rows = rows.filter(r => r.payout_status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        (r.customer_name || "").toLowerCase().includes(q) ||
        (r.salesman || "").toLowerCase().includes(q) ||
        (r.lead_number || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [allRecords, repFilter, statusFilter, search]);

  const repNames = useMemo(() => summaryData?.users?.map(u => u.fullname) || [], [summaryData]);
  const totals = summaryData?.totals || {};

  // ── CSV export ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const hdrs = ["Lead #", "Customer", "Sales Rep", "Conversion Date", "Gross (INR)", "Discount (INR)", "Net (INR)", "Payout Status"];
    const rows = filteredRecords.map(r => [
      `"${r.lead_number || ""}"`, `"${r.customer_name || ""}"`, `"${r.salesman}"`,
      `"${r.converted_at ? new Date(r.converted_at).toLocaleDateString() : ""}"`,
      r.final_value, r.discount, r.net_value, `"${r.payout_status}"`
    ]);
    const csv = "data:text/csv;charset=utf-8," + [hdrs.join(","), ...rows.map(r => r.join(","))].join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = `incentive_records_${month}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const PayoutBadge = ({ status }) => {
    const map = { PENDING: ["#f97316", "Pending"], APPROVED: ["#6366f1", "Approved"], PAID: ["#16a34a", "Paid"] };
    const [color, label] = map[status] || ["#64748b", status];
    return (
      <span className="lm-payout-badge" style={{ "--badge-color": color }}>
        {status === "PAID" && <CheckCircle2 size={11} />}
        {status === "APPROVED" && <BadgePercent size={11} />}
        {status === "PENDING" && <Clock size={11} />}
        {label}
      </span>
    );
  };

  // ── Target progress bar ────────────────────────────────────────────────────
  const TargetBar = ({ progress }) => {
    if (progress === null || progress === undefined) return null;
    const pct = Math.min(progress, 100);
    const color = pct >= 100 ? "#16a34a" : pct >= 75 ? "#6366f1" : pct >= 50 ? "#f97316" : "#ef4444";
    return (
      <div className="lm-target-bar">
        <div className="lm-target-bar__track">
          <div className="lm-target-bar__fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="lm-target-bar__label" style={{ color }}>{progress.toFixed(0)}%</span>
      </div>
    );
  };

  const TABS = [
    { id: "leaderboard", label: "Leaderboard", icon: TrendingUp },
    { id: "records", label: "Converted Sales", icon: Table2 },
    { id: "ytd", label: "YTD Chart", icon: BarChart2 },
    ...(isAdmin ? [{ id: "config", label: "Config", icon: Settings }] : []),
  ];

  const monthLabel = summaryData?.month_label || month;

  return (
    <div className="lm-incentive-view lm-incentive-v2">
      {/* ── Header Bar ───────────────────────────────────────────────── */}
      <div className="lm-incentive-topbar">
        <div className="lm-incentive-topbar__left">
          <BadgePercent size={20} className="lm-incentive-topbar__icon" />
          <div>
            <h3 className="lm-incentive-topbar__title">Incentives</h3>
            <p className="lm-incentive-topbar__sub">Real conversion data · Payout workflow</p>
          </div>
        </div>
        <div className="lm-incentive-topbar__right">
          <div className="lm-incentive-month-picker">
            <CalendarDays size={15} />
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="lm-month-input"
            />
          </div>
          <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => fetchSummary()}>
            <RefreshCw size={14} /> Refresh
          </button>
          {activeTab === "records" && (
            <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={handleExportCSV}>
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="lm-stats lm-incentive-stats">
        <StatCard label="Total Incentive Pool" value={fmtCurrency(totals.incentive_amount || 0)} icon={BadgePercent} color="#6366f1" />
        <StatCard label="Net Monthly Revenue" value={fmtCurrency(totals.net_revenue || 0)} icon={TrendingUp} color="#16a34a" />
        <StatCard label="Converted Deals" value={totals.deal_count || 0} icon={CheckCircle2} color="#06b6d4" />
        <StatCard label="Active Reps" value={totals.active_reps || 0} icon={Users2} color="#f97316" />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="lm-incentive-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`lm-incentive-tab${activeTab === id ? " active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="lm-center-state"><Loader2 className="spin" size={28} /><p>Loading {monthLabel} data…</p></div>
      ) : (

        /* ── LEADERBOARD TAB ─────────────────────────────────────────── */
        activeTab === "leaderboard" && (
          <div className="lm-incentive-leaderboard-v2">
            {(!summaryData?.users?.length) ? (
              <div className="lm-center-state">
                <BadgePercent size={40} />
                <strong>No conversions in {monthLabel}</strong>
                <p>No converted sales records were found for this month.</p>
              </div>
            ) : (
              <div className="lm-incentive-cards-grid">
                {summaryData.users.map((u, idx) => (
                  <div key={u.user_id} className="lm-incentive-card-v2">
                    <div className="lm-incentive-card-v2__rank">#{idx + 1}</div>
                    <div className="lm-incentive-card-v2__head">
                      <div
                        className="lm-incentive-card__avatar lm-clickable"
                        onClick={() => onOpenProfile?.({ fullname: u.fullname, name: u.fullname, username: u.username })}
                        title={`View ${u.fullname}'s profile`}
                      >
                        {(u.fullname || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5
                          className="lm-incentive-card__name lm-clickable"
                          onClick={() => onOpenProfile?.({ fullname: u.fullname, name: u.fullname, username: u.username })}
                        >
                          {u.fullname}
                        </h5>
                        <span className="lm-incentive-card__sub">{u.designation || u.department || "Sales Rep"}</span>
                      </div>
                      <PayoutBadge status={u.payout_status} />
                    </div>

                    <div className="lm-incentive-card-v2__metrics">
                      <div className="lm-incentive-metric">
                        <small>Gross Revenue</small>
                        <strong>{fmtCurrency(u.gross_revenue)}</strong>
                      </div>
                      <div className="lm-incentive-metric">
                        <small>Discount</small>
                        <strong className="lm-text-orange">- {fmtCurrency(u.discount_total)}</strong>
                      </div>
                      <div className="lm-incentive-metric">
                        <small>Net Revenue</small>
                        <strong className="lm-text-green">{fmtCurrency(u.net_revenue)}</strong>
                      </div>
                      <div className="lm-incentive-metric">
                        <small>Incentive ({fmtPct(u.incentive_rate)})</small>
                        <strong className="lm-text-indigo">{fmtCurrency(u.incentive_amount)}</strong>
                      </div>
                      <div className="lm-incentive-metric">
                        <small>Deals Converted</small>
                        <strong>{u.deal_count}</strong>
                      </div>
                    </div>

                    {u.target_amount && (
                      <div className="lm-incentive-card-v2__target">
                        <div className="lm-incentive-target-label">
                          <small>Monthly Target Progress</small>
                          <small>{fmtCurrency(u.net_revenue)} / {fmtCurrency(u.target_amount)}</small>
                        </div>
                        <TargetBar progress={u.target_progress} />
                      </div>
                    )}

                    {isAdmin && (
                      <div className="lm-incentive-card-v2__actions">
                        {updatingPayoutId === u.user_id ? (
                          <div className="lm-center-state lm-center-state--sm"><Loader2 className="spin" size={14} /></div>
                        ) : (
                          <select
                            value={u.payout_status}
                            onChange={e => handlePayoutStatusChange(u, e.target.value)}
                            className={`lm-payout-select lm-payout-select--${u.payout_status.toLowerCase()}`}
                            disabled={updatingPayoutId !== null}
                          >
                            <option value="PENDING">⏳ Pending</option>
                            <option value="APPROVED">✅ Approved</option>
                            <option value="PAID">💰 Paid</option>
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* ── RECORDS TAB ──────────────────────────────────────────────── */}
      {activeTab === "records" && !loading && (
        <div className="lm-incentive-records">
          <div className="lm-toolbar lm-incentive-toolbar">
            <div className="lm-search">
              <Search size={15} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lead, customer, rep…" />
              {search && <button className="lm-search__clear" onClick={() => setSearch("")}><X size={13} /></button>}
            </div>
            <div className="lm-filters">
              <select value={repFilter} onChange={e => setRepFilter(e.target.value)}>
                <option value="ALL">All Reps</option>
                {repNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="lm-center-state">
              <Table2 size={36} />
              <strong>No records found</strong>
              <p>Try adjusting the filters or month picker.</p>
            </div>
          ) : (
            <div className="lm-table-wrap">
              <table className="lm-table lm-incentive-table">
                <thead>
                  <tr>
                    <th>Lead / Customer</th>
                    <th>Sales Rep</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Gross Value</th>
                    <th>Discount</th>
                    <th>Net Value</th>
                    <th>Payout Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="lm-lead-cell">
                          <strong>{r.customer_name || "—"}</strong>
                          <small className="lm-lead-no">{r.lead_number}</small>
                        </div>
                      </td>
                      <td>
                        <div
                          className="lm-salesman-pill lm-clickable"
                          onClick={() => onOpenProfile?.({ fullname: r.salesman, name: r.salesman })}
                          title="View profile"
                        >
                          {r.salesman}
                        </div>
                      </td>
                      <td><span className="lm-tag">{r.conversion_type || r.service || "—"}</span></td>
                      <td><small>{r.converted_at ? new Date(r.converted_at).toLocaleDateString() : "—"}</small></td>
                      <td><strong>{fmtCurrency(r.final_value)}</strong></td>
                      <td><span className="lm-text-orange">{fmtCurrency(r.discount)}</span></td>
                      <td><strong className="lm-text-green">{fmtCurrency(r.net_value)}</strong></td>
                      <td><PayoutBadge status={r.payout_status} /></td>
                      <td>
                        <button
                          title="View Lead"
                          className="lm-btn lm-btn--ghost lm-btn--sm"
                          onClick={() => onViewLead?.({ id: r.lead_id })}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── YTD CHART TAB ────────────────────────────────────────────── */}
      {activeTab === "ytd" && (
        <div className="lm-incentive-ytd">
          {ytdLoading ? (
            <div className="lm-center-state"><Loader2 className="spin" size={28} /><p>Loading YTD data…</p></div>
          ) : !ytdData?.months?.length ? (
            <div className="lm-center-state">
              <BarChart2 size={40} />
              <strong>No data for {month.split("-")[0]}</strong>
              <p>No conversions recorded in this year yet.</p>
            </div>
          ) : (
            <>
              <div className="lm-incentive-ytd__header">
                <h4 className="lm-section-title"><BarChart2 size={16} /> Year-to-Date Incentive Summary — {month.split("-")[0]}</h4>
              </div>
              <div className="lm-incentive-ytd__chart">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={ytdData.months} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradIncentive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={m => { const d = new Date(m + "-01"); return d.toLocaleString("en", { month: "short" }); }}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis
                      tickFormatter={v => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val),
                        name === "net" ? "Net Revenue" : name === "incentive" ? "Incentive Pool" : name
                      ]}
                      labelFormatter={m => { const d = new Date(m + "-01"); return d.toLocaleString("en", { month: "long", year: "numeric" }); }}
                    />
                    <Legend formatter={v => v === "net" ? "Net Revenue" : v === "incentive" ? "Incentive Pool" : v} />
                    <Area type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} fill="url(#gradNet)" dot={{ r: 4, fill: "#6366f1" }} />
                    <Area type="monotone" dataKey="incentive" stroke="#16a34a" strokeWidth={2} fill="url(#gradIncentive)" dot={{ r: 4, fill: "#16a34a" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* YTD Summary Table */}
              <div className="lm-table-wrap lm-incentive-ytd__table">
                <table className="lm-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Deals</th>
                      <th>Gross Revenue</th>
                      <th>Net Revenue</th>
                      <th>Incentive Pool</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ytdData.months.map(m => (
                      <tr key={m.month}>
                        <td>{new Date(m.month + "-01").toLocaleString("en", { month: "long", year: "numeric" })}</td>
                        <td>{m.count}</td>
                        <td>{fmtCurrency(m.gross)}</td>
                        <td className="lm-text-green">{fmtCurrency(m.net)}</td>
                        <td className="lm-text-indigo">{fmtCurrency(m.incentive)}</td>
                      </tr>
                    ))}
                    <tr className="lm-row--total">
                      <td><strong>Total</strong></td>
                      <td><strong>{ytdData.months.reduce((s, m) => s + (m.count || 0), 0)}</strong></td>
                      <td><strong>{fmtCurrency(ytdData.months.reduce((s, m) => s + (m.gross || 0), 0))}</strong></td>
                      <td><strong className="lm-text-green">{fmtCurrency(ytdData.months.reduce((s, m) => s + (m.net || 0), 0))}</strong></td>
                      <td><strong className="lm-text-indigo">{fmtCurrency(ytdData.months.reduce((s, m) => s + (m.incentive || 0), 0))}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CONFIG TAB (Admin only) ───────────────────────────────────── */}
      {activeTab === "config" && isAdmin && (
        <div className="lm-incentive-config">
          <div className="lm-incentive-config__header">
            <div>
              <h4 className="lm-section-title"><Settings size={16} /> Per-User Incentive Configuration</h4>
              <p className="lm-incentive-config__sub">Set individual incentive rates (% of net revenue) and monthly targets per sales representative.</p>
            </div>
            <button
              className="lm-btn lm-btn--primary lm-btn--sm"
              onClick={handleSaveConfig}
              disabled={savingConfig || !Object.keys(configEdits).length}
            >
              {savingConfig ? <><Loader2 size={14} className="spin" /> Saving…</> : <><CheckCircle2 size={14} /> Save Changes</>}
            </button>
          </div>

          {configLoading ? (
            <div className="lm-center-state"><Loader2 className="spin" size={24} /></div>
          ) : (
            <div className="lm-table-wrap">
              <table className="lm-table lm-incentive-config-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Designation / Dept</th>
                    <th>Incentive Rate (%)</th>
                    <th>Monthly Target (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {configData.map(u => {
                    const edits = configEdits[u.user_id] || {};
                    const currentRate = edits.rate !== undefined ? edits.rate : u.incentive_rate;
                    const currentTarget = edits.target !== undefined ? edits.target : (u.monthly_target ?? "");
                    const isDirty = edits.rate !== undefined || edits.target !== undefined;
                    return (
                      <tr key={u.user_id} className={isDirty ? "lm-row--dirty" : ""}>
                        <td>
                          <div className="lm-incentive-user-cell">
                            <div className="lm-incentive-card__avatar lm-avatar--sm">
                              {(u.fullname || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{u.fullname}</strong>
                              <small>@{u.username}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <small>{u.designation || "—"}{u.department ? ` · ${u.department}` : ""}</small>
                        </td>
                        <td>
                          <div className="lm-inline-rate">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={currentRate}
                              onChange={e => setEdit(u.user_id, "rate", parseFloat(e.target.value) || 0)}
                              className="lm-rate-input-sm"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={currentTarget}
                            placeholder="No target set"
                            onChange={e => setEdit(u.user_id, "target", e.target.value === "" ? null : parseFloat(e.target.value))}
                            className="lm-target-input"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function ChatAvatar({ name, online, size = 38 }) {
  const initials = String(name || "?").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  return <span className="lm-chat-avatar" style={{ width: size, height: size }}>{initials}{online && <i />}</span>;
}

function DeprecatedInlineChatWorkspace({ currentUser, onUnreadChange }) {
  const [conversations, setConversations] = useState([]), [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]), [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState(""), [filter, setFilter] = useState("ALL"), [draft, setDraft] = useState("");
  const [reply, setReply] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [typing, setTyping] = useState([]), [showCreate, setShowCreate] = useState(null);
  const [selectedPeople, setSelectedPeople] = useState([]), [groupName, setGroupName] = useState("");
  const [hasMore, setHasMore] = useState(false), [historyLoading, setHistoryLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false), [editMessage, setEditMessage] = useState(null), [editBody, setEditBody] = useState("");
  const [permissionError, setPermissionError] = useState(false), [employeeError, setEmployeeError] = useState("");
  const bottomRef = useRef(null), messagesRef = useRef(null), typingTimer = useRef(null), typingSent = useRef(false), messageCursor = useRef(0), changeCursor = useRef(null), readCursor = useRef(0);
  const active = conversations.find(c => c.id === activeId);
  const loadConversations = useCallback(async (silent = false) => { try { const { data } = await ax("get", "/chat/conversations/"); setConversations(data.results || []); onUnreadChange?.(data.unread_count || 0); setActiveId(id => id || data.results?.[0]?.id || null); setPermissionError(false); setError(""); } catch (e) { if (e.response?.status === 401 || e.response?.status === 403) setPermissionError(true); if (!silent) setError(e.response?.status === 403 ? "You do not have permission to use employee chat." : "Chat is temporarily disconnected. Retry to reconnect."); } finally { if (!silent) setLoading(false); } }, [onUnreadChange]);
  const mergeMessages = (previous, incoming) => { const byId = new Map(previous.map(item => [item.id, item])); incoming.forEach(item => byId.set(item.id, item)); return [...byId.values()].sort((a,b) => Number(a.id)-Number(b.id)); };
  const loadMessages = useCallback(async (incremental = false) => { if (!activeId) return; try { const params = incremental && messageCursor.current ? { after_id: messageCursor.current, ...(changeCursor.current ? { changed_after: changeCursor.current } : {}) } : {}; const { data } = await ax("get", `/chat/conversations/${activeId}/messages/`, undefined, { params }); const incoming = data.results || []; setTyping(data.typing || []); setMessages(prev => incremental ? mergeMessages(prev, incoming) : incoming); setHasMore(data.has_more); changeCursor.current = data.cursor; const newest = incoming.reduce((max,m)=>Math.max(max, Number(m.id)||0), messageCursor.current); messageCursor.current = newest; const unreadAdvance = incoming.some(m => !m.is_system && m.sender?.id !== currentUser?.id && Number(m.id) > readCursor.current); if (unreadAdvance && !document.hidden) { await ax("post", `/chat/conversations/${activeId}/read/`, {}); readCursor.current = newest; } setPermissionError(false); setError(""); } catch (e) { if (e.response?.status === 403 || e.response?.status === 404) { setPermissionError(true); setError("You no longer have access to this conversation."); await loadConversations(true); } else setError("Live updates paused. We will keep trying."); } }, [activeId, currentUser?.id, loadConversations]);
  const loadOlder = async () => { if (!messages.length || historyLoading) return; const box = messagesRef.current, previousHeight = box?.scrollHeight || 0; setHistoryLoading(true); try { const { data } = await ax("get", `/chat/conversations/${activeId}/messages/`, undefined, { params: { before_id: messages[0].id } }); setMessages(prev => [...(data.results || []), ...prev]); setHasMore(data.has_more); requestAnimationFrame(() => { if (box) box.scrollTop = box.scrollHeight - previousHeight; }); } catch { setError("Could not load earlier messages. Please retry."); } finally { setHistoryLoading(false); } };
  const loadEmployees = useCallback(() => { setEmployeeError(""); ax("get", "/chat/employees/").then(r => setEmployees(r.data || [])).catch(e => setEmployeeError(e.response?.status === 403 ? "You cannot access the employee directory." : "Employee directory unavailable. Retry.")); }, []);
  useEffect(() => { loadConversations(); loadEmployees(); ax("post", "/chat/presence/", {}).catch(() => {}); return () => { clearTimeout(typingTimer.current); }; }, [loadConversations, loadEmployees]);
  useEffect(() => { setMessages([]); messageCursor.current = 0; readCursor.current = 0; changeCursor.current = null; setDetailsOpen(false); setPermissionError(false); if (activeId) loadMessages(false); }, [activeId, loadMessages]);
  useEffect(() => { const tick = () => { if (!document.hidden) { loadConversations(true); loadMessages(true); ax("post", "/chat/presence/", {}).catch(() => {}); } }; const timer = setInterval(tick, 10000); return () => clearInterval(timer); }, [loadConversations, loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  const send = async () => { const body = draft.trim(); if (!body || !activeId) return; const optimistic = { id: `pending-${Date.now()}`, body, sender: { id: currentUser?.id, name: currentUser?.fullname || currentUser?.username }, created_at: new Date().toISOString(), pending: true, reply_to: reply }; setMessages(m => [...m, optimistic]); setDraft(""); setReply(null); try { const { data } = await ax("post", `/chat/conversations/${activeId}/messages/`, { body, reply_to: reply?.id }); setMessages(m => m.map(item => item.id === optimistic.id ? data : item)); messageCursor.current = Math.max(messageCursor.current, data.id); loadConversations(true); } catch { setMessages(m => m.map(item => item.id === optimistic.id ? { ...item, failed: true, pending: false } : item)); } };
  const draftChanged = value => { setDraft(value); if (!activeId) return; if (value && !typingSent.current) { typingSent.current = true; ax("post", `/chat/conversations/${activeId}/typing/`, { typing: true }).catch(() => {}); } clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => { typingSent.current = false; ax("post", `/chat/conversations/${activeId}/typing/`, { typing: false }).catch(() => {}); }, 3000); };
  const createConversation = async () => { if (!selectedPeople.length) return; try { if (showCreate === "ADD") { for (const user_id of selectedPeople) await ax("post", `/chat/conversations/${activeId}/members/`, { user_id }); setShowCreate(null); setSelectedPeople([]); await loadConversations(); await loadMessages(true); return; } const payload = showCreate === "GROUP" ? { kind: "GROUP", name: groupName.trim(), member_ids: selectedPeople } : { kind: "DIRECT", member_ids: [selectedPeople[0]] }; const { data } = await ax("post", "/chat/conversations/", payload); setShowCreate(null); setSelectedPeople([]); setGroupName(""); await loadConversations(); setActiveId(data.id); } catch (e) { setError(e.response?.data?.detail || "Could not create conversation."); } };
  const removeMember = async member => { if (!window.confirm(`Remove ${member.name} from this group?`)) return; try { await ax("delete", `/chat/conversations/${activeId}/members/`, { user_id: member.id }); await loadConversations(); await loadMessages(true); } catch (e) { setError(e.response?.data?.detail || "Member could not be removed. Your admin access may have changed."); } };
  const removeMessage = async message => { if (!window.confirm("Delete this message?")) return; try { const { data } = await ax("delete", `/chat/conversations/${activeId}/messages/${message.id}/`); setMessages(m => m.map(x => x.id === message.id ? data : x)); } catch (e) { setError(e.response?.data?.detail || "Message could not be deleted."); } };
  const saveEdit = async () => { const body = editBody.trim(); if (!body || !editMessage) return; try { const { data } = await ax("patch", `/chat/conversations/${activeId}/messages/${editMessage.id}/`, { body }); setMessages(items => items.map(item => item.id === data.id ? data : item)); setEditMessage(null); setEditBody(""); } catch (e) { setError(e.response?.data?.detail || "Message could not be edited."); } };
  const visible = conversations.filter(c => (filter === "ALL" || c.kind === filter) && c.name.toLowerCase().includes(search.toLowerCase()));
  if (!loading && permissionError && !conversations.length) return <div className="lm-chat-state lm-chat-state--error"><ShieldCheck/><strong>Chat access unavailable</strong><p>{error}</p><button className="lm-btn lm-btn--primary" onClick={()=>loadConversations()}>Retry</button></div>;
  if (!loading && error && !conversations.length) return <div className="lm-chat-state lm-chat-state--error"><AlertCircle/><strong>Could not connect to chat</strong><p>{error}</p><button className="lm-btn lm-btn--primary" onClick={()=>loadConversations()}>Retry</button></div>;
  if (loading) return <div className="lm-chat-state"><Loader2 className="spin" /><strong>Opening conversations…</strong></div>;
  return <section className={`lm-chat ${activeId ? "has-active" : ""}`}>
    <aside className="lm-chat-list"><header><div><span>TEAM MESSENGER</span><h2>Conversations</h2></div><div><button title="New message" onClick={() => setShowCreate("DIRECT")}><Edit2 size={16}/></button><button title="New group" onClick={() => setShowCreate("GROUP")}><Users size={16}/></button></div></header><label className="lm-chat-search"><Search size={15}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations" /></label><nav className="lm-chat-filters">{[["ALL","All"],["DIRECT","Personal"],["GROUP","Groups"]].map(([id,label]) => <button className={filter===id?"active":""} key={id} onClick={() => setFilter(id)}>{label}</button>)}</nav><div className="lm-chat-conversations">{visible.length ? visible.map(c => <button key={c.id} className={activeId===c.id?"active":""} onClick={() => setActiveId(c.id)}><ChatAvatar name={c.name} online={c.kind==="DIRECT" && c.members.some(m=>m.id!==currentUser?.id && m.online)} /><span><strong>{c.name}</strong><small>{c.last_message?.deleted_at ? "Message deleted" : c.last_message?.body || (c.kind === "GROUP" ? `${c.members.length} members` : "Start a conversation")}</small></span><time>{c.last_message ? new Date(c.last_message.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : ""}</time>{c.unread_count>0 && <b>{c.unread_count}</b>}</button>) : <div className="lm-chat-empty"><MessageSquare/><strong>No conversations</strong><p>Start a personal chat or bring your team together.</p></div>}</div></aside>
    <main className="lm-chat-thread">{active ? <><header><button className="lm-chat-back" onClick={() => setActiveId(null)}><ArrowLeft size={18}/></button><ChatAvatar name={active.name} online={active.kind==="DIRECT" && active.members.some(m=>m.id!==currentUser?.id && m.online)} size={36}/><div><strong>{active.name}</strong><small>{active.kind === "GROUP" ? `${active.members.length} members` : (active.members.some(m=>m.id!==currentUser?.id && m.online) ? "Online now" : "Offline")}</small></div><button title="Conversation details"><Info size={18}/></button></header>{error && <div className="lm-chat-alert"><AlertCircle size={14}/>{error}<button onClick={() => {loadConversations();loadMessages();}}>Retry</button></div>}<div className="lm-chat-messages">{messages.length === 0 && <div className="lm-chat-empty"><MessageSquare/><strong>No messages yet</strong><p>Say hello and start collaborating.</p></div>}{messages.map((m,i) => { const own=m.sender?.id===currentUser?.id, grouped=i>0 && messages[i-1].sender?.id===m.sender?.id; return <div key={m.id} className={`lm-chat-message ${own?"own":""} ${grouped?"grouped":""}`}><div className="lm-chat-bubble">{m.reply_to && <button className="lm-chat-reply-quote">{m.reply_to.sender_name}<span>{m.reply_to.body}</span></button>}{m.deleted_at ? <em>Message deleted</em> : <p>{m.body}</p>}<footer>{!own && !grouped && <strong>{m.sender?.name}</strong>}<time>{new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</time>{m.edited_at && <span>edited</span>}{m.pending && <Clock size={11}/>} {m.failed && <span className="failed">Not sent</span>}</footer></div>{!m.pending && !m.deleted_at && <div className="lm-chat-message-actions"><button onClick={() => setReply(m)} title="Reply"><CornerUpLeft size={13}/></button>{own && <button onClick={() => removeMessage(m)} title="Delete"><Trash2 size={13}/></button>}</div>}</div>})}{typing.length>0 && <div className="lm-chat-typing"><i/><i/><i/> {typing.map(u=>u.name).join(", ")} typing</div>}<div ref={bottomRef}/></div><footer className="lm-chat-composer">{reply && <div className="lm-chat-reply-preview"><CornerUpLeft size={14}/><span>Replying to <strong>{reply.sender?.name}</strong><small>{reply.body}</small></span><button onClick={() => setReply(null)}><X size={15}/></button></div>}<div><textarea value={draft} onChange={e=>draftChanged(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={`Message ${active.name}`} rows={1}/><button onClick={send} disabled={!draft.trim()}><Send size={17}/></button></div><small>Enter to send · Shift + Enter for a new line</small></footer></> : <div className="lm-chat-empty lm-chat-welcome"><MessageSquare/><strong>Your team, in one place</strong><p>Select a conversation or start a new one.</p></div>}</main>
    <aside className="lm-chat-details">{active && <><ChatAvatar name={active.name} size={56}/><h3>{active.name}</h3><p>{active.kind === "GROUP" ? `${active.members.length} team members` : "Personal conversation"}</p><hr/><span>MEMBERS</span>{active.kind === "GROUP" && active.members.find(m=>m.id===currentUser?.id)?.is_admin && <button className="lm-chat-add-member" onClick={()=>{setSelectedPeople([]);setShowCreate("ADD");}}><Plus size={13}/> Add members</button>}{active.members.map(member=><div key={member.id}><ChatAvatar name={member.name} online={member.online} size={30}/><p><strong>{member.name}</strong><small>{member.is_admin?"Group admin":member.designation}</small></p>{active.kind === "GROUP" && member.id !== currentUser?.id && active.members.find(m=>m.id===currentUser?.id)?.is_admin && <button className="lm-chat-remove-member" onClick={()=>removeMember(member)} title="Remove member"><X size={12}/></button>}</div>)}</>}</aside>
    {showCreate && <div className="lm-overlay"><div className="lm-chat-modal"><header><div><span>{showCreate==="GROUP"?"NEW GROUP":showCreate==="ADD"?"GROUP MEMBERS":"PERSONAL CHAT"}</span><h3>{showCreate==="GROUP"?"Create a group":showCreate==="ADD"?"Add team members":"Start a conversation"}</h3></div><button onClick={()=>setShowCreate(null)}><X/></button></header>{showCreate==="GROUP"&&<label>Group name<input value={groupName} onChange={e=>setGroupName(e.target.value)} maxLength={120} placeholder="e.g. Sales launch team"/></label>}<label>Find employees<div className="lm-chat-people">{employees.filter(person=>showCreate!=="ADD"||!active?.members.some(m=>m.id===person.id)).map(person=><button key={person.id} className={selectedPeople.includes(person.id)?"selected":""} onClick={()=>setSelectedPeople(ids=>showCreate==="DIRECT"?[person.id]:(ids.includes(person.id)?ids.filter(id=>id!==person.id):[...ids,person.id]))}><ChatAvatar name={person.name} online={person.online} size={34}/><span><strong>{person.name}</strong><small>{person.designation}{person.department?` · ${person.department}`:""}</small></span>{selectedPeople.includes(person.id)&&<Check size={16}/>}</button>)}</div></label><footer><button className="lm-btn" onClick={()=>setShowCreate(null)}>Cancel</button><button className="lm-btn lm-btn--primary" disabled={!selectedPeople.length||(showCreate==="GROUP"&&!groupName.trim())} onClick={createConversation}>{showCreate==="GROUP"?"Create group":showCreate==="ADD"?"Add members":"Open chat"}</button></footer></div></div>}
  </section>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeadManagement() {
  const router = useRouter();
  const { showAlert, showConfirm } = useModal();
  const { user, hasPermission } = useAuth();
  const importRef = useRef(null);
  const userCustomPermissions = useMemo(() => new Set(user?.custom_permissions || []), [user]);
  const isSalesMarketingProfileOnly = user?.role === "sales_and_marketing"
    && userCustomPermissions.has("lead.view_my_profile")
    && !userCustomPermissions.has("lead.view_all");
  const canListLeads = !isSalesMarketingProfileOnly && hasPermission(["lead.view_own", "lead.view_all"]);
  const canViewSalesTeam = !isSalesMarketingProfileOnly && hasPermission(["lead.view_all", "lead.assign", "lead.reassign"]);
  const canTelecall = hasPermission(["lead.call", "lead.follow_up"]);

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState("table"); // table | my_profile | telecalling | reports
  const [formLead, setFormLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [emailLead, setEmailLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [stats, setStats] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingMode, setPendingMode] = useState(null);
  const [pendingCustomerListId, setPendingCustomerListId] = useState(null);
  const [pendingListName, setPendingListName] = useState("");
  const [pendingListCreated, setPendingListCreated] = useState(false);
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [allowedSalesUsers, setAllowedSalesUsers] = useState(null);
  const [workspaceLeads, setWorkspaceLeads] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceRefresh, setWorkspaceRefresh] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreenState);
    updateFullscreenState();
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      showAlert("Fullscreen", "Browser fullscreen could not be changed.", "error");
    }
  }, [showAlert]);

  useEffect(() => {
    if (view === "chat" || !user) return undefined;
    let cancelled = false;
    const refreshUnread = () => {
      if (document.hidden) return;
      ax("get", "/chat/conversations/").then(({ data }) => { if (!cancelled) setChatUnread(data.unread_count || 0); }).catch(() => {});
    };
    refreshUnread();
    const timer = setInterval(refreshUnread, 10000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [view, user]);

  const fetchAllowedSalesUsers = useCallback(() => {
    ax("get", "/tele-sales-users/")
      .then(r => {
        const list = (r.data && typeof r.data === "object" && !Array.isArray(r.data))
          ? (r.data.users || [])
          : (Array.isArray(r.data) ? r.data : []);
        setAllowedSalesUsers(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (canViewSalesTeam) fetchAllowedSalesUsers();
  }, [fetchAllowedSalesUsers, canViewSalesTeam]);

  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const params = { page, page_size: pageSize };
      if (search.trim()) params.search = search.trim();
      if (stageFilter) params.current_stage = stageFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (sourceFilter) params.source = sourceFilter;
      const res = await api.list(params);
      const d = res.data;
      const fetchedList = d?.results || (Array.isArray(d) ? d : []);
      const count = d?.count ?? fetchedList.length;

      setLeads(fetchedList);
      setTotal(count);
    } catch (err) {
      if (!silent) showAlert("Error", err.response?.data?.detail || "Failed to load leads.", "error");
    } finally { setLoading(false); setRefreshing(false); }
  }, [page, pageSize, search, stageFilter, priorityFilter, sourceFilter, showAlert]);

  const updateLeadWithCall = useCallback((callRecord) => {
    if (!callRecord || !callRecord.lead_id) return;
    setLeads(prevLeads => {
      return prevLeads.map(l => {
        if (l.id === callRecord.lead_id) {
          const newStage = callRecord.outcome === "CONNECTED"
            ? (l.current_stage === "NEW" || l.current_stage === "ASSIGNED" ? "CONNECTED" : l.current_stage)
            : l.current_stage;
          return {
            ...l,
            calls_count: (l.calls_count || 0) + 1,
            last_call_at: callRecord.created_at || new Date().toISOString(),
            current_stage: newStage,
            next_follow_up_at: callRecord.next_follow_up_at || l.next_follow_up_at,
            requirement_summary: callRecord.discussion_summary
              ? (l.requirement_summary ? `${l.requirement_summary}\n\n[Call Log]: ${callRecord.discussion_summary}` : `[Call Log]: ${callRecord.discussion_summary}`)
              : l.requirement_summary,
          };
        }
        return l;
      });
    });
  }, []);

  const fetchStats = useCallback(async () => {
    try { const r = await api.dashboard(); setStats(r.data); } catch { /* silent */ }
  }, []);

  useEffect(() => { if (canListLeads) fetchLeads(); else setLoading(false); }, [fetchLeads, canListLeads]);
  useEffect(() => { if (canListLeads) fetchStats(); }, [fetchStats, canListLeads]);

  useEffect(() => {
    if (view !== "emailing") return;
    let cancelled = false;
    const fetchWorkspaceLeads = async () => {
      setWorkspaceLoading(true);
      try {
        const all = [];
        for (let pageNumber = 1; pageNumber <= 100; pageNumber += 1) {
          const params = { page: pageNumber, page_size: 100 };
          if (search.trim()) params.search = search.trim();
          if (stageFilter) params.current_stage = stageFilter;
          if (priorityFilter) params.priority = priorityFilter;
          if (sourceFilter) params.source = sourceFilter;
          const response = await api.list(params);
          const data = response.data;
          all.push(...(data?.results || (Array.isArray(data) ? data : [])));
          if (!data?.next) break;
        }
        if (!cancelled) setWorkspaceLeads(all);
      } catch (err) {
        if (!cancelled) showAlert("Error", "Failed to load the complete workspace dataset.", "error");
      } finally {
        if (!cancelled) setWorkspaceLoading(false);
      }
    };
    fetchWorkspaceLeads();
    return () => { cancelled = true; };
  }, [view, search, stageFilter, priorityFilter, sourceFilter, showAlert, workspaceRefresh]);

  const handleSaved = (lead, isUpdate) => {
    if (isUpdate) setLeads(ls => ls.map(l => l.id === lead.id ? lead : l));
    else { setLeads(ls => [lead, ...ls]); setTotal(t => t + 1); }
    setFormLead(null); fetchStats();
    showAlert("Saved", isUpdate ? "Lead updated." : "Lead created.", "success");
  };

  const handleDelete = (lead) => {
    showConfirm("Delete Lead", `Delete lead for ${lead.customer_name}? Converted/rejected leads cannot be deleted.`, async () => {
      setDeletingId(lead.id);
      try {
        await api.remove(lead.id);
        setLeads(ls => ls.filter(l => l.id !== lead.id)); setTotal(t => t - 1); fetchStats();
        showAlert("Deleted", "Lead removed.", "success");
      } catch (err) {
        showAlert("Error", err.response?.data?.error || "Cannot delete.", "error");
      } finally { setDeletingId(null); }
    }, "danger");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (stageFilter) params.current_stage = stageFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await api.exportCsv(params);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a"); a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { showAlert("Error", "Export failed.", "error"); }
    finally { setExporting(false); }
  };

  const handleCancelImport = async () => {
    if (pendingMode === "targets" && pendingCustomerListId && pendingListCreated) {
      try {
        await ax("delete", `/lead-lists/${pendingCustomerListId}/`);
        // Re-fetch lists to sync frontend
        const listsFetch = await ax("get", `/lead-lists/?page_size=100`);
        const all = listsFetch.data?.results || (Array.isArray(listsFetch.data) ? listsFetch.data : []);
        setTargetLists(all.filter(l =>
          l.created_by_id === selectedUser.id ||
          (l.assigned_team || "").toLowerCase().includes((selectedUser.fullname || "").toLowerCase()) ||
          (l.assigned_team || "").toLowerCase().includes((selectedUser.username || "").toLowerCase())
        ));
      } catch (e) {
        console.error("Failed to delete cancelled list", e);
      }
    }
    setImportResult(null);
    setPendingFile(null);
    setPendingMode(null);
    setPendingCustomerListId(null);
    setPendingListName("");
    setPendingListCreated(false);
    showAlert("Cancelled", "Import cancelled.", "info");
  };

  const handleCommitImport = async () => {
    if (!pendingFile) return;
    setIsSavingImport(true);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      fd.append("mode", pendingMode);
      if (pendingMode === "targets" && pendingCustomerListId) {
        fd.append("customer_list", pendingCustomerListId);
      }
      const res = await ax("post", "/lead-import/", fd, {
        headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
      });
      setImportResult(null);
      setPendingFile(null);
      setPendingMode(null);
      setPendingCustomerListId(null);
      setPendingListName("");
      setPendingListCreated(false);
      showAlert("Import Complete", `Successfully imported ${res.data.created_count} record(s).`, "success");
      fetchLeads(); fetchStats();
    } catch (err) {
      showAlert("Import Error", err.response?.data?.errors?.[0]?.message || err.response?.data?.errors?.[0] || "Save failed.", "error");
    } finally {
      setIsSavingImport(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const res = await api.importCsv(file, true); // dry run validation
      setImportResult({ ...res.data, listName: "Lead Import" });
      setPendingFile(file);
      setPendingMode("leads");
      setPendingListName("Lead Import");
      setPendingListCreated(false);
    } catch (err) {
      showAlert("Import Error", err.response?.data?.errors?.[0]?.message || err.response?.data?.errors?.[0] || "Import failed.", "error");
    } finally { e.target.value = ""; }
  };

  const clearFilters = () => { setStageFilter(""); setPriorityFilter(""); setSourceFilter(""); setSearch(""); setPage(1); };
  const activeFilters = [stageFilter, priorityFilter, sourceFilter, search.trim()].filter(Boolean).length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const canViewAllLeads = hasPermission("lead.view_all");

  const visibleLeads = useMemo(
    () => view === "emailing" ? workspaceLeads : leads,
    [view, workspaceLeads, leads]
  );

  const summaryStats = useMemo(() => {
    const s = stats?.cards || stats || {};
    return {
      total: canViewAllLeads ? (s.total_leads ?? total ?? visibleLeads.length) : visibleLeads.length,
      converted: visibleLeads.filter(l => l.current_stage === "CONVERTED").length,
      high_priority: visibleLeads.filter(l => ["HIGH", "CRITICAL"].includes(l.priority)).length,
      follow_up_required: visibleLeads.filter(l => l.current_stage === "FOLLOW_UP_REQUIRED" || l.next_follow_up_at).length,
    };
  }, [stats, visibleLeads, total, canViewAllLeads]);

  const groupedLeads = useMemo(() => {
    const groups = {};
    const allowedMap = allowedSalesUsers ? new Set(allowedSalesUsers.map(u => (u.fullname || u.username || "").toLowerCase())) : null;
    const allowedIds = allowedSalesUsers ? new Set(allowedSalesUsers.map(u => u.id)) : null;

    visibleLeads.forEach((lead, idx) => {
      const name = lead.assigned_to_name || (typeof lead.assigned_to === "object" ? (lead.assigned_to?.fullname || lead.assigned_to?.username) : null) || "Unassigned";

      if (allowedMap && allowedIds && allowedSalesUsers.length > 0) {
        const leadUserId = typeof lead.assigned_to === "object" ? lead.assigned_to?.id : lead.assigned_to;
        const nameLower = name.toLowerCase();
        const matches = (leadUserId && allowedIds.has(leadUserId)) || allowedMap.has(nameLower);
        if (!matches) return;
      }

      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push({ lead, originalIdx: idx });
    });

    return Object.keys(groups)
      .sort((a, b) => {
        if (a === "Unassigned") return 1;
        if (b === "Unassigned") return -1;
        return a.localeCompare(b);
      })
      .map(salesmanName => ({
        salesman: salesmanName,
        items: groups[salesmanName],
      }));
  }, [visibleLeads, allowedSalesUsers]);


  const ALL_VIEW_BTNS = [
    { id: "table",       icon: Table2,       label: "Leads List", permission: ["lead.view_own", "lead.view_all"], hidden: isSalesMarketingProfileOnly },
    { id: "tele_sales",  icon: Users2,       label: "Sales Team", permission: ["lead.view_all", "lead.assign", "lead.reassign"], hidden: isSalesMarketingProfileOnly },
    { id: "my_profile",  icon: User,         label: "My Profile", permission: ["lead.view_my_profile", "lead.view_own", "lead.view_all"] },
    { id: "all_meetings", icon: Users,       label: "All Meetings", permission: ["lead.view_all"], hidden: isSalesMarketingProfileOnly },
    { id: "proposal_requests", icon: FileText, label: "Proposal Requests", permission: ["proposals.view"], hidden: isSalesMarketingProfileOnly },
    { id: "incentives",  icon: BadgePercent, label: "Incentives", permission: ["lead.view_all"], hidden: isSalesMarketingProfileOnly },
    { id: "emailing",    icon: Mail,         label: "Emailing",   permission: ["lead.send_email", "lead.manage_templates"], hidden: isSalesMarketingProfileOnly },
    { id: "reports",     icon: BarChart2,    label: "Reports",    permission: ["lead.view_reports", "lead.view_all"], hidden: isSalesMarketingProfileOnly },
    { id: "chat",        icon: MessageSquare, label: "Chat",      permission: "chat.view", hidden: isSalesMarketingProfileOnly },
  ];

  const VIEW_BTNS = ALL_VIEW_BTNS.filter(btn => !btn.hidden && (!btn.permission || hasPermission(btn.permission)));

  useEffect(() => {
    if (VIEW_BTNS.length > 0 && !VIEW_BTNS.some(button => button.id === view)) {
      setView(VIEW_BTNS[0].id);
    }
  }, [view, user]);

  const canExport = hasPermission("lead.export");
  const canImport = hasPermission("lead.import");
  const canCreate = hasPermission("lead.create");

  const hasLeadAccess = useMemo(() => {
    if (!user) return true;
    if (user.is_superuser || user.role === "super_admin" || user.role === "admin") {
      return true;
    }
    const perms = user.effective_permissions || user.permissions || [];
    if (perms.includes("*")) return true;
    return perms.some((p) => p.startsWith("lead."));
  }, [user]);

  if (!hasLeadAccess) {
    return (
      <div className="lm-root" style={{ padding: 40, textAlign: "center" }}>
        <div style={{ maxWidth: 460, margin: "60px auto", background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16, display: "inline-block" }} />
          <h2 style={{ fontSize: 20, margin: "0 0 8px", color: "#0f172a" }}>Access Denied</h2>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>
            You do not have permission to access the Lead Management module. Please contact your administrator.
          </p>
          <button className="lm-btn lm-btn--primary" onClick={() => router.push("/admindashboard/")}>
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lm-root">
      {/* ── Header ── */}
      <div className="lm-header" id="lead-management-header-content">
          <div className="lm-header__left">
            <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => router.push("/admindashboard/")}>
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <h1 className="lm-title">Lead Management</h1>
              <p className="lm-subtitle">{view === "my_profile" ? "Your private lead workspace" : view === "all_meetings" ? "All users' created meetings" : `${total} lead${total !== 1 ? "s" : ""} in pipeline`}</p>
            </div>
          </div>
          <div className="lm-header__right">
            {/* View switcher */}
            <div className="lm-view-switcher">
              {VIEW_BTNS.map(({ id, icon: Icon, label }) => (
                <button key={id} className={`lm-view-btn ${view === id ? "lm-view-btn--active" : ""}`} onClick={() => setView(id)} title={label}>
                  <Icon size={15} /> <span>{label}</span>{id === "chat" && chatUnread > 0 && <b className="lm-chat-nav-badge">{chatUnread > 99 ? "99+" : chatUnread}</b>}
                </button>
              ))}
            </div>
            {!['my_profile', 'chat', 'incentives', 'all_meetings', 'proposal_requests'].includes(view) && <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={() => fetchLeads(true)} disabled={refreshing}>
              <RefreshCw size={15} className={refreshing ? "spin" : ""} />
            </button>}
            <button
              type="button"
              className="lm-header-toggle"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit full screen" : "Full screen"}
            >
              {isFullscreen ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
              <span>{isFullscreen ? "Exit full screen" : "Full screen"}</span>
            </button>
          </div>
        </div>

      {/* ── Stats ── */}
      {!['my_profile', 'chat', 'incentives', 'all_meetings', 'proposal_requests'].includes(view) && <div className="lm-stats">
        <StatCard label="Total Leads" value={summaryStats.total ?? leads.length} icon={BarChart2} color="#6366f1" />
        <StatCard label="Converted" value={summaryStats.converted} icon={TrendingUp} color="#16a34a" />
        <StatCard label="High Priority" value={summaryStats.high_priority ?? summaryStats.critical_priority} icon={AlertCircle} color="#f97316" />
        <StatCard label="Follow-ups Pending" value={summaryStats.follow_up_required ?? summaryStats.follow_ups_pending} icon={Clock} color="#3b82f6" />
      </div>}

      {/* ── Toolbar (only for table/kanban views) ── */}
      {view === "table" && (
        <>
          <div className="lm-toolbar">
            <div className="lm-search">
              <Search size={16} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, company, phone, email…" />
              {search && <button className="lm-search__clear" onClick={() => { setSearch(""); setPage(1); }}><X size={14} /></button>}
            </div>
            <button className={`lm-btn lm-btn--ghost lm-btn--sm ${showFilters ? "lm-btn--active" : ""}`} onClick={() => setShowFilters(f => !f)}>
              <Filter size={15} /> Filters {activeFilters > 0 && <span className="lm-badge">{activeFilters}</span>} <ChevronDown size={14} />
            </button>
          </div>
          {showFilters && (
            <div className="lm-filters">
              <select value={stageFilter} onChange={e => { setStageFilter(e.target.value); setPage(1); }}>
                <option value="">All Stages</option>
                {Object.entries(STAGE_META).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
              <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
                <option value="">All Priorities</option>
                {Object.entries(PRIORITY_META).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
              <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}>
                <option value="">All Sources</option>
                {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {activeFilters > 0 && <button className="lm-btn lm-btn--ghost lm-btn--sm" onClick={clearFilters}><X size={14} /> Clear</button>}
            </div>
          )}
        </>
      )}

      {/* ── View Content ── */}
      {view === "tele_sales" ? (
        <TeleCallingSalesView onViewLead={setViewLead} onUsersUpdated={fetchAllowedSalesUsers} onOpenProfile={setProfileUser} />
      ) : view === "my_profile" ? (
        <MyProfileView
          onViewLead={setViewLead}
          canTelecall={canTelecall}
          onCallLogged={(call) => { updateLeadWithCall(call); if (canListLeads) fetchLeads(true); }}
        />
      ) : view === "incentives" ? (
        <IncentiveView leads={leads} onViewLead={setViewLead} onOpenProfile={setProfileUser} />
      ) : view === "all_meetings" ? (
        <AllMeetingsView onViewLead={setViewLead} />
      ) : view === "proposal_requests" ? (
        <AllProposalRequestsView onViewLead={setViewLead} />
      ) : view === "reports" ? (
        <ReportsView />
      ) : view === "chat" ? (
        <LiveChatWorkspace currentUser={user} onUnreadChange={setChatUnread} />
      ) : view === "emailing" ? (
        workspaceLoading ? <div className="lm-center-state"><Loader2 size={32} className="spin" /></div>
          : <EmailingView leads={visibleLeads} onRefresh={() => { fetchLeads(true); setWorkspaceRefresh(value => value + 1); }} />
      ) : (
        <>
          {loading ? (
            <div className="lm-table-wrap">
              <div className="lm-center-state"><Loader2 size={32} className="spin" /><p>Loading leads…</p></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="lm-table-wrap">
              <div className="lm-center-state">
                <p>No leads found. <button className="lm-link" onClick={() => setFormLead({})}>Add the first one →</button></p>
              </div>
            </div>
          ) : (
            groupedLeads.map((group) => (
              <div key={group.salesman} className="lm-salesman-section">
                <div className="lm-salesman-header">
                  <div
                    className="lm-salesman-title"
                    onClick={() => setProfileUser({ fullname: group.salesman, name: group.salesman })}
                    style={{ cursor: 'pointer' }}
                    title="Click to view Employee Profile"
                  >
                    <User size={18} />
                    <h3>{group.salesman}</h3>
                    <span className="lm-salesman-count">
                      {group.items.length} {group.items.length === 1 ? "lead" : "leads"}
                    </span>
                  </div>
                </div>

                <div className="lm-table-wrap">
                  <table className="lm-table">
                    <thead>
                      <tr>
                        <th style={{ width: 65, textAlign: "center" }}>#</th>
                        <th>LEAD & CONTACT</th>
                        <th>TARGET SCOPE / BATCH</th>
                        <th>SERVICE / PRODUCT</th>
                        <th>CREATED AT</th>
                        <th>LAST FOLLOW-UP</th>
                        <th>NEXT FOLLOW-UP</th>
                        <th style={{ textAlign: "center" }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item) => {
                        const lead = item.lead;
                        const originalIdx = item.originalIdx;
                        const priorityLetter = lead.priority === "HIGH" ? "H" : lead.priority === "LOW" ? "L" : "M";
                        const priorityColor = lead.priority === "HIGH" ? "#dc2626" : lead.priority === "LOW" ? "#16a34a" : "#d97706";
                        const priorityBg = lead.priority === "HIGH" ? "#fef2f2" : lead.priority === "LOW" ? "#f0fdf4" : "#fffbeb";
                        const priorityBorder = lead.priority === "HIGH" ? "#fca5a5" : lead.priority === "LOW" ? "#86efac" : "#fcd34d";
                        const priorityAccent = lead.priority === "HIGH" ? "#ef4444" : lead.priority === "LOW" ? "#10b981" : "#f59e0b";

                        const lastFollowDate = lead.last_follow_up?.completed_at || lead.last_follow_up?.scheduled_at || lead.next_follow_up_at || lead.updated_at;
                        const lastFollowNote = lead.last_follow_up?.notes || lead.last_follow_up?.purpose || lead.last_follow_up?.result || lead.requirement_summary || "—";
                        const trClass = lead.current_stage === "CONVERTED" ? "lm-row--won" : lead.current_stage === "LOST" ? "lm-row--lost" : "";

                        return (
                          <tr key={lead.id} className={trClass} style={{ borderLeft: `4px solid ${priorityAccent}` }}>
                            <td style={{ color: "#475569", paddingLeft: 12 }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <span
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    background: priorityBg,
                                    color: priorityColor,
                                    border: `1.5px solid ${priorityBorder}`,
                                    display: "inline-grid",
                                    placeItems: "center",
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    flexShrink: 0,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
                                  }}
                                  title={`Priority: ${lead.priority || "Medium"}`}
                                >
                                  {priorityLetter}
                                </span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{(page - 1) * pageSize + originalIdx + 1}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13 }}>
                                {lead.company_name || lead.customer_name || "—"}
                              </div>
                              {lead.contact_person && (
                                <div style={{ fontSize: 12, color: "#334155", fontWeight: 600, marginTop: 1 }}>
                                  Contact: {lead.contact_person}
                                </div>
                              )}
                              <small className="lm-table-sub" style={{ color: "#64748b", fontSize: 11 }}>
                                {lead.lead_number ? `${lead.lead_number} · ` : ""}{lead.email || lead.phone || "—"}
                              </small>
                            </td>
                            <td>
                              {lead.target_list_name ? (() => {
                                const bStyle = getBatchStyle(lead.target_list_name);
                                return (
                                  <span
                                    style={{
                                      padding: "3px 9px",
                                      background: bStyle.bg,
                                      color: bStyle.text,
                                      border: `1.5px solid ${bStyle.border}`,
                                      borderRadius: 6,
                                      fontWeight: 600,
                                      fontSize: 11,
                                      display: "inline-block"
                                    }}
                                  >
                                    {lead.target_list_name}
                                  </span>
                                );
                              })() : (
                                <span style={{ padding: "3px 8px", background: "#f1f5f9", color: "#64748b", borderRadius: 4, fontSize: 11, display: "inline-block" }}>
                                  Direct Lead
                                </span>
                              )}
                            </td>
                            <td>{lead.service || lead.product || "—"}</td>
                            <td style={{ fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>
                              {lead.created_at ? fmtDateTime(lead.created_at) : "—"}
                            </td>
                            <td>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                                {lastFollowDate ? fmtDateTime(lastFollowDate) : "—"}
                              </div>
                              <div
                                style={{ fontSize: 11, color: "#64748b", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                title={typeof lastFollowNote === "string" ? lastFollowNote : ""}
                              >
                                {lastFollowNote}
                              </div>
                            </td>
                            <td>
                              {lead.next_follow_up_at ? (
                                <div className={isOverdue(lead.next_follow_up_at) ? "lm-overdue" : ""} style={{ fontSize: 12, fontWeight: 600 }}>
                                  {fmtDateTime(lead.next_follow_up_at)}
                                </div>
                              ) : (
                                <span style={{ color: "#94a3b8" }}>—</span>
                              )}
                            </td>
                            <td className="lm-row-actions">
                              {hasPermission("lead.send_email") && (
                                <button title="Send Email" onClick={() => setEmailLead(lead)}><Mail size={15} /></button>
                              )}
                              {hasPermission(["lead.view_own", "lead.view_all"]) && (
                                <button title="View" onClick={() => setViewLead(lead)}><Eye size={15} /></button>
                              )}
                              {hasPermission("lead.edit") && (
                                <button title="Edit" onClick={() => setFormLead(lead)}><Edit2 size={15} /></button>
                              )}
                              {hasPermission("lead.delete") && (
                                <button title="Delete" className="lm-danger" disabled={deletingId === lead.id} onClick={() => handleDelete(lead)}>
                                  {deletingId === lead.id ? <Loader2 size={15} className="spin" /> : <FileText size={15} />}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
          {!loading && totalPages > 1 && (
            <div className="lm-pagination">
              <button className="lm-btn lm-btn--ghost lm-btn--sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} /> Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button className="lm-btn lm-btn--ghost lm-btn--sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Import Result Modal ── */}
      {importResult && (
        <ImportResultModal
          result={importResult}
          onClose={handleCancelImport}
          onCancel={handleCancelImport}
          onSave={handleCommitImport}
          isSaving={isSavingImport}
        />
      )}

      {/* ── Modals ── */}
      {formLead !== null && (
        <LeadForm initial={formLead?.id ? formLead : undefined} onClose={() => setFormLead(null)} onSaved={handleSaved} />
      )}
      {emailLead && (
        <GmailComposeModal lead={emailLead} allLeads={leads} onClose={() => setEmailLead(null)} onSent={() => fetchLeads(true)} />
      )}
      {viewLead && (
        <LeadDetailPanel
          lead={viewLead}
          onClose={() => setViewLead(null)}
          onEdit={lead => { setViewLead(null); setFormLead(lead); }}
          onRefresh={() => fetchLeads(true)}
        />
      )}
      {profileUser && (
        <EmployeeProfileModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
          onViewLead={setViewLead}
        />
      )}
    </div>
  );
}
