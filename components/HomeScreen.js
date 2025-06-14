// import React,{useEffect} from 'react';
// import {
//   Image,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,

// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import type { RootStackParamList } from '../types';


// const LandingScreen: React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();



//   useEffect(() => {
//       const timer = setTimeout(() => {
//         navigation.replace('Login');
//       }, 2000);

//       return () => clearTimeout(timer);
//     }, [navigation]);

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.centered}>
//         <View style={styles.logoContainer}>

//           <Image
//             source={require('../images/carpool_logo.png')}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//         </View>

//         {/* App Name */}
//         <Text style={styles.appName}>
//           <Text style={styles.primary}>Carpool</Text>
//           <Text style={styles.accent}>Mate</Text>
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default LandingScreen;

// const PRIMARY = '#3B82F6'; // Tailwind blue-500
// const SCREEN_BG = '#0F172A'; // Dark slate
// const TEXT_LIGHT = '#F8FAFC'; // Light slate
// const TEXT_ACCENT = '#38BDF8'; // Cyan-400
// const LOGO_GLOW = '#2563EB'; // Blue-600

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: SCREEN_BG,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   logoContainer: {
//     marginBottom: -5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 150,
//     height: 150,
//   },
//   appName: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: TEXT_LIGHT,
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   primary: {
//     color: PRIMARY,
//   },
//   accent: {
//     color: TEXT_ACCENT,
//   },

// });

import React, { useEffect } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
            source={require('../images/carpool_logo.png')}
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
    marginBottom: -5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_LIGHT,
    marginBottom: 30,
    textAlign: 'center',
  },
  primary: {
    color: PRIMARY,
  },
  accent: {
    color: TEXT_ACCENT,
  },
});
