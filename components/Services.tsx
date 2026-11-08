'use client';
import { motion } from 'framer-motion';
import { Globe, BarChart3, Network, Database, ArrowRight } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import CornerAccents from '@/components/CornerAccents';
import { Service, ServiceIcon } from '@/types';

const ICONS: Record<ServiceIcon, typeof Globe> = {
  web: Globe,
  data: BarChart3,
  network: Network,
  database: Database,
};

/**
 * Freelance offers, kept deliberately quiet. The page is first a portfolio for
 * Werkstudent roles, so this sits after the projects and reads as "I also take
 * on small projects" rather than as an agency front.
 */
export default function Services({ services }: { services: Service[] }) {
  const { t, L } = useLang();
  if (services.length === 0) return null;

  return (
    <section id="services" className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-px bg-cyan-500" />
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">{t('services.eyebrow')}</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h2 className="section-title text-white">
            {t('services.headline')} <span className="gradient-text">{t('services.headlineAccent')}</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">{t('services.sub')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 perspective-field">
          {services.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Globe;
            return (
              <motion.div
                key={s.id}
                className="glass rounded-2xl p-6 relative glass-hover h-full"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              >
                <CornerAccents color="rgba(8,145,178,0.38)" />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(8,145,178,0.15)' }}
                >
                  <Icon size={20} className="text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{L(s, 'title')}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{L(s, 'description')}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <span className="text-sm text-slate-500">{t('services.pricing')}</span>
          <a href="#contact" className="btn-primary text-sm">
            {t('services.cta')} <ArrowRight size={15} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
