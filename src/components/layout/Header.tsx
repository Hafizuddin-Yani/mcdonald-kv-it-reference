import { Link } from 'react-router';
import { Moon, Sun, Search, Activity } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 glass-strong">
      {/* Bottom gradient accent line */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-mcd-red/20 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-bold text-white shadow-glow-red-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-red group-hover:rotate-3">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-mcd-red via-[#C71E13] to-mcd-red-dark" />
              <span className="relative z-10">M</span>
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-display text-[15px] font-bold tracking-tight text-mcd-gray-900 dark:text-mcd-gray-50">
                MY-KV IT Reference
              </span>
              <span className="text-[11px] font-medium text-mcd-gray-400 dark:text-mcd-gray-500">
                McDonald&apos;s Malaysia · Field guide
              </span>
            </span>
          </Link>

          {/* Search bar — desktop */}
          <button
            onClick={onOpenSearch}
            className="group hidden h-11 flex-1 max-w-md items-center gap-3 rounded-xl px-4 text-sm transition-all duration-200 md:flex glass hover:shadow-md hover:border-mcd-gray-300 dark:hover:border-mcd-gray-600"
          >
            <Search className="h-4 w-4 text-mcd-gray-400 transition-colors group-hover:text-mcd-red" />
            <span className="flex-1 text-left text-mcd-gray-400 dark:text-mcd-gray-500">
              Search pages, stores, devices…
            </span>
            <kbd className="flex items-center gap-0.5 rounded-lg border border-mcd-gray-200/80 bg-white/80 px-2 py-1 font-mono text-[10px] font-semibold text-mcd-gray-400 dark:border-mcd-gray-700 dark:bg-mcd-gray-800/80 dark:text-mcd-gray-500">
              ⌘K
            </kbd>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onOpenSearch}
              className="touch-target inline-flex items-center justify-center rounded-xl text-mcd-gray-500 transition-all hover:bg-mcd-gray-100/80 hover:text-mcd-gray-700 dark:text-mcd-gray-400 dark:hover:bg-mcd-gray-800/60 dark:hover:text-mcd-gray-200 md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="touch-target inline-flex items-center justify-center rounded-xl text-mcd-gray-500 transition-all duration-300 hover:bg-mcd-gray-100/80 hover:text-mcd-gray-700 hover:rotate-12 dark:text-mcd-gray-400 dark:hover:bg-mcd-gray-800/60 dark:hover:text-mcd-gray-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              to="/health"
              className="hidden touch-target items-center justify-center rounded-xl text-mcd-gray-500 transition-all hover:bg-mcd-gray-100/80 hover:text-mcd-gray-700 lg:inline-flex dark:text-mcd-gray-400 dark:hover:bg-mcd-gray-800/60 dark:hover:text-mcd-gray-200"
              aria-label="App health"
            >
              <Activity className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
