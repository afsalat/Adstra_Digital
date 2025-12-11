"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/Context/AuthContext";
import "./AdminLogin.css";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState("");
  const [gpsAvailable, setGpsAvailable] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsRetryCount, setGpsRetryCount] = useState(0);

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
      },
      (err) => {
        setGpsAvailable(false);
        setGpsLoading(false);
        
        let errorMsg = "";
        switch(err.code) {
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
        router.push("/admindashboard/"); // redirect to dashboard
      } else {
        setError("Login failed: Invalid response.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during login");
      console.error(err);
    }
  };

  return (
    <div className="admin-login-container">
      <h2>User Login</h2>
      
      {/* GPS Status Indicator */}
      <div style={{
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '5px',
        backgroundColor: gpsAvailable ? '#d4edda' : gpsLoading ? '#fff3cd' : '#f8d7da',
        border: `1px solid ${gpsAvailable ? '#c3e6cb' : gpsLoading ? '#ffeaa7' : '#f5c6cb'}`,
        textAlign: 'center'
      }}>
        {gpsLoading ? (
          <span>🔄 Fetching GPS location...</span>
        ) : gpsAvailable ? (
          <span>✅ GPS Location: {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}</span>
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

        <button type="submit" disabled={!gpsAvailable || gpsLoading}>
          {gpsLoading ? "Waiting for GPS..." : gpsAvailable ? "Login" : "GPS Required"}
        </button>
        
        {!gpsAvailable && !gpsLoading && (
          <button 
            type="button" 
            onClick={handleRetryGPS}
            style={{
              marginTop: '10px',
              backgroundColor: '#007bff',
              width: '100%'
            }}
          >
            🔄 Retry GPS
          </button>
        )}
      </form>
    </div>
  );
};

export default AdminLogin;
