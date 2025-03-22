export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log('🧹 USER CLEANUP API called');
  
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
    
    // Import the admin SDK at runtime
    const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
    
    // Get the admin auth and db instances
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    // Verify the session to get the user ID
    console.log('🔑 Verifying token...');
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    const uid = decodedToken.uid;
    
    console.log('✅ Token verified for UID:', uid);
    
    // 1. Check for documents WITH uid as ID (the correct way)
    console.log('🔍 Checking for document with ID =', uid);
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    
    // 2. Check for documents with uid as a field (potentially duplicates/incorrect)
    console.log('🔍 Checking for documents with uid FIELD =', uid);
    const querySnapshot = await adminDb.collection('users').where('uid', '==', uid).get();
    
    const results = {
      documentWithId: {
        exists: userDoc.exists,
        data: userDoc.exists ? userDoc.data() : null,
        isAdmin: userDoc.exists ? userDoc.data()?.isAdmin === true : false
      },
      documentsWithUidField: {
        count: querySnapshot.size,
        documents: [] as any[]
      },
      fixes: [] as string[],
      finalStatus: undefined as {
        exists: boolean;
        isAdmin: boolean;
        data: any;
      } | undefined
    };
    
    // Check query results
    if (!querySnapshot.empty) {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        results.documentsWithUidField.documents.push({
          id: doc.id,
          data: data,
          path: doc.ref.path
        });
      });
    }
    
    // Determine if there are problems to fix
    const hasCorrectDoc = userDoc.exists;
    const hasDocWithUidField = querySnapshot.size > 0;
    const hasMultipleDocsWithUidField = querySnapshot.size > 1;
    
    // Look for duplicate documents that need fixing
    if (hasDocWithUidField) {
      for (const doc of results.documentsWithUidField.documents) {
        // Skip the document that has the correct ID
        if (doc.id === uid) continue;
        
        console.log(`🔄 Fixing document at path: ${doc.path}`);
        
        // If this document has admin = true but main document doesn't
        if (doc.data.isAdmin === true && !results.documentWithId.isAdmin) {
          // 1. Make sure the correct document exists
          if (!hasCorrectDoc) {
            // Create the correct document with admin = true
            await userDocRef.set({
              ...doc.data,
              isAdmin: true,
              lastUpdated: new Date()
            });
            results.fixes.push(`Created correct document at users/${uid} with admin=true`);
          } else {
            // Update the correct document with admin = true
            await userDocRef.update({
              isAdmin: true,
              lastUpdated: new Date()
            });
            results.fixes.push(`Updated correct document at users/${uid} with admin=true`);
          }
        }
        
        // 2. Delete the incorrect document to prevent confusion
        await adminDb.doc(doc.path).delete();
        results.fixes.push(`Deleted incorrect document at ${doc.path}`);
      }
    }
    
    // If we made fixes, check the status again
    if (results.fixes.length > 0) {
      console.log('🔄 Rechecking status after fixes...');
      
      // Check the primary document again
      const updatedDoc = await userDocRef.get();
      results.finalStatus = {
        exists: updatedDoc.exists,
        isAdmin: updatedDoc.exists ? updatedDoc.data()?.isAdmin === true : false,
        data: updatedDoc.exists ? updatedDoc.data() : null
      };
    }
    
    console.log('✅ User document cleanup completed');
    
    return NextResponse.json({
      success: true,
      uid,
      results
    });
  } catch (error: any) {
    console.error('❌ Error in user cleanup API:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clean up user documents',
      errorDetails: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 