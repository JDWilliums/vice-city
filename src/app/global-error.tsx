'use client';

import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-sm border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h1 className="text-2xl font-bold text-white mb-4">Application Error</h1>
            <p className="text-gray-300 mb-6">
              A critical error has occurred. We're sorry for the inconvenience.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-gta-pink text-white font-bold rounded-md hover:bg-pink-600 transition-colors"
            >
              Try again
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 text-left p-4 bg-gray-800 rounded-lg overflow-auto max-h-48">
                <p className="text-red-400 font-mono text-sm">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-gray-400 mt-2 overflow-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
} 