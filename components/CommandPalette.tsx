'use client';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Search, CornerDownLeft, FileText, Mail, Copy, Link2, Code2,
  Sun, Moon, ArrowRight, ExternalLink, Command,
} from 'lucide-react';

/**
 * ⌘K anywhere on the public site: jump to a section, open the CV, copy the
 * email address. The sort of thing the people reading this site use all day.
 */

type Action = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  keywords?: string;
  run: () => void;
};

type Portfolio = { email?: string; linkedin?: string; github?: string; cvUrl?: string } | null;
type Demo = { title: string; url: string; tech: string };

const SECTIONS = [
  ['about', 'About'],
  ['skills', 'Skills'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['contact', 'Contact'],
] as const;

export default function CommandPalette() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [at, setAt] = useState(0);
  const [portfolio, setPortfolio] = useState<Portfolio>(null);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [dark, setDark] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const onAdmin = pathname?.startsWith('/admin') ?? false;

  // Closing only changes state; focus is handed back in the effect below, so
  // no ref is ever read while rendering.
  const close = useCallback(() => {
    setOpen(false);
    setQ('');
    setAt(0);
  }, []);

  const go = useCallback((id: string) => {
    close();
    // The palette locks body scrolling while it is open; wait for that lock to
    // be lifted on the next frame, or the page cannot move.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.location.href = `/#${id}`;
    }));
  }, [close]);

  const actions = useMemo<Action[]>(() => {
    const sections: Action[] = SECTIONS.map(([id, label]) => ({
      id: `go-${id}`,
      label: `Go to ${label}`,
      icon: <ArrowRight size={15} />,
      keywords: `${label} section jump scroll`,
      run: () => go(id),
    }));

    const cv: Action = {
      id: 'cv',
      label: 'Open the CV',
      hint: 'PDF',
      icon: <FileText size={15} />,
      keywords: 'resume cv download pdf lebenslauf',
      run: () => { close(); window.open('/api/cv', '_blank', 'noopener'); },
    };

    const mail: Action[] = portfolio?.email ? [
      {
        id: 'copy-email',
        label: 'Copy email address',
        hint: portfolio.email,
        icon: <Copy size={15} />,
        keywords: 'mail contact address clipboard',
        run: () => {
          close();
          navigator.clipboard?.writeText(portfolio.email!)
            .then(() => toast.success('Email copied'))
            .catch(() => toast.error('Could not copy'));
        },
      },
      {
        id: 'email',
        label: 'Write an email',
        icon: <Mail size={15} />,
        keywords: 'mail contact message hire',
        run: () => { close(); window.location.href = `mailto:${portfolio.email}`; },
      },
    ] : [];

    const links: Action[] = [
      ...(portfolio?.linkedin ? [{
        id: 'linkedin', label: 'Open LinkedIn', icon: <Link2 size={15} />,
        keywords: 'profile social network',
        run: () => { close(); window.open(portfolio.linkedin!, '_blank', 'noopener'); },
      }] : []),
      ...(portfolio?.github ? [{
        id: 'github', label: 'Open GitHub', icon: <Code2 size={15} />,
        keywords: 'code repository source',
        run: () => { close(); window.open(portfolio.github!, '_blank', 'noopener'); },
      }] : []),
    ];

    // Straight from the projects in the database, so a label can never point at
    // the wrong thing.
    const projectDemos: Action[] = demos.map((d) => ({
      id: `demo-${d.url}`,
      label: `Open ${d.title}`,
      hint: 'Live demo',
      icon: <ExternalLink size={15} />,
      keywords: `${d.title} ${d.tech} demo live project`,
      run: () => {
        close();
        if (d.url.startsWith('/')) window.location.href = d.url;
        else window.open(d.url, '_blank', 'noopener');
      },
    }));

    const theme: Action = {
      id: 'theme',
      label: dark ? 'Switch to light mode' : 'Switch to dark mode',
      icon: dark ? <Sun size={15} /> : <Moon size={15} />,
      keywords: 'theme dark light appearance',
      run: () => {
        close();
        const next = dark ? 'light' : 'dark';
        setDark(!dark);
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch { /* private mode */ }
      },
    };

    return [...sections, cv, ...mail, ...links, ...projectDemos, theme];
  }, [portfolio, demos, dark, go, close]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return actions;
    return actions.filter((a) =>
      `${a.label} ${a.hint ?? ''} ${a.keywords ?? ''}`.toLowerCase().includes(needle)
    );
  }, [q, actions]);

  // ⌘K / Ctrl+K from anywhere, Escape to leave.
  useEffect(() => {
    if (onAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        restoreTo.current = document.activeElement as HTMLElement;
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const onOpen = () => { restoreTo.current = document.activeElement as HTMLElement; setOpen(true); };
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, [onAdmin, close]);

  // Only when it is first needed: who to email, where to link.
  useEffect(() => {
    if (!open || portfolio) return;
    let alive = true;

    fetch('/api/portfolio', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setPortfolio(d); })
      .catch(() => {});

    fetch('/api/projects', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        if (!alive || !d) return;
        const list = Array.isArray(d) ? d : [];
        setDemos(
          list
            .filter((x) => typeof x?.liveDemoLink === 'string' && x.liveDemoLink.trim())
            .map((x) => ({
              title: String(x.title ?? 'Project'),
              url: String(x.liveDemoLink).trim(),
              tech: Array.isArray(x.techStack) ? x.techStack.join(' ') : '',
            }))
        );
      })
      .catch(() => {});

    return () => { alive = false; };
  }, [open, portfolio]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the current theme is only knowable from the DOM
      setDark(document.documentElement.getAttribute('data-theme') !== 'light');
    } else {
      restoreTo.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (onAdmin || !open) return null;

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAt((i) => (i + 1) % Math.max(1, results.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAt((i) => (i - 1 + results.length) % Math.max(1, results.length)); }
    else if (e.key === 'Enter') { e.preventDefault(); results[at]?.run(); }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[14vh]"
      style={{ background: 'rgba(3,7,13,0.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="glass rounded-2xl w-full max-w-xl overflow-hidden"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(34,211,238,0.14)' }}
        onKeyDown={onListKey}
      >
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={16} className="text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setAt(0); }}
            placeholder="Jump to a section, open the CV, copy the email…"
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
            aria-label="Search commands"
          />
          <kbd className="text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5">esc</kbd>
        </div>

        <ul className="max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">Nothing matches that.</li>
          )}
          {results.map((a, i) => (
            <li key={a.id}>
              <button
                onClick={a.run}
                onMouseEnter={() => setAt(i)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors"
                style={{
                  background: i === at ? 'rgba(8,145,178,0.16)' : 'transparent',
                  color: i === at ? '#a5f3fc' : '#cbd5e1',
                }}
              >
                <span className="text-cyan-400/80 shrink-0">{a.icon}</span>
                <span className="flex-1 truncate">{a.label}</span>
                {a.hint && <span className="text-xs text-slate-500 truncate max-w-[45%]">{a.hint}</span>}
                {i === at && <CornerDownLeft size={13} className="text-slate-500 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 px-4 py-2 text-[11px] text-slate-500"
             style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="flex items-center gap-1"><Command size={11} /> K to open</span>
          <span>↑ ↓ to move</span>
          <span>↵ to choose</span>
        </div>
      </div>
    </div>
  );
}
