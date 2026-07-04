import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Hydrator from '@/components/Hydrator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PayTrack — Biweekly Budget',
  description: 'Advanced biweekly paycheck budget tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Hydrator />
        <div className="flex min-h-screen">
          <Navigation />
          <div className="flex-1 md:ml-64 min-h-screen">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-10">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
