import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import { Bot, Building2, Camera, Paintbrush } from "lucide-react";
import { FORMAT_META, PLATFORM_NAMES, STATUS_TO_STAGE } from "../workflowUtils";
import { apiErrorMessage, toast } from "../SocialFeedback";

/* ─── API ─── */

const base = `${API_BASE_URL}/social`;
export const planApi = {
  get: (path, params) => axios.get(`${base}/${path}`, { params }).then((r) => r.data),
  post: (path, data = {}) => axios.post(`${base}/${path}`, data).then((r) => r.data),
  patch: (path, data = {}) => axios.patch(`${base}/${path}`, data).then((r) => r.data),
  del: (path) => axios.delete(`${base}/${path}`).then((r) => r.data),
};

/* ─── Session ─── */

// Planning endpoints need a signed-in user; an expired login switches the tab to a sign-in prompt
export const SESSION_EXPIRED_EVENT = "adstra:planning-session-expired";

export function hasValidSession() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return false;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const isAuthError = (err) => {
  const status = err?.response?.status;
  if (status === 401) return true;
  return status === 403 && /credential|token|authenticat/i.test(JSON.stringify(err?.response?.data || ""));
};

/** Error toast for planning calls; an expired login shows the sign-in prompt instead. */
export function planError(err, fallback) {
  if (isAuthError(err)) {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    return;
  }
  toast.error(apiErrorMessage(err, fallback));
}

// JS getTimezoneOffset(): minutes to add to local time to get UTC (the backend expects this)
export const tzOffset = () => new Date().getTimezoneOffset();

/* ─── Constants ─── */

export const CONTENT_TYPES = ["reel", "video", "image", "carousel", "text"].map((id) => ({ id, ...FORMAT_META[id] }));
export const typeMeta = (id) => FORMAT_META[id] || FORMAT_META.image;

export const PILLARS = [
  { id: "educational", label: "Educational", color: "#0284c7" },
  { id: "promotional", label: "Promotional", color: "#db2777" },
  { id: "engagement", label: "Engagement", color: "#7c3aed" },
  { id: "behind_the_scenes", label: "Behind the Scenes", color: "#b45309" },
  { id: "testimonial", label: "Testimonial", color: "#059669" },
  { id: "festive", label: "Festive / Event", color: "#ea580c" },
  { id: "other", label: "Other", color: "#64748b" },
];
export const PILLAR_BY_ID = Object.fromEntries(PILLARS.map((p) => [p.id, p]));

export const PRODUCTION_METHODS = [
  { id: "in_house", label: "In-house Design", short: "In-house", icon: Paintbrush, color: "#0284c7" },
  { id: "ai_generated", label: "AI Generated", short: "AI", icon: Bot, color: "#7c3aed" },
  { id: "shoot", label: "Shoot", short: "Shoot", icon: Camera, color: "#b45309" },
  { id: "outsourced", label: "Outsourced Team", short: "Outsourced", icon: Building2, color: "#0f766e" },
];
export const METHOD_BY_ID = Object.fromEntries(PRODUCTION_METHODS.map((m) => [m.id, m]));

export const PLATFORM_OPTIONS = ["instagram", "facebook", "linkedin", "youtube", "google_business", "x"].map((id) => ({
  id,
  label: PLATFORM_NAMES[id] || id,
}));

export const PLAN_STATUS = {
  draft: { label: "Draft", color: "#475569", bg: "#f1f5f9" },
  sent: { label: "Waiting for client", color: "#c2410c", bg: "#fff7ed" },
  changes_requested: { label: "Client wants changes", color: "#b91c1c", bg: "#fef2f2" },
  approved: { label: "Client approved", color: "#047857", bg: "#ecfdf5" },
  closed: { label: "Month closed", color: "#334155", bg: "#e2e8f0" },
};

export const POLICY_META = {
  carry_over: { label: "Carry over", long: "Undelivered items move to next month", color: "#0369a1", bg: "#f0f9ff" },
  adjust_billing: { label: "Reduce bill", long: "Undelivered items are deducted from the bill", color: "#7c2d12", bg: "#fff7ed" },
};

