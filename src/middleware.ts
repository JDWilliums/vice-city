import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will only run on server-side
export async function middleware(request: NextRequest) {
  // Only run on /tools routes
  if (!request.nextUrl.pathname.startsWith('/tools')) {
    return NextResponse.next();
  }

  try {
    // Get the token from the cookie
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      // No session found, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Since middleware can't use Firebase Admin SDK directly due to Edge Runtime,
    // we'll check admin status in the tools page component itself.
    // For now, just verify there's a session token.
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/tools/:path*',
}; 