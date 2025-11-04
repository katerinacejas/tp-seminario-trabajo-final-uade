import React from "react";

export default function PanicButton() {
	const handlePanic = () => {
		alert("Emergencia enviada: llamada y mensaje a contactos + ficha médica adjunta.");
	};
	return (
		<div className="panic" aria-live="polite">
			<button onClick={handlePanic} aria-label="Botón de pánico">
				<span className="mini">¡Emergencia!</span>
			</button>
		</div>
	);
}
