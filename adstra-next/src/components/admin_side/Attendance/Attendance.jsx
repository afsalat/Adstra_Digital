"use client";

import { Info } from "lucide-react";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "./Attendance.css";
import CustomAlert from "@/components/common/CustomAlert/CustomAlert";
import API_BASE_URL from "@/utils/apiBase";

const BASE_URL = API_BASE_URL;

// --- Sub-components ---

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Avatar({ initials, size = 40 }) {
  // Generate consistent color from initials
  const bgColors = ["#E0F2FE", "#FCE7F3", "#DCFCE7", "#FEF3C7", "#F3E8FF"];
  const textColors = ["#0284C7", "#DB2777", "#16A34A", "#D97706", "#7C3AED"];
  const index = (initials?.charCodeAt(0) || 0) % bgColors.length;

  return (
    <div style={{
      width: size, height: size, borderRadius: "12px",
      background: bgColors[index], color: textColors[index],
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: "700", fontSize: "13px", flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    Present: { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
    Absent: { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" },
    Leave: { bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
    "Half Day": { bg: "#E0E7FF", color: "#4338CA", dot: "#6366F1" },
    "Check-in missing": { bg: "#F3F4F6", color: "#4B5563", dot: "#9CA3AF" },
  };
  const s = config[status] || config.Absent;

  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="status-dot" style={{ background: s.dot }}></span>
      {status}
    </span>
  );
}

export default function AttendanceDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals state
  const [showLogModal, setShowLogModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Pre-load libraries when modal is about to open
  useEffect(() => {
    if (showExportModal && !excelLib.current) {
      const loadLibs = async () => {
        try {
          const [excel, saver] = await Promise.all([
            import('exceljs'),
            import('file-saver')
          ]);
          excelLib.current = excel.default || excel;
          saverLib.current = saver.default || saver;
        } catch (e) {
          console.error("Failed to pre-load export libraries:", e);
        }
      };
      loadLibs();
    }
  }, [showExportModal]);

  // Log Form State - Array for multiple tasks
  const [logEntries, setLogEntries] = useState([{ project: "", description: "" }]);
  const [activeRowId, setActiveRowId] = useState(null); // This is user_id for work report, but for loop we use item.user
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [modalAddress, setModalAddress] = useState(null);
  const [exportDates, setExportDates] = useState({ start: "", end: "" });
  const [exportStatus, setExportStatus] = useState("idle");
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");
  const [exportError, setExportError] = useState("");
  const isExportCancelled = useRef(false);
  const [employees, setEmployees] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [exportEmployeeId, setExportEmployeeId] = useState("all");
  const [skipGeocoding, setSkipGeocoding] = useState(false); // New state for fast export
  const searchContainerRef = useRef(null);
  const excelLib = useRef(null); // Cache for library
  const saverLib = useRef(null); // Cache for library


  // Custom Alert State
  const [alert, setAlert] = useState({ show: false, title: "", message: "", type: "info" });

  const showAlert = (title, message, type = "info") => {
    setAlert({ show: true, title, message, type });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const router = useRouter();

  // Helper to get auth header
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/user-list/`, {
        headers: getAuthHeaders()
      });
      setEmployees(response.data.users || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  }, []);

  const handlePresetRange = (months) => {
    const end = new Date();
    const start = new Date();

    if (months === 'monthly') {
      start.setDate(1); // 1st of current month
    } else if (typeof months === 'number') {
      start.setMonth(start.getMonth() - months);
    }

    setExportDates({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedAttendance) {
      setModalAddress(null); // Reset
      let loc = selectedAttendance.location;
      let coords = null;
      if (typeof loc === 'string' && (loc.startsWith('{') || loc.includes('latitude'))) {
        try { coords = JSON.parse(loc.replace(/'/g, '"')); } catch { }
      } else if (typeof loc === 'object') { coords = loc; }

      if (coords && coords.latitude && coords.longitude) {
        // Fetch address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`, {
          headers: { 'User-Agent': 'Adstra_Dashboard/1.0' }
        })
          .then(res => res.json())
          .then(data => setModalAddress(data.display_name))
          .catch(() => setModalAddress("Address lookup failed"));
      } else {
        setModalAddress(loc || "No location data");
      }
    }
  }, [selectedAttendance]);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No auth token found. Please login.");
      }

      const response = await axios.get(`${BASE_URL}/attendance/list-attendance/`, {
        params: { date: selectedDate },
        headers: { Authorization: `Bearer ${token}` }
      });

      const rawUsers = response.data.results?.users || response.data.users || [];

      const mappedData = rawUsers.map(item => ({
        ...item,
        avatar: item.fullname ? item.fullname.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "??",
      }));

      setData(mappedData);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch attendance.");
      if (err.response?.status === 401) {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate, router]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const activeEmployees = useMemo(() => {
    return employees.filter(emp => emp.is_active !== false); // Handle true or undefined (if backend doesn't send it for some reason)
  }, [employees]);

  const stats = useMemo(() => {
    return {
      total: data.length,
      present: data.filter(d => d.status === "Present").length,
      absent: data.filter(d => d.status === "Absent").length,
      leave: data.filter(d => ["Leave", "Half Day"].includes(d.status)).length,
    };
  }, [data]);

  const filtered = useMemo(() => data.filter(item => {
    const query = search.toLowerCase();
    const matchesSearch = 
      (item.fullname || "").toLowerCase().includes(query) || 
      (item.designation || "").toLowerCase().includes(query);
    const matchesFilter = activeFilter === "All" || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  }), [data, search, activeFilter]);

  const toggleValidation = async (id) => {
    try {
      const item = data.find(d => d.id === id);
      if (!item) return;

      const newValidationStatus = !item.validation;

      await axios.put(`${BASE_URL}/attendance/validate/${id}`,
        { validation: newValidationStatus },
        { headers: getAuthHeaders() }
      );

      setData(prev => prev.map(d => d.id === id ? { ...d, validation: newValidationStatus } : d));
    } catch (err) {
      showAlert("Error", "Failed to update validation: " + (err.response?.data?.error || err.message), "error");
    }
  };

  const handleOpenLogModal = (userId) => {
    setActiveRowId(userId);
    setLogEntries([{ project: "", description: "" }]);
    setShowLogModal(true);
  };

  const handleCurrentUserWorkReport = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      handleOpenLogModal(user.id);
    } else {
      showAlert("Error", "User details not found. Please login.", "error");
    }
  };

  const handleCheckout = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        showAlert("Error", "User details not found.", "error");
        return;
      }
      const user = JSON.parse(userStr);

      const response = await axios.post(`${BASE_URL}/user/logout/${user.id}/`, {}, {
        headers: getAuthHeaders()
      });

      showAlert("Success", response.data.message, "success");
      fetchAttendance();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message;
      if (errMsg.includes("Work report not submitted")) {
        showAlert("Required Data", "Please submit your daily work report before checking out.", "warning");
      } else {
        showAlert("Error", "Checkout failed: " + errMsg, "error");
      }
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };

  const handleDateChange = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // --- Work Log Handlers ---
  const handleAddLogEntry = () => {
    setLogEntries([...logEntries, { project: "", description: "" }]);
  };

  const handleRemoveLogEntry = (index) => {
    const newEntries = logEntries.filter((_, i) => i !== index);
    setLogEntries(newEntries.length ? newEntries : [{ project: "", description: "" }]);
  };

  const handleLogChange = (index, field, value) => {
    const newEntries = [...logEntries];
    newEntries[index][field] = value;
    setLogEntries(newEntries);
  };

  const handleSaveLog = async () => {
    const validEntries = logEntries.filter(e => e.description.trim() !== "");
    if (validEntries.length === 0) {
      showAlert("Warning", "Please enter at least one task description.", "warning");
      return;
    }

    try {
      const reportString = JSON.stringify(validEntries.map(entry => ({
        category: entry.project || "General",
        description: entry.description
      })));

      await axios.post(`${BASE_URL}/user/work_report/${activeRowId}/`,
        { work_report: reportString },
        { headers: getAuthHeaders() }
      );

      showAlert("Success", "Work report submitted successfully!", "success");
      setShowLogModal(false);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      showAlert("Error", "Failed to save work report: " + (err.response?.data?.error || err.message), "error");
    }
  };

  const resetExport = () => {
    isExportCancelled.current = false;
    setExportStatus("idle");
    setExportProgress(0);
    setExportMessage("");
    setExportError("");
  };

  const cancelExport = () => {
    isExportCancelled.current = true;
    setExportStatus("idle");
    setExportProgress(0);
    setExportMessage("");
    setShowExportModal(false);
    showAlert("Info", "Attendance export has been cancelled.", "info");
  };

  const handleExport = async () => {
    if (!exportDates.start || !exportDates.end) {
      showAlert("Warning", "Please select both start and end dates.", "warning");
      return;
    }

    setExportStatus("preparing");
    isExportCancelled.current = false;
    setExportProgress(10);
    setExportMessage("Fetching attendance data...");
    setExportError("");

    try {
      const response = await axios.get(`${BASE_URL}/attendance/list-attendance/`, {
        params: {
          export: "true",
          start_date: exportDates.start,
          end_date: exportDates.end
        },
        headers: getAuthHeaders()
      });

      const data = response.data.users || response.data.results?.users || [];

      const filteredData = exportEmployeeId === "all"
        ? data
        : data.filter(u => String(u.user) === String(exportEmployeeId) || String(u.id) === String(exportEmployeeId));

      if (!filteredData.length) {
        setExportStatus("idle");
        showAlert("Info", "No attendance records found for the selected range/employee.", "info");
        return;
      }

      setExportProgress(20);
      setExportMessage("Initializing workbook...");

      // Use pre-loaded libraries
      if (!excelLib.current || !saverLib.current) {
        setExportMessage("Loading libraries (delayed)...");
        const [excel, saver] = await Promise.all([
          import('exceljs'),
          import('file-saver')
        ]);
        excelLib.current = excel.default || excel;
        saverLib.current = saver.default || saver;
      }

      const ExcelJS = excelLib.current;
      const saveAs = saverLib.current.saveAs || saverLib.current;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance Report');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Full Name', key: 'fullname', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Check In', key: 'checkin', width: 12 },
        { header: 'Check Out', key: 'checkout', width: 12 },
        { header: 'Location', key: 'location', width: 30 },
        { header: 'Validation', key: 'validation', width: 12 },
        { header: 'Work Report', key: 'work_report', width: 50 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 30;

      setExportStatus("geocoding");
      const locationCache = {};
      
      // PHASE 1: Optimized Geocoding (Unique locations only)
      if (!skipGeocoding) {
        setExportMessage("Analyzing lookup locations...");
        const uniqueLocs = new Set();
        filteredData.forEach(row => {
          if (row.location) {
            try {
              let loc = row.location;
              let coords = null;
              if (typeof loc === 'string' && (loc.startsWith('{') || loc.includes('latitude'))) {
                 coords = JSON.parse(loc.replace(/'/g, '"'));
              } else if (typeof loc === 'object') coords = loc;
              
              if (coords && coords.latitude && coords.longitude) {
                uniqueLocs.add(`${coords.latitude},${coords.longitude}`);
              }
            } catch(e) {}
          }
        });
        
        if (uniqueLocs.size > 0) {
          const uniqueArray = Array.from(uniqueLocs);
          for (let j = 0; j < uniqueArray.length; j++) {
            if (isExportCancelled.current) return;
            const geoProgress = Math.floor(25 + ((j / uniqueArray.length) * 40));
            setExportProgress(geoProgress);
            setExportMessage(`Address lookup ${j + 1} of ${uniqueArray.length}...`);

            // Safe delay for Nominatim lookup
            if (j > 0) await new Promise(resolve => setTimeout(resolve, 800));

            const [lat, lon] = uniqueArray[j].split(',');
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                headers: { 'User-Agent': 'Adstra_Dashboard/1.0' }
              });
              const addr = await res.json();
              locationCache[uniqueArray[j]] = addr.display_name || `Lat: ${lat}, Lon: ${lon}`;
            } catch(err) {
              locationCache[uniqueArray[j]] = `Lat: ${lat}, Lon: ${lon}`;
            }
          }
        }
      }

      // PHASE 2: Fast Row Generation
      setExportStatus("processing");
      setExportMessage("Building spreadsheet rows...");
      
      for (let i = 0; i < filteredData.length; i++) {
        if (isExportCancelled.current) return;
        const row = filteredData[i];
        const currentProgress = Math.floor(65 + ((i / filteredData.length) * 30));
        setExportProgress(currentProgress);

        let formattedReport = "No logs";
        try {
          if (row.work_report) {
            const p = JSON.parse(row.work_report);
            const r = Array.isArray(p) ? p : [p];
            if (r.length > 0) {
              formattedReport = r.map(item => {
                const cat = (item.category && item.category !== 'General') ? `[${item.category}] ` : '';
                return `${cat}${item.description}`;
              }).join('\n');
            } else {
              formattedReport = row.work_report;
            }
          }
        } catch (e) { formattedReport = row.work_report || ""; }

        let formattedLoc = "No data";
        if (skipGeocoding) {
          formattedLoc = row.location || "Omitted";
        } else {
          try {
            let loc = row.location;
            let coords = null;
            if (typeof loc === 'string' && (loc.startsWith('{') || loc.includes('latitude'))) {
              coords = JSON.parse(loc.replace(/'/g, '"'));
            } else if (typeof loc === 'object') coords = loc;

            if (coords?.latitude && coords?.longitude) {
              formattedLoc = locationCache[`${coords.latitude},${coords.longitude}`] || `Lat: ${coords.latitude}, Lon: ${coords.longitude}`;
            } else if (loc) {
              formattedLoc = String(loc);
            }
          } catch (e) { formattedLoc = String(row.location || "Error"); }
        }

        const newRow = worksheet.addRow({
          id: row.id,
          fullname: row.fullname || "",
          date: row.date,
          status: row.status,
          checkin: row.checkin ? new Date(row.checkin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--",
          checkout: row.checkout ? new Date(row.checkout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--",
          location: formattedLoc,
          validation: row.validation ? "Valid" : "Pending",
          work_report: formattedReport
        });

        ['id', 'date', 'status', 'checkin', 'checkout', 'validation'].forEach(key => {
          newRow.getCell(key).alignment = { vertical: 'top', horizontal: 'center' };
        });

        ['fullname', 'location', 'work_report'].forEach(key => {
          newRow.getCell(key).alignment = { vertical: 'top', wrapText: true };
        });
      }

      setExportStatus("generating");
      setExportProgress(95);
      setExportMessage("Finalizing Excel file...");

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          if (rowNumber % 2 === 0) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          } else {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
          }
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Attendance_Report_${exportDates.start}_to_${exportDates.end}.xlsx`);

      setExportStatus("idle");
      setExportProgress(100);
      setShowExportModal(false);
      setExportDates({ start: "", end: "" });
    } catch (err) {
      console.error("Export Error:", err);
      setExportStatus("error");
      setExportError(err.response?.data?.error || err.message || "An unexpected error occurred during export.");
    }
  };

  const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--";
  const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        :root {
          --bg-body: #F8FAFC;
          --bg-card: #FFFFFF;
          --text-primary: #0F172A;
          --text-secondary: #64748B;
          --primary: #4F46E5;
          --border: #F1F5F9;
          --danger: #EF4444;
        }

        body {
          background-color: var(--bg-body);
          color: var(--text-primary);
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        /* Top Nav */
        .top-nav {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .back-btn {
          background: white;
          border: 1px solid #E2E8F0;
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-secondary);
          transition: all 0.2s;
          margin-right: 16px;
          font-size: 18px;
        }
        .back-btn:hover { background: #F1F5F9; color: var(--text-primary); }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .title { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; color: var(--text-primary); margin: 0; }
        
        .date-navigator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
          background: #FFFFFF;
          padding: 6px 12px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          width: fit-content;
        }
        .nav-btn {
          background: transparent; border: none; color: var(--text-secondary);
          cursor: pointer; font-size: 16px; width: 28px; height: 28px;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .nav-btn:hover { background: #F1F5F9; color: var(--text-primary); }
        .current-date { font-size: 14px; font-weight: 600; color: var(--text-primary); min-width: 180px; text-align: center; }
        
        .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn { padding: 10px 20px; border-radius: 12px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        
        .btn-primary { background: var(--text-primary); color: white; box-shadow: 0 4px 12px rgba(15,23,42,0.15); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15,23,42,0.2); }
        
        .btn-secondary { background: white; color: var(--text-primary); border: 1px solid #E2E8F0; }
        .btn-secondary:hover { background: #F1F5F9; }

        .btn-danger { background: #FEF2F2; color: var(--danger); border: 1px solid #FECACA; }
        .btn-danger:hover { background: #FEE2E2; }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: var(--bg-card);
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-4px); }
        .stat-value { font-size: 32px; font-weight: 800; line-height: 1; margin-bottom: 8px; }
        .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); }

        /* Main Content */
        .content-card {
          background: var(--bg-card);
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .toolbar {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(10px);
        }

        .filter-tabs { display: flex; gap: 4px; background: #F1F5F9; padding: 4px; border-radius: 12px; }
        .tab {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: var(--text-secondary);
          border: none; background: transparent;
          transition: all 0.2s;
        }
        .tab.active { background: white; color: var(--text-primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .search-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px 16px;
          width: 280px;
          display: flex; align-items: center;
        }
        .search-input { border: none; background: transparent; width: 100%; outline: none; font-size: 14px; font-weight: 500; color: var(--text-primary); }
        .search-input::placeholder { color: #94A3B8; }

        /* Table */
        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 20px 24px; font-size: 12px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); white-space: nowrap; }
        td { padding: 20px 24px; font-size: 14px; color: var(--text-secondary); border-bottom: 1px solid var(--border); vertical-align: top; white-space: nowrap; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #FAFAFA; }

        .user-cell { display: flex; gap: 14px; align-items: center; }
        .user-info { display: flex; flex-direction: column; }
        .fullname { font-weight: 700; color: var(--text-primary); font-size: 15px; }
        .role { font-size: 13px; margin-top: 2px; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }

        .time-block { display: flex; flex-direction: column; gap: 4px; font-variant-numeric: tabular-nums; }
        .time-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
        .time-label { color: #94A3B8; font-size: 11px; font-weight: 600; width: 24px; }

        .work-report-cell { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .work-report { max-width: 250px; font-size: 13px; line-height: 1.5; white-space: normal; min-width: 200px; }
        .report-item { margin-bottom: 4px; }
        .report-cat { font-weight: 600; color: var(--text-primary); margin-right: 6px; }
        
        .add-log-btn {
          width: 24px; height: 24px; border-radius: 6px; border: 1px solid #E2E8F0;
          background: white; color: #64748B; cursor: pointer; display: flex;
          align-items: center; justify-content: center; font-size: 16px;
          transition: all 0.2s; flex-shrink: 0;
        }
        .add-log-btn:hover { background: var(--text-primary); color: white; border-color: var(--text-primary); }

        .validation-btn {
          background: transparent; border: 1px solid #E2E8F0;
          width: 32px; height: 32px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #CBD5E1; transition: all 0.2s;
        }
        .validation-btn.valid { background: #ECFDF5; border-color: #10B981; color: #10B981; }
        .validation-btn:hover { transform: scale(1.1); }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
        }
        .custom-modal {
          background: white; padding: 32px; width: 500px;
          border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          animation: slideUp 0.3s ease-out; max-height: 80vh; overflow-y: auto;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary); }
        .form-control {
          width: 100%; padding: 12px; border: 1px solid #E2E8F0;
          border-radius: 12px; font-size: 14px; font-family: inherit;
          outline: none; transition: border-color 0.2s;
        }
        .form-control:focus { border-color: var(--primary); }

        .log-entry-row {
          background: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 12px;
          border: 1px solid #E2E8F0; position: relative;
        }
        .remove-row-btn {
          position: absolute; top: 12px; right: 12px; color: #EF4444; 
          background: none; border: none; cursor: pointer; font-size: 18px;
        }
        
        .add-row-btn {
          width: 100%; border: 1px dashed #CBD5E1; background: transparent;
          color: var(--text-secondary); padding: 10px; border-radius: 12px;
          cursor: pointer; font-weight: 500; transition: all 0.2s;
        }
        .add-row-btn:hover { border-color: var(--text-primary); color: var(--text-primary); }

        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .toolbar { flex-direction: column; gap: 16px; align-items: stretch; }
          .search-box { width: auto; }
        }
        @media (max-width: 600px) {
          .container { padding: 20px 16px; }
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
          .stat-card { padding: 16px; border-radius: 16px; }
          .stat-value { font-size: 24px; margin-bottom: 4px; }
          .stat-label { font-size: 10px; line-height: 1.3; }
          
          .header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
          .title { font-size: 24px; }
          .header-actions { width: 100%; }
          .btn { flex: 1; justify-content: center; padding: 10px; font-size: 13px; }
        }
      `}</style>
      <CustomAlert
        show={alert.show}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={closeAlert}
      />

      <div className="top-nav">
        <button className="back-btn" onClick={handleBack} title="Go Back">←</button>
      </div>

      <div className="header">
        <div>
          <h1 className="title">Attendance</h1>
          <div className="date-navigator">
            <button className="nav-btn" onClick={() => handleDateChange(-1)}>←</button>
            <span className="current-date">{displayDate}</span>
            <button className="nav-btn" onClick={() => handleDateChange(1)}>→</button>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowExportModal(true)}>
            Export Report
          </button>
          <button className="btn btn-primary" onClick={handleCurrentUserWorkReport}>
            My Work Report
          </button>
          <button className="btn btn-danger" onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Employees" value={stats.total} color="#0F172A" />
        <StatCard label="Present" value={stats.present} color="#16A34A" />
        <StatCard label="Absent" value={stats.absent} color="#DC2626" />
        <StatCard label="On Leave" value={stats.leave} color="#D97706" />
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="filter-tabs">
            {["All", "Present", "Absent", "Leave"].map(filter => (
              <button
                key={filter}
                className={`tab ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="search-box" ref={searchContainerRef}>
              <input
                className="search-input"
                placeholder="Search by name or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {isSearchFocused && (
                <div className="search-dropdown-list">
                  <div
                    className="search-dropdown-item all-option"
                    onClick={() => {
                      setSearch("");
                      setIsSearchFocused(false);
                    }}
                  >
                    All Employees
                  </div>
                  {activeEmployees
                    .filter(emp =>
                      emp.fullname.toLowerCase().includes(search.toLowerCase()) ||
                      (emp.designation && emp.designation.toLowerCase().includes(search.toLowerCase()))
                    )
                    .map(emp => (
                      <div
                        key={emp.id}
                        className="search-dropdown-item"
                        onClick={() => {
                          setSearch(emp.fullname);
                          setIsSearchFocused(false);
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: "600" }}>{emp.fullname}</span>
                          {emp.designation && <span className="item-role">{emp.designation}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Timings</th>
                <th>Location</th>
                <th>Work Log</th>
                <th>Valid</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}>Loading attendance data...</td></tr>
              ) : error ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "60px", color: "#EF4444" }}>{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: "60px", color: "#94A3B8" }}>No records found for {displayDate}.</td></tr>
              ) : filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="user-cell">
                      <Avatar initials={item.avatar} />
                      <div className="user-info">
                        <span className="fullname">{item.fullname}</span>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div className="time-block">
                      <div className="time-row"><span className="time-label">IN</span> {fmtTime(item.checkin)}</div>
                      <div className="time-row"><span className="time-label">OUT</span> {fmtTime(item.checkout)}</div>
                    </div>
                  </td>
                  <td>
                    {(() => {
                      if (!item.location) return <span style={{ color: "#CBD5E1" }}>—</span>;
                      if (item.city) return item.city;

                      let loc = item.location;
                      let coords = null;

                      if (typeof loc === 'string' && (loc.startsWith('{') || loc.includes('latitude'))) {
                        try {
                          const jsonString = loc.replace(/'/g, '"');
                          coords = JSON.parse(jsonString);
                        } catch (e) {}
                      } else if (typeof loc === 'object') {
                        coords = loc;
                      }

                      if (coords && coords.latitude && coords.longitude) {
                        return (
                          <a
                            href={`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#3B82F6", textDecoration: "underline", fontSize: "0.9em" }}
                          >
                            View Map
                          </a>
                        );
                      }

                      return loc;
                    })()}
                  </td>
                  <td>
                    <div className="work-report-cell">
                      <div className="work-report">
                        {(() => {
                          let r = [];
                          try {
                            const parsed = JSON.parse(item.work_report);
                            if (Array.isArray(parsed)) r = parsed;
                            else if (parsed) r = [parsed];
                          } catch { }

                          if (!r.length && item.work_report && typeof item.work_report === 'string' && !item.work_report.startsWith('[')) {
                            r = [{ description: item.work_report }];
                          }

                          return (r && r.length) ? r.map((line, i) => (
                            <div key={i} className="report-item">
                              {line.category && line.category !== "General" && <span className="report-cat">{line.category}:</span>}
                              {line.description}
                            </div>
                          )) : <span style={{ color: "#CBD5E1", fontStyle: "italic" }}>No logs</span>
                        })()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      className={`validation-btn ${item.validation ? "valid" : ""}`}
                      onClick={() => toggleValidation(item.id)}
                      title="Toggle Validation"
                    >
                      {item.validation ? "✓" : "○"}
                    </button>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => setSelectedAttendance(item)} title="View Details" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                      <Info size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="custom-modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>Log Daily Work</h2>
            <div style={{ maxHeight: "60vh", overflowY: "auto", marginBottom: 16 }}>
              {logEntries.map((entry, index) => (
                <div key={index} className="log-entry-row">
                  {logEntries.length > 1 && (
                    <button className="remove-row-btn" onClick={() => handleRemoveLogEntry(index)}>×</button>
                  )}
                  <div className="form-group">
                    <label className="form-label">Project / Category</label>
                    <input
                      className="form-control"
                      placeholder="e.g. UI Design"
                      value={entry.project}
                      onChange={e => handleLogChange(index, "project", e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Task details..."
                      value={entry.description}
                      onChange={e => handleLogChange(index, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="add-row-btn" onClick={handleAddLogEntry}>+ Add Another Task</button>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setShowLogModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveLog}>Save All</button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="modal-overlay" onClick={() => exportStatus === "idle" && setShowExportModal(false)}>
          <div className="custom-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <h2 style={{ marginTop: 0, marginBottom: 24, fontSize: 20 }}>Export Attendance</h2>
            
            {exportStatus === "idle" ? (
              <>
                <div className="quick-ranges-container">
                  <span className="quick-ranges-label">Quick Date Ranges</span>
                  <div className="quick-ranges-buttons">
                    <button className="preset-btn" onClick={() => handlePresetRange('monthly')}>Monthly</button>
                    <button className="preset-btn" onClick={() => handlePresetRange(3)}>3 Months</button>
                    <button className="preset-btn" onClick={() => handlePresetRange(6)}>6 Months</button>
                    <button className="preset-btn" onClick={() => handlePresetRange(12)}>1 Year</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select
                    className="form-control"
                    value={exportEmployeeId}
                    onChange={e => setExportEmployeeId(e.target.value)}
                  >
                    <option value="all">All Employees</option>
                    {activeEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullname}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="skip-geo"
                    checked={skipGeocoding}
                    onChange={(e) => setSkipGeocoding(e.target.checked)}
                    style={{ width: "auto", cursor: "pointer" }}
                  />
                  <label htmlFor="skip-geo" style={{ fontSize: "14px", fontWeight: "500", color: "#475569", cursor: "pointer", margin: 0 }}>
                    Fast Export (Exclude address lookups)
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={exportDates.start}
                    onChange={e => setExportDates({ ...exportDates, start: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={exportDates.end}
                    onChange={e => setExportDates({ ...exportDates, end: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button className="btn btn-secondary" onClick={() => setShowExportModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleExport}>Download Report</button>
                </div>
              </>
            ) : exportStatus === "error" ? (
              <div className="export-error-view">
                <div className="export-error-container">
                  <div className="export-error-header">
                    <span>⚠️</span> Export Failed
                  </div>
                  <div className="export-error-details">{exportError}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
                  <button className="btn btn-secondary" onClick={resetExport}>Back</button>
                  <button className="btn btn-primary" onClick={handleExport}>Retry</button>
                </div>
              </div>
            ) : (
              <div className="export-progress-view" style={{ padding: "10px 0" }}>
                <div className="export-progress-group" style={{ textAlign: 'center' }}>
                  <div className="progress-bar-container" style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '15px' }}>
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${exportProgress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', transition: 'width 0.3s ease' }}
                    ></div>
                  </div>
                  <div className="status-pulse" style={{ fontWeight: 500, color: '#475569' }}>
                    {exportMessage}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#94A3B8" }}>
                    {exportProgress}% Complete
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                  <button className="btn btn-secondary" onClick={cancelExport} style={{ padding: "8px 24px", borderRadius: "10px" }}>
                    Cancel Export
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedAttendance && (
        <div className="modal-overlay" onClick={() => setSelectedAttendance(null)}>
          <div className="custom-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 24 }}>Attendance Details</h2>
              <button onClick={() => setSelectedAttendance(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748B" }}>×</button>
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #E2E8F0" }}>
              <Avatar initials={selectedAttendance.avatar} size={64} />
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 18 }}>{selectedAttendance.fullname}</h3>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <StatusBadge status={selectedAttendance.status} />
                  {selectedAttendance.validation ? (
                    <span style={{ padding: "4px 8px", background: "#ECFDF5", color: "#10B981", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Valid</span>
                  ) : (
                    <span style={{ padding: "4px 8px", background: "#F3F4F6", color: "#64748B", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Pending Validation</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase" }}>Date</label>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{new Date(selectedAttendance.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 4, textTransform: "uppercase" }}>Timings</label>
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  <span style={{ color: "#16A34A" }}>IN: {fmtTime(selectedAttendance.checkin)}</span>
                  <span style={{ margin: "0 8px", color: "#CBD5E1" }}>|</span>
                  <span style={{ color: "#DC2626" }}>OUT: {fmtTime(selectedAttendance.checkout)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 8, textTransform: "uppercase" }}>Location</label>
              <div style={{ background: "#F8FAFC", padding: 12, borderRadius: 12, border: "1px solid #E2E8F0" }}>
                {(() => {
                  let loc = selectedAttendance.location;
                  let coords = null;
                  if (typeof loc === 'string' && (loc.startsWith('{') || loc.includes('latitude'))) {
                    try { coords = JSON.parse(loc.replace(/'/g, '"')); } catch { }
                  } else if (typeof loc === 'object') { coords = loc; }

                  return (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>
                        <span style={{ display: "block", marginBottom: 4, fontWeight: "bold", color: "#64748B", fontSize: 11 }}>ADDRESS</span>
                        {modalAddress || "Loading address..."}
                      </span>
                      {coords && coords.latitude && (
                        <a
                          href={`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}
                        >
                          View Map
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 8, textTransform: "uppercase" }}>Work Log</label>
              <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0", maxHeight: "200px", overflowY: "auto" }}>
                {(() => {
                  let r = [];
                  try {
                    const p = JSON.parse(selectedAttendance.work_report);
                    if (Array.isArray(p)) r = p;
                    else if (p) r = [p];
                  } catch { }

                  if (!r.length && selectedAttendance.work_report && typeof selectedAttendance.work_report === 'string' && !selectedAttendance.work_report.startsWith('[')) {
                    r = [{ description: selectedAttendance.work_report }];
                  }

                  return r.length ? (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {r.map((line, i) => (
                        <li key={i} style={{ marginBottom: 8 }}>
                          {line.category && line.category !== "General" && <strong style={{ marginRight: 6 }}>{line.category}:</strong>}
                          {line.description}
                        </li>
                      ))}
                    </ul>
                  ) : <span style={{ color: "#94A3B8", fontStyle: "italic" }}>No work logs submitted for this day.</span>
                })()}
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button className="btn btn-secondary" onClick={() => setSelectedAttendance(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
