# Admin & Tools Security Documentation

This document outlines the security measures implemented to protect the `/admin` and `/tools` routes in the application.

## Security Layers

The admin and tools routes are protected by multiple layers of security:

### 1. Middleware Protection

The first line of defense is implemented in `src/middleware.ts`, which:

- Intercepts all requests to `/admin/*` and `/tools/*` routes
- Validates necessary authentication cookies (`session` and `admin-session`)
- Implements rate limiting to prevent brute force attacks
- Verifies CSRF tokens for state-changing operations (POST, PUT, DELETE, PATCH)
- Adds security headers to all responses
- Redirects unauthorized users to the login page

### 2. Client-Side Authentication Check

Even if the middleware protection is bypassed, each admin page has client-side protection:

- Uses `useAuth()` hook to verify the user is logged in and has admin privileges
- Shows access denied page for non-admins
- Provides appropriate messaging based on authentication status

### 3. Server-Side Verification

Admin routes make an additional server-side API call to verify admin status:

- Uses the `/api/admin/direct-check` endpoint
- Directly queries Firestore to verify admin status
- Implements fixed-time response mechanisms to prevent timing attacks
- Returns appropriate error messages for various failure conditions

### 4. CSRF Protection

All data-modifying operations are protected against Cross-Site Request Forgery (CSRF):

- Uses a double-submit cookie pattern
- Requires valid CSRF token in both cookie and header
- Automatically applies CSRF protection for POST, PUT, DELETE, and PATCH requests
- Implemented in `src/lib/csrfUtils.ts`

### 5. Higher-Order Component

Admin pages use a reusable HOC (`withAdminProtection`) that:

- Combines all protection mechanisms
- Provides consistent UI for access denied states
- Handles loading states during verification
- Can be applied to any page component that requires admin access

### 6. Rate Limiting

To prevent abuse:

- IP-based rate limiting is implemented
- Configurable time windows and request limits
- Appropriate retry headers are returned when limits are reached
- Memory-based implementation (consider Redis for production with multiple servers)

### 7. Security Headers

All responses include security headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restricts access to sensitive browser features
- Content-Security-Policy: defines allowed sources for scripts, styles, etc.

## Implementation Details

### Key Files

- `src/middleware.ts` - Edge middleware for route protection
- `src/lib/csrfUtils.ts` - CSRF token utilities
- `src/lib/apiSecurity.ts` - API security utilities
- `src/app/api/admin/direct-check/route.ts` - Admin status verification endpoint
- `src/components/hoc/withAdminProtection.tsx` - HOC for admin page protection
- `src/app/admin/layout.tsx` - Layout with protection for all admin pages
- `src/app/tools/page.tsx` - Example of a protected tools page

### Protection Flow

1. Request to admin route is intercepted by middleware
2. If authentication cookies are missing, redirect to login
3. If rate limiting is exceeded, return 429 status
4. If passed, request proceeds to the page
5. Client-side protection runs on component mount
6. Server-side verification is performed via API
7. User is shown appropriate UI based on verification results

## Best Practices Applied

- Defense in depth - multiple protection layers
- Principle of least privilege
- Rate limiting to prevent brute force attacks
- CSRF protection
- Security headers
- Server-side verification
- Client-side validation
- Consistent error handling
- Timing attack mitigation
- Secure cookie settings

## Future Improvements

- Implement JWTs with short expiration times
- Add two-factor authentication for admin users
- Implement IP-based suspicious activity detection
- Add audit logging for all admin operations
- Consider server-side rendering (SSR) for admin pages
- Use Redis for distributed rate limiting across multiple servers 