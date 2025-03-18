'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllWikiPages } from '@/lib/wikiFirestoreService';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { getLocalImageUrl } from '@/lib/localImageService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WikiSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(query);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [resultsByCategory, setResultsByCategory] = useState<{[key: string]: any[]}>({});
  
  // Fetch all pages and filter them based on the search query
  useEffect(() => {
    const fetchAndSearchPages = async () => {
      try {
        setLoading(true);
        const allPages = await getAllWikiPages(false); // Exclude archived pages
        
        // Process the pages to ensure they have image URLs
        const processedPages = allPages.map(page => {
          // If the page doesn't have an image URL, assign a category-specific one
          if (!page.imageUrl) {
            return {
              ...page,
              imageUrl: getLocalImageUrl(page.category)
            };
          }
          return page;
        });
        
        if (query) {
          const lowerQuery = query.toLowerCase();
          const results = processedPages.filter(page => 
            page.title.toLowerCase().includes(lowerQuery) || 
            page.description.toLowerCase().includes(lowerQuery) ||
            (page.tags && page.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) ||
            (page.content && page.content.toLowerCase().includes(lowerQuery))
          );
          
          setSearchResults(results);
          
          // Group results by category
          const byCategory: {[key: string]: any[]} = {};
          results.forEach(page => {
            if (!byCategory[page.category]) {
              byCategory[page.category] = [];
            }
            byCategory[page.category].push(page);
          });
          
          setResultsByCategory(byCategory);
        } else {
          setSearchResults([]);
          setResultsByCategory({});
        }
      } catch (error) {
        console.error('Error searching wiki pages:', error);
        setError('Failed to load search results. Please try again later.');
        
        // Create placeholder results if we can't load from Firestore
        const placeholders = createPlaceholderResults(6);
        setSearchResults(placeholders);
        
        const byCategory: {[key: string]: any[]} = {};
        placeholders.forEach(page => {
          if (!byCategory[page.category]) {
            byCategory[page.category] = [];
          }
          byCategory[page.category].push(page);
        });
        
        setResultsByCategory(byCategory);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndSearchPages();
  }, [query]);
  
  // Function to create placeholder search results
  const createPlaceholderResults = (count: number) => {
    const placeholders = [];
    
    for (let i = 0; i < count; i++) {
      const category = WIKI_CATEGORIES[i % WIKI_CATEGORIES.length].id;
      
      placeholders.push({
        id: `placeholder-${i}`,
        title: `Sample ${WIKI_CATEGORIES.find(cat => cat.id === category)?.title} Result ${i + 1}`,
        description: `This is a placeholder search result for "${query}". Real content will appear once connected to the database.`,
        slug: `placeholder-${category}-${i}`,
        category,
        imageUrl: getLocalImageUrl(category),
        tags: [`Tag ${i + 1}`, query, 'Placeholder'],
        updatedAt: { toDate: () => new Date() }
      });
    }
    
    return placeholders;
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/wiki/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };
  
  // Filter results by category
  const getFilteredResults = () => {
    if (!activeFilter) return searchResults;
    return searchResults.filter(page => page.category === activeFilter);
  };
  
  // Format date display
  const formatDate = (timestamp: any): string => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    } else if (typeof timestamp === 'object' && timestamp !== null && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    } else if (timestamp) {
      return new Date(timestamp).toLocaleDateString();
    }
    return 'Unknown date';
  };
  
  // Extract snippet of text containing the search query from content
  const getContentSnippet = (content: string, query: string): string => {
    if (!content || !query) return '';
    
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) return content.substring(0, 100) + '...';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 50);
    
    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  };
  
  // Highlight search terms in text
  const highlightSearchTerms = (text: string, query: string): JSX.Element => {
    if (!query) return <>{text}</>;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-gta-pink/30 text-white px-0.5 rounded-sm">{part}</mark> 
            : part
        )}
      </>
    );
  };
  
  // Count total results
  const totalResults = searchResults.length;
  const filteredResults = getFilteredResults();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar transparent={true} />
      
      {/* Search Hero Header */}
      <div className="relative py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {/* Animated Gradients */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 -left-1/3 w-2/3 h-2/3 bg-gta-pink opacity-20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 -right-1/3 w-2/3 h-2/3 bg-gta-blue opacity-20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-6 z-10 relative">
          <div className="animate-fadeIn max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center text-sm text-white/80">
              <Link href="/wiki" className="hover:text-white transition-colors">
                Wiki
              </Link>
              <span className="mx-2">›</span>
              <span className="text-white font-medium">Search Results</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {query ? (
                <>
                  Search Results for <span className="text-gta-pink">"{query}"</span>
                </>
              ) : 'Search the Wiki'}
            </h1>
            
            {/* Search Form */}
            <div className="bg-black/30 backdrop-blur-md rounded-lg p-1 border border-white/20 shadow-xl mb-4">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search for anything in the GTA 6 Wiki..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent px-5 py-3 text-white focus:outline-none"
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="px-5 py-3 bg-gta-pink text-white rounded-r-md hover:bg-pink-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
            
            {/* Error message if needed */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
                <p>{error}</p>
                <p className="text-sm mt-2">Using placeholder content and local images.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gta-pink mb-4"></div>
            <p className="text-gray-400">Searching for "{query}"...</p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-8 bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {query ? (
                    `Found ${totalResults} ${totalResults === 1 ? 'result' : 'results'}`
                  ) : 'Enter a search term to find pages'}
                </h2>
                
                {/* Category Filters */}
                {Object.keys(resultsByCategory).length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveFilter(null)}
                      className={`px-3 py-1.5 rounded-full text-sm border 
                        ${!activeFilter 
                          ? 'bg-gta-pink text-white border-pink-500' 
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                        } transition-colors`}
                    >
                      All Categories
                    </button>
                    
                    {Object.keys(resultsByCategory).map(category => {
                      const catInfo = WIKI_CATEGORIES.find(cat => cat.id === category);
                      return (
                        <button
                          key={category}
                          onClick={() => setActiveFilter(category)}
                          className={`px-3 py-1.5 rounded-full text-sm border flex items-center
                            ${activeFilter === category 
                              ? `${catInfo?.color || 'bg-gta-blue'} ${catInfo?.textColor || 'text-white'} ${catInfo?.borderColor || 'border-blue-500'}` 
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                            } transition-colors`}
                        >
                          <span className="mr-1">{catInfo?.icon}</span>
                          {catInfo?.title || category}
                          <span className="ml-1">({resultsByCategory[category].length})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {query && totalResults === 0 && (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="text-5xl mb-4 opacity-30">🔍</div>
                  <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                  <p className="text-gray-400 mb-6">
                    We couldn't find any wiki pages matching "{query}".
                  </p>
                  <div className="text-gray-400 max-w-lg mx-auto">
                    <p className="mb-4">Try:</p>
                    <ul className="text-left list-disc list-inside space-y-2">
                      <li>Checking your spelling</li>
                      <li>Using fewer or different keywords</li>
                      <li>Using more general terms</li>
                      <li>Browsing wiki categories instead</li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link 
                      href="/wiki"
                      className="px-6 py-3 bg-gta-blue text-white font-bold rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Browse All Wiki Categories
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Results */}
            {filteredResults.length > 0 && (
              <div className="space-y-6 animate-fadeIn">
                {filteredResults.map((page, index) => (
                  <div
                    key={page.id}
                    className="bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:shadow-xl transition-all animate-fadeInUp"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <Link href={`/wiki/${page.category}/${page.slug}`} className="flex flex-col md:flex-row">
                      {page.imageUrl && (
                        <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                          <Image
                            src={page.imageUrl}
                            alt={page.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {highlightSearchTerms(page.title, query)}
                            </h3>
                            <p className="text-gray-300 mb-4">
                              {highlightSearchTerms(page.description, query)}
                            </p>
                          </div>
                          <span className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-gray-700 text-gray-300 ml-2">
                            {WIKI_CATEGORIES.find(cat => cat.id === page.category)?.title || page.category}
                          </span>
                        </div>
                        
                        {page.content && query && (
                          <div className="mb-4 bg-gray-900/50 p-3 rounded-md">
                            <p className="text-sm text-gray-400 italic">
                              {highlightSearchTerms(getContentSnippet(page.content, query), query)}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap items-center justify-between mt-4">
                          {page.tags && page.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mr-4">
                              {page.tags.map((tag: string) => (
                                <Link
                                  key={tag}
                                  href={`/wiki/search?q=${encodeURIComponent(tag)}`}
                                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  #{tag}
                                </Link>
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-gray-500 mt-2">
                            Updated: {formatDate(page.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            {/* Category Results Summary */}
            {Object.keys(resultsByCategory).length > 1 && filteredResults.length > 0 && !activeFilter && (
              <div className="mt-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white border-l-4 border-gta-blue pl-4">
                    Results by Category
                  </h2>
                  <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-blue to-transparent"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                  {Object.entries(resultsByCategory).map(([category, pages], index) => {
                    const catInfo = WIKI_CATEGORIES.find(cat => cat.id === category);
                    return (
                      <div 
                        key={category}
                        className={`bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 animate-fadeInUp`}
                        style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                      >
                        <div className={`${catInfo?.color || 'bg-gray-700'} p-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">{catInfo?.icon}</span>
                              <h3 className={`${catInfo?.textColor || 'text-white'} font-bold`}>
                                {catInfo?.title || category}
                              </h3>
                            </div>
                            <span className="rounded-full bg-black/30 text-white text-sm px-2 py-0.5">
                              {pages.length}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <ul className="divide-y divide-gray-700">
                            {pages.slice(0, 3).map(page => (
                              <li key={page.id} className="py-2">
                                <Link 
                                  href={`/wiki/${page.category}/${page.slug}`}
                                  className="text-white hover:text-gta-blue transition-colors"
                                >
                                  {highlightSearchTerms(page.title, query)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                          {pages.length > 3 && (
                            <div className="pt-2 text-center">
                              <button 
                                onClick={() => setActiveFilter(category)}
                                className="text-sm text-gta-blue hover:text-gta-pink transition-colors"
                              >
                                View all {pages.length} results
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
      
      {/* Add required CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        
        .animate-fadeIn {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 8s infinite;
        }
        
        /* Highlight animation */
        @keyframes highlight {
          0% { background-color: rgba(236, 72, 153, 0.3); }
          50% { background-color: rgba(236, 72, 153, 0.5); }
          100% { background-color: rgba(236, 72, 153, 0.3); }
        }
        
        mark {
          animation: highlight 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 