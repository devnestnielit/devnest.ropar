import type { Metadata } from 'next';

// BUG-9: Unique title + meta description for /members (join / apply)
export const metadata: Metadata = {
  title: 'Join DevNest | Apply for Membership — NIELIT Coding Club',
  description:
    'Apply to become a member of DevNest, the official coding club of NIELIT Ropar. Submit your application and get access to events, projects, and the community.',
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
