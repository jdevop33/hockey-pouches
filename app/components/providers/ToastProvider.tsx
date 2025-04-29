'use client';

import * as React from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from '../ui/Toast';
import { useToast } from '@/hooks/useToast';

export function ToastProvider() {
  const { toasts } = useToast();

  return (
    <RadixToastProvider>
      {Array.from(toasts.entries()).map(([id, toast]) => (
        <Toast key={id} variant={toast.variant}>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          <ToastDescription>{toast.description}</ToastDescription>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </RadixToastProvider>
  );
}
