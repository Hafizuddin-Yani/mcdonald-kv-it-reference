import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Inbox,
  Trash2,
  Trash,
  AlertTriangle,
  TrendingUp,
  Wrench,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileDown,
  Upload,
  Building2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useSavedTickets } from '../hooks/useSavedTickets';
import { useToast } from '../hooks/useToast';
import { tickets as referenceTickets } from '../data/tickets';
import { statusColor, priorityColor, formatDate } from '../utils';
import { findStoreByNumber } from '../utils/ticketParser';
import { computeInsights, buildTicketsExport, buildTicketsCsv } from '../utils/ticketInsights';
import { slaInfo, formatSlaLeft, slaBadge } from '../utils/sla';
import type { SavedTicket } from '../types';

const PRIORITY_RANK: Record<string, number> = { CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 };

function selectClass() {
  return 'px-4 py-2 rounded-xl text-sm font-semibold border-2 border-mcd-gray-200 dark:border-mcd-gray-700 bg-white dark:bg-mcd-gray-900 text-mcd-gray-700 dark:text-mcd-gray-200 focus:outline-none focus:border-mcd-red/50 focus:ring-4 focus:ring-mcd-red/10 transition-all shadow-sm';
}

function Bar({ value, max, label, sub }: { value: number; max: number; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 shrink-0 text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-200 text-right truncate">
        {label}
        {sub && <div className="text-xs font-semibold text-mcd-gray-400 mt-0.5">{sub}</div>}
      </div>
      <div className="flex-1 h-3 bg-mcd-gray-100 dark:bg-mcd-gray-800 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-mcd-red to-mcd-red-light rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(3, (value / max) * 100)}%` }}
        />
      </div>
      <div className="w-8 shrink-0 text-sm font-mono font-bold text-mcd-gray-700 dark:text-mcd-gray-300">{value}</div>
    </div>
  );
}

