"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ScrollText, RefreshCw, User, Calendar, Activity, Database } from "lucide-react";
import "./SystemLog.css";

const SystemLog = ({ API_BASE }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/settings/logs/?t=${Date.now()}`, {
        headers: getAuthHeaders(),
      });
      setLogs(response.data);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to fetch logs:", err);
      }
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [API_BASE]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="system-log-container">
      <div className="log-header">
        <div className="title-section">
          <ScrollText className="icon" size={24} />
          <h2>System Activity Logs</h2>
          <span style={{ fontSize: '10px', color: '#ccc', marginLeft: '10px' }}>
            API: {API_BASE}/settings/logs/ | Count: {logs.length}
          </span>
        </div>
        <button onClick={fetchLogs} disabled={loading} className="refresh-btn">
          <RefreshCw className={loading ? "spin" : ""} size={18} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="log-table-wrapper">
        <table className="log-table">
          <thead>
            <tr>
              <th><Calendar size={14} /> Timestamp</th>
              <th><User size={14} /> User</th>
              <th><Activity size={14} /> Action</th>
              <th><Database size={14} /> Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="timestamp">{formatDate(log.timestamp)}</td>
                  <td className="user-info">
                    <span className="fullname">{log.user_name || "System"}</span>
                    <span className="username">@{log.username || "system"}</span>
                  </td>
                  <td>
                    <span className={`action-badge ${log.action.toLowerCase().replace(/\s+/g, '-')}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="details">{log.details}</td>
                  <td className="ip">{log.ip_address || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  {loading ? "Loading logs..." : error ? <span className="error-text">Error: {error}</span> : "No activity logs found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLog;
