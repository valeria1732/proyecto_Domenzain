import api from './client';

/**
 * Servicio de autenticación.
 * Consume los endpoints /auth/login y /auth/register del backend.
 */

export function login(email, password) {
  return api.post('/auth/login', { email, password });
}

export function register(name, email, password) {
  return api.post('/auth/register', { name, email, password });
}
