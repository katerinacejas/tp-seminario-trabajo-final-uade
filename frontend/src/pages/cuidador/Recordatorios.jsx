import React, { useState, useEffect } from "react";
import { recordatoriosAPI, medicamentosAPI, citasAPI } from "../../services/api";
import { usePaciente } from "../../context/PacienteContext";
import * as NotificationService from "../../services/notificationService";
import "./Recordatorios.css";

export default function Recordatorios() {
	// Obtener paciente seleccionado del contexto
	const { pacienteSeleccionado } = usePaciente();
	const pacienteId = pacienteSeleccionado?.id;
	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [tipoRecordatorio, setTipoRecordatorio] = useState("MEDICAMENTO"); // MEDICAMENTO o CITA_MEDICA
	const [formData, setFormData] = useState({
		descripcion: "",
		fecha: "",
		hora: "",
		repetirCada: "nunca", // nunca, diario, 7dias, 15dias, 1mes
		repetirHasta: "indefinido", // indefinido o fecha específica
		fechaFin: "",
		// Campos específicos de medicamento
		nombreMedicamento: "",
		dosis: "",
		// Campos específicos de cita médica
		ubicacion: "",
		nombreDoctor: "",
		especialidad: "",
		motivo: ""
	});

	const [recordatorios, setRecordatorios] = useState([]);
	const [recordatorioAEliminar, setRecordatorioAEliminar] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Cargar recordatorios al montar el componente
	useEffect(() => {
		if (pacienteId) {
			cargarRecordatorios();
		}
	}, [pacienteId]);

	const cargarRecordatorios = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await recordatoriosAPI.getByPaciente(pacienteId);
			setRecordatorios(data);
		} catch (err) {
			console.error('Error al cargar recordatorios:', err);
			setError('No se pudieron cargar los recordatorios');
			// Mantener mock data si falla la carga
			setRecordatorios([
				{
					id: 1,
					tipo: "CITA_MEDICA",
					descripcion: "Cita con el cardiólogo",
					fechaHora: "2025-11-10T11:30:00",
					estado: "COMPLETADO",
					nombreDoctor: "Dr. García",
					ubicacion: "Hospital Alemán"
				},
				{
					id: 2,
					tipo: "MEDICAMENTO",
					descripcion: "Pastilla para la presión",
					fechaHora: "2025-11-10T08:00:00",
					estado: "CANCELADO",
					nombreMedicamento: "Losartán",
					dosis: "50mg"
				}
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleTipoChange = (nuevoTipo) => {
		setTipoRecordatorio(nuevoTipo);
		// Limpiar campos específicos del otro tipo
		if (nuevoTipo === "MEDICAMENTO") {
			setFormData(prev => ({
				...prev,
				ubicacion: "",
				nombreDoctor: "",
				especialidad: "",
				motivo: ""
			}));
		} else {
			setFormData(prev => ({
				...prev,
				nombreMedicamento: "",
				dosis: "",
				repetirCada: "nunca", // Las citas no se repiten
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Calcular fechaFin si es "indefinido"
			let fechaFinCalculada = formData.fechaFin;
			if (formData.repetirHasta === "indefinido" && formData.repetirCada !== "nunca") {
				const fechaInicio = new Date(formData.fecha);
				fechaInicio.setMonth(fechaInicio.getMonth() + 6);
				fechaFinCalculada = fechaInicio.toISOString().split('T')[0];
			}

			if (tipoRecordatorio === "MEDICAMENTO") {
				// Crear medicamento con horarios
				const medicamentoData = {
					pacienteId: parseInt(pacienteId),
					nombre: formData.nombreMedicamento,
					dosis: formData.dosis || null,
					frecuencia: formData.repetirCada,
					viaAdministracion: null,
					fechaInicio: formData.fecha,
					fechaFin: fechaFinCalculada,
					observaciones: formData.descripcion,
					horarios: [{
						hora: formData.hora,
						diasSemana: formData.repetirCada === "diario" ? null : getDiasSemana(formData.repetirCada)
					}]
				};

				const medicamentoCreado = await medicamentosAPI.crear(medicamentoData);

				// Programar notificación para el medicamento
				try {
					await NotificationService.programarNotificacionMedicamento({
						id: medicamentoCreado.id,
						nombre: formData.nombreMedicamento,
						horaProgramada: formData.hora
					});
					console.log('✅ Notificación programada para medicamento');
				} catch (notifError) {
					console.warn('No se pudo programar la notificación del medicamento:', notifError);
				}
			} else {
				// Crear cita médica
				const citaData = {
					pacienteId: parseInt(pacienteId),
					fechaHora: `${formData.fecha}T${formData.hora}:00`,
					ubicacion: formData.ubicacion || null,
					nombreDoctor: formData.nombreDoctor || null,
					especialidad: formData.especialidad || null,
					motivo: formData.motivo || formData.descripcion,
					observaciones: null
				};

				const citaCreada = await citasAPI.crear(citaData);

				// Programar notificación 1 hora antes de la cita
				try {
					await NotificationService.programarNotificacionCita({
						id: citaCreada.id,
						titulo: formData.descripcion,
						fechaHora: citaCreada.fechaHora,
						lugar: formData.ubicacion
					});
					console.log('✅ Notificación programada para cita médica');
				} catch (notifError) {
					console.warn('No se pudo programar la notificación de la cita:', notifError);
				}
			}

			// Recargar recordatorios
			await cargarRecordatorios();

			// Cerrar formulario y resetear
			setMostrarFormulario(false);
			resetFormulario();
		} catch (err) {
			console.error('Error al crear recordatorio:', err);
			setError('No se pudo crear el recordatorio: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	// Convertir repetirCada a días de la semana (si aplica)
	const getDiasSemana = (repetirCada) => {
		// Para simplificar, retornamos null (diario)
		// Esto se puede expandir para manejar días específicos
		return null;
	};

	const resetFormulario = () => {
		setFormData({
			descripcion: "",
			fecha: "",
			hora: "",
			repetirCada: "nunca",
			repetirHasta: "indefinido",
			fechaFin: "",
			nombreMedicamento: "",
			dosis: "",
			ubicacion: "",
			nombreDoctor: "",
			especialidad: "",
			motivo: ""
		});
		setTipoRecordatorio("MEDICAMENTO");
	};

	const ciclarEstado = async (id) => {
		try {
			const recordatorioActualizado = await recordatoriosAPI.ciclarEstado(id);

			// Actualizar en el estado local
			setRecordatorios(prev => prev.map(r =>
				r.id === id ? recordatorioActualizado : r
			));
		} catch (err) {
			console.error('Error al actualizar estado:', err);
			setError('No se pudo actualizar el estado');
		}
	};

	const confirmarEliminacion = (id) => {
		setRecordatorioAEliminar(id);
	};

	const eliminarRecordatorio = async () => {
		if (recordatorioAEliminar) {
			try {
				await recordatoriosAPI.eliminar(recordatorioAEliminar);

				// Eliminar del estado local
				setRecordatorios(prev => prev.filter(r => r.id !== recordatorioAEliminar));
				setRecordatorioAEliminar(null);
			} catch (err) {
				console.error('Error al eliminar recordatorio:', err);
				setError('No se pudo eliminar el recordatorio');
				setRecordatorioAEliminar(null);
			}
		}
	};

	const formatearFechaHora = (fechaHoraStr) => {
		const fecha = new Date(fechaHoraStr);
		const horas = fecha.getHours().toString().padStart(2, '0');
		const minutos = fecha.getMinutes().toString().padStart(2, '0');
		const dia = fecha.getDate().toString().padStart(2, '0');
		const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
		const anio = fecha.getFullYear();
		return {
			hora: `${horas}:${minutos}`,
			fecha: `${dia}/${mes}/${anio}`
		};
	};

	const obtenerEstiloEstado = (estado) => {
		switch (estado) {
			case "COMPLETADO": return "estado-completado";
			case "CANCELADO": return "estado-cancelado";
			case "PENDIENTE": return "estado-pendiente";
			default: return "";
		}
	};

	const obtenerIconoTipo = (tipo) => {
		return tipo === "MEDICAMENTO" ? "💊" : "📅";
	};

	return (
		<div className="recordatorios-container">
			{/* Mensaje de error */}
			{error && (
				<div className="alert alert-error">
					⚠️ {error}
					<button onClick={() => setError(null)} className="alert-close">✕</button>
				</div>
			)}

			{/* Header */}
			<div className="recordatorios-header card">
				<div className="header-content">
					<h1>Recordatorios</h1>
					<button
						className="btn-info-icon"
						title="Información sobre recordatorios"
					>
						ⓘ
					</button>
				</div>

				<button
					className="btn-añadir-recordatorio"
					onClick={() => setMostrarFormulario(!mostrarFormulario)}
				>
					<span className="icon-plus">{mostrarFormulario ? "✕" : "+"}</span>
					<span>Añadir recordatorio</span>
				</button>
			</div>

			{/* Formulario de creación */}
			{mostrarFormulario && (
				<div className="card formulario-recordatorio">
					<h3 className="formulario-titulo">
						Añadir recordatorio
						<button
							className="btn-cerrar-formulario"
							onClick={() => {
								setMostrarFormulario(false);
								resetFormulario();
							}}
						>
							✕
						</button>
					</h3>
					<p className="formulario-subtitulo">Para Carlos Regidor</p>

					<form onSubmit={handleSubmit}>
						{/* Selector de tipo */}
						<div className="tipo-selector">
							<label className="label-tipo">Tipo:</label>
							<div className="tipo-buttons">
								<button
									type="button"
									className={`btn-tipo ${tipoRecordatorio === "MEDICAMENTO" ? "active" : ""}`}
									onClick={() => handleTipoChange("MEDICAMENTO")}
								>
									Medicación
								</button>
								<button
									type="button"
									className={`btn-tipo ${tipoRecordatorio === "CITA_MEDICA" ? "active" : ""}`}
									onClick={() => handleTipoChange("CITA_MEDICA")}
								>
									Cita médica
								</button>
							</div>
						</div>

						{/* Campos comunes */}
						<div className="form-group">
							<label>Descripción</label>
							<input
								type="text"
								name="descripcion"
								className="input"
								value={formData.descripcion}
								onChange={handleInputChange}
								placeholder="Descripción breve..."
								required
							/>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label>Fecha</label>
								<input
									type="date"
									name="fecha"
									className="input"
									value={formData.fecha}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className="form-group">
								<label>Hora</label>
								<input
									type="time"
									name="hora"
									className="input"
									value={formData.hora}
									onChange={handleInputChange}
									required
								/>
							</div>
						</div>

						{/* Campos específicos de MEDICAMENTO */}
						{tipoRecordatorio === "MEDICAMENTO" && (
							<>
								<div className="form-row">
									<div className="form-group">
										<label>Nombre del medicamento</label>
										<input
											type="text"
											name="nombreMedicamento"
											className="input"
											value={formData.nombreMedicamento}
											onChange={handleInputChange}
											placeholder="Ej: Losartán"
											required
										/>
									</div>

									<div className="form-group">
										<label>Dosis</label>
										<input
											type="text"
											name="dosis"
											className="input"
											value={formData.dosis}
											onChange={handleInputChange}
											placeholder="Ej: 50mg"
										/>
									</div>
								</div>

								{/* Repetición (solo para medicamentos) */}
								<div className="form-group">
									<label>Repetir cada:</label>
									<div className="repetir-buttons">
										{["nunca", "diario", "7dias", "15dias", "1mes"].map(opcion => (
											<button
												key={opcion}
												type="button"
												className={`btn-repetir ${formData.repetirCada === opcion ? "active" : ""}`}
												onClick={() => setFormData(prev => ({ ...prev, repetirCada: opcion }))}
											>
												{opcion === "nunca" ? "Nunca" :
												 opcion === "diario" ? "Diariamente" :
												 opcion === "7dias" ? "7 días" :
												 opcion === "15dias" ? "15 días" :
												 "1 mes"}
											</button>
										))}
									</div>
								</div>

								{formData.repetirCada !== "nunca" && (
									<div className="form-group">
										<label>Repetir hasta:</label>
										<div className="repetir-hasta-container">
											<div className="repetir-buttons">
												<button
													type="button"
													className={`btn-repetir ${formData.repetirHasta === "indefinido" ? "active" : ""}`}
													onClick={() => setFormData(prev => ({ ...prev, repetirHasta: "indefinido" }))}
												>
													Indefinido
												</button>
												<button
													type="button"
													className={`btn-repetir ${formData.repetirHasta === "fecha" ? "active" : ""}`}
													onClick={() => setFormData(prev => ({ ...prev, repetirHasta: "fecha" }))}
												>
													Seleccionar...
												</button>
											</div>
											{formData.repetirHasta === "fecha" && (
												<input
													type="date"
													name="fechaFin"
													className="input"
													value={formData.fechaFin}
													onChange={handleInputChange}
													required
												/>
											)}
											{formData.repetirHasta === "indefinido" && (
												<p className="aviso-indefinido">
													ℹ️ Los recordatorios se crearán por los próximos 6 meses
												</p>
											)}
										</div>
									</div>
								)}
							</>
						)}

						{/* Campos específicos de CITA_MEDICA */}
						{tipoRecordatorio === "CITA_MEDICA" && (
							<>
								<div className="form-group">
									<label>Ubicación</label>
									<input
										type="text"
										name="ubicacion"
										className="input"
										value={formData.ubicacion}
										onChange={handleInputChange}
										placeholder="Ej: Hospital Alemán"
									/>
								</div>

								<div className="form-row">
									<div className="form-group">
										<label>Nombre del doctor</label>
										<input
											type="text"
											name="nombreDoctor"
											className="input"
											value={formData.nombreDoctor}
											onChange={handleInputChange}
											placeholder="Ej: Dr. García"
										/>
									</div>

									<div className="form-group">
										<label>Especialidad</label>
										<input
											type="text"
											name="especialidad"
											className="input"
											value={formData.especialidad}
											onChange={handleInputChange}
											placeholder="Ej: Cardiología"
										/>
									</div>
								</div>

								<div className="form-group">
									<label>Motivo</label>
									<textarea
										name="motivo"
										className="input textarea"
										value={formData.motivo}
										onChange={handleInputChange}
										placeholder="Motivo de la consulta..."
										rows="3"
									/>
								</div>
							</>
						)}

						{/* Botones del formulario */}
						<div className="form-buttons">
							<button
								type="submit"
								className="btn btn-primary btn-submit"
							>
								Añadir recordatorio
							</button>
							<button
								type="button"
								className="btn btn-cancelar"
								onClick={() => {
									setMostrarFormulario(false);
									resetFormulario();
								}}
							>
								Cancelar
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Lista de recordatorios */}
			<div className="card lista-recordatorios-card">
				<h2 className="lista-titulo">Lista de recordatorios</h2>
				<p className="lista-subtitulo">De Carlos Regidor</p>

				<div className="recordatorios-lista">
					{loading && recordatorios.length === 0 ? (
						<p className="mensaje-loading">⏳ Cargando recordatorios...</p>
					) : recordatorios.length === 0 ? (
						<p className="mensaje-vacio">No hay recordatorios creados</p>
					) : (
						recordatorios.map(recordatorio => {
							const { hora, fecha } = formatearFechaHora(recordatorio.fechaHora);
							return (
								<div key={recordatorio.id} className="recordatorio-item">
									<div className="recordatorio-icono">
										{obtenerIconoTipo(recordatorio.tipo)}
									</div>
									<div className="recordatorio-info">
										<div className="recordatorio-descripcion">
											{recordatorio.descripcion}
										</div>
										<div className="recordatorio-detalles">
											{hora} - {fecha}
										</div>
									</div>
									<div className="recordatorio-acciones">
										<button
											className={`btn-estado ${obtenerEstiloEstado(recordatorio.estado)}`}
											onClick={() => ciclarEstado(recordatorio.id)}
											title="Click para cambiar estado"
										>
											{recordatorio.estado === "COMPLETADO" ? "Completado" :
											 recordatorio.estado === "CANCELADO" ? "Cancelado" :
											 "Pendiente"}
										</button>
										<button
											className="btn-eliminar"
											onClick={() => confirmarEliminacion(recordatorio.id)}
											title="Eliminar recordatorio"
										>
											🗑️
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>

				{recordatorios.length > 3 && (
					<button className="btn-cargar-mas">
						Cargar más...
					</button>
				)}
			</div>

			{/* Modal de confirmación de eliminación */}
			{recordatorioAEliminar && (
				<div className="modal-overlay" onClick={() => setRecordatorioAEliminar(null)}>
					<div className="modal-confirmar" onClick={(e) => e.stopPropagation()}>
						<h3>⚠️ Confirmar eliminación</h3>
						<p>¿Estás seguro de que deseas eliminar este recordatorio?</p>
						<p className="modal-advertencia">Esta acción no se puede deshacer.</p>
						<div className="modal-buttons">
							<button
								className="btn btn-danger"
								onClick={eliminarRecordatorio}
							>
								Eliminar
							</button>
							<button
								className="btn btn-secondary"
								onClick={() => setRecordatorioAEliminar(null)}
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
