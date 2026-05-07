import React, { useState, useEffect } from 'react';
import { Users, CheckSquare, Target, Activity, Loader2 } from 'lucide-react';
import { getDashboardStats } from '../../api/dashboard.service';

export const Dashboard = () => {
  const [data, setData] = useState({
    totalUsers: 0,
    activeTasks: 0,
    completedTasks: 0,
    alertsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Usuarios Totales',
      value: data.totalUsers,
      icon: Users,
      color: 'from-[var(--color-primary)] to-[var(--color-primary-light)]',
      shadow: 'shadow-indigo-500/50'
    },
    {
      label: 'Tareas Activas',
      value: data.activeTasks,
      icon: Target,
      color: 'from-[var(--color-accent)] to-[var(--color-accent-light)]',
      shadow: 'shadow-cyan-500/50'
    },
    {
      label: 'Completadas',
      value: data.completedTasks,
      icon: CheckSquare,
      color: 'from-[var(--color-success)] to-[#34d399]',
      shadow: 'shadow-emerald-500/50'
    },
    {
      label: 'Alertas',
      value: data.alertsCount,
      icon: Activity,
      color: 'from-[var(--color-warning)] to-[#fbbf24]',
      shadow: 'shadow-amber-500/50'
    }
  ];

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Panel de <span className="gradient-text">Control</span>
        </h1>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="glass p-6 rounded-2xl flex items-center justify-between hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="z-10">
                <p className="text-sm font-medium text-[var(--color-light-400)] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-lg z-10 btn-glow`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Decorative background blur */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-300`}></div>
            </div>
          );
        })}
      </div>

      {/* Secciones de Contenido (Gráficos/Tablas simuladas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 glass p-6 rounded-2xl min-h-[300px] flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-[var(--color-primary-light)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
             <h2 className="text-xl font-semibold text-white mb-4 z-10 flex items-center gap-2">
               <Activity className="w-5 h-5 text-[var(--color-primary-light)]" />
               Actividad Reciente
             </h2>
             <div className="flex-1 flex items-center justify-center border border-dashed border-[var(--color-dark-600)] rounded-xl z-10 bg-[var(--color-dark-800)]/30 backdrop-blur-sm">
               <div className="text-center">
                 <p className="text-[var(--color-light-400)] font-medium mb-2">Gráfico de actividad</p>
                 <span className="text-xs px-2 py-1 rounded bg-[var(--color-dark-700)] text-[var(--color-light-300)]">Próximamente</span>
               </div>
             </div>
        </div>
        
        <div className="glass p-6 rounded-2xl min-h-[300px] flex flex-col relative overflow-hidden">
             <div className="absolute bottom-0 left-0 p-32 bg-[var(--color-secondary-light)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
             <h2 className="text-xl font-semibold text-white mb-4 z-10 flex items-center gap-2">
               <Activity className="w-5 h-5 text-[var(--color-warning)]" />
               Alertas del Sistema
             </h2>
             <div className="flex-1 space-y-3 z-10">
               {[
                 { msg: "Intento de acceso fallido", time: "Hace 10 min", color: "var(--color-warning)" },
                 { msg: "Nueva tarea creada", time: "Hace 45 min", color: "var(--color-success)" },
                 { msg: "Usuario baneado", time: "Hace 2 horas", color: "var(--color-danger)" }
               ].map((alert, i) => (
                 <div key={i} className="bg-[var(--color-dark-800)]/50 p-3 rounded-lg border border-[var(--color-dark-700)] flex items-center gap-3 hover:bg-[var(--color-dark-700)] hover:border-[var(--color-dark-600)] transition-all cursor-pointer group">
                   <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: alert.color, boxShadow: `0 0 8px ${alert.color}` }}></div>
                   <div>
                     <p className="text-sm font-medium text-[var(--color-light-100)] group-hover:text-white transition-colors">{alert.msg}</p>
                     <p className="text-xs text-[var(--color-light-400)] mt-0.5">{alert.time}</p>
                   </div>
                 </div>
               ))}
             </div>
             
             <button className="mt-4 w-full py-2 rounded-lg bg-[var(--color-dark-700)] hover:bg-[var(--color-dark-600)] text-sm font-medium text-white transition-colors">
               Ver todas las alertas
             </button>
        </div>
      </div>
    </div>
  );
};
