import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils';

export default function Layout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className={cn('flex flex-1 flex-col overflow-hidden transition-all duration-300',
        sidebarOpen ? 'md:ml-64' : 'md:ml-20'
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
