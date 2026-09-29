'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

interface BlogCardProps {
  blog: any;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export default function BlogCard({ blog, onEdit, onDelete }: BlogCardProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('devnest_admin') === 'true');
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
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
          onClick={(e) => e.preventDefault()}
        >
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(e); }} 
            style={{ padding: '8px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer' }}
            title="Edit Post"
          >
            <FaPencilAlt size={14} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(e); }} 
            style={{ padding: '8px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', cursor: 'pointer' }}
            title="Delete Post"
          >
            <FaTrash size={14} />
          </button>
        </div>
      )}
      <Link href={`/blog/${blog.slug}`} style={{ display: 'block', height: '100%' }}>
        <motion.div
          whileHover={{ y: -5 }}
          style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
          className="card hover-glow"
        >
          <div style={{ height: '200px', background: 'var(--border-light)', overflow: 'hidden' }}>
             <img 
              src={blog.thumbnail || '/placeholder-blog.jpg'} 
              alt={blog.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="10" text-anchor="middle" alignment-baseline="middle">Blog Image</text></svg>';
              }}
            />
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {blog.tags?.map((tag: string, i: number) => (
                <span key={i} className="badge badge-blue">
                  {tag}
                </span>
              ))}
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--text-primary)' }}>{blog.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', flexGrow: 1 }}>
              {blog.excerpt?.substring(0, 100)}...
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>By {blog.author}</span>
              <span>{blog.readTime}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
