import React, { useState } from "react";

export default function InvitarCuidador() {
	const [mail, setMail] = useState("");
	return (
		<div className="card" style={{ maxWidth: 520 }}>
			<h2>Invitar cuidador</h2>
			<div className="form-row">
				<label>Correo del cuidador</label>
				<input className="input" value={mail} onChange={e => setMail(e.target.value)} placeholder="cuidador@correo.com" />
			</div>
			<button className="btn primary" onClick={() => alert(`Invitación enviada a ${mail}`)}>Enviar invitación</button>
		</div>
	);
}
