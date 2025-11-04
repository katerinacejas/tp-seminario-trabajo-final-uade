import React, { useState } from "react";
import { bitacorasDemo, documentos } from "../../data";

export default function Chatbot({ pacienteId }) {
	const [input, setInput] = useState("");
	const [msgs, setMsgs] = useState([
		{ role: "bot", text: "Hola, soy el asistente de Cuido. Puedo responder con base en bitácoras, resúmenes y documentos." }
	]);

	const send = () => {
		if (!input) return;
		// Simulación: “responder” usando datos locales
		const facts = bitacorasDemo.filter(b => b.paciente === pacienteId).map(b => `${b.fecha}: ${b.sintomas.join(", ")}`).join(" | ");
		const docs = documentos.filter(d => d.paciente === pacienteId).map(d => d.nombre).join(", ");
		const reply = `Según bitácoras: ${facts || "sin registros"}.\nDocumentos: ${docs || "sin docs"}.\nRecomendación general: consultar profesional ante síntomas persistentes.`;
		setMsgs([...msgs, { role: "user", text: input }, { role: "bot", text: reply }]);
		setInput("");
	};

	return (
		<div className="card">
			<h2>Chatbot</h2>
			<div style={{ minHeight: 220, padding: 8, border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" }}>
				{msgs.map((m, i) => (
					<div key={i} style={{ margin: "8px 0" }}>
						<span className="badge" style={{ marginRight: 8, background: m.role === "bot" ? "#eef6ff" : "#e2e8f0" }}>
							{m.role === "bot" ? "Cuido" : "Vos"}
						</span>
						<span style={{ whiteSpace: "pre-wrap" }}>{m.text}</span>
					</div>
				))}
			</div>
			<div className="row" style={{ marginTop: 8 }}>
				<input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Preguntá sobre el paciente…" />
				<button className="btn primary" onClick={send}>Enviar</button>
			</div>
		</div>
	);
}
