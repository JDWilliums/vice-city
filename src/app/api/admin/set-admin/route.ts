import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { isUserAdmin } from '@/lib/userService';

export async function POST(request: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the session and check if the requester is an admin
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    const requesterUid = decodedToken.uid;
    const isRequesterAdmin = await isUserAdmin(requesterUid);
    
    if (!isRequesterAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    // Get the request body
    const { targetUid, isAdmin } = await request.json();
    
    if (!targetUid || typeof isAdmin !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }
    
    // Update the user's admin status in Firestore
    await adminDb.collection('users').doc(targetUid).update({
      isAdmin: isAdmin,
      lastUpdated: new Date()
    });
    
    return NextResponse.json({ success: true, message: `User ${targetUid} admin status set to ${isAdmin}` });
  } catch (error) {
    console.error('Error setting admin status:', error);
    return NextResponse.json({ success: false, error: 'Failed to set admin status' }, { status: 500 });
  }
} 