'use client';
import { motion } from 'framer-motion';
import { FaCode, FaLightbulb, FaUsers, FaRocket, FaGraduationCap } from 'react-icons/fa';

export default function AboutPage() {
  const milestones = [
    { year: '2024', title: 'The Beginning', desc: 'DevNest was founded by a small group of passionate students looking to create a space for tech enthusiasts at NIELIT Ropar.' },
    // { year: '2024', title: 'First Hackathon', desc: 'Hosted our first intra-college hackathon, bringing together early members and marking our presence on campus.' },
    { year: '2025', title: 'Open Source Initiative', desc: 'Launched an open source initiative to introduce members to collaborative development and contribution workflows.' },
    { year: '2025', title: 'Intra College Hackathon', desc: 'A campus-wide innovation challenge where participants were given problem statements in advance and had to design and present working solutions. The event focused on structured problem-solving, encouraging teams to move from concept to a demonstrable prototype within a fixed timeframe.' },
    { year: '2026', title: 'Growing Community', desc: 'Expanded to over 30 active members, with regular events, project collaborations, and a growing presence on campus.' }
  ];

  return (
    <div className="container page-enter page-enter-active" style={{ padding: '4rem 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '1rem' }}>
          About <span className="gradient-text">DevNest</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
          The premier coding club of NIELIT ROPAR, dedicated to fostering a culture of innovation, learning, and building.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginBottom: '6rem', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="section-title">Our Story</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            DevNest began as a small student initiative at NIELIT Ropar, formed to bridge the gap between classroom learning and practical, real-world technical skills. Today, it has grown into one of the active technical communities at the institute, comprising over 30 active members and expanding steadily.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            The club organizes workshops, hackathons, and coding contests centered on the belief that programming is not merely about syntax, but about problem-solving and building tools that create tangible impact.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, fontSize: '15rem', color: 'var(--accent-glow)', opacity: 0.1 }}><FaCode /></div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Mission Statement</h2>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
            "To democratize technology education on campus by providing students with the environment, mentorship, and resources needed to transform them from consumers of technology into creators of it."
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <FaGraduationCap style={{ fontSize: '2rem', color: 'var(--info)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Officially Affiliated</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NIELIT Coding Society</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ marginBottom: '6rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center', display: 'block', margin: '0 auto 3rem auto' }}>Our Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {[
            { icon: <FaCode />, title: 'Learn by Doing', desc: 'Theory is good, but building is better. We focus on project-based learning.' },
            { icon: <FaUsers />, title: 'Community First', desc: 'We grow together. Mentorship and collaboration are at the core of what we do.' },
            { icon: <FaLightbulb />, title: 'Innovation', desc: 'Encouraging out-of-the-box thinking and exploring bleeding-edge technologies.' },
            { icon: <FaRocket />, title: 'Open Source', desc: 'We strongly believe in open source culture and contributing back to the ecosystem.' }
          ].map((val, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '1.5rem' }}>{val.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{val.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '6rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center', display: 'block', margin: '0 auto 3rem auto' }}>Journey So Far</h2>
        <div style={{ position: 'relative', padding: '2rem 0' }}>
          {/* Vertical Line */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', background: 'var(--border-light)', transform: 'translateX(-50%)' }}></div>

          {milestones.map((ms, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', padding: '2rem 0', position: 'relative', width: '100%' }}>
              <div style={{ width: '45%', textAlign: i % 2 === 0 ? 'right' : 'left', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '20px', [i % 2 === 0 ? 'right' : 'left']: '-calc(11.1% + 14px)',
                  width: '16px', height: '16px', background: 'var(--accent)', borderRadius: '50%',
                  boxShadow: '0 0 10px var(--accent-glow)'
                }}></div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {ms.title} <span className="badge badge-green" style={{ marginLeft: i % 2 !== 0 ? '8px' : 0, marginRight: i % 2 === 0 ? '8px' : 0 }}>{ms.year}</span>
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>{ms.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="section-title" style={{ textAlign: 'center', display: 'block', margin: '0 auto 3rem auto' }}>Faculty Advisor</h2>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
            <img
              src="/team/sarwan-singh.jpg"
              alt="Dr. Sarwan Singh - Faculty Advisor"
              width={150}
              height={150}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍🏫</text></svg>';
              }}
            />
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Dr. Sarwan Singh</h3>
            <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Joint Director at NIELIT, Chandigarh</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              &quot;DevNest represents the true spirit of engineering at NIELIT. The dedication of these students to learn beyond the curriculum and help their peers is truly commendable. They have my full support.&quot;
            </p>
          </div>
        </motion.div>
      </div>

      <div style={{ marginTop: '5rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center', display: 'block', margin: '0 auto 3rem auto' }}>Core Members</h2>

        {/* Current Members */}
        <h3 style={{ textAlign: 'center', color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Current</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="/team/naman-singla.jpg"
                alt="Naman Singla - Club Lead &amp; Full Stack Architect"
                width={150}
                height={150}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍💻</text></svg>';
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Naman Singla</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Club Lead &amp; Full Stack Architect</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                &quot;Building collaborative spaces where developers turn ambitious ideas into production-ready software.&quot;
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="/team/sohit-narayan.jpg"
                alt="Sohit Narayan - Technical Lead & Systems Architect"
                width={150}
                height={150}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  // BUG-4: prefer the self-hosted photo; fall back to the (expiring)
                  // LinkedIn CDN URL until the local file is added, then to the avatar.
                  // Owner: save Sohit's photo as public/team/sohit-narayan.jpg.
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.fbk) {
                    img.dataset.fbk = '1';
                    img.src = 'https://media.licdn.com/dms/image/v2/D4D03AQGh1HFWcG6BRQ/profile-displayphoto-crop_800_800/B4DZ9ZslHwIIAM-/0/1783916287207?e=1791417600&v=beta&t=8eeXjId39uhUX96lNysFJB7rUMuT9Ed0H9fkR4u3_t0';
                  } else {
                    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍💻</text></svg>';
                  }
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Sohit Narayan</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Technical Lead &amp; Systems Architect</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                &quot;Empowering student developers to master modern frameworks, scalable systems, and cloud engineering.&quot;
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="/team/nikhil-gupta.jpg"
                alt="Nikhil Gupta - Frontend Lead &amp; UI/UX Specialist"
                width={150}
                height={150}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍💻</text></svg>';
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Nikhil Gupta</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Frontend Lead &amp; UI/UX Specialist</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                &quot;Designing fluid, intuitive, and accessible interfaces that bring interactive club projects to life.&quot;
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="/team/harsh-saini.jpg"
                alt="Harsh Saini - Competitive Programming Lead"
                width={150}
                height={150}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍💻</text></svg>';
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Harsh Saini</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Competitive Programming Lead</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                &quot;Sharpening algorithmic intuition, data structures, and competitive problem-solving skills.&quot;
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="/team/arghadeep-das.jpg"
                alt="Arghadeep Das - Open Source &amp; Community Coordinator"
                width={150}
                height={150}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍💻</text></svg>';
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Arghadeep Das</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Open Source &amp; Community Coordinator</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                &quot;Fostering welcoming open-source initiatives, community workshops, and cross-team hackathons.&quot;
              </p>
            </div>
          </motion.div>

        </div>

        {/* Past Members */}
        <h3 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>Past</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="/team/prakhar-mishra.jpg"
                alt="Prakhar Mishra - Former Club Lead"
                width={150}
                height={150}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍💻</text></svg>';
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Prakhar Mishra</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Former Club Lead</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                &quot;Pioneered DevNest foundational initiatives, establishing early peer workshops and technical meetups.&quot;
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="/team/aditya-singh.jpg"
                alt="Aditya Singh - Former Technical Lead"
                width={150}
                height={150}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍💻</text></svg>';
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Aditya Singh</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Former Technical Lead</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                &quot;Mentored students in backend architecture, database fundamentals, and scalable development.&quot;
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'var(--border-light)', overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
              <img
                src="/team/kartik-vats.jpg"
                alt="Kartik Vats - Former Operations Lead"
                width={150}
                height={150}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text fill="%2394a3b8" x="50" y="50" font-family="sans-serif" font-size="40" text-anchor="middle" alignment-baseline="middle">👨‍💻</text></svg>';
                }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Kartik Vats</h3>
              <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Former Operations Lead</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                &quot;Guided student hackathon teams from initial brainstorming to polished presentation demos.&quot;
              </p>
            </div>
          </motion.div>

        </div>
      </div>

    </div>
  );
}
