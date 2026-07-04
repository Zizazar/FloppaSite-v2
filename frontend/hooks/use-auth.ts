// Индустриальный подход: токен управляется через React Context + localStorage
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setClientConfig } from '@hey-api/client-next';

interface AuthContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Инициализация токена из localStorage (только на клиенте)
    const stored = localStorage.getItem('auth_token');
    if (stored) setTokenState(stored);
    setIsReady(true);
  }, []);

  const setToken = useCallback((newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    } else {
      localStorage.removeItem('auth_token');
    }
    setTokenState(newToken);

    // Обновляем конфиг клиента hey-api
    setClientConfig({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      headers: newToken ? { Authorization: `Bearer ${newToken}` } : undefined,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, isReady }}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для получения токена (используется в hey-api клиенте)
export const getAuthToken = () => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('auth_token') || undefined;
};