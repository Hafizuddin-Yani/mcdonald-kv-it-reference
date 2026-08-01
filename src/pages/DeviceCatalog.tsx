import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Search, Monitor, Tv, Smartphone, Headphones, Wifi, Cpu, ArrowRight } from 'lucide-react';
import type { Device } from '../types';
import devicesData from '../data/devices.json';

const devices = devicesData as unknown as Device[];

const categories = ['All', 'POS', 'Kitchen', 'Customer-facing', 'Drive-thru', 'Network'];

export default function DeviceCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'POS': return <Monitor className="w-5 h-5" />;
      case 'Kitchen': return <Tv className="w-5 h-5" />;
      case 'Customer-facing': return <Smartphone className="w-5 h-5" />;
      case 'Drive-thru': return <Headphones className="w-5 h-5" />;
      case 'Network': return <Wifi className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'POS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Kitchen': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Customer-facing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Drive-thru': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Network': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch = 
        device.shortName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        device.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || device.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { All: devices.length };
    devices.forEach((device) => {
      counts[device.category] = (counts[device.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Device <span className="text-[#FFC72C]">Encyclopedia</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
            Comprehensive reference for IT hardware across McDonald's KV restaurants. 
            Browse specifications, naming conventions, and common issues.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 p-4 bg-[#111111] rounded-2xl border border-white/5 backdrop-blur-md">
          {categories.map((cat) => (
            stats[cat] !== undefined && (
              <div key={`stat-${cat}`} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-white/5">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{cat}</span>
                <span className="text-sm font-bold text-[#FFC72C]">{stats[cat]}</span>
              </div>
            )
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-[#111111] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DA291C] focus:border-transparent transition-all"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 gap-2 snap-x hide-scrollbar">
            {categories.map((category) => (
              <button
                key={`filter-${category}`}
                onClick={() => setSelectedCategory(category)}
                className={`snap-start whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#DA291C] text-white shadow-[0_0_15px_rgba(218,41,28,0.3)]'
                    : 'bg-[#111111] text-gray-400 hover:bg-white/5 border border-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device) => (
              <Link 
                key={device.shortName} 
                to={`/devices/${device.shortName.toLowerCase()}`}
                className="group block bg-[#111111] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#DA291C]/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[#DA291C]/10 overflow-hidden relative"
              >
                {/* Background Accent */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#DA291C] rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`p-3 rounded-xl border ${getCategoryColor(device.category)}`}>
                    {getCategoryIcon(device.category)}
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(device.category)}`}>
                    {device.category}
                  </span>
                </div>
                
                <div className="space-y-2 relative z-10">
                  <h2 className="text-3xl font-black text-white tracking-tight group-hover:text-[#FFC72C] transition-colors">
                    {device.shortName}
                  </h2>
                  <h3 className="text-sm font-medium text-gray-400 line-clamp-1">
                    {device.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 pt-2 line-clamp-2 min-h-[2.5rem]">
                    {device.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-[#DA291C] font-semibold text-sm group-hover:text-[#FFC72C] transition-colors relative z-10">
                  View Details <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-[#111111] rounded-2xl border border-white/5">
            <Search className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No devices found</h3>
            <p className="text-gray-500">Try adjusting your search query or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
