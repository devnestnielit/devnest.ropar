'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaPencilAlt, FaTrash } from 'react-icons/fa';

interface EventCardProps {
  event: any;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export default function EventCard({ event, onClick, onEdit, onDelete }: EventCardProps) {
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
        overflow: 'hidden',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}
      onClick={onClick}
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
            style={{ padding: '8px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer' }}
            title="Edit Event"
          >
            <FaPencilAlt size={14} />
          </button>
          <button 
            onClick={onDelete} 
            style={{ padding: '8px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', cursor: 'pointer' }}
            title="Delete Event"
          >
            <FaTrash size={14} />
          </button>
        </div>
      )}
      <div style={{ height: '160px', background: 'var(--border-light)', overflow: 'hidden' }}>
        <img 
          src={event.image || '/placeholder-event.jpg'} 
          alt={event.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="10" text-anchor="middle" alignment-baseline="middle">Event Image</text></svg>';
          }}
        />
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {event.type && <span className="badge badge-green">{event.type}</span>}
            {event.mode && <span className="badge badge-yellow">{event.mode}</span>}
          </div>
          {event.status === 'upcoming' && <span className="badge badge-blue">Upcoming</span>}
          {(event.status === 'live' || event.status === 'ongoing') && <span className="badge badge-accent">🔴 Live</span>}
          {(event.status === 'completed' || event.status === 'past') && <span className="badge badge-muted">Completed</span>}
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text-primary)' }}>{event.title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCalendarAlt style={{ color: 'var(--accent)' }} /> <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMapMarkerAlt style={{ color: 'var(--accent)' }} /> <span>{event.venue}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
