const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

function formatPrivateKey(key) {
  if (!key) return undefined;
  return key.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY)
  })
});
const db = getFirestore(app);

async function sync() {
  const membersSnap = await db.collection('members').get();
  console.log(`Found ${membersSnap.size} members to sync...`);

  for (const doc of membersSnap.docs) {
    const data = doc.data();
    const profileRef = db.collection('memberProfiles').doc(doc.id);

    const updatePayload = {
      name: data.name || '',
      registrationNumber: data.registrationNumber || '',
      image: data.image || '',
      bio: data.bio || '',
      github: data.github || '',
      linkedin: data.linkedin || '',
      status: data.status || 'approved',
      currentMonthPoints: typeof data.currentMonthPoints === 'number' ? data.currentMonthPoints : 0,
      totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0,
      uid: data.uid || null,
      updatedAt: new Date().toISOString(),
    };

    await profileRef.set(updatePayload, { merge: true });
    console.log(`Synced member ${doc.id} (${data.name}) -> Reg: ${data.registrationNumber}`);
  }

  console.log('Sync completed successfully.');
}

sync().then(() => process.exit(0)).catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
