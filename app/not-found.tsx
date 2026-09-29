import Link from 'next/link';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
    }} className="page-enter page-enter-active">
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'var(--accent-glow)',
        border: '2px solid var(--accent)',
        color: 'var(--accent)',
        fontSize: '3rem',
        marginBottom: '2rem',
        boxShadow: '0 0 30px var(--accent-glow)',
      }}>
        <FaExclamationTriangle />
      </div>

      <h1 style={{
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontWeight: 800,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-heading)',
        marginBottom: '0.5rem',
      }}>
        404
      </h1>

      <h2 style={{
        fontSize: '1.8rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: 'var(--text-muted)',
      }}>
        Page Not Found
      </h2>

      <p style={{
        color: 'var(--text-dim)',
        fontSize: '1.1rem',
        maxWidth: '500px',
        marginBottom: '2.5rem',
        lineHeight: 1.6,
      }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link href="/" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
        <FaHome style={{ marginRight: '8px' }} /> Return to Home
      </Link>
    </div>
  );
}
