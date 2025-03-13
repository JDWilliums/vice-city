import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define protected routes that require admin access
  const protectedRoutes = ['/tools'];
  
  // Check if the current path is a protected route or starts with a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // If not a protected route, proceed normally
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  
  // If no session cookie, redirect to login
  if (!sessionCookie) {
    return redirectToLogin(request);
  }
  
  // Instead of trying to verify admin status in middleware (which would be complex),
  // we'll let the page handle the verification but provide a clean fallback
  // Add a custom header to indicate we've checked the route protection
  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  
  return response;
}

// Helper function to redirect to login
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Required for protected routes
    '/tools/:path*',
    
    // Exclude all static paths
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 