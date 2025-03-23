export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import logger from '@/utils/logger';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export async function GET(request: NextRequest) {
  try {
    logger.debug('Token debug API called');
    
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      logger.debug('No session cookie found');
      
      // Check all cookies
      const allCookies = cookies().getAll();
      logger.debug('All cookies found:', allCookies.map(c => c.name).join(', '));
      
      return NextResponse.json({ 
        verified: false, 
        error: 'No session cookie found',
        cookiesFound: allCookies.map(c => c.name)
      }, { status: 401 });
    }
    
    logger.debug('Session cookie found, length:', sessionCookie.length);
    logger.debug('Token preview:', 
      sessionCookie.substring(0, 10) + '...' + sessionCookie.substring(sessionCookie.length - 10));
    
    // Check token format
    const hasValidFormat = sessionCookie.startsWith('ey') && sessionCookie.split('.').length === 3;
    logger.debug('Token has valid JWT format:', hasValidFormat);
    
    if (!hasValidFormat) {
      return NextResponse.json({
        verified: false,
        error: 'Invalid token format - not a valid JWT',
        tokenPreview: sessionCookie.length > 20 
          ? `${sessionCookie.substring(0, 10)}...${sessionCookie.substring(sessionCookie.length - 10)}`
          : sessionCookie,
        details: {
          length: sessionCookie.length,
          startsWithEy: sessionCookie.startsWith('ey'),
          hasTwoDots: sessionCookie.split('.').length === 3
        }
      }, { status: 401 });
    }
    
    try {
      // Import and initialize Firebase Admin at runtime
      const { getAdminAuth, getFirebaseAdminInitStatus } = await import('@/lib/firebase-admin');
      
      // Log initialization status before attempting to get the auth instance
      const initStatusBefore = getFirebaseAdminInitStatus();
      logger.debug('Firebase Admin SDK status before getting auth:', {
        isInitialized: initStatusBefore.isInitialized,
        hasError: initStatusBefore.hasError,
        errorMessage: initStatusBefore.errorMessage || 'None'
      });
      
      const adminAuth = getAdminAuth();
      logger.debug('Firebase Admin Auth initialized successfully');
      
      // Try to verify the token
      logger.debug('Attempting to verify token...');
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie);
      logger.debug('Token verified successfully for UID:', decodedToken.uid);
      
      // Success!
      return NextResponse.json({
        verified: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        tokenDetails: {
          issuer: decodedToken.iss,
          subject: decodedToken.sub,
          audience: decodedToken.aud,
          expirationTime: new Date(decodedToken.exp * 1000).toISOString(),
          issuedAt: new Date(decodedToken.iat * 1000).toISOString(),
          expiresInSeconds: decodedToken.exp - Math.floor(Date.now() / 1000),
          authTime: decodedToken.auth_time ? new Date(decodedToken.auth_time * 1000).toISOString() : 'Not available'
        }
      });
    } catch (tokenError: any) {
      logger.error('Token verification failed:', tokenError);
      
      // Log initialization status for debugging
      try {
        const { getFirebaseAdminInitStatus } = await import('@/lib/firebase-admin');
        const initStatus = getFirebaseAdminInitStatus();
        logger.error('Firebase Admin SDK status after error:', {
          isInitialized: initStatus.isInitialized,
          hasError: initStatus.hasError,
          errorMessage: initStatus.errorMessage
        });
      } catch (statusError) {
        logger.error('Error getting Firebase Admin status:', statusError);
      }
      
      // Try to decode the payload portion manually to provide more debug info
      try {
        const parts = sessionCookie.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          logger.debug('Manual token payload decode:', payload);
          
          return NextResponse.json({
            verified: false,
            error: tokenError?.message || 'Unknown token verification error',
            tokenPreview: `${sessionCookie.substring(0, 10)}...${sessionCookie.substring(sessionCookie.length - 10)}`,
            manualDecode: {
              uid: payload.uid || 'Not found',
              email: payload.email || 'Not found',
              issuer: payload.iss || 'Not found',
              audience: payload.aud || 'Not found',
              expiry: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'Not found',
              issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'Not found',
              isExpired: payload.exp ? (payload.exp * 1000 < Date.now()) : 'Unknown'
            }
          }, { status: 401 });
        }
      } catch (decodeError) {
        logger.error('Manual payload decode failed:', decodeError);
      }
      
      return NextResponse.json({
        verified: false,
        error: tokenError?.message || 'Unknown token verification error',
        tokenPreview: sessionCookie.length > 20 
          ? `${sessionCookie.substring(0, 10)}...${sessionCookie.substring(sessionCookie.length - 10)}`
          : 'Token too short'
      }, { status: 401 });
    }
  } catch (error: any) {
    logger.error('Error in token debug endpoint:', error);
    return NextResponse.json({
      verified: false,
      error: 'Server error',
      details: error?.message || 'Unknown error',
    }, { status: 500 });
  }
} 