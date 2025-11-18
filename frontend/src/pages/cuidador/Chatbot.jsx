import React, { useState, useEffect, useRef } from "react";
import { IoChatbubbleEllipsesOutline, IoSendOutline } from "react-icons/io5";
import "./Chatbot.css";

export default function Chatbot() {
	const [mensajes, setMensajes] = useState([
		{
			id: 1,
			tipo: 'bot',
			texto: '¡Hola! Soy Cuido Assistant. ¿En qué puedo ayudarte hoy?',
			timestamp: new Date(Date.now() - 10000)
		},
		{
			id: 2,
			tipo: 'usuario',
			texto: '¿Cómo registro un medicamento?',
			timestamp: new Date(Date.now() - 8000)
		},
		{
			id: 3,
			tipo: 'bot',
			texto: 'Para registrar un medicamento, ve a la sección "Recordatorios" y seleccioná "Nuevo Recordatorio". Luego completá los datos del medicamento como nombre, dosis, horarios y fechas.',
			timestamp: new Date(Date.now() - 5000)
		}
	]);

	const [input, setInput] = useState("");
	const [botEscribiendo, setBotEscribiendo] = useState(false);
	const mensajesEndRef = useRef(null);

	// Scroll automático al último mensaje
	const scrollToBottom = () => {
		mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [mensajes, botEscribiendo]);

	// Formatear timestamp
	const formatearHora = (fecha) => {
		return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
	};

	// Enviar mensaje
	const enviarMensaje = () => {
		const textoTrimmed = input.trim();
		if (!textoTrimmed || botEscribiendo) return;

		// Agregar mensaje del usuario
		const nuevoMensajeUsuario = {
			id: Date.now(),
			tipo: 'usuario',
			texto: textoTrimmed,
			timestamp: new Date()
		};

		setMensajes(prev => [...prev, nuevoMensajeUsuario]);
		setInput("");

		// Simular "bot escribiendo..."
		setBotEscribiendo(true);

		// Respuesta automática del bot después de 1.5 segundos
		setTimeout(() => {
			const respuestaBot = {
				id: Date.now() + 1,
				tipo: 'bot',
				texto: 'Gracias por tu mensaje. Esta funcionalidad está en desarrollo. Por ahora podés consultar las Preguntas Frecuentes para más información.',
				timestamp: new Date()
			};

			setMensajes(prev => [...prev, respuestaBot]);
			setBotEscribiendo(false);
		}, 1500);
	};

	// Manejar Enter
	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			enviarMensaje();
		}
	};

	return (
		<div className="chatbot-container">
			{/* Área de mensajes */}
			<div className="chatbot-mensajes">
				{mensajes.map((mensaje) => (
					<div
						key={mensaje.id}
						className={`mensaje-wrapper ${mensaje.tipo === 'bot' ? 'mensaje-wrapper-bot' : 'mensaje-wrapper-usuario'}`}
					>
						{mensaje.tipo === 'bot' && (
							<div className="mensaje-avatar">
								<IoChatbubbleEllipsesOutline />
							</div>
						)}
						<div className={`mensaje ${mensaje.tipo === 'bot' ? 'mensaje-bot' : 'mensaje-usuario'}`}>
							<div className="mensaje-texto">{mensaje.texto}</div>
							<div className="mensaje-timestamp">
								{formatearHora(mensaje.timestamp)}
							</div>
						</div>
					</div>
				))}

				{/* Indicador "escribiendo..." */}
				{botEscribiendo && (
					<div className="mensaje-wrapper mensaje-wrapper-bot">
						<div className="mensaje-avatar">
							<IoChatbubbleEllipsesOutline />
						</div>
						<div className="mensaje mensaje-bot escribiendo">
							<div className="typing-indicator">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
					</div>
				)}

				<div ref={mensajesEndRef} />
			</div>

			{/* Input footer */}
			<div className="chatbot-footer">
				<input
					type="text"
					className="chatbot-input"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Escribe tu mensaje..."
					disabled={botEscribiendo}
				/>
				<button
					className="chatbot-btn-enviar"
					onClick={enviarMensaje}
					disabled={!input.trim() || botEscribiendo}
				>
					<IoSendOutline />
				</button>
			</div>
		</div>
	);
}
