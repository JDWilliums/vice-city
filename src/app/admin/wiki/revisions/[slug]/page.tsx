'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getWikiPage, getWikiPageRevisions, getWikiRevision, WikiRevision } from '@/lib/wikiFirestoreService';
import RevisionHistory, { RevisionCompare, RevisionView } from '@/components/wiki/RevisionHistory';

export default function WikiRevisionHistoryPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pageId = params.slug as string;
  
  const [pageTitle, setPageTitle] = useState('');
  const [revisions, setRevisions] = useState<WikiRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingRevision, setViewingRevision] = useState<WikiRevision | null>(null);
  const [comparingRevisions, setComparingRevisions] = useState<{
    original: WikiRevision | null;
    updated: WikiRevision | null;
  }>({ original: null, updated: null });

  // Load page info and revision history
  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      try {
        // Get page title
        const pageData = await getWikiPage(pageId);
        if (pageData) {
          setPageTitle(pageData.title);
        }
        
        // Get revision history
        const history = await getWikiPageRevisions(pageId);
        setRevisions(history);
      } catch (err) {
        console.error('Error loading revision history:', err);
        setError('Failed to load revision history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPageData();
  }, [pageId]);
  
  // Handler for viewing a specific revision
  const handleViewRevision = async (revisionId: string) => {
    try {
      setLoading(true);
      const revision = await getWikiRevision(revisionId);
      if (revision) {
        setViewingRevision(revision);
      } else {
        setError('Revision not found');
      }
    } catch (err) {
      console.error('Error loading revision:', err);
      setError('Failed to load revision. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for comparing two revisions
  const handleCompareRevisions = (originalId: string, updatedId: string) => {
    const original = revisions.find(rev => rev.id === originalId) || null;
    const updated = revisions.find(rev => rev.id === updatedId) || null;
    
    setComparingRevisions({ original, updated });
  };
  
  // Handler for restoring a revision
  const handleRestoreRevision = () => {
    // Implementation would depend on your wiki system's API
    alert('Restore functionality would be implemented here');
    console.log('Restoring revision:', viewingRevision);
    handleClose();
  };
  
  // Handler for closing revision view or comparison
  const handleClose = () => {
    setViewingRevision(null);
    setComparingRevisions({ original: null, updated: null });
  };
  
  // Not logged in or not an admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
    );
  }
  
  return (
    <div className="space-y-6 pt-4">
      <main className="container mx-auto px-4">
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
    </div>
  );
} 