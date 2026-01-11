import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { storage } from '@/services/storage';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string, pincode: string) => Promise<void>;
  register: (name: string, pincode: string, role: 'student' | 'mentor') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored auth on mount
  useEffect(() => {
    async function loadAuth() {
      try {
        const [storedUser, storedToken] = await Promise.all([
          storage.getUser(),
          storage.getToken(),
        ]);

        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
          api.setToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading auth:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuth();
  }, []);

  const login = useCallback(async (name: string, pincode: string) => {
    const response = await api.login(name, pincode);

    setUser(response.user);
    setToken(response.token);
    api.setToken(response.token);

    await Promise.all([
      storage.setUser(response.user),
      storage.setToken(response.token),
    ]);
  }, []);

  const register = useCallback(async (name: string, pincode: string, role: 'student' | 'mentor') => {
    const response = await api.register(name, pincode, role);

    setUser(response.user);
    setToken(response.token);
    api.setToken(response.token);

    await Promise.all([
      storage.setUser(response.user),
      storage.setToken(response.token),
    ]);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      // Ignore logout errors
    }

    setUser(null);
    setToken(null);
    api.setToken(null);

    await storage.clearAll();
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
