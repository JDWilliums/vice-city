import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminInitStatus } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Firebase Admin debug endpoint called');
    
    // Get initialization status
    const initStatus = getFirebaseAdminInitStatus();
    
    // Log detailed information for server-side debugging
    console.log('Firebase Admin SDK initialization status:', {
      isInitialized: initStatus.isInitialized ? 'Yes' : 'No',
      hasError: initStatus.hasError ? 'Yes' : 'No',
      errorMessage: initStatus.errorMessage || 'None',
      appInitialized: initStatus.appInitialized ? 'Yes' : 'No',
      authInitialized: initStatus.authInitialized ? 'Yes' : 'No',
      dbInitialized: initStatus.dbInitialized ? 'Yes' : 'No',
    });
    
    console.log('Environment variables status:', initStatus.envStatus);
    
    // Try to initialize the Admin Auth directly
    try {
      const { getAdminAuth } = await import('@/lib/firebase-admin');
      const auth = getAdminAuth();
      console.log('Successfully got Admin Auth instance:', !!auth);
    } catch (authError) {
      console.error('Error getting Admin Auth instance:', authError);
    }
    
    // Return the status
    return NextResponse.json({
      status: 'success',
      initStatus: {
        ...initStatus,
        // Don't return actual environment variable values for security
        envStatus: {
          projectId: initStatus.envStatus.projectId ? 'set' : 'not set',
          clientEmail: initStatus.envStatus.clientEmail ? 'set' : 'not set',
          privateKey: initStatus.envStatus.privateKey ? 'set' : 'not set',
          privateKeyFormat: initStatus.envStatus.privateKeyFormat
            ? {
                hasBeginMarker: initStatus.envStatus.privateKeyFormat.hasBeginMarker,
                hasEndMarker: initStatus.envStatus.privateKeyFormat.hasEndMarker,
                length: initStatus.envStatus.privateKeyFormat.length,
              }
            : null
        }
      }
    });
  } catch (error: any) {
    console.error('Error in Firebase Admin debug endpoint:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
} 