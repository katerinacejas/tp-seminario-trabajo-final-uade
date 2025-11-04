import React, { useState } from "react";

const mockPacientes = [
	{ id: "p1", nombre: "Ana Pérez", edad: 79 },
	{ id: "p2", nombre: "Roberto Sánchez", edad: 81 },
];

export default function HomeCuidador() {
	const [paciente, setPaciente] = useState(mockPacientes[0]);

	return (
		<div className="grid">
			<div className="col-12">
				<div className="hero">
					<div className="title">
						<h1>Bienvenida/o, Cuidador</h1>
					</div>
					<div className="subtitle">Estás gestionando a <strong>{paciente.nombre}</strong>. Elegí accesos rápidos o revisá el estado general.</div>

					<div className="meta">
						<span className="badge">Cuido • Activo</span>
						<span className="badge">Paciente {paciente.edad} años</span>
					</div>

					<div className="form-row" style={{ maxWidth: 480 }}>
						<label>Paciente</label>
						<select
							value={paciente.id}
							onChange={(e) => setPaciente(mockPacientes.find(p => p.id === e.target.value))}
						>
							{mockPacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} — {p.edad} años</option>)}
						</select>
					</div>

					<div className="quick-actions">
						<button className="btn pill primary">Bitácora</button>
						<button className="btn pill">Resumen</button>
						<button className="btn pill">Calendario</button>
						<button className="btn pill">Tareas</button>
						<button className="btn pill">Ficha</button>
						<button className="btn pill">Documentos</button>
						<button className="btn pill">Alertas</button>
						<button className="btn pill">Chatbot</button>
					</div>
				</div>
			</div>

			<div className="col-12 col-6">
				<div className="card">
					<h2>Próximos eventos</h2>
					<table className="table">
						<thead>
							<tr><th>Fecha</th><th>Evento</th><th>Lugar</th></tr>
						</thead>
						<tbody>
							<tr><td>2025-10-22 10:30</td><td>Turno cardiólogo</td><td>Hospital Alemán</td></tr>
							<tr><td>2025-10-23 09:00</td><td>Laboratorio (sangre)</td><td>Swiss Medical</td></tr>
						</tbody>
					</table>
				</div>
			</div>

			<div className="col-12 col-6">
				<div className="card">
					<h2>Tareas</h2>
					<div className="stat" style={{ marginBottom: 10 }}>
						<div className="icon">✓</div>
						<div>
							<div style={{ fontWeight: 800 }}>Check-list compartida</div>
							<small className="muted">Coordiná con otros cuidadores.</small>
						</div>
					</div>

					<ul className="list">
						<li className="row">
							<div>
								<div style={{ fontWeight: 700 }}>Dar medicación 8am</div>
								<small className="muted">Losartán 50mg</small>
							</div>
							<button className="btn success">Listo</button>
						</li>
						<li className="row">
							<div>
								<div style={{ fontWeight: 700 }}>Comprar pañales M</div>
							</div>
							<button className="btn">Marcar</button>
						</li>
					</ul>
				</div>
			</div>

			<div className="col-12">
				<div className="card">
					<h2>Bitácoras recientes</h2>
					<div className="timeline">
						<div className="t-item">
							<div className="t-head">
								<div className="t-date">
									<div className="day">21</div>
									<div>
										<div style={{ fontWeight: 800 }}>2025-10-21</div>
										<div className="dow">Martes</div>
									</div>
								</div>
								<span className="badge">Cuidador: Katerina Cejas</span>
							</div>
							<div className="t-body">
								<div className="t-section">
									<h4>Síntomas</h4>
									<div className="tags">
										<span className="tag active">Dolor de cabeza</span>
										<span className="tag">Cansancio</span>
									</div>
								</div>
								<div className="t-section">
									<h4>Notas</h4>
									<p>Noche tranquila. Caminata corta por la mañana, hidratación correcta.</p>
								</div>
								<div className="t-section">
									<h4>Adjuntos</h4>
									<div className="t-files">
										<span className="t-file">Presión_8am.jpg</span>
									</div>
								</div>
							</div>
						</div>

						<div className="t-item">
							<div className="t-head">
								<div className="t-date">
									<div className="day">20</div>
									<div>
										<div style={{ fontWeight: 800 }}>2025-10-20</div>
										<div className="dow">Lunes</div>
									</div>
								</div>
								<span className="badge">Cuidador: S. López</span>
							</div>
							<div className="t-body">
								<div className="t-section">
									<h4>Síntomas</h4>
									<div className="tags">
										<span className="tag active">Tos</span>
										<span className="tag active">Fiebre</span>
									</div>
								</div>
								<div className="t-section">
									<h4>Notas</h4>
									<p>Noche intranquila, mejoró con té. Se controló temperatura.</p>
								</div>
							</div>
						</div>
					</div>

					<div className="row" style={{ marginTop: 12 }}>
						<button className="btn">Ver más</button>
						<button className="btn primary">Nueva bitácora</button>
					</div>
				</div>
			</div>
		</div>
	);
}
