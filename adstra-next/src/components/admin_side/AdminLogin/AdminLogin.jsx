"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoadingScreen from "@/components/common/LoadingScreen/LoadingScreen";
import API_BASE_URL from "@/utils/apiBase";
import "./AdminLogin.css";

const BASE_URL = API_BASE_URL;

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState("");
  const [gpsAvailable, setGpsAvailable] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(true);

  const [gpsRetryCount, setGpsRetryCount] = useState(0);
  const [address, setAddress] = useState("");
  const [fetchingAddress, setFetchingAddress] = useState(false);

  const [showLoader, setShowLoader] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("❌ Geolocation is not supported by this browser.");
      setGpsLoading(false);
      return;
    }

    setGpsLoading(true);
    setError("");

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0 // Don't use cached location
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGpsAvailable(true);
        setGpsLoading(false);
        setError("");

        // Fetch address
        setFetchingAddress(true);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`, {
          headers: { 'User-Agent': 'Adstra_Login/1.0' }
        })
          .then(res => res.json())
          .then(data => {
            setAddress(data.display_name || "Address not found");
            setFetchingAddress(false);
          })
          .catch(() => {
            setAddress("Address lookup failed");
            setFetchingAddress(false);
          });
      },
      (err) => {
        setGpsAvailable(false);
        setGpsLoading(false);

        let errorMsg = "";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = "⚠️ GPS access denied. Please allow location permissions in your browser settings.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = "⚠️ Location information is unavailable. Please check your device settings.";
            break;
          case err.TIMEOUT:
            errorMsg = "⚠️ Location request timed out. Please try again.";
            break;
          default:
            errorMsg = "⚠️ An error occurred while fetching location.";
        }
        setError(errorMsg);
      },
      options
    );
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleRetryGPS = () => {
    setGpsRetryCount(prev => prev + 1);
    getLocation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!gpsAvailable || !location.latitude || !location.longitude) {
      setError("❌ GPS location is required to login. Please enable GPS and try again.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/attendance/login/`, {
        ...formData,
        location,
      });

      if (response.data?.token) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("authToken", response.data.token);
        login(); // call login from context
        setShowLoader(true); // Show the loading animation
      } else {
        setError("Login failed: Invalid response.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during login");
      console.error(err);
    }
  };

  const handleLoadingComplete = () => {
    router.push("/admindashboard/"); // redirect to dashboard after animation completes
  };

  if (showLoader) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="login-page-wrapper">
      <div className="admin-login-container">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <img
            src="/assets/logo_new-01.png"
            alt="Adstra Digital"
            style={{ maxWidth: "200px", height: "auto" }}
          />
        </div>
        <h2>User Login</h2>

        {/* GPS Status Indicator */}
        <div className={`gps-indicator ${gpsLoading ? "loading" : gpsAvailable ? "success" : "error"}`}>
          {gpsLoading ? (
            <span>🔄 Fetching GPS location...</span>
          ) : gpsAvailable ? (
            <span>✅ Location: {fetchingAddress ? "Fetching address..." : address || `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}`}</span>
          ) : (
            <span>❌ GPS not available</span>
          )}
        </div>

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

          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={!gpsAvailable || gpsLoading}>
            {gpsLoading ? "Waiting for GPS..." : gpsAvailable ? "Login" : "GPS Required"}
          </button>

          {!gpsAvailable && !gpsLoading && (
            <button
              type="button"
              onClick={handleRetryGPS}
              className="retry-btn"
            >
              🔄 Retry GPS
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
