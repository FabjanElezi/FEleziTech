'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Download, ArrowDown, Link, GitBranch, Mail } from 'lucide-react';
import { Portfolio } from '@/types';

interface Props { portfolio: Portfolio | null }

function Typewriter({ roles }: { roles: string[] }) {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const current = roles[idx];
    let t: ReturnType<typeof setTimeout>;
    if (typing) {
      if (displayed.length < current.length) {
        t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 42);
      } else {
        t = setTimeout(() => setTyping(false), 1800);
      }
    } else {
      if (displayed.length > 0) {
        t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 22);
      } else {
        setIdx(i => (i + 1) % roles.length);
        setTyping(true);
      }
    }
    return () => clearTimeout(t);
  }, [displayed, typing, idx, roles]);

  return (
    <span>
      {displayed}
      <span
        className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
        style={{ background: '#22d3ee', borderRadius: 1 }}
      />
    </span>
  );
}

export default function Hero({ portfolio }: Props) {
  const name = portfolio?.name || 'Fabjan Elezi';
  const title = portfolio?.title || 'Computer Science & Engineering Student';
  const tagline = portfolio?.heroTagline || 'Building secure, scalable digital experiences.';
  const cvUrl = portfolio?.cvUrl;

  const roles = [
    'Building Data-Driven Solutions',
    'Business Intelligence Enthusiast',
    'Analytics & Technology',
    'Security & Networking Enthusiast',
  ];

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
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(167,139,250,0.35)',
                color: '#c4b5fd',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                boxShadow: '0 2px 0 rgba(255,255,255,0.12) inset, 0 0 24px rgba(124,58,237,0.18)',
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
          className="text-lg sm:text-xl text-slate-400 mb-2 font-medium"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {title}
        </motion.p>

        <motion.p
          className="text-base mb-10 max-w-xl mx-auto font-medium"
          style={{ color: 'rgba(34,211,238,0.75)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Typewriter roles={roles} />
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
            <a href="/api/cv" download="Fabjan_Elezi_CV.pdf" className="btn-ghost">
              Download CV <Download size={16} />
            </a>
          ) : (
            <a href="#contact" className="btn-ghost">
              Get in Touch <Mail size={16} />
            </a>
          )}
        </motion.div>

        {/* Arrow pointing to social links */}
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ArrowDown size={16} className="text-slate-600" />
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {portfolio?.linkedin && (
            <a
              href={portfolio.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="social-icon-btn"
            >
              <Link size={22} />
            </a>
          )}
          {portfolio?.github && (
            <a
              href={portfolio.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="social-icon-btn"
            >
              <GitBranch size={22} />
            </a>
          )}
          {portfolio?.email && (
            <a
              href={`mailto:${portfolio.email}`}
              aria-label="Email"
              className="social-icon-btn"
            >
              <Mail size={22} />
            </a>
          )}
        </motion.div>

      </div>
    </section>
  );
}
