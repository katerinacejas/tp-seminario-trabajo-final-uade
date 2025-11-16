import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

/**
 * Solicita permisos para enviar notificaciones
 */
export async function solicitarPermisosNotificaciones() {
	if (!Device.isDevice) {
		console.warn('Las notificaciones solo funcionan en dispositivos físicos');
		return false;
	}

	try {
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== 'granted') {
			console.warn('No se otorgaron permisos para notificaciones');
			return false;
		}

		// Configurar el canal de notificaciones para Android
		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('default', {
				name: 'Recordatorios',
				importance: Notifications.AndroidImportance.HIGH,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#667eea',
			});
		}

		return true;
	} catch (error) {
		console.error('Error al solicitar permisos de notificaciones:', error);
		return false;
	}
}

/**
 * Programa una notificación para un medicamento
 * @param {Object} medicamento - Objeto con información del medicamento
 * @param {string} medicamento.nombre - Nombre del medicamento
 * @param {string} medicamento.horaProgramada - Hora en formato "HH:mm"
 * @param {number} medicamento.id - ID del medicamento
 */
export async function programarNotificacionMedicamento(medicamento) {
	try {
		// Parsear la hora programada
		const [horas, minutos] = medicamento.horaProgramada.split(':').map(Number);

		// Calcular el tiempo hasta la notificación
		const ahora = new Date();
		const horaMedicamento = new Date();
		horaMedicamento.setHours(horas, minutos, 0, 0);

		// Si la hora ya pasó hoy, programar para mañana
		if (horaMedicamento < ahora) {
			horaMedicamento.setDate(horaMedicamento.getDate() + 1);
		}

		const segundosHastaNotificacion = Math.floor((horaMedicamento - ahora) / 1000);

		// Programar la notificación
		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title: '=Š Hora de tomar tu medicamento',
				body: `Es hora de tomar: ${medicamento.nombre}`,
				data: {
					type: 'medicamento',
					medicamentoId: medicamento.id,
					nombre: medicamento.nombre
				},
				sound: true,
				priority: Notifications.AndroidNotificationPriority.HIGH,
			},
			trigger: {
				seconds: segundosHastaNotificacion,
				repeats: true,
				// Repetir diariamente
				type: Notifications.SchedulableTriggerInputTypes.DAILY,
			},
		});

		console.log(` Notificación programada para medicamento ${medicamento.nombre}: ID ${notificationId}`);
		return notificationId;
	} catch (error) {
		console.error('Error al programar notificación de medicamento:', error);
		return null;
	}
}

/**
 * Programa una notificación 1 hora antes de una cita médica
 * @param {Object} cita - Objeto con información de la cita
 * @param {string} cita.titulo - Título de la cita
 * @param {string} cita.fechaHora - Fecha y hora en formato ISO
 * @param {string} cita.lugar - Lugar de la cita
 * @param {number} cita.id - ID de la cita
 */
export async function programarNotificacionCita(cita) {
	try {
		// Parsear la fecha y hora de la cita
		const fechaCita = new Date(cita.fechaHora);

		// Calcular 1 hora antes
		const fechaNotificacion = new Date(fechaCita);
		fechaNotificacion.setHours(fechaNotificacion.getHours() - 1);

		const ahora = new Date();

		// Solo programar si la notificación es en el futuro
		if (fechaNotificacion <= ahora) {
			console.log('La cita ya pasó o es muy pronto, no se programa notificación');
			return null;
		}

		const segundosHastaNotificacion = Math.floor((fechaNotificacion - ahora) / 1000);

		// Programar la notificación
		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title: '=Å Recordatorio de cita médica',
				body: `En 1 hora: ${cita.titulo}${cita.lugar ? ` en ${cita.lugar}` : ''}`,
				data: {
					type: 'cita',
					citaId: cita.id,
					titulo: cita.titulo,
					lugar: cita.lugar
				},
				sound: true,
				priority: Notifications.AndroidNotificationPriority.HIGH,
			},
			trigger: {
				seconds: segundosHastaNotificacion,
			},
		});

		console.log(` Notificación programada para cita ${cita.titulo}: ID ${notificationId}`);
		return notificationId;
	} catch (error) {
		console.error('Error al programar notificación de cita:', error);
		return null;
	}
}

/**
 * Cancela una notificación programada
 * @param {string} notificationId - ID de la notificación a cancelar
 */
export async function cancelarNotificacion(notificationId) {
	try {
		await Notifications.cancelScheduledNotificationAsync(notificationId);
		console.log(` Notificación cancelada: ${notificationId}`);
	} catch (error) {
		console.error('Error al cancelar notificación:', error);
	}
}

/**
 * Cancela todas las notificaciones programadas
 */
export async function cancelarTodasLasNotificaciones() {
	try {
		await Notifications.cancelAllScheduledNotificationsAsync();
		console.log(' Todas las notificaciones canceladas');
	} catch (error) {
		console.error('Error al cancelar todas las notificaciones:', error);
	}
}

/**
 * Obtiene todas las notificaciones programadas
 */
export async function obtenerNotificacionesProgramadas() {
	try {
		const notificaciones = await Notifications.getAllScheduledNotificationsAsync();
		console.log(`=Ë Notificaciones programadas: ${notificaciones.length}`);
		return notificaciones;
	} catch (error) {
		console.error('Error al obtener notificaciones programadas:', error);
		return [];
	}
}

/**
 * Envía una notificación inmediata (para testing)
 * @param {string} titulo - Título de la notificación
 * @param {string} cuerpo - Cuerpo de la notificación
 */
export async function enviarNotificacionInmediata(titulo, cuerpo) {
	try {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: titulo,
				body: cuerpo,
				sound: true,
			},
			trigger: null, // null = inmediato
		});
		console.log(' Notificación enviada inmediatamente');
	} catch (error) {
		console.error('Error al enviar notificación inmediata:', error);
	}
}
