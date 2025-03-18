'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getWikiPage, getWikiPageRevisions, getWikiRevision, WikiRevision } from '@/lib/wikiFirestoreService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RevisionHistory, { RevisionCompare, RevisionView } from '@/components/wiki/RevisionHistory';

export default function WikiRevisionHistoryPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pageId = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<WikiRevision[]>([]);
  const [pageTitle, setPageTitle] = useState<string>('');
  
  // States for viewing and comparing revisions
  const [viewingRevision, setViewingRevision] = useState<WikiRevision | null>(null);
  const [comparingRevisions, setComparingRevisions] = useState<{
    original: WikiRevision | null;
    updated: WikiRevision | null;
  }>({ original: null, updated: null });
  
  // Load revisions data
  useEffect(() => {
    async function loadRevisionsData() {
      if (!pageId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get the page details to show the title
        const pageData = await getWikiPage(pageId);
        if (pageData) {
          setPageTitle(pageData.title);
        }
        
        // Get all revisions for this page
        const revisionsData = await getWikiPageRevisions(pageId);
        
        // Sort revisions by timestamp descending (newest first)
        const sortedRevisions = [...revisionsData].sort((a, b) => {
          const timeA = a.timestamp.toDate().getTime();
          const timeB = b.timestamp.toDate().getTime();
          return timeB - timeA; // Descending order
        });
        
        setRevisions(sortedRevisions);
      } catch (error) {
        console.error('Error loading revisions:', error);
        setError('Failed to load revision history. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadRevisionsData();
  }, [pageId]);
  
  // Handle viewing a specific revision
  const handleViewRevision = async (revisionId: string) => {
    try {
      const revision = await getWikiRevision(revisionId);
      setViewingRevision(revision);
      setComparingRevisions({ original: null, updated: null });
    } catch (error) {
      console.error('Error loading revision:', error);
      setError('Failed to load the selected revision.');
    }
  };
  
  // Handle comparing two revisions
  const handleCompareRevisions = async (id1: string, id2: string) => {
    try {
      const [revision1, revision2] = await Promise.all([
        getWikiRevision(id1),
        getWikiRevision(id2)
      ]);
      
      // Determine which is older (original) and which is newer (updated)
      if (revision1 && revision2) {
        const time1 = revision1.timestamp.toDate().getTime();
        const time2 = revision2.timestamp.toDate().getTime();
        
        if (time1 < time2) {
          setComparingRevisions({
            original: revision1,
            updated: revision2
          });
        } else {
          setComparingRevisions({
            original: revision2,
            updated: revision1
          });
        }
        
        setViewingRevision(null);
      }
    } catch (error) {
      console.error('Error loading revisions for comparison:', error);
      setError('Failed to load the selected revisions for comparison.');
    }
  };
  
  // Close revision view or comparison
  const handleClose = () => {
    setViewingRevision(null);
    setComparingRevisions({ original: null, updated: null });
  };
  
  // Restore a revision (placeholder for future implementation)
  const handleRestoreRevision = () => {
    alert('Restore functionality will be implemented in a future update.');
    handleClose();
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
    <div className="min-h-screen flex flex-col bg-gray-900">
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
          <div>
            <h1 className="text-3xl font-bold text-white">Revision History</h1>
            {pageTitle && (
              <p className="text-gray-400 mt-1">
                Page: <span className="text-white">{pageTitle}</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gta-blue"></div>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            {/* Revision history list */}
            {!viewingRevision && !comparingRevisions.original && (
              <RevisionHistory
                revisions={revisions}
                onViewRevision={handleViewRevision}
                onCompareRevisions={handleCompareRevisions}
              />
            )}
            
            {/* Single revision view */}
            {viewingRevision && (
              <RevisionView
                revision={viewingRevision}
                isCurrent={revisions.length > 0 && revisions[0].id === viewingRevision.id}
                onClose={handleClose}
                onRestore={handleRestoreRevision}
              />
            )}
            
            {/* Revision comparison view */}
            {comparingRevisions.original && comparingRevisions.updated && (
              <RevisionCompare
                originalRevision={comparingRevisions.original}
                newRevision={comparingRevisions.updated}
                onClose={handleClose}
              />
            )}
            
            {/* No revisions available */}
            {!loading && revisions.length === 0 && (
              <div className="text-center py-10">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 className="text-xl font-bold text-white mb-2">No Revisions Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  This page doesn't have any revision history yet. 
                  Revisions are created when changes are made to the page.
                </p>
                
                <div className="mt-6">
                  <Link 
                    href={`/admin/wiki/edit/${pageId}`}
                    className="px-6 py-3 bg-gta-blue text-white font-bold rounded-md hover:bg-blue-600 transition-colors inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Edit This Page
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 