import React from "react";
import { useLocation } from "react-router-dom";

export default function TopBar() {
	const { pathname } = useLocation();
	const title = ({
		"/": "Inicio",
		"/bitacora": "Bitácora",
		"/resumen": "Resumen",
		"/calendario": "Calendario",
		"/alertas": "Alertas",
		"/tareas": "Tareas",
		"/ficha": "Ficha médica",
		"/docs": "Documentos",
		"/tutoriales": "Tutoriales",
		"/chatbot": "Chatbot",
		"/perfil": "Perfil",
		"/paciente/home": "Inicio del Paciente",
		"/invitar-cuidador": "Invitar Cuidador",
		"/mis-cuidadores": "Mis Cuidadores",
		"/login": "Ingresar",
		"/register": "Crear cuenta"
	})[pathname] || "Cuido";

	return (
		<header className="topbar">
			<div className="topbar-inner">
				<img className="logo" src="/logo.png" alt="Cuido" />
				<div className="brand-name">Cuido</div>
				<div style={{ marginLeft: 8, color: "#94a3b8" }}>|</div>
				<div aria-label="page-title" style={{ fontWeight: 600 }}>{title}</div>
				<div className="search">
					<input placeholder="Buscar…" />
				</div>
			</div>
		</header>
	);
}
