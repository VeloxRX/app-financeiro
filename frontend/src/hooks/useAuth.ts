import { useState, useCallback } from 'react';
import api from '@/services/api';
import { useAuthStore } from '@/store';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, logout: storeLogout, user, isAuthenticated } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.access_token, data.refresh_token);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setAuth(data.user, data.access_token, data.refresh_token);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  return { login, register, logout, loading, error, user, isAuthenticated };
}
