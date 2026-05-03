'use client';
import { motion } from 'framer-motion';
import { ExternalLink, GitBranch, FileText, Star } from 'lucide-react';
import { Project } from '@/types';
import CornerAccents from '@/components/CornerAccents';

interface Props { projects: Project[] }

export default function Projects({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <section id="projects" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-purple-500" />
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Projects</span>
            <span className="w-8 h-px bg-purple-500" />
          </div>
          <h2 className="section-title text-white mb-4">
            My <span className="gradient-text">Work</span>
          </h2>
          <p className="text-slate-500 mt-8">Projects will appear here once added via the admin panel.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-purple-500" />
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Projects</span>
            <span className="w-8 h-px bg-purple-500" />
          </div>
          <h2 className="section-title text-white">
            My <span className="gradient-text">Work</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              className="glass rounded-2xl overflow-hidden glass-hover flex flex-col relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <CornerAccents />
              {/* Image */}
              {project.images?.[0] ? (
                <div className="h-44 overflow-hidden">
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ) : (
                <div
                  className="h-44 flex items-center justify-center text-4xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
                  }}
                >
                  {'</> '}
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-semibold text-base leading-tight">{project.title}</h3>
                  {project.featured && (
                    <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 whitespace-nowrap">
                      <Star size={10} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                  {project.description}
                </p>

                {project.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack.map((t) => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <GitBranch size={13} /> Code
                    </a>
                  )}
                  {project.liveDemoLink && (
                    <a
                      href={project.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink size={13} /> Live Demo
                    </a>
                  )}
                  {project.documentUrl && (
                    <a
                      href={project.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors ml-auto"
                    >
                      <FileText size={13} /> Docs
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
