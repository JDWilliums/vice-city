'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// GTA 6 estimated release date (Fall 2025)
const RELEASE_DATE = new Date('2025-12-01T00:00:00');

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
  '/images/gta6-10.png',
  '/images/gta6-11.png',
  '/images/gta6-12.png',
  '/images/gta6-13.png',
  '/images/gta6-14.png',
  '/images/gta6-15.png',
  '/images/gta6-16.png',
  '/images/gta6-17.png',
  '/images/gta6-18.png',
  '/images/gta6-19.png',
  '/images/gta6-20.png',
];

export default function HomePage() {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  
  // Simplified image transition state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Update countdown
  useEffect(() => {
    const updateCountdown = () => {
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
      
      setDays(d);
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    };
    
    // Update immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simplified image transition logic
  useEffect(() => {
    let isMounted = true;
    
    // Function to cycle to the next image
    const cycleToNextImage = () => {
      if (!isMounted) return;
      
      // Start transition
      setIsTransitioning(true);
      
      // After 1.5 seconds (allowing for fade out), change the image
      setTimeout(() => {
        if (!isMounted) return;
        
        // Move to next image
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % GTA6_IMAGES.length);
        
        // End transition (which triggers fade in)
        setTimeout(() => {
          if (!isMounted) return;
          setIsTransitioning(false);
        }, 100); // Short delay to ensure the image has changed
      }, 1500);
    };
    
    // Start image rotation
    const interval = setInterval(cycleToNextImage, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar transparent={true} />
      
      {/* Background Images with simpler fade effect */}
      <div className="fixed inset-0 z-0">
        {GTA6_IMAGES.map((image, index) => (
          <div 
            key={image}
            className={`absolute inset-0 transition-opacity duration-1500 ${
              index === activeImageIndex ? (isTransitioning ? 'opacity-0' : 'opacity-100') : 'opacity-0'
            }`}
          >
            <Image 
              src={image}
              alt={`GTA 6 Background ${index + 1}`}
              fill
              className="object-cover object-center"
              priority={index === 0}
            />
          </div>
        ))}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        
        {/* Animated Gradients */}
        <div className="absolute inset-0 z-5 opacity-40">
          <div className="absolute top-0 -left-1/3 w-2/3 h-2/3 bg-gta-pink opacity-30 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 -right-1/3 w-2/3 h-2/3 bg-gta-blue opacity-30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
      
      <main className="relative z-20 pt-24">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center px-4 animate-fadeIn">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white">
              GTA VI Countdown
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Experience the next chapter in the Grand Theft Auto series. <br /> Return to Vice City, coming Fall 2025.
            </p>
            
            {/* Countdown Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-16">
              <div className="bg-black/60 backdrop-blur-sm border border-gta-blue/30 rounded-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl md:text-6xl font-bold text-white mb-1">{days}</div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">Days</div>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gta-pink/30 rounded-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="text-4xl md:text-6xl font-bold text-white mb-1">{hours}</div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">Hours</div>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gta-blue/30 rounded-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                <div className="text-4xl md:text-6xl font-bold text-white mb-1">{minutes}</div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">Minutes</div>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gta-pink/30 rounded-lg p-6 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                <div className="text-4xl md:text-6xl font-bold text-white mb-1">{seconds}</div>
                <div className="text-gray-400 uppercase tracking-wider text-sm">Seconds</div>
              </div>
            </div>
            
            {/* GTA 6 Logo */}
            <div className="relative flex justify-center mb-20 animate-fadeInUp" style={{ animationDelay: '1s' }}>
              <div className="absolute -inset-10 bg-gradient-to-r from-gta-pink to-gta-blue rounded-full blur-[150px] opacity-5 animate-pulse"></div>
              <Image 
                src="/images/gta6-logo.png" 
                alt="GTA 6 Logo" 
                width={600} 
                height={300} 
                className="w-full max-w-2xl h-auto relative"
                priority
              />
            </div>
            
            {/* Call to Action */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mb-16 animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
              <Link href="/home" className="px-8 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white text-lg font-bold rounded-md hover:shadow-lg hover:shadow-gta-pink/20 transition-all hover:-translate-y-1">
                Visit Home
              </Link>
              <Link href="/map" className="px-8 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white text-lg font-bold rounded-md hover:shadow-lg hover:shadow-gta-pink/20 transition-all hover:-translate-y-1">
                View the Map
              </Link>
            </div>
          </div>
        </div>

        {/* What We Know So Far Section */}
        <section className="flex items-center relative py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center animate-fadeInUp">
                <span className="text-white">What We Know <span className="text-gta-blue">So Far</span></span>
              </h2>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg p-8 mb-12 animate-fadeInUp">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-900/50 p-5 rounded-lg border-l-4 border-gta-blue">
                      <h3 className="text-xl font-bold mb-2 text-gta-blue">Dual Protagonists</h3>
                      <p className="text-gray-300">Play as both Lucia and Jason, the first female protagonist in the mainline series, in a Bonnie & Clyde inspired crime saga.</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-5 rounded-lg border-l-4 border-gta-pink">
                      <h3 className="text-xl font-bold mb-2 text-gta-pink">Vice City Returns</h3>
                      <p className="text-gray-300">Return to a reimagined Vice City and surrounding areas in the fictional state of Leonida, inspired by Miami and Florida.</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-5 rounded-lg border-l-4 border-gta-green">
                      <h3 className="text-xl font-bold mb-2 text-gta-green">Modern Setting</h3>
                      <p className="text-gray-300">Set in the modern day, not the 1980s of the original Vice City, with contemporary themes and technology.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-900/50 p-5 rounded-lg border-l-4 border-gta-yellow">
                      <h3 className="text-xl font-bold mb-2 text-gta-yellow">Enhanced Physics</h3>
                      <p className="text-gray-300">Improved physics system with more realistic vehicle handling, enhanced weather effects, and dynamic environmental interactions.</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-5 rounded-lg border-l-4 border-gta-blue">
                      <h3 className="text-xl font-bold mb-2 text-gta-blue">Largest Map Yet</h3>
                      <p className="text-gray-300">The biggest and most detailed open world in Rockstar history, with diverse environments from urban city to swamplands.</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-5 rounded-lg border-l-4 border-gta-pink">
                      <h3 className="text-xl font-bold mb-2 text-gta-pink">Fall 2025 Release</h3>
                      <p className="text-gray-300">Slated for release in Fall 2025 for PlayStation 5 and Xbox Series X|S, with a PC version likely to follow later.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center animate-fadeInUp">
                <Link href="/wiki" className="px-8 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white text-lg font-bold rounded-md hover:shadow-lg hover:shadow-gta-blue/20 transition-all hover:-translate-y-1">
                  Explore Full Wiki
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Trailer Section */}
        <section className="flex items-center relative py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center animate-fadeInUp">
              <span className="text-white">Official <span className="text-gta-pink">Trailer</span></span>
            </h2>
            
            <div className="max-w-4xl mx-auto animate-fadeInUp">
              <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-800 shadow-2xl bg-black">
                <iframe 
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/QdBZY2fkU-0" 
                  title="Grand Theft Auto VI Trailer 1" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                ></iframe>
              </div>
              
              <div className="mt-8 text-center text-gray-400 animate-fadeInUp">
                <p>Watch on <a href="https://www.youtube.com/watch?v=QdBZY2fkU-0" target="_blank" rel="noopener noreferrer" className="text-gta-pink hover:underline">YouTube</a> for highest quality</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Updates Section */}
        <section className="flex items-center relative py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center animate-fadeInUp">
              <span className="text-white">Latest <span className="text-gta-blue">Updates</span></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fadeInUp">
              <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden group hover:border-gta-blue transition-colors">
                <div className="h-48 relative overflow-hidden">
                  <Image 
                    src="/images/gta6-1.png" 
                    alt="GTA 6 Update" 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs text-gray-400 mb-2">March 15, 2024</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-gta-blue transition-colors">Rockstar Confirms Dual Protagonist System</h3>
                  <p className="text-gray-300 mb-4">New details emerge about the game's protagonists, Lucia and Jason, in this exciting update.</p>
                  <Link href="/news" className="text-gta-blue hover:underline inline-flex items-center">
                    Read More
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden group hover:border-gta-blue transition-colors">
                <div className="h-48 relative overflow-hidden">
                  <Image 
                    src="/images/gta6-2.png" 
                    alt="GTA 6 Update" 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs text-gray-400 mb-2">February 28, 2024</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-gta-blue transition-colors">Map Size Reportedly Largest in GTA History</h3>
                  <p className="text-gray-300 mb-4">Insiders claim the new Vice City map will be significantly larger than previous GTA worlds.</p>
                  <Link href="/news" className="text-gta-blue hover:underline inline-flex items-center">
                    Read More
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden group hover:border-gta-blue transition-colors">
                <div className="h-48 relative overflow-hidden">
                  <Image 
                    src="/images/gta6-3.png" 
                    alt="GTA 6 Update" 
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs text-gray-400 mb-2">January 19, 2024</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-gta-blue transition-colors">New Game Mechanics Revealed</h3>
                  <p className="text-gray-300 mb-4">Rockstar shares insights on new gameplay features including enhanced stealth and dynamic weather.</p>
                  <Link href="/news" className="text-gta-blue hover:underline inline-flex items-center">
                    Read More
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center animate-fadeInUp">
              <Link href="/news" className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white text-lg font-bold rounded-md hover:shadow-lg hover:shadow-gta-green/20 transition-all hover:-translate-y-1">
                View All News
              </Link>
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-black/80 backdrop-blur-sm border border-gray-800 rounded-lg p-8 text-center relative overflow-hidden">
              <div className="absolute -inset-10 bg-gradient-to-r from-gta-pink/10 via-gta-blue/10 to-gta-green/10 blur-[50px] animate-pulse"></div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 relative text-white">
                Join The <span className="text-gta-pink">vice.city</span> Community
              </h2>
              <p className="text-xl text-gray-300 mb-8 relative">Stay updated with the latest news, share your theories, and connect with other fans.</p>
              
              <div className="flex flex-col md:flex-row justify-center gap-4 relative">
                <Link href="/wiki" className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1">
                  Explore Wiki
                </Link>
                <Link href="/map" className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1">
                  Interactive Map
                </Link>
                <Link href="/news" className="px-6 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1">
                  Latest News
                </Link>
              </div>
            </div>
            
            <div className="mt-16 text-gray-400 text-sm text-center animate-fadeInUp">
              <p>Release date is estimated. Actual date may vary.</p>
              <p className="mt-2">This is a fan site and is not affiliated with Rockstar Games or Take-Two Interactive.</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Add the required CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 8s infinite;
        }
        
        .transition-opacity {
          transition-property: opacity;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .duration-1500 {
          transition-duration: 1500ms;
        }
      `}</style>
    </div>
  );
} 