import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	IoMedkitOutline,
	IoCheckmarkCircle,
	IoEllipseOutline,
	IoCalendarOutline,
} from 'react-icons/io5';
import { usePaciente } from '../../context/PacienteContext';
import { usuariosAPI, recordatoriosAPI, tareasAPI } from '../../services/api';
import './HomeCaregiver.css';

export default function HomeCuidador() {
	const navigate = useNavigate();
	const { pacienteSeleccionado } = usePaciente();

	const [cuidadorNombre, setCuidadorNombre] = useState('');
	const [recordatoriosHoy, setRecordatoriosHoy] = useState([]);
	const [tareasPendientes, setTareasPendientes] = useState([]);
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

			// Cargar recordatorios de hoy y mañana
			await cargarRecordatorios();

			// Cargar tareas pendientes (hoy + sin fecha con prioridad ALTA)
			await cargarTareas();
		} catch (err) {
			console.error('Error al cargar datos del home:', err);
			setError('Error al cargar la información');
		} finally {
			setLoading(false);
		}
	};

	const cargarRecordatorios = async () => {
		try {
			const hoy = new Date();
			const manana = new Date(hoy);
			manana.setDate(manana.getDate() + 1);

			const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];

			// Obtener recordatorios del rango (hoy y mañana)
			const recordatorios = await recordatoriosAPI.getByRango(
				pacienteSeleccionado.id,
				formatoFecha(hoy),
				formatoFecha(manana)
			);

			setRecordatoriosHoy(recordatorios || []);
		} catch (err) {
			console.error('Error al cargar recordatorios:', err);
			setRecordatoriosHoy([]);
		}
	};

	const cargarTareas = async () => {
		try {
			const todasLasTareas = await tareasAPI.getByPaciente(pacienteSeleccionado.id);

			// Filtrar: tareas NO completadas
			const tareasPendientesTemp = todasLasTareas.filter((t) => !t.completada);

			// Filtrar:
			// 1. Tareas con fecha de hoy
			// 2. Tareas sin fecha con prioridad ALTA
			const hoy = new Date();
			hoy.setHours(0, 0, 0, 0);

			const tareasFiltradas = tareasPendientesTemp.filter((tarea) => {
				// Si tiene fecha, verificar si es de hoy
				if (tarea.fechaVencimiento) {
					const fechaTarea = new Date(tarea.fechaVencimiento);
					fechaTarea.setHours(0, 0, 0, 0);
					return fechaTarea.getTime() === hoy.getTime();
				}

				// Si no tiene fecha, solo mostrar las de prioridad ALTA
				return tarea.prioridad === 'ALTA';
			});

			setTareasPendientes(tareasFiltradas);
		} catch (err) {
			console.error('Error al cargar tareas:', err);
			setTareasPendientes([]);
		}
	};

	const handleToggleTarea = async (tareaId) => {
		try {
			await tareasAPI.toggleCompletada(tareaId);
			await cargarTareas();
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
				<div className="home-header">
					<div className="home-header-icon"></div>
					<div className="home-header-content">
						<h1 className="home-titulo">Bienvenidx de nuevo {cuidadorNombre}</h1>
						<p className="home-subtitulo">
							Selecciona un paciente en el menú superior para comenzar
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="home-container">
			{/* Header de Bienvenida */}
			<div className="home-header">
				<div className="home-header-icon"></div>
				<div className="home-header-content">
					<h1 className="home-titulo">Bienvenidx de nuevo {cuidadorNombre}</h1>
					<p className="home-subtitulo">
						Resumen de hoy para tu paciente <strong>{pacienteSeleccionado.nombreCompleto}</strong>
					</p>
				</div>
			</div>

			{error && <div className="mensaje-error">{error}</div>}

			{/* Sección: Recordatorios de hoy */}
			<div className="home-seccion">
				<h2 className="seccion-titulo">Recordatorios de hoy</h2>

				{recordatoriosHoy.length === 0 ? (
					<div className="mensaje-vacio">
						<div className="mensaje-vacio-icono">
							<IoCalendarOutline />
						</div>
						<p className="mensaje-vacio-texto">No hay recordatorios para hoy</p>
					</div>
				) : (
					<div className="item-lista">
						{recordatoriosHoy.map((recordatorio) => (
							<div
								key={recordatorio.id}
								className="item"
								onClick={() => navigate('/recordatorios')}
							>
								<IoMedkitOutline className="item-icono" />
								<div className="item-contenido">
									<h3 className="item-titulo">{recordatorio.nombre || recordatorio.titulo}</h3>
									<p className="item-hora">
										{recordatorio.horaProgramada
											? `${recordatorio.horaProgramada} hs`
											: recordatorio.fechaHora
											? formatearHora(recordatorio.fechaHora)
											: ''}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Sección: Tareas pendientes */}
			<div className="home-seccion">
				<h2 className="seccion-titulo">Tareas pendientes</h2>

				{tareasPendientes.length === 0 ? (
					<div className="mensaje-vacio">
						<div className="mensaje-vacio-icono">
							<IoCheckmarkCircle />
						</div>
						<p className="mensaje-vacio-texto">¡Todo listo por hoy!</p>
					</div>
				) : (
					<div className="item-lista">
						{tareasPendientes.map((tarea) => (
							<div key={tarea.id} className="tarea-item">
								<div className="tarea-checkbox">
									<button
										className={`tarea-checkbox-btn ${tarea.completada ? 'completada' : ''}`}
										onClick={(e) => {
											e.stopPropagation();
											handleToggleTarea(tarea.id);
										}}
										title={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
									>
										{tarea.completada ? <IoCheckmarkCircle /> : <IoEllipseOutline />}
									</button>
								</div>
								<div className="tarea-contenido" onClick={() => navigate('/tareas')}>
									<h3 className="item-titulo">{tarea.titulo}</h3>
									{tarea.fechaVencimiento && (
										<p className="item-hora">{formatearHora(tarea.fechaVencimiento)}</p>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Sección: Resumen del paciente */}
			<div className="home-seccion">
				<h2 className="seccion-titulo">Resumen del paciente</h2>

				<div className="resumen-grid">
					<div className="resumen-item">
						<span className="resumen-label">Nombre</span>
						<span className="resumen-valor">{pacienteSeleccionado.nombreCompleto}</span>
					</div>

					{pacienteSeleccionado.edad && (
						<div className="resumen-item">
							<span className="resumen-label">Edad</span>
							<span className="resumen-valor">{pacienteSeleccionado.edad} años</span>
						</div>
					)}

					{pacienteSeleccionado.condicionesMedicas && (
						<div className="resumen-item">
							<span className="resumen-label">Condiciones</span>
							<span className="resumen-valor">{pacienteSeleccionado.condicionesMedicas}</span>
						</div>
					)}

					{pacienteSeleccionado.observaciones && (
						<div className="resumen-item">
							<span className="resumen-label">Notas importantes</span>
							<span className="resumen-valor">{pacienteSeleccionado.observaciones}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
