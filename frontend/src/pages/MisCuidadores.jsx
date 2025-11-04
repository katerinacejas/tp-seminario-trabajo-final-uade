import React from "react";

export default function MisCuidadores() {
	const data = [
		{ nombre: "Katerina Cejas", tel: "+54 11 5555-1111", mail: "kcejas@example.com" },
		{ nombre: "Santiago López", tel: "+54 11 5555-4444", mail: "slopez@example.com" }
	];
	return (
		<div className="card">
			<h2>Mis cuidadores</h2>
			<table className="table">
				<thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th></tr></thead>
				<tbody>
					{data.map((c, i) => (
						<tr key={i}><td>{c.nombre}</td><td>{c.tel}</td><td>{c.mail}</td></tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
