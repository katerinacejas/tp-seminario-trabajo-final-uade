import React from "react";
import { mockUsers } from "../data";

export default function PatientSwitcher({ value, onChange }) {
	return (
		<div className="card" role="group" aria-label="Selector de paciente">
			<div className="row">
				<strong>Paciente</strong>
				<span className="badge">Cuidador: {mockUsers.cuidador.nombre}</span>
			</div>
			<div style={{ marginTop: 8 }}>
				<select className="input" value={value} onChange={e => onChange(e.target.value)}>
					{mockUsers.cuidador.pacientes.map(pid => (
						<option key={pid} value={pid}>
							{mockUsers.pacientes[pid].nombre} — {mockUsers.pacientes[pid].edad} años
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
