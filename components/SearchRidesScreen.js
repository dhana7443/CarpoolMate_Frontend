// // SearchRidesScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Button,
//   StyleSheet,
//   Modal,
//   TextInput,
// } from 'react-native';
// import tw from 'twrnc';
// import api from '../src/api/axios';
// import { Picker } from '@react-native-picker/picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { parseJwt } from '../utils/jwt';
// import { useNavigation } from '@react-navigation/native';

// const SearchRidesScreen = () => {
//   const [fromLocations, setFromLocations] = useState([]);
//   const [toLocations, setToLocations] = useState([]);
//   const [selectedFrom, setSelectedFrom] = useState('');
//   const [selectedTo, setSelectedTo] = useState('');
//   const [rideDate, setRideDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   //const [rides, setRides] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [showProfile, setShowProfile] = useState(false);
//   const [profileData, setProfileData] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

//   const navigation = useNavigation();

//   const fetchFromLocations = async () => {
//     try {
//       const { data } = await api.get('/routes/start-stops');
//       const uniqueStopNames = data.map((item) => item.stop_name);
//       setFromLocations(uniqueStopNames);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const fetchToLocations = async (startStopName) => {
//     try {
//       const { data } = await api.get('/routes/end-stops', {
//         params: { startStopName },
//       });
//       const uniqueToStopNames = data.map((item) => item.stop_name);
//       setToLocations(uniqueToStopNames);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const searchRides = async () => {
//     if (!selectedFrom || !selectedTo || !rideDate) {return;}
//     try {
//       setLoading(true);
//       const { data } = await api.get('/rides/search-rides', {
//         params: {
//           startStopName: selectedFrom,
//           endStopName: selectedTo,
//           date: rideDate.toISOString().split('T')[0],
//         },
//       });

//       if (data && data.rides){
//         navigation.navigate('RideResultsScreen', {
//           rides: data.rides,
//           from: selectedFrom,
//           to: selectedTo,
//           date: rideDate.toISOString().split('T')[0],
//         });
//       }else{
//         Alert.alert('No rides found');
//       }
//     } catch (err) {
//       console.error('Error fetching rides:',err);
//       Alert.alert('error fetching rides');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getProfile = async () => {
//     const token = await AsyncStorage.getItem('userToken');
//     console.log(token);
//     if (!token) {return;}
//     try {
//       const decoded = parseJwt(token);
//       if (!decoded){
//           Alert.alert('Login failed','invalid token received');
//         }
//       const {  user_id } = decoded;

//       const { data } = await api.get('/users/profile', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setProfileData(data.user);
//       setShowProfile(true);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const updateProfile = async () => {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {return;}
//     try {
//       const { data } = await api.put('/users/profile', profileData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setProfileData(data.user);
//       setEditMode(false);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const changePassword = async () => {
//     const token = await AsyncStorage.getItem('userToken');
//     if (!token) {return;}
//     try {
//       await api.put(
//         '/users/change-password',
//         passwords,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setPasswords({ currentPassword: '', newPassword: '' });
//       alert('Password changed successfully');
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to change password');
//     }
//   };

//   useEffect(() => {
//     fetchFromLocations();
//   }, []);

//   useEffect(() => {
//     if (selectedFrom) {fetchToLocations(selectedFrom);}
//   }, [selectedFrom]);

//   return (
//     <ScrollView style={tw`p-4 bg-white`}>
//       <View style={tw`flex-row justify-between items-center mb-4 mt-10`}>
//         <Text style={tw`text-xl font-bold text-black`}>Search Rides</Text>
//         <TouchableOpacity onPress={getProfile}>
//           <Ionicons name="person-circle-outline" size={30} color="black" />
//         </TouchableOpacity>
//       </View>

//       {/* From Location Picker */}
//       <Text style={tw`mb-2 text-gray-800`}>From</Text>
//       <Picker selectedValue={selectedFrom} onValueChange={(val) => {
//         setSelectedFrom(val);
//         setSelectedTo('');
//         // setRides([]);
//       }}>
//         <Picker.Item label="Select From Location" value="" />
//         {fromLocations.map((name, idx) => (
//           <Picker.Item label={name} value={name} key={idx} />
//         ))}
//       </Picker>

