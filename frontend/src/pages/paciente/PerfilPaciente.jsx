import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	IoPersonOutline,
	IoMedkitOutline,
	IoCallOutline,
	IoLockClosedOutline,
	IoCameraOutline,
	IoCloseCircle,
	IoInformationCircleOutline,
	IoEyeOutline,
	IoEyeOffOutline,
	IoAddOutline,
	IoCreateOutline,
	IoTrashOutline,
	IoStarOutline,
	IoStar,
} from 'react-icons/io5';
import { useAuth } from '../../auth';
import { usuariosAPI, pacientesAPI, contactosEmergenciaAPI } from '../../services/api';
import './PerfilPaciente.css';

export default function PerfilPaciente() {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const fileInputRef = useRef(null);

	// Estados principales
	const [usuario, setUsuario] = useState(null);
	const [paciente, setPaciente] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Estados de edición
	const [modoEdicion, setModoEdicion] = useState(false);
	const [guardando, setGuardando] = useState(false);

	// Datos personales (Usuario)
	const [formDataPersonal, setFormDataPersonal] = useState({
		nombreCompleto: '',
		email: '',
		telefono: '',
		direccion: '',
		fechaNacimiento: '',
		avatar: '',
	});

	// Datos médicos (Paciente)
	const [formDataMedico, setFormDataMedico] = useState({
		tipoSanguineo: '',
		peso: '',
		altura: '',
		alergias: '',
		condicionesMedicas: '',
		medicamentosActuales: '',
		nombreObraSocial: '',
		numeroAfiliado: '',
	});

	// Estados para avatar
	const [avatarPreview, setAvatarPreview] = useState(null);

	// Estados para contactos de emergencia
	const [contactos, setContactos] = useState([]);
	const [modalContacto, setModalContacto] = useState(false);
	const [contactoEditando, setContactoEditando] = useState(null);
	const [formContacto, setFormContacto] = useState({
		nombre: '',
		relacion: '',
		telefono: '',
		email: '',
		esContactoPrincipal: false,
	});

	// Estados para modal de contraseña
	const [modalPassword, setModalPassword] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [mostrarPasswords, setMostrarPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [guardandoPassword, setGuardandoPassword] = useState(false);

	useEffect(() => {
		cargarDatos();
	}, []);

	const cargarDatos = async () => {
		try {
			setLoading(true);
			setError(null);

			// Cargar datos del usuario
			const usuarioData = await usuariosAPI.getMe();
			setUsuario(usuarioData);

			// Formatear fecha de nacimiento
			let fechaFormateada = '';
			if (usuarioData.fechaNacimiento) {
				const fecha = new Date(usuarioData.fechaNacimiento);
				fechaFormateada = fecha.toISOString().split('T')[0];
			}

			setFormDataPersonal({
				nombreCompleto: usuarioData.nombreCompleto || '',
				email: usuarioData.email || '',
				telefono: usuarioData.telefono || '',
				direccion: usuarioData.direccion || '',
				fechaNacimiento: fechaFormateada,
				avatar: usuarioData.avatar || '',
			});
			setAvatarPreview(usuarioData.avatar || null);

			// Cargar datos del paciente
			try {
				const pacienteData = await pacientesAPI.getByUsuarioId(usuarioData.id);
				setPaciente(pacienteData);

				// Convertir arrays a strings separados por comas para visualización
				const condicionesMedicasStr = Array.isArray(pacienteData.condicionesMedicas)
					? pacienteData.condicionesMedicas.join(', ')
					: pacienteData.condicionesMedicas || '';

				const notasImportantesStr = Array.isArray(pacienteData.notasImportantes)
					? pacienteData.notasImportantes.join(', ')
					: pacienteData.notasImportantes || '';

				setFormDataMedico({
					tipoSanguineo: pacienteData.tipoSanguineo || '',
					peso: pacienteData.peso || '',
					altura: pacienteData.altura || '',
					alergias: pacienteData.alergias || '',
					condicionesMedicas: condicionesMedicasStr,
					medicamentosActuales: notasImportantesStr, // Backend usa "notasImportantes" para medicamentos
					nombreObraSocial: pacienteData.obraSocial || '',
					numeroAfiliado: pacienteData.numeroAfiliado || '',
				});
			} catch (err) {
				console.warn('No se encontró paciente asociado:', err);
			}

			// Cargar contactos de emergencia
			try {
				const contactosData = await contactosEmergenciaAPI.getByPaciente(usuarioData.id);
				setContactos(contactosData || []);
			} catch (err) {
				console.warn('No se pudieron cargar contactos:', err);
				setContactos([]);
			}
		} catch (err) {
			console.error('Error al cargar datos:', err);
			setError('No se pudieron cargar los datos del perfil');
		} finally {
			setLoading(false);
		}
	};

	// ==================== MANEJO DE FORMULARIO PRINCIPAL ====================

	const handleEditar = () => {
		setModoEdicion(true);
		setError(null);
		setSuccess(null);
	};

	const handleCancelar = () => {
		setModoEdicion(false);
		cargarDatos();
		setError(null);
		setSuccess(null);
	};

	const handleInputChange = (e, seccion) => {
		const { name, value } = e.target;
		if (seccion === 'personal') {
			setFormDataPersonal((prev) => ({ ...prev, [name]: value }));
		} else if (seccion === 'medico') {
			setFormDataMedico((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleGuardar = async () => {
		try {
			// Validaciones
			if (!formDataPersonal.nombreCompleto.trim()) {
				setError('El nombre completo es obligatorio');
				return;
			}

			if (formDataPersonal.nombreCompleto.trim().length < 2) {
				setError('El nombre debe tener al menos 2 caracteres');
				return;
			}

			if (formDataPersonal.telefono && !/^\d+$/.test(formDataPersonal.telefono)) {
				setError('El teléfono debe contener solo números');
				return;
			}

			if (formDataMedico.peso && parseFloat(formDataMedico.peso) <= 0) {
				setError('El peso debe ser un número positivo');
				return;
			}

			if (formDataMedico.altura && parseFloat(formDataMedico.altura) <= 0) {
				setError('La altura debe ser un número positivo');
				return;
			}

			setGuardando(true);
			setError(null);
			setSuccess(null);

			// Actualizar datos de usuario (heredados)
			const updateDataUsuario = {
				nombreCompleto: formDataPersonal.nombreCompleto.trim(),
				direccion: formDataPersonal.direccion?.trim() || null,
				telefono: formDataPersonal.telefono?.trim() || null,
				fechaNacimiento: formDataPersonal.fechaNacimiento || null,
				avatar: formDataPersonal.avatar || null,
			};

			await usuariosAPI.update(usuario.id, updateDataUsuario);

			// Actualizar datos de paciente (médicos)
			// Convertir strings a arrays
			const condicionesMedicasArray = formDataMedico.condicionesMedicas
				? formDataMedico.condicionesMedicas.split(',').map((c) => c.trim()).filter(Boolean)
				: [];

			const notasImportantesArray = formDataMedico.medicamentosActuales
				? formDataMedico.medicamentosActuales.split(',').map((m) => m.trim()).filter(Boolean)
				: [];

			const updateDataPaciente = {
				nombreCompleto: formDataPersonal.nombreCompleto.trim(),
				email: formDataPersonal.email,
				tipoSanguineo: formDataMedico.tipoSanguineo || null,
				peso: formDataMedico.peso ? parseFloat(formDataMedico.peso) : null,
				altura: formDataMedico.altura ? parseFloat(formDataMedico.altura) : null,
				alergias: formDataMedico.alergias?.trim() || null,
				condicionesMedicas: condicionesMedicasArray.length > 0 ? condicionesMedicasArray : [],
				notasImportantes: notasImportantesArray.length > 0 ? notasImportantesArray : [],
				obraSocial: formDataMedico.nombreObraSocial?.trim() || null,
				numeroAfiliado: formDataMedico.numeroAfiliado?.trim() || null,
			};

			await pacientesAPI.actualizarPerfil(usuario.id, updateDataPaciente);

			// Recargar datos
			await cargarDatos();

			setModoEdicion(false);
			setSuccess('Perfil actualizado correctamente');

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

	// ==================== MANEJO DE AVATAR ====================

	const handleAvatarClick = () => {
		if (modoEdicion) {
			fileInputRef.current?.click();
		}
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith('image/')) {
				setError('Por favor selecciona una imagen válida');
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				setError('La imagen no debe superar los 5MB');
				return;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarPreview(reader.result);
				setFormDataPersonal((prev) => ({
					...prev,
					avatar: reader.result,
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveAvatar = (e) => {
		e.stopPropagation();
		setAvatarPreview(null);
		setFormDataPersonal((prev) => ({
			...prev,
			avatar: '',
		}));
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const getIniciales = () => {
		const nombre = formDataPersonal.nombreCompleto || usuario?.nombreCompleto || '';
		const palabras = nombre.trim().split(' ').filter(Boolean);
		if (palabras.length === 0) return '?';
		if (palabras.length === 1) return palabras[0][0].toUpperCase();
		return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
	};

	// ==================== CONTACTOS DE EMERGENCIA ====================

	const handleAbrirModalContacto = (contacto = null) => {
		if (contacto) {
			setContactoEditando(contacto);
			setFormContacto({
				nombre: contacto.nombre || '',
				relacion: contacto.relacion || '',
				telefono: contacto.telefono || '',
				email: contacto.email || '',
				esContactoPrincipal: contacto.esContactoPrincipal || false,
			});
		} else {
			setContactoEditando(null);
			setFormContacto({
				nombre: '',
				relacion: '',
				telefono: '',
				email: '',
				esContactoPrincipal: false,
			});
		}
		setModalContacto(true);
		setError(null);
	};

	const handleCerrarModalContacto = () => {
		setModalContacto(false);
		setContactoEditando(null);
		setFormContacto({
			nombre: '',
			relacion: '',
			telefono: '',
			email: '',
			esContactoPrincipal: false,
		});
		setError(null);
	};

	const handleContactoInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormContacto((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleGuardarContacto = async (e) => {
		e.preventDefault();

		// Validaciones
		if (!formContacto.nombre.trim()) {
			setError('El nombre es obligatorio');
			return;
		}

		if (!formContacto.relacion) {
			setError('La relación es obligatoria');
			return;
		}

		if (!formContacto.telefono.trim()) {
			setError('El teléfono es obligatorio');
			return;
		}

		if (!/^\d+$/.test(formContacto.telefono)) {
			setError('El teléfono debe contener solo números');
			return;
		}

		try {
			setGuardando(true);
			setError(null);

			const contactoData = {
				nombre: formContacto.nombre.trim(),
				relacion: formContacto.relacion,
				telefono: formContacto.telefono.trim(),
				email: formContacto.email?.trim() || null,
				esContactoPrincipal: formContacto.esContactoPrincipal,
			};

			if (contactoEditando) {
				// Actualizar contacto existente
				await contactosEmergenciaAPI.actualizar(contactoEditando.id, contactoData);
			} else {
				// Crear nuevo contacto
				await contactosEmergenciaAPI.crear(usuario.id, contactoData);
			}

			// Recargar contactos
			const contactosData = await contactosEmergenciaAPI.getByPaciente(usuario.id);
			setContactos(contactosData || []);

			handleCerrarModalContacto();
			setSuccess(contactoEditando ? 'Contacto actualizado' : 'Contacto agregado');

			setTimeout(() => {
				setSuccess(null);
			}, 3000);
		} catch (err) {
			console.error('Error al guardar contacto:', err);
			setError(err.message || 'Error al guardar el contacto');
		} finally {
			setGuardando(false);
		}
	};

	const handleEliminarContacto = async (contactoId) => {
		if (!window.confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
			return;
		}

		try {
			await contactosEmergenciaAPI.eliminar(contactoId);

			// Recargar contactos
			const contactosData = await contactosEmergenciaAPI.getByPaciente(usuario.id);
			setContactos(contactosData || []);

			setSuccess('Contacto eliminado');
			setTimeout(() => {
				setSuccess(null);
			}, 3000);
		} catch (err) {
			console.error('Error al eliminar contacto:', err);
			setError(err.message || 'Error al eliminar el contacto');
		}
	};

	const handleMarcarPrincipal = async (contactoId) => {
		try {
			const contacto = contactos.find((c) => c.id === contactoId);
			if (!contacto) return;

			// Actualizar contacto como principal
			await contactosEmergenciaAPI.actualizar(contactoId, {
				...contacto,
				esContactoPrincipal: true,
			});

			// Recargar contactos
			const contactosData = await contactosEmergenciaAPI.getByPaciente(usuario.id);
			setContactos(contactosData || []);

			setSuccess('Contacto principal actualizado');
			setTimeout(() => {
				setSuccess(null);
			}, 3000);
		} catch (err) {
			console.error('Error al marcar como principal:', err);
			setError(err.message || 'Error al actualizar contacto principal');
		}
	};

	// ==================== CAMBIAR CONTRASEÑA ====================

	const handleOpenModalPassword = () => {
		setModalPassword(true);
		setPasswordData({
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		});
		setMostrarPasswords({
			current: false,
			new: false,
			confirm: false,
		});
		setError(null);
		setSuccess(null);
	};

	const handleCloseModalPassword = () => {
		setModalPassword(false);
		setPasswordData({
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		});
		setMostrarPasswords({
			current: false,
			new: false,
			confirm: false,
		});
		setError(null);
		setSuccess(null);
	};

	const handlePasswordDataChange = (e) => {
		const { name, value } = e.target;
		setPasswordData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const togglePasswordVisibility = (field) => {
		setMostrarPasswords((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();

		if (!passwordData.currentPassword) {
			setError('Debes ingresar tu contraseña actual');
			return;
		}

		if (!passwordData.newPassword) {
			setError('Debes ingresar una nueva contraseña');
			return;
		}

		if (passwordData.newPassword.length < 8) {
			setError('La nueva contraseña debe tener al menos 8 caracteres');
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setError('Las contraseñas no coinciden');
			return;
		}

		try {
			setGuardandoPassword(true);
			setError(null);
			setSuccess(null);

			await usuariosAPI.changePassword(
				passwordData.currentPassword,
				passwordData.newPassword
			);

			handleCloseModalPassword();
			setSuccess('Contraseña actualizada correctamente');

			setTimeout(() => {
				setSuccess(null);
			}, 3000);
		} catch (err) {
			console.error('Error al cambiar contraseña:', err);
			setError(err.message || 'Error al cambiar la contraseña');
		} finally {
			setGuardandoPassword(false);
		}
	};

	const handleCerrarSesion = () => {
		if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
			logout();
			navigate('/login', { replace: true });
		}
	};

	// ==================== RENDER ====================

	if (loading) {
		return (
			<div className="perfil-container">
				<p className="mensaje-loading">Cargando datos del perfil...</p>
			</div>
		);
	}

	return (
		<div className="perfil-container">
			{/* Header con Avatar */}
			<div className="perfil-avatar-section">
				<div className="avatar-container" onClick={handleAvatarClick}>
					{avatarPreview ? (
						<>
							<img src={avatarPreview} alt="Avatar" className="avatar-perfil" />
							{modoEdicion && (
								<button
									className="btn-remove-avatar"
									onClick={handleRemoveAvatar}
									type="button"
									title="Eliminar foto"
								>
									<IoCloseCircle />
								</button>
							)}
						</>
					) : (
						<div className="avatar-iniciales">{getIniciales()}</div>
					)}
					{modoEdicion && (
						<div className="avatar-overlay">
							<IoCameraOutline className="camera-icon" />
							<span>Cambiar foto</span>
						</div>
					)}
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleAvatarChange}
					style={{ display: 'none' }}
				/>
			</div>

			{/* Mensajes de error/éxito globales */}
			{error && <div className="mensaje-error">{error}</div>}
			{success && <div className="mensaje-exito">{success}</div>}

			{/* ==================== SECCIÓN: DATOS PERSONALES ==================== */}
			<div className="perfil-header">
				<div className="perfil-header-icon">
					<IoPersonOutline />
				</div>
				<div className="perfil-header-content">
					<div className="perfil-titulo">
						<div className="perfil-titulo-text">
							<span>Datos Personales</span>
						</div>
					</div>
				</div>
			</div>

			<div className="perfil-form">
				{/* Nombre Completo */}
				<div className="form-field">
					<label className="form-label">
						Nombre Completo <span className="required">*</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{usuario?.nombreCompleto || 'Sin nombre'}</div>
					) : (
						<input
							type="text"
							name="nombreCompleto"
							className="form-input"
							value={formDataPersonal.nombreCompleto}
							onChange={(e) => handleInputChange(e, 'personal')}
							placeholder="Ingresa tu nombre completo"
							disabled={guardando}
							required
						/>
					)}
				</div>

				{/* Email */}
				<div className="form-field">
					<label className="form-label label-con-tooltip">
						Email <span className="required">*</span>
						<span className="tooltip-icon" title="El email no se puede modificar">
							<IoInformationCircleOutline />
						</span>
					</label>
					<input
						type="email"
						name="email"
						className="form-input"
						value={formDataPersonal.email}
						disabled
					/>
				</div>

				{/* Teléfono */}
				<div className="form-field">
					<label className="form-label">
						Teléfono <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{usuario?.telefono || 'No especificado'}</div>
					) : (
						<input
							type="tel"
							name="telefono"
							className="form-input"
							value={formDataPersonal.telefono}
							onChange={(e) => handleInputChange(e, 'personal')}
							placeholder="Ingresa tu número de teléfono"
							disabled={guardando}
						/>
					)}
				</div>

				{/* Dirección */}
				<div className="form-field">
					<label className="form-label">
						Dirección <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{usuario?.direccion || 'No especificada'}</div>
					) : (
						<input
							type="text"
							name="direccion"
							className="form-input"
							value={formDataPersonal.direccion}
							onChange={(e) => handleInputChange(e, 'personal')}
							placeholder="Ingresa tu dirección"
							disabled={guardando}
						/>
					)}
				</div>

				{/* Fecha de Nacimiento */}
				<div className="form-field">
					<label className="form-label">
						Fecha de Nacimiento <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">
							{usuario?.fechaNacimiento
								? new Date(usuario.fechaNacimiento).toLocaleDateString('es-AR', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
								  })
								: 'No especificada'}
						</div>
					) : (
						<input
							type="date"
							name="fechaNacimiento"
							className="form-input"
							value={formDataPersonal.fechaNacimiento}
							onChange={(e) => handleInputChange(e, 'personal')}
							disabled={guardando}
						/>
					)}
				</div>
			</div>

			{/* ==================== SECCIÓN: DATOS MÉDICOS ==================== */}
			<div className="perfil-header" style={{ marginTop: '24px' }}>
				<div className="perfil-header-icon">
					<IoMedkitOutline />
				</div>
				<div className="perfil-header-content">
					<div className="perfil-titulo">
						<div className="perfil-titulo-text">
							<span>Datos Médicos</span>
						</div>
					</div>
				</div>
			</div>

			<div className="perfil-form">
				{/* Tipo Sanguíneo */}
				<div className="form-field">
					<label className="form-label">
						Tipo Sanguíneo <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{paciente?.tipoSanguineo || 'No especificado'}</div>
					) : (
						<select
							name="tipoSanguineo"
							className="form-input"
							value={formDataMedico.tipoSanguineo}
							onChange={(e) => handleInputChange(e, 'medico')}
							disabled={guardando}
						>
							<option value="">Selecciona tu tipo</option>
							<option value="O+">O+</option>
							<option value="O-">O-</option>
							<option value="A+">A+</option>
							<option value="A-">A-</option>
							<option value="B+">B+</option>
							<option value="B-">B-</option>
							<option value="AB+">AB+</option>
							<option value="AB-">AB-</option>
						</select>
					)}
				</div>

				{/* Peso */}
				<div className="form-field">
					<label className="form-label">
						Peso (kg) <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{paciente?.peso ? `${paciente.peso} kg` : 'No especificado'}</div>
					) : (
						<input
							type="number"
							name="peso"
							className="form-input"
							value={formDataMedico.peso}
							onChange={(e) => handleInputChange(e, 'medico')}
							placeholder="Ej: 70.5"
							min="0"
							step="0.1"
							disabled={guardando}
						/>
					)}
				</div>

				{/* Altura */}
				<div className="form-field">
					<label className="form-label">
						Altura (cm) <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{paciente?.altura ? `${paciente.altura} cm` : 'No especificado'}</div>
					) : (
						<input
							type="number"
							name="altura"
							className="form-input"
							value={formDataMedico.altura}
							onChange={(e) => handleInputChange(e, 'medico')}
							placeholder="Ej: 175"
							min="0"
							step="0.1"
							disabled={guardando}
						/>
					)}
				</div>

				{/* Alergias */}
				<div className="form-field">
					<label className="form-label">
						Alergias <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{paciente?.alergias || 'Sin alergias registradas'}</div>
					) : (
						<textarea
							name="alergias"
							className="form-input form-textarea"
							value={formDataMedico.alergias}
							onChange={(e) => handleInputChange(e, 'medico')}
							placeholder="Ej: Polen, penicilina, maní..."
							rows={3}
							disabled={guardando}
						/>
					)}
				</div>

				{/* Condiciones Médicas */}
				<div className="form-field">
					<label className="form-label">
						Condiciones Médicas <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">
							{paciente?.condicionesMedicas && paciente.condicionesMedicas.length > 0
								? paciente.condicionesMedicas.join(', ')
								: 'Sin condiciones registradas'}
						</div>
					) : (
						<textarea
							name="condicionesMedicas"
							className="form-input form-textarea"
							value={formDataMedico.condicionesMedicas}
							onChange={(e) => handleInputChange(e, 'medico')}
							placeholder="Ej: Diabetes, hipertensión... (separadas por coma)"
							rows={3}
							disabled={guardando}
						/>
					)}
				</div>

				{/* Medicamentos Actuales */}
				<div className="form-field">
					<label className="form-label">
						Medicamentos Actuales <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">
							{paciente?.notasImportantes && paciente.notasImportantes.length > 0
								? paciente.notasImportantes.join(', ')
								: 'Sin medicamentos registrados'}
						</div>
					) : (
						<textarea
							name="medicamentosActuales"
							className="form-input form-textarea"
							value={formDataMedico.medicamentosActuales}
							onChange={(e) => handleInputChange(e, 'medico')}
							placeholder="Ej: Aspirina 100mg, Enalapril 10mg... (separados por coma)"
							rows={3}
							disabled={guardando}
						/>
					)}
				</div>

				{/* Obra Social */}
				<div className="form-field">
					<label className="form-label">
						Obra Social <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{paciente?.obraSocial || 'No especificada'}</div>
					) : (
						<input
							type="text"
							name="nombreObraSocial"
							className="form-input"
							value={formDataMedico.nombreObraSocial}
							onChange={(e) => handleInputChange(e, 'medico')}
							placeholder="Ej: OSDE, Swiss Medical..."
							disabled={guardando}
						/>
					)}
				</div>

				{/* Número de Afiliado */}
				<div className="form-field">
					<label className="form-label">
						Número de Afiliado <span className="opcional">(opcional)</span>
					</label>
					{!modoEdicion ? (
						<div className="form-value">{paciente?.numeroAfiliado || 'No especificado'}</div>
					) : (
						<input
							type="text"
							name="numeroAfiliado"
							className="form-input"
							value={formDataMedico.numeroAfiliado}
							onChange={(e) => handleInputChange(e, 'medico')}
							placeholder="Ingresa tu número de afiliado"
							disabled={guardando}
						/>
					)}
				</div>

				{/* Botones de Acción para Datos Personales y Médicos */}
				{modoEdicion ? (
					<div className="perfil-actions">
						<button className="btn-perfil btn-guardar" onClick={handleGuardar} disabled={guardando}>
							{guardando ? 'Guardando...' : 'Guardar Cambios'}
						</button>
						<button className="btn-perfil btn-cancelar" onClick={handleCancelar} disabled={guardando}>
							Cancelar
						</button>
					</div>
				) : (
					<div className="perfil-actions">
						<button className="btn-perfil btn-editar" onClick={handleEditar}>
							Editar Perfil
						</button>
					</div>
				)}
			</div>

			{/* ==================== SECCIÓN: CONTACTOS DE EMERGENCIA ==================== */}
			<div className="perfil-header" style={{ marginTop: '24px' }}>
				<div className="perfil-header-icon">
					<IoCallOutline />
				</div>
				<div className="perfil-header-content">
					<div className="perfil-titulo">
						<div className="perfil-titulo-text">
							<span>Contactos de Emergencia</span>
						</div>
					</div>
				</div>
			</div>

			<div className="perfil-form">
				{contactos.length > 0 ? (
					<div className="contactos-lista">
						{contactos.map((contacto) => (
							<div key={contacto.id} className="contacto-card">
								<div className="contacto-info">
									<div className="contacto-nombre">
										{contacto.nombre}
										{contacto.esContactoPrincipal && (
											<span className="badge-principal">
												<IoStar /> Principal
											</span>
										)}
									</div>
									<div className="contacto-detalle">
										<strong>Relación:</strong> {contacto.relacion}
									</div>
									<div className="contacto-detalle">
										<strong>Teléfono:</strong> {contacto.telefono}
									</div>
									{contacto.email && (
										<div className="contacto-detalle">
											<strong>Email:</strong> {contacto.email}
										</div>
									)}
								</div>
								<div className="contacto-acciones">
									<button
										className="btn-icon btn-editar"
										onClick={() => handleAbrirModalContacto(contacto)}
										title="Editar contacto"
									>
										<IoCreateOutline />
									</button>
									{!contacto.esContactoPrincipal && (
										<button
											className="btn-icon btn-principal"
											onClick={() => handleMarcarPrincipal(contacto.id)}
											title="Marcar como principal"
										>
											<IoStarOutline />
										</button>
									)}
									<button
										className="btn-icon btn-eliminar"
										onClick={() => handleEliminarContacto(contacto.id)}
										title="Eliminar contacto"
									>
										<IoTrashOutline />
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="form-value">No tienes contactos de emergencia registrados</div>
				)}

				<button className="btn-perfil btn-agregar" onClick={() => handleAbrirModalContacto(null)}>
					<IoAddOutline /> Agregar Contacto
				</button>
			</div>

			{/* ==================== SECCIÓN: SEGURIDAD ==================== */}
			<div className="perfil-header" style={{ marginTop: '24px' }}>
				<div className="perfil-header-icon">
					<IoLockClosedOutline />
				</div>
				<div className="perfil-header-content">
					<div className="perfil-titulo">
						<div className="perfil-titulo-text">
							<span>Seguridad</span>
						</div>
					</div>
				</div>
			</div>

			<div className="perfil-form">
				<div className="form-field">
					<label className="form-label">Contraseña</label>
					<div className="password-field">
						<div className="password-dots">••••••••••••</div>
						<button className="btn-perfil btn-cambiar-password" onClick={handleOpenModalPassword} type="button">
							Cambiar Contraseña
						</button>
					</div>
				</div>

				<div className="perfil-actions">
					<button className="btn-perfil btn-cerrar-sesion" onClick={handleCerrarSesion}>
						Cerrar Sesión
					</button>
				</div>
			</div>

			{/* ==================== MODAL: AGREGAR/EDITAR CONTACTO ==================== */}
			{modalContacto && (
				<div className="modal-overlay" onClick={handleCerrarModalContacto}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>{contactoEditando ? 'Editar Contacto' : 'Agregar Contacto'}</h2>
							<button className="modal-close-btn" onClick={handleCerrarModalContacto} type="button">
								<IoCloseCircle />
							</button>
						</div>

						{error && <div className="mensaje-error">{error}</div>}

						<form onSubmit={handleGuardarContacto} className="modal-form">
							{/* Nombre */}
							<div className="form-field">
								<label className="form-label">
									Nombre <span className="required">*</span>
								</label>
								<input
									type="text"
									name="nombre"
									className="form-input"
									value={formContacto.nombre}
									onChange={handleContactoInputChange}
									placeholder="Nombre del contacto"
									disabled={guardando}
									required
								/>
							</div>

							{/* Relación */}
							<div className="form-field">
								<label className="form-label">
									Relación <span className="required">*</span>
								</label>
								<select
									name="relacion"
									className="form-input"
									value={formContacto.relacion}
									onChange={handleContactoInputChange}
									disabled={guardando}
									required
								>
									<option value="">Selecciona la relación</option>
									<option value="Hijo/a">Hijo/a</option>
									<option value="Hermano/a">Hermano/a</option>
									<option value="Padre/Madre">Padre/Madre</option>
									<option value="Cónyuge">Cónyuge</option>
									<option value="Amigo/a">Amigo/a</option>
									<option value="Otro">Otro</option>
								</select>
							</div>

							{/* Teléfono */}
							<div className="form-field">
								<label className="form-label">
									Teléfono <span className="required">*</span>
								</label>
								<input
									type="tel"
									name="telefono"
									className="form-input"
									value={formContacto.telefono}
									onChange={handleContactoInputChange}
									placeholder="Número de teléfono"
									disabled={guardando}
									required
								/>
							</div>

							{/* Email */}
							<div className="form-field">
								<label className="form-label">
									Email <span className="opcional">(opcional)</span>
								</label>
								<input
									type="email"
									name="email"
									className="form-input"
									value={formContacto.email}
									onChange={handleContactoInputChange}
									placeholder="Email del contacto"
									disabled={guardando}
								/>
							</div>

							{/* Marcar como principal */}
							<div className="form-field">
								<label className="checkbox-label">
									<input
										type="checkbox"
										name="esContactoPrincipal"
										checked={formContacto.esContactoPrincipal}
										onChange={handleContactoInputChange}
										disabled={guardando}
									/>
									<span>Marcar como contacto principal</span>
								</label>
							</div>

							{/* Botones del modal */}
							<div className="modal-actions">
								<button type="submit" className="btn-perfil btn-guardar" disabled={guardando}>
									{guardando ? 'Guardando...' : 'Guardar Contacto'}
								</button>
								<button
									type="button"
									className="btn-perfil btn-cancelar"
									onClick={handleCerrarModalContacto}
									disabled={guardando}
								>
									Cancelar
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ==================== MODAL: CAMBIAR CONTRASEÑA ==================== */}
			{modalPassword && (
				<div className="modal-overlay" onClick={handleCloseModalPassword}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Cambiar Contraseña</h2>
							<button className="modal-close-btn" onClick={handleCloseModalPassword} type="button">
								<IoCloseCircle />
							</button>
						</div>

						{error && <div className="mensaje-error">{error}</div>}

						<form onSubmit={handleChangePassword} className="modal-form">
							{/* Contraseña Actual */}
							<div className="form-field">
								<label className="form-label">
									Contraseña Actual <span className="required">*</span>
								</label>
								<div className="password-input-wrapper">
									<input
										type={mostrarPasswords.current ? 'text' : 'password'}
										name="currentPassword"
										className="form-input"
										value={passwordData.currentPassword}
										onChange={handlePasswordDataChange}
										placeholder="Ingresa tu contraseña actual"
										disabled={guardandoPassword}
										required
									/>
									<button
										className="toggle-password-btn"
										onClick={() => togglePasswordVisibility('current')}
										type="button"
									>
										{mostrarPasswords.current ? <IoEyeOffOutline /> : <IoEyeOutline />}
									</button>
								</div>
							</div>

							{/* Nueva Contraseña */}
							<div className="form-field">
								<label className="form-label">
									Nueva Contraseña <span className="required">*</span>
								</label>
								<div className="password-input-wrapper">
									<input
										type={mostrarPasswords.new ? 'text' : 'password'}
										name="newPassword"
										className="form-input"
										value={passwordData.newPassword}
										onChange={handlePasswordDataChange}
										placeholder="Mínimo 8 caracteres"
										disabled={guardandoPassword}
										required
										minLength={8}
									/>
									<button
										className="toggle-password-btn"
										onClick={() => togglePasswordVisibility('new')}
										type="button"
									>
										{mostrarPasswords.new ? <IoEyeOffOutline /> : <IoEyeOutline />}
									</button>
								</div>
							</div>

							{/* Confirmar Nueva Contraseña */}
							<div className="form-field">
								<label className="form-label">
									Confirmar Nueva Contraseña <span className="required">*</span>
								</label>
								<div className="password-input-wrapper">
									<input
										type={mostrarPasswords.confirm ? 'text' : 'password'}
										name="confirmPassword"
										className="form-input"
										value={passwordData.confirmPassword}
										onChange={handlePasswordDataChange}
										placeholder="Repite la nueva contraseña"
										disabled={guardandoPassword}
										required
									/>
									<button
										className="toggle-password-btn"
										onClick={() => togglePasswordVisibility('confirm')}
										type="button"
									>
										{mostrarPasswords.confirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
									</button>
								</div>
							</div>

							{/* Botones del modal */}
							<div className="modal-actions">
								<button type="submit" className="btn-perfil btn-guardar" disabled={guardandoPassword}>
									{guardandoPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
								</button>
								<button
									type="button"
									className="btn-perfil btn-cancelar"
									onClick={handleCloseModalPassword}
									disabled={guardandoPassword}
								>
									Cancelar
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
