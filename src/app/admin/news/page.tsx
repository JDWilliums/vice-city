'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { getAllNewsArticles, deleteNewsArticle, NewsArticleFirestore, checkFirestoreConnectivity } from '@/lib/newsFirestoreService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FirestoreDiagnostic from '@/components/wiki/FirestoreDiagnostic';

export default function AdminNewsDashboard() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<NewsArticleFirestore[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticleFirestore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<NewsArticleFirestore | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [firestoreStatus, setFirestoreStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  // Load all articles
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        
        // Check Firestore connectivity first
        const connectivityResult = await checkFirestoreConnectivity();
        setFirestoreStatus(connectivityResult.available ? 'connected' : 'error');
        
        const loadedArticles = await getAllNewsArticles(true);
        setArticles(loadedArticles);
        setFilteredArticles(loadedArticles);
      } catch (error) {
        console.error('Error loading news articles:', error);
        setErrorMessage('Failed to load news articles');
        setFirestoreStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    if (user && isAdmin) {
      loadArticles();
    }
  }, [user, isAdmin]);
  
  // Apply filters whenever search or filters change
  useEffect(() => {
    if (!articles.length) return;
    
    let result = [...articles];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(article => article.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(article => article.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query)
      );
    }
    
    setFilteredArticles(result);
  }, [articles, searchQuery, categoryFilter, statusFilter]);
  
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
  const confirmDelete = (article: NewsArticleFirestore) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };
  
  // Perform article deletion
  const handleDeleteArticle = async () => {
    if (!articleToDelete || !user) return;
    
    try {
      await deleteNewsArticle(articleToDelete.id, user);
      
      // Update the local state
      setArticles(prevArticles => prevArticles.map(article => 
        article.id === articleToDelete.id 
          ? { ...article, status: 'archived' } 
          : article
      ));
      
      setSuccessMessage(`"${articleToDelete.title}" has been archived`);
      setShowDeleteModal(false);
      setArticleToDelete(null);
      
      // Clear the message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting article:', error);
      setErrorMessage('Failed to delete the article. Please try again.');
      
      // Clear the error message after 3 seconds
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news':
        return 'bg-gta-blue';
      case 'features':
        return 'bg-gta-pink';
      case 'guides':
        return 'bg-gta-green';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-600';
      case 'draft':
        return 'bg-yellow-600';
      case 'archived':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
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
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">News Management</h1>
            <p className="text-gray-400 mt-1">Manage, create, and edit news articles</p>
          </div>
          
          <Link
            href="/admin/news/create"
            className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Article
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
                  placeholder="Search by title, excerpt, or author..."
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
                <option value="news">News</option>
                <option value="features">Features</option>
                <option value="guides">Guides</option>
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
        
        {/* Articles List */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gta-blue"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Author</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredArticles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded overflow-hidden bg-gray-800 flex-shrink-0 mr-3 hidden sm:block">
                            {article.imageUrl && (
                              <div className="relative h-10 w-10">
                                <Image
                                  src={article.imageUrl}
                                  alt={article.title}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white truncate max-w-xs">
                              {article.title}
                            </div>
                            {article.featured && (
                              <span className="inline-block bg-gta-blue/20 text-gta-blue text-xs px-2 py-0.5 rounded-sm mt-1">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="text-gray-300">
                          {article.author}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className={`${getCategoryColor(article.category)} text-white text-xs px-2 py-1 rounded-sm uppercase`}>
                          {article.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`${getStatusColor(article.status)} text-white text-xs px-2 py-1 rounded-sm uppercase`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-400 text-sm hidden lg:table-cell">
                        {formatDate(article.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/admin/news/edit/${article.id}`} 
                            className="p-2 bg-gray-800 rounded-md hover:bg-gta-blue/20 hover:text-gta-blue transition-colors text-gray-400"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                          </Link>
                          <Link 
                            href={`/news/${article.slug}`} 
                            target="_blank"
                            className="p-2 bg-gray-800 rounded-md hover:bg-green-700/20 hover:text-green-500 transition-colors text-gray-400"
                            title="View"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          </Link>
                          {article.status !== 'archived' && (
                            <button
                              onClick={() => confirmDelete(article)}
                              className="p-2 bg-gray-800 rounded-md hover:bg-red-700/20 hover:text-red-500 transition-colors text-gray-400"
                              title="Archive"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && articleToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Archive Article?</h2>
            <p className="text-gray-300 mb-2">
              Are you sure you want to archive "{articleToDelete.title}"?
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Archived articles are hidden from users but can be restored later.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteArticle}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
} 