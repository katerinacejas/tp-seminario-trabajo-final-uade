// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { PacienteProvider } from "./context/PacienteContext";
import * as NotificationService from "./services/notificationService";

// Páginas
import Login from "./pages/autenticacion/Login";
import Register from "./pages/autenticacion/Register";
import ForgotPassword from "./pages/autenticacion/ForgotPassword";
import ResetPassword from "./pages/autenticacion/ResetPassword";
import HomeCuidador from "./pages/cuidador/HomeCaregiver";
import HomePaciente from "./pages/paciente/HomePatient";
import Bitacora from "./pages/cuidador/Bitacora";
import Documentos from "./pages/cuidador/Documentos";
import Recordatorios from "./pages/cuidador/Recordatorios";
import Tareas from "./pages/cuidador/Tareas";
import PerfilCuidador from "./pages/cuidador/PerfilCuidador";
import PreguntasFrecuentes from "./pages/cuidador/PreguntasFrecuentes";
import Chatbot from "./pages/cuidador/Chatbot";
import Pacientes from "./pages/cuidador/Pacientes";
import MisCuidadores from "./pages/paciente/MisCuidadores";
import TopBar from "./components/TopBar";
import FooterNav from "./components/FooterNav";

function RequireRole({ allow, children }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (!allow.includes(role)) {
	return <Navigate to={role === "cuidador" ? "/" : "/paciente"} replace />;
  }
  return children;
}

function AppShell({ children }) {
  return (
	<div className="app-shell">
	  <TopBar />
	  <main className="container">{children}</main>
	  <FooterNav />
	</div>
  );
}

function AppRoutes() {
  const { role } = useAuth();

  // Solicitar permisos de notificaciones cuando el usuario inicia sesión
  useEffect(() => {
	if (role) {
	  const solicitarPermisos = async () => {
		try {
		  const permisoConcedido = await NotificationService.solicitarPermisosNotificaciones();
		  if (permisoConcedido) {
			console.log('✅ Permisos de notificaciones concedidos');
		  } else {
			console.warn('⚠️ Permisos de notificaciones denegados');
		  }
		} catch (error) {
		  console.error('Error al solicitar permisos de notificaciones:', error);
		}
	  };
	  solicitarPermisos();
	}
  }, [role]);

  return (
	<Routes>
	  {/* Auth */}
	  <Route path="/login" element={<Login />} />
	  <Route path="/register" element={<Register />} />
	  <Route path="/forgot-password" element={<ForgotPassword />} />
	  <Route path="/reset-password" element={<ResetPassword />} />

	  {/* Home por rol */}
	  <Route
		path="/"
		element={
		  <RequireRole allow={["cuidador"]}>
			<AppShell><HomeCuidador /></AppShell>
		  </RequireRole>
		}
	  />
	  <Route
		path="/paciente"
		element={
		  <RequireRole allow={["paciente"]}>
			<AppShell><HomePaciente /></AppShell>
		  </RequireRole>
		}
	  />

	  {/* SOLO cuidador */}
	  <Route path="/bitacora" element={<RequireRole allow={["cuidador"]}><AppShell><Bitacora/></AppShell></RequireRole>} />
	  <Route path="/docs" element={<RequireRole allow={["cuidador"]}><AppShell><Documentos/></AppShell></RequireRole>} />
	  <Route path="/recordatorios" element={<RequireRole allow={["cuidador"]}><AppShell><Recordatorios/></AppShell></RequireRole>} />
	  <Route path="/tareas" element={<RequireRole allow={["cuidador"]}><AppShell><Tareas/></AppShell></RequireRole>} />
	  <Route path="/perfil" element={<RequireRole allow={["cuidador"]}><AppShell><PerfilCuidador/></AppShell></RequireRole>} />
	  <Route path="/preguntas-frecuentes" element={<RequireRole allow={["cuidador"]}><AppShell><PreguntasFrecuentes/></AppShell></RequireRole>} />
	  <Route path="/chatbot" element={<RequireRole allow={["cuidador"]}><AppShell><Chatbot/></AppShell></RequireRole>} />
	  <Route path="/pacientes" element={<RequireRole allow={["cuidador"]}><AppShell><Pacientes/></AppShell></RequireRole>} />

	  {/* SOLO paciente (ejemplo) */}
	  <Route path="/mis-cuidadores" element={<RequireRole allow={["paciente"]}><AppShell><MisCuidadores/></AppShell></RequireRole>} />
	  <Route path="/invitar-cuidador" element={<RequireRole allow={["paciente"]}><AppShell><div className="card"><h2>Invitar cuidador</h2></div></AppShell></RequireRole>} />

	  {/* fallback */}
	  <Route
		path="*"
		element={
		  role
			? <Navigate to={role === "cuidador" ? "/" : "/paciente"} replace />
			: <Navigate to="/login" replace />
		}
	  />
	</Routes>
  );
}

export default function App() {
  return (
	<AuthProvider>
	  <PacienteProvider>
		<AppRoutes />
	  </PacienteProvider>
	</AuthProvider>
  );
}