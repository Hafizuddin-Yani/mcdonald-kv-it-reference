import type { SavedTicket, Ticket } from '../types';
import { deviceTypes } from '../data/deviceTypes';
import { detectDevices, matchProblem } from './ticketParser';
import { scrubReporter } from './scrub';

/** A ticket that has been analyzed (either from the local log or reference data). */
export type AnalyzableTicket = SavedTicket | Ticket;

export interface TicketCombo {
  key: string;
  deviceShortName: string;
  deviceId?: string;
  problem: string;
  count: number;
  recentCount: number;
  /** True if an existing commonIssue already covers this device+problem. */
  covered: boolean;
  matchedIssueTitle?: string;
}

export interface NewIssueAlert {
  deviceShortName: string;
  deviceId?: string;
  problem: string;
  issueText: string;
  count: number;
  suggestionJson: string;
}

const PROBLEM_LABELS: { id: string; keywords: RegExp }[] = [
  { id: 'Blank / no display', keywords: /\b(blank|white screen|black screen|no display|no screen|flicker|frozen)/i },
  { id: 'Offline / network', keywords: /\b(offline|0\/0|cannot connect|no network|not reachable|server down|internet down)\b/i },
  { id: 'Frozen / unresponsive', keywords: /\b(frozen|hang|stuck|not responding|unresponsive|no respond|freeze)\b/i },
  { id: 'No sound / audio', keywords: /\b(no sound|static|can't hear|cannot hear|no audio|mute)\b/i },
  { id: 'Printer / paper', keywords: /\b(printer|paper jam|no paper|not printing|no receipt|label)\b/i },
  { id: 'Power', keywords: /\b(power|no power|won't turn on|dead|battery|beeping)\b/i },
];

/** Map a ticket issue line to a coarse problem label. */
export function problemLabel(issue: string): string {
  const text = issue ?? '';
  for (const p of PROBLEM_LABELS) {
    if (p.keywords.test(text)) return p.id;
  }
  return 'Other';
}

function recentCount(tickets: AnalyzableTicket[], days = 7): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return tickets.filter((t) => {
    const d = new Date(t.createdAt).getTime();
    return !Number.isNaN(d) && d >= cutoff;
  }).length;
}

/** Whether an existing commonIssue for the device covers this problem label. */
function isCovered(deviceId: string | undefined, problem: string): string | undefined {
  if (!deviceId) return undefined;
  const type = deviceTypes.find((d) => d.id === deviceId);
  const issues = type?.commonIssues ?? [];
  if (issues.length === 0) return undefined;
  const hay = issues.map((i) => i.title.toLowerCase()).join(' ');
  const tokens = problem.replace(/[/\\]/g, ' ').toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.some((t) => hay.includes(t))) {
    const hit = issues.find((i) =>
      tokens.some((t) => i.title.toLowerCase().includes(t) || i.symptoms.join(' ').toLowerCase().includes(t))
    );
    return hit?.title;
  }
  return undefined;
}

/**
 * Compute insights from a list of tickets (local log + reference data).
 * All numbers are derived in the browser - no server involved.
 */
export function computeInsights(tickets: AnalyzableTicket[]) {
  // Analyze each ticket once.
  const analyzed = tickets.map((t) => {
    const issue = t.issue ?? '';
    const problem = problemLabel(issue);
    const parsed = {
      ticketNumber: t.id,
      storeNumber: t.storeNumber,
      storeName: 'storeName' in t ? (t.storeName ?? '') : '',
      priority: t.priority,
      issue,
      reporterName: t.reporter?.name ?? '',
      reporterPhone: t.reporter?.phone ?? '',
      workaround: t.workaround ?? '',
      raw: '',
    };
    const device = detectDevices(parsed)[0];
    const matched = device ? matchProblem(parsed, device) : null;
    return { t, problem, device, matched };
  });

  // Top devices by ticket count.
  const deviceCounts = new Map<string, { name: string; id?: string; count: number; recent: number }>();
  for (const { t, device } of analyzed) {
    const name = device?.shortName ?? (t.deviceShortName || 'Unknown');
    const cur = deviceCounts.get(name) ?? { name, id: device?.deviceTypeId, count: 0, recent: 0 };
    cur.count += 1;
    cur.recent += recentCount([t]);
    deviceCounts.set(name, cur);
  }
  const topDevices = [...deviceCounts.entries()]
    .map(([, v]) => v)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top problem types.
  const problemCounts = new Map<string, number>();
  for (const { problem } of analyzed) {
    problemCounts.set(problem, (problemCounts.get(problem) ?? 0) + 1);
  }
  const topProblems = [...problemCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Weekly trend (last 8 weeks).
  const weekBuckets: { start: Date; count: number }[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const count = tickets.filter((t) => {
      const d = new Date(t.createdAt).getTime();
      return !Number.isNaN(d) && d >= start.getTime() && d < end.getTime();
    }).length;
    weekBuckets.push({ start, count });
  }
  const maxWeek = Math.max(1, ...weekBuckets.map((w) => w.count));

  // Device + problem combos (frequency ranked).
  const comboMap = new Map<string, TicketCombo>();
  for (const { t, device, problem } of analyzed) {
    const name = device?.shortName ?? (t.deviceShortName || 'Unknown');
    const key = `${name}::${problem}`;
    const cur = comboMap.get(key) ?? {
      key,
      deviceShortName: name,
      deviceId: device?.deviceTypeId,
      problem,
      count: 0,
      recentCount: 0,
      covered: false,
    };
    cur.count += 1;
    cur.recentCount += recentCount([t]);
    cur.covered = Boolean(isCovered(cur.deviceId, problem));
    const matchedTitle = isCovered(cur.deviceId, problem);
    if (matchedTitle) cur.matchedIssueTitle = matchedTitle;
    comboMap.set(key, cur);
  }
  const combos = [...comboMap.values()].sort((a, b) => b.recentCount - a.recentCount || b.count - a.count);

  // New / unseen issue alerts: combos not covered by the catalog.
  const newIssueAlerts: NewIssueAlert[] = combos
    .filter((c) => !c.covered)
    .map((c) => {
      const sample = analyzed.find((a) => a.problem === c.problem && (a.device?.shortName ?? a.t.deviceShortName) === c.deviceShortName);
      const issueText = sample?.t.issue ?? c.problem;
      const suggestionJson = JSON.stringify(
        {
          id: `${c.deviceId ?? 'DEVICE'}-${c.problem.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase()}`,
          title: `${c.problem}`,
          symptoms: [issueText],
          workaround: [],
          resolution: 'TBD - verify with senior engineer and add the worked steps here.',
          priority: 'NORMAL',
          frequency: 'OCCASIONAL',
        },
        null,
        2
      );
      return {
        deviceShortName: c.deviceShortName,
        deviceId: c.deviceId,
        problem: c.problem,
        issueText,
        count: c.count,
        suggestionJson,
      };
    });

  // Escalation watch: tickets whose text already points at escalation / onsite.
  const ESCALATION_RE = /\b(escalate|onsite|on-site|site visit|request.*visit)\b/i;
  const escalationCount = analyzed.filter(({ t }) =>
    ESCALATION_RE.test(`${t.issue ?? ''} ${t.workaround ?? ''}`)
  ).length;

  // Repeat-trouble stores: stores with 2+ tickets on record.
  const storeMap = new Map<
    string,
    { storeNumber: string; storeName: string; count: number; issues: string[] }
  >();
  for (const { t } of analyzed) {
    if (!t.storeNumber) continue;
    const cur = storeMap.get(t.storeNumber) ?? {
      storeNumber: t.storeNumber,
      storeName: 'storeName' in t ? (t.storeName ?? '') : '',
      count: 0,
      issues: [],
    };
    cur.count += 1;
    const issue = (t.issue ?? '').trim();
    if (issue && !cur.issues.includes(issue)) cur.issues.push(issue);
    storeMap.set(t.storeNumber, cur);
  }
  const repeatStores = [...storeMap.values()]
    .filter((s) => s.count >= 2)
    .sort((a, b) => b.count - a.count);

  return {
    analyzed,
    topDevices,
    topProblems,
    weekBuckets,
    maxWeek,
    combos,
    newIssueAlerts,
    escalations: {
      count: escalationCount,
      pct: analyzed.length > 0 ? Math.round((escalationCount / analyzed.length) * 100) : 0,
    },
    repeatStores,
  };
}

/** Build scrubbed JSON (no raw emails) ready to paste into tickets.ts. */
export function buildTicketsExport(saved: SavedTicket[]): string {
  const rows = saved.map((t) => ({
    id: t.id,
    storeNumber: t.storeNumber,
    deviceShortName: t.deviceShortName,
    issue: t.issue,
    priority: t.priority,
    status: 'OPEN',
    createdAt: t.createdAt,
    slaDeadline: t.slaDeadline,
    reporter: scrubReporter(),
    workaround: t.workaround,
    assignedTo: 'Juden',
  }));
  return JSON.stringify(rows, null, 2);
}

/**
 * Build a PII-safe CSV (reporter columns omitted) for sharing and analysis
 * in Excel / Google Sheets. Escapes quotes, commas and newlines per RFC 4180.
 */
export function buildTicketsCsv(saved: SavedTicket[]): string {
  const esc = (v: unknown): string => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = [
    'id',
    'storeNumber',
    'storeName',
    'deviceShortName',
    'issue',
    'priority',
    'status',
    'createdAt',
    'slaDeadline',
    'workaround',
  ];
  const rows = saved.map((t) =>
    [
      t.id,
      t.storeNumber,
      t.storeName ?? '',
      t.deviceShortName,
      t.issue,
      t.priority,
      t.status,
      t.createdAt,
      t.slaDeadline ?? '',
      t.workaround ?? '',
    ]
      .map(esc)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}
