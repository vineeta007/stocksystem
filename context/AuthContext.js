'use client';
// context/AuthContext.js
// Wrap your app layout with <AuthProvider> to give all client components
// access to the current user via useAuth().

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hasPermission } from '@/lib/roles';

const AuthContext = createContext(null);

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  // Re-fetch session on mount (useful after page refresh)
  useEffect(() => {
    if (initialUser) return;
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialUser]);

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  }, []);

  const can = useCallback(
    (permission) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state anywhere in a client component.
 *
 * const { user, can, logout } = useAuth();
 * if (can(PERMISSIONS.EDIT_STOCK_IN)) { ... }
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}