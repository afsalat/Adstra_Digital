import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminLogin.css";
import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState("");
  const [gpsAvailable, setGpsAvailable] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGpsAvailable(true);
        },
        () => {
          setGpsAvailable(false);
          setError("⚠️ Please allow GPS access to continue.");
        }
      );
    } else {
      setError("❌ Geolocation is not supported by this browser.");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!gpsAvailable || !location.latitude || !location.longitude) {
      setError("GPS location is required to login.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/attendance/login/`, {
        ...formData,
        location,
      });

      if (response.data && response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("authToken", response.data.token);
        login();
        navigate("/admindashboard");
      } else {
        setError("Login failed: Invalid response");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during login");
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

        <button type="submit" disabled={!gpsAvailable}>
          {gpsAvailable ? "Login" : "Enable GPS to Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
