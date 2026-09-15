'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Download, ArrowDown, Mail } from 'lucide-react';
import { Portfolio } from '@/types';

interface Props { portfolio: Portfolio | null }

function Typewriter({ roles }: { roles: string[] }) {
  // Start with the first role fully shown so the text is in the server HTML
  // and visible before JavaScript loads; the cycle then holds, deletes and continues.
  const [displayed, setDisplayed] = useState(roles[0]);
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

// Entrance animation is CSS-driven (.hero-in in globals.css) so the hero is
// visible as soon as the HTML paints, instead of waiting for JS to hydrate.
const reveal = (delay: number) => ({ '--d': `${delay}s` } as React.CSSProperties);

export default function Hero({ portfolio }: Props) {
  const name = portfolio?.name || 'Fabjan Elezi';
  const title = portfolio?.title || 'M.Sc. Information Systems Student';
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
          background: 'radial-gradient(circle, rgba(8,145,178,0.18), transparent 70%)',
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
          <div className="mb-6 hero-in" style={reveal(0)}>
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(8,145,178,0.1)',
                border: '1px solid rgba(34,211,238,0.35)',
                color: '#67e8f9',
                backdropFilter: 'blur(16px) saturate(160%)',
                WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                boxShadow: '0 2px 0 rgba(255,255,255,0.12) inset, 0 0 24px rgba(8,145,178,0.18)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#22d3ee' }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#0891b2' }} />
              </span>
              Available for opportunities
            </span>
          </div>
        )}

        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 leading-tight hero-in"
          style={reveal(0.1)}
        >
          Hi, I&apos;m{' '}
          <span className="gradient-text">{name.split(' ')[0]}</span>
          <br />
          <span className="text-slate-300">{name.split(' ').slice(1).join(' ')}</span>
        </h1>

        <p
          className="text-lg sm:text-xl text-slate-400 mb-2 font-medium hero-in"
          style={reveal(0.2)}
        >
          {title}
        </p>

        <p
          className="text-base mb-10 max-w-xl mx-auto font-medium hero-in"
          style={{ color: 'rgba(34,211,238,0.75)', ...reveal(0.3) }}
        >
          <Typewriter roles={roles} />
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-4 hero-in"
          style={reveal(0.4)}
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
        </div>

        {/* Arrow pointing to social links */}
        <div className="flex justify-center mt-8 hero-in" style={reveal(0.55)}>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ArrowDown size={16} className="text-slate-600" />
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-4 hero-in" style={reveal(0.6)}>
          {portfolio?.linkedin && (
            <a
              href={portfolio.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="social-icon-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
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
        </div>

      </div>
    </section>
  );
}
