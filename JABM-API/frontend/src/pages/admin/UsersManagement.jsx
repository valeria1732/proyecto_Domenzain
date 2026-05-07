import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser, updateUser, createUser } from '../../api/users.service';
import { Loader2, Trash2, Edit2, Shield, ShieldAlert, User as UserIcon, Mail, Plus } from 'lucide-react';
import { Button } from '../../components/ui';

export const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Edit/Create Modal
  const [modalMode, setModalMode] = useState(null); // 'edit' | 'create' | null
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;
    
    try {
      await updateUserRole(user.id, newRole);
      // Actualizamos localmente sin recargar todo
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Error cambiando el rol');
      console.error(err);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar definitivamente a ${user.name}? Esta acción es irreversible.`)) return;

    try {
      await deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err) {
      alert('Error al eliminar usuario');
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'USER' });
    setErrors({});
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userForm.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    
    if (!userForm.email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!userForm.email.includes('@')) {
      newErrors.email = 'El email debe contener un "@".';
    }

    if (modalMode === 'create') {
      if (!userForm.password) {
        newErrors.password = 'La contraseña es obligatoria.';
      } else {
        if (userForm.password.length < 8) newErrors.password = 'Debe tener mínimo 8 caracteres.';
        else if (!/[A-Z]/.test(userForm.password)) newErrors.password = 'Debe contener al menos una mayúscula.';
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(userForm.password)) newErrors.password = 'Debe contener al menos un carácter especial.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      if (modalMode === 'edit') {
        await updateUser(editingUser.id, { name: userForm.name, email: userForm.email });
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, name: userForm.name, email: userForm.email } : u));
      } else {
        const res = await createUser(userForm);
        setUsers([...users, res.data]);
      }
      setModalMode(null);
    } catch (err) {
      alert(`Error al ${modalMode === 'edit' ? 'editar' : 'crear'} usuario. Verifique los datos o si el email ya existe.`);
      console.error(err);
    } finally {
      setFormLoading(false);
    }
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
          Gestión de <span className="gradient-text">Usuarios</span>
        </h1>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-[var(--color-dark-800)] rounded-full border border-[var(--color-dark-600)] text-sm text-[var(--color-light-300)] flex items-center">
            Total: <span className="font-bold text-white ml-2">{users.length}</span>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2 shadow-lg shadow-indigo-500/30">
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-[var(--color-danger)]/20 border border-[var(--color-danger)] rounded-xl text-white">
          {error}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-[var(--color-dark-700)] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-dark-800)]/80 text-[var(--color-light-400)] text-sm uppercase tracking-wider border-b border-[var(--color-dark-700)]">
                  <th className="p-4 font-medium">Usuario</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Rol</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-dark-700)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--color-dark-800)]/40 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-[var(--color-light-100)]">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--color-light-300)] flex items-center gap-2">
                       <Mail className="w-4 h-4 text-[var(--color-light-500)]" />
                       {user.email}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        user.role === 'ADMIN' 
                          ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent-light)] border-[var(--color-accent)]/30 shadow-[0_0_10px_var(--color-accent)]' 
                          : 'bg-[var(--color-dark-700)] text-[var(--color-light-300)] border-[var(--color-dark-600)]'
                      }`}>
                        {user.role === 'ADMIN' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Cambiar Rol */}
                        <button 
                          onClick={() => handleRoleToggle(user)}
                          title={`Cambiar rol a ${user.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}
                          className="p-2 rounded-lg bg-[var(--color-dark-700)] hover:bg-[var(--color-accent)]/20 text-[var(--color-light-400)] hover:text-[var(--color-accent-light)] hover:border-[var(--color-accent)]/50 border border-transparent transition-all"
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        {/* Editar */}
                        <button 
                          onClick={() => openEditModal(user)}
                          title="Editar usuario"
                          className="p-2 rounded-lg bg-[var(--color-dark-700)] hover:bg-[var(--color-primary)]/20 text-[var(--color-light-400)] hover:text-[var(--color-primary-light)] hover:border-[var(--color-primary)]/50 border border-transparent transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Eliminar */}
                        <button 
                          onClick={() => handleDelete(user)}
                          title="Eliminar usuario"
                          className="p-2 rounded-lg bg-[var(--color-dark-700)] hover:bg-[var(--color-danger)]/20 text-[var(--color-light-400)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/50 border border-transparent transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-8 text-center text-[var(--color-light-400)]">
                No hay usuarios registrados.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Creación/Edición */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md p-8 rounded-3xl relative border border-[var(--color-dark-600)] shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {modalMode === 'edit' ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={submitForm} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-[var(--color-light-300)] mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={userForm.name}
                  onChange={(e) => { setUserForm({...userForm, name: e.target.value}); setErrors({...errors, name: ''}); }}
                  className={`w-full bg-[var(--color-dark-800)] border ${errors.name ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : 'border-[var(--color-dark-600)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all`}
                />
                {errors.name && <p className="text-[var(--color-danger)] text-xs mt-1 ml-1 animate-slide-down">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-light-300)] mb-1">Email</label>
                <input 
                  type="email" 
                  value={userForm.email}
                  onChange={(e) => { setUserForm({...userForm, email: e.target.value}); setErrors({...errors, email: ''}); }}
                  className={`w-full bg-[var(--color-dark-800)] border ${errors.email ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : 'border-[var(--color-dark-600)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all`}
                />
                {errors.email && <p className="text-[var(--color-danger)] text-xs mt-1 ml-1 animate-slide-down">{errors.email}</p>}
              </div>

              {modalMode === 'create' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-light-300)] mb-1">Contraseña</label>
                    <input 
                      type="password" 
                      value={userForm.password}
                      onChange={(e) => { setUserForm({...userForm, password: e.target.value}); setErrors({...errors, password: ''}); }}
                      className={`w-full bg-[var(--color-dark-800)] border ${errors.password ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]' : 'border-[var(--color-dark-600)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all`}
                    />
                    {errors.password && <p className="text-[var(--color-danger)] text-xs mt-1 ml-1 animate-slide-down">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-light-300)] mb-1">Rol</label>
                    <select 
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className="w-full bg-[var(--color-dark-800)] border border-[var(--color-dark-600)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                    >
                      <option value="USER">Usuario (USER)</option>
                      <option value="ADMIN">Administrador (ADMIN)</option>
                    </select>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 mt-8 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-[var(--color-dark-600)]"
                  onClick={() => setModalMode(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  className="flex-1"
                  disabled={formLoading}
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
