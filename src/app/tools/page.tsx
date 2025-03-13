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
          console.log('Server verification failed, redirecting to home');
          setError(`Server verification failed: ${data.error || 'Not an admin'}`);
          // Wait 3 seconds to show error before redirecting
          setTimeout(() => router.push('/'), 5000);
          return;
        }
        
        console.log('Server verified admin status successfully');
        setServerVerified(true);
      } catch (error: any) {
        console.error('Error verifying admin status:', error);
        setError(`API error: ${error?.message || 'Unknown error'}`);
        // Wait 3 seconds to show error before redirecting
        setTimeout(() => router.push('/'), 5000);
      } finally {
        setLoading(false);
      }
    }
    
    if (user && isAdmin) {
      verifyAdminServer();
    } else if (!loading) {
      router.push('/');
    }
  }, [user, isAdmin, router, loading]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    } else if (user && !isAdmin && !loading) {
      router.push('/');
    }
  }, [user, isAdmin, router, loading]);

  // Show loading while checking auth
  if (loading || !user || !isAdmin || !serverVerified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white text-center">
            <div className="inline-block w-16 h-16 border-4 border-gta-pink border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Verifying admin access...</p>
            
            {error && (
              <div className="mt-4 text-red-400 max-w-lg mx-auto p-4 bg-gray-900/60 backdrop-blur-sm border border-red-800 rounded-lg">
                <p className="font-bold mb-2">Error:</p>
                <p>{error}</p>
                {debugInfo && (
                  <div className="mt-4 text-xs text-left bg-gray-800 p-3 rounded overflow-auto max-h-48">
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                )}
                <p className="mt-4 text-sm">Redirecting in a few seconds...</p>
              </div>
            )}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wiki Management */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-gta-pink transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">Wiki Management</h2>
            <p className="text-gray-400 mb-4">Create, edit, and manage wiki content.</p>
            <Link href="/tools/wiki" className="px-4 py-2 bg-gta-pink text-white rounded hover:bg-pink-600 transition-colors inline-block">
              Manage Wiki
            </Link>
          </div>
          
          {/* User Management */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-gta-blue transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
            <p className="text-gray-400 mb-4">Manage users, roles, and permissions.</p>
            <Link href="/tools/users" className="px-4 py-2 bg-gta-blue text-white rounded hover:bg-blue-600 transition-colors inline-block">
              Manage Users
            </Link>
          </div>
          
          {/* Content Moderation */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-gta-green transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">Content Moderation</h2>
            <p className="text-gray-400 mb-4">Review and moderate user-generated content.</p>
            <Link href="/tools/moderation" className="px-4 py-2 bg-gta-green text-white rounded hover:bg-green-600 transition-colors inline-block">
              Moderate Content
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 