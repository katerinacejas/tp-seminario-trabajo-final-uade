// API Service para comunicación con el backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/**
 * Wrapper para fetch con manejo de errores y autenticación
 */
async function apiRequest(endpoint, options = {}) {
	const token = localStorage.getItem('cuido.token');

	const config = {
		headers: {
			'Content-Type': 'application/json',
			...(token && { 'Authorization': `Bearer ${token}` }),
			...options.headers,
		},
		...options,
	};

	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

		// Si es 401, el token expiró o es inválido
		if (response.status === 401) {
			localStorage.removeItem('cuido.token');
			localStorage.removeItem('cuido.role');
			window.location.href = '/login';
			throw new Error('Sesión expirada');
		}

		// Si es 204 (No Content), no intentar parsear JSON
		if (response.status === 204) {
			return null;
		}

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || `Error ${response.status}`);
		}

		return data;
	} catch (error) {
		console.error('API Error:', error);
		throw error;
	}
}

// ==================== AUTENTICACIÓN ====================

export const authAPI = {
	login: async (email, password) => {
		return apiRequest('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
	},

	register: async (userData) => {
		return apiRequest('/auth/register', {
			method: 'POST',
			body: JSON.stringify(userData),
		});
	},
};

// ==================== USUARIOS ====================

export const usuariosAPI = {
	getMe: async () => {
		return apiRequest('/usuarios/me');
	},

	getAll: async () => {
		return apiRequest('/usuarios');
	},

	getByEmail: async (email) => {
		return apiRequest(`/usuarios/buscar?mail=${email}`);
	},

	update: async (id, userData) => {
		return apiRequest(`/usuarios/${id}`, {
			method: 'PUT',
			body: JSON.stringify(userData),
		});
	},

	delete: async (id) => {
		return apiRequest(`/usuarios/${id}`, {
			method: 'DELETE',
		});
	},
};

// ==================== RECORDATORIOS ====================

export const recordatoriosAPI = {
	// Obtener recordatorios (vista unificada)
	getByPaciente: async (pacienteId) => {
		return apiRequest(`/recordatorios/paciente/${pacienteId}`);
	},

	getDelDia: async (pacienteId, fecha) => {
		const fechaStr = fecha instanceof Date ? fecha.toISOString().split('T')[0] : fecha;
		return apiRequest(`/recordatorios/paciente/${pacienteId}/dia?fecha=${fechaStr}`);
	},

	getByRango: async (pacienteId, fechaInicio, fechaFin) => {
		const inicioStr = fechaInicio instanceof Date ? fechaInicio.toISOString() : fechaInicio;
		const finStr = fechaFin instanceof Date ? fechaFin.toISOString() : fechaFin;
		return apiRequest(`/recordatorios/paciente/${pacienteId}/rango?inicio=${inicioStr}&fin=${finStr}`);
	},

	getPendientes: async (pacienteId) => {
		return apiRequest(`/recordatorios/paciente/${pacienteId}/pendientes`);
	},

	// Actualizar estado
	actualizarEstado: async (recordatorioId, estado) => {
		return apiRequest(`/recordatorios/${recordatorioId}/estado`, {
			method: 'PATCH',
			body: JSON.stringify({ estado }),
		});
	},

	ciclarEstado: async (recordatorioId) => {
		return apiRequest(`/recordatorios/${recordatorioId}/ciclar-estado`, {
			method: 'PATCH',
		});
	},

	// Eliminar instancia
	eliminar: async (recordatorioId) => {
		return apiRequest(`/recordatorios/${recordatorioId}`, {
			method: 'DELETE',
		});
	},
};

// ==================== MEDICAMENTOS ====================

export const medicamentosAPI = {
	crear: async (medicamentoData) => {
		return apiRequest('/recordatorios/medicamentos', {
			method: 'POST',
			body: JSON.stringify(medicamentoData),
		});
	},

	getByPaciente: async (pacienteId, soloActivos = false) => {
		const url = `/recordatorios/medicamentos/paciente/${pacienteId}${soloActivos ? '?soloActivos=true' : ''}`;
		return apiRequest(url);
	},

	getById: async (medicamentoId) => {
		return apiRequest(`/recordatorios/medicamentos/${medicamentoId}`);
	},

	desactivar: async (medicamentoId) => {
		return apiRequest(`/recordatorios/medicamentos/${medicamentoId}/desactivar`, {
			method: 'PATCH',
		});
	},

	eliminar: async (medicamentoId) => {
		return apiRequest(`/recordatorios/medicamentos/${medicamentoId}`, {
			method: 'DELETE',
		});
	},
};

// ==================== CITAS MÉDICAS ====================

export const citasAPI = {
	crear: async (citaData) => {
		return apiRequest('/recordatorios/citas', {
			method: 'POST',
			body: JSON.stringify(citaData),
		});
	},

	getByPaciente: async (pacienteId) => {
		return apiRequest(`/recordatorios/citas/paciente/${pacienteId}`);
	},

	getById: async (citaId) => {
		return apiRequest(`/recordatorios/citas/${citaId}`);
	},

	eliminar: async (citaId) => {
		return apiRequest(`/recordatorios/citas/${citaId}`, {
			method: 'DELETE',
		});
	},
};

// ==================== BITÁCORAS ====================

export const bitacorasAPI = {
	/**
	 * POST /api/bitacoras
	 * Crear una nueva bitácora
	 */
	crear: async (bitacoraData) => {
		return apiRequest('/bitacoras', {
			method: 'POST',
			body: JSON.stringify(bitacoraData),
		});
	},

	/**
	 * GET /api/bitacoras/paciente/{pacienteId}
	 * Obtener todas las bitácoras de un paciente
	 */
	getByPaciente: async (pacienteId) => {
		return apiRequest(`/bitacoras/paciente/${pacienteId}`);
	},

	/**
	 * GET /api/bitacoras/paciente/{pacienteId}/rango?inicio=...&fin=...
	 * Obtener bitácoras de un paciente en un rango de fechas
	 */
	getByPacienteYRango: async (pacienteId, fechaInicio, fechaFin) => {
		const inicioStr = fechaInicio instanceof Date
			? fechaInicio.toISOString().split('T')[0]
			: fechaInicio;
		const finStr = fechaFin instanceof Date
			? fechaFin.toISOString().split('T')[0]
			: fechaFin;
		return apiRequest(`/bitacoras/paciente/${pacienteId}/rango?inicio=${inicioStr}&fin=${finStr}`);
	},

	/**
	 * GET /api/bitacoras/mis-bitacoras
	 * Obtener todas las bitácoras creadas por el cuidador autenticado
	 */
	getMisBitacoras: async () => {
		return apiRequest('/bitacoras/mis-bitacoras');
	},

	/**
	 * GET /api/bitacoras/{id}
	 * Obtener una bitácora por ID
	 */
	getById: async (bitacoraId) => {
		return apiRequest(`/bitacoras/${bitacoraId}`);
	},

	/**
	 * PUT /api/bitacoras/{id}
	 * Actualizar una bitácora existente
	 */
	actualizar: async (bitacoraId, bitacoraData) => {
		return apiRequest(`/bitacoras/${bitacoraId}`, {
			method: 'PUT',
			body: JSON.stringify(bitacoraData),
		});
	},

	/**
	 * DELETE /api/bitacoras/{id}
	 * Eliminar una bitácora
	 */
	eliminar: async (bitacoraId) => {
		return apiRequest(`/bitacoras/${bitacoraId}`, {
			method: 'DELETE',
		});
	},
};

// ==================== DOCUMENTOS ====================

export const documentosAPI = {
	/**
	 * POST /api/documentos (multipart/form-data)
	 * Subir un documento
	 */
	subir: async (formData) => {
		const token = localStorage.getItem('cuido.token');

		const response = await fetch(`${API_BASE_URL}/documentos`, {
			method: 'POST',
			headers: {
				...(token && { 'Authorization': `Bearer ${token}` }),
				// NO incluir Content-Type, el navegador lo setea automáticamente con boundary para multipart
			},
			body: formData, // FormData object
		});

		if (response.status === 401) {
			localStorage.removeItem('cuido.token');
			localStorage.removeItem('cuido.role');
			window.location.href = '/login';
			throw new Error('Sesión expirada');
		}

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Error al subir documento' }));
			throw new Error(error.message || 'Error al subir documento');
		}

		return response.json();
	},

	/**
	 * GET /api/documentos/paciente/{pacienteId}
	 * Obtener todos los documentos de un paciente
	 */
	getByPaciente: async (pacienteId) => {
		return apiRequest(`/documentos/paciente/${pacienteId}`);
	},

	/**
	 * GET /api/documentos/paciente/{pacienteId}/fichas
	 * Obtener fichas médicas de un paciente
	 */
	getFichasMedicas: async (pacienteId) => {
		return apiRequest(`/documentos/paciente/${pacienteId}/fichas`);
	},

	/**
	 * GET /api/documentos/paciente/{pacienteId}/otros
	 * Obtener otros documentos (no fichas) de un paciente
	 */
	getOtrosDocumentos: async (pacienteId) => {
		return apiRequest(`/documentos/paciente/${pacienteId}/otros`);
	},

	/**
	 * GET /api/documentos/paciente/{pacienteId}/categoria/{categoria}
	 * Filtrar documentos por categoría (DOCUMENTO, IMAGEN, VIDEO)
	 */
	getByCategoria: async (pacienteId, categoria) => {
		return apiRequest(`/documentos/paciente/${pacienteId}/categoria/${categoria}`);
	},

	/**
	 * GET /api/documentos/{id}
	 * Obtener un documento por ID
	 */
	getById: async (documentoId) => {
		return apiRequest(`/documentos/${documentoId}`);
	},

	/**
	 * GET /api/documentos/{id}/descargar
	 * Descargar/visualizar archivo
	 */
	descargar: (documentoId) => {
		const token = localStorage.getItem('cuido.token');
		return `${API_BASE_URL}/documentos/${documentoId}/descargar${token ? `?token=${token}` : ''}`;
	},

	/**
	 * DELETE /api/documentos/{id}
	 * Eliminar documento
	 */
	eliminar: async (documentoId) => {
		return apiRequest(`/documentos/${documentoId}`, {
			method: 'DELETE',
		});
	},
};

