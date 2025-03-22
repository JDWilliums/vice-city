'use client';

import { useAuth } from '@/lib/AuthContext';
import { useEffect, useState } from 'react';
import { setCsrfTokenCookie, protectedFetch } from '@/lib/csrfUtils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [serverVerified, setServerVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set up CSRF token and verify admin status
  useEffect(() => {
    // Set CSRF token cookie for protected requests
    setCsrfTokenCookie();
    
    // Verify admin status on the server-side
    async function verifyAdminServer() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Use the direct-check endpoint for verification
        const response = await protectedFetch('/api/admin/direct-check', {
          credentials: 'same-origin',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.isAdmin) {
          // Not an admin according to server verification
          setError(`Access denied: Your account does not have admin privileges.`);
          return;
        }
        
        setServerVerified(true);
      } catch (error: any) {
        setError(`Error verifying admin status: ${error?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) {
      if (user && isAdmin) {
        verifyAdminServer();
      } else {
        setLoading(false);
      }
    }
  }, [user, isAdmin, authLoading]);

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
                <p className="text-gray-300 mb-6">Please log in to access the admin area.</p>
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
                </div>
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

  // All checks passed, render admin layout with sidebar
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex">
        {/* Admin sidebar */}
        <AdminSidebar />
        
        {/* Main content */}
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
} 