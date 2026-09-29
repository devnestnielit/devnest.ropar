import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// Strong password policy: >= 8 characters, at least 1 uppercase, 1 lowercase, 1 digit or special symbol
function validatePassword(password: string): boolean {
    if (!password || password.length < 8) return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumberOrSymbol = /[\d\W]/.test(password);
    return hasUpper && hasLower && hasNumberOrSymbol;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
        }

        const name = (body.name || '').trim();
        const email = (body.email || '').trim().toLowerCase();
        const registrationNumber = (body.registrationNumber || '').trim().toUpperCase();
        const password = body.password || '';
        const bio = (body.bio || '').trim();
        const image = (body.image || '').trim();
        const github = (body.github || '').trim();
        const linkedin = (body.linkedin || '').trim();

        // 1. Validate fields
        if (!name || !email || !registrationNumber || !password) {
            return NextResponse.json(
                { error: 'Name, email, registration number, and password are required.' },
                { status: 400 }
            );
        }

        // Email basic validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
        }

        // Password complexity validation
        if (!validatePassword(password)) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers or symbols.' },
                { status: 400 }
            );
        }

        if (bio.length > 500) {
            return NextResponse.json({ error: 'Bio must be under 500 characters.' }, { status: 400 });
        }

        // 2. Duplicate check (prevent account enumeration with generic message - BUG-16)
        const [emailSnap, regSnap] = await Promise.all([
            adminDb.collection('members').where('email', '==', email).limit(1).get(),
            adminDb.collection('members').where('registrationNumber', '==', registrationNumber).limit(1).get(),
        ]);

        if (!emailSnap.empty || !regSnap.empty) {
            return NextResponse.json(
                { error: 'An application with these details already exists or is pending review.' },
                { status: 400 }
            );
        }

        // Check if an Auth user already exists with this email
        try {
            const existingUser = await adminAuth.getUserByEmail(email);
            if (existingUser) {
                return NextResponse.json(
                    { error: 'An application with these details already exists or is pending review.' },
                    { status: 400 }
                );
            }
        } catch (err: any) {
            // auth/user-not-found is expected here
            if (err.code !== 'auth/user-not-found') {
                console.error('Error checking existing Auth user:', err);
            }
        }

        // 3. Provision Firebase Auth user server-side in DISABLED state (BUG-1, BUG-3)
        // Password is encrypted & stored securely in Firebase Auth, NEVER in Firestore.
        // Account remains disabled until admin approval.
        const newUser = await adminAuth.createUser({
            email,
            password,
            displayName: name,
            disabled: true,
        });

        // 4. Save pending application to Firestore without password
        const memberDoc = await adminDb.collection('members').add({
            uid: newUser.uid,
            name,
            email,
            registrationNumber,
            image,
            bio,
            github,
            linkedin,
            status: 'pending',
            currentMonthPoints: 0,
            totalPoints: 0,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json(
            {
                success: true,
                id: memberDoc.id,
                message: 'Application submitted successfully. It will be reviewed by an administrator.',
            },
            { status: 201 }
        );
    } catch (err: any) {
        console.error('Member apply error:', err);
        return NextResponse.json(
            { error: err.message || 'An error occurred while submitting your application.' },
            { status: 500 }
        );
    }
}
