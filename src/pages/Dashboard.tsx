

import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  Building2,
  MonitorSmartphone,
  Tags,
  AlertTriangle,
  ArrowRight,
  Wrench,
  HelpCircle,
  ClipboardPaste,
  Inbox,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Reveal } from '../components/ui/Reveal';
import { appConfig } from '../data/config';
import { openTicketCount, tickets } from '../data/tickets';
import { deviceTypes } from '../data/deviceTypes';
import { stores } from '../data/stores';
import { useSavedTickets } from '../hooks/useSavedTickets';
import { useCountUp } from '../hooks/useCountUp';
import { slaInfo, formatSlaLeft, slaBadge } from '../utils/sla';

function KpiValue({ value, start }: { value: number; start: boolean }) {
  const count = useCountUp(value, 900, start);
  return <div className="mt-2 font-display text-3xl font-bold leading-none tracking-tight">{count}</div>;
}

const stats = [
  { label: 'Stores', value: appConfig.totalStores, icon: Building2, to: '/stores', accent: 'from-blue-500/20 to-blue-500/5' },
  { label: 'Device Types', value: deviceTypes.length, icon: MonitorSmartphone, to: '/devices', accent: 'from-purple-500/20 to-purple-500/5' },
  { label: 'Open Tickets', value: openTicketCount, icon: AlertTriangle, to: '/troubleshooting', accent: 'from-amber-500/20 to-amber-500/5' },
  { label: 'Naming Rules', value: 4, icon: Tags, to: '/naming', accent: 'from-emerald-500/20 to-emerald-500/5' },
];

const quickLinks = [
  {
    to: '/ticket',
    title: 'Ticket Assistant',
    desc: 'Paste a ticket email and instantly see the device, its location and the steps to try.',
    icon: ClipboardPaste,
    highlight: true,
  },
  {
    to: '/tickets',
    title: 'Ticket Log & Insights',
    desc: 'Save tickets to your log and see auto-detected issue trends and new problem patterns.',
    icon: Inbox,
    highlight: true,
  },
  {
    to: '/stores',
    title: 'Stores Directory',
    desc: 'Browse all Klang Valley stores by district, find manager contacts and device inventory.',
    icon: Building2,
  },
  {
    to: '/devices',
    title: 'Device Catalog',
    desc: 'Full list of devices: TC, KVS, COD, DT headsets, Delphi modem and more.',
    icon: MonitorSmartphone,
  },
  {
    to: '/naming',
    title: 'Naming Conventions',
    desc: 'Decode ticket language: what "KVS Presenter" or "COD 2" actually means and where to find it.',
    icon: Tags,
  },
  {
    to: '/troubleshooting',
    title: 'Troubleshooting',
    desc: 'Common issues per device with step-by-step workarounds used by the team.',
    icon: Wrench,
  },
];

