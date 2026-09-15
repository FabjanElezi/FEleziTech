import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-3">404</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Page <span className="gradient-text">not found</span>
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link href="/" className="btn-primary">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </main>
  );
}
