"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [isAdmin, setIsAdmin] = useState(false);
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

    localStorage.removeItem("authToken");
    logout();
    router.push("/userlogin/");
  };

  // Decode token to check admin rights
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(
          decoded?.is_admin || decoded?.is_staff || decoded?.user_id === 9
        );
      } catch (e) {
        console.error("Invalid token:", e);
      }
    }
  }, []);

  const menuItems = [
    "Home",
    "Profile",
    "Assigned Projects",
    "Team",
    "Settings",
  ];

  return (
    <div className="admin-dashboard container" role="main">
      {/* Top Bar */}
      <header className="top-bar row align-items-center mb-4" role="banner">
        <div className="col-md-3 user-info">
          <h3>{user?.fullname || "Admin"}</h3>
          <p>{user?.email || "No email available"}</p>
        </div>
        <div className="col-md-6 brand-section text-center">
          <h2 className="brand-title">Adstra Digital</h2>
          <p className="brand-tagline">
            The Sole of a Premium Digital Marketing Brand
          </p>
        </div>
        <div className="col-md-3 text-md-end text-center mt-3 mt-md-0">
          <button
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="menu-bar" role="navigation" aria-label="Main menu">
        <ul className="d-flex flex-wrap justify-content-center list-unstyled m-0 p-0 gap-3">
          {menuItems.map((item) => (
            <li
              key={item}
              className={`px-3 py-2 rounded ${
                activeMenu === item ? "active" : ""
              }`}
              onClick={() => setActiveMenu(item)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") setActiveMenu(item);
              }}
              role="button"
              aria-pressed={activeMenu === item}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>

      {/* Dashboard Grid */}
      <section className="row g-4 mt-3" aria-live="polite">

        {/* Attendance */}
        <div className="col-sm-12 col-md-6 col-lg-3">
          <Link href="/attendance/" className="link">
            <div className="dashboard-box gray" role="link">
              <h4>📅 Attendance Sheet</h4>
              <p>! Don't Miss Work Report</p>
              <u>Work Status</u>
            </div>
          </Link>
        </div>

        {/* Work Status */}
        <div className="col-sm-12 col-md-6 col-lg-3">
          {isAdmin ? (
            <div className="dashboard-box orange">
              <h4>📊 Work Status</h4>
              <p>Projects in progress</p>
              <u>Coming Soon</u>
            </div>
          ) : (
            <div className="dashboard-box orange no-hover">
              <h4>📊 Work Status</h4>
              <p>Access denied</p>
              <u>Coming Soon</u>
            </div>
          )}
        </div>

        {/* Blogs Creator */}
        <div className="col-sm-12 col-md-6 col-lg-3">
          {isAdmin ? (
            <Link href="" className="link">
              <div className="dashboard-box gray" role="link">
                <h4>📝 Blogs Creator</h4>
                <p>Make SEO-friendly blogs</p>
                <u>Coming Soon</u>
              </div>
            </Link>
          ) : (
            <div className="dashboard-box gray no-hover">
              <h4>📝 Blogs Creator</h4>
              <p>Access denied</p>
              <u>Coming Soon</u>
            </div>
          )}
        </div>

        {/* Online Meetings */}
        <div className="col-sm-12 col-md-6 col-lg-3">
          {isAdmin ? (
            <div className="dashboard-box navy" aria-label="Online Meetings">
              <h4>📞 Online Meetings</h4>
              <p>Next: Team Sync @ 3:00 PM</p>
              <u>Coming Soon</u>
            </div>
          ) : (
            <div className="dashboard-box navy no-hover">
              <h4>📞 Online Meetings</h4>
              <p>Access denied</p>
              <u>Coming Soon</u>
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="col-sm-12 col-md-6 col-lg-3">
          {isAdmin ? (
            <Link href="/usermanagement/" className="link">
              <div className="dashboard-box cyan">
                <h4>👥 User Management</h4>
                <p>Manage users & permissions</p>
                <u>View Team</u>
              </div>
            </Link>
          ) : (
            <div className="dashboard-box cyan no-hover">
              <h4>👥 User Management</h4>
              <p> </p>
              <p>Access denied</p>
            </div>
          )}
        </div>

        {/* Proposals */}
        <div className="col-sm-12 col-md-6 col-lg-3">
          {isAdmin ? (
            <Link href="/proposal/" className="link">
              <div className="dashboard-box">
                <h4>📑 Proposals</h4>
                <p>Any time Any where.</p>
                <u>View Proposals</u>
              </div>
            </Link>
          ) : (
            <div className="dashboard-box no-hover">
              <h4>📑 Proposals</h4>
              <p> </p>
              <p>Access denied</p>
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="col-sm-12 col-md-6 col-lg-3">
          {isAdmin ? (
            <Link href="/invoices/" className="link">
              <div className="dashboard-box">
                <h4>🧾 Invoices</h4>
                <p>Track Client Invoices</p>
                <u>View Invoices</u>
              </div>
            </Link>
          ) : (
            <div className="dashboard-box no-hover">
              <h4>🧾 Invoices</h4>
              <p> </p>
              <p>Access denied</p>
            </div>
          )}
        </div>

        {/* Receipts */}
        <div className="col-sm-12 col-md-6 col-lg-3">
          {isAdmin ? (
            <Link href="/receipts/" className="link">
              <div className="dashboard-box">
                <h4>📄 Receipts</h4>
                <p>Track your billing and payments</p>
                <u>View Receipt</u>
              </div>
            </Link>
          ) : (
            <div className="dashboard-box no-hover">
              <h4>📄 Receipts</h4>
              <p> </p>
              <p>Access denied</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
