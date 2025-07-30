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
// import DropDownPicker from 'react-native-dropdown-picker';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';

// const SignupScreen = () => {
//   const navigation = useNavigation();

//   const [isRider, setIsRider] = useState(true);
//   const [focusedInput, setFocusedInput] = useState(null);

//   const [data, setData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     gender: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   // Dropdown Picker state
//   const [open, setOpen] = useState(false);
//   const [gender, setGender] = useState(null);
//   const genderItems = [
//     { label: 'Male', value: 'Male' },
//     { label: 'Female', value: 'Female' },
//     { label: 'Other', value: 'Other' },
//   ];

//   const handleInputChange = (field, value) => {
//     setData(prev => ({ ...prev, [field]: value }));
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
//         default:
//           break;
//       }
//     }
//     setErrors(prev => ({ ...prev, [field]: error }));
//   };

//   const validateAllFields = () => {
//     Object.keys(data).forEach(field => {
//       setTouched(prev => ({ ...prev, [field]: true }));
//       validateField(field, data[field]);
//     });
//   };

//   const isFormValid = () => {
//     return Object.keys(data).every(field => data[field] && !errors[field]);
//   };

//   const resetValidationStates = () => {
//     setErrors({});
//     setTouched({});
//   };

//   const resetForm = () => {
//     setData({
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       password: '',
//       gender: '',
//     });
//     setGender(null);
//     resetValidationStates();
//   };

//   const handleSubmit = async () => {
//     validateAllFields();

//     if (!isFormValid()) {
//       Alert.alert('Invalid Form', 'Please correct the highlighted errors.');
//       return;
//     }

//     if (!isRider) {
//       navigation.navigate('DriverDetails', { basicData: data });
//     } else {
//       const payload = {
//         name: `${data.firstName.trim()} ${data.lastName.trim()}`,
//         email: data.email,
//         phone: data.phone,
//         password: data.password,
//         gender: data.gender,
//         role_name: 'rider',
//       };

//       try {
//         await api.post('/users/register', payload);
//         Alert.alert('Success', 'Account created successfully! Verify your email.');
//         navigation.navigate('EmailVerification');
//       } catch (error) {
//         Alert.alert('Registration Error', error.response?.data?.message || error.message);
//       }
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.content}>
//         <Text style={styles.heading}>{isRider ? 'Register as a Rider' : 'Register as a Driver'}</Text>
//         <Text style={styles.subheading}>Create a new account to get started</Text>

//         <View style={styles.switchWrapper}>
//           <TouchableOpacity
//             style={[styles.switchButton, isRider && styles.switchActive]}
//             onPress={() => {setIsRider(true);
//               resetForm();
//             }}
//           >
//             <Text style={[styles.switchText, isRider && styles.switchTextActive]}>Rider</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.switchButton, !isRider && styles.switchActive]}
//             onPress={() => {
//               setIsRider(false);
//               resetForm();
//             }}
//           >
//             <Text style={[styles.switchText, !isRider && styles.switchTextActive]}>Driver</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.card}>
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
//                 keyboardType={field === 'phone' ? 'phone-pad' : field === 'email' ? 'email-address' : 'default'}
//                 onFocus={() => setFocusedInput(field)}
//                 onBlur={() => {
//                   setFocusedInput(null);
//                   setTouched(prev => ({ ...prev, [field]: true }));
//                   validateField(field, data[field]);
//                 }}
//                 value={data[field]}
//                 onChangeText={text => handleInputChange(field, text)}
//               />
//               {touched[field] && errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
//             </View>
//           ))}

//           <View style={styles.dropdownWrapper}>
//             <DropDownPicker
//               open={open}
//               value={gender}
//               items={genderItems}
//               setOpen={setOpen}
//               setValue={(callback) => {
//                 const value = callback(gender);
//                 setGender(value);
//                 handleInputChange('gender', value);
//                 setTouched(prev => ({ ...prev, gender: true }));
//                 validateField('gender', value);
//               }}
//               placeholder="Select Gender"
//               placeholderStyle={{ color: '#6B7280' }}
//               style={styles.dropdown}
//               dropDownContainerStyle={styles.dropdownContainer}
//               textStyle={{ color: '#1F2937', fontSize: 15 }}
//             />
//           </View>
//           {touched.gender && errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

//           <TouchableOpacity
//             style={[styles.ctaButton, !isFormValid() && styles.ctaDisabled]}
//             onPress={handleSubmit}
//             disabled={!isFormValid()}
//           >
//             <Text style={styles.ctaText}>Continue</Text>
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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [isRider, setIsRider] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);

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

  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(null);
  const genderItems = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

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

  const resetValidationStates = () => {
    setErrors({});
    setTouched({});
  };

  const resetForm = () => {
    setData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      gender: '',
    });
    setGender(null);
    resetValidationStates();
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          
            <Text style={styles.heading}>{isRider ? 'Register as a Rider' : 'Register as a Driver'}</Text>
            <Text style={styles.subheading}>Create a new account to get started</Text>

            <View style={styles.switchWrapper}>
              <TouchableOpacity
                style={[styles.switchButton, isRider && styles.switchActive]}
                onPress={() => {
                  setIsRider(true);
                  resetForm();
                }}
              >
                <Text style={[styles.switchText, isRider && styles.switchTextActive]}>Rider</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchButton, !isRider && styles.switchActive]}
                onPress={() => {
                  setIsRider(false);
                  resetForm();
                }}
              >
                <Text style={[styles.switchText, !isRider && styles.switchTextActive]}>Driver</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            >
            
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

              <View style={styles.dropdownWrapper}>
                <DropDownPicker
                  open={open}
                  value={gender}
                  items={genderItems}
                  setOpen={setOpen}
                  setValue={callback => {
                    const value = callback(gender);
                    setGender(value);
                    handleInputChange('gender', value);
                    setTouched(prev => ({ ...prev, gender: true }));
                    validateField('gender', value);
                  }}
                  placeholder="Select Gender"
                  placeholderStyle={{ color: '#6B7280' }}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={{ color: '#1F2937', fontSize: 15 }}
                  zIndex={1000}
                />
              </View>
              {touched.gender && errors.gender && (
                <Text style={styles.error}>{errors.gender}</Text>
              )}

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
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;

// const PRIMARY = '#5A67D8';
const PRIMARY='#1e40af';
const BORDER_DEFAULT = '#D1D5DB';
const BORDER_FOCUSED = PRIMARY;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    marginTop:20,
    padding: 24,
  },
  heading: {
    marginLeft:10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E2E8F0',
    textAlign: 'left',
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
    fontSize: 14,
    marginBottom: 8,
    color: '#1F2937',
  },
  inputFocused: {
    borderColor: BORDER_FOCUSED,
  },
  dropdownWrapper: {
    marginBottom: 8,
    zIndex: 1000, // Ensure dropdown overlays keyboard
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: BORDER_DEFAULT,
    borderRadius: 12,
    height: 50,
  },
  dropdownContainer: {
    borderColor: BORDER_DEFAULT,
    backgroundColor: '#FFFFFF',
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
