'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserManagement.css";
import { Edit, Eye, ShieldOff, Plus, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/user-list/`);
      setUsers(response.data.users);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleDelete = async (user) => {
    const confirm = window.confirm(`Are you sure you want to DELETE ${user.fullname}?`);
    if (!confirm) return;

    try {
      await axios.delete(`${BASE_URL}/user/delete-user/${user.id}/`);
      await fetchUsers();
    } catch (error) {
      alert("Failed to delete user.");
      console.error(error);
    }
  };

  const handleToggleActive = async (user) => {
    const action = user.is_active ? "Deactivate" : "Activate";
    const confirm = window.confirm(`${action} ${user.fullname}?`);
    if (!confirm) return;

    setDeactivating(true);
    try {
      await axios.put(`${BASE_URL}/user/active-inactive/${user.id}`, {
        is_active: !user.is_active,
      });
      await fetchUsers();
    } catch (err) {
      alert(`Error updating status.`);
      console.error(err);
    } finally {
      setDeactivating(false);
    }
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

  return (
    <div className="user-list-container">
      <div className="header-actions">
        <h2>👥 User Management</h2>
        <div className="button-group">
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <button className="add-btn" onClick={handleAddUser}>
            <Plus size={16} /> Add New User
          </button>
        </div>
      </div>

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
            <th>Designation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="10">No users found.</td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.fullname}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td>{user.phone || "—"}</td>
                <td>{formatDate(user.joining_date)}</td>
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
                  username: form.username.value,
                };

                try {
                  if (editUser) {
                    await axios.put(`${BASE_URL}/user/update-user/${editUser.id}`, formData);
                  } else {
                    const res = await axios.post(`${BASE_URL}/user/add-user/`, formData);
                    if (res.data?.generated_password) {
                      setGeneratedPassword(res.data.generated_password);
                    }
                  }
                  await fetchUsers();
                  setShowForm(false);
                } catch (err) {
                  const errorMsg = err.response?.data?.errors
                    ? Object.entries(err.response.data.errors).map(([key, val]) => `${key}: ${val}`).join("\n")
                    : "Failed to save user.";
                  alert(errorMsg);
                  console.error(err);
                }
              }}
            >
              <input name="fullname" placeholder="Full Name" defaultValue={editUser?.fullname || ""} required />
              <input name="email" type="email" placeholder="Email" defaultValue={editUser?.email || ""} required />
              <input name="phone" placeholder="Phone" defaultValue={editUser?.phone || ""} required />
              <input name="username" placeholder="Username" defaultValue={editUser?.username || ""} required />
              <input name="address" placeholder="Address" defaultValue={editUser?.address || ""} />
              <input name="designation" placeholder="Designation" defaultValue={editUser?.designation || ""} />
              <button type="submit" className="submit-btn">
                {editUser ? "Update User" : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}

      {generatedPassword && (
        <div className="popup-overlay" onClick={() => setGeneratedPassword(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={() => setGeneratedPassword(null)}>
              <X size={18} />
            </button>
            <h3>🆕 User Created</h3>
            <p><strong>Generated Password:</strong></p>
            <div className="password-box">{generatedPassword}</div>
            <p>successfully sent password through email!</p>
          </div>
        </div>
      )}

      {showDetails && selectedUser && (
        <div className="popup-overlay" onClick={() => setShowDetails(false)}>
          <div className="popup user-details-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={() => setShowDetails(false)}>
              <X size={18} />
            </button>
            <h3>👤 User Details</h3>
            <div className="details-content">
              <p><strong>Full Name:</strong> {selectedUser.fullname}</p>
              <p><strong>Username:</strong> {selectedUser.username}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || "—"}</p>
              <p><strong>Address:</strong> {selectedUser.address || "—"}</p>
              <p><strong>Designation:</strong> {selectedUser.designation || "—"}</p>
              <p><strong>Joining Date:</strong> {formatDate(selectedUser.joining_date)}</p>
              <p>
                <strong>Status:</strong>
                <span className={`status-badge ${selectedUser.is_active ? "active" : "inactive"}`} style={{ marginLeft: "8px" }}>
                  {selectedUser.is_active ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