// ==================== TAREAS ====================

export const tareasAPI = {
	/**
	 * POST /api/tareas
	 * Crear una nueva tarea
	 */
	crear: async (tareaData) => {
		return apiRequest('/tareas', {
			method: 'POST',
			body: JSON.stringify(tareaData),
		});
	},

	/**
	 * GET /api/tareas/paciente/{pacienteId}
	 * Obtener todas las tareas de un paciente
	 */
	getByPaciente: async (pacienteId) => {
		return apiRequest(`/tareas/paciente/${pacienteId}`);
	},

	/**
	 * GET /api/tareas/paciente/{pacienteId}/estado?completada=true
	 * Obtener tareas filtradas por estado
	 */
	getByPacienteYEstado: async (pacienteId, completada) => {
		return apiRequest(`/tareas/paciente/${pacienteId}/estado?completada=${completada}`);
	},

	/**
	 * GET /api/tareas/paciente/{pacienteId}/rango?inicio=...&fin=...
	 * Obtener tareas en un rango de fechas
	 */
	getByPacienteYRango: async (pacienteId, fechaInicio, fechaFin) => {
		const inicioStr = fechaInicio instanceof Date
			? fechaInicio.toISOString()
			: fechaInicio;
		const finStr = fechaFin instanceof Date
			? fechaFin.toISOString()
			: fechaFin;
		return apiRequest(`/tareas/paciente/${pacienteId}/rango?inicio=${inicioStr}&fin=${finStr}`);
	},

	/**
	 * GET /api/tareas/{id}
	 * Obtener una tarea por ID
	 */
	getById: async (tareaId) => {
		return apiRequest(`/tareas/${tareaId}`);
	},

	/**
	 * PUT /api/tareas/{id}
	 * Actualizar tarea
	 */
	actualizar: async (tareaId, tareaData) => {
		return apiRequest(`/tareas/${tareaId}`, {
			method: 'PUT',
			body: JSON.stringify(tareaData),
		});
	},

	/**
	 * PATCH /api/tareas/{id}/toggle
	 * Toggle completada
	 */
	toggleCompletada: async (tareaId) => {
		return apiRequest(`/tareas/${tareaId}/toggle`, {
			method: 'PATCH',
		});
	},

	/**
	 * PATCH /api/tareas/{id}/mover-arriba
	 * Mover tarea hacia arriba
	 */
	moverArriba: async (tareaId) => {
		return apiRequest(`/tareas/${tareaId}/mover-arriba`, {
			method: 'PATCH',
		});
	},

	/**
	 * PATCH /api/tareas/{id}/mover-abajo
	 * Mover tarea hacia abajo
	 */
	moverAbajo: async (tareaId) => {
		return apiRequest(`/tareas/${tareaId}/mover-abajo`, {
			method: 'PATCH',
		});
	},

	/**
	 * DELETE /api/tareas/{id}
	 * Eliminar tarea
	 */
	eliminar: async (tareaId) => {
		return apiRequest(`/tareas/${tareaId}`, {
			method: 'DELETE',
		});
	},
};

export default {
	auth: authAPI,
	usuarios: usuariosAPI,
	recordatorios: recordatoriosAPI,
	medicamentos: medicamentosAPI,
	citas: citasAPI,
	bitacoras: bitacorasAPI,
	documentos: documentosAPI,
	tareas: tareasAPI,
};
