import api from './client';

/**
 * Servicio de tareas.
 * Solo accesible por usuarios con rol USER.
 * El backend aplica anti-IDOR: cada query filtra automáticamente
 * por el userId del token JWT, por lo que es imposible acceder
 * a tareas de otros usuarios desde estos endpoints.
 */

/** Obtiene todas las tareas del usuario autenticado. */
export function getMyTasks() {
  return api.get('/tasks');
}

/** Obtiene una tarea específica del usuario autenticado por su ID. */
export function getMyTaskById(id) {
  return api.get(`/tasks/${id}`);
}

/**
 * Actualiza el estado de completado de una tarea propia.
 * Solo se puede modificar el campo "completed".
 * @param {number} id - ID de la tarea
 * @param {boolean} completed - Nuevo estado
 */
export function updateTaskStatus(id, completed) {
  return api.patch(`/tasks/${id}`, { completed });
}
