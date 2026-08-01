import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import {
  ChevronLeft,
  MapPin,
  Phone,
  MessageCircle,
  Monitor,
  Tv,
  Headphones,
  Wifi,
  Network,
  Keyboard,
  TabletSmartphone,
  MonitorSmartphone,
  Router,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  AlertCircle,
  Calendar,
  Hash,
  Cpu,
} from 'lucide-react';
import type { Store, Device } from '../types';
import storesData from '../data/stores.json';
import devicesData from '../data/devices.json';

const stores = storesData as unknown as Store[];
const devices = devicesData as unknown as Device[];

const FORMAT_STYLES: Record<string, string> = {
  DT: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Mall: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Standalone: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  Airport: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  Express: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
};

const STATUS_CONFIG: Record<string, { style: string; icon: typeof CheckCircle2; label: string }> = {
  active: { style: 'text-emerald-400', icon: CheckCircle2, label: 'Active' },
  faulty: { style: 'text-red-400', icon: AlertTriangle, label: 'Faulty' },
  replaced: { style: 'text-yellow-400', icon: RotateCcw, label: 'Replaced' },
};

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  TC: Monitor,
  KVS: Tv,
  KVS_PRES: MonitorSmartphone,
  COD: MonitorSmartphone,
  DT_HEADSET: Headphones,
  DELPHI: Router,
  SWITCH: Network,
  AP: Wifi,
  BUMP_BAR: Keyboard,
  KIOSK: TabletSmartphone,
};

