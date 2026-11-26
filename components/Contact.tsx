'use client';
import { useLang } from '@/components/LanguageProvider';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Link, Send, MapPin, Copy, Check, Code2, ArrowRight, FileText, Clock } from 'lucide-react';
import NextLink from 'next/link';
import { Portfolio } from '@/types';
import CornerAccents from '@/components/CornerAccents';
import SectionNumber from '@/components/SectionNumber';
import { cvLabel } from '@/lib/cv';

interface Props { portfolio: Portfolio | null }

export default function Contact({ portfolio }: Props) {
  const { t } = useLang();
  const email = portfolio?.email || 'fabio.elezi485@icloud.com';
  const linkedin = portfolio?.linkedin || '';
  const github = portfolio?.github || '';
  const location = portfolio?.location || 'Tirana, Albania';
  const [copied, setCopied] = useState(false);

  // A click on the email card copies the address and says so for two seconds.
  // Where the clipboard is not available (old browsers, some in-app browsers)
  // the click opens the mail app instead, so it never does nothing.
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <section id="contact" className="py-20 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 80%, rgba(8,145,178,0.05), transparent)',
        }}
      />
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-18"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-cyan-500" />
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider"><SectionNumber id="contact" />{t('contact.eyebrow')}</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h2 className="section-title text-white mb-3">
            {t('contact.headline')} <span className="gradient-text">{t('contact.headlineAccent')}</span>
          </h2>
          <p className="text-body text-base max-w-md mx-auto">
            {t('contact.sub')}
          </p>
          <NextLink href="/services" className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 mt-3 transition-colors">
            {t('contact.servicesHint')} <ArrowRight size={14} aria-hidden="true" />
          </NextLink>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 perspective-field">
          {/* Contact cards — min-w-0 lets the long email truncate on narrow phones */}
          <div className="space-y-4 min-w-0">
            <motion.button
              type="button"
              onClick={copyEmail}
              aria-label={`${t('contact.copy')}: ${email}`}
              className="glass rounded-xl p-5 flex items-center gap-4 glass-hover w-full text-left cursor-pointer"
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: [0.22,1,0.36,1], delay: 0 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(8,145,178,0.2)' }}
              >
                <Mail size={18} className="text-cyan-400" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-body mb-0.5">{t('contact.email')}</p>
                <p className="text-white text-sm font-medium truncate">{email}</p>
              </div>
              <span
                aria-hidden="true"
                className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                style={{
                  background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${copied ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  color: copied ? '#6ee7b7' : '#94a3b8',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? t('contact.copiedShort') : t('contact.copyShort')}
              </span>
            </motion.button>
            {/* Read out by screen readers when the address has been copied. */}
            <p className="sr-only" aria-live="polite">{copied ? t('contact.copied') : ''}</p>

            {linkedin && (
              <motion.a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-5 flex items-center gap-4 glass-hover"
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: [0.22,1,0.36,1], delay: 0.16 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(6,182,212,0.15)' }}
                >
                  <Link size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-body mb-0.5">LinkedIn</p>
                  <p className="text-white text-sm font-medium">{t('contact.connect')}</p>
                </div>
              </motion.a>
            )}

            {github && (
              <motion.a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-5 flex items-center gap-4 glass-hover"
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: [0.22,1,0.36,1], delay: 0.2 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(6,182,212,0.15)' }}
                >
                  <Code2 size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-body mb-0.5">{t('contact.github')}</p>
                  <p className="text-white text-sm font-medium">{t('contact.viewCode')}</p>
                </div>
              </motion.a>
            )}

            <motion.div
              className="glass rounded-xl p-5 flex items-center gap-4"
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: [0.22,1,0.36,1], delay: 0.24 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <MapPin size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-body mb-0.5">{t('contact.location')}</p>
                <p className="text-white text-sm font-medium">{location}</p>
              </div>
            </motion.div>

            {/* Same card as Location; the "available for work" switch in /admin hides it. */}
            {portfolio?.availableForWork !== false && (
              <motion.div
                className="glass rounded-xl p-5 flex items-center gap-4"
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: [0.22,1,0.36,1], delay: 0.28 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(8,145,178,0.2)' }}
                >
                  <Clock size={18} className="text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-body mb-0.5">{t('contact.availability')}</p>
                  <p className="text-white text-sm font-medium">{t('contact.availabilityText')}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* CTA card */}
          <motion.div
            className="glass rounded-2xl p-6 sm:p-8 flex flex-col justify-center relative min-w-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22,1,0.36,1], delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(8,145,178,0.08), rgba(6,182,212,0.04))',
            }}
          >
            <CornerAccents />
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(8,145,178,0.2)' }}
            >
              <Send size={22} className="text-cyan-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-3">{t('contact.ready')}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {t('contact.readyText')}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${email}`} className="btn-primary">
                {t('contact.sendEmail')} <Send size={14} />
              </a>
              {portfolio?.cvUrl && (
                <a href="/api/cv" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  {cvLabel(portfolio.cvUrl, t)} <FileText size={14} />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
