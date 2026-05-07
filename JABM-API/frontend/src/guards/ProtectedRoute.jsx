import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context';

/**
 * Guard para rutas que requieren autenticación.
 * Si el usuario no está autenticado, lo redirige al login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
