import { Fragment } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-mcd-gray-500 dark:text-mcd-gray-400">
      <Link to="/" className="rounded px-1 py-0.5 transition-colors hover:text-mcd-red">
        Home
      </Link>
      {items.map((item, i) => (
        <Fragment key={i}>
          <ChevronRight className="h-3 w-3 text-mcd-gray-300 dark:text-mcd-gray-600" />
          {item.to ? (
            <Link
              to={item.to}
              className="rounded px-1 py-0.5 transition-colors hover:text-mcd-red"
            >
              {item.label}
            </Link>
          ) : (
            <span className="px-1 py-0.5 font-medium text-mcd-gray-700 dark:text-mcd-gray-200">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
