import { JSX, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Users,
  Settings,
  ChevronsLeft,
} from 'lucide-react';

export type NavItem = {
  key: string;
  label: string;
  to: string;
  icon: (props: { className?: string }) => JSX.Element;
  end?: boolean;
};

type Props = {
  items?: NavItem[];
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const DEFAULT_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    icon: (p) => <LayoutDashboard className={`h-5 w-5 ${p.className ?? ''}`} />,
    end: true,
  },
  {
    key: 'projects',
    label: 'Projetos',
    to: '/dashboard/projects',
    icon: (p) => <FolderKanban className={`h-5 w-5 ${p.className ?? ''}`} />,
  },
  {
    key: 'tasks',
    label: 'Tarefas',
    to: '/dashboard/tasks',
    icon: (p) => <ListTodo className={`h-5 w-5 ${p.className ?? ''}`} />,
  },
  {
    key: 'people',
    label: 'Equipes',
    to: '/dashboard/people',
    icon: (p) => <Users className={`h-5 w-5 ${p.className ?? ''}`} />,
  },
  {
    key: 'settings',
    label: 'Configurações',
    to: '/dashboard/settings',
    icon: (p) => <Settings className={`h-5 w-5 ${p.className ?? ''}`} />,
  },
];

const STORAGE_KEY = 'taskhub_sidebar_collapsed';

export const Sidebar = ({
  items,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: Props): JSX.Element => {
  const navItems = useMemo(() => items ?? DEFAULT_ITEMS, [items]);
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === '1') setInternalCollapsed(true);
  }, []);

  const isCollapsed = typeof collapsed === 'boolean' ? collapsed : internalCollapsed;

  const toggle = () => {
    if (onToggleCollapsed) {
      onToggleCollapsed();
      return;
    }
    setInternalCollapsed((c) => {
      const next = !c;
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  const asideBase =
    'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] shadow-sm transition-[width,transform] duration-200 ease-out';
  const asideWidth = isCollapsed ? 'w-20' : 'w-72';
  const asideTransform = mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0';

  return (
    <>
      <aside className={`${asideBase} ${asideWidth} ${asideTransform}`}>
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="grid size-9 place-items-center rounded-xl border border-[var(--border)]">
            <span className="text-sm font-semibold">TH</span>
          </div>
          {isCollapsed ? null : <span className="truncate text-base font-semibold">Task Hub</span>}
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-[color-mix(in_oklab,var(--primary)_14%,var(--surface))] text-[var(--fg)]'
                    : 'text-[var(--fg)]/80 hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--surface))]',
                  isCollapsed ? 'justify-center' : '',
                ].join(' ')
              }
              onClick={onCloseMobile}
            >
              <it.icon />
              {isCollapsed ? null : <span className="truncate">{it.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] p-2">
          <button
            onClick={toggle}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--fg)]/80 transition-colors hover:bg-[color-mix(in_oklab,var(--primary)_10%,var(--surface))]"
          >
            <ChevronsLeft
              className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
            {isCollapsed ? null : <span className="truncate">Recolher</span>}
          </button>
        </div>
      </aside>

      <button
        aria-label="Fechar menu"
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onCloseMobile}
      />
    </>
  );
};
