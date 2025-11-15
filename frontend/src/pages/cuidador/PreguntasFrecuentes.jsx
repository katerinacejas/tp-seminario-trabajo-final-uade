import React, { useState } from 'react';
import { IoChevronDown, IoInformationCircleOutline } from 'react-icons/io5';
import './PreguntasFrecuentes.css';

export default function PreguntasFrecuentes() {
	const [preguntaAbierta, setPreguntaAbierta] = useState(null);

	// Preguntas y respuestas hardcodeadas del diseño de Figma
	const preguntas = [
		{
			id: 1,
			pregunta: '¿Cómo puedo añadir un nuevo recordatorio de medicación?',
			respuesta:
				'Ve a la sección de "Recordatorios", llena los detalles del medicamento y la hora en el formulario superior. Haz clic en "Añadir Recordatorio". Aparecerá en tu lista.',
		},
		{
			id: 2,
			pregunta: '¿Qué hago si presiono el botón de emergencia por accidente?',
			respuesta:
				'No te preocupes. El botón de emergencia solo abre una ventana con los números de contacto para que puedas llamar rápidamente. No envía ninguna notificación automática.',
		},
		{
			id: 3,
			pregunta: '¿Se guardan mis datos si cierro el navegador?',
			respuesta:
				'Actualmente, la aplicación funciona localmente en tu navegador. Los datos se reiniciarán si cierras o recargas la página. Estamos trabajando en una versión con guardado en la nube.',
		},
		{
			id: 4,
			pregunta: '¿Puedo compartir el acceso con otro familiar?',
			respuesta:
				'En esta versión, toda la información se gestiona desde un solo dispositivo. Para compartir, necesitarías usar el mismo dispositivo o coordinar la información manualmente.',
		},
	];

	const togglePregunta = (id) => {
		setPreguntaAbierta(preguntaAbierta === id ? null : id);
	};

	return (
		<div className="preguntas-container">
			{/* Header */}
			<div className="preguntas-header">
				<div className="preguntas-header-icon"></div>
				<div className="preguntas-header-content">
					<div className="preguntas-titulo">
						<div className="preguntas-titulo-text">
							<span>Preguntas Frecuentes</span>
						</div>
						<IoInformationCircleOutline className="info-icon" />
					</div>
					<p className="preguntas-subtitulo">
						Encuentra respuestas a preguntas frecuentes y aprende a sacar el máximo provecho de Cuido.
					</p>
				</div>
			</div>

			{/* Lista de Preguntas */}
			<div className="preguntas-lista">
				{preguntas.map((item) => (
					<div
						key={item.id}
						className={`pregunta-item ${preguntaAbierta === item.id ? 'abierta' : ''}`}
					>
						<div className="pregunta-header" onClick={() => togglePregunta(item.id)}>
							<h3 className="pregunta-texto">{item.pregunta}</h3>
							<IoChevronDown className="pregunta-icono" />
						</div>

						<div className="respuesta-wrapper">
							<div className="respuesta-contenido">
								<p className="respuesta-texto">{item.respuesta}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
