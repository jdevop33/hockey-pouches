'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the user type 
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
  isLoading: boolean; 
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void; // Added updateUser function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
        setIsLoading(false); 
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
    // Consider calling API endpoint if needed
  };
  
  // Function to update user state in context and localStorage
  const updateUser = (updatedData: Partial<User>) => {
      setUser(prevUser => {
          if (!prevUser) return null; // Should not happen if called when logged in
          const newUser = { ...prevUser, ...updatedData };
          localStorage.setItem('authUser', JSON.stringify(newUser)); // Update storage
          return newUser;
      });
  };

  const value = { user, token, isLoading, login, logout, updateUser }; // Added updateUser

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