export default function Dashboard() {
  const recentTickets = tickets.slice(0, 3);
  const { saved } = useSavedTickets();
  const slaWatch = useMemo(
    () =>
      saved
        .filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
        .map((t) => ({ t, sla: slaInfo(t) }))
        .filter((x) => x.sla.state !== 'NONE')
        .sort((a, b) => (a.sla.deadline ?? '9999').localeCompare(b.sla.deadline ?? '9999'))
        .slice(0, 5),
    [saved]
  );
  const slaOverdue = slaWatch.filter((x) => x.sla.state === 'OVERDUE').length;
  const slaNear = slaWatch.filter((x) => x.sla.state === 'NEAR').length;

  return (
    <div className="animate-fade-up">
      {/* ─── Hero ────────────────────────────────────────────────── */}
      <div className="relative mb-8 rounded-3xl overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-mcd-red via-[#C71E13] to-mcd-red-dark" />
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full bg-mcd-yellow/15 blur-[80px]" />
          <div className="absolute -bottom-24 -left-12 w-96 h-96 rounded-full bg-black/20 blur-[80px]" />
          <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/[0.06] blur-[40px]" />
        </div>
        {/* Noise overlay */}
        <div aria-hidden className="absolute inset-0 bg-noise opacity-[0.04]" />

        <div className="relative p-6 sm:p-8 lg:p-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 mb-4">
                <Sparkles className="w-3 h-3" />
                McDonald&apos;s Malaysia · Klang Valley
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1]">
                Klang Valley<br />IT Field Reference
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed max-w-md">
                Fast lookup for stores, devices, naming conventions and troubleshooting — without
                asking the manager.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/ticket"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-mcd-red font-semibold text-sm shadow-lg shadow-black/15 transition-all hover:bg-mcd-yellow hover:shadow-xl hover:-translate-y-0.5"
                >
                  <ClipboardPaste className="w-4 h-4" /> Ticket Assistant
                </Link>
                <Link
                  to="/tickets"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/12 text-white font-semibold text-sm border border-white/20 backdrop-blur transition-all hover:bg-white/20 hover:-translate-y-0.5"
                >
                  <Inbox className="w-4 h-4" /> Ticket Log
                </Link>
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white/85 transition-all hover:bg-white/10 hover:text-white"
                >
                  <HelpCircle className="w-4 h-4" /> Onboarding
                </Link>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:min-w-[380px]">
              {stats.map(({ label, value, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="group rounded-2xl bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm p-5 transition-all duration-300 hover:bg-white/[0.15] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10">
                      <Icon className="w-[18px] h-[18px] text-white/90" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-white/40 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                  <KpiValue value={value} start />
                  <div className="mt-1.5 text-xs font-medium text-white/65 tracking-wide">{label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Grid layout ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Access */}
          <section>
            <h2 className="section-title">
              <TrendingUp className="w-5 h-5 text-mcd-red" /> Quick Access
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickLinks.map(({ to, title, desc, icon: Icon, highlight }, i) => (
                <Reveal key={to} delay={Math.min(i * 60, 240)}>
                  <Link to={to}>
                    <Card
                      hover
                      className={`group h-full p-5 flex items-start gap-4 ${
                        highlight
                          ? 'gradient-border bg-gradient-to-br from-mcd-red/[0.03] to-mcd-yellow/[0.04] dark:from-mcd-red/[0.06] dark:to-mcd-yellow/[0.03]'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                          highlight
                            ? 'bg-gradient-to-br from-mcd-red to-mcd-red-dark text-white shadow-glow-red-sm'
                            : 'bg-mcd-gray-100 dark:bg-mcd-gray-800 text-mcd-red group-hover:bg-mcd-red/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 flex items-center gap-1.5">
                          {title}
                          <ArrowRight className="w-3.5 h-3.5 text-mcd-red opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </h3>
                        <p className="mt-1 text-sm text-mcd-gray-500 dark:text-mcd-gray-400 leading-relaxed">{desc}</p>
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Recently opened */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title !mb-0">Recently Opened Tickets</h2>
              <Link
                to="/troubleshooting"
                className="text-sm font-medium text-mcd-red hover:underline flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Card>
              <ul className="divide-y divide-mcd-gray-100/80 dark:divide-mcd-gray-700/40">
                {recentTickets.map((t) => (
                  <li key={t.id}>
                    <div className="p-4 flex items-start justify-between gap-3 hover:bg-mcd-gray-50/50 dark:hover:bg-mcd-gray-800/30 transition-colors rounded-lg mx-1 my-0.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-mcd-gray-900 dark:text-mcd-gray-50">
                            #{t.storeNumber}
                          </span>
                          <span className="text-sm font-semibold text-mcd-red">{t.deviceShortName}</span>
                          <span className="text-sm text-mcd-gray-500 dark:text-mcd-gray-400">{t.issue}</span>
                        </div>
                        <div className="mt-1 text-xs text-mcd-gray-400">
                          {t.id} · {t.reporter.name}
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          t.status === 'OPEN' ? 'badge-yellow' : 'badge-green'
                        } shrink-0`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>

        {/* ─── Sidebar widgets ───────────────────────────────────── */}
        <aside className="space-y-6">
          {/* SLA Watch */}
          <Card className="p-5">
            <h3 className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-mcd-red/10">
                  <Clock className="w-4 h-4 text-mcd-red" />
                </span>
                SLA Watch
              </span>
              <Link to="/tickets" className="text-xs font-medium text-mcd-red hover:underline">
                Open log
              </Link>
            </h3>
            {slaWatch.length === 0 ? (
              <p className="text-sm text-mcd-gray-500 dark:text-mcd-gray-400">
                No open tickets on the clock right now.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {slaWatch.map(({ t, sla }) => (
                  <li key={t.id} className="text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-mcd-gray-900 dark:text-mcd-gray-50 min-w-0 truncate">
                        #{t.storeNumber}{' '}
                        <span className="text-mcd-red font-semibold">{t.deviceShortName}</span>
                      </span>
                      <span className={`badge ${slaBadge(sla.state)} ${sla.state === 'OVERDUE' ? 'animate-pulse-soft' : ''} shrink-0`}>
                        {sla.state === 'OVERDUE'
                          ? 'overdue'
                          : sla.state === 'NEAR'
                            ? formatSlaLeft(sla.hoursLeft)
                            : 'ok'}
                      </span>
                    </div>
                    <div className="text-xs text-mcd-gray-400 truncate">{t.issue}</div>
                  </li>
                ))}
              </ul>
            )}
            {(slaOverdue > 0 || slaNear > 0) && (
              <p className="mt-3 text-xs text-mcd-gray-500 dark:text-mcd-gray-400">
                {slaOverdue > 0 && (
                  <span className="text-mcd-red font-medium">{slaOverdue} overdue</span>
                )}
                {slaOverdue > 0 && slaNear > 0 && ' · '}
                {slaNear > 0 && (
                  <span className="text-mcd-yellow-dark font-medium">{slaNear} near deadline</span>
                )}
              </p>
            )}
          </Card>

          {/* Quick decoder */}
          <Card className="p-5">
            <h3 className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-mcd-accent-purple/10">
                <Tags className="w-4 h-4 text-mcd-accent-purple" />
              </span>
              Quick Decoder
            </h3>
            <div className="space-y-2">
              {[
                ['TC', 'Terminal (POS)'],
                ['KVS', 'Kitchen Video System'],
                ['KVS Presenter', 'Kitchen display at counter/expo'],
                ['COD', 'Customer Order Display'],
                ['Delphi', 'WAN modem in comms cabinet'],
              ].map(([short, full]) => (
                <div key={short} className="flex items-center justify-between gap-2 text-sm py-1 px-2 rounded-lg hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-800/40 transition-colors">
                  <span className="font-mono font-semibold text-mcd-red">{short}</span>
                  <span className="text-mcd-gray-500 dark:text-mcd-gray-400 text-right text-xs">
                    {full}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/naming"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-mcd-red hover:underline"
            >
              Full naming guide <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Tip */}
          <Card className="p-5 gradient-border bg-gradient-to-br from-mcd-yellow/[0.06] to-mcd-red/[0.03] dark:from-mcd-yellow/[0.06] dark:to-mcd-red/[0.03]">
            <h3 className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-mcd-yellow/15">
                <Sparkles className="w-4 h-4 text-mcd-yellow-dark" />
              </span>
              Tip of the day
            </h3>
            <p className="text-sm text-mcd-gray-600 dark:text-mcd-gray-300 leading-relaxed">
              When a device shows offline, always reseat BOTH ends of the LAN cable — at the
              device and at the patch panel/switch in the comms cabinet — before calling for
              onsite.
            </p>
          </Card>

          {/* Stores by district */}
          <Card className="p-5">
            <h3 className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-mcd-accent-blue/10">
                <Building2 className="w-4 h-4 text-mcd-accent-blue" />
              </span>
              Stores by District
            </h3>
            <div className="space-y-0.5">
              {stores.map((s) => (
                <Link
                  key={s.id}
                  to={`/stores/${s.id}`}
                  className="flex items-center justify-between text-sm py-2 px-2 rounded-lg hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-800/40 transition-colors"
                >
                  <span>
                    <span className="font-mono text-mcd-gray-400 font-medium">#{s.number}</span>{' '}
                    <span className="text-mcd-gray-700 dark:text-mcd-gray-200">{s.name}</span>
                  </span>
                  <span className="text-xs text-mcd-gray-400 font-medium">{s.district}</span>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}