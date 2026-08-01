import React, { useState, useMemo } from 'react';
import { ClipboardCopy, Search, CheckCircle2, ChevronRight, Hash, MapPin, Monitor, Building2 } from 'lucide-react';
import type { Device, NamingConvention } from '../types';

// Fallback data in case json doesn't load
import devicesData from '../data/devices.json';
import namingData from '../data/naming-conventions.json';

const NamingConventionPage: React.FC = () => {
  const [inputTag, setInputTag] = useState('');
  const [copied, setCopied] = useState(false);
  const [builderState, setBuilderState] = useState({
    region: 'MY',
    district: 'KV',
    store: '424',
    device: 'COD',
    index: '01'
  });

  const devices = devicesData as unknown as Device[];
  const naming = namingData as unknown as NamingConvention[];

  const decodeAssetTag = (input: string) => {
    const fullMatch = input.toUpperCase().match(/^(MY)-(\w+)-(\d{3})-(\w+)-(\d{2})$/);
    if (fullMatch) {
      return { 
        region: fullMatch[1], 
        district: fullMatch[2], 
        store: fullMatch[3], 
        type: fullMatch[4], 
        index: fullMatch[5],
        isFull: true 
      };
    }
    
    const shortMatch = input.toUpperCase().match(/^([A-Z]+)\s*(\d{1,2})?$/);
    if (shortMatch) {
      return { 
        region: '-', 
        district: '-', 
        store: '-', 
        type: shortMatch[1], 
        index: shortMatch[2] ? shortMatch[2].padStart(2, '0') : '-',
        isFull: false 
      };
    }
    
    return null;
  };

  const decoded = useMemo(() => decodeAssetTag(inputTag), [inputTag]);
  
  const getDeviceFullName = (shortName: string) => {
    return devices.find(d => d.shortName === shortName)?.fullName || 'Unknown Device';
  };

  const generatedTag = `${builderState.region}-${builderState.district}-${builderState.store}-${builderState.device}-${builderState.index}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 space-y-8 animate-in fade-in duration-300">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-[#FFC72C]">Naming Convention Reference</h1>
        <p className="text-gray-400">Decode asset tags and generate new ones according to standard convention.</p>
      </header>

      {/* Decoder Section */}
      <section className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 backdrop-blur-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <Search className="text-[#DA291C]" size={20} />
          Asset Tag Decoder
        </h2>
        
        <div className="space-y-6">
          <input
            type="text"
            placeholder="Paste an asset tag (e.g. MY-KV-424-COD-02) or short name (e.g. COD 2)..."
            value={inputTag}
            onChange={(e) => setInputTag(e.target.value)}
            className="w-full bg-[#111111] border border-white/20 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] transition-all"
          />

          {decoded ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-[#111111] border border-white/10 p-3 rounded-xl flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 mb-1"><MapPin size={12}/> Region</span>
                <span className="text-lg font-bold text-[#FFC72C]">{decoded.region}</span>
              </div>
              <div className="bg-[#111111] border border-white/10 p-3 rounded-xl flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 mb-1"><MapPin size={12}/> District</span>
                <span className="text-lg font-bold text-[#FFC72C]">{decoded.district}</span>
              </div>
              <div className="bg-[#111111] border border-white/10 p-3 rounded-xl flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 mb-1"><Building2 size={12}/> Store #</span>
                <span className="text-lg font-bold text-[#FFC72C]">{decoded.store}</span>
              </div>
              <div className="bg-[#111111] border border-white/10 p-3 rounded-xl flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 mb-1"><Monitor size={12}/> Device Type</span>
                <span className="text-lg font-bold text-[#DA291C]">{decoded.type}</span>
                <span className="text-xs text-gray-500 truncate mt-1" title={getDeviceFullName(decoded.type)}>
                  {getDeviceFullName(decoded.type)}
                </span>
              </div>
              <div className="bg-[#111111] border border-white/10 p-3 rounded-xl flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 mb-1"><Hash size={12}/> Index</span>
                <span className="text-lg font-bold text-[#FFC72C]">{decoded.index}</span>
              </div>
            </div>
          ) : inputTag.length > 0 ? (
            <div className="text-gray-400 text-sm">No valid pattern detected. Try "MY-KV-424-COD-02" or "COD 2".</div>
          ) : null}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Interactive Tag Builder */}
        <section className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 backdrop-blur-md shadow-xl flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <Monitor className="text-[#DA291C]" size={20} />
            Tag Builder
          </h2>
          
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Region</label>
                <select 
                  value={builderState.region}
                  onChange={(e) => setBuilderState({...builderState, region: e.target.value})}
                  className="w-full bg-[#111111] border border-white/20 rounded-lg px-3 py-2 text-white focus:border-[#DA291C] focus:outline-none"
                >
                  <option value="MY">MY - Malaysia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">District</label>
                <select 
                  value={builderState.district}
                  onChange={(e) => setBuilderState({...builderState, district: e.target.value})}
                  className="w-full bg-[#111111] border border-white/20 rounded-lg px-3 py-2 text-white focus:border-[#DA291C] focus:outline-none"
                >
                  <option value="KV">KV - Klang Valley</option>
                  <option value="PG">PG - Penang</option>
                  <option value="JB">JB - Johor Bahru</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Store #</label>
                <input 
                  type="text"
                  maxLength={3}
                  value={builderState.store}
                  onChange={(e) => setBuilderState({...builderState, store: e.target.value})}
                  className="w-full bg-[#111111] border border-white/20 rounded-lg px-3 py-2 text-white focus:border-[#DA291C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Index</label>
                <input 
                  type="text"
                  maxLength={2}
                  value={builderState.index}
                  onChange={(e) => setBuilderState({...builderState, index: e.target.value})}
                  className="w-full bg-[#111111] border border-white/20 rounded-lg px-3 py-2 text-white focus:border-[#DA291C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Device Type</label>
              <select 
                value={builderState.device}
                onChange={(e) => setBuilderState({...builderState, device: e.target.value})}
                className="w-full bg-[#111111] border border-white/20 rounded-lg px-3 py-2 text-white focus:border-[#DA291C] focus:outline-none"
              >
                {devices.map(d => (
                  <option key={d.shortName} value={d.shortName}>{d.shortName} - {d.fullName}</option>
                ))}
                {devices.length === 0 && <option value="COD">COD - Customer Order Display</option>}
              </select>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-2">Generated Asset Tag</div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 bg-[#111111] border border-white/20 rounded-lg px-4 py-3 font-mono text-xl text-[#FFC72C] tracking-wider text-center">
                {generatedTag}
              </div>
              <button
                onClick={() => handleCopy(generatedTag)}
                className={`p-3 rounded-lg transition-colors flex items-center justify-center border ${copied ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-[#DA291C] text-white hover:bg-[#DA291C]/80 border-[#DA291C]'}`}
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle2 size={24} /> : <ClipboardCopy size={24} />}
              </button>
            </div>
          </div>
        </section>

        {/* Reference Table */}
        <section className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 backdrop-blur-md shadow-xl flex flex-col h-full overflow-hidden">
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            <ChevronRight className="text-[#DA291C]" size={20} />
            Convention Rules
          </h2>
          <div className="overflow-auto flex-1 pr-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="py-2 font-medium">Segment</th>
                  <th className="py-2 font-medium">Pattern</th>
                  <th className="py-2 font-medium hidden sm:table-cell">Description</th>
                  <th className="py-2 font-medium">Example</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {naming.length > 0 ? (
                  naming.map((rule, idx) => (
                    <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 font-semibold text-[#FFC72C]">{rule.segment}</td>
                      <td className="py-3 pr-2 font-mono text-xs text-gray-300">{rule.pattern}</td>
                      <td className="py-3 pr-2 text-gray-400 hidden sm:table-cell">{rule.description}</td>
                      <td className="py-3 font-mono text-xs text-white">{rule.examples[0]}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 font-semibold text-[#FFC72C]">Region</td>
                      <td className="py-3 pr-2 font-mono text-xs text-gray-300">2 Letters</td>
                      <td className="py-3 pr-2 text-gray-400 hidden sm:table-cell">Country Code</td>
                      <td className="py-3 font-mono text-xs text-white">MY</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 font-semibold text-[#FFC72C]">District</td>
                      <td className="py-3 pr-2 font-mono text-xs text-gray-300">2 Letters</td>
                      <td className="py-3 pr-2 text-gray-400 hidden sm:table-cell">Area Code</td>
                      <td className="py-3 font-mono text-xs text-white">KV</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 font-semibold text-[#FFC72C]">Store #</td>
                      <td className="py-3 pr-2 font-mono text-xs text-gray-300">3 Digits</td>
                      <td className="py-3 pr-2 text-gray-400 hidden sm:table-cell">Internal ID</td>
                      <td className="py-3 font-mono text-xs text-white">424</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 font-semibold text-[#FFC72C]">Device</td>
                      <td className="py-3 pr-2 font-mono text-xs text-gray-300">3-4 Letters</td>
                      <td className="py-3 pr-2 text-gray-400 hidden sm:table-cell">Device Type</td>
                      <td className="py-3 font-mono text-xs text-white">COD</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-2 font-semibold text-[#FFC72C]">Index</td>
                      <td className="py-3 pr-2 font-mono text-xs text-gray-300">2 Digits</td>
                      <td className="py-3 pr-2 text-gray-400 hidden sm:table-cell">Sequential #</td>
                      <td className="py-3 font-mono text-xs text-white">01</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NamingConventionPage;
