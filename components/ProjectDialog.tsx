'use client';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink, GitBranch, FileText, Star } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '@/components/LanguageProvider';
import { Project } from '@/types';

interface Props {
  project: Project;
  onClose: () => void;
}

/**
 * Full project details. Opened from "Read more" so the card itself never
 * changes height (expanding in place stretched every card in the row).
 * Also the only place visitors see all of a project's screenshots.
 */
export default function ProjectDialog({ project, onClose }: Props) {
  const { t, L } = useLang();
  const images = project.images ?? [];
  const [idx, setIdx] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (images.length > 1 && e.key === 'ArrowLeft') prev();
      if (images.length > 1 && e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [onClose, prev, next, images.length]);

  // Rendered on <body>: the page content sits in its own stacking layer, so
  // inside it the dialog would end up under the floating buttons.
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[99999] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ background: 'rgba(9,13,21,0.88)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center p-3 sm:p-8">
        <motion.div
          className="glass rounded-2xl w-full max-w-3xl overflow-hidden relative"
          style={{ background: 'rgba(13,18,28,0.97)' }}
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={t('projects.close')}
            className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            style={{ background: 'rgba(9,13,21,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <X size={18} />
          </button>

          {/* Screenshots: contained, so wide desktop shots and tall phone shots both fit */}
          {images.length > 0 && (
            <div className="relative bg-black/40 border-b border-white/5">
              <div className="relative h-[42vh] sm:h-[420px]">
                <Image
                  key={images[idx]}
                  src={images[idx]}
                  alt={`${project.title} – ${idx + 1} / ${images.length}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-contain"
                  priority
                />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label={t('projects.prevImage')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(9,13,21,0.75)', border: '1px solid rgba(6,182,212,0.35)' }}
                  >
                    <ChevronLeft size={18} className="text-cyan-400" />
                  </button>
                  <button
                    onClick={next}
                    aria-label={t('projects.nextImage')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(9,13,21,0.75)', border: '1px solid rgba(6,182,212,0.35)' }}
                  >
                    <ChevronRight size={18} className="text-cyan-400" />
                  </button>
                  <span className="absolute bottom-3 right-3 text-[11px] text-slate-300 px-2 py-0.5 rounded-full bg-black/60">
                    {idx + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
          )}

          {images.length > 1 && (
            <div className="flex gap-2 px-5 pt-4 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setIdx(i)}
                  aria-label={`${t('projects.image')} ${i + 1}`}
                  aria-current={i === idx}
                  className="relative w-16 h-11 shrink-0 rounded-md overflow-hidden transition-opacity"
                  style={{
                    border: i === idx ? '2px solid #22d3ee' : '1px solid rgba(255,255,255,0.12)',
                    opacity: i === idx ? 1 : 0.6,
                  }}
                >
                  <Image src={src} alt="" fill sizes="64px" className="object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-3 pr-10">
              <h3 className="text-white font-semibold text-xl leading-snug">{project.title}</h3>
              {project.featured && (
                <span className="mt-1 flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 whitespace-nowrap">
                  <Star size={10} fill="currentColor" /> {t('projects.featured')}
                </span>
              )}
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">{L(project, 'description')}</p>

            {project.techStack?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5">
                {project.techStack.map((s) => (
                  <span key={s} className="tech-tag">{s}</span>
                ))}
              </div>
            )}

            {(project.liveDemoLink || project.githubLink || project.documentUrl) && (
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/5">
                {project.liveDemoLink && (
                  <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                    <ExternalLink size={15} /> {t('projects.liveDemo')}
                  </a>
                )}
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                    <GitBranch size={15} /> {t('projects.code')}
                  </a>
                )}
                {project.documentUrl && (
                  <a href={project.documentUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
                    <FileText size={15} /> {t('projects.docs')}
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  );
}
