import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoInformationCircleOutline, IoEyeOutline, IoEyeOffOutline, IoCameraOutline, IoCloseCircle } from 'react-icons/io5';
import { useAuth } from '../../auth';
import { usuariosAPI } from '../../services/api';
import './PerfilCuidador.css';

export default function PerfilCuidador() {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const fileInputRef = useRef(null);

	const [usuario, setUsuario] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Estados de edición
	const [modoEdicion, setModoEdicion] = useState(false);
	const [formData, setFormData] = useState({
		nombreCompleto: '',
		direccion: '',
		telefono: '',
		fechaNacimiento: '',
		avatar: '',
		email: '',
	});

	// Estado para preview de avatar
	const [avatarPreview, setAvatarPreview] = useState(null);

	// Estado para modal de cambiar contraseña
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
	const [guardando, setGuardando] = useState(false);
	const [guardandoPassword, setGuardandoPassword] = useState(false);

	useEffect(() => {
		cargarDatosUsuario();
	}, []);

	const cargarDatosUsuario = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await usuariosAPI.getMe();
			setUsuario(data);

			// Formatear fecha de nacimiento para input type="date"
			let fechaFormateada = '';
			if (data.fechaNacimiento) {
				const fecha = new Date(data.fechaNacimiento);
				fechaFormateada = fecha.toISOString().split('T')[0];
			}

			setFormData({
				nombreCompleto: data.nombreCompleto || '',
				direccion: data.direccion || '',
				telefono: data.telefono || '',
				fechaNacimiento: fechaFormateada,
				avatar: data.avatar || '',
				email: data.email || '',
			});
			setAvatarPreview(data.avatar || null);
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

		// Formatear fecha de nacimiento para input type="date"
		let fechaFormateada = '';
		if (usuario.fechaNacimiento) {
			const fecha = new Date(usuario.fechaNacimiento);
			fechaFormateada = fecha.toISOString().split('T')[0];
		}

		setFormData({
			nombreCompleto: usuario.nombreCompleto || '',
			direccion: usuario.direccion || '',
			telefono: usuario.telefono || '',
			fechaNacimiento: fechaFormateada,
			avatar: usuario.avatar || '',
			email: usuario.email || '',
		});
		setAvatarPreview(usuario.avatar || null);
		setError(null);
		setSuccess(null);
	};

	const handleGuardar = async () => {
		try {
			// Validaciones
			if (!formData.nombreCompleto.trim()) {
				setError('El nombre completo es obligatorio');
				return;
			}

			if (formData.nombreCompleto.trim().length < 2) {
				setError('El nombre debe tener al menos 2 caracteres');
				return;
			}

			if (formData.telefono && !/^\d+$/.test(formData.telefono)) {
				setError('El teléfono debe contener solo números');
				return;
			}

			// Validar edad mínima (18 años)
			if (formData.fechaNacimiento) {
				const fechaNac = new Date(formData.fechaNacimiento);
				const hoy = new Date();
				const edad = hoy.getFullYear() - fechaNac.getFullYear();
				const m = hoy.getMonth() - fechaNac.getMonth();
				const edadReal = m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate()) ? edad - 1 : edad;

				if (edadReal < 18) {
					setError('Debes tener al menos 18 años');
					return;
				}
			}

			setGuardando(true);
			setError(null);
			setSuccess(null);

			// Preparar datos para actualizar (según UsuarioUpdateRequestDTO)
			const updateData = {
				nombreCompleto: formData.nombreCompleto.trim(),
				direccion: formData.direccion?.trim() || null,
				telefono: formData.telefono?.trim() || null,
				fechaNacimiento: formData.fechaNacimiento || null,
				avatar: formData.avatar || null,
			};

			await usuariosAPI.update(usuario.id, updateData);

			// Recargar datos del usuario
			await cargarDatosUsuario();

			setModoEdicion(false);
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
		if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
			logout();
			navigate('/login', { replace: true });
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Manejo de avatar
	const handleAvatarClick = () => {
		if (modoEdicion) {
			fileInputRef.current?.click();
		}
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validar tipo de archivo
			if (!file.type.startsWith('image/')) {
				setError('Por favor selecciona una imagen válida');
				return;
			}

			// Validar tamaño (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				setError('La imagen no debe superar los 5MB');
				return;
			}

			// Crear preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarPreview(reader.result);
				setFormData((prev) => ({
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
		setFormData((prev) => ({
			...prev,
			avatar: '',
		}));
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Obtener iniciales del nombre
	const getIniciales = () => {
		const nombre = formData.nombreCompleto || usuario?.nombreCompleto || '';
		const palabras = nombre.trim().split(' ').filter(Boolean);
		if (palabras.length === 0) return '?';
		if (palabras.length === 1) return palabras[0][0].toUpperCase();
		return (palabras[0][0] + palabras[palabras.length - 1][0]).toUpperCase();
	};

	// Manejo de modal de contraseña
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

		// Validaciones
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
						<div className="avatar-iniciales">
							{getIniciales()}
						</div>
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

			{/* Título */}
			<div className="perfil-header">
				<div className="perfil-header-icon"></div>
				<div className="perfil-header-content">
					<div className="perfil-titulo">
						<div className="perfil-titulo-text">
							<span>Datos Personales</span>
						</div>
						<IoInformationCircleOutline className="info-icon-perfil" />
					</div>
				</div>
			</div>

			{/* Formulario */}
			<div className="perfil-form">
				{error && <div className="mensaje-error">{error}</div>}
				{success && <div className="mensaje-exito">{success}</div>}

				{/* Campo: Nombre Completo */}
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
							value={formData.nombreCompleto}
							onChange={handleInputChange}
							placeholder="Ingresa tu nombre completo"
							disabled={guardando}
							required
						/>
					)}
				</div>

				{/* Campo: Email */}
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
						value={formData.email}
						disabled
					/>
				</div>

				{/* Campo: Teléfono */}
				<div className="form-field">
					<label className="form-label">Teléfono</label>
					{!modoEdicion ? (
						<div className="form-value">{usuario?.telefono || 'No especificado'}</div>
					) : (
						<input
							type="tel"
							name="telefono"
							className="form-input"
							value={formData.telefono}
							onChange={handleInputChange}
							placeholder="Ingresa tu número de teléfono"
							disabled={guardando}
						/>
					)}
				</div>

				{/* Campo: Dirección */}
				<div className="form-field">
					<label className="form-label">Dirección</label>
					{!modoEdicion ? (
						<div className="form-value">{usuario?.direccion || 'No especificada'}</div>
					) : (
						<input
							type="text"
							name="direccion"
							className="form-input"
							value={formData.direccion}
							onChange={handleInputChange}
							placeholder="Ingresa tu dirección"
							disabled={guardando}
						/>
					)}
				</div>

				{/* Campo: Fecha de Nacimiento */}
				<div className="form-field">
					<label className="form-label">Fecha de Nacimiento</label>
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
							value={formData.fechaNacimiento}
							onChange={handleInputChange}
							disabled={guardando}
						/>
					)}
				</div>

				{/* Botones de Acción */}
				<div className="perfil-actions">
					{!modoEdicion ? (
						<>
							<button className="btn-perfil btn-editar" onClick={handleEditar}>
								Editar Perfil
							</button>
							<button className="btn-perfil btn-cerrar-sesion" onClick={handleCerrarSesion}>
								Cerrar Sesión
							</button>
						</>
					) : (
						<>
							<button
								className="btn-perfil btn-guardar"
								onClick={handleGuardar}
								disabled={guardando}
							>
								{guardando ? 'Guardando...' : 'Guardar Cambios'}
							</button>
							<button
								className="btn-perfil btn-cancelar"
								onClick={handleCancelar}
								disabled={guardando}
							>
								Cancelar
							</button>
						</>
					)}
				</div>
			</div>

			{/* Sección de Seguridad */}
			<div className="perfil-header" style={{ marginTop: '24px' }}>
				<div className="perfil-header-icon"></div>
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
						<button
							className="btn-perfil btn-cambiar-password"
							onClick={handleOpenModalPassword}
							type="button"
						>
							Cambiar Contraseña
						</button>
					</div>
				</div>
			</div>

			{/* Modal Cambiar Contraseña */}
			{modalPassword && (
				<div className="modal-overlay" onClick={handleCloseModalPassword}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Cambiar Contraseña</h2>
							<button
								className="modal-close-btn"
								onClick={handleCloseModalPassword}
								type="button"
							>
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
								<button
									type="submit"
									className="btn-perfil btn-guardar"
									disabled={guardandoPassword}
								>
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
