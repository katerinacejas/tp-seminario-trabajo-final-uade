import React from "react";
import { tutoriales } from "../data";

export default function Tutoriales() {
	return (
		<div className="grid">
			{tutoriales.map(t => (
				<div key={t.id} className="col-6">
					<div className="card">
						<h3>{t.titulo} <span className="badge">{t.duracion}</span></h3>
						<div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
							<iframe
								title={t.titulo}
								src={t.url}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
								style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
