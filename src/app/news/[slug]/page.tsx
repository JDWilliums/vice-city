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
import Prism from 'prismjs';

// Import Prism languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<NewsArticleFirestore | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticleFirestore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update document title when article is loaded
  useEffect(() => {
    if (article) {
      document.title = `${article.title} | GTA 6 News | vice.city`;
    } else if (error) {
      document.title = 'Article Not Found | GTA 6 News | vice.city';
    }
  }, [article, error]);
  
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
  
  // Apply syntax highlighting when content changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && article) {
      Prism.highlightAll();
    }
  }, [article, loading]);
  
  // Convert markdown to HTML
  const renderMarkdown = (content: string) => {
    if (!content) return '';
    
    // Configure marked options
    marked.setOptions({
      gfm: true,
      breaks: true,
      // headerIds is not in the type but actually supported by marked
      // @ts-ignore
      headerIds: true,
      highlight: function(code: string, lang: string) {
        return `<pre class="language-${lang}"><code class="language-${lang}">${code}</code></pre>`;
      }
    });
    
    // Create a new renderer that uses ID generation logic
    const renderer = new marked.Renderer();
    
    // Track used IDs to avoid duplicates
    const usedIds = new Set<string>();
    
    renderer.heading = (text, level) => {
      // Generate base ID
      let headingId = text.toLowerCase().replace(/[^\w]+/g, '-');
      
      // Ensure unique ID
      if (usedIds.has(headingId)) {
        // Find a unique ID by adding a numeric suffix
        let counter = 1;
        let newId = `${headingId}-${counter}`;
        while (usedIds.has(newId)) {
          counter++;
          newId = `${headingId}-${counter}`;
        }
        headingId = newId;
      }
      
      // Add to used IDs set
      usedIds.add(headingId);
      
      return `<h${level} id="${headingId}">${text}</h${level}>`;
    };
    
    marked.setOptions({ renderer });
    
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
      <div className="min-h-screen bg-black text-white flex flex-col">
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
      <Navbar transparent={true} />
      
      
      <main className="flex-grow">
        {/* Article Header */}
        <div className="relative min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br z-10 from-gray-900 via-gray-800 to-gray-900">
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
              <Link href="/news" className="hover:text-white transition-colors">Vice News</Link>
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
                'bg-red-500'
              }`}>
                {article.category}
              </span>
            </Link>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold max-w-4xl text-white drop-shadow-lg mb-4">
              {article.title}
            </h1>
            
            <div className="mt-4 flex items-center text-gray-300">
              <div className="w-8 h-8 bg-gradient-to-br from-gta-blue to-gta-pink rounded-full flex items-center justify-center text-sm font-bold text-gray-900 shadow-md mr-2">
                {article.author.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="font-medium">{article.author}</span>
              <span className="mx-2">•</span>
              <time className="text-gray-400">{formatDate(article.createdAt)}</time>
              <span className="mx-2">•</span>
              <div className="flex items-center text-gray-400">
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{calculateReadingTime(article.content)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Article Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="prose prose-lg prose-invert max-w-none bg-gray-900/30 p-8 rounded-lg shadow-xl border border-gray-800">
                {/* Article Excerpt/Lead-in */}
                <p className="text-xl text-gray-300 font-medium mb-4 leading-relaxed border-l-4 border-gta-blue pl-4 italic">
                  {article.excerpt}
                </p>
                
                {/* Reading Time */}
                <div className="flex items-center text-sm text-gray-400 mb-8 ml-4">
                  <svg className="w-4 h-4 mr-1 text-gta-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{calculateReadingTime(article.content)}</span>
                </div>
                
                {/* Render the article content as HTML converted from markdown */}
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}></div>
              </div>
              
              {/* Tags */}
              <div className="mt-12 pt-6 border-t border-gray-800 flex flex-wrap items-center">
                <span className="text-gray-400 mr-3 font-medium">Category:</span>
                <div className="inline-flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    article.category === 'news' ? 'bg-gta-blue text-gray-900' : 
                    article.category === 'features' ? 'bg-gta-pink text-gray-900' : 
                    'bg-gta-green text-gray-900'
                  }`}>
                    {article.category}
                  </span>
                </div>
                
                <span className="ml-auto text-gray-400 text-sm">
                  Published on {formatDate(article.createdAt)}
                </span>
              </div>
              
              {/* Author Info */}
              <div className="mt-8 p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gta-blue to-gta-pink rounded-full flex items-center justify-center text-xl font-bold text-gray-900 shadow-md">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-xl text-white">Written by {article.author}</h3>
                    <p className="text-gray-400">Staff Writer</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              <div className="sticky top-24">
                <h3 className="text-xl font-bold mb-6 pb-2 border-b border-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-gta-blue mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Related Articles
                </h3>
                <div className="space-y-6">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map(related => (
                      <Link key={related.id} href={`/news/${related.slug}`} className="block group">
                        <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-700">
                          <div className="w-24 h-24 relative flex-shrink-0 rounded overflow-hidden">
                            <Image 
                              src={related.imageUrl}
                              alt={related.title}
                              fill
                              className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <div>
                            <h4 className="font-bold line-clamp-2 group-hover:text-gta-blue transition-colors">
                              {related.title}
                            </h4>
                            <p className="text-gray-400 text-sm mt-1 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
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
                
                <h3 className="text-xl font-bold mt-10 mb-6 pb-2 border-b border-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-gta-pink mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  Categories
                </h3>
                <div className="space-y-3">
                  <Link 
                    href="/news?category=news"
                    className="block w-full text-left px-4 py-3 bg-gray-900/50 rounded hover:bg-gray-800 transition-colors border border-transparent hover:border-gta-blue group"
                  >
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-gta-blue rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                      <span className="group-hover:text-gta-blue transition-colors">News</span>
                    </div>
                  </Link>
                  <Link 
                    href="/news?category=features"
                    className="block w-full text-left px-4 py-3 bg-gray-900/50 rounded hover:bg-gray-800 transition-colors border border-transparent hover:border-gta-pink group"
                  >
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-gta-pink rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                      <span className="group-hover:text-gta-pink transition-colors">Features</span>
                    </div>
                  </Link>
                  <Link 
                    href="/news?category=guides"
                    className="block w-full text-left px-4 py-3 bg-gray-900/50 rounded hover:bg-gray-800 transition-colors border border-transparent hover:border-gta-green group"
                  >
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-gta-green rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                      <span className="group-hover:text-gta-green transition-colors">Guides</span>
                    </div>
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