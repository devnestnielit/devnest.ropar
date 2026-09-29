'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function MemberLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const tokenResult = await cred.user.getIdTokenResult();
            if (tokenResult.claims.admin) {
                localStorage.setItem('devnest_admin', 'true');
            } else {
                localStorage.removeItem('devnest_admin');
            }
            toast.success('Logged in successfully!');
            const rawRedirect = searchParams.get('redirect');
            let targetRedirect = '/member/dashboard';
            if (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.includes('://')) {
                targetRedirect = rawRedirect;
            }
            router.push(targetRedirect);
        } catch (err: any) {
            toast.error('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container page-enter page-enter-active" style={{ padding: '6rem 20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '420px', width: '100%', background: 'var(--bg-card)', borderRadius: '24px', padding: '2.5rem', border: '1px solid var(--border)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
                    Member <span className="gradient-text">Login</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    Sign in to manage your DevNest profile.
                </p>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                            required
                            type="email"
                            className="form-input"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label">Password *</label>
                        <input
                            required
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    );
}