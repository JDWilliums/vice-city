'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Declare global gtag function
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = 'G-L0E1TVCKP7';
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (pathname && window.gtag) {
      // Send page view with path
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      });
    }

    // Add testGA to window for testing
    if (typeof window !== 'undefined') {
      window.testGA = () => {
        console.log('Testing GA event...');
        window.gtag('event', 'test_event', {
          'event_category': 'testing',
          'event_label': 'GA Test',
          'value': 1
        });
        console.log('Test event sent to GA');
        return 'GA test event fired. Check Real-Time events in GA dashboard.';
      };
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);
  
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
} 

// Extend window interface to include test function
declare global {
  interface Window {
    testGA: () => string;
  }
} 