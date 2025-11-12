import React, { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // "cuidador" | "paciente" | null
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("cuido.role");
    const savedToken = localStorage.getItem("cuido.token");
    const savedUser = localStorage.getItem("cuido.user");

    if (savedRole) setRole(savedRole);
    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const login = (r, jwtToken, userData) => {
    setRole(r);
    setToken(jwtToken);
    setUser(userData);

    localStorage.setItem("cuido.role", r);
    localStorage.setItem("cuido.token", jwtToken);
    if (userData) {
      localStorage.setItem("cuido.user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setRole(null);
    setToken(null);
    setUser(null);

    localStorage.removeItem("cuido.role");
    localStorage.removeItem("cuido.token");
    localStorage.removeItem("cuido.user");
  };

  const value = {
    role,
    token,
    user,
    isCaregiver: role === "cuidador",
    isPatient: role === "paciente",
    login,
    logout,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
