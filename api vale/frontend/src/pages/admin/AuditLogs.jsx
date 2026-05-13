import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../api/audit.service';
import { Loader2, Search, FilterX, Activity, Box, User, Hash } from 'lucide-react';
import { Button } from '../../components/ui';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros en memoria (el backend actualmente devuelve los ultimos 500 y filtramos aca para UI fluida)
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    entity: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const logsRes = await getAuditLogs();
      setLogs(logsRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error cargando los logs de auditoría. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLogs = () => {
    return logs.filter(log => {
      if (filters.username && !log.username?.toLowerCase().includes(filters.username.toLowerCase())) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.entity && log.entity !== filters.entity) return false;
      return true;
    });
  };

  const filteredLogs = getFilteredLogs();

  const clearFilters = () => {
    setFilters({
      username: '',
      action: '',
      entity: ''
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Logs de <span className="gradient-text">Auditoría</span>
        </h1>
        <div className="px-4 py-2 bg-[var(--color-dark-800)] rounded-full border border-[var(--color-dark-600)] text-sm text-[var(--color-light-300)]">
          Mostrando: <span className="font-bold text-white">{filteredLogs.length}</span> registros
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="glass p-6 rounded-2xl border border-[var(--color-dark-700)] shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <FilterX className="w-5 h-5 text-[var(--color-primary-light)]" />
          Filtros Locales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-light-400)] mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Usuario</label>
            <input 
              type="text"
              placeholder="Buscar por username..."
              value={filters.username} onChange={(e) => setFilters({...filters, username: e.target.value})}
              className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-light-400)] mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Acción</label>
            <select 
              value={filters.action} onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Todas las acciones</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="USER_UPDATED">USER_UPDATED</option>
              <option value="USER_DELETED">USER_DELETED</option>
              <option value="ROLE_CHANGED">ROLE_CHANGED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-light-400)] mb-1 flex items-center gap-1"><Box className="w-3 h-3"/> Entidad</label>
            <select 
              value={filters.entity} onChange={(e) => setFilters({...filters, entity: e.target.value})}
              className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Todas</option>
              <option value="Auth">Auth</option>
              <option value="User">User</option>
              <option value="Task">Task</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-2">
          <Button type="button" variant="outline" className="border border-[var(--color-dark-600)] text-sm py-1.5 px-4" onClick={clearFilters}>
             Limpiar
          </Button>
        </div>
      </div>

      {/* Resultados de Auditoría */}
      <div className="glass rounded-2xl overflow-hidden border border-[var(--color-dark-700)] shadow-2xl relative">
        {loading && (
          <div className="absolute inset-0 bg-[var(--color-dark-900)]/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
          </div>
        )}
        
        {error ? (
          <div className="p-8 text-center text-[var(--color-danger)] font-medium">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[var(--color-dark-800)]/80 text-[var(--color-light-400)] text-sm tracking-wider border-b border-[var(--color-dark-700)]">
                  <th className="p-4 font-semibold w-40">Fecha</th>
                  <th className="p-4 font-semibold">Usuario</th>
                  <th className="p-4 font-semibold">Acción</th>
                  <th className="p-4 font-semibold">Entidad</th>
                  <th className="p-4 font-semibold w-32">ID Entidad</th>
                  <th className="p-4 font-semibold w-full max-w-[300px]">Detalles</th>
                  <th className="p-4 font-semibold w-32">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-dark-700)]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--color-dark-800)]/40 transition-colors">
                    <td className="p-4 text-sm text-[var(--color-light-300)]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-light-100)] font-medium">
                      {log.username || 'Sistema'}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="inline-block px-2 py-1 rounded bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] text-[var(--color-primary-light)] font-mono text-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--color-light-300)]">
                      {log.entity}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-light-400)] font-mono">
                      {log.entityId ? `#${log.entityId}` : '-'}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-light-400)] flex-wrap truncate max-w-[300px]" title={log.details}>
                      {log.details || '-'}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-light-400)] font-mono text-xs">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
                {!loading && filteredLogs.length === 0 && (
                  <tr>
                     <td colSpan="7" className="p-8 text-center text-[var(--color-light-400)]">
                        No se encontraron registros de auditoría que coincidan con los filtros.
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
