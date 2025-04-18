'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { pageview } from '@/utils/analytics';

// Client component that handles tracking
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      // Only track pageviews if consent is given
      const consentStatus = localStorage.getItem('cookieConsent');
      if (consentStatus === 'true') {
        // Create URL with search params if they exist
        const url = searchParams.size > 0 
          ? `${pathname}?${searchParams.toString()}` 
          : pathname;
          
        // Send pageview with full URL
        pageview(url);
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  return (
    <>
      {/* Google Analytics Scripts with consent mode */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-L0E1TVCKP7`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Default to denied until consent is given
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'analytics_storage': 'denied',
              'wait_for_update': 500
            });
            
            // Check if consent was previously given
            const consentStatus = localStorage.getItem('cookieConsent');
            if (consentStatus === 'true') {
              gtag('consent', 'update', {
                'ad_storage': 'granted',
                'analytics_storage': 'granted'
              });
            }
            
            gtag('config', 'G-L0E1TVCKP7');
          `,
        }}
      />
      <PageViewTracker />
    </>
  );
} 