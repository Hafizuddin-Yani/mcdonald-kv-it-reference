import { useMemo, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import {
  ClipboardPaste,
  Search,
  FileText,
  MapPin,
  Phone,
  Wrench,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  Globe,
  BookmarkPlus,
  Bookmark,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { parseTicketEmail, detectDevices, matchProblem, findStoreByNumber, buildSearchQuery, suggestDeviceEntry } from '../utils/ticketParser';
import { telLink, priorityColor, formatDate } from '../utils';
import { computeSlaDeadline, formatSlaLeft, slaInfo } from '../utils/sla';
import { deviceCategories } from '../data/deviceTypes';
import { deviceTypes } from '../data/deviceTypes';
import { useSavedTickets } from '../hooks/useSavedTickets';
import { useToast } from '../hooks/useToast';
import type { SavedTicket } from '../types';

const sampleTicket = `SLA for this ticket is Priority 3 - NORMAL.
Please note SLA TTR (Time to resolve) for this ticket will be end on 01-08-2026 08:14 .

Details of the ticket as follows:-
Hi Osnet,

Good day to you.

Kindly assist for below issue:

Reporter Name: Store Manager
Reporter Phone: 01X-XXX XXXX
Store : #385 PEARL POINT DT
Issue :COD 2 | BLANK
Ticket Number: ITH0385260028
Priority: Normal

Workaround:

User inform cod 2 blank (white screen )
Check from our side (ok ) > both screen able to remote |
Guide user to restart cod 2 > issue persists |
Guide user to reseat cable and delphi modem > issue persists |
User request onsite visit for further checking |`;

export default function TicketAssistant() {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedEntry, setCopiedEntry] = useState(false);
  const [analyzedFlash, setAnalyzedFlash] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'duplicate'>('idle');
  const { saveTicket, hasTicket } = useSavedTickets();
  const toast = useToast();

  const parsed = useMemo(() => {
    try {
      return email.trim() ? parseTicketEmail(email) : null;
    } catch {
      return null;
    }
  }, [email]);
  const detected = useMemo(() => {
    try {
      return parsed ? detectDevices(parsed) : [];
    } catch {
      return [];
    }
  }, [parsed]);
  const store = useMemo(() => (parsed ? findStoreByNumber(parsed.storeNumber) : undefined), [parsed]);
  const problem = useMemo(
    () => {
      try {
        return parsed && detected[0] ? matchProblem(parsed, detected[0]) : null;
      } catch {
        return null;
      }
    },
    [parsed, detected]
  );

  const searchQuery = useMemo(
    () => (parsed && detected[0] ? buildSearchQuery(parsed, detected[0], problem) : ''),
    [parsed, detected, problem]
  );

  const unknownEntry = useMemo(
    () => (parsed && detected.length === 0 ? suggestDeviceEntry(parsed.issue) : null),
    [parsed, detected]
  );

  const [showSearch, setShowSearch] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (email.trim() && parsed) {
        setAnalyzedFlash(true);
        setTimeout(() => setAnalyzedFlash(false), 1500);
        document.getElementById('assistant-results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  const copyUnknownEntry = () => {
    if (!unknownEntry) return;
    navigator.clipboard.writeText(unknownEntry.json).then(() => {
      setCopiedEntry(true);
      setTimeout(() => setCopiedEntry(false), 2000);
      toast({ title: 'Device entry copied', desc: 'Paste it into the device catalog.', variant: 'success' });
    });
  };

  const copyJson = () => {
    if (!parsed) return;
    const createdAt = new Date().toISOString();
    const json = JSON.stringify(
      {
        id: parsed.ticketNumber,
        storeNumber: parsed.storeNumber,
        deviceShortName: detected[0]?.shortName ?? '',
        issue: parsed.issue,
        priority: parsed.priority,
        status: 'OPEN',
        createdAt,
        slaDeadline: parsed.slaDeadline ?? computeSlaDeadline(createdAt, parsed.priority),
        reporter: { name: parsed.reporterName, phone: parsed.reporterPhone },
        workaround: parsed.workaround,
      },
      null,
      2
    );
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Ticket JSON copied', desc: 'Ready to paste into tickets.ts.', variant: 'success' });
    });
  };

  const saveToLog = () => {
    if (!parsed) return;
    if (hasTicket(parsed.ticketNumber)) {
      setSaveState('duplicate');
      toast({ title: 'Already in your log', desc: `Ticket ${parsed.ticketNumber} was saved before.`, variant: 'info' });
      return;
    }
    const savedTicket: SavedTicket = {
      id: parsed.ticketNumber,
      storeNumber: parsed.storeNumber,
      storeName: parsed.storeName,
      deviceShortName: detected[0]?.shortName ?? '',
      issue: parsed.issue,
      priority: parsed.priority,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      slaDeadline: parsed.slaDeadline ?? computeSlaDeadline(new Date().toISOString(), parsed.priority),
      reporter: { name: parsed.reporterName, phone: parsed.reporterPhone },
      workaround: parsed.workaround,
      raw: parsed.raw,
      savedAt: new Date().toISOString(),
    };
    saveTicket(savedTicket);
    setSaveState('saved');
    toast({
      title: 'Saved to your log',
      desc: `${parsed.ticketNumber} · #${parsed.storeNumber} ${detected[0]?.shortName ?? ''}`,
      variant: 'success',
    });
  };

  const deviceTypeById = (id: string) => deviceTypes.find((d) => d.id === id);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Ticket Assistant"
        subtitle="Paste a ticket email and instantly see which device it is, where to find it, and what to try - without asking the manager."
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <Card className="border-mcd-red/10 shadow-lg shadow-mcd-red/5">
            <CardHeader
              title={
                <span className="flex items-center gap-2 text-mcd-red drop-shadow-sm">
                  <ClipboardPaste className="w-5 h-5" /> Paste ticket email
                </span>
              }
              subtitle="All parsing happens in your browser - nothing is uploaded or saved"
              action={
                <button
                  onClick={() => setEmail(sampleTicket)}
                  className="btn-ghost text-xs px-3 py-1.5 rounded-lg border border-mcd-gray-200 dark:border-mcd-gray-700 font-medium hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-800 transition-colors"
                >
                  Load example
                </button>
              }
            />
            <CardBody className="bg-mcd-gray-50/30 dark:bg-mcd-gray-800/10">
              <div className="relative">
                <textarea
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSaveState('idle');
                  }}
                  placeholder={'Paste the full ticket email here…\n\nIt should contain lines like:\nStore : #424 AMERIN BALAKONG DT\nIssue :KVS Presenter | Offline\nWorkaround:\n…'}
                  className="w-full h-96 px-5 py-4 rounded-xl border-2 border-mcd-gray-200 dark:border-mcd-gray-700 bg-white dark:bg-mcd-gray-900 text-mcd-gray-900 dark:text-mcd-gray-50 placeholder-mcd-gray-400 dark:placeholder-mcd-gray-500 focus:outline-none focus:border-mcd-red/50 focus:ring-4 focus:ring-mcd-red/10 transition-all font-mono text-[13px] leading-relaxed shadow-inner scrollbar-thin resize-y"
                  spellCheck={false}
                  onKeyDown={handleKeyDown}
                />
                {!email && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-mcd-gray-100/50 dark:bg-mcd-gray-800/50 flex items-center justify-center opacity-50 blur-sm">
                      <ClipboardPaste className="w-10 h-10 text-mcd-gray-300 dark:text-mcd-gray-600" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-medium text-mcd-gray-400 dark:text-mcd-gray-500">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tip: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700 font-mono text-mcd-gray-600 dark:text-mcd-gray-300 shadow-sm">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700 font-mono text-mcd-gray-600 dark:text-mcd-gray-300 shadow-sm">Enter</kbd> to jump to results
                </span>
                {analyzedFlash && (
                  <span className="inline-flex items-center gap-1.5 text-accent-green font-semibold animate-fade-up">
                    <Check className="w-4 h-4" /> Analysed
                  </span>
                )}
              </div>

              {parsed && (
                <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-mcd-gray-200/80 dark:border-mcd-gray-700/60 animate-fade-up">
                  <button onClick={saveToLog} className="btn-secondary flex-1 sm:flex-none justify-center" disabled={saveState === 'saved'}>
                    {saveState === 'saved' ? (
                      <>
                        <Bookmark className="w-4 h-4" /> Saved
                      </>
                    ) : saveState === 'duplicate' ? (
                      <>
                        <Bookmark className="w-4 h-4" /> Already in log
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4" /> Save to log
                      </>
                    )}
                  </button>
                  <button onClick={copyJson} className="btn-ghost px-4 py-2 rounded-xl font-semibold text-sm border border-mcd-gray-200 dark:border-mcd-gray-700 flex-1 sm:flex-none justify-center">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-accent-green" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy JSON
                      </>
                    )}
                  </button>
                  {saveState === 'saved' && (
                    <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm font-semibold text-mcd-red hover:text-mcd-red-dark transition-colors w-full sm:w-auto justify-center mt-2 sm:mt-0 ml-auto">
                      <Inbox className="w-4 h-4" /> Open log
                    </Link>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div id="assistant-results" className="space-y-6 scroll-mt-24">
          {!parsed ? (
            <Card className="h-full border-dashed border-2 border-mcd-gray-200 dark:border-mcd-gray-700 bg-transparent shadow-none hover:border-mcd-gray-300 dark:hover:border-mcd-gray-600 transition-colors">
              <div className="h-full flex flex-col items-center justify-center p-8">
                <EmptyState
                  title="Waiting for a ticket"
                  message="Paste a ticket email on the left. The result will show the device, its location and the steps to troubleshoot."
                />
                
                <div className="mt-8 w-full max-w-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-mcd-gray-400 mb-4 text-center">
                    How it works
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-mcd-gray-800 shadow-sm border border-mcd-gray-100 dark:border-mcd-gray-700">
                      <div className="w-8 h-8 rounded-full bg-mcd-red/10 flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4 text-mcd-red" />
                      </div>
                      <div className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 mt-1.5">
                        Reads the device name from the ticket
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-mcd-gray-800 shadow-sm border border-mcd-gray-100 dark:border-mcd-gray-700">
                      <div className="w-8 h-8 rounded-full bg-mcd-red/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-mcd-red" />
                      </div>
                      <div className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 mt-1.5">
                        Shows exactly where it lives in the store
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-mcd-gray-800 shadow-sm border border-mcd-gray-100 dark:border-mcd-gray-700">
                      <div className="w-8 h-8 rounded-full bg-mcd-red/10 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4 text-mcd-red" />
                      </div>
                      <div className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 mt-1.5">
                        Suggests numbered troubleshooting steps
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="animate-fade-up space-y-6">
              {/* Ticket summary */}
              <Card>
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-mcd-gray-400" /> Ticket summary
                    </span>
                  }
                  action={<Badge variant={priorityColor(parsed.priority).replace('badge-', '') as 'red' | 'yellow' | 'gray'}>{parsed.priority}</Badge>}
                />
                <CardBody className="p-0">
                  <dl className="divide-y divide-mcd-gray-100/80 dark:divide-mcd-gray-700/40 text-sm">
                    <div className="flex justify-between gap-4 px-6 py-4">
                      <dt className="text-mcd-gray-500 font-medium">Ticket #</dt>
                      <dd className="font-mono font-semibold text-mcd-gray-900 dark:text-mcd-gray-50">
                        {parsed.ticketNumber || '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 px-6 py-4">
                      <dt className="text-mcd-gray-500 font-medium">Store</dt>
                      <dd className="font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 text-right">
                        {parsed.storeNumber ? (
                          store ? (
                            <Link to={`/stores/${store.id}`} className="text-mcd-red hover:text-mcd-red-dark transition-colors inline-flex items-center gap-1.5 group">
                              <span className="font-mono opacity-60">#{parsed.storeNumber}</span> {parsed.storeName}
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          ) : (
                            <>#{parsed.storeNumber} {parsed.storeName} <span className="text-[11px] font-normal text-mcd-gray-400 block sm:inline mt-1 sm:mt-0">(not in directory)</span></>
                          )
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 px-6 py-4">
                      <dt className="text-mcd-gray-500 font-medium">Issue</dt>
                      <dd className="text-right font-medium text-mcd-gray-900 dark:text-mcd-gray-50">{parsed.issue || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4 px-6 py-4">
                      <dt className="text-mcd-gray-500 font-medium">Reporter</dt>
                      <dd className="flex flex-col items-end gap-1 font-medium text-mcd-gray-900 dark:text-mcd-gray-50">
                        {parsed.reporterName || '—'}
                        {parsed.reporterPhone && (
                          <a href={telLink(parsed.reporterPhone)} className="inline-flex items-center gap-1.5 text-[13px] text-mcd-red hover:text-mcd-red-dark transition-colors font-semibold bg-mcd-red/5 px-2 py-0.5 rounded-md">
                            <Phone className="w-3 h-3" /> {parsed.reporterPhone}
                          </a>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center gap-4 px-6 py-4 bg-mcd-gray-50/50 dark:bg-mcd-gray-800/20">
                      <dt className="text-mcd-gray-500 font-medium">SLA deadline</dt>
                      <dd className="font-mono font-semibold text-mcd-gray-900 dark:text-mcd-gray-50 flex items-center gap-3">
                        {formatDate(parsed.slaDeadline ?? computeSlaDeadline(new Date().toISOString(), parsed.priority))}
                        {(() => {
                          const sla = slaInfo({
                            createdAt: new Date().toISOString(),
                            priority: parsed.priority,
                            slaDeadline: parsed.slaDeadline,
                            status: 'OPEN',
                          });
                          return sla.state !== 'NONE' ? (
                            <Badge variant={sla.state === 'OVERDUE' ? 'red' : 'yellow'}>{formatSlaLeft(sla.hoursLeft)}</Badge>
                          ) : null;
                        })()}
                      </dd>
                    </div>
                    {parsed.workaround && (
                      <div className="px-6 py-4">
                        <dt className="text-mcd-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                          Workaround (already tried)
                        </dt>
                        <dd className="text-sm font-medium text-mcd-gray-700 dark:text-mcd-gray-200 leading-relaxed p-4 rounded-xl bg-mcd-gray-50 dark:bg-mcd-gray-800 border border-mcd-gray-200/50 dark:border-mcd-gray-700/50">
                          {parsed.workaround}
                        </dd>
                      </div>
                    )}
                    {parsed && searchQuery && (
                      <div className="px-6 py-4 bg-mcd-gray-50/30 dark:bg-mcd-gray-800/10">
                        <dt className="text-mcd-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5" /> Search the web for fixes
                        </dt>
                        {!showSearch ? (
                          <button
                            onClick={() => setShowSearch(true)}
                            className="btn-secondary text-sm w-full font-semibold"
                          >
                            <Globe className="w-4 h-4 mr-2 opacity-70" /> Search Google · DuckDuckGo · Bing
                          </button>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`https://www.google.com/search?q=${searchQuery}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary text-sm flex-1 sm:flex-none justify-center"
                            >
                              <Globe className="w-4 h-4 mr-1.5 opacity-80" /> Google
                            </a>
                            <a
                              href={`https://duckduckgo.com/?q=${searchQuery}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-sm flex-1 sm:flex-none justify-center"
                            >
                              <Globe className="w-4 h-4 mr-1.5 opacity-80" /> DuckDuckGo
                            </a>
                            <a
                              href={`https://www.bing.com/search?q=${searchQuery}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-sm flex-1 sm:flex-none justify-center"
                            >
                              <Globe className="w-4 h-4 mr-1.5 opacity-80" /> Bing
                            </a>
                            <button
                              onClick={() => setShowSearch(false)}
                              className="btn-ghost text-sm flex-1 sm:flex-none justify-center"
                            >
                              Close
                            </button>
                          </div>
                        )}
                        <p className="mt-3 text-[11px] text-mcd-gray-500 font-medium">
                          Query: <code className="font-mono bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200 dark:border-mcd-gray-700 px-1.5 py-0.5 rounded shadow-sm">{decodeURIComponent(searchQuery)}</code>
                        </p>
                      </div>
                    )}
                  </dl>
                </CardBody>
              </Card>

              {/* Unknown device -> suggest a catalog entry */}
              {unknownEntry && (
                <Card className="border-mcd-yellow/40 bg-gradient-to-br from-mcd-yellow/10 to-mcd-yellow/5">
                  <CardHeader
                    title={
                      <span className="flex items-center gap-2 font-bold text-mcd-yellow-dark">
                        <AlertTriangle className="w-5 h-5" /> Device not in catalog
                      </span>
                    }
                    subtitle={
                      <span className="text-mcd-gray-800 dark:text-mcd-gray-200 font-medium">
                        &apos;{unknownEntry.token}&apos; isn&apos;t in the reference yet. Copy this starter
                        entry and add it to <code className="font-mono bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-xs border border-mcd-yellow/20">deviceTypes.ts</code>.
                      </span>
                    }
                  />
                  <CardBody>
                    <pre className="p-4 rounded-xl bg-mcd-gray-900 text-mcd-gray-50 text-[13px] font-mono overflow-auto max-h-56 scrollbar-thin shadow-inner border border-black/20">
                      {unknownEntry.json}
                    </pre>
                    <button onClick={copyUnknownEntry} className="btn-primary text-sm mt-4 font-semibold shadow-md">
                      {copiedEntry ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1.5" /> Copy starter entry
                        </>
                      )}
                    </button>
                  </CardBody>
                </Card>
              )}

              {/* Detected devices */}
              {detected.length > 0 && (
                <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                  <h3 className="section-title">
                    <Search className="w-5 h-5 text-mcd-red" /> Detected device
                  </h3>
                  <div className="space-y-4">
                    {detected.map((d) => {
                      const type = deviceTypeById(d.deviceTypeId);
                      return (
                        <Card key={d.deviceTypeId} className="border-mcd-red/10 shadow-lg shadow-mcd-red/5 overflow-hidden group">
                          <div className="h-1.5 w-full bg-gradient-to-r from-mcd-red to-mcd-red-light" />
                          <CardHeader
                            title={
                              <span className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-xl font-bold text-mcd-red drop-shadow-sm">{d.shortName}</span>
                                {d.index !== undefined && (
                                  <Badge variant="blue">Unit {d.index}</Badge>
                                )}
                                <Badge variant="gray">
                                  {type ? deviceCategories[type.category] : ''}
                                </Badge>
                              </span>
                            }
                            subtitle={
                              <span className="text-base font-semibold text-mcd-gray-800 dark:text-mcd-gray-200 mt-1">
                                {d.fullName}
                              </span>
                            }
                            action={
                              <span className="text-[10px] font-bold uppercase tracking-wider text-mcd-gray-400 bg-mcd-gray-100 dark:bg-mcd-gray-800 px-2 py-1 rounded-md">{d.source}</span>
                            }
                          />
                          <CardBody className="bg-mcd-gray-50/30 dark:bg-mcd-gray-800/10">
                            {type?.locationHint && (
                              <div className="flex items-start gap-3 mb-5 p-4 rounded-xl bg-white dark:bg-mcd-gray-800 border border-mcd-gray-200/80 dark:border-mcd-gray-700/80 text-sm shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-mcd-red/10 flex items-center justify-center shrink-0">
                                  <MapPin className="w-4 h-4 text-mcd-red" />
                                </div>
                                <div>
                                  <div className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-1">
                                    Where to find it
                                  </div>
                                  <div className="font-medium text-mcd-gray-900 dark:text-mcd-gray-50">{type.locationHint}</div>
                                </div>
                              </div>
                            )}
                            <Link to={`/devices/${d.deviceTypeId}`} className="btn-primary w-full justify-center group-hover:scale-[1.02] transition-transform">
                              View Full Device Details <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Link>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Troubleshooting steps */}
              {problem ? (
                <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                  <h3 className="section-title">
                    <Wrench className="w-5 h-5 text-mcd-red" /> Suggested troubleshooting
                  </h3>
                  <Card className="border-mcd-yellow/20 shadow-lg shadow-mcd-yellow/5">
                    <CardHeader
                      title={<span className="font-bold text-lg">{problem.title}</span>}
                      action={
                        <Badge variant={problem.confidence === 'high' ? 'green' : 'yellow'}>
                          {problem.confidence === 'high' ? 'High match' : 'Possible match'}
                        </Badge>
                      }
                    />
                    <CardBody>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-mcd-gray-400 mb-4">
                        Try these steps in order
                      </div>
                      <ol className="space-y-3">
                        {problem.workaround.map((step, i) => (
                          <li key={step} className="flex items-start gap-4 text-sm font-medium text-mcd-gray-800 dark:text-mcd-gray-100 p-3 rounded-xl bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30 border border-mcd-gray-100 dark:border-mcd-gray-700">
                            <span className="w-7 h-7 rounded-lg bg-white dark:bg-mcd-gray-900 shadow-sm border border-mcd-gray-200 dark:border-mcd-gray-700 text-mcd-red font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed mt-1">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl gradient-border bg-gradient-to-br from-mcd-yellow/[0.08] to-mcd-yellow/[0.02]">
                        <AlertTriangle className="w-5 h-5 text-mcd-yellow-dark shrink-0 mt-0.5" />
                        <span className="font-medium text-sm text-mcd-gray-800 dark:text-mcd-gray-100 leading-relaxed">{problem.resolution}</span>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ) : (
                detected.length > 0 && (
                  <Card className="p-6 bg-mcd-gray-50/50 dark:bg-mcd-gray-800/30 border-dashed border-2 border-mcd-gray-200 dark:border-mcd-gray-700">
                    <div className="flex items-start gap-4 text-sm font-medium text-mcd-gray-600 dark:text-mcd-gray-300">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-mcd-gray-900 shadow-sm flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-mcd-yellow-dark" />
                      </div>
                      <span className="leading-relaxed mt-1">
                        No matching issue pattern found for this device yet. Check the full device
                        page for available troubleshooting, then consider adding this issue
                        to the catalog.
                      </span>
                    </div>
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
