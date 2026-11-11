'use client';
import { useLang } from '@/components/LanguageProvider';
import { motion } from 'framer-motion';
import { useState, useCallback, useId } from 'react';
import dynamic from 'next/dynamic';
import { Briefcase, GraduationCap, Calendar, MapPin, Award, Trophy, ChevronDown } from 'lucide-react';
import { Experience as Exp } from '@/types';
import CornerAccents from '@/components/CornerAccents';

const CertificateLightbox = dynamic(() => import('@/components/CertificateLightbox'), { ssr: false });
// Only loaded if someone actually asks for the terminal view, so the default
// view carries none of its weight.
const Traceroute = dynamic(() => import('@/components/Traceroute'), { ssr: false });

interface Props { experiences: Exp[] }

interface TimelineProps {
  items: Exp[];
  /** Which list this is — used for styling, never shown. */
  kind: 'work' | 'education' | 'award';
  onCertificate: (url: string) => void;
}

interface EntryProps {
  exp: Exp;
  index: number;
  dotClass: string;
  dotStyle: React.CSSProperties;
  onCertificate: (url: string) => void;
}

/**
 * One card on a timeline. Closed, it says what, where and when, so the list
 * reads at a glance. The explanation opens on "Read more".
 */
function TimelineEntry({ exp, index, dotClass, dotStyle, onCertificate }: EntryProps) {
  const { t, L } = useLang();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  // Descriptions are stored as "Place — what he did there".
  const text = L(exp, 'description') || '';
  const cut = text.indexOf(' — ');
  const place = cut >= 0 ? text.slice(0, cut) : '';
  const detail = cut >= 0 ? text.slice(cut + 3) : text;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative"
    >
      <div
        className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 ${dotClass}`}
        style={dotStyle}
      />
      <div className="glass rounded-xl p-4 sm:px-5 glass-hover relative">
        <CornerAccents size={9} inset={7} />
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-snug">{L(exp, 'role')}</p>
            <p className="text-cyan-400 text-sm">{exp.company}</p>
          </div>
          {/* One line on phones, a right-hand column from 640px */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 sm:flex-col sm:items-end sm:gap-1 shrink-0">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={11} />
              {exp.startDate}{(exp.current || exp.endDate) ? ` – ${exp.current ? t('experience.present') : exp.endDate}` : ''}
            </span>
            {place && (
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <MapPin size={11} />
                {place}
              </span>
            )}
          </div>
        </div>
        {(detail || exp.certificateUrl) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            {detail && (
              <button
                type="button"
                className="exp-toggle"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? t('experience.less') : t('experience.more')}
                <ChevronDown size={13} aria-hidden="true" />
              </button>
            )}
            {exp.certificateUrl && (
              <button
                onClick={() => onCertificate(exp.certificateUrl!)}
                className="cert-btn flex items-center gap-1.5 text-xs font-semibold transition-all"
                style={{
                  color: '#f0c040',
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.55)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  boxShadow: '0 0 10px rgba(212,175,55,0.2), 0 0 20px rgba(212,175,55,0.08)',
                  textShadow: '0 0 8px rgba(212,175,55,0.5)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212,175,55,0.25)';
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.85)';
                  e.currentTarget.style.boxShadow = '0 0 18px rgba(212,175,55,0.45), 0 0 36px rgba(212,175,55,0.18)';
                  e.currentTarget.style.textShadow = '0 0 12px rgba(212,175,55,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(212,175,55,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.55)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(212,175,55,0.2), 0 0 20px rgba(212,175,55,0.08)';
                  e.currentTarget.style.textShadow = '0 0 8px rgba(212,175,55,0.5)';
                }}
              >
                <Award size={12} /> {t('experience.certificate')}
              </button>
            )}
          </div>
        )}
        {detail && (
          <div id={panelId} className="exp-more" data-open={open ? '' : undefined} aria-hidden={!open}>
            <div>
              <p className="text-body text-xs sm:text-sm pt-3 leading-relaxed">{detail}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Timeline({ items, kind, onCertificate }: TimelineProps) {
    const { t } = useLang();
    const label     = t(`experience.${kind}`);
    const isWork    = kind === 'work';
    const isAward   = kind === 'award';
    const lineColor = isAward
      ? 'linear-gradient(to bottom, rgba(245,158,11,0.5), transparent)'
      : isWork
        ? 'linear-gradient(to bottom, rgba(8,145,178,0.5), transparent)'
        : 'linear-gradient(to bottom, rgba(6,182,212,0.5), transparent)';
    const dotClass  = isAward ? '' : isWork ? 'border-cyan-500' : 'border-cyan-400';
    const dotStyle  = isAward ? { borderColor: '#f59e0b', background: '#090d15', transform: 'translateX(-50%)' } : { background: '#090d15', transform: 'translateX(-50%)' };

    return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
        {isAward
          ? <Trophy size={14} style={{ color: '#f59e0b' }} />
          : isWork
            ? <Briefcase size={14} className="text-cyan-400" />
            : <GraduationCap size={14} className="text-cyan-400" />}
        {label}
      </h3>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: lineColor }} />
        <div className="space-y-4 sm:space-y-5 pl-6">
          {items.map((exp, i) => (
            <TimelineEntry key={exp.id} exp={exp} index={i} dotClass={dotClass} dotStyle={dotStyle} onCertificate={onCertificate} />
          ))}
        </div>
      </div>
    </div>
    );
}

export default function Experience({ experiences }: Props) {
  const { t, L } = useLang();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  // The timeline is the default. The traceroute is the same dates for anyone
  // who enjoys it, and nobody has to meet it first.
  const [asTraceroute, setAsTraceroute] = useState(false);

  const openCertificate = useCallback((url: string) => {
    const isPdf = /\.pdf(\?|$)/i.test(url);
    const isImage = !isPdf && (/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(url) ||
      url.includes('blob.vercel-storage.com'));
    // PDFs (and external links) open in a new tab in the browser's viewer, like the CV
    if (isImage) setLightboxUrl(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  }, []);
  const work      = experiences.filter((e) => e.type === 'work');
  const education = experiences.filter((e) => e.type === 'education');
  const awards    = experiences.filter((e) => e.type === 'award');
  const other     = experiences.filter((e) => e.type === 'other');

  return (
    <section id="experience" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-18"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-cyan-500" />
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">{t('experience.eyebrow')}</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h2 className="section-title text-white">
            {t('experience.headline')} <span className="gradient-text">{t('experience.headlineAccent')}</span>
          </h2>

          <button
            type="button"
            onClick={() => setAsTraceroute((v) => !v)}
            aria-pressed={asTraceroute}
            className="tr-toggle"
          >
            <span aria-hidden="true" className="font-mono">{asTraceroute ? '\u2190' : '>_'}</span>
            {asTraceroute ? t('tr.viewTimeline') : t('tr.viewAs')}
          </button>
        </motion.div>

        {asTraceroute ? (
          <div className="max-w-3xl mx-auto">
            <Traceroute />
          </div>
        ) : (
        <div className="space-y-16 max-w-3xl mx-auto">
          {work.length > 0 && <Timeline items={work} kind="work" onCertificate={openCertificate} />}
          {other.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Briefcase size={14} className="text-slate-500" />
                {t('experience.other')}
              </h3>
              <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {other.map((exp, i) => {
                  const hasLoc = L(exp, 'description')?.includes(' — ');
                  const loc = hasLoc ? L(exp, 'description').split(' — ')[0] : null;
                  return (
                    <motion.li
                      key={exp.id}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.06 }}
                      className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline gap-x-6 gap-y-0.5 py-2.5 text-sm"
                      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <span className="min-w-0">
                        <span className="text-slate-300 font-medium">{L(exp, 'role')}</span>
                        <span className="text-slate-600"> · </span>
                        <span className="text-slate-500">{exp.company}</span>
                        {loc && <span className="text-slate-600 text-xs"> · {loc}</span>}
                      </span>
                      <span className="text-xs text-slate-600 whitespace-nowrap sm:text-right">
                        {exp.startDate}{(exp.current || exp.endDate) ? ` – ${exp.current ? t('experience.present') : exp.endDate}` : ''}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          )}
          {(work.length > 0 || other.length > 0) && education.length > 0 && (
            <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(8,145,178,0.3), rgba(6,182,212,0.25), transparent)' }} />
          )}
          {education.length > 0 && <Timeline items={education} kind="education" onCertificate={openCertificate} />}
          {awards.length > 0 && education.length > 0 && (
            <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(245,158,11,0.3), transparent)' }} />
          )}
          {awards.length > 0 && <Timeline items={awards} kind="award" onCertificate={openCertificate} />}
        </div>
        )}
      </div>
      {lightboxUrl && (
        <CertificateLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
      {/* Without JavaScript nothing can be opened, so the explanations are simply shown. */}
      <noscript><style>{'.exp-more{grid-template-rows:1fr}.exp-more>div{visibility:visible}.exp-toggle{display:none}'}</style></noscript>
    </section>
  );
}
