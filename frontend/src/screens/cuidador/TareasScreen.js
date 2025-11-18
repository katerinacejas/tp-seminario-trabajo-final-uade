import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	TextInput,
	Modal,
	ScrollView,
	Alert,
	ActivityIndicator,
	Platform,
} from 'react-native';
import { tareasAPI } from '../../services/api';
import { usePaciente } from '../../context/PacienteContext';

export default function TareasScreen() {
	const { pacienteSeleccionado } = usePaciente();
	const pacienteId = pacienteSeleccionado?.id;

	const [tareas, setTareas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showModalCrear, setShowModalCrear] = useState(false);
	const [showModalEditar, setShowModalEditar] = useState(false);
	const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

	// Estados de ordenamiento
	const [ordenFecha, setOrdenFecha] = useState(null);
	const [ordenFechaDir, setOrdenFechaDir] = useState(null);
	const [ordenPrioridad, setOrdenPrioridad] = useState(null);

	// Estados de filtros
	const [filtroEstado, setFiltroEstado] = useState('TODAS');
	const [filtroRangoInicio, setFiltroRangoInicio] = useState('');
	const [filtroRangoFin, setFiltroRangoFin] = useState('');

	// Modo reordenamiento manual
	const [modoReordenar, setModoReordenar] = useState(false);

	// Form states
	const [formData, setFormData] = useState({
		titulo: '',
		descripcion: '',
		fechaVencimiento: '',
		prioridad: 'MEDIA',
	});

	useEffect(() => {
		if (pacienteId) {
			cargarTareas();
		}
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

	// ORDENAMIENTO Y FILTROS
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
					return bFecha - aFecha;
				} else {
					return aFecha - bFecha;
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

	// Ciclar estados de ordenamiento
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

	// CRUD OPERATIONS
	const handleCrearTarea = async () => {
		try {
			if (!formData.titulo.trim()) {
				Alert.alert('Error', 'El título es obligatorio');
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
			Alert.alert('Error', 'Error al crear la tarea');
		}
	};

	const handleEditarTarea = async () => {
		try {
			if (!formData.titulo.trim()) {
				Alert.alert('Error', 'El título es obligatorio');
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
			Alert.alert('Error', 'Error al editar la tarea');
		}
	};

	const handleToggleTarea = async (tareaId) => {
		try {
			await tareasAPI.toggleCompletada(tareaId);
			await cargarTareas();
		} catch (err) {
			console.error('Error al cambiar estado:', err);
			Alert.alert('Error', 'Error al cambiar el estado de la tarea');
		}
	};

	const handleEliminarTarea = (tarea) => {
		Alert.alert(
			'¿Eliminar tarea?',
			`Estás por eliminar "${tarea.titulo}"\n\nEsta acción no se puede deshacer`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Eliminar',
					style: 'destructive',
					onPress: async () => {
						try {
							await tareasAPI.eliminar(tarea.id);
							await cargarTareas();
						} catch (err) {
							console.error('Error al eliminar tarea:', err);
							Alert.alert('Error', 'Error al eliminar la tarea');
						}
					},
				},
			]
		);
	};

	const handleMoverArriba = async (tareaId) => {
		try {
			await tareasAPI.moverArriba(tareaId);
			await cargarTareas();
		} catch (err) {
			console.error('Error al mover tarea:', err);
			Alert.alert('Error', 'Error al mover la tarea');
		}
	};

	const handleMoverAbajo = async (tareaId) => {
		try {
			await tareasAPI.moverAbajo(tareaId);
			await cargarTareas();
		} catch (err) {
			console.error('Error al mover tarea:', err);
			Alert.alert('Error', 'Error al mover la tarea');
		}
	};

	// HELPERS
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

	const formatearFecha = (fechaStr) => {
		if (!fechaStr) return null;

		const fecha = new Date(fechaStr);
		const ahora = new Date();
		const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
		const fechaSolo = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

		const diffMs = fechaSolo - hoy;
		const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDias < 0) {
			const diasAtras = Math.abs(diffDias);
			return `Venció hace ${diasAtras} ${diasAtras === 1 ? 'día' : 'días'}`;
		} else if (diffDias === 0) {
			return 'Vence hoy';
		} else {
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

	const getPrioridadColor = (prioridad) => {
		switch (prioridad) {
			case 'ALTA':
				return '#E53935';
			case 'MEDIA':
				return '#FFA726';
			case 'BAJA':
				return '#66BB6A';
			default:
				return '#999999';
		}
	};

	// RENDER
	const tareasFinales = tareasOrdenadas();
	const hayOrdenamientoActivo = ordenFecha || ordenFechaDir || ordenPrioridad;

	const renderTarea = ({ item, index }) => {
		const expirada = esTareaExpirada(item.fechaVencimiento) && !item.completada;

		return (
			<View
				style={[
					styles.tareaItem,
					item.completada && styles.tareaCompletada,
					expirada && styles.tareaExpirada,
				]}
			>
				{/* Checkbox */}
				<TouchableOpacity
					style={styles.tareaCheckbox}
					onPress={() => handleToggleTarea(item.id)}
				>
					<View
						style={[
							styles.checkbox,
							item.completada && styles.checkboxCompletada,
						]}
					>
						{item.completada && <Text style={styles.checkboxIcon}>✓</Text>}
					</View>
				</TouchableOpacity>

				{/* Contenido */}
				<View style={styles.tareaContenido}>
					<Text style={[styles.tareaTitulo, item.completada && styles.tareaTextoCompletado]}>
						{item.titulo}
					</Text>

					{item.descripcion && (
						<Text style={[styles.tareaDescripcion, item.completada && styles.tareaTextoCompletado]}>
							{item.descripcion}
						</Text>
					)}

					<View style={styles.tareaMeta}>
						{item.fechaVencimiento && (
							<View style={styles.metaItem}>
								<Text style={styles.metaIcon}>📅</Text>
								<Text style={styles.metaTexto}>{formatearFecha(item.fechaVencimiento)}</Text>
							</View>
						)}

						<View style={[styles.metaItem, { backgroundColor: getPrioridadColor(item.prioridad) + '20' }]}>
							<Text style={styles.metaIcon}>⚠️</Text>
							<Text style={[styles.metaTexto, { color: getPrioridadColor(item.prioridad) }]}>
								{item.prioridad}
							</Text>
						</View>
					</View>
				</View>

				{/* Acciones */}
				<View style={styles.tareaAcciones}>
					{modoReordenar && !hayOrdenamientoActivo && (
						<>
							<TouchableOpacity
								style={styles.btnAccion}
								onPress={() => handleMoverArriba(item.id)}
								disabled={index === 0}
							>
								<Text style={styles.btnAccionText}>↑</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.btnAccion}
								onPress={() => handleMoverAbajo(item.id)}
								disabled={index === tareasFinales.length - 1}
							>
								<Text style={styles.btnAccionText}>↓</Text>
							</TouchableOpacity>
						</>
					)}

					<TouchableOpacity
						style={styles.btnAccion}
						onPress={() => abrirModalEditar(item)}
					>
						<Text style={styles.btnAccionText}>✏️</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.btnAccion}
						onPress={() => handleEliminarTarea(item)}
					>
						<Text style={styles.btnAccionText}>🗑️</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Lista de Tareas</Text>
				<Text style={styles.headerSubtitulo}>
					Gestiona las tareas del día a día con recordatorios y prioridades
				</Text>
			</View>

			{/* Botón Agregar */}
			<TouchableOpacity
				style={styles.btnAgregarTarea}
				onPress={() => setShowModalCrear(true)}
			>
				<Text style={styles.btnAgregarText}>+</Text>
			</TouchableOpacity>

			{/* Controles de Ordenamiento */}
			<View style={styles.controlesContainer}>
				<Text style={styles.controlesTitulo}>Ordenamiento</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={styles.controlesButtons}>
						<TouchableOpacity
							style={[styles.controlBtn, ordenFecha && styles.controlBtnActive]}
							onPress={ciclarOrdenFecha}
						>
							<Text style={styles.controlBtnText}>
								{!ordenFecha ? 'Fecha: Off' : ordenFecha === 'conFecha' ? 'Con Fecha ↑' : 'Sin Fecha ↑'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.controlBtn, ordenFechaDir && styles.controlBtnActive]}
							onPress={ciclarOrdenFechaDir}
						>
							<Text style={styles.controlBtnText}>
								{!ordenFechaDir ? 'Orden Fecha: Off' : ordenFechaDir === 'ASC' ? 'Fecha ↑' : 'Fecha ↓'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.controlBtn, ordenPrioridad && styles.controlBtnActive]}
							onPress={ciclarOrdenPrioridad}
						>
							<Text style={styles.controlBtnText}>
								{!ordenPrioridad ? 'Prioridad: Off' : ordenPrioridad === 'ASC' ? 'Prioridad ↓' : 'Prioridad ↑'}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.controlBtn, modoReordenar && styles.controlBtnActive]}
							onPress={() => setModoReordenar(!modoReordenar)}
							disabled={hayOrdenamientoActivo}
						>
							<Text style={styles.controlBtnText}>Reordenar</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>

				{/* Filtros */}
				<Text style={styles.controlesTitulo}>Filtros</Text>
				<View style={styles.filtroEstado}>
					<TouchableOpacity
						style={[styles.filtroBtn, filtroEstado === 'TODAS' && styles.filtroBtnActive]}
						onPress={() => setFiltroEstado('TODAS')}
					>
						<Text style={styles.filtroBtnText}>Todas</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.filtroBtn, filtroEstado === 'PENDIENTES' && styles.filtroBtnActive]}
						onPress={() => setFiltroEstado('PENDIENTES')}
					>
						<Text style={styles.filtroBtnText}>Pendientes</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.filtroBtn, filtroEstado === 'COMPLETADAS' && styles.filtroBtnActive]}
						onPress={() => setFiltroEstado('COMPLETADAS')}
					>
						<Text style={styles.filtroBtnText}>Completadas</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Lista de Tareas */}
			<View style={styles.tareasContenido}>
				{loading && <ActivityIndicator size="large" color="#00A67E" style={styles.loading} />}

				{error && <Text style={styles.mensajeError}>{error}</Text>}

				{!loading && !error && tareasFinales.length === 0 && (
					<View style={styles.mensajeVacio}>
						<Text style={styles.mensajeVacioIcon}>✓</Text>
						<Text style={styles.mensajeVacioTexto}>No hay tareas para mostrar</Text>
						<Text style={styles.mensajeVacioSecundario}>
							Crea una nueva tarea usando el botón de arriba
						</Text>
					</View>
				)}

				{!loading && !error && tareasFinales.length > 0 && (
					<FlatList
						data={tareasFinales}
						renderItem={renderTarea}
						keyExtractor={(item) => item.id.toString()}
						contentContainerStyle={styles.tareasLista}
					/>
				)}
			</View>

			{/* Modal Crear Tarea */}
			<Modal visible={showModalCrear} animationType="slide" transparent={true}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalTarea}>
						<ScrollView>
							<View style={styles.modalHeader}>
								<Text style={styles.modalHeaderText}>Nueva Tarea</Text>
								<TouchableOpacity onPress={() => setShowModalCrear(false)}>
									<Text style={styles.btnCerrarModal}>✕</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.modalBody}>
								<View style={styles.formGroup}>
									<Text style={styles.label}>Título *</Text>
									<TextInput
										style={styles.input}
										value={formData.titulo}
										onChangeText={(text) => setFormData({ ...formData, titulo: text })}
										placeholder="Ej: Comprar medicamentos"
										maxLength={255}
									/>
								</View>

								<View style={styles.formGroup}>
									<Text style={styles.label}>Descripción</Text>
									<TextInput
										style={[styles.input, styles.textarea]}
										value={formData.descripcion}
										onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
										placeholder="Detalles adicionales (opcional)"
										multiline
										numberOfLines={3}
									/>
								</View>

								<View style={styles.formGroup}>
									<Text style={styles.label}>Fecha de vencimiento</Text>
									<TextInput
										style={styles.input}
										value={formData.fechaVencimiento}
										onChangeText={(text) => setFormData({ ...formData, fechaVencimiento: text })}
										placeholder="YYYY-MM-DDTHH:MM"
									/>
								</View>

								<View style={styles.formGroup}>
									<Text style={styles.label}>Prioridad</Text>
									<View style={styles.prioridadButtons}>
										{['BAJA', 'MEDIA', 'ALTA'].map((prioridad) => (
											<TouchableOpacity
												key={prioridad}
												style={[
													styles.prioridadBtn,
													formData.prioridad === prioridad && styles.prioridadBtnActive,
												]}
												onPress={() => setFormData({ ...formData, prioridad })}
											>
												<Text style={styles.prioridadBtnText}>{prioridad}</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							</View>

							<View style={styles.modalFooter}>
								<TouchableOpacity
									style={styles.btnCancelar}
									onPress={() => setShowModalCrear(false)}
								>
									<Text style={styles.btnCancelarText}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.btnPrimary} onPress={handleCrearTarea}>
									<Text style={styles.btnPrimaryText}>Crear Tarea</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Modal Editar Tarea */}
			<Modal visible={showModalEditar} animationType="slide" transparent={true}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalTarea}>
						<ScrollView>
							<View style={styles.modalHeader}>
								<Text style={styles.modalHeaderText}>Editar Tarea</Text>
								<TouchableOpacity onPress={() => setShowModalEditar(false)}>
									<Text style={styles.btnCerrarModal}>✕</Text>
								</TouchableOpacity>
							</View>

							<View style={styles.modalBody}>
								<View style={styles.formGroup}>
									<Text style={styles.label}>Título *</Text>
									<TextInput
										style={styles.input}
										value={formData.titulo}
										onChangeText={(text) => setFormData({ ...formData, titulo: text })}
										placeholder="Ej: Comprar medicamentos"
										maxLength={255}
									/>
								</View>

								<View style={styles.formGroup}>
									<Text style={styles.label}>Descripción</Text>
									<TextInput
										style={[styles.input, styles.textarea]}
										value={formData.descripcion}
										onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
										placeholder="Detalles adicionales (opcional)"
										multiline
										numberOfLines={3}
									/>
								</View>

								<View style={styles.formGroup}>
									<Text style={styles.label}>Fecha de vencimiento</Text>
									<TextInput
										style={styles.input}
										value={formData.fechaVencimiento}
										onChangeText={(text) => setFormData({ ...formData, fechaVencimiento: text })}
										placeholder="YYYY-MM-DDTHH:MM"
									/>
								</View>

								<View style={styles.formGroup}>
									<Text style={styles.label}>Prioridad</Text>
									<View style={styles.prioridadButtons}>
										{['BAJA', 'MEDIA', 'ALTA'].map((prioridad) => (
											<TouchableOpacity
												key={prioridad}
												style={[
													styles.prioridadBtn,
													formData.prioridad === prioridad && styles.prioridadBtnActive,
												]}
												onPress={() => setFormData({ ...formData, prioridad })}
											>
												<Text style={styles.prioridadBtnText}>{prioridad}</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							</View>

							<View style={styles.modalFooter}>
								<TouchableOpacity
									style={styles.btnCancelar}
									onPress={() => setShowModalEditar(false)}
								>
									<Text style={styles.btnCancelarText}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.btnPrimary} onPress={handleEditarTarea}>
									<Text style={styles.btnPrimaryText}>Guardar Cambios</Text>
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
		backgroundColor: '#F5F5F5',
		position: 'relative',
	},
	header: {
		backgroundColor: '#FFFFFF',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333333',
		marginBottom: 4,
	},
	headerSubtitulo: {
		fontSize: 14,
		color: '#666666',
	},
	btnAgregarTarea: {
		position: 'absolute',
		right: 20,
		bottom: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#00A67E',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		zIndex: 1000,
	},
	btnAgregarText: {
		fontSize: 32,
		color: '#FFFFFF',
		fontWeight: 'bold',
	},
	controlesContainer: {
		backgroundColor: '#FFFFFF',
		padding: 16,
		marginTop: 8,
	},
	controlesTitulo: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333333',
		marginBottom: 8,
	},
	controlesButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	controlBtn: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		backgroundColor: '#FFFFFF',
	},
	controlBtnActive: {
		backgroundColor: '#00A67E',
		borderColor: '#00A67E',
	},
	controlBtnText: {
		fontSize: 14,
		color: '#333333',
	},
	filtroEstado: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 8,
	},
	filtroBtn: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
	},
	filtroBtnActive: {
		backgroundColor: '#00A67E',
		borderColor: '#00A67E',
	},
	filtroBtnText: {
		fontSize: 14,
		color: '#333333',
	},
	tareasContenido: {
		flex: 1,
	},
	loading: {
		marginTop: 40,
	},
	mensajeError: {
		textAlign: 'center',
		color: '#E53935',
		marginTop: 40,
		fontSize: 16,
	},
	mensajeVacio: {
		alignItems: 'center',
		marginTop: 60,
	},
	mensajeVacioIcon: {
		fontSize: 48,
		marginBottom: 16,
	},
	mensajeVacioTexto: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333333',
		marginBottom: 8,
	},
	mensajeVacioSecundario: {
		fontSize: 14,
		color: '#999999',
		textAlign: 'center',
	},
	tareasLista: {
		padding: 16,
		paddingBottom: 80,
	},
	tareaItem: {
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		flexDirection: 'row',
		borderWidth: 1,
		borderColor: '#E0E0E0',
	},
	tareaCompletada: {
		opacity: 0.6,
		backgroundColor: '#F5F5F5',
	},
	tareaExpirada: {
		borderColor: '#E53935',
		borderWidth: 2,
	},
	tareaCheckbox: {
		paddingRight: 12,
		justifyContent: 'flex-start',
		paddingTop: 2,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#E0E0E0',
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkboxCompletada: {
		backgroundColor: '#00A67E',
		borderColor: '#00A67E',
	},
	checkboxIcon: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	tareaContenido: {
		flex: 1,
	},
	tareaTitulo: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333333',
		marginBottom: 4,
	},
	tareaTextoCompletado: {
		textDecorationLine: 'line-through',
		color: '#999999',
	},
	tareaDescripcion: {
		fontSize: 14,
		color: '#666666',
		marginBottom: 8,
	},
	tareaMeta: {
		flexDirection: 'row',
		gap: 8,
		flexWrap: 'wrap',
	},
	metaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 4,
		backgroundColor: '#F5F5F5',
	},
	metaIcon: {
		fontSize: 12,
	},
	metaTexto: {
		fontSize: 12,
		color: '#666666',
	},
	tareaAcciones: {
		flexDirection: 'row',
		gap: 4,
		marginLeft: 8,
	},
	btnAccion: {
		padding: 8,
	},
	btnAccionText: {
		fontSize: 18,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		padding: 16,
	},
	modalTarea: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 20,
		maxHeight: '90%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	modalHeaderText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333333',
	},
	btnCerrarModal: {
		fontSize: 28,
		color: '#999999',
	},
	modalBody: {
		marginBottom: 16,
	},
	formGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333333',
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		padding: 12,
		fontSize: 14,
		color: '#333333',
		backgroundColor: '#FFFFFF',
	},
	textarea: {
		minHeight: 80,
		textAlignVertical: 'top',
	},
	prioridadButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	prioridadBtn: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
	},
	prioridadBtnActive: {
		backgroundColor: '#00A67E',
		borderColor: '#00A67E',
	},
	prioridadBtnText: {
		fontSize: 14,
		color: '#333333',
	},
	modalFooter: {
		flexDirection: 'row',
		gap: 12,
	},
	btnCancelar: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
	},
	btnCancelarText: {
		fontSize: 16,
		color: '#666666',
	},
	btnPrimary: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 8,
		backgroundColor: '#00A67E',
		alignItems: 'center',
	},
	btnPrimaryText: {
		fontSize: 16,
		color: '#FFFFFF',
		fontWeight: '600',
	},
});
