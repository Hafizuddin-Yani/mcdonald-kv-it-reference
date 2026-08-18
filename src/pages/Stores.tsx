import { useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { Reveal } from '../components/ui/Reveal';
import { StoreCard } from '../components/stores/StoreCard';
import { stores, districtLabels } from '../data/stores';
import { EmptyState } from '../components/ui/EmptyState';
import type { District } from '../types';

export default function Stores() {
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState<District | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stores.filter((s) => {
      if (district !== 'ALL' && s.district !== district) return false;
      if (!q) return true;
      return (
        s.number.includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
      );
    });
  }, [query, district]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Stores Directory"
        subtitle={`${stores.length} Klang Valley stores. Click a store to see device inventory, contacts and layout.`}
      />

      <div className="mb-6 space-y-4">
        <div className="max-w-md">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by store #, name or district…"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDistrict('ALL')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              district === 'ALL'
                ? 'bg-gradient-to-br from-mcd-red to-mcd-red-dark text-white shadow-glow-red-sm scale-105'
                : 'bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700/80 text-mcd-gray-600 dark:text-mcd-gray-300 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-700'
            }`}
          >
            All Stores
          </button>
          {Object.entries(districtLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDistrict(key as District)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                district === key
                  ? 'bg-gradient-to-br from-mcd-red to-mcd-red-dark text-white shadow-glow-red-sm scale-105'
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
          title="No stores found"
          message="Try a different search or district filter."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((store, i) => (
            <Reveal key={store.id} delay={Math.min(i * 40, 240)}>
              <StoreCard store={store} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
