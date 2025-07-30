import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../src/api/axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const DriverDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const basicData = route.params?.basicData || {};

  const [data, setData] = useState({
    experience: '',
    licenseNumber: '',
    vehicleNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);

  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const validateField = (field, value) => {
    let error = '';

    if (!value) {
      error = 'This field is required';
    } else {
      if (field === 'experience' && !/^\d+$/.test(value)) {
        error = 'Experience must be a number';
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

    const payload = {
      name: `${basicData.firstName.trim()} ${basicData.lastName.trim()}`,
      email: basicData.email,
      phone: basicData.phone,
      password: basicData.password,
      gender: basicData.gender,
      role_name: 'driver',
      experience: data.experience,
      license_number: data.licenseNumber,
      vehicle_number: data.vehicleNumber,
    };

    try {
      await api.post('/users/register', payload);
      Alert.alert('Success', 'Driver account created successfully! Verify your email.');
      navigation.navigate('EmailVerification');
    } catch (error) {
      Alert.alert('Registration Error', error.response?.data?.message || error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Driver Details</Text>
        <Text style={styles.subheading}>Complete your driver profile to proceed</Text>

        <View style={styles.card}>
          {[
            { field: 'experience', placeholder: 'Experience (in years)', keyboardType: 'numeric' },
            { field: 'licenseNumber', placeholder: 'License Number' },
            { field: 'vehicleNumber', placeholder: 'Vehicle Number' },
          ].map(({ field, placeholder, keyboardType = 'default' }) => (
            <View key={field}>
              <TextInput
                style={[styles.input, focusedInput === field && styles.inputFocused]}
                placeholder={placeholder}
                keyboardType={keyboardType}
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

          <TouchableOpacity
            style={[styles.ctaButton, !isFormValid() && styles.ctaDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid()}
          >
            <Text style={styles.ctaText}>Complete Registration</Text>
            <Icon name="arrow-forward-circle-outline" size={22} color="#fff" style={styles.ctaIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverDetailsScreen;

const PRIMARY = '#5A67D8';
const BORDER_DEFAULT = '#D1D5DB';
const BORDER_FOCUSED = PRIMARY;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    
  },
  content: {
    marginTop:30,
    padding: 24,
    
  },
  heading: {
    marginLeft:10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E2E8F0',
    textAlign: 'left',
    marginBottom: 6,
  },
  subheading: {
    marginLeft:10,
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'eft',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    elevation: 4,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderColor: BORDER_DEFAULT,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 8,
    color: '#1F2937',
  },
  inputFocused: {
    borderColor: BORDER_FOCUSED,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  ctaButton: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    marginTop: 10,
  },
  ctaDisabled: {
    backgroundColor: '#A5B4FC',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  ctaIcon: {
    marginTop: 1,
  },
});
