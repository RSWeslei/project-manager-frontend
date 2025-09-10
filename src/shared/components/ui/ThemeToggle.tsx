import { JSX, useEffect, useState } from 'react';
import { applyTheme, getTheme, setTheme, ThemeName } from '@/shared/lib/theme/theme';
import { Moon, Sun } from 'lucide-react';
import { ActionIcon } from '@mantine/core';

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
    <ActionIcon onClick={toggle} variant="default" size="lg" aria-label="Alternar tema">
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </ActionIcon>
  );
};
