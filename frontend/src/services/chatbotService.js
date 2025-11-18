/**
 * Servicio para interactuar con el microservicio de chatbot.
 */

const CHATBOT_API_URL = 'http://localhost:5000/api/chatbot';
const BACKEND_API_URL = 'http://localhost:8080';

/**
 * Obtiene el token JWT del localStorage.
 */
const getToken = () => {
  return localStorage.getItem('cuido.token');
};

/**
 * Envía un mensaje al chatbot y recibe una respuesta.
 *
 * @param {string} mensaje - Mensaje del usuario
 * @param {number} pacienteId - ID del paciente seleccionado
 * @returns {Promise<Object>} Respuesta del chatbot
 */
export const enviarMensaje = async (mensaje, pacienteId) => {
  const token = getToken();

  if (!token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión.');
  }

  const response = await fetch(`${CHATBOT_API_URL}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      mensaje,
      paciente_id: pacienteId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al enviar el mensaje');
  }

  return await response.json();
};

/**
 * Obtiene el historial de conversaciones con un paciente.
 *
 * @param {number} pacienteId - ID del paciente
 * @returns {Promise<Array>} Historial de conversaciones
 */
export const obtenerHistorial = async (pacienteId) => {
  const token = getToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  const response = await fetch(`${CHATBOT_API_URL}/history/${pacienteId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al obtener el historial');
  }

  const data = await response.json();
  return data.conversaciones || [];
};

/**
 * Borra el historial de conversaciones con un paciente.
 *
 * @param {number} pacienteId - ID del paciente
 * @returns {Promise<Object>} Confirmación
 */
export const borrarHistorial = async (pacienteId) => {
  const token = getToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  const response = await fetch(`${CHATBOT_API_URL}/history/${pacienteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al borrar el historial');
  }

  return await response.json();
};

/**
 * Verifica el estado del microservicio de chatbot.
 *
 * @returns {Promise<Object>} Estado del servicio
 */
export const verificarEstadoChatbot = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    if (!response.ok) {
      throw new Error('Chatbot no disponible');
    }
    return await response.json();
  } catch (error) {
    throw new Error('No se pudo conectar con el chatbot. Verifica que esté ejecutándose.');
  }
};

/**
 * Obtiene la información del usuario autenticado desde el backend.
 *
 * @returns {Promise<Object>} Datos del usuario
 */
export const obtenerUsuarioActual = async () => {
  const token = getToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  const response = await fetch(`${BACKEND_API_URL}/api/usuarios/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener información del usuario');
  }

  return await response.json();
};
