'use client';

import { randomBytes } from 'crypto';

// Constants
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a secure random CSRF token
 */
export function generateCsrfToken(): string {
  // Use browser crypto API in the client
  if (typeof window !== 'undefined') {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback to Node.js crypto for SSR
  try {
    return randomBytes(32).toString('hex');
  } catch (error) {
    console.error('Failed to generate CSRF token:', error);
    // Fallback to a timestamp-based token if all else fails
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

/**
 * Set the CSRF token cookie and return the token for use in headers
 */
export function setCsrfTokenCookie(): string {
  const token = generateCsrfToken();
  
  // Set as cookie with HttpOnly and appropriate SameSite
  document.cookie = `${CSRF_COOKIE_NAME}=${token}; path=/; max-age=86400; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  
  return token;
}

/**
 * Get the current CSRF token from cookie
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

/**
 * Add CSRF token to a fetch request
 */
export function addCsrfToken(options: RequestInit = {}): RequestInit {
  // Get existing token or create a new one
  let token = getCsrfTokenFromCookie();
  if (!token) {
    token = setCsrfTokenCookie();
  }
  
  // Set header
  const headers = new Headers(options.headers || {});
  headers.set(CSRF_HEADER_NAME, token);
  
  return {
    ...options,
    headers
  };
}

/**
 * Create a fetch function that automatically adds CSRF tokens
 */
export function createProtectedFetch(): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    // Only add token for same-origin requests and for methods that modify state
    const modifyingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const method = init?.method?.toUpperCase() || 'GET';
    
    if (modifyingMethods.includes(method)) {
      return fetch(input, addCsrfToken(init));
    }
    
    return fetch(input, init);
  };
}

// Export a configured fetch that automatically adds CSRF protection
export const protectedFetch = createProtectedFetch(); 