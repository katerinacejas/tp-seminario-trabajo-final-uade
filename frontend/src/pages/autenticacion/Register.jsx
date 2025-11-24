// src/pages/autenticacion/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { authAPI } from "../../services/api";
import {
	IoMailOutline,
	IoLockClosedOutline,
	IoPersonOutline,
	IoCallOutline,
	IoCalendarOutline,
	IoEyeOutline,
	IoEyeOffOutline,
} from "react-icons/io5";
import "./Register.css";

export default function Register() {
	const nav = useNavigate();
	const { login } = useAuth();
	const [form, setForm] = useState({
		nombreCompleto: "",
		email: "",
		password: "",
		password2: "",
		rol: "CUIDADOR",
		telefono: "",
		fechaNacimiento: "",
		direccion: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showPassword2, setShowPassword2] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		// Validaciones frontend
		if (form.password !== form.password2) {
			setError("Las contraseñas no coinciden");
			return;
		}

		// Validación de complejidad de contraseña según backend
		if (form.password.length < 8) {
			setError("La contraseña debe tener al menos 8 caracteres");
			return;
		}

		if (!/[a-z]/.test(form.password)) {
			setError("La contraseña debe contener al menos una letra minúscula");
			return;
		}

		if (!/[A-Z]/.test(form.password)) {
			setError("La contraseña debe contener al menos una letra mayúscula");
			return;
		}

		if (!/[0-9]/.test(form.password)) {
			setError("La contraseña debe contener al menos un número");
			return;
		}

		if (!form.nombreCompleto.trim()) {
			setError("El nombre completo es requerido");
			return;
		}

		setLoading(true);

		try {
			// Preparar datos para el backend según RegistroRequestDTO
			const registroData = {
				nombreCompleto: form.nombreCompleto,
				email: form.email,
				password: form.password,
				rol: form.rol,
				direccion: form.direccion || null,
				telefono: form.telefono || null,
				fechaNacimiento: form.fechaNacimiento || null,
				avatar: null,
			};

			// Llamar al backend
			const response = await authAPI.register(registroData);

			// Guardar token
			localStorage.setItem("cuido.token", response.token);

			// Actualizar contexto de auth (esto normaliza y guarda el rol)
			login(response.rol);

			// Redirigir según rol (comparar con mayúsculas como viene del backend)
			if (response.rol === "CUIDADOR") {
				nav("/", { replace: true });
			} else if (response.rol === "PACIENTE") {
				nav("/paciente", { replace: true });
			}
		} catch (err) {
			console.error("Error en registro:", err);
			setError(
				err.response?.data?.message ||
					"Error al crear la cuenta. Verifica que el email no esté registrado."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="register-screen">
			<div className="register-card">
				<header className="register-hero">
					<button
						type="button"
						className="register-back"
						onClick={() => nav(-1)}
					>
						←
					</button>

					<div className="register-avatar">
						<img src="/logo.png" alt="Cuido" />
					</div>

					<h1 className="register-title">Crear cuenta</h1>
					<p className="register-subtitle">
						Cuidadores y pacientes en un mismo lugar
					</p>
				</header>

				<main className="register-body">
					<form className="register-form" onSubmit={submit}>
						{error && <div className="auth-error">{error}</div>}

						{/* Nombre y apellido */}
						<div className="register-field">
							<label className="register-label">
								Nombre y apellido <span style={{ color: "var(--danger)" }}>*</span>
							</label>
							<div style={{ position: "relative" }}>
								<IoPersonOutline
									style={{
										position: "absolute",
										left: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "var(--muted)",
										fontSize: "18px",
									}}
								/>
								<input
									className="register-input"
									name="nombreCompleto"
									value={form.nombreCompleto}
									onChange={onChange}
									placeholder="Ej: Ana Pérez"
									required
									disabled={loading}
									style={{ paddingLeft: "40px" }}
								/>
							</div>
						</div>

						{/* Rol */}
						<div className="register-field">
							<label className="register-label">
								Rol <span style={{ color: "var(--danger)" }}>*</span>
							</label>
							<select
								name="rol"
								value={form.rol}
								onChange={onChange}
								disabled={loading}
								className="register-input"
							>
								<option value="CUIDADOR">Cuidador</option>
								<option value="PACIENTE">Paciente</option>
							</select>
						</div>

						{/* Email */}
						<div className="register-field">
							<label className="register-label">
								Email <span style={{ color: "var(--danger)" }}>*</span>
							</label>
							<div style={{ position: "relative" }}>
								<IoMailOutline
									style={{
										position: "absolute",
										left: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "var(--muted)",
										fontSize: "18px",
									}}
								/>
								<input
									className="register-input"
									name="email"
									type="email"
									value={form.email}
									onChange={onChange}
									placeholder="tu@email.com"
									required
									disabled={loading}
									style={{ paddingLeft: "40px" }}
								/>
							</div>
						</div>

						{/* Teléfono */}
						<div className="register-field">
							<label className="register-label">Teléfono</label>
							<div style={{ position: "relative" }}>
								<IoCallOutline
									style={{
										position: "absolute",
										left: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "var(--muted)",
										fontSize: "18px",
									}}
								/>
								<input
									className="register-input"
									name="telefono"
									type="tel"
									value={form.telefono}
									onChange={onChange}
									placeholder="Ej: +54 11 1234 5678"
									disabled={loading}
									maxLength={20}
									style={{ paddingLeft: "40px" }}
								/>
							</div>
						</div>

						{/* Fecha de nacimiento */}
						<div className="register-field">
							<label className="register-label">Fecha de nacimiento</label>
							<div style={{ position: "relative" }}>
								<IoCalendarOutline
									style={{
										position: "absolute",
										left: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "var(--muted)",
										fontSize: "18px",
										pointerEvents: "none",
									}}
								/>
								<input
									className="register-input"
									name="fechaNacimiento"
									type="date"
									value={form.fechaNacimiento}
									onChange={onChange}
									disabled={loading}
									style={{ paddingLeft: "40px" }}
								/>
							</div>
						</div>

						{/* Dirección */}
						<div className="register-field">
							<label className="register-label">Dirección</label>
							<input
								className="register-input"
								name="direccion"
								value={form.direccion}
								onChange={onChange}
								placeholder="Ej: Av. Corrientes 1234, CABA"
								disabled={loading}
								maxLength={500}
							/>
						</div>

						{/* Contraseña */}
						<div className="register-field">
							<label className="register-label">
								Contraseña <span style={{ color: "var(--danger)" }}>*</span>
							</label>
							<div className="login-pass-wrapper">
								<IoLockClosedOutline
                                    style={{
                                        position: "absolute",
                                        left: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--muted)",
                                        fontSize: "18px",
                                    }}
                                />
								<input
									className="register-input login-input-pass"
									name="password"
									type={showPassword ? "text" : "password"}
									value={form.password}
									onChange={onChange}
									placeholder="Mínimo 8 caracteres"
									required
									disabled={loading}
									minLength={8}
									style={{ paddingLeft: "40px", paddingRight: "44px" }}
								/>
								<button
									type="button"
									className="login-eye-btn"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={
										showPassword
											? "Ocultar contraseña"
											: "Mostrar contraseña"
									}
								>
									{showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
								</button>
							</div>
							<small
								style={{
									color: "var(--muted)",
									fontSize: "12px",
									display: "block",
									marginTop: "4px",
								}}
							>
								Mínimo 8 caracteres (incluir mayúscula, minúscula y número)
							</small>
						</div>

						{/* Repetir contraseña */}
						<div className="register-field">
							<label className="register-label">
								Repetir contraseña{" "}
								<span style={{ color: "var(--danger)" }}>*</span>
							</label>
							<div className="login-pass-wrapper">
								<IoLockClosedOutline
									style={{
										position: "absolute",
										left: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "var(--muted)",
										fontSize: "18px",
									}}
								/>
								<input
									className="register-input login-input-pass"
									name="password2"
									type={showPassword2 ? "text" : "password"}
									value={form.password2}
									onChange={onChange}
									placeholder="Confirma tu contraseña"
									required
									disabled={loading}
									minLength={8}
									style={{ paddingLeft: "40px", paddingRight: "44px" }}
								/>
								<button
									type="button"
									className="login-eye-btn"
									onClick={() => setShowPassword2(!showPassword2)}
									aria-label={
										showPassword2
											? "Ocultar contraseña"
											: "Mostrar contraseña"
									}
								>
									{showPassword2 ? <IoEyeOffOutline /> : <IoEyeOutline />}
								</button>
							</div>
						</div>

						<div className="register-footer">
							<button
								className="register-btn-primary"
								type="submit"
								disabled={loading}
							>
								{loading ? "Creando cuenta..." : "Registrarme"}
							</button>

							<p className="register-text-small">
								¿Ya tenés cuenta?{" "}
								<Link to="/login" className="register-link-strong">
									Iniciar sesión
								</Link>
							</p>
						</div>
					</form>
				</main>
			</div>
		</div>
	);
}
