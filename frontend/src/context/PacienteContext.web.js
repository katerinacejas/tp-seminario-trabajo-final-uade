import React, { createContext, useContext, useEffect, useState } from 'react';
import { pacientesAPI } from '../services/api';

const PacienteContext = createContext(null);

export function PacienteProvider({ children }) {
	const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
	const [pacientes, setPacientes] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Cargar el paciente guardado en localStorage al iniciar
		const savedPacienteId = localStorage.getItem('cuido.pacienteId');
		if (savedPacienteId) {
			cargarPaciente(savedPacienteId);
		} else {
			setLoading(false);
		}

		// Cargar lista de pacientes disponibles
		cargarListaPacientes();
	}, []);

	const cargarPaciente = async (pacienteId) => {
		try {
			setLoading(true);
			const data = await pacientesAPI.getById(pacienteId);
			setPacienteSeleccionado(data);
			localStorage.setItem('cuido.pacienteId', pacienteId);
		} catch (error) {
			console.error('Error al cargar paciente:', error);
			localStorage.removeItem('cuido.pacienteId');
		} finally {
			setLoading(false);
		}
	};

	const cargarListaPacientes = async () => {
		try {
			const data = await pacientesAPI.getAll();
			setPacientes(data);

			// Si no hay paciente seleccionado pero hay pacientes, seleccionar el primero
			if (!pacienteSeleccionado && data.length > 0) {
				seleccionarPaciente(data[0].id);
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
