'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminBadge from '@/components/common/AdminBadge';

export default function ToolsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [serverVerified, setServerVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Verify admin status on the server-side as well
  useEffect(() => {
    async function verifyAdminServer() {
      if (!user) return;
      
      console.log('Client-side isAdmin status:', isAdmin);
      
      try {
        console.log('Fetching /api/admin/check endpoint...');
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        
        console.log('Server response:', data);
        setDebugInfo(data);
        
        if (!data.isAdmin) {
          // Not an admin according to server verification
          console.log('Server verification failed: not an admin');
          setError(`Access denied: Your account does not have admin privileges.`);
          return;
        }
        
        console.log('Server verified admin status successfully');
        setServerVerified(true);
      } catch (error: any) {
        console.error('Error verifying admin status:', error);
        setError(`Error verifying admin status: ${error?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
    
    if (user && isAdmin) {
      verifyAdminServer();
    } else {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Render the access denied page for non-admins
  if (!loading && (!user || !isAdmin || error)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="max-w-lg w-full p-8 bg-gray-900/80 backdrop-blur-md rounded-lg border border-gray-800 text-center">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-900/30 border-2 border-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            
            {!user ? (
              <>
                <p className="text-gray-300 mb-6">Please log in to access this area.</p>
                <Link href="/login" className="px-6 py-2 bg-gta-blue text-white rounded hover:bg-blue-600 transition-colors inline-block">
                  Log In
                </Link>
              </>
            ) : !isAdmin ? (
              <>
                <p className="text-gray-300 mb-6">This area is restricted to administrators only.</p>
                <Link href="/" className="px-6 py-2 bg-gta-blue text-white rounded hover:bg-blue-600 transition-colors inline-block">
                  Return to Home
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-6">{error || "There was an error verifying your admin status."}</p>
                <div className="flex gap-4 justify-center">
                  <Link href="/" className="px-6 py-2 bg-gta-blue text-white rounded hover:bg-blue-600 transition-colors inline-block">
                    Return to Home
                  </Link>
                  <Link href="/tools/debug" className="px-6 py-2 bg-gta-pink text-white rounded hover:bg-pink-600 transition-colors inline-block">
                    Debug Admin Status
                  </Link>
                </div>
                {debugInfo && (
                  <div className="mt-6 text-xs text-left bg-gray-800 p-3 rounded overflow-auto max-h-48">
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading while checking auth
  if (loading || !serverVerified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white text-center">
            <div className="inline-block w-16 h-16 border-4 border-gta-pink border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Verifying admin access...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Tools</h1>
          <AdminBadge className="w-6 h-6" />
        </div>
        
        <div className="grid grid-rows-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wiki Management */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-gta-pink transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">Wiki Management</h2>
            <p className="text-gray-400 mb-4">Create, edit, and manage wiki content.</p>
            <Link href="/admin/wiki" className="px-4 py-2 bg-gta-pink text-white rounded hover:bg-pink-600 transition-colors inline-block">
              Manage Wiki
            </Link>
          </div>
          
          
          
        

          {/* News Management */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-gta-blue transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">News Management</h2>
            <p className="text-gray-400 mb-4">Create, edit, and manage news content.</p>
            <Link href="/admin/news" className="px-4 py-2 bg-gta-pink text-white rounded hover:bg-pink-600 transition-colors inline-block">
              Manage News
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 