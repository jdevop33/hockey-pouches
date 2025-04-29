'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        const storedToken = localStorage.getItem('authToken');

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          setIsAuthenticated(true);

          // Verify token in background
          fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify({ userId: userData.id }),
          }).catch(error => {
            console.warn('Background token verification failed:', error);
            // Don't logout here - let API calls handle auth errors
          });
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        // Clear potentially corrupted storage
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      setMounted(true);
      initializeAuth();
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  const login = (userData: User, authToken: string) => {
    if (!mounted) return;

    try {
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);

      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('authToken', authToken);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!mounted) return;

    try {
      // Clear state first for better UX
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);

      // Clear storage
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');

      // Call logout API in background
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // State is already cleared, so just log the error
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!mounted) return;

    setUser(prevUser => {
      if (!prevUser) return null;

      const newUser = { ...prevUser, ...updatedData };
      try {
        localStorage.setItem('authUser', JSON.stringify(newUser));
      } catch (error) {
        console.error('Error updating user in storage:', error);
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

  // During SSR or before hydration, return a minimal wrapper
  if (!mounted) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          token: null,
          isLoading: true,
          isAuthenticated: false,
          login: () => {},
          logout: async () => {},
          updateUser: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    if (context === undefined) {
      if (typeof window !== 'undefined') {
        console.error('useAuth must be used within an AuthProvider');
      }
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        login: () => {},
        logout: async () => {},
        updateUser: () => {},
      };
    }
    return context;
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.error('Error accessing AuthContext:', error);
    }
    return {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      login: () => {},
      logout: async () => {},
      updateUser: () => {},
    };
  }
};
