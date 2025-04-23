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

  // Load auth state from localStorage on initial mount
  useEffect(() => {
    console.log('AuthProvider useEffect: Attempting to load state...');
    // --- TEMPORARILY DISABLED LOCALSTORAGE --- 
    /*
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      console.log('AuthProvider useEffect: Found in localStorage:', { storedToken: !!storedToken, storedUser: !!storedUser });
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('AuthProvider useEffect: State set from localStorage.');
      } else {
        console.log('AuthProvider useEffect: No valid state found in localStorage.');
      }
    } catch (error) {
      console.error("AuthProvider useEffect: Error loading auth state:", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    */
    // --- END TEMPORARY DISABLE ---
    setIsLoading(false); // Mark loading as false even if localStorage fails/is disabled
    console.log('AuthProvider useEffect: Loading finished.');
    
  }, []);

  const login = (userData: User, token: string) => {
    console.log('AuthProvider login: Setting state and localStorage');
    setToken(token);
    setUser(userData);
    try {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userData));
    } catch (error) { console.error('Failed to save auth state to localStorage:', error); }
  };

  const logout = () => {
    console.log('AuthProvider logout: Clearing state and localStorage');
    setToken(null);
    setUser(null);
    try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    } catch (error) { console.error('Failed to clear auth state from localStorage:', error); }
  };
  
  const updateUser = (updatedData: Partial<User>) => {
      console.log('AuthProvider updateUser: Updating state and localStorage');
      setUser(prevUser => {
          if (!prevUser) return null; 
          const newUser = { ...prevUser, ...updatedData };
          try {
              localStorage.setItem('authUser', JSON.stringify(newUser)); 
          } catch (error) { console.error('Failed to update user in localStorage:', error); }
          return newUser;
      });
  };

  const value = { user, token, isLoading, login, logout, updateUser }; 

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
