import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import { usePaciente } from "../context/PacienteContext";

export default function TopBar() {
	const { pathname } = useLocation();
	const { isCaregiver } = useAuth();
	const { pacientes, pacienteSeleccionado, seleccionarPaciente } = usePaciente();
	const title = ({
		"/": "Inicio",
		"/bitacora": "Bitácora",
		"/resumen": "Resumen",
		"/calendario": "Calendario",
		"/alertas": "Alertas",
		"/tareas": "Tareas",
		"/ficha": "Ficha médica",
		"/docs": "Documentos",
		"/preguntas-frecuentes": "Preguntas Frecuentes",
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

				{/* Selector de Paciente (solo para cuidadores) */}
				{isCaregiver && pacientes.length > 0 && (
					<>
						<div style={{ marginLeft: 16, color: "#94a3b8" }}>|</div>
						<select
							className="paciente-selector"
							value={pacienteSeleccionado?.id || ''}
							onChange={(e) => seleccionarPaciente(Number(e.target.value))}
							style={{
								marginLeft: 12,
								padding: '6px 12px',
								borderRadius: '6px',
								border: '1px solid #d1d5db',
								background: 'white',
								fontSize: '14px',
								fontWeight: 500,
								color: '#1f2937',
								cursor: 'pointer',
								outline: 'none',
								transition: 'border-color 0.2s',
							}}
						>
							{pacientes.map((p) => (
								<option key={p.id} value={p.id}>
									{p.nombreCompleto} {p.edad ? `(${p.edad} años)` : ''}
								</option>
							))}
						</select>
					</>
				)}

				<div className="search">
					<input placeholder="Buscar…" />
				</div>
			</div>
		</header>
	);
}
