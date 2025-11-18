# Ejemplo de Integración Completa - Servicio de Notificaciones

Este documento muestra cómo integrar el servicio de notificaciones en diferentes partes de la aplicación.

---

## 1. Configuración Inicial en App.js

```javascript
// App.js
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import {
  solicitarPermisosNotificaciones,
  sincronizarMapeoNotificaciones,
  obtenerTokenPush
} from './services/notificationService';

export default function App() {
  // Listener para notificaciones recibidas mientras la app está abierta
  const notificationListener = React.useRef();
  // Listener para cuando el usuario toca una notificación
  const responseListener = React.useRef();

  useEffect(() => {
    // Setup inicial de notificaciones
    async function setupNotifications() {
      // 1. Solicitar permisos
      const permisos = await solicitarPermisosNotificaciones();

      if (permisos) {
        console.log('✓ Permisos de notificaciones otorgados');

        // 2. Sincronizar mapeos (limpia notificaciones obsoletas)
        await sincronizarMapeoNotificaciones();

        // 3. Obtener token push (para notificaciones remotas)
        const token = await obtenerTokenPush();
        if (token) {
          // TODO: Enviar token al backend
          // await api.post('/usuarios/push-token', { token });
          console.log('✓ Token push obtenido');
        }
      } else {
        console.warn('⚠ Usuario denegó permisos de notificaciones');
      }
    }

    setupNotifications();

    // Configurar listeners de notificaciones
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notificación recibida:', notification);
      // Aquí puedes actualizar el estado de la app si es necesario
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario tocó notificación:', response);

      const data = response.notification.request.content.data;

      // Navegar según el tipo de notificación
      if (data.type === 'medicamento') {
        // Navegar a la pantalla de medicamentos
        // navigation.navigate('Medicamentos', { medicamentoId: data.medicamentoId });
        console.log('Navegar a medicamento:', data.medicamentoId);
      } else if (data.type === 'cita') {
        // Navegar a la pantalla de citas
        // navigation.navigate('Citas', { citaId: data.citaId });
        console.log('Navegar a cita:', data.citaId);
      }
    });

    // Cleanup
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      {/* Tu app aquí */}
    </>
  );
}
```

---

## 2. Pantalla de Medicamentos

```javascript
// screens/MedicamentosScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import {
  programarNotificacionMedicamento,
  cancelarNotificacionPorRecurso,
  existeNotificacion
} from '../services/notificationService';
import api from '../services/api';

export default function MedicamentosScreen() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar medicamentos del backend
  useEffect(() => {
    cargarMedicamentos();
  }, []);

  async function cargarMedicamentos() {
    try {
      setLoading(true);
      const response = await api.get('/medicamentos');
      setMedicamentos(response.data);
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
      Alert.alert('Error', 'No se pudieron cargar los medicamentos');
    } finally {
      setLoading(false);
    }
  }

  // Crear nuevo medicamento
  async function crearMedicamento(datos) {
    try {
      setLoading(true);

      // 1. Crear en el backend
      const response = await api.post('/medicamentos', datos);
      const medicamento = response.data;

      // 2. Programar notificación
      const notifId = await programarNotificacionMedicamento({
        id: medicamento.id,
        nombre: medicamento.nombre,
        horaProgramada: medicamento.horaProgramada,
        dosis: medicamento.dosis
      });

      if (notifId) {
        Alert.alert(
          'Éxito',
          `Medicamento creado y notificación programada para las ${medicamento.horaProgramada}`
        );
      } else {
        Alert.alert(
          'Advertencia',
          'Medicamento creado pero no se pudo programar la notificación'
        );
      }

      // 3. Recargar lista
      cargarMedicamentos();
    } catch (error) {
      console.error('Error al crear medicamento:', error);
      Alert.alert('Error', 'No se pudo crear el medicamento');
    } finally {
      setLoading(false);
    }
  }

  // Eliminar medicamento
  async function eliminarMedicamento(medicamentoId) {
    Alert.alert(
      'Confirmar',
      '¿Eliminar este medicamento? También se cancelará la notificación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // 1. Cancelar notificación
              await cancelarNotificacionPorRecurso(medicamentoId, 'medicamento');

              // 2. Eliminar del backend
              await api.delete(`/medicamentos/${medicamentoId}`);

              Alert.alert('Éxito', 'Medicamento eliminado');

              // 3. Recargar lista
              cargarMedicamentos();
            } catch (error) {
              console.error('Error al eliminar medicamento:', error);
              Alert.alert('Error', 'No se pudo eliminar el medicamento');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  // Verificar si hay notificación activa
  async function verificarNotificacion(medicamentoId) {
    const existe = await existeNotificacion(medicamentoId, 'medicamento');
    Alert.alert(
      'Estado de Notificación',
      existe ? 'Hay una notificación activa para este medicamento' : 'No hay notificación programada'
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Mis Medicamentos
      </Text>

      <Button
        title="Agregar Medicamento"
        onPress={() => {
          // Navegar a formulario de creación
          // navigation.navigate('CrearMedicamento');
        }}
      />

      <FlatList
        data={medicamentos}
        keyExtractor={item => item.id.toString()}
        refreshing={loading}
        onRefresh={cargarMedicamentos}
        renderItem={({ item }) => (
          <View style={{ padding: 12, marginVertical: 8, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.nombre}</Text>
            <Text>Hora: {item.horaProgramada}</Text>
            {item.dosis && <Text>Dosis: {item.dosis}</Text>}

            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Button
                title="Verificar Notif."
                onPress={() => verificarNotificacion(item.id)}
              />
              <Button
                title="Eliminar"
                color="red"
                onPress={() => eliminarMedicamento(item.id)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
```

