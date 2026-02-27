// Cookie consent utility functions

const CRUMBLESS_WEBSITE_ID = 'cmm45ng3m0001jjfg492z96gz';
const CRUMBLESS_SCRIPT_SRC = 'https://www.crumbless.io/tracker.js';
const CRUMBLESS_PROXY_HOST = '/api/crumbless/collect';

/**
 * Inject Crumbless analytics script when consent is given (idempotent).
 */
export const loadCrumblessScript = (): void => {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[data-website-id="${CRUMBLESS_WEBSITE_ID}"]`)) return;
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.websiteId = CRUMBLESS_WEBSITE_ID;
  script.dataset.host = CRUMBLESS_PROXY_HOST;
  script.src = CRUMBLESS_SCRIPT_SRC;
  document.head.appendChild(script);
};

/**
 * Get whether analytics (Crumbless) is allowed.
 * Defaults to true when not set; only false when user has explicitly disabled in privacy settings.
 */
export const getCookieConsent = (): boolean => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('cookieConsent');
  return stored !== 'false';
};

/**
 * Set cookie consent status
 * @param accepted - Whether cookies are accepted
 */
export const setCookieConsent = (accepted: boolean): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('cookieConsent', accepted ? 'true' : 'false');
  
  if (accepted) {
    loadCrumblessScript();
  }
};

/**
 * Set granular cookie consent settings
 * @param settings - Granular cookie settings
 */
export const setGranularCookieConsent = (settings: {
  analytics?: boolean;
}): void => {
  if (typeof window === 'undefined') return;
  // Crumbless respects main cookie consent; no separate gtag consent needed
  if (settings.analytics && getCookieConsent()) {
    loadCrumblessScript();
  }
};

/**
 * Clear all cookie consent settings
 */
export const clearCookieConsent = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cookieConsent');
}; 