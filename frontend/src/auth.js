import React, { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
	//Leer el rol desde localStorage EN EL ESTADO INICIAL
	const [role, setRole] = useState(() => {
		const saved = localStorage.getItem("cuido.role");
		return saved ? saved.toLowerCase() : null; // "cuidador" | "paciente" | null
	});

	// useEffect(() => {
	//   const saved = localStorage.getItem("cuido.role");
	//   if (saved) setRole(saved.toLowerCase());
	// }, []);

	const login = (r) => {
		// Normalizar rol a minúsculas
		const normalizedRole = r?.toLowerCase();
		setRole(normalizedRole);
		localStorage.setItem("cuido.role", normalizedRole);
	};

	const logout = () => {
		setRole(null);
		localStorage.removeItem("cuido.role");
		localStorage.removeItem("cuido.token");
		localStorage.removeItem("cuido.pacienteId");
		// Redirigir al login
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
