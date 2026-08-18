import type { ReactNode } from 'react';

interface SectionProps {
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Section({ title, children, action, className }: SectionProps) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-mcd-gray-500 dark:text-mcd-gray-400">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
