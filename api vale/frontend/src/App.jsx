import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context';
import { Login } from './pages/auth';
import { ProtectedRoute, AdminRoute } from './guards';
import { AdminLayout } from './components/layout';
import { Dashboard, UsersManagement, TasksManagement, AuditLogs } from './pages/admin';
import { MyTasks } from './pages/user';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirección por defecto al login si no está autenticado */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* ========================================
              RUTAS PROTEGIDAS GENERALES (Cualquier rol)
              ======================================== */}
          <Route element={<ProtectedRoute />}>
            {/* Panel del Usuario Normal */}
            <Route path="/user/tasks" element={<MyTasks />} />
          </Route>

          {/* ========================================
              RUTAS EXCLUSIVAS DE ADMINISTRADOR
              ======================================== */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/tasks" element={<TasksManagement />} />
              <Route path="/admin/audit" element={<AuditLogs />} />
            </Route>
          </Route>
          
          {/* Catch all para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
