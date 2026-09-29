'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaExclamationTriangle, FaSync, FaHome } from 'react-icons/fa';

export default function ContactError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // BUG-5: Surface contact page rendering or network errors
    console.error('Contact page error caught by error boundary:', error);
  }, [error]);

  return (
    <div className="container" style={{ padding: '6rem 20px', textAlign: 'center', maxWidth: 600 }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '3rem 2rem',
        borderRadius: 20,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <FaExclamationTriangle style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Unable to Load Contact Form
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          We encountered a temporary issue loading this page. Please try refreshing or return to the homepage.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => reset()} className="btn-primary" style={{ padding: '12px 24px' }}>
            <FaSync /> Try Again
          </button>
          <Link href="/" className="btn-outline" style={{ padding: '12px 24px' }}>
            <FaHome /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
