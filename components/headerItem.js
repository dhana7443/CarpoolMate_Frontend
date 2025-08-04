import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Header = ({ onMenuPress }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoRow}>
        <Image source={require('../images/car.png')} style={styles.logo} />
        <Text style={styles.appName}>
          <Text style={styles.appNameBlue}>CarPool</Text>
          <Text style={styles.appNameBlack}>Mate</Text>
        </Text>
      </View>

      <TouchableOpacity onPress={onMenuPress}>
        <Ionicons name="menu" size={30} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#0F172A', // slate-700
  width: '100%',
  paddingVertical: 16,
  paddingHorizontal: 16, 
  marginBottom:20,
  borderBottomWidth:1,
  borderColor:'#cbd5e1'
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appNameBlue: {
    color: '#3B82F6', // blue-500
  },
  appNameBlack: {
    color: '#38BDF8', // sky-400
  },
});
