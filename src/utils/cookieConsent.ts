// Cookie consent utility functions

/**
 * Get the current cookie consent status
 * @returns boolean - true if cookies are accepted, false otherwise
 */
export const getCookieConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cookieConsent') === 'true';
};

/**
 * Set cookie consent status
 * @param accepted - Whether cookies are accepted
 */
export const setCookieConsent = (accepted: boolean): void => {
  if (typeof window === 'undefined') return;
  
  // Save to localStorage
  localStorage.setItem('cookieConsent', accepted ? 'true' : 'false');
  
  // Update Google Tag Manager consent
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'ad_storage': accepted ? 'granted' : 'denied',
      'analytics_storage': accepted ? 'granted' : 'denied'
    });
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
  
  // Update Google Tag Manager consent with granular settings
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': settings.analytics ? 'granted' : 'denied',
    });
  }
};

/**
 * Clear all cookie consent settings
 */
export const clearCookieConsent = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('cookieConsent');
  
  // Update Google Tag Manager consent to denied state
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied'
    });
  }
}; 