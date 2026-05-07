import React, { useState, useEffect } from 'react';
import { getAllTasks, createTask, updateTask, deleteTask } from '../../api/tasks.service';
import { getAllUsers } from '../../api/users.service';
import { Loader2, Trash2, Edit2, Plus, Target, CheckSquare, Clock } from 'lucide-react';
import { Button } from '../../components/ui';

export const TasksManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'PENDING', userId: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        getAllTasks(),
        getAllUsers()
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos. Verifica tu conexión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DONE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20"><CheckSquare className="w-3 h-3"/> Completada</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary-light)] border border-[var(--color-primary)]/20"><Target className="w-3 h-3"/> En Progreso</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-warning)]/10 text-[#fbbf24] border border-[var(--color-warning)]/20"><Clock className="w-3 h-3"/> Pendiente</span>;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro de que deseas eliminar esta tarea?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      alert('Error eliminando tarea.');
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', status: 'PENDING', userId: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description || '', status: task.status, userId: task.userId });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'El título es obligatorio.';
    if (!form.description.trim()) newErrors.description = 'La descripción es obligatoria.';
    if (!editingTask && !form.userId) newErrors.userId = 'Debes asignar la tarea a un usuario.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setActionLoading(true);
    try {
      const payload = { ...form };
      if (!payload.userId) delete payload.userId; // si no asigna usuario, lo toma el backend (o falla si lo requiere el dto, pero le pasaremos uno)

      if (editingTask) {
        // En NestJS la actualización de userId no siempre es permitida libremente, pero podemos intentarlo. 
        // Normalmente se actualiza titulo, descripcion y status.
        const res = await updateTask(editingTask.id, {
          title: payload.title,
          description: payload.description,
          status: payload.status
        });
        // Refrescamos toda la lista para evitar inconsistencias locales complejas
        await fetchData();
      } else {
        await createTask(payload);
        await fetchData();
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Error guardando la tarea.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Desconocido';
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Gestión de <span className="gradient-text">Tareas</span>
        </h1>
        <Button onClick={openCreateModal} className="shadow-lg shadow-indigo-500/30 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Tarea
        </Button>
      </div>

      {error ? (
        <div className="p-4 bg-[var(--color-danger)]/20 border border-[var(--color-danger)] rounded-xl text-white">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="glass rounded-2xl p-6 border border-[var(--color-dark-700)] hover:-translate-y-1 hover:shadow-xl transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(task.status)}
                <div className="flex bg-[var(--color-dark-800)]/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--color-dark-600)] backdrop-blur-md">
                   <button onClick={() => openEditModal(task)} className="p-2 text-[var(--color-light-400)] hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                   <div className="w-[1px] bg-[var(--color-dark-600)] my-1"></div>
                   <button onClick={() => handleDelete(task.id)} className="p-2 text-[var(--color-light-400)] hover:text-[var(--color-danger)] transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{task.title}</h3>
              <p className="text-[var(--color-light-400)] text-sm mb-6 flex-1 line-clamp-3">
                {task.description || 'Sin descripción'}
              </p>
              
              <div className="pt-4 border-t border-[var(--color-dark-700)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {getUserName(task.userId).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-[var(--color-light-500)]">Asignado a</p>
                  <p className="text-sm font-medium text-[var(--color-light-100)]">{getUserName(task.userId)}</p>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="col-span-full p-8 text-center text-[var(--color-light-400)] glass rounded-xl">
              No hay tareas registradas en el sistema.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-lg p-8 rounded-3xl relative border border-[var(--color-dark-600)] shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-[var(--color-light-300)] mb-1">Título</label>
                <input 
                  type="text" maxLength={255}
                  value={form.title} onChange={(e) => { setForm({...form, title: e.target.value}); setErrors({...errors, title: ''}) }}
                  className={`w-full bg-[var(--color-dark-800)] border ${errors.title ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : 'border-[var(--color-dark-600)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all`}
                  placeholder="Ej. Revisar documentación"
                />
                {errors.title && <p className="text-[var(--color-danger)] text-xs mt-1 ml-1 animate-slide-down">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-light-300)] mb-1">Descripción</label>
                <textarea 
                  rows={3}
                  value={form.description} onChange={(e) => { setForm({...form, description: e.target.value}); setErrors({...errors, description: ''}) }}
                  className={`w-full bg-[var(--color-dark-800)] border ${errors.description ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : 'border-[var(--color-dark-600)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all`}
                  placeholder="Detalles opcionales..."
                />
                {errors.description && <p className="text-[var(--color-danger)] text-xs mt-1 ml-1 animate-slide-down">{errors.description}</p>}
              </div>

              {!editingTask && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-light-300)] mb-1">Asignar a Usuario</label>
                  <select 
                    value={form.userId} onChange={(e) => { setForm({...form, userId: e.target.value}); setErrors({...errors, userId: ''}) }}
                    className={`w-full bg-[var(--color-dark-800)] border ${errors.userId ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : 'border-[var(--color-dark-600)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all`}
                  >
                    <option value="" disabled>Selecciona un usuario</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  {errors.userId && <p className="text-[var(--color-danger)] text-xs mt-1 ml-1 animate-slide-down">{errors.userId}</p>}
                </div>
              )}

              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-light-300)] mb-1">Estado</label>
                  <select 
                    value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="DONE">Completada</option>
                  </select>
                </div>
              )}
              
              <div className="flex gap-3 mt-8 pt-4">
                <Button type="button" variant="outline" className="flex-1 border-[var(--color-dark-600)]" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingTask ? 'Guardar Cambios' : 'Crear Tarea')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
