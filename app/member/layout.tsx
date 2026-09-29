import type { Metadata } from 'next';

// BUG-9: Unique title + meta description for /member/* routes
export const metadata: Metadata = {
  title: 'Member Portal | DevNest — NIELIT Coding Club',
  description:
    'Access the DevNest member portal. Log in to manage your profile, view your points, submit profile updates, and track your contributions.',
};

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