const CATEGORY_COLORS: Record<string, string> = {
  POS: 'text-purple-400 bg-purple-500/10',
  Kitchen: 'text-orange-400 bg-orange-500/10',
  'Customer-facing': 'text-cyan-400 bg-cyan-500/10',
  'Drive-thru': 'text-emerald-400 bg-emerald-500/10',
  Network: 'text-blue-400 bg-blue-500/10',
};

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();

  const store = useMemo(() => stores.find((s) => s.id === id), [id]);

  const deviceMeta = useMemo(() => {
    const map = new Map<string, Device>();
    devices.forEach((d) => map.set(d.shortName, d));
    return map;
  }, []);

  const deviceStats = useMemo(() => {
    if (!store) return null;
    const total = store.devices.length;
    const active = store.devices.filter((d) => d.status === 'active').length;
    const faulty = store.devices.filter((d) => d.status === 'faulty').length;
    const replaced = store.devices.filter((d) => d.status === 'replaced').length;

    const byCategory: Record<string, number> = {};
    store.devices.forEach((d) => {
      const meta = deviceMeta.get(d.type);
      const cat = meta?.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return { total, active, faulty, replaced, byCategory };
  }, [store, deviceMeta]);

  // 404 state
  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6" id="store-not-found">
        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-[#DA291C]" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Store Not Found</h1>
          <p className="text-[#a0a0a0]">No store found with ID "{id}".</p>
        </div>
        <Link
          to="/stores"
          className="bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors min-h-[44px]"
          id="back-to-stores-404"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Directory
        </Link>
      </div>
    );
  }

  const managerPhone = store.manager?.phone?.replace(/\D/g, '') || '';
  const waLink = managerPhone ? `https://wa.me/6${managerPhone}` : '';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8" id={`store-detail-${store.id}`}>
      {/* Back Link */}
      <div className="animate-fade-in">
        <Link
          to="/stores"
          id="back-to-stores"
          className="inline-flex items-center gap-2 text-[#a0a0a0] hover:text-[#FFC72C] transition-colors py-2 min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Directory</span>
        </Link>
      </div>

      {/* Store Header */}
      <div className="glass-card-static overflow-hidden animate-fade-in-up" id="store-header">
        <div className="gradient-header p-6 md:p-8">
          <div className="md:flex md:items-start md:justify-between gap-8">
            <div className="space-y-4 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`badge ${FORMAT_STYLES[store.format] || ''}`}>
                  {store.format}
                </span>
                <span className="badge bg-[#FFC72C]/10 text-[#FFC72C] border border-[#FFC72C]/20">
                  {store.district}
                </span>
                {store.lastVerified && (
                  <span className="badge bg-white/5 text-[#a0a0a0] border border-white/10">
                    <Calendar className="w-3 h-3 mr-1" />
                    Verified {new Date(store.lastVerified).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Store Name */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[#FFC72C] font-mono text-lg font-bold">#{store.id}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{store.name}</h1>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-[#a0a0a0]">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#FFC72C]" />
                <span className="text-sm">{store.address}</span>
              </div>

              {/* Manager Contact */}
              {store.manager && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="text-sm text-[#a0a0a0]">
                    Manager: <span className="text-white font-medium">{store.manager.name}</span>
                  </span>
                  {store.manager.phone && (
                    <>
                      <a
                        href={`tel:${store.manager.phone}`}
                        className="inline-flex items-center gap-1.5 bg-[#22c55e]/10 text-[#22c55e] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#22c55e]/20 transition-colors min-h-[36px]"
                        id="manager-call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </a>
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#25D366]/20 transition-colors min-h-[36px]"
                          id="manager-whatsapp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mini Map Placeholder */}
            <div className="mt-6 md:mt-0 md:w-72 lg:w-80 shrink-0">
              <div
                className="h-48 md:h-56 rounded-xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center overflow-hidden"
                id="store-map-placeholder"
              >
                <div className="text-center space-y-2">
                  <MapPin className="w-8 h-8 text-[#FFC72C] mx-auto" />
                  <p className="text-xs text-[#666]">
                    {store.coordinates.lat.toFixed(4)}°N, {store.coordinates.lng.toFixed(4)}°E
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${store.coordinates.lat},${store.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-[#FFC72C] hover:text-[#FFD966] transition-colors"
                    id="open-google-maps"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Stats */}
      {deviceStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up stagger-1" style={{ opacity: 0 }} id="device-stats">
          <div className="glass-card-static p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-[#FFC72C]" />
              <span className="text-xs text-[#666] uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{deviceStats.total}</p>
          </div>
          <div className="glass-card-static p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[#666] uppercase tracking-wider">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{deviceStats.active}</p>
          </div>
          <div className="glass-card-static p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-[#666] uppercase tracking-wider">Faulty</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{deviceStats.faulty}</p>
          </div>
          <div className="glass-card-static p-4">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-[#666] uppercase tracking-wider">Replaced</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{deviceStats.replaced}</p>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {deviceStats && Object.keys(deviceStats.byCategory).length > 0 && (
        <div className="glass-card-static p-5 animate-fade-in-up stagger-2" style={{ opacity: 0 }} id="category-breakdown">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#FFC72C]" />
            By Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(deviceStats.byCategory).map(([cat, count]) => (
              <span key={cat} className={`badge ${CATEGORY_COLORS[cat] || 'bg-white/5 text-[#a0a0a0]'}`}>
                {cat}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Device Inventory */}
      <div className="animate-fade-in-up stagger-3" style={{ opacity: 0 }} id="device-inventory">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#FFC72C]" />
          Device Inventory
          <span className="text-sm text-[#666] font-normal">({store.devices.length})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {store.devices.map((device, idx) => {
            const meta = deviceMeta.get(device.type);
            const IconComponent = DEVICE_ICONS[device.type] || Monitor;
            const statusCfg = STATUS_CONFIG[device.status || 'active'];
            const StatusIcon = statusCfg.icon;
            const catColor = CATEGORY_COLORS[meta?.category || ''] || 'text-[#a0a0a0] bg-white/5';

            return (
              <div
                key={`${device.type}-${device.index}-${idx}`}
                className="glass-card p-4 space-y-3"
                id={`device-card-${device.assetTag}`}
              >
                {/* Device Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catColor}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{device.type}</p>
                      <p className="text-xs text-[#666]">{meta?.fullName || 'Unknown Device'}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${statusCfg.style}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{statusCfg.label}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#666]">Location</span>
                    <span className="text-[#a0a0a0] text-right">{device.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Asset Tag</span>
                    <span className="text-[#FFC72C] font-mono text-right">{device.assetTag}</span>
                  </div>
                  {device.index !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-[#666]">Index</span>
                      <span className="text-[#a0a0a0]">#{device.index}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {device.notes && (
                  <p className="text-xs text-[#666] italic border-t border-white/5 pt-2">
                    {device.notes}
                  </p>
                )}

                {/* Link to device type page */}
                <Link
                  to={`/devices/${device.type}`}
                  className="block text-center text-xs text-[#FFC72C] hover:text-[#FFD966] transition-colors py-1.5 border-t border-white/5 mt-2"
                  id={`device-link-${device.assetTag}`}
                >
                  View {device.type} Details →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
