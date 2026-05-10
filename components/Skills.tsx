'use client';
import { motion } from 'framer-motion';
import { Skill } from '@/types';
import CornerAccents from '@/components/CornerAccents';

interface Props { skills: Skill[] }

const categoryLabels: Record<string, string> = {
  technical: 'Technical Skills',
  language: 'Languages',
  tool: 'Tools & Soft Skills',
};

const categoryColors: Record<string, string> = {
  technical: 'rgba(124,58,237,0.15)',
  language: 'rgba(6,182,212,0.15)',
  tool: 'rgba(16,185,129,0.15)',
};

const categoryBorder: Record<string, string> = {
  technical: 'rgba(124,58,237,0.35)',
  language: 'rgba(6,182,212,0.35)',
  tool: 'rgba(16,185,129,0.35)',
};

const categoryText: Record<string, string> = {
  technical: '#c4b5fd',
  language: '#67e8f9',
  tool: '#6ee7b7',
};

const categoryCorner: Record<string, string> = {
  technical: 'rgba(124,58,237,0.38)',
  language: 'rgba(6,182,212,0.35)',
  tool: 'rgba(16,185,129,0.35)',
};

export default function Skills({ skills }: Props) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <section id="skills" className="py-24 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124,58,237,0.04), transparent)',
        }}
      />
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-purple-500" />
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Skills</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h2 className="section-title text-white">
            What I <span className="gradient-text">Work With</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(['technical', 'language', 'tool'] as const).map((cat, i) => {
            const items = grouped[cat] || [];
            if (items.length === 0) return null;
            return (
              <motion.div
                key={cat}
                className="glass rounded-2xl p-6 relative glass-hover"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              >
                <CornerAccents color={categoryCorner[cat]} />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  {categoryLabels[cat]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill.id}
                      className="text-sm px-3 py-1 rounded-full font-medium"
                      style={{
                        background: categoryColors[cat],
                        border: `1px solid ${categoryBorder[cat]}`,
                        color: categoryText[cat],
                      }}
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
