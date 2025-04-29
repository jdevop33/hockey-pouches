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
