import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../api/audit.service';
import { getAllUsers } from '../../api/users.service';
import { Loader2, Search, FilterX, AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    severity: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Cargar usuarios para el selector y ejecutar búsqueda inicial
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        getAllUsers(),
        getAuditLogs()
      ]);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error cargando inicial. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // Limpiar filtros vacíos
      const activeFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) activeFilters[key] = filters[key];
      });

      const res = await getAuditLogs(activeFilters);
      setLogs(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error aplicando filtros.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      severity: '',
      startDate: '',
      endDate: ''
    });
    // Se dispara efecto o fetch manual:
    setTimeout(applyFilters, 0); // Ejecuta en la próxima cola sin el evento preventDefault
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-danger)]/20 text-red-400 border border-[var(--color-danger)]/50"><ShieldAlert className="w-3 h-3"/> {severity}</span>;
      case 'WARNING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-warning)]/20 text-[#fbbf24] border border-[var(--color-warning)]/50"><AlertTriangle className="w-3 h-3"/> {severity}</span>;
      case 'ERROR':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-danger)]/10 text-red-500 border border-[var(--color-danger)]/30"><AlertCircle className="w-3 h-3"/> {severity}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20"><Info className="w-3 h-3"/> {severity}</span>;
    }
  };

  const getUserName = (userId) => {
    if (!userId) return 'Sistema / Anónimo';
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Logs de <span className="gradient-text">Auditoría</span>
        </h1>
        <div className="px-4 py-2 bg-[var(--color-dark-800)] rounded-full border border-[var(--color-dark-600)] text-sm text-[var(--color-light-300)]">
          Mostrando: <span className="font-bold text-white">{logs.length}</span> registros
        </div>
      </div>

      {/* Panel de Filtros */}
      <form onSubmit={applyFilters} className="glass p-6 rounded-2xl border border-[var(--color-dark-700)] shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <FilterX className="w-5 h-5 text-[var(--color-primary-light)]" />
          Filtros de Búsqueda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-light-400)] mb-1">Usuario</label>
            <select 
              value={filters.userId} onChange={(e) => setFilters({...filters, userId: e.target.value})}
              className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Todos los usuarios</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-light-400)] mb-1">Acción</label>
            <select 
              value={filters.action} onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Todas las acciones</option>
              <option value="USER_REGISTERED">Registro (USER_REGISTERED)</option>
              <option value="LOGIN_SUCCESS">Login (LOGIN_SUCCESS)</option>
              <option value="LOGIN_FAILED">Falla Login (LOGIN_FAILED)</option>
              <option value="USER_DELETED">Usuario Eliminado (USER_DELETED)</option>
              <option value="ROLE_CHANGED">Cambio de Rol (ROLE_CHANGED)</option>
              <option value="TASK_DELETED">Tarea Eliminada (TASK_DELETED)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-light-400)] mb-1">Severidad</label>
            <select 
              value={filters.severity} onChange={(e) => setFilters({...filters, severity: e.target.value})}
              className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Cualquiera</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div>
             <label className="block text-xs font-medium text-[var(--color-light-400)] mb-1">Desde</label>
             <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-lg px-3 py-2 text-sm text-[var(--color-light-300)] css-date-icon" />
          </div>
          <div>
             <label className="block text-xs font-medium text-[var(--color-light-400)] mb-1">Hasta</label>
             <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-lg px-3 py-2 text-sm text-[var(--color-light-300)] css-date-icon" />
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-2">
          <Button type="button" variant="outline" className="border border-[var(--color-dark-600)] text-sm py-1.5 px-4" onClick={clearFilters}>
             Limpiar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="text-sm py-1.5 px-6 flex items-center gap-2">
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
             Aplicar Filtros
          </Button>
        </div>
      </form>

      {/* Resultados de Auditoría */}
      <div className="glass rounded-2xl overflow-hidden border border-[var(--color-dark-700)] shadow-2xl relative">
        {loading && (
          <div className="absolute inset-0 bg-[var(--color-dark-900)]/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
          </div>
        )}
        
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--color-dark-800)]/80 text-[var(--color-light-400)] text-sm tracking-wider border-b border-[var(--color-dark-700)]">
                <th className="p-4 font-semibold w-40">Fecha</th>
                <th className="p-4 font-semibold">Usuario</th>
                <th className="p-4 font-semibold">Acción</th>
                <th className="p-4 font-semibold">Gravedad</th>
                <th className="p-4 font-semibold w-32">IP</th>
                <th className="p-4 font-semibold w-full max-w-[400px]">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-dark-700)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--color-dark-800)]/40 transition-colors">
                  <td className="p-4 text-sm text-[var(--color-light-300)]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-[var(--color-light-100)] font-medium">
                    {getUserName(log.userId)}
                  </td>
                  <td className="p-4 text-sm text-[var(--color-light-300)] font-mono text-xs">
                    {log.action}
                  </td>
                  <td className="p-4">
                    {getSeverityBadge(log.severity)}
                  </td>
                  <td className="p-4 text-sm text-[var(--color-light-400)] font-mono text-xs">
                    {log.ipAddress || 'N/A'}
                  </td>
                  <td className="p-4 text-sm text-[var(--color-light-400)] flex-wrap truncate max-w-[400px]">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                   <td colSpan="6" className="p-8 text-center text-[var(--color-light-400)]">
                      No se encontraron registros de auditoría que coincidan con los filtros.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
