import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mangaverse-theme';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error('Error accessing localStorage', e);
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [theme]);

  return { theme, setTheme } as const;
}
