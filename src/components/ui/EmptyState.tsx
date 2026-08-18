import { Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-mcd-gray-100/80 dark:bg-mcd-gray-800/60 mb-4">
        <Search className="w-6 h-6 text-mcd-gray-400 dark:text-mcd-gray-500" />
      </div>
      <h3 className="font-display text-lg font-bold text-mcd-gray-900 dark:text-mcd-gray-50">{title}</h3>
      <p className="mt-1.5 text-sm text-mcd-gray-500 dark:text-mcd-gray-400 max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}
