'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { SITE_HOST } from '@/lib/site';

// Set on a device after a successful sign-in, so the owner gets the form at once next time.
const OWNER_KEY = 'fe-owner';

/**
 * The owner's sign-in to the content manager.
 *
 * On 13 Nov 2026 Google Safe Browsing marked the whole site as "deceptive pages". The only place
 * that asks anyone for a password was this page: an unnamed email-and-password form on a domain a
 * few days old. So the page now says first whose site this is and who the sign-in is for, and the
 * form itself appears only after a click (or at once on a device that has signed in before). A
 * scanner that opens the page finds an explanation and no password field.
 */
export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/admin/dashboard');
  }, [user, loading, router]);

  // The owner's own device: skip the first step.
  useEffect(() => {
    const id = setTimeout(() => {
      try { if (localStorage.getItem(OWNER_KEY) === '1') setOpen(true); } catch { /* private window */ }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) throw new Error('Invalid credentials');
      try { localStorage.setItem(OWNER_KEY, '1'); } catch { /* private window */ }
      toast.success('Welcome back!');
      router.push('/admin/dashboard');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: '#090d15' }}
    >
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          {/* The page is always dark, so the logo for the dark theme is used as it is. */}
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity" aria-label="Fabjan Elezi, back to the website">
            <Image src="/logo.svg" alt="Fabjan Elezi" width={150} height={50} priority className="h-auto w-[150px] mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Owner sign-in</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            This page is only for the owner of {SITE_HOST}, Fabjan Elezi, to edit the content of his portfolio.
            Visitors do not need an account. There is nothing to register or sign in for.
          </p>
        </div>

        {!open ? (
          <div className="glass rounded-2xl p-8 text-center">
            <button type="button" onClick={() => setOpen(true)} className="btn-primary w-full justify-center">
              I am the owner <LogIn size={15} aria-hidden="true" />
            </button>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mt-5">
              <ArrowLeft size={15} aria-hidden="true" /> Back to the website
            </Link>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="owner-email" className="block text-sm text-slate-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden="true" />
                  <input
                    id="owner-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="owner-password" className="block text-sm text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" aria-hidden="true" />
                  <input
                    id="owner-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign in <LogIn size={15} aria-hidden="true" /></>
                )}
              </button>
            </form>
            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mt-5">
                <ArrowLeft size={15} aria-hidden="true" /> Back to the website
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
