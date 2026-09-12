'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserManagement.css";
import { Edit, Eye, ShieldOff, Plus, ArrowLeft, X, KeyRound, Search, MessageCircle, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/utils/apiBase";
import { useModal } from "@/Context/ModalContext";

const BASE_URL = API_BASE_URL;
const FULL_ACCESS_ROLES = new Set(["admin", "super_admin"]);
const SALES_MARKETING_ROLE = "sales_and_marketing";
const SALES_MY_PROFILE_PERMISSIONS = new Set([
  "lead.view_my_profile",
  "lead.edit",
  "lead.call",
  "lead.follow_up",
  "lead.schedule_meeting",
  "lead.create_proposal",
]);
const SALES_PROPOSAL_PERMISSIONS = [
  "clients.view",
  "clients.create",
  "proposals.view",
  "proposals.create",
  "proposals.update",
];

const applyLeadPermissionPreset = (form, permissions, preset) => {
  if (!form) return;
  const leadCodes = Object.keys(permissions).filter((code) => code.startsWith("lead."));
  const selectedCodes = preset === "team_lead"
    ? new Set([...leadCodes, ...SALES_PROPOSAL_PERMISSIONS])
    : SALES_MY_PROFILE_PERMISSIONS;

  form.querySelectorAll("input[name='custom_permissions']").forEach((input) => {
    if (!input.value.startsWith("lead.") && !input.value.startsWith("proposals.") && !input.value.startsWith("clients.")) return;
    input.checked = selectedCodes.has(input.value);
  });
};

const getWhatsAppNumber = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `91${digits.slice(1)}`;
  return digits;
};

const getWhatsAppUrl = (phone) => {
  const number = getWhatsAppNumber(phone);
  return number ? `https://wa.me/${number}` : "";
};

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
  const [selectedRole, setSelectedRole] = useState("employee");
  const [salesLeadPreset, setSalesLeadPreset] = useState("my_profile");
  const [whatsappUser, setWhatsappUser] = useState(null);

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
    setSelectedRole("employee");
    setSalesLeadPreset("my_profile");
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setSelectedRole(user?.role || "employee");
    setSalesLeadPreset((user?.custom_permissions || []).includes("lead.view_all") ? "team_lead" : "my_profile");
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

  const handleWhatsApp = (user) => {
    if (!getWhatsAppUrl(user.phone)) {
      showAlert("WhatsApp", "This user does not have a valid phone number.", "warning");
      return;
    }
    setWhatsappUser(user);
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
                    <button className="whatsapp-action-btn" onClick={() => handleWhatsApp(user)} title="WhatsApp">
                      <MessageCircle size={16} />
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

      {whatsappUser && (() => {
        const whatsappUrl = getWhatsAppUrl(whatsappUser.phone);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(whatsappUrl)}`;
        return (
          <div className="popup-overlay" onClick={() => setWhatsappUser(null)}>
            <div className="popup whatsapp-qr-popup" onClick={(e) => e.stopPropagation()}>
              <div className="whatsapp-qr-header">
                <div>
                  <span>WhatsApp Chat</span>
                  <h3>{whatsappUser.fullname || whatsappUser.username}</h3>
                </div>
                <button className="close-popup" onClick={() => setWhatsappUser(null)} aria-label="Close WhatsApp QR">
                  <X size={18} />
                </button>
              </div>
              <div className="whatsapp-qr-body">
                <div className="whatsapp-qr-icon">
                  <QrCode size={22} />
                </div>
                <img src={qrUrl} alt={`WhatsApp QR for ${whatsappUser.fullname || whatsappUser.username}`} />
                <p>Scan this QR code to open the WhatsApp chat.</p>
                <strong>+{getWhatsAppNumber(whatsappUser.phone)}</strong>
              </div>
              <div className="whatsapp-qr-actions">
                <button type="button" className="cancel-btn" onClick={() => setWhatsappUser(null)}>Close</button>
                <a className="submit-btn whatsapp-open-link" href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle size={16} /> Open Chat
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {showForm && (
        <div className="popup-overlay" onClick={() => setShowForm(false)}>
          <div className="popup user-form-popup" onClick={(e) => e.stopPropagation()}>
            <div className="user-form-header">
              <div>
                <span className="user-form-kicker">User Administration</span>
                <h3>{editUser ? "Edit User" : "Add New User"}</h3>
              </div>
              <button className="close-popup" onClick={() => setShowForm(false)} aria-label="Close form">
                <X size={18} />
              </button>
            </div>

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
                    value={selectedRole}
                    onChange={(e) => {
                      const nextRole = e.target.value;
                      setSelectedRole(nextRole);
                      const form = e.currentTarget.closest("form");
                      const permissionInputs = form?.querySelectorAll("input[name='custom_permissions']");
                      const shouldCheckAll = FULL_ACCESS_ROLES.has(nextRole);
                      permissionInputs?.forEach((input) => {
                        input.checked = shouldCheckAll;
                      });
                      if (nextRole === SALES_MARKETING_ROLE) {
                        setSalesLeadPreset("my_profile");
                        window.setTimeout(() => applyLeadPermissionPreset(form, permissions, "my_profile"), 0);
                      }
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
                  {selectedRole === SALES_MARKETING_ROLE && (
                    <div className="sales-permission-preset" role="radiogroup" aria-label="Sales and marketing lead access">
                      <span className="sales-permission-preset__title">Lead access</span>
                      <label>
                        <input
                          type="radio"
                          name="sales_lead_preset"
                          value="my_profile"
                          checked={salesLeadPreset === "my_profile"}
                          onChange={(event) => {
                            setSalesLeadPreset(event.target.value);
                            applyLeadPermissionPreset(event.currentTarget.closest("form"), permissions, "my_profile");
                          }}
                        />
                        <span>My Profile</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="sales_lead_preset"
                          value="team_lead"
                          checked={salesLeadPreset === "team_lead"}
                          onChange={(event) => {
                            setSalesLeadPreset(event.target.value);
                            applyLeadPermissionPreset(event.currentTarget.closest("form"), permissions, "team_lead");
                          }}
                        />
                        <span>Team Lead</span>
                      </label>
                    </div>
                  )}
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
              <div className="user-form-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="submit-btn">
                  {editUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
