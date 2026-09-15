'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  images: string[];
  onClose: () => void;
}

export default function DbDesignLightbox({ images, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Track which src finished loading so each slide shows the spinner until ready
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = images[idx];
  const loaded = loadedSrc === src;
  const failed = failedSrc === src;

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    // Lock page scroll behind the dialog and move focus into it
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  const labels = ['Table Overview', 'ER Diagram'];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Database design"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(4,7,18,0.95)' }}
        onClick={onClose}
      >
        <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
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
              <div className="flex items-center gap-4 text-sm">
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Open full size ↗
                </a>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} /> Close
                </button>
              </div>
            </div>

            {/* Image — optimized, sized to fit the screen */}
            <div className="relative flex items-center justify-center min-h-[16rem]">
              {!loaded && !failed && (
                <div
                  className="absolute w-8 h-8 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: '#22d3ee' }}
                  aria-label="Loading diagram"
                />
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={idx}
                  className="flex items-center justify-center max-w-full"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.18 }}
                >
                  {failed ? (
                    <p className="text-slate-400 text-sm text-center">
                      Couldn&apos;t load this diagram. Try &quot;Open full size&quot;.
                    </p>
                  ) : (
                    <Image
                      src={src}
                      alt={`DB Design ${idx + 1}`}
                      width={1600}
                      height={1600}
                      sizes="(max-width: 896px) 100vw, 896px"
                      onLoad={() => setLoadedSrc(src)}
                      onError={() => setFailedSrc(src)}
                      className="rounded-2xl"
                      style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: 'calc(100vh - 9rem)',
                        opacity: loaded ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        border: '1px solid rgba(6,182,212,0.2)',
                        boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.1)',
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous diagram"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{ background: 'rgba(4,7,18,0.7)', border: '1px solid rgba(6,182,212,0.3)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(4,7,18,0.7)'; }}
                  >
                    <ChevronLeft size={18} className="text-cyan-400" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next diagram"
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
                    aria-label={`Show ${labels[i] ?? `diagram ${i + 1}`}`}
                    aria-current={i === idx}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i === idx ? '#22d3ee' : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