---

## 3. Pantalla de Citas

```javascript
// screens/CitasScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import {
  programarNotificacionCita,
  cancelarNotificacionPorRecurso
} from '../services/notificationService';
import api from '../services/api';

export default function CitasScreen() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, []);

  async function cargarCitas() {
    try {
      setLoading(true);
      const response = await api.get('/citas');
      setCitas(response.data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  }

  async function crearCita(datos) {
    try {
      setLoading(true);

      // 1. Crear en el backend
      const response = await api.post('/citas', datos);
      const cita = response.data;

      // 2. Programar notificación (1 hora antes)
      const notifId = await programarNotificacionCita({
        id: cita.id,
        titulo: cita.titulo,
        fechaHora: cita.fechaHora,
        lugar: cita.lugar
      }, 60); // 60 minutos antes

      if (notifId) {
        const fecha = new Date(cita.fechaHora);
        Alert.alert(
          'Éxito',
          `Cita creada. Se te recordará 1 hora antes (${fecha.toLocaleString()})`
        );
      } else {
        Alert.alert(
          'Advertencia',
          'Cita creada pero no se pudo programar la notificación (puede que la cita sea muy pronto)'
        );
      }

      cargarCitas();
    } catch (error) {
      console.error('Error al crear cita:', error);
      Alert.alert('Error', 'No se pudo crear la cita');
    } finally {
      setLoading(false);
    }
  }

  async function eliminarCita(citaId) {
    Alert.alert(
      'Confirmar',
      '¿Eliminar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Cancelar notificación
              await cancelarNotificacionPorRecurso(citaId, 'cita');

              // Eliminar del backend
              await api.delete(`/citas/${citaId}`);

              Alert.alert('Éxito', 'Cita eliminada');
              cargarCitas();
            } catch (error) {
              console.error('Error al eliminar cita:', error);
              Alert.alert('Error', 'No se pudo eliminar la cita');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Mis Citas Médicas
      </Text>

      <Button
        title="Agregar Cita"
        onPress={() => {
          // Navegar a formulario
        }}
      />

      <FlatList
        data={citas}
        keyExtractor={item => item.id.toString()}
        refreshing={loading}
        onRefresh={cargarCitas}
        renderItem={({ item }) => {
          const fecha = new Date(item.fechaHora);
          return (
            <View style={{ padding: 12, marginVertical: 8, backgroundColor: '#f0f8ff', borderRadius: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.titulo}</Text>
              <Text>Fecha: {fecha.toLocaleDateString()}</Text>
              <Text>Hora: {fecha.toLocaleTimeString()}</Text>
              {item.lugar && <Text>Lugar: {item.lugar}</Text>}

              <Button
                title="Eliminar"
                color="red"
                onPress={() => eliminarCita(item.id)}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
```

