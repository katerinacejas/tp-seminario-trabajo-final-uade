# Referencia Rápida - Servicio de Notificaciones

## Índice de Funciones

Total: **13 funciones públicas exportadas**

---

## 1. Gestión de Permisos (3 funciones)

### `solicitarPermisosNotificaciones()`
```javascript
const permisos = await solicitarPermisosNotificaciones();
```
- Solicita permisos de notificaciones
- Configura canales de Android automáticamente
- Retorna: `Promise<boolean>`

### `obtenerTokenPush()`
```javascript
const token = await obtenerTokenPush();
```
- Obtiene token Expo Push para notificaciones remotas
- Guarda token en AsyncStorage
- Retorna: `Promise<string|null>`

### `obtenerTokenPushGuardado()`
```javascript
const token = await obtenerTokenPushGuardado();
```
- Lee token guardado desde AsyncStorage
- Retorna: `Promise<string|null>`

---

## 2. Programar Notificaciones (2 funciones)

### `programarNotificacionMedicamento(medicamento)`
```javascript
const notifId = await programarNotificacionMedicamento({
  id: 123,
  nombre: 'Aspirina',
  horaProgramada: '08:30',
  dosis: '1 pastilla' // opcional
});
```
- Programa notificación diaria recurrente
- Formato hora: "HH:mm" (24h)
- Retorna: `Promise<string|null>` (notificationId)

### `programarNotificacionCita(cita, minutosAntes = 60)`
```javascript
const notifId = await programarNotificacionCita({
  id: 456,
  titulo: 'Consulta Dr. García',
  fechaHora: '2025-11-20T10:00:00',
  lugar: 'Hospital Central' // opcional
}, 60);
```
- Programa notificación única (no recurrente)
- Por defecto: 60 minutos antes
- Retorna: `Promise<string|null>` (notificationId)

---

## 3. Cancelar Notificaciones (3 funciones)

### `cancelarNotificacion(notificationId)`
```javascript
await cancelarNotificacion('notification-id-abc');
```
- Cancela por ID de notificación
- Retorna: `Promise<boolean>`

### `cancelarNotificacionPorRecurso(recursoId, tipo)`
```javascript
await cancelarNotificacionPorRecurso(123, 'medicamento');
await cancelarNotificacionPorRecurso(456, 'cita');
```
- Cancela por ID del recurso
- Tipos: `'medicamento'` | `'cita'`
- Retorna: `Promise<boolean>`

### `cancelarTodasLasNotificaciones()`
```javascript
await cancelarTodasLasNotificaciones();
```
- Cancela TODAS las notificaciones programadas
- Limpia AsyncStorage
- Retorna: `Promise<boolean>`

---

## 4. Consultar Notificaciones (2 funciones)

### `obtenerNotificacionesProgramadas()`
```javascript
const notifs = await obtenerNotificacionesProgramadas();
console.log(`Total: ${notifs.length}`);
```
- Retorna todas las notificaciones activas
- Retorna: `Promise<Array>`

### `existeNotificacion(recursoId, tipo)`
```javascript
const existe = await existeNotificacion(123, 'medicamento');
if (!existe) {
  // programar notificación
}
```
- Verifica si existe notificación para un recurso
- Retorna: `Promise<boolean>`

---

## 5. Testing y Utilidades (3 funciones)

### `enviarNotificacionInmediata(titulo, cuerpo, data = {})`
```javascript
await enviarNotificacionInmediata(
  'Prueba',
  'Notificación de prueba',
  { custom: 'data' }
);
```
- Envía notificación inmediata (para testing)
- Retorna: `Promise<string|null>` (notificationId)

### `sincronizarMapeoNotificaciones()`
```javascript
await sincronizarMapeoNotificaciones();
```
- Sincroniza AsyncStorage con notificaciones reales
- Elimina mapeos obsoletos
- Ejecutar al iniciar app o periódicamente
- Retorna: `Promise<void>`

### `limpiarNotificacionesPasadas()`
```javascript
await limpiarNotificacionesPasadas();
```
- Limpia notificaciones pasadas (solo iOS)
- Retorna: `Promise<void>`

---

## Ejemplos Comunes

### Setup Inicial
```javascript
import { solicitarPermisosNotificaciones, sincronizarMapeoNotificaciones } from './services/notificationService';

// Al iniciar la app
useEffect(() => {
  async function init() {
    const permisos = await solicitarPermisosNotificaciones();
    if (permisos) {
      await sincronizarMapeoNotificaciones();
    }
  }
  init();
}, []);
```

### Programar Medicamento
```javascript
import { programarNotificacionMedicamento } from './services/notificationService';

const medicamento = {
  id: 123,
  nombre: 'Aspirina',
  horaProgramada: '08:30',
  dosis: '1 pastilla'
};

const notifId = await programarNotificacionMedicamento(medicamento);
if (notifId) {
  console.log('Programado exitosamente');
}
```

### Programar Cita
```javascript
import { programarNotificacionCita } from './services/notificationService';

const cita = {
  id: 456,
  titulo: 'Consulta Dr. García',
  fechaHora: '2025-11-20T10:00:00',
  lugar: 'Hospital Central'
};

// Notificar 30 minutos antes
const notifId = await programarNotificacionCita(cita, 30);
```

