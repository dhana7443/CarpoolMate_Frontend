import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import styles from './BookingRequestItem.styles';
import Icon from 'react-native-vector-icons/Ionicons';

const statusColors = {
  Pending: '#facc15',
  Accepted: '#16a34a',
  Rejected: '#f87171',
  Cancelled: '#94a3b8',
  CompletedByRider: '#4ade80' // blue for completed
};

const BookingRequestItem = ({ request, onPress, onCancel, onComplete,onChat }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Status Badge at top right */}
      <View style={styles.statusBadgeContainer}>
        <View
          style={[
            styles.badgeBase,
            { backgroundColor: statusColors[request.status] || '#94a3b8' },
          ]}
        >
          <Text style={styles.badgeText}>
            {request.status === 'CompletedByRider' ? 'Completed' : request.status}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, marginTop: 15 }}>
        <View style={styles.row}>
          <Text style={styles.label}>From: </Text>
          <Text style={styles.value}>{request.from}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>To: </Text>
          <Text style={styles.value}>{request.to}</Text>
        </View>

        {request.ride && (
          <View style={styles.row}>
            <Text style={styles.label}>Departure: </Text>
            <Text style={styles.value}>
              {new Date(request.ride.departure_time).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Action buttons row */}
        {(request.status === 'Pending' || request.status === 'Accepted') && (
          <View style={[styles.row, { marginTop: 12 }]}>
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                Alert.alert(
                  'Cancel Request',
                  'Are you sure you want to cancel this ride request?',
                  [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', onPress: () => onCancel(request.request_id) },
                  ]
                );
              }}
              style={[
                styles.badgeBase,
                { backgroundColor: '#ef4444', marginRight: 12 },
              ]}
            >
              <Text style={styles.badgeText}>Cancel</Text>
            </TouchableOpacity>

            {/* Complete Button */}
            {request.status === 'Accepted' && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  Alert.alert(
                    'Mark as Complete',
                    'Have you completed this ride?',
                    [
                      { text: 'No', style: 'cancel' },
                      { text: 'Yes', onPress: () => onComplete(request.request_id) },
                    ]
                  );
                }}
                style={[
                  styles.badgeBase,
                  { backgroundColor: '#a855f7',marginRight:12 },
                ]}
              >
                <Text style={styles.badgeText}>Complete</Text>
              </TouchableOpacity>
            )}

            {/* chat button */}
            {request.status === 'Accepted' && (
              <TouchableOpacity
                style={[styles.badgeBase, { backgroundColor: '#2563eb' }]}
                onPress={() =>
                  onChat({
                    rideId: request.ride.ride_id,
                    requestId: request.request_id,
                    riderId: request.rider_id
                  })
                }
              >
                <Text style={styles.badgeText}>Chat</Text>
              </TouchableOpacity>
            )}

          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default BookingRequestItem;
