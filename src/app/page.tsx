'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/gta6-background.jpg" 
              alt="GTA 6 Background" 
              fill
              priority
              className="object-cover object-center"
              quality={100}
            />
          </div>
          
          {/* Background overlay - gradient for more GTA-style look */}
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-dark-bg z-10"></div>
          
          {/* Animated colored overlay for GTA aesthetic - made more circular and smoother */}
          <div className="absolute inset-0 opacity-25 z-5">
            <div className="absolute top-0 -left-1/3 w-2/3 h-2/3 bg-gta-pink opacity-50 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 -right-1/3 w-2/3 h-2/3 bg-gta-blue opacity-50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Hero content */}
          <div className="container-custom relative z-20 text-center">
            <div className="flex justify-center mb-6 animate-fadeIn">
              <div className="relative group p-8">
                {/* Significantly larger and blurrier glow behind the logo */}
                <div className="absolute -inset-10 bg-gradient-to-r from-gta-pink to-gta-blue rounded-full blur-[80px] opacity-40 group-hover:opacity-70 transition duration-1000 animate-pulse"></div>
                <Image 
                  src="/logo-wp.png" 
                  alt="GTA 6 Map & Wiki" 
                  width={500} 
                  height={500} 
                  className="w-auto max-w-full h-auto relative" 
                  priority
                />
              </div>
            </div>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-100 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              Your ultimate destination for everything about Grand Theft Auto VI - interactive map, locations, missions, characters and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
              <Link href="/map" className="bg-gradient-to-r from-gta-blue to-blue-700 hover:from-blue-600 hover:to-gta-blue text-lg px-8 py-4 rounded-full text-white font-bold shadow-lg hover:shadow-gta-blue/50 transition-all transform hover:-translate-y-1">
                Explore the Map
              </Link>
              <Link href="/wiki" className="bg-gradient-to-r from-gta-pink to-pink-700 hover:from-pink-600 hover:to-gta-pink text-lg px-8 py-4 rounded-full text-white font-bold shadow-lg hover:shadow-gta-pink/50 transition-all transform hover:-translate-y-1">
                Browse the Wiki
              </Link>
            </div>
          </div>
        </div>

        {/* Features section with GTA-style design */}
        <section className="py-20 bg-gradient-to-b from-dark-bg to-gray-900 relative overflow-hidden">
          {/* Add smoother background glow elements */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gta-blue opacity-5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-gta-pink opacity-5 rounded-full blur-[150px]"></div>
          
          <div className="container-custom relative z-10">
            <h2 className="text-4xl font-bold text-center mb-12 relative inline-block mx-auto">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gta-blue via-gta-pink to-gta-green animate-gradient">
                Everything You Need to Know About GTA VI
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card backdrop-blur-sm bg-gray-800/80 hover:bg-gray-800/90 border border-gray-700 hover:border-gta-blue transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-gta-blue/20">
                <div className="mb-6 text-gta-blue text-4xl flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center shadow-inner">🗺️</div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-center text-white">Interactive Map</h3>
                <p className="text-gray-300">
                  Explore Leonida and Vice City with our detailed interactive map featuring all collectibles, missions, and points of interest.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="card backdrop-blur-sm bg-gray-800/80 hover:bg-gray-800/90 border border-gray-700 hover:border-gta-pink transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-gta-pink/20">
                <div className="mb-6 text-gta-pink text-4xl flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-pink-900/30 flex items-center justify-center shadow-inner">📚</div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-center text-white">Comprehensive Wiki</h3>
                <p className="text-gray-300">
                  Detailed information about characters, missions, vehicles, weapons, and everything else in GTA VI.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="card backdrop-blur-sm bg-gray-800/80 hover:bg-gray-800/90 border border-gray-700 hover:border-gta-green transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-gta-green/20">
                <div className="mb-6 text-gta-green text-4xl flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center shadow-inner">👥</div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-center text-white">Community Driven</h3>
                <p className="text-gray-300">
                  Join our community to contribute to the wiki, share discoveries, and connect with other GTA fans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest updates/news section */}
        <section className="py-16 bg-gradient-to-b from-gray-900 to-dark-bg">
          <div className="container-custom relative">
            {/* Decorative elements */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gta-blue/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gta-pink/5 rounded-full blur-3xl"></div>
            
            <h2 className="text-4xl font-bold mb-12 text-center text-white relative z-10">
              Latest Updates
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* This would be dynamically generated in a real app */}
              {[1, 2, 3].map((i) => (
                <article key={i} className="card bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm overflow-hidden border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-xl">
                  <div className="aspect-video bg-gray-700 mb-4 relative overflow-hidden group">
                    {/* Placeholder for news image with hover effect */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-800 to-gray-900 group-hover:scale-105 transition-transform duration-500">
                      News Image {i}
                    </div>
                    <div className="absolute top-0 right-0 bg-gta-pink/80 text-white text-xs px-2 py-1">
                      NEW
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white hover:text-gta-blue transition-colors">GTA VI News Update {i}</h3>
                  <p className="text-gray-300 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.</p>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>March 9, 2023</span>
                    <span className="px-2 py-1 bg-gray-700/50 rounded-full text-xs">Category</span>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/news" className="inline-block px-6 py-3 border border-gta-pink text-gta-pink hover:bg-gta-pink hover:text-white transition-all duration-300 rounded-md">
                View All News
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Add global animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeIn 1s ease-out forwards,
                     fadeInUp 1s ease-out forwards;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </>
  );
} 