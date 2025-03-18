'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { getAllWikiPages, deleteWikiPage, WikiPageFirestore, checkFirestoreConnectivity } from '@/lib/wikiFirestoreService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import FirestoreDiagnostic from '@/components/wiki/FirestoreDiagnostic';

export default function AdminWikiDashboard() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wikiPages, setWikiPages] = useState<WikiPageFirestore[]>([]);
  const [filteredPages, setFilteredPages] = useState<WikiPageFirestore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<WikiPageFirestore | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [firestoreStatus, setFirestoreStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  // Load all pages
  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoading(true);
        
        // Check Firestore connectivity first
        const connectivityResult = await checkFirestoreConnectivity();
        setFirestoreStatus(connectivityResult.available ? 'connected' : 'error');
        
        const pages = await getAllWikiPages(true);
        setWikiPages(pages);
        setFilteredPages(pages);
      } catch (error) {
        console.error('Error loading wiki pages:', error);
        setErrorMessage('Failed to load wiki pages');
        setFirestoreStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    if (user && isAdmin) {
      loadPages();
    }
  }, [user, isAdmin]);
  
  // Apply filters whenever search or filters change
  useEffect(() => {
    if (!wikiPages.length) return;
    
    let result = [...wikiPages];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(page => page.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(page => page.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(page => 
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        (page.tags && Array.isArray(page.tags) && page.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    setFilteredPages(result);
  }, [wikiPages, searchQuery, categoryFilter, statusFilter]);
  
  // Find category info by ID
  const getCategoryInfo = (categoryId: string) => {
    return WIKI_CATEGORIES.find(cat => cat.id === categoryId) || { title: 'Unknown', color: 'text-gray-400' };
  };
  
  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    
    const timestamp = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };
  
  // Handle delete confirmation
  const confirmDelete = (page: WikiPageFirestore) => {
    setPageToDelete(page);
    setShowDeleteModal(true);
  };
  
  // Perform page deletion
  const handleDeletePage = async () => {
    if (!pageToDelete || !user) return;
    
    try {
      await deleteWikiPage(pageToDelete.id, user);
      
      // Update the local state
      setWikiPages(prevPages => prevPages.filter(page => page.id !== pageToDelete.id));
      setSuccessMessage(`"${pageToDelete.title}" has been archived`);
      setShowDeleteModal(false);
      setPageToDelete(null);
      
      // Clear the message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting page:', error);
      setErrorMessage('Failed to delete the page. Please try again.');
      
      // Clear the error message after 3 seconds
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Wiki Management</h1>
            <p className="text-gray-400 mt-1">Manage, create, and edit wiki pages</p>
          </div>
          
          <Link
            href="/admin/wiki/create"
            className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Page
          </Link>
        </div>
        
        {/* Firestore Diagnostic */}
        <FirestoreDiagnostic />
        
        {/* Success and error messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg">
            <p className="text-red-300">{errorMessage}</p>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by title, description, or tag..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            
            {/* Category filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {WIKI_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>{category.title}</option>
                ))}
              </select>
            </div>
            
            {/* Status filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gta-blue border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <span className="ml-3 text-white">Loading wiki pages...</span>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4 text-gray-400">
              Showing {filteredPages.length} of {wikiPages.length} pages
            </div>
            
            {/* Wiki Pages Table */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              {filteredPages.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h2 className="text-xl font-medium text-white mb-2">No results found</h2>
                  <p className="text-gray-400 mb-4">
                    {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your filters or search terms'
                      : 'No wiki pages have been created yet'}
                  </p>
                  <Link
                    href="/admin/wiki/create"
                    className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 inline-flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Create First Page
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Page
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                      {filteredPages.map(page => (
                        <tr key={page.id} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {page.imageUrl ? (
                                <div className="flex-shrink-0 h-10 w-10 relative">
                                  <Image
                                    src={page.imageUrl}
                                    alt={page.title}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              ) : (
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-800 rounded flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white flex items-center">
                                  {page.title}
                                  {page.featured && (
                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-gta-pink/20 text-gta-pink rounded">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400">{page.description.substring(0, 60)}{page.description.length > 60 ? '...' : ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryInfo(page.category).color} bg-opacity-10`}>
                              {getCategoryInfo(page.category).title}
                            </span>
                            {page.subcategory && (
                              <span className="ml-2 text-xs text-gray-400">
                                {page.subcategory}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              page.status === 'published' ? 'bg-green-900/30 text-green-400' :
                              page.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-red-900/30 text-red-400'
                            }`}>
                              {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(page.updatedAt)}
                            <div className="text-xs">by {page.lastUpdatedBy.displayName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-3">
                              <Link 
                                href={`/wiki/${page.category}/${page.slug || page.id}`} 
                                className="text-gray-300 hover:text-white"
                                target="_blank"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                              </Link>
                              <Link 
                                href={`/admin/wiki/edit/${page.id}`} 
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                              </Link>
                              <Link 
                                href={`/admin/wiki/revisions/${page.id}`} 
                                className="text-purple-400 hover:text-purple-300"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </Link>
                              <button 
                                onClick={() => confirmDelete(page)} 
                                className="text-red-400 hover:text-red-300"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      <Footer />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && pageToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Archive Wiki Page</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to archive "{pageToDelete.title}"? 
              This action won't permanently delete the page, but will hide it from public view.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPageToDelete(null);
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePage}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 