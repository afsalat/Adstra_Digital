"use client";

import React, { useState, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Plus,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  X,
} from "lucide-react";

// Kerala & Indian Festival/Holiday Calendar Milestones
const FESTIVALS_AND_HOLIDAYS = [
  { month: 0, day: 1, name: "New Year's Day", prompt: "New year business resolutions & fresh beginnings" },
  { month: 0, day: 26, name: "Republic Day", prompt: "Patriotic celebrations & national unity offers" },
  { month: 2, day: 30, name: "Eid-ul-Fitr", prompt: "Eid Mubarak blessings & festive family offers" },
  { month: 3, day: 14, name: "Vishu Festival", prompt: "Vishu Kani, prosperity & auspicious beginnings" },
  { month: 4, day: 1, name: "May Day", prompt: "Celebrating hard work, workforce & team dedication" },
  { month: 7, day: 15, name: "Independence Day", prompt: "Freedom sale & pride in homegrown business" },
  { month: 8, day: 4, name: "Thiruvonam (Onam)", prompt: "Onam bumper campaigns, Pookkalam & festive sales" },
  { month: 9, day: 20, name: "Diwali / Deepavali", prompt: "Festival of lights, mega festive gifting & fireworks" },
  { month: 11, day: 25, name: "Christmas Celebration", prompt: "Holiday season joy, year-end clearance & gratitude" },
];

const PRIORITY_CONFIG = {
  urgent: {
    label: "Urgent",
    dot: "🔴",
    badgeColor: "#dc2626",
    badgeBg: "#fef2f2",
    badgeBorder: "#fca5a5",
    rank: 4,
  },
  high: {
    label: "High",
    dot: "🟠",
    badgeColor: "#ea580c",
    badgeBg: "#fff7ed",
    badgeBorder: "#fed7aa",
    rank: 3,
  },
  medium: {
    label: "Medium",
    dot: "🔵",
    badgeColor: "#0284c7",
    badgeBg: "#f0f9ff",
    badgeBorder: "#bae6fd",
    rank: 2,
  },
  low: {
    label: "Low",
    dot: "🟢",
    badgeColor: "#16a34a",
    badgeBg: "#f0fdf4",
    badgeBorder: "#bbf7d0",
    rank: 1,
  },
};

