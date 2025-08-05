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
    router.push("/userlogin");
  };

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
    <div className="admin-dashboard" role="main">
      {/* Top Bar */}
      <header className="top-bar" role="banner">
        <div className="user-info">
          <h3>{user?.fullname || "Admin"}</h3>
          <p>{user?.email || "No email available"}</p>
        </div>
        <div className="brand-section">
          <h2 className="brand-title">Adstra Digital</h2>
          <p className="brand-tagline">Elevate. Elegant. Excel.</p>
        </div>
        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </header>

      {/* Navigation Menu */}
      <nav className="menu-bar" role="navigation" aria-label="Main menu">
        <ul>
          {menuItems.map((item) => (
            <li
              key={item}
              className={activeMenu === item ? "active" : ""}
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

      {/* Dashboard Boxes */}
      <section className="dashboard-grid" aria-live="polite">
        <div className="dashboard-box orange" aria-label="Work Status">
          <h4>📊 Work Status</h4>
          <p>Projects in progress: 3</p>
          <p>Pending reviews: 2</p>
        </div>
        {isAdmin ? (
          <Link href="/usermanagement" className="link">
            <div className="dashboard-box cyan" aria-label="User Management">
              <h4>👥 User Management</h4>
              <p>Active users: 18</p>
              <p>Pending invites: 4</p>
            </div>
          </Link>
        ) : (
          <div className="dashboard-box cyan" aria-label="User Management">
            <h4>👥 User Management</h4>
            <p>Sorry. You do not have access to this folder</p>
          </div>
        )}
        <Link href="/attendance" className="link">
          <div className="dashboard-box gray" role="link">
            <h4>📅 Attendance Sheet</h4>
            <p>Present today: 96%</p>
            <p>Download logs available</p>
          </div>
        </Link>
        <div className="dashboard-box navy" aria-label="Online Meetings">
          <h4>📞 Online Meetings</h4>
          <p>Next: Team Sync @ 3:00 PM</p>
          <p>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Zoom meeting"
            >
              Join Zoom
            </a>
          </p>
        </div>
        {isAdmin ? (
          <Link href="/proposal" className="link">
            <div className="dashboard-box" aria-label="Reports and Proposals">
              <h4>Proposals</h4>
              <p>Any time Any where.</p>
              <p>
                <a
                  href="/proposal"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Proposal"
                >
                  View Proposal
                </a>
              </p>{" "}
            </div>
          </Link>
        ) : (
          <div
            className="dashboard-box cyan"
            aria-label="Reports and Analytics"
          >
            <h4>Quick Proposal Maker</h4>
            <p>Any time Any where.</p>
            <p>
              <a href="">View Proposal</a>
            </p>
          </div>
        )}
        <div className="dashboard-box orange" aria-label="Team Feedback">
          <h4>💬 Team Feedback</h4>
          <p>New submissions: 3</p>
          <p>
            <a href="#">Read Feedback</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
