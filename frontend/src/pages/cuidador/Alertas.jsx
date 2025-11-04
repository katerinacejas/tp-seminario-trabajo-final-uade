import React from "react";
import { alertas } from "../../data";

export default function Alertas({ pacienteId }) {
	const meds = alertas.medicacion.filter(a => a.paciente === pacienteId);
	const citas = alertas.citas.filter(a => a.paciente === pacienteId);
	return (
		<div className="grid">
			<div className="col-6">
				<div className="card">
					<h2>Alertas de medicación</h2>
					<ul className="list">
						{meds.map(m => (
							<li key={m.id} className="row">
								<div><strong>{m.hora}</strong> — {m.detalle}</div>
								<div><label><input type="checkbox" defaultChecked={m.activa} /> Activa</label></div>
							</li>
						))}
					</ul>
					<div className="row">
						<input className="input" placeholder="08:00 — Fármaco 10mg" />
						<button className="btn primary">Añadir</button>
					</div>
				</div>
			</div>
			<div className="col-6">
				<div className="card">
					<h2>Alertas de citas</h2>
					<ul className="list">
						{citas.map(c => (
							<li key={c.id}><strong>{c.hora}</strong> — {c.detalle}</li>
						))}
					</ul>
					<div className="row">
						<input className="input" placeholder="2025-11-02 15:30 — Traumatólogo" />
						<button className="btn">Programar</button>
					</div>
				</div>
			</div>
		</div>
	);
}
