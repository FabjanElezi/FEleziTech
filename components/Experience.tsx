'use client';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Briefcase, GraduationCap, Calendar, MapPin, Award } from 'lucide-react';
import { Experience as Exp } from '@/types';
import CornerAccents from '@/components/CornerAccents';

const CertificateLightbox = dynamic(() => import('@/components/CertificateLightbox'), { ssr: false });

interface Props { experiences: Exp[] }

export default function Experience({ experiences }: Props) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const openCertificate = useCallback((url: string) => {
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(url) ||
      url.includes('blob.vercel-storage.com');
    if (isImage) setLightboxUrl(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  }, []);
  const work = experiences.filter((e) => e.type === 'work');
  const education = experiences.filter((e) => e.type === 'education');

  const Timeline = ({ items, label }: { items: Exp[]; label: string }) => (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
        {label === 'Work' ? <Briefcase size={14} className="text-purple-400" /> : <GraduationCap size={14} className="text-cyan-400" />}
        {label}
      </h3>
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{ background: label === 'Education'
            ? 'linear-gradient(to bottom, rgba(6,182,212,0.5), transparent)'
            : 'linear-gradient(to bottom, rgba(124,58,237,0.5), transparent)' }}
        />
        <div className="space-y-10 pl-6">
          {items.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative"
            >
              <div
                className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 ${label === 'Education' ? 'border-cyan-400' : 'border-purple-500'}`}
                style={{ background: '#040712', transform: 'translateX(-50%)' }}
              />
              <div className="glass rounded-xl p-4 sm:p-5 glass-hover relative">
                <CornerAccents size={9} inset={7} />
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 mb-1">
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm leading-snug">{exp.role}</p>
                    <p className="text-purple-400 text-sm">{exp.company}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={11} />
                      {exp.startDate}{(exp.current || exp.endDate) ? ` – ${exp.current ? 'Present' : exp.endDate}` : ''}
                    </span>
                    {exp.description?.includes(' — ') && (
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin size={11} />
                        {exp.description.split(' — ')[0]}
                      </span>
                    )}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                    {exp.description.includes(' — ') ? exp.description.split(' — ').slice(1).join(' — ') : exp.description}
                  </p>
                )}
                {exp.certificateUrl && (
                  <button
                    onClick={() => openCertificate(exp.certificateUrl!)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold transition-all"
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
                    <Award size={12} /> View Certificate
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section id="experience" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-18"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-purple-500" />
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Timeline</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h2 className="section-title text-white">
            Experience &amp; <span className="gradient-text">Education</span>
          </h2>
        </motion.div>

        <div className="space-y-16 max-w-3xl mx-auto">
          {work.length > 0 && <Timeline items={work} label="Work" />}
          {work.length > 0 && education.length > 0 && (
            <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), rgba(6,182,212,0.25), transparent)' }} />
          )}
          {education.length > 0 && <Timeline items={education} label="Education" />}
        </div>
      </div>
      {lightboxUrl && (
        <CertificateLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      )}
    </section>
  );
}
