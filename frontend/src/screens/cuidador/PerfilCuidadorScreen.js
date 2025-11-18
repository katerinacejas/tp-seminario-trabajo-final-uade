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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth';
import { usuariosAPI } from '../../services/api';

export default function PerfilCuidadorScreen() {
	const navigation = useNavigation();
	const { logout } = useAuth();

	const [usuario, setUsuario] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Estados de edición
	const [modoEdicion, setModoEdicion] = useState(false);
	const [formData, setFormData] = useState({
		nombreCompleto: '',
		email: '',
		password: '',
	});

	// Estado de visibilidad de contraseña
	const [mostrarPassword, setMostrarPassword] = useState(false);
	const [guardando, setGuardando] = useState(false);

	useEffect(() => {
		cargarDatosUsuario();
	}, []);

	const cargarDatosUsuario = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await usuariosAPI.getMe();
			setUsuario(data);
			setFormData({
				nombreCompleto: data.nombreCompleto || '',
				email: data.email || '',
				password: '', // No mostramos la contraseña actual
			});
		} catch (err) {
			console.error('Error al cargar datos del usuario:', err);
			setError('No se pudieron cargar los datos del usuario');
		} finally {
			setLoading(false);
		}
	};

	const handleEditar = () => {
		setModoEdicion(true);
		setError(null);
		setSuccess(null);
	};

	const handleCancelar = () => {
		setModoEdicion(false);
		setFormData({
			nombreCompleto: usuario.nombreCompleto || '',
			email: usuario.email || '',
			password: '',
		});
		setMostrarPassword(false);
		setError(null);
		setSuccess(null);
	};

	const handleGuardar = async () => {
		try {
			// Validaciones
			if (!formData.nombreCompleto.trim()) {
				setError('El nombre es obligatorio');
				return;
			}

			if (!formData.email.trim()) {
				setError('El email es obligatorio');
				return;
			}

			// Validar formato de email
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				setError('El email no tiene un formato válido');
				return;
			}

			setGuardando(true);
			setError(null);
			setSuccess(null);

			// Preparar datos para actualizar
			const updateData = {
				nombreCompleto: formData.nombreCompleto,
				email: formData.email,
			};

			// Solo incluir password si se ingresó uno nuevo
			if (formData.password.trim()) {
				if (formData.password.length < 6) {
					setError('La contraseña debe tener al menos 6 caracteres');
					setGuardando(false);
					return;
				}
				updateData.password = formData.password;
			}

			await usuariosAPI.update(usuario.id, updateData);

			// Recargar datos del usuario
			await cargarDatosUsuario();

			setModoEdicion(false);
			setMostrarPassword(false);
			setFormData({ ...formData, password: '' });
			setSuccess('Perfil actualizado correctamente');

			// Limpiar mensaje de éxito después de 3 segundos
			setTimeout(() => {
				setSuccess(null);
			}, 3000);
		} catch (err) {
			console.error('Error al guardar cambios:', err);
			setError(err.message || 'Error al actualizar el perfil');
		} finally {
			setGuardando(false);
		}
	};

	const handleCerrarSesion = () => {
		Alert.alert(
			'Cerrar sesión',
			'¿Estás seguro de que deseas cerrar sesión?',
			[
				{
					text: 'Cancelar',
					style: 'cancel',
				},
				{
					text: 'Cerrar sesión',
					style: 'destructive',
					onPress: async () => {
						await logout();
						// La navegación se manejará automáticamente por el sistema de auth
					},
				},
			]
		);
	};

	const handleInputChange = (name, value) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#2ea3ff" style={styles.loader} />
				<Text style={styles.loadingText}>Cargando datos del perfil...</Text>
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
							<Text style={styles.titulo}>Perfil</Text>
							<TouchableOpacity style={styles.btnInfoIcon}>
								<Text style={styles.infoIcono}>ℹ️</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{/* Formulario */}
				<View style={styles.perfilForm}>
					{/* Mensajes */}
					{error && (
						<View style={styles.mensajeError}>
							<Text style={styles.mensajeErrorText}>{error}</Text>
						</View>
					)}
					{success && (
						<View style={styles.mensajeExito}>
							<Text style={styles.mensajeExitoText}>{success}</Text>
						</View>
					)}

					{/* Campo: Nombre */}
					<View style={styles.formField}>
						<Text style={styles.formLabel}>Tu Nombre</Text>
						{!modoEdicion ? (
							<View style={styles.formValueContainer}>
								<Text style={styles.formValue}>{usuario?.nombreCompleto || 'Sin nombre'}</Text>
							</View>
						) : (
							<TextInput
								style={styles.formInput}
								value={formData.nombreCompleto}
								onChangeText={(value) => handleInputChange('nombreCompleto', value)}
								placeholder="Ingresa tu nombre completo"
								editable={!guardando}
							/>
						)}
					</View>

					{/* Campo: Email */}
					<View style={styles.formField}>
						<Text style={styles.formLabel}>Tu Email</Text>
						{!modoEdicion ? (
							<View style={styles.formValueContainer}>
								<Text style={styles.formValue}>{usuario?.email || 'Sin email'}</Text>
							</View>
						) : (
							<TextInput
								style={styles.formInput}
								value={formData.email}
								onChangeText={(value) => handleInputChange('email', value)}
								placeholder="tu@email.com"
								keyboardType="email-address"
								autoCapitalize="none"
								editable={!guardando}
							/>
						)}
					</View>

					{/* Campo: Contraseña */}
					<View style={styles.formField}>
						<Text style={styles.formLabel}>Tu Contraseña</Text>
						{!modoEdicion ? (
							<View style={styles.passwordField}>
								<View style={styles.passwordDotsContainer}>
									<Text style={styles.passwordDots}>••••••••</Text>
								</View>
								<TouchableOpacity
									style={styles.togglePasswordBtn}
									onPress={() => setMostrarPassword(!mostrarPassword)}
								>
									<Text style={styles.togglePasswordIcon}>{mostrarPassword ? '🙈' : '👁️'}</Text>
								</TouchableOpacity>
							</View>
						) : (
							<View style={styles.passwordInputWrapper}>
								<TextInput
									style={styles.formInputPassword}
									value={formData.password}
									onChangeText={(value) => handleInputChange('password', value)}
									placeholder="Dejar en blanco para no cambiar"
									secureTextEntry={!mostrarPassword}
									editable={!guardando}
								/>
								<TouchableOpacity
									style={styles.togglePasswordBtn}
									onPress={() => setMostrarPassword(!mostrarPassword)}
								>
									<Text style={styles.togglePasswordIcon}>{mostrarPassword ? '🙈' : '👁️'}</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>

					{/* Botones de Acción */}
					<View style={styles.perfilActions}>
						{!modoEdicion ? (
							<>
								<TouchableOpacity style={styles.btnEditar} onPress={handleEditar}>
									<Text style={styles.btnEditarText}>Editar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.btnCerrarSesion} onPress={handleCerrarSesion}>
									<Text style={styles.btnCerrarSesionText}>Cerrar sesión</Text>
								</TouchableOpacity>
							</>
						) : (
							<>
								<TouchableOpacity
									style={[styles.btnGuardar, guardando && styles.btnDisabled]}
									onPress={handleGuardar}
									disabled={guardando}
								>
									<Text style={styles.btnGuardarText}>
										{guardando ? 'Guardando...' : 'Guardar cambios'}
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.btnCancelarEdicion, guardando && styles.btnDisabled]}
									onPress={handleCancelar}
									disabled={guardando}
								>
									<Text style={styles.btnCancelarEdicionText}>Cancelar</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
				</View>
			</ScrollView>
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

	// Formulario
	perfilForm: {
		backgroundColor: 'white',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		padding: 24,
	},

	// Mensajes
	mensajeError: {
		backgroundColor: '#fef2f2',
		borderWidth: 1,
		borderColor: '#fecaca',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
	},
	mensajeErrorText: {
		color: '#dc2626',
		fontSize: 14,
	},
	mensajeExito: {
		backgroundColor: '#f0fdf4',
		borderWidth: 1,
		borderColor: '#bbf7d0',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
	},
	mensajeExitoText: {
		color: '#16a34a',
		fontSize: 14,
	},

	// Campos del Formulario
	formField: {
		marginBottom: 24,
	},
	formLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginBottom: 8,
	},
	formValueContainer: {
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	formValue: {
		fontSize: 15,
		color: '#1f2937',
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

	// Campo de Contraseña
	passwordField: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	passwordDotsContainer: {
		flex: 1,
	},
	passwordDots: {
		fontSize: 15,
		color: '#1f2937',
		letterSpacing: 2,
	},
	passwordInputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderRadius: 8,
		backgroundColor: 'white',
	},
	formInputPassword: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 14,
		fontSize: 15,
		color: '#1f2937',
	},
	togglePasswordBtn: {
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	togglePasswordIcon: {
		fontSize: 20,
	},

	// Botones de Acción
	perfilActions: {
		marginTop: 8,
		gap: 12,
	},
	btnEditar: {
		backgroundColor: '#2ea3ff',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	btnEditarText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},
	btnCerrarSesion: {
		backgroundColor: '#ef4444',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	btnCerrarSesionText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},
	btnGuardar: {
		backgroundColor: '#10b981',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	btnGuardarText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},
	btnCancelarEdicion: {
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	btnCancelarEdicionText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#374151',
	},
	btnDisabled: {
		opacity: 0.5,
	},
});
