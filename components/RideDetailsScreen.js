import React, { useEffect, useState } from 'react';
import { View,Alert, Text, StyleSheet, SafeAreaView,ScrollView, ActivityIndicator ,TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const RideDetailsScreen = () => {
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubroutes, setShowSubroutes] = useState(false);

  const fetchRideDetails = async () => {
    try {
      const ride_id = await AsyncStorage.getItem('ride_id');
      console.log(ride_id);
      const token = await AsyncStorage.getItem('userToken');
      console.log(token);
      if (!ride_id || !token) {
        throw new Error('Ride ID or token not found.');
      }

      const response = await api.get(`/rides/ride/${ride_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setRideDetails(response.data);
    } catch (err) {
      console.error('Error fetching ride details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(()=>{
      fetchRideDetails();
    },[])
  );

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
              const ride_id = await AsyncStorage.getItem('ride_id');
              const token = await AsyncStorage.getItem('userToken');
              console.log(ride_id);
              console.log(token);
              await api.put(`/rides/cancel/${ride_id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              await AsyncStorage.removeItem('ride_id');
              Toast.show({
                type: 'success',
                text1: 'Ride cancelled successfully',
              });

              setRideDetails(null);
            } catch (error) {
              console.error('Cancel Ride Error:', error.message);
              Toast.show({
                type: 'error',
                text1: 'Failed to cancel ride',
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!rideDetails) {
    return (
      <View style={styles.centered}>
        <Text >No active rides at this point or failed to load details</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.heading}>Ride Details</Text>
        <View style={styles.rideCard}>
          <Text style={styles.sectionTitle}>Ride Created</Text>
          <Text style={styles.detailText}>
            From: <Text style={styles.bold}>{rideDetails.originStopName}</Text>
          </Text>
          <Text style={styles.detailText}>
            To: <Text style={styles.bold}>{rideDetails.destinationStopName}</Text>
          </Text>
          <Text style={styles.detailText}>
            Departure: {new Date(rideDetails.departure_time).toLocaleString()}
          </Text>
          <Text style={styles.detailText}>
            Available Seats: {rideDetails.available_seats}
          </Text>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowSubroutes(!showSubroutes)}
          >
            <Text style={styles.subrouteHeader}>Subroute Details</Text>
            <Ionicons
              name={showSubroutes ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={24}
              color="#000"
            />
          </TouchableOpacity>

          {showSubroutes && (
            <View>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>From</Text>
                <Text style={styles.tableCell}>To</Text>
                <Text style={styles.tableCell}>Dist</Text>
                <Text style={styles.tableCell}>Time</Text>
                <Text style={styles.tableCell}>Cost</Text>
              </View>

              {rideDetails.subroutes.map((sr, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{sr.from_stop_name}</Text>
                  <Text style={styles.tableCell}>{sr.to_stop_name}</Text>
                  <Text style={styles.tableCell}>{sr.distance} m</Text>
                  <Text style={styles.tableCell}>{sr.time} min</Text>
                  <Text style={styles.tableCell}>₹{sr.cost}</Text>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#d9534f', margin: 15 }]}
            onPress={handleCancelRide}
          >
            <Text style={styles.primaryButtonText}>Cancel</Text>
          </TouchableOpacity>
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
