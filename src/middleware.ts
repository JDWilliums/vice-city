import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin routes that require authentication and admin privileges
const ADMIN_ROUTES = [
  '/admin',
  '/admin/wiki',
  '/admin/wiki/create',
  '/admin/wiki/edit',
  '/admin/wiki/revisions',
  '/admin/news',
  '/tools',
  '/tools/wiki-browser',
  '/tools/wiki-generator',
];

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 admin route requests per windowMs
  message: 'Too many requests from this IP, please try again later',
};

// Store for rate limiting (in-memory for simplicity, consider external store in production)
const ipRequests: Record<string, { count: number; resetTime: number }> = {};

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

// Check if the request is within rate limits
function checkRateLimit(request: NextRequest): { allowed: boolean; message?: string } {
  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // Initialize or reset if needed
  if (!ipRequests[ip] || ipRequests[ip].resetTime < now) {
    ipRequests[ip] = { count: 0, resetTime: now + RATE_LIMIT.windowMs };
  }
  
  // Increment count
  ipRequests[ip].count++;
  
  // Check if over limit
  if (ipRequests[ip].count > RATE_LIMIT.maxRequests) {
    return { allowed: false, message: RATE_LIMIT.message };
  }
  
  return { allowed: true };
}

// Verify CSRF token
function verifyCsrfToken(request: NextRequest): boolean {
  // For mutation operations (POST, PUT, DELETE, PATCH), verify CSRF token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.cookies.get('csrf-token')?.value;
    const csrfHeader = request.headers.get('x-csrf-token');
    
    // Both must exist and match
    if (!csrfToken || !csrfHeader || csrfToken !== csrfHeader) {
      return false;
    }
  }
  
  return true;
}

// This function runs on every request
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only check for protection on admin routes for better performance
  if (isProtectedRoute(path, ADMIN_ROUTES)) {
    // 1. Check rate limiting
    const rateLimitCheck = checkRateLimit(request);
    if (!rateLimitCheck.allowed) {
      return new NextResponse(JSON.stringify({ error: rateLimitCheck.message }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '900', // 15 minutes in seconds
        },
      });
    }
    
    // 2. Check CSRF protection for mutations
    if (!verifyCsrfToken(request)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 3. Check authentication
    const session = request.cookies.get('session')?.value;
    const adminSession = request.cookies.get('admin-session')?.value;
    
    // Verify both required cookies are present
    if (!session || !adminSession) {
      // Redirect to login page with return URL
      const url = new URL('/login', request.url);
      url.searchParams.set('returnUrl', request.nextUrl.pathname + request.nextUrl.search);
      
      const response = NextResponse.redirect(url);
      
      // Add a marker to indicate this was a middleware redirect
      response.cookies.set('middleware_redirect', 'true', { 
        maxAge: 60, // Short-lived cookie (1 minute)
        path: '/',
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return response;
    }
  }
  
  // Apply security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Set Content-Security-Policy in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com;"
    );
  }
  
  return response;
}

// Configure the middleware to run on specific routes
export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/tools/:path*',
    // Add API routes for admin operations
    '/api/admin/:path*',
  ],
}; 