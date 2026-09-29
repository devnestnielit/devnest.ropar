import type { Metadata } from 'next';

// BUG-9: Unique title + meta description for /blog
export const metadata: Metadata = {
  title: 'Blog | DevNest — NIELIT Coding Club',
  description:
    'Read technical articles, tutorials, and project showcases written by DevNest members. Stay updated on the latest in web development, algorithms, and open source.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
