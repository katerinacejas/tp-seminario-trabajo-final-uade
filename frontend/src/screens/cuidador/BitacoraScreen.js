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
} from 'react-native';
import { bitacorasAPI } from '../../services/api';
import { usePaciente } from '../../context/PacienteContext';

export default function BitacoraScreen() {
	const { pacienteSeleccionado } = usePaciente();
	const pacienteId = pacienteSeleccionado?.id;

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
	const [opcionFecha, setOpcionFecha] = useState('hoy');

	// Lista de bitácoras
	const [bitacoras, setBitacoras] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

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
	};

	// Enviar formulario
	const handleSubmit = async () => {
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
				titulo: formData.titulo.trim() || null,
				descripcion: formData.descripcion.trim(),
				sintomas: formData.sintomas.trim() || null,
				observaciones: formData.observaciones.trim() || null,
			};

			if (modoEdicion) {
				await bitacorasAPI.actualizar(bitacoraEditando.id, bitacoraData);
			} else {
				await bitacorasAPI.crear(bitacoraData);
			}

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
		Alert.alert(
			'¿Eliminar bitácora?',
			`Estás por eliminar la bitácora "${bitacora.titulo}" del ${formatearFecha(bitacora.fecha)}.\n\nEsta acción no se puede deshacer.`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{ text: 'Eliminar', style: 'destructive', onPress: () => eliminarBitacora(bitacora.id) },
			]
		);
	};

	// Eliminar bitácora
	const eliminarBitacora = async (id) => {
		setLoading(true);
		try {
			await bitacorasAPI.eliminar(id);
			await cargarBitacoras();
		} catch (err) {
			console.error('Error al eliminar bitácora:', err);
			Alert.alert('Error', 'Error al eliminar la bitácora. Por favor, intenta nuevamente.');
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

	// Renderizar item de bitácora
	const renderBitacora = ({ item }) => (
		<View style={styles.bitacoraItem}>
			<View style={styles.bitacoraHeader}>
				<View style={styles.bitacoraFechaTitulo}>
					<Text style={styles.bitacoraFecha}>{formatearFechaConDia(item.fecha)}</Text>
					<Text style={styles.bitacoraTitulo}>{item.titulo}</Text>
					<Text style={styles.bitacoraCuidador}>Por: {item.cuidadorNombre}</Text>
				</View>
				<View style={styles.bitacoraAcciones}>
					<TouchableOpacity
						style={styles.btnEditar}
						onPress={() => abrirFormularioEditar(item)}
					>
						<Text style={styles.btnEditarText}>✏️</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.btnEliminar}
						onPress={() => confirmarEliminar(item)}
					>
						<Text style={styles.btnEliminarText}>🗑️</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.bitacoraContenido}>
				<View style={styles.contenidoSection}>
					<Text style={styles.contenidoLabel}>Actividades</Text>
					<Text style={styles.contenidoTexto}>{item.descripcion}</Text>
				</View>

				{item.sintomas && (
					<View style={styles.contenidoSection}>
						<Text style={styles.contenidoLabel}>Síntomas</Text>
						<Text style={styles.contenidoTexto}>{item.sintomas}</Text>
					</View>
				)}

				{item.observaciones && (
					<View style={styles.contenidoSection}>
						<Text style={styles.contenidoLabel}>Notas adicionales</Text>
						<Text style={styles.contenidoTexto}>{item.observaciones}</Text>
					</View>
				)}
			</View>
		</View>
	);

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<Text style={styles.headerTitle}>Bitácoras</Text>
				</View>
				<TouchableOpacity style={styles.btnAñadirBitacora} onPress={abrirFormularioNuevo}>
					<Text style={styles.btnAñadirText}>+ Añadir bitácora</Text>
				</TouchableOpacity>
			</View>

			{/* Lista de bitácoras */}
			<View style={styles.listaBitacorasCard}>
				<Text style={styles.listaTitulo}>Historial de bitácoras</Text>
				<Text style={styles.listaSubtitulo}>
					Registro completo de actividades y observaciones del paciente
				</Text>

				{loading && !mostrarFormulario && (
					<ActivityIndicator size="large" color="#00A67E" style={styles.loading} />
				)}

				{!loading && bitacoras.length === 0 && (
					<Text style={styles.mensajeVacio}>
						No hay bitácoras registradas aún. Crea la primera bitácora para comenzar.
					</Text>
				)}

				<FlatList
					data={bitacoras}
					renderItem={renderBitacora}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.bitacorasLista}
				/>
			</View>

			{/* Modal Formulario */}
			<Modal visible={mostrarFormulario} animationType="slide" transparent={true}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalFormulario}>
						<ScrollView>
							<View style={styles.formularioTitulo}>
								<Text style={styles.formularioTituloText}>
									{modoEdicion ? 'Editar bitácora' : 'Nueva bitácora'}
								</Text>
								<TouchableOpacity onPress={cerrarFormulario}>
									<Text style={styles.btnCerrarFormulario}>✕</Text>
								</TouchableOpacity>
							</View>
							<Text style={styles.formularioSubtitulo}>
								{modoEdicion
									? 'Actualiza los detalles de la bitácora'
									: 'Registra actividades, síntomas y observaciones del paciente'}
							</Text>

							{error && (
								<View style={styles.alertError}>
									<Text style={styles.alertErrorText}>{error}</Text>
									<TouchableOpacity onPress={() => setError(null)}>
										<Text style={styles.alertClose}>×</Text>
									</TouchableOpacity>
								</View>
							)}

							{/* Selector de fecha */}
							<View style={styles.formGroup}>
								<Text style={styles.label}>Fecha</Text>
								<View style={styles.fechaSelector}>
									<TouchableOpacity
										style={[styles.btnFecha, opcionFecha === 'hoy' && styles.btnFechaActive]}
										onPress={() => handleOpcionFechaChange('hoy')}
									>
										<Text style={[styles.btnFechaText, opcionFecha === 'hoy' && styles.btnFechaTextActive]}>
											Hoy
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.btnFecha, opcionFecha === 'ayer' && styles.btnFechaActive]}
										onPress={() => handleOpcionFechaChange('ayer')}
									>
										<Text style={[styles.btnFechaText, opcionFecha === 'ayer' && styles.btnFechaTextActive]}>
											Ayer
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.btnFecha, opcionFecha === 'personalizada' && styles.btnFechaActive]}
										onPress={() => handleOpcionFechaChange('personalizada')}
									>
										<Text style={[styles.btnFechaText, opcionFecha === 'personalizada' && styles.btnFechaTextActive]}>
											Otra fecha
										</Text>
									</TouchableOpacity>
								</View>
								{opcionFecha === 'personalizada' && (
									<TextInput
										style={styles.input}
										value={formData.fecha}
										onChangeText={(text) => setFormData({ ...formData, fecha: text })}
										placeholder="YYYY-MM-DD"
									/>
								)}
							</View>

							{/* Título (opcional) */}
							<View style={styles.formGroup}>
								<Text style={styles.label}>
									Título <Text style={styles.labelOptional}>(opcional, se auto-genera si no se completa)</Text>
								</Text>
								<TextInput
									style={styles.input}
									value={formData.titulo}
									onChangeText={(text) => setFormData({ ...formData, titulo: text })}
									placeholder='Ejemplo: "Control post-quirúrgico"'
									maxLength={255}
								/>
							</View>

							{/* Descripción de actividades (obligatorio) */}
							<View style={styles.formGroup}>
								<Text style={styles.label}>Actividades realizadas *</Text>
								<TextInput
									style={[styles.input, styles.textarea]}
									value={formData.descripcion}
									onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
									placeholder="Describe las actividades del día: comidas, ejercicios, salidas, terapias, etc."
									multiline
									numberOfLines={4}
								/>
							</View>

							{/* Síntomas (opcional) */}
							<View style={styles.formGroup}>
								<Text style={styles.label}>
									Síntomas <Text style={styles.labelOptional}>(opcional)</Text>
								</Text>
								<TextInput
									style={styles.input}
									value={formData.sintomas}
									onChangeText={(text) => setFormData({ ...formData, sintomas: text })}
									placeholder="Describe síntomas observados, si los hubo"
									maxLength={500}
								/>
							</View>

							{/* Observaciones (opcional) */}
							<View style={styles.formGroup}>
								<Text style={styles.label}>
									Notas adicionales <Text style={styles.labelOptional}>(opcional)</Text>
								</Text>
								<TextInput
									style={[styles.input, styles.textarea]}
									value={formData.observaciones}
									onChangeText={(text) => setFormData({ ...formData, observaciones: text })}
									placeholder="Agrega cualquier observación relevante sobre el día"
									multiline
									numberOfLines={3}
								/>
							</View>

							{/* Botones */}
							<View style={styles.formButtons}>
								<TouchableOpacity style={styles.btnCancelar} onPress={cerrarFormulario}>
									<Text style={styles.btnCancelarText}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit} disabled={loading}>
									<Text style={styles.btnSubmitText}>
										{loading ? 'Guardando...' : modoEdicion ? 'Actualizar bitácora' : 'Guardar bitácora'}
									</Text>
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
	},
	header: {
		backgroundColor: '#FFFFFF',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333333',
	},
	btnAñadirBitacora: {
		backgroundColor: '#00A67E',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	btnAñadirText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
	listaBitacorasCard: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		margin: 16,
		padding: 16,
		borderRadius: 8,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	listaTitulo: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333333',
		marginBottom: 4,
	},
	listaSubtitulo: {
		fontSize: 14,
		color: '#666666',
		marginBottom: 16,
	},
	loading: {
		marginTop: 40,
	},
	mensajeVacio: {
		textAlign: 'center',
		color: '#999999',
		marginTop: 40,
		fontSize: 16,
	},
	bitacorasLista: {
		paddingBottom: 16,
	},
	bitacoraItem: {
		backgroundColor: '#F9F9F9',
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#E0E0E0',
	},
	bitacoraHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	bitacoraFechaTitulo: {
		flex: 1,
	},
	bitacoraFecha: {
		fontSize: 12,
		color: '#666666',
		marginBottom: 4,
	},
	bitacoraTitulo: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333333',
		marginBottom: 4,
	},
	bitacoraCuidador: {
		fontSize: 12,
		color: '#00A67E',
	},
	bitacoraAcciones: {
		flexDirection: 'row',
		gap: 8,
	},
	btnEditar: {
		padding: 8,
	},
	btnEditarText: {
		fontSize: 20,
	},
	btnEliminar: {
		padding: 8,
	},
	btnEliminarText: {
		fontSize: 20,
	},
	bitacoraContenido: {
		gap: 12,
	},
	contenidoSection: {
		marginBottom: 8,
	},
	contenidoLabel: {
		fontSize: 12,
		fontWeight: '600',
		color: '#666666',
		marginBottom: 4,
	},
	contenidoTexto: {
		fontSize: 14,
		color: '#333333',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		padding: 16,
	},
	modalFormulario: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 20,
		maxHeight: '90%',
	},
	formularioTitulo: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	formularioTituloText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333333',
	},
	btnCerrarFormulario: {
		fontSize: 28,
		color: '#999999',
	},
	formularioSubtitulo: {
		fontSize: 14,
		color: '#666666',
		marginBottom: 16,
	},
	alertError: {
		backgroundColor: '#FFEBEE',
		padding: 12,
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	alertErrorText: {
		color: '#C62828',
		flex: 1,
	},
	alertClose: {
		fontSize: 20,
		color: '#C62828',
		fontWeight: 'bold',
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
	labelOptional: {
		fontWeight: 'normal',
		color: '#999999',
		fontSize: 12,
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
	fechaSelector: {
		flexDirection: 'row',
		gap: 8,
		marginBottom: 8,
	},
	btnFecha: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
	},
	btnFechaActive: {
		backgroundColor: '#00A67E',
		borderColor: '#00A67E',
	},
	btnFechaText: {
		fontSize: 14,
		color: '#333333',
	},
	btnFechaTextActive: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	formButtons: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 8,
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
	btnSubmit: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 8,
		backgroundColor: '#00A67E',
		alignItems: 'center',
	},
	btnSubmitText: {
		fontSize: 16,
		color: '#FFFFFF',
		fontWeight: '600',
	},
});
