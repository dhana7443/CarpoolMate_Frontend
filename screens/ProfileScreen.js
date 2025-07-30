// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../src/api/axios'
// import {parseJwt} from '../utils/jwt'; 

// const ProfileScreen = () => {
//   const [profileData, setProfileData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//   });
//   const [editMode, setEditMode] = useState(false);
//   const [passwords, setPasswords] = useState({
//     currentPassword: '',
//     newPassword: '',
//   });

//   const getProfile = async () => {
//   const token = await AsyncStorage.getItem('userToken');
//   if (!token) return;
//   try {
//     const decoded = parseJwt(token);
//     if (!decoded) {
//       Alert.alert('Login failed', 'Invalid token received');
//       return;
//     }
//     const { data } = await api.get('/users/profile', {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const user = data.user;
//     setProfileData({
//       ...user,
//       phone: user.phone?.toString() || '', 
//     });
//   } catch (err) {
//     console.error(err);
//   }
// };


//   const updateProfile = async () => {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) return;
//     try {
//       const { data } = await api.put('/users/profile', profileData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const user=data.user;
//       setProfileData(...user);
//       setEditMode(false);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const changePassword = async () => {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) return;
//     try {
//       await api.put('/users/change-password', passwords, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setPasswords({ currentPassword: '', newPassword: '' });
//       Alert.alert('Success', 'Password changed successfully');
//     } catch (err) {
//       Alert.alert(
//         'Error',
//         err.response?.data?.message || 'Failed to change password'
//       );
//     }
//   };

//   useEffect(() => {
//     getProfile();
//   }, []);

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.heading}>My Profile</Text>

//       <View style={styles.card}>
//         <Text style={styles.label}>Name</Text>
//         <TextInput
//           style={styles.input}
//           value={profileData.name}
//           editable={editMode}
//           onChangeText={(text) => setProfileData({ ...profileData, name: text })}
//         />

//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={styles.input}
//           value={profileData.email}
//           editable={editMode}
//           onChangeText={(text) => setProfileData({ ...profileData, email: text })}
//         />

//         <Text style={styles.label}>Phone</Text>
//         <TextInput
//           style={styles.input}
//           value={profileData.phone}
//           editable={editMode}
//           keyboardType="phone-pad"
//           onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
//         />

//         <Text style={styles.label}>Gender</Text>
//         <TextInput
//           style={styles.input}
//           value={profileData.gender}
//           editable={editMode}
//           keyboardType="phone-pad"
//           onChangeText={(text) => setProfileData({ ...profileData, gender: text })}
//         />


//         <TouchableOpacity
//           style={styles.button}
//           onPress={() => (editMode ? updateProfile() : setEditMode(true))}
//         >
//           <Text style={styles.buttonText}>{editMode ? 'Save' : 'Edit Profile'}</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.heading}>Change Password</Text>

//         <Text style={styles.label}>Current Password</Text>
//         <TextInput
//           style={styles.input}
//           secureTextEntry
//           value={passwords.currentPassword}
//           onChangeText={(text) =>
//             setPasswords({ ...passwords, currentPassword: text })
//           }
//         />

//         <Text style={styles.label}>New Password</Text>
//         <TextInput
//           style={styles.input}
//           secureTextEntry
//           value={passwords.newPassword}
//           onChangeText={(text) =>
//             setPasswords({ ...passwords, newPassword: text })
//           }
//         />

//         <TouchableOpacity style={styles.button} onPress={changePassword}>
//           <Text style={styles.buttonText}>Update Password</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#f8fafc',
//   },
//   heading: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginBottom: 12,
//   },
//   card: {
//     backgroundColor: '#ffffff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 1, height: 1 },
//     shadowRadius: 4,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#374151',
//     marginBottom: 6,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#d1d5db',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: 12,
//     backgroundColor: '#f9fafb',
//   },
//   button: {
//     backgroundColor: '#2563eb',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import { parseJwt } from '../utils/jwt';

const ProfileScreen = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const getProfile = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    try {
      const decoded = parseJwt(token);
      if (!decoded) {
        Alert.alert('Login failed', 'Invalid token received');
        return;
      }
      const { data } = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = data.user;
      setProfileData({
        ...user,
        phone: user.phone?.toString() || '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    try {
      const { data } = await api.put('/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = data.user;
      setProfileData({ ...user, phone: user.phone?.toString() || '' });
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const changePassword = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    try {
      await api.put('/users/change-password', passwords, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswords({ currentPassword: '', newPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to change password'
      );
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Profile Information</Text>

      <View style={styles.card}>
        {['name', 'email', 'phone', 'gender'].map((field) => (
          <View key={field} style={styles.inputGroup}>
            <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
            <TextInput
              style={[styles.input, !editMode && styles.disabledInput]}
              value={profileData[field]}
              editable={editMode}
              keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
              onChangeText={(text) =>
                setProfileData({ ...profileData, [field]: text })
              }
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => (editMode ? updateProfile() : setEditMode(true))}
        >
          <Text style={styles.buttonText}>
            {editMode ? 'Save Changes' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Change Password</Text>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={passwords.currentPassword}
            onChangeText={(text) =>
              setPasswords({ ...passwords, currentPassword: text })
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={passwords.newPassword}
            onChangeText={(text) =>
              setPasswords({ ...passwords, newPassword: text })
            }
          />
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={changePassword}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#0f766e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});

