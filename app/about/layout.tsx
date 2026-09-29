import type { Metadata } from 'next';

// BUG-9: Unique title + meta description for /about
export const metadata: Metadata = {
  title: 'About Us | DevNest — NIELIT Coding Club',
  description:
    'Learn about DevNest, the official coding club of NIELIT Ropar. Meet our core team, discover our mission, and explore our journey from 2024 to today.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
