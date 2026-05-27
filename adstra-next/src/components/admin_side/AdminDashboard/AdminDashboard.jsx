"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import { useModal } from "@/Context/ModalContext";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import SessionExpiredModal from "@/components/common/SessionExpiredModal";
import "./AdminDashboard.css";
import {
  CalendarCheck,
  BarChart3,
  PenTool,
  Video,
  Users,
  Building2,
  FileText,
  Receipt,
  Scroll,
  ArrowRight,
  LogOut
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "@/utils/apiBase";
import SettingsPanel from "@/components/common/SettingsPanel";
import ProfilePanel from "@/components/admin_side/ProfilePanel/ProfilePanel";
import TeamPanel from "@/components/admin_side/TeamPanel/TeamPanel";
import SystemLog from "@/components/admin_side/SystemLog/SystemLog";

const AdminDashboard = () => {
  const { showConfirm } = useModal();
  const [activeMenu, setActiveMenu] = useState("Home");
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { user, setUser, logout } = useAuth();
  const router = useRouter();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const isSuperUser = Boolean(user?.is_superuser || user?.effective_permissions?.includes("*"));
  const hasPermission = (permission) => {
    if (isSuperUser) return true;
    return Boolean(user?.effective_permissions?.includes(permission));
  };

  const hasAnyPermission = (permissions) => permissions.some((permission) => hasPermission(permission));

  const renderFeatureCard = ({ permission, anyPermission, href, color, icon, title, description, action }) => {
    const allowed = anyPermission ? hasAnyPermission(anyPermission) : hasPermission(permission);
    const card = (
      <div className={`dashboard-box ${allowed ? color : "no-hover"}`}>
        <div className="icon-wrapper">
          {icon}
        </div>
        <h4>{title}</h4>
        <p>{allowed ? description : "Access denied"}</p>
        {allowed && action && <span className="action-link">{action} <ArrowRight size={16} /></span>}
      </div>
    );

    return allowed && href ? <Link href={href} className="link">{card}</Link> : card;
  };

  // Logout handler with warnings
  const handleLogout = () => {
    showConfirm(
      "Confirm Logout",
      `⚠️ Before logging out:
      
- Make sure you have submitted your Work Report.
- Don't forget to press the Checkout button.

Are you sure you want to continue with logout?`,
      () => performLogout(),
      "warning"
    );
  };

  const performLogout = () => {
    logout();
    window.location.href = "/userlogin";
  };

  const handleSessionExpiredLogin = () => {
    performLogout();
  };

  // Decode token and refresh current user/permissions from backend.
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check for token expiration
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          setIsSessionExpired(true);
          return;
        }

        // Fetch fresh user data to ensure permissions are up to date
        axios.get(`${API_BASE_URL}/user/me/?_=${Date.now()}`, { headers: getAuthHeaders() })
          .then((response) => {
            const freshUser = response.data?.user || {};
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
          })
          .catch((error) => {
            if ([401, 403].includes(error.response?.status)) {
              setIsSessionExpired(true);
            }
          });
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Invalid token:", e);
        }
        logout();
        window.location.href = "/userlogin";
      }
    } else {
      // No token found, redirect to login
      window.location.href = "/userlogin";
    }
  }, []);

  const menuItems = [
    "Home",
    ...(hasAnyPermission(["clients.view", "proposals.view", "invoices.view", "transactions.view"]) ? ["Finance"] : []),
    "Profile",
    "Assigned Projects",
    ...(hasPermission("users.view") ? ["Team"] : []),
    ...(hasPermission("settings.view") ? ["Settings"] : []),
    ...(hasPermission("settings.view") ? ["System Log"] : []),
  ];

  return (
    <div className="admin-dashboard">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="user-info">
          <h3>{user?.fullname || "Admin"}</h3>
          <p>{user?.email || "No email available"}</p>
        </div>

        <div className="brand-section">
          <h2 className="brand-title">Adstra Digital</h2>
          <p className="brand-tagline">The Sole of a Premium Digital Marketing Brand</p>
        </div>

        <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      {isSessionExpired && (
        <SessionExpiredModal onLogin={handleSessionExpiredLogin} />
      )}

      {/* Navigation Menu */}
      <nav className="menu-bar">
        <ul>
          {menuItems.map((item) => (
            <li
              key={item}
              className={activeMenu === item ? "active" : ""}
              onClick={() => setActiveMenu(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>

      {/* Dashboard Grid for Grid-based Views */}
      {["Home", "Finance"].includes(activeMenu) && (
        <section className="dashboard-grid">

          {/* HOME MENU ITEMS */}
          {activeMenu === "Home" && (
            <>
              {/* Attendance */}
              {renderFeatureCard({
                anyPermission: ["attendance.self", "attendance.view_all"],
                href: "/attendance/",
                color: "indigo",
                icon: <CalendarCheck size={28} />,
                title: "Attendance Sheet",
                description: "Track daily attendance and submit work reports.",
                action: "Open Sheet",
              })}

              {/* Work Status */}
              {renderFeatureCard({
                permission: "attendance.view_all",
                color: "amber",
                icon: <BarChart3 size={28} />,
                title: "Work Status",
                description: "Monitor ongoing projects and task progress.",
                action: "View Status",
              })}

              {/* Blogs Creator */}
              {renderFeatureCard({
                permission: "blogs.view",
                href: "/blogcreator/",
                color: "rose",
                icon: <PenTool size={28} />,
                title: "Blogs Creator",
                description: "Create and manage SEO-friendly blog content.",
                action: "Create Blog",
              })}

              {/* Online Meetings */}
              {renderFeatureCard({
                permission: "users.view",
                color: "sky",
                icon: <Video size={28} />,
                title: "Online Meetings",
                description: "Next: Team Sync @ 3:00 PM",
                action: "Join Meeting",
              })}

              {/* User Management */}
              {renderFeatureCard({
                permission: "users.view",
                href: "/usermanagement/",
                color: "emerald",
                icon: <Users size={28} />,
                title: "User Management",
                description: "Manage team members and permissions.",
                action: "Manage Users",
              })}


            </>
          )}

          {/* FINANCE MENU ITEMS */}
          {activeMenu === "Finance" && (
            <>
              {/* Client Companies */}
              {renderFeatureCard({
                permission: "clients.view",
                href: "/clientcompanies/",
                color: "indigo",
                icon: <Building2 size={28} />,
                title: "Client Companies",
                description: "Manage client details and partnerships.",
                action: "View Clients",
              })}

              {/* Proposals */}
              {renderFeatureCard({
                permission: "proposals.view",
                href: "/proposal/",
                color: "amber",
                icon: <FileText size={28} />,
                title: "Proposals",
                description: "Create and track business proposals.",
                action: "View Proposals",
              })}

              {/* Invoices */}
              {renderFeatureCard({
                permission: "invoices.view",
                href: "/invoices/",
                color: "rose",
                icon: <Receipt size={28} />,
                title: "Tax Invoices",
                description: "Track and manage client invoices.",
                action: "View Invoices",
              })}

              {/* Proforma Invoices */}
              {renderFeatureCard({
                permission: "invoices.view",
                href: "/invoices/proforma/",
                color: "emerald",
                icon: <FileText size={28} />,
                title: "Proforma Invoices",
                description: "Manage estimates and proforma bills.",
                action: "View Proforma",
              })}

              {/* Receipts */}
              {renderFeatureCard({
                permission: "transactions.view",
                href: "/receipts/",
                color: "sky",
                icon: <Scroll size={28} />,
                title: "Receipts",
                description: "Track billing and payment receipts.",
                action: "View Receipts",
              })}
            </>
          )}
        </section>
      )}

      {/* SETTINGS MENU ITEMS */}
      {activeMenu === "Settings" && hasPermission("settings.view") && (
        <SettingsPanel API_BASE={API_BASE_URL} />
      )}

      {/* PROFILE MENU ITEMS */}
      {activeMenu === "Profile" && (
        <ProfilePanel user={user} API_BASE={API_BASE_URL} />
      )}

      {/* TEAM MENU ITEMS */}
      {activeMenu === "Team" && hasPermission("users.view") && (
        <TeamPanel />
      )}

      {/* SYSTEM LOG MENU ITEMS */}
      {activeMenu === "System Log" && hasPermission("settings.view") && (
        <SystemLog API_BASE={API_BASE_URL} />
      )}
    </div>
  );
};

export default AdminDashboard;
