/**
 * API Client for LabFlow Backend
 * 
 * This module provides a configured axios instance for making HTTP requests
 * to the LabFlow backend API.
 */

import axios from 'axios';

// Force use of '/api' proxy - never use environment variables to prevent localhost:3000 issues
const API_BASE_URL = '/api';
const API_TIMEOUT = 30000;

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Per project convention read token from `localStorage.getItem("token")`
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      // Extract error message from various backend formats
      const errorMessage = data?.message || data?.error || data?.detail || 
                          (typeof data === 'string' ? data : JSON.stringify(data));

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden: You do not have permission to access this resource');
          break;
        case 404:
          console.error('Resource not found:', errorMessage);
          break;
        case 500:
          console.error('Internal server error:', errorMessage);
          break;
        default:
          console.error(`Error ${status}:`, errorMessage);
      }
      
      // Attach the error message to the error object for easier access
      error.serverMessage = errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      error.serverMessage = 'No se recibió respuesta del servidor';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      error.serverMessage = error.message;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
