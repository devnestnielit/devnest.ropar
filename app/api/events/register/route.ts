import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/events/register
// Server-side event registration using Admin SDK.
// Handles Solo and Open registrations, and mirrors into member doc's myRegistrations.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { eventId, submitterUid, payload, memberDocId } = body;

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'payload is required' }, { status: 400 });
    }

    const eventRef = adminDb.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const eventData = eventSnap.data()!;

    // Duplicate registration check for logged-in user
    if (submitterUid) {
      const dupSnap = await eventRef
        .collection('registrations')
        .where('submittedByUid', '==', submitterUid)
        .limit(1)
        .get();
      if (!dupSnap.empty) {
        return NextResponse.json(
          { error: 'You have already registered for this event.' },
          { status: 409 }
        );
      }
    }

    const now = new Date().toISOString();
    const regDocData = {
      ...payload,
      eventId,
      eventTitle: eventData.title || payload.eventTitle || '',
      submittedByUid: submitterUid || payload.submittedByUid || null,
      createdAt: now,
    };

    // 1. Create registration doc
    const regRef = await eventRef.collection('registrations').add(regDocData);

    // 2. Mirror into member's myRegistrations array if member account exists
    let targetMemberRef: FirebaseFirestore.DocumentReference | null = null;
    if (memberDocId) {
      targetMemberRef = adminDb.collection('members').doc(memberDocId);
    } else if (submitterUid) {
      const mSnap = await adminDb.collection('members').where('uid', '==', submitterUid).limit(1).get();
      if (!mSnap.empty) targetMemberRef = mSnap.docs[0].ref;
    } else if (payload.regNumber) {
      const mSnap = await adminDb.collection('members').where('registrationNumber', '==', payload.regNumber.toUpperCase()).limit(1).get();
      if (!mSnap.empty) targetMemberRef = mSnap.docs[0].ref;
    }

    if (targetMemberRef) {
      try {
        await targetMemberRef.update({
          myRegistrations: FieldValue.arrayUnion({
            regId: regRef.id,
            eventId,
            eventTitle: eventData.title || payload.eventTitle || '',
            type: payload.type || 'Solo',
            role: payload.type === 'Team' ? 'leader' : 'participant',
            ...(payload.teamName ? { teamName: payload.teamName } : {}),
            registeredAt: now,
          }),
        });
      } catch (mirrorErr) {
        console.warn('Failed to mirror registration into member doc:', mirrorErr);
      }
    }

    return NextResponse.json({
      success: true,
      regId: regRef.id,
    });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json({ error: 'Registration failed', details: err?.message }, { status: 500 });
  }
}
