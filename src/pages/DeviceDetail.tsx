import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, AlertTriangle, AlertCircle, ShieldAlert, Cpu, Monitor, Tv, Smartphone, Headphones, Wifi, Wrench, ChevronDown, ChevronUp, Store as StoreIcon } from 'lucide-react';
import type { Device, Store, TroubleshootingEntry } from '../types';
import devicesData from '../data/devices.json';
import storesData from '../data/stores.json';
import troubleshootingData from '../data/troubleshooting.json';

const devices = devicesData as unknown as Device[];
const stores = storesData as unknown as Store[];
const troubleshooting = troubleshootingData as unknown as TroubleshootingEntry[];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'POS': return <Monitor className="w-8 h-8 md:w-12 md:h-12" />;
    case 'Kitchen': return <Tv className="w-8 h-8 md:w-12 md:h-12" />;
    case 'Customer-facing': return <Smartphone className="w-8 h-8 md:w-12 md:h-12" />;
    case 'Drive-thru': return <Headphones className="w-8 h-8 md:w-12 md:h-12" />;
    case 'Network': return <Wifi className="w-8 h-8 md:w-12 md:h-12" />;
    default: return <Cpu className="w-8 h-8 md:w-12 md:h-12" />;
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

const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case 'low': return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
    case 'medium': return { icon: AlertTriangle, color: 'text-[#FFC72C]', bg: 'bg-[#FFC72C]/10', border: 'border-[#FFC72C]/20' };
    case 'high': return { icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
    case 'critical': return { icon: AlertTriangle, color: 'text-[#DA291C]', bg: 'bg-[#DA291C]/10', border: 'border-[#DA291C]/20' };
    default: return { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };
  }
};

