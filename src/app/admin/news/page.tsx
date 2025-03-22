'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { getAllNewsArticles, deleteNewsArticle, NewsArticleFirestore, checkFirestoreConnectivity } from '@/lib/newsFirestoreService';
import { protectedFetch } from '@/lib/csrfUtils';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  publishDate: string;
  author: string;
  status: 'published' | 'draft';
  featured: boolean;
  category: string;
}

export default function NewsAdminPage() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [firestoreStatus, setFirestoreStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  useEffect(() => {
    async function fetchNewsArticles() {
      try {
        // In a real app, this would fetch actual news articles from an API
        // For now, we'll simulate it with static data
        setArticles([
          {
            id: '1',
            title: 'GTA 6 Vice City: New Screenshots Revealed',
            slug: 'gta6-vice-city-screenshots',
            publishDate: '2023-06-18',
            author: 'John Doe',
            status: 'published',
            featured: true,
            category: 'News'
          },
          {
            id: '2',
            title: 'Exclusive Interview with Game Developers',
            slug: 'interview-with-developers',
            publishDate: '2023-06-15',
            author: 'Jane Smith',
            status: 'published',
            featured: false,
            category: 'Interviews'
          },
          {
            id: '3',
            title: 'Vice City Map Size Comparison',
            slug: 'vice-city-map-size',
            publishDate: '2023-06-10',
            author: 'Alex Johnson',
            status: 'draft',
            featured: false,
            category: 'Analysis'
          },
          {
            id: '4',
            title: 'Community Fan Art Showcase',
            slug: 'fan-art-showcase',
            publishDate: '2023-06-05',
            author: 'Sarah Williams',
            status: 'published',
            featured: false,
            category: 'Community'
          },
          {
            id: '5',
            title: 'Vice City Soundtrack: What to Expect',
            slug: 'vice-city-soundtrack',
            publishDate: '2023-06-01',
            author: 'Mike Brown',
            status: 'draft',
            featured: false,
            category: 'Features'
          }
        ]);
      } catch (error: any) {
        console.error('Error fetching news articles:', error);
        setErrorMessage(error.message || 'Failed to load news articles');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNewsArticles();
  }, []);
  
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
  const confirmDelete = (article: NewsArticle) => {
    setArticleToDelete(article);
    setShowDeleteModal(true);
  };
  
  // Perform article deletion
  const handleDeleteArticle = async () => {
    if (!articleToDelete || !user) return;
    
    try {
      // In a real app, this would delete the article from the database
      // For now, we'll simulate it by removing the article from the local state
      setArticles(prevArticles => prevArticles.filter(a => a.id !== articleToDelete.id));
      
      setSuccessMessage(`"${articleToDelete.title}" has been deleted`);
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
  
  // Access denied view (for non-admins)
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
  
  // Action buttons for the header
  const actionButtons = (
    <Link 
      href="/admin/news/create" 
      className="px-4 py-2 bg-gta-blue text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      Create New Article
    </Link>
  );

  return (
    <div className="space-y-6 pt-4">
      <AdminPageHeader 
        title="News Management" 
        description="Create, edit, and manage news articles" 
        actions={actionButtons}
      />
      
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
                placeholder="Search by title or author..."
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
      
      {/* News Articles Table */}
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Author</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Publish Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-white flex items-center">
                          {article.title}
                          {article.featured && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-gta-pink/20 text-gta-pink rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">/news/{article.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-yellow-900/50 text-yellow-300'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {article.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {article.publishDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <Link 
                        href={`/admin/news/edit/${article.id}`} 
                        className="text-gta-blue hover:text-blue-400"
                      >
                        Edit
                      </Link>
                      <Link 
                        href={`/news/${article.slug}`} 
                        className="text-gray-400 hover:text-white"
                        target="_blank"
                      >
                        View
                      </Link>
                      <button 
                        className="text-red-500 hover:text-red-400"
                        onClick={() => confirmDelete(article)}
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
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Showing <span className="font-medium text-white">{filteredArticles.length}</span> articles
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && articleToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Delete Article?</h2>
            <p className="text-gray-300 mb-2">
              Are you sure you want to delete "{articleToDelete.title}"?
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Deleted articles cannot be restored.
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 