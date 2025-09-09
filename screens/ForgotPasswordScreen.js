import React, { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import api from '../src/api/axios';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false); // track if input was focused and blurred

  const validateEmail = (email) => {
    if (!email) return 'This field is required.';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return 'Invalid email format.';
    return '';
  };

  const handleSendOtp = async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      return;
    } else {
      setError('');
    }

    try {
      const res = await api.post('/users/forgot-password', { email });
      const { expiresIn } = res.data;
      Alert.alert('OTP sent', 'Please check your email for the OTP.');
      navigation.navigate('VerifyOtp', { email, expiresIn });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.subheading}>Enter your email to receive an OTP</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={[styles.input, error && touched ? styles.inputError : null]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (touched) setError(validateEmail(text)); // live validation after blur
            }}
            onFocus={() => setTouched(false)} // reset error on focus
            onBlur={() => {
              setTouched(true);
              setError(validateEmail(email));
            }}
          />
          {error && touched ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.ctaButton} onPress={handleSendOtp}>
            <Text style={styles.ctaText}>Send OTP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 4,
  },
  inputError: {
    borderColor: ERROR_COLOR,
  },
  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    marginTop: 10,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
});
