import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert,TouchableOpacity,SafeAreaView,ScrollView,StyleSheet } from 'react-native';
import api from '../src/api/axios';
import Icon from 'react-native-vector-icons/Ionicons';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { token } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async () => {
    if (!newPassword) {
        Alert.alert('Validation Error', 'New password is required.');
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

  return (
    // <View style={{ padding: 20 }}>
    //   <Text>New Password:</Text>
    //   <TextInput
    //     value={newPassword}
    //     onChangeText={setNewPassword}
    //     placeholder="Enter new password"
    //     secureTextEntry
    //     style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
    //   />
    //   <Text>Confirm Password:</Text>
    //   <TextInput
    //     value={confirmPassword}
    //     onChangeText={setConfirmPassword}
    //     placeholder="Confirm password"
    //     secureTextEntry
    //     style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
    //   />
    //   <Button title="Reset Password" onPress={handleReset} />
    // </View>
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subheading}>Enter your new password</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TouchableOpacity style={styles.ctaButton} onPress={handleReset}>
            <Text style={styles.ctaText}>Reset Password</Text>
            <Icon name="lock-closed-outline" size={22} color="#fff" style={styles.ctaIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

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
