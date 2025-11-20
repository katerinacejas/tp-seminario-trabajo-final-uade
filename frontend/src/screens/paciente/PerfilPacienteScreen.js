import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth';
import { usuariosAPI, pacientesAPI, contactosEmergenciaAPI } from '../../services/api';

export default function PerfilPacienteScreen() {
	const navigation = useNavigation();
	const { logout } = useAuth();
	const [editMode, setEditMode] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(true);
	const [guardando, setGuardando] = useState(false);

	// Datos del usuario y paciente
	const [usuarioId, setUsuarioId] = useState(null);
	const [formData, setFormData] = useState({
		nombreCompleto: '',
		email: '',
		password: '',
		condicionesMedicas: [],
		notasImportantes: [],
	});

	// Contactos de emergencia
	const [contactos, setContactos] = useState([]);
	const [editingContactos, setEditingContactos] = useState({});

	useEffect(() => {
		cargarDatos();
	}, []);

	const cargarDatos = async () => {
		try {
			setLoading(true);

			// Cargar datos del usuario
			const usuario = await usuariosAPI.getMe();
			setUsuarioId(usuario.id);

			// Cargar datos del paciente
			const paciente = await pacientesAPI.getByUsuarioId(usuario.id);

			setFormData({
				nombreCompleto: usuario.nombreCompleto || '',
				email: usuario.email || '',
				password: '',
				condicionesMedicas: paciente.condicionesMedicas || [],
				notasImportantes: paciente.notasImportantes || [],
			});

			// Cargar contactos de emergencia
			const contactosData = await contactosEmergenciaAPI.getByPaciente(usuario.id);
			setContactos(contactosData || []);
		} catch (error) {
			console.error('Error cargando datos:', error);
			Alert.alert('Error', 'No se pudieron cargar los datos');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleArrayChange = (field, index, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: prev[field].map((item, i) => (i === index ? value : item)),
		}));
	};

	const handleAddArrayItem = (field) => {
		setFormData((prev) => ({
			...prev,
			[field]: [...prev[field], ''],
		}));
	};

	const handleRemoveArrayItem = (field, index) => {
		setFormData((prev) => ({
			...prev,
			[field]: prev[field].filter((_, i) => i !== index),
		}));
	};

	const handleGuardarCambios = async () => {
		try {
			setGuardando(true);

			// Filtrar arrays vacíos
			const dataToSend = {
				...formData,
				condicionesMedicas: formData.condicionesMedicas.filter((c) => c.trim() !== ''),
				notasImportantes: formData.notasImportantes.filter((n) => n.trim() !== ''),
			};

			// Si no hay contraseña, no enviarla
			if (!dataToSend.password) {
				delete dataToSend.password;
			}

			await pacientesAPI.actualizarPerfil(usuarioId, dataToSend);
			Alert.alert('Éxito', 'Perfil actualizado exitosamente');
			setEditMode(false);
			setFormData((prev) => ({ ...prev, password: '' }));
			await cargarDatos();
		} catch (error) {
			console.error('Error actualizando perfil:', error);
			Alert.alert('Error', 'Error al actualizar perfil');
		} finally {
			setGuardando(false);
		}
	};

	const handleCancelar = () => {
		setEditMode(false);
		cargarDatos();
	};

	// Contactos de emergencia
	const handleAgregarContacto = async () => {
		const nuevoContacto = {
			nombre: '',
			telefono: '',
			relacion: '',
		};

		try {
			const contactoCreado = await contactosEmergenciaAPI.crear(usuarioId, nuevoContacto);
			setContactos((prev) => [...prev, contactoCreado]);
			setEditingContactos((prev) => ({ ...prev, [contactoCreado.id]: true }));
		} catch (error) {
			console.error('Error creando contacto:', error);
			Alert.alert('Error', 'Error al crear contacto');
		}
	};

	const handleEliminarContacto = async (contactoId) => {
		Alert.alert(
			'Confirmar',
			'¿Estás seguro que querés eliminar este contacto?',
			[
				{
					text: 'Cancelar',
					style: 'cancel',
				},
				{
					text: 'Eliminar',
					style: 'destructive',
					onPress: async () => {
						try {
							await contactosEmergenciaAPI.eliminar(contactoId);
							setContactos((prev) => prev.filter((c) => c.id !== contactoId));
							Alert.alert('Éxito', 'Contacto eliminado');
						} catch (error) {
							console.error('Error eliminando contacto:', error);
							Alert.alert('Error', 'Error al eliminar contacto');
						}
					},
				},
			]
		);
	};

	const handleGuardarContacto = async (contacto) => {
		try {
			await contactosEmergenciaAPI.actualizar(contacto.id, {
				nombre: contacto.nombre,
				telefono: contacto.telefono,
				relacion: contacto.relacion,
			});
			setEditingContactos((prev) => ({ ...prev, [contacto.id]: false }));
			Alert.alert('Éxito', 'Contacto guardado');
		} catch (error) {
			console.error('Error guardando contacto:', error);
			Alert.alert('Error', 'Error al guardar contacto');
		}
	};

	const handleContactoChange = (contactoId, field, value) => {
		setContactos((prev) => prev.map((c) => (c.id === contactoId ? { ...c, [field]: value } : c)));
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
					},
				},
			]
		);
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
			{/* Datos Personales */}
			<View style={styles.perfilCard}>
				<View style={styles.perfilHeader}>
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

				<View style={styles.formSection}>
					<Text style={styles.formLabel}>Tu Nombre</Text>
					{editMode ? (
						<TextInput
							style={styles.formInput}
							value={formData.nombreCompleto}
							onChangeText={(value) => handleInputChange('nombreCompleto', value)}
							editable={!guardando}
						/>
					) : (
						<View style={styles.readonlyValueContainer}>
							<Text style={styles.readonlyValue}>{formData.nombreCompleto}</Text>
						</View>
					)}
				</View>

				<View style={styles.formSection}>
					<Text style={styles.formLabel}>Email asociado</Text>
					{editMode ? (
						<TextInput
							style={styles.formInput}
							value={formData.email}
							onChangeText={(value) => handleInputChange('email', value)}
							keyboardType="email-address"
							autoCapitalize="none"
							editable={!guardando}
						/>
					) : (
						<View style={styles.readonlyValueContainer}>
							<Text style={styles.readonlyValue}>{formData.email}</Text>
						</View>
					)}
				</View>

				<View style={styles.formSection}>
					<Text style={styles.formLabel}>Tu Contraseña</Text>
					{editMode ? (
						<View style={styles.passwordInputWrapper}>
							<TextInput
								style={styles.formInputPassword}
								value={formData.password}
								onChangeText={(value) => handleInputChange('password', value)}
								placeholder="Dejá en blanco para no cambiar"
								secureTextEntry={!showPassword}
								editable={!guardando}
							/>
							<TouchableOpacity
								style={styles.togglePasswordBtn}
								onPress={() => setShowPassword(!showPassword)}
							>
								<Text style={styles.togglePasswordIcon}>{showPassword ? '🙈' : '👁️'}</Text>
							</TouchableOpacity>
						</View>
					) : (
						<View style={styles.readonlyValueContainer}>
							<Text style={styles.readonlyValue}>••••••••</Text>
						</View>
					)}
				</View>

				<View style={styles.formSection}>
					<Text style={styles.formLabel}>Condiciones</Text>
					{editMode ? (
						<View style={styles.arrayInputs}>
							{formData.condicionesMedicas.map((condicion, index) => (
								<View key={index} style={styles.arrayInputRow}>
									<TextInput
										style={styles.arrayInput}
										value={condicion}
										onChangeText={(value) =>
											handleArrayChange('condicionesMedicas', index, value)
										}
										placeholder="Ej: Artritis"
										editable={!guardando}
									/>
									<TouchableOpacity
										style={styles.btnRemoveItem}
										onPress={() => handleRemoveArrayItem('condicionesMedicas', index)}
									>
										<Text style={styles.btnRemoveItemText}>🗑️</Text>
									</TouchableOpacity>
								</View>
							))}
							<TouchableOpacity
								style={styles.btnAddItem}
								onPress={() => handleAddArrayItem('condicionesMedicas')}
							>
								<Text style={styles.btnAddItemText}>Añadir condición...</Text>
							</TouchableOpacity>
						</View>
					) : (
						<View style={styles.readonlyList}>
							{formData.condicionesMedicas.length > 0 ? (
								formData.condicionesMedicas.map((condicion, index) => (
									<View key={index} style={styles.readonlyListItem}>
										<Text style={styles.readonlyListItemText}>{condicion}</Text>
									</View>
								))
							) : (
								<View style={styles.readonlyValueContainer}>
									<Text style={styles.readonlyValue}>Sin condiciones registradas</Text>
								</View>
							)}
						</View>
					)}
				</View>

				<View style={styles.formSection}>
					<Text style={styles.formLabel}>Notas Importantes</Text>
					{editMode ? (
						<View style={styles.arrayInputs}>
							{formData.notasImportantes.map((nota, index) => (
								<View key={index} style={styles.arrayInputRow}>
									<TextInput
										style={styles.arrayInput}
										value={nota}
										onChangeText={(value) =>
											handleArrayChange('notasImportantes', index, value)
										}
										placeholder="Ej: Necesita ayuda para moverse por las mañanas"
										editable={!guardando}
									/>
									<TouchableOpacity
										style={styles.btnRemoveItem}
										onPress={() => handleRemoveArrayItem('notasImportantes', index)}
									>
										<Text style={styles.btnRemoveItemText}>🗑️</Text>
									</TouchableOpacity>
								</View>
							))}
							<TouchableOpacity
								style={styles.btnAddItem}
								onPress={() => handleAddArrayItem('notasImportantes')}
							>
								<Text style={styles.btnAddItemText}>Añadir nota...</Text>
							</TouchableOpacity>
						</View>
					) : (
						<View style={styles.readonlyList}>
							{formData.notasImportantes.length > 0 ? (
								formData.notasImportantes.map((nota, index) => (
									<View key={index} style={styles.readonlyListItem}>
										<Text style={styles.readonlyListItemText}>{nota}</Text>
									</View>
								))
							) : (
								<View style={styles.readonlyValueContainer}>
									<Text style={styles.readonlyValue}>Sin notas importantes</Text>
								</View>
							)}
						</View>
					)}
				</View>

				{editMode ? (
					<View style={styles.formActions}>
						<TouchableOpacity
							style={[styles.btnActionPrimary, guardando && styles.btnDisabled]}
							onPress={handleGuardarCambios}
							disabled={guardando}
						>
							<Text style={styles.btnActionPrimaryText}>
								{guardando ? 'Guardando...' : 'Guardar cambios'}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.btnActionSecondary, guardando && styles.btnDisabled]}
							onPress={handleCancelar}
							disabled={guardando}
						>
							<Text style={styles.btnActionSecondaryText}>Cancelar</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.formActions}>
						<TouchableOpacity style={styles.btnActionPrimary} onPress={() => setEditMode(true)}>
							<Text style={styles.btnActionPrimaryText}>Editar</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.btnActionSecondary} onPress={handleCerrarSesion}>
							<Text style={styles.btnActionSecondaryText}>Cerrar sesión</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			{/* Contactos de Emergencia */}
			<View style={styles.perfilCard}>
				<View style={styles.perfilHeader}>
					<View style={styles.headerIcon} />
					<View style={styles.headerContent}>
						<Text style={styles.titulo}>Contactos de emergencia</Text>
					</View>
				</View>

				{contactos.map((contacto) => {
					const isEditing = editingContactos[contacto.id];
					return (
						<View key={contacto.id} style={styles.contactoItem}>
							{isEditing ? (
								<>
									<Text style={styles.contactoTitulo}>Contacto de emergencia</Text>
									<View style={styles.contactoFields}>
										<View style={styles.formSection}>
											<Text style={styles.formLabel}>Nombre</Text>
											<TextInput
												style={styles.formInput}
												value={contacto.nombre}
												onChangeText={(value) =>
													handleContactoChange(contacto.id, 'nombre', value)
												}
											/>
										</View>
										<View style={styles.formSection}>
											<Text style={styles.formLabel}>Teléfono</Text>
											<TextInput
												style={styles.formInput}
												value={contacto.telefono}
												onChangeText={(value) =>
													handleContactoChange(contacto.id, 'telefono', value)
												}
												keyboardType="phone-pad"
											/>
										</View>
										<View style={styles.formSection}>
											<Text style={styles.formLabel}>Relación</Text>
											<TextInput
												style={styles.formInput}
												value={contacto.relacion}
												onChangeText={(value) =>
													handleContactoChange(contacto.id, 'relacion', value)
												}
											/>
										</View>
									</View>
									<View style={styles.contactoActions}>
										<TouchableOpacity
											style={styles.btnContactoSave}
											onPress={() => handleGuardarContacto(contacto)}
										>
											<Text style={styles.btnContactoSaveText}>Guardar</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={styles.btnContactoDelete}
											onPress={() => handleEliminarContacto(contacto.id)}
										>
											<Text style={styles.btnContactoDeleteText}>Eliminar</Text>
										</TouchableOpacity>
									</View>
								</>
							) : (
								<>
									<View style={styles.contactoReadonly}>
										<Text style={styles.contactoReadonlyText}>
											<Text style={styles.contactoReadonlyLabel}>Nombre: </Text>
											{contacto.nombre}
										</Text>
										<Text style={styles.contactoReadonlyText}>
											<Text style={styles.contactoReadonlyLabel}>Teléfono: </Text>
											{contacto.telefono}
										</Text>
										<Text style={styles.contactoReadonlyText}>
											<Text style={styles.contactoReadonlyLabel}>Relación: </Text>
											{contacto.relacion}
										</Text>
									</View>
									<TouchableOpacity
										style={styles.btnAddItem}
										onPress={() =>
											setEditingContactos((prev) => ({ ...prev, [contacto.id]: true }))
										}
									>
										<Text style={styles.btnAddItemText}>Editar</Text>
									</TouchableOpacity>
								</>
							)}
						</View>
					);
				})}

				<TouchableOpacity style={styles.btnAgregarContacto} onPress={handleAgregarContacto}>
					<Text style={styles.btnAgregarContactoText}>➕ Añadir contacto</Text>
				</TouchableOpacity>
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

	// Perfil Card
	perfilCard: {
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
	perfilHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 20,
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
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2937',
	},
	btnInfoIcon: {
		padding: 4,
	},
	infoIcono: {
		fontSize: 24,
	},

	// Form Sections
	formSection: {
		marginBottom: 20,
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
	readonlyValueContainer: {
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	readonlyValue: {
		fontSize: 15,
		color: '#1f2937',
	},

	// Password Input
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

	// Array Inputs
	arrayInputs: {
		gap: 8,
	},
	arrayInputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
	},
	arrayInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 14,
		fontSize: 15,
		color: '#1f2937',
		backgroundColor: 'white',
	},
	btnRemoveItem: {
		padding: 8,
	},
	btnRemoveItemText: {
		fontSize: 20,
	},
	btnAddItem: {
		backgroundColor: '#f3f4f6',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		alignItems: 'center',
		marginTop: 4,
	},
	btnAddItemText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
	},

	// Readonly List
	readonlyList: {
		gap: 8,
	},
	readonlyListItem: {
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		marginBottom: 8,
	},
	readonlyListItemText: {
		fontSize: 15,
		color: '#1f2937',
	},

	// Form Actions
	formActions: {
		gap: 12,
		marginTop: 8,
	},
	btnActionPrimary: {
		backgroundColor: '#2ea3ff',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	btnActionPrimaryText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},
	btnActionSecondary: {
		backgroundColor: '#ef4444',
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	btnActionSecondaryText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},
	btnDisabled: {
		opacity: 0.5,
	},

	// Contactos de Emergencia
	contactoItem: {
		backgroundColor: '#f9fafb',
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
	},
	contactoTitulo: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 12,
	},
	contactoFields: {
		marginBottom: 12,
	},
	contactoActions: {
		flexDirection: 'row',
		gap: 8,
	},
	btnContactoSave: {
		flex: 1,
		backgroundColor: '#10b981',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		alignItems: 'center',
	},
	btnContactoSaveText: {
		fontSize: 14,
		fontWeight: '600',
		color: 'white',
	},
	btnContactoDelete: {
		flex: 1,
		backgroundColor: '#ef4444',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		alignItems: 'center',
	},
	btnContactoDeleteText: {
		fontSize: 14,
		fontWeight: '600',
		color: 'white',
	},
	contactoReadonly: {
		marginBottom: 12,
	},
	contactoReadonlyText: {
		fontSize: 15,
		color: '#1f2937',
		marginBottom: 8,
	},
	contactoReadonlyLabel: {
		fontWeight: '700',
	},
	btnAgregarContacto: {
		backgroundColor: '#2ea3ff',
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 14,
		alignItems: 'center',
	},
	btnAgregarContactoText: {
		fontSize: 15,
		fontWeight: '600',
		color: 'white',
	},
});
