// src/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

// If using mock, import the mock auth function
const useMock = typeof window !== "undefined" && window.__USE_MOCK;
let mockAuth;
if (useMock) {
  // dynamic import to avoid errors when bundling production
  mockAuth = require("./mockApi").authToken;
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    } catch {}
  }, [token]);

  const login = async (username, password) => {
    if (useMock && mockAuth) {
      const data = await mockAuth(username, password);
      setToken(data.access_token);
      return data;
    }
    // Otherwise the app will perform real fetch in components
    return null;
  };

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, setToken, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
