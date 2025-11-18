# Servicio de Notificaciones - React Native

## Resumen de la Migración

El servicio de notificaciones ha sido completamente migrado de APIs web a React Native usando `expo-notifications`.

### Archivos

- **Archivo principal**: `frontend/src/services/notificationService.js`
- **Respaldo web**: `frontend/src/services/notificationService.web.js`

---

## Características Principales

### 1. Gestión de Permisos

- ✅ Solicitud de permisos en dispositivos físicos
- ✅ Validación de dispositivos (no funciona en simuladores)
- ✅ Configuración de canales de Android (default y urgent)
- ✅ Soporte para iOS y Android

### 2. Notificaciones Locales

#### Medicamentos
- Notificaciones diarias recurrentes
- Configuración por hora específica (formato 24h)
- Soporte para dosis opcionales
- Persistencia del mapeo en AsyncStorage

#### Citas Médicas
- Notificaciones únicas (no recurrentes)
- Recordatorio X minutos antes (por defecto 60 min)
- Información de lugar opcional
- Validación de fechas futuras

### 3. Notificaciones Push (Remotas)

- ✅ Obtención de token Expo Push
- ✅ Guardado de token en AsyncStorage
- ✅ Recuperación de token guardado
- ⚠️ Requiere configurar `projectId` de Expo

### 4. Gestión Avanzada

- **Cancelación**: Por ID de notificación o ID de recurso
- **Consulta**: Listar todas las notificaciones programadas
- **Sincronización**: Limpieza automática de mapeos obsoletos
- **Testing**: Envío de notificaciones inmediatas

---

## API Pública

### Funciones Exportadas

```javascript
// Permisos
solicitarPermisosNotificaciones() → Promise<boolean>
obtenerTokenPush() → Promise<string|null>
obtenerTokenPushGuardado() → Promise<string|null>

// Programar notificaciones
programarNotificacionMedicamento(medicamento) → Promise<string|null>
programarNotificacionCita(cita, minutosAntes=60) → Promise<string|null>

// Cancelar notificaciones
cancelarNotificacion(notificationId) → Promise<boolean>
cancelarNotificacionPorRecurso(recursoId, tipo) → Promise<boolean>
cancelarTodasLasNotificaciones() → Promise<boolean>

// Consultar notificaciones
obtenerNotificacionesProgramadas() → Promise<Array>
existeNotificacion(recursoId, tipo) → Promise<boolean>

// Testing y utilidades
enviarNotificacionInmediata(titulo, cuerpo, data={}) → Promise<string|null>
sincronizarMapeoNotificaciones() → Promise<void>
limpiarNotificacionesPasadas() → Promise<void>
```

---

## Ejemplos de Uso

### 1. Solicitar Permisos (Ejecutar al inicio)

```javascript
import { solicitarPermisosNotificaciones } from './services/notificationService';

const permisos = await solicitarPermisosNotificaciones();
if (permisos) {
  console.log('Usuario otorgó permisos');
} else {
  console.log('Usuario denegó permisos');
}
```

### 2. Programar Medicamento

```javascript
import { programarNotificacionMedicamento } from './services/notificationService';

const notificationId = await programarNotificacionMedicamento({
  id: 123,
  nombre: 'Aspirina',
  horaProgramada: '08:30',
  dosis: '1 pastilla'
});

if (notificationId) {
  console.log('Notificación programada:', notificationId);
}
```

### 3. Programar Cita Médica

```javascript
import { programarNotificacionCita } from './services/notificationService';

const notificationId = await programarNotificacionCita({
  id: 456,
  titulo: 'Consulta con Dr. García',
  fechaHora: '2025-11-20T10:00:00',
  lugar: 'Hospital Central'
}, 60); // 60 minutos antes
```

### 4. Cancelar por Recurso

```javascript
import { cancelarNotificacionPorRecurso } from './services/notificationService';

// Cancelar notificación de un medicamento
await cancelarNotificacionPorRecurso(123, 'medicamento');

// Cancelar notificación de una cita
await cancelarNotificacionPorRecurso(456, 'cita');
```

### 5. Listar Notificaciones Programadas

