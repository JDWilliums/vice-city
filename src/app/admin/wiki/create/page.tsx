'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WikiEditor from '@/components/wiki/WikiEditor';

export default function CreateWikiPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  
  // Handle successful page creation
  const handleSuccess = (pageId: string) => {
    setSuccessMessage('Wiki page created successfully! Redirecting...');
    
    // Redirect to the admin dashboard after 2 seconds
    setTimeout(() => {
      router.push('/admin/wiki');
    }, 2000);
  };
  
  // Handle errors during page creation
  const handleError = (error: string) => {
    console.error('Error creating wiki page:', error);
  };
  
  // Not logged in or not an admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-black/60 backdrop-blur-sm border border-red-500 rounded-lg p-8 max-w-md text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 100-6 3 3 0 000 6z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12z"></path>
            </svg>
            <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
            <p className="text-gray-300 mb-6">
              You need to be logged in as an administrator to access this page.
            </p>
            <Link href="/login" className="inline-block px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1">
              Log In
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 mt-16">
        <div className="mb-8 flex items-center">
          <Link
            href="/admin/wiki"
            className="mr-4 p-2 hover:bg-gray-800 rounded-full"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create New Wiki Page</h1>
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}
        
        {/* Wiki Editor Component */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <WikiEditor 
            user={user} 
            onSuccess={handleSuccess}
            onError={(error: Error) => handleError(error.message)}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
} 