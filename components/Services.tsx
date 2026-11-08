'use client';
import { motion } from 'framer-motion';
import { Globe, BarChart3, Network, Database } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import CornerAccents from '@/components/CornerAccents';
import { Service, ServiceIcon } from '@/types';

const ICONS: Record<ServiceIcon, typeof Globe> = {
  web: Globe,
  data: BarChart3,
  network: Network,
  database: Database,
};

/** The service cards, as edited in Admin → Services. Used on /services. */
export default function ServiceCards({ services }: { services: Service[] }) {
  const { L } = useLang();

  return (
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
  );
}
