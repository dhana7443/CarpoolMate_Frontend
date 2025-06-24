// RideResultsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import { useRoute } from '@react-navigation/native';
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
    Toast.show({
      type: 'error',
      text1: 'Booking Failed',
      text2: error.response?.data?.error || 'Something went wrong',
    });
  }
};


const RideResultsScreen = () => {
  const route = useRoute();
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
    <ScrollView style={tw`flex-1 bg-gray-100 px-4 pt-6 mt-10`}>
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

            <Text style={tw`text-base font-semibold text-black mb-1`}>
               Driver: {ride.driver_id?.name || ride.driver_name}
            </Text>
            <Text style={tw`text-sm text-gray-700`}>
              Departure: {new Date(ride.departure_time).toLocaleString()}
            </Text>
            <Text style={tw`text-sm text-gray-700`}>
              Seats: {ride.available_seats}
            </Text>
            <Text style={tw`text-sm text-gray-700`}>
              Distance: {ride.distance} km
            </Text>
            <Text style={tw`text-sm text-gray-700`}>
              Time: {ride.time} min
            </Text>
            <Text style={tw`text-sm text-gray-700`}>
              Cost: ₹{ride.cost}
            </Text>

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
                    <Ionicons name="arrow-down" size={18} style={tw`text-blue-500 my-1`} />
                    )}
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={tw`bg-blue-600 py-2 px-4 mt-4 rounded-xl`}
              onPress={() => handleRideBooking(ride.ride_id,from,to,ride.route_id)}
            >
              <Text style={tw`text-white text-center font-semibold`}>Book Ride</Text>
            </TouchableOpacity>

          </View>
        ))
      )}
    </ScrollView>
  );
};

export default RideResultsScreen;

