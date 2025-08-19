import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import tw from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useUnread } from './unreadContext';
import Header from '../components/headerItem';
import { useNavigation } from '@react-navigation/native';


const RideRequestsScreen = () => {
  const [rideRequests, setRideRequests] = useState(null);
  const {fetchUnreadCount,setUnreadCount}=useUnread();
  const navigation=useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchRideRequests();
    }, [])
  );

  const fetchRideRequests = async () => {
    try {
      const ride_id = await AsyncStorage.getItem("ride_id");
      if (!ride_id){
        // If no active ride, clear the requests state
      setRideRequests([]);
      return; //prevents api call
      }
      const token = await AsyncStorage.getItem("userToken");
      const res = await api.get(`/ride-requests/ride/${ride_id}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRideRequests(res.data);
      console.log(res.data);
      //mark all ride requests as seen

      await api.put(`ride-requests/ride/${ride_id}/mark-seen`,{
        headers:{Authorization:`Bearer ${token}`}
      })

      setUnreadCount(0);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error fetching ride requests' });
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await api.put(
        `/ride-requests/request/${requestId}/status`,
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Toast.show({
        type: 'success',
        text1: `Request ${action} successfully`,
      });
      fetchRideRequests();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: `Failed to ${action} request`,
        text2: err.response?.data?.message || 'Server error',
      });
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return styles.pendingStatus;
      case 'Accepted': return styles.acceptedStatus;
      case 'Rejected': return styles.rejectedStatus;
      case 'Cancelled': return styles.cancelledStatus;
      case 'CompletedByRider': return styles.completedStatus;
      default: return {};
    }
  };

  return (
    <View style={styles.container}>
      <Header/>
    <ScrollView style={tw`p-4`}>

      {!rideRequests ? (
        <Text style={tw`text-center text-gray-500`}>Loading...</Text>
      ) : !rideRequests?.requests || rideRequests.requests.length === 0 ? (
        <Text style={tw`text-center  m-7 text-gray-500`}>No ride requests</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Requests:</Text>
          {rideRequests.requests.map((req) => (
            <View key={req.request_id} style={styles.requestCard}>
              <View style={tw`flex-row justify-between items-center`}>
                {/* <Text style={styles.name}>{req.rider.name}</Text> */}

                <Text style={tw`font-medium text-gray-800`}>
                  Name:{' '}
                  <Text style={tw`text-sm text-gray-700 font-normal`}>
                    {req.rider.name}
                  </Text>
                </Text>

                

                <Text style={[styles.status, getStatusStyle(req.status)]}>
                  {req.status === 'CompletedByRider' ? 'Completed' : req.status}
                </Text>
              </View>
              {/* <Text style={styles.email}>{req.rider.email}</Text> */}

              <Text style={tw`font-medium text-gray-800`}>
                  Email:{' '}
                  <Text style={tw`text-sm text-gray-700 font-normal`}>
                    {req.rider.email}
                  </Text>
                </Text>

              {/* <Text>From: {req.rider_from_stop}</Text> */}

              <Text style={tw`font-medium text-gray-800`}>
                  From:{' '}
                  <Text style={tw`text-sm text-gray-700 font-normal`}>
                    {req.rider_from_stop}
                  </Text>
                </Text>

              {/* <Text>To: {req.rider_to_stop}</Text> */}

              <Text style={tw`font-medium text-gray-800`}>
                  To:{' '}
                  <Text style={tw`text-sm text-gray-700 font-normal`}>
                    {req.rider_to_stop}
                  </Text>
              </Text>

              {/* <Text>Requested At: {new Date(req.requested_at).toLocaleString()}</Text> */}

              <Text style={tw`font-medium text-gray-800`}>
                  Requested:{' '}
                  <Text style={tw`text-sm text-gray-700 font-normal`}>
                    {new Date(req.requested_at).toLocaleString()}
                  </Text>
              </Text>
              {/* {req.status === 'Pending' && (
                <View style={tw`flex-row justify-between mt-3`}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#28a745' }]}
                    onPress={() => handleAction(req.request_id, 'Accepted')}
                  >
                    <Text style={styles.btnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#dc3545' }]}
                    onPress={() => handleAction(req.request_id, 'Rejected')}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {req.status === 'Accepted' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#2563eb' }]}
                  onPress={() =>
                    navigation.navigate('ChatScreen', {
                      rideId: req.ride_id,
                      requestId: req.request_id,
                      riderId: req.rider_id
                    })
                  }
                >
                  <Text style={styles.btnText}>Chat</Text>
                </TouchableOpacity>
              )} */}

              <View >
                {req.status === 'Pending' ? (
                  <View style={tw`flex-row justify-between mt-3`}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#28a745' }]}
                      onPress={() => handleAction(req.request_id, 'Accepted')}
                    >
                      <Text style={styles.btnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#dc3545' }]}
                      onPress={() => handleAction(req.request_id, 'Rejected')}
                    >
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : req.status === 'Accepted' ? (
                  <View style={tw` mt-3`}>
                    <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#2563eb' }]}
                    onPress={() =>
                      navigation.navigate('chat', {
                        rideId: rideRequests.ride_id,
                        requestId: req.request_id,
                        riderId: req.rider.id
                      })
                    }
                    >
                      <Text style={styles.btnText}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                  
                ) : null}
              </View>

            </View>
          ))}
        </View>
      )}
      <Toast/>
    </ScrollView>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#f9f9f9'
  },
  card: {
    backgroundColor: '#fff',
    flex:1,
    marginTop:40,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  header: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#444',
  },
  info: {
    color: '#666',
    marginBottom: 2,
  },
  sectionHeader: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 4,
  },
  requestCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    elevation:0.5
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000',
    marginRight:5
  },
  email: {
    color: '#666',
    marginBottom: 6,
  },
  status: {
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    fontSize: 12,
  },
  pendingStatus: {
    backgroundColor: '#ffc107',
    color: '#fff',
  },
  acceptedStatus: {
    backgroundColor: '#28a745',
    color: '#fff',
  },
  rejectedStatus: {
    backgroundColor: '#dc3545',
    color: '#fff',
  },
  cancelledStatus: {
  backgroundColor: '#94a', 
  //backgroundColor:'#14b8a6'
  color: '#fff',
  },
  completedStatus:{
    backgroundColor:'#a855f7',
    color:'#fff'
  },

  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default RideRequestsScreen;
