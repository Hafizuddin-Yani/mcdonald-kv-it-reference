import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import type { DeviceType } from '../../types';
import { formatCategory } from '../../utils';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { DeviceImage } from './DeviceImage';

interface DeviceCardProps {
  device: DeviceType;
}

const categoryAccent: Record<string, string> = {
  POS: 'from-blue-500 to-blue-400',
  KDS: 'from-emerald-500 to-emerald-400',
  COD: 'from-purple-500 to-purple-400',
  KVS: 'from-orange-500 to-orange-400',
  DRIVE_THRU: 'from-mcd-red to-mcd-red-light',
  NETWORK: 'from-cyan-500 to-cyan-400',
  KIOSK: 'from-amber-500 to-amber-400',
  PERIPHERAL: 'from-pink-500 to-pink-400',
  OTHER: 'from-gray-500 to-gray-400',
};

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <Link to={`/devices/${device.id}`} className="block">
      <Card hover className="h-full group overflow-hidden">
        {/* Category accent */}
        <div className={`h-1 w-full bg-gradient-to-r ${categoryAccent[device.category] ?? 'from-gray-400 to-gray-300'}`} />
        <DeviceImage
          device={device}
          className="h-36 w-full"
          alt={device.fullName}
        />
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-mcd-red font-mono">
                  {device.shortName}
                </span>
                <Badge variant="gray">{formatCategory(device.category)}</Badge>
              </div>
              <h3 className="mt-1 font-semibold text-mcd-gray-800 dark:text-mcd-gray-200">
                {device.fullName}
              </h3>
            </div>
            <ChevronRight className="w-4 h-4 text-mcd-gray-300 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:text-mcd-red" />
          </div>

          <p className="mt-2 text-sm text-mcd-gray-600 dark:text-mcd-gray-300 line-clamp-3 leading-relaxed">
            {device.description}
          </p>

          <div className="mt-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-mcd-gray-400 mb-1.5">
              Typical locations
            </div>
            <div className="flex flex-wrap gap-1.5">
              {device.typicalLocations.slice(0, 3).map((loc) => (
                <Badge key={loc} variant="blue">
                  {loc}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
