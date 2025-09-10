import { type JSX, useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, ListTodo, FolderKanban, ChevronsLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type Icon = ComponentType<{ className?: string }>;

export type NavItem = {
  key: string;
  label: string;
  to: string;
  icon: Icon;
  end?: boolean;
};

type Props = {
  items?: Readonly<NavItem[]>;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const DEFAULT_ITEMS: Readonly<NavItem[]> = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
  { key: 'projects', label: 'Projetos', to: '/dashboard/projects', icon: FolderKanban },
  { key: 'tasks', label: 'Tarefas', to: '/dashboard/tasks', icon: ListTodo },
] as const;

const STORAGE_KEY = 'taskhub_sidebar_collapsed';

export const Sidebar = ({
  items,
  collapsed,
  onToggleCollapsed,
  mobileOpen = false,
  onCloseMobile,
}: Props): JSX.Element => {
  const navItems = useMemo(() => items ?? DEFAULT_ITEMS, [items]);
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setInternalCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
      }
    } catch {
      /* ignore */
    }
  }, []);

  const isCollapsed = collapsed ?? internalCollapsed;
  const closeMobile = onCloseMobile ?? (() => {});

  const toggle = useCallback(() => {
    if (onToggleCollapsed) {
      onToggleCollapsed();
      return;
    }
    setInternalCollapsed((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
        }
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [onToggleCollapsed]);

  const asideBase =
    'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] shadow-sm transition-[width,transform] duration-200 ease-out';
  const asideWidth = isCollapsed ? 'w-20' : 'w-72';
  const asideTransform = mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';

  return (
    <>
      <aside
        className={cn(asideBase, asideWidth, asideTransform)}
        role="navigation"
        aria-label="Menu lateral"
      >
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="grid size-9 place-items-center rounded-xl border border-[var(--border)]">
            <span className="text-sm font-semibold">TH</span>
          </div>
          {!isCollapsed && <span className="truncate text-base font-semibold">Task Hub</span>}
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.key}
                to={it.to}
                end={it.end}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-[color-mix(in_oklab,var(--primary)_14%,var(--surface))] text-[var(--fg)]'
                      : 'text-[var(--fg)]/80 hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--surface))]',
                    isCollapsed && 'justify-center',
                  )
                }
                onClick={closeMobile}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && <span className="truncate">{it.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] p-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!isCollapsed}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--fg)]/80 transition-colors hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--surface))]"
          >
            <ChevronsLeft
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                isCollapsed && 'rotate-180',
              )}
            />
            {!isCollapsed && <span className="truncate">Recolher</span>}
          </button>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Fechar menu"
        onClick={closeMobile}
        className={cn(
          'fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
    </>
  );
};
