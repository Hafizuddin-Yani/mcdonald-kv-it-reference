import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastInput {
  title: string;
  desc?: string;
  variant?: ToastVariant;
}

export const ToastContext = createContext<(toast: ToastInput) => void>(() => {});
