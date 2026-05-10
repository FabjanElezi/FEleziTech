import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lucky 7 Flights',
  description: 'Flight booking system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
