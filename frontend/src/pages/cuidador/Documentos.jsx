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
	IoFolderOpenOutline
} from 'react-icons/io5';
import './Documentos.css';

export default function Documentos() {
	// Obtener paciente seleccionado del contexto
	const { pacienteSeleccionado } = usePaciente();
	const pacienteId = pacienteSeleccionado?.id;

	// Estado de tabs
	const [tabActivo, setTabActivo] = useState('FICHA_MEDICA'); // 'FICHA_MEDICA' | 'OTROS'

	// Estado de documentos
	const [documentos, setDocumentos] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Filtros y ordenamiento
	const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS'); // 'TODOS' | 'DOCUMENTO' | 'IMAGEN' | 'VIDEO'
	const [ordenamiento, setOrdenamiento] = useState('DESC'); // 'DESC' | 'ASC'

	// Modal de upload
	const [modalUploadAbierto, setModalUploadAbierto] = useState(false);
	const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
	const [dragOver, setDragOver] = useState(false);

	// Form data para upload
	const [formData, setFormData] = useState({
		nombre: '',
		tipo: 'ESTUDIO', // Para tab OTROS
		descripcion: '',
	});

	// Modal de confirmación eliminar
	const [modalEliminar, setModalEliminar] = useState(null);

	// Cargar documentos al montar y cuando cambia el tab
	useEffect(() => {
		if (pacienteId) {
			cargarDocumentos();
		}
	}, [pacienteId, tabActivo]);

	// Cargar documentos desde el backend
	const cargarDocumentos = async () => {
		setLoading(true);
		setError(null);
		try {
			let data;
			if (tabActivo === 'FICHA_MEDICA') {
				data = await documentosAPI.getFichasMedicas(pacienteId);
			} else {
				data = await documentosAPI.getOtrosDocumentos(pacienteId);
			}
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
				},
				{
					id: 2,
					nombre: 'Radiografía por Dr. Roberto',
					tipo: 'ESTUDIO',
					categoriaArchivo: 'IMAGEN',
					mimeType: 'image/png',
					sizeBytes: 1835008,
					extension: 'PNG',
					createdAt: '2025-03-18T14:20:00',
					cuidadorNombre: 'Santiago López',
					downloadUrl: '/api/documentos/2/descargar',
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	// Abrir modal de upload
	const abrirModalUpload = () => {
		setModalUploadAbierto(true);
		setArchivoSeleccionado(null);
		setFormData({
			nombre: '',
			tipo: tabActivo === 'FICHA_MEDICA' ? 'FICHA_MEDICA' : 'ESTUDIO',
			descripcion: '',
		});
	};

	// Cerrar modal de upload
	const cerrarModalUpload = () => {
		setModalUploadAbierto(false);
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
			'video/mp4',
			'video/x-msvideo',
		];

		if (!tiposPermitidos.includes(file.type)) {
			setError('Tipo de archivo no soportado. Formatos permitidos: PDF, DOC, DOCX, PNG, JPG, JPEG, MP4, AVI');
			return;
		}

		if (file.size > 100 * 1024 * 1024) {
			setError('El archivo excede el tamaño máximo de 100MB');
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

	// Subir documento
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!archivoSeleccionado) {
			setError('Debes seleccionar un archivo');
			return;
		}

		if (!formData.nombre.trim()) {
			setError('El nombre del documento es obligatorio');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const formDataUpload = new FormData();
			formDataUpload.append('archivo', archivoSeleccionado);
			formDataUpload.append('pacienteId', pacienteId);
			formDataUpload.append('nombre', formData.nombre.trim());
			formDataUpload.append('tipo', formData.tipo);
			if (formData.descripcion.trim()) {
				formDataUpload.append('descripcion', formData.descripcion.trim());
			}

			await documentosAPI.subir(formDataUpload);

			// Recargar documentos
			await cargarDocumentos();
			cerrarModalUpload();
		} catch (err) {
			console.error('Error al subir documento:', err);
			setError(err.message || 'Error al subir el documento. Por favor, intenta nuevamente.');
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

	// Obtener icono según extensión
	const obtenerIcono = (documento) => {
		const ext = documento.extension?.toLowerCase();
		if (ext === 'pdf') {
			return <IoDocumentTextOutline className="documento-icon pdf" />;
		} else if (ext === 'doc' || ext === 'docx') {
			return <IoDocumentOutline className="documento-icon doc" />;
		} else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
			return <IoImageOutline className="documento-icon img" />;
		} else if (ext === 'mp4' || ext === 'avi') {
			return <IoVideocamOutline className="documento-icon video" />;
		} else {
			return <IoDocumentOutline className="documento-icon pdf" />;
		}
	};

	// Filtrar documentos
	const documentosFiltrados = documentos
		.filter((doc) => {
			if (categoriaFiltro === 'TODOS') return true;
			return doc.categoriaArchivo === categoriaFiltro;
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
						<p className="header-subtitulo">De Carlos Regidor</p>
					</div>
					<button className="btn-info-icon" title="Información">
						<IoInformationCircleOutline size={24} />
					</button>
				</div>
			</div>

			{/* Tabs y Contenido */}
			<div className="tabs-container">
				{/* Tabs Header */}
				<div className="tabs-header">
					<button
						className={`tab-button ${tabActivo === 'FICHA_MEDICA' ? 'active' : ''}`}
						onClick={() => setTabActivo('FICHA_MEDICA')}
					>
						Ficha médica
					</button>
					<button
						className={`tab-button ${tabActivo === 'OTROS' ? 'active' : ''}`}
						onClick={() => setTabActivo('OTROS')}
					>
						Otros
					</button>
				</div>

				{/* Botón Upload */}
				<button className="btn-upload" onClick={abrirModalUpload}>
					<IoCloudUploadOutline />
					<span>Cargar nuevo documento</span>
				</button>

				{/* Controles: Ordenamiento y Filtros */}
				<div className="controles-container">
					<div className="ordenamiento">
						<label>Ordenar por:</label>
						<select value={ordenamiento} onChange={(e) => setOrdenamiento(e.target.value)}>
							<option value="DESC">Primero más nuevos</option>
							<option value="ASC">Primero más viejos</option>
						</select>
					</div>

					<div className="filtros">
						<label>Filtrar por:</label>
						<button
							className={`filtro-button ${categoriaFiltro === 'TODOS' ? 'active' : ''}`}
							onClick={() => setCategoriaFiltro('TODOS')}
						>
							Documentos
						</button>
						<button
							className={`filtro-button ${categoriaFiltro === 'IMAGEN' ? 'active' : ''}`}
							onClick={() => setCategoriaFiltro('IMAGEN')}
						>
							Imágenes
						</button>
						<button
							className={`filtro-button ${categoriaFiltro === 'VIDEO' ? 'active' : ''}`}
							onClick={() => setCategoriaFiltro('VIDEO')}
						>
							Videos
						</button>
					</div>
				</div>

				{/* Alerta de error */}
				{error && !modalUploadAbierto && (
					<div className="alert alert-error">
						<span>{error}</span>
						<button className="alert-close" onClick={() => setError(null)}>
							×
						</button>
					</div>
				)}

				{/* Loading */}
				{loading && !modalUploadAbierto && (
					<div className="mensaje-loading">Cargando documentos...</div>
				)}

				{/* Lista de Documentos */}
				{!loading && documentosFiltrados.length === 0 && (
					<div className="mensaje-vacio">
						<IoFolderOpenOutline />
						<p>No hay documentos registrados aún. Sube el primer documento para comenzar.</p>
					</div>
				)}

				<div className="documentos-lista">
					{documentosFiltrados.map((documento) => (
						<div key={documento.id} className="documento-item">
							<div className="documento-info">
								<div>{obtenerIcono(documento)}</div>
								<div className="documento-detalles">
									<div className="documento-nombre">{documento.nombre}</div>
									<div className="documento-meta">
										<span className="documento-meta-item">
											{documento.extension} subido el {formatearFecha(documento.createdAt)}
										</span>
									</div>
								</div>
							</div>

							<div className="documento-acciones">
								<button
									className="btn-accion btn-descargar"
									onClick={() => window.open(documento.downloadUrl, '_blank')}
									title="Descargar"
								>
									<IoDownloadOutline />
								</button>
								<button
									className="btn-accion btn-eliminar"
									onClick={() => confirmarEliminar(documento)}
									title="Eliminar"
								>
									<IoTrashOutline />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Modal de Upload */}
			{modalUploadAbierto && (
				<div className="modal-overlay">
					<div className="modal-upload">
						<div className="modal-header">
							<h2 className="modal-titulo">Subir documento</h2>
							<button className="btn-cerrar-modal" onClick={cerrarModalUpload}>
								<IoCloseCircle size={28} />
							</button>
						</div>
						<p className="modal-subtitulo">
							Sube documentos médicos del paciente (recetas, estudios, etc.)
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
							{/* Zona de Drop */}
							{!archivoSeleccionado && (
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
										PDF, DOC, DOCX, PNG, JPG, JPEG, MP4, AVI (máx. 100MB)
									</p>
								</div>
							)}

							<input
								id="file-input"
								type="file"
								style={{ display: 'none' }}
								accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.avi"
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
									Nombre del documento <span className="required">*</span>
								</label>
								<input
									type="text"
									name="nombre"
									className="input"
									placeholder='Ej: "Receta Dra. López"'
									value={formData.nombre}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className="form-group">
								<label>
									Tipo <span className="required">*</span>
								</label>
								<select
									name="tipo"
									className="input"
									value={formData.tipo}
									onChange={handleInputChange}
									required
								>
									{tabActivo === 'FICHA_MEDICA' && <option value="FICHA_MEDICA">Ficha Médica</option>}
									{tabActivo === 'OTROS' && (
										<>
											<option value="ESTUDIO">Estudio</option>
											<option value="RECETA">Receta</option>
											<option value="OTRO">Otro</option>
										</>
									)}
								</select>
							</div>

							<div className="form-group">
								<label>Descripción (opcional)</label>
								<textarea
									name="descripcion"
									className="input textarea"
									placeholder="Agrega detalles adicionales sobre el documento..."
									value={formData.descripcion}
									onChange={handleInputChange}
									rows={3}
								/>
							</div>

							{/* Botones */}
							<div className="modal-buttons">
								<button type="button" className="btn btn-cancelar" onClick={cerrarModalUpload}>
									Cancelar
								</button>
								<button
									type="submit"
									className="btn btn-primary"
									disabled={loading || !archivoSeleccionado}
								>
									{loading ? 'Subiendo...' : 'Subir documento'}
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
