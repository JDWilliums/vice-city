import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('📣 Admin check API called');
    
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      console.log('❌ No session cookie found');
      return NextResponse.json({ isAdmin: false, error: 'No session found' }, { status: 401 });
    }
    
    console.log('✅ Session cookie found, length:', sessionCookie.length);
    
    try {
      // Import the necessary functions at runtime
      const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
      
      // Get the admin auth instance
      const adminAuth = getAdminAuth();
      console.log('✅ Successfully got Admin Auth instance');
      
      // Add token debug info
      const tokenPreview = sessionCookie.length > 20 
        ? `${sessionCookie.substring(0, 10)}...${sessionCookie.substring(sessionCookie.length - 10)}`
        : sessionCookie;
      console.log(`Token preview: ${tokenPreview}, length: ${sessionCookie.length}`);
      
      // Verify the session
      console.log('🔑 Verifying token...');
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
      const uid = decodedToken.uid;
      
      console.log('✅ Token verified successfully for UID:', uid);
      
      // IMPORTANT CHANGE: Check admin status directly with Admin SDK instead of using isUserAdmin
      try {
        console.log('🔍 Directly checking admin status in Firestore with Admin SDK...');
        const adminDb = getAdminDb();
        const userDoc = await adminDb.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
          console.log('❓ User document does not exist in Firestore');
          return NextResponse.json({ 
            isAdmin: false,
            uid: uid,
            verified: true,
            error: 'User document not found'
          });
        }
        
        const userData = userDoc.data();
        const isAdmin = userData?.isAdmin === true;
        
        console.log('📊 Admin status from Firestore:', isAdmin);
        console.log('📄 Document data:', JSON.stringify(userData));
        
        return NextResponse.json({ 
          isAdmin: isAdmin,
          uid: uid,
          verified: true,
          docPath: `users/${uid}`
        });
      } catch (adminCheckError: any) {
        console.error('❌ Error checking admin status:', adminCheckError);
        
        // Still keep the fallback for safety
        try {
          console.log('🔄 Attempting fallback direct Firestore check for admin status');
          const db = getAdminDb();
          
          if (!db) {
            throw new Error('Firestore instance is not available');
          }
          
          // Try to check if there are multiple documents with the same UID
          console.log('🔍 Checking for any documents with field uid equal to:', uid);
          const querySnapshot = await db.collection('users').where('uid', '==', uid).get();
          
          if (querySnapshot.empty) {
            console.log('❌ No documents found with uid field matching:', uid);
            return NextResponse.json({ 
              isAdmin: false, 
              uid: uid,
              verified: true,
              error: 'No documents found with this UID field',
              note: 'Please ensure your user document exists in Firestore'
            });
          }
          
          console.log(`📝 Found ${querySnapshot.size} documents with uid field matching:`, uid);
          
          let foundAdminDoc = false;
          querySnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Document at ${doc.ref.path}:`, data);
            if (data.isAdmin === true) {
              foundAdminDoc = true;
            }
          });
          
          return NextResponse.json({ 
            isAdmin: foundAdminDoc,
            uid: uid,
            verified: true,
            note: 'Used collection query fallback',
            documentsFound: querySnapshot.size
          });
        } catch (fallbackError: any) {
          console.error('❌ Fallback check also failed:', fallbackError);
          return NextResponse.json({ 
            isAdmin: false, 
            uid: uid,
            verified: true,
            error: 'Failed to check admin status',
            errorDetails: adminCheckError?.message || 'Unknown error',
            fallbackError: fallbackError?.message || 'Unknown fallback error'
          }, { status: 500 });
        }
      }
    } catch (tokenError: any) {
      console.error('❌ Token verification error:', tokenError);
      
      // Log initialization status for debugging
      try {
        const { getFirebaseAdminInitStatus } = await import('@/lib/firebase-admin');
        const initStatus = getFirebaseAdminInitStatus();
        console.error('Firebase Admin SDK status after error:', {
          isInitialized: initStatus.isInitialized,
          hasError: initStatus.hasError,
          errorMessage: initStatus.errorMessage
        });
      } catch (statusError) {
        console.error('❌ Error getting Firebase Admin status:', statusError);
      }
      
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Invalid session token',
        errorDetails: tokenError?.message || 'Unknown error'
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('❌ Error checking admin status:', error);
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Failed to verify admin status',
      errorDetails: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 