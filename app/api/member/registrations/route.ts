import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/member/registrations?uid=...&regNumber=...
// Fetches all registrations for a member across all events using Admin SDK.
// Also auto-heals the member's myRegistrations array in Firestore.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid')?.trim() || '';
    const regNumber = searchParams.get('regNumber')?.trim().toUpperCase() || '';

    if (!uid && !regNumber) {
      return NextResponse.json({ error: 'uid or regNumber is required' }, { status: 400 });
    }

    // 1. Fetch all events
    const eventsSnap = await adminDb.collection('events').get();
    const enrichedList: any[] = [];
    const stubListForMemberDoc: any[] = [];

    // 2. Scan registrations subcollection for each event
    for (const eventDoc of eventsSnap.docs) {
      const eventData = eventDoc.data();
      const eventId = eventDoc.id;
      const eventTitle = eventData.title || 'Event';
      const eventStatus = (eventData.status || 'upcoming').toLowerCase();
      const eventDate = eventData.date || null;
      const eventVenue = eventData.venue || null;

      const regSnap = await eventDoc.ref.collection('registrations').get();

      for (const rDoc of regSnap.docs) {
        const rd = rDoc.data();

        // Match criteria:
        // - submittedByUid matches uid
        // - participantUids contains uid
        // - regNumber matches member's regNumber
        // - participantRegNumbers contains member's regNumber
        // - members list has member with regNumber
        const matchesUid = Boolean(
          uid && (
            rd.submittedByUid === uid ||
            (Array.isArray(rd.participantUids) && rd.participantUids.includes(uid))
          )
        );

        const rdRegNo = String(rd.regNumber || '').trim().toUpperCase();
        const matchesRegNumber = Boolean(
          regNumber && (
            rdRegNo === regNumber ||
            (Array.isArray(rd.participantRegNumbers) && rd.participantRegNumbers.map((s: string) => String(s).toUpperCase()).includes(regNumber)) ||
            (Array.isArray(rd.members) && rd.members.some((m: any) => String(m?.regNumber || '').trim().toUpperCase() === regNumber))
          )
        );

        if (matchesUid || matchesRegNumber) {
          const isTeam = rd.type === 'Team';
          const isLeader = !isTeam || rd.submittedByUid === uid;
          const role = isTeam ? (isLeader ? 'leader' : 'member') : 'participant';

          const enrichedItem = {
            regId: rDoc.id,
            eventId,
            eventTitle: eventTitle || rd.eventTitle || 'Event',
            eventStatus,
            eventDate,
            eventVenue,
            type: rd.type || 'Solo',
            role,
            teamName: rd.teamName || '',
            registeredAt: rd.createdAt || '',
            score: typeof rd.score === 'number' ? rd.score : null,
            regStatus: rd.status || 'approved',
            scoredAt: rd.scoredAt || null,
          };

          enrichedList.push(enrichedItem);

          stubListForMemberDoc.push({
            regId: rDoc.id,
            eventId,
            eventTitle: eventTitle || rd.eventTitle || 'Event',
            type: rd.type || 'Solo',
            role,
            ...(isTeam && rd.teamName ? { teamName: rd.teamName } : {}),
            registeredAt: rd.createdAt || '',
          });
        }
      }
    }

    // Sort by registeredAt descending
    enrichedList.sort((a, b) => {
      const timeA = new Date(a.registeredAt || 0).getTime();
      const timeB = new Date(b.registeredAt || 0).getTime();
      return timeB - timeA;
    });

    // 3. Auto-heal member document myRegistrations in Firestore
    if (uid || regNumber) {
      try {
        let memberDocRef: FirebaseFirestore.DocumentReference | null = null;
        if (uid) {
          const mSnap = await adminDb.collection('members').where('uid', '==', uid).limit(1).get();
          if (!mSnap.empty) memberDocRef = mSnap.docs[0].ref;
        }
        if (!memberDocRef && regNumber) {
          const mSnap = await adminDb.collection('members').where('registrationNumber', '==', regNumber).limit(1).get();
          if (!mSnap.empty) memberDocRef = mSnap.docs[0].ref;
        }

        if (memberDocRef && stubListForMemberDoc.length > 0) {
          await memberDocRef.update({
            myRegistrations: stubListForMemberDoc,
          });
        }
      } catch (syncErr) {
        console.warn('Auto-healing member doc myRegistrations failed (non-fatal):', syncErr);
      }
    }

    return NextResponse.json({
      success: true,
      registrations: enrichedList,
    });
  } catch (err: any) {
    console.error('Failed to fetch member registrations:', err);
    return NextResponse.json({ error: 'Failed to fetch registrations', details: err?.message }, { status: 500 });
  }
}
