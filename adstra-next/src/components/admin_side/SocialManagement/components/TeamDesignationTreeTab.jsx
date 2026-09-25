"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import {
  Users,
  Search,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  X,
  Sparkles,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

// Storage key dedicated to Marketing, Social Media & Designers hierarchy
const STORAGE_KEY = "adstra_marketing_social_design_tree_v3";

// Initial User Management dataset for instant suggestions
const INITIAL_USER_MANAGEMENT_STAFF = [
  { fullname: "Afsal AT", designation: "Founder & Lead Growth Strategist", role: "super_admin", username: "afsal@123" },
  { fullname: "Sunsreekumar K", designation: "Creative & Design Lead", role: "Motion Graphic Designer", username: "sunsreekumar@123" },
  { fullname: "Manoj", designation: "Digital Marketing & Performance Lead", role: "Marketing Executive", username: "manoj@123" },
  { fullname: "Sharda Bai", designation: "SEO & Search Engine Specialist", role: "SEO Specialist", username: "sharda@123" },
  { fullname: "Maddipati Laxmi Divya", designation: "Social Media & Community Lead", role: "Social Media Intern", username: "divya@123" },
  { fullname: "Vineet", designation: "Video Editor & Post-Production", role: "Video Editor", username: "vineet@123" },
  { fullname: "Hashik E K", designation: "Motion Graphic Designer", role: "Motion Graphic Designer", username: "ashik@123" },
  { fullname: "Rafia Ali", designation: "Creative & Graphic Designer", role: "Designer", username: "rafia@456" },
  { fullname: "Muhammed Jasil", designation: "Visual Brand & UI Designer", role: "Designer", username: "jasil@123" },
  { fullname: "Jidu Krishnan", designation: "Motion & Graphic Artist", role: "Motion Graphic Designer", username: "jidu@123" },
  { fullname: "Amaljith", designation: "Paid Media & Campaign Operations", role: "Sales and Marketing", username: "amaljith@123" },
  { fullname: "Iyrine Reetha", designation: "Growth & Client Marketing", role: "Sales and Marketing", username: "iyrine@123" },
  { fullname: "Komal Kanojia", designation: "Search & Content Analyst", role: "SEO Analyst", username: "komal@123" },
  { fullname: "Aradhya", designation: "Social Media Content Specialist", role: "Social Media Intern", username: "aradhya@123" },
  { fullname: "Ananya Menon", designation: "Creative Copy & Caption Writer", role: "Content Writer", username: "ananya@123" },
  { fullname: "Farhan Ali", designation: "Community & Engagement Strategist", role: "Social Media", username: "farhan@123" },
];

// Dedicated organizational structure for Digital Marketing, Social Media & Creative Designers
const DEFAULT_TEAM_HIERARCHY = {
  id: "afsal",
  name: "Afsal AT",
  designation: "Founder & Lead Growth Strategist",
  department: "Lead of These 3 Departments",
  role: "Founder / Executive",
  color: "#4f46e5",
  avatar: "A",
  children: [
    {
      id: "dept-creative",
      name: "Sunsreekumar K",
      designation: "Creative & Design Lead",
      department: "Creative & Graphic Design",
      role: "Team Lead",
      color: "#8b5cf6",
      avatar: "S",
      children: [
        { id: "vineet", name: "Vineet", designation: "Video Editor & Post-Production", department: "Creative & Graphic Design", role: "Specialist", color: "#8b5cf6", avatar: "V" },
        { id: "hashik", name: "Hashik E K", designation: "Motion Graphic Designer", department: "Creative & Graphic Design", role: "Specialist", color: "#8b5cf6", avatar: "H" },
        { id: "rafia", name: "Rafia Ali", designation: "Creative & Graphic Designer", department: "Creative & Graphic Design", role: "Specialist", color: "#8b5cf6", avatar: "R" },
        { id: "jasil", name: "Muhammed Jasil", designation: "Visual Brand & UI Designer", department: "Creative & Graphic Design", role: "Specialist", color: "#8b5cf6", avatar: "J" },
        { id: "jidu", name: "Jidu Krishnan", designation: "Motion & Graphic Artist", department: "Creative & Graphic Design", role: "Specialist", color: "#8b5cf6", avatar: "J" },
      ],
    },
    {
      id: "dept-marketing",
      name: "Manoj",
      designation: "Digital Marketing & Performance Lead",
      department: "Digital Marketing & Growth",
      role: "Team Lead",
      color: "#10b981",
      avatar: "M",
      children: [
        { id: "amaljith", name: "Amaljith", designation: "Paid Media & Campaign Operations", department: "Digital Marketing & Growth", role: "Specialist", color: "#10b981", avatar: "A" },
        { id: "iyrine", name: "Iyrine Reetha", designation: "Growth & Client Marketing", department: "Digital Marketing & Growth", role: "Specialist", color: "#10b981", avatar: "I" },
        { id: "sharda", name: "Sharda Bai", designation: "SEO & Search Engine Specialist", department: "Digital Marketing & Growth", role: "Specialist", color: "#10b981", avatar: "S" },
        { id: "komal", name: "Komal Kanojia", designation: "Search & Content Analyst", department: "Digital Marketing & Growth", role: "Specialist", color: "#10b981", avatar: "K" },
      ],
    },
    {
      id: "dept-social",
      name: "Maddipati Laxmi Divya",
      designation: "Social Media & Community Lead",
      department: "Social Media Management",
      role: "Team Lead",
      color: "#ec4899",
      avatar: "D",
      children: [
        { id: "aradhya", name: "Aradhya", designation: "Social Media Content Specialist", department: "Social Media Management", role: "Specialist", color: "#ec4899", avatar: "A" },
        { id: "ananya", name: "Ananya Menon", designation: "Creative Copy & Caption Writer", department: "Social Media Management", role: "Specialist", color: "#ec4899", avatar: "A" },
        { id: "farhan", name: "Farhan Ali", designation: "Community & Engagement Strategist", department: "Social Media Management", role: "Specialist", color: "#ec4899", avatar: "F" },
      ],
    },
  ],
};

const PRESET_COLORS = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Pink", value: "#ec4899" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Sky Blue", value: "#0284c7" },
  { name: "Rose", value: "#e11d48" },
  { name: "Slate", value: "#0f172a" },
];

const PRESET_DEPARTMENTS = [
  "Lead of These 3 Departments",
  "Creative & Graphic Design",
  "Digital Marketing & Growth",
  "Social Media Management",
];

// Helper to filter out any tech/software roles or dummy entries
function sanitizeMarketingHierarchy(data) {
  if (!data || !Array.isArray(data.children)) return DEFAULT_TEAM_HIERARCHY;

  // Ensure root node has Lead of These 3 Departments if it had Executive Leadership or Lead of All Departments
  let updatedRoot = { ...data };
  if (
    !updatedRoot.department ||
    updatedRoot.department === "Executive Leadership" ||
    updatedRoot.department === "Lead of All Departments" ||
    updatedRoot.department === "Lead of All"
  ) {
    updatedRoot.department = "Lead of These 3 Departments";
  }

  const validLeads = data.children.filter((lead) => {
    const name = (lead.name || "").toLowerCase();
    const dept = (lead.department || "").toLowerCase();
    const desig = (lead.designation || "").toLowerCase();

    // Filter out software / web tech and dummy tests
    if (dept.includes("software") || dept.includes("tech") || desig.includes("tech lead")) return false;
    if (name.includes("sada") || name.includes("asdasd") || name.includes("test")) return false;
    return true;
  });

  if (validLeads.length === 0) return DEFAULT_TEAM_HIERARCHY;

  return {
    ...updatedRoot,
    children: validLeads,
  };
}

