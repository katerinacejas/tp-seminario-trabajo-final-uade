import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import "./Login.css";

export default function ResetPassword() {
	const [codigoOtp, setCodigoOtp] = useState("");
	const [nuevaPassword, setNuevaPassword] = useState("");
	const [confirmarPassword, setConfirmarPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const nav = useNavigate();
	const location = useLocation();
	const emailFromState = location.state?.email || "";

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		// Validaciones frontend
		if (nuevaPassword !== confirmarPassword) {
			setError("Las contraseñas no coinciden");
			return;
		}

		if (nuevaPassword.length < 6) {
			setError("La contraseña debe tener al menos 6 caracteres");
			return;
		}

		if (codigoOtp.length !== 6) {
			setError("El código OTP debe tener 6 dígitos");
			return;
		}

		setLoading(true);

		try {
			await authAPI.resetPassword(codigoOtp, nuevaPassword);
			setSuccess(true);
			// Redirigir al login después de 2 segundos
			setTimeout(() => {
				nav("/login", { replace: true });
			}, 2000);
		} catch (err) {
			console.error("Error en reset password:", err);
			setError(err.response?.data?.message || "Error al cambiar la contraseña. Verifica el código.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth auth-center">
			<div className="auth-card">
				<div className="auth-head">
					<img src="/logo.png" alt="Cuido" className="auth-logo" />
					<h1 className="auth-title">Cambiar Contraseña</h1>
					<p className="auth-sub">
						{emailFromState
							? `Código enviado a ${emailFromState}`
							: "Ingresa el código recibido por email"}
					</p>
				</div>

				{success ? (
					<div style={{
						background: "#efe",
						border: "1px solid #cfc",
						color: "#363",
						padding: "12px 14px",
						borderRadius: "12px",
						textAlign: "center",
						marginBottom: "12px"
					}}>
						Contraseña actualizada. Redirigiendo al login...
					</div>
				) : (
					<form className="auth-form" onSubmit={submit}>
						{error && (
							<div className="auth-error">
								{error}
							</div>
						)}

						<div className="auth-row">
							<label>Código de Verificación</label>
							<input
								value={codigoOtp}
								onChange={e => setCodigoOtp(e.target.value)}
								type="text"
								required
								placeholder="123456"
								disabled={loading}
								maxLength={6}
								pattern="[0-9]{6}"
								title="Ingresa el código de 6 dígitos"
							/>
						</div>

						<div className="auth-row">
							<label>Nueva Contraseña</label>
							<input
								value={nuevaPassword}
								onChange={e => setNuevaPassword(e.target.value)}
								type="password"
								required
								placeholder="••••••••"
								disabled={loading}
								minLength={6}
							/>
						</div>

						<div className="auth-row">
							<label>Confirmar Contraseña</label>
							<input
								value={confirmarPassword}
								onChange={e => setConfirmarPassword(e.target.value)}
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
								{loading ? "Cambiando..." : "Cambiar Contraseña"}
							</button>
							<Link to="/forgot-password" className="auth-link">Reenviar código</Link>
							<Link to="/login" className="auth-link">Volver al login</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
