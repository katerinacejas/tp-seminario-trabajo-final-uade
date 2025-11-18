import React, { useState, useEffect } from "react";
import {
	IoPerson,
	IoCheckmarkCircle,
	IoCloseCircle,
	IoMailOutline,
	IoCallOutline,
	IoLocationOutline,
	IoMedkitOutline,
	IoWaterOutline,
	IoScaleOutline,
	IoResizeOutline,
	IoWarningOutline,
	IoDocumentTextOutline,
	IoShieldOutline,
	IoCardOutline,
	IoCalendarOutline,
	IoPeopleOutline
} from "react-icons/io5";
import { usePaciente } from "../../context/PacienteContext";
import {
	pacientesAPI,
	contactosEmergenciaAPI,
	cuidadoresPacientesAPI,
	usuariosAPI
} from "../../services/api";
import "./Pacientes.css";

export default function Pacientes() {
	const { pacienteSeleccionado, pacientes, seleccionarPaciente } = usePaciente();

	const [invitacionesPendientes, setInvitacionesPendientes] = useState([]);
	const [pacienteDetalle, setPacienteDetalle] = useState(null);
	const [contactosEmergencia, setContactosEmergencia] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingInvitaciones, setLoadingInvitaciones] = useState(true);
	const [error, setError] = useState(null);
	const [cuidadorId, setCuidadorId] = useState(null);

	useEffect(() => {
		cargarCuidadorYDatos();
	}, []);

	useEffect(() => {
		// Solo cargar datos si hay un paciente seleccionado Y está en la lista de pacientes vinculados
		if (pacienteSeleccionado && pacientes.some(p => p.id === pacienteSeleccionado.id)) {
			cargarDatosPaciente();
		} else if (pacienteSeleccionado && pacientes.length === 0) {
			// Si hay un paciente seleccionado pero no está en la lista, limpiar la selección
			setPacienteDetalle(null);
			setContactosEmergencia([]);
		}
	}, [pacienteSeleccionado, pacientes]);

	const cargarCuidadorYDatos = async () => {
		try {
			const usuario = await usuariosAPI.getMe();
			setCuidadorId(usuario.id);
			await cargarInvitaciones(usuario.id);
		} catch (err) {
			console.error("Error al cargar datos del cuidador:", err);
		}
	};

	const cargarInvitaciones = async (cuidadorIdParam) => {
		try {
			setLoadingInvitaciones(true);
			const invitaciones = await cuidadoresPacientesAPI.getInvitacionesPendientes(cuidadorIdParam);
			setInvitacionesPendientes(invitaciones || []);
		} catch (err) {
			console.error("Error al cargar invitaciones:", err);
			setInvitacionesPendientes([]);
		} finally {
			setLoadingInvitaciones(false);
		}
	};

	const cargarDatosPaciente = async () => {
		try {
			setLoading(true);
			setError(null);

			// Cargar información completa del paciente
			const pacienteData = await pacientesAPI.getById(pacienteSeleccionado.id);
			setPacienteDetalle(pacienteData);

			// Cargar contactos de emergencia
			const contactos = await contactosEmergenciaAPI.getByPaciente(pacienteSeleccionado.id);
			setContactosEmergencia(contactos || []);
		} catch (err) {
			console.error("Error al cargar datos del paciente:", err);
			setError("Error al cargar la información del paciente");
		} finally {
			setLoading(false);
		}
	};

	const handleAceptarInvitacion = async (invitacionId) => {
		try {
			await cuidadoresPacientesAPI.aceptarInvitacion(invitacionId);
			alert("Invitación aceptada exitosamente");
			// Recargar invitaciones
			if (cuidadorId) {
				await cargarInvitaciones(cuidadorId);
			}
			// Recargar la lista de pacientes (esto actualizará el contexto)
			window.location.reload();
		} catch (err) {
			console.error("Error al aceptar invitación:", err);
			alert(err.message || "Error al aceptar la invitación");
		}
	};

	const calcularEdad = (fechaNacimiento) => {
		if (!fechaNacimiento) return null;
		const hoy = new Date();
		const nacimiento = new Date(fechaNacimiento);
		let edad = hoy.getFullYear() - nacimiento.getFullYear();
		const mes = hoy.getMonth() - nacimiento.getMonth();
		if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
			edad--;
		}
		return edad;
	};

	const formatearFecha = (fecha) => {
		if (!fecha) return "No especificado";
		const date = new Date(fecha);
		return date.toLocaleDateString("es-AR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		});
	};

	return (
		<div className="pacientes-page">
			<div className="page-header">
				<h1>Mis Pacientes</h1>
			</div>

			{/* Sección de Invitaciones Pendientes */}
			{loadingInvitaciones ? (
				<div className="invitaciones-loading">
					<p>Cargando invitaciones...</p>
				</div>
			) : invitacionesPendientes.length > 0 ? (
				<div className="invitaciones-seccion">
					<h2 className="seccion-titulo">
						<IoMailOutline /> Invitaciones Pendientes
					</h2>
					<div className="invitaciones-lista">
						{invitacionesPendientes.map((invitacion) => (
							<div key={invitacion.id} className="invitacion-card">
								<div className="invitacion-header">
									<div className="invitacion-icon">
										<IoPerson />
									</div>
									<div className="invitacion-info">
										<h3>{invitacion.nombreCompletoPaciente}</h3>
										<p className="invitacion-email">{invitacion.emailPaciente}</p>
										<p className="invitacion-fecha">
											Invitación: {formatearFecha(invitacion.fechaInvitacion)}
										</p>
									</div>
								</div>
								<div className="invitacion-actions">
									<button
										className="btn-aceptar"
										onClick={() => handleAceptarInvitacion(invitacion.id)}
									>
										<IoCheckmarkCircle /> Aceptar
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			) : null}

			{/* Selector de Paciente (Tabs) */}
			{pacientes.length > 0 && (
				<div className="pacientes-selector">
					<div className="pacientes-tabs">
						{pacientes.map((paciente) => (
							<button
								key={paciente.id}
								className={`paciente-tab ${
									pacienteSeleccionado?.id === paciente.id ? "active" : ""
								}`}
								onClick={() => seleccionarPaciente(paciente.id)}
							>
								<IoPerson />
								<span>{paciente.nombreCompleto}</span>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Información del Paciente */}
			{loading ? (
				<div className="loading-message">
					<p>Cargando información del paciente...</p>
				</div>
			) : error ? (
				<div className="error-message">
					<p>{error}</p>
				</div>
			) : !pacienteSeleccionado ? (
				<div className="empty-state">
					<div className="empty-icon">
						<IoPeopleOutline />
					</div>
					<h3>No tienes pacientes vinculados</h3>
					<p>Acepta una invitación o espera a que un paciente te invite</p>
				</div>
			) : pacienteDetalle ? (
				<div className="paciente-detalle">
					{/* Información Personal */}
					<div className="info-seccion">
						<h2 className="seccion-titulo">Información Personal</h2>
						<div className="info-grid">
							<div className="info-item">
								<div className="info-label">
									<IoPerson /> Nombre Completo
								</div>
								<div className="info-valor">{pacienteDetalle.nombreCompleto}</div>
							</div>

							<div className="info-item">
								<div className="info-label">
									<IoMailOutline /> Email
								</div>
								<div className="info-valor">{pacienteDetalle.email || "No especificado"}</div>
							</div>

							{pacienteDetalle.edad && (
								<div className="info-item">
									<div className="info-label">
										<IoCalendarOutline /> Edad
									</div>
									<div className="info-valor">{pacienteDetalle.edad} años</div>
								</div>
							)}
						</div>
					</div>

					{/* Datos Médicos */}
					<div className="info-seccion">
						<h2 className="seccion-titulo">Información Médica</h2>
						<div className="info-grid">
							{pacienteDetalle.tipoSanguineo && (
								<div className="info-item">
									<div className="info-label">
										<IoWaterOutline /> Tipo Sanguíneo
									</div>
									<div className="info-valor">{pacienteDetalle.tipoSanguineo}</div>
								</div>
							)}

							{pacienteDetalle.peso && (
								<div className="info-item">
									<div className="info-label">
										<IoScaleOutline /> Peso
									</div>
									<div className="info-valor">{pacienteDetalle.peso} kg</div>
								</div>
							)}

							{pacienteDetalle.altura && (
								<div className="info-item">
									<div className="info-label">
										<IoResizeOutline /> Altura
									</div>
									<div className="info-valor">{pacienteDetalle.altura} cm</div>
								</div>
							)}

							{pacienteDetalle.alergias && (
								<div className="info-item full-width">
									<div className="info-label">
										<IoWarningOutline /> Alergias
									</div>
									<div className="info-valor">{pacienteDetalle.alergias}</div>
								</div>
							)}

							{pacienteDetalle.obraSocial && (
								<div className="info-item">
									<div className="info-label">
										<IoShieldOutline /> Obra Social
									</div>
									<div className="info-valor">{pacienteDetalle.obraSocial}</div>
								</div>
							)}

							{pacienteDetalle.numeroAfiliado && (
								<div className="info-item">
									<div className="info-label">
										<IoCardOutline /> Número de Afiliado
									</div>
									<div className="info-valor">{pacienteDetalle.numeroAfiliado}</div>
								</div>
							)}
						</div>

						{/* Condiciones Médicas */}
						{pacienteDetalle.condicionesMedicas && pacienteDetalle.condicionesMedicas.length > 0 && (
							<div className="info-subseccion">
								<h3 className="subseccion-titulo">
									<IoMedkitOutline /> Condiciones Médicas
								</h3>
								<ul className="lista-items">
									{pacienteDetalle.condicionesMedicas.map((condicion, index) => (
										<li key={index}>{condicion}</li>
									))}
								</ul>
							</div>
						)}

						{/* Notas Importantes */}
						{pacienteDetalle.notasImportantes && pacienteDetalle.notasImportantes.length > 0 && (
							<div className="info-subseccion">
								<h3 className="subseccion-titulo">
									<IoDocumentTextOutline /> Notas Importantes
								</h3>
								<ul className="lista-items">
									{pacienteDetalle.notasImportantes.map((nota, index) => (
										<li key={index}>{nota}</li>
									))}
								</ul>
							</div>
						)}

						{/* Mensaje si no hay datos médicos */}
						{!pacienteDetalle.tipoSanguineo &&
							!pacienteDetalle.peso &&
							!pacienteDetalle.altura &&
							!pacienteDetalle.alergias &&
							!pacienteDetalle.obraSocial &&
							!pacienteDetalle.numeroAfiliado &&
							(!pacienteDetalle.condicionesMedicas || pacienteDetalle.condicionesMedicas.length === 0) &&
							(!pacienteDetalle.notasImportantes || pacienteDetalle.notasImportantes.length === 0) && (
								<div className="mensaje-vacio">
									<p>El paciente no ha cargado información médica todavía</p>
								</div>
							)}
					</div>

					{/* Contactos de Emergencia */}
					<div className="info-seccion">
						<h2 className="seccion-titulo">Contactos de Emergencia</h2>
						{contactosEmergencia.length > 0 ? (
							<div className="contactos-lista">
								{contactosEmergencia.map((contacto) => (
									<div
										key={contacto.id}
										className={`contacto-card ${contacto.esPrincipal ? "principal" : ""}`}
									>
										{contacto.esPrincipal && (
											<div className="contacto-badge">Principal</div>
										)}
										<div className="contacto-info">
											<h3>{contacto.nombreCompleto}</h3>
											<p className="contacto-relacion">{contacto.relacion}</p>
											<div className="contacto-detalles">
												<div className="contacto-detalle">
													<IoCallOutline />
													<span>{contacto.telefono}</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="mensaje-vacio">
								<p>No hay contactos de emergencia registrados</p>
							</div>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
