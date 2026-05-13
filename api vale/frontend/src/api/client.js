import axios from 'axios';

/**
 * Cliente HTTP centralizado con Axios.
 * - La baseURL apunta a /api/v1 que Vite redirige al backend en puerto 3000.
 * - El interceptor de request agrega el JWT en cada llamada autenticada.
 * - El interceptor de response maneja errores 401 (sesión expirada).
 * - Las credenciales sensibles (token) se guardan en localStorage bajo claves
 *   específicas del proyecto para evitar colisiones con otros proyectos.
 */

// Prefijo base del backend — se complementa con el proxy de vite.config.js
const API_BASE_URL = '/api/v1';

// Claves de almacenamiento — nunca hardcodear tokens directamente en el código
export const STORAGE_KEYS = {
  TOKEN: 'apivale_token',
  USER:  'apivale_user',
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Tiempo máximo de espera: 10 segundos
  timeout: 10000,
});

// ── Interceptor de REQUEST ───────────────────────────────────────────────────
// Adjunta el JWT Bearer token en cada petición si el usuario está autenticado
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor de RESPONSE ──────────────────────────────────────────────────
// Si el servidor devuelve 401 (token expirado o inválido), limpia la sesión
// y redirige al login automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar sesión local sin exponer detalles del error al usuario
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
