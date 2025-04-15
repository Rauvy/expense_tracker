// API Configuration
const API_CONFIG = {
  // Base URLs for different environments
  baseURL: {
    development: 'http://localhost:3000',
    staging: 'https://staging-api.yourdomain.com',
    production: 'https://api.yourdomain.com'
  },
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
      logout: '/auth/logout',
      refreshToken: '/auth/refresh-token'
    },
    user: {
      profile: '/user/profile',
      settings: '/user/settings'
    },
    transactions: {
      list: '/transactions',
      create: '/transactions',
      update: '/transactions/:id',
      delete: '/transactions/:id'
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
export const getEndpoint = (section, endpoint, params = {}) => {
  let url = API_CONFIG.endpoints[section][endpoint];
  
  // Replace URL parameters if any
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Get API settings
export const getApiSettings = () => {
  return API_CONFIG.settings;
};

export default API_CONFIG; 