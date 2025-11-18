import React, { useState, useEffect, useRef } from "react";
import { enviarMensaje, obtenerHistorial, borrarHistorial, verificarEstadoChatbot } from "../../services/chatbotService";

/**
 * Componente de Chatbot mejorado con integración al microservicio Python.
 *
 * Características:
 * - Conexión real con el microservicio de chatbot
 * - Historial persistente en BD
 * - Indicadores de carga en español
 * - Manejo de errores resiliente
 * - Soporte para Markdown (si se instala react-markdown)
 */
export default function ChatbotMejorado({ pacienteId }) {
	const [input, setInput] = useState("");
	const [msgs, setMsgs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");
	const [error, setError] = useState(null);
	const [chatbotStatus, setChatbotStatus] = useState(null);
	const messagesEndRef = useRef(null);

	// Auto-scroll al último mensaje
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [msgs]);

	// Verificar estado del chatbot al montar
	useEffect(() => {
		checkChatbotStatus();
		cargarHistorial();
	}, [pacienteId]);

	/**
	 * Verifica el estado del microservicio de chatbot
	 */
	const checkChatbotStatus = async () => {
		try {
			const status = await verificarEstadoChatbot();
			setChatbotStatus(status);
			if (status.status !== "healthy") {
				setError("⚠️ El chatbot está disponible pero algunos servicios pueden no funcionar correctamente.");
			}
		} catch (err) {
			setChatbotStatus(null);
			setError("❌ El chatbot no está disponible. Verifica que el microservicio esté ejecutándose en http://localhost:5000");
		}
	};

	/**
	 * Carga el historial de conversaciones desde la BD
	 */
	const cargarHistorial = async () => {
		if (!pacienteId) return;

		try {
			setLoadingMessage("Cargando historial...");
			const historial = await obtenerHistorial(pacienteId);

			// Convertir historial a formato de mensajes
			const mensajes = [];
			historial.forEach(conv => {
				mensajes.push({
					role: "user",
					text: conv.mensaje,
					timestamp: conv.timestamp
				});
				mensajes.push({
					role: "bot",
					text: conv.respuesta,
					timestamp: conv.timestamp
				});
			});

			setMsgs(mensajes);
			setLoadingMessage("");
		} catch (err) {
			console.error("Error al cargar historial:", err);
			// No mostramos error porque es opcional
			setMsgs([
				{ role: "bot", text: "Hola, soy el asistente de Cuido. ¿En qué puedo ayudarte hoy?" }
			]);
			setLoadingMessage("");
		}
	};

	/**
	 * Envía un mensaje al chatbot
	 */
	const send = async () => {
		if (!input.trim()) return;
		if (!pacienteId) {
			setError("❌ Selecciona un paciente primero");
			return;
		}

		const userMessage = input.trim();
		setInput("");
		setError(null);

		// Agregar mensaje del usuario inmediatamente
		setMsgs(prev => [...prev, { role: "user", text: userMessage }]);

		// Mostrar indicador de carga
		setLoading(true);
		setLoadingMessage("Pensando...");

		try {
			// Cambiar mensaje de carga según la intención detectada
			if (userMessage.toLowerCase().includes("documento") || userMessage.toLowerCase().includes("ficha")) {
				setLoadingMessage("Leyendo documentos...");
			} else if (userMessage.toLowerCase().includes("medicamento") || userMessage.toLowerCase().includes("cita")) {
				setLoadingMessage("Consultando información...");
			} else {
				setLoadingMessage("Generando respuesta...");
			}

			// Enviar al chatbot
			const response = await enviarMensaje(userMessage, pacienteId);

			// Agregar respuesta del bot
			setMsgs(prev => [...prev, {
				role: "bot",
				text: response.respuesta,
				timestamp: response.timestamp,
				pacienteNombre: response.paciente_nombre
			}]);

		} catch (err) {
			console.error("Error al enviar mensaje:", err);
			setError(`❌ ${err.message}`);

			// Agregar mensaje de error como respuesta del bot
			setMsgs(prev => [...prev, {
				role: "bot",
				text: `Lo siento, ocurrió un error: ${err.message}\n\nVerifica que:\n- El microservicio de chatbot esté ejecutándose\n- LM Studio esté activo\n- Tengas permisos sobre este paciente`,
				isError: true
			}]);
		} finally {
			setLoading(false);
			setLoadingMessage("");
		}
	};

	/**
	 * Borra el historial de conversaciones
	 */
	const limpiarHistorial = async () => {
		if (!window.confirm("¿Estás seguro de que quieres borrar todo el historial de conversación con este paciente?")) {
			return;
		}

		try {
			await borrarHistorial(pacienteId);
			setMsgs([
				{ role: "bot", text: "Historial borrado. ¿En qué puedo ayudarte?" }
			]);
		} catch (err) {
			setError(`❌ Error al borrar historial: ${err.message}`);
		}
	};

	/**
	 * Maneja Enter para enviar
	 */
	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	};

	/**
	 * Renderiza un mensaje con formato básico de Markdown
	 * (versión simple sin dependencias adicionales)
	 */
	const renderMessage = (text) => {
		if (!text) return null;

		// Convertir negritas **texto** a <strong>
		let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

		// Convertir listas - item a <li>
		formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');

		// Envolver listas en <ul>
		formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

		// Convertir saltos de línea
		formatted = formatted.replace(/\n/g, '<br/>');

		return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
	};

	return (
		<div className="card">
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
				<h2>🤖 Chatbot Cuido</h2>
				<div style={{ display: "flex", gap: 8 }}>
					{chatbotStatus && (
						<span style={{
							fontSize: 12,
							padding: "4px 8px",
							borderRadius: 4,
							background: chatbotStatus.status === "healthy" ? "#d1fae5" : "#fee2e2",
							color: chatbotStatus.status === "healthy" ? "#065f46" : "#991b1b"
						}}>
							{chatbotStatus.status === "healthy" ? "✅ Conectado" : "⚠️ Degradado"}
						</span>
					)}
					{msgs.length > 1 && (
						<button
							className="btn"
							onClick={limpiarHistorial}
							style={{ fontSize: 12, padding: "4px 12px" }}
						>
							🗑️ Borrar historial
						</button>
					)}
				</div>
			</div>

			{error && (
				<div style={{
					padding: 12,
					marginBottom: 12,
					background: "#fef2f2",
					border: "1px solid #fecaca",
					borderRadius: 8,
					color: "#991b1b",
					fontSize: 14
				}}>
					{error}
				</div>
			)}

			{/* Área de mensajes */}
			<div style={{
				minHeight: 400,
				maxHeight: 600,
				padding: 16,
				border: "1px solid #e5e7eb",
				borderRadius: 10,
				background: "#f9fafb",
				overflowY: "auto",
				marginBottom: 16
			}}>
				{msgs.map((m, i) => (
					<div
						key={i}
						style={{
							margin: "12px 0",
							display: "flex",
							flexDirection: "column",
							alignItems: m.role === "bot" ? "flex-start" : "flex-end"
						}}
					>
						<div style={{
							maxWidth: "80%",
							padding: "12px 16px",
							borderRadius: 12,
							background: m.role === "bot"
								? (m.isError ? "#fee2e2" : "#eef6ff")
								: "#e2e8f0",
							color: m.isError ? "#991b1b" : "#1f2937"
						}}>
							<div style={{
								fontSize: 11,
								fontWeight: 600,
								marginBottom: 4,
								color: m.role === "bot" ? "#3b82f6" : "#64748b"
							}}>
								{m.role === "bot" ? "🤖 Cuido" : "👤 Tú"}
							</div>
							<div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
								{renderMessage(m.text)}
							</div>
							{m.timestamp && (
								<div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
									{new Date(m.timestamp).toLocaleTimeString('es-AR')}
								</div>
							)}
						</div>
					</div>
				))}

				{/* Indicador de carga */}
				{loading && (
					<div style={{
						margin: "12px 0",
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-start"
					}}>
						<div style={{
							padding: "12px 16px",
							borderRadius: 12,
							background: "#eef6ff",
							color: "#1f2937"
						}}>
							<div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: "#3b82f6" }}>
								🤖 Cuido
							</div>
							<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<span className="loading-dots">●●●</span>
								<span style={{ fontSize: 14, color: "#64748b", fontStyle: "italic" }}>
									{loadingMessage}
								</span>
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input de mensaje */}
			<div style={{ display: "flex", gap: 8 }}>
				<input
					className="input"
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Pregunta sobre medicamentos, citas, bitácoras, documentos..."
					disabled={loading || !pacienteId}
					style={{ flex: 1 }}
				/>
				<button
					className="btn primary"
					onClick={send}
					disabled={loading || !input.trim() || !pacienteId}
					style={{ minWidth: 100 }}
				>
					{loading ? "..." : "Enviar"}
				</button>
			</div>

			{!pacienteId && (
				<div style={{
					marginTop: 12,
					padding: 8,
					background: "#fef3c7",
					border: "1px solid #fde047",
					borderRadius: 8,
					color: "#92400e",
					fontSize: 13,
					textAlign: "center"
				}}>
					⚠️ Selecciona un paciente para usar el chatbot
				</div>
			)}

			{/* Estilos para animación de loading */}
			<style>{`
				@keyframes blink {
					0%, 20% { opacity: 0.2; }
					50% { opacity: 1; }
					100% { opacity: 0.2; }
				}
				.loading-dots {
					animation: blink 1.4s infinite;
					font-size: 20px;
					color: #3b82f6;
				}
			`}</style>
		</div>
	);
}
