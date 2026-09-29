'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(10, 15, 30, 0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image 
              src="/devnest-logo.png" 
              alt="DevNest" 
              width={32} 
              height={32} 
              style={{ borderRadius: '6px' }}
            />
            <span style={{
              fontFamily: 'var(--font-heading)', 
              fontWeight: 800, 
              fontSize: '1.25rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              DevNest
            </span>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
          <Image 
            src="/nielit-logo.png" 
            alt="NIELIT" 
            width={60} 
            height={28} 
            style={{ objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop Nav */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
        }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: '0.875rem',
              fontWeight: 500, transition: 'all 0.2s',
              color: pathname === link.href ? 'var(--accent)' : 'var(--text-muted)',
              background: pathname === link.href ? 'var(--accent-glow)' : 'transparent',
            }}>
              {link.label}
            </Link>
          ))}
          {currentUser ? (
            <Link href="/member/dashboard" style={{
              marginLeft: 12, padding: '8px 20px', borderRadius: 8,
              fontSize: '0.8rem', fontFamily: 'var(--font-heading)',
              fontWeight: 600, color: 'var(--bg-primary)',
              background: 'var(--accent)', letterSpacing: '0.5px',
              transition: 'all 0.3s',
            }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/member/login" style={{
                marginLeft: 12, padding: '8px 20px', borderRadius: 8,
                fontSize: '0.8rem', fontFamily: 'var(--font-heading)',
                fontWeight: 600, color: 'var(--accent)',
                border: '1px solid var(--accent)', letterSpacing: '0.5px',
                transition: 'all 0.3s',
              }}>
                Login
              </Link>
              {/* BUG-21: Admin link only shown when not logged in, as a subtle link */}
              <Link href="/admin" style={{
                marginLeft: 8, padding: '8px 16px', borderRadius: 8,
                fontSize: '0.75rem', fontFamily: 'var(--font-heading)',
                fontWeight: 600, color: 'var(--text-dim)',
                border: '1px solid var(--border)', letterSpacing: '0.5px',
                transition: 'all 0.3s',
              }}>
                Admin
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="mobile-toggle" style={{
          display: 'none', background: 'none', border: 'none',
          color: 'var(--text-primary)', fontSize: '1.75rem', cursor: 'pointer',
        }}>
          {isOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(10, 15, 30, 0.98)', backdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--border)', overflow: 'hidden',
            }}
            className="mobile-menu"
          >
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{
                  padding: '12px 16px', borderRadius: 10, fontSize: '1rem',
                  fontWeight: 500, transition: 'all 0.2s',
                  color: pathname === link.href ? 'var(--accent)' : 'var(--text-muted)',
                  background: pathname === link.href ? 'var(--accent-glow)' : 'transparent',
                }}>
                  {link.label}
                </Link>
              ))}
              {currentUser ? (
                <Link href="/member/dashboard" style={{
                  marginTop: 8, padding: '12px 20px', borderRadius: 10,
                  textAlign: 'center', fontFamily: 'var(--font-heading)',
                  fontWeight: 600, color: 'var(--bg-primary)',
                  background: 'var(--accent)', fontSize: '0.875rem',
                }}>
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/member/apply" style={{
                    marginTop: 8, padding: '12px 20px', borderRadius: 10,
                    textAlign: 'center', fontFamily: 'var(--font-heading)',
                    fontWeight: 600, color: 'var(--bg-primary)',
                    background: 'var(--accent)', fontSize: '0.875rem',
                  }}>
                    Join DevNest
                  </Link>
                  <Link href="/member/login" style={{
                    marginTop: 6, padding: '12px 20px', borderRadius: 10,
                    textAlign: 'center', fontFamily: 'var(--font-heading)',
                    fontWeight: 600, color: 'var(--accent)',
                    border: '1px solid var(--accent)', fontSize: '0.875rem',
                  }}>
                    Member Login
                  </Link>
                  <Link href="/admin" style={{
                    marginTop: 4, padding: '10px 20px', borderRadius: 10,
                    textAlign: 'center', fontFamily: 'var(--font-heading)',
                    fontWeight: 600, color: 'var(--text-dim)',
                    border: '1px solid var(--border)', fontSize: '0.8rem',
                  }}>
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
