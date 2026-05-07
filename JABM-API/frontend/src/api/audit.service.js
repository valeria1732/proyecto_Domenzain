import api from './client';

export function getAuditLogs(filters = {}) {
  // Construir string de query params
  const params = new URLSearchParams();
  
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.severity) params.append('severity', filters.severity);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const url = queryString ? `/audit?${queryString}` : '/audit';

  return api.get(url);
}
