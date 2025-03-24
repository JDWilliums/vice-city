'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Head from 'next/head';
import { NewsArticleFirestore, getAllNewsArticles } from '@/lib/newsFirestoreService';
import { SpeedInsights } from "@vercel/speed-insights/next"

// GTA 6 estimated release date (Fall 2025)
const RELEASE_DATE = new Date('2025-12-01T00:00:00Z');

// Array of GTA 6 images to cycle through
const GTA6_IMAGES = [
  '/images/gta6-0.png',
  '/images/gta6-1.png',
  '/images/gta6-2.png',
  '/images/gta6-3.png',
  '/images/gta6-4.png',
  '/images/gta6-5.png',
  '/images/gta6-6.png',
  '/images/gta6-7.png',
  '/images/gta6-8.png',
  '/images/gta6-9.png',
];

export default function HomePage() {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  
  // Simplified image transition state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // State for news articles
  const [latestArticles, setLatestArticles] = useState<NewsArticleFirestore[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState<boolean>(true);
  
  // YouTube facade state
  const [youtubeLoaded, setYoutubeLoaded] = useState<boolean>(false);
  
  // Memoized date formatter to avoid recreating it on each render
  const formatDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return (date: any) => {
      if (!date) return 'Unknown date';
      const timestamp = typeof date === 'object' && date.toDate ? date.toDate() : new Date(date);
      return formatter.format(timestamp);
    };
  }, []);

  // Memoized image URL processor
  const getProcessedImageUrl = useCallback((url: string): string => {
    if (!url) return '/images/gta6-1.png'; // Default fallback image
    
    // If URL already starts with http(s) or / then it's already properly formatted
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    // Otherwise, add leading slash if needed
    return url.startsWith('images/') ? `/${url}` : `/images/${url}`;
  }, []);

  // New function to handle image loading state
  const [loadedImages, setLoadedImages] = useState<{[key: string]: boolean}>({});
  
  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: true
    }));
  }, []);

  // Update countdown - optimized to reduce main thread usage
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = 0;
    let cachedDays = 0;
    let cachedHours = 0;
    let cachedMinutes = 0;
    let cachedSeconds = 0;
    
    const updateCountdown = (timestamp: number) => {
      // Throttle updates to once per second to reduce CPU usage
      if (timestamp - lastUpdate < 1000) {
        animationFrameId = requestAnimationFrame(updateCountdown);
        return;
      }
      
      const now = new Date();
      const difference = RELEASE_DATE.getTime() - now.getTime();
      
      if (difference <= 0) {
        // Release date has passed
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }
      
      // Calculate time remaining
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Only update state if values have changed
      if (d !== cachedDays) {
        setDays(d);
        cachedDays = d;
      }
      
      if (h !== cachedHours) {
        setHours(h);
        cachedHours = h;
      }
      
      if (m !== cachedMinutes) {
        setMinutes(m);
        cachedMinutes = m;
      }
      
      if (s !== cachedSeconds) {
        setSeconds(s);
        cachedSeconds = s;
      }
      
      lastUpdate = timestamp;
      animationFrameId = requestAnimationFrame(updateCountdown);
    };
    
    // Start the animation frame loop
    animationFrameId = requestAnimationFrame(updateCountdown);
    
    return () => {
      // Clean up
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
  
  // Image carousel with optimized transitions
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;
    
    // Pre-load next few images for smoother transitions
    const preloadNextImages = () => {
      // Preload next 2 images
      const nextIndex = (activeImageIndex + 1) % GTA6_IMAGES.length;
      const nextNextIndex = (activeImageIndex + 2) % GTA6_IMAGES.length;
      
      if (typeof window !== 'undefined') {
        // Use window.Image constructor with proper typing
        const preloadNext = new window.Image();
        preloadNext.src = GTA6_IMAGES[nextIndex];
        
        const preloadNextNext = new window.Image();
        preloadNextNext.src = GTA6_IMAGES[nextNextIndex];
      }
    };
    
    // Function to cycle to the next image
    const cycleToNextImage = () => {
      if (!isMounted) return;
      
      // Preload next images before starting transition
      preloadNextImages();
      
      // Start transition
      setIsTransitioning(true);
      
      // Using a slightly shorter fade out time for better experience
      setTimeout(() => {
        if (!isMounted) return;
        
        // Move to next image
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % GTA6_IMAGES.length);
        
        // Allow a moment for the new image to be visible before fading in
        setTimeout(() => {
          if (!isMounted) return;
          setIsTransitioning(false);
        }, 150);
      }, 700);
    };

    // Start cycling after a short delay
    const initialTimeout = setTimeout(() => {
      // Start image rotation
      interval = setInterval(cycleToNextImage, 7000); // Slightly longer to give more viewing time
    }, 3000);
    
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, ensure image is visible
        setIsTransitioning(false);
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      isMounted = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  // Defer loading articles to improve initial page load time
  useEffect(() => {
    // Don't start fetching articles immediately
    let mounted = true;
    
    // Check for cached articles to prevent flickering on page revisits
    const ARTICLES_CACHE_KEY = 'home_latest_articles_cache';
    const cachedArticles = typeof window !== 'undefined' ? 
      window.sessionStorage.getItem(ARTICLES_CACHE_KEY) : null;
    
    if (cachedArticles) {
      try {
        const parsed = JSON.parse(cachedArticles);
        setLatestArticles(parsed);
        setIsLoadingArticles(false);
      } catch (err) {
        console.error('Error parsing cached articles:', err);
      }
    }
    
    const loadArticlesAfterDelay = setTimeout(async () => {
      if (!mounted) return;
      
      try {
        if (!cachedArticles) {
          setIsLoadingArticles(true);
        }
        
        const articles = await getAllNewsArticles(false);
        // Get the 3 most recent articles
        if (mounted) {
          setLatestArticles(articles.slice(0, 3));
          
          // Cache the articles in sessionStorage
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(
              ARTICLES_CACHE_KEY, 
              JSON.stringify(articles.slice(0, 3))
            );
          }
        }
      } catch (error) {
        console.error('Error fetching latest articles:', error);
      } finally {
        if (mounted) {
          setIsLoadingArticles(false);
        }
      }
    }, cachedArticles ? 5000 : 1500); // Delay loading - use longer delay if we have cached data

    return () => {
      mounted = false;
      clearTimeout(loadArticlesAfterDelay);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Head>
        <title>GTA 6 Countdown - Vice City Fan Site</title>
        <meta name="description" content="Stay updated with the latest GTA 6 news, countdown, and information about Rockstar's upcoming game set in Vice City." />
        <meta name="keywords" content="GTA 6, Grand Theft Auto VI, Vice City, Rockstar Games, GTA 6 countdown, GTA 6 release date, Lucia and Jason, GTA 6 trailer, GTA 6 news" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="canonical" href="https://vice.city" />
        <meta property="og:title" content="GTA 6 Countdown - Vice City Fan Site" />
        <meta property="og:description" content="Stay updated with the latest GTA 6 news, countdown, and information about Rockstar's upcoming game set in Vice City." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vice.city" />
        <meta property="og:image" content="https://vice.city/images/gta6-logo.png" />
        
        {/* Preconnect to domains for potential third-party resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.youtube.com" />
      </Head>
      
      <Navbar transparent={true} />
      
      {/* Background Images with optimized loading for LCP */}
      <div className="fixed inset-0 z-0">
        {GTA6_IMAGES.map((image, index) => (
          <div 
            key={image}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeImageIndex ? (isTransitioning ? 'opacity-0' : 'opacity-100') : 'opacity-0'
            }`}
          >
            <Image 
              src={image}
              alt={`GTA 6 Background ${index + 1}`}
              fill
              className="object-cover object-center"
              priority={index < 3} // Prioritize first 3 images
              sizes="100vw"
              quality={index < 3 ? 95 : 75} // Higher quality for first images
              loading={index < 3 ? "eager" : "lazy"}
              placeholder="empty"
            />
          </div>
        ))}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        
        {/* Optimized animated gradients with reduced painting costs */}
        <div className="absolute inset-0 z-5 opacity-40">
          <div className="absolute top-0 -left-1/3 w-2/3 h-2/3 bg-gta-pink opacity-30 rounded-full blur-[150px] animate-pulse"
               style={{ willChange: 'opacity' }}></div>
          <div className="absolute bottom-0 -right-1/3 w-2/3 h-2/3 bg-gta-blue opacity-30 rounded-full blur-[150px] animate-pulse"
               style={{ willChange: 'opacity', animationDelay: '2s' }}></div>
        </div>
      </div>
      
      <main className="relative z-20 pt-16 md:pt-24">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center px-4 animate-fadeIn w-full">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 md:mb-8 text-white">
              GTA VI Countdown
            </h1>
            
            {/* Countdown Timer - with CSS animation classes instead of inline styles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto mb-4">
              <div className="bg-black/60 backdrop-blur-sm border border-gta-blue/30 rounded-lg p-4 md:p-6 animate-fadeInUp-1">
                <div className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-1">{days}</div>
                <div className="text-gray-400 uppercase tracking-wider text-xs sm:text-sm">Days</div>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gta-pink/30 rounded-lg p-4 md:p-6 animate-fadeInUp-2">
                <div className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-1">{hours}</div>
                <div className="text-gray-400 uppercase tracking-wider text-xs sm:text-sm">Hours</div>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gta-blue/30 rounded-lg p-4 md:p-6 animate-fadeInUp-3">
                <div className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-1">{minutes}</div>
                <div className="text-gray-400 uppercase tracking-wider text-xs sm:text-sm">Minutes</div>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gta-pink/30 rounded-lg p-4 md:p-6 animate-fadeInUp-4">
                <div className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-1">{seconds}</div>
                <div className="text-gray-400 uppercase tracking-wider text-xs sm:text-sm">Seconds</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm md:text-m text-gray-400 mb-10 md:mb-16 max-w-3xl mx-auto">
              (Countdown to the end of Fall, actual release date is currently unknown)
            </p>
            
            {/* GTA 6 Logo - optimized for better LCP */}
            <div className="relative flex justify-center mb-10 md:mb-16 animate-fadeInUp-5">
              
              <Image 
                src="/images/gta6-logo.png" 
                alt="GTA 6 Logo" 
                width={600} 
                height={300} 
                className="w-full max-w-2xl h-auto relative" 
                priority
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 80vw, 600px"
                fetchPriority="high"
              />
            </div>
            
            {/* Call to Action - now using CSS classes for animation delays */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-10 md:mb-16 animate-fadeInUp-6 px-4">
              <Link href="/news" className="px-6 md:px-8 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white text-base md:text-lg font-bold rounded-md hover:shadow-lg hover:shadow-gta-pink/20 transition-all hover:-translate-y-1 w-full sm:w-auto">
                Latest News
              </Link>
              <Link href="https://discord.gg/rGqyNP4AC6" className="px-6 md:px-8 py-3 bg-gradient-to-b from-indigo-400 to-indigo-500 text-white text-base md:text-lg font-bold rounded-md hover:shadow-lg hover:shadow-indigo-400/20 transition-all hover:-translate-y-1 w-full sm:w-auto">
                Join our Discord
              </Link>
              <Link href="/wiki" className="px-6 md:px-8 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white text-base md:text-lg font-bold rounded-md hover:shadow-lg hover:shadow-gta-pink/20 transition-all hover:-translate-y-1 w-full sm:w-auto">
                Explore the Wiki
              </Link>
            </div>
          </div>
        </div>

        {/* What We Know So Far Section */}
        <section className="flex items-center relative py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 md:mb-12 text-center animate-fadeInUp">
                <span className="text-white">What We Know...</span>
              </h2>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg p-5 md:p-8 mb-8 md:mb-12 animate-fadeInUp">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-gray-900/50 p-4 md:p-5 rounded-lg border-l-4 border-gta-blue">
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gta-blue">Dual Protagonists</h3>
                      <p className="text-gray-300 text-sm md:text-base">Play as both Lucia and Jason, the first female protagonist in the mainline series, in a Bonnie & Clyde inspired crime saga.</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 md:p-5 rounded-lg border-l-4 border-gta-pink">
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gta-pink">Vice City Returns</h3>
                      <p className="text-gray-300 text-sm md:text-base">Return to a reimagined Vice City and surrounding areas in the fictional state of Leonida, inspired by Miami and Florida.</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 md:p-5 rounded-lg border-l-4 border-gta-blue">
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gta-blue">Modern Setting</h3>
                      <p className="text-gray-300 text-sm md:text-base">Set in the modern day, not the 1980s of the original Vice City, with contemporary themes and technology.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-gray-900/50 p-4 md:p-5 rounded-lg border-l-4 border-gta-pink">
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gta-pink">Improved Online</h3>
                      <p className="text-gray-300 text-sm md:text-base">GTA Online is set to be bigger in scale, built for longevity, and more integrated with modern online gaming trends.</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 md:p-5 rounded-lg border-l-4 border-gta-blue">
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gta-blue">Largest Map Yet</h3>
                      <p className="text-gray-300 text-sm md:text-base">The biggest and most detailed open world in Rockstar history, with diverse environments from urban city to swamplands.</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 md:p-5 rounded-lg border-l-4 border-gta-pink">
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gta-pink">Fall 2025 Release</h3>
                      <p className="text-gray-300 text-sm md:text-base">Slated for release in Fall 2025 for PlayStation 5 and Xbox Series X|S, with a PC version likely to follow later.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center animate-fadeInUp">
                <Link href="/wiki" className="px-6 md:px-8 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white text-base md:text-lg font-bold rounded-md hover:shadow-lg hover:shadow-gta-blue/20 transition-all hover:-translate-y-1">
                  Explore Full Wiki
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trailer Section */}
        <section className="flex items-center relative py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 md:mb-12 text-center animate-fadeInUp">
              <span className="text-white">Official Trailer</span>
            </h2>
            
            <div className="max-w-4xl mx-auto animate-fadeInUp">
              <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-800 shadow-2xl bg-black">
                {!youtubeLoaded ? (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                    onClick={() => setYoutubeLoaded(true)}
                    aria-label="Load YouTube video: Grand Theft Auto VI Trailer 1"
                  >
                    {/* Thumbnail with play button overlay */}
                    <div className="relative w-full h-full">
                      <Image 
                        src="/images/gta6-0.png" 
                        alt="GTA 6 Trailer Thumbnail" 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 800px"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gta-pink/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 md:p-3 text-center">
                      <p className="text-white text-sm md:text-base">Click to play GTA VI Trailer 1</p>
                      <p className="text-xs text-gray-400">Video will load from YouTube</p>
                    </div>
                  </div>
                ) : (
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/QdBZY2fkU-0?autoplay=1" 
                    title="Grand Theft Auto VI Trailer 1" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                  ></iframe>
                )}
              </div>
              
              <div className="mt-6 md:mt-8 text-center text-gray-400 animate-fadeInUp">
                <p>Watch on <a href="https://www.youtube.com/watch?v=QdBZY2fkU-0" target="_blank" rel="noopener noreferrer" className="text-gta-pink hover:underline">YouTube</a> for highest quality</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Updates Section - Optimized for performance */}
        <section className="flex items-center relative py-12 md:py-20 content-visibility-auto">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 md:mb-12 text-center animate-fadeInUp">
              <span className="text-white">Latest Updates</span>
            </h2>
            
            {isLoadingArticles ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gta-blue"></div>
              </div>
            ) : latestArticles.length === 0 ? (
              <div className="text-center text-gray-400">
                <p>No articles found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto animate-fadeInUp">
                {latestArticles.map((article) => (
                  <div key={article.id} className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden group hover:border-gta-blue transition-colors">
                    <div className="h-40 sm:h-48 relative overflow-hidden">
                      {/* Background placeholder */}
                      <div className="absolute inset-0 bg-gray-800/80 animate-image-pulse"></div>
                      
                      {/* Actual image with loading transition */}
                      <Image 
                        src={getProcessedImageUrl(article.imageUrl)} 
                        alt={article.title} 
                        fill
                        className={`object-cover group-hover:scale-105 transition-all duration-300 ${
                          loadedImages[article.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        loading="lazy"
                        decoding="async"
                        onLoad={() => handleImageLoad(article.id)}
                        onError={(e) => {
                          // Fallback to default image if loading fails
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/gta6-1.png';
                          handleImageLoad(article.id);
                        }}
                      />
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="text-xs text-gray-400 mb-2">{formatDate(article.createdAt)}</div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 group-hover:text-gta-blue transition-colors">{article.title}</h3>
                      
                      <Link href={`/news/${article.slug}`} className="text-gta-blue hover:underline inline-flex items-center text-sm md:text-base">
                        Read More: {article.excerpt}
                        <span className="sr-only"> - Full article about {article.title}</span>
                        <svg className="w-3 h-3 md:w-4 md:h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 md:mt-12 text-center animate-fadeInUp">
              <Link href="/news" className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white text-base md:text-lg font-bold rounded-md hover:shadow-lg hover:shadow-gta-pink/20 transition-all hover:-translate-y-1">
                View All News
                <span className="sr-only">Browse complete archive of GTA 6 news and updates</span>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-12 md:py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-black/80 backdrop-blur-sm border border-gray-800 rounded-lg p-5 md:p-8 text-center relative overflow-hidden">
              <div className="absolute -inset-10 bg-gradient-to-r from-gta-pink/10 via-gta-blue/10 to-gta-green/10 blur-[50px] animate-pulse"></div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 relative text-white">
                Join The <span className="text-gta-pink">vice.city</span> Community
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8 relative">Stay updated with the latest news, share your theories, and connect with other fans.</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 relative">
                <Link href="/wiki" className="px-5 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 text-sm md:text-base">
                  Explore Wiki
                </Link>
                <Link href="/map" className="px-5 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 text-sm md:text-base">
                  Interactive Map
                </Link>
                <Link href="/news" className="px-5 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 text-sm md:text-base">
                  Latest News
                </Link>
              </div>
            </div>
            
            <div className="mt-8 md:mt-16 text-gray-400 text-xs md:text-sm text-center animate-fadeInUp">
              <p className="mt-2">This is a fan site and is not affiliated with Rockstar Games or Take-Two Interactive.</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Updated CSS animations for better performance */}
      <style jsx global>{`
        /* Content visibility improvements */
        article, section, footer {
          content-visibility: auto;
          contain-intrinsic-size: 1px 500px;
        }
        
        /* Use more GPU-accelerated properties */
        @keyframes fadeIn {
          from { opacity: 0; transform: translate3d(0, 20px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        
        /* Standard pulse animation - restored to original */
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        
        /* Specialized image loading pulse - more subtle */
        @keyframes imagePulse {
          0% { opacity: 0.7; }
          50% { opacity: 0.9; }
          100% { opacity: 0.7; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          will-change: opacity, transform;
        }
        
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
          will-change: opacity, transform;
        }
        
        /* Tiered animation delays using CSS classes instead of inline styles */
        .animate-fadeInUp-1 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.1s forwards;
          will-change: opacity, transform;
        }
        
        .animate-fadeInUp-2 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.2s forwards;
          will-change: opacity, transform;
        }
        
        .animate-fadeInUp-3 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.3s forwards;
          will-change: opacity, transform;
        }
        
        .animate-fadeInUp-4 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.4s forwards;
          will-change: opacity, transform;
        }
        
        .animate-fadeInUp-5 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.5s forwards;
          will-change: opacity, transform;
        }
        
        .animate-fadeInUp-6 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.6s forwards;
          will-change: opacity, transform;
        }
        
        /* Standard pulse animation - 8s duration */
        .animate-pulse {
          animation: pulse 8s infinite;
          will-change: opacity;
        }
        
        /* Optimize transition properties */
        .transition-opacity {
          transition-property: opacity;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity;
        }
        
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity, transform;
        }
        
        .duration-300 {
          transition-duration: 300ms;
        }
        
        .duration-1000 {
          transition-duration: 1000ms;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          body {
            overscroll-behavior: none;
            text-rendering: optimizeSpeed;
          }
          
          /* Improve touch targets */
          button, a {
            min-height: 44px;
          }
        }
        
        /* Reduce layout shifts */
        img, video {
          display: block;
          max-width: 100%;
        }
        
        /* Optimize rendering performance */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
        
        /* Regular blur for gradients */
        .blur-\[150px\] {
          filter: blur(150px);
        }
        
        /* Content visibility for offscreen sections */
        .content-visibility-auto {
          content-visibility: auto;
          contain-intrinsic-size: 1px 500px;
        }

        /* Specialized image loading pulse - more subtle */
        .animate-image-pulse {
          animation: imagePulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
} 