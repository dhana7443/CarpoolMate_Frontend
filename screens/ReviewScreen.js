import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import Toast from 'react-native-toast-message';

const ReviewScreen = ({ route, navigation }) => {
  const { rideId, driverId, driverName } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('userToken');

      await api.post(
        '/reviews/',
        {
          rideId,
          revieweeId: driverId,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Review submitted successfully!',
      });

      navigation.replace('RiderDashboard'); // or another screen after review
    } catch (err) {
      console.error('Error submitting review:', err);
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'Failed to submit review',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate your ride with {driverName}</Text>

      {/* Star rating */}
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, rating >= star && styles.filledStar]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Comment box */}
      <TextInput
        style={styles.input}
        placeholder="Write a review (optional)"
        multiline
        value={comment}
        onChangeText={setComment}
      />

      {/* Submit button */}
      <TouchableOpacity
        style={[styles.button, rating === 0 && { opacity: 0.5 }]}
        disabled={submitting || rating === 0}
        onPress={submitReview}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center' 
    },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
    },
  starsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 20 
    },
  star: { 
    fontSize: 40, 
    color: 'gray', 
    marginHorizontal: 5 
    },
  filledStar: { 
    color: 'gold'
    },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    height: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold' },
});

export default ReviewScreen;
