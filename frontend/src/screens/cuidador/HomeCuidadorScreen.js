import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePaciente } from '../../context/PacienteContext';
import { usuariosAPI, recordatoriosAPI, tareasAPI } from '../../services/api';

export default function HomeCuidadorScreen() {
	const navigation = useNavigation();
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
			Alert.alert('Error', 'Error al cambiar el estado de la tarea');
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
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#2ea3ff" style={styles.loader} />
				<Text style={styles.loadingText}>Cargando información...</Text>
			</View>
		);
	}

	if (!pacienteSeleccionado) {
		return (
			<ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<View style={styles.headerIcon} />
					<View style={styles.headerContent}>
						<Text style={styles.titulo}>Bienvenidx de nuevo {cuidadorNombre}</Text>
						<Text style={styles.subtitulo}>
							Selecciona un paciente en el menú superior para comenzar
						</Text>
					</View>
				</View>
			</ScrollView>
		);
	}

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
			{/* Header de Bienvenida */}
			<View style={styles.header}>
				<View style={styles.headerIcon} />
				<View style={styles.headerContent}>
					<Text style={styles.titulo}>Bienvenidx de nuevo {cuidadorNombre}</Text>
					<Text style={styles.subtitulo}>
						Resumen de hoy para tu paciente{' '}
						<Text style={styles.subtituloStrong}>{pacienteSeleccionado.nombreCompleto}</Text>
					</Text>
				</View>
			</View>

			{error && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			)}

			{/* Sección: Recordatorios de hoy */}
			<View style={styles.seccion}>
				<Text style={styles.seccionTitulo}>Recordatorios de hoy</Text>

				{recordatoriosHoy.length === 0 ? (
					<View style={styles.mensajeVacio}>
						<Text style={styles.mensajeVacioIcono}>📅</Text>
						<Text style={styles.mensajeVacioTexto}>No hay recordatorios para hoy</Text>
					</View>
				) : (
					<View style={styles.itemLista}>
						{recordatoriosHoy.map((recordatorio) => (
							<TouchableOpacity
								key={recordatorio.id}
								style={styles.item}
								onPress={() => navigation.navigate('Recordatorios')}
								activeOpacity={0.7}
							>
								<Text style={styles.itemIcono}>💊</Text>
								<View style={styles.itemContenido}>
									<Text style={styles.itemTitulo}>
										{recordatorio.nombre || recordatorio.titulo}
									</Text>
									<Text style={styles.itemHora}>
										{recordatorio.horaProgramada
											? `${recordatorio.horaProgramada} hs`
											: recordatorio.fechaHora
											? formatearHora(recordatorio.fechaHora)
											: ''}
									</Text>
								</View>
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>

			{/* Sección: Tareas pendientes */}
			<View style={styles.seccion}>
				<Text style={styles.seccionTitulo}>Tareas pendientes</Text>

				{tareasPendientes.length === 0 ? (
					<View style={styles.mensajeVacio}>
						<Text style={styles.mensajeVacioIcono}>✅</Text>
						<Text style={styles.mensajeVacioTexto}>¡Todo listo por hoy!</Text>
					</View>
				) : (
					<View style={styles.itemLista}>
						{tareasPendientes.map((tarea) => (
							<View key={tarea.id} style={styles.tareaItem}>
								<TouchableOpacity
									style={styles.tareaCheckbox}
									onPress={() => handleToggleTarea(tarea.id)}
									activeOpacity={0.7}
								>
									<Text style={[styles.checkboxIcono, tarea.completada && styles.checkboxCompletado]}>
										{tarea.completada ? '✓' : '○'}
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.tareaContenido}
									onPress={() => navigation.navigate('Tareas')}
									activeOpacity={0.7}
								>
									<Text style={styles.itemTitulo}>{tarea.titulo}</Text>
									{tarea.fechaVencimiento && (
										<Text style={styles.itemHora}>{formatearHora(tarea.fechaVencimiento)}</Text>
									)}
								</TouchableOpacity>
							</View>
						))}
					</View>
				)}
			</View>

			{/* Sección: Resumen del paciente */}
			<View style={styles.seccion}>
				<Text style={styles.seccionTitulo}>Resumen del paciente</Text>

				<View style={styles.resumenGrid}>
					<View style={styles.resumenItem}>
						<Text style={styles.resumenLabel}>NOMBRE</Text>
						<Text style={styles.resumenValor}>{pacienteSeleccionado.nombreCompleto}</Text>
					</View>

					{pacienteSeleccionado.edad && (
						<View style={styles.resumenItem}>
							<Text style={styles.resumenLabel}>EDAD</Text>
							<Text style={styles.resumenValor}>{pacienteSeleccionado.edad} años</Text>
						</View>
					)}

					{pacienteSeleccionado.condicionesMedicas && (
						<View style={styles.resumenItem}>
							<Text style={styles.resumenLabel}>CONDICIONES</Text>
							<Text style={styles.resumenValor}>{pacienteSeleccionado.condicionesMedicas}</Text>
						</View>
					)}

					{pacienteSeleccionado.observaciones && (
						<View style={styles.resumenItem}>
							<Text style={styles.resumenLabel}>NOTAS IMPORTANTES</Text>
							<Text style={styles.resumenValor}>{pacienteSeleccionado.observaciones}</Text>
						</View>
					)}
				</View>
			</View>
		</ScrollView>
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
	loader: {
		marginTop: 60,
	},
	loadingText: {
		textAlign: 'center',
		marginTop: 20,
		color: '#6b7280',
		fontSize: 15,
	},

	// Header de Bienvenida
	header: {
		backgroundColor: 'white',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		padding: 24,
		marginBottom: 20,
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	headerIcon: {
		width: 4,
		backgroundColor: '#2ea3ff',
		borderRadius: 2,
		alignSelf: 'stretch',
		marginRight: 12,
	},
	headerContent: {
		flex: 1,
	},
	titulo: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
	},
	subtitulo: {
		fontSize: 14,
		color: '#6b7280',
		lineHeight: 21,
	},
	subtituloStrong: {
		color: '#1f2937',
		fontWeight: '600',
	},

	// Error
	errorContainer: {
		backgroundColor: '#fef2f2',
		borderWidth: 1,
		borderColor: '#fecaca',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
	},
	errorText: {
		color: '#dc2626',
		fontSize: 14,
	},

	// Cards de Secciones
	seccion: {
		backgroundColor: 'white',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		padding: 24,
		marginBottom: 20,
	},
	seccionTitulo: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 16,
	},

	// Lista de Items (Recordatorios/Tareas)
	itemLista: {
		gap: 12,
	},
	item: {
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		padding: 14,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: 'transparent',
		marginBottom: 12,
	},
	itemIcono: {
		fontSize: 24,
		marginRight: 12,
	},
	itemContenido: {
		flex: 1,
	},
	itemTitulo: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 4,
	},
	itemHora: {
		fontSize: 13,
		color: '#6b7280',
	},

	// Checkbox para Tareas
	tareaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		padding: 14,
		borderWidth: 2,
		borderColor: 'transparent',
		marginBottom: 12,
	},
	tareaCheckbox: {
		marginRight: 12,
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkboxIcono: {
		fontSize: 24,
		color: '#6b7280',
	},
	checkboxCompletado: {
		color: '#10b981',
	},
	tareaContenido: {
		flex: 1,
	},

	// Resumen del Paciente
	resumenGrid: {
		gap: 16,
	},
	resumenItem: {
		marginBottom: 12,
	},
	resumenLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6b7280',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 4,
	},
	resumenValor: {
		fontSize: 15,
		color: '#1f2937',
		lineHeight: 22,
	},

	// Estados Vacíos
	mensajeVacio: {
		alignItems: 'center',
		paddingVertical: 40,
		paddingHorizontal: 20,
	},
	mensajeVacioIcono: {
		fontSize: 48,
		marginBottom: 12,
	},
	mensajeVacioTexto: {
		fontSize: 14,
		color: '#9ca3af',
		fontWeight: '500',
	},
});
