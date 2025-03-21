export const dynamic = 'force-dynamic';

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
      console.log('❌ User document not found in Firestore');
      
      // Create a new user document with admin set to true
      console.log('📝 Creating new user document with admin privileges...');
      await userRef.set({
        uid: uid,
        isAdmin: true,
        email: decodedToken.email || 'unknown@email.com',
        displayName: decodedToken.name || 'Unknown User',
        createdAt: new Date(),
        lastUpdated: new Date()
      });
      
      console.log('✅ New user document created with admin privileges');
    } else {
      // Update the existing document if needed
      const userData = userDoc.data() || {};
      
      if (userData.isAdmin !== true) {
        console.log('📝 Updating user document to grant admin privileges...');
        await userRef.update({
          isAdmin: true,
          lastUpdated: new Date()
        });
        
        console.log('✅ User document updated with admin privileges');
      } else {
        console.log('✓ User already has admin privileges');
      }
    }
    
    // Calculate expiry (1 hour from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    
    // Set the admin-session cookie
    console.log('🔑 Setting admin-session cookie...');
    cookies().set({
      name: 'admin-session',
      value: 'true',
      expires: expiryDate,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // Also refresh the session cookie
    console.log('🔄 Refreshing session cookie...');
    cookies().set({
      name: 'session',
      value: sessionCookie,
      expires: expiryDate,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin privileges confirmed and session cookies updated',
      isAdmin: true,
      expires: expiryDate.toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error in force-admin API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 