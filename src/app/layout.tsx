import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import AuthWrapper from '@/components/AuthWrapper';

import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
        
      </head>
      <body className="bg-dark-bg text-white min-h-screen">
        <AuthWrapper>
          {children}
        </AuthWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
} 