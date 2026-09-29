import type { Metadata } from 'next';

// BUG-9: Unique title + meta description for /leaderboard
export const metadata: Metadata = {
  title: 'Leaderboard | DevNest — NIELIT Coding Club',
  description:
    'See the top-performing DevNest members ranked by monthly and total points. Compete in events and climb the leaderboard at NIELIT Ropar\'s coding club.',
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
