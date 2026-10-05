import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
    try {
        // 1. Verify caller is authenticated admin
        const authHeader = req.headers.get('authorization');
        const idToken = authHeader?.split('Bearer ')[1];
        if (!idToken) {
            return NextResponse.json({ error: 'Missing Bearer authentication token' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = await adminAuth.verifyIdToken(idToken);
        } catch (tokenErr: any) {
            console.error('Invalid ID token:', tokenErr);
            return NextResponse.json({ error: 'Invalid or expired authentication token' }, { status: 401 });
        }

        if (!decoded?.admin) {
            return NextResponse.json({ error: 'Forbidden: Administrator privileges required' }, { status: 403 });
        }

        // 2. Parse request body
        const body = await req.json().catch(() => ({}));
        const memberId = body.memberId;
        let uid = body.uid;
        let email = body.email;

        if (!memberId && !uid && !email) {
            return NextResponse.json({ error: 'memberId, uid, or email is required' }, { status: 400 });
        }

        // 3. Resolve member document in Firestore if memberId provided
        if (memberId) {
            const memberDoc = await adminDb.collection('members').doc(memberId).get();
            if (memberDoc.exists) {
                const data = memberDoc.data() || {};
                uid = uid || data.uid;
                email = email || data.email;
            } else {
                // Check memberProfiles in case members doc was already deleted
                const profileDoc = await adminDb.collection('memberProfiles').doc(memberId).get();
                if (profileDoc.exists) {
                    const data = profileDoc.data() || {};
                    uid = uid || data.uid;
                    email = email || data.email;
                }
            }
        }

        // Prevent admin from deleting their own account via member deletion
        if (uid && decoded.uid === uid) {
            return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
        }
        if (email && decoded.email && decoded.email.toLowerCase() === email.toLowerCase()) {
            return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
        }

        let authDeleted = false;

        // 4. Delete user from Firebase Authentication
        // Try by UID first
        if (uid) {
            try {
                await adminAuth.deleteUser(uid);
                authDeleted = true;
                console.log(`[delete-member] Deleted Firebase Auth user by UID: ${uid}`);
            } catch (authErr: any) {
                if (authErr.code !== 'auth/user-not-found') {
                    console.warn(`[delete-member] Error deleting Auth user by UID ${uid}:`, authErr);
                }
            }
        }

        // If not deleted yet or email available, check by email
        if (email) {
            try {
                const userByEmail = await adminAuth.getUserByEmail(email);
                if (userByEmail && userByEmail.uid !== decoded.uid) {
                    await adminAuth.deleteUser(userByEmail.uid);
                    authDeleted = true;
                    console.log(`[delete-member] Deleted Firebase Auth user by email: ${email} (UID: ${userByEmail.uid})`);
                }
            } catch (authErr: any) {
                if (authErr.code !== 'auth/user-not-found') {
                    console.warn(`[delete-member] Error looking up Auth user by email ${email}:`, authErr);
                }
            }
        }

        // If memberId looks like a UID and no auth user was deleted yet, attempt by memberId
        if (!authDeleted && memberId) {
            try {
                await adminAuth.deleteUser(memberId);
                authDeleted = true;
                console.log(`[delete-member] Deleted Firebase Auth user by memberId as UID: ${memberId}`);
            } catch (_) {}
        }

        // 5. Delete Firestore documents
        // a. Main members doc and profile doc
        if (memberId) {
            await adminDb.collection('members').doc(memberId).delete().catch(() => {});
            await adminDb.collection('memberProfiles').doc(memberId).delete().catch(() => {});
        }

        // b. Any other members doc matching uid or email
        if (uid) {
            const uidSnap = await adminDb.collection('members').where('uid', '==', uid).get();
            for (const d of uidSnap.docs) {
                await d.ref.delete().catch(() => {});
                await adminDb.collection('memberProfiles').doc(d.id).delete().catch(() => {});
            }
        }
        if (email) {
            const emailSnap = await adminDb.collection('members').where('email', '==', email).get();
            for (const d of emailSnap.docs) {
                await d.ref.delete().catch(() => {});
                await adminDb.collection('memberProfiles').doc(d.id).delete().catch(() => {});
            }
        }

        // c. Clean up profile update requests
        try {
            const [reqsById, reqsByUid] = await Promise.all([
                memberId ? adminDb.collection('profileUpdateRequests').where('memberDocId', '==', memberId).get() : Promise.resolve(null),
                uid ? adminDb.collection('profileUpdateRequests').where('uid', '==', uid).get() : Promise.resolve(null),
            ]);
            const batch = adminDb.batch();
            reqsById?.forEach(r => batch.delete(r.ref));
            reqsByUid?.forEach(r => batch.delete(r.ref));
            await batch.commit().catch(() => {});
        } catch (cleanupErr) {
            console.warn('[delete-member] Failed to clean up profile update requests:', cleanupErr);
        }

        return NextResponse.json({
            success: true,
            authDeleted,
            message: 'Member and associated authentication account deleted successfully.',
        });
    } catch (err: any) {
        console.error('Delete member error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
