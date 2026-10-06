"use client";

import React, { useMemo, useState, useRef } from "react";
import {
  FileText,
  CheckCircle2,
  Users,
  Eye,
  Calendar as CalendarIcon,
  Send,
  BarChart2,
  Download,
  FileSpreadsheet,
  Clock,
  AlertCircle,
  Printer,
  TrendingUp,
  Layers,
  ShieldCheck,
  FileCheck,
  Activity,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { downloadElementAsPdf } from "@/utils/pdfExport";

// Status groups shared by the KPI cards, health check and exports
const IN_PRODUCTION_STATUSES = ["script", "draft", "script_approval", "rejected", "designing", "team_review", "internal_review", "client_review"];
const READY_STATUSES = ["approved", "scheduled", "publishing", "failed"];
const REVIEW_STATUSES = ["script_approval", "team_review", "internal_review", "client_review"];
const CLOSED_STATUSES = ["published", "archived", "content_rejected"];
const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };
const MIN_SAMPLE_FOR_VERDICT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const fmtShortDate = (d) => d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
const humanizeStatus = (s) => (s || "draft").replace(/_/g, " ");

// Stage a history event moved the post into; legacy events without to_stage are inferred from their action
const eventTargetStage = (h) => {
  if (h.to_stage) return h.to_stage;
  if (/^published/i.test(h.action || "")) return "published";
  if (/^approved$|client approved/i.test(h.action || "")) return "approved";
  return null;
};

const toTime = (v) => {
  const t = v ? new Date(v).getTime() : NaN;
  return Number.isNaN(t) ? null : t;
};

// When the post entered its current stage (latest stage move landing on it), else creation
const stageEnteredAt = (p) => {
  const latest = (p.approval_history || [])
    .filter((h) => eventTargetStage(h) === p.status)
    .reduce((max, h) => Math.max(max, toTime(h.timestamp) || 0), 0);
  return latest || toTime(p.created_at) || Date.now();
};

// Report bucket for a raw status (matches the pipeline chart stages)
const stageBucket = (s) => {
  if (["script", "draft", "script_approval", "rejected"].includes(s)) return "Scripting";
  if (s === "designing") return "Designing";
  if (["team_review", "internal_review"].includes(s)) return "Internal QA";
  if (s === "client_review") return "Client Review";
  if (READY_STATUSES.includes(s)) return "Scheduled";
  return null;
};
const TURNAROUND_STAGES = ["Scripting", "Designing", "Internal QA", "Client Review", "Scheduled"];

// Ordered stage timeline for a post: [{ stage, at }] starting at creation
const stageTimeline = (p) => {
  const moves = (p.approval_history || [])
    .map((h) => ({ stage: eventTargetStage(h), from: h.from_stage, at: toTime(h.timestamp) }))
    .filter((m) => m.stage && m.at)
    .sort((a, b) => a.at - b.at);
  const created = toTime(p.created_at);
  if (!created) return moves;
  return [{ stage: moves[0]?.from || "script", at: created }, ...moves.filter((m) => m.at >= created)];
};

const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
const fmtDays = (d) => (d === null || d === undefined ? "—" : d < 1 ? `${Math.max(1, Math.round(d * 24))}h` : `${d.toFixed(1)}d`);

