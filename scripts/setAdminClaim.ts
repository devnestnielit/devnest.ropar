// scripts/setAdminClaim.ts
import dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const app = initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
});

const auth = getAuth(app);

async function main() {
    const adminUid = process.argv[2];
    if (!adminUid) {
        console.error('Usage: npx ts-node scripts/setAdminClaim.ts <adminUid>');
        process.exit(1);
    }

    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        console.error('Missing one or more FIREBASE_ADMIN_* variables. Check .env.local.');
        console.error({
            projectIdPresent: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmailPresent: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKeyPresent: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        });
        process.exit(1);
    }

    await auth.setCustomUserClaims(adminUid, { admin: true });
    console.log(`Admin claim set for UID: ${adminUid}`);
    process.exit(0);
}

main();