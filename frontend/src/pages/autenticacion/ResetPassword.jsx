import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../../services/api";
import { IoLockClosedOutline, IoKeyOutline, IoEyeOutline, IoEyeOffOutline, IoArrowBackOutline } from "react-icons/io5";

export default function ResetPassword() {
	const [codigoOtp, setCodigoOtp] = useState("");
	const [nuevaPassword, setNuevaPassword] = useState("");
	const [confirmarPassword, setConfirmarPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showPassword2, setShowPassword2] = useState(false);
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
		<div className="page-center">
			<div className="auth-card">
				<div className="auth-head">
					<img src="/logo.png" alt="Cuido" className="auth-logo" />
					<h1 className="auth-title">Nueva contraseña</h1>
					<p className="auth-sub">
						{emailFromState
							? `Código enviado a ${emailFromState}`
							: "Ingresa el código recibido por email"}
					</p>
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
							Contraseña actualizada
						</div>
						<div style={{ fontSize: "14px" }}>
							Redirigiendo al login...
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
								Código de verificación <span style={{ color: "var(--danger)" }}>*</span>
							</label>
							<div style={{ position: "relative" }}>
								<IoKeyOutline style={{
									position: "absolute",
									left: "14px",
									top: "50%",
									transform: "translateY(-50%)",
									color: "var(--muted)",
									fontSize: "18px"
								}} />
								<input
									className="input"
									value={codigoOtp}
									onChange={e => setCodigoOtp(e.target.value)}
									type="text"
									required
									placeholder="123456"
									disabled={loading}
									maxLength={6}
									pattern="[0-9]{6}"
									title="Ingresa el código de 6 dígitos"
									style={{
										paddingLeft: "44px",
										fontSize: "15px",
										borderRadius: "10px",
										letterSpacing: "4px",
										fontWeight: "600"
									}}
								/>
							</div>
							<small style={{ color: "var(--muted)", fontSize: "12px", display: "block", marginTop: "4px" }}>
								Código de 6 dígitos enviado a tu email
							</small>
						</div>

						<div className="form-row">
							<label>
								Nueva contraseña <span style={{ color: "var(--danger)" }}>*</span>
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
									value={nuevaPassword}
									onChange={e => setNuevaPassword(e.target.value)}
									type={showPassword ? "text" : "password"}
									required
									placeholder="Mínimo 6 caracteres"
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

						<div className="form-row">
							<label>
								Confirmar contraseña <span style={{ color: "var(--danger)" }}>*</span>
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
									value={confirmarPassword}
									onChange={e => setConfirmarPassword(e.target.value)}
									type={showPassword2 ? "text" : "password"}
									required
									placeholder="Repite tu contraseña"
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
							{loading ? "Cambiando..." : "Cambiar contraseña"}
						</button>

						<div style={{
							textAlign: "center",
							marginTop: "20px",
							display: "flex",
							flexDirection: "column",
							gap: "10px"
						}}>
							<Link
								to="/forgot-password"
								style={{
									color: "var(--primary)",
									fontSize: "14px",
									fontWeight: "600",
									textDecoration: "none"
								}}
							>
								¿No recibiste el código? Reenviar
							</Link>
							<Link
								to="/login"
								style={{
									color: "var(--muted)",
									fontSize: "14px",
									fontWeight: "600",
									textDecoration: "none",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
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
