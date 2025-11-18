import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth";
import { authAPI } from "../../services/api";
import { IoMailOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

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
		<div className="page-center">
			<div className="auth-card">
				<div className="auth-head">
					<img src="/logo.png" alt="Cuido" className="auth-logo" />
					<h1 className="auth-title">Iniciar sesión</h1>
					<p className="auth-sub">Cuidadores y pacientes en un mismo lugar</p>
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
								value={email}
								onChange={e => setEmail(e.target.value)}
								type="email"
								required
								placeholder="tu@email.com"
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
								value={password}
								onChange={e => setPassword(e.target.value)}
								type={showPassword ? "text" : "password"}
								required
								placeholder="Ingresa tu contraseña"
								disabled={loading}
								minLength={6}
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
					</div>

					<div style={{ textAlign: "right", marginBottom: "8px" }}>
						<Link
							to="/forgot-password"
							style={{
								color: "var(--primary)",
								fontSize: "14px",
								fontWeight: "600",
								textDecoration: "none"
							}}
						>
							¿Olvidaste tu contraseña?
						</Link>
					</div>

					<button
						className="btn auth-primary"
						type="submit"
						disabled={loading}
						style={{
							width: "100%",
							marginTop: "8px",
							padding: "12px 18px",
							fontSize: "16px",
							fontWeight: "700"
						}}
					>
						{loading ? "Ingresando..." : "Ingresar"}
					</button>

					<div style={{
						textAlign: "center",
						marginTop: "20px",
						color: "var(--muted)",
						fontSize: "14px"
					}}>
						¿No tienes cuenta?{" "}
						<Link
							to="/register"
							style={{
								color: "var(--primary)",
								fontWeight: "700",
								textDecoration: "none"
							}}
						>
							Crear cuenta
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
