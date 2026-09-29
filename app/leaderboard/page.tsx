'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaExclamationTriangle, FaSync, FaBolt } from 'react-icons/fa';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Skeleton from '@/components/Skeleton';

function Avatar({ src, name, size = 44 }: { src?: string; name: string; size?: number }) {
  const initial = (name || '?').charAt(0).toUpperCase();
  const fallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2300ff88" x="50" y="54" font-family="sans-serif" font-size="44" font-weight="bold" text-anchor="middle" alignment-baseline="middle">${initial}</text></svg>`;
  return (
    <img
      src={src || fallback}
      alt={name}
      onError={(e) => { (e.target as HTMLImageElement).src = fallback; }}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function LeaderboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    // Real-time listener on memberProfiles collection for live points and dynamic rank updates
    const unsubscribe = onSnapshot(collection(db, 'memberProfiles'),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Include profiles with points or profile data
        const activeMembers = items.filter((m: any) => m.status === 'approved' || typeof m.currentMonthPoints === 'number' || m.name);

        // Sort descending by currentMonthPoints, tie-break with totalPoints, then name
        const sorted = activeMembers.sort((a: any, b: any) => {
          const pointsA = Number(a.currentMonthPoints) || 0;
          const pointsB = Number(b.currentMonthPoints) || 0;
          if (pointsB !== pointsA) return pointsB - pointsA;

          const totalA = Number(a.totalPoints) || 0;
          const totalB = Number(b.totalPoints) || 0;
          if (totalB !== totalA) return totalB - totalA;

          return (a.name || '').localeCompare(b.name || '');
        });

        setData(sorted);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error on leaderboard:", err);
        setError("Failed to load leaderboard. Please check your connection.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
            color: '#1e1b4b',
            fontWeight: 800,
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 14px rgba(255, 215, 0, 0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <FaTrophy style={{ color: '#78350f' }} /> First
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span
          style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
            color: '#0f172a',
            fontWeight: 800,
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 14px rgba(148, 163, 184, 0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <FaMedal style={{ color: '#334155' }} /> Second
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span
          style={{
            background: 'linear-gradient(135deg, #fb923c 0%, #b45309 100%)',
            color: '#ffffff',
            fontWeight: 800,
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 14px rgba(205, 127, 50, 0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          <FaMedal style={{ color: '#fef3c7' }} /> Third
        </span>
      );
    }
    return (
      <span
        style={{
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)'
        }}
      >
        #{rank}
      </span>
    );
  };

  const getRowStyle = (rank: number) => {
    if (rank === 1) {
      return {
        background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 215, 0, 0.02) 100%)',
        borderLeft: '4px solid #ffd700'
      };
    }
    if (rank === 2) {
      return {
        background: 'linear-gradient(90deg, rgba(148, 163, 184, 0.12) 0%, rgba(148, 163, 184, 0.02) 100%)',
        borderLeft: '4px solid #94a3b8'
      };
    }
    if (rank === 3) {
      return {
        background: 'linear-gradient(90deg, rgba(205, 127, 50, 0.12) 0%, rgba(205, 127, 50, 0.02) 100%)',
        borderLeft: '4px solid #cd7f32'
      };
    }
    return {
      borderBottom: '1px solid var(--border-light)'
    };
  };

  const top1 = data[0];
  const top2 = data[1];
  const top3 = data[2];

  return (
    <div className="container page-enter page-enter-active" style={{ padding: '4rem 20px', maxWidth: '1080px' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          padding: '6px 16px',
          borderRadius: 20,
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: 16
        }}>
          <FaBolt /> Live Standings • Real-time Rank Updates
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '1rem' }}>
          Monthly <span className="gradient-text">Leaderboard</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '720px', margin: '0 auto 1.2rem auto' }}>
          Rankings for <strong>{currentMonthName}</strong> based on points earned from intra-college hackathons, coding contests, and club events.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '3rem', color: 'var(--danger)' }}>
          <FaExclamationTriangle style={{ fontSize: '2rem', marginBottom: '12px' }} />
          <p style={{ marginBottom: '16px' }}>{error}</p>
          <button className="btn-outline" onClick={() => window.location.reload()} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            <FaSync /> Retry
          </button>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {!loading && !error && data.length >= 3 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: '3rem',
            alignItems: 'flex-end'
          }}
        >
          {/* 2nd Place */}
          {top2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.15) 0%, var(--bg-card) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.4)',
                borderRadius: 24,
                padding: '24px 20px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ marginBottom: 12 }}>
                {getRankBadge(2)}
              </div>
              <div style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                margin: '0 auto 12px',
                border: '3px solid #94a3b8',
                boxShadow: '0 0 20px rgba(148, 163, 184, 0.35)',
                overflow: 'hidden'
              }}>
                <Avatar src={top2.image} name={top2.name} size={76} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>{top2.name}</h3>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.85rem', marginBottom: 12, fontWeight: 600 }}>
                {top2.registrationNumber ? `Reg: ${top2.registrationNumber}` : '—'}
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '10px 16px', display: 'inline-block', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Points This Month</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                  {(top2.currentMonthPoints ?? 0).toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>XP</span>
                </span>
              </div>
            </motion.div>
          )}

          {/* 1st Place (Center / Highlighted) */}
          {top1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              style={{
                background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.18) 0%, var(--bg-card) 100%)',
                border: '2px solid rgba(255, 215, 0, 0.6)',
                borderRadius: 24,
                padding: '32px 20px 24px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 15px 40px rgba(255, 215, 0, 0.2)'
              }}
            >
              <div style={{ marginBottom: 14 }}>
                {getRankBadge(1)}
              </div>
              <div style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                margin: '0 auto 14px',
                border: '4px solid #ffd700',
                boxShadow: '0 0 25px rgba(255, 215, 0, 0.5)',
                overflow: 'hidden'
              }}>
                <Avatar src={top1.image} name={top1.name} size={90} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>{top1.name}</h3>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.9rem', marginBottom: 14, fontWeight: 600 }}>
                {top1.registrationNumber ? `Reg: ${top1.registrationNumber}` : '—'}
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '12px 20px', display: 'inline-block', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                <span style={{ fontSize: '0.8rem', color: '#ffd700', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>🏆 Monthly Champion</span>
                <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                  {(top1.currentMonthPoints ?? 0).toLocaleString()} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>XP</span>
                </span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                background: 'linear-gradient(180deg, rgba(205, 127, 50, 0.15) 0%, var(--bg-card) 100%)',
                border: '1px solid rgba(205, 127, 50, 0.4)',
                borderRadius: 24,
                padding: '24px 20px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ marginBottom: 12 }}>
                {getRankBadge(3)}
              </div>
              <div style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                margin: '0 auto 12px',
                border: '3px solid #cd7f32',
                boxShadow: '0 0 20px rgba(205, 127, 50, 0.35)',
                overflow: 'hidden'
              }}>
                <Avatar src={top3.image} name={top3.name} size={76} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 4 }}>{top3.name}</h3>
              <div style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.85rem', marginBottom: 12, fontWeight: 600 }}>
                {top3.registrationNumber ? `Reg: ${top3.registrationNumber}` : '—'}
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '10px 16px', display: 'inline-block', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Points This Month</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                  {(top3.currentMonthPoints ?? 0).toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>XP</span>
                </span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Main Leaderboard Table */}
      {!error && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary)', borderBottom: '2px solid var(--border)', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                  <th style={{ padding: '20px', width: '130px', textAlign: 'center' }}>Rank</th>
                  <th style={{ padding: '20px' }}>Name</th>
                  <th style={{ padding: '20px' }}>Registration Number</th>
                  <th style={{ padding: '20px', textAlign: 'right', color: 'var(--accent)' }}>Points ({currentMonthName.split(' ')[0]})</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '20px', textAlign: 'center' }}><Skeleton height="24px" width="70px" /></td>
                      <td style={{ padding: '20px' }}><Skeleton height="24px" width="180px" /></td>
                      <td style={{ padding: '20px' }}><Skeleton height="24px" width="120px" /></td>
                      <td style={{ padding: '20px', textAlign: 'right' }}><Skeleton height="24px" width="90px" /></td>
                    </tr>
                  ))
                ) : data.length > 0 ? (
                  data.map((member, i) => {
                    const rank = i + 1;
                    return (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          ...getRowStyle(rank),
                          transition: 'background 0.2s',
                          position: 'relative'
                        }}
                      >
                        <td style={{ padding: '20px', textAlign: 'center' }}>
                          {getRankBadge(rank)}
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: rank === 1 ? '2px solid #ffd700' : rank === 2 ? '2px solid #94a3b8' : rank === 3 ? '2px solid #cd7f32' : '1px solid var(--border)'
                            }}>
                              <Avatar src={member.image} name={member.name} size={44} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                                {member.name}
                              </div>
                              {member.email && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                                  {member.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: 'var(--accent)',
                              background: 'var(--bg-secondary)',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              border: '1px solid var(--border-light)'
                            }}
                          >
                            {member.registrationNumber || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right' }}>
                          <span style={{
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            fontSize: '1.3rem',
                            color: 'var(--accent)',
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: '4px'
                          }}>
                            {(member.currentMonthPoints ?? 0).toLocaleString()}
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>XP</span>
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</div>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No Members Ranked Yet</h3>
                      <p>Members will appear on the leaderboard as soon as they earn points in events.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
