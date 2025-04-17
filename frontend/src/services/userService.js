import apiService from './apiService';
import { getEndpoint } from '../config/apiConfig';

export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile...');
    const response = await apiService.get(getEndpoint('user', 'profile'));
    console.log('User profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserBalance = async () => {
  try {
    console.log('Fetching user balance...');
    const response = await apiService.get(getEndpoint('user', 'balance'));
    console.log('User balance response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user balance:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    console.log('Updating user profile with data:', data);
    const response = await apiService.patch(getEndpoint('user', 'profile'), data);
    console.log('Update profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    console.log('Updating user password...');
    const response = await apiService.patch(getEndpoint('user', 'updatePassword'), {
      current_password: currentPassword,
      new_password: newPassword
    });
    console.log('Update password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteUserAccount = async () => {
  try {
    console.log('Deleting user account...');
    const response = await apiService.delete(getEndpoint('user', 'delete'));
    console.log('Delete account response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error.response?.data || error.message);
    throw error;
  }
}; 