import { Link } from 'react-router';
import { MapPin, Phone, ChevronRight } from 'lucide-react';
import type { Store } from '../../types';
import { formatDistrict, formatStoreFormat, telLink } from '../../utils';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link to={`/stores/${store.id}`} className="block">
      <Card hover className="h-full group">
        {/* Top accent bar */}
        <div
          className={`h-1 w-full ${
            store.format === 'DT'
              ? 'bg-gradient-to-r from-mcd-red to-mcd-red-light'
              : 'bg-gradient-to-r from-mcd-accent-blue to-mcd-accent-blue-light'
          }`}
        />
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-display text-xl font-bold text-mcd-gray-900 dark:text-mcd-gray-50">
                  #{store.number}
                </span>
                <Badge variant={store.format === 'DT' ? 'red' : 'gray'}>
                  {formatStoreFormat(store.format)}
                </Badge>
              </div>
              <h3 className="mt-1 font-semibold text-mcd-gray-800 dark:text-mcd-gray-200">
                {store.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-mcd-gray-400 dark:text-mcd-gray-500">
                {formatDistrict(store.district)}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-mcd-gray-300 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:text-mcd-red" />
          </div>

          <div className="mt-3.5 space-y-2 text-sm text-mcd-gray-600 dark:text-mcd-gray-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-mcd-gray-400 shrink-0" />
              <span className="truncate">{store.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-mcd-gray-400 shrink-0" />
              <span>
                {store.manager.name} ·{' '}
                <a href={telLink(store.manager.phone)} className="hover:text-mcd-red transition-colors">
                  {store.manager.phone}
                </a>
              </span>
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            <Badge variant="blue">{store.devices.length} devices</Badge>
            {store.format === 'DT' && <Badge variant="yellow">Drive-Thru</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
