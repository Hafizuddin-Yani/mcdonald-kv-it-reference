import { useContext } from 'react';
import { ToastContext } from '../components/ui/toast-context';

/** Push a toast notification. No-op outside of a <ToastProvider>. */
export function useToast() {
  return useContext(ToastContext);
}
