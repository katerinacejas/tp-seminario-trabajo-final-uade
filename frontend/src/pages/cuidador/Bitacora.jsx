import React, { useState, useEffect } from 'react';
import { bitacorasAPI } from '../../services/api';
import {
	IoAddCircleOutline,
	IoInformationCircleOutline,
	IoCalendarOutline,
	IoCreateOutline,
	IoTrashOutline,
	IoCloseCircle
} from 'react-icons/io5';
import './Bitacora.css';

export default function Bitacora() {
	// Estado para el paciente seleccionado (en producción vendrá del contexto/props)
	const [pacienteId] = useState(1); // Mock - cambiar según flujo real

	// Estado del formulario
	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [modoEdicion, setModoEdicion] = useState(false);
	const [bitacoraEditando, setBitacoraEditando] = useState(null);

	const [formData, setFormData] = useState({
		fecha: new Date().toISOString().split('T')[0],
		titulo: '',
		descripcion: '',
		sintomas: '',
		observaciones: '',
	});

	// Selector de fecha
	const [opcionFecha, setOpcionFecha] = useState('hoy'); // 'hoy', 'ayer', 'personalizada'

	// Lista de bitácoras
	const [bitacoras, setBitacoras] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Modal de confirmación
	const [modalEliminar, setModalEliminar] = useState(null);

	// Cargar bitácoras al montar
	useEffect(() => {
		if (pacienteId) {
			cargarBitacoras();
		}
	}, [pacienteId]);

	// Cargar bitácoras desde el backend
	const cargarBitacoras = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await bitacorasAPI.getByPaciente(pacienteId);
			setBitacoras(data);
		} catch (err) {
			console.error('Error al cargar bitácoras:', err);
			setError('Error al cargar las bitácoras. Por favor, intenta nuevamente.');
			// Fallback con datos mock para desarrollo
			setBitacoras([
				{
					id: 1,
					fecha: '2025-11-09',
					titulo: 'Bitácora del 09/11/2025',
					descripcion: 'Desayuno completo. Ejercicios de movilidad. Salida al jardín.',
					sintomas: 'Leve dolor de espalda',
					observaciones: 'Día tranquilo, buen ánimo.',
					cuidadorNombre: 'Katerina Cejas',
					createdAt: '2025-11-09T10:30:00',
				},
				{
					id: 2,
					fecha: '2025-11-08',
					titulo: 'Bitácora del 08/11/2025',
					descripcion: 'Control médico virtual. Ajuste de medicación.',
					sintomas: null,
					observaciones: 'Médico indicó continuar con tratamiento actual.',
					cuidadorNombre: 'Santiago López',
					createdAt: '2025-11-08T15:20:00',
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	// Abrir formulario para nueva bitácora
	const abrirFormularioNuevo = () => {
		setModoEdicion(false);
		setBitacoraEditando(null);
		setFormData({
			fecha: new Date().toISOString().split('T')[0],
			titulo: '',
			descripcion: '',
			sintomas: '',
			observaciones: '',
		});
		setOpcionFecha('hoy');
		setMostrarFormulario(true);
	};

	// Abrir formulario para editar bitácora
	const abrirFormularioEditar = (bitacora) => {
		setModoEdicion(true);
		setBitacoraEditando(bitacora);
		setFormData({
			fecha: bitacora.fecha,
			titulo: bitacora.titulo,
			descripcion: bitacora.descripcion,
			sintomas: bitacora.sintomas || '',
			observaciones: bitacora.observaciones || '',
		});

		// Determinar opción de fecha
		const hoy = new Date().toISOString().split('T')[0];
		const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
		if (bitacora.fecha === hoy) {
			setOpcionFecha('hoy');
		} else if (bitacora.fecha === ayer) {
			setOpcionFecha('ayer');
		} else {
			setOpcionFecha('personalizada');
		}

		setMostrarFormulario(true);
	};

	// Cerrar formulario
	const cerrarFormulario = () => {
		setMostrarFormulario(false);
		setModoEdicion(false);
		setBitacoraEditando(null);
		setError(null);
	};

	// Cambiar fecha según opción
	const handleOpcionFechaChange = (opcion) => {
		setOpcionFecha(opcion);
		if (opcion === 'hoy') {
			setFormData({ ...formData, fecha: new Date().toISOString().split('T')[0] });
		} else if (opcion === 'ayer') {
			const ayer = new Date(Date.now() - 86400000);
			setFormData({ ...formData, fecha: ayer.toISOString().split('T')[0] });
		}
		// Si es 'personalizada', no cambiar la fecha actual
	};

	// Manejar cambios en el formulario
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	// Enviar formulario
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validación
		if (!formData.descripcion.trim()) {
			setError('La descripción de actividades es obligatoria');
			setLoading(false);
			return;
		}

		try {
			const bitacoraData = {
				pacienteId: pacienteId,
				fecha: formData.fecha,
				titulo: formData.titulo.trim() || null, // null para auto-generar
				descripcion: formData.descripcion.trim(),
				sintomas: formData.sintomas.trim() || null,
				observaciones: formData.observaciones.trim() || null,
			};

			if (modoEdicion) {
				await bitacorasAPI.actualizar(bitacoraEditando.id, bitacoraData);
			} else {
				await bitacorasAPI.crear(bitacoraData);
			}

			// Recargar bitácoras
			await cargarBitacoras();
			cerrarFormulario();
		} catch (err) {
			console.error('Error al guardar bitácora:', err);
			setError('Error al guardar la bitácora. Por favor, intenta nuevamente.');
		} finally {
			setLoading(false);
		}
	};

	// Confirmar eliminación
	const confirmarEliminar = (bitacora) => {
		setModalEliminar(bitacora);
	};

	// Eliminar bitácora
	const eliminarBitacora = async () => {
		if (!modalEliminar) return;

		setLoading(true);
		try {
			await bitacorasAPI.eliminar(modalEliminar.id);
			await cargarBitacoras();
			setModalEliminar(null);
		} catch (err) {
			console.error('Error al eliminar bitácora:', err);
			setError('Error al eliminar la bitácora. Por favor, intenta nuevamente.');
		} finally {
			setLoading(false);
		}
	};

	// Formatear fecha
	const formatearFecha = (fechaISO) => {
		const fecha = new Date(fechaISO + 'T00:00:00');
		const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
		return fecha.toLocaleDateString('es-AR', opciones);
	};

	// Formatear fecha con día de la semana
	const formatearFechaConDia = (fechaISO) => {
		const fecha = new Date(fechaISO + 'T00:00:00');
		const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
		const dia = diasSemana[fecha.getDay()];
		return `${formatearFecha(fechaISO)} - ${dia}`;
	};

	return (
		<div className="bitacora-container">
			{/* Header */}
			<div className="bitacora-header">
				<div className="header-content">
					<h1>Bitácoras</h1>
					<button className="btn-info-icon" title="Información">
						<IoInformationCircleOutline size={24} />
					</button>
				</div>
				<button className="btn-añadir-bitacora" onClick={abrirFormularioNuevo}>
					<IoAddCircleOutline size={20} />
					<span>Añadir bitácora</span>
				</button>
			</div>

			{/* Formulario */}
			{mostrarFormulario && (
				<div className="formulario-bitacora">
					<div className="formulario-titulo">
						<span>{modoEdicion ? 'Editar bitácora' : 'Nueva bitácora'}</span>
						<button className="btn-cerrar-formulario" onClick={cerrarFormulario}>
							<IoCloseCircle size={28} />
						</button>
					</div>
					<p className="formulario-subtitulo">
						{modoEdicion
							? 'Actualiza los detalles de la bitácora'
							: 'Registra actividades, síntomas y observaciones del paciente'}
					</p>

					{error && (
						<div className="alert alert-error">
							<span>{error}</span>
							<button className="alert-close" onClick={() => setError(null)}>
								×
							</button>
						</div>
					)}

					<form onSubmit={handleSubmit}>
						{/* Selector de fecha */}
						<div className="form-group">
							<label>Fecha</label>
							<div className="fecha-selector">
								<button
									type="button"
									className={`btn-fecha ${opcionFecha === 'hoy' ? 'active' : ''}`}
									onClick={() => handleOpcionFechaChange('hoy')}
								>
									Hoy
								</button>
								<button
									type="button"
									className={`btn-fecha ${opcionFecha === 'ayer' ? 'active' : ''}`}
									onClick={() => handleOpcionFechaChange('ayer')}
								>
									Ayer
								</button>
								<button
									type="button"
									className={`btn-fecha ${opcionFecha === 'personalizada' ? 'active' : ''}`}
									onClick={() => handleOpcionFechaChange('personalizada')}
								>
									Otra fecha
								</button>
								{opcionFecha === 'personalizada' && (
									<div className="fecha-personalizada">
										<input
											type="date"
											name="fecha"
											className="input"
											value={formData.fecha}
											onChange={handleInputChange}
											required
										/>
									</div>
								)}
							</div>
						</div>

						{/* Título (opcional) */}
						<div className="form-group">
							<label>
								Título <span className="label-optional">(opcional, se auto-genera si no se completa)</span>
							</label>
							<input
								type="text"
								name="titulo"
								className="input"
								placeholder='Ejemplo: "Control post-quirúrgico"'
								value={formData.titulo}
								onChange={handleInputChange}
								maxLength={255}
							/>
						</div>

						{/* Descripción de actividades (obligatorio) */}
						<div className="form-group">
							<label>Actividades realizadas *</label>
							<textarea
								name="descripcion"
								className="input textarea"
								placeholder="Describe las actividades del día: comidas, ejercicios, salidas, terapias, etc."
								value={formData.descripcion}
								onChange={handleInputChange}
								rows={4}
								required
							/>
						</div>

						{/* Síntomas (opcional, texto libre) */}
						<div className="form-group">
							<label>
								Síntomas <span className="label-optional">(opcional)</span>
							</label>
							<input
								type="text"
								name="sintomas"
								className="input"
								placeholder="Describe síntomas observados, si los hubo"
								value={formData.sintomas}
								onChange={handleInputChange}
								maxLength={500}
							/>
						</div>

						{/* Observaciones (opcional) */}
						<div className="form-group">
							<label>
								Notas adicionales <span className="label-optional">(opcional)</span>
							</label>
							<textarea
								name="observaciones"
								className="input textarea"
								placeholder="Agrega cualquier observación relevante sobre el día"
								value={formData.observaciones}
								onChange={handleInputChange}
								rows={3}
							/>
						</div>

						{/* Botones */}
						<div className="form-buttons">
							<button type="button" className="btn btn-cancelar" onClick={cerrarFormulario}>
								Cancelar
							</button>
							<button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
								{loading ? 'Guardando...' : modoEdicion ? 'Actualizar bitácora' : 'Guardar bitácora'}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Lista de bitácoras */}
			<div className="lista-bitacoras-card">
				<h2 className="lista-titulo">Historial de bitácoras</h2>
				<p className="lista-subtitulo">
					Registro completo de actividades y observaciones del paciente
				</p>

				{loading && !mostrarFormulario && (
					<div className="mensaje-loading">Cargando bitácoras...</div>
				)}

				{!loading && bitacoras.length === 0 && (
					<div className="mensaje-vacio">
						📋 No hay bitácoras registradas aún. Crea la primera bitácora para comenzar.
					</div>
				)}

				<div className="bitacoras-lista">
					{bitacoras.map((bitacora) => (
						<div key={bitacora.id} className="bitacora-item">
							<div className="bitacora-item-header">
								<div className="bitacora-fecha-titulo">
									<div className="bitacora-fecha">
										<IoCalendarOutline size={16} /> {formatearFechaConDia(bitacora.fecha)}
									</div>
									<div className="bitacora-titulo">{bitacora.titulo}</div>
									<div className="bitacora-cuidador">
										Por: {bitacora.cuidadorNombre}
									</div>
								</div>
								<div className="bitacora-acciones">
									<button
										className="btn-editar"
										onClick={() => abrirFormularioEditar(bitacora)}
										title="Editar"
									>
										<IoCreateOutline size={20} />
									</button>
									<button
										className="btn-eliminar"
										onClick={() => confirmarEliminar(bitacora)}
										title="Eliminar"
									>
										<IoTrashOutline size={20} />
									</button>
								</div>
							</div>

							<div className="bitacora-contenido">
								<div className="contenido-section">
									<div className="contenido-label">Actividades</div>
									<div className="contenido-texto">{bitacora.descripcion}</div>
								</div>

								{bitacora.sintomas && (
									<div className="contenido-section">
										<div className="contenido-label">Síntomas</div>
										<div className="contenido-texto">{bitacora.sintomas}</div>
									</div>
								)}

								{bitacora.observaciones && (
									<div className="contenido-section">
										<div className="contenido-label">Notas adicionales</div>
										<div className="contenido-texto">{bitacora.observaciones}</div>
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Botón cargar más (para paginación futura) */}
				{bitacoras.length > 0 && bitacoras.length % 10 === 0 && (
					<button className="btn-cargar-mas" onClick={cargarBitacoras}>
						Cargar más bitácoras
					</button>
				)}
			</div>

			{/* Modal de confirmación de eliminación */}
			{modalEliminar && (
				<div className="modal-overlay">
					<div className="modal-confirmar">
						<h3>¿Eliminar bitácora?</h3>
						<p>
							Estás por eliminar la bitácora <strong>"{modalEliminar.titulo}"</strong> del{' '}
							{formatearFecha(modalEliminar.fecha)}.
						</p>
						<p className="modal-advertencia">Esta acción no se puede deshacer.</p>
						<div className="modal-buttons">
							<button className="btn btn-secondary" onClick={() => setModalEliminar(null)}>
								Cancelar
							</button>
							<button className="btn btn-danger" onClick={eliminarBitacora} disabled={loading}>
								{loading ? 'Eliminando...' : 'Eliminar'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
