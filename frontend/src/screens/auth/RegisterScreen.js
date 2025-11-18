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
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    nombreCompleto: '',
    rol: 'CUIDADOR',
    email: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const { login } = useAuth();

  const onChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const submit = async () => {
    setError('');

    // Validaciones frontend
    if (!form.nombreCompleto.trim()) {
      setError('El nombre completo es requerido');
      return;
    }

    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para el backend
      const registroData = {
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        password: form.password,
        rol: form.rol,
        direccion: null,
        telefono: null,
        fechaNacimiento: null,
        avatar: null,
      };

      // Llamar al backend
      const response = await authAPI.register(registroData);

      // Guardar token y rol
      await storage.setItem('cuido.token', response.token);
      await storage.setItem('cuido.role', response.rol);

      // Actualizar contexto de auth
      await login(response.rol);

      // Redirigir según rol (se manejará automáticamente por el RootNavigator)
      // No es necesario hacer navigation.reset aquí
    } catch (err) {
      console.error('Error en registro:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Error al crear la cuenta. Verifica que el email no esté registrado.';
      setError(errorMessage);
      Alert.alert('Error en registro', errorMessage);
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
              <Image
                source={require('../../../public/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Crear cuenta</Text>
              <Text style={styles.subtitle}>Es gratis y lleva menos de un minuto</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Nombre Completo Input */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Nombre y apellido</Text>
                <TextInput
                  style={[styles.input, loading && styles.inputDisabled]}
                  value={form.nombreCompleto}
                  onChangeText={(value) => onChange('nombreCompleto', value)}
                  placeholder="Ej: Ana Pérez"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Rol Picker */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Rol</Text>
                <View style={[styles.pickerContainer, loading && styles.inputDisabled]}>
                  <Picker
                    selectedValue={form.rol}
                    onValueChange={(value) => onChange('rol', value)}
                    enabled={!loading}
                    style={styles.picker}
                  >
                    <Picker.Item label="Cuidador" value="CUIDADOR" />
                    <Picker.Item label="Paciente" value="PACIENTE" />
                  </Picker>
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, loading && styles.inputDisabled]}
                  value={form.email}
                  onChangeText={(value) => onChange('email', value)}
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
                  value={form.password}
                  onChangeText={(value) => onChange('password', value)}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <Text style={styles.helpText}>Mínimo 6 caracteres</Text>
              </View>

              {/* Repeat Password Input */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Repetir contraseña</Text>
                <TextInput
                  style={[styles.input, loading && styles.inputDisabled]}
                  value={form.password2}
                  onChangeText={(value) => onChange('password2', value)}
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
                {/* Register Button */}
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={submit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Creando cuenta...' : 'Registrarme'}
                  </Text>
                </TouchableOpacity>

                {/* Login Link */}
                <TouchableOpacity
                  style={styles.link}
                  onPress={() => navigation.navigate('Login')}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>Ya tengo cuenta</Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E1E7F2',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  helpText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
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
