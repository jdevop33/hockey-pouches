'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User { id: string; name: string; email: string; role: string; }
interface AuthContextType { user: User | null; token: string | null; isLoading: boolean; login: (userData: User, token: string) => void; logout: () => void; updateUser: (updatedData: Partial<User>) => void; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    console.log('AuthProvider useEffect: Loading state (localStorage read DISABLED).');
    // --- TEMPORARILY DISABLED LOCALSTORAGE --- 
    /*
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
    }
    */
    setIsLoading(false); 
    console.log('AuthProvider useEffect: Loading finished.');
  }, []);

  const login = (userData: User, token: string) => { /* ... */ };
  const logout = () => { /* ... */ };
  const updateUser = (updatedData: Partial<User>) => { /* ... */ };

  const value = { user, token, isLoading, login, logout, updateUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => { /* ... */ };
