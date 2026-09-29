import dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function formatPrivateKey(key: string | undefined): string | undefined {
    if (!key) return undefined;
    return key.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

const app = !getApps().length
    ? initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
        }),
    })
    : getApps()[0];

const db = getFirestore(app);

async function main() {
    console.log('--- Sanitizing members collection: removing all plaintext passwords ---');
    const membersSnap = await db.collection('members').get();
    let sanitizedCount = 0;

    for (const doc of membersSnap.docs) {
        const data = doc.data();
        if (data.password !== undefined) {
            await doc.ref.update({
                password: FieldValue.delete(),
            });
            sanitizedCount++;
            console.log(`Sanitized member doc: ${doc.id} (${data.email || 'no email'})`);
        }
    }

    console.log(`Finished! Sanitized ${sanitizedCount} member document(s).`);
    process.exit(0);
}

main().catch((err) => {
    console.error('Sanitization failed:', err);
    process.exit(1);
});