// Where a slot is in production (planned -> post pipeline stages)
export const ITEM_STAGE = {
  planned: { label: "Planned", color: "#0f766e", bg: "#f0fdfa" },
  script: { label: "Script", color: "#4f46e5", bg: "#eef2ff" },
  script_approval: { label: "Script Approval", color: "#7c3aed", bg: "#f5f3ff" },
  designing: { label: "Design", color: "#db2777", bg: "#fdf2f8" },
  team_review: { label: "Team Review", color: "#b45309", bg: "#fffbeb" },
  client_review: { label: "Client Review", color: "#c2410c", bg: "#fff7ed" },
  ready: { label: "Scheduled", color: "#0369a1", bg: "#f0f9ff" },
  published: { label: "Published", color: "#047857", bg: "#ecfdf5" },
  rejected: { label: "Rejected", color: "#b91c1c", bg: "#fef2f2" },
  dropped: { label: "Dropped", color: "#94a3b8", bg: "#f8fafc" },
};

export const DEADLINE_LABELS = {
  script: "Script",
  script_approval: "Script approval",
  designing: "Design",
  team_review: "Team review",
  client_review: "Client review",
  publish: "Publish",
};

// Deadline engine (backend): how risky a slot schedule is, and where each stage duration came from
export const SCHEDULE_STATUS = {
  ok: { label: "On track", color: "#047857", bg: "#ecfdf5" },
  tight: { label: "Tight", color: "#b45309", bg: "#fffbeb" },
  at_risk: { label: "At risk", color: "#b91c1c", bg: "#fef2f2" },
};

export const DURATION_SOURCE = {
  learned: { label: "Learned", color: "#7c3aed" },
  default: { label: "Default", color: "#64748b" },
  override: { label: "Fixed", color: "#0369a1" },
  vendor: { label: "Partner", color: "#0f766e" },
  shoot: { label: "Shoot", color: "#b45309" },
};

export const DEFAULT_SCHEDULE = { workdays: [0, 1, 2, 3, 4, 5], buffer: 1, learn: true, overrides: {} };

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const KEY_DATE_CATEGORIES = [
  { id: "festival", label: "Festival", color: "#ea580c" },
  { id: "national", label: "National Day", color: "#0369a1" },
  { id: "awareness", label: "Awareness Day", color: "#059669" },
  { id: "client_event", label: "Client Event", color: "#7c3aed" },
  { id: "offer", label: "Offer / Sale", color: "#db2777" },
  { id: "launch", label: "Launch", color: "#4f46e5" },
  { id: "other", label: "Other", color: "#64748b" },
];
export const KEY_DATE_BY_ID = Object.fromEntries(KEY_DATE_CATEGORIES.map((k) => [k.id, k]));

export const VENDOR_TYPES = [
  { id: "anchoring", label: "Anchoring" },
  { id: "video_production", label: "Video Production" },
  { id: "photography", label: "Photography" },
  { id: "voice_over", label: "Voice Over" },
  { id: "editing", label: "Editing" },
  { id: "other", label: "Other" },
];

/** Workflow tab that owns the post created from a slot. */
export const stageForPost = (status) => STATUS_TO_STAGE[status] || "scripts";

/* ─── Dates ─── */

const pad = (n) => String(n).padStart(2, "0");
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISODate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const monthKeyOf = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const shiftMonth = (key, n) => {
  const [y, m] = key.split("-").map(Number);
  return monthKeyOf(new Date(y, m - 1 + n, 1));
};
export const monthLabel = (key, opts = { month: "long", year: "numeric" }) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", opts);
};
export const fmtDay = (s, opts = { day: "numeric", month: "short" }) => {
  const d = parseISODate(s);
  return d ? d.toLocaleDateString("en-GB", opts) : "—";
};
export const todayISO = () => toISODate(new Date());

/** Weeks (Mon–Sun) covering the month, as arrays of { iso, inMonth }. */
export function monthGrid(key) {
  const [y, m] = key.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7));
  const weeks = [];
  const cur = new Date(start);
  do {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({ iso: toISODate(cur), day: cur.getDate(), inMonth: cur.getMonth() === m - 1 });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  } while (cur.getMonth() === m - 1);
  return weeks;
}

export const daysUntil = (iso) => {
  const d = parseISODate(iso);
  if (!d) return null;
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
};

export const dueText = (iso) => {
  const n = daysUntil(iso);
  if (n === null) return "";
  if (n < 0) return `${-n}d overdue`;
  if (n === 0) return "due today";
  if (n === 1) return "due tomorrow";
  return `in ${n}d`;
};

/* ─── Money ─── */

export const fmtMoney = (v) => {
  const n = Number(v || 0);
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const slotTitle = (item) => item.title || `Untitled ${typeMeta(item.post_type).label.toLowerCase()}`;
