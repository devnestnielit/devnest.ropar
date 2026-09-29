import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function formatPrivateKey(key: string | undefined): string | undefined {
    if (!key) return undefined;
    // Strip surrounding double/single quotes if present
    let formatted = key.trim().replace(/^["']|["']$/g, '');
    // Replace literal escaped newlines with actual newline characters
    formatted = formatted.replace(/\\n/g, '\n');
    return formatted;
}

export function getAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Missing Firebase Admin SDK credentials in environment (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY).'
        );
    }

    return initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

// Proxies to prevent crashing on module evaluation if credentials are not yet initialized
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

export const adminAuth = new Proxy({} as Auth, {
    get(_target, prop) {
        if (!_adminAuth) {
            _adminAuth = getAuth(getAdminApp());
        }
        const val = (_adminAuth as any)[prop];
        return typeof val === 'function' ? val.bind(_adminAuth) : val;
    }
});

export const adminDb = new Proxy({} as Firestore, {
    get(_target, prop) {
        if (!_adminDb) {
            _adminDb = getFirestore(getAdminApp());
        }
        const val = (_adminDb as any)[prop];
        return typeof val === 'function' ? val.bind(_adminDb) : val;
    }
});