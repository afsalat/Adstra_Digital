import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminLogin.css";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BACKEND_API_URL_DEV;

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setError("Location access denied or unavailable");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/attendance/login/`, {
        ...formData,
        location,
      });

      if (response.data && response.data.token) {
        console.log(response.data);

        // ✅ Save only the token
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log(response.data.user);
        localStorage.setItem("authToken", response.data.token);

        // Optional: store other useful info
        // localStorage.setItem("userName", response.data.username || "");
        // localStorage.setItem("loginMessage", response.data.message || "");

        login(); // From AuthContext
        navigate("/admindashboard");
      } else {
        setError("Login failed: Invalid response");
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("An error occurred during login");
      }
      console.error(err);
    }
  };

  return (
    <div className="admin-login-container">
      <h2>User Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
