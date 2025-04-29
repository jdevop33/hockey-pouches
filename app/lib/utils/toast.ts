'use client';

import { toast } from '@/hooks/use-toast';

export const showSuccessToast = (message: string) => {
  toast({
    variant: 'success',
    description: message,
  });
};

export const showErrorToast = (message: string) => {
  toast({
    variant: 'destructive',
    description: message,
  });
};

export const showInfoToast = (message: string) => {
  toast({
    description: message,
  });
};

export function useShowToast() {
  return {
    showToast: (options: {
      title?: string;
      description: string;
      variant?: 'default' | 'destructive' | 'success';
    }) => {
      toast({
        title: options.title,
        description: options.description,
        variant: options.variant || 'default',
      });
    },
  };
}
