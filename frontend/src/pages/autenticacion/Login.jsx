import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth";
import "./Login.css"; // ← estilos locales

export default function Login() {
	const [email, setEmail] = useState("");
	const [pass, setPass] = useState("");
	const [rol, setRol] = useState("cuidador");
	const nav = useNavigate();
	const { login } = useAuth();

	const submit = (e) => {
		e.preventDefault();
		login(rol);
		nav(rol === "cuidador" ? "/" : "/paciente", { replace: true });
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
					<div className="auth-row">
						<label>Rol</label>
						<select value={rol} onChange={e => setRol(e.target.value)}>
							<option value="cuidador">Cuidador</option>
							<option value="paciente">Paciente</option>
						</select>
					</div>

					<div className="auth-row">
						<label>Email</label>
						<input
							value={email}
							onChange={e => setEmail(e.target.value)}
							type="email"
							required
							placeholder="usuario@correo.com"
						/>
					</div>

					<div className="auth-row">
						<label>Contraseña</label>
						<input
							value={pass}
							onChange={e => setPass(e.target.value)}
							type="password"
							required
							placeholder="••••••••"
						/>
					</div>

					<div className="auth-actions">
						<button className="auth-btn auth-btn--primary" type="submit">Ingresar</button>
						<Link to="/register" className="auth-link">Crear cuenta</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
