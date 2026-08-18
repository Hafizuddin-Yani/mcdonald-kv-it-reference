import { NavLink, Link } from 'react-router';
import {
  Home,
  Building2,
  MonitorSmartphone,
  Tags,
  Wrench,
  GraduationCap,
  ClipboardPaste,
  Inbox,
  Activity,
} from 'lucide-react';
import { appConfig } from '../../data/config';
import { formatDate } from '../../utils';
import { cx } from '../../utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/ticket', label: 'Ticket Assistant', icon: ClipboardPaste },
  { to: '/tickets', label: 'Ticket Log', icon: Inbox },
  { to: '/stores', label: 'Stores', icon: Building2 },
  { to: '/devices', label: 'Devices', icon: MonitorSmartphone },
  { to: '/naming', label: 'Naming', icon: Tags },
  { to: '/troubleshooting', label: 'Troubleshooting', icon: Wrench },
  { to: '/onboarding', label: 'Onboarding', icon: GraduationCap },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 min-h-[calc(100vh-4rem)] sticky top-16 glass-strong border-r-0">
      {/* Right border gradient */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-mcd-red/10 via-mcd-gray-200/50 to-transparent dark:via-mcd-gray-700/50"
      />
      <nav className="flex-1 py-5 px-3 space-y-0.5">
        <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-mcd-gray-400 dark:text-mcd-gray-500 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-mcd-red" />
          Field reference
        </div>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? 'nav-item-active' : 'nav-item'
            }
          >
            <Icon className={cx('w-[18px] h-[18px] transition-colors')} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-mcd-gray-200/40 dark:border-mcd-gray-700/30">
        <div className="text-xs text-mcd-gray-400 dark:text-mcd-gray-500">
          v{appConfig.version} · Data as of {formatDate(appConfig.lastDataUpdate)}
        </div>
        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-mcd-gray-200/60 bg-white/50 px-2.5 py-1.5 text-[10px] font-medium text-mcd-gray-400 dark:border-mcd-gray-700/50 dark:bg-mcd-gray-800/30 dark:text-mcd-gray-500">
          <kbd className="font-mono font-semibold">Ctrl</kbd>+
          <kbd className="font-mono font-semibold">K</kbd> quick search
        </div>
        <Link
          to="/health"
          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-mcd-red hover:underline transition-colors"
        >
          <Activity className="w-3.5 h-3.5" /> Health & diagnostics
        </Link>
      </div>
    </aside>
  );
}