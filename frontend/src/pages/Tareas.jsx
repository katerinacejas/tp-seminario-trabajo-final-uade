import React, { useState } from "react";
import { tareas } from "../data";

export default function Tareas({ pacienteId }) {
	const [list, setList] = useState(tareas.filter(t => t.paciente === pacienteId));
	const [txt, setTxt] = useState("");

	const add = () => {
		if (!txt) return;
		setList([{ id: Math.random().toString(36).slice(2), paciente: pacienteId, titulo: txt, done: false }, ...list]);
		setTxt("");
	};

	const toggle = (id) => setList(list.map(t => t.id === id ? { ...t, done: !t.done } : t));

	return (
		<div className="card">
			<h2>Check-list compartida</h2>
			<div className="row">
				<input className="input" value={txt} onChange={e => setTxt(e.target.value)} placeholder="Ej: Comprar pañales M" />
				<button className="btn primary" onClick={add}>Añadir</button>
			</div>
			<ul className="list">
				{list.map(t => (
					<li key={t.id} className="row">
						<label>
							<input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} /> {t.titulo}
						</label>
						{t.done && <span className="badge" style={{ background: "#eafbea", color: "#15803d" }}>Listo</span>}
					</li>
				))}
			</ul>
		</div>
	);
}
