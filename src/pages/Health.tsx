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
  RefreshCcw,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Reveal } from '../components/ui/Reveal';
import { appConfig } from '../data/config';
import { deviceTypes } from '../data/deviceTypes';
import { useSavedTickets } from '../hooks/useSavedTickets';
import { useDiagnostics, clearDiagnostics } from '../utils/diagnostics';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils';

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 p-4 rounded-xl shadow-sm hover:border-mcd-red/30 transition-colors">
      <div className="text-2xl font-bold font-mono text-mcd-gray-900 dark:text-mcd-gray-50 mb-1">{value}</div>
      <div className="text-sm font-semibold text-mcd-gray-500 dark:text-mcd-gray-400">{label}</div>
      {sub && <div className="text-[11px] font-medium text-mcd-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default function Health() {
  const { saved } = useSavedTickets();
  const diagnostics = useDiagnostics();
  const toast = useToast();

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
    <div className="animate-fade-up">
      <PageHeader
        title="App Health & Diagnostics"
        subtitle="Version, data freshness, storage, offline status and any captured errors - all computed in your browser."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* App & reference data */}
        <Reveal delay={0}>
          <Card className="h-full border-mcd-red/10 shadow-lg shadow-mcd-red/5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-mcd-red" /> App & reference data
                </span>
              }
              subtitle="The reference is compiled into this build and validated in CI on every deploy"
            />
            <CardBody className="bg-mcd-gray-50/30 dark:bg-mcd-gray-800/10">
              <div className="grid grid-cols-2 gap-4">
                <Stat label="App version" value={`v${appConfig.version}`} />
                <Stat label="Data as of" value={formatDate(appConfig.lastDataUpdate).split(' ')[0]} />
                <Stat label="Stores" value={appConfig.totalStores} />
                <Stat label="Devices in inventory" value={appConfig.totalDevices} />
                <Stat label="Device types" value={deviceTypes.length} />
                <Stat label="Districts" value={appConfig.districts.length} />
              </div>
            </CardBody>
          </Card>
        </Reveal>

        {/* Local data */}
        <Reveal delay={50}>
          <Card className="h-full border-mcd-red/10 shadow-lg shadow-mcd-red/5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-mcd-red" /> Your local data
                </span>
              }
              subtitle="Stored only in this browser - nothing is uploaded anywhere"
            />
            <CardBody className="bg-mcd-gray-50/30 dark:bg-mcd-gray-800/10">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Stat label="Saved tickets" value={saved.length} />
                <Stat
                  label="Browser storage"
                  value={usageMb !== null ? `${usageMb} MB` : '—'}
                  sub={quotaMb !== null ? `of ~${quotaMb} MB available` : undefined}
                />
              </div>
              {storagePct !== null && (
                <div className="bg-white dark:bg-mcd-gray-900 p-4 rounded-xl border border-mcd-gray-200 dark:border-mcd-gray-700 shadow-sm">
                   <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-mcd-gray-500 mb-2">
                      <span>Storage Quota</span>
                      <span className="font-mono">{storagePct}% used</span>
                   </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-mcd-gray-100 dark:bg-mcd-gray-800 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${storagePct > 80 ? 'bg-mcd-red' : storagePct > 50 ? 'bg-mcd-yellow-dark' : 'bg-gradient-to-r from-mcd-red to-mcd-red-light'}`}
                        style={{ width: `${Math.max(3, storagePct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <p className="mt-4 text-xs font-medium text-mcd-gray-500 dark:text-mcd-gray-400 bg-mcd-gray-100 dark:bg-mcd-gray-800 p-3 rounded-lg text-center">
                Export your log to JSON / CSV from the Ticket Log page to keep a backup.
              </p>
            </CardBody>
          </Card>
        </Reveal>

        {/* Connectivity & PWA */}
        <Reveal delay={100}>
          <Card className="h-full border-mcd-red/10 shadow-lg shadow-mcd-red/5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-mcd-red" /> Connectivity & offline
                </span>
              }
              subtitle="PWA status for field use on store networks"
            />
            <CardBody className="bg-mcd-gray-50/30 dark:bg-mcd-gray-800/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 shadow-sm">
                  <span className="text-sm font-semibold text-mcd-gray-700 dark:text-mcd-gray-200">Network</span>
                  {online ? (
                    <Badge variant="green" className="font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5" /> Online
                      </span>
                    </Badge>
                  ) : (
                    <Badge variant="red" className="font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <WifiOff className="w-3.5 h-3.5" /> Offline
                      </span>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 shadow-sm">
                  <span className="text-sm font-semibold text-mcd-gray-700 dark:text-mcd-gray-200">Service worker</span>
                  <Badge variant={swState === 'ready' ? 'green' : swState === 'checking' ? 'yellow' : 'gray'} className="font-bold uppercase tracking-wider text-[10px]">
                    {swState === 'ready' ? (
                       <span className="flex items-center gap-1"><RefreshCcw className="w-3 h-3" /> Registered</span>
                    ) : swState === 'checking' ? 'Checking' : swState === 'unsupported' ? 'Unsupported' : 'Not registered'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-mcd-gray-900 border border-mcd-gray-200 dark:border-mcd-gray-700 shadow-sm">
                  <span className="text-sm font-semibold text-mcd-gray-700 dark:text-mcd-gray-200">Offline-ready</span>
                  {hasController ? (
                    <Badge variant="green" className="font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Cached for offline
                      </span>
                    </Badge>
                  ) : (
                    <Badge variant="gray" className="font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldOff className="w-3.5 h-3.5" /> First load only
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
              <p className="mt-5 text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-400 leading-relaxed text-center px-4">
                Once the app has loaded online once, it keeps working from cache - even on a store
                network with no internet. Saved tickets always stay local.
              </p>
            </CardBody>
          </Card>
        </Reveal>

        {/* Backend readiness */}
        <Reveal delay={150}>
          <Card className="h-full border-mcd-yellow/30 shadow-lg shadow-mcd-yellow/5 bg-gradient-to-br from-mcd-yellow/[0.05] to-transparent">
            <CardHeader
              title={
                <span className="flex items-center gap-2 font-bold text-mcd-yellow-dark">
                  <Server className="w-5 h-5" /> Backend roadmap
                </span>
              }
              subtitle="This app is fully client-side today - here is what a real backend would unlock"
            />
            <CardBody>
              <ul className="space-y-4 text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-100 mb-6">
                <li className="flex items-start gap-3 bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-mcd-yellow/20">
                  <span className="w-6 h-6 rounded-full bg-mcd-yellow/20 text-mcd-yellow-dark flex items-center justify-center shrink-0 mt-0.5"><Server className="w-3.5 h-3.5"/></span>
                  <span className="leading-relaxed">Share one ticket log across every engineer (no more local-only)</span>
                </li>
                <li className="flex items-start gap-3 bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-mcd-yellow/20">
                  <span className="w-6 h-6 rounded-full bg-mcd-yellow/20 text-mcd-yellow-dark flex items-center justify-center shrink-0 mt-0.5"><ShieldCheck className="w-3.5 h-3.5"/></span>
                  <span className="leading-relaxed">Server-side validation + PII enforcement (defence in depth, not just the build check)</span>
                </li>
                 <li className="flex items-start gap-3 bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-mcd-yellow/20">
                  <span className="w-6 h-6 rounded-full bg-mcd-yellow/20 text-mcd-yellow-dark flex items-center justify-center shrink-0 mt-0.5"><Activity className="w-3.5 h-3.5"/></span>
                  <span className="leading-relaxed">Push alerts for SLA breaches and live device status instead of static data</span>
                </li>
              </ul>
              <p className="text-sm font-semibold text-mcd-yellow-dark/80 dark:text-mcd-yellow-dark text-center">
                A managed Postgres (Supabase / Neon) or serverless API (Cloudflare / Vercel) fits this
                app without moving off GitHub Pages for the UI.
              </p>
            </CardBody>
          </Card>
        </Reveal>
      </div>

      {/* Diagnostics */}
      <section className="mt-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-mcd-red/10 flex items-center justify-center">
               <Bug className="w-4 h-4 text-mcd-red" />
            </div>
            Captured errors
          </h2>
          {diagnostics.length > 0 && (
            <button
              onClick={() => {
                clearDiagnostics();
                toast({ title: 'Diagnostics log cleared', variant: 'info' });
              }}
              className="btn-ghost text-sm font-bold text-mcd-red hover:bg-mcd-red/10"
            >
              <Trash2 className="w-4 h-4 mr-1.5" /> Clear log
            </button>
          )}
        </div>
        <Card className="border-mcd-red/10 shadow-md">
          {diagnostics.length === 0 ? (
            <CardBody className="p-8 text-center bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30">
              <div className="w-12 h-12 bg-white dark:bg-mcd-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-mcd-gray-200 dark:border-mcd-gray-700">
                 <ShieldCheck className="w-6 h-6 text-accent-green" />
              </div>
              <p className="text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-400 max-w-md mx-auto leading-relaxed">
                No errors captured. Uncaught exceptions, failed promises and render failures will
                appear here automatically.
              </p>
            </CardBody>
          ) : (
            <ul className="divide-y divide-mcd-gray-100 dark:divide-mcd-gray-800 bg-mcd-gray-50/30 dark:bg-mcd-gray-900/50">
              {diagnostics.map((d, i) => (
                <li key={`${d.at}-${i}`} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <Badge variant={d.type === 'error' ? 'red' : d.type === 'rejection' ? 'yellow' : 'gray'} className="font-bold">
                          {d.type}
                        </Badge>
                        <span className="text-sm font-bold text-mcd-gray-900 dark:text-mcd-gray-50 break-words font-mono">
                          {d.message}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-mcd-gray-500 dark:text-mcd-gray-400 break-words flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {new Date(d.at).toLocaleString('en-MY')}</span>
                        {d.source && <span className="font-mono bg-white dark:bg-mcd-gray-800 px-1.5 py-0.5 rounded shadow-sm border border-mcd-gray-200 dark:border-mcd-gray-700">src: {d.source}</span>}
                        {d.url && <span className="font-mono bg-white dark:bg-mcd-gray-800 px-1.5 py-0.5 rounded shadow-sm border border-mcd-gray-200 dark:border-mcd-gray-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">url: {d.url}</span>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-mcd-red hover:text-mcd-red-dark transition-colors group px-4 py-2 rounded-xl bg-mcd-red/5 hover:bg-mcd-red/10">
            Back to dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
