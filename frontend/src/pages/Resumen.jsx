import React, { useState } from "react";
import { bitacorasDemo } from "../data";

export default function Resumen({ pacienteId }) {
	const [periodo, setPeriodo] = useState("semanal");
	const data = bitacorasDemo.filter(b => b.paciente === pacienteId);

	const exportar = () => {
		const contenido = `Resumen ${periodo.toUpperCase()}\nEntradas: ${data.length}\n` +
			data.map(d => `${d.fecha}: ${d.sintomas.join(", ")} | ${d.notas}`).join("\n");
		const blob = new Blob([contenido], { type: "text/plain" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `resumen-${periodo}.txt`;
		a.click();
	};

	return (
		<div className="card">
			<div className="row">
				<h2>Resumen {periodo}</h2>
				<select value={periodo} onChange={e => setPeriodo(e.target.value)}>
					<option value="semanal">Semanal</option>
					<option value="mensual">Mensual</option>
				</select>
			</div>
			<ul className="list">
				{data.map(d => (
					<li key={d.id}>
						<strong>{d.fecha}</strong> — {d.sintomas.join(", ")} — {d.notas}
					</li>
				))}
			</ul>
			<div style={{ marginTop: 10 }}>
				<button className="btn primary" onClick={exportar}>Exportar</button>
			</div>
		</div>
	);
}
