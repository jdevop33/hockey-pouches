'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { monitoring } from '@/lib/monitoring';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount - SIMPLIFIED VERSION
  useEffect(() => {
    console.log('AuthProvider useEffect: Checking authentication status...');

    const checkAuthStatus = async () => {
      try {
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('authUser');
        const storedToken = localStorage.getItem('authToken');

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          console.log('AuthProvider: User found in localStorage');

          setUser(userData);
          setToken(storedToken);
          setIsAuthenticated(true);

          // Optionally verify with server in background, but don't block UI
          fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify({ userId: userData.id }),
          }).catch(err => {
            console.warn('Background token verification failed:', err);
            // We don't logout here to prevent disrupting the user experience
            // The next API call that fails with 401 will trigger a logout
          });
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        // Clear potentially corrupted storage
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData: User, token: string) => {
    console.log('AuthProvider login: Setting authenticated state');
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);

    // Track user in monitoring
    monitoring.setUser({
      id: userData.id,
      email: userData.email,
      username: userData.name,
    });

    // Set user role as a tag
    monitoring.setTag('user.role', userData.role);

    try {
      // Store both user data and token in localStorage
      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Failed to save auth data to localStorage:', error);
      monitoring.trackError(error as Error, { action: 'login_storage' });
    }
  };

  const logout = async () => {
    console.log('AuthProvider logout: Clearing authentication state');

    // Clear state immediately for better UX
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // Clear user from monitoring
    monitoring.clearUser();
    monitoring.setTag('user.role', 'anonymous');

    try {
      // Clear localStorage
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Failed to clear auth data from localStorage:', error);
      monitoring.trackError(error as Error, { action: 'logout_storage' });
    }

    // Call the logout API in the background
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to call logout API:', error);
      monitoring.trackError(error as Error, { action: 'logout_api' });
      // Non-critical error, user is already logged out in the UI
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    console.log('AuthProvider updateUser: Updating user state');
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };

      try {
        // Only update the user data in localStorage, keep the token as is
        localStorage.setItem('authUser', JSON.stringify(newUser));
      } catch (error) {
        console.error('Failed to update user in localStorage:', error);
      }

      return newUser;
    });
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('CRITICAL: useAuth called outside of AuthProvider!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
