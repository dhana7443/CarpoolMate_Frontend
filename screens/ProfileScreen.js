
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import { parseJwt } from '../utils/jwt';
import Icon from 'react-native-vector-icons/Feather';
import DropDownPicker from 'react-native-dropdown-picker';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';


const ProfileScreen = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    role:'',
    experience:'',
    license_number:'',
    vehicle_number:''
  });
  const [editMode, setEditMode] = useState(false);

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation error states
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(null); // null, true, false

  // Eye icon states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Dropdown state for gender
  const [openGender, setOpenGender] = useState(false);
  const [genderItems, setGenderItems] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ]);

  //for checking whether the profile data changed or not
  const [originalProfileData,setOriginalProfileData]=useState(null);


  useEffect(() => {
  if (!newPassword || !confirmPassword) {
    setPasswordsMatch(null);
    setConfirmPasswordError(confirmPassword ? '' : ''); // no error if empty
    return;
  }
  if (newPassword === confirmPassword) {
    setPasswordsMatch(true);
    setConfirmPasswordError('');
  } else {
    setPasswordsMatch(false);
    setConfirmPasswordError('Passwords do not match');
  }
  }, [newPassword, confirmPassword]);

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
      const cleanUser=normalizeUser(user);
      setProfileData({...cleanUser});
      setOriginalProfileData({...cleanUser});
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {

    // Compare with original
    if (JSON.stringify(profileData) === JSON.stringify(originalProfileData)) {
      Toast.show({
        type: 'info',
        text1: 'No changes detected',
        position: 'top',   // options: 'top' | 'bottom'
        visibilityTime: 2000,
      });
      setEditMode(false);
      return; // ✅ stop here, don’t call backend
    }

    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    try {
      const { data } = await api.put('/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = data.user;
      const cleanUser=normalizeUser(user);

      setProfileData({...cleanUser});
      setOriginalProfileData({...cleanUser});
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const normalizeUser=(user)=>({
    ...user,
    phone: user.phone?.toString() || '',
    role: user.role || '',
    experience: user.experience?.toString() || '',
    license_number: user.license_number || '',
    vehicle_number: user.vehicle_number || ''
  })

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
  };


  const changePassword = async () => {
    let valid = true;

    if (!currentPassword) {
      setCurrentPasswordError('Current Password is required');
      valid = false;
    } else {
      setCurrentPasswordError('');
    }

    if (!newPassword) {
      setNewPasswordError('New Password is required');
      valid = false;
    } else {
      setNewPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm Password is required');
      valid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!valid) return;

    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    try {
      await api.put('/users/change-password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordsMatch(null);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (

    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Profile</Text>
          <TouchableOpacity onPress={() => (editMode ? updateProfile() : setEditMode(true))}>
            <Icon name={editMode ? 'check' : 'edit'} size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
      <View style={styles.section}>
        {['name', 'email', 'phone'].map((field) => (
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

        {/* Gender Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          {editMode ? (
            <DropDownPicker
              open={openGender}
              value={profileData.gender}
              items={genderItems}
              setOpen={setOpenGender}
              setValue={(callback) =>
                setProfileData((prev) => ({
                  ...prev,
                  gender: callback(prev.gender),
                }))
              }
              setItems={setGenderItems}
              placeholder="Select gender"
              style={styles.input}
              dropDownContainerStyle={{ borderColor: '#cbd5e1' }}
            />
          ) : (
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profileData.gender}
              editable={false}
            />
          )}
        </View>

        {/* Driver-only fields */}
        {profileData.role === 'driver' && (
          <>
            {['experience', 'license_number', 'vehicle_number'].map((field) => (
              <View key={field} style={styles.inputGroup}>
                <Text style={styles.label}>
                  {field
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </Text>
                <TextInput
                  style={[styles.input, !editMode && styles.disabledInput]}
                  value={profileData[field] != null
                  ? profileData[field].toString()
                  : ''}
                  editable={editMode}
                  onChangeText={(text) =>
                    setProfileData({ ...profileData, [field]: text })
                  }
                />
              </View>
            ))}
          </>
        )}
      
      </View>
      
      {/* Change Password Button */}
      <TouchableOpacity
        style={styles.changePasswordButton}
        onPress={() => setShowPasswordModal(true)}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      </ScrollView>

      {/* Modal */}
      <Modal visible={showPasswordModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>

            {/* Current Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Current Password"
                placeholderTextColor="#666"
                secureTextEntry={!showCurrent}
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                <Feather name={showCurrent ? "eye" : "eye-off"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {currentPasswordError ? <Text style={styles.errorText}>{currentPasswordError}</Text> : null}

            {/* New Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="New Password"
                placeholderTextColor="#666"
                secureTextEntry={!showNew}
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Feather name={showNew ? "eye" : "eye-off"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}

            {/* Confirm Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm New Password"
                placeholderTextColor="#666"
                secureTextEntry={!showConfirm}
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Feather name={showConfirm ? "eye" : "eye-off"} size={20} color="#666" />
              </TouchableOpacity>
              {passwordsMatch !== null && (
                <Feather
                  name={passwordsMatch ? "check-circle" : "x-circle"}
                  size={20}
                  color={passwordsMatch ? "green" : "red"}
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={{ color: "#000" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#1e40af" }]}
                onPress={changePassword}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast/>
    </View>
    
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#f9f9f9', 
    paddingHorizontal: 23, 
    paddingVertical: 30 },
  heading: {
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 12, 
    marginTop: 10 },
  section: {
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 24, 
    elevation: 3 
  },
  inputGroup: { 
    marginBottom: 14 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#334155', 
    marginBottom: 6 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    fontSize: 14, 
    backgroundColor: '#f9f9f9', 
    color: '#0f172a' 
  },
  disabledInput: { 
    backgroundColor: '#f1f5f9', 
    color: '#64748b' 
  },
  changePasswordButton: { 
    backgroundColor: "#1e40af", 
    padding: 10, borderRadius: 8, 
    marginTop: 20 
  },
  buttonText: { 
    color: "#fff", 
    textAlign: "center", 
    fontWeight: "bold" 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalCard: { 
    width: "85%", 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    padding: 20, 
    elevation: 5 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 15, 
    textAlign: "center"
  },
  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: "#D1D5DB", 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    marginBottom: 5 
  },
  passwordInput: { 
    flex: 1, 
    paddingVertical: 8, 
    color: "#000" },
  errorText: { 
    color: 'red', 
    fontSize: 12, 
    marginBottom: 8
  },
  buttonRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 10 
  },
  modalButton: { 
    flex: 1, 
    padding: 10, 
    borderRadius: 8, 
    alignItems: "center", 
    marginHorizontal: 5 
  },
});
