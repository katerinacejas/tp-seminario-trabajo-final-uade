import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import "./Register.css";

export default function Register() {
	const nav = useNavigate();
	const [form, setForm] = useState({
		nombreCompleto: "",
		rol: "CUIDADOR",
		email: "",
		password: "",
		password2: ""
	});
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

		if (form.password.length < 6) {
			setError("La contraseña debe tener al menos 6 caracteres");
			return;
		}

		if (!form.nombreCompleto.trim()) {
			setError("El nombre completo es requerido");
			return;
		}

		setLoading(true);

		try {
			// Preparar datos para el backend
			const registroData = {
				nombreCompleto: form.nombreCompleto,
				email: form.email,
				password: form.password,
				rol: form.rol,
				direccion: null,
				telefono: null,
				fechaNacimiento: null,
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
		<div className="auth auth-center">
			<div className="auth-card">
				<div className="auth-head">
					<img src="/logo.png" alt="Cuido" className="auth-logo" />
					<h1 className="auth-title">Crear cuenta</h1>
					<p className="auth-sub">Es gratis y lleva menos de un minuto</p>
				</div>

				<form className="auth-form" onSubmit={submit}>
					{error && (
						<div className="auth-error">
							{error}
						</div>
					)}

					<div className="auth-row">
						<label>Nombre y apellido</label>
						<input
							name="nombreCompleto"
							value={form.nombreCompleto}
							onChange={onChange}
							placeholder="Ej: Ana Pérez"
							required
							disabled={loading}
						/>
					</div>

					<div className="auth-row">
						<label>Rol</label>
						<select name="rol" value={form.rol} onChange={onChange} disabled={loading}>
							<option value="CUIDADOR">Cuidador</option>
							<option value="PACIENTE">Paciente</option>
						</select>
					</div>

					<div className="auth-row">
						<label>Email</label>
						<input
							name="email"
							type="email"
							value={form.email}
							onChange={onChange}
							placeholder="usuario@correo.com"
							required
							disabled={loading}
						/>
					</div>

					<div className="auth-row">
						<label>Contraseña</label>
						<input
							name="password"
							type="password"
							value={form.password}
							onChange={onChange}
							placeholder="••••••••"
							required
							disabled={loading}
							minLength={6}
						/>
						<small style={{color: '#666', fontSize: '12px'}}>Mínimo 6 caracteres</small>
					</div>

					<div className="auth-row">
						<label>Repetir contraseña</label>
						<input
							name="password2"
							type="password"
							value={form.password2}
							onChange={onChange}
							placeholder="••••••••"
							required
							disabled={loading}
							minLength={6}
						/>
					</div>

					<div className="auth-actions">
						<button
							className="auth-btn auth-btn--primary"
							type="submit"
							disabled={loading}
						>
							{loading ? "Creando cuenta..." : "Registrarme"}
						</button>
						<Link to="/login" className="auth-link">Ya tengo cuenta</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
