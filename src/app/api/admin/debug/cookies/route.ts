export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    const cookieNames = allCookies.map(cookie => cookie.name);
    
    // Check for session cookie
    const sessionCookie = cookieStore.get('session');
    
    return NextResponse.json({
      hasSessionCookie: !!sessionCookie,
      sessionCookieValue: sessionCookie ? '[REDACTED]' : null,
      cookieCount: allCookies.length,
      cookieNames: cookieNames,
    });
  } catch (error: any) {
    console.error('Error checking cookies:', error);
    return NextResponse.json({ 
      error: 'Failed to get cookie information',
      errorDetails: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 