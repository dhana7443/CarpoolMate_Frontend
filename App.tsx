
// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const App = () => {
//   return (
//     <View>
//       <Text>App</Text>
//     </View>
//   )
// }

// export default App;


import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreenComponent from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import EmailVerificationScreen from './components/EmailVerificationScreen';
import SearchRidesScreen from './components/SearchRidesScreen';
import RideResultsScreen from './components/RideResultsScreen';
import Toast from 'react-native-toast-message';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import VerifyOtpScreen from './components/VerifyOtpScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import DriverTabs from './components/DriverTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreenComponent} />
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="Signup" component={SignupScreen}/>
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen}/>
          <Stack.Screen name="RiderDashboard" component={SearchRidesScreen}/>
          <Stack.Screen name="RideResultsScreen" component={RideResultsScreen} options={{title:'Available Rides'}}/>
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen}/>
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
          <Stack.Screen name="DriverDashboard" component={DriverTabs}/>
        </Stack.Navigator>
      </NavigationContainer>
      <Toast/>
    </GestureHandlerRootView>
  );
}


