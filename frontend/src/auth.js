import React, { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // "cuidador" | "paciente" | null

  useEffect(() => {
    const saved = localStorage.getItem("cuido.role");
    if (saved) setRole(saved);
  }, []);

  const login = (r) => {
    setRole(r);
    localStorage.setItem("cuido.role", r);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("cuido.role");
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
