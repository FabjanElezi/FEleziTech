'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BarChart3, CalendarCheck, Database, ExternalLink, FileText, GitBranch, Server } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import LegalBar from '@/components/LegalBar';
import type { Lang } from '@/lib/i18n';
import type { CaseStudy, StudyLink } from '@/lib/caseStudies';

const DbDesignLightbox = dynamic(() => import('@/components/DbDesignLightbox'), { ssr: false });

const ICONS = { chart: BarChart3, calendar: CalendarCheck, database: Database, server: Server };
const LINK_ICONS = { live: ExternalLink, code: GitBranch, report: FileText };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-white font-semibold mb-2">{title}</h2>
      {children}
    </section>
  );
}

const P = 'text-slate-400 text-sm leading-relaxed';

/**
 * A case-study page, laid out like the privacy page. A section without content is
 * left out entirely. `extra` adds project-specific material under Key results
 * (the Video Game Library's ER diagram and schema).
 */
export default function CaseStudyView({ study, extra }: { study: CaseStudy; extra?: React.ReactNode }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<number | null>(null);

  const text = (v?: Record<Lang, string>) => (v ? v[lang] || v.en : '');
  const list = (v?: Record<Lang, string[]>) => (v ? (v[lang]?.length ? v[lang] : v.en) : []);

  const Icon = ICONS[study.icon];
  const shots = study.screenshots ?? [];
  const captions = shots.map((s) => text(s.caption));
  const approach = list(study.approach);
  const results = list(study.results);
  const links = study.links ?? [];

  const linkLabel = (l: StudyLink) =>
    l.kind === 'code' ? t('projects.code')
      : l.kind === 'report' ? t('cs.sampleReport')
        : study.liveLabel === 'site' ? t('projects.liveSite') : t('projects.liveDemo');

  return (
    <main className="relative min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-10">
          <ArrowLeft size={15} /> {t('cs.back')}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Icon size={22} className="text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">{study.title}</h1>
        </div>
        <p className="text-xs text-body mb-8">{text(study.subtitle)}</p>

        <div className="space-y-7">
          {text(study.problem) && (
            <Section title={t('cs.problem')}><p className={P}>{text(study.problem)}</p></Section>
          )}

          {text(study.data) && (
            <Section title={t('cs.data')}><p className={P}>{text(study.data)}</p></Section>
          )}

          {(study.tools?.length ?? 0) > 0 && (
            <Section title={t('cs.tools')}>
              <div className="flex flex-wrap gap-1.5">
                {study.tools!.map((tool) => <span key={tool} className="tech-tag">{tool}</span>)}
              </div>
            </Section>
          )}

          {text(study.role) && (
            <Section title={t('cs.role')}><p className={P}>{text(study.role)}</p></Section>
          )}

          {approach.length > 0 && (
            <Section title={t('cs.approach')}>
              <ul className={`list-disc pl-5 space-y-1.5 ${P}`}>
                {approach.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </Section>
          )}

          {(results.length > 0 || extra) && (
            <Section title={t('cs.results')}>
              {results.length === 1 ? (
                <p className={P}>{results[0]}</p>
              ) : results.length > 1 ? (
                <ul className={`list-disc pl-5 space-y-1.5 ${P}`}>
                  {results.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
              {extra}
            </Section>
          )}

          {shots.length > 0 && (
            <Section title={t('cs.screenshots')}>
              <div className="space-y-6">
                {shots.map((s, i) => (
                  <figure key={s.src}>
                    {/* Tall phone screenshots are capped in height so they don't fill several screens. */}
                    <button
                      type="button"
                      onClick={() => setOpen(i)}
                      aria-label={`${t('cs.enlarge')}: ${captions[i]}`}
                      className="glass rounded-2xl p-2 block mx-auto max-w-full cursor-zoom-in"
                    >
                      <Image
                        src={s.src}
                        alt={captions[i]}
                        width={s.w}
                        height={s.h}
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="rounded-xl w-auto h-auto max-w-full max-h-[32rem]"
                      />
                    </button>
                    <figcaption className="text-xs text-body mt-2 text-center">{captions[i]}</figcaption>
                  </figure>
                ))}
              </div>
            </Section>
          )}

          {text(study.differently) && (
            <Section title={t('cs.differently')}><p className={P}>{text(study.differently)}</p></Section>
          )}

          {links.length > 0 && (
            <Section title={t('cs.links')}>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {links.map((l) => {
                  const LinkIcon = LINK_ICONS[l.kind];
                  return (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      <LinkIcon size={14} aria-hidden="true" /> {linkLabel(l)}
                    </a>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        <footer className="mt-16 pt-5 border-t border-white/5">
          <LegalBar />
        </footer>
      </div>

      {open !== null && (
        <DbDesignLightbox
          images={shots.map((s) => s.src)}
          captions={captions}
          title={study.title}
          startIndex={open}
          onClose={() => setOpen(null)}
        />
      )}
    </main>
  );
}
