'use client';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Globe } from 'lucide-react';
import { Portfolio } from '@/types';

interface Props { portfolio: Portfolio | null }

export default function About({ portfolio }: Props) {
  const bio = portfolio?.bio || '';
  const location = portfolio?.location || 'Tirana, Albania';
  const university = portfolio?.university || 'Metropolitan University of Tirana';
  const openToRemote = portfolio?.openToRemote !== false;

  return (
    <section id="about" className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-12 items-center"
        >
          {/* Avatar placeholder */}
          <div className="flex-shrink-0">
            {portfolio?.profileImage ? (
              <img
                src={portfolio.profileImage}
                alt={portfolio.name}
                className="w-48 h-48 rounded-2xl object-cover"
                style={{ border: '2px solid rgba(124,58,237,0.3)' }}
              />
            ) : (
              <div
                className="w-48 h-48 rounded-2xl flex items-center justify-center text-6xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
                  border: '2px solid rgba(124,58,237,0.3)',
                  color: '#c4b5fd',
                }}
              >
                {portfolio?.name ? portfolio.name.charAt(0) : 'F'}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-purple-500" />
              <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">About Me</span>
            </div>
            <h2 className="section-title text-white mb-4">
              Passionate about <span className="gradient-text">Technology</span>
            </h2>
            <p className="text-slate-400 leading-relaxed text-base mb-6">{bio}</p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <MapPin size={15} className="text-purple-400" />
                {location}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <GraduationCap size={15} className="text-purple-400" />
                {university}
              </div>
              {openToRemote && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Globe size={15} className="text-purple-400" />
                  Open to Remote
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
