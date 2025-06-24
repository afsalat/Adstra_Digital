// ... imports
import React, { useEffect, useState } from "react";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jwtDecode } from "jwt-decode";
import "./Attendance.css";

const BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [workReportEntries, setWorkReportEntries] = useState([
    { category: "", description: "" },
  ]);
  const [newEntry, setNewEntry] = useState({
    user: "",
    date: "",
    checkin: "",
    checkout: "",
    work_report: "",
    status: "Present",
    location: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("authToken");

  const handleLogout = () => {
    const today = new Date().toISOString().split("T")[0];
    const checkoutTime = new Date().toISOString();
    axios
      .post(`${BASE_URL}/attendance/logout/${userId}/`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setAttendanceData((prev) =>
          prev.map((entry) =>
            entry.user === userId && entry.date === today
              ? { ...entry, checkout: checkoutTime }
              : entry
          )
        );
      })
      .catch((error) => {
        alert("❌ Already checkout record");
        console.error("Logout error:", error);
      });
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.user_id);
        setNewEntry((prev) => ({ ...prev, user: decoded.user_id }));
        setIsAdmin(
          decoded?.is_admin || decoded?.is_staff || decoded?.user_id === 9
        );
      } catch (e) {
        console.error("Invalid token:", e);
      }
    }
  }, [token]);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    // Define columns
    worksheet.columns = [
      { header: "User ID", key: "user", width: 10 },
      { header: "Full Name", key: "fullname", width: 20 },
      { header: "Date", key: "date", width: 15 },
      { header: "Check-In", key: "checkin", width: 12 },
      { header: "Check-Out", key: "checkout", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Location", key: "location", width: 20 },
      { header: "Category", key: "category", width: 20 },
      { header: "Description", key: "description", width: 40 },
      { header: "Validated", key: "validated", width: 10 },
    ];

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3C78D8" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Fill data
    attendanceData.forEach((row) => {
      let workReports = [];

      try {
        const parsed = JSON.parse(row.work_report);
        if (Array.isArray(parsed)) workReports = parsed;
      } catch {
        if (row.work_report) {
          workReports = [{ category: "N/A", description: row.work_report }];
        }
      }

      if (workReports.length > 0) {
        workReports.forEach((item, index) => {
          worksheet.addRow({
            user: index === 0 ? row.user : "",
            fullname: index === 0 ? row.fullname : "",
            date: index === 0 ? row.date : "",
            checkin: index === 0 ? formatTime(row.checkin) : "",
            checkout: index === 0 ? formatTime(row.checkout) : "",
            status: index === 0 ? row.status : "",
            location: index === 0 ? row.location : "",
            category: item.category,
            description: item.description,
            validated: index === 0 ? (row.validation ? "Yes" : "No") : "",
          });
        });
      } else {
        worksheet.addRow({
          user: row.user,
          fullname: row.fullname,
          date: row.date,
          checkin: formatTime(row.checkin),
          checkout: formatTime(row.checkout),
          status: row.status,
          location: row.location,
          category: "",
          description: "",
          validated: row.validation ? "Yes" : "No",
        });
      }
    });

    // Align all cells and apply borders
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Generate and save
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Styled_Attendance.xlsx");
  };

  const getPlaceName = async (locationStr) => {
    if (!locationStr.includes("latitude")) return locationStr;
    try {
      const locObj = JSON.parse(locationStr.replace(/'/g, '"'));
      const { latitude, longitude } = locObj;
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      return res.data.display_name || `${latitude}, ${longitude}`;
    } catch (err) {
      return locationStr;
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [token, userId, currentPage]);

  const fetchAttendanceData = () => {
    if (!token || !userId) return;

    axios
      .get(`${BASE_URL}/attendance/list-attendance/?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const userEntries = res.data?.users || res.data?.results?.users || [];
        const updated = await Promise.all(
          userEntries.map(async (entry) => ({
            ...entry,
            location: await getPlaceName(entry.location),
          }))
        );
        console.log("data - ", userEntries);
        setAttendanceData(updated);
      })
      .catch((err) => console.error("Error fetching attendance:", err));
  };

  const handleAddEntry = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      try {
        const entry = { ...newEntry, location };
        const res = await axios.post(
          `${BASE_URL}/attendance/add-attendance/`,
          entry,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const readableLocation = await getPlaceName(location);
        setAttendanceData((prev) => [
          ...prev,
          { ...res.datax, location: readableLocation },
        ]);
        setNewEntry({
          user: userId,
          date: "",
          checkin: "",
          checkout: "",
          work_report: "",
          status: "Present",
          location: "",
        });
        setShowForm(false);
      } catch (error) {
        console.error("Add entry error:", error);
      }
    });
  };

  const handleWorkEntryChange = (index, field, value) => {
    const updated = [...workReportEntries];
    updated[index][field] = value;
    setWorkReportEntries(updated);
  };

  const addWorkEntry = () => {
    setWorkReportEntries([
      ...workReportEntries,
      { category: "", description: "" },
    ]);
  };

  const removeWorkEntry = (index) => {
    const updated = [...workReportEntries];
    updated.splice(index, 1);
    setWorkReportEntries(updated);
  };

  const handleWorkReportSubmit = () => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    axios
      .post(
        `${BASE_URL}/attendance/work_report/${userId}/`,
        { work_report: JSON.stringify(workReportEntries) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAttendanceData((prev) =>
          prev.map((entry) =>
            entry.user === userId && entry.date === today
              ? { ...entry, work_report: JSON.stringify(workReportEntries) }
              : entry
          )
        );
        setWorkReportEntries([{ category: "", description: "" }]);
        fetchAttendanceData();
      })
      .catch((err) => console.error("Update report error:", err));
  };

  const handleValidationChange = (id, validation) => {
    axios
      .put(
        `${BASE_URL}/attendance/validate/${id}`,
        { validation },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAttendanceData((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, validation } : entry
          )
        );
      })
      .catch((err) => console.error("Validation error:", err));
  };

  const formatTime = (datetime) => {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="attendance-container">
      <div style={{ width: "100%", display: "flex", justifyContent: "left" }}>
        <button
          onClick={() => window.history.back()}
          className="btn btn-secondary"
        >
          ← Back to Home
        </button>
      </div>
      <h2>Attendance List</h2>

      <div className="header-box">
        {/* Work Report Input Section */}
        <div className="work-report-section">
          {workReportEntries.map((entry, idx) => (
            <div key={idx} className="report-entry-row">
              <input
                type="text"
                placeholder="Category"
                value={entry.category}
                onChange={(e) =>
                  handleWorkEntryChange(idx, "category", e.target.value)
                }
              />
              <textarea
                placeholder="Description"
                value={entry.description}
                onChange={(e) =>
                  handleWorkEntryChange(idx, "description", e.target.value)
                }
              />
              {idx > 0 && (
                <button
                  onClick={() => removeWorkEntry(idx)}
                  className="delete-entry"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
          <div className="header-buttons">
            <button className="create-btn" onClick={handleWorkReportSubmit}>
              Submit
            </button>
            <button className="create-btn" onClick={addWorkEntry}>
              +
            </button>
          </div>
        </div>

        {/* Action Buttons Grouped */}
        <div className="header-buttons">
          <button onClick={fetchAttendanceData} className="create-btn">
            🔁 Manual Refresh
          </button>
          <button onClick={handleLogout} className="checkout-btn">
            Checkout
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setShowForm(!showForm)}
                className="create-btn"
              >
                {showForm ? "Cancel" : "Create New Entry"}
              </button>
              <button onClick={exportToExcel} className="export-btn">
                Export to Excel
              </button>
            </>
          )}
        </div>

        {/* Admin Entry Form */}
        {showForm && isAdmin && (
          <div className="create-form">
            {["date", "checkin", "checkout"].map((field) => (
              <label key={field}>
                {field.toUpperCase()}
                <input
                  type={field === "date" ? "date" : "datetime-local"}
                  name={field}
                  value={newEntry[field]}
                  onChange={(e) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
            <label>
              STATUS
              <select
                name="status"
                value={newEntry.status}
                onChange={(e) =>
                  setNewEntry((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </label>
            <label>
              .
              <button onClick={handleAddEntry} className="create-btn">
                Submit
              </button>
            </label>
          </div>
        )}
      </div>

      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Date</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Status</th>
              <th>Location</th>
              <th>Report</th>
              <th>Validated</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.user}</td>
                <td>{entry.fullname}</td>
                <td>{entry.date}</td>
                <td>{formatTime(entry.checkin)}</td>
                <td>{formatTime(entry.checkout)}</td>
                <td>{entry.status}</td>
                <td style={{ width: "15%" }}>{entry.location}</td>
                <td style={{ width: "35%" }}>
                  {(() => {
                    let reports;
                    try {
                      reports = JSON.parse(entry.work_report);
                    } catch (e) {
                      reports = null;
                    }

                    if (Array.isArray(reports)) {
                      return (
                        <div className="work-report-display">
                          {reports.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: "8px" }}>
                              <strong>{item.category}</strong>
                              <br />
                              <span>{item.description}</span>
                              <hr style={{ margin: "6px 0" }} />
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <span>{entry.work_report || "Not submitted..."}</span>
                    );
                  })()}
                </td>

                <td className="validation-cell">
                  {isAdmin ? (
                    <button
                      className={entry.validation ? "active" : ""}
                      onClick={() => handleValidationChange(entry.id, true)}
                    >
                      Yes
                    </button>
                  ) : entry.validation ? (
                    "Yes"
                  ) : (
                    "No"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: 7 }, (_, i) => {
          const page = i + 1;
          const date = new Date();
          date.setDate(date.getDate() - i);
          const label = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }); // e.g., 21 Jun

          return (
            <button
              key={page}
              className={currentPage === page ? "active" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceTable;
