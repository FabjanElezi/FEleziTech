'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') setDark(false);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? 'dark' : 'light';

    const apply = () => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    };

    if ('startViewTransition' in document) {
      // Compositor-level cross-fade — no per-element transition cost
      (document as unknown as { startViewTransition: (cb: () => void) => void })
        .startViewTransition(apply);
    } else {
      document.documentElement.classList.add('theme-transitioning');
      apply();
      setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 380);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="theme-toggle-btn"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
