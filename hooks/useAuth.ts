'use client';
import { useEffect, useState } from 'react';

export interface AdminUser { email: string; }

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { email: string } | null) => {
        setUser(data?.email ? { email: data.email } : null);
        setLoading(false);
      })
      .catch(() => { setUser(null); setLoading(false); });
  }, []);

  return { user, loading };
}
