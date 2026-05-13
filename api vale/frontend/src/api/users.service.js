import api from './client';

/**
 * Servicio de gestión de usuarios.
 * Solo accesible por usuarios con rol ADMIN.
 * El backend valida el rol en cada endpoint mediante RolesGuard.
 */

/** Obtiene la lista completa de usuarios (sin contraseñas). */
export function getUsers() {
  return api.get('/users');
}

/** Obtiene un usuario por su ID. */
export function getUserById(id) {
  return api.get(`/users/${id}`);
}

/**
 * Crea un nuevo usuario.
 * @param {{ name, lastName, username, password, role }} dto
 */
export function createUser(dto) {
  return api.post('/users', dto);
}

/**
 * Actualiza los datos de un usuario.
 * El username es inmutable (el backend lo ignora si se envía).
 * @param {number} id
 * @param {{ name?, lastName?, password?, role? }} dto
 */
export function updateUser(id, dto) {
  return api.put(`/users/${id}`, dto);
}

/**
 * Actualiza especificamente el rol del usuario
 * @param {number} id
 * @param {string} role
 */
export function updateUserRole(id, role) {
  return api.put(`/users/${id}`, { role });
}

/**
 * Elimina un usuario. Falla si tiene tareas asociadas (409 Conflict).
 * @param {number} id
 */
export function deleteUser(id) {
  return api.delete(`/users/${id}`);
}
