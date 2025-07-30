import React, { useState } from 'react';
import { View, TextInput,TouchableOpacity, Button, Text, Alert,StyleSheet,SafeAreaView,ScrollView } from 'react-native';
import api from '../src/api/axios';
import Icon from 'react-native-vector-icons/Ionicons';


const VerifyOtpScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    if (!otp) {
        Alert.alert('Validation Error', 'OTP is required.');
        return;
      }

    try {
      const res = await api.post('/users/verify-reset-otp', { email, otp });
      const { resetToken } = res.data;
      navigation.navigate('ResetPassword', { token: resetToken });

    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    }
  };

  return (
    // <View style={{ padding: 20 }}>
    //   <Text>OTP:</Text>
    //   <TextInput
    //     value={otp}
    //     onChangeText={setOtp}
    //     placeholder="Enter OTP"
    //     keyboardType="numeric"
    //     style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
    //   />
    //   <Button title="Verify OTP" onPress={handleVerify} />
    // </View>
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Verify OTP</Text>
        <Text style={styles.subheading}>Enter the OTP sent to your email</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="OTP"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />

          <TouchableOpacity style={styles.ctaButton} onPress={handleVerify}>
            <Text style={styles.ctaText}>Verify OTP</Text>
            <Icon name="checkmark-circle-outline" size={22} color="#fff" style={styles.ctaIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyOtpScreen;

const PRIMARY = '#5A67D8';
const SCREEN_BG = '#0F172A';
const INPUT_BG = '#FFFFFF';
const BORDER_DEFAULT = '#D1D5DB';
const DARK_TEXT = '#E2E8F0';
const MUTED_TEXT = '#CBD5E1';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  content: {
    marginTop:50,
    padding: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_TEXT,
    textAlign: 'left',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: MUTED_TEXT,
    textAlign: 'left',
    marginBottom: 30,
  },
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
    marginBottom: 16,
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
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  ctaIcon: {
    marginTop: 1,
  },
});
