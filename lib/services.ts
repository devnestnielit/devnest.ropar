import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  FirestoreError
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Helper to handle Firestore operations with try/catch
const handleOp = async <T>(op: () => Promise<T>): Promise<{ data: T | null; error: string | null }> => {
  try {
    const res = await op();
    return { data: res, error: null };
  } catch (err) {
    console.error('Firestore operation failed:', err);
    return { data: null, error: (err as FirestoreError).message || 'An unknown error occurred' };
  }
};

// --- EVENTS ---
export const getAllEvents = async () => {
  return handleOp(async () => {
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
};

export const addEvent = async (event: any) => {
  return handleOp(() => addDoc(collection(db, 'events'), event));
};

export const updateEvent = async (id: string, event: any) => {
  return handleOp(() => updateDoc(doc(db, 'events', id), event));
};

export const deleteEvent = async (id: string) => {
  return handleOp(() => deleteDoc(doc(db, 'events', id)));
};

// Event Registrations (Subcollection /events/{eventId}/registrations)
export const registerForEvent = async (eventId: string, registrationData: any) => {
  return handleOp(() => addDoc(collection(db, 'events', eventId, 'registrations'), {
    ...registrationData,
    eventId,
    createdAt: new Date().toISOString()
  }));
};

export const getEventRegistrations = async (eventId: string) => {
  return handleOp(async () => {
    const q = query(collection(db, 'events', eventId, 'registrations'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
};

export const updateRegistrationScore = async (eventId: string, regId: string, score: number) => {
  return handleOp(() => updateDoc(doc(db, 'events', eventId, 'registrations', regId), {
    score: Number(score),
    scoredAt: new Date().toISOString()
  }));
};

export const updateRegistrationStatus = async (eventId: string, regId: string, status: 'approved' | 'rejected' | 'pending') => {
  return handleOp(() => updateDoc(doc(db, 'events', eventId, 'registrations', regId), {
    status,
    verifiedAt: new Date().toISOString()
  }));
};

// --- PROJECTS ---
export const getAllProjects = async () => {
  return handleOp(async () => {
    const q = query(collection(db, 'projects'), orderBy('title', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
};

export const addProject = async (project: any) => {
  return handleOp(() => addDoc(collection(db, 'projects'), project));
};

export const updateProject = async (id: string, project: any) => {
  return handleOp(() => updateDoc(doc(db, 'projects', id), project));
};

export const deleteProject = async (id: string) => {
  return handleOp(() => deleteDoc(doc(db, 'projects', id)));
};

export const approveProject = async (id: string, adminEmail?: string) => {
  return handleOp(() => updateDoc(doc(db, 'projects', id), {
    status: 'approved',
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminEmail || 'admin',
    updatedAt: new Date().toISOString()
  }));
};

export const rejectProject = async (id: string) => {
  return handleOp(() => updateDoc(doc(db, 'projects', id), {
    status: 'rejected',
    updatedAt: new Date().toISOString()
  }));
};

// --- BLOGS ---
export const addBlog = async (blog: any) => {
  return handleOp(() => addDoc(collection(db, 'blogs'), blog));
};

export const updateBlog = async (id: string, blog: any) => {
  return handleOp(() => updateDoc(doc(db, 'blogs', id), blog));
};

export const approveBlog = async (id: string) => {
  return handleOp(() => updateDoc(doc(db, 'blogs', id), { status: 'approved', updatedAt: new Date().toISOString() }));
};

export const deleteBlog = async (id: string) => {
  return handleOp(() => deleteDoc(doc(db, 'blogs', id)));
};

// --- MEMBERS ---
export const getAllMembers = async () => {
  return handleOp(async () => {
    // Note: Core/General/Alumni might be separate collections or filtered
    const q = query(collection(db, 'members'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
};

export const addMember = async (member: any) => {
  const { password: _, ...safeMember } = member || {};
  return handleOp(() => addDoc(collection(db, 'members'), safeMember));
};

export const updateMember = async (id: string, member: any) => {
  const { password: _, ...safeMember } = member || {};
  return handleOp(() => updateDoc(doc(db, 'members', id), safeMember));
};

export const deleteMember = async (id: string) => {
  return handleOp(async () => {
    const idToken = await auth.currentUser?.getIdToken(true);
    const res = await fetch('/api/admin/delete-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ memberId: id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete member');
    }
    return res.json();
  });
};

// --- CONTACTS ---
export const addContact = async (contact: {
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}) => {
  return handleOp(() => addDoc(collection(db, 'contacts'), contact));
};

export const getAllContacts = async () => {
  return handleOp(async () => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
};

export const markContactRead = async (id: string) => {
  return handleOp(() => updateDoc(doc(db, 'contacts', id), { read: true }));
};

export const deleteContact = async (id: string) => {
  return handleOp(() => deleteDoc(doc(db, 'contacts', id)));
};
