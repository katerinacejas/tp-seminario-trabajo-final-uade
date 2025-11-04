// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";

// Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomeCuidador from "./pages/HomeCaregiver";
import HomePaciente from "./pages/HomePatient";
import Bitacora from "./pages/Bitacora";
import Calendario from "./pages/Calendario";
import Documentos from "./pages/Documentos";
import FichaMedica from "./pages/FichaMedica";
import Alertas from "./pages/Alertas";
import Tareas from "./pages/Tareas";
import PerfilCuidador from "./pages/PerfilCuidador";
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
      <main className="container">{children}</main>
      <FooterNav />
    </div>
  );
}

function AppRoutes() {
  const { role } = useAuth();
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
      <Route path="/calendario" element={<RequireRole allow={["cuidador"]}><AppShell><Calendario pacienteId="p1"/></AppShell></RequireRole>} />
      <Route path="/docs" element={<RequireRole allow={["cuidador"]}><AppShell><Documentos pacienteId="p1"/></AppShell></RequireRole>} />
      <Route path="/ficha" element={<RequireRole allow={["cuidador"]}><AppShell><FichaMedica pacienteId="p1"/></AppShell></RequireRole>} />
      <Route path="/alertas" element={<RequireRole allow={["cuidador"]}><AppShell><Alertas pacienteId="p1"/></AppShell></RequireRole>} />
      <Route path="/tareas" element={<RequireRole allow={["cuidador"]}><AppShell><Tareas pacienteId="p1"/></AppShell></RequireRole>} />
      <Route path="/perfil" element={<RequireRole allow={["cuidador"]}><AppShell><PerfilCuidador/></AppShell></RequireRole>} />

      {/* SOLO paciente (ejemplo) */}
      <Route path="/mis-cuidadores" element={<RequireRole allow={["paciente"]}><AppShell><HomePaciente/></AppShell></RequireRole>} />
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
      <AppRoutes />
    </AuthProvider>
  );
}
