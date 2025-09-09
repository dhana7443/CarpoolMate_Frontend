import React,{useState} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet,Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ onMenuPress }) => {
  const [menuVisible, setMenuVisible]=useState(false);
  const navigation=useNavigation();

  const handleMenuItemPress = (screen) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoRow}>
        <Image source={require('../images/car.png')} style={styles.logo} />
        <Text style={styles.appName}>
          <Text style={styles.appNameBlue}>CarPool</Text>
          <Text style={styles.appNameBlack}>Mate</Text>
        </Text>
      </View>

      {/* Menu Button */}
      <TouchableOpacity onPress={()=>setMenuVisible(true)}>
        <Ionicons name="menu" size={30} color="#ffffff" />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('Wallet')}
            >
              <Text style={styles.menuText}>Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress('Profile')}
            >
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            

            {/* Add more menu items as needed */}
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#1E293B', // slate-700
  width: '100%',
  paddingVertical: 16,
  paddingHorizontal: 16, 
  marginBottom:0,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  appNameBlue: {
    color: '#3B82F6', // blue-500
  },
  appNameBlack: {
    color: '#38BDF8', // sky-400
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuCard: {
    backgroundColor: '#fff',
    width: 150,
    marginTop: 70,
    marginRight: 16,
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#1E293B',
  },
});
