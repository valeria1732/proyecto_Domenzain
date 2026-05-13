import api from './client';

/**
 * Servicio de autenticación.
 * Consume los endpoints del módulo /auth del backend NestJS.
 *
 * NOTA DE SEGURIDAD:
 * - El token JWT se maneja exclusivamente en el AuthContext, no aquí.
 * - Este servicio solo hace las llamadas HTTP, sin lógica de estado.
 */

/**
 * Inicia sesión con username y contraseña.
 * @param {string} username - Nombre de usuario (NO correo electrónico)
 * @param {string} password - Contraseña del usuario
 * @returns Promesa con { access_token, user: { id, username, role, name, lastName } }
 */
export function login(username, password) {
  return api.post('/auth/login', { username, password });
}

/**
 * Registra el evento de logout en el servidor (para auditoría).
 * El token se elimina en el AuthContext, no aquí.
 */
export function logout() {
  return api.post('/auth/logout');
}

/**
 * Obtiene los datos del usuario autenticado desde el JWT.
 * Útil para validar que la sesión sigue activa al recargar la página.
 */
export function getMe() {
  return api.get('/auth/me');
}
