import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setThemeState] = useState('system'); // 'dark' | 'light' | 'system'
  const [resolved, setResolved] = useState('dark'); // actual applied theme

  // Load saved preference on mount
  useEffect(() => {
    window.api.getTheme().then((saved) => {
      setThemeState(saved || 'system');
    });
  }, []);

  // Resolve system preference and apply class
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolve = () => {
      let effective;
      if (theme === 'system') {
        effective = mediaQuery.matches ? 'dark' : 'light';
      } else {
        effective = theme;
      }
      setResolved(effective);

      if (effective === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    resolve();
    mediaQuery.addEventListener('change', resolve);
    return () => mediaQuery.removeEventListener('change', resolve);
  }, [theme]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    await window.api.setTheme(newTheme);
  };

  return { theme, resolved, setTheme };
}
