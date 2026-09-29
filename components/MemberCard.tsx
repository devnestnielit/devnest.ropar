'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaPencilAlt, FaTrash } from 'react-icons/fa';

interface MemberCardProps {
  member: any;
  small?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export default function MemberCard({ member, small = false, onEdit, onDelete }: MemberCardProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('devnest_admin') === 'true');
  }, []);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: small ? '16px' : '24px',
        border: '1px solid var(--border)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        position: 'relative'
      }}
      className="card hover-glow"
    >
      {isAdmin && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px', 
            display: 'flex', 
            gap: '8px', 
            zIndex: 10 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onEdit} 
            style={{ padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer' }}
            title="Edit Member"
          >
            <FaPencilAlt size={12} />
          </button>
          <button 
            onClick={onDelete} 
            style={{ padding: '6px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', cursor: 'pointer' }}
            title="Delete Member"
          >
            <FaTrash size={12} />
          </button>
        </div>
      )}
      <div style={{
        width: small ? '80px' : '120px',
        height: small ? '80px' : '120px',
        borderRadius: '50%',
        background: 'var(--border-light)',
        marginBottom: '16px',
        overflow: 'hidden',
        border: '3px solid var(--bg-primary)'
      }}>
         <img 
          src={member.image || '/placeholder-avatar.png'} 
          alt={member.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="20" text-anchor="middle" alignment-baseline="middle">' + member.name.charAt(0) + '</text></svg>';
          }}
        />
      </div>
      
      <h3 style={{ fontSize: small ? '1.1rem' : '1.25rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{member.name}</h3>
      {member.role && (
        <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>{member.role}</span>
      )}
      
      {!small && member.bio && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', flexGrow: 1 }}>{member.bio}</p>
      )}
      
      <div style={{ display: 'flex', gap: '12px', marginTop: small ? '8px' : 'auto' }}>
        {member.github && (
          <a href={member.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'color 0.2s' }}>
            <FaGithub className="hover:text-accent" />
          </a>
        )}
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', transition: 'color 0.2s' }}>
            <FaLinkedin className="hover:text-accent" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
