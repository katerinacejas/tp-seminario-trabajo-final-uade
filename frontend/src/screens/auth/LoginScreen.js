import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth';
import { authAPI } from '../../services/api';
import { storage } from '../../utils/storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const { login } = useAuth();

  const submit = async () => {
    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Llamar al backend
      const response = await authAPI.login(email, password);

      // Normalizar el rol a string minúscula
      const rolNormalizado = String(response.rol || '').toLowerCase();

      // Guardar token y rol como STRINGS
      await storage.setItem('cuido.token', String(response.token));
      await storage.setItem('cuido.role', rolNormalizado);

      console.log('Login exitoso:', { rol: rolNormalizado, hasToken: !!response.token });

      // Actualizar contexto de auth
      await login(rolNormalizado);

      // Redirigir según rol
      // La navegación se manejará automáticamente por el RootNavigator
      // al cambiar el rol en el contexto de autenticación
      // No es necesario hacer navigation.reset aquí
    } catch (err) {
      console.error('Error en login:', err);
      const errorMessage = err.message || 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
      setError(errorMessage);
      Alert.alert('Error de autenticación', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              {/* TEMPORALMENTE COMENTADA LA IMAGEN PARA DEBUG */}
              {/* <Image
                source={require('../../../public/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              /> */}
              <Text style={styles.title}>Ingresá a Cuido</Text>
              <Text style={styles.subtitle}>Cuidadores y pacientes en un mismo lugar</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email Input */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, loading && styles.inputDisabled]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="usuario@correo.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={[styles.input, loading && styles.inputDisabled]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={submit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </Text>
                </TouchableOpacity>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  style={styles.link}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                {/* Register Link */}
                <TouchableOpacity
                  style={styles.link}
                  onPress={() => navigation.navigate('Register')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>Crear cuenta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#EEF3F9',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E7F2',
    padding: 24,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0E1726',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 16,
    color: '#5B6785',
    textAlign: 'center',
  },
  form: {
    marginTop: 0,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderWidth: 1,
    borderColor: '#FCC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#C33',
    fontSize: 15,
    textAlign: 'center',
  },
  inputRow: {
    marginVertical: 12,
  },
  label: {
    fontSize: 15,
    color: '#51607A',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E1E7F2',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#0E1726',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  actions: {
    marginTop: 6,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2EA3FF',
    shadowColor: '#0F6BE0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 4,
  },
  linkText: {
    color: '#0E1726',
    fontSize: 16,
    fontWeight: '800',
  },
});
