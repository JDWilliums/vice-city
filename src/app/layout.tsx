import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import AuthWrapper from '@/components/AuthWrapper';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ErrorBoundary } from 'react-error-boundary';
import CookieConsent from '@/components/CookieConsent';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Simple fallback for analytics components
const AnalyticsFallback = () => {
  // Silent failure - no UI impact
  return null;
};

export const metadata: Metadata = {
  title: 'GTA 6 Countdown | vice.city',
  description: 'The ultimate resource for Grand Theft Auto 6 with an interactive map and comprehensive wiki.',
  icons: {
    icon: '/images/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </head>
      <body className="bg-dark-bg text-white min-h-screen">
        <AuthWrapper>
          {children}
        </AuthWrapper>
        <ErrorBoundary fallback={<AnalyticsFallback />}>
          <SpeedInsights />
        </ErrorBoundary>
        <Suspense fallback={null}>
          <CookieConsent />
        </Suspense>
      </body>
    </html>
  );
} 