'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Import components dynamically with no SSR because Leaflet needs window
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-map-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gta-pink border-solid mx-auto mb-4"></div>
        <p className="text-xl text-white">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // We need to set mapLoaded only once the component is mounted
    setMapLoaded(true);
    
    // Load Leaflet CSS dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-map-bg relative">
        {mapLoaded && <MapComponent />}
        
        {/* Work In Progress Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="transform rotate-[-30deg] bg-black bg-opacity-30 px-12 py-6 rounded-lg">
            <h1 className="text-5xl font-bold text-white opacity-30 border-4 border-white p-4 tracking-widest">
              🚧  UNDER CONSTRUCTION  🚧
            </h1>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 