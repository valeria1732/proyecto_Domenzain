import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { sanitizeInput } from '../../utils/sanitize';
import { validateUsername } from '../../utils/validators';

/**
 * Página de inicio de sesión.
 *
 * SEGURIDAD:
 * - Se eliminó dangerouslySetInnerHTML (riesgo XSS) y se reemplazó por
 *   componentes de Lucide React (SVGs seguros gestionados por la librería).
 * - Los inputs sanitizan el valor antes de enviarlo al backend.
 * - Los mensajes de error del servidor se muestran tal cual, nunca se
 *   ejecutan como HTML.
 * - El campo es "username" no "email", en línea con el backend.
 */
export default function Login() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({});
  const [serverError, setServerError]   = useState('');

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Validación del formulario antes de hacer la llamada al servidor
  function validateForm() {
    const newErrors = {};
    const usernameError = validateUsername(username);
    if (usernameError) newErrors.username = usernameError;
    if (!password || password.length === 0) newErrors.password = 'La contraseña es requerida.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validar antes de enviar
    if (!validateForm()) return;

    // Sanitizar inputs antes de enviar al backend
    const cleanUsername = sanitizeInput(username);

    const result = await login(cleanUsername, password);

    if (result.success) {
      // Redirigir según el rol del usuario autenticado
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/user/tasks');
      }
    } else {
      // Mostrar mensaje de error del servidor (nunca renderizado como HTML)
      setServerError(result.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Fondo con gradientes animados */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-dark-900"></div>
        {/* Anillos orbitales decorativos */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-light-400/5 rounded-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full blur-[2px] animate-orbit-1"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-light-400/5 rounded-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-secondary rounded-full blur-[3px] animate-orbit-2"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-light-400/5 rounded-full">
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-accent rounded-full blur-[2px] animate-orbit-3"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Glow detrás de la tarjeta */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-[2rem] animate-pulse-glow"></div>

        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary/30 blur-2xl rounded-full"></div>

          {/* Cabecera */}
          <div className="text-center mb-10 relative">
            {/* Ícono usando Lucide React — sin dangerouslySetInnerHTML */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800/80 border border-light-400/10 shadow-lg text-primary mb-6 animate-float">
              <Shield size={32} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-light-100 mb-2">
              Bienvenido de <span className="gradient-text">vuelta</span>
            </h1>
            <p className="text-light-400 text-sm">
              Accede a tu panel de control
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-5 w-full">

              {/* Campo: Nombre de usuario */}
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-sm text-light-300 font-medium">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-400">
                    <User size={18} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="tu.usuario"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
                    }}
                    disabled={isLoading}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-dark-800/60 border text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.username
                        ? 'border-red-500 focus:ring-red-500/30'
                        : 'border-light-400/10 focus:ring-primary/30 focus:border-primary/50'
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.username}
                  </p>
                )}
              </div>

              {/* Campo: Contraseña */}
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm text-light-300 font-medium">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    disabled={isLoading}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl bg-dark-800/60 border text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500/30'
                        : 'border-light-400/10 focus:ring-primary/30 focus:border-primary/50'
                    }`}
                  />
                  {/* Botón mostrar/ocultar contraseña — Lucide, sin dangerouslySetInnerHTML */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-light-400 hover:text-white transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Error del servidor — renderizado como texto, nunca como HTML */}
            {serverError && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-xl text-sm border border-red-500/20">
                <AlertCircle size={16} />
                <p>{serverError}</p>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-xl font-semibold text-base bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
