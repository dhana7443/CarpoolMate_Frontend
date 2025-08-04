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
import Icon from 'react-native-vector-icons/Feather'; 


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
      {/* <Text style={styles.heading}>Profile </Text> */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Profile</Text>
        <TouchableOpacity onPress={() => (editMode ? updateProfile() : setEditMode(true))}>
          <Icon name={editMode ? 'check' : 'edit'} size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>


      <View style={styles.section}>
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
      </View>

      <Text style={styles.heading}>Change Password</Text>

      <View style={styles.section}>
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

        <TouchableOpacity style={styles.button} onPress={changePassword}>
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
    backgroundColor: '#f1f5f9', // light gray background
    paddingHorizontal: 23,
    paddingVertical: 30,
    marginBottom:14
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b', // slate-800
    marginBottom: 12,
    marginTop: 10,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155', // slate-700
    marginBottom: 6,
  },
  headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1', // slate-300
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
    color: '#0f172a', // slate-900
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: '#64748b', // slate-500
  },
  button: {
    backgroundColor: '#2563eb', // blue-600
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#14b8a6', // teal-500
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});


