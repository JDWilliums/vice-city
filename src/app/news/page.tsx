'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { newsArticles } from '@/data/newsData';

export default function NewsPage() {
  const [filter, setFilter] = useState('all');
  
  // Get featured article (most recent)
  const featuredArticle = newsArticles[0];
  
  // Filter articles if needed
  const filteredArticles = filter === 'all' 
    ? newsArticles.slice(1) // Skip the featured article
    : newsArticles.slice(1).filter(article => article.category === filter);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="h-12 w-full"></div> {/* Fixed height spacer */}
      
      <main className="flex-grow">
        {/* Page Header */}
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-900 to-black border-b border-gta-blue/30">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gta-pink/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gta-blue/10 rounded-full blur-[20px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex flex-col items-center justify-center">
              {/* VCNEWS Logo Image */}
              <div className="relative mb-8 w-full max-w-2xl mx-auto">
                <div className="absolute -inset-4 bg-gradient-to-r from-gta-pink via-gta-blue to-gta-blue rounded-full blur-[200px] opacity-10 animate-pulse"></div>
                <div className="relative">
                  <Image
                    src="/vcnews.png"
                    alt="Vice City News Network"
                    width={9999}
                    height={999}
                    className="h-100"
                    priority
                  />
                </div>
              </div>
              
              <p className="text-gray-400 max-w-2xl text-center mb-8 text-lg">
                Your source for the latest updates, features and guides for Grand Theft Auto VI
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/news?category=news" 
                  className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full hover:from-gta-blue hover:to-gta-blue/70 transition-all border border-gray-700 text-sm font-medium"
                >
                  Latest News
                </Link>
                <Link 
                  href="/news?category=features" 
                  className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full hover:from-gta-pink hover:to-gta-pink/70 transition-all border border-gray-700 text-sm font-medium"
                >
                  Features
                </Link>
                <Link 
                  href="/news?category=guides" 
                  className="px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full hover:from-gta-green hover:to-gta-green/70 transition-all border border-gray-700 text-sm font-medium"
                >
                  Guides
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Article */}
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
                  <span className="bg-gta-pink text-white text-xs px-2 py-1 rounded-sm uppercase font-bold">
                    {featuredArticle.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mt-2 text-white group-hover:text-gta-blue transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <div className="mt-2 flex items-center text-sm text-gray-400">
                    <span>{featuredArticle.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(featuredArticle.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link href={`/news/${featuredArticle.slug}`} className="absolute inset-0" aria-label={featuredArticle.title}></Link>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gta-blue">Latest News</h3>
                <div className="space-y-4">
                  {newsArticles.slice(1, 5).map(article => (
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
                            <span>{new Date(article.date).toLocaleDateString()}</span>
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
        
        {/* All Articles */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">All Articles</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setFilter('all')} 
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-gta-blue text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('news')} 
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'news' ? 'bg-gta-blue text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  News
                </button>
                <button 
                  onClick={() => setFilter('features')} 
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'features' ? 'bg-gta-blue text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  Features
                </button>
                <button 
                  onClick={() => setFilter('guides')} 
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'guides' ? 'bg-gta-blue text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  Guides
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
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
                        <span className="ml-auto text-sm text-gray-500">{new Date(article.date).toLocaleDateString()}</span>
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
      </main>
      
      <Footer />
    </div>
  );
} 