import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Attendance.css";

const currentUser = "afsal";
const BASE_URL = "https://adstradigital.com/api";


const AttendanceTable = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userWorkReport, setUserWorkReport] = useState("");
  const [newEntry, setNewEntry] = useState({
    user: "",
    date: "",
    checkin: "",
    checkout: "",
    work_report: "",
    status: "",
    location: "",
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/attendance/list-attendance/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAttendanceData(res.data.users);
        const userEntry = res.data.users.find(
          (entry) => entry.user === currentUser
        );
        if (userEntry) {
          setUserWorkReport(userEntry.work_report);
        }
      })
      .catch((err) => console.error("Error fetching attendance:", err));
  }, []);

  const handleAddEntry = () => {
    axios
      .post(`${BASE_URL}/attendance/add-attendance/`, newEntry, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAttendanceData((prev) => [...prev, res.datax]);
        setNewEntry({
          user: "",
          date: "",
          checkin: "",
          checkout: "",
          work_report: "",
          status: "present",
          location: "",
        });
        setShowForm(false);
      })
      .catch((err) => console.error("Add entry error:", err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkReportSubmit = () => {
    // const user = attendanceData.find((entry) => entry.user === currentUser);
    // if (!user) return;
    const user = 1;

    axios
      .post(
        `${BASE_URL}/attendance/work_report/${user}/`,
        { work_report: userWorkReport },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        setAttendanceData((prev) =>
          prev.map((entry) =>
            entry.id === user.id
              ? { ...entry, work_report: userWorkReport }
              : entry
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  return (
    <div className="attendance-container">
      <button onClick={() => window.history.back()} className="btn back-btn">
        ← Back
      </button>

      <h2>Attendance List</h2>

      {/* Current User Work Report */}
      <div className="header-box">
      <div className="user-report-editor-inline">
        <textarea
          value={userWorkReport}
          onChange={(e) => setUserWorkReport(e.target.value)}
          placeholder="Update your work report"
          />
        <button className="create-btn" onClick={handleWorkReportSubmit}>
          Submit
        </button>
      </div>

      {/* Toggle Create Form */}
      <button onClick={() => setShowForm(!showForm)} className="create-btn">
        {showForm ? "Cancel" : "Create New Entry"}
      </button>

      {/* Create New Entry Form */}
      {showForm && (
        <div className="create-form">
          {[
            "user",
            "date",
            "checkin",
            "checkout",
            "location",
            "work_report",
          ].map((field) => (
            <label key={field}>
              {field.replace("_", " ").toUpperCase()}
              <br />
              <input
                type={
                  field === "date"
                  ? "date"
                    : field === "checkin" || field === "checkout"
                    ? "datetime-local"
                    : "text"
                  }
                  name={field}
                  value={newEntry[field]}
                  onChange={handleInputChange}
                  />
            </label>
          ))}

          <label>
            STATUS
            <br />
            <select
              name="status"
              value={newEntry.status}
              onChange={handleInputChange}
              >
              <option defaultValue="Present" value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="Half Day">Half Day</option>
            </select>
          </label>

          <button onClick={handleAddEntry}>Submit</button>
        </div>
      )}
      </div>

      {/* Attendance Table */}
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
            {attendanceData.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.user}</td>
                <td>{entry.date}</td>
                <td>{entry.checkin}</td>
                <td>{entry.checkout}</td>
                <td>{entry.status}</td>
                <td>{entry.location}</td>
                <td style={{ width: "15%" }}>{entry.work_report}</td>
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
    </div>
  );
};

export default AttendanceTable;
