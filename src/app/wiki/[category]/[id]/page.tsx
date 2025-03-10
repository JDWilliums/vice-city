'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { getWikiPageFromAllSources } from '@/lib/clientStorage';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Markdown renderer configuration
const renderer = {
  // Add custom rendering options if needed
};

// Use marked with the renderer
marked.use({ renderer });

export default function WikiEntryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const pageId = params.id as string;
  
  const [page, setPage] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [contentHtml, setContentHtml] = useState<string>('');
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Find the wiki page
      const wikiPage = getWikiPageFromAllSources(pageId);
      
      if (!wikiPage) {
        setNotFound(true);
        setLoaded(true);
        return;
      }
      
      setPage(wikiPage);
      
      // Find the category info
      const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === wikiPage.category);
      setCategory(categoryInfo);
      
      // Parse markdown content to HTML
      try {
        if (wikiPage.content) {
          // Use DOMPurify to sanitize HTML output
          const htmlContent = marked.parse(wikiPage.content) as string;
          const sanitizedHtml = DOMPurify.sanitize(htmlContent);
          setContentHtml(sanitizedHtml);
        }
      } catch (error) {
        console.error('Error parsing markdown:', error);
      }
      
      setLoaded(true);
    }
  }, [pageId]);

  // If page not found
  if (loaded && (notFound || !page)) {
    return (
      <div className="min-h-screen bg-black text-white h-12 bg-opacity-90 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 md:p-8 pt-28">
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-red-500">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-red-500">Page Not Found</h1>
            <p className="text-center mb-8">
              The wiki page "{pageId}" does not exist in category "{categoryId}".
            </p>
            <div className="flex justify-center">
              <Link href={`/wiki/${categoryId}`} className="bg-gta-blue px-4 py-2 rounded-md hover:bg-opacity-80">
                Back to {category ? category.title : 'Category'}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If still loading
  if (!loaded || !page || !category) {
    return (
      <div className="min-h-screen bg-black text-white bg-opacity-90 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 md:p-8 pt-28">
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gta-blue">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gta-blue"></div>
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
      <div className="h-24 w-full"></div> {/* Fixed height spacer */}
      
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gta-blue">
          {/* Navigation breadcrumb */}
          <div className="flex text-sm text-gray-400 mb-6">
            <Link href="/wiki" className="hover:text-white">
              Wiki
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/wiki/${categoryId}`} className="hover:text-white">
              {category.title}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{page.title}</span>
          </div>
          
          {/* Page header */}
          <div className="border-b border-gray-700 pb-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{page.title}</h1>
                <p className="text-xl text-gray-300">{page.description}</p>
              </div>
              
              <div className="flex gap-2">
                <Link 
                  href={`/tools/wiki-generator?edit=${page.id}`}
                  className="bg-gta-blue/20 hover:bg-gta-blue/40 px-3 py-1 rounded-md text-sm"
                >
                  Edit Page
                </Link>
              </div>
            </div>
            
            {/* Metadata */}
            <div className="flex flex-wrap gap-3 mt-4">
              <span className={`text-sm ${category.color} bg-opacity-20 rounded-full px-3 py-1`}>
                {category.title}
              </span>
              
              {page.subcategory && (
                <span className="text-sm bg-gray-700 rounded-full px-3 py-1">
                  {page.subcategory}
                </span>
              )}
            </div>
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article content */}
            <div className="lg:col-span-3">
              <article className="prose prose-invert prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              </article>
              
              {/* Tags */}
              {page.tags && page.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-bold mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {page.tags.map((tag: string) => (
                      <span 
                        key={tag}
                        className="bg-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 p-4 rounded-lg">
                {/* Image if available */}
                {page.imageUrl && (
                  <div className="mb-4">
                    <Image 
                      src={page.imageUrl} 
                      alt={page.title} 
                      width={300} 
                      height={200} 
                      className="w-full h-auto rounded-lg" 
                    />
                  </div>
                )}
                
                <h3 className="text-lg font-bold mb-2">Quick Info</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span>{category.title}</span>
                  </div>
                  
                  {page.subcategory && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subcategory:</span>
                      <span>{page.subcategory}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span>{new Date(page.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated:</span>
                    <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Related pages (if available) */}
                {page.relatedPages && page.relatedPages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2">Related Pages</h3>
                    <ul className="space-y-1">
                      {page.relatedPages.map((relatedPage: string) => (
                        <li key={relatedPage}>
                          <Link 
                            href={`/wiki/${category.id}/${relatedPage}`}
                            className="text-gta-blue hover:underline"
                          >
                            {relatedPage}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 