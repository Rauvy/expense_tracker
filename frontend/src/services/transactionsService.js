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

export const getPieChartData = async (transactionType = 'expense') => {
  try {
    if (transactionType && !['expense', 'income'].includes(transactionType)) {
      throw new Error('Invalid transaction type. Must be either "expense" or "income"');
    }

    const response = await api.get(getEndpoint('analytics', 'pie'), {
      params: {
        transaction_type: transactionType
      }
    });

    if (!response.data) {
      console.warn('Empty response received from pie chart endpoint');
      return { data: [] };
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`No pie chart data found for transaction type "${transactionType}" (404)`);
      return { data: [] }; // безопасный возврат
    }

    console.error('Error in getPieChartData:', error);
    throw error;
  }
};

export const getSmartTip = async () => {
  try {
    const response = await api.get(getEndpoint('ai', 'tips'));

    if (!response.data || !Array.isArray(response.data.tips) || response.data.tips.length === 0) {
      console.warn('Empty response received from smart tips endpoint');
      return {
        tips: [],
        message: '',
      };
    }

    const processedTips = response.data.tips.map((tip) => {
      const colonIndex = tip.indexOf(':');
      return colonIndex !== -1 ? tip.substring(colonIndex + 1).trim() : tip;
    });

    return {
      ...response.data,
      tips: processedTips,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('Smart tips not found (404)');
      return {
        tips: [],
        message: '',
      };
    }

    console.error('Error fetching smart tip:', error);
    return {
      tips: [],
      message: '',
    };
  }
};
