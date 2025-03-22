export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { validateApiRequest, secureJsonResponse, handleApiError } from '@/lib/apiSecurity';

// Response time padding to mitigate timing attacks
const MIN_RESPONSE_TIME_MS = 500;

export async function GET(request: NextRequest) {
  console.log('🔍 DIRECT ADMIN CHECK API called');
  const startTime = Date.now();
  
  try {
    // Validate the request
    const validationResponse = validateApiRequest(request, {
      // For GET requests, CSRF is not strictly required but we check it anyway
      requireCsrf: true,
      // Apply rate limiting
      checkRateLimit: true,
      rateLimitOptions: {
        // More strict rate limiting for admin checks
        maxRequests: 30,
        windowMs: 5 * 60 * 1000, // 5 minutes
      },
    });
    
    if (validationResponse) {
      return validationResponse;
    }
    
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    const adminSessionCookie = cookies().get('admin-session')?.value;
    
    if (!sessionCookie || !adminSessionCookie) {
      console.log('❌ Missing required cookies');
      
      // Apply minimum response time to prevent timing attacks
      await applyMinimumResponseTime(startTime);
      
      return secureJsonResponse({ 
        isAdmin: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }
    
    // Validate session cookie format
    const sessionSchema = z.string().min(20);
    try {
      sessionSchema.parse(sessionCookie);
    } catch (error) {
      console.log('❌ Invalid session cookie format');
      
      // Apply minimum response time
      await applyMinimumResponseTime(startTime);
      
      return secureJsonResponse({ 
        isAdmin: false, 
        error: 'Invalid session format' 
      }, { status: 401 });
    }
    
    console.log('✅ Session cookie found, length:', sessionCookie.length);
    
    // Import the admin SDK at runtime
    const { getAdminAuth, getAdminDb } = await import('@/lib/firebase-admin');
    
    // Get the admin auth and db instances
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    console.log('✅ Got Admin SDK instances');
    
    // Verify the session
    console.log('🔑 Verifying token...');
    const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
    const uid = decodedToken.uid;
    
    // Verify session is not too old (within 1 hour)
    const tokenIssuedAt = decodedToken.iat ? decodedToken.iat * 1000 : 0;
    const tokenAge = Date.now() - tokenIssuedAt;
    const MAX_TOKEN_AGE = 3600 * 1000; // 1 hour in milliseconds
    
    if (tokenAge > MAX_TOKEN_AGE) {
      console.log('❌ Token too old, issued at:', new Date(tokenIssuedAt));
      
      // Apply minimum response time
      await applyMinimumResponseTime(startTime);
      
      return secureJsonResponse({ 
        isAdmin: false, 
        error: 'Session expired',
        tokenAge: Math.floor(tokenAge / 1000),
        maxAge: MAX_TOKEN_AGE / 1000,
      }, { status: 401 });
    }
    
    console.log('✅ Token verified for UID:', uid);
    
    // DIRECT CHECK using admin SDK - bypassing userService
    console.log('🔍 Directly checking admin status in Firestore...');
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found');
      
      // Apply minimum response time
      await applyMinimumResponseTime(startTime);
      
      return secureJsonResponse({ 
        isAdmin: false, 
        uid,
        verified: true, 
        error: 'User document not found',
        userDocExists: false
      });
    }
    
    // Get the user data
    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;
    
    console.log('📊 Admin status directly from Firestore:', isAdmin);
    
    // Apply minimum response time to prevent timing attacks
    await applyMinimumResponseTime(startTime);
    
    return secureJsonResponse({
      isAdmin,
      uid,
      verified: true,
      userDocExists: true,
    });
  } catch (error: any) {
    console.error('❌ Error checking admin status:', error);
    
    // Apply minimum response time
    await applyMinimumResponseTime(startTime);
    
    // Use our error handler with detailed info in non-production
    return handleApiError(error);
  }
}

// Helper function to ensure minimum response time
async function applyMinimumResponseTime(startTime: number): Promise<void> {
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_RESPONSE_TIME_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_RESPONSE_TIME_MS - elapsed));
  }
} 