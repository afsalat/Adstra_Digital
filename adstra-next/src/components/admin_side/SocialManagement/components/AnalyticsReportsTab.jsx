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

  // Real posts only — the audit must never show placeholder data
  const basePosts = useMemo(() => (Array.isArray(posts) ? posts : []), [posts]);

  // Filter posts based on selected client and extra filters
  const filteredPosts = useMemo(() => {
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

    // Date Range filter
    if (selectedDateRange !== "all") {
      const now = new Date();
      let days = 30;
      if (selectedDateRange === "7") days = 7;
      if (selectedDateRange === "30") days = 30;
      if (selectedDateRange === "90") days = 90;

      const cutoff = new Date();
      cutoff.setDate(now.getDate() - days);

      result = result.filter((p) => {
        const dateStr = p.created_at || p.scheduled_at || p.published_at;
        if (!dateStr) return true;
        const pDate = new Date(dateStr);
        return pDate >= cutoff;
      });
    }

    return result;
  }, [basePosts, selectedClientId, selectedPlatform, selectedPostType, selectedPriority, selectedDateRange]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    let active = 0;
    let published = 0;
    let pendingApproval = 0;
    let revisions = 0;

    filteredPosts.forEach((p) => {
      if (p.status === "published") {
        published++;
      } else if (!["archived", "content_rejected"].includes(p.status)) {
        active++;
      }

      if (p.status === "client_review" || p.status === "script_approval") {
        pendingApproval++;
      }

      if (p.status === "rejected" || Boolean(p.client_feedback)) {
        revisions++;
      }
    });

    const totalTracked = active + published;
    const completionRate = totalTracked > 0 ? Math.round((published / totalTracked) * 100) : 0;
    const activeRate = totalTracked > 0 ? Math.round((active / totalTracked) * 100) : 0;

    return { active, published, pendingApproval, revisions, totalTracked, completionRate, activeRate };
  }, [filteredPosts]);

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
      else if (["approved", "scheduled"].includes(p.status)) counts["Scheduled"]++;
      else if (p.status === "published") counts["Published"]++;
      else if (p.status === "content_rejected") counts["Rejected"]++;
    });

    const total = filteredPosts.length || 1;

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
      const clientName = p.client_name || currentClient?.company_name || currentClient?.name || "V J Food Industries";
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
  }, [filteredPosts, currentClient]);

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
        client: p.client_name || clientDisplayName,
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
  }, [filteredPosts, clientDisplayName]);

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
        client: p.client_name || clientDisplayName,
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
  }, [filteredPosts, clientDisplayName]);

  // Operational Diagnosis Insight
  const healthDiagnosis = useMemo(() => {
    if (kpis.revisions > 0) {
      return {
        status: "Action Required",
        color: "#ef4444",
        bg: "#fef2f2",
        border: "#fecaca",
        message: `${kpis.revisions} content item(s) require creative revision or feedback response to prevent delivery loopbacks.`,
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
    if (kpis.pendingApproval > 1) {
      return {
        status: "Approval Queue Active",
        color: "#ea580c",
        bg: "#fff7ed",
        border: "#fed7aa",
        message: `${kpis.pendingApproval} post(s) awaiting client review or script sign-off. High team momentum.`,
      };
    }
    return {
      status: "Optimal Velocity",
      color: "#4f46e5",
      bg: "#eef2ff",
      border: "#c7d2fe",
      message: "Healthy operational throughput. Content items are advancing steadily across creative, review, and scheduling milestones.",
    };
  }, [kpis, quality]);

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
        <tr><td colspan="6" class="sub-title">Client Scope: ${clientDisplayName} | Generated: ${reportDate} | Platform: ${selectedPlatform.toUpperCase()} | Timeframe: ${selectedDateRange === "all" ? "All Time" : `Last ${selectedDateRange} Days`}</td></tr>
        <tr><td colspan="6"></td></tr>
        
        <tr><th colspan="6" class="section-header">1. EXECUTIVE KPI SUMMARY</th></tr>
        <tr class="col-header">
          <th colspan="2">Active Pipeline</th>
          <th colspan="1">Total Published</th>
          <th colspan="1">Pending Approval</th>
          <th colspan="1">Action Required</th>
          <th colspan="1">Completion Rate</th>
        </tr>
        <tr>
          <td colspan="2" class="data-cell cell-primary" style="font-size: 14pt; text-align: center;">${kpis.active}</td>
          <td colspan="1" class="data-cell cell-success" style="font-size: 14pt; text-align: center;">${kpis.published}</td>
          <td colspan="1" class="data-cell" style="font-size: 14pt; text-align: center; color: #ea580c;">${kpis.pendingApproval}</td>
          <td colspan="1" class="data-cell" style="font-size: 14pt; text-align: center; color: #ef4444;">${kpis.revisions}</td>
          <td colspan="1" class="data-cell" style="font-size: 14pt; text-align: center;">${kpis.completionRate}%</td>
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
          <td colspan="2" class="data-cell cell-bold">${c.name}</td>
          <td colspan="1" class="data-cell cell-primary" style="text-align: center;">${c.active}</td>
          <td colspan="1" class="data-cell cell-success" style="text-align: center;">${c.published}</td>
          <td colspan="1" class="data-cell cell-bold" style="text-align: center;">${c.total}</td>
          <td colspan="1" class="data-cell" style="text-align: center;">${c.rate}%</td>
        </tr>`).join('')}
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

  // Direct PDF Download via html2pdf on the fully visible report container
  const handleDirectDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("executive-report-document");
      if (!element) {
        handleExportPDF();
        return;
      }

      const clientSanitized = clientDisplayName.replace(/[^a-z0-9]/gi, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `Adstra_Workflow_Report_${clientSanitized}_${dateStr}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          ignoreElements: (el) => el.classList && el.classList.contains("no-print"),
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.warn("Direct html2pdf generation failed, falling back to window.print():", err);
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
            <div style={{ textAlign: "right" }}>
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
                Doc Ref: <strong style={{ color: "#0f172a" }}>AD-REP-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(filteredPosts.length).padStart(3, '0')}</strong>
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
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
              {selectedDateRange === "all" ? "All Time History" : `Last ${selectedDateRange} Days`}
            </div>
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
          {/* Active Pipeline */}
          <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "12px 14px", background: "#ffffff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              ACTIVE PIPELINE
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", margin: "3px 0" }}>
              {kpis.active}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
              In Production ({kpis.activeRate}%)
            </div>
          </div>

          {/* Published */}
          <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "12px 14px", background: "#ffffff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#047857", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              TOTAL PUBLISHED
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#059669", margin: "3px 0" }}>
              {kpis.published}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#047857" }}>
              Delivery Rate: {kpis.completionRate}%
            </div>
          </div>

          {/* Pending Approval */}
          <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "12px 14px", background: "#ffffff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              PENDING REVIEW
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#ea580c", margin: "3px 0" }}>
              {kpis.pendingApproval}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#c2410c" }}>
              Client Sign-off Queue
            </div>
          </div>

          {/* Action Required */}
          <div style={{ border: "1.5px solid #cbd5e1", borderRadius: 10, padding: "12px 14px", background: "#ffffff" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              ACTION REQUIRED
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#dc2626", margin: "3px 0" }}>
              {kpis.revisions}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#b91c1c" }}>
              Revision Loopbacks
            </div>
          </div>
        </div>

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
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 900, color: healthDiagnosis.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            OPERATIONAL HEALTH ASSESSMENT: {healthDiagnosis.status}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#1e293b", marginTop: 3, fontWeight: 500 }}>
            {healthDiagnosis.message} Current delivery rate is <strong>{kpis.completionRate}%</strong> with{" "}
            <strong>{kpis.active}</strong> asset(s) advancing across the creative pipeline.
          </div>
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
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
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
                    width: `${Math.max(stage.percent, 8)}%`,
                    background: stage.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 800,
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

        {/* SECTION 2: CLIENT WORKLOAD & RESOURCE ALLOCATION */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              2. Client Workload & Production Volume
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Ranked by volume</span>
          </div>

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
        </div>

        {/* SECTION 3: RECENT CONTENT AUDIT & PRIORITY ITEMS */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              3. Content Audit Sample & Priority Watchlist
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Tracked Assets Sample</span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #cbd5e1" }}>
                <th style={{ textAlign: "left", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Client Account</th>
                <th style={{ textAlign: "left", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Topic / Caption Snippet</th>
                <th style={{ textAlign: "center", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Format</th>
                <th style={{ textAlign: "center", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Current Stage</th>
                <th style={{ textAlign: "center", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Priority</th>
                <th style={{ textAlign: "right", padding: "7px 10px", color: "#334155", fontWeight: 800 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.slice(0, 10).map((post) => {
                const postTitle = post.title || post.topic || (post.primary_caption ? post.primary_caption.slice(0, 45) + "..." : "Content Asset");
                const dateVal = post.scheduled_at || post.published_at || post.created_at;
                const formattedDate = dateVal ? new Date(dateVal).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

                return (
                  <tr key={post.id || Math.random()} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "7px 10px", fontWeight: 700, color: "#0f172a" }}>
                      {post.client_name || clientDisplayName}
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
                        {post.status ? post.status.replace("_", " ") : "Draft"}
                      </span>
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
                        {post.priority || "Normal"}
                      </span>
                    </td>
                    <td style={{ padding: "7px 10px", textAlign: "right", color: "#64748b", fontWeight: 600 }}>
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SECTION 4: REVISION LOOPS & REJECTION AUDIT */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              4. Revision Loops & Rejection Audit
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
                      <td style={{ padding: "7px 8px", color: "#334155" }}>{p.client_name || clientDisplayName}</td>
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

        {/* SECTION 5: PUBLISHED CONTENT PERFORMANCE */}
        <div className="print-break-inside-avoid" style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              5. Published Content Performance
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
            <div>Page 1 of 1 • System Generated Audit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
