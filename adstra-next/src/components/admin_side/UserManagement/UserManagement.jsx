'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserManagement.css";
import { Edit, Eye, ShieldOff, Plus, ArrowLeft, X, KeyRound, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/utils/apiBase";
import { useModal } from "@/Context/ModalContext";

const BASE_URL = API_BASE_URL;
const FULL_ACCESS_ROLES = new Set(["admin", "super_admin"]);

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [roles, setRoles] = useState({});
  const [permissions, setPermissions] = useState({});

  const { showAlert, showConfirm } = useModal();
  const router = useRouter();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/user-list/`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data.users || []);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/role-permissions/`, {
        headers: getAuthHeaders(),
      });
      setRoles(response.data.roles || {});
      setPermissions(response.data.permissions || {});
    } catch {
      setRoles({});
      setPermissions({});
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRolePermissions();
  }, []);

  const handleAddUser = () => {
    setEditUser(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setShowForm(true);
  };

  const handleView = (user) => {
    showAlert(
      "User Details",
      <div className="details-content">
        <p><strong>Full Name:</strong> {user.fullname}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone || "—"}</p>
        <p><strong>Address:</strong> {user.address || "—"}</p>
        <p><strong>Designation:</strong> {user.designation || "—"}</p>
        <p><strong>Department:</strong> {user.department || "—"}</p>
        <p><strong>Role:</strong> {user.role?.replaceAll("_", " ") || "employee"}</p>
        <p><strong>Permissions:</strong> {(user.effective_permissions || []).join(", ") || "—"}</p>
        <p><strong>Joining Date:</strong> {formatDate(user.joining_date)}</p>
        <p>
          <strong>Status:</strong>
          <span className={`status-badge ${user.is_active ? "active" : "inactive"}`} style={{ marginLeft: "8px" }}>
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </p>
      </div>,
      "info"
    );
  };

  const handleDelete = (user) => {
    showConfirm(
      "Confirm Deletion",
      `Are you sure you want to permanently DELETE ${user.fullname}? This action cannot be undone.`,
      async () => {
        try {
          await axios.delete(`${BASE_URL}/user/delete-user/${user.id}/`, {
            headers: getAuthHeaders(),
          });
          await fetchUsers();
          showAlert("Deleted", "User has been successfully deleted.", "success");
        } catch (error) {
          showAlert("Delete Failed", "Failed to delete user.", "error");
        }
      },
      "error"
    );
  };

  const handleResetPassword = (user) => {
    showConfirm(
      "Reset Password",
      `Are you sure you want to reset the password for ${user.fullname}? A new password will be generated and displayed.`,
      async () => {
        try {
          const res = await axios.post(`${BASE_URL}/user/reset-password/${user.id}/?show_password=1`, {}, {
            headers: getAuthHeaders(),
          });
          const newPass = res.data?.generated_password;
          showAlert(
            "Password Reset Success",
            <div>
              <p>The password for <strong>{user.fullname}</strong> has been reset.</p>
              <span className="modal-credential-label">New Password:</span>
              <div className="modal-password-box">{newPass || "Check email"}</div>
              <p style={{ fontSize: '13px', color: '#64748b' }}>This credential has also been sent to {user.email}</p>
            </div>,
            "success"
          );
        } catch (err) {
          showAlert("Reset Failed", "Failed to reset password.", "error");
        }
      }
    );
  };

  const handleToggleActive = (user) => {
    const action = user.is_active ? "Deactivate" : "Activate";
    showConfirm(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user.fullname}?`,
      async () => {
        setDeactivating(true);
        try {
          await axios.put(`${BASE_URL}/user/active-inactive/${user.id}`, {
            is_active: !user.is_active,
          }, {
            headers: getAuthHeaders(),
          });
          await fetchUsers();
          showAlert("Status Updated", `${user.fullname} has been ${action.toLowerCase()}d.`, "success");
        } catch (err) {
          showAlert("Update Failed", "Error updating status.", "error");
        } finally {
          setDeactivating(false);
        }
      }
    );
  };

  const formatDate = (datetime) => {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleBack = () => router.push("/admindashboard/");

  if (loading) return <p className="loader">Loading users...</p>;
  if (error) return <p className="error">{error}</p>;

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.username || "").toLowerCase().includes(query) ||
      (user.fullname || "").toLowerCase().includes(query) ||
      (user.email || "").toLowerCase().includes(query) ||
      (user.phone || "").toLowerCase().includes(query) ||
      (user.address || "").toLowerCase().includes(query) ||
      (user.role || "").toLowerCase().includes(query) ||
      (user.designation || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="user-list-container">
      <div className="header-actions">
        <h2>👥 User Management</h2>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="button-group">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="add-btn" onClick={handleAddUser}>
            <Plus size={16} /> Add New User
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Joining Date</th>
              <th>Role</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.fullname}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td>{user.phone || "—"}</td>
                  <td>{formatDate(user.joining_date)}</td>
                  <td>{user.role?.replaceAll("_", " ") || "employee"}</td>
                  <td>{user.designation || "—"}</td>
                  <td>
                    <span
                      className={`status-badge ${user.is_active ? "active" : "inactive"}`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="actions">
                    <button onClick={() => handleView(user)} title="View">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleEdit(user)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      title="Deactivate"
                      disabled={deactivating}
                    >
                      <ShieldOff size={16} color="red" />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user)}
                      title="Reset Password"
                    >
                      <KeyRound size={16} color="#2563eb" />
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      title="Delete"
                      disabled={deactivating}
                    >
                      <X size={16} color="crimson" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="popup-overlay" onClick={() => setShowForm(false)}>
          <div className="popup user-form-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
            <h3>{editUser ? "Edit User" : "Add New User"}</h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const formData = {
                  fullname: form.fullname.value,
                  email: form.email.value,
                  phone: form.phone.value,
                  address: form.address.value,
                  designation: form.designation.value,
                  department: form.department.value,
                  role: form.role.value,
                  custom_permissions: Array.from(form.querySelectorAll("input[name='custom_permissions']:checked")).map((input) => input.value),
                  username: form.username.value,
                };

                try {
                  if (editUser) {
                    await axios.put(`${BASE_URL}/user/update-user/${editUser.id}`, formData, {
                      headers: getAuthHeaders(),
                    });
                    showAlert("Success", "User details updated successfully.", "success");
                  } else {
                    const res = await axios.post(`${BASE_URL}/user/add-user/?show_password=1`, formData, {
                      headers: getAuthHeaders(),
                    });
                    const pass = res.data?.generated_password;
                    showAlert(
                      "🆕 User Created",
                      <div>
                        <p>Credentials have been emailed to <strong>{formData.email}</strong>.</p>
                        {pass && (
                          <>
                            <span className="modal-credential-label">Generated Password:</span>
                            <div className="modal-password-box">{pass}</div>
                          </>
                        )}
                      </div>,
                      "success"
                    );
                  }
                  await fetchUsers();
                  setShowForm(false);
                } catch (err) {
                  const errorMsg = err.response?.data?.errors
                    ? Object.entries(err.response.data.errors).map(([key, val]) => `${key}: ${val}`).join("\n")
                    : "Failed to save user.";
                  showAlert("Save Failed", errorMsg, "error");
                }
              }}
            >
              <div className="user-form-main">
                <div className="user-details-panel">
                  <input name="fullname" placeholder="Full Name" defaultValue={editUser?.fullname || ""} required />
                  <input name="email" type="email" placeholder="Email" defaultValue={editUser?.email || ""} required />
                  <input name="phone" placeholder="Phone" defaultValue={editUser?.phone || ""} required />
                  <input name="username" placeholder="Username" defaultValue={editUser?.username || ""} required />
                  <input name="address" placeholder="Address" defaultValue={editUser?.address || ""} />
                  <input name="designation" placeholder="Designation" defaultValue={editUser?.designation || ""} />
                  <input name="department" placeholder="Department" defaultValue={editUser?.department || ""} />
                  <label className="field-label">Role</label>
                  <select
                    name="role"
                    defaultValue={editUser?.role || "employee"}
                    onChange={(e) => {
                      const shouldCheckAll = FULL_ACCESS_ROLES.has(e.target.value);
                      const permissionInputs = e.currentTarget
                        .closest("form")
                        ?.querySelectorAll("input[name='custom_permissions']");
                      permissionInputs?.forEach((input) => {
                        input.checked = shouldCheckAll;
                      });
                    }}
                  >
                    {Object.keys(roles).length > 0 ? (
                      Object.keys(roles).map((role) => (
                        <option key={role} value={role}>{role.replaceAll("_", " ")}</option>
                      ))
                    ) : (
                      <option value="employee">employee</option>
                    )}
                  </select>
                </div>

                <div className="permissions-panel">
                  <label className="field-label">Custom Permissions</label>
                  {Object.keys(permissions).length > 0 && (() => {
                    const categories = {};
                    Object.entries(permissions).forEach(([code, label]) => {
                      const prefix = code.split(".")[0] || "other";
                      const catName = {
                        lead: "Lead Management",
                        users: "User Management",
                        attendance: "Attendance",
                        clients: "Clients",
                        proposals: "Proposals",
                        invoices: "Invoices",
                        transactions: "Transactions",
                        settings: "Settings",
                        blogs: "Blog Posts",
                        backup: "Backup",
                      }[prefix] || "General";

                      if (!categories[catName]) categories[catName] = [];
                      categories[catName].push({ code, label });
                    });

                    return (
                      <div className="permissions-categories">
                        {Object.entries(categories).map(([catName, permList]) => (
                          <div key={catName} className="permission-category-group" style={{ marginBottom: "16px" }}>
                            <strong className="category-title" style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
                              {catName}
                            </strong>
                            <div className="permissions-grid">
                              {permList.map(({ code, label }) => (
                                <label key={code} className="permission-option">
                                  <input
                                    type="checkbox"
                                    name="custom_permissions"
                                    value={code}
                                    defaultChecked={
                                      FULL_ACCESS_ROLES.has(editUser?.role) ||
                                      (editUser?.effective_permissions || []).includes("*") ||
                                      (editUser?.custom_permissions || []).includes(code)
                                    }
                                  />
                                  <span>{label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <button type="submit" className="submit-btn">
                {editUser ? "Update User" : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
