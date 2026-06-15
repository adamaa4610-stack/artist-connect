import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SessionProvider } from '@/components/auth/SessionProvider';
import ParticleBackground from '@/components/effects/ParticleBackgroundWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ArtistConnect',
  description: 'Discover and connect with artists worldwide',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <SessionProvider>
          <ParticleBackground />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
