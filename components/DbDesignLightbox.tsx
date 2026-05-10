'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface Props {
  images: string[];
  onClose: () => void;
}

export default function DbDesignLightbox({ images, onClose }: Props) {
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  const labels = ['Table Overview', 'ER Diagram'];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(4,7,18,0.94)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-4xl"
          initial={{ scale: 0.88, opacity: 0, y: 16 }}
          animate={{ scale: 1,    opacity: 1, y: 0  }}
          exit={{    scale: 0.88, opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                Database Design
              </span>
              {images.length > 1 && (
                <span className="text-slate-500 text-xs">
                  — {labels[idx] ?? `${idx + 1} / ${images.length}`}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <X size={16} /> Close
            </button>
          </div>

          {/* Image */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={idx}
                src={images[idx]}
                alt={`DB Design ${idx + 1}`}
                className="w-full rounded-2xl"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.18 }}
                style={{
                  border: '1px solid rgba(6,182,212,0.2)',
                  boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.1)',
                }}
              />
            </AnimatePresence>

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'rgba(4,7,18,0.7)', border: '1px solid rgba(6,182,212,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(4,7,18,0.7)'; }}
                >
                  <ChevronLeft size={18} className="text-cyan-400" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'rgba(4,7,18,0.7)', border: '1px solid rgba(6,182,212,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(4,7,18,0.7)'; }}
                >
                  <ChevronRight size={18} className="text-cyan-400" />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === idx ? '#22d3ee' : 'rgba(255,255,255,0.2)' }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
