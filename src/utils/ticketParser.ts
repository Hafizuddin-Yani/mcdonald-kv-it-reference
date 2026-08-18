import type { DetectedDevice, MatchedProblem, ParsedTicket } from '../types';
import { deviceTypes } from '../data/deviceTypes';
import { stores } from '../data/stores';

/**
 * Client-side parser for McDonald's MY Klang Valley ticket emails.
 *
 * Everything runs in the browser - pasted email text is never uploaded
 * or persisted. Use the "Analyze" button on the Ticket Assistant page.
 */

/** Extract a field value by anchored line regex. Group-less regexes use the full match. */
function extract(pattern: RegExp, text: string): string {
  const m = text.match(pattern);
  const v = m ? (m[1] ?? m[0]) : '';
  return v.trim();
}

/**
 * Read the SLA TTR deadline from the ticket header, e.g.
 * "Please note SLA TTR (Time to resolve) for this ticket will be end on 01-08-2026 08:14".
 * The timestamp is local Malaysia time (+08:00) and is converted to UTC ISO.
 */
function extractSlaDeadline(text: string): string | undefined {
  const m = text.match(
    /(?:SLA[^\n]*?|TTR[^\n]*?)?\bend\s+on\s+(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})/i
  );
  if (!m) return undefined;
  const [, dd, mm, yyyy, hh, min] = m;
  const iso = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}:00+08:00`;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toISOString();
}

/**
 * Parse the raw ticket email body into structured fields.
 * Returns null if it doesn't look like a ticket.
 */
export function parseTicketEmail(raw: string): ParsedTicket | null {
  const trimmed = raw.trim();
  if (trimmed.length < 40) return null;

  const hasTicketMarker =
    /Ticket\s*(?:Number|ID)?\s*:/i.test(trimmed) ||
    /Store\s*(?:Number)?\s*:/i.test(trimmed) ||
    /ITH\d+/i.test(trimmed);

  if (!hasTicketMarker) return null;

  const ticketNumber =
    extract(/^\s*Ticket\s*(?:Number|ID)?\s*:\s*([A-Za-z0-9_-]+)/im, trimmed) ||
    extract(/ITH\d+/i, trimmed);

  const storeLine = extract(/^\s*Store\s*(?:Number)?\s*:\s*(.+)/im, trimmed);
  const storeMatch = storeLine.match(/(?:#)?(\d+)\s+([^\n]+)/i);
  const storeNumber = storeMatch ? storeMatch[1] : '';
  const storeName = storeMatch ? storeMatch[2].trim() : storeLine;

  const issueMatch = trimmed.match(
    /^\s*Issue\s*:\s*([\s\S]*?)(?=^\s*(?:Ticket|Store|Priority|Reporter|Workaround|Activity|SLA)\s*:)/im
  );
  const issue = issueMatch
    ? issueMatch[1].trim()
    : extract(/^\s*Issue\s*:\s*(.+)/im, trimmed);

  let priorityRaw = extract(/^\s*Priority\s*:\s*(.+)/im, trimmed);
  if (!priorityRaw) {
    // Fall back to the SLA header line: "SLA for this ticket is Priority 2 - HIGH."
    const inline = trimmed.match(
      /SLA for this ticket is Priority\s*\d+\s*-\s*(CRITICAL|HIGH|NORMAL|LOW)/i
    );
    priorityRaw = inline ? inline[1] : '';
  }
  const priority: ParsedTicket['priority'] = priorityRaw.toUpperCase().includes('CRITICAL')
    ? 'CRITICAL'
    : priorityRaw.toUpperCase().includes('HIGH')
      ? 'HIGH'
      : priorityRaw.toUpperCase().includes('NORMAL') || priorityRaw.includes('P3')
        ? 'NORMAL'
        : 'LOW';

  const reporterName = extract(/^\s*Reporter\s*Name\s*:\s*(.+)/im, trimmed);
  const reporterPhone = extract(/^\s*Reporter\s*Phone\s*:\s*([^\n]+)/im, trimmed);

  const workaroundMatch = trimmed.match(
    /Workaround\s*:([\s\S]*?)(?:\nSLA|\nDetails of the ticket|\nTicket Number|$)/i
  );
  const workaround = workaroundMatch
    ? workaroundMatch[1].trim().replace(/\s+/g, ' ')
    : '';

  if (!ticketNumber && !storeNumber && !issue && !workaround) return null;

  return {
    ticketNumber,
    storeNumber,
    storeName,
    priority,
    issue,
    reporterName,
    reporterPhone,
    workaround,
    slaDeadline: extractSlaDeadline(trimmed),
    raw: trimmed,
  };
}

/** Sort device candidates by match specificity: longest name first. */
function buildDevicePatterns(): { type: (typeof deviceTypes)[number]; pattern: RegExp }[] {
  return deviceTypes
    .slice()
    .sort((a, b) => b.shortName.length - a.shortName.length)
    .map((type) => {
      const names = [type.shortName, type.id, ...(type.searchKeywords ?? [])];
      const escaped = names
        .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .sort((a, b) => b.length - a.length)
        .join('|');
      return { type, pattern: new RegExp(`\\b(${escaped})\\b`, 'gi') };
    });
}

/**
 * Detect all devices mentioned in the ticket (issue line + workaround).
 * Returns matched devices with their unit index when present (e.g. "COD 2" -> index 2).
 */
export function detectDevices(parsed: ParsedTicket): DetectedDevice[] {
  const corpus = `${parsed.issue}\n${parsed.workaround}`;
  const patterns = buildDevicePatterns();
  const found: DetectedDevice[] = [];
  const usedTypeIds = new Set<string>();

  for (const { type, pattern } of patterns) {
    if (usedTypeIds.has(type.id)) continue;

    const m = corpus.match(pattern);
    if (!m) continue;

    // Try to read a unit index right after the match: "COD 2" / "COD2"
    let index: number | undefined;
    const afterIndex = corpus.slice((m.index ?? 0) + m[0].length).match(/^\s*(\d+)/);
    if (afterIndex) {
      index = parseInt(afterIndex[1], 10);
    } else {
      const inline = m[0].match(/(\d+)$/);
      if (inline) index = parseInt(inline[1], 10);
    }

    const source = parsed.issue.toLowerCase().includes(m[0].toLowerCase())
      ? 'Issue line'
      : 'Workaround';

    found.push({
      deviceTypeId: type.id,
      shortName: type.shortName,
      fullName: type.fullName,
      index,
      matched: m[0],
      source,
    });

    usedTypeIds.add(type.id);
  }

  // Prefer matches found on the issue line (the primary device), then the
  // earliest occurrence in the line - device names lead the problem text
  // ("SOK 32 Fail to Print Receipt", "COD 2 | BLANK").
  return found.sort((a, b) => {
    if (a.source !== b.source) return a.source === 'Issue line' ? -1 : 1;
    const hay = a.source === 'Issue line' ? parsed.issue.toLowerCase() : parsed.workaround.toLowerCase();
    const ia = hay.indexOf(a.matched.toLowerCase());
    const ib = hay.indexOf(b.matched.toLowerCase());
    if (ia !== ib) return ia - ib;
    return b.matched.length - a.matched.length;
  });
}

const PROBLEM_PATTERNS: { id: string; keywords: RegExp; label: string }[] = [
  {
    id: 'BLANK',
    keywords: /\b(blank|white screen|black screen|no display|no screen|flicker)\b/i,
    label: 'Blank / no display',
  },
  {
    id: 'OFFLINE',
    keywords: /\b(offline|0\/0|cannot connect|no network|not reachable|server down)\b/i,
    label: 'Offline / network',
  },
  {
    id: 'FROZEN',
    keywords: /\b(frozen|hang|stuck|not responding|unresponsive|no respond)\b/i,
    label: 'Frozen / unresponsive',
  },
  {
    id: 'NO_SOUND',
    keywords: /\b(no sound|static|can't hear|cannot hear|no audio)\b/i,
    label: 'No sound / audio',
  },
  {
    id: 'PRINTER',
    keywords: /\b(printer|paper jam|no paper|not printing|no receipt)\b/i,
    label: 'Printer / paper',
  },
  {
    id: 'POWER',
    keywords: /\b(power|no power|won't turn on|dead|battery|beeping)\b/i,
    label: 'Power',
  },
];

/**
 * Match the ticket text against known problems and pick the most relevant
 * common-issue for the primary detected device.
 */
export function matchProblem(
  parsed: ParsedTicket,
  detected: DetectedDevice
): MatchedProblem | null {
  const corpus = `${parsed.issue}\n${parsed.workaround}`;
  const deviceType = deviceTypes.find((d) => d.id === detected.deviceTypeId);
  if (!deviceType?.commonIssues?.length) return null;

  // Rank by which problem label matches the ticket text.
  const ranked = deviceType.commonIssues
    .map((issue) => {
      const haystack = `${issue.title} ${issue.symptoms.join(' ')} ${issue.workaround.join(' ')}`.toLowerCase();
      let score = 0;
      for (const p of PROBLEM_PATTERNS) {
        if (p.keywords.test(corpus)) {
          const inIssue = haystack.includes(p.label.toLowerCase());
          const anyKeyword = p.keywords.test(haystack);
          if (inIssue || anyKeyword) score += 3;
          else score += 1;
        }
      }
      // Direct title match boosts.
      if (corpus.toLowerCase().includes(issue.title.toLowerCase())) score += 4;
      return { issue, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score === 0) return null;

  return {
    issueId: best.issue.id,
    title: best.issue.title,
    priority: best.issue.priority,
    symptoms: best.issue.symptoms,
    workaround: best.issue.workaround,
    resolution: best.issue.resolution,
    confidence: best.score >= 4 ? 'high' : 'medium',
  };
}

export function buildSearchQuery(_parsed: ParsedTicket, device: DetectedDevice, problem: MatchedProblem | null): string {
  const parts: string[] = [];

  // Device name (full name preferred for broader search)
  parts.push(device.fullName);

  // Problem label (e.g. "Blank / White Screen", "Offline / Network")
  let cleanTitle = '';
  if (problem) {
    // Clean up the problem title: remove slashes, extra spaces
    cleanTitle = problem.title
      .replace(/[/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    parts.push(cleanTitle);
  }

  // If device short name differs and is short (COD, TC, etc.), add it too,
  // unless the problem title already contains it as a word (e.g. "COD Blank")
  const titleHasShortName = new RegExp(`\\b${escapeRegExp(device.shortName)}\\b`, 'i').test(cleanTitle);
  if (
    device.shortName !== device.fullName &&
    device.shortName.length <= 4 &&
    !titleHasShortName
  ) {
    parts.push(device.shortName);
  }

  // Add generic fix/troubleshooting terms
  parts.push('troubleshooting');
  parts.push('fix');

  // Encode for URL query
  return encodeURIComponent(parts.join(' '));
}

/** Escape a string for safe use inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Look up the store record by a store number string. */
export function findStoreByNumber(storeNumber: string) {
  if (!storeNumber) return undefined;
  return stores.find(
    (s) => s.number === storeNumber || s.id === storeNumber || `#${s.number}` === storeNumber
  );
}

