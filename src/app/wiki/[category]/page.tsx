'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getWikiPagesByCategory, getAllWikiPages } from '@/lib/wikiFirestoreService';
import { WikiCategory } from '@/lib/wikiHelpers';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { getLocalImageUrl } from '@/lib/localImageService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WikiCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as WikiCategory;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPages, setFilteredPages] = useState<any[]>([]);
  
  // Find category info
  const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === category);
  
  useEffect(() => {
    const fetchWikiPages = async () => {
      try {
        setLoading(true);
        
        // Try to fetch pages by category
        const fetchedPages = await getWikiPagesByCategory(category);
        
        if (fetchedPages && fetchedPages.length > 0) {
          // Process the pages to ensure they have image URLs
          const processedPages = fetchedPages.map(page => {
            // If the page doesn't have an image URL, assign a category-specific one
            if (!page.imageUrl) {
              return {
                ...page,
                imageUrl: getLocalImageUrl(category)
              };
            }
            return page;
          });
          
          setPages(processedPages);
          setFilteredPages(processedPages);
        } else {
          // If no pages found, try getting all pages and filtering
          console.warn(`No pages found directly for category: ${category}. Trying alternative method...`);
          
          const allPages = await getAllWikiPages(false);
          
          // Filter by this category
          const filteredByCategory = allPages.filter(page => 
            page.category === category && page.status === 'published'
          );
          
          if (filteredByCategory.length > 0) {
            // Process the pages to ensure they have image URLs
            const processedPages = filteredByCategory.map(page => {
              if (!page.imageUrl) {
                return {
                  ...page,
                  imageUrl: getLocalImageUrl(category)
                };
              }
              return page;
            });
            
            setPages(processedPages);
            setFilteredPages(processedPages);
          } else {
            // If still no pages, use placeholders
            console.warn(`No wiki pages found for category: ${category}. Using placeholders.`);
            setError('No wiki pages found in this category. Using placeholder content.');
            
            // Create placeholder pages
            const placeholders = createPlaceholderPages(6);
            setPages(placeholders);
            setFilteredPages(placeholders);
          }
        }
      } catch (error) {
        console.error('Error fetching wiki pages:', error);
        setError('Failed to load wiki pages. Using placeholder content.');
        
        // Create placeholder pages if we can't load from Firestore
        const placeholders = createPlaceholderPages(6);
        setPages(placeholders);
        setFilteredPages(placeholders);
      } finally {
        setLoading(false);
      }
    };
    
    if (category) {
      fetchWikiPages();
    } else {
      setError('Invalid category');
      setLoading(false);
    }
  }, [category]);
  
  // Function to create placeholder pages when real data can't be loaded
  const createPlaceholderPages = (count: number) => {
    const placeholders = [];
    
    for (let i = 0; i < count; i++) {
      placeholders.push({
        id: `placeholder-${i}`,
        title: `${categoryInfo?.title || 'Category'} Page ${i + 1}`,
        description: 'This is a placeholder for wiki content. Real content will appear once connected to the database.',
        slug: `placeholder-${category}-${i}`,
        category,
        imageUrl: getLocalImageUrl(category),
        tags: [`Tag ${i + 1}`, `Example`, `GTA 6`],
        updatedAt: { toDate: () => new Date() }
      });
    }
    
    return placeholders;
  };
  
  // Filter pages based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPages(pages);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = pages.filter(page => 
      page.title.toLowerCase().includes(query) || 
      page.description.toLowerCase().includes(query) ||
      (page.tags && Array.isArray(page.tags) && page.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
    
    setFilteredPages(filtered);
  }, [searchQuery, pages]);
  
  // Handle search form submission for global search
  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/wiki/search?q=${encodeURIComponent(searchQuery)}`);
    }
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
  
  if (!categoryInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
            <p>Category not found</p>
            <p className="mt-4">
              <Link href="/wiki" className="text-gta-blue hover:underline">
                Return to Wiki Home
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get the category image from localImageService
  const categoryBgImage = getLocalImageUrl(category);
  
  // Get the category icon image URL
  const categoryIconUrl = `/images/icons/${category}.png`;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar transparent={true} />
      
      {/* Category Hero Header - with reduced color intensity */}
      <div className="relative py-28 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={categoryBgImage}
            alt={categoryInfo.title}
            fill
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-transparent to-gray-900/80"></div>
          {/* Subtle category color accent instead of a full overlay */}
          <div className={`absolute inset-0 ${categoryInfo.color} opacity-20`}></div>
        </div>
        
        <div className="container mx-auto px-6 z-10 relative">
          <div className="animate-fadeIn max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center text-sm text-white/80">
              <Link href="/wiki" className="hover:text-white transition-colors">
                Wiki
              </Link>
              <span className="mx-2">›</span>
              <span className={`text-white font-medium`}>{categoryInfo.title}</span>
            </div>
            
            <div className="flex items-center mb-8">
              <div className={`w-20 h-20 rounded-xl bg-gray-800/80 flex items-center justify-center mr-6 shadow-lg overflow-hidden backdrop-blur-sm border border-gray-700`}>
                <Image 
                  src={categoryIconUrl}
                  alt={categoryInfo.title}
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold text-white mb-3`}>
                  <span className={categoryInfo.textColor}>{categoryInfo.title}</span>
                </h1>
                <p className="text-xl text-white/90">{categoryInfo.description}</p>
              </div>
            </div>
            
            {/* Search Form */}
            <div className="bg-gray-800/60 backdrop-blur-md rounded-lg p-1 border border-gray-700/50 shadow-xl mb-4">
              <form onSubmit={handleGlobalSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder={`Search ${categoryInfo.title}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-5 py-3 text-white focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="px-5 py-3 bg-gray-700/80 text-white rounded-r-md hover:bg-gray-600 transition-colors"
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
                {error.includes('placeholder') && (
                  <p className="text-sm mt-2">Using placeholder content and local images.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Filter Tags */}
        {filteredPages.length > 0 && !loading && (
          <div className="mb-8 flex flex-wrap gap-2 items-center animate-fadeInUp">
            <span className="text-gray-400 mr-2">Quick Filters:</span>
            {Array.from(new Set(pages.flatMap(page => page.tags || []))).slice(0, 8).map((tag: string) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className={`px-3 py-1.5 rounded-full text-sm border border-gray-700 
                  ${searchQuery === tag 
                    ? `bg-gray-700/90 ${categoryInfo.textColor}` 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  } transition-colors`}
              >
                {tag}
              </button>
            ))}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 rounded-full text-sm bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors ml-auto"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        {loading ? (
          <div className="flex flex-col justify-center items-center min-h-[400px]">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${categoryInfo.textColor} mb-4`}></div>
            <p className="text-gray-400">Loading {categoryInfo.title.toLowerCase()}...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 animate-fadeIn">
            <div className="text-5xl mb-4 opacity-40">
              <Image 
                src={categoryIconUrl}
                alt={categoryInfo.title}
                width={80}
                height={80}
                className="mx-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No pages found</h2>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? `No results match your search for "${searchQuery}" in this category.` 
                : 'No pages found in this category yet.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
              <Link 
                href={`/admin/wiki/create?category=${category}`}
                className={`px-6 py-3 bg-gray-800 hover:bg-gray-700 ${categoryInfo.textColor} font-bold rounded-md transition-colors border ${categoryInfo.borderColor}`}
              >
                Create the First Page
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {filteredPages.map((page, index) => (
              <Link 
                key={page.id} 
                href={`/wiki/${category}/${page.slug}`}
                className="group bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {page.imageUrl && (
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={page.imageUrl}
                      alt={page.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                    {page.tags && page.tags.length > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-wrap gap-2">
                        {page.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="px-2 py-1 rounded-md text-xs bg-black/50 backdrop-blur-sm text-gray-300 border border-gray-700/50">
                            {tag}
                          </span>
                        ))}
                        {page.tags.length > 3 && (
                          <span className="px-2 py-1 rounded-md text-xs bg-black/50 backdrop-blur-sm text-gray-300 border border-gray-700/50">
                            +{page.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gta-pink transition-colors">{page.title}</h3>
                  <p className="text-gray-300 text-sm line-clamp-2 mb-4">{page.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{formatDate(page.updatedAt)}</span>
                    <span className={`${categoryInfo.textColor} group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center`}>
                      View details
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
        
        {/* Pagination or Load More (if needed) */}
        {filteredPages.length > 0 && filteredPages.length < pages.length && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 bg-gray-800 text-white font-bold rounded-md hover:bg-gray-700 transition-colors"
            >
              Show All {pages.length} Pages
            </button>
          </div>
        )}
        
        {/* Call to Action - with reduced color intensity */}
        <div className="mt-16 relative overflow-hidden rounded-xl border border-gray-700 animate-fadeInUp">
          <div className="absolute inset-0">
            <Image 
              src={categoryBgImage}
              alt={categoryInfo.title}
              fill
              className="object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
            {/* Subtle category color accent */}
            <div className={`absolute inset-0 ${categoryInfo.color} opacity-20`}></div>
          </div>
          
          <div className="relative p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Create New {categoryInfo.title.slice(0, -1)} Page
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Help expand the GTA 6 Wiki by adding your knowledge about {categoryInfo.title.toLowerCase()}.
            </p>
            <Link 
              href={`/admin/wiki/create?category=${category}`}
              className={`inline-block px-6 py-3 bg-gray-800 ${categoryInfo.textColor} font-bold rounded-md hover:bg-gray-700 transition-colors border ${categoryInfo.borderColor}`}
            >
              Create New Page
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Add required CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 