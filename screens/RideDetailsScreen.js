import React, { useEffect, useState } from 'react';
import { View,Alert, Text, StyleSheet, SafeAreaView,ScrollView, ActivityIndicator ,TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import tw from 'twrnc';
import Header from '../components/headerItem';
import { parseJwt } from '../utils/jwt';


const RideDetailsScreen = () => {
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubroutes, setShowSubroutes] = useState(false);
  const navigation=useNavigation();

  
  const getUserRideId = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return null;

    const decoded = parseJwt(token);
    const userId = decoded?.user_id;
    if (!userId) return null;

    const ride_id = await AsyncStorage.getItem(`ride_id_${userId}`);
    return { ride_id, token, userId };
  };
  

  useFocusEffect(
    useCallback(()=>{
      fetchRideDetails();
    },[])
  );

  const fetchRideDetails = async () => {
    try {
      const data = await getUserRideId();
      if (!data?.ride_id || !data?.token) {
        setRideDetails(null);
        setLoading(false);
        return;
      }

      const response = await api.get(`/rides/ride/${data.ride_id}`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      setRideDetails(response.data);
    } catch (err) {
      console.error('Error fetching ride details:', err.message);
    } finally {
      setLoading(false);
    }
  };

 

  const handleStartRide = async () => {
    Alert.alert(
      'Confirm Start',
      'Are you sure you want to start this ride?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const data = await getUserRideId();
              if (!data?.ride_id || !data?.token) return;

              await api.post(`/rides/${data.ride_id}/start`, {}, {
                headers: { Authorization: `Bearer ${data.token}` },
              });

              Toast.show({ type: 'success', text1: 'Ride started successfully' });
              fetchRideDetails();
            } catch (error) {
              console.error('Start Ride Error:', error.message);
              Toast.show({ type: 'error', text1: 'Failed to start ride' });
            }
          },
        },
      ]
    );
  };

 
  const handleCancelRide = async () => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const data = await getUserRideId();
              if (!data?.ride_id || !data?.token) return;

              await api.put(`/rides/cancel/${data.ride_id}`, {}, {
                headers: { Authorization: `Bearer ${data.token}` },
              });

              // remove ride id for this user only
              await AsyncStorage.removeItem(`ride_id_${data.userId}`);

              Toast.show({ type: 'success', text1: 'Ride cancelled successfully' });
              setRideDetails(null);
            } catch (error) {
              console.error('Cancel Ride Error:', error.message);
              Toast.show({ type: 'error', text1: 'Failed to cancel ride' });
            }
          },
        },
      ]
    );
  };



  const handleCompleteRide = async () => {
  Alert.alert(
    'Confirm Completion',
    'Are you sure you want to mark this ride as complete?',
    [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            const data = await getUserRideId();
            if (!data?.ride_id || !data?.token) return;

            await api.put(`/rides/complete/${data.ride_id}`, {}, {
              headers: { Authorization: `Bearer ${data.token}` },
            });

            await AsyncStorage.removeItem(`ride_id_${data.userId}`);
            Toast.show({ type: 'success', text1: 'Ride marked as complete' });
            setRideDetails(null);
          } catch (error) {
            console.error('Complete Ride Error:', error.message);
            Toast.show({ type: 'error', text1: 'Failed to complete ride' });
          }
        },
      },
    ]
  );
};

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-100 m-3`}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!rideDetails) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-100`}>
        <Header/>
        <View style={tw`flex-1 justify-start items-center bg-gray-100 p-10`}>
          <Text style={tw`text-base text-gray-600 text-center px-6`}>
            No active rides or failed to load details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
    <Header/>
    <ScrollView style={tw`px-4 pt-6`}>
      {/* <Text style={tw`text-xl font-bold text-black mb-4 mt-10`}>Ride Details</Text> */}
      <View style={tw`flex-row justify-between items-center mb-4 mt-10`}>
        <Text style={tw`text-xl font-bold text-black`}>Ride Details</Text>
        {rideDetails.status === 'Scheduled' && (
          <TouchableOpacity onPress={() => navigation.navigate('EditRide', { ride: rideDetails })}>
            <Ionicons name="create-outline" size={22} color="#2563eb" />
          </TouchableOpacity>
        )}
      </View>


      <View style={tw`bg-white rounded-2xl p-4 border border-gray-200 mb-6`}>

        <Text style={tw`font-medium text-gray-800`}>
          From:{' '}
          <Text style={tw`text-sm text-gray-700 font-normal`}>
            {rideDetails.originStopName}
          </Text>
        </Text>
        

        <Text style={tw`font-medium text-gray-800`}>
          To:{' '}
          <Text style={tw`text-sm text-gray-700 font-normal`}>
            {rideDetails.destinationStopName}
          </Text>
        </Text>

        
        <Text style={tw`font-medium text-gray-800`}>
          Departure:{' '}
          <Text style={tw`text-sm text-gray-700 font-normal`}>
            {new Date(rideDetails.departure_time).toLocaleString()}
          </Text>
        </Text>
        
        

        <Text style={tw`font-medium text-gray-800`}>
          Available_seats:{' '}
          <Text style={tw`text-sm text-gray-700 font-normal`}>
            {rideDetails.available_seats}
          </Text>
        </Text>

        <View style={tw`flex-row justify-between mt-2`}>
          {rideDetails.status === 'Scheduled' && (
            <>
              <TouchableOpacity
                style={tw`bg-blue-600 py-2 px-4 rounded-xl flex-1 mr-2`}
                onPress={handleStartRide}
              >
                <Text style={tw`text-white text-center font-semibold`}>Start Ride</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-red-600 py-2 px-4 rounded-xl flex-1 ml-2`}
                onPress={handleCancelRide}
              >
                <Text style={tw`text-white text-center font-semibold`}>Cancel Ride</Text>
              </TouchableOpacity>
            </>
          )}

          {rideDetails.status === 'Active' && (
            <>
              <TouchableOpacity
                style={tw`bg-green-600 py-2 px-4 rounded-xl flex-1 mr-2`}
                onPress={handleCompleteRide}
              >
                <Text style={tw`text-white text-center font-semibold`}>Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-red-600 py-2 px-4 rounded-xl flex-1 ml-2`}
                onPress={handleCancelRide}
              >
                <Text style={tw`text-white text-center font-semibold`}>Cancel Ride</Text>
              </TouchableOpacity>
            </>
          )}
        </View>


        {/* Toggle Subroutes */}
        <TouchableOpacity
          style={tw`flex-row items-center justify-between mt-3`}
          onPress={() => setShowSubroutes(!showSubroutes)}
        >
          <Text style={tw`text-blue-600 font-medium text-sm`}>
            {showSubroutes ? 'Hide Subroute Details' : 'Show Subroute Details'}
          </Text>
          <Ionicons
            name={showSubroutes ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={20}
            style={tw`text-blue-600`}
          />
        </TouchableOpacity>
        
        {showSubroutes && (
          <View style={tw`mt-4 rounded-b-xl overflow-hidden`}>
            <View style={tw`flex-row bg-blue-100 rounded-t-xl px-3 py-2`}>
              <Text style={tw`flex-1 text-xs font-semibold text-gray-700`}>From</Text>
              <Text style={tw`flex-1 text-xs font-semibold text-gray-700`}>To</Text>
              <Text style={tw`w-14 text-xs font-semibold text-gray-700 text-center`}>Dist</Text>
              <Text style={tw`w-14 text-xs font-semibold text-gray-700 text-center`}>Time</Text>
              <Text style={tw`w-14 text-xs font-semibold text-gray-700 text-center`}>Cost</Text>
            </View>

            {rideDetails.subroutes.map((sr, idx) => (
              <View
                key={idx}
                style={tw`flex-row px-3 py-2 ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'} border-t border-blue-100`}
              >
                <Text style={tw`flex-1 text-xs text-gray-800`}>{sr.from_stop_name}</Text>
                <Text style={tw`flex-1 text-xs text-gray-800`}>{sr.to_stop_name}</Text>
                <Text style={tw`w-14 text-xs text-gray-800 text-center`}>{sr.distance}m</Text>
                <Text style={tw`w-14 text-xs text-gray-800 text-center`}>{sr.time}m</Text>
                <Text style={tw`w-14 text-xs text-gray-800 text-center`}>₹{sr.cost}</Text>
              </View>
            ))}
          </View>
        )}


      </View>
    </ScrollView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    marginTop:20,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },

  content:{
    padding:20,
  },
  centered: {

    flex: 1,
    justifyContent: 'start',
    marginTop:90,
    alignItems: 'center',
  },
  heading: {
    marginTop:10,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
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
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#1F2937',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  subrouteBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    marginBottom:10,
  },
  subrouteText: {
    fontWeight: '600',
    fontSize: 16,
  },
  subrouteInfo: {
    fontSize: 14,
    color: '#4B5563',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  rideCard: {
    marginTop: 5,
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

export default RideDetailsScreen;
