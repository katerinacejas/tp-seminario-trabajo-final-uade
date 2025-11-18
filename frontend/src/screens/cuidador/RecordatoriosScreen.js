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
import { recordatoriosAPI, medicamentosAPI, citasAPI } from '../../services/api';
import { usePaciente } from '../../context/PacienteContext';

export default function RecordatoriosScreen() {
	const { pacienteSeleccionado } = usePaciente();
	const pacienteId = pacienteSeleccionado?.id;

	const [mostrarFormulario, setMostrarFormulario] = useState(false);
	const [tipoRecordatorio, setTipoRecordatorio] = useState('MEDICAMENTO');
	const [formData, setFormData] = useState({
		descripcion: '',
		fecha: '',
		hora: '',
		repetirCada: 'nunca',
		repetirHasta: 'indefinido',
		fechaFin: '',
		nombreMedicamento: '',
		dosis: '',
		ubicacion: '',
		nombreDoctor: '',
		especialidad: '',
		motivo: '',
	});

	const [recordatorios, setRecordatorios] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (pacienteId) {
			cargarRecordatorios();
		}
	}, [pacienteId]);

	const cargarRecordatorios = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await recordatoriosAPI.getByPaciente(pacienteId);
			setRecordatorios(data);
		} catch (err) {
			console.error('Error al cargar recordatorios:', err);
			setError('No se pudieron cargar los recordatorios');
			// Mock data
			setRecordatorios([
				{
					id: 1,
					tipo: 'CITA_MEDICA',
					descripcion: 'Cita con el cardiólogo',
					fechaHora: '2025-11-10T11:30:00',
					estado: 'COMPLETADO',
					nombreDoctor: 'Dr. García',
					ubicacion: 'Hospital Alemán',
				},
				{
					id: 2,
					tipo: 'MEDICAMENTO',
					descripcion: 'Pastilla para la presión',
					fechaHora: '2025-11-10T08:00:00',
					estado: 'CANCELADO',
					nombreMedicamento: 'Losartán',
					dosis: '50mg',
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleTipoChange = (nuevoTipo) => {
		setTipoRecordatorio(nuevoTipo);
		if (nuevoTipo === 'MEDICAMENTO') {
			setFormData((prev) => ({
				...prev,
				ubicacion: '',
				nombreDoctor: '',
				especialidad: '',
				motivo: '',
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				nombreMedicamento: '',
				dosis: '',
				repetirCada: 'nunca',
			}));
		}
	};

	const handleSubmit = async () => {
		setLoading(true);
		setError(null);

		try {
			let fechaFinCalculada = formData.fechaFin;
			if (formData.repetirHasta === 'indefinido' && formData.repetirCada !== 'nunca') {
				const fechaInicio = new Date(formData.fecha);
				fechaInicio.setMonth(fechaInicio.getMonth() + 6);
				fechaFinCalculada = fechaInicio.toISOString().split('T')[0];
			}

			if (tipoRecordatorio === 'MEDICAMENTO') {
				const medicamentoData = {
					pacienteId: parseInt(pacienteId),
					nombre: formData.nombreMedicamento,
					dosis: formData.dosis || null,
					frecuencia: formData.repetirCada,
					viaAdministracion: null,
					fechaInicio: formData.fecha,
					fechaFin: fechaFinCalculada,
					observaciones: formData.descripcion,
					horarios: [
						{
							hora: formData.hora,
							diasSemana: formData.repetirCada === 'diario' ? null : null,
						},
					],
				};

				await medicamentosAPI.crear(medicamentoData);
			} else {
				const citaData = {
					pacienteId: parseInt(pacienteId),
					fechaHora: `${formData.fecha}T${formData.hora}:00`,
					ubicacion: formData.ubicacion || null,
					nombreDoctor: formData.nombreDoctor || null,
					especialidad: formData.especialidad || null,
					motivo: formData.motivo || formData.descripcion,
					observaciones: null,
				};

				await citasAPI.crear(citaData);
			}

			await cargarRecordatorios();
			setMostrarFormulario(false);
			resetFormulario();
		} catch (err) {
			console.error('Error al crear recordatorio:', err);
			setError('No se pudo crear el recordatorio: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const resetFormulario = () => {
		setFormData({
			descripcion: '',
			fecha: '',
			hora: '',
			repetirCada: 'nunca',
			repetirHasta: 'indefinido',
			fechaFin: '',
			nombreMedicamento: '',
			dosis: '',
			ubicacion: '',
			nombreDoctor: '',
			especialidad: '',
			motivo: '',
		});
		setTipoRecordatorio('MEDICAMENTO');
	};

	const ciclarEstado = async (id) => {
		try {
			const recordatorioActualizado = await recordatoriosAPI.ciclarEstado(id);
			setRecordatorios((prev) => prev.map((r) => (r.id === id ? recordatorioActualizado : r)));
		} catch (err) {
			console.error('Error al actualizar estado:', err);
			Alert.alert('Error', 'No se pudo actualizar el estado');
		}
	};

	const confirmarEliminacion = (recordatorio) => {
		Alert.alert(
			'Confirmar eliminación',
			'¿Estás seguro de que deseas eliminar este recordatorio?\n\nEsta acción no se puede deshacer.',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Eliminar',
					style: 'destructive',
					onPress: () => eliminarRecordatorio(recordatorio.id),
				},
			]
		);
	};

	const eliminarRecordatorio = async (id) => {
		try {
			await recordatoriosAPI.eliminar(id);
			setRecordatorios((prev) => prev.filter((r) => r.id !== id));
		} catch (err) {
			console.error('Error al eliminar recordatorio:', err);
			Alert.alert('Error', 'No se pudo eliminar el recordatorio');
		}
	};

	const formatearFechaHora = (fechaHoraStr) => {
		const fecha = new Date(fechaHoraStr);
		const horas = fecha.getHours().toString().padStart(2, '0');
		const minutos = fecha.getMinutes().toString().padStart(2, '0');
		const dia = fecha.getDate().toString().padStart(2, '0');
		const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
		const anio = fecha.getFullYear();
		return {
			hora: `${horas}:${minutos}`,
			fecha: `${dia}/${mes}/${anio}`,
		};
	};

	const getEstadoColor = (estado) => {
		switch (estado) {
			case 'COMPLETADO':
				return '#66BB6A';
			case 'CANCELADO':
				return '#E53935';
			case 'PENDIENTE':
				return '#FFA726';
			default:
				return '#999999';
		}
	};

	const getEstadoTexto = (estado) => {
		switch (estado) {
			case 'COMPLETADO':
				return 'Completado';
			case 'CANCELADO':
				return 'Cancelado';
			case 'PENDIENTE':
				return 'Pendiente';
			default:
				return estado;
		}
	};

	const renderRecordatorio = ({ item }) => {
		const { hora, fecha } = formatearFechaHora(item.fechaHora);

		return (
			<View style={styles.recordatorioItem}>
				<View style={styles.recordatorioIcono}>
					<Text style={styles.recordatorioIconoText}>
						{item.tipo === 'MEDICAMENTO' ? '💊' : '📅'}
					</Text>
				</View>
				<View style={styles.recordatorioInfo}>
					<Text style={styles.recordatorioDescripcion}>{item.descripcion}</Text>
					<Text style={styles.recordatorioDetalles}>
						{hora} - {fecha}
					</Text>
				</View>
				<View style={styles.recordatorioAcciones}>
					<TouchableOpacity
						style={[styles.btnEstado, { backgroundColor: getEstadoColor(item.estado) + '20' }]}
						onPress={() => ciclarEstado(item.id)}
					>
						<Text style={[styles.btnEstadoText, { color: getEstadoColor(item.estado) }]}>
							{getEstadoTexto(item.estado)}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btnEliminar} onPress={() => confirmarEliminacion(item)}>
						<Text style={styles.btnEliminarText}>🗑️</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			{/* Mensaje de error */}
			{error && (
				<View style={styles.alertError}>
					<Text style={styles.alertErrorText}>{error}</Text>
					<TouchableOpacity onPress={() => setError(null)}>
						<Text style={styles.alertClose}>✕</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerContent}>
					<Text style={styles.headerTitle}>Recordatorios</Text>
				</View>

				<TouchableOpacity
					style={styles.btnAñadirRecordatorio}
					onPress={() => setMostrarFormulario(!mostrarFormulario)}
				>
					<Text style={styles.btnAñadirText}>
						{mostrarFormulario ? '✕ Cerrar' : '+ Añadir recordatorio'}
					</Text>
				</TouchableOpacity>
			</View>

			{/* Lista de recordatorios */}
			<View style={styles.listaRecordatoriosCard}>
				<Text style={styles.listaTitulo}>Lista de recordatorios</Text>
				<Text style={styles.listaSubtitulo}>
					De {pacienteSeleccionado?.nombreCompleto || 'Paciente'}
				</Text>

				{loading && recordatorios.length === 0 ? (
					<ActivityIndicator size="large" color="#00A67E" style={styles.loading} />
				) : recordatorios.length === 0 ? (
					<Text style={styles.mensajeVacio}>No hay recordatorios creados</Text>
				) : (
					<FlatList
						data={recordatorios}
						renderItem={renderRecordatorio}
						keyExtractor={(item) => item.id.toString()}
						contentContainerStyle={styles.recordatoriosLista}
					/>
				)}
			</View>

			{/* Modal Formulario */}
			<Modal visible={mostrarFormulario} animationType="slide" transparent={true}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalFormulario}>
						<ScrollView>
							<View style={styles.formularioTitulo}>
								<Text style={styles.formularioTituloText}>Añadir recordatorio</Text>
								<TouchableOpacity
									onPress={() => {
										setMostrarFormulario(false);
										resetFormulario();
									}}
								>
									<Text style={styles.btnCerrarFormulario}>✕</Text>
								</TouchableOpacity>
							</View>
							<Text style={styles.formularioSubtitulo}>
								Para {pacienteSeleccionado?.nombreCompleto || 'Paciente'}
							</Text>

							{/* Selector de tipo */}
							<View style={styles.tipoSelector}>
								<Text style={styles.labelTipo}>Tipo:</Text>
								<View style={styles.tipoButtons}>
									<TouchableOpacity
										style={[
											styles.btnTipo,
											tipoRecordatorio === 'MEDICAMENTO' && styles.btnTipoActive,
										]}
										onPress={() => handleTipoChange('MEDICAMENTO')}
									>
										<Text style={styles.btnTipoText}>Medicación</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											styles.btnTipo,
											tipoRecordatorio === 'CITA_MEDICA' && styles.btnTipoActive,
										]}
										onPress={() => handleTipoChange('CITA_MEDICA')}
									>
										<Text style={styles.btnTipoText}>Cita médica</Text>
									</TouchableOpacity>
								</View>
							</View>

							{/* Campos comunes */}
							<View style={styles.formGroup}>
								<Text style={styles.label}>Descripción</Text>
								<TextInput
									style={styles.input}
									value={formData.descripcion}
									onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
									placeholder="Descripción breve..."
								/>
							</View>

							<View style={styles.formRow}>
								<View style={styles.formGroupHalf}>
									<Text style={styles.label}>Fecha</Text>
									<TextInput
										style={styles.input}
										value={formData.fecha}
										onChangeText={(text) => setFormData({ ...formData, fecha: text })}
										placeholder="YYYY-MM-DD"
									/>
								</View>

								<View style={styles.formGroupHalf}>
									<Text style={styles.label}>Hora</Text>
									<TextInput
										style={styles.input}
										value={formData.hora}
										onChangeText={(text) => setFormData({ ...formData, hora: text })}
										placeholder="HH:MM"
									/>
								</View>
							</View>

							{/* Campos específicos de MEDICAMENTO */}
							{tipoRecordatorio === 'MEDICAMENTO' && (
								<>
									<View style={styles.formRow}>
										<View style={styles.formGroupHalf}>
											<Text style={styles.label}>Nombre del medicamento</Text>
											<TextInput
												style={styles.input}
												value={formData.nombreMedicamento}
												onChangeText={(text) =>
													setFormData({ ...formData, nombreMedicamento: text })
												}
												placeholder="Ej: Losartán"
											/>
										</View>

										<View style={styles.formGroupHalf}>
											<Text style={styles.label}>Dosis</Text>
											<TextInput
												style={styles.input}
												value={formData.dosis}
												onChangeText={(text) => setFormData({ ...formData, dosis: text })}
												placeholder="Ej: 50mg"
											/>
										</View>
									</View>

									{/* Repetición */}
									<View style={styles.formGroup}>
										<Text style={styles.label}>Repetir cada:</Text>
										<ScrollView horizontal showsHorizontalScrollIndicator={false}>
											<View style={styles.repetirButtons}>
												{['nunca', 'diario', '7dias', '15dias', '1mes'].map((opcion) => (
													<TouchableOpacity
														key={opcion}
														style={[
															styles.btnRepetir,
															formData.repetirCada === opcion && styles.btnRepetirActive,
														]}
														onPress={() => setFormData({ ...formData, repetirCada: opcion })}
													>
														<Text style={styles.btnRepetirText}>
															{opcion === 'nunca'
																? 'Nunca'
																: opcion === 'diario'
																? 'Diariamente'
																: opcion === '7dias'
																? '7 días'
																: opcion === '15dias'
																? '15 días'
																: '1 mes'}
														</Text>
													</TouchableOpacity>
												))}
											</View>
										</ScrollView>
									</View>

									{formData.repetirCada !== 'nunca' && (
										<View style={styles.formGroup}>
											<Text style={styles.label}>Repetir hasta:</Text>
											<View style={styles.repetirHastaContainer}>
												<View style={styles.repetirButtons}>
													<TouchableOpacity
														style={[
															styles.btnRepetir,
															formData.repetirHasta === 'indefinido' && styles.btnRepetirActive,
														]}
														onPress={() =>
															setFormData({ ...formData, repetirHasta: 'indefinido' })
														}
													>
														<Text style={styles.btnRepetirText}>Indefinido</Text>
													</TouchableOpacity>
													<TouchableOpacity
														style={[
															styles.btnRepetir,
															formData.repetirHasta === 'fecha' && styles.btnRepetirActive,
														]}
														onPress={() => setFormData({ ...formData, repetirHasta: 'fecha' })}
													>
														<Text style={styles.btnRepetirText}>Seleccionar...</Text>
													</TouchableOpacity>
												</View>
												{formData.repetirHasta === 'fecha' && (
													<TextInput
														style={styles.input}
														value={formData.fechaFin}
														onChangeText={(text) => setFormData({ ...formData, fechaFin: text })}
														placeholder="YYYY-MM-DD"
													/>
												)}
												{formData.repetirHasta === 'indefinido' && (
													<Text style={styles.avisoIndefinido}>
														Los recordatorios se crearán por los próximos 6 meses
													</Text>
												)}
											</View>
										</View>
									)}
								</>
							)}

							{/* Campos específicos de CITA_MEDICA */}
							{tipoRecordatorio === 'CITA_MEDICA' && (
								<>
									<View style={styles.formGroup}>
										<Text style={styles.label}>Ubicación</Text>
										<TextInput
											style={styles.input}
											value={formData.ubicacion}
											onChangeText={(text) => setFormData({ ...formData, ubicacion: text })}
											placeholder="Ej: Hospital Alemán"
										/>
									</View>

									<View style={styles.formRow}>
										<View style={styles.formGroupHalf}>
											<Text style={styles.label}>Nombre del doctor</Text>
											<TextInput
												style={styles.input}
												value={formData.nombreDoctor}
												onChangeText={(text) => setFormData({ ...formData, nombreDoctor: text })}
												placeholder="Ej: Dr. García"
											/>
										</View>

										<View style={styles.formGroupHalf}>
											<Text style={styles.label}>Especialidad</Text>
											<TextInput
												style={styles.input}
												value={formData.especialidad}
												onChangeText={(text) => setFormData({ ...formData, especialidad: text })}
												placeholder="Ej: Cardiología"
											/>
										</View>
									</View>

									<View style={styles.formGroup}>
										<Text style={styles.label}>Motivo</Text>
										<TextInput
											style={[styles.input, styles.textarea]}
											value={formData.motivo}
											onChangeText={(text) => setFormData({ ...formData, motivo: text })}
											placeholder="Motivo de la consulta..."
											multiline
											numberOfLines={3}
										/>
									</View>
								</>
							)}

							{/* Botones del formulario */}
							<View style={styles.formButtons}>
								<TouchableOpacity
									style={styles.btnCancelar}
									onPress={() => {
										setMostrarFormulario(false);
										resetFormulario();
									}}
								>
									<Text style={styles.btnCancelarText}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
									<Text style={styles.btnSubmitText}>Añadir recordatorio</Text>
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
	alertError: {
		backgroundColor: '#FFEBEE',
		padding: 12,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
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
	btnAñadirRecordatorio: {
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
	listaRecordatoriosCard: {
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
	recordatoriosLista: {
		paddingBottom: 16,
	},
	recordatorioItem: {
		flexDirection: 'row',
		backgroundColor: '#F9F9F9',
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		alignItems: 'center',
	},
	recordatorioIcono: {
		marginRight: 12,
	},
	recordatorioIconoText: {
		fontSize: 28,
	},
	recordatorioInfo: {
		flex: 1,
	},
	recordatorioDescripcion: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333333',
		marginBottom: 4,
	},
	recordatorioDetalles: {
		fontSize: 14,
		color: '#666666',
	},
	recordatorioAcciones: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
	},
	btnEstado: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 6,
	},
	btnEstadoText: {
		fontSize: 12,
		fontWeight: '600',
	},
	btnEliminar: {
		padding: 8,
	},
	btnEliminarText: {
		fontSize: 20,
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
	tipoSelector: {
		marginBottom: 16,
	},
	labelTipo: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333333',
		marginBottom: 8,
	},
	tipoButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	btnTipo: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
	},
	btnTipoActive: {
		backgroundColor: '#00A67E',
		borderColor: '#00A67E',
	},
	btnTipoText: {
		fontSize: 14,
		color: '#333333',
	},
	formGroup: {
		marginBottom: 16,
	},
	formRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 16,
	},
	formGroupHalf: {
		flex: 1,
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
	repetirButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	btnRepetir: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		backgroundColor: '#FFFFFF',
	},
	btnRepetirActive: {
		backgroundColor: '#00A67E',
		borderColor: '#00A67E',
	},
	btnRepetirText: {
		fontSize: 14,
		color: '#333333',
	},
	repetirHastaContainer: {
		gap: 8,
	},
	avisoIndefinido: {
		fontSize: 12,
		color: '#666666',
		fontStyle: 'italic',
		marginTop: 8,
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
