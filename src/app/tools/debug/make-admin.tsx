'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ClientMakeAdmin({ userId }: { userId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to make the user an admin using client-side Firestore
  const makeAdmin = async () => {
    if (!userId) {
      setError('No user ID provided');
      return;
    }
    
    setIsProcessing(true);
    setResult(null);
    setError(null);
    
    try {
      console.log('Making user admin via client-side Firestore:', userId);
      
      // Get a reference to the user document
      const userRef = doc(db, 'users', userId);
      
      // Update the user document
      await updateDoc(userRef, {
        isAdmin: true,
        lastUpdated: new Date()
      });
      
      setResult(`User ${userId} is now an admin! Please refresh the page.`);
    } catch (err: any) {
      console.error('Error making user admin:', err);
      setError(err?.message || 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={makeAdmin}
        disabled={isProcessing}
        className="px-4 py-2 bg-gradient-to-b from-green-500 to-green-700 text-white font-bold rounded-md hover:shadow-lg hover:shadow-green-500/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isProcessing ? 'Processing...' : 'Make Admin (Client-side)'}
      </button>
      
      {result && (
        <div className="mt-2 p-3 bg-green-900/50 border border-green-500 rounded text-green-400">
          {result}
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-3 bg-red-900/50 border border-red-500 rounded text-red-400">
          Error: {error}
        </div>
      )}
    </div>
  );
} 