//       {/* To Location Picker */}
//       <Text style={tw`mt-4 mb-2 text-gray-800`}>To</Text>
//       <Picker selectedValue={selectedTo} onValueChange={setSelectedTo}>
//         <Picker.Item label="Select To Location" value="" />
//         {toLocations.map((name, idx) => (
//           <Picker.Item label={name} value={name} key={idx} />
//         ))}
//       </Picker>

//       {/* Date Picker */}
//       <Text style={tw`mt-4 mb-2 text-gray-800`}>Select Date</Text>
//       <TouchableOpacity
//         onPress={() => setShowDatePicker(true)}
//         style={tw`p-3 border border-gray-300 rounded-lg`}
//       >
//         <Text style={tw`text-base text-gray-700`}>{rideDate.toDateString()}</Text>
//       </TouchableOpacity>
//       {showDatePicker && (
//         <DateTimePicker
//           value={rideDate}
//           mode="date"
//           display="default"
//           onChange={(event, selectedDate) => {
//             setShowDatePicker(false);
//             if (event.type === 'dismissed'){
//               return;
//             }
//             if (selectedDate) {setRideDate(selectedDate);}
//           }}
//         />
//       )}

//       {/* Search Button */}
//       <View style={tw`mt-4`}>
//         <Button title="Search Rides" onPress={searchRides} color="#1e40af" />
//       </View>

//       {loading && <ActivityIndicator size="large" color="#0000ff" style={tw`mt-4`} />}
//       {error && <Text style={tw`text-red-600 mt-4`}>{error}</Text>}

//       <Modal visible={showProfile} animationType="slide">
//         <ScrollView style={styles.container}>
//         <View style={{ padding: 24 }}>
//           {/* Modal Header */}
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//             <Text style={styles.heading}>Profile</Text>
//             <TouchableOpacity onPress={() => setShowProfile(false)}>
//               <Ionicons name="close-circle" size={32} color="#E2E8F0" />
//             </TouchableOpacity>
//           </View>

//           {/* White Form Card */}
//           <View style={styles.card}>
//             {/* Profile Form */}
//             {profileData && (
//               Object.keys(profileData).map((key, idx) => (
//               <View key={idx} style={{ marginBottom: 12 }}>
//                 <Text style={{ color: '#334155', marginBottom: 6, textTransform: 'capitalize' }}>
//                   { key.replace('_', ' ')}
//                 </Text>
//                 <TextInput
//                   editable={editMode}
//                   value={profileData[key] ? String(profileData[key]) : ''}
//                   onChangeText={(text) =>
//                     setProfileData((prev) => ({ ...prev, [key]: text }))
//                   }
//                 style={styles.input}
//                 placeholderTextColor="#94A3B8"
//                 />
//               </View>
//               ))
//             )}

//             <TouchableOpacity
//               style={[
//               styles.ctaButton,
//               { backgroundColor: editMode ? '#2563eb' : PRIMARY, marginTop: 16 },
//             ]}
//             onPress={editMode ? updateProfile : () => setEditMode(true)}
//             >
//             <Text style={styles.ctaText}>
//               {editMode ? 'Save Changes' : 'Edit Profile'}
//             </Text>
//             </TouchableOpacity>
//             {/* Change Password Section */}
//             <Text style={[styles.subheading, { textAlign: 'left', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1E293B' }]}>
//               Change Password
//             </Text>

//             <TextInput
//             secureTextEntry
//             placeholder="Current Password"
//             placeholderTextColor="#94A3B8"
//             value={passwords.currentPassword}
//             onChangeText={(text) => setPasswords({ ...passwords, currentPassword: text })}
//             style={styles.input}
//             />
//             <TextInput
//             secureTextEntry
//             placeholder="New Password"
//             placeholderTextColor="#94A3B8"
//             value={passwords.newPassword}
//             onChangeText={(text) => setPasswords({ ...passwords, newPassword: text })}
//             style={styles.input}
//             />

//             <TouchableOpacity
//               style={styles.ctaButton}
//               onPress={changePassword}
//             >
//             <Text style={styles.ctaText}>Change Password</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </Modal>
//     </ScrollView>
//   );
// };

// export default SearchRidesScreen;

