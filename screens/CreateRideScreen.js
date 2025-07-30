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

    <View style={styles.container}>
    <View style={[styles.content, { marginTop: 30 }]}>
      <Text style={styles.heading}>Create a Ride</Text>
      <Text style={styles.subheading}>Fill in the details to offer a ride.</Text>

      <View style={styles.card}>
        {/* FROM Picker */}
        {/* <Text style={styles.label}>From</Text> */}
        <View style={styles.input}>
          <Picker
            selectedValue={selectedFrom ? selectedFrom._id : ''}
            onValueChange={onFromChange}
            
            dropdownIconColor="#1F2937"
            style={{ color: '#1F2937',fontSize:14 }} // same as input text
          >
            <Picker.Item label="Select origin" value="" />
            {fromStops.map((stop) => (
              <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
            ))}
          </Picker>
        </View>

        {/* TO Picker */}
        {/* <Text style={styles.label}>To</Text> */}
        <View style={styles.input}>
          <Picker
            selectedValue={selectedTo ? selectedTo._id : ''}
            onValueChange={onToChange}
            enabled={toStops.length > 0}
            dropdownIconColor='#1F2937'
            style={{ color: '#1F2937' ,fontSize:14}}
          >
            <Picker.Item label="Select destination" value="" />
            {toStops.map((stop) => (
              <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
            ))}
          </Picker>
        </View>

        {/* Departure Picker */}
        {/* <Text style={styles.label}>Departure Time</Text> */}
        
        <TouchableOpacity style={[styles.input, styles.departureTime]} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color="#1F2937" />
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
        {/* <Text style={styles.label}>Available Seats</Text> */}
        <TextInput
          style={styles.input}
          placeholder="Enter number of seats"
          placeholderTextColor="#1F2937"
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
</View>


  );
};

export default CreateRideScreen;



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
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_TEXT,
    textAlign: 'left',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
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
    height: 48,
    backgroundColor: INPUT_BG,
    borderColor: BORDER_DEFAULT,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 14,
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
  color:'#1F2937',
  paddingHorizontal:4
}

});
