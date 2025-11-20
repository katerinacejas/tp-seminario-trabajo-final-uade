import React from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

export default function Welcome() {
	const nav = useNavigate();

	const goToLogin = () => {
		nav("/login", { replace: true });
	};

	return (
		<div className="welcome-screen">
			<div className="welcome-card">
				<div className="welcome-illustration">
					{/* círculo principal con el logo */}
					<div className="welcome-logo-circle">
						<img src="/logo.png" alt="Cuido" />
					</div>

					{/* formitas decorativas */}
					<span className="welcome-badge welcome-badge--top" />
					<span className="welcome-badge welcome-badge--left" />
					<span className="welcome-badge welcome-badge--right" />
				</div>

				<div className="welcome-content">
					<h1 className="welcome-title">
						Cuido cuida al <span>cuidador</span>
					</h1>

					<p className="welcome-subtitle">
						Tu aliado para un equilibrio entre el acompañamiento responsable
						y la vida personal.
					</p>

					<button className="welcome-btn-primary" onClick={goToLogin}>
						Empezar
					</button>
				</div>
			</div>
		</div>
	);
}
