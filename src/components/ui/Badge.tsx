import type { ReactNode } from 'react';
import { cx } from '../../utils';

const variants = {
  red: 'bg-gradient-to-br from-mcd-red/10 to-mcd-red/5 text-mcd-red border border-mcd-red/15 dark:from-mcd-red/20 dark:to-mcd-red/10 dark:text-mcd-red-light dark:border-mcd-red/25',
  yellow: 'bg-gradient-to-br from-mcd-yellow/20 to-mcd-yellow/10 text-mcd-yellow-dark border border-mcd-yellow/20 dark:from-mcd-yellow/15 dark:to-mcd-yellow/5 dark:text-mcd-yellow dark:border-mcd-yellow/20',
  green: 'bg-gradient-to-br from-accent-green/15 to-accent-green/5 text-accent-green-dark border border-accent-green/20 dark:from-accent-green/20 dark:to-accent-green/10 dark:text-accent-green-light dark:border-accent-green/20',
  gray: 'bg-gradient-to-br from-mcd-gray-100 to-mcd-gray-50 text-mcd-gray-600 border border-mcd-gray-200/80 dark:from-mcd-gray-800/80 dark:to-mcd-gray-800/40 dark:text-mcd-gray-300 dark:border-mcd-gray-700/60',
  blue: 'bg-gradient-to-br from-accent-blue/15 to-accent-blue/5 text-accent-blue-dark border border-accent-blue/20 dark:from-accent-blue/20 dark:to-accent-blue/10 dark:text-accent-blue-light dark:border-accent-blue/20',
};

type BadgeVariant = keyof typeof variants;

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = 'gray', className, dot }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-sm',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cx(
            'w-1.5 h-1.5 rounded-full',
            variant === 'red' && 'bg-mcd-red',
            variant === 'yellow' && 'bg-mcd-yellow-dark',
            variant === 'green' && 'bg-accent-green',
            variant === 'blue' && 'bg-accent-blue',
            variant === 'gray' && 'bg-mcd-gray-400'
          )}
        />
      )}
      {children}
    </span>
  );
}
