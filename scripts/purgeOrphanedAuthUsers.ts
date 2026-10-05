// scripts/purgeOrphanedAuthUsers.ts
import dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  return key.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

async function purgeOrphanedUsers() {
  console.log('Fetching members from Firestore...');
  const membersSnap = await db.collection('members').get();
  const validUids = new Set<string>();
  const validEmails = new Set<string>();

  membersSnap.forEach((doc) => {
    const data = doc.data();
    if (data.uid) validUids.add(data.uid);
    if (data.email) validEmails.add(data.email.toLowerCase().trim());
  });

  console.log(`Found ${membersSnap.size} members in Firestore.`);

  console.log('Listing users from Firebase Authentication...');
  let nextPageToken: string | undefined;
  let totalAuthUsers = 0;
  let purgedCount = 0;

  do {
    const listResult = await auth.listUsers(100, nextPageToken);
    for (const user of listResult.users) {
      totalAuthUsers++;
      const email = user.email ? user.email.toLowerCase().trim() : '';
      const isAdmin = user.customClaims?.admin === true;

      if (isAdmin) {
        console.log(`[SKIP] Admin user: ${user.email} (${user.uid})`);
        continue;
      }

      const hasMemberDoc = validUids.has(user.uid) || (email && validEmails.has(email));
      if (!hasMemberDoc) {
        console.log(`[DELETE] Orphaned user: ${user.email || 'No Email'} (${user.uid})`);
        await auth.deleteUser(user.uid);
        purgedCount++;
      } else {
        console.log(`[KEEP] Valid member user: ${user.email || 'No Email'} (${user.uid})`);
      }
    }
    nextPageToken = listResult.pageToken;
  } while (nextPageToken);

  console.log(`\nScan complete. Total Auth users: ${totalAuthUsers}. Purged: ${purgedCount} orphaned users.`);
}

purgeOrphanedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Purge error:', err);
    process.exit(1);
  });
