import { useMemo } from 'react';
import { searchDeviceTypes } from '../data/deviceTypes';
import { stores } from '../data/stores';
import { deviceMentions } from '../data/naming';
import { useSavedTickets } from './useSavedTickets';
import type { SearchResult } from '../types';
import { parseDeviceName } from '../utils';

/**
 * Global fuzzy search across stores, devices, and naming mentions.
 * Results are built client-side; no server required.
 */
export function useSearch(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  const { saved } = useSavedTickets();

  const storeResults: SearchResult[] = useMemo(() => {
    if (!q) return [];
    const out: SearchResult[] = [];
    for (const s of stores) {
      const hay = `${s.number} ${s.name} ${s.district} ${s.address}`.toLowerCase();
      let score = 0;
      if (hay.includes(q)) score = 1;
      if (s.number === q || s.number.startsWith(q)) score += 2;
      if (s.name.toLowerCase().includes(q)) score += 1.5;
      if (!score) continue;
      out.push({
        type: 'store',
        id: s.id,
        title: `#${s.number} ${s.name}`,
        subtitle: s.district,
        url: `/stores/${s.id}`,
        score,
      });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [q]);

  const deviceResults: SearchResult[] = useMemo(() => {
    if (!q) return [];
    return searchDeviceTypes(q)
      .map((d) => ({
        type: 'device' as const,
        id: d.id,
        title: d.shortName,
        subtitle: d.fullName,
        description: d.description,
        url: `/devices/${d.id}`,
        score: d.shortName.toLowerCase() === q ? 3 : 1,
      }))
      .slice(0, 10);
  }, [q]);

  const mentionResults: SearchResult[] = useMemo(() => {
    if (!q) return [];
    const { name } = parseDeviceName(q);
    const keys = Object.keys(deviceMentions);
    const matches = keys.filter((k) => k.toLowerCase() === name.toLowerCase() || k.toLowerCase().includes(q));
    if (!matches.length) return [];
    return matches.slice(0, 5).map((k) => ({
      type: 'naming' as const,
      id: k,
      title: k,
      subtitle: deviceMentions[k],
      url: `/naming?q=${encodeURIComponent(k)}`,
      score: 2,
    }));
  }, [q]);

  // Saved tickets by id / store / device / issue. Reporter names and phones are
  // intentionally NOT indexed (PII guard - they stay in the browser only).
  const ticketResults: SearchResult[] = useMemo(() => {
    if (!q) return [];
    const out: SearchResult[] = [];
    for (const t of saved) {
      const hay = `${t.id} ${t.storeNumber} ${t.storeName ?? ''} ${t.deviceShortName} ${t.issue}`.toLowerCase();
      if (!hay.includes(q)) continue;
      const idLower = t.id.toLowerCase();
      let score = 1;
      if (idLower === q) score = 3;
      else if (idLower.includes(q)) score = 2;
      else if (t.deviceShortName.toLowerCase().includes(q)) score = 1.5;
      out.push({
        type: 'ticket' as const,
        id: t.id,
        title: `${t.id} · ${t.deviceShortName}`,
        subtitle: `#${t.storeNumber} ${t.storeName ?? ''} — ${t.issue}`,
        url: '/tickets',
        score,
      });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [q, saved]);

  return useMemo(
    () =>
      [...storeResults, ...deviceResults, ...mentionResults, ...ticketResults].sort(
        (a, b) => b.score - a.score
      ),
    [storeResults, deviceResults, mentionResults, ticketResults]
  );
}
