import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../src/api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';
import tw from 'twrnc';


const EditRideScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const ride = route.params?.ride;

  const [fromStops, setFromStops] = useState([]);
  const [toStops, setToStops] = useState([]);

  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);
  const [departureTime, setDepartureTime] = useState(new Date());
  const [availableSeats, setAvailableSeats] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const originalRideRef=useRef(null);

  useEffect(() => {
    if (ride) {
      setDepartureTime(new Date(ride.departure_time));
      setAvailableSeats(ride.available_seats.toString());
      setSelectedFrom({ stop_name: ride.originStopName }); // Partial info for display
      setSelectedTo({ stop_name: ride.destinationStopName });

      // Store original values for comparison
        originalRideRef.current = {
        origin_stop_id: ride.origin_stop_id,
        destination_stop_id: ride.destination_stop_id,
        departure_time: new Date(ride.departure_time).toISOString(),
        available_seats: ride.available_seats
        };
    }
    fetchFromStops();
  }, []);

  const fetchFromStops = async () => {
    try {
      const res = await api.get('/stops/origin-stops');
      setFromStops(res.data);

      if (ride) {
        const originStop = res.data.find((stop) => stop.stop_name === ride.originStopName);
        if (originStop) {
          setSelectedFrom(originStop);
          fetchToStops(originStop.stop_name);
        }
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to fetch origin stops' });
    }
  };

  const fetchToStops = async (originName) => {
    try {
      const res = await api.get('/stops/destination-stops', {
        params: { origin: originName },
      });
      setToStops(res.data);

      if (ride) {
        const destinationStop = res.data.find(
          (stop) => stop.stop_name === ride.destinationStopName
        );
        if (destinationStop) setSelectedTo(destinationStop);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to fetch destination stops' });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event?.type === 'set' && selectedDate) {
      const updated = new Date(departureTime);
      updated.setFullYear(selectedDate.getFullYear());
      updated.setMonth(selectedDate.getMonth());
      updated.setDate(selectedDate.getDate());
      setDepartureTime(updated);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (event?.type === 'set' && selectedTime) {
      const updated = new Date(departureTime);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      setDepartureTime(updated);
    }
  };

//   const onUpdateRide = async () => {
//     if (!selectedFrom || !selectedTo || !availableSeats || !departureTime) {
//       Toast.show({ type: 'error', text1: 'Please fill all fields' });
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem('userToken');

//       await api.put(
//         `/rides/ride/${ride.ride_id}`,
//         {
//           origin_stop_id: selectedFrom._id,
//           destination_stop_id: selectedTo._id,
//           departure_time: departureTime.toISOString(),
//           available_seats: parseInt(availableSeats),
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       Toast.show({ type: 'success', text1: 'Ride updated successfully' });
//       navigation.goBack();
//     } catch (err) {
//       Toast.show({
//         type: 'error',
//         text1: err.response?.data?.message || 'Failed to update ride',
//       });
//     }
//   };

const onUpdateRide = async () => {
  if (!selectedFrom || !selectedTo || !availableSeats || !departureTime) {
    Toast.show({ type: 'error', text1: 'Please fill all fields' });
    return;
  }

  const updatedData = {
    origin_stop_id: selectedFrom._id,
    destination_stop_id: selectedTo._id,
    departure_time: departureTime.toISOString(),
    available_seats: parseInt(availableSeats),
  };

  const original=originalRideRef.current;

  const isUnchanged=
    original.origin_stop_id === updatedData.origin_stop_id &&
    original.destination_stop_id === updatedData.destination_stop_id &&
    original.departure_time === updatedData.departure_time &&
    original.available_seats === updatedData.available_seats;

  if (isUnchanged){
    Toast.show({type:'info',text1:'No changes detected'});
    return;
  }

  Alert.alert(
    'Confirm Update',
    'Are you sure you want to update this ride?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Update',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');

            await api.put(
              `/rides/ride/${ride.ride_id}`,
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

            Toast.show({
              type: 'success',
              text1: 'Ride updated successfully',
              onHide: () => navigation.goBack(), // Navigate back after toast disappears
            });

          } catch (err) {
            Toast.show({
              type: 'error',
              text1: err.response?.data?.message || 'Failed to update ride',
            });
          }
        },
      },
    ]
  );
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={tw`absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow`}
      >
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <Text style={styles.heading}>Edit Ride</Text>

      <View style={styles.card}>

        {/* Origin Picker */}
        <View style={styles.input}>
            <Picker
            selectedValue={selectedFrom ? selectedFrom._id : ''}
            onValueChange={(val) => {
                const stop = fromStops.find((s) => s._id === val);
                setSelectedFrom(stop);
                setSelectedTo(null);
                fetchToStops(stop.stop_name);
            }}
            dropdownIconColor="#1F2937"
            style={{ color: '#1F2937', fontSize: 14 }}
            >
            <Picker.Item label="Select origin" value="" />
            {fromStops.map((stop) => (
                <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
            ))}
            </Picker>
        </View>

        {/* Destination Picker */}
        <View style={styles.input}>
            <Picker
            selectedValue={selectedTo ? selectedTo._id : ''}
            onValueChange={(val) => {
                const stop = toStops.find((s) => s._id === val);
                setSelectedTo(stop);
            }}
            enabled={toStops.length > 0}
            dropdownIconColor="#1F2937"
            style={{ color: '#1F2937', fontSize: 14 }}
            >
            <Picker.Item label="Select destination" value="" />
            {toStops.map((stop) => (
                <Picker.Item key={stop._id} label={stop.stop_name} value={stop._id} />
            ))}
            </Picker>
        </View>

        {/* Departure Time */}
        <TouchableOpacity
            style={[styles.input, styles.departureTime]}
            onPress={() => setShowDatePicker(true)}
        >
            <Ionicons name="calendar-outline" size={20} color="#1F2937" />
            <Text style={styles.departureText}>
            {departureTime.toLocaleString().replace(',', ' at')}
            </Text>
        </TouchableOpacity>

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

        {/* Available Seats */}
        <TextInput
            style={styles.input}
            placeholder="Enter number of seats"
            keyboardType="numeric"
            value={availableSeats}
            onChangeText={setAvailableSeats}
        />

        {/* Update Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={onUpdateRide}>
            <Text style={styles.ctaText}>Update Ride</Text>
            {/* <Ionicons name="checkmark" size={18} color="#fff" style={styles.ctaIcon} /> */}
        </TouchableOpacity>
      </View>
      

      <Toast />
    </ScrollView>
  );
};

export default EditRideScreen;

const styles = StyleSheet.create({
  container: {
    flex:1,
    padding: 24,
    // backgroundColor: '#fff',
    backgroundColor: '#0F172A',
  },
  heading: {
    textAlign:'left',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 20,
    marginLeft:50
  },
  card: {
    backgroundColor:'#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 24,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 14,
  },
  ctaButton: {
    backgroundColor: '#1e40af',
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    // borderColor: '#D1D5DB',
    // borderWidth: 1,
    marginBottom: 16,
  },
  departureText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#1F2937',
  },
});
