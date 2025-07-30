import React, { useEffect } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LandingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centered}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../images/car.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>
          <Text style={styles.primary}>Carpool</Text>
          <Text style={styles.accent}>Mate</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LandingScreen;

const PRIMARY = '#3B82F6'; // Tailwind blue-500
const SCREEN_BG = '#0F172A'; // Dark slate
const TEXT_LIGHT = '#F8FAFC'; // Light slate
const TEXT_ACCENT = '#38BDF8'; // Cyan-400


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,                  // subtle shadow for Android
    shadowColor: '#000',           // neutral shadow color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
},
logo: {
    width: 120,
    height: 120,
    borderRadius: 60,             // circular clip
},

  appName: {
    fontSize: 26,      // optimized for small screens
    fontWeight: '700',
    textAlign: 'center',
  },
  primary: {
    color: '#3B82F6', // Cyan blue for "Carpool"
  },
  accent: {
    color: '#38BDF8',  // White for "Mate"
  },
});



