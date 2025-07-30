import React, { useEffect, useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CreateRideScreen from './CreateRideScreen';
import RideDetailsScreen from './RideDetailsScreen';
import RideRequestsScreen from './RideRequestsScreen';
import ChatScreen from './ChatScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useIsFocused } from '@react-navigation/native';
import api from '../src/api/axios';
import { useUnread } from './unreadContext';

const Tab = createBottomTabNavigator();

const DriverTabs = () => {
  const {unreadCount, fetchUnreadCount} = useUnread();
  const isFocused = useIsFocused(); // detects focus on this entire tab navigator

  // Re-fetch every time DriverTabs comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  // Optional: keep refreshing every time tabs change (not just initial mount)
  useEffect(() => {
    if (isFocused) {
      fetchUnreadCount();
    }
  }, [isFocused]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'car-outline';
          else if (route.name === 'Rides') iconName = 'list-outline';
          else if (route.name === 'Requests') iconName = 'notifications';
          else if (route.name === 'Chat') iconName = 'chatbubble-ellipses-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={CreateRideScreen} />
      <Tab.Screen name="Rides" component={RideDetailsScreen} />
      <Tab.Screen 
        name="Requests" 
        component={RideRequestsScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: {
            backgroundColor: 'red',
            color: 'white',
          },
        }}
      />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
};

export default DriverTabs;
