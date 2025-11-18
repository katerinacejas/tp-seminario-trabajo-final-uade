import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { IoMailOutline, IoLockClosedOutline, IoPersonOutline, IoCallOutline, IoCalendarOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function Register() {
	const nav = useNavigate();
	const [form, setForm] = useState({
		nombreCompleto: "",
		email: "",
		password: "",
		password2: "",
		rol: "CUIDADOR",
		telefono: "",
		fechaNacimiento: "",
		direccion: ""
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
				avatar: null
			};

			// Llamar al backend
			const response = await authAPI.register(registroData);

			// Guardar token y rol
			localStorage.setItem("cuido.token", response.token);
			localStorage.setItem("cuido.role", response.rol);

			// Redirigir según rol
			if (response.rol === "CUIDADOR") {
				nav("/", { replace: true });
			} else if (response.rol === "PACIENTE") {
				nav("/paciente", { replace: true });
			}
		} catch (err) {
			console.error("Error en registro:", err);
			setError(err.response?.data?.message || "Error al crear la cuenta. Verifica que el email no esté registrado.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="page-center">
			<div className="auth-card">
				<div className="auth-head">
					<img src="/logo.png" alt="Cuido" className="auth-logo" />
					<h1 className="auth-title">Crear cuenta</h1>
					<p className="auth-sub">Es gratis y lleva menos de un minuto</p>
				</div>

				<form className="auth-form" onSubmit={submit}>
					{error && (
						<div style={{
							background: "var(--danger-100)",
							border: "1px solid var(--danger)",
							color: "var(--danger)",
							padding: "12px 14px",
							borderRadius: "10px",
							fontSize: "14px",
							marginBottom: "16px"
						}}>
							{error}
						</div>
					)}

					<div className="form-row">
						<label>
							Nombre y apellido <span style={{ color: "var(--danger)" }}>*</span>
						</label>
						<div style={{ position: "relative" }}>
							<IoPersonOutline style={{
								position: "absolute",
								left: "14px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "var(--muted)",
								fontSize: "18px"
							}} />
							<input
								className="input"
								name="nombreCompleto"
								value={form.nombreCompleto}
								onChange={onChange}
								placeholder="Ej: Ana Pérez"
								required
								disabled={loading}
								style={{
									paddingLeft: "44px",
									fontSize: "15px",
									borderRadius: "10px"
								}}
							/>
						</div>
					</div>

					<div className="form-row">
						<label>
							Rol <span style={{ color: "var(--danger)" }}>*</span>
						</label>
						<select
							name="rol"
							value={form.rol}
							onChange={onChange}
							disabled={loading}
							style={{
								fontSize: "15px",
								borderRadius: "10px",
								padding: "12px 16px"
							}}
						>
							<option value="CUIDADOR">Cuidador</option>
							<option value="PACIENTE">Paciente</option>
						</select>
					</div>

					<div className="form-row">
						<label>
							Email <span style={{ color: "var(--danger)" }}>*</span>
						</label>
						<div style={{ position: "relative" }}>
							<IoMailOutline style={{
								position: "absolute",
								left: "14px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "var(--muted)",
								fontSize: "18px"
							}} />
							<input
								className="input"
								name="email"
								type="email"
								value={form.email}
								onChange={onChange}
								placeholder="tu@email.com"
								required
								disabled={loading}
								style={{
									paddingLeft: "44px",
									fontSize: "15px",
									borderRadius: "10px"
								}}
							/>
						</div>
					</div>

					<div className="form-row">
						<label>Teléfono</label>
						<div style={{ position: "relative" }}>
							<IoCallOutline style={{
								position: "absolute",
								left: "14px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "var(--muted)",
								fontSize: "18px"
							}} />
							<input
								className="input"
								name="telefono"
								type="tel"
								value={form.telefono}
								onChange={onChange}
								placeholder="Ej: +54 11 1234 5678"
								disabled={loading}
								maxLength={20}
								style={{
									paddingLeft: "44px",
									fontSize: "15px",
									borderRadius: "10px"
								}}
							/>
						</div>
					</div>

					<div className="form-row">
						<label>Fecha de nacimiento</label>
						<div style={{ position: "relative" }}>
							<IoCalendarOutline style={{
								position: "absolute",
								left: "14px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "var(--muted)",
								fontSize: "18px",
								pointerEvents: "none"
							}} />
							<input
								className="input"
								name="fechaNacimiento"
								type="date"
								value={form.fechaNacimiento}
								onChange={onChange}
								disabled={loading}
								style={{
									paddingLeft: "44px",
									fontSize: "15px",
									borderRadius: "10px"
								}}
							/>
						</div>
					</div>

					<div className="form-row">
						<label>Dirección</label>
						<input
							className="input"
							name="direccion"
							value={form.direccion}
							onChange={onChange}
							placeholder="Ej: Av. Corrientes 1234, CABA"
							disabled={loading}
							maxLength={500}
							style={{
								fontSize: "15px",
								borderRadius: "10px"
							}}
						/>
					</div>

					<div className="form-row">
						<label>
							Contraseña <span style={{ color: "var(--danger)" }}>*</span>
						</label>
						<div style={{ position: "relative" }}>
							<IoLockClosedOutline style={{
								position: "absolute",
								left: "14px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "var(--muted)",
								fontSize: "18px"
							}} />
							<input
								className="input"
								name="password"
								type={showPassword ? "text" : "password"}
								value={form.password}
								onChange={onChange}
								placeholder="Mínimo 8 caracteres"
								required
								disabled={loading}
								minLength={8}
								style={{
									paddingLeft: "44px",
									paddingRight: "44px",
									fontSize: "15px",
									borderRadius: "10px"
								}}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								style={{
									position: "absolute",
									right: "14px",
									top: "50%",
									transform: "translateY(-50%)",
									background: "transparent",
									border: "none",
									cursor: "pointer",
									padding: "4px",
									color: "var(--muted)",
									fontSize: "18px",
									display: "flex",
									alignItems: "center"
								}}
							>
								{showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
							</button>
						</div>
						<small style={{ color: "var(--muted)", fontSize: "12px", display: "block", marginTop: "4px" }}>
							Mínimo 8 caracteres (incluir mayúscula, minúscula y número)
						</small>
					</div>

					<div className="form-row">
						<label>
							Repetir contraseña <span style={{ color: "var(--danger)" }}>*</span>
						</label>
						<div style={{ position: "relative" }}>
							<IoLockClosedOutline style={{
								position: "absolute",
								left: "14px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "var(--muted)",
								fontSize: "18px"
							}} />
							<input
								className="input"
								name="password2"
								type={showPassword2 ? "text" : "password"}
								value={form.password2}
								onChange={onChange}
								placeholder="Confirma tu contraseña"
								required
								disabled={loading}
								minLength={8}
								style={{
									paddingLeft: "44px",
									paddingRight: "44px",
									fontSize: "15px",
									borderRadius: "10px"
								}}
							/>
							<button
								type="button"
								onClick={() => setShowPassword2(!showPassword2)}
								style={{
									position: "absolute",
									right: "14px",
									top: "50%",
									transform: "translateY(-50%)",
									background: "transparent",
									border: "none",
									cursor: "pointer",
									padding: "4px",
									color: "var(--muted)",
									fontSize: "18px",
									display: "flex",
									alignItems: "center"
								}}
							>
								{showPassword2 ? <IoEyeOffOutline /> : <IoEyeOutline />}
							</button>
						</div>
					</div>

					<button
						className="btn auth-primary"
						type="submit"
						disabled={loading}
						style={{
							width: "100%",
							marginTop: "12px",
							padding: "12px 18px",
							fontSize: "16px",
							fontWeight: "700"
						}}
					>
						{loading ? "Creando cuenta..." : "Registrarme"}
					</button>

					<div style={{
						textAlign: "center",
						marginTop: "20px",
						color: "var(--muted)",
						fontSize: "14px"
					}}>
						¿Ya tienes cuenta?{" "}
						<Link
							to="/login"
							style={{
								color: "var(--primary)",
								fontWeight: "700",
								textDecoration: "none"
							}}
						>
							Iniciar sesión
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
