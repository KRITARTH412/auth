import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    // Also, don't retry if the failed request was already a refresh attempt
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axiosInstance.post('/auth/refresh');
        
        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login only if not already on login page
        const isLoginPage = window.location.pathname.includes('/login') || window.location.hash.includes('/login');
        if (!isLoginPage) {
          // If we're using HashRouter, we should redirect to #/login
          window.location.href = window.location.hash ? '#/login' : '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service object
const apiService = {
  // Authentication endpoints
  auth: {
    register: (userData) => axiosInstance.post('/auth/register', userData),
    login: (credentials) => axiosInstance.post('/auth/login', credentials),
    logout: () => axiosInstance.post('/auth/logout'),
    refreshToken: () => axiosInstance.post('/auth/refresh'),
  },

  // User endpoints
  user: {
    getProfile: () => axiosInstance.get('/users/profile'),
    updateProfile: (data) => axiosInstance.put('/users/profile', data),
  },

  // Admin endpoints
  admin: {
    getAllUsers: (params) => axiosInstance.get('/admin/users', { params }),
  },

  // Health check
  health: () => axiosInstance.get('/health'),
};

export default apiService;
