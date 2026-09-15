import type { Metadata } from 'next';
import AdminChrome from '@/components/AdminChrome';

// Keep the admin area out of search engines.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminChrome />
      {children}
    </>
  );
}
