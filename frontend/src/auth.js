import React, { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // "cuidador" | "paciente" | null

  useEffect(() => {
    const saved = localStorage.getItem("cuido.role");
    if (saved) setRole(saved.toLowerCase());
  }, []);

  const login = (r) => {
    // Normalize role to lowercase for consistent checks
    const normalizedRole = r?.toLowerCase();
    setRole(normalizedRole);
    localStorage.setItem("cuido.role", normalizedRole);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("cuido.role");
    localStorage.removeItem("cuido.token");
    localStorage.removeItem("cuido.pacienteId");
    // Redirect to login page
    window.location.href = "/login";
  };

  const value = {
    role,
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
