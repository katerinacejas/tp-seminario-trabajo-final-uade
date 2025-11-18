import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { IoMailOutline, IoArrowBackOutline } from "react-icons/io5";

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
		<div className="page-center">
			<div className="auth-card">
				<div className="auth-head">
					<img src="/logo.png" alt="Cuido" className="auth-logo" />
					<h1 className="auth-title">Recuperar contraseña</h1>
					<p className="auth-sub">Te enviaremos un código de verificación a tu email</p>
				</div>

				{success ? (
					<div style={{
						background: "var(--ok-100)",
						border: "1px solid var(--ok)",
						color: "#166534",
						padding: "16px 18px",
						borderRadius: "10px",
						textAlign: "center",
						marginBottom: "16px"
					}}>
						<div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
							Código enviado
						</div>
						<div style={{ fontSize: "14px" }}>
							Revisa tu email y serás redirigido...
						</div>
					</div>
				) : (
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
							{loading ? "Enviando..." : "Enviar código"}
						</button>

						<div style={{
							textAlign: "center",
							marginTop: "20px"
						}}>
							<Link
								to="/login"
								style={{
									color: "var(--muted)",
									fontSize: "14px",
									fontWeight: "600",
									textDecoration: "none",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px"
								}}
							>
								<IoArrowBackOutline style={{ fontSize: "16px" }} />
								Volver al login
							</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
