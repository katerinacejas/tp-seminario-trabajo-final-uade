import React, { useState, useEffect } from "react";
import {
	IoMail,
	IoPeople,
	IoInformationCircle,
	IoPersonAddOutline,
	IoPeopleOutline,
	IoCallOutline,
	IoMailOutline,
	IoMailOpenOutline,
	IoTimeOutline,
} from "react-icons/io5";
import { usuariosAPI, cuidadoresPacientesAPI } from "../../services/api";
import "./MisCuidadores.css";

export default function MisCuidadores() {
	const [cuidadoresPendientes, setCuidadoresPendientes] = useState([]);
	const [cuidadoresActivos, setCuidadoresActivos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
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

			// Separar por estado
			const pendientes = (data || []).filter(c => c.estado === "PENDIENTE");
			const activos = (data || []).filter(c => c.estado === "ACEPTADO");

			setCuidadoresPendientes(pendientes);
			setCuidadoresActivos(activos);
		} catch (error) {
			console.error("Error cargando cuidadores:", error);
			setCuidadoresPendientes([]);
			setCuidadoresActivos([]);
		} finally {
			setLoading(false);
		}
	};

	const handleInvitar = async () => {
		if (!emailCuidador.trim()) {
			alert("Por favor, ingresa un email valido");
			return;
		}

		try {
			setActionLoading(true);
			await cuidadoresPacientesAPI.invitar(usuarioId, emailCuidador);
			alert("Invitacion enviada exitosamente");
			setShowInvitarModal(false);
			setEmailCuidador("");
			await cargarDatos();
		} catch (error) {
			console.error("Error enviando invitacion:", error);
		} finally {
			setActionLoading(false);
		}
	};

	const handleDesvincular = async (cuidador) => {
		const confirmar = window.confirm(
			`Estas seguro de desvincular a ${cuidador.nombreCompleto}? Ya no tendra acceso a tus datos.`
		);

		if (!confirmar) return;

		try {
			setActionLoading(true);
			await cuidadoresPacientesAPI.desvincular(usuarioId, cuidador.usuarioId);
			alert(`${cuidador.nombreCompleto} ha sido desvinculado`);
			await cargarDatos();
		} catch (error) {
			console.error("Error desvinculando cuidador:", error);
			alert("Error al desvincular cuidador");
		} finally {
			setActionLoading(false);
		}
	};

	const formatearFecha = (fecha) => {
		if (!fecha) return "";
		const date = new Date(fecha);
		return date.toLocaleDateString("es-AR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const obtenerIniciales = (nombreCompleto) => {
		if (!nombreCompleto) return "?";
		const partes = nombreCompleto.trim().split(" ");
		if (partes.length >= 2) {
			return (partes[0][0] + partes[1][0]).toUpperCase();
		}
		return nombreCompleto[0].toUpperCase();
	};

	if (loading) {
		return (
			<div className="mis-cuidadores-page">
				<div className="loading-container">
					<p>Cargando...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mis-cuidadores-page">
			<div className="page-header">
				<h1>Mis Cuidadores</h1>
				<button className="info-icon" title="Informacion">
					<IoInformationCircle />
				</button>
			</div>

			<button className="btn-invitar" onClick={() => setShowInvitarModal(true)}>
				<IoPersonAddOutline size={20} />
				Invitar cuidador
			</button>

			{/* SECCION: Invitaciones Pendientes */}
			{cuidadoresPendientes.length > 0 && (
				<div className="seccion-invitaciones">
					<div className="seccion-header">
						<div className="seccion-titulo">
							<IoMailOutline size={20} />
							<h2>Invitaciones Pendientes</h2>
						</div>
						<span className="badge-count">{cuidadoresPendientes.length}</span>
					</div>

					<div className="invitaciones-container">
						{cuidadoresPendientes.map((cuidador) => (
							<div key={cuidador.id} className="invitacion-card">
								<div className="invitacion-header">
									<div className="avatar-invitacion">
										{obtenerIniciales(cuidador.nombreCompleto)}
									</div>
									<div className="invitacion-info">
										<h3>{cuidador.nombreCompleto}</h3>
										<div className="invitacion-meta">
											<IoTimeOutline size={14} />
											<span>Invitado el {formatearFecha(cuidador.fechaInvitacion)}</span>
										</div>
									</div>
								</div>

								{cuidador.telefono && (
									<div className="invitacion-detalle">
										<IoCallOutline size={16} />
										<span>{cuidador.telefono}</span>
									</div>
								)}

								<div className="badge-pendiente">Pendiente de aceptacion</div>

								<div className="invitacion-nota">
									Esta invitacion esta esperando que el cuidador la acepte desde su cuenta.
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* SECCION: Cuidadores Activos */}
			<div className="seccion-cuidadores">
				<div className="seccion-header">
					<div className="seccion-titulo">
						<IoPeopleOutline size={20} />
						<h2>Mis Cuidadores</h2>
					</div>
					{cuidadoresActivos.length > 0 && (
						<span className="badge-count">{cuidadoresActivos.length}</span>
					)}
				</div>

				{cuidadoresActivos.length > 0 ? (
					<div className="cuidadores-container">
						{cuidadoresActivos.map((cuidador) => (
							<div key={cuidador.id} className="cuidador-card">
								<div className="cuidador-header">
									<div className="avatar-cuidador">
										{obtenerIniciales(cuidador.nombreCompleto)}
									</div>
									<div className="cuidador-info">
										<h3>{cuidador.nombreCompleto}</h3>
										<span className="badge-activo">Activo</span>
									</div>
								</div>

								<div className="cuidador-detalles">
									<div className="detalle-item">
										<IoMailOutline size={18} />
										<span>{cuidador.email}</span>
									</div>
									{cuidador.telefono && (
										<div className="detalle-item">
											<IoCallOutline size={18} />
											<span>{cuidador.telefono}</span>
										</div>
									)}
									<div className="detalle-item fecha-vinculacion">
										<IoTimeOutline size={18} />
										<span>
											Vinculado desde {formatearFecha(cuidador.fechaAceptacion || cuidador.fechaInvitacion)}
										</span>
									</div>
								</div>

								<button
									className="btn-desvincular"
									onClick={() => handleDesvincular(cuidador)}
									disabled={actionLoading}
								>
									Desvincular cuidador
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="estado-vacio">
						<IoPeopleOutline size={48} />
						<h3>Aun no tenes cuidadores vinculados</h3>
						<p>Los cuidadores deben aceptar tu invitacion para aparecer aqui</p>
					</div>
				)}
			</div>

			{/* Modal Invitar */}
			{showInvitarModal && (
				<div className="modal-overlay" onClick={() => setShowInvitarModal(false)}>
					<div className="modal" onClick={(e) => e.stopPropagation()}>
						<div className="modal-icon">
							<IoMail />
						</div>
						<h2>Invitar a nuevo cuidador</h2>
						<p className="modal-description">
							Envia una invitacion por email a tu nuevo cuidador para Cuido.
							Cuando tu cuidador inicie sesion en la misma direccion de email podra aceptar la invitacion y ver tu perfil.
						</p>

						<div className="form-group">
							<label>Ingresa el email de tu cuidador...</label>
							<input
								type="email"
								placeholder="ejemplo@correo.com"
								value={emailCuidador}
								onChange={(e) => setEmailCuidador(e.target.value)}
								autoFocus
								disabled={actionLoading}
							/>
						</div>

						<div className="modal-actions">
							<button
								className="btn-modal primary"
								onClick={handleInvitar}
								disabled={actionLoading}
							>
								{actionLoading ? "ENVIANDO..." : "INVITAR"}
							</button>
							<button
								className="btn-modal secondary"
								onClick={() => {
									setShowInvitarModal(false);
									setEmailCuidador("");
								}}
								disabled={actionLoading}
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
