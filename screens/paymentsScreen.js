import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import tw from 'twrnc';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SendPaymentScreen = ({ route, navigation }) => {
  const { requestId } = route.params;
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [walletBalance, setWalletBalance] = useState(null);
  const [rideCost, setRideCost] = useState(null);
  const [afterBalance, setAfterBalance] = useState(null);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      const [rideCostRes, walletRes] = await Promise.all([
        api.get(`/payments/ride-cost/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get('/wallets/balance', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRideCost(rideCostRes.data.ride_cost);
      setWalletBalance(walletRes.data.balance);
    } catch (err) {
      console.error('Error fetching data:', err);
      Toast.show({
        type: 'error',
        text1: 'Error fetching payment info',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendPayment = async () => {
    if (walletBalance < rideCost) {
      navigation.navigate('Wallet');
      return;
    }

    try {
      setSending(true);
      const token = await AsyncStorage.getItem('userToken');
      const { data } = await api.post(
        '/wallets/send-money',
        {
          requestId,
          amount: rideCost,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAfterBalance(data.result.riderWallet.balance);
      setWalletBalance(data.result.riderWallet.balance);

      Toast.show({
        type: 'success',
        text1: 'Payment sent successfully!',
      });
    } catch (err) {
      console.error('Error sending payment:', err);
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'Payment failed',
      });
    } finally {
      setSending(false);
    }
  };

  // Load on first mount
  useEffect(() => {
    fetchData();
  }, []);

  // Also reload when screen comes into focus (after Wallet screen)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Back Arrow */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={tw`absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow`}
      >
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Payment Summary</Text>
        <Text style={styles.label}>Ride Cost: <Text style={styles.value}>₹{rideCost}</Text></Text>
        <Text style={styles.label}>Wallet Balance: <Text style={styles.value}>₹{walletBalance}</Text></Text>

        {afterBalance && (
          <Text style={styles.success}>
            Payment successful! 
          </Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSendPayment}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {walletBalance < rideCost ? 'Add Money to Wallet' : 'Send Payment'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
};

export default SendPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 10,
  },
  value: {
    color: '#475569',
  },
  success: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
    marginVertical: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
