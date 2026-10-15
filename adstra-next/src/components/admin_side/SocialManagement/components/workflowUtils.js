import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  AlertTriangle,
  CalendarClock,
  Hourglass,
  Send,
  Clapperboard,
  Video,
  Image as ImageIcon,
  Layers,
  Type,
} from "lucide-react";

/* ─── Workflow stage mapping ─── */

// Workflow tab that currently owns a post (for "Open in …" jumps)
export const STATUS_TO_STAGE = {
  script: "scripts",
  draft: "scripts",
  script_approval: "script_approval",
  designing: "designing",
  rejected: "designing",
  team_review: "team_review",
  internal_review: "team_review",
  client_review: "client_review",
  approved: "post_schedule",
  scheduled: "post_schedule",
  published: "published",
  archived: "published",
  content_rejected: "rejected",
};

// Stage whose actions apply to the post right now (revision loops go back to Scripts or Designing)
export function ownStageOf(post) {
  if (post.status === "rejected") {
    return post.client_feedback?.toLowerCase().includes("script") ? "scripts" : "designing";
  }
  return STATUS_TO_STAGE[post.status] || "scripts";
}

// Main pipeline order, used for row progress bars and bulk "Move to stage"
export const PIPELINE_STAGES = [
  { id: "scripts", label: "Script", status: "script" },
  { id: "script_approval", label: "Approval", status: "script_approval" },
  { id: "designing", label: "Design", status: "designing" },
  { id: "team_review", label: "Team Review", status: "team_review" },
  { id: "client_review", label: "Client Review", status: "client_review" },
  { id: "post_schedule", label: "Scheduled", status: "approved" },
  { id: "published", label: "Published", status: "published" },
];

// Position in the pipeline (rejected posts report where they were dropped)
export function pipelineProgress(post) {
  const rejected = post.status === "content_rejected";
  const stage = rejected ? STATUS_TO_STAGE[post.rejected_from_stage] || "scripts" : ownStageOf(post);
  const index = Math.max(0, PIPELINE_STAGES.findIndex((s) => s.id === stage));
  return { index, total: PIPELINE_STAGES.length, rejected };
}

export const PRIORITY_META = {
  urgent: { label: "Urgent", color: "#dc2626", bg: "#fef2f2" },
  high: { label: "High", color: "#ea580c", bg: "#fff7ed" },
  medium: { label: "Medium", color: "#64748b", bg: "#f1f5f9" },
  low: { label: "Low", color: "#94a3b8", bg: "#f8fafc" },
};

export const ASSIGNEE_ROLES = [
  { id: "writer", label: "Writer", short: "W" },
  { id: "designer", label: "Designer", short: "D" },
  { id: "reviewer", label: "Reviewer", short: "R" },
];

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

// Active team members (for @mentions and assignment) — fetched once per page load
let teamMembersPromise = null;
export function loadTeamMembers() {
  if (!teamMembersPromise) {
    teamMembersPromise = axios
      .get(`${API_BASE_URL}/social/team-members/`)
      .then((res) => (Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        teamMembersPromise = null;
        return [];
      });
  }
  return teamMembersPromise;
}

export const STAGE_COLORS = {
  scripts: { color: "#4f46e5", bg: "#eef2ff" },
  script_approval: { color: "#7c3aed", bg: "#f5f3ff" },
  designing: { color: "#db2777", bg: "#fdf2f8" },
  team_review: { color: "#b45309", bg: "#fffbeb" },
  client_review: { color: "#c2410c", bg: "#fff7ed" },
  post_schedule: { color: "#0369a1", bg: "#f0f9ff" },
  published: { color: "#047857", bg: "#ecfdf5" },
  rejected: { color: "#b91c1c", bg: "#fef2f2" },
};

/* ─── Format, platform & timing display helpers ─── */

export const FORMAT_META = {
  reel: { label: "Reel", icon: Clapperboard, color: "#db2777", bg: "#fdf2f8" },
  video: { label: "Video", icon: Video, color: "#7c3aed", bg: "#f5f3ff" },
  image: { label: "Image", icon: ImageIcon, color: "#0284c7", bg: "#f0f9ff" },
  carousel: { label: "Carousel", icon: Layers, color: "#ea580c", bg: "#fff7ed" },
  text: { label: "Text", icon: Type, color: "#475569", bg: "#f1f5f9" },
};

export const PLATFORM_NAMES = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  x: "X (Twitter)",
  twitter: "X (Twitter)",
  google_business: "Google Business",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
};

export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// "in 5 days", "in 3 hours", "2 days ago"
export function relativeTime(date) {
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const span = mins < 60 ? plural(Math.max(mins, 1), "min") : hours < 24 ? plural(hours, "hour") : plural(days, "day");
  return diffMs >= 0 ? `in ${span}` : `${span} ago`;
}

export const shortDate = (d, withTime = false) =>
  d.toLocaleDateString(
    "en-US",
    withTime ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric" }
  );

/* ─── KPI quick filters (cross-stage) ─── */

const NOT_LIVE = (p) => !["published", "archived", "content_rejected"].includes(p.status);
const WEEK_MS = 7 * 86400000;

export const SOCIAL_KPIS = [
  {
    id: "overdue",
    label: "Overdue",
    title: "Overdue Posts",
    desc: "Post date has passed but the post isn't live yet.",
    color: "#dc2626",
    bg: "#fef2f2",
    icon: AlertTriangle,
    match: (p, now) => Boolean(p.scheduled_at) && NOT_LIVE(p) && new Date(p.scheduled_at) < now,
  },
  {
    id: "due_week",
    label: "Due this week",
    title: "Due This Week",
    desc: "Posts going out in the next 7 days that aren't live yet.",
    color: "#d97706",
    bg: "#fffbeb",
    icon: CalendarClock,
    match: (p, now) => {
      if (!p.scheduled_at || !NOT_LIVE(p)) return false;
      const t = new Date(p.scheduled_at).getTime();
      return t >= now.getTime() && t <= now.getTime() + WEEK_MS;
    },
  },
  {
    id: "waiting_client",
    label: "Waiting on client",
    title: "Waiting on Client",
    desc: "Shared with the client and waiting for approval or feedback.",
    color: "#ea580c",
    bg: "#fff7ed",
    icon: Hourglass,
    match: (p) => p.status === "client_review",
  },
  {
    id: "published_month",
    label: "Published this month",
    title: "Published This Month",
    desc: "Posts that went live since the start of this month.",
    color: "#059669",
    bg: "#ecfdf5",
    icon: Send,
    match: (p, now) => {
      if (!["published", "archived"].includes(p.status) || !p.published_at) return false;
      const d = new Date(p.published_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    },
  },
];

export const KPI_BY_ID = Object.fromEntries(SOCIAL_KPIS.map((k) => [k.id, k]));
