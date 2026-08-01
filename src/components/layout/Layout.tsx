import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Building2,
  Cpu,
  Tag,
  Wrench,
  GraduationCap,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/stores', label: 'Stores', icon: Building2 },
  { path: '/devices', label: 'Devices', icon: Cpu },
  { path: '/naming', label: 'Naming', icon: Tag },
  { path: '/troubleshooting', label: 'Troubleshoot', icon: Wrench },
  { path: '/onboarding', label: 'Onboarding', icon: GraduationCap },
  { path: '/search', label: 'Search', icon: Search },
];

const mobileNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/stores', label: 'Stores', icon: Building2 },
  { path: '/devices', label: 'Devices', icon: Cpu },
  { path: '/search', label: 'Search', icon: Search },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Desktop Sidebar */}
      <aside className={`desktop-sidebar hidden md:flex sticky top-0 h-screen shrink-0 ${desktopCollapsed ? 'w-20' : 'w-64'} bg-[#111111] border-r border-white/5 z-30 flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className={`p-6 border-b border-white/5 flex items-center ${desktopCollapsed ? 'justify-center' : ''}`}>
          <Link to="/" className="flex items-center gap-3" id="sidebar-logo">
            <div className="w-10 h-10 rounded-xl gradient-red flex items-center justify-center font-bold text-white text-lg shadow-lg shrink-0">
              M
            </div>
            {!desktopCollapsed && (
              <div className="whitespace-nowrap overflow-hidden">
                <h1 className="text-sm font-bold text-white tracking-tight">MY KV IT Reference</h1>
                <p className="text-xs text-[#666]">McDonald's Klang Valley</p>
              </div>
            )}
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                id={`nav-${item.label.toLowerCase()}`}
                className={`flex items-center ${desktopCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#FFC72C]/10 text-[#FFC72C] border border-[#FFC72C]/20'
                    : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                }`}
                title={desktopCollapsed ? item.label : undefined}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-[#FFC72C]' : 'text-[#666] group-hover:text-white'}`} />
                {!desktopCollapsed && <span>{item.label}</span>}
                {!desktopCollapsed && isActive && <ChevronRight size={14} className="ml-auto text-[#FFC72C]/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-4">
          <button 
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className={`flex items-center ${desktopCollapsed ? 'justify-center' : 'justify-end'} text-[#666] hover:text-white transition-colors`}
            title={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {desktopCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          {!desktopCollapsed && (
            <div className="text-xs text-[#666] text-center whitespace-nowrap overflow-hidden">
              <p>v1.0.0 MVP</p>
              <p className="mt-1">Last updated: Aug 2026</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-nav fixed top-0 left-0 right-0 h-16 bg-[#111111]/95 backdrop-blur-lg border-b border-white/5 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" id="mobile-logo">
          <div className="w-8 h-8 rounded-lg gradient-red flex items-center justify-center font-bold text-white text-sm">
            M
          </div>
          <span className="text-sm font-bold text-white">MY KV IT Ref</span>
        </Link>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="touch-target text-[#a0a0a0] hover:text-white transition-colors"
          id="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Slide-out Menu */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-16 right-0 bottom-0 w-72 bg-[#111111] border-l border-white/5 z-50 p-4 space-y-1 animate-slide-in-left md:hidden overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`mobile-nav-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FFC72C]/10 text-[#FFC72C]'
                      : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 h-[4.5rem] bg-[#111111]/95 backdrop-blur-lg border-t border-white/5 z-40 flex items-center justify-around px-2">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              id={`btm-nav-${item.label.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[4rem] ${
                isActive
                  ? 'text-[#FFC72C]'
                  : 'text-[#666] hover:text-[#a0a0a0]'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#FFC72C] absolute -bottom-0.5" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-w-0 main-content transition-all duration-300">
        <div className="pt-16 md:pt-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