// const PRIMARY = '#5A67D8';
// const SCREEN_BG = '#0F172A';
// const INPUT_BG = '#FFFFFF';
// const BORDER_DEFAULT = '#D1D5DB';
// const DARK_TEXT = '#E2E8F0';
// const MUTED_TEXT = '#CBD5E1';

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: SCREEN_BG,
//   },
//   content: {
//     padding: 24,
//     justifyContent: 'center',
//   },
//   logo: {
//     width: 64,
//     height: 64,
//     alignSelf: 'center',
//     marginBottom: -10,
//   },
//   appName: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     alignSelf: 'center',
//     marginBottom: 24,
//   },
//   appNameBlue: {
//     color: '#3B82F6',
//   },
//   appNameBlack: {
//     color: '#38BDF8',
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: DARK_TEXT,
//     textAlign: 'left',
//     marginBottom: 6,
//   },
//   subheading: {
//     fontSize: 16,
//     color: MUTED_TEXT,
//     textAlign: 'left',
//     marginBottom: 30,
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 24,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     borderColor: '#334155',
//     shadowColor: '#000',
//     shadowOpacity: 0.04,
//     shadowOffset: { width: 0, height: 6 },
//     shadowRadius: 12,
//     elevation: 4,
//     marginBottom: 20,
//   },
//   input: {
//     height: 50,
//     backgroundColor: INPUT_BG,
//     borderColor: BORDER_DEFAULT,
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     fontSize: 15,
//     color: '#1F2937',
//     marginBottom: 16,
//   },
//   ctaButton: {
//     backgroundColor: PRIMARY,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderRadius: 50,
//     marginTop: 10,
//   },
//   ctaText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   ctaIcon: {
//     marginTop: 1,
//   },
//   forgotPassword: {
//     color: '#1F2937',
//     fontSize: 14,
//     textAlign: 'center',
//     marginTop: 16,
//   },

// });

// SearchRidesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Button,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import tw from 'twrnc';
import api from '../src/api/axios';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { parseJwt } from '../utils/jwt';
import { useNavigation } from '@react-navigation/native';

