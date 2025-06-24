import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';

import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw, { style } from 'twrnc';

const CreateRideScreen = () => {

  const [fromStops, setFromStops] = useState([]);
  const [toStops, setToStops] = useState([]);

  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);

  const [departureTime, setDepartureTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [availableSeats, setAvailableSeats] = useState('');

  useEffect(() => {
    fetchFromStops();
  }, []);

  const fetchFromStops = async () => {
    try {
      const res = await api.get('/stops/origin-stops');
      setFromStops(res.data);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error fetching origin stops' });
    }
  };

  const fetchToStops = async (originName) => {
    try {
      const res = await api.get('/stops/destination-stops', {
        params: { origin: originName },
      });
      setToStops(res.data);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error fetching destination stops' });
    }
  };

  const onFromChange = (stopId) => {
    const stopObj = fromStops.find((s) => s._id === stopId);
    setSelectedFrom(stopObj);
    setSelectedTo(null);
    fetchToStops(stopObj.stop_name);
  };

  const onToChange = (stopId) => {
    const stopObj = toStops.find((s) => s._id === stopId);
    setSelectedTo(stopObj);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event?.type === 'set' && selectedDate) {
      const updatedDate = new Date(departureTime);
      updatedDate.setFullYear(selectedDate.getFullYear());
      updatedDate.setMonth(selectedDate.getMonth());
      updatedDate.setDate(selectedDate.getDate());
      setDepartureTime(updatedDate);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (event?.type === 'set' && selectedTime) {
      const updatedDateTime = new Date(departureTime);
      updatedDateTime.setHours(selectedTime.getHours());
      updatedDateTime.setMinutes(selectedTime.getMinutes());
      setDepartureTime(updatedDateTime);
    }
  };

  const onCreateRide = async () => {
    if (!selectedFrom || !selectedTo || !availableSeats || !departureTime) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Toast.show({ type: 'error', text1: 'User not logged in' });
        return;
      }

      const response = await api.post(
        '/rides/',
        {
          origin_stop_id: selectedFrom._id,
          destination_stop_id: selectedTo._id,
          departure_time: departureTime.toISOString(),
          available_seats: parseInt(availableSeats),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Toast.show({ type: 'success', text1: 'Ride created successfully!' });
      await AsyncStorage.setItem('ride_id', response.data.ride.ride_id);
      const ride_id=await AsyncStorage.getItem("ride_id");
      console.log(response.data.ride.ride_id);
      console.log(ride_id);
      setSelectedFrom(null);
      setSelectedTo(null);
      setToStops([]);
      setDepartureTime(new Date());
      setAvailableSeats('');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'Ride creation failed',
      });
    }
  };

  return (
    // <ScrollView style={styles.card} >
    //   <View style={tw`flex-row justify-between items-center mb-4 mt-10`}>
    //     <Text style={tw`text-xl font-bold text-black`}>Create a ride</Text>
    //     <TouchableOpacity>
    //       <Ionicons name="person-circle-outline" size={30} color="black" />
    //     </TouchableOpacity>
    //   </View>
    //   <View>
    //     <Text style={styles.label}>From</Text>
    //     <View style={styles.pickerWrapper}>
    //       <Picker
    //         selectedValue={selectedFrom ? selectedFrom._id : ''}
    //         onValueChange={onFromChange}
    //       >
    //       <Picker.Item label="Select origin" value="" />
    //         {fromStops.map((stop) => (
    //         <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
    //         ))}
    //       </Picker>
    //     </View>

    //   <Text style={styles.label}>To</Text>
    //   <View style={styles.pickerWrapper}>
    //     <Picker
    //       selectedValue={selectedTo ? selectedTo._id : ''}
    //       onValueChange={onToChange}
    //       enabled={toStops.length > 0}
    //     >
    //     <Picker.Item label="Select destination" value="" />
    //       {toStops.map((stop) => (
    //         <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
    //       ))}
    //     </Picker>
    //   </View>

    //   <Text style={styles.label}>Departure Time</Text>
    //   {/* <TouchableOpacity style={styles.pickButton} onPress={() => setShowDatePicker(true)}>
    //       <Ionicons name="calendar-outline" size={18} />
    //       <Text style={styles.pickButtonText}>Pick Departure Time</Text>
    //   </TouchableOpacity>
    //   <Text style={styles.timeText}>{departureTime.toLocaleString()}</Text> */}

    //   <TouchableOpacity style={styles.pickButton} onPress={() => setShowDatePicker(true)}>
    //     <Ionicons name="calendar-outline" size={18} color="#1d4ed8" />
    //     <Text style={styles.pickButtonText}>
    //       {departureTime
    //         ? departureTime.toLocaleString().replace(',', ' at')
    //         : 'Pick Departure Time'}
    //     </Text>
    //   </TouchableOpacity>

    //   {showDatePicker && (
    //     <DateTimePicker
    //       value={departureTime}
    //       mode="date"
    //       display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    //       minimumDate={new Date()}
    //       onChange={handleDateChange}
    //     />
    //   )}

    //   {showTimePicker && (
    //     <DateTimePicker
    //       value={departureTime}
    //       mode="time"
    //       is24Hour={true}
    //       display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    //       onChange={handleTimeChange}
    //     />
    //   )}

    //   <Text style={styles.label}>Available Seats</Text>
    //   <TextInput
    //     style={styles.input}
    //     placeholder="Enter number of seats"
    //     keyboardType="numeric"
    //     value={availableSeats}
    //     onChangeText={setAvailableSeats}
    //   />
    //   <TouchableOpacity style={styles.primaryButton} onPress={onCreateRide} backgroundColor="#1e40af">
    //       <Text style={styles.primaryButtonText}>Create Ride</Text>
    //   </TouchableOpacity>
    //   </View>
    //   <Toast />
    // </ScrollView>

    <ScrollView style={styles.container}>
    <View style={[styles.content, { marginTop: 30 }]}>
      <Text style={styles.heading}>Create a Ride</Text>
      <Text style={styles.subheading}>Fill in the details to offer a ride.</Text>

      <View style={styles.card}>
        {/* FROM Picker */}
        <Text style={styles.label}>From</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={selectedFrom ? selectedFrom._id : ''}
            onValueChange={onFromChange}
            
            dropdownIconColor="#9CA3AF"
            style={{ color: '#9CA3AF' }} // same as input text
          >
            <Picker.Item label="Select origin" value="" />
            {fromStops.map((stop) => (
              <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
            ))}
          </Picker>
        </View>

        {/* TO Picker */}
        <Text style={styles.label}>To</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={selectedTo ? selectedTo._id : ''}
            onValueChange={onToChange}
            enabled={toStops.length > 0}
            style={{ color: '#9CA3AF' }}
          >
            <Picker.Item label="Select destination" value="" />
            {toStops.map((stop) => (
              <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
            ))}
          </Picker>
        </View>

        {/* Departure Picker */}
        <Text style={styles.label}>Departure Time</Text>
        {/* <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <View style={{ flexDirection: 'row',justifyContent:'center', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={20} color="#1F2937" />
            <Text style={{ marginLeft: 10, color: '#9CA3AF', fontSize: 15 }}>
              {departureTime
                ? departureTime.toLocaleString().replace(',', ' at')
                : 'Pick Departure Time'}
            </Text>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity style={[styles.input, styles.departureTime]} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
          <Text style={styles.departureText}>
            {departureTime
              ? departureTime.toLocaleString().replace(',', ' at')
              : 'Pick Departure Time'}
          </Text>
        </TouchableOpacity>


        {/* Date and Time Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={departureTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={departureTime}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        {/* Seats */}
        <Text style={styles.label}>Available Seats</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of seats"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={availableSeats}
          onChangeText={setAvailableSeats}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={onCreateRide}>
          <Text style={styles.ctaText}>Create Ride</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.ctaIcon} />
        </TouchableOpacity>
      </View>
    </View>
  <Toast />