export default function TicketLog() {
  const { saved, deleteTicket, clearAll, importTickets } = useSavedTickets();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDevice, setFilterDevice] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterRange, setFilterRange] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showRaw, setShowRaw] = useState<Set<string>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ kind: 'ok' | 'warn' | 'err'; msg: string } | null>(null);

  const allTickets = useMemo(() => [...saved], [saved]);

  const insights = useMemo(() => computeInsights([...saved, ...referenceTickets]), [saved]);

  const deviceOptions = useMemo(
    () => [...new Set(allTickets.map((t) => t.deviceShortName).filter(Boolean))].sort(),
    [allTickets]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff =
      filterRange === '7'
        ? Date.now() - 7 * 86400000
        : filterRange === '30'
          ? Date.now() - 30 * 86400000
          : filterRange === '90'
            ? Date.now() - 90 * 86400000
            : 0;
    const list = allTickets.filter((t) => {
      if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
      if (filterDevice !== 'ALL' && t.deviceShortName !== filterDevice) return false;
      if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
      if (cutoff && new Date(t.createdAt).getTime() < cutoff) return false;
      if (q) {
        const hay =
          `${t.id} ${t.storeNumber} ${t.storeName ?? ''} ${t.deviceShortName} ${t.issue} ${t.workaround ?? ''} ${t.raw ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      if (sortBy === 'oldest') return ta - tb;
      if (sortBy === 'priority') return (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
      if (sortBy === 'device') return a.deviceShortName.localeCompare(b.deviceShortName);
      if (sortBy === 'sla') {
        const da = slaInfo(a).deadline ?? '9999';
        const db = slaInfo(b).deadline ?? '9999';
        return da.localeCompare(db);
      }
      return tb - ta;
    });
    return list;
  }, [allTickets, query, filterStatus, filterDevice, filterPriority, filterRange, sortBy]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRaw = (id: string) => {
    setShowRaw((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = (ext: 'json' | 'ts' | 'csv') => {
    if (ext === 'csv') {
      const blob = new Blob([buildTicketsCsv(saved)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'saved-tickets.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'CSV downloaded', desc: `${saved.length} tickets exported (PII-safe).`, variant: 'success' });
      return;
    }
    const json = buildTicketsExport(saved);
    const content = ext === 'ts' ? `import type { Ticket } from '../types';\n\nexport const tickets: Ticket[] = ${json};\n` : json;
    const blob = new Blob([content], { type: ext === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ext === 'json' ? 'saved-tickets.json' : 'tickets.ts';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: ext === 'json' ? 'JSON downloaded' : 'tickets.ts downloaded', variant: 'success' });
  };

  const handleClear = () => {
    clearAll();
    toast({ title: 'Ticket log cleared', variant: 'info' });
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of tickets');
      const { imported, skipped } = importTickets(parsed);
      if (imported > 0) {
        setImportResult({
          kind: 'ok',
          msg: `Imported ${imported} ticket${imported === 1 ? '' : 's'}.${skipped ? ` Skipped ${skipped} duplicate(s).` : ''}`,
        });
        toast({
          title: `Imported ${imported} ticket${imported === 1 ? '' : 's'}`,
          desc: skipped ? `Skipped ${skipped} duplicate(s).` : undefined,
          variant: 'success',
        });
      } else {
        setImportResult({
          kind: 'warn',
          msg: `Nothing new to import. ${skipped} row(s) were duplicates or missing an id.`,
        });
        toast({ title: 'Nothing new to import', desc: `${skipped} row(s) were duplicates or missing an id.`, variant: 'info' });
      }
      setImportOpen(false);
      setImportText('');
    } catch (e) {
      setImportResult({ kind: 'err', msg: e instanceof Error ? e.message : 'Invalid JSON' });
      toast({ title: 'Import failed', desc: e instanceof Error ? e.message : 'Invalid JSON', variant: 'error' });
    }
  };

  const searchHref = (t: SavedTicket) =>
    `https://www.google.com/search?q=${encodeURIComponent(`${t.deviceShortName} ${t.issue} troubleshooting fix`)}`;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Ticket Log & Insights"
        subtitle="Your saved tickets plus auto-detected issue trends and troubleshooting tips. Data stays in this browser."
        action={
          saved.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleDownload('json')} className="btn-secondary text-sm">
                <FileDown className="w-4 h-4" /> Download JSON
              </button>
              <button onClick={() => handleDownload('ts')} className="btn-secondary text-sm">
                <FileDown className="w-4 h-4" /> tickets.ts
              </button>
              <button onClick={() => handleDownload('csv')} className="btn-secondary text-sm" title="PII-safe CSV (no reporter details) for Excel / Sheets">
                <FileDown className="w-4 h-4" /> CSV
              </button>
              <button onClick={() => setImportOpen((v) => !v)} className="btn-secondary text-sm">
                <Upload className="w-4 h-4" /> Import
              </button>
              <button onClick={handleClear} className="btn-ghost text-sm text-mcd-red font-bold">
                <Trash className="w-4 h-4" /> Clear all
              </button>
            </div>
          ) : null
        }
      />

      {importResult && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-semibold shadow-sm border ${
            importResult.kind === 'ok'
              ? 'bg-accent-green/10 text-accent-green-dark border-accent-green/20'
              : importResult.kind === 'warn'
                ? 'bg-mcd-yellow/10 text-mcd-yellow-dark border-mcd-yellow/20'
                : 'bg-mcd-red/10 text-mcd-red-dark border-mcd-red/20'
          }`}
        >
          {importResult.msg}
        </div>
      )}

      {importOpen && (
        <Card className="mb-8 border-mcd-red/20 shadow-lg shadow-mcd-red/5">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-mcd-red" /> Import tickets
              </span>
            }
            subtitle="Paste a JSON array of tickets (e.g. from another engineer). Duplicates are skipped."
          />
          <CardBody>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='[{"id": "ITH0000000001", "storeNumber": "424", "deviceShortName": "COD", "issue": "COD 2 | BLANK", "priority": "NORMAL", "status": "OPEN", "createdAt": "2026-08-01T08:00:00+08:00", "reporter": {"name": "Store Manager", "phone": "01X-XXX XXXX"}}]'
              className="w-full h-40 px-5 py-4 rounded-xl border-2 border-mcd-gray-200 dark:border-mcd-gray-700 bg-white dark:bg-mcd-gray-900 text-mcd-gray-900 dark:text-mcd-gray-50 placeholder-mcd-gray-400 dark:placeholder-mcd-gray-500 focus:outline-none focus:border-mcd-red/50 focus:ring-4 focus:ring-mcd-red/10 transition-all font-mono text-[13px] shadow-inner scrollbar-thin resize-y"
              spellCheck={false}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setImportOpen(false)} className="btn-ghost text-sm">Cancel</button>
              <button onClick={handleImport} className="btn-primary text-sm">
                <Upload className="w-4 h-4 mr-1.5" /> Import tickets
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {saved.length === 0 ? (
        <EmptyState
          title="No saved tickets yet"
          message="Open the Ticket Assistant, paste a ticket email and click 'Save to my log'. Saved tickets appear here with auto-detected trends."
        />
      ) : (
        <div className="space-y-12">
          {/* ── My Ticket Log ─────────────────────────────────────── */}
          <section>
            <h2 className="section-title mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-mcd-red/10 flex items-center justify-center">
                <Inbox className="w-4 h-4 text-mcd-red" />
              </div>
              My Ticket Log <Badge variant="gray" className="ml-2">{saved.length}</Badge>
            </h2>
            <div className="mb-6 max-w-xl">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search by ticket #, store, device or issue…"
              />
            </div>
            <div className="mb-5 flex flex-wrap gap-2">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filterStatus === s
                      ? 'bg-gradient-to-br from-mcd-gray-900 to-mcd-gray-700 text-white shadow-md scale-105 dark:from-white dark:to-mcd-gray-200 dark:text-mcd-gray-900'
                      : 'bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700/80 text-mcd-gray-600 dark:text-mcd-gray-300 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <select value={filterDevice} onChange={(e) => setFilterDevice(e.target.value)} className={selectClass()}>
                <option value="ALL">All devices</option>
                {deviceOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectClass()}>
                <option value="ALL">All priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
              <select value={filterRange} onChange={(e) => setFilterRange(e.target.value)} className={selectClass()}>
                <option value="ALL">Any date</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass()}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priority">Priority (high → low)</option>
                <option value="device">Device name</option>
                <option value="sla">SLA deadline (soonest)</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-2 border-mcd-gray-200 dark:border-mcd-gray-700">
                <div className="w-12 h-12 bg-mcd-gray-100 dark:bg-mcd-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-5 h-5 text-mcd-gray-400" />
                </div>
                <p className="text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-300">No tickets match that filter.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((t) => {
                  const storeRec = findStoreByNumber(t.storeNumber);
                  const sla = slaInfo(t);
                  return (
                  <Card key={t.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-mcd-red/30">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(t.id)}
                      className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 text-left bg-white dark:bg-mcd-gray-900 group"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-mcd-gray-50 dark:bg-mcd-gray-800 flex items-center justify-center shrink-0 border border-mcd-gray-200 dark:border-mcd-gray-700 group-hover:border-mcd-red/30 group-hover:bg-mcd-red/5 transition-colors mt-0.5 sm:mt-0">
                          {expanded.has(t.id) ? (
                            <ChevronDown className="w-4 h-4 text-mcd-gray-500 group-hover:text-mcd-red" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-mcd-gray-500 group-hover:text-mcd-red" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                           <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-mcd-gray-900 dark:text-mcd-gray-50">
                              {t.id}
                            </span>
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-mcd-gray-100 dark:bg-mcd-gray-800 text-mcd-gray-600 dark:text-mcd-gray-300">#{t.storeNumber}</span>
                            <span className="font-bold text-sm text-mcd-red">{t.deviceShortName}</span>
                          </div>
                          <span className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 truncate pr-4">
                            {t.issue}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pl-11 sm:pl-0">
                        <Badge variant="gray" className="font-mono">{formatDate(t.createdAt)}</Badge>
                        <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
                        <span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span>
                        {sla.state !== 'NONE' && (
                          <span
                            className={`badge ${slaBadge(sla.state)} ${sla.state === 'OVERDUE' ? 'animate-pulse-soft shadow-sm border border-mcd-red/30' : ''}`}
                            title={`SLA deadline ${formatDate(sla.deadline ?? '')} (${sla.hoursLeft <= 0 ? 'overdue' : `${Math.round(sla.hoursLeft)}h remaining`})`}
                          >
                            {sla.state === 'OVERDUE' ? 'SLA overdue' : sla.state === 'NEAR' ? `SLA ${formatSlaLeft(sla.hoursLeft)}` : 'On SLA'}
                          </span>
                        )}
                      </div>
                    </button>

                    {expanded.has(t.id) && (
                      <CardBody className="border-t border-mcd-gray-100 dark:border-mcd-gray-800 bg-mcd-gray-50/30 dark:bg-mcd-gray-900/50">
                        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                          <div className="bg-white dark:bg-mcd-gray-800 p-4 rounded-xl border border-mcd-gray-200/60 dark:border-mcd-gray-700 shadow-sm">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-1">
                              Store
                            </dt>
                            <dd className="font-medium text-mcd-gray-900 dark:text-mcd-gray-100">
                              {storeRec ? (
                                <Link
                                  to={`/stores/${storeRec.id}`}
                                  className="text-mcd-red hover:text-mcd-red-dark transition-colors inline-flex items-center gap-2 group"
                                >
                                  <Building2 className="w-4 h-4" />
                                  <span className="group-hover:underline">{t.storeName ? `${t.storeName} ` : ''}#{t.storeNumber}</span>
                                </Link>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-mcd-gray-400" />
                                  {t.storeName ? `${t.storeName} ` : ''}#{t.storeNumber}
                                  <span className="text-xs font-semibold bg-mcd-gray-100 dark:bg-mcd-gray-700 px-1.5 py-0.5 rounded text-mcd-gray-500">Not in directory</span>
                                </span>
                              )}
                            </dd>
                          </div>
                          <div className="bg-white dark:bg-mcd-gray-800 p-4 rounded-xl border border-mcd-gray-200/60 dark:border-mcd-gray-700 shadow-sm">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-1">
                              SLA Timeline
                            </dt>
                            <dd className="font-medium text-mcd-gray-900 dark:text-mcd-gray-100 space-y-1">
                               <div className="flex justify-between items-center">
                                  <span className="text-mcd-gray-500 text-xs">Created:</span>
                                  <span className="font-mono text-xs">{formatDate(t.createdAt)}</span>
                               </div>
                              {sla.state !== 'NONE' && (
                                <div className="flex justify-between items-center pt-1 border-t border-mcd-gray-100 dark:border-mcd-gray-700">
                                   <span className="text-mcd-gray-500 text-xs">Deadline:</span>
                                  <span className="inline-flex items-center gap-2 font-mono text-xs">
                                    {formatDate(sla.deadline ?? '')}
                                  </span>
                                </div>
                              )}
                            </dd>
                          </div>
                          {t.workaround && (
                            <div className="sm:col-span-2 bg-mcd-yellow/5 p-4 rounded-xl border border-mcd-yellow/20">
                              <dt className="text-[11px] font-bold uppercase tracking-wider text-mcd-yellow-dark mb-2">
                                Workaround (already tried)
                              </dt>
                              <dd className="text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-100 leading-relaxed">
                                {t.workaround}
                              </dd>
                            </div>
                          )}
                        </dl>

                        <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-mcd-gray-200 dark:border-mcd-gray-700">
                          <a
                            href={searchHref(t)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-sm font-semibold"
                          >
                            <ExternalLink className="w-4 h-4 mr-1.5" /> Search web
                          </a>
                          {t.raw && (
                            <button onClick={() => toggleRaw(t.id)} className="btn-secondary text-sm font-semibold">
                              {showRaw.has(t.id) ? <ChevronDown className="w-4 h-4 mr-1.5" /> : <ChevronRight className="w-4 h-4 mr-1.5" />}
                              {showRaw.has(t.id) ? 'Hide raw email' : 'Show raw email'}
                            </button>
                          )}
                          <button
                            onClick={() => deleteTicket(t.id)}
                            className="btn-ghost text-sm font-bold text-mcd-red ml-auto hover:bg-mcd-red/10 border border-transparent hover:border-mcd-red/20"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" /> Delete Ticket
                          </button>
                        </div>

                        {showRaw.has(t.id) && t.raw && (
                          <pre className="mt-4 p-5 rounded-xl bg-mcd-gray-900 text-[13px] font-mono text-mcd-gray-300 whitespace-pre-wrap max-h-80 overflow-auto scrollbar-thin shadow-inner border border-black/20">
                            {t.raw}
                          </pre>
                        )}
                      </CardBody>
                    )}
                  </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Insights ──────────────────────────────────────────── */}
          <section>
            <h2 className="section-title mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-mcd-red/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-mcd-red" />
              </div>
              Insights
            </h2>
            <p className="text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-400 mb-6 leading-relaxed max-w-2xl">
              Computed automatically from your saved tickets plus the shared reference data
              ({referenceTickets.length} reference tickets).
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top devices */}
              <Card className="border-mcd-gray-200 dark:border-mcd-gray-800 shadow-md">
                <CardHeader title="Top devices by tickets" />
                <CardBody className="space-y-4">
                  {insights.topDevices.length === 0 ? (
                    <p className="text-sm text-mcd-gray-500 font-medium">No tickets yet.</p>
                  ) : (
                    insights.topDevices.map((d) => (
                      <Bar
                        key={d.name}
                        label={d.name}
                        value={d.count}
                        max={insights.topDevices[0].count}
                        sub={d.recent > 0 ? `${d.recent} this week` : undefined}
                      />
                    ))
                  )}
                </CardBody>
              </Card>

              {/* Top problems */}
              <Card className="border-mcd-gray-200 dark:border-mcd-gray-800 shadow-md">
                <CardHeader title="Top issue types" />
                <CardBody className="space-y-4">
                  {insights.topProblems.length === 0 ? (
                    <p className="text-sm text-mcd-gray-500 font-medium">No tickets yet.</p>
                  ) : (
                    insights.topProblems.map((p) => (
                      <Bar
                        key={p.label}
                        label={p.label}
                        value={p.count}
                        max={insights.topProblems[0].count}
                      />
                    ))
                  )}
                </CardBody>
              </Card>

              {/* Weekly trend */}
              <Card className="border-mcd-gray-200 dark:border-mcd-gray-800 shadow-md">
                <CardHeader title="Tickets per week (last 8 weeks)" />
                <CardBody>
                  <div className="flex items-end gap-3 h-40 pt-4">
                    {insights.weekBuckets.map((w) => (
                      <div key={w.start.toISOString()} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="text-xs font-mono font-bold text-mcd-gray-400 group-hover:text-mcd-red transition-colors">{w.count || ''}</div>
                        <div
                          className="w-full bg-gradient-to-t from-mcd-red/80 to-mcd-red-light rounded-t-md transition-all duration-300 opacity-80 group-hover:opacity-100"
                          style={{ height: `${(w.count / insights.maxWeek) * 100}%` }}
                          title={w.start.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                        />
                        <div className="text-[10px] font-bold uppercase tracking-wider text-mcd-gray-400">
                          {w.start.toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Likely next issues */}
              <Card className="border-mcd-gray-200 dark:border-mcd-gray-800 shadow-md">
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-mcd-gray-400" /> Likely next issues
                    </span>
                  }
                  subtitle="Ranked by recent frequency"
                />
                <CardBody className="p-0">
                  {insights.combos.length === 0 ? (
                    <div className="p-6 text-sm text-mcd-gray-500 font-medium text-center">No data yet.</div>
                  ) : (
                    <ul className="divide-y divide-mcd-gray-100 dark:divide-mcd-gray-800">
                      {insights.combos.slice(0, 5).map((c) => (
                        <li key={c.key} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-900/50 transition-colors">
                          <div>
                            <div className="font-mono text-sm font-bold text-mcd-gray-900 dark:text-mcd-gray-50 mb-1">
                              {c.deviceShortName}
                            </div>
                            <div className="text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-400">
                              {c.problem}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {c.recentCount > 0 && (
                              <Badge variant="red">{c.recentCount} recent</Badge>
                            )}
                            <span className="font-mono text-sm font-bold bg-mcd-gray-100 dark:bg-mcd-gray-800 px-2.5 py-1 rounded-md text-mcd-gray-600 dark:text-mcd-gray-300">
                              ×{c.count}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>

              {/* Escalation watch */}
              <Card className="border-mcd-yellow/20 shadow-lg shadow-mcd-yellow/5 bg-gradient-to-br from-mcd-yellow/5 to-transparent">
                <CardHeader
                  title={
                    <span className="flex items-center gap-2 font-bold text-mcd-yellow-dark">
                      <ExternalLink className="w-5 h-5" /> Escalation watch
                    </span>
                  }
                  subtitle="Tickets already pointing at escalation / onsite visit"
                />
                <CardBody>
                  <div className="flex items-baseline gap-3 mb-3">
                    <div className="text-4xl font-bold font-mono text-mcd-red drop-shadow-sm">
                      {insights.escalations.count}
                    </div>
                    <div className="text-sm font-medium text-mcd-gray-500 dark:text-mcd-gray-400">
                      of {insights.analyzed.length} tickets ({insights.escalations.pct}%)
                    </div>
                  </div>
                  <p className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-300 leading-relaxed p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-mcd-yellow/20">
                    These already mention escalating or requesting an onsite visit. Review the
                    workaround before dispatch to avoid a repeat visit.
                  </p>
                </CardBody>
              </Card>

              {/* Repeat-trouble stores */}
              <Card className="border-mcd-red/10 shadow-md">
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-mcd-gray-400" /> Repeat-trouble stores
                    </span>
                  }
                  subtitle="Stores with 2+ tickets on record"
                />
                <CardBody className="p-0">
                  {insights.repeatStores.length === 0 ? (
                    <div className="p-6 text-sm text-mcd-gray-500 font-medium text-center">No store has repeated tickets yet.</div>
                  ) : (
                    <ul className="divide-y divide-mcd-gray-100 dark:divide-mcd-gray-800">
                      {insights.repeatStores.slice(0, 5).map((s) => (
                        <li key={s.storeNumber} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-900/50 transition-colors">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-mcd-gray-900 dark:text-mcd-gray-50 mb-1">
                              <span className="font-mono text-mcd-red mr-1.5">#{s.storeNumber}</span>
                              {s.storeName}
                            </div>
                            <div className="text-xs font-medium text-mcd-gray-500 dark:text-mcd-gray-400 truncate">
                              {s.issues.slice(0, 2).join(' · ')}
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold bg-mcd-gray-100 dark:bg-mcd-gray-800 px-2.5 py-1 rounded-md text-mcd-gray-600 dark:text-mcd-gray-300 shrink-0">
                            ×{s.count}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </div>
          </section>

          {/* ── New / unseen issues ───────────────────────────────── */}
          {insights.newIssueAlerts.length > 0 && (
            <section>
              <h2 className="section-title mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-mcd-red/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-mcd-red" />
                </div>
                New / unseen issue patterns
              </h2>
              <p className="text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-400 mb-6 leading-relaxed max-w-2xl">
                These device+issue combos don't match any common issue in the catalog yet. Add them to{' '}
                <code className="font-mono bg-mcd-gray-100 dark:bg-mcd-gray-700 border border-mcd-gray-200 dark:border-mcd-gray-600 px-1.5 py-0.5 rounded shadow-sm text-[13px]">
                  deviceTypes.ts
                </code>{' '}
                so future tickets get better suggestions.
              </p>
              <div className="grid lg:grid-cols-2 gap-6">
                {insights.newIssueAlerts.map((a) => (
                  <Card key={`${a.deviceShortName}-${a.problem}`} className="border-mcd-red/30 shadow-lg shadow-mcd-red/5 bg-gradient-to-br from-mcd-red/[0.02] to-transparent">
                    <CardHeader
                      title={
                        <span className="flex items-center gap-2 font-bold text-lg">
                          <span className="font-mono text-mcd-red">{a.deviceShortName}</span>
                          <span className="text-mcd-gray-900 dark:text-mcd-gray-50">{a.problem}</span>
                        </span>
                      }
                      action={<Badge variant="red" className="font-bold text-sm px-3 py-1">{a.count}×</Badge>}
                    />
                    <CardBody>
                      <div className="mb-4">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-2">
                          Example from ticket
                        </div>
                        <p className="text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-100 bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-mcd-gray-200/50 dark:border-mcd-gray-700/50">
                          {a.issueText}
                        </p>
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-2">
                        Ready to paste into commonIssues
                      </div>
                      <pre className="p-4 rounded-xl bg-mcd-gray-900 text-mcd-gray-50 text-[13px] font-mono overflow-auto max-h-56 scrollbar-thin shadow-inner border border-black/20">
                        {a.suggestionJson}
                      </pre>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
