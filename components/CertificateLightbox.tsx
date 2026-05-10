'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  url: string;
  onClose: () => void;
}

export default function CertificateLightbox({ url, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(4,7,18,0.92)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-3xl"
          initial={{ scale: 0.88, opacity: 0, y: 16 }}
          animate={{ scale: 1,    opacity: 1, y: 0  }}
          exit={{    scale: 0.88, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-9 right-0 flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <X size={16} /> Close
          </button>
          <img
            src={url}
            alt="Certificate"
            className="w-full rounded-2xl"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.15)',
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
