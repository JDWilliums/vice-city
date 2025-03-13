'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FirestoreViewer({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data from Firestore
  useEffect(() => {
    async function loadUserData() {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading user data from Firestore:', userId);
        
        // Get the user document
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log('User data loaded:', data);
          setUserData(data);
        } else {
          setError(`User document not found for ID: ${userId}`);
        }
      } catch (err: any) {
        console.error('Error loading user data:', err);
        setError(err?.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [userId]);

  // Function to refresh the data
  const refreshData = () => {
    setLoading(true);
    setUserData(null);
    
    // Re-run the effect
    const userRef = doc(db, 'users', userId);
    getDoc(userRef)
      .then((snap) => {
        if (snap.exists()) {
          setUserData(snap.data());
        } else {
          setError(`User document not found for ID: ${userId}`);
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to refresh data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="mt-6 bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Live Firestore Data</h2>
        <button
          onClick={refreshData}
          disabled={loading}
          className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-10 h-10 border-2 border-gta-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-400">
          Error: {error}
        </div>
      ) : userData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">User ID</p>
              <p className="text-white font-mono break-all">{userData.uid}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white font-mono">{userData.email || 'Not set'}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Display Name</p>
              <p className="text-white font-mono">{userData.displayName || 'Not set'}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Is Admin</p>
              <p className={`font-mono ${userData.isAdmin ? 'text-green-400' : 'text-red-400'}`}>
                {userData.isAdmin ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-400 text-sm">Raw Document Data</p>
            <pre className="text-xs bg-gray-800 p-3 rounded overflow-auto max-h-60 text-white mt-1">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">No user data available</div>
      )}
    </div>
  );
} 