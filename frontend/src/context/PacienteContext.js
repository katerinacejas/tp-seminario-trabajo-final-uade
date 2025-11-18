import React, { createContext, useContext, useEffect, useState } from 'react';
import { pacientesAPI, cuidadoresPacientesAPI, usuariosAPI } from '../services/api';

const PacienteContext = createContext(null);

export function PacienteProvider({ children }) {
	const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
	const [pacientes, setPacientes] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Primero cargar lista de pacientes disponibles
		const cargarInicial = async () => {
			await cargarListaPacientes();

			// Luego intentar cargar el paciente guardado en localStorage
			const savedPacienteId = localStorage.getItem('cuido.pacienteId');
			if (savedPacienteId) {
				// Solo cargar si el usuario tiene pacientes vinculados
				const role = localStorage.getItem('cuido.role')?.toLowerCase();
				if (role === 'cuidador') {
					// Esperar un momento para que pacientes esté actualizado
					setTimeout(() => {
						cargarPaciente(savedPacienteId);
					}, 100);
				} else {
					cargarPaciente(savedPacienteId);
				}
			} else {
				setLoading(false);
			}
		};

		cargarInicial();
	}, []);

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

			const data = await pacientesAPI.getById(pacienteId);
			setPacienteSeleccionado(data);
			localStorage.setItem('cuido.pacienteId', pacienteId);
		} catch (error) {
			console.error('Error al cargar paciente:', error);
			localStorage.removeItem('cuido.pacienteId');
			setPacienteSeleccionado(null);
		} finally {
			setLoading(false);
		}
	};

	const cargarListaPacientes = async () => {
		try {
			// Obtener rol del usuario (normalizar a minúsculas por si acaso)
			const role = localStorage.getItem('cuido.role')?.toLowerCase();

			// Si no hay rol, no hacer nada (usuario no logueado)
			if (!role) {
				setPacientes([]);
				return;
			}

			let data = [];

			if (role === 'cuidador') {
				// Para cuidadores: obtener pacientes vinculados
				const usuario = await usuariosAPI.getMe();
				data = await cuidadoresPacientesAPI.getPacientesVinculados(usuario.id);
			} else if (role === 'paciente') {
				// Para pacientes: no cargar lista (solo tienen su propio perfil)
				data = [];
			}
			// Removido el caso default para admin

			setPacientes(data);

			// Si no hay paciente seleccionado pero hay pacientes vinculados, seleccionar el primero
			// SOLO para cuidadores que tienen pacientes
			if (!pacienteSeleccionado && data.length > 0 && role === 'cuidador') {
				// Verificar que no haya un pacienteId inválido en localStorage
				const savedPacienteId = localStorage.getItem('cuido.pacienteId');
				if (!savedPacienteId || !data.some(p => p.id === parseInt(savedPacienteId))) {
					seleccionarPaciente(data[0].id);
				}
			}
		} catch (error) {
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
