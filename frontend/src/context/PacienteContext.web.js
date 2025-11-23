import React, { createContext, useContext, useEffect, useState } from 'react';
import { pacientesAPI, cuidadoresPacientesAPI, usuariosAPI } from '../services/api';
import { useAuth } from '../auth';

const PacienteContext = createContext(null);

export function PacienteProvider({ children }) {
	const { role } = useAuth(); // 👈 viene del AuthProvider ("cuidador" | "paciente" | null)

	const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
	const [pacientes, setPacientes] = useState([]);
	const [loading, setLoading] = useState(true);

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

	useEffect(() => {
		const cargarInicial = async () => {
			try {
				setLoading(true);

				// Si no hay rol, usuario no logueado → limpio todo
				if (!role) {
					setPacientes([]);
					setPacienteSeleccionado(null);
					localStorage.removeItem('cuido.pacienteId');
					return;
				}

				// Cargar lista de pacientes vinculados según rol
				let pacientesVinculados = [];

				if (role === 'cuidador') {
					const usuario = await usuariosAPI.getMe();
					pacientesVinculados = await cuidadoresPacientesAPI.getPacientesVinculados(
						usuario.id
					);
				} else if (role === 'paciente') {
					// Para pacientes: no hay lista, solo su propio perfil
					pacientesVinculados = [];
				}

				setPacientes(pacientesVinculados);

				// Solo intentar cargar un paciente si hay info en localStorage
				const savedPacienteId = localStorage.getItem('cuido.pacienteId');

				if (role === 'cuidador') {
					if (
						savedPacienteId &&
						pacientesVinculados.some(
							(p) => p.id === parseInt(savedPacienteId)
						)
					) {
						// El paciente guardado es válido
						await cargarPacienteDirecto(savedPacienteId);
					} else if (pacientesVinculados.length > 0) {
						// No hay paciente guardado o no es válido → tomo el primero
						await cargarPacienteDirecto(pacientesVinculados[0].id);
					} else {
						// No hay pacientes vinculados
						localStorage.removeItem('cuido.pacienteId');
						setPacienteSeleccionado(null);
					}
				} else if (role === 'paciente' && savedPacienteId) {
					// Para pacientes, si había guardado un id, lo cargo
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
	}, [role]); // 👈 ahora se dispara cada vez que cambias de paciente ↔ cuidador

	// Función pública para cargar paciente (con validaciones)
	const cargarPaciente = async (pacienteId) => {
		try {
			setLoading(true);

			// Validar que el paciente existe en la lista de pacientes vinculados
			if (role === 'cuidador' && pacientes.length > 0) {
				const existeEnLista = pacientes.some(
					(p) => p.id === parseInt(pacienteId)
				);
				if (!existeEnLista) {
					console.warn(
						`Paciente ID ${pacienteId} no está en la lista de pacientes vinculados`
					);
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
			console.log('ingrese al cargarListaPacientes de PacienteContext.js');

			if (!role) {
				setPacientes([]);
				return;
			}

			let data = [];

			if (role === 'cuidador') {
				const usuario = await usuariosAPI.getMe();
				data = await cuidadoresPacientesAPI.getPacientesVinculados(
					usuario.id
				);
			} else if (role === 'paciente') {
				data = [];
			}

			setPacientes(data);
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
		recargarPaciente:
			() => pacienteSeleccionado && cargarPaciente(pacienteSeleccionado.id),
		cargarListaPacientes,
	};

	return (
		<PacienteContext.Provider value={value}>
			{children}
		</PacienteContext.Provider>
	);
}

export function usePaciente() {
	const context = useContext(PacienteContext);
	if (!context) {
		throw new Error('usePaciente debe usarse dentro de PacienteProvider');
	}
	return context;
}
