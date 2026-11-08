'use client';
import { useLang } from '@/components/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ExternalLink, GitBranch, FileText, Star, Database } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Project } from '@/types';
import CornerAccents from '@/components/CornerAccents';

const DbDesignLightbox = dynamic(() => import('@/components/DbDesignLightbox'), { ssr: false });

interface Props { projects: Project[] }

const CLAMP_THRESHOLD = 160;

function ProjectDescription({ text }: { text: string }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);
  const long = text.length > CLAMP_THRESHOLD;
  return (
    <div className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
      <span className={!expanded && long ? 'line-clamp-3' : undefined}>{text}</span>
      {long && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="mt-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors block"
        >
          {expanded ? t('projects.showLess') : t('projects.readMore')}
        </button>
      )}
    </div>
  );
}

export default function Projects({ projects }: Props) {
  const { t, L } = useLang();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [dbLightbox, setDbLightbox] = useState<string[] | null>(null);
  // Four is what a visitor actually reads. The rest stay one click away
  // rather than turning the section into a wall.
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 4;

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  if (projects.length === 0) {
    return (
      <section id="projects" className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-cyan-500" />
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">{t('projects.eyebrow')}</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h2 className="section-title text-white mb-4">
            {t('projects.headline')} <span className="gradient-text">{t('projects.headlineAccent')}</span>
          </h2>
          <p className="text-slate-500 mt-8">{t('projects.empty')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-cyan-500" />
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">{t('projects.eyebrow')}</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h2 className="section-title text-white">
            {t('projects.headline')} <span className="gradient-text">{t('projects.headlineAccent')}</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 perspective-field">
          {(showAll ? projects : projects.slice(0, VISIBLE)).map((project, i) => (
            <motion.article
              key={project.id}
              className="glass rounded-2xl overflow-hidden glass-hover flex flex-col relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <CornerAccents />

              {/* Image with hover overlay */}
              <div className="h-44 relative overflow-hidden">
                {project.images?.[0] ? (
                  <Image
                    src={project.images[0]}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500"
                    style={{ transform: hoveredId === project.id ? 'scale(1.07)' : 'scale(1)' }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(8,145,178,0.15), rgba(6,182,212,0.08))',
                    }}
                  >
                    {'</> '}
                  </div>
                )}

                {/* Overlay — only over the image */}
                <AnimatePresence>
                  {hoveredId === project.id && project.liveDemoLink && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: 'rgba(9,13,21,0.6)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                      }}
                    >
                      <motion.a
                        href={project.liveDemoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0.82, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.82, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2 font-bold text-white text-sm px-5 py-2.5 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, #0891b2, #0891b2)',
                          boxShadow: '0 0 24px rgba(6,182,212,0.45)',
                          textDecoration: 'none',
                        }}
                        whileHover={{ scale: 1.07 }}
                      >
                        <ExternalLink size={15} /> {t('projects.view')}
                      </motion.a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-semibold text-base leading-tight">{project.title}</h3>
                  {project.featured && (
                    <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 whitespace-nowrap">
                      <Star size={10} fill="currentColor" /> {t('projects.featured')}
                    </span>
                  )}
                </div>

                <ProjectDescription text={L(project, 'description')} />

                {project.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack.map((t) => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-white/5 flex-wrap">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors min-h-[44px]"
                    >
                      <GitBranch size={13} /> {t('projects.code')}
                    </a>
                  )}
                  {project.dbDesignImages && project.dbDesignImages.length > 0 && (
                    <button
                      onClick={() => setDbLightbox(project.dbDesignImages!)}
                      className="db-design-btn flex items-center gap-1.5 text-xs font-semibold transition-all min-h-[44px]"
                      style={{
                        color: '#22d3ee',
                        background: 'rgba(6,182,212,0.1)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: '6px',
                        padding: '4px 10px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(6,182,212,0.2)';
                        e.currentTarget.style.borderColor = 'rgba(6,182,212,0.6)';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(6,182,212,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(6,182,212,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Database size={12} /> DB Design
                    </button>
                  )}
                  {/* On touch devices show View Project here since hover overlay won't trigger */}
                  {isTouch && project.liveDemoLink && (
                    <a
                      href={project.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors min-h-[44px]"
                    >
                      <ExternalLink size={13} /> {t('projects.view')}
                    </a>
                  )}
                  {!isTouch && project.liveDemoLink && (
                    <a
                      href={project.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors min-h-[44px]"
                    >
                      <ExternalLink size={13} /> {t('projects.liveDemo')}
                    </a>
                  )}
                  {project.documentUrl && (
                    <a
                      href={project.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors ml-auto min-h-[44px]"
                    >
                      <FileText size={13} /> {t('projects.docs')}
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {projects.length > VISIBLE && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="btn-ghost text-sm"
            >
              {showAll
                ? t('projects.showFewer')
                : `${t('projects.showMore')} (${projects.length - VISIBLE})`}
            </button>
          </div>
        )}
      </div>
      {dbLightbox && (
        <DbDesignLightbox images={dbLightbox} onClose={() => setDbLightbox(null)} />
      )}
    </section>
  );
}
