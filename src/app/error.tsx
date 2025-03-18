'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-black/60 backdrop-blur-sm border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h1 className="text-2xl font-bold text-white mb-4">Something went wrong!</h1>
        <p className="text-gray-300 mb-6">
          We're sorry, but we encountered an error while processing your request.
        </p>
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-gta-pink text-white font-bold rounded-md hover:bg-pink-600 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600 transition-colors"
          >
            Go home
          </Link>
        </div>
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
  );
} 