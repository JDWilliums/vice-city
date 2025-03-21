'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { NewsArticleFirestore, getAllNewsArticles, getNewsArticlesByCategory } from '@/lib/newsFirestoreService';

export default function NewsPage() {
  const [filter, setFilter] = useState('all');
  const [articles, setArticles] = useState<NewsArticleFirestore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate reading time
  const calculateReadingTime = (content: string): string => {
    // Average reading speed (words per minute)
    const wordsPerMinute = 200;
    
    // Count words in the content
    const wordCount = content?.split(/\s+/).length || 0;
    
    // Calculate reading time in minutes
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    // Return formatted string
    if (minutes < 1) {
      return "< 1 min read";
    } else if (minutes === 1) {
      return "1 min read";
    } else {
      return `${minutes} min read`;
    }
  };
  
  // Load all articles
  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        setError(null);
        
        let loadedArticles: NewsArticleFirestore[];
        
        if (filter === 'all') {
          loadedArticles = await getAllNewsArticles(false);
        } else {
          loadedArticles = await getNewsArticlesByCategory(filter as 'news' | 'features' | 'guides');
        }
        
        setArticles(loadedArticles);
      } catch (err) {
        console.error('Error loading articles:', err);
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    }
    
    loadArticles();
  }, [filter]);
  
  // Get featured article (most recent)
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  
  // Other articles (skip featured)
  const otherArticles = articles.length > 1 ? articles.slice(1) : [];
  
  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    
    const timestamp = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(timestamp);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar transparent={true} />
      <div className="w-full"></div> {/* Fixed height spacer */}
      
      <main className="flex-grow">
        {/* Page Header */}
        <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br z-10 from-gray-900 via-gray-800 to-gray-900 pt-20">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/gta6-10.png"
              alt="News Header Background"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/70 to-transparent"></div>
          </div>
          
          {/* Animated Gradients */}
          <div className="absolute inset-0 z-5 opacity-40">
            <div className="absolute top-0 -left-1/3 w-2/3 h-2/3 bg-gta-pink opacity-10 rounded-full blur-[200px] animate-pulse"></div>
            <div className="absolute bottom-0 -right-1/3 w-2/3 h-2/3 bg-gta-blue opacity-10 rounded-full blur-[300px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container mx-auto px-6 z-10 text-center relative mt-10">
            <div className="animate-fadeIn">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
                GTA 6 <span className="text-gta-blue">News</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 drop-shadow-md">
                Latest updates, features, and guides for everything Grand Theft Auto VI.
              </p>
              
              {/* Filter Buttons with Animation */}
              <div className="flex flex-wrap justify-center gap-4 items-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-6 py-2 rounded-full border border-gray-700 text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-gta-blue to-gta-blue/70 border-gta-blue'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gta-blue hover:to-gta-blue/70'
                  }`}
                >
                  All News
                </button>
                <button 
                  onClick={() => setFilter('news')}
                  className={`px-6 py-2 rounded-full border border-gray-700 text-sm font-medium transition-all ${
                    filter === 'news'
                      ? 'bg-gradient-to-r from-gta-blue to-gta-blue/70 border-gta-blue'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gta-blue hover:to-gta-blue/70'
                  }`}
                >
                  Latest News
                </button>
                <button 
                  onClick={() => setFilter('features')}
                  className={`px-6 py-2 rounded-full border border-gray-700 text-sm font-medium transition-all ${
                    filter === 'features'
                      ? 'bg-gradient-to-r from-gta-pink to-gta-pink/70 border-gta-pink'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gta-pink hover:to-gta-pink/70'
                  }`}
                >
                  Features
                </button>
                <button 
                  onClick={() => setFilter('guides')}
                  className={`px-6 py-2 rounded-full border border-gray-700 text-sm font-medium transition-all ${
                    filter === 'guides'
                      ? 'bg-gradient-to-r from-gta-green to-gta-green/70 border-gta-green'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gta-green hover:to-gta-green/70'
                  }`}
                >
                  Guides
                </button>
              </div>
            </div>
            
            {/* Scroll indicator - positioned at bottom of header */}
            <div className="mt-6 mb-4 flex justify-center animate-bounce">
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="container mx-auto px-4 py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gta-blue"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="container mx-auto px-4 py-12">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
              <p className="text-red-300">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-white"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* No Articles State */}
        {!loading && !error && articles.length === 0 && (
          <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-gray-400 text-lg">No articles found</p>
          </div>
        )}
        
        {/* Featured Article */}
        {!loading && !error && featuredArticle && (
          <section className="bg-gradient-to-b from-gray-900 to-black py-12 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-800 hover:border-gta-blue transition-colors group">
                  <Image 
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className={`text-white text-xs px-2 py-1 rounded-sm uppercase font-bold ${
                      featuredArticle.category === 'news' ? 'bg-gta-blue' : 
                      featuredArticle.category === 'features' ? 'bg-gta-pink' : 
                      'bg-gta-green'
                    }`}>
                      {featuredArticle.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold mt-2 text-white group-hover:text-gta-blue transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <div className="mt-2 flex items-center text-sm text-gray-400">
                      <span>{featuredArticle.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(featuredArticle.createdAt)}</span>
                    </div>
                  </div>
                  <Link href={`/news/${featuredArticle.slug}`} className="absolute inset-0" aria-label={featuredArticle.title}></Link>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gta-blue">Latest News</h3>
                  <div className="space-y-4">
                    {otherArticles.slice(0, 4).map((article, index) => (
                      <Link key={article.id} href={`/news/${article.slug}`} className="block group animate-fadeInUp" style={{ animationDelay: `${0.8 + index * 0.1}s` }}>
                        <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                          <div className="w-24 h-24 relative flex-shrink-0 rounded overflow-hidden">
                            <Image 
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold group-hover:text-gta-blue transition-colors">{article.title}</h4>
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <span>{article.author}</span>
                              <span className="mx-1">•</span>
                              <span>{formatDate(article.createdAt)}</span>
                              <span className="mx-1">•</span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {calculateReadingTime(article.content)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* All Articles */}
        {!loading && !error && articles.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              {/* Section Headers with animation */}
              <div className="mb-8 flex items-center animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
                <h2 className="text-3xl font-bold text-white border-l-4 border-gta-blue pl-4">
                  All Articles
                </h2>
                <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-blue to-transparent"></div>
              </div>
              
              {/* Article Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherArticles.slice(4).map((article, index) => (
                  <Link 
                    key={article.id} 
                    href={`/news/${article.slug}`} 
                    className="group bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-700/50 animate-fadeInUp"
                    style={{ animationDelay: `${1 + index * 0.1}s` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image 
                        src={article.imageUrl} 
                        alt={article.title}
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                      <div className="absolute top-2 left-2">
                        <span className={`text-white text-xs px-2 py-1 rounded-sm uppercase font-bold ${
                          article.category === 'news' ? 'bg-gta-blue' : 
                          article.category === 'features' ? 'bg-gta-pink' : 
                          'bg-gta-green'
                        }`}>
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white group-hover:text-gta-blue transition-colors">{article.title}</h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{article.author}</span>
                          <span className="mx-1">•</span>
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                        <span className="text-xs text-gta-blue">{calculateReadingTime(article.content)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
      
      {/* Add required CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
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
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 8s infinite;
        }
      `}</style>
    </div>
  );
} 