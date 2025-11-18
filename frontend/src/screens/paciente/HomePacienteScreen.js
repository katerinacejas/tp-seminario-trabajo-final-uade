import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usuariosAPI, cuidadoresPacientesAPI, recordatoriosAPI, documentosAPI } from '../../services/api';

export default function HomePacienteScreen() {
	const navigation = useNavigation();
	const [paciente, setPaciente] = useState(null);
	const [cuidadores, setCuidadores] = useState([]);
	const [recordatorios, setRecordatorios] = useState([]);
	const [fichaMedica, setFichaMedica] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		cargarDatos();
	}, []);

	const cargarDatos = async () => {
		try {
			setLoading(true);

			// Obtener datos del paciente
			const usuarioData = await usuariosAPI.getMe();
			setPaciente(usuarioData);

			// Cargar cuidadores
			await cargarCuidadores(usuarioData.id);

			// Cargar recordatorios de hoy
			await cargarRecordatoriosHoy(usuarioData.id);

			// Cargar ficha médica más reciente
			await cargarFichaMedica(usuarioData.id);
		} catch (error) {
			console.error('Error cargando datos:', error);
			Alert.alert('Error', 'No se pudieron cargar los datos');
		} finally {
			setLoading(false);
		}
	};

	const cargarCuidadores = async (usuarioId) => {
		try {
			const data = await cuidadoresPacientesAPI.getByPaciente(usuarioId);
			setCuidadores(data || []);
		} catch (error) {
			console.error('Error cargando cuidadores:', error);
			setCuidadores([]);
		}
	};

	const cargarRecordatoriosHoy = async (usuarioId) => {
		try {
			const hoy = new Date();
			const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];

			const data = await recordatoriosAPI.getDelDia(usuarioId, formatoFecha(hoy));

			// Filtrar solo medicamentos y citas médicas
			const recordatoriosFiltrados = (data || []).filter(
				(r) => r.tipo === 'MEDICAMENTO' || r.tipo === 'CITA_MEDICA'
			);

			setRecordatorios(recordatoriosFiltrados);
		} catch (error) {
			console.error('Error cargando recordatorios:', error);
			setRecordatorios([]);
		}
	};

	const cargarFichaMedica = async (usuarioId) => {
		try {
			const fichas = await documentosAPI.getFichasMedicas(usuarioId);

			if (fichas && fichas.length > 0) {
				// Ordenar por fecha de creación descendente y tomar la primera
				const fichaReciente = fichas.sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
				)[0];
				setFichaMedica(fichaReciente);
			} else {
				setFichaMedica(null);
			}
		} catch (error) {
			console.error('Error cargando ficha médica:', error);
			setFichaMedica(null);
		}
	};

	const descargarFicha = () => {
		if (fichaMedica) {
			const url = documentosAPI.descargar(fichaMedica.id);
			Linking.openURL(url).catch((err) => {
				console.error('Error abriendo URL:', err);
				Alert.alert('Error', 'No se pudo abrir la ficha médica');
			});
		}
	};

	const formatearHora = (fechaHora) => {
		const fecha = new Date(fechaHora);
		const horas = String(fecha.getHours()).padStart(2, '0');
		const minutos = String(fecha.getMinutes()).padStart(2, '0');
		return `${horas}:${minutos}`;
	};

	const formatearFecha = (fechaStr) => {
		const fecha = new Date(fechaStr);
		return fecha.toLocaleDateString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#2ea3ff" style={styles.loader} />
				<Text style={styles.loadingText}>Cargando...</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
			{/* Welcome Section */}
			<View style={styles.welcomeSection}>
				<Text style={styles.welcomeTitulo}>Bienvenidx de nuevo</Text>
				<Text style={styles.welcomeNombre}>{paciente?.nombreCompleto || 'Paciente'}</Text>
				<Text style={styles.welcomeSubtitulo}>Acciones rápidas y claras para vos.</Text>
			</View>

			{/* Mis Cuidadores */}
			<View style={styles.sectionCard}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitulo}>Mis cuidadores</Text>
					<TouchableOpacity onPress={() => navigation.navigate('MisCuidadores')}>
						<Text style={styles.linkBtn}>Gestionar cuidadores</Text>
					</TouchableOpacity>
				</View>

				{cuidadores.length > 0 ? (
					<View style={styles.cuidadoresList}>
						{cuidadores.map((cuidador) => (
							<View key={cuidador.id} style={styles.cuidadorItem}>
								<View style={styles.cuidadorIcon}>
									<Text style={styles.iconText}>👤</Text>
								</View>
								<View style={styles.cuidadorInfo}>
									<Text style={styles.cuidadorNombre}>{cuidador.nombreCompleto}</Text>
									<Text style={styles.cuidadorEmail}>{cuidador.email}</Text>
								</View>
							</View>
						))}
					</View>
				) : (
					<View style={styles.emptyState}>
						<Text style={styles.emptyStateIcon}>👥</Text>
						<Text style={styles.emptyStateText}>No tenés cuidadores asignados aún.</Text>
						<Text style={styles.emptyStateSubtext}>Invitá a alguien para que te ayude.</Text>
					</View>
				)}
			</View>

			{/* Recordatorios de hoy */}
			<View style={styles.sectionCard}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitulo}>Recordatorios de hoy</Text>
				</View>

				{recordatorios.length > 0 ? (
					<View style={styles.recordatoriosList}>
						{recordatorios.map((recordatorio) => (
							<View key={recordatorio.id} style={styles.recordatorioItem}>
								<View
									style={[
										styles.recordatorioIcon,
										recordatorio.tipo === 'CITA_MEDICA' && styles.recordatorioIconCita,
									]}
								>
									<Text style={styles.iconText}>
										{recordatorio.tipo === 'MEDICAMENTO' ? '💊' : '📅'}
									</Text>
								</View>
								<View style={styles.recordatorioInfo}>
									<Text style={styles.recordatorioTitulo}>{recordatorio.descripcion}</Text>
									<Text style={styles.recordatorioHora}>
										{formatearHora(recordatorio.fechaHora)}
									</Text>
									{recordatorio.observaciones && (
										<Text style={styles.recordatorioDetalles}>
											{recordatorio.observaciones}
										</Text>
									)}
								</View>
							</View>
						))}
					</View>
				) : (
					<View style={styles.emptyState}>
						<Text style={styles.emptyStateIcon}>📅</Text>
						<Text style={styles.emptyStateText}>No hay recordatorios para hoy.</Text>
					</View>
				)}
			</View>

			{/* Ficha Médica más reciente */}
			<View style={styles.sectionCard}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitulo}>Ficha Médica más reciente</Text>
				</View>

				{fichaMedica ? (
					<View style={styles.fichaItem}>
						<View style={styles.fichaInfo}>
							<Text style={styles.fichaNombre}>{fichaMedica.nombre}</Text>
							<Text style={styles.fichaTipo}>
								PDF subido el {formatearFecha(fichaMedica.createdAt)}
							</Text>
						</View>
						<TouchableOpacity style={styles.fichaBtn} onPress={descargarFicha}>
							<Text style={styles.fichaBtnIcon}>📄</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.emptyState}>
						<Text style={styles.emptyStateIcon}>📄</Text>
						<Text style={styles.emptyStateText}>No hay fichas médicas cargadas.</Text>
					</View>
				)}
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

	// Welcome Section
	welcomeSection: {
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
	welcomeTitulo: {
		fontSize: 20,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 4,
	},
	welcomeNombre: {
		fontSize: 26,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
	},
	welcomeSubtitulo: {
		fontSize: 14,
		color: '#6b7280',
	},

	// Section Cards
	sectionCard: {
		backgroundColor: 'white',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		padding: 20,
		marginBottom: 20,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	sectionTitulo: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
	},
	linkBtn: {
		fontSize: 14,
		color: '#2ea3ff',
		fontWeight: '600',
	},

	// Cuidadores List
	cuidadoresList: {
		gap: 12,
	},
	cuidadorItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		padding: 14,
		marginBottom: 8,
	},
	cuidadorIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#e0f2fe',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	iconText: {
		fontSize: 20,
	},
	cuidadorInfo: {
		flex: 1,
	},
	cuidadorNombre: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 2,
	},
	cuidadorEmail: {
		fontSize: 13,
		color: '#6b7280',
	},

	// Recordatorios List
	recordatoriosList: {
		gap: 12,
	},
	recordatorioItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		padding: 14,
		marginBottom: 8,
	},
	recordatorioIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#dbeafe',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	recordatorioIconCita: {
		backgroundColor: '#fef3c7',
	},
	recordatorioInfo: {
		flex: 1,
	},
	recordatorioTitulo: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 4,
	},
	recordatorioHora: {
		fontSize: 13,
		color: '#6b7280',
		marginBottom: 2,
	},
	recordatorioDetalles: {
		fontSize: 13,
		color: '#6b7280',
		fontStyle: 'italic',
	},

	// Ficha Médica
	fichaItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		padding: 14,
	},
	fichaInfo: {
		flex: 1,
	},
	fichaNombre: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
		marginBottom: 4,
	},
	fichaTipo: {
		fontSize: 13,
		color: '#6b7280',
	},
	fichaBtn: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#e0f2fe',
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 12,
	},
	fichaBtnIcon: {
		fontSize: 20,
	},

	// Empty State
	emptyState: {
		alignItems: 'center',
		paddingVertical: 32,
		paddingHorizontal: 20,
	},
	emptyStateIcon: {
		fontSize: 48,
		marginBottom: 12,
	},
	emptyStateText: {
		fontSize: 14,
		color: '#6b7280',
		fontWeight: '500',
		textAlign: 'center',
		marginBottom: 4,
	},
	emptyStateSubtext: {
		fontSize: 13,
		color: '#9ca3af',
		textAlign: 'center',
	},
});
