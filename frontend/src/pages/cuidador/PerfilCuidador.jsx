import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoInformationCircleOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { useAuth } from '../../auth';
import { usuariosAPI } from '../../services/api';
import './PerfilCuidador.css';

export default function PerfilCuidador() {
	const navigate = useNavigate();
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

	if (loading) {
		return (
			<div className="perfil-container">
				<p className="mensaje-loading">Cargando datos del perfil...</p>
			</div>
		);
	}

	return (
		<div className="perfil-container">
			{/* Header */}
			<div className="perfil-header">
				<div className="perfil-header-icon"></div>
				<div className="perfil-header-content">
					<div className="perfil-titulo">
						<div className="perfil-titulo-text">
							<span>Perfil</span>
						</div>
						<IoInformationCircleOutline className="info-icon-perfil" />
					</div>
				</div>
			</div>

			{/* Formulario */}
			<div className="perfil-form">
				{error && <div className="mensaje-error">{error}</div>}
				{success && <div className="mensaje-exito">{success}</div>}

				{/* Campo: Nombre */}
				<div className="form-field">
					<label className="form-label">Tu Nombre</label>
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
						/>
					)}
				</div>

				{/* Campo: Email */}
				<div className="form-field">
					<label className="form-label">Tu Email</label>
					{!modoEdicion ? (
						<div className="form-value">{usuario?.email || 'Sin email'}</div>
					) : (
						<input
							type="email"
							name="email"
							className="form-input"
							value={formData.email}
							onChange={handleInputChange}
							placeholder="tu@email.com"
							disabled={guardando}
						/>
					)}
				</div>

				{/* Campo: Contraseña */}
				<div className="form-field">
					<label className="form-label">Tu Contraseña</label>
					{!modoEdicion ? (
						<div className="password-field">
							<div className="password-dots">••••••••</div>
							<button
								className="toggle-password-btn"
								onClick={() => setMostrarPassword(!mostrarPassword)}
								type="button"
							>
								{mostrarPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
							</button>
						</div>
					) : (
						<div className="password-input-wrapper">
							<input
								type={mostrarPassword ? 'text' : 'password'}
								name="password"
								className="form-input"
								value={formData.password}
								onChange={handleInputChange}
								placeholder="Dejar en blanco para no cambiar"
								disabled={guardando}
							/>
							<button
								className="toggle-password-btn"
								onClick={() => setMostrarPassword(!mostrarPassword)}
								type="button"
							>
								{mostrarPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
							</button>
						</div>
					)}
				</div>

				{/* Botones de Acción */}
				<div className="perfil-actions">
					{!modoEdicion ? (
						<>
							<button className="btn-perfil btn-editar" onClick={handleEditar}>
								Editar
							</button>
							<button className="btn-perfil btn-cerrar-sesion" onClick={handleCerrarSesion}>
								Cerrar sesión
							</button>
						</>
					) : (
						<>
							<button
								className="btn-perfil btn-guardar"
								onClick={handleGuardar}
								disabled={guardando}
							>
								{guardando ? 'Guardando...' : 'Guardar cambios'}
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
		</div>
	);
}
