/**
 * SCRIPT DE LIMPIEZA - EJECUTAR UNA SOLA VEZ
 *
 * Este script limpia AsyncStorage completamente.
 * Úsalo si tienes errores de tipos en AsyncStorage.
 *
 * CÓMO USAR:
 * 1. Abre Expo en tu dispositivo
 * 2. Presiona "m" en la terminal de Expo para abrir el menú
 * 3. Selecciona "Clear AsyncStorage"
 *
 * O copia este código en cualquier pantalla temporalmente:
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const limpiarTodo = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ AsyncStorage limpiado completamente');
    alert('AsyncStorage limpiado. Reinicia la app.');
  } catch (error) {
    console.error('❌ Error limpiando AsyncStorage:', error);
  }
};

// Para ejecutar: limpiarTodo();
