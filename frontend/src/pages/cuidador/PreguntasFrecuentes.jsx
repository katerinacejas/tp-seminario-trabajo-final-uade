import React, { useState } from 'react';
import { IoAddOutline, IoRemoveOutline, IoHelpCircleOutline } from 'react-icons/io5';
import './PreguntasFrecuentes.css';

export default function PreguntasFrecuentes() {
	const [preguntaAbierta, setPreguntaAbierta] = useState(null);

	// Contenido exacto de preguntas frecuentes para cuidadores
	const faqs = [
		{
			id: 1,
			pregunta: '¿Cómo agrego un nuevo paciente?',
			respuesta: 'Para agregar un nuevo paciente, enviá una invitación desde la pantalla "Pacientes". El paciente recibirá un email y deberá aceptar la invitación desde su cuenta.',
		},
		{
			id: 2,
			pregunta: '¿Cómo creo recordatorios de medicamentos?',
			respuesta: 'Ve a la sección "Recordatorios", seleccioná tu paciente y hacé click en "Nuevo recordatorio". Completá todos los campos requeridos incluyendo nombre del medicamento, dosis, horarios y fechas.',
		},
		{
			id: 3,
			pregunta: '¿Qué es la bitácora?',
			respuesta: 'La bitácora es un registro diario de las actividades, observaciones y síntomas del paciente. Te permite llevar un historial completo de su cuidado.',
		},
		{
			id: 4,
			pregunta: '¿Cómo funciona el botón de emergencia?',
			respuesta: 'El botón de emergencia muestra los contactos de emergencia del paciente seleccionado. Podés llamarlos directamente desde la app con un solo click.',
		},
		{
			id: 5,
			pregunta: '¿Puedo editar la información de un paciente?',
			respuesta: 'Podés ver toda la información médica del paciente, pero solo ellos pueden modificar sus datos desde su perfil.',
		},
		{
			id: 6,
			pregunta: '¿Cómo subo documentos médicos?',
			respuesta: 'En la sección "Documentos", podés subir archivos como recetas, estudios o informes médicos. Seleccioná el tipo de documento y arrastrá el archivo o hacé click para seleccionarlo.',
		},
		{
			id: 7,
			pregunta: '¿Cómo organizo mis tareas?',
			respuesta: 'En "Lista de Tareas" podés crear, editar y reorganizar tareas. Usá el modo de reordenamiento para cambiar el orden manualmente con las flechas.',
		},
		{
			id: 8,
			pregunta: '¿Puedo tener múltiples pacientes?',
			respuesta: 'Sí, podés cuidar a múltiples pacientes. Usá el selector de paciente en la barra superior para cambiar entre ellos.',
		},
	];

	const togglePregunta = (id) => {
		setPreguntaAbierta(preguntaAbierta === id ? null : id);
	};

	return (
		<div className="preguntas-container">
			{/* Título Principal */}
			<div className="preguntas-titulo-principal">
				<IoHelpCircleOutline className="titulo-icono" />
				<h1>Preguntas Frecuentes</h1>
			</div>

			{/* Lista de Preguntas Accordion */}
			<div className="preguntas-lista">
				{faqs.map((item) => (
					<div
						key={item.id}
						className={`accordion-item ${preguntaAbierta === item.id ? 'abierta' : ''}`}
					>
						<div className="accordion-header" onClick={() => togglePregunta(item.id)}>
							<h3 className="accordion-pregunta">{item.pregunta}</h3>
							{preguntaAbierta === item.id ? (
								<IoRemoveOutline className="accordion-icono" />
							) : (
								<IoAddOutline className="accordion-icono" />
							)}
						</div>

						<div className="accordion-respuesta-wrapper">
							<div className="accordion-respuesta-contenido">
								<p className="accordion-respuesta-texto">{item.respuesta}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
