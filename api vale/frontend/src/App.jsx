import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider } from './context';
import { Login } from './pages/auth';
import {
  ProtectedRoute,
  AdminRoute
} from './guards';
import { AdminLayout } from './components/layout';
import {
  Dashboard,
  UsersManagement,
  AuditLogs
} from './pages/admin';
import { MyTasks } from './pages/user';

// =========================
// BLOQUEO LOGIN
// =========================
const allowLogin =
  sessionStorage.getItem('allow-login');

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =========================
              LOGIN PROTEGIDO
          ========================= */}
          <Route
            path="/login"
            element={
              allowLogin
                ? <Login />
                : (
                    <Navigate
                      to="/user/tasks"
                      replace
                    />
                  )
            }
          />

          {/* =========================
              HOME
          ========================= */}
          <Route
            path="/"
            element={
              <Navigate
                to="/user/tasks"
                replace
              />
            }
          />

          {/* =========================
              RUTAS USUARIO
          ========================= */}
          <Route
            element={<ProtectedRoute />}
          >
            <Route
              path="/user/tasks"
              element={<MyTasks />}
            />
          </Route>

          {/* =========================
              RUTAS ADMIN
          ========================= */}
          <Route
            element={<AdminRoute />}
          >
            <Route
              element={<AdminLayout />}
            >
              <Route
                path="/admin"
                element={<Dashboard />}
              />
              <Route
                path="/admin/users"
                element={<UsersManagement />}
              />
              <Route
                path="/admin/audit"
                element={<AuditLogs />}
              />
            </Route>
          </Route>

          {/* =========================
              404
          ========================= */}
          <Route
            path="*"
            element={
              <Navigate
                to="/user/tasks"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;