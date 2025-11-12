import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff, IoInformationCircle, IoAdd, IoTrash } from "react-icons/io5";
import { usuariosAPI, pacientesAPI, contactosEmergenciaAPI } from "../../services/api";
import "./PerfilPaciente.css";

export default function PerfilPaciente() {
	const navigate = useNavigate();
	const [editMode, setEditMode] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(true);

	// Datos del usuario y paciente
	const [usuarioId, setUsuarioId] = useState(null);
	const [formData, setFormData] = useState({
		nombreCompleto: "",
		email: "",
		password: "",
		condicionesMedicas: [],
		notasImportantes: [],
	});

	// Contactos de emergencia
	const [contactos, setContactos] = useState([]);
	const [editingContactos, setEditingContactos] = useState({});

	useEffect(() => {
		cargarDatos();
	}, []);

	const cargarDatos = async () => {
		try {
			setLoading(true);

			// Cargar datos del usuario
			const usuario = await usuariosAPI.getMe();
			setUsuarioId(usuario.id);

			// Cargar datos del paciente
			const paciente = await pacientesAPI.getByUsuarioId(usuario.id);

			setFormData({
				nombreCompleto: usuario.nombreCompleto || "",
				email: usuario.email || "",
				password: "",
				condicionesMedicas: paciente.condicionesMedicas || [],
				notasImportantes: paciente.notasImportantes || [],
			});

			// Cargar contactos de emergencia
			const contactosData = await contactosEmergenciaAPI.getByPaciente(usuario.id);
			setContactos(contactosData || []);

		} catch (error) {
			console.error("Error cargando datos:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleArrayChange = (field, index, value) => {
		setFormData(prev => ({
			...prev,
			[field]: prev[field].map((item, i) => i === index ? value : item)
		}));
	};

	const handleAddArrayItem = (field) => {
		setFormData(prev => ({
			...prev,
			[field]: [...prev[field], ""]
		}));
	};

	const handleRemoveArrayItem = (field, index) => {
		setFormData(prev => ({
			...prev,
			[field]: prev[field].filter((_, i) => i !== index)
		}));
	};

	const handleGuardarCambios = async () => {
		try {
			// Filtrar arrays vacíos
			const dataToSend = {
				...formData,
				condicionesMedicas: formData.condicionesMedicas.filter(c => c.trim() !== ""),
				notasImportantes: formData.notasImportantes.filter(n => n.trim() !== ""),
			};

			// Si no hay contraseña, no enviarla
			if (!dataToSend.password) {
				delete dataToSend.password;
			}

			await pacientesAPI.actualizarPerfil(usuarioId, dataToSend);
			alert("Perfil actualizado exitosamente");
			setEditMode(false);
			setFormData(prev => ({ ...prev, password: "" }));
			await cargarDatos();
		} catch (error) {
			console.error("Error actualizando perfil:", error);
			alert("Error al actualizar perfil");
		}
	};

	const handleCancelar = () => {
		setEditMode(false);
		cargarDatos();
	};

	// Contactos de emergencia
	const handleAgregarContacto = async () => {
		const nuevoContacto = {
			nombre: "",
			telefono: "",
			relacion: "",
		};

		try {
			const contactoCreado = await contactosEmergenciaAPI.crear(usuarioId, nuevoContacto);
			setContactos(prev => [...prev, contactoCreado]);
			setEditingContactos(prev => ({ ...prev, [contactoCreado.id]: true }));
		} catch (error) {
			console.error("Error creando contacto:", error);
			alert("Error al crear contacto");
		}
	};

	const handleEliminarContacto = async (contactoId) => {
		const confirmar = window.confirm("¿Estás seguro que querés eliminar este contacto?");
		if (!confirmar) return;

		try {
			await contactosEmergenciaAPI.eliminar(contactoId);
			setContactos(prev => prev.filter(c => c.id !== contactoId));
			alert("Contacto eliminado");
		} catch (error) {
			console.error("Error eliminando contacto:", error);
			alert("Error al eliminar contacto");
		}
	};

	const handleGuardarContacto = async (contacto) => {
		try {
			await contactosEmergenciaAPI.actualizar(contacto.id, {
				nombre: contacto.nombre,
				telefono: contacto.telefono,
				relacion: contacto.relacion,
			});
			setEditingContactos(prev => ({ ...prev, [contacto.id]: false }));
			alert("Contacto guardado");
		} catch (error) {
			console.error("Error guardando contacto:", error);
			alert("Error al guardar contacto");
		}
	};

	const handleContactoChange = (contactoId, field, value) => {
		setContactos(prev => prev.map(c =>
			c.id === contactoId ? { ...c, [field]: value } : c
		));
	};

	const handleCerrarSesion = () => {
		localStorage.removeItem('cuido.token');
		localStorage.removeItem('cuido.role');
		navigate('/login');
	};

	if (loading) {
		return (
			<div className="perfil-paciente-page">
				<p>Cargando...</p>
			</div>
		);
	}

	return (
		<div className="perfil-paciente-page">
			{/* Datos Personales */}
			<div className="perfil-card">
				<div className="perfil-header">
					<h2>Perfil</h2>
					<button className="info-icon" title="Información">
						<IoInformationCircle />
					</button>
				</div>

				<div className="form-section">
					<label className="form-label">Tu Nombre</label>
					{editMode ? (
						<input
							type="text"
							className="form-input"
							value={formData.nombreCompleto}
							onChange={(e) => handleInputChange("nombreCompleto", e.target.value)}
						/>
					) : (
						<div className="readonly-value">{formData.nombreCompleto}</div>
					)}
				</div>

				<div className="form-section">
					<label className="form-label">Email asociado</label>
					{editMode ? (
						<input
							type="email"
							className="form-input"
							value={formData.email}
							onChange={(e) => handleInputChange("email", e.target.value)}
						/>
					) : (
						<div className="readonly-value">{formData.email}</div>
					)}
				</div>

				<div className="form-section">
					<label className="form-label">Tu Contraseña</label>
					{editMode ? (
						<div className="password-input-wrapper">
							<input
								type={showPassword ? "text" : "password"}
								className="form-input"
								value={formData.password}
								onChange={(e) => handleInputChange("password", e.target.value)}
								placeholder="Dejá en blanco para no cambiar"
							/>
							<button
								className="password-toggle"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? <IoEyeOff /> : <IoEye />}
							</button>
						</div>
					) : (
						<div className="readonly-value">••••••••</div>
					)}
				</div>

				<div className="form-section">
					<label className="form-label">Condiciones</label>
					{editMode ? (
						<div className="array-inputs">
							{formData.condicionesMedicas.map((condicion, index) => (
								<div key={index} className="array-input-row">
									<input
										type="text"
										className="form-input"
										value={condicion}
										onChange={(e) => handleArrayChange("condicionesMedicas", index, e.target.value)}
										placeholder="Ej: Artritis"
									/>
									<button
										className="btn-remove-item"
										onClick={() => handleRemoveArrayItem("condicionesMedicas", index)}
									>
										<IoTrash />
									</button>
								</div>
							))}
							<button
								className="btn-add-item"
								onClick={() => handleAddArrayItem("condicionesMedicas")}
							>
								Añadir condición...
							</button>
						</div>
					) : (
						<div className="readonly-list">
							{formData.condicionesMedicas.length > 0 ? (
								formData.condicionesMedicas.map((condicion, index) => (
									<div key={index} className="readonly-list-item">{condicion}</div>
								))
							) : (
								<div className="readonly-value">Sin condiciones registradas</div>
							)}
						</div>
					)}
				</div>

				<div className="form-section">
					<label className="form-label">Notas Importantes</label>
					{editMode ? (
						<div className="array-inputs">
							{formData.notasImportantes.map((nota, index) => (
								<div key={index} className="array-input-row">
									<input
										type="text"
										className="form-input"
										value={nota}
										onChange={(e) => handleArrayChange("notasImportantes", index, e.target.value)}
										placeholder="Ej: Necesita ayuda para moverse por las mañanas"
									/>
									<button
										className="btn-remove-item"
										onClick={() => handleRemoveArrayItem("notasImportantes", index)}
									>
										<IoTrash />
									</button>
								</div>
							))}
							<button
								className="btn-add-item"
								onClick={() => handleAddArrayItem("notasImportantes")}
							>
								Añadir nota...
							</button>
						</div>
					) : (
						<div className="readonly-list">
							{formData.notasImportantes.length > 0 ? (
								formData.notasImportantes.map((nota, index) => (
									<div key={index} className="readonly-list-item">{nota}</div>
								))
							) : (
								<div className="readonly-value">Sin notas importantes</div>
							)}
						</div>
					)}
				</div>

				{editMode ? (
					<div className="form-actions">
						<button className="btn-action primary" onClick={handleGuardarCambios}>
							Guardar cambios
						</button>
						<button className="btn-action secondary" onClick={handleCancelar}>
							Cancelar
						</button>
					</div>
				) : (
					<div className="form-actions">
						<button className="btn-action primary" onClick={() => setEditMode(true)}>
							Editar
						</button>
						<button className="btn-action secondary" onClick={handleCerrarSesion}>
							Cerrar sesión
						</button>
					</div>
				)}
			</div>

			{/* Contactos de Emergencia */}
			<div className="perfil-card">
				<div className="perfil-header">
					<h2>Contactos de emergencia</h2>
				</div>

				{contactos.map((contacto) => {
					const isEditing = editingContactos[contacto.id];
					return (
						<div key={contacto.id} className={isEditing ? "contacto-item" : "contacto-readonly"}>
							{isEditing ? (
								<>
									<h4>Contacto de emergencia</h4>
									<div className="contacto-fields">
										<div>
											<label className="form-label">Nombre</label>
											<input
												type="text"
												className="form-input"
												value={contacto.nombre}
												onChange={(e) => handleContactoChange(contacto.id, "nombre", e.target.value)}
											/>
										</div>
										<div>
											<label className="form-label">Teléfono</label>
											<input
												type="text"
												className="form-input"
												value={contacto.telefono}
												onChange={(e) => handleContactoChange(contacto.id, "telefono", e.target.value)}
											/>
										</div>
										<div>
											<label className="form-label">Relación</label>
											<input
												type="text"
												className="form-input"
												value={contacto.relacion}
												onChange={(e) => handleContactoChange(contacto.id, "relacion", e.target.value)}
											/>
										</div>
									</div>
									<div className="contacto-actions">
										<button
											className="btn-icon save"
											onClick={() => handleGuardarContacto(contacto)}
										>
											Guardar
										</button>
										<button
											className="btn-icon delete"
											onClick={() => handleEliminarContacto(contacto.id)}
										>
											Eliminar
										</button>
									</div>
								</>
							) : (
								<>
									<p><strong>Nombre:</strong> {contacto.nombre}</p>
									<p><strong>Teléfono:</strong> {contacto.telefono}</p>
									<p><strong>Relación:</strong> {contacto.relacion}</p>
									<button
										className="btn-add-item"
										style={{ marginTop: 8 }}
										onClick={() => setEditingContactos(prev => ({ ...prev, [contacto.id]: true }))}
									>
										Editar
									</button>
								</>
							)}
						</div>
					);
				})}

				<button className="btn-add-item" onClick={handleAgregarContacto}>
					<IoAdd /> Añadir contacto
				</button>
			</div>
		</div>
	);
}
