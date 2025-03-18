'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getWikiPageBySlug } from '@/lib/wikiFirestoreService';
import { WikiCategory } from '@/lib/wikiHelpers';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { getLocalImageUrl, getMultipleLocalImageUrls } from '@/lib/localImageService';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WikiPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const slug = params.slug as string;
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [tableOfContents, setTableOfContents] = useState<{id: string, text: string, level: number}[]>([]);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWikiPage = async () => {
      try {
        setLoading(true);
        const page = await getWikiPageBySlug(slug);
        
        if (!page) {
          setError('Wiki page not found');
          
          // Create a placeholder page if the actual page can't be found
          const placeholderPage = createPlaceholderPage();
          setPageData(placeholderPage);
        } else {
          // If the page exists but doesn't have an image, add one
          if (!page.imageUrl) {
            page.imageUrl = getLocalImageUrl(category);
          }
          
          // If the page doesn't have gallery images, add some placeholders
          if (!page.galleryImages || page.galleryImages.length === 0) {
            page.galleryImages = getMultipleLocalImageUrls(3, category);
          }
          
          setPageData(page);
        }
      } catch (error) {
        console.error('Error fetching wiki page:', error);
        setError('Failed to load wiki page. Displaying placeholder content.');
        
        // Create a placeholder page when there's an error
        const placeholderPage = createPlaceholderPage();
        setPageData(placeholderPage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWikiPage();
  }, [slug, category]);
  
  // Generate table of contents from markdown after page data is loaded
  useEffect(() => {
    if (pageData?.content) {
      const headings: {id: string, text: string, level: number}[] = [];
      const renderer = new marked.Renderer();
      
      // Track used IDs to avoid duplicates
      const usedIds = new Set<string>();
      
      renderer.heading = (text, level) => {
        if (level <= 3) { // Only include h1, h2, and h3
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
          
          headings.push({ id: headingId, text, level });
          return `<h${level} id="${headingId}">${text}</h${level}>`;
        }
        return `<h${level} id="${text.toLowerCase().replace(/[^\w]+/g, '-')}">${text}</h${level}>`;
      };
      
      marked.setOptions({ renderer });
      marked.parse(pageData.content);
      setTableOfContents(headings);
    }
  }, [pageData]);
  
  // Track active heading while scrolling
  useEffect(() => {
    if (contentRef.current && tableOfContents.length > 0) {
      // Get the navbar height to adjust the intersection observer
      // Typical navbar height is around 80px, but we'll add a buffer
      const navbarHeight = 90; // Adjust this value to match your navbar height
      
      const observer = new IntersectionObserver(
        (entries) => {
          // Filter for elements that are intersecting
          const intersecting = entries.filter(entry => entry.isIntersecting);
          
          if (intersecting.length) {
            // Get the one that's highest up (closest to the top of the viewport)
            const topMostEntry = intersecting.reduce((prev, current) => {
              return prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current;
            });
            
            setActiveHeading(topMostEntry.target.id);
          }
        },
        { 
          // Adjust the top margin to account for the navbar
          // We want to consider a heading "visible" when it's below the navbar
          rootMargin: `-${navbarHeight}px 0px -70% 0px`,
          threshold: 0.1 // Detect when at least 10% of the element is visible
        }
      );
      
      tableOfContents.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      });
      
      return () => {
        tableOfContents.forEach(({ id }) => {
          const element = document.getElementById(id);
          if (element) observer.unobserve(element);
        });
      };
    }
  }, [tableOfContents, pageData, loading]);
  
  // Function to create a placeholder page
  const createPlaceholderPage = () => {
    const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === category);
    
    return {
      id: `placeholder-${slug}`,
      title: `${categoryInfo?.title || 'Category'} Page`,
      description: 'This is a placeholder for wiki content. Real content will appear once connected to the database.',
      content: `# ${categoryInfo?.title || 'Category'} Page

This is a placeholder page for **${slug}** in the *${categoryInfo?.title || 'Category'}* category.

## What to expect

When connected to the database, this page will display detailed information about:

* Features and characteristics
* Related content
* Images and media

## Coming Soon

Stay tuned for updates as we continue to build the wiki!

### Additional Information

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisi at feugiat efficitur, nisl nunc efficitur nunc, eget efficitur nisl nunc eget nunc.

## Technical Details

Sample code block:

\`\`\`javascript
function getWikiPage(slug) {
  return database.collection('wiki').where('slug', '==', slug).get();
}
\`\`\`

## References

1. GTA Wiki
2. Rockstar Games
3. Community contributions`,
      category,
      imageUrl: getLocalImageUrl(category),
      galleryImages: getMultipleLocalImageUrls(4, category),
      tags: ['Placeholder', 'Coming Soon', categoryInfo?.title || 'Category'],
      updatedAt: { toDate: () => new Date() }
    };
  };
  
  // Find category info
  const categoryInfo = WIKI_CATEGORIES.find(cat => cat.id === category);
  
  // Render markdown content with syntax highlighting
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
    
    // Create a new renderer that uses the same ID generation logic
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
    return DOMPurify.sanitize(rawHtml);
  };
  
  // Format date display
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
  
  // Function to handle image click for gallery
  const handleImageClick = (imageUrl: string) => {
    // Could implement a lightbox here
    window.open(imageUrl, '_blank');
  };
  
  // Function to handle clicking on table of contents links
  const handleTocLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, headingId: string) => {
    e.preventDefault();
    
    const element = document.getElementById(headingId);
    if (element) {
      // Get the navbar height to adjust scroll position
      const navbarHeight = 90; // Adjust this value to match your navbar height
      
      // Calculate the element's position
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      
      // Scroll to the element accounting for the navbar height
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: 'smooth'
      });
      
      // Update the URL hash without causing a scroll (for bookmark purposes)
      window.history.pushState(null, '', `#${headingId}`);
      
      // Set active heading
      setActiveHeading(headingId);
    }
  };
  
  // Function to scroll to top
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Clear the URL hash
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    setActiveHeading(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Navbar transparent={true} />
      
      {loading ? (
        <div className="flex-grow flex justify-center items-center min-h-[500px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gta-blue mb-4"></div>
            <p className="text-gray-400">Loading wiki page...</p>
          </div>
        </div>
      ) : error && !pageData ? (
        <div className="flex-grow container mx-auto px-4 py-16">
          <div className="bg-red-900/50 border border-red-500 text-red-100 px-6 py-8 rounded-xl mb-4">
            <h2 className="text-2xl font-bold mb-4">Error Loading Page</h2>
            <p className="mb-6">{error}</p>
            <div className="flex space-x-4">
              <Link href="/wiki" className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
                Return to Wiki Home
              </Link>
              <button 
                onClick={() => router.refresh()}
                className="px-6 py-3 bg-gta-blue text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : pageData ? (
        <>
          {/* Featured Image Header */}
          <div className="relative h-[500px] overflow-hidden">
            {pageData.imageUrl && (
              <>
                <Image
                  src={pageData.imageUrl}
                  alt={pageData.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-transparent to-gray-900"></div>
              </>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-6 relative z-10 animate-fadeIn">
                {/* Display error message if using placeholder */}
                {error && (
                  <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-100 px-4 py-3 rounded-lg mb-6 max-w-4xl mx-auto">
                    <p>{error}</p>
                    <p className="text-sm mt-2">Using placeholder content and local images.</p>
                  </div>
                )}
                
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center text-sm text-white/70 max-w-4xl mx-auto">
                  <Link href="/wiki" className="hover:text-white transition-colors">
                    Wiki
                  </Link>
                  <span className="mx-2">›</span>
                  <Link href={`/wiki/${category}`} className="hover:text-white transition-colors">
                    {categoryInfo?.title || category}
                  </Link>
                  <span className="mx-2">›</span>
                  <span className="text-white">{pageData.title}</span>
                </div>
                
                {/* Title and description */}
                <div className="max-w-4xl mx-auto mb-4">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">{pageData.title}</h1>
                  <p className="text-xl md:text-2xl text-white/90 max-w-3xl">{pageData.description}</p>
                </div>
                
                {/* Tags */}
                {pageData.tags && pageData.tags.length > 0 && (
                  <div className="max-w-4xl mx-auto flex flex-wrap gap-2 mb-4">
                    {pageData.tags.map((tag: string) => (
                      <Link 
                        key={tag}
                        href={`/wiki/search?q=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-sm text-white hover:bg-gta-pink/70 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <main className="flex-grow container mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row gap-8 max-w-screen-xl mx-auto">
              {/* Table of Contents - Desktop */}
              {tableOfContents.length > 0 && (
                <div className="hidden lg:block w-64 flex-shrink-0">
                  <div className="sticky top-8 bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 animate-fadeInUp">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Table of Contents</h3>
                    <nav>
                      <ul className="space-y-2">
                        {tableOfContents.map((heading) => (
                          <li 
                            key={heading.id} 
                            className={`${
                              heading.level === 2 ? 'ml-0' : 
                              heading.level === 3 ? 'ml-3' : ''
                            }`}
                          >
                            <a 
                              href={`#${heading.id}`}
                              onClick={(e) => handleTocLinkClick(e, heading.id)}
                              className={`block py-1 text-sm transition-colors ${
                                activeHeading === heading.id 
                                  ? 'text-gta-pink font-medium' 
                                  : 'text-gray-300 hover:text-white'
                              }`}
                            >
                              {heading.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
              
              {/* Main Content */}
              <div className="flex-grow">
                {/* Table of Contents - Mobile */}
                {tableOfContents.length > 0 && (
                  <div className="lg:hidden mb-6 bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <h3 className="text-lg font-bold text-white">Table of Contents</h3>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </span>
                      </summary>
                      <nav className="pt-4 border-t border-gray-700 mt-4">
                        <ul className="space-y-2">
                          {tableOfContents.map((heading) => (
                            <li 
                              key={heading.id} 
                              className={`${
                                heading.level === 2 ? 'ml-0' : 
                                heading.level === 3 ? 'ml-3' : ''
                              }`}
                            >
                              <a 
                                href={`#${heading.id}`}
                                onClick={(e) => handleTocLinkClick(e, heading.id)}
                                className={`block py-1 text-sm transition-colors ${
                                  activeHeading === heading.id 
                                    ? 'text-gta-pink font-medium' 
                                    : 'text-gray-300 hover:text-white'
                                }`}
                              >
                                {heading.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </details>
                  </div>
                )}
                
                {/* Content */}
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden mb-8 animate-fadeIn">
                  <div 
                    ref={contentRef}
                    className="prose prose-invert max-w-none px-6 py-8 markdown-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(pageData.content) }}
                  />
                </div>
                
                {/* Image Gallery */}
                {pageData.galleryImages && pageData.galleryImages.length > 0 && (
                  <div className="mb-12 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white border-l-4 border-gta-blue pl-4">
                        Gallery
                      </h2>
                      <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-blue to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {pageData.galleryImages.map((imageUrl: string, index: number) => (
                        <div 
                          key={index} 
                          className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-gta-blue/20 transition-all animate-fadeInUp"
                          style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                          onClick={() => handleImageClick(imageUrl)}
                        >
                          <Image
                            src={imageUrl}
                            alt={`${pageData.title} - Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-2 left-2 right-2 text-white text-sm">
                              <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md">
                                View image
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Metadata and Actions */}
                <div className="border-t border-gray-700 pt-6 flex flex-wrap justify-between items-center text-sm text-gray-400 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  <div className="space-y-2 mb-4 md:mb-0">
                    <p>Last updated: {formatDate(pageData.updatedAt)}</p>
                    <p>Category: <Link href={`/wiki/${category}`} className="text-gta-blue hover:text-gta-pink transition-colors">{categoryInfo?.title || category}</Link></p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="#top"
                      onClick={scrollToTop}
                      className="inline-flex items-center px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      Back to top
                    </a>
                    <Link 
                      href={`/admin/wiki/edit/${pageData.id}`}
                      className="inline-flex items-center px-4 py-2 bg-gta-blue text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit this page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          {/* Related Pages */}
          <section className="py-16 bg-gray-800/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white border-l-4 border-gta-green pl-4">
                  Related Pages
                </h2>
                <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-green to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                {[1, 2, 3].map((i) => (
                  <Link 
                    key={i}
                    href={`/wiki/${category}/${slug}-related-${i}`}
                    className="group bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fadeInUp"
                    style={{ animationDelay: `${0.1 * i}s` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={getLocalImageUrl(category)}
                        alt={`Related Page ${i}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gta-green transition-colors">
                        Related {categoryInfo?.title ? categoryInfo.title.slice(0, -1) : ''} {i}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                        Discover more about this related content from the GTA 6 universe.
                      </p>
                      <span className="text-gta-green group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center">
                        Explore
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
      
      <Footer />
      
      {/* Add required CSS */}
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
        
        /* Add smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Enhanced Markdown Styling */
        .markdown-content {
          color: #e2e8f0;
        }
        
        /* Add scroll margin to headings */
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          scroll-margin-top: 100px; /* Adjust this value to match your navbar height + some extra padding */
        }
        
        .markdown-content h1 {
          font-size: 2.25rem;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
          color: white;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(74, 85, 104, 0.7);
        }
        
        .markdown-content h2 {
          font-size: 1.75rem;
          margin-top: 1.75rem;
          margin-bottom: 1.25rem;
          font-weight: 700;
          color: white;
          position: relative;
          padding-left: 1rem;
        }
        
        .markdown-content h2::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.25rem;
          bottom: 0.25rem;
          width: 4px;
          border-radius: 4px;
          background: linear-gradient(to bottom, #ff6b81, #ff4757);
        }
        
        .markdown-content h3 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #f7fafc;
        }
        
        .markdown-content p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
        }
        
        .markdown-content a {
          color: #63b3ed;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .markdown-content a:hover {
          color: #ff6b81;
          text-decoration: underline;
        }
        
        .markdown-content blockquote {
          border-left: 4px solid #ff6b81;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          background-color: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 0.25rem;
        }
        
        .markdown-content code {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        
        .markdown-content pre {
          background-color: #1a202c;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(74, 85, 104, 0.7);
        }
        
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
          color: #e2e8f0;
          display: block;
          line-height: 1.6;
        }
        
        .markdown-content ul, .markdown-content ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        
        .markdown-content li {
          margin-bottom: 0.5rem;
        }
        
        .markdown-content ul li {
          list-style-type: disc;
        }
        
        .markdown-content ol li {
          list-style-type: decimal;
        }
        
        .markdown-content table {
          width: 100%;
          margin-bottom: 1.5rem;
          border-collapse: collapse;
        }
        
        .markdown-content th, .markdown-content td {
          padding: 0.75rem;
          border: 1px solid #4a5568;
        }
        
        .markdown-content th {
          background-color: rgba(0, 0, 0, 0.3);
          font-weight: 600;
          text-align: left;
        }
        
        .markdown-content tr:nth-child(even) {
          background-color: rgba(0, 0, 0, 0.15);
        }
        
        .markdown-content hr {
          border: 0;
          height: 1px;
          background: rgba(74, 85, 104, 0.7);
          margin: 2rem 0;
        }
        
        .markdown-content img {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
} 