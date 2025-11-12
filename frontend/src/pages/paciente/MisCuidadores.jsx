import React, { useState, useEffect } from "react";
import { IoMail, IoPeople, IoInformationCircle } from "react-icons/io5";
import { usuariosAPI, cuidadoresPacientesAPI } from "../../services/api";
import "./MisCuidadores.css";

export default function MisCuidadores() {
	const [cuidadores, setCuidadores] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showInvitarModal, setShowInvitarModal] = useState(false);
	const [emailCuidador, setEmailCuidador] = useState("");
	const [usuarioId, setUsuarioId] = useState(null);

	useEffect(() => {
		cargarDatos();
	}, []);

	const cargarDatos = async () => {
		try {
			setLoading(true);
			const usuario = await usuariosAPI.getMe();
			setUsuarioId(usuario.id);

			const data = await cuidadoresPacientesAPI.getByPaciente(usuario.id);
			setCuidadores(data || []);
		} catch (error) {
			console.error("Error cargando cuidadores:", error);
			setCuidadores([]);
		} finally {
			setLoading(false);
		}
	};

	const handleInvitar = async () => {
		if (!emailCuidador.trim()) {
			alert("Por favor, ingresá un email válido");
			return;
		}

		try {
			await cuidadoresPacientesAPI.invitar(usuarioId, emailCuidador);
			alert("Invitación enviada exitosamente");
			setShowInvitarModal(false);
			setEmailCuidador("");
			await cargarDatos();
		} catch (error) {
			console.error("Error enviando invitación:", error);
			alert(error.message || "Error al enviar invitación");
		}
	};

	const handleDesvincular = async (cuidador) => {
		const confirmar = window.confirm(
			`¿Estás seguro que querés desvincular a ${cuidador.nombreCompleto}?`
		);

		if (!confirmar) return;

		try {
			await cuidadoresPacientesAPI.desvincular(usuarioId, cuidador.usuarioId);
			alert("Cuidador desvinculado exitosamente");
			await cargarDatos();
		} catch (error) {
			console.error("Error desvinculando cuidador:", error);
			alert("Error al desvincular cuidador");
		}
	};

	if (loading) {
		return (
			<div className="mis-cuidadores-page">
				<p>Cargando...</p>
			</div>
		);
	}

	return (
		<div className="mis-cuidadores-page">
			<div className="page-header">
				<h1>Mis Cuidadores</h1>
				<button className="info-icon" title="Información">
					<IoInformationCircle />
				</button>
			</div>

			<button className="btn-invitar" onClick={() => setShowInvitarModal(true)}>
				Invitar cuidador
			</button>

			{cuidadores.length > 0 ? (
				<div className="cuidadores-container">
					{cuidadores.map((cuidador) => (
						<div key={cuidador.id} className="cuidador-card">
							<h3>{cuidador.nombreCompleto}</h3>
							<p>{cuidador.email}</p>
							<button
								className="btn-desvincular"
								onClick={() => handleDesvincular(cuidador)}
							>
								Desvincular cuidador
							</button>
						</div>
					))}
				</div>
			) : (
				<div className="empty-state">
					<div className="empty-icon">
						<IoPeople />
					</div>
					<h3>No tenés cuidadores</h3>
					<p>Invitá a alguien para que te ayude con tus cuidados</p>
				</div>
			)}

			{/* Modal Invitar */}
			{showInvitarModal && (
				<div className="modal-overlay" onClick={() => setShowInvitarModal(false)}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-icon">
							<IoMail />
						</div>
						<h2>Invitar a nuevo cuidador</h2>
						<p className="modal-description">
							Enviá una invitación por email a tu nuevo cuidador para Cuido.
							Cuando tu cuidador inicie sesión en la misma dirección de email podrá ver tu perfil.
						</p>

						<div className="form-group">
							<label>Ingresá el email de su cuidador...</label>
							<input
								type="email"
								placeholder="ejemplo@correo.com"
								value={emailCuidador}
								onChange={(e) => setEmailCuidador(e.target.value)}
								autoFocus
							/>
						</div>

						<div className="modal-actions">
							<button
								className="btn-modal primary"
								onClick={handleInvitar}
							>
								INVITAR
							</button>
							<button
								className="btn-modal secondary"
								onClick={() => {
									setShowInvitarModal(false);
									setEmailCuidador("");
								}}
							>
								CANCELAR
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
