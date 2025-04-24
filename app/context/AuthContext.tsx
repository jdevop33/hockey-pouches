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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    console.log('AuthProvider useEffect: Checking authentication status...');

    const checkAuthStatus = async () => {
      try {
        // Try to get user data from the server using the HttpOnly cookie
        const response = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include', // Important: includes cookies in the request
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('AuthProvider: User authenticated via cookie');

          // Get token from Authorization header if available
          const authHeader = response.headers.get('Authorization');
          const tokenFromHeader = authHeader ? authHeader.replace('Bearer ', '') : null;

          setUser(userData);
          setToken(tokenFromHeader);
          setIsAuthenticated(true);

          // Store user data in memory (not token)
          try {
            localStorage.setItem('authUser', JSON.stringify(userData));
          } catch (error) {
            console.error('Failed to save user data to localStorage:', error);
          }
        } else {
          console.log('AuthProvider: User not authenticated');

          // Try to get user from localStorage as fallback
          try {
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
              const userData = JSON.parse(storedUser);

              // Verify the stored user data with a server request
              const verifyResponse = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userData.id }),
                credentials: 'include',
              });

              if (verifyResponse.ok) {
                console.log('AuthProvider: User verified from localStorage');
                setUser(userData);
                setIsAuthenticated(true);
              } else {
                console.log('AuthProvider: Stored user data invalid, clearing');
                localStorage.removeItem('authUser');
              }
            }
          } catch (error) {
            console.error('Error checking localStorage user:', error);
            localStorage.removeItem('authUser');
          }
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
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

    try {
      // Only store user data, not the token (which is in HttpOnly cookie)
      localStorage.setItem('authUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user data to localStorage:', error);
    }
  };

  const logout = async () => {
    console.log('AuthProvider logout: Clearing authentication state');

    try {
      // Call the logout API to clear the HttpOnly cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Error during logout API call:', await response.text());
      }
    } catch (error) {
      console.error('Failed to call logout API:', error);
    }

    // Clear state regardless of API success
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    try {
      localStorage.removeItem('authUser');
    } catch (error) {
      console.error('Failed to clear user data from localStorage:', error);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    console.log('AuthProvider updateUser: Updating user state');
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };

      try {
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