### Cancelar al Eliminar Recurso
```javascript
import { cancelarNotificacionPorRecurso } from './services/notificationService';

async function eliminarMedicamento(medicamentoId) {
  // Cancelar notificación
  await cancelarNotificacionPorRecurso(medicamentoId, 'medicamento');

  // Eliminar del backend
  await api.delete(`/medicamentos/${medicamentoId}`);
}
```

### Verificar Antes de Crear
```javascript
import { existeNotificacion, programarNotificacionMedicamento } from './services/notificationService';

async function programarSiNoExiste(medicamento) {
  const existe = await existeNotificacion(medicamento.id, 'medicamento');

  if (!existe) {
    await programarNotificacionMedicamento(medicamento);
    console.log('Notificación creada');
  } else {
    console.log('Ya existe notificación para este medicamento');
  }
}
```

### Auditoría de Notificaciones
```javascript
import { obtenerNotificacionesProgramadas } from './services/notificationService';

async function auditarNotificaciones() {
  const notifs = await obtenerNotificacionesProgramadas();

  console.log(`Total de notificaciones: ${notifs.length}`);

  notifs.forEach(notif => {
    console.log(`- ${notif.content.title}`);
    console.log(`  ID: ${notif.identifier}`);
    console.log(`  Tipo: ${notif.content.data?.type}`);
    console.log(`  Trigger: ${JSON.stringify(notif.trigger)}`);
  });
}
```

### Limpiar al Cerrar Sesión
```javascript
import { cancelarTodasLasNotificaciones } from './services/notificationService';

async function cerrarSesion() {
  // Cancelar todas las notificaciones
  await cancelarTodasLasNotificaciones();

  // Limpiar token
  await AsyncStorage.removeItem('@cuido_push_token');

  // Logout del backend
  await api.post('/logout');
}
```

---

## Tipos de Datos

### Medicamento
```typescript
{
  id: number;           // Requerido
  nombre: string;       // Requerido
  horaProgramada: string; // Requerido - Formato "HH:mm"
  dosis?: string;       // Opcional
}
```

### Cita
```typescript
{
  id: number;           // Requerido
  titulo: string;       // Requerido
  fechaHora: string;    // Requerido - Formato ISO 8601
  lugar?: string;       // Opcional
}
```

### Notificación
```typescript
{
  identifier: string;   // ID único de la notificación
  content: {
    title: string;
    body: string;
    data: {
      type: 'medicamento' | 'cita';
      medicamentoId?: number;
      citaId?: number;
      nombre?: string;
      titulo?: string;
      // ... otros datos
    };
  };
  trigger: object;
}
```

---

## Constantes AsyncStorage

```javascript
const NOTIFICATION_MAP_KEY = '@cuido_notifications_map';
const PUSH_TOKEN_KEY = '@cuido_push_token';
```

### Estructura del Mapeo
```json
{
  "medicamento_123": "notification-abc-456",
  "medicamento_789": "notification-def-012",
  "cita_555": "notification-ghi-345"
}
```

---

## Canales de Android

### Canal "default"
- Nombre: "Recordatorios"
- Importancia: HIGH
- Vibración: [0, 250, 250, 250]
- Color LED: #667eea

### Canal "urgent"
- Nombre: "Notificaciones Urgentes"
- Importancia: MAX
- Vibración: [0, 500, 250, 500]
- Color LED: #FF0000

---

## Errores Comunes

### 1. "Las notificaciones solo funcionan en dispositivos físicos"
**Causa:** Intentando usar notificaciones en simulador/emulador
**Solución:** Usar dispositivo físico para testing

### 2. "Se requieren permisos para obtener token"
**Causa:** Intentando obtener token sin permisos
**Solución:** Llamar `solicitarPermisosNotificaciones()` primero

### 3. "Hora inválida: XX:XX"
**Causa:** Formato de hora incorrecto
**Solución:** Usar formato "HH:mm" (24 horas) - ejemplo: "14:30"

### 4. "Fecha inválida: XXX"
**Causa:** Formato de fecha incorrecto
**Solución:** Usar formato ISO 8601 - ejemplo: "2025-11-20T10:00:00"

### 5. "Faltan parámetros requeridos"
**Causa:** No se pasaron todos los campos obligatorios
**Solución:** Verificar que `id`, `nombre`, `horaProgramada` estén presentes

---

## Checklist de Implementación

- [ ] Instalar dependencias (`expo-notifications`, `expo-device`, `@react-native-async-storage/async-storage`)
- [ ] Solicitar permisos al iniciar app
- [ ] Configurar projectId en `obtenerTokenPush()`
- [ ] Sincronizar mapeos al iniciar app
- [ ] Programar notificaciones al crear medicamentos/citas
- [ ] Cancelar notificaciones al eliminar recursos
- [ ] Implementar listeners para respuestas del usuario
- [ ] Testing en dispositivo físico
- [ ] Limpiar notificaciones al cerrar sesión

---

## Recursos Adicionales

- **Documentación completa**: `documentation/NOTIFICACIONES_REACT_NATIVE.md`
- **Mejoras detalladas**: `documentation/NOTIFICACIONES_MEJORAS.md`
- **Archivo de respaldo**: `frontend/src/services/notificationService.web.js`
- **Expo Notifications Docs**: https://docs.expo.dev/versions/latest/sdk/notifications/

---

## Soporte

Si encuentras problemas, verifica:
1. Permisos otorgados ✓
2. Dispositivo físico (no simulador) ✓
3. Formato correcto de datos ✓
4. Logs en consola con `[Notificaciones]` ✓
