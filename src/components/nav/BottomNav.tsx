import { useState } from 'react';
import { NavLink, Link } from 'react-router';
import {
  Home,
  ClipboardPaste,
  Inbox,
  Building2,
  MonitorSmartphone,
  Tags,
  Wrench,
  GraduationCap,
  Activity,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { cx } from '../../utils';

const primaryTabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/ticket', label: 'Assistant', icon: ClipboardPaste },
  { to: '/tickets', label: 'Log', icon: Inbox },
  { to: '/stores', label: 'Stores', icon: Building2 },
  { to: '/devices', label: 'Devices', icon: MonitorSmartphone },
];

const moreItems = [
  { to: '/naming', label: 'Naming Conventions', icon: Tags, desc: 'Decode device names on labels & tickets' },
  { to: '/troubleshooting', label: 'Troubleshooting', icon: Wrench, desc: 'Step-by-step issue workarounds' },
  { to: '/onboarding', label: 'Onboarding', icon: GraduationCap, desc: 'New engineer? Start here' },
  { to: '/health', label: 'App Health', icon: Activity, desc: 'Version, diagnostics & status' },
];

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden glass-strong"
        aria-label="Primary"
      >
        {/* Top gradient accent */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mcd-red/15 to-transparent"
        />
        <div className="flex items-stretch justify-around">
          {primaryTabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'group relative flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-all duration-200',
                  isActive
                    ? 'text-mcd-red'
                    : 'text-mcd-gray-500 hover:text-mcd-gray-800 dark:text-mcd-gray-400 dark:hover:text-mcd-gray-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cx(
                      'flex h-8 w-12 items-center justify-center rounded-full transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-br from-mcd-red/15 to-mcd-red/5 shadow-nav-active scale-105'
                        : 'group-active:bg-mcd-gray-100 dark:group-active:bg-mcd-gray-800'
                    )}
                  >
                    <Icon
                      className={cx(
                        'h-5 w-5 transition-all duration-200',
                        isActive ? 'scale-110' : 'group-active:scale-90'
                      )}
                    />
                  </span>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => setMoreOpen(true)}
            className={cx(
              'group relative flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
              moreOpen ? 'text-mcd-red' : 'text-mcd-gray-500 hover:text-mcd-gray-800 dark:text-mcd-gray-400 dark:hover:text-mcd-gray-200'
            )}
            aria-label="More"
          >
            <span className="flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200 group-active:bg-mcd-gray-100 dark:group-active:bg-mcd-gray-800">
              <MoreHorizontal className="h-5 w-5 group-active:scale-90" />
            </span>
            <span className="leading-none">More</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More options">
          <button
            className="absolute inset-0 animate-backdrop-in bg-black/40 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
            aria-label="Close"
          />
          <div className="absolute inset-x-0 bottom-0 animate-sheet-up rounded-t-3xl pb-[env(safe-area-inset-bottom)] shadow-2xl glass-strong">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-mcd-gray-300 dark:bg-mcd-gray-700" />
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="font-display text-base font-bold text-mcd-gray-900 dark:text-mcd-gray-50">
                More
              </h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="touch-target flex items-center justify-center rounded-xl text-mcd-gray-400 transition-colors hover:bg-mcd-gray-100/80 hover:text-mcd-gray-600 dark:hover:bg-mcd-gray-800/60"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1 px-3 pb-6">
              {moreItems.map(({ to, label, icon: Icon, desc }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3.5 rounded-xl px-3 py-3.5 transition-all hover:bg-mcd-gray-100/60 dark:hover:bg-mcd-gray-800/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mcd-red/10 to-mcd-red/5 text-mcd-red dark:from-mcd-red/15 dark:to-mcd-red/5">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-mcd-gray-900 dark:text-mcd-gray-50">
                      {label}
                    </span>
                    <span className="block truncate text-xs text-mcd-gray-500 dark:text-mcd-gray-400">
                      {desc}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
