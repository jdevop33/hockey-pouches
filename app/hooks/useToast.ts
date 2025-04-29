import * as React from 'react';
import { useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'success' | 'destructive';
  duration?: number;
}

const toastTimeouts = new Map<string, NodeJS.Timeout>();

export function useToast() {
  const [toasts, setToasts] = React.useState<Map<string, ToastOptions>>(new Map());

  const addToast = useCallback(
    ({ title, description, variant = 'default', duration = 3000 }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);

      setToasts(prev => {
        const next = new Map(prev);
        next.set(id, { title, description, variant });
        return next;
      });

      if (duration > 0) {
        const timeout = setTimeout(() => {
          setToasts(prev => {
            const next = new Map(prev);
            next.delete(id);
            return next;
          });
          toastTimeouts.delete(id);
        }, duration);

        toastTimeouts.set(id, timeout);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    const timeout = toastTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeouts.delete(id);
    }
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
  };
}

export type { ToastOptions };
