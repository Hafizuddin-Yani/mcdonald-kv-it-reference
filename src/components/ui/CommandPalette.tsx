import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, CornerDownLeft, Building2, MonitorSmartphone, Tags, Inbox, Home, Sparkles } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { cx } from '../../utils';
import type { SearchResult } from '../../types';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const pageLinks: { type: string; title: string; subtitle: string; url: string }[] = [
  { type: 'page', title: 'Dashboard', subtitle: 'Overview & quick access', url: '/' },
  { type: 'page', title: 'Ticket Assistant', subtitle: 'Paste a ticket email to decode it', url: '/ticket' },
  { type: 'page', title: 'Ticket Log & Insights', subtitle: 'Saved tickets, trends & SLA', url: '/tickets' },
  { type: 'page', title: 'Stores Directory', subtitle: 'Klang Valley stores by district', url: '/stores' },
  { type: 'page', title: 'Device Catalog', subtitle: 'TC, KVS, COD, DT headsets and more', url: '/devices' },
  { type: 'page', title: 'Naming Conventions', subtitle: 'What ticket device names mean', url: '/naming' },
  { type: 'page', title: 'Troubleshooting', subtitle: 'Common issues & workarounds', url: '/troubleshooting' },
  { type: 'page', title: 'Onboarding', subtitle: 'New engineer field guide', url: '/onboarding' },
  { type: 'page', title: 'App Health', subtitle: 'Version, diagnostics & offline status', url: '/health' },
];

const typeIcon = {
  page: Home,
  store: Building2,
  device: MonitorSmartphone,
  naming: Tags,
  ticket: Inbox,
};

const typeLabel: Record<string, string> = {
  page: 'Page',
  store: 'Store',
  device: 'Device',
  naming: 'Naming',
  ticket: 'Ticket',
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchResults = useSearch(query);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = q ? pageLinks.filter((p) => `${p.title} ${p.subtitle}`.toLowerCase().includes(q)) : pageLinks;
    const pagesAsResults: SearchResult[] = pages.map((p, i) => ({
      type: 'page' as const,
      id: `page-${i}`,
      title: p.title,
      subtitle: p.subtitle,
      url: p.url,
      score: 0,
    }));
    return [...pagesAsResults, ...searchResults];
  }, [searchResults, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!items.length) return;
    const active = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, items.length]);

  if (!open) return null;

  const goTo = (item: SearchResult) => {
    navigate(item.url);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) goTo(item);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Quick search">
      <button
        className="absolute inset-0 animate-backdrop-in bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close search"
      />
      <div className="relative mx-auto mt-[12vh] w-[min(92vw,36rem)] animate-scale-in">
        <div className="overflow-hidden rounded-3xl border border-mcd-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-mcd-gray-700/70 dark:bg-mcd-gray-900/95">
          <div className="flex items-center gap-3 border-b border-mcd-gray-100/80 px-4 dark:border-mcd-gray-800/80">
            <Search className="h-5 w-5 shrink-0 text-mcd-red" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search pages, stores, devices, tickets…"
              className="h-16 w-full bg-transparent text-base text-mcd-gray-900 placeholder-mcd-gray-400 focus:outline-none dark:text-mcd-gray-50 dark:placeholder-mcd-gray-500"
            />
            <kbd className="hidden shrink-0 rounded-lg border border-mcd-gray-200/80 bg-mcd-gray-50/50 px-2 py-1 font-mono text-[10px] font-semibold text-mcd-gray-400 sm:block dark:border-mcd-gray-700/80 dark:bg-mcd-gray-800/50">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2 scrollbar-thin">
            {items.length === 0 ? (
              <div className="px-3 py-12 flex flex-col items-center justify-center text-center text-sm text-mcd-gray-400">
                <div className="w-12 h-12 rounded-xl bg-mcd-gray-50 dark:bg-mcd-gray-800/50 flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-mcd-gray-300 dark:text-mcd-gray-600" />
                </div>
                No results for &ldquo;<span className="text-mcd-gray-900 dark:text-mcd-gray-50">{query}</span>&rdquo;
              </div>
            ) : (
              items.map((item, i) => {
                const Icon = typeIcon[item.type] ?? Search;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    data-index={i}
                    onClick={() => goTo(item)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cx(
                      'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200',
                      i === activeIndex
                        ? 'bg-gradient-to-r from-mcd-red/5 to-transparent dark:from-mcd-red/10'
                        : 'hover:bg-mcd-gray-50 dark:hover:bg-mcd-gray-800/60'
                    )}
                  >
                    <span
                      className={cx(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                        i === activeIndex
                          ? 'bg-gradient-to-br from-mcd-red to-mcd-red-dark text-white shadow-glow-red-sm scale-105'
                          : 'bg-mcd-gray-100 text-mcd-gray-500 dark:bg-mcd-gray-800 dark:text-mcd-gray-400 group-hover:bg-mcd-gray-200 dark:group-hover:bg-mcd-gray-700'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-mcd-gray-900 dark:text-mcd-gray-50">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="block truncate text-xs text-mcd-gray-500 dark:text-mcd-gray-400">
                          {item.subtitle}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-mcd-gray-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mcd-gray-500 dark:bg-mcd-gray-800 dark:text-mcd-gray-400">
                      {typeLabel[item.type] ?? item.type}
                    </span>
                    {i === activeIndex && (
                      <CornerDownLeft className="h-4 w-4 shrink-0 text-mcd-red animate-slide-in-right" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="hidden items-center justify-between border-t border-mcd-gray-100/80 px-4 py-3 text-[10px] font-medium text-mcd-gray-400 sm:flex dark:border-mcd-gray-800/80">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-mcd-gray-200 px-1 font-mono text-mcd-gray-500 dark:border-mcd-gray-700 dark:text-mcd-gray-400">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-mcd-gray-200 px-1 font-mono text-mcd-gray-500 dark:border-mcd-gray-700 dark:text-mcd-gray-400">Enter</kbd> open
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-mcd-gray-200 px-1 font-mono text-mcd-gray-500 dark:border-mcd-gray-700 dark:text-mcd-gray-400">Esc</kbd> close
              </span>
            </div>
            <div className="flex items-center gap-1 text-mcd-gray-300 dark:text-mcd-gray-600">
              <Sparkles className="w-3 h-3" /> Quick Search
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
