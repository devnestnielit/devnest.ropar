'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { FaLock, FaUser } from 'react-icons/fa';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Force refresh token to verify admin custom claim
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      if (!tokenResult.claims.admin) {
        await signOut(auth);
        localStorage.removeItem('devnest_admin');
        toast.error('Access denied: You do not have administrator privileges.');
        return;
      }

      localStorage.setItem('devnest_admin', 'true');
      toast.success('Admin login successful!');
      router.push('/admin/dashboard');
    } catch (error: any) {
      localStorage.removeItem('devnest_admin');
      toast.error('Invalid credentials or access denied.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} className="page-enter page-enter-active">
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--bg-card)',
        padding: '3rem 2rem',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid var(--accent)', color: 'var(--accent)', fontSize: '2rem', marginBottom: '2rem', boxShadow: '0 0 20px var(--accent-glow)' }}>
          <FaLock />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Admin Access</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Restricted area. Authorized personnel only.</p>

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ position: 'relative' }}>
            <FaUser style={{ position: 'absolute', left: '16px', top: '42px', color: 'var(--text-muted)' }} />
            <label className="form-label">Email</label>
            <input
              required
              type="email"
              className="form-input"
              placeholder="admin@devnest.tech"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '45px' }}
            />
          </div>

          <div className="form-group" style={{ position: 'relative', marginBottom: '2rem' }}>
            <FaLock style={{ position: 'absolute', left: '16px', top: '42px', color: 'var(--text-muted)' }} />
            <label className="form-label">Password</label>
            <input
              required
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '45px' }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}