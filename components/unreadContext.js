import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';

const UnreadContext = createContext();

export const useUnread = () => useContext(UnreadContext);

export const UnreadProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const ride_id = await AsyncStorage.getItem('ride_id');
      if (!token || !ride_id) return;

      const res = await api.get(`/ride-requests/ride/${ride_id}/unseen-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data?.count || 0);
    } catch (err) {
      console.log("Unread count fetch failed", err);
    }
  };

  return (
    <UnreadContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
      {children}
    </UnreadContext.Provider>
  );
};
