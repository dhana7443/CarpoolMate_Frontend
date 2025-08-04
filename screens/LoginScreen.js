import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import { parseJwt } from '../utils/jwt';


const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  //upload token
  const uploadFcmTokenForCurrentUser = async () => {
    try {
      const fcmToken = await messaging().getToken();
      const authToken = await AsyncStorage.getItem('userToken');

      if (!authToken) {
        console.log("User not logged in, skipping FCM upload.");
        return;
      }

      if (!fcmToken) {
        console.log("No FCM token retrieved.");
        return;
      }

      console.log("Uploading FCM token:", fcmToken);

      await api.post(
        '/users/store-fcm-token',
        { fcmToken },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      console.log("FCM token uploaded successfully.");
    } catch (error) {
      console.error("Error uploading FCM token:", error);
    }
  };

  //handle fcm token refresh automatically
  useEffect(() => {
    const unsubscribe = messaging().onTokenRefresh(token => {
      console.log("FCM token refreshed:", token);
      uploadFcmTokenForCurrentUser();
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      const response = await api.post('/users/login', {
        email,
        password,
      });

      const { token,user } = response.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify({ user }));

      //upload token after login
      await uploadFcmTokenForCurrentUser();
      console.log('Login successful, token and user info stored');

      if (user.role === 'driver') {
        navigation.navigate('DriverDashboard');
      } else {
        navigation.navigate('RiderDashboard');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Something went wrong';
      console.error('Login error:', message);
      Alert.alert('Login Failed', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../images/carpool_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.appName}>
          <Text style={styles.appNameBlue}>CarPool</Text>
          <Text style={styles.appNameBlack}>Mate</Text>
        </Text>

        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.subheading}>Login to continue your journey</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.ctaButton} onPress={handleLogin}>
            <Text style={styles.ctaText}>Login</Text>
            {/* <Icon
              name="arrow-forward-circle-outline"
              size={22}
              color="#fff"
              style={styles.ctaIcon}
            /> */}
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>
            Don’t have an account?
            <Text style={styles.signupLink}> Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const PRIMARY = '#1e40af';
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
    padding: 30,
    justifyContent: 'center',
  },
  logo: {
    marginTop:30,
    width: 72,
    height: 72,
    alignSelf: 'center',
    marginBottom: -10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  appNameBlue: {
    color: '#3B82F6',
  },
  appNameBlack: {
    color: '#38BDF8',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DARK_TEXT,
    textAlign: 'left',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 15,
    color: MUTED_TEXT,
    textAlign: 'left',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  input: {
    height: 48,
    backgroundColor: INPUT_BG,
    borderColor: BORDER_DEFAULT,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 14,
  },
  ctaButton: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    marginTop: 12,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginRight: 6,
  },
  ctaIcon: {
    marginTop: 1,
  },
  forgotPassword: {
    color: '#1F2937',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 14,
  },
  signupText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#fff',
    marginTop: 10,
  },
  signupLink: {
    color: '#9c27b0',
    fontWeight: 'bold',
  },
});
