import React, { useState } from 'react';
import api from '../src/api/axios';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const SignupScreen = () => {
  const navigation = useNavigation();

  const [isRider, setIsRider] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);
  const [toggleCount, setToggleCount] = useState(0); // For forcing input re-render

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Gender modal
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [gender, setGender] = useState(null);
  const genderItems = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  // Input handlers
  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const validateField = (field, value) => {
    let error = '';
    if (!value) {
      error = 'This field is required';
    } else {
      switch (field) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email is not valid';
          break;
        case 'phone':
          if (!/^\d{10}$/.test(value)) error = 'Phone must be 10 digits';
          break;
        case 'password':
          if (value.length < 6) error = 'Password must be at least 6 characters';
          break;
        case 'gender':
          // handled by required
          break;
        default:
          break;
      }
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAllFields = () => {
    Object.keys(data).forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, data[field]);
    });
  };

  const isFormValid = () => {
    return Object.keys(data).every(field => data[field] && !errors[field]);
  };

  const handleSubmit = async () => {
    validateAllFields();
    if (!isFormValid()) {
      Alert.alert('Invalid Form', 'Please correct the highlighted errors.');
      return;
    }

    if (!isRider) {
      navigation.navigate('DriverDetails', { basicData: data });
    } else {
      const payload = {
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email,
        phone: data.phone,
        password: data.password,
        gender: data.gender,
        role_name: 'rider',
      };

      try {
        await api.post('/users/register', payload);
        Alert.alert('Success', 'Account created successfully! Verify your email.');
        navigation.navigate('EmailVerification');
      } catch (error) {
        Alert.alert('Registration Error', error.response?.data?.message || error.message);
      }
    }
  };

  const handleToggle = (riderSelected) => {
    setIsRider(riderSelected);
    setToggleCount(prev => prev + 1); // force input re-render

    // Reset all form state
    setData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      gender: '',
    });
    setGender(null);
    setErrors({});
    setTouched({});
    setFocusedInput(null);
    setGenderModalVisible(false);
  };

  // Handle modal close (for gender validation)
  const handleCloseGenderModal = () => {
    setGenderModalVisible(false);
    if (!gender) {
      setTouched(prev => ({ ...prev, gender: true }));
      validateField('gender', '');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.heading}>{isRider ? 'Register as a Rider' : 'Register as a Driver'}</Text>
        <Text style={styles.subheading}>Create a new account to get started</Text>
        <View style={styles.switchWrapper}>
          <TouchableOpacity
            style={[styles.switchButton, isRider && styles.switchActive]}
            onPress={() => handleToggle(true)}
          >
            <Text style={[styles.switchText, isRider && styles.switchTextActive]}>Rider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchButton, !isRider && styles.switchActive]}
            onPress={() => handleToggle(false)}
          >
            <Text style={[styles.switchText, !isRider && styles.switchTextActive]}>Driver</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'android' ? 100 : 80}
        contentContainerStyle={styles.scrollableForm}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {['firstName', 'lastName', 'email', 'phone', 'password'].map(field => (
            <View key={field}>
              <TextInput
                key={`${field}-${toggleCount}`}  // Force React to treat as new input on toggle
                style={[styles.input, focusedInput === field && styles.inputFocused]}
                placeholder={
                  field === 'firstName'
                    ? 'First Name'
                    : field === 'lastName'
                    ? 'Last Name'
                    : field === 'email'
                    ? 'Email'
                    : field === 'phone'
                    ? 'Phone Number'
                    : 'Password'
                }
                secureTextEntry={field === 'password'}
                keyboardType={
                  field === 'phone'
                    ? 'phone-pad'
                    : field === 'email'
                    ? 'email-address'
                    : 'default'
                }
                onFocus={() => setFocusedInput(field)}
                onBlur={() => {
                  setFocusedInput(null);
                  setTouched(prev => ({ ...prev, [field]: true }));
                  validateField(field, data[field]);
                }}
                value={data[field]}
                onChangeText={text => handleInputChange(field, text)}
              />
              {touched[field] && errors[field] && (
                <Text style={styles.error}>{errors[field]}</Text>
              )}
            </View>
          ))}

          {/* Gender */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setGenderModalVisible(true)}
            >
              <Text style={{ color: gender ? '#1F2937' : '#6B7280', fontSize: 15 }}>
                {gender || 'Select Gender'}
              </Text>
            </TouchableOpacity>
            {touched.gender && errors.gender && (
              <Text style={styles.error}>{errors.gender}</Text>
            )}

            <Modal
              transparent
              animationType="fade"
              visible={genderModalVisible}
              onRequestClose={handleCloseGenderModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Gender</Text>
                  {genderItems.map(item => (
                    <Pressable
                      key={item.value}
                      onPress={() => {
                        setGender(item.value);
                        handleInputChange('gender', item.value);
                        setTouched(prev => ({ ...prev, gender: true }));
                        validateField('gender', item.value);
                        setGenderModalVisible(false);
                      }}
                      style={styles.modalItem}
                    >
                      <Text style={styles.modalItemText}>{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Modal>
          </View>

          <TouchableOpacity
            style={[styles.ctaButton, !isFormValid() && styles.ctaDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid()}
          >
            <Text style={styles.ctaText}>Continue</Text>
            <Icon
              name="arrow-forward-circle-outline"
              size={22}
              color="#fff"
              style={styles.ctaIcon}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;

// Styles
const PRIMARY = '#1e40af';
const BORDER_DEFAULT = '#D1D5DB';
const BORDER_FOCUSED = PRIMARY;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  fixedHeader: { marginTop: 20, backgroundColor: '#0F172A', padding: 24 },
  scrollableForm: { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
  heading: { marginLeft: 10, fontSize: 20, fontWeight: 'bold', color: '#E2E8F0', textAlign: 'left', marginBottom: 6 },
  subheading: { fontSize: 16, color: '#CBD5E1', textAlign: 'center', marginBottom: 20 },
  switchWrapper: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 30, padding: 5, marginBottom: 10 },
  switchButton: { flex: 1, paddingVertical: 10, borderRadius: 30, alignItems: 'center' },
  switchActive: { backgroundColor: PRIMARY },
  switchText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  switchTextActive: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 20, borderWidth: 1.5, borderColor: '#334155', elevation: 4 },
  input: { height: 50, backgroundColor: '#FFFFFF', borderColor: BORDER_DEFAULT, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, marginBottom: 8, justifyContent: 'center', color: '#1F2937' },
  inputFocused: { borderColor: BORDER_FOCUSED },
  dropdownWrapper: { marginBottom: 8 },
  error: { color: 'red', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  ctaButton: { backgroundColor: PRIMARY, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 50, marginTop: 10 },
  ctaDisabled: { backgroundColor: '#A5B4FC' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
  ctaIcon: { marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '80%', borderRadius: 12, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  modalItem: { paddingVertical: 12, width: '100%', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalItemText: { fontSize: 16, color: '#1F2937' },
});