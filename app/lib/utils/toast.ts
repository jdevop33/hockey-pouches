'use client';

import { useToast } from '@/hooks/use-toast';

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'success' | 'destructive';
  duration?: number;
}

export function useShowToast() {
  const { toast } = useToast();

  return {
    showToast: ({ title, description, variant = 'default', duration = 3000 }: ToastOptions) => {
      toast({
        variant,
        title,
        description,
        duration,
      });
    },
  };
}
