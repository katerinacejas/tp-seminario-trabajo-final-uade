// src/pages/autenticacion/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth";
import { authAPI } from "../../services/api";
import {
	IoMailOutline,
	IoLockClosedOutline,
	IoEyeOutline,
	IoEyeOffOutline,
} from "react-icons/io5";
import "./Login.css";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
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

			// Guardar token
			localStorage.setItem("cuido.token", response.token);

			// Actualizar contexto de auth (esto normaliza y guarda el rol)
			login(response.rol);

			// Limpiar pacienteId si es cuidador (se recargará desde el backend)
			if (response.rol === "CUIDADOR") {
				localStorage.removeItem("cuido.pacienteId");
			}

			// Redirigir según rol (comparar con mayúsculas como viene del backend)
			if (response.rol === "CUIDADOR") {
				nav("/", { replace: true });
			} else if (response.rol === "PACIENTE") {
				nav("/paciente", { replace: true });
			}
		} catch (err) {
			console.error("Error en login:", err);
			setError(
				err.response?.data?.message ||
					"Credenciales inválidas. Por favor, verifica tu email y contraseña."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-screen">
			<div className="login-card">
				<header className="login-hero">
					<div className="login-hero-top">
						<span className="login-skip"> </span>
					</div>

					<div className="login-avatar">
						<img src="/logo.png" alt="Cuido" />
					</div>

					<h1 className="login-title">¡Bienvenido/a de nuevo!</h1>
					<p className="login-subtitle">
						Cuidadores y pacientes en un mismo lugar
					</p>
				</header>

				<main className="login-body">
					<form className="login-form" onSubmit={submit}>
						{error && <div className="auth-error">{error}</div>}

						{/* Email */}
						<div className="login-field">
							<label className="login-label">Email</label>
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
									className="login-input"
									name="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									type="email"
									required
									placeholder="usuario@correo.com"
									disabled={loading}
									style={{ paddingLeft: "40px" }}
								/>
							</div>
						</div>

						{/* Contraseña con ojito */}
						<div className="login-field">
							<label className="login-label">Contraseña</label>
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
									className="login-input login-input-pass"
									name="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									type={showPassword ? "text" : "password"}
									required
									placeholder="••••••••"
									minLength={6}
									disabled={loading}
									style={{ paddingLeft: "40px", paddingRight: "44px" }}
								/>
								<button
									type="button"
									className="login-eye-btn"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={
										showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
									}
								>
									{showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
								</button>
							</div>

							<div
								style={{
									textAlign: "right",
									marginTop: "4px",
									fontSize: "14px",
								}}
							>
								<Link
									to="/forgot-password"
									style={{
										color: "var(--primary)",
										fontWeight: "600",
										textDecoration: "none",
									}}
								>
									¿Olvidaste tu contraseña?
								</Link>
							</div>
						</div>

						<div className="login-footer">
							<button
								className="login-btn-primary"
								type="submit"
								disabled={loading}
							>
								{loading ? "Ingresando..." : "Iniciar sesión"}
							</button>

							<p className="login-text-small">
								¿No tenés cuenta?{" "}
								<Link to="/register" className="login-link-strong">
									Crear cuenta
								</Link>
							</p>
						</div>
					</form>
				</main>
			</div>
		</div>
	);
}