const SearchRidesScreen = () => {
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  // const [rideDate, setRideDate] = useState(new Date());
  // const [showDatePicker, setShowDatePicker] = useState(false);
  //const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const navigation = useNavigation();

  const fetchFromLocations = async () => {
    try {
      const { data } = await api.get('/routes/start-stops');
      const uniqueStopNames = data.map((item) => item.stop_name);
      setFromLocations(uniqueStopNames);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchToLocations = async (startStopName) => {
    try {
      const { data } = await api.get('/routes/end-stops', {
        params: { startStopName },
      });
      const uniqueToStopNames = data.map((item) => item.stop_name);
      setToLocations(uniqueToStopNames);
    } catch (err) {
      console.error(err);
    }
  };

  const searchRides = async () => {
    if (!selectedFrom || !selectedTo ) {return;}
    try {
      setLoading(true);
      const now=new Date();
      const datetimestr=now.toISOString();
      console.log(now,datetimestr);
      const { data } = await api.get('/rides/search-rides', {
        params: {
          startStopName: selectedFrom,
          endStopName: selectedTo,
          datetime: datetimestr,
        },
      });
      console.log(data.rides);
      if (data && data.rides){
        navigation.navigate('RideResultsScreen', {
          rides: data.rides,
          from: selectedFrom,
          to: selectedTo,
          date: datetimestr.split('T')[0],
        });
      }else{
        Alert.alert('No rides found');
      }
    } catch (err) {
      console.error('Error fetching rides:',err);
      Alert.alert('error fetching rides');
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    const token = await AsyncStorage.getItem('userToken');
    console.log(token);
    if (!token) {return;}
    try {
      const decoded = parseJwt(token);
      if (!decoded){
          Alert.alert('Login failed','invalid token received');
        }
      const {  user_id } = decoded;

      const { data } = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(data.user);
      setShowProfile(true);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {return;}
    try {
      const { data } = await api.put('/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(data.user);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const changePassword = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {return;}
    try {
      await api.put(
        '/users/change-password',
        passwords,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPasswords({ currentPassword: '', newPassword: '' });
      alert('Password changed successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password');
    }
  };

  useEffect(() => {
    fetchFromLocations();
  }, []);

  useEffect(() => {
    if (selectedFrom) {fetchToLocations(selectedFrom);}
  }, [selectedFrom]);

  return (
    <ScrollView style={tw`p-4 bg-white`}>
      <View style={tw`flex-row justify-between items-center mb-4 mt-10`}>
        <Text style={tw`text-xl font-bold text-black`}>Search Rides</Text>
        <TouchableOpacity onPress={getProfile}>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* From Location Picker */}
      <Text style={tw`mb-2 text-gray-800`}>From</Text>
      <Picker selectedValue={selectedFrom} onValueChange={(val) => {
        setSelectedFrom(val);
        setSelectedTo('');
        // setRides([]);
      }}>
        <Picker.Item label="Select From Location" value="" />
        {fromLocations.map((name, idx) => (
          <Picker.Item label={name} value={name} key={idx} />
        ))}
      </Picker>

      {/* To Location Picker */}
      <Text style={tw`mt-4 mb-2 text-gray-800`}>To</Text>
      <Picker selectedValue={selectedTo} onValueChange={setSelectedTo}>
        <Picker.Item label="Select To Location" value="" />
        {toLocations.map((name, idx) => (
          <Picker.Item label={name} value={name} key={idx} />
        ))}
      </Picker>


      {/* Search Button */}
      <View style={tw`mt-4`}>
        <Button title="Search Rides" onPress={searchRides} color="#1e40af" />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={tw`mt-4`} />}
      {error && <Text style={tw`text-red-600 mt-4`}>{error}</Text>}

      <Modal visible={showProfile} animationType="slide">
        <ScrollView style={styles.container}>
        <View style={{ padding: 24 }}>
          {/* Modal Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.heading}>Profile</Text>
            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Ionicons name="close-circle" size={32} color="#E2E8F0" />
            </TouchableOpacity>
          </View>

          {/* White Form Card */}
          <View style={styles.card}>
            {/* Profile Form */}
            {profileData && (
              Object.keys(profileData).map((key, idx) => (
              <View key={idx} style={{ marginBottom: 12 }}>
                <Text style={{ color: '#334155', marginBottom: 6, textTransform: 'capitalize' }}>
                  { key.replace('_', ' ')}
                </Text>
                <TextInput
                  editable={editMode}
                  value={profileData[key] ? String(profileData[key]) : ''}
                  onChangeText={(text) =>
                    setProfileData((prev) => ({ ...prev, [key]: text }))
                  }
                style={styles.input}
                placeholderTextColor="#94A3B8"
                />
              </View>
              ))
            )}

            <TouchableOpacity
              style={[
              styles.ctaButton,
              { backgroundColor: editMode ? '#2563eb' : PRIMARY, marginTop: 16 },
            ]}
            onPress={editMode ? updateProfile : () => setEditMode(true)}
            >
            <Text style={styles.ctaText}>
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </Text>
            </TouchableOpacity>
            {/* Change Password Section */}
            <Text style={[styles.subheading, { textAlign: 'left', fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12, color: '#1E293B' }]}>
              Change Password
            </Text>

            <TextInput
            secureTextEntry
            placeholder="Current Password"
            placeholderTextColor="#94A3B8"
            value={passwords.currentPassword}
            onChangeText={(text) => setPasswords({ ...passwords, currentPassword: text })}
            style={styles.input}
            />
            <TextInput
            secureTextEntry
            placeholder="New Password"
            placeholderTextColor="#94A3B8"
            value={passwords.newPassword}
            onChangeText={(text) => setPasswords({ ...passwords, newPassword: text })}
            style={styles.input}
            />

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={changePassword}
            >
            <Text style={styles.ctaText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
    </ScrollView>
  );
};

export default SearchRidesScreen;

const PRIMARY = '#5A67D8';
const SCREEN_BG = '#0F172A';
const INPUT_BG = '#FFFFFF';
const BORDER_DEFAULT = '#D1D5DB';
const DARK_TEXT = '#E2E8F0';
const MUTED_TEXT = '#CBD5E1';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  content: {
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginBottom: -10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 24,
  },
  appNameBlue: {
    color: '#3B82F6',
  },
  appNameBlack: {
    color: '#38BDF8',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_TEXT,
    textAlign: 'left',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: MUTED_TEXT,
    textAlign: 'left',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: INPUT_BG,
    borderColor: BORDER_DEFAULT,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 16,
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
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  ctaIcon: {
    marginTop: 1,
  },
  forgotPassword: {
    color: '#1F2937',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },

});

