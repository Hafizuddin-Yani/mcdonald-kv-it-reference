import { useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { Reveal } from '../components/ui/Reveal';
import { DeviceCard } from '../components/devices/DeviceCard';
import { EmptyState } from '../components/ui/EmptyState';
import { deviceTypes, deviceCategories } from '../data/deviceTypes';
import type { DeviceCategory } from '../types';

export default function Devices() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DeviceCategory | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deviceTypes.filter((d) => {
      if (category !== 'ALL' && d.category !== category) return false;
      if (!q) return true;
      return (
        d.shortName.toLowerCase().includes(q) ||
        d.fullName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.typicalLocations.some((l) => l.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Device Catalog"
        subtitle={`${deviceTypes.length} device types used in Klang Valley stores. Learn the short name, where it lives and how it's labelled.`}
      />

      <div className="mb-8 space-y-4">
        <div className="max-w-md">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by short name, full name or location…" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              category === 'ALL'
                ? 'bg-gradient-to-br from-mcd-gray-900 to-mcd-gray-700 text-white shadow-md scale-105 dark:from-white dark:to-mcd-gray-200 dark:text-mcd-gray-900'
                : 'bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700/80 text-mcd-gray-600 dark:text-mcd-gray-300 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-700'
            }`}
          >
            All Devices
          </button>
          {Object.entries(deviceCategories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setCategory(key as DeviceCategory)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                category === key
                  ? 'bg-gradient-to-br from-mcd-gray-900 to-mcd-gray-700 text-white shadow-md scale-105 dark:from-white dark:to-mcd-gray-200 dark:text-mcd-gray-900'
                  : 'bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700/80 text-mcd-gray-600 dark:text-mcd-gray-300 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No devices found"
          message="Try a different search or category filter."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((device, i) => (
            <Reveal key={device.id} delay={Math.min(i * 30, 240)}>
              <DeviceCard device={device} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
