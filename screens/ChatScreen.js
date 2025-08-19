// ChatScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { parseJwt } from '../utils/jwt';
import api from '../src/api/axios'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import tw from 'twrnc';

const ChatScreen = ({ route }) => {
  const { rideId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo,setReplyingTo]=useState(null);
  const socketRef = useRef(null);
  const flatListRef = useRef();
  const currentUserIdRef = useRef(null);
  const navigation=useNavigation();


  // Fetch old messages once
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await api.get(`/chats/rides/${rideId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Normalize sender IDs to string for comparison
        const normalized = res.data.map((m) => ({
          ...m,
          sender: m.sender_id?.toString(),
          replyTo:m.reply_to,
          replyToContent:res.data.find(r => r._id === m.reply_to)?.message || null
        }));

        setMessages(normalized);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [rideId]);

  // Socket setup
  useEffect(() => {
    const setupSocket = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const decodedToken = parseJwt(token);
      currentUserIdRef.current = decodedToken.user_id.toString();

      const newSocket = io('http://127.0.0.1:3000', {
        auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket', newSocket.id);
        newSocket.emit('joinRoom', rideId);
      });


      // Receive new messages
      newSocket.on('receiveMessage', (msg) => {
        const normalizedMsg = {
          ...msg,
          sender: msg.sender?.toString(),
          createdAt: msg.createdAt || new Date().toISOString(),
          replyTo: msg.replyTo?._id || null,
          replyToContent: msg.replyTo?.message || null
        };

        setMessages((prev) => {
          const index = prev.findIndex(
            (m) =>
              (m._id && normalizedMsg._id && m._id === normalizedMsg._id) ||
              (m.localId && normalizedMsg.localId && m.localId === normalizedMsg.localId)
          );

          if (index !== -1) {
            //  Update existing message (important for delete state sync)
            const updated = [...prev];
            updated[index] = { ...updated[index], ...normalizedMsg };
            return updated;
          }

          //  Otherwise add as new
          const updated = [...prev, normalizedMsg];
          updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return updated;
        });
      });

      newSocket.on('error', (err) => {
        console.log('Socket error:', err);
      });

      socketRef.current = newSocket;
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoom', rideId);
        socketRef.current.disconnect();
        socketRef.current.disconnect();
      }
    };
  }, [rideId]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;

    const localId=Date.now().toString();

    const localMsg = {
      localId, // temporary unique id
      sender: currentUserIdRef.current,
      message: inputMessage,
      createdAt: new Date().toISOString(),
      pending:true,
      replyTo:replyingTo?._id || null
    };

    console.log(localMsg.timestamp);
    // Optimistic UI update
    setMessages((prev) => [...prev, localMsg]);

    // Emit to server
    socketRef.current.emit('sendMessage', {
      rideId,
      senderId:currentUserIdRef.current,
      message: inputMessage,
      replyTo:localMsg.replyTo,
      createdAt: localMsg.createdAt,
      localId
    });

    setInputMessage('');
    setReplyingTo(null);
  };

  const deleteMessage = async (msg) => {
    if(!msg._id && !msg.localId) return;
    if (msg.sender !== currentUserIdRef.current) return;

    const token=await AsyncStorage.getItem('userToken');
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {

              setMessages((prev) =>
                prev.map((m) =>
                  (m._id && m._id === msg._id) || (m.localId && m.localId === msg.localId)
                    ? { ...m, message: 'This message was deleted', deleted: true }
                    : m
                )
              );
              if(msg._id){
                await api.delete(`/chats/rides/${rideId}/message/${msg._id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
              }
            

            } catch (err) {
              console.error('Error deleting message:', err);
            }
          }
        }
      ]
    );
  };


  const renderItem = ({ item }) => {
    const isSelf = item.sender?.toString() === currentUserIdRef.current?.toString();
    const replyText=item.replyToContent || '[This message was deleted]';
    return (
      <TouchableOpacity
        onLongPress={() => deleteMessage(item)}
        onPress={() => !isSelf &&  setReplyingTo(item)}
      >

        <View
        style={[
          styles.messageContainer,
          isSelf ? styles.selfMessage : styles.otherMessage,
        ]}
        >
          {item.replyTo &&  (
            <View style={styles.replyContainer}>
              <Text style={styles.replyText}>
                Replying to: {replyText}
              </Text>
            </View>
          )}

          <Text
            style={[
              
              item.deleted
              ? styles.deletedText : styles.messageText,
              {
                 color:item.sender===currentUserIdRef.current
                ?"white":"black"
              },
            ]}
          >
            {item.deleted?"This message was deleted":item.message}
          </Text>
          <Text style={[styles.timestamp,
            isSelf?{color:"#fff"}:{color:'#555'},
          ]}>
            {item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
            : ""}
          </Text>
        </View>
      </TouchableOpacity>
      
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>

        {/* Back Arrow */}
        
          <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`absolute top-4 left-2 z-10 bg-white rounded-full p-2 shadow `}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) =>
            item._id
              ? item._id
              : item.localId
              ? `${item.localId}`
              : `${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          style={{marginTop:50}}
        />

        {replyingTo && (
          <View style={styles.replyBanner}>
            <Text>Replying to: {replyingTo.message}</Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Text style={{ color: 'red', fontWeight:'bold',marginRight: 10,  }}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

// Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  messageContainer: {
    maxWidth: '70%',
    padding: 10,
    marginHorizontal:7,
    marginVertical: 5,
    borderRadius: 10,
  },
  selfMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0078fe',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  messageText: { 
    fontSize: 14 
  },
  timestamp: { 
    fontSize: 10, 
    alignSelf:'flex-end',
    marginTop: 5 
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#0078fe',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyBanner: { 
    flexDirection: 'row', 
    padding: 5, 
    backgroundColor: '#ddd', 
    alignItems: 'center', 
    borderRadius:10,
    marginBottom:5,
    justifyContent:'space-between',
    alignItems:'center',
    borderLeftWidth:4,
    borderLeftColor: '#007AFF', 
    marginHorizontal: 10, 
    
  },
  replyContainer: { 
    padding: 5, 
    backgroundColor: '#ccc', 
    borderLeftWidth: 3, 
    borderLeftColor: '#007AFF', 
    marginBottom: 3 
  },
  replyText: { 
    fontSize: 12, 
    fontStyle: 'italic' 
  },
  deletedText: {
  fontStyle: "italic",
  fontSize: 16,
  },

});
