'use client';
import { useLang } from '@/components/LanguageProvider';
import { motion } from 'framer-motion';
import { Skill } from '@/types';
import CornerAccents from '@/components/CornerAccents';

interface Props { skills: Skill[] }

// Four groups, in the order a recruiter should read them: the analytics
// first, then the systems side, then the web stack, then languages.
const CATS = ['data', 'systems', 'web', 'language'] as const;

const categoryLabels: Record<string, string> = {
  data: 'skills.data',
  systems: 'skills.systems',
  web: 'skills.web',
  language: 'skills.language',
};

const categoryCorner: Record<string, string> = {
  data: 'rgba(8,145,178,0.38)',
  systems: 'rgba(16,185,129,0.35)',
  web: 'rgba(6,182,212,0.35)',
  language: 'rgba(245,158,11,0.32)',
};

const categoryChipClass: Record<string, string> = {
  data: 'skill-chip-purple',
  systems: 'skill-chip-emerald',
  web: 'skill-chip-cyan',
  language: 'skill-chip-amber',
};

export default function Skills({ skills }: Props) {
  const { t } = useLang();
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});
  // Sort inside each card. The query orders by "order" across the whole table,
  // so a card's own sequence would otherwise depend on values in other cards.
  for (const list of Object.values(grouped)) {
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return (
    <section id="skills" className="py-20 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(8,145,178,0.04), transparent)',
        }}
      />
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-cyan-500" />
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">{t('skills.eyebrow')}</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h2 className="section-title text-white">
            What I <span className="gradient-text">Work With</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 perspective-field">
          {CATS.map((cat, i) => {
            const items = grouped[cat] || [];
            if (items.length === 0) return null;
            return (
              <motion.div
                key={cat}
                className="glass rounded-2xl p-6 relative glass-hover h-full"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              >
                <CornerAccents color={categoryCorner[cat]} />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  {t(categoryLabels[cat])}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill.id}
                      className={`skill-chip ${categoryChipClass[cat]}`}
                    >
                      {skill.name}
                      {skill.level && (
                        <span className="text-xs opacity-60 ml-1">· {skill.level}</span>
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
