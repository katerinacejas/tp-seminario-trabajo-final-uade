import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import "./Login.css";

export default function ForgotPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const nav = useNavigate();

	const submit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await authAPI.forgotPassword(email);
			setSuccess(true);
			// Redirigir a la pantalla de reset password después de 2 segundos
			setTimeout(() => {
				nav("/reset-password", { state: { email } });
			}, 2000);
		} catch (err) {
			console.error("Error en forgot password:", err);
			setError(err.response?.data?.message || "Error al enviar el código. Intenta nuevamente.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth auth-center">
			<div className="auth-card">
				<div className="auth-head">
					<img src="/logo.png" alt="Cuido" className="auth-logo" />
					<h1 className="auth-title">Recuperar Contraseña</h1>
					<p className="auth-sub">Te enviaremos un código de 6 dígitos</p>
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
						Código enviado. Revisa tu email y serás redirigido...
					</div>
				) : (
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

						<div className="auth-actions">
							<button
								className="auth-btn auth-btn--primary"
								type="submit"
								disabled={loading}
							>
								{loading ? "Enviando..." : "Enviar Código"}
							</button>
							<Link to="/login" className="auth-link">Volver al login</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
