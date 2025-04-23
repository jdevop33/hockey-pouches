'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the user type (matching the response from login API)
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Define the context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; // To handle initial loading of auth state
  login: (userData: User, token: string) => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  // Load auth state from localStorage on initial mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading auth state from localStorage:", error);
      // Clear potentially corrupted storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
        setIsLoading(false); // Finished loading
    }
    
  }, []);

  const login = (userData: User, token: string) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // TODO: Call the logout API endpoint if needed (/api/auth/logout)
    // Example: fetch('/api/auth/logout', { method: 'POST' });
    // Redirect to login or home page (might be handled by caller)
  };

  const value = { user, token, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
