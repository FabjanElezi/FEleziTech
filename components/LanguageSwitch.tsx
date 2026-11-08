'use client';
import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { LANGS } from '@/lib/i18n';
import { useLang } from '@/components/LanguageProvider';

/** The language button: current language, with the other two a tap away. */
export default function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="theme-toggle-btn flex items-center gap-1.5"
        style={{ width: 'auto', padding: compact ? '0 0.5rem' : '0 0.6rem' }}
        aria-label={`${t('lang.label')}: ${current.label} (${current.short})`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t('lang.label')}
      >
        <Globe size={14} />
        <span className="text-[11px] font-semibold tracking-wide">{current.short}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="glass absolute right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{ minWidth: 132, boxShadow: '0 18px 40px rgba(0,0,0,0.45)' }}
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                role="option"
                aria-selected={l.code === lang}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm transition-colors"
                style={{
                  background: l.code === lang ? 'rgba(8,145,178,0.18)' : 'transparent',
                  color: l.code === lang ? '#a5f3fc' : '#cbd5e1',
                }}
              >
                <span>{l.label}</span>
                <span className="text-[10px] text-slate-500">{l.short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
