'use client';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, FileText, FolderOpen, GitBranch } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import LegalBar from '@/components/LegalBar';
import type { MadeAt } from '@/lib/archive';

export interface ArchiveRow {
  id: string;
  title: string;
  year?: number;
  madeAt?: MadeAt;
  techStack: string[];
  live?: string;
  code?: string;
  pdf?: string;
}

const LINK = 'inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors';

function Links({ row }: { row: ArchiveRow }) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {row.live && (
        <a href={row.live} target="_blank" rel="noopener noreferrer" className={LINK} aria-label={`${t('archive.live')} – ${row.title}`}>
          <ExternalLink size={13} aria-hidden="true" /> {t('archive.live')}
        </a>
      )}
      {row.code && (
        <a href={row.code} target="_blank" rel="noopener noreferrer" className={LINK} aria-label={`${t('projects.code')} – ${row.title}`}>
          <GitBranch size={13} aria-hidden="true" /> {t('projects.code')}
        </a>
      )}
      {row.pdf && (
        <a href={row.pdf} target="_blank" rel="noopener noreferrer" className={LINK} aria-label={`${t('archive.pdf')} – ${row.title}`}>
          <FileText size={13} aria-hidden="true" /> {t('archive.pdf')}
        </a>
      )}
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => <span key={tag} className="tech-tag">{tag}</span>)}
    </div>
  );
}

/** The projects that are not featured on the home page: one table, compact. */
export default function ArchiveView({ rows }: { rows: ArchiveRow[] }) {
  const { t } = useLang();
  const madeAt = (r: ArchiveRow) => (r.madeAt ? t(`madeAt.${r.madeAt}`) : '');

  return (
    <main className="relative min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-10">
          <ArrowLeft size={15} /> {t('archive.back')}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <FolderOpen size={22} className="text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">{t('archive.title')}</h1>
        </div>

        {/* Phones: one small block per project. From 768px: a table. */}
        <ul className="md:hidden space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="glass rounded-2xl p-4 space-y-2">
              <p className="text-xs text-slate-500">{[r.year, madeAt(r)].filter(Boolean).join(' · ')}</p>
              <p className="text-white text-sm font-medium">{r.title}</p>
              {r.techStack.length > 0 && <Tags tags={r.techStack} />}
              <Links row={r} />
            </li>
          ))}
        </ul>

        <div className="hidden md:block glass rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['archive.year', 'archive.project', 'archive.madeAt', 'archive.builtWith', 'archive.link'].map((key) => (
                  <th key={key} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-0 align-top">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{r.year}</td>
                  <td className="px-4 py-3 text-white font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{madeAt(r)}</td>
                  <td className="px-4 py-3"><Tags tags={r.techStack} /></td>
                  <td className="px-4 py-3"><Links row={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="mt-16 pt-5 border-t border-white/5">
          <LegalBar />
        </footer>
      </div>
    </main>
  );
}
