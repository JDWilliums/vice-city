'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Main wiki categories moved to data/wikiData.ts

export default function WikiHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tools/wiki-browser?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-24 w-full"></div> {/* Fixed height spacer */}
      <main className="min-h-screen relative">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/gta6-background.jpg" 
            alt="GTA 6 Background" 
            fill
            className="object-cover object-center opacity-15"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/95 via-gray-900/95 to-dark-bg/95 z-0"></div>
        
        <div className="container-custom py-12 relative z-10">
          {/* Decorative elements */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gta-pink/5 rounded-full blur-[150px]"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-gta-blue/5 rounded-full blur-[150px]"></div>
          
          <header className="text-center mb-16 relative z-10">
            <div className="flex justify-center mb-4">
              <div className="relative group p-8">
                <div className="absolute -inset-10 bg-gradient-to-r from-gta-pink to-gta-blue rounded-full blur-[200px] opacity-100 group-hover:opacity-70 transition duration-10000 animate-pulse"></div>
                <Image 
                  src="/logo-wp.png" 
                  alt="GTA 6 Wiki" 
                  width={300} 
                  height={100} 
                  className="w-auto h-16 md:h-20 relative z-10" 
                />
              </div>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Your comprehensive guide to all things Grand Theft Auto VI. Browse through detailed information about characters, missions, locations, and more.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gta-pink to-gta-blue rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <form onSubmit={handleSearch} className="relative flex items-center bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-700">
                  <input
                    type="text"
                    placeholder="Search the Vice City Wiki..."
                    className="w-full px-6 py-4 bg-transparent text-white outline-none placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="mr-2 px-4 py-2 bg-gradient-to-b from-gta-pink to-pink-500 text-white rounded-md hover:from-pink-500 hover:to-gta-pink transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>
              <div className="flex justify-center mt-3 space-x-3 text-sm text-gray-400">
                <span>Popular:</span>
                <a href="/wiki/characters/lucia" className="hover:text-gta-pink">Lucia</a>
                <a href="/wiki/characters/jason" className="hover:text-gta-pink">Jason</a>
                <a href="/wiki/locations/vice-beach" className="hover:text-gta-blue">Vice Beach</a>
                <a href="/wiki/missions/heists" className="hover:text-gta-green">Heists</a>
              </div>
            </div>
          </header>

          {/* Wiki Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {WIKI_CATEGORIES.map((category) => (
              <div key={category.id} className="card backdrop-blur-sm bg-gray-800/70 hover:bg-gray-800/90 border border-gray-700 hover:border-opacity-100 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg group">
                <div className={`mb-6 text-white text-4xl flex justify-center ${category.color} w-16 h-16 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <span>{category.icon}</span>
                </div>
                <h2 className={`text-2xl font-bold mb-3 text-center text-white group-hover:${category.textColor} transition-colors`}>
                  {category.title}
                </h2>
                <p className="text-gray-300 mb-6 text-center">
                  {category.description}
                </p>
                
                {/* Subcategories */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Categories:</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((subcategory) => (
                      <Link 
                        key={subcategory} 
                        href={`/wiki/${category.id}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`}
                        className={`px-3 py-1 bg-gray-700/50 rounded-full text-sm hover:bg-gray-600 transition-colors hover:${category.borderColor} border border-transparent hover:border-opacity-100`}
                      >
                        {subcategory}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* View All Link */}
                <div className="mt-6 text-center">
                  <Link 
                    href={`/wiki/${category.id}`}
                    className={`${category.textColor} hover:opacity-80 transition-colors font-medium inline-flex items-center`}
                  >
                    View All {category.title}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent Updates */}
          <section className="mt-20">
            <h2 className="text-3xl font-bold mb-12 text-center relative inline-block mx-auto">
              <span className="bg-clip-text text-white">
                Recently Updated
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* This would be dynamically generated in a real app */}
              {[1, 2, 3].map((i) => (
                <article key={i} className="card bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                  <div className="mb-3 flex items-center">
                    <span className="text-xs font-medium text-gray-400">Updated 2 days ago</span>
                    <span className="ml-auto px-2 py-1 bg-gray-700/70 rounded-full text-xs">
                      {['Characters', 'Missions', 'Locations'][i-1]}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white hover:text-gta-blue transition-colors">Wiki Article Title {i}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.
                  </p>
                  <Link 
                    href={`/wiki/article/${i}`}
                    className="text-gta-blue hover:text-blue-400 transition-colors font-medium inline-flex items-center"
                  >
                    Read More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          </section>
          
          {/* How to Contribute */}
          <section className="mt-20 text-center relative overflow-hidden">
            <div className="absolute -inset-px bg-gradient-to-r from-gta-pink/5 via-gta-blue/10 to-gta-green/5 rounded-xl"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-800/20 to-transparent"></div>
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-gta-pink/5 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gta-blue/5 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10 bg-gray-900/50 backdrop-blur-sm p-10 rounded-xl border border-gray-800">
              <h2 className="text-3xl font-bold mb-4 bg-clip-text text-white">Contribute to the Wiki</h2>
              <p className="text-gray-300 max-w-3xl mx-auto mb-8">
                Help us build the most comprehensive resource for GTA VI by contributing your knowledge and discoveries. Join our community of contributors!
              </p>
              <div className="space-x-4">
                <Link href="/contribute" className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1">
                  How to Contribute
                </Link>
                <Link href="/tools/wiki-generator" className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1">
                  Use Wiki Generator
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
} 