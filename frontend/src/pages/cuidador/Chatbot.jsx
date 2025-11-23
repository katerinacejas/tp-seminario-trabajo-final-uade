import React, { useState, useEffect, useRef } from "react";
import { IoChatbubbleEllipsesOutline, IoSendOutline, IoTrashOutline } from "react-icons/io5";
import { chatbotAPI } from "../../services/api";
import { usePaciente } from "../../context/PacienteContext";
import "./Chatbot.css";

export default function Chatbot() {
	const { pacienteSeleccionado } = usePaciente();
	const [mensajes, setMensajes] = useState([]);
	const [input, setInput] = useState("");
	const [botEscribiendo, setBotEscribiendo] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const mensajesEndRef = useRef(null);

	// Cargar historial al montar y cuando cambia el paciente
	useEffect(() => {
		console.log('paciente seleccionado del useEffect de Chatbot tiene: ', pacienteSeleccionado);
		if (pacienteSeleccionado) {
			cargarHistorial();
			// Restaurar borrador del input
			const drafKey = `chatbot-draft-${pacienteSeleccionado.id}`;
			const savedDraft = localStorage.getItem(drafKey);
			if (savedDraft) {
				setInput(savedDraft);
			}
		} else {
			setMensajes([]);
			setLoading(false);
		}
	}, [pacienteSeleccionado]);

	// Scroll automático al último mensaje
	const scrollToBottom = () => {
		mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [mensajes, botEscribiendo]);

	// Guardar borrador cuando cambia el input
	useEffect(() => {
		if (pacienteSeleccionado) {
			const draftKey = `chatbot-draft-${pacienteSeleccionado.id}`;
			if (input.trim()) {
				localStorage.setItem(draftKey, input);
			} else {
				localStorage.removeItem(draftKey);
			}
		}
	}, [input, pacienteSeleccionado]);

	// Cargar historial de conversaciones
	const cargarHistorial = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await chatbotAPI.obtenerHistorial(pacienteSeleccionado.id);

			// Convertir historial a formato de mensajes
			const mensajesHistorial = [];
			if (data.conversaciones && data.conversaciones.length > 0) {
				data.conversaciones.forEach(conv => {
					mensajesHistorial.push({
						id: `user-${conv.id}`,
						tipo: 'usuario',
						texto: conv.mensaje,
						timestamp: new Date(conv.timestamp)
					});
					mensajesHistorial.push({
						id: `bot-${conv.id}`,
						tipo: 'bot',
						texto: conv.respuesta,
						timestamp: new Date(conv.timestamp)
					});
				});
			} else {
				// Mensaje de bienvenida si no hay historial
				mensajesHistorial.push({
					id: 'welcome',
					tipo: 'bot',
					texto: `¡Hola! Soy el asistente de Cuido para ${pacienteSeleccionado.nombreCompleto}. Puedo ayudarte con información sobre medicamentos, citas médicas, tareas, bitácoras y más. ¿En qué puedo ayudarte?`,
					timestamp: new Date()
				});
			}

			setMensajes(mensajesHistorial);
		} catch (err) {
			console.error('Error al cargar historial:', err);
			// NO mostrar error en rojo, solo mensaje de bienvenida
			// setError('No se pudo cargar el historial del chatbot');
			// Mensaje de bienvenida de fallback
			setMensajes([{
				id: 'welcome',
				tipo: 'bot',
				texto: `¡Hola! Soy el asistente de Cuido. ¿En qué puedo ayudarte?`,
				timestamp: new Date()
			}]);
		} finally {
			setLoading(false);
		}
	};

	// Formatear timestamp
	const formatearHora = (fecha) => {
		return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
	};

	// Enviar mensaje al microservicio
	const enviarMensaje = async () => {
		const textoTrimmed = input.trim();
		if (!textoTrimmed || botEscribiendo || !pacienteSeleccionado) return;

		// Agregar mensaje del usuario inmediatamente
		const nuevoMensajeUsuario = {
			id: `temp-user-${Date.now()}`,
			tipo: 'usuario',
			texto: textoTrimmed,
			timestamp: new Date()
		};

		setMensajes(prev => [...prev, nuevoMensajeUsuario]);
		setInput("");
		// Limpiar borrador después de enviar
		const draftKey = `chatbot-draft-${pacienteSeleccionado.id}`;
		localStorage.removeItem(draftKey);
		setBotEscribiendo(true);
		setError(null);

		try {
			// Llamar al microservicio
			const response = await chatbotAPI.enviarMensaje(textoTrimmed, pacienteSeleccionado.id);

			// Agregar respuesta del bot
			const respuestaBot = {
				id: `bot-${response.mensaje_id || Date.now()}`,
				tipo: 'bot',
				texto: response.respuesta,
				timestamp: new Date(response.timestamp)
			};

			setMensajes(prev => [...prev, respuestaBot]);
		} catch (err) {
			console.error('Error al enviar mensaje:', err);
			setError(err.message || 'Error al enviar el mensaje');

			// Mensaje de error del bot
			const errorBot = {
				id: `error-${Date.now()}`,
				tipo: 'bot',
				texto: 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta nuevamente.',
				timestamp: new Date()
			};
			setMensajes(prev => [...prev, errorBot]);
		} finally {
			setBotEscribiendo(false);
		}
	};

	// Borrar historial
	const borrarHistorial = async () => {
		if (!pacienteSeleccionado) return;

		if (!window.confirm('¿Estás seguro de que deseas borrar todo el historial de conversaciones?')) {
			return;
		}

		try {
			await chatbotAPI.borrarHistorial(pacienteSeleccionado.id);
			// Recargar con mensaje de bienvenida
			setMensajes([{
				id: 'welcome',
				tipo: 'bot',
				texto: `¡Hola! Soy el asistente de Cuido para ${pacienteSeleccionado.nombreCompleto}. ¿En qué puedo ayudarte?`,
				timestamp: new Date()
			}]);
		} catch (err) {
			console.error('Error al borrar historial:', err);
			alert('No se pudo borrar el historial');
		}
	};

	// Manejar Enter
	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			enviarMensaje();
		}
	};

	// Si no hay paciente seleccionado
	if (!pacienteSeleccionado) {
		return (
			<div className="chatbot-container">
				<div className="chatbot-empty-state">
					<IoChatbubbleEllipsesOutline size={64} color="#CBD5E1" />
					<h3>Selecciona un paciente</h3>
					<p>Para usar el chatbot, primero debes seleccionar un paciente desde el menú superior.</p>
				</div>
			</div>
		);
	}

	// Si está cargando
	if (loading) {
		return (
			<div className="chatbot-container">
				<div className="chatbot-loading">
					<p>Cargando historial...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="chatbot-container">
			{/* Header con botón de borrar historial */}
			<div className="chatbot-header">
				<h3>Chat sobre el paciente: {pacienteSeleccionado.nombreCompleto}</h3>
				{mensajes.length > 1 && (
					<button
						className="chatbot-btn-borrar"
						onClick={borrarHistorial}
						title="Borrar historial"
					>
						<IoTrashOutline />
					</button>
				)}
			</div>

			{/* Error message */}
			{error && (
				<div className="chatbot-error">
					{error}
				</div>
			)}

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
