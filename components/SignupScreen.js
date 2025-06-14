// import React, { useState } from 'react';
// import api from '../src/api/axios';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   Alert,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../types';

// const SignupScreen:React.FC = () => {
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//   const [isRider, setIsRider] = useState(true);
//   const [focusedInput, setFocusedInput] = useState(null);

//   const [riderData, setRiderData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     gender: '',
//   });

//   const [driverData, setDriverData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     gender: '',
//     experience: '',
//     licenseNumber: '',
//     vehicleNumber: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [riderTouched, setRiderTouched] = useState({});
//   const [driverTouched, setDriverTouched] = useState({});

//   const data = isRider ? riderData : driverData;
//   const setData = isRider ? setRiderData : setDriverData;
//   const touched = isRider ? riderTouched : driverTouched;
//   const setTouched = isRider ? setRiderTouched : setDriverTouched;

//   const handleInputChange = (field, value) => {
//     setData(prev => ({ ...prev, [field]: value }));

//     // Only validate if user has interacted with field
//     if (touched[field]) {
//       validateField(field, value);
//     }
//   };

//   const validateField = (field, value) => {
//     let error = '';

//     if (!value) {
//       error = 'This field is required';
//     } else {
//       switch (field) {
//         case 'email':
//           if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//             error = 'Email is not valid';
//           }
//           break;
//         case 'phone':
//           if (!/^\d{10}$/.test(value)) {
//             error = 'Phone must be 10 digits';
//           }
//           break;
//         case 'password':
//           if (value.length < 6) {
//             error = 'Password must be at least 6 characters';
//           }
//           break;
//         case 'experience':
//           if (!/^\d+$/.test(value)) {
//             error = 'Experience must be a number';
//           }
//           break;
//         default:
//           break;
//       }
//     }

//     setErrors(prev => ({ ...prev, [field]: error }));
//   };

//   const validateAllFields = () => {
//     const fields = Object.keys(data);
//     fields.forEach(field => {
//       setTouched(prev => ({ ...prev, [field]: true }));
//       validateField(field, data[field]);
//     });
//   };

//   const isFormValid = () => {
//     return Object.keys(data).every(field => data[field] && !errors[field]);
//   };

//   const handleSubmit = async() => {
//     validateAllFields();

//     if (!isFormValid()) {
//       Alert.alert('Invalid Form', 'Please correct the highlighted errors.');
//       return;
//     }

//     // Prepare payload for backend
//   const payload = {
//     name: `${data.firstName.trim()} ${data.lastName.trim()}`,  // combine first and last name
//     email: data.email,
//     phone: data.phone,
//     password: data.password,
//     gender: data.gender,
//     role_name: isRider ? 'rider' : 'driver',  // send role_name as string backend expects
//   };

//   // Add driver-specific fields if role is driver
//   if (!isRider) {
//     payload.experience = data.experience;
//     payload.license_number = data.licenseNumber;
//     payload.vehicle_number = data.vehicleNumber;
//   }

//   try {
//     const response = await api.post('/users/register', payload);  // replace '/register' with your actual API endpoint
//     Alert.alert('Success', 'Account created successfully!.Verify your email');
//     navigation.navigate('EmailVerification');
//   } catch (error) {
//     Alert.alert('Registration Error', error.response?.data?.message || error.message);
//   }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.content}>
//         <Text style={styles.heading}>
//           {isRider ? 'Register as a Rider' : 'Register as a Driver'}
//         </Text>
//         <Text style={styles.subheading}>Create a new account to get started</Text>

//         <View style={styles.switchWrapper}>
//           <TouchableOpacity
//             style={[styles.switchButton, isRider && styles.switchActive]}
//             onPress={() => setIsRider(true)}
//           >
//             <Text style={[styles.switchText, isRider && styles.switchTextActive]}>Rider</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.switchButton, !isRider && styles.switchActive]}
//             onPress={() => setIsRider(false)}
//           >
//             <Text style={[styles.switchText, !isRider && styles.switchTextActive]}>Driver</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.card}>
//           {/* Common Inputs */}
//           {['firstName', 'lastName', 'email', 'phone', 'password'].map(field => (
//             <View key={field}>
//               <TextInput
//                 style={[styles.input, focusedInput === field && styles.inputFocused]}
//                 placeholder={
//                   field === 'firstName'
//                     ? 'First Name'
//                     : field === 'lastName'
//                     ? 'Last Name'
//                     : field === 'email'
//                     ? 'Email'
//                     : field === 'phone'
//                     ? 'Phone Number'
//                     : 'Password'
//                 }
//                 secureTextEntry={field === 'password'}
//                 keyboardType={
//                   field === 'phone' ? 'phone-pad' : field === 'email' ? 'email-address' : 'default'
//                 }
//                 onFocus={() => setFocusedInput(field)}
//                 onBlur={() => {
//                   setFocusedInput(null);
//                   setTouched(prev => ({ ...prev, [field]: true }));
//                   validateField(field, data[field]);
//                 }}
//                 value={data[field]}
//                 onChangeText={text => handleInputChange(field, text)}
//               />
//               {touched[field] && errors[field] && (
//                 <Text style={styles.error}>{errors[field]}</Text>
//               )}
//             </View>
//           ))}

