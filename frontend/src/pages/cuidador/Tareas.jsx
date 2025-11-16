import React, { useState, useEffect } from 'react';
import {
	IoAddCircle,
	IoCheckmarkCircle,
	IoEllipseOutline,
	IoCalendarOutline,
	IoAlertCircleOutline,
	IoTrashOutline,
	IoCreateOutline,
	IoArrowUpCircle,
	IoArrowDownCircle,
	IoSwapVerticalOutline,
	IoClose,
} from 'react-icons/io5';
import { tareasAPI } from '../../services/api';
import { usePaciente } from '../../context/PacienteContext';
import './Tareas.css';

export default function Tareas() {
	// Obtener paciente seleccionado del contexto
	const { pacienteSeleccionado } = usePaciente();
	const pacienteId = pacienteSeleccionado?.id;
	const [tareas, setTareas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showModalCrear, setShowModalCrear] = useState(false);
	const [showModalEditar, setShowModalEditar] = useState(false);
	const [showModalEliminar, setShowModalEliminar] = useState(false);
	const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

	// Estados de ordenamiento (3 valores: null, 'ASC', 'DESC')
	const [ordenFecha, setOrdenFecha] = useState(null); // null | 'conFecha' | 'sinFecha'
	const [ordenFechaDir, setOrdenFechaDir] = useState(null); // null | 'ASC' | 'DESC'
	const [ordenPrioridad, setOrdenPrioridad] = useState(null); // null | 'ASC' | 'DESC'

	// Estados de filtros
	const [filtroEstado, setFiltroEstado] = useState('TODAS'); // 'TODAS' | 'COMPLETADAS' | 'PENDIENTES'
	const [filtroRangoInicio, setFiltroRangoInicio] = useState('');
	const [filtroRangoFin, setFiltroRangoFin] = useState('');

	// Modo reordenamiento manual
	const [modoReordenar, setModoReordenar] = useState(false);

	// Form states para crear/editar
	const [formData, setFormData] = useState({
		titulo: '',
		descripcion: '',
		fechaVencimiento: '',
		prioridad: 'MEDIA',
	});

	useEffect(() => {
		cargarTareas();
	}, [pacienteId]);

	const cargarTareas = async () => {
		try {
			setLoading(true);
			const data = await tareasAPI.getByPaciente(pacienteId);
			setTareas(data);
			setError(null);
		} catch (err) {
			setError('Error al cargar las tareas');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	// ============== ORDENAMIENTO Y FILTROS ==============

	const tareasOrdenadas = () => {
		let resultado = [...tareas];

		// Filtro por estado
		if (filtroEstado === 'COMPLETADAS') {
			resultado = resultado.filter((t) => t.completada);
		} else if (filtroEstado === 'PENDIENTES') {
			resultado = resultado.filter((t) => !t.completada);
		}

		// Filtro por rango de fechas
		if (filtroRangoInicio || filtroRangoFin) {
			resultado = resultado.filter((t) => {
				if (!t.fechaVencimiento) return false;
				const fecha = new Date(t.fechaVencimiento);

				if (filtroRangoInicio) {
					const inicio = new Date(filtroRangoInicio);
					if (fecha < inicio) return false;
				}

				if (filtroRangoFin) {
					const fin = new Date(filtroRangoFin);
					fin.setHours(23, 59, 59, 999);
					if (fecha > fin) return false;
				}

				return true;
			});
		}

		// Si no hay ordenamiento automático activo, usar orden manual
		if (!ordenFecha && !ordenFechaDir && !ordenPrioridad) {
			resultado.sort((a, b) => a.ordenManual - b.ordenManual);
			return resultado;
		}

		// Nivel 1: Ordenar por existencia de fecha
		if (ordenFecha) {
			resultado.sort((a, b) => {
				const aFecha = a.fechaVencimiento ? 1 : 0;
				const bFecha = b.fechaVencimiento ? 1 : 0;
				if (ordenFecha === 'conFecha') {
					return bFecha - aFecha; // Con fecha primero
				} else {
					return aFecha - bFecha; // Sin fecha primero
				}
			});
		}

		// Nivel 2: Ordenar por fecha de vencimiento
		if (ordenFechaDir) {
			resultado.sort((a, b) => {
				if (!a.fechaVencimiento && !b.fechaVencimiento) return 0;
				if (!a.fechaVencimiento) return 1;
				if (!b.fechaVencimiento) return -1;

				const fechaA = new Date(a.fechaVencimiento);
				const fechaB = new Date(b.fechaVencimiento);

				return ordenFechaDir === 'ASC' ? fechaA - fechaB : fechaB - fechaA;
			});
		}

		// Nivel 3: Ordenar por prioridad
		if (ordenPrioridad) {
			const prioridadValor = { ALTA: 3, MEDIA: 2, BAJA: 1 };
			resultado.sort((a, b) => {
				const diff = prioridadValor[a.prioridad] - prioridadValor[b.prioridad];
				return ordenPrioridad === 'ASC' ? diff : -diff;
			});
		}

		return resultado;
	};

	// Ciclar estados de ordenamiento (null -> ASC -> DESC -> null)
	const ciclarOrdenFecha = () => {
		if (!ordenFecha) setOrdenFecha('conFecha');
		else if (ordenFecha === 'conFecha') setOrdenFecha('sinFecha');
		else setOrdenFecha(null);
	};

	const ciclarOrdenFechaDir = () => {
		if (!ordenFechaDir) setOrdenFechaDir('ASC');
		else if (ordenFechaDir === 'ASC') setOrdenFechaDir('DESC');
		else setOrdenFechaDir(null);
	};

	const ciclarOrdenPrioridad = () => {
		if (!ordenPrioridad) setOrdenPrioridad('ASC');
		else if (ordenPrioridad === 'ASC') setOrdenPrioridad('DESC');
		else setOrdenPrioridad(null);
	};

	// ============== CRUD OPERATIONS ==============

	const handleCrearTarea = async () => {
		try {
			if (!formData.titulo.trim()) {
				alert('El título es obligatorio');
				return;
			}

			const tareaData = {
				pacienteId,
				titulo: formData.titulo,
				descripcion: formData.descripcion || null,
				fechaVencimiento: formData.fechaVencimiento || null,
				prioridad: formData.prioridad,
			};

			await tareasAPI.crear(tareaData);
			await cargarTareas();
			setShowModalCrear(false);
			resetForm();
		} catch (err) {
			console.error('Error al crear tarea:', err);
			alert('Error al crear la tarea');
		}
	};

	const handleEditarTarea = async () => {
		try {
			if (!formData.titulo.trim()) {
				alert('El título es obligatorio');
				return;
			}

			const tareaData = {
				pacienteId,
				titulo: formData.titulo,
				descripcion: formData.descripcion || null,
				fechaVencimiento: formData.fechaVencimiento || null,
				prioridad: formData.prioridad,
			};

			await tareasAPI.actualizar(tareaSeleccionada.id, tareaData);
			await cargarTareas();
			setShowModalEditar(false);
			setTareaSeleccionada(null);
			resetForm();
		} catch (err) {
			console.error('Error al editar tarea:', err);
			alert('Error al editar la tarea');
		}
	};

	const handleToggleTarea = async (tareaId) => {
		try {
			await tareasAPI.toggleCompletada(tareaId);
			await cargarTareas();
		} catch (err) {
			console.error('Error al cambiar estado:', err);
			alert('Error al cambiar el estado de la tarea');
		}
	};

	const handleEliminarTarea = async () => {
		try {
			await tareasAPI.eliminar(tareaSeleccionada.id);
			await cargarTareas();
			setShowModalEliminar(false);
			setTareaSeleccionada(null);
		} catch (err) {
			console.error('Error al eliminar tarea:', err);
			alert('Error al eliminar la tarea');
		}
	};

	const handleMoverArriba = async (tareaId) => {
		try {
			await tareasAPI.moverArriba(tareaId);
			await cargarTareas();
		} catch (err) {
			console.error('Error al mover tarea:', err);
			alert('Error al mover la tarea');
		}
	};

	const handleMoverAbajo = async (tareaId) => {
		try {
			await tareasAPI.moverAbajo(tareaId);
			await cargarTareas();
		} catch (err) {
			console.error('Error al mover tarea:', err);
			alert('Error al mover la tarea');
		}
	};

	// ============== HELPERS ==============

	const resetForm = () => {
		setFormData({
			titulo: '',
			descripcion: '',
			fechaVencimiento: '',
			prioridad: 'MEDIA',
		});
	};

	const abrirModalEditar = (tarea) => {
		setTareaSeleccionada(tarea);
		setFormData({
			titulo: tarea.titulo,
			descripcion: tarea.descripcion || '',
			fechaVencimiento: tarea.fechaVencimiento
				? new Date(tarea.fechaVencimiento).toISOString().slice(0, 16)
				: '',
			prioridad: tarea.prioridad,
		});
		setShowModalEditar(true);
	};

	const abrirModalEliminar = (tarea) => {
		setTareaSeleccionada(tarea);
		setShowModalEliminar(true);
	};

	const formatearFecha = (fechaStr) => {
		if (!fechaStr) return null;

		const fecha = new Date(fechaStr);
		const ahora = new Date();
		const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
		const fechaSolo = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

		const diffMs = fechaSolo - hoy;
		const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDias < 0) {
			// Fecha pasada (expirada)
			const diasAtras = Math.abs(diffDias);
			return `Venció hace ${diasAtras} ${diasAtras === 1 ? 'día' : 'días'}`;
		} else if (diffDias === 0) {
			// Hoy
			return 'Vence hoy';
		} else {
			// Fecha futura (formato absoluto)
			const dia = String(fecha.getDate()).padStart(2, '0');
			const mes = String(fecha.getMonth() + 1).padStart(2, '0');
			const anio = fecha.getFullYear();
			return `${dia}/${mes}/${anio}`;
		}
	};

	const esTareaExpirada = (fechaStr) => {
		if (!fechaStr) return false;
		const fecha = new Date(fechaStr);
		const ahora = new Date();
		const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
		const fechaSolo = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
		return fechaSolo < hoy;
	};

	// ============== RENDER ==============

	const tareasFinales = tareasOrdenadas();
	const hayOrdenamientoActivo = ordenFecha || ordenFechaDir || ordenPrioridad;

	return (
		<div className="tareas-container">
			{/* Header */}
			<div className="tareas-header">
				<h1>Lista de Tareas</h1>
				<p className="header-subtitulo">
					Gestiona las tareas del día a día con recordatorios y prioridades
				</p>
			</div>

			{/* Botón Agregar */}
			<button
				className="btn-agregar-tarea"
				onClick={() => setShowModalCrear(true)}
				title="Agregar nueva tarea"
			>
				<IoAddCircle />
			</button>

			{/* Controles de Ordenamiento y Filtros */}
			<div className="controles-container">
				<div className="controles-seccion">
					<h3 className="controles-titulo">Ordenamiento</h3>
					<div className="controles-buttons">
						<button
							className={`control-btn ${ordenFecha ? 'active' : ''}`}
							onClick={ciclarOrdenFecha}
							title="Ordenar por existencia de fecha"
						>
							<IoCalendarOutline />
							<span>
								{!ordenFecha
									? 'Fecha: Off'
									: ordenFecha === 'conFecha'
									? 'Con Fecha ↑'
									: 'Sin Fecha ↑'}
							</span>
						</button>

						<button
							className={`control-btn ${ordenFechaDir ? 'active' : ''}`}
							onClick={ciclarOrdenFechaDir}
							title="Ordenar por fecha de vencimiento"
						>
							<IoCalendarOutline />
							<span>
								{!ordenFechaDir
									? 'Orden Fecha: Off'
									: ordenFechaDir === 'ASC'
									? 'Fecha ↑'
									: 'Fecha ↓'}
							</span>
						</button>

						<button
							className={`control-btn ${ordenPrioridad ? 'active' : ''}`}
							onClick={ciclarOrdenPrioridad}
							title="Ordenar por prioridad"
						>
							<IoAlertCircleOutline />
							<span>
								{!ordenPrioridad
									? 'Prioridad: Off'
									: ordenPrioridad === 'ASC'
									? 'Prioridad ↓'
									: 'Prioridad ↑'}
							</span>
						</button>

						<button
							className={`control-btn ${modoReordenar ? 'active' : ''}`}
							onClick={() => setModoReordenar(!modoReordenar)}
							disabled={hayOrdenamientoActivo}
							title={
								hayOrdenamientoActivo
									? 'Desactiva los ordenamientos para reordenar manualmente'
									: 'Activar modo reordenamiento manual'
							}
						>
							<IoSwapVerticalOutline />
							<span>Reordenar</span>
						</button>
					</div>
				</div>

				<div className="controles-seccion">
					<h3 className="controles-titulo">Filtros</h3>
					<div className="filtros">
						<div className="filtro-estado">
							<button
								className={`filtro-btn ${filtroEstado === 'TODAS' ? 'active' : ''}`}
								onClick={() => setFiltroEstado('TODAS')}
							>
								Todas
							</button>
							<button
								className={`filtro-btn ${filtroEstado === 'PENDIENTES' ? 'active' : ''}`}
								onClick={() => setFiltroEstado('PENDIENTES')}
							>
								Pendientes
							</button>
							<button
								className={`filtro-btn ${filtroEstado === 'COMPLETADAS' ? 'active' : ''}`}
								onClick={() => setFiltroEstado('COMPLETADAS')}
							>
								Completadas
							</button>
						</div>

						<div className="filtro-rango">
							<input
								type="date"
								className="input-fecha"
								value={filtroRangoInicio}
								onChange={(e) => setFiltroRangoInicio(e.target.value)}
								placeholder="Desde"
							/>
							<span className="filtro-separador">—</span>
							<input
								type="date"
								className="input-fecha"
								value={filtroRangoFin}
								onChange={(e) => setFiltroRangoFin(e.target.value)}
								placeholder="Hasta"
							/>
							{(filtroRangoInicio || filtroRangoFin) && (
								<button
									className="btn-limpiar-filtro"
									onClick={() => {
										setFiltroRangoInicio('');
										setFiltroRangoFin('');
									}}
								>
									<IoClose />
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Lista de Tareas */}
			<div className="tareas-contenido">
				{loading && <p className="mensaje-loading">Cargando tareas...</p>}

				{error && <p className="mensaje-error">{error}</p>}

				{!loading && !error && tareasFinales.length === 0 && (
					<div className="mensaje-vacio">
						<IoCheckmarkCircle />
						<p>No hay tareas para mostrar</p>
						<p className="mensaje-vacio-secundario">
							Crea una nueva tarea usando el botón de arriba
						</p>
					</div>
				)}

				{!loading && !error && tareasFinales.length > 0 && (
					<div className="tareas-lista">
						{tareasFinales.map((tarea, index) => {
							const expirada = esTareaExpirada(tarea.fechaVencimiento) && !tarea.completada;

							return (
								<div
									key={tarea.id}
									className={`tarea-item ${tarea.completada ? 'completada' : ''} ${
										expirada ? 'expirada' : ''
									}`}
								>
									{/* Checkbox */}
									<div className="tarea-checkbox">
										<button
											className="checkbox-btn"
											onClick={() => handleToggleTarea(tarea.id)}
											title={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
										>
											{tarea.completada ? (
												<IoCheckmarkCircle className="icon-completada" />
											) : (
												<IoEllipseOutline className="icon-pendiente" />
											)}
										</button>
									</div>

									{/* Contenido */}
									<div className="tarea-contenido">
										<h3 className="tarea-titulo">{tarea.titulo}</h3>

										{tarea.descripcion && (
											<p className="tarea-descripcion">{tarea.descripcion}</p>
										)}

										<div className="tarea-meta">
											{tarea.fechaVencimiento && (
												<div className="meta-item meta-fecha">
													<IoCalendarOutline />
													<span>{formatearFecha(tarea.fechaVencimiento)}</span>
												</div>
											)}

											<div
												className={`meta-item meta-prioridad prioridad-${tarea.prioridad.toLowerCase()}`}
											>
												<IoAlertCircleOutline />
												<span>{tarea.prioridad}</span>
											</div>
										</div>
									</div>

									{/* Acciones */}
									<div className="tarea-acciones">
										{modoReordenar && !hayOrdenamientoActivo && (
											<>
												<button
													className="btn-accion btn-reordenar"
													onClick={() => handleMoverArriba(tarea.id)}
													disabled={index === 0}
													title="Mover arriba"
												>
													<IoArrowUpCircle />
												</button>
												<button
													className="btn-accion btn-reordenar"
													onClick={() => handleMoverAbajo(tarea.id)}
													disabled={index === tareasFinales.length - 1}
													title="Mover abajo"
												>
													<IoArrowDownCircle />
												</button>
											</>
										)}

										<button
											className="btn-accion btn-editar"
											onClick={() => abrirModalEditar(tarea)}
											title="Editar tarea"
										>
											<IoCreateOutline />
										</button>

										<button
											className="btn-accion btn-eliminar"
											onClick={() => abrirModalEliminar(tarea)}
											title="Eliminar tarea"
										>
											<IoTrashOutline />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Modal Crear Tarea */}
			{showModalCrear && (
				<div className="modal-overlay" onClick={() => setShowModalCrear(false)}>
					<div className="modal-tarea" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Nueva Tarea</h2>
							<button className="btn-cerrar-modal" onClick={() => setShowModalCrear(false)}>
								<IoClose />
							</button>
						</div>

						<div className="modal-body">
							<div className="form-group">
								<label>
									Título <span className="required">*</span>
								</label>
								<input
									type="text"
									className="input"
									value={formData.titulo}
									onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
									placeholder="Ej: Comprar medicamentos"
									maxLength={255}
								/>
							</div>

							<div className="form-group">
								<label>Descripción</label>
								<textarea
									className="input textarea"
									value={formData.descripcion}
									onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
									placeholder="Detalles adicionales (opcional)"
									rows={3}
								/>
							</div>

							<div className="form-group">
								<label>Fecha de vencimiento</label>
								<input
									type="datetime-local"
									className="input"
									value={formData.fechaVencimiento}
									onChange={(e) =>
										setFormData({ ...formData, fechaVencimiento: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label>Prioridad</label>
								<select
									className="input"
									value={formData.prioridad}
									onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
								>
									<option value="BAJA">Baja</option>
									<option value="MEDIA">Media</option>
									<option value="ALTA">Alta</option>
								</select>
							</div>
						</div>

						<div className="modal-footer">
							<button className="btn btn-cancelar" onClick={() => setShowModalCrear(false)}>
								Cancelar
							</button>
							<button className="btn btn-primary" onClick={handleCrearTarea}>
								Crear Tarea
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal Editar Tarea */}
			{showModalEditar && (
				<div className="modal-overlay" onClick={() => setShowModalEditar(false)}>
					<div className="modal-tarea" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Editar Tarea</h2>
							<button className="btn-cerrar-modal" onClick={() => setShowModalEditar(false)}>
								<IoClose />
							</button>
						</div>

						<div className="modal-body">
							<div className="form-group">
								<label>
									Título <span className="required">*</span>
								</label>
								<input
									type="text"
									className="input"
									value={formData.titulo}
									onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
									placeholder="Ej: Comprar medicamentos"
									maxLength={255}
								/>
							</div>

							<div className="form-group">
								<label>Descripción</label>
								<textarea
									className="input textarea"
									value={formData.descripcion}
									onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
									placeholder="Detalles adicionales (opcional)"
									rows={3}
								/>
							</div>

							<div className="form-group">
								<label>Fecha de vencimiento</label>
								<input
									type="datetime-local"
									className="input"
									value={formData.fechaVencimiento}
									onChange={(e) =>
										setFormData({ ...formData, fechaVencimiento: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label>Prioridad</label>
								<select
									className="input"
									value={formData.prioridad}
									onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
								>
									<option value="BAJA">Baja</option>
									<option value="MEDIA">Media</option>
									<option value="ALTA">Alta</option>
								</select>
							</div>
						</div>

						<div className="modal-footer">
							<button className="btn btn-cancelar" onClick={() => setShowModalEditar(false)}>
								Cancelar
							</button>
							<button className="btn btn-primary" onClick={handleEditarTarea}>
								Guardar Cambios
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal Eliminar Tarea */}
			{showModalEliminar && tareaSeleccionada && (
				<div className="modal-overlay" onClick={() => setShowModalEliminar(false)}>
					<div className="modal-confirmar" onClick={(e) => e.stopPropagation()}>
						<h3>¿Eliminar tarea?</h3>
						<p>
							Estás por eliminar <strong>{tareaSeleccionada.titulo}</strong>
						</p>
						<p className="modal-advertencia">Esta acción no se puede deshacer</p>

						<div className="modal-footer">
							<button className="btn btn-secondary" onClick={() => setShowModalEliminar(false)}>
								Cancelar
							</button>
							<button className="btn btn-danger" onClick={handleEliminarTarea}>
								Eliminar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
