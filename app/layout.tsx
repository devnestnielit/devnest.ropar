import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticlesBackground from '@/components/ParticlesBackground';

export const metadata: Metadata = {
  title: 'DevNest | NIELIT Coding Club',
  description: 'The official coding club of NIELIT. We build, we learn, we grow, we code.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* BUG-20: noscript fallback so pages aren't stuck on "LOADING DEVNEST..." without JS */}
        <noscript>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: '#0a0f1e', color: '#94a3b8', padding: '12px 20px',
            textAlign: 'center', fontSize: '0.9rem', borderBottom: '1px solid #1e293b'
          }}>
            ⚠️ JavaScript is disabled. Some interactive features (live events, projects, leaderboard) require JavaScript to load content.
          </div>
        </noscript>
        <ParticlesBackground />
        <Navbar />
        {/* Margin top to account for fixed navbar */}
        <main style={{ minHeight: 'calc(100vh - 72px)', marginTop: '72px' }}>
          {children}
        </main>
        <Footer />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }
        }}/>
      </body>
    </html>
  );
}
