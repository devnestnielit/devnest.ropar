import type { Metadata } from 'next';

// BUG-9: Unique title + meta description for /contact
export const metadata: Metadata = {
  title: 'Contact Us | DevNest — NIELIT Coding Club',
  description:
    'Get in touch with DevNest. Have a question, want to collaborate, or interested in joining? Send us a message and our team will get back to you.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
