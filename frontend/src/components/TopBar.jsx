import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IoWarning, IoCall } from "react-icons/io5";
import { useAuth } from "../auth";
import { usePaciente } from "../context/PacienteContext";
import { usuariosAPI, contactosEmergenciaAPI } from "../services/api";

export default function TopBar() {
	const { pathname } = useLocation();
	const { isCaregiver, user } = useAuth();
	const { pacientes, pacienteSeleccionado, seleccionarPaciente } = usePaciente();
	const [showEmergencyModal, setShowEmergencyModal] = useState(false);
	const [contactosEmergencia, setContactosEmergencia] = useState([]);
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

	const isPaciente = user?.rol === "PACIENTE";

	useEffect(() => {
		if (isPaciente) {
			cargarContactosEmergencia();
		}
	}, [isPaciente]);

	const cargarContactosEmergencia = async () => {
		try {
			const usuario = await usuariosAPI.getMe();
			const contactos = await contactosEmergenciaAPI.getByPaciente(usuario.id);
			setContactosEmergencia(contactos || []);
		} catch (error) {
			console.error("Error cargando contactos de emergencia:", error);
		}
	};

	const handleLlamarEmergencia = (telefono) => {
		window.location.href = `tel:${telefono}`;
	};

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

				{/* Botón de Emergencia (solo para pacientes) */}
				{isPaciente && (
					<button
						onClick={() => setShowEmergencyModal(true)}
						style={{
							marginLeft: 'auto',
							padding: '8px 16px',
							background: '#dc2626',
							color: 'white',
							border: 'none',
							borderRadius: '8px',
							fontSize: '14px',
							fontWeight: 600,
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: '6px',
							transition: 'background 0.2s',
						}}
						onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
						onMouseLeave={(e) => e.target.style.background = '#dc2626'}
					>
						<IoWarning size={18} />
						¡Pánico!
					</button>
				)}

				<div className="search">
					<input placeholder="Buscar…" />
				</div>
			</div>

			{/* Modal de Emergencia */}
			{showEmergencyModal && (
				<div
					onClick={() => setShowEmergencyModal(false)}
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0, 0, 0, 0.6)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '16px',
						zIndex: 10000,
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							background: 'white',
							borderRadius: '16px',
							padding: '32px 24px',
							maxWidth: '400px',
							width: '100%',
							boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
						}}
					>
						<div style={{
							width: '64px',
							height: '64px',
							borderRadius: '50%',
							background: '#fee2e2',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto 20px',
						}}>
							<IoWarning size={32} color="#dc2626" />
						</div>

						<h2 style={{
							fontSize: '20px',
							fontWeight: 700,
							textAlign: 'center',
							margin: '0 0 12px 0',
							color: '#1e293b',
						}}>
							Contactos de emergencia
						</h2>

						<p style={{
							fontSize: '14px',
							textAlign: 'center',
							color: '#64748b',
							margin: '0 0 24px 0',
							lineHeight: 1.6,
						}}>
							Llamá a uno de tus contactos de emergencia
						</p>

						{contactosEmergencia.length > 0 ? (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
								{contactosEmergencia.map((contacto) => (
									<div
										key={contacto.id}
										style={{
											padding: '16px',
											background: '#f8fafc',
											borderRadius: '8px',
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
										}}
									>
										<div>
											<div style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>
												{contacto.nombre}
											</div>
											<div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
												{contacto.relacion}
											</div>
											<div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
												{contacto.telefono}
											</div>
										</div>
										<button
											onClick={() => handleLlamarEmergencia(contacto.telefono)}
											style={{
												padding: '10px 16px',
												background: '#dc2626',
												color: 'white',
												border: 'none',
												borderRadius: '8px',
												cursor: 'pointer',
												display: 'flex',
												alignItems: 'center',
												gap: '6px',
												fontSize: '14px',
												fontWeight: 600,
											}}
										>
											<IoCall />
											Llamar
										</button>
									</div>
								))}
							</div>
						) : (
							<p style={{
								textAlign: 'center',
								color: '#94a3b8',
								fontSize: '14px',
								padding: '24px 0',
							}}>
								No tenés contactos de emergencia configurados.
								<br />
								Podés agregarlos desde tu perfil.
							</p>
						)}

						<button
							onClick={() => setShowEmergencyModal(false)}
							style={{
								width: '100%',
								padding: '12px',
								background: '#f1f5f9',
								color: '#64748b',
								border: 'none',
								borderRadius: '8px',
								fontSize: '15px',
								fontWeight: 600,
								cursor: 'pointer',
								marginTop: '16px',
							}}
						>
							Cerrar
						</button>
					</div>
				</div>
			)}
		</header>
	);
}