export default function TeamDesignationTreeTab() {
  const [viewStyle, setViewStyle] = useState("tree"); // 'tree' | 'directory'
  const [activeDeptFilter, setActiveDeptFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Hierarchy Tree State with localStorage persistence
  const [treeData, setTreeData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id && Array.isArray(parsed.children)) {
            return sanitizeMarketingHierarchy(parsed);
          }
        }
      } catch (err) {
        console.warn("Could not read saved hierarchy:", err);
      }
    }
    return DEFAULT_TEAM_HIERARCHY;
  });

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);

  // Swap Modal States
  const [swapMemberA, setSwapMemberA] = useState("");
  const [swapMemberB, setSwapMemberB] = useState("");

  // Form State for Editing/Adding
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    designation: "",
    department: "Creative & Graphic Design",
    role: "Specialist",
    color: "#8b5cf6",
    level: "specialist", // 'root' | 'lead' | 'specialist'
    reportsToLeadId: "",
  });

  // Live User Management state for suggestions
  const [systemUsers, setSystemUsers] = useState(INITIAL_USER_MANAGEMENT_STAFF);
  const [showEditNameSuggestions, setShowEditNameSuggestions] = useState(false);
  const [showAddNameSuggestions, setShowAddNameSuggestions] = useState(false);

  // Fetch live User Management list from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE_URL}/user/user-list/`, { headers });
        if (res.data && Array.isArray(res.data.users) && res.data.users.length > 0) {
          const fetched = res.data.users
            .map((u) => ({
              id: u.id,
              fullname: (u.fullname || u.username || "").trim(),
              designation: (u.designation || "").trim(),
              role: u.role || "employee",
              username: u.username || "",
              email: u.email || "",
            }))
            .filter((u) => u.fullname);

          setSystemUsers((prev) => {
            const map = new Map();
            [...fetched, ...prev].forEach((item) => {
              if (item.fullname && !map.has(item.fullname.toLowerCase())) {
                map.set(item.fullname.toLowerCase(), item);
              }
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn("Could not fetch user-list from backend, using default user management list:", err);
      }
    };

    fetchUsers();
  }, []);

  // Filter user suggestions based on currently typed name
  const getUserSuggestions = useCallback((typedName) => {
    if (!typedName || !typedName.trim()) {
      return systemUsers.slice(0, 10);
    }
    const q = typedName.toLowerCase().trim();
    return systemUsers.filter((u) => {
      const name = (u.fullname || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      const desig = (u.designation || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      return name.includes(q) || username.includes(q) || desig.includes(q) || role.includes(q);
    }).slice(0, 10);
  }, [systemUsers]);

  // Handler when selecting a user from suggestion list
  const handleSelectUser = (user, isAddModal = false) => {
    const selectedName = user.fullname?.trim() || user.username || "";
    const selectedDesignation = user.designation?.trim() || "";

    // Automatically align department based on designation/role if possible
    let autoDept = formData.department;
    const combined = (selectedDesignation + " " + (user.role || "")).toLowerCase();
    if (combined.includes("founder") || combined.includes("ceo") || combined.includes("super_admin") || combined.includes("managing director") || combined.includes("lead of") || combined.includes("3 depart")) {
      autoDept = "Lead of These 3 Departments";
    } else if (combined.includes("video") || combined.includes("graphic") || combined.includes("designer") || combined.includes("motion") || combined.includes("ui") || combined.includes("visual") || combined.includes("artist")) {
      autoDept = "Creative & Graphic Design";
    } else if (combined.includes("social") || combined.includes("community") || combined.includes("copy") || combined.includes("caption") || combined.includes("content")) {
      autoDept = "Social Media Management";
    } else if (combined.includes("seo") || combined.includes("marketing") || combined.includes("growth") || combined.includes("ads") || combined.includes("campaign") || combined.includes("search")) {
      autoDept = "Digital Marketing & Growth";
    }

    setFormData((prev) => ({
      ...prev,
      name: selectedName,
      designation: selectedDesignation || prev.designation,
      department: autoDept,
      role: user.role && user.role !== "employee" ? user.role.replace(/_/g, " ") : prev.role,
    }));

    if (isAddModal) {
      setShowAddNameSuggestions(false);
    } else {
      setShowEditNameSuggestions(false);
    }
  };

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && treeData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(treeData));
      } catch (err) {
        console.warn("Could not save hierarchy:", err);
      }
    }
  }, [treeData]);

  // Show temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2800);
  };

  // Flatten all members for directory, search, and swap selection
  const { allMembers, departmentLeads } = useMemo(() => {
    const list = [];
    const leads = [];

    // Root
    list.push({ ...treeData, level: "root", parentId: null });

    // Leads & Specialists
    if (Array.isArray(treeData.children)) {
      treeData.children.forEach((lead) => {
        list.push({ ...lead, level: "lead", parentId: treeData.id });
        leads.push({ id: lead.id, name: lead.name, designation: lead.designation, department: lead.department, color: lead.color });

        if (Array.isArray(lead.children)) {
          lead.children.forEach((spec) => {
            list.push({ ...spec, level: "specialist", parentId: lead.id, leadName: lead.name });
          });
        }
      });
    }

    return { allMembers: list, departmentLeads: leads };
  }, [treeData]);

  // Unique departments for filter pills
  const departmentOptions = useMemo(() => {
    const depts = new Set();
    allMembers.forEach((m) => {
      const d = (m.department || "").toLowerCase();
      if (
        m.department &&
        !d.includes("executive") &&
        !d.includes("lead of") &&
        !d.includes("3 depart")
      ) {
        depts.add(m.department);
      }
    });
    return Array.from(depts);
  }, [allMembers]);

  // Filtered members for directory view or search
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      if (activeDeptFilter !== "all" && m.department.toLowerCase() !== activeDeptFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          m.name.toLowerCase().includes(q) ||
          m.designation.toLowerCase().includes(q) ||
          (m.department && m.department.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allMembers, activeDeptFilter, searchQuery]);

  // Filter department columns for visual tree view based on activeDeptFilter and searchQuery
  const visibleTreeDepts = useMemo(() => {
    return (treeData.children || []).filter((dept) => {
      // 1. Department Filter
      if (activeDeptFilter !== "all" && dept.department.toLowerCase() !== activeDeptFilter.toLowerCase()) {
        return false;
      }
      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const leadMatches =
          dept.name.toLowerCase().includes(q) ||
          dept.designation.toLowerCase().includes(q) ||
          dept.department.toLowerCase().includes(q);
        const specMatches = (dept.children || []).some(
          (s) => s.name.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q)
        );
        return leadMatches || specMatches;
      }
      return true;
    });
  }, [treeData.children, activeDeptFilter, searchQuery]);

  // Open Edit Modal for a given member
  const handleOpenEdit = useCallback((member) => {
    let level = "specialist";
    let reportsToLeadId = "";

    if (member.id === treeData.id) {
      level = "root";
    } else if (treeData.children?.some((lead) => lead.id === member.id)) {
      level = "lead";
      reportsToLeadId = treeData.id;
    } else {
      level = "specialist";
      const parentLead = treeData.children?.find((lead) =>
        lead.children?.some((s) => s.id === member.id)
      );
      if (parentLead) {
        reportsToLeadId = parentLead.id;
      }
    }

    setEditingNode(member);
    setFormData({
      id: member.id,
      name: member.name,
      designation: member.designation,
      department:
        member.department === "Executive Leadership" ||
        member.department === "Lead of All Departments" ||
        member.department === "Lead of All"
          ? "Lead of These 3 Departments"
          : (member.department || (level === "root" ? "Lead of These 3 Departments" : "Creative & Graphic Design")),
      role: member.role || (level === "lead" ? "Team Lead" : level === "root" ? "Executive Leadership" : "Specialist"),
      color: member.color || "#8b5cf6",
      level: level,
      reportsToLeadId: reportsToLeadId || (departmentLeads[0]?.id || ""),
    });
    setIsEditModalOpen(true);
  }, [treeData, departmentLeads]);

  // Open Add Modal
  const handleOpenAdd = () => {
    const defaultLead = departmentLeads[0] || null;
    setFormData({
      id: `staff-${Date.now()}`,
      name: "",
      designation: "",
      department: defaultLead ? defaultLead.department : "Creative & Graphic Design",
      role: "Specialist",
      color: defaultLead ? defaultLead.color : "#8b5cf6",
      level: "specialist",
      reportsToLeadId: defaultLead ? defaultLead.id : "",
    });
    setIsAddModalOpen(true);
  };

  // Open Swap Modal
  const handleOpenSwap = (preselectedAId = null) => {
    const firstA = preselectedAId || (allMembers[1]?.id || "");
    const firstB = allMembers.find((m) => m.id !== firstA && m.id !== treeData.id)?.id || "";
    setSwapMemberA(firstA);
    setSwapMemberB(firstB);
    setIsSwapModalOpen(true);
  };

  // Direct Quick Remove / Delete Function
  const handleDirectRemove = (memberId, memberName) => {
    if (memberId === treeData.id) {
      alert("Executive Leadership (Root) cannot be removed.");
      return;
    }

    if (!confirm(`Are you sure you want to remove "${memberName}" from the team hierarchy?`)) {
      return;
    }

    setTreeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));

      // Check if it's a lead
      const leadIndex = copy.children.findIndex((l) => l.id === memberId);
      if (leadIndex !== -1) {
        const removedLead = copy.children[leadIndex];
        const remainingLeads = copy.children.filter((l) => l.id !== memberId);

        // If the removed lead had specialists, reassign them to first remaining lead
        if (removedLead.children && removedLead.children.length > 0 && remainingLeads.length > 0) {
          remainingLeads[0].children = [...(remainingLeads[0].children || []), ...removedLead.children];
        }

        copy.children = remainingLeads;
        return copy;
      }

      // Check specialists
      copy.children.forEach((lead) => {
        if (Array.isArray(lead.children)) {
          const specIndex = lead.children.findIndex((s) => s.id === memberId);
          if (specIndex !== -1) {
            lead.children.splice(specIndex, 1);
          }
        }
      });

      return copy;
    });

    if (isEditModalOpen && editingNode?.id === memberId) {
      setIsEditModalOpen(false);
    }
    showToast(`Removed "${memberName}" from the organization.`);
  };

  // Move Lead Left or Right in column order
  const handleMoveLead = (index, direction) => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= (treeData.children?.length || 0)) return;

    setTreeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const temp = copy.children[index];
      copy.children[index] = copy.children[targetIndex];
      copy.children[targetIndex] = temp;
      return copy;
    });

    showToast(`Moved department position ${direction === "left" ? "left" : "right"}.`);
  };

  // Move Specialist Up or Down within their department lead
  const handleMoveSpecialist = (leadId, specIndex, direction) => {
    setTreeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const lead = copy.children.find((l) => l.id === leadId);
      if (!lead || !Array.isArray(lead.children)) return prev;

      const targetIndex = direction === "up" ? specIndex - 1 : specIndex + 1;
      if (targetIndex < 0 || targetIndex >= lead.children.length) return prev;

      const temp = lead.children[specIndex];
      lead.children[specIndex] = lead.children[targetIndex];
      lead.children[targetIndex] = temp;

      return copy;
    });

    showToast(`Specialist reordered ${direction === "up" ? "up" : "down"}.`);
  };

  // Execute Swap of Two Members' Positions
  const handleExecuteSwap = () => {
    if (!swapMemberA || !swapMemberB || swapMemberA === swapMemberB) {
      alert("Please select two different team members to swap positions.");
      return;
    }

    if (swapMemberA === treeData.id || swapMemberB === treeData.id) {
      alert("The Executive Leadership (Founder) position cannot be swapped.");
      return;
    }

    const memberA = allMembers.find((m) => m.id === swapMemberA);
    const memberB = allMembers.find((m) => m.id === swapMemberB);

    if (!memberA || !memberB) return;

    setTreeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));

      let aIsLead = false;
      let aLeadIdx = -1;
      let aSpecIdx = -1;

      let bIsLead = false;
      let bLeadIdx = -1;
      let bSpecIdx = -1;

      copy.children.forEach((l, lIdx) => {
        if (l.id === swapMemberA) {
          aIsLead = true;
          aLeadIdx = lIdx;
        } else if (Array.isArray(l.children)) {
          const sIdx = l.children.findIndex((s) => s.id === swapMemberA);
          if (sIdx !== -1) {
            aLeadIdx = lIdx;
            aSpecIdx = sIdx;
          }
        }

        if (l.id === swapMemberB) {
          bIsLead = true;
          bLeadIdx = lIdx;
        } else if (Array.isArray(l.children)) {
          const sIdx = l.children.findIndex((s) => s.id === swapMemberB);
          if (sIdx !== -1) {
            bLeadIdx = lIdx;
            bSpecIdx = sIdx;
          }
        }
      });

      // Case 1: Both are Leads -> Swap their column positions
      if (aIsLead && bIsLead) {
        const temp = copy.children[aLeadIdx];
        copy.children[aLeadIdx] = copy.children[bLeadIdx];
        copy.children[bLeadIdx] = temp;
        return copy;
      }

      // Case 2: Both are Specialists under SAME lead -> Swap order
      if (!aIsLead && !bIsLead && aLeadIdx === bLeadIdx) {
        const lead = copy.children[aLeadIdx];
        const temp = lead.children[aSpecIdx];
        lead.children[aSpecIdx] = lead.children[bSpecIdx];
        lead.children[bSpecIdx] = temp;
        return copy;
      }

      // Case 3: Both are Specialists under DIFFERENT leads -> Swap slots
      if (!aIsLead && !bIsLead && aLeadIdx !== bLeadIdx) {
        const nodeA = copy.children[aLeadIdx].children[aSpecIdx];
        const nodeB = copy.children[bLeadIdx].children[bSpecIdx];

        copy.children[aLeadIdx].children[aSpecIdx] = nodeB;
        copy.children[bLeadIdx].children[bSpecIdx] = nodeA;
        return copy;
      }

      // Case 4: One is Lead (A) and one is Specialist (B)
      if (aIsLead && !bIsLead) {
        const leadA = copy.children[aLeadIdx];
        const specB = copy.children[bLeadIdx].children[bSpecIdx];

        const tempLeadInfo = {
          id: leadA.id,
          name: leadA.name,
          designation: leadA.designation,
          avatar: leadA.avatar,
        };

        leadA.id = specB.id;
        leadA.name = specB.name;
        leadA.designation = specB.designation;
        leadA.avatar = specB.avatar;

        specB.id = tempLeadInfo.id;
        specB.name = tempLeadInfo.name;
        specB.designation = tempLeadInfo.designation;
        specB.avatar = tempLeadInfo.avatar;

        return copy;
      }

      // Case 5: B is Lead, A is Specialist
      if (!aIsLead && bIsLead) {
        const leadB = copy.children[bLeadIdx];
        const specA = copy.children[aLeadIdx].children[aSpecIdx];

        const tempLeadInfo = {
          id: leadB.id,
          name: leadB.name,
          designation: leadB.designation,
          avatar: leadB.avatar,
        };

        leadB.id = specA.id;
        leadB.name = specA.name;
        leadB.designation = specA.designation;
        leadB.avatar = specA.avatar;

        specA.id = tempLeadInfo.id;
        specA.name = tempLeadInfo.name;
        specA.designation = tempLeadInfo.designation;
        specA.avatar = tempLeadInfo.avatar;

        return copy;
      }

      return copy;
    });

    setIsSwapModalOpen(false);
    showToast(`Swapped positions between "${memberA.name}" and "${memberB.name}"!`);
  };

  // Save changes to edited member
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim()) return;

    const updatedAvatar = formData.name.trim().charAt(0).toUpperCase();

    setTreeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));

      // Case 1: Editing Root Node
      if (formData.id === copy.id) {
        copy.name = formData.name.trim();
        copy.designation = formData.designation.trim();
        copy.department = formData.department.trim();
        copy.role = formData.role.trim();
        copy.color = formData.color;
        copy.avatar = updatedAvatar;
        return copy;
      }

      let oldLeadIndex = -1;
      let oldSpecIndex = -1;
      let isCurrentlyLead = false;

      copy.children.forEach((lead, lIdx) => {
        if (lead.id === formData.id) {
          isCurrentlyLead = true;
          oldLeadIndex = lIdx;
        } else if (Array.isArray(lead.children)) {
          const sIdx = lead.children.findIndex((s) => s.id === formData.id);
          if (sIdx !== -1) {
            oldLeadIndex = lIdx;
            oldSpecIndex = sIdx;
          }
        }
      });

      const updatedNode = {
        id: formData.id,
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        role: formData.role.trim(),
        color: formData.color,
        avatar: updatedAvatar,
      };

      // Scenario A: Was a Lead, stays a Lead
      if (isCurrentlyLead && formData.level === "lead") {
        const existingChildren = copy.children[oldLeadIndex].children || [];
        copy.children[oldLeadIndex] = {
          ...updatedNode,
          children: existingChildren,
        };
        return copy;
      }

      // Scenario B: Was a Specialist, promoted to Lead
      if (!isCurrentlyLead && formData.level === "lead") {
        if (oldLeadIndex !== -1 && oldSpecIndex !== -1) {
          copy.children[oldLeadIndex].children.splice(oldSpecIndex, 1);
        }
        copy.children.push({
          ...updatedNode,
          children: [],
        });
        return copy;
      }

      // Scenario C: Was a Lead, demoted to Specialist under another lead
      if (isCurrentlyLead && formData.level === "specialist") {
        const previousChildren = copy.children[oldLeadIndex].children || [];
        copy.children.splice(oldLeadIndex, 1);

        const targetLead = copy.children.find((l) => l.id === formData.reportsToLeadId) || copy.children[0];
        if (targetLead) {
          targetLead.children.push(updatedNode);
          if (previousChildren.length > 0) {
            targetLead.children.push(...previousChildren);
          }
        }
        return copy;
      }

      // Scenario D: Was a Specialist, stays a Specialist
      if (!isCurrentlyLead && formData.level === "specialist") {
        if (oldLeadIndex !== -1 && oldSpecIndex !== -1) {
          copy.children[oldLeadIndex].children.splice(oldSpecIndex, 1);
        }

        const targetLead = copy.children.find((l) => l.id === formData.reportsToLeadId);
        if (targetLead) {
          targetLead.children.push(updatedNode);
        } else if (copy.children[0]) {
          copy.children[0].children.push(updatedNode);
        }
        return copy;
      }

      return copy;
    });

    setIsEditModalOpen(false);
    showToast(`Updated "${formData.name}" successfully.`);
  };

  // Add new team member
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim()) return;

    const newId = `staff-${Date.now()}`;
    const newAvatar = formData.name.trim().charAt(0).toUpperCase();

    const newNode = {
      id: newId,
      name: formData.name.trim(),
      designation: formData.designation.trim(),
      department: formData.department.trim(),
      role: formData.role.trim() || "Specialist",
      color: formData.color,
      avatar: newAvatar,
    };

    setTreeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));

      if (formData.level === "lead") {
        copy.children.push({
          ...newNode,
          children: [],
        });
      } else {
        const targetLead = copy.children.find((l) => l.id === formData.reportsToLeadId) || copy.children[0];
        if (targetLead) {
          if (!targetLead.children) targetLead.children = [];
          targetLead.children.push(newNode);
        }
      }

      return copy;
    });

    setIsAddModalOpen(false);
    showToast(`Added new staff member "${formData.name}".`);
  };

  // Reset to default organization structure
  const handleResetDefault = () => {
    if (confirm("Reset the team chart to the standard Digital Marketing, Social Media & Designers structure? Any custom edits will be refreshed.")) {
      setTreeData(DEFAULT_TEAM_HIERARCHY);
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      showToast("Team hierarchy reset to standard Marketing, Social & Design departments.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.85rem",
            fontWeight: 700,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          {toastMessage}
        </div>
      )}

      {/* Filter, Search & Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff",
          padding: "14px 20px",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Department Filters (Marketing, Social Media & Designers) */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setActiveDeptFilter("all")}
            style={{
              padding: "7px 14px",
              borderRadius: 10,
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              background: activeDeptFilter === "all" ? "#0f172a" : "#f1f5f9",
              color: activeDeptFilter === "all" ? "#ffffff" : "#475569",
              transition: "all 0.15s ease",
            }}
          >
            All Marketing & Design ({allMembers.length})
          </button>

          {departmentOptions.map((dept) => {
            const count = allMembers.filter((m) => m.department === dept).length;
            const isActive = activeDeptFilter === dept;
            return (
              <button
                key={dept}
                onClick={() => setActiveDeptFilter(dept)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: isActive ? "#0f172a" : "#f1f5f9",
                  color: isActive ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                }}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>

        {/* View Toggle, Search & Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* View Toggle */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <button
              onClick={() => setViewStyle("tree")}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                background: viewStyle === "tree" ? "#0f172a" : "transparent",
                color: viewStyle === "tree" ? "#ffffff" : "#64748b",
                transition: "all 0.15s ease",
              }}
            >
              Visual Tree Chart
            </button>
            <button
              onClick={() => setViewStyle("directory")}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                background: viewStyle === "directory" ? "#0f172a" : "transparent",
                color: viewStyle === "directory" ? "#ffffff" : "#64748b",
                transition: "all 0.15s ease",
              }}
            >
              Designation Directory
            </button>
          </div>

          {/* Search bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", padding: "6px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search designer, marketer..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.82rem", width: 170 }}
            />
          </div>

          {/* Swap Positions Action */}
          <button
            onClick={() => handleOpenSwap()}
            title="Swap positions between any two team members"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#f0fdf4",
              color: "#166534",
              border: "1.5px solid #86efac",
              padding: "7px 14px",
              borderRadius: 10,
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(22, 101, 52, 0.08)",
              transition: "all 0.15s ease",
            }}
          >
            <ArrowLeftRight size={15} color="#16a34a" /> Swap Position
          </button>

          {/* + Add Member Button */}
          <button
            onClick={handleOpenAdd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#4f46e5",
              color: "#ffffff",
              border: "none",
              padding: "7px 14px",
              borderRadius: 10,
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
              transition: "all 0.15s ease",
            }}
          >
            <Plus size={15} /> Add Staff
          </button>

          {/* Reset to Default */}
          <button
            onClick={handleResetDefault}
            title="Reset to standard Marketing, Social & Design structure"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              color: "#64748b",
              border: "1px solid #cbd5e1",
              padding: "7px 12px",
              borderRadius: 10,
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <RotateCcw size={13} /> Reset Chart
          </button>
        </div>
      </div>

      {/* Domain Scope Guidance Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 12,
          padding: "10px 18px",
          color: "#166534",
          fontSize: "0.82rem",
          fontWeight: 600,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color="#16a34a" />
          <span>
            <strong>Digital Marketing, Social Media & Designers Hub:</strong> Configured exclusively for <strong>Creative & Graphic Designers</strong>, <strong>Digital Marketing & Performance</strong>, and <strong>Social Media Management</strong>.
          </span>
        </div>
        <span style={{ fontSize: "0.75rem", background: "#dcfce7", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
          {activeDeptFilter === "all"
            ? `${allMembers.length} Marketing & Design Staff`
            : `${filteredMembers.length} in ${activeDeptFilter}`}
        </span>
      </div>

      {/* Visual Tree Chart View */}
      {viewStyle === "tree" ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 18,
            border: "1px solid #e2e8f0",
            padding: "40px 24px",
            overflowX: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.02)",
          }}
        >
          {/* Level 1: Founder & Managing Director */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                color: "#ffffff",
                borderRadius: 18,
                padding: "18px 28px",
                boxShadow: "0 10px 28px rgba(49, 46, 129, 0.3)",
                textAlign: "center",
                minWidth: 290,
                border: "2px solid #6366f1",
                position: "relative",
                transition: "all 0.2s ease",
              }}
            >
              {/* Quick Actions for Founder */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "flex",
                  gap: 6,
                }}
              >
                <button
                  onClick={() => handleOpenEdit(treeData)}
                  title="Edit Founder Details"
                  style={{
                    background: "rgba(255, 255, 255, 0.18)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "50%",
                    width: 26,
                    height: 26,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Edit3 size={13} />
                </button>
              </div>

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#ffffff",
                  color: "#312e81",
                  fontWeight: 900,
                  fontSize: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                }}
              >
                {treeData.avatar || "A"}
              </div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>{treeData.name}</h3>
              <div style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: 3 }}>{treeData.designation}</div>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.2)",
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  marginTop: 10,
                  letterSpacing: "0.4px",
                }}
              >
                {treeData.role || "Executive Leadership"}
              </span>
            </div>

            {/* Downward connector stem */}
            <div style={{ width: 2, height: 36, background: "#cbd5e1" }} />
          </div>

          {/* Level 2: Department Branches (Designers, Digital Marketing, Social Media) */}
          <div style={{ position: "relative", width: "100%", maxWidth: 1100 }}>
            {/* Horizontal branch bar */}
            {visibleTreeDepts && visibleTreeDepts.length > 1 && (
              <div
                style={{
                  height: 2,
                  background: "#cbd5e1",
                  margin: "0 auto",
                  width: `${Math.min(92, Math.max(50, (visibleTreeDepts.length - 1) * 35))}%`,
                }}
              />
            )}

            {visibleTreeDepts.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#64748b",
                  background: "#f8fafc",
                  borderRadius: 16,
                  border: "1px dashed #cbd5e1",
                  marginTop: 20,
                  width: "100%",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", marginBottom: 6 }}>
                  No Department Found
                </div>
                <div style={{ fontSize: "0.82rem" }}>
                  No team members matched the selected department or search query.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDeptFilter("all");
                    setSearchQuery("");
                  }}
                  style={{
                    marginTop: 14,
                    padding: "8px 16px",
                    background: "#0f172a",
                    color: "#ffffff",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Show All Departments
                </button>
              </div>
            ) : (
              /* Department columns */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    visibleTreeDepts.length === 1
                      ? "minmax(300px, 460px)"
                      : `repeat(${visibleTreeDepts.length}, minmax(280px, 1fr))`,
                  gap: 20,
                  marginTop: 0,
                  justifyContent: visibleTreeDepts.length === 1 ? "center" : "stretch",
                }}
              >
                {visibleTreeDepts.map((dept) => {
                  const actualDeptIdx = (treeData.children || []).findIndex((d) => d.id === dept.id);
                  const isFirstLead = actualDeptIdx === 0;
                  const isLastLead = actualDeptIdx === (treeData.children?.length || 1) - 1;

                  // Filter specialists under this dept if search query is active
                  const displaySpecialists = (dept.children || []).filter((spec) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase().trim();
                    const leadMatches = dept.name.toLowerCase().includes(q) || dept.designation.toLowerCase().includes(q);
                    if (leadMatches) return true;
                    return spec.name.toLowerCase().includes(q) || spec.designation.toLowerCase().includes(q);
                  });

                  return (
                    <div key={dept.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      {/* Stem to dept card */}
                      <div style={{ width: 2, height: 26, background: "#cbd5e1" }} />

                      {/* Dept Head Node Card */}
                      <div
                        style={{
                          background: "#ffffff",
                          border: `2px solid ${dept.color || "#4f46e5"}`,
                          borderRadius: 16,
                          padding: "14px 16px",
                          width: "100%",
                          boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
                          textAlign: "center",
                          position: "relative",
                          transition: "all 0.18s ease",
                        }}
                      >
                        {/* Top Action Controls Bar: Reorder (← →), Swap, Edit, Remove */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 10,
                            paddingBottom: 8,
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {/* Left/Right Reordering Arrows */}
                          <div style={{ display: "flex", gap: 3 }}>
                            <button
                              type="button"
                              onClick={() => handleMoveLead(actualDeptIdx, "left")}
                              disabled={isFirstLead}
                              title="Move department column left"
                              style={{
                                background: isFirstLead ? "#f8fafc" : "#f1f5f9",
                                color: isFirstLead ? "#cbd5e1" : "#334155",
                                border: "1px solid #e2e8f0",
                                borderRadius: 6,
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: isFirstLead ? "not-allowed" : "pointer",
                              }}
                            >
                              <ArrowLeft size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveLead(actualDeptIdx, "right")}
                              disabled={isLastLead}
                              title="Move department column right"
                              style={{
                                background: isLastLead ? "#f8fafc" : "#f1f5f9",
                                color: isLastLead ? "#cbd5e1" : "#334155",
                                border: "1px solid #e2e8f0",
                                borderRadius: 6,
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: isLastLead ? "not-allowed" : "pointer",
                              }}
                            >
                              <ArrowRight size={12} />
                            </button>
                          </div>

                          {/* Right side: Swap, Edit, Remove */}
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => handleOpenSwap(dept.id)}
                              title="Swap position with another member"
                              style={{
                                background: "#f0fdf4",
                                color: "#16a34a",
                                border: "1px solid #bbf7d0",
                                borderRadius: 6,
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <ArrowLeftRight size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(dept)}
                              title="Edit Lead Details"
                              style={{
                                background: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #e2e8f0",
                                borderRadius: 6,
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDirectRemove(dept.id, dept.name)}
                              title={`Remove ${dept.name}`}
                              style={{
                                background: "#fef2f2",
                                color: "#ef4444",
                                border: "1px solid #fecaca",
                                borderRadius: 6,
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background: dept.color || "#4f46e5",
                            color: "#fff",
                            fontWeight: 900,
                            fontSize: "1.1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 8px",
                          }}
                        >
                          {dept.avatar || dept.name.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#0f172a" }}>{dept.name}</div>
                        <div style={{ fontSize: "0.8rem", color: dept.color || "#4f46e5", fontWeight: 700, marginTop: 2 }}>
                          {dept.designation}
                        </div>
                        <div
                          style={{
                            fontSize: "0.74rem",
                            color: "#64748b",
                            marginTop: 6,
                            background: "#f8fafc",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          {dept.department}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 4, fontWeight: 700 }}>
                          {(dept.children || []).length} Direct Report{dept.children?.length === 1 ? "" : "s"}
                        </div>
                      </div>

                      {/* Downward stem to specialists */}
                      {displaySpecialists.length > 0 && (
                        <div style={{ width: 2, height: 20, background: "#cbd5e1" }} />
                      )}

                      {/* Specialists Nodes under this Dept */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: displaySpecialists.length ? 0 : 10 }}>
                        {displaySpecialists.map((spec) => {
                          const actualSpecIdx = (dept.children || []).findIndex((s) => s.id === spec.id);
                          const isFirstSpec = actualSpecIdx === 0;
                          const isLastSpec = actualSpecIdx === (dept.children || []).length - 1;

                          return (
                            <div
                              key={spec.id}
                              style={{
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: 12,
                                padding: "9px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                transition: "all 0.15s ease",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: spec.color || dept.color || "#4f46e5",
                                  color: "#fff",
                                  fontWeight: 800,
                                  fontSize: "0.82rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {spec.avatar || spec.name.charAt(0)}
                              </div>

                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {spec.name}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {spec.designation}
                                </div>
                              </div>

                              {/* Specialist Actions: Up/Down Reorder, Swap, Edit, Remove */}
                              <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSpecialist(dept.id, actualSpecIdx, "up")}
                                  disabled={isFirstSpec}
                                  title="Move Up"
                                  style={{
                                    border: "none",
                                    background: isFirstSpec ? "transparent" : "#f1f5f9",
                                    color: isFirstSpec ? "#cbd5e1" : "#475569",
                                    borderRadius: 4,
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: isFirstSpec ? "default" : "pointer",
                                    padding: 0,
                                  }}
                                >
                                  <ArrowUp size={12} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleMoveSpecialist(dept.id, actualSpecIdx, "down")}
                                  disabled={isLastSpec}
                                  title="Move Down"
                                  style={{
                                    border: "none",
                                    background: isLastSpec ? "transparent" : "#f1f5f9",
                                    color: isLastSpec ? "#cbd5e1" : "#475569",
                                    borderRadius: 4,
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: isLastSpec ? "default" : "pointer",
                                    padding: 0,
                                  }}
                                >
                                  <ArrowDown size={12} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenSwap(spec.id)}
                                  title="Swap Position"
                                  style={{
                                    border: "none",
                                    background: "#f0fdf4",
                                    color: "#16a34a",
                                    borderRadius: 4,
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    padding: 0,
                                  }}
                                >
                                  <ArrowLeftRight size={12} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(spec)}
                                  title="Edit Specialist"
                                  style={{
                                    border: "none",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    borderRadius: 4,
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    padding: 0,
                                  }}
                                >
                                  <Edit3 size={12} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDirectRemove(spec.id, spec.name)}
                                  title={`Remove ${spec.name}`}
                                  style={{
                                    border: "none",
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    borderRadius: 4,
                                    width: 22,
                                    height: 22,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    padding: 0,
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Quick + Add Specialist under this Lead */}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              id: `staff-${Date.now()}`,
                              name: "",
                              designation: "",
                              department: dept.department,
                              role: "Specialist",
                              color: dept.color,
                              level: "specialist",
                              reportsToLeadId: dept.id,
                            });
                            setIsAddModalOpen(true);
                          }}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "1px dashed #cbd5e1",
                            background: "transparent",
                            color: "#64748b",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = dept.color || "#4f46e5";
                            e.currentTarget.style.color = dept.color || "#4f46e5";
                            e.currentTarget.style.background = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#cbd5e1";
                            e.currentTarget.style.color = "#64748b";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <Plus size={13} /> Add under {dept.name.split(" ")[0]}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Designation Directory Table View */
        <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 18px" }}>Team Member</th>
                <th style={{ padding: "14px 18px" }}>Designation</th>
                <th style={{ padding: "14px 18px" }}>Department</th>
                <th style={{ padding: "14px 18px" }}>Reporting To</th>
                <th style={{ padding: "14px 18px" }}>Hierarchy Level</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: m.color || "#4f46e5",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {m.avatar || m.name.charAt(0)}
                      </div>
                      <div>
                        <strong style={{ color: "#0f172a", fontSize: "0.88rem" }}>{m.name}</strong>
                        {m.level === "root" && (
                          <span style={{ marginLeft: 6, fontSize: "0.68rem", background: "#e0e7ff", color: "#4338ca", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>
                            Root
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", fontWeight: 700, color: "#1e293b" }}>{m.designation}</td>
                  <td style={{ padding: "14px 18px", color: "#64748b" }}>{m.department}</td>
                  <td style={{ padding: "14px 18px" }}>
                    {m.level === "root" ? (
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>— (Top Level)</span>
                    ) : m.level === "lead" ? (
                      <span style={{ fontSize: "0.75rem", color: "#4f46e5", fontWeight: 700 }}>
                        {treeData.name} (Founder)
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#0f172a", fontWeight: 700 }}>
                        {m.leadName || "Department Lead"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        background: m.level === "root" ? "#eef2ff" : m.level === "lead" ? "#f5f3ff" : "#f1f5f9",
                        color: m.level === "root" ? "#4f46e5" : m.level === "lead" ? "#7c3aed" : "#475569",
                        padding: "3px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      {m.level === "root" ? "Leadership" : m.level === "lead" ? "Dept Lead" : "Specialist"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      {m.level !== "root" && (
                        <button
                          onClick={() => handleOpenSwap(m.id)}
                          title="Swap Position"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "#f0fdf4",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                            padding: "6px 10px",
                            borderRadius: 8,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <ArrowLeftRight size={13} /> Swap
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(m)}
                        title="Edit Details"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: "#f1f5f9",
                          color: "#0f172a",
                          border: "1px solid #cbd5e1",
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      {m.level !== "root" && (
                        <button
                          onClick={() => handleDirectRemove(m.id, m.name)}
                          title="Remove Member"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                            padding: "6px 8px",
                            borderRadius: 8,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          SWAP POSITIONS MODAL
         ========================================================================= */}
      {isSwapModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1150,
            padding: 20,
          }}
          onClick={() => setIsSwapModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 540,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ArrowLeftRight size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>Swap Staff Positions</h3>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Exchange the hierarchy positions between two team members</div>
                </div>
              </div>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Member A Selection */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  Person A (First Member):
                </label>
                <select
                  value={swapMemberA}
                  onChange={(e) => setSwapMemberA(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    outline: "none",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Choose Member A --</option>
                  {allMembers
                    .filter((m) => m.id !== treeData.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.designation} — {m.department}) [{m.level === "lead" ? "Dept Lead" : "Specialist"}]
                      </option>
                    ))}
                </select>
              </div>

              {/* Center Swap Indicator */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "4px 0" }}>
                <div style={{ height: 1, background: "#e2e8f0", flex: 1 }} />
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#f0fdf4",
                    border: "2px solid #86efac",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowLeftRight size={18} />
                </div>
                <div style={{ height: 1, background: "#e2e8f0", flex: 1 }} />
              </div>

              {/* Member B Selection */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  Person B (Second Member):
                </label>
                <select
                  value={swapMemberB}
                  onChange={(e) => setSwapMemberB(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    outline: "none",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Choose Member B --</option>
                  {allMembers
                    .filter((m) => m.id !== treeData.id && m.id !== swapMemberA)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.designation} — {m.department}) [{m.level === "lead" ? "Dept Lead" : "Specialist"}]
                      </option>
                    ))}
                </select>
              </div>

              {/* Info Note */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: "0.78rem",
                  color: "#1e40af",
                  lineHeight: 1.5,
                }}
              >
                💡 <strong>How Swapping Works:</strong> If two Leads are swapped, their department columns will swap. If two Specialists are swapped, their tree positions swap. If a Lead and a Specialist are swapped, they exchange their designations & roles.
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSwap}
                disabled={!swapMemberA || !swapMemberB}
                style={{
                  padding: "8px 20px",
                  background: !swapMemberA || !swapMemberB ? "#94a3b8" : "#10b981",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: !swapMemberA || !swapMemberB ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ArrowLeftRight size={14} /> Confirm Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT STAFF MEMBER MODAL
         ========================================================================= */}
      {isEditModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: 20,
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 580,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: formData.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>Edit Staff Position & Details</h3>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Update designation, department, and reporting hierarchy</div>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit}>
              <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "72vh", overflowY: "auto" }}>
                {/* Full Name & Designation */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: "0.78rem", fontWeight: 800, color: "#334155" }}>
                        Full Name *
                      </label>
                      <span style={{ fontSize: "0.68rem", color: "#4f46e5", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                        <UserCheck size={11} /> User Management Suggestions
                      </span>
                    </div>

                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setShowEditNameSuggestions(true);
                        }}
                        onFocus={() => setShowEditNameSuggestions(true)}
                        placeholder="Search or enter full name..."
                        style={{
                          width: "100%",
                          padding: "9px 34px 9px 12px",
                          borderRadius: 10,
                          border: showEditNameSuggestions ? "1.5px solid #6366f1" : "1px solid #cbd5e1",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          outline: "none",
                          background: "#ffffff",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          pointerEvents: "none",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Search size={15} />
                      </div>
                    </div>

                    {/* Suggestions Dropdown from User Management */}
                    {showEditNameSuggestions && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#ffffff",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: 12,
                          marginTop: 4,
                          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.16)",
                          maxHeight: 220,
                          overflowY: "auto",
                          zIndex: 1300,
                        }}
                      >
                        <div
                          style={{
                            padding: "7px 12px",
                            background: "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            color: "#64748b",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>USER MANAGEMENT ({getUserSuggestions(formData.name).length})</span>
                          <button
                            type="button"
                            onClick={() => setShowEditNameSuggestions(false)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              color: "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                        {getUserSuggestions(formData.name).length === 0 ? (
                          <div style={{ padding: "12px", fontSize: "0.78rem", color: "#94a3b8", textAlign: "center" }}>
                            No matching user in User Management. Keep typing to use custom name.
                          </div>
                        ) : (
                          getUserSuggestions(formData.name).map((u, idx) => (
                            <div
                              key={u.id || u.username || idx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectUser(u, false);
                              }}
                              style={{
                                padding: "8px 12px",
                                borderBottom: "1px solid #f1f5f9",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                transition: "background 0.12s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: "#4f46e5",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.75rem",
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {(u.fullname || u.username || "U").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                                  {u.fullname}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {u.designation || u.role || "Team Member"} {u.username && `• ${u.username}`}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  background: "#e0e7ff",
                                  color: "#4338ca",
                                  padding: "2px 7px",
                                  borderRadius: 5,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                Select
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                      Job Designation / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Senior Video Editor"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600, outline: "none" }}
                    />
                  </div>
                </div>

                {/* Department & Role Badge */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                      Department / Domain *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600, outline: "none", background: "#ffffff" }}
                    >
                      {PRESET_DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      {!PRESET_DEPARTMENTS.includes(formData.department) && formData.department && (
                        <option value={formData.department}>{formData.department}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                      Role Badge Tag
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Team Lead, Specialist"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600, outline: "none" }}
                    />
                  </div>
                </div>

                {/* POSITION / HIERARCHY LEVEL (Position Changeable) */}
                {formData.level !== "root" && (
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
                      Hierarchy Position & Reporting Structure
                    </label>

                    {/* Level Selector */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <label
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: `1.5px solid ${formData.level === "lead" ? "#4f46e5" : "#cbd5e1"}`,
                          background: formData.level === "lead" ? "#eef2ff" : "#ffffff",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: formData.level === "lead" ? "#4f46e5" : "#475569",
                        }}
                      >
                        <input
                          type="radio"
                          name="hierarchyLevel"
                          value="lead"
                          checked={formData.level === "lead"}
                          onChange={() => setFormData({ ...formData, level: "lead" })}
                        />
                        Department Lead (Level 2)
                      </label>

                      <label
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: `1.5px solid ${formData.level === "specialist" ? "#4f46e5" : "#cbd5e1"}`,
                          background: formData.level === "specialist" ? "#eef2ff" : "#ffffff",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: formData.level === "specialist" ? "#4f46e5" : "#475569",
                        }}
                      >
                        <input
                          type="radio"
                          name="hierarchyLevel"
                          value="specialist"
                          checked={formData.level === "specialist"}
                          onChange={() => setFormData({ ...formData, level: "specialist" })}
                        />
                        Specialist / Staff (Level 3)
                      </label>
                    </div>

                    {/* If Specialist: Reports To Lead Dropdown */}
                    {formData.level === "specialist" && (
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: 5 }}>
                          Reports Directly To (Department Lead):
                        </label>
                        <select
                          value={formData.reportsToLeadId}
                          onChange={(e) => {
                            const selectedLead = departmentLeads.find((l) => l.id === e.target.value);
                            setFormData({
                              ...formData,
                              reportsToLeadId: e.target.value,
                              department: selectedLead ? selectedLead.department : formData.department,
                              color: selectedLead ? selectedLead.color : formData.color,
                            });
                          }}
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: 10,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            fontSize: "0.84rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          {departmentLeads
                            .filter((l) => l.id !== formData.id)
                            .map((lead) => (
                              <option key={lead.id} value={lead.id}>
                                {lead.name} — {lead.designation} ({lead.department})
                              </option>
                            ))}
                        </select>
                        <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
                          Changing the reporting lead moves this staff member under that branch in the tree.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Accent Color Picker */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#334155", marginBottom: 8 }}>
                    Node Accent Color
                  </label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setFormData({ ...formData, color: c.value })}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: c.value,
                          border: formData.color === c.value ? "3px solid #0f172a" : "2px solid #ffffff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                        }}
                      >
                        {formData.color === c.value && <Check size={14} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "16px 24px",
                  background: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {formData.level !== "root" ? (
                  <button
                    type="button"
                    onClick={() => handleDirectRemove(editingNode.id, editingNode.name)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} /> Remove Member
                  </button>
                ) : (
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Founder Node Protected</div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    style={{
                      padding: "8px 16px",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 10,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      color: "#475569",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 20px",
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(15,23,42,0.15)",
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD STAFF MEMBER MODAL
         ========================================================================= */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: 20,
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 580,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>Add Team Member</h3>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Create a new staff node in Digital Marketing, Social Media or Design</div>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdd}>
              <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "72vh", overflowY: "auto" }}>
                {/* Full Name & Designation */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: "0.78rem", fontWeight: 800, color: "#334155" }}>
                        Full Name *
                      </label>
                      <span style={{ fontSize: "0.68rem", color: "#4f46e5", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                        <UserCheck size={11} /> User Management Suggestions
                      </span>
                    </div>

                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          setShowAddNameSuggestions(true);
                        }}
                        onFocus={() => setShowAddNameSuggestions(true)}
                        placeholder="Search or enter full name..."
                        style={{
                          width: "100%",
                          padding: "9px 34px 9px 12px",
                          borderRadius: 10,
                          border: showAddNameSuggestions ? "1.5px solid #6366f1" : "1px solid #cbd5e1",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          outline: "none",
                          background: "#ffffff",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          pointerEvents: "none",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Search size={15} />
                      </div>
                    </div>

                    {/* Suggestions Dropdown from User Management */}
                    {showAddNameSuggestions && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "#ffffff",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: 12,
                          marginTop: 4,
                          boxShadow: "0 10px 28px rgba(15, 23, 42, 0.16)",
                          maxHeight: 220,
                          overflowY: "auto",
                          zIndex: 1300,
                        }}
                      >
                        <div
                          style={{
                            padding: "7px 12px",
                            background: "#f8fafc",
                            borderBottom: "1px solid #e2e8f0",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            color: "#64748b",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>USER MANAGEMENT ({getUserSuggestions(formData.name).length})</span>
                          <button
                            type="button"
                            onClick={() => setShowAddNameSuggestions(false)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              color: "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                        {getUserSuggestions(formData.name).length === 0 ? (
                          <div style={{ padding: "12px", fontSize: "0.78rem", color: "#94a3b8", textAlign: "center" }}>
                            No matching user in User Management. Keep typing to use custom name.
                          </div>
                        ) : (
                          getUserSuggestions(formData.name).map((u, idx) => (
                            <div
                              key={u.id || u.username || idx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectUser(u, true);
                              }}
                              style={{
                                padding: "8px 12px",
                                borderBottom: "1px solid #f1f5f9",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                transition: "background 0.12s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: "#4f46e5",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.75rem",
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {(u.fullname || u.username || "U").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                                  {u.fullname}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {u.designation || u.role || "Team Member"} {u.username && `• ${u.username}`}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  background: "#e0e7ff",
                                  color: "#4338ca",
                                  padding: "2px 7px",
                                  borderRadius: 5,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                Select
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                      Job Designation / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Lead Copywriter"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600, outline: "none" }}
                    />
                  </div>
                </div>

                {/* Department & Role Badge */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                      Department / Domain *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600, outline: "none", background: "#ffffff" }}
                    >
                      {PRESET_DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      {!PRESET_DEPARTMENTS.includes(formData.department) && formData.department && (
                        <option value={formData.department}>{formData.department}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                      Role Badge Tag
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Specialist, Lead, Executive"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: 600, outline: "none" }}
                    />
                  </div>
                </div>

                {/* Position / Hierarchy Level */}
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
                    Select Hierarchy Position
                  </label>

                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <label
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${formData.level === "lead" ? "#4f46e5" : "#cbd5e1"}`,
                        background: formData.level === "lead" ? "#eef2ff" : "#ffffff",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: formData.level === "lead" ? "#4f46e5" : "#475569",
                      }}
                    >
                      <input
                        type="radio"
                        name="addHierarchyLevel"
                        value="lead"
                        checked={formData.level === "lead"}
                        onChange={() => setFormData({ ...formData, level: "lead" })}
                      />
                      New Department Lead
                    </label>

                    <label
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `1.5px solid ${formData.level === "specialist" ? "#4f46e5" : "#cbd5e1"}`,
                        background: formData.level === "specialist" ? "#eef2ff" : "#ffffff",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: formData.level === "specialist" ? "#4f46e5" : "#475569",
                      }}
                    >
                      <input
                        type="radio"
                        name="addHierarchyLevel"
                        value="specialist"
                        checked={formData.level === "specialist"}
                        onChange={() => setFormData({ ...formData, level: "specialist" })}
                      />
                      Specialist under Lead
                    </label>
                  </div>

                  {formData.level === "specialist" && (
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: 5 }}>
                        Assign To Department Lead:
                      </label>
                      <select
                        value={formData.reportsToLeadId}
                        onChange={(e) => {
                          const selectedLead = departmentLeads.find((l) => l.id === e.target.value);
                          setFormData({
                            ...formData,
                            reportsToLeadId: e.target.value,
                            department: selectedLead ? selectedLead.department : formData.department,
                            color: selectedLead ? selectedLead.color : formData.color,
                          });
                        }}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: 10,
                          border: "1px solid #cbd5e1",
                          background: "#ffffff",
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {departmentLeads.map((lead) => (
                          <option key={lead.id} value={lead.id}>
                            {lead.name} — {lead.designation} ({lead.department})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Accent Color Picker */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 800, color: "#334155", marginBottom: 8 }}>
                    Node Accent Color
                  </label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setFormData({ ...formData, color: c.value })}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: c.value,
                          border: formData.color === c.value ? "3px solid #0f172a" : "2px solid #ffffff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                        }}
                      >
                        {formData.color === c.value && <Check size={14} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "16px 24px",
                  background: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "#475569",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 20px",
                    background: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
                  }}
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
