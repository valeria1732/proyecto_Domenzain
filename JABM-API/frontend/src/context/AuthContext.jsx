import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as loginService } from '../api';

const AuthContext = createContext(null);

function getStoredAuth() {
  const token = localStorage.getItem('jabm_token');
  const userRaw = localStorage.getItem('jabm_user');
  if (token && userRaw) {
    try {
      return { token, user: JSON.parse(userRaw) };
    } catch {
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

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await loginService(email, password);
      const { access_token, user: userData } = response.data;

      localStorage.setItem('jabm_token', access_token);
      localStorage.setItem('jabm_user', JSON.stringify(userData));

      setAuth({ token: access_token, user: userData });
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Error al iniciar sesión';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jabm_token');
    localStorage.removeItem('jabm_user');
    setAuth(null);
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
