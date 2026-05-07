import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: agrega el token JWT a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jabm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: maneja errores de respuesta (401 = redirigir a login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jabm_token');
      localStorage.removeItem('jabm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
