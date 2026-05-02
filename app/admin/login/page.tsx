'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/admin/dashboard');
  }, [user, loading, router]);

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
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#040712' }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', left: '30%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))', border: '1px solid rgba(124,58,237,0.4)' }}
          >
            <Lock size={24} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage your portfolio</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-9"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-9 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
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
                <>Sign In <LogIn size={15} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
