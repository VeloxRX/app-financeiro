import { useUIStore } from '@/store';
import { useAlerts } from '@/hooks/useAlerts';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { unreadCount } = useAlerts();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4 md:px-6">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-accent transition-colors md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Alerts */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
