"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
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

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState({});

  // Load user from localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }, []);

  // Logout handler with warnings
  const handleLogout = () => {
    const confirmLogout = window.confirm(
      `⚠️ Before logging out Warnings:
      \n\n- Make sure you have submitted your **Work Report**.
      \n- Don’t forget to press the **Checkout** button.
      \n\nAre you sure you want to continue with logout?`
    );

    if (!confirmLogout) return;

    performLogout();
  };

  const performLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user"); // Clear user data too
    logout();
    router.push("/userlogin/");
  };

  const handleSessionExpiredLogin = () => {
    performLogout();
  };

  // Decode token to check admin rights
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

        setIsAdmin(
          decoded?.is_admin || 
          decoded?.is_staff || 
          decoded?.user_id === 9 || 
          user?.is_staff || 
          user?.is_superuser
        );
      } catch (e) {
        console.error("Invalid token:", e);
        // Optional: clear invalid token
        localStorage.removeItem("authToken");
        router.push("/userlogin/");
      }
    } else {
      // No token found, redirect to login
      router.push("/userlogin/");
    }
  }, []);

  const baseMenuItems = [
    "Home",
    "Finance",
    "Profile",
    "Assigned Projects",
    "Team",
  ];

  const isWilson = user?.username?.toLowerCase() === "wilson" || user?.fullname?.toLowerCase() === "wilson";

  const menuItems = isWilson 
    ? [...baseMenuItems, "Settings"] 
    : baseMenuItems;

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
            <Link href="/attendance/" className="link">
              <div className="dashboard-box indigo">
                <div className="icon-wrapper">
                  <CalendarCheck size={28} />
                </div>
                <h4>Attendance Sheet</h4>
                <p>Track daily attendance and submit work reports.</p>
                <span className="action-link">Open Sheet <ArrowRight size={16} /></span>
              </div>
            </Link>

            {/* Work Status */}
            {isAdmin ? (
              <div className="dashboard-box amber">
                <div className="icon-wrapper">
                  <BarChart3 size={28} />
                </div>
                <h4>Work Status</h4>
                <p>Monitor ongoing projects and task progress.</p>
                <span className="action-link">View Status <ArrowRight size={16} /></span>
              </div>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <BarChart3 size={28} />
                </div>
                <h4>Work Status</h4>
                <p>Access denied</p>
              </div>
            )}

            {/* Blogs Creator */}
            {isAdmin ? (
              <Link href="" className="link">
                <div className="dashboard-box rose">
                  <div className="icon-wrapper">
                    <PenTool size={28} />
                  </div>
                  <h4>Blogs Creator</h4>
                  <p>Create and manage SEO-friendly blog content.</p>
                  <span className="action-link">Create Blog <ArrowRight size={16} /></span>
                </div>
              </Link>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <PenTool size={28} />
                </div>
                <h4>Blogs Creator</h4>
                <p>Access denied</p>
              </div>
            )}

            {/* Online Meetings */}
            {isAdmin ? (
              <div className="dashboard-box sky">
                <div className="icon-wrapper">
                  <Video size={28} />
                </div>
                <h4>Online Meetings</h4>
                <p>Next: Team Sync @ 3:00 PM</p>
                <span className="action-link">Join Meeting <ArrowRight size={16} /></span>
              </div>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <Video size={28} />
                </div>
                <h4>Online Meetings</h4>
                <p>Access denied</p>
              </div>
            )}

            {/* User Management */}
            {isAdmin ? (
              <Link href="/usermanagement/" className="link">
                <div className="dashboard-box emerald">
                  <div className="icon-wrapper">
                    <Users size={28} />
                  </div>
                  <h4>User Management</h4>
                  <p>Manage team members and permissions.</p>
                  <span className="action-link">Manage Users <ArrowRight size={16} /></span>
                </div>
              </Link>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <Users size={28} />
                </div>
                <h4>User Management</h4>
                <p>Access denied</p>
              </div>
            )}


          </>
        )}

        {/* FINANCE MENU ITEMS */}
        {activeMenu === "Finance" && (
          <>
            {/* Client Companies */}
            {isAdmin ? (
              <Link href="/clientcompanies/" className="link">
                <div className="dashboard-box indigo">
                  <div className="icon-wrapper">
                    <Building2 size={28} />
                  </div>
                  <h4>Client Companies</h4>
                  <p>Manage client details and partnerships.</p>
                  <span className="action-link">View Clients <ArrowRight size={16} /></span>
                </div>
              </Link>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <Building2 size={28} />
                </div>
                <h4>Client Companies</h4>
                <p>Access denied</p>
              </div>
            )}

            {/* Proposals */}
            {isAdmin ? (
              <Link href="/proposal/" className="link">
                <div className="dashboard-box amber">
                  <div className="icon-wrapper">
                    <FileText size={28} />
                  </div>
                  <h4>Proposals</h4>
                  <p>Create and track business proposals.</p>
                  <span className="action-link">View Proposals <ArrowRight size={16} /></span>
                </div>
              </Link>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <FileText size={28} />
                </div>
                <h4>Proposals</h4>
                <p>Access denied</p>
              </div>
            )}

            {/* Invoices */}
            {isAdmin ? (
              <Link href="/invoices/" className="link">
                <div className="dashboard-box rose">
                  <div className="icon-wrapper">
                    <Receipt size={28} />
                  </div>
                  <h4>Tax Invoices</h4>
                  <p>Track and manage client invoices.</p>
                  <span className="action-link">View Invoices <ArrowRight size={16} /></span>
                </div>
              </Link>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <Receipt size={28} />
                </div>
                <h4>Tax Invoices</h4>
                <p>Access denied</p>
              </div>
            )}

            {/* Proforma Invoices */}
            {isAdmin ? (
              <Link href="/invoices/proforma/" className="link">
                <div className="dashboard-box emerald">
                  <div className="icon-wrapper">
                    <FileText size={28} />
                  </div>
                  <h4>Proforma Invoices</h4>
                  <p>Manage estimates and proforma bills.</p>
                  <span className="action-link">View Proforma <ArrowRight size={16} /></span>
                </div>
              </Link>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <FileText size={28} />
                </div>
                <h4>Proforma Invoices</h4>
                <p>Access denied</p>
              </div>
            )}

            {/* Receipts */}
            {isAdmin ? (
              <Link href="/receipts/" className="link">
                <div className="dashboard-box sky">
                  <div className="icon-wrapper">
                    <Scroll size={28} />
                  </div>
                  <h4>Receipts</h4>
                  <p>Track billing and payment receipts.</p>
                  <span className="action-link">View Receipts <ArrowRight size={16} /></span>
                </div>
              </Link>
            ) : (
              <div className="dashboard-box no-hover">
                <div className="icon-wrapper">
                  <Scroll size={28} />
                </div>
                <h4>Receipts</h4>
                <p>Access denied</p>
              </div>
            )}
          </>
        )}
        </section>
      )}

      {/* SETTINGS MENU ITEMS */}
      {activeMenu === "Settings" && isWilson && (
        <SettingsPanel API_BASE={API_BASE_URL} />
      )}

      {/* PROFILE MENU ITEMS */}
      {activeMenu === "Profile" && (
        <ProfilePanel user={user} API_BASE={API_BASE_URL} />
      )}

      {/* TEAM MENU ITEMS */}
      {activeMenu === "Team" && (
        <TeamPanel />
      )}
    </div>
  );
};

 

export default AdminDashboard;
