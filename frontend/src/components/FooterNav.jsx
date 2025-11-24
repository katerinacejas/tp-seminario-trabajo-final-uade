import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import {
	IoHomeOutline,
	IoChatbubbleEllipsesOutline,
	IoHandRightOutline,
	IoBookOutline,
	IoClipboardOutline,
	IoCheckboxOutline,
	IoFolderOutline,
	IoHelpCircleOutline,
	IoPersonOutline,
	IoLogOutOutline,
	IoMenuOutline,
	IoPeopleOutline
} from "react-icons/io5";

export default function FooterNav() {
	const [open, setOpen] = useState(false);
	const { role, isCaregiver, isPatient, logout } = useAuth();
	const nav = useNavigate();
	const menuRef = useRef(null);
	const buttonRef = useRef(null);

	const handleLogout = () => {
		logout();
		setOpen(false);
		nav("/welcome", { replace: true });
	};

	// Cerrar menú al hacer click fuera
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				open &&
				menuRef.current &&
				buttonRef.current &&
				!menuRef.current.contains(event.target) &&
				!buttonRef.current.contains(event.target)
			) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);

	// Items del menú "Más" para CUIDADOR
	const caregiverMore = [
		{ path: "/pacientes", label: "Pacientes", icon: <IoPeopleOutline /> },
		{ path: "/docs", label: "Documentos", icon: <IoFolderOutline /> },
		{ path: "/preguntas-frecuentes", label: "Preguntas Frecuentes", icon: <IoHelpCircleOutline /> },
		{ path: "/perfil", label: "Perfil", icon: <IoPersonOutline /> },
	];

	// estilos base de los botones del footer
	const baseNavBtnStyle = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		padding: "8px 10px",
		borderRadius: 999,
		textDecoration: "none",
		fontSize: 11,
		fontWeight: 600,
		color: "#e5e7eb",
		flex: 1,
		minWidth: 0,
	};

	// estilos base para los ítems del menú Más
	const moreItemBaseStyle = {
		display: "flex",
		alignItems: "center",
		gap: 10,
		padding: "10px 14px",
		textDecoration: "none",
		color: "#0f172a",
		fontSize: 14,
		fontWeight: 500,
	};

	const iconPillStyle = {
		width: 28,
		height: 28,
		borderRadius: 999,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		background: "#e0f2fe",
		boxShadow: "0 2px 6px rgba(148, 163, 184, 0.6)",
	};

	return (
		<footer
			className="footer"
			style={{
				position: "fixed",
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 30,
				background:
					"linear-gradient(180deg, rgba(2, 6, 23, 0.96), rgba(15, 23, 42, 0.98))",
				backdropFilter: "blur(18px)",
				borderTop: "1px solid rgba(148, 163, 184, 0.35)",
				padding: "6px 10px 12px",
			}}
		>
			<nav
				className="footer-nav container"
				style={{
					maxWidth: 520,
					margin: "0 auto",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 6,
					fontFamily:
						'"Outfit", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
				}}
			>
				{/* CUIDADOR - 5 opciones principales en bottom nav */}
				{isCaregiver && (
					<>
						<NavLink
							className={({ isActive }) =>
								`nav-btn ${isActive ? "active" : ""}`
							}
							to="/"
							style={({ isActive }) => ({
								...baseNavBtnStyle,
								background: isActive
									? "linear-gradient(135deg, #14c4f5, #0f9bd0)"
									: "transparent"
							})}
						>
							<IoHomeOutline size={22} />
							<span>Home</span>
						</NavLink>
						<NavLink
							className={({ isActive }) =>
								`nav-btn ${isActive ? "active" : ""}`
							}
							to="/chatbot"
							style={({ isActive }) => ({
								...baseNavBtnStyle,
								background: isActive
									? "linear-gradient(135deg, #14c4f5, #0f9bd0)"
									: "transparent"
							})}
						>
							<IoChatbubbleEllipsesOutline size={22} />
							<span>Chatbot</span>
						</NavLink>
						<NavLink
							className={({ isActive }) =>
								`nav-btn ${isActive ? "active" : ""}`
							}
							to="/recordatorios"
							style={({ isActive }) => ({
								...baseNavBtnStyle,
								background: isActive
									? "linear-gradient(135deg, #14c4f5, #0f9bd0)"
									: "transparent"
							})}
						>
							<IoBookOutline size={22} />
							<span>Recordatorios</span>
						</NavLink>
						<NavLink
							className={({ isActive }) =>
								`nav-btn ${isActive ? "active" : ""}`
							}
							to="/bitacora"
							style={({ isActive }) => ({
								...baseNavBtnStyle,
								background: isActive
									? "linear-gradient(135deg, #14c4f5, #0f9bd0)"
									: "transparent"
							})}
						>
							<IoClipboardOutline size={22} />
							<span>Bitácoras</span>
						</NavLink>
						<button
							ref={buttonRef}
							className="nav-btn"
							onClick={() => setOpen((v) => !v)}
							style={{
								...baseNavBtnStyle,
								border: "none",
								outline: "none",
								background: open
									? "linear-gradient(135deg, #14c4f5, #0f9bd0)"
									: "transparent",
								cursor: "pointer",
							}}
						>
							<IoMenuOutline size={22} />
							<span>Más</span>
						</button>
					</>
				)}

				{/* PACIENTE - 3 opciones: Home, Mis Cuidadores, Perfil */}
				{isPatient && (
					<>
						<NavLink
							className={({ isActive }) =>
								`nav-btn ${isActive ? "active" : ""}`
							}
							to="/paciente"
							style={({ isActive }) => ({
								...baseNavBtnStyle,
								background: isActive
									? "linear-gradient(135deg, #14c4f5, #0f9bd0)"
									: "transparent"
							})}
						>
							<IoHomeOutline size={22} />
							<span>Home</span>
						</NavLink>
						<NavLink
							className={({ isActive }) =>
								`nav-btn ${isActive ? "active" : ""}`
							}
							to="/mis-cuidadores"
							style={({ isActive }) => ({
								...baseNavBtnStyle,
								background: isActive
									? "linear-gradient(135deg, #14c4f5, #0f9bd0)"
									: "transparent"
							})}
						>
							<IoHandRightOutline size={22} />
							<span>Cuidadores</span>
						</NavLink>
						<NavLink
							className={({ isActive }) =>
								`nav-btn ${isActive ? "active" : ""}`
							}
							to="/perfil"
							style={({ isActive }) => ({
								...baseNavBtnStyle,
								background: isActive
									? "linear-gradient(135deg, #14c4f5, #0f9bd0)"
									: "transparent"
							})}
						>
							<IoPersonOutline size={22} />
							<span>Perfil</span>
						</NavLink>
					</>
				)}
			</nav>

			{/* Menú hamburguesa desplegable (solo CUIDADOR) */}
			{open && isCaregiver && (
				<div
					ref={menuRef}
					className="more-menu"
					style={{
						position: "fixed",
						bottom: 76,
						right: 12,
						left: 12,
						maxWidth: 420,
						margin: "0 auto",
						borderRadius: 24,
						padding: "12px 12px 8px",
						background: "#ffffff",              // << sin degradado, claro
						boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
						border: "1px solid rgba(148, 163, 184, 0.45)",
						color: "#0f172a",
						fontFamily:
							'"Outfit", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
					}}
				>
					{/* barrita superior tipo “sheet” */}
					<div
						style={{
							width: 40,
							height: 4,
							borderRadius: 999,
							background: "rgba(148, 163, 184, 0.7)",
							margin: "0 auto 8px",
						}}
					/>

					{caregiverMore.map(({ path, label, icon }) => (
						<NavLink
							key={path}
							to={path}
							onClick={() => setOpen(false)}
							className="more-menu-item"
							style={{
								...moreItemBaseStyle,
								borderRadius: 14,
								background: "#f9fafb",
								marginBottom: 6,
								boxShadow: "0 4px 10px rgba(148, 163, 184, 0.35)",
								border: "1px solid rgba(226, 232, 240, 0.9)",
							}}
						>
							<div style={iconPillStyle}>{icon}</div>
							<span>{label}</span>
						</NavLink>
					))}

					<NavLink
						to="/tareas"
						onClick={() => setOpen(false)}
						className="more-menu-item"
						style={{
							...moreItemBaseStyle,
							borderRadius: 14,
							background: "#f9fafb",
							marginBottom: 6,
							boxShadow: "0 4px 10px rgba(148, 163, 184, 0.35)",
							border: "1px solid rgba(226, 232, 240, 0.9)",
						}}
					>
						<div style={iconPillStyle}>
							<IoCheckboxOutline />
						</div>
						<span>Lista de Tareas</span>
					</NavLink>

					{role && (
						<a
							href="#logout"
							onClick={(e) => {
								e.preventDefault();
								handleLogout();
							}}
							className="more-menu-item logout"
							style={{
								...moreItemBaseStyle,
								borderRadius: 14,
								marginTop: 4,
								color: "#b91c1c",
							}}
						>
							<div
								style={{
									...iconPillStyle,
									background: "#fee2e2",
								}}
							>
								<IoLogOutOutline />
							</div>
							<span>Cerrar sesión</span>
						</a>
					)}
				</div>
			)}
		</footer>
	);
}
