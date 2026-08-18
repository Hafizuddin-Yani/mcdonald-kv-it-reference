import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from '../nav/BottomNav';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { BackToTop } from '../ui/BackToTop';
import { CommandPalette } from '../ui/CommandPalette';
import { ToastProvider } from '../ui/Toast';

export function AppLayout() {
  const { pathname } = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setPaletteOpen(false);
  }, [pathname]);

  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-mcd-gray-25 dark:bg-mcd-gray-950">
        {/* Ambient gradient orbs */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-mcd-red/[0.04] blur-[120px] dark:bg-mcd-red/[0.06]" />
          <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full bg-mcd-yellow/[0.03] blur-[100px] dark:bg-mcd-yellow/[0.03]" />
          <div className="absolute -bottom-32 right-1/4 w-[400px] h-[400px] rounded-full bg-mcd-accent-blue/[0.02] blur-[80px] dark:bg-mcd-accent-blue/[0.03]" />
        </div>
        {/* Noise texture overlay */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 bg-noise opacity-[0.015] dark:opacity-[0.03]"
        />

        <Header onOpenSearch={() => setPaletteOpen(true)} />
        <div className="relative flex">
          <Sidebar />
          <main className="min-w-0 flex-1 pb-20 lg:pb-0">
            <div className="page-container">
              <div key={pathname} className="animate-page-enter">
                <ErrorBoundary key={pathname}>
                  <Outlet />
                </ErrorBoundary>
              </div>
            </div>
          </main>
        </div>
        <footer className="relative hidden border-t border-mcd-gray-200/50 py-5 text-center text-xs text-mcd-gray-400 lg:block dark:border-mcd-gray-800/50 dark:text-mcd-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-mcd-accent-green animate-pulse" />
            McDonald&apos;s Malaysia Klang Valley · IT Field Reference
          </span>
          {' · '}
          <Link
            to="/onboarding"
            className="underline decoration-mcd-red/30 underline-offset-2 hover:text-mcd-red transition-colors"
          >
            New Engineer? Start here
          </Link>
        </footer>
        <BottomNav />
        <BackToTop />
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </ToastProvider>
  );
}