/**
 * When a ticket's device is not in the catalog, derive a starter catalog entry
 * from the issue line so the user can grow the reference from real tickets.
 */
export function suggestDeviceEntry(issue: string): { token: string; json: string } | null {
  const text = (issue ?? '').trim();
  if (!text) return null;

  // Device token usually leads the issue: "COD 2 | BLANK", "KVS Presenter | Offline",
  // "SOK 32 Fail to Print Receipt". Split off the problem description.
  const segment = text
    .split(/\s*\|\s*|\s*[-–—]\s*|\s+Fail(?:ure)?\b|\s+Error\b|\s+(?:Not|No)\b|\s+Problem\b/i)[0]
    .replace(/\s+/g, ' ')
    .trim();
  if (!segment || segment.length < 2) return null;

  const token = segment;
  const shortName = segment.replace(/\s+\d+$/, '').trim();
  if (!shortName) return null;

  const id = shortName.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
  const json = JSON.stringify(
    {
      id,
      shortName,
      fullName: shortName,
      category: 'OTHER',
      description: `ADD: describe what ${shortName} is and where it sits in the store`,
      namingPattern: `${shortName}<NN> (e.g. ${token})`,
      examples: [token],
      locationHint: 'ADD: how to find it in the store',
      searchKeywords: [shortName.toLowerCase(), token.toLowerCase()],
      commonIssues: [],
    },
    null,
    2
  );

  return { token, json };
}
