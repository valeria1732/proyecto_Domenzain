import api from './client';

export function getAllTasks() {
  return api.get('/tasks/all');
}

export function getMyTasks() {
  return api.get('/tasks');
}

export function createTask(data) {
  return api.post('/tasks', data);
}

export function updateTask(id, data) {
  return api.patch(`/tasks/${id}`, data);
}

export function deleteTask(id) {
  return api.delete(`/tasks/${id}`);
}
