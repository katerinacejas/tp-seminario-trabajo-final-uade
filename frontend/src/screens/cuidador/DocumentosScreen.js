import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Modal,
	TextInput,
	Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { documentosAPI } from '../../services/api';
import { usePaciente } from '../../context/PacienteContext';

export default function DocumentosScreen() {
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

	// Form data para upload
	const [formData, setFormData] = useState({
		nombre: '',
		tipo: 'ESTUDIO', // Para tab OTROS
		descripcion: '',
	});

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

	// Seleccionar archivo usando expo-document-picker
	const seleccionarArchivo = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: [
					'application/pdf',
					'application/msword',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					'image/png',
					'image/jpeg',
					'video/mp4',
					'video/x-msvideo',
				],
				copyToCacheDirectory: true,
			});

			if (result.type === 'cancel' || result.canceled) {
				return;
			}

			const file = result.assets ? result.assets[0] : result;

			if (!file) {
				return;
			}

			// Validar tamaño (100MB)
			if (file.size && file.size > 100 * 1024 * 1024) {
				setError('El archivo excede el tamaño máximo de 100MB');
				return;
			}

			setArchivoSeleccionado(file);
			setError(null);

			// Auto-completar nombre si está vacío
			if (!formData.nombre && file.name) {
				const nombreSinExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
				setFormData({ ...formData, nombre: nombreSinExtension });
			}
		} catch (err) {
			console.error('Error al seleccionar archivo:', err);
			setError('Error al seleccionar el archivo');
		}
	};

	// Remover archivo seleccionado
	const removerArchivo = () => {
		setArchivoSeleccionado(null);
	};

	// Handle input change
	const handleInputChange = (name, value) => {
		setFormData({ ...formData, [name]: value });
	};

	// Subir documento
	const handleSubmit = async () => {
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

			// Crear objeto de archivo compatible con FormData
			const fileToUpload = {
				uri: Platform.OS === 'android' ? archivoSeleccionado.uri : archivoSeleccionado.uri.replace('file://', ''),
				type: archivoSeleccionado.mimeType || 'application/octet-stream',
				name: archivoSeleccionado.name,
			};

			formDataUpload.append('archivo', fileToUpload);
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
			Alert.alert('Éxito', 'Documento subido correctamente');
		} catch (err) {
			console.error('Error al subir documento:', err);
			setError(err.message || 'Error al subir el documento. Por favor, intenta nuevamente.');
		} finally {
			setLoading(false);
		}
	};

	// Confirmar eliminación
	const confirmarEliminar = (documento) => {
		Alert.alert(
			'¿Eliminar documento?',
			`Estás por eliminar el documento "${documento.nombre}".\n\nEsta acción no se puede deshacer.`,
			[
				{
					text: 'Cancelar',
					style: 'cancel',
				},
				{
					text: 'Eliminar',
					style: 'destructive',
					onPress: () => eliminarDocumento(documento.id),
				},
			]
		);
	};

	// Eliminar documento
	const eliminarDocumento = async (documentoId) => {
		setLoading(true);
		try {
			await documentosAPI.eliminar(documentoId);
			await cargarDocumentos();
			Alert.alert('Éxito', 'Documento eliminado correctamente');
		} catch (err) {
			console.error('Error al eliminar documento:', err);
			Alert.alert('Error', 'Error al eliminar el documento. Por favor, intenta nuevamente.');
		} finally {
			setLoading(false);
		}
	};

	// Descargar documento
	const descargarDocumento = async (documento) => {
		try {
			const downloadUrl = await documentosAPI.descargar(documento.id);
			const fileUri = FileSystem.documentDirectory + documento.nombre;

			Alert.alert('Descargando', 'Descargando documento...');

			const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);

			// Verificar si se puede compartir
			const isAvailable = await Sharing.isAvailableAsync();
			if (isAvailable) {
				await Sharing.shareAsync(uri);
			} else {
				Alert.alert('Éxito', `Documento guardado en: ${uri}`);
			}
		} catch (err) {
			console.error('Error al descargar documento:', err);
			Alert.alert('Error', 'Error al descargar el documento');
		}
	};

	// Formatear tamaño de archivo
	const formatearTamano = (bytes) => {
		if (!bytes) return '0 B';
		if (bytes < 1024) return bytes + ' B';
		const exp = Math.floor(Math.log(bytes) / Math.log(1024));
		const pre = 'KMGTPE'.charAt(exp - 1);
		return (bytes / Math.pow(1024, exp)).toFixed(1) + ' ' + pre + 'B';
	};

	// Formatear fecha
	const formatearFecha = (fechaISO) => {
		if (!fechaISO) return '';
		const fecha = new Date(fechaISO);
		const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
		return fecha.toLocaleDateString('es-AR', opciones);
	};

	// Obtener icono según extensión
	const obtenerIcono = (documento) => {
		const ext = documento.extension?.toLowerCase();
		if (ext === 'pdf') {
			return '📄';
		} else if (ext === 'doc' || ext === 'docx') {
			return '📝';
		} else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
			return '🖼️';
		} else if (ext === 'mp4' || ext === 'avi') {
			return '🎥';
		} else {
			return '📄';
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

	if (!pacienteSeleccionado) {
		return (
			<View style={styles.container}>
				<Text style={styles.mensajeVacioTexto}>
					Selecciona un paciente en el menú superior para ver sus documentos
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerContent}>
						<Text style={styles.titulo}>Documentos</Text>
						<Text style={styles.subtitulo}>De {pacienteSeleccionado.nombreCompleto}</Text>
					</View>
					<TouchableOpacity style={styles.btnInfoIcon}>
						<Text style={styles.infoIcono}>ℹ️</Text>
					</TouchableOpacity>
				</View>

				{/* Tabs Container */}
				<View style={styles.tabsContainer}>
					{/* Tabs Header */}
					<View style={styles.tabsHeader}>
						<TouchableOpacity
							style={[styles.tabButton, tabActivo === 'FICHA_MEDICA' && styles.tabButtonActive]}
							onPress={() => setTabActivo('FICHA_MEDICA')}
						>
							<Text style={[styles.tabButtonText, tabActivo === 'FICHA_MEDICA' && styles.tabButtonTextActive]}>
								Ficha médica
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.tabButton, tabActivo === 'OTROS' && styles.tabButtonActive]}
							onPress={() => setTabActivo('OTROS')}
						>
							<Text style={[styles.tabButtonText, tabActivo === 'OTROS' && styles.tabButtonTextActive]}>
								Otros
							</Text>
						</TouchableOpacity>
					</View>

					{/* Botón Upload */}
					<TouchableOpacity style={styles.btnUpload} onPress={abrirModalUpload}>
						<Text style={styles.btnUploadIcono}>☁️</Text>
						<Text style={styles.btnUploadText}>Cargar nuevo documento</Text>
					</TouchableOpacity>

					{/* Controles: Ordenamiento y Filtros */}
					<View style={styles.controlesContainer}>
						<View style={styles.ordenamiento}>
							<Text style={styles.controlesLabel}>Ordenar:</Text>
							<View style={styles.ordenamientoButtons}>
								<TouchableOpacity
									style={[styles.ordenamientoBtn, ordenamiento === 'DESC' && styles.ordenamientoBtnActive]}
									onPress={() => setOrdenamiento('DESC')}
								>
									<Text style={[styles.ordenamientoBtnText, ordenamiento === 'DESC' && styles.ordenamientoBtnTextActive]}>
										Más nuevos
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.ordenamientoBtn, ordenamiento === 'ASC' && styles.ordenamientoBtnActive]}
									onPress={() => setOrdenamiento('ASC')}
								>
									<Text style={[styles.ordenamientoBtnText, ordenamiento === 'ASC' && styles.ordenamientoBtnTextActive]}>
										Más viejos
									</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.filtros}>
							<Text style={styles.controlesLabel}>Filtrar:</Text>
							<View style={styles.filtrosButtons}>
								<TouchableOpacity
									style={[styles.filtroButton, categoriaFiltro === 'TODOS' && styles.filtroButtonActive]}
									onPress={() => setCategoriaFiltro('TODOS')}
								>
									<Text style={[styles.filtroBtnText, categoriaFiltro === 'TODOS' && styles.filtroBtnTextActive]}>
										Todos
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.filtroButton, categoriaFiltro === 'IMAGEN' && styles.filtroButtonActive]}
									onPress={() => setCategoriaFiltro('IMAGEN')}
								>
									<Text style={[styles.filtroBtnText, categoriaFiltro === 'IMAGEN' && styles.filtroBtnTextActive]}>
										Imágenes
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.filtroButton, categoriaFiltro === 'VIDEO' && styles.filtroButtonActive]}
									onPress={() => setCategoriaFiltro('VIDEO')}
								>
									<Text style={[styles.filtroBtnText, categoriaFiltro === 'VIDEO' && styles.filtroBtnTextActive]}>
										Videos
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					{/* Alerta de error */}
					{error && !modalUploadAbierto && (
						<View style={styles.alertError}>
							<Text style={styles.alertErrorText}>{error}</Text>
							<TouchableOpacity onPress={() => setError(null)}>
								<Text style={styles.alertClose}>×</Text>
							</TouchableOpacity>
						</View>
					)}

					{/* Loading */}
					{loading && !modalUploadAbierto && (
						<ActivityIndicator size="large" color="#2ea3ff" style={styles.loader} />
					)}

					{/* Lista de Documentos */}
					{!loading && documentosFiltrados.length === 0 && (
						<View style={styles.mensajeVacio}>
							<Text style={styles.mensajeVacioIcono}>📁</Text>
							<Text style={styles.mensajeVacioTexto}>
								No hay documentos registrados aún. Sube el primer documento para comenzar.
							</Text>
						</View>
					)}

					<View style={styles.documentosLista}>
						{documentosFiltrados.map((documento) => (
							<View key={documento.id} style={styles.documentoItem}>
								<View style={styles.documentoInfo}>
									<Text style={styles.documentoIcono}>{obtenerIcono(documento)}</Text>
									<View style={styles.documentoDetalles}>
										<Text style={styles.documentoNombre}>{documento.nombre}</Text>
										<Text style={styles.documentoMeta}>
											{documento.extension} subido el {formatearFecha(documento.createdAt)}
										</Text>
									</View>
								</View>

								<View style={styles.documentoAcciones}>
									<TouchableOpacity
										style={styles.btnAccion}
										onPress={() => descargarDocumento(documento)}
										activeOpacity={0.7}
									>
										<Text style={styles.btnAccionIcono}>⬇️</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.btnAccion, styles.btnEliminar]}
										onPress={() => confirmarEliminar(documento)}
										activeOpacity={0.7}
									>
										<Text style={styles.btnAccionIcono}>🗑️</Text>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
				</View>
			</ScrollView>

			{/* Modal de Upload */}
			<Modal visible={modalUploadAbierto} animationType="slide" transparent={true} onRequestClose={cerrarModalUpload}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalUpload}>
						<ScrollView>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitulo}>Subir documento</Text>
								<TouchableOpacity onPress={cerrarModalUpload}>
									<Text style={styles.btnCerrarModal}>×</Text>
								</TouchableOpacity>
							</View>
							<Text style={styles.modalSubtitulo}>
								Sube documentos médicos del paciente (recetas, estudios, etc.)
							</Text>

							{error && (
								<View style={styles.alertError}>
									<Text style={styles.alertErrorText}>{error}</Text>
									<TouchableOpacity onPress={() => setError(null)}>
										<Text style={styles.alertClose}>×</Text>
									</TouchableOpacity>
								</View>
							)}

							{/* Zona de Selección */}
							{!archivoSeleccionado && (
								<TouchableOpacity style={styles.uploadZone} onPress={seleccionarArchivo}>
									<Text style={styles.uploadIcono}>📁</Text>
									<Text style={styles.uploadPrimaryText}>Toca para seleccionar un archivo</Text>
									<Text style={styles.uploadSecondaryText}>
										PDF, DOC, DOCX, PNG, JPG, JPEG, MP4, AVI (máx. 100MB)
									</Text>
								</TouchableOpacity>
							)}

							{/* Archivo Seleccionado */}
							{archivoSeleccionado && (
								<View style={styles.archivoSeleccionado}>
									<View style={styles.archivoInfo}>
										<Text style={styles.archivoIcono}>📄</Text>
										<View style={styles.archivoDetalles}>
											<Text style={styles.archivoNombre}>{archivoSeleccionado.name}</Text>
											<Text style={styles.archivoTamano}>{formatearTamano(archivoSeleccionado.size)}</Text>
										</View>
									</View>
									<TouchableOpacity onPress={removerArchivo}>
										<Text style={styles.btnRemover}>×</Text>
									</TouchableOpacity>
								</View>
							)}

							{/* Campos del Formulario */}
							<View style={styles.formGroup}>
								<Text style={styles.formLabel}>
									Nombre del documento <Text style={styles.required}>*</Text>
								</Text>
								<TextInput
									style={styles.input}
									placeholder='Ej: "Receta Dra. López"'
									value={formData.nombre}
									onChangeText={(value) => handleInputChange('nombre', value)}
								/>
							</View>

							<View style={styles.formGroup}>
								<Text style={styles.formLabel}>
									Tipo <Text style={styles.required}>*</Text>
								</Text>
								<View style={styles.pickerContainer}>
									{tabActivo === 'FICHA_MEDICA' ? (
										<TouchableOpacity style={styles.pickerButton} disabled>
											<Text style={styles.pickerButtonText}>Ficha Médica</Text>
										</TouchableOpacity>
									) : (
										<View style={styles.pickerButtons}>
											<TouchableOpacity
												style={[styles.pickerBtn, formData.tipo === 'ESTUDIO' && styles.pickerBtnActive]}
												onPress={() => handleInputChange('tipo', 'ESTUDIO')}
											>
												<Text style={[styles.pickerBtnText, formData.tipo === 'ESTUDIO' && styles.pickerBtnTextActive]}>
													Estudio
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={[styles.pickerBtn, formData.tipo === 'RECETA' && styles.pickerBtnActive]}
												onPress={() => handleInputChange('tipo', 'RECETA')}
											>
												<Text style={[styles.pickerBtnText, formData.tipo === 'RECETA' && styles.pickerBtnTextActive]}>
													Receta
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={[styles.pickerBtn, formData.tipo === 'OTRO' && styles.pickerBtnActive]}
												onPress={() => handleInputChange('tipo', 'OTRO')}
											>
												<Text style={[styles.pickerBtnText, formData.tipo === 'OTRO' && styles.pickerBtnTextActive]}>
													Otro
												</Text>
											</TouchableOpacity>
										</View>
									)}
								</View>
							</View>

							<View style={styles.formGroup}>
								<Text style={styles.formLabel}>Descripción (opcional)</Text>
								<TextInput
									style={[styles.input, styles.textarea]}
									placeholder="Agrega detalles adicionales sobre el documento..."
									value={formData.descripcion}
									onChangeText={(value) => handleInputChange('descripcion', value)}
									multiline
									numberOfLines={3}
								/>
							</View>

							{/* Botones */}
							<View style={styles.modalButtons}>
								<TouchableOpacity style={styles.btnCancelar} onPress={cerrarModalUpload}>
									<Text style={styles.btnCancelarText}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.btnPrimary, (!archivoSeleccionado || loading) && styles.btnDisabled]}
									onPress={handleSubmit}
									disabled={loading || !archivoSeleccionado}
								>
									<Text style={styles.btnPrimaryText}>{loading ? 'Subiendo...' : 'Subir documento'}</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f3f4f6',
	},
	scrollContent: {
		padding: 20,
	},

	// Header
	header: {
		backgroundColor: 'white',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		padding: 20,
		marginBottom: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	headerContent: {
		flex: 1,
	},
	titulo: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 4,
	},
	subtitulo: {
		fontSize: 14,
		color: '#6b7280',
	},
	btnInfoIcon: {
		padding: 4,
	},
	infoIcono: {
		fontSize: 24,
	},

	// Tabs Container
	tabsContainer: {
		backgroundColor: 'white',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		padding: 20,
	},
	tabsHeader: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 16,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		backgroundColor: '#f3f4f6',
		alignItems: 'center',
	},
	tabButtonActive: {
		backgroundColor: '#2ea3ff',
	},
	tabButtonText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6b7280',
	},
	tabButtonTextActive: {
		color: 'white',
	},

	// Botón Upload
	btnUpload: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#2ea3ff',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		marginBottom: 20,
	},
	btnUploadIcono: {
		fontSize: 20,
		marginRight: 8,
	},
	btnUploadText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},

	// Controles
	controlesContainer: {
		marginBottom: 20,
		gap: 16,
	},
	controlesLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginBottom: 8,
	},
	ordenamiento: {},
	ordenamientoButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	ordenamientoBtn: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 6,
		backgroundColor: '#f3f4f6',
		alignItems: 'center',
	},
	ordenamientoBtnActive: {
		backgroundColor: '#dbeafe',
		borderWidth: 1,
		borderColor: '#2ea3ff',
	},
	ordenamientoBtnText: {
		fontSize: 13,
		color: '#6b7280',
	},
	ordenamientoBtnTextActive: {
		color: '#2ea3ff',
		fontWeight: '600',
	},
	filtros: {},
	filtrosButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	filtroButton: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 6,
		backgroundColor: '#f3f4f6',
		alignItems: 'center',
	},
	filtroButtonActive: {
		backgroundColor: '#dbeafe',
		borderWidth: 1,
		borderColor: '#2ea3ff',
	},
	filtroBtnText: {
		fontSize: 13,
		color: '#6b7280',
	},
	filtroBtnTextActive: {
		color: '#2ea3ff',
		fontWeight: '600',
	},

	// Alert
	alertError: {
		backgroundColor: '#fef2f2',
		borderWidth: 1,
		borderColor: '#fecaca',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	alertErrorText: {
		color: '#dc2626',
		fontSize: 14,
		flex: 1,
	},
	alertClose: {
		fontSize: 24,
		color: '#dc2626',
		fontWeight: '600',
		paddingLeft: 8,
	},

	// Loading
	loader: {
		marginVertical: 20,
	},

	// Estado Vacío
	mensajeVacio: {
		alignItems: 'center',
		paddingVertical: 40,
		paddingHorizontal: 20,
	},
	mensajeVacioIcono: {
		fontSize: 64,
		marginBottom: 16,
	},
	mensajeVacioTexto: {
		fontSize: 14,
		color: '#9ca3af',
		textAlign: 'center',
		fontWeight: '500',
	},

	// Lista de Documentos
	documentosLista: {
		gap: 12,
	},
	documentoItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		padding: 14,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		marginBottom: 12,
	},
	documentoInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	documentoIcono: {
		fontSize: 28,
		marginRight: 12,
	},
	documentoDetalles: {
		flex: 1,
	},
	documentoNombre: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 4,
	},
	documentoMeta: {
		fontSize: 12,
		color: '#6b7280',
	},
	documentoAcciones: {
		flexDirection: 'row',
		gap: 8,
	},
	btnAccion: {
		padding: 8,
		borderRadius: 6,
		backgroundColor: '#e5e7eb',
	},
	btnEliminar: {
		backgroundColor: '#fee2e2',
	},
	btnAccionIcono: {
		fontSize: 18,
	},

	// Modal
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalUpload: {
		backgroundColor: 'white',
		borderRadius: 16,
		padding: 24,
		width: '100%',
		maxHeight: '90%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	modalTitulo: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1f2937',
	},
	btnCerrarModal: {
		fontSize: 32,
		color: '#6b7280',
		fontWeight: '300',
	},
	modalSubtitulo: {
		fontSize: 14,
		color: '#6b7280',
		marginBottom: 20,
	},

	// Upload Zone
	uploadZone: {
		borderWidth: 2,
		borderColor: '#d1d5db',
		borderStyle: 'dashed',
		borderRadius: 12,
		padding: 40,
		alignItems: 'center',
		marginBottom: 20,
		backgroundColor: '#f9fafb',
	},
	uploadIcono: {
		fontSize: 48,
		marginBottom: 12,
	},
	uploadPrimaryText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 8,
		textAlign: 'center',
	},
	uploadSecondaryText: {
		fontSize: 12,
		color: '#6b7280',
		textAlign: 'center',
	},

	// Archivo Seleccionado
	archivoSeleccionado: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		padding: 12,
		marginBottom: 20,
	},
	archivoInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	archivoIcono: {
		fontSize: 24,
		marginRight: 12,
	},
	archivoDetalles: {
		flex: 1,
	},
	archivoNombre: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 2,
	},
	archivoTamano: {
		fontSize: 12,
		color: '#6b7280',
	},
	btnRemover: {
		fontSize: 28,
		color: '#6b7280',
		fontWeight: '300',
		paddingLeft: 8,
	},

	// Form
	formGroup: {
		marginBottom: 16,
	},
	formLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginBottom: 8,
	},
	required: {
		color: '#dc2626',
	},
	input: {
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 14,
		fontSize: 15,
		color: '#1f2937',
		backgroundColor: 'white',
	},
	textarea: {
		minHeight: 80,
		textAlignVertical: 'top',
	},

	// Picker Custom
	pickerContainer: {
		marginTop: 4,
	},
	pickerButton: {
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 14,
		backgroundColor: '#f9fafb',
	},
	pickerButtonText: {
		fontSize: 15,
		color: '#1f2937',
	},
	pickerButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	pickerBtn: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 6,
		backgroundColor: '#f3f4f6',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	pickerBtnActive: {
		backgroundColor: '#dbeafe',
		borderColor: '#2ea3ff',
	},
	pickerBtnText: {
		fontSize: 13,
		color: '#6b7280',
	},
	pickerBtnTextActive: {
		color: '#2ea3ff',
		fontWeight: '600',
	},

	// Modal Buttons
	modalButtons: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 24,
	},
	btnCancelar: {
		flex: 1,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 8,
		backgroundColor: '#f3f4f6',
		alignItems: 'center',
	},
	btnCancelarText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#374151',
	},
	btnPrimary: {
		flex: 1,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 8,
		backgroundColor: '#2ea3ff',
		alignItems: 'center',
	},
	btnPrimaryText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},
	btnDisabled: {
		backgroundColor: '#9ca3af',
	},
});
