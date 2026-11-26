'use client';
import { useSyncExternalStore } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLang } from '@/components/LanguageProvider';
import { motionPaused, onMotionChange, setMotionPaused } from '@/lib/motion';

/**
 * Pauses or plays every animation that runs by itself. The hero shows it as a
 * round icon button next to its steps; the legal line shows it as text.
 */
export default function MotionToggle({ variant }: { variant: 'icon' | 'text' }) {
  const { t } = useLang();
  const paused = useSyncExternalStore(onMotionChange, motionPaused, () => false);
  const label = paused ? t('motion.play') : t('motion.pause');
  const toggle = () => setMotionPaused(!paused);

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        className="glass rounded-full w-8 h-8 shrink-0 inline-flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    );
  }
  return (
    <button type="button" onClick={toggle} className="hover:text-cyan-400 transition-colors">
      {label}
    </button>
  );
}
