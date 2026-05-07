import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context';

/**
 * Guard para rutas exclusivas de Administrador.
 * Verifica autenticación primero, luego verifica el rol.
 * Si el usuario es USER normal, lo redirige a su panel.
 */
export default function AdminRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/user/tasks" replace />;
  }

  return <Outlet />;
}
