import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore, useAuthStore } from '@/store';
import { cn, getInitials } from '@/lib/utils';
import {
  LayoutDashboard, ArrowLeftRight, Tag, Target, BarChart3,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/transactions', icon: ArrowLeftRight, labelKey: 'nav.transactions' },
  { path: '/categories', icon: Tag, labelKey: 'nav.categories' },
  { path: '/goals', icon: Target, labelKey: 'nav.goals' },
  { path: '/reports', icon: BarChart3, labelKey: 'nav.reports' },
  { path: '/alerts', icon: Bell, labelKey: 'nav.alerts' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border bg-card transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20',
        'max-md:translate-x-[-100%]',
        sidebarOpen && 'max-md:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-400 shadow-lg shadow-indigo-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold gradient-text"
              >
                FinAI
              </motion.span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  !sidebarOpen && 'justify-center px-0'
                )}
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
                {sidebarOpen && <span>{t(item.labelKey)}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User card */}
        <div className="border-t border-border p-3">
          <div className={cn('flex items-center gap-3 rounded-xl p-2', !sidebarOpen && 'justify-center')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-400 text-sm font-bold text-white flex-shrink-0">
              {user ? getInitials(user.name) : '?'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
