import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css"; // ← estilos locales

export default function Register() {
	const nav = useNavigate();
	const [form, setForm] = useState({
		nombre: "",
		rol: "cuidador",
		email: "",
		pass: "",
		pass2: ""
	});

	const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const submit = (e) => {
		e.preventDefault();
		// Validación mínima de ejemplo
		if (form.pass !== form.pass2) {
			alert("Las contraseñas no coinciden");
			return;
		}
		// acá iría el POST a tu API
		nav("/login", { replace: true });
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
					<div className="auth-row">
						<label>Nombre y apellido</label>
						<input
							name="nombre"
							value={form.nombre}
							onChange={onChange}
							placeholder="Ej: Ana Pérez"
							required
						/>
					</div>

					<div className="auth-row">
						<label>Rol</label>
						<select name="rol" value={form.rol} onChange={onChange}>
							<option value="cuidador">Cuidador</option>
							<option value="paciente">Paciente</option>
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
						/>
					</div>

					<div className="auth-row">
						<label>Contraseña</label>
						<input
							name="pass"
							type="password"
							value={form.pass}
							onChange={onChange}
							placeholder="••••••••"
							required
						/>
					</div>

					<div className="auth-row">
						<label>Repetir contraseña</label>
						<input
							name="pass2"
							type="password"
							value={form.pass2}
							onChange={onChange}
							placeholder="••••••••"
							required
						/>
					</div>

					<div className="auth-actions">
						<button className="auth-btn auth-btn--primary" type="submit">Registrarme</button>
						<Link to="/login" className="auth-link">Ya tengo cuenta</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
