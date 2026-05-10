'use client';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Globe } from 'lucide-react';
import { Portfolio } from '@/types';

interface Props { portfolio: Portfolio | null }

const ease = [0.22, 1, 0.36, 1] as const;

export default function About({ portfolio }: Props) {
  const bio        = portfolio?.bio      || '';
  const location   = portfolio?.location || 'Tirana, Albania';
  const university = portfolio?.university || 'Metropolitan University of Tirana';
  const openToRemote = portfolio?.openToRemote !== false;

  const chips = [
    { icon: <MapPin size={14} className="text-purple-400" />,      label: location },
    { icon: <GraduationCap size={14} className="text-purple-400" />, label: university },
    ...(openToRemote ? [{ icon: <Globe size={14} className="text-cyan-400" />, label: 'Open to Remote' }] : []),
  ];

  return (
    <section id="about" className="py-32 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-center">

          {/* Avatar */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
          >
            {portfolio?.profileImage ? (
              <img
                src={portfolio.profileImage}
                alt={portfolio.name}
                className="w-48 h-48 rounded-2xl object-cover"
                style={{ border: '2px solid rgba(124,58,237,0.3)', boxShadow: '0 0 32px rgba(124,58,237,0.12)' }}
              />
            ) : (
              <div
                className="w-48 h-48 rounded-2xl flex items-center justify-center text-6xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
                  border: '2px solid rgba(124,58,237,0.3)',
                  boxShadow: '0 0 32px rgba(124,58,237,0.12)',
                  color: '#c4b5fd',
                }}
              >
                {portfolio?.name ? portfolio.name.charAt(0) : 'F'}
              </div>
            )}
          </motion.div>

          {/* Text */}
          <div>
            <motion.div
              className="flex items-center gap-2 mb-3"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease, delay: 0.08 }}
            >
              <span className="w-8 h-px bg-purple-500" />
              <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">About Me</span>
            </motion.div>

            <motion.h2
              className="section-title text-white mb-4"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.14 }}
            >
              Passionate about <span className="gradient-text">Technology</span>
            </motion.h2>

            <motion.p
              className="text-slate-400 leading-relaxed text-base mb-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
            >
              {bio}
            </motion.p>

            <div className="flex flex-wrap gap-3">
              {chips.map((chip, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 text-slate-500 text-sm"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease, delay: 0.28 + i * 0.07 }}
                >
                  {chip.icon} {chip.label}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