---

## 4. Pantalla de Configuración

```javascript
// screens/ConfiguracionScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Switch, Alert } from 'react-native';
import {
  obtenerNotificacionesProgramadas,
  cancelarTodasLasNotificaciones,
  enviarNotificacionInmediata,
  sincronizarMapeoNotificaciones
} from '../services/notificationService';

export default function ConfiguracionScreen() {
  const [notificacionesActivas, setNotificacionesActivas] = useState(0);

  useEffect(() => {
    cargarEstadoNotificaciones();
  }, []);

  async function cargarEstadoNotificaciones() {
    const notifs = await obtenerNotificacionesProgramadas();
    setNotificacionesActivas(notifs.length);
  }

  async function verNotificacionesProgramadas() {
    const notifs = await obtenerNotificacionesProgramadas();

    if (notifs.length === 0) {
      Alert.alert('Info', 'No hay notificaciones programadas');
      return;
    }

    const lista = notifs.map((notif, index) => {
      const type = notif.content.data?.type || 'desconocido';
      return `${index + 1}. ${notif.content.title} (${type})`;
    }).join('\n');

    Alert.alert(
      `Notificaciones Activas (${notifs.length})`,
      lista,
      [{ text: 'OK' }]
    );
  }

  async function testNotificacion() {
    await enviarNotificacionInmediata(
      'Notificación de Prueba',
      'Esta es una notificación de prueba inmediata'
    );
    Alert.alert('Enviado', 'Revisa la bandeja de notificaciones');
  }

  async function cancelarTodas() {
    Alert.alert(
      'Confirmar',
      '¿Cancelar TODAS las notificaciones programadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cancelar todas',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelarTodasLasNotificaciones();
            if (success) {
              Alert.alert('Éxito', 'Todas las notificaciones canceladas');
              cargarEstadoNotificaciones();
            } else {
              Alert.alert('Error', 'No se pudieron cancelar las notificaciones');
            }
          }
        }
      ]
    );
  }

  async function sincronizar() {
    await sincronizarMapeoNotificaciones();
    Alert.alert('Éxito', 'Mapeos sincronizados');
    cargarEstadoNotificaciones();
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Configuración de Notificaciones
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          Notificaciones activas: {notificacionesActivas}
        </Text>
      </View>

      <Button
        title="Ver Notificaciones Programadas"
        onPress={verNotificacionesProgramadas}
      />

      <View style={{ height: 16 }} />

      <Button
        title="Probar Notificación Inmediata"
        onPress={testNotificacion}
      />

      <View style={{ height: 16 }} />

      <Button
        title="Sincronizar Mapeos"
        onPress={sincronizar}
      />

      <View style={{ height: 16 }} />

      <Button
        title="Cancelar Todas las Notificaciones"
        color="red"
        onPress={cancelarTodas}
      />

      <View style={{ height: 32 }} />

      <Text style={{ fontSize: 12, color: '#666' }}>
        Sincronizar mapeos elimina referencias a notificaciones que ya no existen.
        Útil si las notificaciones se desincronizaron.
      </Text>
    </View>
  );
}
```

---

## 5. Hook Personalizado (Opcional)

