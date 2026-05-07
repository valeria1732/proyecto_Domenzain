import React, { useState, useEffect } from 'react';
import { getMyTasks } from '../../api/tasks.service';
import { Loader2, Target, CheckSquare, Clock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context';

export const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getMyTasks();
      setTasks(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar tus tareas.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DONE':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"><CheckSquare className="w-4 h-4"/> Completada</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]"><Target className="w-4 h-4"/> En Progreso</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-[var(--color-warning)]/10 text-[#fbbf24] border border-[var(--color-warning)]/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"><Clock className="w-4 h-4"/> Pendiente</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--color-dark-900)]">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-dark-900)] p-6 lg:p-12 animate-fade-in relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--color-secondary)]/10 to-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="glass p-8 rounded-3xl border border-[var(--color-dark-700)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full rounded-[14px] bg-[var(--color-dark-800)] flex items-center justify-center">
                 <LayoutDashboard className="w-8 h-8 text-[var(--color-primary-light)]" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Mis Tareas</h1>
              <p className="text-[var(--color-light-400)] mt-1">
                Bienvenido, <span className="text-[var(--color-primary-light)] font-medium">{user?.name || 'Usuario'}</span>. Estas son tus responsabilidades asignadas.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <div className="px-5 py-3 rounded-2xl bg-[var(--color-dark-800)] border border-[var(--color-dark-700)] flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black text-white">{tasks.length}</span>
                <span className="text-xs text-[var(--color-light-400)] font-medium uppercase tracking-wider">Totales</span>
             </div>
             <div className="px-5 py-3 rounded-2xl bg-[var(--color-dark-800)] border border-[var(--color-success)]/20 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                <span className="text-2xl font-black text-[var(--color-success)]">{tasks.filter(t => t.status==='DONE').length}</span>
                <span className="text-xs text-[var(--color-light-400)] font-medium uppercase tracking-wider">Listas</span>
             </div>
          </div>
        </div>

        {error ? (
          <div className="p-4 bg-[var(--color-danger)]/20 border border-[var(--color-danger)] rounded-xl text-white shadow-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="glass rounded-2xl p-6 border border-[var(--color-dark-700)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 group flex flex-col h-full bg-gradient-to-b from-[var(--color-dark-800)]/40 to-transparent">
                <div className="flex justify-between items-start mb-5">
                  {getStatusBadge(task.status)}
                  <div className="text-xs text-[var(--color-light-500)] bg-[var(--color-dark-800)] px-2 py-1 rounded-md border border-[var(--color-dark-700)]">
                      {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[var(--color-primary-light)] transition-colors line-clamp-2">{task.title}</h3>
                <p className="text-[var(--color-light-300)] text-sm mb-6 flex-1 line-clamp-4 leading-relaxed">
                  {task.description || 'Esta tarea no tiene detalles adicionales proporcionados por el administrador.'}
                </p>
                
                {/* Visual indicator bar at the bottom */}
                <div className="w-full h-1.5 rounded-full bg-[var(--color-dark-700)] overflow-hidden">
                   <div className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      task.status === 'DONE' ? 'w-full bg-[var(--color-success)]' :
                      task.status === 'IN_PROGRESS' ? 'w-1/2 bg-[var(--color-primary)]' :
                      'w-1/12 bg-[var(--color-warning)]'
                   }`}></div>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-16 glass rounded-3xl border border-dashed border-[var(--color-dark-600)] text-center">
                <div className="w-20 h-20 bg-[var(--color-dark-800)] rounded-full flex items-center justify-center mb-6 shadow-xl">
                   <CheckSquare className="w-10 h-10 text-[var(--color-success)] opacity-50" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">¡Todo al día!</h3>
                <p className="text-[var(--color-light-400)] max-w-md">
                  No tienes ninguna tarea asignada en este momento. Tómate un café o consulta al administrador si crees que es un error.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
