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

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { rideId, otherUserId } = route.params;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const socketRef = useRef(null);
  const flatListRef = useRef();
  const currentUserIdRef = useRef(null);

  // Helper: Always extract string ID from sender object or string
  const getSenderId = (sender) => {
    if (!sender) return null;
    if (typeof sender === 'string') return sender;
    if (sender._id) return sender._id.toString();
    return null;
  };

  // Helper: Normalize message
  const normalizeMessage = (msg, allMessages = []) => ({
    ...msg,
    sender_id: getSenderId(msg.sender_id || msg.sender),
    replyTo: msg.reply_to || null,
    replyToContent:
      msg.replyToContent ||
      msg.reply_to?.message ||
      allMessages.find((m) => m._id === (msg.reply_to || msg.replyTo?._id))?.message ||
      null,
    createdAt: msg.createdAt || new Date().toISOString(),
  });

  // Setup conversation and fetch old messages
  useEffect(() => {
    const setupConversation = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const decodedToken = parseJwt(token);
        currentUserIdRef.current = decodedToken.user_id.toString();

        // 1. Create or fetch conversation
        const res = await api.post(
          `/chats/private`,
          { rideId, recipientId: otherUserId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const convId = res.data.conversationId;
        setConversationId(convId);

        // 2. Fetch messages for this conversation
        const messagesRes = await api.get(
          `/chats/conversation/${convId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const normalized = messagesRes.data.map((m) => normalizeMessage(m, messagesRes.data));
        setMessages(normalized);

        // 3. Setup socket connection
        const socket = io('http://127.0.0.1:3000', {
          auth: { token },
          transports: ['websocket'],
        });

        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);
          socket.emit('joinConversation', { rideId, otherUserId });
        });

        // socket.on('receiveMessage', (msg) => {
        //   const normalizedMsg = normalizeMessage(msg);

        //   setMessages((prev) => {
        //     const index = prev.findIndex(
        //       (m) =>
        //         (m._id && normalizedMsg._id && m._id === normalizedMsg._id) ||
        //         (m.localId && normalizedMsg.localId && m.localId === normalizedMsg.localId)
        //     );

        //     if (index !== -1) {
        //       const updated = [...prev];
        //       updated[index] = { 
        //         ...updated[index], 
        //         ...normalizedMsg,
        //         replyToContent: updated[index].replyToContent || normalizedMsg.replyToContent
        //        };
        //       return updated;
        //     }

        //     const updated = [...prev, normalizedMsg];
        //     updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        //     return updated;
        //   });
        // });
        socket.on('receiveMessage', (msg) => {
          const normalizedMsg = normalizeMessage(msg);

          setMessages((prev) => {
            const updated = [...prev];

            // 1️⃣ Try to match by _id or localId first
            let index = updated.findIndex(
              (m) =>
                (m._id && normalizedMsg._id && m._id === normalizedMsg._id) ||
                (m.localId && normalizedMsg.localId && m.localId === normalizedMsg.localId)
            );

            // 2️⃣ If no match, try to match local pending message by sender + text + replyTo
            if (index === -1) {
              index = updated.findIndex(
                (m) =>
                  !m._id && // pending local message
                  m.sender_id === normalizedMsg.sender_id &&
                  m.message === normalizedMsg.message &&
                  m.replyTo === normalizedMsg.replyTo
              );
            }

            if (index !== -1) {
              // Merge the server message into local one, preserving replyToContent
              updated[index] = {
                ...updated[index],
                ...normalizedMsg,
                replyToContent: updated[index].replyToContent || normalizedMsg.replyToContent,
                pending: false, // mark as confirmed by server
              };
            } else {
              // New message, check if it replies to a local-only message
              if (normalizedMsg.replyTo) {
                const localParent = updated.find(
                  (m) => m.localId && m.localId === normalizedMsg.replyTo
                );
                if (localParent && !normalizedMsg.replyToContent) {
                  normalizedMsg.replyToContent = localParent.message;
                }
              }
              updated.push(normalizedMsg);
            }

            // Sort messages by timestamp
            updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            return updated;
          });
        });


        socket.on('chatError', (err) => console.log('Socket error:', err));
        socketRef.current = socket;

      } catch (err) {
        console.error('Error setting up conversation:', err);
        Alert.alert('Error', 'Unable to initialize chat');
      }
    };

    setupConversation();

    return () => {
      if (socketRef.current && conversationId) {
        socketRef.current.emit('leaveRoom', conversationId);
        socketRef.current.disconnect();
      }
    };
  }, [rideId, otherUserId]);

  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current || !conversationId) return;

    const localId = Date.now().toString();
    const localMsg = {
      localId,
      sender_id: currentUserIdRef.current,
      message: inputMessage,
      createdAt: new Date().toISOString(),
      pending: true,
      replyTo: replyingTo?._id || replyingTo?.localId || null,
      replyToContent: replyingTo?.message || null,
    };

    setMessages((prev) => [...prev, normalizeMessage(localMsg,prev)]);

    socketRef.current.emit('sendMessage', {
      conversationId,
      message: inputMessage,
      localId,
      replyTo: localMsg.replyTo,
      otherUserId,
    });

    setInputMessage('');
    setReplyingTo(null);
  };

  // Delete message
  const deleteMessage = async (msg) => {
    if (!msg._id && !msg.localId) return;
    if (msg.sender_id !== currentUserIdRef.current) return;

    const token = await AsyncStorage.getItem('userToken');
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setMessages((prev) =>
              prev.map((m) =>
                (m._id && m._id === msg._id) || (m.localId && m.localId === msg.localId)
                  ? { ...m, message: 'This message was deleted', deleted: true }
                  : m
              )
            );

            if (msg._id) {
              await api.delete(`/chats/message/${msg._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            }
          } catch (err) {
            console.error('Error deleting message:', err);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isSelf = item.sender_id === currentUserIdRef.current;
    const replyText = item.replyToContent || '[This message was deleted]';

    return (
      <TouchableOpacity
        onLongPress={() => deleteMessage(item)}
        onPress={() => !isSelf && setReplyingTo(item)}
      >
        <View style={[styles.messageContainer, isSelf ? styles.selfMessage : styles.otherMessage]}>
          {(item.replyTo || item.replyToContent) && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyText}>Replying to: {replyText}</Text>
            </View>
          )}
          <Text style={[item.deleted ? styles.deletedText : styles.messageText, { color: isSelf ? 'white' : 'black' }]}>
            {item.deleted ? 'This message was deleted' : item.message}
          </Text>
          <Text style={[styles.timestamp, { color: isSelf ? '#fff' : '#555' }]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`absolute top-4 left-2 z-10 bg-white rounded-full p-2 shadow`}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => (item._id ? item._id : item.localId ? `${item.localId}` : `${index}`)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          style={{ marginTop: 50 }}
        />

        {replyingTo && (
          <View style={styles.replyBanner}>
            <Text>Replying to: {replyingTo.message}</Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Text style={{ color: 'red', fontWeight: 'bold', marginRight: 10 }}>X</Text>
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
          <TouchableOpacity style={[styles.sendButton,!inputMessage.trim() && { backgroundColor: '#aaa' },]} onPress={sendMessage} disabled={!inputMessage.trim()}>
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

// ChatScreen.js
// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Alert
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { io } from 'socket.io-client';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/Feather';
// import { parseJwt } from '../utils/jwt';
// import api from '../src/api/axios'; 
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import tw from 'twrnc';

// const ChatScreen = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { rideId, otherUserId } = route.params;

//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [conversationId, setConversationId] = useState(null);

//   const socketRef = useRef(null);
//   const flatListRef = useRef();
//   const currentUserIdRef = useRef(null);

//   // Helper: Always extract string ID from sender object or string
//   const getSenderId = (sender) => {
//     if (!sender) return null;
//     if (typeof sender === 'string') return sender;
//     if (sender._id) return sender._id.toString();
//     return null;
//   };

//   // Helper: Normalize message
//   const normalizeMessage = (msg, currentMessages = []) => {
//     const sender_id = getSenderId(msg.sender_id || msg.sender);

//     let replyToContent = msg.replyToContent || msg.reply_to?.message || null;

//     // If replyToContent is missing, try to find parent message in current messages
//     if (!replyToContent && msg.reply_to) {
//       const parent = currentMessages.find(
//         (m) =>
//           (m._id && m._id === msg.reply_to) ||
//           (m.localId && m.localId === msg.reply_to)
//       );
//       replyToContent = parent?.message || null;
//     }

//     return {
//       ...msg,
//       sender_id,
//       replyTo: msg.reply_to || null,
//       replyToContent,
//       createdAt: msg.createdAt || new Date().toISOString(),
//     };
//   };

//   // Setup conversation and fetch old messages
//   useEffect(() => {
//     const setupConversation = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         if (!token) return;

//         const decodedToken = parseJwt(token);
//         currentUserIdRef.current = decodedToken.user_id.toString();

//         // 1. Create or fetch conversation
//         const res = await api.post(
//           `/chats/private`,
//           { rideId, recipientId: otherUserId },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const convId = res.data.conversationId;
//         setConversationId(convId);

//         // 2. Fetch messages for this conversation
//         const messagesRes = await api.get(
//           `/chats/conversation/${convId}/messages`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const normalized = messagesRes.data.map((m) => normalizeMessage(m, messagesRes.data));
//         setMessages(normalized);

//         // 3. Setup socket connection
//         const socket = io('http://127.0.0.1:3000', {
//           auth: { token },
//           transports: ['websocket'],
//         });

//         socket.on('connect', () => {
//           console.log('Socket connected:', socket.id);
//           socket.emit('joinConversation', { rideId, otherUserId });
//         });

//         // Receive message handler
//         socket.on('receiveMessage', (msg) => {
//           setMessages((prev) => {
//             const updated = [...prev];

//             // Normalize message using current messages
//             const normalizedMsg = normalizeMessage(msg, updated);

//             // 1️⃣ Try to match by _id or localId first
//             let index = updated.findIndex(
//               (m) =>
//                 (m._id && normalizedMsg._id && m._id === normalizedMsg._id) ||
//                 (m.localId && normalizedMsg.localId && m.localId === normalizedMsg.localId)
//             );

//             // 2️⃣ If no match, try to match pending local message by sender + message + replyTo
//             if (index === -1) {
//               index = updated.findIndex(
//                 (m) =>
//                   !m._id && // pending local message
//                   m.sender_id === normalizedMsg.sender_id &&
//                   m.message === normalizedMsg.message &&
//                   m.replyTo === normalizedMsg.replyTo
//               );
//             }

//             if (index !== -1) {
//               // Merge server message into local one, preserving replyToContent
//               updated[index] = {
//                 ...updated[index],
//                 ...normalizedMsg,
//                 replyToContent: updated[index].replyToContent || normalizedMsg.replyToContent,
//                 pending: false,
//               };
//             } else {
//               updated.push(normalizedMsg);
//             }

//             // Sort messages by timestamp
//             updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//             return updated;
//           });
//         });

//         socket.on('chatError', (err) => console.log('Socket error:', err));
//         socketRef.current = socket;

//       } catch (err) {
//         console.error('Error setting up conversation:', err);
//         Alert.alert('Error', 'Unable to initialize chat');
//       }
//     };

//     setupConversation();

//     return () => {
//       if (socketRef.current && conversationId) {
//         socketRef.current.emit('leaveRoom', conversationId);
//         socketRef.current.disconnect();
//       }
//     };
//   }, [rideId, otherUserId]);

//   // Send message
//   const sendMessage = () => {
//     if (!inputMessage.trim() || !socketRef.current || !conversationId) return;

//     const localId = Date.now().toString();
//     const localMsg = {
//       localId,
//       sender_id: currentUserIdRef.current,
//       message: inputMessage,
//       createdAt: new Date().toISOString(),
//       pending: true,
//       replyTo: replyingTo?._id || replyingTo?.localId || null,
//       replyToContent: replyingTo?.message || null,
//     };

//     setMessages((prev) => [...prev, normalizeMessage(localMsg, prev)]);

//     socketRef.current.emit('sendMessage', {
//       conversationId,
//       message: inputMessage,
//       localId,
//       replyTo: localMsg.replyTo,
//       otherUserId,
//     });

//     setInputMessage('');
//     setReplyingTo(null);
//   };

//   // Delete message
//   const deleteMessage = async (msg) => {
//     if (!msg._id && !msg.localId) return;
//     if (msg.sender_id !== currentUserIdRef.current) return;

//     const token = await AsyncStorage.getItem('userToken');
//     Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             setMessages((prev) =>
//               prev.map((m) =>
//                 (m._id && m._id === msg._id) || (m.localId && m.localId === msg.localId)
//                   ? { ...m, message: 'This message was deleted', deleted: true }
//                   : m
//               )
//             );

//             if (msg._id) {
//               await api.delete(`/chats/message/${msg._id}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//               });
//             }
//           } catch (err) {
//             console.error('Error deleting message:', err);
//           }
//         },
//       },
//     ]);
//   };

//   const renderItem = ({ item }) => {
//     const isSelf = item.sender_id === currentUserIdRef.current;
//     const replyText = item.replyToContent || '[This message was deleted]';

//     return (
//       <TouchableOpacity
//         onLongPress={() => deleteMessage(item)}
//         onPress={() => !isSelf && setReplyingTo(item)}
//       >
//         <View style={[styles.messageContainer, isSelf ? styles.selfMessage : styles.otherMessage]}>
//           {(item.replyTo || item.replyToContent) && (
//             <View style={styles.replyContainer}>
//               <Text style={styles.replyText}>Replying to: {replyText}</Text>
//             </View>
//           )}
//           <Text style={[item.deleted ? styles.deletedText : styles.messageText, { color: isSelf ? 'white' : 'black' }]}>
//             {item.deleted ? 'This message was deleted' : item.message}
//           </Text>
//           <Text style={[styles.timestamp, { color: isSelf ? '#fff' : '#555' }]}>
//             {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       <View style={styles.container}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={tw`absolute top-4 left-2 z-10 bg-white rounded-full p-2 shadow`}
//         >
//           <Ionicons name="arrow-back" size={24} color="#1e293b" />
//         </TouchableOpacity>

//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={(item, index) => (item._id ? item._id : item.localId ? `${item.localId}` : `${index}`)}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingVertical: 10 }}
//           onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//           onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
//           style={{ marginTop: 50 }}
//         />

//         {replyingTo && (
//           <View style={styles.replyBanner}>
//             <Text>Replying to: {replyingTo.message}</Text>
//             <TouchableOpacity onPress={() => setReplyingTo(null)}>
//               <Text style={{ color: 'red', fontWeight: 'bold', marginRight: 10 }}>X</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <View style={styles.inputRow}>
//           <TextInput
//             style={styles.input}
//             placeholder="Type a message..."
//             value={inputMessage}
//             onChangeText={setInputMessage}
//           />
//           <TouchableOpacity style={[styles.sendButton,!inputMessage.trim() && { backgroundColor: '#aaa' }]} onPress={sendMessage} disabled={!inputMessage.trim()}>
//             <Icon name="send" size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default ChatScreen;

// // Styles
// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#f9f9f9' 
//   },
//   messageContainer: {
//     maxWidth: '70%',
//     padding: 10,
//     marginHorizontal:7,
//     marginVertical: 5,
//     borderRadius: 10,
//   },
//   selfMessage: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#0078fe',
//   },
//   otherMessage: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#e5e5ea',
//   },
//   messageText: { 
//     fontSize: 14 
//   },
//   timestamp: { 
//     fontSize: 10, 
//     alignSelf:'flex-end',
//     marginTop: 5 
//   },
//   inputRow: {
//     flexDirection: 'row',
//     padding: 10,
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//     backgroundColor: '#fff',
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     marginRight: 10,
//   },
//   sendButton: {
//     backgroundColor: '#0078fe',
//     borderRadius: 20,
//     padding: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   replyBanner: { 
//     flexDirection: 'row', 
//     padding: 5, 
//     backgroundColor: '#ddd', 
//     alignItems: 'center', 
//     borderRadius:10,
//     marginBottom:5,
//     justifyContent:'space-between',
//     borderLeftWidth:4,
//     borderLeftColor: '#007AFF', 
//     marginHorizontal: 10, 
//   },
//   replyContainer: { 
//     padding: 5, 
//     backgroundColor: '#ccc', 
//     borderLeftWidth: 3, 
//     borderLeftColor: '#007AFF', 
//     marginBottom: 3 
//   },
//   replyText: { 
//     fontSize: 12, 
//     fontStyle: 'italic' 
//   },
//   deletedText: {
//     fontStyle: "italic",
//     fontSize: 16,
//   },
// });
