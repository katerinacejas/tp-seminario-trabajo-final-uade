import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth";
import { authAPI } from "../../services/api";
import "./Login.css";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const nav = useNavigate();
	const { login } = useAuth();

	const submit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// Llamar al backend
			const response = await authAPI.login(email, password);

			// Guardar token y rol
			localStorage.setItem("cuido.token", response.token);
			localStorage.setItem("cuido.role", response.rol);

			// Actualizar contexto de auth
			login(response.rol);

			// Redirigir según rol
			if (response.rol === "CUIDADOR") {
				nav("/", { replace: true });
			} else if (response.rol === "PACIENTE") {
				nav("/paciente", { replace: true });
			}
		} catch (err) {
			console.error("Error en login:", err);
			setError(err.response?.data?.message || "Credenciales inválidas. Por favor, verifica tu email y contraseña.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth auth-center">
			<div className="auth-card">
				<div className="auth-head">
					<img src="/logo.png" alt="Cuido" className="auth-logo" />
					<h1 className="auth-title">Ingresá a Cuido</h1>
					<p className="auth-sub">Cuidadores y pacientes en un mismo lugar</p>
				</div>

				<form className="auth-form" onSubmit={submit}>
					{error && (
						<div className="auth-error">
							{error}
						</div>
					)}

					<div className="auth-row">
						<label>Email</label>
						<input
							value={email}
							onChange={e => setEmail(e.target.value)}
							type="email"
							required
							placeholder="usuario@correo.com"
							disabled={loading}
						/>
					</div>

					<div className="auth-row">
						<label>Contraseña</label>
						<input
							value={password}
							onChange={e => setPassword(e.target.value)}
							type="password"
							required
							placeholder="••••••••"
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
							{loading ? "Ingresando..." : "Ingresar"}
						</button>
						<Link to="/forgot-password" className="auth-link">¿Olvidaste tu contraseña?</Link>
						<Link to="/register" className="auth-link">Crear cuenta</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