export default function ContentCalendarTab({
  posts = [],
  clients = [],
  selectedClientId = "all",
  onRefresh,
  onOpenCreatePost,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week' | 'day'
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [dayPriorityFilter, setDayPriorityFilter] = useState("all");
  const [daySortBy, setDaySortBy] = useState("priority"); // 'priority' | 'time'
  const [updatingPriorityPostId, setUpdatingPriorityPostId] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [newScheduleTime, setNewScheduleTime] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const nextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const todayPeriod = () => setCurrentDate(new Date());

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (platformFilter !== "all" && !p.platforms?.includes(platformFilter)) {
        return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [posts, platformFilter, statusFilter]);

  // Generate calendar days for monthly view (properly aligned 35 or 42 cells)
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    const days = [];

    // Preceding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dayDateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      
      const dayPosts = filteredPosts.filter((p) => {
        if (!p.scheduled_at && !p.published_at) return false;
        const pDate = (p.scheduled_at || p.published_at).slice(0, 10);
        return pDate === dayDateStr;
      });

      days.push({
        dayNum,
        dateStr: dayDateStr,
        posts: dayPosts,
        isCurrentMonth: false,
        isPrevMonth: true,
        isToday: false,
        key: `prev-${dayDateStr}`,
      });
    }

    // Actual days of current month
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const dayDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      
      const dayPosts = filteredPosts.filter((p) => {
        if (!p.scheduled_at && !p.published_at) return false;
        const pDate = (p.scheduled_at || p.published_at).slice(0, 10);
        return pDate === dayDateStr;
      });

      const festival = FESTIVALS_AND_HOLIDAYS.find(
        (f) => f.month === month && f.day === dayNum
      );

      const isToday =
        new Date().toDateString() === new Date(year, month, dayNum).toDateString();

      days.push({
        dayNum,
        dateStr: dayDateStr,
        posts: dayPosts,
        festival,
        isToday,
        isCurrentMonth: true,
        key: dayDateStr,
      });
    }

    // Trailing days from next month to complete 35 or 42 cells (5 or 6 complete weeks)
    const targetTotal = days.length <= 35 ? 35 : 42;
    const remainingCount = targetTotal - days.length;
    for (let dayNum = 1; dayNum <= remainingCount; dayNum++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dayDateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

      const dayPosts = filteredPosts.filter((p) => {
        if (!p.scheduled_at && !p.published_at) return false;
        const pDate = (p.scheduled_at || p.published_at).slice(0, 10);
        return pDate === dayDateStr;
      });

      days.push({
        dayNum,
        dateStr: dayDateStr,
        posts: dayPosts,
        isCurrentMonth: false,
        isNextMonth: true,
        isToday: false,
        key: `next-${dayDateStr}`,
      });
    }

    return days;
  }, [year, month, filteredPosts]);

  // Handle Quick Reschedule
  const handleReschedule = async () => {
    if (!selectedPostDetail || !newScheduleTime) return;
    setRescheduling(true);
    try {
      await axios.post(`${API_BASE_URL}/social/posts/${selectedPostDetail.id}/reschedule/`, {
        scheduled_at: new Date(newScheduleTime).toISOString(),
      });
      setSelectedPostDetail(null);
      onRefresh();
    } catch (err) {
      alert("Error rescheduling post.");
    } finally {
      setRescheduling(false);
    }
  };

  // Handle Quick Publish
  const handlePublishNow = async (postId) => {
    if (!confirm("Are you sure you want to publish this post immediately across platforms?")) return;
    try {
      await axios.post(`${API_BASE_URL}/social/posts/${postId}/publish_now/`);
      setSelectedPostDetail(null);
      onRefresh();
    } catch (err) {
      alert("Error publishing post.");
    }
  };

  // Keep selectedDayDetail synced with latest posts from parent
  const currentDayPosts = useMemo(() => {
    if (!selectedDayDetail) return [];
    return posts.filter((p) => {
      if (!p.scheduled_at && !p.published_at) return false;
      const pDate = (p.scheduled_at || p.published_at).slice(0, 10);
      return pDate === selectedDayDetail.dateStr;
    });
  }, [selectedDayDetail, posts]);

  // Priority count breakdown for the selected day
  const dayPriorityCounts = useMemo(() => {
    return {
      total: currentDayPosts.length,
      urgent: currentDayPosts.filter((p) => p.priority === "urgent").length,
      high: currentDayPosts.filter((p) => p.priority === "high").length,
      medium: currentDayPosts.filter((p) => (p.priority || "medium") === "medium").length,
      low: currentDayPosts.filter((p) => p.priority === "low").length,
    };
  }, [currentDayPosts]);

  // Filter & sort scheduled posts within the day modal
  const displayDayPosts = useMemo(() => {
    let list = [...currentDayPosts];
    if (dayPriorityFilter !== "all") {
      list = list.filter((p) => (p.priority || "medium") === dayPriorityFilter);
    }
    list.sort((a, b) => {
      if (daySortBy === "priority") {
        const rankA = PRIORITY_CONFIG[a.priority || "medium"]?.rank || 2;
        const rankB = PRIORITY_CONFIG[b.priority || "medium"]?.rank || 2;
        if (rankB !== rankA) return rankB - rankA; // highest priority first
      }
      // sort by time
      const timeA = new Date(a.scheduled_at || a.published_at || 0).getTime();
      const timeB = new Date(b.scheduled_at || b.published_at || 0).getTime();
      return timeA - timeB;
    });
    return list;
  }, [currentDayPosts, dayPriorityFilter, daySortBy]);

  // Fast inline priority update
  const handleUpdatePriority = async (postId, newPriority) => {
    setUpdatingPriorityPostId(postId);
    try {
      await axios.patch(`${API_BASE_URL}/social/posts/${postId}/`, {
        priority: newPriority,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Failed to update post priority.");
    } finally {
      setUpdatingPriorityPostId(null);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div>
      {/* Calendar Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff",
          padding: "16px 22px",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {/* Date Navigator */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={prevPeriod}
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: 6, cursor: "pointer" }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={todayPeriod}
              style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 12px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: 6, cursor: "pointer" }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* Filters & View Toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Platform filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", fontWeight: 600, background: "#fff" }}
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
            <option value="x">X / Twitter</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.82rem", fontWeight: 600, background: "#fff" }}
          >
            <option value="all">All Stages (7 Stages)</option>
            <option value="script">1. Script</option>
            <option value="script_approval">2. Script Approval</option>
            <option value="designing">3. Scheduled / Designing</option>
            <option value="team_review">4. Team Review / Ready</option>
            <option value="client_review">5. Client Review</option>
            <option value="scheduled">6. Approved / Schedule</option>
            <option value="published">7. Published / Posted</option>
          </select>

          {/* Create Post Button */}
          <button
            onClick={onOpenCreatePost}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#4f46e5", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
          >
            <Plus size={16} /> Schedule Post
          </button>
        </div>
      </div>

      {/* Monthly Grid */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 2px 14px rgba(15, 23, 42, 0.03)",
        }}
      >
        {/* Day of Week Headers - 7 Columns matching cells below */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((dayName, idx) => (
            <div
              key={dayName}
              style={{
                padding: "12px 6px",
                textAlign: "center",
                fontWeight: 800,
                fontSize: "0.78rem",
                color: idx === 0 || idx === 6 ? "#94a3b8" : "#475569",
                letterSpacing: "0.06em",
                borderRight: idx < 6 ? "1px solid #e2e8f0" : "none",
              }}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Cells - 7 Columns with identical border alignments */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
          {monthDays.map((cell, idx) => {
            const isLastCol = idx % 7 === 6;
            const isLastRow = idx >= monthDays.length - 7;

            return (
              <div
                key={cell.key}
                onClick={() => setSelectedDayDetail(cell)}
                style={{
                  minHeight: 126,
                  borderRight: isLastCol ? "none" : "1px solid #e2e8f0",
                  borderBottom: isLastRow ? "none" : "1px solid #e2e8f0",
                  padding: "8px 9px",
                  background: cell.isToday
                    ? "#eff6ff"
                    : cell.isCurrentMonth
                    ? "#ffffff"
                    : "#fafbfc",
                  display: "flex",
                  flexDirection: "column",
                  transition: "background 0.15s ease",
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = cell.isToday ? "#dbeafe" : "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = cell.isToday
                    ? "#eff6ff"
                    : cell.isCurrentMonth
                    ? "#ffffff"
                    : "#fafbfc";
                }}
              >
                {/* Day Number, Festival Marker, and Post Count Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: cell.isToday ? 800 : cell.isCurrentMonth ? 700 : 500,
                        color: cell.isToday
                          ? "#ffffff"
                          : cell.isCurrentMonth
                          ? "#1e293b"
                          : "#cbd5e1",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: cell.isToday ? "#2563eb" : "transparent",
                        flexShrink: 0,
                      }}
                    >
                      {cell.dayNum}
                    </span>

                    {cell.posts.length > 0 && (
                      <span
                        title={`${cell.posts.length} scheduled items (Click day to view agenda & priority)`}
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 8,
                          background: cell.posts.some((p) => p.priority === "urgent")
                            ? "#fee2e2"
                            : cell.posts.some((p) => p.priority === "high")
                            ? "#ffedd5"
                            : "#f1f5f9",
                          color: cell.posts.some((p) => p.priority === "urgent")
                            ? "#b91c1c"
                            : cell.posts.some((p) => p.priority === "high")
                            ? "#c2410c"
                            : "#475569",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {cell.posts.some((p) => p.priority === "urgent") ? "🔴 " : cell.posts.some((p) => p.priority === "high") ? "🟠 " : ""}
                        {cell.posts.length}
                      </span>
                    )}
                  </div>

                  {cell.festival && (
                    <span
                      title={cell.festival.prompt}
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        fontSize: "0.68rem",
                        padding: "2px 6px",
                        borderRadius: 5,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "calc(100% - 32px)",
                        border: "1px solid #fde68a",
                      }}
                    >
                      🎉 {cell.festival.name}
                    </span>
                  )}
                </div>

                {/* Posts in this day */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, overflowY: "auto" }}>
                  {cell.posts.map((post) => {
                    const postColor =
                      post.status === "published" ? "#10b981" :
                      post.status === "approved" || post.status === "scheduled" ? "#0ea5e9" :
                      post.status === "client_review" ? "#ea580c" :
                      post.status === "team_review" || post.status === "internal_review" ? "#f59e0b" :
                      post.status === "designing" ? "#ec4899" :
                      post.status === "script_approval" ? "#8b5cf6" :
                      "#6366f1";

                    const postBg =
                      post.status === "published" ? "#ecfdf5" :
                      post.status === "approved" || post.status === "scheduled" ? "#f0f9ff" :
                      post.status === "client_review" ? "#fff7ed" :
                      post.status === "team_review" || post.status === "internal_review" ? "#fffbeb" :
                      post.status === "designing" ? "#fdf2f8" :
                      post.status === "script_approval" ? "#f5f3ff" :
                      "#eef2ff";

                    const timeStr = post.scheduled_at
                      ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "";

                    const prConf = PRIORITY_CONFIG[post.priority || "medium"] || PRIORITY_CONFIG.medium;

                    return (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayDetail(cell);
                        }}
                        title={`${post.title || "Post"} | Priority: ${prConf.label} (${post.status})`}
                        style={{
                          background: postBg,
                          border: `1px solid ${postColor}40`,
                          borderLeft: `3.5px solid ${postColor}`,
                          borderRadius: 6,
                          padding: "3px 6px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          color: "#0f172a",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          transition: "all 0.12s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = postColor)}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${postColor}40`)}
                      >
                        <span style={{ fontSize: "0.65rem", flexShrink: 0 }}>{prConf.dot}</span>
                        {timeStr && (
                          <span style={{ fontSize: "0.66rem", color: "#64748b", fontWeight: 600, flexShrink: 0 }}>
                            {timeStr}
                          </span>
                        )}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {post.title || post.primary_caption?.slice(0, 24) || "Untitled Post"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DAY SCHEDULE & PRIORITY AGENDA MODAL */}
      {selectedDayDetail && (
        <div
          className="social-modal-overlay"
          onClick={() => setSelectedDayDetail(null)}
        >
          <div
            className="social-modal-content"
            style={{ maxWidth: 840, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="social-modal-header" style={{ padding: "18px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: selectedDayDetail.isToday ? "#eff6ff" : "#f1f5f9",
                    color: selectedDayDetail.isToday ? "#2563eb" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${selectedDayDetail.isToday ? "#bfdbfe" : "#e2e8f0"}`,
                    flexShrink: 0,
                  }}
                >
                  <CalendarIcon size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                      {(() => {
                        const [y, m, d] = selectedDayDetail.dateStr.split("-").map(Number);
                        const dt = new Date(y, m - 1, d);
                        return dt.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });
                      })()}
                    </h3>
                    {selectedDayDetail.isToday && (
                      <span
                        style={{
                          background: "#2563eb",
                          color: "#ffffff",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: 6,
                          letterSpacing: "0.04em",
                        }}
                      >
                        TODAY
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
                    Daily scheduled content schedule and priority management
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => {
                    const dateStr = selectedDayDetail.dateStr;
                    setSelectedDayDetail(null);
                    if (onOpenCreatePost) {
                      onOpenCreatePost({ scheduled_at: `${dateStr}T10:00:00` });
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: 9,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                  }}
                >
                  <Plus size={15} /> + Schedule for this Day
                </button>
                <button
                  onClick={() => setSelectedDayDetail(null)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: 8,
                    padding: 7,
                    cursor: "pointer",
                    color: "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Festival Banner (if any) */}
            {selectedDayDetail.festival && (
              <div
                style={{
                  margin: "14px 24px 0 24px",
                  padding: "10px 16px",
                  background: "#fffbeb",
                  borderRadius: 10,
                  border: "1px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>🎉</span>
                <div>
                  <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "#92400e" }}>
                    Festival / Holiday Milestone: {selectedDayDetail.festival.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#b45309" }}>
                    Recommended Campaign Angle: {selectedDayDetail.festival.prompt}
                  </div>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="social-modal-body" style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {/* Priority & Filter Strip */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f8fafc",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  marginBottom: 18,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {/* Priority distribution breakdown */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569" }}>
                    Scheduled Items ({dayPriorityCounts.total}):
                  </span>
                  <span
                    style={{
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fca5a5",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: "0.74rem",
                      fontWeight: 700,
                    }}
                  >
                    🔴 Urgent: {dayPriorityCounts.urgent}
                  </span>
                  <span
                    style={{
                      background: "#fff7ed",
                      color: "#ea580c",
                      border: "1px solid #fed7aa",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: "0.74rem",
                      fontWeight: 700,
                    }}
                  >
                    🟠 High: {dayPriorityCounts.high}
                  </span>
                  <span
                    style={{
                      background: "#f0f9ff",
                      color: "#0284c7",
                      border: "1px solid #bae6fd",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: "0.74rem",
                      fontWeight: 700,
                    }}
                  >
                    🔵 Medium: {dayPriorityCounts.medium}
                  </span>
                  <span
                    style={{
                      background: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontSize: "0.74rem",
                      fontWeight: 700,
                    }}
                  >
                    🟢 Low: {dayPriorityCounts.low}
                  </span>
                </div>

                {/* Sort & Filter controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    value={dayPriorityFilter}
                    onChange={(e) => setDayPriorityFilter(e.target.value)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 7,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      background: "#fff",
                    }}
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">🔴 Urgent Only</option>
                    <option value="high">🟠 High Only</option>
                    <option value="medium">🔵 Medium Only</option>
                    <option value="low">🟢 Low Only</option>
                  </select>

                  <select
                    value={daySortBy}
                    onChange={(e) => setDaySortBy(e.target.value)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 7,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      background: "#fff",
                    }}
                  >
                    <option value="priority">Sort: Priority (Urgent First)</option>
                    <option value="time">Sort: Scheduled Time</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Posts Listing */}
              {displayDayPosts.length === 0 ? (
                <div
                  style={{
                    padding: "48px 20px",
                    textAlign: "center",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 14,
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#f1f5f9",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Clock size={24} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a", fontWeight: 700 }}>
                    {currentDayPosts.length === 0
                      ? "No content scheduled for this date"
                      : "No items match the selected priority filter"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", maxWidth: 360 }}>
                    {currentDayPosts.length === 0
                      ? "Schedule a post now to queue graphics, reels, or announcements for this day."
                      : "Switch the priority filter above to view other posts."}
                  </p>
                  {currentDayPosts.length === 0 && (
                    <button
                      onClick={() => {
                        const dateStr = selectedDayDetail.dateStr;
                        setSelectedDayDetail(null);
                        if (onOpenCreatePost) {
                          onOpenCreatePost({ scheduled_at: `${dateStr}T10:00:00` });
                        }
                      }}
                      style={{
                        marginTop: 6,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        padding: "8px 18px",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={15} style={{ marginRight: 4 }} /> Schedule First Post
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {displayDayPosts.map((post) => {
                    const postPriority = post.priority || "medium";
                    const prConf = PRIORITY_CONFIG[postPriority] || PRIORITY_CONFIG.medium;
                    const isUpdatingThis = updatingPriorityPostId === post.id;

                    const timeFormatted = post.scheduled_at
                      ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : post.published_at
                      ? `Published ${new Date(post.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Untimed";

                    const stageColor =
                      post.status === "published" ? "#10b981" :
                      post.status === "approved" || post.status === "scheduled" ? "#0ea5e9" :
                      post.status === "client_review" ? "#ea580c" :
                      post.status === "team_review" || post.status === "internal_review" ? "#f59e0b" :
                      post.status === "designing" ? "#ec4899" :
                      post.status === "script_approval" ? "#8b5cf6" :
                      "#6366f1";

                    const stageBg =
                      post.status === "published" ? "#ecfdf5" :
                      post.status === "approved" || post.status === "scheduled" ? "#f0f9ff" :
                      post.status === "client_review" ? "#fff7ed" :
                      post.status === "team_review" || post.status === "internal_review" ? "#fffbeb" :
                      post.status === "designing" ? "#fdf2f8" :
                      post.status === "script_approval" ? "#f5f3ff" :
                      "#eef2ff";

                    return (
                      <div
                        key={post.id}
                        style={{
                          background: "#ffffff",
                          border: `1px solid ${prConf.badgeBorder}`,
                          borderLeft: `5px solid ${prConf.badgeColor}`,
                          borderRadius: 12,
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 16,
                          boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02)",
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Left: Time + Priority Badge + Title/Caption */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 260 }}>
                          {/* Time & Priority tag column */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 105 }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              <Clock size={13} color="#64748b" /> {timeFormatted}
                            </span>

                            {/* Priority badge with inline selector */}
                            <div style={{ position: "relative" }}>
                              <select
                                value={postPriority}
                                onChange={(e) => handleUpdatePriority(post.id, e.target.value)}
                                disabled={isUpdatingThis}
                                style={{
                                  background: prConf.badgeBg,
                                  color: prConf.badgeColor,
                                  border: `1px solid ${prConf.badgeBorder}`,
                                  borderRadius: 6,
                                  fontSize: "0.74rem",
                                  fontWeight: 800,
                                  padding: "3px 6px",
                                  cursor: "pointer",
                                  outline: "none",
                                  width: "100%",
                                }}
                                title="Click to change priority for this post"
                              >
                                <option value="urgent">🔴 Urgent</option>
                                <option value="high">🟠 High</option>
                                <option value="medium">🔵 Medium</option>
                                <option value="low">🟢 Low</option>
                              </select>
                            </div>
                          </div>

                          {/* Post Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                              <span
                                onClick={() => {
                                  setSelectedPostDetail(post);
                                  setNewScheduleTime(post.scheduled_at ? post.scheduled_at.slice(0, 16) : "");
                                }}
                                style={{
                                  fontSize: "0.92rem",
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  cursor: "pointer",
                                  textDecoration: "none",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#0f172a")}
                              >
                                {post.title || "Untitled Post"}
                              </span>

                              {post.client_name && (
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {post.client_name}
                                </span>
                              )}

                              {post.post_type && (
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    textTransform: "capitalize",
                                    background: "#eff6ff",
                                    color: "#2563eb",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {post.post_type}
                                </span>
                              )}
                            </div>

                            <p
                              style={{
                                margin: "0 0 6px 0",
                                fontSize: "0.8rem",
                                color: "#64748b",
                                lineHeight: 1.4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {post.primary_caption || post.script_notes || "No caption drafted yet"}
                            </p>

                            {/* Platforms & Status badge */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              {post.platforms && post.platforms.length > 0 && (
                                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                                  {(post.platforms || []).join(", ")}
                                </span>
                              )}

                              <span
                                style={{
                                  background: stageBg,
                                  color: stageColor,
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  border: `1px solid ${stageColor}40`,
                                }}
                              >
                                {post.status.replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            onClick={() => {
                              setSelectedPostDetail(post);
                              setNewScheduleTime(post.scheduled_at ? post.scheduled_at.slice(0, 16) : "");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "7px 12px",
                              borderRadius: 8,
                              background: "#f8fafc",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              color: "#334155",
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={14} /> Preview
                          </button>

                          {post.status !== "published" && (
                            <button
                              onClick={() => handlePublishNow(post.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "7px 12px",
                                borderRadius: 8,
                                background: "#10b981",
                                border: "none",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: "#ffffff",
                                cursor: "pointer",
                              }}
                            >
                              <Send size={13} /> Publish Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="social-modal-footer" style={{ padding: "14px 24px" }}>
              <button
                onClick={() => setSelectedDayDetail(null)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail & Reschedule Modal */}
      {selectedPostDetail && (
        <div className="social-modal-overlay">
          <div className="social-modal-content" style={{ maxWidth: 640 }}>
            <div className="social-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={`status-pill ${selectedPostDetail.status}`}>
                  {selectedPostDetail.status.replace("_", " ")}
                </span>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                  {selectedPostDetail.title || "Post Details"}
                </h3>
              </div>
              <button onClick={() => setSelectedPostDetail(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div className="social-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Media Preview if any */}
              {selectedPostDetail.media_urls?.[0] && (
                <div style={{ width: "100%", maxHeight: 240, borderRadius: 12, overflow: "hidden", background: "#0f172a" }}>
                  <img
                    src={selectedPostDetail.media_urls[0]}
                    alt="Post media"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Caption */}
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.88rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {selectedPostDetail.primary_caption}
                {selectedPostDetail.hashtags && (
                  <div style={{ marginTop: 8, color: "#4f46e5", fontWeight: 600, fontSize: "0.82rem" }}>
                    {selectedPostDetail.hashtags}
                  </div>
                )}
              </div>

              {/* Details strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.82rem", color: "#64748b" }}>
                <div>
                  <strong>Client:</strong> {selectedPostDetail.client_name}
                </div>
                <div>
                  <strong>Platforms:</strong> {(selectedPostDetail.platforms || []).join(", ")}
                </div>
                <div>
                  <strong>Priority:</strong>{" "}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontWeight: 800,
                      color: PRIORITY_CONFIG[selectedPostDetail.priority || "medium"]?.badgeColor || "#0284c7",
                    }}
                  >
                    {PRIORITY_CONFIG[selectedPostDetail.priority || "medium"]?.dot || "🔵"}{" "}
                    {PRIORITY_CONFIG[selectedPostDetail.priority || "medium"]?.label || "Medium"}
                  </span>
                </div>
                <div>
                  <strong>Scheduled:</strong> {selectedPostDetail.scheduled_at ? new Date(selectedPostDetail.scheduled_at).toLocaleString() : "Not scheduled"}
                </div>
                <div>
                  <strong>Status:</strong> {selectedPostDetail.status}
                </div>
              </div>

              {/* Reschedule section */}
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: 14, borderRadius: 10 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1e40af", marginBottom: 6 }}>
                  Quick Drag / Reschedule DateTime
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="datetime-local"
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #93c5fd", fontSize: "0.85rem", background: "#fff" }}
                  />
                  <button
                    onClick={handleReschedule}
                    disabled={rescheduling}
                    style={{ padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                  >
                    Update Schedule
                  </button>
                </div>
              </div>

            </div>

            <div className="social-modal-footer">
              {selectedPostDetail.status !== "published" && (
                <button
                  onClick={() => handlePublishNow(selectedPostDetail.id)}
                  style={{ padding: "8px 16px", borderRadius: 8, background: "#10b981", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Send size={14} /> Publish Now
                </button>
              )}
              <button
                onClick={() => setSelectedPostDetail(null)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
