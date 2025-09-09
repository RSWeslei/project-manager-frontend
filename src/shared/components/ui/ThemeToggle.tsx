import { JSX, useEffect, useState } from 'react';
import { applyTheme, getTheme, setTheme, ThemeName } from '@/shared/lib/theme/theme';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = (): JSX.Element => {
  const [theme, setThemeState] = useState<ThemeName>('light');

  useEffect(() => {
    const t = getTheme();
    setThemeState(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setThemeState(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      aria-pressed={theme === 'dark'}
      className="relative inline-flex h-11 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] shadow-sm transition-colors"
    >
      <span
        className={`pointer-events-none absolute left-1 h-9 w-9 rounded-full bg-[color-mix(in_oklab,var(--primary)_14%,var(--surface))] transition-transform ${
          theme === 'dark' ? 'translate-x-10' : 'translate-x-0'
        }`}
      />
      <Sun className="pointer-events-none absolute left-3 h-5 w-5" />
      <Moon className="pointer-events-none absolute right-3 h-5 w-5" />
      <span className="sr-only">{theme === 'dark' ? 'Tema escuro' : 'Tema claro'}</span>
    </button>
  );
};
