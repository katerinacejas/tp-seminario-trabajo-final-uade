import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

const Icon = ({ name }) => (
	<svg viewBox="0 0 24 24" aria-hidden="true">
		{name === "home" && <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />}
		{name === "book" && <path d="M5 3h11a3 3 0 0 1 3 3v14H7a2 2 0 0 1-2-2z M5 17h14" />}
		{name === "calendar" && <path d="M7 3v2M17 3v2M3 8h18M4 8v12h16V8z" />}
		{name === "chat" && <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />}
		{name === "more" && <path d="M6 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />}
	</svg>
);

export default function FooterNav() {
	const [open, setOpen] = useState(false);
	const { role, isCaregiver, isPatient, logout } = useAuth();
	const nav = useNavigate();

	const handleLogout = () => {
		logout();
		setOpen(false);
		nav("/login", { replace: true });
	};

	// Items base según rol
	const caregiverMore = [
		["/resumen", "Resumen"],
		["/alertas", "Alertas"],
		["/tareas", "Tareas"],
		["/ficha", "Ficha médica"],
		["/docs", "Documentos"],
		["/tutoriales", "Tutoriales"],
		["/perfil", "Perfil cuidador"],
	];

	const patientMore = [
		["/invitar-cuidador", "Invitar cuidador"],
		["/mis-cuidadores", "Mis cuidadores"],
		["/paciente", "Home paciente"],
	];

	return (
		<footer className="footer">
			<nav className="footer-nav container">
				{/* Home cambia por rol */}
				{isCaregiver && (
					<>
						<NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/">
							<Icon name="home" /><span>Home</span>
						</NavLink>
						<NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/bitacora">
							<Icon name="book" /><span>Bitácora</span>
						</NavLink>
						<NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/calendario">
							<Icon name="calendar" /><span>Calendario</span>
						</NavLink>
						<NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/chatbot">
							<Icon name="chat" /><span>Chatbot</span>
						</NavLink>
					</>
				)}

				{isPatient && (
					<>
						<NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/paciente">
							<Icon name="home" /><span>Home</span>
						</NavLink>
						{/* en paciente podemos reutilizar calendario sólo si querés; si no, ocultalo */}
						<NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/mis-cuidadores">
							<Icon name="book" /><span>Cuidadores</span>
						</NavLink>
						<NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/invitar-cuidador">
							<Icon name="calendar" /><span>Invitar</span>
						</NavLink>
						<NavLink className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`} to="/chatbot">
							<Icon name="chat" /><span>Chatbot</span>
						</NavLink>
					</>
				)}

				<button className="nav-btn" onClick={() => setOpen(v => !v)}>
					<Icon name="more" /><span>Más</span>
				</button>
			</nav>

			{open && (
				<div className="more-menu" onMouseLeave={() => setOpen(false)}>
					{isCaregiver && caregiverMore.map(([href, label]) => (
						<NavLink key={href} to={href} onClick={() => setOpen(false)}>{label}</NavLink>
					))}
					{isPatient && patientMore.map(([href, label]) => (
						<NavLink key={href} to={href} onClick={() => setOpen(false)}>{label}</NavLink>
					))}
					{role && <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Cerrar sesión</a>}
				</div>
			)}
		</footer>
	);
}
