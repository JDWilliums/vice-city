import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes that require authentication and admin privileges
const ADMIN_ROUTES = [
  '/admin/wiki',
  '/admin/wiki/create',
  '/admin/wiki/edit',
  '/admin/wiki/revisions',
];

// Function to check if a route matches any of the protected patterns
function isProtectedRoute(path: string, protectedPatterns: string[]): boolean {
  return protectedPatterns.some(pattern => {
    // Exact match
    if (pattern === path) return true;
    
    // Pattern with trailing slash
    if (pattern.endsWith('/') && path.startsWith(pattern)) return true;
    
    // Path starting with pattern followed by slash or additional segments
    return path.startsWith(pattern + '/');
  });
}

// This function runs on every request
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = request.cookies.get('session')?.value;
  const adminSession = request.cookies.get('admin-session')?.value;
  
  // Only redirect for admin routes
  if (isProtectedRoute(path, ADMIN_ROUTES)) {
    // Check for admin session
    if (!session || !adminSession) {
      // Redirect to login page with return URL
      const url = new URL('/login', request.url);
      url.searchParams.set('returnUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific routes
export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    // Add other protected routes here
  ],
}; 