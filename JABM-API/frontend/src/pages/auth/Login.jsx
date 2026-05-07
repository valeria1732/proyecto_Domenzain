import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { Input, Button } from '../../components/ui';
import { ICONS } from '../../utils/icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      // Redirigir según el rol
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/user/tasks');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background with animated gradients and orbits */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-dark-900"></div>
        {/* Orbits */}
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
        {/* Glow effect behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl rounded-[2rem] animate-pulse-glow"></div>
        
        <div className="glass rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top corner subtle gradient accent */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary/30 blur-2xl rounded-full"></div>
          
          <div className="text-center mb-10 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800/80 border border-light-400/10 shadow-lg text-primary mb-6 animate-float" dangerouslySetInnerHTML={{ __html: ICONS.shield }}>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-light-100 mb-2">
              Bienvenido de <span className="gradient-text">vuelta</span>
            </h1>
            <p className="text-light-400 text-sm">
              Accede a tu panel de control JABM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            
            <div className="flex flex-col gap-5 w-full">
              <Input
                id="email"
                type="email"
                label="Correo Electrónico"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={ICONS.email}
                disabled={isLoading}
              />

              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={ICONS.lock}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 bottom-[14px] text-[var(--color-light-400)] hover:text-white transition-colors focus:outline-none flex items-center justify-center p-1"
                  dangerouslySetInnerHTML={{ __html: showPassword ? ICONS.eyeOff : ICONS.eye }}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[var(--color-danger)] bg-[var(--color-danger)]/10 p-3 rounded-xl text-sm border border-[var(--color-danger)]/20 animate-shake">
                <span dangerouslySetInnerHTML={{ __html: ICONS.alertCircle }}></span>
                <p>{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-base py-3.5 mt-2"
              isLoading={isLoading}
            >
              Iniciar Sesión
            </Button>
            
          </form>
        </div>
      </div>
    </div>
  );
}