//           {/* Gender Picker */}
//           <View style={styles.pickerWrapper}>
//             <Picker
//               selectedValue={data.gender}
//               onValueChange={value => {
//                 handleInputChange('gender', value);
//                 setTouched(prev => ({ ...prev, gender: true }));
//                 validateField('gender', value);
//               }}
//               style={styles.picker}
//               dropdownIconColor="#555"
//             >
//               <Picker.Item label="Select Gender" value="" />
//               <Picker.Item label="Male" value="Male" />
//               <Picker.Item label="Female" value="Female" />
//               <Picker.Item label="Other" value="Other" />
//             </Picker>
//           </View>
//           {touched.gender && errors.gender && (
//             <Text style={styles.error}>{errors.gender}</Text>
//           )}

//           {/* Driver-only Fields */}
//           {!isRider && (
//             <>
//               <TextInput
//                 style={[styles.input, focusedInput === 'experience' && styles.inputFocused]}
//                 placeholder="Experience (in years)"
//                 keyboardType="numeric"
//                 onFocus={() => setFocusedInput('experience')}
//                 onBlur={() => {
//                   setFocusedInput(null);
//                   setTouched(prev => ({ ...prev, experience: true }));
//                   validateField('experience', driverData.experience);
//                 }}
//                 value={driverData.experience}
//                 onChangeText={text => handleInputChange('experience', text)}
//               />
//               {driverTouched.experience && errors.experience && (
//                 <Text style={styles.error}>{errors.experience}</Text>
//               )}

//               <TextInput
//                 style={[styles.input, focusedInput === 'licenseNumber' && styles.inputFocused]}
//                 placeholder="License Number"
//                 onFocus={() => setFocusedInput('licenseNumber')}
//                 onBlur={() => {
//                   setFocusedInput(null);
//                   setTouched(prev => ({ ...prev, licenseNumber: true }));
//                   validateField('licenseNumber', driverData.licenseNumber);
//                 }}
//                 value={driverData.licenseNumber}
//                 onChangeText={text => handleInputChange('licenseNumber', text)}
//               />
//               {driverTouched.licenseNumber && errors.licenseNumber && (
//                 <Text style={styles.error}>{errors.licenseNumber}</Text>
//               )}

//               <TextInput
//                 style={[styles.input, focusedInput === 'vehicleNumber' && styles.inputFocused]}
//                 placeholder="Vehicle Number"
//                 onFocus={() => setFocusedInput('vehicleNumber')}
//                 onBlur={() => {
//                   setFocusedInput(null);
//                   setTouched(prev => ({ ...prev, vehicleNumber: true }));
//                   validateField('vehicleNumber', driverData.vehicleNumber);
//                 }}
//                 value={driverData.vehicleNumber}
//                 onChangeText={text => handleInputChange('vehicleNumber', text)}
//               />
//               {driverTouched.vehicleNumber && errors.vehicleNumber && (
//                 <Text style={styles.error}>{errors.vehicleNumber}</Text>
//               )}
//             </>
//           )}

//           <TouchableOpacity
//             style={[styles.ctaButton, !isFormValid() && styles.ctaDisabled]}
//             onPress={handleSubmit}
//             disabled={!isFormValid()}
//           >
//             <Text style={styles.ctaText}>Sign Up</Text>
//             <Icon name="arrow-forward-circle-outline" size={22} color="#fff" style={styles.ctaIcon} />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default SignupScreen;


