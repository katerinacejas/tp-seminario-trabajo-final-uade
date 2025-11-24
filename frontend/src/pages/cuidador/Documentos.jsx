import React, { useState, useEffect } from 'react';
import { documentosAPI } from '../../services/api';
import { usePaciente } from '../../context/PacienteContext';
import {
	IoInformationCircleOutline,
	IoCloudUploadOutline,
	IoDocumentTextOutline,
	IoImageOutline,
	IoVideocamOutline,
	IoDownloadOutline,
	IoTrashOutline,
	IoCloseCircle,
	IoDocumentOutline,
	IoFolderOpenOutline,
	IoFlaskOutline,
	IoRibbonOutline,
	IoFolderOutline,
	IoCreateOutline
} from 'react-icons/io5';
import './Documentos.css';

export default function Documentos() {
	// Obtener paciente seleccionado del contexto
	const { pacienteSeleccionado } = usePaciente();
	const pacienteId = pacienteSeleccionado?.id;

	// Estado de documentos
	const [documentos, setDocumentos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Filtros y ordenamiento
	const [tipoFiltro, setTipoFiltro] = useState('TODOS'); // 'TODOS' | 'FICHA_MEDICA' | 'ESTUDIO' | 'RECETA' | 'OTRO'
	const [ordenamiento, setOrdenamiento] = useState('DESC'); // 'DESC' | 'ASC'

	// Modal de upload/edición
	const [modalFormAbierto, setModalFormAbierto] = useState(false);
	const [modoEdicion, setModoEdicion] = useState(false);
	const [documentoEditando, setDocumentoEditando] = useState(null);
	const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
	const [dragOver, setDragOver] = useState(false);

	// Form data para upload/edición
	const [formData, setFormData] = useState({
		nombre: '',
		tipo: 'ESTUDIO',
		descripcion: '',
	});

	// Modal de confirmación eliminar
	const [modalEliminar, setModalEliminar] = useState(null);

	// Cargar documentos al montar
	useEffect(() => {
		if (pacienteId) {
			cargarDocumentos();
		}
	}, [pacienteId]);

	// Cargar TODOS los documentos desde el backend
	const cargarDocumentos = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await documentosAPI.getByPaciente(pacienteId);
			setDocumentos(data);
		} catch (err) {
			console.error('Error al cargar documentos:', err);
			setError('Error al cargar los documentos. Por favor, intenta nuevamente.');
			// Fallback con datos mock para desarrollo
			setDocumentos([
				{
					id: 1,
					nombre: 'Receta Dra. Ana López',
					tipo: 'RECETA',
					categoriaArchivo: 'DOCUMENTO',
					mimeType: 'application/pdf',
					sizeBytes: 245760,
					extension: 'PDF',
					createdAt: '2025-06-05T10:30:00',
					cuidadorNombre: 'Katerina Cejas',
					downloadUrl: '/api/documentos/1/descargar',
					descripcion: 'Receta para medicamento cardiovascular',
				},
				{
					id: 2,
					nombre: 'Radiografía Torax',
					tipo: 'ESTUDIO',
					categoriaArchivo: 'IMAGEN',
					mimeType: 'image/png',
					sizeBytes: 1835008,
					extension: 'PNG',
					createdAt: '2025-03-18T14:20:00',
					cuidadorNombre: 'Santiago López',
					downloadUrl: '/api/documentos/2/descargar',
					descripcion: 'Radiografía de control',
				},
				{
					id: 3,
					nombre: 'Ficha Médica Completa',
					tipo: 'FICHA_MEDICA',
					categoriaArchivo: 'DOCUMENTO',
					mimeType: 'application/pdf',
					sizeBytes: 512000,
					extension: 'PDF',
					createdAt: '2025-01-10T09:00:00',
					cuidadorNombre: 'Katerina Cejas',
					downloadUrl: '/api/documentos/3/descargar',
					descripcion: null,
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	// Abrir modal de creación
	const abrirModalCreacion = () => {
		setModalFormAbierto(true);
		setModoEdicion(false);
		setDocumentoEditando(null);
		setArchivoSeleccionado(null);
		setFormData({
			nombre: '',
			tipo: 'ESTUDIO',
			descripcion: '',
		});
	};

	// Abrir modal de edición
	const abrirModalEdicion = (documento) => {
		setModalFormAbierto(true);
		setModoEdicion(true);
		setDocumentoEditando(documento);
		setArchivoSeleccionado(null);
		setFormData({
			nombre: documento.nombre,
			tipo: documento.tipo,
			descripcion: documento.descripcion || '',
		});
	};

	// Cerrar modal
	const cerrarModalForm = () => {
		setModalFormAbierto(false);
		setModoEdicion(false);
		setDocumentoEditando(null);
		setArchivoSeleccionado(null);
		setError(null);
	};

	// Handle file input change
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			validarYSetearArchivo(file);
		}
	};

	// Handle drag & drop
	const handleDragOver = (e) => {
		e.preventDefault();
		setDragOver(true);
	};

	const handleDragLeave = () => {
		setDragOver(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			validarYSetearArchivo(file);
		}
	};

	// Validar archivo
	const validarYSetearArchivo = (file) => {
		const tiposPermitidos = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'image/png',
			'image/jpeg',
			'image/jpg',
			'video/mp4',
			'video/x-msvideo',
			'audio/mpeg',
			'audio/wav',
			'text/plain',
		];

		if (!tiposPermitidos.includes(file.type)) {
			setError('Tipo de archivo no soportado. Formatos permitidos: PDF, DOC, DOCX, PNG, JPG, JPEG, MP4, AVI, MP3, WAV, TXT');
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			setError('El archivo excede el tamaño máximo de 10MB');
			return;
		}

		setArchivoSeleccionado(file);
		setError(null);

		// Auto-completar nombre si está vacío
		if (!formData.nombre) {
			const nombreSinExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
			setFormData({ ...formData, nombre: nombreSinExtension });
		}
	};

	// Remover archivo seleccionado
	const removerArchivo = () => {
		setArchivoSeleccionado(null);
	};

	// Handle input change
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	// Subir o actualizar documento
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validaciones
		if (!modoEdicion && !archivoSeleccionado) {
			setError('Debes seleccionar un archivo');
			return;
		}

		if (!formData.nombre.trim()) {
			setError('El nombre del documento es obligatorio');
			return;
		}

		if (formData.nombre.trim().length > 100) {
			setError('El nombre no puede exceder 100 caracteres');
			return;
		}

		if (!formData.tipo) {
			setError('El tipo de documento es obligatorio');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			if (modoEdicion) {
				setError('La edición de documentos no está soportada actualmente. Por favor, elimina y sube nuevamente.');
				setLoading(false);
				return;
			} else {
				const formDataUpload = new FormData();
				formDataUpload.append('archivo', archivoSeleccionado);
				formDataUpload.append('pacienteId', pacienteId);
				formDataUpload.append('nombre', formData.nombre.trim());
				formDataUpload.append('tipo', formData.tipo);
				if (formData.descripcion.trim()) {
					formDataUpload.append('descripcion', formData.descripcion.trim());
				}

				await documentosAPI.subir(formDataUpload);

				await cargarDocumentos();
				cerrarModalForm();
			}
		} catch (err) {
			console.error('Error al procesar documento:', err);
			setError(err.message || 'Error al procesar el documento. Por favor, intenta nuevamente.');
		} finally {
			setLoading(false);
		}
	};

	// Confirmar eliminación
	const confirmarEliminar = (documento) => {
		setModalEliminar(documento);
	};

	// Eliminar documento
	const eliminarDocumento = async () => {
		if (!modalEliminar) return;

		setLoading(true);
		try {
			await documentosAPI.eliminar(modalEliminar.id);
			await cargarDocumentos();
			setModalEliminar(null);
		} catch (err) {
			console.error('Error al eliminar documento:', err);
			setError('Error al eliminar el documento. Por favor, intenta nuevamente.');
		} finally {
			setLoading(false);
		}
	};

	// Formatear tamaño de archivo
	const formatearTamano = (bytes) => {
		if (bytes < 1024) return bytes + ' B';
		const exp = Math.floor(Math.log(bytes) / Math.log(1024));
		const pre = 'KMGTPE'.charAt(exp - 1);
		return (bytes / Math.pow(1024, exp)).toFixed(1) + ' ' + pre + 'B';
	};

	// Formatear fecha
	const formatearFecha = (fechaISO) => {
		const fecha = new Date(fechaISO);
		const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
		return fecha.toLocaleDateString('es-AR', opciones);
	};

	// Obtener icono según tipo de documento
	const obtenerIconoPorTipo = (tipo) => {
		switch (tipo) {
			case 'RECETA':
				return <IoDocumentTextOutline className="tipo-icon receta" />;
			case 'ESTUDIO':
				return <IoFlaskOutline className="tipo-icon estudio" />;
			case 'FICHA_MEDICA':
				return <IoDocumentOutline className="tipo-icon ficha" />;
			case 'OTRO':
				return <IoFolderOutline className="tipo-icon otro" />;
			default:
				return <IoDocumentOutline className="tipo-icon default" />;
		}
	};

	// Obtener label del tipo de documento
	const obtenerLabelTipo = (tipo) => {
		switch (tipo) {
			case 'RECETA':
				return 'Receta';
			case 'ESTUDIO':
				return 'Estudio';
			case 'FICHA_MEDICA':
				return 'Ficha Médica';
			case 'OTRO':
				return 'Otro';
			default:
				return tipo;
		}
	};

	// Obtener clase CSS para badge según tipo
	const obtenerClaseBadgeTipo = (tipo) => {
		switch (tipo) {
			case 'RECETA':
				return 'badge-receta';
			case 'ESTUDIO':
				return 'badge-estudio';
			case 'FICHA_MEDICA':
				return 'badge-ficha';
			case 'OTRO':
				return 'badge-otro';
			default:
				return 'badge-default';
		}
	};

	// Filtrar y ordenar documentos
	const documentosFiltrados = documentos
		.filter((doc) => {
			if (tipoFiltro === 'TODOS') return true;
			return doc.tipo === tipoFiltro;
		})
		.sort((a, b) => {
			const dateA = new Date(a.createdAt);
			const dateB = new Date(b.createdAt);
			return ordenamiento === 'DESC' ? dateB - dateA : dateA - dateB;
		});

	return (
		<div className="documentos-container">
			{/* Header */}
			<div className="documentos-header">
				<div className="header-content">
					<div>
						<h1>Documentos</h1>
						<p className="header-subtitulo">De {pacienteSeleccionado?.nombreCompleto || 'Paciente'}</p>
					</div>
					<button className="btn-info-icon" title="Información">
						<IoInformationCircleOutline size={24} />
					</button>
				</div>
			</div>

			{/* Contenido Principal */}
			<div className="documentos-contenido">
				{/* Botón Upload */}
				<button className="btn-upload" onClick={abrirModalCreacion}>
					<IoCloudUploadOutline />
					<span>Cargar nuevo documento</span>
				</button>

				{/* Controles: Ordenamiento y Filtros */}
				<div className="documentos-controles">
					<div className="documentos-ordenamiento">
						<label>Ordenar por:</label>
						<select value={ordenamiento} onChange={(e) => setOrdenamiento(e.target.value)}>
							<option value="DESC">Más recientes primero</option>
							<option value="ASC">Más antiguos primero</option>
						</select>
					</div>

					<div className="documentos-filtros">
						<label>Tipo:</label>
						<button
							className={`documentos-filtro-button ${tipoFiltro === 'TODOS' ? 'active' : ''}`}
							onClick={() => setTipoFiltro('TODOS')}
						>
							Todos
						</button>
						<button
							className={`documentos-filtro-button ${tipoFiltro === 'FICHA_MEDICA' ? 'active' : ''}`}
							onClick={() => setTipoFiltro('FICHA_MEDICA')}
						>
							Ficha Médica
						</button>
						<button
							className={`documentos-filtro-button ${tipoFiltro === 'RECETA' ? 'active' : ''}`}
							onClick={() => setTipoFiltro('RECETA')}
						>
							Receta
						</button>
						<button
							className={`documentos-filtro-button ${tipoFiltro === 'ESTUDIO' ? 'active' : ''}`}
							onClick={() => setTipoFiltro('ESTUDIO')}
						>
							Estudio
						</button>
						<button
							className={`documentos-filtro-button ${tipoFiltro === 'OTRO' ? 'active' : ''}`}
							onClick={() => setTipoFiltro('OTRO')}
						>
							Otro
						</button>
					</div>
				</div>

				{/* Alerta de error */}
				{error && !modalFormAbierto && (
					<div className="alert alert-error">
						<span>{error}</span>
						<button className="alert-close" onClick={() => setError(null)}>
							×
						</button>
					</div>
				)}

				{/* Loading */}
				{loading && !modalFormAbierto && (
					<div className="mensaje-loading">Cargando documentos...</div>
				)}

				{/* Lista de Documentos */}
				{!loading && documentosFiltrados.length === 0 && (
					<div className="mensaje-vacio">
						<IoFolderOpenOutline size={48} />
						<p>No hay documentos registrados aún. Sube el primer documento para comenzar.</p>
					</div>
				)}

				<div className="documentos-lista">
					{documentosFiltrados.map((documento) => (
						<div key={documento.id} className="documento-card">
							<div className="card-header">
								<div className="card-icon">
									{obtenerIconoPorTipo(documento.tipo)}
								</div>
								<div className="card-info">
									<h3 className="card-titulo">{documento.nombre}</h3>
									<span className={`card-badge ${obtenerClaseBadgeTipo(documento.tipo)}`}>
										{obtenerLabelTipo(documento.tipo)}
									</span>
								</div>
							</div>

							{documento.descripcion && (
								<p className="card-descripcion">
									{documento.descripcion.length > 120
										? documento.descripcion.substring(0, 120) + '...'
										: documento.descripcion}
								</p>
							)}

							<div className="card-meta">
								<span className="meta-item">
									<strong>Fecha:</strong> {formatearFecha(documento.createdAt)}
								</span>
								{documento.extension && (
									<span className="meta-item">
										<strong>Formato:</strong> {documento.extension.toUpperCase()}
									</span>
								)}
								{documento.sizeBytes && (
									<span className="meta-item">
										<strong>Tamaño:</strong> {formatearTamano(documento.sizeBytes)}
									</span>
								)}
								{documento.cuidadorNombre && (
									<span className="meta-item">
										<strong>Subido por:</strong> {documento.cuidadorNombre}
									</span>
								)}
							</div>

							<div className="card-accionesDocu">
								<button
									className="btn-accionDocu btn-verDocu"
									onClick={() => window.open(documento.downloadUrl, '_blank')}
									title="Ver/Descargar"
								>
									<IoDownloadOutline />
									<span>Ver/Descargar</span>
								</button>
								<button
									className="btn-accionDocu btn-eliminardocu"
									onClick={() => confirmarEliminar(documento)}
									title="Eliminar"
								>
									<IoTrashOutline />
									<span>Eliminar</span>
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Modal de Formulario (Crear/Editar) */}
			{modalFormAbierto && (
				<div className="modal-overlay">
					<div className="modal-form">
						<div className="modal-header">
							<h2 className="modal-titulo">
								{modoEdicion ? 'Editar documento' : 'Subir documento'}
							</h2>
							<button className="btn-cerrar-modal" onClick={cerrarModalForm}>
								<IoCloseCircle size={28} />
							</button>
						</div>
						<p className="modal-subtitulo">
							{modoEdicion
								? 'Actualiza la información del documento'
								: 'Sube documentos médicos del paciente (recetas, estudios, fichas, etc.)'}
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
							{/* Zona de Drop - Solo en creación */}
							{!modoEdicion && !archivoSeleccionado && (
								<div
									className={`upload-zone ${dragOver ? 'dragover' : ''}`}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									onDrop={handleDrop}
									onClick={() => document.getElementById('file-input').click()}
								>
									<div className="upload-icon">📁</div>
									<p className="primary-text">Click para seleccionar o arrastra un archivo aquí</p>
									<p className="secondary-text">
										PDF, DOC, DOCX, PNG, JPG, JPEG, MP4, AVI, MP3, WAV, TXT (máx. 10MB)
									</p>
								</div>
							)}

							<input
								id="file-input"
								type="file"
								style={{ display: 'none' }}
								accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.avi,.mp3,.wav,.txt"
								onChange={handleFileChange}
							/>

							{/* Archivo Seleccionado */}
							{archivoSeleccionado && (
								<div className="archivo-seleccionado">
									<div className="archivo-info">
										<IoDocumentTextOutline />
										<div className="archivo-detalles">
											<p>{archivoSeleccionado.name}</p>
											<small>{formatearTamano(archivoSeleccionado.size)}</small>
										</div>
									</div>
									<button type="button" className="btn-remover" onClick={removerArchivo}>
										×
									</button>
								</div>
							)}

							{/* Campos del Formulario */}
							<div className="form-group">
								<label>
									Nombre <span className="required">*</span>
								</label>
								<input
									type="text"
									name="nombre"
									className="input"
									placeholder='Ej: "Receta Dra. López"'
									value={formData.nombre}
									onChange={handleInputChange}
									maxLength={100}
									required
								/>
								<small className="input-hint">Máximo 100 caracteres</small>
							</div>

							<div className="form-group">
								<label>
									Tipo de Documento <span className="required">*</span>
								</label>
								<select
									name="tipo"
									className="input"
									value={formData.tipo}
									onChange={handleInputChange}
									required
								>
									<option value="">Seleccioná un tipo</option>
									<option value="FICHA_MEDICA">📋 Ficha Médica</option>
									<option value="RECETA">📄 Receta</option>
									<option value="ESTUDIO">🧪 Estudio</option>
									<option value="OTRO">📁 Otro</option>
								</select>
							</div>

							<div className="form-group">
								<label>
									Descripción <span className="opcional">(opcional)</span>
								</label>
								<textarea
									name="descripcion"
									className="input textarea"
									placeholder="Agrega detalles adicionales sobre el documento..."
									value={formData.descripcion}
									onChange={handleInputChange}
									rows={3}
								/>
							</div>

							{/* Campos auto-generados (solo mostrar en edición) */}
							{modoEdicion && documentoEditando && (
								<>
									<div className="form-group">
										<label className="label-con-tooltip">
											URL{' '}
											<span className="tooltip-icon" title="Se genera automáticamente al subir el archivo">
												ℹ️
											</span>
										</label>
										<input
											type="text"
											className="input"
											value={documentoEditando.downloadUrl || ''}
											disabled
										/>
									</div>

									<div className="form-group">
										<label className="label-con-tooltip">
											Fecha de Subida{' '}
											<span className="tooltip-icon" title="Se genera automáticamente">
												ℹ️
											</span>
										</label>
										<input
											type="text"
											className="input"
											value={formatearFecha(documentoEditando.createdAt)}
											disabled
										/>
									</div>
								</>
							)}

							{/* Botones */}
							<div className="modal-buttons">
								<button type="button" className="btn btn-cancelar" onClick={cerrarModalForm}>
									Cancelar
								</button>
								<button
									type="submit"
									className="btn btn-primary"
									disabled={loading || (!modoEdicion && !archivoSeleccionado)}
								>
									{loading
										? modoEdicion
											? 'Actualizando...'
											: 'Subiendo...'
										: modoEdicion
										? 'Actualizar documento'
										: 'Subir documento'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal de Confirmación Eliminar */}
			{modalEliminar && (
				<div className="modal-overlay">
					<div className="modal-confirmar">
						<h3>¿Eliminar documento?</h3>
						<p>
							Estás por eliminar el documento <strong>"{modalEliminar.nombre}"</strong>.
						</p>
						<p className="modal-advertencia">Esta acción no se puede deshacer.</p>
						<div className="modal-buttons">
							<button className="btn btn-secondary" onClick={() => setModalEliminar(null)}>
								Cancelar
							</button>
							<button className="btn btn-danger" onClick={eliminarDocumento} disabled={loading}>
								{loading ? 'Eliminando...' : 'Eliminar'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
