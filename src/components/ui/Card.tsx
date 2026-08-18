import type { ReactNode } from 'react';
import { cx } from '../../utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cx(
        'card',
        hover &&
          'hover:shadow-card-hover hover:border-mcd-red/20 hover:-translate-y-0.5 dark:hover:border-mcd-red/25',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div
      className={cx(
        'px-5 pt-4 pb-3 border-b border-mcd-gray-100/80 dark:border-mcd-gray-700/40 flex items-start justify-between gap-3',
        className
      )}
    >
      <div>
        <h3 className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50">{title}</h3>
        {subtitle && (
          <p className="text-sm text-mcd-gray-500 dark:text-mcd-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cx('p-5', className)}>{children}</div>;
}
