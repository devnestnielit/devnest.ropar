import type { Metadata } from 'next';

// BUG-9: Unique title + meta description for /projects
export const metadata: Metadata = {
  title: 'Projects | DevNest — NIELIT Coding Club',
  description:
    'Explore open-source and student projects built by DevNest members at NIELIT Ropar. Discover innovative tech solutions, tools, and web apps created by our community.',
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
