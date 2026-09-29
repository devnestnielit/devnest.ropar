import type { Metadata } from 'next';

// BUG-9: Unique title + meta description for /events
export const metadata: Metadata = {
  title: 'Events | DevNest — NIELIT Coding Club',
  description:
    'Browse upcoming and past coding events, hackathons, and workshops hosted by DevNest at NIELIT Ropar. Register for events and compete with fellow members.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
