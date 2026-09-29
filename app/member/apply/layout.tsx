import type { Metadata } from 'next';

// BUG-9 & BUG-21: Unique title + meta description for /member/apply
export const metadata: Metadata = {
  title: 'Join DevNest | Apply for Membership — NIELIT Coding Club',
  description:
    'Apply to become a member of DevNest, the official coding club of NIELIT Ropar. Submit your application and get access to events, projects, and the community.',
};

export default function MemberApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
