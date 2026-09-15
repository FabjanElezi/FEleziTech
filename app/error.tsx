'use client';
import { RefreshCw } from 'lucide-react';

// Shown if the page fails to render (for example while the database is unreachable).
// With ISR, a failed background refresh keeps serving the last good page instead.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-3">Something went wrong</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          This page couldn&apos;t load
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Please try again in a moment.
        </p>
        <button onClick={reset} className="btn-primary">
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    </main>
  );
}
