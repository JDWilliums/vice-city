'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { WikiCategory } from '@/lib/wikiHelpers';
import { getAllWikiPagesByCategory } from '@/lib/clientStorage';
import Image from 'next/image';

export default function WikiCategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  
  const [pages, setPages] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Find the category info
    const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === categoryId);
    setCategory(categoryInfo);
    
    // Load pages for this category
    if (typeof window !== 'undefined') {
      const categoryPages = getAllWikiPagesByCategory(categoryId as WikiCategory);
      setPages(categoryPages);
      setLoaded(true);
    }
  }, [categoryId]);

  // If category not found
  if (loaded && !category) {
    return (
      <div className="min-h-screen bg-black text-white bg-opacity-90 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 md:p-8 pt-28">
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-red-500">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-red-500">Category Not Found</h1>
            <p className="text-center mb-8">
              The wiki category "{categoryId}" does not exist.
            </p>
            <div className="flex justify-center">
              <Link href="/wiki" className="bg-gta-blue px-4 py-2 rounded-md hover:bg-opacity-80">
                Back to Wiki
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <div className="h-24 w-full"></div>
      
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {category && (
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gta-blue">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${category.color} mr-4`}>
                  {category.icon}
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold ${category.textColor}`}>{category.title}</h1>
              </div>
              
              <Link href="/wiki" className="text-sm text-gray-400 hover:text-white">
                ← Back to Wiki
              </Link>
            </div>
            
            <p className="text-xl text-gray-300 mb-8">{category.description}</p>
            
            {category.subcategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Subcategories</h2>
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((subcategory: string) => (
                    <Link 
                      key={subcategory}
                      href={`/wiki/${categoryId}?subcategory=${encodeURIComponent(subcategory)}`}
                      className={`px-3 py-1 rounded-full ${category.color} bg-opacity-20 hover:bg-opacity-40 transition-all`}
                    >
                      {subcategory}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-bold mb-4">Pages in this Category</h2>
            
            {pages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map(page => (
                  <Link
                    key={page.id}
                    href={`/wiki/${categoryId}/${page.id}`}
                    className="block p-6 rounded-lg border border-gray-800 hover:border-opacity-80 hover:border-blue-500 hover:-translate-y-1 transition-all"
                  >
                    <h3 className="text-xl font-bold mb-2">{page.title}</h3>
                    <p className="text-gray-400 line-clamp-2 mb-2">
                      {page.description}
                    </p>
                    
                    {page.subcategory && (
                      <span className={`inline-block text-sm ${category.color} bg-opacity-20 rounded-full px-2 py-0.5 mt-2`}>
                        {page.subcategory}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-xl text-gray-400 mb-4">No pages found in this category</p>
                <p className="text-gray-500 mb-6">
                  Be the first to create a page in this category!
                </p>
                
                <Link 
                  href={`/tools/wiki-generator?category=${categoryId}`}
                  className="bg-gta-blue px-4 py-2 rounded-md hover:bg-opacity-80"
                >
                  Create a Page
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
} 