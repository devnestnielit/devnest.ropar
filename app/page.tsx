'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';
import { collection, query, orderBy, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AnimatedCounter from '@/components/AnimatedCounter';
import EventCard from '@/components/EventCard';
import ProjectCard from '@/components/ProjectCard';
import { achievements } from '@/lib/data';
import Skeleton, { CardSkeleton } from '@/components/Skeleton';

const Typewriter = () => {
  const words = ['Build.', 'Learn.', 'Grow.', 'Code.'];
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 1500);
      return;
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 50 : 100, Math.random() * 150));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse]);

  return (
    <span style={{ color: 'var(--accent)' }}>
      {words[index].substring(0, subIndex)}
      <span className="typewriter-cursor"></span>
    </span>
  );
};

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ events: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Featured Events
        const eventsQ = query(collection(db, 'events'), orderBy('date', 'desc'), limit(3));
        const eventsSnap = await getDocs(eventsQ);
        setFeaturedEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Featured Projects
        const projectsQ = query(collection(db, 'projects'), limit(3));
        const projectsSnap = await getDocs(projectsQ);
        setFeaturedProjects(projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Stats (genuine counts only — member totals are never shown publicly)
        const eventsCount = await getCountFromServer(collection(db, 'events'));
        const projectsCount = await getCountFromServer(collection(db, 'projects'));

        setStats({
          events: eventsCount.data().count || 0,
          projects: projectsCount.data().count || 0
        });
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="page-enter page-enter-active">
      {/* Hero Section */}
      <section style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 20px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--accent-glow)', borderRadius: '20px', color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '32px' }}>
              NIELIT CODING CLUB
            </div>

            {/* BUG-11: Static heading rendered in HTML for SEO/SSR; Typewriter is progressive enhancement */}
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.1 }}>
              <span style={{ color: 'var(--text-primary)' }}>We </span>
              <noscript><span style={{ color: 'var(--accent)' }}>Build.</span></noscript>
              <span className="typewriter-wrapper" suppressHydrationWarning aria-hidden="true">
                <Typewriter />
              </span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
              Join the most vibrant community of developers, designers, and creators at NIELIT ROPAR.
              Turn your ideas into reality.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/member/apply" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                Join DevNest <FaArrowRight />
              </Link>
              <Link href="/events" className="btn-outline" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                Explore Events
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <AnimatedCounter value={stats.events} label="Events Hosted" />
            <AnimatedCounter value={stats.projects} label="Projects Built" />
            <AnimatedCounter value={3} label="Years Active" />
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section style={{ padding: '2rem 0', background: 'var(--accent-glow)' }}>
        <div className="marquee-container">
          <div className="marquee-content">
            {achievements.map((achievement, i) => (
              <span key={i} style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--accent)', fontSize: '1.25rem', padding: '0 2rem' }}>
                {achievement}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {achievements.map((achievement, i) => (
              <span key={'dup-' + i} style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--accent)', fontSize: '1.25rem', padding: '0 2rem' }}>
                {achievement}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container" style={{ padding: '6rem 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">Upcoming Events</h2>
            <p style={{ color: 'var(--text-muted)' }}>Don't miss out on what's happening next.</p>
          </div>
          <Link href="/events" className="btn-outline" style={{ padding: '8px 20px' }}>
            View All Events
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {loading ? (
            Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : featuredEvents.length > 0 ? (
            featuredEvents.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true, margin: '-50px' }}>
                <EventCard event={event} onClick={() => window.location.href = '/events'} />
              </motion.div>
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No events scheduled yet.</p>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      <section style={{ padding: '6rem 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title">Featured Projects</h2>
              <p style={{ color: 'var(--text-muted)' }}>Check out what our members are building.</p>
            </div>
            <Link href="/projects" className="btn-outline" style={{ padding: '8px 20px' }}>
              View All Projects
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {loading ? (
              Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
            ) : featuredProjects.length > 0 ? (
              featuredProjects.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true, margin: '-50px' }}>
                  <ProjectCard project={project} />
                </motion.div>
              ))
            ) : (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No projects showcased yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container" style={{ padding: '8rem 20px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{
            background: 'var(--bg-card)',
            padding: '4rem 2rem',
            borderRadius: '24px',
            border: '1px solid var(--accent)',
            boxShadow: '0 0 40px var(--accent-glow)'
          }}
        >
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Ready to <span className="gradient-text">level up?</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Whether you want to learn coding, build something awesome, or just hang out with tech enthusiasts, DevNest is the place for you.
          </p>
          <Link href="/contact" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
            Join The Club Today
          </Link>
        </motion.div>
      </section>
    </div>
  );
}