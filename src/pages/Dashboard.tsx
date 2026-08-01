import { Link } from 'react-router';
import {
  Building2,
  Cpu,
  Search,
  Tag,
  Wrench,
  MapPin,
  ChevronRight,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';
import stores from '../data/stores.json';
import devices from '../data/devices.json';
import troubleshooting from '../data/troubleshooting.json';
import type { Store, Device, TroubleshootingEntry } from '../types';

const typedStores = stores as unknown as Store[];
const typedDevices = devices as unknown as Device[];
const typedTroubleshooting = troubleshooting as unknown as TroubleshootingEntry[];

const quickActions = [
  {
    label: 'Find a Store',
    description: 'Search by #, name, or district',
    icon: Building2,
    path: '/stores',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  {
    label: 'Look Up Device',
    description: 'Device specs & guides',
    icon: Cpu,
    path: '/devices',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
  },
  {
    label: 'Decode Asset Tag',
    description: 'Parse naming convention',
    icon: Tag,
    path: '/naming',
    color: '#FFC72C',
    bg: 'rgba(255, 199, 44, 0.1)',
  },
  {
    label: 'Troubleshoot',
    description: 'Common issues & fixes',
    icon: Wrench,
    path: '/troubleshooting',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.1)',
  },
  {
    label: 'Global Search',
    description: 'Search everything',
    icon: Search,
    path: '/search',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  {
    label: 'New Hire Guide',
    description: 'Onboarding checklist',
    icon: GraduationCap,
    path: '/onboarding',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.1)',
  },
];

export default function Dashboard() {
  const totalDevices = typedStores.reduce((acc, s) => acc + s.devices.length, 0);
  const districts = [...new Set(typedStores.map((s) => s.district))];
  const criticalIssues = typedTroubleshooting.filter((t) => t.severity === 'critical').length;

  const formatCounts = typedStores.reduce(
    (acc, s) => {
      acc[s.format] = (acc[s.format] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div
        className="glass-card-static p-6 md:p-8 gradient-header animate-fade-in-up"
        id="dashboard-hero"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-xs text-[#22c55e] font-medium uppercase tracking-wider">
                System Online
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              MY Klang Valley
              <span className="text-gradient-gold"> IT Reference</span>
            </h1>
            <p className="text-[#a0a0a0] text-sm md:text-base max-w-xl">
              Device encyclopedia, store directory, naming conventions, and troubleshooting
              for McDonald's Klang Valley IT infrastructure.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-[#666]">
            <Clock size={14} />
            <span>
              Updated{' '}
              {new Date().toLocaleDateString('en-MY', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-fade-in-up stagger-1"
        id="dashboard-stats"
        style={{ opacity: 0 }}
      >
        <StatCard
          label="Total Stores"
          value={typedStores.length}
          icon={Building2}
          color="#3b82f6"
          detail={`${districts.length} districts`}
        />
        <StatCard
          label="Device Types"
          value={typedDevices.length}
          icon={Cpu}
          color="#8b5cf6"
          detail="in catalog"
        />
        <StatCard
          label="Devices Tracked"
          value={totalDevices}
          icon={Activity}
          color="#22c55e"
          detail="across all stores"
        />
        <StatCard
          label="Known Issues"
          value={typedTroubleshooting.length}
          icon={Wrench}
          color="#f97316"
          detail={`${criticalIssues} critical`}
        />
      </div>

      {/* Quick Actions */}
      <div
        className="animate-fade-in-up stagger-2"
        style={{ opacity: 0 }}
        id="dashboard-actions"
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-[#FFC72C]" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                id={`action-${action.label.toLowerCase().replace(/\s/g, '-')}`}
                className="glass-card p-4 flex items-center gap-4 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: action.bg }}
                >
                  <Icon size={22} style={{ color: action.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-xs text-[#666] mt-0.5">{action.description}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-[#333] group-hover:text-[#FFC72C] transition-colors shrink-0"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column: Store Formats + Recent Stores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Format Breakdown */}
        <div
          className="glass-card-static p-6 animate-fade-in-up stagger-3"
          style={{ opacity: 0 }}
          id="dashboard-formats"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#FFC72C]" />
            Store Formats
          </h2>
          <div className="space-y-3">
            {Object.entries(formatCounts).map(([format, count]) => {
              const percentage = Math.round((count / typedStores.length) * 100);
              const colorMap: Record<string, string> = {
                DT: '#22c55e',
                Mall: '#3b82f6',
                Standalone: '#8b5cf6',
                Airport: '#f97316',
                Express: '#ec4899',
              };
              const color = colorMap[format] || '#666';
              return (
                <div key={format}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="text-sm text-white font-medium">{format}</span>
                    </div>
                    <span className="text-sm text-[#a0a0a0]">
                      {count} stores ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent / Featured Stores */}
        <div
          className="glass-card-static p-6 animate-fade-in-up stagger-4"
          style={{ opacity: 0 }}
          id="dashboard-stores"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin size={18} className="text-[#FFC72C]" />
              Stores Directory
            </h2>
            <Link
              to="/stores"
              className="text-xs text-[#FFC72C] hover:text-[#FFD966] transition-colors flex items-center gap-1"
              id="view-all-stores"
            >
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {typedStores.slice(0, 5).map((store) => (
              <Link
                key={store.id}
                to={`/stores/${store.id}`}
                id={`dash-store-${store.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FFC72C]/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#FFC72C]">#{store.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{store.name}</p>
                  <p className="text-xs text-[#666]">
                    {store.district} · {store.devices.length} devices
                  </p>
                </div>
                <span
                  className={`badge badge-${store.format.toLowerCase()}`}
                >
                  {store.format}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Issues Alert (if any) */}
      {criticalIssues > 0 && (
        <div
          className="glass-card-static p-5 border-l-4 border-[#ef4444] animate-fade-in-up stagger-5"
          style={{ opacity: 0 }}
          id="dashboard-alerts"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-[#f87171] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {criticalIssues} Critical Issue{criticalIssues > 1 ? 's' : ''} Documented
              </h3>
              <p className="text-xs text-[#a0a0a0] mb-2">
                Review critical troubleshooting entries for known high-impact device failures.
              </p>
              <Link
                to="/troubleshooting"
                className="text-xs text-[#FFC72C] hover:text-[#FFD966] font-medium flex items-center gap-1 transition-colors"
                id="view-critical-issues"
              >
                View Issues <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  detail,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  detail: string;
}) {
  return (
    <div className="glass-card-static p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={16} className="" style={{ color }} />
        </div>
        <span className="text-xs text-[#666] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-[#666] mt-1">{detail}</p>
    </div>
  );
}
