import React, { useState, useEffect } from 'react';
import { Users, Activity, Loader2, Shield, UserPlus, LogIn } from 'lucide-react';
import { getUsers } from '../../api/users.service';
import { getAuditLogs } from '../../api/audit.service';

export const Dashboard = () => {
  const [data, setData] = useState({
    totalUsers: 0,
    totalLogs: 0,
    recentAlerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtenemos usuarios y logs en paralelo
        const [usersRes, logsRes] = await Promise.all([
          getUsers(),
          getAuditLogs()
        ]);

        const users = usersRes.data;
        const logs = logsRes.data;

        // Tomamos los 5 logs más recientes como "alertas"
        const recentAlerts = logs.slice(0, 5).map(log => {
          let color = 'var(--color-primary)';
          let msg = `${log.action} - ${log.details}`;
          if (log.severity === 'CRITICAL' || log.severity === 'HIGH') color = 'var(--color-danger)';
          else if (log.severity === 'MEDIUM') color = 'var(--color-warning)';
          else color = 'var(--color-success)';

          return {
            msg,
            time: new Date(log.createdAt).toLocaleString(),
            color
          };
        });

        setData({
          totalUsers: users.length,
          totalLogs: logs.length,
          recentAlerts
        });
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
      label: 'Usuarios Registrados',
      value: data.totalUsers,
      icon: Users,
      color: 'from-[var(--color-primary)] to-[var(--color-primary-light)]',
      shadow: 'shadow-indigo-500/50'
    },
    {
      label: 'Registros de Auditoría',
      value: data.totalLogs,
      icon: Shield,
      color: 'from-[var(--color-accent)] to-[var(--color-accent-light)]',
      shadow: 'shadow-cyan-500/50'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="glass p-6 rounded-2xl flex items-center justify-between hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="z-10">
                <p className="text-sm font-medium text-[var(--color-light-400)] mb-1">{stat.label}</p>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} ${stat.shadow} shadow-lg z-10 btn-glow`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Decorative background blur */}
              <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-300`}></div>
            </div>
          );
        })}
      </div>

      {/* Secciones de Contenido (Actividad Reciente) */}
      <div className="grid grid-cols-1 gap-6 mt-8">
        <div className="glass p-6 rounded-2xl min-h-[300px] flex flex-col relative overflow-hidden">
             <div className="absolute bottom-0 left-0 p-32 bg-[var(--color-secondary-light)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
             <h2 className="text-xl font-semibold text-white mb-4 z-10 flex items-center gap-2">
               <Activity className="w-5 h-5 text-[var(--color-warning)]" />
               Actividad Reciente en el Sistema (Auditoría)
             </h2>
             <div className="flex-1 space-y-3 z-10">
               {data.recentAlerts.length > 0 ? data.recentAlerts.map((alert, i) => (
                 <div key={i} className="bg-[var(--color-dark-800)]/50 p-4 rounded-lg border border-[var(--color-dark-700)] flex items-center gap-4 hover:bg-[var(--color-dark-700)] hover:border-[var(--color-dark-600)] transition-all cursor-pointer group">
                   <div className="w-3 h-3 rounded-full shadow-lg shrink-0" style={{ backgroundColor: alert.color, boxShadow: `0 0 10px ${alert.color}` }}></div>
                   <div>
                     <p className="text-sm font-medium text-[var(--color-light-100)] group-hover:text-white transition-colors">{alert.msg}</p>
                     <p className="text-xs text-[var(--color-light-400)] mt-1">{alert.time}</p>
                   </div>
                 </div>
               )) : (
                 <p className="text-[var(--color-light-400)]">No hay actividad reciente.</p>
               )}
             </div>
        </div>
      </div>
    </div>
  );
};
