import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Heart,
  Sparkles
} from 'lucide-react';

import { sanitizeInput } from '../../utils/sanitize';
import { validateUsername } from '../../utils/validators';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // ❌ Bloquear espacios
  const hasSpaces = (value) => /\s/.test(value);

  // ✅ Validación segura
  function validateForm() {
    const newErrors = {};

    const cleanUsername = username.trim();

    const usernameError = validateUsername(cleanUsername);

    if (!cleanUsername) {
      newErrors.username = 'El usuario es obligatorio.';
    } else if (hasSpaces(username)) {
      newErrors.username = 'El usuario no puede contener espacios.';
    } else if (username.length < 4) {
      newErrors.username = 'Mínimo 4 caracteres.';
    } else if (username.length > 20) {
      newErrors.username = 'Máximo 20 caracteres.';
    } else if (usernameError) {
      newErrors.username = usernameError;
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (hasSpaces(password)) {
      newErrors.password = 'La contraseña no puede contener espacios.';
    } else if (password.length < 8) {
      newErrors.password = 'Debe tener mínimo 8 caracteres.';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Debe contener una mayúscula.';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Debe contener un número.';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = 'Debe contener un carácter especial.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // ✅ Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError('');

    if (!validateForm()) return;

    const cleanUsername = sanitizeInput(username.trim());

    const result = await login(cleanUsername, password);

    if (result.success) {
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/user/tasks');
      }
    } else {
      setServerError(result.message);
    }
  };

  // ❌ Evitar espacios al escribir
  const handleNoSpaces = (setter) => (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setter(value);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#12061c] px-4 py-10">

      {/* Fondo femenino */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-pink-500/20 blur-3xl rounded-full animate-pulse"></div>

        <div className="absolute bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse"></div>

        <div className="absolute top-[30%] right-[10%] w-[220px] h-[220px] bg-rose-400/10 blur-2xl rounded-full"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-[35px] blur-2xl opacity-30 animate-pulse"></div>

        <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[35px] p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">

            <div className="mx-auto mb-5 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-xl shadow-pink-500/30">
              <Heart className="text-white" size={35} />
            </div>

            <h1 className="text-4xl font-black text-white mb-2">
              Hola Bienvenido ✨
            </h1>

            <p className="text-pink-100 text-sm">
              Inicia sesión de forma segura
            </p>

            <div className="flex items-center justify-center gap-2 mt-4 text-pink-300">
              <Sparkles size={16} />
              <span className="text-xs">
                Seguridad avanzada habilitada
              </span>
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >

            {/* USERNAME */}
            <div>

              <label className="text-pink-100 text-sm font-medium mb-2 block">
                Usuario
              </label>

              <div className="relative">

                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300"
                  size={18}
                />

                <input
                  type="text"
                  autoComplete="username"
                  placeholder="valeria123"
                  value={username}
                  onChange={(e) => {
                    handleNoSpaces(setUsername)(e);

                    if (errors.username) {
                      setErrors((prev) => ({
                        ...prev,
                        username: ''
                      }));
                    }
                  }}
                  disabled={isLoading}
                  maxLength={20}
                  spellCheck={false}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 transition-all ${
                    errors.username
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'border-pink-300/20 focus:ring-pink-400/40 focus:border-pink-400'
                  }`}
                />
              </div>

              {errors.username && (
                <p className="mt-2 text-red-300 text-xs flex items-center gap-1">
                  <AlertCircle size={13} />
                  {errors.username}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>

              <label className="text-pink-100 text-sm font-medium mb-2 block">
                Contraseña
              </label>

              <div className="relative">

                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300"
                  size={18}
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    handleNoSpaces(setPassword)(e);

                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: ''
                      }));
                    }
                  }}
                  disabled={isLoading}
                  maxLength={40}
                  spellCheck={false}
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/10 border text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'border-pink-300/20 focus:ring-pink-400/40 focus:border-pink-400'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-300 hover:text-white transition"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-red-300 text-xs flex items-center gap-1">
                  <AlertCircle size={13} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* ERROR SERVIDOR */}
            {serverError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-200 px-4 py-3 rounded-2xl text-sm">
                <AlertCircle size={16} />
                <span>{serverError}</span>
              </div>
            )}

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 text-white font-bold shadow-xl shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck size={19} />
                  Iniciar Sesión
                </div>
              )}
            </button>

            {/* Seguridad */}
            <div className="bg-pink-500/10 border border-pink-300/10 rounded-2xl p-4 mt-5">
              <p className="text-xs text-pink-100 leading-relaxed">
                🔒 Tus datos están protegidos con validaciones avanzadas,
                sanitización de entradas y bloqueo de caracteres inseguros.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}