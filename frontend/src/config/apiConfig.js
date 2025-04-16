// API Configuration
const API_CONFIG = {
  // Base URLs for different environments
  baseURL: {
    development: 'http://127.0.0.1:8000',
    staging: 'https://staging-api.yourdomain.com',
    production: 'https://api.yourdomain.com'
  },
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/auth/login', 
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      google: '/auth/google', // TO-DO
    },
    user: {
      profile: '/account/me',
      updatePassword: '/account/update-password',
      delete: '/account/delete',
      balance: '/account/balance'
    },
    transactions: {
      create: '/transactions/',
      getAll: '/transactions/all',
      getById: '/transactions/:id',
      update: '/transactions/:id',
      delete: '/transactions/:id',
      
    },
    analytics: {
      summary: '/transactions/summary',
      pie: '/transactions/pie',
      line: '/transactions/line',
      compare: '/transactions/compare',
      budgetAnalysis: '/transactions/budget-analysis',
      compareTypes: '/transactions/compare-types'
    },
    categories: {
      list: '/categories',
      create: '/categories',
      update: '/categories/:id',
      delete: '/categories/:id'
    },
    accounts: {
      list: '/accounts',
      create: '/accounts',
      update: '/accounts/:id',
      delete: '/accounts/:id'
    }
  },
  
  // API settings
  settings: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  }
};

// Get current environment (you can set this based on your build process)
const getCurrentEnvironment = () => {
  // You can set this based on your environment variables or build process
  return process.env.NODE_ENV || 'development';
};

// Get base URL for current environment
export const getBaseURL = () => {
  return API_CONFIG.baseURL[getCurrentEnvironment()];
};

// Get full URL for an endpoint
export const getEndpoint = (section, endpoint) => {
  const group = API_CONFIG.endpoints[section];
  if (!group || !group[endpoint]) {
    console.warn(`⚠️ Endpoint not found: ${section}.${endpoint}`);
    return '/';
  }
  
  return getBaseURL() + group[endpoint];
};

// Get API settings
export const getApiSettings = () => {
  return API_CONFIG.settings;
};

export default API_CONFIG; 