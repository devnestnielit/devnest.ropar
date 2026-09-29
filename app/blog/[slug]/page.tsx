'use client';
import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { FaArrowLeft, FaClock, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';

// BUG-40 fix: escape all user-supplied HTML before injecting it into the DOM.
// The only markup we intentionally emit is <strong> from the **bold**
// substitution below; everything else must render as literal text.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderContent(content: string) {
  return content.split('\n\n').map((paragraph: string, i: number) => {
    if (paragraph.startsWith('## ')) {
      return <h2 key={i} style={{ fontSize: '1.8rem', marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>{paragraph.replace('## ', '')}</h2>;
    }
    if (paragraph.startsWith('### ')) {
      return <h3 key={i} style={{ fontSize: '1.4rem', marginTop: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{paragraph.replace('### ', '')}</h3>;
    }
    if (paragraph.startsWith('- ')) {
      const items = paragraph.split('\n').map(item => item.replace(/^- /, ''));
      return (
        <ul key={i} style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
        </ul>
      );
    }
    if (paragraph.match(/^\d+\. /)) {
      const items = paragraph.split('\n').map(item => item.replace(/^\d+\.\s/, ''));
      return (
        <ol key={i} style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          {items.map((item, j) => <li key={j} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
        </ol>
      );
    }
    if (paragraph.startsWith('```')) {
      const code = paragraph.split('\n').slice(1, -1).join('\n');
      return (
        <pre key={i} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', overflowX: 'auto', marginBottom: '1.5rem' }}>
          <code style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{code}</code>
        </pre>
      );
    }
    if (/\*\*(.*?)\*\*/.test(paragraph)) {
      // Escape first so attacker HTML (<script>, <img onerror=...>, <svg onload=...>)
      // can never survive; the **bold** markers are unaffected by escaping, and the
      // captured group then contains only escaped text, inserted verbatim.
      const safeHtml = escapeHtml(paragraph).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
    }
    return <p key={i} style={{ marginBottom: '1.5rem' }}>{paragraph}</p>;
  });
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminCheck = typeof window !== 'undefined' && localStorage.getItem('devnest_admin') === 'true';
    setIsAdmin(adminCheck);

    if (!slug) return;
    const fetchBlog = async () => {
      try {
        // BUG-47: visitors must constrain the query to approved articles so it
        // satisfies the blogs read rule ("rules are not filters"). Admins keep
        // the slug-only query for pending-article preview (allowed by the
        // isAdmin() rule branch via their Firebase Auth custom claim). Two
        // equality filters are merged from single-field indexes — no composite
        // index needed. A forged localStorage admin flag only yields a denied
        // query, never data.
        const q = adminCheck
          ? query(collection(db, 'blogs'), where('slug', '==', slug))
          : query(collection(db, 'blogs'), where('slug', '==', slug), where('status', '==', 'approved'));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setNotFoundState(true);
        } else {
          const docData: any = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          // Only show approved blogs to the public; admins can preview pending blogs
          if (docData.status !== 'approved' && !adminCheck) {
            setNotFoundState(true);
          } else {
            setBlog(docData);
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 20px', maxWidth: '800px' }}>
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '60px', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: '400px', marginBottom: '3rem', borderRadius: '16px' }} />
        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '20px', marginBottom: '12px' }} />)}
      </div>
    );
  }

  if (notFoundState || !blog) {
    return (
      <div className="container" style={{ padding: '8rem 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Article Not Available</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          This article doesn&apos;t exist, or is currently pending admin verification before becoming publicly visible.
        </p>
        <Link href="/blog" className="btn-primary">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="container page-enter page-enter-active" style={{ padding: '4rem 20px', maxWidth: '800px' }}>
      {blog.status !== 'approved' && isAdmin && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid #f59e0b',
          color: '#f59e0b',
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>
          ⚠️ Admin Preview: This article has not been approved yet and is hidden from public visitors.
        </div>
      )}

      <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '2rem', textDecoration: 'none', fontWeight: 500 }}>
        <FaArrowLeft /> Back to all articles
      </Link>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {blog.tags?.map((tag: string, i: number) => (
          <span key={i} className="badge badge-blue">{tag}</span>
        ))}
      </div>

      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
        {blog.title}
      </h1>

      <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.95rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaUserCircle /> {blog.author}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaCalendarAlt /> {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaClock /> {blog.readTime}</span>
      </div>

      {blog.thumbnail && (
        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem', border: '1px solid var(--border)' }}>
          <img
            src={blog.thumbnail}
            alt={blog.title}
            style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
        {blog.content ? renderContent(blog.content) : <p style={{ color: 'var(--text-muted)' }}>No content available.</p>}
      </div>

      <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--accent)', flexShrink: 0 }}>
          {(blog.author || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Written by {blog.author}</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Member of DevNest. Passionate about technology, coding, and sharing knowledge with the community.
          </p>
        </div>
      </div>
    </div>
  );
}
