'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientMakeAdmin from './make-admin';
import FirestoreViewer from './firestore-viewer';
import AdminFix from './admin-fix';
import Link from 'next/link';

export default function AdminDebugPage() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [adminCheckResponse, setAdminCheckResponse] = useState<any>(null);
  const [cookieInfo, setCookieInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isFixingLogin, setIsFixingLogin] = useState(false);
  const [isMakingAdmin, setIsMakingAdmin] = useState(false);
  
  // Fetch admin check API
  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) return;
      
      try {
        console.log('Debug: Fetching admin check...');
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        
        console.log('Debug: Admin check response:', data);
        setAdminCheckResponse(data);
      } catch (error: any) {
        console.error('Debug: Error fetching admin check:', error);
        setError(`API error: ${error?.message || 'Unknown error'}`);
      }
    }
    
    async function getUserProfile() {
      if (!user) return;
      
      try {
        console.log('Debug: Getting user data...');
        const response = await fetch('/api/admin/debug/user?uid=' + user.uid);
        const data = await response.json();
        
        console.log('Debug: User data response:', data);
        setUserInfo(data);
      } catch (error: any) {
        console.error('Debug: Error fetching user data:', error);
      }
    }
    
    async function getCookieInfo() {
      try {
        console.log('Debug: Getting cookie info...');
        const response = await fetch('/api/admin/debug/cookies');
        const data = await response.json();
        
        console.log('Debug: Cookie info response:', data);
        setCookieInfo(data);
      } catch (error: any) {
        console.error('Debug: Error fetching cookie info:', error);
      } finally {
        setLoading(false);
      }
    }
    
    async function testTokenVerification() {
      try {
        console.log('Debug: Testing token verification...');
        const response = await fetch('/api/admin/debug/token');
        const data = await response.json();
        
        console.log('Debug: Token verification response:', data);
        setTokenInfo(data);
      } catch (error: any) {
        console.error('Debug: Error testing token verification:', error);
      }
    }
    
    if (user) {
      checkAdminStatus();
      getUserProfile();
      getCookieInfo();
      testTokenVerification();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Function to force refresh the token and session
  const fixLoginSession = async () => {
    if (!user) {
      alert('You must be logged in to fix the session');
      return;
    }
    
    setIsFixingLogin(true);
    
    try {
      console.log('Attempting to fix login session...');
      
      // Force refresh the token
      const idToken = await user.getIdToken(true);
      console.log('Got fresh token, length:', idToken.length);
      
      // Send it to the server
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, uid: user.uid }),
      });
      
      const result = await response.json();
      console.log('Server response:', result);
      
      if (result.success) {
        alert('Session fixed successfully! Please refresh the page.');
      } else {
        alert('Failed to fix session: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fixing session:', error);
      alert('Error fixing session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsFixingLogin(false);
    }
  };

  // Function to make the current user an admin
  const makeUserAdmin = async () => {
    if (!user) {
      alert('You must be logged in to become an admin');
      return;
    }
    
    setIsMakingAdmin(true);
    
    try {
      console.log('Attempting to make user admin...');
      
      // Call the make-admin API
      const response = await fetch('/api/admin/make-admin');
      const result = await response.json();
      console.log('Server response:', result);
      
      if (result.success) {
        alert('You are now an admin! Please refresh the page to see the changes.');
      } else {
        alert('Failed to make you an admin: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      alert('Error making user admin: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsMakingAdmin(false);
    }
  };

  // Render the access denied page for non-admins
  if (!loading && (!user || !isAdmin)) {
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
            ) : (
              <>
                <p className="text-gray-300 mb-6">This area is restricted to administrators only.</p>
                <Link href="/" className="px-6 py-2 bg-gta-blue text-white rounded hover:bg-blue-600 transition-colors inline-block">
                  Return to Home
                </Link>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Debug Page</h1>
          <p className="text-gray-400 mt-2">This page helps diagnose admin verification issues</p>
          
          {user && (
            <>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={fixLoginSession}
                  disabled={isFixingLogin}
                  className="px-4 py-2 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg hover:shadow-gta-pink/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isFixingLogin ? 'Fixing Session...' : 'Fix Login Session'}
                </button>
                
                <button
                  onClick={makeUserAdmin}
                  disabled={isMakingAdmin}
                  className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold rounded-md hover:shadow-lg hover:shadow-blue-500/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isMakingAdmin ? 'Making Admin...' : 'Make Me Admin (Server-side)'}
                </button>
              </div>
              
              <ClientMakeAdmin userId={user.uid} />
            </>
          )}
          <p className="text-sm text-gray-400 mt-1">
            Try the client-side button if the server-side method isn't working
          </p>
        </div>
        
        {loading ? (
          <div className="text-white text-center py-12">
            <div className="inline-block w-16 h-16 border-4 border-gta-pink border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading debug information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client-side Auth Info */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Client Auth Status</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">User Authenticated</p>
                  <p className="text-white font-mono">{user ? 'Yes' : 'No'}</p>
                </div>
                
                {user && (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm">User ID</p>
                      <p className="text-white font-mono break-all">{user.uid}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-mono">{user.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Display Name</p>
                      <p className="text-white font-mono">{user.displayName || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">isAdmin (client state)</p>
                      <p className="text-white font-mono">{isAdmin ? 'Yes' : 'No'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Server Admin Check */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Server Admin Check</h2>
              
              {adminCheckResponse ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">isAdmin (server)</p>
                    <p className={`font-mono ${adminCheckResponse.isAdmin ? 'text-green-400' : 'text-red-400'}`}>
                      {adminCheckResponse.isAdmin ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Token Verified</p>
                    <p className={`font-mono ${adminCheckResponse.verified ? 'text-green-400' : 'text-red-400'}`}>
                      {adminCheckResponse.verified ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  {adminCheckResponse.uid && (
                    <div>
                      <p className="text-gray-400 text-sm">User ID (from token)</p>
                      <p className="text-white font-mono break-all">{adminCheckResponse.uid}</p>
                    </div>
                  )}
                  
                  {adminCheckResponse.error && (
                    <div>
                      <p className="text-gray-400 text-sm">Error</p>
                      <p className="text-red-400 font-mono">{adminCheckResponse.error}</p>
                      {adminCheckResponse.errorDetails && (
                        <p className="text-red-400 font-mono text-xs mt-1">{adminCheckResponse.errorDetails}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : error ? (
                <div className="text-red-400">
                  <p>Error fetching admin status:</p>
                  <p className="font-mono text-sm mt-1">{error}</p>
                </div>
              ) : (
                <p className="text-gray-400">No admin check data available</p>
              )}
            </div>
            
            {/* Token Verification */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Token Verification</h2>
              
              {tokenInfo ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Token Verified</p>
                    <p className={`font-mono ${tokenInfo.verified ? 'text-green-400' : 'text-red-400'}`}>
                      {tokenInfo.verified ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  {tokenInfo.verified ? (
                    <>
                      <div>
                        <p className="text-gray-400 text-sm">User ID (from token)</p>
                        <p className="text-white font-mono break-all">{tokenInfo.uid}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white font-mono">{tokenInfo.email}</p>
                      </div>
                      
                      {tokenInfo.tokenDetails && (
                        <>
                          <div>
                            <p className="text-gray-400 text-sm">Issued At</p>
                            <p className="text-white font-mono">{tokenInfo.tokenDetails.issuedAt}</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-sm">Expires At</p>
                            <p className="text-white font-mono">{tokenInfo.tokenDetails.expirationTime}</p>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {tokenInfo.error && (
                        <div>
                          <p className="text-gray-400 text-sm">Error</p>
                          <p className="text-red-400 font-mono">{tokenInfo.error}</p>
                        </div>
                      )}
                      
                      {tokenInfo.tokenPreview && (
                        <div>
                          <p className="text-gray-400 text-sm">Token Preview</p>
                          <p className="text-white font-mono">{tokenInfo.tokenPreview}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">No token verification data available</p>
              )}
            </div>
            
            {/* User Firestore Info */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Firestore User Data</h2>
              
              {userInfo ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">User Found</p>
                    <p className={`font-mono ${userInfo.exists ? 'text-green-400' : 'text-red-400'}`}>
                      {userInfo.exists ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  {userInfo.exists && userInfo.data && (
                    <>
                      <div>
                        <p className="text-gray-400 text-sm">isAdmin (Firestore)</p>
                        <p className={`font-mono ${userInfo.data.isAdmin ? 'text-green-400' : 'text-red-400'}`}>
                          {userInfo.data.isAdmin ? 'Yes' : 'No'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white font-mono">{userInfo.data.email || 'Not set'}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm">Display Name</p>
                        <p className="text-white font-mono">{userInfo.data.displayName || 'Not set'}</p>
                      </div>
                    </>
                  )}
                  
                  {userInfo.error && (
                    <div>
                      <p className="text-gray-400 text-sm">Error</p>
                      <p className="text-red-400 font-mono">{userInfo.error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">No user data available</p>
              )}
            </div>
            
            {/* Live Firestore Viewer */}
            {user && <FirestoreViewer userId={user.uid} />}
            
            {/* Cookie Info */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Cookie Information</h2>
              
              {cookieInfo ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Session Cookie Present</p>
                    <p className={`font-mono ${cookieInfo.hasSessionCookie ? 'text-green-400' : 'text-red-400'}`}>
                      {cookieInfo.hasSessionCookie ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  {cookieInfo.cookieNames && cookieInfo.cookieNames.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm">All Cookie Names</p>
                      <ul className="text-white font-mono text-sm">
                        {cookieInfo.cookieNames.map((name: string) => (
                          <li key={name} className={name === 'session' ? 'text-green-400' : ''}>
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">No cookie information available</p>
              )}
            </div>
            
            {/* Raw Debug Data */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold text-white mb-4">Raw Debug Data</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Admin Check Response</p>
                  <pre className="text-xs bg-gray-800 p-3 rounded overflow-auto max-h-60 text-white">
                    {JSON.stringify(adminCheckResponse, null, 2) || 'No data'}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">User Info</p>
                  <pre className="text-xs bg-gray-800 p-3 rounded overflow-auto max-h-60 text-white">
                    {JSON.stringify(userInfo, null, 2) || 'No data'}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Cookie Info</p>
                  <pre className="text-xs bg-gray-800 p-3 rounded overflow-auto max-h-60 text-white">
                    {JSON.stringify(cookieInfo, null, 2) || 'No data'}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">Token Info</p>
                  <pre className="text-xs bg-gray-800 p-3 rounded overflow-auto max-h-60 text-white">
                    {JSON.stringify(tokenInfo, null, 2) || 'No data'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Add the new Admin Fix Tool */}
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Advanced Admin Fix Tool</h2>
        <AdminFix />
      </main>
      
      <Footer />
    </div>
  );
} 