'use client';

import { useState, useEffect } from 'react';
import { checkFirestoreConnectivity } from '@/lib/wikiFirestoreService';

export default function FirestoreDiagnostic() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkFirestoreStatus();
  }, []);

  const checkFirestoreStatus = async () => {
    try {
      setIsChecking(true);
      setStatus('checking');
      
      const result = await checkFirestoreConnectivity();
      
      if (result.available) {
        setStatus('connected');
        setError(null);
      } else {
        setStatus('error');
        setError(result.error || 'Unknown error connecting to Firestore');
      }
    } catch (error) {
      setStatus('error');
      setError(error instanceof Error ? error.message : 'Unknown error checking Firestore connectivity');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="rounded-lg bg-gray-800 p-4 border border-gray-700 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-white">Firestore Connectivity</h3>
        <button
          onClick={checkFirestoreStatus}
          disabled={isChecking}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check Again'}
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        {status === 'checking' ? (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-300">Checking Firestore connection...</span>
          </div>
        ) : status === 'connected' ? (
          <div className="flex items-center">
            <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-400">Firestore connected</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="h-4 w-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-400">Firestore connection issue</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-300 text-sm">
          <div className="font-semibold mb-1">Error:</div>
          <div className="font-mono text-xs">{error}</div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4">
          <p className="text-gray-300 text-sm mb-2">Possible solutions:</p>
          <ul className="list-disc list-inside text-gray-400 text-xs space-y-1">
            <li>Check if the Firebase environment variables are properly set</li>
            <li>Make sure your Firestore database exists and is accessible</li>
            <li>Check if your network connection is stable</li>
            <li>Ensure your Firebase project has Firestore enabled</li>
          </ul>
        </div>
      )}
    </div>
  );
} 