import React, { useEffect, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchRidesScreen from './SearchRidesScreen';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useUnread } from './unreadContext'; // reuse if needed for notifications
import RideResultsScreen from './RideResultsScreen';
import ProfileScreen from './ProfileScreen';
import BookingRequestsScreen from './BookingRequestsScreen';
const Tab = createBottomTabNavigator();

const RiderTabs = () => {
  const { unreadCount, fetchUnreadCount } = useUnread();
  const isFocused = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

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
          if (route.name === 'Home') iconName = 'search-outline';
          else if (route.name === 'Bookings') iconName = 'calendar-outline';
          else if (route.name === 'Dummy') iconName = 'ellipse-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={SearchRidesScreen} />
      <Tab.Screen name="Bookings" component={BookingRequestsScreen} />
      {/* <Tab.Screen name="Dummy" component={DummyScreen} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen}/>
    </Tab.Navigator>
  );
};

export default RiderTabs;
