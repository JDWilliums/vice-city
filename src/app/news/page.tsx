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
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black border-b border-gta-blue/30">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/gta6-10.png"
              alt="News Header Background"
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gta-pink/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gta-blue/10 rounded-full blur-[250px]"></div>
          </div>
          
          <div className="container mx-auto top-8 py-16 relative z-10 flex justify-center items-center">
            <div className="flex flex-col items-center justify-center">
              {/* VCNEWS Logo Image */}
              <div className="relative mb-8 w-full max-w-2xl mx-auto justify-center items-center">

                <div className="">
                <div className="absolute -inset-4 blur-[100px] opacity-10000">
                <Image
                    src="/vcnews.png"
                    alt="Vice City News Network"
                    width={400}
                    height={400}
                  />
                </div>
                </div>
                
                <div className="relative flex justify-center items-center">
                  <Image
                    src="/vcnews.png"
                    alt="Vice City News Network"
                    width={400}
                    height={200}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 items-center">
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
          <section className="bg-gradient-to-b from-gray-900 to-black py-12">
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
                    {otherArticles.slice(0, 4).map(article => (
                      <Link key={article.id} href={`/news/${article.slug}`} className="block group">
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
        {!loading && !error && otherArticles.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">All Articles</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherArticles.map(article => (
                  <Link 
                    key={article.id} 
                    href={`/news/${article.slug}`}
                    className="group"
                  >
                    <article className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden hover:border-gta-blue transition-colors h-full flex flex-col">
                      <div className="relative aspect-video overflow-hidden">
                        <Image 
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex-grow flex flex-col">
                        <div className="flex items-center mb-3">
                          <span className={`text-xs px-2 py-1 rounded-sm uppercase font-bold ${
                            article.category === 'news' ? 'bg-gta-blue' : 
                            article.category === 'features' ? 'bg-gta-pink' : 
                            'bg-gta-green'
                          }`}>
                            {article.category}
                          </span>
                          <span className="ml-auto text-sm text-gray-500">{formatDate(article.createdAt)}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-gta-blue transition-colors">{article.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-auto">
                          <span>{article.author}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 