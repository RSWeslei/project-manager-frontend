export type ThemeName = 'light' | 'dark';

const KEY = 'taskhub_theme';

export const getTheme = (): ThemeName => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
  if (saved === 'light' || saved === 'dark') return saved;
  return 'light';
};

export const applyTheme = (theme: ThemeName) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

export const setTheme = (theme: ThemeName) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
};
