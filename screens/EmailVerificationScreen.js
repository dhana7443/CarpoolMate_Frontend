import React, { useState, useEffect } from 'react';
import api from '../src/api/axios';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EmailVerificationScreen = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({ email: '', otp: '' });
  const [touched, setTouched] = useState({ email: false, otp: false });
  const [timer, setTimer] = useState(120);
  const navigation = useNavigation();
  const RESEND_INTERVAL = 120;

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  const validateEmail = (value) => {
    if (!value) return 'This field is required.';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) return 'Invalid email format.';
    return '';
  };

  const validateOtp = (value) => {
    if (!value) return 'OTP is required.';
    if (!/^\d+$/.test(value)) return 'OTP must be numeric.';
    if (value.length !== 6) return 'OTP must be 6 digits.';
    return '';
  };

  const handleVerify = async () => {
    const emailError = validateEmail(email);
    const otpError = validateOtp(otp);
    if (emailError || otpError) {
      setErrors({ email: emailError, otp: otpError });
      setTouched({ email: true, otp: true });
      return;
    }

    try {
      await api.post('/users/verify-otp', { email, otp });
      Alert.alert('Success', 'Email verified successfully!');
      navigation.navigate('Login');
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      Alert.alert('Verification Failed', message);
    }
  };

  const handleResendOtp = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ ...errors, email: emailError });
      setTouched({ ...touched, email: true });
      return;
    }

    try {
      await api.post('/users/resend-otp', { email });
      Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
      setTimer(RESEND_INTERVAL);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      Alert.alert('Error', message);
    }
  };

  const isFormValid = () => !validateEmail(email) && !validateOtp(otp);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Verify Your Email</Text>
        <Text style={styles.subheading}>
          Please enter the email and OTP sent to your inbox
        </Text>

        <View style={styles.card}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={[styles.input, errors.email && touched.email ? styles.inputError : null]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (touched.email) setErrors({ ...errors, email: validateEmail(text) });
            }}
            onFocus={() => setTouched({ ...touched, email: false })}
            onBlur={() => setTouched({ ...touched, email: true }) || setErrors({ ...errors, email: validateEmail(email) })}
          />
          {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            placeholder="OTP"
            placeholderTextColor="#999"
            style={[styles.input, errors.otp && touched.otp ? styles.inputError : null]}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              if (touched.otp) setErrors({ ...errors, otp: validateOtp(text) });
            }}
            onFocus={() => setTouched({ ...touched, otp: false })}
            onBlur={() => setTouched({ ...touched, otp: true }) || setErrors({ ...errors, otp: validateOtp(otp) })}
          />
          {errors.otp && touched.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

          <TouchableOpacity
            style={[styles.ctaButton, !isFormValid() ? styles.ctaButtonDisabled : null]}
            onPress={handleVerify}
            disabled={!isFormValid()}
          >
            <Text style={styles.ctaText}>Verify</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend OTP in {timer} seconds</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmailVerificationScreen;

const PRIMARY = '#1e40af';
const SCREEN_BG = '#0F172A';
const INPUT_BG = '#FFFFFF';
const BORDER_DEFAULT = '#D1D5DB';
const DARK_TEXT = '#E2E8F0';
const MUTED_TEXT = '#CBD5E1';
const ERROR_COLOR = '#f87171';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SCREEN_BG },
  content: { padding: 24, justifyContent: 'center', marginTop: 30 },
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
  // inputError: { borderColor: ERROR_COLOR },
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
  ctaButtonDisabled: { backgroundColor: '#5a78e0' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
  resendContainer: { marginTop: 16, alignItems: 'center' },
  timerText: { color: '#6B7280', fontSize: 14 },
  resendText: { color: PRIMARY, fontWeight: '600', fontSize: 14 },
});
