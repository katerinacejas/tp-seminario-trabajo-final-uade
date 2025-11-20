// Configuración de la aplicación

// ============================================
// CONFIGURACIÓN DEL BACKEND
// ============================================

// IMPORTANTE: En React Native, 'localhost' NO FUNCIONA
// Debes usar la IP de tu computadora en la red local

// Para encontrar tu IP:
// - Windows: Ejecuta 'ipconfig' en cmd y busca "Dirección IPv4"
// - Mac: Ejecuta 'ifconfig' en terminal y busca "inet"
// - Linux: Ejecuta 'ip addr' y busca "inet"

// Tu IP actual de Wi-Fi: 192.168.0.164
// Puerto del backend: 8082

export const API_CONFIG = {
  // Cambia esta IP si cambias de red WiFi
  //BASE_URL: 'http://192.168.0.164:8082/api',
  BASE_URL: 'http://localhost:8082/api', // para pruebas en web

  // Timeout para requests (30 segundos)
  TIMEOUT: 30000,
};

// ============================================
// CONFIGURACIÓN DE EXPO
// ============================================

export const EXPO_CONFIG = {
  // Para development en Expo Go
  DEV_URL: 'http://192.168.0.164:8082/api',

  // Para emulador Android (usa 10.0.2.2)
  ANDROID_EMULATOR_URL: 'http://10.0.2.2:8082/api',

  // Para simulador iOS (puede usar localhost)
  IOS_SIMULATOR_URL: 'http://localhost:8082/api',
};

// ============================================
// DETECCIÓN AUTOMÁTICA DE PLATAFORMA
// ============================================

import { Platform } from 'react-native';

export const getApiUrl = () => {
  // Si es web, usa localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:8082/api';
  }

  // Si es Android en emulador, usa 10.0.2.2
  // Si es dispositivo real, usa la IP de red
  // Por defecto, usa la IP de red (para Expo Go en dispositivo real)
  return API_CONFIG.BASE_URL;
};

export default {
  API_CONFIG,
  EXPO_CONFIG,
  getApiUrl,
};
