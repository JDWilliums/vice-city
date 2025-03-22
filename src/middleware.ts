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
  
  // Only check for protection on admin routes for better performance
  if (isProtectedRoute(path, ADMIN_ROUTES)) {
    const session = request.cookies.get('session')?.value;
    const adminSession = request.cookies.get('admin-session')?.value;
    
    // Quick check for both required cookies, no additional verification
    if (!session || !adminSession) {
      // Redirect to login page with return URL
      // Use a response object to avoid edge function timeouts
      const response = NextResponse.redirect(new URL('/login', request.url));
      
      // Add a marker to indicate this was a middleware redirect
      // This helps the login page avoid unnecessary operations
      response.cookies.set('middleware_redirect', 'true', { 
        maxAge: 60, // Short-lived cookie (1 minute)
        path: '/'
      });
      
      return response;
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