"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("auth_login");
    setIsAuthenticated(!!isLoggedIn);
  }, []);

  const login = () => {
    localStorage.setItem("auth_login", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("auth_login");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
