import api from './client';

/**
 * Servicio de auditoría.
 * Solo accesible por usuarios con rol ADMIN.
 * Los registros son de solo lectura — el backend no expone
 * endpoints de modificación o eliminación de logs.
 */

/**
 * Obtiene todos los registros de auditoría.
 * El backend retorna los últimos 500 eventos ordenados por fecha descendente.
 */
export function getAuditLogs() {
  return api.get('/audit');
}

/**
 * Obtiene los registros de auditoría filtrados por usuario.
 * @param {number} userId - ID del usuario a filtrar
 */
export function getAuditLogsByUser(userId) {
  return api.get(`/audit/user/${userId}`);
}