import React, { useState } from 'react';
import api from '../src/api/axios';
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
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = () => {
  const navigation = useNavigation();

  const [isRider, setIsRider] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);

  const [riderData, setRiderData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
  });

  const [driverData, setDriverData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    experience: '',
    licenseNumber: '',
    vehicleNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [riderTouched, setRiderTouched] = useState({});
  const [driverTouched, setDriverTouched] = useState({});

  const data = isRider ? riderData : driverData;
  const setData = isRider ? setRiderData : setDriverData;
  const touched = isRider ? riderTouched : driverTouched;
  const setTouched = isRider ? setRiderTouched : setDriverTouched;

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
      switch (field) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = 'Email is not valid';
          }
          break;
        case 'phone':
          if (!/^\d{10}$/.test(value)) {
            error = 'Phone must be 10 digits';
          }
          break;
        case 'password':
          if (value.length < 6) {
            error = 'Password must be at least 6 characters';
          }
          break;
        case 'experience':
          if (!/^\d+$/.test(value)) {
            error = 'Experience must be a number';
          }
          break;
        default:
          break;
      }
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAllFields = () => {
    const fields = Object.keys(data);
    fields.forEach(field => {
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
      name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      email: data.email,
      phone: data.phone,
      password: data.password,
      gender: data.gender,
      role_name: isRider ? 'rider' : 'driver',
    };

    if (!isRider) {
      payload.experience = data.experience;
      payload.license_number = data.licenseNumber;
      payload.vehicle_number = data.vehicleNumber;
    }

    try {
      const response = await api.post('/users/register', payload);
      Alert.alert('Success', 'Account created successfully!.Verify your email');
      navigation.navigate('EmailVerification');
    } catch (error) {
      Alert.alert('Registration Error', error.response?.data?.message || error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>
          {isRider ? 'Register as a Rider' : 'Register as a Driver'}
        </Text>
        <Text style={styles.subheading}>Create a new account to get started</Text>

        <View style={styles.switchWrapper}>
          <TouchableOpacity
            style={[styles.switchButton, isRider && styles.switchActive]}
            onPress={() => setIsRider(true)}
          >
            <Text style={[styles.switchText, isRider && styles.switchTextActive]}>Rider</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchButton, !isRider && styles.switchActive]}
            onPress={() => setIsRider(false)}
          >
            <Text style={[styles.switchText, !isRider && styles.switchTextActive]}>Driver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {['firstName', 'lastName', 'email', 'phone', 'password'].map(field => (
            <View key={field}>
              <TextInput
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
                  field === 'phone' ? 'phone-pad' : field === 'email' ? 'email-address' : 'default'
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

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={data.gender}
              onValueChange={value => {
                handleInputChange('gender', value);
                setTouched(prev => ({ ...prev, gender: true }));
                validateField('gender', value);
              }}
              style={styles.picker}
              dropdownIconColor="#555"
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          {touched.gender && errors.gender && (
            <Text style={styles.error}>{errors.gender}</Text>
          )}

          {!isRider && (
            <>
              <TextInput
                style={[styles.input, focusedInput === 'experience' && styles.inputFocused]}
                placeholder="Experience (in years)"
                keyboardType="numeric"
                onFocus={() => setFocusedInput('experience')}
                onBlur={() => {
                  setFocusedInput(null);
                  setTouched(prev => ({ ...prev, experience: true }));
                  validateField('experience', driverData.experience);
                }}
                value={driverData.experience}
                onChangeText={text => handleInputChange('experience', text)}
              />
              {driverTouched.experience && errors.experience && (
                <Text style={styles.error}>{errors.experience}</Text>
              )}

              <TextInput
                style={[styles.input, focusedInput === 'licenseNumber' && styles.inputFocused]}
                placeholder="License Number"
                onFocus={() => setFocusedInput('licenseNumber')}
                onBlur={() => {
                  setFocusedInput(null);
                  setTouched(prev => ({ ...prev, licenseNumber: true }));
                  validateField('licenseNumber', driverData.licenseNumber);
                }}
                value={driverData.licenseNumber}
                onChangeText={text => handleInputChange('licenseNumber', text)}
              />
              {driverTouched.licenseNumber && errors.licenseNumber && (
                <Text style={styles.error}>{errors.licenseNumber}</Text>
              )}

              <TextInput
                style={[styles.input, focusedInput === 'vehicleNumber' && styles.inputFocused]}
                placeholder="Vehicle Number"
                onFocus={() => setFocusedInput('vehicleNumber')}
                onBlur={() => {
                  setFocusedInput(null);
                  setTouched(prev => ({ ...prev, vehicleNumber: true }));
                  validateField('vehicleNumber', driverData.vehicleNumber);
                }}
                value={driverData.vehicleNumber}
                onChangeText={text => handleInputChange('vehicleNumber', text)}
              />
              {driverTouched.vehicleNumber && errors.vehicleNumber && (
                <Text style={styles.error}>{errors.vehicleNumber}</Text>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.ctaButton, !isFormValid() && styles.ctaDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid()}
          >
            <Text style={styles.ctaText}>Sign Up</Text>
            <Icon name="arrow-forward-circle-outline" size={22} color="#fff" style={styles.ctaIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;

// // -------- STYLES ---------

const PRIMARY = '#5A67D8';
const BORDER_DEFAULT = '#D1D5DB';
const BORDER_FOCUSED = PRIMARY;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 30,
  },
  switchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    padding: 5,
    marginBottom: 20,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: PRIMARY,
  },
  switchText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  switchTextActive: {
    color: '#fff',
    fontWeight: '600',
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: BORDER_DEFAULT,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    color: '#1F2937',
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
