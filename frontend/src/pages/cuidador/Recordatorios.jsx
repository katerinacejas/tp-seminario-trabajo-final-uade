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

	// Estado del formulario de MEDICAMENTO
	const [formMedicamento, setFormMedicamento] = useState({
		nombre: "",
		dosis: "",
		frecuencia: "",
		viaAdministracion: "",
		fechaInicio: "",
		fechaFin: "",
		observaciones: "",
		horarios: [{ hora: "", diasSemana: null }] // Array de horarios
	});

	// Estado del formulario de CITA MÉDICA
	const [formCita, setFormCita] = useState({
		fechaHora: "",
		ubicacion: "",
		nombreDoctor: "",
		especialidad: "",
		motivo: "",
		observaciones: ""
	});

	const [recordatorios, setRecordatorios] = useState([]);
	const [recordatorioAEliminar, setRecordatorioAEliminar] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [ordenAscendente, setOrdenAscendente] = useState(true); // true = más próximos primero
	const [erroresValidacion, setErroresValidacion] = useState({});

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
			setRecordatorios(ordenarRecordatorios(data, true));
		} catch (err) {
			console.error('Error al cargar recordatorios:', err);
			setError('No se pudieron cargar los recordatorios');
			setRecordatorios([]);
		} finally {
			setLoading(false);
		}
	};

	// Ordenar recordatorios por fecha
	const ordenarRecordatorios = (lista, ascendente) => {
		return [...lista].sort((a, b) => {
			const fechaA = new Date(a.fechaHora);
			const fechaB = new Date(b.fechaHora);
			return ascendente ? fechaA - fechaB : fechaB - fechaA;
		});
	};

	const toggleOrdenamiento = () => {
		setOrdenAscendente(!ordenAscendente);
		setRecordatorios(ordenarRecordatorios(recordatorios, !ordenAscendente));
	};

	// Validar formulario de medicamento
	const validarMedicamento = () => {
		const errores = {};

		if (!formMedicamento.nombre.trim()) {
			errores.nombre = "El nombre es obligatorio";
		}

		if (!formMedicamento.fechaInicio) {
			errores.fechaInicio = "La fecha de inicio es obligatoria";
		}

		if (!formMedicamento.fechaFin) {
			errores.fechaFin = "La fecha de fin es obligatoria";
		}

		// Validar que fecha fin sea posterior a fecha inicio
		if (formMedicamento.fechaInicio && formMedicamento.fechaFin) {
			if (new Date(formMedicamento.fechaFin) <= new Date(formMedicamento.fechaInicio)) {
				errores.fechaFin = "La fecha de fin debe ser posterior a la de inicio";
			}
		}

		// Validar horarios
		if (formMedicamento.horarios.length === 0 || !formMedicamento.horarios[0].hora) {
			errores.horarios = "Debe agregar al menos un horario";
		}

		setErroresValidacion(errores);
		return Object.keys(errores).length === 0;
	};

	// Validar formulario de cita médica
	const validarCita = () => {
		const errores = {};

		if (!formCita.fechaHora) {
			errores.fechaHora = "La fecha y hora son obligatorias";
		}

		// Validar que la fecha sea futura
		if (formCita.fechaHora) {
			const fechaCita = new Date(formCita.fechaHora);
			const ahora = new Date();
			if (fechaCita <= ahora) {
				errores.fechaHora = "La fecha debe ser futura";
			}
		}

		setErroresValidacion(errores);
		return Object.keys(errores).length === 0;
	};

	const handleInputChangeMedicamento = (e) => {
		const { name, value } = e.target;
		setFormMedicamento(prev => ({ ...prev, [name]: value }));
		// Limpiar error del campo
		if (erroresValidacion[name]) {
			setErroresValidacion(prev => {
				const nuevos = { ...prev };
				delete nuevos[name];
				return nuevos;
			});
		}
	};

	const handleInputChangeCita = (e) => {
		const { name, value } = e.target;
		setFormCita(prev => ({ ...prev, [name]: value }));
		// Limpiar error del campo
		if (erroresValidacion[name]) {
			setErroresValidacion(prev => {
				const nuevos = { ...prev };
				delete nuevos[name];
				return nuevos;
			});
		}
	};

	// Manejar horarios (agregar/eliminar/editar)
	const agregarHorario = () => {
		setFormMedicamento(prev => ({
			...prev,
			horarios: [...prev.horarios, { hora: "", diasSemana: null }]
		}));
	};

	const eliminarHorario = (index) => {
		setFormMedicamento(prev => ({
			...prev,
			horarios: prev.horarios.filter((_, i) => i !== index)
		}));
	};

	const handleHorarioChange = (index, field, value) => {
		setFormMedicamento(prev => ({
			...prev,
			horarios: prev.horarios.map((h, i) =>
				i === index ? { ...h, [field]: value } : h
			)
		}));
		// Limpiar error de horarios
		if (erroresValidacion.horarios) {
			setErroresValidacion(prev => {
				const nuevos = { ...prev };
				delete nuevos.horarios;
				return nuevos;
			});
		}
	};

	const handleDiasSemanaChange = (index, dia) => {
		setFormMedicamento(prev => {
			const nuevoHorario = { ...prev.horarios[index] };

			// Si diasSemana es null, inicializar con el día seleccionado
			if (nuevoHorario.diasSemana === null) {
				nuevoHorario.diasSemana = [dia];
			} else {
				// Toggle del día
				if (nuevoHorario.diasSemana.includes(dia)) {
					nuevoHorario.diasSemana = nuevoHorario.diasSemana.filter(d => d !== dia);
					// Si queda vacío, volver a null (todos los días)
					if (nuevoHorario.diasSemana.length === 0) {
						nuevoHorario.diasSemana = null;
					}
				} else {
					nuevoHorario.diasSemana = [...nuevoHorario.diasSemana, dia];
				}
			}

			return {
				...prev,
				horarios: prev.horarios.map((h, i) => i === index ? nuevoHorario : h)
			};
		});
	};

	const handleTipoChange = (nuevoTipo) => {
		setTipoRecordatorio(nuevoTipo);
		setErroresValidacion({});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			if (tipoRecordatorio === "MEDICAMENTO") {
				// Validar
				if (!validarMedicamento()) {
					setLoading(false);
					return;
				}

				// Crear medicamento
				const medicamentoData = {
					pacienteId: parseInt(pacienteId),
					nombre: formMedicamento.nombre.trim(),
					dosis: formMedicamento.dosis.trim() || null,
					frecuencia: formMedicamento.frecuencia.trim() || null,
					viaAdministracion: formMedicamento.viaAdministracion.trim() || null,
					fechaInicio: formMedicamento.fechaInicio,
					fechaFin: formMedicamento.fechaFin,
					observaciones: formMedicamento.observaciones.trim() || null,
					horarios: formMedicamento.horarios.map(h => ({
						hora: h.hora,
						// Convertir array a string JSON, o null si es null/vacío
						diasSemana: h.diasSemana && h.diasSemana.length > 0
							? JSON.stringify(h.diasSemana)
							: null
					}))
				};

				const medicamentoCreado = await medicamentosAPI.crear(medicamentoData);

				// Programar notificaciones para cada horario
				try {
					for (const horario of formMedicamento.horarios) {
						await NotificationService.programarNotificacionMedicamento({
							id: medicamentoCreado.id,
							nombre: formMedicamento.nombre,
							horaProgramada: horario.hora
						});
					}
					console.log('Notificaciones programadas para medicamento');
				} catch (notifError) {
					console.warn('No se pudieron programar las notificaciones:', notifError);
				}
			} else {
				// Validar cita
				if (!validarCita()) {
					setLoading(false);
					return;
				}

				// Crear cita médica
				const citaData = {
					pacienteId: parseInt(pacienteId),
					fechaHora: formCita.fechaHora,
					ubicacion: formCita.ubicacion.trim() || null,
					nombreDoctor: formCita.nombreDoctor.trim() || null,
					especialidad: formCita.especialidad.trim() || null,
					motivo: formCita.motivo.trim() || null,
					observaciones: formCita.observaciones.trim() || null
				};

				const citaCreada = await citasAPI.crear(citaData);

				// Programar notificación 1 hora antes
				try {
					await NotificationService.programarNotificacionCita({
						id: citaCreada.id,
						titulo: formCita.motivo || 'Cita médica',
						fechaHora: citaCreada.fechaHora,
						lugar: formCita.ubicacion
					});
					console.log('Notificación programada para cita médica');
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
			setError('No se pudo crear el recordatorio: ' + (err.response?.data?.message || err.message));
		} finally {
			setLoading(false);
		}
	};

	const resetFormulario = () => {
		setFormMedicamento({
			nombre: "",
			dosis: "",
			frecuencia: "",
			viaAdministracion: "",
			fechaInicio: "",
			fechaFin: "",
			observaciones: "",
			horarios: [{ hora: "", diasSemana: null }]
		});
		setFormCita({
			fechaHora: "",
			ubicacion: "",
			nombreDoctor: "",
			especialidad: "",
			motivo: "",
			observaciones: ""
		});
		setTipoRecordatorio("MEDICAMENTO");
		setErroresValidacion({});
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
			default: return "estado-pendiente";
		}
	};

	const obtenerIconoTipo = (tipo) => {
		return tipo === "MEDICAMENTO" ? "💊" : "📅";
	};

	// Días de la semana para el selector
	const diasSemana = [
		{ valor: "LUNES", label: "L" },
		{ valor: "MARTES", label: "M" },
		{ valor: "MIERCOLES", label: "X" },
		{ valor: "JUEVES", label: "J" },
		{ valor: "VIERNES", label: "V" },
		{ valor: "SABADO", label: "S" },
		{ valor: "DOMINGO", label: "D" }
	];

	return (
		<div className="recordatorios-container">
			{/* Mensaje de error */}
			{error && (
				<div className="alert alert-error">
					{error}
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
						ℹ️
					</button>
				</div>

				<button
					className="btn-añadir-recordatorio"
					onClick={() => setMostrarFormulario(!mostrarFormulario)}
					disabled={loading}
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
					<p className="formulario-subtitulo">Para {pacienteSeleccionado?.nombre || "el paciente"}</p>

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

						{/* FORMULARIO DE MEDICAMENTO */}
						{tipoRecordatorio === "MEDICAMENTO" && (
							<>
								{/* Nombre del medicamento */}
								<div className="form-group">
									<label>
										Nombre del medicamento <span className="campo-obligatorio">*</span>
									</label>
									<input
										type="text"
										name="nombre"
										className={`input ${erroresValidacion.nombre ? 'input-error' : ''}`}
										value={formMedicamento.nombre}
										onChange={handleInputChangeMedicamento}
										placeholder="Ej: Losartán"
									/>
									{erroresValidacion.nombre && (
										<span className="mensaje-error">{erroresValidacion.nombre}</span>
									)}
								</div>

								{/* Dosis */}
								<div className="form-group">
									<label>
										Dosis <span className="campo-opcional">(opcional)</span>
									</label>
									<input
										type="text"
										name="dosis"
										className="input"
										value={formMedicamento.dosis}
										onChange={handleInputChangeMedicamento}
										placeholder="Ej: 50mg, 1 comprimido"
									/>
								</div>

								{/* Frecuencia */}
								<div className="form-group">
									<label>
										Frecuencia <span className="campo-opcional">(opcional)</span>
									</label>
									<input
										type="text"
										name="frecuencia"
										className="input"
										value={formMedicamento.frecuencia}
										onChange={handleInputChangeMedicamento}
										placeholder="Ej: Cada 8 horas, 2 veces al día"
									/>
								</div>

								{/* Vía de administración */}
								<div className="form-group">
									<label>
										Vía de administración <span className="campo-opcional">(opcional)</span>
									</label>
									<select
										name="viaAdministracion"
										className="input"
										value={formMedicamento.viaAdministracion}
										onChange={handleInputChangeMedicamento}
									>
										<option value="">Seleccionar...</option>
										<option value="Oral">Oral</option>
										<option value="Sublingual">Sublingual</option>
										<option value="Tópica">Tópica</option>
										<option value="Intravenosa">Intravenosa</option>
										<option value="Intramuscular">Intramuscular</option>
										<option value="Subcutánea">Subcutánea</option>
										<option value="Inhalatoria">Inhalatoria</option>
										<option value="Rectal">Rectal</option>
										<option value="Oftálmica">Oftálmica</option>
										<option value="Ótica">Ótica</option>
										<option value="Nasal">Nasal</option>
										<option value="Transdérmica">Transdérmica</option>
									</select>
								</div>

								{/* Fechas inicio y fin */}
								<div className="form-row">
									<div className="form-group">
										<label>
											Fecha inicio <span className="campo-obligatorio">*</span>
										</label>
										<input
											type="date"
											name="fechaInicio"
											className={`input ${erroresValidacion.fechaInicio ? 'input-error' : ''}`}
											value={formMedicamento.fechaInicio}
											onChange={handleInputChangeMedicamento}
										/>
										{erroresValidacion.fechaInicio && (
											<span className="mensaje-error">{erroresValidacion.fechaInicio}</span>
										)}
									</div>

									<div className="form-group">
										<label>
											Fecha fin <span className="campo-obligatorio">*</span>
										</label>
										<input
											type="date"
											name="fechaFin"
											className={`input ${erroresValidacion.fechaFin ? 'input-error' : ''}`}
											value={formMedicamento.fechaFin}
											onChange={handleInputChangeMedicamento}
										/>
										{erroresValidacion.fechaFin && (
											<span className="mensaje-error">{erroresValidacion.fechaFin}</span>
										)}
									</div>
								</div>

								{/* Observaciones */}
								<div className="form-group">
									<label>
										Observaciones <span className="campo-opcional">(opcional)</span>
									</label>
									<textarea
										name="observaciones"
										className="input textarea"
										value={formMedicamento.observaciones}
										onChange={handleInputChangeMedicamento}
										placeholder="Notas adicionales sobre el medicamento..."
										rows="3"
									/>
								</div>

								{/* Horarios */}
								<div className="form-group">
									<label>
										Horarios <span className="campo-obligatorio">*</span>
									</label>
									{erroresValidacion.horarios && (
										<span className="mensaje-error">{erroresValidacion.horarios}</span>
									)}

									{formMedicamento.horarios.map((horario, index) => (
										<div key={index} className="horario-item">
											<div className="horario-header">
												<span className="horario-numero">Horario {index + 1}</span>
												{formMedicamento.horarios.length > 1 && (
													<button
														type="button"
														className="btn-eliminar-horario"
														onClick={() => eliminarHorario(index)}
													>
														✕
													</button>
												)}
											</div>

											<div className="form-group">
												<label>Hora</label>
												<input
													type="time"
													className="input"
													value={horario.hora}
													onChange={(e) => handleHorarioChange(index, 'hora', e.target.value)}
												/>
											</div>

											<div className="form-group">
												<label>
													Días de la semana <span className="campo-opcional">(opcional - si vacío: todos los días)</span>
												</label>
												<div className="dias-semana-selector">
													{diasSemana.map(dia => (
														<button
															key={dia.valor}
															type="button"
															className={`btn-dia ${
																horario.diasSemana === null || horario.diasSemana?.includes(dia.valor) ? 'active' : ''
															}`}
															onClick={() => handleDiasSemanaChange(index, dia.valor)}
															title={dia.valor}
														>
															{dia.label}
														</button>
													))}
												</div>
												<p className="ayuda-texto">
													{horario.diasSemana === null
														? "Todos los días"
														: horario.diasSemana.length === 0
															? "Todos los días"
															: `${horario.diasSemana.length} día${horario.diasSemana.length > 1 ? 's' : ''} seleccionado${horario.diasSemana.length > 1 ? 's' : ''}`
													}
												</p>
											</div>
										</div>
									))}

									<button
										type="button"
										className="btn-agregar-horario"
										onClick={agregarHorario}
									>
										+ Agregar otro horario
									</button>
								</div>
							</>
						)}

						{/* FORMULARIO DE CITA MÉDICA */}
						{tipoRecordatorio === "CITA_MEDICA" && (
							<>
								{/* Fecha y hora */}
								<div className="form-group">
									<label>
										Fecha y hora <span className="campo-obligatorio">*</span>
									</label>
									<input
										type="datetime-local"
										name="fechaHora"
										className={`input ${erroresValidacion.fechaHora ? 'input-error' : ''}`}
										value={formCita.fechaHora}
										onChange={handleInputChangeCita}
									/>
									{erroresValidacion.fechaHora && (
										<span className="mensaje-error">{erroresValidacion.fechaHora}</span>
									)}
								</div>

								{/* Ubicación */}
								<div className="form-group">
									<label>
										Ubicación <span className="campo-opcional">(opcional)</span>
									</label>
									<input
										type="text"
										name="ubicacion"
										className="input"
										value={formCita.ubicacion}
										onChange={handleInputChangeCita}
										placeholder="Ej: Hospital Alemán, Sala 3"
									/>
								</div>

								{/* Nombre del doctor */}
								<div className="form-group">
									<label>
										Nombre del doctor <span className="campo-opcional">(opcional)</span>
									</label>
									<input
										type="text"
										name="nombreDoctor"
										className="input"
										value={formCita.nombreDoctor}
										onChange={handleInputChangeCita}
										placeholder="Ej: Dr. García"
									/>
								</div>

								{/* Especialidad */}
								<div className="form-group">
									<label>
										Especialidad <span className="campo-opcional">(opcional)</span>
									</label>
									<input
										type="text"
										name="especialidad"
										className="input"
										value={formCita.especialidad}
										onChange={handleInputChangeCita}
										placeholder="Ej: Cardiología, Traumatología"
									/>
								</div>

								{/* Motivo */}
								<div className="form-group">
									<label>
										Motivo <span className="campo-opcional">(opcional)</span>
									</label>
									<textarea
										name="motivo"
										className="input textarea"
										value={formCita.motivo}
										onChange={handleInputChangeCita}
										placeholder="Motivo de la consulta..."
										rows="3"
									/>
								</div>

								{/* Observaciones */}
								<div className="form-group">
									<label>
										Observaciones <span className="campo-opcional">(opcional)</span>
									</label>
									<textarea
										name="observaciones"
										className="input textarea"
										value={formCita.observaciones}
										onChange={handleInputChangeCita}
										placeholder="Notas adicionales sobre la cita..."
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
								disabled={loading}
							>
								{loading ? "Guardando..." : "Añadir recordatorio"}
							</button>
							<button
								type="button"
								className="btn btn-cancelar"
								onClick={() => {
									setMostrarFormulario(false);
									resetFormulario();
								}}
								disabled={loading}
							>
								Cancelar
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Lista de recordatorios */}
			<div className="card lista-recordatorios-card">
				<div className="lista-header">
					<div>
						<h2 className="lista-titulo">Lista de recordatorios</h2>
						<p className="lista-subtitulo">De {pacienteSeleccionado?.nombreCompleto || "el paciente"}</p>
					</div>
					<button
						className="btn-ordenar"
						onClick={toggleOrdenamiento}
						title={ordenAscendente ? "Mostrando: más próximos primero" : "Mostrando: más lejanos primero"}
					>
						{ordenAscendente ? "📅 ↑" : "📅 ↓"}
					</button>
				</div>

				<div className="recordatorios-lista">
					{loading && recordatorios.length === 0 ? (
						<div className="mensaje-loading">
							<div className="spinner"></div>
							<p>Cargando recordatorios...</p>
						</div>
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
											{recordatorio.descripcion || recordatorio.nombre || "Sin descripción"}
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
			</div>

			{/* Modal de confirmación de eliminación */}
			{recordatorioAEliminar && (
				<div className="modal-overlay" onClick={() => setRecordatorioAEliminar(null)}>
					<div className="modal-confirmar" onClick={(e) => e.stopPropagation()}>
						<h3>Confirmar eliminación</h3>
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
