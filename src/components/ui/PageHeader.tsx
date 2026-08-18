import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-mcd-gray-900 dark:text-mcd-gray-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-mcd-gray-500 dark:text-mcd-gray-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
          {/* Accent line */}
          <div className="mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-mcd-red to-mcd-red/30" />
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
