"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { useModal } from "@/Context/ModalContext";
import "./ProfilePanel.css";

const ProfilePanel = ({ user, API_BASE }) => {
  const { showAlert } = useModal();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      showAlert("Error", "Please enter a new password.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("Error", "Passwords do not match.", "error");
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.put(`${API_BASE}/user/update-user/${user.id}`, {
        password: newPassword
      }, {
        headers: getAuthHeaders()
      });
      showAlert("Success", "Password updated successfully!", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      let errMsg = "Failed to update password.";
      if (err.response?.data?.errors?.password) {
        errMsg = err.response.data.errors.password.join(", ");
      } else if (err.response?.data?.error) {
        errMsg = err.response.data.error;
      } else if (err.response?.data?.errors) {
        errMsg = Object.entries(err.response.data.errors)
          .map(([key, val]) => `${key}: ${val}`)
          .join("\n");
      }
      showAlert("Error", errMsg, "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchMyAttendance = async () => {
      setLoading(true);
      try {
        // Fetch all attendance for this user (using export=true to get everything without pagination, or could just get page 1)
        // Since we modified listAttendance to support user_id and export=true returns everything
        const res = await axios.get(`${API_BASE}/attendance/list-attendance/`, {
          params: { user_id: user.id, export: "true" },
          headers: getAuthHeaders()
        });

        const data = res.data.users || res.data.results?.users || [];
        setAttendanceLogs(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load attendance logs");
      } finally {
        setLoading(false);
      }
    };

    fetchMyAttendance();
  }, [user, API_BASE]);

  // Render status badge
  const renderStatus = (status) => {
    const config = {
      Present: { bg: "#DCFCE7", color: "#15803D", icon: <CheckCircle size={14} /> },
      Absent: { bg: "#FEE2E2", color: "#B91C1C", icon: <XCircle size={14} /> },
      Leave: { bg: "#FEF3C7", color: "#B45309", icon: <Clock size={14} /> },
      "Half Day": { bg: "#E0E7FF", color: "#4338CA", icon: <Clock size={14} /> },
    };
    const s = config[status] || config.Absent;
    return (
      <span className="profile-status-badge" style={{ background: s.bg, color: s.color }}>
        {s.icon} {status}
      </span>
    );
  };

  return (
    <div className="profile-panel">
      <div className="profile-sidebar">
        <div className="profile-nav-menu">
          <button
            className={`profile-nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <User size={18} /> Profile Overview
          </button>
          <button
            className={`profile-nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <Clock size={18} /> My Attendance
          </button>
          <button
            className={`profile-nav-item ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            <Calendar size={18} /> Full UI Calendar
          </button>
          <button
            className={`profile-nav-item ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <KeyRound size={18} /> Reset Password
          </button>
        </div>
      </div>

      <div className="profile-content-section">
        {activeTab === "overview" && (
          <div className="tab-content fade-in">
            <h3 className="section-title"><User size={18} /> Profile Overview</h3>
            <div className="overview-stats">
              <div className="stat-box">
                <h4>Total Records</h4>
                <div className="stat-num">{attendanceLogs.length}</div>
              </div>
              <div className="stat-box present">
                <h4>Present</h4>
                <div className="stat-num">{attendanceLogs.filter(l => l.status === "Present").length}</div>
              </div>
              <div className="stat-box absent">
                <h4>Absent</h4>
                <div className="stat-num">{attendanceLogs.filter(l => l.status === "Absent").length}</div>
              </div>
              <div className="stat-box leave">
                <h4>Leave / Half Day</h4>
                <div className="stat-num">{attendanceLogs.filter(l => ["Leave", "Half Day"].includes(l.status)).length}</div>
              </div>
            </div>

            <div className="overview-details-card">
              <h4>Account Details</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  <p>{user?.fullname || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Role</label>
                  <p>{user?.designation || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Email Address</label>
                  <p>{user?.email || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>{user?.phone_number || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="tab-content fade-in">
            <h3 className="section-title"><KeyRound size={18} /> Reset Password</h3>
            <div className="overview-details-card">
              <h4>Change Password</h4>
              <form onSubmit={handlePasswordChange} className="password-change-form">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="password-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div className="detail-item">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className="password-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="save-password-btn" disabled={passwordLoading}>
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="tab-content fade-in">
            <h3 className="section-title"><Clock size={18} /> My Attendance Activities</h3>

            {loading ? (
              <div className="loading-state">Loading your attendance records...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : attendanceLogs.length === 0 ? (
              <div className="empty-state">No attendance records found.</div>
            ) : (
              <div className="attendance-history-list">
                {attendanceLogs.map((log) => {
                  let parsedReport = [];
                  try {
                    if (log.work_report && typeof log.work_report === 'string') {
                      parsedReport = JSON.parse(log.work_report);
                      if (!Array.isArray(parsedReport)) parsedReport = [parsedReport];
                    }
                  } catch (e) {
                    if (log.work_report && !log.work_report.startsWith('[')) {
                      parsedReport = [{ category: "General", description: log.work_report }];
                    }
                  }

                  return (
                    <div key={log.id} className="history-card">
                      <div className="history-header">
                        <span className="history-date">
                          {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {renderStatus(log.status)}
                      </div>

                      <div className="history-times">
                        {log.checkin && <div className="time-pill checkin">In: {new Date(log.checkin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                        {log.checkout && <div className="time-pill checkout">Out: {new Date(log.checkout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                      </div>

                      {parsedReport.length > 0 && (
                        <div className="history-tasks">
                          <h4>Tasks Completed</h4>
                          <ul>
                            {parsedReport.map((task, i) => (
                              <li key={i}>
                                {task.category && task.category !== "General" && <span className="task-cat">[{task.category}]</span>}
                                {task.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="tab-content fade-in">
            <h3 className="section-title"><Calendar size={18} /> Full UI Calendar</h3>
            <div className="calendar-container">
              <div className="calendar-header">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>&lt;</button>
                <h2>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>&gt;</button>
              </div>
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="calendar-cell empty"></div>
                ))}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12);
                  const dateStr = dateObj.toISOString().split('T')[0];
                  const isSunday = dateObj.getDay() === 0;
                  const log = attendanceLogs.find(l => l.date === dateStr);

                  let statusClass = "";
                  if (log) {
                    if (log.status === "Present") statusClass = "status-present";
                    else if (log.status === "Absent") statusClass = "status-absent";
                    else if (log.status === "Leave" || log.status === "Half Day") statusClass = "status-leave";
                  } else if (isSunday) {
                    statusClass = "status-offday";
                  }

                  return (
                    <div key={day} className={`calendar-cell ${statusClass}`}>
                      <span className="day-number">{day}</span>
                      {log && <div className="cell-status-dot"></div>}
                      {isSunday && !log && <div className="offday-label">Off</div>}
                    </div>
                  );
                })}
              </div>
              <div className="calendar-legend">
                <div className="legend-item"><span className="legend-dot status-present"></span> Present</div>
                <div className="legend-item"><span className="legend-dot status-absent"></span> Absent</div>
                <div className="legend-item"><span className="legend-dot status-leave"></span> Leave / Half Day</div>
                <div className="legend-item"><span className="legend-dot status-offday"></span> Off Day</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePanel;
