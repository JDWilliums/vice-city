'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fixBadgeColors } from '@/lib/fixBadgeColors';

export default function FixBadgesPage() {
  const { user, isAdmin } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);

  const handleRunFix = async () => {
    if (!isAdmin) {
      setResult({ success: false, error: 'Only admins can run this function' });
      return;
    }

    try {
      setIsRunning(true);
      setResult(null);
      
      const fixResult = await fixBadgeColors();
      setResult(fixResult);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-gta-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Fix Badge Colors
            </h1>
            
            <div className="mb-8">
              <p className="text-gray-300 mb-4">
                This utility will fix missing badge colors in the wiki page details. It will:
              </p>
              
              <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
                <li>Find all wiki pages with badge details that have missing colors</li>
                <li>Update "Status" badges to use appropriate colors based on their values</li>
                <li>Default to blue color for other badges with missing colors</li>
              </ul>
              
              {!isAdmin && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6">
                  <strong>Admin Access Required</strong>: You need to be an admin to run this function.
                </div>
              )}
              
              <button
                onClick={handleRunFix}
                disabled={isRunning || !isAdmin}
                className={`px-5 py-3 rounded-lg font-medium flex items-center ${
                  isAdmin 
                    ? 'bg-gta-blue hover:bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fixing Badge Colors...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Run Badge Color Fix
                  </>
                )}
              </button>
            </div>
            
            {result && (
              <div className={`rounded-lg p-4 mb-4 ${
                result.success ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'
              }`}>
                {result.success ? (
                  <div>
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Badge Fix Completed
                    </h3>
                    <p>Successfully updated badge colors on {result.count} wiki pages.</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Error
                    </h3>
                    <p>{result.error}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Badge Color Assignment Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-700/50 p-4">
                  <h4 className="font-medium text-white mb-2">Status Values → Green</h4>
                  <ul className="text-gray-300 text-sm list-disc pl-5">
                    <li>Alive</li>
                    <li>Active</li>
                    <li>Available</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-gray-700/50 p-4">
                  <h4 className="font-medium text-white mb-2">Status Values → Red</h4>
                  <ul className="text-gray-300 text-sm list-disc pl-5">
                    <li>Dead</li>
                    <li>Inactive</li>
                    <li>Wanted</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-gray-700/50 p-4">
                  <h4 className="font-medium text-white mb-2">Status Values → Yellow</h4>
                  <ul className="text-gray-300 text-sm list-disc pl-5">
                    <li>Missing</li>
                    <li>Unknown</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-gray-700/50 p-4">
                  <h4 className="font-medium text-white mb-2">Default</h4>
                  <ul className="text-gray-300 text-sm list-disc pl-5">
                    <li>All other badge types use blue</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 