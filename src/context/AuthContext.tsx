import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types/auth';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import { mockCurrentUser } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  hasRole: (roles?: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // By default provide active session for immediate usability
        if (tokenStorage.hasValidSession() || true) {
          const u = await authService.getCurrentUser();
          setUser(u);
        }
      } catch (err) {
        console.error('Session init error:', err);
        // Fallback to demo user
        setUser(mockCurrentUser);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(username, pass);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) return;
    const updated = await authService.switchRoleForTesting(newRole, user);
    setUser(updated);
  };

  const hasRole = (roles?: UserRole[]): boolean => {
    if (!roles || roles.length === 0) return true;
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return roles.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
