import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// POST /api/events/register-team
// Body: {
//   eventId: string, submitterUid: string,
//   teamName: string, teamLeader: string, college: string,
//   members: [{ name, regNumber, branch, year, semester }]
// }
//
// Intra-college team registration, handled fully server-side:
//  1. Validates the event exists and is a team event (Open mode rejected —
//     guests use the standard client form).
//  2. Verifies EVERY team member's registration number belongs to an existing
//     member — otherwise 422 "Member not existed: ...".
//  3. Creates the registration in events/{eventId}/registrations.
//  4. Mirrors the registration into EACH team member's myRegistrations array,
//     so it appears on every member's dashboard (not just the submitter's).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { eventId, submitterUid, teamName, teamLeader, college, members } = body;

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }
    if (!submitterUid || typeof submitterUid !== 'string') {
      return NextResponse.json({ error: 'You must be logged in to register a team.' }, { status: 401 });
    }
    if (!teamName || typeof teamName !== 'string' || !teamName.trim()) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }
    if (!Array.isArray(members) || members.length < 2 || members.length > 5) {
      return NextResponse.json({ error: 'A team needs 2 to 5 members' }, { status: 400 });
    }

    // Normalize members exactly like the apply flow (trim + UPPERCASE regNumber)
    const normalized = members.map((m: any) => ({
      name: String(m?.name || '').trim(),
      regNumber: String(m?.regNumber || '').trim().toUpperCase(),
      branch: String(m?.branch || '').trim(),
      year: String(m?.year || '').trim(),
      semester: String(m?.semester || '').trim(),
    }));
    if (normalized.some(m => !m.name || !m.regNumber)) {
      return NextResponse.json(
        { error: 'Every team member needs a name and registration number' },
        { status: 400 }
      );
    }
    const regNumbers: string[] = [...new Set(normalized.map(m => m.regNumber))];

    // Event must exist and be a team event; Open mode uses the guest form
    const eventRef = adminDb.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const event = eventSnap.data()!;
    if (event.mode === 'Open') {
      return NextResponse.json(
        { error: 'Open events use the standard registration form' },
        { status: 400 }
      );
    }

    // Duplicate check: submitter already registered for this event?
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

    // Verify every registration number belongs to an existing member
    // (Firestore 'in' supports up to 10 values; teams allow max 5 members)
    const memberSnaps = await adminDb
      .collection('members')
      .where('registrationNumber', 'in', regNumbers)
      .get();
    const foundByReg: Record<string, FirebaseFirestore.DocumentSnapshot> = {};
    memberSnaps.docs.forEach(d => {
      foundByReg[String(d.data().registrationNumber || '').toUpperCase()] = d;
    });
    const missing = regNumbers.filter(rn => !foundByReg[rn]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Member not existed: ${missing.join(', ')}` },
        { status: 422 }
      );
    }

    // Create the registration
    const now = new Date().toISOString();
    const participantUids: string[] = [...new Set(
      Object.values(foundByReg)
        .map((d: any) => d.data().uid)
        .filter((uid: any) => typeof uid === 'string' && uid)
    )];
    const regRef = await eventRef.collection('registrations').add({
      type: 'Team',
      mode: event.mode || 'Intra-College',
      status: 'approved',
      submittedByUid: submitterUid,
      teamName: teamName.trim(),
      teamLeader: (teamLeader || normalized[0].name).trim(),
      college: (college || 'NIELIT').trim(),
      memberCount: normalized.length,
      members: normalized,
      participantRegNumbers: regNumbers,
      participantUids,
      eventTitle: event.title || '',
      eventId,
      createdAt: now,
    });

    // Fan out to EVERY team member's myRegistrations so the registration shows
    // on each member's dashboard (leader and members alike)
    const batch = adminDb.batch();
    normalized.forEach((m, idx) => {
      const memberDoc = foundByReg[m.regNumber];
      batch.update(memberDoc.ref, {
        myRegistrations: FieldValue.arrayUnion({
          regId: regRef.id,
          eventId,
          eventTitle: event.title || '',
          type: 'Team',
          role: idx === 0 ? 'leader' : 'member',
          teamName: teamName.trim(),
          registeredAt: now,
        }),
      });
    });
    await batch.commit();

    return NextResponse.json({ success: true, regId: regRef.id });
  } catch (err: any) {
    console.error('register-team error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
