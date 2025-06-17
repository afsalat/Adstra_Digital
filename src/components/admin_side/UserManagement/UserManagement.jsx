import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserManagement.css";
import { Edit, Eye, ShieldOff, Plus, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BACKEND_API_URL_DEV;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  const navigate = useNavigate();

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

  const handleDelete = async (user) => {
    const confirm = window.confirm(
      `Are you sure you want to DELETE ${user.fullname}? This action cannot be undone.`
    );
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
        is_active: !user.is_active, // <-- boolean value
      });
      await fetchUsers();
    } catch (err) {
      alert(`Error updating status.`);
      console.error(err);
    } finally {
      setDeactivating(false);
    }
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

  const handleBack = () => navigate("/admindashboard");

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
              <td colSpan="7">No users found.</td>
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
                <td>{formatTime(user.joining_date)}</td>
                <td>{user.designation || "—"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      user.is_active ? "active" : "inactive"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="actions">
                  <button title="View">
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
          <div
            className="popup user-form-popup"
            onClick={(e) => e.stopPropagation()}
          >
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
                    await axios.put(
                      `${BASE_URL}/user/update-user/${editUser.id}`,
                      formData
                    );
                  } else {
                    await axios.post(`${BASE_URL}/user/add-user/`, formData);
                  }
                  await fetchUsers();
                  setShowForm(false);
                } catch (err) {
                  alert("Failed to save user.");
                  console.error(err);
                }
              }}
            >
              <input
                name="fullname"
                placeholder="Full Name"
                defaultValue={editUser?.fullname || ""}
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={editUser?.email || ""}
                required
              />
              <input
                name="phone"
                placeholder="Phone"
                defaultValue={editUser?.phone || ""}
                required
              />
              <input
                name="username"
                placeholder="Username"
                defaultValue={editUser?.username || ""}
                required
              />
              <input
                name="address"
                placeholder="Address"
                defaultValue={editUser?.address || ""}
              />
              <input
                name="designation"
                placeholder="Designation"
                defaultValue={editUser?.designation || ""}
              />
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
