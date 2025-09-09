// VerifyOtpScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  Alert, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import api from '../src/api/axios';

const VerifyOtpScreen = ({ route, navigation }) => {
  const { email, expiresIn } = route.params;

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timer, setTimer] = useState(expiresIn || 120);

  // Countdown timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // OTP validation
  const validateOtp = (value) => {
    if (!value) return 'OTP is required';
    if (!/^\d+$/.test(value)) return 'OTP must be numeric.';
    if (value.length !== 6) return 'OTP must be 6 digits';
    return '';
  };

  // Verify OTP
  const handleVerify = async () => {
    const errorMsg = validateOtp(otp);
    setOtpError(errorMsg);
    if (errorMsg) return;

    try {
      const res = await api.post('/users/verify-reset-otp', { email, otp });
      const { resetToken } = res.data;
      navigation.navigate('ResetPassword', { token: resetToken });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email to resend OTP.');
      return;
    }

    try {
      const res = await api.post('/users/resend-password-otp', { email });
      const { expiresIn: newExpiresIn, message } = res.data;

      Alert.alert('OTP Sent', message || 'A new OTP has been sent to your email.');

      //reset otp field after resend
      setOtp('');
      setOtpError('');
      setTimer(newExpiresIn);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.log("error message:", msg);
      Alert.alert('Error', msg);
    }
  };

  // Button enabled only if valid OTP
  const isOtpValid = otp.length === 6 && /^\d{6}$/.test(otp);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Verify OTP</Text>
        <Text style={styles.subheading}>Enter the OTP sent to your email</Text>

        <View style={styles.card}>
          <Text style={styles.emailDisplay}>{email}</Text>

          <TextInput
            placeholder="OTP"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              // allow only digits
              const numericText = text.replace(/[^0-9]/g, '');
              setOtp(numericText);
              if (otpError) setOtpError('');
            }}
            onBlur={() => {
              const errorMsg = validateOtp(otp);
              setOtpError(errorMsg);
            }}
          />

          {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

          <TouchableOpacity 
            style={[styles.ctaButton, !isOtpValid && { backgroundColor: '#9CA3AF' }]} 
            onPress={handleVerify}
            disabled={!isOtpValid}
          >
            <Text style={styles.ctaText}>Verify OTP</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in {timer} seconds
              </Text>
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

export default VerifyOtpScreen;

const PRIMARY = '#1e40af';
const SCREEN_BG = '#0F172A';
const INPUT_BG = '#FFFFFF';
const BORDER_DEFAULT = '#D1D5DB';
const DARK_TEXT = '#E2E8F0';
const MUTED_TEXT = '#CBD5E1';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SCREEN_BG },
  emailDisplay: { fontSize: 15, fontWeight: '600', color: '#3B82F6', marginBottom: 20 },
  content: { marginTop: 50, padding: 24, justifyContent: 'center' },
  heading: { fontSize: 20, fontWeight: 'bold', color: DARK_TEXT, textAlign: 'left', marginBottom: 6 },
  subheading: { fontSize: 14, color: MUTED_TEXT, textAlign: 'left', marginBottom: 30 },
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
  input: { height: 50, backgroundColor: INPUT_BG, borderColor: BORDER_DEFAULT, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: '#1F2937', marginBottom: 16 },
  errorText: { color: 'red', fontSize: 13, marginBottom: 8 },
  ctaButton: { backgroundColor: PRIMARY, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 50, marginTop: 10 },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
  resendContainer: { marginTop: 16, alignItems: 'center' },
  timerText: { color: '#6B7280', fontSize: 14 },
  resendText: { color: PRIMARY, fontWeight: '600', fontSize: 14 },
});