```javascript
// hooks/useNotificaciones.js
import { useState, useEffect } from 'react';
import {
  programarNotificacionMedicamento,
  programarNotificacionCita,
  cancelarNotificacionPorRecurso,
  existeNotificacion,
  obtenerNotificacionesProgramadas
} from '../services/notificationService';

export function useNotificaciones() {
  const [notificacionesActivas, setNotificacionesActivas] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar cantidad de notificaciones activas
  async function cargarNotificaciones() {
    const notifs = await obtenerNotificacionesProgramadas();
    setNotificacionesActivas(notifs.length);
  }

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  // Programar medicamento con estados
  async function programarMedicamento(medicamento) {
    setLoading(true);
    try {
      const notifId = await programarNotificacionMedicamento(medicamento);
      await cargarNotificaciones();
      return notifId;
    } finally {
      setLoading(false);
    }
  }

  // Programar cita con estados
  async function programarCita(cita, minutosAntes = 60) {
    setLoading(true);
    try {
      const notifId = await programarNotificacionCita(cita, minutosAntes);
      await cargarNotificaciones();
      return notifId;
    } finally {
      setLoading(false);
    }
  }

  // Cancelar por recurso con estados
  async function cancelarPorRecurso(recursoId, tipo) {
    setLoading(true);
    try {
      const success = await cancelarNotificacionPorRecurso(recursoId, tipo);
      await cargarNotificaciones();
      return success;
    } finally {
      setLoading(false);
    }
  }

  // Verificar existencia
  async function verificarExistencia(recursoId, tipo) {
    return await existeNotificacion(recursoId, tipo);
  }

  return {
    notificacionesActivas,
    loading,
    programarMedicamento,
    programarCita,
    cancelarPorRecurso,
    verificarExistencia,
    refrescar: cargarNotificaciones
  };
}
```

### Uso del Hook

```javascript
// En cualquier componente
import { useNotificaciones } from '../hooks/useNotificaciones';

function MiComponente() {
  const {
    notificacionesActivas,
    loading,
    programarMedicamento,
    cancelarPorRecurso
  } = useNotificaciones();

  async function agregarMedicamento(datos) {
    const notifId = await programarMedicamento({
      id: datos.id,
      nombre: datos.nombre,
      horaProgramada: datos.horaProgramada
    });

    if (notifId) {
      console.log('Programado');
    }
  }

  return (
    <View>
      <Text>Notificaciones activas: {notificacionesActivas}</Text>
      {loading && <Text>Cargando...</Text>}
    </View>
  );
}
```

---

## 6. Logout y Limpieza

```javascript
// screens/LogoutScreen.js o en AuthContext
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelarTodasLasNotificaciones } from '../services/notificationService';

async function cerrarSesion() {
  try {
    // 1. Cancelar todas las notificaciones
    await cancelarTodasLasNotificaciones();

    // 2. Limpiar tokens
    await AsyncStorage.removeItem('@cuido_push_token');
    await AsyncStorage.removeItem('@cuido_notifications_map');

    // 3. Limpiar auth token
    await AsyncStorage.removeItem('@cuido_auth_token');

    // 4. Llamar API de logout
    // await api.post('/logout');

    // 5. Navegar a login
    // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

    console.log('Sesión cerrada y notificaciones canceladas');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}
```

---

## 7. Testing

```javascript
// __tests__/notificationService.test.js
import {
  programarNotificacionMedicamento,
  programarNotificacionCita,
  cancelarNotificacion,
  obtenerNotificacionesProgramadas
} from '../services/notificationService';

describe('Servicio de Notificaciones', () => {
  test('Programar medicamento', async () => {
    const notifId = await programarNotificacionMedicamento({
      id: 1,
      nombre: 'Test Medicamento',
      horaProgramada: '08:00'
    });

    expect(notifId).toBeTruthy();
  });

  test('Programar cita', async () => {
    const notifId = await programarNotificacionCita({
      id: 2,
      titulo: 'Test Cita',
      fechaHora: '2025-12-31T10:00:00'
    });

    expect(notifId).toBeTruthy();
  });

  test('Obtener notificaciones programadas', async () => {
    const notifs = await obtenerNotificacionesProgramadas();
    expect(Array.isArray(notifs)).toBe(true);
  });
});
```

---

## Resumen de Integración

1. **App.js**: Configuración inicial, listeners, permisos
2. **Pantallas**: Crear/eliminar recursos con notificaciones
3. **Configuración**: Ver, probar y limpiar notificaciones
4. **Hooks**: Abstracción reutilizable (opcional)
5. **Logout**: Limpieza completa de notificaciones
6. **Testing**: Pruebas unitarias

Este enfoque garantiza que las notificaciones estén completamente integradas en el flujo de la aplicación.
