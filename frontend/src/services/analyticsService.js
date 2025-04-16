import api from './apiService';
import { getEndpoint } from '../config/apiConfig';

// Получение общей статистики по транзакциям
export const getSummary = async (transactionType = null) => {
  try {
    const response = await api.get(
      getEndpoint('analytics', 'summary'),
      {
        params: {
          transaction_type: transactionType === 'expense' ? 'expense' : 
                          transactionType === 'income' ? 'income' : null,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching summary:', error);
    throw error;
  }
};

// Получение данных для круговой диаграммы
export const getPieChartData = async (transactionType = null) => {
  try {
    const response = await api.get(
      getEndpoint('analytics', 'pie'),
      {
        params: {
          transaction_type: transactionType === 'expense' ? 'expense' : 
                          transactionType === 'income' ? 'income' : null,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    throw error;
  }
};

// Получение данных для линейного графика
export const getLineChartData = async (timeframe = 'month', transactionType = null) => {
  try {
    // Validate timeframe
    const validTimeframe = ['day', 'week', 'month', 'year'].includes(timeframe) ? timeframe : 'month';
    
    const response = await api.get(
      getEndpoint('analytics', 'line'),
      {
        params: {
          timeframe: validTimeframe,
          transaction_type: transactionType === 'expense' ? 'expense' : 
                          transactionType === 'income' ? 'income' : null,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching line chart data:', error);
    throw error;
  }
};

// Получение сравнения между месяцами
export const getMonthComparison = async (transactionType = null) => {
  try {
    const response = await api.get(
      getEndpoint('analytics', 'compare'),
      {
        params: {
          transaction_type: transactionType === 'expense' ? 'expense' : 
                          transactionType === 'income' ? 'income' : null,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching month comparison:', error);
    throw error;
  }
};

// Получение анализа бюджета
export const getBudgetAnalysis = async () => {
  try {
    const response = await api.get(
      getEndpoint('analytics', 'budgetAnalysis')
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching budget analysis:', error);
    throw error;
  }
};

// Получение сравнения типов (доходы/расходы)
export const getTypeComparison = async (timeframe = 'month') => {
  try {
    // Validate timeframe
    const validTimeframe = ['week', 'month', 'year'].includes(timeframe) ? timeframe : 'month';
    
    const response = await api.get(
      getEndpoint('analytics', 'compareTypes'),
      {
        params: {
          timeframe: validTimeframe,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching type comparison:', error);
    throw error;
  }
};
