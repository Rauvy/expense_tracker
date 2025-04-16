import api from './apiService';
import { getEndpoint } from '../config/apiConfig';

export const getTransactions = async ({
  transaction_type = null,
  limit = 20,
  offset = 0
} = {}) => {
  try {
    const response = await api.get(getEndpoint('transactions', 'getAll'), {
      params: {
        transaction_type,
        limit,
        offset
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTransactionById = async (id) => {
  try {
    const response = await api.get(getEndpoint('transactions', 'getById', { id }));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post(getEndpoint('transactions', 'create'), transactionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(getEndpoint('transactions', 'update', { id }), transactionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(getEndpoint('transactions', 'delete', { id }));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPieChartData = async (transactionType = null) => {
  try {
    const pieEndpoint = getEndpoint('transactions', 'pie');
    console.log("Calling api.get with URL:", pieEndpoint);
    const response = await api.get(pieEndpoint, {
      params: {
        transaction_type: transactionType
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


