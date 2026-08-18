import { useSyncExternalStore } from 'react';

/**
 * Client-side diagnostics log.
 *
 * Captures uncaught errors, unhandled promise rejections and render failures
 * so issues seen in the field can be reviewed on the App Health page - no
 * server needed. Persisted to localStorage, capped, and never throws.
 */

export type DiagnosticType = 'error' | 'rejection' | 'render';

export interface DiagnosticEntry {
  at: string;
  type: DiagnosticType;
  message: string;
  source?: string;
  stack?: string;
  url?: string;
}

const STORAGE_KEY = 'mcdkv.diagnostics.v1';
const MAX = 50;

let entries: DiagnosticEntry[] = load();
const listeners = new Set<() => void>();

function load(): DiagnosticEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is DiagnosticEntry =>
          !!e && typeof e === 'object' && typeof e.at === 'string' && typeof e.message === 'string'
      )
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX)));
  } catch {
    // Storage unavailable - keep the in-memory copy for this session.
  }
}

function notify() {
  for (const l of listeners) l();
}

/** Best-effort capture - never throws, never blocks the app. */
export function reportDiagnostic(entry: Omit<DiagnosticEntry, 'at'>): void {
  try {
    entries = [{ at: new Date().toISOString(), ...entry }, ...entries].slice(0, MAX);
    persist();
    notify();
  } catch {
    // ignore
  }
}

export function clearDiagnostics(): void {
  try {
    entries = [];
    persist();
    notify();
  } catch {
    // ignore
  }
}

export function useDiagnostics(): DiagnosticEntry[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => entries
  );
}
