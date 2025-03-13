import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Dynamically import Firebase Admin to prevent build-time initialization
let adminAuth: any;
let adminDb: any;
let isUserAdmin: any;

// This initialization will only happen at runtime, not build time
async function initAdminSDK() {
  if (!adminAuth || !adminDb || !isUserAdmin) {
    const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
    const { isUserAdmin: userAdmin } = await import('@/lib/userService');
    adminAuth = getAdminAuth();
    adminDb = getAdminDb();
    isUserAdmin = userAdmin;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Initialize the admin SDK at runtime
    await initAdminSDK();
    
    // Verify the session and check if the requester is an admin
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    const requesterUid = decodedToken.uid;
    const isRequesterAdmin = await isUserAdmin(requesterUid);
    
    if (!isRequesterAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    // Fetch all users from Firestore
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map((doc: any) => doc.data());
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
} 