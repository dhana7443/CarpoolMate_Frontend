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
import tw from 'twrnc';

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
    <ScrollView style={tw`p-4 bg-white`} >
      <View style={tw`flex-row justify-between items-center mb-4 mt-10`}>
        <Text style={tw`text-xl font-bold text-black`}>Create a ride</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.label}>From</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedFrom ? selectedFrom._id : ''}
            onValueChange={onFromChange}
          >
          <Picker.Item label="Select origin" value="" />
            {fromStops.map((stop) => (
            <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
            ))}
          </Picker>
        </View>

      <Text style={styles.label}>To</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedTo ? selectedTo._id : ''}
          onValueChange={onToChange}
          enabled={toStops.length > 0}
        >
        <Picker.Item label="Select destination" value="" />
          {toStops.map((stop) => (
            <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Departure Time</Text>
      <TouchableOpacity style={styles.pickButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={18} />
          <Text style={styles.pickButtonText}>Pick Departure Time</Text>
      </TouchableOpacity>
      <Text style={styles.timeText}>{departureTime.toLocaleString()}</Text>

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

      <Text style={styles.label}>Available Seats</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter number of seats"
        keyboardType="numeric"
        value={availableSeats}
        onChangeText={setAvailableSeats}
      />
      <TouchableOpacity style={styles.primaryButton} onPress={onCreateRide} backgroundColor="#1e40af">
          <Text style={styles.primaryButtonText}>Create Ride</Text>
      </TouchableOpacity>
      </View>
      <Toast />
    </ScrollView>
  );
};

export default CreateRideScreen;



const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '500',
    color: '#111827',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
    marginBottom: 10,
    height:48,
  },

  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    marginBottom: 15,
    height:48,
    borderColor:'#d1d5db',
    color:'#000000',
    fontSize:16,
  },
  timeText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'left',
    color: '#374151',
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderColor:'#d1d5db',
    borderWidth:1,
    backgroundColor:'#f9fafb',
    borderRadius: 6,
    marginBottom: 10,
    justifyContent: 'start',
    height:48,
  },
  pickButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  primaryButton: {
    backgroundColor: '#1e40af',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  rideCard: {
    marginTop: 20,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    marginBottom:100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111827',
  },
  detailText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#374151',
  },
  bold: {
    fontWeight: '600',
    color: '#111827',
  },
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#d1d5db',
  },
  subrouteHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#e5e7eb',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    padding:5,
    fontSize: 14,
    color: '#374151',
  },
});
