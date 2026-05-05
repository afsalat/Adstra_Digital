import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, UserPlus, Search, Edit2, Trash2, Shield, 
  Mail, Phone, Calendar, CheckCircle, XCircle, 
  MoreVertical, Filter, Download, Briefcase, Star, LayoutGrid, List
} from "lucide-react";
import "./TeamPanel.css";
import API_BASE_URL from "@/utils/apiBase";

const TeamPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'department'
  const [selectedDept, setSelectedDept] = useState("All");
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    phone: "",
    designation: "",
    department: "",
    is_team_lead: false,
    password: ""
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/user/user-list/`, {
        headers: getAuthHeaders()
      });
      const data = res.data.users || res.data.results || (Array.isArray(res.data) ? res.data : []);
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`${API_BASE_URL}/user/update-user/${editingUser.id}`, formData, {
          headers: getAuthHeaders()
        });
      } else {
        await axios.post(`${API_BASE_URL}/user/add-user/`, formData, {
          headers: getAuthHeaders()
        });
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: "", email: "", fullname: "", phone: "", designation: "", department: "", is_team_lead: false, password: "" });
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      alert(err.response?.data?.message || "Failed to save user details.");
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await axios.put(`${API_BASE_URL}/user/active-inactive/${user.id}`, { is_active: !user.is_active }, {
        headers: getAuthHeaders()
      });
      fetchUsers();
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/user/delete-user/${id}/`, {
        headers: getAuthHeaders()
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "All" || user.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = ["All", ...new Set(users.map(u => u.department).filter(Boolean))];

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    leads: users.filter(u => u.is_team_lead).length
  };

  return (
    <div className="team-panel fade-in">
      <div className="team-header">
        <div className="header-left">
          <h1>Team Management</h1>
          <p>Organize your departments, leads, and professional teams.</p>
        </div>
        <button className="add-btn" onClick={() => { setEditingUser(null); setShowModal(true); }}>
          <UserPlus size={18} /> Add New Member
        </button>
      </div>

      <div className="team-stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><Users size={24} /></div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <h3>{stats.active}</h3>
            <p>Active Staff</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon staff"><Star size={24} /></div>
          <div className="stat-info">
            <h3>{stats.leads}</h3>
            <p>Team Leads</p>
          </div>
        </div>
      </div>

      <div className="team-controls">
        <div className="controls-left">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, role or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="dept-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <List size={18} /> Table
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'department' ? 'active' : ''}`}
            onClick={() => setViewMode('department')}
          >
            <LayoutGrid size={18} /> Departments
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="team-table-container">
          {loading ? (
            <div className="loader">Loading team data...</div>
          ) : (
            <table className="team-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role & Dept</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={user.is_team_lead ? "lead-row" : ""}>
                    <td>
                      <div className="member-cell">
                        <div className={`member-avatar ${user.is_team_lead ? 'lead-avatar' : ''}`}>
                          {user.fullname ? user.fullname[0].toUpperCase() : user.username[0].toUpperCase()}
                          {user.is_team_lead && <Star size={12} className="lead-star" />}
                        </div>
                        <div className="member-meta">
                          <span className="member-name">
                            {user.fullname || user.username}
                            {user.is_team_lead && <span className="lead-label">Lead</span>}
                          </span>
                          <span className="member-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="role-cell">
                        <span className="designation-badge">{user.designation || "Member"}</span>
                        <span className="dept-badge">{user.department || "No Dept"}</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className={`status-toggle ${user.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td><div className="phone-cell"><Phone size={14} /> {user.phone || "N/A"}</div></td>
                    <td><div className="date-cell"><Calendar size={14} /> {user.joining_date ? new Date(user.joining_date).toLocaleDateString() : "N/A"}</div></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            username: user.username,
                            email: user.email,
                            fullname: user.fullname,
                            phone: user.phone || "",
                            designation: user.designation || "",
                            department: user.department || "",
                            is_team_lead: user.is_team_lead || false,
                            password: ""
                          });
                          setShowModal(true);
                        }}>
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(user.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="dept-view-grid">
          {departments.filter(d => d !== "All").map(dept => (
            <div key={dept} className="dept-card">
              <div className="dept-header">
                <h3>{dept}</h3>
                <span className="count-pill">{users.filter(u => u.department === dept).length} Members</span>
              </div>
              <div className="dept-members">
                {users.filter(u => u.department === dept).map(u => (
                  <div key={u.id} className={`dept-member-item ${u.is_team_lead ? 'lead' : ''}`}>
                    <div className="mini-avatar">{u.fullname?.[0] || u.username[0]}</div>
                    <div className="mini-info">
                      <span className="mini-name">{u.fullname || u.username} {u.is_team_lead && "⭐"}</span>
                      <span className="mini-role">{u.designation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingUser ? "Edit Team Member" : "Add New Member"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><XCircle /></button>
            </div>
            <form onSubmit={handleSubmit} className="team-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="SEO, Design, Dev..." />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="is_team_lead" checked={formData.is_team_lead} onChange={handleInputChange} />
                    <span>Assign as Team Lead</span>
                  </label>
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{editingUser ? "Update Member" : "Create Member"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPanel;
