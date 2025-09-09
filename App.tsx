import React, { useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import api from "./src/api/axios";
import HomeScreenComponent from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import RideResultsScreen from './screens/RideResultsScreen';
import Toast from 'react-native-toast-message';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyOtpScreen from './screens/VerifyOtpScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import DriverTabs from './screens/DriverTabs';
import { UnreadProvider } from './screens/unreadContext';
import DriverDetailsScreen from './screens/DriverDetailsScreen';
import RiderTabs from './screens/RiderTabs';
import SendPaymentScreen from './screens/paymentsScreen';
import WalletScreen from './screens/walletSCreen';
import EditRideScreen from './screens/EditRideScreen';
import ChatScreen from './screens/ChatScreen';
import ReviewScreen from './screens/ReviewScreen';
import AdminAnalyticsScreen from './screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  
useEffect(() => {
  const setupNotifications = async () => {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission enabled');
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
  };

  setupNotifications();

  // Foreground notifications
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('Foreground message received:', remoteMessage);

    await notifee.displayNotification({
      title: remoteMessage.notification?.title ?? 'CarpoolMate',
      body: remoteMessage.notification?.body ?? 'You have a new notification.',
      android: {
        channelId: 'default',
      },
    });
  });

  // Background message handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message received:', remoteMessage);
  });

  // onTokenRefresh guarded
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
    console.log('FCM token refreshed:', token);

    const authToken = await AsyncStorage.getItem('userToken');
    if (authToken) {
      try {
        await api.post(
          '/users/store-fcm-token',
          { fcmToken: token },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log('Refreshed FCM token uploaded successfully.');
      } catch (error) {
        console.error('Error uploading refreshed FCM token:', error);
      }
    } else {
      console.log('No logged-in user during FCM token refresh; skipping upload.');
    }
  });

  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
}, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UnreadProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            
            <Stack.Screen name="Home" component={HomeScreenComponent} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="RiderDashboard" component={RiderTabs} />
            <Stack.Screen name="RideResultsScreen" component={RideResultsScreen} options={{ title: 'Available Rides' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="DriverDashboard" component={DriverTabs} />
            <Stack.Screen name="Payments" component={SendPaymentScreen}/>
            <Stack.Screen name="Wallet" component={WalletScreen}/>
            <Stack.Screen name="EditRide" component={EditRideScreen}/>
            <Stack.Screen name="chat" component={ChatScreen}/>
            <Stack.Screen name="review" component={ReviewScreen}/>
            <Stack.Screen name='analytics' component={AdminAnalyticsScreen}/>
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </UnreadProvider>
    </GestureHandlerRootView>
  );
}
