import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jwtDecode } from "jwt-decode";
import "./Attendance.css";

const BASE_URL = "https://adstradigital.com/api";

const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userWorkReport, setUserWorkReport] = useState("");
  const [userId, setUserId] = useState(null);
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
  const recordsPerPage = 10;
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.user_id);
        setNewEntry((prev) => ({ ...prev, user: decoded.user_id }));
      } catch (e) {
        console.error("Invalid token:", e);
      }
    }
  }, [token]);

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
      console.error("Location conversion failed:", err);
      return locationStr;
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/attendance/list-attendance/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const updated = await Promise.all(
          res.data.users.map(async (entry) => ({
            ...entry,
            location: await getPlaceName(entry.location),
          }))
        );
        setAttendanceData(updated);

        const userEntry = updated.find((entry) => entry.user === userId);
        if (userEntry) setUserWorkReport(userEntry.work_report || "");
      })
      .catch((err) => console.error("Error fetching attendance:", err));
  }, [token, userId]);

  const handleAddEntry = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      try {
        const entry = { ...newEntry, location };
        const res = await axios.post(`${BASE_URL}/attendance/add-attendance/`, entry, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const readableLocation = await getPlaceName(location);
        setAttendanceData((prev) => [...prev, { ...res.datax, location: readableLocation }]);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkReportSubmit = () => {
    if (!userId) return;
    axios
      .post(
        `${BASE_URL}/attendance/work_report/${userId}/`,
        { work_report: userWorkReport },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setAttendanceData((prev) =>
          prev.map((entry) =>
            entry.user === userId ? { ...entry, work_report: userWorkReport } : entry
          )
        );
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
          prev.map((entry) => (entry.id === id ? { ...entry, validation } : entry))
        );
      })
      .catch((err) => console.error("Validation error:", err));
  };

  const formatTime = (datetime) => {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
  };

  const exportToExcel = () => {
    const data = attendanceData.map((row) => ({
      User: row.user,
      Date: row.date,
      "Check-In": formatTime(row.checkin),
      "Check-Out": formatTime(row.checkout),
      Status: row.status,
      Location: row.location,
      "Work Report": row.work_report,
      Validated: row.validation ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, "attendance.xlsx");
  };

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = attendanceData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(attendanceData.length / recordsPerPage);

  return (
    <div className="attendance-container">
      <button onClick={() => window.history.back()} className="btn back-btn">← Back</button>
      <h2>Attendance List</h2>

      <div className="header-box">
        <div className="user-report-editor-inline">
          <textarea
            value={userWorkReport}
            onChange={(e) => setUserWorkReport(e.target.value)}
            placeholder="Update your work report"
          />
          <button className="create-btn" onClick={handleWorkReportSubmit}>Submit</button>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="create-btn">
          {showForm ? "Cancel" : "Create New Entry"}
        </button>

        <button onClick={exportToExcel} className="export-btn">
          Export to Excel
        </button>

        {showForm && (
          <div className="create-form">
            {[{ name: "date", type: "date" }, { name: "checkin", type: "datetime-local" }, { name: "checkout", type: "datetime-local" }, { name: "work_report", type: "text" }].map((field) => (
              <label key={field.name}>
                {field.name.replace("_", " ").toUpperCase()}
                <br />
                <input
                  type={field.type}
                  name={field.name}
                  value={newEntry[field.name]}
                  onChange={handleInputChange}
                />
              </label>
            ))}
            <label>
              STATUS
              <br />
              <select name="status" value={newEntry.status} onChange={handleInputChange}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </label>
            <button onClick={handleAddEntry}>Submit</button>
          </div>
        )}
      </div>

      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Status</th>
              <th>Location</th>
              <th>Work Report</th>
              <th>Validated</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.user}</td>
                <td>{entry.date}</td>
                <td>{formatTime(entry.checkin)}</td>
                <td>{formatTime(entry.checkout)}</td>
                <td>{entry.status}</td>
                <td style={{ width: "15%" }}>{entry.location}</td>
                <td style={{ width: "35%" }}>{entry.work_report}</td>
                <td className="validation-cell">
                  <button
                    className={entry.validation ? "active" : ""}
                    onClick={() => handleValidationChange(entry.id, true)}
                  >
                    Yes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={i + 1 === currentPage ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AttendanceTable;
