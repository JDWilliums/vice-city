import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('🔧 FORCE ADMIN API called');
  
  try {
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      console.log('❌ No session cookie found');
      return NextResponse.json({ 
        success: false, 
        error: 'No session found' 
      }, { status: 401 });
    }
    
    console.log('✅ Session cookie found, length:', sessionCookie.length);
    
    // Import the necessary functions at runtime
    const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
    
    console.log('🔄 Getting Admin SDK instances...');
    
    // Get the admin auth instance
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    console.log('✅ Successfully got Admin SDK instances');
    
    // Verify the session to get the user ID
    console.log('🔑 Verifying token...');
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    const uid = decodedToken.uid;
    
    console.log('✅ Token verified successfully for UID:', uid);
    
    // Check current admin status in Firestore
    console.log('🔍 Checking current admin status...');
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❓ User document does not exist, creating it...');
      
      // Create the user document with admin status
      await userRef.set({
        uid,
        isAdmin: true,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
      
      console.log('✅ Created user document with admin status');
    } else {
      console.log('📄 User document exists');
      const userData = userDoc.data();
      console.log('📊 Current admin status:', userData?.isAdmin === true ? 'TRUE' : 'FALSE');
      
      // Update the user document with admin status
      console.log('✏️ Setting admin status to TRUE...');
      await userRef.update({
        isAdmin: true,
        lastUpdated: new Date()
      });
      
      console.log('✅ Updated user document with admin status');
    }
    
    // Verify the update
    console.log('🔍 Verifying update...');
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    const adminStatus = updatedData?.isAdmin === true;
    
    console.log('📊 Updated admin status:', adminStatus ? 'TRUE' : 'FALSE');
    
    return NextResponse.json({
      success: true,
      message: `User ${uid} admin status set to ${adminStatus}`,
      previousStatus: userDoc.exists ? userDoc.data()?.isAdmin === true : null,
      currentStatus: adminStatus,
      uid
    });
  } catch (error: any) {
    console.error('❌ Error in force-admin API:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to set admin status',
      errorDetails: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 