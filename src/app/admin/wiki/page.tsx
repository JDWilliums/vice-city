'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { getAllWikiPages, deleteWikiPage, WikiPageFirestore, checkFirestoreConnectivity } from '@/lib/wikiFirestoreService';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import FirestoreDiagnostic from '@/components/wiki/FirestoreDiagnostic';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

// Define interface that's compatible with WikiPageFirestore
interface WikiPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'review' | 'archived';
  category: string;
  // Make author optional since it might not exist in WikiPageFirestore
  author?: string;
  updatedAt: any; // Using any to match the timestamp type from Firestore
  // Adding compatibility fields 
  creator?: string;
  lastUpdated?: string;
}

// Category utility
interface CategoryInfo {
  title: string;
  color: string;
}

// Utility functions (to replace imported ones)
const getCategoryInfo = (categoryId: string): CategoryInfo => {
  const categories: Record<string, CategoryInfo> = {
    'guides': { title: 'Guides', color: 'text-blue-400' },
    'characters': { title: 'Characters', color: 'text-purple-400' },
    'gameplay': { title: 'Gameplay', color: 'text-green-400' },
    'secrets': { title: 'Secrets', color: 'text-yellow-400' },
    'story': { title: 'Story', color: 'text-red-400' },
    'vehicles': { title: 'Vehicles', color: 'text-orange-400' },
    'weapons': { title: 'Weapons', color: 'text-pink-400' },
    'locations': { title: 'Locations', color: 'text-indigo-400' },
  };
  
  return categories[categoryId] || { title: categoryId.charAt(0).toUpperCase() + categoryId.slice(1), color: 'text-gray-400' };
};

const formatDate = (date: any): string => {
  if (!date) return 'Unknown';
  
  const timestamp = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(timestamp);
};

export default function WikiAdminPage() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<WikiPage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<WikiPage | null>(null);
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
        
        const firebasePages = await getAllWikiPages(true);
        
        // Map WikiPageFirestore to our WikiPage interface
        const mappedPages: WikiPage[] = firebasePages.map(page => ({
          id: page.id,
          title: page.title,
          slug: page.slug || '',
          status: page.status as 'published' | 'draft' | 'review' | 'archived',
          category: page.category,
          author: page.lastUpdatedBy?.displayName || 'Unknown',
          updatedAt: page.updatedAt
        }));
        
        setWikiPages(mappedPages);
        setFilteredPages(mappedPages);
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
        (page.author && page.author.toLowerCase().includes(query)) ||
        getCategoryInfo(page.category).title.toLowerCase().includes(query)
      );
    }
    
    setFilteredPages(result);
  }, [wikiPages, searchQuery, categoryFilter, statusFilter]);
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategoryFilter(newCategory);
  };
  
  // Handle delete confirmation
  const confirmDelete = (page: WikiPage) => {
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
  
  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(wikiPages.map(page => page.category))];
  
  // Action buttons for the header
  const actionButtons = (
    <Link 
      href="/admin/wiki/create" 
      className="px-4 py-2 bg-gta-pink text-white rounded hover:bg-pink-600 transition-colors inline-flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Create New Page
    </Link>
  );
  
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
      <AdminPageHeader 
        title="Wiki Management" 
        description="Create, edit, and manage wiki content" 
        actions={actionButtons}
      />
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="inline-block w-12 h-12 border-4 border-gta-pink border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : errorMessage ? (
        <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg text-white">
          {errorMessage}
        </div>
      ) : (
        <>
          {/* Success and error messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
              <p className="text-green-300">{successMessage}</p>
            </div>
          )}
          
          {/* Filters */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-4 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search wiki pages..."
                className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
            
            <div className="flex space-x-4">
              <div>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div>
                <select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{getCategoryInfo(category).title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Wiki Pages Table */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
            {filteredPages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No wiki pages found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Creator</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Updated</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredPages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-800/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{page.title}</div>
                          <div className="text-sm text-gray-400">/wiki/{page.slug}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                            {getCategoryInfo(page.category).title}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            page.status === 'published' 
                              ? 'bg-green-900/50 text-green-300'
                              : page.status === 'review'
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : page.status === 'archived'
                                  ? 'bg-red-900/50 text-red-300'
                                  : 'bg-gray-900/50 text-gray-300'
                          }`}>
                            {page.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {page.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(page.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <Link 
                              href={`/admin/wiki/edit/${page.id}`} 
                              className="text-gta-blue hover:text-blue-400"
                            >
                              Edit
                            </Link>
                            <Link 
                              href={`/admin/wiki/revisions/${page.id}`}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              Revisions
                            </Link>
                            <Link 
                              href={`/wiki/${page.slug}`} 
                              className="text-gray-400 hover:text-white"
                              target="_blank"
                            >
                              View
                            </Link>
                            <button 
                              className="text-red-500 hover:text-red-400"
                              onClick={() => confirmDelete(page)}
                            >
                              Delete
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
          
          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Showing <span className="font-medium text-white">{filteredPages.length}</span> of <span className="font-medium text-white">{wikiPages.length}</span> wiki pages
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-800 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1 bg-gray-800 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </>
      )}
      
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