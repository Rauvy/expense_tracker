import api from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEndpoint } from '../config/apiConfig';

export const login = async (credentials) => {
  try {
    const response = await api.post(getEndpoint('auth', 'login'), credentials);
    const { token, user } = response.data;
    
    // Store token and user data
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post(getEndpoint('auth', 'signup'), userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post(getEndpoint('auth', 'logout'));
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    throw error;
  }
}; 