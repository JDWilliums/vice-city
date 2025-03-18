'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminWikiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Wiki error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-16 mt-16">
        <div className="bg-black/60 backdrop-blur-sm border border-red-500 rounded-lg p-8 max-w-2xl mx-auto">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h1 className="text-2xl font-bold text-white mb-4">Wiki Admin Error</h1>
            <p className="text-gray-300 mb-6">
              There was an error in the Wiki Admin Dashboard. This might be due to missing data or an issue with permissions.
            </p>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-3 bg-gta-pink text-white font-bold rounded-md hover:bg-pink-600 transition-colors"
              >
                Try again
              </button>
              <Link
                href="/admin"
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600 transition-colors"
              >
                Admin Dashboard
              </Link>
              <Link
                href="/wiki"
                className="px-6 py-3 bg-gta-blue text-white font-bold rounded-md hover:bg-blue-600 transition-colors"
              >
                View Wiki
              </Link>
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg overflow-auto max-h-48">
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
      </main>
      
      <Footer />
    </div>
  );
} 