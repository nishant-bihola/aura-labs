import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Hydrator from '@/components/Hydrator';

export const metadata: Metadata = {
  title: 'PayTrack — Biweekly Budget',
  description: 'Advanced biweekly paycheck budget tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Hydrator />
        <div className="flex min-h-screen">
          <Navigation />
          <div className="flex-1 md:ml-64 min-h-screen">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
