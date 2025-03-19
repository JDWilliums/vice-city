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
            (page.tags && Array.isArray(page.tags) && page.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
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
        
        <div className="container p-6 mx-auto px-6 z-10 relative">
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
                  placeholder="Search titles, tags, and descriptions..."
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
                          className={`px-3 py-1.5 rounded-full text-sm border
                            ${activeFilter === category 
                              ? `${catInfo?.color || 'bg-gta-blue'} ${catInfo?.textColor || 'text-white'} ${catInfo?.borderColor || 'border-blue-500'}` 
                              : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                            } transition-colors`}
                        >
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
              
              {(!query || totalResults === 0) && (
                <div className="mt-6 animate-fadeIn">
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-bold text-white mb-6">Don't know what to search? Browse categories instead</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {WIKI_CATEGORIES.map((category, index) => (
                        <Link 
                          key={category.id}
                          href={`/wiki/${category.id}`}
                          className="relative group bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700 overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center"
                        >
                          {/* Color accent */}
                          <div 
                            className={`absolute top-0 left-0 w-2 h-full transition-all duration-500 group-hover:w-full group-hover:opacity-90 opacity-100`}
                            style={{
                              backgroundColor: 
                                category.id === 'characters' ? '#F152FF' : 
                                category.id === 'missions' ? '#52FDFF' : 
                                category.id === 'locations' ? '#56FF52' : 
                                category.id === 'vehicles' ? '#FFE552' : 
                                category.id === 'weapons' ? '#FF5252' : 
                                category.id === 'activities' ? '#AC52FF' : '#F152FF'
                            }}
                          ></div>
                          
                          {/* Card gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-800/95 to-gray-900 transition-opacity duration-300 group-hover:opacity-40"></div>
                          
                          <div className="relative z-10 flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center mr-3 group-hover:scale-110 transition-all duration-300">
                              <img src={category.icon} alt={category.title} className="max-w-full max-h-full" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white transition-colors">{category.title}</h3>
                              <p className="text-xs text-gray-300 mt-1 line-clamp-1">{category.description}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
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
                    <div className="flex flex-col md:flex-row">
                      {page.imageUrl && (
                        <Link href={`/wiki/${page.category}/${page.slug}`} className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                          <Image
                            src={page.imageUrl}
                            alt={page.title}
                            fill
                            className="object-cover"
                          />
                        </Link>
                      )}
                      <div className="p-6 flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              <Link href={`/wiki/${page.category}/${page.slug}`} className="hover:text-gta-pink">
                                {highlightSearchTerms(page.title, query)}
                              </Link>
                            </h3>
                            <p className="text-gray-300 mb-4">
                              {highlightSearchTerms(page.description, query)}
                            </p>
                          </div>
                          <span className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-gray-700 text-gray-300 ml-2">
                            {WIKI_CATEGORIES.find(cat => cat.id === page.category)?.title || page.category}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between mt-4">
                          {page.tags && Array.isArray(page.tags) && page.tags.length > 0 && (
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
                    </div>
                  </div>
                ))}
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