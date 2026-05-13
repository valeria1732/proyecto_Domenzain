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
  Save
} from 'lucide-react';

import { useAuth } from '../../context';

export const MyTasks = () => {
  const { user } = useAuth();

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
          description: 'Crear una interfaz moderna para el sistema.',
          completed: false,
          priority: true
        },
        {
          id: 2,
          name: 'Conectar backend',
          description: 'Integrar frontend con API REST.',
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
          ? { ...task, completed: !task.completed }
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

                <h2 className="text-3xl font-black mt-6 text-center bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                  {profile.name}
                </h2>

                <p className="text-gray-400 mt-2">
                  {profile.role}
                </p>

                {/* 🚪 BOTÓN CERRAR PESTAÑA */}
                <button
                  onClick={() => {
                    const confirmClose = window.confirm(
                      '¿Seguro que quieres cerrar la pestaña?'
                    );

                    if (confirmClose) {
                      window.close();

                      setTimeout(() => {
                        alert(
                          'El navegador bloqueó el cierre automático. Puedes cerrar la pestaña manualmente.'
                        );
                      }, 300);
                    }
                  }}
                  className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 hover:scale-[1.02] transition-all font-bold flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(244,63,94,0.4)]"
                >
                  <X size={20} />
                  Cerrar pestaña
                </button>
              </div>

              {/* FORM PERFIL */}
              <div className="mt-8 space-y-5">

                <div className="bg-[#0f172a]/80 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-cyan-300 mb-2">
                    <User size={16} />
                    <span className="text-sm">Nombre</span>
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
                    <span className="text-sm">Email</span>
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
                    <span className="text-sm">Rol</span>
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

            {/* TAREAS */}
            <div className="flex-1">

              <h1 className="text-4xl font-black mb-6">
                Panel de tareas
              </h1>

              <div className="grid md:grid-cols-2 gap-6">

                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/5 p-5 rounded-3xl border border-white/10"
                  >
                    <div className="flex justify-between">
                      <h2 className="font-bold text-xl">
                        {task.name}
                      </h2>

                      <button
                        onClick={() =>
                          toggleTaskCompletion(task.id)
                        }
                      >
                        {task.completed ? (
                          <CheckCircle />
                        ) : (
                          <Circle />
                        )}
                      </button>
                    </div>

                    <p className="text-gray-400 mt-2">
                      {task.description}
                    </p>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() =>
                          openEditModal(task)
                        }
                      >
                        <Pencil />
                      </button>

                      <button
                        onClick={() =>
                          deleteTask(task.id)
                        }
                      >
                        <Trash2 />
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111] p-6 rounded-2xl w-[400px]">

            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
              }
              className="w-full p-2 bg-black rounded"
              placeholder="Nombre"
            />

            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
              }
              className="w-full p-2 bg-black rounded mt-3"
            />

            <button
              onClick={
                editingTask
                  ? handleEditTask
                  : handleCreateTask
              }
              className="w-full mt-4 bg-cyan-500 p-2 rounded"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};