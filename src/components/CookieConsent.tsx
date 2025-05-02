'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCookieConsent, setCookieConsent } from '@/utils/cookieConsent';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on privacy settings page
    if (pathname === '/privacy-settings') {
      return;
    }
    
    // Check if user has already accepted cookies
    const consentAccepted = getCookieConsent();
    if (consentAccepted === false && localStorage.getItem('cookieConsent') === null) {
      setShowConsent(true);
    }
  }, [pathname]);

  const acceptCookies = () => {
    setCookieConsent(true);
    setShowConsent(false);
  };

  const declineCookies = () => {
    setCookieConsent(false);
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 border-t border-[#ff6b00] p-4 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm md:text-base">
          <p>
            This website uses cookies to enhance your experience and analyze our traffic. 
            By clicking "Accept", you consent to our use of cookies. 
            <Link href="/privacy" className="text-[#ff6b00] hover:underline ml-1">
              Learn more
            </Link>
            {' or '}
            <Link href="/privacy-settings" className="text-[#ff6b00] hover:underline">
              manage your preferences
            </Link>.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={declineCookies}
            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 text-sm bg-[#ff6b00] text-white rounded hover:bg-[#e05f00] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
} 