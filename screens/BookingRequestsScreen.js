import React, {useState,useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl,Alert, StyleSheet,ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import Header from '../components/headerItem';
import BookingRequestItem from '../components/BookingRequestItem';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

const BookingRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [LoadingRequestId,setLoadingRequestId]=useState(false);

  const navigation=useNavigation();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const { data } = await api.get('/ride-requests/rider-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(data.requests);
      setRequests(data.requests);
    } catch (err) {
      console.error('Error fetching ride requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelRideRequest = async (requestId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await api.put(`/ride-requests/${requestId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Request Cancelled', 'Your ride request has been cancelled.');
      fetchRequests(); // re-fetch updated list
    } catch (err) {
      console.error('Error cancelling request:', err);
      Alert.alert('Error', 'Could not cancel the ride request. Please try again.');
    }
  };

  const markRideAsComplete = async (requestId) => {
  try {
    setLoadingRequestId(requestId); // Optional: to show ActivityIndicator on that button
    const token = await AsyncStorage.getItem('userToken');
    const { data } = await api.put(`/ride-requests/${requestId}/mark-complete`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Toast.show({
      type: 'success',
      text1: 'Ride marked as completed',
    });
    
    setTimeout(() => {
      navigation.navigate('Payments', { requestId });
    }, 1000);
    fetchRequests();
  } catch (err) {
    console.error('Error marking ride complete:', err);
    Alert.alert('Error', err.response?.data?.message || 'Failed to mark as complete');
  } finally {
    setLoadingRequestId(null);
  }
};

  useFocusEffect(
      useCallback(()=>{
        fetchRequests();
      },[])
    );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests().finally(() => setRefreshing(false));
  };

  const handleChat=async({rideId,requestId,riderId})=>{
    try {
    const token = await AsyncStorage.getItem("userToken");
    const res = await api.get(`/rides/${rideId}/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const driverId = res.data.driverId;
    console.log("driverId:",driverId);
    navigation.navigate("chat", {
      rideId,
      requestId,
      otherUserId: driverId, // driver is the other user
    });
  } catch (err) {
    console.error("Error fetching ride info:", err);
    Alert.alert("Error", "Unable to fetch ride info for chat");
  }
  }
  return (
    <View style={styles.container}> 
      {/* header */}
      <Header/>
      <View style={{flex:1,padding:16}}>
        <View style={styles.card}> 
          
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 12 }}>
          Bookings
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#1e40af" />
          ) : requests.length === 0 ? (
            <Text style={{ color: '#000', fontSize: 16 }}>No ride requests found.</Text>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.request_id}
              renderItem={({ item }) => (
                
                  <BookingRequestItem
                  request={item}
                  onPress={() => {
                    // Future: show details or cancel modal
                  }}
                  onCancel={cancelRideRequest}
                  onComplete={markRideAsComplete}
                  onChat={handleChat}
                />
                
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
          <Toast/>
        
      </View>
      </View>
      
      
    </View>
    
  );
};

export default BookingRequestsScreen;

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#f9f9f9',
  },
  card: {
    backgroundColor: '#fff',
    marginTop:40,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
})