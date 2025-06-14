import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CreateRideScreen from './CreateRideScreen';
import RideDetailsScreen from './RideDetailsScreen';
import RideRequestsScreen from './RideRequestsScreen';
import ChatScreen from './ChatScreen';

const Tab = createBottomTabNavigator();

const DriverTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {iconName = 'car-outline';}
          else if (route.name === 'Rides') {iconName = 'list-outline';}
          else if (route.name === 'Requests') {iconName = 'people-outline';}
          else if (route.name === 'Chat') {iconName = 'chatbubble-ellipses-outline';}
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={CreateRideScreen} />
      <Tab.Screen name="Rides" component={RideDetailsScreen} />
      <Tab.Screen name="Requests" component={RideRequestsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
};

export default DriverTabs;
