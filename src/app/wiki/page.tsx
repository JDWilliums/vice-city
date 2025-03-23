'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAllWikiPages, checkFirestoreConnectivity } from '@/lib/wikiFirestoreService';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { getLocalImageUrl } from '@/lib/localImageService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FirestoreDiagnostic from '@/components/wiki/FirestoreDiagnostic';
import { useAuth } from '@/lib/AuthContext';

// Helper function to generate a random ID similar to Firestore's auto-ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Add debounce function with proper type annotation
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: any[]) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

export default function WikiHomePage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [featuredPages, setFeaturedPages] = useState<any[]>([]);
  const [recentPages, setRecentPages] = useState<any[]>([]);
  const [allPages, setAllPages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [firestoreStatus, setFirestoreStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  useEffect(() => {
    const fetchWikiPages = async () => {
      try {
        setLoading(true);
        
        // Check Firestore connectivity first
        const connectivityResult = await checkFirestoreConnectivity();
        setFirestoreStatus(connectivityResult.available ? 'connected' : 'error');
        
        console.log("Fetching wiki pages for homepage...");
        const pages = await getAllWikiPages(false); // Exclude archived pages
        console.log(`Received ${pages.length} wiki pages from getAllWikiPages`);
        
        // Log raw data to help with debugging
        if (pages.length > 0) {
          console.log("Sample wiki page data:", {
            id: pages[0].id,
            title: pages[0].title,
            status: pages[0].status,
            category: pages[0].category
          });
          
          // Add detailed logging for diagnostic purposes
          console.log("All page IDs:", pages.map(page => page.id));
          console.log("All page titles:", pages.map(page => page.title));
          
          // Debug which pages come from where
          const localStorageKey = 'local_wiki_pages';
          let localPages = [];
          try {
            if (typeof window !== 'undefined') {
              const localData = localStorage.getItem(localStorageKey);
              if (localData) {
                localPages = JSON.parse(localData);
                console.log(`Found ${localPages.length} pages in localStorage`);
              }
            }
          } catch (e) {
            console.error("Error reading localStorage:", e);
          }
          
          // Compare local vs fetched
          if (localPages.length > 0) {
            const localIds = new Set(localPages.map((p: any) => p.id));
            const firestoreIds = new Set(pages.filter(p => !localIds.has(p.id)).map(p => p.id));
            console.log(`Pages breakdown - Local: ${localIds.size}, Firestore: ${firestoreIds.size}`);
          }
        } else {
          console.log("No wiki pages received");
        }
        
        // Process the pages to ensure they have image URLs
        const processedPages = pages.map(page => {
          // Ensure page has necessary fields
          const processedPage = {
            ...page,
            // If the page doesn't have an image URL, assign a category-specific one
            imageUrl: page.imageUrl || getLocalImageUrl(page.category),
            // Ensure status is set to a valid value (default to published)
            status: page.status || 'published',
            // Ensure id is set
            id: page.id || generateId()
          };
          
          return processedPage;
        });
        
        setAllPages(processedPages);
        console.log(`Set ${processedPages.length} processed pages to allPages state`);
        
        // Filter featured pages
        const featured = processedPages
          .filter(page => page.featured && page.status === 'published')
          .slice(0, 6); // Limit to 6 featured pages
        
        console.log(`Found ${featured.length} featured pages`);
        
        // Get recent pages
        const recent = processedPages
          .filter(page => page.status === 'published')
          .sort((a, b) => {
            // Handle different timestamp formats (Firestore Timestamp or regular date)
            let aTime: number, bTime: number;
            
            if (a.updatedAt?.toDate) {
              aTime = a.updatedAt.toDate().getTime();
            } else if (typeof a.updatedAt === 'object' && a.updatedAt !== null) {
              aTime = new Date(a.updatedAt.seconds * 1000).getTime();
            } else {
              aTime = new Date().getTime();
            }
            
            if (b.updatedAt?.toDate) {
              bTime = b.updatedAt.toDate().getTime();
            } else if (typeof b.updatedAt === 'object' && b.updatedAt !== null) {
              bTime = new Date(b.updatedAt.seconds * 1000).getTime();
            } else {
              bTime = new Date().getTime();
            }
            
            return bTime - aTime;
          })
          .slice(0, 8); // Limit to 8 recent pages
          
        console.log(`Found ${recent.length} recent pages`);
        
        setFeaturedPages(featured);
        setRecentPages(recent);
        
        if (featured.length === 0 && recent.length === 0) {
          // If we have pages but no featured or recent ones, let's make some placeholders
          if (processedPages.length > 0) {
            console.log("No featured or recent pages - creating featured from existing pages");
            // Use some of the existing pages as featured and recent
            const tempFeatured = processedPages.slice(0, Math.min(6, processedPages.length));
            setFeaturedPages(tempFeatured);
            setRecentPages(processedPages.slice(0, Math.min(8, processedPages.length)));
          }
        }
      } catch (error) {
        console.error('Error fetching wiki pages:', error);
        setError('Failed to load wiki content. Please try again later.');
        
        // If there's an error (like Firestore not available), create placeholder content
        const placeholders = createPlaceholderPages(6, true);
        const recentPlaceholders = createPlaceholderPages(8, false);
        setFeaturedPages(placeholders);
        setRecentPages(recentPlaceholders);
        setAllPages([...placeholders, ...recentPlaceholders]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWikiPages();
  }, []);
  
  useEffect(() => {
    // Check Firestore connectivity on component mount
    const checkConnectivity = async () => {
      try {
        const result = await checkFirestoreConnectivity();
        setFirestoreStatus(result.available ? 'connected' : 'error');
      } catch (error) {
        console.error('Error checking Firestore connectivity:', error);
        setFirestoreStatus('error');
      }
    };
    
    checkConnectivity();
  }, []);
  
  // Function to search through all pages
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    
    console.log(`Searching ${allPages.length} pages for "${query}"`);
    
    const results = allPages.filter(page => 
      page.title.toLowerCase().includes(query) || 
      page.description.toLowerCase().includes(query) ||
      (page.tags && Array.isArray(page.tags) && page.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    ).slice(0, 8); // Limit to 8 results
    
    console.log(`Found ${results.length} search results`, 
      results.length > 0 ? results.map(r => r.title) : '');
    
    setSearchResults(results);
  }, [searchQuery, allPages]);
  
  // Function to navigate to specific page when clicking a search result
  const handleSearchResultClick = (page: any) => {
    setSearchQuery('');
    setIsSearching(false);
    router.push(`/wiki/${page.category}/${page.slug}`);
  };
  
  // Function to navigate to search results page for advanced search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/wiki/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSearching && searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearching]);
  
  // Focus search input on page load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Function to create placeholder pages when real data can't be loaded
  const createPlaceholderPages = (count: number, featured: boolean) => {
    const placeholders = [];
    
    for (let i = 0; i < count; i++) {
      const category = WIKI_CATEGORIES[i % WIKI_CATEGORIES.length].id;
      
      placeholders.push({
        id: `placeholder-${i}`,
        title: featured 
          ? `Featured ${WIKI_CATEGORIES.find(cat => cat.id === category)?.title} Page ${i + 1}`
          : `${WIKI_CATEGORIES.find(cat => cat.id === category)?.title} Article ${i + 1}`,
        description: featured
          ? 'This is a placeholder for a featured wiki page. Real content will appear once connected to the database.'
          : 'This is a placeholder wiki article. Real content will appear once connected to the database.',
        slug: `placeholder-${category}-${i}`,
        category,
        imageUrl: getLocalImageUrl(category),
        updatedAt: { toDate: () => new Date() }
      });
    }
    
    return placeholders;
  };
  
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
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar transparent={true} />
      
      {/* Hero Section with Search */}
      <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br z-10 from-gray-900 via-gray-800 to-gray-900 pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/gta6-3.png" 
            alt="Vice City" 
            fill 
            sizes="100vw"
            className="object-cover object-center opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/70 to-transparent"></div>
        </div>
        
        {/* Animated Gradients */}
        <div className="absolute inset-0 z-5 opacity-40">
          <div className="absolute top-0 -left-1/3 w-2/3 h-2/3 bg-gta-pink opacity-10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 -right-1/3 w-2/3 h-2/3 bg-gta-blue opacity-10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-6 z-10 text-center relative mt-10">
          <div className="animate-fadeIn">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              GTA 6 <span className="text-gta-pink">Wiki</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 drop-shadow-md">
              Your comprehensive guide to Vice City, characters, vehicles, missions, and everything else in Grand Theft Auto VI.
            </p>
            
            {/* Search Form */}
            <div className="max-w-2xl mx-auto mb-8 animate-fadeInUp relative z-50" style={{ animationDelay: '0.3s' }}>
              <div className="relative bg-gray-800/60 backdrop-blur-md rounded-lg p-1 border border-gray-700/50 shadow-xl">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search titles, tags, and descriptions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent px-5 py-4 text-white focus:outline-none text-lg"
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-4 bg-gta-pink text-white rounded-r-md hover:bg-pink-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>

                {/* Search Results Dropdown */}
                {isSearching && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-[1000]">
                    <ul className="divide-y divide-gray-700 z-1000">
                      {/* Only show the first search result */}
                      <li className="hover:bg-gray-700/50 transition-colors">
                        <button 
                          onClick={() => handleSearchResultClick(searchResults[0])}
                          className="w-full text-left p-4 flex items-start space-x-4"
                        >
                          {searchResults[0].imageUrl && (
                            <div className="relative flex-shrink-0 w-16 h-16 rounded overflow-hidden">
                              <Image 
                                src={searchResults[0].imageUrl} 
                                alt={searchResults[0].title} 
                                fill 
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{searchResults[0].title}</h4>
                            <p className="text-gray-400 text-sm truncate">{searchResults[0].description}</p>
                            <span className="inline-block px-2 py-0.5 mt-1 text-xs rounded bg-gray-700 text-gray-300">
                              {WIKI_CATEGORIES.find(cat => cat.id === searchResults[0].category)?.title || searchResults[0].category}
                            </span>
                          </div>
                        </button>
                      </li>
                      
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Popular Tags */}
            <div className="max-w-2xl mx-auto mb-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-wrap gap-2 justify-center">
                
                {['Vice City', 'Jason', 'Lucia', 'Missions', 'Vehicles', 'Weapons', 'Map', 'Easter Eggs', 'Soundtrack'].map(tag => (
                  <Link
                    key={tag}
                    href={`/wiki/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm border border-gray-700 hover:bg-gray-700 hover:text-white transition-colors text-gray-300"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded mx-auto max-w-2xl">
                <p>{error}</p>
                <p className="text-sm mt-2">Using placeholder content and local images.</p>
              </div>
               )}
            </div>
              
            {/* Scroll indicator */}
            <div className="mt-6 mb-4 flex justify-center animate-bounce">
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
        
        
      
      <main className="flex-grow container mx-auto px-4 py-16 z-0">
        {/* Show diagnostic component only for admin users */}
        {isAdmin && <FirestoreDiagnostic />}
        
        {/* Categories */}
        <section className="mb-20 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white border-l-4 border-gta-pink pl-4">
              Browse by Category
            </h2>
            <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-pink to-transparent"></div>
          </div>
          
          {/* Show wiki page count for debugging */}
          <div className="mb-4 text-gray-400 text-sm">
            Total Wiki Pages: {allPages.length} | 
            Featured: {featuredPages.length} | 
            Recent: {recentPages.length}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {WIKI_CATEGORIES.map((category, index) => (
              <Link 
                key={category.id}
                href={`/wiki/${category.id}`}
                className="relative group bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg border border-gray-700 overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl animate-fadeInUp"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                {/* Color accent - make sure it's always visible */}
                <div 
                  className={`absolute top-0 left-0 w-2 h-full transition-all duration-500 group-hover:w-full group-hover:opacity-90 opacity-100`}
                  style={{
                    backgroundColor: 
                      category.id === 'characters' ? '#F152FF' : 
                      category.id === 'missions' ? '#52FDFF' : 
                      category.id === 'locations' ? '#56FF52' : 
                      category.id === 'vehicles' ? '#FFE552' : 
                      category.id === 'weapons' ? '#FF5252' : 
                      category.id === 'activities' ? '#AC52FF' : 
                      category.id === 'collectibles' ? '#FFAD6B' :
                      category.id === 'gameplay-mechanics' ? '#68FFD3' : 
                      category.id === 'updates' ? '#ADFF6B' :
                      category.id === 'gangs' ? '#D73333' : 
                      category.id === 'media' ? '#A66BFF' : 
                      category.id === 'misc' ? '#BBBBBB' : '#F152FF'
                  }}
                ></div>
                
                {/* Card gradient background - now with hover transparency */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-800/95 to-gray-900 transition-opacity duration-300 group-hover:opacity-40"></div>
                
                {/* Animated background - increased opacity on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                  <Image 
                    src={getLocalImageUrl(category.id)} 
                    alt={category.title} 
                    fill 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover blur-sm"
                  />
                </div>
                
                {/* Dark overlay that appears on hover to ensure text readability */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center">
                    <div 
                      className={`max-w-20 flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300`}>
                      <span className="text-2xl"><img src={category.icon} alt={category.title}></img></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white transition-colors">{category.title}</h3>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">{category.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Featured Pages */}
        {featuredPages.length > 0 && (
          <section className="mb-20 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white border-l-4 border-gta-blue pl-4">
                Featured Pages
              </h2>
              <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-blue to-transparent"></div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gta-blue"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPages.map((page, index) => (
                  <Link 
                    key={page.id} 
                    href={`/wiki/${page.category}/${page.slug}`}
                    className="group bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-700/50 animate-fadeInUp"
                    style={{ animationDelay: `${1 + index * 0.1}s` }}
                  >
                    {page.imageUrl && (
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={page.imageUrl}
                          alt={page.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="px-2 py-1 rounded-md text-xs bg-gray-900/80 backdrop-blur-sm text-gray-300 border border-gray-700/50">
                            {WIKI_CATEGORIES.find(cat => cat.id === page.category)?.title || page.category}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gta-pink transition-colors">{page.title}</h3>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-4">{page.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{formatDate(page.updatedAt)}</span>
                        <span className="text-gta-pink group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center">
                          Read more
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
        
        {/* Recent Pages & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 animate-fadeInUp" style={{ animationDelay: '1.1s' }}>
          {/* Recent Pages */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white border-l-4 border-gta-green pl-4">
                Recently Updated
              </h2>
              <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-green to-transparent"></div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gta-green"></div>
              </div>
            ) : (
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
                <ul className="divide-y divide-gray-700/70">
                  {recentPages.map((page, index) => (
                    <li 
                      key={page.id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${1.2 + index * 0.05}s` }}
                    >
                      <Link 
                        href={`/wiki/${page.category}/${page.slug}`}
                        className="flex items-center p-4 hover:bg-gray-700/50 transition-colors group"
                      >
                        {page.imageUrl && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                            <Image
                              src={page.imageUrl}
                              alt={page.title}
                              fill
                              sizes="64px"
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-grow">
                          <h3 className="text-white font-medium group-hover:text-gta-green transition-colors">{page.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-1">{page.description}</p>
                          <span className="inline-block text-xs text-gray-500 mt-1 mr-2">
                            {WIKI_CATEGORIES.find(cat => cat.id === page.category)?.title || page.category}
                          </span>
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-500">
                          {formatDate(page.updatedAt)}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                
              </div>
            )}
          </div>
          
          {/* Quick Links & Stats */}
          <div className="animate-fadeInUp" style={{ animationDelay: '1.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white border-l-4 border-gta-yellow pl-4">
                Stats
              </h2>
              <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-yellow to-transparent"></div>
            </div>
            
            <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 mb-6">
              <div className="p-5">
                <h3 className="text-lg font-bold text-white mb-4">Wiki Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Pages</span>
                    <span className="text-gta-pink font-bold">{allPages.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Categories</span>
                    <span className="text-gta-blue font-bold">{WIKI_CATEGORIES.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Featured Pages</span>
                    <span className="text-gta-green font-bold">{featuredPages.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Last Updated</span>
                    <span className="text-gta-yellow font-bold">{recentPages[0] ? formatDate(recentPages[0].updatedAt) : "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <section className="relative overflow-hidden rounded-xl p-1 animate-fadeInUp" style={{ animationDelay: '1.5s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-gta-pink via-gta-blue to-gta-green animate-gradient"></div>
          <div className="relative bg-gray-900/95 rounded-lg p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-4"> 🚧 Contribute to the Wiki 🚧 </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              <p className="text-gray-400 p-10">Currently, the wiki & contribution is under construction. Join our Discord if you have suggestions!</p>
              <p className="text-gray-400">Help build the most comprehensive resource for GTA 6 by contributing your knowledge and insights.</p>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="https://discord.gg/rGqyNP4AC6"
                className="px-8 py-4 bg-gradient-to-b from-indigo-400 to-indigo-500 text-white font-bold rounded-md hover:shadow-lg hover:shadow-gta-pink/20 transition-all hover:-translate-y-1"
              >
                Join our Discord
              </Link>
            </div>
          </div>
        </section>
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
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
        
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
} 