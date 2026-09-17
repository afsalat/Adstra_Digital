"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  Users,
  Network,
  Building2,
  Mail,
  Phone,
  Search,
  ChevronDown,
  ChevronRight,
  Shield,
  Palette,
  Briefcase,
  Code,
  Sparkles,
  Filter,
} from "lucide-react";

const TEAM_HIERARCHY_DATA = {
  id: "afsal",
  name: "Afsal AT",
  designation: "Founder & Lead Strategist",
  department: "Leadership",
  role: "super_admin",
  color: "#4f46e5",
  avatar: "A",
  children: [
    {
      id: "dept-creative",
      name: "Sunsreekumar K",
      designation: "Creative & Motion Graphics Lead",
      department: "Creative & Media Production",
      role: "Team Lead",
      color: "#8b5cf6",
      avatar: "S",
      children: [
        { id: "vineet", name: "Vineet", designation: "Video Editor", department: "Video Production", color: "#8b5cf6", avatar: "V" },
        { id: "hashik", name: "Hashik E K", designation: "Motion Graphic Designer", department: "Animation", color: "#8b5cf6", avatar: "H" },
        { id: "rafia", name: "Rafia Ali", designation: "Creative Designer", department: "Graphics", color: "#8b5cf6", avatar: "R" },
        { id: "jasil", name: "Muhammed Jasil", designation: "Visual Designer", department: "Graphics", color: "#8b5cf6", avatar: "J" },
        { id: "jidu", name: "Jidu Krishnan", designation: "Motion Graphic Designer", department: "Animation", color: "#8b5cf6", avatar: "J" },
      ],
    },
    {
      id: "dept-marketing",
      name: "Manoj",
      designation: "Marketing & Growth Executive",
      department: "Performance Marketing",
      role: "Executive",
      color: "#10b981",
      avatar: "M",
      children: [
        { id: "iyrine", name: "Iyrine Reetha", designation: "Sales & Client Marketing", department: "Sales", color: "#10b981", avatar: "I" },
        { id: "amaljith", name: "Amaljith", designation: "Campaign Operations", department: "Marketing", color: "#10b981", avatar: "A" },
        { id: "divya", name: "Maddipati Laxmi Divya", designation: "Social Media Strategist", department: "Social Media", color: "#ec4899", avatar: "D" },
        { id: "aradhya", name: "Aradhya", designation: "Social Media Specialist", department: "Social Media", color: "#ec4899", avatar: "A" },
      ],
    },
    {
      id: "dept-seo",
      name: "Sharda Bai",
      designation: "SEO & Search Engine Lead",
      department: "Search & Content Optimization",
      role: "Specialist",
      color: "#f59e0b",
      avatar: "S",
      children: [
        { id: "komal", name: "Komal Kanojia", designation: "SEO & Content Analyst", department: "SEO", color: "#f59e0b", avatar: "K" },
      ],
    },
    {
      id: "dept-tech",
      name: "Muhammed Mishal K",
      designation: "Digital Solutions & Tech Lead",
      department: "Software & Web Tech",
      role: "Lead",
      color: "#0284c7",
      avatar: "M",
      children: [
        { id: "kiran", name: "Kiran Kishor", designation: "Backend Python Engineer", department: "Backend Tech", color: "#0284c7", avatar: "K" },
        { id: "jagath", name: "Jagath Krishna KM", designation: "Mobile & Flutter Developer", department: "Mobile Tech", color: "#0284c7", avatar: "J" },
        { id: "athira", name: "Athira Shylesh", designation: "Web Application Developer", department: "Web Tech", color: "#0284c7", avatar: "A" },
      ],
    },
  ],
};

