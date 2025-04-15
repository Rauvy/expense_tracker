import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL, getApiSettings } from '../config/apiConfig';

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: getApiSettings().timeout,
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem('authToken');
      // You might want to add navigation here
    }
    return Promise.reject(error);
  }
);

export default api; 