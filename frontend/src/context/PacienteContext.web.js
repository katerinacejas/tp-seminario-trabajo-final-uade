import React, { createContext, useContext, useEffect, useState } from 'react';
import { pacientesAPI, cuidadoresPacientesAPI, usuariosAPI } from '../services/api';

const PacienteContext = createContext(null);

export function PacienteProvider({ children }) {
	const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
	const [pacientes, setPacientes] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Cargar inicial: primero obtener lista de pacientes, luego validar localStorage
		const cargarInicial = async () => {
			try {
				setLoading(true);

				// Obtener rol del usuario
				const role = localStorage.getItem('cuido.role')?.toLowerCase();

				// Si no hay rol, no hacer nada (usuario no logueado)
				if (!role) {
					setPacientes([]);
					setPacienteSeleccionado(null);
					setLoading(false);
					return;
				}

				// Cargar lista de pacientes vinculados
				let pacientesVinculados = [];

				if (role === 'cuidador') {
					const usuario = await usuariosAPI.getMe();
					pacientesVinculados = await cuidadoresPacientesAPI.getPacientesVinculados(usuario.id);
				} else if (role === 'paciente') {
					// Para pacientes: no cargar lista (solo tienen su propio perfil)
					pacientesVinculados = [];
				}

				setPacientes(pacientesVinculados);

				// CRÍTICO: Solo intentar cargar un paciente si hay pacientes vinculados
				const savedPacienteId = localStorage.getItem('cuido.pacienteId');

				if (role === 'cuidador') {
					// Para cuidadores: validar que el paciente guardado existe en la lista
					if (savedPacienteId && pacientesVinculados.some(p => p.id === parseInt(savedPacienteId))) {
						const pacienteExiste = pacientesVinculados.some(p => p.id === parseInt(savedPacienteId));

						if (pacienteExiste) {
							// El paciente guardado es válido, cargarlo
							await cargarPacienteDirecto(savedPacienteId);
						} else {
							// El paciente guardado NO está en la lista vinculada, limpiar y seleccionar el primero
							localStorage.removeItem('cuido.pacienteId');
							await cargarPacienteDirecto(pacientesVinculados[0].id);
						}
					} else if (pacientesVinculados.length > 0) {
						// No hay paciente guardado pero sí hay pacientes vinculados, seleccionar el primero
						await cargarPacienteDirecto(pacientesVinculados[0].id);
					} else {
						// NO hay pacientes vinculados, limpiar todo
						localStorage.removeItem('cuido.pacienteId');
						setPacienteSeleccionado(null);
					}
				} else if (role === 'paciente' && savedPacienteId) {
					// Para pacientes: cargar su propio perfil si existe en localStorage
					await cargarPacienteDirecto(savedPacienteId);
				}

			} catch (error) {
				console.error('Error en carga inicial:', error);
				setPacientes([]);
				setPacienteSeleccionado(null);
				localStorage.removeItem('cuido.pacienteId');
			} finally {
				setLoading(false);
			}
		};

		cargarInicial();
	}, []);

	// Función auxiliar para cargar paciente SIN validaciones (uso interno)
	const cargarPacienteDirecto = async (pacienteId) => {
		try {
			const data = await pacientesAPI.getById(pacienteId);
			setPacienteSeleccionado(data);
			localStorage.setItem('cuido.pacienteId', pacienteId);
		} catch (error) {
			console.error('Error al cargar paciente:', error);
			localStorage.removeItem('cuido.pacienteId');
			setPacienteSeleccionado(null);
			throw error;
		}
	};

	// Función pública para cargar paciente (con validaciones)
	const cargarPaciente = async (pacienteId) => {
		try {
			setLoading(true);

			// Validar que el paciente existe en la lista de pacientes vinculados
			const role = localStorage.getItem('cuido.role')?.toLowerCase();
			if (role === 'cuidador' && pacientes.length > 0) {
				const existeEnLista = pacientes.some(p => p.id === parseInt(pacienteId));
				if (!existeEnLista) {
					console.warn(`Paciente ID ${pacienteId} no está en la lista de pacientes vinculados`);
					localStorage.removeItem('cuido.pacienteId');
					setPacienteSeleccionado(null);
					setLoading(false);
					return;
				}
			}

			await cargarPacienteDirecto(pacienteId);
		} catch (error) {
			console.error('Error al cargar paciente:', error);
			localStorage.removeItem('cuido.pacienteId');
			setPacienteSeleccionado(null);
		} finally {
			setLoading(false);
		}
	};

	// Función para recargar la lista de pacientes (sin auto-selección)
	const cargarListaPacientes = async () => {
		try {
			console.log('ingrese al cargarListaPacientes de PacienteContext.js')
			const role = localStorage.getItem('cuido.role')?.toLowerCase();

			if (!role) {
				setPacientes([]);
				return;
			}

			let data = [];

			if (role === 'cuidador') {
				const usuario = await usuariosAPI.getMe();
				data = await cuidadoresPacientesAPI.getPacientesVinculados(usuario.id);
			} else if (role === 'paciente') {
				data = [];
			}

			setPacientes(data);
		} catch (error) {
			console.log('lo que devuelve el paciente context en cargar lista pacientes es:', role);
			console.error('Error al cargar lista de pacientes:', error);
			setPacientes([]);
		}
	};

	const seleccionarPaciente = (pacienteId) => {
		cargarPaciente(pacienteId);
	};

	const limpiarPaciente = () => {
		setPacienteSeleccionado(null);
		localStorage.removeItem('cuido.pacienteId');
	};

	const value = {
		pacienteSeleccionado,
		pacientes,
		loading,
		seleccionarPaciente,
		limpiarPaciente,
		recargarPaciente: () => pacienteSeleccionado && cargarPaciente(pacienteSeleccionado.id),
		cargarListaPacientes,   
	};

	return <PacienteContext.Provider value={value}>{children}</PacienteContext.Provider>;
}

export function usePaciente() {
	const context = useContext(PacienteContext);
	if (!context) {
		throw new Error('usePaciente debe usarse dentro de PacienteProvider');
	}
	return context;
}
