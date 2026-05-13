import React, { useState, useEffect } from 'react';
import {
  Loader2,
  CheckSquare,
  Clock,
  LayoutDashboard,
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  Pencil,
  X,
  Camera,
  User,
  Mail,
  Shield,
  Save,
  Home
} from 'lucide-react';

import { useAuth } from '../../context';
import { useNavigate } from 'react-router-dom';

export const MyTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // ======================
  // PERFIL
  // ======================
  const [profile, setProfile] = useState({
    name: user?.name || 'Valeria',
    email: user?.email || 'usuario@email.com',
    role: 'Administrador',
    photo: null
  });

  // ======================
  // TAREAS
  // ======================
  const [tasks, setTasks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: false
  });

  // ======================
  // CARGA
  // ======================
  useEffect(() => {
    setTimeout(() => {
      setTasks([
        {
          id: 1,
          name: 'Diseñar dashboard',
          description:
            'Crear una interfaz moderna para el sistema.',
          completed: false,
          priority: true
        },
        {
          id: 2,
          name: 'Conectar backend',
          description:
            'Integrar frontend con API REST.',
          completed: true,
          priority: false
        }
      ]);

      setLoading(false);
    }, 1200);
  }, []);

  // ======================
  // FOTO
  // ======================
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setProfile({
          ...profile,
          photo: reader.result
        });
      };

      reader.readAsDataURL(file);
    }
  };

  // ======================
  // CREAR
  // ======================
  const handleCreateTask = () => {
    if (!formData.name.trim()) return;

    const newTask = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      completed: false,
      priority: formData.priority
    };

    setTasks([newTask, ...tasks]);

    resetForm();
  };

  // ======================
  // EDITAR
  // ======================
  const handleEditTask = () => {
    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              name: formData.name,
              description: formData.description,
              priority: formData.priority
            }
          : task
      )
    );

    resetForm();
  };

  // ======================
  // ELIMINAR
  // ======================
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // ======================
  // COMPLETAR
  // ======================
  const toggleTaskCompletion = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed
            }
          : task
      )
    );
  };

  // ======================
  // MODAL
  // ======================
  const openEditModal = (task) => {
    setEditingTask(task);

    setFormData({
      name: task.name,
      description: task.description,
      priority: task.priority
    });

    setShowModal(true);
  };

  // ======================
  // RESET
  // ======================
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      priority: false
    });

    setEditingTask(null);
    setShowModal(false);
  };

  // ======================
  // BADGE
  // ======================
  const getStatusBadge = (completed) => {
    if (completed) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
          <CheckSquare size={14} />
          COMPLETADA
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/20">
        <Clock size={14} />
        PENDIENTE
      </span>
    );
  };

  // ======================
  // LOADING
  // ======================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050816]">
        <Loader2 className="w-14 h-14 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-hidden relative">

      {/* FONDO */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">

        <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px]" />

        <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-fuchsia-500/20 rounded-full blur-[120px]" />

        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">

        {/* HEADER */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[35px] p-5 sm:p-8 shadow-2xl mb-8">

          <div className="flex flex-col xl:flex-row gap-10">

            {/* PERFIL */}
            <div className="w-full xl:w-[350px]">

              <div className="flex flex-col items-center">

                {/* FOTO */}
                <div className="relative group">

                  <div className="w-40 h-40 rounded-full overflow-hidden border-[5px] border-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.5)]">

                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 flex items-center justify-center">
                        <User size={70} />
                      </div>
                    )}
                  </div>

                  <label className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center cursor-pointer shadow-xl text-black">
                    <Camera size={20} />

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>

                {/* NOMBRE */}
                <h2 className="text-3xl font-black mt-6 text-center bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                  {profile.name}
                </h2>

                <p className="text-gray-400 mt-2">
                  {profile.role}
                </p>

                {/* BOTON INICIO */}
                <button
                  onClick={() => navigate('/')}
                  className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:scale-[1.02] transition-all font-bold flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                >
                  <Home size={20} />
                  Ir al inicio
                </button>
              </div>

              {/* FORM PERFIL */}
              <div className="mt-8 space-y-5">

                <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-cyan-300 mb-2">
                    <User size={16} />
                    <span className="text-sm">
                      Nombre
                    </span>
                  </div>

                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        name: e.target.value
                      })
                    }
                    className="w-full bg-transparent outline-none text-lg font-semibold"
                  />
                </div>

                <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-fuchsia-300 mb-2">
                    <Mail size={16} />
                    <span className="text-sm">
                      Email
                    </span>
                  </div>

                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email: e.target.value
                      })
                    }
                    className="w-full bg-transparent outline-none text-lg"
                  />
                </div>

                <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-indigo-300 mb-2">
                    <Shield size={16} />
                    <span className="text-sm">
                      Rol
                    </span>
                  </div>

                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        role: e.target.value
                      })
                    }
                    className="w-full bg-transparent outline-none text-lg"
                  />
                </div>

                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 hover:scale-[1.02] transition-all font-bold flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                  <Save size={20} />
                  Guardar perfil
                </button>
              </div>
            </div>

            {/* PANEL DERECHO */}
            <div className="flex-1">

              {/* TITULO */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">

                <div>
                  <h1 className="text-4xl sm:text-5xl font-black leading-tight bg-gradient-to-r from-white via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                    Panel de tareas
                  </h1>

                  <p className="text-gray-400 mt-3 text-sm sm:text-base">
                    Administra tus tareas y controla tu productividad.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:scale-105 transition-all font-bold flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(34,211,238,0.4)]"
                >
                  <Plus size={22} />
                  Nueva tarea
                </button>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                  <p className="text-gray-400 text-sm">
                    Total
                  </p>

                  <h2 className="text-5xl font-black mt-2">
                    {tasks.length}
                  </h2>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">
                  <p className="text-emerald-300 text-sm">
                    Completadas
                  </p>

                  <h2 className="text-5xl font-black mt-2 text-emerald-400">
                    {
                      tasks.filter(
                        (t) => t.completed
                      ).length
                    }
                  </h2>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6">
                  <p className="text-amber-300 text-sm">
                    Pendientes
                  </p>

                  <h2 className="text-5xl font-black mt-2 text-amber-400">
                    {
                      tasks.filter(
                        (t) => !t.completed
                      ).length
                    }
                  </h2>
                </div>
              </div>

              {/* TAREAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-[30px] p-6 backdrop-blur-xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                      task.completed
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >

                    <div className="flex items-start justify-between mb-5">

                      {getStatusBadge(task.completed)}

                      <button
                        onClick={() =>
                          toggleTaskCompletion(task.id)
                        }
                        className={`p-2 rounded-full transition-all ${
                          task.completed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle size={22} />
                        ) : (
                          <Circle size={22} />
                        )}
                      </button>
                    </div>

                    <h2
                      className={`text-2xl font-bold mb-4 ${
                        task.completed
                          ? 'line-through text-gray-500'
                          : 'text-white'
                      }`}
                    >
                      {task.name}

                      {task.priority &&
                        !task.completed && (
                          <span className="ml-3 px-2 py-1 rounded-lg text-xs bg-red-500/20 text-red-400">
                            PRIORIDAD
                          </span>
                        )}
                    </h2>

                    <p className="text-gray-400 leading-relaxed mb-7">
                      {task.description}
                    </p>

                    {/* BOTONES */}
                    <div className="flex flex-col sm:flex-row gap-4">

                      <button
                        onClick={() =>
                          openEditModal(task)
                        }
                        className="flex-1 py-3 rounded-2xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <Pencil size={18} />
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          deleteTask(task.id)
                        }
                        className="flex-1 py-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-2xl rounded-[35px] bg-[#0f172a]/95 border border-white/10 p-6 sm:p-8 relative shadow-[0_0_80px_rgba(0,0,0,0.8)]">

            <button
              onClick={resetForm}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={28} />
            </button>

            <h2 className="text-3xl sm:text-4xl font-black mb-8 bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
              {editingTask
                ? 'Editar tarea'
                : 'Nueva tarea'}
            </h2>

            <div className="space-y-6">

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                }
                className="w-full px-5 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400 outline-none"
                placeholder="Nombre de la tarea..."
              />

              <textarea
                rows="5"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value
                  })
                }
                className="w-full px-5 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-fuchsia-400 outline-none resize-none"
                placeholder="Descripción..."
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.checked
                    })
                  }
                />

                <span className="text-gray-300">
                  Marcar como prioridad
                </span>
              </div>

              <button
                onClick={
                  editingTask
                    ? handleEditTask
                    : handleCreateTask
                }
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:scale-[1.02] transition-all font-bold text-lg shadow-[0_0_40px_rgba(34,211,238,0.4)]"
              >
                {editingTask
                  ? 'Guardar cambios'
                  : 'Crear tarea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};