export default function TeamDesignationTreeTab() {
  const [viewStyle, setViewStyle] = useState("tree"); // 'tree' | 'directory'
  const [activeDeptFilter, setActiveDeptFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  // Flatten members for search and directory
  const allMembers = [];
  const traverse = (node) => {
    allMembers.push(node);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  traverse(TEAM_HIERARCHY_DATA);

  const filteredMembers = allMembers.filter((m) => {
    if (activeDeptFilter !== "all" && !m.department.toLowerCase().includes(activeDeptFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.designation.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      
      {/* Filter, Search & View Toggle Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "14px 20px", borderRadius: 14, border: "1px solid #e2e8f0", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Members (${allMembers.length})` },
            { id: "creative", label: "Creative & Video" },
            { id: "marketing", label: "Marketing & Social" },
            { id: "seo", label: "SEO & Content" },
            { id: "tech", label: "Engineering & Tech" },
          ].map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDeptFilter(dept.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                background: activeDeptFilter === dept.id ? "#0f172a" : "#f1f5f9",
                color: activeDeptFilter === dept.id ? "#ffffff" : "#475569",
              }}
            >
              {dept.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* View Toggle */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <button
              onClick={() => setViewStyle("tree")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                background: viewStyle === "tree" ? "#0f172a" : "transparent",
                color: viewStyle === "tree" ? "#ffffff" : "#64748b",
              }}
            >
              Visual Tree Chart
            </button>
            <button
              onClick={() => setViewStyle("directory")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                background: viewStyle === "directory" ? "#0f172a" : "transparent",
                color: viewStyle === "directory" ? "#ffffff" : "#64748b",
              }}
            >
              Designation Directory
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "6px 14px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or designation..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.85rem", width: 200 }}
            />
          </div>
        </div>
      </div>

      {/* Visual Tree Chart View */}
      {viewStyle === "tree" ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 18,
            border: "1px solid #e2e8f0",
            padding: "36px 20px",
            overflowX: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Level 1: Founder & Managing Director */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
                color: "#ffffff",
                borderRadius: 16,
                padding: "16px 24px",
                boxShadow: "0 8px 24px rgba(67, 56, 202, 0.25)",
                textAlign: "center",
                minWidth: 260,
                border: "2px solid #818cf8",
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#ffffff", color: "#4338ca", fontWeight: 900, fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                A
              </div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>Afsal AT</h3>
              <div style={{ fontSize: "0.82rem", opacity: 0.9, marginTop: 2 }}>
                Founder & Lead Strategist
              </div>
              <span style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 700, marginTop: 8 }}>
                Executive Leadership
              </span>
            </div>

            {/* Downward connector stem */}
            <div style={{ width: 2, height: 36, background: "#cbd5e1" }} />
          </div>

          {/* Level 2: Department Branches */}
          <div style={{ position: "relative", width: "100%", maxWidth: 1100 }}>
            {/* Horizontal branch bar */}
            <div style={{ height: 2, background: "#cbd5e1", margin: "0 auto", width: "84%" }} />

            {/* Department columns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 0 }}>
              {TEAM_HIERARCHY_DATA.children.map((dept) => (
                <div key={dept.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Stem to dept card */}
                  <div style={{ width: 2, height: 24, background: "#cbd5e1" }} />

                  {/* Dept Head Node Card */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: `2px solid ${dept.color}`,
                      borderRadius: 14,
                      padding: "14px 16px",
                      width: "100%",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: dept.color, color: "#fff", fontWeight: 800, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                      {dept.avatar}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>
                      {dept.name}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: dept.color, fontWeight: 700, marginTop: 2 }}>
                      {dept.designation}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4, background: "#f8fafc", padding: "2px 6px", borderRadius: 4 }}>
                      {dept.department}
                    </div>
                  </div>

                  {/* Downward stem to specialists */}
                  <div style={{ width: 2, height: 20, background: "#e2e8f0" }} />

                  {/* Specialists Nodes under this Dept */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                    {(dept.children || []).map((spec) => (
                      <div
                        key={spec.id}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                        }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: dept.color, color: "#fff", fontWeight: 700, fontSize: "0.78rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {spec.avatar}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {spec.name}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {spec.designation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Designation Directory Table View */
        <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 20px" }}>Team Member</th>
                <th style={{ padding: "14px 20px" }}>Designation</th>
                <th style={{ padding: "14px 20px" }}>Department</th>
                <th style={{ padding: "14px 20px" }}>Hierarchy Level</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: m.color || "#4f46e5", color: "#fff", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {m.avatar}
                      </div>
                      <strong style={{ color: "#0f172a" }}>{m.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontWeight: 700, color: "#334155" }}>
                    {m.designation}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>
                    {m.department}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, background: "#f1f5f9", padding: "4px 8px", borderRadius: 6, color: "#475569" }}>
                      {m.role || "Specialist"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ color: "#10b981", fontSize: "0.8rem", fontWeight: 700 }}>
                      ● Active Team
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section Placeholder Note */}
      <div style={{ background: "#f1f5f9", border: "1px dashed #cbd5e1", borderRadius: 14, padding: "16px 20px", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
        <strong>Team Designation Chart Tree Section Ready:</strong> You can tell us what reporting rules, employee designation changes, or task assignees you want inside this tree next.
      </div>

    </div>
  );
}
