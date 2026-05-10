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
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 500);
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
