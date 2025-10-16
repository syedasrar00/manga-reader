import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mangaverse-theme';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {return 'dark'});

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
