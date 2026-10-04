import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
    try {
        // 1. Verify the caller is an authenticated admin
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

        // 2. Fetch all members
        const membersSnap = await adminDb.collection('members').get();
        let syncedCount = 0;

        const batch = adminDb.batch();

        membersSnap.forEach((doc) => {
            const data = doc.data();
            // Sync all approved members (or any member with points/profile data)
            if (data.status === 'approved' || typeof data.currentMonthPoints === 'number' || data.name) {
                const profileRef = adminDb.collection('memberProfiles').doc(doc.id);
                batch.set(profileRef, {
                    uid: data.uid || null,
                    name: data.name || '',
                    registrationNumber: data.registrationNumber || '',
                    image: data.image || '',
                    bio: data.bio || '',
                    github: data.github || '',
                    linkedin: data.linkedin || '',
                    status: data.status || 'approved',
                    currentMonthPoints: typeof data.currentMonthPoints === 'number' ? data.currentMonthPoints : 0,
                    totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0,
                    lastResetMonth: data.lastResetMonth || null,
                    updatedAt: new Date().toISOString(),
                }, { merge: true });
                syncedCount++;
            }
        });

        await batch.commit();

        return NextResponse.json({ success: true, syncedCount });
    } catch (err: any) {
        console.error('Sync profiles error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
