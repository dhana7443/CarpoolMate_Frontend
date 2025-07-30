// components/PreviousRideItem.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet ,ActivityIndicator} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PreviousRideItem = ({ ride, onPress ,previousLoadingId}) => {
  console.log(previousLoadingId);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}
    >
      <View>
        <View style={styles.row}>
            <Text style={styles.label}>From:   </Text>
        <Text style={styles.value}>{ride.from}</Text>
        </View>
        <View style={styles.row}> 
            <Text style={[styles.label, { marginTop: 3 }]}>To:        </Text>
        <Text style={styles.value}>{ride.to}</Text>
        </View>
        
      </View>
      {previousLoadingId === ride.req_id ? (
      <ActivityIndicator size={20} color="#1e40af" />
      ) : (
      <Ionicons name="chevron-forward" size={24} color="#1e40af" />
      )}
      </TouchableOpacity>
      );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontSize: 16,
    color:'#334155',
    fontWeight:'700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});

export default PreviousRideItem;
