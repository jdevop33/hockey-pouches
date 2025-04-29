'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/use-toast';

interface ToastContextType {
  showToast: (
    message: string,
    type?: 'default' | 'success' | 'destructive',
    duration?: number
  ) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toast, dismiss } = useToast();

  const showToast = (
    message: string,
    type: 'default' | 'success' | 'destructive' = 'default',
    duration: number = 3000
  ) => {
    toast({
      variant: type,
      description: message,
      duration,
    });
  };

  const hideToast = () => {
    dismiss();
  };

  return <ToastContext.Provider value={{ showToast, hideToast }}>{children}</ToastContext.Provider>;
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
