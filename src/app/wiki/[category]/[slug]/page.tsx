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

// Define interfaces for the wiki page data and details
interface WikiPageDetail {
  label: string;
  value: string;
  type: 'text' | 'badge' | 'link';
  badgeColor?: string;
  linkHref?: string;
}

interface WikiPageData {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  imageUrl: string;
  galleryImages?: string[];
  slug: string;
  tags?: string[];
  updatedAt: any;
  details?: WikiPageDetail[];
}

// Interface for data as it comes from Firestore
interface WikiPageFirestore {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  slug: string;
  imageUrl?: string;  // Optional in Firestore
  galleryImages?: string[];  // Optional in Firestore
  tags: string[];
  updatedAt: any;
  details?: WikiPageDetail[];
}

export default function WikiPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const slug = params.slug as string;
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<WikiPageData | null>(null);
  const [tableOfContents, setTableOfContents] = useState<{id: string, text: string, level: number}[]>([]);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [relatedPages, setRelatedPages] = useState<WikiPageData[]>([]);
  
  useEffect(() => {
    const fetchWikiPage = async () => {
      try {
        setLoading(true);
        const page = await getWikiPageBySlug(slug) as WikiPageFirestore | null;
        
        if (!page) {
          setError('Wiki page not found');
          
          // Create a placeholder page if the actual page can't be found
          const placeholderPage = createPlaceholderPage();
          setPageData(placeholderPage);
        } else {
          console.log("Fetched page data:", page);
          console.log("Has details?", !!page.details);
          console.log("Details length:", page.details?.length);
          
          const defaultDetails = await getEntityDetails(slug);
          console.log("Default details:", defaultDetails);
          
          // Process the page data with all required fields
          const processedPage: WikiPageData = {
            ...page,
            imageUrl: page.imageUrl || getLocalImageUrl(category),
            galleryImages: (page.galleryImages && page.galleryImages.length > 0) 
              ? page.galleryImages 
              : getMultipleLocalImageUrls(3, category),
            details: page.details || defaultDetails
          };
          
          // Debug details badge colors
          if (processedPage.details) {
            processedPage.details.forEach(detail => {
              if (detail.type === 'badge') {
                console.log(`Badge detail "${detail.label}": value="${detail.value}", color=${detail.badgeColor}`);
              }
            });
          }
          
          console.log("Processed page details:", processedPage.details);
          setPageData(processedPage);
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
      slug,
      tags: ['Placeholder', 'Coming Soon', categoryInfo?.title || 'Category'],
      updatedAt: { toDate: () => new Date() },
      // Example detailed information - this would come from Firestore
      details: [
        { label: 'Location', value: 'Vice City', type: 'text' as const },
        { label: 'First Appearance', value: 'GTA 6', type: 'text' as const },
        { label: 'Type', value: category === 'characters' ? 'Character' : 'Location', type: 'text' as const },
        { label: 'Status', value: 'Active', type: 'badge' as const, badgeColor: 'green' },
        { label: 'Related To', value: 'Jason', type: 'link' as const, linkHref: '/wiki/characters/jason' }
      ]
    } as WikiPageData;
  };
  
  // This function will retrieve details data from Firestore
  const getEntityDetails = async (entityId: string): Promise<WikiPageDetail[]> => {
    try {
      // Generate default details based on the category
      let details: WikiPageDetail[] = [];
      
      if (category === 'characters') {
        details = [
          { label: 'Full Name', value: entityId.charAt(0).toUpperCase() + entityId.slice(1), type: 'text' as const },
          { label: 'Occupation', value: 'Criminal', type: 'text' as const },
          { label: 'Status', value: 'Alive', type: 'badge' as const, badgeColor: 'green' },
          { label: 'Location', value: 'Vice City', type: 'text' as const },
          { label: 'First Appearance', value: 'Prologue', type: 'text' as const },
          { label: 'Affiliation', value: 'Rodriguez Cartel', type: 'link' as const, linkHref: '/wiki/factions/rodriguez-cartel' }
        ];
      } else if (category === 'locations') {
        details = [
          { label: 'Region', value: 'Leonida', type: 'text' as const },
          { label: 'Type', value: 'City', type: 'text' as const },
          { label: 'Status', value: 'Active', type: 'badge' as const, badgeColor: 'blue' },
          { label: 'Population', value: '2.7 million', type: 'text' as const },
          { label: 'Activities', value: 'Various Missions', type: 'text' as const },
          { label: 'Related', value: 'Vice Beach', type: 'link' as const, linkHref: '/wiki/locations/vice-beach' }
        ];
      } else if (category === 'vehicles') {
        details = [
          { label: 'Manufacturer', value: 'Declasse', type: 'text' as const },
          { label: 'Type', value: 'Sports Car', type: 'text' as const },
          { label: 'Speed', value: '9/10', type: 'text' as const },
          { label: 'Handling', value: '8/10', type: 'text' as const },
          { label: 'Price', value: '$850,000', type: 'text' as const },
          { label: 'Similar', value: 'Infernus', type: 'link' as const, linkHref: '/wiki/vehicles/infernus' }
        ];
      } else if (category === 'weapons') {
        details = [
          { label: 'Type', value: 'Assault Rifle', type: 'text' as const },
          { label: 'Damage', value: '7/10', type: 'text' as const },
          { label: 'Rate of Fire', value: '8/10', type: 'text' as const },
          { label: 'Accuracy', value: '6/10', type: 'text' as const },
          { label: 'Price', value: '$3,500', type: 'text' as const },
          { label: 'Similar', value: 'Carbine Rifle', type: 'link' as const, linkHref: '/wiki/weapons/carbine-rifle' }
        ];
      } else {
        details = [
          { label: 'Category', value: category.charAt(0).toUpperCase() + category.slice(1), type: 'text' as const },
          { label: 'ID', value: entityId, type: 'text' as const },
          { label: 'Status', value: 'Available', type: 'badge' as const, badgeColor: 'green' },
          { label: 'Added', value: new Date().toLocaleDateString(), type: 'text' as const }
        ];
      }
      
      // Log badge details being generated
      details.forEach(detail => {
        if (detail.type === 'badge') {
          console.log(`getEntityDetails generating badge: "${detail.label}" with value="${detail.value}", color="${detail.badgeColor}"`);
        }
      });
      
      return details;
    } catch (error) {
      console.error('Error fetching entity details:', error);
      return [];
    }
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
  
  // Fetch related pages when page data is loaded
  useEffect(() => {
    const fetchRelatedPages = async () => {
      if (pageData && category) {
        try {
          // Import the function to get wiki pages by category
          const { getWikiPagesByCategory } = await import('@/lib/wikiFirestoreService');
          
          // Fetch pages from the same category
          const categoryPages = await getWikiPagesByCategory(category as WikiCategory);
          
          // Filter out the current page and get up to 3 random pages
          const filteredPages = categoryPages
            .filter(page => page.id !== pageData.id)
            .sort(() => 0.5 - Math.random()) // Random sort
            .slice(0, 3); // Take up to 3
          
          if (filteredPages.length > 0) {
            // Process pages to ensure they have image URLs
            const processedPages = filteredPages.map(page => ({
              ...page,
              imageUrl: page.imageUrl || getLocalImageUrl(category)
            }));
            
            setRelatedPages(processedPages);
          } else {
            // If no related pages, create placeholders
            const placeholders = Array.from({ length: 3 }, (_, i) => ({
              id: `placeholder-related-${i}`,
              title: `Related ${categoryInfo?.title ? categoryInfo.title.slice(0, -1) : ''} ${i + 1}`,
              description: `Discover more about this related content from the GTA 6 universe.`,
              category,
              slug: `${slug}-related-${i + 1}`,
              imageUrl: getLocalImageUrl(category),
              content: '',
              tags: ['Related', categoryInfo?.title || ''],
              updatedAt: { toDate: () => new Date() },
              galleryImages: []
            }));
            
            setRelatedPages(placeholders);
          }
        } catch (error) {
          console.error('Error fetching related pages:', error);
          // Create placeholders on error
          const placeholders = Array.from({ length: 3 }, (_, i) => ({
            id: `placeholder-related-${i}`,
            title: `Related ${categoryInfo?.title ? categoryInfo.title.slice(0, -1) : ''} ${i + 1}`,
            description: `Discover more about this related content from the GTA 6 universe.`,
            category,
            slug: `${slug}-related-${i + 1}`,
            imageUrl: getLocalImageUrl(category),
            content: '',
            tags: ['Related', categoryInfo?.title || ''],
            updatedAt: { toDate: () => new Date() },
            galleryImages: []
          }));
          
          setRelatedPages(placeholders);
        }
      }
    };
    
    fetchRelatedPages();
  }, [pageData, category, slug, categoryInfo?.title]);
  
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
          {/* Fixed Background */}
          <div 
            className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('/images/wiki-background.jpg')`,
              filter: 'brightness(0.6) saturate(1.2)',
              backgroundAttachment: 'scroll'
            }}
          />
          <div className="fixed inset-0 z-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
          <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-gray-900/30 to-gray-900/70"></div>
          
          {/* Header Section */}
          <div className="relative z-10 pt-28">            
            <div className="container mx-auto px-6 relative animate-fadeIn">
                {/* Display error message if using placeholder */}
                {error && (
                <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-100 px-6 py-4 rounded-lg mb-6 max-w-4xl mx-auto backdrop-blur-sm shadow-lg">
                  <p className="font-medium">{error}</p>
                  <p className="text-sm mt-2 opacity-80">Using placeholder content and local images.</p>
                  </div>
                )}
                
                {/* Breadcrumb */}
              <div className="mb-6 flex items-center text-sm text-white/80 max-w-4xl backdrop-blur-sm bg-black/10 inline-flex rounded-full py-2 px-4">
                <Link href="/wiki" className="hover:text-white transition-colors flex items-center hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                    Wiki
                  </Link>
                <span className="mx-3 text-white/40">›</span>
                <Link href={`/wiki/${category}`} className="hover:text-white transition-colors flex items-center hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                    {categoryInfo?.title || category}
                  </Link>
                <span className="mx-3 text-white/40">›</span>
                <span className="text-white font-medium">{pageData.title}</span>
                </div>
                
                {/* Title and description */}
              <div className="max-w-4xl backdrop-blur-sm bg-black/10 p-6 rounded-lg border border-gray-700/30 shadow-lg mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg leading-tight">{pageData.title}</h1>
                <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">{pageData.description}</p>
                
                {/* Tags */}
                {pageData.tags && pageData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-5">
                    {pageData.tags.map((tag: string) => (
                      <Link 
                        key={tag}
                        href={`/wiki/search?q=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 bg-black/30 rounded-full text-sm text-white hover:bg-gta-pink/50 transition-all duration-200 flex items-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
            {/* Main Content and Sidebars */}
            <div className="flex flex-col lg:flex-row gap-8 max-w-[1920px] mx-auto relative z-10">
              {/* Table of Contents - Desktop */}
              {tableOfContents.length > 0 && (
                <div className="hidden lg:block w-72 flex-shrink-0">
                  <div className="sticky top-24 bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 animate-fadeInUp shadow-xl hover:shadow-gta-blue/10 transition-all duration-300">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gta-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Table of Contents
                    </h3>
                    <nav>
                      <ul className="space-y-3">
                        {tableOfContents.map((heading) => (
                          <li 
                            key={heading.id} 
                            className={`${
                              heading.level === 2 ? 'ml-0' : 
                              heading.level === 3 ? 'ml-4' : ''
                            }`}
                          >
                            <a 
                              href={`#${heading.id}`}
                              onClick={(e) => handleTocLinkClick(e, heading.id)}
                              className={`block py-2 text-sm transition-all duration-200 rounded-lg px-3 ${
                                activeHeading === heading.id 
                                  ? 'text-gta-pink font-medium bg-gray-700/50 shadow-inner border-l-2 border-gta-pink' 
                                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30 hover:border-l-2 hover:border-gray-500'
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
              <div className="flex-grow max-w-4xl">
                {/* Table of Contents - Mobile */}
                {tableOfContents.length > 0 && (
                  <div className="lg:hidden mb-8 bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-xl">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none">
                        <h3 className="text-lg font-bold text-white flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gta-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          Table of Contents
                        </h3>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </span>
                      </summary>
                      <nav className="pt-6 border-t border-gray-700 mt-6">
                        <ul className="space-y-3">
                          {tableOfContents.map((heading) => (
                            <li 
                              key={heading.id} 
                              className={`${
                                heading.level === 2 ? 'ml-0' : 
                                heading.level === 3 ? 'ml-4' : ''
                              }`}
                            >
                              <a 
                                href={`#${heading.id}`}
                                onClick={(e) => handleTocLinkClick(e, heading.id)}
                                className={`block py-2 text-sm transition-all duration-200 rounded-lg px-3 ${
                                  activeHeading === heading.id 
                                    ? 'text-gta-pink font-medium bg-gray-700/50 border-l-2 border-gta-pink' 
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
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
                <div className="bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden mb-12 animate-fadeIn shadow-xl hover:shadow-gta-blue/10 transition-all duration-300">
                  <div 
                    ref={contentRef}
                    className="prose prose-invert max-w-none px-8 py-10 markdown-content wiki-slug-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(pageData.content) }}
                  />
                </div>
                
                {/* Image Gallery */}
                {pageData.galleryImages && pageData.galleryImages.length > 0 && (
                  <div className="mb-16 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-white border-l-4 border-gta-blue pl-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Gallery
                      </h2>
                      <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-blue to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {pageData.galleryImages.map((imageUrl: string, index: number) => (
                        <div 
                          key={index} 
                          className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-gta-blue/20 transition-all duration-500 animate-fadeInUp transform hover:-translate-y-1"
                          style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                          onClick={() => handleImageClick(imageUrl)}
                        >
                          <Image
                            src={imageUrl}
                            alt={`${pageData.title} - Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                              <span className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-sm font-medium inline-flex items-center">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
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
                <div className="border-t border-gray-700 flex flex-wrap justify-between items-center text-sm text-gray-400 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  <div className="space-y-3 mb-6 md:mb-0">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gta-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last updated: {formatDate(pageData.updatedAt)}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gta-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Category: <Link href={`/wiki/${category}`} className="text-gta-blue hover:text-gta-pink transition-colors ml-1">{categoryInfo?.title || category}</Link>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="#top"
                      onClick={scrollToTop}
                      className="inline-flex items-center px-5 py-2.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      Back to top
                    </a>
                    <Link 
                      href={`/admin/wiki/edit/${pageData.id}`}
                      className="inline-flex items-center px-5 py-2.5 bg-gta-blue text-black rounded-lg hover:bg-blue-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit this page
                    </Link>
                  </div>
                </div>
              </div>

              {/* Featured Image Sidebar */}
              {pageData.imageUrl && (
                <div className="hidden lg:block w-96 flex-shrink-0">
                  <div className="sticky top-24">
                    {/* Featured Image and Details Card - Combined */}
                    <div className="bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden shadow-xl hover:shadow-gta-pink/10 transition-all duration-300">
                      {/* Featured Image */}
                      <div className="relative aspect-[4/3] overflow-hidden group">
                        <Image
                          src={pageData.imageUrl}
                          alt={pageData.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50"></div>
            </div>
                      <div className="p-4 border-t border-gray-700/50">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gta-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {pageData.title}
                        </h3>
                      </div>

                      {/* Details Table - Will be populated from Firestore */}
                      {pageData.details && pageData.details.length > 0 && (
                        <>
                          <div className="border-t border-gray-700/30"></div>
                          <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-700/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center">
                              <svg className="w-5 h-5 mr-2 text-gta-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Details
                            </h3>
                            <button 
                              onClick={() => setDetailsExpanded(!detailsExpanded)}
                              className="text-gray-400 hover:text-white transition-colors focus:outline-none hover:bg-gray-700/50 p-1.5 rounded-full"
                              aria-label={detailsExpanded ? "Collapse details" : "Expand details"}
                            >
                              <svg 
                                className={`w-5 h-5 transform transition-transform ${detailsExpanded ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                          <div className={`divide-y divide-gray-700/50 ${detailsExpanded ? 'max-h-[400px] overflow-y-auto' : 'max-h-[240px] overflow-y-auto'}`}>
                            {/* Dynamically generate from Firestore data */}
                            {pageData.details.map((detail, index) => (
                              <div 
                                key={index} 
                                className="px-4 py-3 flex justify-between items-center hover:bg-gray-700/30 transition-colors"
                                style={{
                                  animation: `fadeInTable 0.3s ease-in-out ${index * 0.05}s both`,
                                  opacity: 0 // Start with 0 opacity, animation will handle the rest
                                }}
                              >
                                <span className="text-sm font-medium text-gray-300">{detail.label}</span>
                                {detail.type === 'text' && (
                                  <span className="text-sm text-white">{detail.value}</span>
                                )}
                                {detail.type === 'badge' && (
                                  <span className="text-sm text-white">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                      ${detail.badgeColor === 'green' ? 'bg-green-900/50 text-green-400 border border-green-700/50' : 
                                      detail.badgeColor === 'red' ? 'bg-red-900/50 text-red-400 border border-red-700/50' : 
                                      detail.badgeColor === 'blue' ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50' : 
                                      detail.badgeColor === 'yellow' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' : 
                                      'bg-gray-900/50 text-gray-400 border border-gray-700/50'}`}>
                                      {detail.value}
                                    </span>
                                  </span>
                                )}
                                {detail.type === 'link' && detail.linkHref && (
                                  <Link 
                                    href={detail.linkHref} 
                                    className="text-sm text-gta-blue hover:text-gta-pink transition-colors flex items-center group"
                                  >
                                    {detail.value}
                                    <svg 
                                      className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1 opacity-0 group-hover:opacity-100" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="p-3 bg-gray-700/20 border-t border-gray-700/50 text-center">
                            <p className="text-xs text-gray-400"></p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Related Pages - Outside the flex container */}
            <div className="mt-16">
              <section className="py-20 bg-gray-800/30 relative">
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5"></div>
                <div className="container mx-auto px-4 relative z-10">
                  <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-bold text-white border-l-4 border-gta-green pl-4 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                  Related Pages
                </h2>
                <div className="h-0.5 flex-grow ml-6 bg-gradient-to-r from-gta-green to-transparent"></div>
              </div>
              
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
                {relatedPages.map((page, i) => (
                  <Link 
                    key={page.id}
                    href={`/wiki/${category}/${page.slug}`}
                        className="group bg-gray-800/80 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fadeInUp"
                    style={{ animationDelay: `${0.1 * i}s` }}
                  >
                        <div className="relative h-52 overflow-hidden">
                      <Image
                        src={page.imageUrl}
                        alt={page.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                          {page.tags && page.tags.length > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-wrap gap-2">
                              {page.tags.slice(0, 2).map((tag: string) => (
                                <span key={tag} className="px-2 py-1 rounded-md text-xs bg-black/50 backdrop-blur-sm text-gray-300 border border-gray-700/50">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                    </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gta-green transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                        {page.description}
                      </p>
                          <span className="text-gta-green group-hover:translate-x-1 transition-transform duration-200 inline-flex items-center font-medium">
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
            </div>
          </main>
      
      <Footer />
      
      {/* Add required CSS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
            
            @keyframes fadeInTable {
              from { opacity: 0; transform: translateY(10px); }
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
            
            @keyframes pulse-slow {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.9; }
            }
            
            .animate-pulse-slow {
              animation: pulse-slow 5s ease-in-out infinite;
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
              scroll-margin-top: 100px;
        }
        
        .markdown-content h1 {
              font-size: 2.5rem;
              margin-top: 2.5rem;
              margin-bottom: 1.75rem;
              font-weight: 800;
          color: white;
              padding-bottom: 0.75rem;
              border-bottom: 2px solid rgba(74, 85, 104, 0.7);
              letter-spacing: -0.025em;
        }
        
        .markdown-content h2 {
              font-size: 2rem;
              margin-top: 2rem;
              margin-bottom: 1.5rem;
          font-weight: 700;
          color: white;
          position: relative;
              padding-left: 1.25rem;
              letter-spacing: -0.025em;
            }
            
            .markdown-content h2::before {
              content: "";
              position: absolute;
              left: 0;
              top: 0.25rem;
              bottom: 0.25rem;
              width: 4px;
              border-radius: 4px;
              background: #f152ff;
            }
            
            .markdown-content h3 {
              font-size: 1.75rem;
              margin-top: 1.75rem;
              margin-bottom: 1.25rem;
          font-weight: 600;
          color: #f7fafc;
              letter-spacing: -0.025em;
        }
        
        .markdown-content p {
              margin-bottom: 1.5rem;
              line-height: 1.8;
              font-size: 1.1rem;
        }
        
        .markdown-content a {
          color: #f152ff;
          text-decoration: none;
          font-weight: bold;
              transition: all 0.2s;
              border-bottom: 1px solid transparent;
            }
            
            .markdown-content a:hover {
              color: #f152ff;
              border-bottom-color: #f152ff;
            }
            
            .markdown-content blockquote {
              border-left: 4px solid #f152ff;
              padding: 1.5rem;
              margin: 2rem 0;
          font-style: italic;
          background-color: rgba(0, 0, 0, 0.2);
              border-radius: 0.5rem;
              position: relative;
            }
            
            .markdown-content blockquote::before {
              content: '"';
              position: absolute;
              top: -0.5rem;
              right: 1.5rem;
              font-size: 4rem;
              color: #f152ff;
              opacity: 0.2;
        }
        
        .markdown-content code {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
              font-family: 'Fira Code', monospace;
          font-size: 0.9em;
              border: 1px solid rgba(74, 85, 104, 0.3);
        }
        
        .markdown-content pre {
          background-color: #1a202c;
              padding: 1.5rem;
              border-radius: 0.75rem;
          overflow-x: auto;
              margin: 2rem 0;
          border: 1px solid rgba(74, 85, 104, 0.7);
              position: relative;
            }
            
            .markdown-content pre::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: #f152ff;
              border-radius: 0.75rem 0.75rem 0 0;
        }
        
        .markdown-content pre code {
          background-color: transparent;
          padding: 0;
          color: #e2e8f0;
          display: block;
          line-height: 1.6;
              border: none;
              font-size: 0.95rem;
        }
        
        .markdown-content ul, .markdown-content ol {
              margin-bottom: 1.5rem;
              padding-left: 1.75rem;
        }
        
        .markdown-content li {
              margin-bottom: 0.75rem;
              line-height: 1.7;
        }
        
        .markdown-content ul li {
              list-style-type: none;
              position: relative;
              padding-left: 1.5rem;
            }
            
            .markdown-content ul li::before {
              content: "•";
              color: #f152ff;
              position: absolute;
              left: 0;
              font-weight: bold;
        }
        
        .markdown-content ol li {
          list-style-type: decimal;
              padding-left: 0.5rem;
        }
        
        .markdown-content table {
          width: 100%;
              margin: 2rem 0;
              border-collapse: separate;
              border-spacing: 0;
              border-radius: 0.5rem;
              overflow: hidden;
              border: 1px solid rgba(74, 85, 104, 0.7);
        }
        
        .markdown-content th, .markdown-content td {
              padding: 1rem;
              border: 1px solid rgba(74, 85, 104, 0.7);
        }
        
        .markdown-content th {
          background-color: rgba(0, 0, 0, 0.3);
          font-weight: 600;
          text-align: left;
              color: #f7fafc;
        }
        
        .markdown-content tr:nth-child(even) {
          background-color: rgba(0, 0, 0, 0.15);
        }
            
            .markdown-content tr:hover {
              background-color: rgba(0, 0, 0, 0.2);
            }
        
        .markdown-content hr {
          border: 0;
              height: 2px;
              background: linear-gradient(to right, transparent, rgba(74, 85, 104, 0.7), transparent);
              margin: 3rem 0;
        }
        
        .markdown-content img {
          max-width: 100%;
              border-radius: 0.75rem;
              margin: 2rem 0;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              border: 1px solid rgba(74, 85, 104, 0.3);
        }

        /* Special styling for this page's bullet points only */
        .wiki-slug-content ul li::before {
          content: "" !important;
          color: transparent !important;
          background-color: #52FDFF !important;
          width: 0.375em !important;
          height: 0.375em !important;
          top: 0.6875em !important;
          border-radius: 0 !important; /* Ensure it's a square */
          position: absolute !important;
          left: 0.375em !important;
        }
      `}</style>
        </>
      ) : null}
    </div>
  );
} 