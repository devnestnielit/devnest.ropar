'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaUserCircle, FaPencilAlt, FaTrash } from 'react-icons/fa';

interface ProjectCardProps {
  project: any;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
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
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
      className="card hover-glow"
    >
      {project.status === 'pending' && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '12px', 
            background: 'rgba(250, 204, 21, 0.92)', 
            color: '#000', 
            fontWeight: 700, 
            fontSize: '0.72rem', 
            padding: '4px 10px', 
            borderRadius: '20px', 
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ⏳ Pending Verification
        </div>
      )}
      {project.status === 'rejected' && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '12px', 
            background: 'rgba(239, 68, 68, 0.92)', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: '0.72rem', 
            padding: '4px 10px', 
            borderRadius: '20px', 
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          ✕ Rejected
        </div>
      )}
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
            title="Edit Project"
          >
            <FaPencilAlt size={14} />
          </button>
          <button 
            onClick={onDelete} 
            style={{ padding: '8px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', cursor: 'pointer' }}
            title="Delete Project"
          >
            <FaTrash size={14} />
          </button>
        </div>
      )}
      <div style={{ height: '180px', background: 'var(--border-light)', overflow: 'hidden' }}>
         <img 
          src={project.image || '/placeholder-project.jpg'} 
          alt={project.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="10" text-anchor="middle" alignment-baseline="middle">Project Image</text></svg>';
          }}
        />
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--text-primary)' }}>{project.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', flexGrow: 1 }}>{project.description}</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
          {project.techStack?.map((tech: string, i: number) => (
            <span key={i} className="badge" style={{ background: 'var(--border)', color: 'var(--text-dim)', fontSize: '0.7rem' }}>
              {tech}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s', fontSize: '1.25rem' }}>
                <FaGithub className="hover:text-accent" />
              </a>
            )}
            {project.liveLink && (
              <a href={project.liveLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s', fontSize: '1.25rem' }}>
                <FaExternalLinkAlt className="hover:text-accent" />
              </a>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            <FaUserCircle /> <span>{project.contributors?.length || 0} Contributors</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
