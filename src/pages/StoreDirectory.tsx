import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, MapPin, Monitor, ChevronRight, Filter, Store as StoreIcon, AlertCircle } from 'lucide-react';
import type { Store } from '../types';
import storesData from '../data/stores.json';

const stores = storesData as unknown as Store[];

const FORMAT_COLORS: Record<string, string> = {
  'DT': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Mall': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Standalone': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'default': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

export default function StoreDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  const districts = useMemo(() => {
    const uniqueDistricts = Array.from(new Set(stores.map(s => s.district))).filter(Boolean).sort();
    return ['All', ...uniqueDistricts];
  }, []);

  const formats = ['All', 'DT', 'Mall', 'Standalone'];

  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      const matchesSearch = 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (store.district && store.district.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFormat = selectedFormat === 'All' || store.format === selectedFormat;
      const matchesDistrict = selectedDistrict === 'All' || store.district === selectedDistrict;

      return matchesSearch && matchesFormat && matchesDistrict;
    });
  }, [searchQuery, selectedFormat, selectedDistrict]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8" id="store-directory-page">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Store <span className="text-[#FFC72C]">Directory</span>
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Browse and manage all McDonald's KV IT deployments. Use the filters below to find specific stores or districts quickly.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-6 shadow-xl space-y-6" id="filters-container">
          
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#FFC72C] transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              id="search-input"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFC72C]/50 focus:border-[#FFC72C] transition-all"
              placeholder="Search by store name, ID, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Format Filters */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400 font-medium px-1">
                <Filter className="w-4 h-4" />
                Format
              </div>
              <div className="flex flex-wrap gap-2" id="format-filters">
                {formats.map(format => (
                  <button
                    key={`format-${format}`}
                    id={`filter-format-${format}`}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border min-w-[44px] min-h-[44px] ${
                      selectedFormat === format
                        ? 'bg-[#DA291C] text-white border-[#DA291C] shadow-[0_0_15px_rgba(218,41,28,0.3)]'
                        : 'bg-[#1a1a1a] text-gray-400 border-white/5 hover:bg-[#222] hover:border-white/10'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* District Filter */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-400 font-medium px-1">
                <MapPin className="w-4 h-4" />
                District
              </div>
              <div className="relative">
                <select
                  id="district-select"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full appearance-none bg-[#1a1a1a] border border-white/5 rounded-lg py-3 px-4 pr-10 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFC72C]/50 focus:border-[#FFC72C] transition-all min-h-[44px] cursor-pointer"
                >
                  {districts.map(d => (
                    <option key={`district-${d}`} value={d}>{d}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-gray-400 px-2" id="results-info">
          <span>Showing <strong className="text-white">{filteredStores.length}</strong> stores</span>
        </div>

        {/* Store Grid */}
        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="store-grid">
            {filteredStores.map((store, idx) => (
              <Link 
                to={`/stores/${store.id}`} 
                key={store.id}
                id={`store-card-${store.id}`}
                className="group relative bg-[#111111]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-[#1a1a1a] hover:border-[#FFC72C]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:-translate-y-1 block"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
              >
                {/* Number Badge */}
                <div className="absolute top-6 right-6 font-mono text-[#FFC72C] font-bold text-sm bg-[#FFC72C]/10 px-3 py-1 rounded-full border border-[#FFC72C]/20">
                  #{store.id}
                </div>

                <div className="space-y-4">
                  {/* Title & Format */}
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#FFC72C] transition-colors pr-16 line-clamp-2">
                      {store.name}
                    </h3>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${FORMAT_COLORS[store.format] || FORMAT_COLORS.default}`}>
                        {store.format}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 pt-2 text-sm text-gray-400">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{store.district || 'Unknown District'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-gray-500" />
                      <span>{store.devices?.length || 0} Devices</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StoreIcon className="w-4 h-4 text-gray-500" />
                      <span>Verified: {store.lastVerified ? new Date(store.lastVerified).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                  <div className="bg-[#DA291C] p-2 rounded-full text-white">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#111111]/50 border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4" id="empty-state">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-gray-500 mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No stores found</h3>
            <p className="text-gray-400 max-w-md">
              We couldn't find any stores matching your current search and filters. Try adjusting them to see more results.
            </p>
            <button 
              id="clear-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedFormat('All');
                setSelectedDistrict('All');
              }}
              className="mt-4 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <style>{`
        #store-grid > a {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        @keyframes fade-in-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
