'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPlus, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { addProject, updateProject, deleteProject } from '@/lib/services';
import ProjectCard from '@/components/ProjectCard';
import Modal from '@/components/Modal';
import { CardSkeleton } from '@/components/Skeleton';
import { sampleProjects } from '@/lib/data';

export default function ProjectsPage() {
  const router = useRouter();
  // BUG-8: Seed with initial static data so SSR renders real cards instead of blank skeletons
  const [projects, setProjects] = useState<any[]>(sampleProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    githubLink: '',
    liveLink: '',
    image: '',
    contributors: ''
  });

  useEffect(() => {
    setIsAdmin(localStorage.getItem('devnest_admin') === 'true');

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });

    const q = query(collection(db, 'projects'), orderBy('title', 'asc'));
    const unsubscribeData = onSnapshot(q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const d = { id: doc.id, ...doc.data() } as any;
          // Strip private author email from client state (BUG-2 / BUG-14)
          delete d.submittedByEmail;
          return d;
        });
        setProjects(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to load projects. Please check your connection.");
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, []);

  const allTechnologies = useMemo(() => {
    const techs = new Set<string>();
    projects.forEach(p => p.techStack?.forEach((t: string) => techs.add(t)));
    return ['All', ...Array.from(techs).sort()];
  }, [projects]);

  const filteredProjects = projects.filter(project => {
    if (filter === 'All') return true;
    return project.techStack?.includes(filter);
  });

  // Gate the submit action behind member/admin login
  const handleSubmitClick = () => {
    console.log('Submit clicked. authChecked:', authChecked, 'currentUser:', currentUser);
    if (!authChecked) return;
    if (!currentUser) {
      router.push('/member/login?redirect=/projects');
      return;
    }
    handleOpenModal();
  };

  const handleOpenModal = (project: any = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        description: project.description || '',
        techStack: project.techStack?.join(', ') || '',
        githubLink: project.githubLink || '',
        liveLink: project.liveLink || '',
        image: project.image || '',
        contributors: project.contributors?.join(', ') || ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        techStack: '',
        githubLink: '',
        liveLink: '',
        image: '',
        contributors: currentUser?.displayName || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.description.length > 500) {
      toast.error('Description must be under 500 characters');
      return;
    }

    setFormLoading(true);
    const projectData = {
      ...formData,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
      contributors: formData.contributors.split(',').map(s => s.trim()).filter(Boolean),
      submittedByUid: currentUser?.uid || null,
      updatedAt: new Date().toISOString()
    };

    const res = editingProject
      ? await updateProject(editingProject.id, projectData)
      : await addProject({ ...projectData, createdAt: new Date().toISOString() });

    setFormLoading(false);
    if (!res.error) {
      toast.success(editingProject ? 'Project updated!' : 'Project added successfully!');
      setIsModalOpen(false);
    } else {
      toast.error(res.error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    const res = await deleteProject(id);
    if (!res.error) {
      toast.success('Project deleted');
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="container page-enter page-enter-active" style={{ padding: '4rem 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '1rem' }}>
          Explore <span className="gradient-text">Projects</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 2rem auto' }}>
          Discover the amazing products, tools, and experiments built by DevNest members.
        </p>
        <button
          className="btn-primary"
          style={{ fontSize: '1rem', padding: '12px 30px' }}
          onClick={handleSubmitClick}
        >
          <FaPlus /> Submit Your Project
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
          <div style={{ marginBottom: '3rem', position: 'relative' }}>
            <div style={{
              display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px',
              scrollbarWidth: 'thin', msOverflowStyle: 'none'
            }} className="no-scrollbar">
              {allTechnologies.map(tech => (
                <button
                  key={tech}
                  onClick={() => setFilter(tech)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: filter === tech ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: filter === tech ? 'var(--accent-glow)' : 'var(--bg-card)',
                    color: filter === tech ? 'var(--accent)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: filter === tech ? 600 : 400
                  }}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {loading ? (
              Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <ProjectCard
                    project={project}
                    onEdit={isAdmin ? () => handleOpenModal(project) : undefined}
                    onDelete={isAdmin ? () => handleDeleteProject(project.id) : undefined}
                  />
                </motion.div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                <p>No project uploaded yet.</p>
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "Submit Your Project"}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              required
              type="text"
              className="form-input"
              placeholder="e.g. Next.js Dashboard"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (max 500 chars) *</label>
            <textarea
              required
              className={`form-input ${formData.description.length >= 500 ? 'border-danger' : ''}`}
              placeholder="What does your project do?"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value.substring(0, 500) })}
            ></textarea>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              {formData.description.length >= 500 && (
                <small style={{ color: 'var(--danger)' }}>Max limit reached!</small>
              )}
              <small style={{ color: formData.description.length >= 500 ? 'var(--danger)' : 'var(--text-dim)', marginLeft: 'auto' }}>
                {formData.description.length}/500
              </small>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tech Stack (comma separated) *</label>
            <input
              required
              type="text"
              className="form-input"
              placeholder="React, Node.js, MongoDB"
              value={formData.techStack}
              onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/..."
                value={formData.githubLink}
                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Live Demo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={formData.liveLink}
                onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Thumbnail Image URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Team Members (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe, Jane Smith"
              value={formData.contributors}
              onChange={(e) => setFormData({ ...formData, contributors: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
            disabled={formLoading}
          >
            {formLoading ? 'Saving...' : (editingProject ? 'Update Project' : 'Submit Project')}
          </button>
        </form>
      </Modal>
    </div>
  );
}