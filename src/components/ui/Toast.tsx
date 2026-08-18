import { useCallback, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cx } from '../../utils';
import { ToastContext, type ToastInput } from './toast-context';

interface ToastItem {
  id: number;
  title: string;
  desc?: string;
  variant: NonNullable<ToastInput['variant']>;
}

const DURATION = 4000;

const variantIcon = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

const variantColor = {
  success: 'text-accent-green',
  error: 'text-mcd-red',
  info: 'text-mcd-gray-400 dark:text-mcd-gray-300',
};

const variantBorder = {
  success: 'border-accent-green/30',
  error: 'border-mcd-red/30',
  info: 'border-mcd-gray-200/80 dark:border-mcd-gray-700/60',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const push = useCallback((toast: ToastInput) => {
    counter.current += 1;
    const id = counter.current;
    const item: ToastItem = { id, title: toast.title, desc: toast.desc, variant: toast.variant ?? 'info' };
    setToasts((prev) => [...prev, item]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DURATION);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-3 px-4 lg:bottom-6 lg:items-end">
        {toasts.map((t) => {
          const Icon = variantIcon[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={cx(
                "pointer-events-auto animate-toast-in relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border bg-white/90 p-4 shadow-xl shadow-black/5 backdrop-blur-md dark:bg-mcd-gray-900/90",
                variantBorder[t.variant]
              )}
            >
              {/* Progress bar */}
              <div 
                className={cx(
                  "absolute bottom-0 left-0 h-0.5 animate-progress-fill",
                  t.variant === 'success' ? 'bg-accent-green' : t.variant === 'error' ? 'bg-mcd-red' : 'bg-mcd-gray-400'
                )}
                style={{ '--progress': '100%' } as any}
                onAnimationEnd={() => dismiss(t.id)}
              />
              
              <Icon className={cx('mt-0.5 h-5 w-5 shrink-0', variantColor[t.variant])} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-mcd-gray-900 dark:text-mcd-gray-50">
                  {t.title}
                </div>
                {t.desc && (
                  <div className="mt-1 text-xs text-mcd-gray-500 dark:text-mcd-gray-400 leading-relaxed">
                    {t.desc}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-lg p-1.5 text-mcd-gray-400 transition-colors hover:bg-mcd-gray-100 hover:text-mcd-gray-600 dark:hover:bg-mcd-gray-800 dark:hover:text-mcd-gray-300"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
