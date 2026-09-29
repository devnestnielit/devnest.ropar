'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaPlus, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { addBlog, updateBlog, deleteBlog } from '@/lib/services';
import BlogCard from '@/components/BlogCard';
import Modal from '@/components/Modal';
import { CardSkeleton } from '@/components/Skeleton';

export default function BlogPage() {
  // BUG-8: Seed with initial static data so SSR renders real articles instead of blank skeletons
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    readTime: '',
    thumbnail: '',
    excerpt: '',
    content: ''
  });

  useEffect(() => {
    setIsAdmin(localStorage.getItem('devnest_admin') === 'true');
    // BUG-39: the query must carry the status filter — Firestore evaluates
    // authorization against the query's filters ("rules are not filters"), so an
    // unconstrained listen can never satisfy the blogs read rule for visitors.
    // Single-equality filter: no composite index needed. In-memory sort below
    // is preserved.
    const blogsQuery = query(collection(db, 'blogs'), where('status', '==', 'approved'));
    const unsubscribe = onSnapshot(blogsQuery,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        items.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        setBlogs(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load articles. Please check your connection.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Approved blogs (or legacy seeded blogs without status) are eligible for public display
  const approvedBlogs = useMemo(() => blogs.filter(b => b.status === 'approved' || !b.status), [blogs]);


  const allTags = useMemo(() => {
    const tags = new Set<string>();
    approvedBlogs.forEach(b => b.tags?.forEach((t: string) => tags.add(t)));
    return ['All', ...Array.from(tags).sort()];
  }, [approvedBlogs]);

  const filteredBlogs = approvedBlogs.filter(blog => {
    const title = blog.title || '';
    const excerpt = blog.excerpt || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filter === 'All' ? true : blog.tags?.includes(filter);

    return matchesSearch && matchesTag;
  });

  const handleOpenModal = (blog: any = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        author: blog.author || '',
        date: blog.date || new Date().toISOString().split('T')[0],
        tags: blog.tags?.join(', ') || '',
        readTime: blog.readTime || '',
        thumbnail: blog.thumbnail || '',
        excerpt: blog.excerpt || '',
        content: blog.content || ''
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        author: '',
        date: new Date().toISOString().split('T')[0],
        tags: '',
        readTime: '',
        thumbnail: '',
        excerpt: '',
        content: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.excerpt.length > 500) {
      toast.error('Excerpt must be under 500 characters');
      return;
    }

    setFormLoading(true);
    const blogData = {
      ...formData,
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      updatedAt: new Date().toISOString()
    };

    // Editing an existing post preserves its current status (admin edits stay approved,
    // a resubmitted pending post stays pending until reviewed).
    // A brand-new submission always starts as pending, regardless of who submits it.
    const res = editingBlog
      ? await updateBlog(editingBlog.id, blogData)
      : await addBlog({ ...blogData, status: 'pending', createdAt: new Date().toISOString() });

    setFormLoading(false);
    if (!res.error) {
      toast.success(editingBlog ? 'Article updated!' : 'Article submitted for review. It will appear once approved.');
      setIsModalOpen(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    const res = await deleteBlog(id);
    if (!res.error) {
      toast.success('Article deleted');
    } else {
      toast.error(res.error);
    }
  };



  return (
    <div className="container page-enter page-enter-active" style={{ padding: '4rem 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '1rem' }}>
          DevNest <span className="gradient-text">Blog</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 2rem auto' }}>
          Technical tutorials, interview experiences, and insights from our community members.
        </p>
        <button
          className="btn-primary"
          style={{ fontSize: '1rem', padding: '12px 30px' }}
          onClick={() => handleOpenModal()}
        >
          <FaPlus /> Write Article
        </button>
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

      {!error && (
        <>
          <div style={{ maxWidth: '800px', margin: '0 auto 3rem auto' }}>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search articles..."
                className="form-input"
                style={{ paddingLeft: '48px', height: '54px', fontSize: '1.1rem', borderRadius: '12px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilter(tag)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: filter === tag ? '1px solid var(--accent)' : '1px solid transparent',
                    background: filter === tag ? 'var(--accent-glow)' : 'var(--bg-card)',
                    color: filter === tag ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem'
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {loading ? (
              Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
            ) : filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <motion.div key={blog.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <BlogCard
                    blog={blog}
                    onEdit={isAdmin ? () => handleOpenModal(blog) : undefined}
                    onDelete={isAdmin ? () => handleDeleteBlog(blog.id) : undefined}
                  />
                </motion.div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                <p>No articles found matching your criteria.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBlog ? "Edit Article" : "Submit an Article"}
      >
        <form onSubmit={handleFormSubmit}>
          {!editingBlog && (
            <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--accent)' }}>
              Submitted articles are reviewed by an admin before becoming publicly visible.
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              required
              type="text"
              className="form-input"
              placeholder="e.g. Mastering React Hooks"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Author Name *</label>
              <input
                required
                type="text"
                className="form-input"
                placeholder="Your Name"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                required
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Tags (comma separated) *</label>
              <input
                required
                type="text"
                className="form-input"
                placeholder="Web Dev, Tutorial"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Read Time *</label>
              <input
                required
                type="text"
                className="form-input"
                placeholder="5 min read"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://..."
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Excerpt (max 500 chars) *</label>
            <textarea
              required
              className="form-input"
              placeholder="Short summary of the article..."
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value.substring(0, 500) })}
            ></textarea>
            <small style={{ color: 'var(--text-dim)', textAlign: 'right', display: 'block' }}>
              {formData.excerpt.length}/500
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Content (Markdown supported) *</label>
            <textarea
              required
              className="form-input"
              placeholder="Write your article here..."
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Slug (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="mastering-react-hooks"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
            disabled={formLoading}
          >
            {formLoading ? 'Submitting...' : (editingBlog ? 'Update Article' : 'Submit for Review')}
          </button>
        </form>
      </Modal>
    </div>
  );
}