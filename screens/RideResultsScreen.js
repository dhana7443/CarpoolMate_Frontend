// RideResultsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleRideBooking = async (rideId, fromStop, toStop,routeId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');

    // Step 1: Validate ride request
    const validateRes = await api.post(
      '/rides/validate-request',
      {
        ride_id: rideId,
        from_stop: fromStop,
        to_stop: toStop,
        route_id:routeId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(validateRes.data.canBook);
    if (!validateRes.data?.canBook) {
      Toast.show({
        type: 'error',
        text1: 'Booking Not Allowed',
        text2: validateRes.data.message || 'Ride is full in selected segment',
      });
      return; // Don't proceed
    }

    // Step 2: Send ride request
    const response = await api.post(
      '/ride-requests/',
      {
        ride_id: rideId,
        from_stop: fromStop,
        to_stop: toStop,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Ride request sent successfully',
    });
  } catch (error) {
    console.error('Booking error full:',error.response?.data);
    Toast.show({
      type: 'error',
      text1: 'Booking Failed',
      text2: error.response?.data?.error ||
  error.response?.data?.message ||
  'Something went wrong',
    });
  }
};


const RideResultsScreen = () => {
  const route = useRoute();
  const navigation=useNavigation();
  const { rides, from, to, date } = route.params;
  const [expandedRideIds, setExpandedRideIds] = useState([]);

  const toggleExpand = (rideId) => {
    if (expandedRideIds.includes(rideId)) {
      setExpandedRideIds(expandedRideIds.filter((id) => id !== rideId));
    } else {
      setExpandedRideIds([...expandedRideIds, rideId]);
    }
  };

  return (
    
    <View style={tw`flex-1 bg-gray-100 pt-12 relative`}>
      {/* Back Arrow */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={tw`absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow`}
      >
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <ScrollView style={tw`px-4 pt-4`}>
        <Text style={tw`text-1xl font-bold text-black mb-4`}>
          Rides from {from} to {to} on {date}
        </Text>

        {rides.length === 0 ? (
          <Text style={tw`text-center text-gray-500 mt-20 text-base`}>
            No rides found.
          </Text>
        ) : (
          rides.map((ride) => (
            <View
              key={ride.ride_id}
              style={tw`bg-white rounded-2xl p-4 mb-4 border border-gray-200`}
            >
              {/* Availability Badge on Top */}
              <View
                style={[
                  styles.badge,
                  { backgroundColor: ride.segment_available_seats > 0 ? '#16a34a' : '#dc2626' },
                ]}
              >
                <Text style={styles.badgeText}>
                  {ride.segment_available_seats > 0 ? 'Available' : 'Full'}
                </Text>
              </View>

              <Text style={tw`font-medium text-gray-800`}>
                    Driver:{' '}
                    <Text style={tw`text-sm text-gray-700 font-normal`}>
                      {ride.driver_id?.name || ride.driver_name}
                    </Text>
              </Text>

              <Text style={tw`font-medium text-gray-800`}>
                    Departure:{' '}
                    <Text style={tw`text-sm text-gray-700 font-normal`}>
                      {ride.departure_time}
                    </Text>
              </Text>

              <Text style={tw`font-medium text-gray-800`}>
                    Available_seats:{' '}
                    <Text style={tw`text-sm text-gray-700 font-normal`}>
                      {ride.segment_available_seats}
                    </Text>
              </Text>

              <Text style={tw`font-medium text-gray-800`}>
                Cost:{' '}
                <Text style={tw`text-sm text-gray-700 font-normal`}>
                  {ride.cost}
                </Text>
              </Text>

              {/* Book Ride Button */}
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  { backgroundColor: ride.segment_available_seats === 0 ? '#9ca3af' : '#2563eb' },
                ]}
                disabled={ride.segment_available_seats === 0}
                onPress={() => handleRideBooking(ride.ride_id, from, to, ride.route_id)}
              >
                <Text style={styles.bookButtonText}>
                  {ride.segment_available_seats === 0 ? 'Cannot Book' : 'Book Ride'}
                </Text>
              </TouchableOpacity>

              {/* Expand Route Info */}
              <TouchableOpacity
                style={tw`flex-row items-center mt-3`}
                onPress={() => toggleExpand(ride.ride_id)}
              >
                <Ionicons
                  name={
                    expandedRideIds.includes(ride.ride_id)
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={18}
                  style={tw`text-blue-600 mr-1`}
                />
                <Text style={tw`text-blue-600 font-medium`}>
                  {expandedRideIds.includes(ride.ride_id)
                    ? 'Hide Route Info'
                    : 'Show Route Info'}
                </Text>
              </TouchableOpacity>

              {expandedRideIds.includes(ride.ride_id) && (
                <View style={tw`mt-3 bg-blue-50 rounded-xl px-3 py-2`}>
                  {ride.route_stops.map((stop, idx) => (
                    <View key={idx} style={tw`items-left`}>
                      <Text style={tw`text-sm text-gray-800`}>{stop.stop_name}</Text>
                      {idx < ride.route_stops.length - 1 && (
                        <Ionicons
                          name="arrow-down"
                          size={18}
                          style={tw`text-blue-500 my-1`}
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}

        <Toast />
      </ScrollView>
    </View>
  );
};

export default RideResultsScreen;

const styles=StyleSheet.create({
  segmentAvailability: {
  color: '#fff',
  fontWeight: '600',
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 6,
  alignSelf: 'flex-start',
  marginTop: 8,
},
bookButton: {
  marginTop: 12,
  paddingVertical: 8,
  borderRadius: 15,
  alignItems: 'center',
},
bookButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},
badge: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
})