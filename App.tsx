// import React, { useEffect } from 'react';
// import { Platform, PermissionsAndroid } from 'react-native';
// import notifee, { AndroidImportance } from '@notifee/react-native';
// import {
//   requestPermission,
//   getMessaging,
//   AuthorizationStatus,
//   getToken,
//   onMessage,
//   onNotificationOpenedApp,
//   getInitialNotification,
// } from '@react-native-firebase/messaging';
// import messaging from '@react-native-firebase/messaging';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import api from "./src/api/axios";
// import HomeScreenComponent from './components/HomeScreen';
// import LoginScreen from './components/LoginScreen';
// import SignupScreen from './components/SignupScreen';
// import EmailVerificationScreen from './components/EmailVerificationScreen';
// import SearchRidesScreen from './components/SearchRidesScreen';
// import RideResultsScreen from './components/RideResultsScreen';
// import Toast from 'react-native-toast-message';
// import ForgotPasswordScreen from './components/ForgotPasswordScreen';
// import VerifyOtpScreen from './components/VerifyOtpScreen';
// import ResetPasswordScreen from './components/ResetPasswordScreen';
// import DriverTabs from './components/DriverTabs';
// import { UnreadProvider } from './components/unreadContext';
// import DriverDetailsScreen from './components/DriverDetailsScreen';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   //  Create notification channel for Android
//   useEffect(() => {
//     const createChannel = async () => {
//       await notifee.createChannel({
//         id: 'default',
//         name: 'Default Channel',
//         importance: AndroidImportance.HIGH,
//       });
//     };
//     createChannel();
//   }, []);

//   //  Request user permission for notifications
//   const requestUserPermission = async () => {
//     const authStatus = await requestPermission();
//     const enabled =
//       authStatus === AuthorizationStatus.AUTHORIZED ||
//       authStatus === AuthorizationStatus.PROVISIONAL;

//     if (enabled) {
//       console.log(' Notification permission enabled');
//     }

//     if (Platform.OS === 'android' && Platform.Version >= 33) {
//       await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
//     }
//   };

//   //  Get FCM token
//   const getFcmToken = async () => {
//     try {
//       const token = await getToken(getMessaging());
//       console.log(' FCM Token:', token);

//       const authToken = await AsyncStorage.getItem('userToken');
//       console.log(authToken);

//       const res = await api.post(
//         '/users/store-fcm-token',
//         { fcmToken: token },
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       console.log(" FCM Token stored:", res.data);
//     } catch (error) {
//       console.error(' Error getting FCM token:', error);
//     }
//   };

//   //  Handle notifications
//   useEffect(() => {
//     const initNotifications = async () => {
//       await requestUserPermission();

//       const token = await AsyncStorage.getItem('userToken');
//       if (token) {
//         await getFcmToken();
//         Toast.show({ type: 'success', text1: 'Sending FCM token...' });
//       } else {
//         console.log(" No auth token — skipping FCM token upload");
//       }
//     };

//     initNotifications();

//     //  Foreground notification listener
//     const unsubscribeForeground = onMessage(getMessaging(), async remoteMessage => {
//       console.log(' Foreground message:', remoteMessage);

//       await notifee.displayNotification({
//         title: remoteMessage.notification?.title || 'CarpoolMate',
//         body: remoteMessage.notification?.body || 'You have a new update.',
//         android: {
//           channelId: 'default',
//         },
//       });
//     });

//     //  Background notification handler
//     messaging().setBackgroundMessageHandler(async remoteMessage => {
//       console.log(' Background message:', remoteMessage);
//     });

//     //  App opened from background by notification
//     const unsubscribeOpenedApp = onNotificationOpenedApp(getMessaging(), remoteMessage => {
//       console.log(' App opened from background by notification:', remoteMessage);
//       // TODO: Handle deep linking or navigation
//     });

//     //  App opened from quit (cold start) by notification
//     getInitialNotification(getMessaging()).then(remoteMessage => {
//       if (remoteMessage) {
//         console.log(' App opened from quit state by notification:', remoteMessage);
//         // TODO: Handle deep linking or navigation
//       }
//     });

//     return () => {
//       unsubscribeForeground();
//       unsubscribeOpenedApp();
//     };
//   }, []);

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <UnreadProvider>
//       <NavigationContainer>
//         <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="Home" component={HomeScreenComponent} />
//           <Stack.Screen name="Login" component={LoginScreen} />
//           <Stack.Screen name="Signup" component={SignupScreen} />
//           <Stack.Screen name="DriverDetails" component={DriverDetailsScreen}/>
//           <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
//           <Stack.Screen name="RiderDashboard" component={SearchRidesScreen} />
//           <Stack.Screen name="RideResultsScreen" component={RideResultsScreen} options={{ title: 'Available Rides' }} />
//           <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//           <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
//           <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
//           <Stack.Screen name="DriverDashboard" component={DriverTabs} />
//         </Stack.Navigator>
//       </NavigationContainer>
//       <Toast />
//       </UnreadProvider>
//     </GestureHandlerRootView>
//   );
  
// }

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
import SearchRidesScreen from './screens/SearchRidesScreen';
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

const Stack = createNativeStackNavigator();

export default function App() {
  // useEffect(() => {
  //   const setupNotifications = async () => {
  //     try {
  //       await notifee.createChannel({
  //         id: 'default',
  //         name: 'Default Channel',
  //         importance: AndroidImportance.HIGH,
  //       });

  //       const authStatus = await messaging().requestPermission();
  //       const enabled =
  //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //       console.log('Notification permission status:', authStatus);

  //       if (Platform.OS === 'android' && Platform.Version >= 33) {
  //         const granted = await PermissionsAndroid.request(
  //           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  //         );
  //         console.log('POST_NOTIFICATIONS permission:', granted);
  //       }

  //       // setupNotifications();

  //       const fcmToken = await messaging().getToken();
  //       console.log('FCM Token:', fcmToken);

  //       const authToken = await AsyncStorage.getItem('userToken');
  //       if (authToken && fcmToken) {
  //         const res = await api.post(
  //           '/users/store-fcm-token',
  //           { fcmToken },
  //           { headers: { Authorization: `Bearer ${authToken}` } }
  //         );
  //         console.log('FCM token stored:', res.data);
  //       } else {
  //         console.log('No auth token, skipping token upload.');
  //       }
  //     } catch (error) {
  //       console.error('Error setting up notifications:', error);
  //     }
  //   };

  //   setupNotifications();

  //   const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
  //     console.log('Foreground notification received:', JSON.stringify(remoteMessage));
  //     await notifee.displayNotification({
  //       title: remoteMessage.notification?.title || 'CarpoolMate',
  //       body: remoteMessage.notification?.body || 'You have a new update.',
  //       android: { channelId: 'default' },
  //     });
  //   });

  //   messaging().setBackgroundMessageHandler(async remoteMessage => {
  //     console.log('Background notification received:', JSON.stringify(remoteMessage));
  //   });

  //   const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
  //     console.log('Notification opened from background:', JSON.stringify(remoteMessage));
  //   });

  //   messaging().getInitialNotification().then(remoteMessage => {
  //     if (remoteMessage) {
  //       console.log('Notification opened from quit state:', JSON.stringify(remoteMessage));
  //     }
  //   });

  //   return () => {
  //     unsubscribeForeground();
  //     unsubscribeOpenedApp();
  //   };
  // }, []);
  // inside your App component:
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
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </UnreadProvider>
    </GestureHandlerRootView>
  );
}
