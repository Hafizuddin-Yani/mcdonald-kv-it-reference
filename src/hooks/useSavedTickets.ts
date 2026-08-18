import { useCallback, useSyncExternalStore } from 'react';
import type { SavedTicket, Ticket } from '../types';
import { tickets } from '../data/tickets';

const STORAGE_KEY = 'mcdkv.savedTickets.v1';
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

// ── Shared module store ───────────────────────────────────────────────────
// Kept outside React so every consumer of useSavedTickets sees the same list
// (Ticket Assistant saves, while the Header search and Ticket Log read it).
let savedTickets: SavedTicket[] = loadSaved();
const listeners = new Set<() => void>();

function loadSaved(): SavedTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is SavedTicket => t && typeof t === 'object' && typeof t.id === 'string');
  } catch {
    return [];
  }
}

function persist(list: SavedTicket[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage full or unavailable - silently ignore so the app keeps working.
  }
}

function setTickets(updater: (prev: SavedTicket[]) => SavedTicket[]) {
  savedTickets = updater(savedTickets);
  persist(savedTickets);
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return savedTickets;
}

/**
 * Local-only saved ticket log (survives refresh, works offline).
 * Tickets saved here can be exported to tickets.ts for the shared reference.
 */
export function useSavedTickets() {
  const saved = useSyncExternalStore(subscribe, getSnapshot);

  const saveTicket = useCallback((ticket: SavedTicket) => {
    setTickets((prev) => {
      if (prev.some((t) => t.id === ticket.id)) return prev;
      return [ticket, ...prev];
    });
  }, []);

  const deleteTicket = useCallback((id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setTickets(() => []);
  }, []);

  /** True if the id already exists locally or in the committed reference data. */
  const hasTicket = useCallback(
    (id: string) => saved.some((t) => t.id === id) || tickets.some((t) => t.id === id),
    [saved]
  );

  /**
   * Import tickets from pasted JSON (e.g. from another engineer). Validates the
   * shape, dedupes against the local log and the committed reference data, and
   * returns how many were added / skipped as duplicates or invalid rows.
   */
  const importTickets = useCallback(
    (rows: unknown[]): { imported: number; skipped: number } => {
      const existing = new Set<string>([
        ...savedTickets.map((t) => t.id),
        ...tickets.map((t) => t.id),
      ]);
      let imported = 0;
      let skipped = 0;
      const fresh: SavedTicket[] = [];

      for (const r of rows) {
        if (!r || typeof r !== 'object') {
          skipped += 1;
          continue;
        }
        const o = r as Record<string, unknown>;
        if (typeof o.id !== 'string' || !o.id.trim()) {
          skipped += 1;
          continue;
        }
        const rep = o.reporter;
        const priority = (PRIORITIES as string[]).includes(o.priority as string)
          ? (o.priority as Ticket['priority'])
          : 'NORMAL';
        const status = (STATUSES as string[]).includes(o.status as string)
          ? (o.status as Ticket['status'])
          : 'OPEN';
        const ticket: SavedTicket = {
          id: o.id,
          storeNumber: typeof o.storeNumber === 'string' ? o.storeNumber : '',
          storeName: typeof o.storeName === 'string' ? o.storeName : undefined,
          deviceShortName: typeof o.deviceShortName === 'string' ? o.deviceShortName : '',
          issue: typeof o.issue === 'string' ? o.issue : '',
          priority,
          status,
          createdAt: typeof o.createdAt === 'string' ? o.createdAt : new Date().toISOString(),
          slaDeadline: typeof o.slaDeadline === 'string' ? o.slaDeadline : undefined,
          reporter: {
            name: rep && typeof rep === 'object' && typeof (rep as { name?: unknown }).name === 'string'
              ? (rep as { name: string }).name
              : '',
            phone: rep && typeof rep === 'object' && typeof (rep as { phone?: unknown }).phone === 'string'
              ? (rep as { phone: string }).phone
              : '',
          },
          workaround: typeof o.workaround === 'string' ? o.workaround : undefined,
          raw: typeof o.raw === 'string' ? o.raw : undefined,
          savedAt: new Date().toISOString(),
        };
        if (existing.has(ticket.id)) {
          skipped += 1;
          continue;
        }
        existing.add(ticket.id);
        fresh.push(ticket);
        imported += 1;
      }

      if (fresh.length) setTickets((prev) => [...fresh, ...prev]);
      return { imported, skipped };
    },
    []
  );

  return { saved, saveTicket, deleteTicket, clearAll, hasTicket, importTickets };
}
