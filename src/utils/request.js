import axios from 'axios';
import router from '@/router';
import { handleApiError, logError } from './errorHandler';

// Create axios instance
const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
request.interceptors.request.use(
  config => {
    // Add authentication token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    logError(error, { type: 'request' });
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  response => {
    const res = response.data;
    
    // If response is successful, return data
    if (res.success) {
      return res;
    }
    
    // Handle business errors
    const error = new Error(res.error?.message || '操作失败');
    error.response = response;
    return Promise.reject(error);
  },
  error => {
    logError(error, { type: 'response' });
    
    // Handle error with unified error handler
    const errorType = handleApiError(error);
    
    // Redirect to login on authentication error
    if (errorType === 'AUTHENTICATION_ERROR') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
    
    return Promise.reject(error);
  }
);

export default request;
