import { JSX, useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '@/shared/components/ui/Sidebar';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { Menu } from 'lucide-react';
import { UserMenu } from '@/modules/auth/components/UserMenu';

const STORAGE_KEY = 'taskhub_sidebar_collapsed';

const AppLayout = (): JSX.Element => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === '1') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      }
      return next;
    });
  };

  const mainContentPadding = isCollapsed ? 'lg:pl-20' : 'lg:pl-72';

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={isCollapsed}
        onToggleCollapsed={toggleSidebar}
      />
      <div className={`pl-0 transition-[padding] duration-200 ${mainContentPadding}`}>
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Abrir menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] shadow-sm lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
