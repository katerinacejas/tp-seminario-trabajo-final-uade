import React, { useEffect } from "react";
import { usePaciente } from "../context/PacienteContext";
import { useAuth } from "../auth";
import { usuariosAPI } from "../services/api";

export default function PatientSwitcher() {
	const { pacienteSeleccionado, pacientes, seleccionarPaciente } = usePaciente();
	const { role } = useAuth();
	const [cuidadorNombre, setCuidadorNombre] = React.useState("");

	useEffect(() => {
		// Cargar información del cuidador actual
		const cargarCuidador = async () => {
			try {
				const usuario = await usuariosAPI.getMe();
				setCuidadorNombre(usuario.nombreCompleto);
			} catch (err) {
				console.error('Error al cargar información del cuidador:', err);
			}
		};
		if (role === "cuidador") {
			cargarCuidador();
		}
	}, [role]);

	const calcularEdad = (fechaNacimiento) => {
		if (!fechaNacimiento) return 'N/A';
		const hoy = new Date();
		const nacimiento = new Date(fechaNacimiento);
		let edad = hoy.getFullYear() - nacimiento.getFullYear();
		const mes = hoy.getMonth() - nacimiento.getMonth();
		if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
			edad--;
		}
		return edad;
	};

	return (
		<div className="card" role="group" aria-label="Selector de paciente">
			<div className="row">
				<strong>Paciente</strong>
				{cuidadorNombre && <span className="badge">Cuidador: {cuidadorNombre}</span>}
			</div>
			<div style={{ marginTop: 8 }}>
				<select
					className="input"
					value={pacienteSeleccionado?.id || ''}
					onChange={e => seleccionarPaciente(parseInt(e.target.value))}
				>
					{pacientes.length === 0 && (
						<option value="">No hay pacientes asignados</option>
					)}
					{pacientes.map(paciente => (
						<option key={paciente.id} value={paciente.id}>
							{paciente.nombreCompleto} — {calcularEdad(paciente.fechaNacimiento)} años
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
