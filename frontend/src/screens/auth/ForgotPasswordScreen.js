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
import { authAPI } from '../../services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation();

  const submit = async () => {
    // Validación básica
    if (!email) {
      setError('Por favor, ingresa tu email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess(true);

      // Mostrar mensaje de éxito
      Alert.alert(
        'Código enviado',
        'Revisa tu email y serás redirigido...',
        [{ text: 'OK' }]
      );

      // Redirigir a la pantalla de reset password después de 2 segundos
      setTimeout(() => {
        navigation.navigate('ResetPassword', { email });
      }, 2000);
    } catch (err) {
      console.error('Error en forgot password:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Error al enviar el código. Intenta nuevamente.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
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
              <Text style={styles.title}>Recuperar Contraseña</Text>
              <Text style={styles.subtitle}>Te enviaremos un código de 6 dígitos</Text>
            </View>

            {/* Success Message */}
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Código enviado. Revisa tu email y serás redirigido...
                </Text>
              </View>
            ) : (
              /* Form */
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

                {/* Actions */}
                <View style={styles.actions}>
                  {/* Send Code Button */}
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
                    onPress={submit}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading ? 'Enviando...' : 'Enviar Código'}
                    </Text>
                  </TouchableOpacity>

                  {/* Back to Login Link */}
                  <TouchableOpacity
                    style={styles.link}
                    onPress={() => navigation.navigate('Login')}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.linkText}>Volver al login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  successContainer: {
    backgroundColor: '#EFE',
    borderWidth: 1,
    borderColor: '#CFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  successText: {
    color: '#363',
    fontSize: 15,
    textAlign: 'center',
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
