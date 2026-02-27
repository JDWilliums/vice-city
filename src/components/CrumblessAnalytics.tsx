'use client';

import { useEffect } from 'react';
import { getCookieConsent, loadCrumblessScript } from '@/utils/cookieConsent';

export default function CrumblessAnalytics() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (getCookieConsent()) {
      loadCrumblessScript();
    }
  }, []);

  return null;
}
