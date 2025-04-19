import api from './apiService';
import { getEndpoint } from '../config/apiConfig';

export const getCategories = async () => {
  try {
    const response = await api.get(getEndpoint('categories', 'list'));
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post(getEndpoint('categories', 'create'), categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await api.put(getEndpoint('categories', 'update', { id: categoryId }), categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(getEndpoint('categories', 'delete', { id: categoryId }));
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}; 