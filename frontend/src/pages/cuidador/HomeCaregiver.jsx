import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	IoMedkitOutline,
	IoCheckboxOutline,
	IoCalendarOutline,
	IoClipboardOutline,
	IoChevronForwardOutline,
	IoCheckmarkCircle,
	IoEllipseOutline,
	IoTimeOutline,
} from 'react-icons/io5';
import { usePaciente } from '../../context/PacienteContext';
import {
	usuariosAPI,
	citasAPI,
	medicamentosAPI,
	tareasAPI,
	bitacorasAPI
} from '../../services/api';
import './HomeCaregiver.css';

export default function HomeCuidador() {
	const navigate = useNavigate();
	const { pacienteSeleccionado } = usePaciente();

	const [cuidadorNombre, setCuidadorNombre] = useState('');
	const [citasHoy, setCitasHoy] = useState([]);
	const [medicamentosHoy, setMedicamentosHoy] = useState([]);
	const [tareasHoy, setTareasHoy] = useState([]);
	const [bitacoraHoy, setBitacoraHoy] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		cargarDatos();
	}, [pacienteSeleccionado]);

	const cargarDatos = async () => {
		try {
			setLoading(true);
			setError(null);

			// Cargar nombre del cuidador
			const usuario = await usuariosAPI.getMe();
			setCuidadorNombre(usuario.nombreCompleto || 'Cuidador');

			if (!pacienteSeleccionado) {
				setLoading(false);
				return;
			}

			// Cargar todas las secciones del día de hoy
			await Promise.all([
				cargarCitasHoy(),
				cargarMedicamentosHoy(),
				cargarTareasHoy(),
				cargarBitacoraHoy(),
			]);
		} catch (err) {
			console.error('Error al cargar datos del home:', err);
			setError('Error al cargar la información');
		} finally {
			setLoading(false);
		}
	};

	// Función auxiliar para comparar fechas (solo día, mes, año)
	const esMismaFecha = (fecha1, fecha2) => {
		const d1 = new Date(fecha1);
		const d2 = new Date(fecha2);
		return (
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate()
		);
	};

	const cargarCitasHoy = async () => {
		try {
			const hoy = new Date();
			const todasLasCitas = await citasAPI.getByPaciente(pacienteSeleccionado.id);

			// Filtrar citas de hoy
			const citasDeHoy = todasLasCitas.filter((cita) => {
				if (!cita.fechaHora) return false;
				return esMismaFecha(cita.fechaHora, hoy);
			});

			// Ordenar por hora
			citasDeHoy.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

			setCitasHoy(citasDeHoy);
		} catch (err) {
			console.error('Error al cargar citas:', err);
			setCitasHoy([]);
		}
	};

	const cargarMedicamentosHoy = async () => {
		try {
			const hoy = new Date();
			const diaSemanaNombre = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][hoy.getDay()];
			const fechaHoy = hoy.toISOString().split('T')[0];

			const todosMedicamentos = await medicamentosAPI.getByPaciente(
				pacienteSeleccionado.id,
				true // Solo activos
			);

			// Filtrar medicamentos que aplican hoy
			const medicamentosHoyTemp = todosMedicamentos.filter((med) => {
				// Verificar que esté en el rango de fechas
				if (med.fechaInicio && fechaHoy < med.fechaInicio) return false;
				if (med.fechaFin && fechaHoy > med.fechaFin) return false;

				// Verificar que tenga horarios para el día de hoy
				if (!med.horarios || med.horarios.length === 0) return false;

				return med.horarios.some((horario) =>
					horario.diasSemana && horario.diasSemana.includes(diaSemanaNombre)
				);
			});

			// Para cada medicamento, filtrar solo los horarios de hoy
			const medicamentosConHorariosHoy = medicamentosHoyTemp.map((med) => ({
				...med,
				horariosHoy: med.horarios
					.filter((h) => h.diasSemana && h.diasSemana.includes(diaSemanaNombre))
					.sort((a, b) => {
						const timeA = a.hora.split(':').map(Number);
						const timeB = b.hora.split(':').map(Number);
						return timeA[0] - timeB[0] || timeA[1] - timeB[1];
					}),
			}));

			setMedicamentosHoy(medicamentosConHorariosHoy);
		} catch (err) {
			console.error('Error al cargar medicamentos:', err);
			setMedicamentosHoy([]);
		}
	};

	const cargarTareasHoy = async () => {
		try {
			const hoy = new Date();
			const todasLasTareas = await tareasAPI.getByPaciente(pacienteSeleccionado.id);

			// Filtrar tareas de hoy que no están completadas
			const tareasDeHoy = todasLasTareas.filter((tarea) => {
				// Solo tareas no completadas
				if (tarea.completada) return false;

				// Si tiene fecha de vencimiento, debe ser hoy
				if (tarea.fechaVencimiento) {
					return esMismaFecha(tarea.fechaVencimiento, hoy);
				}

				// Si no tiene fecha, no mostrar en "hoy"
				return false;
			});

			// Ordenar por prioridad y luego por hora
			tareasDeHoy.sort((a, b) => {
				const prioridadOrden = { ALTA: 0, MEDIA: 1, BAJA: 2 };
				const prioA = prioridadOrden[a.prioridad] || 3;
				const prioB = prioridadOrden[b.prioridad] || 3;

				if (prioA !== prioB) return prioA - prioB;

				// Si tienen la misma prioridad, ordenar por fecha
				if (a.fechaVencimiento && b.fechaVencimiento) {
					return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
				}

				return 0;
			});

			setTareasHoy(tareasDeHoy);
		} catch (err) {
			console.error('Error al cargar tareas:', err);
			setTareasHoy([]);
		}
	};

	const cargarBitacoraHoy = async () => {
		try {
			const hoy = new Date();
			const todasLasBitacoras = await bitacorasAPI.getByPaciente(pacienteSeleccionado.id);

			// Filtrar bitácoras de hoy
			const bitacorasDeHoy = todasLasBitacoras.filter((bitacora) => {
				if (!bitacora.fecha) return false;
				return esMismaFecha(bitacora.fecha, hoy);
			});

			// Tomar la más reciente
			if (bitacorasDeHoy.length > 0) {
				bitacorasDeHoy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
				setBitacoraHoy(bitacorasDeHoy[0]);
			} else {
				setBitacoraHoy(null);
			}
		} catch (err) {
			console.error('Error al cargar bitácora:', err);
			setBitacoraHoy(null);
		}
	};

	const handleToggleTarea = async (tareaId) => {
		try {
			await tareasAPI.toggleCompletada(tareaId);
			await cargarTareasHoy();
		} catch (err) {
			console.error('Error al cambiar estado de tarea:', err);
			alert('Error al cambiar el estado de la tarea');
		}
	};

	const formatearHora = (fechaStr) => {
		if (!fechaStr) return '';
		const fecha = new Date(fechaStr);
		const horas = String(fecha.getHours()).padStart(2, '0');
		const minutos = String(fecha.getMinutes()).padStart(2, '0');
		return `${horas}:${minutos}`;
	};

	const formatearHoraSimple = (horaStr) => {
		if (!horaStr) return '';
		const [horas, minutos] = horaStr.split(':');
		return `${horas}:${minutos}`;
	};

	const truncarTexto = (texto, maxLineas = 2) => {
		if (!texto) return '';
		const palabras = texto.split(' ');
		if (palabras.length <= 20) return texto;
		return palabras.slice(0, 20).join(' ') + '...';
	};

	const getPrioridadColor = (prioridad) => {
		const colores = {
			ALTA: { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
			MEDIA: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
			BAJA: { bg: '#DBEAFE', text: '#2563EB', border: '#93C5FD' },
		};
		return colores[prioridad] || colores.BAJA;
	};

	if (loading) {
		return (
			<div className="home-container">
				<p className="mensaje-loading">Cargando información...</p>
			</div>
		);
	}

	if (!pacienteSeleccionado) {
		return (
			<div className="home-container">
				<div className="home-welcome-card">
					<h1 className="home-welcome-titulo">¡Hola, {cuidadorNombre}!</h1>
					<p className="home-welcome-texto">
						Por favor, selecciona un paciente en el menú superior para ver las actividades del día.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="home-container">
			{/* Header con saludo personalizado */}
			<div className="home-header-card">
				<h1 className="home-saludo">¡Hola, {cuidadorNombre}!</h1>
				<p className="home-paciente">
					Paciente: <strong>{pacienteSeleccionado.nombreCompleto}</strong>
				</p>
			</div>

			{error && <div className="mensaje-error">{error}</div>}

			{/* Sección: Citas médicas de hoy */}
			<div className="home-seccion-card">
				<div className="seccion-header">
					<div className="seccion-header-left">
						<IoCalendarOutline className="seccion-icono" />
						<h2 className="seccion-titulo">Citas médicas de hoy</h2>
					</div>
					{citasHoy.length > 0 && (
						<button
							className="btn-ver-mas"
							onClick={() => navigate('/recordatorios')}
							aria-label="Ver todas las citas"
						>
							<span>Ver todo</span>
							<IoChevronForwardOutline />
						</button>
					)}
				</div>

				{citasHoy.length === 0 ? (
					<div className="estado-vacio">
						<IoCalendarOutline className="estado-vacio-icono" />
						<p className="estado-vacio-texto">No hay citas médicas para hoy</p>
					</div>
				) : (
					<div className="tarjetas-lista">
						{citasHoy.map((cita) => (
							<div
								key={cita.id}
								className="tarjeta-item"
								onClick={() => navigate('/recordatorios')}
							>
								<div className="tarjeta-hora-badge">
									<IoTimeOutline />
									<span>{formatearHora(cita.fechaHora)} hs</span>
								</div>
								<div className="tarjeta-contenido">
									<h3 className="tarjeta-titulo">Dr. {cita.nombreDoctor}</h3>
									<p className="tarjeta-subtitulo">{cita.especialidad}</p>
									{cita.ubicacion && (
										<p className="tarjeta-detalle">{cita.ubicacion}</p>
									)}
								</div>
								<IoChevronForwardOutline className="tarjeta-icono-nav" />
							</div>
						))}
					</div>
				)}
			</div>

			{/* Sección: Medicamentos de hoy */}
			<div className="home-seccion-card">
				<div className="seccion-header">
					<div className="seccion-header-left">
						<IoMedkitOutline className="seccion-icono" />
						<h2 className="seccion-titulo">Medicamentos de hoy</h2>
					</div>
					{medicamentosHoy.length > 0 && (
						<button
							className="btn-ver-mas"
							onClick={() => navigate('/recordatorios')}
							aria-label="Ver todos los medicamentos"
						>
							<span>Ver todo</span>
							<IoChevronForwardOutline />
						</button>
					)}
				</div>

				{medicamentosHoy.length === 0 ? (
					<div className="estado-vacio">
						<IoMedkitOutline className="estado-vacio-icono" />
						<p className="estado-vacio-texto">No hay medicamentos para hoy</p>
					</div>
				) : (
					<div className="tarjetas-lista">
						{medicamentosHoy.map((med) => (
							<div
								key={med.id}
								className="tarjeta-item"
								onClick={() => navigate('/recordatorios')}
							>
								<div className="tarjeta-contenido">
									<h3 className="tarjeta-titulo">{med.nombre}</h3>
									<p className="tarjeta-subtitulo">Dosis: {med.dosis}</p>
									<div className="medicamento-horarios">
										{med.horariosHoy && med.horariosHoy.map((horario, idx) => (
											<span key={idx} className="horario-badge">
												{formatearHoraSimple(horario.hora)}
											</span>
										))}
									</div>
									{med.viaAdministracion && (
										<p className="tarjeta-detalle">Vía: {med.viaAdministracion}</p>
									)}
								</div>
								<IoChevronForwardOutline className="tarjeta-icono-nav" />
							</div>
						))}
					</div>
				)}
			</div>

			{/* Sección: Tareas pendientes de hoy */}
			<div className="home-seccion-card">
				<div className="seccion-header">
					<div className="seccion-header-left">
						<IoCheckboxOutline className="seccion-icono" />
						<h2 className="seccion-titulo">Tareas pendientes de hoy</h2>
					</div>
					{tareasHoy.length > 0 && (
						<button
							className="btn-ver-mas"
							onClick={() => navigate('/tareas')}
							aria-label="Ver todas las tareas"
						>
							<span>Ver todo</span>
							<IoChevronForwardOutline />
						</button>
					)}
				</div>

				{tareasHoy.length === 0 ? (
					<div className="estado-vacio">
						<IoCheckboxOutline className="estado-vacio-icono" />
						<p className="estado-vacio-texto">No hay tareas pendientes para hoy</p>
					</div>
				) : (
					<div className="tarjetas-lista">
						{tareasHoy.map((tarea) => {
							const colorPrioridad = getPrioridadColor(tarea.prioridad);
							return (
								<div key={tarea.id} className="tarjeta-item tarjeta-tarea">
									<button
										className="tarea-checkbox-btn"
										onClick={(e) => {
											e.stopPropagation();
											handleToggleTarea(tarea.id);
										}}
										title="Marcar como completada"
									>
										{tarea.completada ? (
											<IoCheckmarkCircle className="checkbox-completada" />
										) : (
											<IoEllipseOutline className="checkbox-pendiente" />
										)}
									</button>
									<div
										className="tarjeta-contenido"
										onClick={() => navigate('/tareas')}
									>
										<h3 className="tarjeta-titulo">{tarea.titulo}</h3>
										{tarea.descripcion && (
											<p className="tarjeta-subtitulo">{truncarTexto(tarea.descripcion, 1)}</p>
										)}
										<div className="tarea-footer">
											<span
												className="prioridad-badge"
												style={{
													backgroundColor: colorPrioridad.bg,
													color: colorPrioridad.text,
													borderColor: colorPrioridad.border,
												}}
											>
												{tarea.prioridad}
											</span>
											{tarea.fechaVencimiento && (
												<span className="tarea-hora">
													{formatearHora(tarea.fechaVencimiento)}
												</span>
											)}
										</div>
									</div>
									<IoChevronForwardOutline className="tarjeta-icono-nav" />
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Sección: Bitácora de hoy */}
			<div className="home-seccion-card">
				<div className="seccion-header">
					<div className="seccion-header-left">
						<IoClipboardOutline className="seccion-icono" />
						<h2 className="seccion-titulo">Bitácora de hoy</h2>
					</div>
					{bitacoraHoy && (
						<button
							className="btn-ver-mas"
							onClick={() => navigate('/bitacora')}
							aria-label="Ver bitácora completa"
						>
							<span>Ver todo</span>
							<IoChevronForwardOutline />
						</button>
					)}
				</div>

				{!bitacoraHoy ? (
					<div className="estado-vacio">
						<IoClipboardOutline className="estado-vacio-icono" />
						<p className="estado-vacio-texto">No hay entradas de bitácora para hoy</p>
					</div>
				) : (
					<div className="tarjeta-item" onClick={() => navigate('/bitacora')}>
						<div className="tarjeta-contenido">
							<h3 className="tarjeta-titulo">
								{bitacoraHoy.titulo || 'Entrada del día'}
							</h3>
							{bitacoraHoy.descripcion && (
								<p className="tarjeta-descripcion">
									{truncarTexto(bitacoraHoy.descripcion, 2)}
								</p>
							)}
							<p className="tarjeta-fecha">
								{formatearHora(bitacoraHoy.createdAt)} hs
							</p>
						</div>
						<IoChevronForwardOutline className="tarjeta-icono-nav" />
					</div>
				)}
			</div>
		</div>
	);
}
