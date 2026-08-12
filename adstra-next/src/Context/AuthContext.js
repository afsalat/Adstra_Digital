"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { hasPermission as checkPermissionUtil } from "@/utils/permissionUtils";

const AuthContext = createContext();

const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    const valid = isTokenValid(token);

    if (valid) {
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Failed to parse stored user", e);
          }
        }
      }
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);

    // Setup global axios interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("authToken");
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  const hardReset = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
      // Clear all cookies
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = (token, userData) => {
    // Clear any existing stale session first
    hardReset();
    
    if (token) {
      localStorage.setItem("authToken", token);
      setIsAuthenticated(true);
    }
    
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    hardReset();
    window.location.href = "/userlogin";
  };

  const hasPermission = useCallback(
    (permissionCode) => checkPermissionUtil(user, permissionCode),
    [user]
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setUser, login, logout, hardReset, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