</ScrollView>


  );
};

export default CreateRideScreen;


// const styles = StyleSheet.create({
//   label: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#1e1e1e',
//     marginBottom: 6,
//     marginTop: 20,
//   },
//   pickerWrapper: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: '#dcdcdc',
//     marginBottom: 14,
//   },
//   pickButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#dcdcdc',
//     marginTop: 6,
//   },
//   pickButtonText: {
//     marginLeft: 10,
//     color: '#333',
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   timeText: {
//     marginTop: 10,
//     fontSize: 14,
//     color: '#4a4a4a',
//     backgroundColor: '#f9f9f9',
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     fontSize: 15,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     color: '#000',
//     marginTop: 6,
//   },
//   primaryButton: {
//     backgroundColor: '#FFD700', // Rapido yellow
//     paddingVertical: 14,
//     borderRadius: 50,
//     alignItems: 'center',
//     marginTop: 28,
//   },
//   primaryButtonText: {
//     color: '#000000',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });

// const styles = StyleSheet.create({
//   card: {
//     marginTop:70,
//     margin:20,
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 3,
//     marginBottom: 30,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151', // slate-700
//     marginBottom: 6,
//     marginTop: 14,
//   },
//   pickerWrapper: {
//     borderWidth: 1,
//     borderColor: '#e5e7eb', // gray-200
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     backgroundColor: '#f3f4f6', // gray-100
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     backgroundColor: '#f3f4f6',
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     borderRadius: 12,
//     fontSize: 16,
//     color: '#111827', // gray-900
//     marginBottom: 10,
//   },
//   pickButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#eff6ff', // blue-100
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#dbeafe', // blue-200
//   },
//   pickButtonText: {
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#1d4ed8', // blue-700
//   },
//   timeText: {
//     fontSize: 16,
//     color: '#4b5563', // gray-600
//     marginBottom: 10,
//     marginLeft: 4,
//   },
//   primaryButton: {
//     backgroundColor: '#2563eb', // blue-600
//     paddingVertical: 16,
//     borderRadius: 14,
//     alignItems: 'center',
//     marginTop: 24,
//     shadowColor: '#2563eb',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   primaryButtonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },

// });

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
    // color: '#1F2937',
    color:'#000000',
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
  signupText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#fff',
  },
  signupLink: {
    color: '#9c27b0',
    fontWeight: 'bold',
  },
  // Add below inside StyleSheet.create({ ... })
  label: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 6,
    marginTop: 12,
  },

  departureTime: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,  // vertical centering
  paddingHorizontal: 14,
  borderRadius: 12,
  backgroundColor: INPUT_BG,
  borderColor: BORDER_DEFAULT,
  borderWidth: 1,
  marginBottom: 16,
},
departureText: {
  marginLeft: 10,
  fontSize: 15,
  color: '#9CA3AF',
  paddingHorizontal:4
}

});
