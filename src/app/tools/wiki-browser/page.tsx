'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WikiPageContent, WikiCategory } from '@/lib/wikiHelpers';
import { getStoredWikiPages, deleteWikiPage, getAllWikiPages } from '@/lib/clientStorage';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { useSearchParams, useRouter } from 'next/navigation';

// Client component that uses useSearchParams
function WikiBrowserContent() {
  const [wikiPages, setWikiPages] = useState<WikiPageContent[]>([]);
  const [filteredPages, setFilteredPages] = useState<WikiPageContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WikiCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedPage, setSelectedPage] = useState<WikiPageContent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load stored wiki pages on mount
  useEffect(() => {
    const allPages = getAllWikiPages();
    setWikiPages(allPages);
    setFilteredPages(allPages);
    
    // Check if there's a search query in the URL
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Filter pages when category or search term changes
  useEffect(() => {
    let filtered = wikiPages;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(page => page.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(query) || 
        page.description.toLowerCase().includes(query) ||
        (page.tags && page.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
    }
    
    setFilteredPages(filtered);
  }, [wikiPages, selectedCategory, searchQuery]);

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as WikiCategory | 'all');
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle wiki page deletion
  const handleDeletePage = () => {
    if (selectedPage) {
      if (deleteWikiPage(selectedPage.id)) {
        setSuccessMessage(`"${selectedPage.title}" deleted successfully`);
        setWikiPages(prev => prev.filter(p => p.id !== selectedPage.id));
        setIsDeleteModalOpen(false);
        setSelectedPage(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    }
  };

  // Get category color for UI
  const getCategoryColor = (categoryId: WikiCategory): string => {
    const category = WIKI_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.textColor : 'text-white';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white bg-opacity-90 flex flex-col">
      <Navbar />
      <div className="h-24 w-full"></div>
      
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gta-blue">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gta-blue">Wiki Page Browser</h1>
          
          {/* Success message */}
          {successMessage && (
            <div className="bg-green-800 text-white rounded-md p-4 mb-6">
              {successMessage}
            </div>
          )}
          
          {/* Filters and actions */}
          <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div className="flex-1 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label htmlFor="category" className="block text-sm font-medium mb-2">Category Filter</label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white"
                >
                  <option value="all">All Categories</option>
                  {WIKI_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-2/3">
                <label htmlFor="search" className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white"
                  placeholder="Search by title, description, or tags..."
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Link 
                href="/tools/wiki-generator" 
                className="bg-gta-blue px-4 py-3 rounded-md hover:bg-opacity-80 whitespace-nowrap"
              >
                Create New Page
              </Link>
            </div>
          </div>
          
          {/* Wiki pages list */}
          {filteredPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map(page => (
                <div 
                  key={page.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gta-blue transition-all"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{page.title}</h3>
                      <span className={`text-sm ${getCategoryColor(page.category)}`}>
                        {WIKI_CATEGORIES.find(cat => cat.id === page.category)?.title}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-4 text-sm line-clamp-2">{page.description}</p>
                    
                    {page.subcategory && (
                      <div className="mb-3">
                        <span className="text-xs bg-gray-700 rounded-full px-2 py-1">
                          {page.subcategory}
                        </span>
                      </div>
                    )}
                    
                    {page.tags && page.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {page.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag} 
                            className="bg-gray-700 text-xs rounded-full px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                        {page.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{page.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Created: {formatDate(page.createdAt)}</span>
                      <span>Updated: {formatDate(page.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex border-t border-gray-700">
                    <button
                      className="flex-1 p-2 text-center hover:bg-gray-700"
                      onClick={() => {
                        setSelectedPage(page);
                        // When preview is clicked, redirect to the actual wiki page
                        window.open(`/wiki/${page.category}/${page.id}`, '_blank');
                      }}
                    >
                      Preview
                    </button>
                    <div className="w-px bg-gray-700"></div>
                    <Link 
                      href={`/tools/wiki-generator?edit=${page.id}`} 
                      className="flex-1 p-2 text-center hover:bg-gray-700"
                    >
                      Edit
                    </Link>
                    <div className="w-px bg-gray-700"></div>
                    <button 
                      className="flex-1 p-2 text-center hover:bg-red-900 text-red-400"
                      onClick={() => {
                        setSelectedPage(page);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-xl text-gray-400 mb-4">No wiki pages found</p>
              <p className="text-gray-500 mb-6">
                {wikiPages.length === 0 
                  ? "You haven't created any wiki pages yet." 
                  : "No pages match your current filters."}
              </p>
              
              <Link 
                href="/tools/wiki-generator" 
                className="bg-gta-blue px-4 py-2 rounded-md hover:bg-opacity-80"
              >
                Create Your First Wiki Page
              </Link>
            </div>
          )}
        </div>
      </main>
      
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && selectedPage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Delete Wiki Page</h3>
            
            <p className="mb-6">
              Are you sure you want to delete <span className="font-bold">{selectedPage.title}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeletePage}
                className="px-4 py-2 rounded-md bg-red-800 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

// Main page component with Suspense boundary
export default function WikiBrowserPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="h-24 w-full"></div>
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="h-8 w-64 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    }>
      <WikiBrowserContent />
    </Suspense>
  );
} 