export default function AnalyticsReportsTab({
  selectedClientId = "all",
  clients = [],
  posts = [],
}) {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedPostType, setSelectedPostType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef(null);

  // Selected client details
  const currentClient = useMemo(() => {
    if (selectedClientId === "all") return null;
    return clients.find((c) => String(c.id) === String(selectedClientId)) || null;
  }, [clients, selectedClientId]);

  const clientDisplayName = currentClient
    ? (currentClient.company_name || currentClient.name || currentClient.brand_name || `Client #${selectedClientId}`)
    : "All Client Accounts";

  const isSingleClient = selectedClientId !== "all";

  // Resolve a post's own client name — never fall back to another client's name
  const clientNameFor = (p) => {
    if (p.client_name) return p.client_name;
    const c = clients.find((x) => String(x.id) === String(p.client_profile ?? p.client));
    return c?.company_name || c?.name || c?.brand_name || clientDisplayName;
  };

  // Real posts only — the audit must never show placeholder data
  const basePosts = useMemo(() => (Array.isArray(posts) ? posts : []), [posts]);

  // Scope filters (client / channel / format / priority) — no date window
  const scopePosts = useMemo(() => {
    let result = basePosts;

    // Client filter
    if (selectedClientId !== "all") {
      result = result.filter(
        (p) => String(p.client_profile) === String(selectedClientId) || String(p.client) === String(selectedClientId)
      );
    }

    // Platform filter
    if (selectedPlatform !== "all") {
      result = result.filter((p) => p.platforms && p.platforms.includes(selectedPlatform));
    }

    // Post Type filter
    if (selectedPostType !== "all") {
      result = result.filter((p) => p.post_type === selectedPostType);
    }

    // Priority filter
    if (selectedPriority !== "all") {
      result = result.filter((p) => p.priority === selectedPriority);
    }

    return result;
  }, [basePosts, selectedClientId, selectedPlatform, selectedPostType, selectedPriority]);

  const rangeDays = selectedDateRange === "all" ? null : Number(selectedDateRange) || 30;

  // Scope + date window (undated posts stay in)
  const filteredPosts = useMemo(() => {
    if (!rangeDays) return scopePosts;
    const cutoff = Date.now() - rangeDays * DAY_MS;
    return scopePosts.filter((p) => {
      const t = toTime(p.created_at || p.scheduled_at || p.published_at);
      return t === null || t >= cutoff;
    });
  }, [scopePosts, rangeDays]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    let inProduction = 0;
    let ready = 0;
    let published = 0;
    let scriptApproval = 0;
    let clientReview = 0;
    let rework = 0;

    filteredPosts.forEach((p) => {
      if (p.status === "published") published++;
      else if (READY_STATUSES.includes(p.status)) ready++;
      else if (IN_PRODUCTION_STATUSES.includes(p.status)) {
        inProduction++;
        // Sent back for changes and not yet resubmitted to a reviewer
        if (!REVIEW_STATUSES.includes(p.status) && (p.status === "rejected" || Boolean(p.client_feedback))) rework++;
      }

      if (p.status === "script_approval") scriptApproval++;
      if (p.status === "client_review") clientReview++;
    });

    const delivered = ready + published;
    const totalTracked = inProduction + delivered;
    const deliveryRate = totalTracked > 0 ? Math.round((delivered / totalTracked) * 100) : 0;
    const productionRate = totalTracked > 0 ? Math.round((inProduction / totalTracked) * 100) : 0;

    return {
      inProduction,
      ready,
      published,
      delivered,
      scriptApproval,
      clientReview,
      pendingApproval: scriptApproval + clientReview,
      rework,
      totalTracked,
      deliveryRate,
      productionRate,
    };
  }, [filteredPosts]);

  // Actual date window covered by the report
  const timeframe = useMemo(() => {
    const now = new Date();
    const label = selectedDateRange === "all" ? "All Time" : `Last ${selectedDateRange} Days`;
    let start;
    if (selectedDateRange === "all") {
      const times = filteredPosts
        .map((p) => new Date(p.created_at || p.scheduled_at || p.published_at).getTime())
        .filter((t) => !Number.isNaN(t));
      start = times.length ? new Date(Math.min(...times)) : null;
    } else {
      start = new Date(now.getTime() - Number(selectedDateRange) * DAY_MS);
    }
    const range = start ? `${fmtShortDate(start)} – ${fmtShortDate(now)}` : "No dated items";
    return { label, range, full: `${label} (${range})` };
  }, [filteredPosts, selectedDateRange]);

  // Unique per client scope + minute of generation
  const generatedAt = new Date();
  const pad2 = (n) => String(n).padStart(2, "0");
  const docRef = `AD-REP-${generatedAt.getFullYear()}${pad2(generatedAt.getMonth() + 1)}${pad2(generatedAt.getDate())}-${pad2(generatedAt.getHours())}${pad2(generatedAt.getMinutes())}-${selectedClientId === "all" ? "ALL" : `C${selectedClientId}`}`;

  // Calculate Pipeline Chart Data
  const pipelineData = useMemo(() => {
    const counts = {
      Scripting: 0,
      Designing: 0,
      "Internal QA": 0,
      "Client Review": 0,
      Scheduled: 0,
      Published: 0,
      Rejected: 0,
    };

    filteredPosts.forEach((p) => {
      if (["script", "draft", "script_approval", "rejected"].includes(p.status)) counts["Scripting"]++;
      else if (p.status === "designing") counts["Designing"]++;
      else if (["team_review", "internal_review"].includes(p.status)) counts["Internal QA"]++;
      else if (p.status === "client_review") counts["Client Review"]++;
      else if (READY_STATUSES.includes(p.status)) counts["Scheduled"]++;
      else if (p.status === "published") counts["Published"]++;
      else if (p.status === "content_rejected") counts["Rejected"]++;
    });

    // Only items that sit in a stage (archived excluded) so shares add up to 100%
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return [
      { name: "Scripting", count: counts["Scripting"], percent: Math.round((counts["Scripting"] / total) * 100), color: "#4f46e5", desc: "Concept & copywriting" },
      { name: "Designing", count: counts["Designing"], percent: Math.round((counts["Designing"] / total) * 100), color: "#ec4899", desc: "Creative visual production" },
      { name: "Internal QA", count: counts["Internal QA"], percent: Math.round((counts["Internal QA"] / total) * 100), color: "#f59e0b", desc: "Agency quality assurance" },
      { name: "Client Review", count: counts["Client Review"], percent: Math.round((counts["Client Review"] / total) * 100), color: "#ea580c", desc: "Awaiting stakeholder approval" },
      { name: "Scheduled", count: counts["Scheduled"], percent: Math.round((counts["Scheduled"] / total) * 100), color: "#0ea5e9", desc: "Approved & queue locked" },
      { name: "Published", count: counts["Published"], percent: Math.round((counts["Published"] / total) * 100), color: "#10b981", desc: "Live on target channels" },
      { name: "Rejected", count: counts["Rejected"], percent: Math.round((counts["Rejected"] / total) * 100), color: "#dc2626", desc: "Content dropped by client / team" },
    ];
  }, [filteredPosts]);

  // Calculate Client Volume Leaderboard
  const clientVolume = useMemo(() => {
    const map = {};
    filteredPosts.forEach((p) => {
      if (p.status === "archived") return;
      const clientName = clientNameFor(p);
      if (!map[clientName]) map[clientName] = { active: 0, published: 0, rejected: 0, revisions: 0, total: 0 };

      if (p.status === "published") map[clientName].published++;
      else if (p.status === "content_rejected") map[clientName].rejected++;
      else map[clientName].active++;
      map[clientName].revisions += p.revision_count || 0;

      map[clientName].total++;
    });

    const arr = Object.keys(map).map((k) => ({
      name: k,
      ...map[k],
      rate: map[k].total > 0 ? Math.round((map[k].published / map[k].total) * 100) : 0,
    }));

    return arr.sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filteredPosts, clients, clientDisplayName]);

  // Team output — per person across writer / designer / reviewer roles
  const teamOutput = useMemo(() => {
    const map = {};
    const credit = (details, role, p) => {
      if (!details?.name) return;
      const key = details.id ?? details.name;
      if (!map[key]) map[key] = { name: details.name, roles: new Set(), assigned: 0, delivered: 0, inProgress: 0, revisions: 0 };
      const row = map[key];
      row.roles.add(role);
      row.assigned++;
      if (p.status === "published" || READY_STATUSES.includes(p.status)) row.delivered++;
      else if (IN_PRODUCTION_STATUSES.includes(p.status)) row.inProgress++;
      row.revisions += p.revision_count || 0;
    };

    filteredPosts.forEach((p) => {
      if (p.status === "archived") return;
      credit(p.writer_details, "Writer", p);
      credit(p.designer_details, "Designer", p);
      credit(p.reviewer_details, "Reviewer", p);
    });

    return Object.values(map)
      .map((r) => ({
        ...r,
        roles: [...r.roles].join(", "),
        rate: r.assigned > 0 ? Math.round((r.delivered / r.assigned) * 100) : 0,
        avgRevisions: r.assigned > 0 ? (r.revisions / r.assigned).toFixed(1) : "0.0",
      }))
      .sort((a, b) => b.assigned - a.assigned)
      .slice(0, 12);
  }, [filteredPosts]);

  // Priority watchlist — open items ordered by urgency, overdue first, then longest in stage
  const watchlist = useMemo(() => {
    const now = Date.now();
    return filteredPosts
      .filter((p) => !CLOSED_STATUSES.includes(p.status))
      .map((p) => {
        const scheduled = p.scheduled_at ? new Date(p.scheduled_at).getTime() : null;
        return {
          post: p,
          overdue: Boolean(scheduled && scheduled < now && !READY_STATUSES.includes(p.status)),
          daysInStage: Math.max(0, Math.floor((now - stageEnteredAt(p)) / DAY_MS)),
          rank: PRIORITY_RANK[p.priority] ?? PRIORITY_RANK.medium,
        };
      })
      .sort((a, b) => a.rank - b.rank || Number(b.overdue) - Number(a.overdue) || b.daysInStage - a.daysInStage);
  }, [filteredPosts]);

  const overdueCount = watchlist.filter((w) => w.overdue).length;

  // Turnaround — days per stage (from stage-move history) and end-to-end cycle times
  const turnaround = useMemo(() => {
    const perStage = Object.fromEntries(TURNAROUND_STAGES.map((s) => [s, []]));
    const toApproval = [];
    const toPublish = [];

    filteredPosts.forEach((p) => {
      const tl = stageTimeline(p);
      if (tl.length < 2) return;

      // Total time this post spent in each stage (revision loops add up), closed segments only
      const totals = {};
      for (let i = 0; i < tl.length - 1; i++) {
        const bucket = stageBucket(tl[i].stage);
        const d = (tl[i + 1].at - tl[i].at) / DAY_MS;
        if (bucket && d >= 0) totals[bucket] = (totals[bucket] || 0) + d;
      }
      Object.entries(totals).forEach(([b, d]) => perStage[b]?.push(d));

      const created = tl[0].at;
      const approvedAt = tl.find((m) => READY_STATUSES.includes(m.stage) || m.stage === "published")?.at;
      if (approvedAt) toApproval.push((approvedAt - created) / DAY_MS);
      if (p.status === "published") {
        const publishedAt = toTime(p.published_at) || tl.find((m) => m.stage === "published")?.at;
        if (publishedAt && publishedAt >= created) toPublish.push((publishedAt - created) / DAY_MS);
      }
    });

    const stages = TURNAROUND_STAGES.map((name) => ({ name, avg: avg(perStage[name]), samples: perStage[name].length }));
    const measured = stages.filter((s) => s.samples > 0);
    return {
      stages,
      bottleneck: measured.length ? measured.reduce((a, b) => (b.avg > a.avg ? b : a)) : null,
      approvalAvg: avg(toApproval),
      approvalMedian: median(toApproval),
      approvalSamples: toApproval.length,
      publishAvg: avg(toPublish),
      publishMedian: median(toPublish),
      publishSamples: toPublish.length,
    };
  }, [filteredPosts]);

  // Current window vs the window before it, counted by when each event happened
  const periodComparison = useMemo(() => {
    if (!rangeDays) return null;
    const now = Date.now();
    const span = rangeDays * DAY_MS;
    const tally = (from, to) => {
      const inWin = (t) => t !== null && t >= from && t < to;
      const r = { created: 0, approved: 0, published: 0, revisions: 0 };
      scopePosts.forEach((p) => {
        const hist = p.approval_history || [];
        if (inWin(toTime(p.created_at))) r.created++;
        if (inWin(toTime(p.published_at))) r.published++;
        if (hist.some((h) => READY_STATUSES.includes(eventTargetStage(h)) && inWin(toTime(h.timestamp)))) r.approved++;
        r.revisions += hist.filter((h) => h.event_type === "revision" && inWin(toTime(h.timestamp))).length;
      });
      return r;
    };
    const cur = tally(now - span, now + 1);
    const prev = tally(now - 2 * span, now - span);
    return [
      { label: "New briefs", cur: cur.created, prev: prev.created, upIsGood: true },
      { label: "Approved / scheduled", cur: cur.approved, prev: prev.approved, upIsGood: true },
      { label: "Published", cur: cur.published, prev: prev.published, upIsGood: true },
      { label: "Revision requests", cur: cur.revisions, prev: prev.revisions, upIsGood: false },
    ];
  }, [scopePosts, rangeDays]);

  // Next 7 days of scheduled content (forward-looking, so ignores the history window)
  const upcoming = useMemo(() => {
    const now = Date.now();
    const end = now + 7 * DAY_MS;
    return scopePosts
      .filter((p) => !CLOSED_STATUSES.includes(p.status))
      .map((p) => ({ post: p, at: toTime(p.scheduled_at), ready: READY_STATUSES.includes(p.status) }))
      .filter((u) => u.at && u.at >= now && u.at <= end)
      .sort((a, b) => a.at - b.at);
  }, [scopePosts]);

  // Revision loops & rejections (from post counters + structured audit events)
  const quality = useMemo(() => {
    const STAGE_SOURCE = { script_approval: "Script Approval", team_review: "Team QA", internal_review: "Team QA", client_review: "Client Review" };
    // Events logged before structured tracking existed are recognised by their action text
    const isLegacyRevision = (h) =>
      (!h.event_type || h.event_type === "transition") && /reject|changes|rework requested/i.test(h.action || "") && !/restor/i.test(h.action || "");

    let revisionLoops = 0;
    let clientRevisions = 0;
    const reasonCounts = {};
    const rejectionReasonCounts = {};
    const sourceCounts = { "Script Approval": 0, "Team QA": 0, "Client Review": 0 };

    filteredPosts.forEach((p) => {
      const history = p.approval_history || [];
      const revEvents = history.filter((h) => h.event_type === "revision" || isLegacyRevision(h));
      revisionLoops += Math.max(p.revision_count || 0, revEvents.length);
      clientRevisions += Math.max(
        p.client_revision_count || 0,
        revEvents.filter((h) => h.from_stage === "client_review" || /client/i.test(h.action || "")).length
      );
      revEvents.forEach((h) => {
        const src = STAGE_SOURCE[h.from_stage] || (/client/i.test(h.action || "") ? "Client Review" : /script/i.test(h.action || "") ? "Script Approval" : "Team QA");
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
        (h.reason_categories || []).forEach((c) => (reasonCounts[c] = (reasonCounts[c] || 0) + 1));
      });
      history
        .filter((h) => h.event_type === "rejection")
        .forEach((h) => (h.reason_categories || []).forEach((c) => (rejectionReasonCounts[c] = (rejectionReasonCounts[c] || 0) + 1)));
    });

    const rejected = filteredPosts
      .filter((p) => p.status === "content_rejected" || p.rejected_at)
      .map((p) => ({
        id: p.id,
        title: p.title || (p.primary_caption || "").slice(0, 45) || "Content Asset",
        client: clientNameFor(p),
        format: p.post_type,
        by: p.rejected_by === "internal" ? "Internal" : "Client",
        stage: p.rejected_from_stage ? p.rejected_from_stage.replace(/_/g, " ") : "—",
        reason: p.rejection_reason || "—",
        categories: p.rejection_categories || [],
        outcome: p.status === "content_rejected" ? "Dropped" : "Restarted",
        date: p.rejected_at,
      }))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const delivered = filteredPosts.filter((p) => ["approved", "scheduled", "published"].includes(p.status));
    const firstTimeRight = delivered.filter((p) => !(p.revision_count > 0)).length;
    const toList = (obj) => Object.entries(obj).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    return {
      revisionLoops,
      clientRevisions,
      internalRevisions: Math.max(revisionLoops - clientRevisions, 0),
      rejectedCount: rejected.length,
      droppedCount: rejected.filter((r) => r.outcome === "Dropped").length,
      clientRejected: rejected.filter((r) => r.by === "Client").length,
      deliveredCount: delivered.length,
      firstTimeRightRate: delivered.length ? Math.round((firstTimeRight / delivered.length) * 100) : null,
      avgRevisions: delivered.length ? (delivered.reduce((a, p) => a + (p.revision_count || 0), 0) / delivered.length).toFixed(1) : "0.0",
      reasons: toList(reasonCounts),
      rejectionReasons: toList(rejectionReasonCounts),
      sources: toList(sourceCounts),
      rejected,
      mostRevised: [...filteredPosts]
        .filter((p) => (p.revision_count || 0) > 0)
        .sort((a, b) => (b.revision_count || 0) - (a.revision_count || 0))
        .slice(0, 5),
    };
  }, [filteredPosts, clients, clientDisplayName]);

  // Published content performance (manually tracked per-post analytics)
  const performance = useMemo(() => {
    const published = filteredPosts.filter((p) => p.status === "published" || p.status === "archived");
    const rows = published.map((p) => {
      const a = p.analytics || {};
      const likes = Number(a.likes) || 0;
      const comments = Number(a.comments) || 0;
      const shares = Number(a.shares) || 0;
      const reach = Number(a.reach) || 0;
      const engagement = likes + comments + shares;
      return {
        id: p.id,
        title: p.title || (p.primary_caption || "").slice(0, 45) || "Content Asset",
        client: clientNameFor(p),
        format: p.post_type,
        platforms: (p.platforms || []).join(", "),
        likes,
        comments,
        shares,
        reach,
        engagement,
        rate: reach > 0 ? ((engagement / reach) * 100).toFixed(1) : null,
        tracked: likes + comments + shares + reach > 0,
        publishedAt: p.published_at,
      };
    });
    const tracked = rows.filter((r) => r.tracked);
    const sum = (k) => tracked.reduce((acc, r) => acc + r[k], 0);
    const totalReach = sum("reach");
    const totalEngagement = sum("engagement");
    return {
      publishedCount: rows.length,
      trackedCount: tracked.length,
      totalReach,
      totalEngagement,
      likes: sum("likes"),
      comments: sum("comments"),
      shares: sum("shares"),
      engagementRate: totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : null,
      top: [...tracked].sort((a, b) => b.engagement - a.engagement).slice(0, 8),
      untracked: rows.filter((r) => !r.tracked).length,
    };
  }, [filteredPosts, clients, clientDisplayName]);

  // Operational Diagnosis Insight
  const healthDiagnosis = useMemo(() => {
    if (kpis.rework > 0 || overdueCount > 0) {
      const parts = [];
      if (kpis.rework > 0) parts.push(`${kpis.rework} item(s) were sent back for changes and are awaiting rework`);
      if (overdueCount > 0) parts.push(`${overdueCount} item(s) are past their scheduled date without approval`);
      return {
        status: "Action Required",
        color: "#ef4444",
        bg: "#fef2f2",
        border: "#fecaca",
        message: `${parts.join("; ")}.`,
      };
    }
    if (quality.deliveredCount >= 3 && quality.firstTimeRightRate !== null && quality.firstTimeRightRate < 50) {
      return {
        status: "High Revision Rate",
        color: "#ea580c",
        bg: "#fff7ed",
        border: "#fed7aa",
        message: `Only ${quality.firstTimeRightRate}% of delivered posts were approved without revisions (avg ${quality.avgRevisions} rounds). Top cause: ${quality.reasons[0]?.name || "uncategorised feedback"}.`,
      };
    }
    if (kpis.pendingApproval > 0) {
      return {
        status: "Approval Queue Active",
        color: "#ea580c",
        bg: "#fff7ed",
        border: "#fed7aa",
        message: `${kpis.pendingApproval} post(s) awaiting sign-off (${kpis.scriptApproval} script approval, ${kpis.clientReview} client review).`,
      };
    }
    if (kpis.totalTracked < MIN_SAMPLE_FOR_VERDICT) {
      return {
        status: "Limited Data",
        color: "#475569",
        bg: "#f8fafc",
        border: "#cbd5e1",
        message: `Only ${kpis.totalTracked} item(s) in scope — too few for a reliable velocity assessment.`,
      };
    }
    if (kpis.deliveryRate < 40) {
      return {
        status: "Delivery Behind Pipeline",
        color: "#ea580c",
        bg: "#fff7ed",
        border: "#fed7aa",
        message: "Most content is still in production. Prioritise moving designed items through review to scheduling.",
      };
    }
    return {
      status: "On Track",
      color: "#4f46e5",
      bg: "#eef2ff",
      border: "#c7d2fe",
      message: "Content is moving through creative, review and scheduling without open blockers.",
    };
  }, [kpis, quality, overdueCount]);

  // Recommended next steps — generated from the blockers found above, most urgent first
  const nextSteps = useMemo(() => {
    const steps = [];
    const titleOf = (p) => p.title || (p.primary_caption || "").slice(0, 40) || "Untitled post";
    const names = (items) =>
      items.slice(0, 3).map((w) => `“${titleOf(w.post)}”`).join(", ") + (items.length > 3 ? ` +${items.length - 3} more` : "");

    const overdue = watchlist.filter((w) => w.overdue);
    if (overdue.length) steps.push({ tone: "#dc2626", text: `Expedite ${overdue.length} overdue item(s) past their scheduled date: ${names(overdue)}.` });

    const atRisk = upcoming.filter((u) => !u.ready);
    if (atRisk.length) steps.push({ tone: "#dc2626", text: `${atRisk.length} post(s) go live in the next 7 days but are still in production: ${names(atRisk)}.` });

    if (kpis.rework) steps.push({ tone: "#ea580c", text: `Complete rework on ${kpis.rework} item(s) sent back for changes and resubmit them for review.` });

    const waitingClient = watchlist.filter((w) => w.post.status === "client_review" && w.daysInStage >= 3);
    if (waitingClient.length) steps.push({ tone: "#ea580c", text: `Follow up with the client on ${waitingClient.length} item(s) waiting 3+ days for review: ${names(waitingClient)}.` });

    const idle = watchlist.filter((w) => w.post.status !== "client_review" && w.daysInStage >= 5);
    if (idle.length) {
      const byStage = idle.reduce((m, w) => {
        const s = stageBucket(w.post.status) || humanizeStatus(w.post.status);
        m[s] = (m[s] || 0) + 1;
        return m;
      }, {});
      const desc = Object.entries(byStage).map(([s, n]) => `${n} in ${s}`).join(", ");
      steps.push({ tone: "#ea580c", text: `Unblock ${idle.length} item(s) idle for 5+ days (${desc}). Owners are listed in the watchlist.` });
    }

    if (turnaround.bottleneck && turnaround.bottleneck.avg >= 2) {
      steps.push({ tone: "#4f46e5", text: `${turnaround.bottleneck.name} is the slowest stage (avg ${fmtDays(turnaround.bottleneck.avg)} per post). Review capacity or hand-offs there.` });
    }

    const topReason = quality.reasons[0];
    if (topReason && topReason.count >= 2) {
      steps.push({ tone: "#4f46e5", text: `Most common revision reason is “${topReason.name}” (${topReason.count}×). Cover it in briefs before production starts.` });
    }

    if (performance.untracked > 0) steps.push({ tone: "#475569", text: `Record analytics for ${performance.untracked} published post(s) so performance reporting is complete.` });

    return steps.slice(0, 5);
  }, [watchlist, upcoming, kpis, turnaround, quality, performance]);

  // Export to Excel (.xls)
  const handleExportExcel = () => {
    const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const table = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Adstra Workflow Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; }
      .header-title { background-color: #0f172a; color: #ffffff; font-size: 16pt; font-weight: bold; padding: 12px; }
      .sub-title { background-color: #f8fafc; color: #475569; font-size: 10pt; padding: 6px; }
      .section-header { background-color: #4f46e5; color: #ffffff; font-weight: bold; font-size: 11pt; }
      .col-header { background-color: #f1f5f9; color: #0f172a; font-weight: bold; font-size: 10pt; }
      .data-cell { padding: 6px; border: 1px solid #e2e8f0; font-size: 9pt; }
      .cell-bold { font-weight: bold; }
      .cell-primary { color: #4f46e5; font-weight: bold; }
      .cell-success { color: #10b981; font-weight: bold; }
    </style>
    </head>
    <body>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><th colspan="6" class="header-title">ADSTRA DIGITAL — WORKFLOW VELOCITY & PRODUCTIVITY REPORT</th></tr>
        <tr><td colspan="6" class="sub-title">Client Scope: ${clientDisplayName} | Generated: ${reportDate} | Platform: ${selectedPlatform.toUpperCase()} | Timeframe: ${timeframe.full} | Ref: ${docRef}</td></tr>
        <tr><td colspan="6"></td></tr>

        <tr><th colspan="6" class="section-header">RECOMMENDED NEXT STEPS</th></tr>
        ${nextSteps.map((s, i) => `<tr><td colspan="6" class="data-cell">${i + 1}. ${esc(s.text)}</td></tr>`).join('') || '<tr><td colspan="6" class="data-cell">No blockers found — keep the current cadence.</td></tr>'}
        <tr><td colspan="6"></td></tr>
        ${periodComparison ? `
        <tr><th colspan="6" class="section-header">PERIOD COMPARISON (vs previous ${rangeDays} days)</th></tr>
        <tr class="col-header"><th colspan="3">Metric</th><th colspan="1">This Period</th><th colspan="1">Previous Period</th><th colspan="1">Change</th></tr>
        ${periodComparison.map(m => `<tr><td colspan="3" class="data-cell cell-bold">${m.label}</td><td class="data-cell" style="text-align: center;">${m.cur}</td><td class="data-cell" style="text-align: center;">${m.prev}</td><td class="data-cell" style="text-align: center;">${m.cur - m.prev > 0 ? "+" : ""}${m.cur - m.prev}</td></tr>`).join('')}
        <tr><td colspan="6"></td></tr>` : ''}

        <tr><th colspan="6" class="section-header">1. EXECUTIVE KPI SUMMARY</th></tr>
        <tr class="col-header">
          <th colspan="2">In Production</th>
          <th colspan="1">Delivered (Published / Scheduled)</th>
          <th colspan="1">Pending Sign-off</th>
          <th colspan="1">Awaiting Rework</th>
          <th colspan="1">Delivery Rate</th>
        </tr>
        <tr>
          <td colspan="2" class="data-cell cell-primary" style="font-size: 14pt; text-align: center;">${kpis.inProduction}</td>
          <td colspan="1" class="data-cell cell-success" style="font-size: 14pt; text-align: center;">${kpis.delivered} (${kpis.published} / ${kpis.ready})</td>
          <td colspan="1" class="data-cell" style="font-size: 14pt; text-align: center; color: #ea580c;">${kpis.pendingApproval}</td>
          <td colspan="1" class="data-cell" style="font-size: 14pt; text-align: center; color: #ef4444;">${kpis.rework}</td>
          <td colspan="1" class="data-cell" style="font-size: 14pt; text-align: center;">${kpis.deliveryRate}%</td>
        </tr>
        <tr><td colspan="6"></td></tr>

        <tr><th colspan="6" class="section-header">2. PIPELINE STAGE DISTRIBUTION</th></tr>
        <tr class="col-header">
          <th colspan="2">Stage Name</th>
          <th colspan="2">Stage Role</th>
          <th colspan="1">Post Count</th>
          <th colspan="1">Share (%)</th>
        </tr>
        ${pipelineData.map(p => `
        <tr>
          <td colspan="2" class="data-cell cell-bold">${p.name}</td>
          <td colspan="2" class="data-cell">${p.desc}</td>
          <td colspan="1" class="data-cell cell-bold" style="text-align: center;">${p.count}</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${p.percent}%</td>
        </tr>`).join('')}
        <tr><td colspan="6"></td></tr>

        ${isSingleClient ? "" : `
        <tr><th colspan="6" class="section-header">3. CLIENT WORKLOAD BREAKDOWN</th></tr>
        <tr class="col-header">
          <th colspan="2">Client Name</th>
          <th colspan="1">Active Posts</th>
          <th colspan="1">Published Posts</th>
          <th colspan="1">Total Volume</th>
          <th colspan="1">Completion Rate</th>
        </tr>
        ${clientVolume.map(c => `
        <tr>
          <td colspan="2" class="data-cell cell-bold">${esc(c.name)}</td>
          <td colspan="1" class="data-cell cell-primary" style="text-align: center;">${c.active}</td>
          <td colspan="1" class="data-cell cell-success" style="text-align: center;">${c.published}</td>
          <td colspan="1" class="data-cell cell-bold" style="text-align: center;">${c.total}</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${c.rate}%</td>
        </tr>`).join('')}
        <tr><td colspan="6"></td></tr>`}

        <tr><th colspan="6" class="section-header">${isSingleClient ? "3" : "3b"}. TEAM OUTPUT</th></tr>
        <tr class="col-header">
          <th colspan="2">Team Member (Roles)</th>
          <th colspan="1">Assigned</th>
          <th colspan="1">Delivered</th>
          <th colspan="1">Avg Revisions</th>
          <th colspan="1">Delivery Rate</th>
        </tr>
        ${teamOutput.map(t => `
        <tr>
          <td colspan="2" class="data-cell cell-bold">${esc(t.name)} (${esc(t.roles)})</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${t.assigned}</td>
          <td colspan="1" class="data-cell cell-success" style="text-align: center;">${t.delivered}</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${t.avgRevisions}</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${t.rate}%</td>
        </tr>`).join('') || '<tr><td colspan="6" class="data-cell">No writer / designer / reviewer assigned on posts in this scope.</td></tr>'}
        <tr><td colspan="6"></td></tr>

        <tr><th colspan="6" class="section-header">4. REVISION LOOPS & REJECTIONS</th></tr>
        <tr class="col-header">
          <th colspan="2">Revision Loops (Client / Internal)</th>
          <th colspan="1">First-Time Right</th>
          <th colspan="1">Avg Rounds / Post</th>
          <th colspan="1">Rejected Content</th>
          <th colspan="1">Rejected by Client</th>
        </tr>
        <tr>
          <td colspan="2" class="data-cell cell-bold" style="text-align: center;">${quality.revisionLoops} (${quality.clientRevisions} / ${quality.internalRevisions})</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${quality.firstTimeRightRate === null ? "-" : quality.firstTimeRightRate + "%"}</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${quality.avgRevisions}</td>
          <td colspan="1" class="data-cell" style="text-align: center; color: #dc2626;">${quality.rejectedCount}</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${quality.clientRejected}</td>
        </tr>
        <tr class="col-header"><th colspan="4">Revision Reason</th><th colspan="2">Occurrences</th></tr>
        ${quality.reasons.map(r => `<tr><td colspan="4" class="data-cell">${esc(r.name)}</td><td colspan="2" class="data-cell cell-bold" style="text-align: center;">${r.count}</td></tr>`).join('') || '<tr><td colspan="6" class="data-cell">No categorised revision feedback.</td></tr>'}
        <tr class="col-header">
          <th colspan="1">Date</th>
          <th colspan="1">Client</th>
          <th colspan="1">Content</th>
          <th colspan="1">Rejected By / Stage</th>
          <th colspan="1">Reason</th>
          <th colspan="1">Outcome</th>
        </tr>
        ${quality.rejected.map(r => `
        <tr>
          <td class="data-cell">${r.date ? new Date(r.date).toLocaleDateString("en-US") : "-"}</td>
          <td class="data-cell cell-bold">${esc(r.client)}</td>
          <td class="data-cell">${esc(r.title)} (${esc(r.format || "")})</td>
          <td class="data-cell">${r.by} @ ${esc(r.stage)}</td>
          <td class="data-cell">${esc(r.categories.join(", "))}${r.categories.length ? " — " : ""}${esc(r.reason)}</td>
          <td class="data-cell cell-bold">${r.outcome}</td>
        </tr>`).join('') || '<tr><td colspan="6" class="data-cell">No content rejected entirely.</td></tr>'}
        <tr><td colspan="6"></td></tr>

        <tr><th colspan="6" class="section-header">5. PUBLISHED CONTENT PERFORMANCE</th></tr>
        <tr class="col-header">
          <th colspan="2">Content</th>
          <th colspan="1">Reach</th>
          <th colspan="1">Likes</th>
          <th colspan="1">Comments + Shares</th>
          <th colspan="1">Engagement Rate</th>
        </tr>
        ${performance.top.map(r => `
        <tr>
          <td colspan="2" class="data-cell cell-bold">${esc(r.title)} — ${esc(r.client)}</td>
          <td class="data-cell" style="text-align: center;">${r.reach}</td>
          <td class="data-cell" style="text-align: center;">${r.likes}</td>
          <td class="data-cell" style="text-align: center;">${r.comments + r.shares}</td>
          <td class="data-cell" style="text-align: center;">${r.rate === null ? "-" : r.rate + "%"}</td>
        </tr>`).join('') || '<tr><td colspan="6" class="data-cell">No post analytics recorded.</td></tr>'}
        <tr>
          <td colspan="2" class="data-cell cell-bold">TOTAL (${performance.trackedCount} tracked posts)</td>
          <td class="data-cell cell-bold" style="text-align: center;">${performance.totalReach}</td>
          <td class="data-cell cell-bold" style="text-align: center;">${performance.likes}</td>
          <td class="data-cell cell-bold" style="text-align: center;">${performance.comments + performance.shares}</td>
          <td class="data-cell cell-bold" style="text-align: center;">${performance.engagementRate === null ? "-" : performance.engagementRate + "%"}</td>
        </tr>
        <tr><td colspan="6"></td></tr>

        <tr><th colspan="6" class="section-header">6. TURNAROUND TIME & UPCOMING SCHEDULE</th></tr>
        <tr class="col-header"><th colspan="2">Cycle</th><th colspan="1">Average</th><th colspan="1">Median</th><th colspan="2">Posts Measured</th></tr>
        <tr><td colspan="2" class="data-cell cell-bold">Brief → Approved</td><td class="data-cell" style="text-align: center;">${fmtDays(turnaround.approvalAvg)}</td><td class="data-cell" style="text-align: center;">${fmtDays(turnaround.approvalMedian)}</td><td colspan="2" class="data-cell" style="text-align: center;">${turnaround.approvalSamples}</td></tr>
        <tr><td colspan="2" class="data-cell cell-bold">Brief → Published</td><td class="data-cell" style="text-align: center;">${fmtDays(turnaround.publishAvg)}</td><td class="data-cell" style="text-align: center;">${fmtDays(turnaround.publishMedian)}</td><td colspan="2" class="data-cell" style="text-align: center;">${turnaround.publishSamples}</td></tr>
        <tr class="col-header"><th colspan="4">Stage</th><th colspan="1">Avg Time in Stage</th><th colspan="1">Posts Measured</th></tr>
        ${turnaround.stages.map(s => `<tr><td colspan="4" class="data-cell cell-bold">${s.name}${turnaround.bottleneck?.name === s.name ? " (slowest)" : ""}</td><td class="data-cell" style="text-align: center;">${fmtDays(s.avg)}</td><td class="data-cell" style="text-align: center;">${s.samples}</td></tr>`).join('')}
        <tr><td colspan="6" class="data-cell cell-bold" style="color: #dc2626;">Overdue items: ${overdueCount}</td></tr>
        <tr class="col-header"><th colspan="1">Scheduled For</th><th colspan="1">Client</th><th colspan="2">Content</th><th colspan="1">Stage</th><th colspan="1">Readiness</th></tr>
        ${upcoming.map(u => `<tr><td class="data-cell">${new Date(u.at).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td><td class="data-cell cell-bold">${esc(clientNameFor(u.post))}</td><td colspan="2" class="data-cell">${esc(u.post.title || (u.post.primary_caption || "").slice(0, 45) || "Content Asset")}</td><td class="data-cell">${esc(humanizeStatus(u.post.status))}</td><td class="data-cell cell-bold" style="color: ${u.ready ? "#059669" : "#dc2626"};">${u.ready ? "Ready" : "At risk"}</td></tr>`).join('') || '<tr><td colspan="6" class="data-cell">Nothing scheduled in the next 7 days.</td></tr>'}
      </table>
    </body>
    </html>
    `;

    const blob = new Blob([table], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Adstra_Workflow_Report_${clientDisplayName.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF via Native Browser Print
  const handleExportPDF = () => {
    const originalTitle = document.title;
    const clientSanitized = clientDisplayName.replace(/[^a-z0-9]/gi, "_");
    const dateStr = new Date().toISOString().split("T")[0];
    document.title = `Adstra_Workflow_Report_${clientSanitized}_${dateStr}`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1200);
  };

  // Direct PDF Download — paginated A4 clone of the visible report container
  const handleDirectDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById("executive-report-document");
      if (!element) {
        handleExportPDF();
        return;
      }

      const clientSanitized = clientDisplayName.replace(/[^a-z0-9]/gi, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      await downloadElementAsPdf(element, { filename: `Adstra_Workflow_Report_${clientSanitized}_${dateStr}.pdf`, marginMm: 10 });
    } catch (err) {
      console.warn("Direct PDF generation failed, falling back to window.print():", err);
      handleExportPDF();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const currentTimeFormatted = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="analytics-dashboard-root" style={{ width: "100%", paddingBottom: 40 }}>
      {/* Styles for Screen and Print */}
      <style>{`
        .analytics-dashboard-root {
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
          color: #0f172a;
        }

        .filter-select {
          padding: 8px 14px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 0.82rem;
          font-weight: 600;
          background: #ffffff;
          color: #1e293b;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
        }

        .filter-select:hover {
          border-color: #4f46e5;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 16px;
          border-radius: 11px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn-action:hover {
          transform: translateY(-1px);
        }

        .btn-primary-gradient {
          background: #0f172a;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }

        .btn-primary-gradient:hover {
          background: #1e293b;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
        }

        .btn-secondary {
          background: #ffffff;
          color: #334155;
          border-color: #cbd5e1;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        /* Executive Formal Document Container - ALWAYS VISIBLE */
        .executive-document {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06);
          padding: 36px 40px;
          max-width: 1050px;
          margin: 0 auto;
        }

        .report-param-strip {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .report-kpi-matrix {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 900px) {
          .report-param-strip {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .report-kpi-matrix {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .report-param-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .report-kpi-matrix {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* --- PRINT MEDIA STYLES (Strict A4 Layout) --- */
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
          }

          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
            line-height: 1.35 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: auto !important;
            height: auto !important;
          }

          /* Hide UI Chrome */
          .no-print,
          .no-print *,
          .social-header-bar,
          .social-nav-tabs,
          nav,
          header,
          aside,
          .sidebar,
          .dashboard-controls,
          .filter-select,
          .btn-action,
          .cr-toolbar,
          .cr-graph-tabs,
          button {
            display: none !important;
          }

          .social-mgmt-container {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            min-height: auto !important;
            height: auto !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Document Fills Page Cleanly in Print */
          .analytics-dashboard-root {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          #executive-report-document,
          #executive-report-document *,
          #campaign-report-document,
          #campaign-report-document * {
            visibility: visible !important;
          }

          .executive-document {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: #ffffff !important;
          }

          .print-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .report-param-strip {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }

          .report-kpi-matrix {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
      `}</style>

      {/* Top Header & Toolbar (Hidden during Print) */}
      <div className="dashboard-controls no-print" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
                Workflow Velocity & Productivity Report
              </h3>
              <span style={{ fontSize: "0.72rem", background: "#e0e7ff", color: "#4338ca", padding: "3px 8px", borderRadius: 8, fontWeight: 700 }}>
                Operations CRM
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
              Track content production velocity, pipeline throughput, and team output for{" "}
              <strong style={{ color: "#0f172a" }}>{clientDisplayName}</strong>.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Export to Excel */}
            <button onClick={handleExportExcel} className="btn-action btn-secondary" title="Export formatted spreadsheet">
              <FileSpreadsheet size={15} color="#10b981" /> Export Excel
            </button>

            {/* Direct PDF Download */}
            <button
              onClick={handleDirectDownloadPDF}
              className="btn-action btn-secondary"
              disabled={isGeneratingPdf}
              title="Download PDF directly"
            >
              <Download size={15} color="#4f46e5" /> {isGeneratingPdf ? "Generating PDF..." : "Download PDF"}
            </button>

            {/* Print / Save as PDF */}
            <button onClick={handleExportPDF} className="btn-action btn-primary-gradient" title="Open Print Preview to Save as PDF">
              <Printer size={15} /> Print Report
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 16,
            padding: "12px 18px",
            background: "#ffffff",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: "0.8rem", fontWeight: 700, marginRight: 4 }}>
            <Filter size={14} /> Scope Filters:
          </div>

          <select value={selectedDateRange} onChange={(e) => setSelectedDateRange(e.target.value)} className="filter-select">
            <option value="all">All Time History</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>

          <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="filter-select">
            <option value="all">All Channels</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">X / Twitter</option>
            <option value="tiktok">TikTok</option>
          </select>

          <select value={selectedPostType} onChange={(e) => setSelectedPostType(e.target.value)} className="filter-select">
            <option value="all">All Content Formats</option>
            <option value="image">Image / Graphic</option>
            <option value="video">Video</option>
            <option value="carousel">Carousel</option>
            <option value="reel">Reel / Short</option>
            <option value="text">Text Post</option>
          </select>

          <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="filter-select">
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div style={{ marginLeft: "auto", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
            Auditing <strong style={{ color: "#0f172a" }}>{filteredPosts.length}</strong> content post{filteredPosts.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* THE FORMAL EXECUTIVE REPORT DOCUMENT
          Always rendered and 100% visible on screen & print, ensuring html2pdf and window.print never produce blank pages! */}
      <div id="executive-report-document" ref={reportRef} className="executive-document">
        {/* REPORT HEADER / LETTERHEAD */}
        <div style={{ borderBottom: "2px solid #0f172a", paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            {/* Left: Brand Identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img
                src="/assets/logo_new-01.png"
                alt="Adstra Digital Logo"
                style={{ maxHeight: 48, maxWidth: 200, objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>
                  ADSTRA DIGITAL
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Content Operations & Social Media Productivity Audit
                </div>
              </div>
            </div>

            {/* Right: Official Metadata */}
            <div style={{ textAlign: "right", flexShrink: 0, whiteSpace: "nowrap" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 4,
                  letterSpacing: "0.8px",
                  marginBottom: 6,
                }}
              >
                OFFICIAL OPERATIONS AUDIT
              </div>
              <div style={{ fontSize: "0.75rem", color: "#334155", fontWeight: 600 }}>
                Doc Ref: <strong style={{ color: "#0f172a" }}>{docRef}</strong>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                Generated: {currentDateFormatted}, {currentTimeFormatted}
              </div>
            </div>
          </div>
        </div>

        {/* DOCUMENT TITLE & SCOPE DESCRIPTION */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.5px" }}>
            EXECUTIVE CONTENT WORKFLOW & PRODUCTIVITY REPORT
          </h2>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569", lineHeight: 1.4 }}>
            Comprehensive performance audit across scriptwriting, creative design, QA review, client approvals, and omnichannel publication.
          </p>
        </div>

        {/* AUDIT PARAMETERS STRIP */}
        <div
          className="report-param-strip print-break-inside-avoid"
          style={{
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>CLIENT SCOPE</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{clientDisplayName}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>TIMEFRAME</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{timeframe.label}</div>
            <div style={{ fontSize: "0.66rem", color: "#64748b", marginTop: 1 }}>{timeframe.range}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>TARGET CHANNELS</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", marginTop: 2, textTransform: "capitalize" }}>
              {selectedPlatform === "all" ? "All Channels" : selectedPlatform}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>CONTENT FORMAT</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", marginTop: 2, textTransform: "capitalize" }}>
              {selectedPostType === "all" ? "All Formats" : selectedPostType}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>ITEMS AUDITED</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 900, color: "#4f46e5", marginTop: 2 }}>
              {filteredPosts.length} Content Posts
            </div>
          </div>
        </div>

        {/* EXECUTIVE KPI MATRIX (4 Boxes) */}
        <div
          className="report-kpi-matrix print-break-inside-avoid"
          style={{
            marginBottom: 20,
          }}
        >
          {/* In Production */}
          <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "12px 14px", background: "#ffffff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              IN PRODUCTION
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", margin: "3px 0" }}>
              {kpis.inProduction}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
              Script → client review ({kpis.productionRate}% of pipeline)
            </div>
          </div>

          {/* Delivered */}
          <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "12px 14px", background: "#ffffff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#047857", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              DELIVERED
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#059669", margin: "3px 0" }}>
              {kpis.delivered}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#047857" }}>
              {kpis.published} published • {kpis.ready} scheduled • {kpis.deliveryRate}% delivery rate
            </div>
          </div>

          {/* Pending Sign-off */}
          <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "12px 14px", background: "#ffffff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              PENDING SIGN-OFF
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#ea580c", margin: "3px 0" }}>
              {kpis.pendingApproval}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#c2410c" }}>
              {kpis.scriptApproval} script approval • {kpis.clientReview} client review
            </div>
          </div>

          {/* Awaiting Rework */}
          <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "12px 14px", background: "#ffffff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              AWAITING REWORK
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#dc2626", margin: "3px 0" }}>
              {kpis.rework}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#b91c1c" }}>
              Sent back for changes, not yet resubmitted
            </div>
          </div>
        </div>

        {/* PERIOD COMPARISON — only for a fixed 7/30/90-day window */}
        {periodComparison ? (
          <div
            className="report-kpi-matrix print-break-inside-avoid"
            style={{ marginTop: -8, marginBottom: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px" }}
          >
            {periodComparison.map((m) => {
              const delta = m.cur - m.prev;
              const good = delta === 0 ? null : (delta > 0) === m.upIsGood;
              return (
                <div key={m.label}>
                  <div style={{ fontSize: "0.64rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{m.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a" }}>{m.cur}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: good === null ? "#64748b" : good ? "#059669" : "#dc2626" }}>
                      {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {delta > 0 ? "+" : ""}{delta}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "#94a3b8" }}>vs {m.prev} in previous {rangeDays} days</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-print" style={{ marginTop: -8, marginBottom: 16, fontSize: "0.72rem", color: "#94a3b8" }}>
            Select a 7, 30 or 90-day timeframe to compare against the previous period.
          </div>
        )}

        {/* EXECUTIVE ASSESSMENT & HEALTH NOTE */}
        <div
          className="print-break-inside-avoid"
          style={{
            background: healthDiagnosis.bg,
            borderTop: `1px solid ${healthDiagnosis.border}`,
            borderRight: `1px solid ${healthDiagnosis.border}`,
            borderBottom: `1px solid ${healthDiagnosis.border}`,
            borderLeft: `4px solid ${healthDiagnosis.color}`,
            padding: "12px 18px",
            borderRadius: "0 8px 8px 0",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 900, color: healthDiagnosis.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            OPERATIONAL HEALTH ASSESSMENT: {healthDiagnosis.status}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#1e293b", marginTop: 3, fontWeight: 500 }}>
            {healthDiagnosis.message} Delivery rate is <strong>{kpis.deliveryRate}%</strong> ({kpis.delivered} of {kpis.totalTracked}) with{" "}
            <strong>{kpis.inProduction}</strong> item(s) still in production.
          </div>
        </div>

        {/* RECOMMENDED NEXT STEPS */}
        <div className="print-break-inside-avoid" style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Recommended Next Steps
          </div>
          {nextSteps.length === 0 ? (
            <div style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 600 }}>No blockers found — keep the current cadence.</div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
              {nextSteps.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: "0.8rem", color: "#1e293b", padding: "4px 0", lineHeight: 1.45 }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: s.tone,
                      color: "#ffffff",
                      fontSize: "0.66rem",
                      fontWeight: 800,
                      lineHeight: "18px",
                      textAlign: "center",
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{s.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* SECTION 1: WORKFLOW STAGE PROGRESS & DISTRIBUTION */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              1. Pipeline Stage Distribution & Throughput
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>All 7 Stages Tracked</span>
          </div>

          {/* Interactive Bar Chart for Screen */}
          <div className="no-print" style={{ width: "100%", height: 220, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    borderRadius: "10px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff", fontWeight: 700 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Print-Safe CSS Segmented Stacked Bar (Renders in PDF & Print) */}
          <div
            style={{
              height: 20,
              width: "100%",
              display: "flex",
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              marginBottom: 12,
              background: "#f1f5f9",
            }}
          >
            {pipelineData.map((stage) => {
              if (stage.count === 0) return null;
              return (
                <div
                  key={stage.name}
                  style={{
                    // Width proportional to count so segments always total 100%
                    flex: `${stage.count} 1 0`,
                    minWidth: 30,
                    background: stage.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    lineHeight: "18px",
                  }}
                  title={`${stage.name}: ${stage.count} (${stage.percent}%)`}
                >
                  {stage.percent}%
                </div>
              );
            })}
          </div>

          {/* Stage Data Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Workflow Stage</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Stage Role / Scope</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Item Count</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Share of Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {pipelineData.map((stage) => (
                <tr key={stage.name} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "7px 10px", fontWeight: 700, color: "#0f172a" }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: stage.color, marginRight: 8 }}></span>
                    {stage.name}
                  </td>
                  <td style={{ padding: "7px 10px", color: "#64748b" }}>{stage.desc}</td>
                  <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: "#0f172a" }}>{stage.count}</td>
                  <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, color: "#334155" }}>{stage.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 2: CLIENT WORKLOAD (all clients) + TEAM OUTPUT */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              {isSingleClient ? "2. Team Output & Productivity" : "2. Client Workload & Team Output"}
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Ranked by volume</span>
          </div>

          {!isSingleClient && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800, width: 40 }}>#</th>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Client / Brand Account</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>In Production</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Published & Live</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Revisions</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Rejected</th>
                <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Total Posts</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Delivery Rate</th>
              </tr>
            </thead>
            <tbody>
              {clientVolume.map((client, idx) => (
                <tr key={client.name} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 800, color: "#64748b" }}>{idx + 1}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 800, color: "#0f172a" }}>{client.name}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#4f46e5" }}>{client.active}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#059669" }}>{client.published}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#ea580c" }}>{client.revisions}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: client.rejected ? "#dc2626" : "#94a3b8" }}>{client.rejected}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 900, color: "#0f172a" }}>{client.total}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800, color: client.rate >= 50 ? "#059669" : "#0f172a" }}>
                    {client.rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}

          {/* Team output — per writer / designer / reviewer */}
          {!isSingleClient && (
            <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", margin: "14px 0 6px" }}>Team output</div>
          )}
          {teamOutput.length === 0 ? (
            <div style={{ fontSize: "0.76rem", color: "#94a3b8", padding: "8px 0" }}>
              No writer, designer or reviewer is assigned on posts in this scope yet.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Team Member</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Roles</th>
                  <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Assigned</th>
                  <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>In Progress</th>
                  <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Delivered</th>
                  <th style={{ textAlign: "center", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Avg Revisions</th>
                  <th style={{ textAlign: "right", padding: "8px 10px", color: "#334155", fontWeight: 800 }}>Delivery Rate</th>
                </tr>
              </thead>
              <tbody>
                {teamOutput.map((t, idx) => (
                  <tr key={`${t.name}-${idx}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 800, color: "#0f172a" }}>{t.name}</td>
                    <td style={{ padding: "8px 10px", color: "#64748b" }}>{t.roles}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 900, color: "#0f172a" }}>{t.assigned}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#4f46e5" }}>{t.inProgress}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#059669" }}>{t.delivered}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: Number(t.avgRevisions) >= 2 ? "#dc2626" : "#ea580c" }}>{t.avgRevisions}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800, color: t.rate >= 50 ? "#059669" : "#0f172a" }}>{t.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* SECTION 3: PRIORITY WATCHLIST (open items only) */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              3. Priority Watchlist
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
              {Math.min(watchlist.length, 10)} of {watchlist.length} open item{watchlist.length === 1 ? "" : "s"} • priority → overdue → longest in stage
            </span>
          </div>

          {watchlist.length === 0 ? (
            <div style={{ fontSize: "0.76rem", color: "#94a3b8", padding: "8px 0" }}>No open items — everything in scope is published, archived or dropped.</div>
          ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                <th style={{ textAlign: "left", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Client Account</th>
                <th style={{ textAlign: "left", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Topic / Caption Snippet</th>
                <th style={{ textAlign: "center", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Format</th>
                <th style={{ textAlign: "center", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Current Stage</th>
                <th style={{ textAlign: "center", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Days in Stage</th>
                <th style={{ textAlign: "center", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Priority</th>
                <th style={{ textAlign: "right", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.slice(0, 10).map(({ post, overdue, daysInStage }, idx) => {
                const postTitle = post.title || post.topic || (post.primary_caption ? post.primary_caption.slice(0, 45) + "..." : "Content Asset");
                const formattedDate = post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

                return (
                  <tr key={post.id ?? `watch-${idx}`} style={{ borderBottom: "1px solid #e2e8f0", background: overdue ? "#fffafa" : undefined }}>
                    <td style={{ padding: "7px 10px", fontWeight: 700, color: "#0f172a" }}>
                      {clientNameFor(post)}
                    </td>
                    <td style={{ padding: "7px 10px", color: "#334155", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {postTitle}
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "center", textTransform: "capitalize", color: "#64748b" }}>
                      {post.post_type || "Post"}
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "2px 7px",
                          borderRadius: 4,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          background: post.status === "published" ? "#dcfce7" : post.status === "rejected" ? "#fee2e2" : "#f1f5f9",
                          color: post.status === "published" ? "#047857" : post.status === "rejected" ? "#b91c1c" : "#334155",
                          textTransform: "capitalize",
                        }}
                      >
                        {humanizeStatus(post.status)}
                      </span>
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: daysInStage >= 7 ? "#dc2626" : daysInStage >= 3 ? "#ea580c" : "#334155" }}>
                      {daysInStage}d
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          background: post.priority === "urgent" ? "#fee2e2" : post.priority === "high" ? "#ffedd5" : "#f1f5f9",
                          color: post.priority === "urgent" ? "#b91c1c" : post.priority === "high" ? "#c2410c" : "#475569",
                          textTransform: "uppercase",
                        }}
                      >
                        {post.priority || "Medium"}
                      </span>
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "right", color: overdue ? "#dc2626" : "#64748b", fontWeight: overdue ? 800 : 600, whiteSpace: "nowrap" }}>
                      {formattedDate}
                      {overdue && <div style={{ fontSize: "0.62rem", textTransform: "uppercase" }}>Overdue</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* SECTION 4: TURNAROUND TIME & UPCOMING SCHEDULE */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              4. Turnaround Time & Upcoming Schedule
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>From stage-change history</span>
          </div>

          <div className="report-kpi-matrix" style={{ marginBottom: 14 }}>
            {[
              {
                label: "Brief → Approved",
                value: fmtDays(turnaround.approvalAvg),
                sub: turnaround.approvalSamples ? `median ${fmtDays(turnaround.approvalMedian)} • ${turnaround.approvalSamples} post(s)` : "no approvals recorded yet",
                color: "#4f46e5",
                border: "#c7d2fe",
              },
              {
                label: "Brief → Published",
                value: fmtDays(turnaround.publishAvg),
                sub: turnaround.publishSamples ? `median ${fmtDays(turnaround.publishMedian)} • ${turnaround.publishSamples} post(s)` : "no published posts yet",
                color: "#059669",
                border: "#a7f3d0",
              },
              {
                label: "Overdue Items",
                value: overdueCount,
                sub: "past scheduled date, not approved",
                color: overdueCount ? "#dc2626" : "#0f172a",
                border: overdueCount ? "#fecaca" : "#cbd5e1",
              },
              {
                label: "Due Next 7 Days",
                value: upcoming.length,
                sub: `${upcoming.filter((u) => !u.ready).length} still in production`,
                color: upcoming.some((u) => !u.ready) ? "#ea580c" : "#0f172a",
                border: upcoming.some((u) => !u.ready) ? "#fed7aa" : "#cbd5e1",
              },
            ].map((k) => (
              <div key={k.label} style={{ border: `1.5px solid ${k.border}`, borderRadius: 10, padding: "10px 12px", background: "#ffffff" }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>{k.label}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: k.color, margin: "2px 0" }}>{k.value}</div>
                <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Average time spent in each stage */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155", textTransform: "uppercase" }}>Average time in each stage</div>
              {turnaround.bottleneck && (
                <div style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 700 }}>Slowest: {turnaround.bottleneck.name}</div>
              )}
            </div>
            {!turnaround.bottleneck ? (
              <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No stage changes recorded yet. Times appear once posts move between stages.</div>
            ) : (
              turnaround.stages.map((s) => {
                const max = Math.max(...turnaround.stages.map((x) => x.avg || 0), 0.01);
                const isSlowest = turnaround.bottleneck?.name === s.name;
                return (
                  <div key={s.name} style={{ display: "grid", gridTemplateColumns: "110px 1fr 90px", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#334155" }}>{s.name}</span>
                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${((s.avg || 0) / max) * 100}%`, height: "100%", background: isSlowest ? "#dc2626" : "#6366f1" }} />
                    </div>
                    <span style={{ fontSize: "0.72rem", textAlign: "right", color: isSlowest ? "#dc2626" : "#334155", fontWeight: 800 }}>
                      {fmtDays(s.avg)} <span style={{ color: "#94a3b8", fontWeight: 600 }}>({s.samples})</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Next 7 days */}
          <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", margin: "4px 0 6px" }}>Scheduled in the next 7 days</div>
          {upcoming.length === 0 ? (
            <div style={{ fontSize: "0.76rem", color: "#94a3b8", padding: "4px 0" }}>Nothing scheduled in the next 7 days.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Scheduled For</th>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Client</th>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Content</th>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Channels</th>
                  <th style={{ textAlign: "center", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Stage</th>
                  <th style={{ textAlign: "right", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Readiness</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.slice(0, 15).map(({ post, at, ready }, idx) => (
                  <tr key={post.id ?? `up-${idx}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "7px 8px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                      {new Date(at).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "7px 8px", color: "#334155" }}>{clientNameFor(post)}</td>
                    <td style={{ padding: "7px 8px", color: "#334155", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {post.title || (post.primary_caption || "").slice(0, 45) || "Content Asset"}
                    </td>
                    <td style={{ padding: "7px 8px", color: "#64748b", textTransform: "capitalize" }}>{(post.platforms || []).join(", ") || "—"}</td>
                    <td style={{ padding: "7px 8px", textAlign: "center", textTransform: "capitalize", color: "#334155" }}>{humanizeStatus(post.status)}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 800, color: ready ? "#059669" : "#dc2626" }}>{ready ? "Ready" : "At risk"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* SECTION 5: REVISION LOOPS & REJECTION AUDIT */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              5. Revision Loops & Rejection Audit
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Script → QA → Client feedback cycles</span>
          </div>

          <div className="report-kpi-matrix" style={{ marginBottom: 14 }}>
            <div style={{ border: "1.5px solid #fed7aa", borderRadius: 10, padding: "10px 12px", background: "#fffbf5" }}>
              <div style={{ fontSize: "0.66rem", fontWeight: 800, color: "#c2410c", textTransform: "uppercase" }}>Revision Loops</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ea580c", margin: "2px 0" }}>{quality.revisionLoops}</div>
              <div style={{ fontSize: "0.68rem", color: "#9a3412" }}>
                {quality.clientRevisions} client • {quality.internalRevisions} internal
              </div>
            </div>
            <div style={{ border: "1.5px solid #a7f3d0", borderRadius: 10, padding: "10px 12px", background: "#f6fffb" }}>
              <div style={{ fontSize: "0.66rem", fontWeight: 800, color: "#047857", textTransform: "uppercase" }}>First-Time Right</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#059669", margin: "2px 0" }}>
                {quality.firstTimeRightRate === null ? "—" : `${quality.firstTimeRightRate}%`}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#047857" }}>of {quality.deliveredCount} approved / published posts</div>
            </div>
            <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", background: "#ffffff" }}>
              <div style={{ fontSize: "0.66rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Avg Rounds / Post</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: "2px 0" }}>{quality.avgRevisions}</div>
              <div style={{ fontSize: "0.68rem", color: "#64748b" }}>before approval</div>
            </div>
            <div style={{ border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 12px", background: "#fffafa" }}>
              <div style={{ fontSize: "0.66rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase" }}>Rejected Content</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#dc2626", margin: "2px 0" }}>{quality.rejectedCount}</div>
              <div style={{ fontSize: "0.68rem", color: "#b91c1c" }}>
                {quality.clientRejected} by client • {quality.droppedCount} dropped
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 14 }}>
            {/* Where loops originate */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: 8 }}>Where loops originate</div>
              {quality.sources.every((s) => s.count === 0) ? (
                <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No revision loops recorded.</div>
              ) : (
                quality.sources.map((s) => {
                  const max = Math.max(...quality.sources.map((x) => x.count), 1);
                  return (
                    <div key={s.name} style={{ marginBottom: 7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", fontWeight: 700, color: "#334155" }}>
                        <span>{s.name}</span>
                        <span>{s.count}</span>
                      </div>
                      <div style={{ height: 7, background: "#f1f5f9", borderRadius: 4, overflow: "hidden", marginTop: 3 }}>
                        <div style={{ width: `${(s.count / max) * 100}%`, height: "100%", background: s.name === "Client Review" ? "#ea580c" : s.name === "Team QA" ? "#f59e0b" : "#8b5cf6" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Top revision reasons */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: 8 }}>Top revision reasons</div>
              {quality.reasons.length === 0 ? (
                <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No categorised feedback yet. Reasons appear here once revisions are logged through the Revisions popup.</div>
              ) : (
                quality.reasons.slice(0, 6).map((r) => (
                  <div key={r.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", padding: "4px 0", borderBottom: "1px dashed #e2e8f0" }}>
                    <span style={{ color: "#0f172a", fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontWeight: 800, color: "#ea580c" }}>{r.count}</span>
                  </div>
                ))
              )}
            </div>

            {/* Rejection reasons */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: 8 }}>Rejection reasons</div>
              {quality.rejectionReasons.length === 0 ? (
                <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No content rejected outright.</div>
              ) : (
                quality.rejectionReasons.slice(0, 6).map((r) => (
                  <div key={r.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", padding: "4px 0", borderBottom: "1px dashed #e2e8f0" }}>
                    <span style={{ color: "#0f172a", fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontWeight: 800, color: "#dc2626" }}>{r.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rejected content log */}
          <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", margin: "4px 0 6px" }}>Rejected content log</div>
          {quality.rejected.length === 0 ? (
            <div style={{ fontSize: "0.76rem", color: "#94a3b8", padding: "8px 0 12px" }}>No scripts, images or videos were rejected entirely in this scope.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem", marginBottom: 14 }}>
              <thead>
                <tr style={{ background: "#fef2f2", borderBottom: "1.5px solid #fecaca" }}>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#7f1d1d", fontWeight: 800 }}>Date</th>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#7f1d1d", fontWeight: 800 }}>Client</th>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#7f1d1d", fontWeight: 800 }}>Content</th>
                  <th style={{ textAlign: "center", padding: "7px 8px", color: "#7f1d1d", fontWeight: 800 }}>By</th>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#7f1d1d", fontWeight: 800 }}>Reason</th>
                  <th style={{ textAlign: "right", padding: "7px 8px", color: "#7f1d1d", fontWeight: 800 }}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {quality.rejected.slice(0, 15).map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #fee2e2", verticalAlign: "top" }}>
                    <td style={{ padding: "7px 8px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {r.date ? new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "7px 8px", fontWeight: 700, color: "#0f172a" }}>{r.client}</td>
                    <td style={{ padding: "7px 8px", color: "#334155" }}>
                      <div style={{ fontWeight: 700 }}>{r.title}</div>
                      <div style={{ fontSize: "0.66rem", color: "#94a3b8", textTransform: "capitalize" }}>
                        {r.format} • at {r.stage}
                      </div>
                    </td>
                    <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, color: r.by === "Client" ? "#b91c1c" : "#475569" }}>{r.by}</td>
                    <td style={{ padding: "7px 8px", color: "#334155", maxWidth: 260 }}>
                      {r.categories.length > 0 && <div style={{ fontWeight: 700, color: "#b91c1c", marginBottom: 2 }}>{r.categories.join(", ")}</div>}
                      <div>{r.reason}</div>
                    </td>
                    <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 800, color: r.outcome === "Dropped" ? "#dc2626" : "#4f46e5" }}>{r.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Most revised posts */}
          {quality.mostRevised.length > 0 && (
            <>
              <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#c2410c", textTransform: "uppercase", margin: "4px 0 6px" }}>Most revised content</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                    <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Content</th>
                    <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Client</th>
                    <th style={{ textAlign: "center", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Rounds</th>
                    <th style={{ textAlign: "center", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>From Client</th>
                    <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Last feedback</th>
                    <th style={{ textAlign: "right", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {quality.mostRevised.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "7px 8px", fontWeight: 700, color: "#0f172a" }}>{p.title || "Content Asset"}</td>
                      <td style={{ padding: "7px 8px", color: "#334155" }}>{clientNameFor(p)}</td>
                      <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 900, color: p.revision_count >= 3 ? "#dc2626" : "#ea580c" }}>{p.revision_count}</td>
                      <td style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700 }}>{p.client_revision_count || 0}</td>
                      <td style={{ padding: "7px 8px", color: "#64748b" }}>{(p.last_revision_categories || []).join(", ") || "—"}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", textTransform: "capitalize", color: "#334155" }}>{(p.status || "").replace(/_/g, " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* SECTION 6: PUBLISHED CONTENT PERFORMANCE */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              6. Published Content Performance
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
              {performance.trackedCount} of {performance.publishedCount} posts tracked
            </span>
          </div>

          <div className="report-kpi-matrix" style={{ marginBottom: 12 }}>
            {[
              { label: "Published", value: performance.publishedCount, sub: "posts live", color: "#059669" },
              { label: "Total Reach", value: performance.totalReach.toLocaleString("en-IN"), sub: "accounts reached", color: "#0284c7" },
              { label: "Engagements", value: performance.totalEngagement.toLocaleString("en-IN"), sub: `${performance.likes.toLocaleString("en-IN")} likes • ${performance.comments.toLocaleString("en-IN")} comments • ${performance.shares.toLocaleString("en-IN")} shares`, color: "#7c3aed" },
              { label: "Engagement Rate", value: performance.engagementRate === null ? "—" : `${performance.engagementRate}%`, sub: "engagements ÷ reach", color: "#ea580c" },
            ].map((k) => (
              <div key={k.label} style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", background: "#ffffff" }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>{k.label}</div>
                <div style={{ fontSize: "1.45rem", fontWeight: 900, color: k.color, margin: "2px 0" }}>{k.value}</div>
                <div style={{ fontSize: "0.66rem", color: "#64748b" }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {performance.top.length === 0 ? (
            <div style={{ fontSize: "0.78rem", color: "#64748b", padding: "10px 12px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 8 }}>
              No post analytics entered yet. Open <strong>Published / Posted → Analytics</strong> on a live post to record likes, comments, shares and reach.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Top Content</th>
                  <th style={{ textAlign: "left", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Channels</th>
                  <th style={{ textAlign: "right", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Reach</th>
                  <th style={{ textAlign: "right", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Likes</th>
                  <th style={{ textAlign: "right", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Comments</th>
                  <th style={{ textAlign: "right", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Shares</th>
                  <th style={{ textAlign: "right", padding: "7px 8px", color: "#334155", fontWeight: 800 }}>Eng. Rate</th>
                </tr>
              </thead>
              <tbody>
                {performance.top.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "7px 8px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{r.title}</div>
                      <div style={{ fontSize: "0.66rem", color: "#94a3b8" }}>{r.client}</div>
                    </td>
                    <td style={{ padding: "7px 8px", color: "#64748b", textTransform: "capitalize" }}>{r.platforms || "—"}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{r.reach.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right" }}>{r.likes.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right" }}>{r.comments.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right" }}>{r.shares.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 800, color: "#ea580c" }}>{r.rate === null ? "—" : `${r.rate}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {performance.untracked > 0 && performance.top.length > 0 && (
            <div className="no-print" style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 6 }}>
              {performance.untracked} published post(s) have no analytics entered yet.
            </div>
          )}
        </div>

        {/* OFFICIAL FOOTER / SIGN-OFF */}
        <div
          className="print-break-inside-avoid"
          style={{
            borderTop: "1.5px solid #cbd5e1",
            paddingTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "0.68rem",
            color: "#64748b",
          }}
        >
          <div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>ADSTRA DIGITAL AGENCY</div>
            <div>Husna Complex, 1st Floor, Nadakkavu, Kozhikode, Kerala - 673011</div>
            <div>Official Operations Platform • adstradigital.com</div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, color: "#334155" }}>CONFIDENTIAL DOCUMENT</div>
            <div>For authorized internal operations and client executive review only.</div>
            <div>System Generated Audit • Ref {docRef}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
