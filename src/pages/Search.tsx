import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router';
import Fuse from 'fuse.js';
import { Search, MapPin, Monitor, Wrench, Hash, ArrowRight } from 'lucide-react';

// Data imports
import storesData from '../data/stores.json';
import devicesData from '../data/devices.json';
import troubleshootingData from '../data/troubleshooting.json';

interface SearchResult {
  type: 'store' | 'device' | 'issue';
  id: string;
  title: string;
  subtitle: string;
  link: string;
  icon: React.ReactNode;
  categoryName: string;
  item: any;
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount & handle Ctrl+K
  useEffect(() => {
    inputRef.current?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Prepare searchable index
  const fuseInstance = useMemo(() => {
    const allItems: any[] = [];
    
    ((storesData as unknown as any[]) || []).forEach((store: any) => {
      allItems.push({
        _searchType: 'store',
        id: store.id,
        name: store.name,
        district: store.district,
        title: `${store.id} - ${store.name}`,
        description: `${store.format} Store • ${store.district}`
      });
    });

    ((devicesData as unknown as any[]) || []).forEach((device: any) => {
      allItems.push({
        _searchType: 'device',
        id: device.shortName,
        shortName: device.shortName,
        fullName: device.fullName,
        title: `${device.shortName} (${device.fullName})`,
        description: `${device.category} device`
      });
    });

    ((troubleshootingData as unknown as any[]) || []).forEach((issue: any) => {
      allItems.push({
        _searchType: 'issue',
        id: issue.id,
        title: issue.title,
        symptom: issue.symptom,
        deviceType: issue.deviceType,
        description: `Issue with ${issue.deviceType}: ${issue.symptom}`
      });
    });

    return new Fuse(allItems, {
      keys: ['name', 'shortName', 'fullName', 'title', 'description', 'district', 'symptom', 'id'],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
    });
  }, []);

  // Execute search
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const rawResults = fuseInstance.search(debouncedQuery);
    
    const formatted: SearchResult[] = rawResults.slice(0, 15).map(res => {
      const item = res.item;
      if (item._searchType === 'store') {
        return {
          type: 'store',
          id: item.id,
          title: item.title,
          subtitle: item.description,
          link: `/stores/${item.id}`,
          icon: <MapPin className="text-green-400" size={20} />,
          categoryName: 'Stores',
          item
        };
      }
      if (item._searchType === 'device') {
        return {
          type: 'device',
          id: item.id,
          title: item.title,
          subtitle: item.description,
          link: `/devices/${item.id}`,
          icon: <Monitor className="text-[#FFC72C]" size={20} />,
          categoryName: 'Devices',
          item
        };
      }
      return {
        type: 'issue',
        id: item.id,
        title: item.title,
        subtitle: item.description,
        link: `/troubleshooting?id=${item.id}`,
        icon: <Wrench className="text-blue-400" size={20} />,
        categoryName: 'Troubleshooting',
        item
      };
    });

    setResults(formatted);
  }, [debouncedQuery, fuseInstance]);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  };

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 flex flex-col items-center animate-in fade-in duration-300">
      <div className="w-full max-w-3xl space-y-8 mt-4 md:mt-12">
        
        {/* Search Input Area */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#DA291C] to-[#FFC72C] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="relative bg-[#111111] border border-white/20 rounded-2xl flex items-center p-2 shadow-2xl backdrop-blur-xl">
            <Search className="text-gray-400 ml-4 shrink-0" size={28} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search stores, devices, or issues..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-white text-xl md:text-2xl px-6 py-4 focus:outline-none placeholder-gray-500 font-light"
            />
            {query && (
              <button 
                onClick={clearSearch}
                className="text-gray-400 hover:text-white p-4 shrink-0 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="absolute right-0 -bottom-8 text-xs text-gray-500 flex items-center gap-2">
            Tip: Press <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono">Ctrl</kbd> + <kbd className="bg-white/10 px-2 py-0.5 rounded font-mono">K</kbd> anywhere to search
          </div>
        </div>

        {/* Results Area */}
        <div className="pt-4">
          {!hasQuery ? (
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Hash size={16} /> Popular Searches
              </h3>
              <div className="flex flex-wrap gap-3">
                {['COD Black Screen', 'Store 424', 'KVS Offline', 'Amerin Balakong', 'Printer Error'].map(term => (
                  <button 
                    key={term}
                    onClick={() => setQuery(term)}
                    className="bg-[#111111] border border-white/10 px-4 py-2 rounded-xl text-sm hover:border-[#FFC72C] hover:text-[#FFC72C] transition-all flex items-center gap-2"
                  >
                    <Search size={14} className="opacity-50" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {['store', 'device', 'issue'].map(type => {
                const sectionResults = results.filter(r => r.type === type);
                if (sectionResults.length === 0) return null;
                
                return (
                  <div key={type} className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-lg animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-[#222] px-4 py-2 border-b border-white/10 text-sm font-semibold text-gray-400 flex items-center gap-2">
                      {sectionResults[0].categoryName}
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{sectionResults.length}</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {sectionResults.map(result => (
                        <Link
                          key={result.id}
                          to={result.link}
                          className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                        >
                          <div className="p-3 bg-[#111111] rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                            {result.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-lg truncate group-hover:text-[#FFC72C] transition-colors">{result.title}</h4>
                            <p className="text-sm text-gray-400 truncate">{result.subtitle}</p>
                          </div>
                          <ArrowRight className="text-gray-600 group-hover:text-white transition-colors shrink-0" size={20} />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-white/10">
              <Search className="mx-auto text-gray-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                We couldn't find anything matching "<span className="text-white font-medium">{query}</span>". 
                Try adjusting your search terms or check for typos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
