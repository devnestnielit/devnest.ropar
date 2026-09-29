'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaExclamationTriangle, FaSync, FaHome } from 'react-icons/fa';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="container" style={{ padding: '8rem 20px', textAlign: 'center', maxWidth: 640 }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '3.5rem 2rem',
        borderRadius: 24,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <FaExclamationTriangle style={{ fontSize: '3.5rem', color: 'var(--accent)', marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
          Something Went Wrong
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          An unexpected error occurred while loading this page. You can try refreshing or navigate back to safety.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => reset()} className="btn-primary" style={{ padding: '12px 28px' }}>
            <FaSync /> Try Again
          </button>
          <Link href="/" className="btn-outline" style={{ padding: '12px 28px' }}>
            <FaHome /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
