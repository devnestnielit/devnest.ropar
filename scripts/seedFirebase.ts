// Note: To run this script, you will need to properly set up a Node/TS execution environment for Firebase Admin SDK or adapt it to be run inside the Next.js API route.
// This is a client-SDK compatible version you can run from a temporary component or button in your app if you prefer not to configure the node-admin sdk just for seeding.

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sampleEvents, sampleProjects, sampleBlogs } from '../lib/data';

export const seedDatabase = async () => {
  console.log('Starting database seed...');

  try {
    // Seed Events
    console.log('Seeding Events...');
    const eventsRef = collection(db, 'events');
    for (const event of sampleEvents) {
      await setDoc(doc(eventsRef, event.id), event);
      console.log(`Added event: ${event.title}`);
    }

    // Seed Projects
    console.log('Seeding Projects...');
    const projectsRef = collection(db, 'projects');
    for (const project of sampleProjects) {
      await setDoc(doc(projectsRef, project.id), project);
      console.log(`Added project: ${project.title}`);
    }

    // Seed Blogs
    console.log('Seeding Blogs...');
    const blogsRef = collection(db, 'blogs');
    for (const blog of sampleBlogs) {
      // Using slug as ID makes routing easier
      await setDoc(doc(blogsRef, blog.slug || blog.id), blog);
      console.log(`Added blog: ${blog.title}`);
    }

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