```javascript
import { obtenerNotificacionesProgramadas } from './services/notificationService';

const notificaciones = await obtenerNotificacionesProgramadas();
console.log(`Total: ${notificaciones.length}`);

notificaciones.forEach(notif => {
  console.log(`ID: ${notif.identifier}`);
  console.log(`Título: ${notif.content.title}`);
  console.log(`Trigger: ${notif.trigger}`);
});
```

### 6. Sincronizar Mapeos (Mantenimiento)

```javascript
import { sincronizarMapeoNotificaciones } from './services/notificationService';

// Ejecutar al iniciar la app o periódicamente
await sincronizarMapeoNotificaciones();
```

---

## Configuración de Android

### Canales de Notificaciones

Se crean automáticamente dos canales:

1. **default** (Recordatorios)
   - Importancia: HIGH
   - Vibración: [0, 250, 250, 250]
   - Color LED: #667eea

2. **urgent** (Urgentes)
   - Importancia: MAX
   - Vibración: [0, 500, 250, 500]
   - Color LED: #FF0000

---

## Persistencia con AsyncStorage

### Keys Utilizadas

- `@cuido_notifications_map`: Mapeo de recursos → IDs de notificaciones
- `@cuido_push_token`: Token de notificaciones push

### Estructura del Mapeo

```json
{
  "medicamento_123": "notification-id-abc",
  "cita_456": "notification-id-def"
}
```

Esto permite cancelar notificaciones usando solo el ID del medicamento/cita, sin necesidad de guardar el ID de notificación en el backend.

---

## Diferencias con la Versión Web

| Característica | Web | React Native |
|---------------|-----|--------------|
| API | Notification API | expo-notifications |
| Permisos | `Notification.requestPermission()` | `Notifications.requestPermissionsAsync()` |
| Programar | ServiceWorker | `scheduleNotificationAsync()` |
| Persistencia | localStorage | AsyncStorage |
| Canales Android | No soportado | Soportado |
| Push Tokens | Manual | Expo Push |
| Simuladores | Funciona limitado | No funciona |

---

## Consideraciones Importantes

### 1. Dispositivos Físicos Requeridos
Las notificaciones **NO funcionan en simuladores/emuladores**. Se requiere un dispositivo físico para testing.

### 2. TODO: Configurar projectId
En la función `obtenerTokenPush()`, reemplazar:
```javascript
projectId: 'your-project-id'
```
con el projectId real de tu proyecto Expo.

### 3. Permisos iOS
Para iOS, agregar a `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ]
  }
}
```

### 4. Permisos Android
Para Android, los permisos se agregan automáticamente por Expo.

---

## Manejo de Errores

Todas las funciones tienen manejo de errores robusto:

- ✅ Validación de parámetros requeridos
- ✅ Validación de formatos (horas, fechas)
- ✅ Try-catch en todas las funciones
- ✅ Logs detallados con prefijo `[Notificaciones]`
- ✅ Retorno de valores seguros (null/false en errores)

---

## Testing

### Notificación Inmediata

```javascript
import { enviarNotificacionInmediata } from './services/notificationService';

// Enviar notificación de prueba
await enviarNotificacionInmediata(
  'Prueba',
  'Esta es una notificación de prueba',
  { custom: 'data' }
);
```

### Verificar Notificaciones Programadas

```javascript
import { obtenerNotificacionesProgramadas } from './services/notificationService';

const notifs = await obtenerNotificacionesProgramadas();
console.log('Notificaciones:', JSON.stringify(notifs, null, 2));
```

---

## Próximos Pasos

1. **Configurar projectId** en `obtenerTokenPush()`
2. **Integrar con backend** para notificaciones push remotas
3. **Agregar listeners** para manejar respuestas del usuario a notificaciones
4. **Implementar badges** personalizados por tipo de notificación
5. **Agregar sonidos** personalizados para diferentes tipos

---

## Dependencias

```json
{
  "expo-notifications": "^latest",
  "expo-device": "^latest",
  "@react-native-async-storage/async-storage": "^latest"
}
```

Asegúrate de tener estas dependencias instaladas:

```bash
npx expo install expo-notifications expo-device @react-native-async-storage/async-storage
```

---

## Soporte

- **React Native**: 0.64+
- **Expo SDK**: 45+
- **iOS**: 10+
- **Android**: 5.0+ (API 21+)
