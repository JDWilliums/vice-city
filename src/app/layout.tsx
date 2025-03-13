import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GTA 6 Map & Wiki',
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
      <body className={`${inter.variable} font-sans bg-dark-bg text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
} 