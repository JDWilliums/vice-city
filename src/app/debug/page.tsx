'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [hasWindow, setHasWindow] = useState(false);
  const [time, setTime] = useState(new Date().toISOString());

  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true);
    setHasWindow(typeof window !== 'undefined');
    
    // Update time every second to show component is alive
    const interval = setInterval(() => {
      setTime(new Date().toISOString());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="bg-gray-900 p-4 mb-4 rounded">
        <h2 className="text-xl mb-2">Rendering:</h2>
        <p><strong>Is Client:</strong> {String(isClient)}</p>
        <p><strong>Has Window:</strong> {String(hasWindow)}</p>
        <p><strong>Current Time:</strong> {time}</p>
      </div>
      
      <div className="bg-gray-900 p-4 mb-4 rounded">
        <h2 className="text-xl mb-2">Auth State:</h2>
        <p><strong>Loading:</strong> {String(loading)}</p>
        <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
        {user && (
          <div className="mt-2">
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Display Name:</strong> {user.displayName}</p>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <a href="/" className="text-blue-400 hover:underline">Back to Home</a>
      </div>
    </div>
  );
} 