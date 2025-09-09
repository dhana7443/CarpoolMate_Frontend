import React, { useState } from 'react';
import { View, TextInput, Text, Alert, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import api from '../src/api/axios';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { token } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });

  const validatePassword = (password) => {
    if (!password) return 'This field is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const validateConfirmPassword = (confirm, original) => {
    if (!confirm) return 'This field is required.';
    if (confirm !== original) return 'Passwords do not match.';
    return '';
  };

  const handleReset = async () => {
    const newPassError = validatePassword(newPassword);
    const confirmPassError = validateConfirmPassword(confirmPassword, newPassword);

    if (newPassError || confirmPassError) {
      setErrors({ newPassword: newPassError, confirmPassword: confirmPassError });
      setTouched({ newPassword: true, confirmPassword: true });
      return;
    }

    try {
      await api.post('/users/reset-password', { token, newPassword });
      Alert.alert('Success', 'Password updated successfully');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  const isFormValid = () => {
    return (
      newPassword &&
      confirmPassword &&
      newPassword === confirmPassword &&
      !validatePassword(newPassword) &&
      !validateConfirmPassword(confirmPassword, newPassword)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subheading}>Enter your new password</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#999"
            style={[styles.input, errors.newPassword && touched.newPassword ? styles.inputError : null]}
            secureTextEntry
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (touched.newPassword) setErrors({ ...errors, newPassword: validatePassword(text) });
              if (touched.confirmPassword) setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword, text) });
            }}
            onFocus={() => setTouched({ ...touched, newPassword: false })}
            onBlur={() => setTouched({ ...touched, newPassword: true }) || setErrors({ ...errors, newPassword: validatePassword(newPassword) })}
          />
          {errors.newPassword && touched.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#999"
            style={[styles.input, errors.confirmPassword && touched.confirmPassword ? styles.inputError : null]}
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (touched.confirmPassword) setErrors({ ...errors, confirmPassword: validateConfirmPassword(text, newPassword) });
            }}
            onFocus={() => setTouched({ ...touched, confirmPassword: false })}
            onBlur={() => setTouched({ ...touched, confirmPassword: true }) || setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword, newPassword) })}
          />
          {errors.confirmPassword && touched.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <TouchableOpacity
            style={[styles.ctaButton, !isFormValid() ? styles.ctaButtonDisabled : null]}
            onPress={handleReset}
            disabled={!isFormValid()}
          >
            <Text style={styles.ctaText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const PRIMARY = '#1e40af';
const SCREEN_BG = '#0F172A';
const INPUT_BG = '#FFFFFF';
const BORDER_DEFAULT = '#D1D5DB';
const DARK_TEXT = '#E2E8F0';
const MUTED_TEXT = '#CBD5E1';
const ERROR_COLOR = '#f87171';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SCREEN_BG },
  content: { marginTop: 50, padding: 24, justifyContent: 'center' },
  heading: { fontSize: 20, fontWeight: 'bold', color: DARK_TEXT, marginBottom: 6 },
  subheading: { fontSize: 14, color: MUTED_TEXT, marginBottom: 30 },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: INPUT_BG,
    borderColor: BORDER_DEFAULT,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  inputError: { borderColor: ERROR_COLOR },
  errorText: { color: ERROR_COLOR, fontSize: 12, marginBottom: 8 },
  ctaButton: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    marginTop: 10,
  },
  ctaButtonDisabled: { backgroundColor: '#7b92f0' }, // gray if disabled
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
});
