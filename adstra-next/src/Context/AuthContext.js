"use client";

import { createContext, useContext, useState, useEffect } from "react";

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

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const valid = isTokenValid(token);

    if (!valid) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }

    setIsAuthenticated(valid);
  }, []);

  const login = (token) => {
    const authToken = token || localStorage.getItem("authToken");
    setIsAuthenticated(isTokenValid(authToken));
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
