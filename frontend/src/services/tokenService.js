import AsyncStorage from '@react-native-async-storage/async-storage';
import baseApi from './baseApi';

export const getAccessToken = async () => {
  return await AsyncStorage.getItem('access_token');
};

export const getRefreshToken = async () => {
  return await AsyncStorage.getItem('refresh_token');
};

export const clearTokens = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
  await AsyncStorage.removeItem('user');
};

export const refreshToken = async () => {
  const refresh_token = await getRefreshToken();
  if (!refresh_token) throw new Error('No refresh token found');

  const response = await baseApi.post('/auth/refresh', { refresh_token });
  const { access_token } = response.data;

  if (access_token) {
    await AsyncStorage.setItem('access_token', access_token);
  }

  return { access_token };
};
