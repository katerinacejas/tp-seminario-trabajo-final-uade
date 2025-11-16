import React, { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { usePaciente } from '../context/PacienteContext';
import { contactosEmergenciaAPI } from '../services/api';

export default function PanicButton() {
	const { pacienteSeleccionado } = usePaciente();
	const [contactoPrincipal, setContactoPrincipal] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		cargarContactoPrincipal();
	}, [pacienteSeleccionado]);

	const cargarContactoPrincipal = async () => {
		if (!pacienteSeleccionado) {
			setLoading(false);
			return;
		}

		try {
			const contactos = await contactosEmergenciaAPI.getByPaciente(pacienteSeleccionado.id);
			// Buscar el primer contacto con teléfono disponible
			const contactoConTelefono = contactos.find(c => c.telefono);
			setContactoPrincipal(contactoConTelefono);
		} catch (err) {
			console.error('Error al cargar contactos de emergencia:', err);
		} finally {
			setLoading(false);
		}
	};

	const handlePanic = async () => {
		if (!contactoPrincipal || !contactoPrincipal.telefono) {
			alert('No hay contactos de emergencia configurados con teléfono. Por favor, agrega un contacto en la sección de Ficha Médica.');
			return;
		}

		try {
			// Limpiar el número de teléfono (quitar espacios, guiones, paréntesis)
			const telefonoLimpio = contactoPrincipal.telefono.replace(/[\s\-\(\)]/g, '');

			// Crear URL de teléfono
			const telUrl = `tel:${telefonoLimpio}`;

			// Verificar si se puede abrir la URL
			const canOpen = await Linking.canOpenURL(telUrl);

			if (canOpen) {
				await Linking.openURL(telUrl);
			} else {
				alert(`No se pudo iniciar la llamada. Número: ${contactoPrincipal.telefono}`);
			}
		} catch (error) {
			console.error('Error al iniciar llamada de emergencia:', error);
			alert('Error al intentar realizar la llamada de emergencia.');
		}
	};

	if (loading) {
		return null; // No mostrar el botón mientras carga
	}

	return (
		<div className="panic" aria-live="polite">
			<button
				onClick={handlePanic}
				aria-label="Botón de emergencia"
				title={contactoPrincipal ? `Llamar a ${contactoPrincipal.nombre}` : 'Sin contacto de emergencia configurado'}
			>
				<span className="mini">¡Emergencia!</span>
			</button>
		</div>
	);
}
