import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { isUserAdmin } from '@/lib/userService';

export async function GET(request: NextRequest) {
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
    
    // Fetch all users from Firestore
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
} 