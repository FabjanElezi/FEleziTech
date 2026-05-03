'use client';
import { motion } from 'framer-motion';
import { Download, ArrowDown, Link, GitBranch, Mail } from 'lucide-react';
import { Portfolio } from '@/types';

interface Props { portfolio: Portfolio | null }

export default function Hero({ portfolio }: Props) {
  const name = portfolio?.name || 'Fabjan Elezi';
  const title = portfolio?.title || 'Computer Science & Engineering Student';
  const tagline = portfolio?.heroTagline || 'Building secure, scalable digital experiences.';
  const cvUrl = portfolio?.cvUrl;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-10%', left: '-10%',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '5%', right: '-5%',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {portfolio?.availableForWork !== false && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.35)',
                color: '#c4b5fd',
                boxShadow: '0 0 20px rgba(124,58,237,0.12)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#a78bfa' }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#7c3aed' }} />
              </span>
              Available for opportunities
            </span>
          </motion.div>
        )}

        <motion.h1
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Hi, I&apos;m{' '}
          <span className="gradient-text">{name.split(' ')[0]}</span>
          <br />
          <span className="text-slate-300">{name.split(' ').slice(1).join(' ')}</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-slate-400 mb-3 font-medium"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {title}
        </motion.p>

        <motion.p
          className="text-base text-slate-500 mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {tagline}
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#projects" className="btn-primary">
            View Projects <ArrowDown size={16} />
          </a>
          {cvUrl ? (
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Download CV <Download size={16} />
            </a>
          ) : (
            <a href="#contact" className="btn-ghost">
              Get in Touch <Mail size={16} />
            </a>
          )}
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-5 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {portfolio?.linkedin && (
            <a
              href={portfolio.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-purple-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Link size={20} />
            </a>
          )}
          {portfolio?.github && (
            <a
              href={portfolio.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-purple-400 transition-colors"
              aria-label="GitHub"
            >
              <GitBranch size={20} />
            </a>
          )}
          {portfolio?.email && (
            <a
              href={`mailto:${portfolio.email}`}
              className="text-slate-500 hover:text-purple-400 transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} className="text-slate-600" />
        </motion.div>
      </div>
    </section>
  );
}
