import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { sampleEvents, sampleProjects, sampleBlogs, sampleMembers, leaderboardData } from './data';

export const seedFirestore = async () => {
  try {
    console.log('Starting seeding...');

    // 1. Seed Events
    const eventsCol = collection(db, 'events');
    for (const event of sampleEvents) {
      await addDoc(eventsCol, event);
    }
    console.log('Events seeded.');

    // 2. Seed Projects
    const projectsCol = collection(db, 'projects');
    for (const project of sampleProjects) {
      await addDoc(projectsCol, project);
    }
    console.log('Projects seeded.');

    // 3. Seed Blogs
    const blogsCol = collection(db, 'blogs');
    for (const blog of sampleBlogs) {
      await addDoc(blogsCol, { ...blog, status: blog.status || 'approved' });
    }
    console.log('Blogs seeded.');

    // 4. Seed Members
    const membersCol = collection(db, 'members');
    // Combine core, general, alumni into one collection with a 'category' field
    for (const member of sampleMembers.core) {
      await addDoc(membersCol, { ...member, category: 'core' });
    }
    for (const member of sampleMembers.general) {
      await addDoc(membersCol, { ...member, category: 'general' });
    }
    for (const member of sampleMembers.alumni) {
      await addDoc(membersCol, { ...member, category: 'alumni' });
    }
    console.log('Members seeded.');

    // 5. Seed Leaderboard
    const leaderboardCol = collection(db, 'leaderboard');
    for (const entry of leaderboardData) {
      await addDoc(leaderboardCol, entry);
    }
    console.log('Leaderboard seeded.');

    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: (error as Error).message };
  }
};