export default function DeviceDetail() {
  const { type } = useParams<{ type: string }>();
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const device = useMemo(() => {
    return devices.find(d => d.shortName.toLowerCase() === type?.toLowerCase());
  }, [type]);

  const storesWithDevice = useMemo(() => {
    if (!device) return [];
    return stores.filter(s => s.devices.some(d => d.type === device.shortName)).map(s => ({
      ...s,
      count: s.devices.filter(d => d.type === device.shortName).length
    }));
  }, [device]);

  const commonIssues = useMemo(() => {
    if (!device) return [];
    return troubleshooting.filter(issue => issue.deviceType === device.shortName);
  }, [device]);

  if (!device) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col items-center justify-center p-4">
        <Monitor className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Device Not Found</h1>
        <p className="text-gray-400 mb-6">The device type "{type}" does not exist in our records.</p>
        <Link to="/devices" className="px-6 py-3 bg-[#DA291C] hover:bg-[#a11e14] text-white rounded-xl font-medium transition-colors">
          Return to Encyclopedia
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation */}
        <Link to="/devices" className="inline-flex items-center text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Encyclopedia
        </Link>

        {/* Header */}
        <div className="relative bg-[#111111] rounded-3xl p-6 md:p-10 border border-white/10 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#DA291C]/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center relative z-10">
            <div className={`p-5 rounded-2xl border ${getCategoryColor(device.category)} backdrop-blur-md`}>
              {getCategoryIcon(device.category)}
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{device.shortName}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getCategoryColor(device.category)}`}>
                  {device.category}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl text-gray-400 font-medium">{device.fullName}</h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl pt-2">
                {device.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Naming Convention */}
            <section className="bg-[#111111] rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-[#FFC72C]" /> Naming Pattern
              </h3>
              <div className="space-y-4">
                <div className="bg-black/50 p-4 rounded-xl border border-white/10">
                  <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider block mb-1">Pattern</span>
                  <code className="text-lg text-[#DA291C] font-mono font-bold">{device.namingPattern || 'N/A'}</code>
                </div>
                {device.namingPattern && (
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-white/5 text-gray-300 font-mono text-sm rounded-lg border border-white/10">
                      {device.namingPattern.replace(/\[num\]|\[id\]|\[x\]/gi, '01').replace(/\[Store\]|\[StoreID\]/gi, '0001')}
                    </span>
                    <span className="px-3 py-1.5 bg-white/5 text-gray-300 font-mono text-sm rounded-lg border border-white/10">
                      {device.namingPattern.replace(/\[num\]|\[id\]|\[x\]/gi, '02').replace(/\[Store\]|\[StoreID\]/gi, '0001')}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Common Issues */}
            <section className="bg-[#111111] rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-[#FFC72C]" /> Common Issues & Troubleshooting
              </h3>
              
              {commonIssues.length > 0 ? (
                <div className="space-y-3">
                  {commonIssues.map((issue) => {
                    const isExpanded = expandedIssue === issue.id;
                    const style = getSeverityStyle(issue.severity);
                    const SeverityIcon = style.icon;

                    return (
                      <div key={issue.id} className={`rounded-xl border transition-all duration-300 ${isExpanded ? 'bg-black/40 border-white/20' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                        <button 
                          className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none"
                          onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`p-1.5 rounded-lg ${style.bg} ${style.color}`}>
                              <SeverityIcon className="w-4 h-4" />
                            </span>
                            <span className="font-semibold text-white">{issue.title}</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4">
                            <div>
                              <strong className="text-gray-400 text-sm block mb-1">Symptom</strong>
                              <p className="text-gray-200 text-sm">{issue.symptom}</p>
                            </div>
                            <div>
                              <strong className="text-gray-400 text-sm block mb-1">Likely Cause</strong>
                              <p className="text-gray-200 text-sm">{issue.possibleCause}</p>
                            </div>
                            <div className="bg-[#0a0a0a] p-3 rounded-lg border border-white/5">
                              <strong className="text-[#DA291C] text-sm block mb-1">Resolution Steps</strong>
                              <p className="text-gray-200 text-sm">{issue.resolution}</p>
                            </div>
                            {issue.escalation && (
                              <div>
                                <strong className="text-gray-400 text-sm block mb-1">Escalation Path</strong>
                                <p className="text-gray-300 text-sm italic">{issue.escalation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No common issues documented for this device.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Typical Locations */}
            <section className="bg-[#111111] rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#FFC72C]" /> Locations
              </h3>
              <ul className="space-y-2">
                {device.typicalLocations?.map((loc, idx) => (
                  <li key={idx} className="flex items-start text-gray-300 bg-black/30 p-3 rounded-xl border border-white/5">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 shrink-0" />
                    <span>{loc}</span>
                  </li>
                ))}
                {(!device.typicalLocations || device.typicalLocations.length === 0) && (
                  <li className="text-gray-500">Not specified</li>
                )}
              </ul>
            </section>

            {/* Specifications */}
            <section className="bg-[#111111] rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-[#FFC72C]" /> Specifications
              </h3>
              {device.specs && Object.keys(device.specs).length > 0 ? (
                <div className="space-y-0.5 rounded-xl overflow-hidden border border-white/10">
                  {Object.entries(device.specs).map(([key, val], idx) => (
                    <div key={idx} className="grid grid-cols-3 bg-black/40 p-3">
                      <div className="col-span-1 text-sm text-gray-500 font-medium">{key}</div>
                      <div className="col-span-2 text-sm text-gray-200 font-mono">{val}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No specifications available.</p>
              )}
            </section>
            
            {/* Stores using this device */}
            <section className="bg-[#111111] rounded-2xl p-6 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <StoreIcon className="w-5 h-5 mr-2 text-[#FFC72C]" /> Deployed In
              </h3>
              {storesWithDevice.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {storesWithDevice.map(store => (
                    <Link 
                      key={store.id} 
                      to={`/stores/${store.id}`}
                      className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5 hover:bg-white/5 hover:border-[#DA291C]/50 transition-colors group"
                    >
                      <div>
                        <span className="text-xs font-mono text-[#DA291C] group-hover:text-[#FFC72C] transition-colors block">#{store.id}</span>
                        <span className="text-sm font-medium text-gray-200">{store.name}</span>
                      </div>
                      <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg font-mono">
                        x{store.count}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No stores currently have this device listed.</p>
              )}
            </section>
          </div>
          
        </div>
      </div>
    </div>
  );
}
