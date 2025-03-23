import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import AuthWrapper from '@/components/AuthWrapper';
import Script from 'next/script';

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
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-L0E1TVCKP7"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L0E1TVCKP7');
            `,
          }}
        />
      </head>
      <body className="bg-dark-bg text-white min-h-screen">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
} 