import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Constants
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// IP-based rate limiting (keep in memory for simplicity)
// In production, consider using Redis or other external store
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const ipLimits: Record<string, RateLimitEntry> = {};

// Default rate limit settings
const DEFAULT_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
};

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // In production, set stronger Content-Security-Policy
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com;"
    );
  }
  
  return response;
}

/**
 * Create a JSON response with security headers
 */
export function secureJsonResponse(data: any, options?: { status?: number }): NextResponse {
  const response = NextResponse.json(data, options);
  return applySecurityHeaders(response);
}

/**
 * Check if a request has valid CSRF token
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const csrfToken = request.headers.get(CSRF_HEADER_NAME);
  const csrfCookie = cookies().get(CSRF_COOKIE_NAME)?.value;
  
  return Boolean(csrfToken && csrfCookie && csrfToken === csrfCookie);
}

/**
 * Check if a request passes rate limiting
 */
export function checkRateLimit(
  request: NextRequest, 
  options?: Partial<typeof DEFAULT_RATE_LIMIT>
): { allowed: boolean; message?: string; resetTime?: number } {
  // Merge options with defaults
  const settings = {
    ...DEFAULT_RATE_LIMIT,
    ...options,
  };
  
  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // Initialize or reset if needed
  if (!ipLimits[ip] || ipLimits[ip].resetTime < now) {
    ipLimits[ip] = {
      count: 0, 
      resetTime: now + settings.windowMs,
    };
  }
  
  // Increment counter
  ipLimits[ip].count++;
  
  // Check if over limit
  if (ipLimits[ip].count > settings.maxRequests) {
    const resetTime = ipLimits[ip].resetTime;
    const waitTime = Math.ceil((resetTime - now) / 1000); // in seconds
    
    return {
      allowed: false,
      message: `Too many requests. Please try again after ${waitTime} seconds.`,
      resetTime,
    };
  }
  
  return { allowed: true };
}

/**
 * Validate a request with multiple security checks
 * Returns a response object if validation fails, null if passes
 */
export function validateApiRequest(
  request: NextRequest,
  options?: {
    requireCsrf?: boolean;
    checkRateLimit?: boolean;
    rateLimitOptions?: Partial<typeof DEFAULT_RATE_LIMIT>;
  }
): NextResponse | null {
  const {
    requireCsrf = true,
    checkRateLimit: shouldCheckRateLimit = true,
    rateLimitOptions,
  } = options || {};
  
  // 1. Check CSRF for modifying operations
  if (requireCsrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    if (!validateCsrfToken(request)) {
      return secureJsonResponse({
        error: 'Invalid CSRF token',
      }, { status: 403 });
    }
  }
  
  // 2. Check rate limiting
  if (shouldCheckRateLimit) {
    const rateLimitResult = checkRateLimit(request, rateLimitOptions);
    if (!rateLimitResult.allowed) {
      return secureJsonResponse({
        error: rateLimitResult.message,
      }, { status: 429 });
    }
  }
  
  // All checks passed
  return null;
}

/**
 * Enhanced error handler for API routes
 */
export function handleApiError(error: any): NextResponse {
  console.error('API error:', error);
  
  // Try to extract meaningful error info
  const message = error?.message || 'Internal server error';
  const status = error?.status || error?.statusCode || 500;
  
  return secureJsonResponse({
    error: message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: error?.stack } : {}),
  }, { status });
} 