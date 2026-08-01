import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Wrench, ShieldAlert } from 'lucide-react';
import type { TroubleshootingEntry } from '../types';

import troubleshootingData from '../data/troubleshooting.json';

const severityConfig = {
  critical: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: ShieldAlert },
  high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertTriangle },
  medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle },
  low: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Info },
};

const TroubleshootingCard: React.FC<{ entry: TroubleshootingEntry }> = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[entry.severity] || severityConfig.low;
  const Icon = config.icon;

  return (
    <div className={`bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden transition-all duration-300 ${expanded ? 'shadow-xl shadow-black/50 border-white/20' : 'hover:border-white/20 hover:bg-[#1f1f1f]'}`}>
      <div 
        className="p-4 cursor-pointer flex gap-4 items-start"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`p-2 rounded-lg border ${config.color} shrink-0 mt-1`}>
          <Icon size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 items-center mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FFC72C] bg-[#FFC72C]/10 px-2 py-0.5 rounded-full">
              {entry.deviceType}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
              {entry.severity}
            </span>
          </div>
          <h3 className="text-white font-semibold text-lg leading-tight mb-1">{entry.title}</h3>
          <p className="text-gray-400 text-sm line-clamp-1">{entry.symptom}</p>
        </div>
        
        <button className="text-gray-500 hover:text-white transition-colors shrink-0 p-1">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 pt-0 border-t border-white/10 bg-[#111111]/50 space-y-4 text-sm mt-2">
          <div className="mt-4">
            <h4 className="text-gray-400 font-semibold mb-1 uppercase text-xs">Possible Cause</h4>
            <p className="text-white bg-white/5 p-3 rounded-lg border border-white/5">{entry.possibleCause}</p>
          </div>
          <div>
            <h4 className="text-[#DA291C] font-semibold mb-1 uppercase text-xs flex items-center gap-1">
              <Wrench size={14} /> Resolution Steps
            </h4>
            <div className="text-white bg-white/5 p-3 rounded-lg border border-[#DA291C]/20 whitespace-pre-wrap leading-relaxed">
              {entry.resolution}
            </div>
          </div>
          {entry.escalation && (
            <div>
              <h4 className="text-[#FFC72C] font-semibold mb-1 uppercase text-xs">Escalation Path</h4>
              <p className="text-gray-300 bg-[#FFC72C]/5 p-3 rounded-lg border border-[#FFC72C]/20">{entry.escalation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TroubleshootingPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterDevice, setFilterDevice] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'severity' | 'deviceType' | 'alphabetical'>('severity');

  // Fallback data
  const defaultData: TroubleshootingEntry[] = [
    { id: '1', deviceType: 'COD', title: 'Black Screen on Boot', symptom: 'COD displays no video output but power LED is on.', possibleCause: 'Loose HDMI cable or failed logic board.', resolution: '1. Check power adapter.\n2. Reseat HDMI cable.\n3. Hard reset device.', escalation: 'Replace COD logic board via vendor.', severity: 'critical' },
    { id: '2', deviceType: 'POS', title: 'Receipt Printer Offline', symptom: 'POS shows printer offline error.', possibleCause: 'Network drop or out of paper.', resolution: '1. Check paper roll.\n2. Restart printer.\n3. Ping printer IP.', severity: 'medium' }
  ];

  const entries = (troubleshootingData as unknown as TroubleshootingEntry[]) || defaultData;

  const deviceTypes = ['All', ...Array.from(new Set(entries.map(e => e.deviceType))).sort()];
  const severities = ['All', 'critical', 'high', 'medium', 'low'];

  const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };

  const filteredAndSorted = useMemo(() => {
    return entries
      .filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.symptom.toLowerCase().includes(search.toLowerCase());
        const matchesDevice = filterDevice === 'All' || e.deviceType === filterDevice;
        const matchesSeverity = filterSeverity === 'All' || e.severity === filterSeverity;
        return matchesSearch && matchesDevice && matchesSeverity;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          return severityWeight[b.severity] - severityWeight[a.severity];
        } else if (sortBy === 'deviceType') {
          return a.deviceType.localeCompare(b.deviceType);
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [entries, search, filterDevice, filterSeverity, sortBy]);

  const stats = useMemo(() => {
    const total = filteredAndSorted.length;
    const critical = filteredAndSorted.filter(e => e.severity === 'critical').length;
    return { total, critical };
  }, [filteredAndSorted]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#FFC72C]">Troubleshooting Base</h1>
          <p className="text-gray-400">Known issues, symptoms, and resolution paths.</p>
        </div>
        <div className="flex gap-4 text-sm font-semibold bg-[#1a1a1a] p-3 rounded-xl border border-white/10">
          <div className="flex flex-col items-center px-4 border-r border-white/10">
            <span className="text-gray-400">Total</span>
            <span className="text-xl text-white">{stats.total}</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-red-400">Critical</span>
            <span className="text-xl text-red-500">{stats.critical}</span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 shadow-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by keyword or symptom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#DA291C] focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-gray-400 mb-1 block">Device Type</label>
            <div className="flex flex-wrap gap-2">
              {deviceTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterDevice(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                    filterDevice === type 
                      ? 'bg-[#DA291C] text-white border-[#DA291C]' 
                      : 'bg-[#111111] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Severity</label>
              <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC72C] capitalize"
              >
                {severities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFC72C]"
              >
                <option value="severity">Severity</option>
                <option value="deviceType">Device Type</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="space-y-4">
        {filteredAndSorted.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredAndSorted.map(entry => (
              <TroubleshootingCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#1a1a1a] rounded-xl border border-white/10">
            <Search className="mx-auto text-gray-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">No issues found</h3>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default TroubleshootingPage;
