'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WikiEditor from '@/components/wiki/WikiEditor';
import { getWikiPage, deleteWikiPage, unarchiveWikiPage } from '@/lib/wikiFirestoreService';
import { ArchiveBoxIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

export default function EditWikiPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pageId = params.slug as string;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<any>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Load page data to determine if it's archived
  useEffect(() => {
    async function loadPageData() {
      if (!pageId) return;
      
      try {
        setLoading(true);
        const data = await getWikiPage(pageId);
        setPageData(data);
      } catch (error) {
        console.error("Error loading wiki page:", error);
        setErrorMessage("Failed to load wiki page data");
      } finally {
        setLoading(false);
      }
    }
    
    if (user && isAdmin) {
      loadPageData();
    }
  }, [pageId, user, isAdmin]);
  
  // Handle successful page update
  const handleSuccess = (updatedPageId: string) => {
    setSuccessMessage('Wiki page updated successfully! Redirecting...');
    
    // Redirect to the admin dashboard after 2 seconds
    setTimeout(() => {
      router.push('/admin/wiki');
    }, 2000);
  };
  
  // Handle errors during page update
  const handleError = (error: string) => {
    setErrorMessage(`Error: ${error}`);
    console.error('Error updating wiki page:', error);
  };
  
  // Handle archive confirmation
  const handleArchiveConfirm = async () => {
    if (!user || !pageId) return;
    
    try {
      setActionInProgress(true);
      await deleteWikiPage(pageId, user);
      setSuccessMessage('Wiki page archived successfully! Redirecting...');
      setShowArchiveConfirm(false);
      
      // Redirect to the admin dashboard after 2 seconds
      setTimeout(() => {
        router.push('/admin/wiki');
      }, 2000);
    } catch (error) {
      setErrorMessage(`Failed to archive: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error archiving wiki page:', error);
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Handle unarchive confirmation
  const handleUnarchiveConfirm = async () => {
    if (!user || !pageId) return;
    
    try {
      setActionInProgress(true);
      await unarchiveWikiPage(pageId, user, 'published');
      setSuccessMessage('Wiki page unarchived and published successfully! Redirecting...');
      setShowUnarchiveConfirm(false);
      
      // Redirect to the admin dashboard after 2 seconds
      setTimeout(() => {
        router.push('/admin/wiki');
      }, 2000);
    } catch (error) {
      setErrorMessage(`Failed to unarchive: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error unarchiving wiki page:', error);
    } finally {
      setActionInProgress(false);
    }
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
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/admin/wiki"
              className="mr-4 p-2 hover:bg-gray-800 rounded-full"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-white">Edit Wiki Page</h1>
          </div>
          
          {!loading && pageData && (
            <div className="flex space-x-4">
              {pageData.status !== 'archived' ? (
                <button
                  onClick={() => setShowArchiveConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-700/30 hover:bg-red-700/60 text-white rounded-md transition-colors"
                  disabled={actionInProgress}
                >
                  <ArchiveBoxIcon className="h-5 w-5" />
                  Archive
                </button>
              ) : (
                <button
                  onClick={() => setShowUnarchiveConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700/30 hover:bg-green-700/60 text-white rounded-md transition-colors"
                  disabled={actionInProgress}
                >
                  <ArchiveBoxXMarkIcon className="h-5 w-5" />
                  Unarchive
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}
        
        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg">
            <p className="text-red-300">{errorMessage}</p>
          </div>
        )}
        
        {/* Archive Confirmation Dialog */}
        {showArchiveConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Archive Page?</h3>
              <p className="text-gray-300 mb-6">
                This will archive the page and it will no longer be visible to users.
                You can unarchive it later if needed.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                  disabled={actionInProgress}
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchiveConfirm}
                  className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
                  disabled={actionInProgress}
                >
                  {actionInProgress ? 'Archiving...' : 'Archive'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Unarchive Confirmation Dialog */}
        {showUnarchiveConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Unarchive Page?</h3>
              <p className="text-gray-300 mb-6">
                This will unarchive the page and publish it, making it visible to users again.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowUnarchiveConfirm(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                  disabled={actionInProgress}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnarchiveConfirm}
                  className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors"
                  disabled={actionInProgress}
                >
                  {actionInProgress ? 'Unarchiving...' : 'Unarchive & Publish'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Wiki Editor Component */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <WikiEditor 
            pageId={pageId}
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