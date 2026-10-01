import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Activity,
  Database,
  HardDrive,
  Wifi,
  WifiOff,
  ShieldCheck,
  ShieldOff,
  Bug,
  Trash2,
  Server,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { appConfig } from '../data/config';
import { deviceTypes } from '../data/deviceTypes';
import { useSavedTickets } from '../hooks/useSavedTickets';
import { useDiagnostics, clearDiagnostics } from '../utils/diagnostics';
import { useToast } from '../hooks/useToast';
import { useGlass, glassIntensityLabel } from '../hooks/useGlass';
import { formatDate } from '../utils';

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div>
      <div className="text-xl font-bold font-mono text-mcd-gray-900 dark:text-mcd-gray-50">{value}</div>
      <div className="text-xs text-mcd-gray-500 dark:text-mcd-gray-400">{label}</div>
      {sub && <div className="text-[11px] text-mcd-gray-400">{sub}</div>}
    </div>
  );
}

export default function Health() {
  const { saved } = useSavedTickets();
  const diagnostics = useDiagnostics();
  const toast = useToast();
  const { intensity, setIntensity } = useGlass();

  const [online, setOnline] = useState(navigator.onLine);
  const [storage, setStorage] = useState<{ usage?: number; quota?: number }>({});
  const [swState, setSwState] = useState<'checking' | 'ready' | 'error' | 'unsupported'>('checking');
  const [hasController, setHasController] = useState(!!navigator.serviceWorker?.controller);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (!navigator.storage?.estimate) return;
    let cancelled = false;
    navigator.storage
      .estimate()
      .then((est) => {
        if (!cancelled) setStorage({ usage: est.usage, quota: est.quota });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setSwState('unsupported');
      return;
    }
    let cancelled = false;
    const onController = () => {
      if (!cancelled) setHasController(true);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onController);
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (!cancelled) setSwState(reg ? 'ready' : 'error');
      })
      .catch(() => {
        if (!cancelled) setSwState('error');
      });
    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onController);
    };
  }, []);

  const usageMb = storage.usage !== undefined ? (storage.usage / 1048576).toFixed(1) : null;
  const quotaMb = storage.quota !== undefined ? (storage.quota / 1048576).toFixed(1) : null;
  const storagePct =
    storage.usage !== undefined && storage.quota ? Math.min(100, Math.round((storage.usage / storage.quota) * 100)) : null;

  return (
    <div>
      <PageHeader
        title="App Health & Diagnostics"
        subtitle="Version, data freshness, storage, offline status and any captured errors - all computed in your browser."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* App & reference data */}
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-mcd-red" /> App & reference data
              </span>
            }
            subtitle="The reference is compiled into this build and validated in CI on every deploy"
          />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="App version" value={`v${appConfig.version}`} />
              <Stat label="Data as of" value={formatDate(appConfig.lastDataUpdate)} />
              <Stat label="Stores" value={appConfig.totalStores} />
              <Stat label="Devices in inventory" value={appConfig.totalDevices} />
              <Stat label="Device types" value={deviceTypes.length} />
              <Stat label="Districts" value={appConfig.districts.length} />
            </div>
          </CardBody>
        </Card>

        {/* Local data */}
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-mcd-red" /> Your local data
              </span>
            }
            subtitle="Stored only in this browser - nothing is uploaded anywhere"
          />
          <CardBody>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Stat label="Saved tickets" value={saved.length} />
              <Stat
                label="Browser storage"
                value={usageMb !== null ? `${usageMb} MB` : '—'}
                sub={quotaMb !== null ? `of ~${quotaMb} MB available` : undefined}
              />
            </div>
            {storagePct !== null && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-mcd-gray-100 dark:bg-mcd-gray-700 rounded overflow-hidden">
                  <div
                    className={`h-full rounded-r transition-all ${storagePct > 80 ? 'bg-mcd-red' : storagePct > 50 ? 'bg-mcd-yellow-dark' : 'bg-mcd-red/70'}`}
                    style={{ width: `${Math.max(3, storagePct)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-mcd-gray-500 dark:text-mcd-gray-400">{storagePct}%</span>
              </div>
            )}
            <p className="mt-3 text-xs text-mcd-gray-500 dark:text-mcd-gray-400">
              Export your log to JSON / CSV from the Ticket Log page to keep a backup.
            </p>
          </CardBody>
        </Card>

        {/* Connectivity & PWA */}
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-mcd-red" /> Connectivity & offline
              </span>
            }
            subtitle="PWA status for field use on store networks"
          />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mcd-gray-600 dark:text-mcd-gray-300">Network</span>
              {online ? (
                <Badge variant="green">
                  <span className="inline-flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> Online
                  </span>
                </Badge>
              ) : (
                <Badge variant="red">
                  <span className="inline-flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Offline
                  </span>
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-mcd-gray-600 dark:text-mcd-gray-300">Service worker</span>
              <Badge variant={swState === 'ready' ? 'green' : swState === 'checking' ? 'yellow' : 'gray'}>
                {swState === 'ready' ? 'Registered' : swState === 'checking' ? 'Checking' : swState === 'unsupported' ? 'Unsupported' : 'Not registered'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-mcd-gray-600 dark:text-mcd-gray-300">Offline-ready</span>
              {hasController ? (
                <Badge variant="green">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Cached for offline
                  </span>
                </Badge>
              ) : (
                <Badge variant="gray">
                  <span className="inline-flex items-center gap-1">
                    <ShieldOff className="w-3 h-3" /> First load only
                  </span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-mcd-gray-500 dark:text-mcd-gray-400">
              Once the app has loaded online once, it keeps working from cache - even on a store
              network with no internet. Saved tickets always stay local.
            </p>
          </CardBody>
        </Card>

        {/* Backend readiness */}
        <Card className="border-mcd-yellow/30 bg-mcd-yellow/5">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Server className="w-4 h-4 text-mcd-yellow-dark" /> Backend roadmap
              </span>
            }
            subtitle="This app is fully client-side today - here is what a real backend would unlock"
          />
          <CardBody>
            <ul className="space-y-2 text-sm text-mcd-gray-700 dark:text-mcd-gray-200">
              <li className="flex items-start gap-2">
                <span className="font-mono text-mcd-yellow-dark">•</span> Share one ticket log across every engineer (no more local-only)
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-mcd-yellow-dark">•</span> Server-side validation + PII enforcement (defence in depth, not just the build check)
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-mcd-yellow-dark">•</span> Role-based auth (viewer vs editor) and an audit trail of who changed what
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-mcd-yellow-dark">•</span> Push alerts for SLA breaches and live device status instead of static data
              </li>
            </ul>
            <p className="mt-3 text-xs text-mcd-gray-500 dark:text-mcd-gray-400">
              A managed Postgres (Supabase / Neon) or serverless API (Cloudflare / Vercel) fits this
              app without moving off GitHub Pages for the UI.
            </p>
          </CardBody>
        </Card>

        {/* Glassmorphism settings */}
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-mcd-red" /> Glassmorphism
              </span>
            }
            subtitle="Adjust backdrop blur intensity and surface opacity. Changes apply instantly and persist."
          />
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-mcd-gray-900 dark:text-mcd-gray-50">Blur Intensity</div>
                  <div className="text-xs text-mcd-gray-500 dark:text-mcd-gray-400">{glassIntensityLabel(intensity)}</div>
                </div>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value as any)}
                  className="glass-input px-3 py-2 rounded-lg text-sm font-medium min-w-[180px]"
                >
                  <option value="subtle">Subtle (8px)</option>
                  <option value="standard">Standard (20px)</option>
                  <option value="strong">Strong (40px) — macOS-like</option>
                  <option value="maximum">Maximum (60px)</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-mcd-gray-400" />
                <div className="flex-1">
                  <div className="text-xs text-mcd-gray-500 dark:text-mcd-gray-400 mb-1">
                    Higher values = more frosted glass, stronger separation from background
                  </div>
                  <div className="flex gap-1" role="radiogroup" aria-label="Glass intensity">
                    {(['subtle', 'standard', 'strong', 'maximum'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setIntensity(level)}
                        className={`flex-1 h-8 rounded-lg border-2 transition-all ${
                          intensity === level
                            ? 'border-mcd-red bg-mcd-red/10 dark:bg-mcd-red/20'
                            : 'border-mcd-gray-200 dark:border-mcd-gray-700 hover:border-mcd-gray-300'
                        }`}
                        role="radio"
                        aria-checked={intensity === level}
                      >
                        <span className="block text-center text-xs font-medium">
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-mcd-gray-100 dark:border-mcd-gray-700">
              <div className="text-xs text-mcd-gray-500 dark:text-mcd-gray-400 space-y-1">
                <p>Changes are saved to localStorage and persist across sessions.</p>
                <p className="font-mono">CSS Variables: --glass-blur, --glass-bg-opacity, --glass-bg-strong-opacity</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Diagnostics */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">
            <Bug className="w-4 h-4 text-mcd-red" /> Captured errors
          </h2>
          {diagnostics.length > 0 && (
            <button
              onClick={() => {
                clearDiagnostics();
                toast({ title: 'Diagnostics log cleared', variant: 'info' });
              }}
              className="btn-ghost text-xs text-mcd-red"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear log
            </button>
          )}
        </div>
        <Card>
          {diagnostics.length === 0 ? (
            <CardBody>
              <div className="flex items-center gap-2 text-sm text-mcd-gray-500 dark:text-mcd-gray-400">
                <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                No errors captured. Uncaught exceptions, failed promises and render failures will
                appear here automatically.
              </div>
            </CardBody>
          ) : (
            <ul className="divide-y divide-mcd-gray-100 dark:divide-mcd-gray-700">
              {diagnostics.map((d, i) => (
                <li key={`${d.at}-${i}`} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={d.type === 'error' ? 'red' : d.type === 'rejection' ? 'yellow' : 'gray'}>
                          {d.type}
                        </Badge>
                        <span className="text-sm font-medium text-mcd-gray-900 dark:text-mcd-gray-50 break-words">
                          {d.message}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-mcd-gray-400 break-words">
                        {new Date(d.at).toLocaleString('en-MY')}
                        {d.source && <span className="font-mono"> · {d.source}</span>}
                        {d.url && <span className="font-mono"> · {d.url}</span>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="mt-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-mcd-red hover:underline">
            Back to dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
