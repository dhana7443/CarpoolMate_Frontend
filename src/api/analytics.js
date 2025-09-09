import api from "./axios";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAnalytics = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const res = await api.get("/analytics/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching analytics:", err);
    throw err;
  }
};