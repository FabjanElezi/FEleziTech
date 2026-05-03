'use client';
import { motion } from 'framer-motion';
import { Mail, Phone, Link, Send, MapPin } from 'lucide-react';
import { Portfolio } from '@/types';
import CornerAccents from '@/components/CornerAccents';

interface Props { portfolio: Portfolio | null }

export default function Contact({ portfolio }: Props) {
  const email = portfolio?.email || 'fabio.elezi485@icloud.com';
  const phone = portfolio?.phone || '';
  const linkedin = portfolio?.linkedin || '';
  const location = portfolio?.location || 'Tirana, Albania';

  return (
    <section id="contact" className="py-24 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 80%, rgba(124,58,237,0.05), transparent)',
        }}
      />
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-purple-500" />
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Contact</span>
            <span className="w-8 h-px bg-purple-500" />
          </div>
          <h2 className="section-title text-white mb-3">
            Let&apos;s <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            Open to internship and junior developer opportunities. Don&apos;t hesitate to reach out.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact cards */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <a
              href={`mailto:${email}`}
              className="glass rounded-xl p-5 flex items-center gap-4 glass-hover"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.2)' }}
              >
                <Mail size={18} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                <p className="text-white text-sm font-medium">{email}</p>
              </div>
            </a>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="glass rounded-xl p-5 flex items-center gap-4 glass-hover"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(6,182,212,0.15)' }}
                >
                  <Phone size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                  <p className="text-white text-sm font-medium">{phone}</p>
                </div>
              </a>
            )}

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-5 flex items-center gap-4 glass-hover"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.15)' }}
                >
                  <Link size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">LinkedIn</p>
                  <p className="text-white text-sm font-medium">Connect on LinkedIn</p>
                </div>
              </a>
            )}

            <div className="glass rounded-xl p-5 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.15)' }}
              >
                <MapPin size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Location</p>
                <p className="text-white text-sm font-medium">{location}</p>
              </div>
            </div>
          </motion.div>

          {/* CTA card */}
          <motion.div
            className="glass rounded-2xl p-8 flex flex-col justify-center relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.04))',
            }}
          >
            <CornerAccents />
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(124,58,237,0.2)' }}
            >
              <Send size={22} className="text-purple-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-3">Ready to collaborate?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Whether it&apos;s an internship, project collaboration, or just a chat about tech — I&apos;d love to hear from you.
            </p>
            <a href={`mailto:${email}`} className="btn-primary self-start">
              Send me an email <Send size={14} />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
