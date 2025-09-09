import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import { parseJwt } from '../utils/jwt';

const UnreadContext = createContext();

export const useUnread = () => useContext(UnreadContext);

export const UnreadProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setRideRequests([]);
        return;
      }

      const decoded = parseJwt(token);
      const userId = decoded?.user_id;
      if (!userId) {
        setRideRequests([]);
        return;
      }
      const ride_id = await AsyncStorage.getItem(`ride_id_${userId}`);
      if (!token || !ride_id) return;

      const res = await api.get(`/ride-requests/ride/${ride_id}/unseen-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data?.count || 0);
      console.log("Unread count fetched:", res.data?.count || 0);
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
