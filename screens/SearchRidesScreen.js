import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TextInput,
  Image
} from 'react-native';
import tw from 'twrnc';
import api from '../src/api/axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { parseJwt } from '../utils/jwt';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PreviousRideItem from '../components/PreviousRideItem';

const SearchRidesScreen = () => {
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState('');
  const [selectedTo, setSelectedTo] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousRides,setPreviousRides]=useState([]);
  const [previousLoadingId,setPreviousLoadingId]=useState(null);

  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const navigation = useNavigation();

  const fetchFromLocations = async () => {
    try {
      const { data } = await api.get('/routes/start-stops');
      const uniqueStopNames = data.map((item) => item.stop_name);
      setFromLocations(uniqueStopNames);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchToLocations = async (startStopName) => {
    try {
      const { data } = await api.get('/routes/end-stops', {
        params: { startStopName },
      });
      const uniqueToStopNames = data.map((item) => item.stop_name);
      setToLocations(uniqueToStopNames);
    } catch (err) {
      console.error(err);
    }
  };

  const searchRides = async () => {
    if (!selectedFrom || !selectedTo) { return; }
    try {
      setSearchLoading(true);
      const now = new Date();
      const datetimestr = now.toISOString();
      const { data } = await api.get('/rides/search-rides', {
        params: {
          startStopName: selectedFrom,
          endStopName: selectedTo,
          datetime: datetimestr,
        },
      });
      if (data && data.rides) {
        navigation.navigate('RideResultsScreen', {
          rides: data.rides,
          from: selectedFrom,
          to: selectedTo,
          date: datetimestr.split('T')[0],
        });
      } else {
        Alert.alert('No rides found');
      }
    } catch (err) {
      console.error('Error fetching rides:', err);
      Alert.alert('Error fetching rides');
    } finally {
      setSearchLoading(false);
    }
  };

  //handle previous rides
  const handlePreviousRidePress = async(from,to,reqId) => {
    try {
    console.log(previousLoadingId);
    setPreviousLoadingId(reqId);
    console.log(previousLoadingId);
    const now = new Date();
    const datetimestr = now.toISOString();

    const { data } = await api.get('/rides/search-rides', {
      params: {
        startStopName: from,
        endStopName: to,
        datetime: datetimestr,
      },
    });

    if (data && data.rides) {
      navigation.navigate('RideResultsScreen', {
        rides: data.rides,
        from,
        to,
        date: datetimestr.split('T')[0],
      });
    } else {
      Alert.alert('No rides found');
    }
  } catch (err) {
    console.error('Error fetching rides:', err);
    Alert.alert('Error fetching rides');
  } finally {
    setPreviousLoadingId(null);
  }
  };


  const fetchPreviousRides=async()=>{
    try{
      const token=await AsyncStorage.getItem('userToken');
      if (!token) return;
      const {data}=await api.get('/rides/rider-rides',{
        headers:{Authorization:'Bearer ${token}'}
    });
    setPreviousRides(data.rides);
    console.log('Previous rides:',data.rides);
    }catch(err){
      console.error('Error fetching previous rides:',err);
    }

  };


  useEffect(() => {
    fetchFromLocations();
    fetchPreviousRides();
  }, []);

  useEffect(() => {
    if (selectedFrom) { fetchToLocations(selectedFrom); }
  }, [selectedFrom]);

  return (
    <ScrollView style={styles.container}>
      {/* Header with Logo, App Name, Hamburger */}
      <View style={styles.headerContainer}>
        <View style={styles.logoRow}>
          <Image source={require('../images/car.png')} style={styles.logo} />
          <Text style={styles.appName}>
            <Text style={styles.appNameBlue}>CarPool</Text>
            <Text style={styles.appNameBlack}>Mate</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={getProfile}>
          <Ionicons name="menu" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>
    //Search Card
    <View style={styles.searchCard}>
      <Text style={styles.heading}>Search Rides</Text>

       {/* From Location Picker */}
       {/* <Text style={tw`mb-2 text-gray-800`}>From</Text> */}
       <Picker selectedValue={selectedFrom} onValueChange={(val) => {
        setSelectedFrom(val);
        setSelectedTo('');
        
      }}>
        <Picker.Item label="Select From Location" value="" />
        {fromLocations.map((name, idx) => (
          <Picker.Item label={name} value={name} key={idx} />
        ))}
      </Picker>

      {/* To Location Picker */}
      {/* <Text style={tw`mt-4 mb-2 text-gray-800`}>To</Text> */}
       <Picker selectedValue={selectedTo} onValueChange={setSelectedTo}>
         <Picker.Item label="Select To Location" value="" />
         {toLocations.map((name, idx) => (
          <Picker.Item label={name} value={name} key={idx} />
        ))}
      </Picker>
      

      {/* Search Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#1e40af',
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop:15
        }}
        onPress={searchRides}
        disabled={searchLoading}
      >
        {searchLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Search Rides</Text>
        )}
      </TouchableOpacity>
    </View>
      
      //my rides
      <View style={styles.previousRidesCard}>
        <Text style={styles.previousRidesHeading}>Previous Rides</Text>

        {previousRides && previousRides.length === 0 ? (
          <Text style={styles.noRidesText}>No previous rides found.</Text>
        ) : (
          previousRides &&
          previousRides.map((ride, idx) => (
            <PreviousRideItem
              key={idx}
              ride={ride}
              onPress={() => handlePreviousRidePress(ride.from,ride.to,ride.req_id)}
              previousLoadingId={previousLoadingId}
              style={{marginBottom:20}}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default SearchRidesScreen;

const PRIMARY = '#5A67D8';
const TEXT_LIGHT = '#F8FAFC'; // Light slate
const TEXT_ACCENT = '#38BDF8'; // Cyan-400
const SCREEN_BG = '#0F172A';
// const SCREEN_BG='white';
const styles = StyleSheet.create({
  container:{
    // backgroundColor:'#f1f5f9',
    backgroundColor:SCREEN_BG,
    padding:20
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 12,
    paddingHorizontal: 4,
    
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  appNameBlue: {
    color: '#3B82F6',
  },
  appNameBlack: {
    color: '#38BDF8',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius:20
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#314155',
    marginBottom: 6,
  },
  pickerWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    color: '#334155',
  },
  appName: {
    fontSize: 20,      // optimized for small screens
    fontWeight: '700',
    textAlign: 'center',
  },
  primary: {
    color: TEXT_ACCENT, // Cyan blue for "Carpool"
  },
  accent: {
    color: TEXT_LIGHT,  // White for "Mate"
  },
  ctaButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginRight: 6,
  },
  ctaIcon: {
    marginTop: 1,
  },
  searchButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previousRidesCard: {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: 16,
  marginTop: 40,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
},
previousRidesHeading: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#1e40af',
  marginBottom: 12,
},
noRidesText: {
  color: '#64748b',
},

});

