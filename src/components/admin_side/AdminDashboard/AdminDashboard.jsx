import React, { useState } from "react";
import { useAuth } from "../../../Context/AuthContext";

import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Home");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const user = {
    fullName: "Afsal",
    email: "hashir@example.com",
    role: "Administrator",
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out / check out?");
    if (confirmLogout) {
      logout();
      navigate('/adminlogin')
    }
  };

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
          <h3>{user.fullName}</h3>
          <p>
            {user.email} — <span>{user.role}</span>
          </p>
        </div>
        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout / Checkout
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

        <div className="dashboard-box cyan" aria-label="User Management">
          <h4>👥 User Management</h4>
          <p>Active users: 18</p>
          <p>Pending invites: 4</p>
        </div>

        <a href="/attendance">
          <div className="dashboard-box gray" aria-label="Attendance Sheet">
            <h4>📅 Attendance Sheet</h4>
            <p>Present today: 96%</p>
            <p>Download logs available</p>
          </div>
        </a>

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

        <div className="dashboard-box cyan" aria-label="Reports and Analytics">
          <h4>📈 Reports & Analytics</h4>
          <p>Weekly report ready</p>
          <p>
            <a href="#">View Report</a>
          </p>
        </div>

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
