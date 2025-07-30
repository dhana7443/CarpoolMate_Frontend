import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/api/axios';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';


const WalletScreen = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');

  const navigation=useNavigation();

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const { data } = await api.get('/wallets/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(data.balance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      Toast.show({
        type: 'error',
        text1: 'Error fetching wallet balance',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid amount',
      });
      return;
    }

    try {
      setAdding(true);
      const token = await AsyncStorage.getItem('userToken');
      const { data } = await api.post(
        '/wallets/add-money',
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBalance(data.wallet.balance);
      console.log(data.wallet.balance);
      setAmount('');
      Keyboard.dismiss();
      Toast.show({
        type: 'success',
        text1: 'Money added successfully!',
      });
      
    } catch (err) {
      console.error('Error adding money:', err);
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'Error adding money',
      });
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

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
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.label}>
          Current Balance: <Text style={styles.value}>₹{balance}</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter amount to add"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity style={styles.button} onPress={handleAddMoney} disabled={adding}>
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Money</Text>
          )}
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 12,
    textAlign: 'center',
  },
  value: {
    fontWeight: '600',
    color: '#0F172A',
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
