import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://192.168.1.36:3000/api', // Replace with your backend IP and port
  baseURL:'http://10.0.2.2:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
