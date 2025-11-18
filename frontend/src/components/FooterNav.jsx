import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import {
  IoHomeOutline,
  IoChatbubbleEllipsesOutline,
  IoHandRightOutline,
  IoBookOutline,
  IoClipboardOutline,
  IoCheckboxOutline,
  IoFolderOutline,
  IoHelpCircleOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoPeopleOutline
} from "react-icons/io5";

export default function FooterNav() {
  const [open, setOpen] = useState(false);
  const { role, isCaregiver, isPatient, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    nav("/login", { replace: true });
  };

  // Items del menú "Más" según rol
  const caregiverMore = [
    { path: "/pacientes", label: "Pacientes", icon: <IoPeopleOutline /> },
    { path: "/docs", label: "Documentos", icon: <IoFolderOutline /> },
    { path: "/preguntas-frecuentes", label: "Preguntas Frecuentes", icon: <IoHelpCircleOutline /> },
    { path: "/perfil", label: "Perfil", icon: <IoPersonOutline /> },
  ];

  const patientMore = [
    { path: "/perfil", label: "Perfil", icon: <IoPersonOutline /> },
  ];

  return (
    <footer className="footer">
      <nav className="footer-nav container">
        {/* CUIDADOR - 5 opciones principales en bottom nav */}
        {isCaregiver && (
          <>
            <NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/">
              <IoHomeOutline size={24} />
              <span>Home</span>
            </NavLink>
            <NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/chatbot">
              <IoChatbubbleEllipsesOutline size={24} />
              <span>Chatbot</span>
            </NavLink>
            <NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/recordatorios">
              <IoBookOutline size={24} />
              <span>Recordatorios</span>
            </NavLink>
            <NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/bitacora">
              <IoClipboardOutline size={24} />
              <span>Bitácoras</span>
            </NavLink>
            <button className="nav-btn" onClick={() => setOpen(v => !v)}>
              <IoMenuOutline size={24} />
              <span>Más</span>
            </button>
          </>
        )}

        {/* PACIENTE - 4 opciones principales en bottom nav */}
        {isPatient && (
          <>
            <NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/paciente">
              <IoHomeOutline size={24} />
              <span>Home</span>
            </NavLink>
            <NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/mis-cuidadores">
              <IoHandRightOutline size={24} />
              <span>Cuidadores</span>
            </NavLink>
            <NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/chatbot">
              <IoChatbubbleEllipsesOutline size={24} />
              <span>Chatbot</span>
            </NavLink>
            <button className="nav-btn" onClick={() => setOpen(v => !v)}>
              <IoMenuOutline size={24} />
              <span>Más</span>
            </button>
          </>
        )}
      </nav>

      {/* Menú hamburguesa desplegable */}
      {open && (
        <div className="more-menu" onMouseLeave={() => setOpen(false)}>
          {isCaregiver && caregiverMore.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className="more-menu-item"
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}

          {isCaregiver && (
            <NavLink
              to="/tareas"
              onClick={() => setOpen(false)}
              className="more-menu-item"
            >
              <IoCheckboxOutline />
              <span>Lista de Tareas</span>
            </NavLink>
          )}

          {isPatient && patientMore.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className="more-menu-item"
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}

          {role && (
            <a
              href="#logout"
              onClick={(e) => { e.preventDefault(); handleLogout(); }}
              className="more-menu-item logout"
            >
              <IoLogOutOutline />
              <span>Cerrar sesión</span>
            </a>
          )}
        </div>
      )}
    </footer>
  );
}
