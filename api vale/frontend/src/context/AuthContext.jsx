import { createContext, useContext, useState, useCallback } from 'react';
import { login as loginService, logout as logoutService } from '../api';
import { STORAGE_KEYS } from '../api/client';

/**
 * Contexto global de autenticación.
 * Provee: usuario actual, token, estado de autenticación,
 * funciones de login/logout y estado de carga.
 *
 * SEGURIDAD:
 * - El token JWT se almacena en localStorage bajo claves específicas del proyecto.
 * - El logout notifica al backend (para registrar en auditoría) antes de limpiar la sesión local.
 * - Los datos del usuario en localStorage no incluyen información sensible (solo id, username, role).
 */

const AuthContext = createContext(null);

/**
 * Lee la sesión guardada en localStorage al cargar la aplicación.
 * Si los datos están corruptos, retorna null y limpia el almacenamiento.
 */
function getStoredAuth() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
  if (token && userRaw) {
    try {
      return { token, user: JSON.parse(userRaw) };
    } catch {
      // Si el JSON está malformado, limpiar para evitar estados inconsistentes
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  }
  return null;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth);
  const [isLoading, setIsLoading] = useState(false);

  const user = auth?.user ?? null;
  const token = auth?.token ?? null;
  const isAuthenticated = !!token;

  /**
   * Inicia sesión: llama al backend, guarda token y datos del usuario.
   * Retorna { success: true, user } o { success: false, message }.
   */
  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    try {
      const response = await loginService(username, password);
      const { access_token, user: userData } = response.data;

      // Guardar solo datos no sensibles en localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, access_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

      setAuth({ token: access_token, user: userData });
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cierra sesión: notifica al backend (auditoría) y limpia el estado local.
   * El error en la llamada al backend se ignora para no bloquear el logout local.
   */
  const logout = useCallback(async () => {
    // Notificar al backend para registrar el evento de logout en auditoría
    try {
      await logoutService();
    } catch {
      // Si el servidor no está disponible, igual cerramos la sesión localmente
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setAuth(null);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
