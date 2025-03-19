'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { NewsArticleFirestore, getNewsArticleBySlug, getAllNewsArticles } from '@/lib/newsFirestoreService';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<NewsArticleFirestore | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticleFirestore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Convert markdown to HTML
  const renderMarkdown = (content: string) => {
    const rawHtml = marked.parse(content) as string;
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(rawHtml);
    }
    return rawHtml;
  };
  
  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true);
        setError(null);
        
        // Get the article with the matching slug
        const currentArticle = await getNewsArticleBySlug(slug);
        
        if (currentArticle) {
          setArticle(currentArticle);
          
          // Get all published articles
          const allArticles = await getAllNewsArticles(false);
          
          // Find related articles (same category, excluding current)
          const related = allArticles
            .filter(a => a.category === currentArticle.category && a.id !== currentArticle.id)
            .slice(0, 3);
          
          setRelatedArticles(related);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Failed to load the article');
      } finally {
        setLoading(false);
      }
    }
    
    loadArticle();
  }, [slug]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="h-14 w-full"></div>
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gta-blue"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Error or article not found
  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <Navbar />
        <div className="h-12 w-full"></div>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl mb-4">Article Not Found</h1>
          <p className="mb-8">The article you're looking for doesn't exist or has been moved.</p>
          <Link href="/news" className="px-4 py-2 bg-gta-blue rounded-md">
            Return to News
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    
    const timestamp = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(timestamp);
  };
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="h-14 w-full"></div>
      
      <main className="flex-grow">
        {/* Article Header */}
        <div className="relative aspect-[5/1] w-full bg-gray-900">
          <Image 
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover opacity-80"
            priority
          />
          
          {/* Enhanced Header Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20 z-10"></div>
          
          {/* Animated Accent Lines */}
          <div className="absolute inset-0 z-10 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gta-pink to-gta-blue"></div>
          </div>
          
          {/* VCNEWS Watermark */}
          <div className="absolute bottom-6 right-6 w-32 h-auto z-20 opacity-50">
            <Image
              src="/vcnews.png"
              alt="Vice City News Network"
              width={200}
              height={60}
              className="w-full h-auto"
            />
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gta-pink/10 blur-[100px] animate-pulse z-0"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-gta-blue/10 blur-[100px] animate-pulse z-0" style={{ animationDelay: '1s' }}></div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 container mx-auto z-20">
            {/* Breadcrumb Navigation */}
            <div className="mb-6 flex items-center text-sm text-gray-400">
              <Link href="/news" className="hover:text-white transition-colors">News</Link>
              <span className="mx-2">›</span>
              <Link 
                href={`/news?category=${article.category}`}
                className="hover:text-white transition-colors"
              >
                {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
              </Link>
            </div>
            
            <Link 
              href={`/news?category=${article.category}`}
              className={`relative inline-block mb-4 group`}
            >
              <span className={`inline-block uppercase text-xs font-bold px-3 py-1 rounded-sm transition-transform group-hover:scale-105 ${
                article.category === 'news' ? 'bg-gta-blue' : 
                article.category === 'features' ? 'bg-gta-pink' : 
                'bg-gta-green'
              }`}>
                {article.category}
              </span>
            </Link>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold max-w-4xl text-white drop-shadow-lg mb-4">
              {article.title}
            </h1>
            
            <div className="mt-4 flex items-center text-gray-300">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                {article.author.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="font-medium">{article.author}</span>
              <span className="mx-2">•</span>
              <time className="text-gray-400">{formatDate(article.createdAt)}</time>
            </div>
          </div>
        </div>
        
        {/* Article Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="prose prose-lg prose-invert max-w-none">
                {/* Render the article content as HTML converted from markdown */}
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}></div>
              </div>
              
              {/* Tags */}
              <div className="mt-12 pt-6 border-t border-gray-800">
                <span className="text-gray-400 mr-3">Category:</span>
                <div className="inline-flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    article.category === 'news' ? 'bg-gta-blue' : 
                    article.category === 'features' ? 'bg-gta-pink' : 
                    'bg-gta-green'
                  }`}>
                    {article.category}
                  </span>
                </div>
              </div>
              
              {/* Author Info */}
              <div className="mt-8 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-xl">{article.author}</h3>
                    <p className="text-gray-400">Staff Writer</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              <div className="sticky top-24">
                <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-800">Related Articles</h3>
                <div className="space-y-6">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map(related => (
                      <Link key={related.id} href={`/news/${related.slug}`} className="block group">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 relative flex-shrink-0 rounded overflow-hidden">
                            <Image 
                              src={related.imageUrl}
                              alt={related.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold line-clamp-2 group-hover:text-gta-blue transition-colors">
                              {related.title}
                            </h4>
                            <p className="text-gray-400 text-sm mt-1">
                              {formatDate(related.createdAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-400">No related articles found</p>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mt-10 mb-6 pb-2 border-b border-gray-800">Categories</h3>
                <div className="space-y-2">
                  <Link 
                    href="/news?category=news"
                    className="block px-4 py-2 bg-gray-900/50 rounded hover:bg-gray-800 transition-colors"
                  >
                    News
                  </Link>
                  <Link 
                    href="/news?category=features"
                    className="block px-4 py-2 bg-gray-900/50 rounded hover:bg-gray-800 transition-colors"
                  >
                    Features
                  </Link>
                  <Link 
                    href="/news?category=guides"
                    className="block px-4 py-2 bg-gray-900/50 rounded hover:bg-gray-800 transition-colors"
                  >
                    Guides
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 