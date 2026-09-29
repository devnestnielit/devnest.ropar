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

        // 2. Validate memberId
        const body = await req.json().catch(() => ({}));
        const memberId = body.memberId;
        if (!memberId || typeof memberId !== 'string') {
            return NextResponse.json({ error: 'Valid memberId is required' }, { status: 400 });
        }

        const memberRef = adminDb.collection('members').doc(memberId);
        const memberSnap = await memberRef.get();
        if (!memberSnap.exists) {
            return NextResponse.json({ error: 'Member application not found' }, { status: 404 });
        }

        const data = memberSnap.data()!;
        if (data.status === 'approved') {
            return NextResponse.json({ error: 'Member is already approved' }, { status: 409 });
        }

        let finalUid = data.uid;

        // 3. Provision or enable the Firebase Auth account
        if (finalUid) {
            // New flow: Auth user already created with disabled: true during apply
            try {
                await adminAuth.updateUser(finalUid, { disabled: false });
            } catch (authErr: any) {
                console.warn('Could not enable user by UID, attempting to check by email:', authErr);
                if (data.email) {
                    const existing = await adminAuth.getUserByEmail(data.email).catch(() => null);
                    if (existing) {
                        finalUid = existing.uid;
                        await adminAuth.updateUser(finalUid, { disabled: false });
                    }
                }
            }
        } else if (data.email) {
            // Legacy flow: create user if they had a stored password or generate reset link
            try {
                const existingUser = await adminAuth.getUserByEmail(data.email).catch(() => null);
                if (existingUser) {
                    finalUid = existingUser.uid;
                    await adminAuth.updateUser(finalUid, { disabled: false });
                } else if (data.password) {
                    const newUser = await adminAuth.createUser({
                        email: data.email,
                        password: data.password,
                        displayName: data.name,
                    });
                    finalUid = newUser.uid;
                } else {
                    const newUser = await adminAuth.createUser({
                        email: data.email,
                        displayName: data.name,
                    });
                    finalUid = newUser.uid;
                    // Generate password setup link
                    await adminAuth.generatePasswordResetLink(data.email);
                }
            } catch (createErr: any) {
                console.error('Failed to create/resolve Auth user:', createErr);
                return NextResponse.json(
                    { error: `Failed to provision user account: ${createErr.message}` },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json({ error: 'Application is missing an email address' }, { status: 400 });
        }

        // 4. Update the members document: set status approved, write back uid, strip password
        await memberRef.update({
            uid: finalUid,
            status: 'approved',
            password: null, // Ensure password is permanently wiped from Firestore
            approvedAt: new Date().toISOString(),
        });

        // 5. Publish public-safe fields to memberProfiles
        // BUG-43: registrationNumber is institutional PII — never publish it
        // to the publicly-readable memberProfiles collection.
        await adminDb.collection('memberProfiles').doc(memberId).set({
            uid: finalUid,
            name: data.name || '',
            image: data.image || '',
            bio: data.bio || '',
            github: data.github || '',
            linkedin: data.linkedin || '',
            currentMonthPoints: data.currentMonthPoints || 0,
            totalPoints: data.totalPoints || 0,
            approvedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, uid: finalUid });
    } catch (err: any) {
        console.error('Approval error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}