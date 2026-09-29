// One-time backfill: populate each member's `myRegistrations` array from the
// EXISTING events/{eventId}/registrations documents.
//
// New registrations (after the register-team route + client mirror) populate
// myRegistrations automatically — this script covers everything created before.
//
//   - Solo registration  -> mirrored to the submitter's member doc (role: participant)
//   - Team registration  -> mirrored to EVERY team member's doc (role: leader/member)
//
// Safe to re-run: entries carry the registration id, so arrayUnion will not
// create duplicates.
//
// Usage (from the repo root, with the Firebase Admin env vars set):
//   FIREBASE_ADMIN_PROJECT_ID=... FIREBASE_ADMIN_CLIENT_EMAIL=... \
//   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" \
//   node scripts/backfill-my-registrations.js

const admin = require('firebase-admin');

function formatPrivateKey(key) {
  if (!key) return undefined;
  return key.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

async function findMemberByUid(uid) {
  const snap = await db.collection('members').where('uid', '==', uid).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

async function findMemberByRegNumber(regNumber) {
  const rn = String(regNumber || '').trim().toUpperCase();
  if (!rn) return null;
  const snap = await db.collection('members').where('registrationNumber', '==', rn).limit(1).get();
  return snap.empty ? null : snap.docs[0];
}

async function main() {
  const eventsSnap = await db.collection('events').get();
  console.log(`Found ${eventsSnap.size} events`);

  let batch = db.batch();
  let ops = 0;
  let mirrored = 0;
  let skipped = 0;

  const commitIfFull = async () => {
    if (ops >= 400) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  };

  const mirror = (memberDoc, entry) => {
    batch.update(memberDoc.ref, { myRegistrations: FieldValue.arrayUnion(entry) });
    ops++;
    mirrored++;
  };

  for (const eventDoc of eventsSnap.docs) {
    const eventId = eventDoc.id;
    const eventTitle = eventDoc.data().title || '';
    const regsSnap = await eventDoc.ref.collection('registrations').get();
    console.log(`- ${eventTitle || eventId}: ${regsSnap.size} registrations`);

    for (const regDoc of regsSnap.docs) {
      const reg = regDoc.data();
      const regId = regDoc.id;
      const base = {
        regId,
        eventId,
        eventTitle: reg.eventTitle || eventTitle,
        type: reg.type || 'Solo',
        registeredAt: reg.createdAt || new Date().toISOString(),
      };

      if ((reg.type || 'Solo') === 'Solo') {
        // Solo -> the submitter
        if (!reg.submittedByUid) { skipped++; continue; }
        const memberDoc = await findMemberByUid(reg.submittedByUid);
        if (!memberDoc) {
          console.warn(`  ! solo reg ${regId}: no member for uid ${reg.submittedByUid}`);
          skipped++;
          continue;
        }
        mirror(memberDoc, { ...base, type: 'Solo', role: 'participant' });
      } else {
        // Team -> every team member
        const members = Array.isArray(reg.members) ? reg.members : [];
        if (members.length === 0) { skipped++; continue; }
        for (let i = 0; i < members.length; i++) {
          const m = members[i];
          const memberDoc = await findMemberByRegNumber(m.regNumber);
          if (!memberDoc) {
            console.warn(`  ! team reg ${regId}: Member not existed: ${m.regNumber}`);
            skipped++;
            continue;
          }
          mirror(memberDoc, {
            ...base,
            type: 'Team',
            role: i === 0 ? 'leader' : 'member',
            teamName: reg.teamName || '',
          });
        }
      }
      await commitIfFull();
    }
  }

  if (ops > 0) await batch.commit();
  console.log(`Done. Mirrored ${mirrored} entries, skipped ${skipped}.`);
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
