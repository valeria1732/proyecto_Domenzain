import api from './client';

export function getAllUsers() {
  return api.get('/users');
}

export function createUser(userData) {
  return api.post('/users', userData);
}

export function getUserById(id) {
  return api.get(`/users/${id}`);
}

export function updateUser(id, data) {
  return api.patch(`/users/${id}`, data);
}

export function updateUserRole(id, role) {
  return api.patch(`/users/${id}/role`, { role });
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`);
}
