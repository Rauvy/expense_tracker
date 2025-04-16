import api from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEndpoint } from '../config/apiConfig';

export const login = async (credentials) => {
  try {
    const response = await api.post(getEndpoint('auth', 'login'), credentials);
    const { access_token, refresh_token, token_type } = response.data;
    // Store tokens
    await AsyncStorage.setItem('access_token', access_token);
    await AsyncStorage.setItem('refresh_token', refresh_token);
    await AsyncStorage.setItem('token_type', token_type);
    return { access_token, refresh_token, token_type };
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post(getEndpoint('auth', 'register'), userData);
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