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
} from 'react-native';
import { usuariosAPI, cuidadoresPacientesAPI } from '../../services/api';

export default function MisCuidadoresScreen() {
	const [cuidadores, setCuidadores] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showInvitarModal, setShowInvitarModal] = useState(false);
	const [emailCuidador, setEmailCuidador] = useState('');
	const [usuarioId, setUsuarioId] = useState(null);
	const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);

	useEffect(() => {
		cargarDatos();
	}, []);

	const cargarDatos = async () => {
		try {
			setLoading(true);
			const usuario = await usuariosAPI.getMe();
			setUsuarioId(usuario.id);

			const data = await cuidadoresPacientesAPI.getByPaciente(usuario.id);
			setCuidadores(data || []);
		} catch (error) {
			console.error('Error cargando cuidadores:', error);
			setCuidadores([]);
			Alert.alert('Error', 'No se pudieron cargar los cuidadores');
		} finally {
			setLoading(false);
		}
	};

	const handleInvitar = async () => {
		if (!emailCuidador.trim()) {
			Alert.alert('Error', 'Por favor, ingresá un email válido');
			return;
		}

		// Validar formato de email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailCuidador)) {
			Alert.alert('Error', 'El email no tiene un formato válido');
			return;
		}

		try {
			setEnviandoInvitacion(true);
			await cuidadoresPacientesAPI.invitar(usuarioId, emailCuidador);
			Alert.alert('Éxito', 'Invitación enviada exitosamente');
			setShowInvitarModal(false);
			setEmailCuidador('');
			await cargarDatos();
		} catch (error) {
			console.error('Error enviando invitación:', error);
			Alert.alert('Error', error.message || 'Error al enviar invitación');
		} finally {
			setEnviandoInvitacion(false);
		}
	};

	const handleDesvincular = async (cuidador) => {
		Alert.alert(
			'Confirmar',
			`¿Estás seguro que querés desvincular a ${cuidador.nombreCompleto}?`,
			[
				{
					text: 'Cancelar',
					style: 'cancel',
				},
				{
					text: 'Desvincular',
					style: 'destructive',
					onPress: async () => {
						try {
							await cuidadoresPacientesAPI.desvincular(usuarioId, cuidador.usuarioId);
							Alert.alert('Éxito', 'Cuidador desvinculado exitosamente');
							await cargarDatos();
						} catch (error) {
							console.error('Error desvinculando cuidador:', error);
							Alert.alert('Error', 'Error al desvincular cuidador');
						}
					},
				},
			]
		);
	};

	const handleCerrarModal = () => {
		setShowInvitarModal(false);
		setEmailCuidador('');
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
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerIcon} />
					<View style={styles.headerContent}>
						<View style={styles.tituloContainer}>
							<Text style={styles.titulo}>Mis Cuidadores</Text>
							<TouchableOpacity style={styles.btnInfoIcon}>
								<Text style={styles.infoIcono}>ℹ️</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{/* Botón Invitar */}
				<TouchableOpacity
					style={styles.btnInvitar}
					onPress={() => setShowInvitarModal(true)}
					activeOpacity={0.7}
				>
					<Text style={styles.btnInvitarText}>Invitar cuidador</Text>
				</TouchableOpacity>

				{/* Lista de Cuidadores */}
				{cuidadores.length > 0 ? (
					<View style={styles.cuidadoresContainer}>
						{cuidadores.map((cuidador) => (
							<View key={cuidador.id} style={styles.cuidadorCard}>
								<View style={styles.cuidadorIcon}>
									<Text style={styles.cuidadorIconText}>👤</Text>
								</View>
								<View style={styles.cuidadorInfo}>
									<Text style={styles.cuidadorNombre}>{cuidador.nombreCompleto}</Text>
									<Text style={styles.cuidadorEmail}>{cuidador.email}</Text>
								</View>
								<TouchableOpacity
									style={styles.btnDesvincular}
									onPress={() => handleDesvincular(cuidador)}
									activeOpacity={0.7}
								>
									<Text style={styles.btnDesvincularText}>Desvincular</Text>
								</TouchableOpacity>
							</View>
						))}
					</View>
				) : (
					<View style={styles.emptyState}>
						<Text style={styles.emptyIcon}>👥</Text>
						<Text style={styles.emptyTitle}>No tenés cuidadores</Text>
						<Text style={styles.emptySubtitle}>
							Invitá a alguien para que te ayude con tus cuidados
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Modal Invitar Cuidador */}
			<Modal
				visible={showInvitarModal}
				transparent={true}
				animationType="fade"
				onRequestClose={handleCerrarModal}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={handleCerrarModal}
				>
					<TouchableOpacity style={styles.modalContent} activeOpacity={1}>
						<View style={styles.modalIconContainer}>
							<Text style={styles.modalIcon}>✉️</Text>
						</View>
						<Text style={styles.modalTitulo}>Invitar a nuevo cuidador</Text>
						<Text style={styles.modalDescripcion}>
							Enviá una invitación por email a tu nuevo cuidador para Cuido. Cuando tu cuidador
							inicie sesión en la misma dirección de email podrá ver tu perfil.
						</Text>

						<View style={styles.formGroup}>
							<Text style={styles.formLabel}>Ingresá el email de su cuidador...</Text>
							<TextInput
								style={styles.formInput}
								placeholder="ejemplo@correo.com"
								value={emailCuidador}
								onChangeText={setEmailCuidador}
								keyboardType="email-address"
								autoCapitalize="none"
								autoFocus={true}
								editable={!enviandoInvitacion}
							/>
						</View>

						<View style={styles.modalActions}>
							<TouchableOpacity
								style={[styles.btnModalPrimary, enviandoInvitacion && styles.btnDisabled]}
								onPress={handleInvitar}
								disabled={enviandoInvitacion}
								activeOpacity={0.7}
							>
								<Text style={styles.btnModalPrimaryText}>
									{enviandoInvitacion ? 'ENVIANDO...' : 'INVITAR'}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.btnModalSecondary, enviandoInvitacion && styles.btnDisabled]}
								onPress={handleCerrarModal}
								disabled={enviandoInvitacion}
								activeOpacity={0.7}
							>
								<Text style={styles.btnModalSecondaryText}>CANCELAR</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</TouchableOpacity>
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
	loader: {
		marginTop: 60,
	},
	loadingText: {
		textAlign: 'center',
		marginTop: 20,
		color: '#6b7280',
		fontSize: 15,
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
	tituloContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	titulo: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1f2937',
	},
	btnInfoIcon: {
		padding: 4,
	},
	infoIcono: {
		fontSize: 24,
	},

	// Botón Invitar
	btnInvitar: {
		backgroundColor: '#2ea3ff',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	btnInvitarText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},

	// Lista de Cuidadores
	cuidadoresContainer: {
		gap: 16,
	},
	cuidadorCard: {
		backgroundColor: 'white',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		padding: 20,
		marginBottom: 16,
		alignItems: 'center',
	},
	cuidadorIcon: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#e0f2fe',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
	},
	cuidadorIconText: {
		fontSize: 32,
	},
	cuidadorInfo: {
		alignItems: 'center',
		marginBottom: 16,
	},
	cuidadorNombre: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 4,
	},
	cuidadorEmail: {
		fontSize: 14,
		color: '#6b7280',
	},
	btnDesvincular: {
		backgroundColor: '#ef4444',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 20,
		width: '100%',
		alignItems: 'center',
	},
	btnDesvincularText: {
		fontSize: 14,
		fontWeight: '600',
		color: 'white',
	},

	// Empty State
	emptyState: {
		backgroundColor: 'white',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		padding: 40,
		alignItems: 'center',
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 14,
		color: '#6b7280',
		textAlign: 'center',
	},

	// Modal
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContent: {
		backgroundColor: 'white',
		borderRadius: 16,
		padding: 24,
		width: '100%',
		maxWidth: 400,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalIconContainer: {
		alignItems: 'center',
		marginBottom: 16,
	},
	modalIcon: {
		fontSize: 48,
	},
	modalTitulo: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1f2937',
		textAlign: 'center',
		marginBottom: 12,
	},
	modalDescripcion: {
		fontSize: 14,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 20,
		marginBottom: 24,
	},

	// Form
	formGroup: {
		marginBottom: 24,
	},
	formLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginBottom: 8,
	},
	formInput: {
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 14,
		fontSize: 15,
		color: '#1f2937',
		backgroundColor: 'white',
	},

	// Modal Actions
	modalActions: {
		gap: 12,
	},
	btnModalPrimary: {
		backgroundColor: '#2ea3ff',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	btnModalPrimaryText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},
	btnModalSecondary: {
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	btnModalSecondaryText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#374151',
	},
	btnDisabled: {
		opacity: 0.5,
	},
});
