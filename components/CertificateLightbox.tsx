'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Props {
  url: string;
  onClose: () => void;
}

export default function CertificateLightbox({ url, onClose }: Props) {
  // Track which src finished loading so switching urls shows the spinner again
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === url;
  const failed = failedSrc === url;

  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    // Lock page scroll behind the dialog and move focus into it
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Certificate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(4,7,18,0.95)' }}
        onClick={onClose}
      >
        <div className="min-h-full flex items-center justify-center p-4 sm:p-8">
          <motion.div
            className="relative flex flex-col items-center max-w-3xl w-full"
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{    scale: 0.88, opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-end gap-4 w-full mb-3 text-sm">
              <a
                href={url}
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

            {/* Image — optimized, sized to fit the screen */}
            <div className="relative flex items-center justify-center min-h-[16rem] min-w-[min(20rem,100%)] max-w-full">
              {!loaded && !failed && (
                <div
                  className="absolute w-8 h-8 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', borderTopColor: '#a78bfa' }}
                  aria-label="Loading certificate"
                />
              )}
              {failed ? (
                <p className="text-slate-400 text-sm text-center">
                  Couldn&apos;t load the certificate. Try &quot;Open full size&quot;.
                </p>
              ) : (
                <Image
                  src={url}
                  alt="Certificate"
                  width={1600}
                  height={1600}
                  sizes="(max-width: 768px) 100vw, 768px"
                  onLoad={() => setLoadedSrc(url)}
                  onError={() => setFailedSrc(url)}
                  className="rounded-2xl"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 7rem)',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.15)',
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
